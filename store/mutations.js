export default {
  setUserTokens (state, userTokens) {
    state.userTokens = userTokens
  },
  setUserReportCount (state, userReportCount) {
    state.userReportCount = userReportCount
  },
  setTransactions (state, transactions) {
    state.transactions = transactions
  },
  setProposals (state, proposals){
	  state.proposals = proposals
  },
  setReferrals (state, referrals) {
    state.referrals = referrals
  },
  setUserSettings (state, settings){
	state.userSettings = settings  
  },
  setDarkMode (state, darkMode){
	state.darkMode = darkMode
  },
  setUserRank (state, userRank) {
    state.userRankObj = userRank
	state.userRank = userRank.user_rank
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
  appendCommunitiesList (state, list) {
    state.communitiesList.push(...list)
  },
  setCommunitiesList (state, list) {
    state.communitiesList = list
  },
  setMoreCommunitiesAvailable (state, moreCommunitiesAvailable){
	state.moreCommunitiesAvailable = moreCommunitiesAvailable
  },
  setExtendedLeaderboard (state, leaderboard) {
    state.extLeaderboard = leaderboard
  },
  setReports (state, reports) {
    state.reports = reports
  },
  setPosts (state, posts){
	state.posts = posts
  },
  setVideos (state, videos){
	state.videos = videos  
  },
  setTopDelegators (state, topDelegators) {
    state.topDelegators = topDelegators
  },
  setModerators (state, moderators) {
    state.moderators = moderators
  },
  setAmbassadors (state, ambassadors) {
    state.ambassadors = ambassadors
  },
  setProfessionals (state, professionals) {
	state.professionals = professionals
  },
  setProducts (state, products) {
	state.products = products
  },
  setRealProducts (state, realProds) {
	state.realProducts = realProds
  },
  setGadgetStats (state, gadgetStats) {
	state.gadgetStats = gadgetStats
  },
  setActiveReport (state, report) {
    state.activeReport = report
  },
  setEditReport (state, report) {
    state.editReport = report
  },
  setActivePost (state, post) {
    state.activePost = post
  },
  setEditPost (state, post) {
    state.editPost = post
  },
  setMoreUserCommentsAvailable(state, moreUserCommentsAvailable){
	state.moreUserCommentsAvailable = moreUserCommentsAvailable  
  },
  setMoreReportsAvailable (state, moreReportsAvailable) {
    state.moreReportsAvailable = moreReportsAvailable
  },
  setUserComments (state, userComments) {
	state.userComments = userComments  
  },
  setUserReports (state, userReports) {
    state.userReports = userReports
  },
  setMoreUserReportsAvailable (state, moreUserReportsAvailable) {
    state.moreUserReportsAvailable = moreUserReportsAvailable
  },
  setMorePostsAvailable (state, morePostsAvailable) {
    state.morePostsAvailable = morePostsAvailable
  },
  setUserPosts (state, userPosts) {
    state.userPosts = userPosts
  },
  setMoreUserPostsAvailable (state, moreUserPostsAvailable) {
    state.moreUserPostsAvailable = moreUserPostsAvailable
  },
  appendCommunityPosts (state, newPosts) {
    state.communityPosts.push(...newPosts)
  },
  setCommunityPosts (state, communityPosts) {
    state.communityPosts = communityPosts
  },
  setMoreCommunityPostsAvailable (state, moreCommunityPostsAvailable) {
    state.moreCommunityPostsAvailable = moreCommunityPostsAvailable
  },
  setUserVideos (state, userVideos) {
    state.userVideos = userVideos
  },
  setMoreUserVideosAvailable (state, moreUserVideosAvailable) {
    state.moreUserVideosAvailable = moreUserVideosAvailable
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
  },
  setNewlyVotedPosts (state, newlyVotedPosts) {
    state.newlyVotedPosts = newlyVotedPosts
  },
  setCommentEntries (state, commentEntries) {
    state.commentEntries = commentEntries
  },
  setCommentCountToday (state, commentCountToday) {
    state.commentCountToday = commentCountToday
  },
  setStdLoginUser (state, stdLoginUser){
	state.stdLoginUser = stdLoginUser;
  },
  setBchain (state, bchain) {
	state.bchain = bchain;
  },
  setCartEntries (state, entries) {
	state.cartEntries = entries;
  },
  addCartEntry (state, entry){
	//if this new addition is following a prior purchase, need to reset the cart
	if (state.purchaseSuccess){
		state.purchaseSuccess = false;
		state.cartEntries = [];
	}
	state.cartEntries.push(entry);
	return true;
  },
  removeCartEntry (state, entry){
	state.cartEntries = state.cartEntries.filter( obj => obj._id !== entry._id);
  },
  clearCart (state){
	state.cartEntries = [];
  },
  setPurchaseSuccess (state, _purchaseSuccess) {
	state.purchaseSuccess = _purchaseSuccess;
  }
}
