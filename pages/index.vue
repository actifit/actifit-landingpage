<template>
  <div class="home" ref="homePage">
    <!-- top anchor -->
    <a id="top"></a>
    <div id="navbar-container" ref="navbar-container" v-if="renderReady">
      <NavbarBrand :home="true" @scrollTo="scrollTo" />
    </div>

    <div class="hero-section">
      <!-- Left Side: Content & UI Panel -->
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            IT PAYS TO <span class="text-brand">BE FIT</span>
          </h1>
          <p class="hero-subtitle">
            Join a global community that rewards you for your daily activity. Your steps, your effort, your crypto.
          </p>
        </div>

        <!-- The main user interaction card -->
        <div class="user-panel">
          <!-- LOGGED-IN VIEW -->
          <div v-if="user">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="label">{{ $t('Balance') }}</span>
                <span class="value">{{ numberFormat(formattedUserTokens, 2) }} {{ $t('AFIT_Token') }}</span>
                <a href="#" @click.prevent="$router.push('/wallet')" class="btn-panel-action">{{ $t('My_Wallet') }} <i class="fas fa-arrow-right"></i></a>
              </div>
              <div class="stat-item">
                <span class="label">{{ $t('Activity') }}</span>
                <span class="value">{{ grabUserReportCount }} {{ $t('Reports') }}</span>
                <a href="#" @click.prevent="$router.push('/activity/' + user.account.name)" class="btn-panel-action">{{ $t('My_Activity') }} <i class="fas fa-arrow-right"></i></a>
              </div>
            </div>
            <div class="resource-stats">
              <SteemStats :user="user" class="col-md-12" :key="reload" />
            </div>
            <div class="main-actions">
              <a href="#" class="btn btn-primary-hero" @click.prevent="$router.push('/activity/')">{{ $t('activity_feed') }}</a>
              <a href="#" class="btn btn-secondary-hero" @click.prevent="$router.push('/market')">{{ $t('Market') }}</a>
            </div>
          </div>

          <!-- LOGGED-OUT VIEW -->
          <div v-else>
            <p class="login-prompt">Get started now. It's free!</p>
            <div class="main-actions">
                <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc" class="btn btn-primary-hero">{{ $t('Login') }}</a>
                <a href="/signup" class="btn btn-secondary-hero">{{ $t('Sign_Up') }}</a>
            </div>
            <div class="main-actions-alt">
              <a href="#" class="btn-link-hero" @click.prevent="$router.push('/activity/')">{{ $t('Explore Activity Feed') }} <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Visual Image -->
      <div class="hero-visual">
        <div class="hero-bg-image"></div>
        <div class="hero-visual-overlay"></div>
      </div>
      
      <!-- scroll indicator -->
      <div class="text-center scroll-down position-absolute w-100">
        <a href="#" @click="scrollTo('#content')">
          <i class="fas fa-2x text-light fa-chevron-down"></i>
        </a>
      </div>
    </div>

    <section id="recent-activity" class="py-5">
      <div class="container-fluid">
        <div class="text-center mb-5">
          <h1 class="section-title">Fresh Off The Track</h1>
          <p class="lead text-muted">See what our community has been up to!</p>
        </div>
        
        <div class="activity-scroller" v-if="reports.length > 0">
          <div class="activity-post-card" v-for="(report, index) in reports.slice(0, 10)" :key="'activity-' + index">
            <a :href="report.url" target="_blank" class="activity-card-link">
              <div class="card-user-info">
                <div class="avatar small" :style="'background-image: url(' + profImgUrl + '/u/' + report.author + '/avatar);'"></div>
                <span class="username">@{{ report.author }}</span>
              </div>
              <div class="card-post-content">
                <h5 class="post-title">{{ report.title }}</h5>
              </div>
              <div class="post-stats" v-if="report.json_metadata.activity_count">
                <i class="fas fa-shoe-prints"></i>
                <span>{{ numberFormat(report.json_metadata.activity_count, 0) }} Steps</span>
              </div>
            </a>
          </div>
        </div>
        <div v-else class="text-center text-muted">
          <p>Loading recent activities...</p>
        </div>
      </div>
    </section>

    <!-- intro -->
    <section class="intro reveal" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline" v-html="$t('homepage.section1_title')"></h1>
        <p class="lead mb-4 pb-5 text-center">
          {{ $t('homepage.section1_desc') }}
        </p>
      </div>
    </section>

    <!-- texts with images  -->
