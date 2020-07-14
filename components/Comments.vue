<template>
  <div class="comments" v-if="!commentDeleted">
    <div class="modal-body comment-info" v-if="depth > 0">
		<a :href="'/' + author" target="_blank">
		  <div class="comment-user-section" :style="{ paddingLeft: depth * indentFactor + 'px' }">	
			<div class="user-avatar mr-1"
                   :style="'background-image: url('+this.profImgUrl+'/u/' + author + '/avatar)'"></div>
			<div class="modal-author modal-title text-brand" >@{{ author }}<small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small>
			</div>
		  </div>
		</a>
		<a :href="'/@' + author + '/' + full_data.permlink" target="_blank">
		  <div class="comment-user-section" :style="{ paddingLeft: depth * indentFactor + 'px' }">	
			<small class="date-head text-muted">{{ date }}</small>
		  </div>
		</a>
		<article class="modal-body" v-if="!editBoxOpen" v-html="$renderMD(commentBody())" :style="{ paddingLeft: depth * indentFactor + 'px' }"></article>
		<transition name="fade">
		  <div class="comment-reply" v-if="editBoxOpen">
			<markdown-editor v-model="full_data.body" :configs="editorConfig" ref="editor"></markdown-editor>
			
			<div class="modal-footer m-2">
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
			
			<a href="#" @click.prevent="editResponse($event)" class="btn btn-brand border reply-btn w-25">{{ $t('Post') }}<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
			<a href="#" @click.prevent="editBoxOpen = !editBoxOpen" class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
			<a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25" v-if="(this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{ $t('Short_Signature') }}</a>
			<a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25" v-if="(this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{ $t('Full_Signature') }}</a>
		  </div>
		</transition>
		<div class="modal-footer">
			<div v-if="this.user && this.user.account.name == this.full_data.author"><a href="#" @click.prevent="editBoxOpen = !editBoxOpen" :title="$t('Edit_note')"><i class="fas fa-edit"></i></a></div>
			<div v-if="commentDeletable()"><a href="#" @click.prevent="deleteComment" :title="$t('Delete_note')"><i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="deleting"></i></a></div>
			<div><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i class="fas fa-reply"></i></a></div>
			<div>
				<small>
				  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand" 
					 data-target="#voteModal" v-if="this.user && userVotedThisPost()==true">
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
			<div class="modal-footer m-2">
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
		<div class="comment-reply" v-if="responsePosted">
			<a :href="this.user.account.name" target="_blank">
			  <div class="comment-user-section" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url('+this.profImgUrl+'/u/' + this.user.account.name + '/avatar)'"></div>
				<div class="modal-author modal-title text-brand" >@{{ user.name }}<small class="date-head text-muted">{{ $t('Now') }}</small></div>
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
			errPosting: '',
			responseBody: '',
			indentFactor: 30,
			cur_bchain: 'HIVE',
			target_bchain: 'HIVE',
			profImgUrl: process.env.hiveImgUrl,
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
	  bchain: function(newBchain) {
		this.cur_bchain = newBchain;
		this.target_bchain = newBchain;
	  }
	},
	components: {
	  VueMarkdown,
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['moderators']),
	  ...mapGetters(['newlyVotedPosts', 'bchain']),
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
	  getVoteCount(){
		let totcnt = Array.isArray(this.full_data.active_votes) ? this.full_data.active_votes.length : 0;
		if (this.newlyVotedPosts.indexOf(this.full_data.post_id) != -1){
			totcnt += 1;
		}
		return totcnt;
	  },
	  postPayout() {
		if (this.postPaid()){
			return this.full_data.total_payout_value.replace('SBD','').replace('STEEM','').replace('HBD','').replace('HIVE','')+' $'
		}else{
			return this.full_data.pending_payout_value.replace('SBD','').replace('STEEM','').replace('HBD','').replace('HIVE','')+' $'
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
		//console.log(this.report);
		let report_content = this.full_data.body;
		
		//console.log(report_content);
		
		/* let's find images sent as ![](), and display them properly */
		//let img_links_reg = /^(?:(?!=").)*((https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif))|((https?:\/\/usermedia\.actifit\.io\/[./\d\w-]+)))/igm;
		let img_links_reg = /[!]\[[\d\w\s-\.\(\)]*\]\((((https?:\/\/actifit\.s3\.amazonaws\.com\/)|((https?:\/\/usermedia\.actifit\.io\/))|((https:\/\/ipfs\.busy\.org\/ipfs\/))|((https:\/\/steemitimages\.com\/)))[\d\w-=&[\:\/\.\%\?]+|(https?:\/\/[.\d\w-\/\:\%]*(\.(?:png|jpg|jpeg|gif)(\??[\d\w-=&[\:\/\.\%\?]+)?)?))[)]/igm;
		report_content = report_content.replace(img_links_reg,'<img src="$1">');
		
		/* let's find images sent as pure URLs, and display them as actual images, while avoiding well established images */
		/* negative lookbehinds are not supported ?<! we need to switch to another approach */
		//img_links_reg = /(?<!=")(?<!]\()(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))/igm;
		//img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|(https?:\/\/[./\d\w-]*\.(?:png|jpg|jpeg|gif)))(?!")/igm;
		img_links_reg = /(((https?:\/\/actifit\.s3\.amazonaws\.com\/)[\d\w-]+)|((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-]*\.(?:png|jpg|jpeg|gif)))[\s]/igm;
		report_content = report_content.replace(img_links_reg,'<img src="$1">');
		
		/* let's match youtube videos and display them in a player */
		//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
		let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
		
		//swap into a player format, and introduce embed format for proper playing of videos
		report_content = report_content.replace(vid_reg,'<iframe width="640" height="360" src="https://www.youtube.com/embed/$1"></iframe>');
		
		/* let's find links sent as [](), and display them properly */
		let href_lnks = /\[([\d\w\s-\.\(\)=[\:\/\.%\?&"<>]*)\]\(([\d\w-=[\:\/\.%\?&]+|(https?:\/\/[.\d\w-\/\:\%\(\)]*\.))[)]/igm;
		report_content = report_content.replace(href_lnks,'<a href="$2">$1</a>');
		
		//let href_lnks = /\[([\d\w-\.\@]*)\]\(([\d\w-\.\@\/\:]*)\)/igm;
		//report_content = report_content.replace(href_lnks,'<a href="$2">$1</a>');
		
		/* regex to match @ words and convert them to steem user links. Need to skip special occurrences such as name within a link (preceded by /) */
		let user_name = /([^\/])(@([\d\w-.]+))/igm;
        
		report_content = report_content.replace(user_name,'$1<a href="https://actifit.io/$2">$2</a>')
		return report_content;
      },
	  meta() {
        return JSON.parse(this.full_data.json_metadata)
      },
	  fetchReportCommentData () {
	  
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.target_bchain = this.cur_bchain;
		this.$store.commit('setBchain', this.cur_bchain);
		
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
	  
	  async processTrxFunc(op_name, cstm_params, bchain_option){
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
	  
	  deleteSuccess (err) {
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
	  },
	  /* function handles deleting comment */
	  async deleteComment () {
		  var confirmPopup = confirm(this.$t('confirm_delete_comment'));
		  if (!confirmPopup){
			return;
		  }
		  //proceed with deletion
		  this.deleting = true
		  console.log(this.stdLogin);
		  if (!localStorage.getItem('std_login')){
		  //if (!this.stdLogin){
			this.$steemconnect.deleteComment(
			  this.full_data.author,
			  this.full_data.permlink,(err) => {
				this.deleteSuccess (err);

			  }
			)
		  }else{
			let cstm_params = {
			  "author": this.full_data.author,
			  "permlink": this.full_data.permlink
			};
			
			let res = await this.processTrxFunc('delete_comment', cstm_params);
			
			if (res.success){
				this.deleteSuccess();
			}
		  }
	  },
	  commentSuccess (err, finalize, bchain) {
		// stop loading animation and show notification
		
		this.$notify({
		  group: err ? 'error' : 'success',
		  text: err ? this.$t('Comment_Error') : this.$t('Comment_Success_Chain').replace('_CHAIN_', bchain),
		  position: 'top center'
		})
		
		if (finalize){
			this.loading = false
			this.editBoxOpen = false;
			
			//display comment placeholder till blockchain data comes through
			this.responsePosted = true;
			this.responseBody = this.replyBody;

			//refetch report data anew, but only after 10 seconds to ensure data has been made available
			setTimeout( this.fetchReportCommentData, 10000);
			
			//reset open comment
			this.resetOpenComment();
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
		
		let comment_perm = this.user.account.name.replace('.','-') + '-re-' + this.full_data.author.replace('.','-') + '-' + this.full_data.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
		
		//prepare meta data
		let meta = [];
		meta.tags = '[actifit]';
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		
		
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
		
			this.$steemconnect.comment(
			  this.full_data.author,
			  this.full_data.permlink,
			  this.user.account.name,
			  comment_perm,
			  '',
			  this.replyBody,
			  meta,
			  (err) => {
				this.commentSuccess(err, true, 'STEEM');
			  }
			)
		}else{
			let cstm_params = {
			  "author": this.user.account.name,
			  "title": "",
			  "body": this.replyBody,
			  "parent_author": this.full_data.author,
			  "parent_permlink": this.full_data.permlink,
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
				//this.loading = true;
				let res = await this.processTrxFunc('comment', cstm_params, other_chain);
			
				if (res.success){
					this.commentSuccess(null, true, other_chain);
				}else{
					this.commentSuccess('error saving', false, other_chain);
				}
			}
		}
	  },
	  /* function handles editing out the comment to the blockchain */
	  async editResponse(event) {
		// proceed with saving the comment
		
		this.loading = true		
		
		//append meta data
		let meta = JSON.parse(this.full_data.json_metadata);
		meta.tags = '[actifit]';
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		
		if (!localStorage.getItem('std_login')){
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
		}else{
			let cstm_params = {
			  "author": this.full_data.author,
			  "title": this.full_data.title,
			  "body": this.full_data.body,
			  "parent_author": this.full_data.parent_author,
			  "parent_permlink": this.full_data.parent_permlink,
			  "permlink": this.full_data.permlink,
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
				//this.loading = true;
				let res = await this.processTrxFunc('comment', cstm_params, other_chain);
			
				if (res.success){
					this.commentSuccess(null, true, other_chain);
				}else{
					this.commentSuccess('error saving', false, other_chain);
				}
			}
		}
		
	  },
	  /* function checks if logged in user has upvoted current report */
	  userVotedThisPost() {
		let curUser = this.user.account.name;
		//check if the post contains in its original voters current user, or if it has been upvoted in current session
		if (!curUser){
			this.postUpvoted = false;
			return this.postUpvoted;
		}
		this.postUpvoted = this.full_data.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.full_data.post_id)!==-1;
		
		return this.postUpvoted;
	  },
	  /* function checks if the comment can be deleted */
	  commentDeletable () {
		return (parseInt(this.full_data.children) == 0 
				&& this.user && this.user.account.name == this.full_data.author
				&& parseInt(this.full_data.pending_payout_value.replace('SBD','').replace('STEEM','')) == 0
				&& parseInt(this.full_data.total_payout_value.replace('SBD','').replace('STEEM','')) == 0
				&& parseInt(this.full_data.curator_payout_value.replace('SBD','').replace('STEEM','')) == 0)
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
		
		//console.log(this.full_data);
		
		//grab the author's rank
		fetch(process.env.actiAppUrl+'getRank/' + this.author).then(res => {
				res.json().then(json => this.userRank = json)}).catch(e => reject(e))
		
		//grab moderators' list
		this.$store.dispatch('fetchModerators')
				
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
		//if no user is logged in, prompt to login
		/*if (!this.user.account.name){
		  alert(this.$t('need_login_signup_notice_vote'));
		  e.stopPropagation();
		}else{*/
		  //proceed normally showing vote popup
		  this.$store.commit('setPostToVote', this.full_data)
		///}
	  },
    },
	async mounted () {
	  this.profImgUrl = process.env.hiveImgUrl;
	  this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
	  if (this.cur_bchain == 'STEEM'){
		this.profImgUrl = process.env.steemImgUrl;
	  }
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