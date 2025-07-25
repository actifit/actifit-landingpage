
<template>
  <div class="modal fade" id="cartModal" tabindex="-1" ref="cartModal">
    <div class="modal-dialog" role="document">
      <div class="cart-modal-container">
        <div class="cart-modal-header">
          <h5 class="cart-modal-title">Checkout <i class="fas fa-shopping-bag"></i></h5>
          <button type="button" class="cart-modal-close" data-dismiss="modal" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="cart-modal-body" v-if="cartEntries.length > 0">
          <div class="cart-items-list">
            <div v-for="(product, index) in cartEntries" :key="index" class="cart-item-entry">
              <div class="cart-item-img">
                <div class="cart-item-avatar" 
                     :style="product.image.startsWith('http') ? 
                       'background-image: url(' + product.image + ')' : 
                       'background-image: url(/img/gadgets/' + product.image + ')'"></div>
              </div>
              <div class="cart-item-info">
                <h5 class="cart-item-name">{{product.name}} - {{ $t('Level') }} {{product.level}}</h5>
                <div class="cart-item-price">
                  {{numberFormat(getProductPrice(product), 2)}} <img class="token-logo-sm" src="/img/actifit_logo.png">
                  <span class="cart-item-hive-price" v-if="afitPrice">
                    ({{numberFormat(getProductPrice(product) * afitPrice.afitHiveLastPrice, 3)}} <img class="token-logo-sm" src="/img/HIVE.png">)
                  </span>
                </div>
              </div>
              <button class="cart-item-remove-btn" @click.prevent="removeProduct(product)">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          
<div v-if="!purchaseSuccess" class="cart-payment-section">

  <!-- For digital products (cart functionality) -->
  <template>
    <div class="dual-price-layout">
      <div class="dual-price-row">
        <div class="price-pair">
		<div class="price-circle">
          {{numberFormat(this.product_price_afit, 2)}} <img class="token-logo-sm" src="/img/actifit_logo.png">
		</div>
		<button 
          :class="['btn-buy', { 'btn-buy-disabled': buyButtonDisabled }]"
          :disabled="buyButtonDisabled"
          @click.prevent="buyNow()">Buy
        </button>
	  </div>
		<div class="price-pair">
			<div class="price-circle hive">
          {{numberFormat(this.product_price_afit * this.afitPrice.afitHiveLastPrice, 3)}} <img class="token-logo-sm" src="/img/HIVE.png">
			</div>
        <button 
          :class="['btn-buy-hive','hv-btn', { 'btn-buy-disabled': buyButtonDisabled }]"
          :disabled="buyButtonDisabled"
          @click.prevent="buyNowHive()">
          Buy
        </button>
		</div>
    </div>
	</div>
</template>


  <!-- Active key input for HIVE purchases -->
  <div class="cart-hive-key-input" v-if="buyHiveExpand && !isKeychainActive && !isHiveauthActive">
    <label for="active-key">{{ $t('Active_Key') }} *</label>
    <input type="password" id="active-key" name="active-key" ref="active-key" 
           class="form-control" v-model="userActvKey" :placeholder="$t('Enter_your_active_key')">
  </div>

  <div class="cart-proceed-section" v-if="buyHiveExpand">
    <button v-on:click="proceedBuyNowHive()" v-if="this.userTokens >= this.minAfitBuyTicket" 
            class="btn-buy">
      {{ $t('Proceed') }}
    </button>
    <button data-toggle="modal" v-else :data-target="'#buyOptionsModalCart'" 
            class="btn-buy">
      {{ $t('Proceed') }}
    </button>
  </div>