<section class="aurora-showcase">
  
  <!-- Showcase Item 1: Earn Tokens -->
  <div class="showcase-card reveal">
    <div class="card-content-grid">
      <div class="aurora-text-content">
        <h2 class="text-capitalize">{{ $t('homepage.section2_title') }}</h2>
        <p class="lead mb-4">Earning crypto for your daily activity has never been easier. Follow these simple steps to start your journey with Actifit.</p>
        <div class="app-buttons-container">
          <a href="https://links.actifit.io/android" target="_blank">
            <img src="/img/google-play.png" alt="Get it on Google Play">
          </a>
          <a href="https://links.actifit.io/ios" target="_blank">
            <img src="/img/app-store.png" alt="Download on the App Store">
          </a>
        </div>
      </div>
      <div class="aurora-image-wrapper">
        <img src="/img/landingimgs/healthier_you.jpeg" alt="Man and woman running" class="img-fluid" />
      </div>
    </div>
  </div>

  <!-- Showcase Item 2: AFIT Tokens (Paragraph and Buttons are both present) -->
  <div class="showcase-card reveal">
    <div class="card-content-grid">
       <div class="aurora-image-wrapper">
         <img src="/img/landingimgs/actifit_gym_pay_back.jpeg" alt="Man exercising in a gym" class="img-fluid" />
      </div>
       <div class="aurora-text-content">
          <h2 class="text-capitalize">{{ $t('homepage.section3_title') }}</h2>
          <p class="lead" v-html="$t('homepage.section3_desc')"></p>
          
          <h4 class="mt-4 mb-3">Available for trade on:</h4>
          <div class="exchange-tags-container">
              <a href="#" class="exchange-tag"><i class="fas fa-coins mr-2"></i>Hive-Engine</a>
              <a href="#" class="exchange-tag"><i class="fas fa-fire-alt mr-2"></i>Actifit DeFi</a>
              <a href="#" class="exchange-tag"><i class="fas fa-sync-alt mr-2"></i>Pancakeswap</a>
              <a href="#" class="exchange-tag"><i class="fas fa-chart-line mr-2"></i>Digifinex</a>
              <a href="#" class="exchange-tag"><i class="fas fa-exchange-alt mr-2"></i>Dex-trade</a>
          </div>
      </div>
    </div>
  </div>

  <!-- Showcase Item 3: Yield Farming -->
  <div class="showcase-card reveal">
    <div class="card-content-grid">
      <div class="aurora-text-content">
          <h2 class="text-capitalize">{{ $t('homepage.section4_title') }}</h2>
          <p class="lead mb-4">{{ $t('homepage.section4_desc') }}</p>
          <div class="cta-button-group">
              <a href="/yieldfarming" class="btn btn-solid-red btn-lg"><i class="fas fa-leaf mr-2"></i>{{ $t('yield_farming') }}</a>
              <a href="/wallet?action=delegate" class="btn btn-outline-red btn-lg"><i class="fas fa-hand-holding-usd mr-2"></i>{{ $t('Delegate') }}</a>
          </div>
      </div>
      <div class="aurora-image-wrapper">
         <img src="/img/landingimgs/effort_rewarded_crypto.jpeg" alt="Man and woman posing after a workout" class="img-fluid" />
      </div>
    </div>
  </div>

