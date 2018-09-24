<template>
  <div class="modal fade" id="voteModal" tabindex="-1" ref="voteModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content" v-if="postToVote">
        <div class="modal-header">
          <h5 class="modal-title">Vote on {{ postToVote.title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body text-center">
          <small class="text-muted">Adjust the weight of your vote.</small>
          <ul class="pagination justify-content-center mt-2">
            <li :class="{'page-item': true, disabled: voteWeight === -100}"><a class="page-link vote-controls" href="#" @click.prevent="setVoteWeight(-100)"><i class="far fa-flag text-danger"></i></a></li>
            <li :class="{'page-item': true, disabled: voteWeight === -100}"><a class="page-link vote-controls text-danger" href="#" @click.prevent="changeVoteWeight(-10)">-10</a></li>
            <li :class="{'page-item': true, disabled: voteWeight === -100}"><a class="page-link vote-controls text-danger" href="#" @click.prevent="changeVoteWeight(-1)">-1</a></li>
            <li class="page-item vote-weight">
              <input type="number" value="100" class="form-control" v-model="voteWeight" />
            </li>
            <li :class="{'page-item': true, disabled: voteWeight === 100}"><a class="page-link vote-controls text-success" href="#" @click.prevent="changeVoteWeight(1)">+1</a></li>
            <li :class="{'page-item': true, disabled: voteWeight === 100}"><a class="page-link vote-controls text-success" href="#" @click.prevent="changeVoteWeight(10)">+10</a></li>
            <li :class="{'page-item': true, disabled: voteWeight === 100}"><a class="page-link vote-controls" href="#" @click.prevent="setVoteWeight(100)"><i class="far fa-thumbs-up text-success"></i></a></li>
          </ul>

          <button type="submit" class="btn btn-brand" @click="vote()" v-if="voteWeight">
            <i class="fas fa-thumbs-up" v-if="voteWeight > 0"></i>
            <i class="fas fa-thumbs-down" v-if="voteWeight < 0"></i>
            <span v-if="voteWeight > 0"> Upvote</span>
            <span v-if="voteWeight < 0"> Downvote</span>
            <i class="fas fa-spinner fa-spin ml-2" v-if="loading"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    data () {
      return {
        loading: false
      }
    },
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['postToVote']),
      voteWeight: {
        get () {
          return this.$store.getters.voteWeight
        },
        set () {
          this.$store.commit('setVoteWeight', this.voteWeight)
        }
      }
    },
    methods: {
      changeVoteWeight (value) {
        this.setVoteWeight(this.voteWeight += value)
      },
      setVoteWeight (weight) {
        weight = weight > 100 ? 100 : weight
        weight = weight < -100 ? -100 : weight
        this.$store.commit('setVoteWeight', weight)
      },
      vote () {
        this.loading = true
        this.$steemconnect.vote(this.user.account.name, this.postToVote.author, this.postToVote.permlink, this.voteWeight * 100, (err) => {
          this.loading = false
          if (err) {
            this.$notify({
              group: 'error',
              text: 'Unknown error: Your vote could not be broadcasted.',
              position: 'top center'
            });
          }
          else {
            $(this.$refs.voteModal).modal('hide')
            this.$notify({
              group: 'success',
              text: 'Your vote has been successfully broadcasted.'
            });
          }
        });
      }
    }
  }
</script>

<style lang="sass">
  .vote-weight
    position: relative

    &:after
      content: '%'
      line-height: 42px
      position: absolute
      top: 0
      right: 10px
      color: #999

    input
      width: 80px
      font-size: 1.2rem

  .vote-controls
    margin-top: 5px
    padding: 4px 8px
</style>
