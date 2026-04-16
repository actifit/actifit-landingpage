<template>
  <div class="modal fade" id="newsModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="news">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ news.title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<SafeRemarkable class="modal-body" :source="body" :options="{'html': true, 'breaks': true, 'typographer': true}"></SafeRemarkable>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import SafeRemarkable from '~/components/SafeRemarkable.vue';

  export default {
    props: ['news'],
	components: {
	  SafeRemarkable
	},
    computed: {
      body () {
		return this.$cleanBody(this.news.body);
      }
    }
  }
</script>
<style>
  .modal-body{
    word-break: break-word;
  }
</style>