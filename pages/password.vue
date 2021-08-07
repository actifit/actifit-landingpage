<template>
  <div>
	<NavbarBrand />
	
	<div class="container pt-5 mt-5 pb-5" v-if="user">
	
		<h4 class="text-center user-name">{{ $t('Password_management') }}</h4>
		<div class=" pb-3">
			<div class="row">
				<label for="passfetchdata" class="font-weight-bold col-3">{{ $t('Your_pass') }} {{ cur_bchain}} <img :src="'/img/'+cur_bchain+'.png'" style="max-height: 50px;"></label>
				<input class="form-control form-control-lg mb-2 col-7" ref="passfetchdata" id="passfetchdata" />
			</div>
			<button v-on:click="fetchKeys" class="btn btn-brand btn-lg">{{ $t('Fetch_keys') }}<i class="fas fa-spin fa-spinner text-white" v-if="fetchingPass"></i></button>
			<div class="text-brand" v-if="errorFetch">{{ errorFetch }}</div>
			<div class="form-group">
			  <div class="font-italic mb-2">{{ $t('Posting_key_desc') }}</div>
			  <div class="row">
				  <label for="ppostkey" class="font-weight-bold col-3">{{ $t('Private_posting_key') }}</label>
				  <input class="form-control form-control-lg mb-2 col-7" ref="ppostkey" id="ppostkey" :value="privatePostKey" readonly/>
				  <button v-on:click="copyContent" data-targetEl="ppostkey" class="btn btn-brand btn-lg w-20 mb-2 ml-1">{{ $t('Copy') }}</button><br/><br/>
			  </div>
			  <div class="font-italic mb-2">{{ $t('Active_key_desc') }}</div>
			  <div class="row">
				  <label for="pactkey" class="font-weight-bold col-3">{{ $t('Private_active_key') }}</label>
				  <input class="form-control form-control-lg mb-2 col-7" ref="pactkey" id="pactkey" :value="privateActKey" readonly/>
				  <button v-on:click="copyContent" data-targetEl="pactkey" class="btn btn-brand btn-lg w-20  mb-2 ml-1">{{ $t('Copy') }}</button><br/><br/>
			  </div>
			  <div class="font-italic mb-2">{{ $t('Owner_key_desc') }}</div>
			  <div class="row">
				 
				  <label for="pownkey" class="font-weight-bold col-3">{{ $t('Private_owner_key') }}</label>
				  <input class="form-control form-control-lg mb-2 col-7" ref="pownkey" id="pownkey" :value="privateOwnKey" readonly/>
				  <button v-on:click="copyContent" data-targetEl="pownkey" class="btn btn-brand btn-lg w-20  mb-2 ml-1">{{ $t('Copy') }}</button><br/><br/>
			  </div>
			  <div class="font-italic mb-2">{{ $t('Memo_key_desc') }}</div>
			  <div class="row">
				  <label for="pmemokey" class="font-weight-bold col-3">{{ $t('Private_memo_key') }}</label>
				  <input class="form-control form-control-lg mb-2 col-7" ref="pmemokey" id="pmemokey" :value="privateMemoKey" readonly/>
				  <button v-on:click="copyContent" data-targetEl="pmemokey" class="btn btn-brand btn-lg w-20  mb-2 ml-1">{{ $t('Copy') }}</button><br/><br/>
			  </div>
			</div>
			
			<h5>{{ $t('Change_recovery_account') }}</h5>
			
			<div>{{ $t('Change_recovery_account_desc') }}</div>
			
			<div class="row">
				<label for="curRecoveryAccount" class="font-weight-bold col-3">{{ $t('Current_recovery_account') }}</label>
				<input class="form-control form-control-lg mb-2 col-7" ref="curRecoveryAccount" id="curRecoveryAccount" :value="user.account.recovery_account" readonly/>
			</div>
			<div class="row">
				<label for="newRecoveryAccount" class="font-weight-bold col-3">{{ $t('New_recovery_account') }}</label>
				<input class="form-control form-control-lg mb-2 col-7" ref="newRecoveryAccount" id="newRecoveryAccount" />
			</div>
			<div class="row">
				<label for="ownKey" class="font-weight-bold col-3">{{ $t('Private_owner_key') }}</label>
				<input class="form-control form-control-lg mb-2 col-7" ref="ownKey" id="ownKey"/>
			</div>
			<button v-on:click="changeRecoveryAccount" class="btn btn-brand btn-lg">
				{{ $t('Change_recovery_account') }}
				<i class="fas fa-spin fa-spinner text-white" v-if="updatingRecovery"></i>
			</button><br/>
			<div class="text-brand" v-if="errorUpdateRecovery">{{ errorUpdateRecovery }}</div>
			
			<h5>{{ $t('Change_password') }}</h5>
			
			
			<div>{{ $t('Change_password_desc') }}</div>
			<div class="row">
				<div class="font-weight-bold pb-3 col-3">{{ $t('Apply_pass_change_to') }}</div>
				<div class="bchain-option btn ml-2 p-2 row text-left">
					<input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
					<img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;" :class="adjustBothClass">
					<img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px;" :class="adjustBothClass">
					<label for="hive_steem">HIVE + STEEM</label>
				</div>
				<div class="bchain-option btn ml-2 p-2 row text-left" v-if="cur_bchain=='HIVE'">
					<input type="radio" id="hive" value="HIVE" v-model="target_bchain">
					<img src="/img/HIVE.png" style="max-height: 50px;"  v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass">
					<label for="hive">HIVE ONLY</label>
				</div>
				<div class="bchain-option btn ml-2 p-2 row text-left" v-else-if="cur_bchain=='STEEM'">
					<input type="radio" id="steem" value="STEEM" v-model="target_bchain">
					<img src="/img/STEEM.png" style="max-height: 50px;"  v-on:click="target_bchain = 'STEEM'" :class="adjustSteemClass">
					<label for="steem">STEEM ONLY</label>
				</div>
			</div>
			<div class="row">
				<label for="passchangedata" class="font-weight-bold col-3">{{ $t('Your_current_pass') }} {{ cur_bchain}} <img :src="'/img/'+cur_bchain+'.png'" style="max-height: 50px;"></label>
				<input class="form-control form-control-lg mb-2 col-7" ref="passchangedata" id="passchangedata" />
				<button v-on:click="verifyPassByChain($refs['passchangedata'].value, cur_bchain, 1)" data-targetEl="newAcctPwdField" class="btn btn-brand btn-lg w-20 mb-2 ml-1">{{ $t('Verify') }}</button>
				<div><i class="fas fa-spin fa-spinner text-brand m-lg-3" v-if="validatingA"></i>
				<i class="fas fa-check text-success m-lg-3" v-if="passAValid"></i>
				<i class="fas fa-times text-danger m-lg-3" v-else></i>
				</div>
			</div>
			
			<div class="row" v-if="target_bchain == 'BOTH'">
				<label for="passchangedataother" class="font-weight-bold col-3">{{ $t('Your_current_pass') }} {{ (cur_bchain=='HIVE'?'STEEM':'HIVE')}} <img :src="'/img/'+(cur_bchain=='HIVE'?'STEEM':'HIVE')+'.png'" style="max-height: 50px;"></label>
				<input class="form-control form-control-lg mb-2 col-7" ref="passchangedataother" id="passchangedataother" />
				<button v-on:click="verifyPassByChain($refs['passchangedataother'].value, (cur_bchain=='HIVE'?'STEEM':'HIVE'), 2)" data-targetEl="newAcctPwdField" class="btn btn-brand btn-lg w-20 mb-2 ml-1">{{ $t('Verify') }}</button>
				<div><i class="fas fa-spin fa-spinner text-brand m-lg-3" v-if="validatingB"></i>
				<i class="fas fa-check text-success m-lg-3" v-if="passBValid"></i>
				<i class="fas fa-times text-danger m-lg-3" v-else></i>
				</div>
			</div>
			
			<button v-on:click="setPasswordVal" class="btn btn-brand btn-lg w-20 mb-2">{{ $t('Generate_New_Password') }}</button>
			
			<div class="row">
				<label for="newAcctPwdField" class="font-weight-bold col-3">{{ $t('Your_new_pass') }}</label>
				<input class="form-control form-control-lg mb-2 col-7" ref="newAcctPwdField" id="newAcctPwdField" :value="newAcctPwd"/>
				<button v-on:click="copyContent" data-targetEl="newAcctPwdField" class="btn btn-brand btn-lg w-20 mb-2 ml-1">{{ $t('Copy_Password') }}</button><br/><br/>
			</div>
			<div class="row">
				<label for="acctPssConfirmField" class="font-weight-bold col-3">{{ $t('confirm_password_copy') }}</label><br/>
				<input class="form-control form-control-lg mb-2 col-7" id="acctPassConfirmField" ref="acctPassConfirmField" /> 
			</div>
			
			<div class="text-center p-2">
				<button v-on:click="updatePassChains" class="btn btn-brand btn-lg">{{ $t('Update_pass') }}<i class="fas fa-spin fa-spinner text-white" v-if="updatingPass"></i></button>
				<div class="text-brand" v-if="errorUpdate">{{ errorUpdate }}</div>
			</div>
		</div>
	</div>
	<div :class="resDisplayContainer" v-if="user || update_result">
		<div class="row">
			<label for="newAcctInfo" class="col-3">{{ $t('Pass_update_progress') }}</label>
			<textarea rows="8" cols="80" class="text-brand" v-html="update_result" ref="newAcctInfo" id="newAcctInfo" readonly>
			</textarea >
			<button v-on:click="copyContent" data-targetEl="newAcctInfo" class="btn btn-brand btn-lg w-20 mb-2 ml-1" style="max-height: 50px;">{{ $t('Copy') }}</button>
		</div>
	</div>	
	<div :class="smallScreenClasses" class="container mt-5 pb-5 pt-5" v-if="!user">
      <!-- account balance -->
      <div class="text-center p-5">
		<div class="row pb-3">
		  <div class="text-center text-brand w-100 lead">
		    <span v-if="update_result">{{ $t('re_login_required') }}</span>
			<span v-else>{{ $t('login_required') }}</span>
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
  
  import hive from '@hiveio/hive-js'
  
  export default {
	components: {
	  NavbarBrand,
	  Footer
    },
	data () {
		return {
			target_bchain: 'BOTH',
			save_progress: false,
			user_settings: [],
			screenWidth: 1200,
			privatePostKey: '',
			privateActKey: '',
			privateOwnKey: '',
			privateMemoKey: '',
			acctPwd: '',
			newAcctPwd: '',
			//acctPassConfirm: '',
			cur_bchain: 'HIVE',//default val
			errorFetch: '',
			errorUpdate: '',
			errorUpdateRecovery: '',
			fetchingPass: false,
			updatingPass: false,
			updatingRecovery: false,
			update_result: '',
			reloginNeeded: false,
			passAValid: false,
			passBValid: false,
			validatingA: false,
			validatingB: false,
		}
	},
	watch: {
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
	  adjustSteemClass () {
		if (this.target_bchain != 'STEEM'){
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
	  resDisplayContainer () {
		let def = "container pb-5"
		if (!this.user){
			def += " pt-5 mt-5"
		}
		return def;
	  },
	},
	methods: {
	  resetKeys () {
		this.privatePostKey = '';
		this.privateActKey = '';
		this.privateOwnKey = '';
		this.privateMemoKey = '';
	  },
	  async changeRecoveryAccount () {
		this.errorUpdateRecovery = '';
		this.updatingRecovery = true;
		if (this.$refs['newRecoveryAccount'].value == ''){//
		  this.errorUpdateRecovery = this.$t('Error_provide_recovery_account');
		  this.updatingRecovery = false;
		  return;
		}
		
		if (this.$refs['ownKey'].value == ''){
		  this.errorUpdateRecovery = this.$t('Error_provide_owner_key');
		  this.updatingRecovery = false;
		  return;
		}
		
		let chainLnk = this.setProperNode();
		chainLnk.broadcast.changeRecoveryAccountAsync(this.$refs['ownKey'].value, this.user.account.name, this.$refs['newRecoveryAccount'].value, [])
        .then(results => {
            console.log(JSON.stringify(results));
			this.updatingRecovery = false;
			this.$notify({
			  group: 'success',
			  text: this.$t('Success_update_recovery_account'),
			  position: 'top center'
			})
        }).catch(err => {
			console.log(err);
			this.updatingRecovery = false;
			this.$notify({
			  group: 'error',
			  text: this.$t('error'),
			  position: 'top center'
			})
		});
	  },
	  setProperNode (overrideNode){
		let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		if (overrideNode){
			cur_bchain = overrideNode
		}
		let properNode = hive;
		if (cur_bchain == 'STEEM'){
			properNode = steem;
		}
		console.log(cur_bchain);
		return properNode;
	  },
	  async verifyPassByChain (pass, chain, target){
		if (target == 1){
			this.validatingA = true;
		}else if (target == 2){
			this.validatingB = true;
		}
		let chainLnk = this.setProperNode(chain);
		let res = await chainLnk.api.getAccountsAsync([this.user.account.name]);
		if (res && res.length > 0){
			let auths = {
				posting: res[0].posting.key_auths,
				active: res[0].active.key_auths,
				owner: res[0].owner.key_auths,
			};
			//console.log(res);
			//console.log(pass);
			//console.log(auths);
			let passVerified = await this.verifyPass(pass, auths);
			
			if (target == 1){
				this.passAValid = passVerified;
				this.validatingA = false;
			}else if (target == 2){
				this.passBValid = passVerified;
				this.validatingB = false;
			}
		}else{
			if (target == 1){
				this.passAValid = false;
				this.validatingA = false;
			}else if (target == 2){
				this.passBValid = false;
				this.validatingB = false;
			}
		}
	  },
	  verifyPass (cur_pass, auths) {
		
		let res = hive.auth.verify(this.user.account.name, cur_pass, auths);
		//console.log(res);
		return res;
	  },
	  async fetchKeys () {
		//ensure we have proper password to fetch keys
		this.fetchingPass = true;
		this.errorFetch = '';
		let chainLnk = await this.setProperNode();
		let auths = {
			posting: this.user.account.posting.key_auths,
			active: this.user.account.active.key_auths,
			owner: this.user.account.owner.key_auths,
		};
		if (this.$refs["passfetchdata"].value == '' || ! await this.verifyPass(this.$refs["passfetchdata"].value, auths)){
		  this.errorFetch = this.$t('Error_provide_password');
		  this.fetchingPass = false;
		  this.resetKeys();
		  return;
		}
		
		let privateKeys = await chainLnk.auth.getPrivateKeys(this.user.account.name, this.$refs["passfetchdata"].value);
		//console.log(privateKeys);
		this.privatePostKey = privateKeys.posting;
		this.privateActKey = privateKeys.active;
		this.privateOwnKey = privateKeys.owner;
		this.privateMemoKey = privateKeys.memo;
		this.fetchingPass = false;
	  },
	  setPasswordVal(){
		this.newAcctPwd = this.generatePassword(4);
	  },
	  generatePassword (multip) {
		//generate random 11 characters password
		let passString = '';
		for (let i=0;i<multip;i++){
			passString += Math.random().toString(36).substr(2, 13);
		}
		return passString;
	  },
	  copyContent (event) {
		  var copyText = this.$refs[event.currentTarget.getAttribute('data-targetEl')];
		  copyText.select();
		  document.execCommand("copy");
		  return;
	  },
	  async updatePassChains(){
		await this.updatePass(this.cur_bchain);
		if (this.target_bchain == 'BOTH'){
			let other_chain = (this.cur_bchain=='HIVE'?'STEEM':'HIVE');
			console.log(other_chain);
			await this.updatePass(other_chain);
		}
		//reset login if needed
		await this.resetUserLogin();
	  },
	  async resetUserLogin (){
		if (this.reloginNeeded){
			//reset user login
			
			let accToken = localStorage.getItem('access_token')
			
			let url = new URL(process.env.actiAppUrl + 'resetLogin/?user='+this.user.account.name);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			//console.log(outcome);
			if (outcome.error){
				//unable to reset
				console.log('unable to reset');
			}else{
				console.log('user login reset');
				this.$store.dispatch('steemconnect/logout');
				window.scrollTo(0,0);
			}
		}
	  },
	  async updatePass(chain_choice, finalize){
		//console.log('updatePass '+chain_choice);
		this.updatingPass = true;
		this.errorUpdate = '';
		
		let chainLnk = await this.setProperNode(chain_choice);
		console.log('chain_choice ' + chain_choice);
		let passField = "passchangedata";//default one for main chain
		if (chain_choice != this.cur_bchain){
			passField = "passchangedataother";
		}
		
		//console.log(this.$refs[passField].value);
		
		if (this.$refs[passField].value == ''){// || ! await this.verifyPass(this.$refs[passField].value)){
		  this.errorUpdate = this.$t('Error_provide_password');
		  this.updatingPass = false;
		  return;
		}
		
		if (this.newAcctPwd == ''){
		  this.errorUpdate = this.$t('Error_provide_new_password');
		  this.updatingPass = false;
		  return;
		}
		
		//console.log(this.newAcctPwd);
		//console.log(this.acctPassConfirm);
		//make sure user copied and pasted password
		if (this.newAcctPwd !== this.$refs['acctPassConfirmField'].value){
		  this.errorUpdate = this.$t('copy_password_confirm');
		  this.updatingPass = false;
		  return;
		}
		
		
		
		//generate pass wif
		//let newWif = 'P' + chainLnk.auth.toWif(this.newAcctPwd);
		//console.log('new wif');
		//console.log(newWif);
		//generate new keys based on new wif
		let newKeys = chainLnk.auth.getPrivateKeys(this.user.account.name, this.newAcctPwd, ['owner', 'active', 'posting', 'memo']); 
		
		//ensure we have user owner key to generate new keys
		let curPrivateKey = chainLnk.auth.getPrivateKeys(this.user.account.name, this.$refs[passField].value, ['owner']);
		let curOwnerKey = curPrivateKey.owner;

		// SAVE THIS OUTPUT INFORMATION AND DO NOT LOSE IT
		/*console.log(`
		Current owner key : ${curOwnerKey}
		New password      : ${this.newAcctPwd}
		New keys          : ${JSON.stringify(newKeys, null, 1)}`);*/

		// this is not needed anymore because we already got the pubkeys from steem.auth.getPrivateKeys()
		// var publicKeys = steem.auth.generateKeys(account, this.newAcctPwd, ['owner', 'active', 'posting', 'memo']);

		let ownerKey = {weight_threshold: 1, account_auths: [], key_auths: [[newKeys.ownerPubkey, 1]]};
		let activeKey = {weight_threshold: 1, account_auths: [], key_auths: [[newKeys.activePubkey, 1]]};
		let postingKey = {weight_threshold: 1, account_auths: [], key_auths: [[newKeys.postingPubkey, 1]]};
		let memoKey = newKeys.memoPubkey;
		let jsonMetadata = {};

		// broadcast
		let res = await chainLnk.broadcast.accountUpdateAsync(
		  curOwnerKey,
		  this.user.account.name,
		  ownerKey,
		  activeKey,
		  postingKey,
		  memoKey,
		  jsonMetadata).catch(err =>{
			  console.log(err);
			  
			  this.updatingPass = false;
			  let sel_chain = this.cur_bchain;
			  if (chain_choice){
				sel_chain = chain_choice;
			  }
			  this.update_result += '\n>>>Error updating your password & keys on '+chain_choice+'\n';
			  this.update_result += err.message;
			  let note = 'There was an error updating your credentials on '+chain_choice+'!';
			  this.$notify({
				  group: 'error',
				  text: note,
				  position: 'top center'
				})
		});
		//console.log(res);
		if (res && res.ref_block_num){
			let sel_chain = this.cur_bchain;
			if (chain_choice){
				sel_chain = chain_choice;
			}
			this.update_result += '>>>Your New ' + sel_chain + ' Credentials:<<<\n';
			
			this.update_result += `Your New password         : ${this.newAcctPwd}\n`;
			this.update_result += `New Private Posting key   : ${newKeys.posting}\n`;
			this.update_result += `New Private Active key    : ${newKeys.active}\n`;
			this.update_result += `New Private Owner key     : ${newKeys.owner}\n`;
			this.update_result += `New Private Memo key      : ${newKeys.memo}\n`;
					
			this.updatingPass = false;
			let note = 'Credentials successfully updated on '+sel_chain+'! Make sure to make a copy of them!'
			this.$notify({
			  group: 'success',
			  text: note,
			  position: 'top center'
			})
			//this.$store.dispatch('steemconnect/refreshUser');
			//as user gets invalidated if logged in on same chain, need to log him out
			if (sel_chain == this.cur_bchain){
				this.reloginNeeded = true;
			}
		}
	  },
	  
	},
	async mounted () {
		this.screenWidth = screen.width;
		//check which chain is active
		if (localStorage.getItem('cur_bchain')){
			this.cur_bchain = localStorage.getItem('cur_bchain')
		}
		steem.api.setOptions({ url: process.env.steemApiNode });
		
		//hive.config.set('rebranded_api', true)
		//hive.broadcast.updateOperations()
		hive.config.set('alternative_api_endpoints', process.env.altHiveNodes);

		hive.api.setOptions({ url: process.env.hiveApiNode });
		await this.setProperNode();
		this.$store.dispatch('steemconnect/login')
	}
  }
</script>