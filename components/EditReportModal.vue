<template>
  <div class="modal fade" id="editReportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="editReport">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Edit: {{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="report-title">Title</label>
            <input class="form-control form-control-lg" id="report-title" v-model="title" />
          </div>
          <div class="form-group">
            <textarea class="form-control" v-model="body"></textarea>
          </div>
          <div class="form-group">
            <label for="report-tags">Tags</label>
            <input-tag id="report-tags" :tags.sync="tags" :addTagOnBlur="true"></input-tag>
            <small class="form-text text-muted">You don't need to add the #actifit tag. It will be added automatically.</small>
          </div>
          <div class="preview" v-html="preview"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-success" @click.prevent="save()">
            <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            <i class="fas fa-paper-plane" v-else></i>
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import marked from 'marked'
  import InputTag from 'vue-input-tag'
  import { mapGetters } from 'vuex'

  export default {
    components: {
      InputTag
    },
    data () {
      return {
        title: '', // post title
        body: '', // post body
        tags: [], // post tags
        loading: false // loading animation in submit button
      }
    },
    computed: {
      ...mapGetters(['editReport']),
      preview () {
        // parse markdown, match @ words and convert them to steemit user links
        return marked(this.body.replace(/@([\w-]+)(?![\w-])/g,'[$&](https://steemit.com/$&)'))
      }
    },
    watch: {
      editReport () {
        // set initial values after edit button was clicked
        this.title = this.editReport.title
        this.body = this.editReport.body

        const meta = JSON.parse(this.editReport.json_metadata)
        this.tags = meta.hasOwnProperty('tags') ? meta.tags : ['actifit'] // actifit as default tag, if no tags are present (for some reason)
      }
    },
    methods: {
      save () {
        this.loading = true // start loading animation

        // prepare tags
        const meta = JSON.parse(this.editReport.json_metadata)
        meta.tags = [
          'actifit',
          ...this.tags
            .filter(tag => tag !== 'actifit') // remove actifit tag, its the first tag automatically
            .filter(String) // remove empty values
            .map(tag => tag.trim()) // trim leading and trailing whitespaces from tags
        ]

        // save changes
        this.$steemconnect.comment(
          this.editReport.parent_author,
          this.editReport.parent_permlink,
          this.editReport.author,
          this.editReport.permlink,
          this.title,
          this.body,
          meta,
          (err) => {
            // stop loading animation and show notifitcation
            this.loading = false
            this.$notify({
              group: err ? 'error' : 'success',
              text: err ? 'Unknown error: Your changes could not be saved.' : 'Changes successfully saved!',
              position: 'top center'
            })
          }
        )
      }
    }
  }
</script>
