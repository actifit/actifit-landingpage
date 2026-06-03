// Global Jest setup, loaded via setupFilesAfterEnv.
import Vue from 'vue'

// Keep test output clean of Vue's "production tip" / devtools noise.
Vue.config.productionTip = false
Vue.config.devtools = false

// jsdom does not implement matchMedia; several plugins (dark-mode, bootstrap-vue)
// touch it on import. Provide a no-op stub.
if (!window.matchMedia) {
  window.matchMedia = function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () { return false }
    }
  }
}

// jsdom lacks scrollTo; vue-scrollto and others call it.
if (!window.scrollTo) {
  window.scrollTo = function () {}
}
