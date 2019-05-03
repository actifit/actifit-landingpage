<template>
  <div>
  <div>
	<a class="nav-link" :href="'/signup'" v-if="!user">{{ $t('Signup_Link') }}</a>
  </div>
  <UserMenu/>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import UserMenu from '~/components/UserMenu'

  export default {
    computed: {
      ...mapGetters('steemconnect', ['user']),
	},
	components: {
      UserMenu,
	}
  }
</script>