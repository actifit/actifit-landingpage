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
				<tr v-for="pendingTrans in transList" :key="pendingTrans._id" :class="{'bg-danger': user === pendingTrans.user, 'text-white': user === pendingTrans.user}">
				  <th scope="row">{{ pendingTrans.order }}</th>
				  <td><a :href="pendingTrans.user" target="_blank">@{{ pendingTrans.user }}</a></td>
				  <td class="d-none d-lg-table-cell">{{ date(pendingTrans.date) }}</td>
				  <td class="d-none d-sm-table-cell">{{ pendingTrans.paid_afit }}</td>
				  <td>{{ $t('Within') }} {{ pendingTrans.reward_round * 24 }} {{ $t('hrs') }}</td>
				</tr>
			  </tbody>
			</table>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
 
  export default {
    props: [ 'transList', 'user' ],
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
	}
  }
</script>
<style>

</style>