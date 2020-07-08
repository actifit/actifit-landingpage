<template>
  <div>
	<!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav d-none d-sm-block">
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
	<div v-if="loadingData" class="container pt-5 mt-5 pb-5" >
		<div class="mb-3 text-center">
		  <i class="fas fa-spin fa-spinner text-brand" ></i>
		</div>
	</div>
	<div v-else-if="errorDisplay==''" class="container pt-5 mt-5 pb-5 col-md-9" >
		<h5 class="d-flex flex-row text-brand user-name" v-if="displayUser">
			<a :href="formattedProfileUrl" target="_blank">@{{ displayUser }} <small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small></a>
			<span v-if="!account_banned && !isOwnAccount()" class="text-brand">
				<span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend()" >
					<i class="fas fa-user-friends  p-2" ></i>
					<span :title="$t('cancel_friendship')" v-on:click="dropFriend"><i class="fas fa-user-times"></i></span>
					<div v-if="addFriendError" v-html="addFriendError"></div>
				</span>
				<span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend()">
					<i class="fas fa-user-clock  p-2"></i>
					<span :title="$t('cancel_friend_request')" v-on:click="cancelFriendRequest" v-if="isPendingFriend().direction == 0"><i class="fas fa-user-times"></i></span>
					<span :title="$t('accept_friend_request')" v-on:click="acceptFriend" v-else-if="isPendingFriend().direction == 1"><i class="fas fa-user-check"></i></span>
					<div v-if="addFriendError" v-html="addFriendError"></div>
				</span>
				<span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-else
					v-on:click="addFriend">
					<i class="fas fa-user-plus  p-2"></i>
					<div v-if="addFriendError" v-html="addFriendError"></div>
				</span>
				<i class="fas fa-spin fa-spinner" v-if="friendshipLoader"></i>
			</span>
		</h5>
		<h5 class="d-flex flex-row text-brand user-name" v-else-if="!noUserFound">
			<a :href="formattedProfileUrl" target="_blank">@{{ displayUser }}</a>
		</h5>
		
		<div class="d-flex flex-row">
        <div class="d-flex flex-column mb-3">
		  <div v-if="displayUser" class="user-avatar large-avatar mr-1 mb-3"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.displayUser + '/avatar)'"></div>
		  <div class="acti-widget" v-if="displayUser">
			<table>
				<tr>
					<td colspan="2"><div class="text-center"><div class="phishy"><h6>Activity Count</h6></div>
						<span>{{ lastActivityCount }} <img src="/img/actifit_logo.png" class="activity-small-logo"></span></div></td>
					<td colspan="2"><div class="text-center"><div class="phishy"><h6>Activity Date</h6></div>
						<div><h6>{{ lastActivityDate }}</h6></div></div></td>
				</tr>
				<tr>
					<td colspan="4">
						<a href="#" data-toggle="modal" class="btn btn-brand btn-block" 
								 data-target="#activityChartModal" v-if="isFriend() || isOwnAccount()">
							{{ $t('View_activity_chart') }}
						</a>
						<a href="#" class="btn btn-brand btn-block" v-on:click="displayAddFriendActivity=!displayAddFriendActivity" v-else-if="user" >
							{{ $t('View_activity_chart') }}
						</a>
						<a href="#" class="btn btn-brand btn-block" v-on:click="displayLoginActivity=!displayLoginActivity" v-else >
							{{ $t('View_activity_chart') }}
						</a>
						<div v-if="displayAddFriendActivity" class="border text-brand">
							{{ $t('View_chart_notice').replace('_USER', this.username) }}
							<span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-on:click="addFriend">
								<i class="fas fa-user-plus p-2"></i>
								<div v-if="addFriendError" v-html="addFriendError"></div>
							</span>
						</div>
						<div v-if="displayLoginActivity">
							  <div class="">
								<a href="/login" class="btn btn-brand w-50">{{ $t('Login') }}</a>
								<a href="/signup" class="btn btn-brand w-50">{{ $t('Sign_Up') }}</a>
							  </div>
						</div>
					</td>
				</tr>
				<tr>
					<!--<img src="https://cdn.steemitimages.com/DQmdnh1nApZieHZ3s1fEhCALDjnzytFwo78zbAY5CLUMpoG/TRACKM.png">-->
					<td><div class="text-center"><div class="phishy"><h6>Height</h6></div>
						<h6>{{ lastHeight + ' '+heightUnit }}</h6></div></td>
					<td><img src="https://usermedia.actifit.io/height.png"></td>
					<td><div class="text-center"><div class="phishy"><h6>Weight</h6></div>
						<h6>{{ lastWeight+' '+weightUnit}}</h6></div></td>
					<td><img src="https://usermedia.actifit.io/weight.png"></td>
				</tr>
				
				<tr>
					<td><div class="text-center"><div class="phishy"><h6>Body Fat</h6></div>
						<h6>{{ lastBodyfat+' % '}}</h6></div></td>
					<td><img src="https://usermedia.actifit.io/bodyfat.png"></td>
					<td><div class="text-center"><div class="phishy"><h6>Chest</h6></div></div>
						<div class="text-center"><h6>{{ lastChest+' '+chestUnit }}</h6></div></td>
					<td><img src="https://usermedia.actifit.io/chest.png"></td>
				</tr>

				<tr>
					<td><div class="text-center"><div class="phishy"><h6>Waist</h6></div></div>
						<div class="text-center"><h6>{{ lastWaist+' '+waistUnit }}</h6></div></td>
					<td><img src="https://usermedia.actifit.io/waist.png"></td>
					<td><div class="text-center"><div class="phishy"><h6>Thighs</h6></div></div>
						<div class="text-center"><h6>{{ lastThighs+' '+thighsUnit }}</h6></div></td>
					<td><img src="https://usermedia.actifit.io/thighs.png"></td>
					
				</tr>
				
				<tr>
					<td colspan="4" class="font-italic" v-if="lastUpdated!='' && lastUpdated!='-'">
						<small>Last Updated On {{ pureDate(lastUpdated) }}</small>
					</td>
				</tr>
			</table>
			
			<a href="#" data-toggle="modal" class="btn btn-brand btn-block" 
					 data-target="#measureChartModal" v-if="isFriend() || isOwnAccount()">
				{{ $t('Stats_chart') }}
			</a>
			<a href="#" class="btn btn-brand btn-block" v-on:click="displayAddFriendStats=!displayAddFriendStats" v-else-if="user" >
				{{ $t('Stats_chart') }}
			</a>
			<a href="#" class="btn btn-brand btn-block" v-on:click="displayLoginStats=!displayLoginStats" v-else >
				{{ $t('Stats_chart') }}
			</a>
			<div v-if="displayAddFriendStats" class="border text-brand">
				{{ $t('View_chart_notice').replace('_USER', this.username) }}
				<span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-on:click="addFriend">
					<i class="fas fa-user-plus p-2"></i>
					<div v-if="addFriendError" v-html="addFriendError"></div>
				</span>
			</div>
			<div v-if="displayLoginStats">
				  <div class="">
					<a href="/login" class="btn btn-brand w-50">{{ $t('Login') }}</a>
					<a href="/signup" class="btn btn-brand w-50">{{ $t('Sign_Up') }}</a>
				  </div>
			</div>
			
		  </div>
		</div>
		  <div class="d-flex flex-column">
		  <div v-if="userinfo" class="user-details">
			<div class="info-box p-2"><i class="fas fa-user mr-2"></i> {{ userinfo.name }} <b-badge v-if="account_banned" variant="danger" :title="$t('Account_banned_tip')" >{{ $t('Account_banned') }}</b-badge></div>
			<div v-if="userMeta && userMeta.profile" class="row m-0">
				<div class="location-text info-box col-md-4 cntnr" ><i class="fas fa-street-view mr-2"></i> {{ userMeta.profile.location }}</div>
				<div class="info-box col-md-4 cntnr"><i class="fas fa-address-card mr-2"></i> {{ userMeta.profile.about }}</div>
				<div class="info-box col-md-4 cntnr"><i class="fas fa-link mr-2"></i>&nbsp;<a :href="userMeta.profile.website" class="force-white-url">{{ userMeta.profile.website }}</a></div>
			</div>
			<div class="row m-0">
				<div class="info-box col-md-6 cntnr"><i class="fas fa-calendar-alt mr-2"></i> {{ $t('Joined_On') }} {{ pureDate(userinfo.created) }}</div>
				<div class="info-box col-md-6 cntnr"><i class="fas fa-pen mr-2"></i> {{ numberFormat(userinfo.post_count, 0) }} {{ $t('Steem_posts_comments') }}</div>
			</div>
			<div v-if="!account_banned" class="row m-0">
				<div class="friends-count mb-2 mt-2 info-box info-box-orange col-md-12 cntnr">
					<i class="fas fa-user-friends text-brand mr-2" ></i><a href="./friends" >{{ this.userFriends.length }} {{ $t('friends') }} <span v-html="showFriendsSnippet()"></span></a>
					<a class="btn btn-brand m-2" href="./friends">{{ $t('View_friends') }}</a>
				</div>
				<div class="info-box-orange mb-2 col-md-6 cntnr"><i class="fas fa-angle-double-left text-brand mr-2"></i>{{ $t('Followers') }}: {{ numberFormat(userinfo.follower_count,0) }}</div>
				<div class="info-box-orange mb-2 col-md-6 cntnr"><i class="fas fa-angle-double-right text-brand mr-2"></i>{{ $t('Following') }}: {{ numberFormat(userinfo.following_count,0) }}</div>
				<div class="info-box-orange mb-2 col-md-6 cntnr" v-if="userinfo.witness_votes.includes('actifit')"><i class="fas fa-cubes text-brand mr-2"></i>&nbsp;{{ $t('Votes_Actifit_Witness') }}&nbsp;<i class="fas fa-check text-success"></i></div>
				<div class="info-box-orange mb-2 col-md-6 cntnr" v-else><i class="fas fa-cubes text-brand mr-2"></i>&nbsp;<a class="btn btn-brand" href="https://steemconnect.com/sign/account-witness-vote?witness=actifit&approve=true" target="_blank">{{ $t('Vote_Now_Actifit_Witness') }}</a></div>
				<div class="info-box-orange mb-2 col-md-6 cntnr" v-if="actifitDelegator"><i class="fas fa-file-invoice-dollar text-brand mr-2"></i>&nbsp;{{ $t('Delegates_to_Actifit') }} {{ actifitDelegator.steem_power }} {{ $t('Steem_Power') }}</div>
				<div class="info-box-orange mb-2 col-md-6 cntnr" v-else><i class="fas fa-file-invoice-dollar text-brand"></i>&nbsp;<a class="btn btn-brand" href="https://steembottracker.com/delegation.html?delegatee=actifit" target="_blank">{{ $t('Delegate_Now_Actifit') }}</a></div>
			</div>
			
			<div class="text-brand" v-if="!account_banned" >
				<div class="row m-0">
					<div class="info-box-orange mb-2 col-md-6 cntnr">
						<img src="/img/actifit_logo.png" class="mr-2 token-logo">
						<a href="/wallet" >{{ numberFormat(userTokenCount, 3) }} {{ $t('AFIT_Tokens') }} + {{ displayAFITSEBal }} {{ $t('AFIT_SE_Tokens') }} + {{ displayAFITHEBal }} {{ $t('AFIT_HE_Tokens') }}</a>&nbsp;
						<button class="btn btn-brand border" v-on:click="tipUser" >{{ $t('Send_tip') }}</button>
					</div>
					<div class="info-box-orange mb-2 col-md-6 cntnr">
						<img src="/img/AFITX.png" class="mr-2 token-logo">
						<a href="/wallet" >{{ displayAFITXBal }} {{ $t('AFITX_Tokens') }} + {{ displayAFITXHEBal }} {{ $t('AFITX_HE_Tokens') }}</a>&nbsp;
					</div>
				</div>
				<div v-if="proceedTip">
					<div class="tip-details">
						<div class="row">
							<label for="tip-amount" class="w-25 p-2">{{ $t('Tip_Amount') }}</label>
							<input type="number" id="tip-amount" name="tip-amount" ref="tip-amount" class="form-control-lg w-50 p-2">
						</div>
						<div class="row">
							<label for="funds-pass" class="w-25 p-2">{{ $t('Funds_Password') }}</label>
							<input type="password" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control-lg w-50 p-2">
							<a href="/wallet?action=set_funds_pass" target="_blank" class="btn btn-brand border m-1">{{ $t('create_pass_short') }}</a>
						</div>
						<div class="row">
							<div v-if="tipError" v-html="tipError" class="m-3"></div>
						</div>
						<button v-on:click="proceedTipActivity" class="btn btn-brand w-50 border m-3">{{ $t('Proceed') }}</button>
						<i class="fas fa-spin fa-spinner" v-if="tipInProgress"></i>
					</div>
				</div>
				<div class="info-box-orange mb-2 col-md-12 cntnr">
					<i class="fab fa-angellist mr-2"></i><a :href="'/activity/'+displayUser" >{{ numberFormat(rewardedPostCount, 0) }} {{ $t('Activity_Reports_Rewarded') }}</a>&nbsp;
					<a :href="'/activity/'+displayUser" class="btn btn-brand border m-2">{{ $t('View_reports') }}</a>
				</div>
			</div>
		  </div>
		  
			<adsbygoogle ad-slot="8625360638" :ad-style="acti_goog_ad_square"/>
			
		  <!-- badges section -->
		  <div v-if="userinfo && !account_banned" class="user-badges">
		    <h3 class="text-brand badges-title"><i class="fas fa-trophy"></i> {{ $t('Badges') }}</h3>
		    <div class="badge-entry iso-badge">
			  <div :title="$t('iso_badge_title')">
				<div class="badge-title">{{ $t('iso_badge_title') }}</div>
				<div id="iso-badge" class="claimed-check" v-if="userHasBadge(iso_badge)"><div><img class="badge-img" src="/img/badges/actifit_iso_badge.png"></div><div class="text-brand claimed-check"><i class="fas fa-check"></i></div></div>
				<div id="iso-badge" class="claimed-check"  v-else><img class="badge-img badge-unclaimed" src="/img/badges/actifit_iso_badge.png"></div>
				<button v-if="badgeClaimable(iso_badge)" v-on:click="claimBadge(iso_badge)" class="btn btn-brand btn-lg border">{{ $t('Claim_badge') }}</button>
				<div v-else-if="this.isoParticipant.length == 0" class="col-md-4 text-brand claimed-check">{{ $t('missed_event_notice') }}</div>
				<div v-if="claimingBadge == iso_badge" id="claiming_badge">
					<i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
				</div>
			  </div>
			</div>
			
			<div class="badge-entry rew-activity-badge">
			  <div class="badge-title">{{ $t('rew_activity_badge_title') }}</div>
			  <div v-for="level in rewarded_posts_rules" :key="level[1]" 
				class="single-rew-activity-badge" :style="{left: (level[1]-1) * activ_badge_indent + 'px'}"
				:title="$t('rew_activity_badge_level_title') + ' ' + level[1]">
				<div v-if="level[1] > 0 && level[1] <= maxClaimedActivityBadgeLevel()">
					<div :id="rew_activity_badge+level[1]" class="claimed-check" v-if="userHasBadge(rew_activity_badge+level[1])">
						<div><img class="badge-img" :src="'/img/badges/actifit_rew_act_lev_'+level[1]+'_badge.png'"></div>
						<div class="text-brand claimed-check"><i class="fas fa-check"></i></div>
					</div>
					<div :id="rew_activity_badge+level[1]" class="claimed-check unclaimed-badge" v-else :style="{left:  claimable_badge_indent + 'px'}">
						<img class="badge-img badge-unclaimed" :src="'/img/badges/actifit_rew_act_lev_'+level[1]+'_badge.png'">
					</div>
					<div>
						<button v-if="badgeClaimable(rew_activity_badge+level[1])" v-on:click="claimBadge(rew_activity_badge+level[1])" class="btn btn-brand btn-lg border unclaimed-badge unclaimed-badge-btn" :style="{left: claimable_badge_indent + 'px'}">{{ $t('Claim_badge') }}</button>
						<div v-if="!badgeClaimable(rew_activity_badge+level[1]) && !userHasBadge(rew_activity_badge+level[1])" class="unclaimed-badge text-brand unclaimed-badge-btn unclaimed-badge-note " :style="{left:  claimable_badge_indent + 'px'}" :title="$t('next_target')">
						  <i class="fas fa-crosshairs"></i>
						</div>
						<div v-if="claimingBadge == rew_activity_badge+level[1]" id="claiming_badge" class="unclaimed-badge unclaimed-badge-spin" :style="{left: claimable_badge_indent + 'px'}">
							<i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
						</div>
					</div>
				</div>
			  </div>
			</div>
			
			<div class="badge-entry doubledup-activity-badge">
				<div class="badge-title">{{ $t('doubledup_badge_title') }}</div>
				<div :title="$t('doubledup_badge_title')">
					<div id="doubledup-badge" class="claimed-check" v-if="userHasBadge(doubledup_badge)"><div><img class="badge-img" src="/img/badges/actifit_doubled_up_badge.png"></div><div class="text-brand claimed-check"><i class="fas fa-check"></i></div></div>
					<div id="doubledup-badge" class="claimed-check"  v-else><img class="badge-img badge-unclaimed" src="/img/badges/actifit_doubled_up_badge.png"></div>
					<button v-if="badgeClaimable(doubledup_badge)" v-on:click="claimBadge(doubledup_badge)" class="btn btn-brand btn-lg border unclaimed-badge-btn">{{ $t('Claim_badge') }}</button>
					<div v-else-if="this.doubledupWinner.length == 0" class="badge-doubledup-desc claimed-check">{{ $t('not_lucky_yet') }}</div>
					<div v-if="claimingBadge == doubledup_badge" id="claiming_badge">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
					</div>
				</div>
			</div>
			
			<div class="badge-entry charity-activity-badge">
				<div class="badge-title">{{ $t('charity_badge_title') }}</div>
				<div :title="$t('charity_badge_title')">
					<div id="charity-badge" class="claimed-check" v-if="userHasBadge(charity_badge)"><div><img class="badge-img" src="/img/badges/actifit_charity_badge.png"></div><div class="text-brand claimed-check"><i class="fas fa-check"></i></div></div>
					<div id="charity-badge" class="claimed-check"  v-else><img class="badge-img badge-unclaimed" src="/img/badges/actifit_charity_badge.png"></div>
					<button v-if="badgeClaimable(charity_badge)" v-on:click="claimBadge(charity_badge)" class="btn btn-brand btn-lg border unclaimed-badge-btn">{{ $t('Claim_badge') }}</button>
					<!--<div v-else-if="this.charityDonor.length == 0" class="badge-charity-desc text-brand claimed-check">{{ $t('not_lucky_yet') }}</div>-->
					<div v-if="claimingBadge == charity_badge" id="claiming_badge">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
					</div>
				</div>
			</div>
			
			<div v-if="claimError">{{ claimErrorDesc }}</div>
		  </div>
		  </div>
        
		</div>
	</div>
	<div v-else class="container pt-5 mt-5 pb-5" >
		<div class="mb-3 text-center">
          <h4>{{ errorDisplay }}</h4>
		</div>
	</div>
	<MeasureChartModal :userMeasurements="userMeasurements"	/>
	
	<ActivityChartModal :userActivity="userActivity"	/>
	
	<Footer />
	<no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Footer from '~/components/Footer'

  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import {mapGetters} from 'vuex'
  
  import Vue from 'vue'
  
  import MeasureChartModal from '~/components/MeasureChartModal'
  
  import ActivityChartModal from '~/components/ActivityChartModal'
  
  /* import badges component */
  import { BadgePlugin } from 'bootstrap-vue'
  Vue.use(BadgePlugin)
  
  import SSC from 'sscjs'
  const ssc = new SSC(process.env.steemEngineRpc);
  
  const hsc = new SSC(process.env.hiveEngineRpc);

  export default {
	head () {
		return {
		  title: `Actifit user profile ${this.username} - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Actifit profile view for ${this.username}` },
			{ hid: 'ogdescription', name: 'og:description', content: `Actifit profile view for ${this.username}` }
		  ]
		}
	},
	data () {
		return {
			report: '',
			displayUser: '',
			errorDisplay: '',
			userRank: '',
			rewardedPostCount: '',
			loading: false,
			userinfo: '',
			noUserFound: false,
			userTokenCount: '',
			userFriends: [],
			friendRequests: [],
			friendshipLoader: false,
			maxFriendDisplay: 5,
			userAFITSETokenCount: '',
			userAFITXSETokenCount: '',
			userAFITHETokenCount: '',
			userAFITXHETokenCount: '',			
			isoParticipant: [],
			doubledupWinner: [],
			charityDonor: [],
			userBadges: [],
			claimError: '',
			claimErrorDesc: '',
			iso_badge: 'iso',
			rew_activity_badge: 'rewarded_activity_lev_',
			doubledup_badge: 'doubledup_badge',
			charity_badge: 'charity_badge',
			claimingBadge: false,
			actifitDelegator: '',
			activ_badge_indent: 10,
			claimable_badge_indent: 125,
			account_banned: false,
			tipError: '',
			tipInProgress: false,
			proceedTip: false,
			addFriendError: '',
			cur_bchain: 'HIVE',
			acti_goog_ad_square:{display:'inline-block', maxWidth:'300px', maxHeight: '350px'},
			rewarded_posts_rules: [
									[9,0],
									[29,1],
									[59,2],
									[89,3],
									[119,4],
									[179,5],
									[359,6],
									[539,7],
									[719,8],
									[1079,9],
									[1080,10]
								],
			lastHeight: '-',
			heightUnit: '',
			lastWeight: '-',
			weightUnit: '',
			lastChest: '-',
			chestUnit: '',
			lastWaist: '-',
			waistUnit: '',
			lastThighs: '-',
			thighsUnit: '',
			lastBodyfat: '-',
			lastUpdated: '-',
			userMeasurements: [],
			userActivity: [],
			lastActivityCount: '-',
			lastActivityDate: '-',
			displayAddFriendStats: false,
			displayAddFriendActivity: false,
			displayLoginStats: false,
			displayLoginActivity: false,
			loadingData: true,
		}
	},
	watch: {
	  user: 'fetchUserData',
	  bchain: async function(newBchain) {
		console.log('profile change in chain '+newBchain);
		this.cur_bchain = newBchain;
		await this.$store.dispatch('steemconnect/refreshUser');
		this.fetchUserData();
		//this.reload += 1;
	  }
	},
	components: {
	  NavbarBrand,
	  UserMenu,
	  Footer,
	  MeasureChartModal,
	  ActivityChartModal
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['newlyVotedPosts', 'bchain']),
	  ...mapGetters(['userTokens'],['commentEntries'], 'commentCountToday'),
	  displayAFITXBal () {
		if (!isNaN(this.userAFITXSETokenCount)){
			return this.numberFormat(this.userAFITXSETokenCount, 3);
		}
		return 0;
	  },
	  displayAFITSEBal () {
		if (!isNaN(this.userAFITSETokenCount)){
			return this.numberFormat(this.userAFITSETokenCount, 3);
		}
		return 0;
	  },
	  displayAFITXHEBal () {
		if (!isNaN(this.userAFITXHETokenCount)){
			return this.numberFormat(this.userAFITXHETokenCount, 3);
		}
		return 0;
	  },
	  displayAFITHEBal () {
		if (!isNaN(this.userAFITHETokenCount)){
			return this.numberFormat(this.userAFITHETokenCount, 3);
		}
		return 0;
	  },
	  formattedProfileUrl () {
		return "https://actifit.io/" + this.displayUser;
	  },
	  /*getUserRank() {
		//proper formatting issue to display circle for smaller numbers
		if (this.userRank<10){
			return ' '+parseFloat(this.userRank).toFixed(1);
		}else{
			return parseFloat(this.userRank).toFixed(1);
		}
	  },*/
	  displayCoreUserRank () {
		return (this.userRank?parseFloat(this.userRank.rank_no_afitx).toFixed(2):'');
	  },
	  displayIncreasedUserRank () {
		return '(+' + parseFloat(this.userRank.afitx_rank).toFixed(2) + ')';
	  },
	  userMeta() {
	    try{
		  return JSON.parse(this.userinfo.json_metadata);
		}catch(err){
		  return null;
		}
	  },
	  // get username from url
      username () {
	    if (this.$route.params.username.startsWith('@')){
		  return this.$route.params.username.substring(1, this.$route.params.username.length);
		}
        return this.$route.params.username
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
	  maxClaimedActivityBadgeLevel() {
		let maxActivityBadge = 0;
		let par_ref = this;
		this.userBadges.forEach(function (badgeEntry){
			if (badgeEntry.badge.includes(par_ref.rew_activity_badge)){
				let badgeLevel = badgeEntry.badge.replace(par_ref.rew_activity_badge,'');
				if (parseInt(maxActivityBadge) < parseInt(badgeLevel)){
				  //found higher level, store
				  maxActivityBadge = badgeLevel;
				}
			}
		})
		if (maxActivityBadge == 0) this.claimable_badge_indent = 0;
		else this.claimable_badge_indent = 125;
		return parseInt(maxActivityBadge)+1;
	  },
	  /**
	  * function handles mapping and calculating relevant score
	  * params: 
	  * * 2D array providing couplets of rules
	  * * factor multipier for data
	  * * current value to compare
	  */
	  calcScore(rules_array, value){
		var result;
		for (var i=0; i<rules_array.length; i++){
			var rule = rules_array[i];
			
			//default until we find a larger range that fits better
			result = rule[1];
			
			if (parseInt(value) <= parseInt(rule[0])){
				break;
			}
		}
		return result;
	  },
	  async processTrxFunc(op_name, cstm_params){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.block_num) {
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
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+this.cur_bchain);

			
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
	  //handles sending add friend request
	  async addFriend() {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (this.displayUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_friend_self');
			return false;
		}
		if (this.isFriend()){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_add_friend').replace('_USERNAME_', this.displayUser));
		if (!userConf) {
		  return;
		}		
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'add-friend-request', 'target': this.displayUser})
		  };
		let res = await this.processTrxFunc('custom_json', cstm_params);
		console.log(res.success);
		if (res.success){
			//success, store request to DB
			this.propagateFriendReq(res.trx.tx);
		}else{  			
			this.friendshipLoader = false;
		}
	  },
	  async propagateFriendReq(res) {
		let req_res = await fetch(process.env.actiAppUrl+'addFriend/'
			+ this.user.account.name + '/'
			+ this.displayUser + '/'
			+ res.block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friend request sent');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friend_request_sent'),
			  position: 'top center'
			})
		}else{
			console.log('error sending friend request');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async cancelFriendRequest() {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (this.displayUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_unfriend_self');
			return false;
		}
		if (this.isFriend()){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_cancel_friend_request').replace('_USERNAME_', this.displayUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'cancel-friend-request', 'target': this.displayUser})
		  };
		let res = await this.processTrxFunc('custom_json', cstm_params);
		//console.log(res);
		if (res.success){
			//success, store request to DB
			this.cancelFriendReq(res.trx.tx);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async cancelFriendReq(res) {
		let req_res = await fetch(process.env.actiAppUrl+'cancelFriendRequest/'
			+ this.user.account.name + '/'
			+ this.displayUser + '/'
			+ res.block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friend request cancelled');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friend_request_cancelled'),
			  position: 'top center'
			})
		}else{
			console.log('error cancelling friend request');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async dropFriend() {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (this.displayUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_unfriend_self');
			return false;
		}
		if (!this.isFriend()){
			this.addFriendError = this.$t('Not_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_drop_friend').replace('_USERNAME_', this.displayUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'cancel-friendship', 'target': this.displayUser})
		  };
		let res = await this.processTrxFunc('custom_json', cstm_params);
		console.log(res);
		if (res.success){
			//success, store request to DB
			this.dropFriendship(res.trx.tx);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async dropFriendship(res) {
		let req_res = await fetch(process.env.actiAppUrl+'dropFriendship/'
			+ this.user.account.name + '/'
			+ this.displayUser + '/'
			+ res.block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friendship dropped');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friendship_dropped'),
			  position: 'top center'
			})
		}else{
			console.log('error dropping friendship');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async acceptFriend() {
		this.addFriendError = '';
		if (!this.user){
			this.addFriendError = this.$t('Need_login');
			return false;
		}
		if (this.displayUser == this.user.account.name){
			this.addFriendError = this.$t('Cannot_unfriend_self');
			return false;
		}
		if (this.isFriend()){
			this.addFriendError = this.$t('Already_friends');
			return false;
		}
		let userConf = confirm(this.$t('confirm_accept_friend').replace('_USERNAME_', this.displayUser));
		if (!userConf) {
		  return;
		}
		this.friendshipLoader = true;
		//send request to BC
		//broadcast the transaction to Steem BC
		let cstm_params = {
			required_auths: [],
			required_posting_auths: [this.user.account.name],
			id: 'actifit',
			json: JSON.stringify({'transaction': 'accept-friendship', 'target': this.displayUser})
		  };
		let res = await this.processTrxFunc('custom_json', cstm_params);
		console.log(res);
		if (res.success){
			//success, store request to DB
			this.acceptFriendPropagate(res.trx.tx);
		}else{
			this.friendshipLoader = false;
		}
	  },
	  async acceptFriendPropagate(res) {
		let req_res = await fetch(process.env.actiAppUrl+'acceptFriend/'
			+ this.user.account.name + '/'
			+ this.displayUser + '/'
			+ res.block_num + '/'
			+ res.id + '/' + this.cur_bchain);
		let outcome = await req_res.json();
		if (outcome.status=='success'){
			console.log('friendship accepted');
			this.friendshipLoader = false;
			//notify of success
			this.$notify({
			  group: 'success',
			  text: this.$t('friendship_accepted'),
			  position: 'top center'
			})
		}else{
			console.log('error accepting friendship');
			this.addFriendError = this.$t('unknown_error');
			this.friendshipLoader = false;
			return false;
		}
		this.refreshFriendStatus();
	  },
	  async refreshFriendStatus() {
		//grab user friends list
		let res = await fetch(process.env.actiAppUrl+'userFriends/'+this.displayUser);
		let outcome = await res.json();
		this.userFriends = outcome;
		//console.log(outcome);
		//console.log(this.userFriends);
		
		//grab pending user friend requests (sent and received)
		let quer = await fetch(process.env.actiAppUrl+'userFriendRequests/'+this.displayUser);
		this.friendRequests = await quer.json();
		//console.log('friendRequests');
		//console.log(this.friendRequests);
	  },
	  //handles displaying/closing tip section
	  tipUser() {
		this.proceedTip = !this.proceedTip;
	  },
	  //handles actual tipping action
	  async proceedTipActivity() {
		this.tipError = '';
		if (!this.user){
			this.tipError = this.$t('Need_login_tip');
			return false;
		}
		if (this.displayUser == this.user.account.name){
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
		if (parseFloat(this.$refs["tip-amount"].value) > parseFloat(this.userTokens)){
		  this.tipError = this.$t('amount_above_balance');
		  return;
		}
		this.tipInProgress = true;
		//proceed with tipping
		let res = await fetch(process.env.actiAppUrl+'tipAccount/'
			+ '?user=' + this.user.account.name
			+ '&targetUser=' + this.displayUser
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
			let res = await this.processTrxFunc('custom_json', cstm_params);
			//console.log(res);
			if (res.success){
				//notify of success
				this.$notify({
				  group: 'success',
				  text: this.$t('tip_successfully_sent'),
				  position: 'top center'
				})
				//update sender token count
				//ensure we fetch proper logged in user data
				this.$store.dispatch('fetchUserTokens')
				
				//update recipient token count
				this.userTokenCount = outcome.recipientTokenCount;
			}else{
				this.friendshipLoader = false;
			}
			
			this.proceedTip = false;
		}else{
			this.tipError = outcome.error;
		}
		this.tipInProgress = false;
	  },
	  getUserActivityLevel() {
		return this.calcScore(this.rewarded_posts_rules, this.rewardedPostCount) 
	  },
	  /* handles checking if the user had claimed this badge already */
	  userHasBadge(badgeType) {
		if (this.userBadges.length>0){
		  let matchingBadge = this.userBadges.find( badge_entry => (badge_entry.user === this.displayUser && badge_entry.badge === badgeType));
		  if (matchingBadge){
			return true;
		  }
		}
		return false;
	  },
	  /* handles checking if the badge is available for claim by this user */
	  badgeClaimable(badgeType) {
	    /*console.log('badgeClaimable:'+badgeType);
		console.log(this.rew_activity_badge);
		console.log(badgeType.includes(this.rew_activity_badge));
		console.log('----');*/
		//make sure this is the logged in user taking action
		if (!this.user || (this.displayUser !== this.user.account.name)){
			return false;
		}
		if (this.userHasBadge(badgeType)){
		  return false;
		}else if (badgeType == this.iso_badge && this.isoParticipant.length > 0){
		  return true;
		}else if (badgeType.includes(this.rew_activity_badge)){
		  //if this is a rewarded activity level badge
		  let badgeLevel = badgeType.replace(this.rew_activity_badge,'');
		  //check if user level passed the min level for this badge
		  if (this.getUserActivityLevel() >= badgeLevel){
			return true;
		  }
		}else if (badgeType == this.doubledup_badge && this.doubledupWinner.length > 0){
		  return true;
		}else if (badgeType == this.charity_badge && this.charityDonor.length > 0){
		  return true;
		}
		return false;
	  },
	  /* handles returning the date portion without time */
	  pureDate(val) {
		console.log(val);
		if (!val || val=='-'){
			return '';
		}
        let date = new Date(val)
        return date.getDate() + '/' 
			+ (date.getMonth() + 1) + '/' 
			+ date.getFullYear()
      },
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){	  
		  
		  //update user info from blockchain
		  //console.log(this.stdLogin);
		  if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			try{
				let user_data = await this.$steemconnect.me();
				this.user.account = user_data.account;
			}catch(excp){
				console.log(excp);
			}
		  }
		  //ensure we fetch proper logged in user data
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$forceUpdate()
		}
	  },
	  setProperNode (){
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		let properNode = hive;
		if (cur_bchain == 'STEEM'){
			properNode = steem;
		}
		console.log(cur_bchain);
		return properNode;
	  },
	  /* handles fetching of user related info */
	  async getAccountData () {
		
		let parentRef = this;
		
		let chainLnk = await this.setProperNode();
		
		chainLnk.api.getAccounts([this.displayUser], function(err, result) {
			parentRef.loadingData = false;
			//result now contains the account details
			if (result.length == 0){
			  parentRef.noUserFound = true;
			  parentRef.errorDisplay = parentRef.$t('user_not_found_error');
			}else{
			  parentRef.userinfo = result[0];
			  
			  //grab and display follower and following count
				chainLnk.api.getFollowCount(parentRef.displayUser, function(err, result) {
					//console.log(err, result);
					if (!err) {
					  parentRef.userinfo.follower_count = result.follower_count;
					  parentRef.userinfo.following_count = result.following_count;
					}
				});
			}
		});
		 
		this.refreshFriendStatus();
	  },
	  isFriend(){
		if (this.user){
			console.log(this.userFriends)
			if (this.userFriends && this.userFriends.find( friend => (friend.friend == this.user.account.name))){
				console.log('friend true');
				return true;
			}
			return false;
		}
		return false;
	  },
	  isOwnAccount(){
		if (this.user){
			return (this.displayUser == this.user.account.name)
		}
		return false;
	  },
	  isPendingFriend(){
		if (this.user && this.friendRequests){
			console.log(this.friendRequests)
			if (this.friendRequests.sent_pending && this.friendRequests.sent_pending.find( friend => (friend.target == this.user.account.name))){
				console.log('friend true');
				return {status: true, direction: 1};
			}
			if (this.friendRequests.received_pending && this.friendRequests.received_pending.find( friend => (friend.initiator == this.user.account.name))){
				console.log('friend true');
				return {status: true, direction: 0};
			}
			return false;
		}
		return false;
	  },
	  //handles displaying some of the logos of friends
	  showFriendsSnippet(){
		let snipp = '<span>';
		for (let i=0; i < Math.min(this.userFriends.length, this.maxFriendDisplay); i++){
			snipp += '<div class="user-avatar-small mr-1" title="' + this.userFriends[i].friend + '" style="background-image: url(\'https://steemitimages.com/u/' + this.userFriends[i].friend + '/avatar\')"></div>';
		}
		if (this.userFriends.length > this.maxFriendDisplay){
			snipp += '+ ' + (this.userFriends.length - this.maxFriendDisplay) + ' ' + this.$t('other') + ' ' + this.$t('friends')+'';
		}
		snipp += '</span>';
		return snipp;
	  },
	  /* handles the actual claim of a badge */
	  async claimBadge(badgeType) {
		if (this.badgeClaimable(badgeType)){
			this.claimingBadge = badgeType;
			//enable this badge for this user
			try{
				let res = await fetch(process.env.actiAppUrl+'claimBadge/?user='+this.displayUser+'&badge='+badgeType);
				let outcome = await res.json();
				if (outcome.status=='success'){
					//store the transaction to Steem BC
					let cstm_params = {
						required_auths: [],
						required_posting_auths: [this.user.account.name],
						id: 'actifit',
						json: "{ \"claimed_badge\": \""+badgeType+"\"}"
					};
					let res = await this.processTrxFunc('custom_json', cstm_params);
					//console.log(res);
					if (res.success){
						console.log('success');
					}else{
						console.log('error');
					}
					
					this.userBadges.push(outcome);
				}else{
					console.error(outcome);
				}
			}catch(err){
				console.error(err);
			}
			this.claimingBadge = '';
		}else{
		  this.claimError = true;
		  this.claimErrorDesc = this.$t('badge_reqts_not_met');
	    }
	  },
	  async setUserMeasurements(json){
		//first row contains latest measurements, if any
		console.log('setUserMeasurements');
		console.log(json);
		this.userMeasurements = json;
		if (Array.isArray(json) && json.length > 0){
			console.log(json[0].json_metadata.height);
			json[0].json_metadata.height?this.lastHeight = json[0].json_metadata.height:'';
			json[0].json_metadata.heightUnit?this.heightUnit = json[0].json_metadata.heightUnit:'';
			json[0].json_metadata.weight?this.lastWeight = json[0].json_metadata.weight:'';
			json[0].json_metadata.weightUnit?this.weightUnit = json[0].json_metadata.weightUnit:'';
			json[0].json_metadata.chest?this.lastChest = json[0].json_metadata.chest:'';
			json[0].json_metadata.chestUnit?this.chestUnit = json[0].json_metadata.chestUnit:'';
			json[0].json_metadata.waist?this.lastWaist = json[0].json_metadata.waist:'';
			json[0].json_metadata.waistUnit?this.waistUnit = json[0].json_metadata.waistUnit:'';
			json[0].json_metadata.thighs?this.lastThighs = json[0].json_metadata.thighs:'';
			json[0].json_metadata.thighsUnit?this.thighsUnit = json[0].json_metadata.thighsUnit:'';
			json[0].json_metadata.bodyfat?this.lastBodyfat = json[0].json_metadata.bodyfat:'';
			json[0].date?this.lastUpdated = json[0].date:'';
		}
	  },
	  async setUserActivity(json){
		//first row contains latest activity, if any
		console.log('setUserActivity');
		console.log(json);
		this.userActivity = json;
		if (Array.isArray(json) && json.length > 0){
			console.log(json[0].json_metadata);
			this.lastActivityCount = this.numberFormat(json[0].json_metadata.step_count[0]);
			this.lastActivityDate = this.pureDate(json[0].date);
		}
	  },
	},
	async mounted () {
	
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		steem.api.setOptions({ url: process.env.steemApiNode });
		hive.api.setOptions({ url: process.env.hiveApiNode });
		// login
		this.$store.dispatch('steemconnect/login')
		this.fetchUserData();
		
		// try to fetch data
	    if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined') ) {
		  this.displayUser = this.$route.params.username
		  if (this.$route.params.username.startsWith('@')){
			this.displayUser = this.$route.params.username.substring(1, this.$route.params.username.length);
		  }
		  
		  //grab the user's latest stats if available
		  fetch(process.env.actiAppUrl+'trackedMeasurements/' + this.displayUser).then(res => {
			res.json().then(json => this.setUserMeasurements(json))}).catch(e => console.log(e))
		  
		  //grab the user's latest posts data
		  fetch(process.env.actiAppUrl+'trackedActivity/' + this.displayUser).then(res => {
			res.json().then(json => this.setUserActivity(json))}).catch(e => console.log(e))
		  
		  //grab the author's rank
		  fetch(process.env.actiAppUrl+'getRank/' + this.displayUser).then(res => {
			res.json().then(json => this.userRank = json)}).catch(e => reject(e))
		  
		  fetch(process.env.actiAppUrl+'userRewardedPostCount/' + this.displayUser).then(res => {
			res.json().then(json => this.rewardedPostCount = json.rewarded_post_count)}).catch(e => reject(e))
		
		  //let's grab the user's AFIT tokens balance
		  fetch(process.env.actiAppUrl+'user/'+this.displayUser).then(
			res => {res.json().then(json => this.userTokenCount = json.tokens)}).catch(e => console.log(e))
		
		  //let's grab user's current badges
		  fetch(process.env.actiAppUrl+'userBadges/'+this.displayUser).then(
			res => {res.json().then(json => this.userBadges = json)}).catch(e => reject(e))
		
		  //let's check if user participated in ISO event
		  fetch(process.env.actiAppUrl+'isoParticipant/'+this.displayUser).then(
			res => {res.json().then(json => this.isoParticipant = json)}).catch(e => reject(e))
			
		  //let's check if this user delegates to Actifit
		  fetch(process.env.actiAppUrl+'delegation/'+this.displayUser).then(
			res => {res.json().then(json => this.actifitDelegator = json)}).catch(e => reject(e))
			
		
		  //let's check if this user had won lucky doubled up before
		  fetch(process.env.actiAppUrl+'luckyWinner/'+this.displayUser).then(
			res => {res.json().then(json => this.doubledupWinner = json)}).catch(e => reject(e))
			
		  //let's check if this user had any charity contributions before
		  fetch(process.env.actiAppUrl+'charityDonor/'+this.displayUser).then(
			res => {res.json().then(json => this.charityDonor = json)}).catch(e => reject(e))	
			
			
		  //let's check if this user is banned
		  fetch(process.env.actiAppUrl+'is_banned/'+this.displayUser).then(
			res => {res.json().then(json => this.account_banned = json)}).catch(e => reject(e))
			
		  
		  try{
		  //fetch user's AFIT S-E balance
		  let bal = await ssc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFIT' });
		  if (bal){
			  this.userAFITSETokenCount = bal.balance;
		  }
		  
		  //fetch user's AFITX S-E balance
		  bal = await ssc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFITX' });
		  if (bal){
			  this.userAFITXSETokenCount = bal.balance;
		  }
		  
		  //fetch user's AFIT H-E balance
		  bal = await hsc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFIT' });
		  if (bal){
			  this.userAFITHETokenCount = bal.balance;
		  }
		  
		  //fetch user's AFITX H-E balance
		  bal = await hsc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFITX' });
		  if (bal){
			  this.userAFITXHETokenCount = bal.balance;
		  }
		  
		  }catch(err){
			//avoid time outs causing page not to load
			console.log(err);
		  }
		
		  this.getAccountData();
		}else{
		  this.errorDisplay = this.$t('user_not_found_error');
		}
		  	
	}
  }
