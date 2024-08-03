<template>
  <!-- community listing post listing -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5" v-if="communityData.title">
      <h2 class="text-center mb-5">{{ communityData.title }} {{$t('comm_posts')}} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>
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
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  
	  <!--<div class="text-center p-3" v-else-if="user && user.account.name == community">
		<a href="#" @click="initiateNewPost" data-toggle="modal"
			 data-target="#editPostModal" :title="$t('Create_post')" class="btn btn-brand border">
			{{ $t('Create_post') }}
		</a>
	  </div>-->
	  
	  
      <!-- show listing when loaded -->
	  <div class="row" v-if="communityPosts.length">
		<div class="row"  v-for="iterx in Math.ceil(communityPosts.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Post v-if="(iterx - 1) * splitFactor + (itery - 1) < communityPosts.length" :post="communityPosts[(iterx - 1) * splitFactor + (itery - 1)]" :pstId="(iterx - 1) * splitFactor + (itery - 1)"/>
			</div>
			<!--<div class="col-md-6 col-lg-12 mb-4" v-if="(iterx - 1) < inlineAds">
				<client-only>
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
				</client-only>
			</div>-->
		</div>
      </div>

      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!communityPosts.length && !loading">
        {{ community }} {{ $t('error_no_posts') }}
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

  import { mapGetters } from 'vuex'
  //import ChainSelection from '~/components/ChainSelection'

  export default {
    head () {
		return {
		  title: `${this.communityData.title} Community Posts - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `${this.communityData.title} Community Posts` },
			{ hid: 'ogdescription', name: 'og:description', content: `${this.communityData.title} Community Posts` }
		  ]
		}
	},
	async asyncData ({params, store}) {
		let community = params.tag;
		let communityData = await store.dispatch('fetchSpecificCommunity', community);
		let meta_spec = {
			postTitle: communityData.title,
		}
		//.desc = desc;
		return {communityData, meta_spec};
	},
	components: {
      NavbarBrand,
      Post,
      Footer,
      PostModal,
      EditPostModal,
      VoteModal,
	  //DailyActivityChartModal //,
	  //ChainSelection
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false, // loading state for loading more posts
		splitFactor: 9,
		inlineAds: 2,
		type: 'trending',//defines the type of posts to be displayed: trending/hot/created
		//communityData: {},//contains additional details about the community
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
			this.$store.commit('setCommunityPosts', [])

			// disable load more button and only show if there actually are more posts to load
			this.$store.commit('setMoreCommunityPostsAvailable', false)
			console.log('dispatch fetching user posts')
			console.log(this.community)
			await this.$store.dispatch('fetchCommunityPosts', {community:this.community, type:this.type})
			this.loading = false
		}
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['communityPosts', 'moreCommunityPostsAvailable', 'activePost', 'bchain']),

      // get community from url
      community () {
		//console.log(this.$route.params);
	    /*if (this.$route.params.tag.startsWith('@')){
		  return this.$route.params.community.substring(1, this.$route.params.community.length);
		}*/
        return this.$route.params.tag
      }
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
      async loadMore () {
        this.loadingMore = true
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
		console.log('dispatch MORE fetching user posts')
		console.log(this.community)
		let lastPost = this.communityPosts[this.communityPosts.length -1];
        await this.$store.dispatch('fetchCommunityPosts', {community:this.community, type:this.type, lastAuth: lastPost.author, lastPerm: lastPost.permlink})
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
	  async reFetchCommunityPosts(){
		this.loading = true
		this.$store.commit('setCommunityPosts', [])
		await this.$store.dispatch('fetchCommunityPosts', {community:this.community, type:this.type})
		//this.communityData = await this.$store.dispatch('fetchSpecificCommunity', this.community);
		this.loading = false
	  }
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();

      // fetch posts
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  this.$store.commit('setBchain', cur_bchain);
	  
      // reset previously fetched posts to get latest
      this.$store.commit('setCommunityPosts', [])

      // disable load more button and only show if there actually are more posts to load
      this.$store.commit('setMoreCommunityPostsAvailable', false)
	  console.log('fecth community posts')
      await this.$store.dispatch('fetchCommunityPosts', {community:this.community, type:this.type})
	  //this.communityData = await this.$store.dispatch('fetchSpecificCommunity', this.community);
	  //console.log(this.communityPosts);

      // remove loading indicator
      this.loading = false
    }
  }
</script>