</section>


    <!-- top Delegators -->
    <section id="delegators" class="reveal py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-heart"></i><br>
          {{ $t('Top_Delegators') }}
        </h1>
        <div class="row" v-if="topDelegators.hive">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators.hive"
            :key="'hive' + index" :delegator="delegator">
            <a :href="delegator._id" target="_blank">
              <div class="avatar avatar-hive small mx-auto mb-3"
                :style="'background-image: url(' + profImgUrl + '/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="delegator._id" target="_blank">@{{ delegator._id }}</a><br />
            <img src="/img/HIVE.png" style="max-height: 20px;"><a :href="delegator._id" target="_blank">{{
              numberFormat(delegator.steem_power, 0) }} {{ $t('Hive_Power') }}</a>
          </div>
          <div class="full-div">
            <nuxt-link to="/delegators" class="text-center btn btn-brand acti-shadow" data-target="#">{{
              $t('View_All_Delegators') }}</nuxt-link>
          </div>
        </div>
      </div>
    </section>

    <!-- leaderboard -->
    <section id="leaderboard" class="py-5 reveal">
      <div class="container">
        <h1 class="leaderboard-title text-center">
          Daily Leaderboard
        </h1>
        <div class="leaderboard-podium" v-if="leaderboard && leaderboard.length >= 3">
          <div class="podium-column">
            <div class="user-details">
              <a :href="leaderboard[1].username" target="_blank">
                <div class="avatar"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[1].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a class="username" :href="leaderboard[1].username" target="_blank">{{
                leaderboard[1].username.replace('@','') }}</a>
              <a :href="leaderboard[1].username" target="_blank" class="activity-count">{{ leaderboard[1].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
            <div class="podium-base silver">
              <span class="rank-number">2</span>
            </div>
          </div>
          <div class="podium-column">
            <img src="/img/1st_place_medal.svg" class="medal-icon" alt="Gold Medal">
            <div class="user-details">
              <a :href="leaderboard[0].username" target="_blank">
                <div class="avatar"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[0].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a class="username" :href="leaderboard[0].username" target="_blank">{{
                leaderboard[0].username.replace('@','') }}</a>
              <a :href="leaderboard[0].username" target="_blank" class="activity-count">{{ leaderboard[0].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
            <div class="podium-base gold">
              <span class="rank-number">1</span>
            </div>
          </div>
          <div class="podium-column">
            <div class="user-details">
              <a :href="leaderboard[2].username" target="_blank">
                <div class="avatar"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[2].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a class="username" :href="leaderboard[2].username" target="_blank">{{
                leaderboard[2].username.replace('@','') }}</a>
              <a :href="leaderboard[2].username" target="_blank" class="activity-count">{{ leaderboard[2].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
            <div class="podium-base bronze">
              <span class="rank-number">3</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5">
          <p>{{ $t('Leaderboard is being updated...') }}</p>
        </div>
        <div class="full-div mt-5 text-center">
          <nuxt-link to="/leaderboard" class="text-center btn leaderboard-cta-btn">{{ $t('View_leaderboard') }}</nuxt-link>
        </div>
      </div>
    </section>

    <!---infrastructure-->
    <section id="infrastructure" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-cubes"></i><br>
          {{ $t('Infrastructure') }}
        </h1>
        <div class="infrastructure-grid">
          <div class="infra-card" :title="$t('main_chain')">
            <img class="logo-icon" src="/img/HIVE.png" alt="HIVE">
            <div class="hover-image" style="background-image: url('https://placehold.co/400x400/e10707/ffffff?text=Hive');"></div>
          </div>
          <div class="infra-card" :title="$t('secondary_chains')">
            <img class="logo-icon" src="/img/BLURT.png" alt="BLURT">
            <div class="hover-image" style="background-image: url('https://placehold.co/400x400/333333/ffffff?text=Blurt');"></div>
          </div>
          <div class="infra-card" :title="$t('secondary_chains')">
            <img class="logo-icon" src="/img/BNB_CHAIN.webp" alt="BNB Chain">
            <div class="hover-image" style="background-image: url('https://placehold.co/400x400/f0b90b/000000?text=BNB+Chain');"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- news -->
    <section id="news" class="reveal py-5">
        <div class="container">
            <h1 class="news-title text-center pb-3">
                <i class="far fa-newspaper"></i><br>
                {{ $t('News') }}
            </h1>
            <client-only>
                <carousel :perPageCustom="[[0, 1], [768, 2], [992, 3], [1200, 4]]"
                :paginationColor="'rgba(0, 0, 0, 0.2)'" :paginationActiveColor="'#000000'">
                <slide v-for="(post, index) in news" :key="index">
                  <div class="new-design-news-card">
                    <div class="card-content">
                      <small class="card-date">{{ new Date(post.created).toLocaleString() }}</small>
                      <h5 class="card-title">{{ post.title }}</h5>
                    </div>
                    <div class="card-actions">
                      <a href="#" class="btn-news" @click.prevent="openNewsModal(post)">{{ $t('Read_More') }}</a>
                      <a :href="post.url" target="_blank" class="btn-news">{{ $t('Full_View') }}</a>
                    </div>
                  </div>
                </slide>
                </carousel>
            </client-only>
        </div>
    </section>


    <Footer isHomePage='true' />

    <NewsModal :news="activeNews" />
    <NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')" />
    <NotifyModal id="notifyModalRC" ref="notifyModalRC" :modalTitle="$t('Actifit_Info')" :modalText="$t('RC_desc')" />
    <LoginModal v-if="showModal" @close="showModal = false" />
    <pendingRewardsModal :pendingRewards="pendingRewards" :username="user" />

    <a id="pendingRewardsKicker" name="pendingRewardsKicker" ref="pendingRewardsKicker" class="btn btn-white"
      data-toggle="modal" data-target="#pendingRewardsModal"></a>
    <a id="pendingRewardsHider" name="pendingRewardsHider" ref="pendingRewardsHider" class="btn btn-white"
      data-toggle="dismiss" data-target="#pendingRewardsModal"></a>
  </div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import VueScrollTo from 'vue-scrollto'
import Footer from '~/components/Footer'
import NewsModal from '~/components/NewsModal'
import pendingRewardsModal from '~/components/PendingRewardsModal'
import { mapGetters } from 'vuex'
import SteemStats from '~/components/SteemStats'
import NotifyModal from '~/components/NotifyModal'
import LoginModal from '~/components/LoginModal'

export default {
  components: {
    LoginModal,
    NavbarBrand,
    Footer,
    NewsModal,
    SteemStats,
    NotifyModal,
    pendingRewardsModal,
  },
  data() {
    return {
      showModal: false,
      username: '',
      tweenedUserCount: 0,
      tweenedTokensDistributed: 0,
      tweenedRewardedActivityCount: 0,
      reload: 0,
      profImgUrl: process.env.hiveImgUrl,
      pendingRewards: {},
      renderReady: false,
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    ...mapGetters(['userTokens', 'userReportCount', 'transactions', 'userRank', 'userCount', 'topDelegators', 'moderators', 'ambassadors', 'tokensDistributed', 'rewardedActivityCount', 'leaderboard', 'news', 'activeNews', 'reports', 'bchain']),
    formattedUserTokens() {
      return parseFloat(this.userTokens).toFixed(3)
    },
    grabUserReportCount() {
      return this.userReportCount
    },
    displayUserRank() {
      return this.userRank
    },
    animatedUserCount: function () {
      return this.tweenedUserCount.toFixed(0);
    },
    animatedTokensDistributed: function () {
      return this.tweenedTokensDistributed.toFixed(0);
    },
    animatedRewardedActivityCount: function () {
      return this.tweenedRewardedActivityCount.toFixed(0);
    }
  },
  watch: {
    userCount: function (newValue) {
      TweenLite.to(this.$data, 8, { tweenedUserCount: newValue });
    },
    tokensDistributed: function (newValue) {
      TweenLite.to(this.$data, 8, { tweenedTokensDistributed: newValue });
    },
    rewardedActivityCount: function (newValue) {
      TweenLite.to(this.$data, 8, { tweenedRewardedActivityCount: newValue });
    },
    user: 'fetchUserData',
    bchain: async function (newBchain) {
      console.log('user activity change in chain ' + newBchain);
      this.cur_bchain = newBchain;
      this.profImgUrl = process.env.hiveImgUrl;
      if (this.cur_bchain == 'STEEM') {
        this.profImgUrl = process.env.steemImgUrl;
      }
      await this.$store.dispatch('steemconnect/refreshUser');
      this.fetchUserData();
      this.reload += 1;
    },
  },
  methods: {
    scrollTo(target) {
      VueScrollTo.scrollTo(target, 1000, { easing: 'ease-in-out' })
    },
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    showModalFunc() {
      this.$nextTick(() => {
        this.showModal = true;
        if (window.$ && typeof window.$.fn.modal === 'function') {
          $('#loginModal').modal('show');
        }
      });
    },
    async setPendingRewards(json) {
      this.pendingRewards = json;
      if (this.pendingRewards.pendingRewards.HIVE.amount || this.pendingRewards.pendingRewards.STEEM.amount || this.pendingRewards.pendingRewards.BLURT.amount) {
        if (!localStorage.getItem('preventRewardsPop')) {
          this.$refs['pendingRewardsKicker'].click();
        }
      }
    },
    openNewsModal(post) {
      this.$store.commit('setActiveNews', post)
      if (window.$ && typeof window.$.fn.modal === 'function') {
        $('#newsModal').modal('show');
      }
    },
    fetchUserData() {
      if (typeof this.user != 'undefined' && this.user != null) {
        this.$store.dispatch('fetchUserTokens')
        this.$store.dispatch('fetchUserRank')
        this.$store.dispatch('fetchUserReportCount')
        this.$store.dispatch('fetchReferrals')
        this.fetchUserPendingRewards();
      }
    },
    fetchUserPendingRewards() {
      fetch(process.env.actiAppUrl + 'pendingRewards/?user=' + this.user.account.name).then(
        res => {
          res.json().then(json => this.setPendingRewards(json)).catch(e => console.error(e))
        }).catch(e => console.error(e))
    },
    animator(){
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      });
      const sections = this.$el.querySelectorAll('.reveal, .fade-blur, .fade-scale');
      sections.forEach(section => {
        this.observer.observe(section);
      });
    }
  },
  async mounted() {
    console.log('main mounted');
    this.$store.dispatch('steemconnect/login')
    this.fetchUserData();
    this.animator();
    this.$store.dispatch('fetchRewardedActivityCount')
    this.$store.dispatch('fetchLeaderboard')
    this.$store.dispatch('fetchTopDelegators', 12)
    this.$store.dispatch('fetchNews')
    
    this.$store.dispatch('fetchReports', {bchain: this.bchain, more: false})
    this.renderReady = true;
  },
  async beforeDestroy() {
    if (this.$refs.pendingRewardsHider) {
        this.$refs.pendingRewardsHider.click();
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
</script>

<style lang="sass">
  .showcase .showcase-text
    padding: 3rem
  .showcase .showcase-img
    min-height: 30rem
    background-size: cover
    background-position: center
  .tilt
    transform: rotate(-15deg)

  /* Make carousel dots visible */
  .VueCarousel-dot-container
    margin-top: 20px !important
    .VueCarousel-dot
      background-color: rgba(0, 0, 0, 0.2) !important
      padding: 1px 5px !important
      &:focus
        outline: none !important
    .VueCarousel-dot--active
      background-color: #000 !important

  .navbar
    .navbar-nav
      .nav-link
        padding-right: .4rem
        padding-left: .4rem

  @media (min-width: 768px)
    .showcase .showcase-text
      padding: 7rem

  @media (max-width: 767px)
    .intro
      .headline
        font-size: 1.7rem
    .showcase
      .showcase-text
        padding: 2rem
        h2
          font-size: 1.5rem
        .lead
          font-size: 1.2rem
      .showcase-img
        min-height: 15rem
</style>
<style>
#navbar-container {

  position: relative;
  z-index: 1100; 
}

:root {
  
  --hero-content-bg: #f8f9fa;
  --hero-title-color: #212529;
  --hero-subtitle-color: #495057;
  --panel-bg: rgba(255, 255, 255, 0.85);
  --panel-border: rgba(0, 0, 0, 0.1);
  --panel-text-color: #212529;
  --panel-muted-text: #6c757d;
  --btn-secondary-color: #343a40;
  --btn-secondary-border: #ced4da;
  --btn-secondary-hover-bg: #e9ecef;
  --btn-secondary-hover-border: #adb5bd;
}

.dark-mode {
  /* Dark Mode */
  --hero-content-bg: #1a1a1a;
  --hero-title-color: #f0f0f0;
  --hero-subtitle-color: #a0a0a0;
  --panel-bg: rgba(40, 40, 40, 0.85);
  --panel-border: rgba(255, 255, 255, 0.15);
  --panel-text-color: #f0f0f0;
  --panel-muted-text: #a0a0a0;
  --btn-secondary-color: #f0f0f0;
  --btn-secondary-border: rgba(255, 255, 255, 0.5);
  --btn-secondary-hover-bg: rgba(255, 255, 255, 0.1);
  --btn-secondary-hover-border: #fff;
}

.hero-section {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex-basis: 45%;
  max-width: 600px;
  background: var(--hero-content-bg);
  color: var(--hero-title-color);
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: var(--hero-title-color);
}
.hero-title .text-brand {
  color: #e10707;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--hero-subtitle-color);
  max-width: 450px;
  margin-bottom: 2.5rem;
}

.hero-visual {
  flex: 1; 
  position: relative;
}

.hero-visual .hero-bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/img/header-5(2).png');
  background-size: cover;
  background-position: left center ;
}

.hero-visual-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, var(--hero-content-bg) 0%, transparent 40%);
  z-index: 1;
}

.user-panel {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item .label {
  font-size: 0.9rem;
  color: var(--panel-muted-text);
  margin-bottom: 0.25rem;
}

.stat-item .value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--panel-text-color);
  margin-bottom: 0.75rem;
}

.btn-panel-action {
  color: #e10707;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-panel-action:hover {
  color: #c10606;
  transform: translateX(4px);
}
.dark-mode .btn-panel-action:hover {
  color: #ff3d3d;
}
.btn-panel-action .fas {
  margin-left: 0.25rem;
}

.resource-stats {
  border-top: 1px solid var(--panel-border);
  border-bottom: 1px solid var(--panel-border);
  padding: 0.5rem 0;
  margin: 1.5rem 0;
}
.resource-stats .text-white { color: var(--panel-text-color) !important; }
.resource-stats .text-muted { color: var(--panel-muted-text) !important; }

.login-prompt {
  color: var(--panel-text-color);
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 500;
}
.main-actions-alt {
  text-align: center;
  margin-top: 1rem;
}

.main-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn-primary-hero, .btn-secondary-hero {
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.btn-primary-hero {
  background-color: #e10707;
  color: #fff !important;
}
.btn-primary-hero:hover {
  background-color: #c10606;
  transform: translateY(-2px);
}

.btn-secondary-hero {
  background-color: transparent;
  color: var(--btn-secondary-color) !important;
  border-color: var(--btn-secondary-border);
}
.btn-secondary-hero:hover {
  background-color: var(--btn-secondary-hover-bg);
  border-color: var(--btn-secondary-hover-border);
  transform: translateY(-2px);
}

.btn-link-hero {
  color: var(--panel-muted-text);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}
.btn-link-hero:hover {
  color: #e10707;
}

.scroll-down {
  bottom: 20px;
  z-index: 5;
  left: 0; 
}
.scroll-down a i {
  color: #fff;
  opacity: 0.7;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  transition: opacity 0.3s, transform 0.3s;
}
.scroll-down a:hover i {
  opacity: 1;
  transform: translateY(5px);
}

@media (max-width: 1200px) {
  .hero-content {
    flex-basis: 50%;
  }
  .hero-visual {
    flex-basis: 50%;
  }
}

@media (max-width: 992px) {
  .hero-section {
    flex-direction: column;
  }
  .hero-visual {
    order: 0; 
    flex-basis: auto;
    height: 40vh;
  }
  .hero-visual-overlay {
    background: linear-gradient(to top, var(--hero-content-bg) 0%, transparent 50%);
  }
  .hero-content {
    order: 1; 
    flex-basis: auto;
    max-width: 100%;
    padding: 2rem 1.5rem;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  .stats-grid, .main-actions {
    grid-template-columns: 1fr;
  }
}


section {
  margin-bottom: 2em;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}
section.aurora-showcase, section#news, section#recent-activity {
  box-shadow: none !important;
}
.acti-shadow {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}
.acti-shadow-inverse {
  box-shadow: 3px 3px 3px rgb(255 255 255 / 40%);
}

.intro {
  background-color: #0c0c14;
  position: relative;
  overflow: hidden;
  box-shadow: none !important;
}
.intro::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at center, rgba(225, 7, 7, 0.3), transparent 50%);
  animation: aurora-animation 35s linear infinite;
  z-index: 1;
}
.intro .container {
  position: relative;
  z-index: 2;
}
.intro .headline {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.3;
  color: transparent;
  background-image: linear-gradient(45deg, #e10707, #ff6b6b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.intro .lead {
  color: #424242; 
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.1rem; 
}
.dark-mode .intro .lead{
  color: #c6c4c4; 
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.1rem; 
}
@media (max-width: 767px) {
  .intro .headline {
    font-size: 2.2rem;
  }
}


#leaderboard {
  background-color: #f9fafb; 
  position: relative;
  overflow: hidden;
  transition: background-color 0.4s ease;
}

.dark-mode #leaderboard {
  background-color: #111827; 
}

#leaderboard .leaderboard-title {
  color: #1f2937; 
  transition: color 0.4s ease;
  font-weight: bold;
  font-size: 2.8rem;
  padding-bottom: 2rem;
}

