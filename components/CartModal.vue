<template>
  <div class="modal fade" id="cartModal" tabindex="-1" ref="cartModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content cart-modal">
        <div class="modal-header">
          <h5 class="modal-title" style="color: rgb(231,76,60);">Checkout <i class="fas fa-shopping-bag"></i></h5>
          <button type="button" class="close" id="closeCartMod" ref="closeCartMod" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div class="modal-body" v-if="cartEntries.length > 0">
          <div class="cart-items">
            <div v-for="(product, index) in cartEntries" :key="index" class="cart-item">
              <div class="item-image">
                <div :class="'avatar-'+product.level" class="avatar pro-card-small" 
                     :style="'background-image: url(img/gadgets/' + product.image + ');'"></div>
              </div>
              <div class="item-details">
                <h5 class="item-name">{{product.name}} - Level {{product.level}}</h5>
                <div class="item-price">
                  {{numberFormat(getProductPrice(product), 2)}} AFIT
                  <span class="hive-price" v-if="afitPrice">
                    ({{numberFormat(getProductPrice(product) * afitPrice.afitHiveLastPrice, 3)}} HIVE)
                  </span>
                </div>
              </div>
              <button class="item-remove" @click.prevent="removeProduct(product)">
                <i class="fas fa-minus-square"></i>
              </button>
            </div>
          </div>
          
          <div class="cart-summary">
            <div class="summary-row">
              <span class="summary-label">{{ $t('Subtotal') }}:</span>
              <span class="summary-value">{{numberFormat(this.product_price_afit, 2)}} AFIT</span>
            </div>
            <div class="summary-row" v-if="afitPrice">
              <span class="summary-label">{{ $t('Subtotal') }}:</span>
              <span class="summary-value">{{numberFormat(this.product_price_afit * this.afitPrice.afitHiveLastPrice, 3)}} HIVE</span>
            </div>
          </div>
          
          <div v-if="!purchaseSuccess" class="payment-options">
            <div class="option-group">
              <button class="btn-pay btn-pay-afit" @click.prevent="buyNow()">
                <span class="pay-amount">{{numberFormat(this.product_price_afit, 2)}} AFIT</span>
                <span class="pay-method">
                  <img class="token-logo" src="/img/actifit_logo.png">
                  {{ $t('Pay_with_AFIT') }}
                </span>
              </button>
              
              <button class="btn-pay btn-pay-hive" @click.prevent="buyNowHive()">
                <span class="pay-amount">{{numberFormat(this.product_price_afit * this.afitPrice.afitHiveLastPrice, 3)}} HIVE</span>
                <span class="pay-method">
                  <img class="token-logo" src="/img/HIVE.png">
                  {{ $t('Pay_with_HIVE') }}
                </span>
              </button>
            </div>
            
            <div class="hive-key-input" v-if="buyHiveExpand && !isKeychainActive && !isHiveauthActive">
              <label for="active-key">{{ $t('Active_Key') }} *</label>
              <input type="password" id="active-key" name="active-key" ref="active-key" 
                     class="form-control" v-model="userActvKey" placeholder="Enter your active key">
            </div>
            
            <div class="proceed-btn" v-if="buyHiveExpand">
              <button v-on:click="proceedBuyNowHive()" v-if="this.userTokens >= this.minAfitBuyTicket" 
                      class="btn-proceed">
                {{ $t('Proceed') }}
              </button>
              <button data-toggle="modal" v-else :data-target="'#buyOptionsModalCart'" 
                      class="btn-proceed">
                {{ $t('Proceed') }}
              </button>
            </div>
          </div>
          
          <div v-else class="activation-section">
            <div class="friend-benefic" v-if="prodHasFriendBenefic()">
              <label for="friend">{{$t('Benef_friend')}}:</label>
              <input type="text" name="friend" id="friend" ref="friend" 
                     class="form-control" placeholder="Enter friend's username">
            </div>
            
            <button class="btn-activate" @click.prevent="activateGadget()">
              <i class="fas fa-check"></i>
              {{ $t('activate_all_gadgets') }}
            </button>
          </div>
          
          <div class="status-messages">
            <div v-if="buyInProgress && errorProceed==''" class="loading">
              <i class="fas fa-spinner fa-spin"></i>
              {{ $t('Processing') }}...
            </div>
            
            <div v-if="errorProceed!=''" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span v-html="errorProceed"></span>
            </div>
          </div>
        </div>

        <div class="modal-body empty-cart" v-else>
          <div class="empty-state">
            <i class="fas fa-shopping-cart"></i>
            <p>{{ $t('Cart_empty') }}</p>
            <router-link to="/marketplace" class="btn-browse">
              {{ $t('Browse_products') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <BuyOptionsModal id="buyOptionsModalCart" ref="buyOptionsModalCart" 
                     containerID="#buyOptionsModalCart" :modalTitle="$t('Buy_product')" 
                     :modalText="$t('buy_now_modal_desc').replace('_AMNT_', minAfitBuyTicket)" 
                     @proceed-purchase="proceedBuyNowHive"/>
    
    <client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
    
    <LoginModal v-if="showModal" @close="showModal = false" />
  </div>
</template>
<script>
  import LoginModal from '~/components/LoginModal'
  import { mapGetters } from 'vuex'
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import BuyOptionsModal from '~/components/BuyOptionsModal'

  export default {
     props: ['afitPrice'],
	data () {
      return {
		showModal: false,
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
		BuyOptionsModal,
		LoginModal,
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
	  showModalFunc() {
        this.$nextTick(() => {
          this.showModal = true;
          if ($ && typeof $.fn.modal === 'function') {
            $('#loginModal').modal('show');
          }
        });
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
<style lang="scss">
.cart-modal {
  border-radius: 16px;
  overflow: hidden;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  
  .modal-header {
    background-color: #e74c3c;
    color: white;
    border-bottom: none;
    padding: 20px;
    
    .modal-title {
      font-weight: 600;
      font-size: 1.25rem;
    }
    
    .close {
      color: white;
      opacity: 0.8;
      text-shadow: none;
      font-size: 1.5rem;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .modal-body {
    padding: 20px;
    
    &.empty-cart {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }
  }
}

.cart-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-image {
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    background-size: contain;
    border: 2px solid #e74c3c;
  }
}

.item-details {
  flex: 1;
  padding: 0 15px;
  
  .item-name {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 5px 0;
    color: #333;
  }
  
  .item-price {
    font-size: 0.85rem;
    color: #666;
    
    .hive-price {
      font-size: 0.8rem;
      color: #999;
    }
  }
}

.item-remove {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: darken(#e74c3c, 10%);
  }
}

.cart-summary {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .summary-label {
      font-weight: 600;
      color: #666;
    }
    
    .summary-value {
      font-weight: 700;
      color: #e74c3c;
    }
  }
}

.payment-options {
  .option-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    
    @media (max-width: 576px) {
      flex-direction: column;
    }
  }
  
  .btn-pay {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    
    .pay-amount {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .pay-method {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .token-logo {
      width: 20px;
      height: 20px;
      margin-right: 5px;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
  }
  
  .btn-pay-afit {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    border: 1px solid rgba(231, 76, 60, 0.3);

  }
  
  .btn-pay-hive {
    color: #e74c3c;
    border: 1px solid rgba(231, 76, 60, 0.3);
    background: rgba(231, 76, 60, 0.1);
  }
  
  .hive-key-input {
    margin-top: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #666;
    }
    
    input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      
      &:focus {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
        outline: none;
      }
    }
  }
  
  .proceed-btn {
    margin-top: 15px;
    
    .btn-proceed {
      width: 100%;
      padding: 12px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: darken(#e74c3c, 10%);
      }
      
      &:disabled {
        background: #aaa;
        cursor: not-allowed;
      }
    }
  }
}

.activation-section {
  text-align: center;
  
  .friend-benefic {
    margin-bottom: 20px;
    text-align: left;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #666;
    }
    
    input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;
      
      &:focus {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
        outline: none;
      }
    }
  }
  
  .btn-activate {
    padding: 12px 25px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    i {
      margin-right: 8px;
    }
    
    &:hover {
      background: darken(#e74c3c, 10%);
    }
  }
}

.status-messages {
  margin-top: 20px;
  
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 0.9rem;
    
    i {
      margin-right: 8px;
    }
  }
  
  .error-message {
    padding: 12px;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 8px;
    color: #e74c3c;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 8px;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 30px 0;
  
  i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 15px;
  }
  
  p {
    font-size: 1rem;
    color: #666;
    margin-bottom: 20px;
  }
  
  .btn-browse {
    padding: 10px 20px;
    background: #e74c3c;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      background: darken(#e74c3c, 10%);
    }
  }
}

.avatar-small {
  border-width: 3px !important;
}

.pro-card-small {
  width: 45px;
  height: 45px;
}

.token-logo-sm {
  width: 16px;
  height: 16px;
}
</style>