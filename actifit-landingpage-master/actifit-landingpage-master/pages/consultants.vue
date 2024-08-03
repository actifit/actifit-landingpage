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
      <h2 class="text-center mb-5">{{ $t('professionals_title') }}</h2>

      <!-- show listing of professionals -->
      <div class="row" v-if="professionals.length">
        <Professional v-for="(professional, index) in professionals" :professional="professional" :key="index" />
      </div>

    </div>

    <Footer />
    <client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Professional from '~/components/Professional'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    head () {
		return {
		  title: `Actifit Consultants - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Actifit verified consultants are fitness and nutrition professionals who provide services via Actifit market` },
			{ hid: 'ogdescription', name: 'og:description', content: `Actifit verified consultants are fitness and nutrition professionals who provide services via Actifit market` }
		  ]
		}
	},
	components: {
      UserMenu,
      NavbarBrand,
      Professional,
      Footer,
    },
    data () {
      return {
       
      }
    },
    computed: {
	  ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['professionals'])
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
	  
      // fetch professionals
      await this.$store.dispatch('fetchPros')

    }
  }
</script>