</div>    
          <div v-else class="cart-activation-area">
            <div class="cart-friend-input" v-if="prodHasFriendBenefic()">
              <label for="friend">{{$t('Benef_friend')}}:</label>
              <input type="text" name="friend" id="friend" ref="friend" 
                     class="form-control" :placeholder="$t('Enter_friends_username')">
            </div>
            
            <button class="btn-activate" @click.prevent="activateGadget()">
              <i class="fas fa-check"></i>
              {{ $t('activate_all_gadgets') }}
            </button>
          </div>
          
          <div class="cart-status-messages">
            <div v-if="buyInProgress && errorProceed==''" class="cart-loading-indicator">
              <i class="fas fa-spinner fa-spin"></i>
              {{ $t('Processing') }}...
            </div>
            
            <div v-if="errorProceed!=''" class="cart-error-message">
              <i class="fas fa-exclamation-circle"></i>
              <span v-html="errorProceed"></span>
            </div>
          </div>
        </div>

        <div class="cart-modal-body cart-empty-state" v-else>
          <div class="cart-empty-view">
            <i class="fas fa-shopping-cart"></i>
            <p>{{ $t('Cart_empty') }}</p>
            <router-link to="/marketplace" class="btn-buy">
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
	    buyButtonDisabled() {
    if (!this.user) return true;
    if (this.cartEntries.length === 0) return true;
    return false;
  },
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
	  hasPhysicalProducts() {
    return this.cartEntries.some(item => item.type === 'real');
  },
  physicalProductPrice() {
    const product = this.cartEntries.find(item => item.type === 'real');
    if (!product) return { afit: 0, hive: 0 };
    
    let afitPrice = 0;
    let hivePrice = 0;
    
    product.price.forEach(entry => {
      if (entry.currency === 'AFIT') afitPrice = entry.price;
      if (entry.currency === 'HIVE') hivePrice = entry.price;
    });
    
    return { afit: afitPrice, hive: hivePrice };
  },
    methods: {
	  	  /**
       * Formats numbers with commas and dots.
       *
       * @param number
	   * @param precision
       * @returns {string}
       */
	    buyPhysicalProduct(currency) {
    if (currency === 'afit') {
      this.buyNow();
    } else {
      this.buyNowHive();
    }
  },
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
  this.errorProceed = '';
  this.buyAttempt = true;
  this.buyInProgress = true;
  
  try {
    let appendFriend = null;
    if (this.prodHasFriendBenefic()) {
      if (this.$refs["friend"].value == '') {
        throw new Error(this.$t('Provide_friend_name_receive_boost'));
      }
      if (this.$refs["friend"].value.replace('@','') == this.user.account.name) {
        throw new Error(this.$t('Cannot_use_same_account'));
      }
      appendFriend = this.$refs["friend"].value;
    }

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
    
    if (appendFriend) {
      cstm_params['json'] = "{\"transaction\": \"activate-gadget\" , \"gadget\": \""+prod_list_str+"\", \"benefic\": \""+appendFriend+"\"}";
    }

    let res = await this.processTrxFunc('custom_json', cstm_params);
    if (!res.success) throw new Error('Transaction failed');

    let url = new URL(process.env.actiAppUrl + 'activateMultiGadget/'
      + this.user.account.name + '/'
      + prod_list_str + '/'
      + res.trx.ref_block_num + '/'
      + res.trx.id + '/'
      + (localStorage.getItem('cur_bchain') || 'HIVE'));

    if (appendFriend) {
      url = new URL(url + '/' + appendFriend);
    }

    if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) || 
        (localStorage.getItem('acti_login_method') == 'hiveauth')) {
      let op_json = JSON.stringify([['custom_json', cstm_params]]);
      url = new URL(process.env.actiAppUrl + 'activateMultiGadgetKeychain/'
        + this.user.account.name + '/'
        + prod_list_str + '/'
        + res.trx.id + '/'
        + (localStorage.getItem('cur_bchain') || 'HIVE') + '/'
        + (appendFriend || '') + '?operation='+op_json);
    }

    let outcome = await fetch(url).then(res => res.json());
    
    if (outcome.error) {
      throw new Error(outcome.error);
    } else {
      // Clear the cart after successful activation
      this.$store.commit('clearCart');
      
      this.$emit('refresh-tickets-multi');
      this.errorProceed = this.$t('all_gadgets_activated');
      
      this.$notify({
        group: 'success',
        text: this.$t('all_gadgets_activated'),
        position: 'top center'
      });
      
      this.$store.commit('setPurchaseSuccess', false);
      this.$refs['closeCartMod'].click();
    }
  } catch(err) {
    console.error(err);
    this.errorProceed = err.message;
  } finally {
    this.buyInProgress = false;
  }
},
	  
	  async buyNow() {
  this.buyAttempt = true;
  this.buyInProgress = true;
  this.errorProceed = '';

  try {
    // Construct product list param
    let prod_list_str = '';
    for (let i=0;i<this.cartEntries.length;i++){
      prod_list_str+=this.cartEntries[i]._id;
      if (i<this.cartEntries.length-1){
        prod_list_str+='-';
      }
    }

    // Broadcast transaction
    let cstm_params = {
      required_auths: [],
      required_posting_auths: [this.user.account.name],
      id: 'actifit',
      json: "{\"transaction\": \"buy-gadget\" , \"gadget\": \""+prod_list_str+"\"}"
    };
    
    let bcastRes;
    let op_name = 'custom_json';
    let operation = [ 
      [op_name, cstm_params]
    ];
    
    let res = await this.processTrxFunc(op_name, cstm_params);
    if (res.success){
      bcastRes = res.trx;
    } else {
      throw new Error('Transaction failed');
    }

    let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
    let url = new URL( process.env.actiAppUrl + 'buyMultiGadget/'
      + this.user.account.name + '/'
      + prod_list_str + '/'
      + bcastRes.ref_block_num + '/'
      + bcastRes.id + '/'
      + cur_bchain);

    if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) || 
      (localStorage.getItem('acti_login_method') == 'hiveauth')) {            
      let op_json = JSON.stringify(operation)
      url = new URL( process.env.actiAppUrl + 'buyMultiGadgetKeychain/'
        + this.user.account.name + '/'
        + prod_list_str + '/'
        + bcastRes.id + '/'
        + cur_bchain + '?operation='+op_json);
    }

    let reslt = await fetch(url);
    let outcome = await reslt.json();
    
    if (outcome.error){
      this.errorProceed = outcome;
      console.error(outcome);
    } else {
      // Clear the cart after successful purchase
      this.$store.commit('clearCart');
      
      // Update user token count
      this.$store.dispatch('fetchUserTokens');
      
      // Display success message
      this.errorProceed = this.$t('purchase_success_ingame_multi');
      
      this.$emit('refresh-tickets-multi');
      
      this.$notify({
        group: 'success',
        text: this.$t('purchase_success_ingame_multi'),
        position: 'top center'
      });
      
      this.$store.commit('setPurchaseSuccess', true);
    }
  } catch(err) {
    console.error(err);
    this.errorProceed = this.$t('transaction_failed');
  } finally {
    this.buyInProgress = false;
  }
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
	  async proceedBuyNowHive() {
  try {
    this.buyAttempt = true;
    this.buyInProgress = true;
    this.errorProceed = '';
    
    // ... existing validation code ...

    // Proceed with payment
    let payAmount = parseFloat(this.product_price_afit * this.afitPrice.afitHiveLastPrice).toFixed(3);
    let memo = 'buy-gadget:';
    for (let i=0;i<this.cartEntries.length;i++){
      memo+=this.cartEntries[i]._id;
      if (i<this.cartEntries.length-1){
        memo+='-';
      }
    }

    let cstm_params = {
      "from": this.user.account.name,
      "to": process.env.actifitMarketBuy,
      "amount": payAmount + ' ' + 'HIVE',
      "memo": memo
    };

    let op_name = 'transfer';
    let operation = [ 
      [op_name, cstm_params]
    ];

    let res = await this.processTrxFunc(op_name, cstm_params, true);
    if (!res.success) throw new Error('Transaction failed');

    let url = new URL(process.env.actiAppUrl + 'buyMultiGadgetHive/'
      + this.user.account.name + '/'
      + memo.split(':')[1] + '/'
      + res.trx.ref_block_num + '/'
      + res.trx.id + '/'
      + 'HIVE');

    if ((this.isKeychainActive || this.isHiveauthActive)) {
      let op_json = JSON.stringify(operation)
      url = new URL(process.env.actiAppUrl + 'buyMultiGadgetHiveKeychain/'
        + this.user.account.name + '/'
        + memo.split(':')[1] + '/'
        + res.trx.id + '/'
        + 'HIVE' + '?operation='+op_json);
    }

    let reslt = await fetch(url);
    let outcome = await reslt.json();
    
    if (outcome.error) {
      throw new Error(outcome.error);
    } else {
      // Clear the cart after successful purchase
      this.$store.commit('clearCart');
      
      this.errorProceed = this.$t('purchase_success_ingame_multi');
      this.$emit('refresh-tickets-multi');
      
      this.$notify({
        group: 'success',
        text: this.$t('purchase_success_ingame_multi'),
        position: 'top center'
      });
      
      this.$store.commit('setPurchaseSuccess', true);
    }
  } catch(err) {
    console.error(err);
    this.errorProceed = err.message || this.$t('transaction_failed');
  } finally {
    this.buyInProgress = false;
  }
},
	  async errorCompletion(res){
		//console.log(res);
		let err_details = res;//JSON.parse();
		this.errorProceed = err_details.cause.message;
		//this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	async confirmCompletion(type, amount, res, attempt, afitAmnt, op_json) {
  console.log(res)
  if (res.ref_block_num || res.id) {
    // ... existing code ...

    if (type == 'buyAFITHive') {
      // ... existing AFIT purchase handling ...
    } else {
      // For all other purchases (including books)
      this.productBought = true; // Add this line
      
      //update product status
      this.checkProductBought();
      this.$store.dispatch('fetchProducts')

      if (this.product.type == 'service') {
        // ... existing service handling ...
      } else if (this.product.type == 'ebook') {
        //display proper success message
        this.errorProceed = this.$t('purchase_success_ebook_part1') + ' ' + this.product.name + ' '
          + this.$t('By') + ' ' + this.product.provider_name + '.<br/>';
        this.firstDownloadHref = process.env.actiAppUrl
          + 'downEbook/'
          + '?user=' + this.user.account.name
          + '&product_id=' + this.product._id
          + '&access_token=' + outcome.access_token;
      } else if (this.product.type == 'ingame') {
        // ... existing ingame handling ...
      }
    }
  }
  // ... rest of existing code ...
}},
	async mounted () {	  
		  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  
	  hive.api.setOptions({ url: process.env.hiveApiNode });
	}
  }
