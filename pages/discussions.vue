<template>
  <div>
    <!-- Sidebar with category checkboxes (for filtering) -->
    <div class="sidebar" v-if="!isMobile">
      <div class="sidebar-heading">Hive Microfeeds</div>
      <div class="category-filters-sidebar">
        <label
          v-for="cat in categories"
          :key="cat.value"
          class="category-checkbox-sidebar"
        >
          <input
            type="checkbox"
            :value="cat.value"
            v-model="selectedCategories"
          />
          <img
            v-if="categoryLogoMap[cat.value]"
            :src="categoryLogoMap[cat.value]"
            :alt="cat.label"
            class="category-logo-img"
          />
          {{ cat.label }}
        </label>
      </div>
    </div>

    <!-- Main content area -->
    <div class="main-content">
      <NavbarBrand />

      <div class="container pt-5 mt-5 pb-5">
        <ListHeadingSection :textualDisplay="'Hive Discussions'" />
        <div class="text-left mb-4 text-brand market-sub">
          Latest comments from PeakD Snaps, Inleo Threads, and Ecency Waves
        </div>

        <!-- SELF-CONTAINED EDITOR -->
        <div class="discussions-editor-wrap" v-if="!routeHasComment">
          <div class="discussions-editor-card">
            <div class="editor-header">
              <span class="editor-title">Discussions</span>
              <button class="editor-close" @click="resetEditor">X</button>
            </div>
            <div class="editor-actions">
              <label class="icon-btn">
                <input type="file" accept="image/*" @change="onImageSelected" hidden>
                <i class="fas fa-image action-icon" title="Add Image"></i>
              </label>
              <div class="category-select">
                <button
                  v-for="cat in postTargets"
                  :key="cat.value"
                  :class="['cat-btn', { selected: postTarget === cat.value }]"
                  @click="selectCategory(cat.value)"
                  :title="cat.label"
                >
                  <img :src="cat.icon" class="cat-icon" />
                </button>
              </div>
              <button class="post-btn" @click="postQuickUpdate" :disabled="!canPost || isPermlinkLoading || postingQuickUpdate">
                <span v-if="isPermlinkLoading">LOADING...</span>
                <span v-else-if="postingQuickUpdate">POSTING...</span>
                <span v-else>POST</span>
              </button>
            </div>
            <div v-if="imagePreviewUrl" class="editor-image-preview">
              <img :src="imagePreviewUrl" />
              <button class="editor-remove-img" @click="removeImage">X</button>
            </div>
            <textarea
              v-model="editorContent"
              class="editor-body-input"
              placeholder="Write your update..."
              rows="3"
              maxlength="500"
            ></textarea>
            <div v-if="quickUpdateError" class="reply-error mt-2">{{ quickUpdateError }}</div>
          </div>
        </div>
        <!-- End Editor -->


        <!-- Single Comment View -->
        <div v-if="routeHasComment" class="container pt-3 pb-5">
          <div v-if="loadingSingleComment" class="loading">Loading comment...</div>
          <div v-else-if="singleComment">
            <div class="card report mb-4">
              <h6 class="mb-0 text-center report-title">
                {{ truncateString(stripMarkdown(singleComment.title || singleComment.body), 60) }}
              </h6>
              <div class="report-body">
                <div class="row pb-1">
                  <div class="col-8">
                    <UserHoverCard :username="singleComment.author" />
                  </div>
                  <div class="col-4 text-right position-relative">
                    <span>
                      <TimeAgo :timestamp="singleComment.created" />
                    </span>
                    <span class="category-logo-topright">
                      <img
                        v-if="categoryLogoMap[singleComment.category]"
                        :src="categoryLogoMap[singleComment.category]"
                        :alt="singleComment.categoryLabel"
                        class="category-logo-inline"
                      />
                    </span>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12">
                    <vue-remarkable class="comment-body" :source="singleComment.body.trim()" />
                  </div>
                </div>
                <div class="row details mt-2">
                  <div class="col-6">
                    <a
                      href="#"
                      @click.prevent="votePrompt(singleComment)"
                      :class="['upvote-btn', { 'voted': isLikedByCurrentUser(singleComment) }]"
                      :title="isLikedByCurrentUser(singleComment) ? 'Already liked' : 'Votes'"
                      :style="{ pointerEvents: isLikedByCurrentUser(singleComment) ? 'none' : 'auto' }"
                    >
                      <i class="far fa-thumbs-up"></i> {{ getUpvoteCount(singleComment) }}
                    </a>
                    <i class="far fa-comments ml-2"></i> {{ singleComment.children || 0 }}
                    <a href="#" @click.prevent="toggleRootReplyBox" :title="'Reply'">
                      <i class="fas fa-reply text-brand ml-2"></i>
                    </a>
                  </div>
                </div>
                <transition name="fade">
                  <div class="reply-box mb-4" v-if="showRootReplyBox">
                    <CustomTextEditor v-if="isLoggedIn" ref="rootEditor" :initialContent="replyBody" />
                    <div class="reply-actions">
                      <button
                        class="reply-btn"
                        :disabled="postingReply"
                        @click="postRootReply"
                      >
                        {{ postingReply ? 'Posting...' : 'Reply' }}
                      </button>
                      <button class="reply-btn" @click="toggleRootReplyBox">Cancel</button>
                      <span v-if="!isLoggedIn" class="reply-error">You must be logged in to reply.</span>
                      <span v-if="replyError" class="reply-error">{{ replyError }}</span>
                      <span v-if="replySuccess" class="reply-success">Reply posted!</span>
                    </div>
                  </div>
                </transition>
                <div class="comment-reply" v-if="rootResponsePosted">
                  <UserHoverCard :username="currentUsername" />
                  <vue-remarkable class="modal-body" :source="rootResponseBody" />
                </div>
              </div>
            </div>
            <div>
              <h5>Replies</h5>
              <div v-if="loadingReplies" class="loading">Loading replies...</div>
              <div v-else>
                <Comments
                  v-if="organizedReplies.length > 0"
                  :author="singleComment.author"
                  :body="singleComment.body"
                  :full_data="singleComment"
                  :reply_entries="organizedReplies"
                  :main_post_author="singleComment.author"
                  :main_post_permlink="singleComment.permlink"
                  :main_post_cat="singleComment.category"
                  :depth="0"
                  :translationCache="translationCache"
                  @update-translation-cache="handleTranslationCacheUpdate"
                  @refresh-root="fetchSingleComment"
                />
                <div v-else class="text-muted">No replies yet.</div>
              </div>
            </div>
          </div>
        </div>
        <!-- END Single Comment View -->

        <!-- Discussions List -->
        <div v-else>
          <div v-if="loading" class="loading">Loading comments...</div>
          <div v-else>
            <div class="row">
              <div
                v-for="comment in filteredCommentsSorted"
                :key="comment.id"
                class="col-12 mb-4"
              >
                <div class="card report">
                  <h6 class="mb-0 text-center report-title" style="cursor:pointer;">
                    <a
                      @click.prevent="goToSingleComment(comment)"
                      style="color:#fff; cursor:pointer;"
                      href="#"
                    >
                      {{ truncateString(stripMarkdown(comment.title || comment.body), 60) }}
                      <i class="fas fa-external-link-alt"></i>
                    </a>
                  </h6>
                  <div class="report-body">
                    <div class="row pb-1">
                      <div class="col-8">
                        <UserHoverCard :username="comment.author" />
                      </div>
                      <div class="col-4 text-right position-relative">
                        <span>
                          <TimeAgo :timestamp="comment.created" />
                        </span>
                        <span class="category-logo-topright">
                          <img
                            v-if="categoryLogoMap[comment.category]"
                            :src="categoryLogoMap[comment.category]"
                            :alt="comment.categoryLabel"
                            class="category-logo-inline"
                          />
                        </span>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-12">
                        <vue-remarkable class="comment-body" :source="comment.body.trim()" />
                      </div>
                    </div>
                    <div class="row details mt-2">
                      <div class="col-6">
                        <a
                          href="#"
                          @click.prevent="votePrompt(comment)"
                          :class="['upvote-btn', { 'voted': isLikedByCurrentUser(comment) }]"
                          :title="isLikedByCurrentUser(comment) ? 'Already liked' : 'Votes'"
                          :style="{ pointerEvents: isLikedByCurrentUser(comment) ? 'none' : 'auto' }"
                        >
                          <i class="far fa-thumbs-up"></i> {{ getUpvoteCount(comment) }}
                        </a>
                        <a
                          href="#"
                          @click.prevent="goToSingleComment(comment)"
                          :title="'View full thread'"
                          class="comment-btn-link"
                        >
                          <i class="far fa-comments ml-2"></i> {{ comment.children || 0 }}
                        </a>
                        <i
                          class="far fa-share-square ml-2"
                          @click.prevent="handleReblog(comment)"
                          :title="'Reblog/Share'"
                          style="cursor:pointer;"
                        ></i>
                      </div>
                      <div class="col-6 text-right">
                        <a
                          :href="commentUrl(comment)"
                          target="_blank"
                          class="text-brand pr-2"
                          :title="'View on Hive'"
                        >
                          <i class="fas fa-book-open"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="filteredCommentsSorted.length < allCommentsCount" class="load-more-container">
              <button class="load-more-btn" @click="commentsToShow += 10">
                Load More
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Login Modal -->
      <div v-if="showLoginPopup" class="login-popup">
        <div class="login-popup-content">
          <span class="login-popup-title">Login Required</span>
          <span class="login-popup-message">
            You need to be logged in to like or share a comment.<br>
            Please log in to continue.
          </span>
          <button class="login-popup-close" @click="showLoginPopup = false">Close</button>
        </div>
      </div>

      <!-- Voting Modal -->
      <VoteModal @vote-success="onVoteSuccess" />

      <!-- Notifications -->
      <client-only>
        <div>
          <notifications :group="'success'" :position="'top center'" :classes="'vue-notification success'" />
          <notifications :group="'warn'" :position="'top center'" :classes="'vue-notification warn'" />
          <notifications :group="'error'" :position="'top center'" :classes="'vue-notification error'" />
        </div>
      </client-only>

      <Footer />
    </div>
  </div>
