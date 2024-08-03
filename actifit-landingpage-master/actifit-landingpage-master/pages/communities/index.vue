<template>
  <!-- blog listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ $t('Hive_communities') }} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>
	  <!--<ChainSelection />-->
	  
      
	  <div class="col-12 row p-2 m-2">
	  
		  <div v-if="user" class="col-3">
			<input type="checkbox" id="showOnlySubscribed" v-model="showOnlySubscribed" >
			<label for="showOnlySubscribed" class="ml-2">{{$t('Show_only_subscribed')}}</label>
		  </div>
		  
		  <div class="pr-2 pl-2 row col-6">
			<input type="text" id="search" name="search" :placeholder="$t('Search')" ref="search" class="form-control acti-shadow search-term col-6">
			<input type="button" id="go" name="go" value="Go" class="btn btn-brand btn-white border ml-2" v-on:click="performSearch" >

		  </div>

		  <div class="pl-2">
			  <select @change="reFetchCommunities" v-model="sortOrder" class="form-control sel-adj">
					<option disabled>-- {{$t('Sort_By')}} --</option>
					<option value="subs">{{$t('Subscribers')}}</option>
					<option value="rank">{{$t('Rank')}}</option>
					<option value="new">{{$t('New')}}</option>
			  </select>
		  </div>
	  
	  </div>
	  
	  <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  
	  
      <!-- show listing when loaded -->
	  <div class="row" v-if="finalCommList.length">
		<!--<div class="row"  v-for="iterx in Math.ceil(communitiesList.length / splitFactor)" :key="iterx">-->
			<div v-for="iterx in finalCommList.length" :key="iterx" class="col-md-6 col-lg-4 mb-4" v-if="showCommunity(finalCommList[iterx-1])" >
				<Community :community="finalCommList[(iterx - 1)]" :pstId="iterx - 1" :userSubscribed="isUserSubscribed(finalCommList[(iterx - 1)])" 
				@update-community="updateCommunity"/>
			</div>
			<!--<div class="col-md-6 col-lg-12 mb-4" v-if="(iterx - 1) < inlineAds">
				<client-only>
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
				</client-only>
			</div>
		</div>-->
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
		showOnlySubscribed: false,
		sortOrder: 'rank',//default by rank (options: subs, rank, new)
		finalCommList: [],
		filterActive: false,
		moreCommunitiesAvailable: false,
      }
    },
	watch: {
	  user: 'fetchUserData',
	  communitiesList: async function (){
		this.finalCommList = this.communitiesList;
	  },
	  bchain: async function(newBchain) {
		if (this.cur_bchain != newBchain && !this.loading){
			//only update if changed
			console.log('user activity change in chain '+newBchain);
			this.cur_bchain = newBchain;
			await this.$store.dispatch('steemconnect/refreshUser');
			
			// reset previously fetched posts to get latest
			//this.$store.commit('setUserPosts', [])

			// disable load more button and only show if there actually are more posts to load
			//this.$store.commit('setMoreCommunitiesAvailable', false)
			console.log('dispatch fetching communities')
			
			await this.$store.dispatch('fetchCommunities', {sortOrder: this.sortOrder})
			
			await this.fetchUserCommunities();
			
			this.moreCommunitiesAvailable = true;
			if (this.communitiesList.length < 1){
				this.moreCommunitiesAvailable = false;
			}

			
			this.loading = false
		}
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['communitiesList', 'bchain']),

      
    },
    methods: {
	  async performSearch(){
		if (this.$refs['search'].value==''){
			this.filterActive = false;
			//return;
		}else{
			this.filterActive = true;
		}
		await this.reFetchCommunities(null, this.$refs['search'].value.trim())
	  },
	  async updateCommunity (community) {
		//let ind = this.prodList.findIndex( product => (product._id === prod._id ));
		//this.prodList[ind] = prod;
		//await this.reFetchCommunities();
		console.log(community);
		if (community.added){
			this.communitySubs.push([community.name, community.title,'guest','']);
		}else{
			const index = this.communitySubs.findIndex(item => item[0] === community.name);
			if (index !== -1) {
			  this.communitySubs.splice(index, 1);
			}
			//this.communitySubs.push(community);
		}
		console.log(this.communitySubs);
		setTimeout(function (){this.$forceUpdate;console.log('updating')}, 2000);
		//this.$forceUpdate();
		//console.log('updateProd');
		//console.log(this.prodList[ind]);
	  },
	  showCommunity(community){
		//only active if user logged in and user selected to show only subscribed
		if (this.user && this.user.account.name){
			if (this.showOnlySubscribed && !this.isUserSubscribed(community))
				return false;
		}
		return true
	  },
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
			this.loading = true;
			this.communitySubs = await this.$store.dispatch('fetchUserCommunitySubs');
			console.log('community subs')
			console.log(this.communitySubs);
			//we also need to check if those communities are included in the current display list, if not, to add them
			await this.fetchUserMissingCommunities();
			this.loading = false;
		}
	  },
	  async fetchUserMissingCommunities() {
		  //only runs if no filtering is in place
		  if (this.filterActive) return;
		  
		  await Promise.all(this.communitySubs.map(async ([entry]) => {
			const exists = this.communitiesList.some(obj => obj.name === entry);
			console.log('extras');
			console.log(entry);
			console.log(exists);

			if (!exists) {
			  let commData = await this.$store.dispatch('fetchSpecificCommunity', entry);
			  this.communitiesList.push(commData);
			}
		  }));
		  //cleanup data
		  this.finalCommList = Object.values(this.communitiesList.reduce((acc, obj) => {
			  acc[obj.name] = obj;
			  return acc;
			}, {}));
		},
      async loadMore () {
        this.loadingMore = true
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
		console.log('dispatch MORE fetching user posts')

        await this.$store.dispatch('fetchCommunities', {sortOrder: this.sortOrder, last: this.communitiesList[this.communitiesList.length -1].name})
		
		this.moreCommunitiesAvailable = true;
		if (this.communitiesList.length < 1){
			this.moreCommunitiesAvailable = false;
		}
		
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
		  await this.fetchUserCommunities();
		}
	  },
	  async reFetchCommunities(event, query){
		this.loading = true;
		await this.$store.dispatch('fetchCommunities', {sortOrder: this.sortOrder, query: query})
		await this.fetchUserCommunities();
		this.loading = false;
	  }
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();

      // fetch communities
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  this.$store.commit('setBchain', cur_bchain);

      // disable load more button and only show if there actually are more posts to load
      //this.$store.commit('setMoreCommunitiesAvailable', false)
	  
      await this.$store.dispatch('fetchCommunities', {sortOrder: this.sortOrder})
	  
	  await this.fetchUserCommunities();
	  
		this.moreCommunitiesAvailable = true;
		if (this.communitiesList.length < 1){
			this.moreCommunitiesAvailable = false;
		}

      // remove loading indicator
      this.loading = false
    }
  }
</script>
<style>
.search-term{
	display: inline;
}
</style>