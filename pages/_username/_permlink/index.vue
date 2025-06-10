<template>
  <div>
    <NavbarBrand />

    <div v-if="!isLoading && report && report.author" class="container pt-5 mt-5 pb-5">
      <div class="row">
        <!-- User Info Sidebar -->
        <div class="col-md-4">
          <div class="card user-sidebar sticky-top">
            <div class="card-body text-center">
              <div v-if="authorAccountInfo">
                <nuxt-link :to="'/@' + report.author">
                  <img :src="`https://images.hive.blog/u/${report.author}/avatar`" class="rounded-circle mb-3"
                    style="width: 100px; height: 100px;"
                    @error="$event.target.src='https://actifit.io/img/user-default.png'">
                </nuxt-link>
                <h4 class="card-title">
                  <nuxt-link :to="'/@' + report.author" class="text-brand">@{{ report.author }}</nuxt-link>
                </h4>
                <p v-if="userRank" class="text-muted small">User Rank: <strong>{{ displayCoreUserRank }}</strong></p>
                <small v-if="authorAccountInfo.created" class="text-muted">Joined {{ formatDate(authorAccountInfo.created) }}</small>
                <div class="d-flex justify-content-around my-4">
                  <div>
                    <h5 class="mb-0">{{ authorAccountInfo.balance.replace(' HIVE', '') }}</h5>
                    <small class="text-muted">HIVE</small>
                  </div>
                  <div>
                    <h5 class="mb-0">{{ authorAfitBalance != null ? parseFloat(authorAfitBalance).toFixed(3) : '...' }}</h5>
                    <small class="text-muted">AFIT</small>
                  </div>
                </div>
                <ul class="list-group list-group-flush text-left">
                  <li class="list-group-item"><i class="fas fa-blog fa-fw mr-2"></i><nuxt-link :to="'/@' + report.author">Blog Posts</nuxt-link></li>
                  <li class="list-group-item"><i class="fas fa-comments fa-fw mr-2"></i><nuxt-link :to="'/@' + report.author + '/comments'">Comments</nuxt-link></li>
                  <li class="list-group-item"><i class="fas fa-wallet fa-fw mr-2"></i><nuxt-link :to="'/@' + report.author + '/wallet'">Wallet</nuxt-link></li>
                </ul>
              </div>
              <div v-else class="py-5"><i class="fas fa-spinner fa-spin fa-2x text-brand"></i></div>
            </div>
          </div>
        </div>

        <!-- Main Post Content -->
        <div class="col-md-8">
          <div class="text-right">
            <ChainSelection />
          </div>
          <div class="report-head mb-3 col-md-12">
            <div v-if="report.parent_author" class="text-right">
              <UserHoverCard :username="report.parent_author" />
              <i class="fas fa-reply text-brand"></i> {{ $t('viewing_comment_note') }} <a
                :href="buildParentLink">{{ $t('view_parent_thread') }}</a>
            </div>
            <h2>{{ report.title }}</h2>
            <div class="main-user-info pl-4">
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
                <i class="far fa-comments ml-2"></i> {{ report.children }}
                <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)" v-if="user && report.author != user.account.name" :title="$t('reblog')"></i>
              </span>
              <div>
                <span :title="afitReward + ' ' + $t('AFIT_Token')">
                  <img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}
                </span>
              </div>
            </div>
            <div class="col-md-6">
              <client-only>
                <social-sharing :url="formattedReportUrl" :title="report.title" inline-template>
                  <div class="share-links-actifit">
                  </div>
                </social-sharing>
              </client-only>
            </div>
          </div>
          
          <client-only>
            <transition name="fade">
              <div class="report-reply col-md-12" v-if="commentBoxOpen">
                <CustomTextEditor ref="editor" :initialContent="replyBody"></CustomTextEditor>
                <a href="#" @click.prevent="postResponse" class="btn btn-brand border reply-btn w-25">Post</a>
                <a href="#" @click.prevent="resetOpenComment" class="btn btn-brand border reply-btn w-25">Cancel</a>
              </div>
            </transition>
          </client-only>
          
          <client-only>
            <div class="report-comments modal-body" v-if="report.children > 0">
              <div v-if="commentsLoading" class="pb-md-2 text-center">
                <i class="fas fa-spinner fa-spin text-brand"></i>
              </div>
              <Comments v-if="commentsAvailable" :author="commentEntries.author" :body="commentEntries.body"
                :reply_entries.sync="commentEntries.reply_entries" :main_post_author="report.author"
                :main_post_permlink="report.permlink" />
            </div>
          </client-only>
        </div>
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
    <Footer />
  </div>
</template>

<script>
import hive from '@hiveio/hive-js'
import steem from 'steem'
import blurt from '@blurtfoundation/blurtjs'
import { mapGetters } from 'vuex'

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

