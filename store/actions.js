import Vue from 'vue'
import steem from 'steem'

import hive from '@hiveio/hive-js'

//hive.config.set('rebranded_api', true)
//hive.broadcast.updateOperations()
hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);

steem.api.setOptions({ url: process.env.steemApiNode });

hive.api.setOptions({ url: process.env.hiveApiNode });



// returning promises to be able to wait for data

export default {
  fetchUserTokens ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'user/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserTokens', json.tokens)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchUserReportCount ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'userRewardedPostCount/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserReportCount', json.rewarded_post_count)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchTransactions ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'transactions/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setTransactions', json || [])).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchReferrals ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'signups/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setReferrals', json || [])).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  }, 
  fetchUserRank ({ state, commit }) {
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'getRank/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserRank', json)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  }, 
  fetchTopDelegators ({ state, commit }, maxCount){
	return new Promise((resolve, reject) => {
		var targetUrl = process.env.actiAppUrl+'topDelegators';
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
		fetch(process.env.actiAppUrl+'moderators').then(res => {
			res.json().then(json => commit('setModerators', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchAmbassadors ({ commit }){
	return new Promise((resolve, reject) => {
		fetch(process.env.actiAppUrl+'ambassadors').then(res => {
			res.json().then(json => commit('setAmbassadors', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchPros ({ commit }){
	return new Promise((resolve, reject) => {
		fetch(process.env.actiAppUrl+'professionals').then(res => {
			res.json().then(json => commit('setProfessionals', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchProducts ({ commit }){
	return new Promise((resolve, reject) => {
		fetch(process.env.actiAppUrl+'products').then(res => {
			res.json().then(json => commit('setProducts', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchUserGadgetStats ({ state, commit }){
	return new Promise((resolve, reject) => {
		fetch(process.env.actiAppUrl+'boughtGadgetCountByUser/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
			res.json().then(json => commit('setGadgetStats', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchUserBoughtRealProducts ({ state, commit }){
	return new Promise((resolve, reject) => {
		fetch(process.env.actiAppUrl+'realProductsBought/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
			res.json().then(json => commit('setRealProducts', json || [])).catch(e => reject(e))
		}).catch(e => reject(e))
    })
  },
  fetchTokenInfo ({ commit }) {
    commit('setUserCount', 0) // reset to trigger animation again
    commit('setTokensDistributed', 0) // reset to trigger animation again
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'user-tokens-info').then(res => {
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
      fetch(process.env.actiAppUrl+'rewarded-activity-count').then(res => {
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
  fetchExtendedLeaderboard ({ commit }) {
    return new Promise((resolve, reject) => {
      fetch('https://actifit-pst-cr3at0r.herokuapp.com/api/topP0stsV2', {method: 'POST'}).then(res => {
        res.json().then(json => {
          commit('setExtendedLeaderboard', json)
        }).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchReports ({ state, commit, dispatch }) {
    // fetches initial posts or more posts if invoked again
	
	//grab list of banned users first
	let bannedUsers = [];
	fetch(process.env.actiAppUrl+'banned_users').then(res => {
		res.json().then(json => {
			bannedUsers = json;
			
			//proceed with grabbing posts
			return new Promise((resolve, reject) => {
				console.log('let\'s get discussions');
			  // if there are posts already, take the last one as starting point
			  let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
			  let start_author = lastReport ? lastReport.author : null
			  let start_permlink = lastReport ? lastReport.permlink : null

			  //set proper blockchain selection
			  let chainLnk = hive;
			  if (state.bchain == 'STEEM'){
				chainLnk = steem;
			  }

			  // get (next) 100 posts with actifit tag
			  chainLnk.api.getDiscussionsByCreated({tag: 'actifit', limit: 100, start_author, start_permlink}, (err, posts) => {
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
		}).catch(e => (console.log(e),reject(e)))
	}).catch(e => reject(e))
  },
  checkIfMoreReportsAvailable ({ state, commit }) {
    return new Promise((resolve, reject) => {
      // if there are posts already, take the last one as starting point
      let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
      let start_author = lastReport ? lastReport.author : null
      let start_permlink = lastReport ? lastReport.permlink : null
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }
	  
      // get (next) 100 posts with actifit tag
      chainLnk.api.getDiscussionsByCreated({tag: 'actifit', limit: 100, start_author, start_permlink}, (err, posts) => {
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
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }
	  
      // get (next) 100 posts from the user
      chainLnk.api.getDiscussionsByBlog({tag: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          if (start_author && start_permlink) posts.shift() // remove the first posts because its the last post from before
		  posts = posts.filter(userPostsFilter(username)) // get only actual activity reports
          commit('setUserReports', [...state.userReports, ...posts])
          dispatch('checkIfMoreUserReportsAvailable', username)
          resolve()
        }
      })
    })
  },
  fetchReportComments ({ state, commit, dispatch }, report) {
	// handles grabbing comments for currently opened post
	return new Promise((resolve, reject) => {
	  let report_param = report.category + '/@' + report.author + '/' + report.permlink;
	  let cur_ref = this;
	  
	  //set proper blockchain selection
 
	   //set proper blockchain selection
	   //particularly for the getstate, we need a node supporting getstate, so we will use specifically 
	  let chainLnk = hive;
	  hive.api.setOptions({ url: process.env.hiveStateApiNode });
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }
	  
	  //using getState to fetch all level comments
	  chainLnk.api.getState (report_param, function (err, result){
		//sort results by depth so as we display entries properly
		let comments_found = Object.values(result.content).sort( function (comment_a, comment_b){
		  return comment_a.depth < comment_b.depth? -1:1; 
		});
		//go through sorted items, set them up in a suitable tree chart for proper display

		//loop through all entries starting at the very bottom
		for (let i = comments_found.length - 1 ; i > 0 ;--i){
			//try to match the parent of each entry to build a proper tree
			for (let j = i - 1; j >= 0 ; --j){
				if (comments_found[i].parent_author == comments_found[j].author
					&& comments_found[i].parent_permlink == comments_found[j].permlink){
					if (comments_found[j].reply_entries == null){
						comments_found[j].reply_entries = [];
					}
					comments_found[j].reply_entries.push(comments_found[i]);
				}
			}
		}
		//the proper tree now lies in entry 0 with all subsequent comments, let's set it to our comment rendering var

		commit('setCommentEntries', comments_found.slice(0, 1)[0]) // if posts were found, show load more button
		resolve()

	  });
	})
  },
  updateReport ({ state, commit }, options) {
	  
	//set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }
	  
	  
    chainLnk.api.getContent(options.author, options.permlink, (err, updatedReport) => {
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
	  
	  //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }
	  
      chainLnk.api.getDiscussionsByBlog({tag: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(userPostsFilter(username)) // get only actual activity reports
          commit('setMoreUserReportsAvailable', !!posts.length) // if posts were found, show load more button
          resolve()
        }
      })
    })
  },
  fetchNews ({ state, commit }) {
    return new Promise((resolve, reject) => {
		
	  //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }
		
      chainLnk.api.getDiscussionsByBlog({tag: 'actifit', limit: 100}, (err, posts) => {
        if (err) reject(err)
        else {
          posts = posts.filter(newsFilter) // get only actual news updates
          commit('setNews', posts)
          resolve()
        }
      })
    })
  },
}

const postsFilter = (post) => {
  try{
	  let meta = JSON.parse(post.json_metadata)
	  // actual activity posts must have those two properties in metadata
	  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type')
  }catch(exc){
	  return false;
  }
}

const userPostsFilter = username => (post) => {
  try{
	  let meta = JSON.parse(post.json_metadata)
	  // actual activity posts must have those two properties in metadata
	  // since, in this case, posts are fetched by users blog, we also need to check for the actifit tag
	  // add to that, we need to skip resteems, so we need to ensure this is the same author
	  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type') && post.author === username && ( ( meta.hasOwnProperty('tags') && meta.tags.indexOf('actifit') !== -1) || post.category == 'actifit' || ( meta.hasOwnProperty('community') && meta.community.indexOf('actifit') !== -1) ) 
  }catch(exc){
	  return false;
  }
}

const newsFilter = (post) => {
  return post.author === 'actifit'
}