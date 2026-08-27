<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
      <ListHeadingSection :textualDisplay="$t('Arena_Title')" />
      <p class="text-center text-muted mb-5 arena-subtitle">{{ $t('Arena_Subtitle') }}</p>

      <div v-if="loading" class="col-12 text-center py-5" role="status" aria-label="Loading challenges">
        <i class="fas fa-spin fa-spinner fa-2x text-brand" aria-hidden="true"></i>
      </div>

      <div v-else-if="!arenaChallenges.length" class="col-12 text-center text-muted py-5">
        <i class="fas fa-trophy fa-2x mb-3 d-block text-muted" aria-hidden="true"></i>
        {{ $t('Arena_No_Challenges') }}
      </div>

      <div v-else class="row">
        <div class="col-md-6 col-lg-4 mb-4 d-flex" v-for="ch in arenaChallenges" :key="ch.id">
          <nuxt-link :to="`/arena/${ch.id}`" class="arena-card">
            <div class="arena-card__media">
              <img :src="artUrl(ch)" :alt="ch.title || humanize(ch.type)" loading="lazy" />
              <span class="arena-card__type">{{ humanize(ch.type) }}</span>
              <span class="arena-card__state" :class="'is-' + ch.state">{{ humanize(ch.state) }}</span>
            </div>

            <div class="arena-card__body">
              <h3 class="arena-card__title">{{ ch.title || ch.id }}</h3>
              <p class="arena-card__tagline">{{ cat(ch).tagline }}</p>

              <ul class="arena-card__meta">
                <li><i class="fas fa-sync-alt" aria-hidden="true"></i> {{ cat(ch).recurrence }}</li>
                <li v-if="duration(ch)"><i class="fas fa-hourglass-half" aria-hidden="true"></i> {{ duration(ch) }}</li>
                <li v-if="ends(ch)"><i class="fas fa-flag-checkered" aria-hidden="true"></i> {{ $t('Arena_Ends') }} {{ ends(ch) }}</li>
              </ul>

              <p class="arena-card__prizes"><i class="fas fa-trophy" aria-hidden="true"></i> {{ cat(ch).prizes }}</p>

              <span class="arena-card__cta">{{ $t('Arena_Participate') }} <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </nuxt-link>
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
  import { catalogFor, artUrl, formatDuration, formatDate, humanize } from '~/utils/arenaCatalog'

  export default {
    head () {
      return {
        title: 'The Arena — Fitness Challenges | Actifit.io',
        meta: [
          { hid: 'description', name: 'description', content: 'Discover and join fitness challenges, leagues and seasons on Actifit — earn rewards for staying active.' },
          { hid: 'ogtitle', name: 'og:title', property: 'og:title', content: 'The Arena — Actifit Fitness Challenges' },
          { hid: 'ogdescription', name: 'og:description', content: 'Discover and join fitness challenges, leagues and seasons on Actifit.' },
          { hid: 'ogimage', name: 'og:image', property: 'og:image', content: 'https://actifit.io/img/arena/step-league.webp' }
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
      humanize,
      artUrl,
      cat (ch) {
        return catalogFor(ch)
      },
      duration (ch) {
        return formatDuration(ch && ch.window)
      },
      ends (ch) {
        return formatDate(ch && ch.window && ch.window.end)
      }
    }
  }
</script>

<style scoped>
  .arena-subtitle {
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
    font-size: 1.05rem;
  }

  .arena-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 10px rgba(20, 20, 40, 0.05);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }
  .arena-card:hover,
  .arena-card:focus {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(227, 19, 55, 0.16);
    border-color: #f4c2cc;
    text-decoration: none;
    color: inherit;
  }

  .arena-card__media {
    position: relative;
    aspect-ratio: 16 / 9;
    background: #fafafa;
    overflow: hidden;
  }
  .arena-card__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .arena-card__type,
  .arena-card__state {
    position: absolute;
    top: 10px;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 4px 9px;
    border-radius: 20px;
    backdrop-filter: blur(2px);
  }
  .arena-card__type {
    left: 10px;
    background: rgba(227, 19, 55, 0.92);
    color: #fff;
  }
  .arena-card__state {
    right: 10px;
    background: rgba(255, 255, 255, 0.92);
    color: #444;
  }
  .arena-card__state.is-open { color: #1a8f4c; }
  .arena-card__state.is-resolved,
  .arena-card__state.is-closed { color: #8a8a8a; }

  .arena-card__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 18px 18px 20px;
  }
  .arena-card__title {
    font-size: 1.22rem;
    font-weight: 700;
    margin: 0 0 6px;
    line-height: 1.25;
    color: #1f2430;
  }
  .arena-card__tagline {
    font-size: 0.92rem;
    color: #5c6270;
    margin: 0 0 14px;
    line-height: 1.45;
  }

  .arena-card__meta {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 0.8rem;
    color: #6b7280;
  }
  .arena-card__meta li i {
    color: #e31337;
    margin-right: 4px;
  }

  .arena-card__prizes {
    font-size: 0.85rem;
    color: #3a3f4b;
    background: #fdf1f3;
    border-radius: 8px;
    padding: 9px 11px;
    margin: 0 0 16px;
    line-height: 1.4;
  }
  .arena-card__prizes i {
    color: #e0a100;
    margin-right: 5px;
  }

  .arena-card__cta {
    margin-top: auto;
    align-self: flex-start;
    font-weight: 700;
    font-size: 0.9rem;
    color: #e31337;
  }
  .arena-card__cta i {
    transition: transform 0.18s ease;
  }
  .arena-card:hover .arena-card__cta i {
    transform: translateX(4px);
  }
</style>
