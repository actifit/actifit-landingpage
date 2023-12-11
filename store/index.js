import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

const createStore = () => {
  const store = new Vuex.Store({
    state: {
      userTokens: 0, // logged-in user's token count
	  userReportCount: 0, // logged-in user's report count
      transactions: [], // logged-in user's transactions
	  referrals: [], //logged-in user's referrals
	  proposals: [], //proposals
	  userSettings: {}, //logged-in user's settings
	  userRank: 0, // logged-in user's rank
	  userRankObj: '', // full details about user's rank
      userCount: 0, // users using actifit
	  communitiesList: [], //list of hive communities
	  moreCommunitiesAvailable: false, //indicator if more communities can be loaded
      tokensDistributed: 0, // total amount of distributed tokens
      rewardedActivityCount: 0, // total amount of activity posts
      leaderboard: [], // top users
	  extLeaderboard: [], //top users extended
      reports: [], // all activity reports/posts
	  posts: [], // all posts
	  videos: [], // all video posts
	  topDelegators: [], //list of top delegators
	  moderators: [], //list of current moderators
	  ambassadors: [], //list of current ambassadors
	  professionals: [], //list of professional approved trainers/nutritionists/...
	  products: [], //list of products
	  realProducts: [], //list of real products bought by user
	  gadgetStats: [], //aggregate stats of user's bought gadgets
      activeReport: null, // report shown in the modal
      editReport: null, // report shown in the edit modal
	  activePost: null, // post shown in the modal
	  editPost: null, // post shown in the edit modal
      moreReportsAvailable: false, // indicator if there are more reports to load
	  morePostsAvailable: false, // indicator if there are more posts to load
      userReports: [], // logged-in user's activity reports/posts
	  userComments: [], //logged-in user's comments
	  userPosts: [], // logged-in user's posts
	  communityPosts: [], //community posts
	  moreCommunityPostsAvailable: false, //indicator for more community posts to load
	  userVideos: [], // logged-in user's videos
      moreUserReportsAvailable: false, // indicator if there are more user reports to load
	  moreUserCommentsAvailable: false, // indicator if more user comments available to load
	  moreUserPostsAvailable: false, // indicator if there are more user posts to load
	  moreUserVideosAvailable: false, // indicator if there are more user videos to load
      news: [], // all news update posts from actifit account
      activeNews: null, // news shown in the modal
      voteWeight: 100, // vote weight for voting on posts
      postToVote: null, // active post that will be voted on
	  newlyVotedPosts: [], //contains a reference to all newly voted posts on this session
	  commentEntries: [], //contains a reference to the current comments on open modal post
	  commentCountToday: 0, //contains the count of comments done by a user on a single day
	  stdLoginUser: null,
	  bchain: '',//current active blockchain
	  cartEntries: [], //contains current items being bought via market
	  purchaseSuccess: false, //references latest purchase transaction using cart
	  darkMode: false, //controls whether dark mode is active for this user's display
    },
    getters,
    mutations,
    actions,
    modules: {
      steemconnect: Vue.SteemConnectStore // login/logout actions, user mutation/getters
    }
  })

  // fetch user related data after login
  store.subscribe((mutation) => {
    if (mutation.type === 'login') {
      store.dispatch('fetchUserTokens')
      store.dispatch('fetchUserReportCount')
	  store.dispatch('fetchUserRank')
    }
  })

  return store
}

export default createStore
