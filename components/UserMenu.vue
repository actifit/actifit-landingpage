<template>
  <ul class="navbar-nav ml-auto user-menu">
    <li class="nav-item" v-if="!user">
      <a class="nav-link" :href="$steemconnect.getLoginURL()">Login</a>
    </li>
    <li class="nav-item dropdown" v-if="user">
      <a class="nav-link dropdown-toggle py-0" href="#" data-toggle="dropdown">
        <div class="user-avatar" :style="'background-image: url(https://steemitimages.com/u/' + user.account.name + '/avatar)'"></div>
      </a>
      <div class="dropdown-menu dropdown-menu-right">
        <a class="dropdown-item" href="#">Wallet</a>
        <a class="dropdown-item" href="#">Activity</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#" @click.prevent="$store.dispatch('logout')">Logout</a>
      </div>
    </li>
  </ul>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapGetters(['user'])
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
    .dropdown-toggle::after
      display: none
</style>
