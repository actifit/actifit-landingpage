<template>
  <!-- Rendered from layouts/default.vue so it survives the post-login redirect.
       The login components cannot show this themselves: LoginModal closes on success
       and pages/login.vue redirects, so a banner there is destroyed before it is read. -->
  <div v-if="noticeText" class="security-notice-banner" role="alert" aria-live="polite">
    <div class="security-notice-inner">
      <i class="fas fa-exclamation-triangle security-notice-icon" aria-hidden="true"></i>
      <!-- Interpolated, never v-html: this text comes from the API. -->
      <span class="security-notice-text">{{ noticeText }}</span>
      <!-- /password rotates keys entirely in the browser: it derives the new keys with
           hive-js and broadcasts account_update from the client, so the master password
           never reaches an Actifit server. That is the whole reason we can safely send a
           user there during a config-secret incident. Do not repoint this at an endpoint
           that would POST the password to us. -->
      <a href="/password" class="security-notice-action">{{ $t('change_my_keys_now') }}</a>
      <button type="button" class="security-notice-close" :aria-label="$t('Close')" @click="dismiss">&times;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SecurityNoticeBanner',
  data () {
    return { localNotice: null, onResize: null }
  },
  computed: {
    noticeText () {
      return this.$store.getters.securityNotice || this.localNotice
    }
  },
  watch: {
    noticeText () { this.syncBodyOffset() }
  },
  mounted () {
    // Rehydrate after a reload. The notice must outlive the page it was issued on —
    // the user has to go and rotate a key, which takes them away from the site.
    if (!this.$store.getters.securityNotice) {
      try {
        const stored = localStorage.getItem('acti_security_notice')
        if (stored) this.localNotice = stored
      } catch (e) { /* private mode / blocked storage — banner just won't persist */ }
    }
    this.syncBodyOffset()
    if (process.client && typeof window !== 'undefined') {
      this.onResize = () => this.syncBodyOffset()
      window.addEventListener('resize', this.onResize)
    }
  },
  beforeDestroy () {
    if (this.onResize && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize)
    }
    this.setBodyOffset(0)
  },
  methods: {
    // The banner is position:fixed, so without this it permanently covers the last
    // ~45px of every page — which is the footer's bottom bar, including the reCAPTCHA
    // attribution we are required to show while the badge is hidden. Reserve exactly
    // its own height instead of guessing a constant: the bar is taller once the text
    // wraps onto its own row on narrow viewports.
    setBodyOffset (px) {
      if (!process.client || typeof document === 'undefined' || !document.body) return
      document.body.style.paddingBottom = px ? px + 'px' : ''
    },
    syncBodyOffset () {
      if (!process.client) return
      this.$nextTick(() => {
        const el = this.$el
        if (!this.noticeText || !el || typeof el.getBoundingClientRect !== 'function') {
          this.setBodyOffset(0)
          return
        }
        this.setBodyOffset(Math.ceil(el.getBoundingClientRect().height || 0))
      })
    },
    dismiss () {
      this.localNotice = null
      this.$store.commit('setSecurityNotice', null)
      try { localStorage.removeItem('acti_security_notice') } catch (e) { /* as above */ }
      this.setBodyOffset(0)
    }
  }
}
</script>

<style scoped>
/* Pinned to the BOTTOM, not the top. NavbarBrand is Bootstrap `fixed-top`
   (position:fixed, z-index:1030), so a banner in normal flow at the top of the
   layout renders underneath it and its first line is unreadable. Raising the
   banner's z-index instead would make it cover the nav, and offsetting it by the
   navbar height is not reliable -- each page sets its own navbar spacing and the
   bar grows when its contents wrap.

   The bottom edge is NOT free, though: vue-cookie-accept-decline also sits at
   bottom:0, at z-index 9999, so it hid this banner completely. We stack above it
   using --cookie-banner-height, which Footer.vue already maintains on <body> with a
   ResizeObserver (see updateCookieBannerBodyState) and sets to 0px once the cookie
   bar is dismissed. Staying BELOW 9999 is deliberate -- the consent bar must remain
   clickable. */
.security-notice-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--cookie-banner-height, 0px);
  z-index: 9998;
  background: #fff3cd;
  color: #664d03;
  border-top: 1px solid #ffe69c;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.12);
  padding: 0.6rem 1rem;
  font-size: 0.95rem;
}
.security-notice-inner {
  max-width: 1140px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.security-notice-icon { flex: 0 0 auto; }
.security-notice-text { flex: 1 1 auto; }
.security-notice-action { color: #664d03; text-decoration: underline; white-space: nowrap; }
.security-notice-close {
  flex: 0 0 auto;
  background: none;
  border: 0;
  font-size: 1.4rem;
  line-height: 1;
  color: #664d03;
  cursor: pointer;
}
@media (max-width: 575px) {
  .security-notice-inner { flex-wrap: wrap; }
  .security-notice-text { flex: 1 0 100%; order: 2; }
}
</style>
