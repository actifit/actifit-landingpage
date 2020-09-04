<template>
  <!-- Footer used on all pages -->
  <div class="footer bg-light">
    <div class="container py-5">
      <div class="text-center social-links mb-4">
        <a href="https://discord.gg/aHtcA6r" target="_blank" class="d-inline-block mx-3" :title="$t('Discord')"><i class="fab fa-2x fa-discord"></i></a>
        <a href="https://www.facebook.com/Actifit.fitness/" target="_blank" class="d-inline-block mx-3" :title="$t('Facebook')"><i class="fab fa-2x fa-facebook"></i></a>
        <a href="https://www.twitter.com/Actifit_fitness" target="_blank" class="d-inline-block mx-3" :title="$t('Twitter')"><i class="fab fa-2x fa-twitter"></i></a>
        <a href="https://www.instagram.com/actifit.fitness/" target="_blank" class="d-inline-block mx-3" :title="$t('Instagram')"><i class="fab fa-2x fa-instagram"></i></a>
		<a href="https://t.me/actifit" target="_blank" class="d-inline-block mx-3" :title="$t('Telegram')"><i class="fab fa-2x fa-telegram"></i></a>
      </div>
	  <div class="row">
		<div class="col text-center"><small>{{ $t('price_data_sentence') }}<a href="https://coingecko.com">{{ $t('CoinGecko') }}</a></small></div>
	  </div>
      <div class="row">
        <div class="col text-center">
          <small class="text-muted">&copy; {{ $t('Copyright_Actifit') }} {{ currentYear }}</small> |
		  <small class="text-muted"><nuxt-link to="/privacy-policy">{{ $t('Privacy_Policy') }}</nuxt-link></small> |
		  <small class="text-muted"><nuxt-link to="/terms-conditions">{{ $t('Terms_Conditions') }}</nuxt-link></small>
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
        {{ $t('cookies_notice') }}
		<router-link to="privacy-policy">{{ $t('More_Info') }}</router-link>
    </div>

    <!-- Optional -->
    <div slot="acceptContent">
        {{ $t('Accept_Cookie') }}
    </div>
  </vue-cookie-accept-decline>
  </div>
</template>

<script>
  import VueCookieAcceptDecline from 'vue-cookie-accept-decline'
  import "vue-cookie-accept-decline/dist/vue-cookie-accept-decline.css";
  export default {
	props: ['isHomePage'],
    computed: {
      currentYear () {
        return (new Date()).getFullYear()
      },
    },
	components: {
		VueCookieAcceptDecline
	}
  }
</script>
<style>
	.numberCircle {
	  width: 10px;
	  line-height: 10px;
	  padding: 4px 2px 4px 2px;
	  margin-left: 4px;
	  background: #fff;
	  border: 1px solid;
	  text-align: center;
	  vertical-align:middle;
	  outline-style: inset;
	  border-radius: 0% !important;
	}
	.cookie__bar__content{
		overflow: visible!important;
	}
	button.cookie__bar__buttons__button--accept{
		background: #ff112d!important;
	}
	.goog-ad-disp{
		min-width: 120px;
		max-width: 900px;
		min-height: 120px;
		max-height: 500px;
	}
	.goog-ad-horiz-90{
		height: 90px!important;
		max-height: 90px!important;
	}
	.fa-reply:before {
		content: "\f3e5" !important;
	}
	.user-avatar-small{
		width: 30px;
		height: 30px;
		background-position: center center;
		background-size: cover;
		border-radius: 50%;
		border: solid 1px #ddd;
		display: inline-block;
		cursor: pointer;
	}
	.item-highlight{
		border: 3px red inset;
		margin: -3px;
	}
	.no-actifit{
		display: none !important;
	}
	.currency-logo-small{
		height: 15px;
	}
	.token-logo-sm{
		width: 20px;
		height: 20px;
	}
	.dropdown-menu > .dropdown-item{
		padding: .1rem 1.1rem !important;
	}
	.btn{
		border-radius: 3px;
	}
</style>
