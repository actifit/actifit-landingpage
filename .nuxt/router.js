import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _18b2b59f = () => interopDefault(import('..\\pages\\3stest.vue' /* webpackChunkName: "pages/3stest" */))
const _0488b0ba = () => interopDefault(import('..\\pages\\3stest2.vue' /* webpackChunkName: "pages/3stest2" */))
const _8279d974 = () => interopDefault(import('..\\pages\\activity\\index.vue' /* webpackChunkName: "pages/activity/index" */))
const _304c9e55 = () => interopDefault(import('..\\pages\\auth.vue' /* webpackChunkName: "pages/auth" */))
const _6c1b5398 = () => interopDefault(import('..\\pages\\communities\\index.vue' /* webpackChunkName: "pages/communities/index" */))
const _f33078b2 = () => interopDefault(import('..\\pages\\conduct.vue' /* webpackChunkName: "pages/conduct" */))
const _5863078a = () => interopDefault(import('..\\pages\\consultants.vue' /* webpackChunkName: "pages/consultants" */))
const _43692606 = () => interopDefault(import('..\\pages\\delegators.vue' /* webpackChunkName: "pages/delegators" */))
const _ec8f5514 = () => interopDefault(import('..\\pages\\explore.vue' /* webpackChunkName: "pages/explore" */))
const _6bca89f9 = () => interopDefault(import('..\\pages\\faq.vue' /* webpackChunkName: "pages/faq" */))
const _33d85378 = () => interopDefault(import('..\\pages\\friends.vue' /* webpackChunkName: "pages/friends" */))
const _da694040 = () => interopDefault(import('..\\pages\\leaderboard.vue' /* webpackChunkName: "pages/leaderboard" */))
const _1e59e60c = () => interopDefault(import('..\\pages\\login.vue' /* webpackChunkName: "pages/login" */))
const _5a45b9a9 = () => interopDefault(import('..\\pages\\market.vue' /* webpackChunkName: "pages/market" */))
const _819b683a = () => interopDefault(import('..\\pages\\mods-access.vue' /* webpackChunkName: "pages/mods-access" */))
const _fb940dea = () => interopDefault(import('..\\pages\\notifications.vue' /* webpackChunkName: "pages/notifications" */))
const _d396fcdc = () => interopDefault(import('..\\pages\\ownership.vue' /* webpackChunkName: "pages/ownership" */))
const _4581b748 = () => interopDefault(import('..\\pages\\password.vue' /* webpackChunkName: "pages/password" */))
const _4c1003f8 = () => interopDefault(import('..\\pages\\privacy-policy.vue' /* webpackChunkName: "pages/privacy-policy" */))
const _2ab52ce8 = () => interopDefault(import('..\\pages\\profile.vue' /* webpackChunkName: "pages/profile" */))
const _a0aae9c4 = () => interopDefault(import('..\\pages\\proposals\\index.vue' /* webpackChunkName: "pages/proposals/index" */))
const _5b366319 = () => interopDefault(import('..\\pages\\referrals.vue' /* webpackChunkName: "pages/referrals" */))
const _438eb4d0 = () => interopDefault(import('..\\pages\\settings.vue' /* webpackChunkName: "pages/settings" */))
const _0d866ef6 = () => interopDefault(import('..\\pages\\signup.vue' /* webpackChunkName: "pages/signup" */))
const _f343fefe = () => interopDefault(import('..\\pages\\stingtst.vue' /* webpackChunkName: "pages/stingtst" */))
const _50bcbceb = () => interopDefault(import('..\\pages\\terms-conditions.vue' /* webpackChunkName: "pages/terms-conditions" */))
const _36b591f7 = () => interopDefault(import('..\\pages\\transaction-success.vue' /* webpackChunkName: "pages/transaction-success" */))
const _01580924 = () => interopDefault(import('..\\pages\\userrank.vue' /* webpackChunkName: "pages/userrank" */))
const _478fbc81 = () => interopDefault(import('..\\pages\\walletV1.vue' /* webpackChunkName: "pages/walletV1" */))
const _7aa8bbec = () => interopDefault(import('..\\pages\\yieldfarming.vue' /* webpackChunkName: "pages/yieldfarming" */))
const _96646f5e = () => interopDefault(import('..\\pages\\_username\\wallet.vue' /* webpackChunkName: "" */))
const _3d50c916 = () => interopDefault(import('..\\pages\\_username\\blog\\new.vue' /* webpackChunkName: "" */))
const _ab5c4bc0 = () => interopDefault(import('..\\pages\\_username\\videos\\new.vue' /* webpackChunkName: "" */))
const _29a07739 = () => interopDefault(import('..\\pages\\activity\\_username\\index.vue' /* webpackChunkName: "pages/activity/_username/index" */))
const _54b242f5 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
const _8fc417ac = () => interopDefault(import('..\\pages\\_username\\index.vue' /* webpackChunkName: "pages/_username/index" */))
const _3b476c27 = () => interopDefault(import('..\\pages\\_tag\\posts\\index.vue' /* webpackChunkName: "pages/_tag/posts/index" */))
const _5e979fc8 = () => interopDefault(import('..\\pages\\_username\\blog\\index.vue' /* webpackChunkName: "pages/_username/blog/index" */))
const _72c54a36 = () => interopDefault(import('..\\pages\\_username\\comments\\index.vue' /* webpackChunkName: "pages/_username/comments/index" */))
const _e0ced35c = () => interopDefault(import('..\\pages\\_username\\videos\\index.vue' /* webpackChunkName: "pages/_username/videos/index" */))
const _634de941 = () => interopDefault(import('..\\pages\\_username\\_permlink\\index.vue' /* webpackChunkName: "pages/_username/_permlink/index" */))
const _551ce206 = () => interopDefault(import('..\\pages\\_tag\\_username\\_permlink\\index.vue' /* webpackChunkName: "pages/_tag/_username/_permlink/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/3stest",
    component: _18b2b59f,
    name: "3stest___en"
  }, {
    path: "/3stest2",
    component: _0488b0ba,
    name: "3stest2___en"
  }, {
    path: "/activity",
    component: _8279d974,
    name: "activity___en"
  }, {
    path: "/auth",
    component: _304c9e55,
    name: "auth___en"
  }, {
    path: "/communities",
    component: _6c1b5398,
    name: "communities___en"
  }, {
    path: "/conduct",
    component: _f33078b2,
    name: "conduct___en"
  }, {
    path: "/consultants",
    component: _5863078a,
    name: "consultants___en"
  }, {
    path: "/delegators",
    component: _43692606,
    name: "delegators___en"
  }, {
    path: "/explore",
    component: _ec8f5514,
    name: "explore___en"
  }, {
    path: "/faq",
    component: _6bca89f9,
    name: "faq___en"
  }, {
    path: "/friends",
    component: _33d85378,
    name: "friends___en"
  }, {
    path: "/leaderboard",
    component: _da694040,
    name: "leaderboard___en"
  }, {
    path: "/login",
    component: _1e59e60c,
    name: "login___en"
  }, {
    path: "/market",
    component: _5a45b9a9,
    name: "market___en"
  }, {
    path: "/mods-access",
    component: _819b683a,
    name: "mods-access___en"
  }, {
    path: "/notifications",
    component: _fb940dea,
    name: "notifications___en"
  }, {
    path: "/ownership",
    component: _d396fcdc,
    name: "ownership___en"
  }, {
    path: "/password",
    component: _4581b748,
    name: "password___en"
  }, {
    path: "/privacy-policy",
    component: _4c1003f8,
    name: "privacy-policy___en"
  }, {
    path: "/profile",
    component: _2ab52ce8,
    name: "profile___en"
  }, {
    path: "/proposals",
    component: _a0aae9c4,
    name: "proposals___en"
  }, {
    path: "/referrals",
    component: _5b366319,
    name: "referrals___en"
  }, {
    path: "/settings",
    component: _438eb4d0,
    name: "settings___en"
  }, {
    path: "/signup",
    component: _0d866ef6,
    name: "signup___en"
  }, {
    path: "/stingtst",
    component: _f343fefe,
    name: "stingtst___en"
  }, {
    path: "/terms-conditions",
    component: _50bcbceb,
    name: "terms-conditions___en"
  }, {
    path: "/transaction-success",
    component: _36b591f7,
    name: "transaction-success___en"
  }, {
    path: "/userrank",
    component: _01580924,
    name: "userrank___en"
  }, {
    path: "/walletV1",
    component: _478fbc81,
    name: "walletV1___en"
  }, {
    path: "/yieldfarming",
    component: _7aa8bbec,
    name: "yieldfarming___en"
  }, {
    path: "/_username/wallet",
    component: _96646f5e,
    alias: "/wallet"
  }, {
    path: "/_username/blog/new",
    component: _3d50c916,
    alias: "/blog/new"
  }, {
    path: "/_username/videos/new",
    component: _ab5c4bc0,
    alias: "/videos/new"
  }, {
    path: "/activity/:username",
    component: _29a07739,
    name: "activity-username___en"
  }, {
    path: "/",
    component: _54b242f5,
    name: "index___en"
  }, {
    path: "/:username",
    component: _8fc417ac,
    name: "username___en"
  }, {
    path: "/:tag/posts",
    component: _3b476c27,
    name: "tag-posts___en"
  }, {
    path: "/:username/blog",
    component: _5e979fc8,
    name: "username-blog___en"
  }, {
    path: "/:username/comments",
    component: _72c54a36,
    name: "username-comments___en"
  }, {
    path: "/:username/videos",
    component: _e0ced35c,
    name: "username-videos___en"
  }, {
    path: "/:username/wallet",
    component: _96646f5e,
    name: "username-wallet___en"
  }, {
    path: "/:username/blog/new",
    component: _3d50c916,
    name: "username-blog-new___en"
  }, {
    path: "/:username/videos/new",
    component: _ab5c4bc0,
    name: "username-videos-new___en"
  }, {
    path: "/:username/:permlink",
    component: _634de941,
    name: "username-permlink___en"
  }, {
    path: "/:tag/:username?/:permlink?",
    component: _551ce206,
    name: "tag-username-permlink___en"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
