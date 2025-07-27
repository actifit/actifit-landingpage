<template>
  <!-- This component displays the wallet for the currently logged-in user -->
  <Wallet :username="loggedInUsername" />
</template>

<script>
import { mapGetters } from 'vuex';
// We import the main wallet view from its original location
import Wallet from '~/pages/_username/wallet.vue';

export default {
  // We must give this component a name to avoid conflicts
  name: 'MyWalletPage',
  middleware: 'auth-wallet',
  components: {
    Wallet,
  },

  computed: {
    // Get the logged-in user from the Vuex store
    ...mapGetters('steemconnect', ['user']),

    // A safe computed property to get the username
    loggedInUsername() {
      return this.user?.account?.name || null;
    },
  },

  // This is a guard. If the user is not logged in, we redirect them.
  watch: {
    user: {
      immediate: true, // Check immediately when the component loads
      handler(newUser) {
        if (!newUser) {
          // If user logs out or was never logged in, redirect to home.
          // You can also redirect to a login page.
          this.$router.push(this.localePath('/'));
        }
      }
    }
  }
};
</script>