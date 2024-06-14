<template>
  <div :class="outserSmallScreenClasses" class="position-fixed text-brand mx-auto w-100 acti-notify-comp" v-if="innerShowModal || showCompDetails" id="friendshipModal" tabindex="-1">
	<div :class="smallScreenClasses" class="text-center mx-auto acti-notify-comp-inner-friend border-2 rounded" role="document">
	  <div :class="titleClass" class="row max-acti-width text-white mx-auto px-2">
		<div :class="mainTitleClass"><span>{{ $t('friendship_hook_title') }}</span>
		<span class="d-none d-md-inline-block font-italic"><br/>{{ $t('friendship_subtitle') }}</span></div>
		<div :class="closeBtnClass">
			<a href="#" @click.prevent="adjustVisibility" class="close expand-comp-notice text-white">
				<span>x</span>
			</a>
		</div>
	  </div>
	  
	<div class="row max-acti-width">
	  <div class="col-md-8 pr-0">
		<div class="friends-title">
		</div>
		<img class="friends-img" :src="'/img/fitness-friends-' + this.randImg+ '.jpg'">
	  </div>
	  
	  <div :class="scrollClasses">
		<div class="d-none d-md-block">{{ $t('suggested_friends') }}</div>
		<div v-if="suggFriendsLoader"><i class="fas fa-spin fa-spinner"></i></div>
		<div v-else v-for="(suggestion, index) in suggestedFriends" :key="index" :suggestion="suggestion" :class="suggEntryClass">
			<div class="col-md-4">
				<a :href="formattedProfileUrl(suggestion.author)" target="_blank">
					<div class="user-avatar large-avatar mr-1"
					   :style="'background-image: url('+profImgUrl+'/u/' + suggestion.author + '/avatar)'"></div>
				</a>
			</div>
			<div class="col-md-7 mini-user-card text-left">
				<span><a :href="formattedProfileUrl(suggestion.author)" target="_blank">@{{ suggestion.author }}</a></span>
				<span v-if="suggestion.rank != null" class="text-brand numberCircle d-none d-md-inline " >{{ displayCoreUserRank(suggestion.rank) }} <span class="increased-rank">{{ displayIncreasedUserRank(suggestion.rank) }}</span></span>
				<span v-else><i class="fas fa-spin fa-spinner"></i></span>
				
				<div v-if="suggestion.activityCount != null"><a :href="'/activity/'+suggestion.author" ><i class="fab fa-angellist mr-2 d-none d-md-inline"></i>{{ numberFormat(suggestion.activityCount, 0) }} {{ $t('Reports') }}</a></div>
				<div v-else><i class="fas fa-spin fa-spinner"></i></div>
				
				<div v-if="suggestion.afitCount != null"><img src="/img/actifit_logo.png" class="mr-2 token-logo"><a :href="formattedProfileUrl(suggestion.author)" >{{ numberFormat(suggestion.afitCount, 3) }} AFIT Tokens</a></div>
				<div v-else><i class="fas fa-spin fa-spinner"></i></div>
				
				<span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend(suggestion.author)" >
					<a href="#" class="btn btn-brand btn-block border"><i class="fas fa-user-friends  p-2" ></i></a>
				</span>
				<span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend(suggestion.author)">
					<a href="#" class="btn btn-brand btn-block border"><i class="fas fa-user-clock  p-2"></i></a>
				</span>
				<span :title="$t('add_username_friend').replace('_USERNAME_', suggestion.author)" v-else
					v-on:click="addFriend(suggestion.author)">
					<!--<i class="fas fa-user-plus  p-2"></i>
					<div v-if="addFriendError" v-html="addFriendError"></div>-->
					<a href="#" class="btn btn-brand btn-block border"><i class="fas fa-user-plus  p-2"></i></a>
					<i class="fas fa-spin fa-spinner" v-if="friendshipLoader == suggestion.author"></i>
					<div v-if="addFriendError" v-html="addFriendError"></div>
				</span>
			</div>
		</div>
		<div v-if="!suggFriendsLoader && moreSuggLoader"><i class="fas fa-spin fa-spinner"></i></div>
	  </div>
	</div>
	</div>
	<client-only>
      <div>
        <notifications :group="'success'" :position="'bottom center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'bottom center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  
  export default {
	props: ['showModal'],
	components: {
	  
	},
    data () {
      return {
		showCompDetails: false,
		screenWidth: 1200,
		suggestedFriends: [],
		addFriendError: false,
		randImg: 1,
		suggFriendsLoader: true,
		moreSuggLoader: true,
		userFriends: [],
		friendRequests: [],
		friendshipLoader: false,
		userTokens: '',
		innerShowModal: false,
		profImgUrl: process.env.hiveImgUrl,
	  }
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  isKeychainActive(){
		return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
	  },
	  isHiveauthActive(){
		return (localStorage.getItem('acti_login_method') == 'hiveauth')
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		let clsString = "";//modal-dialog modal-lg
		if (this.screenWidth < 768){
		  clsString += "w-100";
		}else{
		  clsString += "w-75";
		}
		return clsString;
	  },
	  outserSmallScreenClasses () {
		//use proper classes for neat display
		let clsString = "";
		/*if (this.isModal){
			clsString = "modal fade"
		}*/
		if (this.screenWidth < 768){
		  clsString += "px-2";
		}
		return clsString;
	  },
	  scrollClasses () {
		let defClasses = "col-md-4 "
		if (this.screenWidth < 768){
		  defClasses += "sugg-container-horiz scrollbar-horiz scrollbar-danger-horiz ml-3";
		}else{
		  defClasses += "sugg-container scrollbar scrollbar-danger";
		}
		return defClasses;
	  },
	  titleClass () {
		if (this.screenWidth < 768){
			return "title-flex";
		}
		return "";
	  },
	  mainTitleClass (){
		if (this.screenWidth < 768){
			return "font-italic";
		}
		return "col-md-11 pb-3 font-italic";
	  },
	  closeBtnClass () {
		if (this.screenWidth < 768){
			return "mr-2";
		}
		return "col-md-1";
	  },
	  suggEntryClass () {
		if (this.screenWidth < 768){
		  return "suggestion-entry border-right p-2";
		}
		return "row suggestion-entry border-left border-top border-danger pb-1 pt-1";
	  }
    },
	methods: {
	  /**
       * Formats numbers with commas and dots.
       *
       * @param number
	   * @param precision
       * @returns {string}
       */
      numberFormat (number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
      },
	  displayMod () {
		this.innerShowModal = true;
	  },
	  adjustVisibility () {
		
		/*this.showCompDetails = ! this.showCompDetails;
		if (!this.showCompDetails){
		  localStorage.setItem('FriendsNoticeHidden', true)
		}else{
		  localStorage.removeItem('FriendsNoticeHidden')
		}*/

		this.showCompDetails = false;
		this.innerShowModal = false;
		let expDate = new Date();
		expDate.setDate(expDate.getDate() + 3);
		localStorage.setItem('FriendsNoticeHidden', JSON.stringify({'value': true, 'expiration': expDate.getTime()}))
	  },
	  displayCoreUserRank (userRankObj) {
		return (userRankObj?parseFloat(userRankObj.rank_no_afitx).toFixed(2):'');
	  },
	  displayIncreasedUserRank (userRankObj) {
		return '(+' + parseFloat(userRankObj.afitx_rank).toFixed(2) + ')';
	  },
	  formattedProfileUrl (targetFriend) {
		return '/' + targetFriend;
	  },
	  isFriend(targetFriend){
		if (this.user){
			//console.log(this.userFriends)
			if (this.userFriends && this.userFriends.find( friend => (friend.friend == targetFriend))){
				//console.log('friend true');
				return true;
			}
			return false;
		}
		return false;
	  },
	  isPendingFriend(targetFriend){
		if (this.user && this.friendRequests){
			//console.log(this.friendRequests)
			if (this.friendRequests.sent_pending && this.friendRequests.sent_pending.find( friend => (friend.target == targetFriend))){
				//console.log('friend true');
				return {status: true, direction: 1};
			}
			if (this.friendRequests.received_pending && this.friendRequests.received_pending.find( friend => (friend.initiator == targetFriend))){
				//console.log('friend true');
				return {status: true, direction: 0};
			}
			return false;
		}
		return false;
	  },
	  async processTrxFunc(op_name, cstm_params){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.ref_block_num) {
				console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			console.log('broadcasting');
			console.log(operation);
			
			//console.log(this.$steemconnect.accessToken);
			//console.log(this.$store.state.accessToken);
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'');
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+cur_bchain);

			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.error){
				console.log(outcome.error);
				
				//if this is authority error, means needs to be logged out
				//example "missing required posting authority:Missing Posting Authority"
				let err_msg = outcome.trx.tx.error;
				if (err_msg.includes('missing') && err_msg.includes('authority')){
					//clear entry
					localStorage.removeItem('access_token');
					//this.$store.commit('setStdLoginUser', false);
					this.error_msg = this.$t('session_expired_login_again');
					this.$store.dispatch('steemconnect/logout');
				}
				
				this.$notify({
				  group: 'error',
				  text: err_msg,
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx};
			}
		}
	  },
	  //handles sending add friend request
	  async addFriend(targetFriend) {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (targetFriend == this.user.account.name){
			this.addFriendError = this.$t('Cannot_friend_self');
			return false;
		}
		if (this.isFriend(targetFriend)){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_add_friend').replace('_USERNAME_', targetFriend));
		if (!userConf) {
		  return;
		}		
		this.friendshipLoader = targetFriend;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'add-friend-request', 'target': targetFriend})
		  };
		
		
		let op_name = 'custom_json';
		let operation = [ 
			   [op_name, cstm_params]
			];
		let res = await this.$processTrxFunc(op_name, cstm_params);
		console.log(res.success);
		if (res.success){
			//success, store request to DB
			this.propagateFriendReq(res.trx.tx, targetFriend, operation);
		}else{
			this.friendshipLoader = false;
		}

	  },
	  async propagateFriendReq(res, targetFriend, operation) {
		let url = new URL(process.env.actiAppUrl+'addFriend/'
			+ this.user.account.name + '/'
			+ targetFriend + '/'
			+ res.ref_block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		if (this.isKeychainActive || this.isHiveauthActive){
			
			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'addFriendHiveKeychain/'
						+ this.user.account.name + '/'
						+ targetFriend + '/'
						+ res.ref_block_num + '/'
						+ res.id + '/'
						+ this.cur_bchain + '?operation='+op_json);
		}
		
		let req_res = await fetch(url);	
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friend request sent');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friend_request_sent'),
			  position: 'top center'
			})
		}else{
			console.log('error sending friend request');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.populateFriends();
	  },
	  async populateFriends() {
		//grab user friends list
		  if (this.user){
			let res = await fetch(process.env.actiAppUrl+'userFriends/'+this.user.account.name);
			let outcome = await res.json();
			this.userFriends = outcome;
			//console.log(outcome);
			//console.log(this.userFriends);
			
			//grab pending user friend requests (sent and received)
			let quer = await fetch(process.env.actiAppUrl+'userFriendRequests/'+this.user.account.name);
			this.friendRequests = await quer.json();
			//console.log('friendRequests');
			//console.log(this.friendRequests);
		  }
	  }
	},
	watch: {
		user: 'populateFriends',
	},
	async mounted () {	
	  
	  this.profImgUrl = process.env.hiveImgUrl;
	  this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  if (this.cur_bchain == 'STEEM'){
		this.profImgUrl = process.env.steemImgUrl;
	  }
	  
	  //we have 3 images to choose from
	  this.randImg = Math.ceil(Math.random() * (3 - 1) + 1);
	  this.screenWidth = screen.width;
	 
	  if (localStorage.getItem('FriendsNoticeHidden')){
		let vals = JSON.parse(localStorage.getItem('FriendsNoticeHidden'));
		console.log(vals);
		let curDate = new Date().getTime();
		console.log(curDate);
		//passed expiration timeframe
		if (vals.value && vals.expiration && curDate >= vals.expiration){
			localStorage.removeItem('FriendsNoticeHidden');
			this.showCompDetails = true;
		}else{
			this.showCompDetails = false;
		}
	  }else{
		this.showCompDetails = true;
	  }
	  this.$store.dispatch('steemconnect/login')
	  this.populateFriends();
	  
	  //grab recent verified posts to find suggested actifitters
	  let tgtUrl = process.env.actiAppUrl + 'recentVerifiedPosts/?maxCount=20';
	  if (this.user.account.name){
		tgtUrl += '&exclude='+this.user.account.name;
	  }
	  let res = await fetch(tgtUrl);
	  let outcome = await res.json();
	  console.log('recentVerifiedPosts');
	  console.log(outcome);
	  
	  this.suggFriendsLoader = false;
	  
	  for (let i=0;i < outcome.length;i++){
		this.suggestedFriends.push({'author': outcome[i]._id});
	  }
	  
	  //grab additional user data
	  for (let i=0;i < outcome.length;i++){
		//fetch rank
		try{
			let rankEntry = await fetch(process.env.actiAppUrl + 'getRank/' + outcome[i]._id);
			let rankRes = await rankEntry.json();
			
			let activityCountEntry = await fetch(process.env.actiAppUrl+'userRewardedPostCount/' + outcome[i]._id);
			let activityCount = await activityCountEntry.json();
			
			//grab AFIT count
			let afitTokenCount = await fetch(process.env.actiAppUrl+'user/' + outcome[i]._id)
			let userAFIT = await afitTokenCount.json();
			//console.log('>>>>>>>>userAFIT');
			//console.log(userAFIT);
			this.suggestedFriends[i] = {'author': outcome[i]._id, 'rank': rankRes, 'activityCount': activityCount.rewarded_post_count, 'afitCount': userAFIT.tokens};
			//we either need to use splice on the array, or forceupdate, or change a key item in the array after setting one (index)
			this.$forceUpdate();
		}catch(err){
			console.log(err);
		}
	  }
	  this.moreSuggLoader = false;
	  
	}
  }
