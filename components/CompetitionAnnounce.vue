<template>
  <div :class="outserSmallScreenClasses" class="position-fixed text-brand mx-auto w-100 acti-notify-comp" >
	<div :class="smallScreenClasses" class="text-center mx-auto acti-notify-comp-inner border-2 rounded">
	  <div>Actifit Initial Steem Offering! Starts Friday April 12 @ 1 PM GMT/UTC
		<a href="" @click.prevent="adjustVisibility" class="expand-comp-notice">
			<span v-if="showCompDetails">&#9651;</span>
			<span v-else>&#9661;</span>
		</a></div>
	  <transition name="fade">
		<div class="extra-info" v-if="showCompDetails">
		  <div class="img-container">
			<img class="announce-img" src="/img/ISO_announce.png">
		  </div>
		  <div><a href="https://actifit.io/@actifit/actifit-iso-first-ever-initial-steem-offering-this-friday-not-to-miss-event-discounted-afit-price-afit-eng-tokens-bonuses"><u>Check ISO Announcement</u></a></div>
		  <div><a href="https://steem-engine.com/?p=market&t=AFIT"><u>Participate in ISO</u></a></div>
		  <div><span class="end-string">ISO Starts in </span><Countdown v-if="countDownReady" deadline="April 12, 2019 13:00"></Countdown></div>
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
		screenWidth: 1200,
	  }
	},
    computed: {
	  ...mapGetters(['competitionNoticeOpen']),
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-75";
	  },
	  outserSmallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "px-2";
		}
		return "";
	  }
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
	  this.screenWidth = screen.width;
	  if (localStorage.getItem('ActifitNotificationHidden')){ 
	    this.showCompDetails = !localStorage.getItem('ActifitNotificationHidden')
	  }
	}
  }
</script>
<style>
	.acti-notify-comp{
	  top:56px; 
	  z-index:1; 
	  font-size: 20px;
	  vertical-align: top;
	  opacity: 1;
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
	.announce-img{
	  max-height: 70vh;
	  margin: auto;
	  max-width: 100%;
	}
	.img-container{
	  
	}
</style>