export default {
  components: {
    NavbarBrand, ChainSelection, Footer, VoteModal, NotifyModal, UserHoverCard,
    CustomTextEditor, Comments, SocialSharing, vueRemarkable,
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
      commentsLoading: true,
      commentBoxOpen: false,
      replyBody: '',
      pageTitle: 'Actifit Report',
      showTranslated: false,
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['commentEntries', 'newlyVotedPosts']),
    body() {
      return this.report ? this.$cleanBody(this.report.body) : '';
    },
    displayCoreUserRank() {
      return (this.userRank ? parseFloat(this.userRank.rank_no_afitx).toFixed(2) : 'N/A');
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
  },
  watch: {
    //watcher handles all navigation logic.
    '$route.path': 'fetchPageData'
  },
  methods: {
    async fetchPageData() {
      this.isLoading = true;
      this.resetData();
      
      const author = this.$route.params.username.replace('@', '');
      const permlink = this.$route.params.permlink;
      
      try {
        const cur_bchain = process.client ? localStorage.getItem('cur_bchain') || 'HIVE' : 'HIVE';
        let chainLnk = hive;
        let nodeUrl = process.env.hiveApiNode;

        if (cur_bchain === 'STEEM') { chainLnk = steem; nodeUrl = process.env.steemApiNode; }
        else if (cur_bchain === 'BLURT') { chainLnk = blurt; nodeUrl = process.env.blurtApiNode; }
        
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
      }
    },
    async fetchSupplementaryData() {
        if (!this.report) return;
        const { author, url } = this.report;
        try {
            this.commentsLoading = true;
            const promises = [
                hive.api.getAccountsAsync([author]),
                fetch(`${process.env.actiAppUrl}user/${author}`).then(res => res.json()),
                fetch(`${process.env.actiAppUrl}getRank/${author}`).then(res => res.json()),
                fetch(`${process.env.actiAppUrl}getPostReward?user=${author}&url=${url}`).then(res => res.json()),
                this.$store.dispatch('fetchReportComments', this.report)
            ];
            const [accounts, afitData, rankData, rewardData] = await Promise.all(promises);
            
            if (accounts && accounts.length > 0) this.authorAccountInfo = accounts[0];
            this.authorAfitBalance = afitData.tokens;
            this.userRank = rankData;
            this.afitReward = rewardData.token_count;
        } catch (error) {
            console.error("Error fetching supplementary data:", error);
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
      this.pageTitle = 'Loading...';
      if (this.$store) this.$store.commit('setCommentEntries', null);
    },
    formatDate(isoDate) {
      if (!isoDate) return 'N/A';
      return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    userVotedThisPost() {
        if (!this.user || !this.report) return false;
        const curUser = this.user.account.name;
        return this.report.active_votes.some(voter => voter.voter === curUser) || (this.newlyVotedPosts && this.newlyVotedPosts.includes(this.report.post_id));
    },
    votePrompt() { if (this.report) this.$store.commit('setPostToVote', this.report); },
    resetOpenComment() { this.commentBoxOpen = false; this.replyBody = ''; },
    copyContent() { navigator.clipboard.writeText(this.formattedReportUrl); },
    
  },
  mounted() {
    this.fetchPageData();
  }
}
</script>

<style>

.user-sidebar.sticky-top { top: 1rem; }
.user-sidebar { background-color: #2e2e2e; color: white; border: 1px solid #444; }
.user-sidebar .card-body { padding: 1.5rem; }
.user-sidebar .list-group-item { background-color: transparent; border-top: 1px solid #444; padding: .75rem 0; }
.user-sidebar .list-group-item:first-child { border-top: none; }
.user-sidebar .list-group-item a { color: white; text-decoration: none; }
.user-sidebar .list-group-item a:hover { color: #ff112d; }
.text-muted { color: #adb5bd !important; }
.mid-avatar { width: 30px !important; height: 30px !important; }
.report-head { border-bottom: 1px solid red; }
img { max-width: 100%; }
.modal-author { margin-left: 10px !important; }
.actifit-link-plain { color: white; }
.modal-body { word-break: break-word; }
a:hover, a:hover, .text-brand:hover, .actifit-link-plain:hover { text-decoration: none; }
.numberCircle { border-radius: 25%; width: 10px; line-height: 10px; padding: 4px 2px 4px 2px; margin-left: 4px; background: #fff; border: 2px solid; text-align: center; vertical-align: middle; }
.markdown-editor .CodeMirror, .markdown-editor .CodeMirror-scroll { min-height: 100px; }
.reply-btn { float: right; }
.date-head { padding-left: 2px; }
.report-reply { padding-left: 40px; padding-bottom: 40px; }
.share-links-actifit { text-align: right; }
.share-links-actifit span { padding: 5px; cursor: pointer; }
.report-modal-prelim-info span { /* padding: 5px; */ }
.pointer-cur-cls { cursor: pointer; }
</style>