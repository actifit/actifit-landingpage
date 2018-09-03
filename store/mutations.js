export default {
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
  setActiveReport (state, report) {
    state.activeReport = report
  },
  setEditReport (state, report) {
    state.editReport = report
  },
  setMoreReportsAvailable (state, moreReportsAvailable) {
    state.moreReportsAvailable = moreReportsAvailable
  },
  setUserReports (state, userReports) {
    state.userReports = userReports
  },
  setMoreUserReportsAvailable (state, moreUserReportsAvailable) {
    state.moreUserReportsAvailable = moreUserReportsAvailable
  },
  setNews (state, news) {
    state.news = news
  },
  setActiveNews (state, activeNews) {
    state.activeNews = activeNews
  },
  setVoteWeight (state, weight) {
    state.voteWeight = weight
  },
  setPostToVote (state, post) {
    state.postToVote = post
  }
}
