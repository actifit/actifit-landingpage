<template>
  <div>
	<NavbarBrand />
      <div class="container pt-5 mt-5 pb-5">
		<a href="#a" data-toggle="modal" id="modenabler" name="modenabler" ref="modenabler" data-target="#notifyModal"></a>
		<div class="text-center font-weight">
		  <h5 v-if="editPost.isNewPost" class="modal-title" id="exampleModalLabel">{{ $t('Create_new_vid') }}&nbsp;<img src="/img/3speak.png" class="mr-2 token-logo-md"></h5>
		  <h5 v-else class="modal-title" id="exampleModalLabel">{{ $t('Editing') }} <a :href="'/'+editPost.author+'/'+editPost.permlink">{{ title }}</a></h5>
        </div>
	  
		<div class="vid-container" v-if="xcstkn != ''">
			<div class="card post p-4 m-4 float-left" :class="smallScreenCheck" ref="mainCard">
				<div class="text-center font-weight-bold">{{$t('new_video_placeholder')}}</div>
								
				<div>
					<!-- video upload section -->
					<input type="file" ref="fileInput" @change="uploadVideo" @click="setUploadEnvt()" :max-size="maxFileSize"/>
					
					<!--<div v-if="selVid == newVid">Selected</div>-->
				</div>
				<div>
					<!-- video recording section -->
					<div class="text-center font-weight-bold">{{$t('rec_video_placeholder')}}</div>
					<button @click="setRecordingEnvt()" class="btn btn-white border text-red acti-shadow mt-2 mb-2">{{$t('rec_video')}}</button>
					<transition name="fade">
						<div v-if="userSelection=='recording'">
							<video ref="recvideo" width="480" height="360" autoplay controls></video>
							<div v-if="recording">Recording: {{ timeLeft }} (s) Left</div>
							<div>
								<button @click="startRecording" v-if="!recording" class="btn btn-white border text-red acti-shadow mt-2">Start Recording</button>
								<button @click="stopRecording" v-else class="btn btn-white border text-red acti-shadow mt-2">Stop Recording</button>
								<!--<button @click="playBack" v-if="!recording" class="btn btn-white border text-red acti-shadow mt-2">Play Back</button>-->
								<button @click="uploadRecVideo" v-if="!recording" class="btn btn-white border text-red acti-shadow mt-2">Upload Recording</button>
								<!--<a v-if="recordedVideoUrl" :href="recordedVideoUrl" download="recorded-video.mp4" class="btn btn-white border text-red acti-shadow mt-2">Download Recording</a>-->
							</div>		
						</div>
					</transition>
				</div>
				<div>
					<div v-if="thumbprogress">{{ thumbprogress }}</div>
					<div v-if="vidprogress">{{ vidprogress }}</div>
					
					<div>
						<span v-if="videoLength">{{ videoLength.toFixed(2) }} sec | </span>
						<span v-if="videoSize">{{ (videoSize / 1024 / 1024).toFixed(2) }} MB</span>
					</div>
					<div v-if="videoLength">Now</div>
					<div v-if="videoLength">New Vid <i class="fas fa-solid fa-refresh text-brand" @click="getAllVideoStatuses()" :class="{ 'fa-spin': isRotating }"></i></div>
					
					<video ref="video" id="video" style="display:none">
					</video>
					<canvas ref="canvas" id="canvas" style="display: none"/>
					<img id="thumb" :src="thumbnail" class="max-img"/>
					<div>
						<i class="fas fa-spin fa-spinner text-brand" v-if="processing"></i>
					</div>
					<button class="btn btn-white border text-red acti-shadow mt-2" @click="updateVideoInfo" v-if="videoReady && !newVidSubmitted">Submit Video</button>
					<button class="btn btn-white border text-red acti-shadow mt-2" @click="selectVid(newVid)" v-if="newVidSubmitted">Add to Post</button>
				</div>
			</div>
			<div class="card post p-4 m-4" :class="smallScreenCheck" v-if="userVidList.length > 0" v-for="(video, index) in userVidList" :key="index" :video="video">
				<img :src="video.thumbUrl" class="max-img">
				<div class="vid-title">{{video.title}}</div>
				<div>{{video.duration.toFixed(2)}} sec | {{(video.size / 1024 / 1024).toFixed(2)}} MB</div>
				<!--<div>{{video.permlink}}</div>-->
				<div :title="video.created">{{ $getTimeDifference(video.created) }}</div>
				<div>{{dispStatusWording(video)}} <i class="fas fa-solid fa-refresh text-brand" @click="getAllVideoStatuses()" :class="{ 'fa-spin': isRotating }"></i></div>
				<!--<div>{{video.encodingProgress}}</div>-->
				<button class="btn btn-white border text-red acti-shadow" v-if="!isVideoPublished(video) && !isVideoFailed(video)"  @click="selectVid(video)">Add to Post</button>
				<button v-if="!isVideoPublished(video) && !isVideoFailed(video)" class="btn btn-white border text-red acti-shadow" @click="video = markVideoPublished(video)">Mark published <i v-if="marking==video._id" class="fas fa-spin fa-spinner text-brand"></i></button>
				<a v-else class="btn btn-white border text-red acti-shadow float-right" :href="'/'+video.owner+'/'+video.permlink" target="_blank">View Post</a>
				<!--<div v-if="selVid == video">Selected</div>-->
			</div>
		</div>
	    <div class="vid-container" v-else>
			<button class="btn btn-white border text-red acti-shadow" @click="connectSession3S">Load Videos</button>
		</div>
		
		
		<div class="row text-right" v-if="user">
			<div class="col-12 pb-2">
				<a :href="'/'+user.account.name+'/videos'" ref="my-videos" class="btn btn-brand border" :title="$t('view_videos')"><i class="fa-solid fa-video"></i></a>&nbsp;
				<a :href="'/'+user.account.name+'/blog'" class="btn btn-brand border" :title="$t('view_blog')"><i class="fa-solid fa-pen-to-square"></i></a>&nbsp;
				<a :href="'/'+user.account.name+'/comments'"  class="btn btn-brand border" :title="$t('view_comments')"><i class="far fa-comments"></i></a>
			</div>
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
			<Beneficiary ref="beneficiaryList" :initialEntries="benef_list" :viewOnly="!editPost.isNewPost" class="float-left" :requiredEntries="benef_list.map(obj => obj.account)" :extraNote="$t('benefic_3s')" :restrictedPercent="parseInt(1)" />
			
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
          <button type="button" class="btn btn-white border text-red acti-shadow" :disabled="!selVidReadyForPublish()" @click.prevent="save()">
            <i class="fas fa-spin fa-spinner" v-if="loading"></i>
            <i class="fas fa-paper-plane" v-else></i>
            <span >{{ $t('Publish') }}</span>
			<!--<span v-if="editPost.isNewPost">{{ $t('Publish') }}</span><span v-else>{{ $t('Save') }}</span>-->
			<img src="/img/HIVE.png" style="max-height: 25px" v-if="target_bchain=='HIVE' || target_bchain=='BOTH'">
			<img src="/img/STEEM.png" style="max-height: 25px" v-if="target_bchain=='STEEM' || target_bchain=='BOTH'">
          </button>
        </div>
		<div class="modal-footer border-0 p-0">
		  <div class="text-brand float-right" v-if="!selVidReadyForPublish()">{{$t('sel_suitable_vid')}}</div>
		</div>
      </div>
	  <Footer />
	<client-only>
      <div>
        <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
		<notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
        <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
		<NotifyModal id="notifyModal" ref="notifyModal" :modalTitle="$t('Actifit_Info')" :modalText="$t('success_submit_wait_encoding')"/>
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
  
  import NotifyModal from '~/components/NotifyModal';
  
  import hive from '@hiveio/hive-js'
  
  import NavbarBrand from '~/components/NavbarBrand';
  import Footer from '~/components/Footer';
  
  //needed to fix incorrect duration when recording video
  import fixWebmDuration from 'fix-webm-duration';
  
  import axios from 'axios';
  import * as tus from "tus-js-client";
	import { wrapper } from "axios-cookiejar-support";
	import { CookieJar } from "tough-cookie";

	const jar = new CookieJar();
	const client = wrapper(axios.create({ jar }));
	/* tus installation:
https://github.com/tus/tus-js-client/blob/2b86d4b01464e742483417270b1927a88c0bbfa6/docs/installation.md
*/

	/* handles outside clicks for the picker */
	/* begin */
	import Vue from 'vue';
	
	//for hiveauth
	import { Signature, hash, PublicKey, ec } from 'elliptic';


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
	head () {
		return {
		  title: `New Video Post via Actifit`,
		  meta: [
			{ hid: 'description', name: 'description', content: `New Video post via Actifit` },
			{ hid: 'ogdescription', name: 'og:description', content: `New Video post via Actifit` }
		  ]
		}
	},
    components: {
	  Footer,
	  NavbarBrand, 
	  CustomTextEditor,
	  TagInput,
	  Beneficiary,
	  NotifyModal
    },
    data () {
      return {
		/* recording vid section */
		recording: false,
		chunks: [],
		mediaRecorder: null,
		stream: null,
		maxDuration: 60, // Maximum recording duration in seconds
		timer: null, // Timer to stop the recording after maxDuration seconds
		startTime: null, // Start time of the recording
		recordedVid: null, //the actual recorded video
		recordedVideoUrl: null, // URL of the recorded video
		timeLeft: this.maxDuration,
		/* end */
		maxFileSize: 750 * 1000 * 1000, // max 250M
		isRotating: false,
        runnerProc: -1, //interval to mark vid as published
		title: '', // post title
        body: '', // post body
        tags: [], // post tags
        loading: false, // loading animation in submit button
		loadingxcstkn: false,
		cur_bchain: 'HIVE', //bchain used to edit/save
		target_bchain: 'HIVE', //bchain to which edits will go
		//benef_list: [],
		percent_hbd: 10000,
		max_accepted_payout: '1000000.000 HBD',
		communitySubs: [],
		editPost: {
			isNewPost: true,
		},
		video: null,
		videoSize: null,
		videoLength: null,
		videoReady: false,
		processing: false,
		marking: -1,
		filename: '',
		origFilename: '',
		vidprogress: null,
		thumbprogress: null,
		thumbnail: null,
		thumbnailName : '',
		thumbnailUrl: '',
		xcstkn: '',
		userVidList: [],
		selVid: {},
		newVid: {},
		newVidSubmitted: false,
		userSelection: 'upload',
		statusList: [['uploaded', 0, 'Uploaded'],
					['encoding_queued', 1, 'Queued for Encoding'],
					['encoding_ipfs', 2, 'Processing Encoding'],
					['encoding_failed', 3, 'Encoding Failed'],
					['deleted', 4, 'Deleted'],
					['publish_manual', 5, 'Ready to publish'],
					['published', 6, 'Published✓']],
		benef_list: [
						{account: 'spk.beneficiary', weight: 1000},
						//{account: 'threespeakleader', weight: 100},
					],
		vidPostContent: '',
		//comment_options: {},
      }
    },
    computed: {
      ...mapGetters(['bchain']),//'editPost', 
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  smallScreenCheck () {
		//use proper classes for neat display
		if (screen.width < 768){
		  return "";
		}
		return "w-25";
		//return "";
	  },
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
		this.connectSession3S();
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
		dispStatusWording(video){
			//console.log(video.status);
			let match = this.statusList.find(row => row[0] === video.status);
			if (Array.isArray(match)){
				return match[2]
			}
			return '';
		},
		setUploadEnvt(){
			this.$nextTick(() => {
				if (screen.width >= 768){
					this.$refs.mainCard.classList.add('w-25');
				}
				this.userSelection='upload';
			});
		},
		setRecordingEnvt() {
			this.$nextTick(() => {
				if (screen.width >= 768){
					this.$refs.mainCard.classList.remove('w-25');
				}
				this.userSelection='recording';
			});
		},
		async startRecording() {
		  try {
			console.log(this.recordedVideoUrl);
			if (this.recordedVideoUrl != null ){
				let userPrmpt = confirm(this.$t('existing_recording'));
				if (!userPrmpt){
					return;
				}
			}
			this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			this.$refs.recvideo.srcObject = this.stream;
			this.mediaRecorder = new MediaRecorder(this.stream);
			this.mediaRecorder.addEventListener('dataavailable', (event) => {
			  if (event.data.size > 0) {
				this.chunks.push(event.data);
			  }
			});
			this.mediaRecorder.addEventListener('stop', async () => {
			  console.log('event listener stop')
			  let blob = new Blob(this.chunks, { type: 'video/mp4' });
			  let duration = Date.now() - this.startTime;
			  blob = await fixWebmDuration(blob, duration, {logger: false});
			  //const blob = await fixWebmDuration(new Blob(this.chunks, { type: 'video/mp4' }), duration);
			  this.recordedVid = new File([blob], 'recorded-video.mp4', { type: blob.type });
			  this.recordedVideoUrl = URL.createObjectURL(blob);
			  this.chunks = [];
			  this.mediaRecorder = null;
			  this.stream = null;
			  this.$refs.recvideo.srcObject = null;
			  //set proper src for video
			  this.$refs.recvideo.src = this.recordedVideoUrl;
			});
			this.startTime = Date.now();
			this.mediaRecorder.start();
			this.recording = true;
			this.timer = setInterval(() => {
			  /*if (this.timeLeft <= 0) {
				this.stopRecording();
			  }*/
			  const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
			  const timeLeft = Math.max(this.mediaRecorder && this.mediaRecorder.state === 'recording' ? this.maxDuration - elapsedSeconds : 0);
			  this.$nextTick(() => {
				this.timeLeft = timeLeft;
			  });
			  if (timeLeft <= 0) {
				this.stopRecording();
			  }
			}, 1000);
		  } catch (error) {
			console.error('Error starting video recording:', error);
		  }
		},
		stopRecording() {
		  console.log('stoprecording func');
		  this.mediaRecorder.stop();
		  clearInterval(this.timer);
		  this.recording = false;
		  
		  //set video ready for playback
		  this.playBack();
		  //console.log(this.mediaRecorder)
		  //const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });

		  //console.log(blob);
		  //this.recordedVid = new File([blob], 'recorded-video.mp4', { type: blob.type });
		},
		playBack() {
			if (!this.recording){
				this.$refs.recvideo.src = this.recordedVideoUrl;
			}
		},
		async uploadRecVideo (vid){
			this.video = this.recordedVid;
			let file = this.video;
			this.origFilename = file.name;
			console.log(file.name)
			//await upload.start()
			this.generateThumbnail(this.recordedVideoUrl)//upload.file)
		
		},
		selVidReadyForPublish(){
			return (this.selVid && this.selVid.status && this.selVid.status=='publish_manual');
		},
		isVideoPublished(video){
			return video.status == 'published';//this.statusList.find(row => row[0] === )[2]}
		},
		isVideoFailed(video){
			return video.status == 'encoding_failed';//this.statusList.find(row => row[0] === )[2]}
		},
		selectVid(video){
			this.selVid = video;
			//set content of the post body first as video url:
			let thumbUrl = 'https://ipfs-3speak.b-cdn.net/ipfs/'+video.thumbnail.replace('ipfs://','');
			
			this.$refs['editor'].content = 
			'[![]('+thumbUrl+')](https://3speak.tv/watch?v='+video.owner+'/'+video.permlink+')';
		},
		async uploadVideo (event) {
			
			
			
			this.video = event.target.files[0];
			let file = this.video;
			if (file.size > this.maxFileSize){
				this.$notify({
				  group: 'error',
				  text: this.$t('file_too_large').replace('_MAXSIZE_',this.maxFileSize / 1000 / 1000+' MB '),
				  position: 'top center'
				})
				event.target.value = null;
				return;
			}
			this.origFilename = file.name;
			//await upload.start()
			this.generateThumbnail()//upload.file)

		},
		
		async grabVideoUrl (vid){
			let targetField = vid.video_v2//vid.filename;//
			if (targetField){
				if (targetField.startsWith('http')){
					//we're good, no changes needed
					return targetField;//vid.video_v2;
				}
				return process.env.threeSpeakCDN + '/' + targetField.replaceAll('ipfs://','');
				//vid.video_v2.replaceAll('ipfs://','');
			}
			return '';
		},

	
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
				$(this.$refs.editPostModal).modal('hide')
			}
			this.RewardUserEdit();
			// update post in store
			this.$store.dispatch('updatePost', {
			  author: this.editPost.author,
			  permlink: this.editPost.permlink
			})
			
		}
	  },
      async save (vid) {
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
		
		if (!vid){
			vid = this.selVid;
		}
		
		//append post specific data for new posts
		if (this.editPost.isNewPost){
			//let permlnk = this.title.replaceAll('.','-').replaceAll('  ',' ').replaceAll(' ','-').toLowerCase();
			//let permlnk = this.title.replaceAll('  ',' ').replaceAll(' ','-').replaceAll('--','-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
			
			
			
			//console.log(permlnk);
			//return;
			//"actifit-"+this.user.account.name.replace('.','-')+"-"+new Date().toISOString().replace(/-|:|\./g, '').toLowerCase();
			this.editPost.parent_author = '';
			this.editPost.parent_permlink = meta.tags[0];
			this.editPost.author = this.user.account.name;
			//use video permlink for post permlink
			this.editPost.permlink = vid.permlink;//permlnk;
			
			//check also if a similar post exists, to adjust permlink
			let chainLnk = hive;
			await chainLnk.api.setOptions({ url: process.env.hiveApiNode });
			let result = await chainLnk.api.getContentAsync(this.user.account.name, this.editPost.permlink);
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
		
		
		//video specific requirements


		let benef = this.benef_list.concat(JSON.parse(vid.beneficiaries));
		
		//if list does not include required account, append it
		/*let sagarRecord = benef.find(record => record.account === 'sagarkothari88');

		if (sagarRecord === undefined) {
			// If the record is not found, insert a new entry
			benef.push({account: "sagarkothari88", weight: 100});
		}*/
		
		//console.log(this.benef_list)
		//sort as this is required for posting properly
		benef = benef.sort((a, b) => a.account.localeCompare(b.account));
		console.log('beneficiaries')
		console.log(benef)
		
		if (benef.length > 4){
			//adding condition to prevent overassigning beneficiaries due to issue with video encoding on 3speak end with more than 5 beneficiaries
			//post requires a title
			this.$notify({
				  group: 'error',
				  text: this.$t('benefic_count_exceeded'),
				  position: 'top center'
				})
			this.loading = false
			return;
		
		}
		
		//return;
		//setup proper video metadata for 3speak
		let vidJsonMeta = {
			video: {
				info: {
				  platform: '3speak',
				  title: vid.title,
				  author: vid.owner,
				  permlink: vid.permlink,
				  duration: vid.duration,
				  filesize: vid.size,
				  file: vid.filename,
				  lang: 'en',
				  firstUpload: false,
				  video_v2: vid.video_v2,
				  sourceMap: [
					{
						type: "thumbnail",
						url: vid.thumbnail,
					},
					{
						type: "video",
						url: vid.video_v2,
						format: "m3u8",
					}
				  ],
				},
				content: {
				  description: '',
				  tags: ['actifit','3speak'],
				},
			},
		}
		
		meta.video = vidJsonMeta.video;
		
		//set content of the post body first as video url:
		let thumbUrl = 'https://ipfs-3speak.b-cdn.net/ipfs/'+vid.thumbnail.replace('ipfs://','');
		
		this.vidPostContent = 
		'[![]('+thumbUrl+')](https://3speak.tv/watch?v='+vid.owner+'/'+vid.permlink+')'
		
		//return;
		let comment_options = { 
			author: vid.owner, 
			permlink: this.editPost.permlink,//vid.permlink, 
			max_accepted_payout: payout_amnt, 
			percent_hbd: percent_hbd, 
			allow_votes: true, 
			allow_curation_rewards: true, 
			extensions: [[0,{'beneficiaries':benef}]]
		};
			
		
		//check if user selected a different report pay structure than 50-50 SBD/STEEM pay. Other option would be 100% SP
		//percent_hbd = 0;
		
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
		let postSuccess = false;
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
			let outc = await this.postKeychain(cstm_params, comment_options);
			console.log(outc)
			if (outc.success){
				postSuccess = true;
			}else{
				this.loading = false;
				this.$notify({
				  group: 'error',
				  text: 'there was an error creating the video post',
				  position: 'top center'
				})
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
				//this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
				postSuccess = true;
			}else{
				//this.commentSuccess('error saving', false, this.cur_bchain);
				this.loading = false;
			}
			
			//also send the same post again to the other chain
			/*
			let other_chain = this.cur_bchain=='HIVE'?'STEEM':'HIVE';
			if (this.target_bchain == 'BOTH'){
				this.loading = true;
				let res = await this.processTrxFunc('comment', cstm_params, other_chain);
			
				if (res.success){
					postSuccess = true;
					//this.commentSuccess(null, true, other_chain, this.editPost.isNewPost);
				}else{
					//this.commentSuccess('error saving', false, other_chain);
				}
			}*/
		}
		console.log(postSuccess);
		let attempts = 0;
		let maxAttempts = 10;
		let markVidPublished = true;//false;
		if (postSuccess && markVidPublished){
			//wait a second or two to validate on blockchain
			this.runnerProc = setInterval(async () => {
			  //this.$refs.editor.simplemde.codemirror.refresh()
			  //console.log(this.$refs.editor.textarea.value);
				console.log('mark video published');
				attempts += 1;
				let vidUpdate = await this.markVideoPublished(vid, true);
				if (vidUpdate.status == 'published'){
					clearInterval(this.runnerProc)
					this.$notify({
					  group: 'success',
					  text: this.$t('video_post_created') ,
					  position: 'top center'
					})
					this.loading = false;
					//this.$router.push('/'+this.user.account.name+'/videos');
					this.$refs['my-videos'].click();
				}
				else if (attempts > maxAttempts){
					clearInterval(this.runnerProc);
					this.$notify({
					  group: 'error',
					  text: this.$t('video_post_created') + ' ' + this.$t('issue_marking_published'),
					  position: 'top center'
					})
					this.loading = false;
				}
			}, 3000)
				
		}
      },
	  
	  resetNewVidData(){
		this.videoLength = '';
		this.video = null;
		this.videoSize = null;
		this.videoLength = null;
		this.videoReady = false;
		this.processing = false;
		this.filename = '';
		this.origFilename = '';
		this.vidprogress = null;
		this.thumbprogress = null;
		this.thumbnail = null;
		this.thumbnailName  = '';
		this.thumbnailUrl = '';
		this.newVidSubmitted = false;
		
		if (this.$refs.recVideo){
			this.$refs.recVideo.src = '';
		}
		this.timeLeft = this.maxDuration;
	  },
	  
	  async getAllVideoStatuses() {
			this.isRotating = true;
			console.log('get all videos')
			console.log(process.env.threeSpeakUserVideoList);
			//console.log(access_token);
			try {
			  let response = await client.get(process.env.threeSpeakUserVideoList,
				{
				  withCredentials: false,
				  headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.xcstkn}`
				  },
				}
			  );
			  console.log(response);
			  if (response.data){
				//set user videos array
				this.userVidList = response.data;//JSON.stringify(myAllVideosWithStatusInfo)
				console.log(this.userVidList);
				//console.log(`All Videos Info response: userVidList${}`);
			  }
			  this.resetNewVidData();
			  this.isRotating = false;
			  return response.data;
			} catch (err) {
			  console.log(err);
			  //reset session data
			  localStorage.removeItem('3s_access_token');
			  this.isRotating = false;
			  throw err;
			}
			
		},
		
		async generateThumbnail (vidUrl) {
		  //
		  let upRef = this;
		  let URL = URL || window.URL
		  let videoURL
		  if (vidUrl){
			videoURL = vidUrl;
		  }else{
			videoURL = URL.createObjectURL(this.video)
		  }
		  console.log(videoURL);
		  let canvas = this.$refs['canvas']//document.createElement('canvas')
		  let context = canvas.getContext('2d')
		  let video = this.$refs['video'];


		  video.src = videoURL;
		  //video.addEventListener('loadeddata', async () => {
		  video.addEventListener('loadedmetadata', async () => {
			
			//set current video time. Go to 25%
			video.currentTime = video.duration * 0.25;//5
			//console.log(video)
			
			canvas.width = video.videoWidth
			canvas.height = video.videoHeight
			//console.log(canvas.width)
			//console.log(canvas.height)

			upRef.videoLength = video.duration;// + ' seconds'
			//console.log(upRef.thumbnail);
			//console.log(upRef.videoLength)
			//return;
			
		  })
		  //capture the seeking event, and set proper image accordingly
		  video.addEventListener('seeked', async () => {
			upRef.processing = true;
			context.drawImage(video, 0, 0, canvas.width, canvas.height)
			upRef.thumbnail = canvas.toDataURL()
			
			await upRef.startThumbnailUpload()
			await upRef.startVideoUpload()
			
		  })
		  
		},
		
		
		async startVideoUpload(){
		  console.log('start video upload');
		  let file = this.video
		  console.log(this.video);
		  
		  //this.$cookies.set("connect.sid","s%3AV4_SdjzaTTAKQ6cPUsztSmwOYOaJErtc.oLdKsvBfueMkUsPDamPQls1EAeiwthMfM2UK4%2FhAvqU");
		  
		  //let cook = this.$cookies.get("connect.sid") // vuejs
		  //console.log(cook);
		  
		  let upRef = this;
		  let upload = new tus.Upload(file, {
			endpoint: 'https://uploads.3speak.tv/files',
			chunkSize: 100 * 1024,
			retryDelays: [0, 1000, 3000, 5000],
			metadata: {
			  filename: file.name,
			  filetype: file.type
			},
			onError (error) {
			  console.log('Failed because: ' + error)
			},
			onProgress (bytesUploaded, bytesTotal) {
			  let percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
			  upRef.vidprogress = 'Video Upload '  + percentage + '%';
			  //console.log(bytesUploaded, bytesTotal, percentage + '%')
			},
			onSuccess () {
			  console.log('Upload completed!')
			  console.log("Download %s from %s", upload.file.name, upload.url)
			  upRef.filename = upload.file.name;
			  
			  upRef.filename = upload.url.replace('https://uploads.3speak.tv/files/', '');			  
			  //upRef.videoSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`
			  upRef.videoSize = file.size
			  upRef.videoReady = true;
			  upRef.processing = false;
			  console.log(upRef.filename)
			  //send over data to 3speak creating video post
			  //upRef.updateVideoInfo()
			}
		  })
		  
		  await upload.start()
		 
		},
		
		async startThumbnailUpload() {
		  console.log('startthumbnailupload');
		  let upRef = this;
		  /*
		  let data = this.thumbnail.split(',')[1]
		  let binary = atob(data)
		  let array = []
		  
		  for (let i = 0; i < binary.length; i++) {
			array.push(binary.charCodeAt(i))
		  }
		  let thumbnailBlob = new Blob([new Uint8Array(array)], {type: 'image/jpeg'})
		  */
		  let thumbnailBlob = this.dataURItoBlob(this.thumbnail);

		  let thumbnailUpload = new tus.Upload(thumbnailBlob, {
			endpoint: 'https://uploads.3speak.tv/files',
			chunkSize: 100 * 1024,
			metadata: {
			  filename: 'thumbnail.png'
			},
			onError: function (error) {
			  console.log("Failed because: " + error)
			},
			onProgress: function (bytesUploaded, bytesTotal) {
			  let percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
			  //console.log(`Thumbnail: ${bytesUploaded}/${bytesTotal} (${percentage}%)`)
			  upRef.thumbprogress = 'Thumbnail Upload '+percentage + '%';
			},
			onSuccess: function () {
			  console.log('Thumbnail Upload completed!')
			  //console.log(thumbnailUpload);
			  upRef.thumbnailName = thumbnailUpload.url.replace('https://uploads.3speak.tv/files/', '')
			  upRef.thumbnailUrl = thumbnailUpload.url;
			  //thumbnailUpload.file.name;
			  console.log("Download %s from %s", upRef.thumbnailName, thumbnailUpload.url)
			  
			  console.log(`Thumbnail uploaded: ${thumbnailUpload.url}`)
			}
		  })
		  await thumbnailUpload.start()
		},
		
		dataURItoBlob (dataURI) {
		  const byteString = atob(dataURI.split(',')[1])
		  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
		  const ab = new ArrayBuffer(byteString.length)
		  const ia = new Uint8Array(ab)
		  for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i)
		  }
		  return new Blob([ab], { type: mimeString })
		},
		
		async updateVideoInfo(){
			this.processing = true;
			let videoInfo = {
			  'filename': this.filename,
			  'oFilename': this.origFilename,
			  'size': this.videoSize,
			  'duration': this.videoLength,
			  'thumbnail': this.thumbnailName,
			  'owner': this.user.account.name,
			  'isReel': false
			}
			
			console.log(videoInfo);
			
			try{
				let res = await client.post(process.env.threeSpeakUploadInfo+'?app=actifit', 
					JSON.stringify(videoInfo),
					{
						withCredentials: false,
						headers: {
						  "Content-Type": "application/json",
						  "Authorization": `Bearer ${this.xcstkn}`
						},
					}
				);
				console.log(res);
				
				if (res.status == 200){
					this.selVid = res.data;
					this.newVid = this.selVid;
					this.newVidSubmitted = true;
					let vidPermLink = this.selVid.permlink;
					//register this video for monitoring to update user about its status
					let url = new URL(process.env.actiAppUrl+"userAddedVid/"+
						this.user.account.name+"/"+vidPermLink+"/new");
					let subres = await fetch(url);
					//show success message and wait for video ready
					//refresh vid list
					this.getAllVideoStatuses();
					
					console.log(this.$refs['modenabler']);
					this.$refs['modenabler'].click();
									
					/*				
					//embed video link to post including image thumb and video
					let thumbUrl = 'https://ipfs-3speak.b-cdn.net/ipfs/'+this.selVid.thumbnail.replace('ipfs://','');
					
					this.$refs['editor'].content += '[![]('+thumbUrl+')](https://3speak.tv/watch?v='+this.selVid.owner+'/'+this.selVid.permlink+')';
					*/
				}
				
			}catch(err){
				console.log(err);
			}
			this.processing = false;

		},
		
		async markVideoPublished(vid, keepactivefail){
			this.processing = true;
			this.marking = vid._id;
			let videoInfo = {
			  'videoId': ''+vid._id,//vid.videoid,
			  'title': vid.title,
			  'description': vid.description,
			  'tags': vid.tags,
			  'thumbnail': vid.thumbnail
			}
			
			console.log(videoInfo);
			try{
				let res = await client.post(process.env.threeSpeakUserVideoList+"/iPublished", 
					JSON.stringify(videoInfo),
					{
						withCredentials: false,
						headers: {
						  "Content-Type": "application/json",
						  "Authorization": `Bearer ${this.xcstkn}`
						},
					}
				);
				console.log(res);
				if (res && res.data && res.data.success){
					vid.status = 'published'
					this.processing = false;
					this.loading = false;
					this.marking = -1;
				}else{
					if (!keepactivefail){
						this.processing = false;
						this.loading = false;
						this.marking = -1;
					}
				}
			}catch(err){
				console.log(err);
				if (!keepactivefail){
					this.processing = false;
					this.loading = false;
					this.marking = -1;
				}
			}
			return vid;
		},
		
		async postKeychain(cstm_params, comment_options){
			return new Promise((resolve, reject) => {
				console.log(JSON.stringify(comment_options));
				if (!this.editPost.isNewPost){
				//cannot broadcast again if editing
					window.hive_keychain.requestBroadcast(this.editPost.author, [['comment', cstm_params]], 'Posting',(response) => {
					  //console.log(response);
					  if (response.success){
						resolve({success: true})
						//this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
					  }else{
					    resolve({error: true})
						//this.commentSuccess(response.message, false, this.cur_bchain);
					  }
					});	
				}else{
					window.hive_keychain.requestBroadcast(this.editPost.author, [['comment', cstm_params], ['comment_options', comment_options]], 'Posting',(response) => {
					/*window.hive_keychain.requestPost(
					this.editPost.author, 
					this.title, 
					this.$refs.editor.content,
					this.editPost.parent_permlink,
					this.editPost.parent_author,
					JSON.stringify(meta),
					this.editPost.permlink,
					JSON.stringify(comment_options), (response) => {*/
					  console.log(response);
					  if (response.success){
						resolve({success: true})
						//this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
					  }else{
					    resolve({error: true})
						//this.commentSuccess(response.message, false, this.cur_bchain);
					  }
					});	
				}
			})
		},
		
		async keychainDecode(memo){
			return new Promise((resolve, reject) => {
					const keychain = window.hive_keychain;
					keychain.requestVerifyKey(this.user.account.name, memo, 'Posting', (response) => {
					  console.log(response);
					  if (response.success === true) {
						const decodedMessage = response.result;
						resolve({'xcstkn': decodedMessage});
					  }else{
						reject({'error': 'error'});
					  }
					});
				})
				
		},

		async connectSession3S(){
			try{
				if (this.loadingxcstkn){
					//do nothing, already loading
					return;
				}
				this.loadingxcstkn = true;
				console.log('keychain>>>')
				console.log(window.hive_keychain)
				console.log('3S session');
				//check if token already exists, if so skip below
				const ts_tkn = localStorage.getItem('3s_access_token');
				if (ts_tkn){
					this.xcstkn = ts_tkn;
				}else{
				
					//fetch 3speak memo
					
					//let res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name));
					let res = await client.get(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name),
							{
								withCredentials: false,
								headers: {
								  "Content-Type": "application/json",
								},
							}
						);
					
					console.log(res);
					//let outcome = await res.json();
					//console.log(outcome);
					let memo = '';
					if (res && res.data && res.data.memo){
						memo = res.data.memo;
					}
					console.log(memo);
					
					//decode memo

					//grab actifit token
					let outcome = {};
					
					if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){
						
						
						console.log('utils decodememo')
						outcome = await this.keychainDecode(memo);
						console.log(outcome);
					}else if (localStorage.getItem('acti_login_method') == 'hiveauth'){
						this.$notify({
						  group: 'error',
						  text: this.$t('operation_ns_hiveauth'),
						  position: 'top center'
						})
						/*const auth = {
						  username: this.user.account.name,
						  token: localStorage.getItem('access_token'),//should be changed in V1 (current V0.8)
						  expire: localStorage.getItem('expires'),
						  key: localStorage.getItem('key')
						}
						const challenge_data = {
							key_type: "posting",
							challenge: JSON.stringify({
								login: auth.username,
								ts: this.user.account.name
							})
						}*/
						
						/*const ecc = new ec('secp256k1');						
						const res = await this.$HAS.challenge(auth, challenge_data)
						console.log(res);
						const sig = Signature.fromHex(res.data.challenge) //ecc.
						const buf = hash.sha256(challenge, null, 0) //ecc.
						const verified = sig.verifyHash(buf, ecc.PublicKey.fromString(res.data.pubkey));
						console.log(buf);
						console.log(verified);
						if(verified) {
							console.log("challenge succeeded")
						} else {
							console.error("challenge failed")
						}*/
						
						/*let op_name = 'decode';
						let cstm_params = {
							key: ,
							message: memo
						}
						let operation = [ 
						   [op_name, cstm_params]
						];*/
						//TODO: implement hiveauth approach to decode memo. Currently hiveauth does not support such calls
						/*let operation = [ 
						   ['decode', {}]
						];*/
					}else{
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
					
					}
					this.xcstkn = '';
					if (outcome.error){
						console.log(outcome.error);
						this.loadingxcstkn = false;
						return;
					}else{
						this.xcstkn = outcome.xcstkn;
						this.loadingxcstkn = false;
					}
				
					//store token under localstorage
					localStorage.setItem('3s_access_token', this.xcstkn);
				
				}
				
				
				//request cookie
				if (this.xcstkn){
					if (this.xcstkn.startsWith('#')){
						this.xcstkn = this.xcstkn.substring(1);//remove first character from token #
					}
					/*res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + xcstkn, {
						credentials: 'include',
					});*/
					let res = await client.get(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + this.xcstkn,{
							withCredentials: false,
							headers: {
							  "Content-Type": "application/json",
							},
						}
					)
					console.log(res);
					
					//also grab user's videos
					let myAllVideosWithStatusInfo = await this.getAllVideoStatuses();
					//console.log(`All Videos Info response: ${JSON.stringify(myAllVideosWithStatusInfo)}`);

					//const videoID = myAllVideosWithStatusInfo[0]._id;
					//console.log(videoID);
					//
					//console.log( res.headers.get('set-cookie'))
					//console.log(res.headers["set-cookie"]);
					//outcome = await res.json();
					//console.log(outcome);	
				}
			}catch(exc){
				console.log(exc);
				this.loadingxcstkn = false;
				//localStorage.removeItem('3s_access_token');
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
	},
	async mounted () {
		console.log('edit screen mounted');
		this.cur_bchain = (localStorage.getItem('cur_bchain')?localStorage.getItem('cur_bchain'):'HIVE');
		this.$store.commit('setBchain', this.cur_bchain);
		await this.$store.dispatch('steemconnect/login')
		await this.connectSession3S();
		this.fetchCommunities();
		
		//this.$refs['modenabler'].click();

		
		//customize file input to follow our standard
		/*
		try{
			const fileInput = this.$refs.fileInput;
			const fileSelectButton = fileInput.parentElement.querySelector('.js-file-button');
			//const fileSelectButton = fileInput.parentElementquerySelector('::file-selector-button');//fileInput.nextElementSibling;//
			console.log(fileSelectButton);
			fileSelectButton.classList.add('btn','btn-white', 'border', 'text-red', 'acti-shadow');
		}catch(err){
			console.log(err);
		}*/
	}
  }
