<template>
  <div>
    <div class="header pt-5 position-relative">
      <div class="container py-5">
        <div class="pb-4 text-center">
          <img src="/img/icon.png" alt="Actifit" />
          <h1 class="mt-3 text-brand">Actifit Fitness Tracker</h1>
          <h3 class="font-italic text-brand">Rewarding Fitness Activity</h3>
        </div>
        <div class="card form mx-auto p-3 mt-5 text-center border-0">
          <div class="form-group">
            <p class="lead py-3">Enter your Actifit/Steemit username to see your current funds and transaction history.</p>
            <input type="text" class="form-control form-control-lg" id="username" placeholder="Enter username" v-model="username" @keyup.enter="goToWallet()">
          </div>
          <a href="#" :class="'btn btn-lg btn-danger' + (username.length < 3 ? ' disabled' : '')" @click="goToWallet()">Show Wallet</a>
        </div>
      </div>
      <div class="text-center scroll-down position-absolute w-100">
        <a href="#" @click="scrollDown()">
          <i class="fas fa-2x text-light fa-chevron-down"></i>
        </a>
      </div>
    </div>
    <div class="container py-5 mt-5" id="content">
      <h1 class="mb-4 text-capitalize"><span class="text-brand">Actifit</span> is an innovative dapp that rewards fitness activity!</h1>
      <p class="lead mb-5 pb-5">
        Built as one of the first Smart Media Tokens on top of the Steem blockchain, with a beta Android app that is released since day 1, Actifit tracks and rewards your activity, and rewards you with Actifit tokens, but also STEEM rewards via upvotes on your steemit posts.
      </p>
      <div class="row" v-if="tokenInfo">
        <div class="col text-center">
          <h1><i class="fas fa-coins"></i></h1>
          <h4>Tokens distributed</h4>
          <h2 class="text-brand">{{ numberFormat(tokenInfo.tokens_distributed) }} AT</h2>
        </div>
        <div class="col text-center">
          <h1><i class="fas fa-users"></i></h1>
          <h4>Users</h4>
          <h2 class="text-brand">{{ numberFormat(tokenInfo.user_count) }}</h2>
        </div>
      </div>
      <div class="row mt-5 pt-5">
        <div class="col">
          <h2 class="text-capitalize">Earn tokens as simple as one two three</h2>
          <p class="lead">Download the app from playstore. Go for a walk, run, do your favorite workout with a min target of 5,000 steps/moves. Post to steemit and get rewarded!</p>
        </div>
        <div class="col text-center">
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
      <div class="row mt-5 pt-5">
        <div class="col">
          <h2 class="text-capitalize">Actifit tokens use cases</h2>
          <p class="lead">
            Actifit tokens will be available for purchasing fitness related equipment, tools, gadgets, sports wear, gym memberships... and any transactions between providers and actifiters.<br>
            As a Steem Smart Media Token, Actifit tokens will have their own valuation per STEEM as well as FIAT currencies, and hence can be cashed out for actual FIAT currency.
          </p>
        </div>
      </div>
      <div class="row mt-5 pt-5">
        <div class="col">
          <h2 class="text-capitalize">Delegate to earn more rewards</h2>
          <p class="lead">
            You can earn more Actifit tokens if you are a STEEM token holder. Delegate to Actifit and earn 1:1 Actifit per Steem Power delegation, as well as a share of the 5% beneficiary reward of actifit posts.
          </p>
        </div>
      </div>
    </div>
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
  import Header from '~/components/Header'

  export default {
    components: {
      Header
    },
    data () {
      return {
        username: '',
        tokenInfo: null
      }
    },
    computed: {
      currentYear () {
        return (new Date()).getFullYear()
      }
    },
    methods: {
      goToWallet () {
        if (this.username.length > 2) {
          this.$router.push({path: '/wallet/' + this.username})
        }
      },
      scrollDown () {
        VueScrollTo.scrollTo('#content', 1000, {easing: 'ease-in-out'})
      },
      numberFormat (number) {
        return new Intl.NumberFormat('en-EN').format(number)
      }
    },
    mounted () {
      fetch('http://actifitbot.herokuapp.com/user-tokens-info').then(res => {
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
</style>