<template>
  <!-- blog listing for single user -->
  <div>
    <NavbarBrand />

    <!-- listing -->
    <div class="container pt-5 mt-5 pb-5">

      <ListHeadingSection :username="username" :textualDisplay="textualTitle"></ListHeadingSection>

      <!--<ChainSelection />-->

      <!-- show spinner while loading -->
      <div class="text-center" v-if="loading">
        <i class="fas fa-spinner fa-spin  fa-3x text-brand"></i>
      </div>

      <!-- most Hive accounts made since 2020 have no Blurt account: the node answers
           "Account not found", which used to leave the spinner running for good -->
      <div class="alert alert-warning blog-load-notice" role="status" v-else-if="noAccountOnChain">
        <span>{{ $t('wallet_no_account_on_chain').replace('_USER_', () => username).replace('_CHAIN_', () => chainLabel(noAccountOnChain)) }}</span>
        <button type="button" class="btn btn-brand btn-sm" v-on:click="switchToHive">{{ $t('switch_to_hive') }}</button>
      </div>
      <div class="alert alert-warning blog-load-notice" role="status" v-else-if="loadFailed">
        <span>{{ $t('posts_load_failed') }}</span>
        <button type="button" class="btn btn-brand btn-sm" v-on:click="loadPosts">{{ $t('afit_balance_retry') }}</button>
      </div>

      <div class="text-center p-3" v-else-if="user && user.account.name == username">
        <a href="#" @click="initiateNewPost" data-toggle="modal" data-target="#editPostModal" :title="$t('Create_post')"
          class="btn btn-brand border">
          {{ $t('Create_post') }}
        </a>
      </div>
            <div class="row">
        <div class="col-12 pb-2 d-flex justify-content-between align-items-center">
          <a href="#" 
             class="btn btn-brand border"
             :title="filterTooltip"
             @click.prevent="hideReblogs = !hideReblogs">
            <i class="fas fa-retweet" :style="{ color: hideReblogs ? '#FFFFFF' : '#008000' }"></i>
          </a>
          
          <div>
            <a :href="'/' + username + '/comments'" class="btn btn-brand border" :title="$t('view_comments')"><i class="far fa-comments"></i></a> 
            <a :href="'/' + username + '/videos'" class="btn btn-brand border" :title="$t('view_videos')"><i class="fas fa-video"></i></a>
          </div>
        </div>
      </div>

      <!-- show listing when loaded -->
      <div v-if="filteredUserPosts.length">
        <div class="row" v-for="iterx in Math.ceil(filteredUserPosts.length / splitFactor)" :key="iterx">
          <div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
            <Post v-if="(iterx - 1) * splitFactor + (itery - 1) < filteredUserPosts.length"
              :post="filteredUserPosts[(iterx - 1) * splitFactor + (itery - 1)]" :displayUsername="username"
              :pstId="(iterx - 1) * splitFactor + (itery - 1)"
			  :key="filteredUserPosts[(iterx - 1) * splitFactor + (itery - 1)].author + '-' + filteredUserPosts[(iterx - 1) * splitFactor + (itery - 1)].permlink" />
          </div>
          <!--<div class="col-md-6 col-lg-12 mb-4" v-if="(iterx - 1) < inlineAds">
			</div>-->
        </div>
      </div>

      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!filteredUserPosts.length && !loading && !noAccountOnChain && !loadFailed">
        {{ username }} {{ $t('error_no_posts') }}
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreUserPostsAvailable && !noAccountOnChain && !loadFailed">
        <a href="#" class="btn btn-brand" @click.prevent="loadMore()">
          {{ $t('load_more') }}
          <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        </a>
      </div>
    </div>

    <Footer />
    <client-only>
      <div>
        <PostModal :post="activePost" @nextPost="nextPost(1)" @prevPost="nextPost(-1)" />
        <EditPostModal />
        <VoteModal />

        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
import { profileImageMeta } from '~/utils/seo'
import NavbarBrand from '~/components/NavbarBrand'
import Post from '~/components/Post'
import Footer from '~/components/Footer'
import PostModal from '~/components/PostModal'
import EditPostModal from '~/components/EditPostModal'
import VoteModal from '~/components/VoteModal'
import ListHeadingSection from '~/components/ListHeadingSection.vue'

import { mapGetters } from 'vuex'
import { isMissingAccountError } from '~/utils/chainErrors'

//import ChainSelection from '~/components/ChainSelection'

