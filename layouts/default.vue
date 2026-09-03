<template>
  <nuxt/>
</template>

<script>
import { getCanonicalUrl } from '~/utils/seo'

export default {
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
