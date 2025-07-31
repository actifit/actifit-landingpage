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
      allImages: [],
      currentImageIndex: 0,
      imageLoading: true,
      imageLoadFailed: false,
      imageGeneration: 0,
      isInitialized: false,
      intersectionObserver: null,
    }
  },
  computed: {
    cardData () { return {} }, // Placeholder, overridden by component
    meta () {
      try {
        const metadata = this.cardData ? this.cardData.json_metadata : {}
        if (typeof metadata === 'string') return JSON.parse(metadata)
        return metadata || {}
      } catch (err) { return {} }
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
      return !!(this.user && this.$store.getters.moderators.find(mod => mod.name === this.user.account.name && mod.title === 'moderator'))
    },
    postUpvoted () {
      if (!this.user || !this.cardData || !Array.isArray(this.cardData.active_votes)) return false
      const curUser = this.user.account.name
      const hasVoted = this.cardData.active_votes.some(voter => voter.voter === curUser)
      const newlyVoted = this.$store.getters.newlyVotedPosts.includes(this.cardData.post_id)
      return hasVoted || newlyVoted
    },
    currentImageSrc () {
      if (this.allImages.length > 0) {
        return this.allImages[this.currentImageIndex]
      }
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    },
  },
  watch: {
    'cardData.permlink'(newPermlink) {
      if (newPermlink && !this.isInitialized) {
        this.initializeCard();
      }
    },
    getVoteCount (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updatePostData()
      }
    }
  },
  mounted () {
    this.initializeCard();
  },
  beforeDestroy () {
    if (this.intersectionObserver) this.intersectionObserver.disconnect()
  },
  methods: {
    initializeCard () {
      if (this.isInitialized || !this.cardData || !this.cardData.permlink) return;
      this.isInitialized = true
      
      this.fetchApiData();
      
      this.$nextTick(() => {
        if (!this.$el) return;
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              this.intersectionObserver.disconnect();
              this.loadImagesForVisibleCard();
            }
          }, { rootMargin: '200px' }
        );
        this.intersectionObserver.observe(this.$el);
      });
    },

    loadImagesForVisibleCard() {
      const images = this.calculatePostImages();
      
      if (images.length === 0) {
        this.imageLoading = false;
        this.allImages = [];
        return;
      }
      
      const cardWidth = this.$el.offsetWidth > 0 ? this.$el.offsetWidth : 400;
      this.allImages = images.map(url => this.getResizedImageUrl(url, cardWidth));
      this.currentImageIndex = 0;
      this.imageGeneration += 1;
    },
    
    // *** FINAL CORRECTED VERSION ***
    calculatePostImages() {
      // Stages 1-3: Gather and validate all potential image URLs
      let candidateUrls = [];
      if (this.meta.image) {
        const images = Array.isArray(this.meta.image) ? this.meta.image : [this.meta.image];
        candidateUrls.push(...images);
      }
      if (this.cardData.body) {
        const imageRegex = /<img[^>]+src=["'](.*?)["']|!\[[^\]]*\]\((.*?)\)|(https?:\/\/[^\s"'<>]+)/g;
        const bodyMatches = [...this.cardData.body.matchAll(imageRegex)];
        for (const match of bodyMatches) {
          const url = match[1] || match[2] || match[3];
          if (url) candidateUrls.push(url.trim());
        }
      }
      const uniqueUrls = [...new Set(candidateUrls.filter(url => typeof url === 'string' && url.length > 0))];
      const imageExtensionRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
      const trustedHostsRegex = /images\.hive\.blog|files\.peakd\.com|usermedia\.actifit\.io|img\.inleo\.io|leopedia\.io|i\.imgur\.com|ipfs\.io|cdn\.pixabay\.com|cdn\.steemitimages\.com|img\.3speak\.tv|ipfs-3speak\.b-cdn\.net/i;
      let validImages = uniqueUrls.filter(url => trustedHostsRegex.test(url) || imageExtensionRegex.test(url));
      
      // Stage 4: Filter out known branding/UI elements using a blocklist
      const excludedImagePatterns = [
        // *** CHANGE 1: The hash for A-5.png IS ADDED BACK to the blocklist. ***
        // This prevents it from being treated as a real image if found in the post body.
        /DQmNp6YwAm2qwquALZw8PdcovDorwaBSFuxQ38TrYziGT6b|DQmY67NW9SgDEsLo2nsAw4nYcddrTjp4aHNLyogKvGuVMMH|DQmW1VsUNbEjTUKawau4KJQ6agf41p69teEvdGAj1TMXmuc|DQmXv9QWiAYiLCSr3sKxVzUJVrgin3ZZWM2CExEo3fd5GUS|DQmdnh1nApZieHZ3s1fEhCALDjnzytFwo78zbAY5CLUMpoG|DQmZ6ZT8VaEpaDzB16qZzK8omffbWUpEpe4BkJkMXmN3xrF|DQmRgAoqi4vUVymaro8hXdRraNX6LHkXhMRBZxEo5vVWXDN|5CEvyaWxjaErqc3i7tYRQutZDwQPeZ8E6Ha3BenkA3Uc6fhKSLZ62PuSojTnM4kkLrYUdChBgBHoPxiDt|23tm6o6cmgwSRVABZSPxMC77Sfa2VNsaTtHWsjEpV1hWdQSe2s4FxvCyifsbKyESxfiPu|DQmUVjgmJHvtbYB2APdxqNxxkZeJ2KvPeXEE7v3BpxGJkbR|23tkbEYQioWnn3mfu8tWBh3x8n1Wz8TM9nH6SPRoghyZ46q2NNzt3aFsds2c8SjoknXRM|DQmdvc788wxsBSQHY3z21o3wSTU7hqRnyYc2JFEn2pEYSev|DQmeWzNEfmAnX91Ze89zqQU3B2uS58sn6dc2A6L74xLfAvr|DQmXi8aWqhnxa466MiBEhhTTCHeehoMuGrohtNG7et92Ne|DQmUtuWaSFoo8AtWd9fo4Tb7AEGhLo8rRrjqKPHHz2o7Mup|DQmcngR7AdBJio52C5stkD5C7vgsQyDH57Lb4J96Pys4a9|DQmRDW8jdYmE37tXvM6xPxuNnzNQnUJWSDnxVYyRJEHyc9H|DQmdNAWWwv6MAJjiNUWRahmAqbFBPxrX8WLQvoKyVHHqih1|DQmPKUZ5uZpL3Uq6LUUQXgNaaqsyX7ADpNyF4wHeTScs3xD|DQmeG5Bv1gKu2rQFWA1hH3QxzLzgzDPhDwieEEpy4WPnqN4|DQmPscjCVBggXvJT2GaUp66vbtyxzdzyHuhnzc38WDp4Smg|DQmV7NRosGCmNLsyHGzmh4Vr1pQJuBPEy2rk3WvnEUDxDFA|DQmY5UUP99u5ob3D8MA9JJW23zXLjHXHSRofSH3jLGEG1Yr|DQmQqfpSmcQtfrHAtzfBtVccXwUL9vKNgZJ2j93m8WNjizw|DQmbWy8KzKT1UvCvznUTaFPw6wBUcyLtBT5XL9wdbB7Hfmn|DQmV2hBheBVo9QWTXCxvqRqe4Fsg6kFTGggsTNGga9gTUHm|23w3F6U3PgtaT14tL5ewc1FoCwJcebdmZ3nrj2H6x2cTf4RzKWuicnQqvJGQ8tZxqX4Q5|ACTIVITYDQmeG5Bv1gKu2rQFWA1hH3QxzLzgzDPhDwieEEpy4WPnqN4|23yJg2hJAuEDUwg82kS1eC3EQqkVDzPEEyPa4rwymVHoz5mKPanjmshFa5s6tcPe3SP9c|DQmQJeGKQVsYFDFnHxgTHyNdrZxQmjLSJxz1wLB5HJDaZV3|DQmYfJ7SsTGpkR6gWoyLzo4pGrxnFopkcKzRVjgE6NRRXQL|DQmRoHaVPUiTagwviNmie8Ub5j4ZW1VcJGycZebmiH8ZdH5|AJpkUkMYpoVBmYDWsVtg7vaddiSqbMufvdoJ6w3FbzbvNTbkC6fgma1R8b47CMn|AJbhBb9Ev3i1cHKtjoxtsCAaXK9njP56dzMwBRwfZVZ21WseKsCa6ZkfAbLGnbh|AJmthV3QiiU3f2pVE2wEzBrLJp6AYgFwbB9WWqWFhA7ta3ejN2BcFkpbhTLDCQb\/i/,
        /s3\.us-east-1\.amazonaws\.com\/actifit\.io\.website\/|ACTIVITY(DATE|COUNT|TYPE)\.png|TRACKM\.png|\/h1\.png|\/w1a\.png|\/bd1\.png|\/w1\.png|\/t1\.png|\/c1\.png/i,
        /\/actifit-/,
      ];
      
      const finalImages = validImages.filter(url => {
        return !excludedImagePatterns.some(pattern => pattern.test(url));
      });
      
      // *** CHANGE 2: Add fallback ONLY if no other images exist AND it's a report card. ***
      // We identify a report card by checking for `step_count` in the metadata.
      const isActifitReport = this.meta && this.meta.step_count > 0;
      
      if (finalImages.length === 0 && isActifitReport) {
        const fallbackImageUrl = 'https://cdn.steemitimages.com/DQmW1VsUNbEjTUKawau4KJQ6agf41p69teEvdGAj1TMXmuc/A-5.png';
        return [fallbackImageUrl];
      }
      
      // For all other cases, return the filtered list of real images (or an empty array for non-reports).
      return finalImages;
    },

    getResizedImageUrl (url, width) {
      if (typeof url !== 'string' || !url.startsWith('http') || /\.gif$/i.test(url) || url.includes('leopedia.io')) {
        return url;
      }
      const resizeProxy = `https://images.hive.blog/${Math.round(width)}x0/`;
      return resizeProxy + url;
    },
    onImageLoad() { this.imageLoading = false; },
    onImageError(event) {
      this.imageLoadFailed = true;
      this.imageLoading = false;
    },
    nextImage() {
      if (this.allImages.length > 1) {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
      }
    },
    prevImage() {
      if (this.allImages.length > 1) {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
      }
    },
    goToImage(index) {
      this.currentImageIndex = index;
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