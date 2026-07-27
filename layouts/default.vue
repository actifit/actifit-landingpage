<template>
  <nuxt/>
</template>

<script>
import { getCanonicalUrl } from '~/utils/seo'

export default {
  head () {
    const canonicalUrl = getCanonicalUrl(this.$route.path)

    return {
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
