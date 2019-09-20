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

    <div class="container pt-5 mt-5 pb-5" v-if="user">

      <!-- account balance -->
      <div class="text-center">
        <h3 class="mb-4">{{ $t('Hey') }} {{ user.account.name }}!</h3>
		<h5>{{ $t('account_est_val') }}<i class="fas fa-info-circle" v-on:click="showDetailedCalc=!showDetailedCalc"></i></h5>
		<h5 v-if="this.tokenMetrics.length > 0">
			<div class="pb-2">{{ $t('in_usd') }}: ${{ totalAccountValue}}</div>
			<div class="pb-2">{{ $t('in_steem') }}: <img src="/img/STEEM.png" class="token-logo-sm">{{ formattedSteemTotVal }}</div>
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
				<h5 class="mb-4 font-weight-bold">{{ formattedUserTokens }}</h5>
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
				<h5 class="mb-4 font-weight-bold">{{ formattedUserAFITX }}</h5>
			</div>
		</div>
		<div class="p-2 font-weight-bold">
			<!--<button v-on:click="buyAFITwithSTEEM" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('BUY_AFIT_WITH_STEEM') }}</button>-->
			<a href="https://steem-engine.com/?p=market&t=AFIT" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('buy_afit_se') }}</a>
			<button v-on:click="exchangeAFITforSTEEM" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('EXCHANGE_AFIT_FOR_STEEM') }}</button>
			<button v-on:click="moveAFITSEtoAFITPOWER" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('MOVE_AFIT_SE_AFIT_POWER') }}</button>
			<button v-on:click="initiateAFITtoSE" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border">{{ $t('INITIATE_AFIT_TO_SE') }}</button>
			  <transition name="fade">
			  <div v-if="afitActivityMode == MOVE_AFIT_SE">
				  <div class="text-center grid p-2">
					<div class="text-brand font-weight-bold">{{ $t('wallet.afit_se_to_power') }}</div>
					<div class="row" >
					  <div class="w-25 p-2 text-right">{{ $t('Amount_To_Move') }}</div>
					  <input type="number" id="afit-se-move-power" name="afit-se-move-power" ref="afit-se-move-power" class="form-control-lg w-50 p-2">
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
					<h5 class="text-brand font-weight-bold">{{ $t('wallet.initiate_afit_to_se') }}</h5>
					<div v-if="userPDAfit.user">
						<span class="end-string">{{ afitPowerDownText }}</span><Countdown v-if="countDownReady" :deadline="nextAfitPDTarget"></Countdown>
					</div>
					<div>{{ $t('move_afit_se_notice') }}</div>
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
					    <option value="STEEM">{{ $t('STEEM') }}</option>
					    <option value="SBD">{{ $t('SBD') }}</option>
					  </select>
					</div>
					<div class="row">
					  <label for="pass-transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="pass-transfer-amount" name="pass-transfer-amount" ref="pass-transfer-amount" class="form-control-lg w-50 p-2"  v-model="transfer_amount">
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
				  <div class="p-3">
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
						<input type="radio" id="afit_exchange_5" value="5" v-model="afit_val_exchange">
						<label for="afit_exchange_5">5 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_10" value="10" v-model="afit_val_exchange">
						<label for="afit_exchange_10">10 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					  <br>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_15" value="15" v-model="afit_val_exchange">
						<label for="afit_exchange_15">15 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					  <span class="afit-ex-option border border-danger p-2 m-2 btn-brand">
						<input type="radio" id="afit_exchange_20" value="20" v-model="afit_val_exchange">
						<label for="afit_exchange_20">20 {{ $t('AFIT_Token') }} {{ $t('Tokens') }}</label>
					  </span>
					<br>
					<span><i>{{ $t('You_are_exchanging') }} {{ afit_val_exchange }} {{ $t('AFIT_Token') }} {{ $t('Tokens') }} {{ $t('for_approx') }} ${{ (afit_val_exchange * 0.036 / 0.65).toFixed(2) }} {{ $t('in_steem_upvote') }}
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
							<a href="https://steem-engine.com/?p=market&t=AFIT" class="btn btn-brand border p-2">{{ $t('buy_afit_se') }}</a>
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
			<div class="col-md-6 row-sep-in">
				<h5 class="token-title"><img src="/img/STEEM.png" class="mr-2 token-logo">{{ $t('Your_Steem_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2">{{ this.renderSteemPower(2) }} {{ $t('STEEM_POWER_CAPS') }} | {{ this.renderSteemBalance() }} | {{ this.renderSBDBalance() }}</div>
					<div class="row">
						<div class="p-2 col-md-6" id="ttip-area">
							<small><i>{{ $t('STEEM_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_SP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_SP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_SP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
						</div>
					</div>
				</div>
			</div>
			<div v-if="tokensOfInterestBal.length > 0" class="col-md-6 row-sep-in">
				<h5 class="token-title">{{ $t('Your_Token_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2" v-for="(token, index) in tokensOfInterestBal" :key="index" :token="token">
						{{ renderBal(token) }} {{ token.symbol }} <span v-if="parseFloat(renderStake(token)) > 0">+ {{ renderStake(token)}} {{ token.symbol }} {{ $t('Staked') }} </span>
						<span v-if="parseFloat(delegStake(token)) > 0">( + {{ delegStake(token)}} {{ token.symbol }} {{ $t('Delegated') }}) </span>
						<span v-if="token.stakable"><i class="fas fa-arrow-circle-up text-brand p-1" :title="$t('stake_tokens')" v-on:click="initiateStaking(token)"></i></span>
						<span v-if="token.stakable"><i class="fas fa-arrow-circle-down text-brand p-1" :title="$t('unstake_tokens')" v-on:click="initiateUnStaking(token)"></i></span>
						<span v-if="token.symbol == 'STEEMP'"><i class="fas fa-upload text-brand p-1" :title="$t('withdraw_tokens')" v-on:click="initiateWithdraw(token)"></i></span>
						<span><i class="fas fa-share-square text-brand p-1" :title="$t('transfer_tokens')" v-on:click="initiateTransfer(token)"></i></span>
					</div>
					<div class="row" v-if="tokenActions">
					  <label for="token-powerup-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="token-powerup-amount" name="token-powerup-amount" ref="token-powerup-amount" class="form-control-lg w-50 p-2"><span class="p-2">{{ selTokenUp.symbol }}</span>
					</div>
					<div class="row" v-if="tokenActions && curTokenAction == TRANSFER_FUNDS">
					  <label for="token-target-account" class="w-25 p-2">{{ $t('Account') }} *</label>
					  <span class="p-1">@</span><input type="text" id="token-target-account" name="token-target-account" ref="token-target-account" class="form-control-lg p-2">
					</div>
					<div class="row" v-if="tokenActions">
					  <div class="w-25"></div>
					  <button v-if="curTokenAction == POWERUP_FUNDS" v-on:click="proceedPowerUpToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Up') }}</button>
					  <button v-else-if="curTokenAction == POWERDOWN_FUNDS" v-on:click="proceedPowerDownToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Down') }}</button>
					  <button v-else-if="curTokenAction == TRANSFER_FUNDS" v-on:click="proceedTransferToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Send') }}</button>
					  <button v-else-if="curTokenAction == WITHDRAW_FUNDS" v-on:click="proceedWithdrawToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Withdraw') }}</button>
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
				<button v-on:click="powerUpFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{  $t('POWERUP_ACTION_TEXT') }}</button>
				<button v-on:click="powerDownFunds" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('POWERDOWN_ACTION_TEXT') }}</button>
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
				  <option value="STEEM">STEEM</option>
				  <option value="SBD">SBD</option>
				</select>
				</div>
				<div class="row">
				  <label for="transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
				  <input type="number" id="transfer-amount" name="transfer-amount" ref="transfer-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row">
				  <label for="transfer-memo" class="w-25 p-2">{{ $t('Memo') }}</label>
				  <input type="text" id="transfer-memo" name="transfer-memo" ref="transfer-memo" class="form-control-lg w-50 p-2">				
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
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_up_notice')">
				  </div>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row">
				  <div class="w-25"></div>
				  <button v-on:click="proceedPowerUp" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Up') }}</button>
				</div>
			  </div>
			</transition>
			<transition name="fade">
			  <div v-if="fundActivityMode == 3" class="text-center grid p-2 col-md-12">
				<div class="row">
				  <label for="powerdown-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
				  <input type="number" id="powerdown-amount" name="powerdown-amount" ref="powerdown-amount" class="form-control-lg w-50 p-2">
				</div>
				<div class="row" v-if="isPoweringDown">
				  <div class="text-center small p-2 w-25"></div>
				  <div class="text-center text-brand small p-2 w-50"><b>{{ $t('currently_powering_down') }} {{this.renderSteemPower(5)}} STEEM<br/>
					{{ $t('next_withdraw_on') }} {{this.powerDownWithdrawDate}}</b>
				  </div>
				</div>
				<div class="row">
				  <div class="text-center small p-2 w-25"></div>
				  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('power_down_notice')">
				  </div>
				</div>
				<div class="text-brand text-center" v-if="error_proceeding">
				  {{ this.error_msg}}
				</div>
				<div class="row" v-if="isPoweringDown">
				  <div class="text-center small p-2 w-25"></div>
				  <button v-on:click="proceedPowerDown" class="btn btn-brand btn-lg w-25 border">{{ $t('Power_Down') }}</button>
				  <button v-on:click="cancelPowerDown" class="btn btn-brand btn-lg w-25 border">{{ $t('Cancel_Power_Down') }}</button>
				</div>
				<div class="row" v-else>
				  <div class="text-center small p-2 w-25"></div>
				  <button v-on:click="proceedPowerDown" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Down') }}</button>
				</div>
			  </div>
			</transition>
		</div>
		<div class="row row-sep">
			<div v-if="isClaimableDataAvailable" class="col-md-6 row-sep-in">
				<h5 class="token-title"><img src="/img/STEEM.png" class="mr-2 token-logo">{{ $t('Claimable_Steem_Rewards') }}</h5>
				<div class="mb-4 font-weight-bold">
					<span class="p-2">{{ this.claimSP }} | {{ this.claimSTEEM }} | {{ this.claimSBD }}</span>
					<div class="p-2"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Rewards') }}</button></div>
				</div>
			</div>
			<div v-if="claimableSETokens.length > 0" class="col-md-6 row-sep-in">
				<h5 class="token-title">{{ $t('Claimable_Token_Rewards') }}</h5>
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
			<a :href="$steemconnect.getLoginURL()" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
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
  import UserMenu from '~/components/UserMenu'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'
  import steem from 'steem'
  import ExchangeQueue from '~/components/ExchangeQueueModal'
  import ExchangeHistory from '~/components/ExchangeHistoryModal'
  import SSC from 'sscjs'
  
  import Countdown from 'vuejs-countdown'
  
  import TopHolders from '~/components/TopHoldersModal'
  import TopHoldersX from '~/components/TopHoldersXModal'
  
  const ssc = new SSC(process.env.steemEngineRpc);
  const scot_steemengine_api = process.env.steemEngineScot;

  const tokensNonStakable = ['AFITX', 'AFIT', 'STEEMP'];
  const tokensOfInterest = ['ZZAN', 'SPORTS', 'PAL'].concat(tokensNonStakable);
  
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
		EXCHANGE_AFIT_STEEM: 1,
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
		afit_val_exchange: '5',
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
		userAddedTokens: 0,
		steemPrice: 0.1,
		sbdPrice: 0.1,
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
	  }
	},
    components: {
      NavbarBrand,
      UserMenu,
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
      ...mapGetters(['userTokens', 'transactions', 'userRank']),
      formattedSteemTotVal () {
		return this.numberFormat(this.totalAccountValueSteem, 3) + ' ' + this.$t('STEEM');
	  },
	  formattedUserTokens () {
		return this.numberFormat((parseFloat(this.userTokens) + parseFloat(this.userAddedTokens)).toFixed(3), 3) + " AFIT" + " | " + this.numberFormat(parseFloat(this.afit_se_balance), 3) + " AFIT S-E";
      },
	  formattedUserAFITX () {
		return this.numberFormat(this.afitx_se_balance,3) + ' AFITX';
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
		return "";
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
			
			//get AFIT standard val
			let afitCoreVal = this.userTokens * this.afitPrice / this.steemPrice;
			//console.log(afitCoreVal);
			this.totalAccountValue += afitCoreVal;
			this.detailCalculation += this.userTokens + ' AFIT x '+ this.numberFormat((this.afitPrice / this.steemPrice), 4) + ' AFIT/STEEM = ' + this.numberFormat(afitCoreVal, 4) + ' STEEM<br/>';
			
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
				par.detailCalculation += '(' + token.balance + ' + ' + token.stake + ') ' + token.symbol + ' x '+ tokenData.lastPrice + ' ' + token.symbol + '/STEEM = ' + par.numberFormat(tokenVal, 4) + ' STEEM<br/>';
				//console.log('value for '+token.symbol+ ' $ ' + tokenVal);
			});
			
			//grab claimable tokens of interest vals as well
			this.claimableSETokens.forEach(function(token, index){
				let tokenData = par.tokenMetrics.find(v => v.symbol == token.symbol);
				//console.log(token);
				//console.log(tokenData);
				let prec = par.tokenOfInterestPrecision[token.symbol];
				//console.log(prec);
				let tokenVal = parseFloat(par.numberFormat(token.amount, prec)) * parseFloat(tokenData.lastPrice);
				par.totalAccountValue += tokenVal
				par.detailCalculation += par.numberFormat(token.amount, prec) + ' ' + token.symbol + ' x '+ tokenData.lastPrice + ' ' + token.symbol + '/STEEM = ' + par.numberFormat(tokenVal, 4) + ' STEEM<br/>';
				//console.log('claimable value for '+token.symbol+ ' $ ' + tokenVal);
			});
			

			//append STEEM + SP amount
			let totSteem = parseFloat(this.user.account.balance) + parseFloat(this.steemPower);
			this.totalAccountValue += totSteem;
			
			this.detailCalculation += '(' + parseFloat(this.user.account.balance) + ' + ' + this.steemPower + ') STEEM x 1 = ' + this.numberFormat(totSteem, 4) + ' STEEM<br/>';
			
			//append SBD amount after conversion to STEEM
			let sbd_val = (parseFloat(this.user.account.sbd_balance) * this.sbdPrice / this.steemPrice);;
			this.totalAccountValue += sbd_val;
			this.detailCalculation += parseFloat(this.user.account.sbd_balance) + ' SBD x '+ this.numberFormat((this.sbdPrice / this.steemPrice), 4) + ' SBD/STEEM = ' + this.numberFormat(sbd_val, 4) + ' STEEM<br/>';
						

			//append claimable STEEM + SP
			let totClaimSteem = parseFloat(this.claimSP) + parseFloat(this.claimSTEEM); 
			this.totalAccountValue += totClaimSteem;
			
			this.detailCalculation += '(' + parseFloat(this.claimSTEEM) + ' + ' + parseFloat(this.claimSP) + ') STEEM x 1 = ' + this.numberFormat(totClaimSteem, 4) + ' STEEM<br/>';
			
			//console.log(parseFloat(this.claimSBD) * this.sbdPrice / this.steemPrice);
			let claim_sbd = (parseFloat(this.claimSBD) * this.sbdPrice / this.steemPrice);
			this.totalAccountValue += claim_sbd;
			this.detailCalculation += parseFloat(this.claimSBD) + ' SBD x '+ this.numberFormat((this.sbdPrice / this.steemPrice), 4) + ' SBD/STEEM = ' + this.numberFormat(claim_sbd, 4) + ' STEEM<br/>';
			
			this.detailCalculation += '-----<br/>';
			
			this.totalAccountValueSteem = this.totalAccountValue;
			
			//convert amount to STEEM price
			//console.log(this.totalAccountValue);
			this.totalAccountValue *= this.steemPrice;
			
			this.detailCalculation += this.numberFormat(this.totalAccountValueSteem, 4) + ' STEEM x '+ this.steemPrice + ' STEEM/USD = $ ' + this.numberFormat(this.totalAccountValue, 4) + ' USD<br/>';
			
			//console.log(this.steemPrice);
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
	  renderSteemBalance () {
		return this.numberFormat(parseFloat(this.user.account.balance), 3) + ' ' + this.$t('STEEM');
	  },
	  renderSBDBalance () {
		return this.numberFormat(parseFloat(this.user.account.sbd_balance), 3) + ' ' + this.$t('SBD');
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
		  
		  //update user info from blockchain
		  let user_data = await this.$steemconnect.me();
		  this.user.account = user_data.account;
		  
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
		  fetch(scot_steemengine_api+'@'+this.user.account.name).then(
			res => {res.json().then(json => this.setUserClaimableSETokens (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  
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
		  
		  let bal = await ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFIT' });
		  
		  
		  if (bal){
			  this.afit_se_balance = bal.balance;
			  
			  //if this operation relates to powering up AFIT from S-E, need to also initiate call to adjust AFIT token count
			  if (this.$route.query.confirm_trans == 1){
				
				let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.$store.state.steemconnect.user.name);
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
		  
		  //fetch user's AFITX S-E balance
		  /*console.log('fetch AFITX SE balance');
		  bal = await ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' });
		  console.log('>>result of AFITX SE balance');
		  console.log(bal);
		  if (bal){
			  this.afitx_se_balance = bal.balance;
		  }*/
		  let parnt = this
		  ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' }).then(
				function(bal) {
					
					
					if (bal){
						  parnt.afitx_se_balance = bal.balance;
					  }
				}
			)
		  
		  //fetch user's AFITX Rank
		   fetch(process.env.actiAppUrl+'afitxData/'+this.user.account.name).then(
			res => {res.json().then(json => this.userAFITXRank = json.ind ).catch(e => reject(e))
		  }).catch(e => reject(e))
		  
		  
		  //fetch user's tokensOfInterest S-E balance
		  let tokenData = await ssc.find('tokens', 'balances', { account: this.user.account.name, symbol : { '$in' : tokensOfInterest } });
		  
		  
		  if (tokenData){
			this.tokensOfInterestBal = tokenData.sort(function tokenEntry(a, b) {
				return b.symbol < a.symbol ?  1
						: b.symbol > a.symbol ? -1
						: 0;
			});
		  }
		  
		  //fetch tokens' data (price et al)
		  this.tokenMetrics = await ssc.find('market', 'metrics', {symbol : { '$in' : tokensOfInterest.concat(['AFIT','AFITX']) }}, 1000, 0, '', false);	  
		  
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
	  setAFITPrice (_afitPrice){
		this.afitPrice = parseFloat(_afitPrice).toFixed(3);
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
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
		}
		let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
	    vests = Number(vests.split(' ')[0]);
	    return (totalSteem * (vests / totalVests));
	  },
	  async steemPowerToVests (steemPower) {
	    //function handles conversting SP to Vests
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
		}
		let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
		
		return parseFloat(steemPower * totalVests / totalSteem).toFixed(6);
	  },
	  claimableSTEEMRewards () {
		//function handles preparing claimable STEEM rewards
		if (typeof this.user != 'undefined' && this.user != null){
		  this.claimSTEEM = this.user.account.reward_steem_balance;
		  this.claimSP = this.user.account.reward_vesting_steem + " POWER";
		  this.claimVests = this.user.account.reward_vesting_balance;
		  this.claimSBD = this.user.account.reward_sbd_balance;
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
  
		let res = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err) => {
		  if (err) {
			console.log(err);
		  }else{
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
		});
		this.claimingTokens = false;
	  },
	  async fetchTokenBalance () {
		//let's grab the precision for our tokens of interest for proper value display
		  fetch(scot_steemengine_api+'info').then(
			res => {res.json().then(json => this.setSETokensPrecision (json) ).catch(e => reject(e))
		  }).catch(e => reject(e))
	  },
	  async claimRewards () {
		//function handles claiming STEEM rewards
		
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
	  proceedTransfer () {
		//function handles the actual processing of the transfer
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
	  },
	  transferTypeChange (e) {
	    //handles the drop down select option to ensure we have proper value
		if(e.target.options.selectedIndex > -1) {
		  this.transferType = e.target.options[e.target.options.selectedIndex].value;
		}
	  },
	  proceedPowerUp () {
		//function handles the actual processing of the power up
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
		
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		var link = this.$steemconnect.sign('transfer-to-vesting', {
		  from: this.user.account.name,
		  to: this.$refs["powerup-recipient"].value,
		  amount: parseFloat(this.$refs["powerup-amount"].value).toFixed(3) + ' ' + 'STEEM',
		  auto_return: true,
		}, window.location.origin + '/wallet?op=power up&status=success');
		//launch the SC window
		window.open(link);
	  },
	  async proceedPowerDown () {
		//function handles the actual processing of the power down
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["powerdown-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		if (isNaN(this.$refs["powerdown-amount"].value.trim())){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}
		let vestsValue = await this.steemPowerToVests(this.$refs["powerdown-amount"].value);
		//https://steemconnect.com/sign/transfer?from=mcfarhat&to=mcfarhat&amount=20.000%20STEEM&memo=test
		var link = this.$steemconnect.sign('withdraw-vesting', {
		  account: this.user.account.name,
		  vesting_shares: vestsValue + ' ' + 'VESTS',
		  auto_return: true,
		}, window.location.origin + '/wallet?op=power down&status=success');
		//launch the SC window
		window.open(link);
	  },
	  cancelPowerDown () {
		//function handles cancelling the power down
		var link = this.$steemconnect.sign('withdraw-vesting', {
		  account: this.user.account.name,
		  vesting_shares: '0.000000 VESTS',
		  auto_return: true,
		}, window.location.origin + '/wallet?op=cancel power down&status=success');
		//launch the SC window
		window.open(link);
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
			let res = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err) => {
			  if (err) {
				console.log(err);
			  }else{
				console.log('success');
			  }
			});
			
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('afit_power_down_canceled'),
			  position: 'top center'
			})
			
			//unset the value of existing transfer
			this.userPDAfit = false
			
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
			if (bal){
			  this.afitx_se_balance = parseFloat(bal.balance);
			  //console.log('AFITX balance: '+this.afitx_se_balance);
			  
			  //make sure user has at least 0.1 AFITX to move tokens
			  if (this.afitx_se_balance < 0.1){
				this.afit_se_move_error_proceeding = true;
				this.afit_se_move_err_msg = this.$t('no_proper_afitx_funds');
				this.initiateInProgress = false;
				return;
			  }
			  //console.log(amount_to_powerdown);
			  //console.log(this.afitx_se_balance);
			  //calculate amount that can be transferred daily
			  if (amount_to_powerdown / 100 > this.afitx_se_balance){
				this.afit_se_move_error_proceeding = true;
				this.afit_se_move_err_msg = this.$t('cannot_move_amount_afitx_needed');
				this.initiateInProgress = false;
				return;
			  }
			}else{
				this.afit_se_move_error_proceeding = true;
				this.afit_se_move_err_msg = this.$t('no_proper_afitx_funds');
				this.initiateInProgress = false;
				return;
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
			let res = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err) => {
			  if (err) {
				console.log(err);
			  }else{
				console.log('success');
			  }
			});
			
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('power_down_successfully_initiated'),
			  position: 'top center'
			})
			
			this.setUserPDAfitStatus(outcome.trx);
			
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
		if (parseFloat(amount_to_power) > parseFloat(this.afit_se_balance)){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('max_amount_AFIT_power');
		  //this.movingFunds = false;
		  return;
		}
		
		//store the transaction to Steem BC according to S-E protocol for transfer
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
	
	  },
	  proceedPowerDownToken() {
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
	  },
	  proceedTransferToken() {
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
	  },
	  proceedWithdrawToken() {
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
		let url = new URL(process.env.actiAppUrl + 'confirmPaymentPasswordVerify');
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
					case '5': exchange_cat = 1; break;
					case '10': exchange_cat = 2; break;
					case '15': exchange_cat = 3; break;
					case '20': exchange_cat = 4; break;
					default: exchange_cat = -1;
				}
				
				//store the transaction to Steem BC
				let cstm_params = {
					required_auths: [],
					required_posting_auths: [this.user.account.name],
					id: 'actifit',
					json: "{ \"afit_upvote_exchange_type\": \""+exchange_cat+"\"}"
				  };
		  
				let res = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err) => {
				  if (err) {
					console.log(err);
				  }
				});
				
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
	  }
	},
	created () {
	  this.runningInterval = setInterval(this.fetchUserData, 60*1000);
	},
	destroyed () {
	  clearInterval(this.runningInterval);
	},
    async mounted () {
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  let ref_id = this;
	  
	  //let's load the properties to properly convert SP to Vests and vice-versa
	  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
	  
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
	  }
	  
	  //grab STEEM price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab SBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollars&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollars'].usd)).catch(e => reject(e))
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
  .token-logo-sm{
	width: 20px;
	height: 20px;
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
