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
        username: ''
      }
    },
    methods: {
      goToWallet () {
        if (this.username.length > 2) {
          this.$router.push({path: '/wallet/' + this.username})
        }
      }
    }
  }
</script>

<style lang="sass">
  .form
    max-width: 500px
</style>