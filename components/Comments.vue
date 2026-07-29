<template>
  <transition name="fade">
    <div class="cmt-thread mb-2" v-if="!commentDeleted && !commentMinimized">

      <div class="cmt-toolbar" v-if="depth == 0">
        <select v-model="currentSort" class="cmt-sort">
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

      </div>

      <!-- Each opened reply thread is rendered inside its parent card below. -->
      <div class="cmt-card" v-if="depth > 0">

        <div class="cmt-card__header">
          <div class="cmt-card__author">
            <UserHoverCard :username="author" />
          </div>
          <div class="cmt-card__meta">
            <a :title="$t('comment_link')" class="cmt-meta-link" :href="buildLink" id="comment-link"
              ref="comment-link">
              <span class="cmt-date" :title="date">{{ $getTimeDifference(full_data.created) }}</span>
              <i class="fas fa-link"></i>
            </a>
            <i :title="$t('copy_link')" class="fas fa-copy cmt-meta-icon" v-on:click="copyContent"></i>

            <i v-if="translationLoading" class="fas fa-spinner fa-spin cmt-meta-icon"
              :title="$t('translating_content', 'Translating...')"></i>
            <i v-else-if="!showTranslated" class="fa-solid fa-language cmt-meta-icon" v-on:click="translateContent"
              :title="$t('translate_content', 'Translate Content')"></i>
            <button v-if="depth === 1" type="button" class="cmt-icon-btn"
              :title="$t('hide_comment')" @click="commentMinimized = true">
              <i class="fa-solid fa-circle-minus"></i>
            </button>
          </div>
        </div>

        <div v-if="showTranslated" class="cmt-translation-notice">
          <span>{{ $t('auto_translated_content') }}</span>
          <a href="#" v-on:click.prevent="cancelTranslation">{{ $t('click_to_view_original') }}</a>
        </div>

        <SafeRemarkable class="cmt-body" v-if="!editBoxOpen" :source="displayContent"
          :options="{ 'html': true, 'breaks': true, 'typographer': true }"></SafeRemarkable>

        <transition name="fade">
          <div class="cmt-editor" v-if="editBoxOpen">
            <CustomTextEditor ref="editor" :initialContent="full_data.body"></CustomTextEditor>
            <div class="cmt-bchain-picker" style="display: none">
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
            <div class="cmt-editor-actions">
              <a href="#" @click.prevent="editResponse($event)" class="cmt-btn cmt-btn--primary">{{ $t('Post') }}<i
                  class="fas fa-spin fa-spinner" v-if="loading"></i></a>
              <a href="#" @click.prevent="editBoxOpen = !editBoxOpen" class="cmt-btn">{{ $t('Cancel') }}</a>
              <a href="#" @click.prevent="insertModSignature" class="cmt-btn"
                v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                  $t('Short_Signature') }}</a>
              <a href="#" @click.prevent="insertFullModSignature" class="cmt-btn"
                v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                  $t('Full_Signature') }}</a>
            </div>
          </div>
        </transition>

        <div class="cmt-footer">
          <div class="cmt-footer__actions">
            <a href="#" class="cmt-action" v-if="this.user && this.user.account.name == this.full_data.author"
              @click.prevent="editBoxOpen = !editBoxOpen" :title="$t('Edit_note')">
              <i class="fas fa-edit"></i>
            </a>
            <a href="#" class="cmt-action" v-if="this.user && this.user.account.name == this.full_data.author && commentDeletable()"
              @click.prevent="deleteComment" :title="$t('Delete_note')">
              <i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="deleting"></i>
            </a>
            <a href="#" class="cmt-action" v-if="this.user" @click.prevent="toggleCommentBox()" :title="$t('Reply')">
              <i class="fas fa-reply"></i>
            </a>
            <a href="#" class="cmt-action" :class="{ 'cmt-action--active': this.user && userVotedThisPost() == true }"
              @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal">
              <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
            </a>
            <button v-if="full_data.children > 0" type="button" class="cmt-action cmt-replies-toggle"
              :class="{ 'cmt-action--active': nestedRepliesOpen }"
              :aria-expanded="nestedRepliesOpen ? 'true' : 'false'" :title="$t('Replies')"
              @click="nestedRepliesOpen = !nestedRepliesOpen">
              <i class="far fa-comments"></i> {{ full_data.children }}
            </button>
            <span v-else class="cmt-action cmt-action--static">
              <i class="far fa-comments"></i> 0
            </span>
          </div>

          <div class="cmt-footer__payout">
            <span v-if="postPaid()" class="cmt-payout">
              <span class="cmt-payout__item" :title="$t('author_payout')">
                <i class="fa-solid fa-user"></i> {{ paidValue() }}
              </span>
              <span class="cmt-payout__item" :title="$t('voters_payout')">
                <i class="fa-solid fa-users"></i> {{ full_data.curator_payout_value }}
              </span>
              <i class="fa-solid fa-check cmt-payout__paid"></i>
            </span>
            <span v-else class="cmt-payout">
              <span class="cmt-payout__pending"
                :class="{ 'cmt-payout__pending--zero': parseFloat(full_data.pending_payout_value) <= 0, 'declined-payout': parseFloat(full_data.max_accepted_payout) === 0 }">
                {{ full_data.pending_payout_value.replace('SBD', '') }}
              </span>
              <i class="fa-solid fa-hourglass-half cmt-payout__wait" :title="$t('hive_payouts_wait')"></i>
            </span>
            <span v-if="hasBeneficiaries()" class="cmt-beneficiaries" :title="beneficiariesDisplay()">
              <i class="fas fa-user-pen"><sup>{{ full_data.beneficiaries.length }}</sup></i>
            </span>
          </div>
        </div>

        <transition name="fade">
          <div class="cmt-editor" v-if="commentBoxOpen">
            <CustomTextEditor ref="editor" :initialContent="replyBody"></CustomTextEditor>
            <div class="cmt-bchain-picker" style="display:none">
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
            <div class="cmt-editor-actions">
              <a href="#" @click.prevent="postResponse($event)" class="cmt-btn cmt-btn--primary">
                {{ $t('Post') }}
                <img src="/img/HIVE.png" style="max-height: 20px"
                  v-if="target_bchain == 'HIVE' || target_bchain == 'BOTH'" alt="">
                <img src="/img/STEEM.png" style="max-height: 20px"
                  v-if="target_bchain == 'STEEM' || target_bchain == 'BOTH'" alt="">
                <i class="fas fa-spin fa-spinner" v-if="loading"></i>
              </a>
              <a href="#" @click.prevent="resetOpenComment()" class="cmt-btn">{{ $t('Cancel') }}</a>
              <a href="#" @click.prevent="insertModSignature" class="cmt-btn"
                v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                  $t('Short_Signature') }}</a>
              <a href="#" @click.prevent="insertFullModSignature" class="cmt-btn"
                v-if="(this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator'))">{{
                  $t('Full_Signature') }}</a>
            </div>
            <div class="cmt-error" v-html="errPosting"></div>
          </div>
        </transition>

        <div class="cmt-posted-reply" v-if="responsePosted">
          <UserHoverCard :username="user.name" />
          <SafeRemarkable class="cmt-body" :source="getContent"></SafeRemarkable>
        </div>

        <div v-if="nestedRepliesOpen" class="cmt-nested-replies">
          <Comments v-for="comment in sorted_reply_entries" :key="comment.id" :reply_entries="comment.reply_entries"
            :author="comment.author" :body="comment.body" :full_data="comment" :main_post_author="main_post_author"
            :main_post_permlink="main_post_permlink" :main_post_cat="main_post_cat" :depth="depth + 1"
            :translation-cache="translationCache" @update-translation-cache="bubbleCacheUpdate">
          </Comments>
        </div>
      </div>

      <!-- ✅ Pass down the cache and listen for updates from child comments -->
      <template v-if="depth === 0">
        <Comments v-for="comment in sorted_reply_entries" :key="comment.id" :reply_entries="comment.reply_entries"
          :author="comment.author" :body="comment.body" :full_data="comment" :main_post_author="main_post_author"
          :main_post_permlink="main_post_permlink" :main_post_cat="main_post_cat" :depth="depth + 1"
          :translation-cache="translationCache" @update-translation-cache="bubbleCacheUpdate">
        </Comments>
      </template>
    </div>
    <div class="cmt-thread mb-2" v-else-if="!commentDeleted && commentMinimized">
      <div class="cmt-minimized">
        <span v-if="hiddenDueToLowRep" class="cmt-minimized__reason">
          <i class="fas fa-eye-slash"></i>
          {{ $t('hidden_low_reputation', [author]) }}
        </span>
        <span v-else class="cmt-minimized__author">@{{ author }}</span>
        <button type="button" class="cmt-icon-btn" :title="$t('show_comment')"
          @click="commentMinimized = false">
          <i class="fa-solid fa-circle-plus"></i>
        </button>
      </div>
    </div>
  </transition>
