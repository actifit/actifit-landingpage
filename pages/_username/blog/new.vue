<template>
  <div>
	<NavbarBrand />
      <div class="container pt-5 mt-5 pb-5">
		<div>
		  <h5 v-if="editPost.isNewPost" class="modal-title" id="exampleModalLabel">{{ $t('Create_post') }}</h5>
		  <h5 v-else class="modal-title" id="exampleModalLabel">{{ $t('Editing') }} <a :href="'/'+editPost.author+'/'+editPost.permlink">{{ title }}</a></h5>
        </div>  
		<div class="row text-right" v-if="user">
			<div class="col-12 pb-2"><a href="#" class="btn btn-brand border" @click.prevent="$router.push('/' + user.account.name+'/blog')" :title="$t('view_blog')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;<a :href="'/'+user.account.name+'/comments'"  class="btn btn-brand border" :title="$t('view_comments')"><i class="far fa-comments"></i></a></div>
		</div>
		<div>
          <div class="form-group">
			<!--<input id="image-upload" type="file" v-on:change="uploadImage($event.target.files)" /> -->
		  
            <label for="post-title" style="display: none">{{ $t('Title') }}</label>
            <input class="form-control form-control-lg acti-shadow" :placeholder="$t('Title')" id="post-title" v-model="title" />
          </div>
		  <!-- show permalink if post is edit -->
		  <div v-if="!editPost.isNewPost" class="form-group">
			<a id="post_permlnk" :href="'/'+editPost.author+'/'+editPost.permlink">{{$t('actifit_web_url')}}/{{editPost.author}}/{{editPost.permlink}}</a>
		  </div>
          <div class="form-group">
			<CustomTextEditor ref="editor" :initialContent="body" ></CustomTextEditor>
			
          </div>
		  <!--<div class="form-group">
			<label for="image-upload">{{ $t('Upload_Images') }}</label><br/>
			<input id="image-upload" type="file" v-on:change="uploadImage($event.target.files)" /> 
			<i class="fas fa-spin fa-spinner" v-if="imgUploading"></i>
		  </div>-->
          <div class="form-group">
            <!--<label for="post-tags" style="display: none">{{ $t('Tags') }}</label>
            <input class="form-control form-control-lg acti-shadow" :placeholder="$t('Tags')"/>-->
			<TagInput id="tagItem" ref="tagItem" :initialItems="tags" class="form-control form-control-lg acti-shadow"/>
		  </div>
		  
		  <div class="form-group acti-shadow extra-container">
			<Beneficiary ref="beneficiaryList" :initialEntries="benef_list" :viewOnly="!editPost.isNewPost" class="float-left"/>
			
			<!-- also select community to post to -->
			<div class="form-group d-flex align-items-center p-1">
				<select id="targetCommunity" ref="targetCommunity" class="form-control targetCommunity">
					<option value="_blog_">--Select Community--</option>
					<option v-for="com in communitySubs" :value="com[0]" :key="com[0]">{{com[1]}}</option>
				</select>
			</div>
			
			<div class="form-group d-flex align-items-center p-1" style="min-height: 70px;">
			  <label for="paymentApproach" class="mr-2 label-payment">{{$t('payment_approach')}}</label>
			  <select id="paymentApproach" ref="paymentApproach" class="form-control paymentApproach">
				<option value="split">50/50 Split</option>
				<option value="hp">Full HP</option>
				<option value="decline">Decline</option>
			  </select>
			</div>
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
          <button type="button" class="btn btn-white border text-red acti-shadow" @click.prevent="save()">
            <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            <i class="fas fa-paper-plane" v-else></i>
            <span v-if="editPost.isNewPost">{{ $t('Publish') }}</span><span v-else>{{ $t('Save') }}</span>
			<img src="/img/HIVE.png" style="max-height: 25px" v-if="target_bchain=='HIVE' || target_bchain=='BOTH'">
			<img src="/img/STEEM.png" style="max-height: 25px" v-if="target_bchain=='STEEM' || target_bchain=='BOTH'">
          </button>
        </div>
      </div>
	  <Footer />
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
      </div>
    </client-only>
  </div>
</template>

