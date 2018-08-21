<template>
  <!-- activity report listing for single user -->
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

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">Activity Reports by {{ username }}</h2>

      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>

      <!-- show listing when loaded -->
      <div class="row" v-if="userReports.length">
        <Report v-for="(report, index) in userReports" :report="report" :key="index" />
      </div>

      <!-- or no content message when no reports found -->
      <div class="text-center text-muted" v-if="!userReports.length && !loading">
        {{ username }} has not tracked any activity yet.
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreUserReportsAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          load more
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>
    </div>

    <Footer />
    <ReportModal :report="activeReport" />
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Report from '~/components/Report'
  import Footer from '~/components/Footer'
  import ReportModal from '~/components/ReportModal'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserMenu,
      NavbarBrand,
      Report,
      Footer,
      ReportModal
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false // loading state for loading more reports
      }
    },
    computed: {
      ...mapGetters(['userReports', 'moreUserReportsAvailable', 'activeReport']),

      // get username from url
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

      // reset previously fetched posts to get latest
      this.$store.commit('setUserReports', [])

      // disable load more button and only show if there actually are more posts to load
      this.$store.commit('setMoreUserReportsAvailable', false)

      // fetch reports
      await this.$store.dispatch('fetchUserReports', this.username)

      // remove loading indicator
      this.loading = false
    }
  }
</script>
