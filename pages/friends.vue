<template>
  <div>
	<NavbarBrand />

	<div class="container pt-5 mt-5 pb-5" v-if="user">

		<h4 class="text-brand user-name">@{{ `${user.account.name}\'s`}} {{ $t('Friendships') }}</h4>
		<h5>{{ $t('Active_Friendships') }}</h5>
		<div class="row pb-3">
			<div v-if="userFriends && Array.isArray(userFriends) && userFriends.length>0" v-for="(curFriend, index) in userFriends" :key="index" class="col-md-3">
				<a :href="'/'+curFriend.friend"><div class="avatar mr-1" :style="'background-image: url(\''+profImgUrl+'/u/' + curFriend.friend + '/avatar\')'"></div>
				<div class="friend-name text-center">@{{curFriend.friend}}</div></a>
			</div>
			<div v-else class="text-center text-brand">
				<div>{{$t('no_friends_current')}}</div>
			</div>
		</div>

		<h5>{{ $t('Pending_Friendships') }}</h5>
		<div class="row pb-3">
			<div v-if="friendRequests && Array.isArray(friendRequests.sent_pending) && friendRequests.sent_pending.length>0" v-for="pendFriend in friendRequests.sent_pending" :key="pendFriend.target" class="col-md-3  text-brand">
				<a :href="'/'+pendFriend.target"><div class="avatar mr-1" :style="'background-image: url(\''+profImgUrl+'/u/' + pendFriend.target + '/avatar\')'"></div>
				<span class="friend-name text-center">@{{pendFriend.target}}</span></a>
				<!--<span :title="$t('cancel_friend_request')" v-on:click="cancelFriendRequest" v-if="isPendingFriend(pendFriend.target).direction == 1"><i class="fas fa-user-times"></i></span>
				<span :title="$t('accept_friend_request')" v-on:click="acceptFriend" v-else-if="isPendingFriend(pendFriend.target).direction == 0"><i class="fas fa-user-check"></i></span>-->
			</div>
			<div v-if="friendRequests && Array.isArray(friendRequests.received_pending) && friendRequests.received_pending.length>0" v-for="pendFriend in friendRequests.received_pending" :key="pendFriend.initiator" class="col-md-3 text-brand">
				<a :href="'/'+pendFriend.initiator"><div class="avatar mr-1" :style="'background-image: url(\''+profImgUrl+'/u/' + pendFriend.initiator + '/avatar\')'"></div>
				<span class="friend-name text-center">@{{pendFriend.initiator}}</span></a>
				<!--<span :title="$t('cancel_friend_request')" v-on:click="cancelFriendRequest" v-if="isPendingFriend(pendFriend.initiator).direction == 1"><i class="fas fa-user-times"></i></span>
				<span :title="$t('accept_friend_request')" v-on:click="acceptFriend" v-else-if="isPendingFriend(pendFriend.initiator).direction == 0"><i class="fas fa-user-check"></i></span>-->
			</div>
			<div v-else class="text-center text-brand">
				<div>{{$t('no_pending_friends')}}</div>
			</div>
		</div>

		<div class="row pb-3">
			<a href="#" class="btn btn-brand" @click.prevent="$refs.friendMod.displayMod()">{{ $t('Suggested_friends') }}</a>
		</div>
		<!--<span v-if="!account_banned && !isOwnAccount()" class="text-brand">
			<span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend()" >
				<i class="fas fa-user-friends  p-2" ></i>
				<span :title="$t('cancel_friendship')" v-on:click="dropFriend"><i class="fas fa-user-times"></i></span>
				<div v-if="addFriendError" v-html="addFriendError"></div>
			</span>
			<span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend()">
				<i class="fas fa-user-clock  p-2"></i>

				<div v-if="addFriendError" v-html="addFriendError"></div>
			</span>
			<span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-else
				v-on:click="addFriend">
				<i class="fas fa-user-plus  p-2"></i>
				<div v-if="addFriendError" v-html="addFriendError"></div>
			</span>
			<i class="fas fa-spin fa-spinner" v-if="friendshipLoader"></i>
		</span>-->


		<!--<adsbygoogle ad-slot="8625360638" :ad-style="acti_goog_ad_square"/>-->



	</div>

	<div class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('login_required') }}
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		</div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>

	<FriendshipModal v-if="user" :showModal="showModal" class="friend-mod" ref="friendMod"/>

	<Footer />
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
	<LoginModal v-if="showModalLog" @close="showModalLog = false" />
  </div>
