<template>
	<div>
		<NavbarBrand />

		<!-- listing -->
		<!-- listing -->
		<div class="container pt-5 mt-5 pb-5">
			<div class="christmas-banner mb-5 text-center">
				<img src="/img/actifit-christmas-event.jpg" class="img-fluid rounded shadow-lg"
					alt="Actifit Christmas Event">
				<div class="snowflakes" aria-hidden="true">
					<div class="snowflake">❅</div>
					<div class="snowflake">❆</div>
					<div class="snowflake">❅</div>
					<div class="snowflake">❆</div>
					<div class="snowflake">❅</div>
					<div class="snowflake">❆</div>
					<div class="snowflake">❅</div>
					<div class="snowflake">❆</div>
					<div class="snowflake">❅</div>
					<div class="snowflake">❆</div>
				</div>
			</div>

			<ListHeadingSection :textualDisplay="$t('market_title')" />
			<div class="text-left mb-4 text-brand market-sub">{{ $t('market_subtitle') }}</div>


			<!-- ticket prize section / gadgets purchase -->
			<div class="prize-draw-section my-5">
				<div class="container">
					<div class="text-center mb-4">
						<h2 class="prize-draw-title">{{ $t('prize_tickets_buy_gadgets') }}</h2>
						<a href="#" data-toggle="modal" data-target="#notifyModal" class="prize-draw-details-link">
							<i class="fas fa-info-circle"></i> {{ $t('view_details') }}
						</a>
					</div>
					<div class="row">
						<div class="col-lg-3 col-md-6 mb-4">
							<div class="prize-draw-card h-100">
								<div class="prize-draw-card-header">
									<i class="fas fa-ticket-alt prize-draw-icon"></i>
									<h5 class="prize-draw-card-title">{{ $t('my_tickets_collected') }}</h5>
								</div>
								<div class="prize-draw-card-body">
									<p class="prize-draw-card-text" v-if="user">{{ ticketCount }} {{ $t('tickets_collected') }}</p>
									<p class="prize-draw-card-text" v-else>-</p>
								</div>
							</div>
						</div>
						<div class="col-lg-3 col-md-6 mb-4">
							<div class="prize-draw-card h-100">
								<div class="prize-draw-card-header">
									<i class="fas fa-donate prize-draw-icon"></i>
									<h5 class="prize-draw-card-title">{{ $t('prize_pool') }}</h5>
								</div>
								<div class="prize-draw-card-body">
									<p class="prize-draw-card-text" v-if="prizePoolValue != ''">
										{{ prizePoolValue }} {{ $t('HIVE') }} <img src="/img/HIVE.png" class="token-logo-sm">
									</p>
									<p class="prize-draw-card-text" v-else><i class="fas fa-spin fa-spinner"></i></p>
								</div>
							</div>
						</div>
						<div class="col-lg-3 col-md-6 mb-4">
							<div class="prize-draw-card h-100">
								<div class="prize-draw-card-header">
									<i class="far fa-clock prize-draw-icon"></i>
									<h5 class="prize-draw-card-title">{{ $t('next_draw') }}</h5>
								</div>
								<div class="prize-draw-card-body">
									<Countdown v-if="countDownReady && nextGadgetBuyRewardDate" :deadline="nextGadgetBuyRewardDate" class="prize-draw-countdown"></Countdown>
									<p class="prize-draw-card-text" v-else><i class="fas fa-spin fa-spinner"></i></p>
								</div>
							</div>
						</div>
						<div class="col-lg-3 col-md-6 mb-4">
							<div class="prize-draw-card h-100">
								<div class="prize-draw-card-header">
									<i class="fas fa-trophy prize-draw-icon"></i>
									<h5 class="prize-draw-card-title">{{ $t('Recent_draw_winner') }}</h5>
								</div>
								<div class="prize-draw-card-body">
									<a :href="'/' + lastDrawWinner" class="prize-draw-winner-link">@{{ lastDrawWinner }}</a>
									<p class="prize-draw-card-text">{{ wonAmount }} {{ $t('HIVE') }} <img src="/img/HIVE.png" class="token-logo-sm"></p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>


			<!-- allow sorting & filtering products -->
			<div class="row col-md-12" v-if="prodList.length">
				<span class="col-md-5"></span>
				<select v-model="currentSort" class="form-control col-md-3 sel-adj">
					<option value="">-- {{ $t('Sort_By') }} --</option>
					<option :value="JSON.stringify({ value: 'name', direction: 'asc' })">{{ $t('Name') }}▲</option>
					<option :value="JSON.stringify({ value: 'name', direction: 'desc' })">{{ $t('Name') }}▼</option>
					<!--<option :value="JSON.stringify({value: 'type', direction: 'asc'})">{{$t('Type')}}▲</option>
			<option :value="JSON.stringify({value: 'type', direction: 'desc'})">{{$t('Type')}}▼</option>-->
					<option :value="JSON.stringify({ value: 'level', direction: 'asc' })">{{ $t('Level') }}▲</option>
					<option :value="JSON.stringify({ value: 'level', direction: 'desc' })">{{ $t('Level') }}▼</option>
					<option :value="JSON.stringify({ value: 'price', direction: 'asc' })">{{ $t('Price') }}▲</option>
					<option :value="JSON.stringify({ value: 'price', direction: 'desc' })">{{ $t('Price') }}▼</option>
					<option :value="JSON.stringify({ value: 'reqtsFilled', direction: 'desc' })">{{ $t('Ready') }}▲
					</option>
					<option :value="JSON.stringify({ value: 'reqtsFilled', direction: 'asc' })">{{ $t('Ready') }}▼
					</option>
					<option :value="JSON.stringify({ value: 'bought', direction: 'asc' })">{{ $t('Bought') }}▲</option>
					<option :value="JSON.stringify({ value: 'bought', direction: 'desc' })">{{ $t('Bought') }}▼</option>
				</select>
				<!--<span class="col-md-3">{{$t('Filter_By')}}:</span>-->
				&nbsp;
				<select v-model="currentFilter" class="form-control col-md-3 sel-adj">
					<option value="">-- {{ $t('Filter_By') }} --</option>
					<option value="">{{ $t('All') }}</option>
					<option value="ingame">{{ $t('Game') }}</option>
					<option value="service">{{ $t('Consultation') }}</option>
					<option value="ebook">{{ $t('Ebook') }}</option>
					<option value="real">{{ $t('Physical_Products') }}</option>
				</select>

				<div class="row expansion-arrow-all">
					<a class="arrow-icon" v-on:click="expandAllSwitchStatus" :class="expandAllStatus"
						:title="expandAllStatusText">
						<span class="left-bar"></span>
						<span class="right-bar"></span>
					</a>
				</div>
			</div>

			<!-- show listing of special event products -->




			<div class="christmas-section p-4 my-5 rounded">
				<h5 class="text-center pt-3 market-sub christmas-title mb-4">🎄 {{ $t('special_christmas_event') }} 🎁
				</h5>

				<div class="row justify-content-center" v-if="prodList.length">
					<Product v-for="product in prodList" :key="product._id" :product="product" :pros="professionals"
						:userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts"
						:expandAll="expandAllStatus" v-if="product.specialevent && product.event == 'Christmas'"
						@update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets" />
				</div>
			</div>
			<br />




			<!-- show listing of products -->
			<div class="row" v-if="prodList.length">
				<Product v-for="product in prodList" :key="product._id" :product="product" :pros="professionals"
					:userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts"
					:expandAll="expandAllStatus"
					v-if="!product.specialevent && (!currentFilter || product.type == currentFilter)"
					@update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets" />

			</div>
			<div class="text-center text-brand" v-else><i class="fas fa-spin fa-spinner fa-3x"></i></div>

		</div>

		<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('weekly_pay_prize_desc')" />



		<CartModal id="cartModal" ref="cartModal" :afitPrice="afitPrice" @refresh-tickets-multi="refreshTickets" />
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
import CartModal from '~/components/CartModal'
import ListHeadingSection from '~/components/ListHeadingSection.vue'

