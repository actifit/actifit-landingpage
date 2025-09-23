<template>
  <!-- The `dark-mode` class on a parent will activate the dark theme styles -->
  <footer class="new-footer-container">
    <div class="container">
      <div class="footer-top-section">
        <!-- Column 1: Brand Info & App Stores -->
        <div class="footer-column brand-column">
          <div class="d-flex align-items-center mb-3">
            <img src="/img/actifit_logo.png" alt="Actifit Logo" class="footer-logo">
            <span class="footer-brand-name">Actifit</span>
          </div>
          <p class="footer-description">
           {{ $t('footer_slogan') }}
          </p>
          <div class="app-store-buttons">
            <a href="https://links.actifit.io/android" target="_blank">
              <img src="/img/google-play.png" alt="Get it on Google Play">
            </a>
            <a href="https://links.actifit.io/ios" target="_blank">
              <img src="/img/app-store.png" alt="Download on the App Store">
            </a>
          </div>
        </div>

        <!-- Column 2: Actifit Links -->
        <div class="footer-column links-column">
          <h4>ACTIFIT</h4>
          <a href="#" @click.prevent="$router.push('/activity')">{{ $t('activity_feed') }}</a>
          <a href="#" @click.prevent="$router.push('/market')">{{ $t('Market') }}</a>
          <a href="#" @click.prevent="$router.push('/yieldfarming')">{{ $t('yield_farming') }}</a>
          <a href="#" @click.prevent="$router.push('/referrals')">{{ $t('Refer_A_Friend') }}</a>
          <a href="/whitepaper/Actifit_White_Paper.pdf" target="_blank">{{ $t('Whitepaper') }}</a>
          <a href="/faq">{{ $t('FAQ') }}</a>
        </div>

        <!-- Column 3: Hive Links -->
        <div class="footer-column links-column">
          <h4>HIVE</h4>
          <a href="/communities">{{ $t('Communities') }}</a>
          <a href="/explore">{{ $t('Explore') }}</a>
          <a href="https://hive.io" target="_blank">{{ $t('Hive_official') }}</a>
          <a href="https://hivescan.info" target="_blank">{{ $t('Hive_block_explorer') }}</a>
          <a href="https://hivescan.info/witnesses" target="_blank">{{ $t('Hive_witnesses') }}</a>
          <a href="https://hivescan.info/proposals" target="_blank">{{ $t('DHF') }}</a>
        </div>
      </div>

      <!-- Social Media Icons -->
      <div class="social-icons-wrapper">
        <a href="https://links.actifit.io/discord" target="_blank" class="social-icon" :title="$t('Discord')"><i class="fab fa-discord"></i></a>
        <a href="https://www.facebook.com/Actifit.fitness/" target="_blank" class="social-icon" :title="$t('Facebook')"><i class="fab fa-facebook-f"></i></a>
        <a href="https://www.x.com/Actifit_fitness" target="_blank" class="social-icon" :title="$t('X_twitter')"><i class="fa-brands fa-square-x-twitter"></i></a>
        <a href="https://www.instagram.com/actifit.fitness/" target="_blank" class="social-icon" :title="$t('Instagram')"><i class="fab fa-instagram"></i></a>
        <a href="https://t.me/actifit" target="_blank" class="social-icon" :title="$t('Telegram')"><i class="fab fa-telegram-plane"></i></a>
        <a href="https://medium.com/@actifit.fitness" target="_blank" class="social-icon" :title="$t('Medium')"><i class="fab fa-medium-m"></i></a>
        <a href="https://www.youtube.com/channel/UCNHxAGO79rXI7Hdiikwnqtw" target="_blank" class="social-icon" :title="$t('Youtube')"><i class="fab fa-youtube"></i></a>
        <a href="https://www.linkedin.com/company/actifit-io" target="_blank" class="social-icon" :title="$t('LinkedIn')"><i class="fab fa-linkedin-in"></i></a>
      </div>

      <hr class="footer-divider">

      <!-- Bottom Bar with Two-Line Layout -->
      <div class="footer-bottom-bar">
        <div class="bottom-row top-row">
            <div class="bottom-bar-item">
                Powered By HIVE <img src="/img/HIVE.png" class="hive-logo-bottom">
            </div>
            <div class="bottom-bar-item">
                Price Data provided By <a href="https://coingecko.com" target="_blank">CoinGecko</a>
            </div>
        </div>
        <div class="bottom-row">
            <div class="bottom-bar-item copyright-section">
                © {{ currentYear }} Copyright Actifit | {{ $config.version }} | <nuxt-link to="/privacy-policy">Privacy Policy</nuxt-link> | <nuxt-link to="/terms-conditions">Terms & Conditions</nuxt-link>
            </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  computed: {
    currentYear() {
      return (new Date()).getFullYear();
    },
  },
}
</script>

