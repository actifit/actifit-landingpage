<template>
  <div class="modal fade" id="editReportModal" tabindex="-1">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content" v-if="editReport">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">{{ $t('Editing') }} {{ title }}</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="report-title" style="display: none">{{ $t('Title') }}</label>
            <input class="form-control form-control-lg acti-shadow" :placeholder="$t('Title')" id="report-title" v-model="title" />
          </div>
          <!-- show permalink if post is edit -->
		  <div v-if="!editReport.isNewPost" class="form-group">
			<a id="post_permlnk" :href="'/'+editReport.author+'/'+editReport.permlink">{{$t('actifit_web_url')}}/{{editReport.author}}/{{editReport.permlink}}</a>
		  </div>
		  <div class="form-group">
			<CustomTextEditor ref="editor" :initialContent="body" ></CustomTextEditor>
			
          </div>
		  <div class="form-group">
		   <!--<div class="form-group">
			<label for="image-upload">{{ $t('Upload_Images') }}</label><br/>
			<input id="image-upload" type="file" v-on:change="fileChange($event.target.files)" /> 
			<i class="fas fa-spin fa-spinner" v-if="imgUploading"></i>
		  </div>
          <div class="form-group">
            <label for="report-tags">{{ $t('Tags') }}</label>
            <input id="report-tags" v-model="tags" :addTagOnBlur="true" />-->
            <TagInput id="tagItem" ref="tagItem" :initialItems="tags" class="form-control form-control-lg acti-shadow"/>
            <small class="form-text text-muted">{{ $t('Tag_Edit_Note') }}</small>
          </div>
        </div>
		<div class="modal-footer m-2" style="display: none">
			<div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-if="cur_bchain=='HIVE'">
				<input type="radio" id="hive" value="HIVE" v-model="target_bchain">
				<img src="/img/HIVE.png" style="max-height: 50px" v-on:click="target_bchain = 'HIVE'" :class="adjustHiveClass">
				<label for="hive">HIVE ONLY</label>
			</div>
			<div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-else-if="cur_bchain=='STEEM'">
				<input type="radio" id="steem" value="STEEM" v-model="target_bchain">
				<img src="/img/STEEM.png" style="max-height: 50px" v-on:click="target_bchain = 'STEEM'" :class="adjustSteemClass">
				<label for="steem">STEEM ONLY</label>
			</div>
			<div class="bchain-option btn col-6 p-2 row text-left  mx-auto">
				<input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
				<img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass">
				<img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px" :class="adjustBothClass">
				<label for="hive_steem">HIVE + STEEM</label>
			</div>
		</div>
		<div class="modal-footer">
          <button type="button" class="btn btn-white border border-danger text-red acti-shadow" @click.prevent="save()">
            <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            <i class="fas fa-paper-plane" v-else></i>
            {{ $t('Save') }}
			<img src="/img/HIVE.png" style="max-height: 25px" v-if="target_bchain=='HIVE' || target_bchain=='BOTH'">
			<img src="/img/STEEM.png" style="max-height: 25px" v-if="target_bchain=='STEEM' || target_bchain=='BOTH'">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import marked from 'marked'
  //import InputTag from 'vue-input-tag'
  import { mapGetters } from 'vuex'

  import CustomTextEditor from '~/components/CustomTextEditor';
  import TagInput from '~/components/TagInput';
