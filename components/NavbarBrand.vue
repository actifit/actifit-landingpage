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

          <li class="nav-item btn btn-brand m-1 nav-item-border" v-if="!home" :title="$t('Home')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/')">
              <i class="fas fa-home text-white"></i>
              <span>{{ $t('Home') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Activity')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/activity')">
              <i class="fas fa-running text-white"></i><span>{{ $t('Activity') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Market')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/market')">
              <i class="fas fa-shopping-cart text-white"></i><span>{{ $t('Market') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('yield_farming')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/yieldfarming')">
              <i class="fas fa-seedling text-white"></i><span>{{ $t('yield_farming') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" v-if="home" :title="$t('News')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$emit('scrollTo', '#news')">
              <i class="far fa-newspaper text-white"></i><span>{{ $t('News') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Refer_A_Friend')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/referrals')">
              <i class="fas fa-user-friends text-white"></i><span>{{ $t('Refer_A_Friend') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Communities')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/communities')">
              <i class="fas fa-users text-white"></i><span>{{ $t('Communities') }}</span>
            </a>
          </li>

          <li class="nav-item btn btn-brand m-1 nav-item-border" :title="$t('Explore')">
            <a class="nav-link text-white d-flex align-items-center justify-content-center w-100 h-100"
               href="#"
               data-toggle="collapse" data-target="#navbarSupportedContent"
               @click.prevent="$router.push('/explore')">
              <i class="fa-brands fa-hive text-white"></i><span>{{ $t('Explore') }}</span>
            </a>
          </li>

        </ul>
      </div>
      <UserMenu @modal-opened="handleModalOpened" />
    </nav>
    <LoginModal v-if="isModalOpen" @close="handleModalOpened(false)" @login-successful="handleLoginSuccessful" />
  </div>
</template>

<script>
// ... (your script remains the same) ...
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
// ... (your SASS styles remain the same) ...
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

.notification-item span {
  color: var(--notif-text-color);
}

.navbar-nav .nav-item a span {
  display: none;
}

.navbar-collapse .navbar-nav .nav-item.btn > .nav-link {
  padding: 0.5rem 0.75rem; 
  width: 100%; 
  height: 100%; 
  display: flex;
  align-items: center;
  justify-content: center; 
  text-decoration: none !important; /* Added !important just in case, but better to resolve specificity */
}

.navbar-collapse .navbar-nav .nav-item.btn > .nav-link i {
  font-size: 1.2em; 
}
</style>