<template>
  <div>
    <NavbarBrand />
    <div v-if="loadingData" class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center">
        <i class="fas fa-spin fa-spinner text-brand"></i>
      </div>
    </div>
    <!-- This is the main container for the new profile layout -->
    <div v-else-if="errorDisplay == ''" class="container pt-5 mt-5 pb-5 col-lg-10 col-md-12">
      <div class="alert alert-danger" role="alert" v-if="badActorWarning">
        <h4 class="alert-heading">Warning!</h4>
        <p>There are reports that this account is a bad actor. Please exercise caution.</p>
      </div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="d-flex align-items-center flex-grow-1">
          <div class="user-avatar large-avatar"
            :style="'background-image: url(' + (userMeta && userMeta.profile && userMeta.profile.profile_image ? userMeta.profile.profile_image : profImgUrl + '/u/' + displayUser + '/avatar') + ')'">
             <span v-if="editOn" class="avatar-edit-button">
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
            </div>
            <div class="join-date">Joined on {{ pureDate(userinfo.created) }}</div>
          </div>
        </div>

        <!-- Friendship action buttons -->
        <div v-if="user && !isOwnAccount() && !account_banned" class="friend-actions">
            <span :title="$t('you_are_friends_username').replace('_USERNAME_', displayUser)" v-if="isFriend()">
                <button class="btn btn-sm btn-warning" @click="dropFriend"><i class="fas fa-user-times mr-1"></i> Unfriend</button>
            </span>
            <span :title="$t('friendship_pending_approval')" v-else-if="isPendingFriend()">
                <button v-if="isPendingFriend().direction == 0" class="btn btn-sm btn-secondary" @click="cancelFriendRequest">Request Sent</button>
                <button v-else-if="isPendingFriend().direction == 1" class="btn btn-sm btn-info" @click="acceptFriend">Accept Request</button>
            </span>
            <span :title="$t('add_username_friend').replace('_USERNAME_', displayUser)" v-else>
                <button class="btn btn-sm btn-success" @click="addFriend"><i class="fas fa-user-plus mr-1"></i> Add Friend</button>
            </span>
            <i v-if="friendshipLoader" class="fas fa-spinner fa-spin ml-2"></i>
            <div v-if="addFriendError" v-html="addFriendError" class="text-danger small mt-1"></div>
        </div>

        <span v-if="user && user.account.name === displayUser && !account_banned" class="edit-profile-btn">
          <a class="p-2" @click="editOn ? turnEditOff() : turnEditOn()">
            <i class="fas fa-edit"></i>
          </a>
        </span>
      </div>

      <!-- Main Body Layout -->
      <div class="profile-body">
        <!-- Main Content: Tabs -->
        <div class="main-content-tabs">
          <!-- Tab Navigation -->
          <div class="tab-nav">
            <button @click="activeTab = 'about'" :class="{ active: activeTab === 'about' }">About</button>
            <button @click="activeTab = 'fitness'" :class="{ active: activeTab === 'fitness' }">Fitness</button>
            <button @click="activeTab = 'community'" :class="{ active: activeTab === 'community' }">Community</button>
            <button @click="activeTab = 'wallet'" :class="{ active: activeTab === 'wallet' }">Wallet</button>
            <button @click="activeTab = 'badges'" :class="{ active: activeTab === 'badges' }">Badges</button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- About Tab -->
            <div v-if="activeTab === 'about'" class="about-tab">
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-user-circle mr-2"></i> Display Name</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'username'" class="d-flex justify-content-center align-items-center h-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <span v-else>
                        <span v-if="!usernameEditOn">{{ textAreaUsernameValue || 'Not Set' }}</span>
                        <span v-else><textarea v-model="textAreaUsernameValue"></textarea><a class="btn btn-sm btn-success p-1" @click="saveFunc('username')"><i class="fa-solid fa-check"></i></a><a class="btn btn-sm btn-danger p-1" @click="turnUsernameEditOff"><i class="fa-solid fa-xmark"></i></a></span>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !usernameEditOn" @click="turnUsernameEditOn"><i class="fas fa-edit"></i></a>
                     </span>
                  </div>
               </div>
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-map-marker-alt mr-2"></i> Location</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'location'" class="d-flex justify-content-center align-items-center h-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <span v-else>
                        <span v-if="!locationEditOn">{{ textAreaLocationValue || 'Not Set' }}</span>
                        <span v-else><textarea v-model="textAreaLocationValue"></textarea><a class="btn btn-sm btn-success p-1" @click="saveFunc('location')"><i class="fa-solid fa-check"></i></a><a class="btn btn-sm btn-danger p-1" @click="turnLocationEditOff"><i class="fa-solid fa-xmark"></i></a></span>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !locationEditOn" @click="turnLocationEditOn"><i class="fas fa-edit"></i></a>
                     </span>
                  </div>
               </div>
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-info-circle mr-2"></i> Description</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'description'" class="d-flex justify-content-center align-items-center h-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <span v-else>
                        <span v-if="!descriptionEditOn">{{ textAreaDescriptionValue || 'Not Set' }}</span>
                        <span v-else><textarea v-model="textAreaDescriptionValue"></textarea><a class="btn btn-sm btn-success p-1" @click="saveFunc('description')"><i class="fa-solid fa-check"></i></a><a class="btn btn-sm btn-danger p-1" @click="turnDescriptionEditOff"><i class="fa-solid fa-xmark"></i></a></span>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !descriptionEditOn" @click="turnDescriptionEditOn"><i class="fas fa-edit"></i></a>
                     </span>
                  </div>
               </div>
               <div class="about-item">
                  <div class="about-item-label"><i class="fas fa-link mr-2"></i> Website</div>
                  <div class="about-item-value">
                     <div v-if="updatingField === 'link'" class="d-flex justify-content-center align-items-center h-100"><i class="fas fa-spinner fa-spin text-brand"></i></div>
                     <span v-else>
                        <a v-if="!linkEditOn && userMeta && userMeta.profile && userMeta.profile.website" :href="userMeta.profile.website" target="_blank">{{ textAreaLinkValue }}</a>
                        <span v-if="!linkEditOn && !(userMeta && userMeta.profile && userMeta.profile.website)">{{ textAreaLinkValue || 'Not Set' }}</span>
                        <span v-else><textarea v-model="textAreaLinkValue"></textarea><a class="btn btn-sm btn-success p-1" @click="saveFunc('link')"><i class="fa-solid fa-check"></i></a><a class="btn btn-sm btn-danger p-1" @click="turnLinkEditOff"><i class="fa-solid fa-xmark"></i></a></span>
                        <a class="btn btn-sm btn-danger p-1 ml-2" v-if="editOn && !linkEditOn" @click="turnLinkEditOn"><i class="fas fa-edit"></i></a>
                     </span>
                  </div>
               </div>
            </div>

            <!-- Fitness Tab -->
            <div v-if="activeTab === 'fitness'" class="fitness-tab-container">
                <div class="fitness-section-grid-measurements">
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/height.png"><div>Height</div><div class="value">{{ lastHeight + ' ' + heightUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/bodyfat.png"><div>Body Fat</div><div class="value">{{ lastBodyfat + ' % ' }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/waist.png"><div>Waist</div><div class="value">{{ lastWaist + ' ' + waistUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/weight.png"><div>Weight</div><div class="value">{{ lastWeight + ' ' + weightUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/chest.png"><div>Chest</div><div class="value">{{ lastChest + ' ' + chestUnit }}</div></div>
                    <div class="fitness-card"><img src="https://usermedia.actifit.io/thighs.png"><div>Thighs</div><div class="value">{{ lastThighs + ' ' + thighsUnit }}</div></div>
                </div>
                <div class="fitness-action-btn-container">
                    <a href="#" data-toggle="modal" class="btn btn-danger" data-target="#measureChartModal" v-if="isFriend() || isOwnAccount()">Stats Chart</a>
                    <a href="#" class="btn btn-danger" v-on:click="displayAddFriendStats = !displayAddFriendStats" v-else-if="user">Stats Chart</a>
                    <a href="#" class="btn btn-danger" v-on:click="displayLoginStats = !displayLoginStats" v-else>Stats Chart</a>
                </div>
                <div class="fitness-section-grid-activity">
                    <div class="fitness-card activity-card">
                        <div>Latest Activity Count</div>
                        <img src="/img/actifit_logo.png" class="activity-small-logo">
                        <div class="value">{{ lastActivityCount }}</div>
                    </div>
                    <div class="fitness-card activity-card">
                        <div>Latest Activity Date</div>
                        <div class="value">{{ lastActivityDate }}</div>
                    </div>
                </div>
                <div class="fitness-action-btn-container">
                    <a href="#" data-toggle="modal" class="btn btn-danger" data-target="#activityChartModal" v-if="isFriend() || isOwnAccount()">Activity Chart</a>
                    <a href="#" class="btn btn-danger" v-on:click="displayAddFriendActivity = !displayAddFriendActivity" v-else-if="user">Activity Chart</a>
                    <a href="#" class="btn btn-danger" v-on:click="displayLoginActivity = !displayLoginActivity" v-else>Activity Chart</a>
                </div>
            </div>

            <!-- Community Tab -->
            <div v-if="activeTab === 'community'" class="community-tab">
              <div class="community-item">
                <div class="community-item-content">
                  <img src="/img/poshlogo.png" class="mr-3" style="width: 50px;">
                  <div class="flex-grow-1">
                    <span v-if="poshVerified">
                      <i class="fas fa-check text-success" style="font-size:large"></i> POSH Connected: 
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
                   <i class="fa-solid fa-gamepad mr-2"></i>{{ $t('Splinterlands') }}
                   <img src="https://d36mxiodymuqjm.cloudfront.net/website/icons/img_icon_splinterlands.svg" class="mr-2 ml-2" style="width: 20px" :alt="$t('Splinterlands')">
                  <a href="https://splinterlands.com/" class="btn btn-danger m-2">{{ $t('Play_splinterlands') }}</a>
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
            
            <!-- Wallet Tab -->
            <div v-if="activeTab === 'wallet'" class="wallet-tab">
               <div class="wallet-card">
                <div class="d-flex justify-content-between align-items-center flex-wrap">
                  <button class="btn btn-danger m-2" v-on:click="voteWitness">{{ $t('Vote_Now_Actifit_Witness') }}</button>
                  <a class="btn btn-danger m-2" href="/wallet" target="_blank">{{ $t('Delegate_Now_Actifit') }}</a>
                </div>
                <div v-if="voteWitnessDisplay" class="wallet-action-box">
                  <div v-if="!isKeychainLogin() && isStdLogin() && !isHiveauthLogin()" class="form-group">
                    <label for="p-ac-key">{{ $t('Active_Key') }} *</label>
                    <input type="password" id="p-ac-key" name="p-ac-key" ref="p-ac-key" class="form-control">
                  </div>
                  <div class="text-center">
                    <button class="btn btn-danger m-1" v-on:click="proceedWitnessVote()">{{ $t('Vote') }}</button>
                    <button class="btn btn-danger m-1" v-on:click="proceedWitnessVote(1)">{{ $t('Set_proxy') }}</button>
                    <button class="btn btn-danger m-1" v-on:click="voteWitness">{{ $t('Cancel') }}</button>
                  </div>
                  <div class="text-center mt-2"><i v-if="votingProgress" class="fas fa-spin fa-spinner"></i></div>
                  <div class="alert alert-danger text-center mt-2" v-if="error_proceeding">
                    {{ this.error_msg }}
                  </div>
                </div>
              </div>
              <div class="wallet-card">
                <div class="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                      <img src="/img/actifit_logo.png" class="mr-2 token-logo">{{ numberFormat(userTokenCount, 3) }} {{ $t('AFIT_Tokens') }}<br />
                      <img src="/img/actifit_logo.png" class="mr-2 token-logo">{{ displayAFITHEBal }} {{ $t('AFIT_HE_Tokens') }}<br />
                      <img src="/img/actifit_logo.png" class="mr-2 token-logo">{{ displayAFITTipBal }} {{ $t('AFIT_Tip_Tokens') }}
                      <button class="btn btn-danger mt-1" v-on:click="tipUser">{{ $t('Send_tip') }}</button>
                    </div>
                    <div>
                      <img src="/img/AFITX.png" class="mr-2 token-logo">{{ displayAFITXHEBal }} {{ $t('AFITX_HE_Tokens') }}
                    </div>
                </div>
                <div v-if="proceedTip" class="wallet-action-box">
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
               <h3 class="text-brand text-center"><i class="fas fa-trophy"></i> {{ $t('Badges') }}</h3>
                <div class="badge-list-item">
                  <div class="badge-image-container">
                    <img class="badge-img" :class="{'badge-unclaimed': !userHasBadge(iso_badge)}" src="/img/badges/actifit_iso_badge.png">
                  </div>
                  <div class="badge-details">
                    <div class="badge-title">{{ $t('iso_badge_title') }}</div>
                    <div v-if="userHasBadge(iso_badge)" class="badge-status-claimed"><i class="fas fa-check"></i> Claimed</div>
                    <button v-if="badgeClaimable(iso_badge)" @click="claimBadge(iso_badge)" class="btn btn-danger btn-sm">Claim</button>
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
                              <button v-if="badgeClaimable(rew_activity_badge + level[1])" @click="claimBadge(rew_activity_badge + level[1])" class="btn btn-danger btn-sm d-block mx-auto mt-1">Claim</button>
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
                    <div v-if="userHasBadge(doubledup_badge)" class="badge-status-claimed"><i class="fas fa-check"></i> Claimed</div>
                    <button v-if="badgeClaimable(doubledup_badge)" @click="claimBadge(doubledup_badge)" class="btn btn-danger btn-sm">Claim</button>
                    <div v-else-if="!userHasBadge(doubledup_badge) && this.doubledupWinner.length == 0" class="badge-status-missed">{{ $t('not_lucky_yet') }}</div>
                  </div>
                </div>
                 <div class="badge-list-item">
                  <div class="badge-image-container">
                    <img class="badge-img" :class="{'badge-unclaimed': !userHasBadge(charity_badge)}" src="/img/badges/actifit_charity_badge.png">
                  </div>
                  <div class="badge-details">
                    <div class="badge-title">{{ $t('charity_badge_title') }}</div>
                     <div v-if="userHasBadge(charity_badge)" class="badge-status-claimed"><i class="fas fa-check"></i> Claimed</div>
                    <button v-if="badgeClaimable(charity_badge)" @click="claimBadge(charity_badge)" class="btn btn-danger btn-sm">Claim</button>
                  </div>
                </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Quick Links -->
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
            <span>{{ $t('wallet.wallet') }}</span>
          </a>
        </div>
      </div>
    </div>
    <div v-else class="container pt-5 mt-5 pb-5">
      <div class="mb-3 text-center">
        <h4>{{ errorDisplay }}</h4>
      </div>
    </div>
    
    <!-- MODALS AND FOOTER (unchanged) -->
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
// The script remains the same as it already contains all necessary logic and data.
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
    
    await this.$store.dispatch('steemconnect/login')
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
/* Added/Modified Styles for this revision are at the top */
.profile-header {
    background: linear-gradient(to right, #ffaf7b, #fcae3c);
}
.user-info-header .username { 
    font-size: 1.5rem; /* Corrected font size */
    font-weight: bold;
    color: #dc3545; 
}
.user-info-header .join-date { color: #582424; }
.user-info-header .user-rank-badge {
    background-color: #dc3545;
    color: white;
    padding: 4px 12px;
    border-radius: 1rem;
    font-weight: bold;
    font-size: 1rem;
    vertical-align: middle;
    line-height: 1.5;
}
.edit-profile-btn a { color: #dc3545 !important; }
.tab-content {
    background-color: #ffaf7b55;
}
.main-content-tabs {
    border: 2px solid #fcae3c;
}
.wallet-card {
    background: linear-gradient(to right, #ffc107, #ffe086);
    padding: 15px;
    border-radius: 10px;
    border: 1px solid #dc3545;
}
.wallet-action-box {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: .5rem;
    background-color: #fff9f0;
}
.about-tab {
    background-color: #FFEAE4; /* New color from user image */
    border-radius: 10px;
    padding: 10px;
}
.about-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 10px;
    border-bottom: 1px solid #fddace;
}
.about-item:last-child {
    border-bottom: none;
}


/* --- Previous changes --- */
.friend-actions { text-align: right; margin-left: 20px; }
.fitness-tab-container { display: flex; flex-direction: column; gap: 15px; }
.fitness-section-grid-activity { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
.fitness-section-grid-measurements { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
.fitness-action-btn-container { text-align: center; }
.wallet-tab, .community-tab { display: flex; flex-direction: column; gap: 15px; }
.quick-links-sidebar {
    flex: 0 0 250px; border-radius: 15px; padding: 20px;
    background: linear-gradient(to bottom, #ffaf7b, #ffffff);
}
.quick-links-title { color: #dc3545; margin-bottom: 15px; }

/* Original styles from your new layout */
.token-logo { width: 20px; height: 20px; vertical-align: middle; }
.user-avatar { background-repeat: no-repeat; background-size: cover; background-position: center; position: relative; }
.profile-header { padding: 20px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; }
.user-info-header { margin-left: 20px; }
.large-avatar { width: 150px; height: 150px; border-radius: 50%; border: 4px solid white; }
.edit-profile-btn { font-size: 1.5rem; cursor: pointer; }
.avatar-edit-button {
  position: absolute; bottom: 5px; right: 5px; background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}
.avatar-edit-button .btn { padding: 0.3rem 0.5rem; line-height: 1; }
.profile-body { display: flex; margin-top: 20px; gap: 20px; }
.quick-link-item { display: flex; align-items: center; background-color: white; color: #d9534f; padding: 12px 15px; border-radius: 10px; margin-bottom: 10px; font-weight: 500; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; }
.quick-link-item:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); color: #d9534f; }
.quick-link-item i { width: 20px; text-align: center; }
.main-content-tabs { flex-grow: 1; background-color: #f8f9fa; border-radius: 15px; overflow: hidden; }
.tab-nav { display: flex; background-color: #e9ecef; flex-wrap: wrap; }
.tab-nav button { flex-grow: 1; padding: 15px; border: none; background-color: transparent; font-size: 1rem; font-weight: 600; color: #6c757d; cursor: pointer; transition: background-color 0.3s, color 0.3s; }
.tab-nav button.active { background-color: #FFEAE4; color: #d9534f; }
.about-item-label { font-weight: 500; color: #333; }
.about-item-label i { color: #d9534f; }
.about-item-value { color: #555; display: flex; align-items: center; }
.about-item-value textarea { width: 200px; margin-right: 5px; }
.fitness-card { background: linear-gradient(to top, #28a745, #ffc107); border-radius: 15px; color: white; padding: 15px; text-align: center; font-weight: bold; display: flex; flex-direction: column; justify-content: space-between; align-items: center; }
.fitness-card img { height: 50px; margin-bottom: 10px; flex-shrink: 0; }
.activity-small-logo { height: 25px !important; }
.fitness-card .value { font-size: 1.2rem; margin-top: 5px; }
.btn-danger { background-color: #dc3545; border-color: #dc3545; }
.community-item { padding: 15px; border-radius: 10px; background: linear-gradient(to right, #ffc107, #ffe086); border: 1px solid #dc3545; }
.community-item-content { display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; }
.community-item-content a { color: #333; font-weight: 500; }
.badges-tab { display: flex; flex-direction: column; gap: 15px; }
.badge-list-item { display: flex; align-items: center; gap: 15px; padding: 15px; border-radius: 10px; background: linear-gradient(to right, #28a745, #ffc107); color: white; }
.badge-image-container .badge-img { width: 100px; height: 100px; }
.badge-img-small { width: 75px; height: 75px; }
.badge-unclaimed { opacity: 0.3; filter: grayscale(1); }
.badge-details { flex-grow: 1; }
.badge-details .badge-title { font-weight: bold; font-size: 1.2rem; }
.badge-status-claimed { color: #c3e6cb; }
.badge-status-missed { font-style: italic; opacity: 0.8; }
@media (max-width: 992px) {
  .profile-body { flex-direction: column-reverse; }
}
@media (max-width: 768px) {
    .community-item-content { flex-direction: column; gap: 10px; text-align: center;}
    .community-item a.btn { width: 100%; text-align: center; }
}
</style>