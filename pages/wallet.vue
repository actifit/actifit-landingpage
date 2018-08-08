<template>
  <div>
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <!-- home link -->
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu />
    </nav>

    <div class="container pt-5 mt-5 pb-5">

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
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      NavbarBrand,
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
      // login
      this.$store.dispatch('login')
    }
  }
</script>

<style lang="sass">
  .history
    max-width: 500px
</style>
