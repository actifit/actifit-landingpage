<template>
  <div>
    <NavbarBrand />

    <div v-if="!isLoading && report && report.author" class="container-fluid px-md-3 pt-5 mt-5 pb-5">
      <div class="row">
        
        <div class="col-md-8 order-md-2">
          <div class="text-right">
            <ChainSelection />
          </div>
          
          <div class="report-head mb-3 col-md-12" ref="reportHead">
            <div v-if="report.parent_author" class="text-right">
              <UserHoverCard :username="report.parent_author" />
              <i class="fas fa-reply text-brand"></i> {{ $t('viewing_comment_note') }} <a
                :href="buildParentLink">{{ $t('view_parent_thread') }}</a>
            </div>
            <h2>{{ report.title }}</h2>
        
            <div class="main-user-info pl-4" ref="reportTarget">
              <h5 class="text-brand">
                <UserHoverCard :username="report.author" />
              </h5>
              <a :href="buildLink" class="p-1"><span class="date-head spec-btns" :title="date">{{ $getTimeDifference(report.created) }}</span> <i class="fas fa-link spec-btns"></i></a>
              <i :title="$t('copy_link')" class="fas fa-copy spec-btns" @click="copyContent"></i>
              <i v-if="!showTranslated" class="fa-solid fa-language spec-btns" @click="translateContent"></i>
              <div>
                <span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i class="text-white fas fa-reply"></i></a></span>
                <span class="ml-1">
                  <a href="#" @click.prevent="votePrompt" data-toggle="modal" class="text-brand" data-target="#voteModal" v-if="user && userVotedThisPost()">
                    <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                  </a>
                  <a href="#" @click.prevent="votePrompt" data-toggle="modal" data-target="#voteModal" class="actifit-link-plain" v-else>
                    <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                  </a>
                  <span class="spec-btns">
                    <i class="far fa-comments ml-2" @click.prevent="headToComments()"></i> {{ report.children }}
                    <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)" v-if="user && report.author != user.account.name" :title="$t('reblog')"></i>
                  </span>
                </span>
              </div>
              <div class="modal-header">
                <div class="report-tags p-1" v-html="$fetchReportTags(report)"></div>
              </div>
            </div>
             <div v-if="showTranslated" class="translation-notice mt-2">
                <span>{{ $t('auto_translated_content') }}</span>
                <a href="#" @click.prevent="cancelTranslation">{{ $t('click_to_view_original') }}</a>
            </div>
          </div>
          
          <client-only>
            <vue-remarkable class="col-md-12" ref="remarkableContent" :source="body" :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>
          </client-only>

          <div class="modal-footer col-md-12 main-payment-info" id="main-footer">
            <div class="report-modal-prelim-info col-md-6">
              <span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i class="text-white fas fa-reply"></i></a></span>
              <span class="ml-1">
                <a href="#" @click.prevent="votePrompt" data-toggle="modal" class="text-brand" data-target="#voteModal" v-if="user && userVotedThisPost()">
                  <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                </a>
                <a href="#" @click.prevent="votePrompt" data-toggle="modal" data-target="#voteModal" class="actifit-link-plain" v-else>
                  <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                </a>
                <i class="far fa-comments ml-2" @click.prevent="headToComments()"></i> {{ report.children }}
                <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)" v-if="user && report.author != user.account.name" :title="$t('reblog')"></i>
              </span>
              <div>
                <span :title="afitReward + ' ' + $t('AFIT_Token')">
                  <img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}
                </span>
                 <span :title="postPayout">
                  <img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain == 'STEEM'">
                  <img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain == 'HIVE'">
                  <img src="/img/BLURT.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain == 'BLURT'">
                  <span v-if="postPaid()">
                    <span class="m-1" :title="$t('author_payout')"><i class="fa-solid fa-user"></i> {{ paidValue() }}</span>
                    <span class="m-1" :title="$t('voters_payout')"><i class="fa-solid fa-users"></i> {{ report.curator_payout_value }}</span>
                    <i class="fa-solid fa-check text-green text-bold"></i>
                  </span>
                  <span v-else>
                    <span class="text-bold">{{ report.pending_payout_value.replace('SBD', '') }}</span>
                    <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
                  </span>
                  <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()"><i class="fas fa-user-pen"><sup>{{ report.beneficiaries.length }}</sup></i></span>
                </span>
                <span @click.prevent="displayMorePayoutData = !displayMorePayoutData" class="text-brand pointer-cur-cls" :title="$t('more_token_rewards')">
                  <i class="fas fa-chevron-circle-down" v-if="!displayMorePayoutData"></i>
                  <i class="fas fa-chevron-circle-up" v-else></i>
                </span>
                <transition name="fade">
                  <div class="m-2" v-if="displayMorePayoutData">
                    <small v-for="(token, index) in tokenRewards" :key="index" :title="displayTokenValue(token)">
                      {{ displayTokenValue(token) }} |
                    </small>
                  </div>
                </transition>
              </div>
            </div>
            <div class="col-md-6">
              <client-only>
                <social-sharing :url="formattedReportUrl" :title="report.title" inline-template>
                  <div class="share-links-actifit">
                     <network network="facebook"><i class="fab fa-facebook" title="facebook"></i></network>
                    <network network="twitter"><i class="fab fa-twitter" title="twitter"></i></network>
                    <network network="telegram"><i class="fab fa-telegram" title="telegram"></i></network>
                    <network network="whatsapp"><i class="fab fa-whatsapp" title="whatsapp"></i></network>
                  </div>
                </social-sharing>
              </client-only>
            </div>
          </div>
          
          <div class="modal-footer col-md-12" v-if="meta && meta.full_afit_pay == 'on'">
            <div class="text-brand"><i class="fas fa-star"></i><small>{{ $t('Full_AFIT_Payout_Mode') }}</small><i class="fas fa-star"></i></div>
            <div class="text-brand" v-if="!postPaid()"><small>{{ $t('Pending_Pay') }}</small></div>
            <div class="text-brand" v-else><small>{{ fullAFITReward }} {{ $t('AFIT_Token') }}</small></div>
          </div>
          <div class="modal-footer col-md-12 text-brand" v-if="meta && meta.charity">
            <i class="fas fa-dove"></i><small>{{ $t('Charity_Post') }}</small><i class="fas fa-dove"></i>
            <small><a :href="'/@'+meta.charity[0]" target="_blank">@{{ meta.charity[0] }}</a></small>
          </div>
          
          <client-only>
            <transition name="fade">
              <div class="report-reply col-md-12" v-if="commentBoxOpen">
                <CustomTextEditor ref="editor" :initialContent="replyBody"></CustomTextEditor>
                <a href="#" @click.prevent="postResponse" class="btn btn-brand border reply-btn w-25">
                  {{ $t('Post') }}
                  <i class="fas fa-spin fa-spinner" v-if="loading"></i>
                </a>
                <a href="#" @click.prevent="resetOpenComment" class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
                <a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25" v-if="(user && moderators.find(mod => mod.name == user.account.name && mod.title == 'moderator'))">{{ $t('Short_Signature') }}</a>
                <a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25" v-if="(user && moderators.find(mod => mod.name == user.account.name && mod.title == 'moderator'))">{{ $t('Full_Signature') }}</a>
              </div>
            </transition>
             <div class="report-reply col-md-12" v-if="responsePosted">
                <a target="_blank"><div class="comment-user-section"><UserHoverCard :username="user.account.name" /></div></a>
                <vue-remarkable :source="responseBody" :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>
            </div>
          </client-only>
          
          <client-only>
            <div class="report-comments modal-body" v-if="report.children > 0" ref="commentsSection">
              <div v-if="commentsLoading" class="pb-md-2 text-center">
                <i class="fas fa-spinner fa-spin text-brand"></i>
              </div>
              <Comments v-if="commentsAvailable" :author="commentEntries.author" :body="commentEntries.body"
                :reply_entries.sync="commentEntries.reply_entries" :main_post_author="report.author"
                :main_post_permlink="report.permlink" :main_post_cat="report.category" :depth="0" :key="reload" />
            </div>
          </client-only>
        </div>
        
        <!-- UserSidebar -->
        <UserSidebar 
          :report="report"
          :author-account-info="authorAccountInfo"
          :author-afit-balance="authorAfitBalance"
          :user-rank="userRank"
          class="align-to-content"
        />
      </div>
    </div>
    
    <div v-else-if="errorDisplay" class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center"><h4>{{ errorDisplay }}</h4></div>
    </div>
    
    <div v-else class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center"><i class="fas fa-spin fa-spinner fa-3x text-brand"></i></div>
    </div>

    <VoteModal />
    <NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('VP_desc')" />
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
import hive from '@hiveio/hive-js'
import steem from 'steem'
import blurt from '@blurtfoundation/blurtjs'
import { mapGetters } from 'vuex'
import VueScrollTo from 'vue-scrollto'

