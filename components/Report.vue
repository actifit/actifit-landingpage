<template>
  <div class="col-6 col-sm-4 col-md-3 mb-4">
    <div class="card p-2 report">
      <a :href="'https://steemit.com' + report.url" target="_blank">
        <h6 class="mb-0">{{ report.title }}</h6>
        <small class="text-muted">{{ date }}</small>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['report'],
    computed: {
      date () {
        let date = new Date(this.report.created)
        let minutes = date.getMinutes();
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      },
    },
    mounted () {
      console.log(this.report)
    }
  }
</script>

<style lang="sass">
  .report
    height: 100%
    a
      color: #333
      &:hover
        text-decoration: none
</style>
