<template>
  <div class="modal fade" id="reportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="report">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ report.title }}</h5><br/>
		  <a :href="report.author" target="_blank">
			<h5 class="modal-author modal-title text-brand" >@{{ report.author}} <small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small></h5>
		  </a>
		  <span class="date-head text-muted">{{ date }}</span>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<article class="modal-body" v-html="$renderMD(body)"></article>
		<div class="modal-footer">
		  <div class="report-modal-prelim-info col-md-6">
			<span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen">{{ $t('Reply') }}</a></span>
			<span>
				<small>
				  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand" 
					 data-target="#voteModal" v-if="this.$parent.user && userVotedThisPost()==true">
					<i class="far fa-thumbs-up"></i> {{getVoteCount }}
				  </a>
				  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal"
					 data-target="#voteModal" class="actifit-link-plain" v-else>
					<i class="far fa-thumbs-up"></i> {{ getVoteCount }}
				  </a>
				  <i class="far fa-comments ml-2"></i> {{ report.children }}
				</small>
			</span>
			<span>
				<small>
					{{ postPayout }}
				</small>
				<small>
					{{ afitReward }} {{ $t('AFIT_Token') }}
				</small>
			</span>
		  </div>
		  <div class="text-brand col-md-6"> 
			<social-sharing :url="formattedReportUrl"
						  title="Actifit - Rewarding Your Everyday Activity"
						  description="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity "
						  quote="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity"
						  hashtags="actifit,steem,health,mobile"
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
				  <network network="weibo">
					<i class="fab fa-weibo" title="weibo"></i>
				  </network> 
				  <network network="googleplus">
					<i class="fab fa-google-plus" title="google+"></i>
				  </network>
				  <network network="line">
					<i class="fab fa-line" title="line"></i>
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
		<div class="modal-footer" v-if="this.meta.charity">
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
			<markdown-editor v-model="replyBody" :configs="editorConfig" ref="editor"></markdown-editor>
			<a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">{{ $t('Post') }}<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
			<a href="#" @click.prevent="resetOpenComment()"  class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
		  </div>
		</transition>
		<div class="report-reply modal-body" v-if="responsePosted">
			<a :href="this.$store.state.steemconnect.user.name" target="_blank">
			  <div class="comment-user-section">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.$store.state.steemconnect.user.name + '/avatar)'"></div>
				<div class="modal-author modal-title text-brand" >@{{ $store.state.steemconnect.user.name }}<small class="date-head text-muted">{{ $t('Now') }}</small></div>
			  </div>
			</a>
			<article class="modal-body" v-html="$renderMD(responseBody)"></article>
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
  import VueMarkdown from 'vue-markdown'
  import steem from 'steem'
  import {mapGetters} from 'vuex'
  import Comments from '~/components/Comments'  
  
  import Vue from 'vue'
  
  import steemEditor from 'steem-editor';
  import 'steem-editor/dist/css/index.css';
  
  import SocialSharing from 'vue-social-sharing'

  Vue.use( steemEditor );
  
  export default {
	data () {
		return {
			afitReward: 0,
			userRank: '',
			fullAFITReward: '',
			postUpvoted: false,
			replyBody: '',
			moderatorSignature: '',
			commentBoxOpen: false,
			loading: false,
			responsePosted: false,
			responseBody: '',
			editorConfig: { // markdown editor for post body
			  autofocus: true,
			  spellChecker: false,
			  /*previewRender: (body) => {
				return marked(body.replace(/@([\w-]+)(?![\w-])/g,'[$&](https://actifit.io/$&)'))
			  },*/
			  forceSync: true,
			  //status: false,//['lines', 'words'],
			  promptURLs: true
			}
		}
	},
	watch: {
	  report : 'fetchReportData',
	  moderators: 'insertModSignature',
	},
    props: ['report'],
	components: {
	  VueMarkdown,
	  Comments,
	  SocialSharing,
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['newlyVotedPosts']),
	  ...mapGetters(['commentEntries'], 'commentCountToday'),
	  ...mapGetters(['moderators']),
	  date() {
        let date = new Date(this.report.created)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
      body () {
		let report_content = this.report.body;
		
		/* let's find images sent as ![](), and display them properly */
		//let img_links_reg = /^(?:(?!=").)*((https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif))|((https?:\/\/usermedia\.actifit\.io\/[./\d\w-]+)))/igm;
		let img_links_reg = /[!]\[[\d\w-\.]*\]\((((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-\/\:]*\.(?:png|jpg|jpeg|gif)))[)]/igm;
		report_content = report_content.replace(img_links_reg,'<img src="$1">');
		
		/* let's find images sent as pure URLs, and display them as actual images, while avoiding well established images */
		/* negative lookbehinds are not supported ?<! we need to switch to another approach */
		//img_links_reg = /(?<!=")(?<!]\()(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))/igm;
		//img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))(?!")/igm;
		img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-]*\.(?:png|jpg|jpeg|gif)))[\s]/igm;
		report_content = report_content.replace(img_links_reg,'<img src="$1">');
		
		/* let's match youtube vidoes and display them in a player */
		//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
		let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
		
		//swap into a player format, and introduce embed format for proper playing of videos
		report_content = report_content.replace(vid_reg,'<iframe width="640" height="360" src="https://www.youtube.com/embed/$1"></iframe>');
		
		/* regex to match @ words and convert them to steem user links. Need to skip special occurrences such as name within a link (preceded by /) */
		let user_name = /([^\/])(@([\d\w-.]+))/igm;
        
		report_content = report_content.replace(user_name,'$1<a href="https://actifit.io/$2">$2</a>')
		return report_content;
      },
	  formattedReportUrl () {
		return "https://actifit.io" + this.report.url;
	  },
	  getVoteCount(){
		return Array.isArray(this.report.active_votes) ? this.report.active_votes.length : 0;
	  },
	  meta() {
        return JSON.parse(this.report.json_metadata)
      },
	  postPayout() {
		if (this.postPaid()){
			return this.report.total_payout_value.replace('SBD','').replace('STEEM','')+' $'
		}else{
			return this.report.pending_payout_value.replace('SBD','').replace('STEEM','')+' $'
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
	  /* function checks to see if post reached its payout period */
	  postPaid() {
		//compare today v/s payout date calculated based on 7 days payout time
		let reportDate = new Date() 
		let payoutDays = 7;
		let reportPayout = new Date(this.report.created);
		reportPayout.setDate(reportPayout.getDate() + payoutDays);
		let today = new Date();
		if (today.getTime() > reportPayout.getTime()){
			return true;
		}
		return false;
	  },
	  /* function handles closing open comment box and resetting data */
	  resetOpenComment () {
		this.replyBody = this.moderatorSignature;
		this.commentBoxOpen=false;
	  },
	  /* function handles sending out the comment to the blockchain */
	  postResponse(event) {
		// proceed with saving the comment
		
		this.loading = true
		
		//build the permlink
		let comment_perm = this.user.account.name.replace('.','-') + '-re-' + this.report.author.replace('.','-') + '-' + this.report.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
		
		//prepare meta data
		let meta = new Object();
		meta.tags = '[actifit]';
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		
        this.$steemconnect.comment(
          this.report.author,
          this.report.permlink,
          this.user.account.name,
          comment_perm,
          '',
          this.replyBody,
          meta,
          (err) => {
            // stop loading animation and show notification
            this.loading = false
            this.$notify({
              group: err ? 'error' : 'success',
              text: err ? this.$t('Comment_Error') : this.$t('Comment_Success'),
              position: 'top center'
            })
			
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
			
			//reset open comment
			this.resetOpenComment();
          }
        )
		
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
		if (this.$store.state.steemconnect.user && this.moderators.find( mod => mod.name == this.$store.state.steemconnect.user.name && mod.title == 'moderator')) {
		  this.moderatorSignature = process.env.standardModeratorSignature;
		  this.replyBody = this.moderatorSignature;
		}
	  },
	  /* function handles confirming if the user had voted already to prevent issues */
	  votePrompt(e) {
		//if no user is logged in, prompt to login
		if (!this.$parent.user){
		  alert(this.$t('need_login_signup_notice_vote'));
		  e.stopPropagation();
		}
		//if this post is already voted by the user, we need to show a confirmation
		else if (this.userVotedThisPost()){
		  var confirmPopup = confirm(this.$t('confirm_vote_change'));
		  if (confirmPopup){
			this.$store.commit('setPostToVote', this.report)
		  }else{
			e.stopPropagation();
		  }
		}else{
		  //proceed normally showing vote popup
		  this.$store.commit('setPostToVote', this.report)
		}
	  },
	  fetchReportData () {
		//function handling propagating calls to grab key report data and comment info
		this.fetchReportKeyData()
		this.fetchReportCommentData()
	  },
	  fetchReportCommentData () {
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
	  },
	  fixSubModal () {
		//handles fixing parent class to properly interpret existing report modal
		//need to make sure this is subentry of a report modal, meaning report modal is showing
		if ($('#reportModal').hasClass('show')){
		  $('body').addClass('modal-open');
		}
	  }
	},
	async mounted () {
	  if (this.report != null){
		this.fetchReportKeyData();
	  }
	
	  //fix modal overlay
	  $('#voteModal').on("hidden.bs.modal", this.fixSubModal)
	}
  }
</script>

<style>
	.modal-author{
		margin-left: 10px !important;
	}
	.actifit-link-plain{
	  color: black;
	}
	.modal-body{
	  word-break: break-word;
	}
	.modal-body a:hover, .modal-header a:hover, .text-brand:hover, .actifit-link-plain:hover{
	  text-decoration: none;
	}
	.numberCircle {
	  border-radius: 25%;
	  width: 10px;
	  line-height: 10px;
	  padding: 4px 2px 4px 2px;
	  margin-left: 4px;
	  background: #fff;
	  border: 2px solid;
	  text-align: center;
	  vertical-align:middle;
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
	  padding: 5px;
	}
	.increased-rank{
		color: #76BB0E;
	}
</style>
