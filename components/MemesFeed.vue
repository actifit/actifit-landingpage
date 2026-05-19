<template>
  <div class="memes-feed">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">{{ $t('fitness_memes') }}</h4>
      <a
        href="https://decentmemes.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-brand btn-sm"
      >
        <i class="fas fa-external-link-alt"></i> {{ $t('create_meme_cta') }}
      </a>
    </div>

    <div v-if="loading" class="text-center py-5">
      <i class="fas fa-spinner fa-spin fa-3x text-brand"></i>
    </div>

    <div v-else-if="memePosts.length === 0" class="text-center py-4 text-muted">
      {{ $t('no_memes_found') }}
    </div>

    <div v-else class="row">
      <div
        v-for="post in memePosts"
        :key="post.author + post.permlink"
        class="col-lg-3 col-md-4 col-sm-6 mb-4"
      >
        <div class="card meme-feed-card h-100">
          <a
            :href="'https://peakd.com/@' + post.author + '/' + post.permlink"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="getPostImage(post)"
              :alt="post.title"
              class="card-img-top meme-feed-thumb"
              @error="onImgError($event)"
              referrerpolicy="no-referrer"
            />
          </a>
          <div class="card-body p-2">
            <p class="card-text small text-muted mb-1">@{{ post.author }}</p>
            <p class="card-text small meme-feed-title">{{ post.title }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="moreMemesAvailable" class="text-center mt-2 mb-4">
      <button
        class="btn btn-outline-secondary"
        :disabled="loadingMore"
        @click="loadMore"
      >
        <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
        {{ $t('load_more') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

const FALLBACK_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

export default {
  data () {
    return {
      loading: false,
      loadingMore: false,
    }
  },
  computed: {
    ...mapState(['memePosts', 'moreMemesAvailable'])
  },
  mounted () {
    if (this.memePosts.length === 0) {
      this.loading = true
      this.$store.dispatch('fetchMemePosts').finally(() => {
        this.loading = false
      })
    }
  },
  methods: {
    getPostImage (post) {
      try {
        const meta = typeof post.json_metadata === 'string'
          ? JSON.parse(post.json_metadata)
          : post.json_metadata || {}
        if (meta.image && meta.image.length > 0) return meta.image[0]
      } catch (_) {}
      const match = post.body && post.body.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)
      return match ? match[1] : FALLBACK_IMG
    },
    onImgError (event) {
      event.target.src = FALLBACK_IMG
    },
    loadMore () {
      this.loadingMore = true
      this.$store.dispatch('fetchMemePosts').finally(() => {
        this.loadingMore = false
      })
    }
  }
}
</script>

<style scoped>
.meme-feed-thumb {
  height: 180px;
  object-fit: cover;
  background: #f0f0f0;
}
.meme-feed-card {
  border: 1px solid #eee;
  transition: box-shadow 0.15s;
}
.meme-feed-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.meme-feed-title {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
