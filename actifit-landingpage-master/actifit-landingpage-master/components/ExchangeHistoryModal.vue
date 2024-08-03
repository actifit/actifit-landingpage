<template>
  <div class="modal fade" id="exchangeHistoryModal" ref="exchangeHistoryModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('Ex_Trans_History') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<table class="table table-hover">
			  <thead class="text-brand">
				<tr>
				  <th scope="col" class="d-none d-md-table-cell">{{ $t('User') }}</th>
				  <th scope="col">{{ $t('Date') }}</th>
				  <th scope="col">{{ $t('AFIT_Exchanged') }}</th>
				  <th scope="col">{{ $t('Status') }}</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="histTrans in transList" :key="histTrans._id" :class="{'bg-danger': !histTrans.upvote_processed, 'text-white': !histTrans.upvote_processed}">
				  <td class="d-none d-md-table-cell"><a :href="histTrans.user " target="_blank">@{{ histTrans.user }}</a></td>
				  <td>{{date(histTrans.date)}}</td>
				  <td>{{ histTrans.paid_afit }}</td>
				  <td v-if="histTrans.upvote_processed && !histTrans.refunded">{{ $t('Complete') }}</td>
				  <td v-else-if="histTrans.refunded">{{ $t('Refunded') }}</td>
				  <td v-else>{{ $t('In_Progress') }}</td>
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
    props: [ 'transList' ],
	components: {
	  
	},
    computed: {
      
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
	}
  }
</script>
<style>

</style>