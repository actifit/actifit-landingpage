<template>
  <!-- single card item for approved product -->
  <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center pro-card product-card col-sm-4"
    :class="[productTypeBorder, { 'christmas-card': product.specialevent && product.event == 'Christmas' }]">

    <!-- header: title, level, media, type -->
    <div class="text-center ">
      <div class="card-title-row">
        <h3 class="pro-name mb-0">
          {{ this.product.name }}
          <span class="level-badge" v-if="!product.specialevent && this.product.level">{{ $t('level_short') }}{{ this.product.level }}</span>
        </h3>
      </div>

      <div class="card-media-row">
        <div class="card-media-col"
          v-if="this.product.type == 'ingame' || this.product.type == 'real'"
          :title="!product.specialevent ? this.product.name + ' - Level ' + this.product.level : this.product.name">
          <div v-if="this.product.image.startsWith('http')" :class="'avatar-' + this.product.level"
            class="avatar pro-card-av mx-auto" :style="'background-image: url(' + this.product.image + ');'"></div>
          <div v-else :class="'avatar-' + this.product.level" class="avatar pro-card-av mx-auto"
            :style="'background-image: url(img/gadgets/' + this.product.image + ');'"></div>
          <div class="level-stars">
            <span v-for="iterl in this.product.level" :key="iterl">
              <i class="fas fa-star text-brand"></i>
            </span>
          </div>
        </div>
        <div class="card-media-col" v-else>
          <a :href="'/' + this.product.provider">
            <div class="avatar pro-card-av mx-auto mb-1" :style="'background-image: url(' + product_prov_pic + ');'">
            </div>
          </a>
        </div>

        <div class="card-type-col" :class="{ 'card-type-col-ingame': this.product.type == 'ingame' }">
          <div v-if="this.product.type == 'ingame'" class="ingame-type-stack">
            <div class="avatar gaming-label mx-auto"
              :style="'background-image: url(img/gadgets/gaming.png);'"></div>
            <h3 class="product-type mb-1">{{ renderProdType }}</h3>
          </div>
          <h4 class="type-icon" v-else-if="this.product.type == 'ebook'"><i class="fas fa-book"></i></h4>
          <h4 class="type-icon" v-else-if="this.product.type == 'service'"><i class='fas fa-phone-volume'></i></h4>
          <h3 v-else class="product-type mb-1">{{ renderProdType }}
            <span v-if="this.product.type != 'ingame' && this.product.type != 'real'">{{ $t('By') }}</span>
          </h3>
          <div class="provider-link">
            <a v-if="this.product.type == 'service'" :href="'/consultants/?prof=' + this.product.provider_name">{{
              this.product.provider_name }}</a>
            <a v-else :href="'/' + this.product.provider">{{ this.product.provider_name }}</a>
            <span v-if="this.product.type == 'real'" class="real-currency-badges">
              <span v-if="this.item_price_extra > 0"><img class="token-logo-sm" src="/img/HIVE.png">+</span>
              <span><img class="token-logo-sm" src="/img/actifit_logo.png"></span>
            </span>
          </div>
        </div>
      </div>

      <button type="button" class="expand-toggle-btn" v-on:click="switchArrowStatus" :class="prodDispStatus"
        :title="prodDispStatusText">
        <i class="fas" :class="prodDispStatus === 'open' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        {{ prodDispStatusText }}
      </button>
    </div>

    <transition name="body-expan">
      <div class="body-container" v-if="this.prodDispStatus == 'open'">

        <!-- REAL PRODUCT BODY -->
        <div class="card-body product-details-stack" v-if="this.product.type == 'real'">
          <div class="card-section product-gallery-section">

            <div class="card-section-title">{{ $t('product_images') }}</div>
            <div class="">
              <button v-if="galleryImages.length > 1" class="slider-btn prev" @click.prevent="prevGalleryImage">
                <i class="fas fa-chevron-left"></i>
              </button>
              <img :src="galleryCurrentImage" :alt="product.name" class="gallery-main-image" />
              <button v-if="galleryImages.length > 1" class="slider-btn next" @click.prevent="nextGalleryImage">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
            <div class="image-indicators" v-if="galleryImages.length > 1">
              <span
                v-for="(img, index) in galleryImages"
                :key="index"
                class="image-indicator"
                :class="{ active: galleryIndex === index }"
                @click.prevent="galleryIndex = index">
              </span>
            </div>
          </div>
          <div class="details-grid card-section">

            <!-- Available -->
            <div class="detail-card">
              <div class="detail-card-title">
                <i class="fas fa-box-open"></i>
                {{ $t('Available') }}
              </div>

              <div class="detail-card-content">
                <div class="detail-pill detail-pill-neutral">
                  {{ product.count }} {{ $t('units') }}
                </div>
              </div>
            </div>

            <!-- Requirements -->
            <div class="detail-card">
              <div class="detail-card-title">
                <span v-if="user" class="reqt-icon">
                  <i
                    class="fas"
                    :class="realRequirementsMet ? 'fa-check-circle text-success' : 'fa-times-circle text-red'"
                    :title="realRequirementsMet ? $t('reqt_met') : 'Requirements not met'"
                  ></i>
                </span>
                <i v-else class="fas fa-check-circle"></i>
                {{ $t('Requirements') }}
              </div>

              <div
                class="detail-card-content detail-pill-list"
                v-if="product.requirements &&
                      !(product.requirements.length==1 &&
                        product.requirements[0].item==null)"
              >
                <div
                  v-for="(req,index) in product.requirements"
                  :key="index"
                  class="detail-pill req-chip"
                  :class="{met:user && req.met, notmet:user && !req.met}"
                >
                  <template v-if="req.item.toLowerCase()=='user rank'">
                    {{ req.item }} > {{ req.level }}
                  </template>

                  <template v-else-if="req.item.toLowerCase()=='afit'">
                    {{ req.count }} AFIT
                  </template>

                  <template v-else>
                    {{ req.count }} × {{ req.item }} L{{ req.level }}
                  </template>

                </div>
              </div>

              <div
                v-else
                class="detail-pill detail-pill-neutral"
              >
                {{ $t('None') }}
              </div>


            </div>
          </div>

          <div class="card-section">
            <div class="card-section-title">{{ $t('details') }}</div>
            <p class="detail-text">{{ this.product.description }}</p>
          </div>
        </div>

        <!-- INGAME PRODUCT BODY -->
        <div class="card-body product-details-stack" v-if="this.product.type == 'ingame'">
          <div class="card-section product-summary-section">
            <div class="info-grid">
              <div class="info-tile">
                <span class="info-tile-label">{{ $t('Available') }}</span>
                <span class="info-tile-value">{{ this.product.count }} {{ $t('units') }}</span>
              </div>
              <div class="info-tile">
                <span class="info-tile-label">{{ $t('Validity') }}</span>
                <span class="info-tile-value">{{ this.product.benefits.time_span }} {{
                  this.product.benefits.time_unit }}</span>
              </div>

            </div>
          </div>

          <div class="card-section">
            <div class="card-section-title">{{ $t('Boosts') }}</div>
            <ul class="boost-list">
              <li v-for="(boost, index) in product.benefits.boosts" :key="index" class="boost-item">
                <span v-if="boost.boost_beneficiary == 'friend'" :title="$t('Boost') + ' ' + $t('to_a_friend')"><i
                    class="fas fa-user-friends"></i></span>
                <span v-else :title="$t('Boost') + ' ' + $t('to_you')"><i class="fas fa-user"></i></span>

                <span v-if="boost.boost_amount" class="boost-detail">
                  <span class="color-dots">
                    <span v-for="iterx in Math.ceil(boost.boost_amount / 5)" :key="iterx">
                      <span class="color-box-afit" v-if="boost.boost_unit == 'AFIT'"></span>
                      <span class="color-box-sports" v-else-if="boost.boost_unit == 'SPORTS'"></span>
                      <span class="color-box-steem" v-else-if="boost.boost_unit == 'SP'"></span>
                      <span class="color-box-rank" v-else-if="boost.boost_unit == 'User Rank'"></span>
                    </span>
                  </span>
                  <span class="boost-text">+{{ boost.boost_amount }}{{ boost.boost_type.replace('percent_reward',
                    '%').replace('percent', '%').replace('unit', ' ') }} {{ boost.boost_unit }} {{
                      $t('rewards') }} {{ $t('per_report') }}</span>
                </span>
                <span v-else-if="boost.boost_min_amount" class="boost-detail">
                  <span class="color-dots">
                    <span v-for="iterx in Math.ceil(boost.boost_max_amount / 5)" :key="iterx">
                      <span class="color-box-afit" v-if="boost.boost_unit == 'AFIT'"></span>
                    </span>
                  </span>
                  <span class="boost-text">+{{ boost.boost_type.replace('percent_reward', '%').replace('percent',
                    '%').replace('unit', ' ') }} {{ boost.boost_min_amount }}-{{
                      boost.boost_max_amount }} {{ boost.boost_unit }} {{ $t('rewards') }} {{ $t('per_report') }}</span>
                </span>
                <span class="boost-target" v-if="boost.boost_beneficiary == 'friend'">{{ $t('to_a_friend') }}</span>
                <span class="boost-target" v-else>{{ $t('to_you') }}</span>
              </li>
            </ul>
          </div>

          <div class="card-section">
            <div class="card-section-title">{{ $t('Requirements') }}</div>
            <div
              v-if="product.requirements == null || product.requirements.length == 0 || product.requirements.length == 1 && product.requirements[0].item == null">
              <span class="text-muted">{{ $t('none') }}</span>
            </div>
            <ul class="requirement-list" v-else>
              <li v-for="(reqt, index) in product.requirements" :key="index" class="requirement-item">
                <span v-if="user" class="reqt-icon">
                  <i class="fas fa-check text-success" :title="$t('reqt_met')" v-if="reqt.met"></i>
                  <i class="fas fa-times-circle text-red" :title="$t('reqt_not_met')"  v-else></i>
                </span>
                <span v-if="reqt.item && reqt.item.toLowerCase() == 'User Rank'.toLowerCase()"
                  :title="$t('user_rank_reqt').replace('_VAL_', reqt.level)">{{ reqt.item }} &gt; {{ reqt.level
                  }}</span>
                <span v-else
                  :title="$t('consumed_reqt').replace('_AMOUNT_', reqt.count).replace('_ITEM_', reqt.item).replace('_LEVEL_', reqt.level)">{{
                    $t('At_Least') }}
                  {{ reqt.count }} '{{ reqt.item }} {{ $t('level_short') }} {{ reqt.level }}' {{ $t('consumed')
                  }}</span>
              </li>
            </ul>
          </div>

          <div class="card-section">
            <div class="card-section-title">{{ $t('details') }}</div>
            <p class="detail-text">{{ this.product.description }}</p>
          </div>
        </div>

        <!-- EBOOK / SERVICE BODY -->
        <div v-else-if="this.product.type == 'ebook' || this.product.type == 'service'" class="card-body product-details-stack">

          <div class="card-section">
            <div class="card-section-title">{{ $t('details') }}</div>
            <p class="detail-text">{{ this.product.description }}</p>
          </div>
        </div>

        <div v-if="user && product.type == 'real' && !checkout_product && realProdBuyStatus"
          class="card-body">
          <div class="card-section form-field-row">
            <label class="field-label">{{ $t('quantity') }}</label>
            <select v-model="order_quantity" class="form-control sel-adj">
              <option value="1" selected>1</option>
              <option v-if="product.allowedQuantity && quant < product.allowedQuantity"
                v-for="quant in product.allowedQuantity" :value="quant + 1" :key="quant + 1">{{ quant + 1 }}</option>
            </select>
          </div>
        </div>

        <div v-if="user && product.type == 'real' && !checkout_product && realProdBuyStatus && product.colorOptions"
          class="card-body">
          <div class="card-section form-field-row">
            <label class="field-label">{{ $t('color_choice') }}</label>
            <select v-model="color_choice" class="form-control sel-adj">
              <option v-if="Array.isArray(product.colorOptions) && product.colorOptions.length > 0"
                v-for="colr in product.colorOptions" :value="colr" :key="colr">{{ colr }}</option>
            </select>
          </div>
        </div>

      </div> <!-- body-container -->
    </transition>

    <div class="card-footer product-card-footer">
      <div v-if="product.type == 'real'">
        <div class="buy-actions-block" v-if="!checkout_product && realProdBuyStatus">
          <a class="btn btn-success book-button buy-cta" @click.prevent="prepareCheckout()"
            :class="productBuyColor">
            <span class="buy-cta-label">{{ $t('Buy_now') }}</span>
            <span class="buy-cta-price">
              <span v-if="this.item_price_extra > 0">{{ numberFormat(this.item_price_extra, 2) }}
                {{ this.item_extra_currency }}<img class="token-logo-sm" src="/img/HIVE.png">+</span>
              {{ numberFormat(this.item_price, 2) }} {{ this.item_currency }}<img class="token-logo-sm"
                src="/img/actifit_logo.png">
            </span>
          </a>
        </div>
        <div v-else-if="!checkout_product" class="pending-order-block">
          <span class="pending-order-text">{{ $t('pending_real_order_notification') }}</span>
          <div v-for="(entry, index) in pendingOrders" :key="index" :entry="entry" class="pending-order-entry">
            <i class="fas fa-check text-success"></i> {{ $t('item_bought') }}
            {{ showDate(entry.date_bought) }} {{ $t('with_status') }} {{ entry.status }}
          </div>
          <textarea rows="4" cols="30" class="form-control text-brand mt-2" ref="prodFeedback" id="prodFeedback"
            :placeholder="$t('your_feedback')">
					</textarea>
          <a class="btn btn-success btn-lg book-button mt-2" @click.prevent="confirmReceipt()">{{ $t('confirm_receipt')
            }}</a>
        </div>
      </div>

      <div v-else-if="product.type == 'ingame'">
        <div v-if="grabConsumableItem()" class="ingame-status-panel">
          <a
            class="btn btn-lg w-100 book-button ingame-action-btn"
            @click.prevent="grabConsumableItem().status == 'active' ? deactivateGadget() : activateGadget()"
            :class="grabConsumableItem().status == 'active' ? 'btn-success' : 'btn-danger'"
          >
            <span>{{ grabConsumableItem().status == 'active' ? $t('deactivate_gadget') : $t('activate_gadget') }}</span>
            <i
              class="fas ml-2"
              :class="grabConsumableItem().status == 'active' ? 'fa-times' : 'fa-check'"
            ></i>
          </a>

          <div class="count-summary-grid ingame-status-grid">
            <div class="count-summary-item">
              <span class="count-summary-label">{{ $t('Status') }}</span>
              <span
                class="ingame-status-badge"
                :class="grabConsumableItem().status == 'active' ? 'status-active' : 'status-inactive'"
                @click.prevent="grabConsumableItem().status == 'active' ? deactivateGadget() : activateGadget()"
              >
                <i class="fas" :class="grabConsumableItem().status == 'active' ? 'fa-toggle-on' : 'fa-toggle-off'"></i>
                {{ grabConsumableItem().status == 'active' ? $t('Active') : $t('Inactive') }}
              </span>
            </div>

            <div class="count-summary-item">
              <span class="count-summary-label">{{ $t('Remaining_boost') }}</span>
              <span class="count-summary-value">
                {{ grabConsumableItem().span - grabConsumableItem().consumed }}
                <small class="ingame-summary-small">{{ $t('Activity_Reports') }}</small>
              </span>
            </div>

            <div class="count-summary-item" v-if="prodHasFriendBenefic()">
              <span class="count-summary-label">{{ $t('Benef_friend') }}</span>
              <span v-if="grabConsumableItem().status == 'active'" class="ingame-status-value">
                <i class="fas fa-user-friends"></i>
                <a :href="'/' + grabConsumableItem().benefic" target="_blank" rel="noopener noreferrer">
                  {{ grabConsumableItem().benefic }}
                </a>
              </span>
              <input
                v-else
                type="text"
                name="friend"
                id="friend"
                ref="friend"
                class="form-control ingame-friend-input"
                :value="grabConsumableItem().benefic"
              >
            </div>
          </div>
        </div>
        <div v-else>
          <div class="action-grid">
            <a class="btn btn-success book-button buy-cta" @click.prevent="buyNow()" :class="productBuyColor">
              <span class="buy-cta-label">{{ $t('Buy_now') }}</span>
              <span class="buy-cta-price">{{ numberFormat(this.item_price, 2) }} {{ this.item_currency }}<img
                  class="token-logo-xs" src="/img/actifit_logo.png"></span>
            </a>
            <a class="btn btn-success book-button buy-cta" @click.prevent="buyNowHive()"
              :class="productBuyColor">
              <span class="buy-cta-label">{{ $t('Buy_now') }}</span>
              <span class="buy-cta-price">{{ numberFormat(this.item_price *
                this.afitPrice.afitHiveLastPrice, 3) }} {{ this.hive_currency }}<img class="token-logo-xs"
                  src="/img/HIVE.png"></span>
            </a>
          </div>
          <div class="buy-panel" v-if="buyHiveExpand && !isKeychainActive && !isHiveauthActive">
            <label for="active-key" class="field-label">{{ $t('Active_Key') }} *</label>
            <input type="password" id="active-key" name="active-key" ref="active-key" class="form-control"
              v-model="userActvKey">
          </div>
          <div class="buy-actions" v-if="buyHiveExpand">
            <button v-on:click="proceedBuyNowHive()" v-if="this.userTokens >= this.minAfitBuyTicket"
              class="btn btn-brand buy-btn">{{ $t('Proceed') }}</button>
            <button data-toggle="modal" v-else :data-target="'#buyOptionsModal' + _uid"
              class="btn btn-brand buy-btn">{{ $t('Proceed') }}</button>
          </div>
          <div class="action-grid action-grid-secondary" v-if="user && this.allReqtsFilled">
            <a class="btn btn-success book-button mini-action" @click.prevent="addCart()"
              v-if="this.cartEntries.filter(obj => obj._id === this.product._id).length < 1"><span
                v-html="$t('Add_Cart')"></span></a>
            <a class="btn btn-success book-button mini-action" @click.prevent="removeCart()"
              v-else><span v-html="$t('Remove_Cart')"></span></a>
            <a class="btn btn-success book-button mini-action" data-toggle="modal" data-target="#cartModal"><span
                v-html="$t('Checkout')"></span> </a>
          </div>
        </div>
      </div>

      <div v-else-if="!productBought && !this.errorProceed">
        <a class="btn btn-brand book-button buy-cta w-100" @click.prevent="buyNow()">
          <span class="buy-cta-label">{{ $t('Buy_now') }}</span>
          <span class="buy-cta-price">{{ numberFormat(this.item_price, 2) }}
            {{ this.item_currency }}<img class="token-logo-sm" src="/img/actifit_logo.png"></span>
        </a>
      </div>
      <div v-else>
        <div v-if="!this.downloadAgainReady">
          <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="requestFundsPass = true">{{
            $t('Download_again') }}</a>
        </div>
        <div v-if="this.requestFundsPass && !this.downloadAgainReady" class="pt-2">
          <label for="funds-pass" class="w-100 field-label">{{ $t('Funds_Password') }}</label>
          <input type="text" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control w-100">
          <a href="/wallet?action=set_funds_pass" class="funds-pass-link">{{ $t('No_funds_pass_wallet') }}&nbsp;
            <i class="fas fa-solid fa-wallet"></i></a>
          <div class="pt-2">
            <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="downloadAgain()">{{ $t('Proceed') }}</a>
          </div>
          <div v-if="this.errorDownloadAgain" v-html="this.errorDownloadAgain" class="text-brand"></div>
        </div>
        <div v-if="this.downloadAgainReady">
          <div class="text-brand">{{ $t('download_ready_again_text') }}</div>
          <a class="btn btn-brand btn-lg w-100 book-button" :href="this.downloadHref"
            @click.prevent="handleDownloadClick">
            {{ $t('purchase_success_ebook_part2') }}
          </a>
        </div>
      </div>
    </div>

    <div v-if="product.type == 'ingame' && this.boughtCount > 0" class="card-footer count-footer">
      <div class="count-summary-grid">
        <div class="count-summary-item">
          <span class="count-summary-label">{{ $t('bought_count') }}</span>
          <span class="count-summary-value">{{ this.boughtCount }}</span>
        </div>
        <div class="count-summary-item">
          <span class="count-summary-label">{{ $t('consumed_count') }}</span>
          <span class="count-summary-value">{{ this.consumedCount }}</span>
        </div>
      </div>
    </div>

    <div class="pb-md-2 text-center attempt-panel" v-if="buyAttempt">
      <div v-if="buyInProgress && errorProceed == ''">
        <i class="fas fa-spin fa-spinner"></i>
      </div>
      <div v-if="errorProceed != ''">
        <span class="text-brand" v-html="this.errorProceed"></span>
        <a class="btn btn-brand" :href="this.firstDownloadHref" v-if="this.firstDownloadHref"
          @click.prevent="handleFirstDownloadClick">
          {{ $t('purchase_success_ebook_part2') }}
        </a>
      </div>
      <div v-if="!user" class="auth-prompt">
        <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc"
          class="btn btn-brand btn-lg auth-btn">{{ $t('Login') }}</a>
        <a href="/signup" class="btn btn-brand btn-lg auth-btn">{{ $t('Sign_Up') }}</a>
      </div>
    </div>

    <div v-if="checkout_product" class="checkout-form">
      <div class="buy-row" v-if="item_price_extra > 0 && !isKeychainActive && !isHiveauthActive">
        <label for="rl-active-key" class="field-label">{{ $t('Active_Key') }} *</label>
        <input type="password" id="rl-active-key" name="rl-active-key" ref="rl-active-key"
          class="form-control" v-model="userRlActvKey">
      </div>
      <div class="card-section-title">{{ $t('shipping_details') }}</div>
      <div class="form-grid">
        <input type="text" name="buyer_name" id="buyer_name" ref="buyer_name" :placeholder="$t('buyer_name')"
          class="form-control">
        <input type="text" name="buyer_phone" id="buyer_phone" ref="buyer_phone" :placeholder="$t('buyer_phone')"
          class="form-control">
        <input type="text" name="buyer_address" id="buyer_address" ref="buyer_address"
          :placeholder="$t('buyer_address')" class="form-control form-grid-full">
        <input type="text" name="buyer_address2" id="buyer_address2" ref="buyer_address2"
          :placeholder="$t('buyer_address2')" class="form-control form-grid-full">
        <select v-model="buyer_country" class="form-control sel-adj">
          <option value="" disabled selected>{{ $t('buyer_country') }}</option>
          <option v-for="country_inst in this.product.countries" :value="country_inst" :key="country_inst">
            {{ country_inst }}</option>
        </select>
        <input type="text" name="buyer_state" id="buyer_state" ref="buyer_state" class="form-control"
          :placeholder="$t('buyer_state')">
        <input type="text" name="buyer_city" id="buyer_city" ref="buyer_city" class="form-control"
          :placeholder="$t('buyer_city')">
        <input type="text" name="buyer_zip" id="buyer_zip" ref="buyer_zip" class="form-control"
          :placeholder="$t('buyer_zip')">
      </div>
      <div class="shipping-notice" v-html="$t('real_prod_notice')"></div>
      <div class="buy-actions">
        <button v-on:click="checkout_product = false" class="btn btn-outline-secondary buy-btn">{{ $t('Cancel') }}</button>
        <button v-on:click="proceedBuyReal()" class="btn btn-brand buy-btn">{{ $t('Proceed') }}</button>
      </div>
      <div v-if="buyInProgress && errorProceed == ''">
        <i class="fas fa-spin fa-spinner"></i>
      </div>
      <div v-else>
        <span class="text-brand">{{ errorProceed }}</span>
      </div>
    </div>

    <BuyOptionsModal :id="'buyOptionsModal' + _uid" :ref="'buyOptionsModal' + _uid"
      :containerID="'#buyOptionsModal' + _uid" :modalTitle="$t('Buy_product')"
      :modalText="$t('buy_now_modal_desc').replace('_AMNT_', minAfitBuyTicket)" @proceed-purchase="proceedBuyNowHive" />



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

