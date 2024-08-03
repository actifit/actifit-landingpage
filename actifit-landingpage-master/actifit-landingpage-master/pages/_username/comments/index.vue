<template>
  <!-- comment listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ $t('Comments_by') }} {{ username }}</h2>
	  <!--<ChainSelection />-->
	  
      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>

      <!-- show listing when loaded -->
	  <!--<div class="row" v-if="userComments.length">
		<div v-for="comment in userComments" :key="comment.id">
			{{comment.title}}
		</div>
	  </div>-->
	  <!--<div class="row col-md-12" v-if="userComments.length">
		<span class="col-md-5"></span>
		<select v-model="currentSort" class="form-control col-md-3 sel-adj">
            <option value="">-- {{$t('Sort_By')}} --</option>
			<option :value="JSON.stringify({value: 'created', direction: 'asc'})">{{$t('Date')}}▲</option>
			<option :value="JSON.stringify({value: 'created', direction: 'desc'})">{{$t('Date')}}▼</option>
		</select>
	  </div>-->
	  
	  <div class="row text-right">
		<div class="col-12 pb-2"><a :href="'/' + username+'/blog'" class="btn btn-brand border" :title="$t('view_blog')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a :href="'/' + username +'/videos'" class="btn btn-brand border" :title="$t('view_videos')"><i class="fa-solid fa-video"></i></a></div>
	  </div>
	  
	   <div class="row" v-if="userComments.length">
		<div class="row"  v-for="iterx in Math.ceil(userComments.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Post v-if="(iterx - 1) * splitFactor + (itery - 1) < userComments.length" :post="userComments[(iterx - 1) * splitFactor + (itery - 1)]" :displayUsername="username" :pstId="(iterx - 1) * splitFactor + (itery - 1)"/>
			</div>
			<!--<div class="col-md-6 col-lg-4 mb-4" v-if="(iterx - 1) < inlineAds">
				<client-only>
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
				</client-only>
			</div>-->
		</div>
      </div>
    
      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!userComments.length && !loading">
        {{ username }} {{ $t('error_no_comments') }}
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreUserCommentsAvailable">
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

  import Lodash from 'lodash'
  
  export default { 
	head () {
		return {
		  title: `Comments by ${this.username} - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Comments by ${this.username}` },
			{ hid: 'ogdescription', name: 'og:description', content: `Comments by ${this.username}` }
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
	  //ChainSelection
    },
	data () {
		return {
			loading: true, // initial loading state
			loadingMore: false, // loading state for loading more comments
			splitFactor: 9,
			inlineAds: 2,
			//currentSort: JSON.stringify({value: 'created', direction: 'desc'}),
		}
	},
	watch: {
	  user: 'fetchUserData',
	  //currentSort: 'reorderComments',
	  bchain: async function(newBchain) {
		console.log('user activity change in chain '+newBchain);
		this.cur_bchain = newBchain;
		await this.$store.dispatch('steemconnect/refreshUser');
		
		// reset previously fetched posts to get latest
		this.$store.commit('setUserComments', [])

		// disable load more button and only show if there actually are more posts to load
		this.$store.commit('setMoreUserCommentsAvailable', false)
		await this.$store.dispatch('fetchUserComments', this.username)
		this.loading = false
		//this.reload += 1;
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['userComments', 'moreUserCommentsAvailable', 'activePost', 'bchain']),
	  
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
			if (pstId < this.userComments.length){
				pstId += 1;
				proceed = true;
			}
		}
		if (proceed){
			this.userComments[pstId].pstId = pstId;
			this.$store.commit('setActivePost', this.userComments[pstId]);
		}
	  },
	  async reorderComments(){
		try{
			//console.log(this.currentSort);
			let sortApproach = JSON.parse(this.currentSort);
			//console.log(sortApproach.value);
			if (sortApproach.value){
				console.log(sortApproach.value);
				/*if (sortApproach.value == 'price'){
					this.userComments = _.orderBy(this.userComments, function(e) { return e.price[0].price },[sortApproach.direction]);
				}else{*/
					//this.userComments = 
					let ordList = this.userComments;
					ordList = _.orderBy(ordList, [sortApproach.value],[sortApproach.direction]);
					this.$store.commit('setUserComments', ordList);
				//}
				this.$forceUpdate();
			}
		}catch(err){
			console.log(err);
		}
	  },
	  async loadMore () {
        this.loadingMore = true
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
	  
        await this.$store.dispatch('fetchUserComments', this.username)
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
      /*this.$store.commit('setUserComments', [])

      // disable load more button and only show if there actually are more posts to load
      this.$store.commit('setMoreUserCommentsAvailable', false)
	  
      await this.$store.dispatch('fetchUserComments', this.username)

      // remove loading indicator
      this.loading = false*/
    }
	
  }
</script>
<style>
.sel-adj{
	margin-bottom: 3px;
  }
.comment-info{
  overflow: auto;
  padding-top: 10px;
  padding-bottom: 0px; 
  border: 1px solid #e9ecef;
}
.user-avatar{
  width: 20px;
  height: 20px;
  background-position: center center;
  background-size: cover;
  border-radius: 50%;
  float: left;
  border: solid 1px #ddd;
}
</style>