.dark-mode #leaderboard .leaderboard-title {
  color: #f9fafb; 
}

.leaderboard-cta-btn {
  background-color: #e10707;
  color: white !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  padding: 0.5rem 1.25rem; 
  font-size: 0.95rem;      
  transition: all 0.3s ease;
  border: 2px solid #e10707;
}

.leaderboard-cta-btn:hover {
  background-color: #c10606;
  border-color: #c10606;
  transform: translateY(-2px);
  color: white !important;
}


#leaderboard .podium-column .username,
#leaderboard .podium-column .activity-count {
  color: #374151; 
  transition: color 0.4s ease;
}
#leaderboard .podium-column .username:hover,
#leaderboard .podium-column .activity-count:hover {
  color: #e10707; 
}

.dark-mode #leaderboard .podium-column .username,
.dark-mode #leaderboard .podium-column .activity-count {
  color: #d1d5db; 
}
.dark-mode #leaderboard .podium-column .username:hover,
.dark-mode #leaderboard .podium-column .activity-count:hover {
  color: #fff; 
}

.leaderboard-podium::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110%; 
  height: 100%;
  transform: translate(-50%, -45%); 
  background: radial-gradient(ellipse at center,
    rgba(225, 7, 7, 0.4),     
    rgba(134, 142, 150, 0.3), 
    transparent 65%         
  );
  filter: blur(45px); 
  z-index: -1;
  opacity: 0.9; 
  transition: all 0.4s ease;
}

