<template>
  <div class="modal fade" id="reportModal" ref="reportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="report">
        <div class="modal-header report-navigation">
          <div class="col-12">
            <button type="button" class="btn btn-link float-left" @click="loadNextReport(-1)"><i
                class="fas fa-chevron-left"></i> Previous Report</button>
            <button type="button" class="btn btn-link float-right" @click="loadNextReport(1)">Next Report <i
                class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="modal-header report-title-header">
          <h2 class="modal-title" id="exampleModalLabel">{{ report.title }}</h2><br />
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="main-user-info pl-4 report-user-section">
          <div class="modal-header">
            <div class="report-tags p-1" v-html="$fetchReportTags(report)"></div>
          </div>
        </div>
        <div v-if="showTranslated" class="translation-notice">
          <span>{{ $t('auto_translated_content') }}</span>
          <a href="#" @click.prevent="cancelTranslation">{{ $t('click_to_view_original') }}</a>
        </div>
        <SafeRemarkable class="modal-body" :source="displayBody" ref="remarkableContent"
          :options="{ 'html': true, 'breaks': true, 'typographer': true }"></SafeRemarkable>
        <div class="col-12 post-detail-footer" id="modal-footer">
          <div class="post-detail-footer__summary">
            <CardActions
              :cardData="report"
              :user="user"
              :voteCount="getVoteCount"
              :hasVoted="userVotedThisPost()"
              :showReply="true"
              @reply="toggleCommentBox"
              @vote-prompt="votePrompt($event)"
              @open-modal="headToComments"
              @reblog="$reblog(user, report)"
            />

            <div class="post-detail-footer__payout">
              <span class="post-detail-payout" :title="postPayout">
                <img src="/img/STEEM.png" class="currency-logo-small" v-if="cur_bchain == 'STEEM'" alt="">
                <img src="/img/HIVE.png" class="currency-logo-small" v-else-if="cur_bchain == 'HIVE'" alt="">
                <img src="/img/BLURT.png" class="currency-logo-small" v-else-if="cur_bchain == 'BLURT'" alt="">
                <span v-if="postPaid()">
                  <span :class="{ 'declined-payout': isDeclined }" :title="$t('author_payout')">
                    <i class="fa-solid fa-user"></i> {{ paidValue() }}
                  </span>
                  <span :class="{ 'declined-payout': isDeclined }" :title="$t('voters_payout')">
                    <i class="fa-solid fa-users"></i> {{ report.curator_payout_value }}
                  </span>
                  <i class="fa-solid fa-check post-detail-payout__paid"></i>
                </span>
                <span v-else>
                  <span :class="{ 'declined-payout': isDeclined }">{{ report.pending_payout_value.replace('SBD', '') }}</span>
                  <i class="fa-solid fa-hourglass-half post-detail-payout__wait" :title="$t('hive_payouts_wait')"></i>
                </span>
                <span v-if="hasBeneficiaries()" class="post-detail-payout__muted" :title="beneficiariesDisplay()">
                  <i class="fas fa-user-pen"><sup>{{ report.beneficiaries.length }}</sup></i>
                </span>
              </span>
              <button type="button" class="post-detail-payout-toggle"
                @click="displayMorePayoutData = !displayMorePayoutData" :title="$t('more_token_rewards')"
                :aria-expanded="displayMorePayoutData ? 'true' : 'false'">
                <i class="fas fa-chevron-circle-down" v-if="!displayMorePayoutData"></i>
                <i class="fas fa-chevron-circle-up" v-else></i>
              </button>
            </div>
          </div>

          <div class="post-detail-footer__tokens" v-if="displayMorePayoutData">
            <small v-for="(token, index) in tokenRewards" :key="index" :title="displayTokenValue(token)">
              {{ displayTokenValue(token) }} |
            </small>
          </div>

          <div class="post-detail-footer__sharing">
            <social-sharing :url="formattedReportUrl" :title="report.title" network-tag="a"
              description="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity "
              quote="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity"
              :hashtags="hashtags" twitter-user="actifit_fitness" inline-template>
              <div class="share-links-actifit">
                <network network="facebook"><i class="fab fa-facebook" title="facebook"></i></network>
                <network network="twitter"><i class="fab fa-x-twitter" title="X (twitter)"></i></network>
                <network network="telegram"><i class="fab fa-telegram" title="telegram"></i></network>
                <network network="whatsapp"><i class="fab fa-whatsapp" title="whatsapp"></i></network>
                <network network="linkedin"><i class="fab fa-linkedin" title="linkedin"></i></network>
                <network network="reddit"><i class="fab fa-reddit" title="reddit"></i></network>
                <network network="skype"><i class="fab fa-skype" title="skype"></i></network>
                <network network="sms"><i class="fas fa-comment" title="SMS"></i></network>
                <network network="email"><i class="fa fa-envelope" title="email"></i></network>
              </div>
            </social-sharing>
          </div>
        </div>
        <!-- adding section to display additional FULL Payout option -->
        <div class="modal-footer" v-if="this.meta.full_afit_pay == 'on'">
          <div class="text-brand">
            <i class="fas fa-star"></i><small>{{ $t('Full_AFIT_Payout_Mode') }}</small><i class="fas fa-star"></i>
          </div>
          <div class="text-brand" v-if="!postPaid()"><small>{{ $t('Pending_Pay') }}</small></div>
          <div class="text-brand" v-else><small>{{ fullAFITReward }} {{ $t('AFIT_Token') }}</small></div>
        </div>
        <!-- adding section to display charity info if available -->
        <div class="modal-footer text-brand" v-if="this.meta.charity">
          <i class="fas fa-dove"></i><small>{{ $t('Charity_Post') }}</small><i class="fas fa-dove"></i>
          <small><a :href="this.meta.charity[0]" target="_blank" rel="noopener noreferrer">@{{ this.meta.charity[0] }}</a></small>
        </div>
        <transition name="fade">
          <div class="report-reply modal-body" v-if="commentBoxOpen">
            <CustomTextEditor ref="editor" :initialContent="replyBody"></CustomTextEditor>
            <div class="modal-footer m-2" style="display:none">
              <div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-if="cur_bchain == 'HIVE'">
                <input type="radio" id="hive" value="HIVE" v-model="target_bchain"><img src="/img/HIVE.png" style="max-height: 50px" v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass" alt="Select Hive blockchain"><label for="hive">HIVE ONLY</label>
              </div>
              <div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-else-if="cur_bchain == 'STEEM'">
                <input type="radio" id="steem" value="STEEM" v-model="target_bchain"><img src="/img/STEEM.png" style="max-height: 50px" v-on:click="target_bchain = 'STEEM'" :class="adjustSteemClass" alt="Select Steem blockchain"><label for="steem">STEEM ONLY</label>
              </div>
              <div class="bchain-option btn col-6 p-2 row text-left  mx-auto">
                <input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain"><img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass" alt="Select multiple blockchains"><img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass" alt="Select multiple blockchains"><label for="hive_steem">HIVE + STEEM</label>
              </div>
            </div>
            <a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">
              {{ $t('Post') }}
              <img src="/img/HIVE.png" style="max-height: 25px"
                v-if="target_bchain == 'HIVE' || target_bchain == 'BOTH'" alt="">
              <img src="/img/STEEM.png" style="max-height: 25px"
                v-if="target_bchain == 'STEEM' || target_bchain == 'BOTH'" alt="">
              <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            </a>
            <a href="#" @click.prevent="resetOpenComment()" class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
            <a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25"
              v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{ $t('Short_Signature') }}</a>
            <a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25"
              v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{ $t('Full_Signature') }}</a>
            <div class="text-brand" v-html="errPosting"></div>
          </div>
        </transition>
        <div class="report-reply modal-body" v-if="responsePosted">
          <div class="comment-user-section">
            <UserHoverCard :username="user.name" />
          </div>
          <SafeRemarkable class="modal-body" :source="responseBody"
            :options="{ 'html': true, 'breaks': true, 'typographer': true }"></SafeRemarkable>
        </div>
        <div class="report-comments modal-body" v-if="report.children > 0">
          <div v-if="showCommentsLoader" class="pb-md-2 text-center">
            <i class="fas fa-spinner fa-spin text-brand"></i>
          </div>
          <Comments v-if="commentsAvailable"
            :author="commentEntries.author"
            :body="commentEntries.body"
            :reply_entries.sync="commentEntries.reply_entries"
            :main_post_author="report.author"
            :main_post_permlink="report.permlink"
            :main_post_cat="report.category"
            :depth="0"
            :translation-cache="translationCache"
            @update-translation-cache="updateCommentCache"
          />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import UserHoverCard from './UserHoverCard.vue'
