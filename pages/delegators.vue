<template>
  <!-- delegators listing -->
  <div>
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <!-- home link -->
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu />
    </nav>

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center mb-5">{{ $t('Actifit_Delegators') }}</h2>


      <!-- show listing when loaded -->
      <div class="row" v-if="topDelegators.length">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators" :key="index" :delegator="delegator">
            <a :href="'https://busy.org/@' + delegator._id" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="'https://busy.org/@' + delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<a :href="'https://busy.org/@' + delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} {{ $t('Steem_Power') }}</a>
          </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserMenu,
      NavbarBrand,
      Footer
    },
    data () {
      return {
        loading: true, // initial loading state
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

      // remove loading state
      this.loading = false
    }
  }
</script>
