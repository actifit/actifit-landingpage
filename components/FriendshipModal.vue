<template>
  <div :class="outserSmallScreenClasses" class="position-fixed text-brand mx-auto w-100 acti-notify-comp" v-if="innerShowModal || showCompDetails" id="friendshipModal" tabindex="-1">
	<div :class="smallScreenClasses" class="text-center mx-auto acti-notify-comp-inner-friend border-2 rounded" role="document">
	  <div :class="titleClass" class="row max-acti-width text-white mx-auto px-2">
		<div :class="mainTitleClass">
			<span>{{ $t('friendship_hook_title') }}</span>
			<div class="friendship-title-sub d-none d-md-block font-italic">{{ $t('friendship_subtitle') }}</div>
		</div>
		<div :class="closeBtnClass">
			<a href="#" @click.prevent="adjustVisibility" class="close expand-comp-notice text-white">
				<span>x</span>
			</a>
		</div>
	  </div>
	  
	<div class="row max-acti-width mx-auto friendship-body-row">
	  <div class="col-md-8 pr-0 friends-img-wrapper">
		<div class="friends-title">
		</div>
		<img class="friends-img" :src="'/img/fitness-friends-' + this.randImg+ '.jpg'">
	  </div>
	  
	  <div class="col-md-4 pl-0 suggested-friends-wrapper">
		<div :class="scrollClasses">
			<div class="suggested-friends-title d-none d-md-block">{{ $t('suggested_friends') }}</div>
			<div v-if="suggFriendsLoader"><i class="fas fa-spin fa-spinner"></i></div>
			<div v-else v-for="(suggestion, index) in suggestedFriends" :key="index" :suggestion="suggestion" :class="suggEntryClass">
				<div class="suggested-friend-avatar-wrap">
					<a :href="formattedProfileUrl(suggestion.author)" target="_blank">
						<div class="user-avatar suggested-friend-avatar"
						   :style="'background-image: url('+profImgUrl+'/u/' + suggestion.author + '/avatar)'"></div>
					</a>
				</div>
				<div class="suggested-friend-details text-left">
					<span class="suggested-friend-name"><a :href="formattedProfileUrl(suggestion.author)" target="_blank">@{{ suggestion.author }}</a></span>
					<div v-if="suggestion.activityCount != null" class="suggested-friend-stat"><a :href="'/activity/'+suggestion.author" ><i class="fab fa-angellist mr-2"></i>{{ numberFormat(suggestion.activityCount, 0) }} {{ $t('Reports') }}</a></div>
					<div v-else class="suggested-friend-stat"><i class="fas fa-spin fa-spinner"></i></div>
					<div v-if="suggestion.afitCount != null" class="suggested-friend-stat"><img src="/img/actifit_logo.png" class="mr-2 token-logo"><a :href="formattedProfileUrl(suggestion.author)" >{{ numberFormat(suggestion.afitCount, 0) }} AFIT</a></div>
					<div v-else class="suggested-friend-stat"><i class="fas fa-spin fa-spinner"></i></div>
					<div v-if="suggestion.mutualFriendsCount == null" class="suggested-friend-stat"><i class="fas fa-spin fa-spinner"></i></div>
					<div v-else-if="suggestion.mutualFriendsCount > 0" class="suggested-friend-stat"><i class="fas fa-user-friends mr-2"></i>{{ numberFormat(suggestion.mutualFriendsCount, 0) }} Mutual Friends</div>
				</div>
				<div class="suggested-friend-action">
					<span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend(suggestion.author)" >
						<a href="#" class="btn btn-brand border friend-action-btn"><i class="fas fa-user-friends" ></i></a>
					</span>
					<span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend(suggestion.author)">
						<a href="#" class="btn btn-brand border friend-action-btn"><i class="fas fa-user-clock"></i></a>
					</span>
					<span :title="$t('add_username_friend').replace('_USERNAME_', suggestion.author)" v-else
						v-on:click="addFriend(suggestion.author)">
						<!--<i class="fas fa-user-plus  p-2"></i>
						<div v-if="addFriendError" v-html="addFriendError"></div>-->
						<a href="#" class="btn btn-brand border friend-action-btn"><i class="fas fa-user-plus"></i></a>
						<i class="fas fa-spin fa-spinner" v-if="friendshipLoader == suggestion.author"></i>
						<div v-if="addFriendError" v-html="addFriendError"></div>
					</span>
				</div>
			</div>
			<div v-if="!suggFriendsLoader && moreSuggLoader"><i class="fas fa-spin fa-spinner"></i></div>
		</div>
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
		let defClasses = ""
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
		  return "suggestion-entry suggestion-entry-mobile";
		}
		return "suggestion-entry";
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
	  loggedInUsername () {
		if (this.user && this.user.account && this.user.account.name){
			return this.user.account.name;
		}
		return '';
	  },
	  apiBaseUrls () {
		let urls = [];
		if (process.env.actiAppUrl){
			urls.push(process.env.actiAppUrl);
		}
		urls.push('https://api.actifit.io/');
		urls.push('https://api2.actifit.io/');
		return [...new Set(urls.map(url => url.replace(/\/?$/, '/')))];
	  },
	  async fetchWithTimeout (url, options = {}, timeout = 8000) {
		let controller = new AbortController();
		let timeoutId = setTimeout(() => controller.abort(), timeout);
		try{
			return await fetch(url, {
				...options,
				signal: controller.signal
			});
		}finally{
			clearTimeout(timeoutId);
		}
	  },
	  async fetchActifitJson (path) {
		let lastError = null;
		for (let i = 0; i < this.apiBaseUrls().length; i++){
			let baseUrl = this.apiBaseUrls()[i];
			try{
				let res = await this.fetchWithTimeout(baseUrl + path);
				if (!res.ok){
					throw new Error('Request failed with status ' + res.status);
				}
				return await res.json();
			}catch(err){
				lastError = err;
				console.log('Actifit API request failed', baseUrl + path, err);
			}
		}
		throw lastError;
	  },
	  async fetchHiveSuggestedAuthors () {
		let username = this.loggedInUsername();
		let res = await this.fetchWithTimeout(process.env.hiveApiNode, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				jsonrpc: '2.0',
				method: 'condenser_api.get_discussions_by_created',
				params: [{
					tag: 'actifit',
					limit: 20
				}],
				id: 1
			})
		});
		if (!res.ok){
			throw new Error('Hive request failed with status ' + res.status);
		}
		let json = await res.json();
		let posts = Array.isArray(json.result) ? json.result : [];
		let authors = [];
		posts.forEach(post => {
			if (post && post.author && post.author !== username && !authors.includes(post.author)){
				authors.push(post.author);
			}
		});
		return authors.map(author => ({_id: author}));
	  },
	  async loadSuggestedFriends () {
		this.suggFriendsLoader = true;
		this.moreSuggLoader = true;
		this.suggestedFriends = [];
		
		try{
			let tgtPath = 'recentVerifiedPosts/?maxCount=20';
			let username = this.loggedInUsername();
			if (username){
				tgtPath += '&exclude=' + encodeURIComponent(username);
			}
			
			let outcome = [];
			try{
				outcome = await this.fetchActifitJson(tgtPath);
			}catch(err){
				console.log('Falling back to Hive suggested friends', err);
				outcome = await this.fetchHiveSuggestedAuthors();
			}
			console.log('recentVerifiedPosts');
			console.log(outcome);
			
			if (!Array.isArray(outcome)){
				outcome = [];
			}
			
			this.suggestedFriends = outcome
				.filter(entry => entry && entry._id)
				.map(entry => ({author: entry._id}));
			this.suggFriendsLoader = false;
			
			await Promise.all(this.suggestedFriends.map(async (suggestion, index) => {
				try{
					let author = encodeURIComponent(suggestion.author);
					let [rankRes, activityCount, userAFIT, targetFriends] = await Promise.all([
						this.fetchActifitJson('getRank/' + author),
						this.fetchActifitJson('userRewardedPostCount/' + author),
						this.fetchActifitJson('user/' + author),
						this.fetchActifitJson('userFriends/' + author).catch(() => [])
					]);
					
					this.$set(this.suggestedFriends, index, {
						author: suggestion.author,
						rank: rankRes,
						activityCount: activityCount.rewarded_post_count,
						afitCount: userAFIT.tokens,
						mutualFriendsCount: this.mutualFriendsCount(targetFriends)
					});
				}catch(err){
					console.log('Unable to load suggested friend details', suggestion.author, err);
					this.$set(this.suggestedFriends, index, {
						author: suggestion.author,
						rank: false,
						activityCount: 0,
						afitCount: 0,
						mutualFriendsCount: 0
					});
				}
			}));
		}catch(err){
			console.log('Unable to load suggested friends', err);
		}finally{
			this.suggFriendsLoader = false;
			this.moreSuggLoader = false;
		}
	  },
	  friendNameFromEntry (entry) {
		if (typeof entry === 'string'){
			return entry;
		}
		if (entry && entry.friend){
			return entry.friend;
		}
		if (entry && entry.target){
			return entry.target;
		}
		if (entry && entry.initiator){
			return entry.initiator;
		}
		return '';
	  },
	  mutualFriendsCount (targetFriends) {
		if (!Array.isArray(this.userFriends) || !Array.isArray(targetFriends)){
			return 0;
		}
		let loggedInFriends = this.userFriends.map(this.friendNameFromEntry).filter(Boolean);
		let targetFriendNames = targetFriends.map(this.friendNameFromEntry).filter(Boolean);
		return targetFriendNames.filter(friend => loggedInFriends.includes(friend)).length;
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
	  await this.populateFriends();
	  await this.loadSuggestedFriends();
	  
	}
  }