import { mapGetters } from 'vuex'
import Comments from '~/components/Comments'
import CustomTextEditor from '~/components/CustomTextEditor'
import SafeRemarkable from '~/components/SafeRemarkable.vue'
import SocialSharing from 'vue-social-sharing';
import VueScrollTo from 'vue-scrollto'
import { translateTextWithGemini } from '~/components/gemini-client.js';
import { declinedPayoutMixin } from '~/plugins/commonCardMixin.js'
import CardActions from '~/components/CardActions.vue'

const scot_steemengine_api = process.env.steemEngineScot;
const scot_hive_api_param = process.env.hiveEngineScotParam;

export default {
  mixins: [declinedPayoutMixin],
  data() {
    return {
      translationCache: {},
      commentsLoading: true,
      displayBody: '',
      translatedText: '',
      safety_post_content: '',
      showTranslated: false,
      translationLoading: false,
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
      target_bchain: 'HIVE',
      errPosting: '',
      responseBody: '',
      displayMorePayoutData: false,
      cur_bchain: 'HIVE',
      profImgUrl: process.env.steemImgUrl,
      socialSharingTitle: process.env.socialSharingTitle,
      socialSharingDesc: process.env.socialSharingDesc,
      socialSharingQuote: process.env.socialSharingQuote,
      hashtags: process.env.socialSharingHashtags,
      imageError: new Set(),
    }
  },
  watch: {
    report: {
        handler: 'initializeReportState',
        immediate: true
    },
    bchain: function (newBchain) {
      this.cur_bchain = newBchain;
      this.target_bchain = newBchain;
    },
    'report.body': {
      handler() {
        this.$nextTick(() => { this.attachImageErrorHandlers(); });
      }
    }
  },
  props: ['report'],
  components: {
    Comments,
    CustomTextEditor,
    SocialSharing,
    SafeRemarkable,
    UserHoverCard,
    CardActions
  },
  computed: {
    cardData() { return this.report },
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    ...mapGetters(['commentEntries'], 'commentCountToday'),
    ...mapGetters(['moderators', 'bchain']),
    adjustHiveClass() {
      if (this.target_bchain != 'HIVE') { return 'option-opaque'; }
      return '';
    },
    adjustSteemClass() {
      if (this.target_bchain != 'STEEM') { return 'option-opaque'; }
      return '';
    },
    adjustBothClass() {
      if (this.target_bchain != 'BOTH') { return 'option-opaque'; }
      return '';
    },
    date() {
      let date = new Date(this.report.created)
      let minutes = date.getMinutes()
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    },
    formattedReportUrl() {
      return "https://actifit.io/@" + this.report.author + '/' + this.report.permlink;
    },
    getVoteCount() {
      return Array.isArray(this.report.active_votes) ? this.report.active_votes.length : 0;
    },
    meta() {
      return JSON.parse(this.report.json_metadata)
    },
    postPayout() {
      if (this.postPaid()) {
        return this.report.total_payout_value.replace('SBD', '').replace('STEEM', '').replace('HBD', '').replace('HIVE', '') + ' $'
      } else {
        return this.report.pending_payout_value.replace('SBD', '').replace('STEEM', '').replace('HBD', '').replace('HIVE', '') + ' $'
      }
    },
    displayCoreUserRank() {
      return (this.userRank ? parseFloat(this.userRank.rank_no_afitx).toFixed(2) : '');
    },
    displayIncreasedUserRank() {
      return '(+' + parseFloat(this.userRank.afitx_rank).toFixed(2) + ')';
    },
    commentsAvailable() {
      return this.commentEntries != null && !this.commentsLoading;
    },
    showCommentsLoader() {
      return this.report.children > 0 && this.commentsLoading;
    }
  },

  methods: {
    initializeReportState(newReport) {
      if (!newReport) return;
      const reportId = `${newReport.author}/${newReport.permlink}`;
      const cachedState = this.translationCache[reportId];
      this.translationLoading = false;

      if (cachedState) {
        this.safety_post_content = cachedState.originalBody;
        this.translatedText = cachedState.translatedBody;
        this.showTranslated = cachedState.isShowingTranslation;
        this.displayBody = this.showTranslated ? this.translatedText : this.safety_post_content;
      } else {
        this.safety_post_content = this.$cleanBody(newReport.body);
        this.translatedText = '';
        this.showTranslated = false;
        this.displayBody = this.safety_post_content;
      }
      this.fetchReportData();
    },
    fetchReportData() {
      this.fetchReportKeyData();
      this.fetchReportCommentData();
    },
    fetchReportCommentData() {
      this.commentsLoading = true;
      this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      this.target_bchain = this.cur_bchain;
      this.$store.commit('setBchain', this.cur_bchain);
      this.$store.dispatch('fetchReportComments', this.report).then(() => {
        this.commentsLoading = false;
      }).catch(()=>{this.commentsLoading = false;});
      this.responsePosted = false;
      this.responseBody = this.moderatorSignature;
    },
    fetchReportKeyData() {
      fetch(process.env.actiAppUrl + 'getPostReward?user=' + this.report.author + '&url=' + this.report.url).then(res => {
        res.json().then(json => this.afitReward = json.token_count)
      }).catch(e => console.error(e))
      fetch(process.env.actiAppUrl + 'getRank/' + this.report.author).then(res => {
        res.json().then(json => this.userRank = json)
      }).catch(e => console.error(e))
      fetch(process.env.actiAppUrl + 'getPostFullAFITPayReward?user=' + this.report.author + '&url=' + this.report.url).then(res => {
        res.json().then(json => this.fullAFITReward = json.token_count)
      }).catch(e => console.error(e))
      this.$store.dispatch('fetchModerators')
      this.profImgUrl = process.env.hiveImgUrl;
      if (this.cur_bchain == 'STEEM') {
        this.profImgUrl = process.env.steemImgUrl;
        fetch(scot_steemengine_api + '@' + this.report.author + '/' + this.report.permlink).then(
          res => {
            res.json().then(json => this.setReportTokenRewards(json)).catch(e => console.error(e))
          }).catch(e => console.error(e))
      } else {
        fetch(scot_steemengine_api + '@' + this.report.author + '/' + this.report.permlink + scot_hive_api_param).then(
          res => {
            res.json().then(json => this.setReportTokenRewards(json)).catch(e => console.error(e))
          }).catch(e => console.error(e))
      }
      this.attachImageErrorHandlers();
    },
    cancelTranslation() {
      const reportId = `${this.report.author}/${this.report.permlink}`;
      this.displayBody = this.safety_post_content;
      this.showTranslated = false;
      if (this.translationCache[reportId]) {
        this.$set(this.translationCache[reportId], 'isShowingTranslation', false);
      }
    },
    async translateContent() {
      const reportId = `${this.report.author}/${this.report.permlink}`;
      if (this.translatedText) {
        this.displayBody = this.translatedText;
        this.showTranslated = true;
        if (this.translationCache[reportId]) {
            this.$set(this.translationCache[reportId], 'isShowingTranslation', true);
        }
        return;
      }

      this.translationLoading = true;
      try {
        const translationResult = await translateTextWithGemini(this.safety_post_content);
        this.translatedText = translationResult;
        this.displayBody = this.translatedText;
        this.showTranslated = true;
        this.$set(this.translationCache, reportId, {
          originalBody: this.safety_post_content,
          translatedBody: this.translatedText,
          isShowingTranslation: true,
        });
      } catch (error) {
        this.displayBody = this.safety_post_content;
        this.showTranslated = false;
        console.error('Translation process failed:', error);
        this.$notify({
          group: 'error',
          text: 'Translation service failed. Please try again later.',
          position: 'top center'
        });
      } finally {
        this.translationLoading = false;
      }
    },
    updateCommentCache(payload) {
      this.$set(this.translationCache, payload.id, payload.data);
    },
    headToComments(){
      const container = this.$refs.reportModal;
      VueScrollTo.scrollTo('#modal-footer', 1000, { easing: 'ease-in-out', offset: 0, container: container });
    },
    toggleCommentBox() {
      this.commentBoxOpen = !this.commentBoxOpen;
      localStorage.setItem('commentBoxOpen', this.commentBoxOpen);
    },
    hasBeneficiaries() {
      return Array.isArray(this.report.beneficiaries) && this.report.beneficiaries.length > 0;
    },
    beneficiariesDisplay() {
      let output = 'Beneficiaries:\n';
      for (let i = 0; i < this.report.beneficiaries.length; i++) {
        output += this.report.beneficiaries[i].account + ': ' + this.report.beneficiaries[i].weight / 100 + '% \n';
      }
      return output;
    },
    paidValue() {
      if (this.report.total_payout_value) return this.report.total_payout_value
      if (this.report.author_payout_value) return this.report.author_payout_value
    },
    postPaid() {
      let last_payout = new Date(this.report.last_payout);
      let cashout_time = new Date(this.report.cashout_time);
      if (last_payout.getTime() > cashout_time.getTime()) {
        return true;
      }
      return false;
    },
    resetOpenComment() {
      this.replyBody = this.moderatorSignature;
      this.commentBoxOpen = false;
      localStorage.setItem('commentBoxOpen', this.commentBoxOpen);
    },
    commentSuccess(err, finalize, bchain) {
      this.loading = false
      this.$notify({
        group: err ? 'error' : 'success',
        text: err ? this.$t('Comment_Error') : this.$t('Comment_Success_Chain').replace('_CHAIN_', bchain),
        position: 'top center'
      })
      if (finalize) {
        this.responsePosted = true;
        this.responseBody = this.replyBody;
        setTimeout(this.fetchReportCommentData, 10000);
        if (this.responseBody.length >= 50) {
          if (isNaN(this.commentCountToday)) {
            this.commentCountToday = 0;
          }
          this.commentCountToday += 1;
        }
        this.$store.commit('setCommentCountToday', this.commentCountToday);
        if (this.commentCountToday >= 3) {
          this.rewardUserComment();
        }
      }
      this.resetOpenComment();
    },
    async processTrxFunc(op_name, cstm_params, bchain_option) {
      if (!localStorage.getItem('std_login')) {
        let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
        if (res.result.ref_block_num) {
          return { success: true, trx: res.result };
        } else {
          return { success: false, trx: null };
        }
      } else if (localStorage.getItem('acti_login_method') == 'hiveauth') {
        return new Promise((resolve) => {
          const auth = {
            username: this.user.account.name,
            token: localStorage.getItem('access_token'),
            expire: localStorage.getItem('expires'),
            key: localStorage.getItem('key')
          }
          let operation = [[op_name, cstm_params]];
          this.$HAS.broadcast(auth, 'posting', operation, (evt) => {
            let msg = this.$t('verify_hiveauth_app');
            this.$notify({
              group: 'warn',
              text: msg,
              duration: -1,
              position: 'top center'
            })
          }).then(response => {
            this.$notify({ group: 'warn', clean: true })
            if (response.cmd && response.cmd === 'sign_ack') {
              resolve({ success: true, trx: response.data })
            } else if (response.cmd && response.cmd === 'sign_nack') {
              resolve({ success: false })
            }
          }).catch(err => {
            this.$notify({ group: 'warn', clean: true })
            console.log(err);
            resolve({ success: false })
          })
        });
      } else {
        let operation = [[op_name, cstm_params]];
        let accToken = localStorage.getItem('access_token')
        let op_json = JSON.stringify(operation)
        let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
        if (bchain_option) {
          cur_bchain = bchain_option;
        }
        let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + this.user.account.name + '&operation=' + encodeURIComponent(op_json) + '&bchain=' + cur_bchain);
        let reqHeads = new Headers({
          'Content-Type': 'application/json',
          'x-acti-token': 'Bearer ' + accToken,
        });
        let res = await fetch(url, { headers: reqHeads });
        let outcome = await res.json();
        if (outcome.error) {
          let err_msg = outcome.trx.tx.error;
          if (err_msg.includes('missing') && err_msg.includes('authority') && this.cur_bchain == bchain_option) {
            localStorage.removeItem('access_token');
            this.error_msg = this.$t('session_expired_login_again');
            this.$store.dispatch('steemconnect/logout');
          }
          this.$notify({
            group: 'error',
            text: err_msg,
            position: 'top center'
          })
          return { success: false, trx: null };
        } else {
          return { success: true, trx: outcome.trx };
        }
      }
    },
    async postResponse(event) {
      if (!this.user) {
        this.errPosting = this.$t('Need_login');
        return;
      }
      this.loading = true
      let comment_perm = this.user.account.name.replace('.', '-') + '-re-' + this.report.author.replace('.', '-') + '-' + this.report.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
      let meta = {
        tags: ['hive-193552', 'actifit'],
        app: 'actifit/0.5.0',
        suppEdit: 'actifit.io.comment'
      };
      this.replyBody = this.$refs.editor.content;
      if (!localStorage.getItem('std_login')) {
        this.$steemconnect.comment(
          this.report.author, this.report.permlink, this.user.account.name, comment_perm, '', this.replyBody, meta,
          (err) => { this.commentSuccess(err, true, 'STEEM'); }
        )
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        let comment_options = {
          author: this.user.account.name, permlink: comment_perm, max_accepted_payout: '1000000.000 HBD',
          percent_hbd: 10000, allow_votes: true, allow_curation_rewards: true, extensions: []
        };
        window.hive_keychain.requestPost(
          this.user.account.name, "", this.replyBody, this.report.permlink, this.report.author, JSON.stringify(meta), comment_perm, JSON.stringify(comment_options),
          (response) => {
            if (response.success) {
              this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
            } else {
              this.commentSuccess(response.message, false, this.cur_bchain);
            }
          });
      } else {
        let cstm_params = {
          "author": this.user.account.name, "title": '', "body": this.replyBody, "parent_author": this.report.author,
          "parent_permlink": this.report.permlink, "permlink": comment_perm, "json_metadata": JSON.stringify(meta)
        };
        let res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain);
        if (res.success) {
          this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
        } else {
          this.commentSuccess('error saving', false, this.cur_bchain);
        }
        let other_chain = this.cur_bchain == 'HIVE' ? 'STEEM' : 'HIVE';
        if (this.target_bchain == 'BOTH') {
          this.loading = true;
          let res = await this.processTrxFunc('comment', cstm_params, other_chain);
          if (res.success) {
            this.commentSuccess(null, true, other_chain);
          } else {
            this.commentSuccess('error saving', false, other_chain);
          }
        }
      }
    },
    async rewardUserComment() {
      const url = new URL('/api/proxy/reward-comment', window.location.origin);
      let postUrl = this.report.url;
      if (!postUrl || !postUrl.startsWith('http')) {
        postUrl = 'https://actifit.io' + (postUrl || '');
      }
      const params = {
        user: this.user.account.name,
        url: postUrl,
      }
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
      try {
        let res = await fetch(url, { headers: { 'x-acti-token': localStorage.getItem('access_token') || '' } });
        let outcome = await res.json();
        if (outcome.rewarded) {
          this.$notify({
            group: 'success',
            text: this.$t('youve_been_rewarded') + outcome.amount + this.$t('reward_for_comment'),
            position: 'top center'
          })
        }
      } catch (err) {
        console.error(err);
      }
    },
    userVotedThisPost() {
      let curUser = this.user.account.name;
      this.postUpvoted = this.report.active_votes.filter(voter => (voter.voter === curUser)).length > 0;
      return this.postUpvoted;
    },
    insertModSignature() {
      if (this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
        this.moderatorSignature = process.env.shortModeratorSignature;
        this.replyBody += this.moderatorSignature;
      }
    },
    insertFullModSignature() {
      if (this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
        this.moderatorSignature = process.env.standardModeratorSignature;
        this.replyBody += this.moderatorSignature;
      }
    },
    votePrompt(e) {
      this.$store.commit('setPostToVote', this.report)
    },
    displayTokenValue(token) {
      let val;
      if (parseFloat(token.total_payout_value) > 0) {
        val = parseFloat(token.total_payout_value) / Math.pow(10, token.precision);
        return this.numberFormat(val, token.precision) + ' ' + token.token;
      }
      if (isNaN(token.pending_token)) { return ""; }
      if (parseFloat(token.pending_token) == 0) {
        return this.numberFormat(val, token.precision) + ' ' + token.token;
      }
      val = parseFloat(token.pending_token) / Math.pow(10, token.precision);
      return this.numberFormat(val, token.precision) + ' ' + token.token;
    },
    fixSubModal() {
      if ($('#reportModal').hasClass('show')) {
        $('body').addClass('modal-open');
      }
    },
    async setReportTokenRewards(result) {
      this.tokenRewards = result;
      this.report.specTokenRewards = this.tokenRewards;
    },
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    copyContent(event) {
      navigator.clipboard.writeText('https://actifit.io/@' + this.report.author + '/' + this.report.permlink)
        .then(() => {
          this.$notify({
            group: 'success', text: this.$t('copied_successfully'), position: 'top center'
          })
        })
        .catch((error) => {
          this.$notify({
            group: 'error', text: this.$t('error_copying'), position: 'top center'
          })
        });
    },
    loadNextReport(direction) {
      if (direction < 0) {
        this.$emit('prevReport');
      } else {
        this.$emit('nextReport');
      }
    },
    handleKeyDown(event) {
      if (!$('#reportModal').hasClass('show')) return;
      let commentBoxOpenTest = localStorage.getItem('commentBoxOpen') === 'true';
      if (!commentBoxOpenTest) {
        switch (event.key) {
          case 'ArrowLeft': this.loadNextReport(-1); break;
          case 'ArrowRight': this.loadNextReport(1); break;
        }
      }
    },
    attachImageErrorHandlers() {
      const vm = this;
      this.$nextTick(() => {
        const contentEl = vm.$refs.remarkableContent.$el;
        if (!contentEl) {
          console.warn('VueRemarkable component not found!');
          return;
        }
        const images = contentEl.querySelectorAll('img');
        images.forEach(img => {
          img.onerror = (event) => {
            if (!this.imageError.has(img.id)) {
              if (!img.id) {
                img.id = this.$uuidv4();
              }
              this.imageError.add(img.id);
              img.src = process.env.hiveStandardPostUrl + img.src;
              img.onerror = null;
            }
          };
        });
      });
    },
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  mounted() {
    VueScrollTo.scrollTo = VueScrollTo.scrollTo.bind(this);
    $('#voteModal').on("hidden.bs.modal", this.fixSubModal)
    $('#reportModal').on("hidden.bs.modal", this.cancelTranslation)
    this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    window.addEventListener('keydown', this.handleKeyDown);
  }
}
</script>

