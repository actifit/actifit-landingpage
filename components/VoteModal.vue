<template>
  <div class="modal fade" id="voteModal" tabindex="-1" ref="voteModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content" v-if="postToVote">
        <div class="modal-header">
          <h5 class="modal-title">Vote on {{ postToVote.title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="text-center pt-2" v-if="getVotingPower">
			<span>Your Voting Power: </span><span :style="displayProperColor">{{getVotingPower}}</span>
			<div class="text-brand"><small>Full In {{timeToFullVP}}</small></div>
		</div>
        <div class="modal-body text-center">
          <small class="text-muted">Adjust the weight of your vote.</small>
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
		  <div class="text-center"><span>Your Vote Value:</span><span>{{vote_value_usd}}</span></div>
          <button type="submit" class="btn btn-brand" @click="vote()" v-if="voteWeight">
            <i class="fas fa-thumbs-up" v-if="voteWeight > 0"></i>
            <i class="fas fa-thumbs-down" v-if="voteWeight < 0"></i>
            <span v-if="voteWeight > 0"> Upvote</span>
            <span v-if="voteWeight < 0"> Downvote</span>
            <i class="fas fa-spinner fa-spin ml-2" v-if="loading"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import steem from 'steem'

  export default {
    data () {
      return {
        loading: false,
		currentVotingPower: 0,
		timeToFullVP: '',
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
      }
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['postToVote']),
	  ...mapGetters(['newlyVotedPosts']),
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
		this.getVoteValueUSD();
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
	  fetchVotingPower() {
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
		this.timeToFullPower();
		
		//and calculate voting power initially
		this.calculateVoteValue();
		
		return currentManaPerc;
	  },
	  //calculates time till full power replenishes
	  timeToFullPower(){
		let timeToFull = this.toTimer((this.STEEMIT_100_PERCENT - this.currentVotingPower * 100) * this.STEEMIT_VOTE_REGENERATION_SECONDS / this.STEEMIT_100_PERCENT);
		this.timeToFullVP = timeToFull;
		
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
	  getVoteValue() {
		if (this.rewardBalance && this.recentClaims && this.steem_price && this.votePowerReserveRate) {
		  let voteValue = this.getVoteRShares(this.voteWeight, this.user.account, this.currentVotingPower * 100)
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
	  getVoteValueUSD() {
		let vote_value = this.getVoteValue();
		
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
      vote () {
        this.loading = true
		this.$steemconnect.vote(this.user.account.name, this.postToVote.author, this.postToVote.permlink, this.voteWeight * 100, (err) => {
          this.loading = false
          if (err) {
            this.$notify({
              group: 'error',
              text: 'Unknown error: Your vote could not be broadcasted.',
              position: 'top center'
            });
          }
          else {
			//append this entry into the list of voted posts
			if (this.newlyVotedPosts.indexOf(this.postToVote.post_id) === -1){
				this.newlyVotedPosts.push(this.postToVote.post_id);
			}
			this.$store.commit('setNewlyVotedPosts', this.newlyVotedPosts);
            $(this.$refs.voteModal).modal('hide')
            this.$notify({
              group: 'success',
              text: 'Your vote has been successfully broadcasted.'
            });
			
			//if the user votes 3 or more posts at 20%, let's give an additional reward
			if (this.newlyVotedPosts.length >= 3 && this.voteWeight >= 20){
			  this.rewardUserVote();
			}
			
			this.refreshAccountData();
          }
        });
      },
	  //handles refreshing account data following vote
	  async refreshAccountData () {
		let user_data = await this.$steemconnect.me();
		this.user.account = user_data.account;
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
				  text: 'You\'ve been rewarded '+outcome.amount + ' AFIT tokens for upvoting 3 Actifit reports at 20% voting power or more. Congrats!',
				  position: 'top center'
				})
			}
		}catch(err){
			console.error(err);
		}
	  }
    },
	async mounted () {
	  //grab SBD price, needed for vote value calculation
	  fetch('https://api.coinmarketcap.com/v1/ticker/steem-dollars/').then(
		res => {res.json().then(json => this.setSBDPrice (json[0].price_usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	  
	  //grab SBD price, needed for vote value calculation
	  fetch('https://api.coinmarketcap.com/v1/ticker/steem/').then(
		res => {res.json().then(json => this.setSteemPrice (json[0].price_usd)).catch(e => reject(e))
	  }).catch(e => reject(e))
	
	  //in addition to the default updating of VP upon each render, we need to take into consideration leaving window open. 
	  //for this purpose, let's update every 30 seconds
	  setInterval(this.fetchVotingPower, 30 * 1000);
	  if (this.report != null){
		this.fetchReportKeyData();
	  }
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