.dark-mode .leaderboard-podium::after {
  background: radial-gradient(ellipse at center,
    rgba(255, 20, 20, 0.6),    
    rgba(173, 181, 189, 0.4), 
    transparent 60%
  );
  filter: blur(50px);
  opacity: 1; 
}


.leaderboard-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  position: relative;
  min-height: 350px;
  z-index: 1; 
}
.podium-column {
  flex: 1;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.podium-column .user-details {
  text-align: center;
  margin-bottom: 1rem;
}
.podium-column .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #eee;
  background-size: cover;
  background-position: center;
  margin: 0 auto 10px;
  border: 3px solid #fff;
}
.podium-column .username {
  font-weight: bold;
  text-decoration: none;
  font-size: 1.2rem;
  display: block;
}
.podium-column .activity-count {
  font-size: 0.9rem;
  margin: 0;
  text-decoration: none;
}
.podium-column .activity-count:hover {
  text-decoration: underline;
}
.podium-base {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px 8px 0 0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.podium-base .rank-number {
  font-size: 5rem;
  font-weight: bold;
  color: white;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.podium-base.gold {
  height: 150px;
  background: linear-gradient(to top, #d4af37, #f9d776);
  box-shadow: inset 0 3px 8px rgba(255, 255, 255, 0.4), 0 5px 15px rgba(0, 0, 0, 0.3);
}
.podium-base.silver {
  height: 120px;
  background: linear-gradient(to top, #c0c0c0, #e9e9e9);
  box-shadow: inset 0 3px 8px rgba(255, 255, 255, 0.5), 0 5px 10px rgba(0, 0, 0, 0.2);
}
.podium-base.bronze {
  height: 100px;
  background: linear-gradient(to top, #cd7f32, #e3a76f);
  box-shadow: inset 0 3px 8px rgba(255, 255, 255, 0.3), 0 5px 8px rgba(0, 0, 0, 0.2);
}
.medal-icon {
  position: absolute;
  top: -65px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: auto;
  z-index: 10;
}


.showcase-v3 {
  padding: 0;
  margin: 0;
}
.showcase-item {
  padding: 5rem 0;
  background-color: #f8f9fa; 
}
.showcase-item:nth-of-type(even) {
  background-color: #ffffff;
}
.showcase-item .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.showcase-text-content {
  text-align: left;
}
.showcase-text-content h2 {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #212529;
}
.showcase-text-content .lead {
  font-size: 1.1rem;
  color: #495057;
  line-height: 1.7;
}
.showcase-image-wrapper img {
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  filter: drop-shadow(0 0 20px rgba(225, 7, 7, 0.35));
  width: 100%;
}
#showcase-tokens-v3 .container {
  grid-template-areas: "image text";
}
#showcase-tokens-v3 .showcase-image-wrapper { grid-area: image; }
#showcase-tokens-v3 .showcase-text-content { grid-area: text; }
.exchange-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-start;
}
.exchange-tag {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #343a40;
  text-decoration: none;
  transition: all 0.3s ease;
}
.exchange-tag:hover {
  background-color: #e10707;
  color: white;
  transform: translateY(-2px);
}
.app-buttons-container img {
  height: 55px;
  transition: transform 0.3s;
}
.app-buttons-container img:hover {
  transform: scale(1.05);
}
.cta-button-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: flex-start;
}
.btn-solid-red, .btn-outline-red {
    padding: 0.8rem 2rem;
    border-radius: 8px;
    font-weight: bold;
    transition: all 0.3s ease;
    border: 2px solid #e10707;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.btn-solid-red {
    background-color: #e10707;
    color: white !important;
}
.btn-solid-red:hover {
    background-color: #c10606;
    border-color: #c10606;
    transform: translateY(-3px);
}
.btn-outline-red {
    background-color: transparent;
    color: #e10707 !important;
}
.btn-outline-red:hover {
    background-color: #e10707;
    color: white !important;
    transform: translateY(-3px);
}
@media (max-width: 991px) {
  .showcase-item .container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .showcase-text-content { order: 2; }
  .showcase-image-wrapper { order: 1; margin-bottom: 2rem; }
  #showcase-tokens-v3 .container { grid-template-areas: unset; }
  #showcase-tokens-v3 .showcase-text-content { order: 2; }
  #showcase-tokens-v3 .showcase-image-wrapper { order: 1; }
  .showcase-text-content, .cta-button-group, .exchange-tags-container {
    text-align: center;
    justify-content: center;
  }
}

#recent-activity {
  background-color: #ffffff;
}
#recent-activity .section-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #212529;
}
.activity-scroller {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem 1.5rem;
  margin: 0 -1.5rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.activity-scroller::-webkit-scrollbar {
  display: none;
}
.activity-post-card {
  flex: 0 0 280px;
  height: auto;
  background: white;
  border-radius: 16px;
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 25px rgba(225, 7, 7, 0.1);
  transition: all 0.3s ease;
}
.activity-post-card a.activity-card-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.activity-post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(225, 7, 7, 0.2);
}
.card-user-info {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 0.75rem;
}
.card-user-info .avatar {
  width: 35px;
  height: 35px;
  border: 2px solid #e10707;
}
.card-user-info .username {
  font-weight: 600;
  color: #343a40;
}
.card-image-bg {
  height: 150px;
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
}
.activity-post-card:hover .card-image-bg {
  transform: scale(1.05);
}
.card-post-content {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.activity-post-card .post-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #212529 !important; 
  transition: color 0.2s ease-in-out;
}
.activity-post-card:hover .post-title {
  color: #e10707 !important; 
}
.activity-post-card .post-title a {
  color: inherit !important;
  text-decoration: none;
}
.post-stats {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f1f1;
  font-weight: 600;
  color: #e10707 ;
  text-align: left;
}
.post-stats .fas {
  margin-right: 0.5rem;
}

