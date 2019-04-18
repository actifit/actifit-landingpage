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
	<div v-if="errorDisplay==''" class="container pt-5 mt-5 pb-5 col-md-9" >
        <div class="report-head mb-3 col-md-9">
          <h4>@{{ displayUser }}</h4>
		  <h5 class="text-brand" >
			<div class="user-avatar large-avatar mr-1 mb-5"
					   :style="'background-image: url(https://steemitimages.com/u/' + this.displayUser + '/avatar)'"></div>
			<a :href="report.author" target="_blank">@{{ displayUser }} <small class="text-brand numberCircle">{{ getUserRank }}</small></a></h5>
		  <div class="text-brand"><a class="nav-link" :href="'/activity/'+displayUser" >{{ rewardedPostCount }} {{ $t('Activity_Reports_Rewarded') }}</a></div>
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
			displayUser: '',
			errorDisplay: '',
			afitReward: 0,
			userRank: '',
			rewardedPostCount: 0,
			fullAFITReward: '',
			postUpvoted: false,
			replyBody: '',
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
	  /* function checks if logged in user has upvoted current report */
	  userVotedThisPost() {
		let curUser = this.user.account.name;
		//check if the post contains in its original voters current user, or if it has been upvoted in current session
		this.postUpvoted = this.report.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.report.post_id)!==-1;
		
		return this.postUpvoted;
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
	},
	async mounted () {
		// try to fetch report data
	    if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined') ) {
		  this.displayUser = this.$route.params.username
		  if (this.$route.params.username.startsWith('@')){
			this.displayUser = this.$route.params.username.substring(1, this.$route.params.username.length);
		  }
		  console.log(this.displayUser);
		  
		  //grab the author's rank
		  fetch(process.env.actiAppUrl+'getRank/' + this.displayUser).then(res => {
			res.json().then(json => this.userRank = json.user_rank)}).catch(e => reject(e))
		  
		  fetch(process.env.actiAppUrl+'userRewardedPostCount/' + this.displayUser).then(res => {
			res.json().then(json => this.rewardedPostCount = json.rewarded_post_count)}).catch(e => reject(e))
		}else{
		  this.errorDisplay = this.$t('user_not_found_error');
		}
		  	
	}
  }
</script>

<style>
	.large-avatar{
		width: 128px;
		height: 128px;
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
	.date-head{
	  padding-left: 2px;
	}
</style>