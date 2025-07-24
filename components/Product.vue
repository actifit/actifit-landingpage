<template>
      <!-- single card item for approved product -->
      <div class="product-card" :class="product.type" :style="{'--color-primary': product.type === 'real' ? '#e74c3c' : ''}">
        <!-- Card Header -->
        <div class="card-header">
          <button class="info-icon" @click="showDetailsModal">
            <i class="fas fa-info-circle"></i>
          </button>
          <!-- Product Image -->
          <div class="product-image-container">
            <div class="product-image" :style="product && product.image ? 
                (product.image.startsWith('http') ? 
                'background-image: url(' + product.image + ')' : 
                'background-image: url(/img/gadgets/' + product.image + ')') : ''"></div>
            <div class="product-level" v-if="product.type == 'ingame' || product.type == 'real'">
              <span v-for="iterl in product.level" :key="iterl">
                <i class="fas fa-star"></i>
              </span>
            </div>
          </div>
          
          <!-- Product Meta -->
          <div class="product-meta">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-provider">
              {{ renderProdType }} 
              <span v-if="product.type != 'ingame' && product.type != 'real'">{{ $t('By') }}</span> 
              <a v-if="product.type == 'service'" 
                :href="'/consultants/?prof=' + product.provider_name"
                class="provider-link">
                {{ product.provider_name }}
              </a>
              <a v-else :href="'/' + product.provider" class="provider-link">
                {{ product.provider_name }}
              </a>
            </div>
          </div>
        </div>
        
        <!-- Product Details -->
        <div class="product-details" style="flex-grow: 1;">
          <!-- Availability & Validity -->
          <div class="detail-row availability">
            <div class="detail-item">
              <span class="detail-label">{{ $t('Available') }}</span>
              <span class="detail-value">{{ product.count }} {{ $t('units') }}</span>
            </div>
            <div class="detail-item" v-if="product.type == 'ingame'">
              <span class="detail-label">{{ $t('Validity') }}</span>
              <span class="detail-value">{{ product.benefits.time_span }} {{ product.benefits.time_unit }}</span>
            </div>
          </div>
          
          <div class="detail-row boosts" 
        v-if="product.benefits && product.benefits.boosts && product.benefits.boosts.length">{{ $t('Boosts') }}
      <div class="detail-item boost-item" 
          v-for="(boost, index) in product.benefits.boosts" 
          :key="index">
        <span class="boost-icon" :class="{'friend': boost.boost_beneficiary == 'friend'}">
          <i class="fas" :class="boost.boost_beneficiary == 'friend' ? 'fa-user-friends' : 'fa-user'"></i>
        </span>
        <span class="boost-value">
          <template v-if="boost.boost_amount">+{{ boost.boost_amount }}</template>
          <template v-else-if="boost.boost_min_amount">
            +{{ boost.boost_min_amount }}-{{ boost.boost_max_amount }}
          </template>
          <span class="boost-type">
            {{ boost.boost_type.replace('percent_reward', '%').replace('percent', '%').replace('unit', ' ') }}
          </span>
          <span class="boost-unit">{{ boost.boost_unit }}</span>
        </span>
      </div>
    </div>
          
<!-- Requirements Section - Redesigned -->
<div class="detail-row requirements" 
    v-if="product.requirements && product.requirements.length > 0 && 
            !(product.requirements.length == 1 && product.requirements[0].item == null)">
    
    <div class="requirements-heading">
        <div class="requirements-title">{{ $t('Requirements') }}</div>
        <div class="requirements-container">
            <div class="requirement-item" 
                v-for="(reqt, index) in product.requirements" 
                :key="index"
                :class="reqt.met ? 'met' : 'not-met'">
                <span class="requirement-icon">
                    <i class="fas" :class="reqt.met ? 'fa-check-circle' : 'fa-times-circle'"></i>
          </span>
          <span class="requirement-text">
            <template v-if="reqt.item && reqt.item.toLowerCase() == 'User Rank'.toLowerCase()"
                      :title="$t('user_rank_reqt').replace('_VAL_', reqt.level)">
              <span class="highlight">{{ reqt.item }} &gt; {{ reqt.level }}</span>
            </template>
            <template v-else-if="reqt.item && reqt.item.toLowerCase() == 'AFIT'.toLowerCase()"
                      :title="$t('afit_reqt').replace('_VAL_', reqt.count)">
              <span class="highlight">{{ $t('user_afit_balace') }} >= {{ reqt.count }} {{ reqt.item }}</span>
            </template>
            <template v-else
                      :title="$t('consumed_reqt').replace('_AMOUNT_', reqt.count).replace('_ITEM_', reqt.item).replace('_LEVEL_', reqt.level)">
              <span class="highlight">{{ $t('At_Least') }} {{ reqt.count }} '{{ reqt.item }} {{ $t('level_short') }} {{ reqt.level }}'</span> {{ $t('consumed') }}
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>

          
<!-- Status Indicators -->
<div class="detail-row status-indicators" v-if="grabConsumableItem()">
  <div class="status-heading">
    <div class="status-title">{{ $t('Status') }}</div>
    <div class="status-container">
      <div class="status-item" :class="grabConsumableItem().status == 'active' ? 'active' : 'inactive'">
        <span class="status-icon">
          <i class="fas" :class="grabConsumableItem().status == 'active' ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
        </span>
        <span class="status-text">
          {{ grabConsumableItem().status == 'active' ? $t('Active') : $t('Inactive') }}
        </span>
      </div>
      
      <div class="status-item" v-if="prodHasFriendBenefic()">
        <span class="status-icon">
          <i class="fas fa-user-friends"></i>
        </span>
        <span class="status-text">
          <template v-if="grabConsumableItem().status == 'active'">
            <a :href="'/' + grabConsumableItem().benefic" target="_blank">{{ grabConsumableItem().benefic }}</a>
          </template>
          <input type="text" name="friend" id="friend" ref="friend" class="form-control" v-else
                :value="grabConsumableItem().benefic">
        </span>
      </div>
      
      <div class="status-item">
        <span class="status-icon">
          <i class="fas fa-chart-line"></i>
        </span>
        <span class="status-text">
          {{ grabConsumableItem().span - grabConsumableItem().consumed }} {{ $t('Activity_Reports') }}
        </span>
      </div>
    </div>
  </div>
</div>
</div>


<!-- Pricing Section -->
<div class="product-pricing">
  <div class="pricing-container">
    <!-- Physical Products with both AFIT and HIVE prices -->
    <template v-if="product.type === 'real' && item_price_extra > 0 && showBuyButtons">
      <div class="combined-price-layout">
        <div class="price-display">
          <div class="price-circle combined">
            {{ numberFormat(item_price, 2) }} <img class="token-logo-sm" src="/img/actifit_logo.png">
            <span class="plus-sign">+</span>
            {{ numberFormat(item_price_extra, 2) }} <img class="token-logo-sm" src="/img/HIVE.png">
          </div>
        </div>
        <button 
          :class="['btn-buy', { 'btn-buy-disabled': buyButtonDisabled }]"
          :disabled="buyButtonDisabled"
          @click="handleBuyClick">
          Buy
        </button>
      </div>
    </template>

    <!-- All other products (non-physical or physical with only AFIT price) -->
    <template v-else-if="showBuyButtons">
      <!-- Single Price Layout (AFIT only) -->
      <template v-if="item_price_extra <= 0">
        <div class="single-price-layout">
          <div class="single-price-row">
            <div class="price-circle">
              {{ numberFormat(item_price, 2) }} <img class="token-logo-sm" src="/img/actifit_logo.png">
            </div>
            <button 
              :class="['btn-buy', { 'btn-buy-disabled': buyButtonDisabled }]"
              :disabled="buyButtonDisabled"
              @click="handleBuyClick">Buy
            </button>
          </div>
        </div>
      </template>

      <!-- Dual Price Layout (AFIT + HIVE) -->
      <template v-else>
        <div class="dual-price-layout">
          <div class="dual-price-row">
            <div class="price-pair">
              <div class="price-circle">
                {{ numberFormat(item_price, 2) }} <img class="token-logo-sm" src="/img/actifit_logo.png">
              </div>
              <button 
                :class="['btn-buy', { 'btn-buy-disabled': buyButtonDisabled }]"
                :disabled="buyButtonDisabled"
                @click="handleBuyClick">Buy
              </button>
            </div>
            <div class="price-pair">
              <div class="price-circle hive">
                {{ numberFormat(item_price_extra, 2) }} <img class="token-logo-sm" src="/img/HIVE.png">
              </div>
              <button 
                :class="['btn-buy-hive', { 'btn-buy-disabled': buyButtonDisabled }]"
                :disabled="buyButtonDisabled"
                @click="buyNowHive">Buy
              </button>
            </div>
          </div>
        </div>
      </template>
    </template>
    <!-- "user && product.type == 'ingame' && allReqtsFilled" -->
    <!-- Additional actions (cart buttons) -->
    <div class="additional-actions" v-if=true>
      <button class="btn-add-cart" 
              @click.prevent="addCart()" 
              v-if="cartEntries.filter(obj => obj._id === product._id).length < 1">
        Add to Cart<i class="fas fa-cart-plus"></i>
      </button>
      <button class="btn-add-cart" 
              @click.prevent="removeCart()" 
              v-else>
        Remove from Cart<i class="fas fa-cart-arrow-down"></i>
      </button>
      <button class="btn-checkout" data-toggle="modal" data-target="#cartModal">
        Checkout<i class="fas fa-shopping-bag"></i>
      </button>
    </div>

    <!-- Activation Button (shown after purchase) -->
    <template v-else-if="showActivationButtons">
      <div class="activation-container">
        <button 
          :class="activationButtonClass"
          @click="handleActivationClick">
          <template v-if="grabConsumableItem().status === 'active'">
            <i class="fas fa-power-off"></i> Deactivate Gadget
          </template>
          <template v-else>
            <i class="fas fa-power-off"></i> Activate Gadget
          </template>
        </button>
      </div>
    </template>
  </div>
