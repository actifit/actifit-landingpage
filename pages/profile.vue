<template>

    <!-- a text for the user whie it checks if logged in or not-->
      <div class="loading-indicator">
        Checking login status (^^)
      </div>
  
  
    </template>
    
    <script>
    import { mapGetters } from 'vuex'
    
    export default {
      computed: {
        ...mapGetters('steemconnect', ['user'])
      },
      methods: {
        checkLoginStatus() {
          if (process.client) {  // ensuring this code runs only on the client side so the check works
            console.log('Checking login status:', this.user);
            if (this.user && this.user.account) {
              // if user is logged in, redirect to their /username (their username)
              this.$router.replace(`/${this.user.account.name}`);
            } else if(!this.user){
              // if user is not logged in, redirect to /login
              this.$router.replace('/login');
            }
          }
        }
      },
      watch: {
        user(newUser) {
          if (process.client) { 
            console.log('User state changed:', newUser);
            this.checkLoginStatus();
          }
        }
      },
      created() {
        if (process.client) {  
          this.$store.dispatch('steemconnect/login').then(() => {
            console.log('Login action resolved');
            this.checkLoginStatus();
          }).catch(() => {
            console.log('Login action rejected');
            this.checkLoginStatus();
          });
        }
      }
    }
    </script>
    
    <style>
    .loading-indicator {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 1.5em;
      font-weight: bold;
    }
    </style>
  
  