<template>
  <div>
    <NavbarBrand />
    <div v-if="errorDisplay==''" class="container pt-5 mt-5 pb-5 text-brand text-center">
      <p>{{ $t('Redirecting') }}</p>
    </div>
    <div v-else class="container pt-5 mt-5 pb-5" >
	  <div class="mb-3 text-center">
		{{ errorDisplay }}
	  </div>
    </div>
	<Footer />
  </div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import Footer from '~/components/Footer'

export default {
  data () {
		return {
			errorDisplay: '',
		}
  },
  components: {
	  NavbarBrand,
	  Footer
  },
  // Redirect the community-prefixed post URL (/{tag}/@user/permlink) to the canonical
  // /@user/permlink. Doing it in asyncData means Nuxt issues a real 302 on SSR and a proper
  // client-side redirect on SPA navigation. The previous created()+$router.push pattern could
  // hang on "Redirecting..." — SSR only rendered the placeholder, and the follow-up client push
  // sometimes aborted (redundant/duplicated navigation), leaving the page stuck.
  asyncData ({ params, redirect, app }) {
	if (params.tag && params.username && params.permlink) {
	  // localePath keeps the active locale prefix (e.g. /de) — a raw path drops it and forces English
	  redirect(app.localePath('/' + params.username + '/' + params.permlink))
	}
  },
  created () {
	// Only reached when a param is missing (asyncData did not redirect).
	if (!(this.$route.params.tag && this.$route.params.username && this.$route.params.permlink)) {
		this.errorDisplay = this.$t('error_post_not_found');
	}
  }
}
</script>
