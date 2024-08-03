<template>
	<div class="row text-center pb-3">
		<div class="w-25" />
		<div class="w-50 voting-notice p-2">
			<div v-if="isVoting">
				<span>{{ $t('reward_running_note') }}</span>
			</div>
			<div v-else>
				<span>{{ $t('next_reward_note') }} 
					<span v-if="!isLoading">{{ rewardStartTimer }}</span>
					<span v-else><i class="fas fa-spinner fa-spin"></i></span>
				</span>
			</div>
			<div>{{ $t('actifit_vp') }}: 
				<span v-if="!isLoading">{{ vpPercent }}</span>
				<span v-else><i class="fas fa-spinner fa-spin"></i></span>
			</div>
			<div class="progress">
			  <div class="progress-bar progress-bar-striped progress-bar-animated bg-actifit" role="progressbar" :aria-valuenow="vp" aria-valuemin="0" aria-valuemax="100" :style="{ width: vp + '%' }"></div>
			</div>
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
		isLoading: true,
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
			this.isLoading = false;
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
.voting-notice{
	background: red;
    border: 1px red solid;
    border-radius: 10px;
    color: white;
	font-weight: bold;
}
.bg-actifit{
	background-color: #FF122E;
	opacity: 0.5;
}
</style>