</script>

<style>
	.user-name{
		margin-left: 10px;
		padding: 10px;
	}
	.large-avatar{
		width: 128px;
		height: 128px;
	}
	.report-head{
		border-bottom: 1px solid red;
	}
	img{
		max-width: 100%;
	}
	.report-tags{
		font-style: italic;
	}
	.modal-author{
		margin-left: 10px !important;
	}
	.actifit-link-plain{
	  color: black;
	}
	.modal-body{
	  word-break: break-word;
	}
	a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover{
	  text-decoration: none;
	}
	.date-head{
	  padding-left: 2px;
	}
	@media only screen and (min-width: 601px) {
		.user-avatar{
		  float: left;
		}
		
		.badge-img, .claimed-check{
		  width: 150px;
		  text-align: center;
		}
		.rew-activity-badge{
		  position: relative;
		  height: 270px;
		}
	}
	@media only screen and (max-width: 600px) {
		.user-details{
		  padding-left: 10px;
		}
		.badge-img, .claimed-check{
			width: 100px;
			text-align: center;
		}
		.rew-activity-badge{
		  position: relative;
		  height: 190px;
		}
	}
	.user-avatar{
		margin-left: 10px;
	}
	.badges-title{
	  text-align: center;
	}
	.badge-title{
	  padding-left: 20px;
	  font-weight: bold;
	}
	.badge-unclaimed{
	  opacity: 0.2
	}
	.user-badges{
	  /*border: 2px #ff112d solid;*/
	  margin: 10px;
	}
	.tip-details{
	  border: 2px #ff112d solid;
	  margin: 10px;
	  padding: 10px;
	}
	.location-text{
	  word-break: break-all;
	}
	a.btn{
	  border: 1px solid white
	}
	.single-rew-activity-badge{
	  position: absolute;
	  top: 20px;
	}
	.unclaimed-badge{
	  position: relative;
	}
	.unclaimed-badge-spin{
	  /*top: 220px;*/
	  width: 200px;
	}
	.unclaimed-badge-btn{
	  /*top: 170px;*/
	  width: 200px;
	  padding-left: 20px;
	}
	.unclaimed-badge-note{
	  font-style: italic;
	}
	.badge-doubledup-desc{
	  padding-left: 20px;
	  width: 200px;
	  text-align: left;
	  font-style: italic;
	}
	.token-logo{
	  width: 20px;
	  height: 20px;
    }
	.increased-rank{
		color: #76BB0E;
	}
	.fas{
	  cursor: pointer;
	}
	.info-box {
		border: 1px solid #fff;
		color: #fff;
		background: linear-gradient(30deg, red, transparent);
	}
	.info-box-orange{
		color: #ff4500;
		background: linear-gradient(30deg, orange, transparent);
	}
	.badge-entry{
		color: #fff !important;
		background: linear-gradient(45deg, green, orange);
		border: 1px solid #fff;
	}
	.force-white-url{
		color: white !important;
		text-decoration: underline;
	}
	.cntnr{
		min-height: 80px;
	}
	.acti-widget{
		border: 2px #ff112d solid;
	}
	
	.acti-widget img{
		width: 50px;
		max-width: unset;
	}
	.activity-small-logo{
		width: 25px!important;
	}
	.phishy h6{
		font-weight: bold;
	}
</style>
