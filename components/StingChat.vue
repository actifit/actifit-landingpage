<template>
  <div>
    <div ref="widgetContainer" class="sting-widget-container"></div>
    <span class="user-avatar group-class">
      <i
        class="far fa-comments p-2 text-brand"
        :title="widgetError || $t('sting_chat')"
        @click="toggleWidget"
      ></i>
    </span>
    <div
      v-if="showPostingKeyPrompt"
      class="sting-posting-key-backdrop"
      role="presentation"
      @click.self="closePostingKeyPrompt"
    >
      <div
        class="sting-posting-key-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sting-posting-key-title"
      >
        <form @submit.prevent="submitPostingKey">
          <h5 id="sting-posting-key-title">
            {{ $t('sting_chat_posting_key_title') }}
          </h5>
          <p>{{ $t('sting_chat_posting_key_help') }}</p>
          <label for="sting-posting-key-input">{{ $t('Ppkey') }}</label>
          <input
            id="sting-posting-key-input"
            ref="postingKeyInput"
            v-model="postingKeyInput"
            type="password"
            class="form-control"
            autocomplete="off"
            autocapitalize="none"
            spellcheck="false"
          >
          <div v-if="postingKeyError" class="text-danger mt-2" role="alert">
            {{ postingKeyError }}
          </div>
          <div class="sting-posting-key-actions">
            <button type="button" class="btn btn-secondary" @click="closePostingKeyPrompt">
              {{ $t('Cancel') }}
            </button>
            <button type="submit" class="btn btn-brand">
              {{ $t('sting_chat_connect') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import hive from '@hiveio/hive-js'
import { PrivateKey, cryptoUtils } from '@hiveio/dhive'

const WIDGET_SCRIPT_URL = 'https://chat.peakd.com/stwidget.js'
let widgetScriptPromise = null

export default {
  props: ['user'],
  data () {
    return {
      widget: null,
      widgetError: '',
      showPostingKeyPrompt: false,
      postingKeyInput: '',
      postingKeyError: ''
    }
  },
  computed: {
    chatPostingKey () {
      return this.$store.state.chatPostingKey
    }
  },
  watch: {
    chatPostingKey (postingKey) {
      const username = this.user && this.user.account && this.user.account.name
      if (!postingKey || !username || !this.widget) return

      // Login and widget initialization can complete in either order. If the
      // validated key arrives after Sting mounts, attach it and reload the user.
      this.configurePostingKey(username, postingKey)
    }
  },
  mounted () {
    this.loadWidgetScript()
      .then(() => this.initWidget())
      .catch((error) => {
        console.error('Unable to load Sting chat:', error)
        this.widgetError = this.$t('sting_chat_unavailable')
      })
  },
  beforeDestroy () {
    if (this.widget) {
      this.widget.cleanup()
      this.widget = null
    }
  },
  methods: {
    loadWidgetScript () {
      if (typeof StWidget !== 'undefined') return Promise.resolve()
      if (widgetScriptPromise) return widgetScriptPromise

      widgetScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${WIDGET_SCRIPT_URL}"]`)

        if (existingScript) {
          existingScript.addEventListener('load', resolve, { once: true })
          existingScript.addEventListener('error', reject, { once: true })
          return
        }

        const script = document.createElement('script')
        script.src = WIDGET_SCRIPT_URL
        script.async = true
        script.addEventListener('load', resolve, { once: true })
        script.addEventListener('error', reject, { once: true })
        document.head.appendChild(script)
      }).catch((error) => {
        widgetScriptPromise = null
        throw error
      })

      return widgetScriptPromise
    },
    initWidget () {
      if (this.widget || !this.$refs.widgetContainer) return

      this.widget = new StWidget('https://chat.peakd.com/t/hive-193552/0')

      const username = this.user && this.user.account && this.user.account.name
      const loginMethod = localStorage.getItem('acti_login_method') || 'posting-key'
      const hasKeychain = window.hive_keychain != null
      const hasPeakVault = window.peakvault != null
      const localPostingKey = this.chatPostingKey

      this.widget.setProperties({
        // Keep Sting's own login UI available when Actifit cannot supply a
        // signer for the current browser-memory session.
        requireLogin: false,
        showSidebar: true,
        sidebar: 2,
        sidebar2enableSharedView: false,
        sidebarToggleByChannelNameOnDirectGroup: true,
        streambarExpand: true,
        streambarMode: 1,
        sidebarAddButton: 1,
        communityChannelNameFormat: '<title>/<name>',
        messageIconFlexClass: 'block text-justify lg:text-left sm:flex',
        messageIconClass: 'iconFloat',
        '--appCommunityIconFontSize': '18px',
        '--appCommunityIconSize': '42px',
        homeTabCommunities: true,
        homeTabPreferences: true,
        homeTabThemes: false,
        onlyPrependCommunities: false,
        prependCommunities: ['hive-193552'],
        defaultTheme: {
          bg0: '#ff112d',
          bg1: '#ff112d',
          bg2: '#ffffff',
          bg3: '#ffffff',
          bgbtn1: '#2e8336',
          bgbtn2: '#d9d9d7',
          bgowner: '#007b00',
          bgadmin: '#2368d5',
          bgmod: '#2e8336',
          bgconote: '#ff112d',
          bgunote: '#ff112d'
        },
        '--appFontFamily': "'Arial'",
        '--appFontSize': '16px',
        '--appMessageFontFamily': "'New Heterodox Mono', monospace",
        '--appMessageFontSize': '16px'
      })

      if (username && localPostingKey) {
        this.configurePostingKey(username, localPostingKey)
      } else if (username && loginMethod === 'keychain' && hasKeychain) {
        // Keep Sting on its Keychain login path. Direct-message requests contain
        // both the recipient username and preferred public posting key; treating
        // this as a generic wallet request loses the username and breaks encoding.
        this.configureKeychainPassthrough()
        this.widget.setUser(username, 'keychain')
      } else if (username && loginMethod !== 'hiveauth' && hasPeakVault) {
        this.widget.setUser(username, 'peakvault')
      } else if (username) {
        // Do not let an installed Keychain override a non-Keychain Actifit
        // session. Sting can present its own login UI if another session method
        // is needed after the in-memory posting key has expired.
        this.widget.enableKeychainPassthrough = false
        this.widget.enablePeakVaultPassthrough = false
        if (loginMethod === 'posting-key') {
          this.widgetError = this.$t('sting_chat_key_required')
        }
      }

      // Keep Sting below its 640px internal breakpoint and disable drag-resizing.
      // Crossing that breakpoint changes the red sidebar width, which makes it
      // appear to jump while the user is reading or editing a message.
      const defaultWidth = Math.min(450, Math.max(280, window.innerWidth - 40))
      const element = this.widget.createElement(`${defaultWidth}px`, '556px', true, false)
      this.widget.setStyle({
        position: 'fixed',
        top: '76px',
        right: '0px',
        maxWidth: 'calc(100vw - 20px)',
        touchAction: 'pan-y'
      })
      this.$refs.widgetContainer.appendChild(element)
      this.$refs.widgetContainer.hidden = true
    },
    configurePostingKey (username, postingKey) {
      // The validated key remains in Vuex/browser memory only. This path must
      // take precedence over wallet extensions installed in the same browser.
      this.widget.enableKeychainPassthrough = false
      this.widget.enablePeakVaultPassthrough = false
      this.widget.setPostingKey(postingKey, hive)
      this.configurePostingKeyPassthrough(postingKey)
      this.widget.setUser(username)
      this.widgetError = ''
    },
    configurePostingKeyPassthrough (postingKey) {
      const widget = this.widget

      // Sting's stock HiveJS path looks the recipient up through api.hive.blog
      // and returns raw error objects. The iframe already supplies the verified
      // public posting key in args[4], so signing can remain entirely local.
      widget.handleWithHivejs = (event, messageId, request, args) => {
        let operation

        try {
          if (request === 'requestBroadcast' && widget.isAllowedOperation(args[1]) && args[2] === 'Posting') {
            operation = new Promise((resolve) => {
              hive.broadcast.send({ extensions: [], operations: args[1] }, postingKey, (error, result) => {
                resolve(error ? { success: false, error } : { success: true, error: null, result })
              })
            })
          } else if (request === 'requestCustomJson' && widget.allowedCustomJson.indexOf(args[1]) !== -1 && args[2] === 'Posting') {
            operation = new Promise((resolve) => {
              hive.broadcast.customJson(postingKey, [], [args[0]], args[1], args[3], (error, result) => {
                resolve(error ? { success: false, error } : { success: true, error: null, result })
              })
            })
          } else if (request === 'requestVerifyKey' && args[2] === 'Posting') {
            let decoded = hive.memo.decode(postingKey, args[1])
            if (decoded.startsWith('#')) decoded = decoded.substring(1)
            operation = Promise.resolve({ success: true, error: null, result: decoded })
          } else if (request === 'requestSignBuffer' && args[2] === 'Posting') {
            operation = Promise.resolve({
              success: true,
              error: null,
              // Match Sting uploader's Upload.signWithKey implementation:
              // compact-sign the SHA-256 digest of the upload challenge.
              result: PrivateKey.fromString(postingKey)
                .sign(cryptoUtils.sha256(args[1]))
                .toString('hex')
            })
          } else if (request === 'requestEncodeMessage' && args[3] === 'Posting') {
            const recipientPublicKey = args[0] === args[1]
              ? hive.auth.wifToPublic(postingKey)
              : args[4]

            if (!recipientPublicKey) throw new Error('The recipient does not have a usable public posting key.')

            operation = Promise.resolve({
              success: true,
              error: null,
              result: hive.memo.encode(postingKey, recipientPublicKey, args[2])
            })
          }
        } catch (error) {
          operation = Promise.resolve({ success: false, error })
        }

        if (!operation) {
          operation = Promise.resolve({
            success: false,
            error: `Unsupported chat signing request: ${request}`
          })
        }

        operation
          .catch((error) => ({ success: false, error }))
          .then((response) => this.postWalletResponse(widget, event, messageId, response))
      }
    },
    configureKeychainPassthrough () {
      const widget = this.widget

      widget.handleWithKeychain = (event, messageId, request, args) => {
        let keychainCall = null

        if (request === 'requestBroadcast' && widget.isAllowedOperation(args[1]) && args[2] === 'Posting') {
          keychainCall = this.callKeychain(request, [args[0], args[1], 'Posting'])
        } else if (request === 'requestCustomJson' && widget.allowedCustomJson.indexOf(args[1]) !== -1 && args[2] === 'Posting') {
          keychainCall = this.callKeychain(request, [args[0], args[1], 'Posting', args[3], args[4]])
        } else if (request === 'requestVerifyKey' && args[2] === 'Posting') {
          keychainCall = this.callKeychain(request, [args[0], args[1], 'Posting'])
        } else if (request === 'requestSignBuffer' && args[2] === 'Posting') {
          keychainCall = this.callKeychain(request, [args[0], args[1], 'Posting'])
        } else if (request === 'requestEncodeMessage' && args[3] === 'Posting') {
          // args[1] is the recipient username. args[4] is its public key and is
          // intentionally left for Sting's validation rather than sent as a name.
          keychainCall = this.callKeychain(request, [args[0], args[1], args[2], 'Posting'])
        }

        if (!keychainCall) {
          keychainCall = Promise.resolve({
            success: false,
            error: `Unsupported chat wallet request: ${request}`,
            message: `Unsupported chat wallet request: ${request}`,
            result: null
          })
        }

        keychainCall.then((response) => this.postWalletResponse(widget, event, messageId, response))
      }
    },
    postWalletResponse (widget, event, messageId, response) {
      // Sting rejects the entire failed wallet response. Passing an object
      // makes its modal coerce the error to "[object Object]", so failures
      // must cross the iframe boundary as their readable string.
      const result = response && response.success
        ? response
        : this.readableError(response && (response.error || response.message || response))

      event.source.postMessage([
        widget.messageName,
        messageId,
        JSON.stringify(result)
      ], event.origin)
    },
    callKeychain (method, args) {
      return new Promise((resolve) => {
        const keychain = window.hive_keychain
        if (!keychain || typeof keychain[method] !== 'function') {
          resolve({
            success: false,
            error: 'Hive Keychain is unavailable or needs to be updated.',
            message: 'Hive Keychain is unavailable or needs to be updated.',
            result: null
          })
          return
        }

        try {
          keychain[method](...args, (response) => resolve(this.normalizeWalletResponse(response)))
        } catch (error) {
          resolve(this.normalizeWalletResponse({ success: false, error }))
        }
      })
    },
    normalizeWalletResponse (response) {
      if (response && response.success) return response

      const error = this.readableError(
        response && (response.error || response.message || response.result || response)
      )

      return Object.assign({}, response, {
        success: false,
        error,
        message: error,
        result: null
      })
    },
    readableError (error) {
      if (!error) return 'The wallet could not sign the message. Please try again.'
      if (typeof error === 'string') return error
      if (error.message) return this.readableError(error.message)
      if (error.error) return this.readableError(error.error)
      if (error.data) return this.readableError(error.data)

      try {
        return JSON.stringify(error)
      } catch (serializationError) {
        return 'The wallet could not sign the message. Please try again.'
      }
    },
    openPostingKeyPrompt () {
      this.postingKeyError = ''
      this.showPostingKeyPrompt = true
      this.$nextTick(() => {
        if (this.$refs.postingKeyInput) this.$refs.postingKeyInput.focus()
      })
    },
    closePostingKeyPrompt () {
      this.showPostingKeyPrompt = false
      this.postingKeyInput = ''
      this.postingKeyError = ''
    },
    isValidPostingKey (postingKey) {
      const account = this.user && this.user.account
      const keyAuths = account && account.posting && account.posting.key_auths
      if (!postingKey || !Array.isArray(keyAuths)) return false

      try {
        return keyAuths.some(([publicKey]) => hive.auth.wifIsValid(postingKey, publicKey))
      } catch (error) {
        return false
      }
    },
    submitPostingKey () {
      const postingKey = this.postingKeyInput.trim()
      if (!this.isValidPostingKey(postingKey)) {
        this.postingKeyError = this.$t('sting_chat_invalid_posting_key')
        return
      }

      this.$store.commit('setChatPostingKey', postingKey)
      this.closePostingKeyPrompt()
      this.$nextTick(() => {
        const container = this.$refs.widgetContainer
        if (container) container.hidden = false
      })
    },
    toggleWidget () {
      const username = this.user && this.user.account && this.user.account.name
      const loginMethod = localStorage.getItem('acti_login_method') || 'posting-key'
      if (username && loginMethod === 'posting-key' && !this.chatPostingKey) {
        this.openPostingKeyPrompt()
        return
      }

      const container = this.$refs.widgetContainer
      if (container) container.hidden = !container.hidden
    }
  }
}
</script>

<style>
  .sting-widget-container > div {
    max-height: calc(100vh - 92px) !important;
    overflow-x: hidden !important;
  }

  .sting-widget-container * {
    box-sizing: border-box;
    min-width: 0;
  }

  .sting-widget-container textarea,
  .sting-widget-container [contenteditable="true"] {
    max-width: 100%;
    margin-bottom: 12px;
    overflow-x: hidden;
    scroll-margin-bottom: 72px;
  }

  .h-screen.flex.flex-col.appbg0.appfg0.border-r-1.sidebar {
    background-color: #ff112d !important;
  }

  .sting-posting-key-backdrop {
    position: fixed;
    z-index: 2000;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.55);
  }

  .sting-posting-key-dialog {
    width: 100%;
    max-width: 440px;
    padding: 24px;
    color: #212529;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
  }

  .sting-posting-key-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
  }
</style>
