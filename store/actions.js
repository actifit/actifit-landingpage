import Vue from 'vue'
import steem from 'steem'

import hive from '@hiveio/hive-js'

import blurt from '@blurtfoundation/blurtjs'

//hive.config.set('rebranded_api', true)
//hive.broadcast.updateOperations()
hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);

steem.api.setOptions({ url: process.env.steemApiNode });

hive.api.setOptions({ url: process.env.hiveApiNode });

blurt.api.setOptions({ url: process.env.blurtApiNode });

// returning promises to be able to wait for data

export default {
  initializeDarkMode ({state, commit}){
	if (process.client) {
	const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode) {
      state.darkMode = JSON.parse(storedDarkMode);
	  commit('setDarkMode', state.darkMode);
    }
	}
  },
  toggleDarkMode ({state, commit}){
	//console.log(state.darkMode);
	state.darkMode = !state.darkMode;
	commit('setDarkMode', state.darkMode);
	localStorage.setItem('darkMode', state.darkMode);
  },
  fetchUserTokens ({ state, commit }, tgtUser) {
    return new Promise((resolve, reject) => {
	  let user = (tgtUser && tgtUser != '')?tgtUser:state.steemconnect.user.account.name.toLowerCase();
      fetch(process.env.actiAppUrl+'user/' + user).then(res => {
        res.json().then(json => commit('setUserTokens', json.tokens)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchUserTokensReturn ({ state, commit }, tgtUser) {
    return new Promise((resolve, reject) => {
	  let user = (tgtUser && tgtUser != '')?tgtUser:state.steemconnect.user.account.name.toLowerCase();
      fetch(process.env.actiAppUrl+'user/' + user).then(res => {
        res.json().then(json => resolve(json.tokens)).catch(e => reject(e))
      }).catch(e => reject(e))
    })
  },
  fetchUserSettings({state, commit}){
	return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'userSettings/' + state.steemconnect.user.account.name.toLowerCase()).then(res => {
        res.json().then(json => commit('setUserSettings', json.settings)).catch(e => reject(e))
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
  fetchTransactions ({ state, commit }, tgtUser) {
	let user = (tgtUser && tgtUser != '')?tgtUser:state.steemconnect.user.account.name.toLowerCase();
    return new Promise((resolve, reject) => {
      fetch(process.env.actiAppUrl+'transactions/' + user).then(res => {
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
  async fetchUserBoughtRealProducts ({ state, commit }, accToken){
	//return new Promise((resolve, reject) => {
		
		let url = new URL(process.env.actiAppUrl + 'realProductsBought/?user=' + state.steemconnect.user.account.name.toLowerCase()+'&buyer='+ state.steemconnect.user.account.name.toLowerCase());
			
		let reqHeads = new Headers({
		  'Content-Type': 'application/json',
		  'x-acti-token': 'Bearer ' + accToken,
		});
		let res = await fetch(url, {
			method: 'GET',
			headers: reqHeads,
		});
		
		let outcome = await res.json();
		commit('setRealProducts', outcome || []);
		
		//}).catch(e => reject(e))
    //})
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
  fetchUserCommunitySubs ({state, commit}){
	return new Promise((resolve, reject) => {
	  let outc = hive.api.call('bridge.list_all_subscriptions', {account: state.steemconnect.user.account.name.toLowerCase()}, (err, result) => {
		console.log(err, result);
		if (err) reject(err)
		else {
			resolve(result);
		}
	  });
	})
  },
  fetchCommunities ({state, commit}, params){
	return new Promise((resolve, reject) => {
		//console.log(params);
		let sOrder = params.sortOrder?params.sortOrder:'subs';//default sort by subscribers count unless specified otherwise
		let finalQuery = {limit: 100, sort: sOrder};
		if (params.query && params.query != ''){
			finalQuery['query'] = params.query;
		}
		if (params.last && params.last != ''){
			finalQuery['last'] = params.last;
		}
		//console.log('final query')
		//console.log(finalQuery);
		let outc = hive.api.call('bridge.list_communities', finalQuery, (err, result) => {
			//console.log(err, result);
			if (err) reject(err)
			else {
				if (params.last){
					commit('appendCommunitiesList', result)
				}else{
					commit('setCommunitiesList', result)
				}
				resolve(result);
			}
		});
	})	  
  },
  fetchSpecificCommunity ({state, commit}, name){
	return new Promise((resolve, reject) => {
		let outc = hive.api.call('bridge.get_community', {name: name}, (err, result) => {
			console.log(err, result);
			if (err) reject(err)
			else {
				resolve(result);
			}
		});
	})	  
  },
  /*fetchPopCommunities ({state, commit}){
	return new Promise((resolve, reject) => {
	  let outc = hive.api.call('bridge.list_pop_communities', {limit: 10}, (err, result) => {
		console.log(err, result);
		if (err) reject(err)
		else {
			resolve(result);
		}
	  });
	})
  },*/
  fetchReports ({ state, commit, dispatch }) {
    // fetches initial posts or more posts if invoked again
	
	//grab list of banned users first
	let bannedUsers = [];
	fetch(process.env.actiAppUrl+'banned_users').then(res => {
		res.json().then(json => {
			bannedUsers = json;
			
			//proceed with grabbing posts
			return new Promise((resolve, reject) => {
				//console.log('let\'s get discussions');
			  // if there are posts already, take the last one as starting point
			  let lastReport = state.reports.length ? state.reports[state.reports.length - 1] : null
			  let start_author = lastReport ? lastReport.author : null
			  let start_permlink = lastReport ? lastReport.permlink : null

			  //set proper blockchain selection
			  let chainLnk = hive;
			  if (state.bchain == 'STEEM'){
				chainLnk = steem;
			  }else if (state.bchain == 'BLURT'){
				chainLnk = blurt;
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
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
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
  
  fetchPosts ({ state, commit, dispatch }) {
    // fetches initial posts or more posts if invoked again
	
	//grab list of banned users first
	let bannedUsers = [];
	fetch(process.env.actiAppUrl+'banned_users').then(res => {
		res.json().then(json => {
			bannedUsers = json;
			
			//proceed with grabbing posts
			return new Promise((resolve, reject) => {
				//console.log('let\'s get discussions');
			  // if there are posts already, take the last one as starting point
			  let lastPost = state.posts.length ? state.posts[state.posts.length - 1] : null
			  let start_author = lastPost ? lastPost.author : null
			  let start_permlink = lastPost ? lastPost.permlink : null

			  //set proper blockchain selection
			  let chainLnk = hive;
			  if (state.bchain == 'STEEM'){
				chainLnk = steem;
			  }else if (state.bchain == 'BLURT'){
				chainLnk = blurt;
			  }

			  // get (next) 100 posts with actifit tag
			  chainLnk.api.getDiscussionsByCreated({tag: '', limit: 100, start_author, start_permlink}, (err, posts) => {
				if (err) reject(err)
				else {
				  posts.shift() // remove the first posts because its the last post from before
				  //posts = posts.filter(postsFilter) // get only actual activity posts
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
				  commit('setPosts', [...state.posts, ...posts]) // append them to current posts
				  dispatch('checkIfMorePostsAvailable') // check if there's more to load (to show load more button or not)
				  resolve()
				}
			  })
			})
		}).catch(e => (console.log(e),reject(e)))
	}).catch(e => reject(e))
  },
  

  checkIfMorePostsAvailable ({ state, commit }) {
    return new Promise((resolve, reject) => {
      // if there are posts already, take the last one as starting point
      let lastPost = state.posts.length ? state.posts[state.posts.length - 1] : null
      let start_author = lastPost ? lastPost.author : null
      let start_permlink = lastPost ? lastPost.permlink : null
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
      // get (next) 100 posts with actifit tag
      chainLnk.api.getDiscussionsByCreated({tag: '', limit: 100, start_author, start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift() // remove the first posts because its the last post from before
          //posts = posts.filter(postsFilter) // get only actual activity posts
          commit('setMorePostsAvailable', !!posts.length) // if posts were found, show load more button
          resolve()
        }
      })
    })
  },
  
  fetchUserComments ({ state, commit, dispatch }, username) {
    // fetches initial posts or more posts if invoked again
    return new Promise((resolve, reject) => {
      // if there are comments already, take the last one as starting point
      let lastComment = state.userComments.length ? state.userComments[state.userComments.length - 1] : null
      let start_author = lastComment ? lastComment.author : null
      let start_permlink = lastComment ? lastComment.permlink : null
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  //console.log(username);
	  //let outc = await chainLnk.api.callAsync('bridge.get_account_posts', {sort: 'comments', account: username, limit: 100, start_author: start_author, start_permlink: start_permlink})
	  let outc = chainLnk.api.call('bridge.get_account_posts', {sort: 'comments', account: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, comments) => {
			if (err) reject(err)
			else {
				//console.log(comments)
				commit('setUserComments', [...state.userComments, ...comments])
				//console.log(comments);
				dispatch('checkIfMoreUserCommentsAvailable', username)
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
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
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
  
  fetchUserPosts ({ state, commit, dispatch }, username) {
    // fetches initial posts or more posts if invoked again
    return new Promise((resolve, reject) => {
      // if there are posts already, take the last one as starting point
      let lastPost = state.userPosts.length ? state.userPosts[state.userPosts.length - 1] : null
      let start_author = lastPost ? lastPost.author : null
      let start_permlink = lastPost ? lastPost.permlink : null
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  //console.log('get blog posts');
      // get (next) 100 posts from the user
      chainLnk.api.getDiscussionsByBlog({tag: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, posts) => {
		//console.log(err,posts);
        if (err) reject(err)
        else {
          if (start_author && start_permlink) posts.shift() // remove the first posts because its the last post from before
		  //posts = posts.filter(userPostsFilter(username)) // get only actual activity posts
          commit('setUserPosts', [...state.userPosts, ...posts])
          dispatch('checkIfMoreUserPostsAvailable', username)
          resolve()
        }
      })
    })
  },
  
  //fetch popular communities: top 20
  fetchPopCommunities({ state, commit }){
	return new Promise((resolve, reject) => {
		let chainLnk = hive;
	
		let callQuery = {limit: 25};
		let outc = chainLnk.api.call('bridge.list_pop_communities', callQuery, (err, comms) => {
			if (err) reject(err)
			else {
				console.log('fetchpop');
				console.log(comms)
				resolve(comms);
			}
		});
	});
  },
  
  fetchCommunityPosts ({ state, commit, dispatch }, params) {
    // fetches initial posts or more posts if invoked again
    return new Promise((resolve, reject) => {
		//console.log('get community posts:'+params.community+' - '+params.type);
      // if there are posts already, take the last one as starting point
      let lastPost = state.communityPosts.length ? state.communityPosts[state.communityPosts.length - 1] : null
      let start_author = lastPost ? lastPost.author : null
      let start_permlink = lastPost ? lastPost.permlink : null
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  let callQuery = {sort: params.type, tag: params.community};
	  let appendMode = false;
	  if (params.lastAuth && params.lastPerm){
		  callQuery['start_author'] = params.lastAuth;
          callQuery['start_permlink'] = params.lastPerm;
		  appendMode = true;
	  }
      // get (next) 100 posts from the user
      let outc = chainLnk.api.call('bridge.get_ranked_posts', callQuery, (err, posts) => {
			if (err) reject(err)
			else {
				//console.log(comments)
				if (params.returnData){
					//console.log(posts);
					resolve({posts: posts, morePostsAvailable: !!posts.length});
				}else{
					if (appendMode){
						commit('appendCommunityPosts', posts)
					}else{
						commit('setCommunityPosts', [...state.communityPosts, ...posts])
					}
					//console.log(posts);
					//dispatch('checkIfMoreUserCommentsAvailable', username)
					commit('setMoreCommunityPostsAvailable', !!posts.length) // if posts were found, show load more button
					resolve()	
				}				
			}
		})
    })
  },
  
  //fetch popular communities: top 20
  fetchProposals({ state, commit }, params){
	return new Promise(async (resolve, reject) => {
		
		let sOrder = params && params.sortOrder?params.sortOrder:'by_creator';//default sort by vote count unless specified otherwise
		let soDir = params && params.sortDir?params.sortDir:'ascending';
		let stats = params && params.stat?params.stat:'active';
		let limit = params && params.limit?params.limit:1000;
		let cstmParam = params && params.cstmparam?params.cstmparam:'';
		let chainLnk = hive;
	
		//https://developers.hive.io/apidefinitions/#condenser_api.list_proposals
		
		//by_creator
		let outc = await chainLnk.api.callAsync('condenser_api.list_proposals',[[cstmParam], limit, sOrder, soDir, stats]);
		//let outc = chainLnk.api.call('bridge.list_pop_communities', callQuery, (err, comms) => {
			if (outc){
				console.log('fetch proposals');
				console.log(outc)
				commit('setProposals', outc)
				resolve(outc);
			}else{
				 reject('error');
			}
		//});
	});
  },
  
  fetchUserVideos ({ state, commit, dispatch }, username) {
    // fetches initial videos or more videos if invoked again
    return new Promise((resolve, reject) => {
      // if there are videos already, take the last one as starting point
      let lastVideo = state.userVideos.length ? state.userVideos[state.userVideos.length - 1] : null
      let start_author = lastVideo ? lastVideo.author : null
      let start_permlink = lastVideo ? lastVideo.permlink : null
	  
	   //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
      // get (next) 100 videos from the user
      chainLnk.api.getDiscussionsByBlog({tag: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, videos) => {
        if (err) reject(err)
        else {
          if (start_author && start_permlink) videos.shift() // remove the first videos because its the last video from before
		  videos = videos.filter(userVideosFilter(username)) // get only actual activity videos
          commit('setUserVideos', [...state.userVideos, ...videos])
		  //console.log('found videos:');
		  //console.log(videos);
          dispatch('checkIfMoreUserVideosAvailable', username)
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
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
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
  
  fetchPostComments ({ state, commit, dispatch }, post) {
	// handles grabbing comments for currently opened post
	return new Promise((resolve, reject) => {
	  let post_param = post.category + '/@' + post.author + '/' + post.permlink;
	  let cur_ref = this;
	  
	  //set proper blockchain selection
 
	   //set proper blockchain selection
	   //particularly for the getstate, we need a node supporting getstate, so we will use specifically 
	  let chainLnk = hive;
	  hive.api.setOptions({ url: process.env.hiveStateApiNode });
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
	  //using getState to fetch all level comments
	  chainLnk.api.getState (post_param, function (err, result){
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
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
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
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
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
  
  checkIfMoreUserCommentsAvailable ({ state, commit }, username) {
    return new Promise((resolve, reject) => {
      let lastComment = state.userComments.length ? state.userComments[state.userComments.length - 1] : null
      let start_author = lastComment ? lastComment.author : null
      let start_permlink = lastComment ? lastComment.permlink : null
	  
	  //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
	  let outc = chainLnk.api.call('bridge.get_account_posts', {sort: 'comments', account: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, comments) => {
			if (err) reject(err)
			else {
				//console.log(comments)
				commit('setUserComments', [...state.userComments, ...comments])
				//console.log(comments);
				//dispatch('checkIfMoreUserCommentsAvailable', username)
				commit('setMoreUserCommentsAvailable', !!comments.length) // if posts were found, show load more button
				resolve()	  
			}
		})
    })
  },
  
  
  
  updatePost ({ state, commit }, options) {
	  
	//set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
	  
    chainLnk.api.getContent(options.author, options.permlink, (err, updatedPost) => {
      if (err) console.log(err)
      else {
        // update posts
        let index = state.posts.findIndex(post => post.author === updatedPost.author && post.permlink === updatedPost.permlink)
        if (index !== -1) {
          // use Vue.set because of: https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(state.posts, index, updatedPost)
        }

        // update user posts
        index = state.userPosts.findIndex(post => post.author === updatedPost.author && post.permlink === updatedPost.permlink)
        if (index !== -1) {
          // use Vue.set because of: https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(state.userPosts, index, updatedPost)
        }
      }
    })
  },
  checkIfMoreUserPostsAvailable ({ state, commit }, username) {
    return new Promise((resolve, reject) => {
      let lastPost = state.userPosts.length ? state.userPosts[state.userPosts.length - 1] : null
      let start_author = lastPost ? lastPost.author : null
      let start_permlink = lastPost ? lastPost.permlink : null
	  
	  //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
      chainLnk.api.getDiscussionsByBlog({tag: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, posts) => {
        if (err) reject(err)
        else {
          posts.shift() // remove the first posts because its the last post from before
          posts = posts.filter(userPostsFilter(username)) // get only actual activity posts
          commit('setMoreUserPostsAvailable', !!posts.length) // if posts were found, show load more button
          resolve()
        }
      })
    })
  },
  
  checkIfMoreUserVideosAvailable ({ state, commit }, username) {
    return new Promise((resolve, reject) => {
      let lastVideo = state.userVideos.length ? state.userVideos[state.userVideos.length - 1] : null
      let start_author = lastVideo ? lastVideo.author : null
      let start_permlink = lastVideo ? lastVideo.permlink : null
	  
	  //set proper blockchain selection
	  let chainLnk = hive;
	  if (state.bchain == 'STEEM'){
		chainLnk = steem;
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
	  }
	  
      chainLnk.api.getDiscussionsByBlog({tag: username, limit: 100, start_author: start_author, start_permlink: start_permlink}, (err, videos) => {
        if (err) reject(err)
        else {
          videos.shift() // remove the first videos because its the last video from before
          videos = videos.filter(userVideosFilter(username)) // get only actual activity videos
          commit('setMoreUserVideosAvailable', !!videos.length) // if videos were found, show load more button
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
	  }else if (state.bchain == 'BLURT'){
		chainLnk = blurt;
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
	  return meta.hasOwnProperty('step_count') && meta.hasOwnProperty('activity_type') && post.author === username && ( ( meta.hasOwnProperty('tags') && ( meta.tags.indexOf('actifit') !== -1 || meta.tags.indexOf('hive-193552') !== -1)) || post.category == 'actifit' || post.category == 'hive-193552' || ( meta.hasOwnProperty('community') && (meta.community.indexOf('actifit') !== -1) || meta.community.indexOf('hive-193552') !== -1) ) 
  }catch(exc){
	  return false;
  }
}

const userVideosFilter = username => (post) => {
  try{
	  let meta = JSON.parse(post.json_metadata)
	  // videos posts are the ones belonging to 3speak community
	  return post.author === username && meta.hasOwnProperty('video');// && post.category == 'hive-181335';// || ( meta.hasOwnProperty('community') && meta.community.indexOf('hive-181335') !== -1 ) 
	  //removing 3speak app requirement as vids can be submitted via other dapps such as actifit 
	  //meta.hasOwnProperty('type') && ( meta.type.indexOf('3speak/video') !== -1) && 
  }catch(exc){
	  return false;
  }
}

const newsFilter = (post) => {
  return post.author === 'actifit'
}