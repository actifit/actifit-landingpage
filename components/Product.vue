<template>
  <!-- single card item for approved product -->	
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center card-border pro-card col-sm-4">
		  <div class="text-center card-header">
		    <div class="row basic-info">
			  <h3 class="pro-name col-md-12">{{ this.product.name}}<span v-if="!product.specialevent && this.product.level">{{$t('level_short')}}{{this.product.level}}</span>
			  </h3>
			  
			  <div v-if="this.product.type == 'ingame'" class="col-md-6" :title="!product.specialevent?this.product.name + ' - Level ' + this.product.level:this.product.name">
				<div :class="'avatar-'+this.product.level" class="avatar pro-card-av mx-auto" :style="'background-image: url(img/gadgets/' + this.product.image + ');'"></div>
				<span v-for="iterl in this.product.level" :key="iterl">
					<i class="fas fa-star text-brand"></i>
				</span>
			  </div>
			  <div v-else class="col-md-6">	
				<a :href="'/' + this.product.provider">
				<div class="avatar pro-card-av mx-auto mb-3" :style="'background-image: url(' + product_prov_pic + ');'"></div>
				</a>
			  </div>
			  <div class="col-md-6">
				  <div v-if="this.product.type == 'ingame'" class="avatar gaming-label mx-auto" :style="'background-image: url(img/gadgets/gaming.png);'"></div>
				  <h4 v-else-if="this.product.type == 'ebook'"><i class="fas fa-book"></i></h4>
				  <h4 v-else-if="this.product.type == 'service'"><i class='fas fa-phone-volume'></i></h4>
				  <h3 class="product-type">{{ this.product.type}} <span v-if="this.product.type != 'ingame'">{{ $t('By') }}</span> <br/> 
					<a v-if="this.product.type == 'service'" :href="'/consultants/?prof=' + this.product.provider_name" >{{ this.product.provider_name}}</a>
					<a v-else :href="'/' + this.product.provider" >{{ this.product.provider_name}}</a>
				  </h3>
				  <!--<div class="pb-md-2 text-left" >
					<b>{{ $t('price')}}: </b>{{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo" src="/img/actifit_logo.png">
				  </div>-->
			  </div>
			</div>  
		  </div>
		  
		  <div class="card-body" v-if="this.product.type == 'ingame'">
			  <div class="row text-info pt-1">
				<div class="pb-md-2 pt-md-2 text-center col-md-6 info-box info-box-orangered">
				  <b>{{ $t('Available')}}</b><br/>{{this.product.count}} {{$t('units')}}
				</div>
				<div class="pb-md-2 pt-md-2 text-center col-md-6 info-box info-box-orangered">
				  <div>
					<b>{{ $t('Validity') }}</b><br/>{{this.product.benefits.time_span}} {{this.product.benefits.time_unit}}
				  </div>
				</div>
			  </div>
			  
			  <div class="row">
				<div class="col-md-12 pb-md-2 pt-md-2 info-box info-box-orangered">
					<b>{{ $t('Boosts') }}</b>
					<div v-for="(boost, index) in product.benefits.boosts" :key="index" style="text-align: left;">
						<div>
							<span v-if="boost.boost_beneficiary == 'friend'" :title="$t('Boost') + ' ' + $t('to_a_friend')"><i class="fas fa-user-friends pl-2"></i></span>
							<span v-else :title="$t('Boost') + ' ' + $t('to_you')"><i class="fas fa-user pl-2"></i></span>
							<span v-if="boost.boost_amount">
								<span v-for="iterx in Math.ceil(boost.boost_amount / 5)" :key="iterx">
									<span class="color-box-afit" v-if="boost.boost_unit == 'AFIT'"></span>
									<span class="color-box-sports" v-else-if="boost.boost_unit == 'SPORTS'"></span>
									<span class="color-box-steem" v-else-if="boost.boost_unit == 'SP'"></span>
									<span class="color-box-rank" v-else-if="boost.boost_unit == 'User Rank'"></span>
								</span>
								<br v-if="product.specialevent"/><br v-if="product.specialevent"/>
								<span>&nbsp;+{{boost.boost_amount}}</span><span>{{boost.boost_type.replace('percent_reward','%').replace('percent','%').replace('unit',' ')}}</span>&nbsp;<span>{{boost.boost_unit}} {{$t('rewards')}} {{$t('per_report')}}</span>&nbsp;
							</span>
							<span v-else-if="boost.boost_min_amount">
								<span v-for="iterx in Math.ceil(boost.boost_max_amount / 5)" :key="iterx">
									<span class="color-box-afit" v-if="boost.boost_unit == 'AFIT'"></span>
								</span>
								<br v-if="product.specialevent"/><br v-if="product.specialevent"/>
								<span>+&nbsp;</span><span>{{boost.boost_type.replace('percent_reward','%').replace('percent','%').replace('unit',' ')}}</span>&nbsp;{{boost.boost_min_amount}}&nbsp;-&nbsp;{{boost.boost_max_amount}}<span>&nbsp;{{boost.boost_unit}} {{$t('rewards')}} {{$t('per_report')}}</span>&nbsp;
							</span>
							<span v-if="boost.boost_beneficiary == 'friend'">{{$t('to_a_friend')}}</span>
							<span v-else>{{$t('to_you')}}</span>
						</div>
					</div>
				  </div>
			   </div>
			   
			   <div class="row">
				<div class="col-md-12 pb-md-2 pt-md-2 info-box info-box-orangered">
					<b>{{ $t('Requirements') }}</b>
					<div v-if="product.requirements == null || product.requirements.length == 0 || product.requirements.length == 1 && product.requirements[0].item == null"><span>{{ $t('none') }}</span></div>
					<div v-else v-for="(reqt, index) in product.requirements" :key="index" class="text-left">
						<span v-if="user" class="pr-1">
							<i class="fas fa-check text-success" :title="$t('reqt_met')" v-if="reqt.met" ></i>
							<i class="fas fa-times-circle text-dark" :title="$t('reqt_not_met')" v-else></i>
							<!--<i class="fas fa-times text-brand" :title="$t('reqt_not_met')" v-else></i>-->
						</span>
						<span class="" v-if="reqt.item && reqt.item.toLowerCase() == 'User Rank'.toLowerCase()" :title="$t('user_rank_reqt').replace('_VAL_', reqt.level)">{{reqt.item}} &gt; {{reqt.level}}</span>
						<span v-else :title="$t('consumed_reqt').replace('_AMOUNT_', reqt.count).replace('_ITEM_', reqt.item).replace('_LEVEL_', reqt.level)">{{$t('At_Least')}} {{reqt.count}} '{{reqt.item}} {{$t('level_short')}} {{reqt.level}}' {{$t('consumed')}}</span>
					</div>
				  </div>
			   </div>
			   
			   <div class="row">
			     <div class="col-md-12 pb-md-2 pt-md-2 text-left">
					<b>{{ $t('details')}}: </b>{{this.product.description}}
				 </div>
			   </div>
		   
		   </div>
		   
		   <div v-else class="card-body pb-md-2 text-left">
				<b>{{ $t('details')}}: </b>{{this.product.description}}
		   </div>
		   
		  <div class="card-footer pb-md-2 text-center">
              <div v-if="product.type == 'ingame'">
				<a class="btn btn-danger btn-lg w-100 book-button" @click.prevent="activateGadget()" :class="productBuyColor" v-if="grabConsumableItem() && grabConsumableItem().status == 'bought'" >
					<span>{{ $t('activate_gadget') }}</span>&nbsp;
					<i class="fas fa-check text-success"></i>
				</a>
				<a class="btn btn-success btn-lg w-100 book-button" @click.prevent="deactivateGadget()" :class="productBuyColor" v-else-if="grabConsumableItem() && grabConsumableItem().status == 'active'">
					<span>{{ $t('deactivate_gadget') }}</span>&nbsp;
					<i class="fas fa-times text-brand"></i>
				</a>
				<div v-else>
					<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="buyNow()" :class="productBuyColor" style="float:left; border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo " src="/img/actifit_logo.png"></a>
					<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="buyNowHive()" :class="productBuyColor" style="border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.item_price * this.afitPrice.afitHiveLastPrice, 3)}} {{this.hive_currency}}<img class="token-logo " src="/img/HIVE.png"></a>
					<div class="row" v-if="buyHiveExpand">
					  <label for="active-key" class="p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="active-key" name="active-key" ref="active-key" class="form-control-lg w-50 p-2" v-model="userActvKey">
					</div>
					<div class="text-center" v-if="buyHiveExpand">
					  <button v-on:click="proceedBuyNowHive()" v-if="this.userTokens >= this.minAfitBuyTicket" class="btn btn-brand btn-lg border">{{ $t('Proceed') }}</button>
					  <button data-toggle="modal" v-else :data-target="'#buyOptionsModal'+_uid" class="btn btn-brand btn-lg border">{{ $t('Proceed') }}</button>
					</div>
					<div v-if="user && this.allReqtsFilled">
						<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="addCart()" style="float:left; border: 1px white solid;" v-if="this.cartEntries.filter(obj => obj._id === this.product._id).length < 1"><span v-html="$t('Add_Cart')"></span></a>
						<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="removeCart()" style="float:left; border: 1px white solid;" v-else ><span v-html="$t('Remove_Cart')"></span></a>
						<a class="btn btn-success btn-lg w-50 book-button" data-toggle="modal" data-target="#cartModal" style="float:left; border: 1px white solid;"><span v-html="$t('Checkout')"></span> </a>
					</div>
				</div>
			  </div>
			  <div v-else-if="!productBought && !this.errorProceed">
                <a class="btn btn-brand btn-lg w-50 book-button" @click.prevent="buyNow()" style="float:left; border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo " src="/img/actifit_logo.png"></a>
              </div>
			  <div v-else>
			    <div v-if="!this.downloadAgainReady">
				  <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="requestFundsPass = true">{{ $t('Download_again') }}</a>
				</div>
				<div v-if="this.requestFundsPass && !this.downloadAgainReady" class="pt-2">
				  <label for="funds-pass" class="w-50">{{ $t('Funds_Password') }}</label>
				  <input type="text" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control-lg w-50">
				  <a href="/wallet?action=set_funds_pass">{{ $t('No_funds_pass_wallet') }}</a>
				  <div class="pt-2">
				    <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="downloadAgain()">{{ $t('Proceed') }}</a>
				  </div>
				  <div v-if="this.errorDownloadAgain" v-html="this.errorDownloadAgain" class="text-brand"></div>
				</div>
				<div v-if="this.downloadAgainReady">
				  <div class="text-brand">{{ $t('download_ready_again_text') }}</div>
				  <a class="btn btn-brand btn-lg w-100 book-button" :href="this.downloadHref">
					<div @click="resetDownState">{{ $t('purchase_success_ebook_part2') }}</div>
				  </a>
				</div>
              </div>
		  </div>
		  <div v-if="grabConsumableItem()" class="card-footer pb-md-2 text-left">
			<div>
				<b>{{$t('Status')}}:</b>
				<span v-if="grabConsumableItem().status == 'active'" class="col-md-12 text-success" @click.prevent="deactivateGadget()"><i class="fas fa-toggle-on"></i>&nbsp;{{$t('Active')}}</span>
				<span v-else class="col-md-12 text-danger"><i class="fas fa-toggle-off" @click.prevent="activateGadget()"></i>&nbsp;{{$t('Inactive')}}</span>
			</div>
			<div v-if="prodHasFriendBenefic()">
				<b>{{$t('Benef_friend')}}:</b>
				<span v-if="grabConsumableItem().status == 'active'"><i class="fas fa-user-friends pl-2"></i>&nbsp;<a :href="'/'+grabConsumableItem().benefic" target="_blank">{{grabConsumableItem().benefic}}</a></span>
				<input type="text" name="friend" id="friend" ref="friend" class="form-control p-2" v-else :value="grabConsumableItem().benefic">
			</div>
			<b>{{$t('Remaining_boost')}}:</b> {{grabConsumableItem().span - grabConsumableItem().consumed}} {{$t('Activity_Reports')}}
		  </div>
		  <div v-if="product.type == 'ingame' && this.boughtCount > 0" class="card-footer">
			<div>
				<b>{{$t('bought_count')}}:</b> {{ this.boughtCount }}
			</div>
			<div>
				<b>{{$t('consumed_count')}}:</b> {{ this.consumedCount }}
			</div>
		  </div>
		  <div class="pb-md-2 text-center" v-if="buyAttempt">			  
              <div v-if="buyInProgress && errorProceed==''">
				<i class="fas fa-spin fa-spinner"></i>
			  </div>
			  <div v-if="errorProceed!=''">
                <span class="text-brand" v-html="this.errorProceed"></span>
				<a class="btn btn-brand" :href="this.firstDownloadHref" v-if="this.firstDownloadHref">
					<div @click="confirmBought">{{ $t('purchase_success_ebook_part2') }}</div>
				</a>
              </div>
			  <div v-if="!user">
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
		  
		  <BuyOptionsModal :id="'buyOptionsModal'+_uid" :ref="'buyOptionsModal'+_uid" :modalTitle="$t('Buy_product')" :modalText="$t('buy_now_modal_desc').replace('_AMNT_', minAfitBuyTicket)" @proceed-purchase="proceedBuyNowHive"/>
		  
		  <CartModal id="cartModal" ref="cartModal" :afitPrice="afitPrice" @refresh-tickets-multi="refreshTicketsMulti"/>
          
		<no-ssr>
		  <div>
			<notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
			<notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
		  </div>
		</no-ssr>
		  
		  
        </div>
		
</template>

<script>
  import {mapGetters} from 'vuex'
  
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import BuyOptionsModal from '~/components/BuyOptionsModal'
  import CartModal from '~/components/CartModal'
  

  export default {
    props: ['product', 'pros', 'userrank', 'gadgetStats', 'afitPrice'],
	components: {
		BuyOptionsModal,
		CartModal
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['userTokens']),
	  ...mapGetters(['cartEntries']),
	  productBuyColor () {
		if (!this.allReqtsFilled){ 
			return 'bg-secondary';
		}
		if (this.product.type == 'ingame' && this.product.count < 1){
			return 'bg-warning';
		}
		return '';
		
	  },
      date() {
        let date = new Date(this.product.approval_date)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
	  boughtCount () {
		if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0){
			return this.consumedCount + this.activeCount;
		}
		return 0;
	  },
	  consumedCount () {
		if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0){
			let entry = this.gadgetStats.find( entry => (entry._id.gadget === this.product._id && entry._id.status == 'consumed' ));
			if (entry){
				return entry.count;
			}
		}
		return 0;
	  },
	  activeCount () {
		if (this.user && this.product.type == 'ingame' && Array.isArray(this.gadgetStats) && this.gadgetStats.length > 0){
			let entry = this.gadgetStats.find( entry => (entry._id.gadget === this.product._id && entry._id.status == 'active' ));
			if (entry){
				return entry.count;
			}
		}
		return 0;
	  }
    }, 
	data: function(){
		return {
			detailsOpen: false,
			item_price: 0,
			consumed_count: 0,
			allReqtsFilled: false,
			item_currency: 'AFIT',
			hive_currency: 'HIVE',
			product_prov_pic: '',
			buyAttempt: false,
			buyHiveExpand: false,
			errorProceed: '',
			buyInProgress: false,
			productBought: false,
			requestFundsPass: false,
			downloadAgainRunning: false,
			errorDownloadAgain: '',
			downloadAgainReady: false,
			downloadHref: '',
			firstDownloadHref: '',
			boughtItems: [],
			profImgUrl: process.env.steemImgUrl,
			minAfitBuyTicket: process.env.minAfitBuyEarnTicket,
			userActvKey: '',
			prodRef: this,
		}
	},
	watch: {
	  product: 'getPrice',
	  pros: 'updateProPic',
	  user: 'allReqtsMet',
	  userrank: 'allReqtsMet',
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
	  
	  async addCart(){
		let res = await this.$store.commit('addCartEntry', this.product)
		if (res){
			this.$notify({
			  group: 'success',
			  text: this.$t('success_add_cart').replace('_PROD_',this.product.name+'-L'+this.product.level),//this.$t('session_expired_login_again'),
			  position: 'top center'
			})
		}
	  },
	  async removeCart(){
		let res = await this.$store.commit('removeCartEntry', this.product)
	  },
	  //handles checking all requirements for the product
	  async allReqtsMet (){
		//console.log('>>>>>>>allReqtsMet');
		if (Array.isArray(this.product.requirements) && this.product.requirements.length > 0){
			for (let i=0; i<this.product.requirements.length;i++){
				if (this.product.requirements[i].item){
					let outc = await this.reqtMet(this.product.requirements[i]);
					this.product.requirements[i].met = outc;
					if (!outc){
						this.allReqtsFilled = false;
						this.product.reqtsFilled = false;
						this.$emit('update-prod', this.product);
						return false;
					}
				}
			}
		}
		this.checkProductBought();
		/*console.log(this.product);
		console.log('final data');
		console.log(this.product.requirements);*/
		this.allReqtsFilled = true;
		this.product.reqtsFilled = true;
		this.$emit('update-prod', this.product);
		return true;
	  },
	  //checks whether the requirement for this product is met
	  async reqtMet (reqt){
		if (reqt.item.toLowerCase() == 'User Rank'.toLowerCase()){
			//console.log('>User Rank');
			//console.log(this.userrank);
			//console.log(reqt.level);
			//user rank case
			if (parseFloat(this.userrank) >= parseFloat(reqt.level)){
				return true;
			}
		}else{
			//console.log('>>else');
			//check if user meets current reqt conditions
			let query = await fetch(process.env.actiAppUrl
				+ 'gadgetBoughtName/'
				+ '?user=' + this.user.account.name
				+ '&gadget_name=' + reqt.item
				+ '&gadget_level=' + parseInt(reqt.level));
			let res = await query.json();
			//console.log(res);
			let consumed_cnt = 0;
			for (let i=0;i<res.length;i++){
				//console.log(res[i].status);
				if (res[i].status == 'consumed'){
					consumed_cnt += 1;
				}
			}
			//matches requirement
			if (parseFloat(consumed_cnt) >= parseFloat(reqt.count)){
				return true;
			}
		}
		return false;
	  },
	  resetDownState() {
		this.downloadAgainReady = false
		this.requestFundsPass = false
	  },
	  confirmBought() {
	    this.productBought = true;
		this.errorProceed = false;
		this.buyInProgress = false;
	  },
	  switchDetails(){
		this.detailsOpen = !this.detailsOpen;
	  },
	  setProductBought (json){
		if (Array.isArray(json) && json.length > 0
			|| (json.user && json.product_id)){
		  this.productBought = true;
		}
		if (Array.isArray(json) && json.length > 0){
			let consumed_cnt = 0;
			for (let i=0;i<json.length;i++){
				if (json[i].status == 'consumed'){
					consumed_cnt += 1;
				}
			}
			this.product.bought = true;
			this.$emit('update-prod', this.product);
			this.consumed_count = consumed_cnt;
			this.boughtItems = json;
		}else{
			/*this.product.bought = false;
			this.$emit('update-prod', this.product);*/
		}
		this.$forceUpdate();
	  },
	  grabConsumableItem() {
		if (Array.isArray(this.boughtItems) && this.boughtItems.length > 0){
			//console.log(this.boughtItems);
			let i = 0;
			let count = this.boughtItems.length;
			for (let i = 0 ; i < count; i++){
				let entry = this.boughtItems[i];
				if (entry.status !="consumed" && parseInt(entry.consumed) < parseInt(entry.span)){
					return entry;
				}
			}
		}
		return null;
	  },
	  getPrice() {
		if (this.product){
			let price_options = this.product.price;
			let price_options_count = price_options.length;
			for (let i=0; i < price_options_count; i++){
				let entry = price_options[i];
				this.item_price = entry.price;
				this.item_currency = entry.currency;
			}
			this.checkProductBought();
		}
		if (this.user){
			this.allReqtsMet();
		}
	  },
	  reject(e) {
		console.log(e);
	  },
	  checkProductBought() {
		//if this is a product, try to grab if sold before
		//let's check if user already has a funds pass set
		if (this.product && this.user){
		  if (this.product.type == 'ingame'){
			fetch(process.env.actiAppUrl
				+ 'gadgetBought/'
				+ '?user=' + this.user.account.name
				+ '&gadget_id=' + this.product._id).then(
				res => {res.json().then(json => this.setProductBought (json)).catch(e => this.reject(e))
			  }).catch(e => this.reject(e))
		  }else{
			  fetch(process.env.actiAppUrl
				+ 'productBought/'
				+ '?user=' + this.user.account.name
				+ '&product_id=' + this.product._id).then(
				res => {res.json().then(json => this.setProductBought (json)).catch(e => this.reject(e))
			  }).catch(e => this.reject(e))
		  }
		}
	  },
	  async downloadAgain() {
		this.downloadAgainRunning = true;
		this.errorDownloadAgain = '';
		if (this.$refs["funds-pass"].value == ''){
		  this.errorDownloadAgain = this.$t('Provide_funds_pass');
		  this.downloadAgainRunning = false;
		  return;
		}
		let url = new URL(process.env.actiAppUrl + 'validatePassForDownload/?user='+this.user.account.name+'&pass='+this.$refs['funds-pass'].value+'&product_id='+this.product._id);
		let res = await fetch(url);
		let outcome = await res.json();
		this.settingPass = false;
		//console.log(outcome);
		if (!outcome.error){
			//success
			this.downloadAgainReady = true;
			this.downloadHref = process.env.actiAppUrl 
								+ 'downEbook/'
								+ '?user=' + this.user.account.name
								+ '&product_id=' + this.product._id
								+ '&access_token=' + outcome.access_token
		}else{
			//display error
			this.errorDownloadAgain = outcome.error;
		}
		this.downloadAgainRunning = false;
	  },
	  async processTrxFunc(op_name, cstm_params){
		if (!localStorage.getItem('std_login')){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.block_num) {
				//console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			//console.log('broadcasting');
			console.log(operation);
			
			//console.log(this.$steemconnect.accessToken);
			//console.log(this.$store.state.accessToken);
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			//TODO: move support to hive as well - now it's failing with dsteem
			
			/*
			{ id: '8dbd67505244c12626ba6b16db8e7d9ea7517ba5',
			  block_num: 41846303,
			  trx_num: 1,
			  expired: false,
			  ref_block_num: 34317,
			  ref_block_prefix: 2366159845,
			  expiration: '2020-03-21T13:31:57',
			  operations: [ [ 'custom_json', [Object] ] ],
			  extensions: [],
			  signatures:
			   [ '1f2397bfc5100f56ad673bd47b53b5b6f9322c36b5abb26d87d4da2e0d1ec2901352fbe8832fddada800c66bd785014ce87949c1
			31f3a394d57ae6925fe16d6780' ] }
			{ tx:
			   { id: '8dbd67505244c12626ba6b16db8e7d9ea7517ba5',
				 block_num: 41846303,
				 trx_num: 1,
				 expired: false,
				 ref_block_num: 34317,
				 ref_block_prefix: 2366159845,
				 expiration: '2020-03-21T13:31:57',
				 operations: [ [Array] ],
				 extensions: [],
				 signatures:
				  [ '1f2397bfc5100f56ad673bd47b53b5b6f9322c36b5abb26d87d4da2e0d1ec2901352fbe8832fddada800c66bd785014ce8794
			9c131f3a394d57ae6925fe16d6780' ] } }
			(node:38336) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'transaction_ids' of null
				at DatabaseAPI.<anonymous> (C:\Mohammad\my own\steemit\actifit\actifit_newpost\actifitbot\actifitbot\node_
			modules\dsteem\lib\helpers\database.js:147:31)
				at Generator.next (<anonymous>)
				at fulfilled (C:\Mohammad\my own\steemit\actifit\actifit_newpost\actifitbot\actifitbot\node_modules\dsteem
			\lib\helpers\database.js:38:58)
				at process._tickCallback (internal/process/next_tick.js:68:7)
			(node:38336) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by th
			rowing inside of an async function without a catch block, or by rejecting a promise which was not handled with
			 .catch(). (rejection id: 7)
			*/
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			//let cur_bchain = 'STEEM';
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			//console.log(outcome);
			if (outcome.error){
				console.log(outcome.error);
				
				//if this is authority error, means needs to be logged out
				//example "missing required posting authority:Missing Posting Authority"
				let err_msg = outcome.trx.tx.error;
				if (err_msg.includes('missing') && err_msg.includes('authority')){
					//clear entry
					localStorage.removeItem('access_token');
					//this.$store.commit('setStdLoginUser', false);
					this.error_msg = this.$t('session_expired_login_again');
					this.$store.dispatch('steemconnect/logout');
				}
				
				this.$notify({
				  group: 'error',
				  text: err_msg,//this.$t('session_expired_login_again'),
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx.tx};
			}
		}
	  },
	  async buyNowHive () {
		//check if this is a game gadget and if reqts have been met
		this.buyAttempt = true;
		//this.buyInProgress = true;
		this.errorProceed = '';
		
		if (this.product.type == 'ingame'){
			if (!this.allReqtsFilled){
			  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
			  return;
			}
			
			if (this.product.count < 1){
			  this.errorProceed = this.$t('cannot_buy_none_available');
			  return;
			}
		}
		this.buyHiveExpand = !this.buyHiveExpand;
	  },
	  async proceedBuyNowHive (){
		try{
			console.log(this.product.name);
			this.buyAttempt = true;
			this.buyInProgress = true;
			this.errorProceed = '';
			console.log('proceedBuyNowHive');
			//making sure user is logged in 
			if (!this.user){
			  this.errorProceed = this.$t('need_login_signup_notice_vote');
			  return;
			}
			
			//check if this is a game gadget and if reqts have been met
			if (this.product.type == 'ingame'){
				if (!this.allReqtsFilled){
				  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
				  return;
				}
				
				if (this.product.count < 1){
				  this.errorProceed = this.$t('cannot_buy_none_available');
				  return;
				}
			}
			//check if active key was provided 
			//console.log(this.$refs);
			if (this.userActvKey == ''){
			  this.errorProceed = this.$t('all_fields_required');
			  return;
			}
			
			//proceed with payment
			//let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let payAmount = parseFloat(this.item_price * this.afitPrice.afitHiveLastPrice).toFixed(3);
			let memo = 'buy-gadget:'+this.product._id;
			let res = await hive.broadcast.transferAsync(this.userActvKey, this.user.account.name, process.env.actifitMarketBuy, payAmount + ' ' + 'HIVE', memo).then(
				res => this.confirmCompletion('transfer', payAmount, res)).catch(err=> this.errorCompletion(err));
				
		}catch(excp){
			console.log(excp);
		}
	  },
	  async errorCompletion(res){
		//console.log(res);
		let err_details = res;//JSON.parse();
		this.errorProceed = err_details.cause.message;
		//this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  async confirmCompletion (type, amount, res){
		if (res.block_num){
			//console.log (res);
			
			
			//only support HIVE
			let cur_bchain = 'HIVE';//(localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			let url = '';//new URL(process.env.actiAppUrl + 'processBuyOrderHive/?user='+this.user.account.name+'&product_id='+this.product._id);
			
			//if (this.product.type == 'ingame'){
				url = new URL( process.env.actiAppUrl + 'buyGadgetHive/'
								+ this.user.account.name + '/'
								+ this.product._id + '/'
								+ res.block_num + '/'
								+ res.id + '/'
								+ cur_bchain);
			//}
			//console.log(url);
			//connect with our service to process buy order
			try{
				let res = await fetch(url);
				let outcome = await res.json();
				if (outcome.error){
					this.errorProceed = outcome;
					console.error(outcome);
				}else{
					//update user token count
					
					//update product status
					this.checkProductBought();
					
					this.$store.dispatch('fetchProducts')
					
					if (this.product.type == 'service'){
						//display proper success message
						this.errorProceed = this.$t('purchase_success_service_part1') + this.product.name + ' ' 
											+ this.$t('With') + ' ' + this.product.provider_name + '.\n'
											+ this.$t('purchase_success_service_part2') + '.\n'
					}else if (this.product.type == 'ebook'){
						//display proper success message
						this.errorProceed = this.$t('purchase_success_ebook_part1') + ' ' + this.product.name + ' '
											+ this.$t('By') + ' ' + this.product.provider_name + '.<br/>';
						this.firstDownloadHref = process.env.actiAppUrl 
											+ 'downEbook/'
											+ '?user=' + this.user.account.name
											+ '&product_id=' + this.product._id
											+ '&access_token=' + outcome.access_token;
					}else if (this.product.type == 'ingame'){
						//display proper success message
						this.errorProceed = this.$t('purchase_success_ingame_part1') + ' ' + this.product.name + ' '
											+ this.$t('Level') + ' ' + this.product.level + '. ' + this.$t('purchase_success_ingame_part2') + '.<br/>';
											
						this.$emit('refresh-tickets');
					}
				}
				//this.checkingFunds = false;
				//this.resultReturned = true;
			
			}catch(err){
				console.error(err);
				//this.checkingFunds = false;
			}
			
			
			
			//also start validation and gadget lock process
			/*let url = new URL(process.env.actiAppUrl + 'confirmPaymentGadget/'+'?bchain=' + this.cur_bchain);
			//compile all needed data and send it along the request for processing
			let params = {
				from: this.user.account.name,
				
			}
			Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
			try{
				let res = await fetch(url);
				let outcome = await res.json();
				//update user data according to result
				this.fetchUserData();
			}catch(err){
				console.error(err);
			}*/
			
		}else{
			this.errorProceed = res.error.message;
		}
		this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  refreshTicketsMulti (){
		//update product status
		this.checkProductBought();
		
		this.$store.dispatch('fetchUserTokens')
		
		this.$store.dispatch('fetchProducts')
		
		this.$emit('refresh-tickets');
	  },
	  setProperNode (selectChain){
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		if (selectChain){
			cur_bchain = selectChain;
		}
		let properNode = hive;
		if (cur_bchain == 'STEEM'){
			properNode = steem;
		}
		console.log(cur_bchain);
		return properNode;
	  },
	  async buyNow() {
		this.buyAttempt = true;
		this.buyInProgress = true;
		this.errorProceed = '';
		
		//making sure user is logged in 
		if (!this.user){
		  this.errorProceed = this.$t('need_login_signup_notice_vote');
		  return;
		}
		
		//check if this is a game gadget and if reqts have been met
		if (this.product.type == 'ingame'){
			if (!this.allReqtsFilled){
			  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
			  return;
			}
			
			if (this.product.count < 1){
			  this.errorProceed = this.$t('cannot_buy_none_available');
			  return;
			}
		}
		//first check if user has enough AFIT
		if (this.user){
		  if (this.userTokens < this.item_price){
			this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here') ;
			//console.log(this.errorProceed );
			return;
		  }
		}
		//show user confirm for purchasing product/service
		let user_prmpt =  this.$t('purchase_confirm_part1') + this.product.name + ' ' + this.product.type + '.\n' 
					+ this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n' 
					+ this.$t('Proceed') + '?';
		if (this.product.type == 'ingame'){
			user_prmpt =  this.$t('purchase_confirm_part1') + this.product.name + ' Level ' + this.product.level + ' ' + this.product.type + ' virtual gadget' + '.\n' 
					+ this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n' 
					+ this.$t('Proceed') + '?';
		}
		let decis = confirm(user_prmpt);
		if (!decis){
			this.buyInProgress = false;
			return;
		}
		
		//broadcast trx to blockchain
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: "{ \"buy_product\": \""+this.product._id+"\"}"
		  };
		
		if (this.product.type == 'ingame'){
			//different tx
			cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'actifit',
				json: "{\"transaction\": \"buy-gadget\" , \"gadget\": \""+this.product._id+"\"}"
			  };
		}
		let bcastRes;
		
		let res = await this.processTrxFunc('custom_json', cstm_params);
		//console.log(res);
		if (res.success){
			bcastRes = res.trx;
		}else{
			console.log(err);
		}
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let url = new URL(process.env.actiAppUrl + 'processBuyOrder/?user='+this.user.account.name+'&product_id='+this.product._id);
		
		if (this.product.type == 'ingame'){
			url = new URL( process.env.actiAppUrl + 'buyGadget/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							+ bcastRes.block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain);
		}
		//console.log(url);
		//connect with our service to process buy order
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.error){
				this.errorProceed = outcome;
				console.error(outcome);
			}else{
				//update user token count
				this.$store.dispatch('fetchUserTokens')
				
				//update product status
				this.checkProductBought();
				
				this.$store.dispatch('fetchProducts')
				
				if (this.product.type == 'service'){
					//display proper success message
					this.errorProceed = this.$t('purchase_success_service_part1') + this.product.name + ' ' 
										+ this.$t('With') + ' ' + this.product.provider_name + '.\n'
										+ this.$t('purchase_success_service_part2') + '.\n'
				}else if (this.product.type == 'ebook'){
					//display proper success message
					this.errorProceed = this.$t('purchase_success_ebook_part1') + ' ' + this.product.name + ' '
										+ this.$t('By') + ' ' + this.product.provider_name + '.<br/>';
					this.firstDownloadHref = process.env.actiAppUrl 
										+ 'downEbook/'
										+ '?user=' + this.user.account.name
										+ '&product_id=' + this.product._id
										+ '&access_token=' + outcome.access_token;
				}else if (this.product.type == 'ingame'){
					//display proper success message
					this.errorProceed = this.$t('purchase_success_ingame_part1') + ' ' + this.product.name + ' '
										+ this.$t('Level') + ' ' + this.product.level + '. ' + this.$t('purchase_success_ingame_part2') + '.<br/>';
				}
			}
			//this.checkingFunds = false;
			//this.resultReturned = true;
		
		}catch(err){
			console.error(err);
			//this.checkingFunds = false;
		}
	  },
	  prodHasFriendBenefic() {
		//console.log('prodHasFriendBenefic');
		//console.log(this.product.benefits.boosts);
		if (Array.isArray(this.product.benefits.boosts) && this.product.benefits.boosts.length>0){
			let maxCount = this.product.benefits.boosts.length;
			for (let i=0;i<maxCount;i++){
				if (this.product.benefits.boosts[i].boost_beneficiary == 'friend'){
					return true;
				}
			}
		}
		return false;
	  },
	  async activateGadget() {
		
		//clear error
		this.errorProceed = '';
		
		this.buyAttempt = true;
		this.buyInProgress = true;
		let appendFriend = null;
		//need to make sure we have a target friend set in special boost types
		if (this.prodHasFriendBenefic()){
			if (this.$refs["friend"].value == ''){
			  this.errorProceed = this.$t('Provide_friend_name_receive_boost');
			  return;
			}
			if (this.$refs["friend"].value.replace('@','') == this.user.account.name){
			  this.errorProceed = this.$t('Cannot_use_same_account');
			  return;
			}
			appendFriend = this.$refs["friend"].value;
		}
		
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: "{\"transaction\": \"activate-gadget\" , \"gadget\": \""+this.product._id+"\"}"
		};
		if (appendFriend){
			cstm_params['json'] = "{\"transaction\": \"activate-gadget\" , \"gadget\": \""+this.product._id+"\", \"benefic\": \""+appendFriend+"\"}";
		}
		let bcastRes;
		
		let res = await this.processTrxFunc('custom_json', cstm_params);
		//console.log(res);
		if (res.success){
			bcastRes = res.trx;
		}else{
			console.log(err);
		}
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let url_string = process.env.actiAppUrl + 'activateGadget/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							+ bcastRes.block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain;
		//console.log('prodHasFriendBenefic');
		if (appendFriend){
			//console.log(this.$refs["friend"].value);
			url_string += '/' + appendFriend;
		}
		let	url = new URL( url_string );
		
		//console.log(url);
		//connect with our service to process buy order
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.error){
				this.errorProceed = outcome;
				console.error(outcome);
			}else{
				//update product status
				this.checkProductBought();
				//notify parent to refresh products
				//this.$emit('refresh-prods');
				this.$store.dispatch('fetchProducts')
				
				//display proper success message
				this.errorProceed = this.$t('gadget_activated').replace('_GADGET_', this.product.name + ' '
									+ this.$t('Level') + ' ' + this.product.level) + '.<br/>';
			}
			//this.checkingFunds = false;
			//this.resultReturned = true;
		
		}catch(err){
			console.error(err);
			//this.checkingFunds = false;
		}
		this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  async deactivateGadget() {
	  		
		//clear error
		this.errorProceed = '';	
			
		this.buyAttempt = true;
		this.buyInProgress = true;
	  
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: "{\"transaction\": \"deactivate-gadget\" , \"gadget\": \""+this.product._id+"\"}"
		};
		let bcastRes;
		
		let res = await this.processTrxFunc('custom_json', cstm_params);
		//console.log(res);
		if (res.success){
			bcastRes = res.trx;
		}else{
			console.log(err);
		}
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let	url = new URL( process.env.actiAppUrl + 'deactivateGadget/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							+ bcastRes.block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain
							);
		
		//console.log(url);
		//connect with our service to process buy order
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.error){
				this.errorProceed = outcome;
				console.error(outcome);
			}else{
				//update product status
				this.checkProductBought();
				//notify parent to refresh products
				//this.$emit('refresh-prods');
				this.$store.dispatch('fetchProducts')
				
				//display proper success message
				this.errorProceed = this.$t('gadget_deactivated').replace('_GADGET_', this.product.name + ' '
									+ this.$t('Level') + ' ' + this.product.level) + '.<br/>';
			}
			//this.checkingFunds = false;
			//this.resultReturned = true;
		
		}catch(err){
			console.error(err);
			//this.checkingFunds = false;
		}
		
		this.buyAttempt = false;
		this.buyInProgress = false;
	  },
	  updateProPic() {
		let pros_length = this.pros.length;
		for (let i=0; i<pros_length; i++){
		  if (this.product.provider == this.pros[i].username){
			this.product_prov_pic = this.pros[i].pic;
			break;
		  }
		}
		if (this.product_prov_pic == ''){
			//still no pic, grab steemit default one
			this.profImgUrl = process.env.hiveImgUrl;
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			if (cur_bchain == 'STEEM'){
				this.profImgUrl = process.env.steemImgUrl;
			}
			this.product_prov_pic = this.profImgUrl+'/u/' + this.product.provider + '/avatar';
		}
	  },
	},
	async mounted () {
		this.getPrice();
		this.updateProPic();
	},
	
  }
