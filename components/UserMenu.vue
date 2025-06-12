<template>
  <div class="user-menu-container align-items-center">
    <ul class="navbar-nav mr-auto user-menu flex-row">
      <li class="nav-item mr-2 btn btn-brand nav-item-border p-0 search-li">
        <div style="display:inline-flex">
          <AutocompleteUsernameInput id="search-user" name="search-user" ref="search-user"
            :customClass="computedCustomClass" :inputClass="computedInputClass" :placeHolderVal="$t('search_user')"
            :enableRedirect="true" />
        </div>
      </li>
      <li class="nav-item" v-if="!user">
        <a :href="'/signup'">{{ $t('Signup_Link') }}</a> | <a href="#" data-toggle="modal" data-target="#loginModal"
          @click="showModalFunc">{{ $t('Login') }}</a>
      </li>

      <li class="nav-item mr-2" @click="toggleDarkMode" :title="$t('toggle_dark_mode')" v-if="user && !hideVisualControls">
        <span class="user-avatar group-class">
          <i v-if="$store.state.darkMode" class="fa-solid fa-sun text-brand"></i>
          <i v-else class="fa-solid fa-moon text-brand"></i>
        </span>
      </li>
      <li class="nav-item mr-2" v-if="user && !hideVisualControls">
        <StingChat :user="this.user" />
      </li>
      
      <li class="nav-item mr-2 notification-item-container" v-if="user">
        <span class="notification-class" v-if="activeNotificationsLen > 0">{{ notificationsNotice }}</span> 
        
        <span class="user-avatar group-class" v-if="activeNotificationsLen > 0"> 
          <a class="nav-link dropdown-toggle p-0 notification-bell-link" id="user_menu_navlink_notif" href="#" data-toggle="dropdown" 
            :title="$t('Notifications_popup').replace('_count_', String(activeNotificationsLen))">
            <i class="fas fa-bell"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-right notif-container">
            <div class="text-right m-2">
              <a href='/notifications' class="btn btn-brand border">{{ $t('View_all') }}</a>
              <a href='#' class="btn btn-brand border" v-on:click="markAllRead()">{{ $t('Clear_all') }}</a>
            </div>
            <div class="row p-2 border-top" v-for="(notif, index) in activeNotifications" :key="index" :notif="notif">
              <span class="col-md-10">
                <a :href="notif.url" v-on:click="markRead(notif)">
                  <i class="fas fa-user-plus p-1"
                    v-if="notif.type == 'friendship' || notif.type == 'friendship_request'"></i>
                  <i class="fas fa-user-friends p-1" v-else-if="notif.type == 'friendship_acceptance'"></i>
                  <span>{{ notif.details }}</span>
                  <span v-if="notif.action_taker" class="user-avatar user-avatar-medium mr-1 mb-3"
                    :style="'background-image: url(' + profImgUrl + '/u/' + notif.action_taker + '/avatar)'"></span>
                </a>
              </span>
              <span>
                <a href="#" v-on:click="markRead(notif)" class="col-md-2" :title="$t('mark_as_read')"><i
                    class="fas fa-check-square"></i></a>
              </span>
            </div>
          </div>
        </span>
        <span class="user-avatar group-class" v-else> 
          <a class="nav-link dropdown-toggle p-0 notification-bell-link" id="user_menu_navlink_notif_empty" href="#" data-toggle="dropdown">
            <i class="fas fa-bell"></i>
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
      
      <li class="nav-item dropdown" v-if="user">
        <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink_avatar" href="#" data-toggle="dropdown">
          <div class="user-avatar group-class"
            :style="'background-image: url(' + profImgUrl + '/u/' + user.account.name + '/avatar)'"></div>
        </a>
        <div class="dropdown-menu dropdown-menu-right">
          <h6 class="dropdown-header"><a class="dropdown-item" href="#"
              @click.prevent="$router.push('/' + user.account.name)"><i
                class="fa-solid fa-user text-brand"></i> @{{ user.account.name }}</a></h6>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-brand" href="#" @click.prevent="$router.push('/mods-access/')"
            v-if="isUserModerator">Moderation</a>
          <div class="dropdown-divider" v-if="isUserModerator"></div>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/market')"><i
              class="fas fa-shopping-cart text-brand"></i> {{ $t('spend_afit_menu') }}<br /></a>
          <SteemStats :user="user" minView="true" class="dropdown-item" :key="reload" />
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/userrank')"><i
              class="fa-solid fa-list-ol text-brand"></i> {{ $t('My_Rank') }} <br /><span class="text-brand pl-4">
              {{ displayCoreUserRank }} <span class="increased-rank"
                v-if="userRankObj && userRankObj.afitx_rank">{{ displayIncreasedUserRank }}</span> </span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet')"><i
              class="fa-solid fa-wallet text-brand"></i> {{ $t('My_Wallet') }} <br /><span class="text-brand pl-4">
              {{ formattedUserTokens }}</span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/referrals')"><i
              class="fas fa-user-friends text-brand"></i> {{ $t('Referrals') }} <br /><span
              class="text-brand pl-4"> {{ referralCount }} </span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/activity/' + user.account.name)"><i
              class="fas fa-running text-brand"></i> {{ $t('My_Activity') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/' + user.account.name + '/blog')"><i
              class="fa-solid fa-pen-to-square text-brand"></i> {{ $t('My_Blog') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/blog/new')"><i
              class="fa-solid fa-plus-square text-brand"></i> {{ $t('New_Blog') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/' + user.account.name + '/videos')"><i
              class="fa-solid fa-video text-brand"></i> {{ $t('My_Videos') }}</a>
          <a class="dropdown-item" href="#"><i class="fa-solid fa-link text-brand"></i> {{ $t('Active_chain') }}
            <br />
            <div class="pl-4" :class="adjustHiveClass" v-on:click="setActiveChain('HIVE')">
              <img src="/img/HIVE.png" style="max-height: 20px;"
                :title="(cur_bchain == 'HIVE' ? $t('running_on_chain').replace('_CHAIN_', 'HIVE') : $t('switch_to_chain').replace('_CHAIN_', 'HIVE'))">{{
                  $t('HIVE') }}
            </div>
            <div v-if="isUserModerator" class="pl-4" :class="adjustSteemClass" v-on:click="setActiveChain('STEEM')">
              <img src="/img/STEEM.png" style="max-height: 20px;"
                :title="(cur_bchain == 'STEEM' ? $t('running_on_chain').replace('_CHAIN_', 'STEEM') : $t('switch_to_chain').replace('_CHAIN_', 'STEEM'))">{{
                  $t('STEEM') }}
            </div>
            <div class="pl-4" :class="adjustBlurtClass" v-on:click="setActiveChain('BLURT')">
              <img src="/img/BLURT.png" style="max-height: 20px;"
                :title="(cur_bchain == 'BLURT' ? $t('running_on_chain').replace('_CHAIN_', 'BLURT') : $t('switch_to_chain').replace('_CHAIN_', 'BLURT'))">{{
                  $t('BLURT') }}
            </div>
          </a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/password')"><i
              class="fa-sharp fa-solid fa-key text-brand"></i> {{ $t('My_Password') }}</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/settings')"><i
              class="fa-solid fa-gear text-brand"></i> {{ $t('Settings') }}</a>
          <div class="dropdown-divider"></div>
          <a href="#" data-toggle="modal" data-target="#loginModal" @click="showModalFunc" class="dropdown-item"><i
              class="fa-solid fa-user-group text-brand"></i> {{ $t('switch_user') }}</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="proceedLogout()"><i
              class="fa-solid fa-right-from-bracket text-brand"></i> {{ $t('Logout') }}</a>
        </div>
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
      activeNotificationsLen: 0,
      cur_bchain: 'HIVE',
      reload: 0,
      profImgUrl: process.env.hiveImgUrl,
      notificationInterval: null,
    }
  },
  watch: {
    user: 'updateUserData',
    bchain: function (newBchain) {
      this.cur_bchain = newBchain;
      if (this.user) {
        this.$store.dispatch('steemconnect/refreshUser');
      }
      this.reload += 1;
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['userTokens', 'userRank', 'userRankObj', 'referrals', 'bchain']),
    ...mapGetters(['moderators']),

    computedInputClass() {
      if (process.client) {
        if (window.innerWidth < 500) return 'form-control-sm search-input-condensed';
        return window.innerWidth < 768 ? '' : 'form-control-lg';
      }
      return '';
    },
    computedCustomClass() {
      if (process.client) {
        if (window.innerWidth < 500) return "hiddenIcon autocomplete-condensed";
      }
      return "";
    },
    hideVisualControls() {
      if (process.client) {
        return window.innerWidth < 500;
      }
      return false;
    },
    hideFriendsIcon() {
      if (process.client) {
        return window.innerWidth < 500;
      }
      return false;
    },
    notificationsNotice() {
      const cutoff = parseInt(process.env.notificationsCutoff || '100'); 
      
      if (this.activeNotificationsLen === 0) {
        return "0";
      }
      
      if (process.client && window.innerWidth < 500) {
        if (this.activeNotificationsLen > 99) return "99+";
        return String(this.activeNotificationsLen);
      } else {
        return this.activeNotificationsLen + (this.activeNotificationsLen >= cutoff ? '+' : '');
      }
    },
    formattedUserTokens() {
      if (!this.userTokens && this.userTokens !== 0) return '0 AFIT';
      return this.numberFormat(parseFloat(this.userTokens).toFixed(3), 3) + ' AFIT';
    },
    displayCoreUserRank() {
      if (this.userRankObj && typeof this.userRankObj.rank_no_afitx !== 'undefined') {
        return parseFloat(this.userRankObj.rank_no_afitx).toFixed(2);
      } else if (typeof this.userRank !== 'undefined' && this.userRank !== null) {
        return parseFloat(this.userRank).toFixed(2);
      }
      return '';
    },
    displayIncreasedUserRank() {
      return (this.userRankObj && this.userRankObj.afitx_rank) ? '(+' + parseFloat(this.userRankObj.afitx_rank).toFixed(2) + ')' : '';
    },
    referralCount() {
      return this.referrals ? this.referrals.length : 0;
    },
    isUserModerator() {
      if (this.user && this.user.account && this.moderators && Array.isArray(this.moderators)) {
        return this.moderators.find(mod => mod.name === this.user.account.name && mod.title === 'moderator');
      }
      return false;
    },
    adjustHiveClass() {
      return this.cur_bchain !== 'HIVE' ? 'option-opaque' : 'active-spin';
    },
    adjustSteemClass() {
      return this.cur_bchain !== 'STEEM' ? 'option-opaque' : 'active-spin';
    },
    adjustBlurtClass() {
      return this.cur_bchain !== 'BLURT' ? 'option-opaque' : 'active-spin';
    }
  },
  methods: {
    showModalFuncLOGIN() {
      this.proceedLogout();
      this.$emit('modal-opened', true);
    },
    numberFormat(number, precision) {
      if (isNaN(parseFloat(number))) return String(number);
      return new Intl.NumberFormat('en-EN', { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(number);
    },
    showModalFunc() {
      this.$emit('modal-opened', true);
    },
    toggleDarkMode() {
      this.$store.dispatch('toggleDarkMode');
    },
    setActiveChain(chain) {
      if (this.cur_bchain === chain) return;
      if (!confirm(this.$t('confirm_chain_switch').replace('_CHAIN_', chain))) return;
      
      this.cur_bchain = chain;
      this.$store.commit('setBchain', this.cur_bchain);
      localStorage.setItem('cur_bchain', this.cur_bchain);

      this.profImgUrl = process.env.hiveImgUrl; 
      if (this.cur_bchain === 'STEEM') this.profImgUrl = process.env.steemImgUrl;
      
      if (this.user) this.$store.dispatch('steemconnect/refreshUser');
      this.reload += 1;
    },
    proceedLogout() {
      this.$store.commit('setStdLoginUser', false);
      localStorage.removeItem('std_login');
      localStorage.removeItem('std_login_name');
      this.$store.dispatch('steemconnect/logout');
    },
    async updateUserData() {
      if (this.user && this.user.account && this.user.account.name) {
        try {
          const res = await fetch(`${process.env.actiAppUrl}activeNotifications/${this.user.account.name}`);
          if (!res.ok) {
            console.error(`Failed to fetch notifications: ${res.status}`);
            this.activeNotificationsLen = 0;
            this.activeNotifications = [];
            return;
          }
          const outcome = await res.json();
          this.activeNotificationsLen = Array.isArray(outcome) ? outcome.length : 0;
          this.activeNotifications = Array.isArray(outcome) ? outcome.reverse() : [];
        } catch (err) {
          console.error('Error fetching/processing notifications:', err);
          this.activeNotificationsLen = 0;
          this.activeNotifications = [];
        }
      } else {
        this.activeNotificationsLen = 0;
        this.activeNotifications = [];
      }
    },
    async markRead(notif) {
      if (!this.user || !this.user.account || !notif || !notif._id) return;
      const accToken = localStorage.getItem('access_token');
      if (!accToken) { console.warn('No access token for markRead'); return; }

      const url = new URL(`${process.env.actiAppUrl}markRead/${notif._id}?user=${this.user.account.name}`);
      const reqHeads = new Headers({ 'Content-Type': 'application/json', 'x-acti-token': `Bearer ${accToken}` });
      try {
        const res = await fetch(url, { method: 'GET', headers: reqHeads });
        if (res.ok) this.updateUserData();
        else console.error(`Failed to mark notification as read: ${res.status}`);
      } catch (error) { console.error('Error in markRead:', error); }
    },
    async markAllRead() {
      if (!this.user || !this.user.account) return;
      if (!confirm(this.$t('Mark_all_read_confirm'))) return;

      const accToken = localStorage.getItem('access_token');
      if (!accToken) { console.warn('No access token for markAllRead'); return; }
      
      const url = new URL(`${process.env.actiAppUrl}markAllRead/?user=${this.user.account.name}`);
      const reqHeads = new Headers({ 'Content-Type': 'application/json', 'x-acti-token': `Bearer ${accToken}` });
      try {
        const res = await fetch(url, { method: 'GET', headers: reqHeads });
        if (res.ok) this.updateUserData();
        else console.error(`Failed to mark all notifications as read: ${res.status}`);
      } catch (error) { console.error('Error in markAllRead:', error); }
    }
  },
  async mounted() {
    if (localStorage.getItem('cur_bchain')) {
      this.cur_bchain = localStorage.getItem('cur_bchain');
      this.$store.commit('setBchain', this.cur_bchain);
    }

    this.profImgUrl = process.env.hiveImgUrl;
    if (this.cur_bchain === 'STEEM') this.profImgUrl = process.env.steemImgUrl;
    
    this.$store.dispatch('fetchModerators');
    if (this.user) {
      this.updateUserData();
    }
    this.notificationInterval = setInterval(this.updateUserData, 60000);
  },
  beforeDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }
}
</script>

<style lang="sass">
.user-menu-container
  height: 54px
  display: flex 
  align-items: center

  .user-menu 
    display: flex 
    align-items: center 
    padding-left: 0 
    margin-bottom: 0 
    list-style: none 
    flex-wrap: nowrap 

    .user-avatar 
      width: 50px 
      height: 50px
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
.notification-item-container {
  position: relative;
}

#user_menu_navlink_notif,
#user_menu_navlink_notif_empty,
#user_menu_navlink_avatar {
  height: auto; 
  display: flex;
  align-items: center;
}

.user-menu .nav-item {
  margin-right: 0.8rem; 
}
.user-menu .nav-item:last-child {
  margin-right: 0; 
}

.user-menu .nav-item .group-class:not(.notification-class) {
  width: 40px; 
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0; 
  position: relative; 
}

.user-menu .nav-item .group-class:not(.notification-class) > i,
.user-menu .nav-item .group-class:not(.notification-class) > a > i { 
  font-size: 1.6em; 
  padding: 0;        
}

.notification-class { 
  background-color: red !important;
  color: white !important;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px; 
  height: 20px;    
  border-radius: 50%; 
  padding: 0;      
  box-sizing: border-box;
  position: absolute;
  top: -5px;
  left: -7px;
  z-index: 10;
}

.notification-bell-link .fa-bell {
  color: #FF0000 !important; 
}
.notification-bell-link:hover .fa-bell {
  color: #FF0000 !important; 
}

.user-avatar-medium { 
  width: 30px !important;
  height: 30px !important;
}
.notif-container {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 280px; 
}
.option-opaque { opacity: 0.3; }
@keyframes spin { 0% { transform: rotateZ(0); } 100% { transform: rotateZ(360deg); } }
.active-spin > img { animation: spin 5s ease-in-out infinite alternate; }
.dropdown-header { padding-left: 0px; }
.dropdown-menu { max-height: 420px; overflow: auto; }
.dropdown-menu::-webkit-scrollbar { width: 8px; background-color: #f5f5f5; }
.dropdown-menu::-webkit-scrollbar-thumb { background-color: #ff112d; border-radius: 4px; }
.dropdown-menu::-webkit-scrollbar-thumb:hover { background-color: #e0001a !important; }
.search-li { 
  padding: 0 !important; 
  display: flex;
  align-items: center; 
}

@media only screen and (max-width: 500px) {
  .user-menu-container .user-menu .nav-item {
    margin-right: 8px !important; 
    padding: 0 !important;        
    display: flex;               
    align-items: center;         
  }

  .user-menu-container .user-menu .nav-item .user-avatar, 
  .user-menu-container .user-menu .nav-item .group-class:not(.notification-class) { 
    width: 40px !important;   
    height: 40px !important;  
  }

  .user-menu-container .user-menu .nav-item .user-avatar > i,
  .user-menu-container .user-menu .nav-item .user-avatar > a > i,
  .user-menu-container .user-menu .nav-item .group-class:not(.notification-class) > i,
  .user-menu-container .user-menu .nav-item > a > .group-class:not(.notification-class) > i { 
    font-size: 1.1em !important;  
    padding: 0 !important;        
  }

  .user-menu-container .user-menu .notification-item-container {
    position: relative; 
    display: inline-flex; 
    align-items: center;
  }

  .user-menu-container .user-menu .notification-class { 
    width: 16px !important;
    height: 16px !important;
    font-size: 8px !important;
    top: -2px !important;
    left: -2px !important;
  }
  
  .user-menu-container .user-menu .nav-item > a:not(.dropdown-toggle) {
     font-size: 0.8rem;
  }
}
</style>