<template>
  <div class="modal fade" id="postModal" ref="postModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="post">
        <div class="modal-header">
          <div class="col-12">
            <button type="button" class="btn btn-link float-left" @click="loadNextPost(-1)"><i
                class="fas fa-chevron-left"></i> Previous
              <span v-if="post.parent_author">Comment</span>
              <span v-else>Post</span>
            </button>
            <button type="button" class="btn btn-link float-right" @click="loadNextPost(1)">Next
              <span v-if="post.parent_author">Comment</span>
              <span v-else>Post</span>
              <i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <!-- if this is a comment, display link to higher level comment/post -->
        <div v-if="post.parent_author" class="modal-header">
          <div class="row col-12">

            <div class="text-right col-12">
              <i class="fas fa-reply text-brand"></i> {{ $t('viewing_comment_note') }}
              <UserHoverCard :username="post.parent_author" />
            </div>

          </div>
        </div>
        <div class="modal-header border-0 pb-0">
          <h2 class="modal-title" id="exampleModalLabel">{{ post.title }}</h2>
          <div class="text-right">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
        <div class="main-user-info pl-4">
          <div>
            <UserHoverCard :username="post.author" />

          </div>
          <span class="modal-top-actions">
            <span class="date-head" :title="date">{{ $getTimeDifference(post.created) }}</span>
            <a :href="'/@' + this.post.author + '/' + this.post.permlink"><i class="fas fa-link text-brand"></i></a>
            <i :title="$t('copy_link')" class="fas fa-copy text-brand" v-on:click="copyContent"></i>

            <!-- Translation Icons Updated -->
            <i v-if="translationLoading" class="fas fa-spinner fa-spin text-brand" :title="$t('translating_content', 'Translating...')"></i>
            <i v-else-if="!showTranslated" class="fa-solid fa-language text-brand" v-on:click="translateContent" :title="$t('translate_content', 'Translate Content')"></i>
          </span>
          <div class="p-1 modal-top-actions">
              <span><a href="#" @click.prevent="toggleCommentBox()" :title="$t('Reply')"><i
                    class="text-white fas fa-reply"></i></a></span>
              <span>
                <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand"
                  data-target="#voteModal" v-if="this.$parent.user && userVotedThisPost() == true">
                  <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                </a>
                <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal"
                  class="actifit-link-plain" v-else>
                  <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                </a>
                <i class="far fa-comments ml-2" @click.prevent="headToComments()"></i> {{ post.children }}
                <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, post)"
                  v-if="user && post.author != this.user.account.name" :title="$t('reblog')"></i>
              </span>
            </div>
          <div class="modal-header">
            <div class="post-tags p-1" v-html="$fetchReportTags(post)"></div>
          </div>
        </div>
        <div v-if="showTranslated" class="translation-notice">
          <span>{{ $t('auto_translated_content') }}</span>
          <a href="#" v-on:click.prevent="cancelTranslation">{{ $t('click_to_view_original') }}</a>
        </div>
        <vue-remarkable class="modal-body" :source="displayBody" ref="remarkableContent"
          :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>
        <div class="modal-body goog-ad-horiz-90">
          <adsbygoogle ad-slot="5716623705" />
        </div>
        <div class="main-payment-info modal-footer" id="modal-footer">
          <div class="col-md-6">
            <span><a href="#" @click.prevent="toggleCommentBox()" :title="$t('Reply')"><i
                  class="text-white fas fa-reply"></i></a></span>
            <span class="ml-2">

              <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand"
                data-target="#voteModal" v-if="this.$parent.user && userVotedThisPost() == true">
                <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
              </a>
              <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal"
                class="actifit-link-plain" v-else>
                <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
              </a>
              <i class="far fa-comments ml-2" @click.prevent="headToComments()"></i> {{ post.children }}
              <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, post)"
                v-if="user && post.author != this.user.account.name" :title="$t('reblog')"></i>
            </span>
            <div>
              <!--<small :title="afitReward +' ' + $t('AFIT_Token')">
					<img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}
				</small>-->
              <span :title="postPayout" class="p-0 m-0">
                <img src="/img/STEEM.png" class="currency-logo-small" v-if="cur_bchain == 'STEEM'">
                <img src="/img/HIVE.png" class="currency-logo-small" v-else-if="cur_bchain == 'HIVE'">
                <img src="/img/BLURT.png" class="currency-logo-small" v-else-if="cur_bchain == 'BLURT'">
                <!--{{ postPayout }}-->
              </span>

              <span v-if="postPaid()">
                <!--<i class="fa-solid fa-wallet text-green"></i>-->
                <span class="m-1" :title="$t('author_payout')">
                  <i class="fa-solid fa-user"></i>
                  {{ paidValue() }}
                </span>
                <span class="m-1" :title="$t('voters_payout')">
                  <i class="fa-solid fa-users"></i>
                  {{ post.curator_payout_value }}
                </span>
                <i class="fa-solid fa-check text-green text-bold"></i>
              </span>
              <span v-else>
                <span class="text-bold">{{ post.pending_payout_value }}</span>
                <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
              </span>
              <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()">
                <i class="fas fa-user-pen"><sup>{{ post.beneficiaries.length }}</sup></i>
              </span>

              <span @click.prevent="displayMorePayoutData = !displayMorePayoutData" class="text-brand pointer-cur-cls"
                :title="$t('more_token_rewards')">
                <i class="fas fa-chevron-circle-down" v-if="!displayMorePayoutData"></i>
                <i class="fas fa-chevron-circle-up" v-else></i>
              </span>
              <transition name="fade" v-if="displayMorePayoutData">
                <div class="m-2">
                  <small v-for="(token, index) in tokenRewards" :key="index" :title="displayTokenValue(token)">
                    {{ displayTokenValue(token) }} |
                  </small>
                </div>
              </transition>
            </div>
          </div>
          <div class="col-md-6">
            <social-sharing :url="formattedPostUrl" :title="post.title"
              description="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity "
              quote="Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity"
              :hashtags="hashtags" twitter-user="actifit_fitness" inline-template>
              <div class="share-links-actifit">
                <network network="facebook">
                  <i class="fab fa-facebook" title="facebook"></i>
                </network>
                <network network="twitter">
                  <i class="fab fa-x-twitter" title="X (twitter)"></i>
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
        <div class="modal-footer" v-if="this.meta.full_afit_pay == 'on'">
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
        <div class="modal-footer text-brand" v-if="this.meta.charity">
          <i class="fas fa-dove"></i>
          <small>
            {{ $t('Charity_Post') }}
          </small>
          <i class="fas fa-dove"></i>
          <small>
            <a :href="this.meta.charity[0]" target="_blank">@{{ this.meta.charity[0] }}</a>
          </small>
        </div>
        <transition name="fade">
          <div class="post-reply modal-body" v-if="commentBoxOpen">
            <CustomTextEditor ref="editor" :initialContent="replyBody"></CustomTextEditor>
            <div class="modal-footer m-2" style="display:none">
              <div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-if="cur_bchain == 'HIVE'">
                <input type="radio" id="hive" value="HIVE" v-model="target_bchain">
                <img src="/img/HIVE.png" style="max-height: 50px" v-on:click="target_bchain = 'HIVE'"
                  :class="adjustHiveClass">
                <label for="hive">HIVE ONLY</label>
              </div>
              <div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-else-if="cur_bchain == 'STEEM'">
                <input type="radio" id="steem" value="STEEM" v-model="target_bchain">
                <img src="/img/STEEM.png" style="max-height: 50px" v-on:click="target_bchain = 'STEEM'"
                  :class="adjustSteemClass">
                <label for="steem">STEEM ONLY</label>
              </div>
              <div class="bchain-option btn col-6 p-2 row text-left  mx-auto">
                <input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
                <img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px"
                  :class="adjustBothClass">
                <img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px"
                  :class="adjustBothClass">
                <label for="hive_steem">HIVE + STEEM</label>
              </div>
            </div>
            <a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">
              {{ $t('Post') }}
              <img src="/img/HIVE.png" style="max-height: 25px"
                v-if="target_bchain == 'HIVE' || target_bchain == 'BOTH'">
              <img src="/img/STEEM.png" style="max-height: 25px"
                v-if="target_bchain == 'STEEM' || target_bchain == 'BOTH'">
              <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            </a>
            <a href="#" @click.prevent="resetOpenComment()" class="btn btn-brand border reply-btn w-25">{{ $t('Cancel')
            }}</a>
            <a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25"
              v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                $t('Short_Signature') }}</a>
            <a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25"
              v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                $t('Full_Signature') }}</a>
            <div class="text-brand" v-html="errPosting"></div>
          </div>
        </transition>
        <div class="post-reply modal-body" v-if="responsePosted">
          <div class="comment-user-section">
            <UserHoverCard :username="user.name" />
          </div>
          <vue-remarkable class="modal-body" :source="body"
            :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>
        </div>
        <div class="post-comments modal-body" v-if="post.children > 0">
          <div v-if="showCommentsLoader" class="comments-loader">
            <span class="btn btn-brand mb-1">
              <i class="fas fa-spin fa-spinner"></i>
            </span>
          </div>
          <Comments v-if="commentsAvailable" :author="commentEntries.author" :body="commentEntries.body"
            :reply_entries.sync="commentEntries.reply_entries" :main_post_author="post.author"
            :main_post_permlink="post.permlink" :main_post_cat="post.category" :depth="0" :translation-cache="translationCache"
    @update-translation-cache="updateCommentCache" />
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
import Vue from 'vue'
import vueRemarkable from 'vue-remarkable';
import SocialSharing from 'vue-social-sharing';
import VueScrollTo from 'vue-scrollto'
import { translateTextWithGemini } from '~/components/gemini-client.js';

