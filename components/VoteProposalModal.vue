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
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal()">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <p>{{ $t('proposal_modal_message') }}</p>
        <!-- Keychain's proposal vote cannot pick an account itself, so a logged-out
             visitor names theirs here. -->
        <input v-if="askUsername" ref="voteUsername" v-model.trim="voteUsername" class="form-control mb-1"
               :placeholder="$t('Your_Username')" autocapitalize="none" @keyup.enter="voteForProposal">
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
// After a vote the wallet reported as sent: long enough for the vote to reach a block
// and the nodes, short enough that a vote that never landed brings the popup back soon.
const VOTED_MS = 60 * 60 * 1000;

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
      askUsername: false,
      voteUsername: '',
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
    // Hide, and keep it hidden in this browser for `ms` (stored as a "hidden until" time).
    closeModal(ms = DISMISS_MS) {
      this.visible = false;
      try { localStorage.setItem(this.dismissKey, String(Date.now() + ms)); } catch (e) { /* storage blocked */ }
    },
    // A saved session whose account has not loaded yet: wait for it rather than
    // briefly showing the logged-out popup to someone who may have voted.
    sessionLoading() {
      try {
        return !this.username && !!localStorage.getItem('access_token');
      } catch (e) {
        return false;
      }
    },
    recentlyDismissed() {
      try {
        const until = Number(localStorage.getItem(this.dismissKey));
        // capped, so a bad or old-format value can never hide it for longer than "×" does
        return until > Date.now() && until - Date.now() <= DISMISS_MS;
      } catch (e) {
        return false;
      }
    },
    async voteForProposal() {
      if (this.voting) return;
      // Keychain first, whatever the login method: it keeps the active key out of the
      // page. Logged-in users sign as themselves; logged-out visitors name their account.
      if (window.hive_keychain) {
        this.voteWithKeychain();
        return;
      }
      // No Keychain. Proposal votes need the active key: HiveSigner sessions only hold a
      // posting token, and logged-out visitors have no way to sign here, so both approve
      // the vote on hivesigner.com instead (where they pick the account).
      if (!this.username || !this.$signsInBrowser()) {
        window.open('https://hivesigner.com/sign/update-proposal-votes?proposal_ids=' +
          encodeURIComponent(JSON.stringify([this.proposalId])) + '&approve=true', '_blank');
        // Out of the way for this page only: opening HiveSigner is not a vote, so it must
        // not count as closing it. A logged-in user's next page checks the chain again.
        this.visible = false;
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
          // also remembered briefly, so a lookup that runs before the vote is in a
          // block (or on a lagging node) does not bring the popup back
          this.closeModal(VOTED_MS);
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
    voteWithKeychain() {
      if (!this.username && !this.askUsername) {
        this.askUsername = true;
        this.$nextTick(() => this.$refs.voteUsername && this.$refs.voteUsername.focus());
        return;
      }
      const account = this.username || this.voteUsername.replace(/^@/, '').toLowerCase();
      if (!account) return;
      this.voting = true;
      window.hive_keychain.requestUpdateProposalVote(account, JSON.stringify([this.proposalId]), true,
        JSON.stringify([]), (response) => {
          this.voting = false;
          if (response && response.success) {
            this.closeModal(VOTED_MS);
          } else if (response && response.error !== 'user_cancel') {
            // Escaped: toasts render HTML.
            this.$notify({ group: 'error', text: escapeHtml(response.message || this.$t('error_performing_operation')), position: 'top center' });
          }
        });
    },
    readMore(){
      window.open(this.$config.proposalPostPath, '_blank');
    },
    // Logged-in users who have not voted yet, and logged-out visitors (whose vote we
    // cannot check), unless they just closed it.
    async adjustVisibility(){
      const username = this.username;
      if (!username || this.recentlyDismissed()) {
        this.lookupId++;
        this.visible = !username && !this.sessionLoading() && !this.recentlyDismissed();
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
  max-height: 300px;
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
