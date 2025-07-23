<template>
  <div class="col-md-4 order-md-1">
    
    <!-- ref is now on the main sidebar element, which will be transformed -->
    <div class="user-sidebar" :class="[darkModeClass, 'align-to-content']" ref="userSidebar">
      <div v-if="authorAccountInfo" class="user-sidebar-content">
        
        <!-- User Header Section  -->
        <div class="d-flex align-items-center mb-3 user-header">
          <nuxt-link :to="'/@' + report.author">
            <img :src="`https://images.hive.blog/u/${report.author}/avatar/large`" class="sidebar-avatar"
                 @error="$event.target.src='https://actifit.io/img/user-default.png'">
          </nuxt-link>
          <div class="ml-3">
            <div class="d-flex align-items-center">
              <span class="card-title mb-0">
                <nuxt-link :to="'/@' + report.author" class="username-link">@{{ report.author }}</nuxt-link>
              </span>
              <span v-if="userRank" class="user-rank-badge ml-2">{{ displayCoreUserRank }}</span>
            </div>
            <small v-if="authorAccountInfo.created" class="text-muted">Joined {{ formatDate(authorAccountInfo.created) }}</small>
          </div>
        </div>

        <!-- User Description  -->
        <p v-if="userProfile.about" class="user-description mb-4">{{ userProfile.about }}</p>

        <!-- Stats List -->
        <ul class="list-unstyled stats-list mb-4">
          <li>
            <span>HIVE Balance</span>
            <strong>{{ formatNumber(parseFloat(authorAccountInfo.balance), { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }}</strong>
          </li>
          <li>
            <span>AFIT Balance</span>
            <strong>{{ authorAfitBalance != null ? formatNumber(authorAfitBalance, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '...' }}</strong>
          </li>
          <li v-if="authorAccountInfo.post_count !== undefined">
            <span>Posts</span>
            <strong>{{ formatNumber(authorAccountInfo.post_count) }}</strong>
          </li>
        </ul>

        <!-- Wrapping Navigation Links-->
        <div class="scrolling-nav-container">
          <ul class="list-unstyled nav-list">
            <li><nuxt-link :to="'/@' + report.author+'/blog'"><i class="fas fa-book-open fa-fw"></i> Blog Posts</nuxt-link></li>
            <li><nuxt-link :to="'/@' + report.author + '/comments'"><i class="far fa-comments fa-fw"></i> Comments</nuxt-link></li>
            <li><nuxt-link :to="'/@' + report.author + '/videos'"><i class="fas fa-video fa-fw"></i> Videos</nuxt-link></li>
            <li><nuxt-link :to="'/activity/@' + report.author"><i class="fas fa-running fa-fw"></i> Actifit Reports</nuxt-link></li>
            <li><nuxt-link :to="'/@' + report.author + '/wallet'"><i class="fas fa-wallet fa-fw"></i> Wallet</nuxt-link></li>
          </ul>
        </div>
        
        <!-- RECENT POSTS SECTION -  -->
        <div class="recent-posts-section">
          <h4 class="section-title">Recent Posts</h4>
          
          <div v-if="postsLoading" class="text-center py-4">
            <i class="fas fa-spinner fa-spin fa-2x text-brand"></i>
          </div>

          <div v-else-if="recentPosts.length > 0" class="recent-posts-list">
            <nuxt-link v-for="post in recentPosts" :key="post.permlink" :to="'/@' + post.author + '/' + post.permlink" class="recent-post-card">
              <div class="post-card-background" :style="getPostCardBackground(post)"></div>
              <div class="post-card-overlay"></div>
              <div class="post-card-content">
                <h5 class="post-card-title-preview">{{ post.title }}</h5>
                <div class="post-card-stats">
                  <span v-if="post.json_metadata && post.json_metadata.step_count" class="stat-item">
                    <i class="fas fa-shoe-prints"></i> {{ formatNumber(post.json_metadata.step_count, 0) }}
                  </span>
                  <span class="stat-item">{{ toRelativeTime(post.created) }}</span>
                </div>
              </div>
            </nuxt-link>
          </div>
          
          <div v-else class="text-muted text-center py-3">
            No other posts found.
          </div>
        </div>
      
      </div>
      
      <div v-else class="py-5 text-center">
        <i class="fas fa-spinner fa-spin fa-3x text-brand"></i>
      </div>
    </div>
  </div>
</template>

<script>
import hive from '@hiveio/hive-js'

export default {
  name: 'UserSidebar',
  props: {
    report: { type: Object, required: true, },
    authorAccountInfo: { type: Object, default: null, },
    authorAfitBalance: { type: [Number, String], default: null, },
    userRank: { type: Object, default: null, },
  },
  data() {
    return {
      recentPosts: [],
      postsLoading: true,
      rafId: null, // ID for requestAnimationFrame to manage scrolling
    }
  },
  computed: {
    displayCoreUserRank() {
      return (this.userRank ? parseFloat(this.userRank.rank_no_afitx).toFixed(2) : 'N/A');
    },
    darkModeClass() {
      if (process.client && this.$store.state.darkMode) {
        return 'dark-mode-active';
      }
      return '';
    },
    userProfile() {
      try {
        if (this.authorAccountInfo && this.authorAccountInfo.posting_json_metadata) {
          const metadata = JSON.parse(this.authorAccountInfo.posting_json_metadata);
          return metadata.profile || {};
        }
      } catch (e) { }
      return {};
    },
  },
  watch: {
    'report.author': function(newAuthor, oldAuthor) {
      if (newAuthor && newAuthor !== oldAuthor) {
        this.fetchRecentPosts();
      }
    },
  },
  mounted() {
    this.fetchRecentPosts();
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleScroll, { passive: true });
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleScroll);
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
    }
  },
  methods: {
    handleScroll() {
      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId);
      }

      this.rafId = window.requestAnimationFrame(() => {
        const sidebar = this.$refs.userSidebar;
        if (!sidebar) return;

        // The 'top' value from CSS for the sticky position
        const stickyTopOffset = 90; 

        // The visible height allocated for the sidebar
        const sidebarVisibleHeight = window.innerHeight - stickyTopOffset;

        // How much the sidebar's content height exceeds its visible area
        const sidebarOverhang = sidebar.scrollHeight - sidebarVisibleHeight;

        // If sidebar content fits within the visible area, do nothing.
        if (sidebarOverhang <= 0) {
          sidebar.style.transform = 'translateY(0px)';
          return;
        }

        const pageScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (pageScrollableHeight <= 0) return;
        
        const scrollProgress = window.scrollY / pageScrollableHeight;
        
        // The distance to move the sidebar up. It should not exceed the total overhang.
        const transformDistance = Math.min(scrollProgress * sidebarOverhang, sidebarOverhang);
        
        // Apply the transform to move the sidebar up
        sidebar.style.transform = `translateY(-${transformDistance}px)`;
      });
    },
    formatDate(isoDate) {
      if (!isoDate) return 'NA';
      return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },
    formatNumber(value, options = {}) {
      if (value === null || typeof value === 'undefined') return '0';
      const number = Number(value);
      if (isNaN(number)) return value;
      return new Intl.NumberFormat('en-US', options).format(number);
    },
    getPostImage(post) {
      if (!post) return null;
      try {
        const meta = typeof post.json_metadata === 'string' 
            ? JSON.parse(post.json_metadata) 
            : post.json_metadata;
        if (meta && meta.image && Array.isArray(meta.image) && meta.image.length > 0 && meta.image[0]) {
          return `https://images.hive.blog/400x225/${meta.image[0]}`;
        }
      } catch (e) { }
      if (post.body) {
        const match = post.body.match(/https?:\/\/[^)\s]+\.(?:png|jpg|jpeg|gif|webp)/i);
        if (match) return `https://images.hive.blog/400x225/${match[0]}`;
      }
      return null;
    },
    getPostCardBackground(post) {
        const imageUrl = this.getPostImage(post);
        return { 
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundColor: imageUrl ? '#e9ecef' : '#f0f2f5' 
        };
    },
    toRelativeTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
      const now = new Date();
      const seconds = Math.round((now - date) / 1000);
      const minutes = Math.round(seconds / 60);
      const hours = Math.round(minutes / 60);
      const days = Math.round(hours / 24);

      if (seconds < 60) return 'just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    async fetchRecentPosts() {
      if (!this.report || !this.report.author) return;
      this.postsLoading = true;
      this.recentPosts = [];
      try {
        const query = { sort: 'posts', account: this.report.author, limit: 10 };
        const userPosts = await hive.api.callAsync('bridge.get_account_posts', query);
        if (userPosts && userPosts.length > 0) {
          const processedPosts = userPosts.map(post => {
            if (post && post.json_metadata && typeof post.json_metadata === 'string') {
              try {
                post.json_metadata = JSON.parse(post.json_metadata);
              } catch (e) {
                post.json_metadata = {};
              }
            }
            return post;
          });
          
          let eligiblePosts = processedPosts.filter(post => post.permlink !== this.report.permlink);
          
          const finalPosts = [];
          for (const post of eligiblePosts) {
            if (finalPosts.length >= 5) break;
            if (this.getPostImage(post)) {
              finalPosts.push(post);
            }
          }
          this.recentPosts = finalPosts;
        }
      } catch (error) {
        console.error("Failed to fetch recent posts:", error);
        this.recentPosts = [];
      } finally {
        this.postsLoading = false;
        this.$nextTick(() => {
          this.handleScroll();
        });
      }
    },
  }
}
</script>

