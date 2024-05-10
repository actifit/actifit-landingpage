<template>
  <transition name="fade">
  <div class="comments mb-2" v-if="!commentDeleted && !commentMinimized">

	<div class="col-12 row" v-if="depth == 0">
		<div class="col-md-9"></div>
		<select v-model="currentSort" class="form-control col-md-2 sel-adj float-right" >
			<option value="">-- {{$t('Sort_By')}} --</option>
			<option :value="JSON.stringify({value: 'author', direction: 'asc'})">{{$t('Name')}}▲</option>
			<option :value="JSON.stringify({value: 'author', direction: 'desc'})">{{$t('Name')}}▼</option>
			<option :value="JSON.stringify({value: 'payout', direction: 'asc'})">{{$t('Payout')}}▲</option>
			<option :value="JSON.stringify({value: 'payout', direction: 'desc'})">{{$t('Payout')}}▼</option>
			<option :value="JSON.stringify({value: 'children', direction: 'asc'})">{{$t('Replies')}}▲</option>
			<option :value="JSON.stringify({value: 'children', direction: 'desc'})">{{$t('Replies')}}▼</option>
			<option :value="JSON.stringify({value: 'active_votes', direction: 'asc'})">{{$t('Votes')}}▲</option>
			<option :value="JSON.stringify({value: 'active_votes', direction: 'desc'})">{{$t('Votes')}}▼</option>
			<option :value="JSON.stringify({value: 'created', direction: 'asc'})">{{$t('Date')}}▲</option>
			<option :value="JSON.stringify({value: 'created', direction: 'desc'})">{{$t('Date')}}▼</option>
		</select>
		
		<span class="p-2 col-md-1"><i class="fa-solid fa-circle-minus text-brand" v-on:click="commentMinimized=!commentMinimized" :title="$t('hide_comment')" style="cursor: pointer"></i></span>
    </div>
	<div v-else class="col-12 text-right">
		<i class="fa-solid fa-circle-minus text-brand" v-on:click="commentMinimized=!commentMinimized" :title="$t('hide_comment')" style="cursor: pointer"></i>
	</div>
	<div class="modal-body comment-info acti-shadow mb-2" v-if="depth > 0">
		<div class="main-user-info pt-2">
			<a :href="'/' + author" target="_blank">
			  <div class="comment-user-section" :style="{ paddingLeft: depth * indentFactor + 'px' }">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url('+this.profImgUrl+'/u/' + author + '/avatar)'"></div>
				<div class="modal-author modal-title" >@{{ author }}<small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small>
				</div>
			  </div>
			</a>
		<!--<a :href="'/@' + author + '/' + full_data.permlink" target="_blank">-->
			<div class="comment-user-section pt-2" :style="{ paddingLeft: depth * indentFactor + 'px' }">	
				<a :title="$t('comment_link')" :href="buildLink" id="comment-link" ref="comment-link"><span class="date-head text-muted" :title="date">{{ $getTimeDifference(full_data.created) }}</span>&nbsp;<i class="fas fa-link"></i></a>
				<i :title="$t('copy_link')" class="fas fa-copy text-brand" v-on:click="copyContent" ></i>
			</div>
		<!--</a>-->
		</div>
		
		<vue-remarkable class="modal-body pb-0" v-if="!editBoxOpen" :source="commentBody()" :style="{ paddingLeft: depth * indentFactor + 'px' }" :options="{'html': true, 'breaks': true, 'typographer': true}"></vue-remarkable>
		<transition name="fade">
		  <div class="comment-reply" v-if="editBoxOpen">
			<CustomTextEditor ref="editor" :initialContent="full_data.body" ></CustomTextEditor>
			
			<div class="modal-footer m-2" style="display: none">
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
		<div class="modal-footer main-payment-info p-2">
			<div v-if="this.user && this.user.account.name == this.full_data.author"><a href="#" @click.prevent="editBoxOpen = !editBoxOpen" :title="$t('Edit_note')"><i class="fas fa-edit text-white"></i></a></div>
			<div v-if="commentDeletable()"><a href="#" @click.prevent="deleteComment" :title="$t('Delete_note')"><i class="fas fa-trash-alt text-white"></i><i class="fas fa-spin fa-spinner" v-if="deleting"></i></a></div>
			<div><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i class="fas fa-reply  text-white"></i></a></div>
			<div>
				
			  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand" 
				 data-target="#voteModal" v-if="this.user && userVotedThisPost()==true">
				<i class="far fa-thumbs-up"></i> {{getVoteCount }}
			  </a>
			  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal"
				 data-target="#voteModal" class="actifit-link-plain" v-else>
				<i class="far fa-thumbs-up"></i> {{ getVoteCount }}
			  </a>
			  <i class="far fa-comments ml-2"></i> {{ full_data.children }}
			
			</div>
			<div>
				<!--<small>
					{{ postPayout }}
				</small>-->
				<span v-if="postPaid()">
						<!--<i class="fa-solid fa-wallet text-green"></i>-->
						<span class="m-1" :title="$t('author_payout')">
							<i class="fa-solid fa-user" ></i>
							{{paidValue()}}
						</span>
						<span class="m-1"  :title="$t('voters_payout')">
							<i class="fa-solid fa-users"></i>
							{{full_data.curator_payout_value}}
						</span>
						<i class="fa-solid fa-check text-green text-bold"></i>
					</span>
					<span v-else>
						<span class="text-bold">{{ full_data.pending_payout_value.replace('SBD','')}}</span>
						<i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
					</span>
					<span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()">
						<i class="fas fa-user-pen"><sup>{{full_data.beneficiaries.length}}</sup></i>
					</span>
			</div>
		</div>
		<transition name="fade">
		  <div class="comment-reply" v-if="commentBoxOpen">
			<!--<vue-simplemde v-model="replyBody" :configs="editorConfig" ref="editor"></vue-simplemde>-->
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
		<div class="comment-reply" v-if="responsePosted">
			<a :href="this.user.account.name" target="_blank">
			  <div class="comment-user-section" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }">
				<div class="user-avatar mr-1"
					   :style="'background-image: url('+this.profImgUrl+'/u/' + this.user.account.name + '/avatar)'"></div>
				<div class="modal-author modal-title" >@{{ user.name }}<small class="date-head text-muted">{{ $t('Now') }}</small></div>
			  </div>
			</a>
			<vue-remarkable class="modal-body" :source="getContent" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }" ></vue-remarkable>
			<!--<vue-markdown class="modal-body" v-html="responseBody" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }" ></vue-markdown>-->
			<!--<article class="modal-body" v-html="$renderMD(responseBody)" :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }" ></article>-->
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
  <div class="comments mb-2" v-else-if="!commentDeleted && commentMinimized">
	<div class="col-12 text-right">
		<i class="fa-solid fa-circle-plus text-brand" v-on:click="commentMinimized=!commentMinimized" :title="$t('show_comment')" style="cursor: pointer"></i>
	</div>
  </div>
  </transition>
