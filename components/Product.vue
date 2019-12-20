<template>
  <!-- single card item for approved product -->	
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center card-border pro-card col-sm-3">
		  <div class="text-center card-section">
		    <div class="row basic-info">
			  <h3 class="pro-name col-md-12">{{ this.product.name}}<span v-if="!product.specialevent && this.product.level">{{$t('level_short')}}{{this.product.level}}</span>
			  </h3>
			  
			  <div v-if="this.product.type == 'ingame'" class="col-md-4" :title="!product.specialevent?this.product.name + ' - Level ' + this.product.level:this.product.name">
				<div :class="'avatar-'+this.product.level" class="avatar pro-card-av mx-auto" :style="'background-image: url(img/gadgets/' + this.product.image + ');'"></div>
				<span v-for="iterl in this.product.level" :key="iterl">
					<i class="fas fa-star text-brand"></i>
				</span>
			  </div>
			  <div v-else class="col-md-4">	
				<a :href="'/' + this.product.provider">
				<div class="avatar pro-card-av mx-auto mb-3" :style="'background-image: url(' + product_prov_pic + ');'"></div>
				</a>
			  </div>
			  <div class="col-md-8">
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
		  <div class="pb-md-2 text-left card-section" v-if="this.product.type != 'ingame'">
			<b>{{ $t('price')}}: </b>{{numberFormat(this.item_price, 2)}} {{this.item_currency}}
		  </div>
		  
		  <div class="card-section" v-if="this.product.type == 'ingame'">
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
		   
		   </div>
		   <div class="card-section pb-md-2 text-left">
			<b>{{ $t('details')}}: </b>{{this.product.description}}
		  </div>
		  <div class="card-section pb-md-2 text-center">
              <div v-if="product.type == 'ingame'">
				<a class="btn btn-danger btn-lg w-100 book-button" @click.prevent="activateGadget()" :class="allReqtsFilled ? '':'bg-secondary'" v-if="grabConsumableItem() && grabConsumableItem().status == 'bought'" >
					<span>{{ $t('activate_gadget') }}</span>&nbsp;
					<i class="fas fa-check text-success"></i>
				</a>
				<a class="btn btn-success btn-lg w-100 book-button" @click.prevent="deactivateGadget()" :class="allReqtsFilled ? '':'bg-secondary'" v-else-if="grabConsumableItem() && grabConsumableItem().status == 'active'">
					<span>{{ $t('deactivate_gadget') }}</span>&nbsp;
					<i class="fas fa-times text-brand"></i>
				</a>
				<a class="btn btn-success btn-lg w-100 book-button" @click.prevent="buyNow()" :class="allReqtsFilled ? '':'bg-secondary'" v-else>{{ $t('Buy_now') }} {{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo " src="/img/actifit_logo.png"></a>
			  </div>
			  <div v-else-if="!productBought">
                <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="buyNow()" v-if="!this.errorProceed" >{{ $t('Buy_now') }} {{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo " src="/img/actifit_logo.png"></a>
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
		  <div v-if="grabConsumableItem()" class="card-section pb-md-2 text-left">
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
		  <div v-if="product.type == 'ingame' && this.boughtCount > 0">
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
					<a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
				  </div>
				  <div class="w-50">
					<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
				  </div>
				</div>
			  </div>
		  </div>
          
        </div>
		
</template>

<script>
  import {mapGetters} from 'vuex'
  
  import steem from 'steem'

  export default {
    props: ['product', 'pros', 'userrank', 'gadgetStats'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['userTokens']),
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
			product_prov_pic: '',
			buyAttempt: false,
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
		}
	},
	watch: {
	  product: 'getPrice',
	  pros: 'updateProPic',
	  user: 'allReqtsMet',
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
	  //handles checking all requirements for the product
	  async allReqtsMet (){
		console.log('>>>>>>>allReqtsMet');
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
		//console.log('>reqtMet');
		if (reqt.item.toLowerCase() == 'User Rank'.toLowerCase()){
			//user rank case
			if (parseFloat(this.userrank) >= parseFloat(reqt.level)){
				return true;
			}
		}else{
			//console.log('>>else');
			//check if user meets current reqt conditions
			let query = await fetch(process.env.actiAppUrl
				+ 'gadgetBoughtName/'
				+ '?user=' + this.$store.state.steemconnect.user.name 
				+ '&gadget_name=' + reqt.item
				+ '&gadget_level=' + parseInt(reqt.level));
			let res = await query.json();
			//console.log(res);
			let consumed_cnt = 0;
			for (let i=0;i<res.length;i++){
				console.log(res[i].status);
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
			console.log(this.boughtItems);
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
				+ '?user=' + this.$store.state.steemconnect.user.name 
				+ '&gadget_id=' + this.product._id).then(
				res => {res.json().then(json => this.setProductBought (json)).catch(e => this.reject(e))
			  }).catch(e => this.reject(e))
		  }else{
			  fetch(process.env.actiAppUrl
				+ 'productBought/'
				+ '?user=' + this.$store.state.steemconnect.user.name 
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
		console.log(outcome);
		if (!outcome.error){
			//success
			this.downloadAgainReady = true;
			this.downloadHref = process.env.actiAppUrl 
								+ 'downEbook/'
								+ '?user=' + this.$store.state.steemconnect.user.name 
								+ '&product_id=' + this.product._id
								+ '&access_token=' + outcome.access_token
		}else{
			//display error
			this.errorDownloadAgain = outcome.error;
		}
		this.downloadAgainRunning = false;
	  },
	  async buyNow() {
		this.buyAttempt = true;
		this.buyInProgress = true;
		this.errorProceed = '';
		
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
		if (!this.user){
		  this.errorProceed = this.$t('need_login_signup_notice_vote');
		  return;
		}
		if (this.user){
		  if (this.userTokens < this.item_price){
			this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here') ;
			console.log(this.errorProceed );
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
		let qRes = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err, res) => {
		  if (err) {
			console.log(err);
		  }else{
			bcastRes = res.result;
		  }
		});
		
		
		let url = new URL(process.env.actiAppUrl + 'processBuyOrder/?user='+this.$store.state.steemconnect.user.name+'&product_id='+this.product._id);
		
		if (this.product.type == 'ingame'){
			url = new URL( process.env.actiAppUrl + 'buyGadget/'
							+ this.$store.state.steemconnect.user.name + '/'
							+ this.product._id + '/'
							+ bcastRes.block_num + '/'
							+ bcastRes.id);
		}
		console.log(url);
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
										+ '?user=' + this.$store.state.steemconnect.user.name 
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
		console.log('prodHasFriendBenefic');
		console.log(this.product.benefits.boosts);
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
		let qRes = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err, res) => {
		  if (err) {
			console.log(err);
		  }else{
			bcastRes = res.result;
		  }
		});
		let url_string = process.env.actiAppUrl + 'activateGadget/'
							+ this.$store.state.steemconnect.user.name + '/'
							+ this.product._id + '/'
							+ bcastRes.block_num + '/'
							+ bcastRes.id;
		console.log('prodHasFriendBenefic');
		if (appendFriend){
			console.log(this.$refs["friend"].value);
			url_string += '/' + appendFriend;
		}
		let	url = new URL( url_string );
		
		console.log(url);
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
		let qRes = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err, res) => {
		  if (err) {
			console.log(err);
		  }else{
			bcastRes = res.result;
		  }
		});
		
		let	url = new URL( process.env.actiAppUrl + 'deactivateGadget/'
							+ this.$store.state.steemconnect.user.name + '/'
							+ this.product._id + '/'
							+ bcastRes.block_num + '/'
							+ bcastRes.id);
		
		console.log(url);
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
			this.product_prov_pic = 'https://steemitimages.com/u/' + this.product.provider + '/avatar';
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