<style scoped>
/* The .sidebar-scroll-container styles have been removed */

.scrolling-nav-container { margin-bottom: 1rem; }
.nav-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 5px 0; }
.nav-list li { list-style: none; }
.nav-list li a { display: flex; align-items: center; justify-content: center; background-color: transparent; color: #555; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 0.9rem; font-weight: 700; white-space: nowrap; transition: all 0.2s ease; border: 2px solid #ff112d; }
.nav-list li a:hover { background-color: #ff112d; color: white; transform: translateY(-3px); }
.nav-list .fa-fw { margin-right: 8px; }

.user-sidebar {
  background: linear-gradient(to bottom, #fdddb3, #ffffff 250px);
  padding: 1.5rem;
  border: 1px solid #fbe5c5;
  border-right: none;
  border-radius: 12px 0 0 12px;
  color: #555;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  position: -webkit-sticky;
  position: sticky;
  top: 90px;
  /* The element will be transformed, its height is determined by its content */
}

.sidebar-avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid #ff112d; }
.user-header .card-title { font-size: 1.25rem; }
.username-link { color: #d9001b; text-decoration: none; transition: color 0.3s ease; }
.username-link:hover { color: #ff112d; }
.text-muted { color: #888 !important; transition: color 0.3s ease; }
.user-rank-badge { background-color: #ff112d; color: white; padding: 2px 8px; font-size: 0.8rem; font-weight: normal; border-radius: 10em; border: 1px solid white; box-shadow: 0 0 0 1px #ff112d; line-height: 1.2; }
.user-description { font-size: 0.9rem; color: #666; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
.stats-list { border-bottom: 1px solid #eee; }
.stats-list li { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 0; font-size: 0.9rem; border-top: 1px solid #eee; }
.stats-list li:first-child { border-top: none; }
.stats-list li span { color: #777; }
.stats-list li strong { font-size: 1rem; font-weight: 600; color: #333; }
.text-brand { color: #ff112d; }

/* --- RECENT POSTS SECTION - DUAL MODE STYLES --- */
.recent-posts-section { margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
.section-title { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 1rem; }
.recent-posts-list { display: flex; flex-direction: column; gap: 1rem; }

.recent-post-card { display: block; position: relative; border-radius: 12px; overflow: hidden; min-height: 110px; text-decoration: none; transition: all .3s ease-in-out; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.recent-post-card:hover { transform: translateY(-5px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }

.post-card-background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: cover; background-position: center; transition: transform .4s ease; }
.recent-post-card:hover .post-card-background { transform: scale(1.05); }

.post-card-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.98) 40%, rgba(255, 255, 255, 0.7) 70%, transparent 100%);
}

.post-card-content { position: relative; z-index: 2; padding: 1rem; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; }

.post-card-title-preview {
  font-size: 1rem; font-weight: 600; line-height: 1.3; margin-bottom: 0.75rem;
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  color: #212529; text-shadow: none;
}

.post-card-stats {
  display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 500;
  padding-top: 0.5rem;
  color: #495057; text-shadow: none; border-top: 1px solid #e0e0e0;
}
.post-card-stats .stat-item { display: flex; align-items: center; }
.post-card-stats .fas { color: #ff112d; margin-right: 0.5rem; }

/* --- DARK MODE OVERRIDES --- */
.user-sidebar.dark-mode-active { background: linear-gradient(to bottom, #9c651b, #202022 250px); border-color: #543810; color: #e0e0e0; }
.dark-mode-active .username-link { color: #ff112d; }
.dark-mode-active .text-muted { color: #b09a7a !important; }
.dark-mode-active .user-description { color: #ccc; border-bottom-color: #543810; }
.dark-mode-active .stats-list { border-bottom-color: #543810; }
.dark-mode-active .stats-list li { border-top-color: #543810; }
.dark-mode-active .recent-posts-section { border-top-color: #543810; }
.dark-mode-active .stats-list li span { color: #b09a7a; }
.dark-mode-active .stats-list li strong { color: #fff; }
.dark-mode-active .nav-list li a { color: #e0e0e0; border-color: #ff112d; }
.dark-mode-active .nav-list li a:hover { background-color: #ff112d; color: white; }
.dark-mode-active .section-title { color: #e0e0e0; }

.dark-mode-active .recent-post-card { box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
.dark-mode-active .recent-post-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.4); }

.dark-mode-active .post-card-overlay {
  background: linear-gradient(to top, rgba(10, 10, 10, 0.95) 40%, rgba(10, 10, 10, 0.6) 70%, transparent 100%);
}
.dark-mode-active .post-card-title-preview {
  color: #f0f0f0; text-shadow: 0 1px 3px rgba(0,0,0,0.6);
}
.dark-mode-active .post-card-stats {
  color: #ccc; text-shadow: 0 1px 2px rgba(0,0,0,0.5); border-top-color: rgba(255, 255, 255, 0.2);
}
</style>