const scot_steemengine_api = process.env.steemEngineScot;
const scot_hive_api_param = process.env.hiveEngineScotParam;
const tokensOfInterest = ['SPORTS', 'PAL', 'APX'];

export default {
  data() {
    return {
      // ✅ CORE FIX: Initialize the translation cache object.
      translationCache: {},

      // All other state variables
      commentsLoading: true,
      displayBody: '',
      translatedText: '',
      safety_post_content: '',
      showTranslated: false,
      translationLoading: false,
      translationError: '',
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
    // This watcher correctly handles both initial load and navigation
    post: 'fetchPostData',

    bchain: function (newBchain) {
      this.cur_bchain = newBchain;
      this.target_bchain = newBchain;
    },
    'post.body':{
      handler(){
        this.$nextTick(() => {
              this.attachImageErrorHandlers();
          });
      }
    }
  },
  props: ['post'],
  components: {
    Comments,
    CustomTextEditor,
    SocialSharing,
    vueRemarkable,
    UserHoverCard
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    ...mapGetters(['newlyVotedPosts']),
    ...mapGetters(['commentEntries'], 'commentCountToday'),
    ...mapGetters(['moderators', 'bchain']),
    buildParentLink() {
      return '/' + this.post.parent_author + '/' + this.post.parent_permlink;
    },
    adjustHiveClass() {
      if (this.target_bchain != 'HIVE') {
        return 'option-opaque';
      }
      return '';
    },
    adjustSteemClass() {
      if (this.target_bchain != 'STEEM') {
        return 'option-opaque';
      }
      return '';
    },
    adjustBothClass() {
      if (this.target_bchain != 'BOTH') {
        return 'option-opaque';
      }
      return '';
    },
    date() {
      let date = new Date(this.post.created)
      let minutes = date.getMinutes()
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    },
    formattedPostUrl() {
      return "https://actifit.io/@" + this.post.author + '/' + this.post.permlink;
    },
    getVoteCount() {
      return Array.isArray(this.post.active_votes) ? this.post.active_votes.length : 0;
    },
    meta() {
      try {
        return (typeof this.post.json_metadata === "string")
          ? JSON.parse(this.post.json_metadata)
          : this.post.json_metadata;
      } catch (err) {
        console.log(err);
        return {}
      }
    },
    postPayout() {
      if (this.postPaid()) {
        return '';
      } else {
        return this.post.pending_payout_value.replace('SBD', '').replace('STEEM', '').replace('HBD', '').replace('HIVE', '') + ' $'
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
      return this.post.children > 0 && this.commentsLoading;
    }
  },
  methods: {
    // ✅ =================================================================
    // ✅ START OF CORRECTED METHODS - Caching logic is implemented here.
    // ✅ =================================================================

    fetchPostData() {
      if (!this.post) return; // Guard clause to prevent errors if post is null

      const postId = `${this.post.author}/${this.post.permlink}`;
      const cachedState = this.translationCache[postId];

      this.translationLoading = false; // Always reset the spinner on new post

      if (cachedState) {
        // CACHE HIT: We've seen this post before. Restore its state.
        this.safety_post_content = cachedState.originalBody;
        this.translatedText = cachedState.translatedBody;
        this.showTranslated = cachedState.isShowingTranslation;
        this.displayBody = this.showTranslated ? this.translatedText : this.safety_post_content;
      } else {
        // CACHE MISS: This is a new post. Initialize its state.
        this.safety_post_content = this.$cleanBody(this.post.body);
        this.translatedText = '';
        this.showTranslated = false;
        this.displayBody = this.safety_post_content;
      }

      // These functions fetch other non-translation data and should always run
      this.fetchPostKeyData();
      this.fetchPostCommentData();
    },
    updateCommentCache(payload) {
    // Using this.$set ensures Vue's reactivity system detects the new property.
    this.$set(this.translationCache, payload.id, payload.data);
},

    cancelTranslation() {
      const postId = `${this.post.author}/${this.post.permlink}`;

      // Revert the view to the original content
      this.displayBody = this.safety_post_content;
      this.showTranslated = false;

      // Update the cache to remember that the user wants to see the original.
      if (this.translationCache[postId]) {
        this.$set(this.translationCache[postId], 'isShowingTranslation', false);
      }
    },

    async translateContent() {
      const postId = `${this.post.author}/${this.post.permlink}`;

      // If we already have the translation (from cache), just show it.
      if (this.translatedText) {
        this.displayBody = this.translatedText;
        this.showTranslated = true;
        if (this.translationCache[postId]) {
          this.$set(this.translationCache[postId], 'isShowingTranslation', true);
        }
        return;
      }

      this.translationLoading = true;
      try {
        const translationResult = await translateTextWithGemini(this.safety_post_content);
        this.translatedText = translationResult;
        this.displayBody = this.translatedText;
        this.showTranslated = true;

        // Save the new translation and state to the cache.
        this.$set(this.translationCache, postId, {
          originalBody: this.safety_post_content,
          translatedBody: this.translatedText,
          isShowingTranslation: true,
        });
      } catch (error) {
        // On failure, revert to original content
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
    // ✅ =================================================================
    // ✅ END OF CORRECTED METHODS
    // ✅ =================================================================

    headToComments(){
      const container = this.$refs.postModal;
      VueScrollTo.scrollTo('#modal-footer', 1000, { easing: 'ease-in-out', offset: 0, container: container });
    },
    toggleCommentBox() {
      this.commentBoxOpen = !this.commentBoxOpen;
      localStorage.setItem('commentBoxOpen', this.commentBoxOpen);
    },
    copyContent(event) {
      navigator.clipboard.writeText('https://actifit.io/@' + this.post.author + '/' + this.post.permlink)
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
    loadNextPost(direction) {
      if (direction < 0) {
        this.$emit('prevPost');
      } else {
        this.$emit('nextPost');
      }
    },
    hasBeneficiaries() {
      return Array.isArray(this.post.beneficiaries) && this.post.beneficiaries.length > 0;
    },
    beneficiariesDisplay() {
      let output = 'Beneficiaries:\n';
      for (let i = 0; i < this.post.beneficiaries.length; i++) {
        output += this.post.beneficiaries[i].account + ': ' + this.post.beneficiaries[i].weight / 100 + '% \n';
      }
      return output;
    },
    paidValue() {
      if (this.post.total_payout_value) return this.post.total_payout_value
      if (this.post.author_payout_value) return this.post.author_payout_value
    },
    postPaid() {
      if (this.post.is_paidout) {
        return true;
      }
      let last_payout = new Date(this.post.last_payout);
      let cashout_time = new Date(this.post.cashout_time);
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
        setTimeout(this.fetchPostCommentData, 10000);
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
          })
            .then(response => {
              this.$notify({ group: 'warn', clean: true })
              if (response.cmd && response.cmd === 'sign_ack') {
                resolve({ success: true, trx: response.data });
              } else if (response.cmd && response.cmd === 'sign_nack') {
                resolve({ success: false })
              }
            })
            .catch(err => {
              this.$notify({ group: 'warn', clean: true })
              console.log(err);
              resolve({ success: false })
            })
        })
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
          this.$notify({ group: 'error', text: err_msg, position: 'top center' })
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
      let comment_perm = this.user.account.name.replace('.', '-') + '-re-' + this.post.author.replace('.', '-') + '-' + this.post.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
      let meta = {
        tags: ['hive-193552', 'actifit'],
        app: 'actifit/0.5.0',
        suppEdit: 'actifit.io.comment'
      };
      this.replyBody = this.$refs.editor.content;
      if (!localStorage.getItem('std_login')) {
        this.$steemconnect.comment(this.post.author, this.post.permlink, this.user.account.name, comment_perm, '', this.replyBody, meta, (err) => {
          this.commentSuccess(err, true, 'STEEM');
        });
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        let comment_options = {
          author: this.user.account.name,
          permlink: comment_perm,
          max_accepted_payout: '1000000.000 HBD',
          percent_hbd: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: []
        };
        window.hive_keychain.requestPost(this.user.account.name, "", this.replyBody, this.post.permlink, this.post.author, JSON.stringify(meta), comment_perm, JSON.stringify(comment_options), (response) => {
          if (response.success) {
            this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
          } else {
            this.commentSuccess(response.message, false, this.cur_bchain);
          }
        });
      } else {
        let cstm_params = {
          "author": this.user.account.name,
          "title": '',
          "body": this.replyBody,
          "parent_author": this.post.author,
          "parent_permlink": this.post.permlink,
          "permlink": comment_perm,
          "json_metadata": JSON.stringify(meta)
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
      let url = new URL(process.env.actiAppUrl + 'rewardActifitWebComment/' + this.user.account.name);
      let params = {
        web_comment_token: process.env.webCommentToken,
        url: this.post.url,
      }
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
      try {
        let res = await fetch(url);
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
      this.postUpvoted = this.post.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.post.post_id) !== -1;
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
      this.$store.commit('setPostToVote', this.post)
    },
    fetchPostCommentData() {
      this.commentsLoading = true;
      this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      this.target_bchain = this.cur_bchain;
      this.$store.commit('setBchain', this.cur_bchain);
      this.$store.dispatch('fetchPostComments', this.post).then(() => {
        this.commentsLoading = false;
      });
      this.responsePosted = false;
      this.responseBody = this.moderatorSignature;
    },
    fetchPostKeyData() {
      fetch(process.env.actiAppUrl + 'getPostReward?user=' + this.post.author + '&url=' + this.post.url).then(res => {
        res.json().then(json => this.afitReward = json.token_count)
      }).catch(e => reject(e))
      fetch(process.env.actiAppUrl + 'getRank/' + this.post.author).then(res => {
        res.json().then(json => this.userRank = json)
      }).catch(e => reject(e))
      fetch(process.env.actiAppUrl + 'getPostFullAFITPayReward?user=' + this.post.author + '&url=' + this.post.url).then(res => {
        res.json().then(json => this.fullAFITReward = json.token_count)
      }).catch(e => reject(e))
      this.$store.dispatch('fetchModerators')
      this.profImgUrl = process.env.hiveImgUrl;
      if (this.cur_bchain == 'STEEM') {
        this.profImgUrl = process.env.steemImgUrl;
        fetch(scot_steemengine_api + '@' + this.post.author + '/' + this.post.permlink).then(
          res => {
            res.json().then(json => this.setPostTokenRewards(json)).catch(e => reject(e))
          }).catch(e => reject(e))
      } else {
        fetch(scot_steemengine_api + '@' + this.post.author + '/' + this.post.permlink + scot_hive_api_param).then(
          res => {
            res.json().then(json => this.setPostTokenRewards(json)).catch(e => reject(e))
          }).catch(e => reject(e))
      }
      this.attachImageErrorHandlers();
    },
    displayTokenValue(token) {
      let val;
      if (parseFloat(token.total_payout_value) > 0) {
        val = parseFloat(token.total_payout_value) / Math.pow(10, token.precision);
        return this.numberFormat(val, token.precision) + ' ' + token.token;
      }
      if (isNaN(token.pending_token)) {
        return "";
      }
      if (parseFloat(token.pending_token) == 0) {
        return this.numberFormat(val, token.precision) + ' ' + token.token;
      }
      val = parseFloat(token.pending_token) / Math.pow(10, token.precision);
      return this.numberFormat(val, token.precision) + ' ' + token.token;
    },
    fixSubModal() {
      if ($('#postModal').hasClass('show')) {
        $('body').addClass('modal-open');
      }
    },
    async setPostTokenRewards(result) {
      this.tokenRewards = result;
      this.post.specTokenRewards = this.tokenRewards;
    },
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    handleKeyDown(event) {
      if (!$('#postModal').hasClass('show')) return;
      let commentBoxOpenTest = localStorage.getItem('commentBoxOpen') === 'true';
      if (!commentBoxOpenTest) {
        switch (event.key) {
          case 'ArrowLeft':
            this.loadNextPost(-1);
            break;
          case 'ArrowRight':
            this.loadNextPost(1);
            break;
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
              if (!img.id){
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
    console.log('destroy');
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  mounted() {
    // The post watcher will handle the initial data fetch, so no need for extra calls here.

    //associate scrolling with the modal
    VueScrollTo.scrollTo = VueScrollTo.scrollTo.bind(this);

    //fix modal overlay
    $('#voteModal').on("hidden.bs.modal", this.fixSubModal)
    //reset translation when modal closes
    $('#reportModal').on("hidden.bs.modal", this.cancelTranslation)

    this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');

    //capture key clicks
    window.addEventListener('keydown', this.handleKeyDown);
  }
}
</script>
<style>
.modal-dialog {
  transform: none !important;
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

.post-reply {
  padding-left: 40px;
}

.share-links-actifit {
  text-align: right;
}

.share-links-actifit span {
  padding: 5px;
  cursor: pointer;
}

.post-modal-prelim-info span {
  padding: 5px;
}

.pointer-cur-cls {
  cursor: pointer;
}

.translation-notice {
  background-color: #f8f9fa;
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

.comments-loader {
  text-align: center;
  padding: 20px;
}
</style>