/* handles outside clicks for the picker */
	/* begin */
	import Vue from 'vue';

	Vue.directive('click-outside', {
		bind(el, binding, vnode) {
			var vm = vnode.context;
			var callback = binding.value;

			el.clickOutsideEvent = function (event) {
				if (!(el == event.target || el.contains(event.target))) {
					return callback.call(vm, event);
				}
			};
			document.body.addEventListener('click', el.clickOutsideEvent);
		},
		unbind(el) {
			document.body.removeEventListener('click', el.clickOutsideEvent);
		}
	});
	/* end */
   

  export default {
    components: {
	  CustomTextEditor,
	  TagInput
	},
    data () {
      return {
        title: '', // post title
        body: '', // post body
        tags: [], // post tags
        loading: false, // loading animation in submit button
		cur_bchain: 'HIVE', //bchain used to edit/save
		target_bchain: 'HIVE', //bchain to which edits will go
		
      }
    },
    computed: {
      ...mapGetters(['editReport', 'bchain']),
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  adjustHiveClass () {
		if (this.target_bchain != 'HIVE'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustSteemClass () {
		if (this.target_bchain != 'STEEM'){
			return 'option-opaque';
		}
		return '';
	  },
	  adjustBothClass () {
		if (this.target_bchain != 'BOTH'){
			return 'option-opaque';
		}
		return '';
	  },
	  
    },
    watch: {
	  bchain: async function(newBchain) {
		//console.log('profile change in chain '+newBchain);
		this.cur_bchain = newBchain;
		await this.$store.dispatch('steemconnect/refreshUser');
		//this.reload += 1;
	  },
      editReport () {
        // set initial values after edit button was clicked
        this.title = this.editReport.title
        this.body = this.editReport.body

        const meta = JSON.parse(this.editReport.json_metadata)
        this.tags = meta.hasOwnProperty('tags') ? meta.tags.filter(tag => tag !== 'actifit') : [] // actifit as default tag, if no tags are present (for some reason)

        // refresh editor
        /*setTimeout(() => {
          this.$refs.editor.simplemde.codemirror.refresh()
        }, 250)*/
      }
    },
    methods: {
		
	  async processTrxFunc(op_name, cstm_params, bchain_option){
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
			let res = await this.$steemconnect.broadcast([[op_name, cstm_params]]);
			//console.log(res);
			if (res.result.ref_block_num) {
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
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			
			if (bchain_option){
				cur_bchain = bchain_option;
			}
			
			let url = new URL(process.env.actiAppUrl + 'performTrxPost/?user='+this.user.account.name+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			let res = await fetch(url, {
				method: 'POST',
				headers: reqHeads,
				body: JSON.stringify({'operation': JSON.stringify(operation)})
			});
			let outcome = await res.json();
			console.log(outcome);
			if (outcome.error){
				console.log(outcome.error);
				
				//if this is authority error, means needs to be logged out
				//example "missing required posting authority:Missing Posting Authority"
				let err_msg = outcome.trx.tx.error;
				if (err_msg.includes('missing') && err_msg.includes('authority') && this.cur_bchain == bchain_option){
					//clear entry
					localStorage.removeItem('access_token');
					//this.$store.commit('setStdLoginUser', false);
					this.error_msg = this.$t('session_expired_login_again');
					this.$store.dispatch('steemconnect/logout');
				}
				
				this.$notify({
				  group: 'error',
				  text: err_msg,
				  position: 'top center'
				})
				return {success: false, trx: null};
				//this.$router.push('/login');
			}else{
				return {success: true, trx: outcome.trx};
			}
		}
	  },
	  commentSuccess (err, finalize, bchain) {
		
		this.$notify({
		  group: err ? 'error' : 'success',
		  text: err ? this.$t('Save_Error') : this.$t('Save_Success_Chain').replace('_CHAIN_', bchain),
		  position: 'top center'
		})
		
		//let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		//this.$store.commit('setBchain', cur_bchain);
		
		
		//reward the user for a new edit
		if (finalize){
			// stop loading animation and show notification
			this.loading = false
			this.RewardUserEdit();
			// update report in store
			this.$store.dispatch('updateReport', {
			  author: this.editReport.author,
			  permlink: this.editReport.permlink
			})
			
		}
	  },
      async save () {
        this.loading = true // start loading animation
		//only convert to array if not already array
		this.tags = this.$refs.tagItem.items;
		if (!Array.isArray(this.tags)){
			if (this.tags.indexOf(',')!==-1){
				//contains commas, treat accordingly
				this.tags = this.tags.split(',');
			}else{
				//rely on spaces instead
				this.tags = this.tags.split(' ');
			}
		}
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
			meta.app = 'actifit/0.5.0';
		}
		meta.suppEdit = 'actifit.io';
		console.log(this.stdLogin);
        // save changes
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
		
			this.$steemconnect.comment(
			  this.editReport.parent_author,
			  this.editReport.parent_permlink,
			  this.editReport.author,
			  this.editReport.permlink,
			  this.title,
			  this.$refs.editor.content,
			  meta,
			  (err) => {
				this.commentSuccess(err, true, 'STEEM');
			  }
			)
		}else{
			let cstm_params = {
			  "author": this.editReport.author,
			  "title": this.title,
			  "body": this.$refs.editor.content,
			  "parent_author": this.editReport.parent_author,
			  "parent_permlink": this.editReport.parent_permlink,
			  "permlink": this.editReport.permlink,
			  "json_metadata": JSON.stringify(meta)
			};
			
			let res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain);
			
			if (res.success){
				this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain);
			}else{
				this.commentSuccess('error saving', false, this.cur_bchain);
			}
			
			//also send the same post again to the other chain
			let other_chain = this.cur_bchain=='HIVE'?'STEEM':'HIVE';
			if (this.target_bchain == 'BOTH'){
				this.loading = true;
				let res = await this.processTrxFunc('comment', cstm_params, other_chain);
			
				if (res.success){
					this.commentSuccess(null, true, other_chain);
				}else{
					this.commentSuccess('error saving', false, other_chain);
				}
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
    },
	async mounted () {
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', this.cur_bchain);
	}
  }
</script>
