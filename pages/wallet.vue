<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5" v-if="user">

      <!-- account balance -->
      <div class="text-center">
        <h3 class="mb-4">{{ $t('Hey') }} {{ user.account.name }}!</h3>
		<h5>{{ $t('account_est_val') }}<i class="fas fa-info-circle" v-on:click="showDetailedCalc=!showDetailedCalc"></i></h5>
		<h5 v-if="this.tokenMetrics.length > 0">
			<div class="pb-2">{{ $t('in_usd') }}: ${{ totalAccountValue}}</div>
			<div class="pb-2" v-if="this.cur_bchain=='STEEM'">{{ $t('in_steem') }}: <img src="/img/STEEM.png" class="token-logo-sm">{{ formattedSteemTotVal }}</div>
			<div class="pb-2" v-else-if="this.cur_bchain=='HIVE'">{{ $t('in_hive') }}: <img src="/img/HIVE.png" class="token-logo-sm">{{ formattedSteemTotVal }}</div>
		</h5>
		<div v-if="this.showDetailedCalc" class="text-center">
			<div class="row">
				<div class="w-25"></div>
				<h5 class="w-100">{{ $t('detailed_calc_title')}}</h5>
			</div>
			<div class="row text-right">
				<div class="w-25"></div>
				<div class="p-1 m-1 calc-data" v-html="this.detailCalculation"></div>
			</div>
		</div>
        <div class="row row-sep">
			<div class="col-md-6 row-sep-in small-pad-row">
				<h5 class="token-title">
					<img src="/img/actifit_logo.png" class="mr-1 token-logo">{{ $t('Your_Afit_Balance') }}
					<small class="text-right">
						<a href="#" data-toggle="modal" class="text-brand" data-target="#topHoldersModal" >
							<i class="fas fa-list-ol"></i>
							<span v-if="screenWidth > 500"> {{ $t('top_100_afit_holders') }}</span>
							<span v-else> {{ $t('top_100') }}</span>
						</a>
					</small>
				</h5>
				<h5 class="mb-4 font-weight-bold row">
					<span class="col-md-12">{{ formattedUserAfit }}</span>
				</h5>
				<h5 class="mb-4 font-weight-bold row">
					<span class="col-md-6">
						{{ formattedUserAfitSE }}
						<br/>
						<span class="btn btn-brand" :title="$t('move_afit_se_he_title')"><i class="fas fa-angle-double-right" v-on:click="moveAFITseHE"></i></span>
					</span>
					<span class="col-md-6">
						{{ formattedUserAfitHE }}
						<br/>
						<span class="btn btn-brand" :title="$t('move_afit_he_se_title')"><i class="fas fa-angle-double-left" v-on:click="moveAFITheSE"></i></span>
					</span>
				</h5>
				<div v-if="afitActivityMode == MOVE_AFIT_SE_HE || afitActivityMode == MOVE_AFIT_HE_SE">
					  <div class="text-center p-2">
						<div v-if="afitActivityMode == MOVE_AFIT_SE_HE" class="text-brand font-weight-bold">{{ $t('move_afit_se_he') }}</div>
						<div v-else class="text-brand font-weight-bold">{{ $t('move_afit_he_se') }}</div>
						<div class="row" >
						  <div class="w-25 p-2">{{ $t('Amount_To_Move') }}</div>
						  <input type="number" id="afit-se-he" name="afit-se-he" ref="afit-se-he" class="form-control-lg w-50 p-2">
						</div>
						<div class="row" v-if="isStdLogin">
						  <label for="p-ac-key-afit" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-afit" name="p-ac-key-afit" ref="p-ac-key-afit" class="form-control-lg w-50 p-2">
						</div>
						<div class="row">
							<div class="w-25"></div>
							<div>{{ $t('percent_burn_afit') }}</div>
						</div>
						<div class="text-brand text-center" v-if="afit_se_move_error_proceeding">
						  {{ this.afit_se_move_err_msg }}
						</div>
						<div class="row">
						  <div class="w-25"></div>
						  <button v-if="afitActivityMode == MOVE_AFIT_SE_HE" v-on:click="proceedMoveAFIT(1)" class="btn btn-brand btn-lg w-50 border">{{ $t('Proceed') }}</button>
						  <button v-else v-on:click="proceedMoveAFIT(2)" class="btn btn-brand btn-lg w-50 border">{{ $t('Proceed') }}</button>
						</div>
						<div class="row">
						  <div class="w-25"></div>
						  <div v-if="movingAFIT" >
							<i class="fas fa-spin fa-spinner"></i>
						  </div>
						</div>
					  </div>
				</div>
			</div>
			<div class="col-md-6 row-sep-in small-pad-row">
				<h5 class="token-title"><img src="/img/AFITX.png" class="mr-1 token-logo">{{ $t('Your_Afitx_Balance') }}<i class="fas fa-info-circle" v-on:click="showAfitxInfo=!showAfitxInfo"></i>&nbsp;
					<small class="text-right">
						<a href="#" data-toggle="modal" class="text-brand" data-target="#topHoldersXModal" >
							<i class="fas fa-list-ol"></i>
							<span v-if="screenWidth > 500"> {{ $t('top_100_afitx_holders') }}</span>
							<span v-else> {{ $t('top_100') }}</span>
						</a>
					</small>
				</h5>
				<div v-if="showAfitxInfo" v-html="$t('afitx_info')"></div>
				<h5 class="mb-4 font-weight-bold row">
					<span class="col-md-6">
						{{ formattedUserAFITXSE }}
						<br/>
						<span class="btn btn-brand" :title="$t('move_afitx_se_he_title')"><i class="fas fa-angle-double-right" v-on:click="moveAFITXseHE"></i></span>
					</span>
					<span class="col-md-6">
						{{ formattedUserAFITXHE }}
						<br/>
						<span class="btn btn-brand" :title="$t('move_afitx_he_se_title')"><i class="fas fa-angle-double-left" v-on:click="moveAFITXheSE"></i></span>
					</span>
				</h5>
				<div v-if="afitActivityMode == MOVE_AFITX_SE_HE || afitActivityMode == MOVE_AFITX_HE_SE">
					  <div class="text-center p-2">
						<div v-if="afitActivityMode == MOVE_AFITX_SE_HE" class="text-brand font-weight-bold">{{ $t('move_afitx_se_he') }}</div>
						<div v-else class="text-brand font-weight-bold">{{ $t('move_afitx_he_se') }}</div>
						<div class="row" >
						  <div class="w-25 p-2">{{ $t('Amount_To_Move') }}</div>
						  <input type="number" id="afitx-se-he" name="afitx-se-he" ref="afitx-se-he" class="form-control-lg w-50 p-2">
						</div>
						<div class="row" v-if="isStdLogin">
						  <label for="p-ac-key-afitx" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-afitx" name="p-ac-key-afitx" ref="p-ac-key-afitx" class="form-control-lg w-50 p-2">
						</div>
						<div class="row">
							<div class="w-25"></div>
							<div>{{ $t('percent_burn_afitx') }}</div>
						</div>
						<div class="text-brand text-center" v-if="afit_se_move_error_proceeding">
						  {{ this.afit_se_move_err_msg }}
						</div>
						<div class="row">
						  <div class="w-25"></div>
						  <button v-if="afitActivityMode == MOVE_AFITX_SE_HE" v-on:click="proceedMoveAFITX(1)" class="btn btn-brand btn-lg w-50 border">{{ $t('Proceed') }}</button>
						  <button v-else v-on:click="proceedMoveAFITX(2)" class="btn btn-brand btn-lg w-50 border">{{ $t('Proceed') }}</button>
						</div>
						<div class="row">
						  <div class="w-25"></div>
						  <div v-if="movingAFITX" >
							<i class="fas fa-spin fa-spinner"></i>
						  </div>
						</div>
					  </div>
				</div>
			</div>
		</div>
		<div class="p-2 font-weight-bold">
			<!--<button v-on:click="buyAFITwithSTEEM" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('BUY_AFIT_WITH_STEEM') }}</button>-->
			<a v-if="cur_bchain=='STEEM'" href="https://steem-engine.net/?p=market&t=AFIT" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border " target="_blank" rel="noopener noreferrer">{{ $t('buy_afit_se') }}</a>
			<a v-else href="https://hive-engine.com/?p=market&t=AFIT" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border " target="_blank" rel="noopener noreferrer">{{ $t('buy_afit_he') }}</a>
			
			<a v-if="cur_bchain=='STEEM'" href="https://steem-engine.net/?p=market&t=AFITX" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border " target="_blank" rel="noopener noreferrer">{{ $t('buy_afitx_se') }}</a>
			<a v-else href="https://hive-engine.com/?p=market&t=AFITX" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border " target="_blank" rel="noopener noreferrer">{{ $t('buy_afitx_he') }}</a>
			
			<button v-on:click="exchangeAFITforSTEEM" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('EXCHANGE_AFIT_FOR_STEEM') }}</button>
			
			<button v-if="cur_bchain=='STEEM'" v-on:click="moveAFITSEtoAFITPOWER" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('MOVE_AFIT_SE_AFIT_POWER') }}</button>
			<button v-else v-on:click="moveAFITSEtoAFITPOWER" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('MOVE_AFIT_HE_AFIT_POWER') }}</button>
			
			<!--<button v-if="cur_bchain=='STEEM'" v-on:click="initiateAFITtoSE" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('INITIATE_AFIT_TO_SE') }}</button>-->
			<button v-on:click="initiateAFITtoSE" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('INITIATE_AFIT_TO_HE') }}</button>
			  <transition name="fade">
			  <div v-if="afitActivityMode == MOVE_AFIT_SE">
				  <div class="text-center grid p-2">
					<div v-if="cur_bchain=='STEEM'" class="text-brand font-weight-bold">{{ $t('wallet.afit_se_to_power') }}</div>
					<div v-else class="text-brand font-weight-bold">{{ $t('wallet.afit_he_to_power') }}</div>
					<div class="row" >
					  <div class="w-25 p-2">{{ $t('Amount_To_Move') }}</div>
					  <input type="number" id="afit-se-move-power" name="afit-se-move-power" ref="afit-se-move-power" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="isStdLogin">
					  <label for="p-ac-key-power" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-power" name="p-ac-key-power" ref="p-ac-key-power" class="form-control-lg w-50 p-2">
					</div>
					<div class="text-brand text-center" v-if="afit_se_move_error_proceeding">
					  {{ this.afit_se_move_err_msg }}
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="proceedMoveSEPower" class="btn btn-brand btn-lg w-50 border">{{ $t('Proceed') }}</button>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <div v-if="movingFunds" id="checking_funds">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('moving_afit_se_power') }}
					  </div>
					</div>
				  </div>
			  </div>
			  
			  <div v-else-if="afitActivityMode == INIT_AFIT_TO_SE">
				  <div class="text-center grid p-2">
					<h5 class="text-brand font-weight-bold">{{ $t('wallet.initiate_afit_to_he') }}</h5>
					<div v-if="userPDAfit.user">
						<span class="end-string">{{ afitPowerDownText }}</span><Countdown v-if="countDownReady" :deadline="nextAfitPDTarget"></Countdown>
					</div>
					<!--<div v-if="cur_bchain=='STEEM'">{{ $t('move_afit_se_notice') }}</div>-->
					<div>{{ $t('move_afit_he_notice') }}</div>
					
					<div>{{ $t('move_afit_se_notice2') }}</div>
					<div>{{ $t('move_afit_se_notice3') }}</div>
					<div>
						<div class="row" >
						  <div class="w-25 p-2 text-right">{{ $t('Amount_To_Move_Daily') }}</div>
						  <input type="number" id="afit-move-to-se" name="afit-move-to-se" ref="afit-move-to-se" class="form-control-lg w-50 p-2">
						</div>
						<div class="row">
							<label for="move-funds-pass" class="w-25 p-2 text-right">{{ $t('Funds_Password') }}</label>
							<input type="password" id="move-funds-pass" name="move-funds-pass" ref="move-funds-pass" class="form-control-lg w-50 p-2">
							<a href="/wallet?action=set_funds_pass" target="_blank" class="btn btn-brand border m-1">{{ $t('create_pass_short') }}</a>
						</div>
						<div class="text-brand text-center" v-if="afit_se_move_error_proceeding" v-html="afit_se_move_err_msg">
						</div>
						<div class="row" v-if="userPDAfit.user">
						  <div class="w-25"></div>
						  <button v-on:click="proceedMoveToSE" class="btn btn-brand border btn-lg w-25">{{ $t('adjust_amount') }}</button>
						  <button v-on:click="cancelMoveToSE" class="btn btn-brand border btn-lg w-25">{{ $t('Cancel_Transfer') }}</button>
						</div>
						<div class="row" v-else>
						  <div class="w-25"></div>
						  <button v-on:click="proceedMoveToSE" class="btn btn-brand border btn-lg w-50">{{ $t('Proceed') }}</button>
						</div>
						<div class="row">
						  <div class="w-25"></div>
						  <div v-if="initiateInProgress">
							<i class="fas fa-spin fa-spinner"></i>{{ $t('processing') }}
						  </div>
						</div>
					</div>
					
				  </div>
			  </div>
			  
			  <div v-else-if="afitActivityMode == BUY_AFIT_STEEM">
				  <div class="text-center grid p-2">
					<div class="row" >
					  <span class="text-brand text-center w-100" v-html="$t('notice_buy_afit')">
					  </span>
					</div>
					<div class="row" >
					  <div class="w-25 p-2 text-right" :value="this.defaultAfit">{{ $t('AFIT_Amount_To_Buy') }}</div>
					  <input type="number" id="afit-amount-buy" name="afit-amount-buy" ref="afit-amount-buy" class="form-control-lg w-50 p-2" v-model="afitBuyAmount">
					</div>
					<div class="row" >
					  <div class="w-25 p-2 text-right">{{ $t('STEEM_Amount_To_Pay') }}</div>
					  <input type="number" id="steem-amount-pay" name="steem-amount-pay" ref="steem-amount-pay" class="form-control-lg w-50 p-2" readonly="readonly" :value="this.getMatchingSTEEM()">
					</div>
					<div class="text-brand text-center" v-if="afit_buy_error_proceeding">
					  {{ this.afit_buy_err_msg}}
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="proceedBuyAFIT" class="btn btn-brand btn-lg w-50 border">{{ $t('Proceed') }}</button>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <div v-if="checkingBought" id="checking_buy" class="w-50 text-brand">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('confirming_buy_transaction') }}
					  </div>
					  <div v-else-if="transConfirmed" class="w-50 text-brand">
					    {{ $t('trans_confirmed') }}
					  </div>
					</div>
				  </div>
			  </div>
			  
			  <div v-else-if="afitActivityMode == EXCHANGE_AFIT_STEEM">
			  <transition name="fade" v-if="!userHasFundsPass" >
				<div class="text-center grid p-2">
					<div class="text-brand font-weight-bold">{{ $t('wallet.title_process') }}</div>
					<h5>{{ $t('wallet.step1_title') }}</h5>
					<div class="row">
					  <label for="funds-pass" class="w-25 p-2">{{ $t('Funds_Password') }}</label>
					  <input type="text" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control-lg w-50 p-2">
					  <button v-on:click="setPasswordVal" class="btn btn-brand">{{ $t('Generate_Password') }}</button>
					</div>
					<div class="row">
						<div class="w-25"></div>
						<div class="w-50 text-brand"><i>{{ $t('avoid_special_chars') }}</i></div>
					</div>
					<div class="row">
					  <label for="confirm-funds-pass" class="w-25 p-2">{{ $t('Confirm_Password') }}</label>
					  <input type="text" id="confirm-funds-pass" name="confirm-funds-pass" ref="confirm-funds-pass" class="form-control-lg w-50 p-2">
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="setFundsPass" class="btn btn-brand btn-lg w-50 border">{{ $t('Set_Password') }}</button>
					</div>
					<div v-if="settingPass" class="row">
					  <div class="w-25"></div>
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
					<div v-if="errorSettingPass" class="row text-brand">
					  <div class="w-25"></div>
					  <span>{{errorSettingPass}}</span>
					</div>
				</div>
			  </transition>
			  <transition name="fade" v-else-if="!userFundsPassVerified" >
				<div class="text-center grid p-2">
					<h5>{{ $t('wallet.step2_title') }}</h5>
					<div v-html="$t('wallet.step2_desc')">
					</div>
					<div class="row">
					  <label for="pass-transfer-type" class="w-25 p-2">{{ $t('Type') }} *</label>
					  <select @change="passTransferTypeChange" id="pass-transfer-type" name="pass-transfer-type" ref="pass-transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
					    <option v-if="cur_bchain=='STEEM'" value="STEEM">{{ $t('STEEM') }}</option>
					    <option v-if="cur_bchain=='STEEM'" value="SBD">{{ $t('SBD') }}</option>
						<option v-if="cur_bchain=='HIVE'" value="HIVE">{{ $t('HIVE') }}</option>
					    <option v-if="cur_bchain=='HIVE'" value="HBD">{{ $t('HBD') }}</option>
					  </select>
					</div>
					<div class="row">
					  <label for="pass-transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="pass-transfer-amount" name="pass-transfer-amount" ref="pass-transfer-amount" class="form-control-lg w-50 p-2"  v-model="transfer_amount">
					</div>
					<div class="row" v-if="isStdLogin">
					  <label for="p-ac-key-funds-ver" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-funds-ver" name="p-ac-key-funds-ver" ref="p-ac-key-funds-ver" class="form-control-lg w-50 p-2">
					</div>
					<div class="text-brand text-center" v-if="pass_error_proceeding">
					  {{ this.pass_error_msg}}
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="proceedVerifyPass" class="btn btn-brand btn-lg w-50 border">{{ $t('Send_Verify') }}</button>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <div v-if="checkingFunds" id="checking_funds">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('Checking_Steem_Transfer') }}
					  </div>
					</div>
				</div>
			  </transition>
			  <transition name="fade" v-else-if="pendingTokenSwap == ''" >
				<div class="text-center grid p-2">
				  <div class="p-3 row">
					<div class="col-md-6 d-inline-block pt-3 text-md-right">
					  <a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeQueueModal" >
					    <i class="fas fa-list-ol"></i> {{ $t('Exchange_Queue') }}
					  </a>
					</div>
					<div class="col-md-6 d-inline-block pt-3 text-md-left">
					  <a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeHistoryModal" >
					    <i class="fas fa-history"></i> {{ $t('My_History') }}
					  </a>
					</div>
				  </div>
					<div>{{ $t('wallet.step3_title') }}</div>
					<div>{{ $t('wallet.step3_desc1') }}</div>
					<div>{{ $t('wallet.step3_desc2') }}</div>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_5" value="50" v-model="afit_val_exchange">
						<label for="afit_exchange_5">50 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_10" value="100" v-model="afit_val_exchange">
						<label for="afit_exchange_10">100 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					  <br>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_15" value="150" v-model="afit_val_exchange">
						<label for="afit_exchange_15">150 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_20" value="200" v-model="afit_val_exchange">
						<label for="afit_exchange_20">200 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					<br>
					<span><i>{{ $t('You_are_exchanging') }} {{ afit_val_exchange }} {{ $t('AFIT_Token') }} {{ $t('Tokens') }} {{ $t('for') }} {{ afit_exch_matching_perc}} % {{ $t('extra_upvote')}}
						<!--<br/> ({{ $t('net_profit_approx') }} ${{ (afit_val_exchange * 0.036).toFixed(2) }})-->
						<br/>{{ $t('enter_funds_pass_proceed') }}</i></span>
					<div class="row" >
					  <div class="w-25 p-2 text-right">{{ $t('Funds_Password') }}</div>
					  <input type="password" id="funds-pass-entry" name="funds-pass-entry" ref="funds-pass-entry" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="error_swap != ''" >
					  <div class="w-25"></div>
					  <span class="text-brand">{{error_swap}}</span>
					</div>
					<div class="row" v-if="buyMore">
						<div class="w-25"></div>
						<div class="w-50">
							<a href="#" class="btn btn-brand border p-2" v-on:click="moveAFITSEtoAFITPOWER">{{ $t('transfer_afit_from_se') }}</a>
							<span class="text-brand">OR</span>
							<a href="https://steem-engine.net/?p=market&t=AFIT" class="btn btn-brand border p-2">{{ $t('buy_afit_se') }}</a>
						</div>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="exchangeTokensUpvote" class="btn btn-brand btn-lg w-50 border">{{ $t('Exchange') }}</button>
					</div>
					<div class="row" v-if="performingSwap" >
					  <div class="w-25"></div>
					  <div id="performing_swap">
						<i class="fas fa-spin fa-spinner"></i>
					  </div>
					</div>
					<div class="row" v-if="swapResult != ''" >
					  <div class="w-25"></div>
					  <div id="swap_result" class="text-brand"><i>
						{{swapResult}}
					  </i></div>
					</div>
				</div>
			  </transition>
			  <!--<transition name="fade" v-else-if="pendingTokenSwapTransCount > 30" >
				<div class="text-center grid font-weight-bold p-2">
					There are no more spots during this round for exchanging AFIT tokens to STEEM Upvotes.
					Please try again on the following voting cycle.
				</div>
			  </transition>-->
			  <transition name="fade" v-else >
				<div class="text-center grid font-weight-bold p-2">
					<div class="p-3">
					  <a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeQueueModal" >
						<i class="fas fa-list-ol"></i> {{ $t('Exchange_Queue') }}
					  </a>
					  <a href="#" data-toggle="modal" class="text-brand p-3" data-target="#exchangeHistoryModal" >
						<i class="fas fa-history"></i> {{ $t('My_History') }}
					  </a>
					</div>
					<div>{{ $t('You_have_scheduled') }} {{pendingTokenSwap.paid_afit}} {{ $t('afit_steem_exchange_in_progress') }}</div>
					<div class="text-brand" v-if="topHolder(user.account.name)">{{ $t('top_afitx_holder_pending_ex') }}</div>
					<div class="text-brand" v-else>
					<div v-if="userAFITXRank<100">
					{{ $t('afitx_bal_rank') }} {{ userAFITXRank }}. {{ $t('you_need') }} {{ minJoinTopHolders() }} {{ $t('min_missing_afitx_prio') }}
					</div>
					<div>{{ $t('current_no_queue') }} {{userTokenSwapPending.order}}. {{ $t('exchange_projected_time').replace('ROUND_COUNT', userTokenSwapPending.reward_round) }}</div>
					</div>
					<div>{{ $t('upvote_notice') }}</div>
					<small>{{ $t('afitx_data_update_notice') }}</small>
				</div>
			  </transition>
			  <ExchangeQueue :transList="tokenSwapQueue.pendingTransactions" :user="user.account.name" :topAFITXList="topAFITXHolders"/>
			  <ExchangeHistory :transList="userTokenSwapHistory.userTokenSwapHist"/>
			  </div>
			
			</transition>
		</div>
		
		
		<div class="row text-center row-sep">
			<div class="col-md-6 row-sep-in" v-if="cur_bchain=='STEEM'">
				<h5 class="token-title"><img src="/img/STEEM.png" class="mr-2 token-logo">{{ $t('Your_Steem_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2">{{ this.renderSteemPower(2) }} {{ $t('STEEM_POWER_CAPS') }} | {{ this.renderBalance(this.cur_bchain) }} | {{ this.renderSBDBalance(this.cur_bchain) }}</div>
					<div class="row">
						<div class="p-2 col-md-6" id="ttip-area">
							<small><i>{{ $t('STEEM_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_SP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_SP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_SP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
						</div>
					</div>
					<div>
						<button v-on:click="fetchDelegations(false)" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('FETCH_MY_DELEGATIONS') }}</button>
					</div>
				</div>
			</div>
			<div class="col-md-6 row-sep-in" v-else-if="cur_bchain=='HIVE'">
				<h5 class="token-title"><img src="/img/HIVE.png" class="mr-2 token-logo">{{ $t('Your_Hive_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2">{{ this.renderSteemPower(2) }} {{ $t('HIVE_POWER_CAPS') }} | {{ this.renderBalance(this.cur_bchain) }} | {{ this.renderSBDBalance(this.cur_bchain) }}</div>
					<div class="row">
						<div class="p-2 col-md-6" id="ttip-area">
							<small><i>{{ $t('HIVE_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_HP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_HP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_HP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
						</div>
					</div>
					<div>
						<button v-on:click="fetchDelegations(false)" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('FETCH_MY_DELEGATIONS') }}</button>
					</div>
				</div>
			</div>
			
			<div v-if="tokensOfInterestBal.length > 0" class="col-md-6 row-sep-in">
				<h5 class="token-title" v-if="cur_bchain == 'STEEM'">{{ $t('Your_Token_Balance') }}</h5>
				<h5 class="token-title" v-else>{{ $t('Your_HE_Token_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2" v-for="(token, index) in tokensOfInterestBal" :key="index" :token="token">
						{{ renderBal(token) }} {{ token.symbol }} <span v-if="parseFloat(renderStake(token)) > 0">+ {{ renderStake(token)}} {{ token.symbol }} {{ $t('Staked') }} </span>
						<span v-if="parseFloat(delegStake(token)) > 0">( + {{ delegStake(token)}} {{ token.symbol }} {{ $t('Delegated') }}) </span>
						<span v-if="token.stakable"><i class="fas fa-arrow-circle-up text-brand p-1" :title="$t('stake_tokens')" v-on:click="initiateStaking(token)"></i></span>
						<span v-if="token.stakable"><i class="fas fa-arrow-circle-down text-brand p-1" :title="$t('unstake_tokens')" v-on:click="initiateUnStaking(token)"></i></span>
						<span v-if="token.symbol == 'STEEMP' || token.symbol == 'SWAP.HIVE'"><i class="fas fa-upload text-brand p-1" :title="$t('withdraw_tokens')" v-on:click="initiateWithdraw(token)"></i></span>
						<span><i class="fas fa-share-square text-brand p-1" :title="$t('transfer_tokens')" v-on:click="initiateTransfer(token)"></i></span>
					</div>
					<div class="row" v-if="tokenActions && curTokenAction == TRANSFER_FUNDS">
					  <label for="token-target-account" class="w-25 p-2">{{ $t('Account') }} *</label>
					  <span class="p-1">@</span><input type="text" id="token-target-account" name="token-target-account" ref="token-target-account" class="form-control-lg p-2">
					</div>
					<div class="row" v-if="tokenActions">
					  <label for="token-powerup-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="token-powerup-amount" name="token-powerup-amount" ref="token-powerup-amount" class="form-control-lg w-50 p-2"><span class="p-2">{{ selTokenUp.symbol }}</span>
					</div>
					<div class="row" v-if="isStdLogin && tokenActions">
					  <label for="p-ac-key-trans-token" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-trans-token" name="p-ac-key-trans-token" ref="p-ac-key-trans-token" class="form-control-lg w-50 p-2">
					</div>
					
					<div class="row" v-if="tokenActions">
					  <div class="w-25"></div>
					  <button v-if="curTokenAction == POWERUP_FUNDS" v-on:click="proceedPowerUpToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Up') }}</button>
					  <button v-else-if="curTokenAction == POWERDOWN_FUNDS" v-on:click="proceedPowerDownToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Down') }}</button>
					  <button v-else-if="curTokenAction == TRANSFER_FUNDS" v-on:click="proceedTransferToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Send') }}</button>
					  <button v-else-if="curTokenAction == WITHDRAW_FUNDS" v-on:click="proceedWithdrawToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Withdraw') }}</button>
					</div>
					<div v-if="movingFunds" id="checking_funds">
						<i class="fas fa-spin fa-spinner"></i>
					</div>
					<div class="row" v-if="afit_se_power_error_proceeding">
					  <div class="w-25"></div>
					  <div v-html="this.afit_se_power_err_msg"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="row text-center">
			<div class="p-2 col-md-12">
				<button v-on:click="transferFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('TRANSFER_FUNDS_ACTION_TEXT') }}</button>
				<button v-on:click="powerUpFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{  $t('POWERUP_ACTION_TEXT') }} {{this.cur_bchain}}</button>
				<button v-on:click="powerDownFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('POWERDOWN_ACTION_TEXT') }}{{this.cur_bchain}}</button>
				<button v-on:click="delegateFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('DELEGATE_ACTION_TEXT') }}{{this.cur_bchain}}</button>
			</div>
			<transition name="fade">
			  <div v-if="fundActivityMode == 1" class="text-center grid p-2 col-md-12">
				<div class="row">
				  <label for="transfer-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
				  <input type="text" id="transfer-recipient" name="transfer-recipient" ref="transfer-recipient" class="form-control-lg w-50 p-2">
				</div>
				<div class="row">
				<label for="transfer-type" class="w-25 p-2">{{ $t('Type') }} *</label>
				<select @change="transferTypeChange" id="transfer-type" name="transfer-type" ref="transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
				  <option value="STEEM">
					<span v-if="cur_bchain=='STEEM'">{{ $t('STEEM') }}</span>
					<span v-if="cur_bchain=='HIVE'">{{ $t('HIVE') }}</span>
				  </option>
				  <option value="SBD">
					<span v-if="cur_bchain=='STEEM'">{{ $t('SBD') }}</span>
					<span v-if="cur_bchain=='HIVE'">{{ $t('HBD') }}</span>
				  </option>
				</select>
				</div>
				<div class="row">
				  <label for="transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
				  <input type="number" id="transfer-amount" name="transfer-amount" ref="transfer-amount" class="form-control-lg w-50 p-2">
			      <span class="w-25 p-1 text-left text-brand" v-on:click="fillTransAmount()" :title="$t('select_full_balance')"><u>{{ this.renderTransAmount() }}</u></span>
				</div>
				<div class="row">
				  <label for="transfer-memo" class="w-25 p-2">{{ $t('Memo') }}</label>
				  <input type="text" id="transfer-memo" name="transfer-memo" ref="transfer-memo" class="form-control-lg w-50 p-2">				
				</div>
				<div class="row" v-if="isStdLogin">
					  <label for="p-ac-key-trans" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-trans" name="p-ac-key-trans" ref="p-ac-key-trans" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isStdLogin">
					<div class="text-center small p-2 w-25"></div>
					<div :class="smallScreenBtnClasses" class="text-center small p-2 w-50">This operation requires your <b>PRIVATE ACTIVE</b> key.*</div>
				</div>
				<div class="text-center small p-2">
				  <i>{{ $t('wallet_memo_notice') }}</i>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row">
				  <div class="w-25"></div>
				  <button v-on:click="proceedTransfer" class="btn btn-brand btn-lg w-50 border">{{ $t('Send') }}</button>
				</div>
				<div v-if="transferProcess">
				  <i class="fas fa-spin fa-spinner" ></i>
				</div>
			  </div>
			</transition>
			<transition name="fade">
			  <div v-if="fundActivityMode == 2" class="text-center grid p-2">
				<div class="row">
				  <label for="powerup-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
				  <input type="text" id="powerup-recipient" name="powerup-recipient" ref="powerup-recipient" class="form-control-lg w-50 p-2" :value="user.account.name">
				</div>
				<div class="row">
				  <label for="powerup-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
				  <input type="number" id="powerup-amount" name="powerup-amount" ref="powerup-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isStdLogin">
					  <label for="powerup-amount" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-up" name="p-ac-key-up" ref="p-ac-key-up" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isStdLogin">
					<div class="text-center small p-2 w-25"></div>
					<div :class="smallScreenBtnClasses" class="text-center small p-2 w-50">This operation requires your <b>PRIVATE ACTIVE</b> key.*</div>
				</div>
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_up_notice')" v-if="cur_bchain=='STEEM'">
				  </div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_up_hive_notice')" v-else-if="cur_bchain=='HIVE'">
				  </div>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row">
				  <div class="w-25"></div>
				  <button v-on:click="proceedPowerUp" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Up') }}</button>
				</div>
				<div v-if="powerUpProcess">
				  <i class="fas fa-spin fa-spinner" ></i>
				</div>
			  </div>
			</transition>
			<transition name="fade">
			  <div v-if="fundActivityMode == 3" class="text-center grid p-2 col-md-12">
				<div >
				  <div class="row">
					  <label for="powerdown-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="powerdown-amount" name="powerdown-amount" ref="powerdown-amount" class="form-control-lg w-50 p-2">
				  </div>
				  <div class="row" v-if="isStdLogin">
					  <label for="powerdown-amount" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password"  id="p-ac-key" name="p-ac-key" ref="p-ac-key" class="form-control-lg w-50 p-2">
				  </div>
				  <div class="row" v-if="isStdLogin">
					<div class="text-center small p-2 w-25"></div>
					<div :class="smallScreenBtnClasses" class="text-center small p-2 w-50">This operation requires your <b>PRIVATE ACTIVE</b> key.*</div>
				  </div>
				</div>
				<div class="row" v-if="isPoweringDown">
				  <div class="text-center small p-2 w-25"></div>
				  <div class="text-center text-brand small p-2 w-50"><b>{{ $t('currently_powering_down') }} {{this.renderSteemPower(5)}} {{this.cur_bchain}}<br/>
					{{ $t('next_withdraw_on') }} {{this.powerDownWithdrawDate}}</b>
				  </div>
				</div>
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div v-if="cur_bchain=='STEEM'" :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_down_notice').replaceAll('_CUR_','STEEM').replaceAll('_TIME_', '4')">
				  </div>
				  <div v-else-if="cur_bchain=='HIVE'" :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_down_notice').replaceAll('_CUR_','HIVE').replaceAll('_TIME_', '13')">
				  </div>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row" v-if="isPoweringDown">
				  <div class="text-center small p-2 w-25"></div>
				  <button v-on:click="proceedPowerDown" class="btn btn-brand btn-lg w-25 border">{{ $t('Power_Down') }}</button>
				  <button v-on:click="cancelPowerDown" class="btn btn-brand btn-lg w-25 border">{{ $t('Cancel_Power_Down') }}</button>
				  <div v-if="powerDownProcess">
				  <i class="fas fa-spin fa-spinner" ></i>
				  </div>
				</div>
				<div class="row" v-else>
				  <div class="text-center small p-2 w-25"></div>
				  <button v-on:click="proceedPowerDown" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Down') }}</button>
				  <div v-if="powerDownProcess">
				  <i class="fas fa-spin fa-spinner" ></i>
				  </div>
				</div>
			  </div>
			</transition>
			<transition name="fade">
			  <div v-if="fundActivityMode == 5" class="text-center grid p-2 col-12">
				<div class="row">
				  <label for="delegate-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
				  <input type="text" id="delegate-recipient" name="delegate-recipient" ref="delegate-recipient" class="form-control-lg w-50 p-2" value="actifit">
				</div>
				<div class="row">
				  <label for="delegate-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
				  <input type="number" id="delegate-amount" name="delegate-amount" ref="delegate-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isStdLogin">
					  <label for="delegate-amount" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-delg" name="p-ac-key-delg" ref="p-ac-key-delg" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isStdLogin">
					<div class="text-center small p-2 w-25"></div>
					<div :class="smallScreenBtnClasses" class="text-center small p-2 w-50">This operation requires your <b>PRIVATE ACTIVE</b> key.*</div>
				</div>
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div class="p-2 w-50"></div>
				  <!--<div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_up_notice')" v-if="cur_bchain=='STEEM'">
				  </div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_up_hive_notice')" v-else-if="cur_bchain=='HIVE'">
				  </div>-->
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row">
				  <div class="w-25"></div>
				  <button v-on:click="proceedDelegation" class="btn btn-brand btn-lg w-50 border">{{ $t('Delegate') }}</button>
				</div>
				<div v-if="delegateProcess">
				  <i class="fas fa-spin fa-spinner" ></i>
				</div>
				
				
				
				<div>
					<h5>{{ $t('active_delegations') }}</h5>
					<table class="table table-hover">
					  <thead class="text-brand">
						<tr>
						  <th scope="col">{{ $t('Delegatee') }}</th>
						  <th scope="col" v-if="cur_bchain == 'STEEM' ">{{ $t('Steem_Power') }}</th>
						  <th scope="col" v-else-if="cur_bchain == 'HIVE' ">{{ $t('Hive_Power') }}</th>
						  <th scope="col">{{ $t('Date') }}</th>
						  <th scope="col">{{ $t('Action') }}</th>
						</tr>
					  </thead>
					  <tbody>
						<tr v-for="(delegation, index) in activeDelegations" :key="index" :delegation="delegation">
							<td><a :href="'./@'+delegation.delegatee" >@{{ delegation.delegatee }}</a></td> 
							<td>
								{{ numberFormat(delegation.power, 3) }} 
								<span v-if="cur_bchain == 'STEEM'">{{ $t('SP_Symbol') }}</span>
								<span v-else-if="cur_bchain == 'HIVE'">{{ $t('HP_Symbol') }}</span></td> 
							<td>{{ date(delegation.min_delegation_time) }}</td>
							<td><span ><a href="#" @click.prevent="editDelegation(delegation)" :title="$t('Edit_Delegation')"><i class="fas fa-edit"></i></a></span>&nbsp;
							<span ><a href="#" @click.prevent="cancelDelegation(delegation)" :title="$t('Cancel_Delegation')"><i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="cancellingDelegation"></i></a></span></td>
						</tr>
					  </tbody>
					</table>
				</div>
				<button v-on:click="fetchDelegations(true)" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('FETCH_MY_DELEGATIONS') }}</button>
				<div v-if="loadingDeleg">
				  <i class="fas fa-spin fa-spinner" ></i>
				</div>
			  </div>
			</transition>
		</div>
		<div class="row row-sep">
			<div v-if="isClaimableDataAvailable && cur_bchain=='STEEM'" class="col-md-6 row-sep-in">
				<h5 class="token-title"><img src="/img/STEEM.png" class="mr-2 token-logo">{{ $t('Claimable_Steem_Rewards') }}</h5>
				<div class="mb-4 font-weight-bold">
					<span class="p-2">{{ this.claimSP }} | {{ this.claimSTEEM }} | {{ this.claimSBD }}</span>
					<div class="p-2"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Steem_Rewards') }}</button></div>
					<div v-if="claimRewardsProcess">
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
				</div>
			</div>
			<div v-else-if="isClaimableDataAvailable && cur_bchain=='HIVE'" class="col-md-6 row-sep-in">
				<h5 class="token-title"><img src="/img/HIVE.png" class="mr-2 token-logo">{{ $t('Claimable_Hive_Rewards') }}</h5>
				<div class="mb-4 font-weight-bold">
					<span class="p-2">{{ this.claimSP }} | {{ this.claimSTEEM }} | {{ this.claimSBD }}</span>
					<div class="p-2"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Hive_Rewards') }}</button></div>
					<div v-if="claimRewardsProcess">
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
				</div>
			</div>
			<div v-if="claimableSETokens.length > 0" class="col-md-6 row-sep-in">
				<h5 class="token-title" v-if="cur_bchain == 'STEEM'">{{ $t('Claimable_Token_Rewards') }}</h5>
				<h5 class="token-title" v-else>{{ $t('Claimable_HE_Token_Rewards') }}</h5>
				<div class="mb-4 font-weight-bold">
					<span class="p-2" v-for="(entry, index) in claimableSETokens" :key="index" :entry="entry">{{ renderTokenVal(entry.amount, entry.symbol) }} {{ entry.symbol }}</span>
					<div class="p-2">
						<button v-on:click="claimTokenRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Token_Rewards') }}</button>
						<div v-if="claimingTokens">
							<i class="fas fa-spin fa-spinner"></i>
						</div>
					</div>
				</div>
			</div>
		</div>
      </div>
	  
		
	  
      <!-- transaction history -->
      <div class="history mx-auto">
        <h3 class="text-center mt-5">{{ $t('AFIT_Transaction_History') }}</h3>
        <Transaction v-for="(transaction, index) in transactions" :key="index" :transaction="transaction" />
        <div class="text-center"><small class="text-muted" v-if="transactions.length === 0">{{ $t('No_transactions_notice') }}</small></div>
      </div>
	  	<TopHolders :user="user.account.name" :holdersList="afitHoldersList"/>
		<TopHoldersX :user="user.account.name" :holdersList="afitxHoldersList"/>
    </div>
	
	<!-- show spinner while loading -->
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else-if="loading">
	  <div class="text-center">
		<i class="fas fa-spinner fa-spin text-brand"></i>
	  </div>
	</div>
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('login_required_wallet') }}
		  </div>
		</div>
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
	
	<no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  import ExchangeQueue from '~/components/ExchangeQueueModal'
  import ExchangeHistory from '~/components/ExchangeHistoryModal'
  import SSC from 'sscjs'
  
  import Countdown from 'vuejs-countdown'
  
  import TopHolders from '~/components/TopHoldersModal'
  import TopHoldersX from '~/components/TopHoldersXModal'
  
  const ssc = new SSC(process.env.steemEngineRpc);
  const scot_steemengine_api = process.env.steemEngineScot;
  
  const hsc = new SSC(process.env.hiveEngineRpc);
  const scot_hive_api_param = process.env.hiveEngineScotParam;

  const tokensNonStakable = ['AFITX', 'AFIT', 'STEEMP', 'SWAP.HIVE'];
  const tokensOfInterest = ['SPORTS', 'PAL', 'APX', 'BEE'].concat(tokensNonStakable);
  
  import { mapGetters } from 'vuex'

  export default {
	head () {
		return {
		  title: `Actifit user wallet - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Wallet details for actifit user` },
			{ hid: 'ogdescription', name: 'og:description', content: `Wallet details for actifit user` }
		  ]
		}
	},
	data () {
	  return {
	    CLOSED_MODE: 0,
		TRANSFER_FUNDS: 1,
		POWERUP_FUNDS: 2,
		POWERDOWN_FUNDS: 3,
		WITHDRAW_FUNDS: 4,
		DELEGATE_FUNDS: 5,
		EXCHANGE_AFIT_STEEM: 1,
		MOVE_AFITX_SE_HE: 6,
		MOVE_AFITX_HE_SE: 7,
		MOVE_AFIT_SE_HE: 8,
		MOVE_AFIT_HE_SE: 9,
		MOVE_AFIT_SE: 2,
		BUY_AFIT_STEEM: 3,
		INIT_AFIT_TO_SE: 4,
		powerDownRateVal: '',
		powerDownWithdrawDate: '',	
		steemPower: 0,
		effectiveSteemPower: 0,
		delegatedSteemPower: 0,
		receivedSteemPower: 0,
		claimSP: '',
		claimSTEEM: '',
		claimVests: '',
		claimSBD: '',
		claimWindow: '',
		fundActivityMode: this.CLOSED_MODE,
		afitActivityMode: this.CLOSED_MODE,
		transferType: 'STEEM',
		transferTypePass: 'STEEM',
		error_proceeding: '',
		error_msg: '',
		pass_error_proceeding: '',
		pass_error_msg: '',
		afit_se_move_error_proceeding: '',
		performingSwap: false,
		error_swap: '',
		swapResult: '',
		checkingFunds: false,
		movingFunds: false,
		movingAFIT: false,
		movingAFITX: false,
		checkingBought: false,
		transConfirmed: false,
		target_exchange_account: 'actifit.exchange',
		target_buy_account: 'actifit.buy',
		properties: '', //handles the Steem BC properties
		userHasFundsPass: false, //holds value if user has proper funds pass or not yet
		userFundsPassVerified: false, //holds value if user has verified funds pass or not yet
		settingPass: false,
		verifyingPass: false,
		errorSettingPass: '',
		screenWidth: 1200,
		afit_val_exchange: 50,
		afit_exch_matching_perc: 10,
		afitPrice: 0.036,
		pendingTokenSwap: '',
		transfer_amount: 1,
		min_tokens_required: 10000,
		pendingTokenSwapTransCount: 0,
		tokenSwapQueue: '',
		userTokenSwapHistory: '',
		topAFITXHolders: '',
		userTokenSwapPending: '',
		runningInterval: '',
		afit_se_balance: 0,
		afitx_se_balance: 0,
		
		afit_he_balance: 0,
		afitx_he_balance: 0,
		
		userAddedTokens: 0,
		steemPrice: 0.1,
		sbdPrice: 0.1,
		hivePrice: 0.1,
		hbdPrice: 0.1,
		defaultAfit: 100,
		afit_buy_error_proceeding: false,
		afit_buy_err_msg: '',
		afitBuyAmount: this.defaultAfit,
		claimableSETokens: [],
		tokenOfInterestPrecision: [],
		claimingTokens: false,
		tokensOfInterestBal: [],
		tokenMetrics: [],
		initiateInProgress: false,
		userPDAfit: '',
		countDownReady: false,
		nextAfitPDTarget: '',
		afitPowerDownText: '',
		showAfitxInfo: false,
		totalAccountValue: 0,
		totalAccountValueSteem: 0,
		detailCalculation: '',
		showDetailedCalc: false,
		userAFITXRank: -1,
		afitHoldersList: [],
		afitxHoldersList: [],
		buyMore: false,
		tokenActions: false,
		curTokenAction: '',
		selTokenUp: '',
		afit_se_power_error_proceeding: false,
		afit_se_power_err_msg: '',
		loading: true,
		acti_goog_ad_horiz_slim:{display:'inline-block',width:'728px',height:'90px'},
		powerDownProcess: false,
		powerUpProcess: false,
		claimRewardsProcess: false,
		transferProcess: false,
		cur_bchain: 'HIVE',
		delegateProcess: false,
		loadingDeleg: false,
		activeDelegations: [],
		cancellingDelegation: false,
		
		extra_reward_arr: [
							{afit: 50, upvote: 10},
							{afit: 100, upvote: 15},
							{afit: 150, upvote: 20},
							{afit: 200, upvote: 25},
						],
	  }
	},
    components: {
      NavbarBrand,
      Transaction, // single transaction block
      Footer,
	  ExchangeQueue,
	  ExchangeHistory,
	  Countdown,
	  TopHolders,
	  TopHoldersX
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['userTokens', 'transactions', 'userRank', 'bchain']),
      isStdLogin () {
		return localStorage.getItem('std_login')
	  },
	  formattedSteemTotVal () {
		return this.numberFormat(this.totalAccountValueSteem, 3) + ' ' + this.cur_bchain;
	  },
	  formattedUserAfit () {
		return this.numberFormat((parseFloat(this.userTokens) + parseFloat(this.userAddedTokens)).toFixed(3), 3) + " AFIT";
      },
	  formattedUserAfitSE () {
		return this.numberFormat(parseFloat(this.afit_se_balance), 3) + " AFIT S-E" ;
      },
	  formattedUserAfitHE () {
		return this.numberFormat(parseFloat(this.afit_he_balance), 3) + " AFIT H-E";
      },
	  formattedUserAFITXSE () {
		return this.numberFormat(this.afitx_se_balance,3) + ' AFITX S-E';
	  },
	  formattedUserAFITXHE () {
		return this.numberFormat(this.afitx_he_balance, 3) + ' AFITX H-E';
	  },
	  displayUserRank () {
		return this.userRank
	  },
	  isClaimableDataAvailable () {
	  //confirms whether we have useful claimable data to control display of the relevant section
		return (parseFloat(this.claimSTEEM)>0 ||
			parseFloat(this.claimSP) ||
			parseFloat(this.claimVests) ||
			parseFloat(this.claimSBD) );
	  },
	  isPoweringDown () {
		//returns whether user is powering down
		if (typeof this.user != 'undefined' && this.user != null){
		  if (this.user.account.vesting_withdraw_rate.split(' ')[0] > 0){
			return true;
		  }
		}
		return false;
	  },
	  smallScreenBtnClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  },
    },
	watch: {
	  user: 'fetchUserData',
	  tokenMetrics: 'formattedTotAccountVal',
	  steemPrice: 'formattedTotAccountVal',
	  transferType: 'resetTransAmount',
	  afit_val_exchange: function(newVal){
		let new_val = this.extra_reward_arr.find(match => match.afit == this.afit_val_exchange)
		this.afit_exch_matching_perc = new_val.upvote;
	  },
	  bchain: function(newBchain) {
		console.log('change in chain');
		this.cur_bchain = newBchain;
		this.$store.dispatch('steemconnect/refreshUser');
		//this.reload += 1;
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
      numberFormat (number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
      },
	  renderTransAmount (nofrmt) {
		if (this.transferType == 'SBD' || this.transferType == 'HBD'){
			return this.renderSBDBalance(this.cur_bchain, nofrmt)
		}else{
			return this.renderBalance(this.cur_bchain, nofrmt) 
		}
	  },
	  fillTransAmount (){
		this.$refs['transfer-amount'].value = this.renderTransAmount('1').split(' ')[0];
	  },
	  resetTransAmount () {
		this.$refs['transfer-amount'].value = '';
	  },
	  editDelegation(delegation){
		this.$refs['delegate-recipient'].value = delegation.delegatee;
		this.$refs['delegate-amount'].value = (delegation.power).toFixed(3);
	  },
	  cancelDelegation(delegation){
		this.$refs['delegate-recipient'].value = delegation.delegatee;
		this.$refs['delegate-amount'].value = 0;
	  },
	  //grab account delegations
	  async fetchDelegations(forceOpen){
		if (!forceOpen){
			this.delegateFunds();
		}
		let chainLnk = await this.setProperNode();
		this.loadingDeleg = true;
		let max_limit = 1000;
		let max_date = new Date(2016, 1, 1, 0, 0, 0, 0);
		let delg = await chainLnk.api.getVestingDelegationsAsync(this.user.account.name, max_date, max_limit);
		console.log(delg);
		if (Array.isArray(delg) && delg.length > 0){
			for (let i=0; i < delg.length; i++){
				delg[i].power = await this.vestsToSteemPower(delg[i].vesting_shares);
			}
		}
		this.activeDelegations = delg;
		this.loadingDeleg = false;
	  },
	  //handles setting proper token to be staked
	  initiateStaking(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being staked
		if (this.selTokenUp == token && this.curTokenAction == this.POWERUP_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.curTokenAction = this.POWERUP_FUNDS;
		this.selTokenUp = token;
	  },
	  initiateUnStaking(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.POWERDOWN_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.curTokenAction = this.POWERDOWN_FUNDS;
		this.selTokenUp = token;
	  },
	  initiateTransfer(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.TRANSFER_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.curTokenAction = this.TRANSFER_FUNDS;
		this.selTokenUp = token;
	  },
	  initiateWithdraw(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.WITHDRAW_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.curTokenAction = this.WITHDRAW_FUNDS;
		this.selTokenUp = token;
	  },
	  topHolder(user){
		if (this.topAFITXHolders.length){
			return this.topAFITXHolders.find(v => v.account == user)
		}
		return '';
	  },
	  topHolderBalance(rank){
		if (this.topAFITXHolders.length > rank){
			return this.topAFITXHolders[rank];
		}
		return {};
	  },
	  minJoinTopHolders () {
		let lastTopHold = this.topHolderBalance(this.topAFITXHolders.length - 1);
		if (lastTopHold){
			let missingAmount = lastTopHold.balance - this.afitx_se_balance;
			return this.numberFormat(missingAmount, 5);
		}
	  },
	  date(val) {
        let date = new Date(val)
        let minutes = date.getMinutes()
        return date.getDate() + '/' 
			+ (date.getMonth() + 1) + '/' 
			+ date.getFullYear() + ' ' 
			+ date.getHours() + ':' 
			+ (minutes < 10 ? '0' + minutes : minutes)
      },
	  formattedTotAccountVal () {
		this.totalAccountValue = 0;
		if (this.tokenMetrics.length > 0){
		
			this.detailCalculation = '';
			//get AFITX val
			/*let afitxData = this.tokenMetrics.find(v => v.symbol == 'AFITX');
			let afitxVal = this.afitx_se_balance * parseFloat(afitxData.lastPrice)
			this.totalAccountValue += afitxVal
			this.detailCalculation += this.afitx_se_balance + ' AFITX x '+ afitxData.lastPrice + ' AFITX/STEEM = ' + this.numberFormat(afitxVal, 4) + ' STEEM<br/>';
			
			//get AFIT SE val
			let afitData = this.tokenMetrics.find(v => v.symbol == 'AFIT');
			let afitseVal = this.afit_se_balance * parseFloat(afitData.lastPrice);
			this.totalAccountValue += afitseVal
			this.detailCalculation += this.afit_se_balance + ' AFIT S-E x '+ afitData.lastPrice + ' AFIT S-E/STEEM = ' + this.numberFormat(afitseVal, 4) + ' STEEM<br/>';*/
			
			//base currency (STEEM v/s HIVE)
			let baseCurrency = this.steemPrice
			let peggedCurrencyUnit = 'SBD';
			if (this.cur_bchain == 'HIVE' ){
				baseCurrency = this.hivePrice
				peggedCurrencyUnit = 'HBD';
			}
			//get AFIT standard val
			let afitCoreVal = this.userTokens * this.afitPrice / baseCurrency;
			//console.log(afitCoreVal);
			this.totalAccountValue += afitCoreVal;
			this.detailCalculation += this.userTokens + ' AFIT x '+ this.numberFormat((this.afitPrice / baseCurrency), 4) + ' AFIT/'+this.cur_bchain+' = ' + this.numberFormat(afitCoreVal, 4) + ' '+this.cur_bchain+'<br/>';
			
			let par = this;
			//grab tokens of interest vals as well
			this.tokensOfInterestBal.forEach(function(token, index){
				let tokenData = par.tokenMetrics.find(v => v.symbol == token.symbol);
				if( !tokenData || (typeof tokenData.lastPrice === 'undefined' || tokenData.lastPrice === null )){
					tokenData = new Object();
					tokenData.lastPrice = 1;
				}
				if( typeof token.stake === 'undefined' || token.stake === null || tokensNonStakable.includes(token.symbol)){
					token.stake = 0;
					token.stakable = false;
				}else{
					token.stakable = true;
				}
				let tokenVal = token.balance * parseFloat(tokenData.lastPrice)
				tokenVal += token.stake * parseFloat(tokenData.lastPrice)
				par.totalAccountValue += tokenVal
				par.detailCalculation += '(' + token.balance + ' + ' + token.stake + ') ' + token.symbol + ' x '+ tokenData.lastPrice + ' ' + token.symbol + '/'+par.cur_bchain+' = ' + par.numberFormat(tokenVal, 4) + ' '+par.cur_bchain+'<br/>';
				//console.log('value for '+token.symbol+ ' $ ' + tokenVal);
			});
			
			//grab claimable tokens of interest vals as well
			this.claimableSETokens.forEach(function(token, index){
				let tokenData = par.tokenMetrics.find(v => v.symbol == token.symbol);
				//console.log(token);
				//console.log(tokenData);
				if (tokenData && tokenData.lastPrice){
					let prec = par.tokenOfInterestPrecision[token.symbol];
					//console.log(prec);
					let tokenVal = parseFloat(par.numberFormat(token.amount, prec)) * parseFloat(tokenData.lastPrice);
					par.totalAccountValue += tokenVal
					par.detailCalculation += par.numberFormat(token.amount, prec) + ' ' + token.symbol + ' x '+ tokenData.lastPrice + ' ' + token.symbol + '/'+par.cur_bchain+' = ' + par.numberFormat(tokenVal, 4) + ' '+par.cur_bchain+'<br/>';
				}
				//console.log('claimable value for '+token.symbol+ ' $ ' + tokenVal);
			});
			

			//append STEEM + SP amount
			let totSteem = parseFloat(this.user.account.balance) + parseFloat(this.steemPower);
			this.totalAccountValue += totSteem;
			
			this.detailCalculation += '(' + parseFloat(this.user.account.balance) + ' + ' + this.steemPower + ') '+this.cur_bchain+' x 1 = ' + this.numberFormat(totSteem, 4) + ' '+this.cur_bchain+'<br/>';
			
			//append SBD amount after conversion to STEEM
			if (this.cur_bchain == 'STEEM'){
				let sbd_val = (parseFloat(this.user.account.sbd_balance) * this.sbdPrice / baseCurrency);;
				this.totalAccountValue += sbd_val;
				this.detailCalculation += parseFloat(this.user.account.sbd_balance) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.sbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(sbd_val, 4) + ' '+this.cur_bchain+'<br/>';
			}else{
				let sbd_val = (parseFloat(this.user.account.hbd_balance) * this.hbdPrice / baseCurrency);;
				this.totalAccountValue += sbd_val;
				this.detailCalculation += parseFloat(this.user.account.hbd_balance) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.hbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(sbd_val, 4) + ' '+this.cur_bchain+'<br/>';
			}
						

			//append claimable STEEM + SP
			let totClaimSteem = parseFloat(this.claimSP) + parseFloat(this.claimSTEEM); 
			this.totalAccountValue += totClaimSteem;
			
			this.detailCalculation += '(' + parseFloat(this.claimSTEEM) + ' + ' + parseFloat(this.claimSP) + ') '+this.cur_bchain+' x 1 = ' + this.numberFormat(totClaimSteem, 4) + ' '+this.cur_bchain+'<br/>';
			
			//console.log(parseFloat(this.claimSBD) * this.sbdPrice / this.steemPrice);
			if (this.cur_bchain == 'STEEM'){
				let claim_sbd = (parseFloat(this.claimSBD) * this.sbdPrice / baseCurrency);
				this.totalAccountValue += claim_sbd;
				this.detailCalculation += parseFloat(this.claimSBD) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.sbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(claim_sbd, 4) + ' '+this.cur_bchain+'<br/>';
			}else{
				let claim_sbd = (parseFloat(this.claimSBD) * this.hbdPrice / baseCurrency);
				this.totalAccountValue += claim_sbd;
				this.detailCalculation += parseFloat(this.claimSBD) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.hbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(claim_sbd, 4) + ' '+this.cur_bchain+'<br/>';
			}
			this.detailCalculation += '-----<br/>';
			
			this.totalAccountValueSteem = this.totalAccountValue;
			
			//convert amount to STEEM price
			//console.log(this.totalAccountValue);
			this.totalAccountValue *= baseCurrency;
			
			this.detailCalculation += this.numberFormat(this.totalAccountValueSteem, 4) + ' '+this.cur_bchain+' x '+ baseCurrency + ' '+this.cur_bchain+'/USD = $ ' + this.numberFormat(this.totalAccountValue, 4) + ' USD<br/>';
			
			//console.log(baseCurrency);
			//console.log(this.totalAccountValue);
			this.totalAccountValue = this.numberFormat(this.totalAccountValue, 2);
			
		} 
	  },
	  renderSteemPower (type) {
		switch(type){
			case 1: return this.numberFormat(this.steemPower, 3);
					
			case 2: return this.numberFormat(this.effectiveSteemPower, 3);
					
			case 3: return this.numberFormat(this.receivedSteemPower, 3);
					
			case 4: return this.numberFormat(this.delegatedSteemPower, 3);
					
			case 5: return this.numberFormat(this.powerDownRateVal, 3);
		}
	  },
	  renderBalance (type, nofrmt) {
		if (nofrmt){
			return this.user.account.balance;
		}
		return this.numberFormat(parseFloat(this.user.account.balance), 3) + ' ' + type;
	  },
	  renderSBDBalance (type, nofrmt) {
		if (nofrmt){
			if (this.cur_bchain == 'STEEM'){
				return this.user.account.sbd_balance;
			}else{
				return this.user.account.hbd_balance;
			}
		}
		if (this.cur_bchain == 'STEEM'){
			return this.numberFormat(parseFloat(this.user.account.sbd_balance), 3) + ' ' + ((type == 'STEEM')?this.$t('SBD'):this.$t('HBD'));
		}else{
			return this.numberFormat(parseFloat(this.user.account.hbd_balance), 3) + ' ' + ((type == 'STEEM')?this.$t('SBD'):this.$t('HBD'));
		}
	  },
	  setUserPDAfitStatus (result) {
		this.userPDAfit = result;
		//next power down takes place every day same time 10:00 AM UTC
		//console.log(result);
		//console.log(result.user);
		//only display if user is powering down AFIT
		if (result.user && result.daily_afit_transfer){
			//check current time
			let curDate = new Date();
			let voteDate = new Date();
			let timeString = (curDate.getUTCHours()<10?'0'+curDate.getUTCHours():curDate.getUTCHours()) + '' + (curDate.getUTCMinutes()<10?'0'+curDate.getUTCMinutes():curDate.getUTCMinutes());

			//time passed, jump till tomorrow
			if (parseInt(timeString) > 1000){//10:00 AM
				//add one day till next vote
				voteDate.setDate(voteDate.getDate() + 1);
			}
			voteDate.setUTCHours(10);
			voteDate.setUTCMinutes(0);
			voteDate.setUTCSeconds(0);
			
			this.nextAfitPDTarget = ""+voteDate;//"August 14, 2019 13:00 GMT";//
			this.afitPowerDownText = this.$t('next_afit_powerdown').replace('AFIT_AMOUNT', this.userPDAfit.daily_afit_transfer+ ' AFIT');
			this.countDownReady = true;
		}
	  },
	  setUserAddedTokens(outcome){
		if (outcome.error){
			console.error(outcome);
		}else{
			//update user token count
			if (outcome.afit_se_power){
				this.userAddedTokens = outcome.afit_amount;
			}
		}
	  },
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){	  
		  console.log('stdLoginUser');
		  console.log(this.stdLogin);
		  console.log(this.user);
		  
		  //update user info from blockchain
		  if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			try{
				let user_data = await this.$steemconnect.me();
				this.user.account = user_data.account;
			}catch(excp){
				console.log(excp);
			}
		  }
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchTransactions')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		  
		  //let's check if user already has a funds pass set
		  fetch(process.env.actiAppUrl+'userHasFundsPassSet/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserPassStatus (json)).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //let's check if user has a pending AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'userHasPendingTokenSwap/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserTokenSwapStatus (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //let's grab the full queue of pending AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'getPendingTokenSwapTrans/').then(
			res => {res.json().then(json => this.setTokenSwapQueue (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //let's grab the user's history AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'getUserTokenSwapHistory/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserTokenSwapHistory (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))

		  //let's grab the user's steem-engine tokens too
		  this.fetchTokenBalance();
		  
		  //let's grab the user's steem-engine tokens too
		  if (this.cur_bchain == 'STEEM'){
			  fetch(scot_steemengine_api+'@'+this.user.account.name).then(
				res => {res.json().then(json => this.setUserClaimableSETokens (json) ).catch(e => reject(e))
			  }).catch(e => reject(e))
		  
		  }else{
			  fetch(scot_steemengine_api+'@'+this.user.account.name+scot_hive_api_param).then(
				res => {res.json().then(json => this.setUserClaimableSETokens (json) ).catch(e => reject(e))
			  }).catch(e => reject(e))

		  }
		  
		  //let's grab the number of pending token swap transactions to see if we can add more
		  /*fetch(process.env.actiAppUrl+'getPendingTokenSwapTransCount').then(
			res => {res.json().then(json => this.pendingTokenSwapTransCount = json ).catch(e => reject(e))
		  }).catch(e => reject(e))*/
		  		  
		  //grab SP
		  this.steemPower = await this.vestsToSteemPower(this.user.account.vesting_shares);
		
		  //grab Delegated SP
		  this.delegatedSteemPower = await this.vestsToSteemPower(this.user.account.delegated_vesting_shares);
		
		  //grab received SP
		  this.receivedSteemPower = await this.vestsToSteemPower(this.user.account.received_vesting_shares);
		  
		  //grab powerdown SP
		  this.powerDownRateVal = await this.vestsToSteemPower(this.user.account.vesting_withdraw_rate.split(' ')[0]);
		  
		  //grab next power down withdrawal date
		  this.powerDownWithdrawDate = this.date(this.user.account.next_vesting_withdrawal);
		
		  //effective SP
		  this.effectiveSteemPower = this.steemPower + this.receivedSteemPower - this.delegatedSteemPower - this.powerDownRateVal;
		
		  //also update claimable amounts
		  this.claimableSTEEMRewards();
		  
		   
		  //fetch user's AFIT S-E balance
		  
		  this.fetchAFITSE();
		  
		  //fetch user's AFIT H-E balance
		  
		  this.fetchAFITHE();
		  
		  
		  //fetch user's AFITX S-E balance
		  this.fetchAFITXSE();
		  
		  //fetch user's AFITX H-E balance
		  this.fetchAFITXHE();
		  
		  //fetch user's AFITX Rank
		   fetch(process.env.actiAppUrl+'afitxData/'+this.user.account.name).then(
			res => {res.json().then(json => this.userAFITXRank = json.ind ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  
		  //fetch user's tokensOfInterest S-E balance
		  let tokenData
		  if (this.cur_bchain == 'STEEM'){
			tokenData = await ssc.find('tokens', 'balances', { account: this.user.account.name, symbol : { '$in' : tokensOfInterest } });
		  }else{
			tokenData = await hsc.find('tokens', 'balances', { account: this.user.account.name, symbol : { '$in' : tokensOfInterest } });
		  }
		  
		  if (tokenData){
			this.tokensOfInterestBal = tokenData.sort(function tokenEntry(a, b) {
				return b.symbol < a.symbol ?  1
						: b.symbol > a.symbol ? -1
						: 0;
			});
		  }
		  
		  //fetch tokens' data (price et al)
		  if (this.cur_bchain == 'STEEM'){
			this.tokenMetrics = await ssc.find('market', 'metrics', {symbol : { '$in' : tokensOfInterest.concat(['AFIT','AFITX']) }}, 1000, 0, '', false);	  
		  }else{
			this.tokenMetrics = await hsc.find('market', 'metrics', {symbol : { '$in' : tokensOfInterest.concat(['AFIT','AFITX']) }}, 1000, 0, '', false);	
		  }
		  //check if user is powering down AFIT to SE
		  fetch(process.env.actiAppUrl+'isPoweringDown/'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserPDAfitStatus (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //grab list of top 25 AFITX token holders
		  fetch(process.env.actiAppUrl+'topAFITXHolders/?count=25').then(
			res => {res.json().then(json => this.topAFITXHolders = json ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //grab list of top 100 AFITX token holders
		  fetch(process.env.actiAppUrl+'topAFITXHolders/?count=100').then(
			res => {res.json().then(json => this.afitxHoldersList = json ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  //grab list of top 100 AFIT token holders
		  fetch(process.env.actiAppUrl+'topAFITHolders/?count=100').then(
			res => {res.json().then(json => this.afitHoldersList = json ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		}
	  },
	  async fetchAFITSE() {
		let bal = await ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFIT' });
		  
		  if (bal){
			  this.afit_se_balance = bal.balance;
			  
			  //if this operation relates to powering up AFIT from S-E, need to also initiate call to adjust AFIT token count
			  if (this.$route.query.confirm_trans == 1){
				
				let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.user.name+'&bchain='+this.cur_bchain);
				//connect with our service to confirm AFIT received to proper wallet
				try{
					
					fetch(url).then(
					  res => {res.json().then(json => this.setUserAddedTokens(json)).catch(e => reject(e))
					}).catch(e => reject(e))
					
				
				}catch(err){
					console.error(err);
					//this.checkingFunds = false;
				}
			  }
		  }
	  },
	  async fetchAFITHE() {
		  let bal = await hsc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFIT' });
		  if (bal){
			  this.afit_he_balance = bal.balance;
		  }
	  },
	  fetchAFITXSE() {
		  let parnt = this
		  ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' }).then(
				function(bal) {
					
					
					if (bal){
						  parnt.afitx_se_balance = bal.balance;
					  }
				}
			)
	  },
	  fetchAFITXHE() {
		  let parnt = this
		  hsc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' }).then(
				function(bal) {
					
					
					if (bal){
						  parnt.afitx_he_balance = bal.balance;
					  }
				}
			)
	  },
	  
	  setAFITPrice (_afitPrice){
		this.afitPrice = parseFloat(_afitPrice).toFixed(6);
	  },
	  setUserPassStatus (result) {
		//handles setting funds password status
		//set proper value for funds pass confirmation
		this.userHasFundsPass = result.hasFundsPass;
		
		//set proper value for verified funds pass status
		this.userFundsPassVerified = result.passVerified;
	  },
	  setUserTokenSwapStatus (result){
	    //handles setting user token swap status
		if (result.user_pending_swap){
			this.pendingTokenSwap = result.user_pending_swap
		}else{
			this.pendingTokenSwap = '';
		}
		//
	  },
	  setTokenSwapQueue (result){
		//handles setting the current tokenSwapQueue
		this.tokenSwapQueue = result
		this.getUserQueueDetails();
	  },
	  getUserQueueDetails (){
		let entryList = this.tokenSwapQueue.pendingTransactions
		//sets proper full entry for user's token queue exchange details
		for (let i=0, max = entryList.length; i<max;i++){
			if (entryList[i].user === this.user.account.name){
				//found our user
				this.userTokenSwapPending = entryList[i];
				break;
			}
		}
	  },
	  setUserTokenSwapHistory (result){
		//handles setting the user's token swap history
		this.userTokenSwapHistory = result;
	  },
	  renderBal (token) {
		let prec = this.tokenOfInterestPrecision[token.symbol];
		return this.numberFormat(token.balance, prec);
	  },
	  renderStake (token) {
		let totalStaked = 0;
		totalStaked += parseFloat(token.delegationsIn) + parseFloat(token.stake);
		let prec = this.tokenOfInterestPrecision[token.symbol];
		return this.numberFormat(totalStaked, prec);
	  },
	  delegStake (token) {
		let prec = this.tokenOfInterestPrecision[token.symbol];
		return this.numberFormat(parseFloat(token.delegationsOut), prec);
	  },
	  renderTokenVal (amount, symbol) {
		if (this.tokenOfInterestPrecision[symbol]){
			let prec = this.tokenOfInterestPrecision[symbol];
			return this.numberFormat(amount / Math.pow(10, prec), prec)
		}
	  },
	  setSETokensPrecision (result) {
		let par = this;
		this.tokenOfInterestPrecision = [];
		//console.log(result);
		//loop through our tokens of interest to fetch them and allow users to claim their rewards
		tokensOfInterest.forEach( function(item, index){
		  try{
			  let tokenDetails = result[item];
			  if (tokenDetails){
				par.tokenOfInterestPrecision[item] = tokenDetails.precision;
			  }
		  }catch(e){
			console.error(e);
		  }
		});
	  },
	  setUserClaimableSETokens (result) {
		let par = this;
		this.claimableSETokens = [];
		//loop through our tokens of interest to fetch them and allow users to claim their rewards
		tokensOfInterest.forEach( function(item, index){
		  try{
			  let tokenDetails = result[item];
			  //if we have pending rewards
			  if (tokenDetails && tokenDetails.pending_token > 0){
				par.claimableSETokens.push({symbol: tokenDetails.symbol, amount: tokenDetails.pending_token });
			  }
		  }catch(e){
			console.error(e);
		  }
		});		
	  },
	  async vestsToSteemPower (vests) {
		//function handles converting Vests to SP
		let chainLnk = await this.setProperNode();
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		}
		if (this.cur_bchain == 'STEEM'){
			let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			vests = Number(vests.split(' ')[0]);
			return (totalSteem * (vests / totalVests));
		}else{
			let totalSteem = Number(this.properties.total_vesting_fund_hive.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			vests = Number(vests.split(' ')[0]);
			return (totalSteem * (vests / totalVests));
		}
		
	  },
	  async steemPowerToVests (steemPower) {
	    //function handles conversting SP to Vests
		let chainLnk = await this.setProperNode();
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		}
		if (this.cur_bchain == 'STEEM'){
			let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
		}else{
			let totalSteem = Number(this.properties.total_vesting_fund_hive.split(' ')[0]);
			let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
			return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
		}
	  },
	  claimableSTEEMRewards () {
		//function handles preparing claimable STEEM rewards
		if (typeof this.user != 'undefined' && this.user != null){
		  this.claimSTEEM = this.user.account.reward_steem_balance;
		  this.claimSP = this.user.account.reward_vesting_steem + " POWER";
		  this.claimVests = this.user.account.reward_vesting_balance;
		  this.claimSBD = this.user.account.reward_sbd_balance;
		  if (this.cur_bchain=='HIVE'){
			this.claimSTEEM = this.user.account.reward_hive_balance;
			this.claimSP = this.user.account.reward_vesting_hive + " POWER";
			this.claimSTEEM = this.claimSTEEM.replace('STEEM','HIVE');
			this.claimSBD = this.user.account.reward_hbd_balance;
		  }
		  return this.claimSP + this.claimSTEEM + this.claimSBD;
		}
		return '';
	  },
	  async claimTokenRewards () {
		//function handles claiming token rewards
		this.claimingTokens = true;
		//build list of claimable tokens
		let claimableTokens = [];
		this.claimableSETokens.forEach( function(item, index){
			claimableTokens.push({symbol: item.symbol});
		});
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'scot_claim_token',
			json: JSON.stringify(claimableTokens)
		  };
		console.log(this.stdLogin);
		
		let res = await this.processTrxFunc('custom_json', cstm_params);
		
		console.log('trx status:'+res.success);
		if (res.success){
			this.$notify({
			  group: 'success',
			  text: this.$t('tokens_claimed_successfully'),
			  position: 'top center'
			})
			//reset claimable tokens
			this.claimableSETokens = [];
			
			//also run after 30 seconds a refresh on token count
			setTimeout(this.fetchTokenBalance , 20);
		}
		this.claimingTokens = false;
	  },
	  async fetchTokenBalance () {
		//let's grab the precision for our tokens of interest for proper value display
		if (this.cur_bchain == 'STEEM'){  
		  fetch(scot_steemengine_api+'info').then(
			res => {res.json().then(json => this.setSETokensPrecision (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		}else{
		  fetch(scot_steemengine_api+'info'+scot_hive_api_param).then(
			res => {res.json().then(json => this.setSETokensPrecision (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		}
	  },
	  async claimRewards () {
		//function handles claiming STEEM rewards
		
		
		
		if (!localStorage.getItem('std_login')){
			//sample link: https://steemconnect.com/sign/claim-reward-balance?account=sdsf&reward_steem=33&reward_sbd=2342&reward_vests=23432
			var link = this.$steemconnect.sign('claim-reward-balance', {
			  account: this.user.account.name,
			  reward_steem: this.claimSTEEM,
			  reward_sbd: this.claimSBD,
			  reward_vests: this.claimVests,
			  auto_return: true,
			}, window.location.origin + '/wallet?op=claim rewards&status=success');

			window.open(link);
			
			//Below would have been preferred approach, but claimRewardBalance keeps failing as it requires more authority. Keeping here for future further exploration
			/*
			console.log(this.claimSTEEM.split(' ')[0]);
			console.log(this.claimSBD.split(' ')[0]);
			console.log(this.claimVests.split(' ')[0]);
			await this.$steemconnect.claimRewardBalance(this.user.account.name, this.claimSTEEM, this.claimSBD, this.claimSP);
			console.log('done');*/
		}else{
			this.claimRewardsProcess = true;
			let chainLnk = await this.setProperNode ();
			console.log('claiming rewards');
			//TODO: below replace functions are needed for compatibility now with steem-js still using STEEM & SBD terminology for HIVE
			let cstm_params = {
				"account": this.user.account.name,
				"reward_steem": this.claimSTEEM,
				"reward_sbd": this.claimSBD,
				"reward_vests": this.claimVests
			};
			
			if (this.cur_bchain == 'HIVE') {
				cstm_params = {
					"account": this.user.account.name,
					"reward_hive": this.claimSTEEM,
					"reward_hbd": this.claimSBD,
					"reward_vests": this.claimVests
				};
			}
			
			let res = await this.processTrxFunc('claim_reward_balance', cstm_params);
			
			if (res.success){
				this.confirmCompletion('claimrewards', 0, res.trx.tx);
			}
			/*steem.broadcast.claimRewardBalanceAsync(this.user.account.name,this.claimSTEEM, this.claimSBD, this.claimSP).then(
				res => ).catch(err=>console.log(err));*/
		}
	  },
	  transferFunds () {
		//function handles opening/closing transfer section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.TRANSFER_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.TRANSFER_FUNDS;
		}
		//hide upper activity section
		this.afitActivityMode = 0;
	  },
	  powerUpFunds () {
		//function handles opening/closing of power up section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.POWERUP_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.POWERUP_FUNDS;
		}
		//hide upper activity section
		this.afitActivityMode = 0;
	  },
	  powerDownFunds () {
		//function handles opening/closing of power up section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.POWERDOWN_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.POWERDOWN_FUNDS;
		}
		//hide upper activity section
		this.afitActivityMode = 0;
	  },
	  delegateFunds () {
		//function handles opening/closing of delegation section
		
		//set proper Fund Activity Mode controlling the display
		if (this.fundActivityMode == this.DELEGATE_FUNDS ){
		  this.fundActivityMode = 0;
		}else{
		  this.fundActivityMode = this.DELEGATE_FUNDS;
		}
		//hide upper activity section
		this.afitActivityMode = 0;
	  },
	  async proceedTransfer () {
		//function handles the actual processing of the transfer
		
		let confirmPopup = confirm(this.$t('confirm_transfer'));
		if (!confirmPopup){
			return;
		}
		
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["transfer-recipient"].value.trim() == '' ||
			this.$refs["transfer-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		if (isNaN(this.$refs["transfer-amount"].value.trim()) || this.$refs["transfer-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}
		
		if (localStorage.getItem('std_login')){
			if (this.$refs["p-ac-key-trans"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
		}
		
		if (!localStorage.getItem('std_login')){
			
			//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
			var link = this.$steemconnect.sign('transfer', {
			  from: this.user.account.name,
			  to: this.$refs["transfer-recipient"].value,
			  amount: this.$refs["transfer-amount"].value + ' ' + this.transferType,
			  memo: this.$refs["transfer-memo"].value,
			  auto_return: true,
			}, window.location.origin + '/wallet?op=transfer&status=success');
			//launch the SC window
			window.open(link);
		}else{
			this.transferProcess = true;
			let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferAsync(this.$refs["p-ac-key-trans"].value, this.user.account.name, this.$refs["transfer-recipient"].value, parseFloat(this.$refs["transfer-amount"].value).toFixed(3) + ' ' + this.transferType, this.$refs["transfer-memo"].value).then(
				res => this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  transferTypeChange (e) {
	    //handles the drop down select option to ensure we have proper value
		if(e.target.options.selectedIndex > -1) {
		  this.transferType = e.target.options[e.target.options.selectedIndex].value;
		}
	  },
	  async proceedPowerUp () {
		//function handles the actual processing of the power up
		let confirmPopup = confirm(this.$t('confirm_power_up'));
		if (!confirmPopup){
			return;
		}
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["powerup-recipient"].value.trim() == '' ||
			this.$refs["powerup-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		if (isNaN(this.$refs["powerup-amount"].value.trim()) || this.$refs["powerup-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}
		
		if (localStorage.getItem('std_login')){
			if (this.$refs["p-ac-key-up"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
		}
		
		if (!localStorage.getItem('std_login')){
			
			//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
			var link = this.$steemconnect.sign('transfer-to-vesting', {
			  from: this.user.account.name,
			  to: this.$refs["powerup-recipient"].value,
			  amount: parseFloat(this.$refs["powerup-amount"].value).toFixed(3) + ' ' + 'STEEM',
			  auto_return: true,
			}, window.location.origin + '/wallet?op=power up&status=success');
			//launch the SC window
			window.open(link);
		}else{
			this.powerUpProcess = true;
			let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferToVestingAsync(this.$refs["p-ac-key-up"].value, this.user.account.name, this.user.account.name, parseFloat(this.$refs["powerup-amount"].value).toFixed(3) + ' ' + 'STEEM' ).then(
				res => this.confirmCompletion('powerup', this.$refs["powerup-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  
	  async proceedDelegation () {
		//function handles the actual processing of delegation
		let confirmPopup = confirm(this.$t('confirm_delegation'));
		if (!confirmPopup){
			return;
		}
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["delegate-recipient"].value.trim() == '' ||
			this.$refs["delegate-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		/*if (isNaN(this.$refs["delegate-amount"].value.trim()) || this.$refs["delegate-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}*/
		
		if (localStorage.getItem('std_login')){
			if (this.$refs["p-ac-key-delg"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
		}
		
		if (!localStorage.getItem('std_login')){
			
			//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
			/*var link = this.$steemconnect.sign('transfer-to-vesting', {
			  from: this.user.account.name,
			  to: this.$refs["delegate-recipient"].value,
			  amount: parseFloat(this.$refs["delegate-amount"].value).toFixed(3) + ' ' + 'STEEM',
			  auto_return: true,
			}, window.location.origin + '/wallet?op=delegate&status=success');
			//launch the SC window
			window.open(link);*/
		}else{
			this.delegateProcess = true;
			let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let vestsValue = await this.steemPowerToVests(this.$refs["delegate-amount"].value);
			let res = await chainLnk.broadcast.delegateVestingSharesAsync(this.$refs["p-ac-key-delg"].value, this.user.account.name, this.$refs["delegate-recipient"].value.trim(), vestsValue + ' ' + 'VESTS' ).then(
				res => this.confirmCompletion('delegate', this.$refs["delegate-amount"].value, res)).catch((err)=>{
					console.log(err);
					this.error_proceeding = true;
					this.error_msg = 'Error Processing. Make sure you are using your private active key';
					this.delegateProcess = false
				});
		}
	  },
	  
	  async proceedPowerDown () {
		//function handles the actual processing of the power down
		
		let confirmPopup = confirm(this.$t('confirm_power_down'));
		if (!confirmPopup){
			return;
		}
		
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["powerdown-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		if (localStorage.getItem('std_login')){
			if (this.$refs["p-ac-key"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
		}
		if (isNaN(this.$refs["powerdown-amount"].value.trim())){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}
		let vestsValue = await this.steemPowerToVests(this.$refs["powerdown-amount"].value);
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		
		if (!localStorage.getItem('std_login')){
			var link = this.$steemconnect.sign('withdraw-vesting', {
			  account: this.user.account.name,
			  vesting_shares: vestsValue + ' ' + 'VESTS',
			  auto_return: true,
			}, window.location.origin + '/wallet?op=power down&status=success');
			//launch the SC window
			window.open(link);
		}else{
			this.powerDownProcess = true;
			let chainLnk = await this.setProperNode ();
			let res = await chainLnk.broadcast.withdrawVestingAsync(this.$refs["p-ac-key"].value, this.user.account.name, vestsValue + ' VESTS' ).then(
				res => this.confirmCompletion('powerdown', this.$refs["powerdown-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  async confirmCompletion (type, amount, res){
		if (res.ref_block_num){
			console.log (res);
			let note = 'Power down cancelled successfully!';
			let power_type = 'SP';
			if (this.cur_bchain=='HIVE'){
				power_type = 'HP';
			}
			if (type=='powerdown' && amount > 0){
				note = 'Power down of '+amount + ' ' + power_type + ' started successfully!';
			}
			if (type=='powerup'){
				note = 'Power up of '+amount+ ' ' + power_type + ' completed successfully!';
			}
			if (type=='claimrewards'){
				note = 'Rewards claimed successfully!';
			}
			if (type=='delegate'){
				note = 'Delegation completed successfully!';
			}
			if (type=='transfer'){
				note = 'Transfer completed successfully!';
			}
			if (type=='transfer-verify'){
				note = 'Transfer completed. Verifying transaction.'
			}
			this.$notify({
			  group: 'success',
			  text: note,
			  position: 'top center'
			})
			this.$store.dispatch('steemconnect/refreshUser');
		}else{
			this.$notify({
			  group: 'error',
			  text: this.$t('error performing action! '),
			  position: 'top center'
			})
		}
		if (type=='powerup'){
			this.powerUpProcess = false;
		}else if (type=='powerdown'){
			this.powerDownProcess = false;
		}else if (type=='claimrewards'){
			this.claimRewardsProcess = false;
		}else if (type=='delegate'){
			this.delegateProcess = false;
			this.fetchDelegations(true);
		}else if (type=='transfer'){
			this.transferProcess = false;
		}else if (type=='transfer-verify'){
			//also start verification process
			let url = new URL(process.env.actiAppUrl + 'confirmPaymentPasswordVerify/'+'?bchain=' + this.cur_bchain);
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
			}
			this.checkingFunds = false;
		}
	  },
	  async cancelPowerDown () {
		//function handles cancelling the power down
		
		let confirmPopup = confirm(this.$t('confirm_cancel_power_down'));
		if (!confirmPopup){
			return;
		}
		
		if (localStorage.getItem('std_login')){
			if (this.$refs["p-ac-key"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
		}
		if (!localStorage.getItem('std_login')){
			var link = this.$steemconnect.sign('withdraw-vesting', {
			  account: this.user.account.name,
			  vesting_shares: '0.000000 VESTS',
			  auto_return: true,
			}, window.location.origin + '/wallet?op=cancel power down&status=success');
			//launch the SC window
			window.open(link);
		}else{
			this.powerDownProcess = true;
			//steem.api.setOptions({ url: "https://api.steemit.com" });
			let chainLnk = await this.setProperNode ();
			let res = await chainLnk.broadcast.withdrawVestingAsync(this.$refs["p-ac-key"].value, this.user.account.name, '0.000000 VESTS' ).then(
				res => this.confirmCompletion('powerdown', 0, res)).catch(err=>console.log(err));
		}
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
	  exchangeAFITforSTEEM () {
		//function handles opening/closing exchanging AFIT tokens for STEEM upvotes  section
		
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.EXCHANGE_AFIT_STEEM ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.EXCHANGE_AFIT_STEEM;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  moveAFITXseHE () {
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.MOVE_AFITX_SE_HE ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.MOVE_AFITX_SE_HE;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  moveAFITXheSE () {
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.MOVE_AFITX_HE_SE ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.MOVE_AFITX_HE_SE;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  moveAFITseHE () {
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.MOVE_AFIT_SE_HE ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.MOVE_AFIT_SE_HE;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  moveAFITheSE () {
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.MOVE_AFIT_HE_SE ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.MOVE_AFIT_HE_SE;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  buyAFITwithSTEEM () {
		//function handles opening/closing exchanging AFIT tokens for STEEM upvotes  section
		
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.BUY_AFIT_STEEM ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.BUY_AFIT_STEEM;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  moveAFITSEtoAFITPOWER () {
		//function handles opening/closing exchanging AFIT tokens for STEEM upvotes  section
		
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.MOVE_AFIT_SE ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.MOVE_AFIT_SE;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  initiateAFITtoSE () {
		//function handles opening/closing moving AFIT to SE
		
		//set proper AFIT Activity Mode controlling the display
		if (this.afitActivityMode == this.INIT_AFIT_TO_SE ){
		  this.afitActivityMode = 0;
		}else{
		  this.afitActivityMode = this.INIT_AFIT_TO_SE;
		}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
	  },
	  passTransferTypeChange (e) {
	    //handles the drop down select option to ensure we have proper value
		if(e.target.options.selectedIndex > -1) {
		  this.transferTypePass = e.target.options[e.target.options.selectedIndex].value;
		}
	  },
	  setPasswordVal(){
		this.$refs["funds-pass"].value = this.generatePassword(2);
	  },
	  generatePassword (multip) {
		//generate random 11 characters password
		let passString = '';
		for (let i=0;i<multip;i++){
			passString += Math.random().toString(36).substr(2, 13);
		}
		return passString;
	  },
	  async setFundsPass () {
		//stores the password set by the user
		this.settingPass = true;
		this.errorSettingPass = '';
		//ensure we have proper values
		if (this.$refs["funds-pass"].value == ''){
		  this.errorSettingPass = this.$t('error_missing_funds_pass');
		  this.settingPass = false;
		  return;
		}
		//ensure user confirmed password
		if (this.$refs["confirm-funds-pass"].value !== this.$refs["funds-pass"].value){
		  this.errorSettingPass = this.$t('error_passwords_mismatch');
		  this.settingPass = false;
		  return;
		}
		let url = new URL(process.env.actiAppUrl + 'setUserFundsPass/'+this.user.account.name+'/'+this.$refs['funds-pass'].value);
		let res = await fetch(url);
		let outcome = await res.json();
		this.settingPass = false;
		if (!outcome.error){
			//success
			this.userHasFundsPass = true;
		}else{
			//display error
			this.errorSettingPass = outcome.error;
		}
	  },
	  async processTrxFunc(op_name, cstm_params){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.ref_block_num) {
				console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			console.log('broadcasting');
			console.log(operation);
			
			//console.log(this.$steemconnect.accessToken);
			//console.log(this.$store.state.accessToken);
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'');
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
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
				  text: err_msg,
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx};
			}
		}
	  },
	  async cancelMoveToSE(){
		this.afit_se_move_err_msg = '';
		let userConf = confirm(this.$t('Cancel_Transfer_Confirm'));
		if (!userConf) {
		  return;
		}
		
		
		//make sure password is provided
		//ensure user provided funds-pass
		if (this.$refs["move-funds-pass"].value == ''){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('error_missing_funds_pass') + ' <u><a href="/wallet?action=set_funds_pass">' + this.$t('create_funds_pass') + '</a></u>';
		  return;
		}
		
		this.initiateInProgress = true;
		
		//proceed with tipping
		let res = await fetch(process.env.actiAppUrl+'cancelAFITMoveSE/'
			+ '?user=' + this.user.account.name
			+ '&fundsPass=' + this.$refs["move-funds-pass"].value
			);
		let outcome = await res.json();
		if (outcome.status=='Success'){
			let afitCancPDTransaction = { action: 'Cancel AFIT To S-E Power Down'};
			//store the transaction to Steem BC
			let cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'actifit',
				json: JSON.stringify(afitCancPDTransaction)
			};
			
			let res = await this.processTrxFunc('custom_json', cstm_params);
			
			if (res.success){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('afit_power_down_canceled'),
				  position: 'top center'
				})
				
				//unset the value of existing transfer
				this.userPDAfit = false
			}
			
			
		}else{
			this.afit_se_move_error_proceeding = true;
			this.afit_se_move_err_msg = outcome.error;
		}
		this.initiateInProgress = false;
	  },
	  async proceedMoveToSE() {
		
		this.afit_se_move_error_proceeding = false;
		this.afit_se_move_err_msg = '';
		
		let amount_to_powerdown = this.$refs["afit-move-to-se"].value.trim();
		
		//ensure user provided funds-pass
		if (this.$refs["move-funds-pass"].value == ''){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('error_missing_funds_pass') + ' <u><a href="/wallet?action=set_funds_pass">' + this.$t('create_funds_pass') + '</a></u>';
		  return;
		}
		//ensure we have proper values
		if (isNaN(amount_to_powerdown) || parseFloat(amount_to_powerdown) < 0.1){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('min_amount_AFIT_power');
		  //this.movingFunds = false;
		  return;
		}
		amount_to_powerdown = parseFloat(amount_to_powerdown);
		//console.log(amount_to_powerdown);
		
		//ensure user is powering down value he has
		if (amount_to_powerdown > parseFloat(this.userTokens)){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('max_amount_AFIT_power_SE');
		  //this.movingFunds = false;
		  return;
		}
		this.initiateInProgress = true;
		
		try{
			//check if the user has enough AFITX S-E amount allowing him the transfers daily
			let bal = await ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' });
			
			let bal_he = await hsc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' });
			
			this.afitx_se_balance = 0;
			this.afitx_he_balance = 0;
			if (bal){
				this.afitx_se_balance = parseFloat(bal.balance);
			}
			if (bal_he){
				this.afitx_he_balance = parseFloat(bal_he.balance);
			}
			let free_movable_afit_day = 500;
			let afitx_afit_move_ratio = 100;
			if (amount_to_powerdown > free_movable_afit_day){
				if (bal || bal_he){
				  
				  let tot_afitx_bal = this.afitx_se_balance + this.afitx_he_balance;
				  //console.log('AFITX balance: '+this.afitx_se_balance);
				  
				  //make sure user has at least 0.1 AFITX to move tokens
				  /*if (tot_afitx_bal < 0.1){
					this.afit_se_move_error_proceeding = true;
					this.afit_se_move_err_msg = this.$t('no_proper_afitx_funds');
					this.initiateInProgress = false;
					return;
				  }*/
				  //console.log(amount_to_powerdown);
				  //console.log(this.afitx_se_balance);
				  //calculate amount that can be transferred daily
				  if ((amount_to_powerdown - free_movable_afit_day) / afitx_afit_move_ratio > tot_afitx_bal){
					this.afit_se_move_error_proceeding = true;
					this.afit_se_move_err_msg = this.$t('cannot_move_amount_afitx_needed').replace('AFIT_AMNT',amount_to_powerdown);
					this.initiateInProgress = false;
					return;
				  }
				}else{
					this.afit_se_move_error_proceeding = true;
					this.afit_se_move_err_msg = this.$t('no_proper_afitx_funds');
					this.initiateInProgress = false;
					return;
				}
			}
		}catch(err){
			this.afit_se_move_error_proceeding = true;
			this.afit_se_move_err_msg = this.$t('unable_fetch_bal_try_again');
			this.initiateInProgress = false;
			return;
		}
		//otherwise we're good, let's register the move
		
		
		//proceed with tipping
		let res = await fetch(process.env.actiAppUrl+'initiateAFITMoveSE/'
			+ '?user=' + this.user.account.name
			+ '&amount=' + amount_to_powerdown
			+ '&fundsPass=' + this.$refs["move-funds-pass"].value);
		let outcome = await res.json();
		if (outcome.status=='Success'){
			let afitPDTransaction = { action: 'AFIT To S-E Power Down', amount: amount_to_powerdown};
			//store the transaction to Steem BC
			let cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'actifit',
				json: JSON.stringify(afitPDTransaction)
			};
			let res = await this.processTrxFunc('custom_json', cstm_params);
			
			if (res.success){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('power_down_successfully_initiated'),
				  position: 'top center'
				})
				
				this.setUserPDAfitStatus(outcome.trx);
			}
			//check if user is powering down AFIT to SE
			  /*fetch(process.env.actiAppUrl+'isPoweringDown/'+this.user.account.name).then(
				res => {res.json().then(json => this.setUserPDAfitStatus (json) ).catch(e => reject(e))
			  }).catch(e => reject(e))*/
			
		}else{
			this.afit_se_move_error_proceeding = true;
			this.afit_se_move_err_msg = outcome.error;
		}
		this.initiateInProgress = false;
		
	  },
	  async proceedMoveSEPower() {
		//handles checking for proper confirmation of account via STEEM transfer
		//this.movingFunds = true
		//function handles the actual processing of the transfer
		this.afit_se_move_error_proceeding = false;
		this.afit_se_move_err_msg = '';
		
		let amount_to_power = this.$refs["afit-se-move-power"].value.trim();
		//ensure we have proper values
		if (isNaN(amount_to_power) || parseFloat(amount_to_power) < 0.01){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('min_amount_AFIT_power');
		  //this.movingFunds = false;
		  return;
		}
		//ensure user is powering up value he has
		if (parseFloat(amount_to_power) > parseFloat(this.afit_he_balance)){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('max_amount_AFIT_power');
		  //this.movingFunds = false;
		  return;
		}
		
		if (this.$refs["p-ac-key-power"].value == ''){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('all_fields_required');
		  return;
		}
		
		//store the transaction to Steem BC according to S-E protocol for transfer
		
		if (!localStorage.getItem('std_login')){
			let link = this.$steemconnect.sign('custom_json', {
			  required_auths: "[\"" + this.user.account.name + "\"]",
			  required_posting_auths: "[]",
			  id: 'ssc-mainnet1',
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"transfer\",\"contractPayload\":{\"symbol\":\"AFIT\",\"to\":\"actifit.s-e\",\"quantity\":\"" + amount_to_power + "\",\"memo\":\"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('Move_AFIT_to_Wallet')+'&status=success&confirm_trans=1');
			
			//redirect to proper action
			window.location = link;
		
		}else{
		
			/*
			let json_data = {
				contractName: 'tokens',
				contractAction: 'transfer',
				contractPayload: {
					symbol: 'AFITX',
					to: entry.user,
					quantity: '' + rewardAFITX,//needs to be string
					memo: ''
				}
			}
			console.log(json_data);
			totalAFITXSpent += parseFloat(rewardAFITX);
			totalUsersRewarded += 1;
			client.broadcast.json({
				//required_auths: [config.token_dist_account],
				required_auths: [config.account],
				required_posting_auths: [],
				id: 'ssc-mainnet1',
				json: JSON.stringify(json_data),
			}, privateKey).then(
				result => { console.log(result) },
				error => { console.error(error) }
			)
			
			*/
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = 'ssc-mainnet-hive';
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'transfer',
				contractPayload: {
					symbol: 'AFIT',
					to: targetAcct,
					quantity: '' + amount_to_power,//needs to be string
					memo: ''
				}
			}
			
			let userKey = this.$refs["p-ac-key-power"].value;
			
			//send out transaction to blockchain
			let chainLnk = await this.setProperNode();
			let tx = await chainLnk.broadcast.customJsonAsync(
					userKey, 
					[ this.user.account.name ] , 
					[], 
					transId, 
					JSON.stringify(json_data)
				).catch(err => {
					console.log(err.message);
			});
			
			//console.log(tx.block_num);
			console.log(tx);
			
			if (tx && tx.ref_block_num){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('Move_AFIT_to_Wallet')+ ' ' +this.$t('Scheduled_successfully'),
				  position: 'top center'
				})
				
				//initiate call to adjust AFIT token count
				
				let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.user.account.name+'&bchain='+this.cur_bchain);
				//connect with our service to confirm AFIT received to proper wallet
				try{
					
					fetch(url).then(
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {reject(e);this.movingFunds = false;})
					}).catch(e => reject(e))
					
				
				}catch(err){
					console.error(err);
					//this.checkingFunds = false;
				}				
			}else{
				//notify of success
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
				this.movingFunds = false;
			}
		}
	
	  },
	  async proceedMoveAFIT(direction) {
		//direction = 1: SE to HE
		//direction = 2: HE to SE
		
		//handles checking for proper confirmation of account via STEEM transfer
		//this.movingFunds = true
		//function handles the actual processing of the transfer
		this.afit_se_move_error_proceeding = false;
		this.afit_se_move_err_msg = '';
		
		
		let amount_to_move = this.$refs["afit-se-he"].value.trim();
		
		
		let confirmPopup = confirm(this.$t('confirm_transfer_afit_exchange').replace('_CUR_',amount_to_move+' AFIT').replace('_EXCH1_',(direction == 1?'SE':'HE')).replace('_EXCH2_',(direction == 1?'HE':'SE')));
		if (!confirmPopup){
			return;
		}
		
		
		//ensure we have proper values
		if (isNaN(amount_to_move) || parseFloat(amount_to_move) < 0.01){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('min_amount_AFIT');
		  //this.movingFunds = false;
		  return;
		}
		//ensure user is moving value he has
		let afit_bal = this.afit_he_balance;
		if (direction == 1){
		//if (this.cur_bchain == 'STEEM'){
			afit_bal = this.afit_se_balance;
		}
		if (parseFloat(amount_to_move) > parseFloat(afit_bal)){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('max_amount_AFIT');
		  //this.movingFunds = false;
		  return;
		}
		
		if (this.$refs["p-ac-key-afit"].value == ''){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('all_fields_required');
		  return;
		}
	  
		this.movingAFIT = true;
		//standard is moving tokens from S-E to H-E, which requires sending bcast to Steem.
		
		let targetAcct = 'afit.h-e';
		let transId = 'ssc-mainnet-hive';
		//let targetBchain = 'STEEM';
		//other option is moving tokens from H-E to S-E
		if (direction == 1){
		//if (this.cur_bchain == 'STEEM'){
			targetAcct = 'afit.s-e';
			transId = 'ssc-mainnet1';
			//targetBchain = 'HIVE';
		}
		
		let json_data = {
			contractName: 'tokens',
			contractAction: 'transfer',
			contractPayload: {
				symbol: 'AFIT',
				to: targetAcct,
				quantity: '' + amount_to_move,//needs to be string
				memo: ''
			}
		}
		
		let userKey = this.$refs["p-ac-key-afit"].value;
		
		//send out transaction to blockchain
		let chainLnk = await this.setProperNode((direction==1?'STEEM':'HIVE'));
		let tx = await chainLnk.broadcast.customJsonAsync(
				userKey, 
				[ this.user.account.name ] , 
				[], 
				transId, 
				JSON.stringify(json_data)
			).catch(err => {
				console.log(err.message);
		});
		
		//console.log(tx.block_num);
		console.log(tx);
		
		if (tx && tx.ref_block_num){
		
			//proceed with moving tokens over to recipient
			
			//let's check if user already has a funds pass set
			fetch(process.env.actiAppUrl+'proceedAfitTransition/?user='+this.user.account.name+'&txid='+tx.id+'&amount='+amount_to_move+'&bchain='+(direction==1?'STEEM':'HIVE')).then(
				res => {res.json().then(json => 
					{
						
						if (parseFloat(json.afit_amount) > 0){
							//notify of success
							this.$notify({
							  group: 'success',
							  text: this.$t('afit_transfer_complete'),
							  position: 'top center'
							});
							
							//update balances
							setTimeout(this.fetchAFITSE, 3000);
							setTimeout(this.fetchAFITHE, 3000);
						}else{
							this.$notify({
							  group: 'error',
							  text: this.$t('afit_transfer_error'),
							  position: 'top center'
							});
						}
						this.movingAFIT = false;
						
					}).catch(e => {console.log(e);
							this.$notify({
						  group: 'error',
						  text: this.$t('afit_transfer_error'),
						  position: 'top center'
						});
						this.movingAFIT = false;
						})
					}).catch(e => {console.log(e);
							this.$notify({
							  group: 'error',
							  text: this.$t('afit_transfer_error'),
							  position: 'top center'
							});
							this.movingAFIT = false;})
			
			
		}else{
			this.$notify({
			  group: 'error',
			  text: this.$t('afit_transfer_error'),
			  position: 'top center'
			})
			this.movingAFIT = false;
		}
	  },
	  async proceedMoveAFITX(direction) {
		//direction = 1: SE to HE
		//direction = 2: HE to SE
		
		//handles checking for proper confirmation of account via STEEM transfer
		//this.movingFunds = true
		//function handles the actual processing of the transfer
		this.afit_se_move_error_proceeding = false;
		this.afit_se_move_err_msg = '';
		
		let amount_to_move = this.$refs["afitx-se-he"].value.trim();
		
		let confirmPopup = confirm(this.$t('confirm_transfer_afit_exchange').replace('_CUR_',amount_to_move+' AFITX').replace('_EXCH1_',(direction == 1?'SE':'HE')).replace('_EXCH2_',(direction == 1?'HE':'SE')));
		if (!confirmPopup){
			return;
		}
		
		//ensure we have proper values
		if (isNaN(amount_to_move) || parseFloat(amount_to_move) < 0.01){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('min_amount_AFITX');
		  //this.movingFunds = false;
		  return;
		}
		//ensure user is moving value he has
		let afitx_bal = this.afitx_he_balance;
		if (direction == 1){
		//if (this.cur_bchain == 'STEEM'){
			afitx_bal = this.afitx_se_balance;
		}
		if (parseFloat(amount_to_move) > parseFloat(afitx_bal)){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('max_amount_AFITX');
		  //this.movingFunds = false;
		  return;
		}
		
		if (this.$refs["p-ac-key-afitx"].value == ''){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('all_fields_required');
		  return;
		}
	  
		this.movingAFITX = true;
		//standard is moving tokens from S-E to H-E, which requires sending bcast to Steem.
		
		let targetAcct = 'afitx.h-e';
		let transId = 'ssc-mainnet-hive';
		//let targetBchain = 'STEEM';
		//other option is moving tokens from H-E to S-E
		if (direction == 1){
		//if (this.cur_bchain == 'STEEM'){
			targetAcct = 'afitx.s-e';
			transId = 'ssc-mainnet1';
			//targetBchain = 'HIVE';
		}
		
		let json_data = {
			contractName: 'tokens',
			contractAction: 'transfer',
			contractPayload: {
				symbol: 'AFITX',
				to: targetAcct,
				quantity: '' + amount_to_move,//needs to be string
				memo: ''
			}
		}
		
		let userKey = this.$refs["p-ac-key-afitx"].value;
		
		//send out transaction to blockchain
		let chainLnk = await this.setProperNode((direction==1?'STEEM':'HIVE'));
		let tx = await chainLnk.broadcast.customJsonAsync(
				userKey, 
				[ this.user.account.name ] , 
				[], 
				transId, 
				JSON.stringify(json_data)
			).catch(err => {
				console.log(err.message);
		});
		
		//console.log(tx.block_num);
		console.log(tx);
		
		if (tx && tx.ref_block_num){
		
			//proceed with moving tokens over to recipient
			
			//let's check if user already has a funds pass set
			fetch(process.env.actiAppUrl+'proceedAfitxTransition/?user='+this.user.account.name+'&txid='+tx.id+'&amount='+amount_to_move+'&bchain='+(direction==1?'STEEM':'HIVE')).then(
				res => {res.json().then(json => 
					{
						if (parseFloat(json.afitx_amount) > 0){
							//notify of success
							this.$notify({
							  group: 'success',
							  text: this.$t('afitx_transfer_complete'),
							  position: 'top center'
							});
							//update balances
							setTimeout(this.fetchAFITXSE, 3000);
							setTimeout(this.fetchAFITXHE, 3000);
						}else{
							this.$notify({
							  group: 'error',
							  text: this.$t('afitx_transfer_error'),
							  position: 'top center'
							});
						}
						this.movingAFITX = false;
						
					}).catch(e => {console.log(e);
							this.$notify({
						  group: 'error',
						  text: this.$t('afitx_transfer_error'),
						  position: 'top center'
						});
						this.movingAFITX = false;
						})
					}).catch(e => {console.log(e);
							this.$notify({
							  group: 'error',
							  text: this.$t('afitx_transfer_error'),
							  position: 'top center'
							});
							this.movingAFITX = false;})
			
			
		}else{
			this.$notify({
			  group: 'error',
			  text: this.$t('afitx_transfer_error'),
			  position: 'top center'
			})
			this.movingAFITX = false;
		}
	  },
	  async proceedPowerUpToken() {
		//handles performing a token power up/staking
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		let tokenMaxVal = this.selTokenUp.balance;
		
		let amount_to_power = this.$refs["token-powerup-amount"].value.trim();
		//ensure we have proper values
		if (isNaN(amount_to_power) || parseFloat(amount_to_power) < 0.01){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_token_power');
		  //this.movingFunds = false;
		  return;
		}
		//ensure user is powering up value he has
		if (parseFloat(amount_to_power) > parseFloat(tokenMaxVal)){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_token_power');
		  //this.movingFunds = false;
		  return;
		}
		
		if (!localStorage.getItem('std_login')){
			//store the transaction to Steem BC according to S-E protocol for power up
			let link = this.$steemconnect.sign('custom_json', {
			  required_auths: "[\"" + this.user.account.name + "\"]",
			  required_posting_auths: "[]",
			  id: 'ssc-mainnet1',
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"stake\",\"contractPayload\":{\"symbol\":\"" + this.selTokenUp.symbol + "\",\"to\":\"" + this.user.account.name + "\",\"quantity\":\"" + amount_to_power + "\",\"memo\":\"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('Power_up_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
		}else{
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = 'ssc-mainnet-hive';
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'stake',
				contractPayload: {
					symbol: this.selTokenUp.symbol,
					to: this.user.account.name,
					quantity: '' + amount_to_power,//needs to be string
					memo: ''
				}
			}
			
			let userKey = this.$refs["p-ac-key-trans-token"].value;
			
			//send out transaction to blockchain
			let chainLnk = await this.setProperNode();
			let tx = await chainLnk.broadcast.customJsonAsync(
					userKey, 
					[ this.user.account.name ] , 
					[], 
					transId, 
					JSON.stringify(json_data)
				).catch(err => {
					console.log(err.message);
			});
			
			//console.log(tx.block_num);
			console.log(tx);
			
			if (tx && tx.ref_block_num){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('Power_up_token')+ ' ' +this.$t('completed_success'),
				  position: 'top center'
				})
				
			}else{
				//notify of success
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
				
			}
			
			this.movingFunds = false;
		}
	
	  },
	  async proceedPowerDownToken() {
		//handles performing a token power down/unstaking
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		
		
		let tokenMaxVal = this.selTokenUp.stake;
		let amount_to_powerdown = this.$refs["token-powerup-amount"].value.trim();
		//ensure we have proper values
		if (isNaN(amount_to_powerdown) || parseFloat(amount_to_powerdown) < 0.01){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_token_power');
		  return;
		}
		//ensure user is powering down amount he has staked
		if (parseFloat(amount_to_powerdown) > parseFloat(tokenMaxVal)){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_token_powerdown');
		  return;
		}
		
		
		if (!localStorage.getItem('std_login')){
			//store the transaction to Steem BC according to S-E protocol for power down
			let link = this.$steemconnect.sign('custom_json', {
			  required_auths: "[\"" + this.user.account.name + "\"]",
			  required_posting_auths: "[]",
			  id: 'ssc-mainnet1',
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"unstake\",\"contractPayload\":{\"symbol\":\"" + this.selTokenUp.symbol + "\",\"quantity\":\"" + amount_to_powerdown + "\",\"memo\":\"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('Power_down_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
		
		}else{
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = 'ssc-mainnet-hive';
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'unstake',
				contractPayload: {
					symbol: this.selTokenUp.symbol,
					quantity: '' + amount_to_powerdown,//needs to be string
					memo: ''
				}
			}
			
			let userKey = this.$refs["p-ac-key-trans-token"].value;
			
			//send out transaction to blockchain
			let chainLnk = await this.setProperNode();
			let tx = await chainLnk.broadcast.customJsonAsync(
					userKey, 
					[ this.user.account.name ] , 
					[], 
					transId, 
					JSON.stringify(json_data)
				).catch(err => {
					console.log(err.message);
			});
			
			//console.log(tx.block_num);
			console.log(tx);
			
			if (tx && tx.ref_block_num){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('Power_down_token')+ ' ' +this.$t('completed_success'),
				  position: 'top center'
				})
				
			}else{
				//notify of success
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
				
			}
			
			this.movingFunds = false;
		}
	  },
	  async proceedTransferToken() {
		//handles performing a token power down/unstaking
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		
		
		let tokenMaxVal = this.selTokenUp.balance;
		let amount_to_send = this.$refs["token-powerup-amount"].value.trim();
		let target_account = this.$refs["token-target-account"].value.trim();
		//ensure we have proper values
		//confirm target account set
		if (!target_account){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('missing_target_account');
		  return;
		}
		
		if (isNaN(amount_to_send) || parseFloat(amount_to_send) < 0.01){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_token_power');
		  return;
		}
		//ensure user is powering down amount he has staked
		if (parseFloat(amount_to_send) > parseFloat(tokenMaxVal)){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_token_power');
		  return;
		}

		
		if (!localStorage.getItem('std_login')){
			//store the transaction to Steem BC according to S-E protocol for transfer
			let link = this.$steemconnect.sign('custom_json', {
			  required_auths: "[\"" + this.user.account.name + "\"]",
			  required_posting_auths: "[]",
			  id: 'ssc-mainnet1',
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"transfer\",\"contractPayload\":{\"symbol\":\"" + this.selTokenUp.symbol + "\",\"to\":\"" + target_account + "\",\"quantity\":\"" + amount_to_send + "\",\"memo\":\"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('Transfer_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
		}else{
			if (this.$refs["p-ac-key-trans-token"].value == ''){
			  this.afit_se_power_error_proceeding = true;
			  this.afit_se_power_err_msg = this.$t('all_fields_required');
			  return;
			}
			
			
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = 'ssc-mainnet-hive';
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'transfer',
				contractPayload: {
					symbol: this.selTokenUp.symbol,
					to: target_account,
					quantity: '' + amount_to_send,//needs to be string
					memo: ''
				}
			}
			
			let userKey = this.$refs["p-ac-key-trans-token"].value;
			
			//send out transaction to blockchain
			let chainLnk = await this.setProperNode();
			let tx = await chainLnk.broadcast.customJsonAsync(
					userKey, 
					[ this.user.account.name ] , 
					[], 
					transId, 
					JSON.stringify(json_data)
				).catch(err => {
					console.log(err.message);
			});
			
			//console.log(tx.block_num);
			console.log(tx);
			
			if (tx && tx.ref_block_num){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('Transfer_token')+ ' ' +this.$t('completed_success'),
				  position: 'top center'
				})
				
				//initiate call to adjust AFIT token count
				
				/*let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.user.account.name+'&bchain='+this.cur_bchain);
				//connect with our service to confirm AFIT received to proper wallet
				try{
					
					fetch(url).then(
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {reject(e);this.movingFunds = false;})
					}).catch(e => reject(e))
					
				
				}catch(err){
					console.error(err);
					//this.checkingFunds = false;
				}		*/		
			}else{
				//notify of success
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
				
			}
			
			this.movingFunds = false;
			
		}
	  },
	  async proceedWithdrawToken() {
		//handles performing a token power down/unstaking
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		
		
		let tokenMaxVal = this.selTokenUp.balance;
		let amount_to_withdraw = this.$refs["token-powerup-amount"].value.trim();
		//ensure we have proper values
		
		if (isNaN(amount_to_withdraw) || parseFloat(amount_to_withdraw) < 0.01){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_token_power');
		  return;
		}
		//ensure user is powering down amount he has staked
		if (parseFloat(amount_to_withdraw) > parseFloat(tokenMaxVal)){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_token_power');
		  return;
		}
		
		if (!localStorage.getItem('std_login')){
		
			//store the transaction to Steem BC according to S-E protocol for withdraw
			let link = this.$steemconnect.sign('custom_json', {
			  required_auths: "[\"" + this.user.account.name + "\"]",
			  required_posting_auths: "[]",
			  id: 'ssc-mainnet1',
			  json: "{\"contractName\":\"steempegged\",\"contractAction\":\"withdraw\",\"contractPayload\":{\"quantity\":\"" + amount_to_withdraw + "\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('Withdraw_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
		}else{
			if (this.$refs["p-ac-key-trans-token"].value == ''){
			  this.afit_se_power_error_proceeding = true;
			  this.afit_se_power_err_msg = this.$t('all_fields_required');
			  return;
			}
			
			
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = 'ssc-mainnet-hive';
			let curr = 'hivepegged';
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
				curr = 'steempegged';
			}
			
			
			
			let json_data = {
				contractName: curr,
				contractAction: 'withdraw',
				contractPayload: {
					quantity: '' + amount_to_withdraw,//needs to be string
				}
			}
			
			let userKey = this.$refs["p-ac-key-trans-token"].value;
			
			//send out transaction to blockchain
			let chainLnk = await this.setProperNode();
			let tx = await chainLnk.broadcast.customJsonAsync(
					userKey, 
					[ this.user.account.name ] , 
					[], 
					transId, 
					JSON.stringify(json_data)
				).catch(err => {
					console.log(err.message);
			});
			
			//console.log(tx.block_num);
			console.log(tx);
			
			if (tx && tx.ref_block_num){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('Withdraw_token')+ ' ' +this.$t('completed_success'),
				  position: 'top center'
				})
				
				//initiate call to adjust AFIT token count
				
				/*let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.user.account.name+'&bchain='+this.cur_bchain);
				//connect with our service to confirm AFIT received to proper wallet
				try{
					
					fetch(url).then(
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {reject(e);this.movingFunds = false;})
					}).catch(e => reject(e))
					
				
				}catch(err){
					console.error(err);
					//this.checkingFunds = false;
				}		*/		
			}else{
				//notify of success
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
				
			}
			
			this.movingFunds = false;
		}
	  },
	  async proceedVerifyPass() {
		//handles checking for proper confirmation of account via STEEM transfer
		this.checkingFunds = true
		//function handles the actual processing of the transfer
		this.pass_error_proceeding = false;
		this.pass_error_msg = '';
		//ensure we have proper values
		if (isNaN(this.$refs["pass-transfer-amount"].value.trim()) || this.$refs["pass-transfer-amount"].value < 1){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('min_amount_1_STEEM_SBD');
		  this.checkingFunds = false;
		  return;
		}
		
		if (!localStorage.getItem('std_login')){
			//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
			var link = this.$steemconnect.sign('transfer', {
			  from: this.user.account.name,
			  to: this.target_exchange_account,
			  amount: this.$refs["pass-transfer-amount"].value + ' ' + this.transferTypePass,
			  memo: '',//no memo needed
			  auto_return: true,
			});
		
			//launch the SC window
			window.open(link);
			
			//also start verification process
			let url = new URL(process.env.actiAppUrl + 'confirmPaymentPasswordVerify/'+'?bchain=' + this.cur_bchain);
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
			}
			this.checkingFunds = false;
			
		}else{
			
			if (this.$refs["p-ac-key-funds-ver"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
		
			
			let confirmPopup = confirm(this.$t('Confirm_verf_transfer').replace('_AMOUNT_',this.$refs["pass-transfer-amount"].value).replace('_CURR_',this.transferTypePass));
			if (!confirmPopup){
				return;
			}
		
			let chainLnk = await this.setProperNode ();
			console.log('perform transfer');
			console.log(this.$refs["p-ac-key-funds-ver"].value);
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferAsync(this.$refs["p-ac-key-funds-ver"].value, this.user.account.name, this.target_exchange_account, parseFloat(this.$refs["pass-transfer-amount"].value).toFixed(3) + ' ' + this.transferTypePass, '').then(
				res => this.confirmCompletion('transfer-verify', this.$refs["pass-transfer-amount"].value, res)).catch(err=>console.log(err));
				
			/*steem.broadcast.claimRewardBalanceAsync(this.user.account.name,this.claimSTEEM, this.claimSBD, this.claimSP).then(
				res => ).catch(err=>console.log(err));*/
		}
		
		
	  },
	  async proceedBuyAFIT () {
		//function handles the actual processing of the buy event
		this.checkingBought = true;
		this.afit_buy_error_proceeding = false;
		this.afit_buy_err_msg = '';
		this.transConfirmed = false;
		
		let afit_amount_to_buy = this.$refs["afit-amount-buy"].value.trim();
		//ensure we have proper values
		if (isNaN(afit_amount_to_buy) || parseFloat(afit_amount_to_buy) < 1){
		  this.afit_buy_error_proceeding = true;
		  this.afit_buy_err_msg = this.$t('min_amount_AFIT_buy');
		  this.checkingBought = false;
		  return;
		}
		
		var link = this.$steemconnect.sign('transfer', {
		  from: this.user.account.name,
		  to: this.target_buy_account,
		  amount: this.getMatchingSTEEM() + ' ' + 'STEEM',
		  memo: '',//no memo needed
		  auto_return: true,
		});
		
		//launch the SC window
		window.open(link);
		
		//also start verification process
		let url = new URL(process.env.actiAppUrl + 'confirmBuyAction');
		//compile all needed data and send it along the request for processing
		let params = {
			from: this.user.account.name,
			afit_amount: afit_amount_to_buy,
			steem_amount: this.getMatchingSTEEM(),
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			
			if (outcome.paymentReceivedTx != ''){
				//notify user
				this.transConfirmed = true;
			}
			//update user data according to result
			this.fetchUserData();
		}catch(err){
			console.error(err);
		}
		
		this.checkingBought = false;
	  },
	  async exchangeTokensUpvote () {
		//function handles actual exchange of AFIT tokens to STEEM upvote via recording this
		this.performingSwap = true
		this.error_swap = '';
		this.swapResult = '';
		this.buyMore = false;
		//ensure we have proper values
		if (this.$refs["funds-pass-entry"].value == ''){
		  this.error_proceeding = true;
		  this.error_swap = this.$t('provide_funds_pass');
		  this.performingSwap = false;
		  return;
		}
		if (this.userTokens <  this.min_tokens_required){
		  this.error_swap = this.$t('need_at_least') + this.numberFormat(this.min_tokens_required, 2) + this.$t('afit_tokens_to_exchange');
		  this.performingSwap = false;
		  this.buyMore = true;
		  return;
		}
		
		//proceed with storing the swap and decreasing user AFIT tokens count
		let url = new URL(process.env.actiAppUrl + 'performAfitSteemExchange');
		//compile all needed data and send it along the request for processing
		let params = {
			user: this.user.account.name,
			pass: this.$refs['funds-pass-entry'].value,
			tokens: this.afit_val_exchange,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.status == 'Success'){
				//map exchange amount to exchange category
				let exchange_cat = 1;
				switch(this.afit_val_exchange){
					case '50': exchange_cat = 1; break;
					case '100': exchange_cat = 2; break;
					case '150': exchange_cat = 3; break;
					case '200': exchange_cat = 4; break;
					default: exchange_cat = -1;
				}
				
				//store the transaction to Steem BC
				let cstm_params = {
					required_auths: [],
					required_posting_auths: [this.user.account.name],
					id: 'actifit',
					json: "{ \"afit_upvote_exchange_type\": \""+exchange_cat+"\"}"
				  };
		  
				
				let res = await this.processTrxFunc('custom_json', cstm_params);
		
				console.log('trx status:'+res.success);
				/*if (res.success){
					
				}*/
				
				this.swapResult = this.$t('afit_steem_swap_success');
				//update user data
				this.fetchUserData();
			}else{
				this.error_swap = outcome.error;
			}
		}catch(err){
			console.error(err);
		}
		this.performingSwap = false;
	  },
	  getMatchingSTEEM () {
		return parseFloat(this.afitBuyAmount * this.afitPrice / this.steemPrice).toFixed(3);
	  },
	  setSteemPrice (_steemPrice){
		
		this.steemPrice = parseFloat(_steemPrice).toFixed(3);
	  },
	  setSBDPrice (_sbdPrice){
		this.sbdPrice = parseFloat(_sbdPrice).toFixed(3);
	  },
	  setHivePrice (_hivePrice){
		this.hivePrice = parseFloat(_hivePrice).toFixed(3);
	  },
	  setHBDPrice (_hbdPrice){
		this.hbdPrice = parseFloat(_hbdPrice).toFixed(3);
	  }
	},
	created () {
	  this.runningInterval = setInterval(this.fetchUserData, 60*1000);
	},
	destroyed () {
	  clearInterval(this.runningInterval);
	},
    async mounted () {
	  //check which chain is active
	  if (localStorage.getItem('cur_bchain')){
		this.cur_bchain = localStorage.getItem('cur_bchain')
	  }
	  steem.api.setOptions({ url: process.env.steemApiNode });
	  
		  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  
	  hive.api.setOptions({ url: process.env.hiveApiNode });
	  let chainLnk = await this.setProperNode();
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  let ref_id = this;
	  
	  //let's load the properties to properly convert SP to Vests and vice-versa
	  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
	  
	  //grab AFIT price
	  fetch(process.env.actiAppUrl+'curAFITPrice').then(
		res => {res.json().then(json => this.setAFITPrice (json.unit_price_usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  this.screenWidth = screen.width;
	  //check if this is the result of an operation
	  if (this.$route.query.op && this.$route.query.status){
		// notify the user that operation was successful
		this.$notify({
		  group: 'success',
		  text: this.$t('Your') + ' "' + this.$route.query.op + '" ' + this.$t('completed_success'),
		  position: 'top center'
		})
		//reset success state
		if (history && history.pushState) {
			let historyState = {};
			//Only do this if history.pushState is supported by the browser
			history.pushState('wallet', document.title, window.location.href.split('?')[0]);
		}
	  }
	  
	  //check if we need to open the buy token screen
	  if (this.$route.query.action === 'buy_afit'){
		this.afitActivityMode = this.BUY_AFIT_STEEM;
	  }else if (this.$route.query.action === 'set_funds_pass'){
	    this.afitActivityMode = this.EXCHANGE_AFIT_STEEM;
	  }else if (this.$route.query.action === 'delegate'){
		this.afitActivityMode = 0;
		this.fundActivityMode = this.DELEGATE_FUNDS;
	  }else if (this.$route.query.action === 'power_up'){
		this.afitActivityMode = 0;
		this.fundActivityMode = this.POWERUP_FUNDS;
	  }
	  
	  //grab STEEM price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab HIVE price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd').then(
		res => {res.json().then(json => this.setHivePrice (json.hive.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab SBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollars&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollars'].usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  this.loading = false;
	  
	  //grab HBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd').then(
		res => {res.json().then(json => this.setHBDPrice (json['hive_dollar'].usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  this.loading = false;
    }
  }
</script>

<style lang="sass">
  .history
    max-width: 500px
</style>
<style>
  .afit-ex-option{
	border-style: solid;
	display: inline-block;
  }
  .afit-ex-option label{
	height: 60px;
	width: 100px;
  }
  #ttip-area{
	display: table;
    margin: 0 auto;
  }
  .row-sep{
    border: 2px solid red;
	border-radius: 5px;
  }
  .row-sep-in{
    border: 2px solid red;
  }
  .row-sep-in h4, .row-sep-in .token-title{
	border-bottom: 1px dashed red;
	height: 40px;
  }
  .token-logo{
	width: 40px;
	height: 40px;
  }
  .text-center.grid.p-2, .calc-data{
	border: 2px solid red;
	border-radius: 5px;
  }
  .small-pad-row{
	padding-left: 5px;
	padding-right: 5px;
  }
  .fas{
	cursor: pointer;
  }
</style>
