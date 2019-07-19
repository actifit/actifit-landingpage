<template>
  <!-- single card item for approved product -->	
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center card-border pro-card col-sm-3">
		  <div class="text-center">
		    <div class="row basic-info">
			  <h2 class="pro-name col-md-12">{{ this.product.name}}
				<span v-if="this.product.type == 'ebook'"><i class="fas fa-book"></i></span>
				<span v-else-if="this.product.type == 'service'"><i class='fas fa-phone-volume'></i></span>
			  </h2>
			  
			  <div class="col-md-6">
				  <h3 class="product-type">{{ this.product.type}} {{ $t('By') }} <br/> 
					<a v-if="this.product.type == 'service'" :href="'/consultants/?prof=' + this.product.provider_name" >{{ this.product.provider_name}}</a>
					<a v-else :href="'/' + this.product.provider" >{{ this.product.provider_name}}</a>
				  </h3>
			  </div>
			  <div class="col-md-6">	
				<a :href="'/' + this.product.provider">
				<div class="avatar pro-card-av mx-auto mb-3" :style="'background-image: url(' + product_prov_pic + ');'"></div>
				</a>
			  </div>
			</div>  
		  </div>
		  <div class="pb-md-2 text-left">
			<b>{{ $t('details')}}: </b>{{this.product.description}}
		  </div>
		  <div class="pb-md-2 text-left">
			<b>{{ $t('price')}}: </b>{{numberFormat(this.item_price, 2)}} {{this.item_currency}}
		  </div>
		  <div class="pb-md-2 text-center">
              <div v-if="!productBought">
                <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="buyNow()" v-if="!this.errorProceed" >{{ $t('Buy_now') }}</a>
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
    props: ['product', 'pros'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['userTokens']),
      date() {
        let date = new Date(this.product.approval_date)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
	  
    }, 
	data: function(){
		return {
			detailsOpen: false,
			item_price: 0,
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
		}
	},
	watch: {
	  product: 'getPrice',
	  pros: 'updateProPic',
	  user: 'checkProductBought',
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
	  resetDownState() {
		this.downloadAgainReady = false
		this.requestFundsPass = false
	  },
	  confirmBought() {
	    console.log('YEHA');
	    this.productBought = true;
		this.errorProceed = false;
		this.buyInProgress = false;
	  },
	  switchDetails(){
		this.detailsOpen = !this.detailsOpen;
	  },
	  setProductBought (json){
		if (json.user && json.product_id){
		  this.productBought = true;
		}
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
	  },
	  reject(e) {
		console.log(e);
	  },
	  checkProductBought() {
		//if this is a product, try to grab if sold before
		//let's check if user already has a funds pass set
		if (this.product && this.user){
		  fetch(process.env.actiAppUrl
			+ 'productBought/'
			+ '?user=' + this.$store.state.steemconnect.user.name 
			+ '&product_id=' + this.product._id).then(
			res => {res.json().then(json => this.setProductBought (json)).catch(e => this.reject(e))
		  }).catch(e => this.reject(e))
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
		let decis = confirm( this.$t('purchase_confirm_part1') + this.product.name + ' ' + this.product.type + '.\n' 
					+ this.$t('purchase_confirm_part2') + this.numberFormat(this.item_price, 2) + ' ' + this.item_currency + '.\n' 
					+ this.$t('Proceed') + '?');
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
  
		let res = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err) => {
		  if (err) {
			console.log(err);
		  }
		});
		
		
		let url = new URL(process.env.actiAppUrl + 'processBuyOrder/?user='+this.$store.state.steemconnect.user.name+'&product_id='+this.product._id);
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
				}
			}
			//this.checkingFunds = false;
			//this.resultReturned = true;
		
		}catch(err){
			console.error(err);
			//this.checkingFunds = false;
		}
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
	.numberCircle {
	  border-radius: 50%;
	  width: 10px;
	  line-height: 10px;
	  padding: 4px 2px 4px 2px;
	  margin-left: 4px;
	  background: #fff;
	  border: 2px solid;
	  text-align: center;
	  vertical-align:middle;
	}
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
	div.basic-info{
	  border-bottom: 2px solid #dc3545!important;
	}
</style>
