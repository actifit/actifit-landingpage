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

			<!-- compact market toolbar: search (left), sort and filter drawer trigger (right) -->
			<div class="market-toolbar mb-4" v-if="prodList.length">
				<div class="market-toolbar-row">
					<div class="toolbar-search-group">
						<div class="market-search">
							<label class="sr-only" for="marketSearch">{{ $t('Search') }} {{ $t('Products') }}</label>
							<i class="fas fa-search"></i>
							<input
								id="marketSearch"
								name="marketSearch"
								autocomplete="new-password"
								autocapitalize="off"
								autocorrect="off"
								spellcheck="false"
								data-form-type="other"
								v-model.trim="searchQuery"
								type="search"
								class="form-control"
								:placeholder="$t('Search') + ' ' + $t('Products')">
							<button v-if="searchQuery" type="button" class="search-clear" :aria-label="$t('Close')"
								@click.prevent="searchQuery = ''"><i class="fas fa-times"></i></button>
						</div>
						<span class="market-results-count">{{ filteredProducts.length }} {{ $t('Products') }}</span>
					</div>
					<div class="toolbar-controls">
						<div class="toolbar-control sort-control">
							<label class="sort-label" for="marketSort">{{ $t('Sort_By') }}</label>
							<select id="marketSort" v-model="currentSort" class="form-control sort-select">
								<option :value="JSON.stringify({ value: 'name', direction: 'asc' })">{{ $t('Name') }}&#9650;</option>
								<option :value="JSON.stringify({ value: 'name', direction: 'desc' })">{{ $t('Name') }}&#9660;</option>
								<option :value="JSON.stringify({ value: 'level', direction: 'asc' })">{{ $t('Level') }}&#9650;</option>
								<option :value="JSON.stringify({ value: 'level', direction: 'desc' })">{{ $t('Level') }}&#9660;</option>
								<option :value="JSON.stringify({ value: 'price', direction: 'asc' })">{{ $t('Price') }}&#9650;</option>
								<option :value="JSON.stringify({ value: 'price', direction: 'desc' })">{{ $t('Price') }}&#9660;</option>
								<option :value="JSON.stringify({ value: 'reqtsFilled', direction: 'desc' })">{{ $t('Ready') }}&#9650;</option>
								<option :value="JSON.stringify({ value: 'reqtsFilled', direction: 'asc' })">{{ $t('Ready') }}&#9660;</option>
								<option :value="JSON.stringify({ value: 'bought', direction: 'asc' })">{{ $t('Bought') }}&#9650;</option>
								<option :value="JSON.stringify({ value: 'bought', direction: 'desc' })">{{ $t('Bought') }}&#9660;</option>
							</select>
						</div>
						<button type="button" class="cart-trigger" data-toggle="modal" data-target="#cartModal"
							:aria-label="$t('Checkout_title')">
							<i class="fas fa-shopping-cart"></i>
							<span class="toolbar-action-label">{{ $t('Checkout_title') }}</span>
							<span v-if="cartEntries.length" class="cart-count">{{ cartEntries.length }}</span>
						</button>
						<button type="button" class="filter-trigger" :aria-label="$t('Filter_By')"
							@click="filterDrawerOpen = true">
							<i class="fas fa-sliders-h"></i>
							<span class="toolbar-action-label">{{ $t('Filter_By') }}</span>
							<span v-if="activeFilterCount" class="filter-count">{{ activeFilterCount }}</span>
						</button>
					</div>
				</div>
			</div>

			<transition name="filter-drawer">
				<div v-if="filterDrawerOpen" class="filter-drawer-overlay" @click.self="filterDrawerOpen = false">
					<aside class="filter-drawer" role="dialog" aria-modal="true" :aria-label="$t('Filter_By')">
						<header class="filter-drawer-header">
							<h3><i class="fas fa-sliders-h"></i> {{ $t('Filter_By') }}</h3>
							<button type="button" class="filter-drawer-close" :aria-label="$t('Close')"
								@click="filterDrawerOpen = false"><i class="fas fa-times"></i></button>
						</header>

						<div class="filter-drawer-body">
							<fieldset class="filter-section">
								<legend>{{ $t('Products') }}</legend>
								<button type="button" v-for="opt in availableFilterOptions" :key="opt.value" class="drawer-filter-option"
									:class="{ active: currentFilter === opt.value }" @click="currentFilter = opt.value">
									{{ $t(opt.labelKey) }} <i v-if="currentFilter === opt.value" class="fas fa-check"></i>
								</button>
							</fieldset>

							<fieldset class="filter-section">
								<legend>{{ $t('purchase_currency') }}</legend>
								<button type="button" v-for="opt in currencyOptions" :key="opt.value" class="drawer-filter-option"
									:class="{ active: currentCurrency === opt.value }" @click="currentCurrency = opt.value">
									{{ opt.value || $t(opt.labelKey) }} <i v-if="currentCurrency === opt.value" class="fas fa-check"></i>
								</button>
							</fieldset>

							<fieldset v-if="user" class="filter-section">
								<legend>{{ $t('Status') }}</legend>
								<button type="button" v-for="opt in statusOptions" :key="opt.value" class="drawer-filter-option"
									:class="{ active: currentStatus === opt.value }" @click="currentStatus = opt.value">
									{{ $t(opt.labelKey) }} <i v-if="currentStatus === opt.value" class="fas fa-check"></i>
								</button>
							</fieldset>
						</div>

						<footer class="filter-drawer-footer">
							<button type="button" class="btn clear-filters-btn" :disabled="!activeFilterCount" @click="resetFilters">
								{{ $t('clear_filters') }}
							</button>
							<button type="button" class="btn btn-brand" @click="filterDrawerOpen = false">
								{{ filteredProducts.length }} {{ $t('Products') }}
							</button>
						</footer>
					</aside>
				</div>
			</transition>

			<!-- show listing of special event products -->
			<!--
			<div class="christmas-section p-4 my-5 rounded">
				<h5 class="text-center pt-3 market-sub christmas-title mb-4">🎁 {{ $t('special_christmas_event') }} 🎄
				</h5>

				<div class="row justify-content-center" v-if="prodList.length">
					<Product v-for="product in prodList" :key="product._id" :product="product" :pros="professionals"
						:userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts"
						v-if="product.specialevent && product.event == 'Christmas'"
						@update-prod="updateProd" :afitPrice="afitPrice" @refresh-tickets="refreshTickets" />
				</div>
			</div>
			<br />
			-->

			<!-- two-panel market: product list (left) + product detail (right) -->
			<div class="market-layout" v-if="filteredProducts.length">

				<!-- LEFT: browsable product list, grouped by category -->
				<aside class="market-sidebar" :class="{ 'mobile-hidden': mobileShowDetail }"
					:style="sidebarHeight ? { height: sidebarHeight + 'px' } : null">
					<div class="sidebar-scroll">
						<div class="sidebar-group" :class="{
							'sidebar-group-owned': group.type === 'bought' || group.type === 'activated',
							'sidebar-group-saved': group.type === 'saved',
							'sidebar-group-state': ['bought', 'activated', 'available', 'unavailable'].includes(group.type),
							'sidebar-group-available': group.type === 'available',
							'sidebar-group-unavailable': group.type === 'unavailable'
						}"
							v-for="group in groupedProducts" :key="group.type">
							<div class="sidebar-group-title">{{ $t(group.labelKey) }}</div>

							<button type="button" class="sidebar-row" v-for="product in group.items" :key="product._id"
								:class="{ active: selectedProductId === product._id }" @click="selectProduct(product)">
								<span class="sidebar-row-thumb" :style="'background-image:url(' + rowImage(product) + ');'"></span>

								<span class="sidebar-row-main">
									<span class="sidebar-row-title">
										<span class="sidebar-row-name">{{ product.name }}</span>
										<span class="sidebar-row-level" :class="gadgetLevelClass(product.level)" v-if="product.level">{{ $t('level_short') }}{{ product.level }}</span>
									</span>
									<span class="sidebar-row-event" v-if="product.specialevent && product.event">{{ product.event }}</span>
									<span class="sidebar-row-currencies" :aria-label="$t('purchase_currency')">
										<span v-for="currency in purchaseCurrencies(product)" :key="currency"
											class="sidebar-currency-badge" :class="'currency-' + currency.toLowerCase()">
											<img :src="currency === 'HIVE' ? '/img/HIVE.png' : '/img/actifit_logo.png'" alt="">
											{{ currency }}
										</span>
									</span>
								</span>

								<span class="sidebar-row-side">
									<span class="sidebar-row-owned"
										v-if="(group.type === 'bought' || group.type === 'activated') && product.type === 'ingame'">
										<span>{{ ownedGadgetCount(product) }} {{ $t('units') }}</span>
										<span class="sidebar-row-owned-active" v-if="activeGadgetCount(product) > 0">
											{{ activeGadgetCount(product) }} {{ $t('Active') }}
										</span>
									</span>
									<span class="sidebar-row-price" v-else>
										<template v-if="purchaseCurrencies(product).includes('AFIT') && rowAfitPrice(product) !== null">
											<span class="sidebar-row-price-afit">{{ numberFormat(rowAfitPrice(product), 2) }}</span>
											<span class="sidebar-row-price-afit-unit">AFIT</span>
										</template>
										<span v-else class="sidebar-row-price-afit">&mdash;</span>
										<span class="sidebar-row-price-hive" v-if="purchaseCurrencies(product).includes('HIVE') && rowHivePrice(product) !== null">
											{{ numberFormat(rowHivePrice(product), 3) }} {{ $t('HIVE') }}
											<img src="/img/HIVE.png" class="token-logo-xs" alt="">
										</span>
									</span>
					<span v-if="statusDot(product)" class="sidebar-row-status" :class="'status-dot-' + statusDot(product)"
						:title="statusLabel(product)"></span>
								</span>
							</button>
						</div>
					</div>
				</aside>

				<!-- RIGHT: full product detail, reusing the existing Product component so all
					 buy / bought / activate functionality stays 100% intact -->
				<section class="market-detail-panel" ref="detailPanelSection" :class="{ 'mobile-hidden': !mobileShowDetail }">
					<button type="button" class="detail-back-btn" @click="backToList">
						<i class="fas fa-arrow-left"></i> {{ $t('All') }}
					</button>

					<div class="detail-panel-inner" ref="detailPanel" v-if="selectedProduct">
						<Product :key="selectedProduct._id" :product="selectedProduct" :pros="professionals"
							:userrank="userRank" :gadgetStats="gadgetStats" :realProducts="realProducts"
							@update-prod="updateProd" :afitPrice="afitPrice" :isSaved="isProductSaved(selectedProduct)"
							@toggle-save="toggleSavedProduct"
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
				<button type="button" class="btn btn-brand" @click="resetMarketView">{{ $t('All') }}</button>
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
import Lodash from 'lodash'
import { getProductAfitPrice, getProductHivePrice, getProductPurchaseCurrencies, getProductUsdValue } from '~/utils/marketPricing'
import { filterMarketProducts, getGadgetLevelClass, getGadgetOwnership, getProductMarketState } from '~/utils/marketCatalog'
import { loadSavedProductIds, storeSavedProductIds, toggleSavedProductId } from '~/utils/marketSavedProducts'

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
			currentStatus: '',
			currentCurrency: '',
			searchQuery: '',
			filterDrawerOpen: false,
			savedProductIds: [],
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
			selectedProductId: null,
			mobileShowDetail: false,
			mobileListScrollY: 0,
			sidebarHeight: null,
			filterOptions: [
				{ value: '', labelKey: 'All' },
				{ value: 'ingame', labelKey: 'Game' },
				{ value: 'service', labelKey: 'Consultation' },
				{ value: 'ebook', labelKey: 'Ebook' },
				{ value: 'real', labelKey: 'Physical_Products' }
			],
			statusOptions: [
				{ value: '', labelKey: 'All' },
				{ value: 'bought', labelKey: 'Bought' },
				{ value: 'activated', labelKey: 'market_state_activated' },
				{ value: 'available', labelKey: 'Available' },
				{ value: 'unavailable', labelKey: 'market_state_unavailable' }
			],
			currencyOptions: [
				{ value: '', labelKey: 'All' },
				{ value: 'AFIT', labelKey: 'AFIT' },
				{ value: 'HIVE', labelKey: 'HIVE' }
			],
		}
	},
	computed: {
		...mapGetters('steemconnect', ['user']),
		...mapGetters(['userTokens', 'products', 'professionals', 'userRank', 'gadgetStats', 'realProducts', 'cartEntries']),
		filteredProducts() {
			const statusFilter = this.user ? this.currentStatus : '';
			return filterMarketProducts(
				this.prodList,
				this.currentFilter,
				statusFilter,
				this.gadgetStats,
				this.currentCurrency,
				this.searchQuery,
				{
					userRank: this.userRank,
					userTokens: this.userTokens,
					products: this.prodList,
					gadgetStats: this.gadgetStats,
					realProducts: this.realProducts
				}
			);
		},
		activeFilterCount() {
			return [this.currentFilter, this.currentCurrency, this.user ? this.currentStatus : ''].filter(Boolean).length;
		},
		availableFilterOptions() {
			const products = Array.isArray(this.prodList)
				? this.prodList.filter(product => product && !product.specialevent)
				: [];
			return this.filterOptions.filter(option => (
				!option.value || products.some(product => product.type === option.value)
			));
		},
		/* groups the currently filtered products by type, in a fixed order, for the
		   left-hand sidebar list (mirrors the categories used in filterOptions) */
		groupedProducts() {
			const filteredProducts = Array.isArray(this.filteredProducts) ? this.filteredProducts : [];
			const sourceProducts = Array.isArray(this.prodList) ? this.prodList : filteredProducts;
			const savedIds = Array.isArray(this.savedProductIds) ? this.savedProductIds : [];
			const savedIdSet = new Set(savedIds.map(String));
			const savedProducts = filteredProducts.filter(product => savedIdSet.has(String(product._id)));
			const visibleProducts = filteredProducts.filter(product => !savedIdSet.has(String(product._id)));
			const eventProducts = visibleProducts.filter(product => product.specialevent);
			const regularProducts = visibleProducts.filter(product => !product.specialevent);
			const eventGroups = eventProducts.length > 0
				? [{ type: 'event', labelKey: 'Event', items: eventProducts }]
				: [];
			const groupDefs = [
				{ type: 'ingame', labelKey: 'Game' },
				{ type: 'service', labelKey: 'Consultation' },
				{ type: 'ebook', labelKey: 'Ebook' },
				{ type: 'real', labelKey: 'Physical_Products' }
			];
			const personalGroups = [];
			if (savedProducts.length > 0) {
				personalGroups.push({ type: 'saved', labelKey: 'saved_products', items: savedProducts });
			}
			if (this.user) {
				const stateDefs = [
					{ type: 'bought', labelKey: 'Bought' },
					{ type: 'activated', labelKey: 'market_state_activated' },
					{ type: 'available', labelKey: 'Available' },
					{ type: 'unavailable', labelKey: 'market_state_unavailable' }
				];
				const stateContext = {
					userRank: this.userRank,
					userTokens: this.userTokens,
					products: sourceProducts,
					gadgetStats: Array.isArray(this.gadgetStats) ? this.gadgetStats : [],
					realProducts: Array.isArray(this.realProducts) ? this.realProducts : []
				};
				const stateGroups = stateDefs
					.map(def => ({
						...def,
						items: regularProducts.filter(product => getProductMarketState(product, stateContext) === def.type)
					}))
					.filter(group => group.items.length > 0);
				return eventGroups.concat(personalGroups, stateGroups);
			}
			return eventGroups.concat(
				personalGroups,
				groupDefs
					.map(def => ({ type: def.type, labelKey: def.labelKey, items: regularProducts.filter(p => p.type === def.type) }))
					.filter(group => group.items.length > 0)
			);
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
		currentStatus: 'ensureSelection',
		currentCurrency: 'ensureSelection',
		searchQuery: 'ensureSelection',
		selectedProduct() {
			this.$nextTick(this.observeDetailPanel);
		},
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
		gadgetLevelClass(level) {
			return getGadgetLevelClass(level);
		},
		refreshTickets() {
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
			const defaultSortApproach = { value: 'price', direction: 'asc' };
			let sortApproach = defaultSortApproach;
			try {
				sortApproach = JSON.parse(this.currentSort) || defaultSortApproach;
			} catch (err) {
				console.error(err);
			}
			if (sortApproach.value) {
				if (sortApproach.value == 'price') {
					this.prodList = Lodash.orderBy(
						this.prodList,
						[
							product => getProductUsdValue(product, this.afitPrice) === null,
							product => getProductUsdValue(product, this.afitPrice) || 0
						],
						['asc', sortApproach.direction]
					);
				} else {
					this.prodList = Lodash.orderBy(this.prodList, [sortApproach.value], [sortApproach.direction]);
				}
				this.$forceUpdate();
			}
			this.ensureSelection();
		},
		setProducts() {
			this.prodList = this.products;
			this.reorderProducts();
		},
		updateProd(prod) {
			const ind = this.prodList.findIndex(product => (product._id === prod._id));
			if (ind === -1) {
				return;
			}
			this.$set(this.prodList, ind, prod);
			this.$forceUpdate();
		},
		setAFITPrice(_afitPrice) {
			this.afitPrice = _afitPrice;
			this.reorderProducts();
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
			let targetDate = new Date(json.nextDrawDate);
			let mnth = targetDate.getMonth() + 1;
			if (mnth < 10) {
				mnth = '0' + mnth;
			}
			this.nextGadgetBuyRewardDate = targetDate.getFullYear() + '-' + mnth + '-' + targetDate.getDate() + ' 00:00 GMT';

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
			const isMobile = this.isMobileMarketView();
			if (isMobile) {
				this.mobileListScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
			}
			this.selectedProductId = product._id;
			this.mobileShowDetail = true;
			if (isMobile) {
				this.$nextTick(this.scrollToDetailPanel);
			}
		},

		/** mobile-only: return from the detail panel to the browsable list */
		backToList() {
			const shouldRestoreScroll = this.isMobileMarketView();
			this.mobileShowDetail = false;
			if (shouldRestoreScroll) {
				this.$nextTick(() => {
					window.scrollTo({ top: this.mobileListScrollY, behavior: 'auto' });
				});
			}
		},

		isMobileMarketView() {
			return typeof window !== 'undefined' && window.innerWidth <= 900;
		},

		/** Places newly opened mobile details below the fixed site header. */
		scrollToDetailPanel() {
			if (typeof window === 'undefined') {
				return;
			}
			const detailPanel = this.$refs.detailPanelSection;
			if (!detailPanel) {
				return;
			}
			const fixedHeaderOffset = 88;
			const detailTop = detailPanel.getBoundingClientRect().top + window.pageYOffset - fixedHeaderOffset;
			window.scrollTo({ top: Math.max(0, detailTop), behavior: 'auto' });
		},

		/** Keeps the scrollable product list exactly as tall as the detail card. */
		observeDetailPanel() {
			if (this._detailResizeObserver) {
				this._detailResizeObserver.disconnect();
				this._detailResizeObserver = null;
			}

			const detailPanel = this.$refs.detailPanel;
			if (!detailPanel) {
				this.sidebarHeight = null;
				return;
			}

			const syncSidebarHeight = () => {
				this.sidebarHeight = window.innerWidth > 900
					? Math.ceil(detailPanel.getBoundingClientRect().height)
					: null;
			};

			if (typeof ResizeObserver !== 'undefined') {
				this._detailResizeObserver = new ResizeObserver(syncSidebarHeight);
				this._detailResizeObserver.observe(detailPanel);
			}

			syncSidebarHeight();
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

		/** AFIT amount shown by the Product card for the current payment split */
		rowAfitPrice(product) {
			return getProductAfitPrice(product, this.afitPrice);
		},

		/** equivalent HIVE price, same conversion Product.vue uses for its Buy-with-HIVE button */
		rowHivePrice(product) {
			return getProductHivePrice(product, this.afitPrice);
		},

		purchaseCurrencies(product) {
			return getProductPurchaseCurrencies(product);
		},

		isProductSaved(product) {
			return Boolean(product && this.savedProductIds.includes(String(product._id)));
		},

		toggleSavedProduct(product) {
			if (!product || product._id == null || typeof localStorage === 'undefined') {
				return;
			}
			this.savedProductIds = storeSavedProductIds(
				localStorage,
				toggleSavedProductId(this.savedProductIds, product._id)
			);
		},

		resetFilters() {
			this.currentFilter = '';
			this.currentStatus = '';
			this.currentCurrency = '';
		},

		resetMarketView() {
			this.resetFilters();
			this.searchQuery = '';
		},

		handleFilterDrawerKeydown(event) {
			if (event.key === 'Escape') {
				this.filterDrawerOpen = false;
			}
		},

		ownedGadgetCount(product) {
			return getGadgetOwnership(this.gadgetStats, product && product._id).total;
		},

		activeGadgetCount(product) {
			return getGadgetOwnership(this.gadgetStats, product && product._id).active;
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
			const state = getProductMarketState(product, {
				userRank: this.userRank,
				userTokens: this.userTokens,
				products: this.prodList,
				gadgetStats: this.gadgetStats,
				realProducts: this.realProducts
			});
			return {
				activated: 'active',
				bought: 'owned',
				available: 'available'
			}[state] || '';
		},

		statusLabel(product) {
			const status = this.statusDot(product);
			if (status == 'active') {
				return this.$t('Active');
			}
			if (status == 'owned') {
				return this.$t('Bought');
			}
			if (status == 'available') {
				return this.$t('Available');
			}
			return '';
		}

	},

	async mounted() {
		this.savedProductIds = loadSavedProductIds(localStorage);
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

		window.addEventListener('resize', this.observeDetailPanel);
		window.addEventListener('keydown', this.handleFilterDrawerKeydown);
		this.$nextTick(this.observeDetailPanel);

	},
	beforeDestroy() {
		window.removeEventListener('resize', this.observeDetailPanel);
		window.removeEventListener('keydown', this.handleFilterDrawerKeydown);
		if (this._detailResizeObserver) {
			this._detailResizeObserver.disconnect();
			this._detailResizeObserver = null;
		}
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
	.prize-draw-section {
		padding: 28px 12px;
	}

	.prize-draw-section > .container {
		padding-right: 0;
		padding-left: 0;
	}

	.prize-draw-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}

	.prize-draw-grid > .prize-draw-card {
		min-width: 0;
		padding: 16px 8px;
	}

	.prize-draw-card .prize-draw-icon {
		margin-bottom: 8px;
		font-size: 1.6rem;
	}

	.prize-draw-card .prize-draw-card-title {
		font-size: 0.9rem;
		line-height: 1.2;
	}

	.prize-draw-card .prize-draw-card-text,
	.prize-draw-card .prize-draw-winner-link {
		font-size: 0.95rem;
	}

	.prize-draw-card .vuejs-countdown li {
		margin: 0 3px;
	}

	.prize-draw-card .vuejs-countdown li::after {
		right: -6px;
		font-size: 20px;
	}

	.prize-draw-card .vuejs-countdown .digit {
		font-size: 20px;
	}

	.prize-draw-card .vuejs-countdown .text {
		font-size: 8px;
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

.filter-trigger,
.cart-trigger {
	position: relative;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	min-height: 44px;
	padding: 8px 15px;
	border: 1px solid #d6dde3;
	border-radius: 10px;
	background: #fff;
	color: #263138;
	font-weight: 700;
	cursor: pointer;
}

.filter-trigger:hover,
.cart-trigger:hover {
	border-color: #ff112d;
	color: #d6001a;
}

.filter-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 21px;
	height: 21px;
	padding: 0 6px;
	border-radius: 999px;
	background: #ff112d;
	color: #fff;
	font-size: 0.72rem;
}

.cart-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 21px;
	height: 21px;
	padding: 0 6px;
	border-radius: 999px;
	background: #ff112d;
	color: #fff;
	font-size: 0.72rem;
}

.toolbar-controls {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-wrap: wrap;
	margin-left: auto;
}

.toolbar-search-group {
	display: flex;
	align-items: center;
	gap: 12px;
	min-width: 0;
}

.market-search {
	position: relative;
	display: flex;
	align-items: center;
	width: min(300px, 30vw);
	margin: 0;
}

.market-search > .fas {
	position: absolute;
	left: 13px;
	z-index: 1;
	color: #98a4ad;
}

.market-search .form-control {
	height: 44px;
	padding-left: 38px;
	padding-right: 38px;
	border-color: #d6dde3;
	border-radius: 10px;
}

.search-clear {
	position: absolute;
	right: 7px;
	width: 30px;
	height: 30px;
	border: 0;
	border-radius: 50%;
	background: transparent;
	color: #75818b;
}

.search-clear:hover {
	background: #f1f3f5;
	color: #d6001a;
}

.toolbar-control {
	display: flex;
	align-items: center;
	gap: 7px;
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

.sort-control .sort-select {
	height: 44px;
	border-radius: 10px;
}

.market-results-count {
	font-size: 0.85rem;
	opacity: .7;
}

.filter-drawer-overlay {
	position: fixed;
	inset: 0;
	z-index: 3000;
	background: rgba(18, 24, 29, 0.48);
	backdrop-filter: blur(2px);
}

.filter-drawer {
	display: flex;
	flex-direction: column;
	width: min(380px, 92vw);
	height: 100%;
	margin-left: auto;
	background: #fff;
	box-shadow: -18px 0 48px rgba(0, 0, 0, 0.2);
}

.filter-drawer-header,
.filter-drawer-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 18px 20px;
	border-bottom: 1px solid #e8ecef;
}

.filter-drawer-header h3 {
	margin: 0;
	font-size: 1.15rem;
	font-weight: 800;
}

.filter-drawer-close {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 38px;
	height: 38px;
	border: 0;
	border-radius: 50%;
	background: #f3f5f6;
	color: #45525c;
}

.filter-drawer-body {
	flex: 1 1 auto;
	overflow-y: auto;
	padding: 8px 20px 24px;
}

.filter-section {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px;
	min-width: 0;
	margin: 0;
	padding: 22px 0;
	border: 0;
	border-bottom: 1px solid #edf0f2;
}

.filter-section legend {
	grid-column: 1 / -1;
	width: 100%;
	margin: 0 0 4px;
	color: #59656f;
	font-size: 0.76rem;
	font-weight: 800;
	letter-spacing: 0.06em;
	text-transform: uppercase;
}

.drawer-filter-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	min-height: 42px;
	padding: 8px 11px;
	border: 1px solid #dce2e7;
	border-radius: 9px;
	background: #fff;
	color: #34414a;
	text-align: left;
}

