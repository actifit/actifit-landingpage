export default {
  login (state, user) {
    state.user = user
  },
  logout (state) {
    state.user = null
  },
  setUserTokens (state, userTokens) {
    state.userTokens = userTokens
  },
  setUserCount (state, userCount) {
    state.userCount = userCount
  },
  setTokensDistributed (state, tokensDistributed) {
    state.tokensDistributed = tokensDistributed
  },
  setRewardedActivityCount (state, rewardedActivityCount) {
    state.rewardedActivityCount = rewardedActivityCount
  },
  setLeaderboard (state, leaderboard) {
    state.leaderboard = leaderboard
  }
}
