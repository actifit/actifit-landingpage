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
	<div v-if="errorDisplay==''" class="container pt-5 mt-5 pb-5 col-md-9" >
	  <h5 class="text-brand" v-if="displayUser">
			<a :href="formattedProfileUrl" target="_blank">@{{ displayUser }} <small class="text-brand numberCircle">{{ getUserRank }}</small></a></h5>
        <div class="mb-3 col-md-9">
		  <div class="user-avatar large-avatar mr-1 mb-5"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.displayUser + '/avatar)'"></div>
		  <div v-if="userinfo" class="user-details">
			<div><i class="fas fa-user"></i> {{ userinfo.name }}</div>
			<div v-if="userMeta && userMeta.profile">
				<div class="location-text" ><i class="fas fa-street-view"></i> {{ userMeta.profile.location }}</div>
				<div><i class="fas fa-address-card"></i> {{ userMeta.profile.about }}</div>
				<div><i class="fas fa-link"></i>&nbsp;<a href="userMeta.profile.website">{{ userMeta.profile.website }}</a></div>
			</div>
			<div><i class="fas fa-calendar-alt"></i> {{ $t('Joined_On') }} {{ pureDate(userinfo.created) }}</div>
			<div><i class="fas fa-pen"></i> {{ numberFormat(userinfo.post_count, 0) }} {{ $t('Steem_posts_comments') }}</div>
			<div v-if="userinfo.witness_votes.includes('actifit')"><i class="fas fa-cubes text-brand"></i>&nbsp;{{ $t('Votes_Actifit_Witness') }}</div>
			<div v-else><i class="fas fa-cubes  text-brand"></i>&nbsp;<a class="btn btn-brand" href="https://steemconnect.com/sign/account-witness-vote?witness=actifit&approve=1" target="_blank">{{ $t('Vote_Now_Actifit_Witness') }}</a></div>
			<div v-if="actifitDelegator"><i class="fas fa-file-invoice-dollar  text-brand"></i>&nbsp;{{ $t('Delegates_to_Actifit') }} {{ actifitDelegator.steem_power }} {{ $t('Steem_Power') }}</div>
			<div v-else><i class="fas fa-file-invoice-dollar  text-brand"></i>&nbsp;<a class="btn btn-brand" href="https://steembottracker.com/delegation.html?delegatee=actifit" target="_blank">{{ $t('Delegate_Now_Actifit') }}</a></div>
			<div>{{ $t('Followers') }}: {{ numberFormat(userinfo.follower_count,0) }}</div>
			<div>{{ $t('Following') }}: {{ numberFormat(userinfo.following_count,0) }}</div>
			<div class="text-brand">
				<div><a href="/wallet" >{{ numberFormat(userTokenCount, 3) }} AFIT Tokens</a></div>
				<a :href="'/activity/'+displayUser" >{{ numberFormat(rewardedPostCount, 0) }} {{ $t('Activity_Reports_Rewarded') }}</a>
			</div>
		  </div>
		  <!-- badges section -->
		  <div v-if="userinfo" class="user-badges">
		    <div class="text-brand badges-title"><i class="fas fa-trophy"></i> {{ $t('Badges') }}</div>
		    <div class="badge-entry iso-badge">
			  <div :title="$t('iso_badge_title')">
				<div class="badge-title text-brand">{{ $t('iso_badge_title') }}</div>
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
			  <div class="badge-title text-brand">{{ $t('rew_activity_badge_title') }}</div>
			  <div v-for="level in rewarded_posts_rules" :key="level[1]" 
				class="single-rew-activity-badge" :style="{left: (level[1]-1) * activ_badge_indent + 'px'}"
				:title="$t('rew_activity_badge_level_title') + ' ' + level[1]">
				<div v-if="level[1] > 0 && level[1] <= maxClaimedActivityBadgeLevel()">
					<div :id="rew_activity_badge+level[1]" class="claimed-check" v-if="userHasBadge(rew_activity_badge+level[1])"><div><img class="badge-img" :src="'/img/badges/actifit_rew_act_lev_'+level[1]+'_badge.png'"></div><div class="text-brand claimed-check"><i class="fas fa-check"></i></div></div>
					<div :id="rew_activity_badge+level[1]" class="claimed-check unclaimed-badge" v-else :style="{left:  claimable_badge_indent + 'px'}"><img class="badge-img badge-unclaimed" :src="'/img/badges/actifit_rew_act_lev_'+level[1]+'_badge.png'"></div>
					<button v-if="badgeClaimable(rew_activity_badge+level[1])" v-on:click="claimBadge(rew_activity_badge+level[1])" class="btn btn-brand btn-lg border unclaimed-badge unclaimed-badge-btn" :style="{left: claimable_badge_indent + 'px'}">{{ $t('Claim_badge') }}</button>
					<div v-if="!badgeClaimable(rew_activity_badge+level[1]) && !userHasBadge(rew_activity_badge+level[1])" class="unclaimed-badge unclaimed-badge-btn unclaimed-badge-note text-brand" :style="{left:  claimable_badge_indent + 'px'}">
					  {{ $t('next_target') }}
					</div>
					<div v-if="claimingBadge == rew_activity_badge+level[1]" id="claiming_badge" class="unclaimed-badge unclaimed-badge-spin" :style="{left: claimable_badge_indent + 'px'}">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
					</div>
				</div>
			  </div>
			</div>
			
			<div class="badge-entry doubledup-activity-badge">
				<div class="badge-title text-brand">{{ $t('doubledup_badge_title') }}</div>
				<div :title="$t('doubledup_badge_title')">
					<div id="doubledup-badge" class="claimed-check" v-if="userHasBadge(doubledup_badge)"><div><img class="badge-img" src="/img/badges/actifit_doubled_up_badge.png"></div><div class="text-brand claimed-check"><i class="fas fa-check"></i></div></div>
					<div id="doubledup-badge" class="claimed-check"  v-else><img class="badge-img badge-unclaimed" src="/img/badges/actifit_doubled_up_badge.png"></div>
					<button v-if="badgeClaimable(doubledup_badge)" v-on:click="claimBadge(doubledup_badge)" class="btn btn-brand btn-lg border unclaimed-badge-btn">{{ $t('Claim_badge') }}</button>
					<div v-else-if="this.doubledupWinner.length == 0" class="badge-doubledup-desc text-brand claimed-check">{{ $t('not_lucky_yet') }}</div>
					<div v-if="claimingBadge == doubledup_badge" id="claiming_badge">
						<i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
					</div>
				</div>
			</div>
			
			<div class="badge-entry charity-activity-badge">
				<div class="badge-title text-brand">{{ $t('charity_badge_title') }}</div>
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
	<div v-else class="container pt-5 mt-5 pb-5" >
		<div class="mb-3 text-center">
          <h4>{{ errorDisplay }}</h4>
		</div>
	</div>
	<Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import UserMenu from '~/components/UserMenu'
  import Footer from '~/components/Footer'

  import steem from 'steem'
  import {mapGetters} from 'vuex'
  
  import Vue from 'vue'
  
  export default {
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
								]
		}
	},
	watch: {
	  user: 'fetchUserData',
	},
	components: {
	  NavbarBrand,
	  UserMenu,
	  Footer,
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['newlyVotedPosts']),
	  ...mapGetters(['commentEntries'], 'commentCountToday'),
	  formattedProfileUrl () {
		return "https://actifit.io/" + this.displayUser;
	  },
	  getUserRank() {
		//proper formatting issue to display circle for smaller numbers
		if (this.userRank<10){
			return ' '+parseFloat(this.userRank).toFixed(1);
		}else{
			return parseFloat(this.userRank).toFixed(1);
		}
	  },
	  userMeta() {
	    try{
		  return JSON.parse(this.userinfo.json_metadata);
		}catch(err){
		  return null;
		}
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
        let date = new Date(val)
        return date.getDate() + '/' 
			+ (date.getMonth() + 1) + '/' 
			+ date.getFullYear()
      },
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){	  
		  
		  //update user info from blockchain
		  let user_data = await this.$steemconnect.me();
		  this.user.account = user_data.account;
		}
	  },
	  /* handles fetching of user related info */
	  getAccountData () {
		
		let parentRef = this;
 
		steem.api.getAccounts([this.displayUser], function(err, result) {
			//result now contains the account details
			if (result.length == 0){
			  parentRef.noUserFound = true;
			  parentRef.errorDisplay = parentRef.$t('user_not_found_error');
			}else{
			  parentRef.userinfo = result[0];
			  //grab and display follower and following count
				steem.api.getFollowCount(parentRef.displayUser, function(err, result) {
					//console.log(err, result);
					if (!err) {
					  parentRef.userinfo.follower_count = result.follower_count;
					  parentRef.userinfo.following_count = result.following_count;
					}
				});
			}
		});
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
					let res = await this.$steemconnect.broadcast([['custom_json', cstm_params]], (err) => {
					  console.log(err);
					  if (err) {
						console.log(err);
					  }else{
						console.log('success');
					  }
					});
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
	  }
	},
	async mounted () {
		// login
		this.$store.dispatch('steemconnect/login')
		this.fetchUserData();
		
		// try to fetch data
	    if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined') ) {
		  this.displayUser = this.$route.params.username
		  if (this.$route.params.username.startsWith('@')){
			this.displayUser = this.$route.params.username.substring(1, this.$route.params.username.length);
		  }
		  
		  //grab the author's rank
		  fetch(process.env.actiAppUrl+'getRank/' + this.displayUser).then(res => {
			res.json().then(json => this.userRank = json.user_rank)}).catch(e => reject(e))
		  
		  fetch(process.env.actiAppUrl+'userRewardedPostCount/' + this.displayUser).then(res => {
			res.json().then(json => this.rewardedPostCount = json.rewarded_post_count)}).catch(e => reject(e))
		
		  //let's grab the user's AFIT tokens balance
		  fetch(process.env.actiAppUrl+'user/'+this.displayUser).then(
			res => {res.json().then(json => this.userTokenCount = json.tokens).catch(e => console.log(e))
		
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
			
		
		  this.getAccountData();
		}else{
		  this.errorDisplay = this.$t('user_not_found_error');
		}
		  	
	}
  }
</script>

<style>
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
	.date-head{
	  padding-left: 2px;
	}
	.user-avatar{
	  float: left;
	}
	.badge-img, .claimed-check{
	  width: 150px;
	  text-align: center;
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
	.user-details{
	  padding-left: 128px;
	}
	.user-badges{
	  border: 2px #ff112d solid;
	  margin: 10px;
	}
	.location-text{
	  word-break: break-all;
	}
	a.btn{
	  border: 1px solid white
	}
	.rew-activity-badge{
	  position: relative;
	  height: 270px;
	}
	.single-rew-activity-badge{
	  position: absolute;
	  top: 20px;
	}
	.unclaimed-badge{
	  position: absolute;
	}
	.unclaimed-badge-spin{
	  top: 220px;
	  width: 200px;
	}
	.unclaimed-badge-btn{
	  top: 170px;
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
	}
</style>
