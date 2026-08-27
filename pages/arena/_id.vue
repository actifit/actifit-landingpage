<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
      <nuxt-link to="/arena" class="arena-back">
        <i class="fas fa-arrow-left" aria-hidden="true"></i> {{ $t('Arena_Back') }}
      </nuxt-link>

      <div v-if="notFound || !ch" class="text-center text-muted py-5">
        <i class="fas fa-trophy fa-2x mb-3 d-block text-muted" aria-hidden="true"></i>
        {{ $t('Arena_Not_Found') }}
      </div>

      <div v-else class="arena-detail">
        <!-- Hero -->
        <div class="arena-hero">
          <img :src="artUrl(ch)" :alt="ch.title || humanize(ch.type)" class="arena-hero__img" />
          <div class="arena-hero__overlay">
            <div class="arena-hero__badges">
              <span class="badge-pill is-type">{{ humanize(ch.type) }}</span>
              <span class="badge-pill is-recur">{{ cat.recurrence }}</span>
              <span class="badge-pill is-state" :class="'state-' + ch.state">{{ humanize(ch.state) }}</span>
            </div>
            <h1 class="arena-hero__title">{{ ch.title || ch.id }}</h1>
            <p class="arena-hero__tagline">{{ cat.tagline }}</p>
          </div>
        </div>

        <div class="row mt-4">
          <!-- Main column -->
          <div class="col-lg-8">
            <!-- Key facts -->
            <ul class="arena-facts">
              <li>
                <span class="arena-facts__k"><i class="fas fa-sync-alt" aria-hidden="true"></i> {{ $t('Arena_Recurrence') }}</span>
                <span class="arena-facts__v">{{ cat.recurrence }}</span>
              </li>
              <li v-if="duration">
                <span class="arena-facts__k"><i class="fas fa-hourglass-half" aria-hidden="true"></i> {{ $t('Arena_Length') }}</span>
                <span class="arena-facts__v">{{ duration }}</span>
              </li>
              <li v-if="starts">
                <span class="arena-facts__k"><i class="fas fa-play" aria-hidden="true"></i> {{ $t('Arena_Starts') }}</span>
                <span class="arena-facts__v">{{ starts }}</span>
              </li>
              <li v-if="ends">
                <span class="arena-facts__k"><i class="fas fa-flag-checkered" aria-hidden="true"></i> {{ $t('Arena_Ends') }}</span>
                <span class="arena-facts__v">{{ ends }}</span>
              </li>
              <li>
                <span class="arena-facts__k"><i class="fas fa-bullseye" aria-hidden="true"></i> {{ $t('Arena_Scored_By') }}</span>
                <span class="arena-facts__v">{{ scoredBy }}</span>
              </li>
            </ul>

            <!-- How it works -->
            <section class="arena-block">
              <h2 class="arena-block__h">{{ $t('Arena_How_It_Works') }}</h2>
              <p>{{ cat.howItWorks }}</p>
            </section>

            <!-- Prizes -->
            <section class="arena-block">
              <h2 class="arena-block__h">{{ $t('Arena_Prizes') }}</h2>
              <p class="arena-prizes"><i class="fas fa-trophy" aria-hidden="true"></i> {{ cat.prizes }}</p>
              <p class="arena-fairplay"><i class="fas fa-shield-alt" aria-hidden="true"></i> {{ $t('Arena_Fair_Play') }}</p>
            </section>

            <!-- Standings -->
            <section class="arena-block">
              <h2 class="arena-block__h">{{ $t('Arena_Standings') }}</h2>
              <div v-if="rows.length" class="arena-standings-wrap">
                <table class="arena-standings">
                  <thead>
                    <tr>
                      <th class="c-rank">{{ $t('Arena_Rank') }}</th>
                      <th>{{ $t('Arena_Athlete') }}</th>
                      <th class="c-score">{{ $t('Arena_Score') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="r in rows" :key="r.entity" :class="{ 'is-top': r.rank <= 3 }">
                      <td class="c-rank">{{ r.rank }}</td>
                      <td>{{ r.entity }}</td>
                      <td class="c-score">{{ r.score }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="text-muted">{{ $t('Arena_No_Standings') }}</p>
            </section>
          </div>

          <!-- Sidebar: participate -->
          <div class="col-lg-4">
            <div class="arena-participate">
              <h2 class="arena-participate__h">{{ $t('Arena_Participate') }}</h2>
              <p class="arena-participate__p">{{ cat.howItWorks }}</p>
              <nuxt-link :to="`/signup?redirect=/arena/${ch.id}`" class="arena-participate__cta">
                {{ $t('Arena_Participate') }} <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </nuxt-link>
              <p class="arena-participate__note"><i class="fas fa-shield-alt" aria-hidden="true"></i> {{ $t('Arena_Fair_Play') }}</p>
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
  import { catalogFor, artUrl, formatDuration, formatDate, scoredByLabel, humanize } from '~/utils/arenaCatalog'

  export default {
    head () {
      const ch = this.ch
      const title = ch ? `${ch.title || ch.id} — The Arena | Actifit.io` : 'The Arena | Actifit.io'
      const desc = ch ? this.cat.tagline : 'A fitness challenge on Actifit.'
      return {
        title,
        meta: [
          { hid: 'description', name: 'description', content: desc },
          { hid: 'ogtitle', name: 'og:title', property: 'og:title', content: ch ? (ch.title || ch.id) : 'The Arena' },
          { hid: 'ogdescription', name: 'og:description', content: desc },
          { hid: 'ogimage', name: 'og:image', property: 'og:image', content: 'https://actifit.io' + artUrl(ch) }
        ]
      }
    },
    components: {
      NavbarBrand,
      Footer
    },
    // Fetch server-side so head() emits per-challenge title/description/og:image
    // for crawlers and social shares, and so navigating between challenges always
    // refetches (asyncData re-runs on route change; mounted would not). Standings
    // are reset first so a fetch error can never leak the previous challenge's board.
    async asyncData ({ store, params }) {
      store.commit('setArenaStandings', null)
      let notFound = false
      try {
        await store.dispatch('fetchArenaChallenge', params.id)
      } catch (e) {
        store.commit('setArenaChallenge', null)
        notFound = true
      }
      if (!notFound) {
        // standings are optional — absence is a normal (empty) state
        try {
          await store.dispatch('fetchArenaStandings', params.id)
        } catch (e) {
          store.commit('setArenaStandings', null)
        }
      }
      return { notFound }
    },
    data () {
      return {
        notFound: false
      }
    },
    computed: {
      ...mapGetters(['arenaChallenge', 'arenaStandings']),
      ch () {
        return this.arenaChallenge && this.arenaChallenge.challenge
      },
      cat () {
        return catalogFor(this.ch)
      },
      rows () {
        return (this.arenaStandings && Array.isArray(this.arenaStandings.rows)) ? this.arenaStandings.rows : []
      },
      duration () {
        return formatDuration(this.ch && this.ch.window)
      },
      starts () {
        return formatDate(this.ch && this.ch.window && this.ch.window.start)
      },
      ends () {
        return formatDate(this.ch && this.ch.window && this.ch.window.end)
      },
      scoredBy () {
        return scoredByLabel(this.ch)
      }
    },
    methods: {
      artUrl,
      humanize
    }
  }
</script>

<style scoped>
  .arena-back {
    display: inline-block;
    margin-bottom: 18px;
    font-weight: 600;
    color: #e31337;
    text-decoration: none;
  }
  .arena-back:hover,
  .arena-back:focus-visible { text-decoration: underline; }
  .arena-back:focus-visible,
  .arena-participate__cta:focus-visible {
    outline: 2px solid #e31337;
    outline-offset: 2px;
  }

  /* Hero */
  .arena-hero {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    min-height: 260px;
  }
  .arena-hero__img {
    width: 100%;
    height: 100%;
    max-height: 380px;
    object-fit: cover;
    display: block;
  }
  .arena-hero__overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 26px 26px 22px;
    background: linear-gradient(to top, rgba(20, 16, 22, 0.82) 0%, rgba(20, 16, 22, 0.45) 45%, rgba(20, 16, 22, 0) 100%);
    color: #fff;
  }
  .arena-hero__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }
  .badge-pill {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }
  .badge-pill.is-type { background: #e31337; color: #fff; }
  .badge-pill.is-recur { background: rgba(255, 255, 255, 0.92); color: #333; }
  .badge-pill.is-state { background: rgba(255, 255, 255, 0.92); color: #444; }
  .badge-pill.is-state.state-open { color: #1a8f4c; }
  .arena-hero__title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 6px;
    line-height: 1.15;
    text-wrap: balance;
  }
  .arena-hero__tagline {
    font-size: 1.05rem;
    margin: 0;
    opacity: 0.95;
    max-width: 640px;
  }

  /* Key facts */
  .arena-facts {
    list-style: none;
    padding: 0;
    margin: 0 0 8px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
  }
  .arena-facts li {
    display: flex;
    flex-direction: column;
    gap: 3px;
    background: #faf7f8;
    border: 1px solid #f0e6e9;
    border-radius: 10px;
    padding: 11px 13px;
  }
  .arena-facts__k {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #8a8a94;
    font-weight: 700;
  }
  .arena-facts__k i { color: #e31337; margin-right: 4px; }
  .arena-facts__v {
    font-size: 0.98rem;
    font-weight: 600;
    color: #2a2f3a;
    text-transform: capitalize;
  }

  /* Content blocks */
  .arena-block {
    margin-top: 28px;
  }
  .arena-block__h {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1f2430;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f3e3e7;
  }
  .arena-block p { color: #4a4f5a; line-height: 1.6; }
  .arena-prizes {
    background: #fdf1f3;
    border-radius: 8px;
    padding: 12px 14px;
  }
  .arena-prizes i { color: #e0a100; margin-right: 6px; }
  .arena-fairplay {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 8px;
  }
  .arena-fairplay i { color: #1a8f4c; margin-right: 5px; }

  /* Standings */
  .arena-standings-wrap { overflow-x: auto; }
  .arena-standings {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
  }
  .arena-standings th, .arena-standings td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  .arena-standings th {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #8a8a94;
  }
  .arena-standings .c-rank { width: 64px; }
  .arena-standings .c-score { text-align: right; font-variant-numeric: tabular-nums; }
  .arena-standings th.c-score { text-align: right; }
  .arena-standings tr.is-top td { font-weight: 700; color: #1f2430; }
  .arena-standings tr.is-top .c-rank { color: #e31337; }

  /* Participate sidebar */
  .arena-participate {
    background: #fff;
    border: 1px solid #f0e6e9;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 6px 20px rgba(227, 19, 55, 0.07);
    position: sticky;
    top: 90px;
  }
  .arena-participate__h {
    font-size: 1.15rem;
    font-weight: 800;
    color: #1f2430;
    margin: 0 0 8px;
  }
  .arena-participate__p {
    font-size: 0.9rem;
    color: #5c6270;
    line-height: 1.5;
    margin-bottom: 16px;
  }
  .arena-participate__cta {
    display: block;
    text-align: center;
    background: #e31337;
    color: #fff;
    font-weight: 700;
    padding: 12px 16px;
    border-radius: 10px;
    text-decoration: none;
    transition: background 0.16s ease;
  }
  .arena-participate__cta:hover { background: #c00f2d; color: #fff; text-decoration: none; }
  .arena-participate__cta i { margin-left: 4px; }
  .arena-participate__note {
    font-size: 0.78rem;
    color: #6b7280;
    margin: 14px 0 0;
    line-height: 1.45;
  }
  .arena-participate__note i { color: #1a8f4c; margin-right: 5px; }

  @media (max-width: 991px) {
    .arena-participate { position: static; margin-top: 24px; }
    .arena-hero__title { font-size: 1.6rem; }
  }
</style>
