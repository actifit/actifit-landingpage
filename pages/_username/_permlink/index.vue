<template>
  <div>
    <NavbarBrand />

    <div v-if="!isLoading && report && report.author" class="container-fluid px-md-3 pt-5 mt-5 pb-5">

      <div class="row" ref="pageRow">
        <!-- Main Content Column -->
        <div class="col-md-8 order-md-2">

          <!-- This container now uses CSS 'sticky' to achieve the two-stage scroll -->
          <div class="main-content-scroll-container" ref="mainContentScroller">

            <!-- The wrapper with 'row' class solves the scrollbar issue -->
            <div class="content-wrapper row">

              <!-- THE FINAL FIX: Adding col-12 restores the design -->
              <div class="col-12 text-right">
                <ChainSelection />
              </div>
              <div class="report-head mb-3 col-md-12" ref="reportHead">
                <div v-if="report.parent_author" class="text-right">
                  <UserHoverCard :username="report.parent_author" />
                  <i class="fas fa-reply text-brand"></i> {{ $t('viewing_comment_note') }} <a
                    :href="buildParentLink">{{ $t('view_parent_thread') }}</a>
                </div>

                <h2>{{ report.title }}</h2>
                <div class="main-user-info pl-4" ref="reportTarget">
                  <h5 class="text-brand">
                    <UserHoverCard :username="report.author" />
                  </h5>
                  <a :href="buildLink" class="p-1"><span class="date-head spec-btns" :title="date">{{ $getTimeDifference(report.created) }}</span> <i class="fas fa-link spec-btns"></i></a>
                  <i :title="$t('copy_link')" class="fas fa-copy spec-btns" v-on:click="copyContent"></i>
                  <i v-if="translationLoading" class="fas fa-spinner fa-spin spec-btns" :title="$t('translating_content', 'Translating...')"></i>
                  <i v-else-if="!showTranslated" class="fa-solid fa-language spec-btns" v-on:click="translateContent" :title="$t('translate_content', 'Translate Content')"></i>
                  <div>
                    <span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i
                          class="text-white fas fa-reply"></i></a></span>

                    <span class="ml-1">
                      <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand"
                        data-target="#voteModal" v-if="user && userVotedThisPost() == true">
                        <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                      </a>
                      <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal"
                        class="actifit-link-plain" v-else>
                        <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                      </a>
                      <span class="spec-btns"><i class="far fa-comments ml-2" @click.prevent="headToComments()"></i> {{ report.children }}
                        <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)"
                          v-if="user && report.author != user.account.name" :title="$t('reblog')"></i></span>
                    </span>
                  </div>
                  <div class="modal-header">
                    <div class="report-tags p-1" v-html="$fetchReportTags(report)"></div>
                  </div>
                </div>
                <div v-if="showTranslated" class="translation-notice">
                  <span>{{ $t('auto_translated_content') }}</span>
                  <a href="#" v-on:click="cancelTranslation">{{ $t('click_to_view_original') }}</a>
                </div>
              </div>

              <vue-remarkable class="col-md-12" ref="remarkableContent" :source="proxiedBody"
                :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>


              <div class="modal-footer col-md-12 main-payment-info" id="main-footer">
                <div class="report-modal-prelim-info col-md-6">
                  <span><a href="#" @click.prevent="commentBoxOpen = !commentBoxOpen" :title="$t('Reply')"><i
                        class="text-white fas fa-reply"></i></a></span>

                  <span class="ml-1">
                    <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" class="text-brand"
                      data-target="#voteModal" v-if="user && userVotedThisPost() == true">
                        <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                    </a>
                    <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal"
                      class="actifit-link-plain" v-else>
                        <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
                    </a>
                    <i class="far fa-comments ml-2" @click.prevent="headToComments()"></i> {{ report.children }}
                    <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)"
                      v-if="user && report.author != user.account.name" :title="$t('reblog')"></i>
                  </span>
                  <div>

                    <span :title="afitReward + ' ' + $t('AFIT_Token')">
                      <i class="fas fa-running text-brand mr-1"></i>{{ afitReward }} {{ $t('AFIT_Token') }}
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
                      <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()">
                        <i class="fas fa-user-pen"><sup>{{ report.beneficiaries.length }}</sup></i>
                      </span>
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
                  <social-sharing :url="formattedReportUrl" :title="report.title" :description="socialSharingDesc"
                    :quote="socialSharingQuote" :hashtags="hashtags" twitter-user="actifit_fitness" inline-template>
                    <div class="share-links-actifit">
                      <network network="facebook"><i class="fab fa-facebook" title="facebook"></i></network>
                      <network network="twitter"><i class="fab fa-twitter" title="twitter"></i></network>
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
              <div class="modal-footer col-md-12" v-if="meta.full_afit_pay == 'on'">
                <div class="text-brand"><i class="fas fa-star"></i><small> {{ $t('Full_AFIT_Payout_Mode') }} </small><i class="fas fa-star"></i></div>
                <div class="text-brand" v-if="!postPaid()"><small> {{ $t('Pending_Pay') }} </small></div>
                <div class="text-brand" v-else><small> {{ fullAFITReward }} {{ $t('AFIT_Token') }} </small></div>
              </div>
              <div class="modal-footer col-md-12 text-brand" v-if="meta.charity">
                <i class="fas fa-dove"></i><small> {{ $t('Charity_Post') }} </small><i class="fas fa-dove"></i>
                <small><a :href="meta.charity[0]" target="_blank">@{{ meta.charity[0] }}</a></small>
              </div>
              <transition name="fade">
                <div class="report-reply col-md-12" v-if="commentBoxOpen">
                  <CustomTextEditor ref="editor" :initialContent="replyBody"></CustomTextEditor>
                  <a href="#" @click.prevent="postResponse($event)" class="btn btn-brand border reply-btn w-25">
                    {{ $t('Post') }}
                    <i class="fas fa-spin fa-spinner" v-if="loading"></i>
                  </a>
                  <a href="#" @click.prevent="resetOpenComment()" class="btn btn-brand border reply-btn w-25">{{ $t('Cancel') }}</a>
                  <a href="#" @click.prevent="insertModSignature" class="btn btn-brand border reply-btn w-25"
                    v-if="(user && moderators.find(mod => mod.name == user.account.name && mod.title == 'moderator'))">{{ $t('Short_Signature') }}</a>
                  <a href="#" @click.prevent="insertFullModSignature" class="btn btn-brand border reply-btn w-25"
                    v-if="(user && moderators.find(mod => mod.name == user.account.name && mod.title == 'moderator'))">{{ $t('Full_Signature') }}</a>
                </div>
              </transition>
              <div class="report-reply col-md-12" v-if="responsePosted">
                <a target="_blank"><div class="comment-user-section"><UserHoverCard :username="user.account.name" /></div></a>
                <vue-remarkable :source="responseBody" :options="{ 'html': true, 'breaks': true, 'typographer': true }"></vue-remarkable>
              </div>

              <div class="report-comments modal-body" v-if="report.children > 0" ref="commentsSection">
                <div v-if="commentsLoading" class="pb-md-2 text-center">
                  <i class="fas fa-spinner fa-spin text-brand"></i>
                </div>
                <Comments v-if="commentsAvailable" :author="commentEntries.author" :body="commentEntries.body"
                  :reply_entries.sync="commentEntries.reply_entries" :main_post_author="report.author"
                  :main_post_permlink="report.permlink" :main_post_cat="report.category" :depth="0" :key="reload" />
              </div>

            </div>

          </div>

        </div>

        <UserSidebar
          ref="userSidebar"
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
import { translateTextWithGemini } from '~/components/gemini-client.js';
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
import sanitize from 'sanitize-html'

