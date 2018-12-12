<template>
  <!-- Footer used on all pages -->
  <div class="footer bg-light">
    <div class="container py-5">
      <div class="text-center social-links mb-4">
        <a href="https://discord.gg/aHtcA6r" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-discord"></i></a>
        <a href="https://www.facebook.com/Actifit.fitness/" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-facebook"></i></a>
        <a href="https://www.twitter.com/Actifit_fitness" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-twitter"></i></a>
        <a href="https://www.instagram.com/actifit.fitness/" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-instagram"></i></a>
      </div>
      <div class="row">
        <div class="col text-center">
          <small class="text-muted">&copy; Copyright Actifit {{ currentYear }}</small> |
		  <small class="text-muted"><nuxt-link to="/privacy-policy">Privacy Policy</nuxt-link></small> |
		  <small class="text-muted"><nuxt-link to="/terms-conditions">Terms & Conditions</nuxt-link></small>
        </div>
      </div>
    </div>
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

    
    <!-- Optional -->
    <div slot="message">
        We use cookies to ensure you get the best experience on our website. 
		Continuing to use the site represents your consent to this.
		<router-link to="privacy-policy">More Info</router-link>
    </div>

    <!-- Optional -->
    <div slot="acceptContent">
        GOT IT!
    </div>
  </vue-cookie-accept-decline>
  </div>
</template>

<script>
  import VueCookieAcceptDecline from 'vue-cookie-accept-decline'
  import "vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css";
  export default {
    computed: {
      currentYear () {
        return (new Date()).getFullYear()
      }
    },
	components: {
		VueCookieAcceptDecline
	}
  }
</script>
<style>
	.cookie__bar__content{
		overflow: visible!important;
	}
	button.cookie__bar__buttons__button--accept{
		background: #ff112d!important;
	}
</style>
