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

        <!-- Kill switch (utils/sessionActions.js): say so up front, before anyone sends a payment -->
        <div v-if="!signupAvailable" class="alert alert-warning text-center mb-4" role="alert">{{ $t('signup_unavailable') }}</div>

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
                  <input class="form-control form-control-lg" ref="account-username" id="account-username" :readonly="!!quote"
                    @input="handleUsername($event.target.value.toLowerCase())" />
                  <p class="text-brand mt-1 mb-0" v-if="username_invalid"><b>{{ username_invalid }}</b></p>
                  <p class="text-brand mt-1 mb-0" v-if="username_exists"><b>{{ username_exists }}</b></p>
                </div>

                <div class="form-group mb-3">
                  <label for="account-password">{{ $t('Your_Password') }}</label>
                  <input class="form-control form-control-lg" id="account-password" ref="account-password" :readonly="!!quote"
                    v-on:change="genPrivKey" />
                  <p class="signup-muted mt-1 mb-1">
                    <i class="fas fa-exclamation-triangle text-warning mr-1"></i>{{ $t('signup.keys_warning') }}
                  </p>
                  <button v-on:click="setPasswordVal" :disabled="!!quote" class="btn btn-brand btn-sm mr-2">{{ $t('Regenerate') }}</button>
                  <button v-on:click="copyContent" data-targetEl="account-password" class="btn btn-brand btn-sm">{{ $t('Copy_Password') }}</button>
                </div>

                <div class="form-group mb-3">
                  <label for="account-password-confirm">{{ $t('confirm_password_copy') }}</label>
                  <input class="form-control form-control-lg" id="account-password-confirm" ref="account-password-confirm" :readonly="!!quote" />
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
                  <input class="form-control form-control-lg" id="account-email" ref="account-email" v-model="email" :readonly="!!quote" />
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
                <div class="alert alert-warning py-2" role="alert" v-if="recaptchaUnavailable">{{ $t('captcha_unavailable') }}</div>

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

                <div v-if="!signupAvailable" class="alert alert-warning mb-0" role="alert">{{ $t('signup_unavailable') }}</div>

                <!-- Payment address / memo / amount and the confirm buttons: only while signup works,
                     so nobody is told where to send funds that cannot be processed. The keys are made
                     in this browser; only the public keys go to the server, which answers with the
                     amount and a memo bound to these exact details (actifit-bot signup_with_keys.js). -->
                <template v-if="signupAvailable">
                <!-- Promo code toggle -->
                <div class="form-group mb-3">
                  <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" id="promo-code-chkbx" v-model="promo_code_chkbx" :disabled="!!quote">
                    <label class="custom-control-label font-weight-normal" for="promo-code-chkbx">{{ $t('promo_code') }}</label>
                  </div>
                </div>

                <div v-if="promo_code_chkbx" class="form-group mb-3">
                  <label for="promo-code-val">{{ $t('promo_code') }}</label>
                  <input type="text" class="form-control form-control-lg" id="promo-code-val" ref="promo-code-val"
                    v-model="promo_code_val" :readonly="!!quote" />
                </div>

                <div v-else>
                  <div class="form-group mb-3">
                    <label for="invested-crypto">{{ $t('choose_cryto') }}</label>
                    <select v-model="transferType" id="invested-crypto" name="invested-crypto" :disabled="!!quote"
                      class="form-control form-control-lg" style="max-width:160px">
                      <option value="HIVE">{{ $t('HIVE') }}</option>
                      <option value="HBD">{{ $t('HBD') }}</option>
                    </select>
                  </div>

                  <!-- Shown only once the server has quoted these exact details -->
                  <div v-if="quote && quote.amount">
                    <div class="alert alert-warning small">
                      <p class="mb-2">{{ $t('swk_keys_first') }}</p>
                      <button class="btn btn-brand btn-sm" @click="generateAndDownloadFile">
                        <i class="fas fa-download mr-1"></i>{{ $t('signup.download_keys_backup') }}
                      </button>
                    </div>

                    <p class="mb-3">{{ $t('swk_send_exactly').replace('_AMOUNT_', quote.amount).replace('_CUR_', quote.currency) }}</p>

                    <div class="form-group mb-3">
                      <label for="invested-amount">{{ quote.currency }}</label>
                      <div class="input-group">
                        <input class="form-control form-control-lg" id="invested-amount" ref="invested-amount" readonly :value="quote.amount" />
                        <div class="input-group-append">
                          <button v-on:click="copyContent" data-targetEl="invested-amount" class="btn btn-brand">{{ $t('copy_amount') }}</button>
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-3">
                      <label for="actifit-address">{{ $t('Address') }}</label>
                      <div class="input-group">
                        <input class="form-control form-control-lg" id="actifit-address" ref="actifit-address" readonly :value="quote.account" />
                        <div class="input-group-append">
                          <button v-on:click="copyContent" data-targetEl="actifit-address" class="btn btn-brand">{{ $t('Copy_Address') }}</button>
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-3">
                      <label for="actifit-memo">{{ $t('Memo') }}</label>
                      <div class="input-group">
                        <input class="form-control form-control-lg" id="actifit-memo" ref="actifit-memo" readonly :value="quote.memo" />
                        <div class="input-group-append">
                          <button v-on:click="copyContent" data-targetEl="actifit-memo" class="btn btn-brand">{{ $t('Copy_Memo') }}</button>
                        </div>
                      </div>
                    </div>

                    <div class="form-group mb-3" v-if="quote.afit_reward > 0">
                      <label for="matching-afit">{{ $t('matching_rew_afit') }}</label>
                      <input class="form-control form-control-lg" id="matching-afit" readonly :value="quote.afit_reward" />
                    </div>

                    <p class="signup-muted mb-3">{{ $t('send_process_verf') }}</p>
                  </div>
                </div>

                <p class="signup-muted mb-3" v-if="promo_code_chkbx">{{ $t('send_process_promo_verf') }}</p>

                <div class="alert alert-danger py-2" v-if="captcha_invalid">{{ captcha_invalid }}</div>
                <div class="alert alert-danger py-2" v-if="error_proceeding">{{ error_msg }}</div>

                <div class="text-center">
                  <button v-on:click="getQuote" :disabled="quoting" class="btn btn-brand btn-lg w-100" v-if="!promo_code_chkbx && !quote">
                    {{ $t('swk_continue') }}
                  </button>
                  <button v-on:click="checkFunds" :disabled="checkingFunds" class="btn btn-brand btn-lg w-100" v-else-if="!promo_code_chkbx">
                    {{ $t('Steem_sent') }}
                  </button>
                  <button v-on:click="checkFunds" :disabled="checkingFunds || quoting" class="btn btn-brand btn-lg w-100" v-else>
                    {{ $t('create_account') }}
                  </button>
                  <a href="#" class="d-inline-block mt-2 small" v-if="quote && !checkingFunds && !accountCreated" @click.prevent="editDetails">{{ $t('swk_edit_details') }}</a>
                </div>

                <!-- Process status -->
                <div v-if="processStarted" class="text-center text-brand mt-3">
                  <div id="checking_funds" v-if="checkingFunds">
                    <i class="fas fa-spin fa-spinner"></i>
                    <span v-if="!promo_code_chkbx"> {{ $t('swk_waiting') }}</span>
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
                </template>

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
import hive from '@hiveio/hive-js'
import { VueReCaptcha } from 'vue-recaptcha-v3'
import { mapGetters } from 'vuex'
import Vue from 'vue'
import { SIGNUP_AVAILABLE } from '~/utils/sessionActions'