</template>
<script>

  import vueRemarkable from 'vue-remarkable';

  import steem from 'steem'
  
  import Vue from 'vue'
  
  import { mapGetters } from 'vuex'
  
  import sanitize from 'sanitize-html'
  
  import CustomTextEditor from '~/components/CustomTextEditor' 
  
  import Lodash from 'lodash'
  
  export default { 
    props: [ 'author', 'reply_entries', 'depth', 'body', 'full_data', 'main_post_author', 'main_post_permlink', 'main_post_cat' ],
    name: 'Comments',
	data () {
		return {
			currentSort: JSON.stringify({value: 'created', direction: 'desc'}),
			postUpvoted: false,
			commentDeleted: false,
			commentMinimized: false,
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
			
		}
	},
	watch: {
	  full_data : 'fetchReportData',
	  currentSort: 'reorderComments',
	  bchain: function(newBchain) {
		this.cur_bchain = newBchain;
		this.target_bchain = newBchain;
	  }
	},
	components: {
	  CustomTextEditor,
	  vueRemarkable
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['moderators']),
	  ...mapGetters(['newlyVotedPosts', 'bchain']),
	  buildLink (){
		return '/@' + this.full_data.author + '/' + this.full_data.permlink;
	  },
	  getContent () {
		return this.responseBody;
	  },
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
			return '';
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
    methods: {
		reorderComments () {
			try{
				//console.log(this.currentSort);
				let sortApproach = JSON.parse(this.currentSort);
				//console.log(sortApproach.value);
				if (sortApproach.value){
					//console.log(sortApproach.value);
					if (sortApproach.value == 'payout'){
						this.reply_entries = _.orderBy(this.reply_entries, function(e) { 
								let val = parseFloat(e.pending_payout_value)
								if (val > 0) return val;
								else return parseFloat(e.total_payout_value)
							},[sortApproach.direction]);
					}else{
						this.reply_entries = _.orderBy(this.reply_entries, [sortApproach.value],[sortApproach.direction]);
					}
					this.$forceUpdate();
				}
			}catch(err){
				console.log(err);
			}
		},
		copyContent (event){
			navigator.clipboard.writeText('https://actifit.io/@' + this.full_data.author + '/' + this.full_data.permlink)
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
      commentBody () {
		//console.log('comment body');
		//console.log(this.full_data.body);
		let report_content = this.full_data.body;
		
		
		//sanitize content first hand
		report_content = sanitize(report_content , { allowedTags: ['img'] });
		
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
		
		//add support for 3speak videos embedded within iframe
		//let threespk_reg = /[.*](https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+))/i;
		//let threespk_reg = /(?:\[!\[\]\()?https?:\/\/3speak\.tv\/watch\?v=([\w-]+\/[\w-]+)(?:\)\])?/i;
		let threespk_reg = /(?:\[.*\]\()?https?:\/\/3speak\.tv\/watch\?v=([\w.-]+\/[\w.-]+)(?:\))?/i;
		report_content = report_content.replace(threespk_reg,'<iframe width="640" height="360" src="//3speak.tv/embed?v=$1&autoplay=false"></iframe>');
		//examples: 
		//https://3speak.tv/watch?v=jongolson/vhtttbyf		//[![](https://ipfs-3speak.b-cdn.net/ipfs/bafkreiee4k3q5sax6stbqzty6yktbhmk4mi2opf6r7hckti3ypkjvigjhi/)](https://3speak.tv/watch?v=jongolson/vhtttbyf)
		
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
			if (res.result.ref_block_num) {
				console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			await window.hive_keychain.requestBroadcast(
				this.user.account.name, 
				[[op_name, cstm_params]], 
				'Active', (response) => {
				console.log(response);
				if (op_name == 'delete_comment'){
					this.deleteSuccess();
				}
			});
		}else if (localStorage.getItem('acti_login_method') == 'hiveauth'){	
			return new Promise((resolve) => {
				const auth = {
				  username: this.user.account.name,
				  token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
				  expire: localStorage.getItem('expires'),
				  key: localStorage.getItem('key')
				}
				console.log(auth);
				this.$HAS.broadcast(auth, 'active', [[op_name, cstm_params]], (evt)=> {
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
						resolve({success: true, trx:{id: response.data}})
						if (op_name == 'delete_comment'){
							this.deleteSuccess();
						}
					}else if (response.cmd && response.cmd === 'sign_nack'){
						resolve({success: false})
					}
				} ) // transaction approved and successfully broadcasted
				.catch(err => {
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					console.log(err);
					resolve({success: false})
				} )
			})
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
			}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
				let cstm_params = {
			  "author": this.full_data.author,
			  "permlink": this.full_data.permlink
			};
			
			let res = await this.processTrxFunc('delete_comment', cstm_params);
			
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
		meta.tags = ['hive-193552', 'actifit'];
		meta.app = 'actifit/0.5.0';
		meta.suppEdit = 'actifit.io.comment';
		this.replyBody = this.$refs.editor.content;
		
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
				this.full_data.permlink,
				this.full_data.author,
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
		meta.tags = ['hive-193552', 'actifit'];
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		this.full_data.body = this.$refs.editor.content;
		
		
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
				}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
		
			let comment_options = { 
				author: this.user.account.name, 
				permlink: this.full_data.permlink, 
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
				this.full_data.title, 
				this.full_data.body,
				this.full_data.parent_permlink,
				this.full_data.parent_author,
				JSON.stringify(meta),
				this.full_data.permlink,
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
	  /* function checks if post has beneficiaries */
	  hasBeneficiaries() {
		return Array.isArray(this.full_data.beneficiaries) && this.full_data.beneficiaries.length > 0;
	  },
	  beneficiariesDisplay(){
		let output = 'Beneficiaries:\n';
		for (let i=0;i<this.full_data.beneficiaries.length;i++){
			output += this.full_data.beneficiaries[i].account+ ': ' + this.full_data.beneficiaries[i].weight/100 + '% \n';
		}
		return output;
	  },
	  /* function returns author payout value */
	  paidValue() {
		if (this.full_data.total_payout_value ) return this.full_data.total_payout_value
		if (this.full_data.author_payout_value ) return this.full_data.author_payout_value
	  },
	  /* function checks to see if post reached its payout period */
	  postPaid() {
		if (this.full_data.is_paidout){
			//works for comments
			return true;
		}
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
  width: 30px;
  height: 30px;
  background-position: center center;
  background-size: cover;
  border-radius: 50%;
  float: left;
  border: solid 1px #ddd;
}

.arrow-icon {
  height: 2.8em;
  width: 2.8em;
  display:block;
  padding: 0.5em;
  margin: 1em auto;
  position: relative;
  cursor: pointer;
  border-radius: 4px;
}

/*
.comments {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
}

.comment-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.comment-user-section {
  display: flex;
  align-items: center;
}
*/
</style>