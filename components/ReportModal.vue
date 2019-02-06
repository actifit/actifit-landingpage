<template>
  <div class="modal fade" id="reportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="report">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ report.title }}</h5><br/>
		  <a :href="'https://busy.org/@' + report.author" target="_blank">
		  <h5 class="modal-author modal-title text-brand" >@{{ report.author}}</h5></a>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <vue-markdown class="modal-body" v-html="body"></vue-markdown>
		<div class="report-comments">
		</div>
      </div>
    </div>
  </div>
</template>

<script>
  import VueMarkdown from 'vue-markdown'
  import steem from 'steem'
  
  export default {
	watch: {
	  report : 'fetchComments'
	},
    props: ['report'],
	components: {
	  VueMarkdown,
	},
    computed: {
      body () {
		let report_content = this.report.body;
		
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
    },
	methods: {
	  fetchComments () {
	    //handles grabbing related comments to current post
	    if (typeof this.report != undefined && this.report != 'undefined' && this.report != null){
			console.log(this.report);
		  //getState allows fetching all related comments to the post at hand. Yet we need to build the proper param to it under the format '/tag/username/permlink'
		  let report_param = this.report.category + '/@' + this.report.author + '/' + this.report.permlink;
		  let cur_ref = this;
	      steem.api.getState (report_param, function (err, result){
			//sort results by depth so as we display entries properly
			let comments_found = Object.values(result.content).sort( function (comment_a, comment_b){
			  return comment_a.depth < comment_b.depth? -1:1; 
			});
			//go through sorted items, skip depth 0 as that's the current post
	        console.log(err, comments_found);
			const comments = [];
	      });
	    }
	  },
	}
  }
</script>

<style>
	.modal-author{
		margin-left: 10px !important;
	}
</style>