.drawer-filter-option.active {
	border-color: #ff112d;
	background: #fff1f3;
	color: #c60019;
}

@media (hover: hover) and (pointer: fine) {
	.drawer-filter-option:hover {
		border-color: #ff112d;
		background: #fff1f3;
		color: #c60019;
	}
}

.filter-drawer-footer {
	border-top: 1px solid #e8ecef;
	border-bottom: 0;
}

.filter-drawer-footer .btn {
	flex: 1 1 0;
	min-height: 44px;
	border-radius: 9px;
}

.clear-filters-btn {
	border: 1px solid #d6dde3;
	background: #fff;
	color: #45525c;
}

.clear-filters-btn:disabled {
	opacity: 0.45;
}

.filter-drawer-enter-active,
.filter-drawer-leave-active {
	transition: opacity 0.2s ease;
}

.filter-drawer-enter-active .filter-drawer,
.filter-drawer-leave-active .filter-drawer {
	transition: transform 0.24s ease;
}

.filter-drawer-enter,
.filter-drawer-leave-to {
	opacity: 0;
}

.filter-drawer-enter .filter-drawer,
.filter-drawer-leave-to .filter-drawer {
	transform: translateX(100%);
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
	gap: 28px;
	align-items: start;
	background: transparent;
	border: 0;
	border-radius: 0;
	overflow: visible;
	box-shadow: none;
}

