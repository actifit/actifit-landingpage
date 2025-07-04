<template>
  <div>
    <NavbarBrand />

    <div class="container pt-5 mt-5 pb-5">
      <ListHeadingSection :textualDisplay="'Hive Discussions'" />
      <div class="text-left mb-4 text-brand market-sub">
        Latest comments from PeakD Snaps, Inleo Threads, and Ecency Waves
      </div>

      <!-- Category Filters with Logos (always visible) -->
      <div class="category-filters mb-4">
        <label
          v-for="cat in categories"
          :key="cat.value"
          class="category-checkbox"
          style="display: flex; align-items: center; gap: 8px;"
        >
          <input type="radio" :value="cat.value" v-model="selectedCategory" name="category" />
          <img
            v-if="categoryLogoMap[cat.value]"
            :src="categoryLogoMap[cat.value]"
            :alt="cat.label"
            class="category-logo-img"
            style="height: 24px; width: 24px;"
          />
          {{ cat.label }}
        </label>
        <label class="category-checkbox" style="display: flex; align-items: center; gap: 8px;">
          <input type="radio" value="all" v-model="selectedCategory" name="category" />
          All
        </label>
      </div>

      <!-- Quick Update Box (HIDE in full comment view) -->
      <div v-if="!routeHasComment" class="quick-update-box card report mb-4">
        <div class="quick-update-header mb-2">
          <img
            v-if="currentUsername"
            :src="`https://images.hive.blog/u/${currentUsername}/avatar`"
            class="quick-update-avatar"
            alt="avatar"
          />
          <span v-else class="quick-update-avatar-placeholder"></span>
          <div class="quick-update-radios">
            <label v-for="cat in quickUpdateTargets" :key="cat.value" class="category-checkbox" style="margin-right: 12px;">
              <input
                type="radio"
                :value="cat.value"
                v-model="quickUpdateTarget"
                name="quickUpdateTarget"
              />
              <img
                :src="categoryLogoMap[cat.value]"
                :alt="cat.label"
                class="category-logo-img"
                style="height: 22px; width: 22px;"
              />
              {{ cat.label }}
            </label>
          </div>
        </div>
        <textarea
          class="quick-update-textarea"
          v-model="quickUpdateText"
          :placeholder="'Share a quick update...'"
          rows="2"
          maxlength="280"
        ></textarea>
        <div class="quick-update-actions mt-2">
          <label class="quick-update-upload-btn">
            <input type="file" accept="image/*" @change="onQuickUpdateImageChange" style="display:none;" />
            <i class="fas fa-image"></i> Add Photo
          </label>
          <button
            class="reply-btn"
            :disabled="postingQuickUpdate || !quickUpdateText.trim()"
            @click="postQuickUpdate"
          >
            {{ postingQuickUpdate ? 'Posting...' : 'Post' }}
          </button>
        </div>
        <div v-if="quickUpdateImagePreview" class="quick-update-image-preview mt-2">
          <img :src="quickUpdateImagePreview" alt="Preview" />
          <button class="quick-update-remove-img" @click="removeQuickUpdateImage" title="Remove image">&times;</button>
        </div>
        <div v-if="quickUpdateError" class="reply-error mt-2">{{ quickUpdateError }}</div>
      </div>
      <!-- End Quick Update Box -->

      <!-- Single Comment View -->
      <div v-if="routeHasComment" class="container pt-3 pb-5">
        <div v-if="loadingSingleComment" class="loading">Loading comment...</div>
        <div v-else-if="singleComment">
          <!-- Main Comment Card with Reply button and inline reply box (identical logic to Comments.vue) -->
          <div class="card report mb-4">
            <h6 class="mb-0 text-center report-title">
              {{ truncateString(singleComment.title || singleComment.body, 60) }}
            </h6>
            <div class="report-body">
              <div class="row pb-1">
                <div class="col-8">
                  <UserHoverCard :username="singleComment.author" />
                </div>
                <div class="col-4 text-right">
                  <TimeAgo :timestamp="singleComment.created" />
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div v-if="getCommentImages(singleComment.body)" class="comment-images mb-2">
                    <img
                      v-for="(img, index) in getCommentImages(singleComment.body)"
                      :key="index"
                      :src="img"
                      :alt="'Image ' + (index + 1)"
                      class="report-image"
                      @click="handleImageClick(img)"
                    />
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div>
                    <span v-html="singleComment.body"></span>
                  </div>
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
                  <CustomTextEditor ref="rootEditor" :initialContent="replyBody" />
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
                    {{ truncateString(comment.title || comment.body, 60) }}
                    <i class="fas fa-external-link-alt"></i>
                  </a>
                </h6>
                <div class="report-body">
                  <div class="row pb-1">
                    <div class="col-8">
                      <UserHoverCard :username="comment.author" />
                    </div>
                    <div class="col-4 text-right">
                      <TimeAgo :timestamp="comment.created" />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <div v-if="getCommentImages(comment.body)" class="comment-images mb-2">
                        <img
                          v-for="(img, index) in getCommentImages(comment.body)"
                          :key="index"
                          :src="img"
                          :alt="'Image ' + (index + 1)"
                          class="report-image"
                          @click="handleImageClick(img)"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <div>
                        <span v-html="shorten(comment.body, 200)"></span>
                      </div>
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
                  <div class="row details mt-2">
                    <div class="col-12">
                      <img
                        v-if="categoryLogoMap[comment.category]"
                        :src="categoryLogoMap[comment.category]"
                        :alt="comment.categoryLabel"
                        class="category-logo-img"
                      />
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
</template>