<style scoped>
/* --- LIGHT MODE (DEFAULT) --- */
.new-footer-container {
  background-color: #FDF5F6;
  padding: 50px 0 20px 0;
  color: #333;
  font-family: sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Three-source light effect: Red from sides, Grey from middle */
.new-footer-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  background:
    /* Left Red Light */
    radial-gradient(ellipse at 20% 50%, rgba(225, 7, 7, 0.15) 0%, transparent 70%),
    /* Right Red Light */
    radial-gradient(ellipse at 80% 50%, rgba(225, 7, 7, 0.15) 0%, transparent 70%),
    /* Center Grey Light */
    radial-gradient(ellipse at 50% 60%, rgba(128, 128, 128, 0.1) 0%, transparent 70%);
  filter: blur(60px);
  z-index: 1;
  pointer-events: none;
  transition: all 0.4s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  position: relative;
  z-index: 2;
}

.footer-top-section { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 30px; }
.footer-column { padding: 0 15px; }
.brand-column { flex: 2; min-width: 300px; }
.links-column { flex: 1; min-width: 200px; }
.footer-logo { height: 50px; margin-right: 15px; }
.footer-brand-name { font-size: 28px; font-weight: bold; }
.footer-description { font-size: 16px; margin-top: 10px; color: #555; max-width: 300px; }

.app-store-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.app-store-buttons img { height: 50px; transition: transform 0.2s ease; }
.app-store-buttons a:hover img { transform: scale(1.05); }

.links-column h4 { font-weight: bold; margin-bottom: 20px; font-size: 18px; }
.links-column a { display: block; color: #333; text-decoration: none; margin-bottom: 12px; transition: color 0.2s ease, text-shadow 0.2s ease; }
.links-column a:hover { color: #ff112d; }

.social-icons-wrapper { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 30px; margin-left: 15px; }
.social-icon { width: 40px; height: 40px; border-radius: 50%; background-color: #E8E8E8; display: flex; align-items: center; justify-content: center; color: #333; font-size: 20px; text-decoration: none; transition: background-color 0.2s, color 0.2s; }
.social-icon:hover { background-color: #ff112d; color: white; }

.footer-divider { border: 0; border-top: 1px solid #ddd; margin: 40px 0 20px 0; transition: border-color 0.3s ease; }

.footer-bottom-bar { display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 14px; color: #666; text-align: center; }
.bottom-row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; }
.top-row { gap: 15px 40px; }
.bottom-bar-item { display: flex; align-items: center; }
.hive-logo-bottom { height: 20px; margin-left: 8px; }
.bottom-bar-item a { color: #333; font-weight: 500; text-decoration: none; transition: color 0.2s ease, text-shadow 0.2s ease; }
.copyright-section a { color: #666; text-decoration: underline; }
.bottom-bar-item a:hover { color: #ff112d; }

/* --- DARK MODE STYLES --- */
.dark-mode .new-footer-container { background-color: #1a1a1a; color: #e0e0e0; }
.dark-mode .new-footer-container::before {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(225, 7, 7, 0.4) 0%, transparent 65%),
    radial-gradient(ellipse at 80% 50%, rgba(225, 7, 7, 0.4) 0%, transparent 65%),
    radial-gradient(ellipse at 50% 60%, rgba(150, 150, 150, 0.2) 0%, transparent 70%);
  filter: blur(70px);
}
.dark-mode .footer-description { color: #a0a0a0; }
.dark-mode .links-column a { color: #e0e0e0; }
.dark-mode .social-icon { background-color: #2a2a2a; color: #e0e0e0; }
.dark-mode .footer-divider { border-top-color: #333; }
.dark-mode .footer-bottom-bar { color: #999; }
.dark-mode .bottom-bar-item a { color: #e0e0e0; }
.dark-mode .copyright-section a { color: #999; }
.dark-mode .links-column a:hover,
.dark-mode .bottom-bar-item a:hover {
  color: #ff112d;
  text-shadow: 0 0 8px rgba(255, 60, 60, 0.6);
}
</style>
