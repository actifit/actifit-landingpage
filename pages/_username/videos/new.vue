<template>
  <div>
    <NavbarBrand />
    <div class="container pt-5 mt-5 pb-5">
      <div class="text-center font-weight">
        <ListHeadingSection :username="user ? user.account.name : ''" :textualDisplay="textualContent()"/>
      </div>

      <div class="vid-container" v-if="user">
        <div class="card post p-4 m-4 float-left" :class="smallScreenCheck" ref="mainCard">
          <div class="text-center font-weight-bold">{{ $t('new_video_placeholder') }}</div>

          <div>
            <!-- video upload section -->
            <input type="file" ref="fileInput" @change="uploadVideo" @click="setUploadEnvt()" :max-size="maxFileSize" />

            <!--<div v-if="selVid == newVid">Selected</div>-->
          </div>
          <div>
            <!-- video recording section -->
            <div class="text-center font-weight-bold">{{ $t('rec_video_placeholder') }}</div>
            <button @click="setRecordingEnvt()"
              class="btn btn-white border text-red acti-shadow mt-2 mb-2">{{ $t('rec_video') }}</button>
            <transition name="fade">
              <div v-if="userSelection == 'recording'">
                <video ref="recvideo" width="480" height="360" autoplay controls></video>
                <div v-if="recording">Recording: {{ timeLeft }} (s) Left</div>
                <div>
                  <button @click="startRecording" v-if="!recording"
                    class="btn btn-white border text-red acti-shadow mt-2">Start Recording</button>
                  <button @click="stopRecording" v-else class="btn btn-white border text-red acti-shadow mt-2">Stop
                    Recording</button>
                  <!--<button @click="playBack" v-if="!recording" class="btn btn-white border text-red acti-shadow mt-2">Play Back</button>-->
                  <button @click="uploadRecVideo" v-if="!recording"
                    class="btn btn-white border text-red acti-shadow mt-2">Upload Recording</button>
                  <!--<a v-if="recordedVideoUrl" :href="recordedVideoUrl" download="recorded-video.mp4" class="btn btn-white border text-red acti-shadow mt-2">Download Recording</a>-->
                </div>
              </div>
            </transition>
          </div>
          <div>
            <div v-if="vidprogress">{{ vidprogress }}</div>

            <div>
              <span v-if="videoLength">{{ videoLength.toFixed(2) }} sec | </span>
              <span v-if="videoSize">{{ (videoSize / 1024 / 1024).toFixed(2) }} MB</span>
            </div>

            <video ref="video" id="video" style="display:none">
            </video>
            <canvas ref="canvas" id="canvas" style="display: none" />
            <img v-if="thumbnail" id="thumb" :src="thumbnail" class="max-img" alt="Generated video thumbnail" />
            <div>
              <i class="fas fa-spin fa-spinner text-brand" v-if="processing"></i>
            </div>
            <button class="btn btn-white border text-red acti-shadow mt-2" @click="startVideoUpload"
              v-if="video && !processing && !newVidSubmitted">{{ $t('upload_video') }}</button>
            <button class="btn btn-white border text-red acti-shadow mt-2" @click="selectVid(newVid)"
              v-if="newVidSubmitted">Add to Post</button>
          </div>
        </div>
        <div class="card post p-4 m-4" :class="smallScreenCheck" v-for="video in userVidList" :key="video.permlink">
          <img v-if="video.thumbnail_url" :src="video.thumbnail_url" class="max-img" :alt="video.title || 'Video thumbnail'">
          <div class="vid-title">{{ video.title }}</div>
          <div v-if="video.duration">{{ video.duration.toFixed(2) }} sec</div>
          <div :title="video.created">{{ $getTimeDifference(video.created) }}</div>
          <div>{{ dispStatusWording(video) }} <i class="fas fa-solid fa-refresh text-brand" @click="getAllVideoStatuses()"
              :class="{ 'fa-spin': isRotating }"></i></div>
          <button class="btn btn-white border text-red acti-shadow" v-if="canAttachVideo(video)"
            @click="selectVid(video)">Add to Post</button>
          <a v-if="video.status == 'posted'" class="btn btn-white border text-red acti-shadow float-right"
            :href="'/@' + video.owner + '/' + video.permlink" target="_blank" rel="noopener noreferrer">View Post</a>
        </div>
      </div>
      <div class="vid-container" v-else>
        <button class="btn btn-white border text-red acti-shadow" @click="requestLogin">{{ $t('Login') }}</button>
      </div>


      <div class="row text-right" v-if="user">
        <div class="col-12 pb-2">
          <a :href="'/' + user.account.name + '/videos'" ref="my-videos" class="btn btn-brand border"
            :title="$t('view_videos')"><i class="fa-solid fa-video"></i></a>&nbsp;
          <a :href="'/' + user.account.name + '/blog'" class="btn btn-brand border" :title="$t('view_blog')"><i
              class="fa-solid fa-pen-to-square"></i></a>&nbsp;
          <a :href="'/' + user.account.name + '/comments'" class="btn btn-brand border" :title="$t('view_comments')"><i
              class="far fa-comments"></i></a>
        </div>
      </div>
      <div>
        <div class="form-group">
          <!--<input id="image-upload" type="file" v-on:change="uploadImage($event.target.files)" /> -->

          <label for="post-title" style="display: none">{{ $t('Title') }}</label>
          <input class="form-control form-control-lg acti-shadow" :placeholder="$t('Title')" id="post-title"
            v-model="title" />
        </div>
        <!-- show permalink if post is edit -->
        <div v-if="!editPost.isNewPost" class="form-group">
          <a id="post_permlnk"
            :href="'/' + editPost.author + '/' + editPost.permlink">{{ $t('actifit_web_url') }}/{{ editPost.author }}/{{ editPost.permlink }}</a>
        </div>
        <div class="form-group">
          <CustomTextEditor ref="editor" :initialContent="body"></CustomTextEditor>

        </div>
        <!-- preview description -> json_metadata.description (Google / social-card snippet) -->
        <div class="form-group">
          <label for="video-description" style="display: none">{{ $t('Short_preview_description') }}</label>
          <input class="form-control acti-shadow" id="video-description" v-model="description" maxlength="160"
            :placeholder="$t('Short_preview_description')" />
          <small class="form-text text-muted">{{ description.length }}/160 {{ $t('characters_used') }} — {{ $t('preview_description_help') }}</small>
        </div>
        <!--<div class="form-group">
			<label for="image-upload">{{ $t('Upload_Images') }}</label><br/>
			<input id="image-upload" type="file" v-on:change="uploadImage($event.target.files)" />
			<i class="fas fa-spin fa-spinner" v-if="imgUploading"></i>
		  </div>-->
        <div class="form-group">
          <!--<label for="post-tags" style="display: none">{{ $t('Tags') }}</label>
            <input class="form-control form-control-lg acti-shadow" :placeholder="$t('Tags')"/>-->
          <TagInput id="tagItem" ref="tagItem" :initialItems="tags" class="acti-shadow" />
        </div>

        <div class="form-group acti-shadow extra-container">
          <Beneficiary ref="beneficiaryList" :initialEntries="benef_list" :viewOnly="!editPost.isNewPost"
            class="float-left" :requiredEntries="benef_list.map(obj => obj.account)" :extraNote="$t('benefic_3s')"
            />

          <!-- also select community to post to -->
          <div class="form-group d-flex align-items-center p-1">
            <select id="targetCommunity" ref="targetCommunity" class="form-control targetCommunity">
              <option value="_blog_">--Select Community--</option>
              <option v-for="com in communitySubs" :value="com[0]" :key="com[0]">{{ com[1] }}</option>
            </select>
          </div>

          <div class="form-group d-flex align-items-center p-1" style="min-height: 70px;">
            <label for="paymentApproach" class="mr-2 label-payment">{{ $t('payment_approach') }}</label>
            <select id="paymentApproach" ref="paymentApproach" class="form-control paymentApproach">
              <option value="split">50/50 Split</option>
              <option value="hp">Full HP</option>
              <option value="decline">Decline</option>
            </select>
          </div>
        </div>

      </div>
      <div class="modal-footer m-2" style="display: none">
        <div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-if="cur_bchain == 'HIVE'">
          <input type="radio" id="hive" value="HIVE" v-model="target_bchain">
          <img src="/img/HIVE.png" style="max-height: 50px" v-on:click="target_bchain = 'HIVE'"
            :class="adjustHiveClass" alt="Select Hive blockchain">
          <label for="hive">HIVE ONLY</label>
        </div>
        <div class="bchain-option btn col-6 p-2 row text-left mx-auto" v-else-if="cur_bchain == 'STEEM'">
          <input type="radio" id="steem" value="STEEM" v-model="target_bchain">
          <img src="/img/STEEM.png" style="max-height: 50px" v-on:click="target_bchain = 'STEEM'"
            :class="adjustSteemClass" alt="Select Steem blockchain">
          <label for="steem">STEEM ONLY</label>
        </div>
        <div class="bchain-option btn col-6 p-2 row text-left  mx-auto">
          <input type="radio" id="hive_steem" value="BOTH" v-model="target_bchain">
          <img src="/img/HIVE.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px"
            :class="adjustBothClass" alt="Select multiple blockchains">
          <img src="/img/STEEM.png" v-on:click="target_bchain = 'BOTH'" style="max-height: 50px"
            :class="adjustBothClass" alt="Select multiple blockchains">
          <label for="hive_steem">HIVE + STEEM</label>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-white border text-red acti-shadow" :disabled="!selVidReadyForPublish()"
          @click.prevent="save()">
          <i class="fas fa-spin fa-spinner" v-if="loading"></i>
          <i class="fas fa-paper-plane" v-else></i>
          <span>{{ $t('Publish') }}</span>
          <!--<span v-if="editPost.isNewPost">{{ $t('Publish') }}</span><span v-else>{{ $t('Save') }}</span>-->
          <img src="/img/HIVE.png" style="max-height: 25px" v-if="target_bchain == 'HIVE' || target_bchain == 'BOTH'" alt="">
          <img src="/img/STEEM.png" style="max-height: 25px" v-if="target_bchain == 'STEEM' || target_bchain == 'BOTH'" alt="">
        </button>
      </div>
      <div class="modal-footer border-0 p-0">
        <div class="text-brand float-right" v-if="!selVidReadyForPublish()">{{ $t('sel_suitable_vid') }}</div>
      </div>
    </div>
    <Footer />
    <LoginModal v-if="showLoginModal" @close="handleLoginClosed" @login-successful="handleLoginSuccessful" />
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
import ListHeadingSection from '../../../components/ListHeadingSection.vue';
import LoginModal from '~/components/LoginModal';

