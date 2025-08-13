<template>
  <div>
    <NavbarBrand />

<!-- listing -->
<div class="marketplace-container pt-5" style="margin-top:30px ;">
  <!-- Side Navigation -->
  <div class="marketplace-sidebar">
    <div class="sidebar-card actifit-orange-bg">
      <h4 class="sidebar-title text center">{{$t('prize_tickets_buy_gadgets')}}
        <a href="#" data-toggle="modal" data-target="#notifyModal" class="title-i">
          <i class="fas fa-info-circle" :title="$t('view_details')"></i>
        </a>
      </h4>
      
      <div class="stats-grid">
        <div class="stat-item row-sep-in text center">
          <h5 class="token-title"><i class="fas fa-ticket-alt"></i> {{$t('my_tickets_collected')}}</h5>
          <div class="dashed-divider"></div>
          <div class="stat-value" v-if="user">{{ ticketCount }} {{$t('tickets_collected')}}</div>
          <div v-else>-</div>
        </div>
        
        <div class="stat-item row-sep-in text center">
          <h5 class="token-title"><i class="fas fa-piggy-bank"></i> {{$t('prize_pool')}}</h5>
          <div class="dashed-divider"></div>
          <div class="stat-value" v-if="prizePoolValue!=''"><i class="fas fa-donate text-brand"></i>&nbsp;{{ prizePoolValue }} {{$t('HIVE')}}<img src="/img/HIVE.png" class="token-logo-sm"></div>
          <div v-else><i class="fas fa-spin fa-spinner text-brand"></i></div><br>
        </div>
        
        <div class="stat-item row-sep-in text center">
  			<h5 class="token-title"><i class="far fa-calendar-alt"></i> {{ $t('next_draw') }}&nbsp;</h5>
        <div class="dashed-divider"></div>
  			<div v-if="countDownReady && nextGadgetBuyRewardDate" class="d-inline-block stat-value">
    			<Countdown :deadline="nextGadgetBuyRewardDate" class="countdown-inline" />
  			</div>
  		<div v-else class="d-inline-block"><i class="fas fa-spin fa-spinner text-brand"></i></div>
		</div>
        
        <div class="stat-item row-sep-in text center">
          <h5 class="token-title"><i class="fas fa-trophy"></i> {{ $t('Recent_draw_winner') }}</h5>
          <div class="dashed-divider"></div>
          <div class="stat-value"><a :href="'/'+lastDrawWinner">@{{ lastDrawWinner }}</a>
            <br> {{ wonAmount }} {{ $t('HIVE') }}<img src="/img/HIVE.png" class="token-logo-sm"></div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Main Content Area -->
  <div class="marketplace-main">
  <div class="marketplace-header">
<div class="title-highlight-container">
  <div class="d-flex align-items-center title-highlight-box">
    <i class="fas fa-store title-icon"></i>
    <h1 class="market-title m-0">
      {{ $t('market_title') }}
    </h1>
    <a href="#" class="info-iconn" data-toggle="modal" data-target="#marketInfoModal">
      <i class="fas fa-info-circle" :title="$t('view_details')"></i>
    </a>
  </div>
</div>

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
  </div>
</div>
    </div>
    
    <!-- Main Products Section -->
    <div>
<div class="row products-row" v-if="prodList.length">
  <div class="product-col" v-for="product in prodList" 
       v-if="!product.specialevent && (!currentFilter || product.type == currentFilter)"
       :key="product._id">
    <Product :product="product" :pros="professionals" 
             :userrank="userRank" :gadgetStats="gadgetStats" 
             :realProducts="realProducts" :expandAll="expandAllStatus"
             @update-prod="updateProd" :afitPrice="afitPrice" 
             @refresh-tickets="refreshTickets"/>
  </div>
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
  <div class="modal fade" id="marketInfoModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">{{ $t('market_title') }}</h5>
        <button type="button" class="close" data-dismiss="modal">
          <span>&times;</span>
        </button>
      </div>
      <div class="modal-body">
        {{ $t('market_subtitle') }}
      </div>
    </div>
  </div>
