<template>
  <!-- delegators listing -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
	  
	  <div class="col-md-12 text-center mb-5 notice-text">
		  <h2 class="text-center mb-5">{{ $t('Daily_yield') }}<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle" :title="$t('view_details')"></i></a></h2>
		  <div class="text-center row p-2">
			<span v-if="afitPrice">
				<img class="token-logo-sm " src="/img/actifit_logo.png">{{ $t('Current') }} {{ $t('AFIT_Token')}} {{ $t('price')}}: $ {{ numberFormat(afitPrice.afitHiveLastUsdPrice, 5) }} | 
			</span>
			<span v-if="hivePrice">
				<img src="/img/HIVE.png" style="max-height: 20px;">{{ $t('Current') }} {{ $t('HIVE')}} {{ $t('price')}}: $ {{ hivePrice }} | 
			</span>
			<!--<span v-if="steemPrice">
				<img src="/img/STEEM.png" style="max-height: 20px;">{{ $t('Current') }} {{ $t('STEEM')}} {{ $t('price')}}: $ {{ steemPrice }}
			</span>-->
		  </div>
		  <div class="row row-sep">
			<div class="col-md-12 row-sep-in small-pad-row yf-main-notif p-2 text-left">
				<span v-if="topDelegators.hive">
					<h4 class="text-center">{{ $t('Daily_pool') }} - {{$t('Hive_delegators')}} <img src="/img/HIVE.png" style="max-height: 20px;"> </h4>
					
					<h5>
						{{ $t('daily_amount') }}: {{ dailyHivePool }} {{ $t('AFIT_Token') }} 
						<img class="token-logo-sm " src="/img/actifit_logo.png">
					</h5>
					
					<h5>{{$t('total_delegations')}}: {{numberFormat(topDelegators.hive.length,0)}}</h5>
					<h5>{{$t('total_amount_locked')}}: {{numberFormat(delegatedHiveAmount,0)}} {{$t('HIVE')}} ( $ {{numberFormat(delegatedHiveAmount * hivePrice,2)}} )</h5>
					<h5 v-if="afitPrice && hivePrice">{{$t('yearly_apy')}}: {{calculateYearlyAPY('hive')}}</h5>
					<div style="text-align:center; padding-top: 10px">
						<a href="/wallet?action=power_up" class="btn btn-brand w-25">{{ $t('stake') }}</a>
						<a href="/wallet?action=delegate" class="btn btn-brand w-25">{{ $t('DELEGATE_ACTION_TEXT') }}</a>
					</div>
				</span>
				<span v-else>
					<i class="fas fa-spin fa-spinner text-brand"></i>
				</span>
			</div>
			<!--<div class="col-md-6 row-sep-in small-pad-row p-2 text-left">
				<span v-if="topDelegators.steem">
					<h4 class="text-center">{{ $t('Daily_pool') }} - {{$t('Steem_delegators')}} <img src="/img/STEEM.png" style="max-height: 20px;"> </h4>
					
					<h5>
						{{ $t('daily_amount') }}: {{ dailySteemPool }} {{ $t('AFIT_Token') }}
						<img class="token-logo-sm " src="/img/actifit_logo.png">
					</h5>
					<h5>{{$t('total_delegations')}}: {{numberFormat(topDelegators.steem.length,0)}}</h5>
					<h5>{{$t('total_amount_locked')}}: {{numberFormat(delegatedSteemAmount,0)}} {{$t('STEEM')}} ( $ {{numberFormat(delegatedSteemAmount * steemPrice,2)}} )</h5>
					<h5 v-if="afitPrice && steemPrice">{{$t('yearly_apy')}}: {{calculateYearlyAPY('steem')}}</h5>
					<div style="text-align:center; padding-top: 10px">
						<a href="/wallet?action=power_up" class="btn btn-brand w-25">{{ $t('stake') }}</a>
						<a href="/wallet?action=delegate" class="btn btn-brand w-25">{{ $t('DELEGATE_ACTION_TEXT') }}</a>
					</div>
				</span>
				<span v-else>
					<i class="fas fa-spin fa-spinner text-brand"></i>
				</span>
			</div>-->
		  </div>
		
	  </div>
	  
	  <div class="col-md-12" v-html="$t('yield_farm_note')"></div>
	  
      <!-- show listing when loaded -->
	  <div class="row" >
		<span class="col-6 p-2">
			<h4>{{ $t('account') }}</h4>
		</span>
		<span class="col-3 p-2">
			<h4>{{ $t('delegated_amount') }}</h4>
		</span>
		<span class="col-3 p-2">
			<h4>{{ $t('daily_yield') }}</h4>
		</span>
      </div>
      <div v-if="delegationTransactions && delegationTransactions.length && topDelegators.hive" >
		  <div class="row" v-for="(trx, index) in delegationTransactions" :key="index">
			<span class="col-6 p-1">
				<a :href="trx.user" target="_blank" >
				  <div class="yield-avatar mb-3" :style="'background-image: url('+profImgUrl+'/u/' + trx.user + '/avatar);'"></div>
				</a>
				<a :href="trx.user" target="_blank" >@{{ trx.user }}</a><br/>
			</span>
			<!-- amount delegated -->
			<span class="col-3 p-1">
				<img :src="'/img/'+trx.chain+'.png'" style="max-height: 20px;">
				<span v-if="trx.chain == 'HIVE' && topDelegators.hive && topDelegators.hive.length" class="p-1">{{ getDelegatedAmount(trx, 'hive', true) }} {{ $t('Hive_Power') }} 
					<span v-if="randomAfitTrxHive == ''">{{setHiveTrx(trx, getDelegatedAmount(trx, 'hive', false))}}</span>
				</span>
				<span v-else-if="trx.chain == 'STEEM' && topDelegators.steem && topDelegators.steem.length" class="p-1">{{ getDelegatedAmount(trx, 'steem', true) }} {{ $t('Steem_Power') }} 
					<span v-if="randomAfitTrxSteem == ''">{{setSteemTrx(trx, getDelegatedAmount(trx, 'steem', false))}}</span>
				</span>
			</span>
			<span class="col-3 p-1"><img class="token-logo-sm " src="/img/actifit_logo.png"> {{ getRewardedAmount(trx) }} {{ $t('AFIT_Token') }}  {{ $t('per_day') }}</span>
		  </div>
	  </div>
	  <div class="row text-center" v-else>
		<i class="fas fa-spin fa-spinner"></i>
	  </div>
    </div>
	
	<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('yield_farm_note')"/>

    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'
  
  import NotifyModal from '~/components/NotifyModal'

  export default {
    head () {
		return {
		  title: `Actifit Daily Yield Farming - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Daily Yield Farming Rewards` },
			{ hid: 'ogdescription', name: 'og:description', content: `Daily Yield Farming Rewards` }
		  ]
		}
	},
	components: {
      NavbarBrand,
      Footer,
	  NotifyModal
    },
    data () {
      return {
        loading: true, // initial loading state
		profImgUrl: process.env.hiveImgUrl,
		delegationTransactions: [],
		dailyHivePool: '',
		dailySteemPool: '',
		afitPrice: '',
		steemPrice: '',
		hivePrice: '',
		randomAfitTrxHive: '',
		randomAfitTrxSteem: '',
		delegatedHiveAmount: 0,
		delegatedSteemAmount: 0,
      }
    },
    computed: {
      ...mapGetters(['topDelegators'])
    },
	watch: {
		topDelegators: function(){
			this.delegatedHiveAmount = 0;
			for (let i=0;i<this.topDelegators.hive.length;i++){
				this.delegatedHiveAmount += parseInt(this.topDelegators.hive[i].steem_power);
			}
			this.delegatedSteemAmount = 0;
			for (let i=0;i<this.topDelegators.steem.length;i++){
				this.delegatedSteemAmount += parseInt(this.topDelegators.steem[i].steem_power);
			}
		}
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
	  setDelegationTransactions (trx){
		this.delegationTransactions = trx;
	  },
	  getDelegatedAmount(trx, chain, fmt){
		let match = this.topDelegators[chain].find(entry => (entry._id === trx.user));
		//console.log(trx.user+' delegated amount');
		if (match){
			//console.log(match.steem_power);
			if (fmt){
				return this.numberFormat(match.steem_power, 0);
			}else{
				return match.steem_power;
			}
		}
		return '';
	  },
	  setPools(json){
		this.dailyHivePool = this.numberFormat(json.hive_pool, 0);
		this.dailySteemPool = this.numberFormat(json.steem_pool, 0);
	  },
	  getRewardedAmount(trx){
		return this.numberFormat(trx.token_count, 3);
	  },
	  setAFITPrice (_afitPrice){
		this.afitPrice = _afitPrice;
		console.log(this.afitPrice);
	  },
	  async fetchPriceData () {
		  //grab STEEM price
		  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
			res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //grab HIVE price
		  fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd').then(
			res => {res.json().then(json => this.setHivePrice (json.hive.usd)).catch(e => reject(e))
		  }).catch(e => reject(e))	
		
		//fetch AFIT price
	    fetch(process.env.actiAppUrl+'exchangeAFITPrice').then(
		  res => {res.json().then(json => this.setAFITPrice (json)).catch(e => reject(e))
	    }).catch(e => reject(e))
	  },
	  setSteemPrice (_steemPrice){
		this.steemPrice = parseFloat(_steemPrice).toFixed(3);
	  },
	  setHivePrice (_hivePrice){
		this.hivePrice = parseFloat(_hivePrice).toFixed(3);
	  },
	  setHiveTrx (trx, delegated_amount){
		//console.log('setHiveTRX');
		//console.log(delegated_amount);
		this.randomAfitTrxHive = trx;
		this.randomAfitTrxHive.delegated_amount = parseInt(delegated_amount);
	  },
	  setSteemTrx (trx, delegated_amount){
		this.randomAfitTrxSteem = trx;
		this.randomAfitTrxSteem.delegated_amount = parseInt(delegated_amount);
	  },
	  calculateYearlyAPY (chain){
		if (this.randomAfitTrxHive && this.randomAfitTrxSteem){
			if (chain == 'hive'){
				let hiveValue = this.randomAfitTrxHive.delegated_amount * this.hivePrice;
				let afitValue = this.randomAfitTrxHive.token_count * this.afitPrice.afitHiveLastUsdPrice;
				let dailyAPY = afitValue / hiveValue;//daily percentage return (Daily APY)
				/*console.log('calculateYearlyAPY');
				console.log(this.randomAfitTrxHive);
				console.log(this.randomAfitTrxHive.delegated_amount)
				console.log(hiveValue);
				console.log(this.randomAfitTrxHive.token_count);
				console.log(afitValue);
				console.log(dailyAPY);
				console.log(365 * dailyAPY);*/
				return this.numberFormat(365 * dailyAPY * 100, 3) + ' %';
			}else{
				let steemValue = this.randomAfitTrxSteem.delegated_amount * this.steemPrice;
				let afitValue = this.randomAfitTrxSteem.token_count * this.afitPrice.afitHiveLastUsdPrice;
				let dailyAPY = afitValue / steemValue;//daily percentage return (Daily APY)
				/*console.log(this.randomAfitTrxSteem.delegated_amount)
				console.log(steemValue);
				console.log(this.randomAfitTrxHive.token_count);
				console.log(afitValue);
				console.log(dailyAPY);*/
				return this.numberFormat(365 * dailyAPY * 100, 3) + ' %';
			}
		}
		return '- %';
	  }
    },
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')

      // fetch full delegators list
      this.$store.dispatch('fetchTopDelegators')
	  
	  fetch(process.env.actiAppUrl+'transactionsByType?type=Delegation&sortByToken=-1').then(//
		  res => {res.json().then(json => this.setDelegationTransactions (json)).catch(e => reject(e))
		}).catch(e => reject(e))
	  
	  fetch(process.env.actiAppUrl+'getDailyDelegationPool').then(
		  res => {res.json().then(json => this.setPools (json)).catch(e => reject(e))
		}).catch(e => reject(e))
		
	  
	  this.fetchPriceData();
		
		setInterval(this.fetchPriceData, 2*60*1000);
	  
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.profImgUrl = process.env.hiveImgUrl;
		if (cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}

      // remove loading state
      this.loading = false
    }
  }
</script>
<style>
.yield-avatar{
	width: 30px;
    height: 30px;
    background-position: center center;
    background-size: cover;
    border-radius: 50%;
    border: solid 1px #ddd;
    float: left;
}
.row-sep-in{
	border: 1px solid orange;
	background: linear-gradient(20deg,orange,transparent);
}
.row-sep-in h5, .row-sep-in .token-title{
	border-bottom: 1px dashed red;
	min-height: 40px;
}
.no-bullets {
    list-style: none;
}
</style>