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
			<select v-model="type" class="form-control sel-adj col-3">
				<option disabled>-- {{$t('Sort_By')}} --</option>
				<option value="trending">{{$t('Trending')}}</option>
				<option value="hot">{{$t('Hot')}}</option>
				<option value="created">{{$t('New')}}</option>
			</select>
	  </div>
		<h3>{{$t('filter_content_by_pop_community')}}</h3>
		<div v-if="popComms && popComms.length > 0" class="row comm-container" ref="comm-container">
			<span v-for="(selComm) in popComms" :key="selComm[0]+'chk'" class="comm-selector col-3">
				<input type="checkbox" :ref="selComm[0]+'chk'" :id="selComm[0]+'chk'" @change="($event) => handleCheckboxChange($event, selComm[0], selComm[1])">
				<!--<a :href="selComm[0]" class="text-brand" >-->
					
					<label :for="selComm[0]+'chk'" :value="selComm[1]"><img :src="$getCommunityLogo(selComm[0])" :alt="selComm[1]" class="community-image" >{{selComm[1]}}</label>
				<!--</a>-->
			</span>
		</div>
		<div v-else>
			<i class="fas fa-spinner fa-spin text-brand"></i>
		</div>
		<span v-if="popComms && popComms.length > 0" class="expander"><i ref="switcher" title="Show More Communities" class="fas fa-solid fa-arrow-circle-down text-brand" @click="expandComms"></i></span>
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
	  <!--<div class="row text-right">
		<div class="col-12 pb-2"><a :href="'/'+username+'/comments'" class="btn btn-brand border"  :title="$t('view_comments')"><i class="far fa-comments"></i></a>&nbsp;<a :href="'/'+username+'/videos'" class="btn btn-brand border"  :title="$t('view_videos')"><i class="fas fa-video"></i></a></div>
	  </div>-->
	  
	  <!--<div class="vid-container" v-if="communityPosts.length">
		
			<Post v-for="iterx in communityPosts.length" :key="iterx" :post="communityPosts[(iterx - 1)]" :displayUsername="username" :pstId="(iterx - 1)" class="card post w-25 p-1 m-1 " explorePost="true"/>
		
	  </div>-->
		<div v-for="(community, index) in selCommunities" :key="index" :community="community">
			<CommunityContent :community='community[0]' :type="type" />
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
  import Vue from 'vue'
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
		type: 'trending',//default
		username: '',
		popComms: [],
		//supportedCommunities:['hive-181335', 'hive-193552', 'hive-163772', 'hive-174578' ,'hive-193084'],
		defaultCommunities: [['hive-181335', '3Speak'], ['hive-193552', 'Actifit'], ['hive-163772', 'Pinmapple'] , ['hive-174578', 'OCD'],['hive-193084', 'dbuzz'], ['hive-167922', 'LeoFinance'], ['hive-13323','Splinterlands'], ['hive-147010', 'Liketu']],
		selCommunities: [],
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
		isChecked() {
			return (value) => {
				console.log(value);
				let matrix = this.selCommunities;
				if (!matrix || matrix.length < 1) return false;
				if (matrix && matrix.length > 0){
					matrix = matrix [0];
				}
				for (let i = 0; i < matrix.length; i++) {
					for (let j = 0; j < matrix[i].length; j++) {
						if (matrix[i][j] === value) {
							return "checked"; // Found the target value
						}
					}
				}
				return false; // Target value not found
			}
		},
      
    },
    methods: {
		expandComms(){
			this.$nextTick(() => {
			
				this.$refs['switcher'].classList.toggle('fa-arrow-circle-up');
				this.$refs['switcher'].classList.toggle('fa-arrow-circle-down');
				
				this.$refs['comm-container'].classList.toggle('comm-container');
			});
		},
		handleCheckboxChange ( e, param1, param2){
			console.log(e);
			console.log(param1)
			console.log(param2)
			let tgtEntry = [param1, param2];
			if (e.target.checked){
				//load
				this.selCommunities.push(tgtEntry);
			}else{
				//remove
				this.selCommunities = this.selCommunities.filter(entry => !this.arraysAreEqual(entry, tgtEntry));
			}
			return true;
		},
		arraysAreEqual(arr1, arr2) {
		  return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
		},
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
		console.log('fetchUserData')
		if (typeof this.user != 'undefined' && this.user != null){	  
		  console.log('user data available')
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
	  
		//grab popular communities
		this.popComms = await this.$store.dispatch('fetchPopCommunities');
		//console.log(this.popComms);
	  
		let defaultSet = new Set(this.defaultCommunities.map(JSON.stringify));
		let selSet = new Set(this.popComms.map(JSON.stringify));
		//console.log('default')
		//console.log(defaultSet);
		// Merge the sets
		let combinedSet = new Set([...defaultSet, ...selSet]);
		//console.log(combinedSet);
		this.popComms = [];
		this.popComms = Array.from(combinedSet).map(JSON.parse);
		this.$nextTick(() => {
			for (let j=0;j<this.defaultCommunities.length;j++){
				this.$refs[this.defaultCommunities[j][0]+'chk'][0].checked = true;
			}
		});
		this.selCommunities = this.defaultCommunities;
		//console.log('popComms');
		//console.log(this.popComms);
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
.community-image{
	width: 50px;
	height: 50px;
	object-fit: scale-down;
}
/* styling back and fwd buttons */
/* Scroll buttons */
.scroll-button {
  position: absolute;
  top: 50%;
  font-size: 64px;
  background-color: transparent;
  color: red;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
  transform: translateY(-50%);
}

/* Left button */
.scroll-button.left {
  left: 0;
}

/* Right button */
.scroll-button.right {
  right: 0;
}

/* Change button color on hover */
.scroll-button:hover {
  background-color: rgba(255, 0, 0, 0.2);
}
.comm-selector{
	padding: 2px;
}
.comm-container{
	max-height: 50px;
	overflow-y: hidden;
}
.fa-arrow-circle-down{
	cursor: pointer;
}
.expander{
	float:right; 
	font-size: 28px;
}
</style>