<style scoped>
.modal-dialog {
  transform: none !important;
}

.modal-content {
  transform: none !important;
}

#reportModal .report-navigation {
  padding-top: 10px;
  padding-bottom: 10px;
}

#reportModal .report-title-header {
  padding-top: 12px;
  padding-bottom: 12px;
}

#reportModal .report-title-header .modal-title {
  margin-bottom: 0;
}

#reportModal .report-user-section {
  padding-top: 14px;
}

#reportModal .modal-body img[src*="ACTIVITYDATE"] + .text-center,
#reportModal .modal-body img[src*="ACTIVITYCOUNT"] + .text-center,
#reportModal .modal-body img[src*="ACTIVITYTYPE"] + .text-center {
  height: 44px;
  margin: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color) !important;
  text-align: center;
}

#reportModal .modal-body img[src*="ACTIVITYCOUNT"] {
  margin-top: 10px;
}

#reportModal .modal-body img[src*="ACTIVITYDATE"] + .text-center *,
#reportModal .modal-body img[src*="ACTIVITYCOUNT"] + .text-center *,
#reportModal .modal-body img[src*="ACTIVITYTYPE"] + .text-center * {
  color: var(--text-color) !important;
}

#reportModal .modal-body img[src*="ACTIVITYTYPE"] + .text-center pre {
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-color) !important;
  text-align: center;
}

