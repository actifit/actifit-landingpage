<template>
  <div>
	<script src="https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit" async defer></script> 
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

    <div class="container pt-5 mt-5 pb-5">
		<div class="border-0 card form home-card mt-3 mt-md-2 mx-auto p-3 text-center">
			<h3 class="p-3">{{ $t('Login_actifit') }}</h3>
		<div class="row">
			<div class="std-login col-md-6">
				<!--<h5 class="col-md-6"><img src="/img/STEEM.png" class="token-logo-sm">Standard Login</h5>-->
				<div class="form-group">
					<input type="text" id="username" name="username" :placeholder="$t('Username')" ref="username" class="form-control form-control-lg mb-2">
					<input type="password" id="ppkey" name="ppkey" ref="ppkey" :placeholder="$t('Ppkey')"  class="form-control form-control-lg mb-2">
					<i class="fas fa-spin fa-spinner text-brand" v-if="!captchaReady"></i>
					<vue-recaptcha ref="recaptcha" @verify="onVerifyCaptcha" @expired="onExpiredCaptcha" @render="captchaReady=true" sitekey="6LdpcoMUAAAAAPGTqlvhKEK6Ayw5NqLDZz5Sjudq">
					</vue-recaptcha>
					<p class="text-brand" v-if="captcha_invalid">
					  <b>{{ captcha_invalid }}</b>
					</p>
					<div class="text-brand text-center" v-if="error_proceeding">
					  {{ this.error_msg}}
					</div>
					<div class="text-center p-2">
						<button v-on:click="proceedLogin" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}<i class="fas fa-spin fa-spinner text-white" v-if="login_in_progress"></i></button>
					</div>
				</div>
			</div>
			<div id="sc_connect" class="col-md-6">
				<div class="">
					<h5 class="text-bold">{{ $t('Login_via') }}</h5>
					<img src="img/sc-logo.png" class="mx-auto">
				</div>
				<div>
				  <a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-75">{{ $t('Login_sc') }}</a>
				</div>
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
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'
  import steem from 'steem'
  import VueRecaptcha from 'vue-recaptcha';

  import { mapGetters } from 'vuex'

  export default {
	head () {
		return {
		  title: `Login Page - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Login to your actifit.io account` },
			{ hid: 'ogdescription', name: 'og:description', content: `Login to your actifit.io account` }
		  ]
		}
	},
    components: {
      NavbarBrand,
      UserMenu,
      Transaction, // single transaction block
      Footer,
	  VueRecaptcha,
    },
	data () {
      return {
		resultReturned: false,
		username_exists: '',
		username_invalid: '',
		captchaValid: false,
		captcha_invalid: '',
		privatePostKey: '',
		error_proceeding: '',
		error_msg: '',
		account_name: '',
		is_logged_in: false,
		user: '',
		captchaReady: false,
		login_in_progress: false,
	  }
	},
    computed: {
    },
    async mounted () {
	
	},
	methods: {
	  handleUsername (val) {
		let vue_ctnr = this;
		this.username_invalid = '';
		this.username_exists = '';
		//validate format first
		let usernameValid = steem.utils.validateAccountName(val);
		//check for error msg
		if (usernameValid == null){
			//ensure no existing account matches same name
			steem.api.getAccounts([val], function(err, result) {
			  if (result.length>0){
				vue_ctnr.username_exists = 'Please choose a different username';
			  }
			});
		}else{
			this.username_invalid = usernameValid;
		}
	  },
	  onVerifyCaptcha (response) {
		this.captchaValid = true;
	  },
	  onExpiredCaptcha () {
		this.captchaValid = false;
	  },
	  setUserLoginStatus (json) {
		this.is_logged_in = json.success; 
		
		//console.log(json);
		if (json.success && json.token){
		
			localStorage.setItem('actiToken', json.token);
			
			let userSC = new Object();
			userSC.account = json.userdata;
			//append proper login data for SC, while making sure this is recognized as a normal login
			this.$store.commit('setStdLoginUser', true);
			localStorage.setItem('access_token', json.token)
			localStorage.setItem('std_login', true)
			localStorage.setItem('std_login_name', userSC.account.name)
			this.$store.commit('steemconnect/login', userSC);
			//this.$store.commit('steemconnect/setAccessToken',)
			//this.$steemconnect.login(this.$store.state, json.userdata);
			//console.log(this.$store.state.stdLoginUser);
			//await 
			this.$router.push('/');
		}else{
			//display error message
			this.error_proceeding = true;
			this.login_in_progress = false;
			this.error_msg = this.$t('login_error');
			return;
		}
	  },
	  async proceedLogin () {
		this.captcha_invalid = '';
		this.error_proceeding = false;
		this.error_msg = '';
		
		if (!this.captchaValid){
			this.captcha_invalid = this.$t('solve_captcha');
			return;
		}
		if (this.$refs["username"].value == '' || this.$refs["ppkey"].value == ''){
			this.error_proceeding = true;
			this.error_msg = this.$t('login_error');
			return;
		}
		this.login_in_progress = true;
		let account_name = this.$refs["username"].value;
		let priv_pkey = this.$refs["ppkey"].value;
		let vue_ctnr = this;
		let user_info = {
						'username': account_name,
						'ppkey': priv_pkey
					}
		fetch(process.env.actiAppUrl+'loginAuth',{
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json'
				  // 'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: JSON.stringify(user_info)
			}).then(
			res => {res.json().then(json => this.setUserLoginStatus (json)).catch(e => reject(e))
		}).catch(e => reject(e))
		
	  },
	}
  }
	
</script>
<style>
.icon-steemconnect:before {
    content: "\e6c1";
}
.icon-steemconnect{
	font-family: "iconfont" !important;
	font-size: 16px;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	font-size: 32px;
    color: #1500ff;
}
.std-login{
	border-right: 2px solid red;
}
</style>