</script>
<style>
.vid-container {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap; /* prevent blocks from wrapping to the next line */
  min-height: 100px;
}
/* Style for the scrollbar */
.vid-container::-webkit-scrollbar {
    height: 10px;
    background-color: #f5f5f5;
  }
  /* Style for the thumb */
.vid-container::-webkit-scrollbar-thumb {
    background-color: #ff112d;
    border-radius: 5px;
  }
  /* Style for the thumb on hover */
.vid-container::-webkit-scrollbar-thumb:hover {
    background-color: pink !important;
  }
  
  
.post {
  display: inline-block;
  min-height: 100px;
  background-color: antiquewhite;
}
.max-img{
	max-width: 230px;
    max-height: 180px;
    width: auto;
    height: auto;
}
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
.post-title{
	min-height: 60px;
}
.vid-title{
	overflow: hidden;
}
.card{
	box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	overflow: hidden;
}
.card-green{
	box-shadow: 3px 3px 3px rgb(0 255 0 / 40%);
}
.post-image{
	width: 100%;
	height: 150px;
	object-fit: cover;
}
input::file-selector-button {
	background: #fff;
    color: #ff112d !important;
	border: 1px solid #dee2e6!important;
	border-radius: 5px;
    box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
	margin: 10px;
    min-height: 40px;
}
input::file-selector-button:hover{
	background: #f8f8f8;
    box-shadow: none;
	text-decoration: none;
	cursor: pointer;
}

/* transitions */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
/* avoid editor taking out menu */
.v-note-wrapper {
    z-index: 100 !important;
}
</style>
<style lang="sass">
  .post
    height: 100%
    h6
      background: #ff112d
      padding: 8px 10px
      a
        color: #fff
    .post-body
      padding: 8px 10px
    a
      color: #333
      &:hover
        text-decoration: none
    .details
      line-height: 1rem
    .user-avatar
      width: 20px
      height: 20px
      background-position: center center
      background-size: cover
      border-radius: 50%
      float: left
      border: solid 1px #ddd
</style>