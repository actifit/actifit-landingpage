<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5" v-if="user || displayUser">

      <!-- account balance -->
      <div class="text-center">
		<h3 class="mb-4" v-if="displayUser"><div class="user-wallet-avatar group-class" :style="'background-image: url('+profImgUrl+'/u/' + displayUser + '/avatar)'"></div><span>{{ displayUser }}'s {{ $t('wallet.wallet')}}</span></h3>
        <h3 class="mb-4" v-else-if="user"><div class="user-wallet-avatar group-class" :style="'background-image: url('+profImgUrl+'/u/' + user.account.name + '/avatar)'"></div>{{ $t('Hey') }} {{ user.account.name }}!</h3>
		<!--<div>
			<a href="/walletV1"><i>New Wallet Layout. Click to switch back to old version</i></a>
		</div>-->
		
		<div class="row top-action-container text-right">
			<div class="col-6 text-left">
				
				<span class="btn btn-brand mb-1" :title="show_only_tokens_interest?$t('show_all_tokens'):$t('show_core_tokens')" v-on:click="switchTokenDisplay">
					<i class="fas fa-solid fa-filter" :style="show_only_tokens_interest?'color:green':'color:white'"></i>
				</span>
				
				<span class="btn btn-brand mb-1" :title="hide_small_balances?$t('show_all_tokens'):$t('hide_small_balances')" v-on:click="switchHideSmall">
					<i class="fas fa-solid fa-battery-empty" :style="hide_small_balances?'color:green':'color:white'"></i>
				</span>
				
				<span class="btn btn-brand mb-1" :title="$t('save_filter_default_settings')" v-if="!nonAuthUser" v-on:click="saveSettings"><i class="fa-gear fas" :style="settings_set?'color:green':'color:white'"></i><i class="fas fa-spin fa-spinner text-white" v-if="save_progress"></i></span>
				
				<span class="pl-2">{{$t('account_est_val')}} ${{this.totalAccountValue}}</span>
			</div>
			<div class="col-6 text-right">
			
				<span class="btn btn-brand mb-1" :title="$t('Check_Claimable_Rewards')" v-on:click="showClaimableRewards()">
					<i class="fas fa-solid fa-wallet" ></i>
				</span>
				
				
			
				<span class="btn btn-brand mb-1" :title="$t('Check_Pending_Rewards')">
					<a href="#" id="pendingRewardsKicker" name="pendingRewardsKicker" ref="pendingRewardsKicker" class="" data-toggle="modal" data-target="#pendingRewardsModal"><i class="far fa-solid fa-hourglass"></i></a>
				</span>
				
				<span class="btn btn-brand mb-1" :title="$t('FETCH_MY_DELEGATIONS')" v-on:click="fetchDelegations(false)">
					<i class="fas fa-donate"></i>
				</span>
				
				<span class="btn btn-brand mb-1" :title="$t('FETCH_MY_RC_DELEGATIONS')" v-on:click="fetchRCDelegations(false)">
					<i class="fas fa-bolt"></i>
				</span>
				
				<span class="btn btn-brand mb-1" :title="$t('AFIT_Transaction_History')" v-on:click="scrollAction()">
					<i class="fas fa-file-invoice"></i>
				</span>
				
				<span class="btn btn-brand mb-1" :title="$t('bsc_wallet')" v-on:click="showBSCAddress()">
					<img src="/img/binance-logo.png" width="18px" height="18px">
				</span>
				
				<span v-if="loadingDeleg">
				  <i class="fas fa-spin fa-spinner" ></i>
				</span>
			</div>
		</div>
		<div class="wallet-container" v-if="userTokensWallet >= 0">
			<div class="row font-weight-bold token-entry thick-bottom head-title">
				<div class="col-2 clickable" v-on:click="sortTokenData('symbol')" >Token 
					<span >
						<span v-if="tokenSort=='symbol' && tsortDir==1" >▼△</span>
						<span v-else-if="tokenSort=='symbol'">▽▲</span>
						<span v-else>▽△</span>
					</span>
				</div>
				<div class="col-2 col-lg-1">Location <span v-if="tokenSort=='location'">▽▼△▲</span></div>
				<div class="col-2 clickable" v-on:click="sortTokenData('balance')" >Balance 
					<span >
						<span v-if="tokenSort=='balance' && tsortDir==1" >▼△</span>
						<span v-else-if="tokenSort=='balance'">▽▲</span>
						<span v-else>▽△</span>
					</span>
				</div>
				<div class="col-2">Staked</div>
				<div class="col-lg-1 col-2">Savings</div>
				<div class="col-1 col-lg-2 clickable" v-on:click="sortTokenData('usdval')" >USD <span >
						<span v-if="tokenSort=='usdval' && tsortDir==1" >▼△</span>
						<span v-else-if="tokenSort=='usdval'">▽▲</span>
						<span v-else>▽△</span>
					</span></div>
				<div class="col-lg-2 col-1"><i class="fa-solid fa-wave-square" :title="$t('Actions')"></i></div>
			</div>
			<div class="token-entry row main-token">
				<div class="col-2 text-left"><img src="/img/actifit_logo.png" class="mr-1 mini-token-logo">AFIT</div>
				<div class="col-2 col-lg-1">{{ $t('actifit_wallet')}}</div>
				<div class="col-2 text-right">{{ formattedUserAfit }}</div>
				<div class="col-2 text-right">-</div>
				<div class="col-lg-1 col-2 text-right">-</div>
				<div class="col-1 col-lg-2 text-right break-val">${{ this.afitValueUSD }}</div>
				<div class="col-lg-2 col-1 token_actions" v-if="!nonAuthUser">
					<span class="btn btn-brand p-1" v-on:click="refreshBalance()" >
						<i class="fas fa-solid fa-history" :title="$t('Refresh_balance')"/>
						<span v-if="refreshinBal" >
							<i class="fas fa-spin fa-spinner"></i>
						</span>
					</span>
					<span class="btn btn-brand p-1">
						<a href="#" data-toggle="modal" class="" data-target="#topHoldersModal" :title="$t('top_afit_holders_title')">
							<i class="fas fa-list-ol"></i>
						</a>
					</span>
					
					<a v-if="cur_bchain=='STEEM'" href="https://steem-engine.net/?p=market&t=AFIT" :class="smallScreenBtnClasses" target="_blank" rel="noopener noreferrer" :text="$t('buy_afit_se')"><span class="btn btn-brand p-1" :title="$t('buy_afit_he')">$</span></a>
					<a v-else href="https://hive-engine.com/?p=market&t=AFIT" :class="smallScreenBtnClasses" target="_blank" rel="noopener noreferrer" ><span class="btn btn-brand p-1" :title="$t('buy_afit_he')">$</span></a>
					
					<span class="btn btn-brand p-1" :title="$t('EXCHANGE_AFIT_FOR_STEEM')" v-on:click="exchangeAFITforSTEEM">
						<i class="fas fa-solid fa-thumbs-up" ></i>
					</span>
					<span class="btn btn-brand p-1" :title="$t('INITIATE_AFIT_TO_HE')" v-on:click="initiateAFITtoSE">
						<i class="fas fa-solid fa-angle-double-right" ></i>
					</span>
					<span class="btn btn-brand p-1" v-on:click="initiateTipUser"><i class="fas fa-share-square " :title="$t('TIP_AFIT')" ></i></span>
				</div>
			</div>
			<div class="token-entry row main-token">
				<div class="col-2 text-left">
					<span v-if="cur_bchain == 'HIVE'"><img src="/img/HIVE.png" class="mr-1 mini-token-logo">HIVE</span>
					<span v-else-if="cur_bchain == 'STEEM'"><img src="/img/STEEM.png" class="mr-1 mini-token-logo">STEEM</span>
					<span v-else-if="cur_bchain == 'BLURT'"><img src="/img/BLURT.png" class="mr-1 mini-token-logo">BLURT</span>
				</div>
				<div class="col-2 col-lg-1">{{ this.cur_bchain }}</div>
				<div class="col-2 text-right">{{ this.renderBalance(this.cur_bchain) }}</div>
					
				<div class="row" style="display:none">
					<div class="p-2 col-md-6" id="ttip-area">
						<small><i>{{ $t('STEEM_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_SP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_SP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_SP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
					</div>
				</div>
				<div class="col-2 text-right">{{ this.renderSteemPower(2) }} {{ this.cur_bchain}} {{ $t('POWER') }}
					<i v-if="!showPowerBreakdown['HIVE']" class="fas fa-solid fa-arrow-circle-down text-brand" v-on:click="showPowerBreakdown['HIVE']=true" :title="$t('STEEM_POWER_BREAKDOWN')"></i>
					<i v-else class="fas fa-solid fa-arrow-circle-up text-brand" v-on:click="showPowerBreakdown['HIVE']=false" :title="$t('STEEM_POWER_BREAKDOWN')"></i>
				
					<span v-if="showPowerBreakdown['HIVE']"><li>{{this.renderSteemPower(1)}} ({{ $t('Owned_SP') }})</li><li> + {{this.renderSteemPower(3)}} ({{ $t('Received_SP') }})</li><li> - {{this.renderSteemPower(4)}} ({{ $t('Delegated_SP') }})</li><li> - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</li></span>
				
				</div>
				<div class="col-lg-1 col-2 text-right">
					{{ this.renderSavings(this.cur_bchain) }}
					
					{{ this.pendingSavingsWithdrawVal('HIVE')}}
					<span v-if="hasPendingHiveSavingsWithdrawals() == true">
						<span :title="$t('hive_withdraw_progress')"><br/>
							<i class="far fa-solid fa-hourglass text-brand"></i>
							
							<i v-if="!showHiveWithdrawalDetails" class="fas fa-solid fa-arrow-circle-down text-brand" v-on:click="showHiveWithdrawalDetails=!showHiveWithdrawalDetails" :title="$t('show_pending_withdrawals')"></i>
							<i v-else class="fas fa-solid fa-arrow-circle-up text-brand" v-on:click="showHiveWithdrawalDetails=!showHiveWithdrawalDetails" :title="$t('show_pending_withdrawals')"></i>
						</span>
					</span>
					
					
				</div>
				<div class="col-1 col-lg-2 text-right break-val">${{ this.hiveValueUSD }}</div>
				<div class="col-lg-2 col-1 token_actions" v-if="!nonAuthUser">
					<span class="btn btn-brand p-1" v-on:click="powerUpFunds"><i class="fas fa-arrow-circle-up p-1" :title="$t('POWERUP_ACTION_TEXT')" ></i></span>
					<span class="btn btn-brand p-1" v-on:click="powerDownFunds"><i class="fas fa-arrow-circle-down " :title="$t('POWERDOWN_ACTION_TEXT')" ></i></span>
					<span class="btn btn-brand p-1" v-on:click="transferFunds(cur_bchain)"><i class="fas fa-share-square " :title="$t('TRANSFER_FUNDS_ACTION_TEXT')" ></i></span>
					<span class="btn btn-brand p-1" v-on:click="delegateFunds"><i class="fas fa-donate" :title="$t('DELEGATE_ACTION_TEXT')"></i></span>
					<span class="btn btn-brand p-1" v-on:click="transferToSavings(cur_bchain)" :title="$t('TRANSFER_FUNDS_SAVINGS')"><i class="fas fa-piggy-bank"></i></span>
					<span class="btn btn-brand p-1" v-on:click="transferFromSavings(cur_bchain)" :title="$t('REMOVE_FUNDS_SAVINGS')"><i class="fas fa-box-open"></i></span>
				</div>
			</div>
			
			<!-- special row for HBD savings -->
			<transition name="fade">
			<div class="token-entry row main-token" v-if="showHiveWithdrawalDetails">
				<div class="col-6"></div>
				<div class="col-6">
					
						<span>
							<div class="col-12 row font-weight-bold"><div class="col-4">Amount </div><div class="col-4">Completion Date </div></div>
							<div v-for="(entry, index) in pendingSavingsWithdrawals" :key="index" :entry="entry" v-if="entry.amount.includes('HIVE')" class="col-12 row"><div class="col-4">{{entry.amount}} </div><div class="col-4"> {{entry.complete}}</div><div class="col-4"><button class="btn btn-brand" v-on:click="cancelSavingsWithdrawal(entry.request_id)"><i class="fas fa-times-circle" :title="$t('cancel_savings_withdrawal')"></i></button></div>
							</div>
							<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
							  <label for="cancel-withdraw-act-key" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
							  <input type="password" id="cancel-withdraw-act-key" name="cancel-withdraw-act-key" ref="cancel-withdraw-act-key" class="form-control-lg w-50 p-2">
							</div>
							<div class="text-brand text-center" v-if="error_proceeding">
							  {{ this.error_msg}}
							</div>
						</span>
				</div>
			</div>
			</transition>
			
			
			
			<div class="token-entry row main-token" v-if="cur_bchain != 'BLURT'">
				<div class="col-2 text-left">
					<span v-if="cur_bchain == 'HIVE'"><img src="/img/HIVE.png" class="mr-1 mini-token-logo">HBD</span>
					<span v-else-if="cur_bchain == 'STEEM'"><img src="/img/STEEM.png" class="mr-1 mini-token-logo">SBD</span>
				</div>
				<div class="col-2 col-lg-1">{{ this.cur_bchain }}</div>
				<div class="col-2 text-right">{{ this.renderSBDBalance(this.cur_bchain) }}</div>
				<div class="col-2"></div>
				<div class="col-lg-1 col-2 text-right">
					{{ this.renderSBDSavings(this.cur_bchain) }}
					
					{{ this.pendingSavingsWithdrawVal('HBD')}}
					
					<i v-if="!showHBDSavingsDetails" class="fas fa-solid fa-arrow-circle-down text-brand" v-on:click="showHBDSavingsDetails=!showHBDSavingsDetails" :title="$t('show_pending_withdrawals')"></i>
					<i v-else class="fas fa-solid fa-arrow-circle-up text-brand" v-on:click="showHBDSavingsDetails=!showHBDSavingsDetails" :title="$t('show_pending_withdrawals')"></i>
					
					<span v-if="hasPendingHBDSavingsWithdrawals() == true">
						<span :title="$t('hbd_withdraw_progress')"><br/>
							<i class="far fa-solid fa-hourglass text-brand"></i>
							
							<i v-if="!showHBDWithdrawalDetails" class="fas fa-solid fa-arrow-circle-down text-brand" v-on:click="showHBDWithdrawalDetails=!showHBDWithdrawalDetails" :title="$t('show_pending_withdrawals')"></i>
							<i v-else class="fas fa-solid fa-arrow-circle-up text-brand" v-on:click="showHBDWithdrawalDetails=!showHBDWithdrawalDetails" :title="$t('show_pending_withdrawals')"></i>
						</span>
					</span>
					
				</div>
				<div class="col-1 col-lg-2 text-right break-val">${{ this.hbdValueUSD }}</div>
				<div class="col-lg-2 col-1 token_actions" v-if="!nonAuthUser">
					<span class="btn btn-brand p-1" v-on:click="transferFunds('HBD')"><i class="fas fa-share-square " :title="$t('TRANSFER_FUNDS_ACTION_TEXT')" ></i></span>
					<span class="btn btn-brand p-1" v-on:click="transferToSavings('HBD')" :title="$t('TRANSFER_FUNDS_SAVINGS')"><i class="fas fa-piggy-bank"></i></span>
					<span class="btn btn-brand p-1" v-on:click="transferFromSavings('HBD')" :title="$t('REMOVE_FUNDS_SAVINGS')"><i class="fas fa-box-open"></i></span>
					
				</div>
			</div>
			
			<!-- special row for HBD savings rewards -->
			<transition name="fade">
			<div class="token-entry row main-token" v-if="showHBDSavingsDetails">
				<div class="col-6"></div>
				<div class="col-6">
					<div class="savings-rewards" v-if="parseFloat(estimatedInterest) > parseFloat(0.001)">
						<span>{{$t('last_payout')}} {{ this.lastIPaymentRelative}}<br/></span>
						<span>{{$t('cur_int_rate')}} {{ this.hbdInterestRate / 100}}%<br/></span>
						<span v-if="remainingHours > 1">{{$t('payout_in')}} {{ this.remainingDays}} days.<br/></span>
						<span>{{$t('estimated_reward')}} ${{ this.estimatedInterest}}<br/></span>
						<div v-if="this.remainingHours < 1">
							<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin && !nonAuthUser">
							  <label for="claim-savings-rew-act-key" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
							  <input type="password" id="claim-savings-rew-act-key" name="claim-savings-rew-act-key" ref="claim-savings-rew-act-key" class="form-control-lg w-50 p-2">
							</div>
							<i class="fas fa-spin fa-spinner" v-if="claiming_rewards"></i>
							<div class="text-brand text-center" v-if="error_proceeding">
							  {{ this.error_msg}}
							</div>
							<button class="btn btn-brand" v-on:click="claimSavingsRewards()" v-if="!nonAuthUser">{{$t('claim_rewards')}}</button>
						</div>
					</div>
				</div>
			</div>
			</transition>
			
			<!-- special row for HBD savings -->
			<transition name="fade">
			<div class="token-entry row main-token" v-if="showHBDWithdrawalDetails">
				<div class="col-6"></div>
				<div class="col-6">
					
						<span>
							<div class="col-12 row font-weight-bold"><div class="col-4">Amount </div><div class="col-4">Completion Date </div></div>
							<div v-for="(entry, index) in pendingSavingsWithdrawals" :key="index" :entry="entry" v-if="entry.amount.includes('HBD')" class="col-12 row"><div class="col-4">{{entry.amount}} </div><div class="col-4"> {{entry.complete}}</div><div class="col-4"><button class="btn btn-brand" v-on:click="cancelSavingsWithdrawal(entry.request_id)"><i class="fas fa-times-circle" :title="$t('cancel_savings_withdrawal')"></i></button></div>
							</div>
							<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
							  <label for="cancel-withdraw-act-key" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
							  <input type="password" id="cancel-withdraw-act-key" name="cancel-withdraw-act-key" ref="cancel-withdraw-act-key" class="form-control-lg w-50 p-2">
							</div>
							<div class="text-brand text-center" v-if="error_proceeding">
							  {{ this.error_msg}}
							</div>
						</span>
				</div>
			</div>
			</transition>
			
			<div class="token-entry row main-token">
				<div class="col-2 text-left"><img src="/img/actifit_logo.png" class="mr-1 mini-token-logo">AFIT</div>
				<div class="col-2 col-lg-1">{{ $t('BSC')}}</div>
				<div class="col-2 text-right">{{ formattedUserAfitBSC }}</div>
				<div class="col-2"></div>
				<div class="col-lg-1 col-2 text-right"></div>
				<div class="col-1 col-lg-2 text-right break-val">{{ formattedUserAfitBSCVal}}</div>
				<div class="col-lg-2 col-1 token_actions">
					<span class="btn btn-brand p-1" :title="$t('smart_contract')">
							<a target="_blank" :href="'https://bscscan.com/address/'+afitTokenAddress"><i class="fas fa-file-contract"></i></a>
					</span>
					<a href="https://defi.actifit.io/swap?outputCurrency=0x4516bb582f59befcbc945d8c2dac63ef21fba9f6" :class="smallScreenBtnClasses" target="_blank" ><span class="btn btn-brand p-1" :title="$t('buy_afit_bsc')">
						$
					</span></a>
				</div>
			</div>
			
			<div class="token-entry row main-token">
				<div class="col-2 text-left"><img src="/img/actifit_logo.png" class="mr-1 mini-token-logo">AFIT-BNB LP</div>
				<div class="col-2 col-lg-1">{{ $t('BSC')}}</div>
				<div class="col-2 text-right">{{ formattedUserAfitBNBLPBSC }}</div>
				<div class="col-2"></div>
				<div class="col-lg-1 col-2 text-right"></div>
				<div class="col-1 col-lg-2 text-right">-</div>
				<div class="col-lg-2 col-1 token_actions">
					<span class="btn btn-brand p-1" :title="$t('smart_contract')">
							<a target="_blank" :href="'https://bscscan.com/address/'+afitBNBLPTokenAddress"><i class="fas fa-file-contract"></i></a>
					</span>
				</div>
			</div>
			
			
			<div class="token-entry row main-token">
				<div class="col-2 text-left"><img src="/img/AFITX.png" class="mr-1 mini-token-logo">AFITX</div>
				<div class="col-2 col-lg-1">{{ $t('BSC')}}</div>
				<div class="col-2 text-right">{{ formattedUserAFITXBSC }}</div>
				<div class="col-2"></div>
				<div class="col-lg-1 col-2 text-right"></div>
				<div class="col-1 col-lg-2 text-right break-val">{{ formattedUserAfitxBSCVal}}</div>
				<div class="col-lg-2 col-1 token_actions">
					<span class="btn btn-brand p-1" :title="$t('smart_contract')">
							<a target="_blank" :href="'https://bscscan.com/address/'+afitxTokenAddress"><i class="fas fa-file-contract"></i></a>
					</span>
					<a href="https://defi.actifit.io/swap?outputCurrency=0x246d22ff6e0b90f80f2278613e8db93ff7a09b95" :class="smallScreenBtnClasses" target="_blank" ><span class="btn btn-brand p-1" :title="$t('buy_afitx_bsc')">
						$
					</span></a>
				</div>
			</div>
			
			<div class="token-entry row main-token">
				<div class="col-2 text-left"><img src="/img/AFITX.png" class="mr-1 mini-token-logo">AFITX-BNB LP</div>
				<div class="col-2 col-lg-1">{{ $t('BSC')}}</div>
				<div class="col-2 text-right">{{ formattedUserAFITXBNBLPBSC }}</div>
				<div class="col-2"></div>
				<div class="col-lg-1 col-2 text-right"></div>
				<div class="col-1 col-lg-2 text-right">-</div>
				<div class="col-lg-2 col-1 token_actions">
					<span class="btn btn-brand p-1" :title="$t('smart_contract')">
							<a target="_blank" :href="'https://bscscan.com/address/'+afitxBNBLPTokenAddress"><i class="fas fa-file-contract"></i></a>
					</span>
				</div>
			</div>
			
			
			<div v-if="this.tokenMetrics.length > 0 || this.tokensOfInterestBal.length > 0" >
				<!--<h5 class="token-title" v-if="cur_bchain == 'STEEM'">{{ $t('Your_Token_Balance') }}</h5>
				<h5 class="token-title" v-else>{{ $t('Your_HE_Token_Balance') }}<span v-if="cur_bchain=='BLURT'"><i class="fas fa-info-circle" v-on:click="notifySwitchChain()"></i></span></h5>-->
				<div v-if="tokensOfInterestBal.length > 0 && renderToken(token)" class="token-entry row" v-for="(token, index) in tokensOfInterestBal" :key="index" :token="token">
				  <!--<div v-if=" ">-->
					<div class="col-2 text-left"><img :src="token.icon" class="mr-1 mini-token-logo" >{{ token.symbol }}</div>
					<div class="col-2 col-lg-1">{{ $t('hive_engine')}}</div>
					<div class="col-2 text-right">{{ renderBal(token) }} {{ token.symbol }}</div>
					<div class="col-2 text-right">
					
						{{ renderStake(token)}} {{ token.symbol }}
						<i v-if="!powerDisplayOn(token)" class="fas fa-solid fa-arrow-circle-down text-brand" v-on:click="adjustPowerDisplay(token, true)" :title="$t('POWER_BREAKDOWN')"></i>
						
						<i v-else class="fas fa-solid fa-arrow-circle-up text-brand" v-on:click="adjustPowerDisplay(token, false)" :title="$t('POWER_BREAKDOWN')"></i>
						
						<span v-if="powerDisplayOn(token)"><li>{{renderStake(token, 1)}} ({{ $t('Owned') }})</li><li> + {{renderStake(token, 2)}} ({{ $t('Received_Power') }})</li><li> - {{renderStake(token, 4)}} ({{ $t('Delegated_Power') }})</li><li> ( {{renderStake(token, 3)}} ({{ $t('Total_unstaking') }}))</li></span>
					</div>
					<div class="col-lg-1 col-2"></div>
					<div class="col-1 col-lg-2 text-right break-val">${{ usdVal(token) }}</div>
					<!--<span v-if="parseFloat(delegStake(token)) > 0">( + {{ delegStake(token)}} {{ token.symbol }} {{ $t('Delegated') }}) </span>-->
					<div class="token_actions col-lg-2 col-1" v-if="cur_bchain!='BLURT' && !nonAuthUser">
						<span v-if="token.symbol=='AFITX'" class="btn btn-brand p-1" >
							<a href="#" data-toggle="modal" class="" data-target="#topHoldersXModal" :title="$t('top_100_afitx_holders')" >
								<i class="fas fa-list-ol"></i>
							</a>
						</span>
						
						<span v-if="token.symbol=='AFITX'" class="btn btn-brand p-1" >
						<a v-if="cur_bchain=='STEEM'" :title="$t('buy_afitx_se')" href="https://steem-engine.net/?p=market&t=AFITX" class="" target="_blank" rel="noopener noreferrer">$</a>
						<a v-else :title="$t('buy_afitx_he')" href="https://hive-engine.com/?p=market&t=AFITX" class="" target="_blank" rel="noopener noreferrer">$</a>
						</span>
						
						
						<span v-if="token.symbol=='AFIT'" class="btn btn-brand p-1" :title="$t('buy_afit_he')" v-on:click="moveAFITSEtoAFITPOWER" >
							<i class="fas fa-gopuram" v-if="cur_bchain=='STEEM'" :title="$t('MOVE_AFIT_SE_AFIT_POWER')"></i>
							<i class="fas fa-gopuram" v-else :title="$t('MOVE_AFIT_HE_AFIT_POWER')"></i>
						</span>
						
						
						<span v-if="token.symbol=='AFIT'" class="btn btn-brand p-1" :title="$t('buy_afit_he')">
							<a v-if="cur_bchain=='STEEM'" href="https://steem-engine.net/?p=market&t=AFIT" target="_blank" rel="noopener noreferrer" :text="$t('buy_afit_se')">$</a>
							<a v-else href="https://hive-engine.com/?p=market&t=AFIT" target="_blank" rel="noopener noreferrer" :text="$t('buy_afit_he')" >$</a>
						</span>
						
						<!--<span v-if="token.symbol=='AFIT'" class="btn btn-brand p-1" :title="$t('move_afit_he_se_title')"><i class="fas fa-angle-double-left" v-on:click="moveAFITheSE"></i></span>
						
						<span v-if="token.symbol=='AFITX'" class="btn btn-brand p-1" :title="$t('move_afitx_he_se_title')"><i class="fas fa-angle-double-left" v-on:click="moveAFITXheSE"></i></span>-->
						
						<span v-if="token.stakable" class="btn btn-brand p-1" v-on:click="initiateStaking(token)"><i class="fas fa-arrow-circle-up p-1" :title="$t('stake_tokens')" ></i></span>
						<span v-if="token.stakable" class="btn btn-brand p-1" v-on:click="initiateUnStaking(token)"><i class="fas fa-arrow-circle-down " :title="$t('unstake_tokens')" ></i></span>
						<span v-if="withdrawableTokens.includes(token.symbol)" class="btn btn-brand p-1" v-on:click="initiateWithdraw(token)"><i class="fas fa-upload " :title="$t('withdraw_tokens')" ></i></span>
						<span class="btn btn-brand p-1" v-on:click="initiateTransfer(token)"><i class="fas fa-share-square " :title="$t('transfer_tokens')" ></i></span>
						<span v-if="token.symbol =='AFIT'"  class="btn btn-brand p-1" v-on:click="initiateBSCTransfer(token)"><i class="fas fa-truck-loading " :title="$t('move_to_bsc')" ></i></span>
						<span v-if="token.stakable" class="btn btn-brand p-1" v-on:click="initiateDelegation(token)"><i class="fas fa-donate p-1" :title="$t('delegate_tokens')" ></i></span>
					</div>
				  <!--</div>-->
				</div>
				
				<div class="action-box" v-if="!nonAuthUser">
				
					<h3 class="pro-name">
						<span v-if="curTokenAction == TRANSFER_FUNDS">{{ $t('transfer_tokens') }}</span>
						<span v-else-if="curTokenAction == TRANSFER_BSC">{{ $t('move_to_bsc') }}</span>
						<span v-else-if="curTokenAction == POWERUP_FUNDS">{{ $t('stake_tokens') }}</span>
						<span v-else-if="curTokenAction == POWERDOWN_FUNDS">{{ $t('unstake_tokens') }}</span>
						<span v-else-if="curTokenAction == WITHDRAW_FUNDS">{{ $t('withdraw_tokens') }}</span>
						<span v-else-if="curTokenAction == DELEGATE_FUNDS">{{ $t('delegate_tokens') }}</span>
					</h3>
					<div v-if="tokenActions && curTokenAction">
					<div class="row" v-if="tokenActions && curTokenAction == TRANSFER_FUNDS">
					  <label for="token-target-account" class="w-25 p-2">{{ $t('Account') }} *</label>
					  <span class="p-1">@</span><input type="text" id="token-target-account" name="token-target-account" ref="token-target-account" class="form-control-lg p-2">
					</div>
					
					<div class="row" v-if="tokenActions && curTokenAction == TRANSFER_BSC">
						<span class="text-brand">{{ $t('transfer_bsc_description') }}</span>
					</div>
					
					<div class="row" v-if="tokenActions">
					  <label for="token-powerup-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="token-powerup-amount" name="token-powerup-amount" ref="token-powerup-amount" class="form-control-lg w-50 p-2" @input="calculateHBDAmount">
					  <span class="p-2" v-on:click="fillTokenTransAmount()" :title="$t('select_full_balance')"><img :src="selTokenUp.icon" class="mr-1 mini-token-logo" ><u>{{showMaxBal(selTokenUp)}} {{ selTokenUp.symbol }}</u></span>
					</div>
					
					<div class="row" v-if="tokenActions && curTokenAction == DELEGATE_FUNDS">
					  <label for="token-delegate-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
					  <input type="text" id="token-delegate-recipient" name="token-delegate-recipient" ref="token-delegate-recipient" class="form-control-lg w-50 p-2" value="actifit">
					</div>
					
					<div class="row" v-if="tokenActions && curTokenAction == TRANSFER_BSC">
					  <label for="token-hbd-amount" class="w-25 p-2">{{ $t('HBD_Amount') }} *</label>
					  <input type="number" id="token-hbd-amount" name="token-hbd-amount" ref="token-hbd-amount" class="form-control-lg w-50 p-2" readonly><span class="p-2">{{ $t('HBD') }}</span>
					</div>
					
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin && tokenActions">
					  <label for="p-ac-key-trans-token" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
					  <input type="password" id="p-ac-key-trans-token" name="p-ac-key-trans-token" ref="p-ac-key-trans-token" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="tokenActions && curTokenAction == TRANSFER_FUNDS" >
					  <label for="token-transfer-memo" class="w-25 p-2">{{ $t('Memo') }}</label>
					  <input type="text" id="token-transfer-memo" name="token-transfer-memo" ref="token-transfer-memo" class="form-control-lg w-50 p-2">
					</div>
					<div class="text-brand italic text-center" v-if="tokenActions && curTokenAction == WITHDRAW_FUNDS"  v-html='this.withdrawableSpecialInstrs[selTokenUp.symbol]'>
						
					</div>
					
					<div class="row" v-if="tokenActions">
					  <div class="w-25"></div>
					  <button v-if="curTokenAction == POWERUP_FUNDS" v-on:click="proceedPowerUpToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Up') }}</button>
					  <button v-else-if="curTokenAction == POWERDOWN_FUNDS" v-on:click="proceedPowerDownToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Power_Down') }}</button>
					  <button v-else-if="curTokenAction == TRANSFER_FUNDS" v-on:click="proceedTransferToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Send') }}</button>
					  <button v-else-if="curTokenAction == WITHDRAW_FUNDS" v-on:click="proceedWithdrawToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Withdraw') }}</button>
					  <button v-else-if="curTokenAction == TRANSFER_BSC" v-on:click="proceedTransferBSC" class="btn btn-brand btn-lg w-50 border">{{ $t('Transfer') }}</button>
					  <button v-else-if="curTokenAction == DELEGATE_FUNDS" v-on:click="proceedDelegateToken" class="btn btn-brand btn-lg w-50 border">{{ $t('Delegate') }}</button>
					</div>
					</div>
					<div v-if="movingFunds" id="checking_funds">
						<i class="fas fa-spin fa-spinner"></i>
					</div>
					<div class="row" v-if="afit_se_power_error_proceeding">
					  <div class="w-25"></div>
					  <div class="text-brand" v-html="this.afit_se_power_err_msg"></div>
					</div>
					
					<div v-if="tokenActions && curTokenAction == DELEGATE_FUNDS">
						<h5>{{ $t('active_delegations') }}</h5>
						<table class="table table-hover">
						  <thead class="text-brand">
							<tr>
							  <th scope="col">{{ $t('Delegatee') }}</th>
							  <th scope="col">{{ $t('Stake') }}</th>
							  <th scope="col">{{ $t('Date') }}</th>
							  <th scope="col">{{ $t('Action') }}</th>
							</tr>
						  </thead>
						  <tbody>
							<tr v-for="(delegation, index) in heTokenDelegations" :key="index" :delegation="delegation" v-if="delegation.symbol==selTokenUp.symbol">
								<td><a :href="'./@'+delegation.delegatee" >@{{ delegation.to }}</a></td> 
								<td>
									{{ numberFormat(delegation.quantity, 3) }} {{delegation.symbol}} 
								</td> 
								<td>{{ date(new Date(delegation.updated)) }}</td>
								<td>
								<span ><a href="#" @click.prevent="proceedUnDelegateToken(delegation)" :title="$t('Cancel_Delegation')"><i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="cancellingDelegation"></i></a></span></td>
							</tr>
						  </tbody>
						</table>
					</div>
					
					
					<div v-else-if="tokenActions && curTokenAction == POWERDOWN_FUNDS">
						<span v-html="renderUnstakingVals()"></span>
					</div>
				
				</div>
				
				
			</div>
			
			<div v-else><i class="fas fa-spin fa-spinner text-brand"></i></div>
			
			
			
			<div id="detailsArea" ref="detailsArea"></div>
			<div class="text-center">
				<transition name="fade">
				  <div v-if="fundActivityMode == 1" class="text-center grid col-md-12">
					<h3 class="pro-name">{{ $t('TRANSFER_FUNDS_ACTION_TEXT') }}</h3>
					<div class="row">
					  <label for="transfer-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
					  <input type="text" id="transfer-recipient" name="transfer-recipient" ref="transfer-recipient" class="form-control-lg w-50 p-2" >
					</div>
					<div class="row">
						<label for="transfer-type" class="w-25 p-2">{{ $t('Type') }} *</label>
						<select @change="transferTypeChange" id="transfer-type" name="transfer-type" ref="transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
						  <option value="HIVE" v-if="cur_bchain!='BLURT'" :selected="transferType=='HIVE'">
							<span v-if="cur_bchain=='STEEM'">{{ $t('STEEM') }}</span> 
							<span v-if="cur_bchain=='HIVE'">{{ $t('HIVE') }}</span>
						  </option>
						  <option value="HBD" v-if="cur_bchain!='BLURT'" :selected="transferType=='HBD'">
							<span v-if="cur_bchain=='STEEM'">{{ $t('SBD') }}</span>
							<span v-if="cur_bchain=='HIVE'">{{ $t('HBD') }}</span>
						  </option>
						  <option value="BLURT" v-if="cur_bchain=='BLURT'" :selected="transferType=='BLURT'">{{ $t('BLURT') }}</option>
						</select>
					</div>
					<div class="row">
					  <label for="transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="transfer-amount" name="transfer-amount" ref="transfer-amount" class="form-control-lg w-50 p-2">
					  <span class="w-25 p-1 text-left text-brand" v-on:click="fillTransAmount()" :title="$t('select_full_balance')"><img src="/img/HIVE.png" class="mr-1 mini-token-logo" ><u>{{ this.renderTransAmount() }}</u></span>
					</div>
					<div class="row">
					  <label for="transfer-memo" class="w-25 p-2">{{ $t('Memo') }}</label>
					  <input type="text" id="transfer-memo" name="transfer-memo" ref="transfer-memo" class="form-control-lg w-50 p-2">				
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
						  <label for="p-ac-key-trans" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-trans" name="p-ac-key-trans" ref="p-ac-key-trans" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
				  <div v-if="fundActivityMode == 2" class="text-center grid col-md-12">
					<h3 class="pro-name">{{ $t('Power_Up') }}</h3>
					<div class="row">
					  <label for="powerup-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
					  <input type="text" id="powerup-recipient" name="powerup-recipient" ref="powerup-recipient" class="form-control-lg w-50 p-2" :value="user.account.name">
					</div>
					<div class="row">
					  <label for="powerup-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="powerup-amount" name="powerup-amount" ref="powerup-amount" class="form-control-lg w-50 p-2">
					  <span v-on:click="fillPowerupAmount()" :title="$t('select_full_balance')"><img src="/img/HIVE.png" class="mr-1 mini-token-logo" ><u>{{this.renderBalance (this.cur_bchain, true)}}</u></span>
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
						  <label for="powerup-amount" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-up" name="p-ac-key-up" ref="p-ac-key-up" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
				  <div v-if="fundActivityMode == 3" class="text-center grid col-md-12">
					<h3 class="pro-name">{{ $t('Power_Down') }}</h3>
					<div>
					  <div class="row">
						  <label for="powerdown-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
						  <input type="number" id="powerdown-amount" name="powerdown-amount" ref="powerdown-amount" class="form-control-lg w-50 p-2">
					  </div>
					  <div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
						  <label for="powerdown-amount" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password"  id="p-ac-key" name="p-ac-key" ref="p-ac-key" class="form-control-lg w-50 p-2">
						  <span v-on:click="fillPowerdownAmount()" :title="$t('select_full_balance')"><img src="/img/HIVE.png" class="mr-1 mini-token-logo" ><u>{{this.renderSteemPower(1)}}</u></span>
					  </div>
					  <div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
				  <div v-if="fundActivityMode === TRANSFER_FUNDS_SAVINGS" class="text-center grid col-md-12">
					<h3 class="pro-name">{{ $t('TRANSFER_FUNDS_SAVINGS') }}</h3>
					<div class="row">
					  <label for="transfer-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
					  <input type="text" id="transfer-recipient" name="transfer-recipient" ref="transfer-recipient" class="form-control-lg w-50 p-2" :value="user.account.name">
					</div>
					<div class="row">
						<label for="transfer-type" class="w-25 p-2">{{ $t('Type') }} *</label>
						<select @change="transferTypeChange" id="transfer-type" name="transfer-type" ref="transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
						  <option value="HIVE" v-if="cur_bchain!='BLURT'" :selected="transferType=='HIVE'">
							<span v-if="cur_bchain=='STEEM'">{{ $t('STEEM') }}</span> 
							<span v-if="cur_bchain=='HIVE'">{{ $t('HIVE') }}</span>
						  </option>
						  <option value="HBD" v-if="cur_bchain!='BLURT'" :selected="transferType=='HBD'">
							<span v-if="cur_bchain=='STEEM'">{{ $t('SBD') }}</span>
							<span v-if="cur_bchain=='HIVE'">{{ $t('HBD') }}</span>
						  </option>
						  <option value="BLURT" v-if="cur_bchain=='BLURT'" :selected="transferType=='BLURT'">{{ $t('BLURT') }}</option>
						</select>
					</div>
					<div class="row">
					  <label for="transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="transfer-amount" name="transfer-amount" ref="transfer-amount" class="form-control-lg w-50 p-2">
					  <span class="w-25 p-1 text-left text-brand" v-on:click="fillTransAmount()" :title="$t('select_full_balance')"><img src="/img/HIVE.png" class="mr-1 mini-token-logo" ><u>{{ this.renderTransAmount() }}</u></span>
					</div>
					<div class="row">
					  <label for="transfer-memo" class="w-25 p-2">{{ $t('Memo') }}</label>
					  <input type="text" id="transfer-memo" name="transfer-memo" ref="transfer-memo" class="form-control-lg w-50 p-2">				
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
						  <label for="p-ac-key-trans" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-trans" name="p-ac-key-trans" ref="p-ac-key-trans" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
					  <button v-on:click="proceedTransferSavings" class="btn btn-brand btn-lg w-50 border">{{ $t('Send') }}</button>
					</div>
					<div v-if="transferProcess">
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
				  </div>
				</transition>
				
				<transition name="fade">
				  <div v-if="fundActivityMode === REMOVE_FUNDS_SAVINGS" class="text-center grid col-md-12">
					<h3 class="pro-name">{{ $t('REMOVE_FUNDS_SAVINGS') }}</h3>
					<h5>{{$t('Withdraw_savings_notice')}}</h5>
					<div class="row">
						<label for="transfer-type" class="w-25 p-2">{{ $t('Type') }} *</label>
						<select @change="transferTypeChange" id="transfer-type" name="transfer-type" ref="transfer-type" text="Choose Type" class="form-control-lg w-50 p-2">
						  <option value="HIVE" v-if="cur_bchain!='BLURT'" :selected="transferType=='HIVE'">
							<span v-if="cur_bchain=='STEEM'">{{ $t('STEEM') }}</span> 
							<span v-if="cur_bchain=='HIVE'">{{ $t('HIVE') }}</span>
						  </option>
						  <option value="HBD" v-if="cur_bchain!='BLURT'" :selected="transferType=='HBD'">
							<span v-if="cur_bchain=='STEEM'">{{ $t('SBD') }}</span>
							<span v-if="cur_bchain=='HIVE'">{{ $t('HBD') }}</span>
						  </option>
						  <option value="BLURT" v-if="cur_bchain=='BLURT'" :selected="transferType=='BLURT'">{{ $t('BLURT') }}</option>
						</select>
					</div>
					<div class="row">
					  <label for="transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="transfer-amount" name="transfer-amount" ref="transfer-amount" class="form-control-lg w-50 p-2">
					  <span class="w-25 p-1 text-left text-brand" v-on:click="fillSavingsAmount()" :title="$t('select_full_balance')"><img src="/img/HIVE.png" class="mr-1 mini-token-logo" ><u>{{ this.renderSavingsAmount() }}</u></span>
					</div>
					<div class="row">
					  <label for="transfer-memo" class="w-25 p-2">{{ $t('Memo') }}</label>
					  <input type="text" id="transfer-memo" name="transfer-memo" ref="transfer-memo" class="form-control-lg w-50 p-2">				
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
						  <label for="p-ac-key-trans" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-trans" name="p-ac-key-trans" ref="p-ac-key-trans" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
					  <button v-on:click="proceedRemoveSavings" class="btn btn-brand btn-lg w-50 border">{{ $t('Send') }}</button>
					</div>
					<div v-if="transferProcess">
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
				  </div>
				</transition>
				
				<transition name="fade">
				  <div v-if="fundActivityMode == DELEGATE_FUNDS" class="text-center grid col-12">
					<div v-if="!nonAuthUser">
					<h3 class="pro-name">{{ $t('DELEGATE_ACTION_TEXT') }} {{ $t('POWER') }}</h3>
					<div class="row">
					  <label for="delegate-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
					  <input type="text" id="delegate-recipient" name="delegate-recipient" ref="delegate-recipient" class="form-control-lg w-50 p-2" value="actifit">
					</div>
					<div class="row">
					  <label for="delegate-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="delegate-amount" name="delegate-amount" ref="delegate-amount" class="form-control-lg w-50 p-2">
					  <span v-on:click="fillDelegateAmount()" :title="$t('select_full_balance')"><img src="/img/HIVE.png" class="mr-1 mini-token-logo" ><u>{{this.renderSteemPower(1)}}</u></span>
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
						  <label for="delegate-amount" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
						  <input type="password" id="p-ac-key-delg" name="p-ac-key-delg" ref="p-ac-key-delg" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
					
					</div>
					
					<div>
						<h5>{{ $t('active_delegations') }}</h5>
						<table class="table table-hover">
						  <thead class="text-brand">
							<tr>
							  <th scope="col">{{ $t('Delegatee') }}</th>
							  <th scope="col" v-if="cur_bchain == 'STEEM' ">{{ $t('Steem_Power') }}</th>
							  <th scope="col" v-else-if="cur_bchain == 'HIVE' ">{{ $t('Hive_Power') }}</th>
							  <th scope="col" v-else-if="cur_bchain == 'BLURT' ">{{ $t('Blurt_Power') }}</th>
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
								<td v-if="!nonAuthUser"><span ><a href="#" @click.prevent="editDelegation(delegation)" :title="$t('Edit_Delegation')"><i class="fas fa-edit"></i></a></span>&nbsp;
								<span ><a href="#" @click.prevent="cancelDelegation(delegation)" :title="$t('Cancel_Delegation')"><i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="cancellingDelegation"></i></a></span></td>
							</tr>
						  </tbody>
						</table>
					</div>
				  </div>
				</transition>
				
				<transition name="fade">
				  <div v-if="fundActivityMode == DELEGATE_RCS && cur_bchain == 'HIVE' " class="text-center grid col-12">
					<div v-if="!nonAuthUser">
					<h3 class="pro-name">{{ $t('DELEGATE_ACTION_TEXT') }} {{ $t('RCS') }}</h3>
					<div class="row">
					  <label for="delegate-recipient" class="w-25 p-2">{{ $t('To') }} *</label>
					  <input type="text" id="delegate-recipient" name="delegate-recipient" ref="delegate-recipient" class="form-control-lg w-50 p-2" value="actifit">
					</div>
					<div class="row">
					  <label for="delegate-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="delegate-amount" name="delegate-amount" ref="delegate-amount" class="form-control-lg w-50 p-2">
					</div>
					<div class="row">
						<div class="w-25"></div>
						<b>{{$t('available_RC')}} / {{$t('full_RC')}} / {{$t('delegated_RC')}}</b>
					</div>
					<div class="row">
						<div class="w-25"></div>
						{{ showUserRC()}} / {{ showUserRC(1)}} / {{ showUserRC(2)}}
					</div>
					<div class="row">
					  <div class="text-center small p-2 w-25"></div>
					  <div class="p-2 w-50"></div>
					  <div :class="smallScreenBtnClasses" class="text-center small p-2 w-50" v-html="$t('rc_delegation_notice')">
					  </div>
					</div>
					<div class="text-brand text-center" v-if="error_proceeding">
					  {{ this.error_msg}}
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <button v-on:click="proceedRCDelegation" class="btn btn-brand btn-lg w-50 border">{{ $t('Delegate_rc') }}</button>
					</div>
					<div v-if="delegateProcess">
					  <i class="fas fa-spin fa-spinner" ></i>
					</div>
					
					</div>
					
					<div>
						<h5>{{ $t('active_delegations') }}</h5>
						<table class="table table-hover">
						  <thead class="text-brand">
							<tr>
							  <th scope="col">{{ $t('Delegatee') }}</th>
							  <th scope="col">{{ $t('delegated_RC') }}</th>
							  <th scope="col">{{ $t('owned_RC') }}</th>
							  <!--<th scope="col">{{ $t('Date') }}</th>-->
							  <th scope="col">{{ $t('Action') }}</th>
							</tr>
						  </thead>
						  <tbody>
							<tr v-for="(delegation, index) in activeRCDelegations" :key="index" :delegation="delegation">
								<td><a :href="'./@'+delegation.to" >@{{ delegation.to }}</a></td> 
								<td>
									{{ numberFormat(delegation.delegated_rc, 3) }} </td>
								<td>{{ numberFormat(renderRCVal(delegation.to), 3) }}</td>
								<!--<td>{{ date(delegation.min_delegation_time) }}</td>-->
								<td v-if="!nonAuthUser"><span ><a href="#" @click.prevent="editRCDelegation(delegation)" :title="$t('Edit_Delegation')"><i class="fas fa-edit"></i></a></span>&nbsp;
								<span ><a href="#" @click.prevent="cancelRCDelegation(delegation)" :title="$t('Cancel_Delegation')"><i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="cancellingDelegation"></i></a></span></td>
							</tr>
						  </tbody>
						</table>
					</div>
					
				  </div>
				</transition>
				
				
				<transition name="fade">
					<div v-if="fundActivityMode == SHOW_CLAIMABLE_REW && isClaimableDataAvailable && cur_bchain=='STEEM'" class="action-box">
						<h5 class="pro-name"><img src="/img/STEEM.png" class="mr-2 token-logo">{{ $t('Claimable_Steem_Rewards') }}</h5>
						<div class="mb-4 font-weight-bold">
							<span class="p-2">{{ this.claimSP }} | {{ this.claimSTEEM }} | {{ this.claimSBD }}</span>
							<div class="p-2"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Steem_Rewards') }}</button></div>
							<div v-if="claimRewardsProcess">
							  <i class="fas fa-spin fa-spinner" ></i>
							</div>
						</div>
					</div>
					<div v-else-if="fundActivityMode == SHOW_CLAIMABLE_REW && isClaimableDataAvailable && cur_bchain=='HIVE'" class="col-md-6 row-sep-in">
						<h5 class="pro-name"><img src="/img/HIVE.png" class="mr-2 token-logo">{{ $t('Claimable_Hive_Rewards') }}</h5>
						<div class="mb-4 font-weight-bold">
							<span class="p-2">{{ this.claimSP }} | {{ this.claimSTEEM }} | {{ this.claimSBD }}</span>
							<div class="p-2" v-if="!nonAuthUser"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Hive_Rewards') }}</button></div>
							<div v-if="claimRewardsProcess">
							  <i class="fas fa-spin fa-spinner" ></i>
							</div>
						</div>
					</div>
					<div v-else-if="fundActivityMode == SHOW_CLAIMABLE_REW && isClaimableDataAvailable && cur_bchain=='BLURT'" class="col-md-6 row-sep-in">
						<h5 class="pro-name"><img src="/img/BLURT.png" class="mr-2 token-logo">{{ $t('Claimable_Blurt_Rewards') }}</h5>
						<div class="mb-4 font-weight-bold">
							<span class="p-2">{{ this.claimSP }} | {{ this.claimSTEEM }}</span>
							<div class="p-2" v-if="!nonAuthUser"><button v-on:click="claimRewards" class="btn btn-brand btn-lg w-20">{{ $t('Claim_Blurt_Rewards') }}</button></div>
							<div v-if="claimRewardsProcess">
							  <i class="fas fa-spin fa-spinner" ></i>
							</div>
						</div>
					</div>
				</transition>
				
				<transition name="fade">
					<div v-if="afitActivityMode == MOVE_AFITX_SE_HE || afitActivityMode == MOVE_AFITX_HE_SE">
						<!--<h3 class="pro-name">{{ $t('EXCHANGE_AFIT_FOR_STEEM') }}</h3>-->
						  <div class="text-center">
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
				
				</transition>
				
				<transition name="fade">
				
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
				</transition>
				
				
				<transition name="fade">
					<div v-if="afitActivityMode == showBSCDetails">
						<h3 class="pro-name">{{ $t('bsc_wallet') }}</h3>
						<span class="font-brand">{{ $t('bsc_details_notice') }}</span>
						
						<div>
							
								<input type="text" id="bsc-wallet-address" name="bsc-wallet-address" ref="bsc-wallet-address" class="form-control-lg w-50 p-2" :value="this.getWalletAddress()" placeholder="0x......">
								<div v-if="error_wallet!=''" class="text-brand text-center">{{ error_wallet}}</div>
								<button v-if="!nonAuthUser" v-on:click="updateWalletAddress" class="btn btn-brand btn-lg w-50 border"><span v-if="this.bsc_wallet_address">{{ $t('Save') }}</span><span v-else>{{ $t('Save') }}</span></button>
								<button v-if="!nonAuthUser" v-on:click="deleteWalletAddress" class="btn btn-brand btn-lg w-50 border">{{ $t('Reset') }}</button>
						</div>
					</div>
				</transition>
				
			</div>
			
			
		</div>
		<div v-else><i class="fas fa-spin fa-spinner text-brand"></i></div>
		<div v-if="this.tokenMetrics.length > 0 && false" class="row">
			<div class="col-md-6 row-sep row-sep-in">
				<h5 class="token-title">{{ $t('account_est_val') }}<i class="fas fa-info-circle" v-on:click="showDetailedCalc=!showDetailedCalc"></i></h5>
				<div class="pb-2">{{ $t('in_usd') }}: ${{ totalAccountValue}}</div>
				<div class="pb-2" v-if="this.cur_bchain=='STEEM'">{{ $t('in_steem') }}: <img src="/img/STEEM.png" class="token-logo-sm">{{ formattedSteemTotVal }}</div>
				<div class="pb-2" v-else-if="this.cur_bchain=='HIVE'">{{ $t('in_hive') }}: <img src="/img/HIVE.png" class="token-logo-sm">{{ formattedSteemTotVal }}</div>
				<div class="pb-2" v-else-if="this.cur_bchain=='BLURT'">{{ $t('in_blurt') }}: <img src="/img/BLURT.png" class="token-logo-sm">{{ formattedSteemTotVal }}</div>
			</div>
			
		</div>
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
        
		<div class="font-weight-bold">
			<!--<button v-on:click="buyAFITwithSTEEM" :class="smallScreenBtnClasses" class="btn btn-brand btn-lg border w-25">{{ $t('BUY_AFIT_WITH_STEEM') }}</button>-->
			
			  <transition name="fade">
			  <div v-if="afitActivityMode == MOVE_AFIT_SE" class="action-box">
				<h3 class="pro-name">{{ $t('MOVE_AFIT_HE_AFIT_POWER') }}</h3>
				  <div class="text-center grid p-2">
					<div v-if="cur_bchain=='STEEM'" class="text-brand font-weight-bold">{{ $t('wallet.afit_se_to_power') }}</div>
					<div v-else class="text-brand font-weight-bold">{{ $t('wallet.afit_he_to_power') }}</div>
					<div class="row" >
					  <div class="w-25 p-2">{{ $t('Amount_To_Move') }}</div>
					  <input type="number" id="afit-se-move-power" name="afit-se-move-power" ref="afit-se-move-power" class="form-control-lg w-50 p-2">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
			  
			  <div v-else-if="afitActivityMode == INIT_AFIT_TIP" class="action-box">
				<h3 class="pro-name">{{ $t('SEND_AFIT_TO_USER') }}</h3>
				<div class="text-center grid p-2">
					<div>
						<div class="row">
							<label for="tip-amount" class="w-25 p-2">{{ $t('Recipient') }}</label>
							<input type="text" id="tip-recipient" name="tip-recipient" ref="tip-recipient" class="form-control-lg w-50 p-2">
						</div>
						<div class="row">
							<label for="tip-amount" class="w-25 p-2">{{ $t('Tip_Amount') }}</label>
							<input type="number" id="tip-amount" name="tip-amount" ref="tip-amount" class="form-control-lg w-50 p-2">
						</div>
						<div class="row">
							<label for="funds-pass" class="w-25 p-2">{{ $t('Funds_Password') }}</label>
							<input type="password" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control-lg w-50 p-2">
							<a href="/wallet?action=set_funds_pass" target="_blank" class="btn btn-brand border m-1">{{ $t('create_pass_short') }}</a>
						</div>
						<div class="row"><div class="col-2"></div><div class="col-8">{{$t('tip_note')}}</div></div>
						<div class="row">
							<div v-if="tipError" v-html="tipError" class="m-3"></div>
						</div>
						
						<div class="row">
							<div class="col-2"></div>
							<div class="col-8"><button v-on:click="proceedTipActivity" class="btn btn-brand w-50 border m-3">{{ $t('Proceed') }}</button>
							<i class="fas fa-spin fa-spinner" v-if="tipInProgress"></i>
							</div>
						</div>
					</div>
				</div>
			  </div>
			  
			  <div v-else-if="afitActivityMode == INIT_AFIT_TO_SE" class="action-box">
				<h3 class="pro-name">{{ $t('INITIATE_AFIT_TO_HE') }}</h3>
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
				  <h3 class="pro-name">{{ $t('EXCHANGE_AFIT_FOR_STEEM') }}</h3>
					<div class="text-brand font-weight-bold">{{ $t('wallet.title_process') }}</div>
					<h5>{{ $t('wallet.step1_title') }}</h5>
					<div v-html="$t('wallet.step1_desc')">
					</div>
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
						<!--<option v-if="cur_bchain=='BLURT'" value="BLURT">{{ $t('BLURT') }}</option>-->
					  </select>
					</div>
					<div class="row">
					  <label for="pass-transfer-amount" class="w-25 p-2">{{ $t('Amount') }} *</label>
					  <input type="number" id="pass-transfer-amount" name="pass-transfer-amount" ref="pass-transfer-amount" class="form-control-lg w-50 p-2"  v-model="transfer_amount">
					</div>
					<div class="row" v-if="!isKeychainLogin && !isHiveauthLogin && isStdLogin">
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
					  <button v-on:click="resetFundsPass" class="btn btn-brand btn-lg w-50 border">{{ $t('Reset_password') }}</button>
					</div>
					<div class="row">
					  <div class="w-25"></div>
					  <div v-if="checkingFunds" id="checking_funds">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('Checking_Steem_Transfer') }}
					  </div>
					</div>
					<div class="row" v-if="speed_up_on">
						<div class="w-25"></div>
						<div>{{ $t('speed_up_text') }} <a href="#a" v-on:click="speedUpVerify">{{ $t('speed_up') }}</a></div>
						
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
					  <button v-on:click="resetFundsPass" class="btn btn-brand btn-lg border">{{ $t('Reset_password') }}</button>
					</div>
					<div class="row" v-if="error_swap != ''" >
					  <div class="w-25"></div>
					  <span class="text-brand">{{error_swap}}</span>
					</div>
					<div class="row" v-if="buyMore">
						<div class="w-25"></div>
						<div class="w-50">
							<a href="#" class="btn btn-brand border p-2" v-on:click="moveAFITSEtoAFITPOWER">{{ $t('transfer_afit_from_he') }}</a>
							<span class="text-brand">OR</span>
							<a href="https://hive-engine.com/?p=market&t=AFIT" class="btn btn-brand border p-2">{{ $t('buy_afit_he') }}</a>
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
			  <ExchangeQueue :transList="tokenSwapQueue.pendingTransactions" :user="targetUserWallet" :topAFITXList="topAFITXHolders"/>
			  <ExchangeHistory :transList="userTokenSwapHistory.userTokenSwapHist"/>
			  </div>
			
			</transition>
		</div>
		
		
		<div class="row text-center row-sep" v-if="false">
			<div class="col-md-6 row-sep-in" v-if="cur_bchain=='STEEM'">
				<h5 class="token-title"><img src="/img/STEEM.png" class="mr-2 token-logo">{{ $t('Your_Steem_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2">{{ this.renderSteemPower(2) }} {{ $t('STEEM_POWER_CAPS') }} | {{ this.renderBalance(this.cur_bchain) }} | {{ this.renderSBDBalance(this.cur_bchain) }}</div>
					<div class="p-2">
					UNDER SAVINGS: </div>
					<div class="p-2">{{ this.renderSavings(this.cur_bchain) }} | {{ this.renderSBDSavings(this.cur_bchain) }}</div>
					
					<div class="row">
						<div class="p-2 col-md-6" id="ttip-area">
							<small><i>{{ $t('STEEM_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_SP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_SP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_SP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
						</div>
					</div>
					
				</div>
			</div>
			<div class="col-md-6 row-sep-in" v-else-if="cur_bchain=='HIVE'">
				<h5 class="token-title"><img src="/img/HIVE.png" class="mr-2 token-logo">{{ $t('Your_Hive_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2">{{ this.renderSteemPower(2) }} {{ $t('HIVE_POWER_CAPS') }} | {{ this.renderBalance(this.cur_bchain) }} | {{ this.renderSBDBalance(this.cur_bchain) }}</div>
					<div class="p-2">
					UNDER SAVINGS: </div>
					<div class="p-2">{{ this.renderSavings(this.cur_bchain) }} | {{ this.renderSBDSavings(this.cur_bchain) }}</div>
					
					<div class="row">
						<div class="p-2 col-md-6" id="ttip-area">
							<small><i>{{ $t('HIVE_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_HP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_HP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_HP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
						</div>
					</div>
					
				</div>
			</div>
			<div class="col-md-6 row-sep-in" v-else-if="cur_bchain=='BLURT'">
				<h5 class="token-title"><img src="/img/BLURT.png" class="mr-2 token-logo">{{ $t('Your_Blurt_Balance') }}</h5>
				<div class="mb-4 font-weight-bold">
					<div class="p-2">{{ this.renderSteemPower(2) }} {{ $t('BLURT_POWER_CAPS') }} | {{ this.renderBalance(this.cur_bchain) }}</div>
					
					<div class="p-2">
					UNDER SAVINGS: </div>
					<div class="p-2">{{ this.renderSavings(this.cur_bchain) }} </div>
					
					<div class="row">
						<div class="p-2 col-md-6" id="ttip-area">
							<small><i>{{ $t('BLURT_POWER_BREAKDOWN') }}: {{this.renderSteemPower(1)}} ({{ $t('Owned_BP') }}) + {{this.renderSteemPower(3)}} ({{ $t('Received_BP') }}) - {{this.renderSteemPower(4)}} ({{ $t('Delegated_BP') }}) - {{this.renderSteemPower(5)}} ({{ $t('Powering_Down_Amount') }})</i></small>
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
	  	<TopHolders :user="targetUserWallet" :holdersList="afitHoldersList"/>
		<TopHoldersX :user="targetUserWallet" :holdersList="afitxHoldersList"/>
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
	
	<pendingRewardsModal :pendingRewards="pendingRewards" :username="user"/>
	
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Transaction from '~/components/Transaction'
  import Footer from '~/components/Footer'
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  import blurt from '@blurtfoundation/blurtjs'
  
  import ExchangeQueue from '~/components/ExchangeQueueModal'
  import ExchangeHistory from '~/components/ExchangeHistoryModal'
  import SSC from 'sscjs'
  
  import Countdown from 'vuejs-countdown'
  
  import TopHolders from '~/components/TopHoldersModal'
  import TopHoldersX from '~/components/TopHoldersXModal'
  
  import pendingRewardsModal from '~/components/PendingRewardsModal'
  
  import VueScrollTo from 'vue-scrollto' // for smooth scrolling
  
  //Disable: EOL for S-E
  //const ssc = new SSC(process.env.steemEngineRpc);
  const scot_steemengine_api = process.env.steemEngineScot;
  
  const hsc = new SSC(process.env.hiveEngineRpc);
  const scot_hive_api_param = process.env.hiveEngineScotParam;

  const tokensNonStakable = ['AFITX', 'AFIT', 'SWAP.HIVE', 'SWAP.BLURT'];
  const tokensOfInterest = ['SPORTS', 'PAL', 'APX', 'BEE', 'POSH', 'LEO'].concat(tokensNonStakable);
  
  import { mapGetters } from 'vuex'
  
  import Web3 from 'web3'
  
  let web3 = new Web3('https://bsc-dataseed1.binance.org:443');
  
  const minABI = [
	  // balanceOf
	  {
		constant: true,
		inputs: [{ name: "_owner", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", type: "uint256" }],
		type: "function",
	  },
	];
	
	//fetch AFIT, AFITX, & LP token addresses
	const afitTokenAddress = process.env.afitTokenBSC;
	const afitxTokenAddress = process.env.afitxTokenBSC;
	const afitBNBLPTokenAddress = process.env.afitBNBLPTokenBSC;
	const afitxBNBLPTokenAddress = process.env.afitxBNBLPTokenBSC;
	
	const afitContract = new web3.eth.Contract(minABI, afitTokenAddress);
	const afitxContract = new web3.eth.Contract(minABI, afitxTokenAddress);
	const afitBNBLPContract = new web3.eth.Contract(minABI, afitBNBLPTokenAddress);
	const afitxBNBLPContract = new web3.eth.Contract(minABI, afitxBNBLPTokenAddress);
	
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
		tipInProgress: false,
		tipError: '',
		claiming_rewards: false,
		observerSet: false,
		detailsViewable: false,
		tokenSort: 'symbol',//default sort by token name
		tsortDir: 1,//1 asc -1 desc
	    CLOSED_MODE: 0,
		TRANSFER_FUNDS: 1,
		POWERUP_FUNDS: 2,
		POWERDOWN_FUNDS: 3,
		WITHDRAW_FUNDS: 4,
		DELEGATE_FUNDS: 5,
		DELEGATE_RCS: 6,
		TRANSFER_BSC: 10,
		SHOW_CLAIMABLE_REW: 11,
		showBSCDetails: 12,
		TRANSFER_FUNDS_SAVINGS: 13,
		REMOVE_FUNDS_SAVINGS: 14,
		afitTokenAddress: '',
		afitxTokenAddress: '',
		afitBNBLPTokenAddress: '',
		afitxBNBLPTokenAddress: '',
		EXCHANGE_AFIT_STEEM: 1,
		MOVE_AFITX_SE_HE: 6,
		MOVE_AFITX_HE_SE: 7,
		MOVE_AFIT_SE_HE: 8,
		MOVE_AFIT_HE_SE: 9,
		MOVE_AFIT_SE: 2,
		BUY_AFIT_STEEM: 3,
		INIT_AFIT_TO_SE: 4,
		INIT_AFIT_TIP: 5,
		powerDownRateVal: '',
		powerDownWithdrawDate: '',	
		steemPower: 0,
		effectiveSteemPower: 0,
		delegatedSteemPower: 0,
		receivedSteemPower: 0,
		hbdValue: 0,
		hiveValue: 0,
		afitValue: 0,
		afitxValue: 0,
		afitBSCValue: 0,
		afitxBSCValue: 0,
		claimSP: '',
		claimSTEEM: '',
		claimVests: '',
		claimSBD: 0,
		claimWindow: '',
		fundActivityMode: this.CLOSED_MODE,
		afitActivityMode: this.CLOSED_MODE,
		transferType: 'HIVE',
		transferTypePass: 'HIVE',
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
		afitBSCPrice: 0.01,
		afitxBSCPrice: 1,
		pendingTokenSwap: '',
		pendingSavingsWithdrawals: [],
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
		
		afitBalanceBSC: 0,
		afitxBalanceBSC: 0,
		afitBNBLPBalanceBSC: 0,
		afitxBNBLPBalanceBSC: 0,
		
		userAddedTokens: 0,
		steemPrice: 0.1,
		sbdPrice: 0.1,
		hivePrice: 0.1,
		hbdPrice: 0.1,
		blurtPrice: 0.01,
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
		showPowerBreakdown: {HIVE: false},
		showHBDWithdrawalDetails: false,
		showHiveWithdrawalDetails: false,
		showHBDSavingsDetails: false,
		delegateProcess: false,
		loadingDeleg: false,
		rc_data: {},
		activeDelegations: [],
		activeRCDelegations: [],
		activeIncomingRCDelegations: [],
		cancellingDelegation: false,
		bsc_wallet_address: '',
		error_wallet: '',
		extra_reward_arr: [
							{afit: 50, upvote: 10},
							{afit: 100, upvote: 15},
							{afit: 150, upvote: 20},
							{afit: 200, upvote: 25},
						],
		airdropResults: {},
		withdrawableTokens: ['SWAP.HIVE', 'STEEMP', 'SWAP.BLURT'],
		withdrawableSpecialInstrs: {
					'SWAP.BLURT':'Minimum withdrawal 5 BLURT. 0.75% fee on withdrawals as well as 0.100 SWAP.BLURT network transaction fee',
					'SWAP.HIVE': '0.75% fee on withdrawals',
				},
		refreshinBal: false,
		afitHBDRate: process.env.afitHBDBridgeRate,
		pendingRewards: {},
		speed_up_on: true,
		rcDelgArray: [],
		show_only_tokens_interest: true,
		hide_small_balances: false,
		settings_set: false,
		user_settings: {},
		save_progress: false,
		heTokenBalances: [],
		heTokenDelegations: [],
		heTokenUnstakes: [],
		lastIPaymentRelative: '',
		hbdInterestRate: 0,
		remainingDays: 0,
		remainingHours: 100,//any positive value by default
		estimatedInterest: 0,
		displayUser: '',
		displayUserData: null,
		profImgUrl: process.env.hiveImgUrl,
		userTokensWallet: -1,
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
	  TopHoldersX,
	  pendingRewardsModal,
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['userTokens', 'transactions', 'userRank', 'bchain']),
	  isKeychainLogin (){
		return localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain
	  },
	  nonAuthUser (){
		if (!this.displayUser || this.displayUser == ''){
			if (this.user)
				return false;
			else{
				return true;
			}
		}else{
			if (this.user && this.user.account){
				if (this.displayUser != this.user.account.name){
					return true;
				}else{
					return false;
				}
			}
		}
		return true; 
	  },
	  targetUserWallet(){
		if (this.displayUser!='') return this.displayUser;
		else if (this.user.account.name) return this.user.account.name
		else return '';
	  },
	  isHiveauthLogin (){
		return localStorage.getItem('acti_login_method') == 'hiveauth'
	  },
      isStdLogin () {
		return localStorage.getItem('std_login')
	  },
	  afitValueUSD () {
		return this.numberFormat(parseFloat(this.userTokensWallet) * this.afitPrice, 2);
	  },
	  afitBSCValueUSD () {
		return parseFloat(this.afitBalanceBSC) * this.afitBSCPrice;
	  },
	  afitxBSCValueUSD () {
		return parseFloat(this.afitxBalanceBSC) * this.afitxBSCPrice;
	  },
	  hbdValueUSD () {
		return this.numberFormat(parseFloat(this.displayUserData.hbd_balance) * this.hbdPrice, 2)
	  },
	  hiveValueUSD () {
		console.log(this.steemPower)
		console.log(this.hivePrice)
		return this.numberFormat((parseFloat(this.displayUserData.balance) + parseFloat(this.steemPower)) * this.hivePrice, 2);
	  },
	  totalBalanceUSD () {
		console.log('totalBalanceUSD');
		//calculate full balance HE tokens
		let heUSDVals = this.heTokenBalances.reduce((accumulator, currentValue) => accumulator + parseFloat(currentValue), 0);
		console.log(heUSDVals)
		return this.numberFormat(
			(parseFloat(this.afitValueUSD) + 
				parseFloat(this.hbdValueUSD) + 
				parseFloat(this.hiveValueUSD) + 
				parseFloat(heUSDVals) +
				parseFloat(this.afitBSCValueUSD) + 
				parseFloat(this.afitxBSCValueUSD)
			).toFixed(3), 3)
	  },
	  formattedSteemTotVal () {
		return this.numberFormat(this.totalAccountValueSteem, 3) + ' ' + this.cur_bchain;
	  },
	  formattedUserAfit () {
		return this.numberFormat((parseFloat(this.userTokensWallet) + parseFloat(this.userAddedTokens)).toFixed(3), 3) + " AFIT";
      },
	  formattedUserAfitSE () {
		return this.numberFormat(parseFloat(this.afit_se_balance), 3) + " AFIT S-E" ;
      },
	  formattedUserAfitHE () {
		return this.numberFormat(parseFloat(this.afit_he_balance), 3) + " AFIT H-E";
      },
	  formattedUserAfitBSC () {
		return this.numberFormat(parseFloat(this.afitBalanceBSC), 3) + " AFIT BSC";
      },
	  formattedUserAfitBSCVal () {
		return '$' + this.numberFormat(parseFloat(this.afitBalanceBSC) * this.afitBSCPrice, 3)
	  },
	  formattedUserAfitxBSCVal () {
		return '$' + this.numberFormat(parseFloat(this.afitxBalanceBSC) * this.afitxBSCPrice, 3)
	  },
	  formattedUserAfitBNBLPBSC () {
		return this.numberFormat(parseFloat(this.afitBNBLPBalanceBSC), 3) + " AFIT-BNB LP BSC";
      },
	  formattedUserAFITXBNBLPBSC () {
		return this.numberFormat(parseFloat(this.afitxBNBLPBalanceBSC), 3) + " AFITX-BNB LP BSC";
      },
	  formattedUserAFITXSE () {
		return this.numberFormat(this.afitx_se_balance,3) + ' AFITX S-E';
	  },
	  formattedUserAFITXHE () {
		return this.numberFormat(this.afitx_he_balance, 3) + ' AFITX H-E';
	  },
	  formattedUserAFITXBSC () {
		return this.numberFormat(this.afitxBalanceBSC, 3) + ' AFITX BSC';
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
		  if (this.displayUserData.vesting_withdraw_rate.split(' ')[0] > 0){
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
	  afitBSCPrice: 'formattedTotAccountVal',
	  afitxBSCPrice: 'formattedTotAccountVal',
	  afitBalanceBSC: 'formattedTotAccountVal',
	  afitxBalanceBSC: 'formattedTotAccountVal',
	  transferType: 'resetTransAmount',
	  userTokens: function(param){
		//if usertokens changes, no need to keep spinner on if it was on
		this.refreshinBal = false;
	  },
	  afit_val_exchange: function(newVal){
		let new_val = this.extra_reward_arr.find(match => match.afit == this.afit_val_exchange)
		this.afit_exch_matching_perc = new_val.upvote;
	  },
	  bchain: async function(newBchain) {
		console.log('change in chain');
		//load default blockchain values upon selection
		this.cur_bchain = newBchain;
		this.transferType = newBchain;
		this.$store.dispatch('steemconnect/refreshUser');
		
		//fix chain data:
		let chainLnk = await this.setProperNode();
		this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		
		this.fetchUserData();
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
	  
	  renderUnstakingVals(){
		let unstakingToken = this.heTokenUnstakes.find(v => v.symbol == this.selTokenUp.symbol);
		if (unstakingToken){
			return this.$t('unstaking_details').replace('_QTTY_', unstakingToken.quantity)
			.replaceAll('_TOKEN_', unstakingToken.symbol)
			.replace('_TXLEFT_', unstakingToken.numberTransactionsLeft)
			.replace('_NXTDATE_', this.date(new Date(unstakingToken.nextTransactionTimestamp)))
			.replace('_TKNCOUNT_', unstakingToken.quantityLeft)
			
		}
		return '';
		
	  },
	  
	  adjustPowerDisplay(token, status){
		console.log('adjust for '+token+ 'to '+status)
		this.showPowerBreakdown[token.symbol]=status
		console.log(this.showPowerBreakdown);
		this.$forceUpdate();
	  },
	  powerDisplayOn(token){
		return this.showPowerBreakdown[token.symbol];
	  },
	  
	  /* for scrolling monitoring purposes */
	  handleIntersection(entries) {
		  entries.forEach(entry => {
			if (entry.isIntersecting) {
			  //console.log('Element is visible');
			  this.detailsViewable = true;
			  // Do something when the element is visible
			} else {
			  //console.log('Element is not visible');
			  this.detailsViewable = false;
			  // Do something when the element is not visible
			}
		  });
	  },
	  
	  renderToken (token) {
		//check small balances flag
		if (this.hide_small_balances && this.usdVal(token) < 1){
			return false;
		}
		//check show only tokens of interest flag
		if (!this.show_only_tokens_interest) return true;
		return this.show_only_tokens_interest && tokensOfInterest.includes(token.symbol)
	  },
	  
	  switchTokenDisplay() {
		this.show_only_tokens_interest=!this.show_only_tokens_interest
	  },
	  
	  switchHideSmall() {
		this.hide_small_balances = !this.hide_small_balances
	  },
	  async saveSettings (){
		this.save_progress = true;
		/*console.log(this.sel_node);
		console.log(this.testnet);
		console.log(this.chain_id);
		console.log(this.custom_node);
		console.log(this.custom_node_active);*/
		//return;
		try{
			if (!this.user_settings){
				this.user_settings = new Object();
			}
			this.user_settings['hide_small_balances'] = this.hide_small_balances;
			this.user_settings['show_only_tokens_interest'] = this.show_only_tokens_interest;
			
			
			if (this.isKeychainLogin || this.isHiveauthLogin){
				//in case of keychain login, broadcast to chain
				//broadcast the transaction to Steem BC
				let cstm_params = {
					required_auths: [],
					required_posting_auths: [this.user.account.name],
					id: 'actifit-settings',
					json: JSON.stringify(this.user_settings)
				  };
				console.log(this.stdLogin);
				
				let res = await this.processTrxFunc('custom_json', cstm_params);
				console.log('post keychain');
				console.log(res);
				
				if (res.success){
					//console.log(res.txID);
					let url = new URL(process.env.actiAppUrl + 'updateSettingsKeychain/'+res.txID+'/?user=' + this.user.account.name+'&operation='+JSON.stringify([['custom_json',cstm_params]]));
					
					let res2 = await fetch(url);
					let outcome = await res2.json();
					console.log(outcome);
					if (outcome.success){
						this.$notify({
						  group: 'success',
						  text: this.$t('successfully_updated_settings'),
						  position: 'top center'
						})
					}else{
						this.$notify({
						  group: 'error',
						  text: this.$t('error'),
						  position: 'top center'
						})
					}
				}else{
					this.$notify({
					  group: 'error',
					  text: this.$t('error'),
					  position: 'top center'
					})
				}
				
			}else{
				let url = new URL(process.env.actiAppUrl + 'updateSettings/?user=' + this.user.account.name+'&settings='+JSON.stringify(this.user_settings));
				//console.log(url);

				let accToken = localStorage.getItem('access_token')
				
				let reqHeads = new Headers({
				  'Content-Type': 'application/json',
				  'x-acti-token': 'Bearer ' + accToken,
				});
				let res = await fetch(url, {
					headers: reqHeads
				});
				let outcome = await res.json();
				//console.log(outcome);
				
				if (outcome.success){
					this.$notify({
					  group: 'success',
					  text: this.$t('successfully_updated_settings'),
					  position: 'top center'
					})
				}else{
					this.$notify({
					  group: 'error',
					  text: this.$t('error'),
					  position: 'top center'
					})
				}
			}
		}catch(err){
			console.log(err);
		}
		this.save_progress = false;
	  },
	  
	  /**
       * Scrolls down to content area.
       */
      scrollAction () {
		//only scroll if we cannot see details area
		if (!this.detailsViewable){
			VueScrollTo.scrollTo('#detailsArea', 1000, {easing: 'ease-in-out', offset: -50})
		}
      },
	  
	  showClaimableRewards() {
		//}else{
		  this.fundActivityMode = this.SHOW_CLAIMABLE_REW;
		//}
		//hide upper activity section
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  
	  getWalletAddress (){
		return this.bsc_wallet_address;
	  },
	  async getBalance() {
		console.log('>>getBalance');
		if (this.bsc_wallet_address == '') return;
		let result = await afitContract.methods.balanceOf(this.bsc_wallet_address).call(); // 29803630997051883414242659
		let format = web3.utils.fromWei(result); // 29803630.997051883414242659
		console.log(format);
		this.afitBalanceBSC = format;
		
		result = await afitxContract.methods.balanceOf(this.bsc_wallet_address).call(); // 29803630997051883414242659
		format = web3.utils.fromWei(result); // 29803630.997051883414242659
		//console.log(format);
		//console.log('end get balance');
		this.afitxBalanceBSC = format;
		
		result = await afitBNBLPContract.methods.balanceOf(this.bsc_wallet_address).call(); // 29803630997051883414242659
		format = web3.utils.fromWei(result); // 29803630.997051883414242659
		//console.log(format);
		//console.log('end get balance');
		this.afitBNBLPBalanceBSC = format;
		
		result = await afitxBNBLPContract.methods.balanceOf(this.bsc_wallet_address).call(); // 29803630997051883414242659
		format = web3.utils.fromWei(result); // 29803630.997051883414242659
		//console.log(format);
		//console.log('end get balance');
		this.afitxBNBLPBalanceBSC = format;
	  },
	  setUserWalletAddress (json){
		//console.log('setUserWalletAddress');
		//console.log(json);
		if (Array.isArray(json) && json.length>0){
			this.bsc_wallet_address = json[0].wallet;
		}else{
			console.log('error fetching wallet');
		}
		this.getBalance();
		//grab token count in wallet
	  },
	  setAirdropResults (json){
		this.airdropResults = json;
	  },
	  
	  async deleteWalletAddress () {
		//only reset if stored value is non-empty
		if (this.bsc_wallet_address != ''){
			let confirmPopup = confirm(this.$t('confirm_wallet_reset'));
			if (!confirmPopup){
				return;
			}
			let accToken = localStorage.getItem('access_token')
			
			let url = new URL(process.env.actiAppUrl + 'deleteUserWalletAddress/?user='+this.user.account.name);

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
				this.error_wallet = this.$t('error_resetting_wallet');
			}else{
				console.log('success');
				this.$refs['bsc-wallet-address'].value = '';
				this.$notify({
				  group: 'success',
				  text: this.$t('address_reset_successfully'),
				  position: 'top center'
				})
			}
		}
		if (this.$refs['bsc-wallet-address'].value == ''){
			this.$refs['bsc-wallet-address'].value = '';
		}
	  },
	  async updateWalletAddress (){
		//return this.bsc_wallet_address;
		this.error_wallet = '';
		
		if (this.$refs['bsc-wallet-address'].value == ''){
			this.error_wallet = this.$t('all_fields_required');
			return;
		}
		
		const accounts = await ethereum.request({
			method: 'eth_requestAccounts',
		});
		
		let contProc = false;
		const nonce = this.generatePassword(2);
		console.log('add');
		console.log(this.$refs['bsc-wallet-address'].value);
		try{
			let sign = await web3.eth.personal.sign(nonce, this.$refs['bsc-wallet-address'].value, "");
			//console.log(sign)
			
			//verify proper setup
			let accToken = localStorage.getItem('access_token')
			
			let url = new URL(process.env.actiAppUrl + 'verifySignBSCAdd/?user='+this.user.account.name+'&wallet='+this.$refs['bsc-wallet-address'].value+'&sign='+sign+'&nonce='+nonce);

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
				console.log('error');
				this.error_wallet = this.$t('error_saving_wallet');
				return;
			}else if (outcome.success){
				console.log('success. Next lets save');
				contProc = true;
				/*this.$notify({
				  group: 'success',
				  text: this.$t('address_successfully_stored'),
				  position: 'top center'
				})*/
			}
			
		}catch(err){
			console.log(err);
		}
		
		if (!contProc){
			this.error_wallet = this.$t('error_saving_wallet');
			return;
		}
		
		
		//grab token
		let accToken = localStorage.getItem('access_token')
		
		let url = new URL(process.env.actiAppUrl + 'storeUserWalletAddress/?user='+this.user.account.name+'&wallet='+this.$refs['bsc-wallet-address'].value);

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
			this.error_wallet = this.$t('error_saving_wallet');
		}else{
			console.log('success');
			this.$notify({
			  group: 'success',
			  text: this.$t('address_successfully_stored'),
			  position: 'top center'
			})
		}
	  },
	  async getPendingSavingsWithdrawals() {
		this.pendingSavingsWithdrawals = await hive.api.getSavingsWithdrawFromAsync(this.targetUserWallet);
		//console.log(this.pendingSavingsWithdrawals);
	  },
	  pendingSavingsWithdrawVal(cur){
		const sum = this.pendingSavingsWithdrawals.reduce((acc, obj) => {
		  if (obj.hasOwnProperty('amount') && obj.amount.includes(cur)) {
			const numericValue = parseFloat(obj.amount.split(' ')[0]);
			
			if (!isNaN(numericValue)) {
			  acc += numericValue;
			}
		  }
		  return acc;
		}, 0);
		if (sum > 0){
			return "(+"+sum+" "+cur+")";
		}
	  },
	  hasPendingHBDSavingsWithdrawals(){
		return this.pendingSavingsWithdrawals.some(obj => obj.hasOwnProperty('amount') && obj.amount.includes('HBD'));
	  },
	  hasPendingHiveSavingsWithdrawals(){
		return this.pendingSavingsWithdrawals.some(obj => obj.hasOwnProperty('amount') && obj.amount.includes('HIVE'));
	  },
	  renderTransAmount (nofrmt) {
		if (this.transferType == 'SBD' || this.transferType == 'HBD'){
			return this.renderSBDBalance(this.cur_bchain, nofrmt)
		}else{
			return this.renderBalance(this.cur_bchain, nofrmt) 
		}
	  },
	  showMaxBal (){
		console.log('showMaxBal');
		
		if (this.curTokenAction == this.POWERDOWN_FUNDS){
			console.log('POWERDOWN_FUNDS')
			return this.selTokenUp.stake
		}
		return this.selTokenUp.balance;
	  },
	  fillPowerupAmount (){
		this.$refs['powerup-amount'].value = parseFloat(this.user.account.balance);//this.renderBalance(this.cur_bchain, true);
	  },
	  fillPowerdownAmount (){
		this.$refs['powerdown-amount'].value = this.steemPower;//this.renderSteemPower(1);
	  },
	  fillDelegateAmount (){
		this.$refs['delegate-amount'].value = this.steemPower;//this.renderSteemPower(1);
	  },
	  fillTokenTransAmount (){
		if (this.curTokenAction == this.POWERDOWN_FUNDS){
			this.$refs['token-powerup-amount'].value = this.selTokenUp.stake
		}else{
			this.$refs['token-powerup-amount'].value = this.selTokenUp.balance;
		}
	  },
	  fillTransAmount (){
		this.$refs['transfer-amount'].value = this.renderTransAmount('1').split(' ')[0];
	  },
	  fillSavingsAmount () {
		if (this.transferType == this.cur_bchain){
			//HIVE CASE
			this.$refs['transfer-amount'].value = this.renderSavings(this.cur_bchain, 1).split(' ')[0];
		}else{
			this.$refs['transfer-amount'].value = this.renderSBDSavings(this.cur_bchain, 1).split(' ')[0];
		}
		console.log(this.renderSBDSavings(this.cur_bchain, 1))
		console.log(this.renderSavings(this.cur_bchain, 1))
	  },
	  renderSavingsAmount () {
		if (this.transferType == this.cur_bchain){
			//HIVE CASE
			return this.renderSavings(this.cur_bchain);
		}else{
			return this.renderSBDSavings(this.cur_bchain);
		}
	  },
	  resetTransAmount () {
		if (this.$refs['transfer-amount']){
			this.$refs['transfer-amount'].value = '';
		}
	  },
	  editDelegation(delegation){
		this.$refs['delegate-recipient'].value = delegation.delegatee;
		this.$refs['delegate-amount'].value = (delegation.power).toFixed(3);
	  },
	  cancelDelegation(delegation){
		this.$refs['delegate-recipient'].value = delegation.delegatee;
		this.$refs['delegate-amount'].value = 0;
		this.proceedDelegation(true);
	  },
	  editRCDelegation(delegation){
		this.$refs['delegate-recipient'].value = delegation.to;
		this.$refs['delegate-amount'].value = delegation.delegated_rc;
	  },
	  cancelRCDelegation(delegation){
		this.$refs['delegate-recipient'].value = delegation.to;
		this.$refs['delegate-amount'].value = 0;
		this.proceedRCDelegation(true);
	  },
	  //grab account delegations
	  async fetchDelegations(forceOpen){
		if (!forceOpen){
			this.delegateFunds();
		}
		let chainLnk = await this.setProperNode();
		this.loadingDeleg = true;
		let max_limit = 1000;
		//let max_date = new Date(2016, 1, 1, 0, 0, 0, 0);
		try{
			let delg = await chainLnk.api.getVestingDelegationsAsync(this.displayUserData.name, '', max_limit);
			//console.log(delg);
			if (Array.isArray(delg) && delg.length > 0){
				for (let i=0; i < delg.length; i++){
					delg[i].power = await this.vestsToSteemPower(delg[i].vesting_shares);
				}
			}
			this.activeDelegations = delg;
			//console.log('active delegations');
			//console.log(delg);
		}catch(err){
			console.log(err);
		}
		this.loadingDeleg = false;
		//this.scrollAction();
	  },
	  
	  //handles fetching new HF26 RC delegations
	  async fetchRCDelegations(forceOpen){
		if (!forceOpen){
			this.delegateRCs();
		}
		this.loadingDeleg = true;
		let max_limit = 1000;
		//let max_date = new Date(2016, 1, 1, 0, 0, 0, 0);
		//let delg = await chainLnk.api.getVestingDelegationsAsync(this.user.account.name, max_date, max_limit);
		let delg = await hive.api.callAsync('rc_api.list_rc_direct_delegations', {start:[this.displayUserData.name, ''], limit: 1000});
		//let delg;
		/*hive.api.call('rc_api.list_rc_direct_delegations', {start:[this.user.account.name, ''], limit: 1000}, function (err, result) {
            console.log(err, result);
        })*/
		this.activeRCDelegations = delg.rc_direct_delegations;
		
		for (let j=0;j<this.activeRCDelegations.length;j++){
			//console.log('store val');
			await this.getRCHF26 (this.activeRCDelegations[j].to);
		}
		//fetch RC count per user and allow rendering it
		
		
		//await this.fetchIncomingRCDelegations();
		//console.log(this.rcDelgArray);
		//console.log(this.rcDelgArray['vevita']);
		//this.$forceUpdate();
		this.loadingDeleg = false;
		//this.scrollAction();
   
	  },
	  /*
	  getRCHF26Mod(user){
		return new Promise(resolve => {
			let res = await hive.api.callAsync('rc_api.find_rc_accounts', {accounts: [this.user.account.name]});
			console.log(res);
			if (!user){
				this.rc_data = res.rc_accounts[0];
			}else{
				return res.rc_accounts[0].rc_manabar.current_mana;
			}
		}
		}catch(err){
			console.log(err);
		}
		});
	  },
	  */
	  showUserRC(type){
		if (type == 1){
			//show max RC
			return this.numberFormat(this.rc_data.max_rc, 3);
		}else if (type == 2){
			//show delegated RC
			return this.numberFormat(this.rc_data.delegated_rc, 3);
		}
		return this.numberFormat(this.rc_data.rc_manabar.current_mana, 3);
	  },
	  async getRCHF26(user){
		//console.log('get RCHF26');
		//only applies to HIVE
		try{
			if (this.cur_bchain == 'HIVE'){
			//return new Promise(resolve => {
				if (!user){
					let res = await hive.api.callAsync('rc_api.find_rc_accounts', {accounts: [this.displayUserData.name]});
					this.rc_data = res.rc_accounts[0];
				}else{
					let res = await hive.api.callAsync('rc_api.find_rc_accounts', {accounts: [user]});
					//console.log(res.rc_accounts[0].rc_manabar.current_mana);
					//return res.rc_accounts[0].rc_manabar.current_mana;
					this.rcDelgArray[user] = res.rc_accounts[0].rc_manabar.current_mana;
				}
			}
		}catch(err){
			console.log(err);
		}
    //});
	  },
	  renderRCVal(user){
		//console.log('renderRCVal:'+user);
		//console.log(this.rcDelgArray);
		//console.log(Array.isArray(this.rcDelgArray));
		//console.log(this.rcDelgArray.length);
		if (Array.isArray(this.rcDelgArray)){
			//console.log(this.rcDelgArray[user]);
			return this.rcDelgArray[user];
		}
		return '';
	  },
	  
	  //handles setting proper token to be staked
	  initiateStaking(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being staked
		if (this.selTokenUp == token && this.curTokenAction == this.POWERUP_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.fundActivityMode = 0;
		this.curTokenAction = this.POWERUP_FUNDS;
		this.selTokenUp = token;
		this.afitActivityMode = 0;
		this.scrollAction();
	  },
	  initiateUnStaking(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.POWERDOWN_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.fundActivityMode = 0;
		this.curTokenAction = this.POWERDOWN_FUNDS;
		this.selTokenUp = token;
		this.afitActivityMode = 0;
		this.scrollAction();
	  },
	  initiateDelegation(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.DELEGATE_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.fundActivityMode = 0;
		this.curTokenAction = this.DELEGATE_FUNDS;
		this.selTokenUp = token;
		this.afitActivityMode = 0;
		this.scrollAction();
	  },
	  initiateTransfer(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.TRANSFER_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.fundActivityMode = 0;
		this.curTokenAction = this.TRANSFER_FUNDS;
		this.selTokenUp = token;
		this.afitActivityMode = 0;
		this.scrollAction();
	  },
	  initiateBSCTransfer(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.TRANSFER_BSC){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.fundActivityMode = 0;
		this.curTokenAction = this.TRANSFER_BSC;
		this.selTokenUp = token;
		this.afitActivityMode = 0;
		this.scrollAction();
	  },
	  initiateWithdraw(token){
		//only adjust open/close is same button is clicked, otherwise adjust token being unstaked
		if (this.selTokenUp == token && this.curTokenAction == this.WITHDRAW_FUNDS){
			this.tokenActions = !this.tokenActions;
		}else{
			this.tokenActions = true;
		}
		this.fundActivityMode = 0;
		this.curTokenAction = this.WITHDRAW_FUNDS;
		this.selTokenUp = token;
		this.afitActivityMode = 0;
		this.scrollAction();
	  },
	  notifySwitchChain(){
		let notice = this.$t('notify_Switch_Chain_HE_Tokens');
		alert(notice);
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
		if (this.tokenMetrics.length > 0 || this.tokensOfInterestBal.length > 0){
		
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
			}else if (this.cur_bchain == 'BLURT'){
				baseCurrency = this.blurtPrice;
				peggedCurrencyUnit = '';
			}
			//get AFIT standard val
			let afitCoreVal = this.userTokensWallet * this.afitPrice / baseCurrency;
			//console.log(afitCoreVal);
			this.totalAccountValue += afitCoreVal;
			
			//console.log('this.afitBSCValueUSD:'+this.afitBSCValueUSD)
			//console.log('this.afitxBSCValueUSD:'+this.afitxBSCValueUSD)
			//add AFIT BSC and AFITX BSC
			this.totalAccountValue += (this.afitBSCValueUSD / baseCurrency);
			this.totalAccountValue += (this.afitxBSCValueUSD / baseCurrency);
			
			console.log(this.totalAccountValue);
			
			this.detailCalculation += this.userTokensWallet + ' AFIT x '+ this.numberFormat((this.afitPrice / baseCurrency), 4) + ' AFIT/'+this.cur_bchain+' = ' + this.numberFormat(afitCoreVal, 4) + ' '+this.cur_bchain+'<br/>';
			
			let par = this;
			//grab tokens of interest vals as well
			this.tokensOfInterestBal.forEach(function(token, index){
				par.showPowerBreakdown[token.symbol] = false;
				
				let tokenData = par.tokenMetrics.find(v => v.symbol == token.symbol);
				if( !tokenData || (typeof tokenData.lastPrice === 'undefined' || tokenData.lastPrice === null )){
					tokenData = new Object();
					tokenData.lastPrice = 1;
				}
				//console.log(token);
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
			let totSteem = parseFloat(this.displayUserData.balance) + parseFloat(this.steemPower);
			this.totalAccountValue += totSteem;
			
			this.detailCalculation += '(' + parseFloat(this.displayUserData.balance) + ' + ' + this.steemPower + ') '+this.cur_bchain+' x 1 = ' + this.numberFormat(totSteem, 4) + ' '+this.cur_bchain+'<br/>';
			
			//append SBD amount after conversion to STEEM
			if (this.cur_bchain == 'STEEM'){
				let sbd_val = (parseFloat(this.displayUserData.sbd_balance) * this.sbdPrice / baseCurrency);;
				this.totalAccountValue += sbd_val;
				this.detailCalculation += parseFloat(this.displayUserData.sbd_balance) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.sbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(sbd_val, 4) + ' '+this.cur_bchain+'<br/>';
			}else if (this.cur_bchain == 'BLURT'){
				//BLURT does not support pegged currency
				let sbd_val = 0;
				this.totalAccountValue += sbd_val;
				/*this.detailCalculation += parseFloat(this.user.account.sbd_balance) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.sbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(sbd_val, 4) + ' '+this.cur_bchain+'<br/>';*/
			}else{
				let sbd_val = (parseFloat(this.displayUserData.hbd_balance) * this.hbdPrice / baseCurrency);;
				this.totalAccountValue += sbd_val;
				this.detailCalculation += parseFloat(this.displayUserData.hbd_balance) + ' '+peggedCurrencyUnit+' x '+ this.numberFormat((this.hbdPrice / baseCurrency), 4) + ' '+peggedCurrencyUnit+'/'+this.cur_bchain+' = ' + this.numberFormat(sbd_val, 4) + ' '+this.cur_bchain+'<br/>';
			}
						

			//append claimable STEEM + SP
			/*
			let totClaimSteem = parseFloat(this.claimSP) + parseFloat(this.claimSTEEM); 
			console.log(totClaimSteem);
			this.totalAccountValue += totClaimSteem;
			
			this.detailCalculation += '(' + parseFloat(this.claimSTEEM) + ' + ' + parseFloat(this.claimSP) + ') '+this.cur_bchain+' x 1 = ' + this.numberFormat(totClaimSteem, 4) + ' '+this.cur_bchain+'<br/>';
			*/
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
			console.log(baseCurrency);
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
	  usdVal (token, nofrmt){
		if (this.tokenMetrics.length > 0){
			let tokenData = this.tokenMetrics.find(v => v.symbol == token.symbol);
			
			if (tokenData && tokenData.lastPrice){
				//console.log('stake:'+token.stake)
				let valueUSD = (parseFloat(token.balance) + parseFloat(token.stake)) * parseFloat(tokenData.lastPrice) * this.hivePrice;
				this.heTokenBalances[token.symbol] = valueUSD;
				//if (token.symbol == 'AFIT'){
					//console.log(token.symbol)
					//console.log(token.balance+ ' * ' + tokenData.lastPrice +' * ' + this.hivePrice + ' =' + token.balance * parseFloat(tokenData.lastPrice)) * this.hivePrice;
				//}
				if (nofrmt){
					return parseFloat(valueUSD);
				}
				return this.numberFormat(valueUSD.toFixed(3), 2)
			}else if (token.symbol == 'SWAP.HIVE'){
				console.log('swap.hive')
				//console.log(tokenData.lastPrice)
				let valueUSD = token.balance * this.hivePrice;
				this.heTokenBalances[token.symbol] = valueUSD;
				if (nofrmt){
					return parseFloat(valueUSD);
				}
				return this.numberFormat(valueUSD.toFixed(3), 2)
			}
			if (nofrmt){
				return 0;
			}
			return '';
		}
		if (nofrmt){
			return 0;
		}
		return '';
	  },
	  renderBalance (type, nofrmt) {
		if (nofrmt){
			return this.displayUserData.balance;
		}
		return this.numberFormat(parseFloat(this.displayUserData.balance), 3) + ' ' + type;
	  },
	  renderSBDBalance (type, nofrmt) {
		if (nofrmt){
			if (this.cur_bchain == 'STEEM'){
				return this.displayUserData.sbd_balance;
			}else{
				return this.displayUserData.hbd_balance;
			}
		}
		if (this.cur_bchain == 'STEEM'){
			return this.numberFormat(parseFloat(this.displayUserData.sbd_balance), 3) + ' ' + ((type == 'STEEM')?this.$t('SBD'):this.$t('HBD'));
		}else{
			return this.numberFormat(parseFloat(this.displayUserData.hbd_balance), 3) + ' ' + ((type == 'STEEM')?this.$t('SBD'):this.$t('HBD'));
		}
	  },
	  renderSavings (type, nofrmt) {
		if (nofrmt){
			//if (this.cur_bchain == 'STEEM'){
				return this.displayUserData.savings_balance;
			/*}else{
				return this.user.account.savings_hbd_balance;
			}*/
		}
		return this.numberFormat(parseFloat(this.displayUserData.savings_balance), 3) + ' ' + type;
	  },
	  renderSBDSavings (type, nofrmt) {
		if (nofrmt){
			if (this.cur_bchain == 'STEEM'){
				return this.displayUserData.savings_sbd_balance;
			}else{
				return this.displayUserData.savings_hbd_balance;
			}
		}
		if (this.cur_bchain == 'STEEM'){
			return this.numberFormat(parseFloat(this.displayUserData.savings_sbd_balance), 3) + ' ' + ((type == 'STEEM')?this.$t('SBD'):this.$t('HBD'));
		}else{
			return this.numberFormat(parseFloat(this.displayUserData.savings_hbd_balance), 3) + ' ' + ((type == 'STEEM')?this.$t('SBD'):this.$t('HBD'));
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
		if ((typeof this.user != 'undefined' && this.user != null)||this.displayUser!=''){	  
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
		  
		  //default
			if (!this.displayUserData){
				this.displayUserData = this.user.account;
			}
		  /*if (this.displayUser!=''){
			fetch(process.env.actiAppUrl+'user/' + this.displayUser).then(res => {
				res.json().then(json => this.userTokens = json.tokens)}).catch(e => console.log(e))
			 
		  }else{*/
			this.userTokensWallet = await this.$store.dispatch('fetchUserTokensReturn', this.displayUser, false)
			
		 // }
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchTransactions', this.displayUser)
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchReferrals')
		  this.fetchUserPendingRewards(this.targetUserWallet);
		  
		  //calculate savings params
		  try{
			this.cancluateSavingsRewardsParams();
		  }catch(error){
			console.log(error);
		  }
		  //let's check if user already has a funds pass set
		  fetch(process.env.actiAppUrl+'userHasFundsPassSet/'+this.displayUserData.name).then(
			res => {res.json().then(json => this.setUserPassStatus (json)).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //let's check if user has a pending AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'userHasPendingTokenSwap/'+this.displayUserData.name).then(
			res => {res.json().then(json => this.setUserTokenSwapStatus (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //let's grab the full queue of pending AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'getPendingTokenSwapTrans/').then(
			res => {res.json().then(json => this.setTokenSwapQueue (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //let's grab the user's history AFIT tokens exchange
		  fetch(process.env.actiAppUrl+'getUserTokenSwapHistory/'+this.displayUserData.name).then(
			res => {res.json().then(json => this.setUserTokenSwapHistory (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))

		  //let's grab the user's steem-engine tokens too
		  //Disable: EOL for S-E
		  /*
		  this.fetchTokenBalance();
		  
		  if (this.cur_bchain == 'STEEM'){
			  fetch(scot_steemengine_api+'@'+this.user.account.name).then(
				res => {res.json().then(json => this.setUserClaimableSETokens (json) ).catch(e => console.log(e))
			  }).catch(e => console.log(e))
		  
		  }else{
			  fetch(scot_steemengine_api+'@'+this.user.account.name+scot_hive_api_param).then(
				res => {res.json().then(json => this.setUserClaimableSETokens (json) ).catch(e => console.log(e))
			  }).catch(e => console.log(e))

		  }
		  */
		  
		  //grab user settings
		  fetch(process.env.actiAppUrl+'userSettings/'+this.displayUserData.name).then(
			res => {res.json().then(json => this.setUserSettings (json)).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //grab user pending withdrawals
		  this.getPendingSavingsWithdrawals();
		  
		  //let's grab the number of pending token swap transactions to see if we can add more
		  /*fetch(process.env.actiAppUrl+'getPendingTokenSwapTransCount').then(
			res => {res.json().then(json => this.pendingTokenSwapTransCount = json ).catch(e => console.log(e))
		  }).catch(e => console.log(e))*/
		  		  
		  //grab SP
		  this.steemPower = await this.vestsToSteemPower(this.displayUserData.vesting_shares);
		  console.log(this.steemPower );
		  //grab Delegated SP
		  this.delegatedSteemPower = await this.vestsToSteemPower(this.displayUserData.delegated_vesting_shares);
		  console.log(this.delegatedSteemPower );
		  //grab received SP
		  this.receivedSteemPower = await this.vestsToSteemPower(this.displayUserData.received_vesting_shares);
		  console.log(this.receivedSteemPower );
		  //grab powerdown SP
		  this.powerDownRateVal = await this.vestsToSteemPower(this.displayUserData.vesting_withdraw_rate.split(' ')[0]);
		  console.log(this.powerDownRateVal );
		  //grab next power down withdrawal date
		  this.powerDownWithdrawDate = this.date(this.displayUserData.next_vesting_withdrawal);
		console.log(this.powerDownWithdrawDate );
		  //effective SP
		  this.effectiveSteemPower = this.steemPower + this.receivedSteemPower - this.delegatedSteemPower - this.powerDownRateVal;
		
		  //also update claimable amounts
		  this.claimableSTEEMRewards();
		  
		   
		  //fetch user's AFIT S-E balance
		  //disable: EOL for S-E
		  //this.fetchAFITSE();
		  
		  //fetch user's AFIT H-E balance
		  
		  this.fetchAFITHE();
		  
		  
		  //fetch user's AFITX S-E balance
		  //disable: EOL for S-E
		  //this.fetchAFITXSE();
		  
		  //fetch user's AFITX H-E balance
		  this.fetchAFITXHE();
		  
		  //fetch user's AFITX Rank
		   fetch(process.env.actiAppUrl+'afitxData/'+this.displayUserData.name).then(
			res => {res.json().then(json => this.userAFITXRank = json.ind ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  
		  //fetch user's tokensOfInterest S-E balance
		  let tokenData, tokenExtraDetails
		  /*if (this.cur_bchain == 'STEEM'){
			tokenData = await ssc.find('tokens', 'balances', { account: this.user.account.name, symbol : { '$in' : tokensOfInterest } });
			
			//grab full token data
			tokenExtraDetails = await ssc.find('tokens', 'tokens', { symbol : { '$in' : tokensOfInterest } });
		  }else{*/
			
			/*
			OLD specific token listing
			tokenData = await hsc.find('tokens', 'balances', { account: this.user.account.name, symbol : { '$in' : tokensOfInterest } });

			//grab full token data
			tokenExtraDetails = await hsc.find('tokens', 'tokens', { symbol : { '$in' : tokensOfInterest } });
			*/
			
			//new full token balance listing
			tokenData = await hsc.find('tokens', 'balances', { account: this.displayUserData.name});
			
			this.heTokenDelegations = await hsc.find('tokens', 'delegations', { from: this.displayUserData.name}, 200, 0, []);
			
			this.heTokenUnstakes = await hsc.find('tokens', 'pendingUnstakes', { account: this.displayUserData.name}, 200, 0, []);
			//console.log('delegations')
			console.log('unstakes');
			console.log(this.heTokenUnstakes);
			
			//grab full token data
			tokenExtraDetails = await hsc.find('tokens', 'tokens', {});
			
		  //}
		  
		  //console.log(tokenExtraDetails);
		  
		  //loop through tokenData and set proper icon
		  for (let x=0;x<tokenData.length;x++){
			try{
				//console.log(tokenData[x].symbol);
				let matchEntry = tokenExtraDetails.find(v => v.symbol == tokenData[x].symbol);
				//console.log(matchEntry);
				tokenData[x].icon = JSON.parse(matchEntry.metadata).icon
				//console.log(tokenData[x].icon);
			}catch(parseErr){
				console.log(parseErr);
			}
		  }
		  
		  let afitData = this.tokenMetrics.find(v => v.symbol == 'AFIT');
		  
		  //console.log('tokenData')
		  //console.log(tokenData)
		  
		  if (tokenData){
			this.tokensOfInterestBal = tokenData;
			await this.sortTokenData(this.tokenSort, true);
		  }
		  
		  //fetch tokens' data (price et al)
		  /*if (this.cur_bchain == 'STEEM'){
			this.tokenMetrics = await ssc.find('market', 'metrics', {symbol : { '$in' : tokensOfInterest.concat(['AFIT','AFITX']) }}, 1000, 0, '', false);	  
		  }else{*/
		  
		  //build up a list of the user's current tokenlist
		  //this.userTokenList = tokenData.map((obj) => obj.symbol);
		  
		  //this.tokenMetrics = await hsc.find('market', 'metrics', {symbol : { '$in' : tokensOfInterest.concat(['AFIT','AFITX']) }}, 1000, 0, '', false);	
		  
		  //extract prices for all user balances
		  this.tokenMetrics = await hsc.find('market', 'metrics', {}, 1000, 0, '', false);	
		  //}
		  
		  
		  //console.log('tokenMetrics');
		  //console.log(this.tokenMetrics);
		  
		  //let's grab the user's wallet address
		  fetch(process.env.actiAppUrl+'getUserWalletAddress?user='+this.displayUserData.name).then(
			res => {res.json().then(json => this.setUserWalletAddress (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //grab user airdrop results
		  fetch(process.env.actiAppUrl+'airdropResults?user='+this.displayUserData.name).then(
			res => {res.json().then(json => this.setAirdropResults (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  
		  //check if user is powering down AFIT to SE
		  fetch(process.env.actiAppUrl+'isPoweringDown/'+this.displayUserData.name).then(
			res => {res.json().then(json => this.setUserPDAfitStatus (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //grab list of top 25 AFITX token holders
		  fetch(process.env.actiAppUrl+'topAFITXHolders/?count=25').then(
			res => {res.json().then(json => this.topAFITXHolders = json ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //grab list of top 100 AFITX token holders
		  fetch(process.env.actiAppUrl+'topAFITXHolders/?count=100').then(
			res => {res.json().then(json => this.afitxHoldersList = json ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //grab list of top 100 AFIT token holders
		  fetch(process.env.actiAppUrl+'topAFITHolders/?count=100').then(
			res => {res.json().then(json => this.afitHoldersList = json ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		  
		  //fetch account RC
		  
		  this.getRCHF26();
		  
		  //force refresh data
		  //this.$forceUpdate();
		  
		  
		}
	  },
	  async sortTokenData (type, keepDir) {
		//sort alpha / default
		this.tokenSort = type;
		if (keepDir){
			//
		}else{ 
			this.tsortDir *= -1;
		}
		let upRef = this;
		this.tokensOfInterestBal = this.tokensOfInterestBal.sort(function tokenEntry(a, b) {
			if (type=='balance'){
				return parseFloat(b[type]) < parseFloat(a[type]) ? -1 * upRef.tsortDir
					: parseFloat(b[type]) > parseFloat(a[type]) ? upRef.tsortDir
					: 0;
				
			}else if (type == 'usdval'){
				return upRef.usdVal(b, true) < upRef.usdVal(a, true) ? -1 * upRef.tsortDir
					: upRef.usdVal(b, true) > upRef.usdVal(a, true) ? upRef.tsortDir
					: 0;
			}
			return b[type] < a[type] ?  -1 * upRef.tsortDir
					: b[type] > a[type] ? upRef.tsortDir
					: 0;
		});
	  },
	  async setPendingRewards(json){
		this.pendingRewards = json;
		console.log(this.pendingRewards);
		if (this.pendingRewards.pendingRewards.HIVE || this.pendingRewards.pendingRewards.STEEM || this.pendingRewards.pendingRewards.BLURT){
			console.log('got results');
			console.log(this.pendingRewards);
		}
	  },
	  fetchUserPendingRewards (tgtUser) {
		//let's check if user already has a funds pass set
		
		  fetch(process.env.actiAppUrl+'pendingRewards/?user='+tgtUser).then(
			res => {res.json().then(json => this.setPendingRewards(json)).catch(e => console.log(e))
		  }).catch(e => console.log(e))
	  },
	  async fetchAFITSE() {
		try{
		let bal = await ssc.findOne('tokens', 'balances', { account: this.displayUserData.name, symbol: 'AFIT' });
		  
		  if (bal){
			  this.afit_se_balance = bal.balance;
			  
			  //if this operation relates to powering up AFIT from S-E, need to also initiate call to adjust AFIT token count
			  if (this.$route.query.confirm_trans == 1){
				
				let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.user.name+'&bchain='+this.cur_bchain);
				//connect with our service to confirm AFIT received to proper wallet
				try{
					
					fetch(url).then(
					  res => {res.json().then(json => this.setUserAddedTokens(json)).catch(e => console.log(e))
					}).catch(e => console.log(e))
					
				
				}catch(err){
					console.error(err);
					//this.checkingFunds = false;
				}
			  }
		  }
		}catch(outErr){
			console.log(outErr);
		}
	  },
	  async fetchAFITHE() {
		  let bal = await hsc.findOne('tokens', 'balances', { account: this.displayUserData.name, symbol: 'AFIT' });
		  if (bal){
			  this.afit_he_balance = bal.balance;
		  }
	  },
	  fetchAFITXSE() {
		try{
		  console.log('fetch AFITX SE');
		  let parnt = this
		  ssc.findOne('tokens', 'balances', { account: this.displayUserData.name, symbol: 'AFITX' }).then(
				function(bal) {
					console.log('>>bal')
					console.log(bal);
					
					if (bal){
						  parnt.afitx_se_balance = bal.balance;
					  }
				}
			)
		}catch(outErr){
			console.log(outErr);
		}
	  },
	  fetchAFITXHE() {
		  let parnt = this
		  hsc.findOne('tokens', 'balances', { account: this.displayUserData.name, symbol: 'AFITX' }).then(
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
	  setAFITBSCPrice (_afitPrice){
		this.afitBSCPrice = parseFloat(_afitPrice).toFixed(6);
		console.log('afitBSCPrice'+this.afitBSCPrice);
	  },
	  setAFITXBSCPrice (_afitxPrice){
		this.afitxBSCPrice = parseFloat(_afitxPrice).toFixed(6);
		console.log('afitxBSCPrice'+this.afitxBSCPrice);
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
			if (entryList[i].user === this.displayUserData.name){
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
	  renderStake (token, type) {
		try{
			let totalStaked = 0;
			let prec = this.tokenOfInterestPrecision[token.symbol];
			if (type){
				switch (type){
					case 1: return this.numberFormat(parseFloat(token.stake), prec);
					case 2: return this.numberFormat(parseFloat(token.delegationsIn), prec);
					case 3: return this.numberFormat(parseFloat(token.pendingUnstake), prec);
					case 4: return this.numberFormat(parseFloat(token.delegationsOut), prec);
				}
			}
			totalStaked += parseFloat(token.delegationsIn) + parseFloat(token.stake) + parseFloat(token.delegationsOut);
			return this.numberFormat(totalStaked, prec);
		}catch(err){
			console.log(err);
			return '';
		}
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
	  setUserSettings (result){
		//console.log('fetched user settings');
		//console.log(result)
		if (result && result.settings){
			let val = result.settings
			console.log(val)
			this.user_settings = val;
			if (val.show_only_tokens_interest !== undefined || val.hide_small_balances !== undefined){
				this.hide_small_balances = val.hide_small_balances;
				this.show_only_tokens_interest = val.show_only_tokens_interest;
				this.settings_set = true;
			}
		}
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
		}else if (this.cur_bchain == 'BLURT'){
			let totalSteem = Number(this.properties.total_vesting_fund_blurt.split(' ')[0]);
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
		}else if (this.cur_bchain == 'BLURT'){
			let totalSteem = Number(this.properties.total_vesting_fund_blurt.split(' ')[0]);
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
		if ((typeof this.user != 'undefined' && this.user != null)|| this.displayUserData !=''){
		  
		  this.claimVests = this.displayUserData.reward_vesting_balance;
		  if (this.cur_bchain=='HIVE'){
			this.claimSTEEM = this.displayUserData.reward_hive_balance;
			this.claimSP = this.displayUserData.reward_vesting_hive + " POWER";
			this.claimSTEEM = this.claimSTEEM.replace('STEEM','HIVE');
			this.claimSBD = this.displayUserData.reward_hbd_balance;
		  }else if (this.cur_bchain == 'STEEM'){
			this.claimSTEEM = this.displayUserData.reward_steem_balance;
			this.claimSP = this.displayUserData.reward_vesting_steem + " POWER";
			this.claimSBD = this.displayUserData.reward_sbd_balance;
		  }else if (this.cur_bchain == 'BLURT'){
			this.claimSTEEM = this.displayUserData.reward_blurt_balance;
			this.claimSP = this.displayUserData.reward_vesting_blurt + " POWER";
			this.claimSBD = 0;
		  }
		  console.log('claimable rewards'+(this.claimSP + this.claimSTEEM + this.claimSBD));
		  return this.claimSP + this.claimSTEEM + this.claimSBD;
		}
		return '';
	  },
	  
	  async cancluateSavingsRewardsParams(){
		//current interest rate set by witnesses
		if (this.properties == ''){
		  //not loaded yet
		  let chainLnk = await this.setProperNode ();
		  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
		}
		const hbdInterestRate = this.properties.hbd_interest_rate;
		
		this.hbdInterestRate = hbdInterestRate;
		console.log(this.properties);
		console.log('hbdInterestRate:'+hbdInterestRate);
		
		const lastIPaymentRelative =
		  this.displayUserData.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
			? null
			: this.$dateToFullRelative(this.displayUserData.savings_hbd_last_interest_payment);
			
		this.lastIPaymentRelative = lastIPaymentRelative;
		const lastIPaymentDiff = this.$dayDiff(
		  this.displayUserData.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
			? this.displayUserData.savings_hbd_seconds_last_update
			: this.displayUserData.savings_hbd_last_interest_payment
		);
		
		//720hrs=30 days
		const remainingHours =
		  720 -
		  this.$hourDiff(
			this.displayUserData.savings_hbd_last_interest_payment == "1970-01-01T00:00:00"
			  ? this.displayUserData.savings_hbd_seconds_last_update
			  : this.displayUserData.savings_hbd_last_interest_payment
		  );
		console.log('remaininghours:'+remainingHours);
		this.remainingHours = remainingHours;
		
		const secondsSincePayment = this.$secondDiff(this.displayUserData.savings_hbd_seconds_last_update);
		console.log('secondsSincePayment :'+secondsSincePayment )
		const pendingSeconds = parseFloat(this.displayUserData.savings_hbd_balance) * secondsSincePayment;
		console.log('pendingSeconds :'+pendingSeconds )
		const secondsToEstimate = this.displayUserData.savings_hbd_seconds / 1000 + pendingSeconds;
		console.log('secondsToEstimate :'+secondsToEstimate )
		const estimatedUIn = (secondsToEstimate / (60 * 60 * 24 * 365)) * (this.hbdInterestRate / 10000);
		console.log('last payment made:'+lastIPaymentRelative)
		const estimatedInterest = this.numberFormat(estimatedUIn, 3);
		console.log('estimatedInterest :$'+estimatedInterest )
		this.estimatedInterest = estimatedInterest;
		const remainingDays = 30 - lastIPaymentDiff;
		console.log('remainingDays :'+remainingDays )
		this.remainingDays = remainingDays;
	  },
	  
	  
	  async claimSavingsRewards (){
		
		//check if we need active key
		if (!this.isKeychainLogin && !this.isHiveauthLogin &&  this.isStdLogin){
			//check for active key
			if (this.$refs["claim-savings-rew-act-key"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
			/*let confirmPopup = confirm(this.$t('confirm_cancel_withdraw'));
			if (!confirmPopup){
				return;
			}*/
		}
		
		//to claim rewards, need to issue 2 ops, transfer + cancel transfer
		let request_id = Math.floor(Date.now() / 1000)//timestamp
		let opname = 'transfer_from_savings';
		let	params = {
			"from": this.user.account.name,
			"to": this.user.account.name,
			"request_id": request_id,//timestamp
			"amount": parseFloat("0.001").toFixed(3)+' HBD',
			"memo": this.$t('claim_rewards_trx'),
		};
		let opname2 = 'cancel_transfer_from_savings';
		let	params2 = {
			"from": this.user.account.name,
			"request_id": request_id
		};
		this.claiming_rewards = true;
		let res;
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
		
			res = await hive.broadcast.sendAsync( 
			   { operations: [[opname, params], [opname2, params2]], extensions: [] }, 
			   { active: this.$refs["claim-savings-rew-act-key"].value }).catch(err => {
				console.log(err);
			   });
		}else{
			res = await this.processTrxFunc(opname, params, true, opname2, params2);
		}
		console.log(res);
		this.confirmCompletion('claimrewards', 0, res);
		
		this.claiming_rewards = false;
		/*let res = await this.processTrxFunc('custom_json', cstm_params);
		const rid = new Date().getTime() >>> 0;
		  const op: Operation = [
			"transfer_from_savings",
			{
			  from,
			  to,
			  amount,
			  memo,
			  request_id: rid
			}
		  ];
		  const cop: Operation = [
			"cancel_transfer_from_savings",
			{
			  from,
			  request_id: rid
			}
		  ];
		*/
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
			res => {res.json().then(json => this.setSETokensPrecision (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		}else{
		  fetch(scot_steemengine_api+'info'+scot_hive_api_param).then(
			res => {res.json().then(json => this.setSETokensPrecision (json) ).catch(e => console.log(e))
		  }).catch(e => console.log(e))
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
			}else if (this.cur_bchain == 'BLURT') {
				cstm_params = {
					"account": this.user.account.name,
					"reward_blurt": this.claimSTEEM,
					//"reward_hbd": this.claimSBD,
					"reward_vests": this.claimVests
				};
			}
			let res = await this.processTrxFunc('claim_reward_balance', cstm_params);
			
			if (res.success){
				this.confirmCompletion('claimrewards', 0, res);
			}
			/*steem.broadcast.claimRewardBalanceAsync(this.user.account.name,this.claimSTEEM, this.claimSBD, this.claimSP).then(
				res => ).catch(err=>console.log(err));*/
		}
	  },
	  transferToSavings (cur) {
		this.fundActivityMode = this.TRANSFER_FUNDS_SAVINGS;
		this.transferType = cur;
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  transferFromSavings (cur){
		this.fundActivityMode = this.REMOVE_FUNDS_SAVINGS;
		this.transferType = cur;
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  transferFunds (cur) {
		//function handles opening/closing transfer section
		
		//set proper Fund Activity Mode controlling the display
		//if (this.fundActivityMode == this.TRANSFER_FUNDS ){
		//  this.fundActivityMode = 0;
		//}else{
		  this.fundActivityMode = this.TRANSFER_FUNDS;
		  //this.$refs['transfer-type'].value = cur;
		  this.transferType = cur;
		//}
		//hide upper activity section
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  powerUpFunds () {
		//function handles opening/closing of power up section
		
		//set proper Fund Activity Mode controlling the display
		//if (this.fundActivityMode == this.POWERUP_FUNDS ){
		//  this.fundActivityMode = 0;
		//}else{
		  this.fundActivityMode = this.POWERUP_FUNDS;
		//}
		//hide upper activity section
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  powerDownFunds () {
		//function handles opening/closing of power up section
		
		//set proper Fund Activity Mode controlling the display
		//if (this.fundActivityMode == this.POWERDOWN_FUNDS ){
		//  this.fundActivityMode = 0;
		//}else{
		  this.fundActivityMode = this.POWERDOWN_FUNDS;
		//}
		//hide upper activity section
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  delegateFunds () {
		//function handles opening/closing of delegation section
		
		//set proper Fund Activity Mode controlling the display
		//if (this.fundActivityMode == this.DELEGATE_FUNDS ){
		//  this.fundActivityMode = 0;
		//}else{
		  this.fundActivityMode = this.DELEGATE_FUNDS;
		//}
		//hide upper activity section
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  showBSCAddress (){
		  this.fundActivityMode = 0;
		//}
		//hide upper activity section
		this.afitActivityMode = this.showBSCDetails;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  delegateRCs () {
		//function handles opening/closing of RC delegation section
		
		//set proper Fund Activity Mode controlling the display
		//if (this.fundActivityMode == this.DELEGATE_RCS ){
		//  this.fundActivityMode = 0;
		//}else{
		  this.fundActivityMode = this.DELEGATE_RCS;
		//}
		//hide upper activity section
		this.afitActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  async cancelSavingsWithdrawal (request_id){
		if (!this.isKeychainLogin && !this.isHiveauthLogin &&  this.isStdLogin){
			//check for active key
			if (this.$refs["cancel-withdraw-act-key"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  return;
			}
			let confirmPopup = confirm(this.$t('confirm_cancel_withdraw'));
			if (!confirmPopup){
				return;
			}
		}
		
		this.error_proceeding = false;
		this.error_msg = '';
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
		}else if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) || 
			(localStorage.getItem('acti_login_method') == 'hiveauth')){	
			console.log(this.transferType);
			console.log('>>pop')
			/*return new Promise((resolve) => {
				window.hive_keychain.requestTransfer(this.user.account.name, this.$refs["transfer-recipient"].value, parseFloat(this.$refs["transfer-amount"].value).toFixed(3),this.$refs["transfer-memo"].value,this.transferType,(response) => {
				  console.log(response);
				  this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, response)
				}, true);
			});	*/
			let opname = 'cancel_transfer_from_savings';
			let	params = {
					"from": this.user.account.name,
					"request_id": request_id
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('cancel-savings-withdraw', '', res)
			}
			
		}else{
			this.transferProcess = true;
			let chainLnk = await this.setProperNode ();
			
			console.log(this.transferType)
			//return;
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.cancelTransferFromSavingsAsync(this.$refs["cancel-withdraw-act-key"].value, this.user.account.name, //from
			request_id
			).then(
				res => this.confirmCompletion('cancel-savings-withdraw', this.$refs["transfer-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  async proceedRemoveSavings () {
		//console.log(this.user.account);
		//function handles sending to savings
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
			let confirmPopup = confirm(this.$t('confirm_transfer'));
			if (!confirmPopup){
				return;
			}
		}
		
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["transfer-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		if (isNaN(this.$refs["transfer-amount"].value.trim()) || this.$refs["transfer-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)||
				(localStorage.getItem('acti_login_method') == 'hiveauth')){	
			console.log(this.transferType);
			console.log('>>pop')
			/*return new Promise((resolve) => {
				window.hive_keychain.requestTransfer(this.user.account.name, this.$refs["transfer-recipient"].value, parseFloat(this.$refs["transfer-amount"].value).toFixed(3),this.$refs["transfer-memo"].value,this.transferType,(response) => {
				  console.log(response);
				  this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, response)
				}, true);
			});	*/
			let opname = 'transfer_from_savings';
			let	params = {
					"from": this.user.account.name,
					"to": this.user.account.name,
					"request_id": Math.floor(Date.now() / 1000),//timestamp
					"amount": parseFloat(this.$refs["transfer-amount"].value).toFixed(3)+' '+this.transferType,
					"memo": this.$refs["transfer-memo"].value
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, res)
			}
			
		}else{
			this.transferProcess = true;
			let chainLnk = await this.setProperNode ();
			
			console.log(this.transferType)
			//return;
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferFromSavingsAsync(this.$refs["p-ac-key-trans"].value, this.user.account.name, //from
			Math.floor(Date.now() / 1000),//timestamp
			this.user.account.name, 
			parseFloat(this.$refs["transfer-amount"].value).toFixed(3) + ' ' + this.transferType, 
			this.$refs["transfer-memo"].value).then(
				res => this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  async proceedTransferSavings () {
		//function handles sending to savings
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
			let confirmPopup = confirm(this.$t('confirm_transfer'));
			if (!confirmPopup){
				return;
			}
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
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)||
				(localStorage.getItem('acti_login_method') == 'hiveauth')){	
			console.log(this.transferType);
			console.log('>>pop')
			/*return new Promise((resolve) => {
				window.hive_keychain.requestTransfer(this.user.account.name, this.$refs["transfer-recipient"].value, parseFloat(this.$refs["transfer-amount"].value).toFixed(3),this.$refs["transfer-memo"].value,this.transferType,(response) => {
				  console.log(response);
				  this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, response)
				}, true);
			});	*/
			let opname = 'transfer_to_savings';
			let	params = {
					"from": this.user.account.name,
					"to": this.$refs["transfer-recipient"].value,
					"amount": parseFloat(this.$refs["transfer-amount"].value).toFixed(3)+' '+this.transferType,
					"memo": this.$refs["transfer-memo"].value
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, res)
			}
			
		}else{
			this.transferProcess = true;
			let chainLnk = await this.setProperNode ();
			
			console.log(this.transferType)
			//return;
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferToSavingsAsync(this.$refs["p-ac-key-trans"].value, this.user.account.name, this.$refs["transfer-recipient"].value, parseFloat(this.$refs["transfer-amount"].value).toFixed(3) + ' ' + this.transferType, this.$refs["transfer-memo"].value).then(
				res => this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  
	  async proceedTransfer () {
		//function handles the actual processing of the transfer
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
			let confirmPopup = confirm(this.$t('confirm_transfer'));
			if (!confirmPopup){
				return;
			}
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
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)){
			console.log(this.transferType);
			console.log('>>pop')
			return new Promise((resolve) => {
				window.hive_keychain.requestTransfer(this.user.account.name, this.$refs["transfer-recipient"].value, parseFloat(this.$refs["transfer-amount"].value).toFixed(3),this.$refs["transfer-memo"].value,this.transferType,(response) => {
				  console.log(response);
				  this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, response)
				}, true);
			});	
		}else if (this.isHiveauthLogin){
			let opname = 'transfer';
			let	params = {
					"from": this.user.account.name,
					"to": this.$refs["transfer-recipient"].value,
					"amount": parseFloat(this.$refs["transfer-amount"].value).toFixed(3)+' '+this.transferType,
					"memo": this.$refs["transfer-memo"].value
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('transfer', this.$refs["transfer-amount"].value, res)
			}
		}else{
			this.transferProcess = true;
			let chainLnk = await this.setProperNode ();
			
			console.log(this.transferType)
			//return;
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
	  calculateHBDAmount (e) {
		//only call upon it if transfer AFIT to BSC and calculate needed HBD amount
		if (this.curTokenAction == this.TRANSFER_BSC){
			let afitVal = this.$refs['token-powerup-amount'].value.trim()
			let hbdVal = this.$refs['token-hbd-amount'].value.trim()
			let matchHbd = parseFloat(afitVal) * this.afitHBDRate;
			matchHbd = parseFloat(matchHbd.toFixed(2));
			if (matchHbd < 0.1) matchHbd = 0.1;
			this.$refs['token-hbd-amount'].value = matchHbd;
		}
		/*if (isNaN(hbdVal) || this.$refs["token-powerup-amount"].value == 0){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('amount_positive_int');
		  return;
		}
		console.log(afitVal)
		console.log(hbdVal)*/
		
	  },
	  async proceedPowerUp () {
		//function handles the actual processing of the power up
		if (!this.isKeychainLogin && !this.isHiveauthLogin){
			let confirmPopup = confirm(this.$t('confirm_power_up'));
			if (!confirmPopup){
				return;
			}
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
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestPowerUp(this.user.account.name, this.user.account.name, parseFloat(this.$refs["powerup-amount"].value).toFixed(3), (response) => {
					console.log(response);
					this.confirmCompletion('powerup', this.$refs["powerup-amount"].value, response)
				});
			});		
		}else if (this.isHiveauthLogin){
			let opname = 'transfer_to_vesting';
			let	params = {
					"from": this.user.account.name,
					"to": this.user.account.name,
					"amount": parseFloat(this.$refs["powerup-amount"].value).toFixed(3)+' '+this.transferType
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('powerup', this.$refs["powerup-amount"].value, res)
			}
		}else{
			this.powerUpProcess = true;
			let chainLnk = await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferToVestingAsync(this.$refs["p-ac-key-up"].value, this.user.account.name, this.user.account.name, parseFloat(this.$refs["powerup-amount"].value).toFixed(3) + ' ' + this.cur_bchain ).then(
				res => this.confirmCompletion('powerup', this.$refs["powerup-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  
	  async proceedDelegation (cancellation) {
		//function handles the actual processing of delegation
		let note = this.$t('confirm_delegation')
		if (cancellation == true){
			note = this.$t('confirm_delegation_cancel')
		}
		let confirmPopup = confirm(note);
		
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
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestDelegation(this.user.account.name, this.$refs["delegate-recipient"].value.trim(), parseFloat(this.$refs["delegate-amount"].value).toFixed(3), 'HP', (response) => {
					console.log(response);
					this.confirmCompletion('delegate', this.$refs["delegate-amount"].value, response)
				});
			});			
		}else if (this.isHiveauthLogin){
			let vestsValue = await this.steemPowerToVests(this.$refs["delegate-amount"].value);
			let opname = 'delegate_vesting_shares';
			let	params = {
					"delegator": this.user.account.name,
					"delegatee": this.$refs["delegate-recipient"].value.trim(),
					"vesting_shares": vestsValue+' '+'VESTS'
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('delegate', this.$refs["delegate-amount"].value, res)
			}
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
	  
	  async proceedRCDelegation(cancellation){
		let note = this.$t('confirm_rc_delegation')
		if (cancellation==true){
			note = this.$t('confirm_rc_delegation_cancel')
		}
		let confirmPopup = confirm(note);
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
		
		if (isNaN(this.$refs["delegate-amount"].value.trim())){
			this.error_proceeding = true;
			this.error_msg = this.$t('amount_positive_int');
			return;
		}
		
		
		if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)||
			(localStorage.getItem('acti_login_method') == 'hiveauth')){	
			const op_name = 'custom_json';
			//['delegate_rc', {
			const json_data = JSON.stringify(['delegate_rc', { 
					from: this.user.account.name,
					delegatees: [this.$refs["delegate-recipient"].value.trim()],
					max_rc: this.$refs["delegate-amount"].value.trim()
				}]);
				//}]);
			const transId = 'rc';
			const cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: transId,
				json: json_data
			}
			/*
			let operation = [ 
			   [op_name, cstm_params]
			];*/
			
			let res = await this.processTrxFunc(op_name, cstm_params);
		
			console.log('trx status:'+res.success);
			if (res.success){
				//success
				this.$notify({
				  group: 'success',
				  text: this.$t('rc_delegation_success'),
				  position: 'top center'
				});
				//update RC delegations
				this.fetchRCDelegations(true);
			}else{
				//error
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
			}
			
		}else{
		
			let accToken = localStorage.getItem('access_token')
				
			//chain not needed, as only supported by hive
			//let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'');
			
			
			this.delegateProcess = true;
			let url = new URL(process.env.actiAppUrl + 'delegateRC/?user='+this.user.account.name+'&delegatees='+this.$refs["delegate-recipient"].value.trim()+'&max_rc='+this.$refs["delegate-amount"].value.trim());
		
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.id && outcome.ref_block_num){
				//success
				this.$notify({
				  group: 'success',
				  text: this.$t('rc_delegation_success'),
				  position: 'top center'
				});
				//update RC delegations
				this.fetchRCDelegations(true);
			}else{
				//error
				this.$notify({
				  group: 'error',
				  text: this.$t('error_performing_operation'),
				  position: 'top center'
				})
			}
			this.delegateProcess = false;
		}
	  },
	  
	  async proceedPowerDown () {
		//function handles the actual processing of the power down
		if (!this.isKeychainLogin && !this.isHiveauthLogin){
			let confirmPopup = confirm(this.$t('confirm_power_down'));
			if (!confirmPopup){
				return;
			}
		}
		this.error_proceeding = false;
		this.error_msg = '';
		//ensure we have proper values
		if (this.$refs["powerdown-amount"].value.trim() == ''){
		  this.error_proceeding = true;
		  this.error_msg = this.$t('all_fields_required');
		  return;
		}
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestPowerDown(this.user.account.name, parseFloat(this.$refs["powerdown-amount"].value).toFixed(3), (response) => {
					console.log(response);
					this.confirmCompletion('powerdown', this.$refs["powerdown-amount"].value, response)
				});
			});		
		}else if (this.isHiveauthLogin){
			let opname = 'withdraw_vesting';
			let	params = {
					"account": this.user.account.name,
					"vesting_shares": vestsValue+' '+'VESTS'
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('powerdown', this.$refs["powerdown-amount"].value, res)
			}
		}else{
			this.powerDownProcess = true;
			let chainLnk = await this.setProperNode ();
			let res = await chainLnk.broadcast.withdrawVestingAsync(this.$refs["p-ac-key"].value, this.user.account.name, vestsValue + ' VESTS' ).then(
				res => this.confirmCompletion('powerdown', this.$refs["powerdown-amount"].value, res)).catch(err=>console.log(err));
		}
	  },
	  async confirmCompletion (type, amount, res, extraAFITTrx){
		console.log (res);
		if (res && (res.ref_block_num || res.success)){
			
			let note = 'Power down cancelled successfully!';
			let power_type = 'SP';
			if (this.cur_bchain=='HIVE'){
				power_type = 'HP';
			}else if (this.cur_bchain=='BLURT'){
				power_type = 'BP';
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
			if (type=='cancel-savings-withdraw'){
				note = 'Savings withdrawal cancelled.'
			}
			if (type=='transfer-bsc'){
				//note = 'Transfer completed. Your AFIT will appear on your BSC wallet shortly.'
			}else{
				this.$notify({
				  group: 'success',
				  text: note,
				  position: 'top center'
				})
				this.$store.dispatch('steemconnect/refreshUser');
			}
		}else{
			this.$notify({
			  group: 'error',
			  text: this.$t('error_performing_operation'),
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
		}else if (type=='transfer-bsc'){
			//res is HBD
			//extraAFITTrx is AFIT H-E
			
			
			console.log(res.ref_block_num);
		
			//store transfer transaction for validation
	
		
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let url = new URL(process.env.actiAppUrl + 'appendBridgeTransaction/?user='+this.user.account.name+'&wallet='+//this.$refs['bsc-wallet-address'].value
			this.bsc_wallet_address
			+'&afitTrx='+extraAFITTrx.id+'&hbdTrx='+res.id);

			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			
			res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.error){
				this.afit_se_power_error_proceeding = true;
				this.afit_se_power_err_msg = this.$t('need_set_bsc_wallet');
			}else{
				console.log('success');
				this.$notify({
				  group: 'success',
				  text: 'Fund Transfer completed. Your AFIT will appear on your BSC wallet shortly.',
				  position: 'top center'
				})
			}

			
			
			this.movingFunds = false;
			
		}
		//update balances 
		//setTimeout(this.fetchTokenBalance , 5);
	  },
	  async cancelPowerDown () {
		//function handles cancelling the power down
		
		let confirmPopup = confirm(this.$t('confirm_cancel_power_down'));
		if (!confirmPopup){
			return;
		}
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
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
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestPowerDown(this.user.account.name, '0.000', (response) => {
					console.log(response);
					this.confirmCompletion('powerdown', 0, response)
				});
			});			
		}else if (this.isHiveauthLogin){
			let opname = 'withdraw_vesting';
			let	params = {
					"account": this.user.account.name,
					"vesting_shares": '0.000000'+' '+'VESTS'
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('powerdown', 0, res)
			}
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
		}else if (cur_bchain == 'BLURT'){
			properNode = blurt;
		}
		console.log(cur_bchain);
		return properNode;
	  },
	  exchangeAFITforSTEEM () {
		//function handles opening/closing exchanging AFIT tokens for STEEM upvotes  section
		
		//set proper AFIT Activity Mode controlling the display
		//if (this.afitActivityMode == this.EXCHANGE_AFIT_STEEM ){
		//  this.afitActivityMode = 0;
		//}else{
		  this.afitActivityMode = this.EXCHANGE_AFIT_STEEM;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  moveAFITXseHE () {
		//set proper AFIT Activity Mode controlling the display
		/*if (this.afitActivityMode == this.MOVE_AFITX_SE_HE ){
		  this.afitActivityMode = 0;
		}else{*/
		  this.afitActivityMode = this.MOVE_AFITX_SE_HE;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  moveAFITXheSE () {
		//set proper AFIT Activity Mode controlling the display
		/*if (this.afitActivityMode == this.MOVE_AFITX_HE_SE ){
		  this.afitActivityMode = 0;
		}else{*/
		  this.afitActivityMode = this.MOVE_AFITX_HE_SE;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  moveAFITseHE () {
		//set proper AFIT Activity Mode controlling the display
		/*if (this.afitActivityMode == this.MOVE_AFIT_SE_HE ){
		  this.afitActivityMode = 0;
		}else{*/
		  this.afitActivityMode = this.MOVE_AFIT_SE_HE;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  moveAFITheSE () {
		//set proper AFIT Activity Mode controlling the display
		/*if (this.afitActivityMode == this.MOVE_AFIT_HE_SE ){
		  this.afitActivityMode = 0;
		}else{*/
		  this.afitActivityMode = this.MOVE_AFIT_HE_SE;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
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
		/*if (this.afitActivityMode == this.MOVE_AFIT_SE ){
		  this.afitActivityMode = 0;
		}else{*/
		  this.afitActivityMode = this.MOVE_AFIT_SE;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  initiateAFITtoSE () {
		//function handles opening/closing moving AFIT to SE
		
		//set proper AFIT Activity Mode controlling the display
		/*if (this.afitActivityMode == this.INIT_AFIT_TO_SE ){
		  this.afitActivityMode = 0;
		}else{*/
	  this.afitActivityMode = this.INIT_AFIT_TO_SE;
		//}
		//hide lower section for STEEM actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
	  },
	  initiateTipUser(){
		this.afitActivityMode = this.INIT_AFIT_TIP;
		//hide lower section for other actions
		this.fundActivityMode = 0;
		this.curTokenAction = 0;
		this.scrollAction();
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
	  async processTrxFunc(op_name, cstm_params, active, op2, params2){
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
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				let operation = [[op_name, cstm_params]];
				if (op2 && params2){
					operation.push([op2, params2]);
				}
				window.hive_keychain.requestBroadcast(
					this.user.account.name, 
					operation, 
					active?'Active':'Posting', (response) => {
					console.log(response);
					//resolve(response);
					resolve({success: response.success, txID: response.result.id})
				});
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
				if (op2 && params2){
					operation.push([op2, params2]);
				}
				this.$HAS.broadcast(auth, active?'active':'posting', operation, (evt)=> {
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
						resolve({success: true, txID: response.data})
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
			if (op2 && params2){
				operation.push([op2, params2]);
			}
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
	  async proceedTipActivity(){
		this.tipError = '';
		if (!this.user){
			this.tipError = this.$t('Need_login_tip');
			return false;
		}
		if (this.$refs['tip-recipient'].value == ''){
			this.tipError = this.$t('Cannot_tip_self');
			return false;
		}
		if (this.$refs['tip-recipient'].value == this.user.account.name){
			this.tipError = this.$t('Cannot_tip_self');
			return false;
		}
		if (this.$refs["funds-pass"].value == ''){
		  this.tipError = this.$t('error_missing_funds_pass') + ' <u><a href="/wallet?action=set_funds_pass">' + this.$t('create_funds_pass') + '</a></u>';
		  return;
		}
		if (this.$refs["tip-amount"].value == ''){
		  this.tipError = this.$t('amount_positive_int');
		  return;
		}
		//check if user has enough funds
		if (parseFloat(this.$refs["tip-amount"].value) > parseFloat(this.userTokensWallet)){
		  this.tipError = this.$t('amount_above_balance');
		  return;
		}
		this.tipInProgress = true;
		//proceed with tipping
		let res = await fetch(process.env.actiAppUrl+'tipAccount/'
			+ '?user=' + this.user.account.name
			+ '&targetUser=' + this.$refs['tip-recipient'].value
			+ '&amount=' + this.$refs["tip-amount"].value
			+ '&fundsPass=' + this.$refs["funds-pass"].value);
		let outcome = await res.json();
		if (outcome.status=='Success'){
			let tipTransaction = { action: 'Tip', amount: outcome.tipAmount, recipient: this.displayUser};
			//store the transaction to Steem BC
			let cstm_params = {
				required_auths: [],
				required_posting_auths: [this.user.account.name],
				id: 'actifit',
				json: JSON.stringify(tipTransaction)
			};
			let res = await this.$processTrxFunc('custom_json', cstm_params);
			//console.log(res);
			if (res.success){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('tip_successfully_sent'),
				  position: 'top center'
				})
				
				//refresh user balance
				this.refreshBalance();
				//update sender token count
				//ensure we fetch proper logged in user data
				this.$store.dispatch('fetchUserTokens')
				
				//update transactions
				this.$store.dispatch('fetchTransactions')
				//update recipient token count
				//this.userTokenCount = outcome.recipientTokenCount;
			}
			
			this.proceedTip = false;
		}else{
			this.tipError = outcome.error;
		}
		this.tipInProgress = false;
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
		if (amount_to_powerdown > parseFloat(this.userTokensWallet)){
		  this.afit_se_move_error_proceeding = true;
		  this.afit_se_move_err_msg = this.$t('max_amount_AFIT_power_SE');
		  //this.movingFunds = false;
		  return;
		}
		this.initiateInProgress = true;
		
		try{
			//check if the user has enough AFITX S-E amount allowing him the transfers daily
			let bal;
			try{
			
				bal = await ssc.findOne('tokens', 'balances', { account: this.user.account.name, symbol: 'AFITX' });
				console.log(bal);
			}catch(outErr){
				console.log(outErr);
			}
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
				res => {res.json().then(json => this.setUserPDAfitStatus (json) ).catch(e => console.log(e))
			  }).catch(e => console.log(e))*/
			
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
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
			if (this.$refs["p-ac-key-power"].value == ''){
			  this.afit_se_move_error_proceeding = true;
			  this.afit_se_move_err_msg = this.$t('all_fields_required');
			  return;
			}
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
		
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
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
				

				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('MOVE_AFIT_HE_AFIT_POWER'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
					
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
							  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {console.log(e);this.movingFunds = false;})
							}).catch(e => console.log(e))
							
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
					}
				});
			});		
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			if (response.success){
					
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
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {console.log(e);this.movingFunds = false;})
					}).catch(e => console.log(e))
					
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
			}

		
		}else{
		
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {console.log(e);this.movingFunds = false;})
					}).catch(e => console.log(e))
					
				
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
	  async refreshBalance(){
		this.refreshinBal = true;
		let pntr = this;
		fetch(process.env.actiAppUrl+'recalculateUserTokens?user='+this.user.account.name).then(
			res => {res.json().then(json => {this.fetchUserData();}).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		//after 10 seconds of waiting, cancel spinner
		setTimeout(function(){pntr.refreshinBal = false;}, 10000);
	  },
	  async proceedMoveAFIT(direction) {
		//TODO: if we are to reinstate this functionality after SE goes back online, we need to setup code for keychain support
		
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
		
		//if (!this.isKeychainLogin){
			if (this.$refs["p-ac-key-afit"].value == ''){
			  this.afit_se_move_error_proceeding = true;
			  this.afit_se_move_err_msg = this.$t('all_fields_required');
			  return;
			}
		//}
	  
		this.movingAFIT = true;
		//standard is moving tokens from S-E to H-E, which requires sending bcast to Steem.
		
		let targetAcct = 'afit.h-e';
		let transId = process.env.hiveEngineChainId;
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
		
		/*if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){
			return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
				
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('MOVE_AFIT_SE_HE'), (response) => {
					console.log(response);
					//notify of success
					if (response.success && response.result.id){
						//let's check if user already has a funds pass set
					fetch(process.env.actiAppUrl+'proceedAfitTransition/?user='+this.user.account.name+'&txid='+response.result.id+'&amount='+amount_to_move+'&bchain='+(direction==1?'STEEM':'HIVE')).then(
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
						//notify of success
						this.$notify({
						  group: 'error',
						  text: this.$t('error_performing_operation'),
						  position: 'top center'
						})
					}
				});
			});		
		
		}else{*/
		
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
								//disable: EOL for S-E
								//setTimeout(this.fetchAFITSE, 3000);
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
		//}
	  },
	  async proceedMoveAFITX(direction) {
		//TODO: if we are to reinstate this functionality after SE goes back online, we need to setup code for keychain support
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
		let transId = process.env.hiveEngineChainId;
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
							//Disable: EOL for S-E
							//setTimeout(this.fetchAFITXSE, 3000);
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
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
				return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
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
				
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('Power_Up'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
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
				});
			});		
					
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			//notify of success
			if (response.success){
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
			
		}else{
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
	  
	  async proceedDelegateToken (){
		
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		
		
		let tokenMaxVal = this.selTokenUp.stake;
		let recipient = this.$refs["token-delegate-recipient"].value.trim();
		let amount_to_powerdown = this.$refs["token-powerup-amount"].value.trim();
		//ensure we have proper values
		if (isNaN(amount_to_powerdown) || parseFloat(amount_to_powerdown) < 0.01){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_token_power');
		  return;
		}
		if (recipient==''){
			this.afit_se_power_error_proceeding = true;
			this.afit_se_power_err_msg = this.$t('all_fields_required');
			return;
		}
		//ensure user is delegating amount he has staked
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
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"delegate\",\"contractPayload\":{\"to\":\"" + recipient + "\",\"symbol\":\"" + this.selTokenUp.symbol + "\",\"quantity\":\"" + amount_to_powerdown + "\",\"memo\":\"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('delegate_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
				if (this.cur_bchain == 'STEEM'){
					targetAcct = 'actifit.s-e';
					transId = 'ssc-mainnet1';
				}
				
				let json_data = {
					contractName: 'tokens',
					contractAction: 'delegate',
					contractPayload: {
						to: recipient,
						symbol: this.selTokenUp.symbol,
						quantity: '' + amount_to_powerdown,//needs to be string
						memo: ''
					}
				}
				
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('Power_Down'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
						this.$notify({
						  group: 'success',
						  text: this.$t('delegate_token')+ ' ' +this.$t('completed_success'),
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
				});
			});		
		
				
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'delegate',
				contractPayload: {
					to: recipient,
					symbol: this.selTokenUp.symbol,
					quantity: '' + amount_to_powerdown,//needs to be string
					memo: ''
				}
			}
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			//notify of success
			if (response.success){
				this.$notify({
				  group: 'success',
				  text: this.$t('delegate_token')+ ' ' +this.$t('completed_success'),
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
		
		}else{
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'unstake',
				contractPayload: {
					to: recipient,
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
				  text: this.$t('delegate_token')+ ' ' +this.$t('completed_success'),
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
	  
	  async proceedUnDelegateToken (delegation){
		
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		
		
		//let tokenMaxVal = this.selTokenUp.stake;
		let recipient = delegation.to;
		let amount_to_powerdown = delegation.quantity;
		let tokenSymbol = delegation.symbol;
		//ensure we have proper values
		if (isNaN(amount_to_powerdown) || parseFloat(amount_to_powerdown) < 0.01){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_token_power');
		  return;
		}
		if (recipient==''){
			this.afit_se_power_error_proceeding = true;
			this.afit_se_power_err_msg = this.$t('all_fields_required');
			return;
		}
		//ensure user is delegating amount he has staked
		/*if (parseFloat(amount_to_powerdown) > parseFloat(tokenMaxVal)){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_token_powerdown');
		  return;
		}*/
		
		
		if (!localStorage.getItem('std_login')){
			//store the transaction to Steem BC according to S-E protocol for power down
			let link = this.$steemconnect.sign('custom_json', {
			  required_auths: "[\"" + this.user.account.name + "\"]",
			  required_posting_auths: "[]",
			  id: 'ssc-mainnet1',
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"undelegate\",\"contractPayload\":{\"from\":\"" + recipient + "\",\"symbol\":\"" + tokenSymbol + "\",\"quantity\":\"" + amount_to_powerdown + "\",\"memo\":\"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('undelegate_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
				if (this.cur_bchain == 'STEEM'){
					targetAcct = 'actifit.s-e';
					transId = 'ssc-mainnet1';
				}
				
				let json_data = {
					contractName: 'tokens',
					contractAction: 'undelegate',
					contractPayload: {
						from: recipient,
						symbol: tokenSymbol,
						quantity: '' + amount_to_powerdown,//needs to be string
						memo: ''
					}
				}
				
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('Power_Down'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
						this.$notify({
						  group: 'success',
						  text: this.$t('undelegate_token')+ ' ' +this.$t('completed_success'),
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
				});
			});		
		
				
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'undelegate',
				contractPayload: {
					from: recipient,
					symbol: tokenSymbol,
					quantity: '' + amount_to_powerdown,//needs to be string
					memo: ''
				}
			}
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			//notify of success
			if (response.success){
				this.$notify({
				  group: 'success',
				  text: this.$t('undelegate_token')+ ' ' +this.$t('completed_success'),
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
		
		}else{
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
			if (this.cur_bchain == 'STEEM'){
				targetAcct = 'actifit.s-e';
				transId = 'ssc-mainnet1';
			}
			
			let json_data = {
				contractName: 'tokens',
				contractAction: 'unstake',
				contractPayload: {
					from: recipient,
					symbol: tokenSymbol,
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
				  text: this.$t('undelegate_token')+ ' ' +this.$t('completed_success'),
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
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
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
				
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('Power_Down'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
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
				});
			});		
		
				
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			//notify of success
			if (response.success){
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
		
		}else{
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
		let memo = this.$refs["token-transfer-memo"].value.trim();
		
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
			  json: "{\"contractName\":\"tokens\",\"contractAction\":\"transfer\",\"contractPayload\":{\"symbol\":\"" + this.selTokenUp.symbol + "\",\"to\":\"" + target_account + "\",\"quantity\":\"" + amount_to_send + "\",\"memo\":\""+memo+"\"}}",
			  authority: 'active',
			  auto_return: true,
			}, window.location.origin + '/wallet?op='+this.$t('Transfer_token')+'&status=success');
			
			//redirect to proper action
			window.location = link;
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
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
						memo: memo
					}
				}
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('Transfer_token'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
						this.$notify({
						  group: 'success',
						  text: this.$t('Transfer_token')+ ' ' +this.$t('completed_success'),
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
				});
			});		
		
			
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
					memo: memo
				}
			}
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			//notify of success
			if (response.success){
				this.$notify({
				  group: 'success',
				  text: this.$t('Transfer_token')+ ' ' +this.$t('completed_success'),
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
			
		}else{
			if (this.$refs["p-ac-key-trans-token"].value == ''){
			  this.afit_se_power_error_proceeding = true;
			  this.afit_se_power_err_msg = this.$t('all_fields_required');
			  return;
			}
			
			
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
					memo: memo
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
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {console.log(e);this.movingFunds = false;})
					}).catch(e => console.log(e))
					
				
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
	  async proceedTransferBSC(){
		//handles locking and moving tokens over to BSC
		this.afit_se_power_error_proceeding = false;
		this.afit_se_power_err_msg = '';
		
		let tokenMaxVal = parseFloat(this.selTokenUp.balance);
		console.log(tokenMaxVal);
		let amount_to_withdraw = this.$refs["token-powerup-amount"].value.trim();
		//ensure we have proper values
		console.log(amount_to_withdraw);
		if (amount_to_withdraw == '' || isNaN(amount_to_withdraw) || parseFloat(amount_to_withdraw) < process.env.minAfitBSCTransfer){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_transf_bsc');
		  return;
		}
		console.log((parseFloat(amount_to_withdraw) > tokenMaxVal));
		if (parseFloat(amount_to_withdraw) > tokenMaxVal){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_transf_bsc');
		  return;
		}
		if (parseFloat(amount_to_withdraw) > process.env.maxAfitBSCTransfer){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_limit_transf_bsc');
		  return;
		}
		
		//make sure proper HBD amount is being sent
		let hbd_amount = this.$refs['token-hbd-amount'].value.trim();
		if (isNaN(hbd_amount) || parseFloat(hbd_amount) < 0.1){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('min_amount_transf_bsc');
		  return;
		}
		//console.log(hbd_amount);
		//console.log(this.user.account.hbd_balance);
		let hbd_bal = parseFloat(this.user.account.hbd_balance.split(' ')[0]);
		console.log(hbd_bal)
		if (parseFloat(hbd_amount) > hbd_bal){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('max_amount_transf_bsc');
		  return;
		}
		
		if (!this.isKeychainLogin && !this.isHiveauthLogin && this.isStdLogin){
			if (this.$refs["p-ac-key-trans-token"].value == ''){
			  this.afit_se_power_error_proceeding = true;
			  this.afit_se_power_err_msg = this.$t('all_fields_required');
			  return;
			}
		}
		
		//make sure user has a set wallet address
		if (this.bsc_wallet_address == ''){
		  this.afit_se_power_error_proceeding = true;
		  this.afit_se_power_err_msg = this.$t('need_set_bsc_wallet');
		  return;
		}
		
		//check if user has a pending transaction for today already
		
		let url = new URL(process.env.actiAppUrl + 'userBridgeEligible/'+'?user=' + this.user.account.name);
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			console.log('eligible to transact?');
			console.log(outcome);
			if (!outcome.eligible){
				this.afit_se_power_error_proceeding = true;
				this.afit_se_power_err_msg = this.$t('have_transacted_today');
				return;
			}
		}catch(err){
			console.log(err);
		}
		
		
		//let's go
		
		this.movingFunds = true;
		
		let targetAcct = process.env.bscBridgeAccount;
		let transId = process.env.hiveEngineChainId;
		/*if (this.cur_bchain == 'STEEM'){
			targetAcct = 'actifit.s-e';
			transId = 'ssc-mainnet1';
		}*/
		
		let json_data = {
			contractName: 'tokens',
			contractAction: 'transfer',
			contractPayload: {
				symbol: 'AFIT',
				to: targetAcct,
				quantity: '' + amount_to_withdraw,//needs to be string
				memo: ''
			}
		}
		
		let userKey = this.$refs["p-ac-key-trans-token"].value;
		
		//send out transaction to blockchain
		//only works on hive
		let chainLnk = hive;//await this.setProperNode();
		let tx = await chainLnk.broadcast.customJsonAsync(
				userKey, 
				[ this.user.account.name ] , 
				[], 
				transId, 
				JSON.stringify(json_data)
			).catch(err => {
				console.log(err.message);
				this.afit_se_power_error_proceeding = true;
				this.afit_se_power_err_msg = err.message;
				this.movingFunds = false;
		});
		
		/*
		let hive_operations = [
			
		];
		let hivepost = await hive.broadcast.sendAsync( 
		   { operations: hive_operations, extensions: [] }, 
		   { posting: posting_key }).catch(err => {
		   
		   });
		
		*/
		if (this.afit_se_power_error_proceeding){
			return;
		}
		//console.log(tx.block_num);
		console.log(tx.id);
		
		//send HBD as well
		//only works on hive
		//let chainLnk = hive;//await this.setProperNode ();
			//transferToVesting(wif, from, to, amount)
		let outc;
		let res = await chainLnk.broadcast.transferAsync(
				userKey,
				this.user.account.name, 
				targetAcct, 
				parseFloat(hbd_amount).toFixed(3) + ' HBD', 
				'BSC bridge').then(
			outc => this.confirmCompletion('transfer-bsc', 0, outc ,tx)).catch(err=>
			{
				console.log(err)
				this.afit_se_power_error_proceeding = true;
				this.afit_se_power_err_msg = err.message;
				this.movingFunds = false;
			});
		
		if (this.afit_se_power_error_proceeding){
			return;
		}
		
		
		/*if (tx && tx.ref_block_num){
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('Move_AFIT_to_Wallet')+ ' ' +this.$t('Scheduled_successfully'),
			  position: 'top center'
			})
			
			//initiate call to adjust AFIT token count
			
			//let url = new URL(process.env.actiAppUrl + 'confirmAFITSEReceipt/?user='+this.user.account.name+'&bchain='+this.cur_bchain);
			
			//connect with our service to confirm AFIT received to proper wallet
			try{
				
				fetch(url).then(
				  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {console.log(e);this.movingFunds = false;})
				}).catch(e => console.log(e))
				
			
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
		}*/
		
		
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
		
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
			
				let targetAcct = 'actifit.h-e';
				let transId = process.env.hiveEngineChainId;
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
				
			
				window.hive_keychain.requestCustomJson(this.user.account.name, transId, 'Active', JSON.stringify(json_data), this.$t('Withdraw_token'), (response) => {
					console.log(response);
					//notify of success
					if (response.success){
						this.$notify({
						  group: 'success',
						  text: this.$t('Withdraw_token')+ ' ' +this.$t('completed_success'),
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
				});
			});		
		}else if (this.isHiveauthLogin){
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
			
			let op_name = 'custom_json';
			let cstm_params = {
				required_auths: [this.user.account.name],
				required_posting_auths: [],
				id: 'actifit',
				json: JSON.stringify(json_data)
			  };
			let operation = [ 
			   [op_name, cstm_params]
			];
			
			let response = await this.processTrxFunc(op_name, cstm_params, true);
			
			//notify of success
			if (response.success){
				this.$notify({
				  group: 'success',
				  text: this.$t('Withdraw_token')+ ' ' +this.$t('completed_success'),
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
			
			
		}else{
			if (this.$refs["p-ac-key-trans-token"].value == ''){
			  this.afit_se_power_error_proceeding = true;
			  this.afit_se_power_err_msg = this.$t('all_fields_required');
			  return;
			}
			
			
			this.movingFunds = true;
			
			let targetAcct = 'actifit.h-e';
			let transId = process.env.hiveEngineChainId;
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
					  res => {res.json().then(json => {this.setUserAddedTokens(json);this.movingFunds = false;}).catch(e => {console.log(e);this.movingFunds = false;})
					}).catch(e => console.log(e))
					
				
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
	  async speedUpVerify(){
			let url = new URL(process.env.actiAppUrl + 'confirmPaymentPasswordVerify?from='+this.user.account.name+'&bchain=' + this.cur_bchain);
			let res = await fetch(url);
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.statusUpdated==true){
				/*this.$notify({
				  group: 'success',
				  text: this.$t(''),
				  position: 'top center'
				})
				console.log(outcome.error);*/
				this.fetchUserData();
				
			}/*else{
				this.$notify({
				  group: 'error',
				  text: this.$t('problem_reset_pass'),
				  position: 'top center'
				})
			}*/
			this.checkingFunds = false;
	  },
	  async resetFundsPass(){
		let confirmPopup = confirm(this.$t('Confirm_password_reset'));
			if (!confirmPopup){
				return;
			}
			let accToken = localStorage.getItem('access_token')
			
			let url = new URL(process.env.actiAppUrl + 'resetFundsPass/?user='+this.user.account.name);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.status=='success'){
				this.$notify({
				  group: 'success',
				  text: this.$t('pass_reset_successfully'),
				  position: 'top center'
				})
				console.log(outcome.error);
				this.fetchUserData();
			}else{
				this.$notify({
				  group: 'error',
				  text: this.$t('problem_reset_pass'),
				  position: 'top center'
				})
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
		  this.error_msg = this.$t('min_amount_1_HIVE_HBD');
		  this.checkingFunds = false;
		  this.$notify({
				  group: 'error',
				  text: this.$t('min_amount_1_HIVE_HBD'),
				  position: 'top center'
				})
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
			
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestTransfer(this.user.account.name, this.target_exchange_account, parseFloat(this.$refs["pass-transfer-amount"].value).toFixed(3),'',this.transferTypePass,(response) => {
				  console.log(response);
				  this.confirmCompletion('transfer-verify', this.$refs["pass-transfer-amount"].value, response)
				}, true);
			});	
			
		}else if (this.isHiveauthLogin){
			let opname = 'transfer';
			let	params = {
					"from": this.user.account.name,
					"to": this.target_exchange_account,
					"amount": parseFloat(this.$refs["pass-transfer-amount"].value).toFixed(3)+' '+this.transferTypePass,
					"memo": ""
				};
			let res = await this.processTrxFunc(opname, params, true);
			
			if (res.success){
				this.confirmCompletion('transfer-verify', this.$refs["pass-transfer-amount"].value, res)
			}
			
		}else{
			
			if (this.$refs["p-ac-key-funds-ver"].value == ''){
			  this.error_proceeding = true;
			  this.error_msg = this.$t('all_fields_required');
			  this.checkingFunds = false;
			  this.$notify({
				  group: 'error',
				  text: this.$t('all_fields_required'),
				  position: 'top center'
				})
			  return;
			}
		
			
			let confirmPopup = confirm(this.$t('Confirm_verf_transfer').replace('_AMOUNT_',this.$refs["pass-transfer-amount"].value).replace('_CURR_',this.transferTypePass));
			if (!confirmPopup){
				this.checkingFunds = false;
				return;
			}
		
			let chainLnk = await this.setProperNode ();
			console.log('perform transfer');
			//console.log(this.$refs["p-ac-key-funds-ver"].value);
			//transferToVesting(wif, from, to, amount)
			let res = await chainLnk.broadcast.transferAsync(this.$refs["p-ac-key-funds-ver"].value, this.user.account.name, this.target_exchange_account, parseFloat(this.$refs["pass-transfer-amount"].value).toFixed(3) + ' ' + this.transferTypePass, '').then(
				res => this.confirmCompletion('transfer-verify', this.$refs["pass-transfer-amount"].value, res)
				).catch(err=>{console.log(err);
				this.$notify({
				  group: 'error',
				  text: this.$t('error_operation_active_key'),
				  position: 'top center'
				})
				this.error_proceeding = true;
				this.error_msg = this.$t('error_operation_active_key');
				this.checkingFunds = false;
				});
				
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
		if (this.userTokensWallet <  this.min_tokens_required){
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
	  },
	  setBlurtPrice (_blurtPrice){
		this.blurtPrice = parseFloat(_blurtPrice).toFixed(3);
	  }
	},
	created () {
	  this.runningInterval = setInterval(this.fetchUserData, 60*1000);
	},
	destroyed () {
	  clearInterval(this.runningInterval);
	},
	updated: function () {
	  this.$nextTick(function () {
		// Code that will run only after the
		// entire view has been re-rendered
		//console.log('updated');
		//console.log(this.$refs['detailsArea']);
		//monitor visibility of details area to avoid multiple scrolls there
		/***************/
		if (!this.observerSet){
			const observer = new IntersectionObserver(this.handleIntersection, {
			  rootMargin: '0px',
			  threshold: 1.0
			});
			//console.log(this.$refs);
			const element = this.$refs['detailsArea'];
			//console.log(element);
			if (element) {
				observer.observe(this.$refs['detailsArea']);
				console.log('observer set')
				this.observerSet = true;
			}else{
				console.error("Element not found.");
			}
		}
		/***************/
	  })
	},
    async mounted () {
		this.afitTokenAddress = afitTokenAddress;
		this.afitxTokenAddress = afitxTokenAddress;
		this.afitBNBLPTokenAddress = afitBNBLPTokenAddress;
		this.afitxBNBLPTokenAddress = afitxBNBLPTokenAddress;
		
		
		if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined') ) {
		  this.displayUser = this.$route.params.username
		  if (this.$route.params.username.startsWith('@')){
			this.displayUser = this.$route.params.username.substring(1, this.$route.params.username.length);
		  }
		}
		
		if (this.displayUser!=''){
			//console.log('display user ready');
			//grab display user data
			let account_res = await hive.api.getAccountsAsync([this.displayUser]);
			//console.log('done');
			//console.log(account_res);
			if (account_res && account_res.length >0){
				this.displayUserData = account_res[0];
			}
		}
		

	//adjust to metamask if available
	  if (typeof window.ethereum !== 'undefined'){
		//metamask functional
		web3 = new Web3(window.ethereum);
	  }
		
	  //check which chain is active
	  if (localStorage.getItem('cur_bchain')){
		this.cur_bchain = localStorage.getItem('cur_bchain')
	  }
	  
	  //set default current chain
	  //if (this.cur_bchain != 'BLURT'){
		this.transferType = this.cur_bchain;
		this.transferTypePass = this.cur_bchain;
	  //}
	  steem.api.setOptions({ url: process.env.steemApiNode });
	  
		  
	  //hive.config.set('rebranded_api', true)
	  //hive.broadcast.updateOperations()
	  //
	  
	  if (process.env.hiveTestNetOn){
		hive.config.set('chain_id', '4200000000000000000000000000000000000000000000000000000000000000');
	  }else{
		hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
	  }
	  hive.api.setOptions({ url: process.env.hiveApiNode });
	  
	  blurt.api.setOptions({ url: process.env.blurtApiNode });
	  
	  let chainLnk = await this.setProperNode();
      // login
      this.$store.dispatch('steemconnect/login')
	  this.fetchUserData();
	  let ref_id = this;
	  
	  //let's load the properties to properly convert SP to Vests and vice-versa
	  this.properties = await chainLnk.api.getDynamicGlobalPropertiesAsync();
	  
	  //grab AFIT price
	  fetch(process.env.actiAppUrl+'curAFITPrice').then(
		res => {res.json().then(json => this.setAFITPrice (json.unit_price_usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  //grab AFIT BSC price
	  fetch(process.env.actiAppUrl+'AFITBSCPrice').then(
		res => {res.json().then(json => this.setAFITBSCPrice (json.price)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  //grab AFITX BSC price
	  fetch(process.env.actiAppUrl+'AFITXBSCPrice').then(
		res => {res.json().then(json => this.setAFITXBSCPrice (json.price)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  
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
	  }else if (this.$route.query.action === 'delegate_rc'){
		this.afitActivityMode = 0;
		this.fundActivityMode = this.DELEGATE_RCS;
	  }else if (this.$route.query.action === 'power_up'){
		this.afitActivityMode = 0;
		this.fundActivityMode = this.POWERUP_FUNDS;
	  }else if (this.$route.query.action === 'lock_afit'){
		this.afitActivityMode = this.MOVE_AFIT_SE;
		this.fundActivityMode = 0;
	  }
	  
	  //grab STEEM price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  //grab HIVE price
	  fetch(process.env.actiAppUrl+'hivePrice').then(
		res => {res.json().then(json => this.setHivePrice (json.hive.usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  //grab BLURT price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=usd').then(
		res => {res.json().then(json => this.setBlurtPrice (json.blurt.usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  
	  //grab SBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollars&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollars'].usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  this.loading = false;
	  
	  //grab HBD price
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd').then(
		res => {res.json().then(json => this.setHBDPrice (json['hive_dollar'].usd)).catch(e => console.log(e))
	  }).catch(e => console.log(e))
	  this.loading = false;
	  
	  //set default option for transfer
	  
	  this.transferType = this.cur_bchain;
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
  .token-entry{
	padding-bottom: 1px;
	padding-top: 1px;
	border-bottom: inset;
    /* border-bottom-color: red; */
    border-bottom-width: 1px;
	margin: 0px;
  }
  .light-bottom{
	border-bottom-width: 1px!important;
  }
  .thick-bottom{
	border-bottom-width: 2px!important;
  }
  .no-bottom{
	border-bottom-width: 0px;
  }
  .mini-token-logo{
	width: 25px;
	height: 25px;
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
  .clickable{
	cursor: pointer;
  }
  .btn-brand{
	min-width: 34px;
	min-height: 34px;
  }
  .btn-brand a{
	color: white;
  }
  .main-token{
	background-color: whitesmoke;
  }
  .wallet-container{
	/* background-color: red; 
	opacity: 0.7; */
	background-color: beige;
	/* border: 2px solid red; */
	border-radius: 3px;
	margin-bottom: 5px;
	min-width: 600px; /* make it scroll friendly on mobile size */
	
	/* 3D look */
	/* -moz-box-shadow: 0px 1px 1px rgba(000,000,000,0.5), inset 1px 2px 0px rgba(255,255,255,0.4);
    -webkit-box-shadow: 0px 1px 1px rgb(0 0 0 / 50%), inset 1px 2px 0px rgb(255 255 255 / 40%);
    box-shadow: 0px 1px 1px rgb(0 0 0 / 50%), inset 1px 2px 0px rgb(255 255 255 / 40%);
    text-shadow: 1px 1px 2px rgb(0 0 0 / 70%), 0px 1px 0px rgb(255 255 255 / 40%);
	box-shadow: 0 70px 40px -20px rgb(0 0 0 / 20%); */
	
  }
  
  .head-title{
	    min-height: 40px;
		background-color: red;
		color: white;
  }
  
  .wallet-container .token-entry.row div {
    /* border: none; */
    /* font-size: 16px; */
    box-shadow: 3px 3px 3px rgb(255 0 0 / 20%);
  }
  
   .head-title div{
	box-shadow: 3px 3px 3px rgb(255 255 255 / 60%) !important;
  }
  
  .pro-name {
    background: radial-gradient(red,transparent);
    color: #fff;
  }
  .action-box{
	background-color: beige;
  }
  
  .token_actions .btn{
	margin: 3px;
  }
  .break-val{
	line-break: anywhere;
  }
  .token-entry li {
    list-style: none;
  }
  .user-wallet-avatar{
	width: 30px;
    height: 30px;
    background-position: center center;
    background-size: cover;
    border-radius: 50%;
    border: solid 1px #ddd;
  }
</style>
