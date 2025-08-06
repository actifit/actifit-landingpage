 <template>
  <div class="modal fade" id="cartModal" tabindex="-1" ref="cartModal" 
     data-backdrop="static" data-keyboard="false">
  <div class="modal-dialog" role="document">
    <div class="cart-modal-container" @click.stop>	
        <div class="cart-modal-header">
          <h5 class="cart-modal-title">Checkout <i class="fas fa-shopping-bag"></i></h5>
          <button type="button" class="cart-modal-close" data-dismiss="modal" aria-label="Close" @click="closeModal">
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
            <!-- Digital Products Purchase Section -->
            <div class="dual-price-layout">
              <div class="dual-price-row">
                <div class="price-pair">
                  <div class="price-circle">
                    {{numberFormat(this.product_price_afit, 2)}} <img class="token-logo-sm" src="/img/actifit_logo.png">
                  </div>
                  <button 
                    :class="['btn-buy', { 'btn-buy-disabled': buyButtonDisabled }]"
                    :disabled="buyButtonDisabled"
                    @click.prevent="buyNow">
                    Buy
                  </button>
                </div>
                <div class="price-pair">
                  <div class="price-circle hive">
                    {{numberFormat(this.product_price_afit * this.afitPrice.afitHiveLastPrice, 3)}} <img class="token-logo-sm" src="/img/HIVE.png">
                  </div>
                  <button 
                    :class="['btn-buy-hive', { 'btn-buy-disabled': buyButtonDisabled }]"
                    :disabled="buyButtonDisabled"
                    @click.prevent="buyNowHive">
                    Buy
                  </button>
                </div>
              </div>
            </div>

            <!-- Active key input for HIVE purchases -->
            <div class="cart-hive-key-input" v-if="buyHiveExpand && !isKeychainActive && !isHiveauthActive">
              <label for="active-key">{{ $t('Active_Key') }} *</label>
              <input type="password" id="active-key" name="active-key" ref="active-key" 
                     class="form-control" v-model="userActvKey" :placeholder="$t('Enter_your_active_key')">
            </div>

            <div class="cart-proceed-section" v-if="buyHiveExpand">
              <button @click="proceedBuyNowHive()" v-if="this.userTokens >= this.minAfitBuyTicket" 
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
  <div class="cart-friend-input" v-if="hasFriendBoosts">
    <label for="friend">{{$t('Benef_friend')}}:</label>
    <input type="text" name="friend" id="friend" ref="friend" 
           class="form-control" :placeholder="$t('Enter_friends_username')"
           v-model="friendUsername">
  </div>
  
  <!-- Activation button -->
  <button class="btn-activate" @click.prevent="activateAllItems">
    <i class="fas fa-check"></i>
    {{ $t('cart.activate_all_gadgets') }}
  </button>
  
  <!-- Error message display -->
  <div v-if="activationError" class="cart-error-message">
    <i class="fas fa-exclamation-circle"></i>
    {{ activationError }}
  </div>
</div>
          
          <!-- Status messages -->
          <div class="cart-status-messages">
            <div v-if="processing" class="cart-loading-indicator">
              <i class="fas fa-spinner fa-spin"></i>
              {{ $t('Processing') }}...
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
import hive from '@hiveio/hive-js'
import BuyOptionsModal from '~/components/BuyOptionsModal'

