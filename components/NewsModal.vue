<template>
  <div class="modal fade" id="newsModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="news">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ news.title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
		<vue-markdown class="modal-body">{{body}}</vue-markdown>
      </div>
    </div>
  </div>
</template>

<script>
  import VueMarkdown from 'vue-markdown'

  export default {
    props: ['news'],
	components: {
	  VueMarkdown,
	},
    computed: {
      body () {
		let report_content = this.news.body;
		
		/* let's find images sent as pure URLs, and display them as actual images, while avoiding well established images */
		let img_links_reg = /^(?:(?!=").)*((https?:\/\/.*\.(?:png|jpg|jpeg|gif))|(https?:\/\/usermedia\.actifit\.io[^\)]*))(?:\)*)/igm;
		report_content = report_content.replace(img_links_reg,'<img src="$1">');

		/* let's match youtube vidoes and display them in a player */
		//let vid_reg = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;
		let vid_reg = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&amp;+%\w]*(?:['"][^&lt;&gt;]*&gt;|&lt;\/a&gt;))[?=&amp;+%\w-]*/ig;
		
		//swap into a player format, and introduce embed format for proper playing of videos
		report_content = report_content.replace(vid_reg,'<iframe width="640" height="360" src="http://www.youtube.com/embed/$1"></iframe>');
		
		/* regex to match @ words and convert them to steem user links */
		let user_name = /(@([\a-zA-Z0-9-.]+)(?![\a-zA-Z0-9-.]))([,.|() ])/g;
        return report_content.replace(user_name,'[$1](https://busy.org/$1)$3')
      }
    }
  }
</script>
<style>
  .modal-body{
    word-break: break-word;
  }
</style>