<template>
  <!-- blog listing for single user -->
  <div>
    

    <!-- listing -->
    <div class="container mb-2 pb-2 scroll-container">
      <!--<h2 class="text-center mb-5">{{ community }} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>-->
	  <!--<ChainSelection />-->
	  
      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  <div style="float:right" v-else>
		<a :href="community" class="text-brand" >
			<img :src="$getCommunityLogo(community)" :alt="community" class="community-image" >
		</a>
	  </div>
	  <div class="cmm-container content" :id="community" v-if="communityPosts.length">
		
		<Post v-for="iterx in communityPosts.length" :key="iterx" :post="communityPosts[(iterx - 1)]" :displayUsername="username" :pstId="(iterx - 1)" class="card post col-md-4 p-1 m-1 " explorePost="false"/>
		
			<!-- show load more button if there are more posts available -->
		<div class="text-center pt-5 moreblock pr-4" v-if="moreCommunityPostsAvailable">
			<a href="#" class="btn btn-brand" @click.prevent="loadMore()">
			  {{ $t('load_more') }}
			  <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
			</a>
		</div>
	  </div>
	  <button v-if="communityPosts.length" @click.prevent="scrollContent(community, -200, 0)" class="scroll-button left m-2 p-3">&lt;</button>
	  <button v-if="communityPosts.length" @click.prevent="scrollContent(community, 200, 0)" class="scroll-button right m-2 p-3">&gt;</button>
	  
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
    </div>

    <Footer />
    <client-only>
      <div>
	<!--<PostModal :post="activePost" @nextPost="nextPost(1)" @prevPost="nextPost(-1)"/>
    <EditPostModal />-->
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
  //import PostModal from '~/components/PostModal'
  //import EditPostModal from '~/components/EditPostModal'
  import VoteModal from '~/components/VoteModal'

  import { mapGetters } from 'vuex'
  //import ChainSelection from '~/components/ChainSelection'

  export default {
    props: ['community', 'type'],
	components: {
      //NavbarBrand,
      Post,
      //PostModal,
      //EditPostModal,
      VoteModal,
	  //DailyActivityChartModal //,
	  //ChainSelection
    },
    data () {
      return {
        loading: true, // initial loading state
        loadingMore: false, // loading state for loading more posts
		communityPosts: [],
		moreCommunityPostsAvailable: false,
		//community: 'hive-163772',//sample community
		//type: 'trending',
		username: '',
		activePost: '',
      }
    },
	watch: {
	  //user: 'fetchUserData',
	  type: 'reFetchCommunityPosts',
	  bchain: async function(newBchain) {
		if (this.cur_bchain != newBchain && !this.loading){
			//only update if changed
			console.log('user activity change in chain '+newBchain);
			this.cur_bchain = newBchain;
			await this.$store.dispatch('steemconnect/refreshUser');
			
			this.reFetchCommunityPosts();
		}
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
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
      async loadMore () {
        this.loadingMore = true
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
		console.log('dispatch MORE fetching user posts')
		
		let lastPost = this.communityPosts[this.communityPosts.length -1];
        
		let result = await this.$store.dispatch('fetchCommunityPosts', {community:this.community, type:this.type, lastAuth: lastPost.author, lastPerm: lastPost.permlink, returnData: true});
		
		let newPosts = result.posts;
		this.moreCommunityPostsAvailable = result.morePostsAvailable;
		if (Array.isArray(newPosts) && newPosts.length > 0){
			this.communityPosts = this.communityPosts.concat(newPosts);
		}
        this.loadingMore = false
      },
	  
	  async reFetchCommunityPosts(){
		this.loading = true
		let result = await this.$store.dispatch('fetchCommunityPosts', {community:this.community, type:this.type, returnData: true});
		this.communityPosts = result.posts;
		this.moreCommunityPostsAvailable = result.morePostsAvailable;
		this.loading = false
	  },
	  scrollContent(community, horizontal, vertical) {
		var content = document.querySelector('#'+community);
		content.scrollBy({
			top: vertical,
			left: horizontal,
			behavior: 'smooth'
		});
	  }
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  //this.fetchUserData();

      // fetch posts
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  this.$store.commit('setBchain', cur_bchain);
	  //this.$store.dispatch('steemconnect/login')
      this.reFetchCommunityPosts();
    }
  }
</script>
<style>
.cmm-container {
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
.moreblock{
	display: inline-block;
	vertical-align: top;
}
/* Container for the scrollable content */
.scroll-container {
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  /* border: 1px solid #ccc; Just for visual reference, you can remove this */
}

/* Content that can be scrolled */
.content {
  /*display: inline-block;*/
}

</style>
