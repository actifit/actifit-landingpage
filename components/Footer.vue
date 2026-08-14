<template>
  <div class="site-footer-shell">
    <NewFooterDesign />

    <VoteProposalModal :bottomOffset="proposalBottomOffset" />

    <vue-cookie-accept-decline
      ref="cookieBanner"
      :elementId="'myPanel1'"
      :debug="false"
      :position="'bottom'"
      :type="'bar'"
      :disableDecline="true"
      :transitionName="'slideFromBottom'"
      :showPostponeButton="false"
      @status="handleCookieStatus"
      @clicked-accept="handleCookieAccepted">

      <div slot="message">
        {{ $t('cookies_notice') }}
        <router-link to="privacy-policy">{{ $t('More_Info') }}</router-link>
      </div>

      <div slot="acceptContent">
        {{ $t('Accept_Cookie') }}
      </div>
    </vue-cookie-accept-decline>
  </div>
</template>

<script>
import NewFooterDesign from './NewFooterDesign.vue';

import VueCookieAcceptDecline from 'vue-cookie-accept-decline';
import "vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css";
import VoteProposalModal from "~/components/VoteProposalModal";

export default {
  props: ['isHomePage'],

  components: {
    NewFooterDesign,
    VueCookieAcceptDecline,
    VoteProposalModal
  },

  computed: {
    currentYear() {
      return (new Date()).getFullYear();
    },

    proposalBottomOffset() {
      return this.cookieBannerHeight + (this.isCompactViewport ? 32 : 20);
    },
  },

  data() {
    return {
      cookieBannerVisible: false,
      cookieBannerHeight: 0,
      cookieBannerStatus: null,
      cookieBannerObserver: null,
      isCompactViewport: false,
      viewportResizeHandler: null,
    };
  },

  async mounted() {
    if (process.client) {
      $("#voteProposalModal").modal({ backdrop: false, focus: false, keyboard: true });
      $('#voteProposalModal').on('shown.bs.modal', function () {
        $("body").css("overflow", "auto"); // Allow scrolling on the page
        $("body").removeClass("modal-open");
      });

      this.updateViewportState();
      this.viewportResizeHandler = () => this.updateViewportState();
      window.addEventListener('resize', this.viewportResizeHandler, { passive: true });

      this.syncCookieBannerState();
    }
  },

  beforeDestroy() {
    this.teardownCookieBannerObserver();
    this.teardownViewportObserver();
    this.updateCookieBannerBodyState(false, 0);
  },

  methods: {
    handleCookieStatus(status) {
      this.cookieBannerStatus = status;
      this.cookieBannerVisible = !status || status === 'null';
      this.syncCookieBannerState();
    },

    handleCookieAccepted() {
      this.cookieBannerStatus = 'accept';
      this.cookieBannerVisible = false;
      this.teardownCookieBannerObserver();
      this.updateCookieBannerBodyState(false, 0);
    },

    syncCookieBannerState() {
      if (!process.client) return;

      this.$nextTick(() => {
        const bannerEl = document.getElementById('myPanel1');

        if (!bannerEl || typeof bannerEl.getBoundingClientRect !== 'function') {
          this.updateCookieBannerBodyState(this.cookieBannerVisible, 0);
          return;
        }

        const measuredHeight = Math.ceil(
          bannerEl.getBoundingClientRect().height || bannerEl.offsetHeight || 0
        );

        this.cookieBannerHeight = this.cookieBannerVisible ? measuredHeight : 0;
        this.updateCookieBannerBodyState(this.cookieBannerVisible, this.cookieBannerHeight);
        this.teardownCookieBannerObserver();

        if (this.cookieBannerVisible && typeof ResizeObserver !== 'undefined') {
          this.cookieBannerObserver = new ResizeObserver(() => {
            const observedBannerEl = document.getElementById('myPanel1');
            if (!observedBannerEl || typeof observedBannerEl.getBoundingClientRect !== 'function') {
              return;
            }

            const nextHeight = Math.ceil(
              observedBannerEl.getBoundingClientRect().height || observedBannerEl.offsetHeight || 0
            );

            if (nextHeight !== this.cookieBannerHeight) {
              this.cookieBannerHeight = nextHeight;
              this.updateCookieBannerBodyState(true, nextHeight);
            }
          });

          this.cookieBannerObserver.observe(bannerEl);
        }
      });
    },

    teardownCookieBannerObserver() {
      if (this.cookieBannerObserver) {
        this.cookieBannerObserver.disconnect();
        this.cookieBannerObserver = null;
      }
    },

    teardownViewportObserver() {
      if (this.viewportResizeHandler) {
        window.removeEventListener('resize', this.viewportResizeHandler);
        this.viewportResizeHandler = null;
      }
    },

    updateViewportState() {
      if (!process.client) return;

      this.isCompactViewport = window.matchMedia('(max-width: 576px)').matches;
    },

    updateCookieBannerBodyState(visible, height) {
      if (!process.client || !document || !document.body) return;

      document.body.classList.toggle('cookie-consent-visible', !!visible);
      document.body.style.setProperty('--cookie-banner-height', `${height}px`);
    },
  }
}
</script>

