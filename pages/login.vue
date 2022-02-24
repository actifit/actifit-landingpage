<template>
  <div>
	<!--<script src="https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit" async defer></script> -->
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
		<div class="border-0 card form home-card mt-3 mt-md-2 mx-auto p-3 text-center col-md-6">
			<h3 class="p-3">{{ $t('Login_actifit') }}</h3>
			<!--<h5 class="col-md-6"><img src="/img/STEEM.png" class="token-logo-sm">Standard Login</h5>-->
			<div class="form-group">
				<input type="text" id="username" name="username" :placeholder="$t('Username')" ref="username" class="form-control form-control-lg mb-2">
				<input type="password" id="ppkey" name="ppkey" ref="ppkey" :placeholder="$t('Ppkey')"  class="form-control form-control-lg mb-2">
				<span class="row mb-2 form-control-lg">
					<a href="/password" class="small">Forgot my posting key?</a>
				</span>
				<span class="row mb-2 form-control-lg ">
				  <div class="bchain-option p-2 m-2 btn m-auto" :class="adjustHiveClass">
					<input type="radio" id="hive_bchain" value="HIVE" v-model="bchain_val">
					<img src="/img/HIVE.png" style="max-height: 50px;" v-on:click="bchain_val = 'HIVE'">
					<label for="hive_bchain">HIVE</label>
				  </div>
				  <div class="bchain-option p-2 m-2 btn m-auto" :class="adjustSteemClass">
					<input type="radio" id="steem_bchain" value="STEEM" v-model="bchain_val">
					<img src="/img/STEEM.png" style="max-height: 50px;" v-on:click="bchain_val = 'STEEM'" >
					<label for="steem_bchain">STEEM</label>
				  </div>
				  <div class="bchain-option p-2 m-2 btn m-auto" :class="adjustBlurtClass">
					<input type="radio" id="blurt_bchain" value="BLURT" v-model="bchain_val">
					<img src="/img/BLURT.png" style="max-height: 50px;" v-on:click="bchain_val = 'BLURT'" >
					<label for="blurt_bchain">BLURT</label>
				  </div>
				</span>
				<span class="row mb-2 form-control-lg ">
					<input type="checkbox" id="keeploggedin" v-model="keep_loggedin_val" >
					<label for="keeploggedin" class="ml-3">Keep me logged in</label>
				</span>
				<i class="fas fa-spin fa-spinner text-brand" v-if="!captchaReady"></i>
				<vue-recaptcha ref="recaptcha" @verify="onVerifyCaptcha" @render="captchaReady=true" @expired="onExpiredCaptcha" :loadRecaptchaScript="true" sitekey="6LdpcoMUAAAAAPGTqlvhKEK6Ayw5NqLDZz5Sjudq">
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
	</div>
	<Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  //import steem from 'steem'
  import VueRecaptcha from 'vue-recaptcha';
  
  //import { VueReCaptchaV3 } from 'vue-recaptcha-v3';

  import { mapGetters } from 'vuex'
  
  //import hive from '@hiveio/hive-js'
  
  //import blurt from '@blurtfoundation/blurtjs'

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
      Footer,
	  //VueReCaptchaV3
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
		bchain_val: 'HIVE',
		keep_loggedin_val: false,
	  }
	},
    computed: {
		adjustHiveClass () {
			if (this.bchain_val != 'HIVE'){
				return 'option-opaque';
			}
			return '';
		},
		adjustSteemClass () {
			if (this.bchain_val != 'STEEM'){
				return 'option-opaque';
			}
			return '';
		},
		adjustBlurtClass () {
			if (this.bchain_val != 'BLURT'){
				return 'option-opaque';
			}
			return '';
		}
    },
    async mounted () {
		/*try {
		  await this.$recaptcha.init()
		} catch (e) {
		  console.log(e);
		}*/
	},
	methods: {
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
		
		/*try {
			const token = await this.$recaptcha.execute('login')
			console.log('ReCaptcha token:', token)
		} catch (error) {
			console.log('Login error:', error)
			this.captcha_invalid = this.$t('solve_captcha');
			return;
		}*/
		
		if (!this.captchaValid){
			this.captcha_invalid = this.$t('solve_captcha');
			return;
		}
		
		if (this.$refs["username"].value == '' || this.$refs["ppkey"].value == ''){
			this.error_proceeding = true;
			this.error_msg = this.$t('login_error');
			return;
		}
		
		//set proper blockchain selected
		this.$store.commit('setBchain', this.bchain_val);
		
		localStorage.setItem('cur_bchain', this.bchain_val)
		
		this.login_in_progress = true;
		let account_name = this.$refs["username"].value.toLowerCase();
		let priv_pkey = this.$refs["ppkey"].value;
		let vue_ctnr = this;
		let user_info = {
						'username': account_name,
						'ppkey': priv_pkey,
						'bchain': this.bchain_val,
						'keeploggedin': this.keep_loggedin_val
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
.option-opaque{
	opacity: 0.5;
}
</style>