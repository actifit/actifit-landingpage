<template>
  <div class="modal fade" id="buyOptionsModal" ref="buyOptionsModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div v-if="modalTitle" class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body" v-html="modalText"></div>
		<div class="modal-body">
			<div class="row">
				<div class="w-50">
					<div class="row pl-5">
					<a href="https://steem-engine.com/?p=market&t=AFIT" class="btn btn-brand btn-lg border w-75" target="_blank" rel="noopener noreferrer">{{ $t('buy_afit_se') }}</a>
					</div>
					<div class="row pl-5">
					<a href="https://hive-engine.com/?p=market&t=AFIT" class="btn btn-brand btn-lg border w-75" target="_blank" rel="noopener noreferrer">{{ $t('buy_afit_he') }}</a>
					</div>
					<div class="row pl-5">
					<a href="/wallet" class="btn btn-brand btn-lg border w-75" target="_blank" >{{ $t('Move_AFIT_to_Wallet') }}</a>
					</div>
				</div>
				<div class="w-50 pr-5">
					<a href="#" @click.prevent="proceedBuy" class="btn btn-success btn-lg border w-75" data-dismiss="modal" >{{ $t('continue_gadget_purchase') }}</a>
				</div>
			</div>
		</div>
		
      </div>
    </div>
  </div>
</template>

<script>
 
  export default {
    props: [ 'modalTitle', 'modalText', 'initiator'],
	components: {
	  
	},
    computed: {
      
    },
	methods: {
	  async proceedBuy(){
		console.log('proceedBuy Options');
		this.$emit('proceed-purchase');
		//console.log(this.initiator.$parent.$children.find(_uid));
	  }
	},
	async mounted () {

	}
  }
</script>
<style>

</style>