html:not(.dark-mode) #reportModal .modal-body img[src*="ACTIVITYCOUNT"] + .text-center,
html:not(.dark-mode) #reportModal .modal-body img[src*="ACTIVITYCOUNT"] + .text-center *,
html:not(.dark-mode) #reportModal .modal-body img[src*="ACTIVITYTYPE"] + .text-center,
html:not(.dark-mode) #reportModal .modal-body img[src*="ACTIVITYTYPE"] + .text-center * {
  color: #000 !important;
}

.modal-author {
  margin-left: 10px !important;
}

.actifit-link-plain {
  color: white;
}

.modal-body {
  word-break: break-word;
}

.modal-body a:hover,
.modal-header a:hover,
.text-brand:hover,
.actifit-link-plain:hover {
  text-decoration: none;
}

.markdown-editor .CodeMirror,
.markdown-editor .CodeMirror-scroll {
  min-height: 100px;
}

.reply-btn {
  float: right;
}

.date-head {
  padding-left: 2px;
}

.report-reply {
  padding-left: 40px;
}

#reportModal #modal-footer.post-detail-footer {
  --post-footer-brand: #FF112D;
  --post-footer-brand-dark: #D40E24;
  --post-footer-border: #E6E8EB;
  --post-footer-muted: #6B7280;
  --post-footer-muted-soft: #9AA0A6;
  --post-footer-green: #1E8E5A;
  margin-top: 12px;
  padding: 14px 15px 9px;
  border-top: 1px solid var(--post-footer-border);
  border-bottom: 1px solid var(--post-footer-border);
  background: transparent !important;
  color: var(--post-footer-muted) !important;
  font-size: 12.5px;
}

