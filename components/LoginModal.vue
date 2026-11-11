<template>
  <!-- 1. A unique class is added here to contain all styles and prevent leakage -->
  <div class="modal fade login-modal-final" id="loginModal" ref="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-custom-size modal-dialog-scrollable" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('Login_actifit') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="login-container">
            <div class="form home-card mx-auto p-3">
              <!-- The .acti-shadow class in the template will now work correctly -->
              <div class="form-group login-form-centered">
                <input type="text" id="username" name="username" autocomplete="username" :placeholder="$t('Username')" ref="username" class="form-control form-control-lg m-1 col-md-8 acti-shadow">
                <button v-on:click="loginKeychain" class="btn btn-brand keychain-btn login-stdd-btn m-1"></button>
                <button v-on:click="loginHiveauth" class="btn hiveauth-btn acti-shadow login-stdd-btn m-1"></button>
                <transition name="fade">
                  <div v-if="hiveauth_wait">
                    <div id="hiveauth-instructions">{{ $t('hiveauth_instructions')}}</div>
                    <a href="#" id="hiveauth-qr-link" ref="hiveauth-qr-link" target="_blank" rel="noreferrer noopener">
                      <canvas id="hiveauth-qr" ref="hiveauth-qr" width="200" height="200" />
                    </a>
                  </div>
                </transition>
                <input type="password" id="ppkey" name="ppkey" autocomplete="current-password" ref="ppkey" :placeholder="$t('Ppkey')"  class="form-control form-control-lg m-1 col-md-8 acti-shadow">
                <button v-on:click="proceedLogin" :disabled="login_in_progress" class="btn btn-brand login-stdd-btn m-1"><b>{{ $t('Login') }}</b><i class="fas fa-spin fa-spinner text-white" v-if="login_in_progress"></i></button>
                <div class="form-control-lg ml-0 mt-2">
                  <a href="/password" class="small">{{ $t('forgot_my_posting_key') }}</a>
                </div>
                <span class="mb-1 form-control-lg " style="display: none">
                  <div class="bchain-option p-1 m-1 btn" :class="adjustHiveClass">
                    <input type="radio" id="hive_bchain" value="HIVE" v-model="bchain_val">
                    <img src="/img/HIVE.png" style="max-height: 50px;" v-on:click="bchain_val = 'HIVE'" alt="Select Hive blockchain">
                    <label for="hive_bchain">{{ $t('HIVE') }}</label>
                  </div>
                  <div class="bchain-option p-1 m-1 btn m-auto" :class="adjustSteemClass" style="display:none">
                    <input type="radio" id="steem_bchain" value="STEEM" v-model="bchain_val">
                    <img src="/img/STEEM.png" style="max-height: 50px;" v-on:click="bchain_val = 'STEEM'" alt="Select Steem blockchain" >
                    <label for="steem_bchain">{{ $t('STEEM') }}</label>
                  </div>
                  <div class="bchain-option p-1 m-1 btn" :class="adjustBlurtClass">
                    <input type="radio" id="blurt_bchain" value="BLURT" v-model="bchain_val">
                    <img src="/img/BLURT.png" style="max-height: 50px;" v-on:click="bchain_val = 'BLURT'" alt="Select Blurt blockchain" >
                    <label for="blurt_bchain">{{ $t('BLURT') }}</label>
                  </div>
                </span>
                <span class="row mb-1 form-control-lg ml-0">
                  <input type="checkbox" id="keeploggedin" v-model="keep_loggedin_val" >
                  <label for="keeploggedin" class="ml-2">{{ $t('keep_loggedin') }}</label>
                </span>
                <!-- always rendered with a reserved line, so an error appearing does not shift the form -->
                <div class="text-brand text-center login-error-line" role="alert">
                  <template v-if="error_proceeding">{{ error_msg }}</template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // YOUR CURRENT, IMPROVED SCRIPT IS PRESERVED
  import QRious from 'qrious';
  import { PublicKey, Signature, hash } from '@hiveio/hive-js/lib/auth/ecc';
  import signedChallengeLogin from '~/mixins/signedChallengeLogin';

  export default {
    mixins: [signedChallengeLogin],
    head () {
      return {
        title: `Login Page - Actifit.io`,
        meta: [
          { hid: 'description', name: 'description', content: `Login to your actifit.io account` },
          { hid: 'ogdescription', property: 'og:description', content: `Login to your actifit.io account` }
        ]
      }
    },
    data () {
      return {
        originalTitle: document.title,
        resultReturned: false,
        username_exists: '',
        username_invalid: '',
        privatePostKey: '',
        error_proceeding: '',
        error_msg: '',
        account_name: '',
        is_logged_in: false,
        user: '',
        login_in_progress: false,
        bchain_val: 'HIVE',
        keep_loggedin_val: false,
        keychain: {},
        keychain_available: false,
        hiveauth_wait: false,
        hiveauth_key: undefined,
        hiveauth_token: undefined,
        hiveauth_expire: undefined,
      }
    },
    computed: {
      adjustHiveClass () { if (this.bchain_val != 'HIVE') return 'option-opaque'; return ''; },
      adjustSteemClass () { if (this.bchain_val != 'STEEM') return 'option-opaque'; return ''; },
      adjustBlurtClass () { if (this.bchain_val != 'BLURT') return 'option-opaque'; return ''; }
    },
    async mounted () {
      document.body.appendChild(this.$el);
      $(this.$refs.loginModal).on('show.bs.modal', () => {
        this.originalTitle = document.title;
        document.title = this.$t('Login_actifit');
      });
      $(this.$refs.loginModal).on('hidden.bs.modal', () => {
        document.title = this.originalTitle;
        this.resetForm();
        this.$emit('close');
      });
      this.verifyKeychain();
    },
    beforeDestroy() {
      if (this.$el && this.$el.parentNode) {
        this.$el.parentNode.removeChild(this.$el);
      }
      $(this.$refs.loginModal).off('show.bs.modal hidden.bs.modal');
    },
    methods: {
      // All your current methods are preserved...
      resetForm() {
        this.$refs.username.value = ''; this.$refs.ppkey.value = ''; this.login_in_progress = false; this.error_proceeding = false; this.error_msg = ''; this.hiveauth_wait = false;
      },
      closeModal() {
        $(this.$refs.loginModal).modal('hide'); document.title = this.originalTitle;
      },
      generateToken (multip) { let passString = ''; for (let i=0;i<multip;i++){ passString += Math.random().toString(36).substr(2, 13); } return passString; },
      // Takes the /loginVerify body, exactly like the other two methods, so HiveAuth
      // finally holds a real API session instead of a browser-only logged-in flag.
      //
      // access_token is the API JWT, since every x-acti-token caller reads that key.
      // The HAS token moves to hiveauth_has_token: it is what $HAS.broadcast needs, and
      // it is NOT interchangeable with the JWT. Keeping both in access_token is what
      // left HiveAuth users unable to use any authenticated endpoint.
      setHiveauthLoginStatus (json){
        if (json && json.success && json.token && json.userdata){
          let acct_data = json.userdata; let userSC = new Object(); userSC.account = acct_data;
          this.is_logged_in = true; this.$store.commit('setStdLoginUser', true);
          localStorage.setItem('acti_login_method', 'hiveauth');
          localStorage.setItem('access_token', json.token);
          localStorage.setItem('hiveauth_has_token', this.hiveauth_token);
          localStorage.setItem('expires', this.hiveauth_expire);
          localStorage.setItem('key', this.hiveauth_key);
          localStorage.setItem('std_login', true);
          localStorage.setItem('std_login_name', userSC.account.name);
          this.captureSecurityNotice(json);
          this.$store.commit('steemconnect/login', userSC);
          this.closeModal(); this.resetForm();
          this.$store.dispatch('steemconnect/refreshUser');
          this.$store.dispatch('fetchModerators');
          this.$emit('login-successful');
        }else{
          this.error_proceeding = true; this.login_in_progress = false;
          this.error_msg = this.$t('login_error'); return;
        }
      },
      setKeychainLoginStatus (json){
        if (json && json.success && json.token && json.userdata){ let acct_data = json.userdata; let userSC = new Object(); userSC.account = acct_data; this.is_logged_in = true; this.$store.commit('setStdLoginUser', true); localStorage.setItem('access_token', json.token); localStorage.setItem('std_login', true); localStorage.setItem('std_login_name', userSC.account.name); localStorage.setItem('acti_login_method', 'keychain'); this.captureSecurityNotice(json); this.$store.commit('steemconnect/login', userSC); this.closeModal(); this.resetForm(); this.$store.dispatch('steemconnect/refreshUser'); this.$store.dispatch('fetchModerators'); this.$emit('login-successful'); }else{ this.error_proceeding = true; this.login_in_progress = false; this.error_msg = this.$t('login_error'); return; }
      },
      // Capture the post-login security notice.
      //
      // actifit-bot returns, in the /loginVerify SUCCESS body, for a flagged account whose
      // posting key has not been rotated since the 2026-10-21 incident:
      //     security_notice: { code: 'KEY_ROTATION_RECOMMENDED', message: '<guidance>' }
      // Login is NOT refused - the account works normally; the user is being advised to
      // rotate the key the attacker may also hold.
      //
      // All three login methods now go through /loginVerify, so all three can carry
      // it - and every success handler must capture it. Keychain users are likely
      // the largest flagged group; missing it there would hide the notice from them.
      //
      // Stored rather than rendered here on purpose. This component calls closeModal()
      // on success and pages/login.vue calls postLoginRedirect(), so a banner rendered at
      // this point would be torn down before anyone read it. The store + localStorage
      // pair survives the redirect, and layouts/default.vue shows it on every page until
      // the user dismisses it.
      //
      // Allow-listed by code, so an unexpected field cannot put arbitrary server text on
      // every page of the site.
      captureSecurityNotice (json) {
        const notice = json && json.security_notice;
        if (!notice || notice.code !== 'KEY_ROTATION_RECOMMENDED') return;
        if (typeof notice.message !== 'string' || !notice.message.trim()) return;
        this.$store.commit('setSecurityNotice', notice.message);
        try { localStorage.setItem('acti_security_notice', notice.message); } catch (e) { /* private mode */ }
      },
      setUserLoginStatus (json, postingKey) {
        this.is_logged_in = json.success; if (json.success && json.token){ localStorage.setItem('actiToken', json.token); let userSC = new Object(); userSC.account = json.userdata; this.$store.commit('setStdLoginUser', true); this.$store.commit('setChatPostingKey', postingKey); this.captureSecurityNotice(json); localStorage.setItem('access_token', json.token); localStorage.setItem('std_login', true); localStorage.setItem('std_login_name', userSC.account.name); localStorage.setItem('acti_login_method', ''); this.$store.commit('steemconnect/login', userSC); this.closeModal(); this.resetForm(); this.$store.dispatch('steemconnect/refreshUser'); this.$store.dispatch('fetchModerators'); this.$emit('login-successful'); }else{ this.error_proceeding = true; this.login_in_progress = false; this.error_msg = this.$t('login_error'); }
      },
      verifyHiveauth (challenge, data){ const sig = Signature.fromHex(data.challenge); const buf = hash.sha256(challenge, null, 0); return sig.verifyHash(buf, PublicKey.fromString(data.pubkey)); },
      async loginHiveauth () {
        if (this.login_in_progress) { return; } // one login at a time
        // a failed Keychain attempt's message must not sit under the new QR code
        this.error_proceeding = false; this.error_msg = '';
        if (this.$refs["username"].value == ''){ this.error_proceeding = true; this.error_msg = this.$t('login_error'); return; }
        this.login_in_progress = true;
        const account = this.$refs["username"].value.trim().toLowerCase();

        // The challenge is now the SERVER's message, not a locally invented one. That is
        // the whole point: previously HiveAuth proved possession to the browser, which
        // then declared itself logged in, and the server was never involved -- so the
        // session was decorative and every authenticated call failed.
        // requestLoginChallenge reports its own failure, and more precisely.
        const challenge = await this.requestLoginChallenge(account);
        if (!challenge) { return; }

        const APP_META = { name:"actifit", description: process.env.socialSharingTitle, icon:"https://actifit.io/img/actifit_logo.png" };
        const auth = { username: account, expire: undefined, key: undefined };
        const challenge_data = { key_type: "posting", challenge: challenge.message };
        const mainRef = this;

        this.hiveauthAuthenticate(auth, APP_META, challenge_data, (message) => {
          if (message.cmd && message.cmd === 'auth_wait'){
            this.hiveauth_wait = true;
            this.$nextTick(() => {
              const authPayload = { uuid: message.uuid, account: account, key: message.key, host: 'wss://hive-auth.arcange.eu' };
              this.hiveauth_key = message.key;
              const authUri = `has://auth_req/${btoa(JSON.stringify(authPayload))}`;
              const qrLinkElement = mainRef.$refs['hiveauth-qr-link'];
              const qrElement = mainRef.$refs['hiveauth-qr'];
              const QR = new QRious({ element: qrElement, background: 'white', backgroundAlpha: 0.8, foreground: 'black', size: 200 });
              QR.value = authUri; qrLinkElement.href = authUri;
            });
          }
        }).then(async (message) => {
          if (message.cmd && message.cmd === 'auth_ack'){
            const { data } = message;
            const { expire, token } = data;
            this.hiveauth_wait = false;
            this.hiveauth_expire = expire;
            this.hiveauth_token = token;

            // data.challenge is the SIGNATURE over challenge_data.challenge. We still
            // verify it locally to fail fast on a malformed reply, but the verdict that
            // matters is the server's -- it checks the signature against the account's
            // current posting authority on chain.
            if (!this.verifyHiveauth(challenge_data.challenge, data.challenge)) {
              this.error_proceeding = true; this.login_in_progress = false;
              this.error_msg = this.$t('login_error'); return;
            }

            // Through the mixin, like pages/login.vue. The hand-rolled version here had no
            // 503 branch and the same broken expired-nonce match, so it reported a busy
            // server and an expired prompt alike as "your key is incorrect". The mixin
            // never throws and reports both precisely.
            const json = await this.submitLoginVerify(account, challenge.nonce, data.challenge.challenge, 'hiveauth');
            if (json) { this.setHiveauthLoginStatus(json); }
          } else if (message.cmd && message.cmd === 'auth_nack'){
            this.error_proceeding = true; this.login_in_progress = false;
            this.error_msg = this.$t('auth_rejected_by_user'); return;
          }
        }).catch(err => {
          console.error(err);
          this.error_proceeding = true;
          this.error_msg = this.$t(err && err.message === 'hiveauth_timeout' ? 'hiveauth_timeout' : 'login_error');
          this.hiveauth_wait = false; this.login_in_progress = false;
        });
      },
      async loginKeychain () {
        if (this.login_in_progress) { return; } // one login at a time
        this.error_proceeding = false; this.error_msg = '';
        if (!await this.verifyKeychain()) { this.failLogin(this.$t('keychain_not_detected')); return; }
        if (this.$refs["username"].value == ''){ this.error_proceeding = true; this.error_msg = this.$t('login_error'); return; }
        this.$store.commit('setBchain', this.bchain_val);
        localStorage.setItem('cur_bchain', this.bchain_val);
        const account_name = this.$refs["username"].value.trim().toLowerCase();
        this.login_in_progress = true;

        // requestSignBuffer, not requestVerifyKey: we now need a SIGNATURE over the
        // server's nonce, not a decrypted memo. The key stays inside the extension.
        const json = await this.signedChallengeLogin(account_name, 'keychain', (message) =>
          new Promise((resolve) => {
            window.hive_keychain.requestSignBuffer(account_name, message, 'Posting', (response) => {
              resolve(response && response.success === true ? response.result : null);
            });
          })
        );
        if (json) { this.setKeychainLoginStatus(json); }
      },
      async proceedLogin () {
        if (this.login_in_progress) { return; } // one login at a time
        this.error_proceeding = false;
        this.error_msg = '';
        if (this.$refs["username"].value == '' || this.$refs["ppkey"].value == ''){ this.error_proceeding = true; this.error_msg = this.$t('login_error'); return; }
        this.login_in_progress = true;
        this.$store.commit('setBchain', this.bchain_val);
        localStorage.setItem('cur_bchain', this.bchain_val);
        const account_name = this.$refs["username"].value.trim().toLowerCase();
        const priv_pkey = this.$refs["ppkey"].value;
        try {
          // The typed key is used HERE and never transmitted. Signature.signBufferSha256
          // coerces the WIF itself and asserts on an invalid one, so a bad key throws
          // rather than silently producing a junk signature the server would reject with
          // an unhelpful message.
          //
          // priv_pkey still reaches setUserLoginStatus, which puts it in the Vuex store
          // for the chat widget. That is the remaining in-browser exposure and is
          // deliberately out of scope here -- see the StingChat signing gate.
          // Refuse an active/owner key before anything else touches it.
          if (!await this.assertPostingOnlyKey(account_name, priv_pkey)) { return; }
          const json = await this.signedChallengeLogin(account_name, 'posting', (message) =>
            Signature.signBufferSha256(hash.sha256(message), priv_pkey).toHex()
          );
          if (json) { this.setUserLoginStatus(json, priv_pkey); }
        } catch (e) {
          console.error('Login error:', e);
          this.error_proceeding = true;
          this.login_in_progress = false;
          this.error_msg = this.$t('login_error');
        }
      },
    }
  }
