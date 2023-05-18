<template>
  <!-- blog listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ username }}'s {{$t('Blog')}} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>
	  <!--<ChainSelection />-->
	  
      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  
	  <div class="text-center p-3" v-else-if="user && user.account.name == username">
		<a href="#" @click="initiateNewPost" data-toggle="modal"
			 data-target="#editPostModal" :title="$t('Create_post')" class="btn btn-brand border">
			{{ $t('Create_post') }}
		</a>
	  </div>
	  <div class="row text-right">
		<div class="col-12 pb-2"><a :href="'/'+username+'/comments'" class="btn btn-brand border"  :title="$t('view_comments')"><i class="far fa-comments"></i></a>&nbsp;<a :href="'/'+username+'/videos'" class="btn btn-brand border"  :title="$t('view_videos')"><i class="fas fa-video"></i></a></div>
	  </div>
	  
      <!-- show listing when loaded -->
	  <div class="row" v-if="userPosts.length">
		<div class="row"  v-for="iterx in Math.ceil(userPosts.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Post v-if="(iterx - 1) * splitFactor + (itery - 1) < userPosts.length" :post="userPosts[(iterx - 1) * splitFactor + (itery - 1)]" :displayUsername="username" :pstId="(iterx - 1) * splitFactor + (itery - 1)"/>
			</div>
			<!--<div class="col-md-6 col-lg-12 mb-4" v-if="(iterx - 1) < inlineAds">
				<client-only>
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
				</client-only>
			</div>-->
		</div>
      </div>

      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!userPosts.length && !loading">
        {{ username }} {{ $t('error_no_posts') }}
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreUserPostsAvailable">
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
		  title: `Blog Posts by ${this.username} - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of blog posts by ${this.username}` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of blog posts by ${this.username}` }
		  ]
		}
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
			this.$store.commit('setUserPosts', [])

			// disable load more button and only show if there actually are more posts to load
			this.$store.commit('setMoreUserPostsAvailable', false)
			console.log('dispatch fetching user posts')
			console.log(this.username)
			await this.$store.dispatch('fetchUserPosts', this.username)
			this.loading = false
		}
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['userPosts', 'moreUserPostsAvailable', 'activePost', 'bchain']),

      // get username from url
      username () {
	    if (this.$route.params.username.startsWith('@')){
		  return this.$route.params.username.substring(1, this.$route.params.username.length);
		}
        return this.$route.params.username
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
			if (pstId < this.userPosts.length){
				pstId += 1;
				proceed = true;
			}
		}
		if (proceed){
			this.userPosts[pstId].pstId = pstId;
			this.$store.commit('setActivePost', this.userPosts[pstId]);
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
		console.log(this.username)

        await this.$store.dispatch('fetchUserPosts', this.username)
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

      // fetch posts
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  this.$store.commit('setBchain', cur_bchain);
	  
      // reset previously fetched posts to get latest
      this.$store.commit('setUserPosts', [])

      // disable load more button and only show if there actually are more posts to load
      this.$store.commit('setMoreUserPostsAvailable', false)
	  
      await this.$store.dispatch('fetchUserPosts', this.username)
	  
	  //console.log(this.userPosts);

      // remove loading indicator
      this.loading = false
    }
  }
</script>
