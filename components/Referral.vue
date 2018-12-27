<template>
  <!-- single referral item for referrals page -->
  <div class="card p-3 my-2">
    <div class="d-flex flex-row justify-content-between">
      <div>
		<p class="lead">Referred Account: @{{ referral.account_name }}</p>
		<p class="lead">{{ date }}</p>
      </div>
	  <div>
		<p class="lead">Referral Reward: {{ referral.referrer_afit_reward }} <small>AFIT</small></p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['referral'],
    computed: {
      date () {
        let date = new Date(this.referral.date)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      }
    }
  }
</script>
