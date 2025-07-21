<template>
  <div class="col-md-4 order-md-1">
    
    <!-- The 'sticky-top' class has been removed. Stickiness is now handled in CSS. -->
    <div class="user-sidebar" :class="[darkModeClass, 'align-to-content']">
      <div class="sidebar-scroll-container">
        <div v-if="authorAccountInfo" class="user-sidebar-content">
          
          <!-- User Header Section -->
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

          <!-- User Description -->
          <p v-if="userProfile.about" class="user-description mb-4">{{ userProfile.about }}</p>

          <!-- Stats List (HIVE, AFIT, Posts) -->
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

          <!-- Wrapping Navigation Links -->
          <div class="scrolling-nav-container">
            <ul class="list-unstyled nav-list">
              <li><nuxt-link :to="'/@' + report.author+'/blog'"><i class="fas fa-book-open fa-fw"></i> Blog Posts</nuxt-link></li>
              <li><nuxt-link :to="'/@' + report.author + '/comments'"><i class="far fa-comments fa-fw"></i> Comments</nuxt-link></li>
              <li><nuxt-link :to="'/@' + report.author + '/videos'"><i class="fas fa-video fa-fw"></i> Videos</nuxt-link></li>
              <li><nuxt-link :to="'/activity/@' + report.author"><i class="fas fa-running fa-fw"></i> Actifit Reports</nuxt-link></li>
              <li><nuxt-link :to="'/@' + report.author + '/wallet'"><i class="fas fa-wallet fa-fw"></i> Wallet</nuxt-link></li>
            </ul>
          </div>
          
          <!-- RECENT POSTS CAROUSEL SECTION -->
          <div class="recent-posts-section">
            <h4 class="section-title">Recent Posts</h4>
            
            <div v-if="postsLoading" class="text-center py-4">
              <i class="fas fa-spinner fa-spin fa-2x text-brand"></i>
            </div>

            <div v-else-if="recentPosts.length > 0" class="mini-carousel">
              <div class="carousel-track-container">
                <div class="carousel-track" :style="{ transform: 'translateX(-' + currentPostIndex * 100 + '%)' }">
                  <div v-for="post in recentPosts" :key="post.permlink" class="carousel-slide">
                    <nuxt-link :to="'/@' + post.author + '/' + post.permlink" class="post-card">
                      <div class="post-card-image-container">
                        <img :src="getPostImage(post)" class="post-card-image" @error="$event.target.src='https://actifit.io/img/user-default.png'">
                      </div>
                      <div class="post-card-title">
                        {{ post.title }}
                      </div>
                    </nuxt-link>
                  </div>
                </div>
              </div>

              <template v-if="recentPosts.length > 1">
                <button @click="navigateCarousel(-1)" class="carousel-nav prev" aria-label="Previous Post">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button @click="navigateCarousel(1)" class="carousel-nav next" aria-label="Next Post">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </template>
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
      currentPostIndex: 0,
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
  },
  methods: {
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
          return `https://images.hive.blog/600x337/${meta.image[0]}`;
        }
      } catch (e) { }
      if (post.body) {
        const match = post.body.match(/https?:\/\/[^)\s]+\.(?:png|jpg|jpeg|gif|webp)/i);
        if (match) return `https://images.hive.blog/600x337/${match[0]}`;
      }
      return null;
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    navigateCarousel(direction) {
      const newIndex = this.currentPostIndex + direction;
      if (newIndex < 0) {
        this.currentPostIndex = this.recentPosts.length - 1;
      } else if (newIndex >= this.recentPosts.length) {
        this.currentPostIndex = 0;
      } else {
        this.currentPostIndex = new_index;
      }
    },
    async fetchRecentPosts() {
      if (!this.report || !this.report.author) return;
      this.postsLoading = true;
      this.recentPosts = [];
      try {
        const query = { sort: 'posts', account: this.report.author, limit: 20 };
        const userPosts = await hive.api.callAsync('bridge.get_account_posts', query);
        if (userPosts && userPosts.length > 0) {
          let eligiblePosts = userPosts.filter(post => post.permlink !== this.report.permlink);
          eligiblePosts = this.shuffleArray(eligiblePosts);
          const finalPosts = [];
          for (const post of eligiblePosts) {
            if (finalPosts.length >= 5) break;
            if (this.getPostImage(post) !== null) {
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
      }
    },
  }
}
</script>

<style scoped>


/* --- WRAPPING NAVIGATION --- */
.scrolling-nav-container {
  margin-bottom: 1rem;
}

.nav-list {
  display: flex;
  flex-wrap: wrap; 
  justify-content: center;
  gap: 10px;
  padding: 5px 0;
}
.nav-list li { list-style: none; }
.nav-list li a { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background-color: transparent; 
  color: #555; 
  padding: 8px 16px; 
  border-radius: 20px; 
  text-decoration: none; 
  font-size: 0.9rem; 
  font-weight: 500; 
  white-space: nowrap; 
  transition: all 0.2s ease; 
  border: 2px solid #ff112d; 
}
.nav-list li a:hover { 
  background-color: #ff112d; 
  color: white; 
  transform: translateY(-3px); 
}
.nav-list .fa-fw { margin-right: 8px; }

.user-sidebar { 
  background: linear-gradient(to bottom, #fdddb3, #ffffff 250px); 
  padding: 1.5rem; 
  border: 1px solid #fbe5c5; 
  border-right: none; 
  border-radius: 12px 0 0 12px; 
  color: #555; 
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  
  position: -webkit-sticky; /* For Safari */
  position: sticky;
  top: 90px; 
}

/* --- General & Preserved Styles --- */
.sidebar-avatar { width: 60px; height: 60px; border-radius: 50%; border: 2px solid #ff112d; }
.user-header .card-title { font-size: 1.25rem; }
.username-link { color: #d9001b; text-decoration: none; transition: color 0.3s ease; }
.username-link:hover { color: #ff112d; }
.text-muted { color: #888 !important; transition: color 0.3s ease; }
.user-rank-badge { background-color: #ff112d; color: white; padding: 2px 8px; font-size: 0.8rem; font-weight: normal; border-radius: 10em; border: 1px solid white; box-shadow: 0 0 0 1px #ff112d; line-height: 1.2; }
.user-description { font-size: 0.9rem; color: #666; border-bottom: 1px solid #eee; padding-bottom: 1rem; }

/* --- Uniform Stats List --- */
.stats-list {
  border-bottom: 1px solid #eee;
}
.stats-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 0;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
}
.stats-list li:first-child {
  border-top: none;
}
.stats-list li span {
  color: #777;
  transition: color 0.3s ease;
}
.stats-list li strong {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  transition: color 0.3s ease;
  white-space: nowrap;
  margin-left: 1rem;
}

.recent-posts-section { margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
.section-title { font-size: 1.1rem; font-weight: 600; color: #333; margin-bottom: 1rem; }
.mini-carousel { position: relative; }
.carousel-track-container { overflow: hidden; border-radius: 8px; }
.carousel-track { display: flex; transition: transform 0.4s ease-in-out; }
.carousel-slide { flex: 0 0 100%; min-width: 100%; box-sizing: border-box; }
.post-card { display: block; text-decoration: none; background: white; border-radius: 8px; overflow: hidden; padding: 10px; }
.post-card-image-container { width: 100%; padding-top: 56.25%; position: relative; background-color: #f0f0f0; border-radius: 8px; overflow: hidden; }
.post-card-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.post-card-title { padding: 10px 0 0 0; font-size: 0.9rem; font-weight: 600; color: #444; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
.carousel-nav { position: absolute; top: 35%; transform: translateY(-50%); background-color: rgba(255, 255, 255, 0.9); border: 1px solid #ddd; border-radius: 50%; width: 40px; height: 40px; color: #333; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s ease; z-index: 10; display: flex; align-items: center; justify-content: center; }
.carousel-nav:hover { background-color: #ff112d; color: white; border-color: #ff112d; }
.carousel-nav .fas { font-size: 16px; }
.carousel-nav.prev { left: 15px; } 
.carousel-nav.next { right: 15px; }
.text-brand { color: #ff112d; }

/* --- DARK MODE --- */
.user-sidebar.dark-mode-active { background: linear-gradient(to bottom, #9c651b, #202022 250px); border-color: #543810; color: #e0e0e0; }
.dark-mode-active .username-link { color: #ff112d; }
.dark-mode-active .text-muted { color: #b09a7a !important; }
.dark-mode-active .user-description { 
  color: #ccc; 
  border-bottom-color: #543810; 
}
.dark-mode-active .stats-list { border-bottom-color: #543810; }
.dark-mode-active .stats-list li { border-top-color: #543810; }
.dark-mode-active .recent-posts-section { border-top-color: #543810; }
.dark-mode-active .stats-list li span { color: #b09a7a; }
.dark-mode-active .stats-list li strong { color: #fff; }
.dark-mode-active .nav-list li a { color: #e0e0e0; border-color: #ff112d; }
.dark-mode-active .nav-list li a:hover { background-color: #ff112d; color: white; }
.dark-mode-active .section-title { color: #e0e0e0; }
.dark-mode-active .post-card { background: #3e3e42; }
.dark-mode-active .post-card-image-container { background-color: #2c2c2e; }
.dark-mode-active .post-card-title { color: #ccc; }
.dark-mode-active .carousel-nav { background-color: #3e3e42; border-color: #555; color: #ddd; }
.dark-mode-active .carousel-nav:hover { background-color: #ff112d; border-color: #ff112d; color: white; }
</style>