#reportModal #modal-footer .post-detail-footer__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px 20px;
}

#reportModal #modal-footer .post-detail-footer__actions,
#reportModal #modal-footer .post-detail-footer__payout,
#reportModal #modal-footer .post-detail-payout,
#reportModal #modal-footer .post-detail-payout > span {
  display: flex;
  align-items: center;
}

#reportModal #modal-footer .post-detail-footer__actions {
  gap: 16px;
  flex: 1 1 auto;
  min-width: 0;
}

#reportModal #modal-footer .post-detail-footer__payout {
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  flex: 0 0 auto;
  margin-left: auto;
}

#reportModal #modal-footer .post-detail-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--post-footer-muted);
  text-decoration: none;
  transition: color .15s ease;
}

#reportModal #modal-footer .post-detail-action:hover,
#reportModal #modal-footer .post-detail-action--active {
  color: var(--post-footer-brand);
}

#reportModal #modal-footer .post-detail-payout {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--post-footer-brand-dark);
  font-weight: 700;
}

#reportModal #modal-footer .post-detail-payout > span {
  gap: 8px;
}

#reportModal #modal-footer .post-detail-payout i:not(.post-detail-payout__paid),
#reportModal #modal-footer .post-detail-payout__wait,
#reportModal #modal-footer .post-detail-payout__muted {
  color: var(--post-footer-muted-soft);
}

