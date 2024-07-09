<template>
  <div class="modal fade" id="reportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="report">
	    <div class="modal-header">
			<div class="col-12">
				<button type="button" class="btn btn-link float-left" @click="loadNextReport(-1)"><i class="fas fa-chevron-left"></i> Previous Report</button>
				<button type="button" class="btn btn-link float-right" @click="loadNextReport(1)">Next Report <i class="fas fa-chevron-right"></i></button>
			</div>
		</div>
        <div class="modal-header">
          <h2 class="modal-title" id="exampleModalLabel">{{ report.title }}</h2><br/>
		  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
		</div>
        <div class="main-user-info">
			<div class="p-1">
				  <a :href="'/'+report.author" target="_blank">
					<span class="user-avatar m-2" :style="'background-image: url('+profImgUrl+'/u/' + report.author + '/avatar)'"></span>
					<h5 class="modal-author modal-title" >@{{ report.author}} <small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small></h5>
				  </a>
				  <span>
					<span class="date-head text-muted" :title="date">{{ $getTimeDifference(report.created) }}</span>
					<a :href="'/@' + this.report.author + '/' + this.report.permlink"><i class="fas fa-link text-brand"></i></a>
					<i :title="$t('copy_link')" class="fas fa-copy text-brand" v-on:click="copyContent" ></i>
					<i class="fa-solid fa-language" style="color: red;" v-on:click="translateContent"></i>
					<i v-if="translatedContent" class="fa-solid fa-eye" style="color: blue;" v-on:click="showOriginalPost" :title="$t('Show_Original')"></i>
				</span>
			</div>
          
		<div class="modal-header">
			<div class="report-tags p-1" v-html="displayReportTags"></div>
		</div>
		</div>
		<vue-remarkable class="modal-body" :source="body" :options="{'html': true, 'breaks': true, 'typographer': true}"></vue-remarkable>
		<div class="modal-body goog-ad-horiz-90"><adsbygoogle ad-slot="5716623705" /></div>
		<div class="modal-footer main-payment-info">
		  <div class="report-modal-prelim-info col-md-6">
			<span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i class="text-white fas fa-reply"></i></a></span>
			<span>
				
				  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand" 
					 data-target="#voteModal" v-if="this.$parent.user && userVotedThisPost()==true">
					<i class="far fa-thumbs-up"></i> {{getVoteCount }}
				  </a>
				  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal"
					 data-target="#voteModal" class="actifit-link-plain" v-else>
					<i class="far fa-thumbs-up"></i> {{ getVoteCount }}
				  </a>
				  <i class="far fa-comments ml-2"></i> {{ report.children }}
				  <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)" v-if="user && report.author != this.user.account.name" :title="$t('reblog')"></i>
				
			</span>
			<div>
				<span :title="afitReward +' ' + $t('AFIT_Token')">
					<img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}
				</span>
				
					<img src="/img/STEEM.png" class="mr-0 currency-logo-small" v-if="cur_bchain=='STEEM'">
					<img src="/img/HIVE.png" class="mr-0 currency-logo-small" v-else-if="cur_bchain=='HIVE'">
					<img src="/img/BLURT.png" class="mr-0 currency-logo-small" v-else-if="cur_bchain=='BLURT'">
					<!--{{ postPayout }}-->
				
				<span v-if="postPaid()">
					<!--<i class="fa-solid fa-wallet text-green"></i>-->
					<span class="m-1" :title="$t('author_payout')">
						<i class="fa-solid fa-user" ></i>
						{{paidValue()}}
					</span>
					<span class="m-1" :title="$t('voters_payout')">
						<i class="fa-solid fa-users" ></i>
						{{report.curator_payout_value}}
					</span>
					<i class="fa-solid fa-check text-green text-bold"></i>
				</span>
				<span v-else>
					<span class="text-bold">{{ report.pending_payout_value.replace('SBD','')}}</span>
					<i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
				</span>
				<span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()">
					<i class="fas fa-user-pen"><sup>{{report.beneficiaries.length}}</sup></i>
				</span>

				
				<span @click.prevent="displayMorePayoutData = !displayMorePayoutData" class="text-brand pointer-cur-cls" :title="$t('more_token_rewards')">
					<i class="fas fa-chevron-circle-down" v-if="!displayMorePayoutData"></i>
					<i class="fas fa-chevron-circle-up" v-else></i>
				</span>
				<transition name="fade" v-if="displayMorePayoutData">
					<div class="m-2">
						<small v-for="(token, index) in tokenRewards" :key="index" :title="displayTokenValue(token)">
							{{displayTokenValue(token)}} | 
						</small>
					</div>
				</transition>
			</div>
		  </div>
		  <div class="col-md-6"> 
			<social-sharing :url="formattedReportUrl"
						  :title="report.title"
						  description="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity "
						  quote="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity"
						  :hashtags="hashtags"
						  twitter-user="actifit_fitness"
						  inline-template>
				 <div class="share-links-actifit">
				  <network network="facebook">
					<i class="fab fa-facebook" title="facebook"></i>
				  </network>
				  <network network="twitter">
					<i class="fab fa-twitter" title="twitter"></i>
				  </network>
				  <network network="telegram">
					<i class="fab fa-telegram" title="telegram"></i>
				  </network>
				  <network network="whatsapp">
					<i class="fab fa-whatsapp" title="whatsapp"></i>
				  </network>
				  <network network="linkedin">
					<i class="fab fa-linkedin" title="linkedin"></i>
				  </network>
				  <network network="reddit">
					<i class="fab fa-reddit" title="reddit"></i>
				  </network>
				  <network network="skype">
					<i class="fab fa-skype" title="skype"></i>
				  </network>
				  <network network="sms">
					<i class="fas fa-comment" title="SMS"></i>
				  </network>
				  <network network="email">
					  <i class="fa fa-envelope" title="email"></i>
				  </network>
			  </div>
			</social-sharing>
		  </div>
		</div>
		<!-- adding section to display additional FULL Payout option -->
		<div class="modal-footer" v-if="this.meta.full_afit_pay=='on'">
			<div class="text-brand">
				<i class="fas fa-star"></i>
				<small>
					{{ $t('Full_AFIT_Payout_Mode') }}
				</small>
				<i class="fas fa-star"></i>
			</div>
			<div class="text-brand" v-if="!postPaid()">
				<small>
					{{ $t('Pending_Pay') }}
				</small>
			</div>
			<div class="text-brand" v-else>
				<small>
					{{ fullAFITReward }} {{ $t('AFIT_Token') }}
				</small>
			</div>
		</div>
		<!-- adding section to display charity info if available -->
		<div class="modal-footer text-brand" v-if="this.meta.charity">
			<i class="fas fa-dove"></i>
			<small>
				{{ $t('Charity_Post') }}
			</small>
			<i class="fas fa-dove"></i>
			<small>
				<a :href="this.meta.charity[0]" target="_blank">@{{this.meta.charity[0]}}</a>
			</small>
		</div>
		<transition name="fade">
		  <div class="report-reply modal-body" v-if="commentBoxOpen">
			<CustomTextEditor ref="editor" :initialContent="replyBody" ></CustomTextEditor>
			<div class="modal-footer m-2" style="display:none">
				<div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-if="cur_bchain=='HIVE'">
					<input type="radio" id="hive" value="HIVE" v-model="target_bchain">
					<img src="/img/HIVE.png" style="max-height: 50px" v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass">
					<label for="hive">HIVE ONLY</label>
				</div>
				<div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-else-if="cur_bchain=='STEEM'">
					<input type="radio" id="steem" value="STEEM" v-model="target_bchain">
					<img src="/img/STEEM.png" style="max-height: 50px" v-on:click="target_bchain = 'STEEM'" :class="adjustSteemClass">
					<label for="steem">STEEM ONLY</label>
				</div>
				<div class="bchain-option btn col-6 p-2 row text-left  mx-auto">
					<input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
					<img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass">
					<img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass">
					<label for="hive_steem">HIVE + STEEM</label>
				</div>
			</div>
			<a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">
				{{ $t('Post') }}
				<img src="/img/HIVE.png" style="max-height: 25px" v-if="target_bchain=='HIVE' || target_bchain=='BOTH'">
				<img src="/img/STEEM.png" style="max-height: 25px" v-if="target_bchain=='STEEM' || target_bchain=='BOTH'">
				<i class="fas fa-spin fa-spinner" v-if="loading"></i>
			</a>
			<a href="#" @click.prevent="resetOpenComment()"  class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
			<a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25" v-if="(this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{ $t('Short_Signature') }}</a>
			<a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25" v-if="(this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{ $t('Full_Signature') }}</a>
			<div class="text-brand" v-html="errPosting"></div>
		  </div>
		</transition>
		<div class="report-reply modal-body" v-if="responsePosted">
			<a :href="this.user.name" target="_blank">
			  <div class="comment-user-section">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url('+profImgUrl+'/u/' + this.user.name + '/avatar)'"></div>
				<div class="modal-author modal-title" >@{{ user.name }}<small class="date-head text-muted">{{ $t('Now') }}</small></div>
			  </div>
			</a>
			<vue-remarkable class="modal-body" :source="body" :options="{'html': true, 'breaks': true, 'typographer': true}"></vue-remarkable>
		</div>
		<div class="report-comments modal-body" v-if="commentsAvailable">
			<Comments 
				:author="commentEntries.author" 
				:body="commentEntries.body" 
				:reply_entries.sync="commentEntries.reply_entries" 
				:main_post_author="report.author"
				:main_post_permlink="report.permlink"
				:main_post_cat="report.category"
				:depth="0" />
		</div>
      </div>
    </div>
  </div>
