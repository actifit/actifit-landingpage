<template>
  <div class="news px-3">
    <small>{{ date }}</small>
    <h5>{{ post.title }}</h5>
    <a href="#" class="btn btn-white" @click="$store.commit('setActiveNews', post)" data-toggle="modal" data-target="#newsModal">{{ $t('Read_more') }}</a>
  </div>
</template>

<script>
  export default {
    props: ['post'],
    computed: {
      date () {
        let date = new Date(this.post.created)
        let minutes = date.getMinutes();
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' - ' + date.getHours() + ':' + (minutes < 10 ? '0' + minutes : minutes)
      }
    }
  }
</script>
