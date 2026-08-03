<template>
	<div class="market-page">
		<NavbarBrand />

		<div class="container pt-5 mt-5 pb-5">

			<!-- page intro -->
			<div class="market-hero mb-5">
				<ListHeadingSection :textualDisplay="$t('market_title')" />
				<p class="market-sub mb-0">{{ $t('market_subtitle') }}</p>
			</div>

			<!-- ticket prize section / gadgets purchase -->
			<section class="prize-draw-section my-5">
				<div class="container">
					<div class="prize-draw-header mb-4">
						<h2 class="prize-draw-title mb-1">{{ $t('prize_tickets_buy_gadgets') }}</h2>
						<a href="#" data-toggle="modal" data-target="#notifyModal" class="prize-draw-details-link">
							<i class="fas fa-info-circle"></i> {{ $t('view_details') }}
						</a>
					</div>
					<div class="prize-draw-grid">
						<div class="prize-draw-card">
							<i class="fas fa-ticket-alt prize-draw-icon"></i>
							<h5 class="prize-draw-card-title">{{ $t('my_tickets_collected') }}</h5>
							<p class="prize-draw-card-text" v-if="user">{{ ticketCount }} {{ $t('tickets_collected') }}</p>
							<p class="prize-draw-card-text" v-else>-</p>
						</div>

						<div class="prize-draw-card">
							<i class="fas fa-donate prize-draw-icon"></i>
							<h5 class="prize-draw-card-title">{{ $t('prize_pool') }}</h5>
							<p class="prize-draw-card-text" v-if="prizePoolValue != ''">
								{{ prizePoolValue }} {{ $t('HIVE') }} <img src="/img/HIVE.png" class="token-logo-sm" alt="">
							</p>
							<p class="prize-draw-card-text" v-else><i class="fas fa-spin fa-spinner"></i></p>
						</div>

						<div class="prize-draw-card">
							<i class="far fa-clock prize-draw-icon"></i>
							<h5 class="prize-draw-card-title">{{ $t('next_draw') }}</h5>
							<Countdown v-if="countDownReady && nextGadgetBuyRewardDate" :deadline="nextGadgetBuyRewardDate" class="prize-draw-countdown"></Countdown>
							<p class="prize-draw-card-text" v-else><i class="fas fa-spin fa-spinner"></i></p>
						</div>

						<div class="prize-draw-card">
							<i class="fas fa-trophy prize-draw-icon"></i>
							<h5 class="prize-draw-card-title">{{ $t('Recent_draw_winner') }}</h5>
							<a :href="'/' + lastDrawWinner" class="prize-draw-winner-link">@{{ lastDrawWinner }}</a>
							<p class="prize-draw-card-text">{{ wonAmount }} {{ $t('HIVE') }} <img src="/img/HIVE.png" class="token-logo-sm" alt=""></p>
						</div>
					</div>
				</div>
			</section>

			<!-- toolbar: category filter (left), sort (right) -->
			<div class="market-toolbar mb-4" v-if="prodList.length">
				<div class="market-toolbar-row">
					<div class="filter-pills" role="group" :aria-label="$t('Filter_By')">
						<button type="button" class="filter-pill" v-for="opt in filterOptions" :key="opt.value"
							:class="{ active: currentFilter === opt.value }" @click="currentFilter = opt.value">
							{{ $t(opt.labelKey) }}
						</button>
					</div>

					<div class="toolbar-controls">
						<label class="sort-label" for="marketSort">{{ $t('Sort_By') }}</label>
						<select id="marketSort" v-model="currentSort" class="form-control sort-select">
							<option :value="JSON.stringify({ value: 'name', direction: 'asc' })">{{ $t('Name') }}▲</option>
							<option :value="JSON.stringify({ value: 'name', direction: 'desc' })">{{ $t('Name') }}▼</option>
							<option :value="JSON.stringify({ value: 'level', direction: 'asc' })">{{ $t('Level') }}▲</option>
							<option :value="JSON.stringify({ value: 'level', direction: 'desc' })">{{ $t('Level') }}▼</option>
							<option :value="JSON.stringify({ value: 'price', direction: 'asc' })">{{ $t('Price') }}▲</option>
							<option :value="JSON.stringify({ value: 'price', direction: 'desc' })">{{ $t('Price') }}▼</option>
							<option :value="JSON.stringify({ value: 'reqtsFilled', direction: 'desc' })">{{ $t('Ready') }}▲</option>
							<option :value="JSON.stringify({ value: 'reqtsFilled', direction: 'asc' })">{{ $t('Ready') }}▼</option>
							<option :value="JSON.stringify({ value: 'bought', direction: 'asc' })">{{ $t('Bought') }}▲</option>
							<option :value="JSON.stringify({ value: 'bought', direction: 'desc' })">{{ $t('Bought') }}▼</option>
						</select>
					</div>
				</div>

				<div class="market-results-count">
					{{ filteredProducts.length }} {{ $t('Products') }}
				</div>
			</div>

			<!-- show listing of special event products -->
			<!--
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
			-->

			<!-- two-panel market: product list (left) + product detail (right) -->
			<div class="market-layout" v-if="filteredProducts.length">

				<!-- LEFT: browsable product list, grouped by category -->
				<aside class="market-sidebar" :class="{ 'mobile-hidden': mobileShowDetail }">
					<div class="sidebar-scroll">
						<div class="sidebar-group" v-for="group in groupedProducts" :key="group.type">
							<div class="sidebar-group-title">{{ $t(group.labelKey) }}</div>

							<button type="button" class="sidebar-row" v-for="product in group.items" :key="product._id"
								:class="{ active: selectedProductId === product._id }" @click="selectProduct(product)">
								<span class="sidebar-row-thumb" :style="'background-image:url(' + rowImage(product) + ');'"></span>

								<span class="sidebar-row-main">
									<span class="sidebar-row-name">{{ product.name }}</span>
									<span class="sidebar-row-level" v-if="product.level">{{ $t('level_short') }}{{ product.level }}</span>
								</span>

								<span class="sidebar-row-side">
									<span class="sidebar-row-price">
										<span class="sidebar-row-price-afit">{{ numberFormat(rowAfitPrice(product), 2) }}</span>
										<span class="sidebar-row-price-afit-unit">AFIT</span>
										<span class="sidebar-row-price-hive" v-if="rowHivePrice(product) !== null">
											≈{{ numberFormat(rowHivePrice(product), 3) }} {{ $t('HIVE') }}
											<img src="/img/HIVE.png" class="token-logo-xs" alt="">
										</span>
									</span>
									<span class="sidebar-row-status" :class="'status-dot-' + (statusDot(product) || 'none')"
										:title="statusLabel(product)"></span>
								</span>
							</button>
						</div>
					</div>
				</aside>

				<!-- RIGHT: full product detail, reusing the existing Product component so all
					 buy / bought / activate functionality stays 100% intact -->
				<section class="market-detail-panel" :class="{ 'mobile-hidden': !mobileShowDetail }">
					<button type="button" class="detail-back-btn" @click="backToList">
						<i class="fas fa-arrow-left"></i> {{ $t('All') }}
					</button>

					<div class="detail-panel-inner" v-if="selectedProduct">
						<Product :key="selectedProduct._id" :product="selectedProduct" :pros="professionals"
							:userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts"
							:expandAll="expandAllStatus" @update-prod="updateProd" :afitPrice="afitPrice"
							@refresh-tickets="refreshTickets" />
					</div>
					<div class="detail-empty text-center" v-else>
						<i class="fas fa-hand-pointer detail-empty-icon"></i>
						<p class="detail-empty-text">{{ $t('market_subtitle') }}</p>
					</div>
				</section>
			</div>

			<!-- loading state -->
			<div class="text-center text-brand market-loading" v-else-if="!prodList.length">
				<i class="fas fa-spin fa-spinner fa-3x"></i>
			</div>

			<!-- empty state: filter matches nothing -->
			<div class="market-empty text-center" v-else>
				<i class="fas fa-box-open market-empty-icon"></i>
				<p class="market-empty-text">{{ $t('no_products_found') }}</p>
				<button type="button" class="btn btn-brand" @click="currentFilter = ''">{{ $t('All') }}</button>
			</div>

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
				{ hid: 'description', name: 'description', content: `Browse the Actifit Market — spend AFIT tokens on fitness consultations, ebooks, supplements, and booster gadgets. Health products powered by blockchain rewards.` },
				{ hid: 'ogdescription', name: 'og:description', property: 'og:description', content: `Browse the Actifit Market — spend AFIT tokens on fitness consultations, ebooks, supplements, and booster gadgets.` },
				{ hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'Actifit Market - Actifit.io' }
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
			// used to drive the single Product detail panel open automatically
			// whenever a new item is selected from the list (re-uses Product.vue's
			// existing expandAll watcher, no changes needed there)
			expandAllStatus: '',
			selectedProductId: null,
			mobileShowDetail: false,
			filterOptions: [
				{ value: '', labelKey: 'All' },
				{ value: 'ingame', labelKey: 'Game' },
				{ value: 'service', labelKey: 'Consultation' },
				{ value: 'ebook', labelKey: 'Ebook' },
				{ value: 'real', labelKey: 'Physical_Products' }
			],
		}
	},
	computed: {
		...mapGetters('steemconnect', ['user']),
		...mapGetters(['userTokens', 'products', 'professionals', 'userRank', 'gadgetStats', 'realProducts']),
		filteredProducts() {
			return this.prodList.filter(product => !product.specialevent && (!this.currentFilter || product.type == this.currentFilter));
		},
		/* groups the currently filtered products by type, in a fixed order, for the
		   left-hand sidebar list (mirrors the categories used in filterOptions) */
		groupedProducts() {
			const groupDefs = [
				{ type: 'ingame', labelKey: 'Game' },
				{ type: 'service', labelKey: 'Consultation' },
				{ type: 'ebook', labelKey: 'Ebook' },
				{ type: 'real', labelKey: 'Physical_Products' }
			];
			return groupDefs
				.map(def => ({ type: def.type, labelKey: def.labelKey, items: this.filteredProducts.filter(p => p.type === def.type) }))
				.filter(group => group.items.length > 0);
		},
		selectedProduct() {
			if (!this.selectedProductId) {
				return null;
			}
			return this.filteredProducts.find(product => product._id === this.selectedProductId) || null;
		}
	},
	watch: {
		user: 'fetchUserData',
		currentSort: 'reorderProducts',
		products: 'setProducts',
		currentFilter: 'ensureSelection',
		selectedProductId(newVal) {
			if (!newVal) {
				return;
			}
			// force Product.vue's own expandAll watcher to fire so the freshly
			// selected item's details are always shown open in the detail panel
			this.expandAllStatus = '';
			this.$nextTick(() => {
				this.expandAllStatus = 'open';
			});
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
		numberFormat(number, precision) {
			return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
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
			this.ensureSelection();
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

		},

		/* ---- two-panel layout helpers ---- */

		/** picks a product to show in the right-hand detail panel */
		selectProduct(product) {
			this.selectedProductId = product._id;
			this.mobileShowDetail = true;
		},

		/** mobile-only: return from the detail panel to the browsable list */
		backToList() {
			this.mobileShowDetail = false;
		},

		/** keeps the selection valid whenever the filtered list changes
		 *  (e.g. category filter switches, or the previously selected item
		 *  no longer matches) - defaults to the first item in the new list */
		ensureSelection() {
			if (!this.filteredProducts.length) {
				this.selectedProductId = null;
				return;
			}
			const stillVisible = this.filteredProducts.some(product => product._id === this.selectedProductId);
			if (!stillVisible) {
				this.selectedProductId = this.filteredProducts[0]._id;
			}
		},

		/** AFIT list price, same value used for sorting by price */
		rowAfitPrice(product) {
			if (product && Array.isArray(product.price) && product.price.length) {
				return product.price[0].price;
			}
			return 0;
		},

		/** equivalent HIVE price, same conversion Product.vue uses for its Buy-with-HIVE button */
		rowHivePrice(product) {
			if (this.afitPrice && this.afitPrice.afitHiveLastPrice) {
				return this.rowAfitPrice(product) * this.afitPrice.afitHiveLastPrice;
			}
			return null;
		},

		/** thumbnail for a sidebar row: gadget/real product image, or provider avatar for
		 *  ebooks/consultations (mirrors Product.vue's own updateProPic logic) */
		rowImage(product) {
			if (product.type == 'ingame' || product.type == 'real') {
				if (product.image && product.image.startsWith('http')) {
					return product.image;
				}
				return '/img/gadgets/' + product.image;
			}
			if (Array.isArray(this.professionals)) {
				const pro = this.professionals.find(p => p.username == product.provider);
				if (pro && pro.pic) {
					return pro.pic;
				}
			}
			let profImgUrl = process.env.hiveImgUrl;
			const curBchain = (typeof localStorage !== 'undefined' && localStorage.getItem('cur_bchain')) ? localStorage.getItem('cur_bchain') : 'HIVE';
			if (curBchain == 'STEEM') {
				profImgUrl = process.env.steemImgUrl;
			}
			return profImgUrl + '/u/' + product.provider + '/avatar';
		},

		/** quick-glance status dot for a sidebar row: active / owned / available */
		statusDot(product) {
			if (!this.user) {
				return '';
			}
			if (product.type == 'ingame' && Array.isArray(this.gadgetStats)) {
				const active = this.gadgetStats.find(entry => (entry._id.gadget === product._id && entry._id.status == 'active'));
				if (active && active.count > 0) {
					return 'active';
				}
				const consumed = this.gadgetStats.find(entry => (entry._id.gadget === product._id && entry._id.status == 'consumed'));
				if (consumed && consumed.count > 0) {
					return 'owned';
				}
			}
			if (product.type == 'real' && Array.isArray(this.realProducts)) {
				const owned = this.realProducts.find(entry => entry.gadget === product._id);
				if (owned) {
					return 'owned';
				}
			}
			return '';
		},

		statusLabel(product) {
			const status = this.statusDot(product);
			if (status == 'active') {
				return this.$t('Active');
			}
			if (status == 'owned') {
				return this.$t('Bought');
			}
			return this.$t('Available');
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
.market-hero {
	text-align: left;
}

.market-sub {
	font-style: italic;
	opacity: .85;
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

.book-button {
	box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
}

/* Christmas Theme Styling (kept for when the event section is re-enabled) */
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

.snowflake:nth-of-type(0) { left: 1%; animation-delay: 0s, 0s }
.snowflake:nth-of-type(1) { left: 10%; animation-delay: 1s, 1s }
.snowflake:nth-of-type(2) { left: 20%; animation-delay: 6s, .5s }
.snowflake:nth-of-type(3) { left: 30%; animation-delay: 4s, 2s }
.snowflake:nth-of-type(4) { left: 40%; animation-delay: 2s, 2s }
.snowflake:nth-of-type(5) { left: 50%; animation-delay: 8s, 3s }
.snowflake:nth-of-type(6) { left: 60%; animation-delay: 6s, 2s }
.snowflake:nth-of-type(7) { left: 70%; animation-delay: 2.5s, 1s }
.snowflake:nth-of-type(8) { left: 80%; animation-delay: 1s, 0s }
.snowflake:nth-of-type(9) { left: 90%; animation-delay: 3s, 1.5s }

@keyframes snowflakes-fall {
	0% { top: -10% }
	100% { top: 100% }
}

@keyframes snowflakes-shake {
	0%, 100% { transform: translateX(0) }
	50% { transform: translateX(80px) }
}

/* Prize Draw Section */
.prize-draw-section {
	background: linear-gradient(135deg, #ff112d 0%, #d6001a 100%);
	border-radius: 15px;
	padding: 40px 32px;
	color: white;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	transition: background 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.prize-draw-header {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	justify-content: space-between;
	gap: 8px;
}

.prize-draw-title {
	font-size: 2rem;
	font-weight: 700;
	margin-bottom: 0;
	color: white;
}

.prize-draw-details-link {
	color: white;
	text-decoration: none;
	font-size: 1rem;
	white-space: nowrap;
	transition: all 0.3s ease;
}

.prize-draw-details-link:hover {
	text-decoration: underline;
	color: #eee;
}

.prize-draw-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
}

@media (max-width: 991px) {
	.prize-draw-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 575px) {
	.prize-draw-grid {
		grid-template-columns: 1fr;
	}
}

.prize-draw-card {
	background: linear-gradient(180deg, rgba(255, 182, 205, 0.28) 0%, rgba(255, 92, 132, 0.18) 100%);
	border: none;
	border-radius: 10px;
	text-align: center;
	padding: 22px 16px;
	transition: all 0.25s ease;
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 10px 24px rgba(90, 0, 22, 0.18);
}

.prize-draw-card:hover {
	transform: translateY(-4px);
	background: linear-gradient(180deg, rgba(255, 198, 216, 0.34) 0%, rgba(255, 110, 146, 0.24) 100%);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 14px 28px rgba(90, 0, 22, 0.22);
}

.prize-draw-icon {
	font-size: 2rem;
	margin-bottom: 10px;
	display: block;
	color: white;
}

.prize-draw-card-title {
	font-size: 1.05rem;
	font-weight: 600;
	margin-bottom: 8px;
	color: white;
}

.prize-draw-card-text {
	font-size: 1.1rem;
	font-weight: 500;
	margin-bottom: 0;
	color: white;
}

.prize-draw-card-text .token-logo-sm,
.token-logo-sm {
	height: 18px;
	vertical-align: middle;
	margin-left: 5px;
}

.prize-draw-card .token-logo-sm {
	display: inline-block;
	background: rgba(255, 255, 255, 0.88);
	border-radius: 50%;
	padding: 3px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
	filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.85));
}

.prize-draw-countdown {
	font-size: 1.1rem;
	font-weight: 500;
	color: white;
}

.prize-draw-winner-link {
	display: block;
	font-size: 1.1rem;
	font-weight: 600;
	color: white;
	margin-bottom: 4px;
	text-decoration: none;
}

.prize-draw-winner-link:hover {
	text-decoration: underline;
	color: #eee;
}


.dark-mode .prize-draw-details-link:hover,
.dark-mode .prize-draw-winner-link:hover {
	color: #ccc;
}

/* Toolbar: filter pills + sort */
.market-toolbar {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.market-toolbar-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
}

.filter-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.filter-pill {
	border: 1px solid #d6dde3;
	background: #fff;
	color: #45525c;
	border-radius: 999px;
	padding: 7px 16px;
	font-size: 0.9rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
}

.filter-pill:hover {
	border-color: #ff112d;
	color: #ff112d;
}

.filter-pill.active {
	background: #ff112d;
	border-color: #ff112d;
	color: #fff;
}

.dark-mode .filter-pill {
	background: transparent;
	border-color: #4a4a4a;
	color: #ddd;
}

.dark-mode .filter-pill.active {
	background: #ff112d;
	border-color: #ff112d;
	color: #fff;
}

.toolbar-controls {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
}

.sort-label {
	margin-bottom: 0;
	font-size: 0.9rem;
	white-space: nowrap;
}

.sort-select {
	width: auto;
	min-width: 170px;
}

.market-results-count {
	font-size: 0.85rem;
	opacity: .7;
}

.market-loading,
.market-empty {
	padding: 60px 0;
}

.market-empty-icon {
	font-size: 2.5rem;
	opacity: .4;
	margin-bottom: 12px;
	display: block;
}

.market-empty-text {
	opacity: .7;
	margin-bottom: 16px;
}

.market-empty .btn-brand {
	background: #ff112d;
	color: #fff;
	border: none;
	border-radius: 6px;
	padding: 8px 20px;
}

.market-empty .btn-brand:hover {
	background: #d6001a;
	color: #fff;
}

/* =========================================================
   Two-panel market layout (Gmail / Spotify style)
   ========================================================= */
.market-layout {
	display: grid;
	grid-template-columns: 340px 1fr;
	gap: 20px;
	align-items: start;
	background: #fff;
	border: 1px solid #e3e8ec;
	border-radius: 14px;
	overflow: hidden;
	box-shadow: 0 6px 24px rgba(23, 30, 38, 0.06);
}

/* -- left: sidebar list -- */
.market-sidebar {
	border-right: 1px solid #e3e8ec;
	max-height: 78vh;
	overflow: hidden;
}

.sidebar-scroll {
	max-height: 78vh;
	overflow-y: auto;
	padding: 8px 0 16px;
}

.sidebar-group-title {
	font-size: 0.72rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: #98a4ad;
	padding: 16px 18px 8px;
}

.sidebar-row {
	display: flex;
	align-items: center;
	width: 100%;
	gap: 12px;
	padding: 10px 18px;
	border: none;
	border-left: 3px solid transparent;
	background: transparent;
	text-align: left;
	cursor: pointer;
	transition: background 0.15s ease, border-color 0.15s ease;
}

.sidebar-row:hover {
	background: rgba(255, 17, 45, 0.05);
}

.sidebar-row.active {
	background: rgba(255, 17, 45, 0.09);
	border-left-color: #ff112d;
}

.sidebar-row-thumb {
	flex: 0 0 44px;
	width: 44px;
	height: 44px;
	border-radius: 10px;
	background-color: #f1f3f5;
	background-size: cover;
	background-position: center;
	box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}

.sidebar-row-main {
	flex: 1 1 auto;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.sidebar-row-name {
	font-size: 0.92rem;
	font-weight: 600;
	color: #263138;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sidebar-row-level {
	font-size: 0.72rem;
	font-weight: 600;
	color: #ff112d;
	width: fit-content;
}

.sidebar-row-side {
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	gap: 10px;
}

.sidebar-row-price {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	line-height: 1.15;
}

.sidebar-row-price-afit {
	font-size: 0.98rem;
	font-weight: 700;
	color: #263138;
}

.sidebar-row-price-afit-unit {
	font-size: 0.62rem;
	font-weight: 600;
	letter-spacing: 0.04em;
	color: #98a4ad;
	text-transform: uppercase;
}

.sidebar-row-price-hive {
	font-size: 0.72rem;
	color: #98a4ad;
	white-space: nowrap;
}

.sidebar-row-price-hive .token-logo-xs {
	height: 11px;
	vertical-align: middle;
	margin-left: 2px;
}

.sidebar-row-status {
	flex: 0 0 auto;
	width: 9px;
	height: 9px;
	border-radius: 50%;
	background: #d8dee3;
}

.sidebar-row-status.status-dot-active {
	background: #22c55e;
	box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

.sidebar-row-status.status-dot-owned {
	background: #263138;
}

.sidebar-row-status.status-dot-none {
	background: #d8dee3;
}

/* -- right: detail panel, reusing Product.vue's own card -- */
.market-detail-panel {
	padding: 20px 22px 28px;
	max-height: 78vh;
	overflow-y: auto;
}

.detail-back-btn {
	display: none;
	align-items: center;
	gap: 6px;
	border: none;
	background: transparent;
	color: #ff112d;
	font-weight: 600;
	font-size: 0.9rem;
	padding: 6px 0 14px;
	cursor: pointer;
}

.detail-empty {
	padding: 60px 20px;
	color: #98a4ad;
}

.detail-empty-icon {
	font-size: 2.2rem;
	margin-bottom: 10px;
	display: block;
	opacity: .6;
}

.detail-empty-text {
	margin-bottom: 0;
}

/* let the reused Product card fill the detail panel instead of a grid tile */
.market-detail-panel .product-card {
	width: 100% !important;
	max-width: 100% !important;
	margin: 0 !important;
	box-shadow: none !important;
	border: none !important;
	padding-left: 0;
	padding-right: 0;
}

@media (max-width: 900px) {
	.market-layout {
		grid-template-columns: 1fr;
	}

	.market-sidebar {
		border-right: none;
		border-bottom: 1px solid #e3e8ec;
	}

	.market-sidebar.mobile-hidden,
	.market-detail-panel.mobile-hidden {
		display: none;
	}

	.detail-back-btn {
		display: inline-flex;
	}

	.sidebar-scroll,
	.market-sidebar,
	.market-detail-panel {
		max-height: none;
	}
}

/* =========================================================
   Dark mode — aligned to the site's existing red/black brand palette
   ========================================================= */
html.dark-mode .market-hero {
  background:var(--background-color);
	color: #f3f5f7;
}

html.dark-mode .market-page {
	background:var(--background-color);
  color: #edf2f7;
}

html.dark-mode .market-sub {
	color: #b7c1cc;
	opacity: 0.9;
}

html.dark-mode .prize-draw-section {
	position: relative;
	overflow: hidden;
	background: linear-gradient(135deg,#2b0005,#4e0009);
	border: 1px solid rgba(255, 255, 255, 0.12);
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.42), 0 0 42px rgba(255, 17, 45, 0.12);
}



html.dark-mode .prize-draw-section > .container {
	position: relative;
	z-index: 1;
}

html.dark-mode .prize-draw-title {
	color: #fff;
	text-shadow: 0 1px 12px rgba(0, 0, 0, 0.28);
}

html.dark-mode .prize-draw-card {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(53, 2, 2, 0.045) 100%);
	border: 1px solid rgba(255, 255, 255, 0.12);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 14px 30px rgba(0, 0, 0, 0.28);
}

html.dark-mode .prize-draw-card:hover {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 17, 45, 0.09) 100%);
	border-color: rgba(255, 151, 166, 0.34);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 18px 34px rgba(0, 0, 0, 0.4);
}

html.dark-mode .prize-draw-icon,
html.dark-mode .prize-draw-card-title,
html.dark-mode .prize-draw-card-text,
html.dark-mode .prize-draw-countdown,
html.dark-mode .prize-draw-winner-link,
html.dark-mode .prize-draw-details-link {
	color: #f4f7fb;
}

html.dark-mode .prize-draw-icon {
	text-shadow: 0 0 18px rgba(255, 152, 168, 0.42);
}

html.dark-mode .prize-draw-card-title {
	color: #fff;
}

html.dark-mode .prize-draw-card-text,
html.dark-mode .prize-draw-countdown {
	color: #e6edf5;
}

html.dark-mode .prize-draw-details-link:hover,
html.dark-mode .prize-draw-winner-link:hover {
	color: #ffb3bd;
}

html.dark-mode .prize-draw-card .token-logo-sm {

	box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16), 0 4px 10px rgba(0, 0, 0, 0.35);
	filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.16));
}

