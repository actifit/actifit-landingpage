<template>
  <div class="modal fade" id="reportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="report">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ report.title }}</h5><br/>
		  <a :href="'https://busy.org/@' + report.author" target="_blank">
		  <h5 class="modal-author modal-title text-brand" >@{{ report.author}}</h5></a>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" v-html="body"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import marked from 'marked'

  export default {
    props: ['report'],
    computed: {
      body () {
		/* regex to match @ words and convert them to steemit user links */
		var re = /@([\w-]+)(?![\w-])/g;
        return marked(this.report.body.replace(re,'[$&](https://busy.org/$&)'))
      }
    }
  }
</script>

<style>
	.modal-author{
		margin-left: 10px !important;
	}
</style>
