<template>
  <div class="comments">
    <div class="modal-body comment-info" v-if="depth > 0">
		<a :href="'https://busy.org/@' + author" target="_blank">
		  <div class="comment-user-section" :style="{ paddingLeft: depth * indentFactor + 'px' }">	
			<div class="user-avatar mr-1"
                   :style="'background-image: url(https://steemitimages.com/u/' + author + '/avatar)'"></div>
			<div class="modal-author modal-title text-brand" >@{{ author }}<small class="text-brand numberCircle">{{ getUserRank }}</small><small class="date-head text-muted">{{ date }}</small></div>
		  </div>
		</a>
		<vue-markdown class="modal-body" v-html="commentBody()" :style="{ paddingLeft: depth * indentFactor + 'px' }" ></vue-markdown>
		<div class="modal-footer">
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
				  <i class="far fa-comments ml-2"></i> {{ full_data.children }}
				</small>
			</div>
			<div>
				<small>
					{{ postPayout }}
				</small>
			</div>
		</div>
		<transition name="fade">
		  <div class="comment-reply" v-if="commentBoxOpen">
			<markdown-editor v-model="replyBody" :configs="editorConfig" ref="editor"></markdown-editor>
			<a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">Post<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
			<a href="#" @click.prevent="resetOpenComment()"  class="btn btn-brand border reply-btn w-25">Cancel</a>
		  </div>
		</transition>
		<div class="comment-reply" v-if="responsePosted">
			<a :href="'https://busy.org/@' + this.$store.state.steemconnect.user.name" target="_blank">
			  <div class="comment-user-section" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.$store.state.steemconnect.user.name + '/avatar)'"></div>
				<div class="modal-author modal-title text-brand" >@{{ $store.state.steemconnect.user.name }}<small class="date-head text-muted">Now</small></div>
			  </div>
			</a>
			<vue-markdown class="modal-body" v-html="responseBody" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }" ></vue-markdown>
		</div>
	</div>
    <Comments 
				v-for="comment in reply_entries" 
				:key="comment.id"
				:reply_entries="comment.reply_entries" 
				:author="comment.author"
				:body="comment.body"
				:full_data="comment"
				:main_post_author="main_post_author"
				:main_post_permlink="main_post_permlink"
				:main_post_cat="main_post_cat"
				:depth="depth + 1">
	</Comments>
  </div>
</template>
<script>

  import VueMarkdown from 'vue-markdown'
  import steem from 'steem'
  
  export default { 
    props: [ 'author', 'reply_entries', 'depth', 'body', 'full_data', 'main_post_author', 'main_post_permlink', 'main_post_cat' ],
    name: 'Comments',
	data () {
		return {
			postUpvoted: false,
			userRank: 0,
			commentBoxOpen: false,
			replyBody: '',
			loading: false,
			responsePosted: false,
			responseBody: '',
			indentFactor: 20,
			editorConfig: { // markdown editor for post body
			  autofocus: true,
			  spellChecker: false,
			  forceSync: true,
			  //status: false,//['lines', 'words'],
			  promptURLs: true
			}
		}
	},
	watch: {
	  full_data : 'fetchReportData'
	},
	components: {
	  VueMarkdown,
	},
    computed: {
	  getVoteCount(){
		return Array.isArray(this.full_data.active_votes) ? this.full_data.active_votes.length : 0;
	  },
	  postPayout() {
		if (this.postPaid()){
			return this.full_data.total_payout_value.replace('SBD','').replace('STEEM','')+' STEEM/SBD'
		}else{
			return this.full_data.pending_payout_value.replace('SBD','').replace('STEEM','')+' STEEM/SBD'
		}
	  },
	  date() {
        let date = new Date(this.full_data.created)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
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
	components: {
	  VueMarkdown,
	},
    methods: {
      commentBody () {
		let report_content = this.full_data.body;
		
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
	  meta() {
        return JSON.parse(this.full_data.json_metadata)
      },
	  fetchReportCommentData () {
		//regrab report data to fix comments
		this.$store.dispatch('fetchReportComments', {author: this.main_post_author, category: this.main_post_cat, permlink: this.main_post_permlink})
		
		//clear the placeholder comment displayed
		this.responsePosted = false;
		this.responseBody = '';
	  },
	  /* function handles closing open comment box and resetting data */
	  resetOpenComment () {
		this.replyBody='';
		this.commentBoxOpen=false;
	  },
	  /* function handles sending out the comment to the blockchain */
	  postResponse(event) {
		// proceed with saving the comment
		
		this.loading = true
		
		//build the permlink
		
		let comment_perm = this.$store.state.steemconnect.user.name.replace('.','-') + '-re-' + this.full_data.author.replace('.','-') + '-' + this.full_data.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
		
		//prepare meta data
		let meta = [];
		meta.tags = '[actifit]';
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		
        this.$steemconnect.comment(
          this.full_data.author,
          this.full_data.permlink,
          this.$store.state.steemconnect.user.name,
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
			
			//reset open comment
			this.resetOpenComment();
          }
        )
		
	  },
	  /* function checks if logged in user has upvoted current report */
	  userVotedThisPost() {
		let curUser = this.$store.state.steemconnect.user;
		//check if the post contains in its original voters current user, or if it has been upvoted in current session
		this.postUpvoted = this.full_data.active_votes.filter(voter => (voter.voter === curUser)).length > 0;
		
		return this.postUpvoted;
	  },
	  /* function checks to see if post reached its payout period */
	  postPaid() {
		//compare today v/s payout date calculated based on 7 days payout time
		let reportDate = new Date() 
		let payoutDays = 7;
		let reportPayout = new Date(this.full_data.created);
		reportPayout.setDate(reportPayout.getDate() + payoutDays);
		let today = new Date();
		if (today.getTime() > reportPayout.getTime()){
			return true;
		}
		return false;
	  },
	  fetchReportData () {
		/*fetch(process.env.actiAppUrl+'getPostReward?user=' + this.author+'&url='+this.full_data.url).then(res => {
		//grab the post's reward to display it properly
				res.json().then(json => this.afitReward = json.token_count)}).catch(e => reject(e))*/
		
		//grab the author's rank
		fetch(process.env.actiAppUrl+'getRank/' + this.author).then(res => {
				res.json().then(json => this.userRank = json.user_rank)}).catch(e => reject(e))
				
	  },
	  /* function handles confirming if the user had voted already to prevent issues */
	  votePrompt(e) {
		//if no user is logged in, prompt to login
		if (!this.$store.state.steemconnect.user.name){
		  alert('You need to login or signup first');
		  e.stopPropagation();
		}else{
		  //proceed normally showing vote popup
		  this.$store.commit('setPostToVote', this.full_data)
		}
	  },
    },
	async mounted () {
	  if (this.full_data != null){
		this.fetchReportData();
	  }
	}
  }
</script>
<style>
.comment-info{
  overflow: auto;
}
.user-avatar{
  width: 20px;
  height: 20px;
  background-position: center center;
  background-size: cover;
  border-radius: 50%;
  float: left;
  border: solid 1px #ddd;
}
</style>