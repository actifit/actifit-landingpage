<template>
	<div>
		<div v-if="isVoting">
			<span>{{ $t('reward_running_note') }}</span>
		</div>
		<div v-else>
			<span>{{ $t('next_reward_note') }} {{ rewardStartTimer }}</span>
		</div>
		<div>{{ $t('actifit_vp') }}: {{ vpPercent }}</div>
		<div class="progress">
		  <div class="progress-bar progress-bar-striped progress-bar-animated bg-actifit" role="progressbar" :aria-valuenow="vp" aria-valuemin="0" aria-valuemax="100" :style="{ width: vp + '%' }"></div>
		</div>
	</div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import steem from 'steem'
  
  //import dsteem from 'dsteem'
  
  var dsteem = require('dsteem')
  
  var client;
  
  export default {
    data () {
      return {
		isVoting: false,
		vp: 0,
		vpPercent: 0,
		currentVotingTimer: '00:00:00',
		rewardStartTimer: this.currentVotingTimer,
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
	  setVotingStatus(json) {
		if (json && json.status){
			this.isVoting = json.status.is_voting;
			this.vp = json.vp
			this.vpPercent = parseFloat(json.vp).toFixed(3) + '%';
			if (this.isVoting){
				this.rewardStartTimer = this.currentVotingTimer;
			}else{
				this.rewardStartTimer = json.reward_start;
			}
		}
	  },
	  loadVotingStatus() {
		//fetch voting status
		  fetch(process.env.actiAppUrl+'votingStatus/').then(
			res => {res.json().then(json => this.setVotingStatus (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
	  }
	},
	async mounted () {
	  this.loadVotingStatus();
	  
	  setInterval(this.loadVotingStatus, 30 * 1000);
	}
  }
</script>
<style>
	.fas, .steem-stats{
	  cursor: pointer;
    }
</style>