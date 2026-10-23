<template>
  <!-- Rendered from layouts/default.vue so it survives the post-login redirect.
       The login components cannot show this themselves: LoginModal closes on success
       and pages/login.vue redirects, so a banner there is destroyed before it is read. -->
  <div v-if="noticeText" class="security-notice-banner" role="alert" aria-live="polite">
    <div class="security-notice-inner">
      <i class="fas fa-exclamation-triangle security-notice-icon" aria-hidden="true"></i>
      <!-- Interpolated, never v-html: this text comes from the API. -->
      <span class="security-notice-text">{{ noticeText }}</span>
      <a href="/password" class="security-notice-action">{{ $t('forgot_my_posting_key') }}</a>
      <button type="button" class="security-notice-close" :aria-label="$t('Close')" @click="dismiss">&times;</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SecurityNoticeBanner',
  data () {
    return { localNotice: null }
  },
  computed: {
    noticeText () {
      return this.$store.getters.securityNotice || this.localNotice
    }
  },
  mounted () {
    // Rehydrate after a reload. The notice must outlive the page it was issued on —
    // the user has to go and rotate a key, which takes them away from the site.
    if (this.$store.getters.securityNotice) return
    try {
      const stored = localStorage.getItem('acti_security_notice')
      if (stored) this.localNotice = stored
    } catch (e) { /* private mode / blocked storage — banner just won't persist */ }
  },
  methods: {
    dismiss () {
      this.localNotice = null
      this.$store.commit('setSecurityNotice', null)
      try { localStorage.removeItem('acti_security_notice') } catch (e) { /* as above */ }
    }
  }
}
</script>

<style scoped>
.security-notice-banner {
  background: #fff3cd;
  color: #664d03;
  border-bottom: 1px solid #ffe69c;
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
