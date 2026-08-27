<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
      <ListHeadingSection :textualDisplay="$t('Arena_Title')" />
      <p class="text-center text-muted mb-4">{{ $t('Arena_Subtitle') }}</p>

      <div v-if="loading" class="col-12 text-center" role="status" aria-label="Loading challenges"><i class="fas fa-spin fa-spinner text-brand" aria-hidden="true"></i></div>

      <div v-else-if="!arenaChallenges.length" class="col-12 text-center text-muted py-5">
        {{ $t('Arena_No_Challenges') }}
      </div>

      <div v-else class="row">
        <div class="col-md-6 col-lg-4 mb-4" v-for="ch in arenaChallenges" :key="ch.id">
          <div class="card border-actifit h-100">
            <div class="card-body">
              <div class="mb-2">
                <span class="badge badge-brand text-uppercase">{{ humanize(ch.type) }}</span>
                <span class="badge badge-light ml-1 text-uppercase">{{ humanize(ch.state) }}</span>
              </div>
              <h5 class="card-title">{{ ch.title || ch.id }}</h5>
              <p v-if="ch.window && ch.window.end" class="small text-muted mb-0">
                {{ $t('Arena_Ends') }}: {{ formatDate(ch.window.end) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  import ListHeadingSection from '~/components/ListHeadingSection'

  export default {
    head () {
      return {
        title: 'The Arena — Fitness Challenges | Actifit.io',
        meta: [
          { hid: 'description', name: 'description', content: 'Discover and spectate fitness challenges, leagues and seasons on Actifit — earn rewards for staying active.' },
          { hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'The Arena — Actifit Fitness Challenges' },
          { hid: 'ogdescription', name: 'og:description', content: 'Discover and spectate fitness challenges, leagues and seasons on Actifit.' }
        ]
      }
    },
    components: {
      NavbarBrand,
      Footer,
      ListHeadingSection
    },
    data () {
      return {
        loading: true
      }
    },
    computed: {
      ...mapGetters(['arenaChallenges'])
    },
    async mounted () {
      try {
        await this.$store.dispatch('fetchArenaChallenges', { state: 'open' })
      } catch (e) {
        // read API not yet live / empty — render the empty state
      } finally {
        this.loading = false
      }
    },
    methods: {
      // Machine enum → readable label (league_fixture → LEAGUE FIXTURE via CSS uppercase).
      humanize (s) {
        return typeof s === 'string' ? s.replace(/_/g, ' ') : s
      },
      formatDate (iso) {
        const d = new Date(iso)
        return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
      }
    }
  }
</script>
