// Embedded players show a spinner until their iframe loads; the plugin marks the player
// box with .is-loaded when that happens, wherever on the page the post body was rendered.
import installEmbedLoaded, { markPlayerLoaded } from '@/plugins/embed-loaded'

describe('embed-loaded plugin', () => {
  beforeAll(() => { installEmbedLoaded() })
  afterAll(() => { document.removeEventListener('load', markPlayerLoaded, true) })
  afterEach(() => { document.body.innerHTML = '' })

  const render = (html) => {
    const el = document.createElement('div')
    el.innerHTML = html
    document.body.appendChild(el)
    return el
  }
  // iframe "load" does not bubble, as in the browser.
  const load = (frame) => frame.dispatchEvent(new Event('load', { bubbles: false }))

  it.each(['video-container', 'audio-container'])('marks a %s once its iframe loads', (cls) => {
    const box = render(`<div class="${cls}"><iframe src="https://play.3speak.tv/x"></iframe></div>`).firstChild
    expect(box.classList.contains('is-loaded')).toBe(false)
    load(box.querySelector('iframe'))
    expect(box.classList.contains('is-loaded')).toBe(true)
  })

  it('marks only the player whose iframe loaded', () => {
    const el = render('<div class="audio-container"><iframe src="https://play.3speak.tv/x"></iframe></div><div class="video-container"><iframe src="https://play.3speak.tv/x"></iframe></div>')
    const [audio, video] = el.children
    load(video.querySelector('iframe'))
    expect(video.classList.contains('is-loaded')).toBe(true)
    expect(audio.classList.contains('is-loaded')).toBe(false)
  })

  it('leaves other iframes and images alone', () => {
    const el = render('<div class="other"><iframe src="https://play.3speak.tv/x"></iframe></div><div class="audio-container"><img></div>')
    load(el.querySelector('iframe'))
    load(el.querySelector('img'))
    expect(el.querySelector('.is-loaded')).toBeNull()
  })
})
