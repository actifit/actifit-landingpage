<template>
  <div :class="classContxt" id="buyOptionsModal" ref="buyOptionsModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div v-if="modalTitle" class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="close" data-toggle="modal" data-target="containerID" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body" v-html="modalText"></div>
		<div class="modal-body">
			<div class="row col-12">
				<div class="col-sm-12 col-md-6">
					<div class="row">
					<a href="https://steem-engine.com/?p=market&t=AFIT" class="btn btn-brand btn-lg border" target="_blank" rel="noopener noreferrer">{{ $t('buy_afit_se') }}</a>
					</div>
					<div class="row">
					<a href="https://hive-engine.com/?p=market&t=AFIT" class="btn btn-brand btn-lg border" target="_blank" rel="noopener noreferrer">{{ $t('buy_afit_he') }}</a>
					</div>
					<div class="row">
					<a href="/wallet" class="btn btn-brand btn-lg border" target="_blank" >{{ $t('Move_AFIT_to_Wallet') }}</a>
					</div>
				</div>
				<div class="col-sm-12 col-md-6">
					<a href="#" @click.prevent="proceedBuy" class="btn btn-success btn-lg border" data-toggle="modal" :data-target="containerID">{{ $t('continue_gadget_purchase') }}</a>
				</div>
			</div>
		</div>
		
      </div>
    </div>
  </div>
</template>

<script>
 
  export default {
    props: [ 'modalTitle', 'modalText', 'initiator', 'containerID'],
	data () {
		return {
			classContxt: "modal modal-opts fade nooverflow"
		}
	},
	components: {
	  
	},
    computed: {
      
    },
	methods: {
	  async proceedBuy(){
		console.log('proceedBuy Options');
		this.$emit('proceed-purchase');
	  }
	},
	async mounted () {

	}
  }
</script>
<style>
.nooverflow{
	overflow: hidden;
}
</style>