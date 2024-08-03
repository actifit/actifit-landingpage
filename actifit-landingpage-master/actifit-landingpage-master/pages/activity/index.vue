<template>
	<!-- activity report listing -->
	<div>
	  <NavbarBrand />
	  <i class="fa-solid fa-language"></i>
	  <!-- listing -->
	  <div class="container pt-5 mt-5 pb-5">
		<h2 class="text-center mb-5">
		  <i class="fa-solid fa-language"></i> {{ $t('Activity_Reports') }}
		</h2>
		
		<!-- show voting counter -->
		<VotingStatus v-if="reports.length" />
		
		<!--<div class="col-md-12 goog-ad-horiz-90"><adsbygoogle ad-slot="6804482273"/></div>-->
		
		<!-- enable display of up to 2 ads among content -->
		<div v-if="reports.length">
		  <div class="row"  v-for="iterx in Math.ceil(reports.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
			  <Report v-if="(iterx - 1) * splitFactor + (itery - 1) < reports.length" :report="reports[(iterx - 1) * splitFactor + (itery - 1)]" :rptId="(iterx - 1) * splitFactor + (itery - 1)">
				<!-- New icon added beside the copy icon -->
				<i class="fa-solid fa-language"></i>
			  </Report>
			</div>
			<!--<div class="col-md-6 col-lg-4 mb-4" v-if="(iterx - 1) < inlineAds">
			  <adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
			</div>-->
		  </div>
		</div>
		
		<div class="col-md-12 text-center" v-else>
		  <i class="fas fa-spinner fa-spin text-brand"></i>
		</div>
  
		<!-- show load more button if there are more posts available -->
		<div class="text-center" v-if="moreReportsAvailable">
		  <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
			<i class="fa-solid fa-language"></i> {{ $t('load_more') }}
			<i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
		  </a>
		</div>
	  </div>
  
	  <Footer />
	  <client-only>
		<div>
  
		  <ReportModal :report="activeReport" @nextReport="nextReport(1)" @prevReport="nextReport(-1)"/>
		  <DailyActivityChartModal :report="activeReport" />
		  <EditReportModal />
		  <VoteModal :report="activeReport"/>
		  <NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')"/>
		  <NotifyModal id="notifyModalRC" ref="notifyModalRC" :modalTitle="$t('Actifit_Info')" :modalText="$t('RC_desc')"/>
		  <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		  <notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
		  <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
		</div>
	  </client-only>
	</div>
  </template>
  
  <script>
	import NavbarBrand from '~/components/NavbarBrand'
	import Report from '~/components/Report'
	import Footer from '~/components/Footer'
	import ReportModal from '~/components/ReportModal'
	import EditReportModal from '~/components/EditReportModal'
	import VoteModal from '~/components/VoteModal'
	import VotingStatus from '~/components/VotingStatus'
	import NotifyModal from '~/components/NotifyModal'
	import DailyActivityChartModal from '~/components/DailyActivityChartModal'
	  
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
		NavbarBrand,
		Report,
		Footer,
		ReportModal,
		EditReportModal,
		VoteModal,
		VotingStatus,
		NotifyModal,
		DailyActivityChartModal
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
		nextReport (direction){
		  let rptId = this.activeReport.rptId;
		  console.log(rptId);
		  let proceed = false;
		  if (direction < 0){
			console.log('move back');
			if (rptId >= 1){
			  rptId -= 1;
			  proceed = true;
			}
		  }else{
			console.log('move front');
			if (rptId < this.reports.length){
			  rptId += 1;
			  proceed = true;
			}
		  }
		  if (proceed){
			this.reports[rptId].rptId = rptId;
			this.$store.commit('setActiveReport', this.reports[rptId]);
		  }
		},
		async loadMore () {
		  this.loadingMore = true
		  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		  this.$store.commit('setBchain', cur_bchain);
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
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'');
		this.$store.commit('setBchain', cur_bchain);
		
		await this.$store.dispatch('fetchReports')
		
		// remove loading indicator
		this.loading = false
	  }
	}
  </script>
  <style>
  
  </style>
  