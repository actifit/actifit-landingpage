<template>
  <div>
    <NavbarBrand />

    <section class="intro" id="content">
      <div class="container pt-5 mt-5 pb-5">

        <!-- Hero -->
        <div class="signup-hero text-center mb-4">
          <h1 class="signup-headline">{{ $t('signup.headline') }}</h1>
          <p class="signup-sub">{{ $t('signup.hero_sub') }}</p>
          <p class="signup-social-proof"><i class="fas fa-users text-brand mr-1"></i>{{ $t('signup.social_proof') }}</p>
        </div>

        <!-- Step indicator -->
        <div class="signup-step-indicator mb-5">
          <div class="signup-step" :class="{ active: currentStep === 1, done: currentStep > 1 }">
            <div class="signup-step-circle">
              <i v-if="currentStep > 1" class="fas fa-check"></i>
              <span v-else>1</span>
            </div>
            <small class="mt-1">{{ $t('signup.step1') }}</small>
          </div>
          <div class="signup-step-line"></div>
          <div class="signup-step" :class="{ active: currentStep === 2, done: currentStep > 2 }">
            <div class="signup-step-circle">
              <i v-if="currentStep > 2" class="fas fa-check"></i>
              <span v-else>2</span>
            </div>
            <small class="mt-1">{{ $t('signup.step2') }}</small>
          </div>
          <div class="signup-step-line"></div>
          <div class="signup-step" :class="{ active: currentStep === 3 }">
            <div class="signup-step-circle">
              <span>3</span>
            </div>
            <small class="mt-1">{{ $t('signup.step3') }}</small>
          </div>
        </div>

        <div class="row">

          <!-- Main form column -->
          <div class="col-12 col-md-7">

            <!-- Step 1: Account Details card -->
            <div class="card signup-section-card mb-4">
              <div class="card-header signup-card-header">
                <span class="signup-step-badge mr-2">1</span>
                <strong>{{ $t('signup.step1') }}</strong>
              </div>
              <div class="card-body">

                <div class="form-group mb-3">
                  <label for="account-username">{{ $t('Pick_Username') }}</label>
                  <input class="form-control form-control-lg" ref="account-username" id="account-username"
                    @input="handleUsername($event.target.value.toLowerCase())" />
                  <p class="text-brand mt-1 mb-0" v-if="username_invalid"><b>{{ username_invalid }}</b></p>
                  <p class="text-brand mt-1 mb-0" v-if="username_exists"><b>{{ username_exists }}</b></p>
                </div>

                <div class="form-group mb-3">
                  <label>{{ $t('target_bchain') }}</label>
                  <p class="signup-muted mb-1"><i>{{ $t('leave_default_recommend') }}</i></p>
                  <div class="pl-2 mb-1">
                    <input type="checkbox" id="hive-account" v-model="hive_account" v-on:change="validateUserName">
                    <label for="hive-account" class="font-weight-normal ml-1">{{ $t('hive_account_text') }}</label>
                  </div>
                  <div class="pl-2 mb-1" style="display:none">
                    <input type="checkbox" id="steem-account" v-model="steem_account" v-on:change="validateUserName">
                    <label for="steem-account" class="font-weight-normal ml-1">{{ $t('steem_account_text') }}</label>
                  </div>
                  <div class="pl-2 mb-1" v-if="blurt_active">
                    <input type="checkbox" id="blurt-account" v-model="blurt_account" v-on:change="validateUserName">
                    <label for="blurt-account" class="font-weight-normal ml-1">{{ $t('blurt_account_text') }}</label>
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label for="account-password">{{ $t('Your_Password') }}</label>
                  <input class="form-control form-control-lg" id="account-password" ref="account-password"
                    v-on:change="genPrivKey" />
                  <p class="signup-muted mt-1 mb-1">
                    <i class="fas fa-exclamation-triangle text-warning mr-1"></i>{{ $t('signup.keys_warning') }}
                  </p>
                  <button v-on:click="setPasswordVal" class="btn btn-brand btn-sm mr-2">{{ $t('Regenerate') }}</button>
                  <button v-on:click="copyContent" data-targetEl="account-password" class="btn btn-brand btn-sm">{{ $t('Copy_Password') }}</button>
                </div>

                <div class="form-group mb-3">
                  <label for="account-password-confirm">{{ $t('confirm_password_copy') }}</label>
                  <input class="form-control form-control-lg" id="account-password-confirm" ref="account-password-confirm" />
                </div>

                <div class="form-group mb-3">
                  <label for="posting-key">{{ $t('your_posting_key') }}</label>
                  <div class="input-group">
                    <input class="form-control form-control-lg" id="posting-key" readonly ref="posting-key" :value="privatePostKey" />
                    <div class="input-group-append">
                      <button v-on:click="copyContent" data-targetEl="posting-key" class="btn btn-brand">{{ $t('Copy_Posting_Key') }}</button>
                    </div>
                  </div>
                  <p class="signup-muted mt-1 mb-0"><i>{{ $t('posting_key_precaution') }}</i></p>
                </div>

                <div class="form-group mb-0">
                  <label for="account-email">{{ $t('email_optional') }}</label>
                  <input class="form-control form-control-lg" id="account-email" ref="account-email" v-model="email" />
                </div>

              </div>
            </div>

            <!-- Step 2: Activate card -->
            <div class="card signup-section-card mb-4">
              <div class="card-header signup-card-header">
                <span class="signup-step-badge mr-2">2</span>
                <strong>{{ $t('signup.step2') }}</strong>
              </div>
              <div class="card-body">

                <!-- Fee explanation micro-card -->
                <div class="card signup-fee-card mb-3">
                  <div class="card-body py-3">
                    <h6 class="card-title mb-2 text-brand">{{ $t('signup.fee_card_title') }}</h6>
                    <ul class="mb-2 pl-4">
                      <li>{{ $t('signup.fee_card_item1') }}</li>
                      <li>{{ $t('signup.fee_card_item2') }}</li>
                      <li>{{ $t('signup.fee_card_item3') }}</li>
                    </ul>
                    <p class="signup-muted mb-2">{{ $t('signup.fee_card_footer') }}</p>
                    <a class="signup-collapse-toggle" data-toggle="collapse" href="#whyFeeCollapse" role="button"
                      aria-expanded="false" aria-controls="whyFeeCollapse">
                      <i class="fas fa-question-circle mr-1"></i>{{ $t('signup.why_fee_toggle') }}
                    </a>
                    <div class="collapse mt-2" id="whyFeeCollapse">
                      <div class="signup-why-fee-content py-2 px-3">
                        <strong class="d-block mb-1">{{ $t('signup.why_fee_title') }}</strong>
                        <p class="signup-muted mb-0">{{ $t('signup.why_fee_body') }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Promo code toggle -->
                <div class="form-group mb-3">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="promo-code-chkbx" v-model="promo_code_chkbx">
                    <label class="custom-control-label font-weight-normal" for="promo-code-chkbx">{{ $t('promo_code') }}</label>
                  </div>
                </div>

                <div v-if="promo_code_chkbx" class="form-group mb-3">
                  <label for="promo-code-val">{{ $t('promo_code') }}</label>
                  <input type="text" class="form-control form-control-lg" id="promo-code-val" ref="promo-code-val"
                    v-model="promo_code_val" />
                </div>

                <div v-else>
                  <div class="form-group mb-3">
                    <label for="matching-afit">{{ $t('matching_rew_afit') }}</label>
                    <input type="number" class="form-control form-control-lg" id="matching-afit" ref="matching-afit"
                      readonly :value="getMatchingAFIT()" />
                  </div>

                  <div class="form-group mb-3">
                    <label for="invested-amount">{{ $t('choose_cryto') }}</label>
                    <div class="input-group">
                      <input type="number" class="form-control form-control-lg" id="invested-amount" ref="invested-amount"
                        readonly :value="getMatchingAmount()" />
                      <select @change="adjustCurrency" id="invested-crypto" name="invested-crypto" ref="invested-crypto"
                        class="form-control form-control-lg" style="max-width:120px">
                        <option value="HIVE">{{ $t('HIVE') }}</option>
                        <option value="HBD">{{ $t('HBD') }}</option>
                      </select>
                      <div class="input-group-append">
                        <button v-on:click="copyContent" data-targetEl="invested-amount" class="btn btn-brand">{{ $t('copy_amount') }}</button>
                      </div>
                    </div>
                  </div>

                  <p class="mb-3">{{ $t('notice_send_amount').replace('_CUR_', this.transferType) }}</p>

                  <div class="form-group mb-3">
                    <label for="actifit-address">{{ $t('Address') }}</label>
                    <div class="input-group">
                      <input class="form-control form-control-lg" id="actifit-address" ref="actifit-address" readonly
                        :value="getTargetAccount()" />
                      <div class="input-group-append">
                        <button v-on:click="copyContent" data-targetEl="actifit-address" class="btn btn-brand">{{ $t('Copy_Address') }}</button>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mb-3">
                    <label for="actifit-memo">{{ $t('Memo') }}</label>
                    <div class="input-group">
                      <input class="form-control form-control-lg" id="actifit-memo" ref="actifit-memo" readonly />
                      <div class="input-group-append">
                        <button v-on:click="setMemoValue" class="btn btn-outline-secondary">{{ $t('Regenerate') }}</button>
                        <button v-on:click="copyContent" data-targetEl="actifit-memo" class="btn btn-brand">{{ $t('Copy_Memo') }}</button>
                      </div>
                    </div>
                  </div>
                </div>

                <p class="signup-muted mb-3" v-if="!promo_code_chkbx">{{ $t('send_process_verf') }}</p>
                <p class="signup-muted mb-3" v-else>{{ $t('send_process_promo_verf') }}</p>

                <div class="alert alert-danger py-2" v-if="captcha_invalid">{{ captcha_invalid }}</div>
                <div class="alert alert-danger py-2" v-if="error_proceeding">{{ error_msg }}</div>

                <div class="text-center">
                  <button v-on:click="checkFunds" class="btn btn-brand btn-lg w-100" v-if="!promo_code_chkbx">
                    {{ $t('Steem_sent').replace('_CUR_', this.transferType) }}
                  </button>
                  <button v-on:click="checkFunds" class="btn btn-brand btn-lg w-100" v-else>
                    {{ $t('create_account') }}
                  </button>
                </div>

                <!-- Process status -->
                <div v-if="processStarted" class="text-center text-brand mt-3">
                  <div id="checking_funds">
                    <i class="fas fa-spin fa-spinner" v-if="checkingFunds"></i>
                    <i class="fas fa-check" v-if="!promo_code_chkbx && !checkingFunds"></i>
                    <span v-if="!promo_code_chkbx"> {{ $t('Check_Steem_Transfer') }}</span>
                  </div>
                  <div id="account_creation" v-if="resultReturned">
                    <div v-if="accountCreated" class="text-left mt-3">
                      <div class="alert alert-success">
                        <i class="fas fa-check-circle mr-1"></i><strong>{{ $t('account_created_success') }}</strong>
                        {{ $t('post_account_creation_notice') }}
                      </div>
                      <p class="mb-1">{{ $t('posting_key_notice') }}</p>
                      <div class="alert alert-warning small">
                        <strong class="d-block">{{ privatePostKey }}</strong>
                      </div>
                      <p class="signup-muted">{{ $t('copy_safe_location') }}</p>
                      <p class="signup-muted">{{ $t('delegation_received') }}</p>
                      <button class="btn btn-brand btn-lg w-100 mb-3" @click="generateAndDownloadFile">
                        <i class="fas fa-download mr-1"></i>{{ $t('signup.download_keys_backup') }}
                      </button>
                      <div v-html="$t('signup.signup_completion')" class="text-center"></div>
                    </div>
                    <div v-else>
                      <div class="alert alert-danger mt-3 text-left" v-html="$t('error_account_creation')"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Login CTA -->
            <div class="signup-login-cta mb-4">
              <a href="/login" class="signup-login-link">{{ $t('signup.login_cta') }} &rarr;</a>
            </div>

          </div>

          <!-- Sidebar column -->
          <div class="col-12 col-md-5 d-none d-md-block">
            <div class="signup-sidebar pl-3">

              <!-- Hive education card -->
              <div class="card signup-section-card mb-4">
                <div class="card-body">
                  <a class="signup-collapse-toggle d-flex align-items-center" data-toggle="collapse"
                    href="#hiveEducationCollapse" role="button" aria-expanded="false" aria-controls="hiveEducationCollapse">
                    <i class="fas fa-info-circle text-brand mr-2"></i>
                    <span>{{ $t('signup.hive_toggle') }}</span>
                  </a>
                  <div class="collapse mt-3" id="hiveEducationCollapse">
                    <h6 class="text-brand">{{ $t('signup.hive_title') }}</h6>
                    <p class="small mb-0">{{ $t('signup.hive_body') }}</p>
                  </div>
                </div>
              </div>

              <!-- FAQ accordion -->
              <div class="card signup-section-card mb-4">
                <div class="card-body pb-2">
                  <h6 class="text-brand mb-3">{{ $t('signup.faq_title') }}</h6>

                  <div class="mb-2">
                    <a class="signup-faq-toggle d-block" data-toggle="collapse" href="#faqItem1" role="button"
                      aria-expanded="false">
                      {{ $t('signup.faq_q1') }}
                    </a>
                    <div class="collapse" id="faqItem1">
                      <p class="signup-faq-answer mt-1 mb-2">{{ $t('signup.faq_a1') }}</p>
                    </div>
                  </div>

                  <div class="mb-2">
                    <a class="signup-faq-toggle d-block" data-toggle="collapse" href="#faqItem2" role="button"
                      aria-expanded="false">
                      {{ $t('signup.faq_q2') }}
                    </a>
                    <div class="collapse" id="faqItem2">
                      <p class="signup-faq-answer mt-1 mb-2">{{ $t('signup.faq_a2') }}</p>
                    </div>
                  </div>

                  <div class="mb-2">
                    <a class="signup-faq-toggle d-block" data-toggle="collapse" href="#faqItem3" role="button"
                      aria-expanded="false">
                      {{ $t('signup.faq_q3') }}
                    </a>
                    <div class="collapse" id="faqItem3">
                      <p class="signup-faq-answer mt-1 mb-2">{{ $t('signup.faq_a3') }}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Mobile: Hive education + FAQ below the form -->
        <div class="d-block d-md-none">
          <div class="card signup-section-card mb-4">
            <div class="card-body">
              <a class="signup-collapse-toggle d-flex align-items-center" data-toggle="collapse"
                href="#hiveEducationCollapseMobile" role="button" aria-expanded="false">
                <i class="fas fa-info-circle text-brand mr-2"></i>
                <span>{{ $t('signup.hive_toggle') }}</span>
              </a>
              <div class="collapse mt-3" id="hiveEducationCollapseMobile">
                <h6 class="text-brand">{{ $t('signup.hive_title') }}</h6>
                <p class="small mb-0">{{ $t('signup.hive_body') }}</p>
              </div>
            </div>
          </div>

          <div class="card signup-section-card mb-4">
            <div class="card-body pb-2">
              <h6 class="text-brand mb-3">{{ $t('signup.faq_title') }}</h6>
              <div class="mb-2">
                <a class="signup-faq-toggle d-block" data-toggle="collapse" href="#faqItem1Mobile" role="button">{{ $t('signup.faq_q1') }}</a>
                <div class="collapse" id="faqItem1Mobile"><p class="signup-faq-answer mt-1 mb-2">{{ $t('signup.faq_a1') }}</p></div>
              </div>
              <div class="mb-2">
                <a class="signup-faq-toggle d-block" data-toggle="collapse" href="#faqItem2Mobile" role="button">{{ $t('signup.faq_q2') }}</a>
                <div class="collapse" id="faqItem2Mobile"><p class="signup-faq-answer mt-1 mb-2">{{ $t('signup.faq_a2') }}</p></div>
              </div>
              <div class="mb-2">
                <a class="signup-faq-toggle d-block" data-toggle="collapse" href="#faqItem3Mobile" role="button">{{ $t('signup.faq_q3') }}</a>
                <div class="collapse" id="faqItem3Mobile"><p class="signup-faq-answer mt-1 mb-2">{{ $t('signup.faq_a3') }}</p></div>
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
import Footer from '~/components/Footer'
import steem from 'steem'
import hive from '@hiveio/hive-js'
import blurt from '@blurtfoundation/blurtjs'
//import VueRecaptcha from 'vue-recaptcha';
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { mapGetters } from 'vuex'
import Vue from 'vue'

Vue.use(VueReCaptcha, { siteKey: process.env.captchaV3Key })

export default {
  head() {
    return {
      title: `Signup Page - Actifit.io`,
      meta: [
        { hid: 'description', name: 'description', content: `Create your Actifit account and start earning crypto for staying active. Sign up in seconds and get a 100 AFIT welcome bonus.` },
        { hid: 'ogdescription', name: 'og:description', property: 'og:description', content: `Create your Actifit account and start earning crypto for staying active. Sign up in seconds and get a 100 AFIT welcome bonus.` },
        { hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'Signup Page - Actifit.io' }
      ],
      link: [
        { rel: 'canonical', href: `https://actifit.io/signup` }
      ]
    }
  },
  components: {
    NavbarBrand,
    Footer,
    //VueRecaptcha,
  },
  data() {
    return {
      targetMemo: '',
      checkingFunds: false,
      processStarted: false,
      resultReturned: false,
      accountCreated: false,
      //steemPrice: 0.1,
      //sbdPrice: 0.1,
      hivePrice: 0.1,
      hbdPrice: 1,
      transferType: 'HIVE',//default option
      minUSD: process.env.minSignupUSDCost,
      afitPrice: 0.5,
      maxAfitRewardPerLot: 100,
      lotSizeUsd: 5,
      userInputSTEEMAmount: 0,
      userInputUSDAmount: this.minUSD,
      username_exists: '',
      username_invalid: '',
      captchaValid: false,
      captcha_invalid: '',
      targetAccount: 'actifit.signup',
      delegatedSteem: 10,
      privatePostKey: '',
      privateActiveKey: '',
      privateOwnerKey: '',
      privateMemoKey: '',
      error_proceeding: '',
      error_msg: '',
      email: '',
      promo_code_chkbx: false,
      promo_code_val: '',
      hive_account: true,
      steem_account: false,
      blurt_account: false,
      blurt_active: true,
      reg: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/,
      usernameCheckTimer: null
    }
  },
  computed: {
    textualTitle() {
      return this.$t('signup.headline');
    },
    currentStep() {
      if (this.accountCreated) return 3;
      if (this.processStarted) return 2;
      return 1;
    }
  },
  async mounted() {


    //rely on HIVE node
    let properNode = process.env.hiveApiNode;


    //hive.config.set('rebranded_api', true)
    //hive.broadcast.updateOperations()
    hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);

    hive.api.setOptions({ url: properNode });

    steem.api.setOptions({ url: process.env.steemApiNode });

    blurt.api.setOptions({ url: process.env.blurtApiNode });

    //check if we need to show blurt signup option
    if (this.$route.query.chain && this.$route.query.chain == 'hive') {
      this.blurt_active = false;
      this.blurt_account = false;
    }

    //if a promo code is available, let's set it accordingly
    if (this.$route.query.promo) {
      this.promo_code_chkbx = true;
      this.promo_code_val = this.$route.query.promo;
    }


    //grab STEEM price
    /*fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
    res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
    }).catch(e => reject(e))

    //grab SBD price
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollar&vs_currencies=usd').then(
    res => {res.json().then(json => this.setSBDPrice (json['steem-dollar'].usd)).catch(e => reject(e))
    }).catch(e => reject(e))*/

    //grab HIVE price
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd').then(
      res => {
        res.json().then(json => this.setHivePrice(json.hive.usd)).catch(e => reject(e))
      }).catch(e => reject(e))

    //grab HBD price
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd').then(
      res => {
        res.json().then(json => this.setHBDPrice(json.hive_dollar.usd)).catch(e => reject(e))
      }).catch(e => reject(e))

    //grab AFIT price

    fetch(process.env.actiAppUrl + 'curAFITPrice').then(
      res => {
        res.json().then(json => this.setAFITPrice(json.unit_price_usd)).catch(e => reject(e))
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

    await this.$recaptchaLoaded()

  },
  methods: {
    generateAndDownloadFile() {
      let content = 'Please keep this file secure and confidential, as it holds information about your private account.';
      content += '\nUsername:' + this.$refs['account-username'].value;
      content += '\n# ' + this.$t('Posting_key_desc');
      content += '\nPrivate Posting Key:' + this.privatePostKey;
      content += '\n# ' + this.$t('Active_key_desc');
      content += '\nPrivate Active Key:' + this.privateActiveKey;
      content += '\n# ' + this.$t('Owner_key_desc');
      content += '\nPrivate Owner Key:' + this.privateOwnerKey;
      content += '\n# ' + this.$t('Memo_key_desc');
      content += '\nPrivate Memo Key:' + this.privateMemoKey;
      content += '\n# Below is the main password for the account';
      content += '\nMaster Password:' + this.$refs["account-password"].value;

      const blob = new Blob([content], { type: "text/plain" });

      // Create a URL for the Blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a link element for downloading
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "actifitkeys.txt";

      // Append the link to the DOM
      document.body.appendChild(link);

      // Click the link to trigger download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    },
    adjustCurrency(e) {
      if (e.target.options.selectedIndex > -1) {
        this.transferType = e.target.options[e.target.options.selectedIndex].value;
        //also adjust payment amount

      }
    },
    // Restore the functionality of this method to provide content for the modal
    signupProcessDetails() {
      return this.$t('signup.desc_part1')
			+ this.$t('signup.desc_part2') + this.afitTokensToEarn()
			+ this.$t('signup.desc_part3') + this.delegatedSteem
			+ this.$t('signup.desc_part3_5') + this.delegatedSteem
			+ this.$t('signup.desc_part4') + this.minUSD
			+ this.$t('signup.desc_part5') + this.afitTokensToEarn('100')
			+ this.$t('signup.desc_part6');
    },
    validateUserName() {
      this.handleUsername(this.$refs['account-username'].value);
      this.updateMinAmount();
    },
    updateMinAmount(){
      this.userInputUSDAmount = this.blurt_account ? this.minUSD * 2 : this.minUSD;
    },
    async checkUserNameAv(testChain, val) {
      let usernameValid = testChain.utils.validateAccountName(val);
      //check for error msg
      if (usernameValid == null) {
        //ensure no existing account matches same name
        let result = await testChain.api.getAccountsAsync([val]);
        console.log(testChain.name);
        if (result.length > 0) {
          if (testChain.name == 'Hive') {
            this.username_exists += 'Username is not available. Please choose a different one.\n';
          } else {
            this.username_exists += 'Username is not available on ' + testChain.name + '. Please choose a different one, or deselect ' + testChain.name + ' chain option.';
          }
          return false;
        }
        return true;
        //});
      } else {
        this.username_invalid = usernameValid;
        return false;
      }
    },
    handleUsername(val) {
      this.username_invalid = '';
      this.username_exists = '';

      // Immediate: scam pattern (no network, runs on every keystroke)
      const scamPattern = /^uid|^uid[^a-zA-Z0-9]|^\d{10}$|\d{10}/i;
      if (scamPattern.test(val)) {
        this.username_invalid = this.$t('invalid_username');
        clearTimeout(this.usernameCheckTimer);
        return;
      }

      // Immediate: format check via Hive validator (synchronous, no network)
      if (val.length > 0) {
        const formatError = hive.utils.validateAccountName(val);
        if (formatError !== null) {
          this.username_invalid = formatError;
          clearTimeout(this.usernameCheckTimer);
          return;
        }
      }

      // Debounce: availability check (network) + key derivation (CPU)
      clearTimeout(this.usernameCheckTimer);
      if (!val) return;
      this.usernameCheckTimer = setTimeout(async () => {
        let usAv = true;
        if (this.hive_account) {
          hive.name = 'Hive';
          usAv = await this.checkUserNameAv(hive, val);
        }
        if (usAv && this.steem_account) {
          steem.name = 'Steem';
          usAv = await this.checkUserNameAv(steem, val);
        }
        if (usAv && this.blurt_account) {
          blurt.name = 'Blurt';
          usAv = await this.checkUserNameAv(blurt, val);
        }
        this.genPrivKey();
      }, 500);
    },
    /*setSteemPrice (_steemPrice){
    this.steemPrice = parseFloat(_steemPrice).toFixed(3);
    },
    setSBDPrice (_sbdPrice){
    this.sbdPrice = parseFloat(_sbdPrice).toFixed(3);
    },*/
    setHivePrice(_hivePrice) {
      this.hivePrice = parseFloat(_hivePrice).toFixed(3);
    },
    setHBDPrice(_hbdPrice) {
      this.hbdPrice = parseFloat(_hbdPrice).toFixed(3);
    },
    /*minSteemAmount () {
    //take into consideration potential charges, and remove 0.1 STEEM for potential transfer loss
    return parseFloat(this.minUSD / this.steemPrice - 0.1).toFixed(3);
    },*/
    setAFITPrice(_afitPrice) {
      this.afitPrice = parseFloat(_afitPrice).toFixed(6);
    },
    afitTokensToEarn(usdInvest) {
      if (typeof usdInvest == 'undefined' || usdInvest == null || usdInvest == '' || usdInvest == 0) {
        usdInvest = this.blurt_account ? this.minUSD * 2 : this.minUSD;
      }
      console.log("usdInvest"+usdInvest);
      return parseFloat(usdInvest / this.afitPrice).toFixed(6);
    },
    async genPrivKey() {
      //generate posting key
      let privateKeys = await hive.auth.getPrivateKeys(this.$refs["account-username"].value.toLowerCase(), this.$refs["account-password"].value);//, ['posting']);
      this.privatePostKey = privateKeys.posting;
      this.privateActiveKey = privateKeys.active;
      this.privateOwnerKey = privateKeys.owner;
      this.privateMemoKey = privateKeys.memo;
    },
    async setPasswordVal() {
      this.$refs["account-password"].value = this.generatePassword(4);
      this.genPrivKey();
      //this.$refs["posting-key"].value =
    },
    generatePassword(multip) {
      //generate random 11 characters password
      let passString = '';
      for (let i = 0; i < multip; i++) {
        passString += Math.random().toString(36).substr(2, 13);
      }
      return passString;
    },
    getTargetAccount() {
      return this.targetAccount;
    },
    getMatchingAFIT() {
      let matchingAfitAmnt = parseFloat(this.userInputUSDAmount / this.afitPrice);
      //make sure we only reward max amount per lot
      let lotCount = Math.floor(this.userInputUSDAmount / this.lotSizeUsd);
      if (lotCount < 1) {
        lotCount += 1;
      }
      //max amount per lot
      let maxAfitPerTotLots = this.maxAfitRewardPerLot * lotCount
      if (matchingAfitAmnt > maxAfitPerTotLots) {
        matchingAfitAmnt = maxAfitPerTotLots;
      }
      return Math.floor(matchingAfitAmnt);
    },
    getMatchingAmount() {
      console.log(this.transferType);
      /*if (this.transferType == 'STEEM'){
        return parseFloat(this.userInputUSDAmount / this.steemPrice).toFixed(3);
      }else*/
      if (this.transferType == 'HIVE') {
        return parseFloat(this.userInputUSDAmount / this.hivePrice).toFixed(3);
      } else if (this.transferType == 'HBD') {
        return parseFloat(this.userInputUSDAmount / this.hbdPrice).toFixed(3);
      }
    },
    setMemoValue() {
      this.$refs["actifit-memo"].value = this.generateMemo();
    },
    generateMemo() {
      this.targetMemo = "acmm" + this.generatePassword(2);
      return this.targetMemo;
    },
    copyContent(event) {
      var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
      copyText.select();
      document.execCommand("copy");
      return;
    },
    onVerifyCaptcha(response) {
      this.captchaValid = true;
    },
    onExpiredCaptcha() {
      this.captchaValid = false;
    },
    async checkFunds() {
      this.captcha_invalid = '';
      this.error_proceeding = false;
      this.error_msg = '';

      let invested_usd = 0;
      if (!this.promo_code_chkbx) {
        invested_usd = this.userInputUSDAmount;
      }
      /*if (!this.captchaValid){
        this.captcha_invalid = this.$t('solve_captcha');
        return;
      }*/
      if (this.username_exists || this.username_invalid || this.$refs["account-username"].value == '') {
        this.error_proceeding = true;
        this.error_msg = this.$t('choose_proper_username');
        return;
      }
      if (this.isEmailValid() != '') {
        this.error_proceeding = true;
        this.error_msg = this.$t('invalid_email_format');
        return;
      }
      //make sure user copied and pasted password
      if (this.$refs["account-password-confirm"].value != this.$refs["account-password"].value) {
        this.error_proceeding = true;
        this.error_msg = this.$t('copy_password_confirm');
        return;
      }

      if (!this.hive_account && !this.blurt_account) {
        this.error_proceeding = true;
        this.error_msg = this.$t('need_hive_account');
        return;
      }

      //verify captcha
      //check captcha V3
      // Execute reCAPTCHA with action "login".

      const token = await this.$recaptcha('signup')

      //verify recaptcha-v3

      let outc = await fetch(process.env.actiAppUrl + 'verifyLoginCaptcha?token=' + token);
      console.log(outc);
      //let outc = await outc.json();

      if (outc.error) {
        this.error_proceeding = true;
        this.error_msg = this.$t('captcha_invalid');
        return;
      }

      //to prevent tampering with STEEM and AFIT values
      const steem_invest = this.getMatchingAmount();
      const afit_reward = this.getMatchingAFIT();
      this.checkingFunds = true;
      this.processStarted = true;
      //compile all needed data and send it along the request for processing
      let params = {
        new_account: this.$refs["account-username"].value.toLowerCase(),
        new_pass: this.$refs["account-password"].value,
        usd_invest: invested_usd,
        steem_invest: steem_invest,
        sent_cur: this.transferType,
        afit_reward: afit_reward,
        memo: this.targetMemo,
        referrer: this.$route.query.referrer,
        email: this.$refs["account-email"].value,
        promo_code: this.promo_code_val,
        //cur_bchain: 'HIVE',
      }
      params['cur_bchain'] = '';
      if (this.hive_account) {
        params['cur_bchain'] += 'HIVE|';
      }
      if (this.steem_account) {
        params['cur_bchain'] += 'STEEM|';
      }
      if (this.blurt_account) {
        params['cur_bchain'] += 'BLURT';
      }

      const queryString = new URLSearchParams(params).toString();
      const requestUrl = '/api/proxy/confirmPayment?' + queryString;
      console.log(requestUrl);
      try {
        let res = await fetch(requestUrl);
        let outcome = await res.json();
        this.checkingFunds = false;
        this.accountCreated = outcome.accountCreated;
        this.resultReturned = true;

        let privateKeys = await hive.auth.getPrivateKeys(this.$refs["account-username"].value.toLowerCase(), this.$refs["account-password"].value);//, ['posting']);
        this.privatePostKey = privateKeys.posting;
        this.privateActiveKey = privateKeys.active;
        this.privateOwnerKey = privateKeys.owner;
        this.privateMemoKey = privateKeys.memo;
      } catch (err) {
        console.error(err);
        this.checkingFunds = false;
      }
    },
    isEmailValid: function () {
      return (this.email == "") ? "" : (this.reg.test(this.email)) ? '' : 'has-error';
    }
  },
}
</script>

<style scoped>
/* Hero */
.signup-headline {
  font-size: 2rem;
  font-weight: 700;
}
.signup-sub {
  font-size: 1.05rem;
  color: var(--text-color);
  opacity: 0.75;
}
.signup-social-proof {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.65;
}

/* Step indicator */
.signup-step-indicator {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.signup-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}
.signup-step-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid rgba(128,128,128,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-color);
  background: var(--background-color);
  opacity: 0.6;
  transition: all 0.2s;
}
.signup-step.active .signup-step-circle,
.signup-step.done .signup-step-circle {
  opacity: 1;
}
.signup-step.active .signup-step-circle {
  background: #ff112d;
  border-color: #ff112d;
  color: #fff;
}
.signup-step.done .signup-step-circle {
  background: #28a745;
  border-color: #28a745;
  color: #fff;
}
.signup-step small {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.65;
  margin-top: 4px;
  text-align: center;
}
.signup-step.active small {
  color: #ff112d;
  opacity: 1;
  font-weight: 600;
}
.signup-step.done small {
  opacity: 1;
}
.signup-step-line {
  flex: 1;
  height: 2px;
  background: rgba(128,128,128,0.3);
  margin-top: 19px;
  max-width: 80px;
}

