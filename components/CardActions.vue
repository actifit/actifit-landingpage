<template>
  <div class="card-actions">
    <div class="post-detail-footer__actions">
      <a href="#" class="post-detail-action" v-if="showEdit" @click.prevent="$emit('edit')" :title="$t('Edit_note')">
        <i class="fas fa-edit"></i>
      </a>
      <a href="#" class="post-detail-action" v-if="showDelete" @click.prevent="$emit('delete')" :title="$t('Delete_note')">
        <i class="fas fa-trash-alt"></i><i class="fas fa-spin fa-spinner" v-if="deleting"></i>
      </a>
      <a href="#" class="post-detail-action" v-if="showReply" @click.prevent="$emit('reply')" :title="$t('Reply')">
        <i class="fas fa-reply"></i>
      </a>
      <a href="#" class="post-detail-action" :class="{ 'post-detail-action--active': hasVoted }" @click.prevent="$emit('vote-prompt')" :data-toggle="voteModalTarget ? 'modal' : null" :data-target="voteModalTarget" :title="$t('votes')">
        <i class="far fa-thumbs-up"></i> {{ voteCount }}
      </a>
      <button type="button" class="post-detail-action" v-if="showComments && !commentsDisabled" :class="{ 'post-detail-action--active': commentsActive }" @click="$emit('open-modal')" :data-toggle="modalTarget ? 'modal' : null" :data-target="modalTarget" :aria-expanded="commentsActive ? 'true' : 'false'" :title="commentsTitle || $t('comments')">
        <i class="far fa-comments"></i> {{ commentsCount !== null ? commentsCount : cardData.children }}
      </button>
      <span v-else-if="showComments" class="post-detail-action post-detail-action--static">
        <i class="far fa-comments"></i> {{ commentsCount !== null ? commentsCount : cardData.children }}
      </span>
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
    voteModalTarget: { type: String, default: '#voteModal' },
    cardData: { type: Object, required: true },
    user: { type: Object, default: null },
    voteCount: { type: Number, required: true },
    hasVoted: { type: Boolean, required: true },
    showReply: { type: Boolean, default: false },
    showReblog: { type: Boolean, default: true },
    showEdit: { type: Boolean, default: false },
    showDelete: { type: Boolean, default: false },
    deleting: { type: Boolean, default: false },
    showComments: { type: Boolean, default: true },
    commentsCount: { type: Number, default: null },
    commentsActive: { type: Boolean, default: false },
    commentsDisabled: { type: Boolean, default: false },
    commentsTitle: { type: String, default: '' }
  },
  emits: ['vote-prompt', 'reblog', 'open-modal', 'reply', 'edit', 'delete']
}
</script>

<style scoped>
.card-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--post-footer-muted, #333);
  text-decoration: none;
  transition: color .15s ease;
}
.post-detail-action:hover,
.post-detail-action--active {
  color: var(--post-footer-brand, #ff112d);
}
.post-detail-action--static {
  cursor: default;
}
.post-detail-action--static:hover {
  color: inherit;
}
.post-detail-action:focus-visible {
  outline: 2px solid var(--post-footer-brand, #ff112d);
  outline-offset: 3px;
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

<style>
/* Non-scoped fallback for the action colors. The scoped rules above match via CardActions'
   data-v attribute, but on some render paths (notably the blog-listing cards) that attribute
   is dropped from the <a class="post-detail-action"> element, so its scoped color rule never
   applies and the vote icon stays black even when the user has voted. Re-declare the colors by
   class (unscoped) so they land regardless. Values still resolve from the --post-footer-* vars
   (or their fallbacks), so the header/footer strips keep their own colors. */
.card-actions .post-detail-action { color: var(--post-footer-muted, #6b7280) !important; }
.card-actions .post-detail-action:hover,
.card-actions .post-detail-action--active { color: var(--post-footer-brand, #ff112d) !important; }
</style>
