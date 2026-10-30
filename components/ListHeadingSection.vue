<template>
  <div class="bg-gradient rounded mb-3 p-2">
    <div class="list-heading-content">
      <img v-if="username" class="list-heading-avatar" :src="avatarSrc" alt="" width="30" height="30"
        aria-hidden="true" @error="useFallbackAvatar">

      <!-- $sanitize is LOAD-BEARING, not decoration. textualDisplay is built from
           route input by six callers - pages/search.vue passes $route.query.q, and
           five more pass $route.params.username - so an unescaped v-html here is a
           REFLECTED XSS that needs nothing but a crafted link: no login, no chain
           write, and it fires on the SSR response as well as the client.
           It stays v-html rather than {{ }} because four callers legitimately pass
           chain-logo image and info-link markup; $sanitize keeps those (a/b/i/strong/em/br/img/span,
           allow-listed classes, /img/ images, local links only) and drops everything else,
           on both the DOMPurify and sanitize-html paths.
           The cleaner end state is a named slot for that markup plus {{ }} here. -->
      <h1 class="font-weight-semibold text-white text-left h4 mb-0" v-html="$sanitize(textualDisplay)"></h1>
    </div>
  </div>
</template>
<script>

export default {
  props: {
    username: {
      type: String,
      default: '',
      required: false
    },
    textualDisplay: {
      type:String,
      required: true
    }
  },
  data (){
    return {
      profImgUrl: process.env.hiveImgUrl,
      avatarLoadFailed: false,
    }
  },
  computed: {
    avatarSrc () {
      if (this.avatarLoadFailed) {
        return '/img/actifit_logo_32.png'
      }
      return `${this.profImgUrl}/u/${encodeURIComponent(this.username)}/avatar`
    }
  },
  watch: {
    username () {
      this.avatarLoadFailed = false
    }
  },
  methods: {
    useFallbackAvatar () {
      this.avatarLoadFailed = true
    }
  }
}
</script>
<style scoped>
.list-heading-content {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.list-heading-avatar {
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  min-width: 30px;
  min-height: 30px;
  max-width: 30px;
  max-height: 30px;
  padding: 0;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  display: block;
  object-fit: cover;
  border-radius: 50%;
  border: solid 1px #ddd;
}

.list-heading-content h1 {
  min-width: 0;
}
</style>
