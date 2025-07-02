<template>
  <div class="home" ref="homePage">
    <!-- top anchor -->
    <a id="top"></a>
    <div id="navbar-container" ref="navbar-container" v-if="renderReady">
      <NavbarBrand :home="true" @scrollTo="scrollTo" />
    </div>
    <!-- header with fullscreen background -->
    <div class="header pt-4 pt-md-5 position-relative">
      <div class="container py-5">

        <!-- wallet/activities preview -->

        <div class="card form mx-auto p-3 mt-3 mt-md-2 text-center border-0 home-card shadow rounded">
          <div class="pb-md-2 text-center">
            <img src="/img/actifit_logo.png" alt="Actifit" class="logo" />
            <h1 class="mt-3 mt-sm-2 text-brand title">{{ $t('Actifit') }}</h1>
          </div>

          <div v-if="user">
            <div class="pb-md-2 row">
              <div class="col-sm-6">
                <p class="lead text-muted mb-0">{{ $t('Balance') }}</p>
                <h3><b>{{ numberFormat(formattedUserTokens, 3) }}</b><br><small>{{ $t('AFIT_Token') }}</small></h3>
                <a href="#" @click.prevent="$router.push('/wallet')" class="btn btn-lg btn-brand w-100 acti-shadow">{{
                  $t('My_Wallet') }}</a>
              </div>
              <div class="col-sm-6 mt-4 mt-sm-0">
                <p class="lead text-muted mb-0">{{ $t('Activity') }}</p>
                <h3><b>{{ grabUserReportCount }}</b><br><small>{{ $t('Reports') }}</small></h3>
                <a href="#" class="btn btn-lg btn-brand w-100 acti-shadow"
                  @click.prevent="$router.push('/activity/' + user.account.name)">{{ $t('My_Activity') }}</a>
              </div>
            </div>
            <div class="pb-md-2 row text-center">
              <SteemStats :user="user" class="col-md-12" :key="reload" />
            </div>
            <div class="pb-md-2 pt-2 row text-center">
              <div class="col-6 mb-3">
                <a href="#" class="btn btn-lg btn-brand w-100 acti-shadow"
                  @click.prevent="$router.push('/activity/')">{{ $t('activity_feed') }}</a>
              </div>
              <div class="col-6">
                <a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/market')">{{
                  $t('Market') }}</a>
              </div>
            </div>
          </div>

          <!-- login/register buttons -->
          <div v-else>
            <div class="row">
              <div class="col-6">
                <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc"
                  class="btn btn-brand btn-lg w-100 acti-shadow">{{ $t('Login') }}</a>
              </div>
              <div class="col-6">
                <a href="/signup" class="btn btn-brand btn-lg w-100 acti-shadow">{{ $t('Sign_Up') }}</a>
              </div>
            </div>
            <div class="row pb-md-2 pt-2 ">
              <div class="col-6">
                <a href="#" class="btn btn-lg btn-brand w-100 acti-shadow"
                  @click.prevent="$router.push('/activity/')">{{ $t('activity_feed') }}</a>
              </div>
              <div class="col-6">
                <a href="#" class="btn btn-lg btn-brand w-100 acti-shadow" @click.prevent="$router.push('/market/')">{{
                  $t('Market') }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- scroll indicator -->
      <div class="text-center scroll-down position-absolute w-100">
        <a href="#" @click="scrollTo('#content')">
          <i class="fas fa-2x text-light fa-chevron-down"></i>
        </a>
      </div>
    </div>
    <!-- intro -->
    <section class="intro reveal" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline" v-html="$t('homepage.section1_title')"></h1>
        <p class="lead mb-4 pb-5 text-center">
          {{ $t('homepage.section1_desc') }}
        </p>
      </div>
    </section>

    <!-- RECENT ACTIVITY SECTION -->
    <section id="recent-activity" class="py-5">
      <div class="container-fluid">
        <div class="text-center mb-5">
          <h1 class="section-title">Fresh Off The Track</h1>
          <p class="lead text-muted">See what our community has been up to!</p>
        </div>
        
        <div class="activity-scroller" v-if="posts.length > 0">
          <div class="activity-post-card" v-for="(post, index) in posts.slice(0, 10)" :key="'activity-' + index">
            <a :href="post.url" target="_blank" class="activity-card-link">
              <div class="card-user-info">
                <div class="avatar small" :style="'background-image: url(' + profImgUrl + '/u/' + post.author + '/avatar);'"></div>
                <span class="username">@{{ post.author }}</span>
              </div>
              <div class="card-post-content">
                <h5 class="post-title">{{ post.title }}</h5>
              </div>
              <div class="post-stats" v-if="post.json_metadata.activity_count">
                <i class="fas fa-shoe-prints"></i>
                <span>{{ numberFormat(post.json_metadata.activity_count, 0) }} Steps</span>
              </div>
            </a>
          </div>
        </div>
        <div v-else class="text-center text-muted">
          <p>Loading recent activities...</p>
        </div>
      </div>
    </section>

    <!-- texts with images  -->
    <section class="showcase-v3 reveal">
      <!-- Section 1: Earn Tokens -->
      <div class="showcase-item" id="showcase-earn-v3">
        <div class="container">
          <div class="showcase-text-content">
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
          <div class="showcase-image-wrapper">
            <img src="/img/landingimgs/healthier_you.jpeg" alt="Man and woman running" class="img-fluid" />
          </div>
        </div>
      </div>
      <!-- Section 2: AFIT Tokens -->
      <div class="showcase-item" id="showcase-tokens-v3">
          <div class="container">
              <div class="showcase-image-wrapper">
                 <img src="/img/landingimgs/actifit_gym_pay_back.jpeg" alt="Man exercising in a gym" class="img-fluid" />
              </div>
               <div class="showcase-text-content">
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
      <!-- Section 3: Yield Farming -->
      <div class="showcase-item" id="showcase-yield-v3">
          <div class="container">
              <div class="showcase-text-content">
                  <h2 class="text-capitalize">{{ $t('homepage.section4_title') }}</h2>
                  <p class="lead mb-4">{{ $t('homepage.section4_desc') }}</p>
                  <div class="cta-button-group">
                      <a href="/yieldfarming" class="btn btn-solid-red btn-lg"><i class="fas fa-leaf mr-2"></i>{{ $t('yield_farming') }}</a>
                      <a href="/wallet?action=delegate" class="btn btn-outline-red btn-lg"><i class="fas fa-hand-holding-usd mr-2"></i>{{ $t('Delegate') }}</a>
                  </div>
              </div>
              <div class="showcase-image-wrapper">
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
    <section id="leaderboard" class="py-5 bg-brand text-light reveal">
      <div class="container">
        <h1 class="leaderboard-title text-center">
          Daily Leaderboarrd
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
          <nuxt-link to="/leaderboard"
            class="text-center btn delegator-btn text-brand leader-cls-btn acti-shadow-inverse">{{
            $t('View_leaderboard') }}</nuxt-link>
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
            <img src="/img/HIVE.png" alt="HIVE" style="max-height: 80px;">
          </div>
          <div class="infra-card" :title="$t('secondary_chains')">
            <img src="/img/BLURT.png" alt="BLURT" style="max-height: 60px;">
          </div>
          <div class="infra-card" :title="$t('secondary_chains')">
            <img src="/img/BNB_CHAIN.webp" alt="BNB Chain" style="max-height: 60px;">
          </div>
        </div>
      </div>
    </section>

    <!-- news -->
    <section id="news" class="reveal py-5 bg-brand text-light">
      <h1 class="text-center pb-3">
        <i class="far fa-newspaper"></i><br>
        {{ $t('News') }}
      </h1>
      <div class="news-stack-container" v-if="news.length > 0">
        <div class="news-card-stack">
          <div 
            v-for="(post, index) in news" 
            :key="index" 
            :class="getCardClass(index)"
            class="news-card"
          >
            <div class="card-body d-flex flex-column">
              <a :href="post.url" target="_blank" class="news-card-image-link">
                <div class="news-card-image" :style="{ backgroundImage: 'url(' + (post.json_metadata.image ? post.json_metadata.image[0] : '/img/default_news.png') + ')' }"></div>
              </a>
              <div class="news-card-text-content">
                <h5 class="card-title mt-3">{{ post.title }}</h5>
                <p class="card-text">{{ post.json_metadata.description }}</p>
              </div>
              <div class="news-card-footer mt-auto">
                <small class="text-muted">{{ new Date(post.created).toDateString() }} | by @{{ post.author }}</small>
                <div class="button-group">
                  <a href="#" class="btn btn-sm" @click.prevent="openNewsModal(post)">{{ $t('Read_More') }}</a>
                  <a :href="post.url" target="_blank" class="btn btn-sm">{{ $t('Full_View') }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button @click="prevCard" class="nav-arrow prev-arrow" aria-label="Previous News Item">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button @click="nextCard" class="nav-arrow next-arrow" aria-label="Next News Item">
          <i class="fas fa-chevron-right"></i>
        </button>
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
// import News from '~/components/News' // No longer needed
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
    // News, // Removed
    NewsModal,
    SteemStats,
    NotifyModal,
    pendingRewardsModal,
  },
  data() {
    return {
      activeNewsIndex: 0,
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
    ...mapGetters(['userTokens', 'userReportCount', 'transactions', 'userRank', 'userCount', 'topDelegators', 'moderators', 'ambassadors', 'tokensDistributed', 'rewardedActivityCount', 'leaderboard', 'news', 'activeNews', 'posts', 'bchain']),
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
    nextCard() {
      this.activeNewsIndex = (this.activeNewsIndex + 1) % this.news.length;
    },
    prevCard() {
      this.activeNewsIndex = (this.activeNewsIndex - 1 + this.news.length) % this.news.length;
    },
    getCardClass(index) {
      const total = this.news.length;
      const active = this.activeNewsIndex;
      const next = (active + 1) % total;
      const prev = (active - 1 + total) % total;

      if (index === active) return 'is-active';
      if (index === next) return 'is-next';
      if (index === prev) return 'is-prev';
      return 'is-hidden';
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
    this.$store.dispatch('fetchPosts', {bchain: this.bchain, more: false})
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
  .header
    background: url('/img/header-5.png') top no-repeat
    background-size: cover
    .form
      max-width: 500px
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2)
  .scroll-down
    bottom: 10px
  .showcase .showcase-text
    padding: 3rem
  .showcase .showcase-img
    min-height: 30rem
    background-size: cover
    background-position: center
  .tilt
    transform: rotate(-15deg)

  .VueCarousel-dot-container
    padding: 15px !important
    .VueCarousel-dot
      padding: 1px 5px !important
      margin-top: 0 !important

  .navbar
    .navbar-nav
      .nav-link
        padding-right: .4rem
        padding-left: .4rem

  @media (min-width: 768px)
    .showcase .showcase-text
      padding: 7rem

  @media (max-width: 1200px)
    .header
      .form
        .logo
          max-width: 100px

  @media (max-width: 767px)
    .header
      .title
        font-size: 1.7rem
      .slogan
        font-size: 1.3rem
      .form-info
        font-size: 1rem
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
section {
  margin-bottom: 2em;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}
section.showcase-v3, section#leaderboard, section#news, section#infrastructure, section#recent-activity {
  box-shadow: none !important;
}
.acti-shadow {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}
.acti-shadow-inverse {
  box-shadow: 3px 3px 3px rgb(255 255 255 / 40%);
}
.leader-cls-btn:hover {
  background-color: darkred;
  color: white;
}
.home-card {
  opacity: 0.9;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%) !important;
}


.leaderboard-title {
    font-size: 2.8rem;
    font-weight: bold;
    color: white;
    padding-bottom: 2rem;
}
.leaderboard-podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  position: relative;
  min-height: 350px;
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
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  display: block;
}
.podium-column .activity-count {
  font-size: 0.9rem;
  color: white;
  margin: 0;
  text-decoration: none;
}
.podium-column .activity-count:hover {
  text-decoration: underline;
  color: white;
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

.news-stack-container {
  position: relative;
  max-width: 380px; 
  margin: 2rem auto 0;
  height: 450px; 
}
.news-card-stack {
  position: relative;
  width: 100%;
  height: 100%;
}
.news-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white; 
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.5s ease;
}
.news-card .card-body {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.news-card-image {
  height: 150px;
  background-size: cover;
  background-position: center;
}
.news-card-text-content {
  padding: 1rem 1.25rem;
  flex-grow: 1;
  overflow-y: auto;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #212529;
}
.card-text {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.5;
}
.news-card-footer {
  padding: 0.75rem 1.25rem;
  margin-top: auto;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}
.news-card-footer .button-group {
  display: flex;
  gap: 0.5rem;
}
.news-card-footer .btn {
  background-color: white !important;
  color: #e10707 !important;
  border: 2px solid #e10707 !important;
  border-radius: 50px !important;
  font-weight: bold !important;
  transition: all 0.3s ease;
  padding: 6px 14px !important;
  font-size: 0.8rem !important;
}
.news-card-footer .btn:hover {
  background-color: #e10707 !important;
  color: white !important;
}
.is-active {
  transform: translateY(0) scale(1);
  opacity: 1;
  z-index: 10;
}
.is-next {
  transform: translateY(20px) scale(0.9);
  opacity: 1;
  z-index: 9;
  filter: brightness(0.9);
}
.is-prev {
  transform: translateX(-150%) rotate(-30deg) scale(0.8);
  opacity: 0;
  z-index: 8;
}
.is-hidden {
  transform: scale(0.8);
  opacity: 0;
  z-index: 7;
}
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 45px;
  height: 45px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  color: #fff;
  transition: all 0.3s ease;
}
.nav-arrow:hover {
  background-color: #fff;
  color: #e10707;
  transform: translateY(-50%) scale(1.1);
}
.prev-arrow { left: -25px; }
.next-arrow { right: -25px; }


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

#infrastructure .infrastructure-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
}
#infrastructure .infra-card {
  width: 150px;
  height: 150px;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}
#infrastructure .infra-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
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

.dark-mode .news-card {
  background-color: #000000 !important; 
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.dark-mode .news-card .card-title,
.dark-mode .news-card .card-text,
.dark-mode .news-card .text-muted {
  color: #e9ecef !important;
}
.dark-mode .news-card-footer {
  border-top-color: rgba(255, 255, 255, 0.15);
  background-color: #000000;
}
.dark-mode .news-card-footer .btn {
  background-color: #e10707 !important;
  color: white !important;
  border: 2px solid #e10707 !important;
}
.dark-mode .news-card-footer .btn:hover {
  background-color: #c10606 !important;
  border-color: #c10606 !important;
}

</style>