export default {
  head() {
    return {
      title: `Blog Posts by ${this.username} - Actifit.io`,
      meta: [
        { hid: 'description', name: 'description', content: `Blog posts by ${this.username} on Actifit — fitness stories, crypto earnings, and community insights on Hive blockchain.` },
        { hid: 'ogdescription', property: 'og:description', content: `Blog posts by ${this.username} on Actifit.` },
        { hid: 'ogtitle', property: 'og:title', content: `Blog Posts by ${this.username} - Actifit.io` },
        ...profileImageMeta(this.username)
      ]
    }
  },
  components: {
    NavbarBrand,
    Post,
    Footer,
    PostModal,
    EditPostModal,
    VoteModal,
    ListHeadingSection
    //DailyActivityChartModal //,
    //ChainSelection
  },
  data() {
    return {
      loading: true, 
      loadingMore: false, 
      splitFactor: 9,
      inlineAds: 2,
      hideReblogs: false,
      minPostThreshold: 20,
      noAccountOnChain: '', // the non-Hive chain selected where this account does not exist
      loadFailed: false,
    }
  },
  watch: {
    async hideReblogs(isHidingReblogs) {
      if (isHidingReblogs) {
        await this.ensureMinimumPosts();
      }
    },
    user: 'fetchUserData',
    bchain: async function (newBchain) {
      // a change during a load is picked up when that load ends (see loadPosts)
      if (this.cur_bchain != newBchain && !this.loading) {
        //only update if changed
        this.cur_bchain = newBchain;
        this.loading = true; // Set loading state
        try {
          await this.$store.dispatch('steemconnect/refreshUser');
        } catch (err) {
          console.error('Refreshing the user on chain switch failed:', err);
        }
        await this.loadPosts();
      }
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    ...mapGetters(['userPosts', 'moreUserPostsAvailable', 'activePost', 'bchain']),
    filteredUserPosts() {
      if (!this.hideReblogs) {
        return this.userPosts;
      }
      return this.userPosts.filter(post => post.author === this.username);
    },
    
    filterTooltip() {
      return this.hideReblogs ? this.$t('show_reblogs') : this.$t('hide_reblogs');
    },

    // get username from url
    username() {
      if (this.$route.params.username.startsWith('@')) {
        return this.$route.params.username.substring(1, this.$route.params.username.length);
      }
      return this.$route.params.username
    },
    textualTitle() {
      return this.username + "'s " + this.$t('Blog') + " <img src='/img/HIVE.png' class='mr-2 token-logo-md' alt=''>";
    }
  },
  methods: {
    
    async fetchPostsRecursively() {
      
      if (this.loadingMore || !this.moreUserPostsAvailable) {
        if (this.userPosts.length > 0) return;
      }

      this.loadingMore = true;
      try {
        await this.$store.dispatch('fetchUserPosts', this.username);
        await this.ensureMinimumPosts();
      } finally {
        this.loadingMore = false;
      }
    },

    // Loads the first page from scratch. The spinner always stops: a node error used to
    // leave it running for good.
    async loadPosts() {
      const chain = this.bchain;
      this.cur_bchain = chain;
      this.loading = true;
      this.noAccountOnChain = '';
      this.loadFailed = false;
      this.$store.commit('setUserPosts', []);
      this.$store.commit('setMoreUserPostsAvailable', false);
      try {
        await this.fetchPostsRecursively();
      } catch (err) {
        this.showLoadError(err, chain);
      } finally {
        this.loading = false;
      }
      // the chain changed during the load (the watcher skips changes while loading):
      // load again for the chain now selected, or the page shows the previous chain's result
      if (this.bchain !== chain) await this.loadPosts();
    },

    // `chain`: the one the failed load was for, which may no longer be the selected one
    showLoadError(err, chain) {
      console.error('Loading the posts failed:', err);
      if (isMissingAccountError(err)) {
        // Blurt answers a missing account with an error; on Hive, hive-js turns it into an
        // empty list (see blogPostsList), so this is Blurt's (or Steem's) case
        if (['BLURT', 'STEEM'].includes(chain)) this.noAccountOnChain = chain;
      } else {
        this.loadFailed = true;
      }
    },

    chainLabel(chain) {
      return { HIVE: 'Hive', BLURT: 'Blurt', STEEM: 'Steem' }[chain] || chain;
    },

    // Same as picking Hive in the user menu; the bchain watcher reloads the posts. The store
    // can already say HIVE while the saved choice said otherwise; then load here.
    async switchToHive() {
      const storeChanges = this.bchain !== 'HIVE';
      localStorage.setItem('cur_bchain', 'HIVE');
      this.$store.commit('setBchain', 'HIVE');
      if (!storeChanges) await this.loadPosts();
    },


    async ensureMinimumPosts() {
      
      if (this.hideReblogs && this.filteredUserPosts.length < this.minPostThreshold && this.moreUserPostsAvailable) {
        
        await this.fetchPostsRecursively();
      }
    },
    
    nextPost(direction) {
      let pstId = this.activePost.pstId;
      let proceed = false;
      if (direction < 0) {
        if (pstId >= 1) {
          pstId -= 1;
          proceed = true;
        }
      } else {
        if (pstId < this.filteredUserPosts.length - 1) {
          pstId += 1;
          proceed = true;
        }
      }
      if (proceed) {
        this.filteredUserPosts[pstId].pstId = pstId;
        this.$store.commit('setActivePost', this.filteredUserPosts[pstId]);
      }
    },
    initiateNewPost($event) {
      $event.preventDefault();
      let newPost = {};
      newPost.isNewPost = true;
      this.$store.commit('setEditPost', newPost);
    },
    async loadMore() {
      try {
        await this.fetchPostsRecursively();
      } catch (err) {
        console.error('Loading more posts failed:', err);
        this.$notify({ group: 'error', text: this.$t('posts_load_failed'), position: 'top center' });
      }
    },
    async fetchUserData() {
      if (typeof this.user != 'undefined' && this.user != null) {

        if (!localStorage.getItem('std_login')) {
          let user_data = await this.$steemconnect.me();
          this.user.account = user_data.account;
        }
        this.$store.dispatch('fetchUserTokens')
        this.$store.dispatch('fetchUserRank')
      }
    },
  },
  async mounted() {
    this.$store.dispatch('steemconnect/login')
    this.fetchUserData();

    let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    this.$store.commit('setBchain', cur_bchain);

    // Initial fetch
    await this.loadPosts();
  }
}
</script>

<style scoped>
.blog-load-notice { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
</style>
