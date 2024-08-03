<template>
  <!-- single post item for activity pages -->
  <div >
    <div class="card post" :class="{'card-subscribed':userSubscribed}">
      <h6 class="mb-0 text-center post-title">
        <!--<a :href="community.url" target="_blank">-->
		<a :href="buildLink+'/posts'" target="_blank">
          {{ truncateString(community.title, 70) }}
		  <i class="fas fa-external-link-alt"></i>
        </a>
      </h6>
	
      <div class="post-body">
        <div class="row col-12">
			<div class="col-6">
			<a :href="community.name" class="text-brand" >
				<img :src="$getCommunityLogo(community.name)" :alt="community.title" class="community-image" >
			</a>
		  </div>
          <div class="col-6">
			<!--<small class="text-muted d-block" :title="date">Created {{ $getTimeDifference(this.community.created_at) }}</small>-->
			<div ><a :href="buildLink" target="_blank" class="text-brand">#{{community.name}}</a></div>
			<div>{{community.about}}</div>
			<small class="text-right curs-point" :title="'Created '+date"><i class="fas fa-calendar"></i>&nbsp;Since {{date}}</small>
            <!--<a :href="'/'+community.author" target="_blank">
			
              <div class="user-avatar mr-1"
                   :style="'background-image: url('+profImgUrl+'/u/' + community.author + '/avatar)'"></div>
              <small class="d-inline-block align-top">@{{ community.author }}</small>
			  
            </a>-->
          </div>
          
        </div>
		
		<div class="details m-2 text-center">
			<div class="row mb-2">
				<div class="col-3 curs-point">
					<i class="fa-solid fa-users m-1" :title="$t('subscribers')"><span class="m-1 font-weight-normal">{{$numberFormat(community.subscribers)}}</span></i>
				</div>
				
				<div class="col-3 curs-point">
					<i class="fa-solid fa-user-pen m-1" :title="$t('authors')"><span class="m-1 font-weight-normal">{{$numberFormat(community.num_authors)}}</span></i>
				</div>
				
				<div class="col-3 curs-point">
					<i class="fa-solid fa-book-open m-1" :title="$t('comm_posts')"><span class="m-1 font-weight-normal">{{$numberFormat(community.num_pending)}}</span></i>
				</div>
				
				<div class="col-3 curs-point">
					<i class="fa-solid fa-hourglass m-1" :title="$t('pending_rewards')"><span class="m-1 font-weight-normal">{{$numberFormat(community.sum_pending)}}</span></i>
				</div>
				
			</div>
			<div class="text-center text-brand col-12">{{$t('admins')}}</div>
			<div class="row col-12">
				<div v-for="(admin, index) in community.admins" :key="index" :admin="admin" class="m-1 p-1 admin-name">
					<a :href="'./'+admin">
						<div class="user-avatar mr-1" :style="'background-image: url('+profImgUrl+'/u/' + admin + '/avatar)'"></div>
						@{{admin}}
					</a>
				</div>
			</div>
		</div>
		
        <div class="row details mt-2">
         
          <div class="col-12 text-center">
				
			  <div class="text-center"><a :href="buildLink+'/posts'" class="btn btn-brand btn-lg btn-white border m-1">{{ $t('Posts') }}</a>
				  <a v-if="user && user.account.name" href="#a" class="btn btn-brand btn-lg btn-white m-1 border" v-on:click="subscribe()">
					<span v-if="userSubscribed">{{ $t('Unsubscribe') }}</span>
					<span v-else>{{ $t('Subscribe') }}</span>
					<i class="fas fa-spin fa-spinner" v-if="loading"></i>
				  </a>
			  </div>
          </div>
        </div>
		
		
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  //import SocialSharing from 'vue-social-sharing'
  
  //import vueRemarkable from 'vue-remarkable';

  import sanitize from 'sanitize-html'

  export default {
    props: ['community', 'pstId', 'userSubscribed'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['moderators']),
	  buildLink(){
		return './'+this.community.name;
	  },
      date() {
        let date = new Date(this.community.created_at)
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() ;
      },
	  appType() {
        return this.meta.appType
      },
	  appVersion() {
        return this.meta.app
      },
      meta() {
		try{
			return JSON.parse(this.community.json_metadata)
		}catch(err){
			//console.log(this.community.json_metadata);
			//console.log(err);
			return {};
		}
      },
	  
	  votedByUser() {
		return this.postUpvoted;
	  },
	  getVoteCount(){
		return Array.isArray(this.community.active_votes)?this.community.active_votes.length:0;
	  },
	  isUserModerator() {
		if (this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
		  return true;
		}
		return false;
	  }
	  	  
    }, 
	data: function(){
		return {
			afitReward: '',
			userRank: '',
			//fullAFITReward: '',
			postUpvoted: false,
			cur_bchain: 'HIVE',
			profImgUrl: process.env.hiveImgUrl,
			loading: false,
			//socialSharingTitle: process.env.socialSharingTitle,
			//socialSharingDesc: process.env.socialSharingDesc,
			//socialSharingQuote: process.env.socialSharingQuote,
			//hashtags: process.env.socialSharingHashtags,
		}
	},
	components: {
		//SocialSharing,
		//vueRemarkable
	},
	watch: {
	  postUpvoted: 'updatePostData',
	},
	methods: {
	  async subscribe(){
		let cstm_params;
		if (this.userSubscribed){
			let userConf = confirm(this.$t('confirm_user_unsubsribe').replace('_COMMN_', this.community.title));
			if (!userConf) {
			  return;
			}
			this.loading = true;
			//user is subscribed, unsubscribe
			cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'community',
				json: "[\"unsubscribe\",{\"community\":\""+this.community.name+"\"}]"//JSON.stringify([])
			};
			this.community.added = false;
		}else{
			let userConf = confirm(this.$t('confirm_user_subsribe').replace('_COMMN_', this.community.title));
			if (!userConf) {
			  return;
			}
			this.loading = true;
			//user is subsribing
			cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'community',
				json: "[\"subscribe\",{\"community\":\""+this.community.name+"\"}]"//JSON.stringify([])
			};
			this.community.added = true;
			/*[
			  "custom_json",
			  {
				"required_auths": [],
				"required_posting_auths": ["alice"],
				"id": "community",
				"json": "[\"subscribe\",{\"community\":\"hive-123456\"}]"
			  }
			]*/
		}
		let res = await this.$processTrxFunc('custom_json', cstm_params, false);
		console.log(res)
		if (res.success){
			//update community status
			this.$emit('update-community', this.community);
		}
		this.loading = false;
	  },
	  
	  //function handles displaying cut off version of text to avoid lengthy titles
	  truncateString(str, ln) {
		  if (str.length > ln) {
			return str.substring(0, ln-3) + "...";
		  }
		  return str;
	  },
	  
	  /* function handles confirming if the user had voted already to prevent issues */
	  votePrompt(e) {
		//if no user is logged in, prompt to login
		if (!this.user){
		  alert(this.$t('need_login_signup_notice_vote'));
		  e.stopPropagation();
		}else{
		  //proceed normally showing vote popup
		  this.$store.commit('setPostToVote', this.post)
		}
	  },
	  newlyVotedPostsQuery() {
		//handles returning a list of recently manually upvoted on this current session
		return this.newlyVotedPosts.length;
	  },
	  setProperNode (){
		let properNode = hive;
		if (this.cur_bchain == 'STEEM'){
			properNode = steem;
		}
		return properNode;
	  },
	  
	},
	async mounted () {
		//console.log(this.community);
		//console.log('post details');
		//console.log(this.post);
		//return;
		
		
		//grab post full pay if full pay mode enabled
		//fetch(process.env.actiAppUrl+'getPostFullAFITPayReward?user=' + this.community.author+'&url='+this.community.url).then(res => {
			//res.json().then(json => this.fullAFITReward = json.token_count)}).catch(e => reject(e))
		
		//grab moderators' list
		this.$store.dispatch('fetchModerators')
		
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
	},
	
  }
</script>

<style lang="sass">
  .post
    height: 100%
    h6
      background: #ff112d
      padding: 8px 10px
      a
        color: #fff
    .post-body
      padding: 8px 10px
    a
      color: #333
      &:hover
        text-decoration: none
    .details
      line-height: 1rem
    .user-avatar
      width: 20px
      height: 20px
      background-position: center center
      background-size: cover
      border-radius: 50%
      float: left
      border: solid 1px #ddd
</style>
<style>
	.full-afit-txt{
	  font-style: italic;
	}
	.check-tooltip{
	  color: white;
	}
	.increased-rank{
		color: #76BB0E;
	}
	.post-title{
		min-height: 60px;
	}
	.card{
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
		overflow: hidden;
	}
	.card-subscribed{
		box-shadow: 3px 3px 3px rgba(0, 255, 0, 0.4);
		overflow: hidden;
	}
	.community-image{
		width: 150px;
		height: 150px;
		object-fit: scale-down;
	}
	.curs-point{
		cursor: pointer;
	}
</style>
