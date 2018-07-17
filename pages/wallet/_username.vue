<template>
  <div class="container  pt-3 pb-5">
    <nuxt-link to="/"><i class="fas fa-arrow-left fa-2x text-brand"></i></nuxt-link>
    <div class="container py-5">
      <div class="text-center">
        <img src="/img/icon.png" alt="Actifit" />
        <h1 class="mt-3 text-brand">Actifit Fitness Tracker</h1>
        <h3 class="font-italic text-brand">Rewarding Fitness Activity</h3>
      </div>
    </div>
    <div class="text-center">
      <h3 class="mb-4">Hey {{ username }}!</h3>
      <h4>Your Account Balance:</h4>
      <h1 class="mb-0 font-weight-bold">{{ tokens }}</h1>
      <h5>Actifit Tokens</h5>
    </div>
    <div class="history mx-auto">
      <h3 class="text-center mt-5">History</h3>
      <Transaction v-for="(transaction, index) in transactions" :key="index" :transaction="transaction" />
      <div class="text-center"><small class="text-muted" v-if="transactions.length === 0">No transactions yet.</small></div>
    </div>
  </div>
</template>

<script>
  import 'whatwg-fetch' // fetch polyfill

  import Header from '~/components/Header'
  import Transaction from '~/components/Transaction'

  export default {
    components: {
      Header,
      Transaction
    },
    data () {
      return {
        tokens: 0,
        transactions: []
      }
    },
    computed: {
      username () {
        return this.$route.params.username
      }
    },
    mounted () {
      fetch('https://actifitbot.herokuapp.com/user/' + this.username).then(res => {
        res.json().then(json => this.tokens = json.tokens).catch(e => console.log(e.message))
      })
      fetch('https://actifitbot.herokuapp.com/transactions/' + this.username).then(res => {
        res.json().then(json => this.transactions = json ? json : this.transactions).catch(e => console.log(e.message))
      })
    }
  }
</script>

<style lang="sass">
  .history
    max-width: 500px
</style>