.dark-mode #recent-activity {
  background-color: #121212;
}
.dark-mode #recent-activity .section-title,
.dark-mode #recent-activity .text-muted {
  color: #e9ecef;
}
.dark-mode .activity-post-card {
  background: #1e1e1e;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 30px rgba(225, 7, 7, 0.25);
}
.dark-mode .activity-post-card:hover {
  box-shadow: 0 15px 40px rgba(225, 7, 7, 0.35);
}
.dark-mode .card-user-info .username {
  color: #f8f9fa !important;
}
.dark-mode .activity-post-card .post-title {
  color: #f8f9fa !important; 
}
.dark-mode .activity-post-card:hover .post-title {
  color: #e10707 !important; 
}
.dark-mode .activity-post-card .post-title a {
  color: inherit !important;
}


.dark-mode .showcase-item {
  background-color: #000000; 
}
.dark-mode .showcase-item:nth-of-type(even) {
  background-color: #121212; 
}
.dark-mode .showcase-text-content h2 {
  color: #ffffff;
}
.dark-mode .showcase-text-content .lead {
  color: #adb5bd;
}
.dark-mode .exchange-tag {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f8f9fa;
}
.dark-mode .btn-outline-red {
  color: #e10707 !important;
  border-color: #e10707;
}
.dark-mode .btn-outline-red:hover {
    background-color: #e10707;
    color: white !important;
}
.dark-mode .showcase-image-wrapper img {
  filter: drop-shadow(0 0 25px rgba(225, 7, 7, 0.45)); 
}