</template>

<script>
  import LoginModal from '~/components/LoginModal'
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import steem from 'steem'
  import {mapGetters} from 'vuex'

  import Vue from 'vue'

  import FriendshipModal from '~/components/FriendshipModal'

  export default {
	head () {
		return {
		  title: `Actifit user friends - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Actifit friends list` },
			{ hid: 'ogdescription', name: 'og:description', content: `Actifit friends list` }
		  ]
		}
	},
	data () {
		return {
			showModalLog: false,
			userRank: '',
			rewardedPostCount: '',
			loading: false,

			noUserFound: false,
			userTokenCount: '',
			userFriends: [],
			friendRequests: [],
			friendshipLoader: false,

			actifitDelegator: '',
			activ_badge_indent: 10,
			claimable_badge_indent: 125,
			account_banned: false,
			addFriendError: '',
			acti_goog_ad_square:{display:'inline-block', maxWidth:'300px', maxHeight: '350px'},
			showModal: false,
			profImgUrl: process.env.hiveImgUrl,
			cur_bchain: 'HIVE',
		}
	},
	watch: {
	  user: 'fetchUserData',
	},
	components: {
	  NavbarBrand,
	  Footer,
	  FriendshipModal,
	  LoginModal,
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['userTokens']),
	  isKeychainActive(){
		return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
	  },
	  isHiveauthActive(){
		return (localStorage.getItem('acti_login_method') == 'hiveauth')
	  },
	  formattedProfileUrl () {
		return "https://actifit.io/" + this.displayUser;
	  },
	  /*getUserRank() {
		//proper formatting issue to display circle for smaller numbers
		if (this.userRank<10){
			return ' '+parseFloat(this.userRank).toFixed(1);
		}else{
			return parseFloat(this.userRank).toFixed(1);
		}
	  },*/
	  displayCoreUserRank () {
		return (this.userRank?parseFloat(this.userRank.rank_no_afitx).toFixed(2):'');
	  },
	  displayIncreasedUserRank () {
		return '(+' + parseFloat(this.userRank.afitx_rank).toFixed(2) + ')';
	  },
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
	  showModalFunc() {
        this.$nextTick(() => {
          this.showModalLog = true;
          if ($ && typeof $.fn.modal === 'function') {
            $('#loginModal').modal('show');
          }
        });
      },
	  hideSuggFriends () {
		console.log('testttt');
		this.showModal = false;
	  },
	  /*async processTrxFunc(op_name, cstm_params){
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

			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+this.cur_bchain);

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
				return false;
				//this.$router.push('/login');
			}else{
				return true;
			}
		}
	  },*/
	  //handles sending add friend request
	  async addFriend(targetUser) {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (targetUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_friend_self');
			return false;
		}
		if (this.isFriend()){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_add_friend').replace('_USERNAME_', targetUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'add-friend-request', 'target': targetUser})
		  };
		let op_name = 'custom_json';
		let operation = [
			   [op_name, cstm_params]
			];
		let res = await this.$processTrxFunc(op_name, cstm_params);
		console.log(res.success);
		if (res.success){

			//success, store request to DB
			this.propagateFriendReq(res.trx.tx, targetUser, operation);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async propagateFriendReq(res, targetUser, operation) {
		let url = new URL(process.env.actiAppUrl+'addFriend/'
			+ this.user.account.name + '/'
			+ targetUser + '/'
			+ res.ref_block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		if (this.isKeychainActive || this.isHiveauthActive){

			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'addFriendHiveKeychain/'
						+ this.user.account.name + '/'
						+ targetUser + '/'
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
		this.refreshFriendStatus();
	  },
	  async cancelFriendRequest(targetUser) {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (targetUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_unfriend_self');
			return false;
		}
		if (this.isFriend()){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_cancel_friend_request').replace('_USERNAME_', targetUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'cancel-friend-request', 'target': targetUser})
		  };
		let op_name = 'custom_json';
		let operation = [
			   [op_name, cstm_params]
			];
		let res = await this.$processTrxFunc(op_name, cstm_params);
		//console.log(res);
		if (res.success){
			//success, store request to DB
			this.cancelFriendReq(res.trx.tx, targetUser, operation);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async cancelFriendReq(res, targetUser, operation) {
		let url = new URL(process.env.actiAppUrl+'cancelFriendRequest/'
			+ this.user.account.name + '/'
			+ targetUser + '/'
			+ res.ref_block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		if (this.isKeychainActive || this.isHiveauthActive){

			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'cancelFriendRequestHiveKeychain/'
						+ this.user.account.name + '/'
						+ targetUser + '/'
						+ res.ref_block_num + '/'
						+ res.id + '/'
						+ this.cur_bchain + '?operation='+op_json);
		}

		let req_res = await fetch(url);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friend request cancelled');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friend_request_cancelled'),
			  position: 'top center'
			})
		}else{
			console.log('error cancelling friend request');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async dropFriend(targetUser) {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (targetUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_unfriend_self');
			return false;
		}
		if (!this.isFriend()){
			this.addFriendError = this.$t('Not_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_drop_friend').replace('_USERNAME_', targetUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'cancel-friendship', 'target': targetUser})
		  };
		let op_name = 'custom_json';
		let operation = [
			   [op_name, cstm_params]
			];
		let res = await this.$processTrxFunc(op_name, cstm_params);
		console.log(res);
		if (res.success){
			//success, store request to DB
			this.dropFriendship(res.trx.tx, targetUser, operation);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async dropFriendship(res, targetUser, operation) {
		let url = new URL(process.env.actiAppUrl+'dropFriendship/'
			+ this.user.account.name + '/'
			+ targetUser + '/'
			+ res.ref_block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		if (this.isKeychainActive || this.isHiveauthActive){

			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'dropFriendshipHiveKeychain/'
						+ this.user.account.name + '/'
						+ targetUser + '/'
						+ res.ref_block_num + '/'
						+ res.id + '/'
						+ this.cur_bchain + '?operation='+op_json);
		}

		let req_res = await fetch(url);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friendship dropped');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friendship_dropped'),
			  position: 'top center'
			})
		}else{
			console.log('error dropping friendship');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async acceptFriend(targetUser) {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (targetUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_unfriend_self');
			return false;
		}
		if (this.isFriend(targetUser)){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_accept_friend').replace('_USERNAME_', targetUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'accept-friendship', 'target': targetUser})
		  };
		let op_name = 'custom_json';
		let operation = [
			   [op_name, cstm_params]
			];
		let res = await this.$processTrxFunc(op_name, cstm_params);
		console.log(res);
		if (res.success){
			//success, store request to DB
			this.acceptFriendPropagate(res.trx.tx, targetUser, operation);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async acceptFriendPropagate(res, targetUser, operation) {
		let url = new URL(process.env.actiAppUrl+'acceptFriend/'
			+ this.user.account.name + '/'
			+ targetUser + '/'
			+ res.ref_block_num + '/'
			+ res.id+ '/' + this.cur_bchain);
		if (this.isKeychainActive || this.isHiveauthActive){

			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'acceptFriendHiveKeychain/'
						+ this.user.account.name + '/'
						+ targetUser + '/'
						+ res.ref_block_num + '/'
						+ res.id + '/'
						+ this.cur_bchain + '?operation='+op_json);
		}

		let req_res = await fetch(url);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friendship accepted');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friendship_accepted'),
			  position: 'top center'
			})
		}else{
			console.log('error accepting friendship');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async refreshFriendStatus() {
		//grab user friends list
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
	  },
	  getUserActivityLevel() {
		return this.calcScore(this.rewarded_posts_rules, this.rewardedPostCount)
	  },
	  /* handles returning the date portion without time */
	  pureDate(val) {
        let date = new Date(val)
        return date.getDate() + '/'
			+ (date.getMonth() + 1) + '/'
			+ date.getFullYear()
      },
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){

		  //update user info from blockchain
		  console.log(this.stdLogin);
		  if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			try{
				let user_data = await this.$steemconnect.me();
				this.user.account = user_data.account;
			}catch(excp){
				console.log(excp);
			}
		  }

		  //ensure we fetch proper logged in user data
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')

		  this.refreshFriendStatus();

		}
	  },
	  isFriend(){
		if (this.user){
			console.log(this.userFriends)
			if (this.userFriends && this.userFriends.find( friend => (friend.friend == this.user.account.name))){
				console.log('friend true');
				return true;
			}
			return false;
		}
		return false;
	  },
	  isPendingFriend(targetUser){
		if (this.user && this.friendRequests){
			console.log(this.friendRequests)
			if (this.friendRequests.sent_pending && this.friendRequests.sent_pending.find( friend => (friend.target == targetUser))){
				console.log('friend true');
				return {status: true, direction: 1};
			}
			if (this.friendRequests.received_pending && this.friendRequests.received_pending.find( friend => (friend.initiator == targetUser))){
				console.log('friend true');
				return {status: true, direction: 0};
			}
			return false;
		}
		return false;
	  },
	  //handles displaying some of the logos of friends
	  showFriendsSnippet(){
		let snipp = '<span>';
		for (let i=0; i < Math.min(this.userFriends.length, this.maxFriendDisplay); i++){
			snipp += '<div class="user-avatar-small mr-1" title="' + this.userFriends[i].friend + '" style="background-image: url(\''+this.profImgUrl+'/u/' + this.userFriends[i].friend + '/avatar\')"></div>';
		}
		if (this.userFriends.length > this.maxFriendDisplay){
			snipp += '+ ' + (this.userFriends.length - this.maxFriendDisplay) + this.$t('other') + ' ' + this.$t('friends');
		}
		snipp += '</span>';
		return snipp;
	  },

	},
	async mounted () {
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
		// login
		this.$store.dispatch('steemconnect/login')
		this.fetchUserData();

	}
  }
