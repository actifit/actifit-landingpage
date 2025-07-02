<template>
  <div>
    <NavbarBrand />

<!-- listing -->
<div class="marketplace-container pt-5" style="margin-top:30px ;">
  <!-- Side Navigation -->
  <div class="marketplace-sidebar">
    <!-- User Stats Section -->
    <div class="sidebar-card actifit-orange-bg">
      <h4 class="sidebar-title">{{$t('prize_tickets_buy_gadgets')}}
        <a href="#" data-toggle="modal" data-target="#notifyModal">
          <i class="fas fa-info-circle" :title="$t('view_details')"></i>
        </a>
      </h4>
      
      <div class="stats-grid">
        <div class="stat-item row-sep-in">
          <h5 class="token-title">{{$t('my_tickets_collected')}}</h5>
          <div v-if="user"><i class="fas fa-ticket-alt text-brand"></i>&nbsp;{{ ticketCount }} {{$t('tickets_collected')}}</div>
          <div v-else>-</div>
        </div>
        
        <div class="stat-item row-sep-in">
          <h5 class="token-title">{{$t('prize_pool')}}</h5>
          <div v-if="prizePoolValue!=''"><i class="fas fa-donate text-brand"></i>&nbsp;{{ prizePoolValue }} {{$t('HIVE')}}<img src="/img/HIVE.png" class="token-logo-sm"></div>
          <div v-else><i class="fas fa-spin fa-spinner text-brand"></i></div>
        </div>
        
        <div class="stat-item row-sep-in">
  			<h5 class="token-title">{{ $t('next_draw') }}&nbsp;</h5>
  			<div v-if="countDownReady && nextGadgetBuyRewardDate" class="d-inline-block">
    			<Countdown :deadline="nextGadgetBuyRewardDate" class="countdown-inline" />
  			</div>
  		<div v-else class="d-inline-block"><i class="fas fa-spin fa-spinner text-brand"></i></div>
		</div>
        
        <div class="stat-item row-sep-in">
          <h5 class="token-title"><i class="fas text-brand fa-trophy"></i> {{ $t('Recent_draw_winner') }}</h5>
          <div><a :href="'/'+lastDrawWinner">@{{ lastDrawWinner }}</a> {{ wonAmount }} {{ $t('HIVE') }}<img src="/img/HIVE.png" class="token-logo-sm"></div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Main Content Area -->
  <div class="marketplace-main">
    <div class="marketplace-header">
      <ListHeadingSection :textualDisplay="$t('market_title')" />
       <div class="info-toggle">
    	<a href="#" class="info-btn" @click.prevent="toggleInfo">
      	Info <i class="fas fa-info-circle"></i> 
    	</a>
    	<div class="market-sub" v-if="showMarketSub">{{ $t('market_subtitle') }}</div>
  	</div>

	  <!-- Add this new filtering section -->
