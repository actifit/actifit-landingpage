<template>
  <!-- single report item for activity pages -->
  <div>
    <div class="card report">
      <h6 class="mb-0 text-center report-title">
        <a :href="report.url" target="_blank">
          {{ truncateString(report.title, 70) }}
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
            <!-- START: Carousel Functionality -->
            <div v-if="!imageLoadFailed" class="image-carousel-container" :key="imageGeneration">
              <div v-if="imageLoading" class="image-loader-container">
                <i class="fas fa-spinner fa-spin text-brand"></i>
              </div>
              <a href="#" :style="{ visibility: imageLoading ? 'hidden' : 'visible' }" class="text-brand" @click="report.rptId = rptId; $store.commit('setActiveReport', report)"
                data-toggle="modal" data-target="#reportModal" :title="$t('read_more_small')">
                <img :key="currentImageSrc" :src="currentImageSrc" :alt="report.title" class="report-image" @load="onImageLoad" @error="onImageError">
              </a>
              <template v-if="allImages.length > 1">
                <div class="carousel-arrow left" @click.prevent="prevImage">
                  <i class="fas fa-chevron-left"></i>
                </div>
                <div class="carousel-arrow right" @click.prevent="nextImage">
                  <i class="fas fa-chevron-right"></i>
                </div>
                <template v-if="!imageLoading">
                    <div class="image-counter">
                      {{ currentImageIndex + 1 }} / {{ allImages.length }}
                    </div>
                    <div class="carousel-bullets">
                      <span v-for="(img, index) in allImages" :key="index" class="carousel-bullet"
                        :class="{ 'active': index === currentImageIndex }" @click.prevent="goToImage(index)"></span>
                    </div>
                </template>
              </template>
            </div>
            <!-- END: Carousel Functionality -->
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <a href="#" class="" @click="report.rptId = rptId; $store.commit('setActiveReport', report)"
              data-toggle="modal" data-target="#reportModal" :title="$t('read_more_small')">
              <div>
                <span>{{ renderSnippet(report.body, 150) }}</span>
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
        <!-- adding section to display additional FULL Payout option -->
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
import SocialSharing from 'vue-social-sharing'
import { commonCardMixin } from '~/plugins/commonCardMixin.js'

export default {
  mixins: [commonCardMixin],
  props: ['report', 'rptId'],
  components: {
    SocialSharing,
    UserHoverCard
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['postToVote', 'newlyVotedPosts', 'moderators']),
    // Overrides the placeholder in the mixin
    cardData () {
      return this.report
    },
    // Component-specific computed properties
    date () {
      const date = new Date(this.report.created)
      const minutes = date.getMinutes()
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    },
    steps () {
      return this.meta.step_count ? this.meta.step_count[0] : ''
    },
    type () {
      return this.meta.activity_type ? this.meta.activity_type.join(', ') : ''
    },
    appType () {
      return this.meta.appType
    },
    appVersion () {
      return this.meta.app
    },
    actUserID () {
      return Array.isArray(this.meta.actifitUserID) && this.meta.actifitUserID.length > 0
        ? this.meta.actifitUserID[0]
        : this.meta.actifitUserID
    },
    trackingDevice () {
      return Array.isArray(this.meta.dataTrackingSource) && this.meta.dataTrackingSource.length > 0
        ? this.meta.dataTrackingSource[0]
        : this.meta.dataTrackingSource
    }
  },
  async mounted () {
    this.initializeCard()

    fetch(process.env.actiAppUrl + 'getPostFullAFITPayReward?user=' + this.report.author + '&url=' + this.report.url)
      .then(res => res.json())
      .then(json => { this.fullAFITReward = json.token_count })
      .catch(e => console.error('Error fetching full AFIT reward:', e))
  }
}
</script>

<style lang="sass" scoped>
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
<style scoped>
.full-afit-txt { font-style: italic; }
.check-tooltip { color: white; }
.report-title { min-height: 60px; }
.card { box-shadow: 3px 3px 3px rgb(255 0 0 / 40%); }
.report-image { width: 100%; height: 150px; object-fit: cover; }
.payoutCustomDisplay { line-height: 1.5; }
.image-carousel-container { position: relative; overflow: hidden; height: 150px; background-color: #f0f0f0; }
.image-loader-container { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; position: absolute; top: 0; left: 0; z-index: 1; }
.carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); background-color: rgba(0, 0, 0, 0.5); color: white; padding: 8px; cursor: pointer; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; user-select: none; z-index: 2; }
.carousel-arrow:hover { background-color: rgba(0, 0, 0, 0.8); }
.carousel-arrow.left { left: 10px; }
.carousel-arrow.right { right: 10px; }
.image-counter { position: absolute; bottom: 8px; right: 8px; background-color: rgba(0, 0, 0, 0.7); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: bold; z-index: 2; }
.carousel-bullets { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 2; }
.carousel-bullet { width: 8px; height: 8px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.6); cursor: pointer; }
.carousel-bullet.active { background-color: #fff; }
</style>