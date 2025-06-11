<template>
  <div class="col-md-4">
    <div class="user-sidebar sticky-top" :class="darkModeClass">
      <div v-if="authorAccountInfo" class="user-sidebar-content">
        
       
        <div class="d-flex align-items-center mb-4 user-header">
          <nuxt-link :to="'/@' + report.author">
            <img :src="`https://images.hive.blog/u/${report.author}/avatar/large`" class="sidebar-avatar"
                 @error="$event.target.src='https://actifit.io/img/user-default.png'">
          </nuxt-link>
          <div class="ml-3">
            <h4 class="card-title mb-0">
              <nuxt-link :to="'/@' + report.author" class="username-link">@{{ report.author }}</nuxt-link>
            </h4>
            <small v-if="authorAccountInfo.created" class="text-muted">Joined {{ formatDate(authorAccountInfo.created) }}</small>
          </div>
        </div>

       
        <ul class="list-unstyled stats-list mb-4">
          <li v-if="userRank">
            <span>User Rank</span>
            <strong>{{ displayCoreUserRank }}</strong>
          </li>
          <li>
            <span>HIVE Balance</span>
            <strong>{{ authorAccountInfo.balance.replace(' HIVE', '') }}</strong>
          </li>
          <li>
            <span>AFIT Balance</span>
            <strong>{{ authorAfitBalance != null ? parseFloat(authorAfitBalance).toFixed(3) : '...' }}</strong>
          </li>
        </ul>

        
        <ul class="list-unstyled nav-list">
          <li>
            <nuxt-link :to="'/@' + report.author + '/blog'">
              <i class="fas fa-blog fa-fw"></i> Blog Posts
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="'/@' + report.author + '/comments'">
              <i class="fas fa-comments fa-fw"></i> Comments
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="'/@' + report.author + '/wallet'">
              <i class="fas fa-wallet fa-fw"></i> Wallet
            </nuxt-link>
          </li>
        </ul>

      </div>
      
      <div v-else class="py-5 text-center">
        <i class="fas fa-spinner fa-spin fa-3x text-brand"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserSidebar',
  props: {
    report: { type: Object, required: true, },
    authorAccountInfo: { type: Object, default: null, },
    authorAfitBalance: { type: [Number, String], default: null, },
    userRank: { type: Object, default: null, },
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
    }
  },
  methods: {
    formatDate(isoDate) {
      if (!isoDate) return 'N/A';
      return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  }
}
</script>

<style scoped>
/* Light Mode */
.user-sidebar {
  background: linear-gradient(to bottom, #fdddb3, #ffffff 250px);
  margin-left: -24px; 
  padding: 1.5rem 1.5rem 1.5rem 24px;
  border-top: 1px solid #fbe5c5;
  border-right: 1px solid #fbe5c5;
  border-bottom: 1px solid #fbe5c5;
  border-left: none;
  border-radius: 0 12px 12px 0;
  color: #555;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.user-sidebar.sticky-top {
  top: 1.5rem;
}

.sidebar-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #ff112d;
}

.user-header .card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.username-link {
  color: #d9001b; 
  text-decoration: none;
  transition: color 0.3s ease;
}
.username-link:hover {
  color: #ff112d;
}

.text-muted {
  color: #888 !important;
  transition: color 0.3s ease;
}

.stats-list li, .nav-list li a {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.stats-list li:last-child, .nav-list li:last-child a {
  border-bottom: none;
}

.stats-list li span { color: #777; transition: color 0.3s ease; }
.stats-list li strong { font-size: 1rem; color: #333; transition: color 0.3s ease; }

.nav-list a {
  color: #555;
  text-decoration: none;
  transition: color 0.2s ease-in-out, padding-left 0.2s ease-in-out;
  width: 100%;
  justify-content: flex-start;
}

.nav-list a:hover,
.nav-list a:hover i {
    color: #ff112d;
}

.nav-list a:hover {
  padding-left: 5px;
}

.nav-list .fa-fw {
  width: 25px;
  margin-right: 10px;
  text-align: center;
  font-size: 1rem;
}

.text-brand { color: #ff112d; }


/*Dark Mode */

.user-sidebar.dark-mode-active {
  
  background: linear-gradient(to bottom, #9c651b, #202022 250px);
  
  border-color: #543810;
  color: #e0e0e0;
}

.dark-mode-active .username-link {
  color: #ff112d; 
}

.dark-mode-active .text-muted {
  color: #b09a7a !important; 
}

.dark-mode-active .stats-list li,
.dark-mode-active .nav-list li a {
  
  border-bottom-color: #543810;
}

.dark-mode-active .stats-list li span {
  color: #b09a7a;
}

.dark-mode-active .stats-list li strong {
  color: #fff;
}

.dark-mode-active .nav-list a {
  color: #e0e0e0;
}
</style>