</div>
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
<style lang="css">
:root {
  --market-bg: #ffffff;
  --sidebar-bg: #ffffff;
  --sidebar-card-bg: #ffffff;
  --sidebar-border: #e0e0e0;
  --sidebar-shadow: 0 2px 10px rgba(0,0,0,0.1);
  --sidebar-title: #e74c3c;
  --stat-item-bg: transparent;
  --stat-item-border: #e74c3c;
  --stat-item-gradient: linear-gradient(20deg, white, transparent);
  --token-title-border: 1px dashed #e74c3c;
  --market-main-bg: transparent;
  --market-sub-bg: linear-gradient(20deg, #f8f9fa, white);
  --market-sub-border: #e74c3c;
  --market-sub-text: #e74c3c;
  --filter-container-bg: linear-gradient(20deg, #f8f9fa, white);
  --filter-container-border: #e74c3c;
  --filter-label: #e74c3c;
  --filter-select-bg: white;
  --filter-select-border: #e74c3c;
  --expand-btn: #e74c3c;
  --arrow-color: #e74c3c;
}

.dark-mode {
  --market-bg: #121212;
  --sidebar-bg: rgba(0, 0, 0, 0);
  --sidebar-card-bg: rgba(30, 30, 30, 0.9);
  --sidebar-border: rgba(231, 76, 60, 0.3);
  --sidebar-shadow: 0 2px 10px rgba(0,0,0,0.3);
  --sidebar-title: #e74c3c;
  --stat-item-bg: rgba(30, 30, 30, 0.7);
  --stat-item-border: rgba(231, 76, 60, 0.7);
  --stat-item-gradient: linear-gradient(20deg, #2a2a2a, transparent);
  --token-title-border: 1px dashed #e74c3c;
  --market-main-bg: transparent;
  --market-sub-bg: linear-gradient(20deg, #2a2a2a, #1e1e1e);
  --market-sub-border: rgba(231, 76, 60, 0.7);
  --market-sub-text: #e74c3c;
  --filter-container-bg: linear-gradient(20deg, #2a2a2a, #1e1e1e);
  --filter-container-border: rgba(231, 76, 60, 0.7);
  --filter-label: #e74c3c;
  --filter-select-bg: #2a2a2a;
  --filter-select-border: rgba(231, 76, 60, 0.7);
  --expand-btn: #e74c3c;
  --arrow-color: #e74c3c;
}

.dark-mode .info-btn {
  --title-icon-color: white;  
}

:not(.dark-mode) .info-btn {
  --title-icon-color: var(--sidebar-title);  
}

.info-btn.light-mode-icon {
  color: var(--sidebar-title); 
}


.marketplace-container {
  display: flex;
  min-height: calc(100vh - 60px);
  padding-top: 60px;
  background: var(--market-bg);
  transition: background 0.3s ease;
}

.marketplace-sidebar {
  width: 95%;
  max-width: 330px;
  padding: 0 15px;
  top: 15px;
  position: relative;
  height: fit-content;
  overflow-y:visible;
  background: var(--sidebar-bg);
  transition: background 0.3s ease;
  box-sizing: border-box;
  align-self: flex-start;
}

.sidebar-card {
  background: var(--sidebar-card-bg);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: var(--sidebar-shadow);
  border: 2px solid var(--sidebar-border);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.actifit-orange-bg {
  background: var(--stat-item-gradient);
  border: 1px solid var(--stat-item-border);
}

.sidebar-title {
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--sidebar-title);
}

.dashed-divider {
  border-top: 2px dashed var(--sidebar-title);
  width: 100%;
  margin: 6px auto;
  opacity: 0.7;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.stat-value {
  font-size: clamp(1rem, 2vw, 1.2rem); 
  margin-top: 8px;
  font-weight: bold ;
}

.countdown-container {
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 5px;
}

.countdown-inline {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.countdown-inline .countdown-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.countdown-inline .countdown-amount {
  font-size: 1.2rem;
  font-weight: bold;
}

.countdown-inline .countdown-period {
  font-size: 0.7rem;
  text-transform: uppercase;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .marketplace-sidebar {
    width: 100%;
    max-width: none;
    position: static;
    height: auto;
  }
  
  .stat-item {
    min-height: 100px;
    padding: 15px;
  }
}

.stat-item {
  padding: 15px;
  border-radius: 10px;
  background: var(--stat-item-bg);
  border: 1px solid var(--stat-item-border);
  transition: all 0.3s ease;
  min-height: 120px; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px;
}

.row-sep-in {
  border: 1px solid var(--stat-item-border);
  background: var(--stat-item-gradient);
}

.token-title {
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
   font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: var(--sidebar-title)
}

.token-title i {
  font-size: 1.4rem;
  color: var(--sidebar-title);
}

.row-sep-in {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.marketplace-main {
  flex: 1;
  padding: 0 20px;
  background: var(--market-main-bg);
}

.info-btn {
  color: var(--title-icon-color, white);
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.info-btn:hover {
  color: white;
  transform: scale(1.2);
  opacity: 0.8;
}

.market-sub {
  font-style: italic;
  color: var(--market-sub-text);
  font-size: 1.1rem;
  margin-bottom: 10px;
  background: var(--market-sub-bg);
  border: 1px solid var(--market-sub-border);
  border-radius: 8px;
  padding: 10px 15px;
  margin-top: 10px;
  animation: fadeIn 0.3s ease;
  transition: all 0.3s ease;
}

.products-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
  
  > * {
    flex: 0 0 calc(33.333% - 20px);
    margin: 0 10px 20px;
  }
}

.filters-container {
  background: var(--filter-container-bg);
  border: 1px solid var(--filter-container-border);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
  box-shadow: var(--sidebar-shadow);
  transition: all 0.3s ease;
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
  
  label {
    display: block;
    margin-bottom: 5px;
    color: var(--filter-label);
    font-weight: 600;
  }
}

.filter-select {
  border: 1px solid var(--filter-select-border);
  background-color: var(--filter-select-bg);
  color: var(--card-text);
  height: 40px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
}

.countdown-inline {
  font-size: 0.9rem;
}

.info-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.market-header {
  margin-bottom: 2rem;
  margin-top: 15px;
  position: relative;
}

.market-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  position: relative;
  z-index: 2;
}

.title-highlight-container {
  margin-bottom: 1rem;
  margin-top: 15px;
}

.title-highlight-box {
   background: linear-gradient(90deg, 
              #ff0000 0%,        
              #ff4d4d 30%,      
              #ff9999 70%,      
              #ffcccc 100%) !important;  
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-mode .title-highlight-box {
   background: linear-gradient(90deg, 
              #ff0000 0%,        
              #ff4d4d 30%,      
              #ff9999 70%,      
              #ffcccc 100%) !important;    
}

.title-icon {
  font-size: 1.5rem;
  color: white;
  margin-right: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.market-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  padding: 0;
}

.title-i{
  color: rgba(231, 76, 60);
}
.info-iconn {
  color: rgba(231, 76, 60);
  position: relative;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  &:hover {
    transform: scale(1.1);
    color: var(--color-primary-dark);
  }
}

.dark-mode.info-iconn{
  color: rgba(231, 76, 60);
}
.dark-mode .market-title,
.dark-mode .title-icon {
  color: black;
}

.dark-mode .info-iconn:hover {
  background: rgba(231, 76, 60);
}

.market-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.marketplace-header-container {
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
}

.market-title-wrapper {
  display: flex;
  align-items: center;
}

.market-title-icon {
  font-size: 1.5rem;
  color: var(--sidebar-title);
  margin-right: 0.75rem;
}

le-text {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--sidebar-title);
  position: relative;
}

.market-info-btn {
  color: var(--sidebar-title);
  font-size: 1.4rem;
  transition: all 0.2s ease;
  background: none;
  border-radius: 50%;
  display: inline-flex;
}

.market-info-btn:hover {
  color: var(--accent-color);
  transform: scale(1.1);
  background: rgba(231, 76, 60, 0.1);
}

.market-header-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--sidebar-title) 0%,
    rgba(231, 76, 60, 0.3) 100%
  );
  border-radius: 3px;
}

.dark-mode .title-highlight-box {
  background: #FF0000; 
}

.dark-mode .title-icon,
.dark-mode .market-title{
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
    .marketplace-sidebar {
    position: static;
    max-width: 100%;
    padding: 0 10px;
  }
  
  .stat-item {
    min-height: 100px;
    padding: 10px;
  }
  
  .sidebar-card {
    padding: 10px;
  }

  .products-row > * {
    flex: 0 0 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-inner {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-box {
    width: 100%;
  }
  
}

</style>