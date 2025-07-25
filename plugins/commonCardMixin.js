import steem from 'steem'
import hive from '@hiveio/hive-js'

export const commonCardMixin = {
  data () {
    return {
      afitReward: '',
      userRank: '',
      fullAFITReward: '',
      cur_bchain: 'HIVE',
      profImgUrl: process.env.hiveImgUrl,
      socialSharingTitle: process.env.socialSharingTitle,
      socialSharingDesc: process.env.socialSharingDesc,
      socialSharingQuote: process.env.socialSharingQuote,
      hashtags: process.env.socialSharingHashtags,
      isTooltipVisible: false,
      imageError: false,
      // 'stableImages' will hold the final, non-reactive list of raw image URLs.
      stableImages: [],
      // 'displayImages' will hold the final, resized URLs for the template.
      displayImages: [],
      currentImageIndex: 0,
      imageLoading: false,
      cardWidth: 0,
      imageLoadFailed: false,
      intersectionObserver: null,
      resizeObserver: null,
      isInitialized: false
    }
  },
  computed: {
    cardData () {
      return {}
    },
    meta () {
      try {
        const metadata = this.cardData ? this.cardData.json_metadata : {}
        if (typeof metadata === 'string') return JSON.parse(metadata)
        return metadata || {}
      } catch (err) {
        return {}
      }
    },
    bodySnippet () {
      if (!this.cardData || !this.cardData.body) return ''
      let postContent = this.$cleanBody(this.cardData.body, true)
      postContent = this.truncateString(postContent)
      return postContent.replace(/<[^>]+>/g, '')
    },
    getVoteCount () {
      return (this.cardData && Array.isArray(this.cardData.active_votes)) ? this.cardData.active_votes.length : 0
    },
    isUserModerator () {
      return this.user && this.$store.getters.moderators.find(mod => mod.name === this.user.account.name && mod.title === 'moderator')
    },
    currentImageSrc () {
      if (this.displayImages.length > 0) {
        return this.displayImages[this.currentImageIndex]
      }
      return ''
    },
    originalCurrentImageSrc () {
      // The original non-resized URL for error fallback
      if (this.stableImages.length > this.currentImageIndex) {
        return this.stableImages[this.currentImageIndex]
      }
      return ''
    },
    postUpvoted () {
      if (!this.user || !this.cardData || !Array.isArray(this.cardData.active_votes)) return false
      const curUser = this.user.account.name
      const hasVoted = this.cardData.active_votes.some(voter => voter.voter === curUser)
      const newlyVoted = this.$store.getters.newlyVotedPosts.includes(this.cardData.post_id)
      return hasVoted || newlyVoted
    }
  },
  watch: {
    // This is now the main entry point. It triggers ONCE when data arrives.
    cardData: {
      handler(newVal) {
        if (newVal && newVal.permlink && !this.isInitialized) {
          this.initializeCard()
        }
      },
      deep: true,
      immediate: true
    },
    // This watcher is now safe because it will not affect the image list.
    getVoteCount (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updatePostData()
      }
    }
  },
  mounted () {
    // Fallback initializer in case cardData is already present on mount.
    this.initializeCard();
  },
  beforeDestroy () {
    if (this.intersectionObserver) this.intersectionObserver.disconnect()
    if (this.resizeObserver) this.resizeObserver.disconnect()
  },
  methods: {
    initializeCard () {
      if (this.isInitialized || !this.cardData || !this.cardData.permlink) return;
      this.isInitialized = true
      
      this.fetchApiData() // Non-critical data
      
      // Calculate and "freeze" the image list immediately.
      this.stableImages = this.calculatePostImages()

      // If we have images, start the process to display them.
      if (this.stableImages.length > 0) {
        this.$nextTick(() => {
          if (!this.$el) return;
          this.intersectionObserver = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                this.intersectionObserver.disconnect();
                this.observeSize();
              }
            }, { rootMargin: '200px' }
          );
          this.intersectionObserver.observe(this.$el);
        });
      }
    },
    // This method contains your correct filtering logic and is only called ONCE.
    calculatePostImages () {
      let allFoundImages = []
      const metaImages = this.meta.image
      if (Array.isArray(metaImages)) { allFoundImages.push(...metaImages) } else if (metaImages) { allFoundImages.push(metaImages) }
      if (this.cardData.body) {
        const imageRegex = /!\[.*?\]\((.*?)\)|<img.*?src=["'](.*?)["']/g
        let match
        while ((match = imageRegex.exec(this.cardData.body)) !== null) {
          const url = match[1] || match[2]
          if (url && typeof url === 'string') { allFoundImages.push(url) }
        }
      }
      allFoundImages = [...new Set(allFoundImages)].filter(url => url && url.startsWith('http'));
      const trustedHosts = /(images\.hive\.blog|files\.peakd\.com|images\.ecency\.com|cdn\.liketu\.com|ipfs-3speak\.b-cdn\.net|img\.leopedia\.io|pixabay\.com)/i
      const whitelistedImages = allFoundImages.filter(url => trustedHosts.test(url))
      if (whitelistedImages.length > 0) { return whitelistedImages }
      const junkKeywords = /usermedia\.actifit\.io|actifit|chart|banner|measurements|report|tracker|fitness\sreport|rewarding\sactivity/i
      const brandingHashes = /DQmNp6YwAm2qwquALZw8PdcovDorwaBSFuxQ38TrYziGT6b|DQmY67NW9SgDEsLo2nsAw4nYcddrTjp4aHNLyogKvGuVMMH|DQmW1VsUNbEjTUKawau4KJQ6agf41p69teEvdGAj1TMXmuc/i
      return allFoundImages.filter(url => !junkKeywords.test(url) && !brandingHashes.test(url));
    },
    observeSize() {
      this.resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (entry && entry.contentRect.width > 0) {
              this.cardWidth = Math.round(entry.contentRect.width);
              this.resizeObserver.disconnect();
              this.setupDisplayImages();
          }
      });
      this.resizeObserver.observe(this.$el);
    },
    // This is the final step that prepares the images for the template.
    setupDisplayImages () {
      if (this.cardWidth > 0 && this.stableImages.length > 0) {
        this.imageLoading = true;
        this.imageLoadFailed = false;
        
        // Populate the final display array with resized URLs.
        this.displayImages = this.stableImages.map(url => this.getResizedImageUrl(url, this.cardWidth));
        this.currentImageIndex = 0;
      }
    },
    onImageLoad () {
      this.imageLoading = false
    },
    onImageError (event) {
      const originalSrc = this.originalCurrentImageSrc
      if (originalSrc && event.target.src !== originalSrc) {
        event.target.src = originalSrc
      } else {
        this.imageLoading = false
        this.imageLoadFailed = true
      }
    },
    getResizedImageUrl (url, width) {
      if (typeof url !== 'string' || !url.startsWith('http') || /\.gif$/i.test(url)) return url
      const resizeProxy = `https://images.hive.blog/${Math.round(width)}x0/`
      return resizeProxy + url
    },
    fetchApiData() {
      steem.api.setOptions({ url: process.env.steemApiNode })
      hive.api.setOptions({ url: process.env.hiveApiNode })
      if (this.cardData && this.cardData.author) {
        fetch(`${process.env.actiAppUrl}getPostReward?user=${this.cardData.author}&url=${this.cardData.url}`).then(res => res.json()).then(json => { this.afitReward = json.token_count }).catch(e => {})
        fetch(`${process.env.actiAppUrl}getRank/${this.cardData.author}`).then(res => res.json()).then(json => { this.userRank = json }).catch(e => {})
      }
      this.$store.dispatch('fetchModerators')
      this.cur_bchain = localStorage.getItem('cur_bchain') || 'HIVE'
      this.profImgUrl = this.cur_bchain === 'STEEM' ? process.env.steemImgUrl : process.env.hiveImgUrl
    },
    nextImage () {
      if (this.displayImages.length > 1) {
        this.imageLoading = true
        this.currentImageIndex = (this.currentImageIndex + 1) % this.displayImages.length
      }
    },
    prevImage () {
      if (this.displayImages.length > 1) {
        this.imageLoading = true
        this.currentImageIndex = (this.currentImageIndex - 1 + this.displayImages.length) % this.displayImages.length
      }
    },
    goToImage (index) {
      if (this.currentImageIndex !== index) {
        this.imageLoading = true
        this.currentImageIndex = index
      }
    },
    postPaid () {
      if (!this.cardData) return false
      if (this.cardData.is_paidout) return true
      const lastPayout = new Date(this.cardData.last_payout)
      const cashoutTime = new Date(this.cardData.cashout_time)
      return lastPayout.getTime() > cashoutTime.getTime()
    },
    showTooltip () { this.isTooltipVisible = true },
    hideTooltip () { this.isTooltipVisible = false },
    toggleTooltip () { this.isTooltipVisible = !this.isTooltipVisible },
    renderSnippet (content, length = 150) {
      if (!content) return ''
      let postContent = this.$cleanBody(content, true)
      postContent = this.truncateString(postContent, length)
      return postContent.replace(/<[^>]+>/g, '')
    },
    hasBeneficiaries () {
      return this.cardData && Array.isArray(this.cardData.beneficiaries) && this.cardData.beneficiaries.length > 0
    },
    beneficiariesDisplay () {
      if (!this.hasBeneficiaries()) return ''
      let output = 'Beneficiaries:\n'
      for (const bene of this.cardData.beneficiaries) {
        output += `${bene.account}: ${bene.weight / 100}%\n`
      }
      return output
    },
    paidValue () {
      if (!this.cardData) return ''
      return this.cardData.total_payout_value || this.cardData.author_payout_value || ''
    },
    truncateString (str, len = 150) {
      if (!str || typeof str !== 'string') return ''
      if (str.length > len) {
        return str.substring(0, len - 3) + '...'
      }
      return str
    },
    votePrompt (e) {
      this.$store.commit('setPostToVote', this.cardData)
    },
    setProperNode () {
      return this.cur_bchain === 'STEEM' ? steem : hive
    },
    // This update is now safe and will not cause flickering.
    async updatePostData () {
      if (!this.cardData || !this.cardData.author || !this.cardData.permlink) return;
      const chainLnk = await this.setProperNode()
      chainLnk.api.getContent(this.cardData.author, this.cardData.permlink, (err, result) => {
        if (result && this.cardData) {
            this.cardData.total_payout_value = result.total_payout_value;
            this.cardData.pending_payout_value = result.pending_payout_value;
        }
      })
    }
  }
}