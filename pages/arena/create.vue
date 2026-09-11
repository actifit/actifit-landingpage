<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5 arena-create">
      <ListHeadingSection :textualDisplay="$t('Arena_Create')" />
      <p class="text-center text-muted mb-4 arena-create__subtitle">{{ $t('Arena_Create_Subtitle') }}</p>

      <!-- Logged-out gate -->
      <div v-if="!isLoggedIn" class="text-center py-5">
        <i class="fas fa-user-lock fa-2x mb-3 d-block text-muted" aria-hidden="true"></i>
        <a href="#" class="arena-create__loginlink" @click.prevent="openLogin">
          {{ $t('Arena_Create_Login') }} <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <!-- Published confirmation -->
      <div v-else-if="published" class="arena-create__done text-center py-5" role="status">
        <i class="fas fa-check-circle fa-3x mb-3 d-block text-success" aria-hidden="true"></i>
        <p class="mb-4">{{ $t('Arena_Create_Pending') }}</p>
        <nuxt-link to="/arena" class="arena-create__btn arena-create__btn--primary">{{ $t('Arena_View_Arena') }}</nuxt-link>
      </div>

      <div v-else class="arena-create__wizard">
        <!-- Stepper -->
        <ol class="arena-steps" aria-label="Progress">
          <li v-for="(label, i) in stepLabels" :key="i" :class="{ 'is-active': step === i, 'is-done': step > i }">
            <span class="arena-steps__num">{{ i + 1 }}</span>
            <span class="arena-steps__label">{{ label }}</span>
          </li>
        </ol>

        <!-- STEP 1 — Details -->
        <section v-show="step === 0" class="arena-panel">
          <label class="arena-lbl" for="ch-title">{{ $t('Arena_Field_Title') }}</label>
          <input id="ch-title" v-model.trim="form.title" type="text" class="arena-inp" maxlength="120" :placeholder="$t('Arena_Field_Title_PH')" />

          <label class="arena-lbl" for="ch-type">{{ $t('Arena_Field_Type') }}</label>
          <select id="ch-type" v-model="form.type" class="arena-inp">
            <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>

          <label class="arena-lbl" for="ch-tagline">{{ $t('Arena_Field_Tagline') }}</label>
          <input id="ch-tagline" v-model.trim="form.tagline" type="text" class="arena-inp" maxlength="200" :placeholder="$t('Arena_Field_Tagline_PH')" />

          <label class="arena-lbl" for="ch-how">{{ $t('Arena_Field_HowItWorks') }}</label>
          <textarea id="ch-how" v-model.trim="form.howItWorks" class="arena-inp" rows="3" maxlength="2000" :placeholder="$t('Arena_Field_HowItWorks_PH')"></textarea>

          <div class="arena-row">
            <div class="arena-col">
              <label class="arena-lbl" for="ch-metric">{{ $t('Arena_Field_Metric') }}</label>
              <select id="ch-metric" v-model="form.metric" class="arena-inp">
                <option v-for="m in metrics" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="arena-col">
              <label class="arena-lbl" for="ch-rule">{{ $t('Arena_Field_Rule') }}</label>
              <select id="ch-rule" v-model="form.rule" class="arena-inp">
                <option v-for="r in rules" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </div>
          </div>

          <div v-if="form.rule === 'threshold'">
            <label class="arena-lbl" for="ch-threshold">{{ $t('Arena_Field_Threshold') }}</label>
            <input id="ch-threshold" v-model.number="form.threshold" type="number" min="1" class="arena-inp" />
          </div>

          <div class="arena-row">
            <div class="arena-col">
              <label class="arena-lbl" for="ch-start">{{ $t('Arena_Field_Start') }}</label>
              <input id="ch-start" v-model="form.start" type="date" class="arena-inp" :min="today" />
            </div>
            <div class="arena-col">
              <label class="arena-lbl" for="ch-end">{{ $t('Arena_Field_End') }}</label>
              <input id="ch-end" v-model="form.end" type="date" class="arena-inp" :min="form.start || today" />
            </div>
          </div>

          <label class="arena-lbl" for="ch-entry">{{ $t('Arena_Field_Entry') }}</label>
          <select id="ch-entry" v-model="form.entryMode" class="arena-inp">
            <option value="free">{{ $t('Arena_Entry_Free') }}</option>
            <option value="activity_gated">{{ $t('Arena_Entry_Gated') }}</option>
          </select>
          <div v-if="form.entryMode === 'activity_gated'">
            <label class="arena-lbl" for="ch-minact">{{ $t('Arena_Field_MinActivity') }}</label>
            <input id="ch-minact" v-model.number="form.minActivity" type="number" min="1" class="arena-inp" />
          </div>

          <label class="arena-lbl" for="ch-vis">{{ $t('Arena_Field_Visibility') }}</label>
          <select id="ch-vis" v-model="form.visibility" class="arena-inp">
            <option value="public">Public</option>
            <option value="private">Private (invite / link only)</option>
          </select>
        </section>

        <!-- STEP 2 — Rewards -->
        <section v-show="step === 1" class="arena-panel">
          <p class="arena-lbl arena-lbl--big">{{ $t('Arena_Reward_Type') }}</p>

          <label class="arena-choice" :class="{ 'is-picked': form.rewardType === 'badge' }">
            <input type="radio" value="badge" v-model="form.rewardType" />
            <span class="arena-choice__body">
              <span class="arena-choice__title"><i class="fas fa-medal" aria-hidden="true"></i> {{ $t('Arena_Reward_Badge') }}</span>
              <span class="arena-choice__desc">{{ $t('Arena_Reward_Badge_Desc') }}</span>
            </span>
          </label>

          <label class="arena-choice" :class="{ 'is-picked': form.rewardType === 'afit', 'is-disabled': !canFund }">
            <input type="radio" value="afit" v-model="form.rewardType" :disabled="!canFund" />
            <span class="arena-choice__body">
              <span class="arena-choice__title"><i class="fas fa-coins" aria-hidden="true"></i> {{ $t('Arena_Reward_Afit') }}</span>
              <span class="arena-choice__desc">{{ $t('Arena_Reward_Afit_Desc') }}</span>
              <span v-if="!canFund" class="arena-choice__gate"><i class="fas fa-lock" aria-hidden="true"></i> {{ fundedGateMsg }}</span>
            </span>
          </label>

          <!-- Badge details -->
          <div v-if="form.rewardType === 'badge'" class="arena-subform">
            <label class="arena-lbl" for="ch-badge">{{ $t('Arena_Field_Badge') }}</label>
            <input id="ch-badge" v-model.trim="form.badge" type="text" class="arena-inp" maxlength="40" :placeholder="$t('Arena_Field_Badge_PH')" />
          </div>

          <!-- AFIT prize details -->
          <div v-else-if="form.rewardType === 'afit'" class="arena-subform">
            <label class="arena-lbl" for="ch-prize">{{ $t('Arena_Field_Prize') }}</label>
            <input id="ch-prize" v-model.number="form.prize" type="number" :min="MIN_POOL" step="1" class="arena-inp" />

            <ul class="arena-costs">
              <li><span>{{ $t('Arena_Field_Prize') }}</span><span>{{ fmt(form.prize) }} AFIT</span></li>
              <li><span>{{ $t('Arena_Fee_Line', { pct: FEE_PCT }) }}</span><span>{{ fmt(fee) }} AFIT</span></li>
              <li class="arena-costs__total"><span>{{ $t('Arena_Total_Debit') }}</span><span>{{ fmt(totalDebit) }} AFIT</span></li>
              <li class="arena-costs__bal"><span>{{ $t('Arena_Your_Afit') }}</span><span>{{ fmt(afitBalance) }} AFIT</span></li>
            </ul>

            <p v-if="prizeError" class="arena-err"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i> {{ prizeError }}</p>
            <p class="arena-note"><i class="fas fa-shield-alt" aria-hidden="true"></i> {{ $t('Arena_Funder_Note') }}</p>
          </div>
        </section>

        <!-- STEP 3 — Review -->
        <section v-show="step === 2" class="arena-panel">
          <dl class="arena-review">
            <div><dt>{{ $t('Arena_Field_Title') }}</dt><dd>{{ form.title }}</dd></div>
            <div><dt>{{ $t('Arena_Field_Type') }}</dt><dd>{{ typeLabel }}</dd></div>
            <div v-if="form.tagline"><dt>{{ $t('Arena_Field_Tagline') }}</dt><dd>{{ form.tagline }}</dd></div>
            <div><dt>{{ $t('Arena_Field_Metric') }}</dt><dd>{{ metricLabel }} · {{ ruleLabel }}<span v-if="form.rule === 'threshold'"> ({{ form.threshold }})</span></dd></div>
            <div><dt>{{ $t('Arena_Field_Start') }} → {{ $t('Arena_Field_End') }}</dt><dd>{{ form.start }} → {{ form.end }}</dd></div>
            <div><dt>{{ $t('Arena_Field_Entry') }}</dt><dd>{{ form.entryMode === 'activity_gated' ? $t('Arena_Entry_Gated') + ' (' + form.minActivity + ')' : $t('Arena_Entry_Free') }}</dd></div>
            <div><dt>{{ $t('Arena_Review_Reward') }}</dt>
              <dd v-if="form.rewardType === 'badge'"><i class="fas fa-medal" aria-hidden="true"></i> {{ form.badge }}</dd>
              <dd v-else><i class="fas fa-coins" aria-hidden="true"></i> {{ fmt(form.prize) }} AFIT ({{ fmt(totalDebit) }} AFIT deducted)</dd>
            </div>
          </dl>
          <p class="arena-note"><i class="fas fa-balance-scale" aria-hidden="true"></i> {{ $t('Arena_Fair_Play_Skill') }}</p>
          <p v-if="actionMsg" class="arena-err" role="status">{{ actionMsg }}</p>
        </section>

        <!-- Nav -->
        <div class="arena-nav">
          <button v-if="step > 0" type="button" class="arena-create__btn" :disabled="publishing" @click="prev">{{ $t('Arena_Prev') }}</button>
          <span class="arena-nav__spacer"></span>
          <button v-if="step < 2" type="button" class="arena-create__btn arena-create__btn--primary" :disabled="!stepValid" @click="next">{{ $t('Arena_Next') }}</button>
          <button v-else type="button" class="arena-create__btn arena-create__btn--primary" :disabled="!canPublish || publishing" @click="publish">
            <i class="fas fa-bolt" aria-hidden="true"></i> {{ publishing ? $t('Arena_Publishing') : $t('Arena_Publish') }}
          </button>
        </div>
      </div>
    </div>

    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" @login-successful="onLoggedIn" />

    <Footer />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  import LoginModal from '~/components/LoginModal'
  import ListHeadingSection from '~/components/ListHeadingSection'

  // Mirror of the backend gate/economics (actifit-bot config defaults). These are
  // advisory here — the authoritative checks (holdings tier + funding debit) run
  // server-side at ingest — but they give immediate, honest feedback.
  const FUNDED_MIN_AFIT = 20000 // arena_funded_min_afit
  const FEE_PCT = 5             // arena_fund_cut_pct
  const MIN_POOL = 50           // arena_fund_min_pool

  function isoDay (d) {
    return new Date(d).toISOString().slice(0, 10)
  }

  export default {
    head () {
      return {
        title: 'Create a Challenge — The Arena | Actifit.io',
        meta: [
          { hid: 'description', name: 'description', content: 'Create your own Actifit fitness challenge — reward players with a badge or a self-funded AFIT prize.' }
        ]
      }
    },
    components: {
      NavbarBrand,
      Footer,
      LoginModal,
      ListHeadingSection
    },
    data () {
      const start = isoDay(Date.now())
      const end = isoDay(Date.now() + 7 * 86400000)
      return {
        FEE_PCT,
        MIN_POOL,
        step: 0,
        publishing: false,
        published: false,
        actionMsg: '',
        showLoginModal: false,
        afitBalance: 0,
        form: {
          title: '',
          type: 'league_fixture',
          tagline: '',
          howItWorks: '',
          metric: 'activity_count',
          rule: 'max',
          threshold: 1,
          start,
          end,
          entryMode: 'free',
          minActivity: 1,
          visibility: 'public',
          rewardType: 'badge',
          badge: '',
          prize: MIN_POOL
        }
      }
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      isLoggedIn () {
        return !!(this.user && this.user.account && this.user.account.name)
      },
      myUsername () {
        return this.isLoggedIn ? this.user.account.name : null
      },
      today () {
        return isoDay(Date.now())
      },
      stepLabels () {
        return [this.$t('Arena_Step_Details'), this.$t('Arena_Step_Rewards'), this.$t('Arena_Step_Review')]
      },
      // User-creatable challenge types (squad kinds excluded — they need squads).
      types () {
        return [
          { value: 'league_fixture', label: 'Leaderboard' },
          { value: 'daily_focus', label: 'Daily goal' },
          { value: 'liveops', label: 'Timed event' },
          { value: 'duel', label: 'Duel (1-v-1)' },
          { value: 'brawl', label: 'Free-for-all' }
        ]
      },
      metrics () {
        return [
          { value: 'activity_count', label: 'Total activity' },
          { value: 'steps', label: 'Step count' },
          { value: 'distance', label: 'Distance' },
          { value: 'goal_hit', label: 'Daily goal hits' }
        ]
      },
      rules () {
        return [
          { value: 'max', label: 'Highest total wins' },
          { value: 'threshold', label: 'Reach a target' },
          { value: 'head_to_head', label: 'Head to head' }
        ]
      },
      typeLabel () {
        const t = this.types.find(x => x.value === this.form.type)
        return t ? t.label : this.form.type
      },
      metricLabel () {
        const m = this.metrics.find(x => x.value === this.form.metric)
        return m ? m.label : this.form.metric
      },
      ruleLabel () {
        const r = this.rules.find(x => x.value === this.form.rule)
        return r ? r.label : this.form.rule
      },
      // ≥ 20k AFIT holdings unlock the self-funded prize option (advisory; the
      // server re-derives the funder's tier from their real balance at ingest).
      canFund () {
        return this.afitBalance >= FUNDED_MIN_AFIT
      },
      fundedGateMsg () {
        return this.$t('Arena_Funded_Gate', { min: this.fmt(FUNDED_MIN_AFIT) })
      },
      fee () {
        const p = Number(this.form.prize) || 0
        return Math.round(p * FEE_PCT) / 100
      },
      totalDebit () {
        return (Number(this.form.prize) || 0) + this.fee
      },
      prizeError () {
        if (this.form.rewardType !== 'afit') return ''
        const p = Number(this.form.prize) || 0
        if (p < MIN_POOL) return this.$t('Arena_Prize_Min', { min: MIN_POOL })
        if (this.totalDebit > this.afitBalance) return this.$t('Arena_Funded_Insufficient')
        return ''
      },
      // Per-step gating for the Next button.
      stepValid () {
        if (this.step === 0) {
          if (!this.form.title || !this.form.start || !this.form.end) return false
          if (new Date(this.form.start) >= new Date(this.form.end)) return false
          if (this.form.rule === 'threshold' && !(Number(this.form.threshold) > 0)) return false
          if (this.form.entryMode === 'activity_gated' && !(Number(this.form.minActivity) > 0)) return false
          return true
        }
        if (this.step === 1) {
          if (this.form.rewardType === 'badge') return !!this.form.badge
          if (this.form.rewardType === 'afit') return this.canFund && !this.prizeError
          return false
        }
        return true
      },
      canPublish () {
        return this.stepValid && this.isLoggedIn && !!this.myUsername
      }
    },
    watch: {
      isLoggedIn (v) {
        if (v) this.loadBalance()
      }
    },
    mounted () {
      if (this.isLoggedIn) this.loadBalance()
    },
    methods: {
      fmt (n) {
        const v = Number(n) || 0
        return v % 1 === 0 ? String(v) : v.toFixed(2)
      },
      openLogin () {
        this.showLoginModal = true
      },
      onLoggedIn () {
        this.showLoginModal = false
        if (this.isLoggedIn) this.loadBalance()
      },
      async loadBalance () {
        try {
          const tokens = await this.$store.dispatch('fetchUserTokensReturn', this.myUsername)
          this.afitBalance = Number(tokens) || 0
        } catch (e) {
          this.afitBalance = 0
        }
      },
      next () {
        if (this.stepValid && this.step < 2) this.step += 1
      },
      prev () {
        if (this.step > 0) this.step -= 1
      },
      // The unique on-chain challenge id (never the reserved def_* namespace).
      makeId () {
        return 'ch_' + String(this.myUsername).toLowerCase() + '_' + Date.now().toString(36)
      },
      // Build the actifit_arena challenge_create payload. origin_tier selects the
      // reward model: friendly = badge only, community = self-funded AFIT prize
      // (the backend locks the prize from the creator's balance at ingest).
      buildOp (id) {
        const op = {
          op: 'challenge_create',
          v: 1,
          id,
          type: this.form.type,
          title: this.form.title,
          origin_tier: this.form.rewardType === 'afit' ? 'community' : 'friendly',
          visibility: this.form.visibility,
          participants_kind: 'user',
          window: {
            start: new Date(this.form.start + 'T00:00:00.000Z').toISOString(),
            end: new Date(this.form.end + 'T23:59:59.000Z').toISOString()
          },
          entry: this.form.entryMode === 'activity_gated'
            ? { mode: 'activity_gated', gate: { min_activity: Number(this.form.minActivity) } }
            : { mode: 'free' },
          scoring: this.form.rule === 'threshold'
            ? { metric: this.form.metric, rule: 'threshold', threshold: Number(this.form.threshold) }
            : { metric: this.form.metric, rule: this.form.rule },
          rewards: this.form.rewardType === 'afit'
            ? { afit: Number(this.form.prize) }
            : { badges: [this.form.badge] }
        }
        if (this.form.tagline) op.tagline = this.form.tagline
        if (this.form.howItWorks) op.how_it_works = this.form.howItWorks
        return op
      },
      async publish () {
        if (!this.canPublish || this.publishing) return
        this.publishing = true
        this.actionMsg = ''
        try {
          const id = this.makeId()
          const custom = {
            required_auths: [],
            required_posting_auths: [this.myUsername],
            id: 'actifit_arena',
            json: JSON.stringify(this.buildOp(id))
          }
          const res = await this.$processTrxFunc('custom_json', custom, false)
          if (res && res.success) {
            this.published = true
          } else {
            this.actionMsg = this.$t('Arena_Create_Failed')
          }
        } catch (e) {
          this.actionMsg = this.$t('Arena_Create_Failed')
        } finally {
          this.publishing = false
        }
      }
    }
  }
