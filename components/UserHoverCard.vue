<template>
  <div class="hover-card-container">
    <!-- Display based on mode -->
    <template v-if="displayMode === 'avatar-only'">
      <a class="avatar-only-display" 
         @mouseenter="handleMouseEnter" 
         @mouseleave="handleMouseLeave">
        <div class="user-avatar-small" 
             :title="username"
             :style="'background-image: url('+profImgUrl+'/u/' + username + '/avatar)'">
        </div>
      </a>
    </template>

    <template v-else-if="displayMode === 'no-rank'">
      <a class="user-display d-flex align-items-center"
         target="_blank"
         @mouseenter="handleMouseEnter" 
         @mouseleave="handleMouseLeave">
				  <div class="user-avatar mr-1 yield-avatar" :style="'background-image: url('+profImgUrl+'/u/' + username + '/avatar);'"></div>
        <div class="user-info">
          <small class="d-inline-block align-top">@{{ username }}</small>
        </div>
      </a>
    </template>

    <template v-else-if="displayMode==='username-only'">
      <a :href="'/' + username" class="user-display align-items-center" 
         target="_blank"
         @mouseenter="handleMouseEnter" 
         @mouseleave="handleMouseLeave">

        <span class="user-info">
          <small class="d-inline-block align-top">@{{ username }}</small>
        </span>
      </a>
    </template>
    
    <template v-else>
      <a class="user-display align-items-center" 
         target="_blank"
         @mouseenter="handleMouseEnter" 
         @mouseleave="handleMouseLeave">
        <span class="user-avatar mr-1"
             :style="'background-image: url('+profImgUrl+'/u/' + username + '/avatar);'">
        </span>
        <span class="user-info">
          <small class="d-inline-block align-top">@{{ username }}</small>
          <small v-if="displayMode === 'full' && displayCoreUserRank" class="text-brand numberCircle ml-1">
            {{ displayCoreUserRank }}
            <span class="increased-rank" v-if="displayIncreasedUserRank">
              +{{ displayIncreasedUserRank }}
            </span>
          </small>
        </span>
      </a>
    </template>
    
    <!-- Hover Card -->
    <transition name="fade">
      <div v-if="isVisible" 
           class="hover-card-wrapper" 
           :style="cardPosition"
           @mouseenter="handleCardEnter"
           @mouseleave="handleCardLeave">
        <div v-if="loading" class="user-hover-card card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-auto">
                <div class="skeleton-avatar"></div>
              </div>
              <div class="col">
                <div class="skeleton-text"></div>
                <div class="skeleton-text-sm"></div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="skeleton-section"></div>
            <div class="skeleton-section"></div>
          </div>
        </div>

        <div v-else class="user-hover-card card">
          <div class="card-header">
            <div class="row align-items-center">
              <div class="col-auto position-relative">
                <div class="user-avatar-large"
                     :style="'background-image: url('+profImgUrl+'/u/' + username + '/avatar)'">
                </div>
                <span class="rank-badge">{{ displayCoreUserRank }}
                  <span class="increased-rank" v-if="displayIncreasedUserRank">
                    +{{ displayIncreasedUserRank }}
                  </span>
                </span>
              </div>
              <div class="col">
                <h3 class="mb-1">@{{ username }}</h3>
                <small class="text-muted">
                  <i class="far fa-calendar"></i>
                  Joined {{ joinDate }}
                </small>
              </div>
            </div>
          </div>
      
          <div class="card-body">
            <div class="row balance-section mb-3">
              <div class="col-6 text-center">
                <small class="text-muted d-block">{{ $t('hive_balance') }}</small>
                <div class="text-brand font-weight-bold">{{ hiveBalance || 'N/A' }}</div>
              </div>
              <div class="col-6 text-center">
                <small class="text-muted d-block">{{ $t('afit_balance') }}</small>
                <div class="text-brand font-weight-bold">{{ afitBalance || 'N/A' }}</div>
              </div>
            </div>
      
            <div class="links-section">
              <a :href="'/'+username+'/blog'" class="d-block mb-2">
                <i class="fas fa-book-open mr-2"></i>
                {{ $t('blog_posts') }}
              </a>
              <a :href="'/'+username+'/comments'" class="d-block mb-2">
                <i class="far fa-comments mr-2"></i>
                {{ $t('comments') }}
              </a>
              <a :href="'/'+username+'/videos'" class="d-block mb-2">
                <i class="fas fa-video mr-2"></i>
                {{ $t('videos') }}
              </a>
              <a :href="'/activity/'+username" class="d-block mb-2">
                <i class="fas fa-running mr-2"></i>
                {{ $t('Actifit_reports') }}
              </a>
              <a :href="'/'+username+'/wallet'" class="d-block mb-2">
                <i class="fas fa-wallet mr-2"></i>
                {{ $t('Wallet') }}
              </a>
            </div>
      
            <a :href="'/'+username" class="btn btn-brand-profile btn-block">
              {{ $t('view_full_profile') }}
            </a>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import hive from '@hiveio/hive-js'
