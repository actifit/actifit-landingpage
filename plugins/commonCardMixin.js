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
      allImages: [],
      currentImageIndex: 0,
      imageLoading: true,
      cardWidth: 0,
      debounceTimer: null,
      imageGeneration: 0,
      imageLoadFailed: false,
      resizeObserver: null
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
    postImages () {
      if (!this.cardData) return []
      let allFoundImages = []
      const metaImages = this.meta.image
      if (Array.isArray(metaImages)) { allFoundImages.push(...metaImages) } else if (metaImages) { allFoundImages.push(metaImages) }
      if (this.cardData.body) {
        const imageRegex = /!\[.*?\]\((.*?)\)|<img.*?src=["'](.*?)["']/g
        let match;
        while ((match = imageRegex.exec(this.cardData.body)) !== null) {
          const url = match[1] || match[2]
          if (url && typeof url === 'string') { allFoundImages.push(url) }
        }
      }
      const repairedImages = allFoundImages.map(url => {
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http')) return url;
        if (url.startsWith('//')) return 'https:' + url;
        if (url.startsWith('/')) return null;
        return 'https://' + url;
      }).filter(url => url !== null);
      const uniqueImages = [...new Set(repairedImages)];
      const junkUrlPatterns = [ /usermedia\.actifit\.io/i, /actifit-banner\.png/i ];
      return uniqueImages.filter(url => !junkUrlPatterns.some(pattern => pattern.test(url)));
    },
    getVoteCount () {
      return (this.cardData && Array.isArray(this.cardData.active_votes)) ? this.cardData.active_votes.length : 0
    },
    isUserModerator () {
      return !!(this.user && this.$store.getters.moderators.find(mod => mod.name === this.user.account.name && mod.title === 'moderator'))
    },
    currentImageSrc () {
      if (this.allImages.length > 0) {
        return this.allImages[this.currentImageIndex]
      }
      return this.$fetchPostImage(this.meta)
    },
    originalCurrentImageSrc () {
      const images = this.postImages;
      if (images.length > this.currentImageIndex) {
        return images[this.currentImageIndex]
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
    'cardData.permlink' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.cardWidth = 0
        this.updateAndResizeImages()
      }
    },
    getVoteCount (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updatePostData()
      }
    }
  },
  beforeDestroy () {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    clearTimeout(this.debounceTimer)
  },
  methods: {
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
    getResizedImageUrl (url, width = 400) {
      if (typeof url !== 'string' || !url.startsWith('http') || /\.gif$/i.test(url)) {
        return url
      }
      const effectiveWidth = Math.round(width)
      if (effectiveWidth <= 0) return url;
      const resizeProxy = `https://images.hive.blog/${effectiveWidth}x0/`
      return resizeProxy + url
    },
    setupImages (width) {
      if (width <= 0) return
      const uniqueImages = this.postImages
      if (uniqueImages.length === 0) {
        this.allImages = []
        this.imageLoading = false
        return
      }
      const processedImages = uniqueImages.map(url => this.getResizedImageUrl(url, width))
      this.allImages = processedImages
      this.currentImageIndex = 0
      if (this.allImages.length === 0) {
        this.imageLoading = false
      }
    },
    updateAndResizeImages () {
      if (!this.$el || !this.cardData || !this.cardData.json_metadata) {
        return
      }
      const newWidth = Math.round(this.$el.offsetWidth)
      if (newWidth > 0 && newWidth !== this.cardWidth) {
        this.cardWidth = newWidth
        this.imageGeneration++
        this.imageLoading = true
        this.imageLoadFailed = false
        this.setupImages(this.cardWidth)
      }
    },
    debouncedResizeHandler () {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.updateAndResizeImages()
      }, 250)
    },
    
    /*
     * vvv THIS METHOD CONTAINS THE MINIMAL FIX vvv
     */
    async initializeCard () {
      await this.$nextTick()
      this.imageLoadFailed = false
      this.imageError = false
      this.resizeObserver = new ResizeObserver(this.debouncedResizeHandler)
      this.resizeObserver.observe(this.$el)
      
      // THE FIX: We REMOVE the immediate call to `updateAndResizeImages()`
      // this.updateAndResizeImages() // <-- THIS LINE IS DELETED.
      // We now rely *only* on the ResizeObserver to trigger the first image setup,
      // which it will do automatically once the card has a real width.

      // The rest of the method is identical to your original code
      steem.api.setOptions({ url: process.env.steemApiNode })
      hive.api.setOptions({ url: process.env.hiveApiNode })
      if (this.cardData && this.cardData.author) {
        fetch(`${process.env.actiAppUrl}getPostReward?user=${this.cardData.author}&url=${this.cardData.url}`)
          .then(res => res.json())
          .then(json => { this.afitReward = json.token_count })
          .catch(e => console.error('Error fetching post reward:', e))
        fetch(`${process.env.actiAppUrl}getRank/${this.cardData.author}`)
          .then(res => res.json())
          .then(json => { this.userRank = json })
          .catch(e => console.error('Error fetching user rank:', e))
      }
      this.$store.dispatch('fetchModerators')
      this.cur_bchain = localStorage.getItem('cur_bchain') || 'HIVE'
      this.profImgUrl = this.cur_bchain === 'STEEM' ? process.env.steemImgUrl : process.env.hiveImgUrl
    },

    // All other methods are preserved exactly
    nextImage () {
      if (this.allImages.length > 1) {
        this.imageLoading = true
        this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length
      }
    },
    prevImage () {
      if (this.allImages.length > 1) {
        this.imageLoading = true
        this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length
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
      return postContent.replace(/<[^>]+>/g, '');
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