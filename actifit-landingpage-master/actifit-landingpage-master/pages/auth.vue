<template>
  <div class="py-5 px-2">
    <!-- header -->
    <div class="pb-md-4 text-center">
      <img src="/img/icon.png" alt="Actifit" />
      <h3 class="mt-3 text-brand title">Actifit</h3>
      <h5 class="font-italic text-brand slogan">Rewarding Your Everyday Activity</h5>
    </div>

    <h5 class="pt-4 text-center">You will be redirected in a moment...</h5>

    <!-- show spinner until we get redirected -->
    <div class="text-center mt-4">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
    </div>
  </div>
</template>

<script>
  export default {
    async mounted () {
      let accessToken = this.$route.query['access_token']
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        await this.$store.dispatch('steemconnect/login')
        this.$router.push('/')
      }
    }
  }
</script>
