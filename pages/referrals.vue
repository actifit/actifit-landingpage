<template>
  <div>
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav">
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

      <!-- account balance -->
      <div class="text-center">
        <h3 class="mb-4" v-if="user">{{ $t('Hey') }} {{ user.account.name }}!</h3>
		<p class="lead">{{ $t('referral_notice') }}</p>
        <h5>{{ $t('Your_Referral_Link') }}</h5>
		<input type="text" :class="smallScreenClasses" class="p-3" name="refLink" ref="refLink" id="referral-link" :value="refUrl" readonly/>
		<button v-on:click="copyContent" data-targetEl="refLink" class="btn btn-brand p-3">{{ $t('Copy_Link') }}</button>	
		<div class="text-brand"> 
			<span class="share-txt">{{ $t('Share') }} </span>
			<social-sharing :url="refUrl"
						  title="Actifit - Rewarding Your Everyday Activity"
						  description="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity "
						  quote="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity"
						  hashtags="actifit,steem,health,mobile"
						  twitter-user="actifit_fitness"
						  inline-template>
				 <div class="share-links-actifit">
				  <network network="facebook">
					<i class="fab fa-facebook" title="facebook"></i>
				  </network>
				  <network network="twitter">
					<i class="fab fa-twitter" title="twitter"></i>
				  </network>
				  <network network="telegram">
					<i class="fab fa-telegram" title="telegram"></i>
				  </network>
				  <network network="whatsapp">
					<i class="fab fa-whatsapp" title="whatsapp"></i>
				  </network>
				  <network network="weibo">
					<i class="fab fa-weibo" title="weibo"></i>
				  </network> 
				  <network network="googleplus">
					<i class="fab fa-google-plus" title="google+"></i>
				  </network>
				  <br />
				  <network network="line">
					<i class="fab fa-line" title="line"></i>
				  </network>
				  <network network="linkedin">
					<i class="fab fa-linkedin" title="linkedin"></i>
				  </network>
				  <network network="reddit">
					<i class="fab fa-reddit" title="reddit"></i>
				  </network>
				  <network network="skype">
					<i class="fab fa-skype" title="skype"></i>
				  </network>
				  <network network="sms">
					<i class="fas fa-comment" title="SMS"></i>
				  </network>
				  <network network="email">
					  <i class="fa fa-envelope" title="email"></i>
				  </network>
			  </div>
			</social-sharing>
		</div>
      </div>

      <!-- Referrals -->
      <div class="history mx-auto">
        <h3 class="text-center mt-5">{{ $t('My_Referrals') }}</h3>
        <Referral v-for="(referral, index) in referrals" :key="index" :referral="referral" />
        <div class="text-center"><small class="text-muted" v-if="referrals.length === 0">{{ $t('No_referrals_notice') }}</small></div>
      </div>
    </div>
	
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
	    <p class="lead">{{ $t('referral_notice') }}</p>
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('login_required_referrals') }}
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>
	
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Referral from '~/components/Referral'
  import Footer from '~/components/Footer'
  
  import SocialSharing from 'vue-social-sharing'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      NavbarBrand,
      UserMenu,
      Referral, // single referral block
      Footer,
	  SocialSharing,
    },
	data (){
	  return {
	    refUrl: '',
		screenWidth: 1200,
	  }
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'referrals', 'userRank']),
	  displayUserRank () {
		return this.userRank
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  },
    },
    async mounted () {
	  this.screenWidth = screen.width;
	  this.fetchUserInfo();
    },
	created () {
	  this.$store.dispatch('steemconnect/login')
	},
	watch: {
	  user : 'fetchUserInfo'
	},
	methods: {
	  copyContent (event) {
		  /* Get the text field */
		  var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
		  /* Select the text field */
		  copyText.select();
		  /* Copy the text inside the text field */
		  document.execCommand("copy");
		  return;
	  },
	  fetchUserInfo () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchReferrals')
		  this.$store.dispatch('fetchUserRank')
		  let baseUrl = window.location.origin;
		  this.refUrl = baseUrl + '/signup?referrer=' + this.user.account.name;
		}
	  }
	},
  }
</script>
<style>
	#referral-link{
	  border-color: #ff112d;
	}
	.share-links-actifit span{
	  cursor: pointer;
	  font-size: 22px;
	  padding: 5px;
	}
	.share-txt {
	  font-size: 20px;
	}
</style>
