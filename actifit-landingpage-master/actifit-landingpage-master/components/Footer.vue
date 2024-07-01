<template>
  <!-- Footer used on all pages -->
  <div class="footer bg-light">
    <div class="container py-5">
	
	<div class="columns">
		<div class="column">
			<img src="/img/actifit_logo_50.png" class="ml-3" style="max-height: 30px">{{$t('Actifit')}}
			<a class="nav-link " href="#" @click.prevent="$router.push('/activity')">{{ $t('Activity') }}</a>
			<a class="nav-link " href="#" @click.prevent="$router.push('/market')">{{ $t('Market') }}</a>
			<a class="nav-link " href="#" @click.prevent="$router.push('/yieldfarming')">{{ $t('yield_farming') }}</a>
			<a class="nav-link " href="#" @click.prevent="$router.push('/referrals')">{{ $t('Refer_A_Friend') }}</a>
			<a class="nav-link " href="/whitepaper/Actifit_White_Paper.pdf">{{ $t('Whitepaper') }}</a>
			<a class="nav-link " href="/faq">{{ $t('FAQ') }}</a>
		</div>
		<div class="column">
			<img src="/img/HIVE.png" class="ml-3" style="max-height: 30px">{{$t('Hive')}}
			<a class="nav-link " href="/communities">{{ $t('Communities') }}</a>
			<a class="nav-link " href="/explore">{{ $t('Explore') }}</a>
			<a class="nav-link " target="_blank" href="https://hive.io">{{ $t('Hive_official') }}</a>
			<a class="nav-link " target="_blank" href="https://hivescan.info">{{ $t('Hive_block_explorer') }}</a>
			<a class="nav-link " target="_blank" href="https://hivescan.info/witnesses">{{ $t('Hive_witnesses') }}</a>
		</div>
	  </div>
	
	  <div class="text-center social-links mb-4">
        <a href="https://links.actifit.io/discord " target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Discord')"><i class="fab fa-2x fa-discord"></i></a>
        <a href="https://www.facebook.com/Actifit.fitness/" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Facebook')"><i class="fab fa-2x fa-facebook"></i></a>
        <a href="https://www.x.com/Actifit_fitness" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Twitter')"><i class="fa-brands fa-2x fa-square-x-twitter"></i></a>
        <a href="https://www.instagram.com/actifit.fitness/" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Instagram')"><i class="fab fa-2x fa-instagram"></i></a>
		<a href="https://t.me/actifit" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Telegram')"><i class="fab fa-2x fa-telegram"></i></a>
		<a href="https://medium.com/@actifit.fitness" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Medium')"><i class="fab fa-2x fa-medium"></i></a>
		<a href="https://www.youtube.com/channel/UCNHxAGO79rXI7Hdiikwnqtw" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('Youtube')"><i class="fab fa-2x fa-youtube"></i></a>
		<a href="https://www.linkedin.com/company/actifit-io" target="_blank" class="d-inline-block mx-3 mt-3" :title="$t('LinkedIn')"><i class="fab fa-2x fa-linkedin"></i></a>
      </div>
	  
	  <div class="row">
		  <div class="col text-center">
			<i>{{$t('powered_by')}}<img src="/img/HIVE.png" style="max-height: 30px;"></i>
		  </div>
	  </div>
	  <div class="row">
		<div class="col text-center"><small>{{ $t('price_data_sentence') }}<a href="https://coingecko.com">{{ $t('CoinGecko') }}</a></small></div>
	  </div>
      <div class="row">
        <div class="col text-center">
          <small class="text-muted">&copy; {{ $t('Copyright_Actifit') }} {{ currentYear }} | v1.4.8.5</small> |
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
	/*watch: {
		//darkMode(newDarkMode) {
		'$darkMode.getDarkModeClass'(newDarkMode) {
		  // Update CSS variables dynamically when dark mode state changes
		  const root = document.documentElement;
		  /*root.style.setProperty('--light-primary-color', newDarkMode ? '#ff112d' : '#333');
		  root.style.setProperty('--light-background-color', newDarkMode ? '#fff' : '#222');
		  root.style.setProperty('--dark-primary-color', newDarkMode ? '#ff112d' : '#fff');
		  root.style.setProperty('--dark-background-color', newDarkMode ? '#333' : '#0a0c16');*/
		  /*document.documentElement.classList.toggle('dark-mode', newDarkMode);

		}
	},*/
	components: {
		VueCookieAcceptDecline
	},
	async mounted(){
		console.log('mounted footer')
	}
  }
</script>
<style>
	blockquote{
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
		height: 20px;
	}
	.token-logo-sm{
		width: 20px;
		height: 20px;
	}
	.token-logo-md{
		width: 30px;
		height: 30px;
	}
	.dropdown-menu > .dropdown-item{
		padding: .1rem 1.1rem !important;
	}
	.btn{
		border-radius: 5px;
	}
	.btn-brand{
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	}
	.acti-shadow{
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	}
	.main-user-info{
		/* background-color: antiquewhite; */
		background: linear-gradient(20deg,orange,transparent);
	}
	.main-payment-info{
		/* background-color: lightcoral; */
		background: linear-gradient(180deg,lightcoral,coral);
		color: white !important;
	}
	.far, .fas, .fa-solid{
	  cursor: pointer;
	}
	.tooltip {
	  position: relative;
	  cursor: pointer;
	}
	div#voteModal{
		z-index: 99999; /* fix for proper voting popup placement */
	}

	/*.custom-tooltip {
	  position: absolute;
	  top: 100%;
	  left: 50%;
	  transform: translateX(-50%);
	  padding: 8px;
	  background-color: #000;
	  color: #fff;
	  border-radius: 4px;
	  font-size: 14px;
	  white-space: nowrap;
	  opacity: 0;
	  visibility: hidden;
	  transition: opacity 0.3s, visibility 0.3s;
	}

	.tooltip + .custom-tooltip,
	.custom-tooltip:hover {
	  opacity: 1;
	  visibility: visible;
	}*/
	
	.columns {
	  display: flex;
	}

	.column {
	  flex: 1;
	}

	.column a {
	  display: block;
	  margin-bottom: 10px;
	  text-decoration: none;
	  width: fit-content;
	}
</style>