<style scoped>
.pro-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  background: #fff;
  box-sizing: border-box;
}

.pro-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}

@media (max-width: 575px) {
  .pro-card {
    margin: 4px 4px 12px;
  }
}
@media (min-width: 576px) {
  .pro-card.col-sm-4 {
    flex: 0 0 calc(33.333333% - 12px);
    max-width: calc(33.333333% - 12px);
  }
}


.christmas-card {
  border: 2px solid #c41e3a !important;
  background: linear-gradient(to bottom, #fff, #f0fff4);
  position: relative;
  overflow: hidden;
}

.christmas-card::before {
  content: '🎄';
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 1.5rem;
  opacity: 0.8;
}

/* header */
.product-card-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 2px solid #dc3545;
  padding-bottom: 12px;
}

.card-title-row {
  min-height: 30px;
}

.level-badge {
  display: inline-block;
  margin-left: 6px;
  background: #dc3545;
  color: #fff;
  border-radius: 999px;
  font-size: 0.7rem;
  padding: 2px 8px;
  vertical-align: middle;
}

.card-media-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: left;
}

.card-media-col {
  flex: 0 0 auto;
  text-align: center;
}

.level-stars {
  margin-top: 4px;
}

.card-type-col {
  flex: 1 1 auto;
  text-align: left;
}