</template>
<script>
import UserHoverCard from './UserHoverCard.vue'
import { translateTextWithGemini } from '~/components/gemini-client.js';
import SafeRemarkable from '~/components/SafeRemarkable.vue';
import steem from 'steem'
import hive from '@hiveio/hive-js'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import DOMPurify from 'dompurify'
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
      // Show direct replies to main comments; keep deeper threads compact.
      nestedRepliesOpen: this.depth === 1,
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
      cur_bchain: 'HIVE',
      target_bchain: 'HIVE',
      profImgUrl: process.env.hiveImgUrl,
    }
  },
  watch: {
    // Runs on component creation AND every time `full_data` changes.
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
    SafeRemarkable,
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
    onFullDataChange() {
      if (this.full_data) {
        this.fetchReportData();
        this.initializeTranslationState();
      }
    },

    fetchReportData() {
      fetch(process.env.actiAppUrl + 'getRank/' + this.author).then(res => {
        res.json().then(json => this.userRank = json)
      }).catch(e => console.error(e));
      this.$store.dispatch('fetchModerators')
      this.fetchAuthorReputation();
    },

    async fetchAuthorReputation() {
      if (!this.author || this.depth === 0) return;

      try {
        hive.api.setOptions({ url: process.env.hiveApiNode });
        const result = await hive.api.getAccountReputationsAsync(this.author, 1);

        if (result && result.length > 0) {
          this.authorReputation = hive.formatter.reputation(result[0].reputation);

          if (this.authorReputation <= 10) {
            this.commentMinimized = true;
            this.hiddenDueToLowRep = true;
          }
        }
      } catch (error) {
        console.error('Error fetching comment author reputation:', error);
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
      if (this.$cleanBody) {
        return this.$cleanBody(this.full_data.body);
      }

      if (process.client) {
        return DOMPurify.sanitize(this.full_data.body);
      }

      // Server-side fallback: strip tags using regex
      return this.full_data.body.replace(/<[^>]*>?/gm, '');
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
          'Posting', (response) => {
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
/* ============================================================
   Actifit comments — neutral surface, brand color used only
   as a small accent (hover states, active vote, translate link).
   Brand red per main.sass: #FF112D
   ============================================================ */
.cmt-thread {
  --cmt-brand: #FF112D;
  --cmt-brand-dark: #D40E24;
  --cmt-brand-tint: #FFF0F1;
  --cmt-surface: #FFFFFF;
  --cmt-border: #E6E8EB;
  --cmt-text: #1F2328;
  --cmt-muted: #6B7280;
  --cmt-muted-soft: #9AA0A6;
  --cmt-hover-bg: #FAFAFB;
  --cmt-green: #1E8E5A;
  --cmt-surface-subtle: #F7F8F9;
  --cmt-border-hover: #D8DBE0;
  --cmt-thread-rail: #DDE1E6;
  --cmt-card-shadow: rgba(20, 20, 25, .05);
}

.dark-mode .cmt-thread {
  --cmt-brand: #FF5266;
  --cmt-brand-dark: #FF7181;
  --cmt-brand-tint: rgba(255, 82, 102, .16);
  --cmt-surface: var(--background-color);
  --cmt-border: rgba(255, 255, 255, .14);
  --cmt-text: var(--text-color);
  --cmt-muted: #ADB5BD;
  --cmt-muted-soft: #8F969D;
  --cmt-hover-bg: var(--background-color-1);
  --cmt-green: #62C995;
  --cmt-surface-subtle: var(--background-color-1);
  --cmt-border-hover: rgba(255, 255, 255, .24);
  --cmt-thread-rail: rgba(255, 255, 255, .22);
  --cmt-card-shadow: rgba(0, 0, 0, .28);
}

.cmt-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 0 10px;
}

.cmt-sort {
  margin-right: auto;
  max-width: 240px;
  border: 1px solid var(--cmt-border);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--cmt-text);
  background: var(--cmt-surface);
}

.cmt-sort:focus {
  outline: none;
  border-color: var(--cmt-brand);
  box-shadow: 0 0 0 3px var(--cmt-brand-tint);
}

.cmt-icon-btn {
  border: 0;
  padding: 4px;
  background: transparent;
  color: var(--cmt-muted-soft);
  line-height: 1;
  cursor: pointer;
  transition: color .15s ease;
}

.cmt-icon-btn:hover,
.cmt-icon-btn:focus-visible {
  color: var(--cmt-brand);
}

/* Card */
.cmt-card {
  background: var(--cmt-surface);
  border: 1px solid var(--cmt-border);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 12px;
  transition: border-color .15s ease, box-shadow .15s ease;
}

.cmt-card:hover {
  border-color: var(--cmt-border-hover);
  box-shadow: 0 2px 8px var(--cmt-card-shadow);
}

.cmt-nested-replies {
  margin-top: 14px;
  padding-top: 14px;
  padding-left: 24px;
  border-top: 1px solid var(--cmt-border);
  border-left: 2px solid var(--cmt-thread-rail);
}

.cmt-nested-replies > .cmt-thread:last-child {
  margin-bottom: 0 !important;
}

.cmt-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.cmt-card__author {
  min-width: 0;
}

.cmt-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--cmt-muted);
  flex: none;
}

