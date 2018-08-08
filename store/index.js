import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

const createStore = () => {
  return new Vuex.Store({
    state: {
      user: null, // logged in user, via steemconnect
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
    },
    getters,
    mutations,
    actions
  })
}

export default createStore
