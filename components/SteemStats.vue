<template>
	<div class="steem-stats pt-2" v-if="getVotingPower">
		<span v-if="!minView"><span><i class="fa-solid fa-thumbs-up text-brand"></i>&nbsp;{{ $t('Your_Voting_Power') }} </span><span :style="displayProperColor">{{getVotingPower}}</span><span><small v-if="this.user"> ({{ $t('Full_In') }} {{timeToFull(this.currentVotingPower)}})</small> <a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle"></i></a></span></span>
		<span v-else><span><i class="fa-solid fa-thumbs-up text-brand"></i>&nbsp;{{ $t('My_Voting_Power') }} </span><span :style="displayProperColor">{{getVotingPower}}</span></span>
		<div v-if="showVPInfo">{{ $t('VP_desc') }}</div>
		<div class="progress ml-4">
		  <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" :aria-valuenow="currentVotingPower" aria-valuemin="0" aria-valuemax="100" :style="{ width: currentVotingPower + '%' }"></div>
		</div>
		<span v-if="!minView"><span><i class="fa-sharp fa-solid fa-bolt text-brand"></i>&nbsp;{{ $t('Your_RC') }} </span><span :style="displayProperColor">{{this.currentRCPercent}}</span><span><small v-if="this.user"> ({{ $t('Full_In') }} {{timeToFull(this.currentRC)}})</small> <a href="#" data-toggle="modal" data-target="#notifyModalRC"><i class="fas fa-info-circle"></i></a></span></span>
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
        showVpTooltip: false,
        showRcTooltip: false,
	  }
	},
	props: ['user', 'minView'],
	computed: {
	  getVotingPower () {
		return parseFloat(this.currentVotingPower).toFixed(3) + '%';
	  },
	  // REMOVED displayProperColor as it's no longer needed for the minView
	  vpGaugeStyle() {
		const percentage = this.currentVotingPower;
		let color = '#dc3545'; // Default red
		if (percentage > 80) {
			color = '#28a745'; // Green
		} else if (percentage > 60) {
			color = '#fd7e14'; // Orange
		}
		return {
		  '--mask-gradient': `conic-gradient(${color} ${percentage}%, transparent ${percentage}%)`,
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
/*
  IMPORTANT: The "scoped" attribute on this style tag ensures these styles
  ONLY apply to this component. They WILL NOT affect your login buttons or
  any other element outside of this file, fixing the "soft edges" issue.
*/

/* Common Styles */
.text-brand {
	color: #e10707; 
}
.steem-stats-container {
	padding-top: 0.5rem;
}

/* --- STYLES FOR GAUGE VIEW --- */
@keyframes progress-bar-stripes {
  from { background-position-x: 1rem; }
  to { background-position-x: 0; }
}

.steem-stats-gauges {
	display: flex; 
	justify-content: center;
	gap: 4.5rem;
	--gauge-center-bg: #fff;
	--gauge-track-bg: #e9ecef;
}

.dark-mode .steem-stats-gauges,
:root.dark-mode .steem-stats-gauges {
	--gauge-center-bg: #212529;
	--gauge-track-bg: #444;
}

.steem-stats-gauges .gauge-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.steem-stats-gauges .gauge-wrapper {
	flex-shrink: 0;
	position: relative; 
	cursor: pointer;
}
.steem-stats-gauges .gauge {
	position: relative;
	width: 85px; 
	height: 85px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.steem-stats-gauges .gauge::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	border-radius: 50%;
	background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
	background-size: 1rem 1rem;
	animation: progress-bar-stripes 1s linear infinite;
	mask-image: var(--mask-gradient);
	-webkit-mask-image: var(--mask-gradient);
}

.steem-stats-gauges .gauge-center {
	width: 65px; 
	height: 65px; 
	background-color: var(--gauge-center-bg);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
}
.steem-stats-gauges .gauge-value {
    font-size: 1.4rem; 
    font-weight: 700;
    line-height: 1;
}
.steem-stats-gauges .gauge-value small {
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.8;
}

.steem-stats-gauges .gauge-hover-tooltip {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 25, 40, 0.9);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 10;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.95);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
    pointer-events: none;
}
.steem-stats-gauges .gauge-hover-tooltip.visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
}
.steem-stats-gauges .tooltip-content {
    display: flex;
    flex-direction: column;
    color: #fff;
}
.steem-stats-gauges .tooltip-content small {
	opacity: 0.8;
}
.steem-stats-gauges .tooltip-time {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 2px;
	color: #fff !important;
}
.steem-stats-gauges .gauge-label-container {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 0.5rem;
	font-size: 0.9rem;
}
.steem-stats-gauges .gauge-label {
	font-weight: 600;
}

/* --- STYLES FOR PROGRESS BAR VIEW --- */
.steem-stats-progress .stat-line {
	display: flex;
	align-items: center;
	margin-bottom: 0.25rem;
}
.steem-stats-progress .stat-icon {
	width: 20px; 
	text-align: center;
	font-size: 1.1rem;
	margin-right: 8px; 
}
.steem-stats-progress .stat-text-content {
	flex-grow: 1; 
	font-size: 0.9rem;
}
.steem-stats-progress .progress {
	height: 8px;
	border-radius: 4px;
	margin-bottom: 1rem;
}
.steem-stats-progress .progress:last-of-type {
	margin-bottom: 0;
}
</style>