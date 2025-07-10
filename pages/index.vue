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
            {{ $t('IT_PAYS_TO') }} <span class="text-brand">{{ $t('BE_FIT') }}</span>
          </h1>
          <p class="hero-subtitle">
            {{ $t('subtitle') }}
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
            <p class="login-prompt">{{ $t('prompt') }}</p>
            <div class="main-actions">
                <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc" class="btn btn-primary-hero">{{ $t('Login') }}</a>
                <a href="/signup" class="btn btn-secondary-hero">{{ $t('Sign_Up') }}</a>
            </div>
            <div class="main-actions-alt">
              <a href="#" class="btn-link-hero" @click.prevent="$router.push('/activity/')">{{ $t('Explore_Activity_Feed') }} <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Visual Image -->
      <div class="hero-visual">
        <div class="hero-bg-image"></div>
        <div class="hero-visual-overlay"></div>
      </div>
    </div>

    <!-- RECENT ACTIVITY SECTION -->
    <section id="recent-activity" class="py-5">
      <div class="container-fluid">
        <div class="text-center mb-5">
          <h1 class="section-title">{{ $t('fresh') }}</h1>
          <p class="lead text-muted">{{ $t('community') }}</p>
        </div>

        <div v-if="!isLoadingReports && fullReports.length > 0">
          <div class="delegator-scroller-wrapper">
              <div class="custom-scroller" ref="activityScroller">
                  <div class="custom-scroller-inner">
                      <!-- MODIFIED CARD STRUCTURE (GRADIENT DIV REMOVED) -->
                      <div v-for="(report, index) in fullReports" :key="'activity-' + index" class="activity-card-scroller-item">
                          <div class="activity-post-card h-100" :style="getCardBackground(report)">
                              <a :href="report.url" target="_blank" class="activity-card-link-overlay" :title="report.title || 'View Post'"></a>
                              <!-- Gradient is now applied via CSS pseudo-element -->
                              <div class="activity-card-content">
                                  <div class="card-user-info">
                                      <div class="avatar small" :style="'background-image: url(' + profImgUrl + '/u/' + report.author + '/avatar);'"></div>
                                      <span class="username">@{{ report.author }}</span>
                                  </div>
                                  <div>
                                    <div class="card-post-content">
                                        <p class="post-excerpt">{{ createExcerpt(report.body, 80) }}</p>
                                    </div>
                                    <div class="post-stats" v-if="report.json_metadata && report.json_metadata.step_count">
                                        <span class="step-count"><i class="fas fa-shoe-prints"></i> {{ numberFormat(report.json_metadata.step_count, 0) }}</span>
                                        <span class="post-date">{{ toRelativeTime(report.created) }}</span>
                                    </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <button 
                  class="scroller-nav scroller-nav-left" 
                  :class="{ 'disabled': !activityCanScrollLeft }"
                  @click="scrollActivity(-1)" 
                  :aria-label="$t('aria.scroll_left')">
                  <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                  class="scroller-nav scroller-nav-right" 
                  :class="{ 'disabled': !activityCanScrollRight }"
                  @click="scrollActivity(1)" 
                  :aria-label="$t('aria.scroll_right')">
                  <i class="fas fa-chevron-right"></i>
              </button>
          </div>
        </div>
        <div v-else class="text-center text-muted">
          <p>{{ $t('loading_activities') }}</p>
        </div>
        <div class="full-div mt-5 text-center">
          <nuxt-link to="/activity/" class="btn btn-primary-hero">{{ $t('view_more_activities') }}</nuxt-link>
        </div>
      </div>
    </section>
    
    <!-- INTRO SECTION - NEW ANIMATED FRAME DESIGN -->
    <section class="intro reveal" id="content">
      <div class="intro-showcase-container">
        <img src="/img/logo.png" alt="Actifit Logo" class="intro-logo" />
        <h1 class="headline">
          {{ $t('Actifit_title') }}
        </h1>
        <p class="lead">
          {{ $t('Actifit_subtitle') }}
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
            <p class="lead mb-4" v-html="$t('homepage.section2_desc')"></p>
            <div class="app-buttons-container">
              <a href="https://links.actifit.io/android" target="_blank">
                <img src="/img/google-play.png" :alt="$t('alt_texts.google_play')">
              </a>
              <a href="https://links.actifit.io/ios" target="_blank">
                <img src="/img/app-store.png" :alt="$t('alt_texts.app_store')">
              </a>
            </div>
          </div>
          <div class="aurora-image-wrapper">
            <img src="/img/landingimgs/healthier_you.jpeg" :alt="$t('alt_texts.running_couple')" class="img-fluid" />
          </div>
        </div>
      </div>

      <!-- Showcase Item 2: AFIT Tokens -->
      <div class="showcase-card reveal">
        <div class="card-content-grid">
           <div class="aurora-image-wrapper">
             <img src="/img/landingimgs/actifit_gym_pay_back.jpeg" :alt="$t('alt_texts.gym_workout')" class="img-fluid" />
          </div>
           <div class="aurora-text-content">
              <h2 class="text-capitalize">{{ $t('homepage.section3_title') }}</h2>
              <p class="lead" v-html="$t('homepage.section3_desc')"></p>
              
              <h4 class="mt-4 mb-3">{{ $t('available_on') }}</h4>
              <div class="exchange-tags-container">
                  <a href="#" class="exchange-tag"><i class="fas fa-coins mr-2"></i>{{ $t('exchanges.hive_engine') }}</a>
                  <a href="#" class="exchange-tag"><i class="fas fa-fire-alt mr-2"></i>{{ $t('exchanges.actifit_defi') }}</a>
                  <a href="#" class="exchange-tag"><i class="fas fa-sync-alt mr-2"></i>{{ $t('exchanges.pancakeswap') }}</a>
                  <a href="#" class="exchange-tag"><i class="fas fa-chart-line mr-2"></i>{{ $t('exchanges.digifinex') }}</a>
                  <a href="#" class="exchange-tag"><i class="fas fa-exchange-alt mr-2"></i>{{ $t('exchanges.dex_trade') }}</a>
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
             <img src="/img/landingimgs/effort_rewarded_crypto.jpeg" :alt="$t('alt_texts.post_workout_pose')" class="img-fluid" />
          </div>
        </div>
      </div>

    </section>

    <!-- DELEGATORS SECTION -->
    <section id="delegators" class="py-5 delegator-aurora-bg reveal">
      <div class="container-fluid">
        <div class="text-center mb-5">
          <h1 class="section-title">
            <i class="fas fa-heart text-brand"></i><br>
            {{ $t('our_top_supporters') }}
          </h1>
          <p class="lead text-muted">{{ $t('top_supporters_desc') }}</p>
        </div>
        <div v-if="!isLoadingDelegators && enrichedDelegators.length > 0">
          <div class="delegator-scroller-wrapper">
            <div class="custom-scroller" ref="delegatorScroller">
              <div class="custom-scroller-inner">
                <div v-for="(delegator, index) in enrichedDelegators" :key="'hive' + index" class="delegator-card">
                    <div class="card-header">
                      <a :href="'https://ecency.com/@' + delegator._id" target="_blank" class="delegator-avatar-link">
                          <div class="avatar-glow"></div>
                          <div class="avatar large" :style="'background-image: url(' + profImgUrl + '/u/' + delegator._id + '/avatar);'"></div>
                      </a>
                      <a :href="'https://ecency.com/@' + delegator._id" target="_blank" class="username">@{{ delegator._id }}</a>
                    </div>
                    <div class="card-body">
                        <a :href="'https://ecency.com/@' + delegator._id + '/wallet'" target="_blank" class="stat-row">
                            <i class="fas fa-power-off text-brand"></i>
                            <span>{{ numberFormat(delegator.steem_power, 0) }} {{ $t('HP_short') }}</span>
                        </a>
                        <div class="stat-row">
                            <i class="fas fa-coins text-muted"></i>
                            <span class="text-muted">~{{ delegator.daily_earnings }} {{ $t('daily_afit_earnings') }}</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
            <button 
              class="scroller-nav scroller-nav-left" 
              :class="{ 'disabled': !canScrollLeft }"
              @click="scrollDelegators(-1)" 
              :aria-label="$t('aria.scroll_left')">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              class="scroller-nav scroller-nav-right" 
              :class="{ 'disabled': !canScrollRight }"
              @click="scrollDelegators(1)" 
              :aria-label="$t('aria.scroll_right')">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
         <div v-else class="text-center text-muted">
          <p>{{ $t('loading_supporters') }}</p>
        </div>
        <div class="full-div mt-5 text-center">
            <nuxt-link to="/delegators" class="btn btn-primary-hero">{{ $t('View_All_Delegators') }}</nuxt-link>
        </div>
      </div>
    </section>

    <!-- leaderboard -->
    <section id="leaderboard" class="py-5 reveal">
      <div class="container">
        <h1 class="leaderboard-title text-center">
          {{ $t('Daily_Leaderboard') }}
        </h1>
        <div class="leaderboard-podium" v-if="leaderboard && leaderboard.length >= 3 && leaderboardPosts.length >= 3">
          
          <!-- 1st Place Column (now first in HTML) -->
          <div class="podium-column is-first">
            <img src="/img/1st_place_medal.svg" class="medal-icon" :alt="$t('alt_texts.gold_medal')">
            <a v-if="leaderboardPosts[0] && leaderboardPosts[0].imageUrl" :href="leaderboardPosts[0].postUrl" target="_blank" class="podium-post-link">
              <div class="podium-post-image" :style="{ backgroundImage: 'url(' + leaderboardPosts[0].imageUrl + ')' }"></div>
            </a>
            <div v-else class="podium-post-image-placeholder"></div>

            <div class="user-details">
              <a :href="'/activity/' + leaderboard[0].username.replace('@', '')" target="_blank">
                <div class="avatar"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[0].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a class="username" :href="'/activity/' + leaderboard[0].username.replace('@', '')" target="_blank">{{
                leaderboard[0].username.replace('@','') }}</a>
              <a :href="leaderboardPosts[0] ? leaderboardPosts[0].postUrl : '#'" target="_blank" class="activity-count">{{ leaderboard[0].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
            <div class="podium-base gold">
              <span class="rank-number">1</span>
            </div>
          </div>
          
          <!-- 2nd Place Column (now second in HTML) -->
          <div class="podium-column is-second">
            <a v-if="leaderboardPosts[1] && leaderboardPosts[1].imageUrl" :href="leaderboardPosts[1].postUrl" target="_blank" class="podium-post-link">
              <div class="podium-post-image" :style="{ backgroundImage: 'url(' + leaderboardPosts[1].imageUrl + ')' }"></div>
            </a>
            <div v-else class="podium-post-image-placeholder"></div>

            <div class="user-details">
              <a :href="'/activity/' + leaderboard[1].username.replace('@', '')" target="_blank">
                <div class="avatar"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[1].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a class="username" :href="'/activity/' + leaderboard[1].username.replace('@', '')" target="_blank">{{
                leaderboard[1].username.replace('@','') }}</a>
              <a :href="leaderboardPosts[1] ? leaderboardPosts[1].postUrl : '#'" target="_blank" class="activity-count">{{ leaderboard[1].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
            <div class="podium-base silver">
              <span class="rank-number">2</span>
            </div>
          </div>
          
          <!-- 3rd Place Column (now third in HTML) -->
          <div class="podium-column is-third">
            <a v-if="leaderboardPosts[2] && leaderboardPosts[2].imageUrl" :href="leaderboardPosts[2].postUrl" target="_blank" class="podium-post-link">
              <div class="podium-post-image" :style="{ backgroundImage: 'url(' + leaderboardPosts[2].imageUrl + ')' }"></div>
            </a>
            <div v-else class="podium-post-image-placeholder"></div>

            <div class="user-details">
              <a :href="'/activity/' + leaderboard[2].username.replace('@', '')" target="_blank">
                <div class="avatar"
                  :style="'background-image: url(' + profImgUrl + '/u/' + leaderboard[2].username.replace('@', '') + '/avatar);'">
                </div>
              </a>
              <a class="username" :href="'/activity/' + leaderboard[2].username.replace('@', '')" target="_blank">{{
                leaderboard[2].username.replace('@','') }}</a>
              <a :href="leaderboardPosts[2] ? leaderboardPosts[2].postUrl : '#'" target="_blank" class="activity-count">{{ leaderboard[2].activity_count }} {{ $t('Recorded_Activity') }}</a>
            </div>
            <div class="podium-base bronze">
              <span class="rank-number">3</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-5">
          <p>{{ $t('loading_leaderboard') }}</p>
        </div>
        <div class="full-div mt-5 text-center">
          <nuxt-link to="/leaderboard" class="btn btn-primary-hero">{{ $t('View_leaderboard') }}</nuxt-link>
        </div>
      </div>
    </section>

    <!---infrastructure-->
    <section id="infrastructure" class="py-5">
      <div class="container">
        <div class="text-center mb-5">
          <h1 class="section-title">
            <i class="fas fa-cubes text-brand"></i><br>
            {{ $t('Infrastructure') }}
          </h1>
        </div>
        <div class="infrastructure-grid">
          <div class="priority-line">
            <div class="infra-card" :title="$t('main_chain')">
              <img class="logo-icon" src="/img/HIVE.png" :alt="$t('alt_texts.hive_logo')">
              <div class="hover-image" :style="'background-image: url(\'https://placehold.co/400x400/e10707/ffffff?text=' + $t('placeholders.hive') + '\');'"></div>
            </div>
          </div>
          <div class="secondary-line">
            <div class="infra-card" :title="$t('secondary_chains')">
              <img class="logo-icon" src="/img/BLURT.png" :alt="$t('alt_texts.blurt_logo')">
              <div class="hover-image" :style="'background-image: url(\'https://placehold.co/400x400/333333/ffffff?text=' + $t('placeholders.blurt') + '\');'"></div>
            </div>
            <div class="infra-card" :title="$t('secondary_chains')">
              <img class="logo-icon" src="/img/BNB_CHAIN.webp" :alt="$t('alt_texts.bnb_logo')">
              <div class="hover-image" :style="'background-image: url(\'https://placehold.co/400x400/f0b90b/000000?text=' + encodeURIComponent($t('placeholders.bnb_chain')) + '\');'"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEWS SECTION -->
    <section id="news" class="reveal py-5">
        <div class="container-fluid">
            <div class="text-center mb-5">
                <h1 class="section-title">
                    <i class="far fa-newspaper text-brand"></i><br>
                    {{ $t('News') }}
                </h1>
            </div>
            <div v-if="news && news.length > 0">
                <div class="delegator-scroller-wrapper">
                    <div class="custom-scroller" ref="newsScroller">
                        <div class="custom-scroller-inner">
                            <div v-for="(post, index) in news" :key="'news-' + index" class="news-card-scroller-item">
                                <div class="new-design-news-card h-100">
                                    <div class="card-content">
                                        <small class="card-date">{{ new Date(post.created).toLocaleString() }}</small>
                                        <h5 class="card-title">{{ post.title }}</h5>
                                    </div>
                                    <div class="card-actions">
                                        <a href="#" class="btn-news" @click.prevent="openNewsModal(post)">{{ $t('Read_more') }}</a>
                                        <a href="#" class="btn-news" @click.prevent="$router.push(post.url)">{{ $t('Full_view') }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        class="scroller-nav scroller-nav-left" 
                        :class="{ 'disabled': !newsCanScrollLeft }"
                        @click="scrollNews(-1)" 
                        :aria-label="$t('aria.scroll_left')">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        class="scroller-nav scroller-nav-right" 
                        :class="{ 'disabled': !newsCanScrollRight }"
                        @click="scrollNews(1)" 
                        :aria-label="$t('aria.scroll_right')">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
            <div v-else class="text-center text-muted">
                <p>{{ $t('loading_news') }}</p>
            </div>
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
import hive from '@hiveio/hive-js';
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
      fullReports: [],
      isLoadingReports: true,
      enrichedDelegators: [],
      isLoadingDelegators: true,
      canScrollLeft: false, 
      canScrollRight: true,
      newsCanScrollLeft: false,
      newsCanScrollRight: true,
      activityCanScrollLeft: false,
      activityCanScrollRight: true,
      delegationRewards: [], // To store fetched delegation rewards
      leaderboardPosts: [], // To store post data for the top 3 leaders
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
    topDelegators(newDelegators) {
      if (newDelegators && newDelegators.hive && newDelegators.hive.length > 0) {
        this.enrichDelegatorData(newDelegators.hive);
      }
    },
    enrichedDelegators(newVal) {
      if (newVal.length > 0) {
        this.$nextTick(() => {
          this.updateDelegatorScrollState();
        });
      }
    },
    news(newVal) {
      if (newVal && newVal.length > 0) {
        this.$nextTick(() => {
          this.updateNewsScrollState();
        });
      }
    },
    fullReports(newVal) {
      if (newVal.length > 0) {
        this.$nextTick(() => {
          this.updateActivityScrollState();
        });
      }
    },
    leaderboard(newLeaderboard) {
      if (newLeaderboard && newLeaderboard.length > 0) {
        this.fetchLeaderboardPosts(newLeaderboard);
      }
    },
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
    getCardBackground(report) {
        const imageUrl = this.extractPostImage(report);
        if (imageUrl) {
            return { 
                backgroundImage: `url(${imageUrl})` 
            };
        }
        return {}; // Use default CSS background if no image
    },
    enrichDelegatorData(delegators) {
      this.isLoadingDelegators = true;
      const enriched = delegators.map(d => {
        const rewardData = this.delegationRewards.find(reward => reward.user === d._id);
        const dailyEarnings = rewardData ? this.numberFormat(rewardData.token_count, 2) : '...';
        return {
          ...d,
          daily_earnings: dailyEarnings
        };
      });
      this.enrichedDelegators = enriched;
      this.isLoadingDelegators = false;
    },
    async fetchDelegationRewards() {
      try {
        const response = await fetch(process.env.actiAppUrl + 'transactionsByType?type=Delegation&sortByToken=-1');
        const rewards = await response.json();
        this.delegationRewards = rewards;
        if (this.topDelegators && this.topDelegators.hive && this.topDelegators.hive.length > 0) {
          this.enrichDelegatorData(this.topDelegators.hive);
        }
      } catch (error) {
        console.error('Failed to fetch delegation rewards:', error);
      }
    },
    async fetchAndHydrateHomepageReports() {
      this.isLoadingReports = true;
      try {
        const query = {
          sort: 'created',
          tag: 'actifit',
          limit: 20
        };
        const posts = await hive.api.callAsync('bridge.get_ranked_posts', query);
        if (posts && posts.length > 0) {
          const processedReports = posts.map(post => {
            if (post && post.json_metadata) {
              try {
                if (typeof post.json_metadata === 'string') {
                  post.json_metadata = JSON.parse(post.json_metadata);
                }
              } catch (e) {
                post.json_metadata = {};
              }
            }
            return post;
          }).filter(post => post.json_metadata && post.json_metadata.hasOwnProperty('step_count'));
          this.fullReports = processedReports;
        }
      } catch (error) {
        console.error("Failed to fetch homepage reports:", error);
        this.fullReports = [];
      } finally {
        this.isLoadingReports = false;
      }
    },
    toRelativeTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      const now = new Date();
      const seconds = Math.round((now - date) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);

      if (seconds < 60) {
        return 'just now';
      } else if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else {
        return `${days}d ago`;
      }
    },
    async fetchLeaderboardPosts(leaderboard) {
      if (!leaderboard || leaderboard.length < 3) return;

      const top3Users = leaderboard.slice(0, 3);
      
      const postPromises = top3Users.map(async (user) => {
        const username = user.username.replace('@', '');
        try {
          // Fetch the user's most recent post
          const userPosts = await hive.api.callAsync('bridge.get_account_posts', { sort: 'posts', account: username, limit: 1 });
          
          if (userPosts && userPosts.length > 0) {
            const post = userPosts[0];
            const imageUrl = this.extractPostImage(post);
            const postUrl = `/${post.author}/${post.permlink}`; // Internal link to the post
            return { imageUrl, postUrl, title: post.title };
          }
          return null; // No post found
        } catch (error) {
          console.error(`Failed to fetch post for ${username}`, error);
          return null; 
        }
      });

      this.leaderboardPosts = await Promise.all(postPromises);
    },
    extractPostImage(post) {
        if (!post) return null;
        try {
            const meta = typeof post.json_metadata === 'string' 
                ? JSON.parse(post.json_metadata) 
                : post.json_metadata;
            
            if (meta && meta.image && Array.isArray(meta.image) && meta.image.length > 0 && meta.image[0]) {
                return meta.image[0];
            }
        } catch (e) { /* Ignore metadata parsing errors */ }
        
        if (post.body) {
          const match = post.body.match(/https?:\/\/[^)\s]+\.(?:png|jpg|jpeg|gif|webp)/i);
          if (match) return match[0];
        }
        
        return null; 
    },
    scrollDelegators(direction) {
      if ((direction === -1 && !this.canScrollLeft) || (direction === 1 && !this.canScrollRight)) {
        return;
      }
      const scroller = this.$refs.delegatorScroller;
      if (scroller) {
        const scrollAmount = scroller.clientWidth * 0.8;
        scroller.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        setTimeout(() => { this.updateDelegatorScrollState(); }, 400);
      }
    },
    updateDelegatorScrollState() {
      const scroller = this.$refs.delegatorScroller;
      if (scroller) {
        const atStart = scroller.scrollLeft < 1;
        const atEnd = Math.ceil(scroller.scrollLeft + scroller.clientWidth) >= scroller.scrollWidth;
        this.canScrollLeft = !atStart;
        this.canScrollRight = !atEnd;
      }
    },
    scrollNews(direction) {
      if ((direction === -1 && !this.newsCanScrollLeft) || (direction === 1 && !this.newsCanScrollRight)) {
        return;
      }
      const scroller = this.$refs.newsScroller;
      if (scroller) {
        const scrollAmount = scroller.clientWidth * 0.8;
        scroller.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        setTimeout(() => { this.updateNewsScrollState(); }, 400);
      }
    },
    updateNewsScrollState() {
      const scroller = this.$refs.newsScroller;
      if (scroller) {
        const atStart = scroller.scrollLeft < 1;
        const atEnd = Math.ceil(scroller.scrollLeft + scroller.clientWidth) >= scroller.scrollWidth;
        this.newsCanScrollLeft = !atStart;
        this.newsCanScrollRight = !atEnd;
      }
    },
    scrollActivity(direction) {
      if ((direction === -1 && !this.activityCanScrollLeft) || (direction === 1 && !this.activityCanScrollRight)) {
        return;
      }
      const scroller = this.$refs.activityScroller;
      if (scroller) {
        const scrollAmount = scroller.clientWidth * 0.8;
        scroller.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
        setTimeout(() => { this.updateActivityScrollState(); }, 400);
      }
    },
    updateActivityScrollState() {
      const scroller = this.$refs.activityScroller;
      if (scroller) {
        const atStart = scroller.scrollLeft < 1;
        const atEnd = Math.ceil(scroller.scrollLeft + scroller.clientWidth) >= scroller.scrollWidth;
        this.activityCanScrollLeft = !atStart;
        this.activityCanScrollRight = !atEnd;
      }
    },
    createExcerpt(body, length = 80) {
      if (!body) return 'No content preview available.';
      const text = body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]*>?/gm, '').replace(/#/g, '');
      if (text.length <= length) return text;
      return text.slice(0, length) + '...';
    },
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
    hive.api.setOptions({ url: process.env.hiveApiNode });
    this.$store.dispatch('steemconnect/login');
    this.fetchUserData();
    this.animator();
    this.$store.dispatch('fetchRewardedActivityCount');
    this.$store.dispatch('fetchLeaderboard');
    this.$store.dispatch('fetchTopDelegators', 20);
    this.fetchDelegationRewards(); // Fetch the actual rewards
    this.$store.dispatch('fetchNews');
    this.fetchAndHydrateHomepageReports();
    this.renderReady = true;

    const delegatorScroller = this.$refs.delegatorScroller;
    if (delegatorScroller) {
        delegatorScroller.addEventListener('scroll', this.updateDelegatorScrollState);
        window.addEventListener('resize', this.updateDelegatorScrollState);
        this.updateDelegatorScrollState();
    }
    
    const newsScroller = this.$refs.newsScroller;
    if (newsScroller) {
        newsScroller.addEventListener('scroll', this.updateNewsScrollState);
        window.addEventListener('resize', this.updateNewsScrollState);
        this.updateNewsScrollState();
    }
    
    const activityScroller = this.$refs.activityScroller;
    if (activityScroller) {
        activityScroller.addEventListener('scroll', this.updateActivityScrollState);
        window.addEventListener('resize', this.updateActivityScrollState);
        this.updateActivityScrollState();
    }

    document.body.classList.add('home-page-active');
  },
  async beforeDestroy() {
    if (this.$refs.pendingRewardsHider) {
        this.$refs.pendingRewardsHider.click();
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    
    const delegatorScroller = this.$refs.delegatorScroller;
    if (delegatorScroller) {
        delegatorScroller.removeEventListener('scroll', this.updateDelegatorScrollState);
        window.removeEventListener('resize', this.updateDelegatorScrollState);
    }

    const newsScroller = this.$refs.newsScroller;
    if (newsScroller) {
        newsScroller.removeEventListener('scroll', this.updateNewsScrollState);
        window.removeEventListener('resize', this.updateNewsScrollState);
    }

    const activityScroller = this.$refs.activityScroller;
    if (activityScroller) {
        activityScroller.removeEventListener('scroll', this.updateActivityScrollState);
        window.removeEventListener('resize', this.updateActivityScrollState);
    }

    document.body.classList.remove('home-page-active');
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
.VueCarousel-dot-container
  margin-top: 20px !important
  .VueCarousel-dot
    background-color: rgba(0, 0, 0, 0.2) !important
    padding: 1px 5px !important
    &:focus
      outline: none !important
  .VueCarousel-dot--active
    background-color: #000 !important
.navbar .navbar-nav .nav-link
  padding-right: .4rem
  padding-left: .4rem
@media (min-width: 768px)
  .showcase .showcase-text
    padding: 7rem
@media (max-width: 767px)
  .intro .headline
    font-size: 1.7rem
  .showcase .showcase-text
    padding: 2rem
    h2
      font-size: 1.5rem
    .lead
      font-size: 1.2rem
  .showcase .showcase-img
    min-height: 15rem
</style>
<style>
body.home-page-active {
  overflow-x: hidden;
  overflow-y: scroll; 
}

body.modal-open {
  overflow: visible;
  padding-right: 0 !important;
}

section#recent-activity, section#news {
  position: relative;
}

#navbar-container{position:relative;z-index:1100}:root{--hero-content-bg:#f8f9fa;--hero-title-color:#212529;--hero-subtitle-color:#495057;--panel-bg:rgba(255,255,255,.85);--panel-border:rgba(0,0,0,.1);--panel-text-color:#212529;--panel-muted-text:#6c757d;--btn-secondary-color:#343a40;--btn-secondary-border:#ced4da;--btn-secondary-hover-bg:#e9ecef;--btn-secondary-hover-border:#adb5bd}.dark-mode{--hero-content-bg:#1a1a1a;--hero-title-color:#f0f0f0;--hero-subtitle-color:#a0a0a0;--panel-bg:rgba(40,40,40,.85);--panel-border:rgba(255,255,255,.15);--panel-text-color:#f0f0f0;--panel-muted-text:#a0a0a0;--btn-secondary-color:#f0f0f0;--btn-secondary-border:rgba(255,255,255,.5);--btn-secondary-hover-bg:rgba(255,255,255,.1);--btn-secondary-hover-border:#fff}.hero-section{display:flex;min-height:100vh;width:100%;background-color:#000;position:relative;overflow:hidden}.hero-content{flex-basis:45%;max-width:600px;background:var(--hero-content-bg);color:var(--hero-title-color);padding:4rem 3rem;display:flex;flex-direction:column;justify-content:center;z-index:2}.hero-title{font-size:3.5rem;font-weight:800;line-height:1.2;margin-bottom:1rem;text-transform:uppercase;color:var(--hero-title-color)}.hero-title .text-brand{color:#e10707}.hero-subtitle{font-size:1.1rem;color:var(--hero-subtitle-color);max-width:450px;margin-bottom:2.5rem}.hero-visual{flex:1;position:relative}.hero-visual .hero-bg-image{position:absolute;top:0;left:0;width:100%;height:100%;background-image:url('/img/header-5(2).png');background-size:cover;background-position:left center}.hero-visual-overlay{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to right,var(--hero-content-bg) 0,transparent 40%);z-index:1}.user-panel{background:var(--panel-bg);border:1px solid var(--panel-border);border-radius:16px;padding:1.5rem;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1rem}.stat-item{display:flex;flex-direction:column}.stat-item .label{font-size:.9rem;color:var(--panel-muted-text);margin-bottom:.25rem}.stat-item .value{font-size:1.25rem;font-weight:600;color:var(--panel-text-color);margin-bottom:.75rem}.btn-panel-action{color:#e10707;text-decoration:none;font-weight:600;transition:all .2s ease}.btn-panel-action:hover{color:#c10606;transform:translateX(4px)}.dark-mode .btn-panel-action:hover{color:#ff3d3d}.btn-panel-action .fas{margin-left:.25rem}.resource-stats{border-top:1px solid var(--panel-border);border-bottom:1px solid var(--panel-border);padding:.5rem 0;margin:1.5rem 0}.resource-stats .text-muted{color:var(--panel-muted-text)!important}.resource-stats .text-white{color:var(--panel-text-color)!important}.login-prompt{color:var(--panel-text-color);font-size:1.1rem;text-align:center;margin-bottom:1.5rem;font-weight:500}.main-actions-alt{text-align:center;margin-top:1rem}.main-actions{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.btn-primary-hero,.btn-secondary-hero{padding:.85rem 1.5rem;border-radius:8px;font-weight:700;text-align:center;text-decoration:none;transition:all .3s ease;border:2px solid transparent}.btn-primary-hero{background-color:#e10707;color:#fff!important}.btn-primary-hero:hover{background-color:#c10606;transform:translateY(-2px)}.btn-secondary-hero{background-color:transparent;color:var(--btn-secondary-color)!important;border-color:var(--btn-secondary-border)}.btn-secondary-hero:hover{background-color:var(--btn-secondary-hover-bg);border-color:var(--btn-secondary-hover-border);transform:translateY(-2px)}.btn-link-hero{color:var(--panel-muted-text);text-decoration:none;font-weight:500;transition:color .2s ease}.btn-link-hero:hover{color:#e10707}@media (max-width:1200px){.hero-content{flex-basis:50%}.hero-visual{flex-basis:50%}}@media (max-width:992px){.hero-section{flex-direction:column}.hero-visual{order:0;flex-basis:auto;height:40vh}.hero-visual .hero-bg-image{background-position:center center}.hero-visual-overlay{background:none}.hero-content{order:1;flex-basis:auto;max-width:100%;padding:2rem 1.5rem}.hero-title{font-size:2.5rem}}@media (max-width:576px){.hero-title{font-size:2rem}.main-actions,.stats-grid{grid-template-columns:1fr}}section{margin-bottom:2em;box-shadow:3px 3px 3px rgba(255,0,0,.4)}section.aurora-showcase,section#delegators,section#news,section#recent-activity,section#leaderboard,section#infrastructure{box-shadow:none!important;margin-bottom:0}.acti-shadow{box-shadow:3px 3px 3px rgba(255,0,0,.4)}.acti-shadow-inverse{box-shadow:3px 3px 3px rgba(255,255,255,.4)}
.intro {
  background-color: #0c0c14;
  position: relative;
  overflow: hidden;
  box-shadow: none !important;
  padding: 8rem 1rem;
}
.intro::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 180%;
  height: 180%;
  z-index: 1;
  background: conic-gradient(
    from 90deg at 50% 50%, 
    rgba(108, 117, 125, 0.1) 0%, 
    rgba(108, 117, 125, 0.1) 35%, 
    transparent 50%, 
    rgba(225, 7, 7, 0.1) 65%, 
    rgba(225, 7, 7, 0.1) 100%
  );
  animation: aurora-animation 25s linear infinite;
}
.intro-showcase-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.intro .intro-logo {
  height: 50px;
  margin-bottom: 2.5rem;
}
.intro .headline {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.3;
  color: #e10707;
  max-width: 800px;
  margin-bottom: 1.5rem;
}
.intro .lead {
  font-size: 1.25rem;
  color: #535252;
  max-width: 650px;
  line-height: 1.6;
}
.dark-mode .intro .lead{
  font-size: 1.25rem;
  color: #a9a7a7;
  max-width: 650px;
  line-height: 1.6;
}
@media (max-width: 767px) {
  .intro .headline {
    font-size: 2.2rem;
  }
  .intro .lead {
    font-size: 1.1rem;
  }
}

#leaderboard{background-color:#f9fafb;position:relative;overflow:hidden;transition:background-color .4s ease}
.dark-mode #leaderboard{background-color:#111827}
#leaderboard .leaderboard-title{color:#1f2937;transition:color .4s ease;font-weight:700;font-size:2.8rem;padding-bottom:2rem}
.dark-mode #leaderboard .leaderboard-title{color:#f9fafb}

.leaderboard-podium{display:flex;align-items:flex-end;justify-content:center;gap:1.5rem;position:relative;min-height:450px;z-index:1;padding-top:40px}

.leaderboard-podium::after {
    content:'';
    position:absolute;
    top:50%;
    left:50%;
    width:140%;
    height:140%;
    transform:translate(-50%, -50%);
    background:radial-gradient(ellipse at center, rgba(225,7,7,.3), rgba(134,142,150,.2), transparent 70%);
    filter:blur(80px);
    z-index:-1;
    opacity:.8;
    transition: all .4s ease;
}
.dark-mode .leaderboard-podium::after {
    background:radial-gradient(ellipse at center, rgba(255,20,20,.4), rgba(173,181,189,.25), transparent 70%);
    filter:blur(90px);
    opacity:1;
}

.podium-column{flex:1;max-width:350px;display:flex;flex-direction:column;align-items:center;position:relative;background-color:#fff;border-radius:16px;box-shadow:0 8px 25px rgba(0,0,0,.08);overflow:hidden;transition:transform .3s ease,box-shadow .3s ease}
.dark-mode .podium-column{background-color:#1f2937;box-shadow:0 8px 30px rgba(0,0,0,.2)}

.podium-column.is-first { order: 2; transform: translateY(-25px); }
.podium-column.is-second { order: 1; }
.podium-column.is-third { order: 3; }

.podium-column:hover{transform:translateY(-8px);box-shadow:0 12px 30px rgba(0,0,0,.12)}
.podium-column.is-first:hover{transform:translateY(-33px)}

.podium-post-link{display:block;width:100%;height:200px;background-color:#e9ecef}
.dark-mode .podium-post-link{background-color:#374151}
.podium-post-image{width:100%;height:100%;background-size:cover;background-position:center;transition:transform .4s ease}
.podium-post-link:hover .podium-post-image{transform:scale(1.05)}
.podium-post-image-placeholder{width:100%;height:200px;background-color:#e9ecef}
.dark-mode .podium-post-image-placeholder{background-color:#374151}


.podium-column .user-details{text-align:center;padding:1rem 1.5rem;width:100%}
.podium-column .avatar{width:80px;height:80px;border-radius:50%;background-color:#eee;background-size:cover;background-position:center;margin:-50px auto 10px;border:4px solid #fff;position:relative;z-index:2;box-shadow:0 4px 10px rgba(0,0,0,.1)}
.dark-mode .podium-column .avatar{border-color:#1f2937}

.podium-column .username{font-weight:700;text-decoration:none;font-size:1.2rem;display:block;color:#374151;transition:color .2s}
.podium-column .activity-count{font-size:.9rem;text-decoration:none;color:#6b7280;transition:color .2s}
.podium-column .username:hover,.podium-column .activity-count:hover{color:#e10707}
.dark-mode .podium-column .username{color:#d1d5db}
.dark-mode .podium-column .activity-count{color:#9ca3af}
.dark-mode .podium-column .username:hover,.dark-mode .podium-column .activity-count:hover{color:#fff}

.podium-base{width:100%;display:flex;justify-content:center;align-items:center;transition:transform .2s,box-shadow .2s;margin-top:auto}
.podium-base .rank-number{font-size:5rem;font-weight:700;color:#fff;line-height:1;text-shadow:0 2px 4px rgba(0,0,0,.3)}
.podium-base.gold{height:150px;background:linear-gradient(to top,#d4af37,#f9d776);box-shadow:inset 0 3px 8px rgba(255,255,255,.4),0 5px 15px rgba(0,0,0,.3)}
.podium-base.silver{height:120px;background:linear-gradient(to top,#c0c0c0,#e9e9e9);box-shadow:inset 0 3px 8px rgba(255,255,255,.5),0 5px 10px rgba(0,0,0,.2)}
.podium-base.bronze{height:100px;background:linear-gradient(to top,#cd7f32,#e3a76f);box-shadow:inset 0 3px 8px rgba(255,255,255,.3),0 5px 8px rgba(0,0,0,.2)}
.medal-icon{position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:60px;height:auto;z-index:10}

@media (max-width:992px){
  .leaderboard-podium{
    flex-direction:column;
    align-items:center;
    gap:3rem
  }
  .podium-column,
  .podium-column.is-first {
    transform:none!important;
    order: initial; 
  }
}


.showcase-v3{padding:0;margin:0}.showcase-item{padding:5rem 0;background-color:#f8f9fa}.showcase-item:nth-of-type(2){background-color:#fff}.showcase-item .container{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}.showcase-text-content{text-align:left}.showcase-text-content h2{font-size:2.8rem;font-weight:700;margin-bottom:1.5rem;color:#212529}.showcase-text-content .lead{font-size:1.1rem;color:#495057;line-height:1.7}.showcase-image-wrapper img{border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,.1);filter:drop-shadow(0 0 20px rgba(225,7,7,.35));width:100%}#showcase-tokens-v3 .container{grid-template-areas:"image text"}#showcase-tokens-v3 .showcase-image-wrapper{grid-area:image}#showcase-tokens-v3 .showcase-text-content{grid-area:text}.exchange-tags-container{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:flex-start}.exchange-tag{background-color:rgba(0,0,0,.05);padding:.5rem 1rem;border-radius:8px;color:#343a40;text-decoration:none;transition:all .3s ease}.exchange-tag:hover{background-color:#e10707;color:#fff;transform:translateY(-2px)}.app-buttons-container img{height:55px;transition:transform .3s}.app-buttons-container img:hover{transform:scale(1.05)}.cta-button-group{display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:flex-start}.btn-outline-red,.btn-solid-red{padding:.85rem 1.5rem;border-radius:8px;font-weight:700;transition:all .3s ease;border:2px solid #e10707;text-transform:none;letter-spacing:normal}.btn-solid-red{background-color:#e10707;color:#fff!important}.btn-solid-red:hover{background-color:#c10606;border-color:#c10606;transform:translateY(-3px)}.btn-outline-red{background-color:transparent;color:#e10707!important}.btn-outline-red:hover{background-color:#e10707;color:#fff!important;transform:translateY(-3px)}@media (max-width:991px){.showcase-item .container{grid-template-columns:1fr;text-align:center}.showcase-text-content{order:2}.showcase-image-wrapper{order:1;margin-bottom:2rem}#showcase-tokens-v3 .container{grid-template-areas:unset}#showcase-tokens-v3 .showcase-text-content{order:2}#showcase-tokens-v3 .showcase-image-wrapper{order:1}.app-buttons-container,.cta-button-group,.exchange-tags-container,.showcase-text-content{text-align:center;justify-content:center}}

#recent-activity{background-color:#f0f2f5;position:relative;overflow:hidden;padding-top:4rem;padding-bottom:5rem}
#recent-activity::before{content:'';position:absolute;top:50%;left:50%;width:150%;padding-top:150%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(225,7,7,.1) 0,rgba(225,7,7,0) 60%);animation:aurora-animation 20s linear infinite;z-index:1}
.dark-mode #recent-activity{background-color:#0a0a0c}
.dark-mode #recent-activity::before{background:radial-gradient(circle,rgba(225,7,7,.15) 0,rgba(225,7,7,0) 60%)}
#recent-activity .section-title{font-size:2.8rem;font-weight:700;color:#212529}
.dark-mode #recent-activity .section-title,.dark-mode #recent-activity .text-muted{color:#e9ecef!important}
#recent-activity .activity-post-card{min-height:220px;background-color:rgba(255,255,255,.3);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border-radius:20px;transition:all .3s ease-in-out;background-size:cover;background-position:center;position:relative;overflow:hidden}
#recent-activity .activity-card-link-overlay{position:absolute;top:0;left:0;width:100%;height:100%;z-index:3}
#recent-activity .activity-card-content{position:relative;z-index:4;display:flex;flex-direction:column;justify-content:space-between;height:100%;padding:1.25rem}
#recent-activity .card-user-info{display:flex;align-items:center;gap:.75rem}
#recent-activity .card-user-info .avatar{width:40px;height:40px;border:2px solid rgba(255,255,255,.8)}
#recent-activity .card-post-content{flex-grow:0;margin-bottom:1rem}
#recent-activity .activity-post-card {
  border: none; 
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); 
}
#recent-activity .activity-post-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 0 0 20px rgba(225, 7, 7, 0.2);
}
#recent-activity .activity-post-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border-radius: inherit;
  z-index: 2;
  transition: background .3s ease;
}
#recent-activity .post-stats {
  padding-top:.75rem;
  font-weight:600;
  text-align:left;
  display:flex;
  justify-content:space-between;
  align-items:center;
}
#recent-activity .post-stats .fas {
  color: #e10707;
  text-shadow: none;
  margin-right: .5rem;
}
/* Light Mode (Default) Styles */
#recent-activity .activity-post-card::before {
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0.3) 100%);
}
#recent-activity .card-user-info .username,
#recent-activity .post-excerpt,
#recent-activity .post-stats .step-count,
#recent-activity .post-stats .post-date {
  color: #212529;
  text-shadow: none;
}
#recent-activity .card-user-info .username { font-weight: 700; }
#recent-activity .post-stats {
  border-top: 1px solid #718096;
}

.dark-mode #recent-activity .activity-post-card {
  box-shadow: 0 0 1px rgba(255, 255, 255, 0.2); /* Subtle glow for dark mode */
}
.dark-mode #recent-activity .activity-post-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px rgba(225, 7, 7, 0.3);
}
.dark-mode #recent-activity .activity-post-card::before {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.5) 60%, rgba(0, 0, 0, 0.2) 100%);
}
.dark-mode #recent-activity .card-user-info .username,
.dark-mode #recent-activity .post-excerpt,
.dark-mode #recent-activity .post-stats .step-count,
.dark-mode #recent-activity .post-stats .post-date {
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
.dark-mode #recent-activity .post-stats {
  border-top-color: rgba(255, 255, 255, 0.3);
}
.dark-mode #recent-activity .post-stats .post-date {
  color: #e2e8f0;
}


.dark-mode .showcase-item{background-color:#000}.dark-mode .showcase-item:nth-of-type(2){background-color:#121212}.dark-mode .showcase-text-content h2{color:#fff}.dark-mode .showcase-text-content .lead{color:#adb5bd}.dark-mode .exchange-tag{background-color:rgba(255,255,255,.1);color:#f8f9fa}.dark-mode .btn-outline-red{color:#e10707!important;border-color:#e10707}.dark-mode .btn-outline-red:hover{background-color:#e10707;color:#fff!important}.dark-mode .showcase-image-wrapper img{filter:drop-shadow(0 0 25px rgba(225,7,7,.45))}@keyframes aurora-animation{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}.aurora-showcase{position:relative;padding:6rem 0;margin:0;background-color:#f4f4f7;overflow:hidden}.dark-mode .aurora-showcase{background-color:#0a0a0c}.aurora-showcase::before{content:'';position:absolute;top:-10%;right:-10%;bottom:-10%;left:-10%;z-index:1;background:conic-gradient(from 90deg at 40% 60%,#e10707,#434654,#e0e0e0,#b0b0c0,#434654,#e10707);filter:blur(80px);opacity:.25;animation:aurora-animation 25s linear infinite}.dark-mode .aurora-showcase::before{opacity:.3}section#infrastructure{background-color:#0c0c14;position:relative;overflow:hidden}section#infrastructure::before{content:'';position:absolute;top:50%;left:50%;width:150%;height:150%;transform-origin:center;background:radial-gradient(circle at 30% 30%,#e10707,transparent 40%),radial-gradient(circle at 70% 70%,#c0c0c0,transparent 40%);filter:blur(100px);z-index:1;opacity:.4;animation:aurora-animation 15s linear infinite}#infrastructure .container{position:relative;z-index:2}#infrastructure .section-title{font-size:2.8rem;font-weight:700;color:#212529}.dark-mode #infrastructure .section-title{color:#e9ecef!important}#infrastructure .section-title .text-brand{color:inherit}.dark-mode #infrastructure .section-title .text-brand{color:#fff!important}#infrastructure .infrastructure-grid{display:flex;flex-direction:column;align-items:center;gap:30px}#infrastructure .secondary-line{display:flex;flex-wrap:wrap;justify-content:center;gap:40px}#infrastructure .infra-card{width:170px;height:170px;background:rgba(22,22,30,.25);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 32px 0 rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;border-radius:16px;transition:transform .3s ease,box-shadow .3s ease;position:relative;overflow:hidden}#infrastructure .infra-card:hover{transform:translateY(-8px) scale(1.05);box-shadow:0 0 25px rgba(225,7,7,.5);border-color:rgba(225,7,7,.4)}#infrastructure .logo-icon{max-height:80px;max-width:80%;transition:opacity .4s ease-in-out;position:relative;z-index:3}#infrastructure .hover-image{position:absolute;top:0;left:0;width:100%;height:100%;background-size:cover;background-position:center;opacity:0;transition:opacity .4s ease-in-out;z-index:2}#infrastructure .infra-card:hover .logo-icon{opacity:0}#infrastructure .infra-card:hover .hover-image{opacity:1}#news{background-color:#f9fafb;padding:4rem 0;margin-bottom:2em;position:relative;overflow:hidden;transition:background-color .4s ease}.dark-mode #news{background-color:#121212}#news::before{content:'';position:absolute;top:50%;left:50%;width:180%;height:180%;transform:translate(-50%,-50%);z-index:1;background:radial-gradient(ellipse at 30% 40%,rgba(225,7,7,.15),transparent 70%),radial-gradient(ellipse at 70% 60%,rgba(108,117,125,.1),transparent 70%);filter:blur(90px);animation:aurora-animation 30s linear infinite}.dark-mode #news::before{background:radial-gradient(ellipse at 25% 40%,rgba(225,7,7,.25),transparent 70%),radial-gradient(ellipse at 75% 60%,rgba(200,200,210,.1),transparent 70%);filter:blur(100px);animation:aurora-animation 30s linear infinite}#news .section-title{font-size:2.8rem;font-weight:700;color:#212529}.dark-mode #news .section-title{color:#e9ecef!important}#news .section-title .text-brand{color:inherit}.dark-mode #news .section-title .text-brand{color:#fff!important}.new-design-news-card{background-color:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:1.25rem;display:flex;flex-direction:column;justify-content:space-between;text-align:left;box-shadow:0 4px 15px rgba(0,0,0,.08);transition:all .3s ease}.new-design-news-card:hover{transform:translateY(-5px) scale(1.02);box-shadow:0 5px 25px rgba(225,7,7,.2)}.new-design-news-card .card-content{flex-grow:1}.new-design-news-card .card-date{font-size:.8rem;color:#6b7280;margin-bottom:.5rem}.new-design-news-card .card-title{font-size:1.1rem;font-weight:600;color:#111827;line-height:1.4;margin-bottom:1rem;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}.new-design-news-card .card-actions{display:flex;gap:10px}.new-design-news-card .btn-news{flex:1;background-color:#e10707;color:#fff;border:1px solid #e10707;border-radius:8px;padding:.5rem;text-align:center;font-weight:600;text-decoration:none;font-size:.9rem;transition:all .2s ease-in-out}.new-design-news-card .btn-news:hover{background-color:#c10606;border-color:#c10606;transform:translateY(-1px)}.dark-mode .new-design-news-card{background-color:#1e1e1e;border-color:rgba(255,255,255,.1);box-shadow:0 4px 15px rgba(0,0,0,.3)}.dark-mode .new-design-news-card .card-title{color:#d1d5db}.dark-mode .new-design-news-card .card-date{color:#9ca3af}.showcase-card{position:relative;z-index:2;margin:0 auto 5rem;max-width:1140px;padding:3rem;border-radius:24px;background:rgba(255,255,255,.4);backdrop-filter:blur(25px);-webkit-backdrop-filter:blur(25px);border:1px solid rgba(255,255,255,.6);box-shadow:0 16px 40px rgba(0,0,0,.1)}.dark-mode .showcase-card{background:rgba(22,22,22,.3);border-color:rgba(255,255,255,.1);box-shadow:0 16px 50px rgba(0,0,0,.25)}.showcase-card:last-of-type{margin-bottom:0}.card-content-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:3rem;align-items:center}.showcase-card:nth-of-type(2) .card-content-grid .aurora-image-wrapper{order:1}.showcase-card:nth-of-type(2) .card-content-grid .aurora-text-content{order:2}.aurora-text-content h2{font-size:2.8rem;font-weight:800;margin-bottom:1rem;color:#1a202c}.aurora-text-content .lead{font-size:1.1rem;line-height:1.7;color:#4a5568}.dark-mode .aurora-text-content h2{color:#fff}.dark-mode .aurora-text-content .lead{color:#cbd5e0}.dark-mode .aurora-text-content h4{color:#e2e8f0}.aurora-image-wrapper img{border-radius:16px;width:100%;box-shadow:0 5px 15px rgba(0,0,0,.1);filter:drop-shadow(0 10px 25px rgba(225,7,7,.4));transition:transform .4s ease,filter .4s ease}.aurora-image-wrapper:hover img{transform:translateY(-5px) scale(1.02);filter:drop-shadow(0 15px 30px rgba(225,7,7,.5))}.dark-mode .aurora-image-wrapper img{filter:drop-shadow(0 10px 30px rgba(255,61,61,.45))}.dark-mode .aurora-image-wrapper:hover img{filter:drop-shadow(0 15px 35px rgba(255,61,61,.55))}.showcase-card.reveal .card-content-grid>div{opacity:0;transform:translateY(30px) scale(.98);transition:transform .8s cubic-bezier(.165,.84,.44,1),opacity .8s cubic-bezier(.165,.84,.44,1)}.showcase-card.reveal.active .card-content-grid>div{opacity:1;transform:translateY(0) scale(1)}.showcase-card.reveal.active .aurora-image-wrapper{transition-delay:.1s}.showcase-card.reveal.active .aurora-text-content{transition-delay:.25s}@media (max-width:991px){.card-content-grid{grid-template-columns:1fr;gap:2.5rem}.showcase-card:nth-of-type(2) .card-content-grid .aurora-image-wrapper,.showcase-card:nth-of-type(2) .card-content-grid .aurora-text-content{order:unset}.aurora-text-content{text-align:center}.app-buttons-container,.cta-button-group,.exchange-tags-container{justify-content:center}.showcase-card{padding:2rem}}.delegator-aurora-bg{position:relative;background-color:#f0f2f5;overflow:hidden;padding-top:4rem;padding-bottom:5rem}.delegator-aurora-bg::before{content:'';position:absolute;top:50%;left:50%;width:150%;padding-top:150%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(225,7,7,.15) 0,rgba(225,7,7,0) 60%);animation:aurora-animation 20s linear infinite;z-index:1}.dark-mode .delegator-aurora-bg{background-color:#0a0a0c}.dark-mode .delegator-aurora-bg::before{background:radial-gradient(circle,rgba(225,7,7,.2) 0,rgba(225,7,7,0) 60%)}#delegators .container-fluid,#news .container-fluid,#recent-activity .container-fluid{position:relative;z-index:2;max-width:100%}#delegators .section-title{font-size:2.8rem;font-weight:700;color:#212529}#delegators .text-brand{color:#e10707}.dark-mode #delegators .section-title,.dark-mode #delegators .text-muted{color:#e9ecef!important}
.custom-scroller{display:flex;overflow-x:auto;padding-bottom:1.5rem;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain;scroll-snap-type: x mandatory;}
.custom-scroller::-webkit-scrollbar{display:none}.custom-scroller-inner{display:flex;flex-wrap:nowrap;gap:1.5rem;padding-left:2rem;padding-right:2rem}
.delegator-card{flex:0 0 280px;background:rgba(255,255,255,.65);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border:1px solid rgba(255,255,255,.2);border-radius:20px;box-shadow:0 8px 32px 0 rgba(31,38,135,.1);padding:1.5rem;transition:all .3s ease-in-out;display:flex;flex-direction:column;scroll-snap-align: center;}
.delegator-card:hover{transform:translateY(-10px) scale(1.02);box-shadow:0 16px 40px 0 rgba(31,38,135,.15)}.dark-mode .delegator-card{background:rgba(30,30,30,.6);border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 32px 0 rgba(0,0,0,.25)}.dark-mode .delegator-card:hover{box-shadow:0 12px 32px 0 rgba(0,0,0,.35)}.delegator-card .card-header{text-align:center;margin-bottom:1.25rem}.delegator-avatar-link{position:relative;display:inline-block}.delegator-card .avatar.large{width:80px;height:80px;border:3px solid #fff;box-shadow:0 0 15px rgba(0,0,0,.1);margin:0 auto 1rem;position:relative;z-index:2}.avatar-glow{position:absolute;top:50%;left:50%;width:80px;height:80px;transform:translate(-50%,-50%);background:#e10707;filter:blur(25px);opacity:0;transition:opacity .3s ease;z-index:1}.delegator-card:hover .avatar-glow{opacity:.6}.delegator-card .username{font-size:1.2rem;font-weight:600;color:#343a40;text-decoration:none;display:block;word-wrap:break-word}.dark-mode .delegator-card .username{color:#d1d5db}.delegator-card .card-body{display:flex;flex-direction:column;gap:.75rem;margin-top:auto}.delegator-card .stat-row{display:flex;align-items:center;font-size:1rem;color:#212529;text-decoration:none;transition:color .2s}.dark-mode .delegator-card .stat-row{color:#f0f0f0}.delegator-card .stat-row:hover span{color:#e10707}.delegator-card .stat-row i{margin-right:.75rem;width:20px;text-align:center}
.delegator-scroller-wrapper{position:relative}.scroller-nav{position:absolute;top:50%;z-index:10;height:45px;width:45px;border-radius:50%;background-color:rgba(255,255,255,.9);box-shadow:0 4px 12px rgba(0,0,0,.15);color:#e10707;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s ease;transform:translateY(calc(-50% - .75rem))}.scroller-nav:not(.disabled):hover{background-color:#e10707;color:#fff;transform:translateY(calc(-50% - .75rem)) scale(1.1)}.scroller-nav:focus{outline:none}.scroller-nav-left{left:10px}.scroller-nav-right{right:10px}.dark-mode .scroller-nav{background-color:rgba(30,30,30,.8)!important}.dark-mode .scroller-nav:not(.disabled):hover{background-color:#e10707!important;color:#fff!important}.scroller-nav.disabled{opacity:0.4;cursor:not-allowed;}
.news-card-scroller-item{flex:0 0 320px;padding:10px 5px;height:240px;scroll-snap-align: center;}
.new-design-news-card.h-100{height:100%!important;}

.activity-card-scroller-item {
  flex: 0 0 280px;
  padding: 10px 5px;
  height: 260px;
  scroll-snap-align: center;
}
.activity-post-card.h-100 {
  height: 100% !important;
}

.resource-stats .col-md-12 {
    display: block;
}
.resource-stats .col-md-12 > div:last-child {
    margin-bottom: 0;
}

.modal-backdrop {
    z-index: 1140;
}
.modal {
    z-index: 1150;
}
</style>