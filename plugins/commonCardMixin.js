import steem from 'steem'
import hive from '@hiveio/hive-js'

export const commonCardMixin = {
  data () {
    return {
      afitReward: '',
      userRank: '',
      fullAFITReward: '',
      postUpvoted: false,
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
      resizeObserver: null,
      initialImageSetupComplete: false
    }
  },
  computed: {
    cardData () {
      // Placeholder, must be overridden by component
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
      // This uses the robust method from the parent's context
      const cleaned = this.$cleanBody(this.cardData.body, true)
      return this.truncateString(cleaned, 150)
    },
    // --- THIS IS THE CORRECT, FEATURE-COMPLETE REUSABLE PROPERTY ---
    // It now contains all the original filtering logic.
    postImages () {
      if (!this.cardData || !this.cardData.json_metadata) return []

      const metaImages = this.meta.image
      let initialImages = []
      if (Array.isArray(metaImages)) {
        initialImages = metaImages
      } else if (metaImages) {
        initialImages = [metaImages]
      }

      if (initialImages.length === 0) return []

      const brandingImagesRegex = /DQmNp6YwAm2qwquALZw8PdcovDorwaBSFuxQ38TrYziGT6b|DQmY67NW9SgDEsLo2nsAw4nYcddrTjp4aHNLyogKvGuVMMH|DQmW1VsUNbEjTUKawau4KJQ6agf41p69teEvdGAj1TMXmuc|DQmXv9QWiAYiLCSr3sKxVzUJVrgin3ZZWM2CExEo3fd5GUS|DQmdnh1nApZieHZ3s1fEhCALDjnzytFwo78zbAY5CLUMpoG|DQmZ6ZT8VaEpaDzB16qZzK8omffbWUpEpe4BkJkMXmN3xrF|DQmRgAoqi4vUVymaro8hXdRraNX6LHkXhMRBZxEo5vVWXDN|5CEvyaWxjaErqc3i7tYRQutZDwQPeZ8E6Ha3BenkA3Uc6fhKSLZ62PuSojTnM4kkLrYUdChBgBHoPxiDt|23tm6o6cmgwSRVABZSPxMC77Sfa2VNsaTtHWsjEpV1hWdQSe2s4FxvCyifsbKyESxfiPu|DQmUVjgmJHvtbYB2APdxqNxxkZeJ2KvPeXEE7v3BpxGJkbR|23tkbEYQioWnn3mfu8tWBh3x8n1Wz8TM9nH6SPRoghyZ46q2NNzt3aFsds2c8SjoknXRM|DQmdvc788wxsBSQHY3z21o3wSTU7hqRnyYc2JFEn2pEYSev|DQmeWzNEfmAnX91Ze89zqQU3B2uS58sn6dc2A6L74xLfAvr|DQmXi8aWqhnxa466MiBEhhTTCHeehoMuGrohtNG7et92Ne|DQmUtuWaSFoo8AtWd9fo4Tb7AEGhLo8rRrjqKPHHz2o7Mup|DQmcngR7AdBJio52C5stkD5C7vgsQ1yDH57Lb4J96Pys4a9|DQmRDW8jdYmE37tXvM6xPxuNnzNQnUJWSDnxVYyRJEHyc9H|DQmdNAWWwv6MAJjiNUWRahmAqbFBPxrX8WLQvoKyVHHqih1|DQmPKUZ5uZpL3Uq6LUUQXgNaaqsyX7ADpNyF4wHeTScs3xD|DQmeG5Bv1gKu2rQFWA1hH3QxzLzgzDPhDwieEEpy4WPnqN4|DQmPscjCVBggXvJT2GaUp66vbtyxzdzyHuhnzc38WDp4Smg|DQmV7NRosGCmNLsyHGzmh4Vr1pQJuBPEy2rk3WvnEUDxDFA|DQmY5UUP99u5ob3D8MA9JJW23zXLjHXHSRofSH3jLGEG1Yr|DQmQqfpSmcQtfrHAtzfBtVccXwUL9vKNgZJ2j93m8WNjizw|DQmbWy8KzKT1UvCvznUTaFPw6wBUcyLtBT5XL9wdbB7Hfmn|DQmV2hBheBVo9QWTXCxvqRqe4Fsg6kFTGggsTNGga9gTUHm|23w3F6U3PgtaT14tL5ewc1FoCwJcebdmZ3nrj2H6x2cTf4RzKWuicnQqvJGQ8tZxqX4Q5|ACTIVITYDQmeG5Bv1gKu2rQFWA1hH3QxzLzgzDPhDwieEEpy4WPnqN4|23yJg2hJAuEDUwg82kS1eC3EQqkVDzPEEyPa4rwymVHoz5mKPanjmshFa5s6tcPe3SP9c|DQmQJeGKQVsYFDFnHxgTHyNdrZxQmjLSJxz1wLB5HJDaZV3|DQmYfJ7SsTGpkR6gWoyLzo4pGrxnFopkcKzRVjgE6NRRXQL|DQmRoHaVPUiTagwviNmie8Ub5j4ZW1VcJGycZebmiH8ZdH5|AJpkUkMYpoVBmYDWsVtg7vaddiSqbMufvdoJ6w3FbzbvNTbkC6fgma1R8b47CMn|AJbhBb9Ev3i1cHKtjoxtsCAaXK9njP56dzMwBRwfZVZ21WseKsCa6ZkfAbLGnbh|AJmthV3QiiU3f2pVE2wEzBrLJp6AYgFwbB9WWqWFhA7ta3ejN2BcFkpbhTLDCQb/i;

      const userImages = initialImages.filter(url => {
        if (typeof url !== 'string') return false
        // Restore branding image filter
        if (brandingImagesRegex.test(url)) return false
        // Restore file type and trusted host filter
        const isStandardImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(url.split('?')[0]);
        const isFromTrustedHost = /usermedia\.actifit\.io|images\.hive\.blog|cdn\.liketu\.com|pixabay\.com|files\.peakd\.com|images\.d\.buzz|img\.leopedia\.io|images\.ecency\.com|ipfs-3speak\.b-cdn\.net/.test(url);
        return isFromTrustedHost || isStandardImageFile;
      })

      // Return the unique, fully-filtered list
      return [...new Set(userImages)]
    },
    getVoteCount () {
      return Array.isArray(this.cardData.active_votes) ? this.cardData.active_votes.length : 0
    },
    isUserModerator () {
      if (this.user && this.$store.getters.moderators.find(mod => mod.name === this.user.account.name && mod.title === 'moderator')) {
        return true
      }
      return false
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
    bodySnippet () {
      if (!this.cardData || !this.cardData.body) return ''
      // This uses the robust method from the parent's context
      const cleaned = this.$cleanBody(this.cardData.body, true)
      return this.truncateString(cleaned, 150)
    }
  },
  watch: {
    'cardData.permlink' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.initialImageSetupComplete = false
        this.attemptInitialImageSetup()
      }
    },
    postUpvoted: 'updatePostData'
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

      const processedImages = uniqueImages.map(url => {
        if (url.includes('pixabay.com') || url.includes('leopedia.io')) {
          return url
        }
        return this.getResizedImageUrl(url, width)
      })
      this.allImages = processedImages
      this.currentImageIndex = 0

      if (this.allImages.length === 0) {
        this.imageLoading = false
      }
    },
    debouncedResizeHandler () {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (this.$el) {
          const newWidth = Math.round(this.$el.offsetWidth);
          if (newWidth > 0 && newWidth !== this.cardWidth) {
            this.cardWidth = newWidth;
            this.imageGeneration++;
            this.imageLoading = true;
            this.setupImages(this.cardWidth);
          }
        }
      }, 250);
    },
    attemptInitialImageSetup () {
      if (this.initialImageSetupComplete || !this.$el || !this.cardData || !this.cardData.json_metadata) {
        return;
      }
      
      const newWidth = Math.round(this.$el.offsetWidth);

      if (newWidth > 0) {
        this.cardWidth = newWidth;
        this.imageLoading = true;
        this.setupImages(this.cardWidth);
        this.initialImageSetupComplete = true;
      }
    },
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
      return Array.isArray(this.cardData.beneficiaries) && this.cardData.beneficiaries.length > 0
    },
    beneficiariesDisplay () {
      let output = 'Beneficiaries:\n'
      for (const bene of this.cardData.beneficiaries) {
        output += `${bene.account}: ${bene.weight / 100}%\n`
      }
      return output
    },
    paidValue () {
      return this.cardData.total_payout_value || this.cardData.author_payout_value || ''
    },
    truncateString (str, len = 70) {
      if (!str || typeof str !== 'string') return ''
      if (str.length > len) {
        return str.substring(0, len - 3) + '...'
      }
      return str
    },
    userVotedThisPost () {
      if (!this.user) return false
      const curUser = this.user.account.name
      const hasVoted = this.cardData.active_votes.some(voter => voter.voter === curUser)
      const newlyVoted = this.$store.getters.newlyVotedPosts.includes(this.cardData.post_id)
      this.postUpvoted = hasVoted || newlyVoted
      return this.postUpvoted
    },
    
    // START: MODIFIED METHOD
    votePrompt (e) {
      // Check if the post has already been paid out.
      if (this.postPaid()) {
        // If it is paid out, show a confirmation dialog using the i18n translation.
        // The confirm() function returns `true` for "OK" and `false` for "Cancel".
        const userConfirmed = confirm(this.$t('paid_out_vote_confirm'));
        
        // If the user clicks "Cancel", stop the function from proceeding.
        if (!userConfirmed) {
          return;
        }
      }
      
      // If the post is not paid out, or if the user confirmed the vote on a paid-out post,
      // commit the post to the Vuex store to open the vote modal.
      this.$store.commit('setPostToVote', this.cardData)
    },
    // END: MODIFIED METHOD

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
    },
    async initializeCard () {
      await this.$nextTick();
      this.imageLoadFailed = false;
      this.imageError = false;
      this.resizeObserver = new ResizeObserver(() => {
        this.attemptInitialImageSetup();
        this.debouncedResizeHandler();
      });
      this.resizeObserver.observe(this.$el);
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
    }
  }
}