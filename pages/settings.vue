<template>
  <div>
	<!-- navbar -->
    <nav class="navbar fixed-top navbar-expand navbar-light">
      <ul class="navbar-nav d-none d-sm-block">
        <li class="nav-item">
          <!-- home link -->
          <a class="nav-link" href="#" @click.prevent="$router.push('/')">
            <i class="fas fa-arrow-left text-brand navbar-back"></i>
          </a>
        </li>
      </ul>
      <NavbarBrand />
      <UserMenu />
    </nav>
	
	<div class="container pt-5 mt-5 pb-5" v-if="user">
	
		<h4 class="text-brand user-name">{{$t('Actifit')}} {{ $t('Settings') }}</h4>
		<h5>{{ $t('Posting_settings') }}</h5>
		<div class=" pb-3">
			{{ $t('Actifit_post_target') }}
			
			  
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
				<img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;"  :class="adjustBothClass">
				<img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;"  :class="adjustBothClass">
				<label for="hive_steem">HIVE + STEEM</label>
			  </div>
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="radio" id="hive" value="HIVE" v-model="target_bchain">
				<img src="/img/HIVE.png" style="max-height: 50px;"  v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass">
				<label for="hive">HIVE ONLY</label>
			  </div>
			
			<div class="text-center p-2">
				<button v-on:click="saveSettings" class="btn btn-brand btn-lg">{{ $t('Save') }}<i class="fas fa-spin fa-spinner text-white" v-if="save_progress"></i></button>
			</div>
		</div>
	</div>
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-else>
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    {{ $t('login_required') }}
		  </div>
		</div>
		<div class="row pb-3">
		  <div class="w-50">
			<a href="/login" class="btn btn-brand btn-lg w-75">{{ $t('Login') }}</a>
		  </div>
		  <div class="w-50">
			<a href="/signup" class="btn btn-brand btn-lg w-75">{{ $t('Sign_Up') }}</a>
		  </div>
		</div>
	  </div>
	</div>
	
	<Footer />
	<no-ssr>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </no-ssr>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import UserMenu from '~/components/UserMenu'
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  
  export default {
	components: {
	  NavbarBrand,
	  UserMenu,
	  Footer
    },
	data () {
		return {
			target_bchain: 'BOTH',
			save_progress: false,
			user_settings: [],
			screenWidth: 1200,
		}
	},
	watch: {
	  user: 'fetchSettings'
	},
    computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters(['userTokens', 'userRank', 'userRankObj', 'referrals']),
	  adjustHiveClass () {
		if (this.target_bchain != 'HIVE'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustBothClass () {
		if (this.target_bchain != 'BOTH'){
			return 'option-opaque';
		}
		return '';
	  },
	  smallScreenClasses () {
		//use proper classes for neat display
		if (this.screenWidth < 768){
		  return "w-100";
		}
		return "w-50";
	  },
	},
	methods: {
	  async fetchSettings () {
		if (this.user){
			this.$store.dispatch('fetchUserTokens')
			this.$store.dispatch('fetchUserRank')
			try{
				let res = await fetch(process.env.actiAppUrl + 'userSettings/' + this.user.account.name);
				let set_res = await res.json();
				console.log(this.user_settings);
				this.user_settings = set_res.settings;
				if (this.user_settings && this.user_settings.post_target_bchain){
					this.target_bchain = this.user_settings.post_target_bchain;
				}
				//console.log(res);
			}catch(err){
				console.log(err);
			}
		}
	  },
	  async saveSettings () {
		this.save_progress = true;
		try{
			if (!this.user_settings){
				this.user_settings = new Object();
				//this.user_settings.user = this.user.account.name;
			}
			this.user_settings.post_target_bchain = this.target_bchain;
			console.log(this.user_settings);
			let url = new URL(process.env.actiAppUrl + 'updateSettings/?user=' + this.user.account.name+'&settings='+JSON.stringify({post_target_bchain: this.target_bchain}));
			
			let accToken = localStorage.getItem('access_token')
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			
			if (outcome.success){
				this.$notify({
				  group: 'success',
				  text: this.$t('successfully_updated_settings'),
				  position: 'top center'
				})
			}else{
				this.$notify({
				  group: 'error',
				  text: this.$t('error'),
				  position: 'top center'
				})
			}
			this.save_progress = false;
		}catch(save_err){
			console.log(save_err);
			this.save_progress = false;
		}
	  }
	},
	async mounted () {
		this.screenWidth = screen.width;
		this.$store.dispatch('steemconnect/login')
		this.fetchSettings();
	}
  }
</script>