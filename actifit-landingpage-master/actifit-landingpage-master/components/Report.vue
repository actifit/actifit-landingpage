<template>
    <!-- single report item for activity pages -->
    <div >
      <div class="card report">
        <h6 class="mb-0 text-center report-title">
          <a :href="report.url" target="_blank">
            {{ truncateString(report.title) }}
            <i class="fas fa-external-link-alt"></i>
          </a>
          <span v-if="this.afitReward" :title="$t('Rewarded_report')" class="check-tooltip"><i class="fas fa-check p-2"></i></span>
        </h6>
        <div class="report-body">
          <div class="row pb-1">
            <div class="col-8">
              <a :href="'/'+report.author" target="_blank">
              
                <div class="user-avatar mr-1"
                     :style="'background-image: url('+profImgUrl+'/u/' + report.author + '/avatar)'"></div>
                <small class="d-inline-block align-top">@{{ report.author }}</small>
                <small class="text-brand numberCircle">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small>
              </a>
            </div>
            <div class="col-4 text-right">
              <small class="text-muted" :title="date">{{ $getTimeDifference(report.created) }}</small>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              
              <a href="#" class="text-brand" @click="report.rptId = rptId; $store.commit('setActiveReport', report)" data-toggle="modal"
                   data-target="#reportModal" :title="$t('read_more_small')" v-if="$postHasImage(meta)">
                  <img :src="$fetchPostImage(meta)" :alt="report.title" class="report-image">
              </a>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <a href="#" class="" @click="report.rptId = rptId;$store.commit('setActiveReport', report)" data-toggle="modal"
                   data-target="#reportModal" :title="$t('read_more_small')">
              <!--<a :href="'/'+report.author+'/'+report.permlink" target="_blank">-->
                  <div ref="report_body" id="report_body" style="display: none">
                      <!--{{ renderSnippet(report.body) }}-->
                      <vue-remarkable :source="renderSnippet(report.body)" :options="{'html': true, 'breaks': true, 'typographer': true, 'xhtmlOut': true}"></vue-remarkable>
                  </div>
                  <div>
                      <span id="report_body_render" v-html="fixedContent()"></span>
                      <i class="fas fa-external-link-alt"></i>
                  </div>
              </a>
            </div>
            
          </div>
          <div class="row details mt-2">
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
          </div>
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
                <i class="far fa-comments ml-2" :title="$t('comments')"></i> {{ report.children }}
                <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)" v-if="user && report.author != this.user.account.name" :title="$t('reblog')"></i>
            </div>
            <div class="col-6 text-right">
  
              <social-sharing :url="'https://actifit.io/@'+report.author+'/'+report.permlink"
                            :title="report.title"
                            :description="socialSharingDesc"
                            :quote="socialSharingQuote"
                            :hashtags="hashtags"
                            twitter-user="actifit_fitness"
                            inline-template>
                  <span class="share-links-actifit">
                    <network network="twitter">
                      <i class="fab fa-x-twitter text-brand" title="X (twitter)"></i>
                    </network>
                  </span>
              </social-sharing>
              <a href="#" class="text-brand pr-2" @click="report.rptId = rptId;$store.commit('setActiveReport', report)" data-toggle="modal"
               data-target="#dailyActivityChartModal" :title="$t('Activity_chart')">
                  <i class="fas fa-chart-line"></i>
              </a>
              <a href="#" class="text-brand" @click="$store.commit('setEditReport', report)" data-toggle="modal"
               data-target="#editReportModal" v-if="user && report.author === user.account.name" :title="$t('Edit_note')">
                  <i class="fas fa-edit p-2"></i>
              </a>
              <a href="#" class="text-brand" @click="report.rptId = rptId;$store.commit('setActiveReport', report)" data-toggle="modal"
               data-target="#reportModal" :title="$t('read_more_small')">
                  <i class="fas fa-book-open"></i>
              </a>
  
            </div>
          </div>
          <div class="row details mt-2">
              <div class="col-6 payoutCustomDisplay">
                  <img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain=='STEEM'">
                  <img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain=='HIVE'">
                  <!--{{ postPayout }}-->
                  <span v-if="postPaid()">
                      <!--<i class="fa-solid fa-wallet text-green"></i>-->
                      <span class="m-1" :title="$t('author_payout')">
                          <i class="fa-solid fa-user" ></i>
                          {{paidValue()}}
                      </span>
                      <span class="m-1" :title="$t('voters_payout')">
                          <i class="fa-solid fa-users" ></i>
                          {{report.curator_payout_value}}
                      </span>
                      <i class="fa-solid fa-check text-green text-bold"></i>
                  </span>
                  <span v-else>
                      <span class="text-brand text-bold">{{ report.pending_payout_value.replace('SBD','')}}</span>
                      <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
                  </span>
                  <span v-if="hasBeneficiaries()" 
                          :title="beneficiariesDisplay()" 
                          @click="toggleTooltip()"
                          @mouseenter="showTooltip()"
                          @mouseleave="hideTooltip()"
                          @touchstart="showTooltip()"
                          @touchend="hideTooltip()">
                      <i class="fas fa-user-pen"><sup>{{report.beneficiaries.length}}</sup></i>
                      <div class="custom-tooltip" v-if="isTooltipVisible">{{ beneficiariesDisplay() }}</div>
                  </span>
  
              </div>
              <div class="col-6 text-right">
                  
                  <img src="/img/actifit_logo.png" class="mr-1 currency-logo-small" :title="$t('afit_payout')">{{ afitReward }} {{ $t('AFIT_Token') }}
              
              </div>
          </div>
          <!-- adding section to display additional FULL Payout option -->
          <div class="row details mt-2 text-brand full-afit-txt" v-if="this.meta.full_afit_pay=='on'">
              <div class="col-8">
                  <i class="fas fa-star"></i>
                  <small>
                      {{ $t('Full_AFIT_Payout_Mode') }}
                  </small>
                  <i class="fas fa-star"></i>
              </div>
              <div class="col-4 text-right" v-if="!postPaid()">
                  <small>
                      {{ $t('Pending_Pay') }}
                  </small>
              </div>
              <div class="col-4 text-right" v-else>
                  <small>
                      {{ fullAFITReward }} {{ $t('AFIT_Token') }}
                  </small>
              </div>
          </div>
          <!-- adding section to display charity info if available -->
          <div class="row details mt-2 text-brand full-afit-txt" v-if="this.meta.charity">
              <div class="col-6">
                  <i class="fas fa-dove"></i>
                  <small>
                      {{ $t('Charity_Post') }}
                  </small>
                  <i class="fas fa-dove"></i>
              </div>
              <div class="col-6 text-right">
                  <small>
                      <a :href="this.meta.charity[0]" target="_blank">@{{this.meta.charity[0]}}</a>
                  </small>
              </div>
          </div>
          <div class="row details mt-2 text-brand full-afit-txt" v-if="isUserModerator">
            <div class="col-6 text-brand">
              <div v-if="appType == 'iOS'"><i class="fab fa-apple" ></i> iOS</div>
              <div v-else-if="appType == 'Android'"><i class="fab fa-android" ></i> Android</div>
              <div class="mt-2">App: {{ appVersion }}</div>
            </div>
            <div class="col-6" style="text-align: right">
              <span v-if="trackingDevice == 'Fitbit Tracking'">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Fitbit_logo.svg" width="60px" >
                <div class="mt-2">{{ trackingDevice }}</div>
              </span>
              <span v-else-if="trackingDevice == 'healthapp'">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Health_icon_iOS_12.png" width="60px" >
                <div class="mt-2">{{ $t('healthapp') }}</div>
              </span>
              <div v-else>{{ trackingDevice }}</div>
            </div>		 
            <div class="col-12 text-brand mt-2">UserID: {{ actUserID }}</div>		  
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
    
    import vueRemarkable from 'vue-remarkable';
    
    import sanitize from 'sanitize-html'
  
    export default {
      props: ['report', 'rptId'],
      computed: {
        ...mapGetters('steemconnect', ['user']),
        ...mapGetters(['postToVote']),
        ...mapGetters(['newlyVotedPosts']),
        ...mapGetters(['moderators']),
        date() {
          let date = new Date(this.report.created)
          let minutes = date.getMinutes()
          return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
        },
        steps() {
          return this.meta.step_count[0]
        },
        type() {
          return this.meta.activity_type.join(', ')
        },
        appType() {
          return this.meta.appType
        },
        appVersion() {
          return this.meta.app
        },
        actUserID() {
          if (Array.isArray(this.meta.actifitUserID) && this.meta.actifitUserID.length>0){
            return this.meta.actifitUserID[0]
          }
          return this.meta.actifitUserID
        },
        trackingDevice() {
          if (Array.isArray(this.meta.dataTrackingSource) && this.meta.dataTrackingSource.length>0){
            return this.meta.dataTrackingSource[0]
          }
          return this.meta.dataTrackingSource
        },
        meta() {
          try{
              return JSON.parse(this.report.json_metadata)
          }catch(err){
              console.log(err);
              return {};
          }
        },
        postPayout() {
          if (this.postPaid()){
              return this.report.total_payout_value.replace('SBD','').replace('STEEM','').replace('HBD','').replace('HIVE','')+' $'
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
        votedByUser() {
          return this.postUpvoted;
        },
        getVoteCount(){
          return Array.isArray(this.report.active_votes)?this.report.active_votes.length:0;
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
              fullAFITReward: '',
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
          vueRemarkable
      },
      watch: {
        postUpvoted: 'updatePostData',
      },
      methods: {
        /* function checks to see if post reached its payout period */
        postPaid() {
          //check if last_payout is after cashout_time which means post got paid
          let last_payout = new Date(this.report.last_payout);
          let cashout_time = new Date(this.report.cashout_time);
          if (last_payout.getTime() > cashout_time.getTime()){
              return true;
          }
          return false;
        },
        showTooltip() {
          this.isTooltipVisible = true;
        },
        hideTooltip() {
          this.isTooltipVisible = false;
        },
        toggleTooltip() {
          this.isTooltipVisible = !this.isTooltipVisible;
        },
        hasImage(){
          let metaData = this.meta;
          if (metaData.image){
              if (Array.isArray(metaData.image) && metaData.image.length > 0){
                  return true;
              }
          }
          return false;
        },
        fixedContent(){
          if (this.$refs["report_body"]){
              //console.log(this.$refs["report_body"].innerHTML);
              //remove html tags from text
              return this.$refs["report_body"].innerHTML.replace(/<[^>]+>/g, '');;
          }
          return "";
        },
        renderSnippet(content){
          //remove extra content
          let post_content = this.$cleanBody(content, true);//2nd param confirms to remove all tags
          post_content = this.truncateString(post_content, 150);
          return post_content;
        },
        /* function checks if post has beneficiaries */
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
        
        //function handles displaying cut off version of text to avoid lengthy titles
        truncateString(str) {
            if (str.length > 70) {
              return str.substring(0, 67) + "...";
            }
            return str;
        },
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
          if (!this.user){
            alert(this.$t('need_login_signup_notice_vote'));
            e.stopPropagation();
          }else{
            //proceed normally showing vote popup
            this.$store.commit('setPostToVote', this.report)
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
          // try to fetch matching report
            let chainLnk = await this.setProperNode ();
            chainLnk.api.getContent(this.report.author, this.report.permlink, (err, result) => {
              this.report.total_payout_value = result.total_payout_value;
              this.report.pending_payout_value = result.pending_payout_value;
            })
        }
      },
      async mounted () {
          steem.api.setOptions({ url: process.env.steemApiNode });
          hive.api.setOptions({ url: process.env.hiveApiNode });
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
          
          this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
          
          this.profImgUrl = process.env.hiveImgUrl;
          if (this.cur_bchain == 'STEEM'){
              this.profImgUrl = process.env.steemImgUrl;
          }
      },
      
    }
  </script>
  
  <style lang="sass">
    .report
      height: 100%
      h6
        background: #ff112d
        padding: 8px 10px
        a
          color: #fff
      .report-body
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
      .report-title{
          min-height: 60px;
      }
      .card{
          box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
      }
      .report-image{
          width: 100%;
          height: 150px;
          object-fit: cover;
      }
      .payoutCustomDisplay {
          line-height: 1.5;
      }
  </style>