@keyframes aurora-animation {
  0% { transform: rotate(0deg) scale(1.5); }
  50% { transform: rotate(180deg) scale(1.6); }
  100% { transform: rotate(360deg) scale(1.5); }
}

.aurora-showcase {
  position: relative;
  padding: 6rem 0;
  margin: 0;
  background-color: #f4f4f7; 
  overflow: hidden; 
}
.dark-mode .aurora-showcase {
  background-color: #0a0a0c; 
}


.aurora-showcase::before {
  content: '';
  position: absolute;
  top: -10%; right: -10%; bottom: -10%; left: -10%;
  z-index: 1;
  background: conic-gradient(
    from 90deg at 40% 60%,
    #e10707,      
    #434654,      
    #E0E0E0,      
    #B0B0C0,      
    #434654,      
    #e10707     
  );
  filter: blur(80px);
  opacity: 0.25;
  animation: aurora-animation 25s linear infinite;
}
.dark-mode .aurora-showcase::before {
  opacity: 0.3;
}

section#infrastructure {
  background-color: #0c0c14; 
  position: relative;
  overflow: hidden;
}

section#infrastructure::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  transform-origin: center;
  background: radial-gradient(circle at 30% 30%, #e10707, transparent 40%),
              radial-gradient(circle at 70% 70%, #C0C0C0, transparent 40%);
  filter: blur(100px);
  z-index: 1;
  opacity: 0.4;
  animation: aurora-animation 15s linear infinite;
}

#infrastructure .container {
  position: relative;
  z-index: 2; 
}

#infrastructure h1 {
  color: #212529;
}
.dark-mode #infrastructure h1 {
  color: #f0f0f0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

#infrastructure .infrastructure-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}

#infrastructure .infra-card {
  width: 170px;
  height: 170px;
  background: rgba(22, 22, 30, 0.25); 
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative; 
  overflow: hidden; 
}