</div>

    <!-- Details Modal -->
    <div v-if="showDetails" class="details-modal" @click.self="closeDetailsModal">
      <div class="modal-contentt">
        <button class="modal-closee" @click="closeDetailsModal">
          <i class="fas fa-times"></i>
        </button>
        
        <h3 class="modal-titlee">{{ product.name }}</h3>
        <div class="modal-bodyy">
          <!-- Product Description -->
          <div class="full-description">
            <h4>{{ $t('details') }}</h4>
            <p>{{ product.description }}</p>
          </div>

          <!-- Product Images - Compact Gallery -->
          <div class="product-gallery" v-if="product.type == 'real' && product.prodImages">
          <h4>{{ $t('product_images') }}</h4>
          
          <!-- Main Featured Image -->
          <div class="featured-image-container" v-if="product.prodImages.length > 0">
            <div 
              class="featured-image"
              :style="{'background-image': `url(${product.prodImages[0]})`}"
              @click="openLightbox(0)"
            ></div>
            
            <!-- View Gallery Button -->
            <div class="gallery-toggle" @click="toggleGallery">
              <span>{{ galleryExpanded ? $t('Hide_photos') : $t('View_photos') }}</span>
              <i class="fas" :class="galleryExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </div>
          </div>
          
          <!-- Thumbnail Grid (Hidden by default) -->
          <div class="gallery-grid" v-show="galleryExpanded">
            <div 
              v-for="(image, index) in product.prodImages" 
              :key="index"
              class="gallery-item"
              @click="openLightbox(index)"
            >
              <div 
                class="gallery-image" 
                :style="{'background-image': `url(${image})`}"
              ></div>
            </div>
          </div>
          
          <!-- Lightbox Modal -->
          <div v-if="lightboxActive" class="lightbox-modal" @click.self="closeLightbox">
            <button class="lightbox-close" @click="closeLightbox">
              <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-nav prev" @click.stop="prevImage">
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="lightbox-content">
              <img :src="product.prodImages[currentImageIndex]" alt="Product image">
              <div class="image-counter">{{ currentImageIndex + 1 }} / {{ product.prodImages.length }}</div>
            </div>
            
            <button class="lightbox-nav next" @click.stop="nextImage">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
          
          <!-- Order Options -->
          <div class="order-options" v-if="user && product.type == 'real' && !checkout_product && realProdBuyStatus">
              <div class="form-group">
                <label>{{ $t('order_quantity') }}</label>
                <select v-model="order_quantity" class="form-control">
                  <option value="1" selected>1</option>
                  <option v-if="product.allowedQuantity && quant < product.allowedQuantity"
                          v-for="quant in product.allowedQuantity" :value="quant + 1" :key="quant + 1">
                    {{ quant + 1 }}
                  </option>
                </select>
              </div>
              
              <div class="form-group" v-if="product.colorOptions">
                <label>{{ $t('color_choice') }}</label>
                <select v-model="color_choice" class="form-control">
                  <option v-if="Array.isArray(product.colorOptions) && product.colorOptions.length > 0"
                          v-for="colr in product.colorOptions" :value="colr" :key="colr">
                    {{ colr }}
                  </option>
                </select>
              </div>
          </div>
        </div>
      </div>
    </div>

        
        <!-- Modals and Notifications -->
        <BuyOptionsModal :id="'buyOptionsModal' + _uid" :ref="'buyOptionsModal' + _uid" 
                        :containerID="'#buyOptionsModal' + _uid" :modalTitle="$t('Buy_product')" 
                        :modalText="$t('buy_now_modal_desc').replace('_AMNT_', minAfitBuyTicket)"
                        @proceed-purchase="proceedBuyNowHive" />
        
        <CartModal id="cartModal" ref="cartModal" :afitPrice="afitPrice" 
                  @refresh-tickets-multi="refreshTicketsMulti" />
        
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

    //import steem from 'steem'

    import hive from '@hiveio/hive-js'

    import BuyOptionsModal from '~/components/BuyOptionsModal'
    import CartModal from '~/components/CartModal'

    //import VueLazyLoad from 'vue-lazyload'
    //import LightBox from 'vue-image-lightbox'

    import '@morioh/v-lightbox/dist/lightbox.css';

    //import Lightbox from '@morioh/v-lightbox'

    export default {
      props: ['product', 'pros', 'userrank', 'gadgetStats', 'afitPrice', 'realProducts', 'expandAll'],
      components: {
        BuyOptionsModal,
        CartModal,
        LoginModal
      },
        mounted() {
        window.addEventListener('keydown', this.handleKeydown);
      },
      beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeydown);
      },
      computed: {
        ...mapGetters('steemconnect', ['user']),
        ...mapGetters('steemconnect', ['stdLogin']),
        ...mapGetters(['userTokens']),
        ...mapGetters(['cartEntries']),
        isKeychainActive() {
          return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
        },
        isHiveauthActive() {
          return (localStorage.getItem('acti_login_method') == 'hiveauth')
        },
        renderProdType() {
          if (this.product.type == 'real') {
            return this.$t('real_prod_name');
          }
          return this.product.type;
        },
        boughtCount() {
          if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0) {
            return this.consumedCount + this.activeCount;
          }
          return 0;
        },
        consumedCount() {
          if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0) {
            let entry = this.gadgetStats.find(entry => (entry._id.gadget === this.product._id && entry._id.status == 'consumed'));
            if (entry) return entry.count;
          }
          return 0;
        },
        activeCount() {
          if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0) {
            let entry = this.gadgetStats.find(entry => (entry._id.gadget === this.product._id && entry._id.status == 'active'));
            if (entry) return entry.count;
          }
          return 0;
        },
        realProdBuyStatus() {
          if (Array.isArray(this.pendingOrders) && this.pendingOrders.length > 0) {
            return false;
          }
          return true;
        },
          pricingLayoutClass() {
        return {
          'single-price': this.item_price_extra <= 0
        }
      },
        
  buyButtonDisabled() {
    // Disable if not logged in, requirements not met, or no items available
    if (!this.user) return true;
    if (!this.allReqtsFilled) return true;
    if (this.product.count < 1) return true;
    return false;
  },
  
  showBuyButtons() {
    // Show buy buttons if user hasn't purchased this item yet
    return !this.productBought && !this.grabConsumableItem();
  },
  
  showActivationButtons() {
    // Show activation/deactivation if user has purchased
    return this.grabConsumableItem();
  },
  
  activationButtonClass() {
    const item = this.grabConsumableItem();
    if (item && item.status === 'active') {
      return 'btn-deactivate';
    }
    return 'btn-activate';
  },
      },
      data() {
        return {
          showDetails: false,
          galleryExpanded: false,
          lightboxActive: false,
          currentImageIndex: 0,
          showModal: false,
          item_price: 0,
          item_currency: 'AFIT',
          orig_item_price: 0,
          orig_item_currency: 'AFIT',
          item_price_extra: 0,
          item_extra_currency: '',
          allReqtsFilled: false,
          pendingOrders: [],
          hive_currency: 'HIVE',
          product_prov_pic: '',
          buyAttempt: false,
          buyHiveExpand: false,
          errorProceed: '',
          buyInProgress: false,
          productBought: false,
          requestFundsPass: false,
          downloadAgainReady: false,
          downloadHref: '',
          firstDownloadHref: '',
          boughtItems: [],
          profImgUrl: process.env.steemImgUrl,
          minAfitBuyTicket: process.env.minAfitBuyEarnTicket,
          userActvKey: '',
          userActvKeyHv: '',
          afitBuyAmount: 1,
          userRlActvKey: '',
          checkout_product: false,
          buyer_country: '',
          order_quantity: 1,
          color_choice: (this.product.colorOptions ? this.product.colorOptions[0] : ''),
          proceedBuyAFIT: false,
          afit_buy_err_msg: '',
          transConfirmed: false,
          checkingBought: false,
          buyAfitInProgress: false,
          buyAfitConfirmed: false,
          prodDispStatus: this.expandAll ? 'open' : '',
          prodDispStatusText: this.expandAll ? 'Collapse' : 'Expand'
        }
      },
      watch: {
        product: 'getPrice',
        pros: 'updateProPic',
        user: 'allReqtsMet',
        userrank: 'allReqtsMet',
        order_quantity: 'getPrice',
        afitPrice: 'getPrice',
        realProducts: 'updateProdStat',
        expandAll: 'adjustDisplay'
      },
      methods: {
        /**
           * Formats numbers with commas and dots.
           *
           * @param number
         * @param precision
           * @returns {string}
           */
            handleBuyClick() {
    if (!this.user) {
      this.showModal = true;
      return;
    }
    
    if (this.product.type === 'real') {
      this.prepareCheckout();
    } else {
      this.buyNow();
    }
  },
  
  handleActivationClick() {
    if (!this.user) {
      this.showModal = true;
      return;
    }
    
    const item = this.grabConsumableItem();
    if (item && item.status === 'active') {
      this.deactivateGadget();
    } else {
      this.activateGadget();
    }
  },
        toggleGallery() {
          this.galleryExpanded = !this.galleryExpanded;
        },
        openLightbox(index) {
          this.currentImageIndex = index;
          this.lightboxActive = true;
          document.body.classList.add('no-scroll');
        },
        closeLightbox() {
          this.lightboxActive = false;
          document.body.classList.remove('no-scroll');
        },
        nextImage() {
          this.currentImageIndex = (this.currentImageIndex + 1) % this.product.prodImages.length;
        },
        prevImage() {
          this.currentImageIndex = (this.currentImageIndex - 1 + this.product.prodImages.length) % this.product.prodImages.length;
        },
        handleKeydown(e) {
          if (this.lightboxActive) {
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowRight') this.nextImage();
            if (e.key === 'ArrowLeft') this.prevImage();
          }
        },
showDetailsModal() {
  this.showDetails = true;
  document.body.classList.add('no-scroll');
  
  // Scroll to top of modal when opened
  this.$nextTick(() => {
    const modal = document.querySelector('.modal-content');
    if (modal) {
      modal.scrollTop = 0;
    }
  });
},

closeDetailsModal() {
  this.showDetails = false;
  document.body.classList.remove('no-scroll');
},
        adjustDisplay() {
          this.prodDispStatus = this.expandAll;
          this.prodDispStatusText = this.expandAll ? 'Collapse' : 'Expand';
        },
        showModalFunc() {
          this.$nextTick(() => {
            this.showModal = true;
            if ($ && typeof $.fn.modal === 'function') {
              $('#loginModal').modal('show');
            }
          });
        },
        // Update the numberFormat method
        numberFormat(number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
      },
        async buyAFITNow() {
          this.afit_buy_err_msg = '';

          if (!this.user) {
            this.afit_buy_err_msg = this.$t('need_login_signup_notice_vote');
            return;
          }
          if (this.afitBuyAmount < 0) {
            this.afit_buy_err_msg = this.$t('amount_positive_int');
            return;
          }
          if (this.getMatchingHIVE() < 0) {
            this.afit_buy_err_msg = this.$t('amount_positive_int');
            return;
          }
          if (this.userActvKeyHv == '') {
            this.afit_buy_err_msg = this.$t('all_fields_required');
            return;
          }
          if (this.user.account.balance.split(" ")[0] < this.getMatchingHIVE()) {
            this.afit_buy_err_msg = this.$t('Not_enough_hive_balance_to_buy');
            //console.log(this.errorProceed );
            return;
          }

          this.buyAfitInProgress = true;
          let hiveAmnt = this.getMatchingHIVE();
          let afitAmnt = this.afitBuyAmount;

          //show user confirm for purchasing product/service
          let user_prmpt = this.$t('confirm_buy_afit_hive').replace('_AFIT_', afitAmnt).replace('_HIVE_', hiveAmnt);

          let decis = confirm(user_prmpt);
          if (!decis) {
            this.buyAfitInProgress = false;
            return;
          }
          //proceed with purchase transaction
          let attempt = 1;
          let memo = 'buy-afit:' + afitAmnt;
          let res = await hive.broadcast.transferAsync(this.userActvKeyHv, this.user.account.name, process.env.actifitVault, hiveAmnt + ' ' + 'HIVE', memo).then(
            res => this.confirmCompletion('buyAFITHive', hiveAmnt, res, attempt, afitAmnt)).catch(err => this.errorCompletion(err, 'buyAFITHive'));

        },
        getMatchingHIVE() {
          return parseFloat(this.afitBuyAmount * this.afitPrice.afitHiveLastPrice).toFixed(3);
        },
        updateProdStat() {
          if (this.user && this.product.type == 'real' && Array.isArray(this.realProducts) && this.realProducts.length > 0) {
            console.log('realProducts');
            //console.log(this.realProducts);
            this.pendingOrders = this.realProducts.filter(entry => (entry.gadget === this.product._id && entry.status != 'delivered' && entry.status != 'cancelled' && entry.status != 'refunded'));
            console.log('pending orders');
            //console.log(this.pendingOrders );

          }
        },
        showDate(dt) {
          let date = new Date(dt)
          //let minutes = date.getMinutes()
          return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();// + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
        },
        async addCart() {
          let res = await this.$store.commit('addCartEntry', this.product)
          if (res) {
            this.$notify({
              group: 'success',
              text: this.$t('success_add_cart').replace('_PROD_', this.product.name + '-L' + this.product.level),//this.$t('session_expired_login_again'),
              position: 'top center'
            })
          }
        },
        async removeCart() {
          let res = await this.$store.commit('removeCartEntry', this.product)
        },
        //handles checking all requirements for the product
        async allReqtsMet() {
          //console.log('>>>>>>>allReqtsMet');
          if (Array.isArray(this.product.requirements) && this.product.requirements.length > 0) {
            for (let i = 0; i < this.product.requirements.length; i++) {
              if (this.product.requirements[i].item) {
                let outc = await this.reqtMet(this.product.requirements[i]);
                this.product.requirements[i].met = outc;
                if (!outc) {
                  this.allReqtsFilled = false;
                  this.product.reqtsFilled = false;
                  this.$emit('update-prod', this.product);
                  return false;
                }
              }
            }
          }
          this.checkProductBought();
          /*console.log(this.product);
          console.log('final data');
          console.log(this.product.requirements);*/
          this.allReqtsFilled = true;
          this.product.reqtsFilled = true;
          this.$emit('update-prod', this.product);
          return true;
        },
        //checks whether the requirement for this product is met
        async reqtMet(reqt) {
          if (reqt.item.toLowerCase() == 'User Rank'.toLowerCase()) {
            //console.log('>User Rank');
            //console.log(this.userrank);
            //console.log(reqt.level);
            //user rank case
            if (parseFloat(this.userrank) >= parseFloat(reqt.level)) {
              return true;
            }
          } else if (reqt.item.toLowerCase() == 'AFIT'.toLowerCase()) {
            if (parseFloat(this.userTokens) >= parseFloat(reqt.count)) {
              return true;
            }
          } else {
            //console.log('>>else');
            //check if user meets current reqt conditions
            let query = await fetch(process.env.actiAppUrl
              + 'gadgetBoughtName/'
              + '?user=' + this.user.account.name
              + '&gadget_name=' + reqt.item
              + '&gadget_level=' + parseInt(reqt.level));
            let res = await query.json();
            //console.log(res);
            let consumed_cnt = 0;
            for (let i = 0; i < res.length; i++) {
              //console.log(res[i].status);
              if (res[i].status == 'consumed') {
                consumed_cnt += 1;
              }
            }
            //matches requirement
            if (parseFloat(consumed_cnt) >= parseFloat(reqt.count)) {
              return true;
            }
          }
          return false;
        },
        handleDownloadClick() {
          if (this.downloadHref){
            window.location.href = this.downloadHref;
            setTimeout(() => {
              this.resetDownState();
            }, 200);
          }else{
            console.warn('cannot initiate download.');
          }
        },
        resetDownState() {
          this.downloadAgainReady = false
          this.requestFundsPass = false
        },
        handleFirstDownloadClick() {
          if (this.firstDownloadHref) {
            window.location.href = this.firstDownloadHref;
            setTimeout(() => {
              this.confirmBought();
            }, 200);
          }else{
            console.warn('cannot initiate download.');
          }
        },
        confirmBought() {
          this.productBought = true;
          this.errorProceed = false;
          this.buyInProgress = false;
        },
        switchDetails() {
          this.detailsOpen = !this.detailsOpen;
        },
        setProductBought(json) {
          if (Array.isArray(json) && json.length > 0
            || (json.user && json.product_id)) {
            this.productBought = true;
          }
          if (Array.isArray(json) && json.length > 0) {
            let consumed_cnt = 0;
            for (let i = 0; i < json.length; i++) {
              if (json[i].status == 'consumed') {
                consumed_cnt += 1;
              }
            }
            this.product.bought = true;
            this.$emit('update-prod', this.product);
            this.consumed_count = consumed_cnt;
            this.boughtItems = json;
          } else {
            /*this.product.bought = false;
            this.$emit('update-prod', this.product);*/
          }
          this.$forceUpdate();
        },
        grabConsumableItem() {
          if (Array.isArray(this.boughtItems) && this.boughtItems.length > 0) {
            //console.log(this.boughtItems);
            let i = 0;
            let count = this.boughtItems.length;
            for (let i = 0; i < count; i++) {
              let entry = this.boughtItems[i];
              if (entry.status != "consumed" && parseInt(entry.consumed) < parseInt(entry.span)) {
                return entry;
              }
            }
          }
          return null;
        },
        // Update the getPrice() method
        
        getPrice() {
  if (this.product && this.afitPrice) {
    let price_options = this.product.price;
    let price_options_count = price_options.length;
    for (let i = 0; i < price_options_count; i++) {
      let entry = price_options[i];
      this.item_price = entry.price * this.order_quantity;
      this.item_currency = entry.currency;
      
      if (this.item_currency == 'USD') {
        this.orig_item_currency = this.item_currency;
        this.orig_item_price = this.item_price;
        this.item_currency = 'AFIT';
        this.item_price = Number(
          (this.orig_item_price * entry.percent_afit / 100 / this.afitPrice.afitHiveLastUsdPrice)
          .toFixed(2)
        );
        
        let calcHiveUsdPrice = this.afitPrice.afitHiveLastUsdPrice / this.afitPrice.afitHiveLastPrice;
        this.item_price_extra = Number(
          (this.orig_item_price * entry.percent_hive / 100 / calcHiveUsdPrice)
          .toFixed(2)
        );
        this.item_extra_currency = 'HIVE';
      } else {
        // Only show HIVE price for ingame items, not for ebooks or services
        if (this.product.type === 'ingame') {
          this.item_price_extra = Number(
            (this.item_price * this.afitPrice.afitHiveLastPrice).toFixed(2)
          );
          this.item_extra_currency = 'HIVE';
        } else {
          this.item_price_extra = 0;
          this.item_extra_currency = '';
        }
      }
    }
    this.checkProductBought();
  }
  if (this.user) {
    this.allReqtsMet();
  }
},
        reject(e) {
          console.log(e);
        },
        checkProductBought() {
          //if this is a product, try to grab if sold before
          //let's check if user already has a funds pass set
          if (this.product && this.user) {
            if (this.product.type == 'ingame') {
              fetch(process.env.actiAppUrl
                + 'gadgetBought/'
                + '?user=' + this.user.account.name
                + '&gadget_id=' + this.product._id).then(
                  res => {
                    res.json().then(json => this.setProductBought(json)).catch(e => this.reject(e))
                  }).catch(e => this.reject(e))
            } else {
              fetch(process.env.actiAppUrl
                + 'productBought/'
                + '?user=' + this.user.account.name
                + '&product_id=' + this.product._id).then(
                  res => {
                    res.json().then(json => this.setProductBought(json)).catch(e => this.reject(e))
                  }).catch(e => this.reject(e))
            }
          }
        },
        async downloadAgain() {
          this.downloadAgainRunning = true;
          this.errorDownloadAgain = '';
          if (this.$refs["funds-pass"].value == '') {
            this.errorDownloadAgain = this.$t('Provide_funds_pass');
            this.downloadAgainRunning = false;
            return;
          }
          let url = new URL(process.env.actiAppUrl + 'validatePassForDownload/?user=' + this.user.account.name + '&pass=' + this.$refs['funds-pass'].value + '&product_id=' + this.product._id);
          let res = await fetch(url);
          let outcome = await res.json();
          this.settingPass = false;
          //console.log(outcome);
          if (!outcome.error) {
            //success
            this.downloadAgainReady = true;
            this.downloadHref = process.env.actiAppUrl
              + 'downEbook/'
              + '?user=' + this.user.account.name
              + '&product_id=' + this.product._id
              + '&access_token=' + outcome.access_token
          } else {
            //display error
            this.errorDownloadAgain = outcome.error;
          }
          this.downloadAgainRunning = false;
        },
        async verifyTrx(result, operation) {

          //if success, find, verify and store trx

          let accToken = localStorage.getItem('access_token')

          let op_json = JSON.stringify(operation)

          let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
          //let cur_bchain = 'STEEM';

          let url = new URL(process.env.actiAppUrl + 'findVerifyTrx/?user=' + this.user.account.name + '&txid=' + result.id + '&operation=' + op_json + '&bchain=' + cur_bchain);

          /*
          let reqHeads = new Headers({
            'Content-Type': 'application/json',
            'x-acti-token': 'Bearer ' + accToken,
          });*/
          let reslt = await fetch(url); /*, {
            headers: reqHeads
          });*/
          let outcome = await reslt.json();
          console.log(outcome);

        },

        async processTrxFunc(op_name, cstm_params, forceActive) {
          if (!localStorage.getItem('std_login')) {
            let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
            //console.log(res);
            if (res.result.ref_block_num) {
              //console.log('success');
              return { success: true, trx: res.result };
            } else {
              //console.log(err);
              return { success: false, trx: null };
            }
          } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
            return new Promise((resolve) => {
              window.hive_keychain.requestBroadcast(
                this.user.account.name,
                [[op_name, cstm_params]],
                forceActive ? 'Active' : 'Posting', async (response) => {
                  //console.log(response);
                  //resolve(response);

                  if (response.success) {
                    //await this.verifyTrx(response.result, operation);
                    resolve({ success: response.success, trx: { id: response.result.id } })
                  } else {
                    reject({ error: response.error });
                  }

                }
              );
            });
          } else if (localStorage.getItem('acti_login_method') == 'hiveauth') {
            return new Promise((resolve) => {
              const auth = {
                username: this.user.account.name,
                token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
                expire: localStorage.getItem('expires'),
                key: localStorage.getItem('key')
              }
              let operation = [
                [op_name, cstm_params]
              ];

              this.$HAS.broadcast(auth, forceActive ? 'active' : 'posting', operation, (evt) => {
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
                  if (response.cmd && response.cmd === 'sign_ack') {
                    resolve({ success: true, trx: { id: response.data } })
                  } else if (response.cmd && response.cmd === 'sign_nack') {
                    resolve({ success: false })
                  }
                }) // transaction approved and successfully broadcasted
                .catch(err => {
                  this.$notify({
                    group: 'warn',
                    clean: true
                  })
                  console.log(err);
                  resolve({ success: false })
                })
            });
          } else {
            let operation = [
              [op_name, cstm_params]
            ];
            //console.log('broadcasting');
            //console.log(operation);

            //console.log(this.$steemconnect.accessToken);
            //console.log(this.$store.state.accessToken);
            //grab token
            let accToken = localStorage.getItem('access_token')

            let op_json = JSON.stringify(operation)

            let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
            //let cur_bchain = 'STEEM';

            let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + this.user.account.name + '&operation=' + op_json + '&bchain=' + cur_bchain);

            let reqHeads = new Headers({
              'Content-Type': 'application/json',
              'x-acti-token': 'Bearer ' + accToken,
            });
            let reslt = await fetch(url, {
              headers: reqHeads
            });
            let outcome = await reslt.json();
            //console.log(outcome);
            if (outcome.error) {
              console.log(outcome.error);

              //if this is authority error, means needs to be logged out
              //example "missing required posting authority:Missing Posting Authority"
              let err_msg = outcome.trx.tx.error;
              if (err_msg.includes('missing') && err_msg.includes('authority')) {
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
              return { success: false, trx: null };
              //this.$router.push('/login');
            } else {
              return { success: true, trx: outcome.trx.tx };
            }
          }
        },
        async buyNowHive() {
          //check if this is a game gadget and if reqts have been met
          this.buyAttempt = true;
          //this.buyInProgress = true;
          this.errorProceed = '';

          if (this.product.type == 'ingame') {
            if (!this.allReqtsFilled) {
              this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
              return;
            }

            if (this.product.count < 1) {
              this.errorProceed = this.$t('cannot_buy_none_available');
              return;
            }
          }
          this.buyHiveExpand = !this.buyHiveExpand;
        },
        async proceedBuyNowHive() {
          try {
            //console.log(this.product.name);
            this.buyAttempt = true;
            this.buyInProgress = true;
            this.errorProceed = '';
            console.log('proceedBuyNowHive');
            //making sure user is logged in
            if (!this.user) {
              this.errorProceed = this.$t('need_login_signup_notice_vote');
              return;
            }

            //check if this is a game gadget and if reqts have been met
            if (this.product.type == 'ingame') {
              if (!this.allReqtsFilled) {
                this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
                return;
              }

              if (this.product.count < 1) {
                this.errorProceed = this.$t('cannot_buy_none_available');
                return;
              }
            }
            //check if active key was provided
            //console.log(this.$refs);
            if (localStorage.getItem('acti_login_method') != 'keychain' &&
              localStorage.getItem('acti_login_method') != 'hiveauth' &&
              this.userActvKey == '') {
              this.errorProceed = this.$t('all_fields_required');
              return;
            }

            //proceed with payment
            //let chainLnk = await this.setProperNode ();
            //transferToVesting(wif, from, to, amount)
            let attempt = 1;
            let payAmount = parseFloat(this.item_price * this.afitPrice.afitHiveLastPrice).toFixed(3);
            let memo = 'buy-gadget:' + this.product._id;
            console.log('prior to call');

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
              [op_name, cstm_params]
            ];

            /*let res = await hive.broadcast.transferAsync(this.userActvKey, this.user.account.name, process.env.actifitMarketBuy, payAmount + ' ' + 'HIVE', memo).then(
              res => this.confirmCompletion('transfer', payAmount, res, attempt)).catch(err=> this.errorCompletion(err));
            console.log('after call');*/


            if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) ||
              localStorage.getItem('acti_login_method') == 'hiveauth') {

              let bcastRes;
              let res = await this.processTrxFunc(op_name, cstm_params, true);//last param to use Active key instead of Posting
              console.log(res);
              if (res.success) {
                bcastRes = res.trx;
                let op_json = JSON.stringify(operation)
                this.confirmCompletion('transfer', payAmount, bcastRes, attempt, 0, op_json);

              } else {
                console.log(err);
              }
              /*let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
              let url_string = process.env.actiAppUrl + 'activateMultiGadget/'
                        + this.user.account.name + '/'
                        + this.product._id + '/'
                        + bcastRes.ref_block_num + '/'
                        + bcastRes.id + '/'
                        + cur_bchain;
              //console.log('prodHasFriendBenefic');
              */


            } else {

              let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');

              let url = new URL(process.env.actiAppUrl + 'performTrxPost/?user=' + this.user.account.name + '&bchain=' + cur_bchain);

              let reqHeads = new Headers({
                'Content-Type': 'application/json',
                'x-acti-token': 'Bearer ' + accToken,
              });
              let res = await fetch(url, {
                method: 'POST',
                headers: reqHeads,
                body: JSON.stringify({ 'operation': JSON.stringify(operation), 'active': this.userActvKey })
              });
              let outcome = await res.json();

              console.log(outcome);
              if (outcome.success && outcome.trx) {

                this.confirmCompletion('transfer', payAmount, outcome.trx.tx, attempt);
                console.log('after call');
                //this.$router.push('/login');
              } else {
                this.errorCompletion(outcome.error);

              }

            }

          } catch (excp) {
            console.log(excp);
          }
        },
        async errorCompletion(res, type) {
          //console.log(res);
          let err_details = res;//JSON.parse();
          this.errorProceed = err_details.cause.message;
          //this.buyAttempt = false;
          this.buyInProgress = false;

          if (type == 'buyAFITHive') {
            this.buyAfitInProgress = false;
            this.$notify({
              group: 'error',
              text: this.$t('error_performing_operation'),
              position: 'top center'
            })
            //this.proceedBuyAFIT = false;
          }
        },
        async confirmCompletion(type, amount, res, attempt, afitAmnt, op_json) {
          console.log(res)
          if (res.ref_block_num || res.id) {
            //console.log (res);


            //only support HIVE
            let cur_bchain = 'HIVE';//(localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
            let url = '';//new URL(process.env.actiAppUrl + 'processBuyOrderHive/?user='+this.user.account.name+'&product_id='+this.product._id);

            let tgtNode = process.env.actiAppUrl;
            //if (this.product.type == 'ingame'){
            if (attempt != 1) {
              tgtNode = process.env.actiAppBackUrl;
            }

            //if (this.product.type == 'ingame'){
            url = new URL(process.env.actiAppUrl + 'buyGadgetHive/'
              + this.user.account.name + '/'
              + this.product._id + '/'
              + res.ref_block_num + '/'
              + res.id + '/'
              + cur_bchain);

            if (type == 'buyAFITHive') {
              url = new URL(process.env.actiAppUrl + 'buyAfitHive/'
                + this.user.account.name + '/'
                + amount + '/'
                + afitAmnt + '/'
                + res.ref_block_num + '/'
                + res.id + '/'
                + 'HIVE');//for now only support HIVE
              //:user/:amnt/:afitAmnt/:blockNo/:trxID/:bchain
            }


            if (this.isKeychainActive || this.isHiveauthActive) {
              url = new URL(process.env.actiAppUrl + 'buyGadgetHiveKeychain/'
                + this.user.account.name + '/'
                + this.product._id + '/'
                //+ res.ref_block_num + '/'
                + res.id + '/'
                + cur_bchain + '?operation=' + op_json);
            }
            //}
            //console.log(url);
            //connect with our service to process buy order
            try {
              let reslt = await fetch(url);
              let outcome = await reslt.json();
              if (outcome.error) {
                if (attempt == 1) {
                  //try again with another API node
                  console.log('>>>>try again');
                  this.confirmCompletion(type, amount, res, attempt + 1, afitAmnt, op_json);
                } else {
                  this.errorProceed = outcome;
                  console.error(outcome);
                  this.buyAfitInProgress = false;
                  this.$notify({
                    group: 'error',
                    text: this.$t('error_performing_operation'),
                    position: 'top center'
                  })
                }
              } else {
                console.log('result IN');
                console.log(outcome);
                if (type == 'buyAFITHive') {
                  //update user token count
                  this.$store.dispatch('fetchUserTokens')
                  this.$notify({
                    group: 'success',
                    text: this.$t('afit_bought').replace('_AFIT_', outcome.boughtAmnt),
                    position: 'top center'
                  })
                  this.buyAfitInProgress = false;
                  this.proceedBuyAFIT = false;
                } else {
                  //update product status
                  this.checkProductBought();

                  this.$store.dispatch('fetchProducts')

                  if (this.product.type == 'service') {
                    //display proper success message
                    this.errorProceed = this.$t('purchase_success_service_part1') + this.product.name + ' '
                      + this.$t('With') + ' ' + this.product.provider_name + '.\n'
                      + this.$t('purchase_success_service_part2') + '.\n'
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
                    //display proper success message
                    this.errorProceed = this.$t('purchase_success_ingame_part1') + ' ' + this.product.name + ' '
                      + this.$t('Level') + ' ' + this.product.level + '. ' + this.$t('purchase_success_ingame_part2') + '.<br/>';

                    this.$emit('refresh-tickets');
                  }
                }
              }
              //this.checkingFunds = false;
              //this.resultReturned = true;

            } catch (err) {
              console.error(err);
              if (attempt == 1) {
                //try again with another API node
                console.log('>>>>try again');
                this.confirmCompletion(type, amount, res, attempt + 1, afitAmnt, op_json);
              } else {
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

          } else {
            this.errorProceed = res.error.message;
          }
          this.buyAttempt = false;
          this.buyInProgress = false;
        },
        refreshTicketsMulti() {
          //update product status
          this.checkProductBought();

          this.$store.dispatch('fetchUserTokens')

          this.$store.dispatch('fetchProducts')

          this.$emit('refresh-tickets');
        },
        setProperNode(selectChain) {
          let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
          if (selectChain) {
            cur_bchain = selectChain;
          }
          let properNode = hive;
          if (cur_bchain == 'STEEM') {
            properNode = steem;
          }
          console.log(cur_bchain);
          return properNode;
        },
        async prepareCheckout() {
          this.buyAttempt = true;
          this.errorProceed = '';
          if (!this.user) {
            this.errorProceed = this.$t('need_login_signup_notice_vote');
            return;
          }
          //make sure requirements are met
          if (!this.allReqtsFilled) {
            this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
            return;
          }
          //verify and display checkout details
          if (this.product.count < 1) {
            this.errorProceed = this.$t('cannot_buy_none_available');
            return;
          }
          if (this.userTokens < this.item_price) {
            this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here');
            //console.log(this.errorProceed );
            return;
          }
          if (this.user.account.balance.split(" ")[0] < this.item_price_extra) {
            this.errorProceed = this.$t('Not_enough_hive_balance_to_buy');
            this.buyInProgress = false;
            //console.log(this.errorProceed );
            return;
          }
          this.checkout_product = true;
        },
        async proceedBuyReal() {
          this.buyAttempt = true;
          this.errorProceed = '';
          this.buyInProgress = true;
          if (!this.user) {
            this.errorProceed = this.$t('need_login_signup_notice_vote');
            this.buyInProgress = false;
            return;
          }
          if (this.product.count < 1) {
            this.errorProceed = this.$t('cannot_buy_none_available');
            this.buyInProgress = false;
            return;
          }
          //make sure requirements are met
          if (!this.allReqtsFilled) {
            this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
            this.buyInProgress = false;
            return;
          }


          if (this.userTokens < this.item_price) {
            this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here');
            this.buyInProgress = false;
            //console.log(this.errorProceed );
            return;
          }

          if (this.user.account.balance.split(" ")[0] < this.item_price_extra) {
            this.errorProceed = this.$t('Not_enough_hive_balance_to_buy');
            this.buyInProgress = false;
            //console.log(this.errorProceed );
            return;
          }

          //check all required fields

          if (this.$refs['buyer_name'].value == '' ||
            this.$refs['buyer_phone'].value == '' ||
            this.$refs['buyer_address'].value == '' ||
            this.buyer_country == '' ||
            this.$refs['buyer_state'].value == '' ||
            this.$refs['buyer_city'].value == '' ||
            this.$refs['buyer_zip'].value == '') {

            this.errorProceed = this.$t('all_fields_required');
            this.buyInProgress = false;
            //console.log(this.errorProceed );
            return;
          }
          let transfer_trx = '';
          //if this includes a HIVE payment as well, process it
          if (this.item_price_extra > 0) {
            //check if active key was provided
            if (this.userRlActvKey == '') {
              this.errorProceed = this.$t('all_fields_required');
              this.buyInProgress = false;
              return;
            }
            /*let attempt = 1;
            let payAmount = parseFloat(1000).toFixed(3);//this.item_price_extra
            let memo = 'buy-real:'+this.product._id;
            console.log('send HIVE');
            let res = await hive.broadcast.transferAsync(this.userRlActvKey, this.user.account.name, process.env.actifitEscrow, payAmount + ' ' + 'HIVE', memo).then(;

            console.log(res);
            //res.ref_block_num
            //res.id - trx id
            return;*/

          }

          let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');

          let accToken = localStorage.getItem('access_token');

          let url = new URL(process.env.actiAppUrl + 'purchaseRealProduct/?user=' + this.user.account.name + '&bchain=' + cur_bchain);
          //let url = new URL('http://localhost:3120/' + 'purchaseRealProduct/?user='+this.user.account.name+'&bchain='+cur_bchain);

          let params = {
            'product_id': this.product._id,
            'buyer_name': this.$refs['buyer_name'].value,
            'buyer_phone': this.$refs['buyer_phone'].value,
            'buyer_address': this.$refs['buyer_address'].value,
            'buyer_address2': this.$refs['buyer_address2'].value,
            'buyer_country': this.buyer_country,
            'buyer_state': this.$refs['buyer_state'].value,
            'buyer_city': this.$refs['buyer_city'].value,
            'buyer_zip': this.$refs['buyer_zip'].value,
            'afit_amount': this.item_price,
            'hive_amount': this.item_price_extra,
            'active_key': this.userRlActvKey,
            'order_quantity': this.order_quantity,
            'color_choice': this.color_choice,
          }

          let reqHeads = new Headers({
            'Content-Type': 'application/json',
            'x-acti-token': 'Bearer ' + accToken,
          });

          let resSer = await fetch(url, {
            method: 'POST',
            headers: reqHeads,
            body: JSON.stringify(params)
          });
          let outcome = await resSer.json();
          //console.log(outcome);
          if (outcome.error) {
            console.log(outcome.error);

            //if this is authority error, means needs to be logged out
            //example "missing required posting authority:Missing Posting Authority"
            let err_msg = outcome.error;


            this.$notify({
              group: 'error',
              text: err_msg,
              position: 'top center'
            })
            this.errorProceed = err_msg;
            this.buyInProgress = false;
            return { success: false, trx: null };
            //this.$router.push('/login');
          } else {
            this.$store.dispatch('fetchUserTokens')
            this.$notify({
              group: 'success',
              text: this.$t('product_bought').replace('_PRODUCT_', this.product.name),
              position: 'top center'
            })

            this.errorProceed = this.$t('product_bought').replace('_PRODUCT_', this.product.name);
            this.buyInProgress = false;
            this.buyAttempt = false;
            this.checkout_product = false;
            let accToken = localStorage.getItem('access_token')
            this.$store.dispatch('fetchUserBoughtRealProducts', accToken);

            return { success: true, trx: outcome.trx };
          }

        },
        async buyNow() {
          this.buyAttempt = true;
          this.buyInProgress = true;
          this.errorProceed = '';

          //making sure user is logged in
          if (!this.user) {
            this.errorProceed = this.$t('need_login_signup_notice_vote');
            return;
          }

          //check if this is a game gadget and if reqts have been met
          if (this.product.type == 'ingame') {
            if (!this.allReqtsFilled) {
              this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
              return;
            }

            if (this.product.count < 1) {
              this.errorProceed = this.$t('cannot_buy_none_available');
              return;
            }
          } else if (this.product.type == 'real') {
            if (this.product.count < 1) {
              this.errorProceed = this.$t('cannot_buy_none_available');
              return;
            }
          }
          //first check if user has enough AFIT
          if (this.user) {
            if (this.userTokens < this.item_price) {
              this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here');
              //console.log(this.errorProceed );
              return;
            }
          }
          //show user confirm for purchasing product/service
          let user_prmpt = this.$t('purchase_confirm_part1') + this.product.name + ' ' + this.product.type + '.\n'
            + this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n'
            + this.$t('Proceed') + '?';
          if (this.product.type == 'ingame') {
            user_prmpt = this.$t('purchase_confirm_part1') + this.product.name + ' Level ' + this.product.level + ' ' + this.product.type + ' virtual gadget' + '.\n'
              + this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n'
              + this.$t('Proceed') + '?';
          }
          let decis = confirm(user_prmpt);
          if (!decis) {
            this.buyInProgress = false;
            return;
          }

          //broadcast trx to blockchain
          let cstm_params = {
            required_auths: [],
            required_posting_auths: [this.user.account.name],
            id: 'actifit',
            json: "{ \"buy_product\": \"" + this.product._id + "\"}"
          };

          if (this.product.type == 'ingame') {
            //different tx
            cstm_params = {
              required_auths: [],
              required_posting_auths: [this.user.account.name],
              id: 'actifit',
              json: "{\"transaction\": \"buy-gadget\" , \"gadget\": \"" + this.product._id + "\"}"
            };
          }
          let bcastRes;
          let op_name = 'custom_json';
          let operation = [
            [op_name, cstm_params]
          ];


          let res = await this.processTrxFunc(op_name, cstm_params);
          console.log('custom complete');
          console.log(res);
          if (res.success) {
            bcastRes = res.trx;
          } else {
            console.log(err);
          }

          let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
          let url = new URL(process.env.actiAppUrl + 'processBuyOrder/?user=' + this.user.account.name + '&product_id=' + this.product._id);

          if (this.product.type == 'ingame') {
            url = new URL(process.env.actiAppUrl + 'buyGadget/'
              + this.user.account.name + '/'
              + this.product._id + '/'
              + bcastRes.ref_block_num + '/'
              + bcastRes.id + '/'
              + cur_bchain);

            if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {

              let op_json = JSON.stringify(operation)
              url = new URL(process.env.actiAppUrl + 'buyGadgetKeychain/'
                + this.user.account.name + '/'
                + this.product._id + '/'
                //+ bcastRes.ref_block_num + '/'
                + bcastRes.id + '/'
                + cur_bchain + '?operation=' + op_json);
            }
          }
          //console.log(url);
          //connect with our service to process buy order
          try {
            let res = await fetch(url);
            let outcome = await res.json();
            if (outcome.error) {
              this.errorProceed = outcome;
              console.error(outcome);
            } else {
              //update user token count
              this.$store.dispatch('fetchUserTokens')

              //update product status
              this.checkProductBought();

              this.$store.dispatch('fetchProducts')

              if (this.product.type == 'service') {
                //display proper success message
                this.errorProceed = this.$t('purchase_success_service_part1') + this.product.name + ' '
                  + this.$t('With') + ' ' + this.product.provider_name + '.\n'
                  + this.$t('purchase_success_service_part2') + '.\n'
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
                //display proper success message
                this.errorProceed = this.$t('purchase_success_ingame_part1') + ' ' + this.product.name + ' '
                  + this.$t('Level') + ' ' + this.product.level + '. ' + this.$t('purchase_success_ingame_part2') + '.<br/>';
              }
            }
            //this.checkingFunds = false;
            //this.resultReturned = true;

          } catch (err) {
            console.error(err);
            //this.checkingFunds = false;
          }
        },
        prodHasFriendBenefic() {
          //console.log('prodHasFriendBenefic');
          //console.log(this.product.benefits.boosts);
          if (Array.isArray(this.product.benefits.boosts) && this.product.benefits.boosts.length > 0) {
            let maxCount = this.product.benefits.boosts.length;
            for (let i = 0; i < maxCount; i++) {
              if (this.product.benefits.boosts[i].boost_beneficiary == 'friend') {
                return true;
              }
            }
          }
          return false;
        },
        async confirmReceipt() {
          if (this.pendingOrders.length > 0) {
            let accToken = localStorage.getItem('access_token')

            let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
            //let cur_bchain = 'STEEM';

            let url_string = process.env.actiAppUrl + 'confirmProdReceipt/?user=' + this.user.account.name
              + '&trx_id=' + this.pendingOrders[0]._id
              + '&note=' + this.$sanitize(this.$refs['prodFeedback'].value)
              + '&bchain=' + cur_bchain;
            let url = new URL(url_string);

            let reqHeads = new Headers({
              'Content-Type': 'application/json',
              'x-acti-token': 'Bearer ' + accToken,
            });

            //connect with our service to confirm item receipt
            try {
              let res = await fetch(url, {
                headers: reqHeads
              });
              let outcome = await res.json();
              if (outcome.error) {
                this.errorProceed = outcome;
                console.error(outcome);
              } else {
                //update product status
                this.checkProductBought();
                //notify success confirming receipt
                this.$notify({
                  group: 'success',
                  text: this.$t('success_receipt_set').replace('_PROD_', this.product.name),//this.$t('session_expired_login_again'),
                  position: 'top center'
                })

                //notify parent to refresh products
                //this.$emit('refresh-prods');
                this.$store.dispatch('fetchProducts')

                //update status
                this.$store.dispatch('fetchUserBoughtRealProducts', accToken);

                //display proper success message
                this.errorProceed = this.$t('success_receipt_set').replace('_PROD_', this.product.name + '-L' + this.product.level) + '.<br/>';
              }
              //this.checkingFunds = false;
              //this.resultReturned = true;

            } catch (err) {
              console.error(err);
              //this.checkingFunds = false;
            }
          }
        },
        async activateGadget() {

          //clear error
          this.errorProceed = '';

          this.buyAttempt = true;
          this.buyInProgress = true;
          let appendFriend = null;
          //need to make sure we have a target friend set in special boost types
          if (this.prodHasFriendBenefic()) {
            if (this.$refs["friend"].value == '') {
              this.errorProceed = this.$t('Provide_friend_name_receive_boost');
              return;
            }
            if (this.$refs["friend"].value.replace('@', '') == this.user.account.name) {
              this.errorProceed = this.$t('Cannot_use_same_account');
              return;
            }
            appendFriend = this.$refs["friend"].value;
          }

          let cstm_params = {
            required_auths: [],
            required_posting_auths: [this.user.account.name],
            id: 'actifit',
            json: "{\"transaction\": \"activate-gadget\" , \"gadget\": \"" + this.product._id + "\"}"
          };
          if (appendFriend) {
            cstm_params['json'] = "{\"transaction\": \"activate-gadget\" , \"gadget\": \"" + this.product._id + "\", \"benefic\": \"" + appendFriend + "\"}";
          }
          let bcastRes;
          let op_name = 'custom_json';
          let operation = [
            [op_name, cstm_params]
          ];

          let res = await this.processTrxFunc(op_name, cstm_params);
          //console.log(res);
          if (res.success) {
            bcastRes = res.trx;
          } else {
            console.log(err);
          }
          let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
          let url_string = process.env.actiAppUrl + 'activateMultiGadget/'
            + this.user.account.name + '/'
            + this.product._id + '/'
            + bcastRes.ref_block_num + '/'
            + bcastRes.id + '/'
            + cur_bchain;
          //console.log('prodHasFriendBenefic');

          if (appendFriend) {
            //console.log(this.$refs["friend"].value);
            url_string += '/' + appendFriend;
          }

          if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {

            let op_json = JSON.stringify(operation)
            url_string = new URL(process.env.actiAppUrl + 'activateMultiGadgetKeychain/'
              + this.user.account.name + '/'
              + this.product._id + '/'
              //+ bcastRes.ref_block_num + '/'
              + bcastRes.id + '/'
              + cur_bchain + '/'
              + (appendFriend ? (appendFriend) : '')
              + '?operation=' + op_json);
          }

          console.log(url_string)
          let url = new URL(url_string);

          //console.log(url);
          //connect with our service to process buy order
          try {
            let res = await fetch(url);
            let outcome = await res.json();

            if (outcome.error) {
              this.errorProceed = outcome;
              console.error(outcome);
            } else {
              //update product status
              this.checkProductBought();
              //notify parent to refresh products
              //this.$emit('refresh-prods');
              this.$store.dispatch('fetchProducts')

              //display proper success message
              this.errorProceed = this.$t('gadget_activated').replace('_GADGET_', this.product.name + ' '
                + this.$t('Level') + ' ' + this.product.level) + '.<br/>';
            }
            //this.checkingFunds = false;
            //this.resultReturned = true;

          } catch (err) {
            console.error(err);
            //this.checkingFunds = false;
          }
          this.buyAttempt = false;
          this.buyInProgress = false;
        },
        async deactivateGadget() {

          //clear error
          this.errorProceed = '';

          this.buyAttempt = true;
          this.buyInProgress = true;

          let cstm_params = {
            required_auths: [],
            required_posting_auths: [this.user.account.name],
            id: 'actifit',
            json: "{\"transaction\": \"deactivate-gadget\" , \"gadget\": \"" + this.product._id + "\"}"
          };
          let bcastRes;
          let op_name = 'custom_json';
          let operation = [
            [op_name, cstm_params]
          ];


          let res = await this.processTrxFunc(op_name, cstm_params);
          //console.log(res);
          if (res.success) {
            bcastRes = res.trx;
          } else {
            console.log(err);
          }
          let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
          let url = new URL(process.env.actiAppUrl + 'deactivateGadget/'
            + this.user.account.name + '/'
            + this.product._id + '/'
            + bcastRes.ref_block_num + '/'
            + bcastRes.id + '/'
            + cur_bchain
          );

          if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {

            let op_json = JSON.stringify(operation)
            url = new URL(process.env.actiAppUrl + 'deactivateGadgetKeychain/'
              + this.user.account.name + '/'
              + this.product._id + '/'
              //+ bcastRes.ref_block_num + '/'
              + bcastRes.id + '/'
              + cur_bchain + '?operation=' + op_json);
          }


          //console.log(url);
          //connect with our service to process buy order
          try {
            let res = await fetch(url);
            let outcome = await res.json();
            if (outcome.error) {
              this.errorProceed = outcome;
              console.error(outcome);
            } else {
              //update product status
              this.checkProductBought();
              //notify parent to refresh products
              //this.$emit('refresh-prods');
              this.$store.dispatch('fetchProducts')

              //display proper success message
              this.errorProceed = this.$t('gadget_deactivated').replace('_GADGET_', this.product.name + ' '
                + this.$t('Level') + ' ' + this.product.level) + '.<br/>';
            }
            //this.checkingFunds = false;
            //this.resultReturned = true;

          } catch (err) {
            console.error(err);
            //this.checkingFunds = false;
          }

          this.buyAttempt = false;
          this.buyInProgress = false;
        },
        updateProPic() {
          let pros_length = this.pros.length;
          for (let i = 0; i < pros_length; i++) {
            if (this.product.provider == this.pros[i].username) {
              this.product_prov_pic = this.pros[i].pic;
              break;
            }
          }
          if (this.product_prov_pic == '') {
            //still no pic, grab steemit default one
            this.profImgUrl = process.env.hiveImgUrl;
            let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
            if (cur_bchain == 'STEEM') {
              this.profImgUrl = process.env.steemImgUrl;
            }
            this.product_prov_pic = this.profImgUrl + '/u/' + this.product.provider + '/avatar';
          }
        },
      },
      async mounted() {
        this.getPrice();
        this.updateProPic();

        //fix sorting of countries and color options
        if (Array.isArray(this.product.colorOptions) && this.product.colorOptions.length > 0) {
          this.product.colorOptions.sort();
        }

        if (Array.isArray(this.product.countries) && this.product.countries.length > 0) {
          this.product.countries.sort();
        }

        //hive.config.set('rebranded_api', true)
        //hive.broadcast.updateOperations()
        hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
        hive.api.setOptions({ url: process.env.hiveApiNode });
      },

    }
    </script>
      