<script>
  import marked from 'marked'
  //import InputTag from 'vue-input-tag'
  import { mapGetters } from 'vuex'
  
  import CustomTextEditor from '~/components/CustomTextEditor';
  import TagInput from '~/components/TagInput';
  import Beneficiary from '~/components/Beneficiary';
  
  import hive from '@hiveio/hive-js'
  
  import NavbarBrand from '~/components/NavbarBrand';
  import Footer from '~/components/Footer';

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
	
	
	//import tus from 'tus-js-client'
	import * as tus from "tus-js-client";

   
  export default {
	head () {
		return {
		  title: `New Blog Post via Actifit`,
		  meta: [
			{ hid: 'description', name: 'description', content: `New blog post via Actifit` },
			{ hid: 'ogdescription', name: 'og:description', content: `New blog post via Actifit` }
		  ]
		}
	},
    components: {
	  Footer,
	  NavbarBrand, 
	  CustomTextEditor,
	  TagInput,
	  Beneficiary
    },
    data () {
      return {
        title: '', // post title
        body: '', // post body
        tags: [], // post tags
        loading: false, // loading animation in submit button
		cur_bchain: 'HIVE', //bchain used to edit/save
		target_bchain: 'HIVE', //bchain to which edits will go
		benef_list: [],
		percent_hbd: 10000,
		max_accepted_payout: '1000000.000 HBD',
		communitySubs: [],
		editPost: {
			isNewPost: true,
		}
		//comment_options: {},
      }
    },
    computed: {
      ...mapGetters(['bchain']),//'editPost', 
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
	  user (){
		this.fetchCommunities();
		//load saved draft
		this.runDraftLoader();
		//save draft in intervals
		setInterval(this.runDraftSaver, 20000);
	  },
      editPost () {
		//enforce new post till and if we implement full screen edit
		//this.editPost.isNewPost = true;
		console.log('editPost');
		console.log(this.editPost);
        // set initial values after edit button was clicked
        this.title = (this.editPost?this.editPost.title:'')
        this.body = (this.editPost?this.editPost.body:'')
		this.benef_list = (this.editPost?this.editPost.beneficiaries:[]);
		//console.log(this.benef_list);
		this.tags = [];
		if (this.editPost && !this.editPost.isNewPost){
			const meta = JSON.parse(this.editPost.json_metadata)
			this.tags = meta.hasOwnProperty('tags') ? meta.tags : [] // actifit as default tag, if no tags are present (for some reason)
			this.max_accepted_payout = this.editPost.max_accepted_payout;
			this.percent_hbd = this.editPost.percent_hbd;
		}
		//console.log('session 3S');
		//this.connectSession3S();
		//console.log(this.tags);
		//set paste handling script for images
		//this.$el.querySelector('textarea').addEventListener('paste', this.handlePaste);
        // refresh editor
        /*setTimeout(() => {
          //this.$refs.editor.simplemde.codemirror.refresh()
		  //console.log(this.$refs.editor.textarea.value);
        }, 250)*/
		
		
      }
    },
    methods: {
	  async fetchCommunities(){
		if (this.user){
			this.communitySubs = await this.$store.dispatch('fetchUserCommunitySubs');
			console.log(this.communitySubs);
		}
	  },
	  async uploadImage(files){
		const upload = new tus.Upload(files[0], {
		  endpoint   : 'https://uploads.3speak.tv/files', //'https://tusd.tusdemo.net/files/',
		  retryDelays: [0, 1000, 3000, 5000],
		  /*metadata   : {
			filename: `photo.${extension}`,
			filetype: this.getMimeType(extension),
		  },*/
		  onError: (error) => {
			console.log(error)
			/*this.setState({
			  status: `upload failed ${error}`,
			})*/
		  },
		  onProgress: (uploadedBytes, totalBytes) => {
			//console.log(uploadedBytes, totalBytes)
			const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
			console.log(bytesUploaded, bytesTotal, `${percentage}%`)
			/*this.setState({
			  totalBytes,
			  uploadedBytes,
			})*/
		  },
		  onSuccess: () => {
			/*this.setState({
			  status   : 'upload finished',
			  uploadUrl: upload.url,
			})*/
			console.log('Success! Upload URL:', upload.url)
		  },
		})
	  },
	  async connectSession3S(){
		
			console.log('3S session');
			
			//fetch 3speak memo
			
			let res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name));
			console.log(res);
			let outcome = await res.json();
			console.log(outcome);
			let memo = '';
			if (outcome && outcome.memo){
				memo = outcome.memo;
			}
			console.log(memo);
			
			//decode memo

			//grab actifit token
			let accToken = localStorage.getItem('access_token')
			
			let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
			
			let url = new URL(process.env.actiAppUrl + 'memoDecode/?user='+this.user.account.name+'&bchain='+cur_bchain);
			
			let reqHeads = new Headers({
			  'Content-Type': 'application/json',
			  'x-acti-token': 'Bearer ' + accToken,
			});
			res = await fetch(url, {
				method: 'POST',
				headers: reqHeads,
				body: JSON.stringify({'memo': memo})
			});
			outcome = await res.json();
			console.log(outcome);
			let xcstkn = '';
			if (outcome.error){
				console.log(outcome.error);
				return;
			}else{
				xcstkn = outcome.xcstkn;
			}
			
			//request cookie
			if (xcstkn){
				if (xcstkn.startsWith('#')){
					xcstkn = xcstkn.substring(1);//remove first character from token #
				}
				res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + xcstkn, {
					credentials: 'include',
				});
				console.log(res);
				//console.log(res.headers);
				outcome = await res.json();
				console.log(outcome);	
			}
	  },
	  async processTrxFunc(op_name, cstm_params, bchain_option, op2, params2){
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
		}else if (localStorage.getItem('acti_login_method') == 'hiveauth'){	
			return new Promise((resolve) => {
				const auth = {
				  username: this.user.account.name,
				  token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
				  expire: localStorage.getItem('expires'),
				  key: localStorage.getItem('key')
				}
				
				let operation = [ 
				   [op_name, cstm_params]
				];
				if (op2 && params2){
					operation.push([op2, params2])
				}
				
				this.$HAS.broadcast(auth, 'posting', operation, (evt)=> {
					console.log(evt)    // process sign_wait message
					let msg = this.$t('verify_hiveauth_app');
					this.$notify({
					  group: 'warn',
					  text: msg,
					  duration: -1, //keep alive till clicked
					  position: 'top center'
					})
				})
				.then(response => {
					console.log(response);
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					if (response.cmd && response.cmd === 'sign_ack'){
						resolve({success: true, trx: response.data});
					}else if (response.cmd && response.cmd === 'sign_nack'){
						resolve ({success: false})
					}
				} ) // transaction approved and successfully broadcasted
				.catch(err => {
					this.$notify({
					  group: 'warn',
					  clean: true
					})
					console.log(err);
					resolve ({success: false})
				} )
			})
		}else{
			let operation = [ 
			   [op_name, cstm_params]
			];
			if (op2 && params2){
				operation.push([op2, params2])
			}
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
	  commentSuccess (err, finalize, bchain, newPost) {
		let mainRef = this;
		let successMsg =  mainRef.$t('Save_Success_Chain').replace('_CHAIN_', bchain);
		if (newPost){
			successMsg = mainRef.$t('Post_created_successfully');
		}
		this.$notify({
		  group: err ? 'error' : 'success',
		  text: err ? mainRef.$t('Save_Error') : successMsg,
		  position: 'top center'
		})
		
		//let cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		//this.$store.commit('setBchain', cur_bchain);		
		
		//reward the user for a new edit
		if (finalize){
			// stop loading animation and show notification
			this.loading = false
			if (newPost){
				//cleanup drafts
				this.$clearDraft(this.user.account.name, 'blog');
				$(this.$refs.editPostModal).modal('hide')
			}
			this.RewardUserEdit();
			// update post in store
			this.$store.dispatch('updatePost', {
			  author: this.editPost.author,
			  permlink: this.editPost.permlink
			})
			
			if (newPost){
				//redirect after 2 seconds
				let par = this;
				setTimeout(function (){
					par.$router.push('/'+par.user.account.name+'/blog')
					}, 2000);
			}
			
		}
	  },
      async save () {
        this.loading = true // start loading animation
		//only convert to array if not already array
		this.tags = this.$refs.tagItem.items;
		
		this.body = this.$refs.editor.content;
		
		
		console.log(this.title);
		if (typeof this.title === "undefined" || this.title == ''){
			//post requires a title
			this.$notify({
				  group: 'error',
				  text: this.$t('post_requires_title'),
				  position: 'top center'
				})
			this.loading = false
			return;
		}
		
		if (this.body == ''){
			//post requires a title
			this.$notify({
				  group: 'error',
				  text: this.$t('no_empty_post'),
				  position: 'top center'
				})
			this.loading = false
			return;
		}
		
		if (!Array.isArray(this.tags) || this.tags.length < 1){
			//cannot miss having at least 1 tag
			this.$notify({
				  group: 'error',
				  text: this.$t('need_one_tag_min'),
				  position: 'top center'
				})
			this.loading = false
			return;
		}
		
		//console.log(this.tags);
		//return;
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
        let meta = (!this.editPost.isNewPost && this.editPost.json_metadata?JSON.parse(this.editPost.json_metadata):{});
        meta.tags = [
          //'actifit',
          ...this.tags
            //.filter(tag => tag !== 'actifit') // remove actifit tag, its the first tag automatically
            .filter(String) // remove empty values
            .map(tag => tag.trim()) // trim leading and trailing whitespaces from tags
        ]
		
		//add community tag at the start if user selected one.
		/*targetCommunity*/
		if (this.$refs['targetCommunity'].value !='_blog_'){
			meta.tags.unshift(this.$refs['targetCommunity'].value )
		}
		console.log(meta.tags);
		//return;
		
		console.log(meta);
		if (this.editPost.isNewPost || meta.image === undefined){
			meta.image = [];
		}
		
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
		if (!meta.app){
			meta.app = 'actifit/0.5.0';
		}
		if (!meta.app.includes('actifit')){
			meta.app = 'actifit/0.5.0';
		}
		meta.suppEdit = 'actifit.io';
		
		//append post specific data for new posts
		if (this.editPost.isNewPost){
			//let permlnk = this.title.replaceAll('.','-').replaceAll('  ',' ').replaceAll(' ','-').toLowerCase();
			let permlnk = this.title.replaceAll('  ',' ').replaceAll(' ','-').replaceAll('--','-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
			//console.log(permlnk);
			//return;
			//"actifit-"+this.user.account.name.replace('.','-')+"-"+new Date().toISOString().replace(/-|:|\./g, '').toLowerCase();
			this.editPost.parent_author = '';
			this.editPost.parent_permlink = meta.tags[0];
			this.editPost.author = this.user.account.name;
			this.editPost.permlink = permlnk;
			
			//check also if a similar post exists, to adjust permlink
			let chainLnk = hive;
			await chainLnk.api.setOptions({ url: process.env.hiveApiNode });
			let result = await chainLnk.api.getContentAsync(this.user.account.name, permlnk);
			if (result && result.author){
				//found a match
				this.editPost.permlink += "-"+new Date().toISOString().replace(/-|:|\./g, '').toLowerCase();
			}
			
			//fetch beneficiaries from user selection
			this.benef_list = this.$refs['beneficiaryList'].formattedEntries;
			//[{ 'account':'actifit.pay', 'weight':500 }];//, { 'account':'actifit', 'weight':500 }
			//loop through benefic list, ensure values are integer
			
			console.log(this.benef_list);
			
			
			//let remaining_pct -= 500;
			//console.log('ref_benef');
			//console.log(ref_benef);
			/*if (ref_benef){
				benef_list.push(ref_benef);
			}*/
			
			
			//default value for 50-50 pay
			let percent_sbd = 10000;
			
			//check if user selected a different report pay structure than 50-50 SBD/STEEM pay. Other option would be 100% SP
			/*if (typeof req.body.reportSTEEMPayMode!= "undefined" && req.body.reportSTEEMPayMode!=""){
				if (req.body.reportSTEEMPayMode == 'full_SP_Pay'){
					//only change on default if we have a full SP Pay
					percent_sbd = 0;
				}
			}*/
		}
		console.log(this.stdLogin);
		
		let percent_hbd = this.percent_hbd;
		let payout_amnt = this.max_accepted_payout;
		console.log(this.$refs['paymentApproach'].value);
		if (this.$refs['paymentApproach'].value=='decline'){
			payout_amnt = '0.000 HBD';
		}else if (this.$refs['paymentApproach'].value=='hp'){
			percent_hbd = 0;
		}
		
		console.log(payout_amnt);
		console.log(percent_hbd);
		
		//check if user selected a different report pay structure than 50-50 SBD/STEEM pay. Other option would be 100% SP
		//percent_hbd = 0;
		
		let comment_options = { 
			author: this.editPost.author, 
			permlink: this.editPost.permlink, 
			max_accepted_payout: payout_amnt, 
			percent_hbd: percent_hbd, 
			allow_votes: true, 
			allow_curation_rewards: true, 
			extensions: []//extensions: [[0, { 'beneficiaries': [] }]]
		};
		if (Array.isArray(this.benef_list) && this.benef_list.length > 0){
		
			comment_options.extensions = [[0,{'beneficiaries':this.benef_list}]];
			//[{"account":"yabapmatt","weight":1000},{"account":"steemplus-pay","weight":500}
		}
		
		let cstm_params = {
		  "author": this.editPost.author,
		  "title": this.title,
		  "body": this.$refs.editor.content,
		  "parent_author": this.editPost.parent_author,
		  "parent_permlink": this.editPost.parent_permlink,
		  "permlink": this.editPost.permlink,
		  "json_metadata": JSON.stringify(meta)
		};
		
        // save changes
		if (!localStorage.getItem('std_login')){
		//if (!this.stdLogin){
		
			this.$steemconnect.comment(
			  this.editPost.parent_author,
			  this.editPost.parent_permlink,
			  this.editPost.author,
			  this.editPost.permlink,
			  this.title,
			  this.$refs.editor.content,
			  meta,
			  (err) => {
				this.commentSuccess(err, true, 'STEEM');
			  }
			)
		}else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
			//console.log(comment_options);
			//this.$nuxt.refresh()
			
			console.log(JSON.stringify(comment_options));
			if (!this.editPost.isNewPost){
				//cannot broadcast again if editing
				window.hive_keychain.requestBroadcast(this.editPost.author, [['comment', cstm_params]], 'Posting',(response) => {
				  //console.log(response);
				  if (response.success){
					this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
				  }else{
					this.commentSuccess(response.message, false, this.cur_bchain);
				  }
				});	
			}else{
			
				window.hive_keychain.requestPost(
					this.editPost.author, 
					this.title, 
					this.$refs.editor.content,
					this.editPost.parent_permlink,
					this.editPost.parent_author,
					JSON.stringify(meta),
					this.editPost.permlink,
					JSON.stringify(comment_options), (response) => {
					  //console.log(response);
					  if (response.success){
						this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
					  }else{
						this.commentSuccess(response.message, false, this.cur_bchain);
					  }
					});	
			}
		}else{
						
			//console.log(cstm_params);
			
			//return;
			let res
			
			if (this.editPost.isNewPost){
				   
				res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain, 'comment_options', comment_options);
			}else{
				res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain);
			}
			if (res.success){
				this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
			}else{
				this.commentSuccess('error saving', false, this.cur_bchain);
			}
			
			//also send the same post again to the other chain
			let other_chain = this.cur_bchain=='HIVE'?'STEEM':'HIVE';
			if (this.target_bchain == 'BOTH'){
				this.loading = true;
				let res = await this.processTrxFunc('comment', cstm_params, other_chain);
			
				if (res.success){
					this.commentSuccess(null, true, other_chain, this.editPost.isNewPost);
				}else{
					this.commentSuccess('error saving', false, other_chain);
				}
			}
		}
      },
	  async RewardUserEdit () {
		let url = new URL(process.env.actiAppUrl + 'rewardActifitWebEdit/'+this.editPost.author);
		//compile all needed data and send it along the request for processing
		let params = {
			web_edit_token: process.env.webEditToken,
			url: this.editPost.url,
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
	  },
	  runDraftLoader (){
		console.log('load stored draft');
		let data = this.$loadDraft(this.user.account.name, 'blog');
		let jsonRes = JSON.parse(data);
		console.log(jsonRes);
		if (jsonRes){
			this.title = jsonRes.title;
			this.body = jsonRes.body;
			this.tags = jsonRes.tags;
			this.benef_list = jsonRes.beneficiaries;
			this.$refs['targetCommunity'].value = jsonRes.targetCommunity;
			console.log('data loaded');
		}
	  },
	  runDraftSaver (){
		console.log('runDraftSaver');
		//if we have any user input content, save to draft
		if (this.title!='' || this.body!='' && this.editPost.isNewPost){
			let data = {
				title: this.title,
				body: this.$refs.editor.content,
				tags: this.$refs.tagItem.items,
				beneficiaries: this.$refs['beneficiaryList'].formattedEntries,
				targetCommunity: this.$refs['targetCommunity'].value,
			}
			this.$storeDraft(this.user.account.name, data,'blog');
		}
	  }
    },
	async mounted () {
		console.log('edit screen mounted');
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', this.cur_bchain);
		this.fetchCommunities();
		if (this.user){
			//load saved draft
			this.runDraftLoader();
			//save draft in intervals
			setInterval(this.runDraftSaver, 20000);
		}
	}
  }
</script>
<style>
.inline-class{
	display: inline;
}
.label-payment{
	white-space: nowrap;
}
.extra-container{
	display: flex; 
	justify-content: space-between;
}
/* avoid editor taking out menu */
.v-note-wrapper {
    z-index: 100!important;
}
</style>