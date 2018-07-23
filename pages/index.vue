<template>
  <div>
    <!-- top anchor -->
    <a id="top"></a>

    <!-- navbar links with smooth scrolling to sections -->
    <nav class="navbar fixed-top navbar-expand-lg navbar-light">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mx-auto">
          <li class="nav-item">
            <a class="nav-link" href="#" @click="scrollTo('#top')">Wallet</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="scrollTo('#content')">What is Actifit</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="scrollTo('#leaderboard')">Leaderboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="scrollTo('#team')">Team</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="scrollTo('#ambassadors')">Ambassadors</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="scrollTo('#athletes')">Sponsored Athletes</a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- header with fullscreen background -->
    <div class="header pt-4 pt-md-5 position-relative">
      <div class="container py-5">
        <div class="pb-md-4 text-center">
          <img src="/img/icon.png" alt="Actifit" />
          <h1 class="mt-3 text-brand title">Actifit Fitness Tracker</h1>
          <h3 class="font-italic text-brand slogan">Rewarding Fitness Activity</h3>
        </div>
        <!-- username form -->
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center border-0">
          <div class="form-group">
            <p class="lead py-md-3 form-info">Enter your Actifit/Steemit username to see your current funds and transaction history.</p>
            <input type="text" class="form-control form-control-lg" id="username" placeholder="Enter username" v-model="username" @keyup.enter="goToWallet()">
          </div>
          <a href="#" :class="'btn btn-lg btn-danger' + (username.length < 3 ? ' disabled' : '')" @click="goToWallet()">Show Wallet</a>
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
    <section class="intro bg-light" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline"><span class="text-brand">Actifit:</span> An innovative dapp that rewards fitness activity!</h1>
        <p class="lead mb-4 pb-5 text-center">
          Built as one of the first Smart Media Tokens on top of the Steem blockchain, with a beta Android app that is released since day 1, Actifit tracks and rewards your activity, and rewards you with Actifit tokens, but also STEEM rewards via upvotes on your steemit posts.
        </p>

        <!-- stats -->
        <div class="row pb-5" v-if="tokenInfo">
          <div class="col text-center">
            <h1><i class="fas fa-coins"></i></h1>
            <h4>Tokens Distributed</h4>
            <h2 class="text-brand">{{ numberFormat(animatedTokensDistributed) }} AFIT</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-users"></i></h1>
            <h4>Token Holders</h4>
            <h2 class="text-brand">{{ numberFormat(animatedUserCount) }}</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-dumbbell"></i></h1>
            <h4>Reward Activities</h4>
            <h2 class="text-brand">{{ numberFormat(animatedRewardedActivityCount) }}</h2>
          </div>
        </div>
      </div>
    </section>

    <!-- texts with images -->
    <section class="showcase">
      <div class="container-fluid p-0">

        <!-- app -->
        <div class="row no-gutters">
          <div class="col-lg-6 order-lg-2 text-white showcase-img" style="background-image: url('/img/showcase-1.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">Earn tokens as simple as one two three</h2>
            <p class="lead mb-0">Download the app from playstore. Go for a walk, run, do your favorite workout with a min target of 5,000 steps/moves. Post to steemit and get rewarded!</p>
            <div class="text-center mt-5">
              <a href="https://play.google.com/store/apps/details?id=io.actifit.fitnesstracker.actifitfitnesstracker" target="_blank">
                <img src="/img/google-play.png" />
              </a>
              <!--<br>-->
              <!--<br>-->
              <!--<a href="#" target="_blank">-->
              <!--<img src="/img/app-store.png" />-->
              <!--</a>-->
            </div>
          </div>
        </div>

        <!-- use case -->
        <div class="row no-gutters">
          <div class="col-lg-6 text-white showcase-img" style="background-image: url('/img/showcase-2.jpg');"></div>
          <div class="col-lg-6 my-auto showcase-text">
            <h2 class="text-capitalize">Actifit tokens use cases</h2>
            <p class="lead mb-0">
              Actifit tokens will be available for purchasing fitness related equipment, tools, gadgets, sports wear, gym memberships... and any transactions between providers and actifiters.<br>
              <br>
              As a Steem Smart Media Token, Actifit tokens will have their own valuation per STEEM as well as FIAT currencies, and hence can be cashed out for actual FIAT currency.
            </p>
          </div>
        </div>

        <!-- delegation -->
        <div class="row no-gutters">
          <div class="col-lg-6 order-lg-2 text-white showcase-img" style="background-image: url('/img/showcase-3.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">Delegate to earn more rewards</h2>
            <p class="lead mb-0">You can earn more Actifit tokens if you are a STEEM token holder. Delegate to Actifit and earn 1:1 Actifit per Steem Power delegation, as well as a share of the 5% beneficiary reward of actifit posts.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="leaderboard" class="py-5 bg-brand text-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-medal"></i><br>
          Daily Leaderboard
        </h1>
        <div class="row">
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>2.</h2>
              <a href="https://steemit.com/@entrepreneur916" target="_blank">
                <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmPyExYzRA6Zp14c2UL3dZSTwZtToABHwFAyFjR1pZMVk6');"></div>
              </a>
              <a href="https://steemit.com/@entrepreneur916" target="_blank">@entrepreneur916</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>1.</h2>
              <a href="https://steemit.com/@bunnymoney" target="_blank">
                <div class="avatar mx-auto mb-3" style="width: 200px; height: 200px; background-image: url('https://ipfs.busy.org/ipfs/QmQnNadhAJPJL5Sa8FYL5Pxhgw22zWjw4S8Kmji6k21p2w');"></div>
              </a>
              <a href="https://steemit.com/@bunnymoney" target="_blank">@bunnymoney</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>3.</h2>
              <a href="https://steemit.com/@fedesox" target="_blank">
                <div class="avatar mx-auto mb-3" style="width: 100px; height: 100px; background-image: url('https://ipfs.busy.org/ipfs/QmZrT7r9SjKUcx81L8p9G9z6uhndupDpfsrtYjwqgF3zC2');"></div>
              </a>
              <a href="https://steemit.com/@fedesox" target="_blank">@fedesox</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="team" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-users"></i><br>
          Team
        </h1>
        <div class="row">
          <div class="col-sm-3 text-center mb-4" v-for="(moderator, index) in moderators" :key="index" :moderator="moderator">
            <a :href="'https://steemit.com/@' + moderator" target="_blank">
              <div class="avatar mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + moderator + '/avatar);'"></div>
            </a>
            <a :href="'https://steemit.com/@' + moderator" target="_blank">@{{ moderator }}</a>
          </div>
        </div>
      </div>
    </section>

    <section id="ambassadors" class="py-5 bg-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-bullhorn tilt"></i><br>
          Ambassadors
        </h1>
        <div class="row">
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://steemit.com/@entrepreneur916" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmPyExYzRA6Zp14c2UL3dZSTwZtToABHwFAyFjR1pZMVk6');"></div>
            </a>
            <a href="https://steemit.com/@entrepreneur916" target="_blank">@entrepreneur916</a>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://steemit.com/@bunnymoney" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmQnNadhAJPJL5Sa8FYL5Pxhgw22zWjw4S8Kmji6k21p2w');"></div>
            </a>
            <a href="https://steemit.com/@bunnymoney" target="_blank">@bunnymoney</a>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://steemit.com/@fedesox" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmZrT7r9SjKUcx81L8p9G9z6uhndupDpfsrtYjwqgF3zC2');"></div>
            </a>
            <a href="https://steemit.com/@fedesox" target="_blank">@fedesox</a>
          </div>
        </div>
      </div>
    </section>

    <section id="athletes" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-dumbbell"></i><br>
          Sponsored Athletes
        </h1>
        <div class="row">
          <div class="col-sm-4 text-center mb-4">
            <a href="https://steemit.com/@entrepreneur916" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmPyExYzRA6Zp14c2UL3dZSTwZtToABHwFAyFjR1pZMVk6');"></div>
            </a>
            <a href="https://steemit.com/@entrepreneur916" target="_blank">@entrepreneur916</a>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://steemit.com/@bunnymoney" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmQnNadhAJPJL5Sa8FYL5Pxhgw22zWjw4S8Kmji6k21p2w');"></div>
            </a>
            <a href="https://steemit.com/@bunnymoney" target="_blank">@bunnymoney</a>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://steemit.com/@fedesox" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmZrT7r9SjKUcx81L8p9G9z6uhndupDpfsrtYjwqgF3zC2');"></div>
            </a>
            <a href="https://steemit.com/@fedesox" target="_blank">@fedesox</a>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script>
  import VueScrollTo from 'vue-scrollto'
  import Footer from '~/components/Footer'

  export default {
    components: {
      Footer
    },
    data () {
      return {
        username: '', // username whose funds to show
        tokenInfo: null, // stats from the api (user count and distributed token)
        userCount: 0,
        tweenedUserCount: 0,
        tokensDistributed: 0,
        tweenedTokensDistributed: 0,
        rewardedActivityCount: 0,
        tweenedRewardedActivityCount: 0,
        moderators: ['alfamano', 'ionutciobanu', 'curtwriter', 'zoneboy', 'rabihfarhat', 'gerginho', 'd-gold', 'ciuoto', 'vishalsingh4997', 'kpreddy']
      }
    },
    computed: {
      currentYear () {
        return (new Date()).getFullYear()
      },
      animatedUserCount: function() {
        return this.tweenedUserCount.toFixed(0);
      },
      animatedTokensDistributed: function() {
        return this.tweenedTokensDistributed.toFixed(0);
      },
      animatedRewardedActivityCount: function() {
        return this.tweenedRewardedActivityCount.toFixed(0);
      }
    },
    watch: {
      userCount: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedUserCount: newValue });
      },
      tokensDistributed: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedTokensDistributed: newValue });
      },
      rewardedActivityCount: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedRewardedActivityCount: newValue });
      }
    },
    methods: {
      /**
       * Forwards to wallet page if username is provided.
       */
      goToWallet () {
        if (this.username.length > 2) {
          this.$router.push({path: '/wallet/' + this.username})
        }
      },

      /**
       * Scrolls down to content area.
       */
      scrollTo (target) {
        VueScrollTo.scrollTo(target, 1000, {easing: 'ease-in-out'})
      },

      /**
       * Formats numbers with commas and dots.
       *
       * @param number
       * @returns {string}
       */
      numberFormat (number) {
        return new Intl.NumberFormat('en-EN').format(number)
      }
    },
    mounted () {
      fetch('https://actifitbot.herokuapp.com/user-tokens-info').then(res => {
        res.json().then(json => {
          this.tokenInfo = json[0]
          this.userCount = this.tokenInfo.user_count
          this.tokensDistributed = this.tokenInfo.tokens_distributed
        }).catch(e => console.log(e.message))
      })
      fetch('http://actifitbot.herokuapp.com/rewarded-activity-count').then(res => {
        res.json().then(json => {
          this.rewardedActivityCount = json
        }).catch(e => console.log(e.message))
      })
    }
  }
</script>

<style lang="sass">
  .navbar
    background: rgba(255, 255, 255, 0.5)
    transition: background-color .3s ease
    &:hover
      background: #fff
    .navbar-toggler
      border: none
      outline: none
    .navbar-nav
      .nav-link
        &:hover,
        &:focus
          color: #ff112d
  .header
    height: 100%
    background: url('/img/header.jpg') center
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

  @media (min-width: 768px)
    .showcase .showcase-text
      padding: 7rem

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
</style>