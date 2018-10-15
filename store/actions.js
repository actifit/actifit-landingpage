import Vue from 'vue'
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
  fetchUserReportCount ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/userRewardedPostCount/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserReportCount', json.rewarded_post_count)).catch(e => reject(e))
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
  fetchUserRank ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifitbot.herokuapp.com/getRank/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserRank', json.user_rank)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  }, 
  fetchTopDelegators ({ state, commit }, maxCount){
	return new Promise((resolve, reject) => {
		var targetUrl = 'https://actifitbot.herokuapp.com/topDelegators';
		if (Number.isInteger(maxCount)){
			targetUrl += '?count='+maxCount;
		}
		fetch(targetUrl).then(res => {
			res.json().then(json => commit('setTopDelegators', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchModerators ({ commit }){
	return new Promise((resolve, reject) => {
		fetch('https://actifitbot.herokuapp.com/moderators').then(res => {
			res.json().then(json => commit('setModerators', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchAmbassadors ({ commit }){
	return new Promise((resolve, reject) => {
		fetch('https://actifitbot.herokuapp.com/ambassadors').then(res => {
			res.json().then(json => commit('setAmbassadors', json || [])).catch(e => reject(e))
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
              leaderboard.push({username: data[1], activity_count: data[2]})
            }
          })
          commit('setLeaderboard', leaderboard)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchReports ({ state, commit, dispatch }) {
    // fetches initial posts or more posts if invoked again
	
	//grab list of banned users first
	let bannedUsers = [];
	fetch('https://actifitbot.herokuapp.com/banned_users').then(res => {
		res.json().then(json => {
			bannedUsers = json;
			
			//proceed with grabbing posts
			return new Promise((resolve, reject) => {
				console.log('let\'s get discussions');
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
				  //posts = posts.filter(bannedUsersFilter([{user:'inlakech'},{user:'tecire'},{user:'sssssss'}])) //get rid of banned users posts
				  //new function to filter out banned users and their posts
				  posts = posts.filter(function (post) {
					   let user_banned = false;
						for (let n = 0; n < bannedUsers.length; n++) {
							if (post.author == bannedUsers[n].user){
								user_banned = true;
								break;
							}
						}   
						return !user_banned
					});
				  commit('setReports', [...state.reports, ...posts]) // append them to current reports
				  dispatch('checkIfMoreReportsAvailable') // check if there's more to load (to show load more button or not)
				  resolve()
				}
			  })
			})
		}).catch(e => reject(e))
	}).catch(e => reject(e))
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
          if (start_author && start_permlink) posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(userPostsFilter) // get only actual activity reports
          commit('setUserReports', [...state.userReports, ...posts])
          dispatch('checkIfMoreUserReportsAvailable', username)
          resolve()
        }
      })
    })
  },
  updateReport ({ state, commit }, options) {
    steem.api.getContent(options.author, options.permlink, (err, updatedReport) => {
      if (err) console.log(err)
      else {
        // update reports
        let index = state.reports.findIndex(report => report.author === updatedReport.author && report.permlink === updatedReport.permlink)
        if (index !== -1) {
          // use Vue.set because of: https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(state.reports, index, updatedReport)
        }

        // update user reports
        index = state.userReports.findIndex(report => report.author === updatedReport.author && report.permlink === updatedReport.permlink)
        if (index !== -1) {
          // use Vue.set because of: https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(state.userReports, index, updatedReport)
        }
      }
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
  },
  fetchNews ({ state, commit }) {
    return new Promise((resolve, reject) => {
      steem.api.getDiscussionsByBlog({tag: 'actifit', limit: 100}, (err, posts) => {
        if (err) reject(err)
        else {
          posts = posts.filter(newsFilter) // get only actual news updates
          commit('setNews', posts)
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
  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type') && meta.hasOwnProperty('tags') && meta.tags.indexOf('actifit') !== -1
}

const newsFilter = (post) => {
  return post.author === 'actifit'
}