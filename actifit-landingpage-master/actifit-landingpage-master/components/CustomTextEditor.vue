<template>
	<div class="mavonEditor acti-shadow">
		<client-only>

			<!-- :toolbars="markdownOption" -->
		  <mavon-editor language="en" 
						markdown-it-emoji="true" 
						v-model="content" 
						ref="editor"
						@imgAdd="mavonUpImg">
			<!-- Add a custom button after the left toolbar  -->
			  <template slot="left-toolbar-after">
				
				
				<emoji-picker :search="search">
				  <span slot="emoji-invoker" slot-scope="{ events: { click: clickEvent } }" @click.stop="clickEvent">
					<button
					  type="button"
					  class="op-icon far fa-smile"
					  aria-hidden="true"
					  title="Insert Emoji"
					></button>
				  </span>
				  <div slot="emoji-picker" slot-scope="{ emojis }"><!--, selectEmoji-->
					<div class="emoji-picker" :style="{ top: top + 'px', left: left + 'px'}"> <!-- top: display.y + 'px', left: display.x + 'px' } -->
					  <div class="emoji-picker__search">
						<input type="text" v-model="search" v-focus>
					  </div>
					  <div>
						<div v-for="(emojiGroup, category) in emojis" :key="category">
						  <h5>{{ category }}</h5>
						  <div class="emojis">
							<span
							  v-for="(emoji, emojiName) in emojiGroup"
							  :key="emojiName"
							  @click="selectEmoji(emoji)"
							  :title="emojiName"
							>{{ emoji }}</span>
						  </div>
						</div>
					  </div>
					</div>
				  </div>
				</emoji-picker>

				
				
			  </template>
		  </mavon-editor>
		</client-only>
	</div>
</template>
<script>
	import AWS from 'aws-sdk'
	import EmojiPicker from 'vue-emoji-picker'
	
	const actifit_host = 'https://usermedia.actifit.io/'
	const bucketName = 'actifit';
  
	AWS.config.update({ "accessKeyId": process.env.AWS_ACCESS_KEY_ID, "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY, "region":"us-east-1"});
	
	export default {
		components: {
			EmojiPicker
		},
		props: {
			initialContent: {
			  type: String,
			  default: () => ''
			}
		},
		  watch: { 
			initialContent: function(newVal, oldVal) { // watch it
			  this.content = newVal;
			}
		},
		data () {
		  return {
				//emoji picker data
				input: '',
				search: '',
				file: '', //image
				imgUploading: false, // loading animation while image upload in progress
				content: this.initialContent,
			}
		},
		directives: {
			focus: {
			  inserted(el) {
				el.focus()
			  },
			},
		},
		methods: {
			handlePaste(event){
				console.log(event);
				const clipboardData = event.clipboardData || window.clipboardData;
				const items = clipboardData.items;
				  
				for (let i = 0; i < items.length; i++) {
					if (items[i].type.indexOf('image') !== -1) {
					  const file = items[i].getAsFile();
					  //this.uploadImage(file);
					  this.uploadImage([file]);
					  break;//only allow one image upload
					}
				}
			},
			selectEmoji(emoji) {
			  /*this.emojisOutput = this.emojisOutput + emoji.native;
			  this.body += emoji.native*/
			  this.emojisOutput = this.emojisOutput + emoji;
			  this.content += emoji;
			  //setMessageToSend(messageToSend + emoji.native)
			},
			async mavonUpImg(pos, file){
			  let url = await this.uploadImage(pos, [file])
			  //$vm = this.$refs.md
			  //this.$refs.editor.$img2Url(pos, url);
			},
			async uploadImage (pos, file) {
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
			  
			  //let txt_editor = this.$refs.editor.simplemde; 
			  let txt_editor = this.$el.querySelector('textarea');
			  
			  //reference to this to be used inside the s3 response method
			  let main_container = this;
			  
			  s3.putObject(params).promise().then(function(data) {
				main_container.$refs.editor.$img2Url(pos, img_url);
			  });
				/*
				main_container.$notify({
				  group: err ? 'error' : 'success',
				  text: err ? main_container.$t('Img_Upload_Fail') : main_container.$t('Img_Upload_Success'),
				  position: 'top center'
				})*/
			}
		}
		
	}
		
</script>
<style>
.v-note-panel{
	min-height: 350px;
	max-height: 500px;
}
/* emoji picker styling */
/* Tailwind CSS-styled demo is available here: https://codepen.io/DCzajkowski/pen/Brxvzj */

.wrapper {
  position: relative;
  display: inline-block;
}

.regular-input {
  padding: 0.5rem 1rem;
  border-radius: 3px;
  border: 1px solid #ccc;
  width: 20rem;
  height: 12rem;
  outline: none;
}

.regular-input:focus {
  box-shadow: 0 0 0 3px rgba(66,153,225,.5);
}

.emoji-invoker {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  background: transparent;
  border: 0;
}
.emoji-invoker:hover {
  transform: scale(1.1);
}
.emoji-invoker > svg {
  fill: #b1c6d0;
}

.emoji-picker {
  position: absolute;
  z-index: 1;
  font-family: Montserrat;
  border: 1px solid #ccc;
  width: 15rem;
  height: 20rem;
  overflow: scroll;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 1px 1px 8px #c7dbe6;
}
.emoji-picker__search {
  display: flex;
}
.emoji-picker__search > input {
  flex: 1;
  border-radius: 10rem;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  outline: none;
}
.emoji-picker h5 {
  margin-bottom: 0;
  color: #b1b1b1;
  text-transform: uppercase;
  font-size: 0.8rem;
  cursor: default;
}
.emoji-picker .emojis {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.emoji-picker .emojis:after {
  content: "";
  flex: auto;
}
.emoji-picker .emojis span {
  padding: 0.2rem;
  cursor: pointer;
  border-radius: 5px;
}
.emoji-picker .emojis span:hover {
  background: #ececec;
  cursor: pointer;
}
.v-note-wrapper .v-note-op .v-left-item div:has(.op-icon.fa-smile){
	float: left;
}
</style>