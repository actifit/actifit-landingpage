<template>
  <!-- single transaction item for wallet page -->
  <div class="acti-shadow card p-3 my-2">
    <div class="d-flex flex-row justify-content-between">
      <div>
        <h4 class="mb-0">{{ transaction.token_count }} <small>{{ $t('AFIT_Token') }}</small></h4>
        <small class="text-muted">{{ $t('Type') }}: {{ transaction.reward_activity }}</small>
      </div>
      <div>
        <small class="text-muted">{{ date }}</small><br>
		<a :href="'/@' + transaction.user + '/' + transaction.url" target="_blank" v-if="transaction.reward_activity == 'Full AFIT Payout'">{{ $t('Activity_Details') }}</a>
        <a :href="transaction.url" target="_blank" v-else-if="transaction.url">{{ $t('Activity_Details') }}</a>
      </div>
    </div>
    <p class="font-italic mb-0 mt-2 text-center" v-if="transaction.note">{{ transaction.note }}</p>
  </div>
</template>

<script>
  export default {
    props: ['transaction'],
    computed: {
      date () {
        let date = new Date(this.transaction.date)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      }
    }
  }
</script>
