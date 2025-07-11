<template>
	<div class="steem-stats-container" v-if="getVotingPower">
		<div class="stat-gauge-row">
			<div class="gauge-wrapper">
				<div class="gauge" :style="vpGaugeStyle">
					<div class="gauge-center">
						<i class="fa-solid fa-thumbs-up" :style="displayProperColor"></i>
					</div>
				</div>
			</div>
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

		<!-- Resource Credits Section with Circular Gauge -->
		<div class="stat-gauge-row">
			<div class="gauge-wrapper">
				<div class="gauge" :style="rcGaugeStyle">
					<div class="gauge-center">
						<i class="fa-sharp fa-solid fa-bolt text-brand"></i>
					</div>
				</div>
			</div>
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
	  },
	  vpGaugeStyle() {
		const percentage = this.currentVotingPower;
		let color = '#dc3545'; // Default red
		if (percentage > 80) {
			color = '#28a745'; // Green
		} else if (percentage > 60) {
			color = '#fd7e14'; // Orange
		}
		return {
		  // This variable is used by the ::before pseudo-element to create the striped mask
		  '--mask-gradient': `conic-gradient(${color} ${percentage}%, transparent ${percentage}%)`,
		  // This is the main background with the correct track color from CSS variables
		  'background': `conic-gradient(${color} ${percentage}%, var(--gauge-track-bg) ${percentage}%)`
		}
	  },
	  rcGaugeStyle() {
		const percentage = this.currentRC;
		const color = '#0d6efd'; // Bootstrap Primary Blue
		return {
		  '--mask-gradient': `conic-gradient(${color} ${percentage}%, transparent ${percentage}%)`,
		  'background': `conic-gradient(${color} ${percentage}%, var(--gauge-track-bg) ${percentage}%)`
		}
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
/* Define keyframes for the stripe animation */
@keyframes progress-bar-stripes {
  from { background-position-x: 1rem; }
  to { background-position-x: 0; }
}

.steem-stats-container {
	padding-top: 0.5rem;
	/* Light mode default colors */
	--gauge-center-bg: #fff;
	--gauge-track-bg: #e9ecef;
}

/* Override variables in dark mode */
.dark-mode .steem-stats-container,
:root.dark-mode .steem-stats-container {
	--gauge-center-bg: #212529;
	--gauge-track-bg: #444;
}

.stat-gauge-row {
	display: flex;
	align-items: center;
	margin-bottom: 1rem;
}
.stat-gauge-row:last-of-type {
	margin-bottom: 0;
}
.gauge-wrapper {
	flex-shrink: 0;
	margin-right: 15px;
}
.gauge {
	position: relative;
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.gauge::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 50%;
	
	/* The striped background */
	background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
	background-size: 1rem 1rem;

	/* The animation */
	animation: progress-bar-stripes 1s linear infinite;

	mask-image: var(--mask-gradient);
	-webkit-mask-image: var(--mask-gradient);
}

.gauge-center {
	width: 40px;
	height: 40px;
	background-color: var(--gauge-center-bg); /* Use themed variable */
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
}
.gauge-center i {
	font-size: 1.2rem;
}
.text-brand {
	color: #e10707; 
}
.stat-text-content {
	flex-grow: 1; 
	font-size: 0.9rem;
}
</style>