.cmt-meta-link {
  color: var(--cmt-muted);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.cmt-meta-link:hover {
  color: var(--cmt-brand);
}

.cmt-date {
  color: inherit;
}

.cmt-meta-icon {
  color: var(--cmt-muted-soft);
  cursor: pointer;
  transition: color .15s ease;
}

.cmt-meta-icon:hover {
  color: var(--cmt-brand);
}

.cmt-translation-notice {
  background: var(--cmt-surface-subtle);
  border: 1px solid var(--cmt-border);
  color: var(--cmt-muted);
  font-size: 12.5px;
  padding: 8px 10px;
  border-radius: 6px;
  margin-top: 10px;
}

.cmt-translation-notice a {
  color: var(--cmt-brand);
  font-weight: 600;
  text-decoration: none;
  margin-left: 6px;
}

.cmt-translation-notice a:hover {
  text-decoration: underline;
}

.cmt-body {
  margin-top: 10px;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--cmt-text);
  padding: 0 !important; /* SafeRemarkable default padding overridden; spacing handled by .cmt-card */
}

.cmt-editor {
  margin-top: 12px;
}

.cmt-editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.cmt-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--cmt-border);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: var(--cmt-text);
  background: var(--cmt-surface);
  text-decoration: none;
  transition: border-color .15s ease, background .15s ease, color .15s ease;
}

