<template>
  <div class="bg-gradient rounded mb-3 p-2">
    <div v-if="username" class="user-avatar large-avatar mr-1 mb-3 col-12 col-md-12 float-left"
      :style="'background-image: url('+this.profImgUrl+'/u/' + this.username + '/avatar)'">
    </div>

    <h2 class="font-weight-semibold text-white text-left h4" v-html="textualDisplay"></h2>

  </div>
</template>
<script>

export default {
  props: {
    username: {
      type: String,
      default: '',
      required: false
    },
    textualDisplay: {
      type:String,
      required: true
    }
  },
  data (){
    return {
      profImgUrl: process.env.hiveImgUrl,
    }
  }
}
</script>
<style>
.user-avatar {
  width: 30px;
  height: 30px;
  background-position: center center;
  background-size: cover;
  border-radius: 50%;
  float: left;
  border: solid 1px #ddd;
}
</style>
