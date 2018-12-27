<template>
  <div>
	<script src="https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit" async defer>
</script> 
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav mr-auto">
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

	  
			<h1 class="pt-5 mb-3 text-capitalize text-center headline"><span class="text-brand">Create your Actifit / Steem account</span></h1>
			<p class="lead mb-2 ">
			  In order to use Actifit, you need an account on the Steem blockchain. If you do not have an account, you can sign up for one right now!<br/>
			  While you can create a Steem account from <a href="https://signup.steemit.com/?ref=actifit">Steemit.com</a> for free, it could take up to two weeks, or more to get approved.<br/>
			  Other services allow the creation of Steem accounts at a cost, yet here at Actifit, <span class="afit-tokens-earned text-brand">for as low as {{ this.minUSD }}$</span>, you get the following awesome treats:
			  <ul>
				<li>Your <span class="afit-tokens-earned text-brand">free Steem / Actifit account</span>, usable across the Steem blockchain and all cool relevant dapps such as Dtube, Steem monsters, Steem hunt, dlike, tasteem, and many more...</li>
				<li><span class="afit-tokens-earned text-brand"> {{ afitTokensToEarn() }} </span> AFIT tokens matching your current investment. The higher you invest, the higher the amount earned.</li>
				<li>The Steem blockchain requires a min amount of Steem Power (which decides how often you can do transactions on it). To help with that, <span class="afit-tokens-earned text-brand">we will delegate to your new account {{ this.delegatedSteem }} Steem Power for a month to help you post easily once per day!</span></li>
				<li>Via posting your daily activity, you can earn STEEM upvotes and AFIT tokens, a free source of earning crypto while getting healthy and fit!</li>
				<li>Owning AFIT tokens allows you to earn more rewards for your daily activity, as it <span class="afit-tokens-earned text-brand">increases your User Rank</span>. At the minimum 10$ investment, your User Rank will stand at 3%. For instance, <span class="afit-tokens-earned text-brand">investing 70$ will earn you {{ afitTokensToEarn('70') }} AFIT tokens</span>, and will increase your User Rank to 6%, reflecting in an <span class="afit-tokens-earned text-brand">increase in your daily STEEM and AFIT rewards.</span></li>
			   </ul>
			</p>
			
			<div class="row lead mb-4 p-3 w-100">
				<div class="w-100 p-2">You can buy & send STEEM using any of the following exchanges</div>
				<div class="w-30 p-3"><a href="https://bittrex.com/" >Bittrex</a></div>
				<div class="w-70 p-3"><a href="https://www.binance.com/" >Binance</a></div>
				<div class="w-30 p-3"><a href="https://poloniex.com/" >Poloniex</a></div>
				<div class="w-70 p-3"><a href="https://www.huobi.com/" >Huobi</a></div>
				<div class="w-100 p-2">Or check out any of the other exchanges listed on <a href="https://coinmarketcap.com/currencies/steem/#markets">Coinmarketcap</a></div>
			</div>
			<div class="form-group">
			  <label for="account-username">Your Username</label>
			  <input class="form-control form-control-lg mb-2" ref="account-username" id="account-username" @input="handleUsername($event.target.value)"/>
			  <p class="text-brand" v-if="username_invalid">
				<b>{{ username_invalid }}</b>
			  </p>
			  <p class="text-brand" v-if="username_exists">
				<b>{{ username_exists }}</b>
			  </p>
			  <label for="account-password">Your Password</label><br/>
			  <input class="form-control form-control-lg" id="account-password" ref="account-password"/>
			  <p class="text-brand"><i>Make sure to store your password somewhere safe. Losing your password could lead to permanent loss of your funds!!</i></p>
			  <button v-on:click="copyContent" data-targetEl="account-password" class="btn btn-brand btn-lg w-20">Copy Password</button><br/><br/>
			  <label for="account-email">Your Email (Optional - helps with recovery if needed)</label><br/>
			  <input class="form-control form-control-lg mb-2" id="account-email" ref="account-email" v-model="email"/>
			  <label for="invested-usd">USD Amount To Invest</label><br/>
			  <input type="number" class="form-control form-control-lg mb-2" id="invested-usd" ref="invested-usd" v-model="userInputUSDAmount"/>
			  <label for="invested-amount">STEEM Amount To Send</label><br/>
			  <input type="number" class="form-control form-control-lg" id="invested-amount" ref="invested-amount" readonly :value="getMatchingSTEEM()" />
			  <button v-on:click="copyContent" data-targetEl="invested-amount" class="btn btn-brand btn-lg w-20">Copy STEEM Amount</button><br/><br/>
			  <label for="matching-afit">Matching Rewarded AFIT(s)</label><br/>
			  <input type="number" class="form-control form-control-lg mb-2" id="matching-afit" ref="matching-afit" readonly :value="getMatchingAFIT()"/>
			  <p class="lead mb-4">
			  You will need to send the matching STEEM amount to the below address. When sending the funds, make sure to use both the "address" and the "memo" fields.
			  </p>
			  
			  <label for="actifit-address">Address</label><br/>
			  <input class="form-control form-control-lg w-80" id="actifit-address" ref="actifit-address" readonly :value="getTargetAccount()"/>
				<button v-on:click="copyContent" data-targetEl="actifit-address" class="btn btn-brand btn-lg w-20">Copy Address</button><br/><br/>
				<label for="actifit-memo">Memo</label><br/>
				<input class="form-control form-control-lg w-80" id="actifit-memo" ref="actifit-memo" readonly />	
				<button v-on:click="copyContent" data-targetEl="actifit-memo" class="btn btn-brand btn-lg w-20 mb-2">Copy Memo</button>	
				
				<vue-recaptcha ref="recaptcha" @verify="onVerifyCaptcha" @expired="onExpiredCaptcha" sitekey="6LdpcoMUAAAAAPGTqlvhKEK6Ayw5NqLDZz5Sjudq">
				</vue-recaptcha>
				<p class="text-brand" v-if="captcha_invalid">
				  <b>{{ captcha_invalid }}</b>
				</p>
				<p class="lead mb-4 pb-1">
					Once you send out the funds, please click the button below for confirmation and to process your account creation.
					<br/>Please keep the page open till we verify your payment and create your account.
				</p>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="text-center pb-2"><button v-on:click="checkFunds" class="btn btn-brand btn-lg w-20">I have sent STEEM!</button></div>
				<div v-if="processStarted" class="text-center text-brand">
					<div id="checking_funds">
						<i class="fas fa-spin fa-spinner" v-if="checkingFunds"></i><i class="fas fa-check" v-else></i> Checking Your STEEM Transfer
					</div>
					<div id="account_creation" v-if="resultReturned">
						<div v-if="accountCreated">
							<i class="fas fa-check"></i><span> Account Successfully Created! <br/><br/> You may now login using your username and password. Make sure you do NOT lose your password and store it safely!</span>
							<div>For the Actifit Mobile App, you need your private posting key to send out your reports, which is the following:<br/> <b>{{this.privatePostKey}}</b><br/>Please copy this also to a safe place.</div>
						</div>
						<div v-else>
							There was a problem creating your account. Please contact support at <a href="https://discord.gg/aHtcA6r">discord</a> or via email <a href="mailto:info@actifit.io">info@actifit.io</a>
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
		minUSD: 10,
		afitPrice: 0.5,
		userInputSTEEMAmount: 0,
		userInputUSDAmount: this.minUSD,
		username_exists: '',
		username_invalid: '',
		captchaValid: false,
		captcha_invalid: '',
		targetAccount: 'actifit.signup',
		delegatedSteem: 4,
		privatePostKey: '',
		error_proceeding: '',
		error_msg: '',
		email: '',
		reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/
	  }
	},
    computed: {
    },
    async mounted () {
		  
	  //grab STEEM price
	  fetch('https://api.coinmarketcap.com/v1/ticker/steem/').then(
		res => {res.json().then(json => this.setSteemPrice (json[0].price_usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
		
	  //grab AFIT price
	  
	  fetch('https://actifitbot.herokuapp.com/curAFITPrice').then(
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
	  
	  //console.log(this.$route.query.referrer);
	  //this.initiateProcess ('jhdkhfkjf');
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
				console.log('existing account found');
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
	  getMatchingSTEEM () {
		return parseFloat(this.userInputUSDAmount / this.steemPrice).toFixed(3);
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
		if (!this.captchaValid){
			this.captcha_invalid = 'Please solve captcha first.';
			return;
		}
		if (this.username_exists || this.username_invalid || this.$refs["account-username"].value==''){
			this.error_proceeding = true;
			this.error_msg = 'Please choose a proper username for your new account.';
			return;
		}
		if (parseFloat(this.$refs["invested-usd"].value)<parseFloat(this.minUSD)){
			this.error_proceeding = true;
			this.error_msg = 'The USD amount chosen is too low. You need to use a min of USD '+this.minUSD;
			return;
		}
		console.log(this.isEmailValid());
		if (this.isEmailValid()!=''){
			this.error_proceeding = true;
			this.error_msg = 'The email format used is incorrect.';
			return;
		}
		//to prevent tampering with STEEM and AFIT values
		const steem_invest = this.getMatchingSTEEM ();
		const afit_reward = this.getMatchingAFIT ();
		this.checkingFunds = true;
		this.processStarted = true;
		console.log('checking funds');
		let url = new URL(process.env.actiAppUrl + 'confirmPayment');
		//compile all needed data and send it along the request for processing
		let params = {
			confirm_payment_token: process.env.confirmPaymentToken, 
			new_account: this.$refs["account-username"].value,
			new_pass: this.$refs["account-password"].value,
			usd_invest: this.$refs["invested-usd"].value,
			steem_invest: steem_invest,
			afit_reward: afit_reward,
			memo: this.targetMemo,
			referrer: this.$route.query.referrer,
			email: this.$refs["account-email"].value,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			console.log(outcome);
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
</style>