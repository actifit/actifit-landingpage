<template>
  <!-- single post item for activity pages -->
  <div>
    <div :class="[isOnlyPost ? 'card post single' : { 'card-pinned': isPostPinned, 'card post': isStandardPost }, { 'is-comment': post.parent_author }]">
      <CardHeader :title="post.title" :link="buildLink">
        <span v-if="isPostPinned" :title="$t('pinned_post')"> <i class="fas fa-thumbtack text-warning"></i></span>
      </CardHeader>

      <div class="post-body p-1">
        <div class="row" v-if="post.parent_author">
          <div class="col-12">
            <span class="d-flex justify-content-end align-items-center">
              <div>
                <span v-if="isPostReblog"><i class="far fa-share-square text-brand" /></span>
                <i class="fas fa-reply text-brand"></i> 
                <UserHoverCard :username="post.parent_author" />
              </div>
            </span>
          </div>
        </div>
        <div class="row">
          <div class="col-1 align-content-around" v-if="isPostReblog"><i class="far fa-share-square text-brand" /></div>
          <div :class="isPostReblog ? 'col-6 post-reblog' : 'col-8'">
            <UserHoverCard :username="post.author" />
          </div>
          <div class="col-4 text-right m-auto">
            <small class="text-muted d-block" :title="date">{{ $getTimeDifference(this.post.created) }}</small>
          </div>
        </div>

        <CardBody

          :cardData="post"
          modalTarget="#postModal"
          :snippet="bodySnippet"
          :imageLoadFailed="imageLoadFailed"
          :imageLoading="imageLoading"
          :imageGeneration="imageGeneration"
          :currentImageSrc="currentImageSrc"
          :allImages="allImages"
          :currentImageIndex="currentImageIndex"
          @open-modal="post.pstId = pstId; $store.commit('setActivePost', post)"
          @image-load="onImageLoad"
          @image-error="onImageError"
          @next-image="nextImage"
          @prev-image="prevImage"
          @go-to-image="goToImage"
        />
      </div>

      <div class="post-footer mt-auto p-1">
        <CardActions
          :cardData="post"
          modalTarget="#postModal"
          :user="user"
          :voteCount="getVoteCount"
          :hasVoted="postUpvoted"
          @vote-prompt="votePrompt($event)"
          @reblog="$reblog(user, post)"
          @open-modal="post.pstId = pstId; $store.commit('setActivePost', post)"
        >
          <template #extra-actions>
            <social-sharing :url="'https://actifit.io/@' + post.author + '/' + post.permlink" :title="post.title" :description="socialSharingDesc" :quote="socialSharingQuote" :hashtags="hashtags" twitter-user="actifit_fitness" inline-template>
              <span class="share-links-actifit">
                <network network="twitter"><i class="fab fa-x-twitter text-brand" title="twitter"></i></network>
              </span>
            </social-sharing>
            <a href="#" class="text-brand" @click="$store.commit('setEditPost', post)" data-toggle="modal" data-target="#editPostModal" v-if="user && post.author === user.account.name" :title="$t('Edit_note')"><i class="fas fa-edit"></i></a>
            <a href="#" class="text-brand" @click="post.pstId = pstId; $store.commit('setActivePost', post)" data-toggle="modal" data-target="#postModal" :title="$t('read_more_small')"><i class="fas fa-book-open"></i></a>
          </template>
        </CardActions>

        <!-- Payout info remains here as it is unique -->
        <div class="row details mt-2">
          <div class="col-12">
            <img src="/img/STEEM.png" class="mr-1 currency-logo-small" v-if="cur_bchain == 'STEEM'">
            <img src="/img/HIVE.png" class="mr-1 currency-logo-small" v-else-if="cur_bchain == 'HIVE'">
            <span v-if="postPaid()">
              <span class="m-1" :title="$t('author_payout')"><i class="fa-solid fa-user"></i> {{ paidValue() }}</span>
              <span class="m-1" :title="$t('voters_payout')"><i class="fa-solid fa-users"></i> {{ post.curator_payout_value }}</span>
              <i class="fa-solid fa-check text-green text-bold"></i>
            </span>
            <span v-else>
              <span class="text-brand text-bold">{{ post.pending_payout_value.replace('SBD', '') }}</span>
              <i class="fa-solid fa-hourglass-half text-brand m-1" :title="$t('hive_payouts_wait')"></i>
            </span>
            <span v-if="hasBeneficiaries()" :title="beneficiariesDisplay()" @click="toggleTooltip()" @mouseenter="showTooltip()" @mouseleave="hideTooltip()" @touchstart="showTooltip()" @touchend="hideTooltip()">
              <i class="fas fa-user-pen"><sup>{{ post.beneficiaries.length }}</sup></i>
              <div class="custom-tooltip" v-if="isTooltipVisible">{{ beneficiariesDisplay() }}</div>
            </span>
          </div>
          <div class="col-6 text-right" v-if="afitReward != ''">
            <small><img src="/img/actifit_logo.png" class="mr-1 currency-logo-small">{{ afitReward }} {{ $t('AFIT_Token') }}</small>
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

// Import new components
import CardHeader from './CardHeader.vue'
import CardBody from './CardBody.vue'
import CardActions from './CardActions.vue'

export default {
  mixins: [commonCardMixin],
  props: ['post', 'displayUsername', 'pstId', 'explorePost'],
  components: {
    SocialSharing,
    UserHoverCard,
    CardHeader,
    CardBody,
    CardActions
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['moderators', 'userPosts']),
    cardData () { return this.post },
    // START: ADDED COMPUTED PROPERTY
    // This explicitly defines the body snippet for post.vue, overriding the mixin
    // and ensuring the correct truncation length is used without conflict.
    bodySnippet () {
      if (!this.post || !this.post.body) return ''
      // Uses the truncateString method from the mixin, which is what we want.
      let postContent = this.$cleanBody(this.post.body, true);
      postContent = this.truncateString(postContent, 150);
      return postContent.replace(/<[^>]+>/g, '');
    },
    // END: ADDED COMPUTED PROPERTY
    isOnlyPost () { return this.userPosts && this.userPosts.length === 1 },
    buildLink () { return '/' + this.post.author + '/' + this.post.permlink },
    isPostReblog () { return this.displayUsername && this.displayUsername !== this.post.author },
    isPostPinned () { return this.post.stats ? this.post.stats.is_pinned : false },
    isStandardPost () { return !this.explorePost },
    date () {
      const date = new Date(this.post.created)
      const minutes = date.getMinutes()
      return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
    }
  },
  mounted () {
    console.log('display user:',this.displayUsername);
    this.$nextTick(() => { this.initializeCard() })
  }
}
</script>

<style lang="sass" scoped>
/* Scoped SASS for elements remaining in Post.vue */
.post
  height: 100%
  a
    color: #333
    &:hover
      text-decoration: none
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
/* Scoped CSS for elements remaining in Post.vue */
.post-title { min-height: 60px; } /* Kept for backward compatibility, but CardHeader has its own */
.card { box-shadow: 3px 3px 3px rgb(255 0 0 / 40%); overflow: hidden; }
.card { min-height: 400px; }
/* When rendering a comment (post.parent_author present) don't force the large min-height */
.card.is-comment { min-height: auto; }
.card-pinned { box-shadow: 3px 3px 3px rgba(204, 204, 0, 0.4); overflow: hidden; }
.single { min-width: 17em; }
.post { vertical-align: top; }
.post-reblog { font-style:italic; }
</style>
