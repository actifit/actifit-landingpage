import Vue from 'vue'
import VueSteemConnect from 'vue-steemconnect'

// init steemconnect (with default vote and comment permissions)
Vue.use(VueSteemConnect, {
  app: 'actifit.app',
  callbackURL: process.env.scRedirectUrl || 'http://localhost:3000/auth',
  scope: ['vote', 'comment', 'custom_json']
})
