<template>
  <div>
    <!-- top anchor -->
    <a id="top"></a>

    <!-- navbar links with smooth scrolling to sections -->
    <nav class="navbar fixed-top navbar-expand-lg navbar-light">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#content')">What is Actifit?</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="$router.push('/activity')">Activity</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#delegators')">Delegators</a>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#leaderboard')">Leaderboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#team')">Team</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#athletes')">Sponsored Athletes</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#news')">News</a>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="$router.push('/referrals')">Refer A Friend</a>
          </li>
        </ul>
        <UserMenu />
      </div>
    </nav>
	
	<div class="position-fixed text-brand mx-auto w-100 acti-notify-comp">
		<div class="text-center w-50 mx-auto acti-notify-comp-inner border-2 rounded">
		  <div>Competition Alert: Refer New Actifitters!</div>
		  <div>Earn 5 STEEM + 13 AFIT Per Referral</div>
		  <div>Additional Top Referrer Reward Up To 200 STEEM!</div>
		  <span><a href="/referrals"><u>Refer a Friend</u></a></span> | 
		  <span><a href="/signup"><u>Signup a Friend</u></a></span> |
		  <span><a href=""><u>Read More</u></a></span>
		  <div><span class="end-string">Ends in </span><Countdown v-if="countDownReady" deadline="February 12, 2019"></Countdown></div>
		</div>
	</div>

    <!-- header with fullscreen background -->
	<div class="header pt-4 pt-md-5 position-relative">
	  <div class="container py-5">
        
        <!-- wallet/activities preview -->
		
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center border-0 home-card">
		  <div class="pb-md-4 text-center">
			  <img src="/img/actifit_logo.png" alt="Actifit" />
			  <h1 class="mt-3 text-brand title">Actifit</h1>
			  <h3 class="font-italic text-brand slogan">Rewarding Your Everyday Activity</h3>
			</div>
		
		
          <div v-if="user">
            <div class="row">
              <div class="col-sm-6">
                <p class="lead text-muted">Balance</p>
                <h3><b>{{ formattedUserTokens }}</b><br><small>AFIT</small></h3>
                <a href="#" @click.prevent="$router.push('/wallet')" class="btn btn-lg btn-brand w-100">My Wallet</a>
              </div>
              <div class="col-sm-6 mt-4 mt-sm-0">
                <p class="lead text-muted">Activity</p>
                <h3><b>{{ grabUserReportCount }}</b><br><small>Reports</small></h3>
                <a href="#" class="btn btn-lg btn-brand w-100" @click.prevent="$router.push('/activity/' + user.account.name)">My Activity</a>
              </div>
            </div>
          </div>

          <!-- login/register buttons -->
          <div v-else>
            <!--<p class="lead py-md-3 form-info">Log in to see your current token balance, or sign up for a Steem account to start getting rewarded for your activity.</p>-->
            <div class="row">
              <div class="col-6">
                <a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-100">Login</a>
              </div>
              <div class="col-6">
                <a href="/signup" class="btn btn-brand btn-lg w-100">Sign Up</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- scroll indicator -->
      <div class="text-center scroll-down position-absolute w-100">
        <a href="#" @click="scrollTo('#content')">
          <i class="fas fa-2x text-light fa-chevron-down"></i>
        </a>
      </div>
    </div>
	
    <!-- intro -->
    <section class="intro bg-light" id="content">
      <div class="container py-5">
        <h1 class="pt-5 mb-3 text-capitalize text-center headline"><span class="text-brand">Actifit:</span> An innovative dapp that rewards your everyday activity!</h1>
        <p class="lead mb-4 pb-5 text-center">
          Built as one of the first Smart Media Tokens on top of the Steem blockchain, with beta Android and iOS mobile apps already available on playstore and app store, Actifit tracks and rewards your activity with Actifit (AFIT) tokens, but also STEEM rewards via upvotes on your Steem posts.
        </p>

        <!-- stats -->
        <div class="row pb-5">
          <div class="col text-center">
            <h1><i class="fas fa-coins"></i></h1>
            <h4>Tokens Distributed</h4>
            <h2 class="text-brand">{{ numberFormat(animatedTokensDistributed, 0) }} AFIT</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-users"></i></h1>
            <h4>Token Holders</h4>
            <h2 class="text-brand">{{ numberFormat(animatedUserCount, 0) }}</h2>
          </div>
          <div class="col text-center">
            <h1><i class="fas fa-dumbbell"></i></h1>
            <h4>Rewarded Activities</h4>
            <h2 class="text-brand">{{ numberFormat(animatedRewardedActivityCount, 0) }}</h2>
          </div>
        </div>
      </div>
    </section>

    <!-- texts with images -->
    <section class="showcase">
      <div class="container-fluid p-0">

        <!-- app -->
        <div class="row no-gutters">
          <div class="col-lg-6 order-lg-2 text-white showcase-img" style="background-image: url('/img/showcase-1.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">Earn tokens as simple as one two three</h2>
            <p class="lead mb-0">1. Download the Actifit mobile app.<br/>2. Go for a jog, walk your dog, maw your lawn, go to the gym, move around your office,... with an aim to reach a minimum of 5,000 activity count.<br/>3. Post via app to the Steem blockchain, and get rewarded!</p>
            <div class="text-center mt-5">
              <a href="https://bit.ly/actifit-app" target="_blank">
                <img src="/img/google-play.png" />
              </a>
              <br>
              <br>
              <a href="https://bit.ly/actifit-ios" target="_blank">
              <img src="/img/app-store.png" />
              </a>
            </div>
          </div>
        </div>

        <!-- use case -->
        <div class="row no-gutters">
          <div class="col-lg-6 text-white showcase-img" style="background-image: url('/img/showcase-4.jpg');"></div>
          <div class="col-lg-6 my-auto showcase-text">
            <h2 class="text-capitalize">Actifit (AFIT) tokens use cases</h2>
            <p class="lead mb-0">
              AFIT tokens will be available for purchasing fitness related equipment, tools, gadgets, sports wear, gym memberships... and any transactions between providers and actifiters.<br>
              <br>
              As a Steem Smart Media Token, AFIT tokens are planned to have their own valuation per STEEM as well as FIAT currencies, and hence to be cashed out for actual FIAT currency.
            </p>
          </div>
        </div>

        <!-- delegation -->
        <div class="row no-gutters">
          <div class="col-lg-6 order-lg-2 text-white showcase-img" style="background-image: url('/img/showcase-3.jpg');"></div>
          <div class="col-lg-6 order-lg-1 my-auto showcase-text">
            <h2 class="text-capitalize">Delegate to earn more rewards</h2>
            <p class="lead mb-0">You can earn more AFIT tokens if you are a STEEM token holder. Delegate Steem Power to Actifit and earn your share of 100,000 AFIT tokens distributed per day to our delegators, as well as a weekly share of the 5% beneficiary reward of actifit posts.</p>
			<div style="text-align:center; padding-top: 10px">
				<br/>
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10%20SP">10 SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20%20SP">20 SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50%20SP">50 SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=100%20SP">100 SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=250%20SP">250 SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=500%20SP">500 SP</a><br/>
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=1000%20SP">1K SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=2000%20SP">2K SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=5000%20SP">5K SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10000%20SP">10K SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20000%20SP">20K SP</a>|
				<a href="https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50000%20SP">50K SP</a>
				<br/>
				<a href="https://steembottracker.com/delegation.html?delegatee=actifit">Custom Amount</a>
			</div>
          </div>
        </div>
      </div>
    </section>


	<!-- top Delegators -->
    <section id="delegators" class="py-5 bg-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-heart"></i><br>
          Top Delegators
        </h1>
        <div class="row">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(delegator, index) in topDelegators" :key="index" :delegator="delegator">
            <a :href="'https://busy.org/@' + delegator._id" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + delegator._id + '/avatar);'"></div>
            </a>
            <a :href="'https://busy.org/@' + delegator._id" target="_blank">@{{ delegator._id }}</a><br/>
			<a :href="'https://busy.org/@' + delegator._id" target="_blank">{{ numberFormat(delegator.steem_power, 0) }} Steem Power</a>
          </div>
		  <div class="full-div">
			<nuxt-link to="/delegators" class="text-center btn delegator-btn" data-target="#">View All Delegators</nuxt-link>
		  </div>
        </div>
      </div>
    </section>

    <!-- leaderboard -->
    <section id="leaderboard" class="py-5 bg-brand text-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-medal"></i><br>
          Daily Leaderboard
        </h1>
        <div class="row" v-if="leaderboard.length >= 3">
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>2.</h2>
              <a :href="'https://busy.org/' + leaderboard[1].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + leaderboard[1].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="'https://busy.org/' + leaderboard[1].username" target="_blank">{{ leaderboard[1].username }}</a><br/>
			  <a :href="'https://busy.org/' + leaderboard[1].username" target="_blank">{{ leaderboard[1].activity_count }} Recorded Activity</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>1.</h2>
              <a :href="'https://busy.org/' + leaderboard[0].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'width: 200px; height: 200px; background-image: url(https://steemitimages.com/u/' + leaderboard[0].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="'https://busy.org/' + leaderboard[0].username" target="_blank">{{ leaderboard[0].username }}</a><br/>
			  <a :href="'https://busy.org/' + leaderboard[0].username" target="_blank">{{ leaderboard[0].activity_count }} Recorded Activity</a>
            </div>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0 d-flex align-items-center justify-content-center">
            <div>
              <h2>3.</h2>
              <a :href="'https://busy.org/' + leaderboard[2].username" target="_blank">
                <div class="avatar mx-auto mb-3" :style="'width: 100px; height: 100px; background-image: url(https://steemitimages.com/u/' + leaderboard[2].username.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="'https://busy.org/' + leaderboard[2].username" target="_blank">{{ leaderboard[2].username }}</a><br/>
			  <a :href="'https://busy.org/' + leaderboard[2].username" target="_blank">{{ leaderboard[2].activity_count }} Recorded Activity</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- team -->
    <section id="team" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-users"></i><br>
          Team
        </h1>
        <div class="row">
          <div class="col-6 col-sm-4 col-md-3 text-center mb-4" v-for="(moderator, index) in moderators" :key="index" :moderator="moderator">
            <a :href="'https://busy.org/@' + moderator.name" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + moderator.name + '/avatar);'"></div>
            </a>
            <a :href="'https://busy.org/@' + moderator.name" target="_blank">@{{ moderator.name }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ambassadors -->
    <section id="ambassadors" class="py-5 bg-light">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-bullhorn tilt"></i><br>
          Ambassadors
        </h1>
        <div class="row">
          <div class="col-6 col-sm-4 text-center mb-4" v-for="(ambassador, index) in ambassadors" :key="index" :moderator="ambassador.name">
            <a :href="'https://busy.org/@' + ambassador.name" target="_blank">
              <div class="avatar small mx-auto mb-3" :style="'background-image: url(https://steemitimages.com/u/' + ambassador.name + '/avatar);'"></div>
            </a>
            <a :href="'https://busy.org/@' + ambassador.name" target="_blank">@{{ ambassador.name }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- sponsored athletes -->
    <section id="athletes" class="py-5">
      <div class="container">
        <h1 class="text-center pb-5">
          <i class="fas fa-dumbbell"></i><br>
          Sponsored Athletes
        </h1>
        <div class="row">
          <div class="col-sm-4 text-center mb-4">
            <a href="https://busy.org/@entrepreneur916" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmPyExYzRA6Zp14c2UL3dZSTwZtToABHwFAyFjR1pZMVk6');"></div>
            </a>
            <a href="https://busy.org/@entrepreneur916" target="_blank">@entrepreneur916</a>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://busy.org/@bunnymoney" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmQnNadhAJPJL5Sa8FYL5Pxhgw22zWjw4S8Kmji6k21p2w');"></div>
            </a>
            <a href="https://busy.org/@bunnymoney" target="_blank">@bunnymoney</a>
          </div>
          <div class="col-sm-4 text-center mb-4 mb-sm-0">
            <a href="https://busy.org/@fedesox" target="_blank">
              <div class="avatar mx-auto mb-3" style="background-image: url('https://ipfs.busy.org/ipfs/QmZrT7r9SjKUcx81L8p9G9z6uhndupDpfsrtYjwqgF3zC2');"></div>
            </a>
            <a href="https://busy.org/@fedesox" target="_blank">@fedesox</a>
          </div>
        </div>
      </div>
    </section>

    <!-- news -->
    <section id="news" class="py-5 bg-brand text-light">
      <h1 class="text-center pb-3">
        <i class="far fa-newspaper"></i><br>
        News
      </h1>
      <no-ssr>
        <carousel :perPageCustom="[[0, 1], [768, 2], [1024, 3], [1280, 4]]" :paginationColor="'rgba(255, 255, 255, 0.5)'" :paginationActiveColor="'#fff'">
          <slide v-for="(post, index) in news" :post="post" :key="index">
            <News :post="post" />
          </slide>
        </carousel>
      </no-ssr>
    </section>

    <Footer />
	
    <NewsModal :news="activeNews" />
  </div>
</template>

<script>
  import VueScrollTo from 'vue-scrollto' // for smooth scrolling
  import UserMenu from '~/components/UserMenu'
  import Footer from '~/components/Footer'
  import News from '~/components/News'
  import NewsModal from '~/components/NewsModal'
  import { mapGetters } from 'vuex'
  
  import Countdown from 'vuejs-countdown'

  export default {
    components: {
      UserMenu,
      Footer,
      News,
      NewsModal,
	  Countdown 
    },
    data () {
      return {
        username: '', // username whose funds to show

        // animated numbers
        tweenedUserCount: 0,
        tweenedTokensDistributed: 0,
        tweenedRewardedActivityCount: 0,
		countDownReady: false,

      }
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'userReportCount', 'transactions', 'userRank', 'userCount', 'topDelegators', 'moderators', 'ambassadors', 'tokensDistributed', 'rewardedActivityCount', 'leaderboard', 'news', 'activeNews']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2)
      },
	  
      grabUserReportCount () {
        return this.userReportCount
      },
	  
	  displayUserRank () {
		return this.userRank
	  },
	  
      // animated numbers
      animatedUserCount: function() {
        return this.tweenedUserCount.toFixed(0);
      },
      animatedTokensDistributed: function() {
        return this.tweenedTokensDistributed.toFixed(0);
      },
      animatedRewardedActivityCount: function() {
        return this.tweenedRewardedActivityCount.toFixed(0);
      }
    },
    // watchers to update animated numbers
    watch: {
      userCount: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedUserCount: newValue });
      },
      tokensDistributed: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedTokensDistributed: newValue });
      },
      rewardedActivityCount: function(newValue) {
        TweenLite.to(this.$data, 8, { tweenedRewardedActivityCount: newValue });
      },
	  user: 'fetchUserData',
    },
    methods: {
      /**
       * Scrolls down to content area.
       */
      scrollTo (target) {
        VueScrollTo.scrollTo(target, 1000, {easing: 'ease-in-out'})
      },

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
	    console.log('fetchUserData');
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
    },
    async mounted () {
      console.log('mounted');
      // fetch data
      this.$store.dispatch('fetchRewardedActivityCount')
      this.$store.dispatch('fetchLeaderboard')
	  
	  this.$store.dispatch('fetchTokenInfo')

	  //grab top 12 delegators
	  this.$store.dispatch('fetchTopDelegators', 12)

	  //grab team listing
	  this.$store.dispatch('fetchModerators')
	  this.$store.dispatch('fetchAmbassadors')

      this.$store.dispatch('fetchNews')
	  
	  // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  this.countDownReady = true;
    },
  }
