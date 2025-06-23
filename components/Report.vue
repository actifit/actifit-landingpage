<template>
  <!-- single report item for activity pages -->
  <div>
    <div class="card report">
      <h6 class="mb-0 text-center report-title">
        <a :href="report.url" target="_blank">
          {{ truncateString(report.title) }}
          <i class="fas fa-external-link-alt"></i>
        </a>
        <span v-if="this.afitReward" :title="$t('Rewarded_report')" class="check-tooltip"><i
            class="fas fa-check p-2"></i></span>
      </h6>
      <div class="report-body">
        <div class="row pb-1">
          <div class="col-8">
            <UserHoverCard :username="report.author" />
          </div>
          <div class="col-4 text-right">
            <small class="text-muted" :title="date">{{ $getTimeDifference(report.created) }}</small>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <!-- MODIFICATION: This container now perfectly manages the loader and image visibility -->
            <div class="image-carousel-container">
              <!-- Loader is absolutely positioned and shown when imageLoading is true -->
              <div v-if="imageLoading" class="image-loader-container">
                <img src="/img/loader.gif" class="image-loader" alt="Loading..." />
              </div>
              
              <!-- Image is hidden (not removed) while loading to prevent layout jump -->
              <a href="#" :style="{ visibility: imageLoading ? 'hidden' : 'visible' }" class="text-brand" @click="report.rptId = rptId; $store.commit('setActiveReport', report)"
                data-toggle="modal" data-target="#reportModal" :title="$t('read_more_small')">
                <!-- The :key is the critical fix for the same-image bug -->
                <img v-if="allImages.length > 0" :key="currentImageSrc" :src="currentImageSrc" :alt="report.title" class="report-image" @load="onImageLoad" @error="onImageError">
              </a>

              <template v-if="allImages.length > 1 && !imageLoading">
                <div class="carousel-arrow left" @click.prevent="prevImage">
                  <i class="fas fa-chevron-left"></i>
                </div>
                <div class="carousel-arrow right" @click.prevent="nextImage">
                  <i class="fas fa-chevron-right"></i>
                </div>
                <div class="image-counter">
                  {{ currentImageIndex + 1 }} / {{ allImages.length }}
                </div>
                <div class="carousel-bullets">
                  <span v-for="(img, index) in allImages" :key="index" class="carousel-bullet"
                    :class="{ 'active': index === currentImageIndex }" @click.prevent="goToImage(index)"></span>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <a href="#" class="" @click="report.rptId = rptId; $store.commit('setActiveReport', report)"
              data-toggle="modal" data-target="#reportModal" :title="$t('read_more_small')">
              <div ref="report_body" id="report_body" style="display: none">
                <vue-remarkable :source="renderSnippet(report.body)"
                  :options="{ 'html': true, 'breaks': true, 'typographer': true, 'xhtmlOut': true }"></vue-remarkable>
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
              data-target="#voteModal" v-if="user && userVotedThisPost() == true" :title="$t('votes')">
              <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
            </a>
            <a href="#" @click.prevent="votePrompt($event)" data-toggle="modal" data-target="#voteModal" v-else
              :title="$t('votes')">
              <i class="far fa-thumbs-up"></i> {{ getVoteCount }}
            </a>
            <i class="far fa-comments ml-2" :title="$t('comments')"></i> {{ report.children }}
            <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, report)"
              v-if="user && report.author != this.user.account.name" :title="$t('reblog')"></i>
          </div>
          <div class="col-6 text-right">

            <social-sharing :url="'https://actifit.io/@' + report.author + '/' + report.permlink" :title="report.title"
              :description="socialSharingDesc" :quote="socialSharingQuote" :hashtags="hashtags"
              twitter-user="actifit_fitness" inline-template>
              <span class="share-links-actifit">
                <network network="twitter">
                  <i class="fab fa-x-twitter text-brand" title="X (twitter)"></i>
                </network>
              </span>
            </social-sharing>
            <a href="#" class="text-brand pr-2" @click="report.rptId = rptId; $store.commit('setActiveReport', report)"
              data-toggle="modal" data-target="#dailyActivityChartModal" :title="$t('Activity_chart')">
              <i class="fas fa-chart-line"></i>
            </a>
            <a href="#" class="text-brand" @click="$store.commit('setEditPost', report)" data-toggle="modal"
              data-target="#editPostModal" v-if="user && report.author === user.account.name" :title="$t('Edit_note')">
              <i class="fas fa-edit p-2"></i>
            </a>
            <a href="#" class="text-brand" @click="report.rptId = rptId; $store.commit('setActiveReport', report)"
              data-toggle="modal" data-target="#reportModal" :title="$t('read_more_small')">
              <i class="fas fa-book-open"></i>
            </a>

          </div>
        </div>
        <div class="row details mt-2">
          <div class="col-6 payoutCustomDisplay">
            <img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain == 'STEEM'">
            <img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain == 'HIVE'">
            <span v-if="postPaid()">
              <span class="m-1" :title="$t('author_payout')">
                <i class="fa-solid fa-user"></i>
                {{ paidValue() }}
              </span>
              <span class="m-1" :title="$t('voters_payout')">
                <i class="fa-solid fa-users"></i>
                {{ report.curator_payout_value }}
              </span>
              <i class="fa-solid fa-check text-green text-bold"></i>
            </span>
            <span v-else>
              <span class="text-brand text-bold">{{ report.pending_payout_value.replace('SBD', '') }}</span>
              <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
            </span>
            <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()" @click="toggleTooltip()"
              @mouseenter="showTooltip()" @mouseleave="hideTooltip()" @touchstart="showTooltip()"
              @touchend="hideTooltip()">
              <i class="fas fa-user-pen"><sup>{{ report.beneficiaries.length }}</sup></i>
              <div class="custom-tooltip" v-if="isTooltipVisible">{{ beneficiariesDisplay() }}</div>
            </span>

          </div>
          <div class="col-6 text-right">

            <img src="/img/actifit_logo.png" class="mr-1 currency-logo-small" :title="$t('afit_payout')">{{ afitReward
            }} {{ $t('AFIT_Token') }}

          </div>
        </div>
        <div class="row details mt-2 text-brand full-afit-txt" v-if="this.meta.full_afit_pay == 'on'">
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
              <a :href="this.meta.charity[0]" target="_blank">@{{ this.meta.charity[0] }}</a>
            </small>
          </div>
        </div>
        <div class="row details mt-2 text-brand full-afit-txt" v-if="isUserModerator">
          <div class="col-6 text-brand">
            <div v-if="appType == 'iOS'"><i class="fab fa-apple"></i> iOS</div>
            <div v-else-if="appType == 'Android'"><i class="fab fa-android"></i> Android</div>
            <div class="mt-2">App: {{ appVersion }}</div>
          </div>
          <div class="col-6" style="text-align: right">
            <span v-if="trackingDevice == 'Fitbit Tracking'">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Fitbit_logo.svg" width="60px">
              <div class="mt-2">{{ trackingDevice }}</div>
            </span>
            <span v-else-if="trackingDevice == 'healthapp'">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Health_icon_iOS_12.png" width="60px">
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
import UserHoverCard from './UserHoverCard.vue'
import { mapGetters } from 'vuex'
import steem from 'steem'
import hive from '@hiveio/hive-js'
import SocialSharing from 'vue-social-sharing'
import vueRemarkable from 'vue-remarkable';
import sanitize from 'sanitize-html'
// NOTE: The separate image-load-cache.js is no longer needed with this robust internal logic.

