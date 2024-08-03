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


		  <div class="main-user-info" >
			  <div class="p-1" >
					<a :href="'/'+report.author" target="_blank">
					  <span class="user-avatar m-2" :style=" 'background-image: url('+profImgUrl+'/u/' + report.author + '/avatar)'"></span>
					  <h5 class="modal-author modal-title" style="display: inline-block;" >@{{ report.author}} 
						<small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small></h5>
					</a>

					
					<span><br>
					  <span class="date-head text-muted" :title="date">{{ $getTimeDifference(report.created) }}</span>
					  <a :href="'/@' + this.report.author + '/' + this.report.permlink"><i class="fas fa-link text-brand"></i></a>
					  <i :title="$t('copy_link')" class="fas fa-copy text-brand" v-on:click="copyContent" ></i>
					  <i class="fa-solid fa-language" style="color: red;" @click="translateContent"></i>
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
					  <i class="fab fa-x-twitter" title="X (twitter)"></i>
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
			text: err ? this.$t('Comment_Error') : this.$t('Comment_Success_Chain').replace('CHAIN', bchain),
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
		
		async processTrxFunc(op_name, cstm_params, bchain_option){
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
				  
				  this.$HAS.broadcast(auth, 'posting', operation, (evt)=> {
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
						  resolve({success: true, trx: response.data})
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
			  console.log('broadcasting');
			  console.log(operation);
			  
			  //console.log(this.$steemconnect.accessToken);
			  //console.log(this.$store.state.accessToken);
			  //grab token
			  let accToken = localStorage.getItem('access_token')
			  
			  let op_json = JSON.stringify(operation)
			  
			  let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			  
			  if (bchain_option){
				  cur_bchain = bchain_option;
			  }
			  
			  let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+encodeURIComponent(op_json)+'&bchain='+cur_bchain);
			  
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
				  if (err_msg.includes('missing') && err_msg.includes('authority') && this.cur_bchain == bchain_option){
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
		
		/* function handles sending out the comment to the blockchain */
		async postResponse(event) {
		  // proceed with saving the comment
		  
		  if (!this.user){
			  this.errPosting = this.$t('Need_login');
			  return;
		  }
		  
		  this.loading = true
		  
		  //build the permlink
		  let comment_perm = this.user.account.name.replace('.','-') + '-re-' + this.report.author.replace('.','-') + '-' + this.report.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
		  
		  //prepare meta data
		  let meta = new Object();
		  meta.tags = ['hive-193552', 'actifit'];
		  meta.app = 'actifit/0.5.0';
		  meta.suppEdit = 'actifit.io.comment';
		  this.replyBody = this.$refs.editor.content;
		  //console.log(this.stdLogin);
		  if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			  this.$steemconnect.comment(
				this.report.author,
				this.report.permlink,
				this.user.account.name,
				comment_perm,
				'',
				this.replyBody,
				meta,
				(err) => {
				  this.commentSuccess(err, true, 'STEEM');
				}
			  )
		  }else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
		  
			  let comment_options = { 
				  author: this.user.account.name, 
				  permlink: comment_perm, 
				  max_accepted_payout: '1000000.000 HBD', 
				  percent_hbd: 10000, 
				  allow_votes: true, 
				  allow_curation_rewards: true, 
				  extensions: []//extensions: [[0, { 'beneficiaries': [] }]]
			  };
			  //console.log(comment_options);
			  //this.$nuxt.refresh()
  
			  window.hive_keychain.requestPost(
				  this.user.account.name, 
				  "", 
				  this.replyBody,
				  this.report.permlink,
				  this.report.author,
				  JSON.stringify(meta),
				  comment_perm,
				  JSON.stringify(comment_options), (response) => {
					//console.log(response);
					if (response.success){
					  this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
					}else{
					  this.commentSuccess(response.message, false, this.cur_bchain);
					}
				  });	
		  
		  }else{
			  let cstm_params = {
				"author": this.user.account.name,
				"title": '',
				"body": this.replyBody,
				"parent_author": this.report.author,
				"parent_permlink": this.report.permlink,
				"permlink": comment_perm,
				"json_metadata": JSON.stringify(meta)
			  };
			  
			  let res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain);
			  
			  if (res.success){
				  this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
			  }else{
				  this.commentSuccess('error saving', false, this.cur_bchain);
			  }
			  
			  //also send the same post again to the other chain
			  let other_chain = this.cur_bchain=='HIVE'?'STEEM':'HIVE';
			  if (this.target_bchain == 'BOTH'){
				  this.loading = true;
				  let res = await this.processTrxFunc('comment', cstm_params, other_chain);
			  
				  if (res.success){
					  this.commentSuccess(null, true, other_chain);
				  }else{
					  this.commentSuccess('error saving', false, other_chain);
				  }
			  }
		  }
		  
		},
		/* function handles rewarding user for comments */
		async rewardUserComment () {
		  console.log('rewarding comments');
		  let url = new URL(process.env.actiAppUrl + 'rewardActifitWebComment/'+this.user.account.name);
		  //compile all needed data and send it along the request for processing
		  let params = {
			  web_comment_token: process.env.webCommentToken,
			  url: this.report.url,
		  }
		  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		  try{
			  let res = await fetch(url);
			  let outcome = await res.json();
			  if (outcome.rewarded){
				  // notify the user that he received an additional reward
				  this.$notify({
					group: 'success',
					text: this.$t('youve_been_rewarded') + outcome.amount + this.$t('reward_for_comment'),
					position: 'top center'
				  })
			  }
			  console.log(outcome);
		  }catch(err){
			  console.error(err);
		  }
		},
		/* function checks if logged in user has upvoted current report */
		userVotedThisPost() {
		  let curUser = this.user.account.name;
		  //check if the post contains in its original voters current user, or if it has been upvoted in current session
		  this.postUpvoted = this.report.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.report.post_id)!==-1;
		  
		  return this.postUpvoted;
		},
		/* function handles appending moderators signature */
		insertModSignature () {
		  if (this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
			this.moderatorSignature = process.env.shortModeratorSignature;
			this.replyBody += this.moderatorSignature;
		  }
		},
		/* function handles appending full moderator signature */
		insertFullModSignature () {
		  if (this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
			this.moderatorSignature = process.env.standardModeratorSignature;
			this.replyBody += this.moderatorSignature;
		  }
		},
		/* function handles confirming if the user had voted already to prevent issues */
		votePrompt(e) {
		  
			//proceed normally showing vote popup
			this.$store.commit('setPostToVote', this.report)
		  //}
		},
		fetchReportData () {
		  //function handling propagating calls to grab key report data and comment info
		  this.fetchReportKeyData()
		  this.fetchReportCommentData()
		},
		fetchReportCommentData () {
		
		  this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		  this.target_bchain = this.cur_bchain;
		  this.$store.commit('setBchain', this.cur_bchain);
		  
		  //regrab report data to fix comments
		  this.$store.dispatch('fetchReportComments', this.report)
		  
		  //clear the placeholder comment displayed
		  this.responsePosted = false;
		  this.responseBody = this.moderatorSignature;
		},
		fetchReportKeyData () {
		  fetch(process.env.actiAppUrl+'getPostReward?user=' + this.report.author+'&url='+this.report.url).then(res => {
		  //grab the post's reward to display it properly
				  res.json().then(json => this.afitReward = json.token_count)}).catch(e => reject(e))
				  
		  //grab the author's rank
		  fetch(process.env.actiAppUrl+'getRank/' + this.report.author).then(res => {
				  res.json().then(json => this.userRank = json)}).catch(e => reject(e))
				  
		  //grab post full pay if full pay mode enabled
		  fetch(process.env.actiAppUrl+'getPostFullAFITPayReward?user=' + this.report.author+'&url='+this.report.url).then(res => {
				  res.json().then(json => this.fullAFITReward = json.token_count)}).catch(e => reject(e))
				  
		  //grab moderators' list
		  this.$store.dispatch('fetchModerators')
		  
		  this.profImgUrl = process.env.hiveImgUrl;
		  
		  if (this.cur_bchain == 'STEEM'){
		  
			  this.profImgUrl = process.env.steemImgUrl;
			  
			  //grab post S-E token pay
			  fetch(scot_steemengine_api+'@'+this.report.author+'/'+this.report.permlink ).then(
				  res => {res.json().then(json => this.setReportTokenRewards (json) ).catch(e => reject(e))
			  }).catch(e => reject(e))
		  }else{
			  //grab post H-E token pay
			  fetch(scot_steemengine_api+'@'+this.report.author+'/'+this.report.permlink +scot_hive_api_param).then(
				  res => {res.json().then(json => this.setReportTokenRewards (json) ).catch(e => reject(e))
			  }).catch(e => reject(e))
		  }
		},
		/* function handles proper display for post token rewards */
		displayTokenValue (token) {
		  let val;
		  //if already paid
		  if (parseFloat(token.total_payout_value)>0){
			  val = parseFloat(token.total_payout_value) / Math.pow(10, token.precision);
			  return this.numberFormat(val, token.precision) + ' ' + token.token;
		  }
		  if (isNaN(token.pending_token)){
			  return "";
		  }
		  if (parseFloat(token.pending_token) == 0){
			  return this.numberFormat(val, token.precision) + ' ' + token.token;
		  }
		  val = parseFloat(token.pending_token) / Math.pow(10, token.precision);
		  return this.numberFormat(val, token.precision) + ' ' + token.token;
		},
		fixSubModal () {
		  //handles fixing parent class to properly interpret existing report modal
		  //need to make sure this is subentry of a report modal, meaning report modal is showing
		  if ($('#reportModal').hasClass('show')){
			$('body').addClass('modal-open');
		  }
		},
		 async setReportTokenRewards (result) {
		  this.tokenRewards = result;
		  this.report.specTokenRewards = this.tokenRewards;
		},
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
		copyContent (event){
			  navigator.clipboard.writeText('https://actifit.io/@' + this.report.author + '/' + this.report.permlink)
			  .then(() => {
				  this.$notify({
					group: 'success',
					text: this.$t('copied_successfully'),
					position: 'top center'
				  })
				  return;
			  })
			  .catch((error) => {
				  this.$notify({
					group: 'error',
					text: this.$t('error_copying'),
					position: 'top center'
				  })
				  return;					
			  });
			  
		  },
		loadNextReport(direction){
		  if (direction <0){
			  console.log('previous')
			  this.$emit('prevReport');
		  }else{
			  console.log('next');
			  this.$emit('nextReport');
		  }
		},
		handleKeyDown(event) {
		  if (!this.commentBoxOpen){
			switch (event.key) {
			  case 'ArrowLeft':
				this.loadNextReport(-1);
				break;
			  case 'ArrowRight':
				this.loadNextReport(1);
				break;
			}
		  }
		}
	  },
	  beforeDestroy() {
		  window.removeEventListener('keydown', this.handleKeyDown);
	  },
	  async mounted () {
		if (this.report != null){
		  this.fetchReportKeyData();
		}
	  
		//fix modal overlay
		$('#voteModal').on("hidden.bs.modal", this.fixSubModal)
		
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		//capture key clicks
		window.addEventListener('keydown', this.handleKeyDown);

		
	  }
	}
  </script>
  <style>
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
	  .report-modal-prelim-info span{
		/* padding: 5px; */
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