#reportModal #modal-footer.post-detail-footer .post-detail-payout__paid {
  color: var(--post-footer-green);
}

#reportModal #modal-footer.post-detail-footer .post-detail-payout-toggle {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--post-footer-muted-soft);
  cursor: pointer;
}

#reportModal #modal-footer.post-detail-footer .post-detail-payout-toggle:hover {
  color: var(--post-footer-brand);
}

#reportModal #modal-footer.post-detail-footer .post-detail-payout-toggle:focus-visible {
  outline: 2px solid var(--post-footer-brand);
  outline-offset: 3px;
}

#reportModal #modal-footer.post-detail-footer .post-detail-footer__tokens {
  margin-top: 10px;
  color: var(--post-footer-muted);
  text-align: right;
}

#reportModal #modal-footer.post-detail-footer .post-detail-footer__sharing {
  flex: 0 0 100%;
  margin-top: 6px;
  text-align: right;
}

#reportModal #modal-footer.post-detail-footer .share-links-actifit {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  width: 100%;
  gap: 4px;
  text-align: right;
}

/* Ensure all interactive elements in share links have cursor pointer */
#reportModal #modal-footer.post-detail-footer .share-links-actifit span,
#reportModal #modal-footer.post-detail-footer .share-links-actifit network,
#reportModal #modal-footer.post-detail-footer .share-links-actifit i,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep a,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep button,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep [role="link"] {
  cursor: pointer !important;
}

