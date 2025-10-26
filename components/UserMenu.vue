<template>
  <div class="user-menu-container align-items-center">
    <ul class="navbar-nav mr-auto user-menu flex-row">
      <!-- Search Bar -->
      <li class="nav-item mr-2 btn btn-brand nav-item-border p-0 search-li">
        <form @submit.prevent="performSearch" class="d-flex align-items-center">
          <div class="input-group-prepend d-lg-none pr-1">
              <b-dropdown variant="brand" right>
                  <template #button-content>
                      <i :class="currentSearchIcon"></i>
                  </template>
                  <b-dropdown-item @click="setSearchMode('user')"><i class="fas fa-user"></i> {{ $t('User') }}</b-dropdown-item>
                  <b-dropdown-item @click="setSearchMode('keyword')"><i class="fas fa-keyboard"></i> {{ $t('Keyword') }}</b-dropdown-item>
                  <b-dropdown-item @click="setSearchMode('ai')"><i class="fas fa-robot"></i> {{ $t('AI') }}</b-dropdown-item>
              </b-dropdown>
          </div>
          <div class="input-group">
            <div class="input-group-prepend d-none d-lg-flex">
              <div class="btn-group btn-group-toggle" data-toggle="buttons">
                <label class="btn btn-brand" :class="{ active: searchMode === 'user' }" @click="searchMode = 'user'" :title="$t('User')">
                  <input type="radio" name="options" id="option1" autocomplete="off" :checked="searchMode === 'user'"> <i class="fas fa-user"></i>
                </label>
                <label class="btn btn-brand" :class="{ active: searchMode === 'keyword' }" @click="searchMode = 'keyword'" :title="$t('Keyword')">
                  <input type="radio" name="options" id="option2" autocomplete="off" :checked="searchMode === 'keyword'"> <i class="fas fa-keyboard"></i>
                </label>
                <label class="btn btn-brand" :class="{ active: searchMode === 'ai' }" @click="searchMode = 'ai'" :title="$t('AI')">
                  <input type="radio" name="options" id="option3" autocomplete="off" :checked="searchMode === 'ai'"> <i class="fas fa-robot"></i>
                </label>
              </div>
            </div>
            <AutocompleteUsernameInput v-if="searchMode === 'user'" v-model="searchQuery" :enableRedirect="true" :inputClass="computedInputClass" :customClass="computedCustomClass" :placeHolderVal="searchPlaceholder" @select="performSearch" />
            <input v-else type="text" v-model="searchQuery" class="form-control" :placeholder="searchPlaceholder">
            <div class="input-group-append">
              <button type="submit" class="btn btn-brand"><i class="fas fa-search"></i></button>
            </div>
          </div>
        </form>
      </li>

      <!-- Login/Signup Links (FIXED: Using NuxtLink) -->
      <li class="nav-item" v-if="!user">
        <NuxtLink :to="localePath('/signup')">{{ $t('Signup_Link') }}</NuxtLink> |
        <a href="#" data-toggle="modal" data-target="#loginModal" @click.prevent="showModalFunc">{{ $t('Login') }}</a>
      </li>

      <!-- Dark Mode Toggle -->
      <li class="nav-item mr-2" @click="toggleDarkMode" :title="$t('toggle_dark_mode')"
        v-if="user && !hideVisualControls">
        <span class="user-avatar group-class">
          <i v-if="$store.state.darkMode" class="fa-solid fa-sun text-brand"></i>
          <i v-else class="fa-solid fa-moon text-brand"></i>
        </span>
      </li>

      <!-- ======================================================= -->
      <!-- START: FIXED LANGUAGE SWITCHER IMPLEMENTATION           -->
      <!-- ======================================================= -->
      <li class="nav-item dropdown mr-2">
        <a class="nav-link dropdown-toggle p-0" href="#" id="language-switcher-icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" :title="$t('languages')">
          <span class="user-avatar group-class">
            <i class="fas fa-language text-brand"></i>
          </span>
        </a>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="language-switcher-icon">
          <!-- The v-for loops through all available languages -->
          <a v-for="locale in availableLocales" :key="locale.code" class="dropdown-item lang-item"
            :class="{ 'is-active': locale.code === $i18n.locale }" href="#"
            @click.prevent.stop="switchLang(locale.code)">
            <!-- We only have the language name now -->
            {{ locale.name }}
          </a>
        </div>
      </li>
      <!-- ======================================================= -->
      <!-- END: FIXED LANGUAGE SWITCHER IMPLEMENTATION             -->
      <!-- ======================================================= -->

      <!-- StingChat -->
      <li class="nav-item mr-2" v-if="user && !hideVisualControls">
        <StingChat :user="this.user" />
      </li>

      <!-- Notifications (FIXED: Using NuxtLink) -->
      <li class="nav-item mr-2 notification-item-container" v-if="user">
        <span class="notification-class" v-if="activeNotificationsLen > 0">{{ notificationsNotice }}</span>

        <span class="user-avatar group-class" v-if="activeNotificationsLen > 0">
          <a class="nav-link dropdown-toggle p-0 notification-bell-link" id="user_menu_navlink_notif" href="#"
            data-toggle="dropdown"
            :title="$t('Notifications_popup').replace('_count_', String(activeNotificationsLen))">
            <i class="fas fa-bell"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-right notif-container">
            <div class="text-right m-2">
              <NuxtLink :to="localePath('/notifications')" class="btn btn-brand border">{{ $t('View_all') }}</NuxtLink>
              <a href='#' class="btn btn-brand border" v-on:click.prevent="markAllRead()">{{ $t('Clear_all') }}</a>
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
                <a href="#" v-on:click.prevent="markRead(notif)" class="col-md-2" :title="$t('mark_as_read')"><i
                    class="fas fa-check-square"></i></a>
              </span>
            </div>
          </div>
        </span>
        <span class="user-avatar group-class" v-else>
          <a class="nav-link dropdown-toggle p-0 notification-bell-link" id="user_menu_navlink_notif_empty" href="#"
            data-toggle="dropdown">
            <i class="fas fa-bell"></i>
          </a>
          <div class="dropdown-menu dropdown-menu-right">
            <div class="text-right m-2">
              <NuxtLink :to="localePath('/notifications')" class="btn btn-brand border">{{ $t('View_all') }}</NuxtLink>
              <a href='#' class="btn btn-brand border" v-on:click.prevent="markAllRead()">{{ $t('Clear_all') }}</a>
            </div>
            <div class="p-2">{{ $t('no_notifications') }}</div>
          </div>
        </span>
      </li>

      <!-- User Profile Dropdown (FIXED: All internal links converted to NuxtLink) -->
      <li class="nav-item dropdown" v-if="user">
        <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink_avatar" href="#" data-toggle="dropdown">
          <div class="user-avatar group-class"
            :style="'background-image: url(' + profImgUrl + '/u/' + user.account.name + '/avatar)'"></div>
        </a>
        <div class="dropdown-menu dropdown-menu-right user-dropdown" v-if="isMounted">
          <div class="dropdown-header user-info-sticky">
            <NuxtLink class="dropdown-item" :to="localePath('/' + user.account.name)"><i
                class="fa-solid fa-user text-brand"></i> @{{ user.account.name }}</NuxtLink>
          </div>
          <div class="dropdown-scrollable">
            <NuxtLink class="dropdown-item text-brand" :to="localePath('/mods-access/')" v-if="isUserModerator">
              Moderation</NuxtLink>
            <div class="dropdown-divider" v-if="isUserModerator"></div>
            <NuxtLink class="dropdown-item" :to="localePath('/market')"><i class="fas fa-shopping-cart text-brand"></i>
              {{ $t('spend_afit_menu') }}<br /></NuxtLink>
            <SteemStats :user="user" minView="true" class="dropdown-item" :key="reload" />
            <NuxtLink class="dropdown-item" :to="localePath('/userrank')"><i class="fa-solid fa-list-ol text-brand"></i>
              {{ $t('My_Rank') }} <br /><span class="text-brand pl-4"> {{ displayCoreUserRank }} <span
                  class="increased-rank" v-if="userRankObj && userRankObj.afitx_rank">{{ displayIncreasedUserRank
                  }}</span> </span></NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/wallet')"><i class="fa-solid fa-wallet text-brand"></i> {{
              $t('My_Wallet') }} <br /><span class="text-brand pl-4"> {{ formattedUserTokens }}</span></NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/referrals')"><i
                class="fas fa-user-friends text-brand"></i> {{ $t('Referrals') }} <br /><span class="text-brand pl-4">
                {{ referralCount }} </span></NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/activity/' + user.account.name)"><i
                class="fas fa-running text-brand"></i> {{ $t('My_Activity') }}</NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/' + user.account.name + '/blog')"><i
                class="fa-solid fa-pen-to-square text-brand"></i> {{ $t('My_Blog') }}</NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/blog/new')"><i
                class="fa-solid fa-plus-square text-brand"></i> {{ $t('New_Blog') }}</NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/' + user.account.name + '/videos')"><i
                class="fa-solid fa-video text-brand"></i> {{ $t('My_Videos') }}</NuxtLink>
            <a class="dropdown-item" href="#"><i class="fa-solid fa-link text-brand"></i> {{ $t('Active_chain') }}
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
            <NuxtLink class="dropdown-item" :to="localePath('/password')"><i
                class="fa-sharp fa-solid fa-key text-brand"></i> {{ $t('My_Password') }}</NuxtLink>
            <NuxtLink class="dropdown-item" :to="localePath('/settings')"><i class="fa-solid fa-gear text-brand"></i> {{
              $t('Settings') }}</NuxtLink>

            <div class="dropdown-divider"></div>
            <a href="#" data-toggle="modal" data-target="#loginModal" @click.prevent="showModalFunc"
              class="dropdown-item"><i class="fa-solid fa-user-group text-brand"></i> {{ $t('switch_user') }}</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#" @click.prevent="proceedLogout()"><i
                class="fa-solid fa-right-from-bracket text-brand"></i> {{ $t('Logout') }}</a>
          </div>
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
      isMounted: false,
      searchQuery: '',
      searchMode: 'user', // 'user', 'keyword', or 'ai'
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
    },
    '$route.query': {
      handler(query) {
        this.searchQuery = query.q || '';
        this.searchMode = query.mode || 'user';
      },
      immediate: true,
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['userTokens', 'userRank', 'userRankObj', 'referrals', 'bchain']),
    ...mapGetters(['moderators']),

    availableLocales() {
      return this.$i18n.locales || [];
    },

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
    },
    searchPlaceholder() {
      switch (this.searchMode) {
        case 'user':
          return this.$t('Search_user');
        case 'keyword':
          return this.$t('Search_keyword');
        case 'ai':
          return this.$t('Search_AI');
        default:
          return this.$t('Search');
      }
    },
    currentSearchIcon() {
      switch (this.searchMode) {
        case 'user':
          return 'fas fa-user';
        case 'keyword':
          return 'fas fa-keyboard';
        case 'ai':
          return 'fas fa-robot';
        default:
          return 'fas fa-search';
      }
    }
  },
  methods: {
    setSearchMode(mode) {
      this.searchMode = mode;
    },
    cycleSearchMode() {
      const modes = ['user', 'keyword', 'ai'];
      const currentIndex = modes.indexOf(this.searchMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      this.searchMode = modes[nextIndex];
    },
    performSearch(username) {
      if (this.searchMode === 'user') {
        if (username) {
          this.$router.push(this.localePath('/' + username));
        }
        return;
      }

      if (!this.searchQuery.trim()) return;

      this.$router.push({
        path: this.localePath('/search'),
        query: { q: this.searchQuery.trim(), mode: this.searchMode },
      });
    },
    // ======================================================= //
    // START: BUG FIX FOR LANGUAGE PERSISTENCE                 //
    // ======================================================= //
    async switchLang(locale) {
      // 1. Prevent action if the selected language is already active.
      if (locale === this.$i18n.locale) {
        return;
      }

      // 2. Store the chosen language in localStorage to remember it.
      if (process.client) {
        localStorage.setItem('user_language', locale);
      }

      // 3. Use the i18n module's built-in setLocale function.
      // This correctly changes the language, updates the URL, and handles persistence.
      await this.$i18n.setLocale(locale);
    },
    // ======================================================= //
    // END: BUG FIX FOR LANGUAGE PERSISTENCE                   //
    // ======================================================= //

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

    async handleNotificationClick(notif) {
      await this.markRead(notif);
      if (notif.url.startsWith('/')) {
        this.$router.push(this.localePath(notif.url));
      } else {
        window.location.href = notif.url;
      }
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
    this.isMounted = true;

    // ======================================================= //
    // START: BUG FIX FOR LANGUAGE PERSISTENCE                 //
    // ======================================================= //
    // On component mount, check localStorage for a saved language preference.
    if (process.client) {
      const savedLang = localStorage.getItem('user_language');
      // If a language was saved and it's different from the current one, apply it.
      if (savedLang && savedLang !== this.$i18n.locale) {
        await this.$i18n.setLocale(savedLang);
      }
    }
    // ======================================================= //
    // END: BUG FIX FOR LANGUAGE PERSISTENCE                   //
    // ======================================================= //

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
// This section contains your original SASS styles, which are preserved.
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

.lang-item {
  display: flex !important;
  align-items: center;
  padding: 6px 6px !important;
}

.lang-item .lang-name {
  color: #212529 !important;
  flex-grow: 1;
  display: block !important;
  position: static !important;
  outline: none !important;
  background-color: transparent !important;
}

.dark-mode .lang-item .lang-name {
  color: #f8f9fa !important;
}

.dark-mode .lang-item:hover {
  background-color: #495057 !important;
  color: white !important;
}

/* Style to visually indicate the active language and prevent clicking it. */
.lang-item.is-active {
  pointer-events: none;
  opacity: 0.85;
  background-color: #ff112d;
  color:white;
}

.lang-item .d-flex {
  position: relative;
  z-index: 100;
}

body.dark-mode .lang-item.is-active {
  background-color: #343a40;
}

html[dir="rtl"] .flag-icon-container {
  margin-right: 0;
  margin-left: 12px;
}


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

/* This targets NuxtLink components that are styled as dropdown-items */
/* .dropdown-item.nuxt-link-active {
  font-weight: bold;
} */

.user-menu .nav-item {
  margin-right: 0.8rem;
}

.user-menu .nav-item:last-child {
  margin-right: 0;
}

.user-menu .nav-item .group-class:not(.notification-class) {
  width: 35px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
}

.user-menu .nav-item .group-class:not(.notification-class)>i,
.user-menu .nav-item .group-class:not(.notification-class)>a>i {
  font-size: 1.4em;
  padding: 0;
}

.notification-class {
  background-color: red !important;
  color: white !important;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  width: auto;
  min-width: 17px;
  height: auto;
  min-height: 17px;
  border-radius: 45%;
  padding: 2px;
  box-sizing: border-box;
  position: absolute;
  top: -4px;
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
  width: 520px;
  max-width: 520px;
  min-width: 320px;
  max-height: 300px;
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 280px;
}

.notif-clickable {
  word-wrap: break-word;
  width: 100%;
  white-space: normal;
  overflow: hidden;
}

.row.p-2 {
  padding: 5px 10px;
}

.col-md-10 {
  width: 100%;
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

.dropdown-header {
  padding-left: 0px;
}

.search-li {
  padding: 0 !important;
  display: flex;
  align-items: center;
}

.dropdown-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 8px 12px;
  background-color: var(--background-color);
  /* this will adapt to light/dark */
}

.user-dropdown {
  max-height: none;
  display: none;
  flex-direction: column;
  overflow: hidden;
  /* Let Bootstrap handle display:none by default */
}

/* This is the key: Apply flex layout ONLY when the dropdown is shown */
.nav-item.dropdown.show .user-dropdown {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 420px;
  /* Hide overflow on the main flex container */
}

/* Style for the sticky header part */
.user-info-sticky {
  position: sticky;
  top: 0;
  background-color: var(--background-color);
  z-index: 10;
  flex-shrink: 0;
  padding: 8px 12px;
  border-bottom: 1px solid #ccc;
}

/* Style for the scrollable content area */
.dropdown-scrollable {
  overflow-y: auto;
  flex-grow: 1;
}

.dropdown-scrollable::-webkit-scrollbar {
  width: 8px;
  background-color: #f5f5f5;
}

.dropdown-scrollable::-webkit-scrollbar-thumb {
  background-color: #ff112d;
  border-radius: 4px;
}

.dropdown-scrollable::-webkit-scrollbar-thumb:hover {
  background-color: #e0001a !important;
}

@media only screen and (max-width: 500px) {
  .user-menu-container .user-menu .nav-item {
    margin-right: 8px !important;
    padding: 0 !important;
    display: flex;
    align-items: center;
    min-height: auto;
  }

  .user-menu-container .user-menu .nav-item .user-avatar,
  .user-menu-container .user-menu .nav-item .group-class:not(.notification-class) {
    width: 30px !important;
    height: 30px !important;
  }

  .user-menu-container .user-menu .nav-item .user-avatar>i,
  .user-menu-container .user-menu .nav-item .user-avatar>a>i,
  .user-menu-container .user-menu .nav-item .group-class:not(.notification-class)>i,
  .user-menu-container .user-menu .nav-item>a>.group-class:not(.notification-class)>i {
    font-size: 1em !important;
    padding: 0 !important;
  }

  .user-menu-container .user-menu .notification-item-container {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .user-menu-container .user-menu .notification-class {
    width: 15px !important;
    height: 15px !important;
    font-size: 8px !important;
    top: -2px !important;
    left: -6px !important;
  }

  .notification-class {
    width: auto;
    height: auto;
    min-width: 5px;
    min-height: 5px;
  }

  .user-menu-container .user-menu .nav-item>a:not(.dropdown-toggle) {
    font-size: 0.9rem;
  }
}

@media (max-width: 375px) {

  /* .navbar {

    flex-wrap: nowrap;

  }*/
  .user-menu .search-li {
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;
    max-width: 110px;
    margin-right: 5px !important;
  }

  .autocomp-container {
    display:inline-flex;
    width: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    min-width: 0;
  }

  .autocomplete-input.autocomplete-condensed {
    width: 100%;
  }

  .search-input-condensed {
    width: 100%;
    min-width: 40px;
    font-size: 0.75rem;
    padding: 0.2rem 0.3rem 0.2rem 25px;
    box-sizing: border-box; /* Ensures padding and border are included in the element's total width */
  }
}

</style>
