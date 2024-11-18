<template>
  <div class="modal fade" id="profileImageModal" ref="profileImageModal" tabindex="-1">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('change_profile_image') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="disclaimer alert alert-info">
            {{ $t('profile_image_disclaimer') }}
          </div>
          <div class="image-preview">
            <img 
              :src="imagePreviewUrl" 
              alt="Profile Image" 
              width="150" 
              height="150"
              @load="handleImageLoadSuccess"
              @error="handleImageLoadError"
              v-show="!imgUploading"/>
            <div v-show="imgUploading" class="loader"></div>
          </div>
          <div class="form-group">
            <label for="imageUpload">{{ $t('upload_image') }}</label>
            <input id="image-upload" type="file" @change="handleImageUpload" accept=".bmp,.png,.gif,.jpeg,.jpg" />
          </div>
          <div class="form-group">
            <label for="imageUrl">{{ $t('or_paste_url') }}</label>
            <div class="input-group">
              <input id="imageUrl" v-model="imageUrl" class="form-control" type="text" />
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" @click="handleUrlUpload">{{ $t('upload_image') }}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close">{{ $t('Cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="save">{{ $t('Save') }}</button>
        </div>
        <div v-if="isSaving" class="progress-bar-container">
          <div class="progress-bar"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';


export default {
  props: ['username'],
  data() {
    return {
      imageUrl: '',
      uploadedImage: null,
      imgUploading: false,
      imagePreviewUrl: '',
      profImgUrl: process.env.hiveImgUrl,
      isSaving: false,
      allowedTypes : ['image/bmp', 'image/png', 'image/gif', 'image/jpeg', 'image/jpg'],
    };
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        if (!this.allowedTypes.includes(fileType) || !['.bmp', '.png', '.gif', '.jpeg', '.jpg'].includes(fileExtension)) {
          alert('Please upload a valid image file (BMP, PNG, GIF, JPEG, JPG).');
          event.target.value = '';
          return;
        }

        this.imgUploading = true;
        this.uploadedImage = file;
        this.imageUrl = '';
        console.log(`meow uploadedImage: ${this.uploadedImage}`)
        this.uploadImage(file)
          .then((url) => {
            this.imagePreviewUrl = url;
            console.log(`meow url: ${this.imagePreviewUrl}`)
            this.imgUploading = false;
          })
          .catch((error) => {
            console.error('Image upload failed:', error);
            this.imgUploading = false;
          });
      }
    },
    handleUrlUpload() {
      if (this.imageUrl) {
        this.imgUploading = true;
        this.imagePreviewUrl = this.imageUrl;
      }
    },
    handleImageLoadSuccess() {
      console.log('Image loaded successfully');
      this.imgUploading = false;
    },
    handleImageLoadError() {
      console.error('meow Image failed to load');
      this.handleInvalidImage();
    },
    handleInvalidImage() {
      alert('meow Invalid image URL. Please provide a valid image URL.');
      this.imageUrl = '';
      this.imagePreviewUrl = `${this.profImgUrl}/u/${this.username}/avatar`;
      this.imgUploading = false;
    },
    cancel() {
      this.$emit('close');
      this.reset();
    },
    async save() {
      this.isSaving = true;

      let imageUrl = this.imageUrl;

      try {
        if (this.uploadedImage) {
          imageUrl = await this.uploadImage(this.uploadedImage);
        } else if (this.imageUrl) {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = this.imageUrl;
          });
        } else {
          throw new Error('No image selected');
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        this.$emit('image-changed', imageUrl);
        this.$emit('close');
        this.reset();
        $(this.$refs.profileImageModal).modal('hide');
        $('.modal-backdrop').remove();
      } catch (error) {
        console.error('Image update failed:', error);
      } finally {
        this.isSaving = false;
      }
    },
    reset() {
      this.imageUrl = '';
      this.uploadedImage = null;
      this.imagePreviewUrl = `${this.profImgUrl}/u/${this.username}/avatar`;
    },
    async uploadImage(file) {
        const key = (
          Date.now().toString(36) +
          Math.random().toString(36).substr(2, 11) +
          Math.random().toString(36).substr(2, 11)
        ).toUpperCase();

        const renamedFile = new File([file], key, { type: file.type });
        
        const formData = new FormData();
        formData.append('image', renamedFile);

        try {
          const response = await axios.post('https://usermedia.actifit.io/upload', formData, {
            headers: {
              'Authorization': 'a6iSgyExViuVt6V10fOjZjfezh2B',
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Upload Success:', response.data);
          const imageUrl = 'https://usermedia.actifit.io/' + key;
          console.log(`meow imageurl: ${imageUrl}`)
          return imageUrl;
          
        } catch (error) {
          console.log('meow Upload Error:', error);
          throw error;
        }
      },
  },
  mounted() {
    this.imagePreviewUrl = `${this.profImgUrl}/u/${this.username}/avatar`;

    const modal = this.$refs.profileImageModal;

    $(modal).on('show.bs.modal', () => {
      this.reset();
    });

    $(modal).on('hide.bs.modal', () => {
      this.reset();
    });
  },
};
</script>

<style scoped>
.image-preview {
  text-align: center;
  margin-bottom: 15px;
  position: relative;
}

.loader {
  border: 4px solid #f3f3f3;
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: auto;
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background-color: #f3f3f3;
  position: absolute;
  bottom: 0;
  left: 0;
}

.progress-bar {
  width: 100%;
  height: 100%;
  background-color: #3498db;
  animation: load 2s linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes load {
  0% { width: 0; }
  100% { width: 100%; }
}
.disclaimer {
  margin-bottom: 15px;
  font-size: 0.9em;
  text-align: center;
}
</style>
