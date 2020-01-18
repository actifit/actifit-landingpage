<template>
  <div>
	<!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav d-none d-sm-block">
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
		<h1 class="text-center pb-5">
          <i class="fas fa-medal"></i><br>
          {{ $t('Daily_Leaderboard') }}
        </h1>
        
		<div class="row" v-if="1==2">
			<div v-if="extLeaderboard.length == 0" class="col-md-12 text-center"><i class="fas fa-spin fa-spinner text-brand"></i></div>
			<div class="row col-md-12 m-3 mb-sm-0" v-else>
				<span class="">Rank</span>
				<span class="">User</span>
				<span class="col-md-3">Activity Count</span>
				<span class="col-md-3">Post Details</span>
			</div>
		</div>
		<div class="row border-actifit" v-if="extLeaderboard.length >= 3" v-for="(curEntry, index) in extLeaderboard" :key="index">
          <div class="row col-md-12 m-3 mb-sm-0">
              <span class="">{{index+1}}.</span>
              <a :href="curEntry.author" target="_blank">
                <div class="avatar mb-3 " :style="'background-image: url(https://steemitimages.com/u/' + curEntry.author.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="curEntry.author" target="_blank" class="col-md-3">@{{ curEntry.author }}</a><br/>
			  <a :href="curEntry.author" target="_blank" class="col-md-3">{{ numberFormat(curEntry.activityCount[0], 0) }}</a>
			  <a :href="curEntry.url" target="_blank" class="col-md-3">Post Details</a>
			  <span v-if="1==2">{{curEntry}}</span>
          </div>
        </div>
	
	</div>
	
	<Footer />
  </div>
</template>

<script>
 
  import { mapGetters } from 'vuex'
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Footer from '~/components/Footer'

  export default {
	components: {
	  NavbarBrand,
	  UserMenu,
	  Footer
	},
	computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'userReportCount', 'userRank', 'extLeaderboard']),
    },
	watch: {
		user: 'fetchUserData',
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
      },
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
	},
	async mounted () {
      // fetch data
      this.$store.dispatch('fetchExtendedLeaderboard')
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	}
  }
</script>
<style>
.text-green{
	color: #76BB0E
}
.avatar{
	width: 100px;
	height: 100px;
}
.border-actifit{
	border: 2px red solid;
}
</style>