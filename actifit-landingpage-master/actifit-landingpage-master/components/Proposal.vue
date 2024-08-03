<template>
  <!-- single post item for activity pages -->
  <div >
    <div class="card post" :class="{'card-subscribed':userSubscribed}">
      <!--<h6 class="mb-0 text-center post-title">
        
		<a :href="buildLink+'/posts'" target="_blank">
          {{ truncateString(proposal.title, 70) }}
		  <i class="fas fa-external-link-alt"></i>
        </a>
      </h6>--><!--<a :href="proposal.url" target="_blank">-->
	
      <div class="post-body" v-if="proposal">
        <div class="row">
			<div class="col-2">{{proposal.proposal_id}}</div>
			<div class="col-2">
				<div>
				<a :href="proposal.creator" class="text-brand" >
					<div class="user-avatar m-1"
                   :style="'background-image: url('+profImgUrl+'/u/' + proposal.creator + '/avatar)'"></div>{{proposal.creator}}
				</a>
				</div>
				<div v-if="proposal.receiver != proposal.creator">
				<a :href="proposal.receiver" class="text-brand" >	
					<span class="user-avatar m-1"
                   :style="'background-image: url('+profImgUrl+'/u/' + proposal.receiver + '/avatar)'"></span>--> {{proposal.receiver}}
				</a>
				</div>
			</div>
			<div class="col-4"><a :href="buildLink" target="_blank" class="text-brand">{{proposal.subject}}</a></div>
			
		</div>
		<div class="row">
			<div class="col-2"><span class="text-muted d-block" :title="proposal.start_date">Starts {{ this.proposal.start_date }}</span></div>
			
			<div class="col-2"><span class="text-muted d-block" :title="proposal.end_date">Ends: {{ this.proposal.end_date }}</span></div>
			
			<!--<div class="col-6">
			<a :href="proposal.name" class="text-brand" >
				<img :src="$getCommunityLogo(proposal.name)" :alt="proposal.title" class="community-image" >
			</a>
		  </div>-->
          
        </div>
		
		<div class="details m-2 text-center">
			<div class="row mb-2">
				<div class="col-3 curs-point">
					<div :title="$t('votes_HP')">
					<i class="fa-solid fa-thumbs-up m-1" >
					<span class="m-1 font-weight-normal">
					</span></i>
					{{$numberFormat(votesInHP)}} HP
					</div>
					<div :title="$t('votes_Vests')">
					<i class="fa-solid fa-thumbs-up m-1" >
					<span class="m-1 font-weight-normal">
					</span></i>
					{{ $numberFormat(proposal.total_votes / 1000 / 1000) }} VESTS
					</div>
				</div>
				
				<div class="col-3 curs-point">
					<i class="fa-solid fa-dollar-sign m-1" :title="$t('daily_pay')"><span class="m-1 font-weight-normal">{{$numberFormat(proposal.daily_pay.replace('HBD',''))}} HBD / day</span></i>
					<i class="fa-solid fa-dollar-sign m-1" :title="$t('total_max_pay')"><span class="m-1 font-weight-normal">{{$numberFormat(calculateProposalFullPay())}} HBD (total)</span></i>
				</div>
				
				<div class="col-3 curs-point">
					<i class="fa-solid fa-calendar m-1" :title="$t('total_days')"><span class="m-1 font-weight-normal">{{$getDaysDifference(proposal.start_date, proposal.end_date)}}</span></i>
					<i class="fa-solid fa-calendar m-1" v-if="proposalStarted" :title="$t('remaining_days')"><span class="m-1 font-weight-normal">Ends In {{proposalRemainingDays()}} Days</span></i>
					<i class="fa-solid fa-calendar m-1" v-else :title="$t('days_till_start')"><span class="m-1 font-weight-normal">Starts In {{proposalRemainingDays()}} Days</span></i>
				</div>
				
				<div class="col-3 curs-point">
					<i class="fa-solid fa-hourglass m-1" :title="$t('pending_rewards')"><span class="m-1 font-weight-normal">{{$numberFormat(proposal.sum_pending)}}</span></i>
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
    props: ['proposal'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['moderators']),
	  buildLink(){
		return './'+this.proposal.creator+'/'+this.proposal.permlink;
	  },
      date() {
        let date = new Date(this.proposal.created_at)
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
			return JSON.parse(this.proposal.json_metadata)
		}catch(err){
			//console.log(this.proposal.json_metadata);
			//console.log(err);
			return {};
		}
      },
	  
	  votedByUser() {
		return this.postUpvoted;
	  },
	  getVoteCount(){
		return Array.isArray(this.proposal.active_votes)?this.proposal.active_votes.length:0;
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
			properties: '', //handles the BC properties
			votesInHP: 0,
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
	  proposal: 'calculateVoteHP'
	},
	methods: {
	  calculateProposalFullPay(){
		let dailyVal = this.proposal.daily_pay.replace('HBD','');
		let fullDuration = this.$getDaysDifference(this.proposal.start_date, this.proposal.end_date);
		//console.log(fullDuration);
		return fullDuration * dailyVal;
	  },
	  proposalStarted(){
		const toStart = this.$getDaysDifference(this.proposal.start_date, new Date());
		if (toStart > 0){
			return false;
		}
	  },
	  proposalRemainingDays(){
		const toStart = this.$getDaysDifference(this.proposal.start_date, new Date());
		let remainingDays = 0;
		if ( toStart > 0){
			//proposal started. Calculate remaining days
			remainingDays = this.$getDaysDifference(new Date(), this.proposal.end_date);
		}else{
			remainingDays = toStart;
		}
		return remainingDays;
	  },
	  async calculateVoteHP(){
		this.votesInHP = await this.vestsToSteemPower(this.proposal.total_votes);
		//adjust to Millions
		this.votesInHP = this.votesInHP / 1000 / 1000;
	  },
	  async subscribe(){
		let cstm_params;
		if (this.userSubscribed){
			let userConf = confirm(this.$t('confirm_user_unsubsribe').replace('_COMMN_', this.proposal.title));
			if (!userConf) {
			  return;
			}
			this.loading = true;
			//user is subscribed, unsubscribe
			cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'community',
				json: "[\"unsubscribe\",{\"community\":\""+this.proposal.name+"\"}]"//JSON.stringify([])
			};
			this.proposal.added = false;
		}else{
			let userConf = confirm(this.$t('confirm_user_subsribe').replace('_COMMN_', this.proposal.title));
			if (!userConf) {
			  return;
			}
			this.loading = true;
			//user is subsribing
			cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'community',
				json: "[\"subscribe\",{\"community\":\""+this.proposal.name+"\"}]"//JSON.stringify([])
			};
			this.proposal.added = true;
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
	  async vestsToSteemPower (vests) {
		//function handles converting Vests to SP
		let chainLnk = await this.setProperNode();
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		}
		if (this.cur_bchain == 'STEEM'){
			let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			vests = Number(vests.split(' ')[0]);
			return (totalSteem * (vests / totalVests));
		}else if (this.cur_bchain == 'BLURT'){
			let totalSteem = Number(this.properties.total_vesting_fund_blurt.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			vests = Number(vests.split(' ')[0]);
			return (totalSteem * (vests / totalVests));
		}else{
			let totalSteem = Number(this.properties.total_vesting_fund_hive.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			vests = Number(vests.split(' ')[0]);
			return (totalSteem * (vests / totalVests));
		}
		
	  },
	  async steemPowerToVests (steemPower) {
	    //function handles conversting SP to Vests
		let chainLnk = await this.setProperNode();
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		}
		if (this.cur_bchain == 'STEEM'){
			let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
		}else if (this.cur_bchain == 'BLURT'){
			let totalSteem = Number(this.properties.total_vesting_fund_blurt.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
		}else{
			let totalSteem = Number(this.properties.total_vesting_fund_hive.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
		}
	  },
	  
	},
	async mounted () {
		//console.log(this.community);
		//console.log('post details');
		//console.log(this.post);
		//return;
		
		
		//grab post full pay if full pay mode enabled
		//fetch(process.env.actiAppUrl+'getPostFullAFITPayReward?user=' + this.proposal.author+'&url='+this.proposal.url).then(res => {
			//res.json().then(json => this.fullAFITReward = json.token_count)}).catch(e => reject(e))
		
		//grab moderators' list
		this.$store.dispatch('fetchModerators')
		
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
		this.calculateVoteHP();
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
