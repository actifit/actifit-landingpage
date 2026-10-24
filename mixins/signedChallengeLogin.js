/**
 * Signed-challenge login, shared by components/LoginModal.vue and pages/login.vue.
 *
 * The server issues a single-use nonce plus the exact message to sign; the client returns
 * only a signature. The private posting key never leaves the browser.
 *
 * WHY THIS REPLACES THE OLD FLOWS
 *
 *   /loginAuth POSTed the user's raw private posting key to our servers. It was never
 *   forgeable -- the check is local key math -- but the key crossed the network and sat
 *   in our process memory for no functional reason.
 *
 *   /loginKeychain + /loginKeychainVerify compared a value derived from two PUBLIC inputs
 *   under a static server secret, so anyone holding that secret could mint a session for
 *   any account without holding a key at all.
 *
 * WHY A MIXIN RATHER THAN A COPY IN EACH FILE
 *
 *   These two components already carried near-duplicate login code, and they drifted:
 *   pages/login.vue's Keychain handler read `json.HIVE` where the API returns
 *   `json.userdata`, so Keychain login was broken there for every user while the modal
 *   worked. One implementation makes that class of divergence impossible.
 *
 * CONTRACT (actifit-bot #147)
 *   POST /loginChallenge {username}
 *     -> {success, nonce, message, expires_in}
 *   POST /loginVerify {username, nonce, signature, method, keeploggedin}
 *     -> {success, token, userdata, security_notice?}
 *     403 'Login request expired' once the nonce is spent or past its TTL.
 *
 * The consuming component must provide: error_proceeding, login_in_progress, error_msg,
 * keep_loggedin_val, and $t.
 */
import hive from '@hiveio/hive-js'

const REQUEST_TIMEOUT_MS = 20000

export default {
  methods: {
    /**
     * Refuse a typed key that is actually the ACTIVE or OWNER key.
     *
     * Users paste the wrong key more often than you would think, and the consequences
     * are not symmetric: a posting key can post and vote, an active key can move funds,
     * an owner key can take the account. Someone typing an owner key into a web form has
     * made a much larger mistake than a failed login, and they will not find out from us
     * unless we tell them.
     *
     * hive.blog does the same check (condenser UserSaga.js): "This login gives owner or
     * active permissions and should not be used here."
     *
     * FAILS OPEN on any lookup problem. This guard protects the user from their own
     * slip, not us from an attacker — an attacker holding the owner key does not need to
     * get past a client-side check. Blocking login because a chain read failed would
     * trade a real outage for no security.
     */
    async assertPostingOnlyKey (username, wif) {
      let pub
      try {
        pub = hive.auth.wifToPublic(wif)
      } catch (e) {
        return true // not a valid WIF at all; let the signer report that
      }
      let acct
      try {
        const res = await fetch('/api/proxy/getAccountData?user=' +
          encodeURIComponent(username) + '&bchain=HIVE')
        const json = await res.json()
        acct = json && (json.HIVE || json)
      } catch (e) {
        return true
      }
      if (!acct || !acct.owner || !acct.active) return true

      const pubsOf = (auth) =>
        (auth && Array.isArray(auth.key_auths)) ? auth.key_auths.map((k) => k[0]) : []
      if (pubsOf(acct.owner).indexOf(pub) !== -1 || pubsOf(acct.active).indexOf(pub) !== -1) {
        this.failLogin(this.$t('posting_key_only_login'))
        return false
      }
      return true
    },

    async requestLoginChallenge (username) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      let res
      try {
        res = await fetch('/api/proxy/loginChallenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeoutId)
      }
      // 503 is the server saying "busy, try again", not "your credentials are wrong".
      // Reporting it as a credential failure is the same mistake that, during the
      // incident, told Keychain users their key was incorrect and sent them off
      // rotating keys that were perfectly fine.
      if (res.status === 503) {
        this.failLogin(this.$t('login_service_unavailable'))
        return null
      }
      const json = await res.json().catch(() => null)
      if (!res.ok || !json || !json.success || !json.nonce || !json.message) {
        this.failLogin(this.$t('login_error'))
        return null
      }
      return json
    },

    /**
     * Exchange a signature over the server's challenge for a session.
     *
     * `signFn` receives the server's message and returns a hex signature. Injecting the
     * signing step is what lets Keychain, a typed key and HiveAuth share one path: the
     * server sees the same proof shape whichever wallet produced it.
     *
     * The message is signed EXACTLY as returned. Never rebuild it client-side -- any
     * difference in whitespace or line endings signs different bytes, and the server
     * reports that as a failed login rather than a mismatch, so the cause is invisible.
     */
    async signedChallengeLogin (username, method, signFn) {
      // requestLoginChallenge reports its own failure, and reports it more precisely
      // than we could here — a 503 is "busy, try again", not a credential problem.
      // Re-reporting would overwrite that with the generic message.
      const challenge = await this.requestLoginChallenge(username)
      if (!challenge) { return null }

      let signature = null
      try {
        signature = await signFn(challenge.message)
      } catch (e) {
        // An invalid typed key throws here (signBufferSha256 asserts on it), as does a
        // wallet that rejects. Neither is worth a stack trace in the user's console.
        console.error('Login signing failed:', e && e.message)
      }
      if (!signature) {
        // A refused Keychain/HiveAuth prompt also lands here. It is not a bad credential,
        // but we cannot tell the cases apart from the callback alone.
        this.failLogin(this.$t('login_error'))
        return null
      }

      return await this.submitLoginVerify(username, challenge.nonce, signature, method)
    },

    async submitLoginVerify (username, nonce, signature, method) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      let res
      try {
        res = await fetch('/api/proxy/loginVerify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            nonce,
            signature,
            method,
            keeploggedin: this.keep_loggedin_val
          }),
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeoutId)
      }

      // The nonce is single-use with a short TTL, so a slow wallet prompt can outlive it.
      // Say that plainly rather than claiming the credentials were wrong -- during the
      // incident, a misleading "your key is incorrect" drove needless key resets.
      if (res.status === 503) {
        this.failLogin(this.$t('login_service_unavailable'))
        return null
      }

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}))
        this.failLogin(body && body.error === 'Login request expired'
          ? this.$t('login_request_expired')
          : this.$t('login_error'))
        return null
      }

      return await res.json()
    },

    failLogin (msg) {
      this.error_proceeding = true
      this.login_in_progress = false
      this.error_msg = msg
    }
  }
}
