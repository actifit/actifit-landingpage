<template>
  <!-- activity report listing -->
  <div>
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav">
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
      <h2 class="text-center mb-5">{{ $t('Activity_Reports') }}</h2>

      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  
	  <!-- show voting counter -->
	  <VotingStatus v-else />
	  
	  <div class="col-md-12 goog-ad-horiz-90"><adsbygoogle ad-slot="6804482273"/></div>

      <!-- show listing when loaded -->
       <!-- <div class="row" v-if="reports.length">
		<div v-for="(report, index) in reports" :key="index" class="row">
			<Report :report="report" class="col-md-6 col-lg-4 mb-4"/>
			<div v-if="index % 4 == 0 && index < 8" class="col-md-6 col-lg-4 mb-4">
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
			</div>
		</div>
      </div> -->
	  
	  <!-- enable display of up to 2 ads among content -->
	 <div class="row" v-if="reports.length">
		<div class="row"  v-for="iterx in Math.ceil(reports.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Report v-if="(iterx - 1) * splitFactor + (itery - 1) < reports.length" :report="reports[(iterx - 1) * splitFactor + (itery - 1)]" />
			</div>
			<div class="col-md-6 col-lg-4 mb-4" v-if="(iterx - 1) < inlineAds">
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
			</div>
		</div>
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreReportsAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          {{ $t('load_more') }}
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>
    </div>

    <Footer />
    <ReportModal :report="activeReport" />
    <EditReportModal />
    <VoteModal :report="activeReport"/>
	<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')"/>
	<NotifyModal id="notifyModalRC" ref="notifyModalRC" :modalTitle="$t('Actifit_Info')" :modalText="$t('RC_desc')"/>
    <no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Report from '~/components/Report'
  import Footer from '~/components/Footer'
  import ReportModal from '~/components/ReportModal'
  import EditReportModal from '~/components/EditReportModal'
  import VoteModal from '~/components/VoteModal'
  import VotingStatus from '~/components/VotingStatus'
  import NotifyModal from '~/components/NotifyModal'

  import { mapGetters } from 'vuex'

  export default {
    head () {
		return {
		  title: `Listing of Activity Reports - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of Actifit-based Activity Reports` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of Actifit-based Activity Reports` }
		  ]
		}
	},
	components: {
      UserMenu,
      NavbarBrand,
      Report,
      Footer,
      ReportModal,
      EditReportModal,
      VoteModal,
	  VotingStatus,
	  NotifyModal
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false, // loading state for loading more reports
		splitFactor: 9,
		inlineAds: 2,
      }
    },
    computed: {
	  ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['reports', 'moreReportsAvailable', 'activeReport'])
    },
	watch: {
	  user: 'fetchUserData',
	},
    methods: {
      async loadMore () {
        this.loadingMore = true
        await this.$store.dispatch('fetchReports')
        this.loadingMore = false
      },
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
    },
    async mounted () {
      // reset previously fetched posts to get latest
      this.$store.commit('setReports', [])

      // disable load more button and only show if there actually are more posts to load
      this.$store.commit('setMoreReportsAvailable', false)
	  
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  
      // fetch reports
      await this.$store.dispatch('fetchReports')
	  
      // remove loading indicator
      this.loading = false
    }
  }
</script>
<style>

</style>