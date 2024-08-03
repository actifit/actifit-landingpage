<template>
  <!-- videos listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ username }}'s {{$t('Videos')}} <img src="/img/3speak.png" class="mr-2 token-logo-md"></h2>
	  <!--<ChainSelection />-->
	  
      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin text-brand"></i>
      </div>
	  
	  <div class="text-center p-3" v-else-if="user">
		<a :href="'/videos/new'" :title="$t('Create_Video')" target="_blank" class="btn btn-brand border">
			{{ $t('Create_Video') }}
		</a>
	  </div>
	  
	  <div class="row text-right">
		<div class="col-12 pb-2"><a :href="'/'+username+'/comments'" class="btn btn-brand border"  :title="$t('view_comments')"><i class="far fa-comments"></i></a>&nbsp;<a :href="'/'+username+'/blog'" class="btn btn-brand border"  :title="$t('view_blog')"><i class="fas fa-pen-to-square"></i></a></div>
	  </div>

      <!-- show listing when loaded -->
	  <div class="row" v-if="userVideos.length">
		<div class="row"  v-for="iterx in Math.ceil(userVideos.length / splitFactor)" :key="iterx">
			<div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
				<Post v-if="(iterx - 1) * splitFactor + (itery - 1) < userVideos.length" :post="userVideos[(iterx - 1) * splitFactor + (itery - 1)]" :displayUsername="username" />
			</div>
			<!--<div class="col-md-6 col-lg-4 mb-4" v-if="(iterx - 1) < inlineAds">
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
			</div>-->
		</div>
      </div>

      <!-- or no content message when no Videos found -->
      <div class="text-center text-muted" v-if="!userVideos.length && !loading">
        {{ username }} {{ $t('error_no_Videos') }}
      </div>

      <!-- show load more button if there are more Videos available -->
      <div class="text-center" v-if="moreUserVideosAvailable">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          {{ $t('load_more') }}
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>
    </div>

    <Footer />
	<client-only>    
      <div>

		<PostModal :post="activePost" />
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
		  title: `3Speak Videos by ${this.username} - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of Videos by ${this.username}` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of Videos by ${this.username}` }
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
        loadingMore: false, // loading state for loading more Videos
		splitFactor: 9,
		inlineAds: 2,
      }
    },
	watch: {
	  user: 'fetchUserData',
	  bchain: async function(newBchain) {
	    //only process if we are not loading
		if (!this.loading){
			console.log('bchain change')
			console.log('user activity change in chain '+newBchain);
			this.cur_bchain = newBchain;
			await this.$store.dispatch('steemconnect/refreshUser');
			
			// reset previously fetched Videos to get latest
			await this.$store.commit('setUserVideos', [])

			// disable load more button and only show if there actually are more Videos to load
			this.$store.commit('setMoreUserVideosAvailable', false)
			console.log('dispatch fetching user Videos')
			console.log(this.username)
			await this.$store.dispatch('fetchUserVideos', this.username)
			this.loading = false
		//this.reload += 1;
		}
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['userVideos', 'moreUserVideosAvailable', 'activePost', 'bchain']),

      // get username from url
      username () {
	    if (this.$route.params.username.startsWith('@')){
		  return this.$route.params.username.substring(1, this.$route.params.username.length);
		}
        return this.$route.params.username
      }
    },
    methods: {
      async loadMore () {
        this.loadingMore = true
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', cur_bchain);
		console.log('dispatch MORE fetching user Videos')
		console.log(this.username)

        await this.$store.dispatch('fetchUserVideos', this.username)
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

      // fetch Videos
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  await this.$store.commit('setBchain', cur_bchain);
	  
      // reset previously fetched Videos to get latest
      await this.$store.commit('setUserVideos', [])

      // disable load more button and only show if there actually are more Videos to load
      await this.$store.commit('setMoreUserVideosAvailable', false)
	  
	  console.log('mounted dispatch videos')
	  
      let res = await this.$store.dispatch('fetchUserVideos', this.username)
	  console.log('done fetching vids')
	  console.log(res);
      // remove loading indicator
      this.loading = false
    }
  }
</script>