const scot_steemengine_api = process.env.steemEngineScot;
const scot_hive_api_param = process.env.hiveEngineScotParam;

export default {
  components: {
    NavbarBrand, ChainSelection, Footer, VoteModal, NotifyModal, UserHoverCard,
    CustomTextEditor, Comments, SocialSharing, vueRemarkable, UserSidebar
  },
  head() {
    return {
      title: `${this.pageTitle}`,
      meta: [
        { hid: 'title', name: 'og:title', 'property': 'og:title', content: `${this.pageTitle} - Actifit` },
        { hid: 'description', name: 'description', content: `${this.desc} by ${this.username}` },
        { hid: 'ogdescription', name: 'og:description', 'property': 'og:description', content: `${this.desc} by ${this.username}` },
        { hid: 'image', name: 'og:image', 'property': 'og:image', content: `${this.postImg}` }
      ],
      link: [
        { rel: 'canonical', href: `${this.canonUrl}` }
      ]
    }
  },
  async asyncData({ params, app }) {
    //let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE')
    //if (cur_bchain == 'HIVE'){
    //set HIVE as default chain, since we cannot use localstorage in here
    let chainLnk = hive;
    await chainLnk.api.setOptions({ url: process.env.hiveApiNode });
    /*}else{
      await steem.api.setOptions({ url: process.env.steemApiNode });
    }	  */
    //console.log('connect node');
    let user_name = params.username.replace('@', '');
    let result = await chainLnk.api.getContentAsync(user_name, params.permlink);
    let is_steem = false;
    if (!result || !result.author) {
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
    try {
      let post_meta = JSON.parse(result.json_metadata)
      let imgs = post_meta.image;
      let meta_spec = {
        pageTitle: (result.title || 'Comment')+' by @'+result.author, //since $t is not accessible at this point
      }
      if (Array.isArray(imgs) && imgs.length > 0) {
        meta_spec.postImg = imgs[0];
      }

      //let's set proper canonical url based of app
      let canonUrl = '';

      if (post_meta.app) {
        let src_app = post_meta.app.split('/')[0];
        //fetch post original category
        let post_cat = result.category;

        //fallback
        if (!post_cat) {
          post_cat = post_meta.community;
        }

        //list of current apps applying proper formal scripting. Default as hive
        let appsPatterns = process.env.hiveAppsScript;

        //fallback to steem
        if (is_steem) {
          appsPatterns = process.env.steemAppsScript;
        }

        for (let appPat in appsPatterns) {
          if (src_app.toLowerCase() == appPat.toLowerCase()) {
            //found, grab pattern
            if (appsPatterns[appPat].url_scheme) {
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
      desc = desc.replace(img_links_reg, '');

      /* let's find images sent as pure URLs */
      img_links_reg = /(((https?:\/\/usermedia\.actifit\.io\/)[\d\w-]+)|((https:\/\/ipfs\.busy\.org\/ipfs\/)[\d\w-]+)|((https:\/\/steemitimages\.com\/)[\d\w-[\:\/\.]+)|(https?:\/\/[.\/\d\w-]*\.(?:png|jpg|jpeg|gif)))[\s]/igm;
      desc = desc.replace(img_links_reg, '');

      /* replace spaces with single separating space */
      desc = desc.replace(/\s+/g, ' ');

      /* cleanup some markdown known syntax */
      desc = desc.replace(/\#/g, '')
        .replace(/\*/g, '')
        .replace(/\_/g, '');

      //make sure we don't over consume desc size
      if (desc.length > 140) {
        desc = desc.substr(0, 140) + '...';
      }
      //console.log(desc);
      meta_spec.desc = desc;
      return meta_spec;
    } catch (preerr) {
      console.log(preerr);
      return '';
    }
  },
  data() {
    return {
      isLoading: true, report: null, errorDisplay: '', authorAccountInfo: null,
      authorAfitBalance: null, userRank: null, afitReward: 0, fullAFITReward: '',
      tokenRewards: [], commentsLoading: true, commentBoxOpen: false, replyBody: '',
      responsePosted: false, responseBody: '', moderatorSignature: '', loading: false,
      pageTitle: 'Actifit Report', showTranslated: false, safety_post_content: '',
	    translationLoading: false, translatedText: '', reload: 0, resizeObserver: null,
      displayMorePayoutData: false, cur_bchain: 'HIVE',
      socialSharingDesc: process.env.socialSharingDesc,
      socialSharingQuote: process.env.socialSharingQuote,
      hashtags: process.env.socialSharingHashtags,
      heightSyncObserver: null,
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user', 'stdLogin']),
    ...mapGetters(['commentEntries', 'newlyVotedPosts', 'bchain', 'moderators', 'commentCountToday']),

    proxiedBody() {
      if (!this.report || !this.report.body) return '';
      // All the complex logic is now handled inside $cleanBody
      return this.$cleanBody(this.report.body);
    },

    body() { return this.report ? this.$cleanBody(this.report.body) : ''; },
    commentsAvailable() { return this.commentEntries != null && !this.commentsLoading; },
    date() {
      if (!this.report) return '';
      const date = new Date(this.report.created)
      const minutes = date.getMinutes()
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${minutes < 10 ? '0' + minutes : minutes}`
    },
    meta() {
      try { if (this.report && this.report.json_metadata) { return JSON.parse(this.report.json_metadata); } } catch (e) {}
      return {};
    },
    buildLink() { return this.report ? `/@${this.report.author}/${this.report.permlink}` : '#'; },
    buildParentLink() { return this.report && this.report.parent_author ? `/@${this.report.parent_author}/${this.report.parent_permlink}` : '#'; },
    getVoteCount() { return (this.report && Array.isArray(this.report.active_votes)) ? this.report.active_votes.length : 0; },
    formattedReportUrl() { return this.report ? `https://actifit.io/@${this.report.author}/${this.report.permlink}` : ''; },
    postPayout() {
      if (!this.report || this.postPaid()) return '';
      return this.report.pending_payout_value.replace('SBD', '').replace('STEEM', '').replace('HBD', '').replace('HIVE', '') + ' $';
    },
  },
  watch: {
    '$route.path': 'fetchPageData',
     bchain: async function (newBchain) {
      this.cur_bchain = newBchain;
      this.fetchPageData();
    },
  },
  methods: {
    headToComments() {
      if (this.$refs.commentsSection) {
        VueScrollTo.scrollTo(this.$refs.commentsSection, 500, { easing: 'ease-in-out', offset: -80 });
      }
    },
    syncColumnHeights() {
		if (!this.$refs.mainContentScroller || !this.$refs.userSidebar) {
		  return;
		}

		this.$nextTick(() => {
		  const mainContentEl = this.$refs.mainContentScroller;
		  const sidebarEl = this.$refs.userSidebar.$el;

		  if (!mainContentEl || !sidebarEl) return;

		  const sidebarHeight = sidebarEl.scrollHeight;
		  const viewportHeight = window.innerHeight - 90; // Top offset
		  const finalHeight = Math.max(sidebarHeight, viewportHeight);

		  mainContentEl.style.height = `${finalHeight}px`;
		});
	  },

    handleStorageChange(event) {
      if (event.key === 'access_token' || event.key === 'ssc_auth' || event.key === 'username') {
        this.$store.dispatch('steemconnect/login');
        this.fetchPageData();
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
      this.isLoading = true; this.resetData();
      const author = this.$route.params.username.replace('@', '');
      const permlink = this.$route.params.permlink;
      try {
        this.cur_bchain = process.client ? localStorage.getItem('cur_bchain') || 'HIVE' : 'HIVE';
        let chainLnk = hive; let nodeUrl = process.env.hiveApiNode;
        if (this.cur_bchain === 'STEEM') { chainLnk = steem; nodeUrl = process.env.steemApiNode; }
        else if (this.cur_bchain === 'BLURT') { chainLnk = blurt; nodeUrl = process.env.blurtApiNode; }
        await chainLnk.api.setOptions({ url: nodeUrl });
        const reportData = await chainLnk.api.getContentAsync(author, permlink);
        if (!reportData || !reportData.author) throw new Error('Post not found');
        this.report = reportData;
        this.pageTitle = this.report.title || 'Comment' + ` by @${this.report.author}`;
        await this.fetchSupplementaryData();
        this.fetchReportCommentData();
      } catch (err) {
        this.errorDisplay = "Could not load post. It may not exist or the network is busy.";
        console.error(err);
      } finally {
        this.isLoading = false; this.alignSidebar();
      }
    },
    async fetchSupplementaryData() {
        if (!this.report) return;
        const { author, url, permlink } = this.report;
        const [accounts, afitData, rankData] = await Promise.all([
            hive.api.getAccountsAsync([author]),
            fetch(`${process.env.actiAppUrl}user/${author}`).then(res => res.json()),
            fetch(`${process.env.actiAppUrl}getRank/${author}`).then(res => res.json()),
        ]);
        if (accounts && accounts.length > 0) this.authorAccountInfo = accounts[0];
        if (afitData) this.authorAfitBalance = afitData.tokens;
        if (rankData) this.userRank = rankData;
        fetch(`${process.env.actiAppUrl}getPostReward?user=${author}&url=${url}`).then(res => res.json()).then(json => this.afitReward = json.token_count);
        fetch(`${process.env.actiAppUrl}getPostFullAFITPayReward?user=${author}&url=${url}`).then(res => res.json()).then(json => this.fullAFITReward = json.token_count);
        const scotApiUrl = this.cur_bchain === 'STEEM' ? `${scot_steemengine_api}@${author}/${permlink}` : `${scot_steemengine_api}@${author}/${permlink}${scot_hive_api_param}`;
        fetch(scotApiUrl).then(res => res.json()).then(json => { this.tokenRewards = Array.isArray(json) ? json : [] }).catch(e => { console.error("Scot API fetch failed:", e); this.tokenRewards = []; });
    },
    fetchReportCommentData() {
      if (!this.report) return;
      this.commentsLoading = true;
      this.$store.dispatch('fetchReportComments', this.report)
        .catch(err => {
          console.error("Failed to refresh comments:", err);
          this.$notify({ group: 'error', text: 'Comment posted, but could not refresh the list.', position: 'top center' });
        })
        .finally(() => {
          this.commentsLoading = false;
          this.responsePosted = false;
          this.responseBody = '';
        });
    },
    resetData() {
      this.isLoading = true; this.report = null; this.errorDisplay = ''; this.authorAccountInfo = null; this.authorAfitBalance = null;
      this.userRank = null; this.afitReward = 0; this.tokenRewards = []; this.pageTitle = 'Loading...'; this.fullAFITReward = '';
      if (this.user) { this.moderatorSignature = ''; }
      if (this.$store) this.$store.commit('setCommentEntries', null);
    },
    copyContent(event) {
      navigator.clipboard.writeText('https://actifit.io/@' + this.report.author + '/' + this.report.permlink)
        .then(() => { this.$notify({ group: 'success', text: this.$t('copied_successfully'), position: 'top center' }) })
        .catch((error) => { this.$notify({ group: 'error', text: this.$t('error_copying'), position: 'top center' }) });
    },
    userVotedThisPost() {
        if (!this.user || !this.report) return false;
        const curUser = this.user.account.name;
        return this.report.active_votes.some(voter => voter.voter === curUser) || (this.newlyVotedPosts && this.newlyVotedPosts.includes(this.report.post_id));
    },
    postPaid() {
      if (!this.report) return false;
      if (this.report.is_paidout) return true;
      const last_payout = new Date(this.report.last_payout);
      const cashout_time = new Date(this.report.cashout_time);
      return last_payout.getTime() > cashout_time.getTime();
    },
    paidValue() {
      if (!this.report) return '0.000';
      if (this.report.total_payout_value) return this.report.total_payout_value;
      if (this.report.author_payout_value) return this.report.author_payout_value;
      return '0.000';
    },
    hasBeneficiaries() { return this.report && Array.isArray(this.report.beneficiaries) && this.report.beneficiaries.length > 0; },
    beneficiariesDisplay() {
      if (!this.hasBeneficiaries()) return '';
      return 'Beneficiaries:\n' + this.report.beneficiaries.map(b => `${b.account}: ${b.weight / 100}%`).join('\n');
    },
    displayTokenValue(token) {
        let val;
        if (parseFloat(token.total_payout_value) > 0) { val = parseFloat(token.total_payout_value) / Math.pow(10, token.precision); } else { val = parseFloat(token.pending_token) / Math.pow(10, token.precision); }
        if (isNaN(val)) return '';
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits: token.precision }).format(val) + ' ' + token.token;
    },
    async translateContent() {
      if (this.translatedText) { this.report.body = this.translatedText; this.showTranslated = true; return; }
      this.translationLoading = true; this.safety_post_content = this.report.body;
      try {
        const translationResult = await translateTextWithGemini(this.report.body);
        this.translatedText = translationResult; this.report.body = this.translatedText; this.showTranslated = true;
      } catch (error) {
        console.error('Translation process failed:', error); this.report.body = this.safety_post_content;
        this.$notify({ group: 'error', text: 'Translation service failed. Please try again later.', position: 'top center' });
      } finally { this.translationLoading = false; }
    },
    cancelTranslation() { this.report.body = this.safety_post_content; this.showTranslated = false; },
    votePrompt() { if (this.report) this.$store.commit('setPostToVote', this.report); },
    resetOpenComment() { this.commentBoxOpen = false; this.replyBody = ''; },

    async postResponse(event) {
      this.loading = true
      const comment_perm = this.user.account.name.replace('.', '-') + '-re-' + this.report.author.replace('.', '-') + '-' + this.report.permlink + new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
      const meta = {
        tags: ['hive-193552', 'actifit'],
        app: 'actifit/0.4.1',
        suppEdit: 'actifit.io.comment'
      };
      this.replyBody = this.$refs.editor.content;

      if (!localStorage.getItem('std_login')) {
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
          this.user.account.name, "", this.replyBody, this.report.permlink,
          this.report.author, JSON.stringify(meta), comment_perm,
          JSON.stringify(comment_options), (response) => {
            if (response.success) {
              this.commentSuccess(null, true, this.cur_bchain);
            } else {
              this.commentSuccess(response.message, false, this.cur_bchain);
            }
          });
      } else {
        let cstm_params = {
          "author": this.user.account.name, "title": "", "body": this.replyBody,
          "parent_author": this.report.author, "parent_permlink": this.report.permlink,
          "permlink": comment_perm, "json_metadata": JSON.stringify(meta)
        };
        let res = await this.processTrxFunc('comment', cstm_params);
        if (res.success) {
          this.commentSuccess(null, true, this.cur_bchain);
        } else {
          this.commentSuccess('error saving', false, this.cur_bchain);
        }
      }
    },
    commentSuccess(err, finalize, bchain) {
      this.$notify({
        group: err ? 'error' : 'success',
        text: err ? this.$t('Comment_Error') : this.$t('Comment_Success'),
        position: 'top center'
      })
      if (finalize) {
        this.loading = false
        this.responsePosted = true;
        this.responseBody = this.replyBody;
        setTimeout(this.fetchReportCommentData, 10000);
        if (this.responseBody.length >= 50) {
          if (isNaN(this.commentCountToday)) {
            this.$store.commit('setCommentCountToday', 0);
          }
          this.$store.commit('setCommentCountToday', this.commentCountToday + 1);
        }
        if (this.commentCountToday >= 3) {
          this.rewardUserComment();
        }
        this.resetOpenComment();
      }
    },
    async processTrxFunc(op_name, cstm_params) {
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
            this.$notify({ group: 'warn', text: msg, duration: -1, position: 'top center' })
          })
            .then(response => {
              this.$notify({ group: 'warn', clean: true })
              if (response.cmd && response.cmd === 'sign_ack') {
                resolve({ success: true, trx: response.data })
              } else if (response.cmd && response.cmd === 'sign_nack') {
                resolve({ success: false })
              }
            })
            .catch(err => {
              this.$notify({ group: 'warn', clean: true })
              resolve({ success: false })
            })
        });
      } else {
        let accToken = localStorage.getItem('access_token')
        let op_json = JSON.stringify([[op_name, cstm_params]])
        let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + this.user.account.name + '&operation=' + encodeURIComponent(op_json) + '&bchain=' + this.cur_bchain);
        let reqHeads = new Headers({ 'Content-Type': 'application/json', 'x-acti-token': 'Bearer ' + accToken, });
        let res = await fetch(url, { headers: reqHeads });
        let outcome = await res.json();
        if (outcome.error) {
          let err_msg = outcome.trx.tx.error;
          if (err_msg.includes('missing') && err_msg.includes('authority')) {
            localStorage.removeItem('access_token');
            this.$store.dispatch('steemconnect/logout');
          }
          this.$notify({ group: 'error', text: err_msg, position: 'top center' })
          return { success: false, trx: null };
        } else {
          return { success: true, trx: outcome.trx };
        }
      }
    },
    async rewardUserComment() {
      let url = new URL(process.env.actiAppUrl + 'rewardActifitWebComment/' + this.user.account.name);
      let params = { web_comment_token: process.env.webCommentToken, url: this.report.url, }
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
    insertModSignature() {
      if (this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
        this.moderatorSignature = process.env.shortModeratorSignature; this.replyBody += this.moderatorSignature;
      }
    },
    insertFullModSignature() {
      if (this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
        this.moderatorSignature = process.env.standardModeratorSignature; this.replyBody += this.moderatorSignature;
      }
    },
  },
  mounted() {
    this.$store.dispatch('steemconnect/login');
    this.fetchPageData();

    if (process.client) {
      window.addEventListener('storage', this.handleStorageChange);
      this.resizeObserver = new ResizeObserver(() => this.alignSidebar());
      this.$nextTick(() => {
        if (this.$refs.reportHead) this.resizeObserver.observe(this.$refs.reportHead);
         this.heightSyncObserver = new ResizeObserver(() => {
			this.syncColumnHeights();
		});

		this.$nextTick(() => {
		  if (this.$refs.userSidebar && this.$refs.userSidebar.$el) {
			this.heightSyncObserver.observe(this.$refs.userSidebar.$el);
		  }
		});

		window.addEventListener('resize', this.syncColumnHeights);

      });
      window.addEventListener('resize', this.alignSidebar);
    }
  },
  beforeDestroy() {
    if (process.client) {
      window.removeEventListener('storage', this.handleStorageChange);
      if (this.resizeObserver) this.resizeObserver.disconnect();

		if (this.heightSyncObserver) this.heightSyncObserver.disconnect();
		window.removeEventListener('resize', this.syncColumnHeights);

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
.reply-btn { float: right; }
.date-head { padding-left: 2px; }
.report-comments .date-head { color: #6c757d !important; }
.report-reply { padding-left: 40px; padding-bottom: 40px; }
.share-links-actifit { text-align: right; }
.share-links-actifit span, .share-links-actifit a { padding: 5px; cursor: pointer; color: #fff; }
.pointer-cur-cls { cursor: pointer; }
.translation-notice { background-color: #fcf8e3; border: 1px solid #faebcc; padding: 10px; margin-top: 15px; border-radius: 4px; color: #8a6d3b; }
.text-green { color: #28a745; }

/* Main container handles ONLY vertical scrolling and acts as a flex parent */
.main-content-scroll-container {
  position: -webkit-sticky;
  position: sticky;
  top: 90px;
  max-height: calc(100vh - 90px);

  overflow-y: auto;
  overflow-x: hidden; /* Hide horizontal scrollbar here */

  /* Make it a flex container so its child can fill its height */
  display: flex;

  /* --- Vertical Scrollbar Styling (Firefox) --- */
  scrollbar-width: auto;
  scrollbar-color: red #f1f1f1;
}

/* The inner wrapper handles ONLY horizontal scrolling */
.content-wrapper {
  overflow-x: auto; /* Let this div handle the horizontal overflow */
  width: 100%;     /* Ensure it takes up the full width */

  /* --- Horizontal Scrollbar Styling (Firefox) --- */
  scrollbar-width: auto;
  scrollbar-color: red #f1f1f1;
}


/* --- Webkit Scrollbar Styling --- */
/* THIS IS THE CRITICAL FIX: STYLES ARE NOW SEPARATED */

/* Container's VERTICAL scrollbar */
.main-content-scroll-container::-webkit-scrollbar {
  width: 12px;
}
.main-content-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.main-content-scroll-container::-webkit-scrollbar-thumb {
  background-color: red;
  border-radius: 10px;
}

/* Wrapper's HORIZONTAL scrollbar */
.content-wrapper::-webkit-scrollbar {
  height: 12px;
}
.content-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.content-wrapper::-webkit-scrollbar-thumb {
  background-color: red;
  border-radius: 10px;
}


/* --- DARK MODE OVERRIDES --- */
.dark-mode .main-content-scroll-container,
.dark-mode .content-wrapper {
  scrollbar-color: red #303030;
}

.dark-mode .main-content-scroll-container::-webkit-scrollbar-track,
.dark-mode .content-wrapper::-webkit-scrollbar-track {
  background: #303030;
}
</style>
