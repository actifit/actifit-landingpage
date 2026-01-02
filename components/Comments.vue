<template>
  <transition name="fade">
    <div class="comments mb-2" v-if="!commentDeleted && !commentMinimized">

      <div class="col-12 row" v-if="depth == 0">
        <div class="col-md-9"></div>
        <select v-model="currentSort" class="form-control col-md-2 sel-adj float-right">
          <option value="">-- {{ $t('Sort_By') }} --</option>
          <option :value="JSON.stringify({ value: 'author', direction: 'asc' })">{{ $t('Name') }}▲</option>
          <option :value="JSON.stringify({ value: 'author', direction: 'desc' })">{{ $t('Name') }}▼</option>
          <option :value="JSON.stringify({ value: 'payout', direction: 'asc' })">{{ $t('Payout') }}▲</option>
          <option :value="JSON.stringify({ value: 'payout', direction: 'desc' })">{{ $t('Payout') }}▼</option>
          <option :value="JSON.stringify({ value: 'children', direction: 'asc' })">{{ $t('Replies') }}▲</option>
          <option :value="JSON.stringify({ value: 'children', direction: 'desc' })">{{ $t('Replies') }}▼</option>
          <option :value="JSON.stringify({ value: 'active_votes', direction: 'asc' })">{{ $t('Votes') }}▲</option>
          <option :value="JSON.stringify({ value: 'active_votes', direction: 'desc' })">{{ $t('Votes') }}▼</option>
          <option :value="JSON.stringify({ value: 'created', direction: 'asc' })">{{ $t('Date') }}▲</option>
          <option :value="JSON.stringify({ value: 'created', direction: 'desc' })">{{ $t('Date') }}▼</option>
        </select>

        <span class="p-2 col-md-1"><i class="fa-solid fa-circle-minus text-brand"
            v-on:click="commentMinimized = !commentMinimized" :title="$t('hide_comment')"
            style="cursor: pointer"></i></span>
      </div>
      <div v-else class="col-12 text-right">
        <i class="fa-solid fa-circle-minus text-brand" v-on:click="commentMinimized = !commentMinimized"
          :title="$t('hide_comment')" style="cursor: pointer"></i>
      </div>
      <div class="modal-body comment-info acti-shadow mb-2" v-if="depth > 0">
        <div class="main-user-info pt-2">
          <div class="comment-user-section" :style="{ paddingLeft: depth * indentFactor + 'px' }">
            <UserHoverCard :username="author" />
          </div>
          <div class="comment-user-section pt-2" :style="{ paddingLeft: depth * indentFactor + 'px' }">
            <a :title="$t('comment_link')" class="p-1" :href="buildLink" id="comment-link" ref="comment-link"><span
                class="date-head text-muted" :title="date">{{ $getTimeDifference(full_data.created) }}</span> <i
                class="fas fa-link"></i></a>
            <i :title="$t('copy_link')" class="fas fa-copy text-brand" v-on:click="copyContent"></i>

            <!-- ✅ CORE CHANGE: Translation icons are now driven by the new state -->
            <i v-if="translationLoading" class="fas fa-spinner fa-spin text-brand ml-2"
              :title="$t('translating_content', 'Translating...')"></i>
            <i v-else-if="!showTranslated" class="fa-solid fa-language text-brand ml-2" v-on:click="translateContent"
              :title="$t('translate_content', 'Translate Content')"></i>
          </div>
        </div>

        <!-- ✅ CORE CHANGE: Translation notice is now controlled by new state -->
        <div v-if="showTranslated" class="translation-notice" :style="{ marginLeft: depth * indentFactor + 'px' }">
          <span>{{ $t('auto_translated_content') }}</span>
          <a href="#" v-on:click.prevent="cancelTranslation">{{ $t('click_to_view_original') }}</a>
        </div>

        <!-- ✅ CORE CHANGE: Source is now a computed property that shows original or translated text -->
        <vue-remarkable class="modal-body pb-0" v-if="!editBoxOpen" :source="displayContent"
          :style="{ paddingLeft: depth * indentFactor + 'px' }"
          :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>

        <transition name="fade">
          <div class="comment-reply" v-if="editBoxOpen">
            <CustomTextEditor ref="editor" :initialContent="full_data.body"></CustomTextEditor>
            <div class="modal-footer m-2" style="display: none">
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
            <a href="#" @click.prevent="editResponse($event)" class="btn btn-brand border reply-btn w-25">{{ $t('Post')
            }}<i class="fas fa-spin fa-spinner" v-if="loading"></i></a>
            <a href="#" @click.prevent="editBoxOpen = !editBoxOpen" class="btn btn-brand border reply-btn w-25">{{
              $t('Cancel') }}</a>
            <a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25"
              v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                $t('Short_Signature') }}</a>
            <a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25"
              v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                $t('Full_Signature') }}</a>
          </div>
        </transition>
        <div class="main-payment-info col-12 p-2">
          <div :style="{ paddingLeft: (depth) * indentFactor + 'px' }">
            <div v-if="this.user && this.user.account.name == this.full_data.author">
              <span><a href="#" @click.prevent="editBoxOpen = !editBoxOpen" :title="$t('Edit_note')"><i
                    class="fas fa-edit text-white"></i></a></span>
              <span v-if="commentDeletable()"><a href="#" @click.prevent="deleteComment" :title="$t('Delete_note')"><i
                    class="fas fa-trash-alt text-white"></i><i class="fas fa-spin fa-spinner" v-if="deleting"></i></a>
              </span>
            </div>
            <div>
              <span v-if="this.user"><a href="#" @click.prevent="toggleCommentBox()" :title="$t('Reply')"><i
                    class="fas fa-reply text-white"></i></a></span>
              <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand"
                data-target="#voteModal" v-if="this.user && userVotedThisPost() == true">
                <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
              </a>
              <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal"
                class="actifit-link-plain" v-else>
                <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
              </a>
              <i class="far fa-comments ml-2"></i> {{ full_data.children }}
            </div>
            <div>
              <span v-if="postPaid()">
                <span :title="$t('author_payout')">
                  <i class="fa-solid fa-user"></i>
                  {{ paidValue() }}
                </span>
                <span class="m-1" :title="$t('voters_payout')">
                  <i class="fa-solid fa-users"></i>
                  {{ full_data.curator_payout_value }}
                </span>
                <i class="fa-solid fa-check text-green text-bold"></i>
              </span>
              <span v-else>
                <span class="text-bold">{{ full_data.pending_payout_value.replace('SBD', '') }}</span>
                <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
              </span>
              <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()">
                <i class="fas fa-user-pen"><sup>{{ full_data.beneficiaries.length }}</sup></i>
              </span>
            </div>
          </div>
        </div>
        <transition name="fade">
          <div class="comment-reply" v-if="commentBoxOpen">
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
        <div class="comment-reply" v-if="responsePosted">
          <UserHoverCard :username="user.name" />
          <vue-remarkable class="modal-body" :source="getContent"
            :style="{ paddingLeft: (depth + 1) * indentFactor + 'px' }"></vue-remarkable>
        </div>
      </div>
      <!-- ✅ CORE CHANGE: Pass down the cache and listen for updates from child comments -->
      <Comments v-for="comment in sorted_reply_entries" :key="comment.id" :reply_entries="comment.reply_entries"
        :author="comment.author" :body="comment.body" :full_data="comment" :main_post_author="main_post_author"
        :main_post_permlink="main_post_permlink" :main_post_cat="main_post_cat" :depth="depth + 1"
        :translation-cache="translationCache" @update-translation-cache="bubbleCacheUpdate">
      </Comments>
    </div>
    <div class="comments mb-2" v-else-if="!commentDeleted && commentMinimized">
      <div class="col-12 d-flex justify-content-between align-items-center" :style="{ paddingLeft: depth * indentFactor + 'px' }">
        <span v-if="hiddenDueToLowRep" class="text-secondary small">
          <i class="fas fa-eye-slash mr-1"></i>
          {{ $t('hidden_low_reputation') }}
        </span>
        <span v-else></span>
        <i class="fa-solid fa-circle-plus text-brand" v-on:click="commentMinimized = !commentMinimized"
          :title="$t('show_comment')" style="cursor: pointer"></i>
      </div>
    </div>
  </transition>