/* Style the span and anchor links */
#reportModal #modal-footer.post-detail-footer .share-links-actifit span,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep a,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep button {
  padding: 2px 4px;
  color: var(--post-footer-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color .15s ease, background .15s ease;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
}

/* Hover states for all share link elements */
#reportModal #modal-footer.post-detail-footer .share-links-actifit span:hover,
#reportModal #modal-footer.post-detail-footer .share-links-actifit network:hover,
#reportModal #modal-footer.post-detail-footer .share-links-actifit i:hover,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep a:hover,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep button:hover,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep a:hover i,
#reportModal #modal-footer.post-detail-footer .share-links-actifit ::v-deep button:hover i {
  color: var(--post-footer-brand) !important;
}

.dark-mode #reportModal #modal-footer.post-detail-footer {
  --post-footer-brand: #FF5266;
  --post-footer-brand-dark: #FF7181;
  --post-footer-border: rgba(255, 255, 255, .14);
  --post-footer-muted: #ADB5BD;
  --post-footer-muted-soft: #8F969D;
  --post-footer-green: #62C995;
}

@media (max-width: 767px) {
  #reportModal #modal-footer.post-detail-footer .post-detail-footer__summary,
  #reportModal #modal-footer.post-detail-footer .post-detail-footer__payout {
    align-items: flex-start;
    flex-direction: column;
  }

  #reportModal #modal-footer.post-detail-footer .post-detail-footer__payout {
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
  }

  #reportModal #modal-footer.post-detail-footer .post-detail-payout {
    flex: 1 1 auto;
    justify-content: flex-start;
    text-align: left;
    margin-left: 0;
  }

  #reportModal #modal-footer.post-detail-footer .post-detail-footer__tokens,
  #reportModal #modal-footer.post-detail-footer .post-detail-footer__sharing,
  #reportModal #modal-footer.post-detail-footer .share-links-actifit {
    margin-left: auto;
    text-align: right;
  }
}

.pointer-cur-cls {
  cursor: pointer;
}

.translation-notice {
  background-color: #181d22;
  border: 1px solid #e9ecef;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.translation-notice a {
  color: #ff0000;
  text-decoration: none;
  margin-left: 5px;
}

.translation-notice a:hover {
  text-decoration: underline;
}
</style>