html.dark-mode .market-toolbar {
	background:transparent;
	padding: 16px;

}

html.dark-mode .market-results-count {
	color: #aeb9c7;
	opacity: 1;
}

html.dark-mode .filter-pill {
	background: rgba(255, 255, 255, 0.055);
	border-color: rgba(255, 255, 255, 0.1);
	color: #dce4ee;
}

html.dark-mode .filter-pill:hover {
	background: rgba(255, 17, 45, 0.12);

}

html.dark-mode .filter-pill.active {
	background: #4e0009;
  	border-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .sort-label {
	color: #d9e0e7;
}

html.dark-mode .sort-select {
	background-color: #10151e;
	border-color: rgba(255, 255, 255, 0.14);
	color: #edf2f7;
	box-shadow: none;
}

html.dark-mode .sort-select option {
	background: #10151e;
	color: #edf2f7;
}

html.dark-mode .filter-pill:focus,
html.dark-mode .sort-select:focus,
html.dark-mode .market-empty .btn-brand:focus {
	border-color: #ff9aa7;
	outline: 0;
}

html.dark-mode .market-loading,
html.dark-mode .market-empty {
	color: #d9e0e7;
	background: rgba(14, 18, 26, 0.58);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 12px;
}

html.dark-mode .market-empty-icon {
	color: #ff9aa7;
	opacity: 0.9;
}

html.dark-mode .market-empty-text {
	color: #dce4ee;
	opacity: 0.9;
}

html.dark-mode .market-empty .btn-brand {
	background: linear-gradient(135deg, #ff112d 0%, #d6001a 100%);
	box-shadow: 0 10px 20px rgba(255, 17, 45, 0.18);
}

html.dark-mode .market-empty .btn-brand:hover {
	background: linear-gradient(135deg, #ff324a 0%, #e11b32 100%);
}

/* dark-mode: two-panel layout */
html.dark-mode .market-layout {
	background: var(--background-color);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

html.dark-mode .market-sidebar {
	border-right: 1px solid rgba(255, 255, 255, 0.08);
}

html.dark-mode .sidebar-group-title {
	color: #7c8894;
}

html.dark-mode .sidebar-row:hover {
	background: rgba(255, 17, 45, 0.1);
}

html.dark-mode .sidebar-row.active {
	background: rgba(255, 17, 45, 0.16);
	border-left-color: #ff324a;
}

html.dark-mode .sidebar-row-thumb {
	background-color: rgba(255, 255, 255, 0.06);
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

html.dark-mode .sidebar-row-name {
	color: #edf2f7;
}

html.dark-mode .sidebar-row-level {
	color: #ff9aa7;
}

html.dark-mode .sidebar-row-price-afit {
	color: #edf2f7;
}

html.dark-mode .sidebar-row-price-afit-unit,
html.dark-mode .sidebar-row-price-hive {
	color: #7c8894;
}

html.dark-mode .sidebar-row-status {
	background: #3a434b;
}

html.dark-mode .sidebar-row-status.status-dot-active {
	background: #34d399;
	box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
}

html.dark-mode .sidebar-row-status.status-dot-owned {
	background: #edf2f7;
}

html.dark-mode .market-sidebar,
html.dark-mode .market-detail-panel {
	scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

html.dark-mode .detail-back-btn {
	color: #ff9aa7;
}

html.dark-mode .detail-empty {
	color: #7c8894;
}
</style>
