<template>
  <div>
    <NavbarBrand />
    <div v-if="loadingData" class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center">
        <i class="fas fa-spin fa-spinner text-brand"></i>
      </div>
    </div>
    <div v-else-if="errorDisplay == ''" class="container pt-5 mt-5 col-lg-10 col-md-12">
      <div class="alert alert-danger" role="alert" v-if="badActorWarning">
        <h4 class="alert-heading">Warning!</h4>
        <p>There are reports that this account is a bad actor. Please exercise caution.</p>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="d-flex align-items-center flex-grow-1">
          <div class="user-avatar large-avatar"
            :style="'background-image: url(' + (userMeta && userMeta.profile && userMeta.profile.profile_image ? userMeta.profile.profile_image : profImgUrl + '/u/' + displayUser + '/avatar') + ')'">
             <span v-if="editOn && !account_banned" class="avatar-edit-button">
                <a href="#" class="btn btn-danger btn-sm" data-toggle="modal"
                  data-target="#profileImageModal" @click="showProfileImageModal">
                  <i class="fas fa-edit"></i>
                </a>
              </span>
          </div>
          <div class="user-info-header">
            <div class="d-flex align-items-center">
                <span class="username">@{{ displayUser }}</span>
                <span class="user-rank-badge ml-2">{{ displayCoreUserRank }}</span>
                <span v-if="user && user.account.name === displayUser && !account_banned" class="edit-profile-btn ml-2">
                  <a @click="editOn ? turnEditOff() : turnEditOn()">
                    <i :class="editOn ? 'fa-regular fa-eye' : 'fas fa-edit'"></i>
                  </a>
                </span>
            </div>
            <div class="join-date">{{ $t('Joined_On') }} {{ pureDate(userinfo.created) }}</div>
          </div>
        </div>

        <!-- Friendship action buttons -->
        <div v-if="user && !isOwnAccount() && !account_banned" class="friend-actions">
            <span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend()">
                <button class="btn btn-sm btn-warning" @click="dropFriend"><i class="fas fa-user-times mr-1"></i> {{ $t('unfriend') }}</button>
            </span>
            <span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend()">
                <button v-if="isPendingFriend().direction == 0" class="btn btn-sm btn-secondary" @click="cancelFriendRequest">{{ $t('request_sent') }}</button>
                <button v-else-if="isPendingFriend().direction == 1" class="btn btn-sm btn-info" @click="acceptFriend">{{ $t('accept_request') }}</button>
            </span>
            <span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-else>
                <button class="btn btn-sm btn-success" @click="addFriend"><i class="fas fa-user-plus mr-1"></i> {{ $t('add_friend') }}</button>
            </span>
            <i v-if="friendshipLoader" class="fas fa-spinner fa-spin ml-2"></i>
            <div v-if="addFriendError" v-html="addFriendError" class="text-danger small mt-1"></div>
        </div>
      </div>

      <!-- Main Body Layout -->
      <div class="profile-body">
        <!-- Main Content: Tabs -->
        <div class="main-content-tabs">
          <!-- Tab Navigation -->
          <div class="tab-nav">
            <button @click="activeTab = 'about'" :class="{ active: activeTab === 'about' }">{{ $t('About') }}</button>
            <button @click="activeTab = 'fitness'" :class="{ active: activeTab === 'fitness' }">{{ $t('Fitness') }}</button>
            <button @click="activeTab = 'community'" :class="{ active: activeTab === 'community' }">{{ $t('Community') }}</button>
            <button @click="activeTab = 'wallet'" :class="{ active: activeTab === 'wallet' }">{{ $t('Wallet') }}</button>
            <button @click="activeTab = 'badges'" :class="{ active: activeTab === 'badges' }">{{ $t('Badges') }}</button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- About Tab -->
            <div v-if="activeTab === 'about'" class="about-tab">
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-user-circle fa-fw mr-2"></i> {{ $t('Display_Name') }}</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'username'" class="d-flex justify-content-end align-items-center h-100 w-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <template v-else>
                        <span class="about-item-text" v-if="!usernameEditOn">{{ textAreaUsernameValue || $t('Not_Set') }}</span>
                        <div class="about-item-edit" v-else>
                          <textarea v-model="textAreaUsernameValue"></textarea>
                          <a class="btn btn-sm btn-success p-1" @click.prevent="saveFunc('username')"><i class="fa-solid fa-check"></i></a>
                          <a class="btn btn-sm btn-danger p-1" @click.prevent="turnUsernameEditOff"><i class="fa-solid fa-xmark"></i></a>
                        </div>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !usernameEditOn" @click.prevent="turnUsernameEditOn"><i class="fas fa-edit"></i></a>
                     </template>
                  </div>
               </div>
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-map-marker-alt fa-fw mr-2"></i> {{ $t('Location') }}</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'location'" class="d-flex justify-content-end align-items-center h-100 w-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <template v-else>
                        <span class="about-item-text" v-if="!locationEditOn">{{ textAreaLocationValue || $t('Not_Set') }}</span>
                        <div class="about-item-edit" v-else>
                          <textarea v-model="textAreaLocationValue"></textarea>
                          <a class="btn btn-sm btn-success p-1" @click.prevent="saveFunc('location')"><i class="fa-solid fa-check"></i></a>
                          <a class="btn btn-sm btn-danger p-1" @click.prevent="turnLocationEditOff"><i class="fa-solid fa-xmark"></i></a>
                        </div>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !locationEditOn" @click.prevent="turnLocationEditOn"><i class="fas fa-edit"></i></a>
                     </template>
                  </div>
               </div>
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-info-circle fa-fw mr-2"></i> {{ $t('Description') }}</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'description'" class="d-flex justify-content-end align-items-center h-100 w-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                      <template v-else>
                        <span class="about-item-text" v-if="!descriptionEditOn">{{ textAreaDescriptionValue || $t('Not_Set') }}</span>
                        <div class="about-item-edit" v-else>
                          <textarea v-model="textAreaDescriptionValue"></textarea>
                          <a class="btn btn-sm btn-success p-1" @click.prevent="saveFunc('description')"><i class="fa-solid fa-check"></i></a>
                          <a class="btn btn-sm btn-danger p-1" @click.prevent="turnDescriptionEditOff"><i class="fa-solid fa-xmark"></i></a>
                        </div>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !descriptionEditOn" @click.prevent="turnDescriptionEditOn"><i class="fas fa-edit"></i></a>
                     </template>
                  </div>
               </div>
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-link fa-fw mr-2"></i> {{ $t('Website') }}</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'link'" class="d-flex justify-content-end align-items-center h-100 w-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <template v-else>
                        <div class="about-item-text" v-if="!linkEditOn">
                          <a v-if="userMeta && userMeta.profile && userMeta.profile.website" :href="userMeta.profile.website" target="_blank">{{ textAreaLinkValue }}</a>
                          <span v-else>{{ textAreaLinkValue || $t('Not_Set') }}</span>
                        </div>
                        <div class="about-item-edit" v-else>
                          <textarea v-model="textAreaLinkValue"></textarea>
                          <a class="btn btn-sm btn-success p-1" @click.prevent="saveFunc('link')"><i class="fa-solid fa-check"></i></a>
                          <a class="btn btn-sm btn-danger p-1" @click.prevent="turnLinkEditOff"><i class="fa-solid fa-xmark"></i></a>
                        </div>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !linkEditOn" @click.prevent="turnLinkEditOn"><i class="fas fa-edit"></i></a>
                     </template>
                  </div>
               </div>
            </div>

            <!-- Fitness Tab -->
            <div v-if="activeTab === 'fitness'" class="fitness-tab-container">
                <div class="fitness-section-grid-measurements">
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/height.png"><div>{{ $t('Height') }}</div><div class="value">{{ lastHeight + ' ' + heightUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/bodyfat.png"><div>{{ $t('Body_Fat') }}</div><div class="value">{{ lastBodyfat + ' % ' }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/waist.png"><div>{{ $t('Waist') }}</div><div class="value">{{ lastWaist + ' ' + waistUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/weight.png"><div>{{ $t('Weight') }}</div><div class="value">{{ lastWeight + ' ' + weightUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/chest.png"><div>{{ $t('Chest') }}</div><div class="value">{{ lastChest + ' ' + chestUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/thighs.png"><div>{{ $t('Thighs') }}</div><div class="value">{{ lastThighs + ' ' + thighsUnit }}</div></div>
                </div>
                <div class="fitness-action-btn-container">
                    <a href="#" data-toggle="modal" class="btn btn-danger" data-target="#measureChartModal" v-if="isFriend() || isOwnAccount()">{{ $t('Stats_chart') }}</a>
                    <a href="#" class="btn btn-danger" @click.prevent="displayAddFriendStats = !displayAddFriendStats" v-else-if="user">{{ $t('Stats_chart') }}</a>
                    <a href="#" class="btn btn-danger" @click.prevent="displayLoginStats = !displayLoginStats" v-else>{{ $t('Stats_chart') }}</a>
                </div>
                 <div v-show="displayAddFriendStats" class="interactive-prompt mt-2">
                    <div>{{ $t('View_chart_notice').replace('_USER', this.username) }}</div>
                    <button class="btn btn-sm btn-success mt-2" @click="addFriend"><i class="fas fa-user-plus mr-1"></i> {{ $t('add_friend') }}</button>
                    <div v-if="addFriendError" v-html="addFriendError" class="text-danger small mt-1"></div>
                </div>
                 <div v-show="displayLoginStats" class="interactive-prompt mt-2">
                    <div>
                        <button class="btn btn-danger" @click="showModalFunc">{{ $t('Login') }}</button>
                        <a href="/signup" class="btn btn-danger ml-2">{{ $t('Sign_Up') }}</a>
                    </div>
                </div>
                <div class="fitness-section-grid-activity">
                    <div class="fitness-card activity-card">
                        <div>{{ $t('Latest_Activity_Count') }}</div>
                        <img src="/img/actifit_logo.png" class="activity-small-logo">
                        <div class="value">{{ lastActivityCount }}</div>
                    </div>
                    <div class="fitness-card activity-card">
                        <div>{{ $t('Latest_Activity_Date') }}</div>
                        <div class="value">{{ lastActivityDate }}</div>
                    </div>
                </div>
                <div class="fitness-action-btn-container">
                    <a href="#" data-toggle="modal" class="btn btn-danger" data-target="#activityChartModal" v-if="isFriend() || isOwnAccount()">{{ $t('View_activity_chart') }}</a>
                    <a href="#" class="btn btn-danger" @click.prevent="displayAddFriendActivity = !displayAddFriendActivity" v-else-if="user">{{ $t('View_activity_chart') }}</a>
                    <a href="#" class="btn btn-danger" @click.prevent="displayLoginActivity = !displayLoginActivity" v-else>{{ $t('View_activity_chart') }}</a>
                </div>
                 <div v-show="displayAddFriendActivity" class="interactive-prompt mt-2">
                    <div>{{ $t('View_chart_notice').replace('_USER', this.username) }}</div>
                    <button class="btn btn-sm btn-success mt-2" @click="addFriend"><i class="fas fa-user-plus mr-1"></i> {{ $t('add_friend') }}</button>
                    <div v-if="addFriendError" v-html="addFriendError" class="text-danger small mt-1"></div>
                </div>
                 <div v-show="displayLoginActivity" class="interactive-prompt mt-2">
                     <div>
                        <button class="btn btn-danger" @click="showModalFunc">{{ $t('Login') }}</button>
                        <a href="/signup" class="btn btn-danger ml-2">{{ $t('Sign_Up') }}</a>
                    </div>
                </div>
            </div>

            <!-- Community Tab -->
            <div v-if="activeTab === 'community'" class="community-tab">
              <div class="community-item">
                <div class="community-item-content">
                  <img src="/img/poshlogo.png" class="mr-3" style="width: 50px;">
                  <div class="flex-grow-1">
                    <span v-if="poshVerified">
                      <i class="fas fa-check text-success" style="font-size:large"></i> {{ $t('Posh_connected') }}: 
                      <a :href="poshUserData.twitter_profile" v-if="poshUserData.twitter_username">@{{ poshUserData.twitter_username }}</a>
                    </span>
                     <div v-html="$t('posh_desc_profile')"></div>
                  </div>
                  <a v-if="!poshVerified" class="btn btn-danger m-2" href="https://hiveposh.com/" target="_blank">{{ $t('Posh_verify') }}</a>
                </div>
              </div>
              <div class="community-item">
                <div class="community-item-content">
                  <div>
                    <i class="fas fa-user-friends text-brand mr-2"></i> {{ this.userFriends.length }} {{ $t('friends') }}
                    <div class="mt-2">
                        <UserHoverCard v-for="friend in displayedFriends" :key="friend.friend" :username="friend.friend" displayMode="avatar-only" />
                        <span v-if="userFriends.length > maxFriendDisplay">
                            +{{ userFriends.length - maxFriendDisplay }}
                        </span>
                    </div>
                  </div>
                  <a class="btn btn-danger m-2" href="./friends">{{ $t('View_friends') }}</a>
                </div>
              </div>
              <div class="community-item">
                <div class="community-item-content">
                  <a :href="'/activity/' + displayUser">
                    <img src="/img/actifit_logo.png" class="mr-2 token-logo">
                    {{ numberFormat(rewardedPostCount, 0) }} {{ $t('Activity_Reports_Rewarded') }}
                  </a>
                  <a :href="'/activity/' + displayUser" class="btn btn-danger m-2">{{ $t('View_reports') }}</a>
                </div>
              </div>
               <div class="community-item">
                 <div class="community-item-content">
                    <a :href="'/' + displayUser + '/blog'">
                      <img src="/img/HIVE.png" class="mr-2 token-logo">
                      {{ userinfo.post_count ? numberFormat(userinfo.post_count, 0) : '0' }} {{ $t('Steem_posts_comments') }}
                    </a>
                    <a :href="'/' + displayUser + '/blog'" class="btn btn-danger m-2">{{ $t('View_blog') }}</a>
                 </div>
              </div>
                            <div class="community-item">
                <div class="community-item-content">
                   <div class="d-flex align-items-center flex-grow-1">
                      <i class="fa-solid fa-gamepad text-brand mr-2"></i>{{ $t('Splinterlands') }}
                      
                      <img src="https://d36mxiodymuqjm.cloudfront.net/website/icons/img_icon_splinterlands.svg" class="mr-2 ml-2" style="width: 30px" :alt="$t('Splinterlands')">
                      
                      <a href="#" data-toggle="modal" data-target="#notifyModal" class="text-danger"><i class="fas fa-info-circle" :title="$t('view_details')"></i></a>
                   </div>
                  <a href="https://splinterlands.com/" target="_blank" class="btn btn-danger m-2">{{ $t('Play_splinterlands') }}</a>
                </div>
              </div>
              <div class="community-item">
                <div class="community-item-content">
                  <a :href="'/' + displayUser + '/videos'">
                    <img src="/img/3speak.png" class="mr-2 token-logo">
                    {{ numberFormat(video_count_3s, 0) }} {{ $t('Videos_3speak') }}
                  </a>
                  <a :href="'/' + displayUser + '/videos'" class="btn btn-danger m-2">{{ $t('View_videos') }}</a>
                </div>
              </div>
              <div class="community-item d-flex justify-content-between">
                  <span><i class="fas fa-angle-double-left text-brand mr-2"></i>{{ $t('Followers') }}: {{ getFollowerCount }}</span>
                  <span><i class="fas fa-angle-double-right text-brand mr-2"></i>{{ $t('Following') }}: {{ getFollowingCount }}</span>
              </div>
            </div>
            
           
            <div v-if="activeTab === 'wallet'" class="wallet-tab">
             
              <div class="wallet-card" v-if="userinfo">
                 <div class="d-flex justify-content-between align-items-end flex-wrap">
                    
                    <div>
                      <div v-if="userinfo.witness_votes.includes('actifit') || userinfo.proxy == 'actifit'">
                        <i class="fas fa-check text-success mr-2"></i>{{ $t('Votes_Actifit_Witness') }} <span v-if="userinfo.proxy == 'actifit'">({{ $t('proxy') }})</span>
                      </div>
                      <button class="btn btn-danger m-2" @click="voteWitness">{{ $t('Vote_Now_Actifit_Witness') }}</button>
                    </div>

                  
                    <div>
                      <div v-if="actifitDelegator" class="text-dark">
                        <i class="fas fa-check text-success mr-2"></i>{{ $t('Delegates_to_Actifit') }} ({{ actifitDelegator.steem_power }} {{ $t('Hive_Power') }})
                      </div>
                       <a class="btn btn-danger m-2" href="/wallet" target="_blank">{{ $t('Delegate_Now_Actifit') }}</a>
                    </div>
                 </div>

                
                <div v-if="voteWitnessDisplay" class="wallet-action-box">
                  <div v-if="!isKeychainLogin() && isStdLogin() && !isHiveauthLogin()" class="form-group">
                    <label for="p-ac-key">{{ $t('Active_Key') }} *</label>
                    <input type="password" id="p-ac-key" name="p-ac-key" ref="p-ac-key" class="form-control">
                  </div>
                  <div class="text-center">
                    <button class="btn btn-danger m-1" @click="proceedWitnessVote()">{{ $t('Vote') }}</button>
                    <button class="btn btn-danger m-1" @click="proceedWitnessVote(1)">{{ $t('Set_proxy') }}</button>
                    <button class="btn btn-danger m-1" @click="voteWitness">{{ $t('Cancel') }}</button>
                  </div>
                  <div class="text-center mt-2"><i v-if="votingProgress" class="fas fa-spin fa-spinner"></i></div>
                  <div class="alert alert-danger text-center mt-2" v-if="error_proceeding">
                    {{ this.error_msg }}
                  </div>
                </div>
              </div>

              
              <div class="wallet-card">
                <div class="wallet-balances-grid">
                  <div class="balance-card">
                    <div class="balance-card-header">
                        <img src="/img/actifit_logo.png" class="token-logo">
                        <span>{{ $t('AFIT_Tokens') }}</span>
                    </div>
                    <div class="balance-card-value">{{ numberFormat(userTokenCount, 3) }}</div>
                    <div class="balance-card-subtext">Main Balance</div>
                  </div>
                  <div class="balance-card">
                    <div class="balance-card-header">
                        <img src="/img/actifit_logo.png" class="token-logo">
                        <span>{{ $t('AFIT_HE_Tokens') }}</span>
                    </div>
                    <div class="balance-card-value">{{ displayAFITHEBal }}</div>
                    <div class="balance-card-subtext">Hive-Engine</div>
                  </div>
                  <div class="balance-card">
                    <div class="balance-card-header">
                        <img src="/img/AFITX.png" class="token-logo">
                        <span>{{ $t('AFITX_HE_Tokens') }}</span>
                    </div>
                    <div class="balance-card-value">{{ displayAFITXHEBal }}</div>
                    <div class="balance-card-subtext">Hive-Engine</div>
                  </div>
                  <div class="balance-card tip-card">
                    <div class="balance-card-header">
                        <img src="/img/actifit_logo.png" class="token-logo">
                        <span>{{ $t('AFIT_Tip_Tokens') }}</span>
                        <i class="fas fa-info-circle ml-2 text-danger" @click="showAfitTipInfo = !showAfitTipInfo"></i>
                    </div>
                    <div class="balance-card-value">{{ displayAFITTipBal }}</div>
                    <button class="btn btn-sm btn-danger mt-2" v-if="user && !isOwnAccount()" @click="tipUser">{{ $t('Send_tip') }}</button>
                  </div>
                </div>

                <div v-if="showAfitTipInfo" class="alert alert-info mt-3 small" v-html="$t('tipping_details')" />
                
                <div v-if="proceedTip" class="wallet-action-box mt-3">
                  <div class="tip-details">
                    <div class="form-group">
                      <label for="tip-amount">{{ $t('Tip_Amount') }}</label>
                      <input type="number" id="tip-amount" name="tip-amount" ref="tip-amount" class="form-control">
                    </div>
                    <div class="form-group">
                      <label for="funds-pass">{{ $t('Funds_Password') }}</label>
                      <input type="password" id="funds-pass" name="funds-pass" ref="funds-pass" class="form-control">
                      <small><a href="/wallet?action=set_funds_pass" target="_blank">{{ $t('create_pass_short') }}</a></small>
                    </div>
                    <div v-if="tipError" v-html="tipError" class="alert alert-danger"></div>
                    <div>
                      <button v-on:click="proceedTipActivity" class="btn btn-danger">{{ $t('Proceed') }}</button>
                      <i class="fas fa-spin fa-spinner ml-2" v-if="tipInProgress"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Badges Tab -->
            <div v-if="activeTab === 'badges'" class="badges-tab">
                <div class="badge-list-item">
                  <div class="badge-image-container">
                    <img class="badge-img" :class="{'badge-unclaimed': !userHasBadge(iso_badge)}" src="/img/badges/actifit_iso_badge.png">
                  </div>
                  <div class="badge-details">
                    <div class="badge-title">{{ $t('iso_badge_title') }}</div>
                    <div v-if="userHasBadge(iso_badge)" class="badge-status-claimed"><i class="fas fa-check"></i> {{ $t('Claimed') }}</div>
                    <button v-if="badgeClaimable(iso_badge)" @click="claimBadge(iso_badge)" class="btn btn-danger btn-sm">{{ $t('Claim_badge') }}</button>
                    <div v-else-if="!userHasBadge(iso_badge) && this.isoParticipant.length == 0" class="badge-status-missed">{{ $t('missed_event_notice') }}</div>
                  </div>
                </div>
                <div class="badge-list-item">
                   <div class="badge-details w-100">
                      <div class="badge-title">{{ $t('rew_activity_badge_title') }}</div>
                      <div class="d-flex flex-wrap">
                        <div v-for="level in rewarded_posts_rules" :key="level[1]" class="m-2 text-center">
                           <div v-if="level[1] > 0 && level[1] <= maxClaimedActivityBadgeLevel()">
                              <img class="badge-img-small" :class="{'badge-unclaimed': !userHasBadge(rew_activity_badge + level[1])}" :src="'/img/badges/actifit_rew_act_lev_' + level[1] + '_badge.png'">
                              <button v-if="badgeClaimable(rew_activity_badge + level[1])" @click="claimBadge(rew_activity_badge + level[1])" class="btn btn-danger btn-sm d-block mx-auto mt-1">{{ $t('Claim_badge') }}</button>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div class="badge-list-item">
                  <div class="badge-image-container">
                    <img class="badge-img" :class="{'badge-unclaimed': !userHasBadge(doubledup_badge)}" src="/img/badges/actifit_doubled_up_badge.png">
                  </div>
                  <div class="badge-details">
                    <div class="badge-title">{{ $t('doubledup_badge_title') }}</div>
                    <div v-if="userHasBadge(doubledup_badge)" class="badge-status-claimed"><i class="fas fa-check"></i> {{ $t('Claimed') }}</div>
                    <button v-if="badgeClaimable(doubledup_badge)" @click="claimBadge(doubledup_badge)" class="btn btn-danger btn-sm">{{ $t('Claim_badge') }}</button>
                    <div v-else-if="!userHasBadge(doubledup_badge) && this.doubledupWinner.length == 0" class="badge-status-missed">{{ $t('not_lucky_yet') }}</div>
                  </div>
                </div>
                 <div class="badge-list-item">
                  <div class="badge-image-container">
                    <img class="badge-img" :class="{'badge-unclaimed': !userHasBadge(charity_badge)}" src="/img/badges/actifit_charity_badge.png">
                  </div>
                  <div class="badge-details">
                    <div class="badge-title">{{ $t('charity_badge_title') }}</div>
                     <div v-if="userHasBadge(charity_badge)" class="badge-status-claimed"><i class="fas fa-check"></i> {{ $t('Claimed') }}</div>
                    <button v-if="badgeClaimable(charity_badge)" @click="claimBadge(charity_badge)" class="btn btn-danger btn-sm">{{ $t('Claim_badge') }}</button>
                  </div>
                </div>
            </div>
          </div>
        </div>

       
        <div class="quick-links-sidebar">
         
          <h4 class="quick-links-title">{{ $t('Quick_links') }}</h4>
          <a :href="'/activity/' + displayUser" class="quick-link-item">
            <img src="/img/actifit_logo.png" class="mr-2 token-logo">
            <span>{{ $t('Actifit_reports') }}</span>
          </a>
          <a :href="'/' + displayUser + '/blog'" class="quick-link-item">
            <img src="/img/HIVE.png" class="mr-2 token-logo">
            <span>{{ $t('Hive_blog') }}</span>
          </a>
          <a :href="'/' + displayUser + '/videos'" class="quick-link-item">
            <img src="/img/3speak.png" class="mr-2 token-logo">
            <span>{{ $t('Threespeak_videos') }}</span>
          </a>
          <a :href="'/' + displayUser + '/comments'" class="quick-link-item">
            <i class="far fa-comments mr-2"></i>
            <span>{{ $t('Hive_comments') }}</span>
          </a>
          <a :href="'/' + displayUser + '/wallet'" class="quick-link-item">
            <i class="fas fa-solid fa-wallet mr-2"></i>
            <span>{{ $t('Wallet') }}</span>
          </a>
        </div>
      </div>
    </div>
    <div v-else class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center">
        <h4>{{ errorDisplay }}</h4>
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
        [9, 0],[29, 1],[59, 2],[89, 3],[119, 4],[179, 5],[359, 6],[539, 7],[719, 8],[1079, 9],[1080, 10]
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
      linkForImage: '',
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
        if (this.userinfo && this.userinfo.posting_json_metadata) {
            return JSON.parse(this.userinfo.posting_json_metadata);
        }
        return null;
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
        if ($ && typeof $.fn.modal === 'function') {
          $('#loginModal').modal('show');
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
      return;
    },
    turnEditOff() {
      this.editOn = false;
      this.linkEditOn = false;
      this.usernameEditOn = false;
      this.descriptionEditOn = false;
      this.locationeditOn = false;
      return;
    },
    async broadcastUpdate(updateData, field) {
      if (this.user.account.posting_json_metadata === '') {
        let pre_pst = {
          profile: {
            profile_image: '', location: '', about: '', website: '', name: '', version: 2
          }
        };
        let pre_transaction = {
          account: this.user.account.name, json_metadata: '', posting_json_metadata: JSON.stringify(pre_pst), extensions: []
        };
        await this.$processTrxFunc('account_update2', pre_transaction);
      }
      let parsedData = JSON.parse(this.user.account.posting_json_metadata);
      parsedData.profile.location = this.textAreaLocationValue;
      parsedData.profile.about = this.textAreaDescriptionValue;
      parsedData.profile.website = this.textAreaLinkValue;
      parsedData.profile.name = this.textAreaUsernameValue;
      if (field === 'profile_image') {
        parsedData.profile.profile_image = updateData;
      }
      let pst = {
        profile: {
          profile_image: parsedData.profile.profile_image, location: parsedData.profile.location, about: parsedData.profile.about, website: parsedData.profile.website, name: parsedData.profile.name, version: 2
        }
      }
      let transaction = {
        account: this.user.account.name, json_metadata: '', posting_json_metadata: JSON.stringify(pst), extensions: []
      };
      return await this.$processTrxFunc('account_update2', transaction);
    },
    async updateProfileImage(imageUrl) {
        this.updatingField = 'profile_image';
        try {
            await this.broadcastUpdate(imageUrl, 'profile_image');
            setTimeout(() => {
                this.$store.dispatch('steemconnect/refreshUser');
                this.getAccountData();
            }, 3000);
        } catch(e) {
            console.error(e);
        } finally {
            this.updatingField = null;
            this.closeProfileImageModal();
        }
    },
    async saveFunc(field) {
      this.updatingField = field;
      try {
        await this.broadcastUpdate(null, field);
        this.$nextTick(() => {
          if (field === 'username') this.usernameEditOn = false;
          else if (field === 'description') this.descriptionEditOn = false;
          else if (field === 'link') this.linkEditOn = false;
          else if (field === 'location') this.locationEditOn = false;
        });
        setTimeout(() => {
            this.fetchUserData();
            this.getAccountData();
        }, 3000);

      } finally {
        this.updatingField = null;
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
        if (!this.$refs["p-ac-key"] || this.$refs["p-ac-key"].value == '') {
          this.error_proceeding = true;
          this.error_msg = this.$t('all_fields_required');
          return;
        }
      }
      this.votingProgress = true;
      let parentRef = this;
      if (isProxy) {
        if (!this.isKeychainLogin() && !this.isHiveauthLogin() && this.isStdLogin()) {
          hive.broadcast.accountWitnessProxy(this.$refs["p-ac-key"].value, this.user.account.name, 'actifit', function (err, result) {
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
          window.hive_keychain.requestProxy(this.user.account.name, 'actifit', (response) => {
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
          let op_name = 'account_witness_proxy';
          let cstm_params = {
            account: this.user.account.name,
            proxy: 'actifit',
          }
          let operation = [
            [op_name, cstm_params]
          ];
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
              this.$notify({
                group: 'warn',
                clean: true
              })
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
          hive.broadcast.accountWitnessVote(this.$refs["p-ac-key"].value, this.user.account.name, 'actifit', true, function (err, result) {
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
          window.hive_keychain.requestWitnessVote(this.user.account.name, 'actifit', true, (response) => {
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
          let op_name = 'account_witness_vote';
          let cstm_params = {
            account: this.user.account.name,
            witness: 'actifit',
            approve: true
          }
          let operation = [
            [op_name, cstm_params]
          ];
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
              this.$notify({
                group: 'warn',
                clean: true
              })
              if (response.cmd && response.cmd === 'sign_ack') {
                parentRef.votingProgress = false;
                parentRef.voteWitnessDisplay = false;
                parentRef.$notify({
                  group: 'success',
                  text: parentRef.$t('Witness_voted_successfully'),
                  position: 'top center'
                })
                parentRef.getAccountData();
              } else if (response.cmd && response.cmd === 'sign_nack') {
                parentRef.error_proceeding = true;
                parentRef.error_msg = parentRef.$t('Error_sending_vote');;
                parentRef.votingProgress = false;
              }
            })
            .catch(err => {
              parentRef.error_proceeding = true;
              parentRef.error_msg = parentRef.$t('Error_sending_vote');;
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
            console.log(excp);
          }
        }
        this.$store.dispatch('fetchUserTokens')
        this.$store.dispatch('fetchUserRank')
        fetch(process.env.poshVerificationUrl + this.displayUser).then(
          res => { res.json().then(json => this.setPoshVerifStatus(json)) }).catch(e => console.log(e))
        this.$forceUpdate()
      }
    },
    setProperNode() {
      this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
      let properNode = hive;
      if (this.cur_bchain == 'STEEM') {
        properNode = steem;
      } else if (this.cur_bchain == 'BLURT') {
        properNode = blurt;
      }
      return properNode;
    },
    async getAccountData() {
      let parentRef = this;
      let chainLnk = await this.setProperNode();
      this.profImgUrl = process.env.hiveImgUrl;
      if (this.cur_bchain == 'STEEM') {
        this.profImgUrl = process.env.steemImgUrl;
      }
      chainLnk.api.getAccounts([this.displayUser], function (err, result) {
        parentRef.loadingData = false;
        if (err || result.length == 0) {
          parentRef.noUserFound = true;
          parentRef.errorDisplay = parentRef.$t('user_not_found_error');
        } else {
          parentRef.userinfo = result[0];
          chainLnk.api.getFollowCount(parentRef.displayUser, function (err, result) {
            if (!err) {
              parentRef.follower_count = result.follower_count;
              parentRef.following_count = result.following_count;
              parentRef.$forceUpdate()
            }
          });
        }
      });
      this.refreshFriendStatus();
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
            await this.$processTrxFunc('custom_json', cstm_params);
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
        let latest = json[0].json_metadata;
        this.lastHeight = latest.height || '-';
        this.heightUnit = latest.heightUnit || '';
        this.lastWeight = latest.weight || '-';
        this.weightUnit = latest.weightUnit || '';
        this.lastChest = latest.chest || '-';
        this.chestUnit = latest.chestUnit || '';
        this.lastWaist = latest.waist || '-';
        this.waistUnit = latest.waistUnit || '';
        this.lastThighs = latest.thighs || '-';
        this.thighsUnit = latest.thighsUnit || '';
        this.lastBodyfat = latest.bodyfat || '-';
        this.lastUpdated = json[0].date || '-';
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
        if (this.user && this.displayUser == this.user.account.name) {
          this.poshUserData = json;
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
        res => { res.json().then(json => this.setUserSplinterCards(json)) }).catch(e => reject(e))
    },
    async setUserSplinterCards(json) {
      if (json && json.player == this.displayUser && json.cards.length > 0) {
        this.userSplinterCards = json.cards;
        for (let i = 0; i < this.userSplinterCards.length; i++) {
          let ent = this.userSplinterCards[i];
          let matchCriteria = { id: ent.card_detail_id };
          let matchEntry = _.find(this.splinterCards, matchCriteria);
          ent.rarity = matchEntry.rarity;
        }
        for (let i = 1; i < 5; i++) {
          this.splinterRarities[i] = await this.$findCardCountByRarity(this.userSplinterCards, i);
        }
      }
    }
  },
  async mounted() {
    this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    steem.api.setOptions({ url: process.env.steemApiNode });

    this.screenWidth = screen.width;
    hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);
    hive.api.setOptions({ url: process.env.hiveApiNode });
    blurt.api.setOptions({ url: process.env.blurtApiNode });
    
    this.$store.dispatch('steemconnect/login')
    await this.fetchUserData();

    if ((typeof this.$route.params !== 'undefined') && (typeof this.$route.params.username !== 'undefined')) {
      this.displayUser = this.$route.params.username.replace('@', '');

      this.$watch('userMeta', (newVal) => {
        if(newVal && newVal.profile) {
          this.textAreaLocationValue = newVal.profile.location || '';
          this.textAreaDescriptionValue = newVal.profile.about || '';
          this.textAreaLinkValue = newVal.profile.website || '';
          this.textAreaUsernameValue = newVal.profile.name || '';
        }
      }, { immediate: true });

      fetch(process.env.actiAppUrl + 'trackedMeasurements/' + this.displayUser).then(res => res.json().then(json => this.setUserMeasurements(json))).catch(e => console.log(e));
      fetch(process.env.actiAppUrl + 'trackedActivity/' + this.displayUser).then(res => res.json().then(json => this.setUserActivity(json))).catch(e => console.log(e));
      fetch(process.env.actiAppUrl + 'getRank/' + this.displayUser).then(res => res.json().then(json => this.userRank = json)).catch(e => reject(e));
      fetch(process.env.actiAppUrl + 'userRewardedPostCount/' + this.displayUser).then(res => res.json().then(json => this.rewardedPostCount = json.rewarded_post_count)).catch(e => reject(e));
      fetch(process.env.actiAppUrl + 'user/' + this.displayUser).then(res => res.json().then(json => this.userTokenCount = json.tokens)).catch(e => console.log(e));
      fetch(process.env.actiAppUrl + 'userBadges/' + this.displayUser).then(res => res.json().then(json => this.userBadges = json)).catch(e => reject(e));
      fetch(process.env.actiAppUrl + 'isoParticipant/' + this.displayUser).then(res => res.json().then(json => this.isoParticipant = json)).catch(e => reject(e));
      
      fetch(process.env.actiAppUrl + 'delegation/' + this.displayUser).then(res => res.json().then(json => this.actifitDelegator = json)).catch(e => reject(e));

      fetch(process.env.actiAppUrl + 'luckyWinner/' + this.displayUser).then(res => res.json().then(json => this.doubledupWinner = json)).catch(e => reject(e));
      fetch(process.env.actiAppUrl + 'charityDonor/' + this.displayUser).then(res => res.json().then(json => this.charityDonor = json)).catch(e => reject(e));
      fetch(process.env.actiAppUrl + 'is_banned/' + this.displayUser).then(res => res.json().then(json => this.account_banned = json)).catch(e => reject(e));
      fetch(process.env.actiAppUrl + 'availableTipBalance?user=' + this.displayUser).then(res => res.json().then(json => this.setTipBalance(json))).catch(e => reject(e));
      fetch(process.env.poshVerificationUrl + this.displayUser).then(res => res.json().then(json => this.setPoshVerifStatus(json))).catch(e => reject(e));
      fetch(process.env.threeSpeakApiVidCount.replace('_USERNAME_', this.displayUser)).then(res => res.json().then(json => this.set3SVideoCount(json))).catch(e => reject(e));
      fetch(process.env.splinter_api_all_cards).then(res => res.json().then(json => this.setSplinterCards(json))).catch(e => reject(e));

      if (badActors.includes(this.displayUser)){
        this.badActorWarning = true;
      }
      try {
        let bal = await hsc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFIT' });
        if (bal) this.userAFITHETokenCount = bal.balance;
        bal = await hsc.findOne('tokens', 'balances', { account: this.displayUser, symbol: 'AFITX' });
        if (bal) this.userAFITXHETokenCount = bal.balance;
      } catch (err) {
        console.log(err);
      }
      this.getAccountData();
    } else {
      this.errorDisplay = this.$t('user_not_found_error');
    }
  }
}
</script>
<style>
:root {
  /* --- LIGHT MODE --- */
  --brand-color: #dc3545;
  --brand-secondary-color: #d9534f;
  --text-color-primary: #333;
  --text-color-secondary: #555;
  --text-color-light: #582424;
  --text-color-inverted: white;
  --white-color: #fff;
  --border-color: #fddace;
  --header-gradient: linear-gradient(to right, #ffaf7b, #fcae3c);
  --sidebar-gradient: linear-gradient(to bottom, #ffaf7b, #ffffff);
  --fitness-card-gradient: linear-gradient(to top, #28a745, #ffc107);
  --community-item-gradient: linear-gradient(to right, #ffc107, #ffe086);
  --badge-item-gradient: linear-gradient(to right, #28a745, #ffc107);
  --tabs-container-bg: #f8f9fa;
  --tabs-container-border: #fcae3c;
  --tab-nav-bg: #e9ecef;
  --tab-nav-text: #6c757d;
  --tab-content-bg: #ffaf7b55;
  --tab-active-bg: #FFEAE4;
  --about-tab-bg: #FFEAE4;
  --wallet-action-box-bg: #fff9f0;
  --quick-link-bg: #fff;
  --quick-link-shadow: rgba(0,0,0,0.05);
  --quick-link-shadow-hover: rgba(0,0,0,0.1);
  --edit-pencil-color: white; 
  --box-shadow-lifted: 0 4px 12px rgba(0, 0, 0, 0.1);
}


html.dark-mode {
  /* New Gold/Ochre Palette */
  --dark-gold-primary: #ad8a24;
  --dark-gold-secondary: #4d4022;
  --dark-gold-gradient-end: #3a2e1d;
  --dark-background: #212121;
  --dark-background-lighter: #2c2c2c;

  --brand-color: #dc3545;
  --brand-secondary-color: #d9534f;
  --text-color-primary: #e0e0e0;
  --text-color-secondary: #bdbdbd;
  --text-color-light: #ad8a24;
  --text-color-inverted: #121212;
  --white-color: #1e1e1e;
  --border-color: var(--dark-gold-primary);
  --header-gradient: linear-gradient(to right, var(--dark-gold-primary), var(--dark-gold-gradient-end));
  --sidebar-gradient: linear-gradient(to bottom, var(--dark-gold-primary), var(--dark-background));
  --fitness-card-gradient: linear-gradient(to top, #1c6b2e, var(--dark-gold-primary));
  --community-item-gradient: var(--header-gradient);
  --badge-item-gradient: linear-gradient(to right, #1c6b2e, var(--dark-gold-primary));
  --tabs-container-bg: var(--dark-background);
  --tabs-container-border: var(--dark-gold-primary);
  --tab-nav-bg: var(--dark-background-lighter);
  --tab-nav-text: #a0a0a0;
  --tab-content-bg: rgba(173, 138, 36, 0.1);
  --tab-active-bg: var(--dark-gold-secondary);
  --about-tab-bg: var(--dark-gold-secondary);
  --wallet-action-box-bg: #3a2e21;
  --quick-link-bg: var(--dark-background-lighter);
  --quick-link-shadow: rgba(255,255,255,0.05);
  --quick-link-shadow-hover: rgba(255,255,255,0.1);
  --edit-pencil-color: black;
  --box-shadow-lifted: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.profile-header {
    background: var(--header-gradient);
    padding: 20px;
    border-radius: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    box-shadow: var(--box-shadow-lifted);
}
.user-info-header .username { 
    font-size: 1.5rem; 
    font-weight: bold;
    color: var(--brand-color); 
}
.user-info-header .join-date { 
    color: var(--text-color-light); 
}
html.dark-mode .user-info-header .join-date {
  color: var(--text-color-inverted);
}

.user-info-header .user-rank-badge {
    background-color: var(--brand-color);
    color: white; 
    padding: 4px 12px;
    border-radius: 1rem;
    font-weight: bold;
    font-size: 1rem;
    vertical-align: middle;
    line-height: 1.5;
}

.edit-profile-btn a {
  background-color: var(--brand-color);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: opacity 0.2s;
}

.edit-profile-btn a:hover {
  opacity: 0.85;
}

.edit-profile-btn a i {
  color: var(--edit-pencil-color);
  font-size: 1rem;
}

.user-avatar { 
    background-repeat: no-repeat; 
    background-size: cover; 
    background-position: center; 
    position: relative; 
}
.large-avatar { 
    width: 150px; 
    height: 150px; 
    border-radius: 50%; 
    border: 4px solid var(--white-color); 
    flex-shrink: 0; 
}
.user-info-header { margin-left: 20px; }
.avatar-edit-button {
  position: absolute; 
  bottom: 5px; 
  right: 5px; 
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}
.avatar-edit-button .btn { padding: 0.3rem 0.5rem; line-height: 1; }

.avatar-edit-button .fa-edit,
.about-item-value .btn-danger .fa-edit {
  color: var(--edit-pencil-color);
}

.friend-actions { text-align: right; margin-left: auto; }

.profile-body { 
    display: flex; 
    margin-top: 20px; 
    gap: 20px; 
    margin-bottom: 2rem;
    align-items: flex-start;
}

/* Main Content & Tabs */
.main-content-tabs { 
    flex-grow: 1; 
    background-color: var(--tabs-container-bg); 
    border-radius: 15px; 
    overflow: hidden;
    border: 2px solid var(--tabs-container-border);
    box-shadow: var(--box-shadow-lifted);
}
.tab-nav { 
    display: flex; 
    background-color: var(--tab-nav-bg); 
    flex-wrap: wrap; 
}
.tab-nav button { 
    flex-grow: 1; 
    padding: 15px; 
    border: none; 
    background-color: transparent; 
    font-size: 1rem; 
    font-weight: 600; 
    color: var(--tab-nav-text); 
    cursor: pointer; 
    transition: background-color 0.3s, color 0.3s; 
}
.tab-nav button.active { 
    background-color: var(--tab-active-bg); 
    color: var(--brand-secondary-color); 
}
.tab-content {
    background-color: var(--tab-content-bg);
    padding: 15px;
}

/* About Tab Layout */
.about-tab {
    background-color: var(--about-tab-bg); 
    border-radius: 10px;
    padding: 10px;
    box-shadow: var(--box-shadow-lifted);
}
.about-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 10px;
    border-bottom: 1px solid var(--border-color);
    gap: 15px;
}
.about-item:last-child {
    border-bottom: none;
}
.about-item-label { 
    font-weight: 500; 
    color: var(--text-color-primary); 
    flex-shrink: 0; 
    white-space: nowrap; 
}
.about-item-label i { color: var(--brand-secondary-color); }

.about-item-value {
    color: var(--text-color-secondary);
    display: flex;
    align-items: center;
    flex-grow: 1;
    min-width: 0; 
    justify-content: flex-end;
}
.about-item-text {
    flex: 1; 
    min-width: 0; 
    text-align: right;
    overflow-wrap: break-word;
    word-break: break-all;
}
.about-item-edit {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: flex-end;
}
.about-item-edit textarea {
    flex-grow: 1;
    margin-right: 8px;
    background-color: var(--white-color);
    color: var(--text-color-primary);
    border: 1px solid var(--border-color);
    border-radius: 0.25rem;
    padding: 0.375rem 0.75rem;
}

/* Fitness Tab */
.fitness-tab-container { display: flex; flex-direction: column; gap: 15px; }
.fitness-section-grid-activity { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(200px, 300px)); 
    justify-content: center; 
    gap: 15px; 
}
.fitness-section-grid-measurements { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
.fitness-action-btn-container { text-align: center; }
.fitness-card { 
    background: var(--fitness-card-gradient); 
    border-radius: 15px; 
    color: white; 
    padding: 15px; 
    text-align: center; 
    font-weight: bold; 
    display: flex; 
    flex-direction: column; 
    justify-content: space-between; 
    align-items: center; 
}
.fitness-card img { height: 50px; margin-bottom: 10px; flex-shrink: 0; }
.activity-small-logo { height: 25px !important; }
.fitness-card .value { font-size: 1.2rem; margin-top: 5px; }

/* Community Tab */
.community-tab { display: flex; flex-direction: column; gap: 15px; }
.community-item { padding: 15px; border-radius: 10px; background: var(--community-item-gradient); border: 1px solid var(--brand-color); color: var(--text-color-primary); }
.community-item-content { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; }
.community-item-content a:not(.btn) { 
    color: var(--text-color-primary);
    font-weight: 500; 
}

/* Wallet Tab */
.wallet-tab { display: flex; flex-direction: column; gap: 15px; color: var(--text-color-primary); }
.wallet-card {
    background: var(--community-item-gradient);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid var(--brand-color);
}
.wallet-action-box {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: .5rem;
    background-color: var(--wallet-action-box-bg);
}
html.dark-mode .text-dark {
    color: var(--text-color-primary) !important;
}

/* Badges Tab */
.badges-tab { display: flex; flex-direction: column; gap: 15px; }
.badge-list-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 10px; background: var(--badge-item-gradient); color: white; }
.badge-image-container .badge-img { width: 100px; height: 100px; }
.badge-img-small { width: 75px; height: 75px; }
.badge-unclaimed { opacity: 0.3; filter: grayscale(1); }
.badge-details { flex-grow: 1; }
.badge-details .badge-title { font-weight: bold; font-size: 1.2rem; }
.badge-status-claimed { color: #c3e6cb; }
.badge-status-missed { font-style: italic; opacity: 0.8; }

.wallet-balances-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
}
.balance-card {
    background-color: var(--wallet-action-box-bg);
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    justify-content: center;
}
html.dark-mode .balance-card {
    border: 1px solid var(--dark-gold-primary);
    box-shadow: none;
}
.balance-card-header {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    margin-bottom: 10px;
    color: var(--text-color-secondary);
}
.balance-card-header .token-logo {
    margin-right: 8px;
}
.balance-card-value {
    font-size: 1.75rem;
    font-weight: bold;
    color: var(--brand-color);
    line-height: 1.2;
    word-break: break-all;
}
.balance-card-subtext {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    opacity: 0.7;
    margin-top: 4px;
}
.interactive-prompt {
  background-color: var(--wallet-action-box-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color-primary);
  padding: 1rem;
  border-radius: .5rem;
  text-align: center;
}
html.dark-mode .interactive-prompt {
  border-color: var(--dark-gold-primary);
}
.tip-card .fa-info-circle {
    cursor: pointer;
}


/* Sidebar */
.quick-links-sidebar {
    flex: 0 0 250px; 
    border-radius: 15px; 
    padding: 20px;
    background: var(--sidebar-gradient);
    align-self: flex-start;
    box-shadow: var(--box-shadow-lifted);
}
.quick-links-title { color: var(--brand-color); margin-bottom: 15px; }
.quick-link-item { 
    display: flex; 
    align-items: center; 
    background-color: var(--quick-link-bg); 
    color: var(--brand-secondary-color); 
    padding: 12px 15px; 
    border-radius: 10px; 
    margin-bottom: 10px; 
    font-weight: 500; 
    text-decoration: none; 
    box-shadow: 0 2px 4px var(--quick-link-shadow); 
    transition: transform 0.2s, box-shadow 0.2s; 
}
.quick-link-item:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 4px 8px var(--quick-link-shadow-hover); 
    color: var(--brand-secondary-color); 
}
.quick-link-item i { width: 20px; text-align: center; }


/* General & Utility */
.btn-danger { background-color: var(--brand-color); border-color: var(--brand-color); }
.token-logo { width: 20px; height: 20px; vertical-align: middle; }


/* --- Media Queries --- */
@media (max-width: 992px) {
  .profile-body {
    flex-direction: column; 
  }
  .quick-links-sidebar {
    flex-basis: auto;
    width: 100%;
  }
}
@media (max-width: 768px) {
    .community-item-content { flex-direction: column; gap: 10px; text-align: center;}
    .community-item a.btn { width: 100%; text-align: center; }
    .profile-header { justify-content: center; text-align: center; }
    .user-info-header { margin-left: 0; margin-top: 15px; }
    .user-info-header .d-flex { justify-content: center; }
}
</style>