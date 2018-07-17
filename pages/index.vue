<template>
  <div>
    <!-- header with fullscreen background -->
    <div class="header pt-3 pt-md-5 position-relative">
      <div class="container py-5">
        <div class="pb-4 text-center">
          <img src="/img/icon.png" alt="Actifit" />
          <h1 class="mt-3 text-brand title">Actifit Fitness Tracker</h1>
          <h3 class="font-italic text-brand slogan">Rewarding Fitness Activity</h3>
        </div>
        <!-- username form -->
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center border-0">
          <div class="form-group">
            <p class="lead py-3 form-info">Enter your Actifit/Steemit username to see your current funds and transaction history.</p>
            <input type="text" class="form-control form-control-lg" id="username" placeholder="Enter username" v-model="username" @keyup.enter="goToWallet()">
          </div>
          <a href="#" :class="'btn btn-lg btn-danger' + (username.length < 3 ? ' disabled' : '')" @click="goToWallet()">Show Wallet</a>
        </div>
      </div>
      <!-- scroll indicator -->
      <div class="text-center scroll-down position-absolute w-100">
        <a href="#" @click="scrollDown()">
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
            <h2 class="text-brand">{{ numberFormat(tokenInfo.tokens_distributed) }} AFIT</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-users"></i></h1>
            <h4>Token Holders</h4>
            <h2 class="text-brand">{{ numberFormat(tokenInfo.user_count) }}</h2>
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

    <div class="footer bg-light">
      <div class="container py-5">
        <div class="row">
          <div class="col text-center">
            <small class="text-muted">&copy; Copyright Actifit {{ currentYear }}</small>
          </div>
          <!--<div class="col text-right">-->
            <!--<small class="links">-->
              <!--<a href="#" class="px-1">Imprint</a>-->
              <!--<a href="#" class="px-1">Privacy Policy</a>-->
            <!--</small>-->
          <!--</div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import VueScrollTo from 'vue-scrollto'

  export default {
    data () {
      return {
        username: '', // username whose funds to show
        tokenInfo: null // stats from the api (user count and distributed token)
      }
    },
    computed: {
      currentYear () {
        return (new Date()).getFullYear()
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
      scrollDown () {
        VueScrollTo.scrollTo('#content', 1000, {easing: 'ease-in-out'})
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
        res.json().then(json => this.tokenInfo = json[0]).catch(e => console.log(e.message))
      })
    }
  }
</script>

<style lang="sass">
  .header
    height: 100%
    background: url('/img/header.jpg') center
    background-size: cover
    .form
      max-width: 500px
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2)
  .scroll-down
    bottom: 20px
  .showcase .showcase-text
    padding: 3rem
  .showcase .showcase-img
    min-height: 30rem
    background-size: cover
    background-position: center

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