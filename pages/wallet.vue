<template>
  <div>
    <nav class="navbar fixed-top navbar-expand-lg navbar-light">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <UserMenu />
    </nav>

    <div class="container  pt-3 pb-5">

      <!-- header -->
      <div class="container py-5">
        <div class="text-center">
          <img src="/img/icon.png" alt="Actifit" />
          <h1 class="mt-3 text-brand">Actifit Fitness Tracker</h1>
          <h3 class="font-italic text-brand">Rewarding Fitness Activity</h3>
        </div>
      </div>

      <!-- account balance -->
      <div class="text-center">
        <h3 class="mb-4" v-if="user">Hey {{ user.account.name }}!</h3>
        <h4>Your Account Balance:</h4>
        <h1 class="mb-0 font-weight-bold">{{ formattedUserTokens }}</h1>
        <h5>AFIT</h5>
      </div>

      <!-- transaction history -->
      <div class="history mx-auto">
        <h3 class="text-center mt-5">History</h3>
        <Transaction v-for="(transaction, index) in transactions" :key="index" :transaction="transaction" />
        <div class="text-center"><small class="text-muted" v-if="transactions.length === 0">No transactions yet.</small></div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserMenu,
      Transaction, // single transaction block
      Footer
    },
    computed: {
      ...mapGetters(['user', 'userTokens', 'transactions']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2)
      },
    },
    mounted () {
      this.$store.dispatch('login')
    }
  }
</script>

<style lang="sass">
  .history
    max-width: 500px
</style>
