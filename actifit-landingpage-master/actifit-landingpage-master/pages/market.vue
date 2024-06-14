<template>
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center">{{ $t('market_title') }}</h2>
	  <h3 class="text-center m-4 text-brand market-sub">{{ $t('market_subtitle') }}</h3>
	  
	  
	  <!-- ticket prize section / gadgets purchase -->
	  
	  <div class="col-md-12 text-center text-primary mb-5 notice-text">
		  <h4>{{$t('prize_tickets_buy_gadgets')}}<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle" :title="$t('view_details')"></i></a></h4> 
		  <div class="row row-sep">
			<div class="col-md-4 row-sep-in small-pad-row acti-shadow">
			  <h5 class="token-title pt-2 notice-text">{{$t('my_tickets_collected')}}</h5>
			  <div v-if="user"><i class="fas fa-ticket-alt text-brand" ></i>&nbsp;{{ ticketCount }} {{$t('tickets_collected')}}</div>
			  <div v-else >-</div>
			</div>
			<div class="col-md-4 row-sep-in small-pad-row acti-shadow">
			  <h5 class="token-title pt-2 notice-text">{{$t('prize_pool')}}</h5>
			  <div v-if="prizePoolValue!=''"><i class="fas fa-donate text-brand" ></i>&nbsp;{{ prizePoolValue }} {{$t('HIVE')}}<img src="/img/HIVE.png" class="token-logo-sm"></div>
			  <div v-else ><i class="fas fa-spin fa-spinner text-brand"></i></div>
			</div>
			<div class="col-md-4 row-sep-in small-pad-row acti-shadow">
			  <h5 class="token-title pt-2 notice-text">{{ $t('next_draw') }}&nbsp;</h5>
			  <Countdown v-if="countDownReady && nextGadgetBuyRewardDate" :deadline="nextGadgetBuyRewardDate"></Countdown>
			  <div v-else ><i class="fas fa-spin fa-spinner text-brand"></i></div>
			</div>
		  </div>
		  <div class="row row-sep">
			<div class="col-md-4"></div>
			<div class="col-md-4 row-sep-in acti-shadow">
				<h5 class="token-title pt-2 notice-text"><i class="fas text-brand fa-trophy"></i> {{ $t('Recent_draw_winner') }}</h5>
				<div><a :href="'/'+lastDrawWinner">@{{ lastDrawWinner }}</a> {{ wonAmount }} {{ $t('HIVE') }}<img src="/img/HIVE.png" class="token-logo-sm"></div>
			</div>
		  </div>
		
	  </div>
	  
	  
	  <!-- allow sorting & filtering products -->
	  <div class="row col-md-12" v-if="prodList.length">
		<span class="col-md-5"></span>
		<select v-model="currentSort" class="form-control col-md-3 sel-adj">
            <option value="">-- {{$t('Sort_By')}} --</option>
			<option :value="JSON.stringify({value: 'name', direction: 'asc'})">{{$t('Name')}}▲</option>
			<option :value="JSON.stringify({value: 'name', direction: 'desc'})">{{$t('Name')}}▼</option>
            <!--<option :value="JSON.stringify({value: 'type', direction: 'asc'})">{{$t('Type')}}▲</option>
			<option :value="JSON.stringify({value: 'type', direction: 'desc'})">{{$t('Type')}}▼</option>-->
			<option :value="JSON.stringify({value: 'level', direction: 'asc'})">{{$t('Level')}}▲</option>
			<option :value="JSON.stringify({value: 'level', direction: 'desc'})">{{$t('Level')}}▼</option>
			<option :value="JSON.stringify({value: 'price', direction: 'asc'})">{{$t('Price')}}▲</option>
			<option :value="JSON.stringify({value: 'price', direction: 'desc'})">{{$t('Price')}}▼</option>
			<option :value="JSON.stringify({value: 'reqtsFilled', direction: 'desc'})">{{$t('Ready')}}▲</option>
			<option :value="JSON.stringify({value: 'reqtsFilled', direction: 'asc'})">{{$t('Ready')}}▼</option>
			<option :value="JSON.stringify({value: 'bought', direction: 'asc'})">{{$t('Bought')}}▲</option>
			<option :value="JSON.stringify({value: 'bought', direction: 'desc'})">{{$t('Bought')}}▼</option>
        </select>
		<!--<span class="col-md-3">{{$t('Filter_By')}}:</span>-->
		&nbsp;
		<select v-model="currentFilter" class="form-control col-md-3 sel-adj">
            <option value="">-- {{$t('Filter_By')}} --</option>
			<option value="">{{$t('All')}}</option>
			<option value="ingame">{{$t('Game')}}</option>
            <option value="service">{{$t('Consultation')}}</option>
			<option value="ebook">{{$t('Ebook')}}</option>
			<option value="real">{{$t('Physical_Products')}}</option>
        </select>
		
		<div class="row expansion-arrow-all">
			<a class="arrow-icon" v-on:click="expandAllSwitchStatus" :class="expandAllStatus" :title="expandAllStatusText">
			  <span class="left-bar"></span>
			  <span class="right-bar"></span>
			</a>
		</div>
	  </div>
	  	  
	  <!-- show listing of special event products -->
	  
	  
	  <!--
	  <h5 class="text-center pt-3 market-sub text-brand">{{ $t('special_christmas_event') }}</h5>
	  
	  <div class="row" v-if="prodList.length">
        <Product v-for="product in prodList" 
			:product="product" :key="product._id" :pros="professionals" :userrank="userRank" :gadgetStats="gadgetStats"  :realProducts="realProducts" :expandAll="expandAllStatus"
			v-if="product.specialevent"
			@update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets"/>
      </div>
	  <br/>
	  
	  -->
	  
	  
      <!-- show listing of products -->
      <div class="row" v-if="prodList.length">
        <Product v-for="product in prodList" 
			:product="product" :key="product._id" :pros="professionals" :userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts" :expandAll="expandAllStatus"
			v-if="!product.specialevent && (!currentFilter || product.type == currentFilter)"
			@update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets"/>
      </div>
	  <div class="text-center text-brand" v-else><i class="fas fa-spin fa-spinner"></i></div>

    </div>
	
	<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('weekly_pay_prize_desc')"/>
	
	

    <Footer />
    <client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Product from '~/components/Product'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'
  
  import hive from '@hiveio/hive-js'
  
  import Lodash from 'lodash'
  
  import Countdown from 'vuejs-countdown'
  
  import NotifyModal from '~/components/NotifyModal'

  export default {
    head () {
		return {
		  title: `Actifit Market - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Actifit market where you can buy goods with AFIT tokens. Spend your AFIT tokens on health, fitness, and related products & services!` },
			{ hid: 'ogdescription', name: 'og:description', content: `Actifit market where you can buy goods with AFIT tokens. Spend your AFIT tokens on health, fitness, and related products & services!` }
		  ]
		}
	},
	components: {
      NavbarBrand,
      Product,
      Footer,
	  Countdown,
	  NotifyModal
    },
    data () {
      return {
		currentFilter: '',
		currentSort: JSON.stringify({value: 'price', direction: 'asc'}),
		prodList: [],
		afitPrice: 0,
		ticketCount: 0,
		prizePool: 0,
		prizePoolValue: '',
		countDownReady: false,
		nextGadgetBuyRewardDate: '',//'2020-10-15',//"August 18, 2020 00:00 GMT",
		lastDrawWinner: '',
		wonAmount: 0,
		expandAllStatus: '',
		expandAllStatusText: 'Expand All',
      }
    },
    computed: {
	  ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'products', 'professionals', 'userRank', 'gadgetStats', 'realProducts']),
    },
	watch: {
	  user: 'fetchUserData',
	  currentSort: 'reorderProducts',
	  products: 'setProducts',
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
	  expandAllSwitchStatus(){
		if (this.expandAllStatus == ''){
			this.expandAllStatus = 'open';
			this.expandAllStatusText = 'Collapse All';
		} else {
			this.expandAllStatus = '';
			this.expandAllStatusText = 'Expand All';
		}
	  },
	  refreshTickets () {
		//console.log('>>>>refreshing');
		this.fetchUserBuyTicketEntries();
		this.fetchPrizePool();
	  },
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		  this.$store.dispatch('fetchUserGadgetStats')
		  let accToken = localStorage.getItem('access_token')
		  this.$store.dispatch('fetchUserBoughtRealProducts', accToken)
		  this.fetchUserBuyTicketEntries();
		}
	  },
	  reorderProducts () {
		try{
			//console.log(this.currentSort);
			let sortApproach = JSON.parse(this.currentSort);
			//console.log(sortApproach.value);
			if (sortApproach.value){
				console.log(sortApproach.value);
				if (sortApproach.value == 'price'){
					this.prodList = _.orderBy(this.prodList, function(e) { return e.price[0].price },[sortApproach.direction]);
				}else{
					this.prodList = _.orderBy(this.prodList, [sortApproach.value],[sortApproach.direction]);
				}
				this.$forceUpdate();
			}
		}catch(err){
			console.log(err);
		}
	  },
	  setProducts () {
		this.prodList = this.products;
		this.reorderProducts();
	  },
	  updateProd (prod) {
		let ind = this.prodList.findIndex( product => (product._id === prod._id ));
		this.prodList[ind] = prod;
		this.$forceUpdate();
		//console.log('updateProd');
		//console.log(this.prodList[ind]);
	  },
	  setAFITPrice (_afitPrice){
		this.afitPrice = _afitPrice;
		console.log(this.afitPrice);
	  },
	  async fetchAfitPrice () {
	    //fetch AFIT price
	    fetch(process.env.actiAppUrl+'exchangeAFITPrice').then(
		  res => {res.json().then(json => this.setAFITPrice (json)).catch(e => reject(e))
	    }).catch(e => reject(e))
	  },
	  setTicketCount(result){
		if (Array.isArray(result) && result.length > 0){
			this.ticketCount = result[0].tickets_collected;
		}else{
			this.ticketCount = 0;
		}
	  },
	  async fetchUserBuyTicketEntries () {
	    //fetch user ticket entries
		if (this.user && this.user.account){
			fetch(process.env.actiAppUrl+'userActiveGadgetBuyTickets/'+this.user.account.name).then(
			  res => {res.json().then(json => this.setTicketCount (json)).catch(e => reject(e))
			}).catch(e => reject(e))
		}
	  },
	  async fetchPrizePool () {
		let _parent = this;
		hive.api.getAccounts([process.env.actifitMarketBuy], function(err, response){
			//console.log(err, response);
			if (!err){
				_parent.prizePool = response[0].balance;
				_parent.prizePoolValue = _parent.numberFormat(parseFloat(_parent.prizePool.split(' ')[0])/2, 3);
			}
		});
	  },
	  async prepareData () {
		this.fetchAfitPrice();
		
		this.fetchUserBuyTicketEntries();
	  
		this.fetchPrizePool();
	  },
	  
	  setNextPrizeDate (json){
		console.log('setNextPrizeDate');
		console.log(json);
		let targetDate = new Date(json.nextDrawDate);
		let mnth = targetDate.getMonth()+1;
		if (mnth<10){
			mnth = '0'+mnth;
		}
		this.nextGadgetBuyRewardDate = targetDate.getFullYear() + '-' + mnth  + '-' + targetDate.getDate() + ' 00:00 GMT' ;
		console.log('nextGadgetBuyRewardDate');
		console.log(this.nextGadgetBuyRewardDate);
		
		//also set last draw winner display
		this.lastDrawWinner = json.winner[0].name;
		this.wonAmount = this.numberFormat(json.winner[0].reward, 3);
	  },
	  
	  async fetchGadgetPrizeCycle() {
		fetch(process.env.actiAppUrl+'recentGadgetBuyPrizeCycle/').then(
		  res => {res.json().then(json => this.setNextPrizeDate (json)).catch(e => reject(e))
		}).catch(e => reject(e))
		
	  }
	  
    },
	
    async mounted () {
	  this.countDownReady = true;
	  
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  
	  this.fetchGadgetPrizeCycle();
	  
	  await this.prepareData();
	  
			  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  
	  hive.api.setOptions({ url: process.env.hiveApiNode });
	  
	  //refetch price every 2 mins
	  setInterval(this.prepareData, 2 * 60 * 1000);
	 
	  
      // fetch products
      this.$store.dispatch('fetchProducts')
	  
	  // fetch user bought real products
	  //this.$store.dispatch('fetchUserBoughtRealProducts');
	  
	  // fetch professionals
      this.$store.dispatch('fetchPros')
	  
    }
  }