.card-type-col-ingame {
  text-align: center;
}

.ingame-type-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.provider-link {
  font-size: 0.95rem;
}

.real-currency-badges {
  margin-left: 4px;
}

.expand-toggle-btn {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #dc3545;
  background: #fff;
  color: #dc3545;
  border-radius: 999px;
  padding: 4px 16px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-toggle-btn:hover {
  background: #dc3545;
  color: #fff;
}

.expand-toggle-btn.open {
  background: #dc3545;
  color: #fff;
}

/* sections */
.card-section {
  text-align: left;
  padding: 14px 16px;
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 247, 248, 0.96) 0%, rgba(255, 255, 255, 0.99) 100%);
  box-shadow: 0 8px 20px rgba(220, 53, 69, 0.06);
}

.card-section:last-child {
  border-bottom: none;
}

.product-summary-section {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(220, 53, 69, 0.05);
  border: 1px solid rgba(220, 53, 69, 0.12);
}

.product-summary-section .info-grid {
  gap: 12px;
}

.info-tile {
  min-height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-tile-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: #9b1c29;
}

.product-gallery-section {
  position: relative;
}

.gallery-frame {
  background: linear-gradient(180deg, rgba(255, 244, 246, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 14px;
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 4px 12px rgba(220, 53, 69, 0.05);
}

.section-note {
  margin: 0 0 10px;
  font-size: 0.82rem;
  color: #a94442;
  opacity: 0.9;
}

.detail-text {
  font-size: 0.95rem;
  line-height: 1.65;
  margin-bottom: 0;
  padding: 14px;
  background: #fff;
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(220, 53, 69, 0.05);
}

.card-section-title {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #dc3545;
  margin-bottom: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.product-summary-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;
  align-items: start;
  margin-bottom: 14px;
}

.info-tile {
  background: linear-gradient(180deg, rgba(255, 241, 243, 1) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(220, 53, 69, 0.14);
  border-radius: 12px;
  padding: 14px 12px;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.info-tile-available {
  min-height: 120px;
}

.info-tile-wide {
  grid-column: 1 / -1;
}

.info-tile-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a94442;
  text-transform: uppercase;
}

.requirement-panel {
  background: linear-gradient(180deg, rgba(255, 241, 243, 1) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(220, 53, 69, 0.14);
  border-radius: 12px;
  padding: 14px 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.requirement-panel .card-section-title {
  margin-bottom: 10px;
}

.requirement-panel .requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 8px;
}

.requirement-panel .req-chip {
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid rgba(220, 53, 69, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.requirement-panel .req-chip .fas {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .product-summary-grid {
    grid-template-columns: 1fr;
  }
}

.info-tile-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
}

.ingame-status-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ingame-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border-radius: 14px;
  padding: 14px 18px;
  font-size: 1.05rem;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(46, 125, 50, 0.18);
}

.ingame-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.ingame-status-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  font-weight: 700;
  color: #222;
  min-width: 0;
  word-break: break-word;
}

.ingame-status-value small {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
}

.ingame-summary-small {
  display: inline-block;
  margin-left: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
}

.ingame-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  margin-left: 20px;
  cursor: pointer;
}

.status-active {
  background: #eaf8ee;
  color: #1f8f43;
}

.status-inactive {
  background: #fdecef;
  color: #c62828;
}

.ingame-friend-input {
  margin-top: 2px;
  border-radius: 10px;
}

.count-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.count-summary-item {
  background: linear-gradient(180deg, rgba(255, 244, 246, 1) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.count-summary-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #7f7f7f;
  font-weight: 700;
}

.count-summary-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #9b1c29;
}

.requirement-list,
.boost-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.requirement-item,
.boost-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 12px 12px;
  font-size: 0.92rem;
  background: #fff;
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.05);
}

