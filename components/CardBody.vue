<template>
  <div>
    <!-- Image Carousel -->
    <div class="row">
      <div class="col-12">
        <div v-if="!imageLoadFailed" class="image-carousel-container" :key="imageGeneration">
          <div v-if="imageLoading" class="image-loader-container">
            <i class="fas fa-spinner fa-spin text-brand"></i>
          </div>
          <a
            href="#"
            :style="{ visibility: imageLoading ? 'hidden' : 'visible' }"
            class="text-brand"
            @click.prevent="$emit('open-modal')"
            :data-toggle="modalTarget ? 'modal' : null"
            :data-target="modalTarget"
            :title="$t('read_more_small')"
          >
            <img :key="currentImageSrc" :src="currentImageSrc" :alt="cardData.title" class="card-image" @load="onImageLoad" @error="onImageError" referrerpolicy="no-referrer">
          </a>
          <template v-if="allImages.length > 1">
            <div class="carousel-arrow left" @click.prevent="prevImage"><i class="fas fa-chevron-left"></i></div>
            <div class="carousel-arrow right" @click.prevent="nextImage"><i class="fas fa-chevron-right"></i></div>
            <template v-if="!imageLoading">
              <div class="image-counter">{{ currentImageIndex + 1 }} / {{ allImages.length }}</div>
              <div class="carousel-bullets">
                <span v-for="(img, index) in allImages" :key="index" class="carousel-bullet" :class="{ 'active': index === currentImageIndex }" @click.prevent="goToImage(index)"></span>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- Body Snippet -->
    <div class="row">
      <div class="col-12">
        <a
          href="#"
          class=""
          @click.prevent="$emit('open-modal')"
          :data-toggle="modalTarget ? 'modal' : null"
          :data-target="modalTarget"
          :title="$t('read_more_small')"
        >
          <div>
            <span>{{ renderSnippet(cardData.body, 150) }}</span>
            <i class="fas fa-external-link-alt"></i>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // We don't need the whole mixin here, just the props and methods passed down
  props: {
    cardData: { type: Object, required: true },
    modalTarget: { type: String, required: true },
    // Carousel specific props
    imageLoadFailed: { type: Boolean, default: false },
    imageLoading: { type: Boolean, default: true },
    imageGeneration: { type: Number, default: 0 },
    currentImageSrc: { type: String, default: '' },
    allImages: { type: Array, default: () => [] },
    currentImageIndex: { type: Number, default: 0 }
  },
  emits: ['open-modal', 'image-load', 'image-error', 'next-image', 'prev-image', 'go-to-image'],
  methods: {
    // We emit events for the parent to handle the logic from the mixin
    onImageLoad() { this.$emit('image-load'); },
    onImageError(event) { this.$emit('image-error', event); },
    nextImage() { this.$emit('next-image'); },
    prevImage() { this.$emit('prev-image'); },
    goToImage(index) { this.$emit('go-to-image', index); },
    renderSnippet(content, length) {
      if (!content) return '';
      // Basic clean and truncate, parent can have more complex logic
      let postContent = content.replace(/<[^>]+>/g, '').replace(/\n/g, ' ');
      if (postContent.length > length) {
        return postContent.substring(0, length - 3) + '...';
      }
      return postContent;
    }
  }
}
</script>

<style scoped>
a {
  color: #333;
}
a:hover {
  text-decoration: none;
}
.card-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.image-carousel-container {
  position: relative;
  overflow: hidden;
  height: 150px;
  background-color: #f0f0f0;
}
.image-loader-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  z-index: 2;
}
.carousel-arrow:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
.carousel-arrow.left {
  left: 10px;
}
.carousel-arrow.right {
  right: 10px;
}
.image-counter {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
  z-index: 2;
}
.carousel-bullets {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}
.carousel-bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}
.carousel-bullet.active {
  background-color: #fff;
}
</style>