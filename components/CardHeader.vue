<template>
  <h6 class="mb-0 text-center card-title" :class="{ 'card-title-accent': accent }">
    <a :href="link" target="_blank" rel="noopener noreferrer">
      {{ truncateString(title, 70) }}
      <i v-if="showExternalLink" class="fas fa-external-link-alt"></i>
      <!-- "rewarded" checkmark icon -->
      <span v-if="showRewardedCheck" :title="$t('Rewarded_report')" class="check-tooltip">
        <i class="fas fa-check p-2"></i>
      </span>
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
    },
    showRewardedCheck: {
      type: Boolean,
      default: false
    },
    accent: {
      type: Boolean,
      default: false
    },
    showExternalLink: {
      type: Boolean,
      default: true
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
.card-title-accent {
  height: 42px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff112d !important;
  font-weight: 700;
}
.card-title-accent a {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}
</style>