</script>
<style lang="scss">
.cart-modal-container {
  background: var(--color-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 24px var(--color-shadow);
}

.cart-modal-header {
  background-color: var(--color-primary);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  
  .cart-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    
    i {
      margin-left: 8px;
    }
  }
  
  .cart-modal-close {
    background: transparent;
    border: none;
    color: white;
    font-size: 1.25rem;
    opacity: 0.8;
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
}

.cart-modal-body {
  padding: 20px;
  
  &.cart-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    text-align: center;
  }
}

.cart-items-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-bg-light);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 3px;
  }
}

.cart-item-entry {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
}

.cart-item-img {
  margin-right: 15px;
  
  .cart-item-avatar {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border: 2px solid var(--color-primary);
    background-color: white;
  }
}

.cart-item-info {
  flex: 1;
  
  .cart-item-name {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0 0 5px 0;
    color: var(--color-text);
  }
  
  .cart-item-price {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.85rem;
    color: var(--color-text-light);
    
    .cart-item-hive-price {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: 8px;
      font-size: 0.8rem;
      color: var(--color-text-light);
    }
  }
}

.cart-item-remove-btn {
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
  margin-left: 10px;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
}

.cart-payment-section {
  margin-top: 20px;
  
  .single-price-layout,
  .dual-price-layout {
    margin-bottom: 15px;
  }
}

