<template>
  <div v-if="visible" id="voteProposalModal" ref="voteProposalModal" :class="{ 'visible': visible}" class="modal fade" tabindex="-1"
    role="dialog" data-backdrop="false">
    <div ><!-- class="modal-dialog" role="document" -- -->
      <div class="modal-content">
        <div v-if="modalTitle" class="modal-header p-1">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <p>{{ message }}</p>
        <div class="text-right">
          <button @click="voteForProposal" class="m-1 col-5">Vote</button>
          <button @click="readMore" class="m-1 col-5">Read More</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    message: {
      type: String,
      default: "Support Actifit's development & growth effort. Vote for our proposal❤️",
    },
    modalTitle: {
      type: String,
      default: 'Actifit Proposal 2025',
    },
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
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters(['proposalVoters']),
  },
  methods: {
    closeModal(){
      this.visible = false;
    },
    voteForProposal() {
      const username = this.user && this.user.account && this.user.account.name || null;
      const proposalId = this.$config.proposalId; // Retrieve proposal ID from nuxt.config.js
      const approve = true; // Set to false if you want to unvote

      window.hive_keychain.requestUpdateProposalVote(
        username,
        [proposalId],
        approve,
        [],
        (response) => {
          if (response.success) {
            this.visible = false; // Close modal after voting
          }
        }
      );
    },
    readMore(){
      window.open(this.propUrl, '_blank'); // Opens the link in a new tab
    },
    userVotedProposal(){
      const username = this.user && this.user.account && this.user.account.name || null;
      if (!username) return false;
      if (this.proposalVoters != null && this.proposalVoters.length > 0){
        if (this.proposalVoters.includes(username)){
          return true;
        }
      }
    },
    adjustVisibility(){
      this.visible = !this.userVotedProposal();
    }
  },
  async mounted() {
    await this.$store.dispatch('fetchProposalVoters', {proposalId: this.$config.proposalId});
    this.adjustVisibility();
  },
};
</script>

<style scoped>
body{
  color:white;
}
.modal.visible{
  display: block;
  opacity: 1;
}
.modal {
  /*display: block;*/
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

</style>