.reqt-icon {
  flex: 0 0 auto;
}

.reqt-icon i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.08);
}

.boost-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.color-dots {
  display: inline-flex;
  gap: 2px;
}

.boost-text,
.boost-target {
  font-size: 0.88rem;
}

.detail-text {
  font-size: 0.94rem;
  line-height: 1.7;
  margin-bottom: 0;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.05);
}

.product-details-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.product-details-stack .card-section + .card-section {
  margin-top: 0;
}

.form-field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.field-label {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0;
  white-space: nowrap;
}

/* buy panel / actions */
.buy-panel {

  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
}

.buy-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.buy-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
  flex-wrap: wrap;
}

.buy-btn {
  flex: 1 1 auto;
  min-width: 100px;
}

.buy-status-row {
  text-align: center;
  margin-top: 6px;
}

.product-gallery-section {
  overflow: hidden;
}

.section-note {
  margin: -2px 0 10px;
  font-size: 0.8rem;
  color: #a94442;
  opacity: 0.85;
}

.gallery-frame {
  background: linear-gradient(180deg, rgba(255, 244, 246, 0.95) 0%, rgba(255, 255, 255, 1) 100%);
  border: 1px solid rgba(220, 53, 69, 0.12);
  border-radius: 14px;
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 4px 12px rgba(220, 53, 69, 0.05);
}