.cmt-btn:hover {
  border-color: var(--cmt-brand);
  color: var(--cmt-brand-dark);
  text-decoration: none;
}

.cmt-btn--primary {
  background: var(--cmt-brand);
  border-color: var(--cmt-brand);
  color: #fff;
}

.cmt-btn--primary:hover {
  background: var(--cmt-brand-dark);
  border-color: var(--cmt-brand-dark);
  color: #fff;
}

.cmt-error {
  color: var(--cmt-brand);
  font-size: 12.5px;
  margin-top: 6px;
}

.cmt-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--cmt-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12.5px;
}

.cmt-footer__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cmt-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--cmt-muted);
  text-decoration: none;
  transition: color .15s ease;
}

.cmt-action:hover {
  color: var(--cmt-brand);
  text-decoration: none;
}

.cmt-action--active {
  color: var(--cmt-brand);
}

.cmt-action--static {
  cursor: default;
}

.cmt-replies-toggle {
  border: 0;
  padding: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.cmt-replies-toggle:focus-visible {
  outline: 2px solid var(--cmt-brand);
  outline-offset: 3px;
}

.cmt-footer__payout {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--cmt-muted);
}

.cmt-payout {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cmt-payout__item i {
  margin-right: 4px;
  color: var(--cmt-muted-soft);
}

.cmt-payout__item,
.cmt-payout__pending {
  font-weight: 700;
  color: var(--cmt-brand-dark);
}

.cmt-payout__pending--zero {
  color: var(--cmt-muted);
}

.cmt-payout__wait {
  color: var(--cmt-muted-soft);
}

.cmt-payout__paid {
  color: var(--cmt-green);
}

.cmt-beneficiaries {
  color: var(--cmt-muted-soft);
}

.cmt-posted-reply {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--cmt-border);
}

