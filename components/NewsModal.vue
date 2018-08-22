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
        <div class="modal-body" v-html="body"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import marked from 'marked'

  export default {
    props: ['news'],
    computed: {
      body () {
        return marked(this.news.body)
      }
    }
  }
</script>