.buy-actions-block {
  width: 100%;
  display: flex;
}

.buy-actions-block .buy-cta {
  width: 100%;
}

.buy-actions-block .buy-cta .buy-cta-price {
  justify-content: center;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.action-grid-secondary {
  margin-top: 8px;
}

.buy-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;

  border-radius: 8px;
  padding: 9px 6px;
  min-height: 50px;
  line-height: 1.2;
}

.buy-cta-label {
  font-weight: 600;
  font-size: 0.8rem;
}

.buy-cta-price {
  font-size: 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.token-logo-xs {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

.mini-action {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 8px;
  padding: 8px 6px;
  min-height: 46px;
  font-size: 0.8rem;
  line-height: 1.2;
}

.pending-order-block {
  text-align: left;
}

.pending-order-text {
  color: #28a745;
  font-weight: 600;
}

.pending-order-entry {
  color: #28a745;
  font-size: 0.9rem;
}

.status-footer,
.count-footer {
  text-align: left;
  padding-top: 0.75rem;
}

.product-card-footer {
  background-color:#ffffff;
  border-radius: 10px;
}
.card-footer{
  border-top:none;
  background-color:#ffffff;

}
.status-row {
  padding: 4px 0;
}

.status-value {
  cursor: pointer;
}

html.dark-mode .product-card {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #edf2f7;
  box-shadow: 0 22px 52px rgba(0, 0, 0, 0.46);
}

html.dark-mode .product-card:hover {
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.54);
}

html.dark-mode .product-card .pro-name,
html.dark-mode .product-card .product-type,
html.dark-mode .product-card .type-icon {
  color: #f8fafc;
}

html.dark-mode .product-card .provider-link,
html.dark-mode .product-card .provider-link a,
html.dark-mode .product-card .funds-pass-link {
  color: #ffffff;
}

html.dark-mode .product-card .provider-link a:hover,
html.dark-mode .product-card .funds-pass-link:hover {
  color: #f4f4f4;
}

html.dark-mode .product-card .level-badge {
  background: linear-gradient(135deg, #ff112d 0%, #d6001a 100%);
  box-shadow: 0 8px 16px rgba(255, 17, 45, 0.24);
}

html.dark-mode .product-card .card-footer,
html.dark-mode .product-card-footer {
  background: transparent;
}

html.dark-mode .card-section,
html.dark-mode .product-summary-section,
html.dark-mode .gallery-frame,
html.dark-mode .detail-text,
html.dark-mode .requirement-panel,
html.dark-mode .detail-card,
html.dark-mode .count-summary-item,
html.dark-mode .ingame-status-card,
html.dark-mode .buy-panel,
html.dark-mode .checkout-form {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.065) 0%, rgba(255, 255, 255, 0.028) 100%);
  border-color: rgba(255, 255, 255, 0.095);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 14px 30px rgba(0, 0, 0, 0.28);
}

html.dark-mode .card-section-title,
html.dark-mode .detail-card-title,
html.dark-mode .info-tile-label,
html.dark-mode .count-summary-label,
html.dark-mode .ingame-status-label,
html.dark-mode .section-note,
html.dark-mode .field-label {
  color: #ff112d ;
}

html.dark-mode .detail-text,
html.dark-mode .boost-item,
html.dark-mode .requirement-item,
html.dark-mode .detail-pill,
html.dark-mode .pending-order-entry,
html.dark-mode .count-summary-value,
html.dark-mode .ingame-status-value {
  color: #edf2f7;
}

html.dark-mode .info-tile,
html.dark-mode .requirement-panel .req-chip,
html.dark-mode .boost-item,
html.dark-mode .requirement-item,
html.dark-mode .detail-pill {
  background: rgba(255, 255, 255, 0.055);
  border-color: rgba(255, 255, 255, 0.09);
  box-shadow: none;
}

html.dark-mode .info-tile-value,
html.dark-mode .detail-pill-neutral {
  color: #ffffff;
}

html.dark-mode .detail-pill.met {
  background: rgba(40, 167, 69, 0.16);
  color: #8be3a9;
}

html.dark-mode .detail-pill.notmet {
  background: rgba(198, 40, 40, 0.18);
  color: #ffffff;
}

html.dark-mode .count-summary-item {
  border-color: rgba(255, 255, 255, 0.08);
}

html.dark-mode .ingame-status-badge.status-active {
  background: rgba(40, 167, 69, 0.18);
  color: #8be3a9;
  box-shadow: 0 0 0 1px rgba(139, 227, 169, 0.14);
}

html.dark-mode .ingame-status-badge.status-inactive {
  background: rgba(198, 40, 40, 0.18);
  color: #ffffff;
  box-shadow: 0 0 0 1px rgba(255, 154, 167, 0.14);
}

html.dark-mode .expand-toggle-btn {
  background: rgba(255, 255, 255, 0.055);
  color: #ffffff;
  border-color: #fff;
}

html.dark-mode .expand-toggle-btn:hover,
html.dark-mode .expand-toggle-btn.open {
  background: #4e0009;
  border-color: #fff;
  color: #fff;
  box-shadow: 0 10px 22px rgba(255, 17, 45, 0.24);
}

html.dark-mode .product-card .form-control {
  background-color: #10151e;
  border-color: rgba(255, 255, 255, 0.14);
  color: #edf2f7;
  box-shadow: none;
}

html.dark-mode .product-card .form-control::placeholder {
  color: #8793a1;
}

html.dark-mode .product-card .form-control:focus,
html.dark-mode .expand-toggle-btn:focus {
  border-color: #4e0009;
  box-shadow: 0 0 0 0.2rem rgba(255, 17, 45, 0.22);
  outline: 0;
}

html.dark-mode .product-card .text-muted,
html.dark-mode .ingame-status-value small,
html.dark-mode .ingame-summary-small {
  color: #aeb9c7 !important;
}

html.dark-mode .pending-order-text,
html.dark-mode .shipping-notice {
  color: #8be3a9;
}

html.dark-mode .product-gallery-section .image-indicator {
  background: rgba(255, 255, 255, 0.22);
}

html.dark-mode .product-gallery-section .image-indicator.active {
  background: #4e0009;
  box-shadow: 0 0 12px rgba(255, 154, 167, 0.32);
}

@media (max-width: 767px) {
  .ingame-status-grid,
  .count-summary-grid {
    grid-template-columns: 1fr;
  }
}

.attempt-panel {
  padding-top: 10px;
}

.auth-prompt {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding-top: 8px;
}

.auth-btn {
  flex: 1 1 auto;
  max-width: 160px;
}

.funds-pass-link {
  display: inline-block;
  margin-top: 6px;
}

