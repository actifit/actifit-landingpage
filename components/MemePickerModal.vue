<template>
  <div class="modal fade" id="memePickerModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="far fa-grin-squint-tears"></i> {{ $t('fitness_memes') }}
          </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fa-2x text-brand"></i>
          </div>
          <div v-else-if="memePosts.length === 0" class="text-center py-4 text-muted">
            {{ $t('no_memes_found') }}
          </div>
          <div v-else class="row">
            <div v-for="post in memePosts" :key="post.author + post.permlink" class="col-md-4 col-sm-6 mb-3">
              <div class="card h-100 meme-card">
                <img
                  :src="getPostImage(post)"
                  :alt="post.title"
                  class="card-img-top meme-thumb"
                  @error="onImgError($event)"
                  referrerpolicy="no-referrer"
                />
                <div class="card-body p-2">
                  <p class="card-text small text-muted mb-1">@{{ post.author }}</p>
                  <p class="card-text small mb-2 meme-title">{{ post.title }}</p>
                  <button
                    class="btn btn-brand btn-sm btn-block"
                    @click="insertMeme(post)"
                  >
                    <i class="fas fa-plus"></i> {{ $t('insert') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-between">
          <button
            v-if="moreMemesAvailable"
            class="btn btn-outline-secondary btn-sm"
            :disabled="loadingMore"
            @click="loadMore"
          >
            <i class="fas fa-spinner fa-spin" v-if="loadingMore"></i>
            {{ $t('load_more') }}
          </button>
          <span v-else></span>
          <a
            href="https://decentmemes.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-brand btn-sm"
          >
            <i class="fas fa-external-link-alt"></i> {{ $t('create_meme_cta') }}
          </a>
        </div>
      </div>
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
    insertMeme (post) {
      const imgUrl = this.getPostImage(post)
      this.$emit('insert-meme', imgUrl)
      if (typeof $ !== 'undefined') {
        $('#memePickerModal').modal('hide')
      }
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
.meme-thumb {
  height: 160px;
  object-fit: cover;
  background: #f0f0f0;
}
.meme-card {
  border: 1px solid #eee;
  transition: box-shadow 0.15s;
}
.meme-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.meme-title {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.btn-outline-brand {
  color: #ff112d;
  border-color: #ff112d;
}
.btn-outline-brand:hover {
  background-color: #ff112d;
  color: #fff;
}
</style>
