<template>
  <div class="modal fade" id="memePickerModal" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="far fa-grin-squint-tears"></i> {{ $t('fitness_memes') }}
          </h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body p-0 position-relative">
          <div v-if="uploading" class="meme-upload-overlay">
            <i class="fas fa-spinner fa-spin fa-2x text-brand"></i>
            <span class="mt-2">{{ $t('adding_meme') }}</span>
          </div>
          <iframe
            ref="memeFrame"
            :src="widgetUrl"
            class="meme-widget-frame"
            title="DecentMemes"
            allow="clipboard-write"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

// The DecentMemes widget renders a PNG and ships it back to the parent frame
// via postMessage. We only ever accept messages coming from this origin.
const WIDGET_ORIGIN = 'https://decentmemes.com'

export default {
  data () {
    return {
      widgetUrl: WIDGET_ORIGIN + '/widget/',
      uploading: false,
    }
  },
  mounted () {
    this.boundOnMessage = this.onMessage.bind(this)
    window.addEventListener('message', this.boundOnMessage)
  },
  beforeDestroy () {
    window.removeEventListener('message', this.boundOnMessage)
  },
  methods: {
    async onMessage (event) {
      // only trust messages originating from the DecentMemes widget
      if (event.origin !== WIDGET_ORIGIN) return
      const data = event.data
      if (!data || data.type !== 'memeCreated' || !data.imageDataUrl) return

      try {
        this.uploading = true
        // decode the base64 data URL the widget produced, then push it
        // through our existing image pipeline (usermedia.actifit.io)
        const blob = await (await fetch(data.imageDataUrl)).blob()
        const imageUrl = await this.uploadMeme(blob, data.imageMimeType)

        this.$emit('insert-meme', {
          imageUrl,
          beneficiaries: (data.beneficiaries && data.beneficiaries.post) || [],
          templateId: (data.template && data.template.id) ? data.template.id : null,
        })

        if (typeof $ !== 'undefined') {
          $('#memePickerModal').modal('hide')
        }
      } catch (e) {
        console.error('DecentMemes meme upload failed:', e)
        alert(this.$t('meme_add_failed'))
      } finally {
        this.uploading = false
      }
    },
    async uploadMeme (blob, mimeType) {
      // mirror the upload key/convention used elsewhere in the editor
      const key = (
        Date.now().toString(36) +
        Math.random().toString(36).substr(2, 11) +
        Math.random().toString(36).substr(2, 11)
      ).toUpperCase()

      const file = new File([blob], key, { type: mimeType || blob.type || 'image/png' })
      const formData = new FormData()
      formData.append('image', file)

      await axios.post('/api/proxy/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      return 'https://usermedia.actifit.io/' + key
    },
  }
}
</script>

<style scoped>
.meme-widget-frame {
  width: 100%;
  height: 640px;
  border: 0;
  display: block;
}
.meme-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
.text-brand {
  color: #ff112d;
}
</style>