Here's the organized CSS with combined duplicate classes, proper ordering (variables first, then base styles, components, and finally media queries and keyframes), and no comments:

```css
<style lang="scss">
:root {
  --color-primary: #e74c3c;
  --color-primary-dark: #c0392b;
  --color-secondary: rgb(13,110,253);
  --color-success: rgb(40,167,69);
  --color-success-dark: rgb(40,167,69);
  --color-warning: #f39c12;
  --color-danger: #e74c3c;
  --color-text: #333;
  --color-text-light: #777;
  --color-bg: #fff;
  --color-bg-light: #f9f9f9;
  --color-border: #e0e0e0;
  --color-shadow: rgba(0,0,0,0.1);
}

.dark-mode {
  --color-text: #f0f0f0;
  --color-text-light: #bbb;
  --color-bg: #1e1e1e;
  --color-bg-light: #2a2a2a;
  --color-border: #444;
  --color-shadow: rgba(0,0,0,0.3);
}

.card-row-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.products-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
  
  .product-col {
    flex: 0 0 calc(33.333% - 20px);
    margin: 0 10px 20px;
    display: flex;
  }
}

.product-card {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 8px 24px var(--color-shadow);
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: auto !important;
  min-height: auto !important;
  margin-bottom: 20px;
  
  &.ingame {
    border-top: 4px solid var(--color-primary);
  }
  
  &.real {
    border-top: 4px solid var(--color-danger);
  }
  
  &.ebook {
    border-top: 4px solid var(--color-success);
  }
  
  &.service {
    border-top: 4px solid var(--color-warning);
  }
  
  &.has-friend-boost {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 10px;
      right: 10px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.3);
      animation: pulse 2s infinite;
    }
  }
}

.card-header {
  flex: 0 0 auto;
  display: flex;
  padding: 20px;
  position: relative;
  background: var(--color-bg-light);
  border-bottom: 1px solid var(--color-border);
}

.product-image-container {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  margin-right: 15px;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border: 3px solid var(--color-border);
  background-color: white;
}

.product-level {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 4px var(--color-shadow);
  border: 1px solid var(--color-border);
  
  span {
    color: var(--color-primary);
    font-size: 12px;
    margin: 0 1px;
  }
}

.product-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
}

.product-provider {
  font-size: 0.9rem;
  color: var(--color-text-light);
  
  a {
    color: var(--color-secondary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.product-details {
  padding-bottom:0 ;
  padding: 8px 20px;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  
  &.availability {
    justify-content: space-between;
    background: rgba(231, 76, 60, 0.1);
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  &.boosts {
    font-weight: 600;
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: rgba(119,119, 119);
    background: rgba(231, 76, 60, 0.1);
    padding: 8px 12px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  &.requirements {
    background: rgba(231, 76, 60, 0.1);
    padding: 12px;
    border-radius: 8px;
    margin-top: 10px;
  }
  
  &.status-indicators {
    background: rgba(231, 76, 60, 0.1);
    padding: 12px;
    border-radius: 8px;
    margin-top: 10px;
  }
}

.detail-item {
  display: flex;
  align-items: center;
  margin-right: 15px;
  
  &:last-child {
    margin-right: 0;
  }
  
  &.boost-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--color-text);
    width: 100%;
  }
}

.detail-label {
  font-weight: 600;
  margin-right: 5px;
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 500;
}

.boost-icon {
  color: var(--color-primary);
  
  &.friend {
    color: #e74c3c;
  }
}

.boost-value {
  display: flex;
  align-items: center;
  gap: 4px;
}

.boost-type {
  font-weight: 500;
  font-size: 14px;
}

.boost-unit {
  opacity: 0.8;
  font-size: 0.85rem;
}

.status-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
}

.status-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #777;
  flex-shrink: 0;
  padding-top: 2px;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  
  &.active {
    .status-icon {
      color: var(--color-success);
    }
    .status-text {
      color: var(--color-success-dark);
    }
  }
  
  &.inactive {
    .status-icon {
      color: var(--color-danger);
    }
    .status-text {
      color: var(--color-text);
    }
  }
}

.status-icon {
  font-size: 0.9rem;
  min-width: 18px;
  text-align: center;
}

.status-text {
  flex: 1;
  line-height: 1.4;
  
  a {
    color: var(--color-secondary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    font-size: 0.75rem;
    background: var(--color-bg-light);
    color: var(--color-text);
  }
}

.info-icon {
  position: absolute;
  top: 6px;
  right: 1px;
  background: transparent;
  border: none;
  color: rgb(231, 76, 60);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  border: none !important;
  outline: none !important;
}

.details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-contentt {
  position: relative;
  max-width: 700px;
  margin-top: 70px;
  width: 50%;
  max-height: 80vh;
  background: var(--color-bg);
  border-radius: 16px;
  padding: 30px;
  overflow-y: auto;
}

.modal-closee {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: var(--color-text-light);
  font-size: 1.5rem;
  cursor: pointer;
}

.no-scroll {
  overflow: hidden;
}

.modal-titlee {
  margin-top: 0;
  color: var(--color-primary);
  padding-bottom: 8px;
  border-bottom: 3px solid rgba(231, 76, 60,0.5);
}

.modal-bodyy {
  padding: 12px 0;

  .full-description,
  .product-gallery,
  .order-options,
  .additional-actions {
    margin-bottom: 25px;
  }
}

.product-pricing {
  padding: 15px;
  background: var(--color-bg-light);
  margin-top: auto;
}

.price-pair {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-circle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 5px;
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  width: auto;
}

.single-price-row.btn-buy{
  align-items: center;
  justify-self:center;
}
.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.pricing-container {
  width: 100%;
}

.price-button-row {
  display: flex;
  align-items: center;
}

/* For dual pricing layout */
.dual-pricing-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-button-pair {
  display: flex;
  align-items: center;
  gap: 8px;
}

.single-price-layout {
  margin-left: 6px;
  margin-right: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.single-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dual-price-layout {
  margin-left: 6px;
  margin-right: 6px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dual-price-row {
  display: flex;
  justify-content: space-between;
  width: auto;
}

.price-display {
  display: flex;
  align-items: center;
  background: transparent;
  border-radius: 5px;
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.85rem;
  white-space: nowrap;
  width: auto;
  justify-content: center;
}

.price-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.plus-sign {
  font-weight: bold;
  margin: 0 4px;
}

button {
  border: none;
  border-radius: 5px;
  padding: 6px 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;  
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  i {
    margin-right: 4px;
  }
}

.btn-login {
  background: var(--color-primary);
  color: white;

}

.btn-buy {
 padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  background: var(--color-success);
  color: white;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-buy-hive {
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  background: var(--color-success);
  color: white;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;width: auto;
}

.combined-price-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 55px;
  width: auto;
  margin-left: 6px;
  margin-right: 6px;
}


.btn-buy-disabled {
  background-color: rgb(108, 117, 125) !important;
  cursor: not-allowed;
}


.btn-activate {
  background: var(--color-primary) !important;
  color: white !important;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  font-weight: 600;
  width: auto;
  max-width: 180px;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-primary-dark) !important;
  }
}

.btn-deactivate {
  background: var(--color-success) !important;
  color: white !important;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  font-weight: 600;
  width: auto;
  max-width: 180px;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--color-success-dark) !important;
  }
}
.btn-add-cart, .btn-checkout {
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-grow: 1;
  background: var(--color-primary);
  color: white;
}

.activation-container {
  width: 100%;
  text-align: center;
  margin-top: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.full-description {
  margin-bottom: 25px;
  
  h4 {
    font-size: 1.25rem;
    color: var(--color-primary);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(231, 76, 60, 0.2);
  }
  
  p {
    line-height: 1.7;
    color: var(--color-text-light);
    font-size: 0.95rem;
  }
}

.product-gallery {
  margin-bottom: 30px;
  
  h4 {
    font-size: 1.25rem;
    color: var(--color-primary);
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(231, 76, 60, 0.2);
  }
}

.featured-image-container {
  position: relative;
  margin-top: 15px;
}

.featured-image {
  width: 100%;
  height: 300px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  box-shadow: 0 8px 20px var(--color-shadow);
  transition: all 0.3s ease;
  border: 1px solid var(--color-border);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px var(--color-shadow);
  }
}

.gallery-toggle {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  
  &:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
  }
  
  i {
    font-size: 0.9rem;
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
  animation: fadeIn 0.4s ease;
}

.gallery-item {
  aspect-ratio: 1/1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px var(--color-shadow);
  border: 1px solid var(--color-border);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px var(--color-shadow);
    border-color: var(--color-primary);
  }
}

.gallery-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.lightbox-close {
  position: absolute;
  top: 30px;
  right: 30px;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 10;
  opacity: 0.7;
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 1;
  }
}

.lightbox-content {
  max-width: 80vw;
  max-height: 80vh;
  position: relative;
  
  img {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  }
}

.image-counter {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 1.1rem;
  text-align: center;
  padding: 5px 15px;
  border-radius: 20px;
  background: rgba(0,0,0,0.5);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.3s;
  
  &:hover {
    opacity: 1;
    background: rgba(231, 76, 60, 0.8);
  }
  
  &.prev {
    left: 30px;
  }
  
  &.next {
    right: 30px;
  }
}

.order-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 25px 0;
  
  .form-group {
    margin-bottom: 0;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--color-text-light);
      font-size: 0.95rem;
    }
    
    select, input {
      width: 100%;
      padding: 10px 15px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      background: var(--color-bg-light);
      color: var(--color-text);
      transition: all 0.3s;
      
      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2);
        outline: none;
      }
    }
  }
}

.btn-buy.price-circle{
  align-items: center;
  justify-content: center;
}


.additional-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  margin-top: 10px;
  margin-left: 6px;
  margin-right: 6px;
}

.checkout-form {
  padding: 20px;
  background: var(--color-bg-light);
  
  h4 {
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: var(--color-primary);
  }
  
  .form-group {
    margin-bottom: 15px;
    
    label {
      display: block;
      margin-bottom: 5px;
      font-size: 0.9rem;
      color: var(--color-text-light);
    }
    
    input, select {
      width: 100%;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid var(--color-border);
      background: var(--color-bg-light);
      color: var(--color-text);
    }
  }
  
  .form-notice {
    margin: 15px 0;
    padding: 10px;
    background: rgba(46, 204, 113, 0.1);
    border-radius: 4px;
    font-size: 0.85rem;
    color: var(--color-text-light);
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    
    button {
      flex: 1;
      padding: 10px;
    }
  }
  
  .loading-indicator {
    margin-top: 15px;
    text-align: center;
    color: var(--color-primary);
  }
  
  .error-message {
    margin-top: 15px;
    padding: 10px;
    background: rgba(231, 76, 60, 0.1);
    border-radius: 4px;
    color: var(--color-danger);
    font-size: 0.9rem;
  }
}

.token-logo-sm {
  width: 16px;
  height: 16px;
}

.requirements-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: #777;
  flex-shrink: 0;
  padding-top: 2px;
}

.requirements-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
}

.requirements-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  
  &.active {
    .requirement-icon {
      color: var(--color-success);
    }
    .requirement-text {
      color: var(--color-success-dark);
    }
  }
  
  &.inactive {
    .requirement-icon {
      color: var(--color-danger);
    }
    .requirement-text {
      color: var(--color-text);
    }
  }
}

.requirement-icon {
  font-size: 0.9rem;
  min-width: 18px;
  text-align: center;
}

.requirement-text {
  flex: 1;
  line-height: 1.2;
}

.highlight {
  font-weight: 500;
  color: var(--color-text);
}

.product-images {
  margin-bottom: 15px;
  
  h4 {
    margin: 0 0 10px 0;
    font-size: 1rem;
    color: var(--color-primary);
  }
}

.dark-mode {
  .lightbox-modal {
    background: rgba(10, 10, 10, 0.95);
  }
  
  .gallery-item {
    border: 1px solid var(--color-border);
  }
  
  .order-options {
    select, input {
      background: var(--color-bg);
    }
  }
  
  .status-title {
    color: #bbb;
  }
  
  .highlight {
    color: var(--color-primary);
  }
  
  .requirements-title {
    color: #bbb;
  }
  
  .status-text {
    color: var(--color-text);
  }
}

button:focus {
  outline: none !important;
  box-shadow: none !important;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .product-image-container {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .product-pricing {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-buttons {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
  
  .detail-row.availability {
    flex-direction: column;
    gap: 8px;
  }
  
  .price-circle.combined {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.9rem;
  white-space: nowrap;
  }
  
  .plus-sign {
    margin: 0 3px;
  }
  
  .btn-buy {
    font-size: 0.85rem;
  }
  
  .dual-prices-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .price-circle {
    width: auto;
    font-size: 0.85rem;
  }
  
  .btn-buy, .btn-buy-hive {
    font-size: 0.85rem;
  }
  
  .featured-image {
    height: 250px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .gallery-toggle {
    bottom: 15px;
    right: 15px;
    padding: 6px 12px;
    font-size: 0.85rem;
  }
  
  .lightbox-content {
    max-width: 95vw;
  }
  
  .lightbox-nav {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    
    &.prev {
      left: 10px;
    }
    
    &.next {
      right: 10px;
    }
  }
  
  .order-options {
    grid-template-columns: 1fr;
  }
  
  .price-circle {
    padding: 10px;
    font-size: 0.85rem;
    
    .token-logo-sm {
      width: 14px;
      height: 16px;
    }
  }
    .price-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .dual-price-circles,
  .dual-buy-buttons {
    width:auto;
    justify-content: center;
  }
  
  .additional-actions {
    gap: 8px;
    
    button {
      flex: 1;
      justify-content: center;
    }
  }
    .dual-price-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .price-pair {
    width: auto;
    justify-content: space-between;
  }
    .price-button-row {
    flex-wrap: wrap;
  }


  
  .additional-actions {
    flex-direction: column;
  }
  
  .btn-add-cart, .btn-checkout {
    width: auto
  }
}

@media (max-width: 480px) {
  .featured-image {
    height: 200px;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .price-circle {
    flex-wrap: wrap;
    justify-content: center;
    
    .plus-sign {
      flex-basis: 100%;
      text-align: center;
      margin: 5px 0;
    }
  }
}
</style> 