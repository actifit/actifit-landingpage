<template>
  <h6 class="mb-0 text-center card-title">
    <a :href="link" target="_blank">
      {{ truncateString(title, 70) }}
      <i class="fas fa-external-link-alt"></i>
      <!-- Slot for component-specific icons like pinned/rewarded -->
      <slot></slot>
    </a>
  </h6>
</template>

<script>
import { commonCardMixin } from '~/plugins/commonCardMixin.js'

export default {
  mixins: [commonCardMixin],
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.card-title {
  background: #ff112d;
  padding: 8px 10px;
  min-height: 60px;
}
.card-title a {
  color: #fff;
  text-wrap: balance;
}
.card-title a:hover {
  text-decoration: none;
}
</style>