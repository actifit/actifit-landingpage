<template>
  <div class="modal fade" id="exchangeQueueModal" ref="exchangeQueueModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('Exchange_Transactions_Queue') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<VotingStatus />
			<h5 class="modal-title" id="exampleModalLabel">{{ $t('top_afitx_holders') }}</h5>
			<table class="table table-hover">
			  <thead class="text-brand">
				<tr>
				  <th scope="col">{{ $t('Rank') }}</th>
				  <th scope="col">{{ $t('User') }}</th>
				  <th scope="col" class="d-none d-sm-table-cell">{{ $t('Afitx_Bal') }}</th>
				  <!--<th scope="col" class="d-none d-lg-table-cell">{{ $t('Date') }}</th>-->
				  <th scope="col" class="d-none d-sm-table-cell">{{ $t('AFIT_Exchanged') }}</th>
				  <th scope="col">{{ $t('Exchange_Time') }}</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(topHolder, key) in topAFITXList" :key="key" :class="{'bg-danger': user === topHolder.account, 'text-white': user === topHolder.account}" v-if="exchangeRequestSet(topHolder.account)">
				  <td>{{ key + 1 }}</td>
				  <td>
					<a :href="topHolder.account" target="_blank" :class="{'text-white': user === topHolder.account}">
						@{{ topHolder.account }}
					</a>
				  </td>
				  <td class="d-none d-lg-table-cell">{{ topHolder.balance }} {{ $t('AFITX') }}</td>
				  <!--<td class="d-none d-lg-table-cell">{{ date(topHolder.date) }}</td>-->
				  <td class="d-none d-sm-table-cell">{{ amountExchanged(topHolder.account) }}</td>
				  <td>{{ $t('within_round').replace('ROUND_COUNT', '') }} </td>
				</tr>
			  </tbody>
			</table>
			
			<table class="table table-hover">
			  <thead class="text-brand">
				<tr>
				  <th scope="col">{{ $t('Order_No') }}</th>
				  <th scope="col">{{ $t('User') }}</th>
				  <th scope="col" class="d-none d-lg-table-cell">{{ $t('Date') }}</th>
				  <th scope="col" class="d-none d-sm-table-cell">{{ $t('AFIT_Exchanged') }}</th>
				  <th scope="col">{{ $t('Exchange_Time') }}</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(pendingTrans, key) in transList" :key="pendingTrans._id" :class="{'bg-danger': user === pendingTrans.user, 'text-white': user === pendingTrans.user}" v-if="!isTopHolder(pendingTrans.user)">
				  <th scope="row">{{ key + 1 }}</th>
				  <td>
					<a :href="pendingTrans.user" target="_blank" :class="{'text-white': user === pendingTrans.user}">
						@{{ pendingTrans.user }}
					</a>
				  </td>
				  <td class="d-none d-lg-table-cell">{{ date(pendingTrans.date) }}</td>
				  <td class="d-none d-sm-table-cell">{{ pendingTrans.paid_afit }}</td>
				  <td v-if="pendingTrans.reward_round < 2">{{ $t('within_round').replace('ROUND_COUNT', '') }}</td>
				  <td v-else>{{ $t('within_rounds').replace('ROUND_COUNT', pendingTrans.reward_round) }}</td>
				</tr>
			  </tbody>
			</table>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
 
  import VotingStatus from '~/components/VotingStatus'

  export default {
    props: [ 'transList', 'user', 'topAFITXList' ],
	components: {
		VotingStatus,
	},
	methods: {
	  date(val) {
        let date = new Date(val)
        let minutes = date.getMinutes()
        return date.getDate() + '/' 
			+ (date.getMonth() + 1) + '/' 
			+ date.getFullYear() + ' ' 
			+ date.getHours() + ':' 
			+ (minutes < 10 ? '0' + minutes : minutes)
      },
	  exchangeRequestSet(user){
		if (this.transList && this.transList.length){
			return this.transList.find(v => v.user == user)
		}
		return false;
	  },
	  amountExchanged(user){
		if (this.transList && this.transList.length){
			let entry = [];
			entry = this.transList.find(v => v.user == user)
			if (entry){
				return entry.paid_afit
			}
		}
		return '';
	  },
	  isTopHolder(user){
		return ((this.topAFITXList && this.topAFITXList.length)?this.topAFITXList.find(v => v.account == user):false);
	  }
	}
  }
</script>
<style>

</style>
