<template>
  <div class="comments" v-if="!commentDeleted">
    <div class="modal-body comment-info" v-if="depth > 0">
		<a :href="'/' + author" target="_blank">
		  <div class="comment-user-section" :style="{ paddingLeft: depth * indentFactor + 'px' }">	
			<div class="user-avatar mr-1"
                   :style="'background-image: url(https://steemitimages.com/u/' + author + '/avatar)'"></div>
			<div class="modal-author modal-title text-brand" >@{{ author }}<small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small><small class="date-head text-muted">{{ date }}</small></div>
		  </div>
		</a>
		<article class="modal-body" v-if="!editBoxOpen" v-html="$renderMD(commentBody())" :style="{ paddingLeft: depth * indentFactor + 'px' }"></article>
		<transition name="fade">
		  <div class="comment-reply" v-if="editBoxOpen">
			<markdown-editor v-model="full_data.body" :configs="editorConfig" ref="editor"></markdown-editor>
			<a href="#" @click.prevent="editResponse($event)" class="btn btn-brand border reply-btn w-25">{{ $t('Post') }}<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
			<a href="#" @click.prevent="editBoxOpen = !editBoxOpen" class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
		  </div>
		</transition>
		<div class="modal-footer">
			<div v-if="this.$store.state.steemconnect.user && this.$store.state.steemconnect.user.name == this.full_data.author"><a href="#" @click.prevent="editBoxOpen = !editBoxOpen">{{ $t('Edit_note') }}</a></div>
			<div v-if="this.$store.state.steemconnect.user && this.$store.state.steemconnect.user.name == this.full_data.author"><a href="#" @click.prevent="deleteComment">{{ $t('Delete_note') }}<i class="fas fa-spin fa-spinner" v-if="deleting"></i></a></div>
			<div><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen">{{ $t('Reply') }}</a></div>
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
			<a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">{{ $t('Post') }}<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
			<a href="#" @click.prevent="resetOpenComment()"  class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
		  </div>
		</transition>
		<div class="comment-reply" v-if="responsePosted">
			<a :href="this.$store.state.steemconnect.user.name" target="_blank">
			  <div class="comment-user-section" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.$store.state.steemconnect.user.name + '/avatar)'"></div>
				<div class="modal-author modal-title text-brand" >@{{ $store.state.steemconnect.user.name }}<small class="date-head text-muted">{{ $t('Now') }}</small></div>
			  </div>
			</a>
			<article class="modal-body" v-html="$renderMD(responseBody)" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }" ></article>
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
  
  import Vue from 'vue'
  
  import { mapGetters } from 'vuex'
  
  import steemEditor from 'steem-editor';
  import 'steem-editor/dist/css/index.css';
  
  export default { 
    props: [ 'author', 'reply_entries', 'depth', 'body', 'full_data', 'main_post_author', 'main_post_permlink', 'main_post_cat' ],
    name: 'Comments',
	data () {
		return {
			postUpvoted: false,
			commentDeleted: false,
			userRank: 0,
			commentBoxOpen: false,
			editBoxOpen: false,
			replyBody: '',
			moderatorSignature: '',
			loading: false,
			deleting: false,
			responsePosted: false,
			responseBody: '',
			indentFactor: 30,
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
	  full_data : 'fetchReportData',
	  moderators: 'insertModSignature',
	},
	components: {
	  VueMarkdown,
	},
    computed: {
	  ...mapGetters(['moderators']),
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
    },
	components: {
	  VueMarkdown,
	},
    methods: {
      commentBody () {
		let report_content = this.full_data.body;
		
		/* let's match youtube vidoes and display them in a player */
		//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
		let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
		
		//swap into a player format, and introduce embed format for proper playing of videos
		report_content = report_content.replace(vid_reg,'<iframe width="640" height="360" src="https://www.youtube.com/embed/$1"></iframe>');
		
		/* regex to match @ words and convert them to steem user links */
		let user_name = /(@([\a-zA-Z0-9-.]+)(?![\a-zA-Z0-9-.]))([,.|() ])/g;
        return report_content.replace(user_name,'[$1](https://actifit.io/$1)$3')
      },
	  meta() {
        return JSON.parse(this.full_data.json_metadata)
      },
	  fetchReportCommentData () {
		//regrab report data to fix comments
		this.$store.dispatch('fetchReportComments', {author: this.main_post_author, category: this.main_post_cat, permlink: this.main_post_permlink})
		
		//clear the placeholder comment displayed
		this.responsePosted = false;
		this.responseBody = this.moderatorSignature;
	  },
	  /* function handles closing open comment box and resetting data */
	  resetOpenComment () {
		this.replyBody = this.moderatorSignature;
		this.commentBoxOpen=false;
	  },
	  /* function handles deleting comment */
	  deleteComment () {
		  var confirmPopup = confirm(this.$t('confirm_delete_comment'));
		  if (!confirmPopup){
			return;
		  }
		  //proceed with deletion
		  this.deleting = true
		  
		  this.$steemconnect.deleteComment(
          this.full_data.author,
          this.full_data.permlink,(err) => {
            // stop deleting animation and show notification
            this.deleting = false
            this.$notify({
              group: err ? 'error' : 'success',
              text: err ? this.$t('Delete_Error') : this.$t('Delete_Success'),
              position: 'top center'
            })
			
			//display comment placeholder till blockchain data comes through
			if (!err){	
				this.commentDeleted = true;
			}	

			//refetch report data anew, but only after 10 seconds to ensure data has been made available
			setTimeout( this.fetchReportCommentData, 10000);

          }
        )
		  
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
              text: err ? this.$t('Comment_Error') : this.$t('Comment_Success'),
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
	  /* function handles editing out the comment to the blockchain */
	  editResponse(event) {
		// proceed with saving the comment
		
		this.loading = true		
		
		//append meta data
		let meta = JSON.parse(this.full_data.json_metadata);
		meta.tags = '[actifit]';
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		
        this.$steemconnect.comment(
          this.full_data.parent_author,
          this.full_data.parent_permlink,
          this.full_data.author,
          this.full_data.permlink,
          this.full_data.title,
          this.full_data.body,
          meta,
          (err) => {
            // stop loading animation and show notification
            this.loading = false
            this.$notify({
              group: err ? 'error' : 'success',
              text: err ? this.$t('Edit_Error') : this.$t('Edit_Success'),
              position: 'top center'
            })
			
			//display comment placeholder till blockchain data comes through
			this.editBoxOpen = false;

			//refetch report data anew, but only after 10 seconds to ensure data has been made available
			setTimeout( this.fetchReportCommentData, 10000);

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
		//check if last_payout is after cashout_time which means post got paid
		let last_payout = new Date(this.full_data.last_payout);
		let cashout_time = new Date(this.full_data.cashout_time);
		if (last_payout.getTime() > cashout_time.getTime()){
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
				res.json().then(json => this.userRank = json)}).catch(e => reject(e))
		
		//grab moderators' list
		this.$store.dispatch('fetchModerators')
				
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
		if (!this.$store.state.steemconnect.user.name){
		  alert(this.$t('need_login_signup_notice_vote'));
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
  padding-top: 10px;
  padding-bottom: 0px; 
  border: 1px solid #e9ecef;
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