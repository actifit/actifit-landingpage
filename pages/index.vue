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
            <!--<h3 class="font-italic text-brand slogan">{{ $t('Slogan') }}</h3>-->
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
            <!--<p class="lead py-md-3 form-info">Log in to see your current token balance, or sign up for a Steem account to start getting rewarded for your activity.</p>-->
            <div class="row">
              <div class="col-6">
                <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc"
                  class="btn btn-brand btn-lg w-100 acti-shadow">{{ $t('Login') }}</a>
                <!--<a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-100">{{ $t('Login') }}</a>-->
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
    <!--<transition type="animation">-->
    <section class="intro reveal" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline" v-html="$t('homepage.section1_title')"></h1>
        <p class="lead mb-4 pb-5 text-center">
          {{ $t('homepage.section1_desc') }}
        </p>

        <!-- stats -->
        <!--<div class="row pb-5">
          <div class="col text-center">
            <h1><i class="fas fa-coins"></i></h1>
            <h4>{{ $t('Tokens_Distributed') }}</h4>
            <h2 class="text-brand">{{ numberFormat(animatedTokensDistributed, 0) }} {{ $t('AFIT_Token') }}</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-users"></i></h1>
            <h4>{{ $t('Token_Holders') }}</h4>
            <h2 class="text-brand">{{ numberFormat(animatedUserCount, 0) }}</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-dumbbell"></i></h1>
            <h4>{{ $t('Rewarded_Activities') }}</h4>
            <h2 class="text-brand">{{ numberFormat(animatedRewardedActivityCount, 0) }}</h2>
          </div>
        </div>-->
      </div>
    </section>
    <!--</transition>-->

    <!-- texts with images -->
    <section class="showcase reveal">
      <div class="container-fluid p-0">

        <!-- app -->
        <div class="row no-gutters fade-blur">
          <div class="col-lg-6 order-lg-2 text-white showcase-img"
            style="background-image: url('/img/landingimgs/healthier_you.jpeg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">{{ $t('homepage.section2_title') }}</h2>
            <p class="lead mb-0" v-html="$t('homepage.section2_desc')"></p>
            <div class="text-center mt-5">
              <a href="https://links.actifit.io/android" target="_blank">
                <img src="/img/google-play.png" />
              </a>
              <br>
              <br>
              <a href="https://links.actifit.io/ios" target="_blank">
                <img src="/img/app-store.png" />
              </a>
            </div>
          </div>
        </div>

        <!-- use case -->
        <div class="row no-gutters fade-scale"><!--slide-in-left-->
          <div class="col-lg-6 text-white showcase-img" style="background-image: url('/img/landingimgs/actifit_gym_pay_back.jpeg');"></div>
          <div class="col-lg-6 my-auto showcase-text">
            <h2 class="text-capitalize">{{ $t('homepage.section3_title') }}</h2>
            <p class="lead mb-0" v-html="$t('homepage.section3_desc')">
            </p>
          </div>
        </div>

        <!-- delegation -->
        <div class="row no-gutters fade-blur"><!--slide-in-right-->
          <div class="col-lg-6 order-lg-2 text-white showcase-img rounded"
            style="background-image: url('/img/landingimgs/effort_rewarded_crypto.jpeg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text rounded">
            <h2 class="text-capitalize">{{ $t('homepage.section4_title') }}</h2>
            <p class="lead mb-0">{{ $t('homepage.section4_desc') }}</p>
            <div class="text-center row pt-2">
              <a href="/yieldfarming" class="btn btn-brand btn-lg w-50 border-light acti-shadow">{{ $t('yield_farming')
                }}</a>
              <a href="/wallet?action=delegate" class="btn btn-brand btn-lg w-50 border-light acti-shadow">{{
                $t('Delegate') }}</a>
            </div>
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
        <h1 class="text-center pb-5">
          <i class="fas fa-medal"></i><br>
          {{ $t('Daily_Leaderboard') }}
        </h1>
        <div class="row" v-if="leaderboard.length >= 3">
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>2.</h2>
              <a :href="leaderboard[1].username" target="_blank">
                <div class="avatar mx-auto mb-3"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[1].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a :href="leaderboard[1].username" target="_blank">{{ leaderboard[1].username }}</a><br />
              <a :href="leaderboard[1].username" target="_blank">{{ leaderboard[1].activity_count }} {{
                $t('Recorded_Activity') }}</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>1.</h2>
              <a :href="leaderboard[0].username" target="_blank">
                <div class="avatar mx-auto mb-3"
                  :style="'width: 200px; height: 200px; background-image: url(' + profImgUrl + '/u/' + leaderboard[0].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a :href="leaderboard[0].username" target="_blank">{{ leaderboard[0].username }}</a><br />
              <a :href="leaderboard[0].username" target="_blank">{{ leaderboard[0].activity_count }} {{
                $t('Recorded_Activity') }}</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>3.</h2>
              <a :href="leaderboard[2].username" target="_blank">
                <div class="avatar mx-auto mb-3"
                  :style="'width: 100px; height: 100px; background-image: url(' + profImgUrl + '/u/' + leaderboard[2].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a :href="leaderboard[2].username" target="_blank">{{ leaderboard[2].username }}</a><br />
              <a :href="leaderboard[2].username" target="_blank">{{ leaderboard[2].activity_count }} {{
                $t('Recorded_Activity') }}</a>
            </div>
          </div>
        </div>
        <div class="full-div">
          <nuxt-link to="/leaderboard"
            class="text-center btn delegator-btn text-brand mt-2 leader-cls-btn acti-shadow-inverse" data-target="#">{{
              $t('View_leaderboard') }}</nuxt-link>
        </div>
      </div>
    </section>


    <section id="infrastructure" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-cubes"></i><br>
          {{ $t('Infrastructure') }}
        </h1>
        <div class="row">
          <div class="col-12 text-center mb-4" :title="$t('main_chain')">
            <img src="/img/HIVE.png" style="max-height: 150px;"><br /><span class="font-weight-bold">{{ $t('HIVE')
              }}</span>
          </div>
        </div>
        <div class="row" :title="$t('secondary_chains')">
          <div class="col-6 text-center mb-4">
            <img src="/img/BLURT.png" style="max-height: 100px;"><br /><span class="font-weight-bold">{{ $t('BLURT')
              }}</span>
          </div>

          <div class="col-6 text-center mb-4">
            <img src="/img/BNB_CHAIN.webp" style="max-height: 100px;"><br /><span class="font-weight-bold">{{
              $t('BNB_CHAIN')}}</span>
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
      <client-only>
        <carousel :perPageCustom="[[0, 1], [768, 2], [1024, 3], [1280, 4]]"
          :paginationColor="'rgba(255, 255, 255, 0.5)'" :paginationActiveColor="'#fff'">
          <slide v-for="(post, index) in news" :post="post" :key="index">
            <News :post="post" />
          </slide>
        </carousel>
      </client-only>
    </section>


    <Footer isHomePage='true' />

    <!-- <FriendshipModal v-if="user"/> -->

    <NewsModal :news="activeNews" />
    <NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')" />
    <NotifyModal id="notifyModalRC" ref="notifyModalRC" :modalTitle="$t('Actifit_Info')" :modalText="$t('RC_desc')" />
    <LoginModal v-if="showModal" @close="showModal = false" />

    <!--<CompetitionAnnounce />-->

    <pendingRewardsModal :pendingRewards="pendingRewards" :username="user" />

    <a id="pendingRewardsKicker" name="pendingRewardsKicker" ref="pendingRewardsKicker" class="btn btn-white"
      data-toggle="modal" data-target="#pendingRewardsModal"></a>

    <a id="pendingRewardsHider" name="pendingRewardsHider" ref="pendingRewardsHider" class="btn btn-white"
      data-toggle="dismiss" data-target="#pendingRewardsModal"></a>
  </div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import VueScrollTo from 'vue-scrollto' // for smooth scrolling
