<template>
  <div>
    <NavbarBrand />
    <!-- Loading Spinner -->
    <div v-if="loadingData" class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center">
        <i class="fas fa-spin fa-spinner text-brand"></i>
      </div>
    </div>
    <!-- Error Display -->
    <div v-else-if="errorDisplay !== ''" class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center">
        <h4>{{ errorDisplay }}</h4>
      </div>
    </div>

    <!-- Main Profile Content -->
    <!-- ###################################################### -->
    <!-- ## THIS IS THE ONLY CHANGE. "col-lg-11" IS REMOVED. ## -->
    <!-- ###################################################### -->
    <div v-else class="container pt-5 mt-5 pb-5">
      <div class="alert alert-danger" role="alert" v-if="badActorWarning">
        <h4 class="alert-heading">Warning!</h4>
        <p>There are reports that this account is a bad actor. Please exercise caution.</p>
      </div>

       <!-- Profile Header -->
       <div class="profile-header-top mb-4">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="user-avatar large-avatar" :style="'background-image: url(' + profImgUrl + '/u/' + displayUser + '/avatar)'">
						<span v-if="!account_banned && editOn" class="profileButtonMove">
							<a href="#" class="btn btn-brand p-2 acti-shadow square-btn" data-toggle="modal"
							  data-target="#profileImageModal" v-on:click="showProfileImageModal">
							  <i class="fas fa-edit"></i>
							</a>
						</span>
					</div>
                </div>
                <div class="col">
                    <h4 class="user-name mb-0">
                        <a :href="formattedProfileUrl" target="_blank">@{{ displayUser }}</a>
                        <small class="rank-badge-main" v-if="displayCoreUserRank">{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRank && this.userRank.afitx_rank">{{ displayIncreasedUserRank }}</span></small>
                    </h4>
                    <p class="text-muted small mb-0" v-if="userinfo">Joined on {{ pureDate(userinfo.created) }}</p>
                </div>
                <div class="col-auto">
                    <div class="user-actions">
                        <span v-if="user && user.account.name === displayUser && !account_banned">
                            <a class="p-2 edit-icon" @click="turnEditOn" v-if="!editOn" title="Edit Profile"><i class="fas fa-edit"></i></a>
							<a class="p-2 edit-icon" @click="turnEditOff" v-else title="View Profile"><i class="fa-regular fa-eye"></i></a>
                        </span>
                        <span v-if="!account_banned && !isOwnAccount()" class="text-brand">
                            <span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend()"><i class="fas fa-user-friends p-2 acti-shadow" style="color: green;"></i><i class="fas fa-user-times p-2 acti-shadow" :title="$t('cancel_friendship')" v-on:click="dropFriend"></i></span>
                            <span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend()"><i class="fas fa-user-clock p-2 acti-shadow"></i><i class="fas fa-user-times p-2 acti-shadow" :title="$t('cancel_friend_request')" v-on:click="cancelFriendRequest" v-if="isPendingFriend().direction == 0"></i><i class="fas fa-user-check p-2 acti-shadow" :title="$t('accept_friend_request')" v-on:click="acceptFriend" v-else-if="isPendingFriend().direction == 1"></i></span>
                            <span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-else v-on:click="addFriend"><i class="fas fa-user-plus p-2 acti-shadow header-action-icon"></i></span>
                            <div v-if="addFriendError" v-html="addFriendError" class="d-inline-block text-danger small"></div>
                            <i class="fas fa-spin fa-spinner ml-2" v-if="friendshipLoader"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>

      <div class="row">
        <!-- Permanent Left Sidebar for Quick Links -->
        <div class="col-md-3">
            <div class="quick-links-sidebar">
                <h5 class="sidebar-title">Quick Links</h5>
                <a :href="'/activity/' + displayUser"><img src="/img/actifit_logo.png" class="mr-2 token-logo"> Actifit Reports</a>
                <a :href="'/' + displayUser + '/blog'"><img src="/img/HIVE.png" class="mr-2 token-logo"> Hive Blog</a>
                <a :href="'/' + displayUser + '/videos'"><img src="/img/3speak.png" class="mr-2 token-logo"> 3Speak Videos</a>
                <a :href="'/' + displayUser + '/comments'"><i class="far fa-comments"></i> Comments</a>
                <a :href="'/' + displayUser + '/wallet'"><i class="fas fa-solid fa-wallet"></i> Wallet</a>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="col-md-9">
            <div class="profile-main-content">
                <!-- Main Navigation Tabs -->
                <div class="main-nav-tabs">
                    <button :class="{'active': activeTab === 'about'}" @click="activeTab = 'about'">About</button>
                    <button :class="{'active': activeTab === 'fitness'}" @click="activeTab = 'fitness'">Fitness</button>
                    <button :class="{'active': activeTab === 'community'}" @click="activeTab = 'community'">Community</button>
                    <button :class="{'active': activeTab === 'badges'}" @click="activeTab = 'badges'">Badges</button>
                </div>
            
                <div class="profile-content-area p-3">
                    <!-- About Section -->
                    <div v-if="activeTab === 'about'">
                        <div v-if="userinfo" class="user-details">
                            <div class="info-box-editable p-3 mb-2 d-flex align-items-center">
                                <i class="fas fa-user fa-fw mr-3 text-brand"></i><strong>Display Name</strong>
                                <span v-if="!usernameEditOn" class="ml-auto info-value">{{ textAreaUsernameValue || 'Not Set' }} <a v-if="editOn" @click="turnUsernameEditOn" class="edit-pen-icon"><i class="fas fa-pen"></i></a></span>
                                <div v-else class="w-50 ml-auto"><textarea v-model="textAreaUsernameValue" rows="1" class="form-control"></textarea><a class="btn btn-sm btn-brand mt-1" v-on:click="saveFunc('username')">Save</a> <a class="btn btn-sm btn-secondary mt-1" @click="turnUsernameEditOff">Cancel</a></div>
                            </div>
                            <div class="info-box-editable p-3 mb-2 d-flex align-items-center">
                                <i class="fas fa-map-marker-alt fa-fw mr-3 text-brand"></i><strong>Location</strong>
                                <span v-if="!locationEditOn" class="ml-auto info-value">{{ textAreaLocationValue || 'Not Set' }} <a v-if="editOn" @click="turnLocationEditOn" class="edit-pen-icon"><i class="fas fa-pen"></i></a></span>
                                <div v-else class="w-50 ml-auto"><textarea v-model="textAreaLocationValue" rows="1" class="form-control"></textarea><a class="btn btn-sm btn-brand mt-1" v-on:click="saveFunc('location')">Save</a> <a class="btn btn-sm btn-secondary mt-1" @click="turnLocationEditOff">Cancel</a></div>
                            </div>
                            <div class="info-box-editable p-3 mb-2 d-flex align-items-center">
                                <i class="fas fa-info-circle fa-fw mr-3 text-brand"></i><strong>Description</strong>
                                <span v-if="!descriptionEditOn" class="ml-auto info-value">{{ textAreaDescriptionValue || 'Not Set' }} <a v-if="editOn" @click="turnDescriptionEditOn" class="edit-pen-icon"><i class="fas fa-pen"></i></a></span>
								<div v-else class="w-50 ml-auto"><textarea v-model="textAreaDescriptionValue" rows="2" class="form-control"></textarea><a class="btn btn-sm btn-brand mt-1" v-on:click="saveFunc('description')">Save</a> <a class="btn btn-sm btn-secondary mt-1" @click="turnDescriptionEditOff">Cancel</a></div>
                            </div>
                            <div class="info-box-editable p-3 mb-2 d-flex align-items-center">
                                <i class="fas fa-link fa-fw mr-3 text-brand"></i><strong>Website</strong>
                                <span v-if="!linkEditOn" class="ml-auto info-value"><a :href="textAreaLinkValue" target="_blank" class="info-link">{{ textAreaLinkValue || 'Not Set' }}</a> <a v-if="editOn" @click="turnLinkEditOn" class="edit-pen-icon"><i class="fas fa-pen"></i></a></span>
                                <div v-else class="w-50 ml-auto"><textarea v-model="textAreaLinkValue" rows="1" class="form-control"></textarea><a class="btn btn-sm btn-brand mt-1" v-on:click="saveFunc('link')">Save</a> <a class="btn btn-sm btn-secondary mt-1" @click="turnLinkEditOff">Cancel</a></div>
                            </div>
                        </div>
                    </div>
                    <!-- Fitness Section -->
                    <div v-if="activeTab === 'fitness'">
                        <div class="fitness-grid">
                            <div class="stat-box"><h6>Latest Activity Count</h6><span>{{ lastActivityCount }} <img src="/img/actifit_logo.png" class="activity-small-logo"></span></div>
                            <div class="stat-box"><h6>Latest Activity Date</h6><h6>{{ lastActivityDate }}</h6></div>
                            <div class="stat-box"><h6><img src="https://usermedia.actifit.io/height.png" class="stat-icon">Height</h6><h6>{{ lastHeight + ' ' + heightUnit }}</h6><h6><img src="https://usermedia.actifit.io/weight.png" class="stat-icon">Weight</h6><h6>{{ lastWeight + ' ' + weightUnit }}</h6></div>
                            <div class="stat-box"><h6><img src="https://usermedia.actifit.io/bodyfat.png" class="stat-icon">Body Fat</h6><h6>{{ lastBodyfat + ' % ' }}</h6><h6><img src="https://usermedia.actifit.io/chest.png" class="stat-icon">Chest</h6><h6>{{ lastChest + ' ' + chestUnit }}</h6></div>
                            <div class="stat-box"><h6><img src="https://usermedia.actifit.io/waist.png" class="stat-icon">Waist</h6><h6>{{ lastWaist + ' ' + waistUnit }}</h6><h6><img src="https://usermedia.actifit.io/thighs.png" class="stat-icon">Thighs</h6><h6>{{ lastThighs + ' ' + thighsUnit }}</h6></div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6 text-center mb-2">
                                <a href="#" data-toggle="modal" class="btn btn-chart" data-target="#activityChartModal" v-if="isFriend() || isOwnAccount()">Activity Chart</a>
                            </div>
                            <div class="col-md-6 text-center mb-2">
                                <a href="#" data-toggle="modal" class="btn btn-chart" data-target="#measureChartModal" v-if="isFriend() || isOwnAccount()">Stats Chart</a>
                            </div>
                        </div>
                    </div>
                    <!-- Community & Wallet Section -->
                    <div v-if="activeTab === 'community'">
						
						<!-- Posh Section -->
						<div class="info-box-orange mb-2 col-md-12 cntnr d-flex align-items-center flex-wrap">
						  <img src="/img/poshlogo.png" class="mr-2" style="height: 40px; width: auto;">
						  <span v-if="poshVerified">
							<i class="fas fa-check text-success" style="font-size:large"></i> Verified
							<a :href="poshUserData.twitter_profile" v-if="poshUserData.twitter_username" target="_blank">@{{ poshUserData.twitter_username }}</a>
						  </span>
						  <span v-else>
							<a class="btn btn-brand-red m-2" href="https://hiveposh.com/" target="_blank">Posh Connect</a>
						  </span>
						  <div v-html="$t('posh_desc_profile')" class="posh-desc"></div>
						</div>

						<!-- Splinterlands Section -->
						<div class="info-box-orange mb-2 col-md-12 cntnr d-flex align-items-center flex-wrap">
							<i class="fa-solid fa-gamepad mr-2"></i>Splinterlands
                            <img src="https://d36mxiodymuqjm.cloudfront.net/website/icons/img_icon_splinterlands.svg"
                                class="mr-2 user-menu-container splinterlands-icon" :alt="$t('Splinterlands')" :title="$t('Splinterlands')">
							<a href="#" data-toggle="modal" data-target="#notifyModal"><i class="fas fa-info-circle ml-1"
								:title="$t('view_details')"></i></a>
							<div v-if="splinterRarities != null && splinterRarities.length > 0" class="splinter-details">
							  <div>{{ $t('Common') }}: {{ splinterRarities[1] }} {{ $t('Cards') }}
								<span v-if="parseInt(splinterRarities[1]) >= 10"><i
									class="fas fa-check text-success"></i>{{ $t('splinter_extra_rewards_common') }}</span>
							  </div>
							  <div>{{ $t('Rare') }}: {{ splinterRarities[2] }} {{ $t('Cards') }}
								<span v-if="parseInt(splinterRarities[2]) >= 10"><i
									class="fas fa-check text-success"></i>{{ $t('splinter_extra_rewards_rare') }}</span>
							  </div>
							  <div>{{ $t('Epic') }}: {{ splinterRarities[3] }} {{ $t('Cards') }}
								<span v-if="parseInt(splinterRarities[3]) >= 10"><i
									class="fas fa-check text-success"></i>{{ $t('splinter_extra_rewards_epic') }}</span>
							  </div>
							  <div>{{ $t('Legendary') }}: {{ splinterRarities[4] }} {{ $t('Cards') }}
								<span v-if="parseInt(splinterRarities[4]) >= 10"><i
									class.fas.fa-check.text-success></i>{{ $t('splinter_extra_rewards_legendary') }}</span>
							  </div>
							</div>
							<a href="https://splinterlands.com/" class="btn btn-brand-red ml-auto" target="_blank">
							  Play Splinterlands
							</a>
						</div>

						<!-- Witness Voting Section -->
						<div class="info-box-orange mb-2 col-md-12 cntnr">
						  <div v-if="!voteWitnessDisplay">
							<div v-if="userinfo && (userinfo.witness_votes.includes('actifit') || userinfo.proxy == 'actifit')">
								<i class="fas fa-cubes text-brand mr-2"></i> {{ $t('Votes_Actifit_Witness') }} <span v-if="userinfo.proxy == 'actifit'">{{ $t('proxy') }}</span><i class="fas fa-check text-success"></i>
								<button class="btn btn-brand-red ml-2" v-on:click="voteWitness">{{ $t('Update_Vote') }}</button>
							</div>
							<div v-else class="d-flex align-items-center">
								<i class="fas fa-cubes text-brand mr-2"></i> <button class="btn btn-brand-red" v-on:click="voteWitness">Vote For Actifit Witness or Set As Proxy</button>
							</div>
						  </div>
						  <div v-if="voteWitnessDisplay" class="mt-2 text-center">
							<div v-if="!isKeychainLogin() && isStdLogin() && !isHiveauthLogin()">
								<label for="p-ac-key" class="w-25 p-2">{{ $t('Active_Key') }} *</label>
								<input type="password" id="p-ac-key" name="p-ac-key" ref="p-ac-key" class="form-control-lg w-50 p-2">
							</div>
							<div class="mt-2">
								<button class="btn btn-brand-red m-2" v-on:click="proceedWitnessVote()">Vote Now</button>
								<button class="btn btn-brand-red m-2" v-on:click="proceedWitnessVote(1)">Set Proxy</button>
								<button class="btn btn-brand-red m-2" v-on:click="voteWitness">Cancel</button>
							</div>
							<div class="text-center"><i v-if="votingProgress" class="fas fa-spin fa-spinner"></i></div>
							<div class="text-brand text-center" v-if="error_proceeding">{{ this.error_msg }}</div>
						  </div>
						</div>
						
						<div class="info-box-orange mb-2 col-md-12 cntnr d-flex align-items-center">
							<i class="fas fa-user-friends text-brand mr-2"></i>
							<div>
								{{ this.userFriends.length }} {{ $t('friends') }}
								<div class="mt-1">
								  <UserHoverCard v-for="friend in displayedFriends" :key="friend.friend" :username="friend.friend" displayMode="avatar-only" />
								  <span v-if="userFriends.length > maxFriendDisplay">
									+ {{ userFriends.length - maxFriendDisplay }} {{ $t('other') }} {{ $t('friends') }}
								  </span>
								</div>
							</div>
							<a class="btn btn-brand m-2 ml-auto" :href="`/${displayUser}/friends`">{{ $t('View_friends') }}</a>
						</div>
                        <div class="info-box-orange mb-2 col-md-12 cntnr row m-0">
                            <div class="col-6 border-right"><i class="fas fa-angle-double-left text-brand mr-2"></i>{{ $t('Followers') }}: {{ getFollowerCount }}</div>
                            <div class="col-6"><i class="fas fa-angle-double-right text-brand mr-2"></i>{{ $t('Following') }}: {{ getFollowingCount }}</div>
                        </div>
						
						<div class="info-box-orange mb-2 col-md-12 cntnr">
							 <div v-if="actifitDelegator"><i class="fas fa-hands-helping text-brand mr-2"></i> {{ $t('Delegates_to_Actifit') }} {{ actifitDelegator.steem_power }} {{ $t('Hive_Power') }}</div>
							 <a v-else class="btn btn-brand" href="/wallet" target="_blank"><i class="fas fa-hands-helping text-brand mr-2"></i>{{ $t('Delegate_Now_Actifit') }}</a>
						</div>
                        <div class="info-box-orange mb-2 col-md-12 cntnr row m-0">
                            <div class="col-md-6 border-right">
                                <img src="/img/actifit_logo.png" class="mr-2 token-logo">{{ numberFormat(userTokenCount, 3) }} AFIT Tokens<br />
                                <img src="/img/actifit_logo.png" class="mr-2 token-logo">{{ displayAFITHEBal }} AFIT H-E Tokens<br />
                                <div>
									<img src="/img/actifit_logo.png" class="mr-2 token-logo">{{ displayAFITTipBal }} AFIT Tip Tokens
									<button class="btn btn-brand btn-sm ml-2" v-on:click="tipUser">Tip AFIT</button>
								</div>
                            </div>
                            <div class="col-md-6">
                                <img src="/img/AFITX.png" class="mr-2 token-logo">{{ displayAFITXHEBal }} AFITX H-E Tokens
                            </div>
                        </div>
                        <div v-if="proceedTip" class="info-box-orange mb-2 col-md-12 cntnr">
                            <div class="tip-details w-100">
                                <div class="form-group"><label for="tip-amount">{{ $t('Tip_Amount') }}</label><input type="number" id="tip-amount" ref="tip-amount" class="form-control"></div>
                                <div class="form-group"><label for="funds-pass">{{ $t('Funds_Password') }}</label><input type="password" id="funds-pass" ref="funds-pass" class="form-control"></div>
                                <div v-if="tipError" v-html="tipError" class="alert alert-danger"></div>
                                <button v-on:click="proceedTipActivity" class="btn btn-brand">{{ $t('Proceed') }}</button>
                                <i class="fas fa-spin fa-spinner" v-if="tipInProgress"></i>
                            </div>
                        </div>
                    </div>
                    <!-- Badges Section -->
                    <div v-if="activeTab === 'badges'">
						<div v-if="userinfo && !account_banned" class="user-badges">
							<h3 class="text-brand badges-title"><i class="fas fa-trophy"></i> {{ $t('Badges') }}</h3>
							<div class="badge-entry iso-badge">
							  <div :title="$t('iso_badge_title')">
								<div class="badge-title">{{ $t('iso_badge_title') }}</div>
								<div id="iso-badge" class="claimed-check" v-if="userHasBadge(iso_badge)">
								  <div><img class="badge-img" src="/img/badges/actifit_iso_badge.png"></div>
								  <div class="text-brand claimed-check"><i class="fas fa-check"></i></div>
								</div>
								<div id="iso-badge" class="claimed-check" v-else><img class="badge-img badge-unclaimed"
									src="/img/badges/actifit_iso_badge.png"></div>
								<button v-if="badgeClaimable(iso_badge)" v-on:click="claimBadge(iso_badge)"
								  class="btn btn-brand btn-lg border">{{ $t('Claim_badge') }}</button>
								<div v-else-if="this.isoParticipant.length == 0" class="col-md-4 text-brand claimed-check">{{
								  $t('missed_event_notice') }}</div>
								<div v-if="claimingBadge == iso_badge" id="claiming_badge">
								  <i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
								</div>
							  </div>
							</div>

							<div class="badge-entry rew-activity-badge">
							  <div class="badge-title">{{ $t('rew_activity_badge_title') }}</div>
							  <div v-for="level in rewarded_posts_rules" :key="level[1]" class="single-rew-activity-badge"
								:style="{ left: (level[1] - 1) * activ_badge_indent + 'px' }"
								:title="$t('rew_activity_badge_level_title') + ' ' + level[1]">
								<div v-if="level[1] > 0 && level[1] <= maxClaimedActivityBadgeLevel()">
								  <div :id="rew_activity_badge + level[1]" class="claimed-check"
									v-if="userHasBadge(rew_activity_badge + level[1])">
									<div><img class="badge-img" :src="'/img/badges/actifit_rew_act_lev_' + level[1] + '_badge.png'"></div>
									<div class="text-brand claimed-check"><i class="fas fa-check"></i></div>
								  </div>
								  <div :id="rew_activity_badge + level[1]" class="claimed-check unclaimed-badge" v-else
									:style="{ left: claimable_badge_indent + 'px' }">
									<img class="badge-img badge-unclaimed"
									  :src="'/img/badges/actifit_rew_act_lev_' + level[1] + '_badge.png'">
								  </div>
								  <div>
									<button v-if="badgeClaimable(rew_activity_badge + level[1])"
									  v-on:click="claimBadge(rew_activity_badge + level[1])"
									  class="btn btn-brand btn-lg border unclaimed-badge unclaimed-badge-btn"
									  :style="{ left: claimable_badge_indent + 'px' }">{{ $t('Claim_badge') }}</button>
									<div
									  v-if="!badgeClaimable(rew_activity_badge + level[1]) && !userHasBadge(rew_activity_badge + level[1])"
									  class="unclaimed-badge text-brand unclaimed-badge-btn unclaimed-badge-note "
									  :style="{ left: claimable_badge_indent + 'px' }" :title="$t('next_target')">
									  <i class="fas fa-crosshairs"></i>
									</div>
									<div v-if="claimingBadge == rew_activity_badge + level[1]" id="claiming_badge"
									  class="unclaimed-badge unclaimed-badge-spin" :style="{ left: claimable_badge_indent + 'px' }">
									  <i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
									</div>
								  </div>
								</div>
							  </div>
							</div>

							<div class="badge-entry doubledup-activity-badge">
							  <div class="badge-title">{{ $t('doubledup_badge_title') }}</div>
							  <div :title="$t('doubledup_badge_title')">
								<div id="doubledup-badge" class="claimed-check" v-if="userHasBadge(doubledup_badge)">
								  <div><img class="badge-img" src="/img/badges/actifit_doubled_up_badge.png"></div>
								  <div class="text-brand claimed-check"><i class="fas fa-check"></i></div>
								</div>
								<div id="doubledup-badge" class="claimed-check" v-else><img class="badge-img badge-unclaimed"
									src="/img/badges/actifit_doubled_up_badge.png"></div>
								<button v-if="badgeClaimable(doubledup_badge)" v-on:click="claimBadge(doubledup_badge)"
								  class="btn btn-brand btn-lg border unclaimed-badge-btn">{{ $t('Claim_badge') }}</button>
								<div v-else-if="this.doubledupWinner.length == 0" class="badge-doubledup-desc claimed-check">{{
								  $t('not_lucky_yet') }}</div>
								<div v-if="claimingBadge == doubledup_badge" id="claiming_badge">
								  <i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
								</div>
							  </div>
							</div>

							<div class="badge-entry charity-activity-badge">
							  <div class="badge-title">{{ $t('charity_badge_title') }}</div>
							  <div :title="$t('charity_badge_title')">
								<div id="charity-badge" class="claimed-check" v-if="userHasBadge(charity_badge)">
								  <div><img class="badge-img" src="/img/badges/actifit_charity_badge.png"></div>
								  <div class="text-brand claimed-check"><i class="fas fa-check"></i></div>
								</div>
								<div id="charity-badge" class="claimed-check" v-else><img class="badge-img badge-unclaimed"
									src="/img/badges/actifit_charity_badge.png"></div>
								<button v-if="badgeClaimable(charity_badge)" v-on:click="claimBadge(charity_badge)"
								  class="btn btn-brand btn-lg border unclaimed-badge-btn">{{ $t('Claim_badge') }}</button>
								<div v-if="claimingBadge == charity_badge" id="claiming_badge">
								  <i class="fas fa-spin fa-spinner"></i>{{ $t('claiming_badge_notice') }}
								</div>
							  </div>
							</div>

							<div v-if="claimError">{{ claimErrorDesc }}</div>
						</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
    <MeasureChartModal :userMeasurements="userMeasurements" />
    <ActivityChartModal :userActivity="userActivity" />
    <ProfileImageModal :username="user ? user.account.name : ''" v-if="isProfileImageModalVisible" @close="closeProfileImageModal" @image-changed="updateProfileImage" />
    <NotifyModal :modalTitle="$t('Actifit_Info')" :modalText="$t('splinterlands_extra_rewards_desc')" />
    <Footer />
    <client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
    <LoginModal v-if="showModal" @close="showModal = false" />
  </div>
</template>
<script>

import UserHoverCard from '~/components/UserHoverCard'
import LoginModal from '~/components/LoginModal'
import NavbarBrand from '~/components/NavbarBrand'
import Footer from '~/components/Footer'

import steem from 'steem'

import hive from '@hiveio/hive-js'

import blurt from '@blurtfoundation/blurtjs'

import { mapGetters } from 'vuex'

import Vue from 'vue'

import MeasureChartModal from '~/components/MeasureChartModal'

import ActivityChartModal from '~/components/ActivityChartModal'

import ProfileImageModal from '~/components/ProfileImageModal'


import badActors from '~/utils/BadActorList';



import { BadgePlugin } from 'bootstrap-vue'
Vue.use(BadgePlugin)

import SSC from 'sscjs'
//const ssc = new SSC(process.env.steemEngineRpc);

const hsc = new SSC(process.env.hiveEngineRpc);

import NotifyModal from '~/components/NotifyModal'

import Lodash from 'lodash';

export default {
  head() {
    return {
      title: `Actifit user profile ${this.username} - Actifit.io`,
      meta: [
        { hid: 'description', name: 'description', content: `Actifit profile view for ${this.username}` },
        { hid: 'ogdescription', name: 'og:description', content: `Actifit profile view for ${this.username}` }
      ],
      link: [
        { rel: 'canonical', href: `https://actifit.io/${this.username}` }
      ]
    }
  },
  data() {
    return {
	  activeTab: 'about',
      showModal: false,
      report: '',
      displayUser: '',
      errorDisplay: '',
      userRank: '',
      rewardedPostCount: '',
      loading: false,
      userinfo: '',
      follower_count: 0,
      following_count: 0,
      video_count_3s: 0,
      noUserFound: false,
      userTokenCount: '',
      userFriends: [],
      friendRequests: [],
      friendshipLoader: false,
      maxFriendDisplay: 5,
      userAFITSETokenCount: '',
      userAFITXSETokenCount: '',
      userAFITHETokenCount: '',
      userAFITXHETokenCount: '',
	  userAFITTipTokenCount: '',
      isoParticipant: [],
      doubledupWinner: [],
      charityDonor: [],
      userBadges: [],
      claimError: '',
      claimErrorDesc: '',
      iso_badge: 'iso',
      rew_activity_badge: 'rewarded_activity_lev_',
      doubledup_badge: 'doubledup_badge',
      charity_badge: 'charity_badge',
      claimingBadge: false,
      actifitDelegator: '',
      activ_badge_indent: 10,
      claimable_badge_indent: 125,
      account_banned: false,
      tipError: '',
      tipInProgress: false,
      proceedTip: false,
      addFriendError: '',
      cur_bchain: 'HIVE',
      screenWidth: 1200,
      acti_goog_ad_square: { display: 'inline-block', maxWidth: '300px', maxHeight: '350px' },
      rewarded_posts_rules: [
        [9, 0],
        [29, 1],
        [59, 2],
        [89, 3],
        [119, 4],
        [179, 5],
        [359, 6],
        [539, 7],
        [719, 8],
        [1079, 9],
        [1080, 10]
      ],
      lastHeight: '-',
      heightUnit: '',
      lastWeight: '-',
      weightUnit: '',
      lastChest: '-',
      chestUnit: '',
      lastWaist: '-',
      waistUnit: '',
      lastThighs: '-',
      thighsUnit: '',
      lastBodyfat: '-',
      lastUpdated: '-',
      userMeasurements: [],
      userActivity: [],
      lastActivityCount: '-',
      lastActivityDate: '-',
      displayAddFriendStats: false,
      displayAddFriendActivity: false,
      displayLoginStats: false,
      displayLoginActivity: false,
      loadingData: true,
      profImgUrl: process.env.hiveImgUrl,
      voteWitnessDisplay: false,
      error_proceeding: false,
      error_msg: '',
      votingProgress: false,
      showAfitTipInfo: false,
      poshVerified: false,
      poshUserData: '',
      splinterCards: [],
      userSplinterCards: [],
      splinterRarities: [],
      editOn: false,
      usernameEditOn: false,
      profilePicEditon: false,
      locationEditOn: false,
      descriptionEditOn: false,
      linkEditOn: false,
      textAreaLocationValue: '',
      textAreaUsernameValue: '',
      textAreaDescriptionValue: '',
      textAreaLinkValue: '',
      linkForImage: `${this.profImgUrl}/u/${this.displayUser}/avatar`,
      isProfileImageModalVisible: false,
      textAreaProfileImageValue: '',
      updatingField: null,
      displayUsersName: '',
      displayLocation: '',
      displayAbout: '',
      displayLink: '',
      tempName: '',
      tempLocation: '',
      tempLink: '',
      tempDescription: '',
      tempPic: '',
      badActors: badActors,
      badActorWarning: false,
    }
  },
  watch: {
    user: 'fetchUserData',
    bchain: async function (newBchain) {
      console.log('profile change in chain ' + newBchain);
      this.cur_bchain = newBchain;
      await this.$store.dispatch('steemconnect/refreshUser');
      this.fetchUserData();
    },

    textAreaLocation(newVal) {
      this.textAreaLocationValue = newVal;
    },
    textAreaUsername(newVal) {
      this.textAreaUsernameValue = newVal;
    },
    textAreaLink(newVal) {
      this.textAreaLinkValue = newVal;
    },
    textAreaDescription(newVal) {
      this.textAreaDescriptionValue = newVal;
    },
  },
  components: {
    NavbarBrand,
    Footer,
    MeasureChartModal,
    ActivityChartModal,
    NotifyModal,
    ProfileImageModal,
    LoginModal,
    UserHoverCard
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    ...mapGetters(['newlyVotedPosts', 'bchain']),
    ...mapGetters(['userTokens'], ['commentEntries'], 'commentCountToday'),

    displayUsersNames() {
      return this.getUsersName();
    },
    displayedFriends() {
      return this.userFriends.slice(0, this.maxFriendDisplay);
    },
    textAreaUsername() {
      return this.userMeta && this.userMeta.profile && this.userMeta.profile.name
        ? this.userMeta.profile.name
        : '';
    },
    textAreaLocation() {
      return this.userMeta && this.userMeta.profile && this.userMeta.profile.location
        ? this.userMeta.profile.location
        : '';
    },
    textAreaDescription() {
      return this.userMeta && this.userMeta.profile && this.userMeta.profile.about
        ? this.userMeta.profile.about
        : '';
    },
    textAreaLink() {
      return this.userMeta && this.userMeta.profile && this.userMeta.profile.website
        ? this.userMeta.profile.website
        : '';
    },
    isKeychainActive() {
      return (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)
    },
    isHiveauthActive() {
      return (localStorage.getItem('acti_login_method') == 'hiveauth')
    },
    displayAFITXBal() {
      if (!isNaN(this.userAFITXSETokenCount)) {
        return this.numberFormat(this.userAFITXSETokenCount, 3);
      }
      return 0;
    },
    displayAFITSEBal() {
      if (!isNaN(this.userAFITSETokenCount)) {
        return this.numberFormat(this.userAFITSETokenCount, 3);
      }
      return 0;
    },
    smallScreenBtnClasses() {
      //use proper classes for neat display
      if (this.screenWidth < 768) {
        return "w-50";
      }
      return "w-100";
    },
    displayAFITXHEBal() {
      if (!isNaN(this.userAFITXHETokenCount)) {
        return this.numberFormat(this.userAFITXHETokenCount, 3);
      }
      return 0;
    },
    displayAFITHEBal() {
      if (!isNaN(this.userAFITHETokenCount)) {
        return this.numberFormat(this.userAFITHETokenCount, 3);
      }
      return 0;
    },
    displayAFITTipBal() {
      if (!isNaN(this.userAFITTipTokenCount)) {
        return this.numberFormat(this.userAFITTipTokenCount, 3);
      }
      return 0;
    },
    getFollowerCount() {
      return this.numberFormat(this.follower_count, 0);
    },
    getFollowingCount() {
      return this.numberFormat(this.following_count, 0);
    },
    formattedProfileUrl() {
      return "https://actifit.io/" + this.displayUser;
    },
    displayCoreUserRank() {
      return (this.userRank ? parseFloat(this.userRank.rank_no_afitx).toFixed(2) : '');
    },
    displayIncreasedUserRank() {
      return '(+' + parseFloat(this.userRank.afitx_rank).toFixed(2) + ')';
    },
    userMeta() {
      try {
        return JSON.parse(this.userinfo.posting_json_metadata);
      } catch (err) {
        return null;
      }
    },
    username() {
      if (this.$route.params.username.startsWith('@')) {
        return this.$route.params.username.substring(1, this.$route.params.username.length);
      }
      return this.$route.params.username
    }
  },
  methods: {
    showModalFunc() {
      this.$nextTick(() => {
        this.showModal = true;
        if (window.$ && typeof window.$.fn.modal === 'function') {
          window.$('#loginModal').modal('show');
        }
      });
    },
    showProfileImageModal() {
      this.isProfileImageModalVisible = true;
    },
    closeProfileImageModal() {
      this.isProfileImageModalVisible = false;
    },
    getUsersName() {
      return this.displayUser;
    },
    turnUsernameEditOn() {
      this.usernameEditOn = true;
      this.tempName = this.textAreaUsernameValue;
      return;
    },
    turnUsernameEditOff() {
      this.usernameEditOn = false;
      this.textAreaUsernameValue = this.tempName
      return;
    },
    turnProfileEditOn() {
      this.profilePicEditon = true;
      return;
    },
    turnProfileEditOff() {
      this.profilePicEditon = false;
      return;
    },
    turnLocationEditOn() {
      this.locationEditOn = true;
      this.tempLocation = this.textAreaLocationValue;
      return;
    },
    turnLocationEditOff() {
      this.locationEditOn = false;
      this.textAreaLocationValue = this.tempLocation;
      return;
    },
    turnDescriptionEditOn() {
      this.descriptionEditOn = true;
	  this.activeTab = 'about'; 
      this.tempDescription = this.textAreaDescriptionValue;
      return;
    },
    turnDescriptionEditOff() {
      this.descriptionEditOn = false;
      this.textAreaDescriptionValue = this.tempDescription;
      return;
    },
    turnLinkEditOn() {
      this.linkEditOn = true;
	  this.activeTab = 'about'; 
      this.tempLink = this.textAreaLinkValue;
      return;
    },
    turnLinkEditOff() {
      this.linkEditOn = false;
      this.textAreaLinkValue = this.tempLink;
      return;
    },
    turnEditOn() {
      this.editOn = true;
	  this.activeTab = 'about'; 
      return;
    },
    turnEditOff() {
      this.editOn = false;
      this.linkEditOn = false;
      this.usernameEditOn = false;
      this.descriptionEditOn = false;
      this.locationEditOn = false;
      return;
    },
	async broadcastUpdate(updateData, field) {
		if (!this.user || !this.user.account) return;

		let parsedData;
		try {
			if (this.user.account.posting_json_metadata && this.user.account.posting_json_metadata.trim() !== '') {
				parsedData = JSON.parse(this.user.account.posting_json_metadata);
			} else {
				parsedData = {};
			}
			if (!parsedData.profile) parsedData.profile = {};
		} catch (e) {
			parsedData = { profile: {} };
		}
		
		parsedData.profile.location = this.textAreaLocationValue;
		parsedData.profile.about = this.textAreaDescriptionValue;
		parsedData.profile.website = this.textAreaLinkValue;
		parsedData.profile.name = this.textAreaUsernameValue;

		if (field === 'profile_image') {
			parsedData.profile.profile_image = updateData;
		}
		
		let transaction = {
			account: this.user.account.name,
			json_metadata: this.user.account.json_metadata || '',
			posting_json_metadata: JSON.stringify(parsedData),
			extensions: []
		};
		
		try {
			await this.$processTrxFunc('account_update2', transaction);
			await this.$store.dispatch('steemconnect/refreshUser');
			this.fetchUserData();
		} catch (error) {
			console.error("Broadcast failed:", error);
			this.$notify({
			  group: 'error',
			  text: 'Profile update failed. Please try again.',
			  position: 'top center'
			})
		}
	},
    async updateProfileImage(imageUrl) {
      this.textAreaProfileImageValue = imageUrl;
      await this.broadcastUpdate(imageUrl, 'profile_image');
      this.closeProfileImageModal();
      this.profImgUrl = imageUrl; 
    },
    async saveFunc(field) {
      this.updatingField = field;
      try {
        await this.broadcastUpdate(null, field);
		this.$notify({
		  group: 'success',
		  text: 'Profile updated successfully!',
		  position: 'top center'
		});
      } finally {
        this.updatingField = null;
        if (field === 'username') this.usernameEditOn = false;
        else if (field === 'description') this.descriptionEditOn = false;
        else if (field === 'link') this.linkEditOn = false;
        else if (field === 'location') this.locationEditOn = false;
      }
    },
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    maxClaimedActivityBadgeLevel() {
      let maxActivityBadge = 0;
      let par_ref = this;
      this.userBadges.forEach(function (badgeEntry) {
        if (badgeEntry.badge.includes(par_ref.rew_activity_badge)) {
          let badgeLevel = badgeEntry.badge.replace(par_ref.rew_activity_badge, '');
          if (parseInt(maxActivityBadge) < parseInt(badgeLevel)) {
            maxActivityBadge = badgeLevel;
          }
        }
      })
      if (maxActivityBadge == 0) this.claimable_badge_indent = 0;
      else this.claimable_badge_indent = 125;
      return parseInt(maxActivityBadge) + 1;
    },
    calcScore(rules_array, value) {
      var result;
      for (var i = 0; i < rules_array.length; i++) {
        var rule = rules_array[i];
        result = rule[1];
        if (parseInt(value) <= parseInt(rule[0])) {
          break;
        }
      }
      return result;
    },
    async addFriend() {
      this.addFriendError = '';
      if (!this.user) {
        this.addFriendError = this.$t('Need_login');
        return false;
      }
      if (this.displayUser == this.user.account.name) {
        this.addFriendError = this.$t('Cannot_friend_self');
        return false;
      }
      if (this.isFriend()) {
        this.addFriendError = this.$t('Already_friends');
        return false;
      }
      let userConf = confirm(this.$t('confirm_add_friend').replace('_USERNAME_', this.displayUser));
      if (!userConf) {
        return;
      }
      this.friendshipLoader = true;
      let cstm_params = {
        required_auths: [],
        required_posting_auths: [this.user.account.name],
        id: 'actifit',
        json: JSON.stringify({ 'transaction': 'add-friend-request', 'target': this.displayUser })
      };
      let op_name = 'custom_json';
      let operation = [
        [op_name, cstm_params]
      ];
      let res = await this.$processTrxFunc(op_name, cstm_params);
      if (res.success) {
        this.propagateFriendReq(res.trx.tx, operation);
      } else {
        this.friendshipLoader = false;
      }
    },
    async propagateFriendReq(res, operation) {
      let url = new URL(process.env.actiAppUrl + 'addFriend/'
        + this.user.account.name + '/'
        + this.displayUser + '/'
        + res.ref_block_num + '/'
        + res.id + '/' + this.cur_bchain);

      if (this.isKeychainActive || this.isHiveauthActive) {

        let op_json = JSON.stringify(operation)
        url = new URL(process.env.actiAppUrl + 'addFriendHiveKeychain/'
          + this.user.account.name + '/'
          + this.displayUser + '/'
          + res.ref_block_num + '/'
          + res.id + '/'
          + this.cur_bchain + '?operation=' + op_json);
      }

      let req_res = await fetch(url);

      let outcome = await req_res.json();
      if (outcome.status == 'success') {
        this.friendshipLoader = false;
        this.$notify({
          group: 'success',
          text: this.$t('friend_request_sent'),
          position: 'top center'
        })
      } else {
        this.addFriendError = this.$t('unknown_error');
        this.friendshipLoader = false;
        return false;
      }
      this.refreshFriendStatus();
    },
    async cancelFriendRequest() {
      this.addFriendError = '';
      if (!this.user) {
        this.addFriendError = this.$t('Need_login');
        return false;
      }
      if (this.displayUser == this.user.account.name) {
        this.addFriendError = this.$t('Cannot_unfriend_self');
        return false;
      }
      if (this.isFriend()) {
        this.addFriendError = this.$t('Already_friends');
        return false;
      }
      let userConf = confirm(this.$t('confirm_cancel_friend_request').replace('_USERNAME_', this.displayUser));
      if (!userConf) {
        return;
      }
      this.friendshipLoader = true;
      let cstm_params = {
        required_auths: [],
        required_posting_auths: [this.user.account.name],
        id: 'actifit',
        json: JSON.stringify({ 'transaction': 'cancel-friend-request', 'target': this.displayUser })
      };
      let op_name = 'custom_json';
      let operation = [
        [op_name, cstm_params]
      ];
      let res = await this.$processTrxFunc(op_name, cstm_params);
      if (res.success) {
        this.cancelFriendReq(res.trx.tx, operation);
      } else {
        this.friendshipLoader = false;
      }
    },
    async cancelFriendReq(res, operation) {

      let url = new URL(process.env.actiAppUrl + 'cancelFriendRequest/'
        + this.user.account.name + '/'
        + this.displayUser + '/'
        + res.ref_block_num + '/'
        + res.id + '/' + this.cur_bchain);

      if (this.isKeychainActive || this.isHiveauthActive) {

        let op_json = JSON.stringify(operation)
        url = new URL(process.env.actiAppUrl + 'cancelFriendRequestHiveKeychain/'
          + this.user.account.name + '/'
          + this.displayUser + '/'
          + res.ref_block_num + '/'
          + res.id + '/'
          + this.cur_bchain + '?operation=' + op_json);
      }

      let req_res = await fetch(url);

      let outcome = await req_res.json();
      if (outcome.status == 'success') {
        this.friendshipLoader = false;
        this.$notify({
          group: 'success',
          text: this.$t('friend_request_cancelled'),
          position: 'top center'
        })
      } else {
        this.addFriendError = this.$t('unknown_error');
        this.friendshipLoader = false;
        return false;
      }
      this.refreshFriendStatus();
    },
    async dropFriend() {
      this.addFriendError = '';
      if (!this.user) {
        this.addFriendError = this.$t('Need_login');
        return false;
      }
      if (this.displayUser == this.user.account.name) {
        this.addFriendError = this.$t('Cannot_unfriend_self');
        return false;
      }
      if (!this.isFriend()) {
        this.addFriendError = this.$t('Not_friends');
        return false;
      }
      let userConf = confirm(this.$t('confirm_drop_friend').replace('_USERNAME_', this.displayUser));
      if (!userConf) {
        return;
      }
      this.friendshipLoader = true;
      let cstm_params = {
        required_auths: [],
        required_posting_auths: [this.user.account.name],
        id: 'actifit',
        json: JSON.stringify({ 'transaction': 'cancel-friendship', 'target': this.displayUser })
      };
      let op_name = 'custom_json';
      let operation = [
        [op_name, cstm_params]
      ];
      let res = await this.$processTrxFunc(op_name, cstm_params);
      if (res.success) {
        this.dropFriendship(res.trx.tx, operation);
      } else {
        this.friendshipLoader = false;
      }
    },
    async dropFriendship(res, operation) {

      let url = new URL(process.env.actiAppUrl + 'dropFriendship/'
        + this.user.account.name + '/'
        + this.displayUser + '/'
        + res.ref_block_num + '/'
        + res.id + '/' + this.cur_bchain);

      if (this.isKeychainActive || this.isHiveauthActive) {

        let op_json = JSON.stringify(operation)
        url = new URL(process.env.actiAppUrl + 'dropFriendshipHiveKeychain/'
          + this.user.account.name + '/'
          + this.displayUser + '/'
          + res.ref_block_num + '/'
          + res.id + '/'
          + this.cur_bchain + '?operation=' + op_json);
      }

      let req_res = await fetch(url);

      let outcome = await req_res.json();
      if (outcome.status == 'success') {
        this.friendshipLoader = false;
        this.$notify({
          group: 'success',
          text: this.$t('friendship_dropped'),
          position: 'top center'
        })
      } else {
        this.addFriendError = this.$t('unknown_error');
        this.friendshipLoader = false;
        return false;
      }
      this.refreshFriendStatus();
    },
    async acceptFriend() {
      this.addFriendError = '';
      if (!this.user) {
        this.addFriendError = this.$t('Need_login');
        return false;
      }
      if (this.displayUser == this.user.account.name) {
        this.addFriendError = this.$t('Cannot_unfriend_self');
        return false;
      }
      if (this.isFriend()) {
        this.addFriendError = this.$t('Already_friends');
        return false;
      }
      let userConf = confirm(this.$t('confirm_accept_friend').replace('_USERNAME_', this.displayUser));
      if (!userConf) {
        return;
      }
      this.friendshipLoader = true;
      let cstm_params = {
        required_auths: [],
        required_posting_auths: [this.user.account.name],
        id: 'actifit',
        json: JSON.stringify({ 'transaction': 'accept-friendship', 'target': this.displayUser })
      };
      let op_name = 'custom_json';
      let operation = [
        [op_name, cstm_params]
      ];
      let res = await this.$processTrxFunc(op_name, cstm_params);
      if (res.success) {
        this.acceptFriendPropagate(res.trx.tx, operation);
      } else {
        this.friendshipLoader = false;
      }
    },
    async acceptFriendPropagate(res, operation) {
      let url = new URL(process.env.actiAppUrl + 'acceptFriend/'
        + this.user.account.name + '/'
        + this.displayUser + '/'
        + res.ref_block_num + '/'
        + res.id + '/' + this.cur_bchain);

      if (this.isKeychainActive || this.isHiveauthActive) {

        let op_json = JSON.stringify(operation)
        url = new URL(process.env.actiAppUrl + 'acceptFriendHiveKeychain/'
          + this.user.account.name + '/'
          + this.displayUser + '/'
          + res.ref_block_num + '/'
          + res.id + '/'
          + this.cur_bchain + '?operation=' + op_json);
      }

      let req_res = await fetch(url);

      let outcome = await req_res.json();
      if (outcome.status == 'success') {
        this.friendshipLoader = false;
        this.$notify({
          group: 'success',
          text: this.$t('friendship_accepted'),
          position: 'top center'
        })
      } else {
        this.addFriendError = this.$t('unknown_error');
        this.friendshipLoader = false;
        return false;
      }
      this.refreshFriendStatus();
    },
    async refreshFriendStatus() {
      let res = await fetch(process.env.actiAppUrl + 'userFriends/' + this.displayUser);
      let outcome = await res.json();
      this.userFriends = outcome;
      
      let quer = await fetch(process.env.actiAppUrl + 'userFriendRequests/' + this.displayUser);
      this.friendRequests = await quer.json();
    },
    tipUser() {
      this.proceedTip = !this.proceedTip;
    },
    voteWitness() {
      this.voteWitnessDisplay = !this.voteWitnessDisplay;
    },
    isKeychainLogin() {
      return localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain
    },
    isHiveauthLogin() {
      return localStorage.getItem('acti_login_method') == 'hiveauth'
    },
    isStdLogin() {
      return localStorage.getItem('std_login')
    },
    proceedWitnessVote(isProxy) {
      this.error_proceeding = false;
      if (!this.isKeychainLogin() && !this.isHiveauthLogin() && this.isStdLogin()) {
        if (this.$refs["p-ac-key"].value == '') {
          this.error_proceeding = true;
          this.error_msg = this.$t('all_fields_required');
          return;
        }
      }
      this.votingProgress = true;
      let parentRef = this;
      if (isProxy) {
        if (!this.isKeychainLogin() && !this.isHiveauthLogin() && this.isStdLogin()) {
          hive.broadcast.accountWitnessProxy(this.$refs["p-ac-key"].value, this.displayUser, 'actifit', function (err, result) {
            if (err) {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote_proxy');
              parentRef.votingProgress = false;
            } else {
              parentRef.votingProgress = false;
              parentRef.voteWitnessDisplay = false;
              parentRef.$notify({
                group: 'success',
                text: parentRef.$t('Witness_proxy_set_successfully'),
                position: 'top center'
              })
              parentRef.getAccountData();
            }
          });
        } else if (this.isKeychainLogin()) {
          window.hive_keychain.requestProxy(this.displayUser, 'actifit', (response) => {
            if (response.success) {
              parentRef.votingProgress = false;
              parentRef.voteWitnessDisplay = false;
              parentRef.$notify({
                group: 'success',
                text: parentRef.$t('Witness_proxy_set_successfully'),
                position: 'top center'
              })
              parentRef.getAccountData();
            } else {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote_proxy');;
              parentRef.votingProgress = false;
            }
          });
        } else if (this.isHiveauthLogin()) {
          const auth = {
            username: this.user.account.name,
            token: localStorage.getItem('access_token'),
            expire: localStorage.getItem('expires'),
            key: localStorage.getItem('key')
          }
          let cstm_params = {
            account: this.user.account.name,
            proxy: 'actifit',
          }
          let operation = [['account_witness_proxy', cstm_params]];
          this.$HAS.broadcast(auth, 'active', operation, (evt) => {
            let msg = this.$t('verify_hiveauth_app');
            this.$notify({
              group: 'warn',
              text: msg,
              duration: -1, 
              position: 'top center'
            })
          })
            .then(response => {
              this.$notify({ group: 'warn', clean: true })
              if (response.cmd && response.cmd === 'sign_ack') {
                parentRef.votingProgress = false;
                parentRef.voteWitnessDisplay = false;
                parentRef.$notify({
                  group: 'success',
                  text: parentRef.$t('Witness_proxy_set_successfully'),
                  position: 'top center'
                })
                parentRef.getAccountData();
              } else if (response.cmd && response.cmd === 'sign_nack') {
                parentRef.error_proceeding = true;
                parentRef.error_msg = parentRef.$t('Error_sending_vote_proxy');;
                parentRef.votingProgress = false;
              }
            })
            .catch(err => {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote_proxy');;
              parentRef.votingProgress = false;
            })
        }
      } else {
        if (!this.isKeychainLogin() && !this.isHiveauthLogin() && this.isStdLogin()) {
          hive.broadcast.accountWitnessVote(this.$refs["p-ac-key"].value, this.displayUser, 'actifit', 1, function (err, result) {
            if (err) {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote');;
              parentRef.votingProgress = false;
            } else {
              parentRef.votingProgress = false;
              parentRef.voteWitnessDisplay = false;
              parentRef.$notify({
                group: 'success',
                text: parentRef.$t('Witness_voted_successfully'),
                position: 'top center'
              })
              parentRef.getAccountData();
            }
          });
        } else if (this.isKeychainLogin()) {
          window.hive_keychain.requestWitnessVote(this.displayUser, 'actifit', true, (response) => {
            if (response.success) {
              parentRef.votingProgress = false;
              parentRef.voteWitnessDisplay = false;
              parentRef.$notify({
                group: 'success',
                text: parentRef.$t('Witness_voted_successfully'),
                position: 'top center'
              })
              parentRef.getAccountData();
            } else {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote');;
              parentRef.votingProgress = false;
            }
          });
        } else if (this.isHiveauthLogin()) {
          const auth = {
            username: this.user.account.name,
            token: localStorage.getItem('access_token'),
            expire: localStorage.getItem('expires'),
            key: localStorage.getItem('key')
          }
          let cstm_params = {
            account: this.user.account.name,
            witness: 'actifit',
            approve: true
          }
          let operation = [['account_witness_vote', cstm_params]];
          this.$HAS.broadcast(auth, 'active', operation, (evt) => {
            let msg = this.$t('verify_hiveauth_app');
            this.$notify({
              group: 'warn',
              text: msg,
              duration: -1,
              position: 'top center'
            })
          })
            .then(response => {
              this.$notify({ group: 'warn', clean: true })
              if (response.cmd && response.cmd === 'sign_ack') {
                parentRef.votingProgress = false;
                parentRef.voteWitnessDisplay = false;
                parentRef.$notify({
                  group: 'success',
                  text: parentRef.$t('Witness_proxy_set_successfully'),
                  position: 'top center'
                })
                parentRef.getAccountData();
              } else if (response.cmd && response.cmd === 'sign_nack') {
                parentRef.error_proceeding = true;
                parentRef.error_msg = parentRef.$t('Error_sending_vote_proxy');;
                parentRef.votingProgress = false;
              }
            })
            .catch(err => {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote_proxy');;
              parentRef.votingProgress = false;
            })
        }
      }

    },
    async proceedTipActivity() {
      this.tipError = '';
      if (!this.user) {
        this.tipError = this.$t('Need_login_tip');
        return false;
      }
      if (this.displayUser == this.user.account.name) {
        this.tipError = this.$t('Cannot_tip_self');
        return false;
      }
      if (this.$refs["funds-pass"].value == '') {
        this.tipError = this.$t('error_missing_funds_pass') + ' <u><a href="/wallet?action=set_funds_pass">' + this.$t('create_funds_pass') + '</a></u>';
        return;
      }
      if (this.$refs["tip-amount"].value == '') {
        this.tipError = this.$t('amount_positive_int');
        return;
      }
      if (parseFloat(this.$refs["tip-amount"].value) > parseFloat(this.userTokens)) {
        this.tipError = this.$t('amount_above_balance');
        return;
      }
      this.tipInProgress = true;
      let res = await fetch(process.env.actiAppUrl + 'tipAccount/'
        + '?user=' + this.user.account.name
        + '&targetUser=' + this.displayUser
        + '&amount=' + this.$refs["tip-amount"].value
        + '&fundsPass=' + this.$refs["funds-pass"].value);
      let outcome = await res.json();
      if (outcome.status == 'Success') {
        let tipTransaction = { action: 'Tip', amount: outcome.tipAmount, recipient: this.displayUser };
        let cstm_params = {
          required_auths: [],
          required_posting_auths: [this.user.account.name],
          id: 'actifit',
          json: JSON.stringify(tipTransaction)
        };
        let res = await this.$processTrxFunc('custom_json', cstm_params);
        if (res.success) {
          this.$notify({
            group: 'success',
            text: this.$t('tip_successfully_sent'),
            position: 'top center'
          })
          this.$store.dispatch('fetchUserTokens')
          this.userTokenCount = outcome.recipientTokenCount;
        } else {
          this.friendshipLoader = false;
        }

        this.proceedTip = false;
      } else {
        this.tipError = outcome.error;
      }
      this.tipInProgress = false;
    },
    getUserActivityLevel() {
      return this.calcScore(this.rewarded_posts_rules, this.rewardedPostCount)
    },
    userHasBadge(badgeType) {
      if (this.userBadges.length > 0) {
        let matchingBadge = this.userBadges.find(badge_entry => (badge_entry.user === this.displayUser && badge_entry.badge === badgeType));
        if (matchingBadge) {
          return true;
        }
      }
      return false;
    },
    badgeClaimable(badgeType) {
      if (!this.user || (this.displayUser !== this.user.account.name)) {
        return false;
      }
      if (this.userHasBadge(badgeType)) {
        return false;
      } else if (badgeType == this.iso_badge && this.isoParticipant.length > 0) {
        return true;
      } else if (badgeType.includes(this.rew_activity_badge)) {
        let badgeLevel = badgeType.replace(this.rew_activity_badge, '');
        if (this.getUserActivityLevel() >= badgeLevel) {
          return true;
        }
      } else if (badgeType == this.doubledup_badge && this.doubledupWinner.length > 0) {
        return true;
      } else if (badgeType == this.charity_badge && this.charityDonor.length > 0) {
        return true;
      }
      return false;
    },
    pureDate(val) {
      if (!val || val == '-') {
        return '';
      }
      let date = new Date(val)
      return date.getDate() + '/'
        + (date.getMonth() + 1) + '/'
        + date.getFullYear()
    },
    async fetchUserData() {
      if (typeof this.user != 'undefined' && this.user != null) {
        if (!localStorage.getItem('std_login')) {
          try {
            let user_data = await this.$steemconnect.me();
            this.user.account = user_data.account;
          } catch (excp) {
            console.error(excp);
          }
        }
        this.$store.dispatch('fetchUserTokens')
        this.$store.dispatch('fetchUserRank')
        fetch(process.env.poshVerificationUrl + this.displayUser).then(
          res => { res.json().then(json => this.setPoshVerifStatus(json)) }).catch(e => console.error(e))
        this.$forceUpdate()
      }
    },
    setProperNode() {
      this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      let properNode = hive;
      if (this.cur_bchain === 'STEEM') {
        properNode = steem;
      } else if (this.cur_bchain === 'BLURT') {
        properNode = blurt;
      }
      return properNode;
    },
    
    getAccountData() {
      return new Promise(async (resolve, reject) => {
        try {
          const chainLnk = await this.setProperNode();
          this.profImgUrl = this.cur_bchain === 'STEEM' ? process.env.steemImgUrl : process.env.hiveImgUrl;

          chainLnk.api.getAccounts([this.displayUser], (err, result) => {
            if (err || !result || result.length === 0) {
              console.error("Error fetching account data:", err);
              this.noUserFound = true;
              this.errorDisplay = this.$t('user_not_found_error');
              return reject(err || new Error('User not found'));
            }
            
            this.userinfo = result[0];

            chainLnk.api.getFollowCount(this.displayUser, (err_follow, res_follow) => {
              if (!err_follow) {
                this.follower_count = res_follow.follower_count;
                this.following_count = res_follow.following_count;
              }
             
              resolve(result[0]);
            });
          });

          this.refreshFriendStatus();
        } catch (e) {
          console.error("A critical API error occurred in getAccountData:", e);
          this.errorDisplay = "Failed to load user data. An external service may be unavailable.";
          reject(e);
        }
      });
    },
    isFriend() {
      if (this.user) {
        if (this.userFriends && this.userFriends.find(friend => (friend.friend == this.user.account.name))) {
          return true;
        }
        return false;
      }
      return false;
    },
    isOwnAccount() {
      if (this.user) {
        return (this.displayUser == this.user.account.name)
      }
      return false;
    },
    isPendingFriend() {
      if (this.user && this.friendRequests) {
        if (this.friendRequests.sent_pending && this.friendRequests.sent_pending.find(friend => (friend.target == this.user.account.name))) {
          return { status: true, direction: 1 };
        }
        if (this.friendRequests.received_pending && this.friendRequests.received_pending.find(friend => (friend.initiator == this.user.account.name))) {
          return { status: true, direction: 0 };
        }
        return false;
      }
      return false;
    },
    async claimBadge(badgeType) {
      if (this.badgeClaimable(badgeType)) {
        this.claimingBadge = badgeType;
        try {
          let res = await fetch(process.env.actiAppUrl + 'claimBadge/?user=' + this.displayUser + '&badge=' + badgeType);
          let outcome = await res.json();
          if (outcome.status == 'success') {
            let cstm_params = {
              required_auths: [],
              required_posting_auths: [this.user.account.name],
              id: 'actifit',
              json: "{ \"claimed_badge\": \"" + badgeType + "\"}"
            };
            let res = await this.$processTrxFunc('custom_json', cstm_params);
            if (res.success) {
              console.log('success');
            } else {
              console.log('error');
            }
            this.userBadges.push(outcome);
          } else {
            console.error(outcome);
          }
        } catch (err) {
          console.error(err);
        }
        this.claimingBadge = '';
      } else {
        this.claimError = true;
        this.claimErrorDesc = this.$t('badge_reqts_not_met');
      }
    },
    async setUserMeasurements(json) {
      this.userMeasurements = json;
      if (Array.isArray(json) && json.length > 0) {
        json[0].json_metadata.height ? this.lastHeight = json[0].json_metadata.height : '';
        json[0].json_metadata.heightUnit ? this.heightUnit = json[0].json_metadata.heightUnit : '';
        json[0].json_metadata.weight ? this.lastWeight = json[0].json_metadata.weight : '';
        json[0].json_metadata.weightUnit ? this.weightUnit = json[0].json_metadata.weightUnit : '';
        json[0].json_metadata.chest ? this.lastChest = json[0].json_metadata.chest : '';
        json[0].json_metadata.chestUnit ? this.chestUnit = json[0].json_metadata.chestUnit : '';
        json[0].json_metadata.waist ? this.lastWaist = json[0].json_metadata.waist : '';
        json[0].json_metadata.waistUnit ? this.waistUnit = json[0].json_metadata.waistUnit : '';
        json[0].json_metadata.thighs ? this.lastThighs = json[0].json_metadata.thighs : '';
        json[0].json_metadata.thighsUnit ? this.thighsUnit = json[0].json_metadata.thighsUnit : '';
        json[0].json_metadata.bodyfat ? this.lastBodyfat = json[0].json_metadata.bodyfat : '';
        json[0].date ? this.lastUpdated = json[0].date : '';
      }
    },
    async setUserActivity(json) {
      this.userActivity = json;
      if (Array.isArray(json) && json.length > 0) {
        this.lastActivityCount = this.numberFormat(json[0].json_metadata.step_count[0]);
        this.lastActivityDate = this.pureDate(json[0].date);
      }
    },
    async setTipBalance(json) {
      if (json && json.tip_balance) {
        this.userAFITTipTokenCount = json.tip_balance
      }
    },
    async setPoshVerifStatus(json) {
      if (json && json.twitter_username) {
        this.poshVerified = true;
        if (this.user) {
          if (this.displayUser == this.user.account.name) {
            this.poshUserData = json;
          }
        }
      } else {
        this.poshVerified = false;
        this.poshUserData = '';
      }
    },
    async set3SVideoCount(json) {
      if (json && json.count) {
        this.video_count_3s = json.count;
      }
    },
    async setSplinterCards(json) {
      this.splinterCards = json;
      fetch(process.env.splinter_api_url_user_collections.replace('_USERNAME_', this.displayUser)).then(
        res => { res.json().then(json => this.setUserSplinterCards(json)) }).catch(e => console.error(e))
    },
    async setUserSplinterCards(json) {
      if (json && json.player == this.displayUser && json.cards.length > 0) {
        this.userSplinterCards = json.cards;
        for (let i = 0; i < this.userSplinterCards.length; i++) {
          let ent = this.userSplinterCards[i];
          let matchCriteria = { id: ent.card_detail_id };
          let matchEntry = _.find(this.splinterCards, matchCriteria);
          ent.rarity = matchEntry.rarity;
          ent.name = matchEntry.name;
          ent.color = matchEntry.color;
          ent.type = matchEntry.type;
          ent.id = matchEntry.card_detail_id;
        }
        for (let i = 1; i < 5; i++) {
          this.splinterRarities[i] = await this.$findCardCountByRarity(this.userSplinterCards, i);
        }
      }
    }
  },
  
  async mounted() {
    try {
      this.textAreaLocationValue = this.textAreaLocation;
      this.textAreaDescriptionValue = this.textAreaDescription;
      this.textAreaLinkValue = this.textAreaLink;
      this.textAreaUsernameValue = this.textAreaUsername;
      this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      steem.api.setOptions({ url: process.env.steemApiNode });
      this.screenWidth = screen.width;
      hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
      hive.api.setOptions({ url: process.env.hiveApiNode });
      blurt.api.setOptions({ url: process.env.blurtApiNode });
      this.$store.dispatch('steemconnect/login');
      this.fetchUserData();

      if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined')) {
        this.displayUser = this.$route.params.username
        if (this.$route.params.username.startsWith('@')) {
          this.displayUser = this.$route.params.username.substring(1, this.$route.params.username.length);
        }
        
       
        const otherFetches = [
            fetch(process.env.actiAppUrl + 'trackedMeasurements/' + this.displayUser).then(res => res.json()).then(json => this.setUserMeasurements(json)),
            fetch(process.env.actiAppUrl + 'trackedActivity/' + this.displayUser).then(res => res.json()).then(json => this.setUserActivity(json)),
            fetch(process.env.actiAppUrl + 'getRank/' + this.displayUser).then(res => res.json()).then(json => this.userRank = json),
            fetch(process.env.actiAppUrl + 'userRewardedPostCount/' + this.displayUser).then(res => res.json()).then(json => this.rewardedPostCount = json.rewarded_post_count),
            fetch(process.env.actiAppUrl + 'user/' + this.displayUser).then(res => res.json()).then(json => this.userTokenCount = json.tokens),
            fetch(process.env.actiAppUrl + 'userBadges/' + this.displayUser).then(res => res.json()).then(json => this.userBadges = json),
            fetch(process.env.actiAppUrl + 'isoParticipant/' + this.displayUser).then(res => res.json()).then(json => this.isoParticipant = json),
            fetch(process.env.actiAppUrl + 'delegation/' + this.displayUser).then(res => res.json()).then(json => this.actifitDelegator = json),
            fetch(process.env.actiAppUrl + 'luckyWinner/' + this.displayUser).then(res => res.json()).then(json => this.doubledupWinner = json),
            fetch(process.env.actiAppUrl + 'charityDonor/' + this.displayUser).then(res => res.json()).then(json => this.charityDonor = json),
            fetch(process.env.actiAppUrl + 'is_banned/' + this.displayUser).then(res => res.json()).then(json => this.account_banned = json),
            fetch(process.env.actiAppUrl + 'availableTipBalance?user=' + this.displayUser).then(res => res.json()).then(json => this.setTipBalance(json)),
            fetch(process.env.poshVerificationUrl + this.displayUser).then(res => res.json()).then(json => this.setPoshVerifStatus(json)),
            fetch(process.env.threeSpeakApiVidCount.replace('_USERNAME_', this.displayUser)).then(res => res.json()).then(json => this.set3SVideoCount(json)),
            fetch(process.env.splinter_api_all_cards).then(res => res.json()).then(json => this.setSplinterCards(json))
        ];

        if (badActors.includes(this.displayUser)){
          this.badActorWarning = true;
        }

        try {
          let bal = await hsc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFIT' });
          if (bal) { this.userAFITHETokenCount = bal.balance; }
          bal = await hsc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFITX' });
          if (bal) { this.userAFITXHETokenCount = bal.balance; }
        } catch (err) {
          console.error("H-E Engine API error:", err);
        }
        
        
        await this.getAccountData();

       
        await Promise.allSettled(otherFetches);

      } else {
        this.errorDisplay = this.$t('user_not_found_error');
      }
    } catch (e) {
      console.error("Fatal error during component mount:", e);
      this.errorDisplay = "An unexpected error occurred while loading the page.";
    } finally {
     
      this.loadingData = false;
    }
  }
}
</script>

