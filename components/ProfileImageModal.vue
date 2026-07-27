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
            <canvas
              v-show="sourceImage && !imgUploading"
              ref="cropCanvas"
              class="crop-canvas"
              width="300"
              height="300"
              @pointerdown="startDragging"
              @pointermove="dragImage"
              @pointerup="stopDragging"
              @pointercancel="stopDragging"
            ></canvas>
            <img 
              v-show="!sourceImage && !imgUploading"
              :src="imagePreviewUrl" 
              alt="Profile Image" 
              width="150" 
              height="150"
              @load="handleImageLoadSuccess"
              @error="handleImageLoadError"/>
            <div v-show="imgUploading" class="loader"></div>
          </div>
          <div v-if="sourceImage" class="crop-controls">
            <button type="button" class="btn btn-outline-secondary" aria-label="Rotate left" @click="rotateImage(-90)">
              <i class="fas fa-undo"></i>
            </button>
            <input
              v-model.number="zoom"
              class="zoom-control"
              type="range"
              min="1"
              max="3"
              step="0.01"
              aria-label="Zoom"
              @input="drawCropPreview"
            />
            <button type="button" class="btn btn-outline-secondary" aria-label="Rotate right" @click="rotateImage(90)">
              <i class="fas fa-redo"></i>
            </button>
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
      sourceImage: null,
      zoom: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      sourceImageType: 'image/jpeg',
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
        this.loadImageForCropping(file)
          .catch((error) => {
            console.error('Image preview failed:', error);
            this.uploadedImage = null;
            this.imgUploading = false;
          });
      }
    },
    loadImageForCropping(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const image = new Image();
          image.onerror = reject;
          image.onload = () => {
            this.prepareCropImage(image, file.type).then(resolve);
          };
          image.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    },
    prepareCropImage(image, imageType = 'image/jpeg') {
      this.sourceImage = image;
      this.sourceImageType = ['image/png', 'image/gif'].includes(imageType) ? 'image/png' : 'image/jpeg';
      this.zoom = 1;
      this.rotation = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.imgUploading = false;
      return this.$nextTick().then(() => {
        this.drawCropPreview();
      });
    },
    loadUrlForCropping(url) {
      return new Promise((resolve, reject) => {
        let parsedUrl;
        try {
          parsedUrl = new URL(url);
        } catch (error) {
          reject(error);
          return;
        }
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          reject(new Error('Invalid image URL'));
          return;
        }
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onerror = () => {
          const error = new Error('This image host does not allow cropping from another website.');
          error.code = 'IMAGE_URL_CORS';
          reject(error);
        };
        image.onload = () => {
          const imageType = /\.(png|gif)$/i.test(parsedUrl.pathname) ? 'image/png' : 'image/jpeg';
          this.prepareCropImage(image, imageType).then(resolve);
        };
        image.src = parsedUrl.href;
      });
    },
    imageScale() {
      if (!this.sourceImage) return 1;
      const canvasSize = this.$refs.cropCanvas ? this.$refs.cropCanvas.width : 300;
      const isSideways = Math.abs(this.rotation % 180) === 90;
      const imageWidth = isSideways ? this.sourceImage.height : this.sourceImage.width;
      const imageHeight = isSideways ? this.sourceImage.width : this.sourceImage.height;
      return Math.max(canvasSize / imageWidth, canvasSize / imageHeight) * this.zoom;
    },
    clampOffsets() {
      if (!this.sourceImage) return;
      const canvasSize = this.$refs.cropCanvas ? this.$refs.cropCanvas.width : 300;
      const isSideways = Math.abs(this.rotation % 180) === 90;
      const scale = this.imageScale();
      const displayedWidth = (isSideways ? this.sourceImage.height : this.sourceImage.width) * scale;
      const displayedHeight = (isSideways ? this.sourceImage.width : this.sourceImage.height) * scale;
      const maxX = Math.max(0, (displayedWidth - canvasSize) / 2);
      const maxY = Math.max(0, (displayedHeight - canvasSize) / 2);
      this.offsetX = Math.max(-maxX, Math.min(maxX, this.offsetX));
      this.offsetY = Math.max(-maxY, Math.min(maxY, this.offsetY));
    },
    drawCropPreview() {
      const canvas = this.$refs.cropCanvas;
      if (!canvas || !this.sourceImage) return;
      this.clampOffsets();
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2 + this.offsetX, canvas.height / 2 + this.offsetY);
      context.rotate(this.rotation * Math.PI / 180);
      const scale = this.imageScale();
      context.scale(scale, scale);
      context.drawImage(this.sourceImage, -this.sourceImage.width / 2, -this.sourceImage.height / 2);
      context.restore();
    },
    startDragging(event) {
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    dragImage(event) {
      if (!this.isDragging) return;
      const canvas = this.$refs.cropCanvas;
      const bounds = canvas.getBoundingClientRect();
      this.offsetX += (event.clientX - this.dragStartX) * canvas.width / bounds.width;
      this.offsetY += (event.clientY - this.dragStartY) * canvas.height / bounds.height;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
      this.drawCropPreview();
    },
    stopDragging() {
      this.isDragging = false;
    },
    rotateImage(degrees) {
      this.rotation = (this.rotation + degrees) % 360;
      this.offsetX = 0;
      this.offsetY = 0;
      this.drawCropPreview();
    },
    croppedImageFile() {
      this.drawCropPreview();
      return new Promise((resolve, reject) => {
        const exportSize = 1024;
        const previewCanvas = this.$refs.cropCanvas;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = exportSize;
        exportCanvas.height = exportSize;
        const context = exportCanvas.getContext('2d');
        const exportRatio = exportSize / previewCanvas.width;

        if (this.sourceImageType === 'image/jpeg') {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, exportSize, exportSize);
        }

        context.save();
        context.translate(
          exportSize / 2 + this.offsetX * exportRatio,
          exportSize / 2 + this.offsetY * exportRatio
        );
        context.rotate(this.rotation * Math.PI / 180);
        const scale = this.imageScale() * exportRatio;
        context.scale(scale, scale);
        context.drawImage(this.sourceImage, -this.sourceImage.width / 2, -this.sourceImage.height / 2);
        context.restore();

        try {
          exportCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Unable to export the cropped image.'));
              return;
            }
            const extension = this.sourceImageType === 'image/jpeg' ? 'jpg' : 'png';
            resolve(new File([blob], `profile-image.${extension}`, { type: this.sourceImageType }));
          }, this.sourceImageType, 0.9);
        } catch (error) {
          const cropError = new Error('This image host blocks cropping. Save the original URL or upload the image as a file instead.');
          cropError.code = 'TAINTED_CANVAS';
          reject(cropError);
        }
      });
    },
    async handleUrlUpload() {
      if (this.imageUrl) {
        this.imgUploading = true;
        this.uploadedImage = null;
        this.sourceImage = null;
        try {
          await this.loadUrlForCropping(this.imageUrl);
        } catch (error) {
          console.error('Image URL could not be loaded for cropping:', error);
          if (error.code === 'IMAGE_URL_CORS') {
            this.sourceImage = null;
            this.imagePreviewUrl = this.imageUrl;
            this.imgUploading = false;
            alert('This image host does not allow cropping. You can save the original URL without adjustments, or download the image and upload it as a file to crop it.');
          } else {
            this.handleInvalidImage();
          }
        }
      }
    },
    handleImageLoadSuccess() {
      this.imgUploading = false;
    },
    handleImageLoadError() {
      this.handleInvalidImage();
    },
    handleInvalidImage() {
      alert('Invalid image URL. Please provide a valid image URL.');
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
        if (this.sourceImage) {
          const croppedImage = await this.croppedImageFile();
          imageUrl = await this.uploadImage(croppedImage);
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
        if (error.code === 'TAINTED_CANVAS' || error.name === 'SecurityError') {
          alert('This image host blocks cropping. Save the original URL or upload the image as a file instead.');
        }
      } finally {
        this.isSaving = false;
      }
    },
    reset() {
      this.imageUrl = '';
      this.uploadedImage = null;
      this.sourceImage = null;
      this.zoom = 1;
      this.rotation = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.isDragging = false;
      this.sourceImageType = 'image/jpeg';
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
          const response = await axios.post('/api/proxy/upload', formData);
          const imageUrl = 'https://usermedia.actifit.io/' + key;
          return imageUrl;
          
        } catch (error) {
          console.error('Upload error:', error);
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

.crop-canvas {
  display: block;
  width: 300px;
  max-width: 100%;
  height: auto;
  margin: auto;
  border: 3px solid #ffffff;
  border-radius: 50%;
  cursor: grab;
  touch-action: none;
}

.crop-canvas:active {
  cursor: grabbing;
}

.crop-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.zoom-control {
  flex: 1;
  max-width: 250px;
  margin: 0 15px;
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
