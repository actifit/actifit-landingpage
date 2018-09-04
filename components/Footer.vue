<template>
  <!-- Footer used on all pages -->
  <div class="footer bg-light">
    <div class="container py-5">
      <div class="text-center social-links mb-4">
        <a href="https://discord.gg/aHtcA6r" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-discord"></i></a>
        <a href="https://www.facebook.com/Actifit.fitness/" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-facebook"></i></a>
        <a href="https://www.twitter.com/Actifit_fitness" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-twitter"></i></a>
        <a href="https://www.instagram.com/actifit.fitness/" target="_blank" class="d-inline-block mx-3"><i class="fab fa-2x fa-instagram"></i></a>
      </div>
      <div class="row">
        <div class="col text-center">
          <small class="text-muted">&copy; Copyright Actifit {{ currentYear }}</small>|
		      <small class="text-muted"><nuxt-link to="/privacy-policy">Privacy Policy</nuxt-link></small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    computed: {
      currentYear () {
        return (new Date()).getFullYear()
      }
    }
  }
</script>
