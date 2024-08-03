<template>
<!--<meta http-equiv="origin-trial" content="token">-->
	<div>
		<NavbarBrand />
		<div class="container pt-5 mt-5 pb-5">
			<!--<input type="button" @click="connectSession3S()" value="Test">-->
			
			
			<!-- video recording section -->
			
			<video ref="recvideo" width="480" height="360" autoplay controls></video>
			<div v-if="recording">Recording: {{ timeLeft }}</div>
			<div>
				<button @click="startRecording" v-if="!recording">Start Recording</button>
				<button @click="stopRecording" v-else>Stop Recording</button>
				<button @click="playBack" v-if="!recording">Play Back</button>
				<button @click="uploadRecVideo" v-if="!recording">Upload Video</button>
				<a v-if="recordedVideoUrl" :href="recordedVideoUrl" download="recorded-video.mp4">Download Video</a>
			</div>
			
			
			<input type="file" ref="fileInput" @change="uploadVideo"/>
			<p v-if="thumbprogress">{{ thumbprogress }}</p>
			<p v-if="vidprogress">{{ vidprogress }}</p>
			<button @click="updateVideoInfo">Create Video Post</button>
			<button @click="postToHive">post to hive</button>
			
<!--			<input type="button" @click="generateThumbnail()" value="Thumbnail">-->
			
			<p v-if="videoSize">Video Size: {{ videoSize }}</p>
			<!--<p v-if="videoLength">Video Length: {{ videoLength }}</p>-->
			<video ref="video" id="video" style="display:none">
			</video>
			<canvas ref="canvas" id="canvas" style="display: none"/>
			<img id="thumb" :src="thumbnail" class="max-img"/>
			
			
			<div class="card post">
				<div v-if="userVidList.length > 0" v-for="(video, index) in userVidList" :key="index" :video="video">
					<img :src="video.thumbUrl" class="max-img">
					<div>{{video.title}}</div>
					<div>{{(video.size / 1024 / 1024).toFixed(2)}} MB</div>
					<div>{{video.duration}} s</div>
					<div>{{video.permlink}}</div>
					<div>{{video.created}}</div>
					<div>{{video.status}} ({{statusList.find(row => row[0] === video.status)[2]}})</div>
					<div>{{video.encodingProgress}}</div>
					<button @click="postToHive(video)">post to hive</button>
					<button @click="markVideoPublished(video)">Mark published</button>
				</div>
			</div>

		</div>
		<Footer />
	</div>
	
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import {mapGetters} from 'vuex'
import * as tus from "tus-js-client";

import Footer from '~/components/Footer'

import Vue from 'vue'

//import VueCookies from 'vue-cookies'
//Vue.use(VueCookies);

//import {fetch, CookieJar} from "node-fetch-cookies";

//const cookieJar = new CookieJar();
import axios from 'axios';
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

import fixWebmDuration from 'fix-webm-duration';


const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

/* tus installation:
https://github.com/tus/tus-js-client/blob/2b86d4b01464e742483417270b1927a88c0bbfa6/docs/installation.md
*/