import Footer from '~/components/Footer'
import News from '~/components/News'
import NewsModal from '~/components/NewsModal'
import pendingRewardsModal from '~/components/PendingRewardsModal'
import { mapGetters } from 'vuex'
import SteemStats from '~/components/SteemStats'
import NotifyModal from '~/components/NotifyModal'
import LoginModal from '~/components/LoginModal'

//import FriendshipModal from '~/components/FriendshipModal'

//import CompetitionAnnounce from '~/components/CompetitionAnnounce'

export default {
  components: {
    LoginModal,
    NavbarBrand,
    Footer,
    News,
    NewsModal,
    SteemStats,
    NotifyModal,
    pendingRewardsModal
    //,FriendshipModal
    //,CompetitionAnnounce
  },
  data() {
    return {
      showModal: false,
      username: '', // username whose funds to show
      // animated numbers
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
    ...mapGetters(['userTokens', 'userReportCount', 'transactions', 'userRank', 'userCount', 'topDelegators', 'moderators', 'ambassadors', 'tokensDistributed', 'rewardedActivityCount', 'leaderboard', 'news', 'activeNews', 'bchain']),
    formattedUserTokens() {
      return parseFloat(this.userTokens).toFixed(3)
    },

    grabUserReportCount() {
      return this.userReportCount
    },

    displayUserRank() {
      return this.userRank
    },

    // animated numbers
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
  // watchers to update animated numbers
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
    /**
     * Scrolls down to content area.
     */
    scrollTo(target) {
      VueScrollTo.scrollTo(target, 1000, { easing: 'ease-in-out' })
    },

    /**
     * Formats numbers with commas and dots.
     *
     * @param number
   * @param precision
     * @returns {string}
     */
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    showModalFunc() {
      this.$nextTick(() => {
        this.showModal = true;
        // If you're still using jQuery, make sure it's properly imported
        if ($ && typeof $.fn.modal === 'function') {
          $('#loginModal').modal('show');
        }
      });
    },

    async setPendingRewards(json) {
      //console.log(json);
      this.pendingRewards = json;
      //console.log(this.pendingRewards);
      if (this.pendingRewards.pendingRewards.HIVE.amount || this.pendingRewards.pendingRewards.STEEM.amount || this.pendingRewards.pendingRewards.BLURT.amount) {
        //console.log('got results');
        //console.log(this.pendingRewards);

        //only show if user has not opted out
        if (!localStorage.getItem('preventRewardsPop')) {
          this.$refs['pendingRewardsKicker'].click();
        }
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
      //let's check if user already has a funds pass set

      fetch(process.env.actiAppUrl + 'pendingRewards/?user=' + this.user.account.name).then(
        res => {
          res.json().then(json => this.setPendingRewards(json)).catch(e => reject(e))
        }).catch(e => reject(e))
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

      // Observe all sections with the "reveal" class
      const sections = this.$el.querySelectorAll('.reveal, .fade-blur, .fade-scale');//.slide-in-left, .slide-in-right');
      sections.forEach(section => {
        this.observer.observe(section);
      });
    }
  },
  async mounted() {
    // login
    console.log('main mounted');
    this.$store.dispatch('steemconnect/login')
    this.fetchUserData();


    //prepare animations
    this.animator();

    // fetch data
    this.$store.dispatch('fetchRewardedActivityCount')
    this.$store.dispatch('fetchLeaderboard')

    //this.$store.dispatch('fetchTokenInfo')

    //grab top 12 delegators
    this.$store.dispatch('fetchTopDelegators', 12)

    //grab team listing
    //this.$store.dispatch('fetchModerators')
    //this.$store.dispatch('fetchAmbassadors')

    this.$store.dispatch('fetchNews')

    //dynamically add the navbar to avoid multiple calls into it
    this.renderReady = true;


  },
  async beforeDestory() {
    this.$refs['pendingRewardsHider'].click();
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
.header {
  background-repeat: no-repeat;
  /* box-shadow: 5px 0px 5px rgb(255 0 0 / 50%), 0px 5px 5px rgb(255 0 0 / 50%); */
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  /* min-height: 100% */
}

section {
  margin-bottom: 0.2em;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  /* box-shadow: 5px 0px 5px rgb(255 0 0 / 50%), 0px 5px 5px rgb(255 0 0 / 50%); */
}

section.showcase {
  box-shadow: none;
}

.showcase .showcase-img {
  padding: 2px;
}

.acti-shadow {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.acti-shadow-inverse {
  box-shadow: 3px 3px 3px rgb(255 255 255 / 40%);
}

.showcase .showcase-text,
.showcase .showcase-img {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  /* box-shadow: 5px 0px 5px rgb(255 0 0 / 50%), 0px 5px 5px rgb(255 0 0 / 50%); */
}

.home-card {
  opacity: 0.9;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%) !important;
}

.avatar-hive {
  border-color: red;
}


.avatar-steem {
  border-color: lightblue;
}

.user-menu .user-avatar {
  float: right;
}

.leader-cls-btn:hover {
  background-color: darkred;
  color: white;
}

.bold-content {
  font-weight: bold;
}


</style>