/* Cards */
.signup-section-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.signup-card-header {
  background: var(--background-color-2);
  color: var(--text-color);
  border-bottom: 1px solid rgba(128,128,128,0.2);
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
}
.signup-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ff112d;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Fee card */
.signup-fee-card {
  border-left: 4px solid #ff112d;
}
.signup-fee-card .card-body {
  padding: 1rem 1.25rem;
}

/* Why-fee collapse content */
.signup-why-fee-content {
  background: var(--background-color-2);
  border: 1px solid rgba(128,128,128,0.2);
  border-radius: 4px;
  color: var(--text-color);
}

/* Muted text helper (replaces text-muted which is hardcoded gray) */
.signup-muted {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.65;
}

/* Collapse toggles */
.signup-collapse-toggle {
  color: #ff112d;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
}
.signup-collapse-toggle:hover {
  text-decoration: underline;
  color: #c9000f;
}

/* FAQ */
.signup-faq-toggle {
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border-bottom: 1px dashed rgba(128,128,128,0.4);
  padding-bottom: 4px;
  display: block;
}
.signup-faq-toggle:hover {
  color: #ff112d;
  text-decoration: none;
}
.signup-faq-answer {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.75;
}

/* Login CTA */
.signup-login-cta {
  text-align: center;
}
.signup-login-link {
  color: var(--text-color);
  opacity: 0.65;
  text-decoration: none;
}
.signup-login-link:hover {
  color: #ff112d;
  opacity: 1;
  text-decoration: underline;
}

/* Form inputs — adapt to dark mode */
.form-control {
  background-color: var(--background-color-2);
  color: var(--text-color);
  border-color: rgba(128,128,128,0.35);
}
.form-control:focus {
  background-color: var(--background-color-2);
  color: var(--text-color);
  border-color: #ff112d;
  box-shadow: 0 0 0 0.2rem rgba(255,17,45,0.2);
}
.form-control[readonly] {
  background-color: var(--background-color-1);
  opacity: 0.85;
}

/* ID-level overrides */
#account-username {
  text-transform: lowercase;
}
#account_creation {
  word-wrap: break-word;
}
</style>