</script>

<style scoped>
  .arena-create__subtitle {
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
    font-size: 1.05rem;
  }
  .arena-create__wizard,
  .arena-create__done {
    max-width: 640px;
    margin: 0 auto;
  }
  .arena-create__loginlink {
    font-weight: 700;
    font-size: 1.05rem;
    color: #e31337;
    text-decoration: none;
  }
  .arena-create__loginlink:hover { text-decoration: underline; }

  /* Stepper */
  .arena-steps {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0 0 26px;
    counter-reset: step;
  }
  .arena-steps li {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #9aa0ac;
    position: relative;
  }
  .arena-steps li::before {
    content: '';
    position: absolute;
    top: 15px;
    left: -50%;
    width: 100%;
    height: 2px;
    background: #eceef2;
    z-index: 0;
  }
  .arena-steps li:first-child::before { display: none; }
  .arena-steps__num {
    position: relative;
    z-index: 1;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #eceef2;
    color: #9aa0ac;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }
  .arena-steps li.is-active .arena-steps__num { background: #e31337; color: #fff; }
  .arena-steps li.is-active .arena-steps__label { color: #1f2430; font-weight: 600; }
  .arena-steps li.is-done .arena-steps__num { background: #1a8f4c; color: #fff; }

  /* Panels + fields */
  .arena-panel {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 14px;
    padding: 22px;
    box-shadow: 0 2px 10px rgba(20, 20, 40, 0.05);
  }
  .arena-lbl {
    display: block;
    font-weight: 600;
    font-size: 0.9rem;
    color: #3a3f4b;
    margin: 16px 0 6px;
  }
  .arena-panel > .arena-lbl:first-child { margin-top: 0; }
  .arena-lbl--big { font-size: 1.05rem; margin-bottom: 12px; }
  .arena-inp {
    width: 100%;
    border: 1px solid #d9dce2;
    border-radius: 9px;
    padding: 10px 12px;
    font-size: 0.95rem;
    color: #1f2430;
    background: #fff;
  }
  .arena-inp:focus {
    outline: none;
    border-color: #e31337;
    box-shadow: 0 0 0 3px rgba(227, 19, 55, 0.12);
  }
  .arena-row { display: flex; gap: 14px; }
  .arena-col { flex: 1; }

  /* Reward choice cards */
  .arena-choice {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    border: 1px solid #d9dce2;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .arena-choice input { margin-top: 4px; }
  .arena-choice.is-picked { border-color: #e31337; background: #fdf1f3; }
  .arena-choice.is-disabled { opacity: 0.6; cursor: not-allowed; }
  .arena-choice__body { display: flex; flex-direction: column; gap: 3px; }
  .arena-choice__title { font-weight: 700; color: #1f2430; }
  .arena-choice__title i { color: #e0a100; margin-right: 5px; }
  .arena-choice__desc { font-size: 0.86rem; color: #5c6270; }
  .arena-choice__gate { font-size: 0.8rem; color: #b02a37; margin-top: 4px; }
  .arena-choice__gate i { margin-right: 4px; }

  .arena-subform { margin-top: 8px; }
  .arena-costs {
    list-style: none;
    padding: 12px 14px;
    margin: 14px 0 10px;
    background: #f7f8fa;
    border-radius: 10px;
    font-size: 0.9rem;
  }
  .arena-costs li { display: flex; justify-content: space-between; padding: 3px 0; color: #3a3f4b; }
  .arena-costs__total { font-weight: 700; border-top: 1px solid #e3e6ec; margin-top: 4px; padding-top: 8px !important; }
  .arena-costs__bal { color: #6b7280; }

  .arena-note {
    font-size: 0.84rem;
    color: #5c6270;
    background: #f2f8f4;
    border-radius: 8px;
    padding: 9px 11px;
    margin-top: 12px;
  }
  .arena-note i { color: #1a8f4c; margin-right: 5px; }
  .arena-err { color: #b02a37; font-size: 0.88rem; margin-top: 10px; }
  .arena-err i { margin-right: 5px; }

  /* Review */
  .arena-review { margin: 0; }
  .arena-review > div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f1f4;
  }
  .arena-review dt { color: #6b7280; font-weight: 600; font-size: 0.86rem; margin: 0; }
  .arena-review dd { color: #1f2430; margin: 0; text-align: right; }
  .arena-review dd i { color: #e0a100; margin-right: 4px; }

  /* Nav + buttons */
  .arena-nav { display: flex; align-items: center; margin-top: 22px; }
  .arena-nav__spacer { flex: 1; }
  .arena-create__btn {
    border: 1px solid #d9dce2;
    background: #fff;
    color: #3a3f4b;
    font-weight: 700;
    font-size: 0.95rem;
    padding: 11px 22px;
    border-radius: 10px;
    cursor: pointer;
    margin-left: 10px;
  }
  .arena-create__btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .arena-create__btn--primary { background: #e31337; border-color: #e31337; color: #fff; }
  .arena-create__btn--primary i { margin-right: 5px; }

  @media (max-width: 560px) {
    .arena-row { flex-direction: column; gap: 0; }
    .arena-steps__label { display: none; }
  }
</style>
