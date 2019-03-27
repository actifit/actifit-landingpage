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
	<div v-if="report && report.author" class="container pt-5 mt-5 pb-5 col-md-9" >
        <div class="report-head mb-3 col-md-9">
          <h4 id="exampleModalLabel">{{ report.title }}</h4>
		  <h5 class="text-brand" >
			<div class="user-avatar mid-avatar mr-1 mb-5"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.report.author + '/avatar)'"></div>
			<a :href="'https://busy.org/@' + report.author" target="_blank">@{{ report.author}} <small class="text-brand numberCircle">{{ getUserRank }}</small></a></h5>
		  <span class="date-head text-muted">{{ date }}</span>
		  <div class="report-tags">{{ displayReportTags }}</div>
        </div>
		<article v-html="$renderMD(body)" class="col-md-9"></article>
		<div class="modal-footer col-md-9">
			<div><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen">Reply</a></div>
			<div>
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
			</div>
			<div>
				<small>
					{{ postPayout }}
				</small>
				<small>
					{{ afitReward }} AFIT
				</small>
			</div>
		</div>
		<!-- adding section to display additional FULL Payout option -->
		<div class="modal-footer col-md-9" v-if="this.meta.full_afit_pay=='on'">
			<div class="text-brand">
				<i class="fas fa-star"></i>
				<small>
					Full AFIT Payout Mode
				</small>
				<i class="fas fa-star"></i>
			</div>
			<div class="text-brand" v-if="!postPaid()">
				<small>
					Pending Pay
				</small>
			</div>
			<div class="text-brand" v-else>
				<small>
					{{ fullAFITReward }} AFIT
				</small>
			</div>
		</div>
		<!-- adding section to display charity info if available -->
		<div class="modal-footer col-md-9" v-if="this.meta.charity">
			<i class="fas fa-dove"></i>
			<small>
				Charity Post
			</small>
			<i class="fas fa-dove"></i>
			<small>
				<a :href="'https://busy.org/@' + this.meta.charity[0]" target="_blank">@{{this.meta.charity[0]}}</a>
			</small>
		</div>
		<transition name="fade">
		  <div class="report-reply col-md-9" v-if="commentBoxOpen">
			<markdown-editor v-model="replyBody" :configs="editorConfig" ref="editor"></markdown-editor>
			<a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">Post<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
			<a href="#" @click.prevent="resetOpenComment()"  class="btn btn-brand border reply-btn w-25">Cancel</a>
		  </div>
		</transition>
		<div class="report-reply col-md-9" v-if="responsePosted">
			<a :href="'https://busy.org/@' + this.$store.state.steemconnect.user.name" target="_blank">
			  <div class="comment-user-section">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.$store.state.steemconnect.user.name + '/avatar)'"></div>
				<div class="modal-author modal-title text-brand" >@{{ $store.state.steemconnect.user.name }}<small class="date-head text-muted">Now</small></div>
			  </div>
			</a>
			<article v-html="$renderMD(responseBody)"></article>
		</div>
		<div class="report-comments col-md-9" v-if="commentsAvailable">
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
	<div v-else-if="errorDisplay" class="container pt-5 mt-5 pb-5" >
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

  import VueMarkdown from 'vue-markdown'
  import steem from 'steem'
  import {mapGetters} from 'vuex'
  import Comments from '~/components/Comments'  
  
  import Vue from 'vue'
  
  import steemEditor from 'steem-editor';
  import 'steem-editor/dist/css/index.css';

  Vue.use( steemEditor );
  
  export default {
	data () {
		return {
			report: '',
			postAuthor: '',
			errorDisplay: '',
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
				return marked(body.replace(/@([\w-]+)(?![\w-])/g,'[$&](https://busy.org/$&)'))
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
	components: {
	  NavbarBrand,
	  UserMenu,
	  Footer,
	  VueMarkdown,
	  Comments,
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
	  displayReportTags(){
		let tagDisplay = "";
		if (this.report && this.report.json_metadata){
			let meta_data = JSON.parse(this.report.json_metadata);
			for (let i in meta_data.tags){
				tagDisplay += meta_data.tags[i] + ' ';
			};
		}
		return tagDisplay;
	  },
      body () {
		let report_content = this.report.body;
		
		/* let's find images sent as pure URLs, and display them as actual images, while avoiding well established images */
		let img_links_reg = /^(?:(?!=").)*((https?:\/\/.*\.(?:png|jpg|jpeg|gif))|(https?:\/\/usermedia\.actifit\.io[^\)]*))(?:\)*)/igm;
		report_content = report_content.replace(img_links_reg,'<img src="$1">');
		
		/* let's match youtube vidoes and display them in a player */
		//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
		let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
		
		//swap into a player format, and introduce embed format for proper playing of videos
		report_content = report_content.replace(vid_reg,'<iframe width="640" height="360" src="http://www.youtube.com/embed/$1"></iframe>');
		
		/* regex to match @ words and convert them to steem user links */
		let user_name = /(@([\a-zA-Z0-9-.]+)(?![\a-zA-Z0-9-.]))([,.|() ])/g;
        return report_content.replace(user_name,'[$1](https://busy.org/$1)$3')
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
	  getUserRank() {
		//proper formatting issue to display circle for smaller numbers
		if (this.userRank<10){
			return ' '+parseFloat(this.userRank).toFixed(1);
		}else{
			return parseFloat(this.userRank).toFixed(1);
		}
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
              text: err ? 'Unknown error: Your comment could not be sent.' : 'Comment successfully posted!',
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
				  text: 'You\'ve been rewarded '+outcome.amount + ' AFIT tokens for commenting on 3 activity reports today. Congrats!',
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
		  alert('You need to login or signup first');
		  e.stopPropagation();
		}
		//if this post is already voted by the user, we need to show a confirmation
		else if (this.userVotedThisPost()){
		  var confirmPopup = confirm("You already had voted before on this post. Are you sure you want to change your vote?");
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
		if (this.report && this.report.author){
		  this.fetchReportKeyData()
		  this.fetchReportCommentData()
		}
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
				res.json().then(json => this.userRank = json.user_rank)}).catch(e => reject(e))
				
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
	  },
	  fetchUserData () {
	    console.log('fetchUserData');
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
	},
	async mounted () {
	
		this.$store.dispatch('steemconnect/login');
		
		this.fetchUserData();
		
		// try to fetch report data
	    if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined') && (typeof this.$route.params.permlink !== 'undefined') ) {
		  this.postAuthor = this.$route.params.username
		  this.postPermLink = this.$route.params.permlink
		  if (this.$route.params.username.startsWith('@')){
			this.postAuthor = this.$route.params.username.substring(1, this.$route.params.username.length);
		  }
		  console.log(this.postAuthor);
		  // try to fetch matching report
		  steem.api.getContent(this.postAuthor, this.postPermLink, (err, result) => {
		    console.log(err, result);
			this.report = result;
			console.log(this.report);
			if (this.report && this.report.author){
				this.fetchReportKeyData();
			}else{
				this.errorDisplay = 'Error: Post could not be found!';
			}

		  })
		}
		  	
	}
  }
</script>

<style>
	.mid-avatar{
		width: 30px!important;
		height: 30px!important;
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
	  padding-bottom: 40px;
	}
</style>