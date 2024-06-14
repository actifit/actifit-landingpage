<template>
  <div>
	<NavbarBrand />
	
	<div class="container pt-5 mt-5 pb-5" v-if="user">
	
		<h4 class="text-brand user-name">{{$t('Actifit')}} {{ $t('Settings') }}</h4>
		<h5 class="p-3 acti-headr">{{ $t('Posting_settings') }}</h5>
		<div class=" pb-3">
			{{ $t('Actifit_post_target') }}
			  <!--<div class="bchain-option btn col-12 m-2 p-2 row text-left">
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
			  </div>-->
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="checkbox" id="hive" value="Hive" ref="hive" checked="checked" disabled="disabled"><label for="hive">HIVE (Hive is always active)</label>
			  </div>

			  <div class="bchain-option btn col-12 m-2 p-2 row text-left" style="display:none">
				<input type="checkbox" id="steem" value="Steem" ref="steem" :checked="is_chain_enabled('STEEM')" @change="adjustCheckbox($event)" ><label for="steem">STEEM</label>
			  </div>

			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="checkbox" id="Blurt" value="Blurt" ref="blurt" :checked="is_chain_enabled('BLURT')" @change="adjustCheckbox($event)"><label for="blurt">BLURT</label>
			  </div>
			  
			<h5 class="p-3 acti-headr">{{ $t('Wallet_settings') }}</h5> 
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="checkbox" id="hide_small_balances" value="hide_small_balances" ref="hide_small_balances" :checked="hide_small_balances"><label for="hide_small_balances">{{$t('hide_small_balances_setting')}}</label>
			  </div>
			  <div class="bchain-option btn col-12 m-2 p-2 row text-left">
				<input type="checkbox" id="show_full_token_list" value="show_full_token_list" ref="show_full_token_list" :checked="show_full_token_list"><label for="show_full_token_list">{{$t('show_full_token_list_setting')}}</label>
			  </div>
			
			<h5 class="p-3 acti-headr">{{ $t('voting_settings') }}</h5>  
			
				<div class="bchain-option btn col-12 m-2 p-2 row text-left">
					<label for="default_vote_weight">{{$t('default_vote_weight')}}</label>
					<span><input class="form-control mb-2 col-1" type="number" ref="default_vote_weight" id="default_vote_weight" style="display: inline" min=0 max=100>&nbsp;%&nbsp;</span>
					<span class="text-brand">{{$t('vote_weight_settings_note')}}</span>
				</div>
				
			  
			<h5 class="p-3 acti-headr">{{ $t('post_chains_setting') }}</h5>
			<span class="text-brand" v-html="$t('posting_authority_desc')"></span>
			<div v-if="auth_loaded">
			  <div style="display:none">
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
		
		<h5 class="p-3 acti-headr" style="display: none">{{ $t('Active_hive_node') }}</h5>
		<div class="container pb-3" style="display: none">
			<div class="">
				{{$t('Active_hive_node')}}
				<select class="form-control form-control-lg mb-2 col-4" v-model="sel_node" :disabled="custom_node_active">
					<option v-for="(node, index) in hive_nodes" :key="index" v-if="node" :value="node">{{node}}</option>
				</select>
			</div>
			<div class="">
				<input type="checkbox" id="customNode" v-model="custom_node_active">
				<label for="customNode">{{$t('Custom_hive_node')}}</label>
				<input class="form-control form-control-lg mb-2 col-4" type="text" 
				v-model="custom_node" id="custom_node" :disabled="!custom_node_active">
			</div>
			<div class="">
				<input type="checkbox" id="testnet" :ref="testnet" v-model="testnet" :disabled="!custom_node_active">
				<label for="testnet">{{$t('Testnet')}}</label>
			</div>
			<div class="">
				<span >{{$t('Chain_id')}}</span>
				<input class="form-control form-control-lg mb-2 col-4" type="text" v-model="chain_id" id="chain_id" :disabled="!custom_node_active || !testnet">
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
			  <div id="notif_type_container" v-if="notif_active">
				  
				  <div class="notif-option btn col-12 ml-3 row text-left" v-for="(notif_tp, index) in notif_types" :notif_tp="notif_tp" :key="index" v-if="notif_tp">
					<input type="checkbox" :id="'sub_'+notif_tp.category" :ref="'sub_'+notif_tp.category" v-model="subset[notif_tp.category]">
					<label :for="'sub_'+notif_tp.category">{{notif_tp.name}}</label>
				  </div>
			  
			  </div>
		</div>
		<h5 class="p-3 acti-headr">{{ $t('Account_deletion') }}</h5>
		<div class=" pb-3">
			<div class="p-2">
				<div>{{$t('data_deletion_notice')}}</div>
				<button v-on:click="deleteAccount" class="btn btn-brand btn-lg">{{ $t('Delete_account') }}<i class="fas fa-spin fa-spinner text-white" v-if="delete_progress" ></i></button>
				
			</div>
		</div>
		<div class=" pb-3">
			<div class="text-center p-2">
				<button v-on:click="saveSettings" class="btn btn-brand btn-lg">{{ $t('Save_settings') }}<i class="fas fa-spin fa-spinner text-white" v-if="save_progress"></i></button>
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
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
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
			delete_progress: false,
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
			hive_nodes: [],
			sel_node: '',
			custom_node_active: false,
			custom_node: '',
			testnet: '',
			chain_id: '',
			hide_small_balances: false,
			show_full_token_list: false,
			default_vote_weight: 0,
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
	  is_chain_enabled(postChain){
		if (this.target_bchain == 'BOTH' || this.target_bchain == 'ALL' || this.target_bchain.includes(postChain)){
			return true;
		}
		return false;
	  },
	  adjustCheckbox(ev){
	    let parCont = this;
		this.$nextTick(() => {
		  console.log(ev)
		  parCont.target_bchain = 'HIVE|';
		  console.log(parCont.$refs['steem'].checked);
		  console.log(parCont.$refs['blurt'].checked);
		  if (parCont.$refs['steem'].checked){
			parCont.target_bchain += 'STEEM';
		  }
		  if (parCont.$refs['blurt'].checked){
			parCont.target_bchain += 'BLURT';
		  }
		  //parCont.target_bchain
	    })
	  },
	  checkit(param){
		//console.log('checkit'+param);
		this.notif_active = param;
		//console.log(this.notif_active);
		this.$forceUpdate();
	  },
	  async fetchSettings () {
		//console.log('fetch settings')
		//let's fetch all available notification types
		let quer = await fetch(process.env.actiAppUrl + 'notificationTypes/');
		
		this.notif_types = await quer.json();
		//console.log(this.notif_types);
		
		//also fetch available hive nodes
		let hiveNodes = await fetch(process.env.actiAppUrl + 'availableHiveNodes/');
		//console.log('hive nodes');
		//console.log(hiveNodes);
		let nodeDataContainer = await hiveNodes.json();
		try{
			this.hive_nodes = nodeDataContainer.hiveNodes;
		}catch(err){
		
		}
		//return;
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
					
					if (this.user_settings.hide_small_balances !== undefined){
						this.hide_small_balances = this.user_settings.hide_small_balances
					}
					
					if (this.user_settings.show_full_token_list !== undefined){
						this.show_full_token_list = this.user_settings.show_full_token_list
					}
					
					if (this.user_settings.default_vote_weight !== undefined){
						this.default_vote_weight = this.user_settings.default_vote_weight
						this.$refs['default_vote_weight'].value = this.default_vote_weight;
					}
					
					console.log('load new settings')
					console.log(this.hide_small_balances);
					console.log(this.show_full_token_list);
					
					//load proper node
					/*if (typeof this.user_settings.node_active !== 'undefined'){
						console.log('stored node data');
						console.log(this.user_settings.node_active.customNode);
						if (!this.user_settings.node_active.customNode){
							this.sel_node = this.user_settings.node_active.stdNode;
							this.custom_node_active = false;
						}else{
							this.custom_node_active = true;//this.user_settings.node_active.customNode;
							this.custom_node = this.user_settings.node_active.customNodeUrl;
							this.testnet = this.user_settings.node_active.isTestnet;
							this.chain_id = this.user_settings.node_active.chainId;
						}
					}*/
					
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
	  async processTrxFunc(op_name, cstm_params, bchain_option){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.ref_block_num) {
				console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			return new Promise((resolve) => {
				window.hive_keychain.requestBroadcast(
					this.user.account.name, 
					[[op_name, cstm_params]], 
					'Posting', (response) => {
					console.log(response);
					//resolve(response);
					resolve({success: response.success, txID: response.result.id})
				});
			});
		}else if (localStorage.getItem('acti_login_method') == 'hiveauth'){	
			return new Promise((resolve) => {
				const auth = {
				  username: this.user.account.name,
				  token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
				  expire: localStorage.getItem('expires'),
				  key: localStorage.getItem('key')
				}
				console.log(auth);
				this.$HAS.broadcast(auth, "posting", [[op_name, cstm_params]], (evt)=> {
					console.log(evt)    // process sign_wait message
					let msg = this.$t('verify_hiveauth_app');
					this.$notify({
					  group: 'warn',
					  text: msg,
					  duration: -1, //keep alive till clicked
					  position: 'top center'
					})
				})
				.then(response => {
					console.log(response);
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					if (response.cmd && response.cmd === 'sign_ack'){
						resolve({success: true, txID: response.data})
					}else if (response.cmd && response.cmd === 'sign_nack'){
						resolve({success: false})
					}
				} ) // transaction approved and successfully broadcasted
				.catch(err => {
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					console.log(err);
					resolve({success: false})
				} )
			});
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			console.log('broadcasting');
			console.log(operation);
			
			//console.log(this.$steemconnect.accessToken);
			//console.log(this.$store.state.accessToken);
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			let bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			
			if (bchain_option){
				bchain = bchain_option;
			}
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json+'&bchain='+bchain);

			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.error){
				console.log(outcome.error);
				
				//if this is authority error, means needs to be logged out
				//example "missing required posting authority:Missing Posting Authority"
				let err_msg = outcome.trx.tx.error;
				if (err_msg.includes('missing') && err_msg.includes('authority') && this.cur_bchain == bchain_option){
					//clear entry
					localStorage.removeItem('access_token');
					//this.$store.commit('setStdLoginUser', false);
					this.error_msg = this.$t('session_expired_login_again');
					this.$store.dispatch('steemconnect/logout');
				}
				
				this.$notify({
				  group: 'error',
				  text: err_msg,
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx};
			}
		}
	  },
	  async deleteAccount(){
		let proceed = confirm(this.$t('Delete_confirmation'));
		if (!proceed){
			return;
		}
		this.delete_progress = true;
		if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)||
				(localStorage.getItem('acti_login_method') == 'hiveauth')){
				//in case of keychain login, broadcast to chain
				//broadcast the transaction to Steem BC
				let cstm_params = {
					required_auths: [],
					required_posting_auths: [this.user.account.name],
					id: 'actifit-delete-acct',
					json: JSON.stringify(this.subset)
				  };
				
				let res = await this.processTrxFunc('custom_json', cstm_params);
				console.log('post call');
				console.log(res);
				
				if (res.success){
					//console.log(res.txID);
					let url = new URL(process.env.actiAppUrl + 'deleteAccountKeychain/'+res.txID+'/?user=' + this.user.account.name+'&approach=keychain&platform=web&operation='+JSON.stringify([['custom_json',cstm_params]]));
					
					let res2 = await fetch(url);
					let outcome = await res2.json();
					console.log(outcome);
					if (outcome.success){
						this.$notify({
						  group: 'success',
						  text: this.$t('account_deleted_successfully'),
						  position: 'top center'
						})
						this.$store.dispatch('steemconnect/logout');
					}else{
						this.$notify({
						  group: 'error',
						  text: this.$t('error'),
						  position: 'top center'
						})
					}
				}else{
					this.$notify({
					  group: 'error',
					  text: this.$t('error'),
					  position: 'top center'
					})
				}
				this.delete_progress = false;
			}else{
		
				let url = new URL(process.env.actiAppUrl + 'deleteAccount/?user=' + this.user.account.name+'&approach=keylogin&platform=web');
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
					  text: this.$t('account_deleted_successfully'),
					  position: 'top center'
					})
					this.$store.dispatch('steemconnect/logout');
				}else{
					this.$notify({
					  group: 'error',
					  text: this.$t('error'),
					  position: 'top center'
					})
				}
				this.delete_progress = false;
			}
	  },
	  async saveSettings () {
		this.save_progress = true;
		/*console.log(this.sel_node);
		console.log(this.testnet);
		console.log(this.chain_id);
		console.log(this.custom_node);
		console.log(this.custom_node_active);*/
		//return;
		try{
			if (!this.user_settings){
				this.user_settings = new Object();
				//this.user_settings.user = this.user.account.name;
			}
			
			/*
			if (this.custom_node_active){
				this.subset['node_active'] = {
					customNode: true,
					customNodeUrl: this.custom_node,
					isTestnet: this.testnet,
					chainId: this.chain_id
				}
			}else{
				this.subset['node_active'] = {
					stdNode: this.sel_node,
					customNode: false,
				}
			}*/
			/*console.log('new settings');
			console.log(this.$refs['hide_small_balances'].checked)
			console.log(this.hide_small_balances);
			console.log(this.$refs['show_full_token_list']);*/
			this.subset['hide_small_balances'] = this.$refs['hide_small_balances'].checked;
			this.subset['show_full_token_list'] = this.$refs['show_full_token_list'].checked;
			try{
				let voteVal = parseInt(this.$refs['default_vote_weight'].value);
				if (voteVal > 100) voteVal = 100;
				if (voteVal < 0) voteVal = 0;
				this.subset['default_vote_weight'] = this.$refs['default_vote_weight'].value;
			}catch(err){
				console.log(err)
			}
			//store node data
			/*if (typeof this.user_settings.node_active !== 'undefined'){
				if (!this.user_settings.node_active.customNode){
					this.sel_node = this.user_settings.node_active.stdNode;
					this.custom_node_active = false;
				}else{
					this.custom_node_active = true;
					this.custom_node = this.user_settings.node_active.customNodeUrl;
					this.testnet = this.user_settings.node_active.isTestnet;
					this.chain_id = this.user_settings.node_active.chainId;
				}
			}*/

			this.subset['post_target_bchain'] = this.target_bchain;
			this.subset['notifications_active'] = this.notif_active;
			
			if ((localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain)||
				(localStorage.getItem('acti_login_method') == 'hiveauth')){
				//in case of keychain login, broadcast to chain
				//broadcast the transaction to Steem BC
				let cstm_params = {
					required_auths: [],
					required_posting_auths: [this.user.account.name],
					id: 'actifit-settings',
					json: JSON.stringify(this.subset)
				  };
				
				let res = await this.processTrxFunc('custom_json', cstm_params);
				console.log('post call');
				console.log(res);
				
				if (res.success){
					//console.log(res.txID);
					let url = new URL(process.env.actiAppUrl + 'updateSettingsKeychain/'+res.txID+'/?user=' + this.user.account.name+'&operation='+JSON.stringify([['custom_json',cstm_params]]));
					
					let res2 = await fetch(url);
					let outcome = await res2.json();
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
				}else{
					this.$notify({
					  group: 'error',
					  text: this.$t('error'),
					  position: 'top center'
					})
				}
				
			}else{
			
			
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
			}
		}catch(save_err){
			console.log(save_err);
		}
		this.save_progress = false;
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