</script>

<style>
	.user-name{
		margin-left: 10px;
		padding: 10px;
	}
	.large-avatar{
		width: 100px;
		height: 100px;
	}
	.report-head{
		border-bottom: 1px solid red;
	}
	img{
		max-width: 100%;
	}
	.report-tags{
		font-style: italic;
	}
	.modal-author{
		margin-left: 10px !important;
	}
	.actifit-link-plain{
	  color: black;
	}
	.modal-body{
	  word-break: break-word;
	}
	a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover{
	  text-decoration: none;
	}
	.date-head{
	  padding-left: 2px;
	}
	@media only screen and (min-width: 600px) {
		.user-avatar{
		  float: left;
		}
		.user-details{
		  padding-left: 128px;
		  margin-left: 20px;
		}
	}
	@media only screen and (max-width: 600px) {
		.user-details{
		  padding-left: 10px;
		}
	}
	/*.user-avatar{
		margin-left: 10px;
	}*/
	.badge-img, .claimed-check{
	  width: 150px;
	  text-align: center;
	}
	.badges-title{
	  text-align: center;
	}
	.badge-title{
	  padding-left: 20px;
	  font-weight: bold;
	}
	.badge-unclaimed{
	  opacity: 0.2
	}
	.user-badges{
	  border: 2px #ff112d solid;
	  margin: 10px;
	}
	.tip-details{
	  border: 2px #ff112d solid;
	  margin: 10px;
	  padding: 10px;
	}
	.location-text{
	  word-break: break-all;
	}
	a.btn{
	  border: 1px solid white
	}
	.rew-activity-badge{
	  position: relative;
	  height: 270px;
	}
	.single-rew-activity-badge{
	  position: absolute;
	  top: 20px;
	}
	.unclaimed-badge{
	  position: absolute;
	}
	.unclaimed-badge-spin{
	  top: 220px;
	  width: 200px;
	}
	.unclaimed-badge-btn{
	  top: 170px;
	  width: 200px;
	  padding-left: 20px;
	}
	.unclaimed-badge-note{
	  font-style: italic;
	}
	.badge-doubledup-desc{
	  padding-left: 20px;
	  width: 200px;
	  text-align: left;
	}
	.token-logo{
	  width: 20px;
	  height: 20px;
    }
	.fas{
	  cursor: pointer;
	}
	.friend-name{
	  width: 150px;
	  display: inline-block;
	}
	.friend-mod{
	  z-index: 99999;
	}
</style>
