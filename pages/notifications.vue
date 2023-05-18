<template>
  <div>
	<NavbarBrand />
	
	<div class="container pt-5 mt-5 pb-5" v-if="user">
	
		<h4 class="user-name">@{{ user.account.name }} {{ $t('Notifications') }}</h4>
		
		<div class="row text-right">
			<select v-model="currentFilter" class="form-control col-md-2 sel-adj float-right">
				<option value="all">{{ $t('all') }}</option>
				<option value="read">{{ $t('read') }}</option>
				<option value="unread">{{ $t('unread') }}</option>
			</select>
			<a href='#' class="btn btn-brand border float-right" v-on:click="markAllRead()" :title="$t('Mark_all_read')"><i class="fas fa-tasks"></i></a>
		</div>
		
		<div class="row p-2 border border-bottom-0" v-for="(notif, index) in notifications" :key="index" :notif="notif" v-if="renderNotif(notif)">
			<span class="col-md-2">
			  <a :href="notif.url" v-on:click="markRead(notif)" >{{ date(notif.date) }}</a>
			</span>
			<span class="col-md-8">
				<a :href="notif.url" v-on:click="markRead(notif)">
					<i class="fas fa-user-plus p-1" v-if="notif.type == 'friendship' || notif.type == 'friendship_request'"></i>
					<i class="fas fa-user-friends p-1" v-else-if="notif.type == 'friendship_acceptance'"></i>
					<span>{{ notif.details }}</span>
					<span v-if="notif.action_taker" class="user-avatar notifications-avatar mr-1 mb-3"
				   :style="'background-image: url('+profImgUrl+'/u/' + notif.action_taker + '/avatar)'"></span>
				</a>
			</span>
			<span class="col-md-1">
			  <a href="#" v-on:click="markRead(notif)" >{{ notif.status }}</a>
			</span>
			<span class="col-md-1">
			  <a href="#" v-on:click="markRead(notif)" :title="$t('mark_as_read')"  v-if="notif.status == 'unread'"><i class="fas fa-check-square"></i></a>
			  <a href="#" v-on:click="markUnread(notif)" :title="$t('mark_as_unread')"  v-else><i class="far fa-square"></i></a>
			</span>
		  </div>
		
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
			<a href="/login" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>
	
	<Footer />
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import steem from 'steem'
  import {mapGetters} from 'vuex'
  
  import Vue from 'vue'

  export default {
	head () {
		return {
		  title: `Actifit user notifications - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Actifit user notifications list` },
			{ hid: 'ogdescription', name: 'og:description', content: `Actifit user notifications list` }
		  ]
		}
	},
	data () {
		return {
			notifications: [],
			loading: false,
			acti_goog_ad_square:{display:'inline-block', maxWidth:'300px', maxHeight: '350px'},
			currentFilter: 'all',
			profImgUrl: process.env.hiveImgUrl,
		}
	},
	watch: {
	  user: 'updateUserData',
	},
	components: {
	  NavbarBrand,
	  Footer,
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['userTokens', 'userRank']),
	  formattedProfileUrl () {
		return "https://actifit.io/" + this.displayUser;
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
	  date(val) {
        let date = new Date(val)
        let minutes = date.getMinutes()
        return date.getDate() + '/' 
			+ (date.getMonth() + 1) + '/' 
			+ date.getFullYear() + ' ' 
			+ date.getHours() + ':' 
			+ (minutes < 10 ? '0' + minutes : minutes)
      },
	  renderNotif(notif){
		if (this.currentFilter == 'all'){
			return true;
		}
		if (notif.status == this.currentFilter){
			return true;
		}
		return false;
	  },
	  async updateUserData () {
		if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			try{
				let user_data = await this.$steemconnect.me();
				this.user.account = user_data.account;
			}catch(excp){
				console.log(excp);
			}
		  }
		  
		this.$store.dispatch('fetchUserTokens')
		this.$store.dispatch('fetchUserRank')
		  
		//grab user's notifications
		if (this.user){
			let res = await fetch(process.env.actiAppUrl + 'allNotifications/' + this.user.account.name);
			let outcome = await res.json();
			try{
				this.notifications = outcome;
			}catch(err){
				console.log('error fetching notifications');
			}
		}
		this.$forceUpdate()
	  },
	  async markRead(notif){
		let accToken = localStorage.getItem('access_token')
		
		let url = new URL(process.env.actiAppUrl + 'markRead/' + notif._id + '?user=' + this.user.account.name);
			
		let reqHeads = new Headers({
		  'Content-Type': 'application/json',
		  'x-acti-token': 'Bearer ' + accToken,
		});
		let res = await fetch(url, {
			method: 'GET',
			headers: reqHeads,
		});
		
		let outcome = await res.json();
		console.log(outcome);
		console.log(outcome.status);
		this.updateUserData()
	  },
	  async markUnread(notif){
		let accToken = localStorage.getItem('access_token')
		
		let url = new URL(process.env.actiAppUrl + 'markUnread/' + notif._id + '?user=' + this.user.account.name);
			
		let reqHeads = new Headers({
		  'Content-Type': 'application/json',
		  'x-acti-token': 'Bearer ' + accToken,
		});
		let res = await fetch(url, {
			method: 'GET',
			headers: reqHeads,
		});
		
		let outcome = await res.json();
		console.log(outcome);
		console.log(outcome.status);
		this.updateUserData()
	  },
	  async markAllRead(){
		let userConf = confirm(this.$t('Mark_all_read_confirm'));
		if (!userConf) {
		  return;
		}
		
		let accToken = localStorage.getItem('access_token')
		
		let url = new URL(process.env.actiAppUrl + 'markAllRead/?user=' + this.user.account.name);
		
		let reqHeads = new Headers({
		  'Content-Type': 'application/json',
		  'x-acti-token': 'Bearer ' + accToken,
		});
		let res = await fetch(url, {
			method: 'GET',
			headers: reqHeads,
		});
		
		let outcome = await res.json();
		console.log(outcome);
		console.log(outcome.status);
		this.updateUserData()
	  }
	},
	async mounted () {
		// login
		this.$store.dispatch('steemconnect/login')
		
		this.updateUserData()
		
		this.profImgUrl = process.env.hiveImgUrl;
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		if (cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
		
		//fetch new notifications every minute
		setInterval(this.updateUserData, 60000);
		  	
	}
  }
</script>

<style>
	.user-name{
		margin-left: 10px;
		padding: 10px;
	}
	.large-avatar{
		width: 128px;
		height: 128px;
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
	.increased-rank{
		color: #76BB0E;
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
	.notifications-avatar{
		width: 40px;
		height: 40px;
		background-position: center center;
		background-size: cover;
		border-radius: 50%;
		border: solid 1px #ddd;
		float: right;
	}
</style>
