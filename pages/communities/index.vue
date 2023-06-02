<template>
  <!-- blog listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ $t('Hive_communities') }} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>
	  <!--<ChainSelection />-->
	  
      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  
	  
	  
      <!-- show listing when loaded -->
	  <div class="row" v-if="communitiesList.length">
		<div class="row"  v-for="iterx in Math.ceil(communitiesList.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Community v-if="(iterx - 1) * splitFactor + (itery - 1) < communitiesList.length" :community="communitiesList[(iterx - 1) * splitFactor + (itery - 1)]" :pstId="(iterx - 1) * splitFactor + (itery - 1)" :userSubscribed="isUserSubscribed(communitiesList[(iterx - 1) * splitFactor + (itery - 1)])"/>
			</div>
			<!--<div class="col-md-6 col-lg-12 mb-4" v-if="(iterx - 1) < inlineAds">
				<client-only>
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
				</client-only>
			</div>-->
		</div>
      </div>

      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!communitiesList.length && !loading">
        {{ $t('error_loading_communities') }}
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreCommunitiesAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          {{ $t('load_more') }}
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>
    </div>

    <Footer />
    <client-only>
      <div>    
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Community from '~/components/Community'
  import Footer from '~/components/Footer'
  //import PostModal from '~/components/PostModal'
  //import EditPostModal from '~/components/EditPostModal'
  import VoteModal from '~/components/VoteModal'

  import { mapGetters } from 'vuex'
  //import ChainSelection from '~/components/ChainSelection'

  export default {
    head () {
		return {
		  title: `Hive Communities - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of Hive Communities` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of Hive Communities` }
		  ]
		}
	},
	components: {
      NavbarBrand,
	  Community,
      //Post,
      Footer,
      //PostModal,
      //EditPostModal,
      //VoteModal,
	  //DailyActivityChartModal //,
	  //ChainSelection
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false, // loading state for loading more posts
		splitFactor: 9,
		inlineAds: 2,
		communitySubs: [],
      }
    },
	watch: {
	  user: 'fetchUserData',
	  bchain: async function(newBchain) {
		if (this.cur_bchain != newBchain && !this.loading){
			//only update if changed
			console.log('user activity change in chain '+newBchain);
			this.cur_bchain = newBchain;
			await this.$store.dispatch('steemconnect/refreshUser');
			
			// reset previously fetched posts to get latest
			//this.$store.commit('setUserPosts', [])

			// disable load more button and only show if there actually are more posts to load
			this.$store.commit('setMoreCommunitiesAvailable', false)
			console.log('dispatch fetching communities')
			
			await this.fetchUserCommunities();
			
			await this.$store.dispatch('fetchCommunities')
			this.loading = false
		}
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['communitiesList', 'moreCommunitiesAvailable', 'bchain']),

      
    },
    methods: {
	  isUserSubscribed(community){
		//console.log('subscribed')
		//console.log(this.communitySubs)
		if (this.communitySubs.length <1)
			return false;
		const containsCommunity = this.communitySubs.some(([entry]) => entry === community.name);
		return containsCommunity;
		
	  },
	  async fetchUserCommunities(){
		if (this.user){
			this.communitySubs = await this.$store.dispatch('fetchUserCommunitySubs');
			console.log('community subs')
			console.log(this.communitySubs);
		}
	  },
      async loadMore () {
        this.loadingMore = true
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
		console.log('dispatch MORE fetching user posts')

        await this.$store.dispatch('fetchCommunities')
        this.loadingMore = false
      },
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){	  
		  
		  if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			  //update user info from blockchain
			  let user_data = await this.$steemconnect.me();
			  this.user.account = user_data.account;
		  }
		  //ensure we fetch proper logged in user data
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		}
	  },
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();

      // fetch communities
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  this.$store.commit('setBchain', cur_bchain);

      // disable load more button and only show if there actually are more posts to load
      this.$store.commit('setMoreCommunitiesAvailable', false)
	  
	  await this.fetchUserCommunities();
	  
      await this.$store.dispatch('fetchCommunities')
	  
	  
      // remove loading indicator
      this.loading = false
    }
  }
</script>
