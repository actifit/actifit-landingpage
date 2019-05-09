<template>
  <div>
	<!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav mr-auto">
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
			<div class="location-text" v-if="userMeta"><i class="fas fa-street-view"></i> {{ userMeta.profile.location }}</div>
			<div v-if="userMeta"><i class="fas fa-address-card"></i> {{ userMeta.profile.about }}</div>
			<div><i class="fas fa-calendar-alt"></i> {{ $t('Created_On') }} {{ pureDate(userinfo.created) }}</div>
			<div v-if="userMeta && userMeta.profile.website"><i class="fas fa-link"></i>&nbsp;<a href="userMeta.profile.website">{{ userMeta.profile.website }}</a></div>
			<div><i class="fas fa-pen"></i> {{ numberFormat(userinfo.post_count, 0) }} {{ $t('Steem_posts_comments') }}</div>
			<div>{{ $t('Followers') }}: {{ numberFormat(userinfo.follower_count,0) }}</div>
			<div>{{ $t('Following') }}: {{ numberFormat(userinfo.following_count,0) }}</div>
			<div class="text-brand">
				<div><a href="/wallet" >{{ numberFormat(userTokenCount, 3) }} AFIT Tokens</a></div>
				<a :href="'/activity/'+displayUser" >{{ numberFormat(rewardedPostCount, 0) }} {{ $t('Activity_Reports_Rewarded') }}</a>
			</div>
		  </div>
		  <div v-if="userinfo" class="user-badges">
		    <div class="text-brand badges-title"><i class="fas fa-trophy"></i> {{ $t('Badges') }}</div>
		    <div class="iso-badge">
			  <div>
				<div id="iso-badge" class="claimed-check" v-if="userHasBadge(iso_badge)"><div><img class="badge-img" src="https://actifit.io/img/badges/actifit_iso_badge.png"></div><div class="text-brand claimed-check"><i class="fas fa-check"></i></div></div>
				<div id="iso-badge" class="claimed-check"  v-else><img class="badge-img badge-unclaimed" src="https://actifit.io/img/badges/actifit_iso_badge.png"></div>
				<button v-if="badgeClaimable(iso_badge)" v-on:click="claimBadge('iso')" class="btn btn-brand btn-lg border">{{ $t('Claim_badge') }}</button>
				<div v-else-if="this.isoParticipant.length == 0" class="col-md-4 text-brand claimed-check">{{ $t('missed_event_notice') }}</div>
				<div v-if="claimingBadge" id="claiming_badge">
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
			afitReward: 0,
			userRank: '',
			rewardedPostCount: 0,
			loading: false,
			userinfo: '',
			noUserFound: false,
			userTokenCount: 0,
			isoParticipant: [],
			userBadges: [],
			claimError: '',
			claimErrorDesc: '',
			iso_badge: 'iso',
			claimingBadge: false,
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
      numberFormat (number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
      },
	  /* handles checking if the user had claimed this badge already */
	  userHasBadge(badgeType) {
		if (this.userBadges.length>0){
		  let matchingBadge = this.userBadges.find( badge_entry => (badge_entry.user === this.displayUser && badge_entry.badge === badgeType));
		  console.log(matchingBadge);
		  if (matchingBadge){
			return true;
		  }
		}
		return false;
	  },
	  /* handles checking if the badge is available for claim by this user */
	  badgeClaimable(badgeType) {
		//make sure this is the logged in user taking action
		if (!this.user || (this.displayUser !== this.user.account.name)){
			return false;
		}
		if (this.userHasBadge(badgeType)){
		  return false;
		}else if (badgeType == this.iso_badge && this.isoParticipant.length > 0){
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
			console.log(err, result);
			if (result.length == 0){
			  parentRef.noUserFound = true;
			  parentRef.errorDisplay = parentRef.$t('user_not_found_error');
			}else{
			  parentRef.userinfo = result[0];
			  console.log(result[0]);
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
		console.log(badgeType);
		if (this.badgeClaimable(badgeType)){
			this.claimingBadge = true;
			//enable this badge for this user
			try{
				let res = await fetch(process.env.actiAppUrl+'claimBadge/?user='+this.displayUser+'&badge='+badgeType);
				let outcome = await res.json();
				//console.log(outcome);
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
					console.log('outcome:'+outcome);
				}else{
					console.error(outcome);
				}
			}catch(err){
				console.error(err);
			}
			this.claimingBadge = false;
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
		  console.log(this.displayUser);
		  
		  //grab the author's rank
		  fetch(process.env.actiAppUrl+'getRank/' + this.displayUser).then(res => {
			res.json().then(json => this.userRank = json.user_rank)}).catch(e => reject(e))
		  
		  fetch(process.env.actiAppUrl+'userRewardedPostCount/' + this.displayUser).then(res => {
			res.json().then(json => this.rewardedPostCount = json.rewarded_post_count)}).catch(e => reject(e))
		
		  //let's grab the user's AFIT tokens balance
		  fetch(process.env.actiAppUrl+'user/'+this.displayUser).then(
			res => {res.json().then(json => this.userTokenCount = json.tokens).catch(console.log('error fetching user balance'))}).catch(console.log('error fetching user balance'))
		
		  //let's grab user's current badges
		  fetch(process.env.actiAppUrl+'userBadges/'+this.displayUser).then(
			res => {res.json().then(json => this.userBadges = json)}).catch(e => reject(e))
		
		  //let's check if user participated in ISO event
		  fetch(process.env.actiAppUrl+'isoParticipant/'+this.displayUser).then(
			res => {res.json().then(json => this.isoParticipant = json)}).catch(e => reject(e))
		
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
</style>