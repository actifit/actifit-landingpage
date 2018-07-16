<template>
  <div class="card p-3 my-2 d-flex flex-row justify-content-between">
    <div>
      <h4 class="mb-0">{{ transaction.token_count }} <small>AT</small></h4>
      <small class="text-muted">@{{ transaction.user }}</small>
    </div>
    <div>
      <small class="text-muted">{{ date }}</small><br>
      <a :href="'https://steemit.com' + transaction.url" target="_blank">Activity Details</a>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['transaction'],
    computed: {
      date () {
        let date = new Date(this.transaction.date)
        let minutes = date.getMinutes()
        return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      }
    }
  }
</script>