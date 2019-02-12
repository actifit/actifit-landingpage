<template>
  <div>
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

    <div class="container pt-5 mt-5 pb-5" v-if="user">

      <!-- account balance -->
      <div class="text-center">
        <h3 class="mb-4">Hey {{ user.account.name }}!</h3>
        <h4>Your AFIT Balance</h4>
        <h4 class="mb-4 font-weight-bold">{{ formattedUserTokens }}</h4>
		<h4>Your STEEM Balance</h4>
		<h5 class="mb-4 font-weight-bold">
			<span class="p-2">{{ this.steemPower }}</span>
			<span class="p-2">{{ formattedSTEEMBalance() }}</span>
			<span class="p-2">{{ formattedSTEEMBalance('1') }}</span>
			<div class="p-2">
				<button v-on:click="transferFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ transferActionButton }}</button>
				<button v-on:click="powerUpFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ powerUpActionButton }}</button>
				<button v-on:click="powerDownFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ powerDownActionButton }}</button>
			</div>
			<transition name="fade">
			  <div v-if="fundActivityMode == 1" class="text-center grid">
				<div class="row">
				  <label for="transfer-recipient" class="w-25 p-2">To *</label>
				  <input type="text" id="transfer-recipient" name="transfer-recipient" ref="transfer-recipient" class="form-control-lg w-50 p-2">
				</div>
				<div class="row">
				<label for="transfer-type" class="w-25 p-2">Type *</label>
				<select @change="transferTypeChange" id="transfer-type" name="transfer-type" ref="transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
				  <option value="STEEM">STEEM</option>
				  <option value="SBD">SBD</option>
				</select>
				</div>
				<div class="row">
				  <label for="transfer-amount" class="w-25 p-2">Amount *</label>
				  <input type="number" id="transfer-amount" name="transfer-amount" ref="transfer-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row">
				  <label for="transfer-memo" class="w-25 p-2">Memo</label>
				  <input type="text" id="transfer-memo" name="transfer-memo" ref="transfer-memo" class="form-control-lg w-50 p-2">				
				</div>
				<div class="text-center small p-2">
				  <i>{{ this.memo_notice}}</i>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row">
				  <div class="w-25"></div>
				  <button v-on:click="proceedTransfer" class="btn btn-brand btn-lg w-50">Send</button>
				</div>
			  </div>
			</transition>
			<transition name="fade">
			  <div v-if="fundActivityMode == 2" class="text-center grid">
				<div class="row">
				  <label for="powerup-recipient" class="w-25 p-2">To *</label>
				  <input type="text" id="powerup-recipient" name="powerup-recipient" ref="powerup-recipient" class="form-control-lg w-50 p-2" :value="user.account.name">
				</div>
				<div class="row">
				  <label for="powerup-amount" class="w-25 p-2">Amount *</label>
				  <input type="number" id="powerup-amount" name="powerup-amount" ref="powerup-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50"><i>
				    Powering up STEEM converts your STEEM into <b>STEEM POWER (SP)</b>, providing you more stake on the Steem blockchain, and hence increasing your vote value on posts.<br/>
				    SP can only be withdrawn using the Power Down option, which allows the conversion back to STEEM over the period of 13 weeks, with one portion out of 13 converted every week.</i>
				  </div>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row">
				  <div class="w-25"></div>
				  <button v-on:click="proceedPowerUp" class="btn btn-brand btn-lg w-50">Power Up</button>
				</div>
			  </div>
			</transition>
			<transition name="fade">
			  <div v-if="fundActivityMode == 3" class="text-center grid">
				<div class="row">
				  <label for="powerdown-amount" class="w-25 p-2">Amount *</label>
				  <input type="number" id="powerdown-amount" name="powerdown-amount" ref="powerdown-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isPoweringDown">
				  <div class="text-center small p-2 w-25"></div>
				  <div class="text-center text-brand small p-2 w-50"><b>You are currently powering down at a weekly rate of {{powerDownRateVal}}</b></div>
				</div>
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50"><i>
				    Powering down allows you to convert your STEEM POWER back to withdrawable <b>liquid STEEM</b>. <br/>
				    This process occurs over 13 weeks, yielding one portion out of 13 of the powered down amount to be converted every week.
				  </i>
				  </div>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row" v-if="isPoweringDown">
				  <div class="text-center small p-2 w-25"></div>
				  <button v-on:click="proceedPowerDown" class="btn btn-brand btn-lg w-25 border">Power Down</button>
				  <button v-on:click="cancelPowerDown" class="btn btn-brand btn-lg w-25 border">Cancel Power Down</button>
				</div>
				<div class="row" v-else>
				  <div class="text-center small p-2 w-25"></div>
				  <button v-on:click="proceedPowerDown" class="btn btn-brand btn-lg w-50 border">Power Down</button>
				</div>
			  </div>
			</transition>
		</h5>
		<div v-if="isClaimableDataAvailable">
			<h5>Claimable STEEM Rewards</h5>
			<h6 class="mb-4 font-weight-bold">
				<span class="p-2">{{ this.claimSP }}</span>
				<span class="p-2">{{ this.claimSTEEM }}</span>
				<span class="p-2">{{ this.claimSBD }}</span>
				<div class="p-2"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">Claim Rewards</button></div>
			</h6>
		</div>
      </div>
	  
      <!-- transaction history -->
      <div class="history mx-auto">
        <h3 class="text-center mt-5">AFIT Transaction History</h3>
        <Transaction v-for="(transaction, index) in transactions" :key="index" :transaction="transaction" />
        <div class="text-center"><small class="text-muted" v-if="transactions.length === 0">No transactions yet.</small></div>
      </div>
    </div>
	
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    You need to login first to check your balance.
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-75">Login</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">Sign Up</a>
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

  import { mapGetters } from 'vuex'

  export default {
	data () {
	  return {
	    CLOSED_MODE: 0,
		TRANSFER_FUNDS: 1,
		POWERUP_FUNDS: 2,
		POWERDOWN_FUNDS: 3,
		powerDownRateVal: '',
		TRANSFER_FUNDS_ACTION_TEXT: 'Transfer Funds',
		HIDE_TRANSFER_FUNDS_ACTION_TEXT: 'Hide Transfer',		
		POWERUP_ACTION_TEXT: 'Power Up STEEM',
		HIDE_POWERUP_ACTION_TEXT: 'Hide Power Up',
		POWERDOWN_ACTION_TEXT: 'Power Down STEEM',
		HIDE_POWERDOWN_ACTION_TEXT: 'Hide Power Down',		
		steemPower: '',
		claimSP: '',
		claimSTEEM: '',
		claimVests: '',
		claimSBD: '',
		claimWindow: '',
		fundActivityMode: this.CLOSED_MODE,
		transferType: 'STEEM',
		error_proceeding: '',
		error_msg: '',
		memo_notice: 'If sending funds to an exchange, make sure to use the memo field.',
		properties: '', //handles the Steem BC properties
		screenWidth: 1200,
	  }
	},
    components: {
      NavbarBrand,
      UserMenu,
      Transaction, // single transaction block
      Footer,
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'transactions', 'userRank']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2) + " AFIT";
      },
	  displayUserRank () {
		return this.userRank
	  },
	  isClaimableDataAvailable () {
	  //confirms whether we have useful claimable data to control display of the relevant section
		//console.log('isClaimableDataAvailable');
		return (parseFloat(this.claimSTEEM)>0 ||
			parseFloat(this.claimSP) ||
			parseFloat(this.claimVests) ||
			parseFloat(this.claimSBD) );
	  },
	  isPoweringDown () {
		//returns whether user is powering down
		if (typeof this.user != 'undefined' && this.user != null){
		  if (this.user.account.vesting_withdraw_rate.split(' ')[0] > 0){
			return true;
		  }
		}
		return false;
	  },
	  transferActionButton () {
	    //handle proper button display
		/*if (this.fundActivityMode == this.TRANSFER_FUNDS){
		  return this.HIDE_TRANSFER_FUNDS_ACTION_TEXT;
		}*/
		return this.TRANSFER_FUNDS_ACTION_TEXT;
	  },
	  powerUpActionButton () {
	    //handle proper button display
		/*if (this.fundActivityMode == this.POWERUP_FUNDS){
		  return this.HIDE_POWERUP_ACTION_TEXT;
		}*/
		return this.POWERUP_ACTION_TEXT;
	  },
	  powerDownActionButton () {
	    //handle proper button display
		/*if (this.fundActivityMode == this.POWERDOWN_FUNDS){
		  return this.HIDE_POWERDOWN_ACTION_TEXT;
		}*/
		return this.POWERDOWN_ACTION_TEXT;
	  },
	  smallScreenBtnClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "";
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  },
    },
	watch: {
	  user: 'fetchUserData',
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
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){	  
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchTransactions')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		  this.powerDownRateVal = await this.vestsToSteemPower(this.user.account.vesting_withdraw_rate.split(' ')[0], true);
		}
	  },
	  formattedSTEEMBalance (dataType) {
	    //handle display of STEEM/SBD balance
	    //console.log(this.user)
		let displaySteemBalance = '';
	    if (typeof this.user != 'undefined' && this.user != null){
		  if (dataType == '1'){
		    //SBD balance
			displaySteemBalance = this.user.account.sbd_balance;
		  }else{
		    //STEEM balance
		    displaySteemBalance = this.user.account.balance;
			//also prompt SP display
			this.vestsToSteemPower(this.user.account.vesting_shares);
			//also update claimable amounts
			this.claimableSTEEMRewards();
		  }
		}
		return displaySteemBalance;
	  },
	  async vestsToSteemPower (vests, returnVal) {
		//function handles converting Vests to SP
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
		}
		let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
	    vests = Number(vests.split(' ')[0]);
		if (typeof returnVal != 'undefined'){
		  return this.numberFormat(totalSteem * (vests / totalVests), 3)+" STEEM";
		}
	    this.steemPower = this.numberFormat(totalSteem * (vests / totalVests), 3)+" STEEM POWER";
	  },
	  async steemPowerToVests (steemPower) {
	    //function handles conversting SP to Vests
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
		}
		let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
		
		return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
	  },
	  claimableSTEEMRewards () {
		
		//function handles preparing claimable STEEM rewards
		if (typeof this.user != 'undefined' && this.user != null){
		  this.claimSTEEM = this.user.account.reward_steem_balance;
		  this.claimSP = this.user.account.reward_vesting_steem + " POWER";
		  this.claimVests = this.user.account.reward_vesting_balance;
		  this.claimSBD = this.user.account.reward_sbd_balance;
		  return this.claimSP + this.claimSTEEM + this.claimSBD;
		}
		return '';
	  },
	  async claimRewards () {
		//function handles claiming STEEM rewards
		
		//sample link: https://steemconnect.com/sign/claim-reward-balance?account=sdsf&reward_steem=33&reward_sbd=2342&reward_vests=23432
		var link = this.$steemconnect.sign('claim-reward-balance', {
		  account: this.user.account.name,
		  reward_steem: this.claimSTEEM,
		  reward_sbd: this.claimSBD,
		  reward_vests: this.claimVests,
		}, window.location.origin + '/wallet');

		//console.log(link);
		
		window.open(link);
		
		//Below would have been preferred approach, but claimRewardBalance keeps failing. Keeping here for future further exploration
		/*
		console.log(this.claimSTEEM.split(' ')[0]);
		console.log(this.claimSBD.split(' ')[0]);
		console.log(this.claimVests.split(' ')[0]);
		await this.$steemconnect.claimRewardBalance(this.user.account.name, this.claimSTEEM, this.claimSBD, this.claimSP);
		console.log('done');*/
	  },
	  transferFunds () {
		//function handles opening/closing transfer section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.TRANSFER_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.TRANSFER_FUNDS;
		}

	  },
	  powerUpFunds () {
		//function handles opening/closing of power up section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.POWERUP_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.POWERUP_FUNDS;
		}
		
	  },
	  powerDownFunds () {
		//function handles opening/closing of power up section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.POWERDOWN_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.POWERDOWN_FUNDS;
		}
		
	  },
	  proceedTransfer () {
		//function handles the actual processing of the transfer
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["transfer-recipient"].value.trim() == '' ||
			this.$refs["transfer-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = 'Please ensure to fill all required transfer fields properly.';
		  return;
		}
		if (isNaN(this.$refs["transfer-amount"].value.trim()) || this.$refs["transfer-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = 'The amount needs to be a positive numeric value.';
		  return;
		}
		
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		var link = this.$steemconnect.sign('transfer', {
		  from: this.user.account.name,
		  to: this.$refs["transfer-recipient"].value,
		  amount: this.$refs["transfer-amount"].value + ' ' + this.transferType,
		  memo: this.$refs["transfer-memo"].value,
		}, window.location.origin + '/wallet');
		//launch the SC window
		window.open(link);
	  },
	  transferTypeChange (e) {
	    //handles the drop down select option to ensure we have proper value
		if(e.target.options.selectedIndex > -1) {
		  this.transferType = e.target.options[e.target.options.selectedIndex].value;
		}
	  },
	  proceedPowerUp () {
		//function handles the actual processing of the power up
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["powerup-recipient"].value.trim() == '' ||
			this.$refs["powerup-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = 'Please ensure to fill all required power up fields properly.';
		  return;
		}
		if (isNaN(this.$refs["powerup-amount"].value.trim()) || this.$refs["powerup-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = 'The amount needs to be a positive numeric value.';
		  return;
		}
		
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		var link = this.$steemconnect.sign('transfer-to-vesting', {
		  from: this.user.account.name,
		  to: this.$refs["powerup-recipient"].value,
		  amount: parseFloat(this.$refs["powerup-amount"].value).toFixed(3) + ' ' + 'STEEM',
		}, window.location.origin + '/wallet');
		//launch the SC window
		window.open(link);
	  },
	  async proceedPowerDown () {
		//function handles the actual processing of the power down
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["powerdown-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = 'Please ensure to fill the amount properly.';
		  return;
		}
		if (isNaN(this.$refs["powerdown-amount"].value.trim())){
		  this.error_proceeding = true;
		  this.error_msg = 'The amount needs to be a positive numeric value.';
		  return;
		}
		let vestsValue = await this.steemPowerToVests(this.$refs["powerdown-amount"].value);
		console.log(vestsValue);
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		var link = this.$steemconnect.sign('withdraw-vesting', {
		  account: this.user.account.name,
		  vesting_shares: vestsValue + ' ' + 'VESTS',
		}, window.location.origin + '/wallet');
		//launch the SC window
		window.open(link);
	  },
	  cancelPowerDown () {
		//function handles cancelling the power down
		var link = this.$steemconnect.sign('withdraw-vesting', {
		  account: this.user.account.name,
		  vesting_shares: '0.000000 VESTS',
		}, window.location.origin + '/wallet');
		//launch the SC window
		window.open(link);
	  }
	},
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  let ref_id = this;
	  
	  //let's load the properties to properly convert SP to Vests and vice-versa
	  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
	  
	  this.screenWidth = screen.width;
	  console.log(this.screenWidth)
	  window.addEventListener("focus", function(event) 
	  { 
		console.log('focus');
		//refresh user data first
		ref_id.fetchUserData();
	  }, false);
		
    }
  }
</script>

<style lang="sass">
  .history
    max-width: 500px
</style>
