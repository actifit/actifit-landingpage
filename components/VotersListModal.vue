<template>
  <div class="modal fade" id="votersListModal" ref="votersListModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div v-if="modalTitle" class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<div class="modal-body">
			<table class="table table-hover">
			  <thead class="text-brand">
				<tr>
				  <th scope="col">{{ $t('Voter') }}</th>
				  <th scope="col">{{ $t('Voting_Action') }}</th>
				  <th scope="col">{{ $t('Voting_Percent') }}</th>
				  <!--<th scope="col">{{ $t('Voting_Value') }}</th>
				  <th scope="col">{{ $t('Voting_Date') }}</th>-->
				</tr>
			  </thead>
			  <tbody>
				<!-- voter, percent, reputation, rshares -->
				<tr v-for="(voteEntry, key) in votersList" :key="key" :class="{'bg-danger': user && user.name === voteEntry.voter, 'text-white': user && user.name === voteEntry.voter}">
				  <td>
					<a :href="voteEntry.voter" target="_blank" :class="{'text-white': user && user.name === voteEntry.voter}">
						@{{ voteEntry.voter }}
					</a>
				  </td>
				  <td>
					<i v-if="voteEntry.percent >= 0" class="fas fa-thumbs-up text-green"></i>
					<i v-else class="fas fa-thumbs-down text-brand"></i>
				  </td>
				  <td>{{ voteEntry.percent / 100 }} %</td>
				</tr>
			  </tbody>
			</table>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
 
  import { mapGetters } from 'vuex'
  
  export default {
    props: [ 'modalTitle', 'votersList' ],
	components: {
	  
	},
	computed: {
      ...mapGetters('steemconnect', ['user']),
      
    },
	methods: {
	  
	},
	async mounted () {
		
	}
  }
</script>
<style>
.text-green{
	color: #76BB0E
}
</style>