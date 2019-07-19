<template>
  <div>
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav">
        <li class="nav-item">
          <!-- home link -->
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu v-if="this.user"/>
    </nav>

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center">{{ $t('market_title') }}</h2>
	  <h5 class="text-center mb-5 market-sub">{{ $t('market_subtitle') }}</h5>
      <!-- show listing of products -->
      <div class="row" v-if="products.length">
        <Product v-for="(product, index) in products" :product="product" :key="index" :pros="professionals" />
      </div>

    </div>

    <Footer />
    <no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Product from '~/components/Product'
  import Professional from '~/components/Professional'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      UserMenu,
      NavbarBrand,
      Product,
	  Professional,
      Footer,
    },
    data () {
      return {
       
      }
    },
    computed: {
	  ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'products', 'professionals']),
    },
	watch: {
	  user: 'fetchUserData',
	},
    methods: {
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
    },
    async mounted () {
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  
      // fetch products
      this.$store.dispatch('fetchProducts')
	  
	  // fetch professionals
      this.$store.dispatch('fetchPros')
	  
    }
  }
</script>
<style>
  .market-sub{
	font-style: italic;
  }
</style>