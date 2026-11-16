<template>
  <!-- delegators listing -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">

	  <div class="col-md-12 text-center mb-5 notice-text">
      <ListHeadingSection :textualDisplay="textualTitle" />

		  <div class="text-left">
			<span v-if="afitPrice">
				<img class="token-logo-sm " src="/img/actifit_logo.png" alt="">&nbsp;{{ $t('AFIT_Token')}} {{ $t('price')}}: $ {{ numberFormat(afitPrice.afitHiveLastUsdPrice, 5) }} |
			</span>
			<span v-if="hivePrice">
				<img src="/img/HIVE.png" style="max-height: 20px;" alt="">&nbsp;{{ $t('HIVE')}} {{ $t('price')}}: $ {{ hivePrice }}
			</span>
		  </div>
		  <div class="row-sep">
			<div class="col-md-12 row-sep-in small-pad-row yf-main-notif p-2 text-left shadowed-view">
				<span v-if="topDelegators.hive">
					<h4 class="text-center">{{ $t('Daily_pool') }} - {{$t('Hive_delegators')}} <img src="/img/HIVE.png" style="max-height: 20px;" alt=""> </h4>

					<h5>
						{{ $t('daily_amount') }}: {{ dailyHivePool }} {{ $t('AFIT_Token') }}
						<img class="token-logo-sm " src="/img/actifit_logo.png" alt="">
					</h5>

					<h5>{{$t('total_delegations')}}: {{numberFormat(topDelegators.hive.length,0)}}</h5>
					<h5>{{$t('total_amount_locked')}}: {{numberFormat(delegatedHiveAmount,0)}} {{$t('HIVE')}} ( $ {{numberFormat(delegatedHiveAmount * hivePrice,2)}} )</h5>
					<h5 v-if="afitPrice && hivePrice">{{$t('yearly_apy')}}: {{calculateYearlyAPY()}}</h5>
					<div style="text-align:center; padding-top: 10px">
						<a href="/wallet?action=power_up" class="btn btn-brand w-25">{{ $t('stake') }}</a>
						<a href="/wallet?action=delegate" class="btn btn-brand w-25">{{ $t('DELEGATE_ACTION_TEXT') }}</a>
					</div>
				</span>
				<span v-else>
					<i class="fas fa-spin fa-spinner text-brand"></i>
				</span>
			</div>
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
			<h4>{{ $t('daily_yield') }}</h4> <!--work here -sprinklepancake-->
		</span>
      </div>
      <div v-if="delegationTransactions && delegationTransactions.length && topDelegators.hive" >
		  <div class="row" v-for="(trx, index) in delegationTransactions" :key="index">
			<span class="col-6 p-1">

				<UserHoverCard :username="trx.user" displayMode="no-rank"/>
			</span>
			<!-- amount delegated -->
			<span class="col-3 p-1">
				<img :src="'/img/'+trx.chain+'.png'" style="max-height: 20px;" alt="">
				<span v-if="trx.chain == 'HIVE' && topDelegators.hive && topDelegators.hive.length" class="p-1">{{ getDelegatedAmount(trx, 'hive', true) }} {{ $t('Hive_Power') }}
					<span v-if="randomAfitTrxHive == ''">{{setHiveTrx(trx, getDelegatedAmount(trx, 'hive', false))}}</span>
				</span>
			</span>
			<span class="col-3 p-1"><img class="token-logo-sm " src="/img/actifit_logo.png" alt=""> {{ getRewardedAmount(trx) }} {{ $t('AFIT_Token') }}  {{ $t('per_day') }}</span>
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
  import UserHoverCard from '~/components/UserHoverCard.vue';
  import ListHeadingSection from '~/components/ListHeadingSection.vue';

  export default {
    head () {
		return {
		  title: `Actifit Daily Yield Farming - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Earn daily AFIT token rewards by delegating Hive Power to Actifit. Yield farm crypto while supporting the move-to-earn fitness community.` },
			{ hid: 'ogdescription', property: 'og:description', content: `Earn daily AFIT token rewards by delegating Hive Power to Actifit yield farming.` },
			{ hid: 'ogtitle', property: 'og:title', content: 'Actifit Daily Yield Farming - Actifit.io' }
		  ]
		}
	},
	components: {
      NavbarBrand,
      Footer,
      NotifyModal,
      UserHoverCard,
      ListHeadingSection
    },
    data () {
      return {
        loading: true, // initial loading state
		profImgUrl: process.env.hiveImgUrl,
		delegationTransactions: [],
		dailyHivePool: '',
		afitPrice: '',
		hivePrice: '',
		randomAfitTrxHive: '',
		delegatedHiveAmount: 0,
      }
    },
    computed: {
      ...mapGetters(['topDelegators']),
      textualTitle (){
        return this.$t('Daily_yield') + '&nbsp;<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle text-white" :title="'+this.$t('view_details')+'"></i></a>';
      }
    },
	watch: {
		topDelegators: function(){
			this.delegatedHiveAmount = 0;
			for (let i=0;i<this.topDelegators.hive.length;i++){
				this.delegatedHiveAmount += parseInt(this.topDelegators.hive[i].steem_power);
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
	  },
	  getRewardedAmount(trx){
		return this.numberFormat(trx.token_count, 3);
	  },
	  setAFITPrice (_afitPrice){
		this.afitPrice = _afitPrice;
		console.log(this.afitPrice);
	  },
	  async fetchPriceData () {
		  //grab HIVE price
		  // See VoteModal.vue: CoinGecko now needs a key and returns HTML, leaving the
		  // price at its default of 1. Our API reads the chain's median feed instead.
		  fetch('/actifit-api/hivePrice').then(
			res => {res.json().then(json => this.setHivePrice (json.hive.usd))
			  .catch(e => console.warn('hive price parse failed', e))
		  }).catch(e => console.warn('hive price fetch failed', e))

		//fetch AFIT price
	    fetch(process.env.actiAppUrl+'exchangeAFITPrice').then(
		  res => {res.json().then(json => this.setAFITPrice (json)).catch(e => reject(e))
	    }).catch(e => reject(e))
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
	  calculateYearlyAPY (){
		if (!this.randomAfitTrxHive) return '- %';
		const hiveValue = this.randomAfitTrxHive.delegated_amount * this.hivePrice;
		const afitValue = this.randomAfitTrxHive.token_count * this.afitPrice.afitHiveLastUsdPrice;
		const dailyAPY = afitValue / hiveValue; // daily return
		return this.numberFormat(365 * dailyAPY * 100, 3) + ' %';
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