<script>
import hive from '@hiveio/hive-js'
import NavbarBrand from '~/components/NavbarBrand'
import Footer from '~/components/Footer'
import ListHeadingSection from '~/components/ListHeadingSection'
import UserHoverCard from '~/components/UserHoverCard.vue'
import TimeAgo from '~/components/TimeAgo.vue'
import VoteModal from '~/components/VoteModal.vue'
import Comments from '~/components/Comments.vue'
import CustomTextEditor from '~/components/CustomTextEditor.vue'
import vueRemarkable from 'vue-remarkable'
import { mapGetters } from 'vuex'

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
      loading: true,
      categories: [
        { value: 'peak.snaps', label: 'PeakD Snaps' },
        { value: 'leothreads', label: 'Inleo Threads' },
        { value: 'ecency.waves', label: 'Ecency Waves' }
      ],
      quickUpdateTargets: [
        { value: 'peak.snaps', label: 'PeakD Snaps' },
        { value: 'ecency.waves', label: 'Ecency Waves' }
      ],
      quickUpdateText: '',
      quickUpdateImage: null,
      quickUpdateImagePreview: '',
      quickUpdateTarget: 'peak.snaps',
      postingQuickUpdate: false,
      quickUpdateError: '',
      quickUpdateSuccess: false,
      selectedCategory: 'all',
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
      rootResponseBody: ''
    }
  },
  computed: {
    ...mapGetters('steemconnect', ['user']),
    filteredCommentsSorted() {
      let comments = this.allComments;
      if (this.selectedCategory !== 'all') {
        comments = comments.filter(c => c.category === this.selectedCategory);
      }
      comments = comments.sort((a, b) => new Date(b.created) - new Date(a.created));
      return comments.slice(0, this.commentsToShow);
    },
    allCommentsCount() {
      let comments = this.allComments;
      if (this.selectedCategory !== 'all') {
        comments = comments.filter(c => c.category === this.selectedCategory);
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
        if (
          reply.parent_author === this.singleComment.author &&
          reply.parent_permlink === this.singleComment.permlink
        ) {
          roots.push(reply);
        } else {
          const parentKey = `${reply.parent_author}/${reply.parent_permlink}`;
          if (map[parentKey]) {
            map[parentKey].reply_entries.push(reply);
          }
        }
      });
      return roots;
    }
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
    // --- Quick Update Feature ---
    onQuickUpdateImageChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.quickUpdateImage = file;
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.quickUpdateImagePreview = evt.target.result;
      };
      reader.readAsDataURL(file);
    },
    removeQuickUpdateImage() {
      this.quickUpdateImage = null;
      this.quickUpdateImagePreview = '';
    },
    async postQuickUpdate() {
      this.quickUpdateError = '';
      this.quickUpdateSuccess = false;
      if (!this.isLoggedIn) {
        this.quickUpdateError = 'You must be logged in to post.';
        return;
      }
      if (!this.quickUpdateText.trim()) {
        this.quickUpdateError = 'Update cannot be empty.';
        return;
      }
      if (!['peak.snaps', 'ecency.waves'].includes(this.quickUpdateTarget)) {
        this.quickUpdateError = 'Please select a valid target.';
        return;
      }
      this.postingQuickUpdate = true;
      let imageUrl = '';
      try {
        // Upload image if present
        if (this.quickUpdateImage) {
          const formData = new FormData();
          formData.append('file', this.quickUpdateImage);
          const res = await fetch('https://image.ecency.com/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.url) {
            imageUrl = data.url;
          } else {
            throw new Error('Image upload failed');
          }
        }

        // Prepare post body
        let body = this.quickUpdateText.trim();
        if (imageUrl) {
          body += `\n\n![image](${imageUrl})`;
        }

        // Prepare permlink and meta
        const username = this.currentUsername;
        const permlink =
          username.replace(/\./g, '-') +
          '-quickupdate-' +
          this.quickUpdateTarget.replace(/\./g, '-') +
          '-' +
          new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
        let meta = {
          tags: [this.quickUpdateTarget, 'actifit'],
          app: 'actifit/0.5.0'
        };

        // Prepare comment_options (optional, for future-proofing)
        let comment_options = {
          author: username,
          permlink: permlink,
          max_accepted_payout: '1000000.000 HBD',
          percent_hbd: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: []
        };

        // Prepare comment operation
        let cstm_params = {
          author: username,
          title: "",
          body: body,
          parent_author: "",
          parent_permlink: this.quickUpdateTarget.replace(/\./g, '-'), // <-- fix here!
          permlink: permlink,
          json_metadata: JSON.stringify(meta)
        };

        // Use processTrxFunc to broadcast (with comment_options)
        let res = await this.processTrxFunc('comment', cstm_params, 'HIVE', 'comment_options', comment_options);
        if (res.success) {
          this.quickUpdateSuccess = true;
          // Build the new comment object for instant UI feedback
          // Before building newComment
          const catObj = this.categories.find(c => c.value === this.quickUpdateTarget);

          const newComment = {
            author: username,
            body: body,
            permlink: permlink,
            category: this.quickUpdateTarget,
            categoryLabel: catObj ? catObj.label : '',
            parentAuthor: '',
            parentPermlink: this.quickUpdateTarget.replace(/\./g, '-'),
            id: `${username}-${permlink}`,
            created: new Date().toISOString(),
            active_votes: [],
            children: 0,
            // Add any other fields you want to show
          };
          this.allComments.unshift(newComment); // Add to top of list

          this.quickUpdateText = '';
          this.quickUpdateImage = null;
          this.quickUpdateImagePreview = '';
          this.$notify({
            group: 'success',
            title: 'Success',
            text: 'Update posted!',
            duration: 2500
          });
          setTimeout(() => { this.quickUpdateSuccess = false }, 2000);

          // Optionally, refresh from server after a short delay to sync with blockchain
          setTimeout(() => {
            this.fetchAllComments();
          }, 2000);
        }
        else {
          this.quickUpdateError = 'Failed to post update.';
        }
        this.postingQuickUpdate = false;
      } catch (e) {
        this.quickUpdateError = e.message || 'Failed to post update.';
        this.postingQuickUpdate = false;
      }
    },
    // --- End Quick Update Feature ---

    goToSingleComment(comment) {
      this.$router.push({
        path: this.$route.path,
        query: { author: comment.author, permlink: comment.permlink }
      });
    },
    async fetchSingleComment() {
      this.loadingSingleComment = true;
      this.loadingReplies = true;
      const { author, permlink } = this.$route.query;
      this.singleComment = await new Promise((resolve, reject) => {
        hive.api.getContent(author, permlink, (err, result) => err ? reject(err) : resolve(result));
      });
      this.loadingSingleComment = false;
      this.singleCommentReplies = await new Promise((resolve, reject) => {
        hive.api.getContentReplies(author, permlink, (err, result) => err ? reject(err) : resolve(result));
      });
      this.loadingReplies = false;
    },
    getCommentImages(body) {
      if (!body) return [];
      const patterns = [
        /https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp)/gi,
        /!\[.*?\]\((https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp))\)/gi
      ];
      let images = [];
      const directUrls = body.match(patterns[0]) || [];
      images = images.concat(directUrls);

      const markdownMatches = [...body.matchAll(patterns[1])];
      const markdownUrls = markdownMatches
        .map(match => match[1])
        .filter(url => !!url);

      images = images.concat(markdownUrls);

      return [...new Set(images)];
    },
    handleImageClick(imgUrl) {
      window.open(imgUrl, '_blank');
    },
    shorten(text, max = 200) {
      if (!text) return ''
      const plain = text
        .replace(/(http|https):\/\/[^\s]+/g, '')
        .replace(/\n/g, ' ')
        .trim()
      return plain.length > max ? plain.substring(0, max) + '...' : plain
    },
    truncateString(str, len = 60) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len - 3) + '...' : str;
    },
    commentUrl(comment) {
      return `https://hive.blog/@${comment.parentAuthor}/${comment.parentPermlink}#@${comment.author}/${comment.permlink}`;
    },
    handleReblog(comment) {
      if (!this.currentUsername) {
        this.showLoginPopup = true;
        return;
      }
      this.$reblog(this.user, comment);
    },
    getUpvoteCount(comment) {
      return comment.active_votes ? comment.active_votes.filter(v => v.percent > 0).length : 0;
    },
    isLikedByCurrentUser(comment) {
      const username = this.currentUsername;
      if (!username || !comment.active_votes) return false;
      return comment.active_votes.some(
        v => v.voter && v.voter.toLowerCase() === username.toLowerCase() && v.percent > 0
      );
    },
    votePrompt(comment) {
      if (!this.currentUsername) {
        this.showLoginPopup = true;
        return;
      }
      this.$store.commit('setPostToVote', comment);
      if (window.$) {
        window.$('#voteModal').modal('show');
      }
    },
    onVoteSuccess(voted) {
      if (!voted) return;
      const idx = this.allComments.findIndex(
        c => c.author === voted.author && c.permlink === voted.permlink
      );
      if (idx !== -1) {
        if (!this.allComments[idx].active_votes) this.$set(this.allComments[idx], 'active_votes', []);
        const username = this.currentUsername;
        if (!this.allComments[idx].active_votes.some(v => v.voter && v.voter.toLowerCase() === username.toLowerCase())) {
          this.allComments[idx].active_votes.push({ voter: username, percent: 10000 });
        }
      }
      if (this.singleComment && this.singleComment.author === voted.author && this.singleComment.permlink === voted.permlink) {
        if (!this.singleComment.active_votes) this.$set(this.singleComment, 'active_votes', []);
        const username = this.currentUsername;
        if (!this.singleComment.active_votes.some(v => v.voter && v.voter.toLowerCase() === username.toLowerCase())) {
          this.singleComment.active_votes.push({ voter: username, percent: 10000 });
        }
      }
    },
    async fetchAllComments() {
      this.loading = true;
      let allComments = [];
      for (const cat of this.categories) {
        const posts = await new Promise((resolve, reject) => {
          hive.api.getDiscussionsByAuthorBeforeDate(
            cat.value,
            '',
            new Date().toISOString().slice(0, 19),
            5,
            (err, result) => err ? reject(err) : resolve(result)
          );
        });
        for (const post of posts) {
          const comments = await new Promise((resolve, reject) => {
            hive.api.getContentReplies(post.author, post.permlink, (err, result) => err ? reject(err) : resolve(result));
          });
          allComments = allComments.concat(
            comments
              .filter(c => c.body && c.body.trim().length > 0)
              .map(c => ({
                ...c,
                id: `${c.author}-${c.permlink}`,
                category: cat.value,
                categoryLabel: cat.label,
                parentAuthor: post.author,
                parentPermlink: post.permlink,
                permlink: typeof c.permlink === 'string' ? c.permlink : String(c.permlink)
              }))
          );
        }
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
      if (!this.isLoggedIn) {
        this.replyError = 'You must be logged in to reply.';
        return;
      }
      const body = this.$refs.rootEditor ? this.$refs.rootEditor.content : this.replyBody;
      if (!body || !body.trim()) {
        this.replyError = 'Reply cannot be empty.';
        return;
      }
      this.postingReply = true;
      try {
        const username = this.currentUsername;
        const parent_author = this.singleComment.author;
        const parent_permlink = this.singleComment.permlink;
        const permlink =
          username.replace('.', '-') +
          '-re-' +
          parent_author.replace('.', '-') +
          '-' +
          parent_permlink +
          new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
        let meta = [];
        meta.tags = ['hive-193552', 'actifit'];
        meta.app = 'actifit/0.5.0';
        meta.suppEdit = 'actifit.io.comment';
        if (!localStorage.getItem('std_login')) {
          this.$steemconnect.comment(
            parent_author,
            parent_permlink,
            username,
            permlink,
            '',
            body,
            meta,
            (err) => {
              this.onRootReplyResult(err, true, 'STEEM', body);
            }
          )
        } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
          let comment_options = {
            author: username,
            permlink: permlink,
            max_accepted_payout: '1000000.000 HBD',
            percent_hbd: 10000,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: []
          };
          window.hive_keychain.requestPost(
            username,
            "",
            body,
            parent_permlink,
            parent_author,
            JSON.stringify(meta),
            permlink,
            JSON.stringify(comment_options), (response) => {
              if (response.success) {
                this.onRootReplyResult(null, true, this.cur_bchain || 'HIVE', body);
              } else {
                this.onRootReplyResult(response.message, false, this.cur_bchain || 'HIVE', body);
              }
            });
        } else {
          let cstm_params = {
            author: username,
            title: "",
            body: body,
            parent_author: parent_author,
            parent_permlink: parent_permlink,
            permlink: permlink,
            json_metadata: JSON.stringify(meta)
          };
          let res = await this.processTrxFunc('comment', cstm_params, this.cur_bchain || 'HIVE');
          if (res.success) {
            this.onRootReplyResult(null, true, this.cur_bchain || 'HIVE', body);
          } else {
            this.onRootReplyResult('error saving', false, this.cur_bchain || 'HIVE', body);
          }
          let other_chain = (this.cur_bchain || 'HIVE') == 'HIVE' ? 'STEEM' : 'HIVE';
          if (this.target_bchain == 'BOTH') {
            let res = await this.processTrxFunc('comment', cstm_params, other_chain);
            if (res.success) {
              this.onRootReplyResult(null, true, other_chain, body);
            } else {
              this.onRootReplyResult('error saving', false, other_chain, body);
            }
          }
        }
      } catch (e) {
        this.replyError = 'Failed to post reply.';
      }
      this.postingReply = false;
    },
    onRootReplyResult(err, finalize, bchain, body) {
      if (err) {
        this.replyError = typeof err === 'string' ? err : (err && err.message ? err.message : 'Error posting reply');
        this.replySuccess = false;
      } else {
        this.replySuccess = true;
        this.replyError = '';
        this.rootResponsePosted = true;
        this.rootResponseBody = body;
        this.replyBody = '';
        this.showRootReplyBox = false;

        // Poll for the new reply to appear (max 10 seconds)
        const parent_author = this.singleComment.author;
        const parent_permlink = this.singleComment.permlink;
        const expectedReplyCount = ((this.singleCommentReplies && this.singleCommentReplies.length) ? this.singleCommentReplies.length : 0) + 1;
        let pollCount = 0;
        const pollReplies = async () => {
          pollCount++;
          await this.fetchSingleComment();
          // If the new reply is visible, stop polling
          if (this.singleCommentReplies && this.singleCommentReplies.length >= expectedReplyCount) {
            this.rootResponsePosted = false;
            this.replySuccess = false;
            return;
          }
          // Otherwise, poll again (max 10 times, 1s interval)
          if (pollCount < 10) {
            setTimeout(pollReplies, 1000);
          } else {
            // Give up after 10 seconds
            this.rootResponsePosted = false;
            this.replySuccess = false;
          }
        };
        setTimeout(pollReplies, 1500); // Start polling after initial delay
      }
    },
    async processTrxFunc(op_name, cstm_params, bchain_option, op_name2, cstm_params2) {
      if (!localStorage.getItem('std_login')) {
        let ops = [[op_name, cstm_params]];
        if (op_name2 && cstm_params2) ops.push([op_name2, cstm_params2]);
        let res = await this.$steemconnect.broadcast(ops);
        if (res.result && res.result.ref_block_num) {
          return { success: true, trx: res.result };
        } else {
          return { success: false, trx: null };
        }
      } else if (localStorage.getItem('acti_login_method') == 'keychain' && window.hive_keychain) {
        let ops = [[op_name, cstm_params]];
        if (op_name2 && cstm_params2) ops.push([op_name2, cstm_params2]);
        await window.hive_keychain.requestBroadcast(
          this.user.account.name,
          ops,
          'Active', (response) => {
            if (op_name === 'delete_comment') {
              // handle delete
            }
          });
      } else {
        let operation = [[op_name, cstm_params]];
        if (op_name2 && cstm_params2) operation.push([op_name2, cstm_params2]);
        let accToken = localStorage.getItem('access_token')
        let op_json = JSON.stringify(operation)
        let cur_bchain = (localStorage.getItem('cur_bchain') ? localStorage.getItem('cur_bchain') : 'HIVE');
        if (bchain_option) {
          cur_bchain = bchain_option;
        }
        let url = new URL(process.env.actiAppUrl + 'performTrx/?user=' + this.user.account.name + '&operation=' + encodeURIComponent(op_json) + '&bchain=' + cur_bchain);
        let reqHeads = new Headers({
          'Content-Type': 'application/json',
          'x-acti-token': 'Bearer ' + accToken,
        });
        let res = await fetch(url, {
          headers: reqHeads
        });
        let outcome = await res.json();
        if (outcome.error) {
          return { success: false, trx: null };
        } else {
          return { success: true, trx: outcome.trx };
        }
      }
    },
    handleTranslationCacheUpdate(payload) {
      this.translationCache = {
        ...this.translationCache,
        [payload.id]: payload.data
      };
    }
  },
  async mounted() {
    await this.fetchAllComments();
    this.updateInterval = setInterval(() => {
      this.$forceUpdate();
    }, 1000);
  },
  beforeDestroy() {
    if (this.updateInterval) clearInterval(this.updateInterval);
  }
}
</script>

<style scoped>
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

/* --- Replies Thread Style --- */
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

/* --- Quick Update Styles --- */
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
</style>