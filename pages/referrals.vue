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

    <div class="container pt-5 mt-5 pb-5">

      <!-- account balance -->
      <div class="text-center">
        <h3 class="mb-4" v-if="user">Hey {{ user.account.name }}!</h3>
		<p class="lead">For every referral, earn an amount equal to 20% of the AFIT rewards your referred user is earning upon successful signup!</p>
        <h5>Your Referral Link:</h5>
		<input type="text" class="w-50 p-3" ref="refLink" id="referral-link" readonly/>
		<button v-on:click="copyContent" data-targetEl="refLink" class="btn btn-brand p-3">Copy Link</button>	
      </div>

      <!-- Referrals -->
      <div class="history mx-auto">
        <h3 class="text-center mt-5">My Referrals</h3>
        <Referral v-for="(referral, index) in referrals" :key="index" :referral="referral" />
        <div class="text-center"><small class="text-muted" v-if="referrals.length === 0">No referrals yet.</small></div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Referral from '~/components/Referral'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
    components: {
      NavbarBrand,
      UserMenu,
      Referral, // single referral block
      Footer
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'referrals', 'userRank']),
	  displayUserRank () {
		return this.userRank
	  },
    },
    async mounted () {
	  //this.$refs.refLink.value = window.location.origin + '/signup?referrer=' + this.displayUserRef() ;
      // login
	  /*console.log('mounted');
      await this.$store.dispatch('steemconnect/login')
	  if (typeof this.user != 'undefined' && this.user != null){
		  
		  this.$refs.refLink.value = window.location.origin + '/signup?referrer=' + this.user.account.name ;
	  }
	  console.log('mounted done');*/
	  this.fetchUserInfo();
    },
	created () {
	  this.$store.dispatch('steemconnect/login')
	  //this.$refs.refLink.value = window.location.origin + '/signup?referrer=' + this.user.account.name ;
	},
	watch: {
	  user : 'fetchUserInfo'
	},
	methods: {
	  copyContent (event) {
		  /* Get the text field */
		  var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
		  /* Select the text field */
		  copyText.select();
		  /* Copy the text inside the text field */
		  document.execCommand("copy");
		  return;
	  },
	  fetchUserInfo () {
		console.log('fetchUserInfo');
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchReferrals')
		  this.$store.dispatch('fetchUserRank')
		  this.$refs.refLink.value = window.location.origin + '/signup?referrer=' + this.user.account.name ;
		}
	  }
	},
  }
</script>
<style>
	#referral-link{
	  border-color: #ff112d;
	}
</style>