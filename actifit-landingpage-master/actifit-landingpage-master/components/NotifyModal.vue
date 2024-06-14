<template>
  <div class="modal fade" id="notifyModal" ref="notifyModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div v-if="modalTitle" class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ modalTitle }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body" v-html="modalText"></div>
      </div>
    </div>
  </div>
</template>

<script>
 
  export default {
    props: [ 'modalTitle', 'modalText' ],
	components: {
	  
	},
    computed: {
      
    },
	methods: {
	  
	}
  }
</script>
<style>

</style>