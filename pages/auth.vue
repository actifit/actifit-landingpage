<template>
  <div class="py-5">
    <div class="pb-md-4 text-center">
      <img src="/img/icon.png" alt="Actifit" />
      <h1 class="mt-3 text-brand title">Actifit Fitness Tracker</h1>
      <h3 class="font-italic text-brand slogan">Rewarding Fitness Activity</h3>
    </div>
    <h3 class="pt-4 text-center">You will be redirected in a moment...</h3>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        loading: true
      }
    },
    async mounted () {
      let accessToken = this.$route.query['access_token']
      if (accessToken) {
        localStorage.setItem('access_token', accessToken)
        await this.$store.dispatch('login')
        this.$router.push('/')
      }
    }
  }
</script>
