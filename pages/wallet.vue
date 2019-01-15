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
        <h4>Your AFIT Balance</h4>
        <h4 class="mb-4 font-weight-bold">{{ formattedUserTokens }}</h4>
		<h4>Your STEEM Balance</h4>
		<h5 class="mb-4 font-weight-bold">
			<span class="p-2">{{ this.steemPower }}</span>
			<span class="p-2">{{ formattedSTEEMBalance() }}</span>
			<span class="p-2">{{ formattedSTEEMBalance('1') }}</span>
		</h5>
		<div v-if="isClaimableDataAvailable">
			<h5>Claimable STEEM Rewards</h5>
			<h6 class="mb-4 font-weight-bold">
				<span class="p-2">{{ this.claimSP }}</span>
				<span class="p-2">{{ this.claimSTEEM }}</span>
				<span class="p-2">{{ this.claimSBD }}</span>
				<div class="p-2"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">Claim Rewards</button></div>
			</h6>
		</div>
      </div>
	  
      <!-- transaction history -->
      <div class="history mx-auto">
        <h3 class="text-center mt-5">AFIT Transaction History</h3>
        <Transaction v-for="(transaction, index) in transactions" :key="index" :transaction="transaction" />
        <div class="text-center"><small class="text-muted" v-if="transactions.length === 0">No transactions yet.</small></div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'
  import steem from 'steem'

  import { mapGetters } from 'vuex'

  export default {
	data () {
	  return {
		steemPower: '',
		claimSP: '',
		claimSTEEM: '',
		claimVests: '',
		claimSBD: '',
		claimWindow: '',
	  }
	},
    components: {
      NavbarBrand,
      UserMenu,
      Transaction, // single transaction block
      Footer
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'transactions', 'userRank']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2) + " AFIT";
      },
	  displayUserRank () {
		return this.userRank
	  },
	  isClaimableDataAvailable () {
	  //confirms whether we have useful claimable data to control display of the relevant section
		console.log('isClaimableDataAvailable');
		return (parseFloat(this.claimSTEEM)>0 ||
			parseFloat(this.claimSP) ||
			parseFloat(this.claimVests) ||
			parseFloat(this.claimSBD) );
	  }
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
	    //console.log('fetchUserData');
		if (typeof this.user != 'undefined' && this.user != null){	  
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchTransactions')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
	  formattedSTEEMBalance (dataType) {
	    //handle display of STEEM/SBD balance
	    //console.log(this.user)
		let displaySteemBalance = '';
	    if (typeof this.user != 'undefined' && this.user != null){
		  if (dataType == '1'){
		    //SBD balance
			displaySteemBalance = this.user.account.sbd_balance;
		  }else{
		    //STEEM balance
		    displaySteemBalance = this.user.account.balance;
			//also prompt SP display
			this.vestsToSteemPower(this.user.account.vesting_shares);
			//also update claimable amounts
			this.claimableSTEEMRewards();
		  }
		}
		return displaySteemBalance;
	  },
	  async vestsToSteemPower (vests) {
	    //handle fetching user's SP
	    let properties = await steem.api.getDynamicGlobalPropertiesAsync();
		let totalSteem = Number(properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(properties.total_vesting_shares.split(' ')[0]);
	    vests = Number(vests.split(' ')[0]);
	    this.steemPower = this.numberFormat(totalSteem * (vests / totalVests), 3)+" STEEM POWER";
	  },
	  claimableSTEEMRewards () {
		//function handles preparing claimable STEEM rewards
		if (typeof this.user != 'undefined' && this.user != null){
		  this.claimSTEEM = this.user.account.reward_steem_balance;
		  this.claimSP = this.user.account.reward_vesting_steem + " POWER";
		  this.claimVests = this.user.account.reward_vesting_balance;
		  this.claimSBD = this.user.account.reward_sbd_balance;
		  return this.claimSP + this.claimSTEEM + this.claimSBD;
		}
		return '';
	  },
	  async claimRewards () {
		//function handles claiming STEEM rewards
		
		//sample link: https://steemconnect.com/sign/claim-reward-balance?account=sdsf&reward_steem=33&reward_sbd=2342&reward_vests=23432
		var link = this.$steemconnect.sign('claim-reward-balance', {
		  account: this.user.account.name,
		  reward_steem: this.claimSTEEM,
		  reward_sbd: this.claimSBD,
		  reward_vests: this.claimVests,
		}, window.location.origin + '/wallet');

		//console.log(link);
		
		this.claimWindow = window.open(link);
		
		//Below would have been preferred approach, but claimRewardBalance keeps failing. Keeping here for future further exploration
		/*
		console.log(this.claimSTEEM.split(' ')[0]);
		console.log(this.claimSBD.split(' ')[0]);
		console.log(this.claimVests.split(' ')[0]);
		await this.$steemconnect.claimRewardBalance(this.user.account.name, this.claimSTEEM, this.claimSBD, this.claimSP);
		console.log('done');*/
	  },
	},
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
    }
  }
</script>

<style lang="sass">
  .history
    max-width: 500px
</style>