</template>
<script>
import UserHoverCard from './UserHoverCard.vue'
import { translateTextWithGemini } from '~/components/gemini-client.js';
import vueRemarkable from 'vue-remarkable';
import steem from 'steem'
import hive from '@hiveio/hive-js'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import sanitize from 'sanitize-html'
import CustomTextEditor from '~/components/CustomTextEditor'
import Lodash from 'lodash'

export default {
  props: ['author', 'reply_entries', 'depth', 'body', 'full_data', 'main_post_author', 'main_post_permlink', 'main_post_cat', 'translationCache'],
  name: 'Comments',
  data() {
    return {
      // Translation state
      showTranslated: false,
      translationLoading: false,
      translatedText: '',

      // Original state
      currentSort: JSON.stringify({ value: 'created', direction: 'desc' }),
      postUpvoted: false,
      commentDeleted: false,
      commentMinimized: false,
      hiddenDueToLowRep: false,
      authorReputation: null,
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
    // ✅ CORE FIX: Use an object watcher with an immediate handler.
    // This runs on component creation AND every time `full_data` changes,
    // replacing the need for separate logic in `mounted`.
    full_data: {
      handler: 'onFullDataChange',
      immediate: true
    },
    bchain: function (newBchain) {
      this.cur_bchain = newBchain;
      this.target_bchain = newBchain;
    }
  },
  components: {
    CustomTextEditor,
    vueRemarkable,
    UserHoverCard
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    ...mapGetters(['moderators']),
    ...mapGetters(['moderators', 'bchain']),

    commentId() {
      if (!this.full_data) return null;
      return `${this.full_data.author}/${this.full_data.permlink}`;
    },

    displayContent() {
      if (this.showTranslated && this.translatedText) {
        return this.translatedText;
      }
      return this.commentBody();
    },
    buildLink() {
      return '/@' + this.full_data.author + '/' + this.full_data.permlink;
    },
    getContent() {
      return this.responseBody;
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
    getVoteCount() {
      let totcnt = Array.isArray(this.full_data.active_votes) ? this.full_data.active_votes.length : 0;
      return totcnt;
    },
    postPayout() {
      if (this.postPaid()) {
        return '';
      } else {
        return this.full_data.pending_payout_value.replace('SBD', '').replace('STEEM', '').replace('HBD', '').replace('HIVE', '') + ' $'
      }
    },
    date() {
      let date = new Date(this.full_data.created)
      let minutes = date.getMinutes()
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    },
    displayCoreUserRank() {
      return (this.userRank ? parseFloat(this.userRank.rank_no_afitx).toFixed(2) : '');
    },
    displayIncreasedUserRank() {
      return '(+' + parseFloat(this.userRank.afitx_rank).toFixed(2) + ')';
    },
    sorted_reply_entries() {
      if (!this.reply_entries) {
        return [];
      }
      try {
        const sortApproach = JSON.parse(this.currentSort);
        if (sortApproach.value) {
          if (sortApproach.value === 'payout') {
            return Lodash.orderBy(this.reply_entries, (e) => {
              const val = parseFloat(e.pending_payout_value);
              return val > 0 ? val : parseFloat(e.total_payout_value);
            }, [sortApproach.direction]);
          }
          return Lodash.orderBy(this.reply_entries, [sortApproach.value], [sortApproach.direction]);
        }
      } catch (err) {
        console.error('Error parsing sort option:', err);
      }
      return this.reply_entries;
    },
  },
  methods: {
    // ✅ CORE FIX: This new handler function calls both initialization methods.
    onFullDataChange() {
      if (this.full_data) {
        this.fetchReportData();
        this.initializeTranslationState();
      }
    },

    // ✅ CORE FIX: Restore the original `fetchReportData` method.
    fetchReportData() {
      fetch(process.env.actiAppUrl + 'getRank/' + this.author).then(res => {
        res.json().then(json => this.userRank = json)
      }).catch(e => console.error(e));
      this.$store.dispatch('fetchModerators')

      // Fetch Hive reputation for the comment author
      this.fetchAuthorReputation();
    },

    // Fetch author's Hive reputation and auto-hide if low
    async fetchAuthorReputation() {
      if (!this.author || this.depth === 0) return; // Skip for root level (not a comment)

      hive.api.setOptions({ url: process.env.hiveApiNode });
      const result = await hive.api.getAccountReputationsAsync(this.author, 1);

      if (result && result.length > 0) {
        const rawReputation = result[0].reputation;
        this.authorReputation = hive.formatter.reputation(rawReputation);

        // Auto-hide comments from users with reputation <= 10
        if (this.authorReputation <= 10) {
          this.commentMinimized = true;
          this.hiddenDueToLowRep = true;
        }
      }
    },

    // Translation Cache Methods
    initializeTranslationState() {
      if (!this.commentId || !this.translationCache) return;
      const cachedState = this.translationCache[this.commentId];
      this.translationLoading = false;

      if (cachedState) {
        this.translatedText = cachedState.translatedBody;
        this.showTranslated = cachedState.isShowingTranslation;
      } else {
        this.translatedText = '';
        this.showTranslated = false;
      }
    },
    async translateContent() {
      if (this.translatedText) {
        this.showTranslated = true;
        this.updateCache({ isShowingTranslation: true });
        return;
      }
      this.translationLoading = true;
      try {
        const originalContent = this.commentBody();
        const translationResult = await translateTextWithGemini(originalContent);
        this.translatedText = translationResult;
        this.showTranslated = true;
        this.updateCache({
          originalBody: originalContent,
          translatedBody: this.translatedText,
          isShowingTranslation: true,
        });
      } catch (error) {
        console.error('Translation error:', error);
        this.$notify({
          group: 'error',
          text: 'Translation service failed. Please try again later.',
          position: 'top center'
        });
      } finally {
        this.translationLoading = false;
      }
    },
    cancelTranslation() {
      this.showTranslated = false;
      this.updateCache({ isShowingTranslation: false });
    },
    updateCache(data) {
      if (!this.commentId) return;
      const existingData = this.translationCache[this.commentId] || {};
      const payload = {
        id: this.commentId,
        data: { ...existingData, ...data }
      };
      this.$emit('update-translation-cache', payload);
    },
    bubbleCacheUpdate(payload) {
      this.$emit('update-translation-cache', payload);
    },

    // All other original methods
    toggleCommentBox() {
      this.commentBoxOpen = !this.commentBoxOpen;
      localStorage.setItem('commentBoxOpen', this.commentBoxOpen);
    },
    copyContent(event) {
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
    commentBody() {
      if (!this.full_data || !this.full_data.body) return '';
      // Use the global clean function if available, otherwise fallback to basic sanitize
      return this.$cleanBody ? this.$cleanBody(this.full_data.body) : sanitize(this.full_data.body);
    },
    meta() {
      return JSON.parse(this.full_data.json_metadata)
    },
    fetchReportCommentData() {
      this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      this.target_bchain = this.cur_bchain;
      this.$store.commit('setBchain', this.cur_bchain);
      this.$store.dispatch('fetchReportComments', { author: this.main_post_author, category: this.main_post_cat, permlink: this.main_post_permlink })
      this.responsePosted = false;
      this.responseBody = this.moderatorSignature;
    },
    resetOpenComment() {
      this.replyBody = this.moderatorSignature;
      this.commentBoxOpen = false;
      localStorage.setItem('commentBoxOpen', this.commentBoxOpen);
    },
    async processTrxFunc(op_name, cstm_params, bchain_option) {
      if (!localStorage.getItem('std_login')) {
        let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
        if (res.result.ref_block_num) {
          console.log('success');
          return { success: true, trx: res.result };
        } else {
          return { success: false, trx: null };
        }
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        await window.hive_keychain.requestBroadcast(
          this.user.account.name,
          [[op_name, cstm_params]],
          'Active', (response) => {
            console.log(response);
            if (op_name == 'delete_comment') {
              this.deleteSuccess();
            }
          });
      } else if (localStorage.getItem('acti_login_method') == 'hiveauth') {
        return new Promise((resolve) => {
          const auth = {
            username: this.user.account.name,
            token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
            expire: localStorage.getItem('expires'),
            key: localStorage.getItem('key')
          }
          console.log(auth);
          this.$HAS.broadcast(auth, 'active', [[op_name, cstm_params]], (evt) => {
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
              if (response.cmd && response.cmd === 'sign_ack') {
                resolve({ success: true, trx: { id: response.data } })
                if (op_name == 'delete_comment') {
                  this.deleteSuccess();
                }
              } else if (response.cmd && response.cmd === 'sign_nack') {
                resolve({ success: false })
              }
            })
            .catch(err => {
              this.$notify({
                group: 'warn',
                clean: true
              })
              console.log(err);
              resolve({ success: false })
            })
        })
      } else {
        let operation = [
          [op_name, cstm_params]
        ];
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
        let res = await fetch(url, {
          headers: reqHeads
        });
        let outcome = await res.json();
        if (outcome.error) {
          console.log(outcome.error);
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
    deleteSuccess(err) {
      this.deleting = false
      this.$notify({
        group: err ? 'error' : 'success',
        text: err ? this.$t('Delete_Error') : this.$t('Delete_Success'),
        position: 'top center'
      })
      if (!err) {
        this.commentDeleted = true;
      }
      setTimeout(this.fetchReportCommentData, 10000);
    },
    async deleteComment() {
      var confirmPopup = confirm(this.$t('confirm_delete_comment'));
      if (!confirmPopup) {
        return;
      }
      this.deleting = true
      if (!localStorage.getItem('std_login')) {
        this.$steemconnect.deleteComment(
          this.full_data.author,
          this.full_data.permlink, (err) => {
            this.deleteSuccess(err);
          }
        )
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        let cstm_params = {
          "author": this.full_data.author,
          "permlink": this.full_data.permlink
        };
        let res = await this.processTrxFunc('delete_comment', cstm_params);
      } else {
        let cstm_params = {
          "author": this.full_data.author,
          "permlink": this.full_data.permlink
        };
        let res = await this.processTrxFunc('delete_comment', cstm_params);
        if (res.success) {
          this.deleteSuccess();
        }
      }
    },
    commentSuccess(err, finalize, bchain) {
      this.$notify({
        group: err ? 'error' : 'success',
        text: err ? this.$t('Comment_Error') : this.$t('Comment_Success_Chain').replace('_CHAIN_', bchain),
        position: 'top center'
      })

      if (finalize) {
        this.loading = false
        this.editBoxOpen = false;
        this.responsePosted = true;
        this.responseBody = this.replyBody;
        setTimeout(this.fetchReportCommentData, 10000);
        this.resetOpenComment();
      }
    },
    async postResponse(event) {
      if (!this.user) {
        this.errPosting = this.$t('Need_login');
        return;
      }
      this.loading = true
      let comment_perm = this.user.account.name.replace('.', '-') + '-re-' + this.full_data.author.replace('.', '-') + '-' + this.full_data.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
      let meta = [];
      meta.tags = ['hive-193552', 'actifit'];
      meta.app = 'actifit/0.5.0';
      meta.suppEdit = 'actifit.io.comment';
      this.replyBody = this.$refs.editor.content;
      if (!localStorage.getItem('std_login')) {
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
        window.hive_keychain.requestPost(
          this.user.account.name,
          "",
          this.replyBody,
          this.full_data.permlink,
          this.full_data.author,
          JSON.stringify(meta),
          comment_perm,
          JSON.stringify(comment_options), (response) => {
            if (response.success) {
              this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
            } else {
              this.commentSuccess(response.message, false, this.cur_bchain);
            }
          });
      } else {
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
        if (res.success) {
          this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
        } else {
          this.commentSuccess('error saving', false, this.cur_bchain);
        }
        let other_chain = this.cur_bchain == 'HIVE' ? 'STEEM' : 'HIVE';
        if (this.target_bchain == 'BOTH') {
          let res = await this.processTrxFunc('comment', cstm_params, other_chain);
          if (res.success) {
            this.commentSuccess(null, true, other_chain);
          } else {
            this.commentSuccess('error saving', false, other_chain);
          }
        }
      }
    },
    async editResponse(event) {
      this.loading = true
      let meta = JSON.parse(this.full_data.json_metadata);
      meta.tags = ['hive-193552', 'actifit'];
      meta.app = 'actifit/0.4.1';
      meta.suppEdit = 'actifit.io.comment';
      this.full_data.body = this.$refs.editor.content;
      if (!localStorage.getItem('std_login')) {
        this.$steemconnect.comment(
          this.full_data.parent_author,
          this.full_data.parent_permlink,
          this.full_data.author,
          this.full_data.permlink,
          this.full_data.title,
          this.full_data.body,
          meta,
          (err) => {
            this.loading = false
            this.$notify({
              group: err ? 'error' : 'success',
              text: err ? this.$t('Edit_Error') : this.$t('Edit_Success'),
              position: 'top center'
            })
            this.editBoxOpen = false;
            setTimeout(this.fetchReportCommentData, 10000);
          }
        )
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        let comment_options = {
          author: this.user.account.name,
          permlink: this.full_data.permlink,
          max_accepted_payout: '1000000.000 HBD',
          percent_hbd: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: []
        };
        window.hive_keychain.requestPost(
          this.user.account.name,
          this.full_data.title,
          this.full_data.body,
          this.full_data.parent_permlink,
          this.full_data.parent_author,
          JSON.stringify(meta),
          this.full_data.permlink,
          JSON.stringify(comment_options), (response) => {
            if (response.success) {
              this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
            } else {
              this.commentSuccess(response.message, false, this.cur_bchain);
            }
          });
      } else {
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
        if (res.success) {
          this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
        } else {
          this.commentSuccess('error saving', false, this.cur_bchain);
        }
        let other_chain = this.cur_bchain == 'HIVE' ? 'STEEM' : 'HIVE';
        if (this.target_bchain == 'BOTH') {
          let res = await this.processTrxFunc('comment', cstm_params, other_chain);
          if (res.success) {
            this.commentSuccess(null, true, other_chain);
          } else {
            this.commentSuccess('error saving', false, other_chain);
          }
        }
      }
    },
    userVotedThisPost() {
      let curUser = this.user.account.name;
      if (!curUser) {
        this.postUpvoted = false;
        return this.postUpvoted;
      }
      this.postUpvoted = this.full_data.active_votes.filter(voter => (voter.voter === curUser)).length > 0;
      return this.postUpvoted;
    },
    commentDeletable() {
      return (parseInt(this.full_data.children) == 0
        && this.user && this.user.account.name == this.full_data.author
        && parseInt(this.full_data.pending_payout_value.replace('SBD', '').replace('STEEM', '')) == 0
        && parseInt(this.full_data.total_payout_value.replace('SBD', '').replace('STEEM', '')) == 0
        && parseInt(this.full_data.curator_payout_value.replace('SBD', '').replace('STEEM', '')) == 0)
    },
    hasBeneficiaries() {
      return Array.isArray(this.full_data.beneficiaries) && this.full_data.beneficiaries.length > 0;
    },
    beneficiariesDisplay() {
      let output = 'Beneficiaries:\n';
      for (let i = 0; i < this.full_data.beneficiaries.length; i++) {
        output += this.full_data.beneficiaries[i].account + ': ' + this.full_data.beneficiaries[i].weight / 100 + '% \n';
      }
      return output;
    },
    paidValue() {
      if (this.full_data.total_payout_value) return this.full_data.total_payout_value
      if (this.full_data.author_payout_value) return this.full_data.author_payout_value
    },
    postPaid() {
      if (this.full_data.is_paidout) {
        return true;
      }
      let last_payout = new Date(this.full_data.last_payout);
      let cashout_time = new Date(this.full_data.cashout_time);
      if (last_payout.getTime() > cashout_time.getTime()) {
        return true;
      }
      return false;
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
      this.$store.commit('setPostToVote', this.full_data)
    },
  },
  // ✅ CORE FIX: The mounted hook is now simpler because the immediate watcher handles initialization.
  mounted() {
    this.profImgUrl = process.env.hiveImgUrl;
    this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    if (this.cur_bchain == 'STEEM') {
      this.profImgUrl = process.env.steemImgUrl;
    }
  }
}
</script>
<style>
/* ... existing styles ... */
.translation-notice {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.translation-notice a {
  color: red;
  text-decoration: none;
  margin-left: 5px;
}

.translation-notice a:hover {
  text-decoration: underline;
}

.ml-2 {
  margin-left: .5rem !important;
}

/* Ensure reply/save buttons inside inline comments are visible and not floated away */
.comment-reply .reply-btn {
  float: none;
  display: inline-block;
  margin-right: 8px;
}
</style>
