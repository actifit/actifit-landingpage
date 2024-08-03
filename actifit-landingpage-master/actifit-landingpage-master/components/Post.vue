<template>
  <!-- single post item for activity pages -->
  <div >
    <div :class="{'card-pinned': isPostPinned, 'card post': isStandardPost}">
      <h6 class="mb-0 text-center post-title">
        <!--<a :href="post.url" target="_blank">-->
		<a :href="buildLink" target="_blank">
          {{ truncateString(post.title, 70) }}
		  <i class="fas fa-external-link-alt"></i>
		  
		  <span v-if="isPostPinned" :title="$t('pinned_post')">&nbsp;<i class="fas fa-thumbtack text-warning"></i></span>
        </a>
      </h6>
	  
      <div class="post-body">
		<div class="row">
		<!-- if this is a comment, display link to higher level comment/post -->
		  <div v-if="post.parent_author" class="text-right col-12">
			<small>
				<a :href="buildParentLink"><i class="fas fa-reply text-brand"></i>&nbsp;
					<div class="user-avatar ml-1 mr-1 float-right" :style="'background-image: url('+profImgUrl+'/u/' + post.parent_author + '/avatar)'"></div>
				  @{{ post.parent_author }}
				</a>
			</small>
		  </div>
		</div>
        <div class="row">
          <div class="col-8">
            <a :href="'/'+post.author" target="_blank">
			
              <div class="user-avatar mr-1"
                   :style="'background-image: url('+profImgUrl+'/u/' + post.author + '/avatar)'"></div>
              <small class="d-inline-block align-top">@{{ post.author }}</small>
			  <i class="far fa-share-square text-brand" v-if="post.author != this.displayUsername" :title="$t('reblogged')"></i>
			  <!--<small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small>-->
            </a>
          </div>
          <div class="col-4 text-right">
            <small class="text-muted d-block" :title="date">{{ $getTimeDifference(this.post.created) }}</small>
          </div>
        </div>
		<div class="row">
          <div class="col-12">
			<a href="#" class="text-brand" @click="post.pstId = pstId; $store.commit('setActivePost', post)" data-toggle="modal"
                 data-target="#postModal" :title="$t('read_more_small')" v-if="$postHasImage(meta)">
				<img :src="$fetchPostImage(meta)" :alt="post.title" class="post-image">
			</a>
		  </div>
		</div>
		<div class="row">
          <div class="col-12">
			<a href="#" class="" @click="post.pstId = pstId; $store.commit('setActivePost', post)" data-toggle="modal"
                 data-target="#postModal" :title="$t('read_more_small')">
            <!--<a :href="'/'+post.author+'/'+post.permlink" target="_blank">-->
				<!--<div ref="post_body" id="post_body" style="display: none">
					
					<vue-remarkable :source="renderSnippet(post.body)" :options="{'html': true, 'xhtmlOut': true}"></vue-remarkable>
				</div>-->
				<div>
					<!--<span id="post_body_render" v-html="fixedContent()"></span>-->
					<span id="post_body_render">{{renderSnippet(post.body)}}</span>
					<i class="fas fa-external-link-alt"></i>
				</div>
            </a>
          </div>
          
        </div>
        <!--<div class="row details mt-2">
          <div class="col-8">
            <small class="d-block">
              <b>{{ $t('Activity_Type') }}:</b>
            </small>
            <small class="d-block text-truncate" :title="type">
              {{ type }}
            </small>
          </div>
          <div class="col-4 text-right">
            <small>
              <b>{{ $t('Activity_Count') }}:</b><br>
              {{ steps }}
            </small>
          </div>
        </div>-->
        <div class="row details mt-2">
          <div class="col-6">
              <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand" 
                 data-target="#voteModal" v-if="user && userVotedThisPost()==true" :title="$t('votes')">
                <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
              </a>
			  <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal"
                 data-target="#voteModal" v-else :title="$t('votes')">
                <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
              </a>
              <i class="far fa-comments ml-2" :title="$t('comments')"></i> {{ post.children }}
			  <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, post)" v-if="user && post.author != this.user.account.name" :title="$t('reblog')"></i>
          </div>
          <div class="col-6 text-right">
				<social-sharing :url="'https://actifit.io/@'+post.author+'/'+post.permlink"
							  :title="post.title"
							  :description="socialSharingDesc"
							  :quote="socialSharingQuote"
							  :hashtags="hashtags"
							  twitter-user="actifit_fitness"
							  inline-template>
					<span class="share-links-actifit">
					  <network network="twitter">
						<i class="fab fa-twitter text-brand" title="twitter"></i>
					  </network>
					</span>
				</social-sharing>
              <!--<a href="#" class="text-brand pr-2" @click="post.pstId = pstId; $store.commit('setActivePost', post)" data-toggle="modal"
                 data-target="#dailyActivityChartModal" :title="$t('Activity_chart')">
                <i class="fas fa-chart-line"></i>
              </a>-->
			  <a href="#" class="text-brand" @click="$store.commit('setEditPost', post)" data-toggle="modal"
                 data-target="#editPostModal" v-if="user && post.author === user.account.name" :title="$t('Edit_note')">
                <i class="fas fa-edit"></i>
              </a>
              <a href="#" class="text-brand" @click="post.pstId = pstId; $store.commit('setActivePost', post)" data-toggle="modal"
                 data-target="#postModal" :title="$t('read_more_small')">
                <i class="fas fa-book-open"></i>
              </a>
          </div>
        </div>
		<div class="row details mt-2">
			<div class="col-12">
				
				<img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain=='STEEM'">
				<img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain=='HIVE'">
				<!--{{ postPayout }}-->
				<span v-if="postPaid()">
					<!--<i class="fa-solid fa-wallet text-green"></i>-->
					<span class="m-1" :title="$t('author_payout')">
						<i class="fa-solid fa-user" ></i>
						{{paidValue()}}
					</span>
					<span class="m-1"  :title="$t('voters_payout')">
						<i class="fa-solid fa-users"></i>
						{{post.curator_payout_value}}
					</span>
					<i class="fa-solid fa-check text-green text-bold"></i>
				</span>
				<span v-else>
					<span class="text-brand text-bold">{{ post.pending_payout_value.replace('SBD','')}}</span>
					<i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
				</span>
				<span v-if="hasBeneficiaries()" 
						:title="beneficiariesDisplay()" 
						@click="toggleTooltip()"
						@mouseenter="showTooltip()"
						@mouseleave="hideTooltip()"
						@touchstart="showTooltip()"
						@touchend="hideTooltip()">
					<i class="fas fa-user-pen"><sup>{{post.beneficiaries.length}}</sup></i>
					<div class="custom-tooltip" v-if="isTooltipVisible">{{ beneficiariesDisplay() }}</div>
				</span>
				

			
			</div>
			<div class="col-6 text-right" v-if="afitReward != ''">
				<small>
					<img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}
				</small>
			</div>
		</div>
		
		
		
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  
  import steem from 'steem'
  
  import hive from '@hiveio/hive-js'
  
  import SocialSharing from 'vue-social-sharing'
  
  //import vueRemarkable from 'vue-remarkable';

  import sanitize from 'sanitize-html'

  export default {
    props: ['post', 'displayUsername', 'pstId', 'explorePost'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['postToVote']),
	  ...mapGetters(['newlyVotedPosts']),
	  ...mapGetters(['moderators']),
	  buildParentLink(){
		return '/'+this.post.parent_author+'/'+this.post.parent_permlink;
	  },
	  buildLink(){
		return '/'+this.post.author+'/'+this.post.permlink;
	  },
	  isPostPinned (){
		let stats = this.post.stats
		//console.log(stats);
		return (stats?stats.is_pinned:false);
	  },
	  isStandardPost (){
		return !this.explorePost;
	  },
      date() {
        let date = new Date(this.post.created)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
	  appType() {
        return this.meta.appType
      },
	  appVersion() {
        return this.meta.app
      },
	  
      meta() {
		try{
			return JSON.parse(this.post.json_metadata)
		}catch(err){
			//console.log(err);
			//console.log('meta:')
			//console.log(this.post.json_metadata);
			return JSON.parse(JSON.stringify(this.post.json_metadata));
			//console.log(err);
			return {};
		}
      },
	  postPayout() {
		if (this.postPaid()){
			return '';
		}else{
			return this.post.pending_payout_value.replace('SBD','').replace('STEEM','').replace('HBD','').replace('HIVE','')+' $'
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
	  votedByUser() {
		return this.postUpvoted;
	  },
	  getVoteCount(){
		return Array.isArray(this.post.active_votes)?this.post.active_votes.length:0;
	  },
	  isUserModerator() {
		if (this.user && this.moderators.find( mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
		  return true;
		}
		return false;
	  }
	  	  
    }, 
	data: function(){
		return {
			afitReward: '',
			userRank: '',
			//fullAFITReward: '',
			postUpvoted: false,
			cur_bchain: 'HIVE',
			profImgUrl: process.env.hiveImgUrl,
			socialSharingTitle: process.env.socialSharingTitle,
			socialSharingDesc: process.env.socialSharingDesc,
			socialSharingQuote: process.env.socialSharingQuote,
			hashtags: process.env.socialSharingHashtags,
			isTooltipVisible: false,
		}
	},
	components: {
		SocialSharing,
		//vueRemarkable
	},
	watch: {
	  postUpvoted: 'updatePostData',
	},
	methods: {
	  showTooltip() {
		this.isTooltipVisible = true;
	  },
	  hideTooltip() {
	    this.isTooltipVisible = false;
	  },
	  toggleTooltip() {
        this.isTooltipVisible = !this.isTooltipVisible;
      },
	  fixedContent(){
		if (this.$refs["post_body"]){
			//console.log(this.$refs["post_body"].innerHTML);
			//remove html tags from text
			console.log('post_body'+this.$refs['post_body'].innerHTML);
			return this.$refs["post_body"].innerHTML.replace(/<[^>]+>/g, '');;
		}
		return "";
	  },
	  renderSnippet(content){
		let post_content = this.$cleanBody(content, true);//2nd param confirms to remove all tags
		post_content = this.truncateString(post_content, 150);
		return post_content.replace(/<[^>]+>/g, '');
	  },
	  /* function checks if post has beneficiaries */
	  hasBeneficiaries() {
		return Array.isArray(this.post.beneficiaries) && this.post.beneficiaries.length > 0;
	  },
	  beneficiariesDisplay(){
		let output = 'Beneficiaries:\n';
		for (let i=0;i<this.post.beneficiaries.length;i++){
			output += this.post.beneficiaries[i].account+ ': ' + this.post.beneficiaries[i].weight/100 + '% \n';
		}
		return output;
	  },
	  /* function returns author payout value */
	  paidValue() {
		if (this.post.total_payout_value ) return this.post.total_payout_value
		if (this.post.author_payout_value ) return this.post.author_payout_value
	  },
	  /* function checks to see if post reached its payout period */
	  postPaid() {
		//console.log(this.post);
		if (this.post.is_paidout){
			//works for comments
			return true;
		}
		//check if last_payout is after cashout_time which means post got paid
		let last_payout = new Date(this.post.last_payout);
		let cashout_time = new Date(this.post.cashout_time);
		if (last_payout.getTime() > cashout_time.getTime()){
			return true;
		}
		return false;
	  },
	  //function handles displaying cut off version of text to avoid lengthy titles
	  truncateString(str, ln) {
		  if (str.length > ln) {
			return str.substring(0, ln-3) + "...";
		  }
		  return str;
	  },
	  /* function checks if logged in user has upvoted current post */
	  userVotedThisPost() {
		let curUser = this.user.account.name;
		//check if the post contains in its original voters current user, or if it has been upvoted in current session
		this.postUpvoted = this.post.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.post.post_id)!==-1;
		return this.postUpvoted;
	  },
	  /* function handles confirming if the user had voted already to prevent issues */
	  votePrompt(e) {
		//if no user is logged in, prompt to login
		if (!this.user){
		  alert(this.$t('need_login_signup_notice_vote'));
		  e.stopPropagation();
		}else{
		  //proceed normally showing vote popup
		  this.$store.commit('setPostToVote', this.post)
		}
	  },
	  
	  newlyVotedPostsQuery() {
		//handles returning a list of recently manually upvoted on this current session
		return this.newlyVotedPosts.length;
	  },
	  setProperNode (){
		let properNode = hive;
		if (this.cur_bchain == 'STEEM'){
			properNode = steem;
		}
		return properNode;
	  },
	  async updatePostData () {
		// try to fetch matching post
		  let chainLnk = await this.setProperNode ();
		  chainLnk.api.getContent(this.post.author, this.post.permlink, (err, result) => {
			this.post.total_payout_value = result.total_payout_value;
			this.post.pending_payout_value = result.pending_payout_value;
		  })
	  }
	},
	async mounted () {
		steem.api.setOptions({ url: process.env.steemApiNode });
		hive.api.setOptions({ url: process.env.hiveApiNode });
		fetch(process.env.actiAppUrl+'getPostReward?user=' + this.post.author+'&url='+this.post.url).then(res => {
		//grab the post's reward to display it properly
			res.json().then(json => this.afitReward = json.token_count)}).catch(e => reject(e))
		
		//console.log('post details');
		//console.log(this.post);
		//return;
		
		//grab the author's rank
		fetch(process.env.actiAppUrl+'getRank/' + this.post.author).then(res => {
			res.json().then(json => this.userRank = json)}).catch(e => reject(e))
			
		//grab post full pay if full pay mode enabled
		//fetch(process.env.actiAppUrl+'getPostFullAFITPayReward?user=' + this.post.author+'&url='+this.post.url).then(res => {
			//res.json().then(json => this.fullAFITReward = json.token_count)}).catch(e => reject(e))
		
		//grab moderators' list
		this.$store.dispatch('fetchModerators')
		
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		
		this.profImgUrl = process.env.hiveImgUrl;
		if (this.cur_bchain == 'STEEM'){
			this.profImgUrl = process.env.steemImgUrl;
		}
	},
	
  }
</script>

<style lang="sass">
  .post
    height: 100%
    h6
      background: #ff112d
      padding: 8px 10px
      a
        color: #fff
    .post-body
      padding: 8px 10px
    a
      color: #333
      &:hover
        text-decoration: none
    .details
      line-height: 1rem
    .user-avatar
      width: 20px
      height: 20px
      background-position: center center
      background-size: cover
      border-radius: 50%
      float: left
      border: solid 1px #ddd
</style>
<style>
	.full-afit-txt{
	  font-style: italic;
	}
	.check-tooltip{
	  color: white;
	}
	.increased-rank{
		color: #76BB0E;
	}
	.post-title{
		min-height: 60px;
	}
	.card{
		box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
		overflow: hidden;
	}
	.card-pinned{
		box-shadow: 3px 3px 3px rgba(204, 204, 0, 0.4);
		overflow: hidden;
	}
	.post-image{
		width: 100%;
		height: 150px;
		object-fit: cover;
	}
	.post h6 a, #post_body_render{
		text-wrap: balance;
	}
	.post{
		vertical-align: top;
	}
</style>