export default {
  props: ['report', 'rptId'],
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['postToVote', 'newlyVotedPosts', 'moderators']),
    date() {
      let date = new Date(this.report.created);
      let minutes = date.getMinutes();
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    },
    meta() {
      try {
        return JSON.parse(this.report.json_metadata)
      } catch (err) {
        return {};
      }
    },
    steps() { return this.meta.step_count ? this.meta.step_count[0] : '' },
    type() { return this.meta.activity_type ? this.meta.activity_type.join(', ') : '' },
    getVoteCount() { return Array.isArray(this.report.active_votes) ? this.report.active_votes.length : 0 },
    isUserModerator() { return this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator') },
    currentImageSrc() {
      if (this.allImages.length > 0) {
        return this.allImages[this.currentImageIndex];
      }
      return '';
    },
    // ... other computed properties
  },
  data: function () {
    return {
      afitReward: '', userRank: '', fullAFITReward: '', postUpvoted: false, cur_bchain: 'HIVE',
      profImgUrl: process.env.hiveImgUrl, socialSharingTitle: process.env.socialSharingTitle,
      socialSharingDesc: process.env.socialSharingDesc, socialSharingQuote: process.env.socialSharingQuote,
      hashtags: process.env.socialSharingHashtags, isTooltipVisible: false, imageError: false,
      allImages: [], currentImageIndex: 0, imageLoading: true,
    }
  },
  components: {
    SocialSharing, vueRemarkable, UserHoverCard
  },
  watch: {
    postUpvoted: 'updatePostData',
  },
  methods: {
    onImageLoad() {
      this.imageLoading = false;
    },
    onImageError() {
      this.imageLoading = false;
      this.handleImageError(event, this.meta);
    },
    setupImages() {
      const metaImages = this.meta.image;
      let initialImages = [];
      if (Array.isArray(metaImages)) {
        initialImages = metaImages;
      } else if (metaImages) {
        initialImages = [metaImages];
      }
      if (initialImages.length === 0) {
        this.allImages = [];
        this.imageLoading = false;
        return;
      }
      const userImages = initialImages.filter(url => {
          if (typeof url !== 'string') return false;
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
          if (!isImage) return false;
          const isBrandingImage = /actifit_logo|ACTIVITY|https:\/\/cdn\.steemitimages\.com\/DQmQqfpSmcQtfrHAtzfBtVccXwUL9vKNgZJ2j93m8WNjizw\/l5\.png|https:\/\/cdn\.steemitimages\.com\/DQmXv9QWiAYiLCSr3sKxVzUJVrgin3ZZWM2CExEo3fd5GUS\/sep3\.png|https:\/\/images\.hive\.blog\/DQmQJeGKQVsYFDFnHxgTHyNdrZxQmjLSJxz1wLB5HJDaZV3\/Dise%C3%B1o_sin_t%C3%ADtulo__6_-removebg-preview\.png/i.test(url);
          if (isBrandingImage) return false;
          return true;
      });
      // FIX: Show all unique images, do not slice the last one.
      this.allImages = [...new Set(userImages)];
      this.currentImageIndex = 0;
      if (this.allImages.length === 0) {
        this.imageLoading = false;
      }
    },
    nextImage() {
      if (this.allImages.length > 1) {
        this.imageLoading = true; // FIX: Show loader on navigation
        this.currentImageIndex = (this.currentImageIndex + 1) % this.allImages.length;
      }
    },
    prevImage() {
      if (this.allImages.length > 1) {
        this.imageLoading = true; // FIX: Show loader on navigation
        this.currentImageIndex = (this.currentImageIndex - 1 + this.allImages.length) % this.allImages.length;
      }
    },
    goToImage(index) {
      if (this.currentImageIndex !== index) {
        this.imageLoading = true; // FIX: Show loader on navigation
        this.currentImageIndex = index;
      }
    },
    handleImageError(event, meta){
      if(!this.imageError){
        this.imageError = true;
        const image = event.target;
        let src = this.$fetchHiveFmtPostImage(meta);
        image.src = src;
        event.target.onerror = null;
      }
    },
    postPaid() {
      let last_payout = new Date(this.report.last_payout);
      let cashout_time = new Date(this.report.cashout_time);
      return last_payout.getTime() > cashout_time.getTime();
    },
    hasImage() {
      return this.meta && Array.isArray(this.meta.image) && this.meta.image.length > 0;
    },
    fixedContent() { return this.$refs["report_body"] ? this.$refs["report_body"].innerHTML.replace(/<[^>]+>/g, '') : "" },
    renderSnippet(content) { return this.truncateString(this.$cleanBody(content, true), 150) },
    truncateString(str) { return str && str.length > 70 ? str.substring(0, 67) + "..." : str },
    userVotedThisPost() {
      let curUser = this.user.account.name;
      this.postUpvoted = this.report.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.report.post_id) !== -1;
      return this.postUpvoted;
    },
    votePrompt(e) {
      this.$store.commit('setPostToVote', this.report)
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
      if (this.report.total_payout_value) return this.report.total_payout_value;
      if (this.report.author_payout_value) return this.report.author_payout_value;
    },
    // ... all other methods
  },
  mounted() {
    this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    this.profImgUrl = this.cur_bchain === 'STEEM' ? process.env.steemImgUrl : process.env.hiveImgUrl;
    this.$store.dispatch('fetchModerators');
    // ... other fetches
    this.setupImages();
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
.full-afit-txt { font-style: italic; }
.check-tooltip { color: white; }
.report-title { min-height: 60px; }
.card { box-shadow: 3px 3px 3px rgb(255 0 0 / 40%); }
.report-image { width: 100%; height: 150px; object-fit: cover; }
.payoutCustomDisplay { line-height: 1.5; }
.image-carousel-container { position: relative; overflow: hidden; height: 150px; background-color: #f0f0f0; }
.image-loader-container { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
.image-loader { width: 40px; height: 40px; }
.carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); background-color: rgba(0, 0, 0, 0.5); color: white; padding: 8px; cursor: pointer; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; user-select: none; transition: background-color 0.2s; z-index: 2; }
.carousel-arrow:hover { background-color: rgba(0, 0, 0, 0.8); }
.carousel-arrow.left { left: 10px; }
.carousel-arrow.right { right: 10px; }
.image-counter { position: absolute; bottom: 8px; right: 8px; background-color: rgba(0, 0, 0, 0.7); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; z-index: 2; }
.carousel-bullets { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 2; }
.carousel-bullet { width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.6); cursor: pointer; transition: background-color 0.2s; }
.carousel-bullet.active { background-color: #fff; }
</style>