</script>

<style scoped>
/*
  2. All styles below are from your CURRENT file, but now prefixed with ".login-modal-final"
  to prevent them from affecting any other element on your site.
*/
.login-modal-final .icon-steemconnect:before {
    content: "\e6c1";
}
.login-modal-final .icon-steemconnect{
    font-family: "iconfont" !important; font-size: 16px; font-style: normal;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    font-size: 32px; color: #1500ff;
}
.login-modal-final .std-login{
    border-right: 2px solid red;
}
.login-modal-final .option-opaque{
    opacity: 0.5;
}
.login-modal-final .login-stdd-btn{
    height: 50px; width: 150px;
}
.login-modal-final .keychain-btn{
    background: url(/img/keychain.png) round !important;
}
.login-modal-final .hiveauth-btn{
    background-size: contain; background-repeat: no-repeat; background-color: black;
    background-position: center; background-origin: content-box; background-image: url(/img/hiveauth3.png);
}

/* 3. RESTORED: The red hover effect from your original file is added back in. */
.login-modal-final .hiveauth-btn:hover,
.login-modal-final .keychain-btn:hover{
    background-color: darkred;
}

.login-modal-final .modal-content {
  border-radius: 10px; max-height: 80vh; overflow-y: auto; padding: 10px;
}
.login-modal-final .btn-primary {
  background-color: #007bff; border: none; padding: 10px 15px; font-size: 1rem;
}
.login-modal-final .btn-primary:hover {
  background-color: #0056b3;
}

/* 4. RESTORED: The definition for the .acti-shadow class is added back in. */
.login-modal-final .acti-shadow {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.login-modal-final .login-card-centered {
  display: flex; justify-content: center; align-items: center; min-height: 80vh; transform: translateY(-20%);
}
.login-modal-final .login-form-centered{
  justify-content: center; align-items: center;
}
/* top-aligned, like the dialog: when the QR code or an error appears the form grows
   downward instead of the whole dialog re-centering and jumping */
.login-modal-final .login-container {
  display: flex; justify-content: center; align-items: flex-start; min-height: 50vh;
}
.login-modal-final .login-error-line {
  min-height: 1.5em;
}
.login-modal-final #hiveauth-qr {
  width: 200px; height: 200px;
}
.login-modal-final .home-card {
  width: 100%; max-width: 400px;
}
.login-modal-final .modal-custom-size {
  max-width: 90%; width: 35%;
}

@media (max-width: 768px) {
  .login-modal-final .modal-custom-size {
    width: 95%; margin: 0 auto;
  }
  .login-modal-final .form-control-lg {
    font-size: 16px;
  }
  .login-modal-final .modal-body {
    padding: 15px;
  }
  .login-modal-final .home-card {
    padding: 15px;
  }
}
</style>
