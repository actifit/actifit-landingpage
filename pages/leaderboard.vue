<template>
  <div>
	<NavbarBrand />
	
	<div class="container pt-5 mt-5 pb-5">
		<h1 class="text-center pb-5">
          <i class="fas fa-medal"></i><br>
          {{ $t('Daily_Leaderboard') }}
        </h1>
		<div v-if="!Array.isArray(extLeaderboard) || extLeaderboard.length < 3" class="md-col-12 text-center"><i class="fas fa-spin fa-spinner text-brand"></i></div>
		<div v-else>
			<div v-if="user" class="text-right"><button target="_blank" :class="smallScreenBtnClasses" class="btn btn-lg btn-brand border" v-on:click="findUser">{{ $t('Find_me') }}</button></div>
		</div>
		<div class="row border-actifit" v-if="extLeaderboard.length >= 3" v-for="(curEntry, index) in extLeaderboard" :key="index" :class="entryRelClass(curEntry.author, curEntry.activityCount[0])" :ref="curEntry.author">
          <div class="row col-md-12 m-3 mb-sm-0">
              <span class="avatar pro-card-av rank-class" style="background-image: url(img/gadgets/friend-ranker.png);" >
				<div class="p-3">{{index+1}}</div>
			  </span>
              <a :href="curEntry.author" target="_blank">
                <div class="avatar mb-3 " :style="'background-image: url('+profImgUrl+'/u/' + curEntry.author.replace('@','') + '/avatar);'"></div>
              </a>
              <a :href="curEntry.author" target="_blank" class="col-md-3 mt-3"><span>@{{ curEntry.author }}</span></a><br/>
			  <a :href="curEntry.author" target="_blank" class="col-md-3 mt-3"><span>{{ numberFormat(curEntry.activityCount[0], 0) }} {{$t('Recorded_Activity')}}</span></a>
			  <a :href="curEntry.url" target="_blank" :class="smallScreenBtnClasses" class="btn btn-lg btn-brand border">{{ $t('View_post_details') }}</a>
          </div>
        </div>
	
	</div>
	
	<Footer />
  </div>
</template>

<script>
 
  import { mapGetters } from 'vuex'
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  export default {
	components: {
	  NavbarBrand,
	  Footer
	},
	computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'userReportCount', 'userRank', 'extLeaderboard']),
	  smallScreenBtnClasses () {
		//use proper classes for neat display
		if (screen.width < 768){
		  return "h-25";
		}
		return "h-50";
	  },
    },
	data () {
		return {
			profImgUrl: process.env.hiveImgUrl,
		}
	},
	watch: {
		user: 'fetchUserData',
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
	  /* handle fetching proper user essential data */
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
	  /* properly assign color according to activity count */
	  entryRelClass (curUser, activCount){
		try{
			let userClass = "";
			if (this.user && curUser == this.user.name){
				userClass = "emboss-user "; 
			}
			activCount = parseInt(activCount);
			if (activCount >= 10000 ){
				return userClass + "green-rank";
			}
			if (activCount >= 5000){
				return userClass + "red-rank";
			}
			return userClass + "grey-rank";
		}catch(err){
			return userClass + "";
		}
	  },
	  findUser (){
		this.$refs[this.user.name][0].scrollIntoView({behavior: "smooth", block: "center"});
	  }
	},
	async mounted () {
      // fetch data
      this.$store.dispatch('fetchExtendedLeaderboard')
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  
	  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.profImgUrl = process.env.hiveImgUrl;
		if (cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
	}
  }
</script>
<style>
.text-green{
	color: #76BB0E
}
.avatar{
	width: 100px;
	height: 100px;
}
.border-actifit{
	border: 2px red solid;
	border-bottom: none;
}
.border-actifit:last{
	border-bottom: 2px red solid;
}
.rank-class{
	color: white;
    text-align: center;
	border: none!important;
}
.green-rank{
	background: linear-gradient(-30deg, lightgreen, transparent);
}
.red-rank{
	background: linear-gradient(-30deg, bisque, transparent);
}
.grey-rank{
	background: linear-gradient(-30deg, lightgrey, transparent);
}
.emboss-user{
	border-width: 10px;
	border-bottom: 10px red solid;
}
</style>