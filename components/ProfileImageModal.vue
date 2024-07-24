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
          <div class="image-preview">
            <img :src="`${this.profImgUrl}/u/${username}/avatar`" alt="Profile Image" width="150" height="150" />
          </div>
          <div class="form-group">
            <label for="imageUpload">{{ $t('upload_image') }}</label>
            <input id="image-upload" type="file" @change="handleImageUpload" />
          </div>
          <div class="form-group">
            <label for="imageUrl">{{ $t('or_paste_url') }}</label>
            <textarea id="imageUrl" v-model="imageUrl" class="form-control" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal" aria-label="Close">{{ $t('Cancel') }}</button>
          <button type="button" class="btn btn-primary" @click="save">{{ $t('Save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AWS from 'aws-sdk';


const bucketName = 'actifit';
const actifit_host = 'https://usermedia.actifit.io/'
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});
export default {
  props: ['username'],
  data() {
    return {
      imageUrl: '',
      uploadedImage: null,
      imgUploading: false,
      profImgUrl: process.env.hiveImgUrl,
    };
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedImage = file;
        this.imageUrl = '';
      }
    },
    cancel() {
      this.$emit('close');
      this.reset();
    },
    async save() {
      let imageUrl = this.imageUrl;
      if (this.uploadedImage) {
        try {
          imageUrl = await this.uploadImage(this.uploadedImage);
        } catch (error) {
          console.error('Image upload failed:', error);
          return;
        }
      }
      this.$emit('image-changed', imageUrl);
      this.$emit('close');
      this.reset();
    },
    reset() {
      this.imageUrl = '';
      this.uploadedImage = false;
    },
    async uploadImage(file) {

      // Display image upload animation
      this.imgUploading = true;

      // Generate new key/name for the image to store
      const key = (Date.now().toString(36) + Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11)).toUpperCase();

      // Initialize S3 instance to process the upload
      const s3 = new AWS.S3();
      const params = {
        Bucket: bucketName, // replace with your bucket name
        Key: key, // this will be your share url name
        ContentType: 'image/jpeg',
        Body: file,
        ACL: 'public-read',
      };

      const img_url = actifit_host + key; // replace with your host

      // Reference to this to be used inside the s3 response method
      const main_container = this;

      try {
        await s3.putObject(params).promise();
        main_container.imgUploading = false;
        return img_url;
      } catch (error) {
        main_container.imgUploading = false;
        throw error;
      }
    },
  },
  mounted() {
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
}
</style>