</script>

<style lang="sass">	
  .header
    height: 100%
    background: url('/img/header-2.jpg') center
    background-size: cover
    .form
      max-width: 500px
      box-shadow: 0 0 50px rgba(0, 0, 0, 0.2)
  .scroll-down
    bottom: 10px
  .showcase .showcase-text
    padding: 3rem
  .showcase .showcase-img
    min-height: 30rem
    background-size: cover
    background-position: center
  .tilt
    transform: rotate(-15deg)

  .VueCarousel-dot-container
    padding: 15px !important
    .VueCarousel-dot
      padding: 1px 5px !important
      margin-top: 0 !important

  @media (min-width: 768px)
    .showcase .showcase-text
      padding: 7rem

  @media (max-width: 767px)
    .header
      .title
        font-size: 1.7rem
      .slogan
        font-size: 1.3rem
      .form-info
        font-size: 1rem
    .intro
      .headline
        font-size: 1.7rem
    .showcase
      .showcase-text
        padding: 2rem
        h2
          font-size: 1.5rem
        .lead
          font-size: 1.2rem
      .showcase-img
        min-height: 15rem
</style>
<style>
	.home-card{
	  opacity: 0.9;
	}
	.acti-notify-comp{
	  top:56px; 
	  z-index:100000; 
	  font-size: 20px;
	  vertical-align: top;
	}
	.acti-notify-comp-inner{
	  background: white; 
	}
	.vuejs-countdown .digit{
	  font-size: 20px !important;
	}
	.vuejs-countdown{
	  display: inline;
	}
	.end-string{
	  vertical-align: top;
	}
	.border-2{
	  border: 2px solid #ff112d;
	}
</style>