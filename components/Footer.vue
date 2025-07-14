<template>
  <footer class="site-footer">
    <div class="footer-aurora-bg"></div>
    <div class="container">
      <div class="footer-main-grid">
        <!-- Column 1: Brand, Apps & Socials -->
        <div class="footer-brand-column">
          <a href="/" class="footer-logo-link">
            <img src="/img/actifit_logo_50.png" alt="Actifit Logo">
            <span>Actifit</span>
          </a>
          <p class="tagline">
            Your daily activity is valuable. Get rewarded for it.
          </p>
          <div class="app-buttons-footer">
            <a href="https://links.actifit.io/android" target="_blank" rel="noopener">
              <img src="/img/google-play.png" alt="Get it on Google Play">
            </a>
            <a href="https://links.actifit.io/ios" target="_blank" rel="noopener">
              <img src="/img/app-store.png" alt="Download on the App Store">
            </a>
          </div>
          <div class="social-icons">
             <a href="https://links.actifit.io/discord" target="_blank" :title="$t('Discord')" rel="noopener"><i class="fab fa-discord"></i></a>
            <a href="https://www.facebook.com/Actifit.fitness/" target="_blank" :title="$t('Facebook')" rel="noopener"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.x.com/Actifit_fitness" target="_blank" :title="$t('X_twitter')" rel="noopener"><i class="fa-brands fa-square-x-twitter"></i></a>
            <a href="https://www.instagram.com/actifit.fitness/" target="_blank" :title="$t('Instagram')" rel="noopener"><i class="fab fa-instagram"></i></a>
            <a href="https://t.me/actifit" target="_blank" :title="$t('Telegram')" rel="noopener"><i class="fab fa-telegram-plane"></i></a>
            <a href="https://medium.com/@actifit.fitness" target="_blank" :title="$t('Medium')" rel="noopener"><i class="fab fa-medium"></i></a>
            <a href="https://www.youtube.com/channel/UCNHxAGO79rXI7Hdiikwnqtw" target="_blank" :title="$t('Youtube')" rel="noopener"><i class="fab fa-youtube"></i></a>
            <a href="https://www.linkedin.com/company/actifit-io" target="_blank" :title="$t('LinkedIn')" rel="noopener"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>

        <!-- Column 2 & 3: Link Sections -->
        <div class="footer-links-columns">
          <div class="footer-column">
            <h5>Actifit</h5>
            <ul>
              <li><nuxt-link to="/activity">{{ $t('Activity') }}</nuxt-link></li>
              <li><nuxt-link to="/market">{{ $t('Market') }}</nuxt-link></li>
              <li><nuxt-link to="/yieldfarming">{{ $t('yield_farming') }}</nuxt-link></li>
              <li><nuxt-link to="/referrals">{{ $t('Refer_A_Friend') }}</nuxt-link></li>
              <li><a href="/whitepaper/Actifit_White_Paper.pdf" target="_blank">{{ $t('Whitepaper') }}</a></li>
              <li><nuxt-link to="/faq">{{ $t('FAQ') }}</nuxt-link></li>
            </ul>
          </div>
          <div class="footer-column">
            <!-- REVERTED: Hive logo is correctly placed in the attributions below, not here. -->
            <h5>{{ $t('Hive') }}</h5>
            <ul>
              <li><nuxt-link to="/communities">{{ $t('Communities') }}</nuxt-link></li>
              <li><nuxt-link to="/explore">{{ $t('Explore') }}</nuxt-link></li>
              <li><a href="https://hive.io" target="_blank">{{ $t('Hive_official') }}</a></li>
              <li><a href="https://hivescan.info" target="_blank">{{ $t('Hive_block_explorer') }}</a></li>
              <li><a href="https://hivescan.info/witnesses" target="_blank">{{ $t('Hive_witnesses') }}</a></li>
            </ul>
          </div>
        </div>
      </div>

      <hr class="footer-divider">

      <div class="footer-bottom">
        <div class="attributions">
          <span>{{ $t('powered_by') }}<img src="/img/HIVE.png" class="hive-power-logo"></span>
          <span>{{ $t('price_data_sentence') }}<a href="https://coingecko.com" target="_blank">{{ $t('CoinGecko') }}</a></span>
        </div>
        <div class="legal-links">
          <span>© {{ currentYear }} {{ $t('Copyright_Actifit') }} | {{ $config.version }}</span>
          <span class="separator">|</span>
          <span><nuxt-link to="/privacy-policy">{{ $t('Privacy_Policy') }}</nuxt-link></span>
          <span class="separator">|</span>
          <span><nuxt-link to="/terms-conditions">{{ $t('Terms_Conditions') }}</nuxt-link></span>
        </div>
      </div>
    </div>

    <VoteProposalModal />
    <vue-cookie-accept-decline
      :ref="'myPanel1'"
      :elementId="'myPanel1'"
      :debug="false"
      :position="'bottom'"
      :type="'bar'"
      :disableDecline="true"
      :transitionName="'slideFromBottom'"
      :showPostponeButton="false"
    >
      <div slot="message">
        {{ $t('cookies_notice') }}
        <router-link to="privacy-policy">{{ $t('More_Info') }}</router-link>
      </div>
      <div slot="acceptContent">
        {{ $t('Accept_Cookie') }}
      </div>
    </vue-cookie-accept-decline>
  </footer>
