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
            <img v-if="!imgUploading" :src="imagePreviewUrl" alt="Profile Image" width="150" height="150" />
            <div v-else class="loader"></div>
          </div>
          <div class="form-group">
            <label for="imageUpload">{{ $t('upload_image') }}</label>
            <input id="image-upload" type="file" @change="handleImageUpload" accept=".bmp,.png,.gif,.jpeg,.jpg" />
          </div>
          <div class="form-group">
            <label for="imageUrl">{{ $t('or_paste_url') }}</label>
            <input id="imageUrl" v-model="imageUrl" class="form-control" type="text" @blur="handleUrlUpload" />
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
import AWS from 'aws-sdk';

const bucketName = 'actifit';
const actifit_host = 'https://usermedia.actifit.io/';
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

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
    };
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = ['image/bmp', 'image/png', 'image/gif', 'image/jpeg'];
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

        if (!allowedTypes.includes(fileType) || !['.bmp', '.png', '.gif', '.jpeg', '.jpg'].includes(fileExtension)) {
          alert('Please upload a valid image file (BMP, PNG, GIF, JPEG, JPG).');
          event.target.value = '';
          return;
        }

        this.imgUploading = true;
        this.uploadedImage = file;
        this.imageUrl = '';
        this.uploadImage(file)
          .then((url) => {
            this.imagePreviewUrl = url;
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
        const img = new Image();
        img.onload = () => {
          this.imagePreviewUrl = this.imageUrl;
          this.imgUploading = false;
        };
        img.onerror = () => {
          alert('Invalid image URL.');
          this.imgUploading = false;
        };
        img.src = this.imageUrl;
      }
    },
    cancel() {
      this.$emit('close');
      this.reset();
    },
    async save() {
      this.isSaving = true;
      let imageUrl = this.imageUrl;
      if (this.uploadedImage) {
        try {
          imageUrl = await this.uploadImage(this.uploadedImage);
        } catch (error) {
          console.error('Image upload failed:', error);
          this.isSaving = false;
          return;
        }
      }
      // Broadcast transaction to blockchain here
      // Simulating blockchain confirmation delay
      setTimeout(() => {
        this.$emit('image-changed', imageUrl);
        this.$emit('close');
        this.reset();
        this.isSaving = false;
        $(this.$refs.profileImageModal).modal('hide');
        $('.modal-backdrop').remove();
      }, 2000);
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

      const s3 = new AWS.S3();
      const params = {
        Bucket: bucketName,
        Key: key,
        ContentType: file.type,
        Body: file,
        ACL: 'public-read',
      };

      const img_url = actifit_host + key;

      try {
        await s3.putObject(params).promise();
        return img_url;
      } catch (error) {
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