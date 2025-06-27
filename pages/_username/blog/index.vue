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

      <div class="text-center p-3" v-else-if="user && user.account.name == username">
        <a href="#" @click="initiateNewPost" data-toggle="modal" data-target="#editPostModal" :title="$t('Create_post')"
          class="btn btn-brand border">
          {{ $t('Create_post') }}
        </a>
      </div>
            <div class="row">
        <div class="col-12 pb-2 d-flex justify-content-between align-items-center">
          <i class="fas fa-retweet p-2" 
             style="cursor: pointer;"
             :class="hideReblogs ? 'text-brand' : 'text-muted'"
             :title="$t('Toggle Reblogs') || 'Toggle Reblogs'"
             @click.prevent="hideReblogs = !hideReblogs"></i>
          
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
              :pstId="(iterx - 1) * splitFactor + (itery - 1)" />
          </div>
          <!--<div class="col-md-6 col-lg-12 mb-4" v-if="(iterx - 1) < inlineAds">
				<client-only>
				<adsbygoogle ad-slot="7038919015" ad-format="fluid" ad-layout-key="-fb+5w+4e-db+86"/>
				</client-only>
			</div>-->
        </div>
      </div>

      <!-- or no content message when no posts found -->
      <div class="text-center text-muted" v-if="!filteredUserPosts.length && !loading">
        {{ username }} {{ $t('error_no_posts') }}
      </div>

      <!-- show load more button if there are more posts available -->
      <div class="text-center" v-if="moreUserPostsAvailable">
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
import NavbarBrand from '~/components/NavbarBrand'
import Post from '~/components/Post'
import Footer from '~/components/Footer'
import PostModal from '~/components/PostModal'
import EditPostModal from '~/components/EditPostModal'
import VoteModal from '~/components/VoteModal'
import ListHeadingSection from '~/components/ListHeadingSection.vue'

import { mapGetters } from 'vuex'

//import ChainSelection from '~/components/ChainSelection'

export default {
  head() {
    return {
      title: `Blog Posts by ${this.username} - Actifit.io`,
      meta: [
        { hid: 'description', name: 'description', content: `Listing of blog posts by ${this.username}` },
        { hid: 'ogdescription', name: 'og:description', content: `Listing of blog posts by ${this.username}` }
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
      if (this.cur_bchain != newBchain && !this.loading) {
        //only update if changed
        this.cur_bchain = newBchain;
        this.loading = true; // Set loading state
        await this.$store.dispatch('steemconnect/refreshUser');

        this.$store.commit('setUserPosts', [])

        this.$store.commit('setMoreUserPostsAvailable', false)

        await this.fetchPostsRecursively(); 
        
        this.loading = false
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

    // get username from url
    username() {
      if (this.$route.params.username.startsWith('@')) {
        return this.$route.params.username.substring(1, this.$route.params.username.length);
      }
      return this.$route.params.username
    },
    textualTitle() {
      return this.username + "'s " + this.$t('Blog') + " <img src='/img/HIVE.png' class='mr-2 token-logo-md'>";
    }
  },
  methods: {
    
    async fetchPostsRecursively() {
      
      if (this.loadingMore || !this.moreUserPostsAvailable) {
        if (this.userPosts.length > 0) return;
      }

      this.loadingMore = true;

      await this.$store.dispatch('fetchUserPosts', this.username);

      
      await this.ensureMinimumPosts();

      this.loadingMore = false;
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
      await this.fetchPostsRecursively();
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

    this.$store.commit('setUserPosts', [])
    this.$store.commit('setMoreUserPostsAvailable', false)

    // Initial fetch
    await this.fetchPostsRecursively();

    this.loading = false
  }
}
</script>