</script>

<style>
	.card-border{
	  border: 2px solid #dc3545!important;
	  border-radius: 10px;
	}
	.pro-img-cls{
	  width: 100%;
	}
	.pro-card{
	  /*width: 400px;*/
	}
	.pro-name{
	  background: radial-gradient(red, transparent);
      color: white;
	}
	.book-button{
	  color: white !important;
	}
	.product-type{
      text-transform: capitalize;
    }
	.pro-card-av{
	  width: 90px;
	  height: 90px;
	}
	.gaming-label{
	  width: 45px;
	  height: 45px;
	  border: none;
	}
	.token-logo{
	  width: 20px;
	  height: 20px;
	}
	div.basic-info{
	  border-bottom: 2px solid #dc3545!important;
	}
	.color-box-afit {float:left; background-color:darkred; width: 20px; height: 20px; margin: 1px;}
	.color-box-sports {float:left; background-color:#00f; width: 20px; height: 20px; margin: 1px;}
	.color-box-steem {float:left; background-color:#029; width: 20px; height: 20px; margin: 1px;}
	.color-box-rank {float:left; background-color:#092; width: 20px; height: 20px; margin: 1px;}
	.avatar-1{
		
	}
	.avatar-2{
		border-color: orange;
	}
	.avatar-3{
		border-color: red;
	}
	.info-box{
		border: 1px white solid;
		color: white;
	}
	.info-box-red{
		background: red;
	}
	.info-box-orangered{
		background: orangered;
	}
	.info-box-green{
		background: #28a700;
	}
	.card-section{
	}
</style>
