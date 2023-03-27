<template>
	<div class="steem-stats pt-2" v-if="getVotingPower">
		<span v-if="!minView"><span><i class="fa-solid fa-thumbs-up text-brand"></i>&nbsp;{{ $t('Your_Voting_Power') }} </span><span :style="displayProperColor">{{getVotingPower}}</span><span><small> ({{ $t('Full_In') }} {{timeToFull(this.currentVotingPower)}})</small> <a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle"></i></a></span></span>
		<span v-else><span><i class="fa-solid fa-thumbs-up text-brand"></i>&nbsp;{{ $t('My_Voting_Power') }} </span><span :style="displayProperColor">{{getVotingPower}}</span></span>
		<div v-if="showVPInfo">{{ $t('VP_desc') }}</div>
		<div class="progress ml-4">
		  <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" :aria-valuenow="currentVotingPower" aria-valuemin="0" aria-valuemax="100" :style="{ width: currentVotingPower + '%' }"></div>
		</div>
		<span v-if="!minView"><span><i class="fa-sharp fa-solid fa-bolt text-brand"></i>&nbsp;{{ $t('Your_RC') }} </span><span :style="displayProperColor">{{this.currentRCPercent}}</span><span><small> ({{ $t('Full_In') }} {{timeToFull(this.currentRC)}})</small> <a href="#" data-toggle="modal" data-target="#notifyModalRC"><i class="fas fa-info-circle"></i></a></span></span>
		<span v-else><span><i class="fa-sharp fa-solid fa-bolt text-brand"></i>&nbsp;{{ $t('My_RC') }} </span><span :style="displayProperColor">{{this.currentRCPercent}}</span></span>
		<div v-if="showRCInfo">{{ $t('RC_desc') }}</div>
		<div class="progress ml-4">
			<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :aria-valuenow="currentRCPercent" aria-valuemin="0" aria-valuemax="100" :style="{ width: currentRCPercent}"></div>
		</div>
	</div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  //import dsteem from 'dsteem'
  
  var dsteem = require('dsteem')
  
  var dhive = require('@hiveio/dhive')
  
  var client;
  
  var hiveclient;
  
  export default {
    data () {
      return {
		currentVotingPower: 0,
		currentRC: 0,
		currentRCPercent: '0%',
		timeToFullVP: '',
		properties: '', //handles the Steem BC properties
		sbd_print_percentage: 1,
		votePowerReserveRate: 1,
		sbd_price: 1,
		steem_price: 1,
		STEEMIT_100_PERCENT: 10000,
		STEEMIT_VOTE_REGENERATION_SECONDS: (5 * 60 * 60 * 24),
		showRCInfo: false,
		showVPInfo: false,
		cur_bchain: 'HIVE',
	  }
	},
	props: ['user', 'minView'],
	components: {
	},
	computed: {
	  getVotingPower () {
		return this.currentVotingPower + '%';
	  },
	  displayProperColor () {
		//display proper coloring reflecting VP state
		if (this.currentVotingPower > 80){
		  return "color: #28a745";
		}else if (this.currentVotingPower > 60){
		  return "color: #fd7e14";
		}
		return "color: #dc3545";
	  }
	},
	methods: {
	  //handles calculating and displaying proper voting value
	  async calculateVoteValue () {
		
		if (this.properties == ''){
		  //not loaded yet
		  let chainLnk = await this.setProperNode();
		  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		  //grab reward fund data
		  let rewardFund = await chainLnk.api.getRewardFundAsync("post");
		  this.rewardBalance = parseFloat(rewardFund.reward_balance.replace(" STEEM", "").replace(" HIVE", ""));
		  this.recentClaims = rewardFund.recent_claims;
		}
		
		this.votePowerReserveRate = this.properties.vote_power_reserve_rate;
		this.sbd_print_percentage = this.properties.sbd_print_rate / 10000;
		//this.getVoteValueUSD();
	  },
	  //store SBD price
	  setSBDPrice (_sbdPrice){
		this.sbd_price = parseFloat(_sbdPrice).toFixed(3);
	  },
	  //store Steem price
	  setSteemPrice (_steemPrice){
		this.steem_price = parseFloat(_steemPrice).toFixed(3);
	  },
	  //handles grabbing current user's VP
	  async fetchVotingPower() {
		if (!this.user){
		  return 0;
		}
		let account = this.user.account;
		if (typeof account == 'undefined' || account == null){
		  return '';
		}
		const totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate);

		const elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time;
		let maxMana = totalShares * 1000000;
		// 432000 sec = 5 days
		let currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;
		if (currentMana > maxMana) {
			currentMana = maxMana;
		}
		//if user has no VP, set mana as 1 to avoid division by 0
		if (maxMana == 0){
			maxMana = 1;
		}
		let currentManaPerc = currentMana * 100 / maxMana;
		this.currentVotingPower = currentManaPerc.toFixed(3);
		//also fetch time till full power replenishes
		this.timeToFull(this.currentVotingPower);
		
		//and calculate voting power initially
		this.calculateVoteValue();
		
		//this.currentRC = currentManaPerc;
		
		let chainLnk = hiveclient;
		if (this.cur_bchain == 'STEEM'){
			chainLnk = client;
		}
		let rcComponent = await chainLnk.rc.getRCMana(this.user.account.name);
		this.currentRC = rcComponent.percentage/100;
		this.currentRCPercent = this.currentRC + '%';
		
		
		return currentManaPerc;
	  },
	  //calculates time till full power replenishes
	  timeToFull(param){
		let timeToFull = this.toTimer((this.STEEMIT_100_PERCENT - param * 100) * this.STEEMIT_VOTE_REGENERATION_SECONDS / this.STEEMIT_100_PERCENT);
		
		return timeToFull;
	  },
	  //convert to proper timing render
	  toTimer(ts) {
	    const HOURS = 60 * 60;
	    let h = Math.floor(ts / HOURS);
	    let m = Math.floor((ts % HOURS) / 60);
	    //let s = Math.floor((ts % 60));
	    return this.padLeft(h, 2) + 'h:' + this.padLeft(m, 2) + 'm';//':' + this.padLeft(s, 2);
	  },
	  //proper padding to display double digits
	  padLeft(v, d) {
	    let l = (v + '').length;
	    if (l >= d) return v + '';
	    for (let i = l; i < d; i++) {
		  v = '0' + v;
		}
	    return v;
	  },
	  setProperNode (){
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let properNode = hive;
		if (this.cur_bchain == 'STEEM'){
			properNode = steem;
		}
		return properNode;
	  },
	},
	async mounted () {
	  //check which chain is active
	  if (localStorage.getItem('cur_bchain')){
		this.cur_bchain = localStorage.getItem('cur_bchain')
	  }
	  
	  client = new dsteem.Client(process.env.steemApiNode)
	  hiveclient = new dhive.Client(process.env.altHiveNodes)
	  steem.api.setOptions({ url: process.env.steemApiNode });
	  
	  hiveclient.updateOperations(true);
	  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  
	  hive.api.setOptions({ url: process.env.hiveApiNode });
	  
	  //grab STEEM price, needed for vote value calculation
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  //grab SBD price, needed for vote value calculation
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollars&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollars'].usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	
	  //in addition to the default updating of VP upon each render, we need to take into consideration leaving window open. 
	  //for this purpose, let's update every 30 seconds
	  this.fetchVotingPower();
	  setInterval(this.fetchVotingPower, 30 * 1000);
	  if (this.report != null){
		this.fetchReportKeyData();
	  }
	    /*let properties = await client.database.getDynamicGlobalProperties()
		console.log(properties)*/
	  //let acct = await client.rc.findRCAccounts('mcfarhat');
	  
	}
  }
</script>
<style>
	.fas, .steem-stats{
	  cursor: pointer;
    }
</style>