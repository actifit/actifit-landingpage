import { displayState, countdownFor, humanize } from '~/utils/arenaCatalog'

/**
 * Live state badge and countdown for the Arena pages.
 *
 * `now` stays null during server rendering and the first client render, so the
 * countdown (which changes every second) is only drawn in the browser and cannot
 * cause a hydration mismatch. The timer starts in mounted(), which never runs on
 * the server, and is cleared on destroy.
 */
export default {
  data () {
    return { now: null, clockTimer: null }
  },
  mounted () {
    this.now = Date.now()
    this.clockTimer = setInterval(() => { this.now = Date.now() }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.clockTimer)
  },
  methods: {
    arenaState (ch) {
      return displayState(ch, this.now || Date.now())
    },
    arenaStateLabel (ch) {
      const s = this.arenaState(ch)
      if (s === 'upcoming') return this.$t('Arena_State_Upcoming')
      if (s === 'ending_soon') return this.$t('Arena_State_Ending_Soon')
      return humanize(s)
    },
    // '' until mounted, and once the window is over
    arenaCountdown (ch) {
      if (!this.now) return ''
      const c = countdownFor(ch, this.now)
      if (!c || !c.text) return ''
      return this.$t(c.kind === 'starts' ? 'Arena_Starts_In' : 'Arena_Ends_In') + ' ' + c.text
    }
  }
}
