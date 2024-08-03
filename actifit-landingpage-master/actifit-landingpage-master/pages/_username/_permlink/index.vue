<template>
  <div>
	<NavbarBrand />
	<i class="fa-solid fa-language ml-2"></i>
	<!--<div class="container pt-5 mt-5 col-md-6" >
		<div class="text-right" >
			<ChainSelection />
		</div>
	</div>-->
	
	<div v-if="report && report.author" class="container pt-5 mt-5 pb-5 col-md-6" >
		<div class="text-right" >
			<ChainSelection />
		</div>
        <div class="report-head mb-3 col-md-12">
          <!-- if this is a comment, display link to higher level comment/post -->
		  <div v-if="report.parent_author" class="text-right">
			<i class="fas fa-reply text-brand"></i>&nbsp;{{$t('viewing_comment_note')}}<span class="user-avatar mr-1 float-right" :style="'background-image: url('+profImgUrl+'/u/' + report.parent_author + '/avatar)'"></span><a :href="'/'+report.parent_author">@{{ report.parent_author }}.</a>&nbsp;<a :href="buildParentLink">{{$t('view_parent_thread')}}</a>
		  </div>
		  
		  <h2>{{ report.title }}</h2>
		  <div class="main-user-info">
			<h5 class="text-brand" >
				<div class="user-avatar mid-avatar mr-1 mb-5"
					   :style="'background-image: url('+profImgUrl+'/u/' + this.report.author + '/avatar)'"></div>
				<a :href="'/'+report.author" target="_blank">@{{ report.author}} 
					<small class="text-brand numberCircle">{{ displayCoreUserRank }} 
						<span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }} </span>
					</small>
				</a>
				
			</h5>
			<a :href="buildLink"><span class="date-head text-muted">{{ date }}</span>&nbsp;<i class="fas fa-link"></i></a>
			<i :title="$t('copy_link')" class="fas fa-copy text-brand" v-on:click="copyContent" ></i>
		  
			<div class="report-tags p-1" v-html="displayReportTags"></div>
		  </div>
        </div>
		<vue-remarkable class="col-md-12" :source="body" :options="{'html': true, 'breaks': true, 'typographer': true}" ></vue-remarkable>
		<!--<div v-html="body"></div>-->
		<!--<div class="modal-body goog-ad-horiz-90"><adsbygoogle ad-slot="4921049809" /></div>-->
		<div class="modal-footer col-md-12 main-payment-info">
		  <div class="report-modal-prelim-info col-md-6">
			<span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i class="text-white fas fa-reply"></i></a></span>
			
			<span class="ml-1">
				  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand" 
					 data-target="#voteModal" v-if="this.user && userVotedThisPost()==true">
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
				<span :title="postPayout">
					<img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain=='STEEM'">
					<img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain=='HIVE'">
					<img src="/img/BLURT.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain=='BLURT'">
					<!--{{ postPayout }}-->
					<span v-if="postPaid()">
						<!--<i class="fa-solid fa-wallet text-green"></i>-->
						<span class="m-1" :title="$t('author_payout')">
							<i class="fa-solid fa-user" ></i>
							{{paidValue()}}
						</span>
						<span class="m-1"  :title="$t('voters_payout')">
							<i class="fa-solid fa-users"></i>
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
						  :description="socialSharingDesc"
						  :quote="socialSharingQuote"
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
		<div class="modal-footer col-md-12" v-if="this.meta.full_afit_pay=='on'">
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
		<div class="modal-footer col-md-12 text-brand" v-if="this.meta.charity">
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
		  <div class="report-reply col-md-12" v-if="commentBoxOpen">
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
		  </div>
		</transition>
		<div class="report-reply col-md-12" v-if="responsePosted">
			<a :href="'/'+this.user.account.name" target="_blank">
			  <div class="comment-user-section">	
				<div class="user-avatar mr-1"
					   :style="'background-image: url('+profImgUrl+'/u/' + this.user.account.name + '/avatar)'"></div>
				<div class="modal-author modal-title text-brand" >@{{ user.account.name }}<small class="date-head text-muted">{{ $t('Now') }}</small></div>
			  </div>
			</a>
			<vue-remarkable :source="responseBody" :options="{'html': true, 'breaks': true, 'typographer': true}" ></vue-remarkable>
		</div>
		<div class="report-comments col-md-12" v-if="commentsAvailable">
			<Comments 
				:author="commentEntries.author" 
				:body="commentEntries.body" 
				:reply_entries.sync="commentEntries.reply_entries" 
				:main_post_author="report.author"
				:main_post_permlink="report.permlink"
				:main_post_cat="report.category"
				:depth="0" 
				:key="reload"/>
		</div>
	</div>
	<div v-else-if="errorDisplay" class="container pt-5 mt-5 pb-5 col-md-6" >
		<div class="text-right" >
			<ChainSelection />
		</div>
		<div class="mb-3 text-center">
          <h4>{{ errorDisplay }}</h4>
		</div>
	</div>
	<div v-else class="container pt-5 mt-5 pb-5">
		<div class="mb-3 text-center">
			<i class="fas fa-spin fa-spinner text-brand"></i>
		</div>
	</div>
	<VoteModal />
	<NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')"/>
	<NotifyModal id="notifyModalRC" ref="notifyModalRC" :modalTitle="$t('Actifit_Info')" :modalText="$t('RC_desc')"/>
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
	<Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import ChainSelection from '~/components/ChainSelection'
  import Footer from '~/components/Footer'

  import steem from 'steem'
  import {mapGetters} from 'vuex'
  import Comments from '~/components/Comments'
  import NotifyModal from '~/components/NotifyModal'
  
  import vueRemarkable from 'vue-remarkable';
  
  import CustomTextEditor from '~/components/CustomTextEditor'
    
  import Vue from 'vue'
  
  import SocialSharing from 'vue-social-sharing'
  
  import VoteModal from '~/components/VoteModal'
  
  import sanitize from 'sanitize-html'
  
  import hive from '@hiveio/hive-js'
  
  import blurt from '@blurtfoundation/blurtjs'
  
  import { Remarkable } from 'remarkable';
  import RemarkableSpoiler from '@quochuync/remarkable-spoiler';
  import '@quochuync/remarkable-spoiler/styles.css';
  
  //var md = new Remarkable({html: true});
  //md.use(RemarkableSpoiler);
  
  
  import { mavonEditor } from 'mavon-editor'
  const md = mavonEditor.getMarkdownIt()
  
  //console.log(md.render('# Remarkable rulezz!>! This is a spoiler content. > This is a second line'));

  //Vue.use( steemEditor );  
  
  const scot_steemengine_api = process.env.steemEngineScot;
  const scot_hive_api_param = process.env.hiveEngineScotParam;
  const tokensOfInterest = ['SPORTS', 'PAL', 'APX'];
  
  export default {
	head () {
		return {
		  title: `${this.postTitle} by ${this.username} - Actifit`,
		  meta: [
				{ hid: 'title', name: 'og:title', 'property':'og:title', content: `${this.postTitle} by ${this.username} - Actifit`},
				{ hid: 'description', name: 'description', content: `${this.desc} by ${this.username}` },
				{ hid: 'ogdescription', name: 'og:description', 'property':'og:description', content: `${this.desc} by ${this.username}` },
				{ hid: 'image', name: 'og:image', 'property':'og:image', content: `${this.postImg}`}
			  ],
		  link: [
				{ rel: 'canonical', href: `${this.canonUrl}`}
		  ]
		}
	},
	async asyncData ({params}) {
		//let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE')
		//if (cur_bchain == 'HIVE'){
		//set HIVE as default chain, since we cannot use localstorage in here
		let chainLnk = hive;
		await chainLnk.api.setOptions({ url: process.env.hiveApiNode });
		/*}else{
			await steem.api.setOptions({ url: process.env.steemApiNode });
		}	  */
		//console.log('connect node');
		let user_name = params.username.replace('@','');
		let result = await chainLnk.api.getContentAsync(user_name, params.permlink);
		let is_steem = false;
		if (!result || !result.author){
			//switch to Steem chain
			/*chainLnk = steem
			await chainLnk.api.setOptions({ url: process.env.steemApiNode });
			result = await chainLnk.api.getContentAsync(user_name, params.permlink);
			is_steem = true;
			
			if (!result || !result.author){*/
				//if no result, switch to Blurt
				chainLnk = blurt;
				await chainLnk.api.setOptions({ url: process.env.blurtApiNode });
				result = await chainLnk.api.getContentAsync(user_name, params.permlink);
				is_steem = false;
			//}
		}
		//console.log('pre-flight');
		//console.log(result);
		try{
			let post_meta = JSON.parse(result.json_metadata)
			let imgs = post_meta.image;
			let meta_spec = {
				postTitle: result.title,
			}
			if (Array.isArray(imgs) && imgs.length > 0 ){
				meta_spec.postImg = imgs[0];
			}
			
			//let's set proper canonical url based of app
			let canonUrl = '';

			if (post_meta.app){
				let src_app = post_meta.app.split('/')[0];
				//fetch post original category
				let post_cat = result.category;
				
				//fallback
				if (!post_cat){
					post_cat = post_meta.community;
				}
				
				//list of current apps applying proper formal scripting. Default as hive
				let appsPatterns = process.env.hiveAppsScript;
				
				//fallback to steem 
				if (is_steem){
					appsPatterns = process.env.steemAppsScript;
				}
				
				for (let appPat in appsPatterns) {
					if (src_app.toLowerCase() == appPat.toLowerCase()){
						//found, grab pattern
						if (appsPatterns[appPat].url_scheme){
							//some might not have a pattern, skip them
							canonUrl = appsPatterns[appPat].url_scheme.replace('{username}', user_name)
															.replace('{permlink}', params.permlink)
															.replace('{category}', post_cat);
						}
						break;
					}
				}
			}
			meta_spec.canonUrl = canonUrl;
			//console.log(result);
			//console.log(result.body);

			//remove all tags from text
			let desc = sanitize(result.body, { allowedTags: [] });
			
			//remove all links/image links
			let img_links_reg = /[!]?\[[\d\w\s-\.\(\)]*\]\(((((https?:\/\/usermedia\.actifit\.io\/))|((https:\/\/ipfs\.busy\.org\/ipfs\/))|((https:\/\/steemitimages\.com\/)))[\d\w-[\:\/\.\%]+|(https?:\/\/[.\d\w-\/\:\%\(\)]*\.(?:png|jpg|jpeg|gif)))[)]/igm;
			desc = desc.replace(img_links_reg,'');
			
			/* let's find images sent as pure URLs */
			img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-]*\.(?:png|jpg|jpeg|gif)))[\s]/igm;
			desc = desc.replace(img_links_reg,'');
			
			/* replace spaces with single separating space */
			desc = desc.replace(/\s+/g,' ');
			
			/* cleanup some markdown known syntax */
			desc = desc.replace(/\#/g,'')
						.replace(/\*/g,'')
						.replace(/\_/g,'');
			
			//make sure we don't over consume desc size
			if (desc.length > 140){
				desc = desc.substr(0, 140) + '...';
			}
			//console.log(desc);
			meta_spec.desc = desc;
			return meta_spec;
		}catch(preerr){
			console.log(preerr);
			return '';
		}
	},
	data () {
		return {
			report: '',
			postAuthor: '',
			errorDisplay: '',
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
			},
			displayMorePayoutData: false,
			cur_bchain: 'HIVE',
			target_bchain: 'HIVE',
			reload: 0,
			profImgUrl: process.env.hiveImgUrl,
			socialSharingTitle: process.env.socialSharingTitle,
			socialSharingDesc: process.env.socialSharingDesc,
			socialSharingQuote: process.env.socialSharingQuote,
			hashtags: process.env.socialSharingHashtags,
		}
	},
	watch: {
	  report: 'fetchReportData',
	  postUpvoted: 'updatePostData',
	  user: 'fetchUserData',
	  bchain: async function(newBchain) {
		console.log('post content change in chain '+newBchain);
		this.cur_bchain = newBchain;
		await this.$store.dispatch('steemconnect/refreshUser');
		await this.updatePostData();
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
		this.reload += 1;
	  }
	},
	components: {
	  NavbarBrand,
	  Footer,
	  CustomTextEditor,
	  vueRemarkable,
	  Comments,
	  SocialSharing,
	  VoteModal,
	  NotifyModal,
	  ChainSelection
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  ...mapGetters(['newlyVotedPosts']),
	  ...mapGetters(['commentEntries'], 'commentCountToday'),
	  ...mapGetters(['moderators', 'bchain']),
	  buildParentLink(){
		return '/'+this.report.parent_author+'/'+this.report.parent_permlink;
	  },
	  buildLink(){
		return '/'+this.report.author+'/'+this.report.permlink;
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
	  // get username from url
      username () {
	    if (this.$route.params.username.startsWith('@')){
		  return this.$route.params.username.substring(1, this.$route.params.username.length);
		}
        return this.$route.params.username
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
		//console.log(this.report.body);
		return this.$cleanBody(this.report.body);
      },
	  getVoteCount(){
		return Array.isArray(this.report.active_votes) ? this.report.active_votes.length : 0;
	  },
	  formattedReportUrl () {
		return "https://actifit.io/@"+this.report.author + '/' + this.report.permlink; //+ this.report.url;
	  },
	  meta() {
        return JSON.parse(this.report.json_metadata)
      },
	  postPayout() {
		if (this.postPaid()){
			return '';
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
		//console.log(this.post);
		if (this.report.is_paidout){
			//works for comments
			return true;
		}
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
	  
	  async processTrxFunc(op_name, cstm_params){
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
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+encodeURIComponent(op_json)+'&bchain='+this.cur_bchain);
			
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
	  commentSuccess (err, finalize, bchain) {
		
		this.$notify({
		  group: err ? 'error' : 'success',
		  text: err ? this.$t('Comment_Error') : this.$t('Comment_Success'),
		  position: 'top center'
		})
		
		if (finalize){
			// stop loading animation and show notification
			this.loading = false
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
	  },
	  /* function handles sending out the comment to the blockchain */
	  async postResponse(event) {
		// proceed with saving the comment
		
		this.loading = true
		
		//build the permlink
		let comment_perm = this.user.account.name.replace('.','-') + '-re-' + this.report.author.replace('.','-') + '-' + this.report.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
		
		//prepare meta data
		let meta = new Object();
		meta.tags = ['hive-193552', 'actifit'];
		meta.app = 'actifit/0.4.1';
		meta.suppEdit = 'actifit.io.comment';
		this.replyBody = this.$refs.editor.content;
		
		//if (!this.stdLogin){
		if (!localStorage.getItem('std_login')){
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
			  "title": "",
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
	  /* function handles rewarding user for comments */
	  async rewardUserComment () {
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
		if (this.report && this.report.author){
		  this.fetchReportKeyData()
		  this.fetchReportCommentData()
		}
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
		
		if (this.cur_bchain == 'STEEM'){
			console.log('grab SE token payout');
			//grab post S-E token pay
			fetch(scot_steemengine_api+'@'+this.report.author+'/'+this.report.permlink ).then(
				res => {res.json().then(json => this.setReportTokenRewards (json) ).catch(e => reject(e))
			}).catch(e => reject(e))
		}else{
			console.log('grab HE token payout');
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
	  async fetchUserData () {
		if (typeof this.user != 'undefined' && this.user != null){
		  this.$store.dispatch('fetchUserTokens')
		  this.$store.dispatch('fetchUserRank')
		  this.$store.dispatch('fetchUserReportCount')
		  this.$store.dispatch('fetchReferrals')
		}
	  },
	  async updatePostData () {
		  // try to fetch matching report
		  //set proper chain
		  let chainLnk = hive;
		  
		  if (this.cur_bchain == 'HIVE'){
			await chainLnk.api.setOptions({ url: process.env.hiveApiNode });
		  }else if (this.cur_bchain == 'STEEM'){
			chainLnk = steem;
			await chainLnk.api.setOptions({ url: process.env.steemApiNode });
		  }else if (this.cur_bchain == 'BLURT'){
			chainLnk = blurt;
			await chainLnk.api.setOptions({ url: process.env.blurtApiNode });
		  }
		 
		  chainLnk.api.getContent(this.postAuthor, this.postPermLink, (err, result) => {
			this.report = result;
			if (this.report && this.report.author){
				this.fetchReportKeyData();
			}else{
				this.errorDisplay = this.$t('error_post_not_found');
			}

		  })
	  },
	  async setReportTokenRewards (result) {
		this.tokenRewards = result;
		this.report.specTokenRewards = this.tokenRewards;
		//console.log(result);
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
	},
	async mounted () {
	
		this.$store.dispatch('steemconnect/login');
		
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		this.$store.commit('setBchain', this.cur_bchain);
		
		this.fetchUserData();
		
		// try to fetch report data
	    if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined') && (typeof this.$route.params.permlink !== 'undefined') ) {
		  this.postAuthor = this.$route.params.username
		  this.postPermLink = this.$route.params.permlink
		  if (this.$route.params.username.startsWith('@')){
			this.postAuthor = this.$route.params.username.substring(1, this.$route.params.username.length);
		  }
		  this.updatePostData();
		}
		
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
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
	  color: white;
	}
	.modal-body{
	  word-break: break-word;
	}
	a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover{
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
	  padding-bottom: 40px;
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
