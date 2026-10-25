import { savePostingKey, clearPostingKey, loadPostingKey, typedKeySessionActive, isPostingKeyOf } from '~/utils/postingKeyStore'
import Vue from 'vue'
import Vuex from 'vuex'

import getters from './getters'
import mutations from './mutations'
import actions from './actions'

// Keep the browser copy of the typed-key posting key (utils/postingKeyStore.js) in step
// with the store. At login the key is committed BEFORE the account, so both mutations
// are watched; it is saved once the account is known AND the key is one of its posting
// keys.
function syncPostingKey (store, state, type) {
  try {
    const wif = state.chatPostingKey
    const account = state.steemconnect && state.steemconnect.user && state.steemconnect.user.account
    if (type === 'setChatPostingKey' && !wif) {
      clearPostingKey()
      return
    }
    if (!typedKeySessionActive()) {
      // Logged in with Keychain / HiveAuth / HiveSigner (e.g. "switch user"): a typed
      // key from the previous session must not linger in memory or storage.
      if (type === 'steemconnect/login' && wif) store.commit('setChatPostingKey', null)
      return
    }
    if (!wif || !account) return
    if (isPostingKeyOf(account, wif)) {
      savePostingKey(account.name, wif)
    } else if (type === 'steemconnect/login') {
      // The key in memory is not this account's - e.g. a stale tab learning that another
      // user logged in elsewhere. Use what is stored for the current user instead.
      store.commit('setChatPostingKey', loadPostingKey())
    }
  } catch (e) { /* storage unavailable: memory-only */ }
}

const createStore = () => {
  const store = new Vuex.Store({
    state: {
      // Post-login security notice from actifit-bot (security_notice in the /loginAuth
      // success body). Rendered by layouts/default.vue, NOT by the login components:
      // LoginModal closes itself on success and pages/login redirects, so a banner in
      // either would be destroyed before anyone read it.
      securityNotice: null,
      userTokens: 0, // logged-in user's token count
      userReportCount: 0, // logged-in user's report count
      transactions: [], // logged-in user's transactions
      referrals: [], //logged-in user's referrals
      proposals: [], //proposals
      proposalVoters: [],
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
      arenaChallenges: [], //Challenge Engine — active/open challenges (The Arena)
      arenaChallenge: null, //Challenge Engine — single challenge (+participants) for the detail page
      arenaStandings: null, //Challenge Engine — materialized standings for the detail page
      arenaMerits: null, //Challenge Engine — logged-in user's Merit balance + ledger
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
      commentEntries: [], //contains a reference to the current comments on open modal post
      commentCountToday: 0, //contains the count of comments done by a user on a single day
      stdLoginUser: null,
      // The typed-key user's posting key, for signing in the browser. Mirrored to
      // localStorage (utils/postingKeyStore.js) so reloads and new tabs keep it; never
      // sent to the server, never in runtime config. Active keys never come here.
      chatPostingKey: null,
      bchain: '',//current active blockchain
      cartEntries: [], //contains current items being bought via market
      purchaseSuccess: false, //references latest purchase transaction using cart
      darkMode: false, //controls whether dark mode is active for this user's display
      featuredActifitter: null, //Actifitter of the Month spotlight (Trello #110), null = hidden
    },
    getters,
    mutations,
    actions,
    modules: {
      steemconnect: Vue.SteemConnectStore // login/logout actions, user mutation/getters
    }
  })

  // fetch user related data after login
  store.subscribe((mutation, state) => {
    if (mutation.type === 'login') {
      store.dispatch('fetchUserTokens')
      store.dispatch('fetchUserReportCount')
      store.dispatch('fetchUserRank')
    } else if (mutation.type === 'steemconnect/logout') {
      store.commit('setChatPostingKey', null)
    }
    if (process.client && (mutation.type === 'setChatPostingKey' || mutation.type === 'steemconnect/login')) {
      syncPostingKey(store, state, mutation.type)
    }
  })

  return store
}

export default createStore
