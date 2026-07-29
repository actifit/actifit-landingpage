import Vue from 'vue'

// SimpleMDE (+ CodeMirror) is a ~2.9MB dependency. It was previously imported
// synchronously and registered as a global component, which pulled the whole
// editor into the shared bundle loaded on EVERY route — including the homepage,
// which never renders an editor. Parsing/evaluating that chunk blocked the main
// thread for ~1.3s on load (the "page loads then freezes for a few seconds" bug).
//
// Register it as an ASYNC global component instead: the editor chunk is only
// fetched when a <vue-simplemde> is actually rendered. (At present nothing renders
// it, so it is never loaded at all.)
Vue.component('vue-simplemde', () => import(/* webpackChunkName: "simplemde-editor" */ './simplemde-async.js'))
