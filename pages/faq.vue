<template>
  <div>
    <NavbarBrand />
	
	<section class="intro" id="content">
		<div class="container pt-5 mt-5 pb-5">

	  
			<h1 class="pt-5 mb-3 text-capitalize text-center headline"><span class="text-brand">{{ $t('faq.headline') }}</span></h1>
			
			
			<div v-for="(quest, idx) in faqNumbers" class="row lead mb-4 p-3 w-100" :key="quest">
				<span class="font-weight-bold">{{idx + 1}}.&nbsp;</span><div v-html="$t('faq.q'+quest)" class="font-weight-bold"></div>
				<div v-html="$t('faq.a'+quest)" class="w-100"></div>
			</div>
      
		</div>
	  
    </section>
	
    <Footer />
  </div>
</template>

<script>
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'

  import { mapGetters } from 'vuex'

  export default {
	head () {
		return {
		  title: `FAQ - Actifit.io`,
		  meta: [
			{ hid: 'description', name: 'description', content: `Frequently asked questions about Actifit — how to earn AFIT tokens, track steps, use the market, and get rewarded for your daily activity on Hive blockchain.` },
			{ hid: 'ogdescription', name: 'og:description', property: 'og:description', content: `Frequently asked questions about Actifit — how to earn AFIT tokens, track steps, and get rewarded for daily activity.` },
			{ hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'FAQ - Actifit.io' }
		  ]
		}
	},
    components: {
      NavbarBrand,
      Footer,
    },
	data () {
      return {
		
	  }
	},
    computed: {
	  //question numbers present in the locale (gaps are retired questions, e.g. the
	  //funds-password ones), shown numbered 1..n so the list has no holes
	  faqNumbers () {
		const nums = [];
		for (let i = 1; i <= 100; i++) {
		  if (this.$t('faq.q' + i) != 'faq.q' + i) nums.push(i);
		}
		return nums;
	  }
    },
    async mounted () {
	  
	  // login
      await this.$store.dispatch('steemconnect/login')
      this.$store.dispatch('fetchUserTokens')
      this.$store.dispatch('fetchTransactions')
	  this.$store.dispatch('fetchUserRank')
	  this.$store.dispatch('fetchReferrals')
	  
    },
	methods: {
	  
	},
  }
</script>

<style>

</style>
