// Embedded players (.video-container / .audio-container, built by $cleanBody) show a
// spinner until their iframe loads. Post bodies are rendered by many components, so one
// capture-phase listener on the document marks every player instead of each component
// doing it. iframe "load" does not bubble, but capture-phase listeners still see it.
export function markPlayerLoaded ({ target }) {
  const box = target.parentElement
  if (target.tagName === 'IFRAME' && box && box.matches('.video-container, .audio-container')) {
    box.classList.add('is-loaded')
  }
}

export default () => {
  document.addEventListener('load', markPlayerLoaded, true)
}
