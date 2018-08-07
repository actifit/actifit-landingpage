import Vue from 'vue'
import VueSteemConnect from 'vue-steemconnect'

// make steemconnect available
Vue.use(VueSteemConnect, {
  app: 'actifit.app',
  callbackURL: process.env.scRedirectUrl || 'http://localhost:3000/auth'
})

export default {
  login ({ commit, state }) {
    // return promise to be able to wait for the user object to be set
    return new Promise((resolve, reject) => {
      // user will be set, when coming from auth page
      // but not if accessed this page directly
      if (!state.user) {
        // in that case we look for an access token in localStorage
        const accessToken = localStorage.getItem('access_token')
        if (accessToken) {
          // set access token and try to fetch user object
          Vue.SteemConnect().setAccessToken(accessToken)
          Vue.SteemConnect().me((err, user) => {
            if (err) reject(err)
            else {
              // save user object in store
              commit('login', user)
              resolve()
            }
          })
        }
      }
    })
  },
  logout ({ commit }) {
    // remove access token and unset user in store
    localStorage.removeItem('access_token')
    commit('logout')
  }
}
