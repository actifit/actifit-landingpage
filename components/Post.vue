<template>
  <!-- single post item for activity pages -->
  <div>
    <div :class="[isOnlyPost ? 'card post single' : { 'card-pinned': isPostPinned, 'card post': isStandardPost }]">
      <h6 class="mb-0 text-center post-title">
        <a :href="buildLink" target="_blank">
          {{ truncateString(post.title, 70) }}
          <i class="fas fa-external-link-alt"></i>

          <span v-if="isPostPinned" :title="$t('pinned_post')"> <i
              class="fas fa-thumbtack text-warning"></i></span>
        </a>
      </h6>

      <div class="post-body  p-1">
        <div class="row" v-if="post.parent_author" >
          <!-- if this is a comment, display link to higher level comment/post -->
          <div class="col-12">
            <span class="d-flex justify-content-end align-items-center">
              <div class="">
                <span v-if="isPostReblog"><i class="far fa-share-square text-brand" /></span>
                <i class="fas fa-reply text-brand"></i> 
                <UserHoverCard :username="post.parent_author" />
              </div>
            </span>
          </div>
        </div>
        <div class="row">
          <div class="col-1 align-content-around" v-if="isPostReblog"><i class="far fa-share-square text-brand" /></div>
          <div :class="isPostReblog?'col-6 post-reblog':'col-8'">
            <UserHoverCard :username="post.author" />
          </div>
          <div class="col-4 text-right m-auto">
            <small class="text-muted d-block" :title="date">{{ $getTimeDifference(this.post.created) }}</small>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <!-- START: Carousel Functionality Merged Here -->
            <div v-if="!imageLoadFailed" class="image-carousel-container" :key="imageGeneration">
              <!-- Loader is absolutely positioned and shown when imageLoading is true -->
              <div v-if="imageLoading" class="image-loader-container">
                <i class="fas fa-spinner fa-spin text-brand" style="display:flex; justify-content: center;text-align: center; margin-bottom: 3rem; margin-top: 2rem;"></i>
              </div>
              
              <!-- Image is hidden (not removed) while loading to prevent layout jump -->
              <a href="#" :style="{ visibility: imageLoading ? 'hidden' : 'visible' }" class="text-brand" @click="post.pstId = pstId; $store.commit('setActivePost', post)"
                data-toggle="modal" data-target="#postModal" :title="$t('read_more_small')">
                <!-- The :key is the critical fix for the same-image bug -->
                <img
                  :src="currentImageSrc"
                  :key="currentImageSrc"
                  :alt="report.title"
                  class="report-image"
                  @load="onImageLoad"
                  @error="onImageError"
                />
              </a>

              <!-- Arrows are visible even during load -->
              <template v-if="allImages.length > 1">
                <div class="carousel-arrow left" @click.prevent="prevImage">
                  <i class="fas fa-chevron-left"></i>
                </div>
                <div class="carousel-arrow right" @click.prevent="nextImage">
                  <i class="fas fa-chevron-right"></i>
                </div>
                <!-- Counter and bullets only appear when loading is finished -->
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
            <!-- END: Carousel Functionality Merged -->
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <a href="#" class="" @click="post.pstId = pstId; $store.commit('setActivePost', post)" data-toggle="modal"
              data-target="#postModal" :title="$t('read_more_small')">
              <div>
                <span>{{ renderSnippet(post.body, 150) }}</span>
                <i class="fas fa-external-link-alt"></i>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div class="post-footer mt-auto p-1">
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
              <i class="far fa-comments ml-2" :title="$t('comments')"></i> {{ post.children }}
              <i class="far fa-share-square ml-2" @click.prevent="$reblog(user, post)"
                v-if="user && post.author != this.user.account.name" :title="$t('reblog')"></i>
            </div>
            <div class="col-6 text-right">
              <social-sharing :url="'https://actifit.io/@' + post.author + '/' + post.permlink" :title="post.title"
                :description="socialSharingDesc" :quote="socialSharingQuote" :hashtags="hashtags"
                twitter-user="actifit_fitness" inline-template>
                <span class="share-links-actifit">
                  <network network="twitter">
                    <i class="fab fa-x-twitter text-brand" title="twitter"></i>
                  </network>
                </span>
              </social-sharing>
              <a href="#" class="text-brand" @click="$store.commit('setEditPost', post)" data-toggle="modal"
                data-target="#editPostModal" v-if="user && post.author === user.account.name" :title="$t('Edit_note')">
                <i class="fas fa-edit"></i>
              </a>
              <a href="#" class="text-brand" @click="post.pstId = pstId; $store.commit('setActivePost', post)"
                data-toggle="modal" data-target="#postModal" :title="$t('read_more_small')">
                <i class="fas fa-book-open"></i>
              </a>
            </div>
          </div>
          <div class="row details mt-2">
            <div class="col-12">

              <img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain == 'STEEM'">
              <img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain == 'HIVE'">
              <span v-if="postPaid()">
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
                <span class="text-brand text-bold">{{ post.pending_payout_value.replace('SBD', '') }}</span>
                <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
              </span>
              <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()" @click="toggleTooltip()"
                @mouseenter="showTooltip()" @mouseleave="hideTooltip()" @touchstart="showTooltip()"
                @touchend="hideTooltip()">
                <i class="fas fa-user-pen"><sup>{{ post.beneficiaries.length }}</sup></i>
                <div class="custom-tooltip" v-if="isTooltipVisible">{{ beneficiariesDisplay() }}</div>
              </span>



            </div>
            <div class="col-6 text-right" v-if="afitReward != ''">
              <small>
                <img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}
              </small>
            </div>
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
  props: ['post', 'displayUsername', 'pstId', 'explorePost'],
  components: {
    SocialSharing,
    UserHoverCard
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['postToVote', 'newlyVotedPosts', 'moderators', 'userPosts']),
    // Overrides the placeholder in the mixin
    cardData () {
      return this.post
    },
    // Component-specific computed properties
    isOnlyPost () {
      return this.userPosts && this.userPosts.length === 1
    },
    buildLink () {
      return '/' + this.post.author + '/' + this.post.permlink
    },
    isPostReblog () {
      return this.displayUsername !== this.post.author
    },
    isPostPinned () {
      return this.post.stats ? this.post.stats.is_pinned : false
    },
    isStandardPost () {
      return !this.explorePost
    },
    date () {
      const date = new Date(this.post.created)
      const minutes = date.getMinutes()
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    }
  },
  async mounted () {
    this.initializeCard()
  }
}
</script>

<style lang="sass" scoped>
  .post
    height: 100%
    h6
      background: #ff112d
      padding: 8px 10px
      a
        color: #fff
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
.post-title { min-height: 60px; }
.card { box-shadow: 3px 3px 3px rgb(255 0 0 / 40%); overflow: hidden; min-height: 400px; }
.card-pinned { box-shadow: 3px 3px 3px rgba(204, 204, 0, 0.4); overflow: hidden; }
.single { min-width: 17em; }
.post-image { width: 100%; height: 150px; object-fit: cover; }
.post h6 a, #post_body_render { text-wrap: balance; }
.post { vertical-align: top; }
.post-reblog{ font-style:italic; }
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