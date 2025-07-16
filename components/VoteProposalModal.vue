<template>
  <!-- The v-if="visible" is sufficient to control rendering -->
  <div v-if="visible" id="voteProposalModal" class="modal fade show" tabindex="-1" role="dialog" data-backdrop="false">
    <div><!-- class="modal-dialog" role="document" -->
      <div class="modal-content">
        <!-- MODIFIED: Title now uses a translation key with a dynamic year -->
        <div class="modal-header p-1">
          <h5 class="modal-title">{{ $t('proposal_modal_title_year', { year: currentYear }) }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <!-- MODIFIED: Message now uses a translation key -->
        <p>{{ $t('proposal_modal_message') }}</p>
        <div class="text-right">
          <!-- MODIFIED: Buttons now use translation keys -->
          <button @click="voteForProposal" class="m-1 col-5">{{ $t('vote_button_text') }}</button>
          <button @click="readMore" class="m-1 col-5">{{ $t('read_more_button_text') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    // MODIFIED: Removed modalTitle and message props to handle text internally.
    propUrl:{
      type: String,
      default: 'https://peakd.com/proposals/337',
    }
  },
  data() {
    return {
      visible: false,
      username: null,
    };
  },
  watch: {
    user: function (){
      this.adjustVisibility();
    },
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['proposalVoters']),
  },
  methods: {
    closeModal(){
      this.visible = false;
    },
    voteForProposal() {
      const username = this.user?.account?.name || null;
      if (!username) return; // Ensure user is logged in
      
      const proposalId = this.$config.proposalId;
      const approve = true;

      // Ensure hive_keychain is available
      if (window.hive_keychain) {
        window.hive_keychain.requestUpdateProposalVote(
          username,
          [proposalId],
          approve,
          (response) => {
            if (response.success) {
              this.visible = false; // Close modal after voting
              // Optionally, refresh voter list
              this.$store.dispatch('fetchProposalVoters', {proposalId: this.$config.proposalId});
            }
          }
        );
      } else {
        console.error('Hive Keychain is not installed.');
        // You could show a user-friendly error message here
      }
    },
    readMore(){
      window.open(this.propUrl, '_blank');
    },
    userVotedProposal(){
      const username = this.user?.account?.name || null;
      if (!username || !this.proposalVoters) return false;
      // The includes method is case-sensitive, which is correct for usernames
      return this.proposalVoters.includes(username);
    },
    adjustVisibility(){
      // Show the modal only if the user exists and has NOT voted yet.
      this.visible = this.user && !this.userVotedProposal();
    }
  },
  async mounted() {
    // Fetch voters and then adjust visibility based on the result.
    await this.$store.dispatch('fetchProposalVoters', {proposalId: this.$config.proposalId});
    this.adjustVisibility();
  },
};
</script>

<style scoped>
/* MODIFIED: Simplified the selector for visibility */
.modal.show {
  display: block;
  opacity: 1;
}
.modal {
  position: fixed;
  bottom: 20px;
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
}

.modal-content button {
  background-color: #ff112d; /* Using Actifit's brand color for consistency */
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #e0001a; /* A darker shade for hover */
}

/* Specific styling for the second button */
.modal-content button + button {
  background-color: #6c757d; /* A neutral gray for the secondary action */
}

.modal-content button + button:hover {
  background-color: #5a6268;
}

</style>