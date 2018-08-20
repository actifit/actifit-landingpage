import steem from 'steem'

// returning promises to be able to wait for data

export default {
  fetchUserTokens ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/user/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserTokens', json.tokens)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchTransactions ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/transactions/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
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
          // parse weird response (#1 @ardee867 10,593;#2 @dinglehopper...)
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
    // fetches initial posts or more posts if invoked again
    return new Promise((resolve, reject) => {
      // if there are posts already, take the last one as starting point
      let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null

      // get (next) 100 posts with actifit tag
      steem.api.getDiscussionsByCreated({tag: 'actifit', limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(postsFilter) // get only actual activity reports
          commit('setReports', [...state.reports, ...posts]) // append them to current reports
          dispatch('checkIfMoreReportsAvailable') // check if there's more to load (to show load more button or not)
          resolve()
        }
      })
    })
  },
  checkIfMoreReportsAvailable ({ state, commit }) {
    return new Promise((resolve, reject) => {
      // if there are posts already, take the last one as starting point
      let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null

      // get (next) 100 posts with actifit tag
      steem.api.getDiscussionsByCreated({tag: 'actifit', limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(postsFilter) // get only actual activity reports
          commit('setMoreReportsAvailable', !!posts.length) // if posts were found, show load more button
          resolve()
        }
      })
    })
  },
  fetchUserReports ({ state, commit, dispatch }, username) {
    // fetches initial posts or more posts if invoked again
    return new Promise((resolve, reject) => {
      // if there are posts already, take the last one as starting point
      let lastReport = state.userReports.length ? state.userReports[state.userReports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null

      // get (next) 100 posts from the user
      steem.api.getDiscussionsByBlog({tag: username, limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(userPostsFilter) // get only actual activity reports
          commit('setUserReports', [...state.userReports, ...posts])
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
          posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(userPostsFilter) // get only actual activity reports
          commit('setMoreUserReportsAvailable', !!posts.length) // if posts were found, show load more button
          resolve()
        }
      })
    })
  }
}

const postsFilter = (post) => {
  let meta = JSON.parse(post.json_metadata)
  // actual activity posts must have those two properties in metadata
  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type')
}

const userPostsFilter = (post) => {
  let meta = JSON.parse(post.json_metadata)
  // actual activity posts must have those two properties in metadata
  // since, in this case, posts are fetched by users blog, we also need to check for the actifit tag
  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type') && meta.tags.indexOf('actifit') !== -1
}