<style>

.profile-content-area {
  padding: 1rem;
  background: linear-gradient(to bottom, rgba(255, 218, 185, 0.3), rgba(255, 255, 255, 0));
}
.quick-links-sidebar {
    position: sticky;
    top: 80px;
    background: linear-gradient(to bottom, #FFDAB9, rgba(255, 255, 255, 0));
    padding: 15px;
    border-radius: 10px;
}
.sidebar-title {
    color: #dc3545;
    font-weight: bold;
    text-align: center;
    margin-bottom: 15px;
}
.quick-links-sidebar a {
  display: flex; align-items: center; background-color: white; color: #dc3545;
  padding: 10px 15px; margin-bottom: 10px; border-radius: 5px; text-decoration: none;
  font-weight: bold; box-shadow: 0 2px 4px rgba(220, 53, 69, 0.4); transition: all 0.2s;
}
.quick-links-sidebar a:hover {
  transform: translateY(-2px); box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
}
.quick-links-sidebar a img, .quick-links-sidebar a i {
  width: 20px; margin-right: 10px; text-align: center;
}
.profile-header-top {
  background: linear-gradient(to right, #FFDAB9, #ffc107);
  border-radius: 10px;
  border: 1px solid #dee2e6;
  padding: 1rem;
}
.profile-header-top .user-name a, .profile-header-top .text-muted {
	color: #c82333;
	text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
}
.profile-header-top .rank-badge-main {
	border: 1px solid #c82333;
}
.profile-header-top .user-actions .edit-icon, .profile-header-top .user-actions .text-brand {
	color: #c82333 !important;
	text-shadow: 1px 1px 2px rgba(255,255,255,0.3);
}

.profile-main-content {
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #dee2e6;
  overflow: hidden;
}
.main-nav-tabs {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  padding: 0 0.5rem;
  background-color: #e9ecef;
}
.main-nav-tabs button {
  flex-grow: 1; background: transparent; border: none; padding: 15px; font-weight: bold;
  color: #6c757d; border-bottom: 3px solid transparent; transition: all 0.2s;
}
.main-nav-tabs button.active {
  background-color: #FFDAB9;
  color: #c82333;
  border-bottom-color: transparent;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.user-avatar { background-repeat: no-repeat; background-size: cover; background-position: center; }
.rank-badge-main {
  display: inline-block; background-color: #dc3545; color: white; padding: .2em .6em;
  border-radius: 10rem; font-size: 1rem; vertical-align: middle; margin-left: 10px;
}
.user-actions {
    font-size: 1.5rem;
}
.edit-icon { color: #dc3545; cursor: pointer; }
.header-action-icon { color: #dc3545; cursor: pointer; }

.fitness-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 15px;
}
.stat-box {
    background: linear-gradient(45deg, #28a745, #ffc107); color: white; padding: 15px;
    border-radius: 10px; text-align: center; min-height: 120px;
    display: flex; flex-direction: column; justify-content: center;
}
.stat-box h6 { font-weight: bold; margin-bottom: 5px; }
.stat-icon { width: 24px; height: 24px; margin: auto; }
.btn-chart {
    background-color: #dc3545; color: white; font-weight: bold; padding: 10px 20px; width: 80%;
}
.info-box-editable {
    background: linear-gradient(to right, #FFFAF0, rgba(255, 250, 240, 0));
    border: 1px solid #ffc107; border-radius: .35rem; color: #333;
}
.info-box-editable strong { color: #dc3545; }
.info-box-editable .info-value { color: #333; }
.info-box-editable .info-link { color: #333; }
.edit-pen-icon { cursor: pointer; color: #dc3545; opacity: 0.6; }
.edit-pen-icon:hover { opacity: 1; }
.token-logo { width: 20px; height: 20px; }
.activity-small-logo { width: 20px !important; vertical-align: middle; }

.btn-brand-red {
	background-color: #dc3545;
	color: white;
	border: 1px solid #c82333;
	box-shadow: 3px 3px 3px rgba(220, 53, 69, 0.4);
}
.btn-brand-red:hover {
	background-color: #c82333;
	color: white;
}
.posh-desc {
	font-size: 0.9rem;
	color: #6c757d;
	width: 100%;
	padding-top: 5px;
	flex-basis: 100%;
}
.splinter-details {
	font-size: 0.9rem;
	flex-basis: 100%;
	margin-top: 10px;
	padding-left: 25px;
}
.user-menu-container {
	width: 20px;
	height: 20px;
	vertical-align: middle;
}
.splinterlands-icon {
    width: 30px !important;
    height: 30px !important;
}
.square-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: auto;
  height: auto;
  padding: 0;
}
/* THIS IS THE FIX - REPLACING THE RULE BELOW */
.profileButtonMove {
  position: absolute;
  right: -5px;
  bottom: 0;
}

.large-avatar {
  position: relative;
  width: 100px; height: 100px; border-radius: 50%; border: 4px solid white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.user-avatar {
  margin-left: 10px;
}
@media only screen and (min-width: 601px) {
  .badge-img,
  .claimed-check {
    width: 150px;
    text-align: center;
  }
  .rew-activity-badge {
    position: relative;
    height: 270px;
  }
}
@media only screen and (max-width: 600px) {
  .badge-img,
  .claimed-check {
    width: 100px;
    text-align: center;
  }
  .rew-activity-badge {
    position: relative;
    height: 190px;
  }
}
.badges-title {
  text-align: center;
}
.badge-title {
  padding-left: 20px;
  font-weight: bold;
}
.badge-unclaimed {
  opacity: 0.2
}
.user-badges {
  margin: 10px;
}
.tip-details {
  margin: 10px;
  padding: 10px;
}
.single-rew-activity-badge {
  position: absolute;
  top: 20px;
}
.unclaimed-badge {
  position: relative;
}
.unclaimed-badge-spin {
  width: 200px;
}
.unclaimed-badge-btn {
  width: 200px;
  padding-left: 20px;
}
.unclaimed-badge-note {
  font-style: italic;
}
.badge-doubledup-desc {
  padding-left: 20px;
  width: 200px;
  text-align: left;
  font-style: italic;
}
.info-box-orange {
  color: #c82333;
  background: linear-gradient(30deg, #FFDAB9, transparent);
  border-radius: 10px;
  box-shadow: 3px 3px 3px rgb(220 53 69 / 40%);
}
.badge-entry {
  color: #fff !important;
  background: linear-gradient(45deg, green, orange);
  border: 1px solid #fff;
  border-radius: 10px;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  margin-bottom: 1rem;
  padding: 1rem;
}
.cntnr {
  min-height: 80px;
}
.btn-brand {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  margin-top: 2px;
}
</style>