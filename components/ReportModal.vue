<template>
  <div class="modal fade" id="reportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="report">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ report.title }}</h5><br/>
		  <a :href="'https://busy.org/@' + report.author" target="_blank">
		  <h5 class="modal-author modal-title text-brand" >@{{ report.author}} <small class="text-brand numberCircle">{{ getUserRank }}</small></h5></a>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <vue-markdown class="modal-body" v-html="body"></vue-markdown>
		<div class="modal-body">
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
		<div class="modal-body" v-if="this.meta.full_afit_pay=='on'">
			<div class="col-8">
				<i class="fas fa-star"></i>
				<small>
					Full AFIT Payout Mode
				</small>
				<i class="fas fa-star"></i>
			</div>
			<div class="col-4 text-right" v-if="!postPaid()">
				<small>
					Pending Pay
				</small>
			</div>
			<div class="col-4 text-right" v-else>
				<small>
					{{ fullAFITReward }} AFIT
				</small>
			</div>
		</div>
		<!-- adding section to display charity info if available -->
		<div class="modal-body" v-if="this.meta.charity">
			<i class="fas fa-dove"></i>
			<small>
				Charity Post
			</small>
			<i class="fas fa-dove"></i>
			<small>
				<a :href="'https://busy.org/@' + this.meta.charity[0]" target="_blank">@{{this.meta.charity[0]}}</a>
			</small>
		</div>
		<div class="report-comments">
		</div>
      </div>
    </div>
  </div>
</template>

<script>
  import VueMarkdown from 'vue-markdown'
  import steem from 'steem'
  import {mapGetters} from 'vuex'
  
  export default {
	data: function(){
		return {
			afitReward: '',
			userRank: '',
			fullAFITReward: '',
			postUpvoted: false,
		}
	},
	watch: {
	  report : 'fetchReportData'
	},
    props: ['report'],
	components: {
	  VueMarkdown,
	},
    computed: {
	  ...mapGetters(['newlyVotedPosts']),
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
		return Array.isArray(this.report.active_votes)?this.report.active_votes.length:0;
	  },
	  meta() {
        return JSON.parse(this.report.json_metadata)
      },
	  postPayout() {
		if (this.postPaid()){
			return this.report.total_payout_value.replace('SBD','').replace('STEEM','')+' STEEM/SBD'
		}else{
			return this.report.pending_payout_value.replace('SBD','').replace('STEEM','')+' STEEM/SBD'
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
	  /* function checks if logged in user has upvoted current report */
	  userVotedThisPost() {
		let curUser = this.$parent.user.account.name;
		//check if the post contains in its original voters current user, or if it has been upvoted in current session
		this.postUpvoted = this.report.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.report.post_id)!==-1;
		console.log(this.postUpvoted);
		return this.postUpvoted;
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
		this.fetchReportKeyData()
		this.fetchReportCommentData()
	  },
	  fetchReportCommentData () {
	    //handles grabbing related comments to current post
	    if (typeof this.report != undefined && this.report != 'undefined' && this.report != null){
			console.log(this.report);
		  //getState allows fetching all related comments to the post at hand. Yet we need to build the proper param to it under the format '/tag/username/permlink'
		  let report_param = this.report.category + '/@' + this.report.author + '/' + this.report.permlink;
		  let cur_ref = this;
	      steem.api.getState (report_param, function (err, result){
			//sort results by depth so as we display entries properly
			let comments_found = Object.values(result.content).sort( function (comment_a, comment_b){
			  return comment_a.depth < comment_b.depth? -1:1; 
			});
			//go through sorted items, skip depth 0 as that's the current post
	        console.log(err, comments_found);
			const comments = [];
	      });
	    }
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
	  }
	},
	async mounted () {
	  if (this.report != null){
		this.fetchReportKeyData();
	  }
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
	.modal-author:hover, .text-brand:hover, .actifit-link-plain:hover{
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
</style>