</script>
<style>
	.acti-notify-comp{
	  top:80px; 
	  z-index:1; 
	  font-size: 20px;
	  vertical-align: top;
	  opacity: 1;
	}
	.acti-notify-comp-inner-friend{
	  background-color: darkred; 
	}
	.vuejs-countdown .digit{
	  font-size: 20px !important;
	}
	.vuejs-countdown{
	  display: inline;
	}
	.end-string{
	  vertical-align: top;
	}
	.border-2{
	  border: 2px solid #ff112d;
	}
	.expand-comp-notice{
	  float:right; 
	  margin-right: -10px;
	}
	.announce-img{
	  max-height: 70vh;
	  margin: auto;
	  max-width: 100%;
	}
	.img-container{
	  
	}
	.mini-user-card div, .mini-user-card span{
		padding-top: 2px;
		padding-bottom: 2px;
		font-size: 16px;
	}
	.sugg-container{
		max-height: 540px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.scrollbar {
		float: left;
		width: 65px;
		background: #fff;
		overflow-y: scroll;
		margin-bottom: 25px;
	}
	
	.force-overflow {
		min-height: 450px;
	}

	.scrollbar-primary::-webkit-scrollbar {
		width: 12px;
		background-color: #F5F5F5; 
	}

	.scrollbar-primary::-webkit-scrollbar-thumb {
		border-radius: 10px;
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
		background-color: #4285F4; 
	}

	.scrollbar-danger::-webkit-scrollbar-track {
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
		background-color: #F5F5F5;
		border-radius: 10px; 
	}

	.scrollbar-danger::-webkit-scrollbar {
		width: 12px;
		background-color: #F5F5F5; 
	}

	.scrollbar-danger::-webkit-scrollbar-thumb {
		border-radius: 10px;
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
		background-color: #ff3547; 
	}
	
	.title-flex{
		display: flex!important;
		flex-wrap: nowrap;
	}
		
	@media screen and (max-width: 768px){
		.large-avatar{
			width: 96px;
			height: 96px;
		}
	}
	@media screen and (min-width: 769px){
		.large-avatar{
			width: 128px;
			height: 128px;
		}
	}
	
	.sugg-container-horiz{
		display: flex;
        flex-wrap: nowrap;
        max-height: 275px;
        overflow-x: auto;
        width: auto;
		overflow-y: hidden;
	}
	
	.scrollbar-horiz {
		height: 100%;
		background: #fff;
		overflow-x: scroll;
		margin-bottom: 25px;
	}
	
	.scrollbar-danger-horiz::-webkit-scrollbar-track {
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
		background-color: #F5F5F5;
		border-radius: 10px; 
	}

	.scrollbar-danger-horiz::-webkit-scrollbar {
		height: 12px;
		background-color: #F5F5F5; 
	}

	.scrollbar-danger-horiz::-webkit-scrollbar-thumb {
		border-radius: 10px;
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.1);
		background-color: #ff3547; 
	}
	
	.max-acti-width{
		width: 100%;
	}
	.friends-img{
		width: 100%;
	}
	
	a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover{
	  text-decoration: none;
	}
	
	.token-logo{
	  width: 20px;
	  height: 20px;
    }
	
	/*#friendshipModal{
	  z-index:9999;
	}*/
	
	/*.friends-title{
		position: absolute;
		font-weight: bold;
		color: white;
	}*/
</style>