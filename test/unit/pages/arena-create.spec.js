import CreatePage from '~/pages/arena/create.vue'

// The create wizard is unit-tested at the options-object level (computeds/methods
// called with an explicit `this`), matching arena-detail.spec — no full mount.
describe('pages/arena/create (wizard)', () => {
  const baseForm = () => ({
    title: 'October Sprint',
    type: 'league_fixture',
    tagline: 'Go all out',
    howItWorks: 'Log activity every day.',
    metric: 'activity_count',
    rule: 'max',
    threshold: 1,
    start: '2026-10-01',
    end: '2026-10-08',
    entryMode: 'free',
    minActivity: 1,
    visibility: 'public',
    rewardType: 'badge',
    badge: 'Sprinter',
    prize: 50
  })
  const $t = (k, p) => (p ? k + ':' + JSON.stringify(p) : k)

  describe('economics', () => {
    it('fee is 5% of the prize, totalDebit adds it on', () => {
      const ctx = { form: { prize: 100 } }
      expect(CreatePage.computed.fee.call(ctx)).toBe(5)
      expect(CreatePage.computed.totalDebit.call({ form: { prize: 100 }, fee: 5 })).toBe(105)
    })

    it('canFund requires holding at least 20,000 AFIT', () => {
      expect(CreatePage.computed.canFund.call({ afitBalance: 19999 })).toBe(false)
      expect(CreatePage.computed.canFund.call({ afitBalance: 20000 })).toBe(true)
    })

    it('prizeError flags a sub-minimum prize and an unaffordable one', () => {
      // below the 50-AFIT minimum pool
      expect(CreatePage.computed.prizeError.call({ $t, form: { rewardType: 'afit', prize: 10 }, totalDebit: 10.5, afitBalance: 999999 })).toMatch(/Arena_Prize_Min/)
      // prize+fee exceeds balance
      expect(CreatePage.computed.prizeError.call({ $t, form: { rewardType: 'afit', prize: 100 }, totalDebit: 105, afitBalance: 100 })).toBe('Arena_Funded_Insufficient')
      // fine
      expect(CreatePage.computed.prizeError.call({ $t, form: { rewardType: 'afit', prize: 100 }, totalDebit: 105, afitBalance: 20000 })).toBe('')
      // badge path never has a prize error
      expect(CreatePage.computed.prizeError.call({ $t, form: { rewardType: 'badge', prize: 0 }, totalDebit: 0, afitBalance: 0 })).toBe('')
    })
  })

  describe('stepValid', () => {
    it('step 0 requires a title and a start<end window', () => {
      const good = { step: 0, form: baseForm() }
      expect(CreatePage.computed.stepValid.call(good)).toBe(true)
      const noTitle = { step: 0, form: { ...baseForm(), title: '' } }
      expect(CreatePage.computed.stepValid.call(noTitle)).toBe(false)
      const badWindow = { step: 0, form: { ...baseForm(), start: '2026-10-08', end: '2026-10-01' } }
      expect(CreatePage.computed.stepValid.call(badWindow)).toBe(false)
    })

    it('step 0 allows a same-day window (one-day event)', () => {
      const sameDay = { step: 0, form: { ...baseForm(), start: '2026-10-01', end: '2026-10-01' } }
      expect(CreatePage.computed.stepValid.call(sameDay)).toBe(true)
    })

    it('step 2 (review) is always valid — publish is gated by canPublish', () => {
      expect(CreatePage.computed.stepValid.call({ step: 2, form: baseForm() })).toBe(true)
      // canPublish additionally requires a logged-in user
      expect(CreatePage.computed.canPublish.call({ stepValid: true, isLoggedIn: true, myUsername: 'alice' })).toBe(true)
      expect(CreatePage.computed.canPublish.call({ stepValid: true, isLoggedIn: false, myUsername: null })).toBe(false)
    })

    it('step 0 requires a positive threshold when the rule is threshold', () => {
      const ctx = { step: 0, form: { ...baseForm(), rule: 'threshold', threshold: 0 } }
      expect(CreatePage.computed.stepValid.call(ctx)).toBe(false)
      ctx.form.threshold = 5000
      expect(CreatePage.computed.stepValid.call(ctx)).toBe(true)
    })

    it('step 1 badge path needs a badge name; afit path needs funding + no error', () => {
      expect(CreatePage.computed.stepValid.call({ step: 1, form: { rewardType: 'badge', badge: '' } })).toBe(false)
      expect(CreatePage.computed.stepValid.call({ step: 1, form: { rewardType: 'badge', badge: 'X' } })).toBe(true)
      // funded but under the holdings gate → invalid
      expect(CreatePage.computed.stepValid.call({ step: 1, form: { rewardType: 'afit' }, canFund: false, prizeError: '' })).toBe(false)
      // funded, gated ok, no prize error → valid
      expect(CreatePage.computed.stepValid.call({ step: 1, form: { rewardType: 'afit' }, canFund: true, prizeError: '' })).toBe(true)
      // funded, gated ok, but a prize error → invalid
      expect(CreatePage.computed.stepValid.call({ step: 1, form: { rewardType: 'afit' }, canFund: true, prizeError: 'nope' })).toBe(false)
    })
  })

  describe('makeId', () => {
    it('builds a lowercase ch_ id and never the reserved def_ namespace', () => {
      const id = CreatePage.methods.makeId.call({ myUsername: 'Alice' })
      expect(id).toMatch(/^ch_alice_/)
      expect(id.startsWith('def_')).toBe(false)
    })
  })

  describe('buildOp', () => {
    it('badge reward → friendly tier, badges reward, free entry', () => {
      const op = CreatePage.methods.buildOp.call({ form: baseForm() }, 'ch_alice_1')
      expect(op.op).toBe('challenge_create')
      expect(op.origin_tier).toBe('friendly')
      expect(op.rewards).toEqual({ badges: ['Sprinter'] })
      expect(op.entry).toEqual({ mode: 'free' })
      expect(op.scoring).toEqual({ metric: 'activity_count', rule: 'max' })
      expect(op.participants_kind).toBe('user')
      // window is real ISO with start < end
      expect(new Date(op.window.start).getTime()).toBeLessThan(new Date(op.window.end).getTime())
      expect(op.tagline).toBe('Go all out')
      expect(op.how_it_works).toBe('Log activity every day.')
    })

    it('afit reward → community tier and an afit prize (self-funded at ingest)', () => {
      const form = { ...baseForm(), rewardType: 'afit', prize: 400 }
      const op = CreatePage.methods.buildOp.call({ form }, 'ch_alice_2')
      expect(op.origin_tier).toBe('community')
      expect(op.rewards).toEqual({ afit: 400 })
      // no forbidden monetary entry field is ever emitted (invariant I1)
      expect(op.entry.fee).toBeUndefined()
      expect(op.entry.stake).toBeUndefined()
    })

    it('activity-gated entry carries only min_activity; threshold rule carries the target', () => {
      const form = { ...baseForm(), entryMode: 'activity_gated', minActivity: 25, rule: 'threshold', threshold: 8000 }
      const op = CreatePage.methods.buildOp.call({ form }, 'ch_alice_3')
      expect(op.entry).toEqual({ mode: 'activity_gated', gate: { min_activity: 25 } })
      expect(op.scoring).toEqual({ metric: 'activity_count', rule: 'threshold', threshold: 8000 })
    })

    it('the activity-gated entry NEVER carries a monetary key (invariant I1)', () => {
      const form = { ...baseForm(), entryMode: 'activity_gated', minActivity: 10 }
      const op = CreatePage.methods.buildOp.call({ form }, 'ch_alice_4')
      // the gate is a fixed literal — only min_activity is ever present
      expect(Object.keys(op.entry.gate)).toEqual(['min_activity'])
      for (const k of ['fee', 'entry_fee', 'stake', 'buy_in', 'buyin', 'wager', 'ante', 'pot']) {
        expect(op.entry[k]).toBeUndefined()
        expect(op.entry.gate[k]).toBeUndefined()
      }
    })

    it('blank numeric fields never emit NaN in the op', () => {
      // v-model.number yields '' for a blank input → Number('') === 0, not NaN
      const form = { ...baseForm(), rule: 'threshold', threshold: '', entryMode: 'activity_gated', minActivity: '', rewardType: 'afit', prize: '' }
      const op = CreatePage.methods.buildOp.call({ form }, 'ch_alice_5')
      expect(Number.isNaN(op.scoring.threshold)).toBe(false)
      expect(Number.isNaN(op.entry.gate.min_activity)).toBe(false)
      expect(Number.isNaN(op.rewards.afit)).toBe(false)
    })
  })

  describe('rule/type coupling', () => {
    const $ti = (k) => k // label passthrough
    it('head_to_head is offered only for a duel', () => {
      const duel = CreatePage.computed.rules.call({ $t: $ti, form: { type: 'duel' } })
      expect(duel.some(r => r.value === 'head_to_head')).toBe(true)
      const league = CreatePage.computed.rules.call({ $t: $ti, form: { type: 'league_fixture' } })
      expect(league.some(r => r.value === 'head_to_head')).toBe(false)
      // max + threshold always present
      expect(league.map(r => r.value)).toEqual(['max', 'threshold'])
    })
  })

  describe('publish', () => {
    const makeCtx = (over = {}) => {
      const ctx = {
        canPublish: true,
        publishing: false,
        published: false,
        actionMsg: '',
        myUsername: 'alice',
        form: baseForm(),
        $t,
        $processTrxFunc: jest.fn().mockResolvedValue({ success: true }),
        ...over
      }
      ctx.makeId = CreatePage.methods.makeId.bind(ctx)
      ctx.buildOp = CreatePage.methods.buildOp.bind(ctx)
      return ctx
    }

    it('broadcasts a signed actifit_arena custom_json and marks published on success', async () => {
      const ctx = makeCtx()
      await CreatePage.methods.publish.call(ctx)
      expect(ctx.$processTrxFunc).toHaveBeenCalledWith('custom_json', expect.objectContaining({ id: 'actifit_arena', required_posting_auths: ['alice'] }), false)
      const sent = JSON.parse(ctx.$processTrxFunc.mock.calls[0][1].json)
      expect(sent.op).toBe('challenge_create')
      expect(ctx.published).toBe(true)
    })

    it('surfaces an error and does not mark published on failure', async () => {
      const ctx = makeCtx({ $processTrxFunc: jest.fn().mockResolvedValue({ success: false }) })
      await CreatePage.methods.publish.call(ctx)
      expect(ctx.published).toBe(false)
      expect(ctx.actionMsg).toBe('Arena_Create_Failed')
    })

    it('does nothing when canPublish is false', async () => {
      const ctx = makeCtx({ canPublish: false })
      await CreatePage.methods.publish.call(ctx)
      expect(ctx.$processTrxFunc).not.toHaveBeenCalled()
    })
  })
})
