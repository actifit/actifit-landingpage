<template>
  <!-- login link or user dropdown menu when logged in, for navbar-->
  <div class="user-menu-container ml-auto position-absolute d-flex align-items-center">
    <ul class="navbar-nav mr-auto user-menu flex-row">
	  <li class="nav-item" v-if="!user">
		<a :href="'/signup'" >{{ $t('Signup_Link') }}</a> | <a :href="$steemconnect.getLoginURL()" >{{ $t('Login') }}</a>
	  </li>
	  <li class="nav-item mr-2" v-if="user" >
        <span class="navbar-text py-0" style="color:#ff112d">{{ $t('Rank') }}&nbsp;<br><b>{{ displayUserRank }}</b></span>
      </li>
      <li class="nav-item mr-2" v-if="user">
        <span class="navbar-text py-0">{{ $t('Balance') }}<br><b>{{ formattedUserTokens }}</b></span>
      </li>
      <li class="nav-item dropdown" v-if="user">
        <a class="nav-link dropdown-toggle p-0" id="user_menu_navlink" href="#" data-toggle="dropdown">
          <div class="user-avatar" :style="'background-image: url(https://steemitimages.com/u/' + user.account.name + '/avatar)'"></div>
        </a>
        <div class="dropdown-menu dropdown-menu-right">
          <h6 class="dropdown-header text-center">@{{ user.account.name }}</h6>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/' + user.account.name)">{{ $t('My_Profile') }}<br/></a>
		  <a class="dropdown-item" href="#" @click.prevent="">{{ $t('My_Rank') }} <br/><span class="text-brand"> {{ displayUserRank }} </span></a>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/wallet')">{{ $t('My_Wallet') }} <br/><span class="text-brand">  {{ formattedUserTokens }}</span></a>
		  <a class="dropdown-item" href="#" @click.prevent="$router.push('/referrals')">{{ $t('My_Referrals') }} <br/><span class="text-brand"> {{ referralCount }} </span></a>
          <a class="dropdown-item" href="#" @click.prevent="$router.push('/activity/' + user.account.name)">{{ $t('My_Activity') }}</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" @click.prevent="$store.dispatch('steemconnect/logout')">{{ $t('Logout') }}</a>
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
      ...mapGetters(['userTokens', 'userRank', 'referrals']),
      formattedUserTokens () {
        return parseFloat(this.userTokens).toFixed(2) + ' AFIT'
      },
	  displayUserRank () {
		return parseFloat(this.userRank).toFixed(1)
	  },
	  referralCount () {
	    return this.referrals.length;
	  }
    }
  }
</script>

<style lang="sass">
.user-menu-container
  height: 54px
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
	#user_menu_navlink{
		height: 40px;
	}
</style>
