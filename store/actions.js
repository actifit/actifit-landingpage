import Vue from 'vue'
import VueSteemConnect from 'vue-steemconnect'
import steem from 'steem'

// make steemconnect available
Vue.use(VueSteemConnect, {
  app: 'actifit.app',
  callbackURL: process.env.scRedirectUrl || 'http://localhost:3000/auth'
})

export default {
  login ({ commit, dispatch, state }) {
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
              dispatch('fetchUserTokens')
              dispatch('fetchTransactions')
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
  },
  fetchUserTokens ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/user/' + state.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserTokens', json.tokens)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchTransactions ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/transactions/' + state.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setTransactions', json || [])).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchTokenInfo ({ commit }) {
    commit('setUserCount', 0) // reset to trigger animation again
    commit('setTokensDistributed', 0) // reset to trigger animation again
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/user-tokens-info').then(res => {
        res.json().then(json => {
          commit('setUserCount', json[0].user_count)
          commit('setTokensDistributed', json[0].tokens_distributed)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchRewardedActivityCount ({ commit }) {
    commit('setRewardedActivityCount', 0) // reset to trigger animation again
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/rewarded-activity-count').then(res => {
        res.json().then(json => {
          commit('setRewardedActivityCount', json[0].reward_count)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchLeaderboard ({ commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifit-pst-cr3at0r.herokuapp.com/api/top5p0sts', {method: 'POST'}).then(res => {
        res.text().then(text => {
          let leaderboard = []
          let items = text.split(';').filter(Boolean)
          items.forEach(item => {
            let data = item.split(' ')
            if (data) {
              leaderboard.push({username: data[1].replace('@', ''), rewards: data[2]})
            }
          })
          commit('setLeaderboard', leaderboard)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchReports ({ state, commit, dispatch }) {
    return new Promise((resolve, reject) => {
      let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null
      steem.api.getDiscussionsByCreated({tag: 'actifit', limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift()
          posts = posts.filter(postsFilter)
          commit('setReports', [...state.reports, ...posts])
          dispatch('checkIfMoreReportsAvailable')
          resolve()
        }
      })
    })
  },
  checkIfMoreReportsAvailable ({ state, commit }) {
    return new Promise((resolve, reject) => {
      let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null
      steem.api.getDiscussionsByCreated({tag: 'actifit', limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift()
          posts = posts.filter(postsFilter)
          commit('setMoreReportsAvailable', !!posts.length)
          resolve()
        }
      })
    })
  },
  fetchUserReports ({ state, commit, dispatch }, username) {
    return new Promise((resolve, reject) => {
      let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null
      steem.api.getDiscussionsByBlog({tag: username, limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift()
          posts = posts.filter(userPostsFilter)
          commit('setUserReports', [...state.reports, ...posts])
          dispatch('checkIfMoreUserReportsAvailable', username)
          resolve()
        }
      })
    })
  },
  checkIfMoreUserReportsAvailable ({ state, commit }, username) {
    return new Promise((resolve, reject) => {
      let lastReport = state.userReports.length ? state.userReports[state.userReports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null
      steem.api.getDiscussionsByBlog({tag: username, limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift()
          posts = posts.filter(userPostsFilter)
          commit('setMoreUserReportsAvailable', !!posts.length)
          resolve()
        }
      })
    })
  }
}

const postsFilter = (post) => {
  let meta = JSON.parse(post.json_metadata)
  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type')
}

const userPostsFilter = (post) => {
  let meta = JSON.parse(post.json_metadata)
  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type') && meta.tags.indexOf('actifit') !== -1
}