export default {
	head() {
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
		CartModal,
		ListHeadingSection
	},
	data() {
		return {
			currentFilter: '',
			currentSort: JSON.stringify({ value: 'price', direction: 'asc' }),
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
		numberFormat(number, precision) {
			return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
		},
		expandAllSwitchStatus() {
			if (this.expandAllStatus == '') {
				this.expandAllStatus = 'open';
				this.expandAllStatusText = 'Collapse All';
			} else {
				this.expandAllStatus = '';
				this.expandAllStatusText = 'Expand All';
			}
		},
		refreshTickets() {
			//console.log('>>>>refreshing');
			this.fetchUserBuyTicketEntries();
			this.fetchPrizePool();
		},
		fetchUserData() {
			if (typeof this.user != 'undefined' && this.user != null) {
				this.$store.dispatch('fetchUserTokens')
				this.$store.dispatch('fetchUserRank')
				this.$store.dispatch('fetchReferrals')
				this.$store.dispatch('fetchUserGadgetStats')
				let accToken = localStorage.getItem('access_token')
				this.$store.dispatch('fetchUserBoughtRealProducts', accToken)
				this.fetchUserBuyTicketEntries();
			}
		},
		reorderProducts() {
			try {
				//console.log(this.currentSort);
				let sortApproach = JSON.parse(this.currentSort);
				//console.log(sortApproach.value);
				if (sortApproach.value) {
					console.log(sortApproach.value);
					if (sortApproach.value == 'price') {
						this.prodList = _.orderBy(this.prodList, function (e) { return e.price[0].price }, [sortApproach.direction]);
					} else {
						this.prodList = _.orderBy(this.prodList, [sortApproach.value], [sortApproach.direction]);
					}
					this.$forceUpdate();
				}
			} catch (err) {
				console.log(err);
			}
		},
		setProducts() {
			this.prodList = this.products;
			this.reorderProducts();
		},
		updateProd(prod) {
			let ind = this.prodList.findIndex(product => (product._id === prod._id));
			this.prodList[ind] = prod;
			this.$forceUpdate();
			//console.log('updateProd');
			//console.log(this.prodList[ind]);
		},
		setAFITPrice(_afitPrice) {
			this.afitPrice = _afitPrice;
			console.log(this.afitPrice);
		},
		async fetchAfitPrice() {
			//fetch AFIT price
			fetch(process.env.actiAppUrl + 'exchangeAFITPrice').then(
				res => {
					res.json().then(json => this.setAFITPrice(json)).catch(e => reject(e))
				}).catch(e => reject(e))
		},
		setTicketCount(result) {
			if (Array.isArray(result) && result.length > 0) {
				this.ticketCount = result[0].tickets_collected;
			} else {
				this.ticketCount = 0;
			}
		},
		async fetchUserBuyTicketEntries() {
			//fetch user ticket entries
			if (this.user && this.user.account) {
				fetch(process.env.actiAppUrl + 'userActiveGadgetBuyTickets/' + this.user.account.name).then(
					res => {
						res.json().then(json => this.setTicketCount(json)).catch(e => reject(e))
					}).catch(e => reject(e))
			}
		},
		async fetchPrizePool() {
			let _parent = this;
			hive.api.getAccounts([process.env.actifitMarketBuy], function (err, response) {
				//console.log(err, response);
				if (!err) {
					_parent.prizePool = response[0].balance;
					_parent.prizePoolValue = _parent.numberFormat(parseFloat(_parent.prizePool.split(' ')[0]) / 2, 3);
				}
			});
		},
		async prepareData() {
			this.fetchAfitPrice();

			this.fetchUserBuyTicketEntries();

			this.fetchPrizePool();
		},

		setNextPrizeDate(json) {
			console.log('setNextPrizeDate');
			console.log(json);
			let targetDate = new Date(json.nextDrawDate);
			let mnth = targetDate.getMonth() + 1;
			if (mnth < 10) {
				mnth = '0' + mnth;
			}
			this.nextGadgetBuyRewardDate = targetDate.getFullYear() + '-' + mnth + '-' + targetDate.getDate() + ' 00:00 GMT';
			console.log('nextGadgetBuyRewardDate');
			console.log(this.nextGadgetBuyRewardDate);

			//also set last draw winner display
			this.lastDrawWinner = json.winner[0].name;
			this.wonAmount = this.numberFormat(json.winner[0].reward, 3);
		},

		async fetchGadgetPrizeCycle() {
			fetch(process.env.actiAppUrl + 'recentGadgetBuyPrizeCycle/').then(
				res => {
					res.json().then(json => this.setNextPrizeDate(json)).catch(e => reject(e))
				}).catch(e => reject(e))

		}

	},

	async mounted() {
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
.market-sub {
	font-style: italic;
}

.selcls {
	padding: 9px;
	border: solid 1px #517B97;
	outline: 0;
	background: -webkit-gradient(linear, left top, left 25, from(#FFFFFF), color-stop(4%, #CAD9E3), to(#FFFFFF));
	background: -moz-linear-gradient(top, #FFFFFF, #CAD9E3 1px, #FFFFFF 25px);
	box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 8px;
	-moz-box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 8px;
	-webkit-box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 8px;
}

.sel-adj {
	margin-bottom: 3px;
}

.notice-text {
	font-size: x-large;
}

.no-bullets {
	list-style: none;
}

.text-success {
	padding-right: 2px;
}

.row-sep-in {
	border: 1px solid orange;
	background: linear-gradient(20deg, orange, transparent);
}

.row-sep-in h5,
.row-sep-in .token-title {
	border-bottom: 1px dashed red;
	height: 40px;
}

.left-bar:after,
.right-bar:after {
	animation: blink 3s infinite;
	/*20 alternate;*/
}

@keyframes blink {

	0%,
	50%,
	100% {
		background-color: pink;
	}

	25%,
	75% {
		background-color: red;
	}
}

.expansion-arrow-all {
	display: contents;
}

.book-button {
	box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

/* Christmas Theme Styling */
.christmas-banner {
	position: relative;
	overflow: hidden;
}

.christmas-section {
	background: linear-gradient(135deg, #1a4c33 0%, #0d2b1d 100%);
	border: 3px solid #c41e3a;
	box-shadow: 0 0 20px rgba(196, 30, 58, 0.5);
	position: relative;
}

.christmas-title {
	color: #fff !important;
	font-size: 2rem !important;
	text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	font-family: 'Brush Script MT', cursive, sans-serif;
}

/* Snowflake Animation */
.snowflakes {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 1;
}

.snowflake {
	color: #fff;
	font-size: 1.5rem;
	font-family: Arial, sans-serif;
	text-shadow: 0 0 5px #000;
	position: absolute;
	top: -10%;
	z-index: 9999;
	user-select: none;
	cursor: default;
	animation-name: snowflakes-fall, snowflakes-shake;
	animation-duration: 10s, 3s;
	animation-timing-function: linear, ease-in-out;
	animation-iteration-count: infinite, infinite;
	animation-play-state: running, running;
}

.snowflake:nth-of-type(0) {
	left: 1%;
	animation-delay: 0s, 0s
}

.snowflake:nth-of-type(1) {
	left: 10%;
	animation-delay: 1s, 1s
}

.snowflake:nth-of-type(2) {
	left: 20%;
	animation-delay: 6s, .5s
}

.snowflake:nth-of-type(3) {
	left: 30%;
	animation-delay: 4s, 2s
}

.snowflake:nth-of-type(4) {
	left: 40%;
	animation-delay: 2s, 2s
}

.snowflake:nth-of-type(5) {
	left: 50%;
	animation-delay: 8s, 3s
}

.snowflake:nth-of-type(6) {
	left: 60%;
	animation-delay: 6s, 2s
}

.snowflake:nth-of-type(7) {
	left: 70%;
	animation-delay: 2.5s, 1s
}

.snowflake:nth-of-type(8) {
	left: 80%;
	animation-delay: 1s, 0s
}

.snowflake:nth-of-type(9) {
	left: 90%;
	animation-delay: 3s, 1.5s
}

@keyframes snowflakes-fall {
	0% {
		top: -10%
	}

	100% {
		top: 100%
	}
}

@keyframes snowflakes-shake {

	0%,
	100% {
		transform: translateX(0)
	}

	50% {
		transform: translateX(80px)
	}
}
/* Prize Draw Section */
.prize-draw-section {
	background: linear-gradient(135deg, #ff112d 0%, #d6001a 100%);
	border-radius: 15px;
	padding: 40px 0;
	color: white;
	box-shadow: 0 10px 30px rgba(0,0,0,0.1);
	transition: background 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.prize-draw-title {
	font-size: 2.5rem;
	font-weight: 700;
	margin-bottom: 10px;
	color: white;
}

.prize-draw-details-link {
	color: white;
	text-decoration: none;
	font-size: 1.1rem;
	transition: all 0.3s ease;
}

.prize-draw-details-link:hover {
	text-decoration: underline;
	color: #eee;
}

.prize-draw-card {
	background-color: rgba(255, 255, 255, 0.1);
	border: none;
	border-radius: 10px;
	text-align: center;
	padding: 20px;
	transition: all 0.3s ease;
}

.prize-draw-card:hover {
	transform: translateY(-5px);
	background-color: rgba(255, 255, 255, 0.2);
}

.prize-draw-card-header {
	border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 15px;
    margin-bottom: 15px;
}

.prize-draw-icon {
	font-size: 2.5rem;
	margin-bottom: 15px;
	display: block;
	color: white;
}

.prize-draw-card-title {
	font-size: 1.2rem;
	font-weight: 600;
	margin-bottom: 0;
	color: white;
}

.prize-draw-card-body .prize-draw-card-text {
	font-size: 1.2rem;
	font-weight: 500;
	margin-bottom: 0;
	color: white;
}

.prize-draw-card-body .token-logo-sm {
	height: 20px;
	vertical-align: middle;
	margin-left: 5px;
}

.prize-draw-countdown {
	font-size: 1.2rem;
	font-weight: 500;
	color: white;
}

.prize-draw-winner-link {
	display: block;
	font-size: 1.2rem;
	font-weight: 600;
	color: white;
	margin-bottom: 5px;
	text-decoration: none;
}

.prize-draw-winner-link:hover {
	text-decoration: underline;
	color: #eee;
}

/* Dark Mode styles for Prize Draw Section */
.dark-mode .prize-draw-section {
	background: linear-gradient(135deg, #2b0005 0%, #4e0009 100%);
	box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.dark-mode .prize-draw-card {
	background-color: rgba(0, 0, 0, 0.2);
	border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .prize-draw-card:hover {
	background-color: rgba(0, 0, 0, 0.3);
}

.dark-mode .prize-draw-card-header {
	border-bottom: 1px solid rgba(255,255,255,0.1);
}

.dark-mode .prize-draw-title,
.dark-mode .prize-draw-details-link,
.dark-mode .prize-draw-icon,
.dark-mode .prize-draw-card-title,
.dark-mode .prize-draw-card-body .prize-draw-card-text,
.dark-mode .prize-draw-countdown,
.dark-mode .prize-draw-winner-link {
	color: #f8f9fa;
}

.dark-mode .prize-draw-details-link:hover,
.dark-mode .prize-draw-winner-link:hover {
	color: #ccc;
}
</style>