.cmt-minimized {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid var(--cmt-border);
  border-radius: 10px;
  background: var(--cmt-surface);
}

.cmt-minimized__author {
  color: var(--cmt-muted);
  font-size: 13px;
  font-weight: 600;
}

.cmt-minimized__reason {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--cmt-muted);
  font-size: 13px;
}

/* Rendered comment content */
.dark-mode .cmt-body a {
  color: var(--cmt-brand);
}

.dark-mode .cmt-body blockquote {
  color: var(--cmt-muted);
  border-left-color: var(--cmt-border);
}

.dark-mode .cmt-body hr,
.dark-mode .cmt-body th,
.dark-mode .cmt-body td {
  border-color: var(--cmt-border);
}

/* Inline reply/edit composer */
.dark-mode .cmt-editor .v-note-wrapper,
.dark-mode .cmt-editor .v-note-op,
.dark-mode .cmt-editor .v-note-panel,
.dark-mode .cmt-editor .v-note-edit,
.dark-mode .cmt-editor .v-show-content,
.dark-mode .cmt-editor textarea {
  background: var(--cmt-surface) !important;
  color: var(--cmt-text) !important;
  border-color: var(--cmt-border) !important;
}

.dark-mode .cmt-editor .v-note-op,
.dark-mode .cmt-editor .v-note-navigation-wrapper,
.dark-mode .cmt-editor .v-note-help-wrapper {
  border-color: var(--cmt-border) !important;
}

.dark-mode .cmt-editor .op-icon,
.dark-mode .cmt-editor .v-note-op button {
  color: var(--cmt-muted) !important;
}

.dark-mode .cmt-editor .emoji-picker,
.dark-mode .cmt-editor .emoji-picker__search input,
.dark-mode .cmt-editor .mention-dropdown {
  background: var(--cmt-hover-bg);
  color: var(--cmt-text);
  border-color: var(--cmt-border);
}

.dark-mode .cmt-editor .emoji-picker .emojis span:hover,
.dark-mode .cmt-editor .mention-dropdown li.selected,
.dark-mode .cmt-editor .mention-dropdown li:hover {
  background: var(--cmt-border);
}

@media (max-width: 576px) {
  .cmt-nested-replies {
    padding-left: 12px;
  }
}

</style>