</script>
<style>
	.acti-notify-comp{
	  top:40px; 
	  z-index:100000 !important; 
	  position: fixed !important;
	  left: 0;
	  right: 0;
	  bottom: auto;
	  font-size: 20px;
	  vertical-align: top;
	  opacity: 1;
	}
	.acti-notify-comp-inner-friend{
	  background-color: darkred; 
	  max-height: calc(100vh - 70px);
	  overflow: hidden;
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
	.sugg-container{
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		overflow-y: auto;
		overflow-x: hidden;
		border-radius: 0;
		padding: 1rem 1.25rem 0;
		background: #fff;
	}
	.suggested-friends-title{
		font-size: 28px;
		line-height: 1.2;
		margin-bottom: 6px;
	}
	.suggestion-entry{
		display: flex;
		align-items: center;
		gap: 12px;
		margin-left: 0;
		margin-right: 0;
		padding: 12px 0;
		border-bottom: 3px solid #ff112d;
	}
	.suggestion-entry-mobile{
		flex: 0 0 285px;
		border-right: 3px solid #ff112d;
		border-bottom: 0;
	}
	.suggested-friend-avatar-wrap{
		flex: 0 0 66px;
	}
	.suggested-friend-avatar{
		width: 62px;
		height: 62px;
		border-radius: 50%;
		border: 2px solid #f1d7d7;
	}
	.suggested-friend-details{
		flex: 1 1 auto;
		min-width: 0;
		line-height: 1.2;
	}
	.suggested-friend-details div,
	.suggested-friend-details span{
		font-size: 11px;
	}
	.suggested-friend-name{
		display: block;
		font-weight: 700;
		margin-bottom: 5px;
		overflow-wrap: anywhere;
	}
	.suggested-friend-name a{
		font-size: 13px;
	}
	.suggested-friend-stat{
		margin-top: 3px;
		color: #7a6164;
		overflow-wrap: anywhere;
	}
	.suggested-friend-name a{
		color: #ff112d;
	}
	.suggested-friend-stat a,
	.suggested-friend-stat i{
		color: inherit;
	}
	.suggested-friend-action{
		flex: 0 0 46px;
		text-align: right;
	}
	.friend-action-btn{
		width: 44px;
		height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		font-size: 18px;
	}
	.scrollbar {
		float: left;
		width: 65px;
		background: #fff;
		overflow-y: scroll;
		margin-bottom: 25px;
	}

	.sugg-container.scrollbar{
		background: #fff;
		width: 100%;
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
		.suggested-friend-avatar-wrap{
			flex-basis: 58px;
		}
		.suggested-friend-avatar{
			width: 54px;
			height: 54px;
		}
	}
	
	.sugg-container-horiz{
		display: flex;
        flex-wrap: nowrap;
        max-height: 275px;
		overflow-x: auto;
        width: 100%;
		overflow-y: hidden;
		box-sizing: border-box;
		border-radius: 0;
		padding: 0 12px;
		background: #fff;
	}
	
	.scrollbar-horiz {
		height: 100%;
		background: #fff;
		overflow-x: scroll;
		margin-bottom: 25px;
	}

	.sugg-container-horiz.scrollbar-horiz{
		background: #fff;
		width: 100%;
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
	.friendship-body-row{
		align-items: stretch;
	}
	.suggested-friends-wrapper{
		height: calc(100vh - 200px);
		max-height: 510px;
		min-height: 320px;
		box-sizing: border-box;
		padding-right: 15px;
		padding-bottom: 15px;
		background-color: darkred;
		position: relative;
		overflow: hidden;
	}
	.suggested-friends-wrapper::after{
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 15px;
		background-color: darkred;
		pointer-events: none;
		z-index: 3;
	}
	.friends-img-wrapper{
		overflow: hidden;
		position: relative;
		height: calc(100vh - 200px);
		max-height: 510px;
		min-height: 320px;
		box-sizing: border-box;
		padding-bottom: 15px;
		background-color: darkred;
	}
	.friends-img{
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: left top;
		display: block;
		margin: 0;
	}
	@media screen and (min-width: 769px){
		.friends-img-wrapper{
			height: calc(100vh - 200px);
		}
	}
	@media screen and (max-width: 768px){
		.suggested-friends-wrapper{
			height: auto;
			max-height: none;
			padding-right: 10px;
			padding-bottom: 10px;
		}
		.suggested-friends-wrapper::after{
			height: 10px;
		}
		.friends-img-wrapper{
			height: 320px;
			max-height: 320px;
			padding-bottom: 10px;
		}
		.friends-img{
			width: 100%;
			height: calc(100% + 18px);
		}
	}
	
	a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover{
	  text-decoration: none;
	}
	
	.token-logo{
	  width: 14px;
	  height: 14px;
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
