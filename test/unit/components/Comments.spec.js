const fs = require('fs')

describe('Comments nested replies', () => {
  const component = fs.readFileSync('components/Comments.vue', 'utf8')

  it('keeps top-level comments visible and nests opened replies inside their parent card', () => {
    expect(component).toContain('nestedRepliesOpen: this.depth === 1')
    expect(component).toContain('@click="nestedRepliesOpen = !nestedRepliesOpen"')
    expect(component).toContain('v-if="nestedRepliesOpen" class="cmt-nested-replies"')
    expect(component).toContain('v-if="depth === 0"')
    expect(component).toContain(':aria-expanded="nestedRepliesOpen ? \'true\' : \'false\'"')
    expect(component).toContain('border-left: 2px solid var(--cmt-thread-rail);')
  })

  it('preserves comment header actions', () => {
    expect(component).toContain(':href="buildLink"')
    expect(component).toContain('v-on:click="copyContent"')
    expect(component).toContain('v-on:click="translateContent"')
    expect(component).toContain('@click="commentMinimized = true"')
  })

  it('offers whole-card collapse controls only on main comments', () => {
    expect(component).toContain('v-if="depth === 1"')
    expect(component).toContain('@click="commentMinimized = true"')
    expect(component).toContain('@click="commentMinimized = false"')
    expect(component).not.toContain('cmt-replies-toggle__icon')
  })

  it('automatically minimizes comments from low-reputation authors', () => {
    expect(component).toContain("import hive from '@hiveio/hive-js'")
    expect(component).toContain('this.fetchAuthorReputation();')
    expect(component).toContain('if (this.authorReputation <= 10)')
    expect(component).toContain('this.hiddenDueToLowRep = true;')
    expect(component).toContain("$t('hidden_low_reputation', [author])")
  })

  it('uses a neutral payout color when pending HBD is zero', () => {
    expect(component).toContain("'cmt-payout__pending--zero': parseFloat(full_data.pending_payout_value) <= 0")
    expect(component).toContain('.cmt-payout__pending--zero')
    expect(component).toContain('color: var(--cmt-muted);')
  })

  it('provides dark-mode colors for cards, threads, content, and the editor', () => {
    expect(component).toContain('.dark-mode .cmt-thread {')
    expect(component).toContain('--cmt-surface: var(--background-color);')
    expect(component).toContain('--cmt-surface-subtle: var(--background-color-1);')
    expect(component).toContain('--cmt-text: var(--text-color);')
    expect(component).toContain('.dark-mode .cmt-body blockquote')
    expect(component).toContain('.dark-mode .cmt-editor .v-note-wrapper')
  })
})