</template>

<script>
  import steem from 'steem'
  import {mapGetters} from 'vuex'
  import Comments from '~/components/Comments'  
  import CustomTextEditor from '~/components/CustomTextEditor' 
  
  import vueRemarkable from 'vue-remarkable';
  
  import SocialSharing from 'vue-social-sharing';
  
  import sanitize from 'sanitize-html'
  
  const scot_steemengine_api = process.env.steemEngineScot;
  const scot_hive_api_param = process.env.hiveEngineScotParam;
  const tokensOfInterest = ['SPORTS', 'PAL', 'APX'];
  
  export default {
	data () {
		return {
			afitReward: 0,
			tokenRewards: [],
			userRank: '',
			fullAFITReward: '',
			postUpvoted: false,
			replyBody: '',
			moderatorSignature: '',
			commentBoxOpen: false,
			loading: false,
			responsePosted: false,
			target_bchain: 'HIVE',
			errPosting: '',
			responseBody: '',
			displayMorePayoutData: false,
			cur_bchain: 'HIVE',
			profImgUrl: process.env.steemImgUrl,
			socialSharingTitle: process.env.socialSharingTitle,
			socialSharingDesc: process.env.socialSharingDesc,
			socialSharingQuote: process.env.socialSharingQuote,
			hashtags: process.env.socialSharingHashtags,
			translatedContent: '',  // Added to store translated content
		}
	},
	watch: {
	  report : 'fetchReportData',
	  bchain: function(newBchain) {
		this.cur_bchain = newBchain;
		this.target_bchain = newBchain;
	  }
	},
    props: ['report'],
	components: {
	  Comments,
	  CustomTextEditor,
	  SocialSharing,
	  vueRemarkable
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['newlyVotedPosts']),
	  ...mapGetters(['commentEntries'], 'commentCountToday'),
	  ...mapGetters(['moderators', 'bchain']),
	  adjustHiveClass () {
		if (this.target_bchain != 'HIVE'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustSteemClass () {
		if (this.target_bchain != 'STEEM'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustBothClass () {
		if (this.target_bchain != 'BOTH'){
			return 'option-opaque';
		}
		return '';
	  },
	  date() {
        let date = new Date(this.report.created)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
	  displayReportTags(){
		let tagDisplay = "";
		if (this.report && this.report.json_metadata){
			let meta_data = JSON.parse(this.report.json_metadata);
			for (let i in meta_data.tags){
				tagDisplay += '<span class="single-tag p-1">' + meta_data.tags[i] + '</span> ';
				if (i > process.env.maxTagDisplay - 1) break;
			};
		}
		return tagDisplay;
	  },
      body () {		
		return this.$cleanBody(this.report.body);
      },
	  formattedReportUrl () {
		return "https://actifit.io/@"+this.report.author + '/' + this.report.permlink;
	  },
	  getVoteCount(){
		return Array.isArray(this.report.active_votes) ? this.report.active_votes.length : 0;
	  },
	  meta() {
        return JSON.parse(this.report.json_metadata)
      },
	  postPayout() {
		if (this.postPaid()){
			return this.report.total_payout_value.replace('SBD','').replace('STEEM','').replace('HBD','').replace('HIVE','')+' $'
		}else{
			return this.report.pending_payout_value.replace('SBD','').replace('STEEM','').replace('HBD','').replace('HIVE','')+' $'
		}
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
	  commentsAvailable() {

		return this.commentEntries != null;
	  }
    },
	methods: { 

/* function checks if post has beneficiaries */
hasBeneficiaries() {
	return Array.isArray(this.report.beneficiaries) && this.report.beneficiaries.length > 0;
},
beneficiariesDisplay(){
	let output = 'Beneficiaries:\n';
	for (let i=0;i<this.report.beneficiaries.length;i++){
		output += this.report.beneficiaries[i].account+ ': ' + this.report.beneficiaries[i].weight/100 + '% \n';
	}
	return output;
},
/* function returns author payout value */
paidValue() {
	if (this.report.total_payout_value ) return this.report.total_payout_value
	if (this.report.author_payout_value ) return this.report.author_payout_value
},
/* function checks to see if post reached its payout period */
postPaid() {
	//check if last_payout is after cashout_time which means post got paid
	let last_payout = new Date(this.report.last_payout);
	let cashout_time = new Date(this.report.cashout_time);
	if (last_payout.getTime() > cashout_time.getTime()){
		return true;
	}
	return false;
},
/* function handles closing open comment box and resetting data */
resetOpenComment () {
	this.replyBody = this.moderatorSignature;
	this.commentBoxOpen=false;
},
commentSuccess (err, finalize, bchain) {
	// stop loading animation and show notification
	this.loading = false
	this.$notify({
		group: err ? 'error' : 'success',
		text: err ? this.$t('Comment_Error') : this.$t('Comment_Success_Chain').replace('_CHAIN_', bchain),
		position: 'top center'
	})
	
	if (finalize){
	
		//display comment placeholder till blockchain data comes through
		this.responsePosted = true;
		this.responseBody = this.replyBody;
		
		//refetch report data anew, but only after 10 seconds to ensure data has been made available
		setTimeout( this.fetchReportCommentData, 10000);
		
		//check if comment is lengthy enough, increase tracked count by 1
		if (this.responseBody.length >= 50){
			if (isNaN(this.commentCountToday)){
				this.commentCountToday = 0;
			}
			this.commentCountToday += 1;
		}
		this.$store.commit('setCommentCountToday', this.commentCountToday);
		
		//reward the user for interacting with 3 different posts via comments
		if (this.commentCountToday >= 3){
			this.rewardUserComment();
		}
	}
	
	//reset open comment
	this.resetOpenComment();
},
async processTrxFunc(op_name, cstm_params, bchain_option) {
  // Ensure user is initialized
  if (!this.user || !this.user.account || !this.user.account.name) {
    console.error('Error: User is not initialized or account name is missing');
    this.$notify({
      group: 'error',
      text: this.$t('Need_login'),
      position: 'top center'
    });
    return { success: false, trx: null };
  }

  const user = this.user.account.name;
  console.log('User found:', user);

  // Check for standard login
  if (!localStorage.getItem('std_login')) {
    console.log('Using SteemConnect for transaction');
    try {
      let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
      if (res.result.ref_block_num) {
        console.log('SteemConnect broadcast success:', res.result);
        return { success: true, trx: res.result };
      } else {
        console.error('SteemConnect broadcast failed:', res);
        return { success: false, trx: null };
      }
    } catch (error) {
      console.error('Error during SteemConnect broadcast:', error);
      this.$notify({
        group: 'error',
        text: this.$t('Error during SteemConnect broadcast'),
        position: 'top center'
      });
      return { success: false, trx: null };
    }
  } 
  // Check for HiveAuth login
  else if (localStorage.getItem('acti_login_method') === 'hiveauth') {
    console.log('Using HiveAuth for transaction');
    return new Promise((resolve) => {
      const auth = {
        username: user,
        token: localStorage.getItem('access_token'),
        expire: localStorage.getItem('expires'),
        key: localStorage.getItem('key')
      };
      let operation = [[op_name, cstm_params]];

      console.log('HiveAuth operation:', operation);

      this.$HAS.broadcast(auth, 'posting', operation, (evt) => {
        console.log('HiveAuth event:', evt);
        let msg = this.$t('verify_hiveauth_app');
        this.$notify({
          group: 'warn',
          text: msg,
          duration: -1, // keep alive till clicked
          position: 'top center'
        });
      })
      .then((response) => {
        console.log('HiveAuth response:', response);
        this.$notify({
          group: 'warn',
          clean: true
        });
        if (response.cmd === 'sign_ack') {
          resolve({ success: true, trx: response.data });
        } else if (response.cmd === 'sign_nack') {
          resolve({ success: false });
        }
      })
      .catch((err) => {
        this.$notify({
          group: 'warn',
          clean: true
        });
        console.error('Error during HiveAuth broadcast:', err);
        resolve({ success: false });
      });
    });
  } 
  // Use default process for other login methods
  else {
    console.log('Using default method for transaction');
    try {
      let operation = [[op_name, cstm_params]];
      console.log('Operation:', operation);

      let accToken = localStorage.getItem('access_token');
      let op_json = JSON.stringify(operation);
      console.log('Operation JSON:', op_json);

      let cur_bchain = localStorage.getItem('cur_bchain') || 'HIVE';
      if (bchain_option) {
        cur_bchain = bchain_option;
      }
      console.log('Current blockchain:', cur_bchain);

      let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + user + '&operation=' + encodeURIComponent(op_json) + '&bchain=' + cur_bchain);
      console.log('Request URL:', url);

      let reqHeads = new Headers({
        'Content-Type': 'application/json',
        'x-acti-token': 'Bearer ' + accToken,
      });
      console.log('Request headers:', reqHeads);

      let res = await fetch(url, { headers: reqHeads });
      let outcome = await res.json();
      console.log('Transaction outcome:', outcome);

      if (outcome.error) {
        console.error('Transaction error:', outcome.error);
        let err_msg = outcome.trx.tx.error;
        if (err_msg.includes('missing') && err_msg.includes('authority') && cur_bchain === bchain_option) {
          localStorage.removeItem('access_token');
          this.error_msg = this.$t('session_expired_login_again');
          this.$store.dispatch('steemconnect/logout');
        }
        this.$notify({
          group: 'error',
          text: err_msg,
          position: 'top center'
        });
        return { success: false, trx: null };
      } else {
        console.log('Transaction successful:', outcome.trx);
        return { success: true, trx: outcome.trx };
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      this.$notify({
        group: 'error',
        text: this.$t('Error during transaction'),
        position: 'top center'
      });
      return { success: false, trx: null };
    }
  }
},




async vote(type, report) {
  if (!this.user) {
    this.error_msg = this.$t('Need_login');
    this.$notify({
      group: 'error',
      text: this.error_msg,
      position: 'top center'
    });
    return;
  }
  
  this.voteProcessing = true;
  let voter = this.user.account.name;
  let weight = type === 'vote' ? 10000 : 0;

  try {
    if (!localStorage.getItem('std_login')) {
      await this.$steemconnect.vote(voter, report.author, report.permlink, weight);
      this.$notify({
        group: 'success',
        text: this.$t('Vote_Success'),
        position: 'top center'
      });
    } else if (localStorage.getItem('acti_login_method') === 'keychain' && window.hive_keychain) {
      let kp_perm = this.cur_bchain === 'HIVE' ? 'HIVE' : 'STEEM';
      const response = await new Promise((resolve, reject) => {
        window.hive_keychain.requestVote(this.user.account.name, report.author, report.permlink, weight, kp_perm, (res) => {
          if (res.success) resolve(res);
          else reject(res);
        });
      });
      this.$notify({
        group: 'success',
        text: this.$t('Vote_Success'),
        position: 'top center'
      });
    } else {
      let cstm_params = {
        voter: voter,
        author: report.author,
        permlink: report.permlink,
        weight: weight
      };

      let res = await this.processTrxFunc('vote', cstm_params, this.cur_bchain);
      if (res.success) {
        this.$notify({
          group: 'success',
          text: this.$t('Vote_Success'),
          position: 'top center'
        });
      } else {
        throw new Error(res.error || 'Vote_Failed');
      }

      if (this.target_bchain === 'BOTH') {
        let other_chain = this.cur_bchain === 'HIVE' ? 'STEEM' : 'HIVE';
        res = await this.processTrxFunc('vote', cstm_params, other_chain);
        if (res.success) {
          this.$notify({
            group: 'success',
            text: this.$t('Vote_Success'),
            position: 'top center'
          });
        } else {
          throw new Error(res.error || 'Vote_Failed');
        }
      }
    }
  } catch (error) {
    console.error(error);
    this.$notify({
      group: 'error',
      text: this.$t('Vote_Failed') + ' : ' + (error.message || error),
      position: 'top center'
    });
  } finally {
    this.voteProcessing = false;
    this.loading = false;
  }
},

fetchReportData () {
	this.loading = true
	this.$store.dispatch('fetchPost', {
		report: this.report,
		full: true
	}).then(() => {
		this.loading = false
	})
},
handleKeyDown(event) {
	if (event.key === 'Enter' && event.ctrlKey) {
		this.postResponse()
	}
},
translate (lang) {
	let currentLang = localStorage.getItem('lang') || 'en';
	let newLang = lang;
	
	if (currentLang != lang) {
		this.$i18n.locale = lang;
		localStorage.setItem('lang', lang);
		this.$store.dispatch('fetchTranslation', {
			lang: lang,
			resource: 'post',
			id: this.report._id
		})
	}
},
fixSubModal(){
	let modals = document.getElementsByClassName('modal-backdrop');
	for (let i=0; i<modals.length; i++){
		modals[i].parentNode.removeChild(modals[i]);
	}
},
async translateText(content) {
	try {
		const response = await fetch('https://your-translation-api-endpoint', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.translationApiKey,
			},
			body: JSON.stringify({
				text: content,
				target_lang: 'EN'
			}),
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		if (!data || !data.translated_text) {
			throw new Error('No translated text found in response');
		}

		console.log('Translation successful:', data.translated_text);
		return data.translated_text;
	} catch (error) {
		console.error('Error translating text:', error);
		this.$notify({
			group: 'error',
			text: this.$t('Error_translating_text'),
			position: 'top center'
		});
		return null; // Return null in case of an error
	}
},
async translatePost() {
	if (this.report) {
		this.loading = true;
		this.translatedContent = await this.translateText(this.report.body);
		this.loading = false;
	}
},

async translateContent() {
    if (this.report) {
      this.loading = true;
      try {
        const response = await fetch('https://your-translation-api-endpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.translationApiKey,
          },
          body: JSON.stringify({
            text: this.report.body,
            target_lang: 'EN' // or any other target language
          }),
        });
		if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        const data = await response.json();
        this.translatedContent = data.translated_text;
      } catch (error) {
        console.error('Error translating text:', error);
        this.$notify({
          group: 'error',
          text: this.$t('Error_translating_text'),
          position: 'top center'
        });
      } finally {
        this.loading = false;
      }
    }
  },

  showOriginalPost() {
    this.translatedContent = '';
  },
}
  }
</script>

<style>
	
	.modal-author{
		margin-left: 10px !important;
	}
	.actifit-link-plain{
	  color: white;
	}
	.modal-body{
	  word-break: break-word;
	}
	.modal-body a:hover, .modal-header a:hover, .text-brand:hover, .actifit-link-plain:hover{
	  text-decoration: none;
	}
	.markdown-editor .CodeMirror, .markdown-editor .CodeMirror-scroll {
	  min-height: 100px;
	}
	.reply-btn{
	  float: right;
	}
	.date-head{
	  padding-left: 2px;
	}
	.report-reply{
	  padding-left: 40px;
	}
	.share-links-actifit{
	  text-align: right;
	}
	.share-links-actifit span{
	  padding: 5px;
	  cursor: pointer;
	}

	.increased-rank{
		color: #76BB0E;
	}
	.single-tag{
		background-color: red;
		color: white;
	}
	.pointer-cur-cls{
		cursor: pointer;
	}
</style>
