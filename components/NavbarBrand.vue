<template>
  <!-- navbar links with smooth scrolling to sections -->
  <div>
    <nav class="navbar fixed-top navbar-expand-lg navbar-light px-1">
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <!--<li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#content')">{{ $t('What_is_actifit') }}</a>
          </li>-->
          <li class="nav-item btn btn-brand m-1 nav-item-border" v-if="!home" :title="$t('Home')">
            <div style="display:inline-flex"><a class="nav-link text-white"
                href="#" @click.prevent="$router.push('/')"><i class="fas fa-home text-white"></i><span>{{ $t('Home') }}</span></a></div>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Activity')">
            <div style="display:inline-flex"><a class="nav-link text-white"
                href="#" @click.prevent="$router.push('/activity')"><i class="fas fa-running text-white"></i><span>{{ $t('Activity') }}</span></a></div>
          </li>
          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Market')"><!-- item-highlight-->
            <div style="display:inline-flex"><a
                class="nav-link text-white" href="#" @click.prevent="$router.push('/market')"><i class="fas fa-shopping-cart text-white"></i><span>{{ $t('Market') }}</span></a>
            </div>
          </li>
          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('yield_farming')">
            <div style="display:inline-flex"><a class="nav-link text-white"
                href="#" @click.prevent="$router.push('/yieldfarming')"><i class="fas fa-seedling text-white"></i><span>{{ $t('yield_farming') }}</span></a></div>
          </li>

          <!--<li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="fas fa-heart text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#delegators')">{{ $t('Delegators') }}</a></div>
          </li>
		  <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#professionals')">{{ $t('Professionals') }}</a>
          </li>
		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="fas fa-medal text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#leaderboard')">{{ $t('Leaderboard') }}</a></div>
          </li>
          <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="fas fa-users text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#team')">{{ $t('Team') }}</a></div>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="#" @click.prevent="scrollTo('#athletes')">{{ $t('Sponsored_Athletes') }}</a>
          </li>

		  <li class="nav-item btn btn-brand m-1 p-1 nav-item-border" v-if="home">
            <div style="display:inline-flex"><i class="far fa-handshake text-white"></i><a class="nav-link text-white" href="#" @click.prevent="$emit('scrollTo', '#partners')">{{ $t('Partners') }}</a></div>
          </li>-->

          <li class="nav-item btn btn-brand m-1 nav-item-border" v-if="home" :title="$t('News')">
            <div style="display:inline-flex"><a class="nav-link text-white"
                href="#" @click.prevent="$emit('scrollTo', '#news')"><i class="far fa-newspaper text-white"></i><span>{{ $t('News') }}</span></a></div>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Refer_A_Friend')">
            <div style="display:inline-flex"><a
                class="nav-link text-white" href="#" @click.prevent="$router.push('/referrals')"><i class="fas fa-user-friends text-white"></i><span>{{ $t('Refer_A_Friend')
                }}</span></a></div>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Communities')">
            <div style="display:inline-flex"><a class="nav-link text-white"
                href="/communities"><i class="fas fa-users text-white"></i><span>{{ $t('Communities') }}</span></a></div>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Explore')">
            <div style="display:inline-flex">
              <!--<i class="fas fa-search text-white"></i>-->
              <a class="nav-link text-white" href="/explore"><i class="fa-brands fa-hive text-white"></i><span>{{
                $t('Explore') }}</span></a>
            </div>
          </li>

        </ul>

      </div>
      <UserMenu @modal-opened="handleModalOpened" />
    </nav>
    <LoginModal v-if="isModalOpen" @close="handleModalOpened(false)" @login-successful="handleLoginSuccessful" />
  </div>

</template>
<script>

import UserMenu from '~/components/UserMenu';
import LoginModal from '~/components/LoginModal';

export default {
  data() {
    return {
      isModalOpen: false,
    }
  },
  props: ['home'],
  components: {
    UserMenu,
    LoginModal,
  },
  async mounted() {
    console.log('navbar mounted');
  },
  methods: {
    handleModalOpened(isOpen) {
      this.isModalOpen = isOpen;
    },
    handleLoginSuccessful() {
      this.$emit('user-switched');
      this.handleModalOpened(false);
      this.$store.dispatch('steemconnect/refreshUser');
    }
  }

}
</script>

<style lang="sass">
  .navbar-brand
    img
      width: 40px
    h1
      font-size: 14px
    h3
      font-size: 12px
</style>
<style>
.nav-item-border {
  opacity: 0.9;
  background-color: #ff112d;
  border: 1px solid #ff112d;
  border-radius: 3px;
}

.navbar-nav .nav-item a span{
  display: none;
}
</style>