/* checkout form */
.checkout-form {
  text-align: left;
  padding-top: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.form-grid-full {
  grid-column: 1 / -1;
}

.shipping-notice {
  color: #28a745;
  font-size: 0.88rem;
  margin-bottom: 8px;
}
</style>

<script>
import LoginModal from '~/components/LoginModal'
import { mapGetters } from 'vuex'

import steem from 'steem'

import hive from '@hiveio/hive-js'

import BuyOptionsModal from '~/components/BuyOptionsModal'


//import VueLazyLoad from 'vue-lazyload'
//import LightBox from 'vue-image-lightbox'

import '@morioh/v-lightbox/dist/lightbox.css';

//import Lightbox from '@morioh/v-lightbox'

export default {
  props: ['product', 'pros', 'userrank', 'gadgetStats', 'afitPrice', 'realProducts', 'expandAll'],
  components: {
    BuyOptionsModal,


    //LightBox,
    //VueLazyLoad
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
    productTypeBorder() {
      if (this.product.type == 'ingame') {
        return 'card-border-real';
      }
      return 'card-border';
    },
    productBuyColor() {
      if (!this.allReqtsFilled) {
        return 'bg-secondary';
      }
      if (this.product.type == 'ingame' && this.product.count < 1) { return 'bg-warning'; } return '';
    },
    realRequirementsMet() {
      if (!this.product || !Array.isArray(this.product.requirements)) {
        return false;
      }

      const meaningfulReqs = this.product.requirements.filter(req => req && req.item);
      if (meaningfulReqs.length === 0) {
        return true;
      }

      return meaningfulReqs.every(req => req.met);
    },
    galleryImages() {
      if (this.product && Array.isArray(this.product.prodImages) && this.product.prodImages.length > 0) {
        return this.product.prodImages;
      }
      return [this.product.image || ''];
    },
    galleryCurrentImage() {
      if (!this.galleryImages.length) {
        return this.product.image || '';
      }
      if (this.galleryIndex >= this.galleryImages.length) {
        return this.galleryImages[0];
      }
      return this.galleryImages[this.galleryIndex];
    },
    boughtCount() {
      if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0) {
        return this.consumedCount + this.activeCount;
      }
      return 0;
    },
    consumedCount() {
      if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0) {
        let entry = this.gadgetStats.find(entry => (entry._id.gadget === this.product._id && entry._id.status ==
          'consumed'));
        if (entry) {
          return entry.count;
        }
      }
      return 0;
    },
    activeCount() {
      if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0) {
        let entry = this.gadgetStats.find(entry => (entry._id.gadget === this.product._id && entry._id.status ==
          'active'));
        if (entry) {
          return entry.count;
        }
      }
      return 0;
    },
    /* only allows user to buy more if they do not have pending orders */
    realProdBuyStatus() {
      /*
      actifit market order statuses:
      placed
      confirmed
      inroute
      delivered
      cancelled
      refunded
      */
      //if we have a pending order user cannot buy more
      if (Array.isArray(this.pendingOrders) && this.pendingOrders.length > 0) {
        return false;
      }
      return true;
    }
  },
  data: function () {
    return {
      showModal: false,
      detailsOpen: false,
      item_price: 0,
      item_currency: 'AFIT',
      orig_item_price: 0,
      orig_item_currency: 'AFIT',
      consumed_count: 0,
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
      downloadAgainRunning: false,
      errorDownloadAgain: '',
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
      prodRef: this,
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
      prodDispStatus: '',
      prodDispStatusText: 'Expand',
      galleryIndex: 0,

    }
  },
  watch: {
    product(newProduct) {
      this.galleryIndex = 0;
      this.getPrice();
    },
    pros: 'updateProPic',
    user: 'allReqtsMet',
    userrank: 'allReqtsMet',
    order_quantity: 'getPrice',
    afitPrice: 'getPrice',
    realProducts: 'updateProdStat',
    expandAll: 'adjustDisplay',
  },
  methods: {
    /**
    * Formats numbers with commas and dots.
    *
    * @param number
    * @param precision
    * @returns {string}
    */
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    switchArrowStatus() {
      if (this.prodDispStatus == '') {
        this.prodDispStatus = 'open';
        this.prodDispStatusText = 'Collapse';
      } else {
        this.prodDispStatus = '';
        this.prodDispStatusText = 'Expand';
      }
    },
    showModalFunc() {
      this.$nextTick(() => {
        this.showModal = true;
        if ($ && typeof $.fn.modal === 'function') {
          $('#loginModal').modal('show');
        }
      });
    },
    adjustDisplay() {
      this.prodDispStatus = this.expandAll;
    },
    async buyAFITNow() {
      this.afit_buy_err_msg = '';

      if (!this.user) {
        this.afit_buy_err_msg = this.$t('need_login_signup_notice_vote');
        return;
      }
      if (this.afitBuyAmount < 0) { this.afit_buy_err_msg = this.$t('amount_positive_int'); return; } if
        (this.getMatchingHIVE() < 0) { this.afit_buy_err_msg = this.$t('amount_positive_int'); return; } if
        (this.userActvKeyHv == '') { this.afit_buy_err_msg = this.$t('all_fields_required'); return; } if
        (this.user.account.balance.split(" ")[0] < this.getMatchingHIVE()) {
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
    prevGalleryImage() {
      if (this.galleryImages.length <= 1) {
        return;
      }
      this.galleryIndex = (this.galleryIndex + this.galleryImages.length - 1) % this.galleryImages.length;
    },
    nextGalleryImage() {
      if (this.galleryImages.length <= 1) {
        return;
      }
      this.galleryIndex = (this.galleryIndex + 1) % this.galleryImages.length;
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
      if (this.downloadHref) {
        window.location.href = this.downloadHref;
        setTimeout(() => {
          this.resetDownState();
        }, 200);
      } else {
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
      } else {
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
          if (entry.status != " consumed" && parseInt(entry.consumed) < parseInt(entry.span)) { return entry; }
        }
      }
      return null;
    }, getPrice() {
      if (this.product && this.afitPrice) {
        let price_options = this.product.price; let
          price_options_count = price_options.length; for (let i = 0; i < price_options_count; i++) {
            let
              entry = price_options[i]; this.item_price = entry.price * this.order_quantity; this.item_currency = entry.currency; if
              (this.item_currency == 'USD') {
              console.log('>>>USD Product');
              //console.log(entry.percent_afit);
              //keep track of original price
              this.orig_item_currency = this.item_currency;
              this.orig_item_price = this.item_price;
              this.item_currency = 'AFIT';
              //this being a USD product, convert to matching AFIT/HIVE amounts
              /*if (parseInt(entry.percent_afit) == 100){
              //convert price to matching AFIT val
              console.log(this.afitPrice.afitHiveLastUsdPrice);
              this.item_price = this.orig_item_price / this.afitPrice.afitHiveLastUsdPrice * entry.percent_afit / 100;
              }else{*/
              this.item_price = this.orig_item_price * entry.percent_afit / 100 / this.afitPrice.afitHiveLastUsdPrice;
              this.item_price = Number(this.item_price.toFixed(2));
              let calcHiveUsdPrice = this.afitPrice.afitHiveLastUsdPrice / this.afitPrice.afitHiveLastPrice;
              //console.log('HIVE price:'+calcHiveUsdPrice);
              this.item_price_extra = this.orig_item_price * entry.percent_hive / 100 / calcHiveUsdPrice;
              this.item_price_extra = Number(this.item_price_extra.toFixed(2));
              //console.log('HIVE extra cost:'+this.item_price_extra);
              this.item_extra_currency = 'HIVE';
              //}
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
      let url = new URL(process.env.actiAppUrl + 'validatePassForDownload/?user=' + this.user.account.name + '&pass='
        + this.$refs['funds-pass'].value + '&product_id=' + this.product._id);
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

      let url = new URL(process.env.actiAppUrl + 'findVerifyTrx/?user=' + this.user.account.name + '&txid=' +
        result.id + '&operation=' + op_json + '&bchain=' + cur_bchain);

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
            console.log(evt) // process sign_wait message
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

        let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + this.user.account.name + '&operation=' +
          op_json + '&bchain=' + cur_bchain);

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

        if (this.product.count < 1) { this.errorProceed = this.$t('cannot_buy_none_available'); return; }
      }
      this.buyHiveExpand = !this.buyHiveExpand;
    }, async proceedBuyNowHive() {
      try { //console.log(this.product.name);
        this.buyAttempt = true; this.buyInProgress = true; this.errorProceed = ''; console.log('proceedBuyNowHive');
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
        //active key was provided
        //console.log(this.$refs);
        if (localStorage.getItem('acti_login_method') != 'keychain'
          && localStorage.getItem('acti_login_method') != 'hiveauth'
          && this.userActvKey == '') {
          this.errorProceed = this.$t('all_fields_required');
          return;
        }

        //proceed with payment
        this.setProperNode();
        let attempt = 1;
        let payAmount = parseFloat(this.item_price * this.afitPrice.afitHiveLastPrice).toFixed(3);
        let memo = 'buy-gadget:' + this.product._id;
        console.log('prior to call');
        let accToken = localStorage.getItem('access_token');
        let cstm_params = {
          "from": this.user.account.name,
          "to": process.env.actifitMarketBuy,
          "amount": payAmount + ' ' + 'HIVE',
          "memo": memo
        };
        let op_name = 'transfer';
        let operation = [[op_name, cstm_params]];


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

          let url = new URL(process.env.actiAppUrl + 'performTrxPost/?user=' + this.user.account.name + '&bchain=' +
            cur_bchain);

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
        let url = '';//new URL(process.env.actiAppUrl +
        //'processBuyOrderHive/?user=' + this.user.account.name + '&product_id=' + this.product._id);

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
                  + this.$t('By') + ' ' + this.product.provider_name + '.<br />';
                this.firstDownloadHref = process.env.actiAppUrl
                  + 'downEbook/'
                  + '?user=' + this.user.account.name
                  + '&product_id=' + this.product._id
                  + '&access_token=' + outcome.access_token;
              } else if (this.product.type == 'ingame') {
                //display proper success message
                this.errorProceed = this.$t('purchase_success_ingame_part1') + ' ' + this.product.name + ' '
                  + this.$t('Level') + ' ' + this.product.level + '. ' + this.$t('purchase_success_ingame_part2') + '.<br />';

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
      if (this.product.count < 1) { this.errorProceed = this.$t('cannot_buy_none_available'); return; } if
        (this.userTokens < this.item_price) {
        this.errorProceed = this.$t('Not_enough_balance_to_buy') +
          this.$t('Buy_afit_here'); //console.log(this.errorProceed ); return; } if (this.user.account.balance.split(" ")[0] < this.item_price_extra) {
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
        //example " missing required posting authority:Missing Posting Authority"
        let err_msg = outcome.error;
        this.$notify({ group: 'error', text: err_msg, position: 'top center' });
        this.errorProceed = err_msg;
        this.buyInProgress = false;
        return { success: false, trx: null };
        //this.$router.push('/login');
      } else {
        this.$store.dispatch('fetchUserTokens');
        this.$notify({
          group: 'success',
          text: this.$t('product_bought').replace('_PRODUCT_', this.product.name),
          position: 'top center'
        });
        this.errorProceed = this.$t('product_bought').replace('_PRODUCT_', this.product.name);
        this.buyInProgress = false;
        this.buyAttempt = false;
        this.checkout_product = false;
        let accToken = localStorage.getItem('access_token');
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
      //check if this is a game gadget and
      //if reqts have been met
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
          this.errorProceed = this.$t('cannot_buy_none_available'); return;

        }
      } //first
      //first check if user has enough AFIT
      if (this.user) {
        if (this.userTokens < this.item_price) {
          this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here');
          //console.log(this.errorProceed );
          return;
        }
      }
      //show user confirm for purchasing product/service let
      let user_prmpt = this.$t('purchase_confirm_part1') + this.product.name + ' ' + this.product.type + '.\n' +
        this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n'
        + this.$t('Proceed') + '?'; if (this.product.type == 'ingame') {
          user_prmpt = this.$t('purchase_confirm_part1') + this.product.name + ' Level ' + this.product.level + ' ' +
            this.product.type + ' virtual gadget' + '.\n' + this.$t('purchase_confirm_part2') +
            this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n' + this.$t('Proceed') + '?';
        }
      let decis = confirm(user_prmpt);
      if (!decis) { this.buyInProgress = false; return; } //broadcast trx to blockchain
      let cstm_params = {
        required_auths: [],
        required_posting_auths: [this.user.account.name],
        id: 'actifit',
        json: "{\"buy_product\": \"" + this.product._id + "\"}"
      };
      if (this.product.type == 'ingame') {
        //different tx
        cstm_params = {
          required_auths: [],
          required_posting_auths: [this.user.account.name],
          id: 'actifit',
          json: "{\"transaction\": \"buy-gadget\", \"gadget\": \"" + this.product._id + "\"}"
        };
      }
      let bcastRes;
      let op_name = 'custom_json';
      let operation = [[op_name, cstm_params]];
      let res = await this.processTrxFunc(op_name, cstm_params); console.log('custom complete'); console.log(res);

      if (res.success) { bcastRes = res.trx; } else { console.log(err); }
      let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      let url = new URL(process.env.actiAppUrl + 'processBuyOrder/?user=' + this.user.account.name + '&product_id=' +
        this.product._id);
      if (this.product.type == 'ingame') {
        url = new URL(process.env.actiAppUrl + 'buyGadget/' +
          this.user.account.name + '/' + this.product._id + '/' + bcastRes.ref_block_num + '/' + bcastRes.id + '/' +
          cur_bchain);
        if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
          let op_json = JSON.stringify(operation);
          url = new URL(process.env.actiAppUrl + 'buyGadgetKeychain/' +
            this.user.account.name + '/' + this.product._id + '/'
            + bcastRes.id + '/' +
            cur_bchain + '?operation=' + op_json);
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
        } else { //update user token count
          this.$store.dispatch('fetchUserTokens') //update product status
          this.checkProductBought();
          this.$store.dispatch('fetchProducts')
          if (this.product.type == 'service') {
            //display proper success message
            this.errorProceed = this.$t('purchase_success_service_part1') + this.product.name + ' '
              + this.$t('With') + ' ' + this.product.provider_name + '.\n'
              + this.$t('purchase_success_service_part2') + '.\n'
          } else if (this.product.type == 'ebook') {
            //display proper success message
            this.errorProceed = this.$t('purchase_success_ebook_part1') + ' ' + this.product.name + ' ' + this.$t('By')
              + ' ' + this.product.provider_name + '.<br/>'; this.firstDownloadHref = process.env.actiAppUrl + 'downEbook/'
                + '?user=' + this.user.account.name + '&product_id=' + this.product._id + '&access_token=' +
                outcome.access_token;
          } else if (this.product.type == 'ingame') {
            //display proper success message
            this.errorProceed = this.$t('purchase_success_ingame_part1') + ' ' + this.product.name + ' ' +
              this.$t('Level') + ' ' + this.product.level + '. ' + this.$t('purchase_success_ingame_part2') + '.<br/>';
          }
        } //this.checkingFunds=false; //this.resultReturned=true;
      } catch (err) {
        console.error(err);
      }
      //this.checkingFunds=false; }
    },
    prodHasFriendBenefic() { //console.log('prodHasFriendBenefic');
      //console.log(this.product.benefits.boosts);
      if (Array.isArray(this.product.benefits.boosts) &&
        this.product.benefits.boosts.length > 0) {
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
              text: this.$t('success_receipt_set').replace('_PROD_',
                this.product.name),//this.$t('session_expired_login_again'),
              position: 'top center'
            })

            //notify parent to refresh products
            //this.$emit('refresh-prods');
            this.$store.dispatch('fetchProducts')

            //update status
            this.$store.dispatch('fetchUserBoughtRealProducts', accToken);

            //display proper success message
            this.errorProceed = this.$t('success_receipt_set').replace('_PROD_', this.product.name + '-L' +
              this.product.level) + '.<br />';
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
            + this.$t('Level') + ' ' + this.product.level) + '.<br />';
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
            + this.$t('Level') + ' ' + this.product.level) + '.<br />';
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
      this.updateProPic(); //fix sorting of countries and color options
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

