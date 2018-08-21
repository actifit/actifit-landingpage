import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

const createStore = () => {
  const store = new Vuex.Store({
    state: {
      userTokens: 0, // logged-in user's token count
      transactions: [], // logged-in user's transactions
      userCount: 0, // users using actifit
      tokensDistributed: 0, // total amount of distributed tokens
      rewardedActivityCount: 0, // total amount of activity posts
      leaderboard: [], // top users
      reports: [], // all activity reports/posts
      moreReportsAvailable: false, // indicator if there are more reports to load
      userReports: [], // logged-in user's activity reports/posts
      moreUserReportsAvailable: false, // indicator if there are more user reports to load
      news: [], // all news update posts from actifit account
      activeNews: null // news shown in the modal
    },
    getters,
    mutations,
    actions,
    modules: {
      steemconnect: Vue.SteemConnectStore
    }
  })

  store.subscribe((mutation) => {
    if (mutation.type === 'login') {
      store.dispatch('fetchUserTokens')
      store.dispatch('fetchTransactions')
    }
  })

  return store
}

export default createStore