<div class="filters-container">
  <div class="filters-inner">
    <div class="filter-box">
      <label><i class="fas fa-sort-amount-down"></i> {{$t('Sort_By')}}</label>
      <select v-model="currentSort" class="form-control filter-select">
        <option value="">-- {{$t('Sort_By')}} --</option>
        <option :value="JSON.stringify({value: 'name', direction: 'asc'})">{{$t('Name')}}▲</option>
        <option :value="JSON.stringify({value: 'name', direction: 'desc'})">{{$t('Name')}}▼</option>
        <option :value="JSON.stringify({value: 'level', direction: 'asc'})">{{$t('Level')}}▲</option>
        <option :value="JSON.stringify({value: 'level', direction: 'desc'})">{{$t('Level')}}▼</option>
        <option :value="JSON.stringify({value: 'price', direction: 'asc'})">{{$t('Price')}}▲</option>
        <option :value="JSON.stringify({value: 'price', direction: 'desc'})">{{$t('Price')}}▼</option>
        <option :value="JSON.stringify({value: 'reqtsFilled', direction: 'desc'})">{{$t('Ready')}}▲</option>
        <option :value="JSON.stringify({value: 'reqtsFilled', direction: 'asc'})">{{$t('Ready')}}▼</option>
        <option :value="JSON.stringify({value: 'bought', direction: 'asc'})">{{$t('Bought')}}▲</option>
        <option :value="JSON.stringify({value: 'bought', direction: 'desc'})">{{$t('Bought')}}▼</option>
      </select>
    </div>
    
    <div class="filter-box">
      <label><i class="fas fa-filter"></i> {{$t('Filter_By')}}</label>
      <select v-model="currentFilter" class="form-control filter-select">
        <option value="">-- {{$t('Filter_By')}} --</option>
        <option value="">{{$t('All')}}</option>
        <option value="ingame">{{$t('Game')}}</option>
        <option value="service">{{$t('Consultation')}}</option>
        <option value="ebook">{{$t('Ebook')}}</option>
        <option value="real">{{$t('Physical_Products')}}</option>
      </select>
    </div>
    
    <div class="expand-toggle">
      <a class="expand-btn" v-on:click="expandAllSwitchStatus" :class="expandAllStatus" :title="expandAllStatusText">
        <span class="expand-text">{{ expandAllStatusText }}</span>
        <span class="arrow-icon">
          <span class="left-bar"></span>
          <span class="right-bar"></span>
        </span>
      </a>
    </div>
  </div>
</div>
    </div>
    
    <!-- Special Event Section -->
    <div v-if="hasSpecialEvents">
      <h5 class="text-center pt-3 market-sub text-brand">{{ $t('special_christmas_event') }}</h5>
      
      <div class="row products-row">
        <Product v-for="product in prodList"
          :product="product" :key="product._id" :pros="professionals" 
          :userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts" 
          :expandAll="expandAllStatus"
          v-if="product.specialevent"
          @update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets"/>
      </div>
      <br/>
    </div>
    
    <!-- Main Products Section -->
    <div>
      <div class="row products-row" v-if="prodList.length">
        <Product v-for="product in prodList"
          :product="product" :key="product._id" :pros="professionals" 
          :userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts" 
          :expandAll="expandAllStatus"
          v-if="!product.specialevent && (!currentFilter || product.type == currentFilter)"
          @update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets"/>
      </div>
      
      <div class="text-center text-brand" v-else>
        <i class="fas fa-spin fa-spinner fa-3x"></i>
      </div>
    </div>
  </div>
</div>

