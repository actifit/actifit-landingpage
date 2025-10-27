<template>
  <div>
    <NavbarBrand />
    <div class="container pt-5 mt-5 pb-5">
      <ListHeadingSection :textualDisplay="'Search Results for &quot;' + searchQuery + '&quot;'"></ListHeadingSection>
      <div v-if="loading" class="text-center">
        <i class="fas fa-spinner fa-spin fa-3x text-brand"></i>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="posts.length > 0">
        <div class="row" v-for="iterx in Math.ceil(posts.length / splitFactor)" :key="iterx">
          <div v-for="itery in splitFactor" :key="itery" class="col-md-6 col-lg-4 mb-4">
            <Post v-if="(iterx - 1) * splitFactor + (itery - 1) < posts.length"
              :post="posts[(iterx - 1) * splitFactor + (itery - 1)]"
              :displayUsername="posts[(iterx - 1) * splitFactor + (itery - 1)].author"
              :pstId="(iterx - 1) * splitFactor + (itery - 1)" />
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="text-center text-muted">
        No results found.
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
import axios from 'axios';
import hive from '@hiveio/hive-js';
import NavbarBrand from '~/components/NavbarBrand';
import Post from '~/components/Post';
import Footer from '~/components/Footer';
import PostModal from '~/components/PostModal';
import EditPostModal from '~/components/EditPostModal';
import VoteModal from '~/components/VoteModal';
import ListHeadingSection from '~/components/ListHeadingSection.vue';
import { mapGetters } from 'vuex';

hive.api.setOptions({ url: process.env.hiveApiNode });

export default {
  head() {
    return {
      title: `Search Results for ${this.searchQuery} - Actifit.io`,
    };
  },
  components: {
    NavbarBrand,
    Post,
    Footer,
    PostModal,
    EditPostModal,
    VoteModal,
    ListHeadingSection,
  },
  data() {
    return {
      searchQuery: '',
      posts: [],
      loading: false,
      error: null,
      splitFactor: 9,
    };
  },
  computed: {
    ...mapGetters(['activePost']),
  },
  async created() {
    this.searchQuery = this.$route.query.q;
    if (this.searchQuery) {
      await this.fetchSearchResults();
    }
  },
  methods: {
    async fetchSearchResults() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('https://api.syncad.com/hivesense-api/posts/search', {
          params: {
            q: this.searchQuery,
          },
        });

        const postStubs = response.data;
        const postPromises = postStubs.map(stub => 
          new Promise((resolve) => {
            hive.api.getContent(stub.author, stub.permlink, (err, result) => {
              if (err) {
                console.error(`Error fetching post: ${stub.author}/${stub.permlink}`, err);
                resolve(null); // Resolve with null on error
              } else {
                resolve(result);
              }
            });
          })
        );

        const results = await Promise.all(postPromises);
        this.posts = results.filter(post => post !== null); // Filter out nulls
      } catch (err) {
        this.error = 'Error fetching search results.';
        console.error(err);
      } finally {
        this.loading = false;
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
        if (pstId < this.posts.length - 1) {
          pstId += 1;
          proceed = true;
        }
      }
      if (proceed) {
        this.posts[pstId].pstId = pstId;
        this.$store.commit('setActivePost', this.posts[pstId]);
      }
    },
  },
  watch: {
    '$route.query.q': function(newQuery) {
      this.searchQuery = newQuery;
      this.fetchSearchResults();
    }
  }
};
</script>