<style>

.site-footer-shell {
  position: relative;
  width: 100%;
}

body.modal-open {
  overflow: auto !important;
}

body.cookie-consent-visible {
  padding-bottom: var(--cookie-banner-height, 0px);
}

#voteProposalModal {
  top: unset !important; /* Remove any `top` style */
  left: unset !important; /* Remove any `left` style */
  transform: none !important; /* Remove Bootstrap's centering transform */
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.footer{
  position: relative;
  width: 100%;
}
blockquote {
  font-size: 15px;
  padding: 10px;
  margin: 0 0 20px;
  border-left: 5px solid #eee;
  margin-bottom: 1rem;
}

.numberCircle {
  width: 10px;
  line-height: 10px;
  padding: 4px 2px 4px 2px;
  margin-left: 4px;
  background: #fff;
  border: 1px solid;
  text-align: center;
  vertical-align: middle;
  outline-style: inset;
  border-radius: 0% !important;
}

.cookie__bar__content {
  overflow: visible !important;
}

button.cookie__bar__buttons__button--accept {
  background: #ff112d !important;
}

.dark-mode #myPanel1.cookie__bar {
  background: #1f1f1f !important;
  color: #f2f2f2 !important;
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
}

.dark-mode #myPanel1.cookie__bar .cookie__bar__content {
  color: #f2f2f2 !important;
}

.dark-mode #myPanel1.cookie__bar .cookie__bar__content a {
  color: #ffffff !important;
  text-decoration: underline;
}

.dark-mode #myPanel1.cookie__bar .cookie__bar__buttons__button {
  background: #2b2b2b !important;
  color: #f2f2f2 !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
}

.dark-mode #myPanel1.cookie__bar .cookie__bar__buttons__button--accept {
  background: #ff112d !important;
  color: #fff !important;
  border-color: #ff112d !important;
}

.goog-ad-disp {
  min-width: 120px;
  max-width: 900px;
  min-height: 120px;
  max-height: 500px;
}

.goog-ad-horiz-90 {
  height: 90px !important;
  max-height: 90px !important;
}

.fa-reply:before {
  content: "\f3e5" !important;
}

.user-avatar-small {
  width: 30px;
  height: 30px;
  background-position: center center;
  background-size: cover;
  border-radius: 50%;
  border: solid 1px #ddd;
  display: inline-block;
  cursor: pointer;
}

.item-highlight {
  border: 3px red inset;
  margin: -3px;
}

.no-actifit {
  display: none !important;
}

.currency-logo-small {
  height: 20px;
}

.token-logo-sm {
  width: 20px;
  height: 20px;
}

.token-logo-md {
  width: 30px;
  height: 30px;
}

.dropdown-menu>.dropdown-item {
  padding: .1rem 1.1rem !important;
}

.btn {
  border-radius: 5px;
}

.btn-brand {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.acti-shadow {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

.main-user-info {
  /* background-color: antiquewhite; */
  background: linear-gradient(20deg, orange, transparent);
}

.main-payment-info {
  /* background-color: lightcoral; */
  background: linear-gradient(180deg, lightcoral, coral);
  color: white !important;
}

.far,
.fas,
.fa-solid {
  cursor: pointer;
}

.tooltip {
  position: relative;
  cursor: pointer;
}

div#voteModal {
  z-index: 99999;
  /* fix for proper voting popup placement */
}

.columns {
  display: flex;
}

.column {
  flex: 1;
}

.column a {
  display: block;
  margin-bottom: 0px;
  text-decoration: none;
  width: fit-content;
}

.social-links img {
  width: 40px;
  height: 40px;
  margin-top: -15px;
}
</style>
