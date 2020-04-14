<template>
  <!-- login link or user dropdown menu when logged in, for navbar-->
  <div class="user-menu-container ml-auto position-absolute d-flex align-items-center">
    <ul class="navbar-nav mr-auto user-menu flex-row">
	  <li class="nav-item" v-if="!user">
		<a :href="'/signup'" >{{ $t('Signup_Link') }}</a> | <a :href="'/login'" >{{ $t('Login') }}</a>
	  </li>
	  <li class="nav-item mr-2" v-if="user" >
        <span class="navbar-text py-0 text-brand" >{{ $t('Rank') }}&nbsp;<br><b>{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRankObj && this.userRankObj.afitx_rank">{{  displayIncreasedUserRank }}</span></b></span>
      </li>
      <li class="nav-item mr-2" v-if="user">
        <span class="navbar-text py-0">{{ $t('Balance') }}<br><b>{{ formattedUserTokens }}</b></span>
      </li>
	  <li class="nav-item mr-2" v-if="user">
		<span class="user-avatar-small group-class notification-class text-brand" v-if="activeNotificationsLen > 0">{{ this.activeNotificationsLen }}</span>
        <span class="user-avatar group-class" v-if="activeNotificationsLen > 0">
			<a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown" :title="$t('Notifications_popup').replace('_count_', activeNotificationsLen)">
				<i class="fas fa-bell p-2 text-brand"></i>
			</a>
			<div class="dropdown-menu dropdown-menu-right notif-container">
			  <div class="row p-2" v-for="(notif, index) in activeNotifications" :key="index" :notif="notif">
				<span class="col-md-10">
					<a :href="notif.url" v-on:click="markRead(notif)">
						<i class="fas fa-user-plus p-1" v-if="notif.type == 'friendship' || notif.type == 'friendship_request'"></i>
						<i class="fas fa-user-friends p-1" v-else-if="notif.type == 'friendship_acceptance'"></i>
						<span>{{ notif.details }}</span>
						<span v-if="notif.action_taker" class="user-avatar user-avatar-medium mr-1 mb-3"
					   :style="'background-image: url(https://steemitimages.com/u/' + notif.action_taker + '/avatar)'"></span>
					</a>
				</span>
				<span>
				  <a href="#" v-on:click="markRead(notif)" class="col-md-2" :title="$t('mark_as_read')"><i class="fas fa-check-square"></i></a>
				</span>
			  </div>
			</div>
		</span>
		<span class="user-avatar group-class" v-else>
			<a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown">
				<i class="fas fa-bell p-2"></i>
			</a>
			<div class="dropdown-menu dropdown-menu-right">
				<div class="p-2">{{ $t('no_notifications') }}</div>
			</div>
		</span>
      </li>
	  <li class="nav-item mr-2" v-if="user">
		<a href="#" @click.prevent="$router.push('/friends')" :title="$t('friends')"><span class="user-avatar group-class text-brand"><i class="fas fa-user-friends p-2" ></i></span></a>
	  </li>
      <li class="nav-item dropdown" v-if="user">
        <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown">
          <div class="user-avatar group-class" :style="'background-image: url(https://steemitimages.com/u/' + user.account.name + '/avatar)'"></div>
        </a>
        <div class="dropdown-menu dropdown-menu-right">
          <h6 class="dropdown-header text-center">@{{ user.account.name }}</h6>
          <div class="dropdown-divider"></div>
		  <a class="dropdown-item text-brand" href="#" @click.prevent="$router.push('/mods-access/')" v-if="isUserModerator">Moderation</a>
		  <div class="dropdown-divider" v-if="isUserModerator"></div>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet?action=buy_afit')">{{ $t('buy_afit_menu') }}<br/></a>
		  <a class="dropdown-item item-highlight" href="#" @click.prevent="$router.push('/market')">{{ $t('spend_afit_menu') }}<br/></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/' + user.account.name)">{{ $t('My_Profile') }}<br/></a>
		  <SteemStats :user="user" minView="true" class="dropdown-item" :key="reload"/>
		  <a class="dropdown-item" href="#" @click.prevent="">{{ $t('My_Rank') }} <br/><span class="text-brand"> {{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRankObj && this.userRankObj.afitx_rank">{{  displayIncreasedUserRank }}</span> </span></a>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet')">{{ $t('My_Wallet') }} <br/><span class="text-brand">  {{ formattedUserTokens }}</span></a>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/referrals')">{{ $t('My_Referrals') }} <br/><span class="text-brand"> {{ referralCount }} </span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/activity/' + user.account.name)">{{ $t('My_Activity') }}</a>
		  <a class="dropdown-item" href="#">{{ $t('Active_chain') }} <br />
			<img src="/img/HIVE.png" style="max-height: 20px;" v-on:click="setActiveChain('HIVE')" :class="adjustHiveClass">
			<img src="/img/STEEM.png" style="max-height: 20px;" v-on:click="setActiveChain('STEEM')" :class="adjustSteemClass">
		  </a>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/password')">{{ $t('My_Password') }}</a>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/settings')">{{ $t('Settings') }}</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="proceedLogout()">{{ $t('Logout') }}</a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import SteemStats from '~/components/SteemStats'

  export default {
	components: {
	  SteemStats
    },
	data () {
		return {
			activeNotifications: [],
			activeNotificationsLen: 1,
			cur_bchain: 'HIVE',
			reload: 0,
		}
	},
	watch: {
	  user: 'updateUserData',
	  bchain: function(newBchain) {
		console.log('change in chain');
		this.cur_bchain = newBchain;
		this.$store.dispatch('steemconnect/refreshUser');
		this.reload += 1;
	  }
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'userRank', 'userRankObj', 'referrals', 'bchain']),
	  ...mapGetters(['moderators']),
	  formattedUserTokens () {
        return this.numberFormat(parseFloat(this.userTokens).toFixed(3), 3) + ' AFIT'
      },
	  displayUserRank () {
		return parseFloat(this.userRank).toFixed(1)
	  },
	  displayCoreUserRank () {
		return (this.userRankObj?parseFloat(this.userRankObj.rank_no_afitx).toFixed(2):'');
	  },
	  displayIncreasedUserRank () {
		return '(+' + parseFloat(this.userRankObj.afitx_rank).toFixed(2) + ')';
	  },
	  referralCount () {
	    return this.referrals.length;
	  },
	  isUserModerator() {
		if (this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
		  return true;
		}
		return false;
	  },
	  adjustHiveClass () {
		if (this.cur_bchain != 'HIVE'){
			return 'option-opaque';
		}
		return 'active-spin';
	  },
	  adjustSteemClass () {
		if (this.cur_bchain != 'STEEM'){
			return 'option-opaque';
		}
		return 'active-spin';
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
	  setActiveChain(chain){
		if (this.cur_bchain == chain){
			//take no action if no change in chain
			return;
		}
		let userConf = confirm(this.$t('confirm_chain_switch').replace('_CHAIN_', chain));
		if (!userConf) {
		  return;
		}
		this.cur_bchain = chain;
		this.$store.commit('setBchain', this.cur_bchain);
		
		localStorage.setItem('cur_bchain', this.cur_bchain);
	  },
	  proceedLogout () {
		this.$store.commit('setStdLoginUser', false);
		localStorage.removeItem('std_login')
		localStorage.removeItem('std_login_name');
		this.$store.dispatch('steemconnect/logout')
	  },
	  async updateUserData () {
		console.log('updateUserData '+this.cur_bchain)
		//grab user's notifications
		if (this.user){
			let res = await fetch(process.env.actiAppUrl + 'activeNotifications/' + this.user.account.name);
			let outcome = await res.json();
			/*console.log('notifications>>>>>>');
			console.log(outcome);
			console.log(outcome.status);*/
			try{
				this.activeNotificationsLen = outcome.length;
				this.activeNotifications = outcome;
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
	  }
	},
    async mounted () {
		
		//grab current active chain
		if (localStorage.getItem('cur_bchain')){
			this.cur_bchain = localStorage.getItem('cur_bchain')
		}
		
		//grab moderators' list
		this.$store.dispatch('fetchModerators')
		
		this.updateUserData()
		
		//fetch new notifications every minute
		setInterval(this.updateUserData, 60000);
    },
  }
</script>

<style lang="sass">
.user-menu-container
  height: 54px
  top: 0
  right: 6px
  .user-menu
    .user-avatar
      width: 40px
      height: 40px
      background-position: center center
      background-size: cover
      border-radius: 50%
      border: solid 1px #ddd
    .dropdown-toggle::after
      display: none
    .navbar-text
      font-size: .8rem
    .dropdown-menu
      position: absolute
      right: 0
      left: auto
</style>
<style>
	#user_menu_navlink{
		height: 40px;
	}
	.increased-rank{
		color: #76BB0E;
	}
	.group-class{
		margin-left: 0px !important;
		display: inline-block;
	}
	.notification-class{
		background-color: red;
		color: white !important;
		display: inline-block;
		text-align: center;
		font-size: 12px;
		width: auto;
		min-width: 20px;
	}
	.group-class.user-avatar-small{
		float: left;
	}
	.user-avatar{
		text-align: center;
	}
	.user-avatar-medium{
		width: 30px !important;
		height: 30px !important;
		text-align: center;
		position: absolute;
		float: right;
	}
	.notif-container{
		max-height: 300px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.option-opaque{
		opacity: 0.3;
	}
	@keyframes spin {
		0% {
			transform: rotateZ(0);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}
	.active-spin{
		animation: spin 5s ease-in-out infinite alternate;
	}
</style>
