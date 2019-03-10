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
		<div class="p-2">
			<button v-on:click="exchangeAFITforSTEEM" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ exchangeAFITActionButton }}</button>
			
			  <div v-if="exchangeAFITMode == 1">
			  <transition name="fade" v-if="!userHasFundsPass" >
				<div class="text-center grid p-2">
					<div class="text-brand font-weight-bold">Let's get you started on exchanging your AFIT for STEEM upvotes!</div>
					<h5>Step 1 / 3: You need to set up your funds password</h5>
					<div class="row">
					  <label for="funds-pass" class="w-25 p-2">Funds Password</label>
					  <input type="text" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control-lg w-50 p-2">
					  <button v-on:click="setPasswordVal" class="btn btn-brand">Generate Password</button>
					</div>
					<div class="row">
						<div class="w-25"></div>
						<div class="w-50 text-brand"><i>Please avoid using special characters(#,$,%...)</i></div>
					</div>
					<div class="row">
					  <label for="confirm-funds-pass" class="w-25 p-2">Confirm Password</label>
					  <input type="text" id="confirm-funds-pass" name="confirm-funds-pass" ref="confirm-funds-pass" class="form-control-lg w-50 p-2">
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="setFundsPass" class="btn btn-brand btn-lg w-50">Set Password</button>
					</div>
					<div v-if="settingPass" class="row">
					  <div class="w-25"></div>
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
					<div v-if="errorSettingPass" class="row text-brand">
					  <div class="w-25"></div>
					  <span>{{errorSettingPass}}</span>
					</div>
				</div>
			  </transition>
			  <transition name="fade" v-else-if="!userFundsPassVerified" >
				<div class="text-center grid">
					<h5>Step 2 / 3: Your funds password needs to be verified</h5>
					<div>Please send at least 1 STEEM/SBD to @actifit.exchange (one time fee) <br/>
					to verify your funds password & activate your exchange service using form below.
					<br/><span>DO NOT CLOSE this window till verification is complete.</span>
					</div>
					<div class="row">
					  <label for="pass-transfer-type" class="w-25 p-2">Type *</label>
					  <select @change="passTransferTypeChange" id="pass-transfer-type" name="pass-transfer-type" ref="pass-transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
					    <option value="STEEM">STEEM</option>
					    <option value="SBD">SBD</option>
					  </select>
					</div>
					<div class="row">
					  <label for="pass-transfer-amount" class="w-25 p-2">Amount *</label>
					  <input type="number" id="pass-transfer-amount" name="pass-transfer-amount" ref="pass-transfer-amount" class="form-control-lg w-50 p-2"  v-model="transfer_amount">
					</div>
					<div class="text-brand text-center" v-if="pass_error_proceeding">
					  {{ this.pass_error_msg}}
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="proceedVerifyPass" class="btn btn-brand btn-lg w-50">Send & Verify</button>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <div v-if="checkingFunds" id="checking_funds">
						<i class="fas fa-spin fa-spinner"></i>Checking Your STEEM Transfer
					  </div>
					</div>
				</div>
			  </transition>
			  <transition name="fade" v-else-if="pendingTokenSwap == ''" >
				<div class="text-center grid p-2">
				  <div class="p-3">
					<a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeQueueModal" >
					  <i class="fas fa-list-ol"></i> Exchange Queue
					</a>
					<a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeHistoryModal" >
					  <i class="fas fa-history"></i> My History
					</a>
				  </div>
					<div>Step 3 / 3: You are ready to exchange AFIT for STEEM Upvotes!</div>
					<div>Upvotes take place on your next actifit post/report with proof of activity.</div>
					<div>Choose an option</div>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_5" value="5" v-model="afit_val_exchange">
						<label for="afit_exchange_5">5 AFIT Tokens</label>
					  </span>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_10" value="10" v-model="afit_val_exchange">
						<label for="afit_exchange_10">10 AFIT Tokens</label>
					  </span>
					  <br>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_15" value="15" v-model="afit_val_exchange">
						<label for="afit_exchange_15">15 AFIT Tokens</label>
					  </span>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_20" value="20" v-model="afit_val_exchange">
						<label for="afit_exchange_20">20 AFIT Tokens</label>
					  </span>
					<br>
					<span><i>You are exchanging {{ afit_val_exchange }} AFIT tokens for approx. ${{ (afit_val_exchange * 0.036 / 0.65).toFixed(2) }} in STEEM upvote
						<br/> (net profit approx. ${{ (afit_val_exchange * 0.036).toFixed(2) }})
						<br/>Please enter your funds password to proceed</i></span>
					<div class="row" >
					  <div class="w-25 p-2 text-right">Funds Password</div>
					  <input type="password" id="funds-pass-entry" name="funds-pass-entry" ref="funds-pass-entry" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="error_swap != ''" >
					  <div class="w-25"></div>
					  <div class="text-brand w-50">{{error_swap}}</div>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="exchangeTokensUpvote" class="btn btn-brand btn-lg w-50">Exchange</button>
					</div>
					<div class="row" v-if="performingSwap" >
					  <div class="w-25"></div>
					  <div id="performing_swap">
						<i class="fas fa-spin fa-spinner"></i>
					  </div>
					</div>
					<div class="row" v-if="swapResult != ''" >
					  <div class="w-25"></div>
					  <div id="swap_result" class="text-brand"><i>
						{{swapResult}}
					  </i></div>
					</div>
				</div>
			  </transition>
			  <!--<transition name="fade" v-else-if="pendingTokenSwapTransCount > 30" >
				<div class="text-center grid font-weight-bold p-2">
					There are no more spots during this round for exchanging AFIT tokens to STEEM Upvotes.
					Please try again on the following voting cycle.
				</div>
			  </transition>-->
			  <transition name="fade" v-else >
				<div class="p-3">
				  <a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeQueueModal" >
					<i class="fas fa-list-ol"></i> Exchange Queue
				  </a>
				  <a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeHistoryModal" >
					<i class="fas fa-history"></i> My History
				  </a>
				</div>
				<div class="text-center grid font-weight-bold p-2">
					<i><div>You have a scheduled {{pendingTokenSwap.paid_afit}} AFIT to STEEM Upvotes exchange in progress.</div>
					<div class="text-brand">Your current number in queue is {{userTokenSwapPending.order}}. Your exchange/upvote should take place within {{userTokenSwapPending.reward_round * 24}} hrs</div>
					<div>The upvote will take place on your most recent Actifit Report card that is NOT yet rewarded.</div></i>
				</div>
			  </transition>
			  <ExchangeQueue :transList="tokenSwapQueue.pendingTransactions" :user="user.account.name"/>
			  <ExchangeHistory :transList="userTokenSwapHistory.userTokenSwapHist"/>
			  </div>
			
		</div>
		<h4>Your STEEM Balance</h4>
		<h5 class="mb-4 font-weight-bold">
			<span class="p-2">{{ this.renderSteemPower(2) }} STEEM POWER</span>
			<span class="p-2">{{ this.renderSteemBalance() }}</span>
			<span class="p-2">{{ this.renderSBDBalance() }}</span>
			<div class="p-2">
				<small><i>(STEEM POWER BREAKDOWN: {{this.renderSteemPower(1)}} + {{this.renderSteemPower(3)}} - {{this.renderSteemPower(4)}} - {{this.renderSteemPower(5)}})</i></small>
			</div>
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
				  <div class="text-center text-brand small p-2 w-50"><b>You are currently powering down at a weekly rate of {{this.renderSteemPower(5)}} STEEM</b></div>
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
  import ExchangeQueue from '~/components/ExchangeQueueModal'
  import ExchangeHistory from '~/components/ExchangeHistoryModal'
  
  import { mapGetters } from 'vuex'

  export default {
	data () {
	  return {
	    CLOSED_MODE: 0,
		TRANSFER_FUNDS: 1,
		POWERUP_FUNDS: 2,
		POWERDOWN_FUNDS: 3,
		EXCHANGE_AFIT_STEEM: 1,
		powerDownRateVal: '',
		EXCHANGE_AFIT_FOR_STEEM: 'Exchange AFIT for STEEM',
		TRANSFER_FUNDS_ACTION_TEXT: 'Transfer Funds',
		HIDE_TRANSFER_FUNDS_ACTION_TEXT: 'Hide Transfer',		
		POWERUP_ACTION_TEXT: 'Power Up STEEM',
		HIDE_POWERUP_ACTION_TEXT: 'Hide Power Up',
		POWERDOWN_ACTION_TEXT: 'Power Down STEEM',
		HIDE_POWERDOWN_ACTION_TEXT: 'Hide Power Down',		
		steemPower: 0,
		effectiveSteemPower: 0,
		delegatedSteemPower: 0,
		receivedSteemPower: 0,
		claimSP: '',
		claimSTEEM: '',
		claimVests: '',
		claimSBD: '',
		claimWindow: '',
		fundActivityMode: this.CLOSED_MODE,
		transferType: 'STEEM',
		transferTypePass: 'STEEM',
		error_proceeding: '',
		error_msg: '',
		pass_error_proceeding: '',
		pass_error_msg: '',
		performingSwap: false,
		error_swap: '',
		swapResult: '',
		checkingFunds: false,
		target_exchange_account: 'actifit.exchange',
		memo_notice: 'If sending funds to an exchange, make sure to use the memo field.',
		properties: '', //handles the Steem BC properties
		userHasFundsPass: false, //holds value if user has proper funds pass or not yet
		userFundsPassVerified: false, //holds value if user has verified funds pass or not yet
		settingPass: false,
		verifyingPass: false,
		exchangeAFITMode: this.CLOSED_MODE,
		errorSettingPass: '',
		screenWidth: 1200,
		afit_val_exchange: 5,
		afitPrice: 0.036,
		pendingTokenSwap: '',
		transfer_amount: 1,
		min_tokens_required: 100,
		pendingTokenSwapTransCount: 0,
		tokenSwapQueue: '',
		userTokenSwapHistory: '',
		userTokenSwapPending: '',
	  }
	},
    components: {
      NavbarBrand,
      UserMenu,
      Transaction, // single transaction block
      Footer,
	  ExchangeQueue,
	  ExchangeHistory,
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
	  exchangeAFITActionButton () {
		return this.EXCHANGE_AFIT_FOR_STEEM;
	  },
	  transferActionButton () {
		return this.TRANSFER_FUNDS_ACTION_TEXT;
	  },
	  powerUpActionButton () {
		return this.POWERUP_ACTION_TEXT;
	  },
	  powerDownActionButton () {
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
	  renderSteemPower (type) {
		switch(type){
			case 1: return this.numberFormat(this.steemPower, 3);
					
			case 2: return this.numberFormat(this.effectiveSteemPower, 3);
					
			case 3: return this.numberFormat(this.receivedSteemPower, 3);
					
			case 4: return this.numberFormat(this.delegatedSteemPower, 3);
					
			case 5: return this.numberFormat(this.powerDownRateVal, 3);
		}
	  },
	  renderSteemBalance () {
		console.log(this.user.account.balance);
		return this.user.account.balance;
	  },
	  renderSBDBalance () {
		console.log(this.user.account.sbd_balance);
		return this.user.account.sbd_balance;
	  },
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){	  
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchTransactions')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		  
		  //let's check if user already has a funds pass set
		  fetch(process.env.actiAppUrl+'userHasFundsPassSet/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserPassStatus (json)).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //let's check if user has a pending AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'userHasPendingTokenSwap/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserTokenSwapStatus (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //let's grab the full queue of pending AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'getPendingTokenSwapTrans/').then(
			res => {res.json().then(json => this.setTokenSwapQueue (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //let's grab the user's history AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'getUserTokenSwapHistory/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserTokenSwapHistory (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  
		  //let's grab the number of pending token swap transactions to see if we can add more
		  /*fetch(process.env.actiAppUrl+'getPendingTokenSwapTransCount').then(
			res => {res.json().then(json => this.pendingTokenSwapTransCount = json ).catch(e => reject(e))
		  }).catch(e => reject(e))*/
		  		  
		  //grab SP
		  this.steemPower = await this.vestsToSteemPower(this.user.account.vesting_shares);
		
		  //grab Delegated SP
		  this.delegatedSteemPower = await this.vestsToSteemPower(this.user.account.delegated_vesting_shares);
		
		  //grab received SP
		  this.receivedSteemPower = await this.vestsToSteemPower(this.user.account.received_vesting_shares);
		  
		  //grab powerdown SP
		  this.powerDownRateVal = await this.vestsToSteemPower(this.user.account.vesting_withdraw_rate.split(' ')[0]);
		
		  //effective SP
		  this.effectiveSteemPower = this.steemPower + this.receivedSteemPower - this.delegatedSteemPower - this.powerDownRateVal;
		
		  //also update claimable amounts
		  this.claimableSTEEMRewards();
		  
		  console.log(this.user);
			
		}
	  },
	  setAFITPrice (_afitPrice){
		this.afitPrice = parseFloat(_afitPrice).toFixed(3);
	  },
	  setUserPassStatus (result) {
		//handles setting funds password status
		console.log(result);
		//set proper value for funds pass confirmation
		this.userHasFundsPass = result.hasFundsPass;
		
		//set proper value for verified funds pass status
		this.userFundsPassVerified = result.passVerified;
	  },
	  setUserTokenSwapStatus (result){
	    //handles setting user token swap status
		console.log(result);
		if (result.user_pending_swap){
			this.pendingTokenSwap = result.user_pending_swap
		}else{
			this.pendingTokenSwap = '';
		}
		//
	  },
	  setTokenSwapQueue (result){
		//handles setting the current tokenSwapQueue
		this.tokenSwapQueue = result
		this.getUserQueueDetails();
	  },
	  getUserQueueDetails (){
		let entryList = this.tokenSwapQueue.pendingTransactions
		//sets proper full entry for user's token queue exchange details
		for (let i=0, max = entryList.length; i<max;i++){
			if (entryList[i].user === this.user.account.name){
				//found our user
				this.userTokenSwapPending = entryList[i];
				break;
			}
		}
	  },
	  setUserTokenSwapHistory (result){
		//handles setting the user's token swap history
		this.userTokenSwapHistory = result;
	  },	  
	  async vestsToSteemPower (vests) {
		//function handles converting Vests to SP
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
		}
		let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
	    vests = Number(vests.split(' ')[0]);
	    return (totalSteem * (vests / totalVests));
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
	  },
	  exchangeAFITforSTEEM () {
		//function handles exchanging AFIT tokens for STEEM upvotes
		this.exchangeAFITMode = !this.exchangeAFITMode
	  },
	  passTransferTypeChange (e) {
	    //handles the drop down select option to ensure we have proper value
		if(e.target.options.selectedIndex > -1) {
		  this.transferTypePass = e.target.options[e.target.options.selectedIndex].value;
		}
	  },
	  setPasswordVal(){
		this.$refs["funds-pass"].value = this.generatePassword(2);
	  },
	  generatePassword (multip) {
		//generate random 11 characters password
		let passString = '';
		for (let i=0;i<multip;i++){
			passString += Math.random().toString(36).substr(2, 13);
		}
		return passString;
	  },
	  async setFundsPass () {
		//stores the password set by the user
		this.settingPass = true;
		this.errorSettingPass = '';
		//ensure we have proper values
		if (this.$refs["funds-pass"].value == ''){
		  this.errorSettingPass = 'Please enter a funds password or generate one';
		  this.settingPass = false;
		  return;
		}
		//ensure user confirmed password
		if (this.$refs["confirm-funds-pass"].value !== this.$refs["funds-pass"].value){
		  this.errorSettingPass = 'Your confirmation password needs to match your funds password';
		  this.settingPass = false;
		  return;
		}
		let url = new URL(process.env.actiAppUrl + 'setUserFundsPass/'+this.user.account.name+'/'+this.$refs['funds-pass'].value);
		let res = await fetch(url);
		let outcome = await res.json();
		this.settingPass = false;
		console.log(outcome);
		if (!outcome.error){
			//success
			this.userHasFundsPass = true;
		}else{
			//display error
			this.errorSettingPass = outcome.error;
		}
	  },
	  async proceedVerifyPass() {
		//handles checking for proper confirmation of account via STEEM transfer
		this.checkingFunds = true
		//function handles the actual processing of the transfer
		this.pass_error_proceeding = false;
		this.pass_error_msg = '';
		//ensure we have proper values
		if (isNaN(this.$refs["pass-transfer-amount"].value.trim()) || this.$refs["pass-transfer-amount"].value < 1){
		  this.error_proceeding = true;
		  this.error_msg = 'The amount needs to be a minimum of 1 STEEM/SBD';
		  this.checkingFunds = false;
		  return;
		}
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		var link = this.$steemconnect.sign('transfer', {
		  from: this.user.account.name,
		  to: this.target_exchange_account,
		  amount: this.$refs["pass-transfer-amount"].value + ' ' + this.transferTypePass,
		  memo: '',//no memo needed
		});
		
		//launch the SC window
		window.open(link);
		
		//also start verification process
		let url = new URL(process.env.actiAppUrl + 'confirmPaymentPasswordVerify');
		//compile all needed data and send it along the request for processing
		let params = {
			from: this.user.account.name,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			console.log(outcome);
			//update user data according to result
			this.fetchUserData();
		}catch(err){
			console.error(err);
		}
		this.checkingFunds = false;
	  },
	  async exchangeTokensUpvote () {
		//function handles actual exchange of AFIT tokens to STEEM upvote via recording this
		this.performingSwap = true
		this.error_swap = '';
		this.swapResult = '';
		//ensure we have proper values
		if (this.$refs["funds-pass-entry"].value == ''){
		  this.error_proceeding = true;
		  this.error_swap = 'Please provide your funds password';
		  this.performingSwap = false;
		  return;
		}
		if (this.userTokens <  this.min_tokens_required){
		  this.error_swap = 'You need at least '+this.min_tokens_required+' AFIT tokens to exchange for upvotes';
		  this.performingSwap = false;
		  return;
		}
		//proceed with storing the swap and decreasing user AFIT tokens count
		let url = new URL(process.env.actiAppUrl + 'performAfitSteemExchange');
		//compile all needed data and send it along the request for processing
		let params = {
			user: this.user.account.name,
			pass: this.$refs['funds-pass-entry'].value,
			tokens: this.afit_val_exchange,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.status == 'Success'){
				this.swapResult = 'AFIT Tokens Successfully swapped for additional STEEM upvote! Upvote will occurr on next reward cycle.';
				//update user data
				this.fetchUserData();
			}else{
				this.error_swap = outcome.error;
			}
		}catch(err){
			console.error(err);
		}
		this.performingSwap = false;
	  },
	},
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  let ref_id = this;
	  
	  //let's load the properties to properly convert SP to Vests and vice-versa
	  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
	  
	  //grab AFIT price
	  fetch(process.env.actiAppUrl+'curAFITPrice').then(
		res => {res.json().then(json => this.setAFITPrice (json.unit_price_usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
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
<style>
  .afit-ex-option{
	border-style: solid;
	display: inline-block;
  }
  .afit-ex-option label{
	height: 60px;
	width: 100px;
  }
</style>