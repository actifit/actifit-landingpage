<template>
  <div>
    <NavbarBrand />
    <div class="container pt-5 mt-5 pb-5 text-center error-page">
      <i class="fas fa-compass fa-3x text-brand mb-3" aria-hidden="true"></i>
      <h1 class="error-page__title">{{ notFound ? $t('error_page_not_found') : $t('error_page_generic') }}</h1>
      <p class="text-muted">{{ notFound ? $t('error_page_not_found_text') : $t('error_page_generic_text') }}</p>
      <nuxt-link to="/" class="btn btn-brand mt-2">{{ $t('error_page_home') }}</nuxt-link>
    </div>
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  export default {
    props: {
      error: { type: Object, default: () => ({}) }
    },
    components: { NavbarBrand, Footer },
    computed: {
      notFound () {
        return this.error && this.error.statusCode === 404
      }
    },
    head () {
      return {
        title: (this.notFound ? this.$t('error_page_not_found') : this.$t('error_page_generic')) + ' - Actifit.io',
        meta: [{ hid: 'robots', name: 'robots', content: 'noindex' }]
      }
    }
  }
</script>

<style scoped>
  .error-page { min-height: 50vh; }
  .error-page__title { font-size: 1.8rem; font-weight: 700; }
</style>