</template>

<script>
import VueCookieAcceptDecline from 'vue-cookie-accept-decline';
import "vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css";
import VoteProposalModal from "~/components/VoteProposalModal";

export default {
  props: ['isHomePage'],
  components: {
    VueCookieAcceptDecline,
    VoteProposalModal
  },
  computed: {
    currentYear() {
      return (new Date()).getFullYear();
    },
  },
  async mounted() {
    if (process.client) {
      $("#voteProposalModal").modal({ backdrop: false, focus: false, keyboard: true });
      $('#voteProposalModal').on('shown.bs.modal', function () {
        $("body").css("overflow", "auto");
        $("body").removeClass("modal-open");
      });
    }
  }
}
</script>

<style scoped>
/* --- STYLES FOR THIRD-PARTY/CHILD COMPONENTS (SAFE) --- */
::v-deep #voteProposalModal {
  top: unset !important;
  left: unset !important;
  transform: none !important;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

::v-deep .cookie__bar__content {
  overflow: visible !important;
}

::v-deep button.cookie__bar__buttons__button--accept {
  background: #ff112d !important;
}


/* --- FOOTER COMPONENT-SPECIFIC STYLES --- */
.site-footer {
  background-color: #f8f9fa;
  color: #495057;
  padding: 5rem 1rem 2rem 1rem;
  position: relative;
  overflow: hidden;
  font-size: 0.95rem;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-top: 1px solid #e9ecef;
}

.footer-aurora-bg {
  content: '';
  position: absolute; top: 50%; left: 50%;
  width: 150%; padding-top: 150%;
  transform: translate(-50%, -50%);
  z-index: 0;
  background: radial-gradient(circle, rgba(83, 69, 69, 0.15) 0%, rgba(225, 7, 7, 0.485) 50%);
  animation: aurora-animation 20s linear infinite;
  pointer-events: none;
  opacity: 0.4;
  transition: opacity 0.5s ease;
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-main-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-brand-column .footer-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  text-decoration: none;
  font-size: 1.6rem;
  font-weight: 700;
  color: #212529;
}

.footer-brand-column .footer-logo-link img {
  height: 40px;
}

.footer-brand-column .tagline {
  line-height: 1.6;
  max-width: 300px;
  margin-bottom: 1.5rem;
}

.app-buttons-footer {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.app-buttons-footer img {
  height: 45px;
  transition: transform 0.3s ease;
}

.app-buttons-footer img:hover {
  transform: scale(1.05);
}

.social-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  color: #495057;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.social-icons a:hover {
  background-color: #e10707;
  color: #ffffff;
  transform: translateY(-3px);
}

.footer-links-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.footer-column h5 {
  color: #212529;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-column ul { list-style: none; padding: 0; margin: 0; }
.footer-column ul li { margin-bottom: 0.8rem; }
.footer-column ul li a {
  color: #495057;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
}
.footer-column ul li a:hover {
  color: #e10707;
  transform: translateX(5px);
}

.footer-divider {
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 0 0 2rem 0;
}

.footer-bottom {
  text-align: center;
  font-size: 0.85rem;
  color: #6c757d;
}
.footer-bottom a {
  color: #495057;
  text-decoration: none;
}
.footer-bottom a:hover {
  color: #e10707;
  text-decoration: underline;
}

.attributions {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.attributions .hive-power-logo {
  max-height: 24px;
  margin-left: 8px;
  vertical-align: middle;
}

.legal-links {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.legal-links .separator { margin: 0 0.5rem; }

/* --- DARK MODE OVERRIDES --- */
.dark-mode .site-footer {
  background-color: #111217;
  color: #a9a9b3;
  border-top-color: rgba(255, 255, 255, 0.1);
}
.dark-mode .footer-aurora-bg {
  opacity: 1;
}
.dark-mode .footer-brand-column .footer-logo-link { color: #ffffff; }
.dark-mode .social-icons a {
  background-color: rgba(255, 255, 255, 0.05);
  color: #a9a9b3;
}
.dark-mode .footer-column h5 { color: #ffffff; }
.dark-mode .footer-column ul li a,
.dark-mode .footer-bottom a { color: #a9a9b3; }
.dark-mode .footer-divider {
  background-image: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
}
.dark-mode .footer-bottom { color: #7d7d89; }

/* --- Responsive & Animations --- */
@keyframes aurora-animation {
  0% { transform: translate(-50%,-50%) rotate(0deg); }
  100% { transform: translate(-50%,-50%) rotate(360deg); }
}

@media (min-width: 992px) {
  .footer-main-grid {
    grid-template-columns: 1.2fr 1.8fr;
    gap: 4rem;
    text-align: left;
  }
}

@media (max-width: 576px) {
  .footer-brand-column, .footer-column { text-align: center; }
  .footer-brand-column .footer-logo-link,
  .app-buttons-footer,
  .social-icons {
    justify-content: center;
  }
  .footer-column ul li a:hover { transform: translateX(0); }
  .attributions, .legal-links {
    flex-direction: column;
    gap: 0.75rem;
  }
  .legal-links .separator { display: none; }
}
</style>