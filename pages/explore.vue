<template>
  <!-- blog listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-2">
      <h2 class="text-center mb-2">{{ $t('Explore_hive') }} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>
	  <!--<ChainSelection />-->
	  
	  <div class="text-right col-12 row pb-2">
			<div class="col-9"/>
			<select @change="reFetchCommunityPosts" v-model="type" class="form-control sel-adj col-3">
				<option disabled>-- {{$t('Sort_By')}} --</option>
				<option value="trending">{{$t('Trending')}}</option>
				<option value="hot">{{$t('Hot')}}</option>
				<option value="created">{{$t('New')}}</option>
			</select>
	  </div>
	  
      <!-- show spinner while loading -->
      <!--<div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>-->
	  
	  <div class="text-center p-3" v-if="user && user.account.name == username">
		<a href="#" @click="initiateNewPost" data-toggle="modal"
			 data-target="#editPostModal" :title="$t('Create_post')" class="btn btn-brand border">
			{{ $t('Create_post') }}
		</a>
	  </div>
	  <div class="row text-right">
		<div class="col-12 pb-2"><a :href="'/'+username+'/comments'" class="btn btn-brand border"  :title="$t('view_comments')"><i class="far fa-comments"></i></a>&nbsp;<a :href="'/'+username+'/videos'" class="btn btn-brand border"  :title="$t('view_videos')"><i class="fas fa-video"></i></a></div>
	  </div>
	  
	  <!--<div class="vid-container" v-if="communityPosts.length">
		
			<Post v-for="iterx in communityPosts.length" :key="iterx" :post="communityPosts[(iterx - 1)]" :displayUsername="username" :pstId="(iterx - 1)" class="card post w-25 p-1 m-1 " explorePost="true"/>
		
	  </div>-->
	  <div v-for="(community, index) in supportedCommunities" :key="index" :community="community">
	  <CommunityContent :community='community' :type="type" />
	  </div>
      <!-- show listing when loaded -->
	  <!--<div class="row" >
		<div class="row"  v-for="iterx in Math.ceil(communityPosts.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Post v-if="(iterx - 1) * splitFactor + (itery - 1) < communityPosts.length" :post="communityPosts[(iterx - 1) * splitFactor + (itery - 1)]" :displayUsername="username" :pstId="(iterx - 1) * splitFactor + (itery - 1)"/>
			</div>
		</div>
      </div>-->

      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!communityPosts.length && !loading">
        {{ $t('no_posts') }}
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreCommunityPostsAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          {{ $t('load_more') }}
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>
    </div>

    <Footer />
    <client-only>
      <div>
	<PostModal :post="activePost" @nextPost="nextPost(1)" @prevPost="nextPost(-1)"/>
    <EditPostModal />
    <VoteModal />
    
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Post from '~/components/Post'
  import Footer from '~/components/Footer'
  import PostModal from '~/components/PostModal'
  import EditPostModal from '~/components/EditPostModal'
  import VoteModal from '~/components/VoteModal'
  import CommunityContent from '~/components/CommunityContent'

  import { mapGetters } from 'vuex'
  //import ChainSelection from '~/components/ChainSelection'

  export default {
    head () {
		return {
		  title: `Explore Hive Content - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of Various Community Content on Hive` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of Various Community Content on Hive` }
		  ]
		}
	},
	components: {
      NavbarBrand,
      //Post,
      Footer,
      PostModal,
      EditPostModal,
      VoteModal,
	  CommunityContent
	  //DailyActivityChartModal //,
	  //ChainSelection
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false, // loading state for loading more posts
		splitFactor: 9,
		inlineAds: 2,
		communityPosts: [],
		moreCommunityPostsAvailable: false,
		community: 'hive-163772',//sample community
		type: 'trending',
		username: '',
		supportedCommunities:['hive-151961', 'hive-193552', 'hive-163772', 'hive-174578' ,'hive-193084'],
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
			

		}
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['activePost']),
      //...mapGetters(['communityPosts', 'moreCommunityPostsAvailable', 'activePost', 'bchain']),

      
    },
    methods: {
	  nextPost (direction){
		let pstId = this.activePost.pstId;
		console.log(pstId);
		let proceed = false;
		if (direction < 0){
			console.log('move back');
			if (pstId >= 1){
				pstId -= 1;
				proceed = true;
			}
		}else{
			console.log('move front');
			if (pstId < this.communityPosts.length){
				pstId += 1;
				proceed = true;
			}
		}
		if (proceed){
			this.communityPosts[pstId].pstId = pstId;
			this.$store.commit('setActivePost', this.communityPosts[pstId]);
		}
	  },
	  initiateNewPost($event) {
		$event.preventDefault();
		let newPost = {};
		newPost.isNewPost = true;
		this.$store.commit('setEditPost', newPost);
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
	  
	  reFetchCommunityPosts(){
		this.$forceUpdate();
	  }
	  
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
    }
  }
</script>
<style>
.vid-container {
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    min-height: 100px;
}

.post {
    display: inline-block!important;
    min-height: 100px;
    background-color: #faebd7;
}

.vid-container::-webkit-scrollbar {
    height: 10px;
    background-color: #f5f5f5;
}

.vid-container::-webkit-scrollbar-thumb {
    background-color: #ff112d;
    border-radius: 5px;
}
</style>