import NavbarBrand from '~/components/NavbarBrand'
import ChainSelection from '~/components/ChainSelection'
import Footer from '~/components/Footer'
import VoteModal from '~/components/VoteModal'
import NotifyModal from '~/components/NotifyModal'
import UserHoverCard from '~/components/UserHoverCard.vue'
import CustomTextEditor from '~/components/CustomTextEditor'
import Comments from '~/components/Comments'
import SocialSharing from 'vue-social-sharing'
import vueRemarkable from 'vue-remarkable'
import UserSidebar from '~/components/UserSidebar.vue'
import { translateText } from '~/components/deepl-client'

const scot_steemengine_api = process.env.steemEngineScot;
const scot_hive_api_param = process.env.hiveEngineScotParam;

export default {
  components: {
    NavbarBrand, ChainSelection, Footer, VoteModal, NotifyModal, UserHoverCard,
    CustomTextEditor, Comments, SocialSharing, vueRemarkable,
    UserSidebar
  },
  head() { return { title: this.pageTitle } },
  data() {
    return {
      isLoading: true,
      report: null,
      errorDisplay: '',
      authorAccountInfo: null,
      authorAfitBalance: null,
      userRank: null,
      afitReward: 0,
      tokenRewards: [],
      fullAFITReward: '',
      commentsLoading: true,
      commentBoxOpen: false,
      replyBody: '',
      pageTitle: 'Actifit Report',
      showTranslated: false,
      safety_post_content: '',
      loading: false,
      responsePosted: false,
      responseBody: '',
      displayMorePayoutData: false,
      cur_bchain: 'HIVE',
      reload: 0,
      resizeObserver: null,
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['commentEntries', 'newlyVotedPosts', 'moderators', 'bchain']),
    body() {
      return this.report ? this.$cleanBody(this.report.body) : '';
    },
    commentsAvailable() {
      return this.commentEntries != null && !this.commentsLoading;
    },
    date() {
      if (!this.report) return '';
      const date = new Date(this.report.created)
      const minutes = date.getMinutes()
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${minutes < 10 ? '0' + minutes : minutes}`
    },
    buildLink() { return this.report ? `/@${this.report.author}/${this.report.permlink}` : '#'; },
    buildParentLink() { return this.report && this.report.parent_author ? `/@${this.report.parent_author}/${this.report.parent_permlink}` : '#'; },
    getVoteCount() { return (this.report && Array.isArray(this.report.active_votes)) ? this.report.active_votes.length : 0; },
    formattedReportUrl() { return this.report ? `https://actifit.io/@${this.report.author}/${this.report.permlink}` : ''; },
    meta() {
      try {
        return this.report ? JSON.parse(this.report.json_metadata) : {};
      } catch (e) {
        return {};
      }
    },
    postPayout() {
        if (!this.report || this.postPaid()) return '';
        return this.report.pending_payout_value.replace('SBD', '').replace('STEEM', '').replace('HBD', '').replace('HIVE', '') + ' $';
    },
  },
  watch: {
    '$route.path': 'fetchPageData',
     bchain(newBchain) {
      if (this.cur_bchain !== newBchain) {
        this.cur_bchain = newBchain;
        this.fetchPageData();
      }
    }
  },
  methods: {
    headToComments() {
      if (this.$refs.commentsSection) {
        this.$refs.commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    
    async translateContent() {
      if(!this.report.body) return;
      try {
        this.safety_post_content = this.report.body;
        const result = await translateText(this.report.body, 'en'); 
        this.report.body = result.translations[0].text || "Translation failed";
        this.showTranslated = true;
      } catch (error) {
        this.$notify({ group: 'error', text: 'Unable to translate content. Try again later.' });
        console.error('Translation error:', error);
      }
    },

    cancelTranslation() {
      this.report.body = this.safety_post_content;
      this.showTranslated = false;
    },
    copyContent() {
        navigator.clipboard.writeText(this.formattedReportUrl).then(() => {
            this.$notify({ group: 'success', text: this.$t('copied_successfully') });
        }).catch(() => {
            this.$notify({ group: 'error', text: this.$t('error_copying') });
        });
    },
    
    async postResponse() {
        if (!this.user) {
            this.$notify({ group: 'error', text: 'You need to login to comment!' });
            return;
        }
        this.loading = true;
        const parentAuthor = this.report.author;
        const parentPermlink = this.report.permlink;
        const author = this.user.account.name;
        const permlink = `${author}-re-${parentAuthor}-${parentPermlink}` + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
        const body = this.$refs.editor.content;

        const json_metadata = JSON.stringify({
            tags: ['hive-193552', 'actifit'],
            app: `actifit/1.0.0`,
        });

        try {
            await this.$steemconnect.comment(parentAuthor, parentPermlink, author, permlink, '', body, json_metadata);
            this.$notify({ group: 'success', text: this.$t('Comment_Success') });
            this.responsePosted = true;
            this.responseBody = body;
            this.resetOpenComment();
            setTimeout(() => this.fetchSupplementaryData(), 10000); // refresh comments after a delay
        } catch (e) {
            console.error(e);
            this.$notify({ group: 'error', text: this.$t('Comment_Error') + `: ${e.message || e}` });
        } finally {
            this.loading = false;
        }
    },
    handleStorageChange(event) {
      if (event.key === 'access_token' || event.key === 'ssc_auth' || event.key === 'username') {
        this.$store.dispatch('steemconnect/login');
      }
    },
    alignSidebar() {
      if (process.client) { 
        this.$nextTick(() => {
          const sidebar = document.querySelector('.user-sidebar.align-to-content');
          const target = this.$refs.reportTarget;
        
          if (window.innerWidth < 768) { 
            if (sidebar) sidebar.style.marginTop = '2rem'; 
            return;
          }
          
          if (sidebar && target) {
            const sidebarContainer = sidebar.parentElement;
            const targetRect = target.getBoundingClientRect();
            const sidebarContainerRect = sidebarContainer.getBoundingClientRect();
            const requiredMargin = targetRect.top - sidebarContainerRect.top;

            sidebar.style.marginTop = `${requiredMargin}px`;
          }
        });
      }
    },
    async fetchPageData() {
      this.isLoading = true;
      this.resetData();
      const author = this.$route.params.username.replace('@', '');
      const permlink = this.$route.params.permlink;
      try {
        this.cur_bchain = process.client ? localStorage.getItem('cur_bchain') || 'HIVE' : 'HIVE';
        let chainLnk = hive;
        let nodeUrl = process.env.hiveApiNode;
        if (this.cur_bchain === 'STEEM') { chainLnk = steem; nodeUrl = process.env.steemApiNode; }
        else if (this.cur_bchain === 'BLURT') { chainLnk = blurt; nodeUrl = process.env.blurtApiNode; }
        await chainLnk.api.setOptions({ url: nodeUrl });

        const reportData = await chainLnk.api.getContentAsync(author, permlink);
        if (!reportData || !reportData.author) throw new Error('Post not found');

        this.report = reportData;
        this.pageTitle = `${this.report.title} by @${this.report.author}`;
        
        await this.fetchSupplementaryData();

      } catch (err) {
        this.errorDisplay = "Could not load post. It may not exist or the network is busy.";
      } finally {
        this.isLoading = false;
        this.alignSidebar();
      }
    },
    async fetchSupplementaryData() {
        if (!this.report) return;
        const { author, url, permlink } = this.report;
        try {
            this.commentsLoading = true;
            this.reload += 1;
            let scot_api = this.cur_bchain === 'STEEM' ? scot_steemengine_api : `${scot_steemengine_api}`;

            const promises = [
                (this.cur_bchain === 'HIVE' ? hive : steem).api.getAccountsAsync([author]),
                fetch(`${process.env.actiAppUrl}user/${author}`).then(res => res.json()),
                fetch(`${process.env.actiAppUrl}getRank/${author}`).then(res => res.json()),
                fetch(`${process.env.actiAppUrl}getPostReward?user=${author}&url=${url}`).then(res => res.json()),
                fetch(`${process.env.actiAppUrl}getPostFullAFITPayReward?user=${author}&url=${url}`).then(res => res.json()),
                fetch(`${scot_api}@${author}/${permlink}${this.cur_bchain === 'HIVE' ? scot_hive_api_param : ''}`).then(res => res.json()),
                this.$store.dispatch('fetchReportComments', this.report)
            ];

            const [accounts, afitData, rankData, rewardData, fullAfitData, tokenData] = await Promise.all(promises);
            
            if (accounts && accounts.length > 0) this.authorAccountInfo = accounts[0];
            this.authorAfitBalance = afitData.tokens;
            this.userRank = rankData;
            this.afitReward = rewardData.token_count;
            this.fullAFITReward = fullAfitData.token_count;
            this.tokenRewards = Array.isArray(tokenData) ? tokenData : [];

        } catch (error) {
            console.error("Error fetching supplementary data:", error);
            this.tokenRewards = [];
        } finally {
            this.commentsLoading = false;
        }
    },
    resetData() {
      this.isLoading = true;
      this.report = null;
      this.errorDisplay = '';
      this.authorAccountInfo = null;
      this.authorAfitBalance = null;
      this.userRank = null;
      this.afitReward = 0;
      this.tokenRewards = [];
      this.fullAFITReward = '';
      this.pageTitle = 'Loading...';
      if (this.$store) this.$store.commit('setCommentEntries', null);
    },
    userVotedThisPost() {
        if (!this.user || !this.report || !this.report.active_votes) return false;
        const curUser = this.user.account.name;
        return this.report.active_votes.some(voter => voter.voter === curUser) || (this.newlyVotedPosts && this.newlyVotedPosts.includes(this.report.post_id));
    },
    votePrompt() { if (this.report) this.$store.commit('setPostToVote', this.report); },
    resetOpenComment() { this.commentBoxOpen = false; this.replyBody = ''; },
    
    paidValue() {
        if (!this.report) return '0.000 HBD';
        if (this.report.total_payout_value) return this.report.total_payout_value;
        if (this.report.author_payout_value) return this.report.author_payout_value;
        return "0.000 HBD";
    },
    postPaid() {
        if (!this.report) return false;
        if (this.report.is_paidout) return true;
        const cashout_time = new Date(this.report.cashout_time);
        return cashout_time.getFullYear() < 2000;
    },
    hasBeneficiaries() {
        return this.report && Array.isArray(this.report.beneficiaries) && this.report.beneficiaries.length > 0;
    },
    beneficiariesDisplay() {
        if (!this.hasBeneficiaries()) return '';
        let output = 'Beneficiaries:\n';
        for (const benef of this.report.beneficiaries) {
            output += `${benef.account}: ${benef.weight / 100}% \n`;
        }
        return output;
    },
    displayTokenValue(token) {
        if (!token || !token.symbol) return '';
        let val;
        if (parseFloat(token.total_payout_value) > 0) {
            val = parseFloat(token.total_payout_value) / Math.pow(10, token.precision);
        } else if (parseFloat(token.pending_token) > 0) {
            val = parseFloat(token.pending_token) / Math.pow(10, token.precision);
        } else {
            return "";
        }
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits: token.precision }).format(val) + ' ' + token.symbol;
    },
    insertModSignature() {
        this.replyBody += process.env.shortModeratorSignature;
    },
    insertFullModSignature() {
        this.replyBody += process.env.standardModeratorSignature;
    },
  },
  mounted() {
    this.$store.dispatch('steemconnect/login');
    this.$store.dispatch('fetchModerators');
    this.fetchPageData();
    VueScrollTo.scrollTo = VueScrollTo.scrollTo.bind(this);
    
    if (process.client) {
      window.addEventListener('storage', this.handleStorageChange);
      this.resizeObserver = new ResizeObserver(() => this.alignSidebar());

      this.$nextTick(() => {
        if (this.$refs.reportHead) {
          this.resizeObserver.observe(this.$refs.reportHead);
        }
      });
      window.addEventListener('resize', this.alignSidebar);
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener('storage', this.handleStorageChange);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      window.removeEventListener('resize', this.alignSidebar);
    }
  }
}
</script>

<style>
.text-muted { color: #adb5bd !important; }
.mid-avatar { width: 30px !important; height: 30px !important; }
.report-head { border-bottom: 1px solid red; }
img { max-width: 100%; }
.modal-author { margin-left: 10px !important; }
.actifit-link-plain { color: white; }
.modal-body { word-break: break-word; }
a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover { text-decoration: none; }
.markdown-editor .CodeMirror, .markdown-editor .CodeMirror-scroll { min-height: 100px; }
.reply-btn { float: right; margin-left: 5px; }
.date-head { padding-left: 2px; }
.report-reply { padding-left: 40px; padding-bottom: 40px; }
.share-links-actifit { text-align: right; }    
.share-links-actifit span, .share-links-actifit a { padding: 5px; cursor: pointer; color: white; }
.pointer-cur-cls { cursor: pointer; }
.translation-notice { background-color: #3e4722; color: white; padding: 5px; margin-top: 10px; border-radius: 5px; }
.translation-notice a { color: #fcc107; text-decoration: underline; }
.text-green { color: #28a745; }
</style>