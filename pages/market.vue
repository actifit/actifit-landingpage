<template>
  <div>
    <!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav">
        <li class="nav-item">
          <!-- home link -->
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu />
    </nav>

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">
      <h2 class="text-center">{{ $t('market_title') }}</h2>
	  <h5 class="text-center mb-5 market-sub">{{ $t('market_subtitle') }}</h5>
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
        </select>
	  </div>
      <!-- show listing of products -->
      <div class="row" v-if="prodList.length">
        <Product v-for="product in prodList" 
			:product="product" :key="product._id" :pros="professionals" :userrank="userRank" :gadgetStats="gadgetStats"
			v-if="!currentFilter || product.type == currentFilter"
			@update-prod="updateProd"/>
      </div>
	  <div class="text-center text-brand" v-else><i class="fas fa-spin fa-spinner"></i></div>

    </div>

    <Footer />
    <no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
  </div>
</template>

<script>
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Product from '~/components/Product'
  import Professional from '~/components/Professional'
  import Footer from '~/components/Footer'
  
  import Lodash from 'lodash'

  import { mapGetters } from 'vuex'

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
      UserMenu,
      NavbarBrand,
      Product,
	  Professional,
      Footer,
	  Lodash
    },
    data () {
      return {
		currentFilter: '',
		currentSort: JSON.stringify({value: 'price', direction: 'asc'}),
		prodList: [],
      }
    },
    computed: {
	  ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens', 'products', 'professionals', 'userRank', 'gadgetStats']),
    },
	watch: {
	  user: 'fetchUserData',
	  currentSort: 'reorderProducts',
	  products: 'setProducts',
	},
    methods: {
	  fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		  this.$store.dispatch('fetchUserGadgetStats')
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
		console.log('updateProd');
		console.log(this.prodList[ind]);
	  },
    },
    async mounted () {
	  this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  
      // fetch products
      this.$store.dispatch('fetchProducts')
	  
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
</style>