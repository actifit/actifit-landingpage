<template>
<!--<meta http-equiv="origin-trial" content="token">-->
	<div>
		<NavbarBrand />
		<div class="container pt-5 mt-5 pb-5">
			<!--<input type="button" @click="connectSession3S()" value="Test">-->
			
			<input type="file" ref="fileInput" @change="uploadVideo"/>
			<p v-if="thumbprogress">{{ thumbprogress }}</p>
			<p v-if="vidprogress">{{ vidprogress }}</p>
			<button @click="updateVideoInfo">Create Video Post</button>
			
			<input type="button" @click="generateThumbnail()" value="Thumbnail">
			
			<p v-if="videoSize">Video Size: {{ videoSize }}</p>
			<!--<p v-if="videoLength">Video Length: {{ videoLength }}</p>-->
			<video ref="video" id="video" style="display:none">
			</video>
			<canvas ref="canvas" id="canvas" style="display: none"/>
			<img id="thumb" :src="thumbnail" class="max-img"/>

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

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

/* tus installation:
https://github.com/tus/tus-js-client/blob/2b86d4b01464e742483417270b1927a88c0bbfa6/docs/installation.md
*/

export default {
	data (){
		return {
			video: null,
			videoSize: null,
			videoLength: null,
			filename: '',
			origFilename: '',
			vidprogress: null,
			thumbprogress: null,
			thumbnail: null,
			thumbnailName : ''
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
	},
	methods: {
		
		async uploadVideo (event) {
		  
			this.video = event.target.files[0];
			let file = this.video;
			this.origFilename = file.name;
			//await upload.start()
			this.generateThumbnail()//upload.file)

		},
		
		async generateThumbnail () {
		  //
		  let upRef = this;
		  let URL = URL || window.URL
		  let videoURL = URL.createObjectURL(this.video)
		  console.log(videoURL);
		  let canvas = this.$refs['canvas']//document.createElement('canvas')
		  let context = canvas.getContext('2d')
		  let video = this.$refs['video'];


		  this.$refs['video'].src = videoURL;
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
			
			let reqHeads = new Headers({
				'Content-Type': 'application/json',
				'credentials': 'include',
				//'Cookie': 'connect.sid=s%3ArfBowB6t8rH0pV4wSkamopj0mZARXwNr.%2FS1bwFv%2FuG2IdthqJXV1YyrE4ZwrlDCpxnfdBiPWaUk'

			});
			
			console.log(videoInfo);

			/*let res = await fetch(process.env.threeSpeakUploadInfo, {
				credentials: 'include',
				method: 'POST',
				headers: reqHeads,
				body: JSON.stringify(videoInfo)
			});*/
			try{
				let res = await client.post(process.env.threeSpeakUploadInfo, 
					JSON.stringify(videoInfo),
					{
						withCredentials: true,
						headers: {
						  "Content-Type": "application/json",
						},
					}
				);
				console.log(res);
			}catch(err){
				console.log(err);
			}
			//let outcome = await res.json();
			//console.log(outcome);

		},

		async connectSession3S(){
			try{
			console.log('3S session');
			
			//fetch 3speak memo
			
			//let res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name));
			let res = await client.get(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name),
					{
						withCredentials: true,
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
				/*res = await fetch(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + xcstkn, {
					credentials: 'include',
				});*/
				res = await client.get(process.env.threeSpeakApiSession.replace('_USERNAME_', this.user.account.name)+'&access_token=' + xcstkn,{
						withCredentials: true,
						headers: {
						  "Content-Type": "application/json",
						},
					}
				)
				console.log(res);
				//console.log( res.headers.get('set-cookie'))
				console.log(res.headers["set-cookie"]);
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