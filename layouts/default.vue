<template>
  <div>
    <!-- Shown on every page until dismissed. It has to live here rather than in the
         login components, which tear themselves down on success. -->
    <SecurityNoticeBanner />
    <nuxt/>
  </div>
</template>

<script>
import { getCanonicalUrl } from '~/utils/seo'
import SecurityNoticeBanner from '~/components/SecurityNoticeBanner.vue'

export default {
  components: { SecurityNoticeBanner },
  head () {
    const canonicalUrl = getCanonicalUrl(this.$route.path)

    return {
      // Apply the active locale's writing direction to <html> (Trello #162).
      // @nuxtjs/i18n knows each locale's `dir` (ar = rtl) but doesn't set it
      // itself; without this every Arabic page renders LTR.
      htmlAttrs: {
        lang: (this.$i18n && this.$i18n.locale) || 'en',
        dir: (this.$i18n && this.$i18n.localeProperties && this.$i18n.localeProperties.dir) || 'ltr'
      },
      link: [
        { hid: 'canonical', rel: 'canonical', href: canonicalUrl }
      ],
      meta: [
        { hid: 'url', name: 'og:url', property: 'og:url', content: canonicalUrl }
      ]
    }
  }
}
</script>
