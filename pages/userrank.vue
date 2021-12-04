<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5" v-if="user">
      
      <div class="text-left">
        <h3 class="mb-4" v-if="user">{{ $t('Hey') }} {{ user.account.name }}!</h3>
		<div class="lead">{{ $t('Current_rank') }} {{ this.userRankObj.user_rank }} . {{ $t('Rank_details') }}</div>
		<div></div>
		
		<div v-html="$t('Rank_delegation_score')"></div>
		<div class="pl-3">
		<span v-for="iterx in delegation_rules.length" :key="iterx">
			<span class="color-box-afit" :title="'('+matchVal(delegation_rules, iterx)+' - '+ matchVal(delegation_rules, iterx+1, true) + ') HP'" v-if="iterx<=revRankFactor(delegation_rules, userRankObj.delegation_score, delegation_factor)"></span>
			<span class="color-box-afit opaque-box" :title="'('+matchVal(delegation_rules, iterx)+' - '+ matchVal(delegation_rules, iterx+1, true) + ') HP'" v-else></span>
		</span>
		<span class="pl-2">+ {{userRankObj.delegation_score}}</span>
		</div>
		<div v-html="$t('Rank_afit')"></div>
		<div class="pl-3">
		<span v-for="iterx in afit_token_rules.length" :key="iterx">
			<span class="color-box-afit" :title="'('+matchVal(afit_token_rules, iterx)+' - '+ matchVal(afit_token_rules, iterx+1, true) + ') AFIT'" v-if="iterx<=revRank(afit_token_rules, userRankObj.full_afit_bal)"></span>
			<span class="color-box-afit opaque-box" :title="'('+matchVal(afit_token_rules, iterx)+' - '+ matchVal(afit_token_rules, iterx+1, true) + ') AFIT'" v-else></span>
		</span>
		<span class="pl-2">+ {{userRankObj.afit_tokens_score}}</span>
		</div>
		<div v-html="$t('Rank_total_posts')"></div>
		<div class="pl-3">
		<span v-for="iterx in rewarded_posts_rules.length" :key="iterx">
			<span class="color-box-afit" :title="'('+matchVal(rewarded_posts_rules, iterx)+' - '+ matchVal(rewarded_posts_rules, iterx+1, true) + ') Posts'" v-if="iterx<=revRankFactor(rewarded_posts_rules, userRankObj.tot_posts_score, rewarded_posts_factor)"></span>
			<span class="color-box-afit opaque-box" :title="'('+matchVal(rewarded_posts_rules, iterx)+' - '+ matchVal(rewarded_posts_rules, iterx+1, true) + ') Posts'" v-else></span>
		</span>
		<span class="pl-2">+ {{userRankObj.tot_posts_score}}</span>
		</div>
		<div v-html="$t('Rank_recent_posts')"></div>
		<div class="pl-3">
		<span v-for="iterx in recent_reward_posts_rules.length" :key="iterx">
			<span class="color-box-afit" :title="'('+matchVal(recent_reward_posts_rules, iterx)+' - '+ matchVal(recent_reward_posts_rules, iterx+1, true) + ') Posts'" v-if="iterx<=revRankFactor(recent_reward_posts_rules, userRankObj.recent_posts_score, recent_posts_factor)"></span>
			<span class="color-box-afit opaque-box" :title="'('+matchVal(recent_reward_posts_rules, iterx)+' - '+ matchVal(recent_reward_posts_rules, iterx+1, true) + ') Posts'" v-else></span>
		</span>
		<span class="pl-2">+ {{userRankObj.recent_posts_score}}</span>
		</div>
		<div v-html="$t('Rank_afitx')"></div>
		<div class="pl-3">
		<span v-for="iterx in max_afitx_rank*10" :key="iterx">
			<span class="color-slim-box-afit" :title="iterx+' AFITX'" v-if="(iterx+1)/10<=userRankObj.afitx_rank"></span>
			<span class="color-slim-box-afit opaque-box" :title="iterx+' AFITX'" v-else></span>
		</span>
		<span class="pl-2">+ {{userRankObj.afitx_rank}}</span>
		</div>
      </div>

    </div>
	
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('login_required') }}
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a href="/login" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>
	
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  

  import { mapGetters } from 'vuex'
  
  export default {
	head () {
		return {
		  title: `Actifit User Rank - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Actifit User Rank Page` },
			{ hid: 'ogdescription', name: 'og:description', content: `Actifit User Rank Page` }
		  ]
		}
	},
    components: {
      NavbarBrand,
      Footer,
    },
	data (){
	  return {
	    refUrl: '',
		screenWidth: 1200,
		//delegation calculation matrix
		delegation_rules: [
			[9,0],
			[499,0.05],
			[999,0.10],
			[4999,0.20],
			[9999,0.30],
			[19999,0.40],
			[49999,0.55],
			[99999,0.65],
			[499999,0.75],
			[999999,0.90],
			//[1000000,1]
		],
		
		//AFIT token calculation matrix
		afit_token_rules: [
			[9,0],
			[999,1],
			[4999,3],
			[9999,5],
			[19999,8],
			[49999,12],
			[99999,16],
			[499999,20],
			[999999,24],
			[4999999,30],
			//[5000000,1]
		],
		
		//Rewarded Posts calculation matrix
		rewarded_posts_rules: [
			[9,0],
			[29,0.10],
			[59,0.20],
			[89,0.30],
			[119,0.40],
			[179,0.50],
			[359,0.60],
			[539,0.70],
			[719,0.80],
			[1079,0.90],
			//[1080,1]
		],
		
		//Rewarded Posts calculation matrix
		recent_reward_posts_rules: [
			[0,0],
			[2,0.20],
			[4,0.40],
			[6,0.60],
			[8,0.80],
			//[9,1]
		],
		delegation_factor: 30,
		afit_token_factor: 30,
		rewarded_posts_factor: 20,
		recent_posts_factor: 20,
		recent_posts_period: 10,
		max_afitx_rank: 100,
	  }
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'userRankObj', 'userRank']),
	  displayUserRank () {
		console.log(this.userRankObj);
		return this.userRankObj
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  }
    },
    async mounted () {
	  this.screenWidth = screen.width;
	  this.fetchUserInfo();
    },
	created () {
	  this.$store.dispatch('steemconnect/login')
	},
	watch: {
	  user : 'fetchUserInfo'
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
	  fetchUserInfo () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  
		}
	  },
	  matchVal(arr, iterx, decrease){
		if (iterx>arr.length){
			return '';
		}
		let x = arr[iterx-1];
		if (decrease){
			return this.numberFormat(x[0], 0);
		}
		return this.numberFormat(x[0]+1, 0);
	  },
	  revRankFactor(arr, value, factor){
		let arr_norm_val = value/factor;
		for (let i=0;i<arr.length;i++){
			if (arr[i][1]==arr_norm_val){
				//found matching array entry
				return i;
			}
		}
		
	  },
	  revRank(arr, value){
		let rnk = 0;
		for (let i=0;i<arr.length;i++){
			if (value < arr[i][0]){
				//found matching array entry
				return i;
				//
			}
			else{
				rnk = i + 1;
			}
		}
		return rnk;
	  }
	},
  }
</script>
<style>
	.color-box-afit {float:left; background-color:#092; width: 20px; height: 20px; margin: 1px;}
	.color-slim-box-afit {float:left; background-color:#092; width: 0.1px; height: 20px; margin: 0.1px;}
	.opaque-box {opacity: 0.3}
</style>