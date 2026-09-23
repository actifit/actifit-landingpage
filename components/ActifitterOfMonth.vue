<template>
  <section v-if="featuredActifitter" class="aom container" aria-labelledby="aom-title">
    <div class="aom__card">
      <div class="aom__media">
        <img :src="photo" :alt="displayName" class="aom__photo" @error="onImgError" />
        <h2 id="aom-title" class="aom__ribbon">{{ $t('Actifitter_Month_Title') }}</h2>
      </div>

      <div class="aom__body">
        <div class="aom__headrow">
          <h3 class="aom__name">{{ displayName }}</h3>
          <span v-if="featuredActifitter.month" class="aom__month">{{ monthLabel }}</span>
        </div>
        <nuxt-link :to="`/@${featuredActifitter.username}`" class="aom__handle">@{{ featuredActifitter.username }}</nuxt-link>

        <p v-if="featuredActifitter.testimonial" class="aom__quote">“{{ featuredActifitter.testimonial }}”</p>

        <ul v-if="statChips.length" class="aom__stats">
          <li v-for="chip in statChips" :key="chip.key">
            <span class="aom__stat-val">{{ chip.value }}</span>
            <span class="aom__stat-label">{{ chip.label }}</span>
          </li>
        </ul>

        <div class="aom__actions">
          <nuxt-link :to="`/@${featuredActifitter.username}`" class="aom__profile">{{ $t('Actifitter_Month_View_Profile') }}</nuxt-link>
          <a href="/signup" class="aom__cta">{{ ctaText }} <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapGetters(['featuredActifitter']),
      displayName () {
        const f = this.featuredActifitter
        return (f && (f.display_name || f.username)) || ''
      },
      photo () {
        const f = this.featuredActifitter || {}
        return f.photo_url || (f.username ? `https://images.hive.blog/u/${f.username}/avatar` : '')
      },
      monthLabel () {
        // "2026-08" -> localized "August 2026"; fall back to the raw value
        const m = this.featuredActifitter && this.featuredActifitter.month
        if (!m || !/^\d{4}-\d{2}$/.test(m)) return m || ''
        const d = new Date(`${m}-01T00:00:00`)
        return isNaN(d.getTime()) ? m : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      },
      ctaText () {
        const f = this.featuredActifitter
        return (f && f.cta) || this.$t('Actifitter_Month_CTA')
      },
      statChips () {
        const s = (this.featuredActifitter && this.featuredActifitter.stats) || {}
        const defs = [
          { key: 'rank', label: this.$t('Actifitter_Month_Rank'), fmt: v => `#${this.fmtNum(v)}` },
          { key: 'activity_count', label: this.$t('Actifitter_Month_Activity'), fmt: v => this.fmtNum(v) },
          { key: 'afit', label: this.$t('Actifitter_Month_AFIT'), fmt: v => this.fmtNum(v) },
          { key: 'months_active', label: this.$t('Actifitter_Month_Months_Active'), fmt: v => this.fmtNum(v) }
        ]
        return defs
          .filter(d => Number.isFinite(Number(s[d.key])))
          .map(d => ({ key: d.key, label: d.label, value: d.fmt(Number(s[d.key])) }))
      }
    },
    mounted () {
      // self-fetch; on empty/unset the getter stays null and the section hides
      this.$store.dispatch('fetchFeaturedActifitter')
    },
    methods: {
      fmtNum (n) {
        const v = Number(n)
        return Number.isFinite(v) ? v.toLocaleString() : ''
      },
      onImgError (e) {
        // if the editorial photo 404s, fall back to the Hive avatar
        const f = this.featuredActifitter
        if (f && f.username && e && e.target && !e.target.dataset.fallback) {
          e.target.dataset.fallback = '1'
          e.target.src = `https://images.hive.blog/u/${f.username}/avatar`
        }
      }
    }
  }
</script>

<style scoped>
  .aom { padding: 12px 15px; }
  .aom__card {
    display: flex;
    gap: 26px;
    align-items: stretch;
    background: #fff;
    border: 1px solid #f0e6e9;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 6px 22px rgba(20, 20, 40, 0.06);
  }

  .aom__media {
    position: relative;
    flex: 0 0 240px;
    min-height: 240px;
    background: #faf7f8;
  }
  .aom__photo { width: 100%; height: 100%; object-fit: cover; display: block; }
  .aom__ribbon {
    position: absolute;
    top: 14px;
    left: 0;
    margin: 0; /* reset h2 default margins — this is the section heading */
    background: #e31337;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 14px 6px 12px;
    border-radius: 0 20px 20px 0;
  }

  .aom__body { flex: 1; padding: 22px 24px; display: flex; flex-direction: column; }
  .aom__headrow { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .aom__name { font-size: 1.5rem; font-weight: 800; color: #1f2430; margin: 0; }
  .aom__month { font-size: 0.8rem; color: #8a8a94; font-weight: 600; text-transform: capitalize; }
  .aom__handle { display: inline-block; color: #e31337; font-weight: 600; font-size: 0.92rem; margin: 2px 0 12px; text-decoration: none; }
  .aom__handle:hover { text-decoration: underline; }

  .aom__quote { font-size: 1.02rem; line-height: 1.6; color: #454b57; font-style: italic; margin: 0 0 16px; }

  .aom__stats { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-wrap: wrap; gap: 10px 26px; }
  .aom__stats li { display: flex; flex-direction: column; }
  .aom__stat-val { font-size: 1.25rem; font-weight: 800; color: #e31337; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .aom__stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.03em; color: #8a8a94; font-weight: 700; }

  .aom__actions { margin-top: auto; display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .aom__profile { color: #454b57; font-weight: 600; font-size: 0.9rem; text-decoration: none; }
  .aom__profile:hover { text-decoration: underline; }
  .aom__cta {
    background: #e31337; color: #fff; font-weight: 700; font-size: 0.92rem;
    padding: 11px 18px; border-radius: 10px; text-decoration: none; transition: background 0.16s ease;
  }
  .aom__cta:hover { background: #c00f2d; color: #fff; text-decoration: none; }
  .aom__cta i { margin-left: 4px; }
  .aom__cta:focus-visible, .aom__handle:focus-visible, .aom__profile:focus-visible { outline: 2px solid #e31337; outline-offset: 2px; }

  /* Dark mode — mirrors the site's `.dark-mode` ancestor + CSS-var convention. */
  .dark-mode .aom__card {
    background: var(--background-color, #1c1f26);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
  }
  .dark-mode .aom__media { background: #2a2f3a; }
  .dark-mode .aom__name { color: var(--text-color, #f2f3f5); }
  .dark-mode .aom__quote { color: #cfd3da; }
  .dark-mode .aom__month,
  .dark-mode .aom__stat-label { color: #adb5bd; }
  .dark-mode .aom__profile { color: #cfd3da; }
  .dark-mode .aom__ribbon { background: #ff5266; }
  .dark-mode .aom__stat-val,
  .dark-mode .aom__handle { color: #ff7181; }
  .dark-mode .aom__cta { background: #ff5266; }
  .dark-mode .aom__cta:hover { background: #ff7181; }

  @media (max-width: 767px) {
    .aom__card { flex-direction: column; }
    .aom__media { flex-basis: 200px; min-height: 200px; }
  }
</style>