import steem from 'steem'

export default {
  name: 'UserHoverCard',
  
  props: {
    username: {
      type: String,
      required: true
    },
    displayMode: {
      type: String,
      default: 'full',
      validator: function(value) {
        return ['full', 'avatar-only', 'no-rank'].indexOf(value) !== -1
      }
    }
  },


  data() {
    return {
      userRankData: null,
      displayCoreUserRank: 0.00,
      displayIncreasedUserRank: 0.00,
      profImgUrl: process.env.hiveImgUrl,
      hiveBalance: '0',
      afitBalance: '0',
      userAddedTokens: '0',
      joinDate: '',
      loading: true,
      isVisible: false,
      hoverTimeout: null,
      leaveTimeout: null,
      mouseX: 0,
      mouseY: 0,
      modalOffsetX: 0,
      modalOffsetY: 0,
      isHoveringCard: false
    }
  },

  computed: {
    ...mapGetters(['userTokensWallet']),
    formattedAfitBalance() {
      const balance = parseFloat(this.userTokensWallet || 0) + parseFloat(this.userAddedTokens || 0)
      return this.numberFormat(balance, 3)
    },
    cardPosition() {
      const CARD_WIDTH = 300
      const CARD_HEIGHT = 400
      const MARGIN = 20
      
      let left = this.mouseX
      let top = this.mouseY
      
      if (this.modalOffsetX || this.modalOffsetY) {
        left = left + MARGIN * 2
        top = top - MARGIN
        
        if (left + CARD_WIDTH > window.innerWidth) {
          left = this.mouseX - CARD_WIDTH - MARGIN
        }
        
        if (top + CARD_HEIGHT > window.innerHeight) {
          top = window.innerHeight - CARD_HEIGHT - MARGIN
        }
      } else {
        left = left + MARGIN
        
        if (left + CARD_WIDTH > window.innerWidth) {
          left = this.mouseX - CARD_WIDTH - MARGIN
        }
        
        if (top + CARD_HEIGHT > window.innerHeight) {
          top = this.mouseY - CARD_HEIGHT - MARGIN
        }
      }
      
      left = Math.max(MARGIN, left)
      top = Math.max(MARGIN, top)

      return {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 1000000
      }
    }
  },

  mounted() {
    steem.api.setOptions({ url: process.env.steemApiNode })
    hive.api.setOptions({ url: process.env.hiveApiNode })
    
    this.profImgUrl = (localStorage.getItem('cur_bchain') === 'STEEM') 
      ? process.env.steemImgUrl 
      : process.env.hiveImgUrl

      this.fetchUserRank()
  },

  beforeDestroy() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout)
    }
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout)
    }
  },
  
  watch: {
    userTokensWallet: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.afitBalance = this.formattedAfitBalance
        }
      }
    }
  },

  methods: {
    handleMouseEnter(event) {
      if (this.leaveTimeout) {
        clearTimeout(this.leaveTimeout)
        this.leaveTimeout = null
      }

      const modalElement = event.target.closest('.modal-content')
      
      if (modalElement) {
        const modalRect = modalElement.getBoundingClientRect()
        const triggerRect = event.target.getBoundingClientRect()
        
        this.mouseX = triggerRect.left
        this.mouseY = triggerRect.top
        
        this.modalOffsetX = modalRect.left
        this.modalOffsetY = modalRect.top
      } else {
        this.mouseX = event.clientX
        this.mouseY = event.clientY
        this.modalOffsetX = 0
        this.modalOffsetY = 0
      }

      this.hoverTimeout = setTimeout(() => {
        this.isVisible = true
        this.fetchUserData()
      }, 150)
    },

    handleMouseLeave() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout)
        this.hoverTimeout = null
      }

      if (!this.isHoveringCard) {
        this.leaveTimeout = setTimeout(() => {
          this.isVisible = false
        }, 100)
      }
    },

    handleCardEnter() {
      this.isHoveringCard = true
      if (this.leaveTimeout) {
        clearTimeout(this.leaveTimeout)
        this.leaveTimeout = null
      }
    },

    handleCardLeave() {
      this.isHoveringCard = false
      this.leaveTimeout = setTimeout(() => {
        this.isVisible = false
      }, 300)
    },

    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },

    async fetchUserRank() {
      try {
        const response = await fetch(`${process.env.actiAppUrl}getRank/${this.username}`)
        const rankData = await response.json()
        
        
          this.userRankData = rankData
          this.displayCoreUserRank = rankData.rank_no_afitx ? parseFloat(rankData.rank_no_afitx).toFixed(2) : "0.00"
          this.displayIncreasedUserRank = rankData.afitx_rank ? parseFloat(rankData.afitx_rank).toFixed(2) : 0.00
      
      } catch (error) {
        console.error('Error fetching user rank:', error)
      }
    },

    async fetchUserData() {
      try {
        const chainLnk = localStorage.getItem('cur_bchain') === 'STEEM' ? steem : hive
        
        // Fetch all data in parallel
        const [accountData, userTokens] = await Promise.all([
          new Promise((resolve) => {
            chainLnk.api.getAccounts([this.username], (err, result) => {
              if (err || !result || result.length === 0) {
                resolve(null)
              } else {
                resolve(result[0])
              }
            })
          }),
          this.$store.dispatch('fetchUserTokensReturn', this.username, false)
        ])

        if (accountData) {
          const balance = accountData.balance.split(' ')[0]
          this.hiveBalance = this.numberFormat(parseFloat(balance), 3)
          this.joinDate = new Date(accountData.created).toLocaleDateString()
        }

        if (userTokens) {
          const afitBalance = parseFloat(userTokens) + parseFloat(this.userAddedTokens || 0)
          this.afitBalance = this.numberFormat(afitBalance, 3)
        }

        // Fetch rank data if needed and not already loaded
        if (this.displayMode === 'full' && !this.displayCoreUserRank) {
          await this.fetchUserRank()
        }

      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style lang="sass" scoped>
.hover-card-container
  display: inline-block
  position: static

.hover-card-wrapper
  position: fixed !important
  z-index: 1000000 !important
  pointer-events: auto
.user-hover-card
  width: 300px
  background: white
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15)
  border-radius: 8px
  overflow: hidden

.card-header
  background: #ff112d
  color: white
  padding: 1rem

.user-avatar-large
  width: 64px
  height: 64px
  background-position: center
  background-size: cover
  border-radius: 50%
  border: 2px solid white

.rank-badge
  position: absolute
  bottom: -5px
  right: -5px
  background: #ff112d
  color: white
  font-size: 0.75rem
  padding: 2px 8px
  border-radius: 10px
  border: 2px solid white

.balance-section
  background: #f8f9fa
  padding: 1rem
  border-radius: 8px
  margin: -5px 0

.links-section
  a
    color: #333
    &:hover
      color: #ff112d
      text-decoration: none

@keyframes shimmer
  0%
    background-position: -468px 0
  100%
    background-position: 468px 0

.skeleton-avatar
  width: 64px
  height: 64px
  border-radius: 50%
  background: #f6f7f8
  background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)
  background-repeat: no-repeat
  animation: shimmer 1s linear infinite forwards

.skeleton-text
  height: 20px
  width: 150px
  background: #f6f7f8
  background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)
  background-repeat: no-repeat
  animation: shimmer 1s linear infinite forwards
  margin-bottom: 8px

.skeleton-text-sm
  @extend .skeleton-text
  width: 100px
  height: 16px

.skeleton-section
  height: 40px
  background: #f6f7f8
  background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)
  background-repeat: no-repeat
  animation: shimmer 1s linear infinite forwards
  margin-bottom: 16px

.fade-enter-active, .fade-leave-active
  transition: opacity .2s, transform .2s
  transform-origin: top left

.fade-enter, .fade-leave-to
  opacity: 0
  transform: translateY(-10px)

.btn-brand-profile
  background: #ff112d !important
  color: white !important
  &:hover
    background: darken(#ff112d, 10%) !important
    color: white !important
</style>