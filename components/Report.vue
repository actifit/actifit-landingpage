<template>
  <!-- single report item for activity pages -->
  <div class="col-md-6 col-lg-4 mb-4">
    <div class="card report">
      <h6 class="mb-0 text-center">
        <a :href="'https://busy.org' + report.url" target="_blank">
          {{ report.title }}
        </a>
      </h6>
      <div class="report-body">
        <div class="row">
          <div class="col-7">
            <a :href="'https://busy.org/@' + report.author" target="_blank">			
			
              <div class="user-avatar mr-1"
                   :style="'background-image: url(https://steemitimages.com/u/' + report.author + '/avatar)'"></div>
              <small class="d-inline-block align-top">@{{ report.author }}</small>
			  <small class="text-brand numberCircle">{{ getUserRank }}</small>
            </a>
          </div>
          <div class="col-5 text-right">
            <small class="text-muted">{{ date }}</small>
          </div>
        </div>
        <div class="row details mt-2">
          <div class="col-7">
            <small class="d-block">
              <b>Activity Type:</b>
            </small>
            <small class="d-block text-truncate" :title="type">
              {{ type }}
            </small>
          </div>
          <div class="col-5 text-right">
            <small>
              <b>Activity Count:</b><br>
              {{ steps }}
            </small>
          </div>
        </div>
        <div class="row details mt-2">
          <div class="col-6">
            <small>
              <a href="#" class="text-brand" v-if="!user">
                <i class="far fa-thumbs-up"></i> {{ report.net_votes }}
              </a>
              <a href="#" class="text-brand" @click.prevent="$store.commit('setPostToVote', report)" data-toggle="modal"
                 data-target="#voteModal" v-if="user">
                <i class="far fa-thumbs-up"></i> {{ report.net_votes }}
              </a>
              <i class="far fa-comments ml-2"></i> {{ report.children }}
            </small>
          </div>
          <div class="col-6 text-right">
            <small>
              <a href="#" class="text-brand" @click="$store.commit('setEditReport', report)" data-toggle="modal"
                 data-target="#editReportModal" v-if="user && report.author === user.account.name">
                <i class="far fa-edit"></i>
                edit
              </a>
              <span v-if="user && report.author === user.account.name"> - </span>
              <a href="#" class="text-brand" @click="$store.commit('setActiveReport', report)" data-toggle="modal"
                 data-target="#reportModal">
                read more
              </a>
            </small>
          </div>
        </div>
		<div class="row details mt-2">
			<div class="col-6">
				<small>
					{{ postPayout }}
				</small>
			</div>
			<div class="col-6 text-right">
				<small>
					{{ afitReward }} AFIT
				</small>
			</div>
		</div>
		<!-- adding section to display additional FULL Payout option -->
		<div class="row details mt-2 text-brand" v-if="this.meta.full_afit_pay=='on'">
			<div class="col-8">
				<small>
					Full AFIT Payout Mode On
				</small>
			</div>
			<div class="col-4 text-right" v-if="!postPaid()">
				<small>
					Pending Pay
				</small>
			</div>
			<div class="col-4 text-right" v-else>
				<small>
					{{ fullAFITReward }} AFIT
				</small>
			</div>
		</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    props: ['report'],
    computed: {
      ...mapGetters('steemconnect', ['user']),
      ...mapGetters(['postToVote']),
      date() {
        let date = new Date(this.report.created)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
      steps() {
        return this.meta.step_count[0]
      },
      type() {
        return this.meta.activity_type.join(', ')
      },
      meta() {
        return JSON.parse(this.report.json_metadata)
      },
	  postPayout() {
		if (this.postPaid()){
			return this.report.total_payout_value.replace('SBD','').replace('STEEM','')+' STEEM/SBD'
		}else{
			return this.report.pending_payout_value.replace('SBD','').replace('STEEM','')+' STEEM/SBD'
		}
	  },
	  getUserRank() {
		//proper formatting issue to display circle for smaller numbers
		if (this.userRank<10){
			return ' '+parseFloat(this.userRank).toFixed(1);
		}else{
			return parseFloat(this.userRank).toFixed(1);
		}
	  }
	  	  
    }, 
	data: function(){
		return {
			afitReward: '',
			userRank: '',
			fullAFITReward: '',
		}
	},
	methods: {
	  postPaid() {
		//compare today v/s payout date calculated based on 7 days payout time
		let reportDate = new Date() 
		let payoutDays = 7;
		let reportPayout = new Date(this.report.created);
		reportPayout.setDate(reportPayout.getDate() + payoutDays);
		let today = new Date();
		if (today.getTime() > reportPayout.getTime()){
			return true;
		}
		return false;
	  },
	},
	async mounted () {
		fetch('https://actifitbot.herokuapp.com/getPostReward?user=' + this.report.author+'&url='+this.report.url).then(res => {
		//grab the post's reward to display it properly
			res.json().then(json => this.afitReward = json.token_count)}).catch(e => reject(e))
			
		//grab the author's rank
		fetch('https://actifitbot.herokuapp.com/getRank/' + this.report.author).then(res => {
			res.json().then(json => this.userRank = json.user_rank)}).catch(e => reject(e))
			
		//grab post full pay if full pay enabled
		fetch('https://actifitbot.herokuapp.com/getPostFullAFITPayReward?user=' + this.report.author+'&url='+this.report.url).then(res => {
			res.json().then(json => this.fullAFITReward = json.token_count)}).catch(e => reject(e))
	},
	
  }
</script>

<style lang="sass">
  .report
    height: 100%
    h6
      background: #ff112d
      padding: 8px 10px
      a
        color: #fff
    .report-body
      padding: 8px 10px
    a
      color: #333
      &:hover
        text-decoration: none
    .details
      line-height: 1rem
    .user-avatar
      width: 20px
      height: 20px
      background-position: center center
      background-size: cover
      border-radius: 50%
      float: left
      border: solid 1px #ddd
</style>
<style>
	.numberCircle {
	  border-radius: 50%;
	  width: 10px;
	  line-height: 10px;
	  padding: 4px 2px 4px 2px;
	  margin-left: 4px;
	  background: #fff;
	  border: 2px solid;
	  text-align: center;
	  vertical-align:middle;
	}
</style>
