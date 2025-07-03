// plugins/commonCardMixin.js

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
      // --- New flag to ensure resize listener is only added once ---
      resizeListenerAdded: false,
      imageGeneration: 0,
      imageLoadFailed: false
    }
  },
  computed: {
    cardData () {
      // Placeholder, must be overridden by component
      return {}
    },
    meta () {
      try {
        const metadata = this.cardData.json_metadata;
        if (typeof metadata === 'string') return JSON.parse(metadata);
        return metadata || {};
      } catch (err) {
        return {}
      }
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
    }
  },
  watch: {
    postUpvoted: 'updatePostData'
  },
  // --- REMOVED mounted() hook from here. Logic is moved to initializeCard() ---

  beforeDestroy () {
    // Clean up the event listener to prevent memory leaks
    if (this.resizeListenerAdded) {
      window.removeEventListener('resize', this.debouncedResizeHandler)
    }
    clearTimeout(this.debounceTimer)
  },
  methods: {
    onImageLoad () {
      this.imageLoading = false
    },
    onImageError (event) {
      // On error, stop the loader and set the flag to hide the image container.
      this.imageLoading = false;
      this.imageLoadFailed = true;
    },
    getResizedImageUrl (url, width = 400) {
      if (typeof url !== 'string' || !url.startsWith('http') || /\.gif$/i.test(url)) {
        return url
      }
      const trustedHosts = ['images.hive.blog', 'usermedia.actifit.io', 'cdn.liketu.com', 'files.peakd.com', 'images.ecency.com', 'images.d.buzz', 'img.leopedia.io'];
      try {
        const hostname = new URL(url).hostname;
        if (trustedHosts.some(trustedHost => hostname.endsWith(trustedHost))) {
          return url;
        }
      } catch (e) {
        return url;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const effectiveWidth = Math.round(width * dpr);
      const resizeProxy = `https://images.hive.blog/${effectiveWidth}x0/`
      return resizeProxy + url
    },
    setupImages (width) {
      // This function relies on `this.meta`, which in turn relies on `this.cardData`.
      // It's crucial that `cardData` is available when this is called.
      if (!this.cardData || !this.cardData.json_metadata) {
          this.allImages = [];
          this.imageLoading = false;
          return;
      }
      const metaImages = this.meta.image
      let initialImages = []
      if (Array.isArray(metaImages)) {
        initialImages = metaImages
      } else if (metaImages) {
        initialImages = [metaImages]
      }

      if (initialImages.length === 0) {
        this.allImages = []
        this.imageLoading = false
        return
      }

      const brandingImagesRegex = /DQmNp6YwAm2qwquALZw8PdcovDorwaBSFuxQ38TrYziGT6b|DQmY67NW9SgDEsLo2nsAw4nYcddrTjp4aHNLyogKvGuVMMH|DQmW1VsUNbEjTUKawau4KJQ6agf41p69teEvdGAj1TMXmuc|DQmXv9QWiAYiLCSr3sKxVzUJVrgin3ZZWM2CExEo3fd5GUS|DQmdnh1nApZieHZ3s1fEhCALDjnzytFwo78zbAY5CLUMpoG|DQmZ6ZT8VaEpaDzB16qZzK8omffbWUpEpe4BkJkMXmN3xrF|DQmRgAoqi4vUVymaro8hXdRraNX6LHkXhMRBZxEo5vVWXDN|5CEvyaWxjaErqc3i7tYRQutZDwQPeZ8E6Ha3BenkA3Uc6fhKSLZ62PuSojTnM4kkLrYUdChBgBHoPxiDt|23tm6o6cmgwSRVABZSPxMC77Sfa2VNsaTtHWsjEpV1hWdQSe2s4FxvCyifsbKyESxfiPu|DQmUVjgmJHvtbYB2APdxqNxxkZeJ2KvPeXEE7v3BpxGJkbR|23tkbEYQioWnn3mfu8tWBh3x8n1Wz8TM9nH6SPRoghyZ46q2NNzt3aFsds2c8SjoknXRM|DQmdvc788wxsBSQHY3z21o3wSTU7hqRnyYc2JFEn2pEYSev|DQmeWzNEfmAnX91Ze89zqQU3B2uS58sn6dc2A6L74xLfAvr|DQmXi8aWqhnxa466MiBEhhTTCHeehoMuGrohtNG7et92Ne|DQmUtuWaSFoo8AtWd9fo4Tb7AEGhLo8rRrjqKPHHz2o7Mup|DQmcngR7AdBJio52C5stkD5C7vgsQ1yDH57Lb4J96Pys4a9|DQmRDW8jdYmE37tXvM6xPxuNnzNQnUJWSDnxVYyRJEHyc9H|DQmdNAWWwv6MAJjiNUWRahmAqbFBPxrX8WLQvoKyVHHqih1|DQmPKUZ5uZpL3Uq6LUUQXgNaaqsyX7ADpNyF4wHeTScs3xD|DQmeG5Bv1gKu2rQFWA1hH3QxzLzgzDPhDwieEEpy4WPnqN4|DQmPscjCVBggXvJT2GaUp66vbtyxzdzyHuhnzc38WDp4Smg|DQmV7NRosGCmNLsyHGzmh4Vr1pQJuBPEy2rk3WvnEUDxDFA|DQmY5UUP99u5ob3D8MA9JJW23zXLjHXHSRofSH3jLGEG1Yr|DQmQqfpSmcQtfrHAtzfBtVccXwUL9vKNgZJ2j93m8WNjizw|DQmbWy8KzKT1UvCvznUTaFPw6wBUcyLtBT5XL9wdbB7Hfmn|DQmV2hBheBVo9QWTXCxvqRqe4Fsg6kFTGggsTNGga9gTUHm|23w3F6U3PgtaT14tL5ewc1FoCwJcebdmZ3nrj2H6x2cTf4RzKWuicnQqvJGQ8tZxqX4Q5|ACTIVITYDQmeG5Bv1gKu2rQFWA1hH3QxzLzgzDPhDwieEEpy4WPnqN4|23yJg2hJAuEDUwg82kS1eC3EQqkVDzPEEyPa4rwymVHoz5mKPanjmshFa5s6tcPe3SP9c|DQmQJeGKQVsYFDFnHxgTHyNdrZxQmjLSJxz1wLB5HJDaZV3|DQmYfJ7SsTGpkR6gWoyLzo4pGrxnFopkcKzRVjgE6NRRXQL|DQmRoHaVPUiTagwviNmie8Ub5j4ZW1VcJGycZebmiH8ZdH5|AJpkUkMYpoVBmYDWsVtg7vaddiSqbMufvdoJ6w3FbzbvNTbkC6fgma1R8b47CMn|AJbhBb9Ev3i1cHKtjoxtsCAaXK9njP56dzMwBRwfZVZ21WseKsCa6ZkfAbLGnbh|AJmthV3QiiU3f2pVE2wEzBrLJp6AYgFwbB9WWqWFhA7ta3ejN2BcFkpbhTLDCQb/i;

      const userImages = initialImages.filter(url => {
        if (typeof url !== 'string') return false
        if (brandingImagesRegex.test(url)) return false
        const isStandardImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(url.split('?')[0]);
        const isFromTrustedHost = /usermedia\.actifit\.io|images\.hive\.blog|cdn\.liketu\.com|pixabay\.com|files\.peakd\.com|images\.d\.buzz|img\.leopedia\.io|images\.ecency\.com/.test(url);
        return isFromTrustedHost || isStandardImageFile;
      })

      const uniqueImages = [...new Set(userImages)]
      const processedImages = uniqueImages.map(url => this.getResizedImageUrl(url, width))

      this.allImages = processedImages
      this.currentImageIndex = 0

      if (this.allImages.length === 0) {
        this.imageLoading = false
      }
    },
    updateDimensionsAndSetupImages () {
      if (this.$el) {
        const newWidth = Math.round(this.$el.offsetWidth);
        if (newWidth > 0 && newWidth !== this.cardWidth) {
          this.cardWidth = newWidth;
          // Set loading state to true. The @load event on the new image will reset it.
          // This is the key part that was failing due to a race condition.
          // The new initialization flow should make it reliable.
          this.imageGeneration++; 
          this.imageLoading = true;
          this.setupImages(this.cardWidth);
        }
      }
    },
    debouncedResizeHandler () {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.updateDimensionsAndSetupImages();
      }, 250);
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
    handleImageError (event, meta) {
      if (!this.imageError) {
        this.imageError = true
        event.target.src = this.$fetchHiveFmtPostImage(meta)
        event.target.onerror = null
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
    votePrompt (e) {
      this.$store.commit('setPostToVote', this.cardData)
    },
    setProperNode () {
      return this.cur_bchain === 'STEEM' ? steem : hive
    },
    async updatePostData () {
      const chainLnk = await this.setProperNode()
      chainLnk.api.getContent(this.cardData.author, this.cardData.permlink, (err, result) => {
        if (result && this.cardData) {
            this.cardData.total_payout_value = result.total_payout_value;
            this.cardData.pending_payout_value = result.pending_payout_value;
        }
      })
    },
    /**
     * MODIFIED: This is now the main setup method called by components.
     * It handles timing, dimensions, listeners, and data fetching.
     */
    async initializeCard () {
      // 1. Wait for the component's DOM to be ready before doing anything.
      // This is the key fix to prevent race conditions.
      await this.$nextTick();

      // Reset image state for each new card initialization
      this.imageLoadFailed = false;
      this.imageError = false;
      
      // 2. Perform the initial dimension calculation and image setup.
      this.updateDimensionsAndSetupImages();

      // 3. Add the resize listener only once.
      if (!this.resizeListenerAdded) {
        window.addEventListener('resize', this.debouncedResizeHandler);
        this.resizeListenerAdded = true;
      }
      
      // 4. Proceed with asynchronous data fetching.
      steem.api.setOptions({ url: process.env.steemApiNode })
      hive.api.setOptions({ url: process.env.hiveApiNode })

      fetch(`${process.env.actiAppUrl}getPostReward?user=${this.cardData.author}&url=${this.cardData.url}`)
        .then(res => res.json())
        .then(json => { this.afitReward = json.token_count })
        .catch(e => console.error('Error fetching post reward:', e))

      fetch(`${process.env.actiAppUrl}getRank/${this.cardData.author}`)
        .then(res => res.json())
        .then(json => { this.userRank = json })
        .catch(e => console.error('Error fetching user rank:', e))

      this.$store.dispatch('fetchModerators')
      this.cur_bchain = localStorage.getItem('cur_bchain') || 'HIVE'
      this.profImgUrl = this.cur_bchain === 'STEEM' ? process.env.steemImgUrl : process.env.hiveImgUrl
    }
  }
}