</template>

<script>
import NavbarBrand from '~/components/NavbarBrand'
import Footer from '~/components/Footer'
import ListHeadingSection from '~/components/ListHeadingSection'
import UserHoverCard from '~/components/UserHoverCard.vue'
import TimeAgo from '~/components/TimeAgo.vue'
import VoteModal from '~/components/VoteModal.vue'
import Comments from '~/components/Comments.vue'
import CustomTextEditor from '~/components/CustomTextEditor.vue' // Still needed for replies
import vueRemarkable from 'vue-remarkable'
import { mapGetters } from 'vuex'
import hive from '@hiveio/hive-js'
import axios from "axios";

export default {
  name: 'DiscussionsPage',
  components: {
    NavbarBrand,
    Footer,
    ListHeadingSection,
    UserHoverCard,
    TimeAgo,
    VoteModal,
    Comments,
    CustomTextEditor,
    vueRemarkable
  },
  data() {
    return {
      categories: [
        { value: 'peak.snaps', label: 'PeakD Snaps' },
        { value: 'leothreads', label: 'Inleo Threads' },
        { value: 'ecency.waves', label: 'Ecency Waves' }
      ],
      loading: false,
      postTargets: [
        { value: 'peak.snaps', label: 'PeakD Snaps', icon: '/img/PeakDLogo.png' },
        { value: 'ecency.waves', label: 'Ecency Waves', icon: '/img/EcencyWavesLogo.png' }
      ],
      selectedCategories: [],
      allComments: [],
      commentsToShow: 10,
      currentUser: null,
      showLoginPopup: false,
      voting: {},
      categoryLogoMap: {
        'peak.snaps': '/img/PeakDLogo.png',
        'leothreads': '/img/InleoThreadsLogo.jpg',
        'ecency.waves': '/img/EcencyWavesLogo.png'
      },
      editorContent: '',
      postTarget: '',
      postingQuickUpdate: false,
      quickUpdateError: '',
      selectedImageFile: null,
      imagePreviewUrl: '',
      singleComment: null,
      singleCommentReplies: [],
      loadingSingleComment: false,
      loadingReplies: false,
      translationCache: {},
      showRootReplyBox: false,
      replyBody: '',
      postingReply: false,
      replyError: '',
      replySuccess: false,
      rootResponsePosted: false,
      rootResponseBody: '',
      isMobile: false,
      latestContainerPermlinks: {},
      isPermlinkLoading: true,
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    filteredCommentsSorted() {
      let comments = this.allComments;
      if (this.selectedCategories.length > 0) {
        comments = comments.filter(c => this.selectedCategories.includes(c.category));
      }
      comments = comments.sort((a, b) => new Date(b.created) - new Date(a.created));
      return comments.slice(0, this.commentsToShow);
    },
    allCommentsCount() {
      let comments = this.allComments;
      if (this.selectedCategories.length > 0) {
        comments = comments.filter(c => this.selectedCategories.includes(c.category));
      }
      return comments.length;
    },
    routeHasComment() {
      return (
        this.$route &&
        this.$route.query &&
        this.$route.query.author &&
        this.$route.query.permlink
      );
    },
    isLoggedIn() {
      return !!(this.currentUser || (this.user && this.user.account && this.user.account.name));
    },
    currentUsername() {
      return this.currentUser || (this.user && this.user.account && this.user.account.name);
    },
    organizedReplies() {
      if (!this.singleCommentReplies || !this.singleComment) return [];
      const map = {};
      const roots = [];
      this.singleCommentReplies.forEach(reply => {
        reply.reply_entries = [];
        map[`${reply.author}/${reply.permlink}`] = reply;
      });
      this.singleCommentReplies.forEach(reply => {
        if (reply.parent_author === this.singleComment.author && reply.parent_permlink === this.singleComment.permlink) {
          roots.push(reply);
        } else {
          const parentKey = `${reply.parent_author}/${reply.parent_permlink}`;
          if (map[parentKey]) {
            map[parentKey].reply_entries.push(reply);
          }
        }
      });
      return roots;
    },
    canPost() {
      const hasContent = this.editorContent.trim().length > 0 || this.selectedImageFile;
      return (
        hasContent &&
        this.postTarget &&
        this.isLoggedIn
      );
    },
  },
  watch: {
    '$route.query': {
      handler() {
        if (this.routeHasComment) {
          this.fetchSingleComment();
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    stripMarkdown(str) {
      if (!str) return '';
      str = str.replace(/!\[.*?\]\(.*?\)/g, '');
      str = str.replace(/[#*_`]/g, '');
      return str.trim();
    },
    async fetchLatestContainerPermlinks() {
      this.isPermlinkLoading = true;
      try {
        const permlinks = {};
        for (const target of this.postTargets) {
          const author = target.value;
          const latestPosts = await new Promise((resolve, reject) => {
            hive.api.getDiscussionsByBlog({ tag: author, limit: 1 }, (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });
          if (latestPosts && latestPosts.length > 0) {
            permlinks[author] = latestPosts[0].permlink;
          } else {
            console.warn(`Could not find a container post for ${author}.`);
          }
        }
        this.latestContainerPermlinks = permlinks;
      } catch (error) {
        console.error('Failed to fetch container permlinks:', error);
        this.quickUpdateError = 'Could not load posting data. Please refresh.';
      } finally {
        this.isPermlinkLoading = false;
      }
    },
    makeCommentImagesClickable() {
      this.$nextTick(() => {
        document.querySelectorAll('.comment-body img').forEach(img => {
            if (!img.closest('a')) {
              const link = document.createElement('a');
              link.href = img.src;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              img.parentNode.insertBefore(link, img);
              link.appendChild(img);
            }
          });
      });
    },
    selectCategory(cat) {
      this.postTarget = cat;
    },
    onImageSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.selectedImageFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file);
    },
    removeImage() {
      this.selectedImageFile = null;
      this.imagePreviewUrl = '';
    },
    async uploadImage() {
      if (!this.selectedImageFile) return '';
      
      this.quickUpdateError = '';

      // Create a new, clean Axios instance to bypass global interceptors.
      const uploadAxios = axios.create();

      const key = (Date.now().toString(36) + Math.random().toString(36).substr(2, 11) + Math.random().toString(36).substr(2, 11)).toUpperCase();
      const renamedFile = new File([this.selectedImageFile], key, { type: this.selectedImageFile.type });
      const formData = new FormData();
      formData.append('image', renamedFile);

      try {
        await uploadAxios.post('https://usermedia.actifit.io/upload', formData, {
          headers: {
            'Authorization': process.env.sec_img_upl,
            'Content-Type': 'multipart/form-data'
          }
        });
        return 'https://usermedia.actifit.io/' + key;
      } catch (error) {
        console.error('Image Upload Error:', error);
        if (error.response && error.response.data) {
          throw new Error('Image upload failed: ' + error.response.data);
        }
        throw new Error('Image upload failed. Please try again.');
      }
    },
    resetEditor() {
      this.editorContent = '';
      this.postTarget = '';
      this.quickUpdateError = '';
      this.removeImage();
    },
    async postQuickUpdate() {
      this.quickUpdateError = '';
      let body = this.editorContent.trim();

      if (!this.isLoggedIn) { this.quickUpdateError = 'You must be logged in to post.'; return; }
      if (!body && !this.selectedImageFile) { this.quickUpdateError = 'Post cannot be empty.'; return; }
      
      const parent_author = this.postTarget;
      const parent_permlink = this.latestContainerPermlinks[parent_author];

      if (!parent_permlink) { this.quickUpdateError = `Error: Could not find a container post for ${parent_author}.`; return; }

      this.postingQuickUpdate = true;

      try {
        if (this.selectedImageFile) {
          const imageUrl = await this.uploadImage();
          body += `\n\n![image](${imageUrl})\n`;
        }
        
        const username = this.currentUsername;
        const permlink = `re-${username.replace(/\./g, '-')}-${new Date().toISOString().replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
        const meta = { tags: [this.postTarget], app: 'actifit/0.5.0', format: 'markdown' };
        const cstm_params = { author: username, title: "", body, parent_author, parent_permlink, permlink, json_metadata: JSON.stringify(meta) };
        const res = await this.processTrxFunc('comment', cstm_params, 'HIVE');
        
        const errorMessage = res && res.trx && res.trx.tx && res.trx.tx.error;

        if (res && res.success) {
          this.$notify({ group: 'success', title: 'Success', text: 'Discussion posted!' });
          this.resetEditor();
          setTimeout(() => this.fetchAllComments(), 3000);
        } else {
          this.quickUpdateError = 'Error: ' + (errorMessage || 'Failed to post update.');
        }
      } catch (e) {
        this.quickUpdateError = e.message || 'An unknown error occurred.';
      } finally {
        this.postingQuickUpdate = false;
      }
    },
    async processTrxFunc(op_name, cstm_params, bchain_option, op_name2, cstm_params2) {
      let operation = [[op_name, cstm_params]];
      if (op_name2 && cstm_params2) operation.push([op_name2, cstm_params2]);

      const accToken = localStorage.getItem('access_token');
      const url = new URL(`${process.env.actiAppUrl}performTrxPost/?user=${this.user.account.name}&bchain=${bchain_option || 'HIVE'}`);
      
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-acti-token': `Bearer ${accToken}` },
          body: JSON.stringify({ 'operation': JSON.stringify(operation) })
        });
        const outcome = await res.json();
        return { success: !outcome.error, trx: outcome.trx || null };
      } catch (error) {
        console.error('Fetch failed in processTrxFunc:', error);
        return { success: false, trx: null };
      }
    },
    goToSingleComment(comment) {
      this.$router.push({ path: this.$route.path, query: { author: comment.author, permlink: comment.permlink } });
    },
    async fetchSingleComment() {
      this.loadingSingleComment = true;
      this.loadingReplies = true;
      const { author, permlink } = this.$route.query;
      try {
        this.singleComment = await new Promise((resolve, reject) => hive.api.getContent(author, permlink, (err, result) => err ? reject(err) : resolve(result)));
        this.singleCommentReplies = await new Promise((resolve, reject) => hive.api.getContentReplies(author, permlink, (err, result) => err ? reject(err) : resolve(result)));
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingSingleComment = false;
        this.loadingReplies = false;
      }
    },
    truncateString(str, len = 60) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len - 3) + '...' : str;
    },
    commentUrl(comment) {
      return `https://hive.blog/@${comment.parentAuthor}/${comment.parentPermlink}#@${comment.author}/${comment.permlink}`;
    },
    handleReblog(comment) {
      if (!this.currentUsername) { this.showLoginPopup = true; return; }
      this.$reblog(this.user, comment);
    },
    getUpvoteCount(comment) {
      return comment.active_votes ? comment.active_votes.filter(v => v.percent > 0).length : 0;
    },
    isLikedByCurrentUser(comment) {
      const username = this.currentUsername;
      if (!username || !comment.active_votes) return false;
      return comment.active_votes.some(v => v.voter && v.voter.toLowerCase() === username.toLowerCase() && v.percent > 0);
    },
    votePrompt(comment) {
      if (!this.currentUsername) { this.showLoginPopup = true; return; }
      this.$store.commit('setPostToVote', comment);
      if (window.$) {
        window.$('#voteModal').modal('show');
      }
    },
    onVoteSuccess(voted) {
      if (!voted) return;
      const updateVotes = (item) => {
        if (item && item.author === voted.author && item.permlink === voted.permlink) {
          if (!item.active_votes) this.$set(item, 'active_votes', []);
          if (!this.isLikedByCurrentUser(item)) {
            item.active_votes.push({ voter: this.currentUsername, percent: 10000 });
          }
        }
      };
      this.allComments.forEach(updateVotes);
      updateVotes(this.singleComment);
    },
    async fetchAllComments() {
      this.loading = true;
      let allComments = [];
      for (const cat of this.categories) {
        try {
          const posts = await new Promise((resolve, reject) => hive.api.getDiscussionsByAuthorBeforeDate(cat.value, '', new Date().toISOString().slice(0, 19), 5, (err, res) => err ? reject(err) : resolve(res)));
          for (const post of posts) {
            const comments = await new Promise((resolve, reject) => hive.api.getContentReplies(post.author, post.permlink, (err, res) => err ? reject(err) : resolve(res)));
            allComments.push(...comments.filter(c => c.body && c.body.trim().length > 0).map(c => ({...c, id: `${c.author}-${c.permlink}`, category: cat.value, categoryLabel: cat.label, parentAuthor: post.author, parentPermlink: post.permlink })));
          }
        } catch(e) { console.error(e) }
      }
      this.allComments = allComments;
      this.loading = false;
    },
    toggleRootReplyBox() {
      this.showRootReplyBox = !this.showRootReplyBox;
      if (!this.showRootReplyBox) {
        this.replyBody = '';
        this.replyError = '';
        this.replySuccess = false;
      }
    },
    async postRootReply() {
      this.replyError = '';
      this.replySuccess = false;
      if (!this.isLoggedIn) { this.replyError = 'You must be logged in to reply.'; return; }
      
      const body = this.$refs.rootEditor ? this.$refs.rootEditor.content : '';
      if (!body.trim()) { this.replyError = 'Reply cannot be empty.'; return; }

      this.postingReply = true;
      try {
        const { author: parent_author, permlink: parent_permlink } = this.singleComment;
        const permlink = `${this.currentUsername.replace(/\./g, '-')}-re-${parent_author.replace(/\./g, '-')}-${parent_permlink}-${new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()}`;
        const meta = { tags: ['hive-193552', 'actifit'], app: 'actifit/0.5.0', suppEdit: 'actifit.io.comment' };
        const cstm_params = { author: this.currentUsername, title: "", body: body, parent_author, parent_permlink, permlink, json_metadata: JSON.stringify(meta) };
        const res = await this.processTrxFunc('comment', cstm_params, 'HIVE');
        this.onRootReplyResult(res.success ? null : 'Error posting reply', res.success, 'HIVE', body);
      } catch (e) {
        this.replyError = 'Failed to post reply.';
      } finally {
        this.postingReply = false;
      }
    },
    onRootReplyResult(err, finalize, bchain, body) {
      if (err) {
        this.replyError = (err && err.message) ? err.message : 'Error posting reply';
        this.replySuccess = false;
      } else {
        this.replySuccess = true;
        this.replyError = '';
        this.rootResponsePosted = true;
        this.rootResponseBody = body;
        this.replyBody = '';
        this.showRootReplyBox = false;

        let pollCount = 0;
        const pollReplies = async () => {
          pollCount++;
          const initialReplyCount = (this.singleCommentReplies && this.singleCommentReplies.length) || 0;
          await this.fetchSingleComment();
          const newReplyCount = (this.singleCommentReplies && this.singleCommentReplies.length) || 0;

          if (newReplyCount > initialReplyCount || pollCount >= 10) {
            this.rootResponsePosted = false;
            this.replySuccess = false;
          } else {
            setTimeout(pollReplies, 1500);
          }
        };
        setTimeout(pollReplies, 1500);
      }
    },
    handleTranslationCacheUpdate(payload) {
      this.$set(this.translationCache, payload.id, payload.data);
    },
    detectMobile() {
      const check = () => this.isMobile = window.innerWidth < 768;
      check();
      window.addEventListener('resize', check);
      this.$once('hook:beforeDestroy', () => window.removeEventListener('resize', check));
    }
  },
  async mounted() {
    this.detectMobile();
    await this.fetchAllComments();
    await this.fetchLatestContainerPermlinks();
    this.makeCommentImagesClickable();
  }
}
</script>

<style>
/* All your existing styles are unchanged... */
.sidebar {
  position: fixed;
  top: 88px; /* adjust according to your Navbar height */
  left: 0;
  width: 220px;
  min-width: 180px;
  max-width: 260px;
  background: #fff6f7;
  border-right: 1px solid #eee;
  padding: 24px 16px 0 16px;
  min-height: calc(100vh - 88px); /* full height minus navbar */
  z-index: 10;
}
.sidebar-heading {
  font-size: 1.18rem;
  font-weight: bold;
  margin-bottom: 22px;
  color: #ff112d;
}
.category-filters-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.category-checkbox-sidebar {
  font-weight: 600;
  color: #ff112d;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.category-checkbox-sidebar input[type="checkbox"] {
  accent-color: #ff112d;
  width: 18px;
  height: 18px;
}
.category-logo-img {
  height: 28px;
  width: 28px;
  object-fit: contain;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #eee;
  margin-left: 8px;
  vertical-align: middle;
}
.main-content {
  margin-left: 220px;
  min-width: 0;
}
.market-sub {
  font-style: italic;
}
.category-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.category-checkbox {
  font-weight: 600;
  color: red;
  display: flex;
  align-items: center;
  gap: 6px;
}
.category-checkbox input[type="radio"] {
  accent-color: red;
  width: 18px;
  height: 18px;
}
.card.report {
  box-shadow: 3px 3px 3px rgb(255 0 0 / 40%);
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #fff;
  padding: 18px 20px;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}
.report-title {
  background: #ff112d;
  padding: 10px 14px;
  min-height: 44px;
  font-size: 1.08rem;
}
.report-title a {
  color: #fff !important;
}
.report-body {
  padding: 10px 14px;
  font-size: 1.02rem;
}
.details {
  line-height: 1.15rem;
  font-size: 1rem;
}
.report-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 6px;
}
.comment-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.upvote-btn {
  color: #222;
  transition: color 0.2s;
  font-weight: bold;
}
.upvote-btn.voted {
  color: #ff112d !important;
}
.upvote-btn:active {
  color: #ff112d;
}
.comment-btn-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
}
.comment-btn-link:hover {
  color: #ff112d;
  text-decoration: underline;
}
.login-popup {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
}
.login-popup-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  min-width: 320px;
  text-align: center;
  position: relative;
}
.login-popup-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ff112d;
  margin-bottom: 12px;
  display: block;
}
.login-popup-message {
  font-size: 1.05rem;
  color: #333;
  margin-bottom: 22px;
  display: block;
}
.login-popup-close {
  background: linear-gradient(90deg, #ff112d, orange);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.login-popup-close:hover {
  background: linear-gradient(90deg, orange, #ff112d);
}
.loading {
  text-align: center;
  padding: 50px 0;
  font-size: 1.2rem;
  color: var(--muted);
}
.load-more-container {
  text-align: center;
  margin: 20px 0;
}
.load-more-btn {
  background: orange;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.load-more-btn:hover {
  background: #c8001e;
}
.reply-box {
  background: #fff6f7;
  border-radius: 10px;
  padding: 18px 18px 12px 18px;
  margin: 28px 0 18px 0;
  box-shadow: 0 2px 8px rgba(255,17,45,0.06);
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}
.reply-textarea {
  width: 100%;
  border: 1px solid #ff112d;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 1.05rem;
  resize: vertical;
  background: #fff;
  color: #222;
  margin-bottom: 8px;
  outline: none;
  transition: border 0.18s;
}
.reply-textarea:focus {
  border-color: orange;
}
.reply-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.reply-btn {
  background: linear-gradient(90deg, #ff112d, orange);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.reply-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.reply-error {
  color: #ff112d;
  font-size: 0.98rem;
}
.reply-success {
  color: #1bbf1b;
  font-size: 0.98rem;
}
.quick-update-box {
  padding: 18px 20px;
  margin-bottom: 28px;
  background: #fff6f7;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(255,17,45,0.06);
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}
.quick-update-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}
.quick-update-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
}
.quick-update-avatar-placeholder {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #eee;
  display: inline-block;
}
.quick-update-radios {
  display: flex;
  align-items: center;
  gap: 12px;
}
.quick-update-textarea {
  width: 100%;
  border: 1px solid #ff112d;
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 1.05rem;
  resize: vertical;
  background: #fff;
  color: #222;
  margin-bottom: 8px;
  outline: none;
  transition: border 0.18s;
}
.quick-update-textarea:focus {
  border-color: orange;
}
.quick-update-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.quick-update-upload-btn {
  background: none;
  border: none;
  color: #ff112d;
  font-weight: 600;
  cursor: pointer;
  font-size: 1.05rem;
  display: flex;
  align-items: center;
  gap: 6px;
}
.quick-update-image-preview {
  position: relative;
  display: inline-block;
}
.quick-update-image-preview img {
  max-width: 180px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.quick-update-remove-img {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ff112d;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
}
.discussions-quickbox-wrap {
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 28px;
  background: #fff6f7;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(255,17,45,0.06);
  padding: 18px 20px;
}
.discussions-quickbox-fake {
  min-height: 46px;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(255,17,45,0.03);
  border: 1px solid #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding-left: 18px;
  color: #999;
  font-size: 1.08rem;
  font-style: italic;
}
.discussions-quickbox-placeholder {
  color: #caaaaf;
  font-size: 1.08rem;
  font-style: italic;
}
.discussion-radio-group {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.08rem;
}
.category-radio-logo {
  height: 22px;
  margin-right: 8px;
  margin-left: 2px;
  vertical-align: middle;
}
.sidebar {
  position: fixed;
  top: 88px;
  left: 0;
  width: 220px;
  min-width: 180px;
  max-width: 260px;
  background: #fff6f7;
  border-right: 1px solid #eee;
  padding: 24px 16px 0 16px;
  min-height: calc(100vh - 88px);
  z-index: 10;
}
.sidebar-heading {
  font-size: 1.18rem;
  font-weight: bold;
  margin-bottom: 22px;
  color: #ff112d;
}
.category-filters-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.category-checkbox-sidebar {
  font-weight: 600;
  color: #ff112d;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.category-checkbox-sidebar input[type="checkbox"] {
  accent-color: #ff112d;
  width: 18px;
  height: 18px;
}
.category-logo-img {
  height: 28px;
  width: 28px;
  object-fit: contain;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #eee;
  margin-left: 8px;
  vertical-align: middle;
}
.main-content {
  margin-left: 220px;
  min-width: 0;
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; }
}

/* Discussions Editor Card */
.discussions-editor-wrap {
  max-width: 650px;
  margin: 0 auto 28px auto;
}
.discussions-editor-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 14px rgba(255,17,45,0.12);
  padding: 18px 20px 24px 20px;
  margin: 0 auto;
  position: relative;
}
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.editor-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #ff112d;
}
.editor-info {
  color: #ff112d;
  font-size: 1.18rem;
  margin: 0 10px;
}
.editor-close {
  background: #ff112d;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 4px 14px;
  font-size: 1.08rem;
  font-weight: bold;
  cursor: pointer;
}
.editor-title-input {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 1.13rem;
  margin-bottom: 8px;
}
.editor-separator {
  border: none;
  border-top: 1px solid #ff112d;
  margin: 8px 0 12px 0;
}
.editor-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.32rem;
  color: #ff112d;
  transition: color 0.15s;
  display: flex;
  align-items: center;
}
.icon-btn:active,
.icon-btn:hover {
  color: orange;
}
.action-icon {
  font-size: 1.3rem;
}
.category-select {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
}
.cat-btn {
  background: #f1f1f1;
  border: 2px solid #f1f1f1;
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  transition: border 0.18s;
}
.cat-btn.selected {
  border: 2px solid #ff112d;
  background: #fff6f7;
}
.cat-icon {
  height: 28px;
  width: 28px;
  object-fit: contain;
}
.post-btn {
  background: #ff112d;
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 7px 28px;
  font-size: 1.08rem;
  cursor: pointer;
  transition: background 0.18s;
  margin-left: auto;
}
.post-btn:disabled {
  background: #f1f1f1;
  color: #aaa;
  cursor: not-allowed;
}
.editor-image-preview {
  margin-bottom: 8px;
  position: relative;
  display: inline-block;
}
.editor-image-preview img {
  max-width: 180px;
  max-height: 120px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.editor-remove-img {
  position: absolute;
  top: 1px;
  right: 2px;
  background: #ff112d;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
}
.editor-body-input {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 7px;
  padding: 8px 12px;
  font-size: 1.09rem;
  resize: vertical;
  background: #fff;
  color: #222;
  margin-bottom: 8px;
  outline: none;
  transition: border 0.18s;
}
.editor-body-input:focus {
  border-color: orange;
}

/* Real-time Preview Card */
.editor-preview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255,17,45,0.06);
  padding: 13px 18px 8px 18px;
  margin: 18px 0 0 0;
}
.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.05rem;
  font-weight: bold;
  color: #ff112d;
  margin-bottom: 8px;
}
.preview-user { color: #ff112d; }
.preview-time { color: #8e8e8e; font-size: 0.95rem;}
.preview-title {
  font-size: 1.13rem;
  font-weight: 500;
  margin-bottom: 6px;
  display: block;
}
.preview-image img {
  max-width: 130px;
  max-height: 80px;
  border-radius: 7px;
  margin-bottom: 6px;
}
.preview-content {
  color: #444;
  font-size: 1.08rem;
  margin-top: 4px;
  display: block;
}
.comment-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0.2em;
  margin-bottom: 0.2em;
}

.category-logo-inline {
  height: 22px;
  width: 22px;
  object-fit: contain;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #eee;
  vertical-align: middle;
  flex-shrink: 0;
}

.comment-body {
  margin: 0;
  padding: 0;
  font-size: 1.09rem;
  font-weight: 400;
  line-height: 1.6;
  color: #222;
  white-space: normal;
  word-break: break-word;
  display: inline;
}

@media (max-width: 768px) {
  .comment-line {
    gap: 6px;
  }
  .category-logo-inline {
    height: 18px;
    width: 18px;
  }
}
.report-body .comment-body img,
.comment-body img,
.vue-remarkable img {
  max-width: 160px !important;
  max-height: 120px !important;
  width: auto !important;
  height: auto !important;
  display: block;
  margin: 10px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  object-fit: cover;
}
</style>