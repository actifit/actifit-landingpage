<template>
  <div class="modal fade" id="pendingRewardsModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="pendingRewards.pendingRewards">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{$t('pending_rewards_title')}}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="p-2 m-3 " >
			{{$t('pending_rewards_head_note')}}
			<li v-if="pendingRewards.pendingRewards.HIVE"><!--  -->
				$ {{pendingRewards.pendingRewards.HIVE.amount.toFixed(2)}} ({{pendingRewards.pendingRewards.HIVE.amount.toFixed(2)}} {{pendingRewards.pendingRewards.HIVE.currency}} <img src="/img/HIVE.png" class="token-logo-sm" title="HIVE Rewards">)
			</li>
			<!--<li v-if="pendingRewards.pendingRewards.STEEM">
				$ {{pendingRewards.pendingRewards.STEEM.amount.toFixed(2)}} ({{pendingRewards.pendingRewards.STEEM.amount.toFixed(2)}} {{pendingRewards.pendingRewards.STEEM.currency}}<img src="/img/STEEM.png" class="token-logo-sm" title="STEEM Rewards">)
			</li>-->
			<li v-if="pendingRewards.pendingRewards.BLURT"><!--   -->
				$ {{displayBlurtPriceUSD.toFixed(2)}} ({{pendingRewards.pendingRewards.BLURT.amount.toFixed(2)}} {{pendingRewards.pendingRewards.BLURT.currency}}<img src="/img/BLURT.png" class="token-logo-sm" title="BLURT Rewards">)
			</li>
			{{$t('pending_rewards_note')}}
			<br /><br />
			<input type="checkbox" name="hidePendingRewards" id="hidePendingRewards" ref="hidePendingRewards" @change="updatePopupStoredStatus($event)"/>{{$t('hide_pending_rewards_popup')}}
			<div class="text-center">
			<button type="button" class="btn btn-lg btn-brand w-25" data-dismiss="modal" aria-label="Close">
				&nbsp;{{$t('Close')}}
			</button>
			<a v-if="username" :href="'./activity/'+username.account.name" class="btn btn-lg btn-brand w-25">{{ $t('My_Activity') }}</a></div>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'

  export default {
    props: ['pendingRewards', 'username'],
	data(){
		return {
			blurtPrice: 0,
		}
	},
	components: {
	  
	},
    computed: {
		displayBlurtPriceUSD(){
			if (this.pendingRewards.pendingRewards && this.pendingRewards.pendingRewards.BLURT.amount)
			return this.pendingRewards.pendingRewards.BLURT.amount*this.blurtPrice;
			return 0;
		},
		
    },
	methods: {
		setBlurtPrice(_price){
			console.log(_price);
			this.blurtPrice = _price;
		},
		fetchBlurtPrice(){
		  //grab price
		  console.log('fetchBlurtPrice');
		  fetch('https://api.coingecko.com/api/v3/simple/price?ids=blurt&vs_currencies=usd').then(
			res => {res.json().then(json => this.setBlurtPrice (json.blurt.usd)).catch(e => console.log(e))
		  }).catch(e => console.log(e))
		},
		updatePopupStoredStatus(e){
			this.$nextTick(() => {
				//
				console.log(e.target.checked)
				localStorage.setItem('preventRewardsPop', e.target.checked);
			})
			
		}
	},
	async mounted () {
		this.fetchBlurtPrice();
	}
  }
</script>
<style>
  .modal-body{
    word-break: break-word;
  }
</style>