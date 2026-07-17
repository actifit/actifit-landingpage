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
  </div>
</template>

<script>
import hive from '@hiveio/hive-js'

const WIDGET_SCRIPT_URL = 'https://chat.peakd.com/stwidget.js'
let widgetScriptPromise = null

export default {
  props: ['user'],
  data () {
    return {
      widget: null,
      widgetError: ''
    }
  },
  mounted () {
    this.loadWidgetScript()
      .then(() => this.initWidget())
      .catch((error) => {
        console.error('Unable to load Sting chat:', error)
        this.widgetError = 'Chat is temporarily unavailable. Please try again.'
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
      // Keychain can safely serve chat even when Actifit's session was created
      // with another login method: every encryption/sign request still names the
      // logged-in Hive account and must be approved by that account's wallet.
      const hasKeychain = window.hive_keychain != null
      const hasPeakVault = window.peakvault != null
      const localPostingKey = this.$store.state.chatPostingKey

      console.info('[StingChat] wallet availability', {
        loginMethod: localStorage.getItem('acti_login_method') || 'posting-key',
        keychain: hasKeychain,
        peakVault: hasPeakVault,
        sessionPostingKey: Boolean(localPostingKey)
      })

      this.widget.setProperties({
        requireLogin: !username || (!hasKeychain && !hasPeakVault && !localPostingKey),
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

      if (username && hasKeychain) {
        // Keep Sting on its Keychain login path. Direct-message requests contain
        // both the recipient username and preferred public posting key; treating
        // this as a generic wallet request loses the username and breaks encoding.
        this.configureKeychainPassthrough()
        this.widget.setUser(username, 'keychain')
      } else if (username && hasPeakVault) {
        this.widget.setUser(username, 'peakvault')
      } else if (username && localPostingKey) {
        // The key stays in this Vuex/browser-memory session. StWidget performs
        // encryption and signing locally and never receives it in iframe data.
        this.widget.setPostingKey(localPostingKey, hive)
        this.widget.setUser(username, 'keychain')
      } else if (username) {
        this.configureUnavailableWalletMessage()
        this.widgetError = 'Private messages require Hive Keychain or PeakVault.'
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
    configureKeychainPassthrough () {
      const widget = this.widget

      widget.handleWithKeychain = (event, messageId, request, args) => {
        let keychainCall = null

        console.info('[StingChat] wallet request', {
          request,
          account: args[0],
          recipient: request === 'requestEncodeMessage' ? args[1] : undefined
        })

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

        keychainCall.then((response) => {
          // Sting rejects the entire failed wallet response. Passing an object
          // makes its modal coerce the error to "[object Object]", so failures
          // must cross the iframe boundary as their readable string.
          const result = response && response.success
            ? response
            : this.readableError(response && (response.error || response.message || response))

          console.info('[StingChat] wallet response', {
            request,
            success: Boolean(response && response.success),
            error: response && response.success ? null : result
          })

          event.source.postMessage([
            widget.messageName,
            messageId,
            JSON.stringify(result)
          ], event.origin)
        })
      }
    },
    configureUnavailableWalletMessage () {
      const widget = this.widget
      const originalOnMessage = widget.onMessage.bind(widget)
      const walletRequests = [
        'requestBroadcast',
        'requestCustomJson',
        'requestVerifyKey',
        'requestSignBuffer',
        'requestEncodeMessage'
      ]

      widget.onMessage = (event, messageId, request, args) => {
        if (walletRequests.indexOf(request) === -1) {
          originalOnMessage(event, messageId, request, args)
          return
        }

        const error = 'Private messages require Hive Keychain or PeakVault. Install and unlock a wallet containing this account\'s posting key, then reload Actifit.'
        console.warn('[StingChat] wallet request blocked:', error)
        event.source.postMessage([
          widget.messageName,
          messageId,
          JSON.stringify(error)
        ], event.origin)
      }
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
    toggleWidget () {
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
</style>
