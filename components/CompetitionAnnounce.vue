<template>
  <div :class="outserSmallScreenClasses" class="position-fixed text-brand mx-auto w-100 acti-notify-comp" >
	<div :class="smallScreenClasses" class="text-center mx-auto acti-notify-comp-inner border-2 rounded">
	  <div>Actifit DeFi Soft Launch is LIVE!<br />Trade AFIT/AFITX, Setup Your Liquidity.
		<a href="" @click.prevent="adjustVisibility" class="expand-comp-notice">
			<span v-if="showCompDetails">&#9651;</span>
			<span v-else>&#9661;</span>
		</a></div>
	  <transition name="fade">
		<div class="extra-info" v-if="showCompDetails">
		  <div class="img-container row">
			<!--<iframe v-if="screenWidth < 768" src="http://www.youtube.com/embed/kS6AXH1kY74" width="320" height="180" frameborder="0" class="mx-auto" allowfullscreen></iframe>
			<iframe v-else src="https://www.youtube.com/embed/kS6AXH1kY74" width="640" height="360" frameborder="0" class="mx-auto" allowfullscreen></iframe>-->
			<!--<iframe width="640" height="360" src="https://www.youtube.com/embed/kS6AXH1kY74"></iframe>-->
			<img class="announce-img" src="/img/defi-soft-launch-announce.jpg">
		  </div>
		  <div>
		  <!--<a href="https://actifit.io/@actifit/we-have-winners-public-token-sale-kicks-off-today-t-7-hours" class="btn btn-brand m-2" target="_blank">Event Details</a>
		  <a href="https://www.youtube.com/watch?v=Vc6rpDU99nk" class="btn btn-brand m-2" target="_blank">Video Announcement</a> 
		  <a href="https://tokensale.actifit.io" class="btn btn-brand m-2 back-red" target="_blank">Join NOW!</a>-->
		  <a href="https://defi.actifit.io" class="btn btn-brand m-2 back-red" target="_blank">Join NOW!</a>
		  </div>
		  <!--<div><span class="end-string">Token Sale ends in </span><Countdown v-if="countDownReady" deadline="October 31, 2021 22:00 GMT"></Countdown><i v-else class="fas fa-spin fa-spinner text-brand"></i></div>-->
		</div>
	  </transition>
	</div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  //import Countdown from 'vuejs-countdown'
  
  export default {
	components: {
	  //Countdown
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
		return "w-50";
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
	  top:80px; 
	  z-index:1; 
	  font-size: 20px;
	  vertical-align: top;
	  opacity: 1;
	}
	.acti-notify-comp-inner{
	  background: white!important; 
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
	  padding-right: 10px;
	}
	.announce-img{
	  max-height: 65vh;
	  margin: auto;
	  max-width: 100%;
	}
	
	@media only screen and (max-width: 700px) {
		.announce-img{
		  max-height: 50vh;
		  margin: auto;
		  max-width: 90%;
		}
	}
	.img-container{
	  
	}
	.back-red{
		background: #a17f1a;
	}
	.back-red:hover{
		background: gold;
	}
</style>