/* -- left: sidebar list -- */
.market-sidebar {
	position: sticky;
	top: 88px;
	align-self: start;
	overflow: hidden;
	background: #fff;
	border: 1px solid #e3e8ec;
	border-radius: 14px;
	box-shadow: 0 5px 18px rgba(23, 30, 38, 0.05);
}

.sidebar-scroll {
	height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
	overscroll-behavior: contain;
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
	flex: 0 1 auto;
	min-width: 0;
	font-size: 0.92rem;
	font-weight: 600;
	color: #263138;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sidebar-row-title {
	display: flex;
	align-items: baseline;
	gap: 6px;
	min-width: 0;
}

.sidebar-row-level {
	display: inline-flex;
	align-items: center;
	flex: 0 0 auto;
	padding: 3px 7px;
	border: 1px solid #dbe1e6;
	border-radius: 999px;
	background: #eef1f4;
	color: #52606d;
	font-size: 0.7rem;
	font-weight: 700;
	line-height: 1;
	width: fit-content;
}

.sidebar-row-level.gadget-level-2 {
	border-color: #f0a23b;
	background: #fff6e8;
	color: #9a5700;
}

.sidebar-row-level.gadget-level-3 {
	border-color: #ff112d;
	background: #fff0f2;
	color: #c60019;
}

