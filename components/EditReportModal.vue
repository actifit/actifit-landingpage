<template>
  <div class="modal fade" id="editReportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="editReport">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('Edit') }} {{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="report-title">{{ $t('Title') }}</label>
            <input class="form-control form-control-lg" id="report-title" v-model="title" />
          </div>
          <div class="form-group">
			<markdown-editor v-model="body" :configs="editorConfig" ref="editor"></markdown-editor>
          </div>
		  <div class="form-group">
			<label for="image-upload">{{ $t('Upload_Images') }}</label><br/>
			<input id="image-upload" type="file" v-on:change="fileChange($event.target.files)" /> 
			<i class="fas fa-spin fa-spinner" v-if="imgUploading"></i>
		  </div>
          <div class="form-group">
            <label for="report-tags">{{ $t('Tags') }}</label>
            <input-tag id="report-tags" :tags.sync="tags" :addTagOnBlur="true"></input-tag>
            <small class="form-text text-muted">{{ $t('Tag_Edit_Note') }}</small>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-brand" @click.prevent="save()">
            <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            <i class="fas fa-paper-plane" v-else></i>
            {{ $t('Save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import marked from 'marked'
  import InputTag from 'vue-input-tag'
  import { mapGetters } from 'vuex'
  import AWS from 'aws-sdk'
  
  const actifit_host = 'https://usermedia.actifit.io/'
  const bucketName = 'actifit';
  
  AWS.config.update({ "accessKeyId": process.env.AWS_ACCESS_KEY_ID, "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY, "region":"us-east-1"});

  export default {
    components: {
      InputTag,
    },
    data () {
      return {
        title: '', // post title
        body: '', // post body
        tags: [], // post tags
		file: '', //image
        loading: false, // loading animation in submit button
		imgUploading: false, // loading animation while image upload in progress
		editorConfig: { // markdown editor for post body
          autofocus: true,
          spellChecker: false,
          previewRender: (body) => {
            return marked(body.replace(/@([\w-]+)(?![\w-])/g,'[$&](https://actifit.io/$&)'))
          },
          forceSync: true,
          status: ['lines', 'words'],
          promptURLs: true
        }
      }
    },
    computed: {
      ...mapGetters(['editReport']),
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin'])
    },
    watch: {
      editReport () {
        // set initial values after edit button was clicked
        this.title = this.editReport.title
        this.body = this.editReport.body

        const meta = JSON.parse(this.editReport.json_metadata)
        this.tags = meta.hasOwnProperty('tags') ? meta.tags.filter(tag => tag !== 'actifit') : [] // actifit as default tag, if no tags are present (for some reason)

        // refresh editor
        setTimeout(() => {
          this.$refs.editor.simplemde.codemirror.refresh()
        }, 250)
      }
    },
    methods: {
		fileChange (file) {
		  //display image upload animation
		  this.imgUploading = true;
		  
		  //generate new key/name for the image to store
		  var key = (Date.now().toString(36) + Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11)).toUpperCase();
		  
		  //initialize S3 instance to process the upload
		  const s3 = new AWS.S3()
		  var params = {
			Bucket: bucketName,
			Key: key, // this will be your share url name
			ContentType: 'image/jpeg',
			Body: file[0], 
			ACL: 'public-read' 
		  }
		  
		  let img_orig_name = file[0].name
		  let img_url = actifit_host + key
		  
		  let txt_editor = this.$refs.editor.simplemde;
		  
		  //reference to this to be used inside the s3 response method
		  let main_container = this;
		  
		  //Execute the upload process
		  s3.putObject(params, function (err, data) {
			if (err){ 
			  //alert(err) // displaying error message
			  console.log(err);
			  main_container.imgUploading = false;
			} else {
			  console.log("image successfully uploaded");
			  console.log(data);
			  console.log('File uploaded to ' + img_url);
			  
			  //insert the image markdown within the editor as cursor position
			  
			  let pos = txt_editor.codemirror.getCursor();
			  txt_editor.codemirror.setSelection(pos, pos);
			  txt_editor.codemirror.replaceSelection('!['+img_orig_name+']('+img_url+')');
			  main_container.imgUploading = false;
			}
			main_container.$notify({
              group: err ? 'error' : 'success',
              text: err ? this.$t('Img_Upload_Fail') : this.$t('Img_Upload_Success'),
              position: 'top center'
            })
		  })
		},
	  async processTrxFunc(op_name, cstm_params){
		if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.block_num) {
				console.log('success');
				return {success: true, trx: res.result};
			}else{
				//console.log(err);
				return {success: false, trx: null};
			}
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			console.log('broadcasting');
			console.log(operation);
			
			//console.log(this.$steemconnect.accessToken);
			//console.log(this.$store.state.accessToken);
			//grab token
			let accToken = localStorage.getItem('access_token')
			
			let op_json = JSON.stringify(operation)
			
			let url = new URL(process.env.actiAppUrl + 'performTrx/?user='+this.user.account.name+'&operation='+op_json);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				headers: reqHeads
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.error){
				console.log(outcome.error);
				//clear entry
				localStorage.removeItem('access_token');
				//this.$store.commit('setStdLoginUser', false);
				this.error_msg = this.$t('session_expired_login_again');
				this.$store.dispatch('steemconnect/logout');
				
				this.$notify({
				  group: 'error',
				  text: this.$t('session_expired_login_again'),
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx};
			}
		}
	  },
	  commentSuccess (err) {
		// stop loading animation and show notification
		this.loading = false
		this.$notify({
		  group: err ? 'error' : 'success',
		  text: err ? this.$t('Save_Error') : this.$t('Save_Success'),
		  position: 'top center'
		})

		// update report in store
		this.$store.dispatch('updateReport', {
		  author: this.editReport.author,
		  permlink: this.editReport.permlink
		})
		
		//reward the user for a new edit
		this.RewardUserEdit();
	  },
      async save () {
        this.loading = true // start loading animation

        // prepare tags
        const meta = JSON.parse(this.editReport.json_metadata)
        meta.tags = [
          'actifit',
          ...this.tags
            .filter(tag => tag !== 'actifit') // remove actifit tag, its the first tag automatically
            .filter(String) // remove empty values
            .map(tag => tag.trim()) // trim leading and trailing whitespaces from tags
        ]
		
		//cleanup images to remove any ones which could have been removed
		for (let i = 0;i < meta.image.length;i++){
			if (!this.body.includes(meta.image[i])){
				//remove this element
				meta.image.splice(i, 1);
				i--;
			}
		}
		
		//fetch any new images to add them as proper thumbnails
		
		//matching our image markdown pattern 
		const regex = /!\[(.*?)\]\((.*?)\)/g;
		
		let markdown_imgs = this.body.match(regex);
		
		if (markdown_imgs != null){
			for (let mimgct = markdown_imgs.length - 1;mimgct >= 0;mimgct--){
				//grab url only
				let img_src_url = markdown_imgs[mimgct].substring(markdown_imgs[mimgct].indexOf('(')+1,markdown_imgs[mimgct].indexOf(')'));
				
				//append at the start if not already part of meta
				if (!meta.image.includes(img_src_url)){
					meta.image.unshift(img_src_url);
				}
			}
		}
		
		//ensure that the app info is actifit specific, for example edited by a different editor
		if (!meta.app.includes('actifit')){
			meta.app = 'actifit/0.4.1';
		}
		meta.suppEdit = 'actifit.io';
		console.log(this.stdLogin);
        // save changes
		if (!this.stdLogin){
		
			this.$steemconnect.comment(
			  this.editReport.parent_author,
			  this.editReport.parent_permlink,
			  this.editReport.author,
			  this.editReport.permlink,
			  this.title,
			  this.body,
			  meta,
			  (err) => {
				this.commentSuccess();
			  }
			)
		}else{
			let cstm_params = {
			  "author": this.editReport.author,
			  "title": this.title,
			  "body": this.body.replace(/%/g,'percent '),
			  "parent_author": this.editReport.parent_author,
			  "parent_permlink": this.editReport.parent_permlink,
			  "permlink": this.editReport.permlink,
			  "json_metadata": JSON.stringify(meta)
			};
			
			let res = await this.processTrxFunc('comment', cstm_params);
			
			if (res.success){
				this.commentSuccess();
			}
		}
      },
	  async RewardUserEdit () {
		let url = new URL(process.env.actiAppUrl + 'rewardActifitWebEdit/'+this.editReport.author);
		//compile all needed data and send it along the request for processing
		let params = {
			web_edit_token: process.env.webEditToken,
			url: this.editReport.url,
		}
		Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
		try{
			let res = await fetch(url);
			let outcome = await res.json();
			if (outcome.rewarded){
				// notify the user that he received an additional reward
				this.$notify({
				  group: 'success',
				  text: this.$t('youve_been_rewarded') +outcome.amount + this.$t('reward_for_edit'),
				  position: 'top center'
				})
			}
			console.log(outcome);
		}catch(err){
			console.error(err);
		}
	  }
    }
  }
</script>
