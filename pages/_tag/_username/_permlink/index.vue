<template>
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
    <div v-if="errorDisplay==''" class="container pt-5 mt-5 pb-5 text-brand text-center">
      <p>{{ $t('Redirecting') }}</p>
    </div>
    <div v-else class="container pt-5 mt-5 pb-5" >
	  <div class="mb-3 text-center">
		{{ errorDisplay }}
	  </div>
    </div>
	<Footer />
  </div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import UserMenu from '~/components/UserMenu'
import Footer from '~/components/Footer'
  
export default {
  data () {
		return {
			errorDisplay: '',
		}
  },
  components: {
	  NavbarBrand,
	  UserMenu,
	  Footer
  },
  created () {
	if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.tag !== 'undefined') &&(typeof this.$route.params.username !== 'undefined') && (typeof this.$route.params.permlink !== 'undefined') ) {
	  this.$router.push({ path: "/"+this.$route.params.username+"/"+this.$route.params.permlink })
	}else{
		this.errorDisplay = this.$t('error_post_not_found');
	}
  }
}
</script>