<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('weekly_pay_prize_desc')"/>
<br>
<br>
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
  import Countdown from 'vuejs-countdown'
  import NotifyModal from '~/components/NotifyModal'
  import ListHeadingSection from '~/components/ListHeadingSection.vue'

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
	    NotifyModal,
      ListHeadingSection
    },
    data () {
      return {
		showMarketSub: false,
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
	  toggleInfo() {
  		this.showMarketSub = !this.showMarketSub;
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
.marketplace-container {
  display: flex;
  min-height: calc(100vh - 60px); 
  padding-top: 60px; 
}

.marketplace-sidebar {
  width: 300px;
  padding: 0 15px;
  position: sticky;
  top: 60px; 
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.actifit-orange-bg {
  background: linear-gradient(20deg, black, transparent);
  border: 1px solid red;
}

.sidebar-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: red;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.stat-item {
  padding: 12px;
  border-radius: 6px;
}

.countdown-inline {
  display: inline-flex !important;
  white-space: nowrap !important;
}

.countdown-inline > * {
  display: inline-block !important;
  white-space: nowrap !important;
}

.d-inline-block {
  display: inline-block !important;
}

.token-title {
  font-weight: bold;
  margin-bottom: 8px;
  border-bottom: 1px dashed red;
  height: 40px;
  display: flex;
  align-items: center;
}

.row-sep-in {
  border: 1px solid red;
  background: linear-gradient(20deg, white, transparent);
}

.marketplace-main {
  flex: 1;
  padding: 0 20px;
}

.marketplace-header {
  margin-bottom: 20px;
}

.market-sub {
  font-style: italic;
  color: red;
  font-size: 1.1	rem;
  margin-bottom: 15px;
  background: linear-gradient(20deg, #f8f9fa, white);
  border: 1px solid red;
  border-radius: 8px;
  padding: 10px 15px;
  margin-top: 5px;
  animation: fadeIn 0.3s ease;
}

.products-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
}

.products-row > * {
  flex: 0 0 calc(33.333% - 20px);
  margin: 0 10px 20px;
}

.sel-adj {
  margin-bottom: 15px;
  width: 100%;
}

.expansion-arrow-all {
  text-align: center;
}

.arrow-icon {
  display: inline-block;
  width: 30px;
  height: 15px;
  position: relative;
  cursor: pointer;
}

.left-bar, .right-bar {
  position: absolute;
  background-color: red;
  width: 15px;
  height: 3px;
  top: 50%;
  left: 50%;
}

.left-bar {
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: left center;
}

.right-bar {
  transform: translate(-50%, -50%) rotate(-45deg);
  transform-origin: right center;
}

.left-bar:after, .right-bar:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: inherit;
  animation: blink 3s infinite;
}

.filter-arrow {
  width: 36px !important;      
  height: 36px !important;      
  position: relative;
  display: inline-block;
  margin: 0 auto;
}

.filter-arrow .left-bar,
.filter-arrow .right-bar {
  width: 18px !important;      
  height: 4px !important;        
  background-color: red;     
  position: absolute;
  top: 50%;
  left: 50%;
  transition: all 0.3s ease;
}

.filter-arrow .left-bar {
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: left center;
}
.filter-arrow .right-bar {
  transform: translate(-50%, -50%) rotate(-45deg);
  transform-origin: right center;
}

.filter-arrow.expanded .left-bar {
  transform: translate(-50%, -50%) rotate(-45deg);
}
.filter-arrow.expanded .right-bar {
  transform: translate(-50%, -50%) rotate(45deg);
}

.filter-arrow .left-bar:after,
.filter-arrow .right-bar:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: inherit;
  animation: blink 3s infinite;
}

/* New filter styles */
.filters-container {
  background: linear-gradient(20deg, #f8f9fa, white);
  border: 1px solid red;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.filters-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-box {
  flex: 1;
  min-width: 200px;
}

.filter-box label {
  display: block;
  margin-bottom: 5px;
  color: red;
  font-weight: 600;
}

.filter-select {
  border: 1px solid red;
  background-color: white;
  color: #333;
  height: 40px;
  border-radius: 4px;
  transition: all 0.3s;
}

.filter-select:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.expand-toggle {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.expand-btn {
  display: flex;
  align-items: center;
  color: red;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}

.expand-btn:hover {
  color: #dc3545;
}

.expand-text {
  margin-right: 10px;
}

.arrow-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  position: relative;
}

.arrow-icon .left-bar,
.arrow-icon .right-bar {
  position: absolute;
  background-color: red;
  width: 30px;
  height: 2px;
  top: 50%;
  left: 30%;
  transition: all 0.3s;
}

.arrow-icon .left-bar {
  transform: translate(-50%, -50%) rotate(45deg);
  transform-origin: left center;
}

.arrow-icon .right-bar {
  transform: translate(-50%, -50%) rotate(-45deg);
  transform-origin: right center;
}

.expand-btn.open .left-bar {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.expand-btn.open .right-bar {
  transform: translate(-50%, -50%) rotate(45deg);
}

.info-toggle {
  position: relative;
}

.info-btn {
  color: red;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
  margin-bottom: 10px;
}

.info-btn:hover {
  color: #dc3545;
  transform: scale(1.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 50%, 100% { background-color: pink; }
  25%, 75% { background-color: red; }
}

@media (max-width: 1200px) {
  .products-row > * {
    flex: 0 0 calc(50% - 20px);
  }
}

@media (max-width: 992px) {
  .marketplace-container {
    flex-direction: column;
  }
  
  .marketplace-sidebar {
    width: 100%;
    position: static;
    height: auto;
    margin-bottom: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .products-row > * {
    flex: 0 0 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 