</script>
<style>
  .market-sub{
	font-style: italic;
  }
  .selcls { 
    padding: 9px; 
    border: solid 1px #517B97; 
    outline: 0; 
    background: -webkit-gradient(linear, left top, left 25, from(#FFFFFF), color-stop(4%, #CAD9E3), to(#FFFFFF)); 
    background: -moz-linear-gradient(top, #FFFFFF, #CAD9E3 1px, #FFFFFF 25px); 
    box-shadow: rgba(0,0,0, 0.1) 0px 0px 8px; 
    -moz-box-shadow: rgba(0,0,0, 0.1) 0px 0px 8px; 
    -webkit-box-shadow: rgba(0,0,0, 0.1) 0px 0px 8px; 
  }
  .sel-adj{
	margin-bottom: 3px;
  }
  .notice-text{
    font-size: x-large;
  }
  .no-bullets{
    list-style: none;
  }
  .text-success{
    padding-right: 2px;
  }
  .row-sep-in{
    border: 1px solid orange;
	background: linear-gradient(20deg,orange,transparent);
  }
  .row-sep-in h5, .row-sep-in .token-title{
	border-bottom: 1px dashed red;
	height: 40px;
  }
  .left-bar:after, .right-bar:after{
	animation: blink 3s infinite;/*20 alternate;*/
  }

	@keyframes blink {
	  0%, 50%, 100% { background-color: pink; }
	  25%, 75% { background-color: red; }
	}
	
	.expansion-arrow-all{
		display: contents;
	}
	.book-button {
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	}
</style>