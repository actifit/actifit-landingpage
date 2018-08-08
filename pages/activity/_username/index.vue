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
      <h2 class="text-center mb-5">Activity Reports by {{ username }}</h2>
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
      <div class="row" v-if="userReports.length">
        <Report v-for="(report, index) in userReports" :report="report" :key="index" />
      </div>
      <div class="text-center text-muted" v-if="!userReports.length && !loading">
        {{ username }} has not tracked any activity yet.
      </div>
      <div class="text-center" v-if="moreUserReportsAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          load more
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
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
    data () {
      return {
        loading: true,
        loadingMore: false
      }
    },
    computed: {
      ...mapGetters(['userReports', 'moreUserReportsAvailable']),
      username () {
        return this.$route.params.username
      }
    },
    methods: {
      async loadMore () {
        this.loadingMore = true
        await this.$store.dispatch('fetchUserReports', this.username)
        this.loadingMore = false
      }
    },
    async mounted () {
      // login
      this.$store.dispatch('login')

      // fetch reports
      this.$store.commit('setUserReports', [])
      await this.$store.dispatch('fetchUserReports', this.username)
      this.loading = false
    }
  }
</script>
