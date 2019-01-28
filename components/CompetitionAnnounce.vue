<template>
  <div class="position-fixed text-brand mx-auto w-100 acti-notify-comp">
	<div class="text-center w-50 mx-auto acti-notify-comp-inner border-2 rounded">
	  <div>Competition Alert: Refer New Actifitters!
		<a href="" @click.prevent="adjustVisibility" class="expand-comp-notice">
			<span v-if="showCompDetails">&#9651;</span>
			<span v-else>&#9661;</span>
		</a></div>
	  <transition name="fade">
		<div class="extra-info" v-if="showCompDetails">
		  <div>Earn 5 STEEM + 13 AFIT Per Referral</div>
		  <div>Additional Top Referrer Reward Up To 200 STEEM!</div>
		  <span><a href="/referrals"><u>Refer a Friend</u></a></span> | 
		  <span><a href="/signup"><u>Signup a Friend</u></a></span> |
		  <span><a href="https://busy.org/@actifit/actifit-two-week-signup-competition-200-steem-top-referrer-reward-earn-for-each-signup"><u>Read More</u></a></span>
		  <div><span class="end-string">Ends in </span><Countdown v-if="countDownReady" deadline="February 12, 2019"></Countdown></div>
		</div>
	  </transition>
	</div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Countdown from 'vuejs-countdown'
  
  export default {
	components: {
	  Countdown
	},
    data () {
      return {
		countDownReady: false,
		showCompDetails: true,
	  }
	},
    computed: {
	  ...mapGetters(['competitionNoticeOpen']),
    },
	methods: {
	  adjustVisibility () {
		this.showCompDetails = ! this.showCompDetails;
		if (!this.showCompDetails){
		  localStorage.setItem('ActifitNotificationHidden', true)
		}else{
		  localStorage.removeItem('ActifitNotificationHidden')
		}
	  }
	},
	async mounted () {
	  this.countDownReady = true;
	  if (localStorage.getItem('ActifitNotificationHidden')){ 
	    this.showCompDetails = !localStorage.getItem('ActifitNotificationHidden')
	  }
	}
  }
</script>
<style>
	.acti-notify-comp{
	  top:56px; 
	  z-index:100000; 
	  font-size: 20px;
	  vertical-align: top;
	  opacity: 0.9;
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
	.expand-comp-notice{
	  float:right; 
	  cursor: hand; 
	  padding-right: 5px;
	}
</style>