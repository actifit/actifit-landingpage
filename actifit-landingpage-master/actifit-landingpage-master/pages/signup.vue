<template>
  <div>
	<!--<script src="https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit" async defer></script> -->
    <NavbarBrand />
	
	<section class="intro bg-light" id="content">
		<div class="container pt-5 mt-5 pb-5">

	  
			<h1 class="pt-5 mb-3 text-capitalize text-center headline"><span class="text-brand">{{ $t('signup.headline') }}</span></h1>
			<div class="lead mb-2 " v-html="signupProcessDetails()">
			</div>
			
			<div class="row lead mb-4 p-3 w-100" v-html="''"><!-- signup.buy_text -->
				
			</div>
			<div class="form-group">
			  <label for="account-username">{{ $t('Pick_Username') }}</label>
			  <input class="form-control form-control-lg mb-2" ref="account-username" id="account-username" @input="handleUsername($event.target.value.toLowerCase())"/>
			  <p class="text-brand" v-if="username_invalid">
				<b>{{ username_invalid }}</b>
			  </p>
			  <p class="text-brand" v-if="username_exists">
				<b>{{ username_exists }}</b>
			  </p>
			  <div class="target-bchain">
				<label for="blockchain">{{ $t('target_bchain') }}</label>
				<p class="text-brand"><i>{{$t('leave_default_recommend')}}</i></p>
				<div class="pl-2 mb-2">
					<input type="checkbox" id="hive-account" v-model="hive_account" v-on:change="validateUserName">
					<label for="checkbox" class="font-weight-normal">{{ $t('hive_account_text') }}</label>
				</div>
				<div class="pl-2 mb-2" style="display:none">
					<input type="checkbox" id="steem-account" v-model="steem_account" v-on:change="validateUserName">
					<label for="checkbox" class="font-weight-normal">{{ $t('steem_account_text') }}</label>
				</div>
				<div class="pl-2 mb-2" v-if="blurt_active">
					<input type="checkbox" id="blurt-account" v-model="blurt_account" v-on:change="validateUserName">
					<label for="checkbox" class="font-weight-normal">{{ $t('blurt_account_text') }}</label>
				</div>
			  </div>
			  <label for="account-password">{{ $t('Your_Password') }}</label><br/>
			  <!-- we used change event, while we could have used input event, but that slows user experience slightly -->
			  <input class="form-control form-control-lg" id="account-password" ref="account-password" v-on:change="genPrivKey"/>
			  <div class="text-brand"><i>{{ $t('lost_password_precaution') }}</i></div>
			  <button v-on:click="setPasswordVal" class="btn btn-brand btn-lg w-20">{{ $t('Regenerate') }}</button>
			  
			  <button v-on:click="copyContent" data-targetEl="account-password" class="btn btn-brand btn-lg w-20 m-2">{{ $t('Copy_Password') }}</button><br/><br/>
			  
			  <label for="account-password-confirm">{{ $t('confirm_password_copy') }}</label><br/>
			  <input class="form-control form-control-lg" id="account-password-confirm" ref="account-password-confirm"/>
			  
			  <label for="account-password">{{ $t('your_posting_key') }}</label><br/>
			  <input class="form-control form-control-lg" id="posting-key" readonly ref="posting-key" :value="privatePostKey"/>
			  <p class="text-brand"><i>{{ $t('posting_key_precaution') }}</i></p>
			  <button v-on:click="copyContent" data-targetEl="posting-key" class="btn btn-brand btn-lg w-20">{{ $t('Copy_Posting_Key') }}</button><br/><br/>
			  
			  <label for="account-email">{{ $t('email_optional') }}</label><br/>
			  <input class="form-control form-control-lg mb-2" id="account-email" ref="account-email" v-model="email"/>	
			  
			  <div class="mb-2">
			    <input type="checkbox" id="promo-code-chkbx" v-model="promo_code_chkbx" >
			    <label for="checkbox" class="p-2">{{ $t('promo_code') }}</label>
			  </div>
			  <div v-if="promo_code_chkbx">
			    <label for="promo-code-val">{{ $t('promo_code') }}</label>
			    <input type="text" class="form-control form-control-lg mb-2" id="promo-code-val" ref="promo-code-val" v-model="promo_code_val"/>
			  </div>
			  <div v-else>
			    <label for="invested-usd" v-html="dispAmountInvest()"></label><br/>
			    <input type="number" class="form-control form-control-lg mb-2" id="invested-usd" ref="invested-usd" v-model="userInputUSDAmount"/>
			    <label for="matching-afit">{{ $t('matching_rew_afit') }}</label><br/>
			    <input type="number" class="form-control form-control-lg mb-2" id="matching-afit" ref="matching-afit" readonly :value="getMatchingAFIT()"/>
				<label for="invested-amount">{{ $t('choose_cryto') }}</label><br/>
				<span class="row m-0">
					<input type="number" class="form-control form-control-lg w-50" id="invested-amount" ref="invested-amount" readonly :value="getMatchingAmount()" />
					<select @change="adjustCurrency" id="invested-crypto" name="invested-crypto" ref="invested-crypto" text="$t('choose_cryto')" class="form-control form-control-lg w-50">
						
						<!--<option value="SBD">{{ $t('SBD') }}</option>-->
						<option value="HIVE">{{ $t('HIVE') }}</option>
						<!--<option value="STEEM">{{ $t('STEEM') }}</option>-->
						<option value="HBD">{{ $t('HBD') }}</option>
					</select>
				</span>
			    <button v-on:click="copyContent" data-targetEl="invested-amount" class="btn btn-brand btn-lg w-20 mt-2">{{ $t('copy_amount') }}</button><br/><br/>
			    <p class="lead mb-4">
			    {{ $t('notice_send_amount').replace('_CUR_', this.transferType) }}
			    </p>
			  
			    <label for="actifit-address">{{ $t('Address') }}</label><br/>
			    <input class="form-control form-control-lg w-80" id="actifit-address" ref="actifit-address" readonly :value="getTargetAccount()"/>
				<button v-on:click="copyContent" data-targetEl="actifit-address" class="btn btn-brand btn-lg w-20 mt-2">{{ $t('Copy_Address') }}</button><br/><br/>
				<label for="actifit-memo">{{ $t('Memo') }}</label><br/>
				<input class="form-control form-control-lg w-80" id="actifit-memo" ref="actifit-memo" readonly />	
				<button v-on:click="setMemoValue" class="btn btn-brand btn-lg w-20 ">{{ $t('Regenerate') }}</button>
				<button v-on:click="copyContent" data-targetEl="actifit-memo" class="btn btn-brand btn-lg w-20 m-2">{{ $t('Copy_Memo') }}</button>	
			  </div>	
				<p class="text-brand" v-if="captcha_invalid">
				  <b>{{ captcha_invalid }}</b>
				</p>
				<p class="lead mb-4 pb-1" v-html="$t('send_process_verf')" v-if="!promo_code_chkbx"></p>
				<p class="lead mb-4 pb-1" v-html="$t('send_process_promo_verf')" v-else></p>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="text-center pb-2" id="create_action_container">
					<button v-on:click="checkFunds" class="btn btn-brand btn-lg w-20" v-if="!promo_code_chkbx">{{ $t('Steem_sent').replace('_CUR_', this.transferType) }}</button>
					<button v-on:click="checkFunds" class="btn btn-brand btn-lg w-20" v-else>{{ $t('create_account') }}</button>
				</div>
				<div v-if="processStarted" class="text-center text-brand">
					<div id="checking_funds">
						<i class="fas fa-spin fa-spinner" v-if="checkingFunds"></i><i class="fas fa-check" v-if="!promo_code_chkbx && !checkingFunds"></i><span v-if="!promo_code_chkbx"> {{ $t('Check_Steem_Transfer') }}</span>
					</div>
					<div id="account_creation" v-if="resultReturned">
						<div v-if="accountCreated">
							<i class="fas fa-check"></i><span> {{ $t('account_created_success') }} <br/><br/> {{ $t('post_account_creation_notice') }}</span>
							<div>{{ $t('posting_key_notice') }}<br/> <b>{{this.privatePostKey}}</b><br/>{{ $t('copy_safe_location') }} <br/>{{ $t('delegation_received') }}<br/><br/></div>
							
							
							<button class="btn btn-brand btn-lg w-20" @click="generateAndDownloadFile">{{$t('signup.download_keys_backup')}}</button>
							
							<div v-html="$t('signup.signup_completion')"></div>
							
							
						</div>
						<div v-else v-html="$t('error_account_creation')">
							
						</div>
					</div>
					
				</div>
			  
			</div>
      
		</div>
	  
    </section>
	
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import blurt from '@blurtfoundation/blurtjs'
  
  //import VueRecaptcha from 'vue-recaptcha';
  import { VueReCaptcha } from 'vue-recaptcha-v3'

  import { mapGetters } from 'vuex'
  
  import Vue from 'vue'
  Vue.use(VueReCaptcha, { siteKey: process.env.captchaV3Key })

  export default {
	head () {
		return {
		  title: `Signup Page - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Signup for an account at actifit.io` },
			{ hid: 'ogdescription', name: 'og:description', content: `Signup for an account at actifit.io` }
		  ],
		  link: [
				{ rel: 'canonical', href: `https://actifit.io/signup`}
		  ]
		}
	},
    components: {
      NavbarBrand,
      Footer,
	  //VueRecaptcha,
    },
	data () {
      return {
		targetMemo: '',
		checkingFunds: false,
		processStarted: false,
		resultReturned: false,
		accountCreated: false,
		//steemPrice: 0.1,
		//sbdPrice: 0.1,
		hivePrice: 0.1,
		hbdPrice: 1,
		transferType: 'HIVE',//default option
		minUSD: process.env.minSignupUSDCost,
		afitPrice: 0.5,
		maxAfitRewardPerLot: 100,
		lotSizeUsd: 5,
		userInputSTEEMAmount: 0,
		userInputUSDAmount: this.minUSD,
		username_exists: '',
		username_invalid: '',
		captchaValid: false,
		captcha_invalid: '',
		targetAccount: 'actifit.signup',
		delegatedSteem: 10,
		privatePostKey: '',
		privateActiveKey: '',
		privateOwnerKey: '',
		privateMemoKey: '',
		error_proceeding: '',
		error_msg: '',
		email: '',
		promo_code_chkbx: false,
		promo_code_val: '',
		hive_account: true,
		steem_account: false,
		blurt_account: true,
		blurt_active: true,
		reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
	  }
	},
    computed: {
    },
    async mounted () {
	  
	  
	  //rely on HIVE node
	  let properNode = process.env.hiveApiNode;
	  
			  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  
	  hive.api.setOptions({ url: properNode });
	  
	  steem.api.setOptions({ url: process.env.steemApiNode });
	  
	  blurt.api.setOptions({ url: process.env.blurtApiNode });
	  
	  //check if we need to show blurt signup option
	  if (this.$route.query.chain && this.$route.query.chain == 'hive'){
		this.blurt_active = false;
		this.blurt_account = false;
	  }

	  //if a promo code is available, let's set it accordingly
	  if (this.$route.query.promo){
		this.promo_code_chkbx = true;
		this.promo_code_val = this.$route.query.promo;
	  }

	  
	  //grab STEEM price
	  /*fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab SBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollar&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollar'].usd)).catch(e => reject(e))
	  }).catch(e => reject(e))*/
	  
	  //grab HIVE price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd').then(
		res => {res.json().then(json => this.setHivePrice (json.hive.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab HBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd').then(
		res => {res.json().then(json => this.setHBDPrice (json.hive_dollar.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
		
	  //grab AFIT price
	  
	  fetch(process.env.actiAppUrl+'curAFITPrice').then(
		res => {res.json().then(json => this.setAFITPrice (json.unit_price_usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	
		
	  //setup default STEEM amount
	  this.userInputUSDAmount = this.minUSD;
	  
	  this.setPasswordVal();
	  this.setMemoValue();
	  
	  // login
      await this.$store.dispatch('steemconnect/login')
      this.$store.dispatch('fetchUserTokens')
      this.$store.dispatch('fetchTransactions')
	  this.$store.dispatch('fetchUserRank')
	  this.$store.dispatch('fetchReferrals')
	  
	  await this.$recaptchaLoaded()
	  
    },
	methods: {
	  generateAndDownloadFile(){
		let content = 'Please keep this file secure and confidential, as it holds information about your private account.';
		content += '\nUsername:'+this.$refs['account-username'].value;
		content += '\n# '+this.$t('Posting_key_desc');
		content += '\nPrivate Posting Key:'+this.privatePostKey;
		content += '\n# '+this.$t('Active_key_desc');
		content += '\nPrivate Active Key:'+this.privateActiveKey;
		content += '\n# '+this.$t('Owner_key_desc');
		content += '\nPrivate Owner Key:'+this.privateOwnerKey;
		content += '\n# '+this.$t('Memo_key_desc');
		content += '\nPrivate Memo Key:'+this.privateMemoKey;
		content += '\n# Below is the main password for the account';
		content += '\nMaster Password:'+this.$refs["account-password"].value;
		
		const blob = new Blob([content], { type: "text/plain" });
		
		// Create a URL for the Blob
		const blobUrl = URL.createObjectURL(blob);

		  // Create a link element for downloading
		const link = document.createElement("a");
		link.href = blobUrl;
		link.download = "actifitkeys.txt";

		  // Append the link to the DOM
		document.body.appendChild(link);

		  // Click the link to trigger download
		link.click();

		  // Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(blobUrl);
	  },
	  adjustCurrency(e){
		if(e.target.options.selectedIndex > -1) {
		  this.transferType = e.target.options[e.target.options.selectedIndex].value;
		  //also adjust payment amount
		  
		}
	  },
	  dispAmountInvest(){
		return this.$t('usd_amount_invest') + ' ' + this.$t('min_amount').replace('_AMNT_', this.minUSD)
	  },
	  signupProcessDetails(){
		return '';/*this.$t('signup.desc_part1')
			+ this.$t('signup.desc_part2') + this.afitTokensToEarn() 
			+ this.$t('signup.desc_part3') + this.delegatedSteem
			+ this.$t('signup.desc_part3_5') + this.delegatedSteem
			+ this.$t('signup.desc_part4') + this.minUSD
			+ this.$t('signup.desc_part5') + this.afitTokensToEarn('100')
			+ this.$t('signup.desc_part6');*/
	  },
	  validateUserName(){
		this.handleUsername (this.$refs['account-username'].value);
	  },
	  async checkUserNameAv(testChain, val){
		let usernameValid = testChain.utils.validateAccountName(val);
		//check for error msg
		if (usernameValid == null){
			//ensure no existing account matches same name
			let result = await testChain.api.getAccountsAsync([val]);
			console.log(testChain.name);
			  if (result.length>0){
				if (testChain.name == 'Hive'){
					this.username_exists += 'Username is not available. Please choose a different one.\n';
				}else{
					this.username_exists += 'Username is not available on '+testChain.name+'. Please choose a different one, or deselect '+testChain.name+' chain option.';
				}
				return false;
			  }
			  return true;
			//});
		}else{
			this.username_invalid = usernameValid;
			return false;
		}
	  },
	  async handleUsername (val) {
		this.username_invalid = '';
		this.username_exists = '';
		
		//to avoid disruptions on other chains while creating the username, test against all selected chains
		
		//validate format first
		let chnLnk = hive;
		let usAv = true;
		if (this.hive_account){
			//test against default, hive
			chnLnk.name = 'Hive';
			usAv = await this.checkUserNameAv(chnLnk, val);
		}
		
		if (usAv && this.steem_account){
			chnLnk = steem;
			chnLnk.name = 'Steem';
			usAv = await this.checkUserNameAv(chnLnk, val);
		}
		if (usAv && this.blurt_account){
			chnLnk = blurt;
			chnLnk.name = 'Blurt';
			usAv = await this.checkUserNameAv(chnLnk, val);
		}
		this.genPrivKey();
		
	  },
	  /*setSteemPrice (_steemPrice){
		this.steemPrice = parseFloat(_steemPrice).toFixed(3);
	  },
	  setSBDPrice (_sbdPrice){
		this.sbdPrice = parseFloat(_sbdPrice).toFixed(3);
	  },*/
	  setHivePrice (_hivePrice){
		this.hivePrice = parseFloat(_hivePrice).toFixed(3);
	  },
	  setHBDPrice (_hbdPrice){
		this.hbdPrice = parseFloat(_hbdPrice).toFixed(3);
	  },
	  /*minSteemAmount () {
		//take into consideration potential charges, and remove 0.1 STEEM for potential transfer loss
		return parseFloat(this.minUSD / this.steemPrice - 0.1).toFixed(3);
	  },*/
	  setAFITPrice (_afitPrice){
		this.afitPrice = parseFloat(_afitPrice).toFixed(6);
	  },
	  afitTokensToEarn (usdInvest) {
		if (typeof usdInvest == 'undefined' || usdInvest== null || usdInvest=='' || usdInvest==0){
			usdInvest = this.minUSD
		}
		return parseFloat(usdInvest / this.afitPrice).toFixed(6);
	  },
	  async genPrivKey(){
		//generate posting key
		let privateKeys = await hive.auth.getPrivateKeys(this.$refs["account-username"].value.toLowerCase(), this.$refs["account-password"].value);//, ['posting']);
		this.privatePostKey = privateKeys.posting;
		this.privateActiveKey = privateKeys.active;
		this.privateOwnerKey = privateKeys.owner;
		this.privateMemoKey = privateKeys.memo;
	  },
	  async setPasswordVal(){
		this.$refs["account-password"].value = this.generatePassword(4);
		this.genPrivKey();
		//this.$refs["posting-key"].value = 
	  },
	  generatePassword (multip) {
		//generate random 11 characters password
		let passString = '';
		for (let i=0;i<multip;i++){
			passString += Math.random().toString(36).substr(2, 13);
		}
		return passString;
	  },
	  getTargetAccount () {
		return this.targetAccount;
	  },
	  getMatchingAFIT () {		
		let matchingAfitAmnt = parseFloat(this.userInputUSDAmount / this.afitPrice);
		//make sure we only reward max amount per lot
		let lotCount = Math.floor(this.userInputUSDAmount / this.lotSizeUsd);
		if (lotCount < 1){
			lotCount += 1;
		}
		//max amount per lot
		let maxAfitPerTotLots = this.maxAfitRewardPerLot * lotCount
		if (matchingAfitAmnt > maxAfitPerTotLots){
			matchingAfitAmnt = maxAfitPerTotLots;
		}
		return Math.floor(matchingAfitAmnt);
	  },
	  getMatchingAmount () {
		console.log(this.transferType);
		/*if (this.transferType == 'STEEM'){
			return parseFloat(this.userInputUSDAmount / this.steemPrice).toFixed(3);
		}else*/ 
		if (this.transferType == 'HIVE'){
			return parseFloat(this.userInputUSDAmount / this.hivePrice).toFixed(3);
		}else if (this.transferType == 'HBD'){
			return parseFloat(this.userInputUSDAmount / this.hbdPrice).toFixed(3);
		}
	  },
	  setMemoValue () {
		this.$refs["actifit-memo"].value = this.generateMemo();
	  },
	  generateMemo () {
		this.targetMemo = "acmm"+this.generatePassword(2);
		return this.targetMemo;
	  },
	  copyContent (event) {
		  var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
		  copyText.select();
		  document.execCommand("copy");
		  return;
	  },
	  onVerifyCaptcha (response) {
		this.captchaValid = true;
	  },
	  onExpiredCaptcha () {
		this.captchaValid = false;
	  },
	  async checkFunds () {
		this.captcha_invalid = '';
		this.error_proceeding = false;
		this.error_msg = '';
		
		let invested_usd = 0;
		if (!this.promo_code_chkbx){
		  invested_usd = this.$refs["invested-usd"].value;
		}
		/*if (!this.captchaValid){
			this.captcha_invalid = this.$t('solve_captcha');
			return;
		}*/
		if (this.username_exists || this.username_invalid || this.$refs["account-username"].value==''){
			this.error_proceeding = true;
			this.error_msg = this.$t('choose_proper_username');
			return;
		}
		if (!this.promo_code_chkbx && parseFloat(this.$refs["invested-usd"].value)<parseFloat(this.minUSD)){
			this.error_proceeding = true;
			this.error_msg = this.$t('amount_too_low')+this.minUSD;
			return;
		}
		if (this.isEmailValid()!=''){
			this.error_proceeding = true;
			this.error_msg = this.$t('invalid_email_format');
			return;
		}
		//make sure user copied and pasted password
		if (this.$refs["account-password-confirm"].value != this.$refs["account-password"].value){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('copy_password_confirm');
		  return;
		}
		
		if (!this.hive_account && !this.blurt_account){
			this.error_proceeding = true;
			this.error_msg = this.$t('need_hive_account');
			return;
		}
		
		//verify captcha 
		//check captcha V3
		// Execute reCAPTCHA with action "login".
		
		const token = await this.$recaptcha('signup')
		
		//verify recaptcha-v3
		
		let outc = await fetch(process.env.actiAppUrl+'verifyLoginCaptcha?token='+token);
		console.log(outc);
		//let outc = await outc.json();
		
		if (outc.error){
			this.error_proceeding = true;
			this.error_msg = this.$t('captcha_invalid');
			return;
		}
		
		//to prevent tampering with STEEM and AFIT values
		const steem_invest = this.getMatchingAmount ();
		const afit_reward = this.getMatchingAFIT ();
		this.checkingFunds = true;
		this.processStarted = true;
		let url = new URL(process.env.actiAppUrl + 'confirmPayment');
		//compile all needed data and send it along the request for processing
		let params = {
			confirm_payment_token: process.env.confirmPaymentToken, 
			new_account: this.$refs["account-username"].value.toLowerCase(),
			new_pass: this.$refs["account-password"].value,
			usd_invest: invested_usd,
			steem_invest: steem_invest,
			sent_cur: this.transferType,
			afit_reward: afit_reward,
			memo: this.targetMemo,
			referrer: this.$route.query.referrer,
			email: this.$refs["account-email"].value,
			promo_code: this.promo_code_val,
			//cur_bchain: 'HIVE',
		}
		params['cur_bchain'] = '';
		if (this.hive_account){
			params['cur_bchain'] += 'HIVE|';
		}
		if (this.steem_account){
			params['cur_bchain'] += 'STEEM|';
		}
		if (this.blurt_account){
			params['cur_bchain'] += 'BLURT';
		}
		
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		console.log(url);
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			this.checkingFunds = false;
			this.accountCreated = outcome.accountCreated;
			this.resultReturned = true;
			
			let privateKeys = await hive.auth.getPrivateKeys(this.$refs["account-username"].value.toLowerCase(), this.$refs["account-password"].value);//, ['posting']);
			this.privatePostKey = privateKeys.posting;
			this.privateActiveKey = privateKeys.active;
			this.privateOwnerKey = privateKeys.owner;
			this.privateMemoKey = privateKeys.memo;
		}catch(err){
			console.error(err);
			this.checkingFunds = false;
		}
	  },
	  isEmailValid: function() {
		return (this.email == "")? "" : (this.reg.test(this.email)) ? '' : 'has-error';
	  }
	},
  }
</script>

<style>
.afit-tokens-earned, label{
	font-weight: bold;
}
.acti-hover, .acti-hover:hover{
	color: white;
}
#account-username{
	text-transform: lowercase;
}
#account_creation{
	word-wrap: break-word;
}
@media only screen and (max-width: 500px) {
	#account_creation img{
		max-width: 150px;
	}
}
</style>
