<template>
<!--<meta http-equiv="origin-trial" content="token">-->
	<div>
		<NavbarBrand />
		<div class="container pt-5 mt-5 pb-5">
			<!--<input type="button" @click="connectSession3S()" value="Test">-->
			
			<input type="file" ref="fileInput" @change="upload"/>
			<p v-if="progress">{{ progress }}</p>
			<button @click="updateVideoInfo">Create Video Post</button>
			
			<!--<input type="button" @click="generateThumbnail()" value="Thumbnail">-->
			
			<p v-if="videoSize">Video Size: {{ videoSize }}</p>
			<!--<p v-if="videoLength">Video Length: {{ videoLength }}</p>-->
			
			<img v-if="thumbnail" :src="thumbnail"/>

		</div>
	</div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import {mapGetters} from 'vuex'
import * as tus from "tus-js-client";
//import tus from 'tus-js-client'
//import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';//,fetchFile

//fix for "ReferenceError: SharedArrayBuffer is not defined"



let ffmpeg;
/* tus installation:
https://github.com/tus/tus-js-client/blob/2b86d4b01464e742483417270b1927a88c0bbfa6/docs/installation.md
*/

export default {
	data (){
		return {
			videoSize: null,
			videoLength: null,
			filename: '',
			origFilename: '',
			//ffmpeg: null,
			progress: null,
			thumbnail: null,
			selFile: null,
		}
	},
	components: {
		NavbarBrand
	},
	computed: {
	  ...mapGetters('steemconnect', ['user']),
	  ...mapGetters('steemconnect', ['stdLogin']),
	},
	methods: {
		startUpload () {
		  this.upload()
		},
		async upload () {
		  let input = this.$refs.fileInput
		  let file = input.files[0]
		  this.selFile = file;
		  let upRef = this;
		  
		  this.origFilename = file.name;
		  
		  //grab file duration
		  /*ffmpeg.getData(file, (data) => {
			this.videoLength = data.format.duration
		  })*/
		  
		  let upload = new tus.Upload(file, {
			//endpoint: 'https://master.tus.io/files/',
			endpoint: 'https://uploads.3speak.tv/files',
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
			  upRef.progress = percentage + '%';
			  //console.log(bytesUploaded, bytesTotal, percentage + '%')
			},
			onSuccess () {
			  console.log('Upload completed!')
			  console.log("Download %s from %s", upload.file.name, upload.url)
			  upRef.filename = upload.file.name;
			  upRef.videoSize = `${(file.size / 1024 / 1024).toFixed(2)} MB`
			  //upRef.videoLength = `${file.duration} seconds`
			  
			  //send over data to 3speak creating video post
			  //upRef.updateVideoInfo()
			}
		  })
		  
			await upload.start()
			//this.generateThumbnail(upload.file)

		},
		
		async generateThumbnail (file) {
		  //
		  
		  //also grab duration
		  const probe = await ffmpeg.probe(file.name)
		  this.videoLength = probe.format.duration
		  
		  await ffmpeg.load()
		  if (! file){
			file = this.selFile;
		  }
		  const videoPath = file.name
		  const outputPath = `path/to/your/thumbnail/${file.name}.jpg`
		  const command = `-i ${videoPath} -vframes 1 -y ${outputPath}`
		  //alternatively try this approach: ffmpeg -i video.mp4 -y -vf fps=1/24 thumb%04d.jpg
		  const result = await ffmpeg.run(command)
		  //or try this
		  //  await ffmpeg.run('-i', 'flame.avi', '-i', 'flame.avi', '-filter_complex', 'hstack', 'flame.mp4');

		  console.log(result.stderr)
		  this.thumbnail = URL.createObjectURL(new Blob([result.stdout]))
		  
		  
		},
		
		async updateVideoInfo(){
			let videoInfo = {
			  'filename': this.filename,
			  'oFilename': this.origFilename,
			  'size': this.videoSize,
			  'duration': this.videoLength,
			  'thumbnail': this.thumbnail,
			  'owner': this.user.account.name,
			}
			
			let reqHeads = new Headers({
				'Content-Type': 'application/json',
				credentials: 'include',
			});
			
			console.log(videoInfo);

			let res = await fetch(process.env.threeSpeakUploadInfo, {
				method: 'POST',
				headers: reqHeads
			});
			console.log(res);
			let outcome = await res.json();
			console.log(outcome);

		},

		async connectSession3S(){
			try{
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
			}catch(exc){
				console.log(exc);
			}
	  },
	},
	async mounted () {
		await this.$store.dispatch('steemconnect/login')
		await this.connectSession3S();
		//console.log('tus');
		//console.log(tus);
		//this.ffmpeg = createFFmpeg({
        //    log: true,
        //})
        // Initialise loadFFmpeg
		//if (!crossOriginIsolated) SharedArrayBuffer = ArrayBuffer;
		/*ffmpeg = await createFFmpeg({
			//corePath: "/ffmpeg_core_dist/ffmpeg-core.js",
			corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
			//corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
            log: true,
        })
        await ffmpeg.load();*/
		//await this.$store.dispatch('steemconnect/refreshUser');
		//console.log('session 3S');
		//this.connectSession3S();
	}
}
</script>