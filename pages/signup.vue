<template>
  <div>
	<script src="https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit" async defer>
</script> 
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
	
	<section class="intro bg-light" id="content">
		<div class="container pt-5 mt-5 pb-5">

	  
			<h1 class="pt-5 mb-3 text-capitalize text-center headline"><span class="text-brand">{{ $t('signup.headline') }}</span></h1>
			<div class="lead mb-2 " v-html="signupProcessDetails()">
			</div>
			
			<div class="row lead mb-4 p-3 w-100" v-html="''"><!-- signup.buy_text -->
				
			</div>
			<div class="form-group">
			  <label for="account-username">{{ $t('Pick_Username') }}</label>
			  <input class="form-control form-control-lg mb-2" ref="account-username" id="account-username" @input="handleUsername($event.target.value)"/>
			  <p class="text-brand" v-if="username_invalid">
				<b>{{ username_invalid }}</b>
			  </p>
			  <p class="text-brand" v-if="username_exists">
				<b>{{ username_exists }}</b>
			  </p>
			  <label for="account-password">{{ $t('Your_Password') }}</label><br/>
			  <input class="form-control form-control-lg" id="account-password" ref="account-password"/>
			  <p class="text-brand"><i>{{ $t('lost_password_precaution') }}</i></p>
			  <button v-on:click="copyContent" data-targetEl="account-password" class="btn btn-brand btn-lg w-20">{{ $t('Copy_Password') }}</button><br/><br/>
			  
			  <label for="account-password-confirm">{{ $t('confirm_password_copy') }}</label><br/>
			  <input class="form-control form-control-lg" id="account-password-confirm" ref="account-password-confirm"/>
			  
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
						<option value="STEEM">{{ $t('STEEM') }}</option>
						<!--<option value="SBD">{{ $t('SBD') }}</option>-->
						<option value="HIVE">{{ $t('HIVE') }}</option>
						<!--<option value="STEEM">{{ $t('HBD') }}</option>-->
					</select>
				</span>
			    <button v-on:click="copyContent" data-targetEl="invested-amount" class="btn btn-brand btn-lg w-20">{{ $t('copy_amount') }}</button><br/><br/>
			    <p class="lead mb-4">
			    {{ $t('notice_send_amount').replace('_CUR_', this.transferType) }}
			    </p>
			  
			    <label for="actifit-address">{{ $t('Address') }}</label><br/>
			    <input class="form-control form-control-lg w-80" id="actifit-address" ref="actifit-address" readonly :value="getTargetAccount()"/>
				<button v-on:click="copyContent" data-targetEl="actifit-address" class="btn btn-brand btn-lg w-20">{{ $t('Copy_Address') }}</button><br/><br/>
				<label for="actifit-memo">{{ $t('Memo') }}</label><br/>
				<input class="form-control form-control-lg w-80" id="actifit-memo" ref="actifit-memo" readonly />	
				<button v-on:click="copyContent" data-targetEl="actifit-memo" class="btn btn-brand btn-lg w-20 mb-2">{{ $t('Copy_Memo') }}</button>	
			  </div>	
				<vue-recaptcha ref="recaptcha" @verify="onVerifyCaptcha" @expired="onExpiredCaptcha" sitekey="6LdpcoMUAAAAAPGTqlvhKEK6Ayw5NqLDZz5Sjudq">
				</vue-recaptcha>
				<p class="text-brand" v-if="captcha_invalid">
				  <b>{{ captcha_invalid }}</b>
				</p>
				<p class="lead mb-4 pb-1" v-html="$t('send_process_verf')" v-if="!promo_code_chkbx"></p>
				<p class="lead mb-4 pb-1" v-html="$t('send_process_promo_verf')" v-else></p>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="text-center pb-2">
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
							<div>{{ $t('posting_key_notice') }}<br/> <b>{{this.privatePostKey}}</b><br/>{{ $t('copy_safe_location') }} <br/><br/>{{ $t('delegation_received') }}</div>
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
  import UserMenu from '~/components/UserMenu'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'
  import steem from 'steem'
  import VueRecaptcha from 'vue-recaptcha';

  import { mapGetters } from 'vuex'

  export default {
	head () {
		return {
		  title: `Signup Page - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Signup for an account at actifit.io` },
			{ hid: 'ogdescription', name: 'og:description', content: `Signup for an account at actifit.io` }
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
		targetMemo: '',
		checkingFunds: false,
		processStarted: false,
		resultReturned: false,
		accountCreated: false,
		steemPrice: 0.1,
		sbdPrice: 0.1,
		hivePrice: 0.1,
		hbdPrice: 0.1,
		transferType: 'STEEM',//default option
		minUSD: process.env.minSignupUSDCost,
		afitPrice: 0.5,
		userInputSTEEMAmount: 0,
		userInputUSDAmount: this.minUSD,
		username_exists: '',
		username_invalid: '',
		captchaValid: false,
		captcha_invalid: '',
		targetAccount: 'actifit.signup',
		delegatedSteem: 10,
		privatePostKey: '',
		error_proceeding: '',
		error_msg: '',
		email: '',
		promo_code_chkbx: false,
		promo_code_val: '',
		reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
	  }
	},
    computed: {
    },
    async mounted () {
	  

	  //if a promo code is available, let's set it accordingly
	  if (this.$route.query.promo){
		this.promo_code_chkbx = true;
		this.promo_code_val = this.$route.query.promo;
	  }

	  
	  //grab STEEM price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab SBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollar&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollar'].usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
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
	  
    },
	methods: {
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
	  setSteemPrice (_steemPrice){
		this.steemPrice = parseFloat(_steemPrice).toFixed(3);
	  },
	  setSBDPrice (_sbdPrice){
		this.sbdPrice = parseFloat(_sbdPrice).toFixed(3);
	  },
	  setHivePrice (_hivePrice){
		this.hivePrice = parseFloat(_hivePrice).toFixed(3);
	  },
	  setHBDPrice (_hbdPrice){
		this.hbdPrice = parseFloat(_hbdPrice).toFixed(3);
	  },
	  minSteemAmount () {
		//take into consideration potential charges, and remove 0.1 STEEM for potential transfer loss
		return parseFloat(this.minUSD / this.steemPrice - 0.1).toFixed(3);
	  },
	  setAFITPrice (_afitPrice){
		this.afitPrice = parseFloat(_afitPrice).toFixed(3);
	  },
	  afitTokensToEarn (usdInvest) {
		if (typeof usdInvest == 'undefined' || usdInvest== null || usdInvest=='' || usdInvest==0){
			usdInvest = this.minUSD
		}
		return parseFloat(usdInvest / this.afitPrice).toFixed(3);
	  },
	  setPasswordVal(){
		this.$refs["account-password"].value = this.generatePassword(4);
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
		return parseFloat(this.userInputUSDAmount / this.afitPrice).toFixed(3);
	  },
	  getMatchingAmount () {
		console.log(this.transferType);
		if (this.transferType == 'STEEM'){
			return parseFloat(this.userInputUSDAmount / this.steemPrice).toFixed(3);
		}else if (this.transferType == 'HIVE'){
			return parseFloat(this.userInputUSDAmount / this.hivePrice).toFixed(3);
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
		if (!this.captchaValid){
			this.captcha_invalid = this.$t('solve_captcha');
			return;
		}
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
		//to prevent tampering with STEEM and AFIT values
		const steem_invest = this.getMatchingAmount ();
		const afit_reward = this.getMatchingAFIT ();
		this.checkingFunds = true;
		this.processStarted = true;
		let url = new URL(process.env.actiAppUrl + 'confirmPayment');
		//compile all needed data and send it along the request for processing
		let params = {
			confirm_payment_token: process.env.confirmPaymentToken, 
			new_account: this.$refs["account-username"].value,
			new_pass: this.$refs["account-password"].value,
			usd_invest: invested_usd,
			steem_invest: steem_invest,
			sent_cur: this.transferType,
			afit_reward: afit_reward,
			memo: this.targetMemo,
			referrer: this.$route.query.referrer,
			email: this.$refs["account-email"].value,
			promo_code: this.promo_code_val,
			//cur_bchain: 'STEEM',
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			this.checkingFunds = false;
			this.accountCreated = outcome.accountCreated;
			this.resultReturned = true;
			let privateKeys = await steem.auth.getPrivateKeys(this.$refs["account-username"].value, this.$refs["account-password"].value, ['posting']);
			this.privatePostKey = privateKeys.posting;
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
</style>
