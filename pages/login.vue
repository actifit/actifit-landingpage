<template>
  <div>

    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
		<div class="border-0 card form home-card mt-3 mt-md-2 mx-auto p-3 col-md-6">
			<h1 class="p-3 h3">{{ $t('Login_actifit') }}</h1>
			<!--<h5 class="col-md-6"><img src="/img/STEEM.png" class="token-logo-sm" alt="">Standard Login</h5>-->
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
					<img src="/img/HIVE.png" style="max-height: 50px;" v-on:click="bchain_val = 'HIVE'" alt="Select Hive blockchain">
					<label for="hive_bchain">HIVE</label>
				  </div>
				  <div class="bchain-option p-1 m-1 btn m-auto" :class="adjustSteemClass" style="display:none">
					<input type="radio" id="steem_bchain" value="STEEM" v-model="bchain_val">
					<img src="/img/STEEM.png" style="max-height: 50px;" v-on:click="bchain_val = 'STEEM'" alt="Select Steem blockchain" >
					<label for="steem_bchain">STEEM</label>
				  </div>
				  <div class="bchain-option p-1 m-1 btn" :class="adjustBlurtClass">
					<input type="radio" id="blurt_bchain" value="BLURT" v-model="bchain_val">
					<img src="/img/BLURT.png" style="max-height: 50px;" v-on:click="bchain_val = 'BLURT'" alt="Select Blurt blockchain" >
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
  import signedChallengeLogin from '~/mixins/signedChallengeLogin';

  /*import HasClient from 'hive-auth-client';
  const client = new HasClient('hive-auth.arcange.eu', '', true);
  client.addEventHandler('ConnectionSuccess', connectedHAS);*/



  export default {
  mixins: [signedChallengeLogin],
	head () {
		return {
		  title: `Login Page - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Login to your Actifit account` },
			{ hid: 'ogdescription', name: 'og:description', content: `Login to your Actifit account` },
			{ hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'Login Page - Actifit.io' },
			{ name: 'robots', content: 'noindex, nofollow' }
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
	  // Takes the /loginVerify body, like the other two methods, so HiveAuth finally
	  // holds a real API session instead of a browser-only logged-in flag.
	  //
	  // access_token is the API JWT, since every x-acti-token caller reads that key. The
	  // HAS token moves to hiveauth_has_token: it is what $HAS.broadcast needs and is NOT
	  // interchangeable with the JWT. Holding both in access_token is what left HiveAuth
	  // users unable to reach any authenticated endpoint.
	  setHiveauthLoginStatus (json){
		if (!(json && json.success && json.token && json.userdata)){
			this.failLogin(this.$t('login_error'));
			return;
		}
		let userSC = new Object();
		userSC.account = json.userdata;
		this.is_logged_in = true;
		this.$store.commit('setStdLoginUser', true);
		localStorage.setItem('acti_login_method', 'hiveauth');
		localStorage.setItem('access_token', json.token);
		localStorage.setItem('hiveauth_has_token', this.hiveauth_token);
		localStorage.setItem('expires', this.hiveauth_expire);
		localStorage.setItem('key', this.hiveauth_key);
		localStorage.setItem('std_login', true)
		localStorage.setItem('std_login_name', userSC.account.name)
		this.captureSecurityNotice(json);
		this.$store.commit('steemconnect/login', userSC);
		this.postLoginRedirect();
	  },
	  postLoginRedirect () {
		// Honor a same-origin RELATIVE ?redirect (e.g. "Log in to join" from /arena),
		// otherwise go home. Reject absolute/protocol-relative URLs to avoid an
		// open-redirect (must start with a single '/').
		const r = this.$route && this.$route.query && this.$route.query.redirect;
		if (typeof r === 'string' && r.charAt(0) === '/' && r.charAt(1) !== '/') {
			this.$router.push(r);
		} else {
			this.$router.push('/');
		}
	  },
	  setKeychainLoginStatus (json){
		// json.userdata, not json.HIVE. The login API returns userdata, and this handler
		// reading HIVE is why Keychain login on /login was broken for every user while the
		// modal worked. It also used to console.log the whole response - including the
		// session JWT - which is gone.
		if (json && json.success && json.token && json.userdata){
			let acct_data = json.userdata;

			let userSC = new Object();
			userSC.account = acct_data;
			//append proper login data for SC, while making sure this is recognized as a normal login
			this.is_logged_in = true;
			this.$store.commit('setStdLoginUser', true);
			localStorage.setItem('access_token', json.token);
			localStorage.setItem('std_login', true)
			localStorage.setItem('std_login_name', userSC.account.name)
			localStorage.setItem('acti_login_method', 'keychain');
			this.captureSecurityNotice(json);
			this.$store.commit('steemconnect/login', userSC);
			this.postLoginRedirect();
		}else{
			//display error message
			this.error_proceeding = true;
			this.login_in_progress = false;
			this.error_msg = this.$t('login_error');
			return;
		}
	  },
	  // Capture the post-login security notice.
	  //
	  // actifit-bot returns, in the /loginVerify SUCCESS body, for a flagged account whose
	  // posting key has not been rotated since the 2026-10-21 incident:
	  //     security_notice: { code: 'KEY_ROTATION_RECOMMENDED', message: '<guidance>' }
	  // Login is NOT refused - the account works normally; the user is being advised to
	  // rotate the key the attacker may also hold.
	  //
	  // All three login methods now go through /loginVerify, so all three can carry
	  // it - and every success handler must capture it. Keychain users are likely
	  // the largest flagged group; missing it there would hide the notice from them.
	  //
	  // Stored rather than rendered here on purpose. This component calls closeModal()
	  // on success and pages/login.vue calls postLoginRedirect(), so a banner rendered at
	  // this point would be torn down before anyone read it. The store + localStorage
	  // pair survives the redirect, and layouts/default.vue shows it on every page until
	  // the user dismisses it.
	  //
	  // Allow-listed by code, so an unexpected field cannot put arbitrary server text on
	  // every page of the site.
	  captureSecurityNotice (json) {
	    const notice = json && json.security_notice;
	    if (!notice || notice.code !== 'KEY_ROTATION_RECOMMENDED') return;
	    if (typeof notice.message !== 'string' || !notice.message.trim()) return;
	    this.$store.commit('setSecurityNotice', notice.message);
	    try { localStorage.setItem('acti_security_notice', notice.message); } catch (e) { /* private mode */ }
	  },
	  setUserLoginStatus (json, postingKey) {
		this.is_logged_in = json.success;

		//console.log(json);
		if (json.success && json.token){


			localStorage.setItem('actiToken', json.token);

			let userSC = new Object();
			userSC.account = json.userdata;
			//append proper login data for SC, while making sure this is recognized as a normal login
			this.$store.commit('setStdLoginUser', true);
			this.$store.commit('setChatPostingKey', postingKey);
			localStorage.setItem('access_token', json.token)
			localStorage.setItem('std_login', true)
			localStorage.setItem('std_login_name', userSC.account.name)
			localStorage.setItem('acti_login_method', '');
			this.captureSecurityNotice(json);
			this.$store.commit('steemconnect/login', userSC);
			//this.$store.commit('steemconnect/setAccessToken',)
			//this.$steemconnect.login(this.$store.state, json.userdata);
			//console.log(this.$store.state.stdLoginUser);
			//await
			this.postLoginRedirect();
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
		const account = this.$refs["username"].value.trim().toLowerCase();

		// The challenge is the SERVER's message now, not a locally invented one. Previously
		// HiveAuth proved possession to the browser, which then declared itself logged in
		// while the server was never involved - so the session was decorative and every
		// authenticated call failed.
		// requestLoginChallenge reports its own failure, and more precisely.
		const challenge = await this.requestLoginChallenge(account);
		if (!challenge) { return; }

		const APP_META = { name:"actifit", description: process.env.socialSharingTitle, icon:"https://actifit.io/img/actifit_logo.png" };
		const auth = { username: account, expire: undefined, key: undefined };
		const challenge_data = { key_type: "posting", challenge: challenge.message };
		const mainRef = this;

		this.$HAS.authenticate(auth, APP_META, challenge_data, (message) => {
			if (message.cmd && message.cmd === 'auth_wait'){
				this.hiveauth_wait = true;
				this.$nextTick(() => {
					const authPayload = { uuid: message.uuid, account: account, key: message.key, host: 'wss://hive-auth.arcange.eu' };
					this.hiveauth_key = message.key;
					const authUri = `has://auth_req/${btoa(JSON.stringify(authPayload))}`;
					const qrLinkElement = mainRef.$refs['hiveauth-qr-link'];
					const qrElement = mainRef.$refs['hiveauth-qr'];
					const QR = new QRious({ element: qrElement, background: 'white', backgroundAlpha: 0.8, foreground: 'black', size: 200 });
					QR.value = authUri; qrLinkElement.href = authUri;
				});
			}
		}).then(async (message) => {
			if (message.cmd && message.cmd === 'auth_ack'){
				const { data } = message;
				const { expire, token } = data;
				this.hiveauth_wait = false;
				this.hiveauth_expire = expire;
				this.hiveauth_token = token;

				// data.challenge is an OBJECT {challenge: <sig hex>, pubkey}. Verify locally to
				// fail fast on a malformed reply; the verdict that matters is the server's,
				// which checks the signature against on-chain posting authority.
				if (!this.verifyHiveauth(challenge_data.challenge, data.challenge)) {
					this.failLogin(this.$t('login_error'));
					return;
				}

				try {
					const json = await this.submitLoginVerify(account, challenge.nonce, data.challenge.challenge, 'hiveauth');
					this.login_in_progress = false;
					if (json) { this.setHiveauthLoginStatus(json); }
				} catch (e) {
					console.error('HiveAuth verify error:', e);
					this.failLogin(this.$t('login_error'));
				}
			}else if (message.cmd && message.cmd === 'auth_nack'){
				this.failLogin(this.$t('auth_rejected_by_user'));
				return;
			}
		})
		.catch(err => {
			console.error(err)
			this.hiveauth_wait = false;
			this.failLogin(this.$t('login_error'));
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
		this.$store.commit('setBchain', this.bchain_val);
		localStorage.setItem('cur_bchain', this.bchain_val)
		const account_name = this.$refs["username"].value.trim().toLowerCase();
		this.login_in_progress = true;

		// requestSignBuffer, not requestVerifyKey: the proof is now a SIGNATURE over the
		// server's single-use nonce. The key stays inside the extension.
		const json = await this.signedChallengeLogin(account_name, 'keychain', (message) =>
			new Promise((resolve) => {
				window.hive_keychain.requestSignBuffer(account_name, message, 'Posting', (response) => {
					resolve(response && response.success === true ? response.result : null);
				});
			})
		);
		if (json) { this.setKeychainLoginStatus(json); }
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

		// Same rule as LoginModal: a rejected token blocks, an UNAVAILABLE verifier does
		// not. A 5xx (including the proxy's 503 on timeout) is not a verdict. And .json() is
		// guarded: on a Cloudflare HTML error page it throws, which used to leave this
		// button dead with no message.
		try {
			const outc = await fetch('/api/proxy/verifyLoginCaptcha?token='+encodeURIComponent(token));
			if (outc.status >= 500) {
				console.warn('captcha verification unavailable, continuing without it:', outc.status);
			} else {
				const captchaJson = await outc.json();
				if (!outc.ok || captchaJson.error){
					this.error_proceeding = true;
					this.login_in_progress = false;
					this.error_msg = this.$t('login_error');
					return;
				}
			}
		} catch (e) {
			console.warn('captcha verification unreachable, continuing without it:', e && e.message);
		}
		//otherwise, we're good, continue

		console.log(token);

		//set proper blockchain selected
		this.$store.commit('setBchain', this.bchain_val);

		localStorage.setItem('cur_bchain', this.bchain_val)

		this.login_in_progress = true;
		const account_name = this.$refs["username"].value.trim().toLowerCase();
		const priv_pkey = this.$refs["ppkey"].value;
		try {
			// The typed key is used HERE and never transmitted. signBufferSha256 coerces
			// the WIF itself and asserts on an invalid one, so a bad key throws rather than
			// producing a junk signature the server rejects with an unhelpful message.
			// Refuse an active/owner key before anything else touches it.
			if (!await this.assertPostingOnlyKey(account_name, priv_pkey)) { return; }
			const json = await this.signedChallengeLogin(account_name, 'posting', (message) =>
				Signature.signBufferSha256(hash.sha256(message), priv_pkey).toHex()
			);
			if (json) { this.setUserLoginStatus(json, priv_pkey); }
		} catch (e) {
			console.error('Login error:', e);
			this.error_proceeding = true;
			this.login_in_progress = false;
			this.error_msg = this.$t('login_error');
		}

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