.sidebar-row-event {
	width: fit-content;
	padding: 1px 6px;
	border-radius: 999px;
	background: #fff3cd;
	color: #765600;
	font-size: 0.68rem;
	font-weight: 700;
}

.sidebar-row-currencies {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-top: 2px;
}

.sidebar-currency-badge {
	display: inline-flex;
	align-items: center;
	gap: 3px;
	padding: 2px 6px;
	border-radius: 999px;
	background: #fff0f2;
	color: #b80018;
	font-size: 0.58rem;
	font-weight: 800;
	letter-spacing: 0.04em;
}

.sidebar-currency-badge img {
	width: 11px;
	height: 11px;
	object-fit: contain;
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

.sidebar-row-owned {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	color: #263138;
	font-size: 0.78rem;
	font-weight: 700;
	line-height: 1.2;
}

.sidebar-row-owned-active {
	color: #179447;
	font-size: 0.68rem;
}

.sidebar-group-owned {
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid #e9ecef;
}

.sidebar-group-saved {
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid #e9ecef;
}

.sidebar-group-state {
	margin-bottom: 8px;
	padding-bottom: 8px;
	border-bottom: 1px solid #e9ecef;
}

.sidebar-group-owned .sidebar-group-title,
.sidebar-group-saved .sidebar-group-title {
	color: #ff112d;
}

.sidebar-group-available .sidebar-group-title {
	color: #179447;
}

.sidebar-group-unavailable .sidebar-group-title {
	color: #8a9198;
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

.sidebar-row-status.status-dot-available {
	background: #d8dee3;
}

/* -- right: detail panel, reusing Product.vue's own card -- */
.market-detail-panel {
	padding: 0 0 40px;
	max-height: none;
	overflow: visible;
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
	.market-toolbar-row {
		align-items: stretch;
	}

	.toolbar-controls {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		width: 100%;
		margin-left: 0;
	}

	.toolbar-search-group {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		flex: 1 1 100%;
		width: 100%;
	}

	.market-search {
		width: 100%;
	}

	.sort-control {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		min-width: 0;
	}

	.sort-control .sort-select {
		width: 100%;
		min-width: 0;
	}

	.filter-trigger,
	.cart-trigger {
		white-space: nowrap;
	}

	.market-layout {
		grid-template-columns: minmax(0, 1fr);
	}

	.market-sidebar {
		position: static;
		top: auto;
		min-width: 0;
		overflow: visible;
	}

	.sidebar-scroll {
		min-width: 0;
		overflow: visible;
		overscroll-behavior: auto;
	}

	.sidebar-row {
		min-width: 0;
	}

	.sidebar-row-side {
		flex: 0 1 auto;
		min-width: 0;
		gap: 6px;
	}

	.sidebar-row-price {
		min-width: 0;
		max-width: 100%;
	}

	.sidebar-row-price-afit,
	.sidebar-row-price-hive {
		max-width: 100%;
		overflow-wrap: anywhere;
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
		height: auto !important;
		max-height: none;
	}
}

@media (max-width: 575px) {
	.filter-trigger,
	.cart-trigger {
		justify-content: center;
		width: 44px;
		padding-right: 0;
		padding-left: 0;
	}

	.toolbar-action-label {
		display: none;
	}

	.filter-count,
	.cart-count {
		position: absolute;
		margin-top: -28px;
		margin-left: 28px;
	}
}

@media (max-width: 360px) {
	.sidebar-row {
		gap: 8px;
		padding-right: 10px;
		padding-left: 10px;
	}

	.sidebar-group-title {
		padding-right: 10px;
		padding-left: 10px;
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

html.dark-mode .filter-trigger,
html.dark-mode .cart-trigger,
html.dark-mode .filter-drawer,
html.dark-mode .drawer-filter-option,
html.dark-mode .clear-filters-btn {
	background: #10151e;
	border-color: rgba(255, 255, 255, 0.13);
	color: #edf2f7;
}

html.dark-mode .filter-drawer-header,
html.dark-mode .filter-drawer-footer,
html.dark-mode .filter-section {
	border-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .filter-drawer-close,
html.dark-mode .search-clear:hover {
	background: rgba(255, 255, 255, 0.08);
	color: #ff9aa7;
}

html.dark-mode .filter-section legend {
	color: #aeb9c7;
}

html.dark-mode .drawer-filter-option.active {
	border-color: #ff6074;
	background: rgba(255, 17, 45, 0.16);
	color: #ff9aa7;
}

@media (hover: hover) and (pointer: fine) {
	html.dark-mode .drawer-filter-option:hover {
		border-color: #ff6074;
		background: rgba(255, 17, 45, 0.16);
		color: #ff9aa7;
	}
}

html.dark-mode .market-search .form-control {
	background: #10151e;
	border-color: rgba(255, 255, 255, 0.14);
	color: #edf2f7;
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

html.dark-mode .filter-trigger:focus,
html.dark-mode .cart-trigger:focus,
html.dark-mode .drawer-filter-option:focus,
html.dark-mode .market-search .form-control:focus,
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
	background: transparent;
	border: 0;
	box-shadow: none;
}

html.dark-mode .market-sidebar {
	background: var(--background-color);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
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
	border-color: rgba(255, 255, 255, 0.14);
	background: rgba(255, 255, 255, 0.08);
	color: #d8dde4;
}

html.dark-mode .sidebar-row-level.gadget-level-2 {
	border-color: #f0a23b;
	background: rgba(240, 162, 59, 0.16);
	color: #ffd08a;
}

html.dark-mode .sidebar-row-level.gadget-level-3 {
	border-color: #ff6074;
	background: rgba(255, 17, 45, 0.16);
	color: #ff9aa7;
}

html.dark-mode .sidebar-row-event {
	background: rgba(255, 193, 7, 0.16);
	color: #ffd76a;
}

html.dark-mode .sidebar-row-owned {
	color: #edf2f7;
}

html.dark-mode .sidebar-row-owned-active {
	color: #63d98a;
}

html.dark-mode .sidebar-group-owned,
html.dark-mode .sidebar-group-saved,
html.dark-mode .sidebar-group-state {
	border-bottom-color: rgba(255, 255, 255, 0.1);
}

html.dark-mode .sidebar-group-available .sidebar-group-title {
	color: #63d98a;
}

html.dark-mode .sidebar-group-unavailable .sidebar-group-title {
	color: #9ca6b2;
}

html.dark-mode .sidebar-row-price-afit {
	color: #edf2f7;
}

html.dark-mode .sidebar-currency-badge {
	background: rgba(255, 17, 45, 0.16);
	color: #ff9aa7;
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