export default {
  props: ['afitPrice'],
  data () {
    return {
      friendUsername: '',
      activationError: '',
      processing: false,
      showModal: false,
      loading: false,
      product_price_afit: 0,
      item_currency: 'AFIT',
      hive_currency: 'HIVE',
      buyHiveExpand: false,
      errorProceed: '',
      buyInProgress: false,
      buyAttempt: false,
      userActvKey: '',
      minAfitBuyTicket: process.env.minAfitBuyEarnTicket,
    }
  },
  watch: {
    cartEntries: function(){
      // Reset any errors due to adding new entries
      this.errorProceed = '';
      
      // Update total cart price
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
    ...mapGetters(['cartEntries']),
    ...mapGetters(['userTokens']),
    ...mapGetters(['purchaseSuccess']),
    
    buyButtonDisabled() {
      if (!this.user) return true;
      if (this.cartEntries.length === 0) return true;
      return false;
    },
    
    isKeychainActive() {
      return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
    },
    
    isHiveauthActive() {
      return (localStorage.getItem('acti_login_method') == 'hiveauth')
    },
hasFriendBoosts() {
  return this.cartEntries.some(item => 
    item.benefits && 
    item.benefits.boosts && 
    item.benefits.boosts.some(boost => boost.boost_beneficiary === 'friend')
  );
}
  },
  methods: {
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    
    showModalFunc() {
      this.$nextTick(() => {
        this.showModal = true;
        if ($ && typeof $.fn.modal === 'function') {
          $('#loginModal').modal('show');
        }
      });
    },
    
    closeModal() {
      // Reset modal state when closing
      this.buyHiveExpand = false;
      this.errorProceed = '';
      this.buyInProgress = false;
      
      // Close the modal using jQuery if available
      if ($ && typeof $.fn.modal === 'function') {
        $('#cartModal').modal('hide');
      }
    },
    
    getProductPrice(product) {
      let price_options = product.price;
      let price_options_count = price_options.length;
      let item_price = 0;
      for (let i=0; i < price_options_count; i++){
        let entry = price_options[i];
        item_price = entry.price;
      }
      return item_price;
    },
    
    removeProduct(product) {
      this.$store.commit('removeCartEntry', product)
    },
    
    prodHasFriendBenefic() {
      for (let i=0;i<this.cartEntries.length;i++){
        let product = this.cartEntries[i];
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

    let prod_list_str = this.cartEntries.map(p => p._id).join('-');

    let cstm_params = {
      required_auths: [],
      required_posting_auths: [this.user.account.name],
      id: 'actifit',
      json: JSON.stringify({
        transaction: "activate-gadget",
        gadget: prod_list_str,
        ...(appendFriend && { benefic: appendFriend })
      })
    };

    let res = await this.processTrxFunc('custom_json', cstm_params);
    if (!res.success) throw new Error('Transaction failed');

    let url = new URL(`${process.env.actiAppUrl}activateMultiGadget/` +
      `${this.user.account.name}/` +
      `${prod_list_str}/` +
      `${res.trx.ref_block_num}/` +
      `${res.trx.id}/` +
      `${localStorage.getItem('cur_bchain') || 'HIVE'}` +
      (appendFriend ? `/${appendFriend}` : ''));

    if (this.isKeychainActive || this.isHiveauthActive) {
      let op_json = JSON.stringify([['custom_json', cstm_params]]);
      url = new URL(`${process.env.actiAppUrl}activateMultiGadgetKeychain/` +
        `${this.user.account.name}/` +
        `${prod_list_str}/` +
        `${res.trx.id}/` +
        `${localStorage.getItem('cur_bchain') || 'HIVE'}` +
        (appendFriend ? `/${appendFriend}` : '') +
        `?operation=${op_json}`);
    }

    let outcome = await fetch(url).then(res => res.json());
    
    if (outcome.error) {
      throw new Error(outcome.error);
    } else {
      // Clear the cart after successful activation
      this.$store.commit('clearCart');
      this.$store.commit('setPurchaseSuccess', false);
      
      this.$emit('refresh-tickets-multi');
      this.errorProceed = this.$t('all_gadgets_activated');
      
      this.$notify({
        group: 'success',
        text: this.$t('all_gadgets_activated'),
        position: 'top center'
      });
      
      this.closeModal();
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
        if (!this.user) {
          throw new Error(this.$t('need_login_signup_notice_vote'));
        }

        if (this.userTokens < this.product_price_afit) {
          throw new Error(this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here'));
        }

        // Construct product list param
        let prod_list_str = this.cartEntries.map(p => p._id).join('-');

        // Broadcast transaction
        let cstm_params = {
          required_auths: [],
          required_posting_auths: [this.user.account.name],
          id: 'actifit',
          json: JSON.stringify({
            transaction: "buy-gadget",
            gadget: prod_list_str
          })
        };
        
        let res = await this.processTrxFunc('custom_json', cstm_params);
        if (!res.success) throw new Error('Transaction failed');

        let url = new URL(`${process.env.actiAppUrl}buyMultiGadget/` +
          `${this.user.account.name}/` +
          `${prod_list_str}/` +
          `${res.trx.ref_block_num}/` +
          `${res.trx.id}/` +
          `${localStorage.getItem('cur_bchain') || 'HIVE'}`);

        if (this.isKeychainActive || this.isHiveauthActive) {
          let op_json = JSON.stringify([['custom_json', cstm_params]]);
          url = new URL(`${process.env.actiAppUrl}buyMultiGadgetKeychain/` +
            `${this.user.account.name}/` +
            `${prod_list_str}/` +
            `${res.trx.id}/` +
            `${localStorage.getItem('cur_bchain') || 'HIVE'}` +
            `?operation=${op_json}`);
        }

        let outcome = await fetch(url).then(res => res.json());
        
        if (outcome.error) {
          throw new Error(outcome.error);
        } else {
          // Clear the cart after successful purchase
          this.$store.commit('clearCart');
          this.$store.commit('setPurchaseSuccess', true);
          
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
        }
      } catch(err) {
        console.error(err);
        this.errorProceed = err.message || this.$t('transaction_failed');
      } finally {
        this.buyInProgress = false;
      }
    },
    
    buyNowHive() {
      this.buyAttempt = true;
      this.errorProceed = '';
      this.buyHiveExpand = !this.buyHiveExpand;
    },
    
    async proceedBuyNowHive() {
      try {
        this.buyAttempt = true;
        this.buyInProgress = true;
        this.errorProceed = '';
        
        if (!this.user) {
          throw new Error(this.$t('need_login_signup_notice_vote'));
        }

        if (!this.isKeychainActive && !this.isHiveauthActive && !this.userActvKey) {
          throw new Error(this.$t('all_fields_required'));
        }

        // Proceed with payment
        let payAmount = parseFloat(this.product_price_afit * this.afitPrice.afitHiveLastPrice).toFixed(3);
        let memo = 'buy-gadget:' + this.cartEntries.map(p => p._id).join('-');

        let cstm_params = {
          "from": this.user.account.name,
          "to": process.env.actifitMarketBuy,
          "amount": payAmount + ' ' + 'HIVE',
          "memo": memo
        };

        let op_name = 'transfer';
        let operation = [[op_name, cstm_params]];

        let res = await this.processTrxFunc(op_name, cstm_params, true);
        if (!res.success) throw new Error('Transaction failed');

        let url = new URL(`${process.env.actiAppUrl}buyMultiGadgetHive/` +
          `${this.user.account.name}/` +
          `${memo.split(':')[1]}/` +
          `${res.trx.ref_block_num}/` +
          `${res.trx.id}/` +
          `HIVE`);

        if (this.isKeychainActive || this.isHiveauthActive) {
          let op_json = JSON.stringify(operation);
          url = new URL(`${process.env.actiAppUrl}buyMultiGadgetHiveKeychain/` +
            `${this.user.account.name}/` +
            `${memo.split(':')[1]}/` +
            `${res.trx.id}/` +
            `HIVE?operation=${op_json}`);
        }

        let outcome = await fetch(url).then(res => res.json());
        
        if (outcome.error) {
          throw new Error(outcome.error);
        } else {
          // Clear the cart after successful purchase
          this.$store.commit('clearCart');
          this.$store.commit('setPurchaseSuccess', true);
          
          this.errorProceed = this.$t('purchase_success_ingame_multi');
          this.$emit('refresh-tickets-multi');
          
          this.$notify({
            group: 'success',
            text: this.$t('purchase_success_ingame_multi'),
            position: 'top center'
          });
        }
      } catch(err) {
        console.error(err);
        this.errorProceed = err.message || this.$t('transaction_failed');
      } finally {
        this.buyInProgress = false;
      }
    },
    
    async processTrxFunc(op_name, cstm_params, forceActive = false) {
      if (!localStorage.getItem('std_login')) {
        let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
        if (res.result.ref_block_num) {
          return {success: true, trx: res.result};
        } else {
          return {success: false, trx: null};
        }
      } else if (this.isKeychainActive) {  
        return new Promise((resolve) => {
          window.hive_keychain.requestBroadcast(
            this.user.account.name, 
            [[op_name, cstm_params]], 
            forceActive ? 'Active' : 'Posting', 
            (response) => {
              if (response.success) {
                resolve({success: response.success, trx: {id: response.result.id}});
              } else {
                resolve({success: false, error: response.error});
              }
            }
          );
        });
      } else if (this.isHiveauthActive) {  
        return new Promise((resolve) => {
          const auth = {
            username: this.user.account.name,
            token: localStorage.getItem('access_token'),
            expire: localStorage.getItem('expires'),
            key: localStorage.getItem('key')
          }
          
          this.$HAS.broadcast(auth, forceActive ? 'active' : 'posting', [[op_name, cstm_params]], (evt) => {
            this.$notify({
              group: 'warn',
              text: this.$t('verify_hiveauth_app'),
              duration: -1,
              position: 'top center'
            });
          })
          .then(response => {
            this.$notify({
              group: 'warn',
              clean: true
            });
            
            if (response.cmd && response.cmd === 'sign_ack') {
              resolve({success: true, trx: {id: response.data}});
            } else if (response.cmd && response.cmd === 'sign_nack') {
              resolve({success: false});
            }
          })
          .catch(err => {
            this.$notify({
              group: 'warn',
              clean: true
            });
            console.log(err);
            resolve({success: false});
          });
        });
      } else {
        let operation = [[op_name, cstm_params]];
        let accToken = localStorage.getItem('access_token');
        let cur_bchain = localStorage.getItem('cur_bchain') || 'HIVE';
        
        let url = new URL(`${process.env.actiAppUrl}performTrx/` +
          `?user=${this.user.account.name}` +
          `&operation=${JSON.stringify(operation)}` +
          `&bchain=${cur_bchain}`);
        
        let reqHeads = new Headers({
          'Content-Type': 'application/json',
          'x-acti-token': 'Bearer ' + accToken,
        });
        
        let res = await fetch(url, { headers: reqHeads });
        let outcome = await res.json();
        
        if (outcome.error) {
          console.log(outcome.error);
          
          // If this is authority error, means needs to be logged out
          let err_msg = outcome.trx.tx.error;
          if (err_msg.includes('missing') && err_msg.includes('authority')) {
            localStorage.removeItem('access_token');
            this.error_msg = this.$t('session_expired_login_again');
            this.$store.dispatch('steemconnect/logout');
          }
          
          this.$notify({
            group: 'error',
            text: err_msg,
            position: 'top center'
          });
          
          return {success: false, trx: null};
        } else {
          return {success: true, trx: outcome.trx.tx};
        }
      }
    }
  },
    handleBackdropClick(e) {
    // Only close if clicking directly on the backdrop
    if (e.target === this.$refs.cartModal) {
      this.closeModal();
    }
  },
  
   async activateAllItems() {
  this.activationError = '';
  this.processing = true;
  
  try {
    // Validate friend input if needed
    if (this.hasFriendBoosts && !this.friendUsername) {
      throw new Error(this.$t('Provide_friend_name_receive_boost'));
    }
    
    if (this.hasFriendBoosts && this.friendUsername.replace('@', '') === this.user.account.name) {
      throw new Error(this.$t('Cannot_use_same_account'));
    }

    // Prepare activation data
    const productIds = this.cartEntries.map(item => item._id).join('-');
    const activationData = {
      transaction: "activate-gadget",
      gadget: productIds
    };

    // Add friend if applicable
    if (this.hasFriendBoosts) {
      activationData.benefic = this.friendUsername;
    }

    // Process the activation transaction
    const result = await this.processActivation(activationData);
    
    if (result.success) {
      // Clear cart and reset state
      this.$store.commit('clearCart');
      this.$store.commit('setPurchaseSuccess', false);
      
      // Show success message
      this.$notify({
        group: 'success',
        text: this.$t('all_gadgets_activated'),
        position: 'top center'
      });
      
      // Close the modal
      this.closeModal();
    } else {
      throw new Error(result.error || this.$t('activation_failed'));
    }
  } catch (error) {
    this.activationError = error.message;
  } finally {
    this.processing = false;
  }
},

async processActivation(activationData) {
  const cstm_params = {
    required_auths: [],
    required_posting_auths: [this.user.account.name],
    id: 'actifit',
    json: JSON.stringify(activationData)
  };

  // Process transaction (similar to your existing processTrxFunc)
  const res = await this.processTrxFunc('custom_json', cstm_params);
  if (!res.success) return { success: false, error: res.error };

  // Call backend to confirm activation
  const url = `${process.env.actiAppUrl}activateMultiGadget/` +
    `${this.user.account.name}/` +
    `${activationData.gadget}/` +
    `${res.trx.ref_block_num}/` +
    `${res.trx.id}/` +
    `${localStorage.getItem('cur_bchain') || 'HIVE'}` +
    (activationData.benefic ? `/${activationData.benefic}` : '');

  const response = await fetch(url);
  return response.json();
},
    async processActivation(activationData) {
      const cstm_params = {
        required_auths: [],
        required_posting_auths: [this.user.account.name],
        id: 'actifit',
        json: JSON.stringify(activationData)
      };

      // Process transaction (similar to your existing processTrxFunc)
      const res = await this.processTrxFunc('custom_json', cstm_params);
      if (!res.success) return { success: false, error: res.error };

      // Call backend to confirm activation
      const url = `${process.env.actiAppUrl}activateMultiGadget/` +
        `${this.user.account.name}/` +
        `${activationData.gadget}/` +
        `${res.trx.ref_block_num}/` +
        `${res.trx.id}/` +
        `${localStorage.getItem('cur_bchain') || 'HIVE'}` +
        (activationData.benefic ? `/${activationData.benefic}` : '');

      const response = await fetch(url);
      return response.json();
    },

mounted() {
  // Add click listener to the modal element
  if (this.$refs.cartModal) {
    this.$refs.cartModal.addEventListener('click', this.handleBackdropClick);
  }
  
  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
  hive.api.setOptions({ url: process.env.hiveApiNode });
},

beforeDestroy() {
  // Clean up event listener
  if (this.$refs.cartModal) {
    this.$refs.cartModal.removeEventListener('click', this.handleBackdropClick);
  }
}
}
</script>
<style lang="scss">
.cart-modal-container {
  background: var(--color-bg);
  border-radius: 16px;
  overflow: hidden;
  pointer-events: auto;
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 24px var(--color-shadow);
}

.modal-dialog {
  /* This helps with click containment */
  pointer-events: none;
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

.purchase-success-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
  color: var(--color-success);
  
  i {
    font-size: 1.5rem;
  }
  
  p {
    margin: 0;
    font-weight: 500;
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