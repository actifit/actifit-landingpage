<template>
  <div>
	<NavbarBrand />
	
	<div class="container pt-5 mt-5 pb-5" v-if="user">
	
		<h4 class="text-brand user-name">{{$t('Actifit')}} {{ $t('Settings') }}</h4>
		<h5 class="p-3 acti-headr">{{ $t('Posting_settings') }}</h5>
		<div class=" pb-3">
			{{ $t('Actifit_post_target') }}
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
				<img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;"  :class="adjustBothClass">
				<img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;"  :class="adjustBothClass">
				<img src="/img/BLURT.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;"  :class="adjustBothClass">
				<label for="hive_steem">HIVE + STEEM + BLURT</label>
			  </div>
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="radio" id="hive" value="HIVE" v-model="target_bchain">
				<img src="/img/HIVE.png" style="max-height: 50px;"  v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass">
				<label for="hive">HIVE ONLY</label>
			  </div>
			  
			<h5 class="p-3 acti-headr">{{ $t('post_chains_setting') }}</h5>
			<span class="text-brand" v-html="$t('posting_authority_desc')"></span>
			<div v-if="auth_loaded">
			  <div>
				<span><i class="fas fa-check text-success m-lg-3" v-if="this.posting_auth['steem']==true"></i>
				<i class="fas fa-times text-danger m-lg-3" v-else></i>
				<span class="font-weight-bold">{{$t('steem_posting_auth')}}</span><img src="/img/STEEM.png" style="max-height: 50px;"/></span>
				<div>
					<label for="steemActiveKey">{{$t('steem_active_key')}}</label>
					<input class="form-control form-control-lg mb-2 col-7" type="text" ref="steemActiveKey" id="steemActiveKey">
				</div>
				<button v-on:click="switchAuthority('steem')" class="btn btn-brand btn-lg"><span v-if="!this.posting_auth['steem']">{{ $t('give_posting_auth') }}</span><span v-else>{{ $t('revoke_posting_auth') }}</span> {{ $t('Steem') }}<i class="fas fa-spin fa-spinner text-white" v-if="process_running_steem"></i></button>
				<div v-if="steem_error_processing" class="text-brand">{{steem_error_processing}}</div>
			  </div>
			  <div>
				<span><i class="fas fa-check text-success m-lg-3" v-if="this.posting_auth['blurt']"></i>
				<i class="fas fa-times text-danger m-lg-3" v-else></i>
				<span class="font-weight-bold">{{$t('blurt_posting_auth')}}</span><img src="/img/BLURT.png" style="max-height: 50px;"/></span>
				<div>
					<label for="blurtActiveKey">{{$t('blurt_active_key')}}</label>
					<input class="form-control form-control-lg mb-2 col-7" type="text" ref="blurtActiveKey" id="blurtActiveKey">
				</div>
				<button v-on:click="switchAuthority('blurt')" class="btn btn-brand btn-lg"><span v-if="!this.posting_auth['blurt']">{{ $t('give_posting_auth') }}</span><span v-else>{{ $t('revoke_posting_auth') }}</span> {{ $t('Blurt') }}<i class="fas fa-spin fa-spinner text-white" v-if="process_running_blurt"></i></button>
				<div v-if="blurt_error_processing" class="text-brand">{{blurt_error_processing}}</div>
			  </div>
			</div>
		</div>
		
		<h5 class="p-3 acti-headr">{{ $t('Notification_settings') }}</h5>
		<div class=" pb-3">
					  
			  <div class="notif-option btn col-12 m-2 p-2 row text-left">
				<label v-on:click="checkit(true)">
					<input type="radio" id="notif_on" name="notif_status" value=true v-model="notif_active">
					Enabled
				</label>
				<label v-on:click="checkit(false)">
					<input type="radio" id="notif_off" name="notif_status" value=false v-model="notif_active">
					Disabled
				</label>
			  </div>
			  
			  <h6 v-if="notif_active == true">{{ $t('Notification_types') }}</h6>
			  <div id="notif_type_container" v-if="notif_active == true">
				  
				  <div class="notif-option btn col-12 ml-3 row text-left" v-for="(notif_tp, index) in notif_types" :notif_tp="notif_tp" :key="index" v-if="notif_tp">
					<input type="checkbox" :id="'sub_'+notif_tp.category" :ref="'sub_'+notif_tp.category" v-model="subset[notif_tp.category]">
					<label :for="'sub_'+notif_tp.category">{{notif_tp.name}}</label>
				  </div>
			  
			  </div>
		</div>
		<div class=" pb-3">
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
  import NavbarBrand from '~/components/NavbarBrand'
  import Footer from '~/components/Footer'
  
  import steem from 'steem'
  
  //import hive from '@hiveio/hive-js'
  
  import blurt from '@blurtfoundation/blurtjs'
  
  export default {
	components: {
	  NavbarBrand,
	  Footer
    },
	data () {
		return {
			target_bchain: 'BOTH',
			notif_active: false,
			save_progress: false,
			user_settings: [],
			notif_types: [],
			screenWidth: 1200,
			posting_auth: [],
			bchain_acct: [],
			subset: {},
			process_running_steem: false,
			process_running_blurt: false,
			steem_error_processing: '',
			blurt_error_processing: '',
			auth_loaded: false,
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
	  checkit(param){
		//console.log('checkit'+param);
		this.notif_active = param;
		//console.log(this.notif_active);
		this.$forceUpdate();
	  },
	  async fetchSettings () {
		//let's fetch all available notification types
		let quer = await fetch(process.env.actiAppUrl + 'notificationTypes/');
		
		this.notif_types = await quer.json();
		//console.log(this.notif_types);
		if (this.user){
			this.$store.dispatch('fetchUserTokens')
			this.$store.dispatch('fetchUserRank')
			try{
				let res = await fetch(process.env.actiAppUrl + 'userSettings/' + this.user.account.name);
				let set_res = await res.json();
				this.user_settings = set_res.settings;
				//console.log(this.user_settings);
				if (this.user_settings){
					if (this.user_settings.post_target_bchain){
						this.target_bchain = this.user_settings.post_target_bchain;
					}
					if (typeof this.user_settings.notifications_active !== 'undefined'){
						this.notif_active = this.user_settings.notifications_active;
					}
					try{
					for (let i=0;i<this.notif_types.length;i++){
						//console.log(i);
						(this.user_settings[this.notif_types[i].category]&&this.$refs['sub_'+this.notif_types[i].category])?this.$refs['sub_'+this.notif_types[i].category].checked = this.user_settings[this.notif_types[i].category]:'';
						this.subset[this.notif_types[i].category] = this.user_settings[this.notif_types[i].category];
						//console.log(this.subset);
					}
					}catch(err){
						console.log(err);
					}
					//console.log(this.subset);
					//update for proper visual rendering
					this.$forceUpdate();
					
				}
				//console.log(res);
			}catch(err){
				console.log(err);
			}
			
			steem.api.setOptions({ url: process.env.steemApiNode });
			blurt.api.setOptions({ url: process.env.blurtApiNode });
			steem.name = 'steem';
			await this.setPostingAuthStatus(steem);
			blurt.name = 'blurt';
			await this.setPostingAuthStatus(blurt);
			this.auth_loaded = true;
		}
	  },
	  async switchAuthority (chainName){
		let chain = steem;
		if (chainName == 'blurt'){
			chain = blurt;
			this.process_running_blurt = true;
		}else{
			this.process_running_steem = true;
		}
		
	    //make sure user input active key
		this.steem_error_processing = '';
		this.blurt_error_processing = '';
		if (this.$refs[chain.name+'ActiveKey'].value == ''){//
		  if (chain.name == 'steem'){
			this.steem_error_processing = this.$t('Error_provide_active_key');
		  }else{
			this.blurt_error_processing = this.$t('Error_provide_active_key');
		  }
		  this.process_running_blurt = false;
		  this.process_running_steem = false;
		  return;
		}
		console.log(this.bchain_acct);
		let tgtAcct = this.bchain_acct[chain.name];
		let pActKey = this.$refs[chain.name+'ActiveKey'].value;
		//let fetchAcct = await blurt.api.getAccountsAsync([tgtAcct]);
		let activeAuth;
		let ownAuth;
		console.log(this.bchain_acct[chain.name]);
		let postingAuth = this.bchain_acct[chain.name].posting;
		
		let newAccount = 'actifit';
		let updateAcct = false;
		//only add actifit if it does not exist
		if (!this.posting_auth[chain.name]){
			postingAuth.account_auths.push([newAccount,parseInt(postingAuth.weight_threshold)]);
			postingAuth.account_auths.sort();
			updateAcct = true;
			
		}else{
			//in this case, remove posting authority
			const checkAuth = postingAuth.account_auths;
			for (let i = 0,len = checkAuth.length; i<len; i++) {
				if (checkAuth[i][0]=="actifit") {
					//remove item
					postingAuth.account_auths.splice(i, 1);
					updateAcct = true
					break;
				}
			}
		}
		if (updateAcct){
			let success = false;
			//pActKey, tgtAcct, ownAuth, activeAuth, postingAuth, fetchAcct[0].memo_key, fetchAcct[0].json_metadata
			if (chain.name == 'blurt'){
				let res = await chain.broadcast.accountUpdateAsync(pActKey, tgtAcct.name, ownAuth, activeAuth, postingAuth, tgtAcct.memo_key, tgtAcct.json_metadata, tgtAcct.posting_json_metadata, null);
				console.log(res);
				if (res && res.ref_block_num){
					success = true;
				}
			}else{
				let res = await chain.broadcast.accountUpdateAsync(pActKey, tgtAcct.name, ownAuth, activeAuth, postingAuth, tgtAcct.memo_key, tgtAcct.json_metadata);
				console.log(res);
				if (res && res.ref_block_num){
					success = true;
				}
			}
			if (success){
				this.posting_auth[chain.name] = !this.posting_auth[chain.name];
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
		}
		this.process_running_blurt = false;
		this.process_running_steem = false;
	  },
	  async setPostingAuthStatus (chain){
		//check if user gave actifit posting authority
		let relAcct = await chain.api.getAccountsAsync([this.user.account.name]);
		if (Array.isArray(relAcct) && relAcct.length > 0){
			this.bchain_acct[chain.name] = relAcct[0];
			console.log(chain.name);
			//console.log(relAcct[0]);
			const checkAuth = relAcct[0].posting.account_auths;
			let arrayindex = -1;
			for (let i = 0,len = checkAuth.length; i<len; i++) {
				if (checkAuth[i][0]=="actifit") {
					arrayindex = i
				}
			}
			if (arrayindex>=0){
				this.posting_auth[chain.name] = true;
			}else{
				this.posting_auth[chain.name] = false;
			}
			console.log('posting auth');
			console.log(this.posting_auth);
		}
	  },
	  async saveSettings () {
		this.save_progress = true;
		try{
			if (!this.user_settings){
				this.user_settings = new Object();
				//this.user_settings.user = this.user.account.name;
			}

			this.subset['post_target_bchain'] = this.target_bchain;
			this.subset['notifications_active'] = this.notif_active;
			
			let url = new URL(process.env.actiAppUrl + 'updateSettings/?user=' + this.user.account.name+'&settings='+JSON.stringify(this.subset));
			//console.log(url);

			let accToken = localStorage.getItem('access_token')
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			//console.log(outcome);
			
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
<style>
	.acti-headr{
		background: radial-gradient(transparent, red);
		color: white;
	}
</style>