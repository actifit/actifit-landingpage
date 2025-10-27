<template>
  <div class="search-result card">
    <div class="card-body">
      <h5 class="card-title">
        <a :href="postLink" target="_blank">{{ post.title }}</a>
      </h5>
      <h6 class="card-subtitle mb-2 text-muted">@{{ post.author }}</h6>
      <p class="card-text">{{ truncatedBody }}</p>
      <a :href="postLink" target="_blank" class="card-link">Read more</a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  computed: {
    postLink() {
      return `/@${this.post.author}/${this.post.permlink}`;
    },
    truncatedBody() {
      if (!this.post.body) return '';
      const maxLength = 200;
      if (this.post.body.length > maxLength) {
        return this.post.body.substring(0, maxLength) + '...';
      }
      return this.post.body;
    },
  },
};
</script>

<style scoped>
.search-result {
  margin-bottom: 20px;
}
</style>
