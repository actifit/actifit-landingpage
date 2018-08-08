<template>
  <div>
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu />
    </nav>

    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">Activity Reports</h2>
      <div class="row">
        <Report v-for="(report, index) in reports" :report="report" :key="index" />
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Report from '~/components/Report'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserMenu,
      NavbarBrand,
      Report,
      Footer
    },
    computed: {
      ...mapGetters(['reports'])
    },
    mounted () {
      // login
      this.$store.dispatch('login')

      // fetch reports
      this.$store.dispatch('fetchReports')
    }
  }
</script>
