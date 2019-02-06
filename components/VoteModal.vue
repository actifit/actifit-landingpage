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
              <input id="votableWeight" type="number" value="100" class="form-control" v-model="voteWeight" @change="customVoteWeight" />
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
	  ...mapGetters(['newlyVotedPosts']),
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
	  //handles updating custom values
	  customVoteWeight () {
		var newVal = document.getElementById('votableWeight').value;
		if (newVal == this.voteWeight){
			//do nothing
		}else{
			this.setVoteWeight(newVal);
		}
	  },
      changeVoteWeight (value) {
        this.setVoteWeight(this.voteWeight += parseInt(value))
      },
      setVoteWeight (weight) {
        weight = weight > 100 ? 100 : weight
        weight = weight < -100 ? -100 : weight
        this.$store.commit('setVoteWeight', parseInt(weight))
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
			//append this entry into the list of voted posts
			if (this.newlyVotedPosts.indexOf(this.postToVote.post_id) === -1){
				this.newlyVotedPosts.push(this.postToVote.post_id);
			}
			this.$store.commit('setNewlyVotedPosts', this.newlyVotedPosts);
            $(this.$refs.voteModal).modal('hide')
            this.$notify({
              group: 'success',
              text: 'Your vote has been successfully broadcasted.'
            });
			
			console.log(this.newlyVotedPosts.length);
			console.log(this.voteWeight);
			//if the user votes 3 or more posts at 20%, let's give an additional reward
			if (this.newlyVotedPosts.length >= 3 && this.voteWeight >= 20){
			  this.rewardUserVote();
			}
          }
        });
      },
	  async rewardUserVote () {
		console.log('rewardUserVote')
		//handles rewarding the user for his votes
		let url = new URL(process.env.actiAppUrl + 'rewardActifitWebVote/'+this.user.account.name);
		//compile all needed data and send it along the request for processing
		let params = {
			web_vote_token: process.env.webVoteToken,
			url: this.postToVote.url,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.rewarded){
				// notify the user that he received an additional reward
				this.$notify({
				  group: 'success',
				  text: 'You\'ve been rewarded '+outcome.amount + ' AFIT tokens for upvoting a min of 3 Actifit reports at 20%. Congrats!',
				  position: 'top center'
				})
			}
			console.log(outcome);
		}catch(err){
			console.error(err);
		}
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
