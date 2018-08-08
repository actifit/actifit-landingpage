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
  setTransactions (state, transactions) {
    state.transactions = transactions
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
  },
  setReports (state, reports) {
    state.reports = reports
  },
  setMoreReportsAvailable (state, moreReportsAvailable) {
    state.moreReportsAvailable = moreReportsAvailable
  }
}
