<template>
  <!-- single card item for approved product -->	
        <div class="card form mx-auto p-3 mt-3 mt-md-5 text-center pro-card col-sm-4" :class="productTypeBorder">
		  <div class="text-center card-header">
		    <div class="row basic-info">
			  <h3 class="pro-name col-md-12">{{ this.product.name}}<span v-if="!product.specialevent && this.product.level">{{$t('level_short')}}{{this.product.level}}</span>
			  </h3>
			  
			  <div v-if="this.product.type == 'ingame' || this.product.type == 'real'" class="col-md-6" :title="!product.specialevent?this.product.name + ' - Level ' + this.product.level:this.product.name">
				<div v-if="this.product.image.startsWith('http')" :class="'avatar-'+this.product.level" class="avatar pro-card-av mx-auto" :style="'background-image: url(' + this.product.image + ');'"></div>
				<div v-else :class="'avatar-'+this.product.level" class="avatar pro-card-av mx-auto" :style="'background-image: url(img/gadgets/' + this.product.image + ');'"></div>
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
				  <h3 class="product-type">{{ renderProdType}} <span v-if="this.product.type != 'ingame' && this.product.type != 'real'">{{ $t('By') }}</span> <br/> 
					<a v-if="this.product.type == 'service'" :href="'/consultants/?prof=' + this.product.provider_name" >{{ this.product.provider_name}}</a>
					<a v-else :href="'/' + this.product.provider" >{{ this.product.provider_name}}</a>
					<span v-if="this.product.type=='real'">
						<span v-if="this.item_price_extra>0"><img class="token-logo-md " src="/img/HIVE.png">+</span>
						<span><img class="token-logo-md " src="/img/actifit_logo.png"></span>
					</span>
				  </h3>
				  <!--<div class="pb-md-2 text-left" >
					<b>{{ $t('price')}}: </b>{{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo" src="/img/actifit_logo.png">
				  </div>-->
			  </div>
			</div>
			<div class="row expansion-arrow">
				<a class="arrow-icon" v-on:click="switchArrowStatus" :class="prodDispStatus" :title="prodDispStatusText">
				  <span class="left-bar"></span>
				  <span class="right-bar"></span>
				</a>
			</div>
		  </div>
		  <transition name="body-expan">
		  <div class="body-container" v-if="this.prodDispStatus == 'open'">
		  <div class="card-body" v-if="this.product.type == 'real'">
			  <div class="row text-info pt-1">
				<div class="pb-md-2 pt-md-2 col-12 text-center info-box info-box-orangered">
				  <b>{{ $t('Available')}}</b><br/>{{this.product.count}} {{$t('units')}}
				</div>
			  </div>
			  <div class="row">
				<div class="col-md-12 pb-md-2 pt-md-2 info-box info-box-orangered">
					<b>{{ $t('Requirements') }}</b>
					<div v-if="product.requirements == null || product.requirements.length == 0 || product.requirements.length == 1 && product.requirements[0].item == null"><span>{{ $t('none') }}</span></div>
					<div v-else v-for="(reqt, index) in product.requirements" :key="index" class="text-left">
						<div>
							<span v-if="user" class="pr-1">
								<i class="fas fa-check text-success" :title="$t('reqt_met')" v-if="reqt.met" ></i>
								<i class="fas fa-times-circle text-dark" :title="$t('reqt_not_met')" v-else></i>
								<!--<i class="fas fa-times text-brand" :title="$t('reqt_not_met')" v-else></i>-->
							</span>
							<span v-if="reqt.item && reqt.item.toLowerCase() == 'User Rank'.toLowerCase()" :title="$t('user_rank_reqt').replace('_VAL_', reqt.level)">{{reqt.item}} &gt; {{reqt.level}}</span>
							<span v-else-if="reqt.item && reqt.item.toLowerCase() == 'AFIT'.toLowerCase()" :title="$t('afit_reqt').replace('_VAL_', reqt.count)">{{$t('user_afit_balace')}} &gt;= {{reqt.count}} {{reqt.item}} 
							
							</span>
							<span v-else :title="$t('consumed_reqt').replace('_AMOUNT_', reqt.count).replace('_ITEM_', reqt.item).replace('_LEVEL_', reqt.level)">{{$t('At_Least')}} {{reqt.count}} '{{reqt.item}} {{$t('level_short')}} {{reqt.level}}' {{$t('consumed')}}</span>
						</div>
						<!--<div v-if="user && reqt.item && reqt.item.toLowerCase() == 'AFIT'.toLowerCase()" >
							<div v-if="!proceedBuyAFIT" class="text-right p-2">
								<button v-on:click="proceedBuyAFIT=true" class="btn btn-brand btn-lg border">{{ $t('Buy_afit_now') }}</button>
							</div>
							<div v-else class="bg-light text-brand text-center w-100 p-2 rounded-top"><h4>{{ $t('buy_afit_title') }}</h4><small>{{ $t('afit_buy_notice') }}</small></div>
						</div>-->
						<div v-if="proceedBuyAFIT" class="bg-light text-brand rounded-bottom p-1">
							<div class="row" >
							  <div class="w-25 m-1 text-right" :value="reqt.count">{{ $t('AFIT_Amount') }}</div>
							  <input type="number" id="afit-amount-buy" name="afit-amount-buy" ref="afit-amount-buy" class="form-control-lg w-50 m-1" v-model="afitBuyAmount"><img src="/img/actifit_logo.png" class="mr-1 token-logo-md"> 
							</div>
							<div class="row" >
							  <div class="w-25 m-1 text-right">{{ $t('HIVE_Amount') }}</div>
							  <input type="number" id="hive-amount-pay" name="hive-amount-pay" ref="hive-amount-pay" class="form-control-lg w-50 m-1" readonly="readonly" :value="getMatchingHIVE()">
							  <img src="/img/HIVE.png" class="mr-2 token-logo-md">
							</div>
							<div class="row" v-if="!isKeychainActive && !isHiveauthActive" >
								<div class="w-25 m-1 text-right">{{ $t('Active_Key') }}</div>
								<input type="password" id="active-key" name="active-key" ref="active-key" class="form-control-lg w-50 m-1" v-model="userActvKeyHv">
							</div>
							<div class="text-center">
							  <button v-on:click="buyAFITNow" class="btn btn-brand btn-lg p-2 border">{{ $t('Proceed') }}</button>
							  <button v-on:click="proceedBuyAFIT=false" class="btn btn-brand btn-lg p-2 border">{{ $t('Cancel') }}</button>
							</div>
							<div class="row">
							  <div class="w-25"></div>
							  <div v-if="buyAfitInProgress" class="w-50 text-brand">
								<i class="fas fa-spin fa-spinner"></i>{{ $t('confirming_buy_transaction') }}
							  </div>
							  <div v-else-if="afit_buy_err_msg" class="w-75 text-brand">
								{{ afit_buy_err_msg }}
							  </div>
							</div>
						</div>
					</div>
					
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
		   
		   <div v-if="product.type == 'real'" class="card-body pb-md-2 text-left">
				<!--<b>{{ $t('Delivery')}}: </b>{{this.product.delivery}}-->
				
				<!--<LightBox :media="media" ></LightBox>-->
				<div class="lbox-container mb-2">
					<div >
						<b>{{ $t('product_images') }}</b>
						<br />
					</div>
					<div class="col-9">
						<lightbox css="h-200 h-lg-250 w-200" :cells="2" :items="product.prodImages"></lightbox>
					</div>
				</div>
		   </div>
		   
			<div v-if="user && product.type == 'real' && !checkout_product && realProdBuyStatus" class="card-body pb-md-2 text-left">
				<b>{{ $t('order_quantity')}} </b>
				<select v-model="order_quantity" class="col-6 form-control sel-adj">
					<option value="1" selected>1</option>
					<option v-if="product.allowedQuantity && quant < product.allowedQuantity" v-for="quant in product.allowedQuantity" :value="quant+1" :key="quant+1">{{quant+1}}</option>
				</select>
			</div>
			
			<div v-if="user && product.type == 'real' && !checkout_product && realProdBuyStatus && product.colorOptions" class="card-body pb-md-2 text-left">
				<b>{{ $t('color_choice')}} </b>
				<select v-model="color_choice" class="col-6 form-control sel-adj">
					<option v-if="Array.isArray(product.colorOptions) && product.colorOptions.length > 0" v-for="colr in product.colorOptions" :value="colr" :key="colr">{{colr}}</option>
				</select>
			</div>
			
		   </div> <!-- body-container -->
		   </transition>
		  <div class="card-footer pb-md-2 text-center">
              <div v-if="product.type == 'real'">
				<a v-if="!checkout_product && realProdBuyStatus" class="btn btn-success btn-lg book-button" @click.prevent="prepareCheckout()" :class="productBuyColor" style="float:left; border: 1px white solid;">{{ $t('Buy_now') }} <br/>
				<span v-if="this.item_price_extra > 0">{{numberFormat(this.item_price_extra, 2)}} {{this.item_extra_currency}}<img class="token-logo-sm " src="/img/HIVE.png">+</span>
				{{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo-sm " src="/img/actifit_logo.png">
				</a>
				<span v-else-if="!checkout_product" >
					<span style='color:green'>{{$t('pending_real_order_notification') }}</span>
					<div v-for="(entry, index) in pendingOrders" :key="index" :entry="entry">
						<span style='color:green'><i class="fas fa-check text-success"></i>{{$t('item_bought')}} {{showDate(entry.date_bought)}} {{$t('with_status')}} {{ entry.status}}</span>
					</div>
					<!-- confirm order button -->
					<textarea rows="4" cols="30" class="text-brand" ref="prodFeedback" id="prodFeedback" :placeholder="$t('your_feedback')">
					</textarea >
					
					<a class="btn btn-success btn-lg book-button" @click.prevent="confirmReceipt()">{{ $t('confirm_receipt') }}</a>
					
				</span>
			  </div>
			  <div v-else-if="product.type == 'ingame'">
				<a class="btn btn-danger btn-lg w-100 book-button" @click.prevent="activateGadget()" :class="productBuyColor" v-if="grabConsumableItem() && grabConsumableItem().status == 'bought'" >
					<span>{{ $t('activate_gadget') }}</span>&nbsp;
					<i class="fas fa-check text-success"></i>
				</a>
				<a class="btn btn-success btn-lg w-100 book-button" @click.prevent="deactivateGadget()" :class="productBuyColor" v-else-if="grabConsumableItem() && grabConsumableItem().status == 'active'">
					<span>{{ $t('deactivate_gadget') }}</span>&nbsp;
					<i class="fas fa-times text-brand"></i>
				</a>
				<div v-else>
					<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="buyNow()" :class="productBuyColor" style="float:left; border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo-sm " src="/img/actifit_logo.png"></a>
					<a class="btn btn-success btn-lg w-50 book-button" @click.prevent="buyNowHive()" :class="productBuyColor" style="border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.item_price * this.afitPrice.afitHiveLastPrice, 3)}} {{this.hive_currency}}<img class="token-logo-sm " src="/img/HIVE.png"></a>
					<div class="row" v-if="buyHiveExpand && !isKeychainActive && !isHiveauthActive">
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
                <a class="btn btn-brand btn-lg w-50 book-button" @click.prevent="buyNow()" style="float:left; border: 1px white solid;">{{ $t('Buy_now') }} <br/> {{numberFormat(this.item_price, 2)}} {{this.item_currency}}<img class="token-logo-sm " src="/img/actifit_logo.png"></a>
              </div>
			  <div v-else>
			    <div v-if="!this.downloadAgainReady">
				  <a class="btn btn-brand btn-lg w-100 book-button" @click.prevent="requestFundsPass = true">{{ $t('Download_again') }}</a>
				</div>
				<div v-if="this.requestFundsPass && !this.downloadAgainReady" class="pt-2">
				  <label for="funds-pass" class="w-100">{{ $t('Funds_Password') }}</label>
				  <input type="text" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control-lg w-100">
				  <a href="/wallet?action=set_funds_pass">{{ $t('No_funds_pass_wallet') }}&nbsp;
				  <i class="fas fa-solid fa-wallet"></i></a>
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
		  <div v-if="checkout_product">
			<div v-if="item_price_extra > 0 && !isKeychainActive && !isHiveauthActive">
				<label for="active-key" class="p-2">{{ $t('Active_Key') }} *</label>
				<input type="password" id="rl-active-key" name="rl-active-key" ref="rl-active-key" class="form-control-lg w-50 p-2" v-model="userRlActvKey">
			</div>
			<div class="col-12">{{ $t('shipping_details') }}</div>
			<input type="text" name="buyer_name" id="buyer_name" ref="buyer_name" :placeholder="$t('buyer_name')" class="form-control p-2" >
			<input type="text" name="buyer_phone" id="buyer_phone" ref="buyer_phone" :placeholder="$t('buyer_phone')" class="form-control p-2" >
			<input type="text" name="buyer_address" id="buyer_address" ref="buyer_address" :placeholder="$t('buyer_address')" class="form-control p-2" >
			<input type="text" name="buyer_address2" id="buyer_address2" ref="buyer_address2" :placeholder="$t('buyer_address2')" class="form-control p-2" >
			<select v-model="buyer_country" class="form-control sel-adj">
				<option value="" disabled selected>{{ $t('buyer_country') }}</option>
				<option v-for="country_inst in this.product.countries" :value="country_inst" :key="country_inst">{{country_inst}}</option>
			</select>
			<input type="text" name="buyer_state" id="buyer_state" ref="buyer_state" class="form-control p-2" :placeholder="$t('buyer_state')">
			<input type="text" name="buyer_city" id="buyer_city" ref="buyer_city" class="form-control p-2" :placeholder="$t('buyer_city')">
			<input type="text" name="buyer_zip" id="buyer_zip" ref="buyer_zip" class="form-control p-2" :placeholder="$t('buyer_zip')">
			<div v-html="$t('real_prod_notice')" style='color:green'></div>
			<button v-on:click="checkout_product=false" class="btn btn-brand btn-lg border pt-2">{{ $t('Cancel') }}</button>
			<button v-on:click="proceedBuyReal()" class="btn btn-brand btn-lg border pt-2">{{ $t('Proceed') }}</button>
			<div v-if="buyInProgress && errorProceed==''">
				<i class="fas fa-spin fa-spinner"></i>
			</div>
			<div v-else>
				<span class="text-brand">{{errorProceed}}</span>
			</div>
		  </div>
		  
		  <BuyOptionsModal :id="'buyOptionsModal'+_uid" :ref="'buyOptionsModal'+_uid" :containerID="'#buyOptionsModal'+_uid" :modalTitle="$t('Buy_product')" :modalText="$t('buy_now_modal_desc').replace('_AMNT_', minAfitBuyTicket)" @proceed-purchase="proceedBuyNowHive"/>
		  
		  <CartModal id="cartModal" ref="cartModal" :afitPrice="afitPrice" @refresh-tickets-multi="refreshTicketsMulti"/>
          
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
  import {mapGetters} from 'vuex'
  
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import BuyOptionsModal from '~/components/BuyOptionsModal'
  import CartModal from '~/components/CartModal'
  
  //import VueLazyLoad from 'vue-lazyload'
  //import LightBox from 'vue-image-lightbox'
  
  import '@morioh/v-lightbox/dist/lightbox.css'; 

  //import Lightbox from '@morioh/v-lightbox'

  export default {
    props: ['product', 'pros', 'userrank', 'gadgetStats', 'afitPrice', 'realProducts', 'expandAll'],
	components: {
		BuyOptionsModal,
		CartModal,
		
		//LightBox,
		//VueLazyLoad
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['userTokens']),
	  ...mapGetters(['cartEntries']),
	  isKeychainActive(){
		return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
	  },
	  isHiveauthActive(){
		return (localStorage.getItem('acti_login_method') == 'hiveauth')
	  },
	  renderProdType(){
		if (this.product.type=='real'){
			return this.$t('real_prod_name');
		}
		return this.product.type;
	  },
	  productTypeBorder (){
		if (this.product.type == 'ingame'){
			return 'card-border-real';
		}
		return 'card-border';
	  },
	  productBuyColor () {
		if (!this.allReqtsFilled){ 
			return 'bg-secondary';
		}
		if (this.product.type == 'ingame' && this.product.count < 1){
			return 'bg-warning';
		}
		return '';
		
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
	  },
	  /* only allows user to buy more if they do not have pending orders */
	  realProdBuyStatus (){
		/*
		actifit market order statuses:
		placed
		confirmed
		inroute
		delivered
		cancelled
		refunded
		*/
		//if we have a pending order user cannot buy more
		if (Array.isArray(this.pendingOrders) && this.pendingOrders.length > 0){
			return false;
		}
		return true;
	  }
    }, 
	data: function(){
		return {
			detailsOpen: false,
			item_price: 0,
			item_currency: 'AFIT',
			orig_item_price: 0,
			orig_item_currency: 'AFIT',
			consumed_count: 0,
			item_price_extra: 0,
			item_extra_currency: '',
			allReqtsFilled: false,
			pendingOrders: [],
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
			userActvKeyHv: '',
			afitBuyAmount: 1,
			userRlActvKey: '',
			prodRef: this,
			checkout_product: false,
			buyer_country: '',
			order_quantity: 1,
			color_choice: (this.product.colorOptions?this.product.colorOptions[0]:''),
			proceedBuyAFIT: false,
			afit_buy_err_msg: '',
			transConfirmed: false,
			checkingBought: false,
			buyAfitInProgress: false,
			buyAfitConfirmed: false,
			prodDispStatus: '', 
			prodDispStatusText: 'Expand',
			
		}
	},
	watch: {
	  product: 'getPrice',
	  pros: 'updateProPic',
	  user: 'allReqtsMet',
	  userrank: 'allReqtsMet',
	  order_quantity: 'getPrice',
	  afitPrice: 'getPrice',
	  realProducts:'updateProdStat',
	  expandAll: 'adjustDisplay',
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
	  switchArrowStatus(){
		if (this.prodDispStatus == ''){
			this.prodDispStatus = 'open';
			this.prodDispStatusText = 'Collapse';
		} else {
			this.prodDispStatus = '';
			this.prodDispStatusText = 'Expand';
		}
	  },
	  adjustDisplay(){
		this.prodDispStatus = this.expandAll;
	  },
	  async buyAFITNow(){
		this.afit_buy_err_msg = '';
		
		if (!this.user){
			this.afit_buy_err_msg = this.$t('need_login_signup_notice_vote');
			return;
		}
		if (this.afitBuyAmount < 0){
			this.afit_buy_err_msg = this.$t('amount_positive_int');
			return;
		}
		if (this.getMatchingHIVE() < 0){
			this.afit_buy_err_msg = this.$t('amount_positive_int');
			return;
		}
		if (this.userActvKeyHv == ''){
			this.afit_buy_err_msg = this.$t('all_fields_required');
			return;
		}
		if (this.user.account.balance.split(" ")[0] < this.getMatchingHIVE() ){
			this.afit_buy_err_msg = this.$t('Not_enough_hive_balance_to_buy') ;
			//console.log(this.errorProceed );
			return;
		}
		
		this.buyAfitInProgress = true;
		let hiveAmnt = this.getMatchingHIVE();
		let afitAmnt = this.afitBuyAmount;
		
		//show user confirm for purchasing product/service
		let user_prmpt =  this.$t('confirm_buy_afit_hive').replace('_AFIT_', afitAmnt).replace('_HIVE_',hiveAmnt);
		
		let decis = confirm(user_prmpt);
		if (!decis){
			this.buyAfitInProgress = false;
			return;
		}
		//proceed with purchase transaction
		let attempt = 1;
		let memo = 'buy-afit:'+afitAmnt;
		let res = await hive.broadcast.transferAsync(this.userActvKeyHv, this.user.account.name, process.env.actifitVault, hiveAmnt + ' ' + 'HIVE', memo).then(
			res => this.confirmCompletion('buyAFITHive', hiveAmnt, res, attempt, afitAmnt)).catch(err=> this.errorCompletion(err, 'buyAFITHive'));
		
	  },
	  getMatchingHIVE(){
		return parseFloat(this.afitBuyAmount * this.afitPrice.afitHiveLastPrice).toFixed(3);
	  },
	  updateProdStat(){
		if (this.user && this.product.type == 'real' && Array.isArray(this.realProducts) && this.realProducts.length > 0){
			console.log('realProducts');
			//console.log(this.realProducts);
			this.pendingOrders = this.realProducts.filter( entry => (entry.gadget === this.product._id && entry.status != 'delivered' && entry.status != 'cancelled' && entry.status != 'refunded' ));
			console.log('pending orders');
			//console.log(this.pendingOrders );
			
		}
	  },
	  showDate(dt) {
        let date = new Date(dt)
        //let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();// + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
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
		}else if (reqt.item.toLowerCase() == 'AFIT'.toLowerCase()){
			if (parseFloat(this.userTokens) >= parseFloat(reqt.count)){
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
		if (this.product && this.afitPrice){
			let price_options = this.product.price;
			let price_options_count = price_options.length;
			for (let i=0; i < price_options_count; i++){
				let entry = price_options[i];
				this.item_price = entry.price * this.order_quantity;
				this.item_currency = entry.currency;
				if (this.item_currency == 'USD'){
					console.log('>>>USD Product');
					//console.log(entry.percent_afit);
					//keep track of original price
					this.orig_item_currency = this.item_currency;
					this.orig_item_price = this.item_price;
					this.item_currency = 'AFIT';
					//this being a USD product, convert to matching AFIT/HIVE amounts
					/*if (parseInt(entry.percent_afit) == 100){
						//convert price to matching AFIT val
						console.log(this.afitPrice.afitHiveLastUsdPrice);
						this.item_price = this.orig_item_price / this.afitPrice.afitHiveLastUsdPrice * entry.percent_afit / 100;
					}else{*/
						this.item_price = this.orig_item_price * entry.percent_afit / 100 / this.afitPrice.afitHiveLastUsdPrice;
						this.item_price = Number(this.item_price.toFixed(2));
						let calcHiveUsdPrice = this.afitPrice.afitHiveLastUsdPrice / this.afitPrice.afitHiveLastPrice;
						//console.log('HIVE price:'+calcHiveUsdPrice);
						this.item_price_extra = this.orig_item_price * entry.percent_hive / 100 / calcHiveUsdPrice ;
						this.item_price_extra = Number(this.item_price_extra.toFixed(2));
						//console.log('HIVE extra cost:'+this.item_price_extra);
						this.item_extra_currency = 'HIVE';
					//}
				}
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
	  async verifyTrx(result, operation){
		
			//if success, find, verify and store trx

			let accToken = localStorage.getItem('access_token')
	
			let op_json = JSON.stringify(operation)
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			//let cur_bchain = 'STEEM';
			
			let url = new URL(process.env.actiAppUrl + 'findVerifyTrx/?user='+this.user.account.name+'&txid='+result.id+'&operation='+op_json+'&bchain='+cur_bchain);
			
			/*
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});*/
			let reslt = await fetch(url); /*, {
				headers: reqHeads
			});*/
			let outcome = await reslt.json();
			console.log(outcome);
			
	  },
	  
	  async processTrxFunc(op_name, cstm_params, forceActive){
		if (!localStorage.getItem('std_login')){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.ref_block_num) {
				//console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestBroadcast(
					this.user.account.name, 
					[[op_name, cstm_params]], 
					forceActive?'Active':'Posting', async (response) => {
						//console.log(response);
						//resolve(response);
						
						if (response.success){
							//await this.verifyTrx(response.result, operation);
							resolve({success: response.success, trx:{id: response.result.id}})
						}else{
							reject({error: response.error});
						}
						
					}
				);
			});
		}else if (localStorage.getItem('acti_login_method') == 'hiveauth'){
			return new Promise((resolve) => {
				const auth = {
				  username: this.user.account.name,
				  token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
				  expire: localStorage.getItem('expires'),
				  key: localStorage.getItem('key')
				}
				let operation = [ 
				   [op_name, cstm_params]
				];
				
				this.$HAS.broadcast(auth, forceActive?'active':'posting', operation, (evt)=> {
					console.log(evt)    // process sign_wait message
					let msg = this.$t('verify_hiveauth_app');
					this.$notify({
					  group: 'warn',
					  text: msg,
					  duration: -1, //keep alive till clicked
					  position: 'top center'
					})
				})
				.then(response => {
					console.log(response);
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					if (response.cmd && response.cmd === 'sign_ack'){
						resolve({success: true, trx:{id: response.data}})
					}else if (response.cmd && response.cmd === 'sign_nack'){
						resolve ({success: false})
					}
				} ) // transaction approved and successfully broadcasted
				.catch(err => {
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					console.log(err);
					resolve ({success: false})
				} )
			});
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			//console.log('broadcasting');
			//console.log(operation);
			
			//console.log(this.$steemconnect.accessToken);
			//console.log(this.$store.state.accessToken);
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			//let cur_bchain = 'STEEM';
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let reslt = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await reslt.json();
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
			//console.log(this.product.name);
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
			if (localStorage.getItem('acti_login_method') != 'keychain' && 
				localStorage.getItem('acti_login_method') != 'hiveauth' && 
				this.userActvKey == ''){
			  this.errorProceed = this.$t('all_fields_required');
			  return;
			}
			
			//proceed with payment
			//let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let attempt = 1;
			let payAmount = parseFloat(this.item_price * this.afitPrice.afitHiveLastPrice).toFixed(3);
			let memo = 'buy-gadget:'+this.product._id;
			console.log('prior to call');
			
			let accToken = localStorage.getItem('access_token')
			
			let cstm_params = {
			  "from": this.user.account.name,
			  "to": process.env.actifitMarketBuy,
			  "amount": payAmount + ' ' + 'HIVE',
			  "memo": memo
			};
			
			//let res = await this.processTrxFunc('transfer', cstm_params, this.cur_bchain);
			let op_name = 'transfer';
			
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			/*let res = await hive.broadcast.transferAsync(this.userActvKey, this.user.account.name, process.env.actifitMarketBuy, payAmount + ' ' + 'HIVE', memo).then(
				res => this.confirmCompletion('transfer', payAmount, res, attempt)).catch(err=> this.errorCompletion(err));
			console.log('after call');*/
			
			
			if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) ||
				localStorage.getItem('acti_login_method') == 'hiveauth'){
				
				let bcastRes;
				let res = await this.processTrxFunc(op_name, cstm_params, true);//last param to use Active key instead of Posting
				console.log(res);
				if (res.success){
					bcastRes = res.trx;
					let op_json = JSON.stringify(operation)
					this.confirmCompletion('transfer', payAmount, bcastRes, attempt, 0, op_json);
					
				}else{
					console.log(err);
				}
				/*let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
				let url_string = process.env.actiAppUrl + 'activateMultiGadget/'
									+ this.user.account.name + '/'
									+ this.product._id + '/'
									+ bcastRes.ref_block_num + '/'
									+ bcastRes.id + '/'
									+ cur_bchain;
				//console.log('prodHasFriendBenefic');
				*/

				
			}else{
			
				let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
				
				let url = new URL(process.env.actiAppUrl + 'performTrxPost/?user='+this.user.account.name+'&bchain='+cur_bchain);
				
				let reqHeads = new Headers({
				  'Content-Type': 'application/json',
				  'x-acti-token': 'Bearer ' + accToken,
				});
				let res = await fetch(url, {
					method: 'POST',
					headers: reqHeads,
					body: JSON.stringify({'operation': JSON.stringify(operation), 'active': this.userActvKey})
				});
				let outcome = await res.json();
				
				console.log(outcome);
				if (outcome.success && outcome.trx){
					
					this.confirmCompletion('transfer', payAmount, outcome.trx.tx, attempt);
					console.log('after call');
					//this.$router.push('/login');
				}else{
					this.errorCompletion(outcome.error);
					
				}
				
			}
			
		}catch(excp){
			console.log(excp);
		}
	  },
	  async errorCompletion(res, type){
		//console.log(res);
		let err_details = res;//JSON.parse();
		this.errorProceed = err_details.cause.message;
		//this.buyAttempt = false;
		this.buyInProgress = false;
		
		if (type=='buyAFITHive'){
			this.buyAfitInProgress = false;
			this.$notify({
			  group: 'error',
			  text: this.$t('error_performing_operation'),
			  position: 'top center'
			})
			//this.proceedBuyAFIT = false;
		}
	  },
	  async confirmCompletion (type, amount, res, attempt, afitAmnt, op_json){
		console.log(res)
		if (res.ref_block_num || res.id){
			//console.log (res);
			
			
			//only support HIVE
			let cur_bchain = 'HIVE';//(localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			let url = '';//new URL(process.env.actiAppUrl + 'processBuyOrderHive/?user='+this.user.account.name+'&product_id='+this.product._id);
			
			let tgtNode = process.env.actiAppUrl;
			//if (this.product.type == 'ingame'){
			if (attempt != 1){
				tgtNode = process.env.actiAppBackUrl;
			}
			
			//if (this.product.type == 'ingame'){
			url = new URL( process.env.actiAppUrl + 'buyGadgetHive/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							+ res.ref_block_num + '/'
							+ res.id + '/'
							+ cur_bchain);
							
			if (type=='buyAFITHive'){
				url = new URL(process.env.actiAppUrl + 'buyAfitHive/'
							+ this.user.account.name + '/'
							+ amount + '/'
							+ afitAmnt + '/'
							+ res.ref_block_num + '/'
							+ res.id + '/'
							+ 'HIVE');//for now only support HIVE
				//:user/:amnt/:afitAmnt/:blockNo/:trxID/:bchain
			}
			
			
			if (this.isKeychainActive || this.isHiveauthActive){
				url = new URL( process.env.actiAppUrl + 'buyGadgetHiveKeychain/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							//+ res.ref_block_num + '/'
							+ res.id + '/'
							+ cur_bchain + '?operation='+op_json);
			}
			//}
			//console.log(url);
			//connect with our service to process buy order
			try{
				let reslt = await fetch(url);
				let outcome = await reslt.json();
				if (outcome.error){
					if (attempt == 1){
						//try again with another API node
						console.log('>>>>try again');
						this.confirmCompletion(type, amount, res, attempt + 1, afitAmnt, op_json);
					}else{
						this.errorProceed = outcome;
						console.error(outcome);
						this.buyAfitInProgress = false;
						this.$notify({
						  group: 'error',
						  text: this.$t('error_performing_operation'),
						  position: 'top center'
						})
					}
				}else{
					console.log('result IN');
					console.log(outcome);
					if (type=='buyAFITHive'){
						//update user token count
						this.$store.dispatch('fetchUserTokens')
						this.$notify({
						  group: 'success',
						  text: this.$t('afit_bought').replace('_AFIT_', outcome.boughtAmnt),
						  position: 'top center'
						})
						this.buyAfitInProgress = false;
						this.proceedBuyAFIT = false;
					}else{
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
				}
				//this.checkingFunds = false;
				//this.resultReturned = true;
			
			}catch(err){
				console.error(err);
				if (attempt == 1){
					//try again with another API node
					console.log('>>>>try again');
					this.confirmCompletion(type, amount, res, attempt + 1, afitAmnt, op_json);
				}else{
					this.errorProceed = outcome;
					console.error(outcome);
				}
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
	  async prepareCheckout(){
		this.buyAttempt = true;
		this.errorProceed = '';
		if (!this.user){
		  this.errorProceed = this.$t('need_login_signup_notice_vote');
		  return;
		}
		//make sure requirements are met
		if (!this.allReqtsFilled){
		  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
		  return;
		}
		//verify and display checkout details
		if (this.product.count < 1){
		  this.errorProceed = this.$t('cannot_buy_none_available');
		  return;
		}
		if (this.userTokens < this.item_price){
			this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here') ;
			//console.log(this.errorProceed );
			return;
		}
		if (this.user.account.balance.split(" ")[0] < this.item_price_extra ){
			this.errorProceed = this.$t('Not_enough_hive_balance_to_buy') ;
			this.buyInProgress = false;
			//console.log(this.errorProceed );
			return;
		}
		this.checkout_product = true;
	  },
	  async proceedBuyReal(){
		this.buyAttempt = true;
		this.errorProceed = '';
		this.buyInProgress = true;
		if (!this.user){
			this.errorProceed = this.$t('need_login_signup_notice_vote');
			this.buyInProgress = false;
			return;
		}
		if (this.product.count < 1){
		  this.errorProceed = this.$t('cannot_buy_none_available');
		  this.buyInProgress = false;
		  return;
		}
		//make sure requirements are met
		if (!this.allReqtsFilled){
		  this.errorProceed = this.$t('cannot_buy_reqts_not_filled');
		  this.buyInProgress = false;
		  return;
		}
		
		
		if (this.userTokens < this.item_price){
			this.errorProceed = this.$t('Not_enough_balance_to_buy') + this.$t('Buy_afit_here') ;
			this.buyInProgress = false;
			//console.log(this.errorProceed );
			return;
		}
		
		if (this.user.account.balance.split(" ")[0] < this.item_price_extra ){
			this.errorProceed = this.$t('Not_enough_hive_balance_to_buy') ;
			this.buyInProgress = false;
			//console.log(this.errorProceed );
			return;
		}
		
		//check all required fields
		
		if (this.$refs['buyer_name'].value == '' ||
			this.$refs['buyer_phone'].value == '' ||
			this.$refs['buyer_address'].value == '' ||
			this.buyer_country == '' ||
			this.$refs['buyer_state'].value == '' ||
			this.$refs['buyer_city'].value == '' ||
			this.$refs['buyer_zip'].value == ''){
			
			this.errorProceed = this.$t('all_fields_required');
			this.buyInProgress = false;
			//console.log(this.errorProceed );
			return;
		}
		let transfer_trx = '';
		//if this includes a HIVE payment as well, process it
		if (this.item_price_extra > 0){
			//check if active key was provided 
			if (this.userRlActvKey == ''){
			  this.errorProceed = this.$t('all_fields_required');
			  this.buyInProgress = false;
			  return;
			}
			/*let attempt = 1;
			let payAmount = parseFloat(1000).toFixed(3);//this.item_price_extra
			let memo = 'buy-real:'+this.product._id;
			console.log('send HIVE');
			let res = await hive.broadcast.transferAsync(this.userRlActvKey, this.user.account.name, process.env.actifitEscrow, payAmount + ' ' + 'HIVE', memo).then(;
			
			console.log(res);
			//res.ref_block_num
			//res.id - trx id
			return;*/
			
		}
		
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		let accToken = localStorage.getItem('access_token');
		
		let url = new URL(process.env.actiAppUrl + 'purchaseRealProduct/?user='+this.user.account.name+'&bchain='+cur_bchain);
		//let url = new URL('http://localhost:3120/' + 'purchaseRealProduct/?user='+this.user.account.name+'&bchain='+cur_bchain);
		
		let params = {
			'product_id': this.product._id,
			'buyer_name': this.$refs['buyer_name'].value,
			'buyer_phone': this.$refs['buyer_phone'].value,
			'buyer_address': this.$refs['buyer_address'].value,
			'buyer_address2': this.$refs['buyer_address2'].value,
			'buyer_country': this.buyer_country,
			'buyer_state': this.$refs['buyer_state'].value,
			'buyer_city': this.$refs['buyer_city'].value,
			'buyer_zip': this.$refs['buyer_zip'].value,
			'afit_amount': this.item_price,
			'hive_amount': this.item_price_extra,
			'active_key': this.userRlActvKey,
			'order_quantity': this.order_quantity,
			'color_choice': this.color_choice,
		}
			
		let reqHeads = new Headers({
		  'Content-Type': 'application/json',
		  'x-acti-token': 'Bearer ' + accToken,
		});
		
		let resSer = await fetch(url, {
			method: 'POST',
			headers: reqHeads,
			body: JSON.stringify(params)
		});
		let outcome = await resSer.json();
		//console.log(outcome);
		if (outcome.error){
			console.log(outcome.error);
			
			//if this is authority error, means needs to be logged out
			//example "missing required posting authority:Missing Posting Authority"
			let err_msg = outcome.error;
			
			
			this.$notify({
			  group: 'error',
			  text: err_msg,
			  position: 'top center'
			})
			this.errorProceed = err_msg;
			this.buyInProgress = false;
			return {success: false, trx: null};
			//this.$router.push('/login');
		}else{
			this.$store.dispatch('fetchUserTokens')
			this.$notify({
			  group: 'success',
			  text: this.$t('product_bought').replace('_PRODUCT_', this.product.name),
			  position: 'top center'
			})
			
			this.errorProceed = this.$t('product_bought').replace('_PRODUCT_', this.product.name);
			this.buyInProgress = false;
			this.buyAttempt = false;
			this.checkout_product = false;
			let accToken = localStorage.getItem('access_token')
			this.$store.dispatch('fetchUserBoughtRealProducts', accToken);
			
			return {success: true, trx: outcome.trx};
		}

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
		}else if (this.product.type == 'real'){
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
		let op_name = 'custom_json';
		let operation = [ 
		   [op_name, cstm_params]
		];
		
		
		let res = await this.processTrxFunc(op_name, cstm_params);
		console.log('custom complete');
		console.log(res);
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
							+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain);
		
			if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){			
				
				let op_json = JSON.stringify(operation)
				url = new URL( process.env.actiAppUrl + 'buyGadgetKeychain/'
								+ this.user.account.name + '/'
								+ this.product._id + '/'
								//+ bcastRes.ref_block_num + '/'
								+ bcastRes.id + '/'
								+ cur_bchain + '?operation='+op_json);
			}
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
	  async confirmReceipt(){
		if (this.pendingOrders.length > 0){
			let accToken = localStorage.getItem('access_token')
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			//let cur_bchain = 'STEEM';
			
			let url_string = process.env.actiAppUrl + 'confirmProdReceipt/?user='+this.user.account.name
								+ '&trx_id=' + this.pendingOrders[0]._id
								+ '&note=' + this.$sanitize(this.$refs['prodFeedback'].value)
								+ '&bchain=' + cur_bchain;
			let url = new URL(url_string);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			
			//connect with our service to confirm item receipt
			try{
				let res = await fetch(url, {
					headers: reqHeads
				});
				let outcome = await res.json();
				if (outcome.error){
					this.errorProceed = outcome;
					console.error(outcome);
				}else{
					//update product status
					this.checkProductBought();
					//notify success confirming receipt
					this.$notify({
					  group: 'success',
					  text: this.$t('success_receipt_set').replace('_PROD_',this.product.name),//this.$t('session_expired_login_again'),
					  position: 'top center'
					})
					
					//notify parent to refresh products
					//this.$emit('refresh-prods');
					this.$store.dispatch('fetchProducts')
					
					//update status
					this.$store.dispatch('fetchUserBoughtRealProducts', accToken);
					
					//display proper success message
					this.errorProceed = this.$t('success_receipt_set').replace('_PROD_',this.product.name+'-L'+this.product.level) + '.<br/>';
				}
				//this.checkingFunds = false;
				//this.resultReturned = true;
			
			}catch(err){
				console.error(err);
				//this.checkingFunds = false;
			}
		}
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
		let op_name = 'custom_json';
		let operation = [ 
			   [op_name, cstm_params]
			];
		
		let res = await this.processTrxFunc(op_name, cstm_params);
		//console.log(res);
		if (res.success){
			bcastRes = res.trx;
		}else{
			console.log(err);
		}
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let url_string = process.env.actiAppUrl + 'activateMultiGadget/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain;
		//console.log('prodHasFriendBenefic');
		
		if (appendFriend){
			//console.log(this.$refs["friend"].value);
			url_string += '/' + appendFriend;
		}
		
		if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){			
			
			let op_json = JSON.stringify(operation)
			url_string = new URL( process.env.actiAppUrl + 'activateMultiGadgetKeychain/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							//+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain + '/'
							+ (appendFriend? (appendFriend):'')
							+ '?operation='+op_json);
		}

		console.log(url_string)
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
		let op_name = 'custom_json';
		let operation = [ 
			[op_name, cstm_params]
		];

		
		let res = await this.processTrxFunc(op_name, cstm_params);
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
							+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain
							);
							
		if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){			
						
			let op_json = JSON.stringify(operation)
			url = new URL( process.env.actiAppUrl + 'deactivateGadgetKeychain/'
							+ this.user.account.name + '/'
							+ this.product._id + '/'
							//+ bcastRes.ref_block_num + '/'
							+ bcastRes.id + '/'
							+ cur_bchain + '?operation='+op_json);
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
		
		//fix sorting of countries and color options
		if (Array.isArray(this.product.colorOptions) && this.product.colorOptions.length > 0){
			this.product.colorOptions.sort();
		}
		
		if (Array.isArray(this.product.countries) && this.product.countries.length > 0){
			this.product.countries.sort();
		}
		
		//hive.config.set('rebranded_api', true)
		//hive.broadcast.updateOperations()
		hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
		hive.api.setOptions({ url: process.env.hiveApiNode });
	},
	
  }
</script>

<style>
	.card-border{
	  /*border: 2px solid #dc3545!important;
	  border-radius: 10px;*/
	  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	}
	.card-border-real{
	  /*border: 2px solid #28a745!important;
	  border-radius: 10px;*/
	  box-shadow: 3px 3px 3px rgb(0 255 0 / 40%);
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
	.token-logo-sm{
	  width: 20px;
	  height: 20px;
	}
	.token-logo-md{
	  width: 40px;
	  height: 40px;
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
	.lb-item{
		height: 75px !important;
	}
	.lbox-container{
		height: 100px !important;
	}
	
	  
  .left-bar:after, .right-bar:after{
	animation: blink 3s infinite;/*20 alternate;*/
  }

@keyframes blink {
  0%, 50%, 100% { background-color: pink; }
  25%, 75% { background-color: red; }
}
</style>

<style lang="scss">
$background: lightcoral;
$easing: cubic-bezier(.25,1.7,.35,.8);
$duration: 0.5s;

.arrow-icon {
  height: 2.8em;
  width: 2.8em;
  display:block;
  padding: 0.5em;
  margin: 1em auto;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
}

.left-bar {
  position: absolute;
  background-color: transparent;
  top: 0;
  left:0;
  width: 40px;
  height: 10px;
  display: block;
  transform: rotate(35deg);
  float: right;
  border-radius: 2px;
  &:after {
    content:"";
    background-color: $background;
    width: 40px;
    height: 10px;
    display: block;
    float: right;
    border-radius: 6px 10px 10px 6px;
    transition: all $duration $easing;
    z-index: -1;
  }
}

.right-bar {
  position: absolute;
  background-color: transparent;
  top: 0px;
  left:26px;
  width: 40px;
  height: 10px;
  display: block;
  transform: rotate(-35deg);
  float: right;
  border-radius: 2px;
  &:after {
    content:"";
    background-color: $background;
    width: 40px;
    height: 10px;
    display: block;
    float: right;
    border-radius: 10px 6px 6px 10px;
    transition: all $duration $easing;
    z-index: -1;
  }
}

.open {
    .left-bar:after {
    transform-origin: center center;
    transform: rotate(-70deg);
  }
  .right-bar:after {
    transform-origin: center center;
    transform: rotate(70deg);
  }

}

.expansion-arrow{
	max-height: 40px;
  }

  
/*  
.body-expan-enter,
.body-expan-leave-to {
  visibility: hidden;
  height: 0;
  margin: 0;
  padding: 0;
  opacity: 0;
}

.body-expan-enter-active,
.body-expan-leave-active {
  transition: all 0.2s;
}
*/
</style>