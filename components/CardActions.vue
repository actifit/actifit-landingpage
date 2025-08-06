<template>
  <div class="row details mt-2">
    <!-- Common Left Side Actions -->
    <div class="col-6">
      <a href="#" @click.prevent="$emit('vote-prompt')" data-toggle="modal" data-target="#voteModal" :class="{ 'text-brand': hasVoted }" :title="$t('votes')">
        <i class="far fa-thumbs-up"></i> {{ voteCount }}
      </a>
      <a
        href="#"
        @click.prevent="$emit('open-modal')"
        :data-toggle="modalTarget ? 'modal' : null"
        :data-target="modalTarget"
        :title="$t('comments')"
      >
      <i class="far fa-comments ml-2" :title="$t('comments')" @click.prevent="$emit('showComments')"></i> {{ cardData.children }}
      </a>
      <i class="far fa-share-square ml-2" @click.prevent="$emit('reblog')" v-if="user && cardData.author !== user.account.name" :title="$t('reblog')"></i>
    </div>
    <!-- Slot for Different Right Side Actions -->
    <div class="col-6 text-right">
      <slot name="extra-actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modalTarget: { type: String, required: true },
    cardData: { type: Object, required: true },
    user: { type: Object, default: null },
    voteCount: { type: Number, required: true },
    hasVoted: { type: Boolean, required: true },
  },
  emits: ['vote-prompt', 'reblog', 'open-modal']
}
</script>

<style scoped>
.details {
  line-height: 1rem;
}
a {
  color: #333;
}
a:hover {
  text-decoration: none;
}
.text-brand {
  color: #ff112d !important;
}
</style>