export default {
	data (){
		return {
			 recording: false,
			  chunks: [],
			  mediaRecorder: null,
			  stream: null,
			  maxDuration: 30, // Maximum recording duration in seconds
			  timer: null, // Timer to stop the recording after maxDuration seconds
			  startTime: null, // Start time of the recording
			  recordedVid: null, //the actual recorded video
			  recordedVideoUrl: null, // URL of the recorded video
			  timeLeft: this.maxDuration,
			
			title: '', // post title
			body: '', // post body
			tags: [], // post tags
			percent_hbd: 10000,
			max_accepted_payout: '1000000.000 HBD',	
			video: null,
			videoSize: null,
			videoLength: null,
			filename: '',
			origFilename: '',
			vidprogress: null,
			thumbprogress: null,
			thumbnail: null,
			thumbnailName : '',
			xcstkn: '',
			userVidList: [],
			newVid: {},
			statusList: [['uploaded', 0, 'video was just uploaded'],
						['encoding_queued', 1, 'video is now queued for encoding'],
						['encoding', 2, 'video is now being encoded'],
						['encoding_failed', 3, 'video encoding failed after 5 attempts from different encoder nodes'],
						['deleted', 4, 'user can mark this video as deleted'],
						['publish_manual', 5, 'video is ready to be published'],
						['published', 6, 'video was published']],
			benef_list: [
							{account: 'spk.beneficiary', weight: 850},
							{account: 'threespeakleader', weight: 100},
						],
			vidPostContent: '',
		}
	},
	components: {
		NavbarBrand,
		Footer,
		//Beneficiary
	},
	computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	  
	  /*timeLeft() {
		  const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
		  console.log(elapsedSeconds);
			return Math.max(this.mediaRecorder && this.mediaRecorder.state === 'recording' ? this.maxDuration - elapsedSeconds : 0);
		},*/
	},
	methods: {
	
	
		async startRecording() {
      try {
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
		
		async uploadVideo (event) {
		  
			this.video = event.target.files[0];
			let file = this.video;
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
			
			// stop loading animation and show notification
			this.loading = false
			//reward the user for a new edit
			/*if (finalize){
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
				
			}*/
		  },

			
		async postToHive (vid) {
			console.log(this.userVidList);
			//let vid = this.userVidList[0];
			//console.log(vid.beneficiaries);
			
			if (!vid){
				vid = this.newVid;
			}
			
			let percent_hbd = this.percent_hbd;
			let payout_amnt = this.max_accepted_payout;
			
			//if (vid.)
			//grab beneficiaries from video and append them to post
			
			/*let extra_benef = JSON.parse(vid.beneficiaries);
			//console.log(vid.beneficiaries);
			let new_benef = extra_benef.map((beneficiary) => {
			  return [beneficiary.account, beneficiary.weight];
			});
			console.log(new_benef);
			this.benef_list = this.benef_list.concat(new_benef);*/
			let benef = this.benef_list.concat(JSON.parse(vid.beneficiaries));
			
			//if list does not include required account, append it
			let sagarRecord = benef.find(record => record.account === 'sagarkothari88');

			if (sagarRecord === undefined) {
				// If the record is not found, insert a new entry
				benef.push({account: 'sagarkothari88', weight: 100});
			}
			
			//console.log(this.benef_list)
			//sort as this is required for posting properly
			benef = benef.sort((a, b) => a.account.localeCompare(b.account));
			console.log('beneficiaries')
			console.log(benef)
			
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
			//return;
			let comment_options = { 
				author: vid.owner, 
				permlink: vid.permlink, 
				max_accepted_payout: payout_amnt, 
				percent_hbd: percent_hbd, 
				allow_votes: true, 
				allow_curation_rewards: true, 
				extensions: [[0,{'beneficiaries':benef}]]
			};
			
			let meta = {};
			meta.app = '3speak/0.3.0';//'actifit/0.5.0';
			meta.tags = ['actifit', '3speak'];
			meta.video = vidJsonMeta.video;
			
			console.log(meta);
			
			//set content of the post body first as video url:
			this.vidPostContent = 
			'[![]('+vid.thumbUrl+')](https://3speak.tv/watch?v='+vid.owner+'/'+vid.permlink+')'
			//'[![](https://ipfs-3speak.b-cdn.net/ipfs/bafybeibla6isfwwbxbgrxp5y6ntaufdtp7mruih3bhro73qe3utj2ykf4i/)](https://3speak.tv/watch?v=theycallmedan/puewbyjo)'
			
			//await this.grabVideoUrl(vid);
			console.log(this.vidPostContent);
			//return;
			//send the post
			let postSuccess = false;
			if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain){	
				//console.log(comment_options);
				//this.$nuxt.refresh()
				
				console.log(JSON.stringify(comment_options));
				
				window.hive_keychain.requestPost(
					vid.owner, 
					vid.title, 
					this.vidPostContent,
					'actifit',
					'',
					JSON.stringify(meta),
					vid.permlink,
					//this.$refs.editor.content,
					//this.editPost.parent_permlink,
					//this.editPost.parent_author,
					//JSON.stringify(meta),
					//this.editPost.permlink,
					JSON.stringify(comment_options), (response) => {
					  console.log(response);
					  if (response.success){
						postSuccess = true;
						//this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
					  }else{
						//this.commentSuccess(response.message, false, this.cur_bchain);
					  }
					});	
				
			}else{
				let cstm_params = {
				  "author": vid.owner,
				  "title": vid.title,
				  "body": this.vidPostContent,
				  "parent_author": '',
				  "parent_permlink": 'actifit',
				  "permlink": vid.permlink,
				  "json_metadata": JSON.stringify(meta)
				};
				
				//console.log(cstm_params);
				
				//return;
				
					   
				let res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain, 'comment_options', comment_options);
				console.log(res);
				if (res.success){
					postSuccess = true
					//this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
				}else{
					//this.commentSuccess('error saving', false, this.cur_bchain);
				}
				
				
			}
			
			if (postSuccess){
				let outc = await this.markVideoPublished(vid);
			}
			
		},
		
		async getAllVideoStatuses(access_token) {
			console.log('get all videos')
			console.log(process.env.threeSpeakUserVideoList);
			//console.log(access_token);
			try {
			  let response = await client.get(process.env.threeSpeakUserVideoList,
				{
				  withCredentials: false,
				  headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${access_token}`
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
			  return response.data;
			} catch (err) {
			  console.log(err);
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
			console.log(video);
			console.log('duration:'+video.duration)
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
			  upRef.thumbnailName =  thumbnailUpload.url.replace('https://uploads.3speak.tv/files/', '')//thumbnailUpload.file.name;
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
			let videoInfo = {
			  'filename': this.filename,
			  'oFilename': this.origFilename,
			  'size': this.videoSize,
			  'duration': this.videoLength,
			  'thumbnail': this.thumbnailName,
			  'owner': this.user.account.name,
			  'isReel': true
			}
			
			console.log(videoInfo);
			
			try{
				let res = await client.post(process.env.threeSpeakUploadInfo, 
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
					this.newVid = res.data;
				}
			}catch(err){
				console.log(err);
			}

		},
		
		async markVideoPublished(vid){
			let videoInfo = {
			  'videoId': ''+vid._id,//vid.videoid,
			  'title': vid.title,
			  'description': vid.description,
			  'tags': 'actifit',//vid.tags,
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
			}catch(err){
				console.log(err);
			}

		},

		async connectSession3S(){
			try{
			console.log('3S session');
			
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
			let outcome = await res.json();
			console.log(outcome);
			this.xcstkn = '';
			if (outcome.error){
				console.log(outcome.error);
				return;
			}else{
				this.xcstkn = outcome.xcstkn;
			}
			
			//request cookie
			if (this.xcstkn){
				if (this.xcstkn.startsWith('#')){
					this.xcstkn = this.xcstkn.substring(1);//remove first character from token #
				}
				/*res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + xcstkn, {
					credentials: 'include',
				});*/
				res = await client.get(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + this.xcstkn,{
						withCredentials: false,
						headers: {
						  "Content-Type": "application/json",
						},
					}
				)
				console.log(res);
				
				//also grab user's videos
				let myAllVideosWithStatusInfo = await this.getAllVideoStatuses(this.xcstkn);
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
			}
	  },
	},
	async mounted () {
		await this.$store.dispatch('steemconnect/login')
		await this.connectSession3S();
		
	}
}
</script>
<style>
.max-img{
	max-width: 300px;
    max-height: 200px;
    width: auto;
    height: auto;
}
</style>