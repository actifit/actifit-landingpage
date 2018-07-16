<template>
  <div class="container py-5">
    <Header />
    <div class="card form mx-auto mt-4 p-3 text-center">
      <div class="form-group">
        <p class="lead">Enter your Actifit/Steemit username to see your current funds and transaction history.</p>
        <input type="text" class="form-control" id="username" placeholder="Enter username" v-model="username" @keyup.enter="goToWallet()">
      </div>
      <a href="#" :class="'btn btn-danger' + (username.length < 3 ? ' disabled' : '')" @click="goToWallet()">Show Wallet</a>
    </div>
    <div class="row mt-5" v-if="tokenInfo">
      <div class="col text-center">
        <h4>Tokens distributed</h4>
        <h2 class="text-brand">{{ tokenInfo.tokens_distributed }}</h2>
      </div>
      <div class="col text-center">
        <h4>Users</h4>
        <h2 class="text-brand">{{ tokenInfo.user_count }}</h2>
      </div>
    </div>
  </div>
</template>

<script>
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
    methods: {
      goToWallet () {
        if (this.username.length > 2) {
          this.$router.push({path: '/wallet/' + this.username})
        }
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
  .form
    max-width: 500px
</style>