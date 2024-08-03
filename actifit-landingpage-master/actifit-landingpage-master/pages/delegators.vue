<template>
  <!-- delegators listing -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ $t('Actifit_Delegators') }}</h2>


      <!-- show listing when loaded -->
	  <h3 class="text-center text-brand mb-5"><img src="/img/HIVE.png" style="max-height: 50px;">{{ $t('Hive_Power_Delegators') }}</h3>
      <div class="row" v-if="topDelegators.hive && topDelegators.hive.length">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators.hive" :key="index" :delegator="delegator">
            <a :href="delegator._id" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url('+profImgUrl+'/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<img src="/img/HIVE.png" style="max-height: 20px;"><a :href="delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} {{ $t('Hive_Power') }}</a>
          </div>
      </div>
	  <h3 class="text-center text-primary mb-5"><img src="/img/STEEM.png" style="max-height: 50px;">{{ $t('Steem_Power_Delegators') }}</h3>
	  <div class="row" v-if="topDelegators.steem && topDelegators.steem.length">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators.steem" :key="index" :delegator="delegator">
            <a :href="delegator._id" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url('+profImgUrl+'/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<img src="/img/STEEM.png" style="max-height: 20px;"><a :href="delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} {{ $t('Steem_Power') }}</a>
          </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    head () {
		return {
		  title: `Actifit Delegators - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Listing of Actifit delegators / supporters` },
			{ hid: 'ogdescription', name: 'og:description', content: `Listing of Actifit delegators / supporters` }
		  ]
		}
	},
	components: {
      NavbarBrand,
      Footer
    },
    data () {
      return {
        loading: true, // initial loading state
		profImgUrl: process.env.hiveImgUrl,
      }
    },
    computed: {
      ...mapGetters(['topDelegators'])
    },
    methods: {
	  /**
       * Formats numbers with commas and dots.
       *
       * @param number
	   * @param precision
       * @returns {string}
       */
      numberFormat (number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
      }
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')

      // fetch full delegators list
      this.$store.dispatch('fetchTopDelegators')
	  
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.profImgUrl = process.env.hiveImgUrl;
		if (cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}

      // remove loading state
      this.loading = false
    }
  }
</script>
