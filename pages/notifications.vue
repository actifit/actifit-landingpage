<template>
  <div>
	<!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav d-none d-sm-block">
        <li class="nav-item">
          <!-- home link -->
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu />
    </nav>
	
	<div class="container pt-5 mt-5 pb-5" v-if="user">
	
		<h4 class="text-brand user-name">@{{ user.account.name }} {{ $t('Notifications') }}</h4>
		
		<div class="row p-2" v-for="(notif, index) in notifications" :key="index" :notif="notif">
			<span>
			  <a :href="notif.url" v-on:click="markRead(notif)" class="col-md-2">{{ notif.date }}</a>
			</span>
			<span class="col-md-6">
				<a :href="notif.url" v-on:click="markRead(notif)">
					<i class="fas fa-user-plus p-1" v-if="notif.type == 'friendship' || notif.type == 'friendship_request'"></i>
					<i class="fas fa-user-friends p-1" v-else-if="notif.type == 'friendship_acceptance'"></i>
					<span>{{ notif.details }}</span>
					<span v-if="notif.action_taker" class="user-avatar user-avatar-medium mr-1 mb-3"
				   :style="'background-image: url(https://steemitimages.com/u/' + notif.action_taker + '/avatar)'"></span>
				</a>
			</span>
			<span>
			  <a href="#" v-on:click="markRead(notif)" class="col-md-2">{{ notif.status }}</a>
			</span>
			<span>
			  <a href="#" v-on:click="markRead(notif)" class="col-md-2" :title="$t('mark_as_read')"><i class="fas fa-check-square"></i></a>
			</span>
		  </div>
		
		<adsbygoogle ad-slot="8625360638" :ad-style="acti_goog_ad_square"/>
		
      
		
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
	<no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
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
			cur_bchain: 'HIVE',
			loading: false,
			acti_goog_ad_square:{display:'inline-block', maxWidth:'300px', maxHeight: '350px'},
			
		}
	},
	watch: {
	  user: 'updateUserData',
	},
	components: {
	  NavbarBrand,
	  UserMenu,
	  Footer,
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['userTokens']),
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
	  
	  async processTrxFunc(op_name, cstm_params){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.block_num) {
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
	  },
	  async updateUserData () {
		console.log('updateUserData '+this.cur_bchain)
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
		let res = await fetch(process.env.actiAppUrl + 'markRead/' + notif._id);
		let outcome = await res.json();
		console.log(outcome);
		console.log(outcome.status);
		this.updateUserData()
	  },
	  async markAllRead(){
		let res = await fetch(process.env.actiAppUrl + 'markAllRead/?user=' + this.user.account.name);
		let outcome = await res.json();
		console.log(outcome);
		console.log(outcome.status);
		this.updateUserData()
	  }
	},
	async mounted () {
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		// login
		this.$store.dispatch('steemconnect/login')
		
		this.updateUserData()
		
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
</style>
