<template>
  <div class="modal fade" id="cartModal" tabindex="-1" ref="cartModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content border border-danger" >
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('Checkout_title') }}</h5>
          <button type="button" class="close" id="closeCartMod" ref="closeCartMod" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body text-center m-3" v-if="cartEntries.length > 0">
		  <div v-for="(product, index) in cartEntries" :key="index" style="text-align: left;">
			<div class="row m-0 pb-1">
				<div :class="'avatar-'+product.level" class="avatar pro-card-small avatar-small " :style="'background-image: url(img/gadgets/' + product.image + ');'"></div>
				<h5 class="col ml-3">{{product.name}} - Level {{product.level}}</h5>
				<div class="ml-2"><button type="button" class="close text-brand" aria-label="Remove" @click.prevent="removeProduct(product)">
					<i class="fas fa-minus-square"></i>
				</button></div>
			</div>
		  </div>
			
			<div v-if="!purchaseSuccess">
				<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="buyNow()" style="float:left; border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.product_price_afit, 2)}} {{this.item_currency}}<img class="token-logo-sm " src="/img/actifit_logo.png"></a>
				<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="buyNowHive()" style="border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.product_price_afit * this.afitPrice.afitHiveLastPrice, 3)}} {{this.hive_currency}}<img class="token-logo-sm " src="/img/HIVE.png"></a>
			  
				<div class="row m-0" v-if="buyHiveExpand && !isKeychainActive && !isHiveauthActive" >
				  <label for="active-key" class="p-2 col-sm-3">{{ $t('Active_Key') }} *</label>
				  <input type="password" id="active-key" name="active-key" ref="active-key" class="form-control-lg col-sm-8 p-2" v-model="userActvKey">
				</div>
				<div class="text-center" v-if="buyHiveExpand">
				  <button v-on:click="proceedBuyNowHive()" v-if="this.userTokens >= this.minAfitBuyTicket" class="btn btn-brand btn-lg border">{{ $t('Proceed') }}</button>
				  <button data-toggle="modal" v-else :data-target="'#buyOptionsModalCart'" class="btn btn-brand btn-lg border">{{ $t('Proceed') }}</button>
				</div>
			</div>
			<div v-else>
				<div v-if="prodHasFriendBenefic()" class="row m-0 p-1">
					<span class="m-2"><b>{{$t('Benef_friend')}}: </b></span>
					<input type="text" name="friend" id="friend" ref="friend" class="form-control p-2 w-50" >
				</div>
				<a class="btn btn-danger btn-lg book-button p-1" @click.prevent="activateGadget()">
					<span>{{ $t('activate_all_gadgets') }}</span>&nbsp;
					<i class="fas fa-check text-success"></i>
				</a>
			</div>
			
			<div class="pb-md-2 text-center" v-if="buyAttempt">			  
              <div v-if="buyInProgress && errorProceed==''">
				<i class="fas fa-spin fa-spinner"></i>
			  </div>
			  <div v-if="errorProceed!=''">
                <span class="text-brand" v-html="this.errorProceed"></span>
              </div>
			  <div v-if="!user">
			    <div class="row pb-3">
				  <div class="w-50">
					<a href="/login" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
				  </div>
				  <div class="w-50">
					<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
				  </div>
				</div>
			  </div>
			</div>

        </div>

		<div class="modal-body text-center m-3" v-else>
			{{ $t('Cart_empty') }}
		</div>
      </div>
	  
	  
    </div>
	
	
	  <BuyOptionsModal id="buyOptionsModalCart" ref="buyOptionsModalCart" containerID="#buyOptionsModalCart" :modalTitle="$t('Buy_product')" :modalText="$t('buy_now_modal_desc').replace('_AMNT_', minAfitBuyTicket)" @proceed-purchase="proceedBuyNowHive"/>
	
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import BuyOptionsModal from '~/components/BuyOptionsModal'

  export default {
     props: ['afitPrice'],
	data () {
      return {
        loading: false,
		sbd_price: 1,
		steem_price: 1,
		hbd_price: 1,
		hive_price: 1,
		cur_bchain: 'HIVE',
		target_bchain: 'HIVE',
		product_price_afit: 0,
		item_currency: 'AFIT',
		hive_currency: 'HIVE',
		buyHiveExpand: false,
		errorProceed: '',
		buyInProgress: false,
		buyAttempt: false,
		userActvKey: '',
		minAfitBuyTicket: process.env.minAfitBuyEarnTicket,
		//purchaseSuccess: false,
      }
    },
	watch: {
	  bchain: function(newBchain) {
		console.log('change in chain - voter modal');
		this.cur_bchain = newBchain;
		this.target_bchain = newBchain;
		this.$store.dispatch('steemconnect/refreshUser');
		//this.reload += 1;
	  },
	  cartEntries: function(){
		//reset any errors due to adding new entries
		this.errorProceed = '';
		
		//update total cart price
		this.product_price_afit = 0;
		for (let i=0;i<this.cartEntries.length;i++){
			this.product_price_afit += this.getProductPrice(this.cartEntries[i]);
		}
	  }
	},
	components: {
		BuyOptionsModal
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['cartEntries']),
	  ...mapGetters(['userTokens']),
	  ...mapGetters(['bchain']),
	  ...mapGetters(['purchaseSuccess']),
	  isKeychainActive (){
		return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
	  },
	  isHiveauthActive (){
		return (localStorage.getItem('acti_login_method') == 'hiveauth')
	  },
	  adjustHiveClass () {
		if (this.target_bchain != 'HIVE'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustSteemClass () {
		if (this.target_bchain != 'STEEM'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustBothClass () {
		if (this.target_bchain != 'BOTH'){
			return 'option-opaque';
		}
		return '';
	  },
    },
	beforeUpdate() {
	  //VP data needing constant refresh upon open/close of new upvote modal
	  
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
	  getProductPrice (product){
		let price_options = product.price;
		let price_options_count = price_options.length;
		let item_price = 0;
		for (let i=0; i < price_options_count; i++){
			let entry = price_options[i];
			item_price = entry.price;
			//item_currency = entry.currency;
		}
		return item_price;
	  },
	  removeProduct (product){
		this.$store.commit('removeCartEntry', product)
	  },
	  //store SBD price
	  setSBDPrice (_sbdPrice){
		this.sbd_price = parseFloat(_sbdPrice).toFixed(3);
	  },
	  //store Steem price
	  setSteemPrice (_steemPrice){
		this.steem_price = parseFloat(_steemPrice).toFixed(3);
	  },
	  
	  //store HBD price
	  setHBDPrice (_hbdPrice){
		this.hbd_price = parseFloat(_hbdPrice).toFixed(3);
	  },
	  //store Hive price
	  setHivePrice (_hivePrice){
		this.hive_price = parseFloat(_hivePrice).toFixed(3);
	  },
	  
	  async processTrxFunc(op_name, cstm_params, forceActive){
		if (!localStorage.getItem('std_login')){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.ref_block_num) {
				//console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestBroadcast(
					this.user.account.name, 
					[[op_name, cstm_params]], 
					forceActive?'Active':'Posting', async (response) => {

						if (response.success){
							//await this.verifyTrx(response.result, operation);
							resolve({success: response.success, trx:{id: response.result.id}})
						}else{
							reject({error: response.error});
						}
						
					}
				);
			});
		}else if (localStorage.getItem('acti_login_method') == 'hiveauth'){	
			return new Promise((resolve) => {
				const auth = {
				  username: this.user.account.name,
				  token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
				  expire: localStorage.getItem('expires'),
				  key: localStorage.getItem('key')
				}
				console.log(auth);
				this.$HAS.broadcast(auth, forceActive?'active':'posting', [[op_name, cstm_params]], (evt)=> {
					console.log(evt)    // process sign_wait message
					let msg = this.$t('verify_hiveauth_app');
					this.$notify({
					  group: 'warn',
					  text: msg,
					  duration: -1, //keep alive till clicked
					  position: 'top center'
					})
				})
				.then(response => {
					console.log(response);
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					if (response.cmd && response.cmd === 'sign_ack'){
						resolve({success: true, trx:{id: response.data}})
					}else if (response.cmd && response.cmd === 'sign_nack'){
						resolve({success: false})
					}
				} ) // transaction approved and successfully broadcasted
				.catch(err => {
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					console.log(err);
					resolve({success: false})
				} )
			});
			
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			console.log(operation);

			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			//let cur_bchain = 'STEEM';
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			//console.log(outcome);
			if (outcome.error){
				console.log(outcome.error);
				
				//if this is authority error, means needs to be logged out
				//example "missing required posting authority:Missing Posting Authority"
				let err_msg = outcome.trx.tx.error;
				if (err_msg.includes('missing') && err_msg.includes('authority')){
					//clear entry
					localStorage.removeItem('access_token');
					//this.$store.commit('setStdLoginUser', false);
					this.error_msg = this.$t('session_expired_login_again');
					this.$store.dispatch('steemconnect/logout');
				}
				
				this.$notify({
				  group: 'error',
				  text: err_msg,//this.$t('session_expired_login_again'),
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx.tx};
			}
		}
	  },
	  prodHasFriendBenefic(){
		for (let i=0;i<this.cartEntries.length;i++){
			let product = this.cartEntries[i];
			//if at least one product supports beneficiary, return true
			if (Array.isArray(product.benefits.boosts) && product.benefits.boosts.length>0){
				let maxCount = product.benefits.boosts.length;
				for (let i=0;i<maxCount;i++){
					if (product.benefits.boosts[i].boost_beneficiary == 'friend'){
						return true;
					}
				}
			}
		}
		return false;
	  },
	  async activateGadget() {
		
		//clear error
		this.errorProceed = '';
		
		this.buyAttempt = true;
		this.buyInProgress = true;
		let appendFriend = null;
		//need to make sure we have a target friend set in special boost types
		if (this.prodHasFriendBenefic()){
			if (this.$refs["friend"].value == ''){
			  this.errorProceed = this.$t('Provide_friend_name_receive_boost');
			  return;
			}
			if (this.$refs["friend"].value.replace('@','') == this.user.account.name){
			  this.errorProceed = this.$t('Cannot_use_same_account');
			  return;
			}
			appendFriend = this.$refs["friend"].value;
		}
		
		//construct product list param
		let prod_list_str = '';
		for (let i=0;i<this.cartEntries.length;i++){
			prod_list_str+=this.cartEntries[i]._id;
			if (i<this.cartEntries.length-1){
				prod_list_str+='-';
			}
		}
		
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: "{\"transaction\": \"activate-gadget\" , \"gadget\": \""+prod_list_str+"\"}"
		};
		if (appendFriend){
			cstm_params['json'] = "{\"transaction\": \"activate-gadget\" , \"gadget\": \""+prod_list_str+"\", \"benefic\": \""+appendFriend+"\"}";
		}
		let bcastRes;
		let op_name = 'custom_json';
		let operation = [ 
		   [op_name, cstm_params]
		];
		
		let res = await this.processTrxFunc(op_name, cstm_params);
		//console.log(res);
		if (res.success){
			bcastRes = res.trx;
		}else{
			console.log(err);
		}
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let url_string = process.env.actiAppUrl + 'activateMultiGadget/'
							+ this.user.account.name + '/'
							+ prod_list_str + '/'
							+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain;
		//console.log('prodHasFriendBenefic');
		if (appendFriend){
			//console.log(this.$refs["friend"].value);
			url_string += '/' + appendFriend;
		}
		
		if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) || 
			(localStorage.getItem('acti_login_method') == 'hiveauth')){			
			
			let op_json = JSON.stringify(operation)
			url_string = new URL( process.env.actiAppUrl + 'activateMultiGadgetKeychain/'
							+ this.user.account.name + '/'
							+ prod_list_str + '/'
							//+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain + '/'
							+ (appendFriend? (appendFriend):'')
							+ '?operation='+op_json);
		}

		
		let	url = new URL( url_string );
		
		//console.log(url);
		//connect with our service to process buy order
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.error){
				this.errorProceed = outcome;
				console.error(outcome);
			}else{
				//update product status
				//this.checkProductBought();
				//notify parent to refresh products

				//this.$store.dispatch('fetchProducts')

				this.$emit('refresh-tickets-multi');
				
				//display proper success message
				this.errorProceed = this.$t('all_gadgets_activated');
				
				this.$notify({
				  group: 'success',
				  text: this.$t('all_gadgets_activated'),
				  position: 'top center'
				})
				
				//clear cart
				this.$store.commit('clearCart');
				
				//reset purchase status
				//this.purchaseSuccess = false;
				
				this.$store.commit('setPurchaseSuccess', false);
				
				//close modal
				this.$refs['closeCartMod'].click();
			}
			//this.checkingFunds = false;
			//this.resultReturned = true;
		
		}catch(err){
			console.error(err);
			//this.checkingFunds = false;
		}
		this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  
	  async buyNow() {
		this.buyAttempt = true;
		this.buyInProgress = true;
		this.errorProceed = '';
		
		//making sure user is logged in 
		if (!this.user){
		  this.errorProceed = this.$t('need_login_signup_notice_vote');
		  return;
		}
		
		//check if this is a game gadget and if reqts have been met
		/*if (this.product.type == 'ingame'){
			if (!this.allReqtsFilled){
			  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
			  return;
			}
			
			if (this.product.count < 1){
			  this.errorProceed = this.$t('cannot_buy_none_available');
			  return;
			}
		}*/
		//first check if user has enough AFIT
		if (this.user){
		  if (this.userTokens < this.product_price_afit){
			this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here') ;
			//console.log(this.errorProceed );
			return;
		  }
		}
		//show user confirm for purchasing product/service
		
		/*let user_prmpt =  this.$t('purchase_confirm_part1') + this.product.name + ' ' + this.product.type + '.\n' 
					+ this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n' 
					+ this.$t('Proceed') + '?';
		if (this.product.type == 'ingame'){
			user_prmpt =  this.$t('purchase_confirm_part1') + this.product.name + ' Level ' + this.product.level + ' ' + this.product.type + ' virtual gadget' + '.\n' 
					+ this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n' 
					+ this.$t('Proceed') + '?';
		}
		let decis = confirm(user_prmpt);
		if (!decis){
			this.buyInProgress = false;
			return;
		}*/
		
		//construct product list param
		let prod_list_str = '';
		for (let i=0;i<this.cartEntries.length;i++){
			prod_list_str+=this.cartEntries[i]._id;
			if (i<this.cartEntries.length-1){
				prod_list_str+='-';
			}
		}
		
		//broadcast trx to blockchain
		/*let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: "{ \"buy_product\": \""+prod_list_str+"\"}"
		  };*/
		
		//if (this.product.type == 'ingame'){
			//different tx
		let cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'actifit',
				json: "{\"transaction\": \"buy-gadget\" , \"gadget\": \""+prod_list_str+"\"}"
			  };
		//}
		let bcastRes;
		let op_name = 'custom_json';
		let operation = [ 
		   [op_name, cstm_params]
		];
		
		let res = await this.processTrxFunc(op_name, cstm_params);
		//console.log(res);
		if (res.success){
			bcastRes = res.trx;
		}else{
			console.log(err);
		}
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		
		let url = new URL( process.env.actiAppUrl + 'buyMultiGadget/'
						+ this.user.account.name + '/'
						+ prod_list_str + '/'
						+ bcastRes.ref_block_num + '/'
						+ bcastRes.id + '/'
						+ cur_bchain);
						
		if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) || 
			(localStorage.getItem('acti_login_method') == 'hiveauth')){			
			
			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'buyMultiGadgetKeychain/'
							+ this.user.account.name + '/'
							+ prod_list_str + '/'
							//+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain + '?operation='+op_json);
		}				
	
		//console.log(url);
		//connect with our service to process buy order
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.error){
				this.errorProceed = outcome;
				console.error(outcome);
			}else{
				//update user token count
				this.$store.dispatch('fetchUserTokens')
				
				//display proper success message
				this.errorProceed = this.$t('purchase_success_ingame_multi');
				
				this.$emit('refresh-tickets-multi');
					
				this.$notify({
				  group: 'success',
				  text: this.$t('purchase_success_ingame_multi'),
				  position: 'top center'
				})
				console.log('purchaseSuccess');
				//this.purchaseSuccess = true;
				this.$store.commit('setPurchaseSuccess', true);
				//console.log(this.purchaseSuccess);
				//}
			}
			//this.checkingFunds = false;
			//this.resultReturned = true;
		
		}catch(err){
			console.error(err);
			//this.checkingFunds = false;
		}
		this.buyInProgress = false;
	  },
	  async buyNowHive () {
		//check if this is a game gadget and if reqts have been met
		this.buyAttempt = true;
		//this.buyInProgress = true;
		this.errorProceed = '';
		
		/*if (this.product.type == 'ingame'){
			if (!this.allReqtsFilled){
			  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
			  return;
			}
			
			if (this.product.count < 1){
			  this.errorProceed = this.$t('cannot_buy_none_available');
			  return;
			}
		}*/
		this.buyHiveExpand = !this.buyHiveExpand;
	  },
	  async proceedBuyNowHive (){
		try{
			this.buyAttempt = true;
			this.buyInProgress = true;
			this.errorProceed = '';
			console.log('proceedBuyNowHive');
			//making sure user is logged in 
			if (!this.user){
			  this.errorProceed = this.$t('need_login_signup_notice_vote');
			  return;
			}
			
			//check if this is a game gadget and if reqts have been met
			/*if (this.product.type == 'ingame'){
				if (!this.allReqtsFilled){
				  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
				  return;
				}
				
				if (this.product.count < 1){
				  this.errorProceed = this.$t('cannot_buy_none_available');
				  return;
				}
			}*/
			//check if active key was provided 
			//console.log(this.$refs);
			if (!this.isKeychainActive && !this.isHiveauthActive && this.userActvKey == ''){
			  this.errorProceed = this.$t('all_fields_required');
			  return;
			}
			
			//proceed with payment
			//let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let payAmount = parseFloat(this.product_price_afit * this.afitPrice.afitHiveLastPrice).toFixed(3);
			let memo = 'buy-gadget:';
			//loop through gadgets and construct proper memo
			for (let i=0;i<this.cartEntries.length;i++){
				memo+=this.cartEntries[i]._id;
				if (i<this.cartEntries.length-1){
					memo+='-';
				}
			}
			console.log(memo);
			let attempt = 1;
			/*let res = await hive.broadcast.transferAsync(this.userActvKey, this.user.account.name, process.env.actifitMarketBuy, payAmount + ' ' + 'HIVE', memo).then(
				res => this.confirmCompletion('transfer', payAmount, res, attempt)).catch(err=> this.errorCompletion(err));
			*/
			//proceed with payment
			//let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			//console.log('prior to call');
			
			let accToken = localStorage.getItem('access_token')
			
			let cstm_params = {
			  "from": this.user.account.name,
			  "to": process.env.actifitMarketBuy,
			  "amount": payAmount + ' ' + 'HIVE',
			  "memo": memo
			};
			
			//let res = await this.processTrxFunc('transfer', cstm_params, this.cur_bchain);
			let op_name = 'transfer';
			let operation = [ 
			   ['transfer', cstm_params]
			];
			
			
			if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)||
				(localStorage.getItem('acti_login_method') == 'hiveauth')){
				
				let bcastRes;
				let res = await this.processTrxFunc(op_name, cstm_params, true);//last param to use Active key instead of Posting
				console.log(res);
				if (res.success){
					bcastRes = res.trx;
					let op_json = JSON.stringify(operation)
					this.confirmCompletion('transfer', payAmount, bcastRes, attempt, op_json);
					
				}else{
					console.log(err);
				}
			}else{
				let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
				
				let url = new URL(process.env.actiAppUrl + 'performTrxPost/?user='+this.user.account.name+'&bchain='+cur_bchain);
				
				let reqHeads = new Headers({
				  'Content-Type': 'application/json',
				  'x-acti-token': 'Bearer ' + accToken,
				});
				let res = await fetch(url, {
					method: 'POST',
					headers: reqHeads,
					body: JSON.stringify({'operation': JSON.stringify(operation), 'active': this.userActvKey})
				});
				let outcome = await res.json();
				
				console.log(outcome);
				if (outcome.success && outcome.trx){
					let op_json = JSON.stringify(operation);
					this.confirmCompletion('transfer', payAmount, outcome.trx.tx, attempt);
					console.log('after call');
					//this.$router.push('/login');
				}else{
					this.errorCompletion(outcome.error);
					
				}
			}
		}catch(excp){
			console.log(excp);
		}
	  },
	  async errorCompletion(res){
		//console.log(res);
		let err_details = res;//JSON.parse();
		this.errorProceed = err_details.cause.message;
		//this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  async confirmCompletion (type, amount, res, attempt, op_json){
		if (res.ref_block_num || res.id){
			//console.log (res);
			
			
			//only support HIVE
			let cur_bchain = 'HIVE';//(localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			let url = '';//new URL(process.env.actiAppUrl + 'processBuyOrderHive/?user='+this.user.account.name+'&product_id='+this.product._id);
			let memo = '';
			for (let i=0;i<this.cartEntries.length;i++){
				memo+=this.cartEntries[i]._id;
				if (i<this.cartEntries.length-1){
					memo+='-';
				}
			}
			
			let tgtNode = process.env.actiAppUrl;
			//if (this.product.type == 'ingame'){
			if (attempt != 1){
				tgtNode = process.env.actiAppBackUrl;
			}
			
			url = new URL( tgtNode + 'buyMultiGadgetHive/'
							+ this.user.account.name + '/'
							+ memo + '/'
							+ res.ref_block_num + '/'
							+ res.id + '/'
							+ cur_bchain);
							
			if (this.isKeychainActive || this.isHiveauthActive){
				url = new URL( tgtNode + 'buyMultiGadgetHiveKeychain/'
							+ this.user.account.name + '/'
							+ memo + '/'
							//+ res.ref_block_num + '/'
							+ res.id + '/'
							+ cur_bchain + '?operation='+op_json);
			}

			//}
			//console.log(url);
			//connect with our service to process buy order
			try{
				let reslt = await fetch(url);
				let outcome = await reslt.json();
				if (outcome.error){
					if (attempt == 1){
						//try again with another API node
						console.log('>>>>try again');
						this.confirmCompletion(type, amount, res, attempt + 1, op_json);
					}else{
						this.errorProceed = outcome;
						console.error(outcome);
					}
				}else{
										
					//display proper success message
					this.errorProceed = this.$t('purchase_success_ingame_multi');
										
					this.$emit('refresh-tickets-multi');
					
					this.$notify({
					  group: 'success',
					  text: this.$t('purchase_success_ingame_multi'),
					  position: 'top center'
					})
					
					console.log('purchaseSuccess');
					//this.purchaseSuccess = true;
					this.$store.commit('setPurchaseSuccess', true);
					//console.log(this.purchaseSuccess);
				
				}
				//this.checkingFunds = false;
				//this.resultReturned = true;
			
			}catch(err){
				console.error(err);
				if (attempt == 1){
					//try again with another API node
					console.log('>>>>try again');
					this.confirmCompletion(type, amount, res, attempt + 1, op_json);
				}else{
					this.errorProceed = outcome;
					console.error(outcome);
				}
				//this.checkingFunds = false;
			}
			
			
			
			//also start validation and gadget lock process
			/*let url = new URL(process.env.actiAppUrl + 'confirmPaymentGadget/'+'?bchain=' + this.cur_bchain);
			//compile all needed data and send it along the request for processing
			let params = {
				from: this.user.account.name,
				
			}
			Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
			try{
				let res = await fetch(url);
				let outcome = await res.json();
				//update user data according to result
				this.fetchUserData();
			}catch(err){
				console.error(err);
			}*/
			
		}else{
			this.errorProceed = res.error.message;
		}
		this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  
	  
    },
	async mounted () {	  
		  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  
	  hive.api.setOptions({ url: process.env.hiveApiNode });
	}
  }
</script>
<style>
.avatar-small{
	border-width: 3px!important;
}
.pro-card-small{
	width: 45px;
    height: 45px;
}
</style>