.cart-hive-key-input {
  margin-top: 15px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text-light);
  }
  
  input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-bg-light);
    color: var(--color-text);
    font-size: 0.9rem;
    transition: all 0.3s;
    
    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
      outline: none;
    }
  }
}

.cart-proceed-section {
  margin-top: 15px;
  
  button {
    width: 100%;
  }
}

.cart-activation-area {
  margin-top: 20px;
  text-align: center;
  
  .cart-friend-input {
    margin-bottom: 20px;
    text-align: left;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--color-text-light);
    }
    
    input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-bg-light);
      color: var(--color-text);
      font-size: 0.9rem;
      transition: all 0.3s;
      
      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
        outline: none;
      }
    }
  }
}

.cart-status-messages {
  margin-top: 20px;
  
  .cart-loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--color-primary);
    font-size: 0.9rem;
    padding: 10px;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 8px;
  }
  
  .cart-error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 8px;
    color: var(--color-danger);
    font-size: 0.9rem;
    
    i {
      font-size: 1rem;
    }
  }
}

.cart-empty-view {
  i {
    font-size: 2.5rem;
    color: var(--color-text-light);
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  p {
    font-size: 1rem;
    color: var(--color-text-light);
    margin-bottom: 20px;
  }
}

.token-logo-sm {
  width: 16px;
  height: 16px;
}

/* Dark mode adjustments */
.dark-mode {
  .cart-modal-container {
    background: var(--color-bg);
    border-color: var(--color-border);
  }
  
  .cart-item-entry {
    border-color: var(--color-border);
  }
  
  .cart-hive-key-input input,
  .cart-friend-input input {
    background: var(--color-bg);
    border-color: var(--color-border);
    color: var(--color-text);
  }
}


.plus-sign {
  margin: 0 8px;
  font-weight: bold;
  color: var(--color-text-light);
}
.physical-product-prices {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  
  .price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    
    .price-circle {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 10px 15px;
      background: rgba(231, 76, 60, 0.1);
      border-radius: 8px;
      font-weight: 600;
      color: var(--color-primary);
      
      &.hive {
        color: #d0a000;
        background: rgba(208, 160, 0, 0.1);
      }
    }
    
    button {
      flex: 0 0 120px;
    }
  }
}
/* Cart Price Button Layout */
.cart-price-button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cart-price-button-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-price-afit {
  background: rgba(231, 76, 60, 0.1);
  color: var(--color-primary);
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cart-price-hive {
  background: rgba(208, 160, 0, 0.1);
  color: #d0a000;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cart-buy-btn {
  background-color: var(--color-success);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
}

.cart-buy-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .cart-price-button-row {
    flex-wrap: wrap;
  }
}
/* Responsive adjustments */
@media (max-width: 480px) {
  .cart-price-button-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cart-price-button-pair {
    justify-content: space-between;
  }
}
/* Responsive adjustments */
@media (max-width: 767px) {
  .physical-product-prices {
    .price-row {
      flex-direction: column;
      gap: 10px;
      
      .price-circle {
        width: 100%;
      }
      
      button {
        width: 100%;
      }
    }
  }
}

@media (max-width: 575px) {
  .price-buttons {
    flex-direction: column;
  }
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .cart-modal-container {
    margin: 10px;
  }
  
  .cart-modal-header {
    padding: 15px;
    
    .cart-modal-title {
      font-size: 1.1rem;
    }
  }
  
  .cart-item-img .cart-item-avatar {
    width: 50px;
    height: 50px;
  }
  
  .cart-item-name {
    font-size: 0.9rem;
  }
}

@media (max-width: 575px) {
  .cart-modal-header {
    padding: 12px;
  }
  
  .cart-modal-body {
    padding: 15px;
  }
  
  .cart-item-entry {
    flex-direction: column;
    text-align: center;
    gap: 10px;
    padding: 15px 0;
  }
  
  .cart-item-img {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .cart-item-info {
    text-align: center;
  }
  
  .cart-item-remove-btn {
    margin-top: 10px;
  }
}
</style>