<template>
  <!-- activity report listing -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ $t('Hive_proposals') }}</h2>
	  <!--<div>{{proposals}}</div>-->
	  
	  <!-- enable display of up to 2 ads among content -->
	 <div v-if="proposals.length > 0">
		<div class="row" v-for="iterx in proposals.length" :key="iterx" >
			<Proposal :proposal="proposals[iterx - 1]" :propId="iterx - 1" class="col-md-12 col-lg-12 "/>
		</div>
      </div>
	  
	  <div class="col-md-12 text-center" v-else>
		<i class="fas fa-spinner fa-spin text-brand"></i>
	  </div>

      <!-- show load more button if there are more posts available -->
      <!--<div class="text-center" v-if="moreproposalsAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          {{ $t('load_more') }}
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>-->
    </div>

    <Footer />
    <client-only>
      <div>

		<ProposalModal :report="activeProposal" @nextReport="nextReport(1)" @prevReport="nextReport(-1)"/>
		<VoteModal :report="activeProposal"/>
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
  import Proposal from '~/components/Proposal'
  import Footer from '~/components/Footer'
  //import ProposalModal from '~/components/ProposalModal'
  import EditReportModal from '~/components/EditReportModal'
  import VoteModal from '~/components/VoteModal'
  //import VotingStatus from '~/components/VotingStatus'
  import NotifyModal from '~/components/NotifyModal'
  import DailyActivityChartModal from '~/components/DailyActivityChartModal'
	
  import { mapGetters } from 'vuex'

  export default {
    head () {
		return {
		  title: `Listing of Hive proposals - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of Hive proposals` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of Hive proposals` }
		  ]
		}
	},
	components: {
      NavbarBrand,
	  Proposal,
      //Report,
      Footer,
      //ReportModal,
      //EditReportModal,
      VoteModal,
	  //VotingStatus,
	  NotifyModal,
	  //Proposal,
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false, // loading state for loading more proposals
      }
    },
    computed: {
	  ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['proposals', 'activeProposal'])
    },
	watch: {
	  user: 'fetchUserData',
	},
    methods: {
	  nextReport (direction){
		let rptId = this.activeProposal.rptId;
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
			if (rptId < this.proposals.length){
				rptId += 1;
				proceed = true;
			}
		}
		if (proceed){
			this.proposals[rptId].rptId = rptId;
			this.$store.commit('setactiveProposal', this.proposals[rptId]);
		}
	  },
      async loadMore () {
        this.loadingMore = true
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
        await this.$store.dispatch('fetchproposals')
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
      this.$store.commit('setProposals', [])

      // disable load more button and only show if there actually are more posts to load
//      this.$store.commit('setMoreproposalsAvailable', false)
	  
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  
      // fetch proposals
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'');
	  this.$store.commit('setBchain', cur_bchain);
	  
      await this.$store.dispatch('fetchProposals')
	  
      // remove loading indicator
      this.loading = false
    }
  }
</script>
<style>

</style>