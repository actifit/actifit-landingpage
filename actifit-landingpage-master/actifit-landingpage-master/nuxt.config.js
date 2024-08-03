const pkg = require('./package')

const { I18N } = require('./config')

//load env file if present
import * as dotenv from 'dotenv'
dotenv.config()

module.exports = {
  mode: 'universal',
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
	  routes.push({
        path: '/_username/wallet',
        alias: '/wallet',
        component: resolve(__dirname, 'pages/_username/wallet.vue')
      })
    }
  },
  /*router: {
    base: '/'
  },*/
  env: {
    scRedirectUrl: process.env.SC_REDIRECT_URL || 'http://localhost:3000/auth',
	AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
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
	socialSharingTitle: 'Actifit - Rewarding Your Everyday Activity',
	socialSharingDesc: 'Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity ',
	socialSharingQuote: 'Signup to Actifit, the mobile dapp that incentivizes healthy lifestyle and rewards your everyday activity',
	afitTokenBSC: '0x4516bb582f59befcbc945d8c2dac63ef21fba9f6',
	afitxTokenBSC: '0x246d22ff6e0b90f80f2278613e8db93ff7a09b95',
	afitBNBLPTokenBSC: '0xffff75bb7bf133a9e98bc62665f20a84e152b689',
	afitxBNBLPTokenBSC: '0x150c81246df4e31847a613e18cab5ef601ca265a',
	steemImgUrl: 'https://steemitimages.com',
	hiveImgUrl: 'https://images.hive.blog',
	steemApiNode: 'https://api.steemit.com/',
	hiveApiNode: 'https://hiveapi.actifit.io', //'https://api.hive.blog',//'https://anyx.io',
	blurtApiNode: 'https://blurtrpc.actifit.io', //'https://blurt-rpc.saboin.com', //'http://164.68.116.86/', //'https://blurt-rpc.saboin.com/', //
	hiveStateApiNode: 'https://api.deathwing.me',
	hiveTestNode: 'https://testnet.openhive.network', //'https://api.fake.openhive.network',
	altHiveNodes: ["https://api.hive.blog", "https://api.deathwing.me", "https://api.openhive.network", "https://hiveapi.actifit.io", "https://hived.privex.io", "https://api.deathwing.me", "https://rpc.ausbit.dev", "https://hive-api.arcange.eu", "https://hive.roelandp.nl", "https://anyx.io",],
	actiAppUrl:  "https://api.actifit.io/" ,
	actiAppBackUrl: process.env.ACTI_API_BACK_URL || 'http://localhost:3120/',
	steemEngineRpc: 'https://api.steem-engine.net/rpc',
	hiveEngineRpc: 'https://herpc.actifit.io', //'https://mirrorengine.rishipanthee.com', //'https://engine.rishipanthee.com/',
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
	shortModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator</sub>',
	standardModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator <br/>Vote for [Actifit as a Witness](https://hivesigner.com/sign/account-witness-vote?witness=actifit&approve=true) <br/>Delegate to Actifit [10SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10%20SP)| [20SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20%20SP)| [50SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50%20SP)| [100SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=100%20SP)| [250SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=250%20SP)| [500SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=500%20SP)| [1000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=1000%20SP)| [5000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=5000%20SP)| [10000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10000%20SP)| [20000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20000%20SP)| [Custom Amount](https://steembottracker.com/delegation.html?delegatee=actifit) <br/>Chat with us on [discord](https://discord.gg/aHtcA6r) | Visit our [website](https://actifit.io/) <br/>[Download on playstore](https://bit.ly/actifit-app) | [Download on app store](https://bit.ly/actifit-ios)[FAQs](https://actifit.io/@katerinaramm/actifit-app-or-rewarding-fitness-activity-with-tokens-and-steemit-upvotes-faqs) | [Text Tutorial](https://actifit.io/@katerinaramm/tutorial-for-actifit-app-update-november-2018-version-v0-5-0) | [Video Tutorial](https://youtu.be/tqkaDoonyvI)</sub>',
	actifitMarketBuy: 'actifit.market',
	actifitEscrow: 'actifit.escrow',
	actifitVault: 'actifit.vault',
	hiveAppsScript: {
	  "hiveblog": {
		"name": "Hive blog",
		"homepage": "https://hive.blog",
		"url_scheme": "https://hive.blog/{category}/@{username}/{permlink}"
	  },
	  "esteem": {
		"name": "Esteem",
		"homepage": "https://esteem.app",
		"url_scheme": "https://esteem.app/{category}/@{username}/{permlink}"
	  },
	  "peakd": {
		"name": "PeakD",
		"homepage": "https://peakd.com",
		"url_scheme": "https://peakd.com/{category}/@{username}/{permlink}"
	  },
	  "steempress": {
		"name": "SteemPress",
		"homepage": "https://wordpress.org/plugins/steempress/"
	  },
	  "actifit": {
		"name": "Actifit",
		"homepage": "https://actifit.io",
		"url_scheme": "https://actifit.io/@{username}/{permlink}",
		"api_endpoints": {
			primary: "https://api.actifit.io",
			secondary: "https://api2.actifit.io"
		  }
	  },
	  "travelfeed": {
		"name": "TravelFeed",
		"homepage": "https://travelfeed.io",
		"url_scheme": "https://travelfeed.io/@{username}/{permlink}"
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
	  "steemit": {
		"name": "Steemit",
		"homepage": "https://steemit.com",
		"url_scheme": "https://steemit.com/{category}/@{username}/{permlink}"
	  },
	  "appics": {
		"name": "APPICS",
		"homepage": "https://appics.com"
	  },
	  "busy": {
		"name": "Busy",
		"homepage": "https://busy.org",
		"url_scheme": "https://busy.org/@{username}/{permlink}"
	  },
	  "bsteem": {
		"name": "bSteem",
		"homepage": "http://bsteem.com"
	  },
	  "esteem": {
		"name": "eSteem",
		"homepage": "https://esteem.app",
		"url_scheme": "https://esteem.app/@{username}/{permlink}"
	  },
	  "fundition": {
		"name": "Fundition",
		"homepage": "https://fundition.io",
		"url_scheme": "https://fundition.io/#!/@{username}/{permlink}"
	  },
	  "chainbb": {
		"name": "chainBB",
		"homepage": "https://chainbb.com",
		"url_scheme": "https://chainbb.com/{category}/@{username}/{permlink}"
	  },
	  "utopian": {
		"name": "Utopian",
		"homepage": "https://utopian.io",
		"url_scheme": "https://utopian.io/{category}/@{username}/{permlink}"
	  },
	  "dtube": {
		"name": "DTube",
		"homepage": "https://d.tube",
		"url_scheme": "https://d.tube/#!/v/{username}/{permlink}"
	  },
	  "dlive": {
		"name": "DLive",
		"homepage": "https://www.dlive.io",
		"url_scheme": "https://www.dlive.io/#/livestream/{username}/{permlink}"
	  },
	  "dmania": {
		"name": "dMania",
		"homepage": "https://dmania.lol",
		"url_scheme": "https://dmania.lol/post/{username}/{permlink}"
	  },
	  "dsound": {
		"name": "DSound",
		"homepage": "https://dsound.audio",
		"url_scheme": "https://dsound.audio/#/@{username}/{permlink}"
	  },
	  "steepshot": {
		"name": "Steepshot",
		"homepage": "https://steepshot.io",
		"url_scheme":
		  "https://alpha.steepshot.io/post/{category}/@{username}/{permlink}"
	  },
	  "zappl": {
		"name": "Zappl",
		"homepage": "https://zappl.com",
		"url_scheme": "https://zappl.com/{category}/{username}/{permlink}"
	  },
	  "partiko": {
		"name": "Partiko",
		"homepage": "https://partiko.app"
	  },
	  "steemkr": {
		"name": "Steemkr",
		"homepage": "https://steemkr.com",
		"url_scheme": "https://steemkr.com/{category}/@{username}/{permlink}"
	  },
	  "steemjs": {
		"name": "Steem.js",
		"homepage": "https://github.com/steemit/steem-js"
	  },
	  "steempeak": {
		"name": "SteemPeak",
		"homepage": "https://steempeak.com",
		"url_scheme": "https://steempeak.com/{category}/@{username}/{permlink}"
	  },
	  "steempress": {
		"name": "SteemPress",
		"homepage": "https://wordpress.org/plugins/steempress/"
	  },
	  "strimi": {
		"name": "Strimi",
		"homepage": "https://strimi.pl",
		"url_scheme": "https://strimi.pl/{category}/@{username}/{permlink}"
	  },
	  "steemhunt": {
		"name": "Steemhunt",
		"homepage": "https://steemhunt.com",
		"url_scheme": "https://steemhunt.com/@{username}/{permlink}"
	  },
	  "memeit.lol": {
		"name": "Memeit.LOL",
		"homepage": "https://memeit.lol",
		"url_scheme": "https://memeit.lol/@{username}/{permlink}"
	  },
	  "steemia": {
		"name": "Steemia",
		"homepage": "https://steemia.io"
	  },
	  "tasteem": {
		"name": "Tasteem",
		"homepage": "https://tasteem.io"
	  },
	  "travelfeed": {
		"name": "TravelFeed",
		"homepage": "https://travelfeed.io",
		"url_scheme": "https://travelfeed.io/@{username}/{permlink}"
	  },
	  "hede": {
		"name": "Hede.io",
		"homepage": "https://hede.io",
		"url_scheme": "https://hede.io/hede-io/@{username}/{permlink}"
	  },
	  "actifit": {
		"name": "Actifit",
		"homepage": "https://actifit.io",
		"url_scheme": "https://actifit.io/@{username}/{permlink}"
	  },
	  "ulogs": {
		"name": "Ulogs",
		"homepage": "https://ulogs.org",
		"url_scheme": "https://ulogs.org/@{username}/{permlink}"
	  },
	  "musing": {
		"name": "Musing",
		"homepage": "https://musing.io",
		"url_scheme": "https://musing.io/q/{username}/{permlink}"
	  },
	  "guc-desktop": {
		"name": "GUC"
	  }
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
  head: {
    title: 'Actifit - Rewarding Your Everyday Activity',
    meta: [
	  { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', 'property': 'description', content: pkg.description },
	  { hid: 'title', name: 'og:title', 'property':'og:title', content: 'Actifit - Rewarding Your Everyday Activity'},
	  { hid: 'ogdescription', name: 'og:description', 'property':'og:description', content: pkg.description},
      { hid: 'url', name: 'og:url', 'property':'og:url', content: 'https://actifit.io'},
	  { name: 'og:type', 'property':'og:type', content: 'website'},
	  { hid: 'image', name: 'og:image', 'property':'og:image', content: 'https://actifit.io/img/actifit_logo_med.png'},
	  { name: 'google-site-verification', content:'Dv3mVaav2x5_2FauDB6MRjixVtVVWPfjUekWwKY-Tnc' },
	  { name: 'fb:app_id', 'property': 'fb:app_id', content: '651065985331472'},
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/img/actifit_logo.png' },
      //{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.14.0/css/all.min.css' },
	  { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' },
	  { rel:'stylesheet', href:'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'},
      { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' },
	  { rel:'stylesheet', href:'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'}
    ],
    script: [
      { src: 'https://code.jquery.com/jquery-3.2.1.slim.min.js' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js' },
      { src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js' },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js' }
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
	//{ src: '~plugins/ga.js', ssr: false },
    { src: '~plugins/vue-carousel', ssr: false },
    { src: '~plugins/vue-notification', ssr: false },
    { src: '~plugins/vue-simplemde', ssr: false },
	{ src: '~plugins/vue-sanitize', ssr: false },
	{ src: '~plugins/v-lightbox', mode: 'client' },
	{ src: '@/plugins/vue-mavon-editor', ssr: false },
	{ src: '~plugins/vue-custom.js'},
	{ src: '~/plugins/dark-mode.js'},
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
	'nuxt-helmet',
	'@nuxtjs/gtm',
	//['@nuxtjs/axios'],
    ['nuxt-i18n', I18N],
	['@nuxtjs/google-adsense', {
      id: 'ca-pub-2770948859841315',
	  pageLevelAds: true
    }],
  ],
  
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
	  
		config.node = {
            fs: 'empty'
        }
    },
	//fixes issue with hive-auth-wrapper plugin integration
	transpile: ['hive-auth-wrapper']
	
  }
}
