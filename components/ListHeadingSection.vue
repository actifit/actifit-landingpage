<template>
  <div class="bg-gradient rounded mb-3 p-2">
    <div class="list-heading-content">
      <img v-if="username" class="list-heading-avatar" :src="avatarSrc" alt="" width="30" height="30"
        aria-hidden="true" @error="useFallbackAvatar">

      <h1 class="font-weight-semibold text-white text-left h4 mb-0" v-html="textualDisplay"></h1>
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
