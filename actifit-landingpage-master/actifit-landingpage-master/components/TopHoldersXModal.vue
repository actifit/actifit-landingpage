<template>
  <div class="modal fade" id="topHoldersXModal" ref="topHoldersXModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('top_afitx_holders_title') }} <img src="/img/AFITX.png" class="mr-2 token-logo"></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<table class="table table-hover">
			  <thead class="text-brand">
				<tr>
				  <th scope="col">{{ $t('Rank') }}</th>
				  <th scope="col">{{ $t('User') }}</th>
				  <th scope="col">{{ $t('Afitx_Bal') }}</th>
				</tr>
			  </thead>
			  <tbody>
				<tr v-for="(topHolder, key) in holdersList" :key="key" :class="{'bg-danger': user === topHolder.account, 'text-white': user === topHolder.account}">
				  <td>{{ key + 1 }}</td>
				  <td>
					<a :href="topHolder.account" target="_blank" :class="{'text-white': user === topHolder.account}">
						@{{ topHolder.account }}
					</a>
				  </td>
				  <td>{{ numberFormat(topHolder.balance, 5) }} {{ $t('AFITX') }}</td>
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
    props: [ 'holdersList', 'user', ],
	methods: {
	  /**
       * Formats numbers with commas and dots.
       *
       * @param number
	   * @param precision
       * @returns {string}
       */
      numberFormat (number, precision) {
        return new Intl.NumberFormat('en-EN', { maximumFractionDigits : precision}).format(number)
      },
	  date(val) {
        let date = new Date(val)
        let minutes = date.getMinutes()
        return date.getDate() + '/' 
			+ (date.getMonth() + 1) + '/' 
			+ date.getFullYear() + ' ' 
			+ date.getHours() + ':' 
			+ (minutes < 10 ? '0' + minutes : minutes)
      }
	}
  }
</script>
<style>
	.token-logo{
		width: 40px;
		height: 40px;
	}
	@media screen and (max-width: 600px){
		.table td, .table th{
			padding: .3rem;
		}
	}
</style>
