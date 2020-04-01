<template>
  <div class="modal fade" id="voteModal" tabindex="-1" ref="voteModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content border border-danger" v-if="postToVote">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('Vote_on') }} {{ postToVote.title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<SteemStats class="modal-body" :user="user"/>
        <div class="modal-body text-center">
		  <div class="modal-footer m-2">
			<div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-if="cur_bchain=='HIVE'">
				<input type="radio" id="hive" value="HIVE" v-model="target_bchain">
				<img src="/img/HIVE.png" style="max-height: 50px" v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass">
				<label for="hive">HIVE ONLY</label>
			</div>
			<div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-else-if="cur_bchain=='STEEM'">
				<input type="radio" id="steem" value="STEEM" v-model="target_bchain">
				<img src="/img/STEEM.png" style="max-height: 50px" v-on:click="target_bchain = 'STEEM'" :class="adjustSteemClass">
				<label for="steem">STEEM ONLY</label>
			</div>
			<div class="bchain-option btn col-6 p-2 row text-left  mx-auto">
				<input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
				<img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass">
				<img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass">
				<label for="hive_steem">HIVE + STEEM</label>
			</div>
		  </div>
          <small class="text-muted">{{ $t('Adjust_Vote_Weight') }}</small>
          <ul class="pagination justify-content-center mt-2">
            <li :class="{'page-item': true, disabled: voteWeight === -100}"><a class="page-link vote-controls" href="#" @click.prevent="setVoteWeight(-100)"><i class="far fa-flag text-danger"></i></a></li>
            <li :class="{'page-item': true, disabled: voteWeight === -100}"><a class="page-link vote-controls text-danger" href="#" @click.prevent="changeVoteWeight(-10)">-10</a></li>
            <li :class="{'page-item': true, disabled: voteWeight === -100}"><a class="page-link vote-controls text-danger" href="#" @click.prevent="changeVoteWeight(-1)">-1</a></li>
            <li class="page-item vote-weight">
              <input id="votableWeight" type="number" value="100" class="form-control" v-model="voteWeight" @change="customVoteWeight" />
            </li>
            <li :class="{'page-item': true, disabled: voteWeight === 100}"><a class="page-link vote-controls text-success" href="#" @click.prevent="changeVoteWeight(1)">+1</a></li>
            <li :class="{'page-item': true, disabled: voteWeight === 100}"><a class="page-link vote-controls text-success" href="#" @click.prevent="changeVoteWeight(10)">+10</a></li>
            <li :class="{'page-item': true, disabled: voteWeight === 100}"><a class="page-link vote-controls" href="#" @click.prevent="setVoteWeight(100)"><i class="far fa-thumbs-up text-success"></i></a></li>
          </ul>
		  <div class="text-center"><span>{{ $t('Your_Vote_Value') }}:</span><span>{{vote_value_usd}}</span></div>
		  <button type="submit" class="btn btn-brand border" @click="vote()" v-if="voteWeight">
            <i class="fas fa-thumbs-up" v-if="voteWeight > 0"></i>
            <i class="fas fa-thumbs-down" v-if="voteWeight < 0"></i>
            <span v-if="voteWeight > 0"> {{ $t('Upvote') }}</span>
            <span v-if="voteWeight < 0"> {{ $t('Downvote') }}</span>
			<img src="/img/HIVE.png" style="max-height: 25px" v-if="target_bchain=='HIVE' || target_bchain=='BOTH'">
			<img src="/img/STEEM.png" style="max-height: 25px" v-if="target_bchain=='STEEM' || target_bchain=='BOTH'">
            <i class="fas fa-spinner fa-spin ml-2" v-if="loading"></i>
          </button>
		  
		  <a href="#" data-toggle="modal" class="btn btn-brand border" data-target="#votersListModal" >
			<i class="fas fa-list-ul"></i> {{ $t('Voters') }}
		  </a>
		  
        </div>
      </div>
    </div>
	<VotersListModal :modalTitle="$t('Voters_List')" :votersList="votersList" :postData="postToVote"/>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import steem from 'steem'
  
  //import dsteem from 'dsteem'
  import SteemStats from '~/components/SteemStats'
  import VotersListModal from '~/components/VotersListModal'
  
  var dsteem = require('dsteem')
  
  var client;

  export default {
    data () {
      return {
        loading: false,
		properties: '', //handles the Steem BC properties
		sbd_print_percentage: 1,
		rewardBalance: 1,
		recentClaims: 1,
		votePowerReserveRate: 1,
		sbd_price: 1,
		steem_price: 1,
		vote_value_usd: '',
		STEEMIT_100_PERCENT: 10000,
		STEEMIT_VOTE_REGENERATION_SECONDS: (5 * 60 * 60 * 24),
		votersList: [],
		cur_bchain: 'HIVE',
		target_bchain: 'HIVE',
      }
    },
	watch: {
	  postToVote: 'fetchVoterData',
	},
	components: {
	  SteemStats,
	  VotersListModal
	},
    computed: {
      ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
      ...mapGetters(['postToVote']),
	  ...mapGetters(['newlyVotedPosts']),
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
      voteWeight: {
        get () {
          return this.$store.getters.voteWeight
        },
        set () {
          this.$store.commit('setVoteWeight', this.voteWeight)
        }
      },
	  getVotingPower () {
		return this.currentVotingPower + '%';
	  },
	  displayProperColor () {
		//display proper coloring reflecting VP state
		if (this.currentVotingPower > 80){
		  return "color: #28a745";
		}else if (this.currentVotingPower > 60){
		  return "color: #fd7e14";
		}
		return "color: #dc3545";
	  }
    },
	beforeUpdate() {
	  //VP data needing constant refresh upon open/close of new upvote modal
	  this.fetchVotingPower();
	},
    methods: {
	  //handles calculating and displaying proper voting value
	  async calculateVoteValue () {
		
		if (this.properties == ''){
		  //not loaded yet
		  this.properties = await steem.api.getDynamicGlobalPropertiesAsync();
		  //grab reward fund data
		  let rewardFund = await steem.api.getRewardFundAsync("post");
		  this.rewardBalance = parseFloat(rewardFund.reward_balance.replace(" STEEM", ""));
		  this.recentClaims = rewardFund.recent_claims;
		}
		
		
		
		let totalSteem = Number(this.properties.total_vesting_fund_steem.split(' ')[0]);
		let totalVests = Number(this.properties.total_vesting_shares.split(' ')[0]);
		
		this.votePowerReserveRate = this.properties.vote_power_reserve_rate;
		this.sbd_print_percentage = this.properties.sbd_print_rate / 10000;
		this.getVoteValueUSD(this.voteWeight, this.user.account, this.currentVotingPower);
	  },
	  //store SBD price
	  setSBDPrice (_sbdPrice){
		this.sbd_price = parseFloat(_sbdPrice).toFixed(3);
	  },
	  //store Steem price
	  setSteemPrice (_steemPrice){
		this.steem_price = parseFloat(_steemPrice).toFixed(3);
	  },
	  //handles grabbing current user's VP
	  async fetchVotingPower() {
		if (!this.user){
		  return '';
		}
		let account = this.user.account;
		if (typeof account == 'undefined' || account == null){
		  return '';
		}
		const totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate);

		const elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time;
		const maxMana = totalShares * 1000000;
		// 432000 sec = 5 days
		let currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / 432000;

		if (currentMana > maxMana) {
			currentMana = maxMana;
		}

		const currentManaPerc = currentMana * 100 / maxMana;
			
		this.currentVotingPower = currentManaPerc.toFixed(3);
		//also fetch time till full power replenishes
		this.timeToFull(this.currentVotingPower);
		
		//and calculate voting power initially
		this.calculateVoteValue();
		
		//this.currentRC = currentManaPerc;
		let rcComponent = await client.rc.getRCMana(this.user.account.name);
		this.currentRC = rcComponent.percentage/100;
		this.currentRCPercent = this.currentRC + '%';
		//console.log(this.currentRC);
		
		
		return currentManaPerc;
	  },
	  //calculates time till full power replenishes
	  timeToFull(param){
		let timeToFull = this.toTimer((this.STEEMIT_100_PERCENT - param * 100) * this.STEEMIT_VOTE_REGENERATION_SECONDS / this.STEEMIT_100_PERCENT);
		
		return timeToFull;
	  },
	  //convert to proper timing render
	  toTimer(ts) {
	    const HOURS = 60 * 60;
	    let h = Math.floor(ts / HOURS);
	    let m = Math.floor((ts % HOURS) / 60);
	    //let s = Math.floor((ts % 60));
	    return this.padLeft(h, 2) + 'h:' + this.padLeft(m, 2) + 'm';//':' + this.padLeft(s, 2);
	  },
	  //proper padding to display double digits
	  padLeft(v, d) {
	    let l = (v + '').length;
	    if (l >= d) return v + '';
	    for (let i = l; i < d; i++) {
		  v = '0' + v;
		}
	    return v;
	  },
	  //handles grabbing the vote value /STEEM
	  getVoteValue(weight, account, vp) {
		if (this.rewardBalance && this.recentClaims && this.steem_price && this.votePowerReserveRate) {
		  let voteValue = this.getVoteRShares(weight, account, vp * 100)
			* this.rewardBalance / this.recentClaims
			* this.steem_price;
		  
		  return voteValue;
		}
	  },
	  //calculate voting value based on rshares contribution
	  getVoteRShares (voteWeight, account, power) {
	  
		let effective_vesting_shares = Math.round(this.getVestingShares(account) * 1000000);
		let voting_power = account.voting_power;
		let weight = voteWeight * 100;
		let last_vote_time = new Date((account.last_vote_time) + 'Z');

		let elapsed_seconds = (new Date() - last_vote_time) / 1000;
		let regenerated_power = Math.round((this.STEEMIT_100_PERCENT * elapsed_seconds) / this.STEEMIT_VOTE_REGENERATION_SECONDS);
		let current_power = power || Math.min(voting_power + regenerated_power, this.STEEMIT_100_PERCENT);
		let max_vote_denom = this.votePowerReserveRate * this.STEEMIT_VOTE_REGENERATION_SECONDS / (60 * 60 * 24);
		let used_power = Math.round((current_power * weight) / this.STEEMIT_100_PERCENT);
		used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);

		let rshares = Math.round((effective_vesting_shares * used_power) / (this.STEEMIT_100_PERCENT))

		return rshares;
	  },
	  //grab account vesting shares value
	  getVestingShares(account) {
		var effective_vesting_shares = parseFloat(account.vesting_shares.replace(" VESTS", ""))
			+ parseFloat(account.received_vesting_shares.replace(" VESTS", ""))
		   - parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
		return effective_vesting_shares;
	  },
	  //handles display vote value in USD
	  getVoteValueUSD(weight, account, vp) {
		let vote_value = this.getVoteValue(weight, account, vp);
		
		const steempower_value = vote_value * 0.5
		const sbd_print_percentage_half = (0.5 * this.sbd_print_percentage)
		const sbd_value = vote_value * sbd_print_percentage_half
		const steem_value = vote_value * (0.5 - sbd_print_percentage_half)
		this.vote_value_usd = ((sbd_value * this.sbd_price) + steem_value + steempower_value).toFixed(3) +  '$';
		return this.vote_value_usd
	  },
	  //handles updating custom values
	  customVoteWeight () {
		var newVal = document.getElementById('votableWeight').value;
		if (newVal == this.voteWeight){
			//do nothing
		}else{
			this.setVoteWeight(newVal);
		}
	  },
      changeVoteWeight (value) {
        this.setVoteWeight(this.voteWeight += parseInt(value))
      },
      setVoteWeight (weight) {
        weight = weight > 100 ? 100 : weight
        weight = weight < -100 ? -100 : weight
        this.$store.commit('setVoteWeight', parseInt(weight))
		//while setting, ensure we display proper voting value in USD as well
		this.calculateVoteValue();
      },
      /* function checks if logged in user has upvoted current report */
	  userVotedThisPost() {
		let curUser = this.user.account.name;
		//check if the post contains in its original voters current user, or if it has been upvoted in current session
		return this.postToVote.active_votes.filter(voter => (voter.voter === curUser)).length > 0 || this.newlyVotedPosts.indexOf(this.postToVote.post_id)!==-1;
	  },
	  async processTrxFunc(op_name, cstm_params, bchain_option){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.block_num) {
				console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
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
				//clear entry
				localStorage.removeItem('access_token');
				//this.$store.commit('setStdLoginUser', false);
				this.error_msg = this.$t('session_expired_login_again');
				this.$store.dispatch('steemconnect/logout');
				
				this.$notify({
				  group: 'error',
				  text: this.$t('session_expired_login_again'),
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx};
			}
		}
	  },
	  voteSuccess (err, finalize, bchain) {
		  if (err) {
			this.$notify({
			  group: 'error',
			  text: this.$t('Vote_Error'),
			  position: 'top center'
			});
		  }
		  else {
			if (finalize){
				this.loading = false
				//append this entry into the list of voted posts
				if (this.newlyVotedPosts.indexOf(this.postToVote.post_id) === -1){
					this.newlyVotedPosts.push(this.postToVote.post_id);
				}
				this.$store.commit('setNewlyVotedPosts', this.newlyVotedPosts);
				$(this.$refs.voteModal).modal('hide')
				this.$notify({
				  group: 'success',
				  text: this.$t('Vote_Success').replace('_BCHAIN_',bchain)
				});
				
				//if the user votes 3 or more posts at 20%, let's give an additional reward
				if (this.newlyVotedPosts.length >= 3 && this.voteWeight >= 20){
				  this.rewardUserVote();
				}
				
				this.refreshAccountData();
			}
		  }
	  },
	  async vote () {
        //if no user is logged in, prompt to login
		if (!this.user || !this.user.account){
		//if (!this.$store.state.steemconnect.user){
		  alert(this.$t('need_login_signup_notice_vote'));
		  e.stopPropagation();
		  return;
		}
		
		//if the user already voted, confirm vote change
		//if this post is already voted by the user, we need to show a confirmation
		if (this.userVotedThisPost()){
		  var confirmPopup = confirm(this.$t('confirm_vote_change'));
		  if (!confirmPopup){
			return;
		  }
		}
		
		this.loading = true
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			this.$steemconnect.vote(this.user.account.name, this.postToVote.author, this.postToVote.permlink, this.voteWeight * 100, (err) => {
			  this.voteSuccess(err, true, 'STEEM');
			});
		}else{
			let cstm_params = {
			  "voter": this.user.account.name,
			  "author": this.postToVote.author,
			  "permlink": this.postToVote.permlink,
			  "weight": this.voteWeight * 100
			};
			
			let res = await this.processTrxFunc('vote', cstm_params, this.cur_bchain);
			
			if (res.success){
				this.voteSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
			}else{
				this.voteSuccess('error voting', false, this.cur_bchain);
			}
			
			//also send the same post again to the other chain
			let other_chain = this.cur_bchain=='HIVE'?'STEEM':'HIVE';
			if (this.target_bchain == 'BOTH'){
				//this.loading = true;
				let res = await this.processTrxFunc('vote', cstm_params, other_chain);
			
				if (res.success){
					this.voteSuccess(null, true, other_chain);
				}else{
					this.voteSuccess('error voting', false, other_chain);
				}
			}
			
		}
      },
	  //handles refreshing account data following vote
	  async refreshAccountData () {
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let user_data = await this.$steemconnect.me();
			this.user.account = user_data.account;
		}else{
			this.$store.dispatch('steemconnect/refreshUser');
		}
	  },
	  async rewardUserVote () {
		//handles rewarding the user for his votes
		let url = new URL(process.env.actiAppUrl + 'rewardActifitWebVote/'+this.user.account.name);
		//compile all needed data and send it along the request for processing
		let params = {
			web_vote_token: process.env.webVoteToken,
			url: this.postToVote.url,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.rewarded){
				// notify the user that he received an additional reward
				this.$notify({
				  group: 'success',
				  text: this.$t('youve_been_rewarded')+outcome.amount + this.$t('reward_for_upvote'),
				  position: 'top center'
				})
			}
		}catch(err){
			console.error(err);
		}
	  },
	  async fetchVoterData(){
		  if (!this.postToVote){
			return;
		  }
		  this.votersList = this.postToVote.active_votes;
	  }
    },
	async mounted () {
	  this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'');
	  //grab STEEM price, needed for vote value calculation
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSteemPrice (json.steem.usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab SBD price, needed for vote value calculation
	  fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem-dollars&vs_currencies=usd').then(
		res => {res.json().then(json => this.setSBDPrice (json['steem-dollars'].usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	
	  //in addition to the default updating of VP upon each render, we need to take into consideration leaving window open. 
	  //for this purpose, let's update every 30 seconds
	  setInterval(this.fetchVotingPower, 30 * 1000);
	  
	  this.fetchVoterData();
	  
	  client = new dsteem.Client('https://api.steemit.com')
	  /*
	    let properties = await client.database.getDynamicGlobalProperties()
		console.log(properties)
	  */
	  //let acct = await client.rc.findRCAccounts('mcfarhat');
	  
	}
  }
</script>

<style lang="sass">
  .vote-weight
    position: relative

    &:after
      content: '%'
      line-height: 42px
      position: absolute
      top: 0
      right: 10px
      color: #999

    input
      width: 80px
      font-size: 1.2rem

  .vote-controls
    margin-top: 5px
    padding: 4px 8px
	
</style>
