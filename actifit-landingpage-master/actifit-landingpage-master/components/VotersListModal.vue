<template>
  <div class="modal fade" id="votersListModal" ref="votersListModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div v-if="modalTitle" class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<div>
				<select v-model="currentToken" class="form-control col-3 sel-adj float-right border-red" >
					<!-- default option is cur_bchain value (HIVE/STEEM) -->
					<option :value="cur_bchain">{{cur_bchain}}</option>
					<option v-for="(tokenType, key) in tokenRewards" :key="key" :value="tokenType.token">{{tokenType.token}}</option>
				</select>
			</div>
			<table class="table table-hover">
			  <thead class="text-brand">
				<tr>
				  <th scope="col">{{ $t('Voter') }}</th>
				  <th scope="col">{{ $t('Voting_Action') }}</th>
				  <th scope="col" v-if="showPercent">{{ $t('Voting_Percent') }}</th>
				  <th scope="col">{{ $t('Voting_Value') }}</th>
				  <!--<th scope="col">{{ $t('Voting_Date') }}</th>-->
				</tr>
			  </thead>
			  <tbody>
				<!-- voter, percent, reputation, rshares -->
				<tr v-for="(voteEntry, key) in activeVotersList" :key="key" :class="{'bg-danger': user && user.name === voteEntry.voter, 'text-white': user && user.name === voteEntry.voter}">
				  <td>
					<a :href="'/'+voteEntry.voter" target="_blank" :class="{'text-white': user && user.name === voteEntry.voter}">
						@{{ voteEntry.voter }}
					</a>
				  </td>
				  <td>
					<i v-if="voteEntry.percent >= 0 || voteEntry.rshares >= 0" class="fas fa-thumbs-up text-green"></i>
					<i v-else class="fas fa-thumbs-down text-brand"></i>
				  </td>
				  <td v-if="showPercent">{{ voteEntry.percent / 100 }} %</td>
				  <td>{{ voteValue(voteEntry) }}</td>
				</tr>
			  </tbody>
			</table>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
 
  import { mapGetters } from 'vuex'
  let totalPayout;
  let voteRshares;
  let ratio;
  
  export default {
	data () {
      return {
		currentToken: 'HIVE',
		tokenRewards: [],
		activeVotersList : [],
		cur_bchain: 'HIVE',
		showPercent: true,
	  }
	},
    props: [ 'modalTitle', 'votersList', 'postData' ],
	components: {
	  
	},
	computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['bchain']),
    },
	watch: {
		postData: 'initializePostCalc',
		currentToken: 'initializePostCalc',
		bchain: async function(newBchain) {
		  this.cur_bchain = newBchain;
		  this.currentToken = newBchain;
		//this.reload += 1;
	    }
	},
	methods: {
	  /* calculate vote value */
	  voteValue(voteEntry){
		if (voteEntry){
			return this.currentToken + ' ' + parseFloat((voteEntry.rshares * ratio)).toFixed(4);
		}else{
			return this.currentToken + ' ' + 0;
		}
	  },
	  /* initialize post specific data and calculations */
	  initializePostCalc(){
		if (this.postData){
			this.tokenRewards = this.$parent.$parent.tokenRewards;
			if (!this.tokenRewards){
				this.tokenRewards = this.postData.specTokenRewards;
			}		
			
			//calculate various needed data for vote value
			if (this.currentToken != this.cur_bchain){
				this.activeVotersList = this.tokenRewards[this.currentToken].active_votes;
				//case for comments:
				let finalPay = parseFloat(this.tokenRewards[this.currentToken].total_payout_value);
				if (isNaN(finalPay)){
					finalPay = parseFloat(this.tokenRewards[this.currentToken].author_payout_value);
				}
				totalPayout =
				  parseFloat(this.tokenRewards[this.currentToken].pending_token) +
				  parseFloat(finalPay) +
				  parseFloat(this.tokenRewards[this.currentToken].curator_payout_value);
				
				totalPayout /= Math.pow(10, this.tokenRewards[this.currentToken].precision);
				
				voteRshares = this.tokenRewards[this.currentToken].active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
				//voteRshares = this.tokenRewards[this.currentToken].voteRshares;
			
			}else{
				this.activeVotersList = this.votersList;
				//calculate various needed data for vote value
				//case for comments:
				let finalPay = parseFloat(this.postData.total_payout_value);
				console.log(finalPay)
				if (isNaN(finalPay)){
					finalPay = parseFloat(this.postData.author_payout_value);
				}
				console.log(finalPay)
				totalPayout =
				  parseFloat(this.postData.pending_payout_value) +
				  parseFloat(finalPay) +
				  parseFloat(this.postData.curator_payout_value);
				  
				voteRshares = this.postData.active_votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
			}
			
			//sort data according to abs value of rshares
			this.activeVotersList = this.activeVotersList.sort(function sortVoters(a, b) {
					return Math.abs(b.rshares) - Math.abs(a.rshares);
			});
			this.showPercent = true;
			//check if we have percentages
			if (Array.isArray(this.activeVotersList) && this.activeVotersList.length > 0){
				//check first vote for percent value
				if (typeof(this.activeVotersList[0].percent) === 'undefined'){
					this.showPercent = false;
				}
			}			
			
			ratio = (voteRshares === 0) ? 0 : totalPayout / voteRshares;
		}
	  }
	},
	async mounted () {
		//grab current chain
		if (localStorage.getItem('cur_bchain')){
			this.cur_bchain = localStorage.getItem('cur_bchain')
			this.currentToken = this.cur_bchain;
		}
		//console.log('mounted');
		if (this.postData){
			//console.log('postData');
			//console.log(this.postData);
			this.initializePostCalc();
		}
	}
  }
</script>
<style>
.text-green{
	color: #76BB0E
}
.border-red{
	border: 2px red solid;
	border-radius: 5px;
}
</style>