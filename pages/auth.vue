<template>
  <div class="py-5 px-2">
    <!-- header -->
    <div class="pb-md-4 text-center">
      <img src="/img/icon.png" alt="Actifit" />
      <h3 class="mt-3 text-brand title">Actifit</h3>
      <h5 class="font-italic text-brand slogan">It Pays to be Fit</h5>
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
    head () {
      return {
        title: 'Auth - Actifit.io',
        meta: [
          { name: 'robots', content: 'noindex, nofollow' }
        ]
      }
    },
    async mounted () {
      const accessToken = this.$route.query['access_token']
      if (!accessToken) {
        this.$router.push('/login')
        return
      }
      // Validate the token against the SC API before persisting it.
      // This prevents arbitrary tokens supplied via URL from being written
      // to localStorage (session fixation / phishing vector).
      this.$steemconnect.setAccessToken(accessToken)
      try {
        await new Promise((resolve, reject) => {
          this.$steemconnect.me((err, user) => {
            if (err) reject(err)
            else resolve(user)
          })
        })
        localStorage.setItem('access_token', accessToken)
        await this.$store.dispatch('steemconnect/login')
        this.$router.push('/')
      } catch (err) {
        this.$steemconnect.setAccessToken(null)
        this.$router.push('/login')
      }
    }
  }
</script>