<style>
.card-border {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.card-border-real {
  box-shadow: 3px 3px 3px rgb(0 255 0 / 40%);
}

.pro-img-cls {
  width: 100%;
}

.pro-name {
  background: radial-gradient(red, transparent);
  color: white;
  padding: 6px 4px;
  border-radius: 8px;
}

.book-button {
  color: white !important;
}

.product-type {
  text-transform: capitalize;
  font-size: 1.1rem;
}

.pro-card-av {
  width: 90px;
  height: 90px;
  margin-top:6px;
}

.gaming-label {
  width: 45px;
  height: 45px;
  border: none;
}

.token-logo-sm {
  width: 20px;
  height: 20px;
}

.token-logo-md {
  width: 40px;
  height: 40px;
}

.color-box-afit {
  float: left;
  background-color: darkred;
  width: 16px;
  height: 16px;
  margin: 1px;
  border-radius: 4px;
}

.color-box-sports {
  float: left;
  background-color: #00f;
  width: 16px;
  height: 16px;
  margin: 1px;
  border-radius: 4px;
}

.color-box-steem {
  float: left;
  background-color: #029;
  width: 16px;
  height: 16px;
  margin: 1px;
  border-radius: 4px;
}

.color-box-rank {
  float: left;
  background-color: #092;
  width: 16px;
  height: 16px;
  margin: 1px;
  border-radius: 4px;
}

.avatar-2 {
  border-color: orange;
}

.avatar-3 {
  border-color: red;
}

.info-box {
  border: 1px white solid;
  color: white;
}

.info-box-red {
  background: red;
}

.info-box-orangered {
  background: orangered;
}

.info-box-green {
  background: #28a700;
}

.lb-item {
  height: 75px !important;
}

.lbox-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 10px;
  height: auto !important;
  align-items: stretch;
}

