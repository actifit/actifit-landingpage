<template>
  <div>
	
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
		<div class="border-0 card form home-card mt-3 mt-md-2 mx-auto p-3 col-md-6">
			<h3 class="p-3">{{ $t('Login_actifit') }}</h3>
			<!--<h5 class="col-md-6"><img src="/img/STEEM.png" class="token-logo-sm">Standard Login</h5>-->
			<div class="form-group">
			
				<div class="row col-12"><!--form-control-lg -->
					<input type="text" id="username" name="username" :placeholder="$t('Username')" ref="username" class="form-control form-control-lg m-1 col-md-8 acti-shadow">
					
				</div>
				
				<div class="row col-12">
					<button v-on:click="loginKeychain" class="btn btn-brand keychain-btn login-stdd-btn m-1"></button>
					<button v-on:click="loginHiveauth" class="btn hiveauth-btn acti-shadow login-stdd-btn m-1"></button>
				</div>
				<transition name="fade">
					<div v-if="hiveauth_wait">
						<div id="hiveauth-instructions">{{ $t('hiveauth_instructions')}}</div>
						<a href="#" id="hiveauth-qr-link" ref="hiveauth-qr-link" target="_blank" rel="noreferrer noopener">
							<canvas id="hiveauth-qr" ref="hiveauth-qr" />
						</a>
					</div>
				</transition>
                				
				<div class="row col-12">
					<input type="password" id="ppkey" name="ppkey" ref="ppkey" :placeholder="$t('Ppkey')"  class="form-control form-control-lg m-1 col-md-8 acti-shadow">
				</div>
				
				<div class="row col-12">
					<button v-on:click="proceedLogin" class="btn btn-brand login-stdd-btn m-1"><b>{{ $t('Login') }}</b><i class="fas fa-spin fa-spinner text-white" v-if="login_in_progress"></i></button>
				</div>
				
				<span class="row form-control-lg ml-0">
					<a href="/password" class="small">Forgot my posting key?</a>
				</span>
				<span class="row mb-1 form-control-lg " style="display: none">
				  <div class="bchain-option p-1 m-1 btn" :class="adjustHiveClass">
					<input type="radio" id="hive_bchain" value="HIVE" v-model="bchain_val">
					<img src="/img/HIVE.png" style="max-height: 50px;" v-on:click="bchain_val = 'HIVE'">
					<label for="hive_bchain">HIVE</label>
				  </div>
				  <div class="bchain-option p-1 m-1 btn m-auto" :class="adjustSteemClass" style="display:none">
					<input type="radio" id="steem_bchain" value="STEEM" v-model="bchain_val">
					<img src="/img/STEEM.png" style="max-height: 50px;" v-on:click="bchain_val = 'STEEM'" >
					<label for="steem_bchain">STEEM</label>
				  </div>
				  <div class="bchain-option p-1 m-1 btn" :class="adjustBlurtClass">
					<input type="radio" id="blurt_bchain" value="BLURT" v-model="bchain_val">
					<img src="/img/BLURT.png" style="max-height: 50px;" v-on:click="bchain_val = 'BLURT'" >
					<label for="blurt_bchain">BLURT</label>
				  </div>
				</span>
				<span class="row mb-1 form-control-lg ml-0">
					<input type="checkbox" id="keeploggedin" v-model="keep_loggedin_val" >
					<label for="keeploggedin" class="ml-2">Keep me logged in</label>
				</span>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
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
  
  //import VueRecaptcha from 'vue-recaptcha';
  
  import { VueReCaptcha } from 'vue-recaptcha-v3'

  
  //import { VueReCaptchaV3 } from 'vue-recaptcha-v3';

  import { mapGetters } from 'vuex'
  
  //import hive from '@hiveio/hive-js'
  
  //import blurt from '@blurtfoundation/blurtjs'
  
  //import {keychain, isKeychainInstalled, hasKeychainBeenUsed} from '@hiveio/keychain'

  import Vue from 'vue'
  Vue.use(VueReCaptcha, { siteKey: process.env.captchaV3Key })
  
  //QR display for hive auth
  import QRious from 'qrious';
  
  //to validates keys for hive
  import { PublicKey, Signature, hash } from '@hiveio/hive-js/lib/auth/ecc';

  /*import HasClient from 'hive-auth-client';
  const client = new HasClient('hive-auth.arcange.eu', '', true);
  client.addEventHandler('ConnectionSuccess', connectedHAS);*/


	
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
	  //VueRecaptcha,
	  //VueReCaptcha,
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
		keychain: {},
		keychain_available: false,
		hiveauth_wait: false,
		hiveauth_key: undefined,
		hiveauth_token: undefined,
		hiveauth_expire: undefined,
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
		console.log('load recaptcha')
		await this.$recaptchaLoaded()
		console.log('complete')
		this.verifyKeychain();
	},
	methods: {
	  onVerifyCaptcha (response) {
		this.captchaValid = true;
	  },
	  generateToken (multip) {
		//generate random 11 characters password
		let passString = '';
		for (let i=0;i<multip;i++){
			passString += Math.random().toString(36).substr(2, 13);
		}
		return passString;
	  },
	  onExpiredCaptcha () {
		this.captchaValid = false;
	  },
	  setHiveauthLoginStatus (json){
		
		let acct_data = json.HIVE;
		
		let userSC = new Object();
		userSC.account = acct_data;
		//append proper login data for SC, while making sure this is recognized as a normal login
		this.is_logged_in = true;
		this.$store.commit('setStdLoginUser', true);
		localStorage.setItem('acti_login_method', 'hiveauth');
		localStorage.setItem('access_token', this.hiveauth_token);
		localStorage.setItem('expires', this.hiveauth_expire);
		localStorage.setItem('key', this.hiveauth_key);
		localStorage.setItem('std_login', true)
		localStorage.setItem('std_login_name', userSC.account.name)
		this.$store.commit('steemconnect/login', userSC);
		this.$router.push('/');
	  },
	  setKeychainLoginStatus (json){
		console.log('keychain login');
		console.log(json);
		if (json && json.HIVE){
			
			//hide captcha as well
			const recaptcha = this.$recaptchaInstance
			
			// Hide reCAPTCHA badge:
			recaptcha.hideBadge();
			
			let acct_data = json.HIVE;
			
			let userSC = new Object();
			userSC.account = acct_data;
			//append proper login data for SC, while making sure this is recognized as a normal login
			this.is_logged_in = true;
			this.$store.commit('setStdLoginUser', true);
			localStorage.setItem('access_token', this.generateToken(2));
			localStorage.setItem('std_login', true)
			localStorage.setItem('std_login_name', userSC.account.name)
			localStorage.setItem('acti_login_method', 'keychain');
			this.$store.commit('steemconnect/login', userSC);
			this.$router.push('/');
		}else{
			//display error message
			this.error_proceeding = true;
			this.login_in_progress = false;
			this.error_msg = this.$t('login_error');
			return;
		}
	  },
	  setUserLoginStatus (json) {
		this.is_logged_in = json.success; 
		
		//console.log(json);
		if (json.success && json.token){
		
			//hide captcha as well
			const recaptcha = this.$recaptchaInstance

			// Hide reCAPTCHA badge:
			recaptcha.hideBadge();
		
			localStorage.setItem('actiToken', json.token);
			
			let userSC = new Object();
			userSC.account = json.userdata;
			//append proper login data for SC, while making sure this is recognized as a normal login
			this.$store.commit('setStdLoginUser', true);
			localStorage.setItem('access_token', json.token)
			localStorage.setItem('std_login', true)
			localStorage.setItem('std_login_name', userSC.account.name)
			localStorage.setItem('acti_login_method', '');
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
	  verifyHiveauth (challenge, data){
			// Validate signature against account public key
		console.log(challenge);
		console.log(data);
		const sig = Signature.fromHex(data.challenge);
		const buf = hash.sha256(challenge, null, 0);
		return sig.verifyHash(buf, PublicKey.fromString(data.pubkey));
	  },
	  async loginHiveauth (){
		if (this.$refs["username"].value == ''){
			this.error_proceeding = true;
			this.error_msg = this.$t('login_error');
			return;
		}
		this.login_in_progress = true;
		let account = this.$refs["username"].value.trim().toLowerCase();
		const APP_META = {
			name:"actifit", 
			description:"Actifit - Rewarding Your EveryDay Activity", 
			icon:"https://actifit.io/img/actifit_logo.png"
		}
		// Create an authentication object
		const auth = {
		  username: account,
		  expire: undefined,
		  key: undefined,
		}
		// Retrieving connection status
		const status = this.$HAS.status()
		console.log(status)
		let challenge_data = undefined
		
		challenge_data = {
			key_type: "posting",
			challenge: JSON.stringify({
				login: account,
				ts: Date.now(),
			})
		}
		let mainRef = this;
		this.$HAS.authenticate(auth, APP_META, challenge_data, (message) => {
			console.log(message)    // process auth_wait message
			const {
				data, uuid, authData,
			} = message;
			console.log(data);
			if (message.cmd && message.cmd === 'auth_wait'){
				this.hiveauth_wait = true;
				this.$nextTick(() => {
					//this.timeLeft = timeLeft;
					const authPayload = {
						uuid: message.uuid,
						account: account,
						key: message.key,
						host: 'wss://hive-auth.arcange.eu'
					};
					this.hiveauth_key = message.key;
					//authentication url
					const authUri = `has://auth_req/${btoa(JSON.stringify(authPayload))}`;

					const qrLinkElement = mainRef.$refs['hiveauth-qr-link'];
					const qrElement = mainRef.$refs['hiveauth-qr'];
					const QR = new QRious({
							element: qrElement,
							background: 'white',
							backgroundAlpha: 0.8,
							foreground: 'black',
							size: 200,
						});
					QR.value = authUri;
					qrLinkElement.href = authUri;
				});
				
			}
		}).then(message => {
			//resolve(res)
			console.log(message);
			if (message.cmd && message.cmd === 'auth_ack'){
				//approved, verify pub key
				const {
					data, uuid, authData,
				} = message;
				//console.log(data);
				//console.log(uuid);
				const { expire, token, challenge: challengeResponse } = data;
				/*const {
					data, uuid, authData: { token, key, expire },
				} = message;
				const { challenge: challengeResponse } = data;*/
				console.log(data)
				//console.log(challengeResponse);
				const success = this.verifyHiveauth(challenge_data.challenge, data.challenge);
				//const success = this.verifyHiveauth(challenge, challengeResponse);
				console.log(success);
				this.hiveauth_wait = false;
				this.hiveauth_expire = expire;
				this.hiveauth_token = token;
				if (success){
					//hide captcha as well
					const recaptcha = this.$recaptchaInstance
					
					// Hide reCAPTCHA badge:
					recaptcha.hideBadge();
					this.login_in_progress = false;
					
					fetch(process.env.actiAppUrl+'getAccountData?user='+account+'&bchain=HIVE').then(
					res => {
						res.json().then(json => 
							{
								this.setHiveauthLoginStatus (json)
							}
						).catch(e => reject(e))
					}).catch(e => reject(e))
				}else{
					//display error message
					this.error_proceeding = true;
					this.login_in_progress = false;
					this.error_msg = this.$t('login_error');
					return;
				}
				
			}else if (message.cmd && message.cmd === 'auth_nack'){
				//display error message
				this.error_proceeding = true;
				this.login_in_progress = false;
				this.error_msg = this.$t('auth_rejected_by_user');
				return;
			}
		}) 
		.catch(err => {
			console.error(err)
			this.error_proceeding = true;
			this.error_msg = err;
			this.hiveauth_wait = false;
			this.login_in_progress = false;
		})
		
		
	  },
	  async verifyKeychain () {
		return new Promise((resolve) => {
			if (window.hive_keychain) {
				this.keychain = window.hive_keychain
				let mainRef = this;
				this.keychain.requestHandshake(() => {
					console.log('keychain installed');
					this.keychain_available = true;
					resolve();
				});
			}
		})
	  },
	  async loginKeychain () {
		await this.verifyKeychain();
		if (!this.keychain_available){
			console.log("You do not have hive keychain installed");
			return;
		}
		if (this.$refs["username"].value == ''){
			this.error_proceeding = true;
			this.error_msg = this.$t('login_error');
			return;
		}
		
		//set proper blockchain selected
		this.$store.commit('setBchain', this.bchain_val);
		
		localStorage.setItem('cur_bchain', this.bchain_val)
		
		let account_name = this.$refs["username"].value.trim().toLowerCase();
		const message = account_name + Date.now();
		
		let user_info = {
						'username': account_name,
						'bchain': this.bchain_val
					}
		console.log('loginkeychain attempt')
		console.log(process.env.actiAppUrl);
		let outc = await fetch(process.env.actiAppUrl+'loginKeychain',{
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json'
				},
				body: JSON.stringify(user_info)
			})
		let contt = await outc.json();
		//console.log(contt)
		
		if (contt.message){
			window.hive_keychain.requestVerifyKey(account_name, contt.message, 'Posting', (response) => {
			  //console.log(response);
			  if (response.success === true) {
				//successfully verified user
				
				fetch(process.env.actiAppUrl+'getAccountData?user='+account_name+'&bchain=HIVE').then(
					res => {
						res.json().then(json => 
							{
								this.setKeychainLoginStatus (json)
							}
						).catch(e => reject(e))
					}).catch(e => reject(e))
			  }
			});

		}
		
	  },
	  async proceedLogin () {
		this.captcha_invalid = '';
		this.error_proceeding = false;
		this.error_msg = '';
		
		/*if (!this.captchaValid){
			this.captcha_invalid = this.$t('solve_captcha');
			return;
		}*/
		
		if (this.$refs["username"].value == '' || this.$refs["ppkey"].value == ''){
			this.error_proceeding = true;
			this.error_msg = this.$t('login_error');
			return;
		}
		
		//check captcha V3
		// Execute reCAPTCHA with action "login".
		const token = await this.$recaptcha('login')
		
		//verify recaptcha-v3
		
		let outc = await fetch(process.env.actiAppUrl+'verifyLoginCaptcha?token='+token);
		console.log(outc);
		//let outc = await outc.json();
		
		if (outc.error){
			this.error_proceeding = true;
			this.login_in_progress = false;
			this.error_msg = this.$t('login_error');
			return;
		}
		//otherwise, we're good, continue

		console.log(token);
		
		//set proper blockchain selected
		this.$store.commit('setBchain', this.bchain_val);
		
		localStorage.setItem('cur_bchain', this.bchain_val)
		
		this.login_in_progress = true;
		let account_name = this.$refs["username"].value.trim().toLowerCase();
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
.login-stdd-btn{
	height: 50px;
	width: 150px;
}
.keychain-btn{
	background: url(/img/keychain.png) round !important;
}
.hiveauth-btn{
	/* background: url(/img/hiveauth2.png) round !important; */
	background-size: contain;
    background-repeat: no-repeat;
    background-color: black;
    background-position: center;
	background-origin: content-box;
    background-image: url(/img/hiveauth3.png);
}
.hiveauth-btn:hover, .keychain-btn:hover{
	background-color: darkred;
}
</style>