#infrastructure .infra-card:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 0 25px rgba(225, 7, 7, 0.5); /* Red glow on hover */
  border-color: rgba(225, 7, 7, 0.4);
}

#infrastructure .logo-icon {
  max-height: 80px;
  max-width: 80%; 
  transition: opacity 0.4s ease-in-out;
  position: relative;
  z-index: 3; 
}

#infrastructure .hover-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  z-index: 2; /* Below the logo icon */
}

#infrastructure .infra-card:hover .logo-icon {
  opacity: 0;
}

#infrastructure .infra-card:hover .hover-image {
  opacity: 1;
}


#news {
  background-color: #f9fafb;
  padding: 4rem 0;
  margin-bottom: 2em;
  position: relative;
  overflow: hidden;
  transition: background-color 0.4s ease;
}
.dark-mode #news {
  background-color: #111827;
}

#news::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 100%;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center,
    rgba(225, 7, 7, 0.4),
    rgba(134, 142, 150, 0.3),
    transparent 70%
  );
  filter: blur(60px);
  z-index: 1;
  opacity: 1;
  transition: all 0.4s ease;
}
.dark-mode #news::before {
  background: radial-gradient(ellipse at center,
    rgba(255, 20, 20, 0.4),
    rgba(173, 181, 189, 0.3),
    transparent 65%
  );
  filter: blur(70px);
}
#news .VueCarousel-wrapper {
  border: none !important;
}
#news .container {
    position: relative;
    z-index: 2;
}
#news .news-title {
  color: #1f2937;
  font-size: 2.8rem;
  font-weight: normal;
}
.dark-mode #news .news-title {
    color: #f9fafb;
}
#news .VueCarousel-slide {
  padding: 10px;
}
.new-design-news-card {
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 12px;
  padding: 1rem;
  height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  box-shadow: 0 0 15px rgba(225, 7, 7, 0.5);
  transition: all 0.3s ease;
}
.new-design-news-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 5px 25px rgba(225, 7, 7, 0.6);
}
.new-design-news-card .card-content {
  flex-grow: 1;
}
.new-design-news-card .card-date {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}
.new-design-news-card .card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.new-design-news-card .card-actions {
  display: flex;
  gap: 10px;
}
.new-design-news-card .btn-news {
  flex: 1;
  background-color: #e10707;
  color: #fff;
  border: 1px solid #e10707;
  border-radius: 8px;
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease-in-out;
}
.new-design-news-card .btn-news:hover {
  background-color: #c10606;
  border-color: #c10606;
  transform: translateY(-1px);
}
.dark-mode #news .VueCarousel-dot {
    background-color: rgba(255, 255, 255, 0.3) !important;
}
.dark-mode #news .VueCarousel-dot--active {
    background-color: #fff !important;
}

.showcase-card {
  position: relative;
  z-index: 2;
  margin: 0 auto 5rem;
  max-width: 1140px;
  padding: 3rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px); /* Safari support */
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 16px 40px rgba(0,0,0,0.1);
}
.dark-mode .showcase-card {
  background: rgba(22, 22, 22, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 50px rgba(0,0,0,0.25);
}

.showcase-card:last-of-type {
  margin-bottom: 0;
}

.card-content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  align-items: center;
}

.showcase-card:nth-of-type(2) .card-content-grid .aurora-image-wrapper {
  order: 1;
}
.showcase-card:nth-of-type(2) .card-content-grid .aurora-text-content {
  order: 2;
}

.aurora-text-content h2 {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #1a202c;
}
.aurora-text-content .lead {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #4a5568;
}
.dark-mode .aurora-text-content h2 { color: #fff; }
.dark-mode .aurora-text-content .lead { color: #cbd5e0; }
.dark-mode .aurora-text-content h4 { color: #e2e8f0; }

/* The image styling with red glow */
.aurora-image-wrapper img {
  border-radius: 16px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  filter: drop-shadow(0px 10px 25px rgba(225, 7, 7, 0.4));
  transition: transform 0.4s ease, filter 0.4s ease;
}
.aurora-image-wrapper:hover img {
  transform: translateY(-5px) scale(1.02);
  filter: drop-shadow(0px 15px 30px rgba(225, 7, 7, 0.5));
}
.dark-mode .aurora-image-wrapper img {
  filter: drop-shadow(0px 10px 30px rgba(255, 61, 61, 0.45));
}
.dark-mode .aurora-image-wrapper:hover img {
  filter: drop-shadow(0px 15px 35px rgba(255, 61, 61, 0.55));
}


.showcase-card.reveal .card-content-grid > div {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1), opacity 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.showcase-card.reveal.active .card-content-grid > div {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.showcase-card.reveal.active .aurora-image-wrapper {
  transition-delay: 0.1s;
}
.showcase-card.reveal.active .aurora-text-content {
  transition-delay: 0.25s;
}


@media (max-width: 991px) {
  .card-content-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .showcase-card:nth-of-type(2) .card-content-grid .aurora-image-wrapper,
  .showcase-card:nth-of-type(2) .card-content-grid .aurora-text-content {
    order: unset; 
  }
  .aurora-text-content {
    text-align: center;
  }
  .exchange-tags-container, .cta-button-group, .app-buttons-container {
    justify-content: center;
  }
  .showcase-card {
    padding: 2rem;
  }
}

</style>