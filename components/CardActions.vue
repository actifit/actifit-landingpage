<template>
  <div class="card-actions">
    <div class="post-detail-footer__actions">
      <a href="#" class="post-detail-action" v-if="showReply" @click.prevent="$emit('reply')" :title="$t('Reply')">
        <i class="fas fa-reply"></i>
      </a>
      <a href="#" class="post-detail-action" :class="{ 'post-detail-action--active': hasVoted }" @click.prevent="$emit('vote-prompt')" :data-toggle="modalTarget ? 'modal' : null" :data-target="modalTarget" :title="$t('votes')">
        <i class="far fa-thumbs-up"></i> {{ voteCount }}
      </a>
      <a href="#" class="post-detail-action" @click.prevent="$emit('open-modal')" :data-toggle="modalTarget ? 'modal' : null" :data-target="modalTarget" :title="$t('comments')">
        <i class="far fa-comments"></i> {{ cardData.children }}
      </a>
      <a href="#" class="post-detail-action" @click.prevent="$emit('reblog')" v-if="showReblog && user && cardData.author !== user.account.name" :title="$t('reblog')">
        <i class="far fa-share-square"></i>
      </a>
    </div>

    <div class="post-detail-footer__extra-actions">
      <slot name="extra-actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modalTarget: { type: String, default: null },
    cardData: { type: Object, required: true },
    user: { type: Object, default: null },
    voteCount: { type: Number, required: true },
    hasVoted: { type: Boolean, required: true },
    showReply: { type: Boolean, default: false },
    showReblog: { type: Boolean, default: true }
  },
  emits: ['vote-prompt', 'reblog', 'open-modal', 'reply']
}
</script>

<style scoped>
.card-actions {
  flex: 1 1 auto;
  min-width: 0;
}
.post-detail-footer__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.post-detail-footer__extra-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-left: auto;
}
.post-detail-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #333;
  text-decoration: none;
  transition: color .15s ease;
}
.post-detail-action:hover,
.post-detail-action--active {
  color: #ff112d;
}
@media (max-width: 767px) {
  .post-detail-footer__actions,
  .post-detail-footer__extra-actions {
    width: 100%;
    justify-content: flex-start;
  }
  .post-detail-footer__extra-actions {
    margin-top: 10px;
  }
}
</style>
