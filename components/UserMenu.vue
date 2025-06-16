<template>
  <div class="user-menu-container  align-items-center"> <!--ml-auto d-flex position-absolute-->

    <ul class="navbar-nav mr-auto user-menu flex-row">
      <li class="nav-item mr-2 btn btn-brand nav-item-border p-0 search-li">
        <div style="display:inline-flex">
          <AutocompleteUsernameInput id="search-user" name="search-user" ref="search-user" :customClass="computedCustomClass" :inputClass="computedInputClass" :placeHolderVal="$t('search_user')" :enableRedirect="true" />
        </div>
      </li>
      <li class="nav-item" v-if="!user">
        <a :href="'/signup'">{{ $t('Signup_Link') }}</a> | <a href="#" data-toggle="modal" data-target="#loginModal"
          @click="showModalFunc">{{ $t('Login') }}</a>
      </li>


      <!--<li class="nav-item mr-2" v-if="user" >
        <span class="navbar-text py-0 text-brand" >{{ $t('Rank') }}&nbsp;<br><b>{{ displayCoreUserRank }} <span class="increased-rank" v-if="this.userRankObj && this.userRankObj.afitx_rank">{{  displayIncreasedUserRank }}</span></b></span>
      </li>
      <li class="nav-item mr-2" v-if="user">
        <span class="navbar-text py-0">{{ $t('Balance') }}<br><b>{{ formattedUserTokens }}</b></span>
      </li>-->
      <li class="nav-item mr-2" @click="toggleDarkMode" :title="$t('toggle_dark_mode')" v-if="user && !hideComponent">
        <span class="user-avatar group-class">
          <i v-if="$store.state.darkMode" class="fa-solid fa-sun p-2 text-brand"></i>
          <i v-else class="fa-solid fa-moon text-brand p-2"></i>
        </span>
      </li>
      <li class="nav-item mr-2" v-if="user && !hideComponent">
        <!--<button @click="toggleWidget">Toggle Widget</button>-->
        <StingChat :user="this.user" />
      </li>
      <li class="nav-item mr-2" v-if="user">
        <span class="user-avatar-notif-menu group-class notification-class text-brand"
          v-if="activeNotificationsLen > 0">{{ notificationsNotice }}</span>
        <span class="user-avatar group-class" v-if="activeNotificationsLen > 0">
          <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown"
            :title="$t('Notifications_popup').replace('_count_', notificationsNotice)">
            <i class="fas fa-bell p-2 text-brand"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-right notif-container">
            <div class="text-right m-2">
              <a href='/notifications' class="btn btn-brand border">{{ $t('View_all') }}</a>
              <a href='#' class="btn btn-brand border" v-on:click="markAllRead()">{{ $t('Clear_all') }}</a>
            </div>
            <div class="row p-2 border-top" v-for="(notif, index) in activeNotifications" :key="index" :notif="notif">
               <div class="col-md-10 notif-clickable" @click="handleNotificationClick(notif)">
                  <i class="fas fa-user-plus p-1"
                    v-if="notif.type == 'friendship' || notif.type == 'friendship_request'"></i>
                  <i class="fas fa-user-friends p-1" v-else-if="notif.type == 'friendship_acceptance'"></i>
                  <span>{{ notif.details }}</span>
                  <span v-if="notif.action_taker" class="user-avatar user-avatar-medium mr-1 mb-3"
                    :style="'background-image: url(' + profImgUrl + '/u/' + notif.action_taker + '/avatar)'"></span>
                </div>
              <span>
                <a href="#" v-on:click="markRead(notif)" class="col-md-2" :title="$t('mark_as_read')"><i
                    class="fas fa-check-square"></i></a>
              </span>
            </div>
          </div>

        </span>
        <span class="user-avatar group-class" v-else>
          <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown">
            <i class="fas fa-bell p-2"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-right">
            <div class="text-right m-2">
              <a href='/notifications' class="btn btn-brand border">{{ $t('View_all') }}</a>
              <a href='#' class="btn btn-brand border" v-on:click="markAllRead()">{{ $t('Clear_all') }}</a>
            </div>
            <div class="p-2">{{ $t('no_notifications') }}</div>
          </div>
        </span>
      </li>
      <li class="nav-item mr-2" v-if="user">
        <a href="#" @click.prevent="$router.push('/friends')" :title="$t('friends')"><span
            class="user-avatar group-class text-brand"><i class="fas fa-user-friends p-2"></i></span></a>
      </li>
      <li class="nav-item dropdown" v-if="user">
        <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown">
          <div class="user-avatar group-class"
            :style="'background-image: url(' + profImgUrl + '/u/' + user.account.name + '/avatar)'"></div>
        </a>
        <div class="dropdown-menu dropdown-menu-right user-dropdown">
          <div class="dropdown-header user-info-sticky"><a class="dropdown-item" href="#"
              @click.prevent="$router.push('/' + user.account.name)"><i
                class="fa-solid fa-user text-brand"></i>&nbsp;@{{ user.account.name }}</a></div>
          <div class="dropdown-scrollable">
          <a class="dropdown-item text-brand" href="#" @click.prevent="$router.push('/mods-access/')"
            v-if="isUserModerator">Moderation</a>
          <div class="dropdown-divider" v-if="isUserModerator"></div>
          <!--<a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet?action=buy_afit')">{{ $t('buy_afit_menu') }}<br/></a>-->
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/market')"><i
              class="fas fa-shopping-cart text-brand"></i>&nbsp;{{ $t('spend_afit_menu') }}<br /></a>
          <SteemStats :user="user" minView="true" class="dropdown-item" :key="reload" />
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/userrank')"><i
              class="fa-solid fa-list-ol text-brand"></i>&nbsp;{{ $t('My_Rank') }} <br /><span class="text-brand pl-4">
              {{ displayCoreUserRank }} <span class="increased-rank"
                v-if="this.userRankObj && this.userRankObj.afitx_rank">{{ displayIncreasedUserRank }}</span> </span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet')"><i
              class="fa-solid fa-wallet text-brand"></i>&nbsp;{{ $t('My_Wallet') }} <br /><span class="text-brand pl-4">
              {{ formattedUserTokens }}</span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/referrals')"><i
              class="fas fa-user-friends text-brand"></i>&nbsp;{{ $t('Referrals') }} <br /><span
              class="text-brand pl-4"> {{ referralCount }} </span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/activity/' + user.account.name)"><i
              class="fas fa-running text-brand"></i>&nbsp;{{ $t('My_Activity') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/' + user.account.name + '/blog')"><i
              class="fa-solid fa-pen-to-square text-brand"></i>&nbsp;{{ $t('My_Blog') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/blog/new')"><i
              class="fa-solid fa-plus-square text-brand"></i>&nbsp;{{ $t('New_Blog') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/' + user.account.name + '/videos')"><i
              class="fa-solid fa-video text-brand"></i>&nbsp;{{ $t('My_Videos') }}</a>
          <a class="dropdown-item" href="#"><i class="fa-solid fa-link text-brand"></i>&nbsp;{{ $t('Active_chain') }}
            <br />
            <div class="pl-4" :class="adjustHiveClass" v-on:click="setActiveChain('HIVE')">
              <img src="/img/HIVE.png" style="max-height: 20px;"
                :title="(cur_bchain == 'HIVE' ? $t('running_on_chain').replace('_CHAIN_', 'HIVE') : $t('switch_to_chain').replace('_CHAIN_', 'HIVE'))">{{ $t('HIVE') }}
              <!--<span class="span-toggle-chain pl-2 pr-2 text-brand" :title="$t('switch_chain')">
				<i class="fas fa-toggle-on" v-if="cur_bchain == 'STEEM'" v-on:click="setActiveChain('HIVE')"></i>
				<i class="fas fa-toggle-off" v-else-if="cur_bchain == 'HIVE'" v-on:click="setActiveChain('STEEM')"></i>
			</span>-->
            </div>
            <div v-if="isUserModerator" class="pl-4" :class="adjustSteemClass" v-on:click="setActiveChain('STEEM')">
              <img src="/img/STEEM.png" style="max-height: 20px;"
                :title="(cur_bchain == 'STEEM' ? $t('running_on_chain').replace('_CHAIN_', 'STEEM') : $t('switch_to_chain').replace('_CHAIN_', 'STEEM'))">{{ $t('STEEM') }}
            </div>
            <div class="pl-4" :class="adjustBlurtClass" v-on:click="setActiveChain('BLURT')">
              <img src="/img/BLURT.png" style="max-height: 20px;"
                :title="(cur_bchain == 'BLURT' ? $t('running_on_chain').replace('_CHAIN_', 'BLURT') : $t('switch_to_chain').replace('_CHAIN_', 'BLURT'))">{{ $t('BLURT') }}
            </div>
          </a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/password')"><i
              class="fa-sharp fa-solid fa-key text-brand"></i>&nbsp;{{ $t('My_Password') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/settings')"><i
              class="fa-solid fa-gear text-brand"></i>&nbsp;{{ $t('Settings') }}</a>
          <div class="dropdown-divider"></div>
          <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc" class="dropdown-item"><i
              class="fa-solid fa-user-group text-brand"></i>&nbsp;{{ $t('switch_user') }}</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="proceedLogout()"><i
              class="fa-solid fa-right-from-bracket text-brand"></i>&nbsp;{{ $t('Logout') }}</a>
        </div></div>
      </li>
    </ul>
    <LoginModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
import LoginModal from '~/components/LoginModal'
import { mapGetters } from 'vuex'
import SteemStats from '~/components/SteemStats'
import StingChat from '~/components/StingChat'
import AutocompleteUsernameInput from '~/components/AutocompleteUsernameInput';

export default {
  components: {
    SteemStats,
    StingChat,
    LoginModal,
    AutocompleteUsernameInput
  },
  data() {
    return {
      showModal: false,
      activeNotifications: [],
      activeNotificationsLen: 1,
      cur_bchain: 'HIVE',
      reload: 0,
      profImgUrl: process.env.hiveImgUrl,
    }
  },
  watch: {
    user: 'updateUserData',
    bchain: function (newBchain) {
      this.cur_bchain = newBchain;
      this.$store.dispatch('steemconnect/refreshUser');
      this.reload += 1;
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['userTokens', 'userRank', 'userRankObj', 'referrals', 'bchain']),
    ...mapGetters(['moderators']),
    //taking care of the search text input display
    computedInputClass() {
      if (process.client) {
        // Check if the screen width is less than 768px (standard for mobile)
        if (window.innerWidth <500) return 'form-control-sm';
        return window.innerWidth < 768 ? '' : 'form-control-lg';
      }
      return '';
    },
    computedCustomClass(){
      if (process.client) {
        // Check if the screen width is less than 768px (standard for mobile)
        if (window.innerWidth <500) return "hiddenIcon";
      }
      return "";
    },
    hideComponent() {
      if (process.client) {
        // Check if the screen width is less than 768px (standard for mobile)
        if (window.innerWidth <500) return true;
      }
      return false;
    },
    notificationsNotice() {

      return this.activeNotificationsLen + (this.activeNotificationsLen >= process.env.notificationsCutoff ? '+' : '');
    },
    formattedUserTokens() {
      return this.numberFormat(parseFloat(this.userTokens).toFixed(3), 3) + ' AFIT'
    },
    displayUserRank() {
      return parseFloat(this.userRank).toFixed(1)
    },
    displayCoreUserRank() {
      return (this.userRankObj ? parseFloat(this.userRankObj.rank_no_afitx).toFixed(2) : '');
    },
    displayIncreasedUserRank() {
      return '(+' + parseFloat(this.userRankObj.afitx_rank).toFixed(2) + ')';
    },
    referralCount() {
      return this.referrals.length;
    },
    isUserModerator() {
      if (this.user && this.moderators.find(mod => mod.name == this.user.account.name && mod.title == 'moderator')) {
        return true;
      }
      return false;
    },
    adjustHiveClass() {
      if (this.cur_bchain != 'HIVE') {
        return 'option-opaque';
      }
      return 'active-spin';
    },
    adjustSteemClass() {
      if (this.cur_bchain != 'STEEM') {
        return 'option-opaque';
      }
      return 'active-spin';
    },
    adjustBlurtClass() {
      if (this.cur_bchain != 'BLURT') {
        return 'option-opaque';
      }
      return 'active-spin';
    }
  },
  methods: {
    /**
       * Formats numbers with commas and dots.
       *
       * @param number
     * @param precision
       * @returns {string}
       */
    showModalFuncLOGIN() {
      this.proceedLogout();
      this.$emit('modal-opened', true);
    },
    numberFormat(number, precision) {
      return new Intl.NumberFormat('en-EN', { maximumFractionDigits: precision }).format(number)
    },
    showModalFunc() {
      this.$emit('modal-opened', true);
    },
    toggleDarkMode() {
      this.$store.dispatch('toggleDarkMode');
    },
    setActiveChain(chain) {
      if (this.cur_bchain == chain) {
        //take no action if no change in chain
        return;
      }
      let userConf = confirm(this.$t('confirm_chain_switch').replace('_CHAIN_', chain));
      if (!userConf) {
        return;
      }
      this.cur_bchain = chain;
      this.$store.commit('setBchain', this.cur_bchain);

      localStorage.setItem('cur_bchain', this.cur_bchain);

      this.profImgUrl = process.env.hiveImgUrl;
      if (this.cur_bchain == 'STEEM') {
        this.profImgUrl = process.env.steemImgUrl;
      }
    },
    proceedLogout() {
      this.$store.commit('setStdLoginUser', false);
      localStorage.removeItem('std_login')
      localStorage.removeItem('std_login_name');
      this.$store.dispatch('steemconnect/logout')
    },
    async updateUserData() {
      if (this.user) {
        try {
          let res = await fetch(process.env.actiAppUrl + 'activeNotifications/' + this.user.account.name);
          let outcome = await res.json();
          try {
            this.activeNotificationsLen = outcome.length;
            this.activeNotifications = outcome.reverse();
          } catch (err) {
            console.log('error fetching notifications');
          }
        } catch (err) {
          console.error('Error updating user data:', err);
        }
        this.$forceUpdate();
      }
    },
    async markRead(notif) {
      let accToken = localStorage.getItem('access_token')

      let url = new URL(process.env.actiAppUrl + 'markRead/' + notif._id + '?user=' + this.user.account.name);

      let reqHeads = new Headers({
        'Content-Type': 'application/json',
        'x-acti-token': 'Bearer ' + accToken,
      });
      let res = await fetch(url, {
        method: 'GET',
        headers: reqHeads,
      });

      let outcome = await res.json();
      //console.log(outcome);
      //console.log(outcome.status);
      this.updateUserData()
    },

     async handleNotificationClick(notif) {  
      await this.markRead(notif); 
      window.location.href = notif.url; 
    },

    async markAllRead() {
      let userConf = confirm(this.$t('Mark_all_read_confirm'));
      if (!userConf) {
        return;
      }

      let accToken = localStorage.getItem('access_token')

      let url = new URL(process.env.actiAppUrl + 'markAllRead/?user=' + this.user.account.name);

      let reqHeads = new Headers({
        'Content-Type': 'application/json',
        'x-acti-token': 'Bearer ' + accToken,
      });
      let res = await fetch(url, {
        method: 'GET',
        headers: reqHeads,
      });

      let outcome = await res.json();
      //console.log(outcome);
      //console.log(outcome.status);
      this.updateUserData()
    }
  },
  async mounted() {
    //grab current active chain
    if (localStorage.getItem('cur_bchain')) {
      this.cur_bchain = localStorage.getItem('cur_bchain')
    }

    this.profImgUrl = process.env.hiveImgUrl;
    if (this.cur_bchain == 'STEEM') {
      this.profImgUrl = process.env.steemImgUrl;
    }

    //grab moderators' list
    this.$store.dispatch('fetchModerators')

    this.updateUserData()

    //fetch new notifications every minute
    setInterval(this.updateUserData, 60000);
  },
}
</script>

<style lang="sass">
.user-menu-container
  height: 54px
  position: relative  
  top: 0
  right: 6px
  .user-menu
    .user-avatar
      width: 40px
      height: 40px
      background-position: center center
      background-size: cover
      border-radius: 50%
      border: solid 1px #ddd
    .dropdown-toggle::after
      display: none
    .navbar-text
      font-size: .8rem
    .dropdown-menu
      position: absolute
      right: 0
      left: auto
</style>
<style>
#user_menu_navlink {
  height: 40px;
}

.group-class {
  margin-left: 0px !important;
  display: inline-block;
}

.notification-class {
  background-color: red;
  color: white !important;
  display: inline-block;
  text-align: center;
  font-size: 12px;
  width: auto;
  min-width: 20px;
}

.group-class.user-avatar-notif-menu {
  float: left;
}

.user-avatar {
  text-align: center;
}

.user-avatar-medium {
  width: 30px !important;
  height: 30px !important;
  text-align: center;
  position: absolute;
  float: right;
}

.notif-container {
  width: 500px;        
  max-width: 500px;       
  min-width: 320px;       
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.notif-clickable {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
}


.notif-container .row {
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05); 
}

.notif-text {
  color: var(--notif-text-color);
  display: inline-block;
  font-size: 16px;
  padding-left: 9px;
  word-break: break-word;
}


.option-opaque {
  opacity: 0.3;
}

@keyframes spin {
  0% {
    transform: rotateZ(0);
  }

  100% {
    transform: rotateZ(360deg);
  }
}

.active-spin>img {
  animation: spin 5s ease-in-out infinite alternate;
}

.span-toggle-chain {
  font-size: 1.2rem;
}

.dropdown-header {
  padding-left: 0px;
}

.dropdown-menu {
   max-height: 420px;
  overflow: auto;
  position: absolute ;
  top: 100% !important;
  margin-top: 0 !important;
}

.dropdown-menu.notif-container {
  margin-top: 0px !important;
  top: 100% !important; 
}
/* Style for the scrollbar */
.dropdown-menu::-webkit-scrollbar {
  width: 10px;
  background-color: #f5f5f5;
}

/* Style for the thumb */
.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: #ff112d;
  border-radius: 5px;
}

/* Style for the thumb on hover */
.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background-color: pink !important;
}

.search-li{
  height: fit-content;
}
</style>