// Signup is the only page that loads reCAPTCHA v3 (login dropped it in 1.14.32), and
// it needs a token per account created, so the registration lives here and must stay
// at module level: deferring Vue.use to mounted() once broke token verification
// (see 1.12.1). The token goes to the bot's /verifyLoginCaptcha below.
//
// autoHideBadge: when the script cannot reach Google - a fingerprint-blocking browser,
// or a blocked request - the badge shows Google's own "Could not connect to the
// reCAPTCHA service". Hiding the badge is permitted provided the required attribution
// is shown instead - NewFooterDesign.vue shows it on this page.
Vue.use(VueReCaptcha, { siteKey: process.env.captchaV3Key, loaderOptions: { autoHideBadge: true } })

const KEY_ROLES = ['owner', 'active', 'posting', 'memo']
//how long the page keeps checking for a payment after "I've sent payment"
const PAYMENT_WAIT_MS = 20 * 60 * 1000

export default {
  head() {
    return {
      title: `Signup Page - Actifit.io`,
      meta: [
        { hid: 'description', name: 'description', content: `Create your Actifit account and start earning crypto for staying active. Sign up in seconds and get a 100 AFIT welcome bonus.` },
        { hid: 'ogdescription', name: 'og:description', property: 'og:description', content: `Create your Actifit account and start earning crypto for staying active. Sign up in seconds and get a 100 AFIT welcome bonus.` },
        { hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'Signup Page - Actifit.io' }
      ]
    }
  },
  components: {
    NavbarBrand,
    Footer,
  },
  data() {
    return {
      signupAvailable: SIGNUP_AVAILABLE,
      checkingFunds: false,
      processStarted: false,
      resultReturned: false,
      accountCreated: false,
      transferType: 'HIVE',//default option
      //the server's answer for the current details: { fields, memo, amount, currency, account, afit_reward }
      quote: null,
      quoting: false,
      referrer: '',
      paymentWaitUntil: 0,
      pollTimer: null,
      username_exists: '',
      username_invalid: '',
      captcha_invalid: '',
      privatePostKey: '',
      privateActiveKey: '',
      privateOwnerKey: '',
      privateMemoKey: '',
      error_proceeding: '',
      error_msg: '',
      //reCAPTCHA could not load (blocked by the browser, an extension or the network)
      recaptchaUnavailable: false,
      email: '',
      promo_code_chkbx: false,
      promo_code_val: '',
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
      if (this.processStarted || this.quote) return 2;
      return 1;
    }
  },
  beforeDestroy() {
    clearTimeout(this.pollTimer);
  },
  async mounted() {
    //warn before the user sends a payment that signup cannot confirm
    this.$recaptchaLoaded().catch(() => { this.recaptchaUnavailable = true })

    //rely on HIVE node
    let properNode = process.env.hiveApiNode;


    //hive.config.set('rebranded_api', true)
    //hive.broadcast.updateOperations()
    hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);

    hive.api.setOptions({ url: properNode });

    //if a promo code is available, let's set it accordingly
    if (this.$route.query.promo) {
      this.promo_code_chkbx = true;
      this.promo_code_val = this.$route.query.promo;
    }

    //a referral link with a malformed name is ignored rather than blocking signup
    const referrer = String(this.$route.query.referrer || '').trim().toLowerCase();
    if (referrer && hive.utils.validateAccountName(referrer) == null) this.referrer = referrer;

    //the amount, memo and AFIT reward now come from the server's quote, not from prices read here
    this.setPasswordVal();

    // login
    await this.$store.dispatch('steemconnect/login')
    this.$store.dispatch('fetchUserTokens')
    this.$store.dispatch('fetchTransactions')
    this.$store.dispatch('fetchUserRank')
    this.$store.dispatch('fetchReferrals')


  },
  methods: {
    generateAndDownloadFile() {
      let content = 'Please keep this file secure and confidential, as it holds information about your private account.';
      content += '\nUsername:' + this.$refs['account-username'].value.trim().toLowerCase();
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
    checkUserNameAv(val) {
      return hive.api.getAccountsAsync([val]).then((result) => {
        if (result.length > 0) this.username_exists = 'Username is not available. Please choose a different one.';
      }).catch(() => {}); //the server checks the name again before quoting
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
        await this.checkUserNameAv(val);
        this.genPrivKey();
      }, 500);
    },
    genPrivKey() {
      const keys = hive.auth.getPrivateKeys(this.$refs["account-username"].value.trim().toLowerCase(), this.$refs["account-password"].value, KEY_ROLES);
      this.privatePostKey = keys.posting;
      this.privateActiveKey = keys.active;
      this.privateOwnerKey = keys.owner;
      this.privateMemoKey = keys.memo;
    },
    setPasswordVal() {
      this.$refs["account-password"].value = this.generatePassword(4);
      this.genPrivKey();
    },
    generatePassword(multip) {
      //random characters from the browser's secure generator
      const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const bytes = new Uint8Array(multip * 13);
      window.crypto.getRandomValues(bytes);
      //252 is the largest multiple of 36 below 256: dropping higher bytes keeps every character equally likely
      return Array.from(bytes).filter((b) => b < 252).map((b) => alphabet[b % 36]).join('');
    },
    copyContent(event) {
      var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
      copyText.select();
      document.execCommand("copy");
      return;
    },
    //Local checks before anything is sent. Returns true when the form is ready.
    formReady() {
      const name = this.$refs["account-username"].value;
      if (this.username_exists || this.username_invalid || name == '') {
        return this.showSignupError('invalid_username');
      }
      if (this.isEmailValid() != '') return this.showSignupError('invalid_email');
      //make sure user copied and pasted password
      if (this.$refs["account-password-confirm"].value != this.$refs["account-password"].value) {
        this.error_proceeding = true;
        this.error_msg = this.$t('copy_password_confirm');
        return false;
      }
      return true;
    },
    //What the server binds the memo to. Only the PUBLIC keys leave this page.
    signupFields() {
      const new_account = this.$refs["account-username"].value.trim().toLowerCase();
      const keys = hive.auth.getPrivateKeys(new_account, this.$refs["account-password"].value, KEY_ROLES);
      const fields = { new_account, sent_cur: this.transferType };
      for (const role of KEY_ROLES) fields['keys[' + role + ']'] = keys[role + 'Pubkey'];
      if (this.referrer && this.referrer !== new_account) fields.referrer = this.referrer;
      const email = String(this.email || '').trim();
      if (email) fields.email = email;
      const promo = String(this.promo_code_val || '').trim();
      if (this.promo_code_chkbx && promo) fields.promo_code = promo;
      return fields;
    },
    //Form-encoded, so the browser sends it straight to the API without a CORS preflight.
    async postSignup(route, fields) {
      const res = await fetch(process.env.actiAppUrl + 'app/' + route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields).toString(),
      });
      try {
        return await res.json();
      } catch (err) {
        return { reason: 'server_error', retryable: true };
      }
    },
    showSignupError(reason) {
      const msg = {
        signup_disabled: 'swk_paused',
        username_taken: 'choose_proper_username',
        invalid_username: 'choose_proper_username',
        invalid_email: 'invalid_email_format',
        promo_invalid: 'swk_promo_invalid',
        rate_limited: 'swk_rate_limited',
        payment_insufficient: 'swk_underpaid',
        payment_pending: 'swk_not_seen_yet',
      }[reason] || 'swk_try_again';
      this.error_proceeding = true;
      this.error_msg = this.$t(msg);
      return false;
    },
    clearErrors() {
      this.captcha_invalid = '';
      this.error_proceeding = false;
      this.error_msg = '';
    },
    //Step 1 -> 2: get the amount and the memo for these exact details. Returns true on success.
    async getQuote() {
      if (!this.signupAvailable || this.quoting || this.checkingFunds) return false;
      this.clearErrors();
      if (!this.formReady()) return false;
      this.quoting = true;
      try {
        if (!(await this.passSignupCaptcha())) return false;
        let fields = this.signupFields();
        let out = await this.postSignup('signupQuote', fields);
        if (out.reason === 'invalid_referrer' && fields.referrer) {
          //the referral link names an account that does not exist: sign up without it
          this.referrer = '';
          fields = this.signupFields();
          out = await this.postSignup('signupQuote', fields);
        }
        const amount = out.amounts && out.amounts[fields.sent_cur];
        if (out.reason !== 'quoted' || !out.memo || (!fields.promo_code && !(amount && out.signup_account))) {
          if (out.reason === 'quoted') return this.showSignupError('server_error');
          if (out.reason === 'username_taken') this.username_exists = this.$t('choose_proper_username');
          return this.showSignupError(out.reason);
        }
        this.quote = {
          fields, memo: out.memo, amount: amount || '', currency: fields.sent_cur,
          account: out.signup_account || '', afit_reward: out.afit_reward || 0,
        };
        return true;
      } catch (err) {
        return this.showSignupError('server_error');
      } finally {
        this.quoting = false;
      }
    },
    //Back to step 1: only safe before paying, since the memo belongs to the old details.
    editDetails() {
      if (this.checkingFunds) return;
      this.quote = null;
      this.processStarted = false;
      this.resultReturned = false;
      this.clearErrors();
    },
    //"I've sent payment" (paid) or "Create Account" (promo): ask the server to create the account.
    async checkFunds() {
      //never ask the server to create an account while signup is switched off
      if (!this.signupAvailable) return;
      //one request at a time: a double click must not send two
      if (this.checkingFunds || this.quoting) return;
      this.clearErrors();
      //a promo signup has no payment step: quote and submit in one click
      if (!this.quote && !(this.promo_code_chkbx && (await this.getQuote()))) return;
      this.checkingFunds = true;
      this.processStarted = true;
      this.resultReturned = false;
      this.paymentWaitUntil = Date.now() + PAYMENT_WAIT_MS;
      await this.submitSignup();
    },
    async submitSignup() {
      if (this._isDestroyed || !this.quote) return;
      let out;
      try {
        out = await this.postSignup('signupWithKeys', Object.assign({}, this.quote.fields, { memo: this.quote.memo }));
      } catch (err) {
        out = { reason: 'server_error', retryable: true };
      }
      if (out.accountCreated) {
        this.checkingFunds = false;
        this.accountCreated = true;
        this.resultReturned = true;
        return;
      }
      //payment not seen yet, or a passing server problem: check again shortly
      const wait = Number(out.retry_after) > 0 ? Number(out.retry_after) : 10;
      if (out.retryable && wait <= 60 && Date.now() + wait * 1000 < this.paymentWaitUntil) {
        this.pollTimer = setTimeout(() => this.submitSignup(), wait * 1000);
        return;
      }
      this.checkingFunds = false;
      this.showSignupError(out.reason);
      //a final failure after paying needs support (refund): show how to reach them
      //a wrong promo code frees these details on the server: let the user fix the code
      if (out.reason === 'promo_invalid') this.quote = null;
      else if (!out.retryable) this.resultReturned = true;
    },
    //Gets a reCAPTCHA v3 token and has the server check it. Returns true when signup may go on.
    async passSignupCaptcha() {
      const unavailable = () => {
        this.recaptchaUnavailable = true;
        this.error_proceeding = true;
        this.error_msg = this.$t('captcha_unavailable');
        return false;
      };
      //the plugin only defines $recaptcha once Google's script has loaded
      if (typeof this.$recaptcha !== 'function') return unavailable();
      let token;
      let timer;
      try {
        //a dropped request to Google can leave this pending forever
        const timeout = new Promise((resolve) => { timer = setTimeout(() => resolve(null), 15000); });
        token = await Promise.race([this.$recaptcha('signup'), timeout]);
      } catch (err) {
        return unavailable();
      } finally {
        clearTimeout(timer);
      }
      if (!token) return unavailable();

      let outcome;
      try {
        const res = await fetch(process.env.actiAppUrl + 'verifyLoginCaptcha?token=' + encodeURIComponent(token));
        outcome = await res.json();
      } catch (err) {
        //our server did not answer; the quote request will report that itself
        return true;
      }
      if (outcome && outcome.success) return true;
      //stop only when the token itself was bad (expired, reused or not ours): a new click
      //gets a new token. Other answers (our server cannot reach Google, a broken secret or
      //site key) are not the user's fault and retrying would not help.
      const reason = String((outcome && outcome.reason) || '');
      if (!/timeout-or-duplicate|invalid-input-response/.test(reason)) return true;
      this.error_proceeding = true;
      this.error_msg = this.$t('captcha_invalid');
      return false;
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
