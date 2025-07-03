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
      resizeListenerAdded: false,
      imageGeneration: 0,
      imageLoadFailed: false
    }
  },
  computed: {
    cardData () {
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
      return this.user && this.$store.getters.moderators.some(
        mod => mod.name === this.user.account.name && mod.title === 'moderator'
      )
    },
    currentImageSrc () {
      if (this.allImages.length > 0) {
        return this.allImages[this.currentImageIndex]
      }
      // FIX 1: Return an empty string. This prevents the browser from
      // ever trying to load the large, original image as a fallback.
      return ''
    }
  },
  watch: {
    postUpvoted: 'updatePostData'
  },
  beforeDestroy () {
    if (this.resizeListenerAdded) {
      window.removeEventListener('resize', this.debouncedResizeHandler)
    }
    clearTimeout(this.debounceTimer)
  },
  methods: {
    onImageLoad () {
      this.imageLoading = false
    },
    onImageError () {
      this.imageLoading = false;
      this.imageLoadFailed = true;
    },

    getResizedImageUrl(url, width) {
      if (typeof url !== 'string' || !url.startsWith('http') || /\.gif$/i.test(url)) {
        return url;
      }

      const fallbackWidth = width > 0 ? width : 300;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const effectiveWidth = Math.round(fallbackWidth * dpr);
      
      // FIX 3: Specify the container's fixed height (150px) to the image service.
      // This tells weserv.nl to crop the image to the correct aspect ratio,
      // massively reducing the file size for tall or wide images.
      const effectiveHeight = Math.round(150 * dpr);

      const encodedUrl = encodeURIComponent(url);
      return `https://images.weserv.nl/?url=${encodedUrl}&w=${effectiveWidth}&h=${effectiveHeight}&il&fit=cover`;
    },

    setupImages (width) {
      if (!this.cardData || !this.cardData.json_metadata) {
        this.allImages = [];
        this.imageLoading = false;
        return;
      }

      const metaImages = this.meta.image;
      let initialImages = [];

      if (Array.isArray(metaImages)) {
        initialImages = metaImages;
      } else if (metaImages) {
        initialImages = [metaImages];
      }

      if (initialImages.length === 0) {
        this.allImages = [];
        this.imageLoading = false;
        return;
      }

      const userImages = initialImages.filter(url => {
        if (typeof url !== 'string') return false;
        return /\.(jpg|jpeg|png|webp)$/i.test(url.split('?')[0]);
      });

      const uniqueImages = [...new Set(userImages)];

      const processedImages = uniqueImages.map(url => this.getResizedImageUrl(url, width));
      this.allImages = processedImages;

      console.log('Processed image URLs:', this.allImages);

      this.currentImageIndex = 0;

      if (this.allImages.length === 0) {
        this.imageLoading = false;
      }
    },

    updateDimensionsAndSetupImages () {
      if (this.$el) {
        const newWidth = Math.round(this.$el.offsetWidth);
        if (newWidth > 0 && newWidth !== this.cardWidth) {
          this.cardWidth = newWidth;
          this.imageGeneration++;
          this.imageLoading = true;
          this.setupImages(this.cardWidth);
        } else if (this.allImages.length === 0 && newWidth > 0) {
          this.cardWidth = newWidth;
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
        this.imageLoading = true;
        this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
      }
    },

    prevImage () {
      if (this.allImages.length > 1) {
        this.imageLoading = true;
        this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
      }
    },

    goToImage (index) {
      if (this.currentImageIndex !== index) {
        this.imageLoading = true;
        this.currentImageIndex = index;
      }
    },

    handleImageError (event, meta) {
      if (!this.imageError) {
        this.imageError = true;
        event.target.src = this.$fetchHiveFmtPostImage(meta);
        event.target.onerror = null;
      }
    },

    postPaid () {
      if (this.cardData.is_paidout) return true;
      const lastPayout = new Date(this.cardData.last_payout);
      const cashoutTime = new Date(this.cardData.cashout_time);
      return lastPayout.getTime() > cashoutTime.getTime();
    },

    showTooltip () { this.isTooltipVisible = true },
    hideTooltip () { this.isTooltipVisible = false },
    toggleTooltip () { this.isTooltipVisible = !this.isTooltipVisible },

    renderSnippet (content, length = 150) {
      if (!content) return '';
      let postContent = this.$cleanBody(content, true);
      postContent = this.truncateString(postContent, length);
      return postContent.replace(/<[^>]+>/g, '');
    },

    hasBeneficiaries () {
      return Array.isArray(this.cardData.beneficiaries) && this.cardData.beneficiaries.length > 0;
    },

    beneficiariesDisplay () {
      return this.cardData.beneficiaries.map(bene => `${bene.account}: ${bene.weight / 100}%`).join('\n');
    },

    paidValue () {
      return this.cardData.total_payout_value || this.cardData.author_payout_value || '';
    },

    truncateString (str, len = 70) {
      if (!str || typeof str !== 'string') return '';
      return str.length > len ? str.substring(0, len - 3) + '...' : str;
    },

    userVotedThisPost () {
      if (!this.user) return false;
      const curUser = this.user.account.name;
      const hasVoted = this.cardData.active_votes.some(voter => voter.voter === curUser);
      const newlyVoted = this.$store.getters.newlyVotedPosts.includes(this.cardData.post_id);
      this.postUpvoted = hasVoted || newlyVoted;
      return this.postUpvoted;
    },

    votePrompt () {
      this.$store.commit('setPostToVote', this.cardData);
    },

    setProperNode () {
      return this.cur_bchain === 'STEEM' ? steem : hive;
    },

    async updatePostData () {
      const chainLnk = await this.setProperNode();
      chainLnk.api.getContent(this.cardData.author, this.cardData.permlink, (err, result) => {
        if (result && this.cardData) {
          this.cardData.total_payout_value = result.total_payout_value;
          this.cardData.pending_payout_value = result.pending_payout_value;
        }
      });
    },

    async initializeCard () {
      await this.$nextTick();
      this.imageLoadFailed = false;
      this.imageError = false;

      // FIX 2: Re-introduce the timeout. This gives the DOM a moment to calculate
      // its layout, ensuring this.$el.offsetWidth has a valid value when we need it.
      // This prevents the image processing from failing silently on initial load.
      setTimeout(() => {
        this.updateDimensionsAndSetupImages();
      }, 40);

      if (!this.resizeListenerAdded) {
        window.addEventListener('resize', this.debouncedResizeHandler);
        this.resizeListenerAdded = true;
      }

      steem.api.setOptions({ url: process.env.steemApiNode });
      hive.api.setOptions({ url: process.env.hiveApiNode });

      fetch(`${process.env.actiAppUrl}getPostReward?user=${this.cardData.author}&url=${this.cardData.url}`)
        .then(res => res.json())
        .then(json => { this.afitReward = json.token_count })
        .catch(e => console.error('Error fetching post reward:', e));

      fetch(`${process.env.actiAppUrl}getRank/${this.cardData.author}`)
        .then(res => res.json())
        .then(json => { this.userRank = json })
        .catch(e => console.error('Error fetching user rank:', e));

      this.$store.dispatch('fetchModerators');
      this.cur_bchain = localStorage.getItem('cur_bchain') || 'HIVE';
      this.profImgUrl = this.cur_bchain === 'STEEM' ? process.env.steemImgUrl : process.env.hiveImgUrl;
    }
  }
}