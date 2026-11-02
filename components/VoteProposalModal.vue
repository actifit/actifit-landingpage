<template>
  <div
    v-if="visible && $route.path !== '/signup'"
    id="voteProposalModal"
    ref="voteProposalModal"
    :class="{ 'visible': visible }"
    :style="modalStyle"
    class="modal fade show"
    tabindex="-1"
    role="dialog"
    data-backdrop="false"
  >
    <div><!-- class="modal-dialog" role="document" -->
      <div class="modal-content">
        <div class="modal-header p-1">
          <h5 class="modal-title">{{ $t('proposal_modal_title_year') }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <p>{{ $t('proposal_modal_message') }}</p>
        <div class="text-right">
          <button @click="voteForProposal" :disabled="voting" class="btn m-1 col-5">
            {{ $t('vote_button_text') }}
          </button>
          <button @click="readMore" class="m-1 col-5">{{ $t('read_more_button_text') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import escapeHtml from '~/utils/escapeHtml';

// After "×", stay hidden for this long in this browser.
const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

export default {
  props: {
    bottomOffset: {
      type: Number,
      default: 20,
    }
  },
  data() {
    return {
      visible: false,
      voting: false,
      lookupId: 0,
    };
  },
  watch: {
    user: function (){
      this.adjustVisibility();
    },
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),

    username() {
      return (this.user && this.user.account && this.user.account.name) || null;
    },
    proposalId() {
      return Number(this.$config.proposalId);
    },
    dismissKey() {
      return 'proposal_popup_dismissed_' + this.proposalId;
    },
    modalStyle() {
      return {
        bottom: `${this.bottomOffset}px`,
      };
    },
  },
  methods: {
    closeModal() {
      this.visible = false;
      try { localStorage.setItem(this.dismissKey, String(Date.now())); } catch (e) { /* storage blocked */ }
    },
    recentlyDismissed() {
      try {
        const at = Number(localStorage.getItem(this.dismissKey));
        return at > 0 && Date.now() - at < DISMISS_MS;
      } catch (e) {
        return false;
      }
    },
    async voteForProposal() {
      if (!this.username || this.voting) return;
      // Proposal votes need the active key. HiveSigner sessions only hold a posting
      // token, so HiveSigner users approve the vote on hivesigner.com instead.
      if (!this.$signsInBrowser()) {
        window.open('https://hivesigner.com/sign/update-proposal-votes?proposal_ids=' +
          encodeURIComponent(JSON.stringify([this.proposalId])) + '&approve=true', '_blank');
        this.closeModal();
        return;
      }
      this.voting = true;
      try {
        const res = await this.$processTrxFunc('update_proposal_votes', {
          voter: this.username,
          proposal_ids: [this.proposalId],
          approve: true,
          extensions: []
        }, true);
        if (res && res.success) {
          // also remembered, so a lookup that runs before the vote is in a block
          // (or on a lagging node) does not bring the popup back
          this.closeModal();
        } else if (res && !('cancelled' in res)) {
          // Keychain and HiveAuth failures come back without a message shown; the
          // typed-key path (the one that sets `cancelled`) already shows its own.
          // Escaped: toasts render HTML.
          this.$notify({ group: 'error', text: escapeHtml(res.error || this.$t('error_performing_operation')), position: 'top center' });
        }
      } finally {
        this.voting = false;
      }
    },
    readMore(){
      window.open(this.$config.proposalPostPath, '_blank');
    },
    // Only logged-in users who have not voted yet, and did not just close it.
    async adjustVisibility(){
      const username = this.username;
      if (!username || this.recentlyDismissed()) {
        this.lookupId++;
        this.visible = false;
        return;
      }
      const id = ++this.lookupId;
      let voted = true; // a failed lookup hides the popup rather than nagging voters
      try {
        voted = await this.$store.dispatch('hasVotedProposal', { proposalId: this.proposalId, username });
      } catch (e) { /* node unavailable */ }
      // only the latest lookup counts: the user may have logged out or switched
      // accounts while we waited, and mounted and the user watcher can overlap
      if (id === this.lookupId && username === this.username) this.visible = !voted;
    }
  },
  mounted() {
    this.adjustVisibility();
  },
};
</script>

<style scoped>
.modal.visible {
  display: block;
  opacity: 1;
}

.modal {
  /*display: block;*/
  position: fixed;
  right: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  border-radius: 8px;
  z-index: 1000;
  pointer-events: auto;
  max-width: 330px;
  max-height: 230px;
  height: auto;
}

@media (max-width: 576px) {
  .modal {
    left: 12px;
    right: 12px;
    width: auto;
    max-width: none;
    max-height: calc(100vh - 220px);
    padding: 12px;
  }

  .modal-content .text-right {
    display: flex;
    gap: 8px;
  }

  .modal-content .text-right .btn,
  .modal-content .text-right button {
    flex: 1 1 0;
    width: auto;
    margin: 0 !important;
  }
}

.modal-content button {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #218838;
}

  .dark-mode #voteProposalModal {
    background-color: #000 !important;
  }

  .dark-mode #voteProposalModal .modal {
    background-color: #000 !important;
    border-color: #000 !important;
  }

  .dark-mode #voteProposalModal .modal-content {
    background-color: #000 !important;
    color: #fff !important;
    border: 1px solid #000 !important;
  }

  .dark-mode #voteProposalModal .modal-header {
    background-color: transparent !important;
    box-shadow: none !important;
    border-bottom: 1px solid rgba(233, 220, 220, 0.15) !important;
  }

  .dark-mode #voteProposalModal .modal-content p,
  .dark-mode #voteProposalModal .modal-content h5,
  .dark-mode #voteProposalModal .modal-header .close span {
    color: #fff !important;
  }

  .dark-mode #voteProposalModal .modal-header .close span {
    color: #fff !important;
  }
</style>