.lbox-container .lb-item {
  width: 100% !important;
  height: 132px !important;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.08);
}

@media (max-width: 575px) {
  .lbox-container {
    grid-template-columns: 1fr;
  }
}

.product-lightbox {
  width: 100%;
}

.product-gallery-section .gallery-frame {
  position: relative;
  width: 100%;
  max-width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: #f7f7f7;
}

.product-gallery-section .gallery-main-image {
  display: block;
  width: 100%;
  height: auto;
  max-height: 260px;
  object-fit: cover;
  border-radius: 16px;
}

.product-gallery-section .slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.product-gallery-section .slider-btn:hover {
  background: rgba(0, 0, 0, 0.55);
}

.product-gallery-section .slider-btn.prev {
  left: 12px;
}

.product-gallery-section .slider-btn.next {
  right: 12px;
}

.product-gallery-section .image-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 10px 0 0;
}

.product-gallery-section .image-indicator {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #d8d8d8;
  cursor: pointer;
}

.product-gallery-section .image-indicator.active {
  background: #d20b4f;
}

.product-gallery-section .section-note {
  margin-bottom: 0.8rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.left-bar:after,
.right-bar:after {
  animation: blink 3s infinite;
  /*20 alternate;*/
}
.details-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:12px;
    margin-bottom:14px;
}

.detail-card{
    background:#fff;
    border:1px solid #ececec;
    border-radius:12px;
    padding:6px 6px;
    display:flex;
    flex-direction:column;
    min-height:70px;
    height:70%;
}

.detail-card-title{
    display:flex;
    align-items:center;
    gap:6px;
    font-weight:700;
    font-size:14px;
    color:#d32f2f;
    margin-bottom:4px;
    line-height:1.2;
}

.detail-card-content{
    flex:1;
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    min-width:0;
}

.detail-pill-list{
    display:flex;
    flex-wrap:wrap;
    gap:6px;
    align-content:flex-start;
    justify-content:flex-start;
    align-items:flex-start;
    padding-top:2px;
}

.detail-pill{
    padding:6px 10px;
    border-radius:999px;
    font-size:11px;
    font-weight:600;
    background:#f5f5f5;
    line-height:1.15;
    display:inline-flex;
    align-items:center;
    gap:6px;
    width: fit-content;
    min-width:0;
}

.detail-pill-neutral{
    background:#f5f5f5;
    color:#c62828;
}

.detail-pill.met{
    background:#e8f5e9;
    color:#2e7d32;
}

.detail-pill.notmet{
    background:#ffebee;
    color:#c62828;
}

@media (max-width:768px){
    .details-grid{
        grid-template-columns:1fr;
    }
}
@keyframes blink {

  0%,
  50%,
  100% {
    background-color: pink;
  }

  25%,
  75% {
    background-color: red;
  }
}
</style>

<style lang="scss">
$background: lightcoral;
$easing: cubic-bezier(.25, 1.7, .35, .8);
$duration: 0.5s;

.arrow-icon {
  height: 2.8em;
  width: 2.8em;
  display: block;
  padding: 0.5em;
  margin: 1em auto;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
}

.left-bar {
  position: absolute;
  background-color: transparent;
  top: 0;
  left: 0;
  width: 40px;
  height: 10px;
  display: block;
  transform: rotate(35deg);
  float: right;
  border-radius: 2px;

  &:after {
    content: "";
    background-color: $background;
    width: 40px;
    height: 10px;
    display: block;
    float: right;
    border-radius: 6px 10px 10px 6px;
    transition: all $duration $easing;
    z-index: -1;
  }
}

.right-bar {
  position: absolute;
  background-color: transparent;
  top: 0px;
  left: 26px;
  width: 40px;
  height: 10px;
  display: block;
  transform: rotate(-35deg);
  float: right;
  border-radius: 2px;

  &:after {
    content: "";
    background-color: $background;
    width: 40px;
    height: 10px;
    display: block;
    float: right;
    border-radius: 10px 6px 6px 10px;
    transition: all $duration $easing;
    z-index: -1;
  }
}

.open {
  .left-bar:after {
    transform-origin: center center;
    transform: rotate(-70deg);
  }

  .right-bar:after {
    transform-origin: center center;
    transform: rotate(70deg);
  }

}

.expansion-arrow {
  max-height: 40px;
}

/*
.body-expan-enter,
.body-expan-leave-to {
  visibility: hidden;
  height: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
}

.body-expan-enter-active,
.body-expan-leave-active {
  transition: all 0.2s;
}
*/
</style>
