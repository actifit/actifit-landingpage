<template>
  <div>
    <NavbarBrand /> 
      <div class="loading-container">
        <div class="text-center" v-if="loading">
          <i class="fas fa-spinner fa-spin text-brand"></i>
        </div>
      </div>
    <Footer />
  </div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import Footer from '~/components/Footer'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      loading: true
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user'])
  },
  methods: {
    checkLoginStatus() {
      if (process.client) {
        if (this.user && this.user.account) {
          this.$router.replace(`/${this.user.account.name}`);
        } else if (!this.user) {
          this.$router.replace('/login');
        }
        this.loading = false; // set loading to false after checking login status
      }
    }
  },
  watch: {
    user(newUser) {
      if (process.client) {
        this.checkLoginStatus();
      }
    }
  },
  components: {
	  NavbarBrand,
	  Footer,
  },
  created() {
    if (process.client) {
      this.$store.dispatch('steemconnect/login').then(() => {
        this.checkLoginStatus();
      }).catch(() => {
        this.checkLoginStatus();
      });
    }
  }
}
</script>

<style>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
