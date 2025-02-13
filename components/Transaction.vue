<template>
  <!-- single transaction item for wallet page -->
  <div class="acti-shadow card p-3 my-2">
    <div class="d-flex flex-row justify-content-between">
      <div>
        <h4 class="mb-0" :class="decideColor(transaction.token_count)"><span v-if="transaction.token_count>=0">+</span>{{ transaction.token_count }} <small>{{ $t('AFIT_Token') }}</small></h4>
        <small class="text-muted" >{{ $t('Type') }}: {{ transaction.reward_activity }}</small>
      </div>
      <div >
        <small class="text-muted" :title="date">{{ $getTimeDifference(this.transaction.date) }}</small><br>
        <div v-if="transaction.recipient" >
          <small class="text-muted">{{ $t('To') }}: </small><span :href="'/'+transaction.recipient">{{ transaction.recipient }}</span>
        </div>
      </div>
    </div>
    <div class="text-center">
      <a :href="'/@' + transaction.user + '/' + transaction.url" target="_blank" v-if="transaction.reward_activity == 'Full AFIT Payout'">{{ $t('Activity_Details') }}</a>
      <a :href="transaction.url" target="_blank" v-else-if="transaction.url">{{ $t('Activity_Details') }}</a>
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
    },
    methods: {
      decideColor(afitAmount){
        const value = (afitAmount>=0)?"positive":"negative";
        return value;
      }
    }
  }
</script>
<style>
.positive{
  color: limegreen;
}
.negative{
  color:red;
}
</style>
