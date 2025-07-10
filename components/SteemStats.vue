<template>
	<div class="steem-stats-container" v-if="getVotingPower">
		<!-- Voting Power Section -->
		<div class="stat-line">
			<i class="fa-solid fa-thumbs-up stat-icon" :style="displayProperColor"></i>
			<div class="stat-text-content">
				<template v-if="!minView">
					<span>{{ $t('Your_Voting_Power') }} </span>
					<span :style="displayProperColor">{{ getVotingPower }}</span>
					<small class="text-muted"> ({{ $t('Full_In') }} {{timeToFull(this.currentVotingPower)}})</small>
					<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle ml-1"></i></a>
				</template>
				<template v-else>
					<span>{{ $t('My_Voting_Power') }} </span>
					<span :style="displayProperColor">{{getVotingPower}}</span>
				</template>
			</div>
		</div>
		<div class="progress">
		  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :class="{'bg-success': currentVotingPower > 80, 'bg-warning': currentVotingPower <= 80 && currentVotingPower > 60, 'bg-danger': currentVotingPower <= 60}" :style="{ width: currentVotingPower + '%' }"></div>
		</div>

		<!-- Resource Credits Section -->
		<div class="stat-line">
			<i class="fa-sharp fa-solid fa-bolt stat-icon text-brand"></i>
			<div class="stat-text-content">
				<template v-if="!minView">
					<span>{{ $t('Your_RC') }} </span>
					<span class="text-brand">{{ this.currentRCPercent }}</span>
					<small class="text-muted"> ({{ $t('Full_In') }} {{timeToFull(this.currentRC)}})</small>
					<a href="#" data-toggle="modal" data-target="#notifyModalRC"><i class="fas fa-info-circle ml-1"></i></a>
				</template>
				<template v-else>
					<span>{{ $t('My_RC') }} </span>
					<span class="text-brand">{{this.currentRCPercent}}</span>
				</template>
			</div>
		</div>
		<div class="progress">
			<div class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" :style="{ width: currentRCPercent}"></div>
		</div>
	</div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import steem from 'steem'
  import hive from '@hiveio/hive-js'
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
		properties: '',
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
	computed: {
	  getVotingPower () {
		return parseFloat(this.currentVotingPower).toFixed(3) + '%';
	  },
	  displayProperColor () {
		if (this.currentVotingPower > 80){
		  return "color: #28a745";
		}else if (this.currentVotingPower > 60){
		  return "color: #fd7e14";
		}
		return "color: #dc3545";
	  }
	},
	methods: {
	  async fetchVotingPower() {
		if (!this.user || !this.user.account){
		  return 0;
		}
		let account = this.user.account;
		const totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate);
		const elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time;
		let maxMana = totalShares * 1000000;
		let currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;
		if (currentMana > maxMana) {
			currentMana = maxMana;
		}
		if (maxMana == 0){
			maxMana = 1;
		}
		let currentManaPerc = currentMana * 100 / maxMana;
		this.currentVotingPower = currentManaPerc;
		
		let chainLnk = hiveclient;
		if (this.cur_bchain == 'STEEM'){
			chainLnk = client;
		}
		try {
			let rcComponent = await chainLnk.rc.getRCMana(this.user.account.name);
			this.currentRC = rcComponent.percentage/100;
			this.currentRCPercent = this.currentRC.toFixed(2) + '%';
		} catch (e) {
			console.log(e);
		}
		return currentManaPerc;
	  },
	  timeToFull(param){
	    if (!param) return '00h:00m';
		let perc = parseFloat(param);
		if (perc >= 100) return '00h:00m';
		let timeToFull = this.toTimer((this.STEEMIT_100_PERCENT - perc * 100) * this.STEEMIT_VOTE_REGENERATION_SECONDS / this.STEEMIT_100_PERCENT);
		return timeToFull;
	  },
	  toTimer(ts) {
	    const HOURS = 60 * 60;
	    let h = Math.floor(ts / HOURS);
	    let m = Math.floor((ts % HOURS) / 60);
	    return this.padLeft(h, 2) + 'h:' + this.padLeft(m, 2) + 'm';
	  },
	  padLeft(v, d) {
	    let l = (v + '').length;
	    if (l >= d) return v + '';
	    for (let i = l; i < d; i++) {
		  v = '0' + v;
		}
	    return v;
	  },
	},
	async mounted () {
	  if (localStorage.getItem('cur_bchain')){
		this.cur_bchain = localStorage.getItem('cur_bchain')
	  }
	  client = new dsteem.Client(process.env.steemApiNode)
	  hiveclient = new dhive.Client(process.env.altHiveNodes)
	  this.fetchVotingPower();
	  setInterval(this.fetchVotingPower, 30 * 1000);
	}
  }
</script>

<style scoped>
.steem-stats-container {
	padding-top: 0.5rem;
}
.stat-line {
	display: flex;
	align-items: center;
	margin-bottom: 0.25rem;
}
.stat-icon {
	width: 20px; 
	text-align: center;
	font-size: 1.1rem;
	margin-right: 8px; 
}
.text-brand {
	color: #e10707; 
}
.stat-text-content {
	flex-grow: 1; 
	font-size: 0.9rem;
}
.progress {
	height: 8px;
	border-radius: 4px;
	margin-bottom: 1rem;
}
.progress:last-of-type {
	margin-bottom: 0;
}
</style>