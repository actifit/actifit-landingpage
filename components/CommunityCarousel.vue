<template>
  <!-- blog listing for single user -->
  <div>


    <!-- listing -->
    <!--<h2 class="text-center mb-5">{{ community }} <img src="/img/HIVE.png" class="mr-2 token-logo-md"></h2>-->
    <!--<ChainSelection />-->

    <!-- show spinner while loading -->
    <div class="text-center" v-if="loading">
      <i class="fas fa-spinner fa-spin text-brand"></i>
    </div>


    <div class="cmm-container content" :id="community" v-if="communityPosts.length">

      <client-only>
        <carousel perPage="4" :autoplay="false" :loop="false" :paginationColor="'rgba(255, 255, 255, 0.5)'"
          :paginationActiveColor="'#fff'">
          <slide v-for="(post, index) in communityPosts" :post="post" :key="index">
            <Post :post="post" :displayUsername="username" :pstId="index" minimal="true" class="carousel-card card m-2 "
              explorePost="false" />
          </slide>
        </carousel>
      </client-only>

    </div>

  </div>
</template>

<script>
import Post from '~/components/Post'
//import VoteModal from '~/components/VoteModal'
import { mapGetters } from 'vuex'

export default {
  props: ['community', 'type'],
  components: {
    //NavbarBrand,
    Post,
    //PostModal,
    //EditPostModal,
    //VoteModal,
    //DailyActivityChartModal //,
    //ChainSelection
  },
  data() {
    return {
      loading: true, // initial loading state
      loadingMore: false, // loading state for loading more posts
      communityPosts: [],
      moreCommunityPostsAvailable: false,
      //community: 'hive-163772',//sample community
      //type: 'trending',
      username: '',
      activePost: '',
    }
  },
  watch: {
    //user: 'fetchUserData',
    type: 'reFetchCommunityPosts',
    bchain: async function (newBchain) {
      if (this.cur_bchain != newBchain && !this.loading) {
        //only update if changed
        console.log('user activity change in chain ' + newBchain);
        this.cur_bchain = newBchain;
        await this.$store.dispatch('steemconnect/refreshUser');

        this.reFetchCommunityPosts();
      }
      //this.reload += 1;
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    //...mapGetters(['communityPosts', 'moreCommunityPostsAvailable', 'activePost', 'bchain']),


  },
  methods: {
    nextPost(direction) {
      let pstId = this.activePost.pstId;
      console.log(pstId);
      let proceed = false;
      if (direction < 0) {
        console.log('move back');
        if (pstId >= 1) {
          pstId -= 1;
          proceed = true;
        }
      } else {
        console.log('move front');
        if (pstId < this.communityPosts.length) {
          pstId += 1;
          proceed = true;
        }
      }
      if (proceed) {
        this.communityPosts[pstId].pstId = pstId;
        this.$store.commit('setActivePost', this.communityPosts[pstId]);
      }
    },
    initiateNewPost($event) {
      $event.preventDefault();
      let newPost = {};
      newPost.isNewPost = true;
      this.$store.commit('setEditPost', newPost);
    },
    async loadMore() {
      this.loadingMore = true

      let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      this.$store.commit('setBchain', cur_bchain);
      console.log('dispatch MORE fetching user posts')

      let lastPost = this.communityPosts[this.communityPosts.length - 1];

      let result = await this.$store.dispatch('fetchCommunityPosts', { community: this.community, type: this.type, lastAuth: lastPost.author, lastPerm: lastPost.permlink, returnData: true });

      let newPosts = result.posts;
      this.moreCommunityPostsAvailable = result.morePostsAvailable;
      if (Array.isArray(newPosts) && newPosts.length > 0) {
        this.communityPosts = this.communityPosts.concat(newPosts);
      }
      this.loadingMore = false
    },

    async reFetchCommunityPosts() {
      this.loading = true
      let result = await this.$store.dispatch('fetchCommunityPosts', { community: this.community, type: this.type, returnData: true });
      this.communityPosts = result.posts;
      this.moreCommunityPostsAvailable = result.morePostsAvailable;
      this.loading = false
    },
    scrollContent(community, horizontal, vertical) {
      var content = document.querySelector('#' + community);
      content.scrollBy({
        top: vertical,
        left: horizontal,
        behavior: 'smooth'
      });
    }
  },
  async mounted() {
    // login
    this.$store.dispatch('steemconnect/login')
    //this.fetchUserData();

    // fetch posts

    let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    this.$store.commit('setBchain', cur_bchain);
    //this.$store.dispatch('steemconnect/login')
    this.reFetchCommunityPosts();
  }
}
</script>
<style>
.cmm-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  min-height: 100px;
}

.VueCarousel-slide {
  border: none !important;
}

.carousel-card {
  width: 320px;
  height: 480px;
  /* Slightly taller cards */
  border-radius: 12px;
  /* More rounded corners */
  background-color: #fff;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  /* Softer shadow */
  transition: all 0.3s ease-in-out;
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #eee;
  /* Light border */
  padding: 10px;
}

.post {
  display: inline-block !important;
  min-height: 100px;
  background-color: #faebd7;
}

.moreblock {
  display: inline-block;
  vertical-align: top;
}

/* Container for the scrollable content */
.scroll-container {
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  /* border: 1px solid #ccc; Just for visual reference, you can remove this */
}

/* Content that can be scrolled */
.content {
  /*display: inline-block;*/
}
</style>
