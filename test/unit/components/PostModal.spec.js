const fs = require('fs')

describe('PostModal footer layout', () => {
  const component = fs.readFileSync('components/PostModal.vue', 'utf8')

  it('uses the revamped comment-style footer without removing post actions', () => {
    expect(component).toContain('main-payment-info col-12 post-detail-footer')
    expect(component).toContain('class="post-detail-footer__actions"')
    expect(component).toContain('@click.prevent="toggleCommentBox()"')
    expect(component).toContain('@click.prevent="votePrompt($event)"')
    expect(component).toContain('@click.prevent="headToComments()"')
    expect(component).toContain('@click.prevent="$reblog(user, post)"')
    expect(component).toContain('class="post-detail-footer__payout"')
    expect(component).toContain('class="post-detail-footer__sharing"')
  })

  it('keeps social sharing inside the main footer strip', () => {
    const summaryStart = component.indexOf('class="post-detail-footer__summary"')
    const sharingStart = component.indexOf('class="post-detail-footer__sharing"')
    const tokenDetailsStart = component.indexOf('class="post-detail-footer__tokens"')

    expect(summaryStart).toBeGreaterThan(-1)
    expect(sharingStart).toBeGreaterThan(summaryStart)
    expect(sharingStart).toBeLessThan(tokenDetailsStart)
    expect(component).not.toContain('border-top: 1px dashed var(--post-footer-border);')
    expect(component).toContain('flex: 0 0 100%;')
    expect(component).toContain('padding: 2px 3px;')
    expect(component).toContain('border-bottom: 1px solid var(--post-footer-border);')
  })

  it('uses the modal user getter for the active vote state', () => {
    expect(component).toContain("'post-detail-action--active': user && userVotedThisPost() == true")
    expect(component).not.toContain('this.$parent.user')
  })

  it('contains footer styles and supports dark mode and mobile wrapping', () => {
    expect(component).toContain('#modal-footer.post-detail-footer {')
    expect(component).toContain('.dark-mode #modal-footer.post-detail-footer {')
    expect(component).toContain('@media (max-width: 767px)')
    expect(component).toContain('#modal-footer .post-detail-footer__summary')
    expect(component).not.toMatch(/^\s*\.post-detail-/m)
  })
})
