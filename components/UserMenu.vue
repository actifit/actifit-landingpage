<template>
  <!-- login link or user dropdown menu when logged in, for navbar-->
  <div class="ml-auto">
    <ul class="navbar-nav ml-auto user-menu">
      <li class="nav-item" v-if="!user">
        <a class="nav-link" :href="$steemconnect.getLoginURL().replace('v2.','')">Login</a>
      </li>
      <li class="nav-item d-none d-sm-block" v-if="user">
        <span class="navbar-text py-0">Balance:<br><b>{{ formattedUserTokens }}</b></span>
      </li>
      <li class="nav-item dropdown" v-if="user">
        <a class="nav-link dropdown-toggle py-0" href="#" data-toggle="dropdown">
          <div class="user-avatar" :style="'background-image: url(https://steemitimages.com/u/' + user.account.name + '/avatar)'"></div>
        </a>
        <div class="dropdown-menu dropdown-menu-right">
          <h6 class="dropdown-header text-center">@{{ user.account.name }}</h6>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet')">Wallet</a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/activity/' + user.account.name)">Activity</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="$store.dispatch('steemconnect/logout')">Logout</a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['userTokens']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2) + ' AFIT'
      }
    }
  }
</script>

<style lang="sass">
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
</style>
