const pkg = require('./package')

// --- STEP 1: Import the language file to access its strings ---
const enTranslations = require('./lang/en_US.js')

// --- STEP 2: Create dynamic variables from the imported translations ---
const slogan = enTranslations.Slogan // "It Pays to be Fit"
const mainTitle = `Actifit - ${slogan}`
const mainDescription = `Signup to Actifit, the mobile dapp that incentivizes a healthy lifestyle. ${slogan}.`


const { I18N } = require('./config')

//load env file if present
import * as dotenv from 'dotenv'
dotenv.config()

module.exports = {
  mode: 'universal',

  // Runtime configuration
  publicRuntimeConfig: {
    version: '1.8.1',
    proposalId: '337',
  },


  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        path: '/_username/videos/new',
        alias: '/videos/new',
        component: resolve(__dirname, 'pages/_username/videos/new.vue')
      }),
        routes.push({
          path: '/_username/blog/new',
          alias: '/blog/new',
          component: resolve(__dirname, 'pages/_username/blog/new.vue')
        }),
        // Route for a specific user's wallet (e.g., /mcfarhat/wallet)
        // Corrected _username to :username for standard syntax
        routes.push({
          name: 'wallet-user', // Added a unique name for clarity
          path: '/:username/wallet',
          component: resolve(__dirname, 'pages/_username/wallet.vue')
        }),

        // ADD THIS NEW ROUTE
        // This handles the path for the logged-in user's own wallet (e.g., /wallet)
        routes.push({
          name: 'wallet-self', // Added a unique name
          path: '/wallet',
          component: resolve(__dirname, 'pages/_username/wallet.vue') // Use the same component
        })
    }
  },
  /*router: {
    base: '/'
  },*/
  // --- STEP 3: Update the env block to use the dynamic variables ---
  env: {
    sec_img_upl: process.env.SEC_IMG_UPL_KEY,
    auth_Key: process.env.DEEPL_WEB_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    swap_partner: 'actifit.swap',
    swap_to_token: 'AFIT',
    partner_fee: '1',
    scRedirectUrl: process.env.SC_REDIRECT_URL || 'http://localhost:3000/auth',
    CREATE_ACCOUNT_API_KEY: process.env.CREATE_ACCOUNT_API_KEY,
    REWARD_REFERRAL_API_KEY: process.env.REWARD_REFERRAL_API_KEY,
    DELEGATE_ACCOUNT_API_KEY: process.env.DELEGATE_ACCOUNT_API_KEY,
    confirmPaymentToken: process.env.CONFIRM_PAYMENT_API_KEY,
    webEditToken: process.env.WEB_EDIT_REWARD_KEY,
    webVoteToken: process.env.WEB_VOTE_REWARD_KEY,
    webCommentToken: process.env.WEB_COMMENT_REWARD_KEY,
    maxTagDisplay: 10,
    captchaV3Key: '6LchW94ZAAAAAOjLg0G_0AiRgHrlBfbP_HrReBBE',
    poshVerificationUrl: 'https://hiveposh.com/api/v0/twitter/',
    socialSharingHashtags: 'actifit,hive,move2earn,health,fitness',
    // --- MODIFIED ---
    slogan: slogan,
    socialSharingTitle: mainTitle,
    socialSharingDesc: mainDescription,
    socialSharingQuote: mainDescription, // Using the new consistent description
    // --- END MODIFICATION ---
    web3Node: 'https://bsc-dataseed1.binance.org:443',
    afitTokenBSC: '0x4516bb582f59befcbc945d8c2dac63ef21fba9f6',
    afitxTokenBSC: '0x246d22ff6e0b90f80f2278613e8db93ff7a09b95',
    afitBNBLPTokenBSC: '0xffff75bb7bf133a9e98bc62665f20a84e152b689',
    afitxBNBLPTokenBSC: '0x150c81246df4e31847a613e18cab5ef601ca265a',
    hiveStandardPostUrl: 'https://images.hive.blog/0x0/',
    steemImgUrl: 'https://steemitimages.com',
    hiveImgUrl: 'https://images.hive.blog',
    steemApiNode: 'https://api.steemit.com/',
    hiveApiNode: 'https://api.hive.blog',//'https://hiveapi.actifit.io',//'https://anyx.io', 'https://hiveapi.actifit.io', //https://api.hive.blog
    blurtApiNode: 'https://blurtrpc.actifit.io', //'https://blurt-rpc.saboin.com', //'http://164.68.116.86/', //'https://blurt-rpc.saboin.com/', //
    hiveStateApiNode: 'https://api.deathwing.me',
    hiveTestNode: 'https://testnet.openhive.network', //'https://api.fake.openhive.network',
    altHiveNodes: ["https://api.hive.blog", "https://api.deathwing.me", "https://api.openhive.network", "https://hiveapi.actifit.io", "https://hived.privex.io", "https://api.deathwing.me", "https://rpc.ausbit.dev", "https://hive-api.arcange.eu", "https://hive.roelandp.nl", "https://anyx.io",],
    actiAppUrl: process.env.ACTI_API_URL || 'http://localhost:3120/',
    actiAppBackUrl: process.env.ACTI_API_BACK_URL || 'http://localhost:3120/',
    steemEngineRpc: 'https://api.steem-engine.net/rpc',
    hiveEngineRpc: process.env.HIVE_ENG_RPC_NODE, //'https://api.hive-engine.com/rpc/', //https://herpc.actifit.io', //'https://mirrorengine.rishipanthee.com', //'https://engine.rishipanthee.com/',
    steemEngineScot: 'https://scot-api.steem-engine.net/',
    hiveEngineChainId: 'ssc-mainnet-hive', //'ssc-testnet-hive', //
    hiveTestNetOn: false,
    bscBridgeAccount: 'actifit.bridge',
    threeSpeakApi: 'https://3speak.tv/apiv2/feeds/',
    threeSpeakApiVidCount: 'https://3speak.tv/apiv2/feeds/@_USERNAME_/count',
    threeSpeakApiSession: 'https://studio.3speak.tv/mobile/login?username=_USERNAME_',
    threeSpeakUploadInfo: 'https://studio.3speak.tv/mobile/api/upload_info',
    threeSpeakUserVideoList: 'https://studio.3speak.tv/mobile/api/my-videos',
    threeSpeakCDN: 'https://ipfs-3speak.b-cdn.net/ipfs',
    splinter_api_url_user_collections: "https://api.splinterlands.com/cards/collection/_USERNAME_",
    splinter_api_all_cards: "https://api.splinterlands.com/cards/get_details",
    hiveEngineScotParam: '?hive=1',
    minSignupUSDCost: 2,
    minAfitBuyEarnTicket: 1000,
    minAfitBSCTransfer: 50,
    maxAfitBSCTransfer: 50000,
    afitHBDBridgeRate: 0.0001,
    notificationsCutoff: 2000,
    maxPostCount: 20,//maximum number of posts to return per query
    shortModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator</sub>',
    standardModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator <br/>Vote for [Actifit as a Witness](https://hivesigner.com/sign/account-witness-vote?witness=actifit&approve=true) <br/>Delegate to Actifit [10SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10%20SP)| [20SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20%20SP)| [50SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50%20SP)| [100SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=100%20SP)| [250SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=250%20SP)| [500SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=500%20SP)| [1000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=1000%20SP)| [5000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=5000%20SP)| [10000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10000%20SP)| [20000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20000%20SP)| [Custom Amount](https://steembottracker.com/delegation.html?delegatee=actifit) <br/>Chat with us on [discord](https://discord.gg/aHtcA6r) | Visit our [website](https://actifit.io/) <br/>[Download on playstore](https://bit.ly/actifit-app) | [Download on app store](https://bit.ly/actifit-ios)[FAQs](https://actifit.io/@katerinaramm/actifit-app-or-rewarding-fitness-activity-with-tokens-and-steemit-upvotes-faqs) | [Text Tutorial](https://actifit.io/@katerinaramm/tutorial-for-actifit-app-update-november-2018-version-v0-5-0) | [Video Tutorial](https://youtu.be/tqkaDoonyvI)</sub>',
    actifitMarketBuy: 'actifit.market',
    actifitEscrow: 'actifit.escrow',
    actifitVault: 'actifit.vault',
    exchangesList: [
      {
        "name": "binance",
        "address": "bdhivesteem"
      },
      {
        "name": "Gate.io",
        "address": "gateiodeposit"
      },
      {
        "name": "Bitget",
        "address": "bitgethive"
      },
      {
        "name": "HTX",
        "address": "huobi-pro"
      },
      {
        "name": "Bithumb",
        "address": "user.dunamu"
      },
      {
        "name": "MEXC",
        "address": "mxchive"
      },
      {
        "name": "Probit",
        "address": "probithive"
      }

    ],
    hiveAppsScript: {
      "hiveblog": {
        "name": "Hive blog",
        "homepage": "https://hive.blog",
        "url_scheme": "https://hive.blog/{category}/@{username}/{permlink}"
      },
      "peakd": {
        "name": "PeakD",
        "homepage": "https://peakd.com",
        "url_scheme": "https://peakd.com/{category}/@{username}/{permlink}"
      },
      "actifit": {
        "name": "Actifit",
        "homepage": "https://actifit.io",
        "url_scheme": "https://actifit.io/@{username}/{permlink}"
      },
      "travelfeed": {
        "name": "TravelFeed",
        "homepage": "https://travelfeed.com",
        "url_scheme": "https://travelfeed.com/@{username}/{permlink}"
      },
      "3speak": {
        "name": "3Speak",
        "homepage": "https://3speak.tv",
        "url_scheme": "https://3speak.tv/watch?v={username}/{permlink}"
      },
      "ecency": {
        "name": "Ecency",
        "homepage": "https://ecency.com",
        "url_scheme": "https://ecency.com/{category}/@{username}/{permlink}"
      },
      "leofinance": {
        "name": "Leofinance",
        "homepage": "https://leofinance.io",
        "url_scheme": "https://leofinance.io/{category}/@{username}/{permlink}",
      }
    },
    steemAppsScript: {

    }
  },

  render: {
    static: {
      setHeaders(res) {
        res.setHeader('X-Frame-Options', 'ALLOWALL')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET')
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      }
    }
  },

  /*
  ** Headers of the page
  */
  // --- STEP 4: Update the head block to use the dynamic variables ---
  head: {
    // --- MODIFIED ---
    title: mainTitle,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // Now uses the new consistent description
      { hid: 'description', name: 'description', 'property': 'description', content: mainDescription },
      // Now uses the new consistent title
      { hid: 'title', name: 'og:title', 'property': 'og:title', content: mainTitle },
      // Now uses the new consistent description
      { hid: 'ogdescription', name: 'og:description', 'property': 'og:description', content: mainDescription },
      { hid: 'url', name: 'og:url', 'property': 'og:url', content: 'https://actifit.io' },
      { name: 'og:type', 'property': 'og:type', content: 'website' },
      { hid: 'image', name: 'og:image', 'property': 'og:image', content: 'https://actifit.io/img/actifit_logo_med.png' },
      { name: 'google-site-verification', content: 'Dv3mVaav2x5_2FauDB6MRjixVtVVWPfjUekWwKY-Tnc' },
      { name: 'fb:app_id', 'property': 'fb:app_id', content: '651065985331472' },
    ],
    // --- END MODIFICATION ---
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/actifit_logo.png' },
      //{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },

      { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' }
    ],
    script: [
      { src: 'https://code.jquery.com/jquery-3.2.1.slim.min.js' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js' },
      { src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js' },
      // Google tag (gtag.js)
      /*{ src: 'https://www.googletagmanager.com/gtag/js?id=G-HPZKPFM9GK',
      async:true,
      script: { children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-HPZKPFM9GK');
        `,
          }
      },*/
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#FFFFFF' },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/main.sass',
    '~/assets/css/normal.css',
    '~/assets/css/dark-mode.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/vue-steemconnect',
    { src: '~plugins/ga.js', ssr: false },
    { src: '~plugins/vue-carousel', ssr: false },
    { src: '~plugins/vue-notification', ssr: false },
    { src: '~plugins/vue-simplemde', ssr: false },
    { src: '~plugins/v-lightbox', mode: 'client' },
    { src: '@/plugins/vue-mavon-editor', ssr: false },
    { src: '~plugins/vue-custom.js' },
    { src: '~/plugins/dark-mode.js' },
    { src: '~/plugins/commonCardMixin.js', mode: 'client' }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    'nuxt-helmet',
    '@nuxtjs/gtm',
    //['@nuxtjs/axios'],
    '@nuxtjs/i18n',
    '@nuxtjs/proxy',
    ['@nuxtjs/google-adsense', {
      id: 'ca-pub-2770948859841315',
      pageLevelAds: true
    }],
  ],
  i18n: {
    // This is the directory where you will create your language files
    langDir: '~/lang/',

    // Define all your languages here
    locales: [
      { code: 'en', name: 'English', file: 'en_US.js' },
      { code: 'es', name: 'Español', file: 'es_ES.js' },
      { code: 'de', name: 'German', file: 'de_DE.js' },
      { code: 'pl', name: 'Polski', file: 'pl_PL.js' },
      { code: 'hi', name: 'हिन्दी', file: 'hi_IN.js' },
      { code: 'it', name: 'Italiano', file: 'it_IT.js' },
      { code: 'fr', name: 'Français', file: 'fr_FR.js' },
      { code: 'pt', name: 'Português', file: 'pt_PT.js' },
      { code: 'zh', name: '中文', file: 'zh_CN.js' },
      { code: 'tr', name: 'Türkçe', file: 'tr_TR.js' },
      { code: 'uk', name: 'Українська', file: 'uk_UA.js' },
      { code: 'ru', name: 'Русский', file: 'ru_RU.js' },
      { code: 'ja', name: '日本語', file: 'ja_JP.js' },
      { code: 'ar', name: 'العربية', file: 'ar_AE.js', dir: 'rtl' }
    ],

    // The default language of your website
    defaultLocale: 'en',


    // Automatically detect the user's browser language
    // ...inside your i18n configuration...
    detectBrowserLanguage: false,

    vueI18n: {
      fallbackLocale: 'en',
    },
  },

  gtm: {
    id: 'G-HPZKPFM9GK', // Used as fallback if no runtime config is provided
  },

  "browserslist": [
    "defaults",
    "not dead"
  ],
  /*"browserslist": {
    "defaults"
  },*/

  /*helmet: {

    dnsPrefetchControl: false,
    expectCt: false,
    featurePolicy: false,
    frameguard: false,
    hidePoweredBy: false,
    hsts: false,
    ieNoOpen: false,
    noCache: false,
    noSniff: false,
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
    xssFilter: false,

 },*/
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {

        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      /*if (ctx.isClient){
        config.resolve.alias['axios'] = require.resolve('axios/dist/browser/axios.cjs');
      }*/

      config.node = {
        fs: 'empty'
      }
    },
    //fixes issue with hive-auth-wrapper plugin integration
    transpile: ['hive-auth-wrapper', 'sanitize-html']

  }
}
