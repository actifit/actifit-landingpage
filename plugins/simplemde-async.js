// Lazy-loaded wrapper for the SimpleMDE editor.
//
// SimpleMDE bundles CodeMirror and is a very heavy (~2.9MB) dependency. Keeping
// its JS + CSS here, behind a dynamic import(), lets webpack code-split it into
// its own chunk that is only fetched when a <vue-simplemde> component actually
// renders — instead of shipping it in the shared bundle that loads on every
// route (including the homepage, which has no editor).
import VueSimplemde from 'vue-simplemde'
import 'simplemde/dist/simplemde.min.css'

export default VueSimplemde