//needed to fix incorrect duration when recording video
import fixWebmDuration from 'fix-webm-duration';

import axios from 'axios';
import * as tus from "tus-js-client";
import {
  STATUS_POSTED, VIDEO_BENEFICIARIES, canAttach, fetchVideoStatus, fromStatus, listUploads,
  requestUploadToken, videoMetadata, withVideoAtTop, withVideoBeneficiaries,
} from '~/utils/threeSpeakEmbed';

/* tus installation:
https://github.com/tus/tus-js-client/blob/2b86d4b01464e742483417270b1927a88c0bbfa6/docs/installation.md
*/

/* handles outside clicks for the picker */
/* begin */
import Vue from 'vue';

//for hiveauth
//import { Signature, hash, PublicKey, ec } from 'elliptic';


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
  head() {
    return {
      title: `New Video Post via Actifit`,
      meta: [
        { hid: 'description', name: 'description', content: `New Video post via Actifit` },
        { hid: 'ogdescription', property: 'og:description', content: `New Video post via Actifit` },
        { hid: 'ogtitle', property: 'og:title', content: 'New Video Post via Actifit' },
        { name: 'robots', content: 'noindex, nofollow' }
      ]
    }
  },
  components: {
    Footer,
    NavbarBrand,
    CustomTextEditor,
    TagInput,
    Beneficiary,
    ListHeadingSection,
    LoginModal
  },
  data() {
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
      title: '', // post title
      body: '', // post body
      tags: [], // post tags
      description: '', // post preview description -> json_metadata.description
      loading: false, // loading animation in submit button
      cur_bchain: 'HIVE', //bchain used to edit/save
      target_bchain: 'HIVE', //bchain to which edits will go
      //benef_list: [],
      percent_hbd: 10000,
      max_accepted_payout: '1000000.000 HBD',
      communitySubs: [],
      showLoginModal: false,
      editPost: {
        isNewPost: true,
      },
      video: null,
      videoSize: null,
      videoLength: null,
      videoReady: false,
      processing: false,
      vidprogress: null,
      thumbnail: null,
      userVidList: [],
      selVid: {},
      newVid: {},
      newVidSubmitted: false,
      userSelection: 'upload',
      uploadedHere: [], // permlinks this browser finished sending (3Speak's status can lag)
      benef_list: VIDEO_BENEFICIARIES.map(b => ({ ...b })),
      //comment_options: {},
    }
  },
  computed: {
    ...mapGetters(['bchain']),//'editPost',
    ...mapGetters('steemconnect', ['user']),
    ...mapGetters('steemconnect', ['stdLogin']),
    smallScreenCheck() {
      //use proper classes for neat display
      if (screen.width < 768) {
        return "";
      }
      return "w-25";
      //return "";
    },
    adjustHiveClass() {
      if (this.target_bchain != 'HIVE') {
        return 'option-opaque';
      }
      return '';
    },
    adjustSteemClass() {
      if (this.target_bchain != 'STEEM') {
        return 'option-opaque';
      }
      return '';
    },
    adjustBothClass() {
      if (this.target_bchain != 'BOTH') {
        return 'option-opaque';
      }
      return '';
    },

  },
  watch: {
    bchain: async function (newBchain) {
      //console.log('profile change in chain '+newBchain);
      this.cur_bchain = newBchain;
      await this.$store.dispatch('steemconnect/refreshUser');
      //this.reload += 1;
    },
    user(newUser) {
      if (!newUser) return;
      this.fetchCommunities();
      this.getAllVideoStatuses();
    },
    editPost() {
      //enforce new post till and if we implement full screen edit
      //this.editPost.isNewPost = true;
      console.log('editPost');
      console.log(this.editPost);
      // set initial values after edit button was clicked
      this.title = (this.editPost ? this.editPost.title : '')
      this.body = (this.editPost ? this.editPost.body : '')
      this.benef_list = (this.editPost ? this.editPost.beneficiaries : []);
      //console.log(this.benef_list);
      this.tags = [];
      this.description = '';
      if (this.editPost && !this.editPost.isNewPost) {
        const meta = this.$parseJsonMetadata(this.editPost.json_metadata)
        this.tags = meta && meta.hasOwnProperty('tags') ? meta.tags : [] // actifit as default tag, if no tags are present (for some reason)
        this.description = (meta && typeof meta.description === 'string' ? meta.description : '') // preload existing description as-is (string-only) — never truncate; other apps (e.g. Ecency) write >160 and edits must preserve it
        this.max_accepted_payout = this.editPost.max_accepted_payout;
        this.percent_hbd = this.editPost.percent_hbd;
      }
      //console.log('session 3S');
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
    requestLogin() {
      this.showLoginModal = true;
      this.$nextTick(() => {
        if (typeof $ !== 'undefined' && $.fn && typeof $.fn.modal === 'function') {
          $('#loginModal').modal('show');
        }
      });
    },
    handleLoginClosed() {
      this.showLoginModal = false;
    },
    handleLoginSuccessful() {
      this.showLoginModal = false;
    },

    textualContent(){
      return this.editPost.isNewPost
      ?this.$t('Create_new_vid')+'&nbsp<img src="/img/3speak.png" class="mr-2 token-logo-md" alt="">'
      :this.$t('Editing') + '<a :href="'/'' + this.editPost.author + '/' + this.editPost.permlink + '">' + this.title + '</a>';
    },
    dispStatusWording(video) {
      switch (video.status) {
        case 'uploading': return this.$t('vid_status_uploading');
        case 'processing': return this.$t('vid_status_processing').replace('_PCT_', Math.round(video.encodingProgress));
        case 'published': return this.$t('vid_status_ready');
        case 'failed': return this.$t('vid_status_failed');
        case 'deleted': return this.$t('vid_status_deleted');
        case 'missing': return this.$t('vid_status_missing');
        case STATUS_POSTED: return this.$t('vid_status_posted');
        default: return '';
      }
    },
    setUploadEnvt() {
      this.$nextTick(() => {
        if (screen.width >= 768) {
          this.$refs.mainCard.classList.add('w-25');
        }
        this.userSelection = 'upload';
      });
    },
    setRecordingEnvt() {
      this.$nextTick(() => {
        if (screen.width >= 768) {
          this.$refs.mainCard.classList.remove('w-25');
        }
        this.userSelection = 'recording';
      });
    },
    async startRecording() {
      try {
        console.log(this.recordedVideoUrl);
        if (this.recordedVideoUrl != null) {
          let userPrmpt = confirm(this.$t('existing_recording'));
          if (!userPrmpt) {
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
          blob = await fixWebmDuration(blob, duration, { logger: false });
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
      if (!this.recording) {
        this.$refs.recvideo.src = this.recordedVideoUrl;
      }
    },
    async uploadRecVideo(vid) {
      this.resetNewVidData();
      this.video = this.recordedVid;
      let file = this.video;
      this.videoSize = file.size;
      console.log(file.name)
      //await upload.start()
      this.generateThumbnail(this.recordedVideoUrl)//upload.file)

    },
    canAttachVideo(video) {
      return canAttach(video.status, this.uploadedHere.includes(video.permlink));
    },
    selVidReadyForPublish() {
      return !!(this.selVid && this.selVid.permlink) && this.canAttachVideo(this.selVid);
    },
    selectVid(video) {
      this.selVid = video;
      this.$refs['editor'].content = withVideoAtTop(this.$refs['editor'].content, video.owner, video.permlink,
        video.embed_url, video.thumbnail_url);
    },
    async uploadVideo(event) {



      this.resetNewVidData();
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > this.maxFileSize) {
        this.$notify({
          group: 'error',
          text: this.$t('file_too_large').replace('_MAXSIZE_', this.maxFileSize / 1000 / 1000 + ' MB '),
          position: 'top center'
        })
        event.target.value = null;
        return;
      }
      this.video = file;
      this.videoSize = file.size;
      this.generateThumbnail()

    },

    async fetchCommunities() {
      if (this.user) {
        this.communitySubs = await this.$store.dispatch('fetchUserCommunitySubs');
        console.log(this.communitySubs);
      }
    },
    async processTrxFunc(op_name, cstm_params, bchain_option, op2, params2) {
      if (!localStorage.getItem('std_login')) {
        //if (!this.stdLogin){
        // both operations: a video post without its comment_options would lose 3Speak's
        // mandatory beneficiaries
        const ops = [[op_name, cstm_params]];
        if (op2 && params2) ops.push([op2, params2]);
        try {
          let res = await this.$steemconnect.broadcast(ops);
          if (res.result.ref_block_num) {
            return { success: true, trx: res.result };
          }
        } catch (err) {
          console.log(err);
        }
        this.$notify({ group: 'error', text: this.$t('Save_Error'), position: 'top center' });
        return { success: false, trx: null };
      } else if (localStorage.getItem('acti_login_method') == 'hiveauth') {
        return new Promise((resolve) => {
          const auth = {
            username: this.user.account.name,
            token: localStorage.getItem('hiveauth_has_token'),//should be changed in V1 (current V0.8)
            expire: localStorage.getItem('expires'),
            key: localStorage.getItem('key')
          }

          let operation = [
            [op_name, cstm_params]
          ];
          if (op2 && params2) {
            operation.push([op2, params2])
          }

          this.$HAS.broadcast(auth, 'posting', operation, (evt) => {
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
              if (response.cmd && response.cmd === 'sign_ack') {
                resolve({ success: true, trx: response.data });
              } else if (response.cmd && response.cmd === 'sign_nack') {
                resolve({ success: false })
              }
            }) // transaction approved and successfully broadcasted
            .catch(err => {
              this.$notify({
                group: 'warn',
                clean: true
              })
              console.log(err);
              resolve({ success: false })
            })
        })
      } else {
        let operation = [
          [op_name, cstm_params]
        ];
        if (op2 && params2) {
          operation.push([op2, params2])
        }
        console.log('broadcasting');
        console.log(operation);

        //console.log(this.$steemconnect.accessToken);
        //console.log(this.$store.state.accessToken);
        //grab token
        let accToken = localStorage.getItem('access_token')

        let op_json = JSON.stringify(operation)

        let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');

        if (bchain_option) {
          cur_bchain = bchain_option;
        }

        // Signed IN THE BROWSER with the user's own key - /performTrx is gone.
        // Same response shape as before, so the handling below is unchanged.
        let outcome = await this.$broadcastWithKey(operation, { active: false, bchain: cur_bchain });
        console.log(outcome);
        if (outcome.error) {
          console.log(outcome.error);

          //if this is authority error, means needs to be logged out
          //example "missing required posting authority:Missing Posting Authority"
          let err_msg = outcome.trx.tx.error;
          if (err_msg.includes('missing') && err_msg.includes('authority') && this.cur_bchain == bchain_option) {
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
          return { success: false, trx: null };
          //this.$router.push('/login');
        } else {
          return { success: true, trx: outcome.trx };
        }
      }
    },
    commentSuccess(err, finalize, bchain, newPost) {
      let mainRef = this;
      let successMsg = mainRef.$t('Save_Success_Chain').replace('_CHAIN_', bchain);
      if (newPost) {
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
      if (finalize) {
        // stop loading animation and show notification
        this.loading = false
        if (newPost) {
          $(this.$refs.editPostModal).modal('hide')
        }
        const _rewardUser = this.editPost.author;
        const _rewardUrl = `https://actifit.io/@${this.editPost.author}/${this.editPost.permlink}`;
        setTimeout(() => this.RewardUserEdit(_rewardUser, _rewardUrl), 10000);
        // update post in store
        this.$store.dispatch('updatePost', {
          author: this.editPost.author,
          permlink: this.editPost.permlink
        })

      }
    },
    async save(vid) {
      if (!this.user || !this.user.account || !this.user.account.name) {
        this.requestLogin();
        return;
      }
      // Keychain session with no Keychain: say so, rather than ask for a typed key
      if (this.$keychainMissing && this.$keychainMissing()) return;
      if (!vid) vid = this.selVid;
      if (!vid || !vid.permlink || !canAttach(vid.status, this.uploadedHere.includes(vid.permlink))) {
        this.$notify({ group: 'error', text: this.$t('sel_suitable_vid'), position: 'top center' });
        return;
      }
      this.loading = true // start loading animation
      //only convert to array if not already array
      this.tags = this.$refs.tagItem.items;

      // the player stays in the post even if it was deleted from the text
      this.body = withVideoAtTop(this.$refs.editor.content, vid.owner, vid.permlink, vid.embed_url, vid.thumbnail_url);


      console.log(this.title);
      if (typeof this.title === "undefined" || this.title == '') {
        //post requires a title
        this.$notify({
          group: 'error',
          text: this.$t('post_requires_title'),
          position: 'top center'
        })
        this.loading = false
        return;
      }

      if (this.body == '') {
        //post requires a title
        this.$notify({
          group: 'error',
          text: this.$t('no_empty_post'),
          position: 'top center'
        })
        this.loading = false
        return;
      }

      if (!Array.isArray(this.tags) || this.tags.length < 1) {
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
      if (!Array.isArray(this.tags)) {
        if (this.tags.indexOf(',') !== -1) {
          //contains commas, treat accordingly
          this.tags = this.tags.split(',');
        } else {
          //rely on spaces instead
          this.tags = this.tags.split(' ');
        }
      }
      // prepare tags
      let meta = (!this.editPost.isNewPost && this.editPost.json_metadata ? this.$parseJsonMetadata(this.editPost.json_metadata) : {});
      meta.tags = [
        //'actifit',
        ...this.tags
          //.filter(tag => tag !== 'actifit') // remove actifit tag, its the first tag automatically
          .filter(String) // remove empty values
          .map(tag => tag.trim()) // trim leading and trailing whitespaces from tags
      ]

      //add community tag at the start if user selected one.
      /*targetCommunity*/
      if (this.$refs['targetCommunity'].value != '_blog_') {
        meta.tags.unshift(this.$refs['targetCommunity'].value)
      }
      console.log(meta.tags);
      //return;

      console.log(meta);
      if (this.editPost.isNewPost || meta.image === undefined) {
        meta.image = [];
      }

      //cleanup images to remove any ones which could have been removed
      for (let i = 0; i < meta.image.length; i++) {
        if (!this.body.includes(meta.image[i])) {
          //remove this element
          meta.image.splice(i, 1);
          i--;
        }
      }

      //fetch any new images to add them as proper thumbnails

      //matching our image markdown pattern
      const regex = /!\[(.*?)\]\((.*?)\)/g;

      let markdown_imgs = this.body.match(regex);

      if (markdown_imgs != null) {
        for (let mimgct = markdown_imgs.length - 1; mimgct >= 0; mimgct--) {
          //grab url only
          let img_src_url = markdown_imgs[mimgct].substring(markdown_imgs[mimgct].indexOf('(') + 1, markdown_imgs[mimgct].indexOf(')'));

          //append at the start if not already part of meta
          if (!meta.image.includes(img_src_url)) {
            meta.image.unshift(img_src_url);
          }
        }
      }

      //ensure that the app info is actifit specific, for example edited by a different editor
      if (!meta.app) {
        meta.app = 'actifit/0.5.0';
      }
      if (!meta.app.includes('actifit')) {
        meta.app = 'actifit/0.5.0';
      }
      meta.suppEdit = 'actifit.io';
      const desc = (this.description || '').trim()
      if (desc) meta.description = desc
      else delete meta.description // don't publish an empty description key

      //append post specific data for new posts
      if (this.editPost.isNewPost) {
        //let permlnk = this.title.replaceAll('.','-').replaceAll('  ',' ').replaceAll(' ','-').toLowerCase();
        //let permlnk = this.title.replaceAll('  ',' ').replaceAll(' ','-').replaceAll('--','-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();



        //console.log(permlnk);
        //return;
        //"actifit-"+this.user.account.name.replace('.','-')+"-"+new Date().toISOString().replace(/-|:|\./g, '').toLowerCase();
        this.editPost.parent_author = '';
        this.editPost.parent_permlink = meta.tags[0];
        this.editPost.author = this.user.account.name;
        // the post MUST use the video's permlink: that is how actifit-bot links it on 3Speak
        this.editPost.permlink = vid.permlink;

        await hive.api.setOptions({ url: process.env.hiveApiNode });
        let result = await hive.api.getContentAsync(this.user.account.name, this.editPost.permlink);
        if (result && result.author) {
          this.$notify({ group: 'error', text: this.$t('video_already_posted'), position: 'top center' });
          this.loading = false;
          return;
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
      if (this.$refs['paymentApproach'].value == 'decline') {
        payout_amnt = '0.000 HBD';
      } else if (this.$refs['paymentApproach'].value == 'hp') {
        percent_hbd = 0;
      }

      console.log(payout_amnt);
      console.log(percent_hbd);


      //video specific requirements


      const benef = withVideoBeneficiaries(this.benef_list);
      if (!benef) {
        this.$notify({
          group: 'error',
          text: this.$t('benefic_count_exceeded'),
          position: 'top center'
        })
        this.loading = false
        return;
      }

      //return;
      meta.video = videoMetadata({
        owner: vid.owner,
        permlink: vid.permlink,
        embed: vid.embed_url,
        title: this.title,
        duration: vid.duration,
        thumbnailUrl: vid.thumbnail_url,
      });

      let comment_options = {
        author: this.editPost.author,
        permlink: this.editPost.permlink,
        max_accepted_payout: payout_amnt,
        percent_hbd: percent_hbd,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions: [[0, { 'beneficiaries': benef }]]
      };


      //check if user selected a different report pay structure than 50-50 SBD/STEEM pay. Other option would be 100% SP
      //percent_hbd = 0;

      let cstm_params = {
        "author": this.editPost.author,
        "title": this.title,
        "body": this.body,
        "parent_author": this.editPost.parent_author,
        "parent_permlink": this.editPost.parent_permlink,
        "permlink": this.editPost.permlink,
        "json_metadata": JSON.stringify(meta)
      };

      // save changes
      let postSuccess = false;
      if (!localStorage.getItem('std_login')) {
        const res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain, 'comment_options', comment_options);
        if (res.success) {
          this.commentSuccess(null, true, this.cur_bchain, true);
        } else {
          this.loading = false;
        }
        return;
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        //console.log(comment_options);
        //this.$nuxt.refresh()
        let outc = await this.postKeychain(cstm_params, comment_options);
        console.log(outc)
        if (outc.success) {
          postSuccess = true;
        } else {
          this.loading = false;
          this.$notify({
            group: 'error',
            text: 'there was an error creating the video post',
            position: 'top center'
          })
        }
      } else {

        //console.log(cstm_params);

        //return;
        let res

        if (this.editPost.isNewPost) {

          res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain, 'comment_options', comment_options);
        } else {
          res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain);
        }
        if (res.success) {
          //this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
          postSuccess = true;
        } else {
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
      if (postSuccess) {
        this.$notify({
          group: 'success',
          text: this.$t('video_post_created'),
          position: 'top center'
        })
        this.loading = false;
        this.$refs['my-videos'].click();
      }
    },

    resetNewVidData() {
      this.videoLength = '';
      this.video = null;
      this.videoSize = null;
      this.videoLength = null;
      this.videoReady = false;
      this.processing = false;
      this.vidprogress = null;
      this.thumbnail = null;
      this.newVidSubmitted = false;
      if (this.activeUpload) this.activeUpload.abort();
      this.activeUpload = null;

      if (this.$refs.recVideo) {
        this.$refs.recVideo.src = '';
      }
      this.timeLeft = this.maxDuration;
    },

    // The user's uploads (our server's list) with 3Speak's public status for each.
    async getAllVideoStatuses() {
      if (!this.user) return;
      const session = localStorage.getItem('access_token');
      if (!session) return;
      this.isRotating = true;
      const owner = this.user.account.name;
      try {
        const rows = await listUploads(process.env.actiAppUrl, session);
        this.userVidList = await Promise.all(rows.map(async (row) => {
          const video = fromStatus(owner, row, await fetchVideoStatus(row.permlink));
          video.thumbnail_url = video.thumbnail_url || this.savedFrame(row.permlink);
          if (this.canAttachVideo(video) && await this.alreadyPosted(owner, row.permlink)) {
            video.status = STATUS_POSTED;
          }
          return video;
        }));
        const current = this.selVid && this.userVidList.find(v => v.permlink === this.selVid.permlink);
        if (current) this.selVid = current;
      } catch (err) {
        console.log(err);
        this.$notify({ group: 'error', text: err.message, position: 'top center' });
      }
      this.isRotating = false;
    },

    async alreadyPosted(owner, permlink) {
      try {
        await hive.api.setOptions({ url: process.env.hiveApiNode });
        const post = await hive.api.getContentAsync(owner, permlink);
        return !!(post && post.author);
      } catch (err) {
        return false; // the publish step checks again
      }
    },

    savedFrame(permlink) {
      try { return localStorage.getItem('3s_frame_' + permlink); } catch (e) { return null; }
    },

    generateThumbnail(vidUrl) {
      const video = this.$refs['video'];
      const canvas = this.$refs['canvas'];
      video.addEventListener('loadedmetadata', () => {
        // a recording can report an unknown (infinite) length
        const known = Number.isFinite(video.duration);
        video.currentTime = known ? video.duration * 0.25 : 0;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        this.videoLength = known ? video.duration : null;
      }, { once: true });
      video.addEventListener('seeked', () => {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        this.thumbnail = canvas.toDataURL('image/jpeg', 0.85);
      }, { once: true });
      video.src = vidUrl || window.URL.createObjectURL(this.video);
    },

    // One-time token from our server (the 3Speak key never reaches the browser), then the
    // file goes straight to 3Speak by TUS. After a failure, the same upload resumes.
    async startVideoUpload() {
      if (this.processing || !this.video) return;
      if (this.activeUpload) {
        this.processing = true;
        this.activeUpload.start();
        return;
      }
      const session = localStorage.getItem('access_token');
      if (!session) {
        this.requestLogin();
        return;
      }
      this.processing = true;
      let ticket;
      try {
        ticket = await requestUploadToken(process.env.actiAppUrl, session);
      } catch (err) {
        this.processing = false;
        this.$notify({ group: 'error', text: err.message, position: 'top center' });
        return;
      }
      const file = this.video;
      const metadata = { filename: file.name || 'video.mp4', filetype: file.type || 'video/mp4' };
      if (this.videoLength > 0) metadata.duration = String(Math.round(this.videoLength));
      const upload = new tus.Upload(file, {
        endpoint: ticket.upload_url,
        headers: { Authorization: 'Bearer ' + ticket.token },
        chunkSize: 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000],
        storeFingerprintForResuming: false,
        metadata,
        onError: (error) => {
          console.log('Video upload failed: ' + error);
          const status = error.originalResponse && error.originalResponse.getStatus();
          // the token was refused or has expired: the next try needs a new one
          if (status === 401 || status === 403) this.activeUpload = null;
          this.processing = false;
          this.$notify({ group: 'error', text: this.$t('video_upload_failed'), position: 'top center' });
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          this.vidprogress = 'Video Upload ' + (bytesUploaded / bytesTotal * 100).toFixed(2) + '%';
        },
        onSuccess: () => this.finishUpload(ticket, file),
      });
      this.activeUpload = upload;
      upload.start();
    },

    async finishUpload(ticket, file) {
      this.activeUpload = null;
      this.uploadedHere.push(ticket.permlink);
      const owner = this.user.account.name;
      const frame = await this.uploadFrame(ticket.permlink);
      this.newVid = fromStatus(owner, {
        permlink: ticket.permlink,
        embed_url: ticket.embed_url,
        created: new Date().toISOString(),
      }, {
        status: 'uploading',
        duration: this.videoLength,
        originalFilename: file.name,
        thumbnail_url: frame,
      });
      this.newVidSubmitted = true;
      this.processing = false;
      this.$notify({ group: 'success', text: this.$t('video_uploaded_add_to_post'), position: 'top center' });
      await this.getAllVideoStatuses();
    },

    // The frame becomes the post's cover. Best effort: the post works without one.
    async uploadFrame(permlink) {
      if (!this.thumbnail) return null;
      try {
        const key = (Date.now().toString(36) + Math.random().toString(36).slice(2, 13)
          + Math.random().toString(36).slice(2, 13)).toUpperCase();
        const blob = this.dataURItoBlob(this.thumbnail);
        const form = new FormData();
        form.append('image', new File([blob], key, { type: blob.type }));
        await axios.post('/api/proxy/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        const url = 'https://usermedia.actifit.io/' + key;
        try { localStorage.setItem('3s_frame_' + permlink, url); } catch (e) { /* storage blocked */ }
        return url;
      } catch (err) {
        console.log(err);
        return null;
      }
    },

    dataURItoBlob(dataURI) {
      const byteString = atob(dataURI.split(',')[1])
      const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    },

    async postKeychain(cstm_params, comment_options) {
      return new Promise((resolve, reject) => {
        console.log(JSON.stringify(comment_options));
        if (!this.editPost.isNewPost) {
          //cannot broadcast again if editing
          window.hive_keychain.requestBroadcast(this.editPost.author, [['comment', cstm_params]], 'Posting', (response) => {
            //console.log(response);
            if (response.success) {
              resolve({ success: true })
              //this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
            } else {
              resolve({ error: true })
              //this.commentSuccess(response.message, false, this.cur_bchain);
            }
          });
        } else {
          window.hive_keychain.requestBroadcast(this.editPost.author, [['comment', cstm_params], ['comment_options', comment_options]], 'Posting', (response) => {
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
            if (response.success) {
              resolve({ success: true })
              //this.commentSuccess(null, (this.target_bchain != 'BOTH'), this.cur_bchain, this.editPost.isNewPost);
            } else {
              resolve({ error: true })
              //this.commentSuccess(response.message, false, this.cur_bchain);
            }
          });
        }
      })
    },

    async RewardUserEdit(user, postUrl) {
      let url = new URL('/api/proxy/reward-edit', window.location.origin);
      if (!postUrl || !postUrl.startsWith('http')) {
        const raw = this.editPost && this.editPost.url;
        postUrl = (raw && raw.startsWith('http')) ? raw : `https://actifit.io/@${this.editPost.author}/${this.editPost.permlink}`;
      }
      if (!user) user = this.editPost.author;
      let params = {
        user,
        url: postUrl,
      }
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
      try {
        let res = await fetch(url, { headers: { 'x-acti-token': localStorage.getItem('access_token') || '' } });
        let outcome = await res.json();
        if (outcome.rewarded) {
          // notify the user that he received an additional reward
          this.$notify({
            group: 'success',
            text: this.$t('youve_been_rewarded') + outcome.amount + this.$t('reward_for_edit'),
            position: 'top center'
          })
        }
        console.log(outcome);
      } catch (err) {
        console.error(err);
      }
    },
  },
  async mounted() {
    console.log('edit screen mounted');
    this.cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
    this.$store.commit('setBchain', this.cur_bchain);
    await this.$store.dispatch('steemconnect/login')
    await this.getAllVideoStatuses();
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
  white-space: nowrap;
  /* prevent blocks from wrapping to the next line */
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

.max-img {
  max-width: 230px;
  max-height: 180px;
  width: auto;
  height: auto;
}

.inline-class {
  display: inline;
}

.label-payment {
  white-space: nowrap;
}

.extra-container {
  display: flex;
  justify-content: space-between;
}

.post-title {
  min-height: 60px;
}

.vid-title {
  overflow: hidden;
}

.card {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  overflow: hidden;
}

.card-green {
  box-shadow: 3px 3px 3px rgb(0 255 0 / 40%);
}

.post-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

input::file-selector-button {
  background: #fff;
  color: #ff112d !important;
  border: 1px solid #dee2e6 !important;
  border-radius: 5px;
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  margin: 10px;
  min-height: 40px;
}

input::file-selector-button:hover {
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
