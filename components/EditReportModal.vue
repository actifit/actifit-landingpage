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
            <markdown-editor v-model="body" :configs="editorConfig" ref="editor"></markdown-editor>
          </div>
          <div class="form-group">
            <label for="report-tags">Tags</label>
            <input-tag id="report-tags" :tags.sync="tags" :addTagOnBlur="true"></input-tag>
            <small class="form-text text-muted">You don't need to add the #actifit tag. It will be added automatically.</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-brand" @click.prevent="save()">
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
        loading: false, // loading animation in submit button
        editorConfig: { // markdown editor for post body
          autofocus: true,
          spellChecker: false,
          previewRender: (body) => {
            return marked(body.replace(/@([\w-]+)(?![\w-])/g,'[$&](https://busy.org/$&)'))
          },
          forceSync: true,
          status: ['lines', 'words'],
          promptURLs: true
        }
      }
    },
    computed: {
      ...mapGetters(['editReport'])
    },
    watch: {
      editReport () {
        // set initial values after edit button was clicked
        this.title = this.editReport.title
        this.body = this.editReport.body

        const meta = JSON.parse(this.editReport.json_metadata)
        this.tags = meta.hasOwnProperty('tags') ? meta.tags.filter(tag => tag !== 'actifit') : [] // actifit as default tag, if no tags are present (for some reason)

        // refresh editor
        setTimeout(() => {
          this.$refs.editor.simplemde.codemirror.refresh()
        }, 250)
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
            // stop loading animation and show notification
            this.loading = false
            this.$notify({
              group: err ? 'error' : 'success',
              text: err ? 'Unknown error: Your changes could not be saved.' : 'Changes successfully saved!',
              position: 'top center'
            })

            // update report in store
            this.$store.dispatch('updateReport', {
              author: this.editReport.author,
              permlink: this.editReport.permlink
            })
          }
        )
      }
    }
  }
</script>
