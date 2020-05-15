const pkg = require('./package')

const { I18N } = require('./config')

module.exports = {
  mode: 'universal',
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
	steemApiNode: 'https://api.steemit.com/',
	hiveApiNode: 'https://hived.privex.io',
	hiveStateApiNode: 'https://anyx.io',
	altHiveNodes: ["https://api.openhive.network", "https://anyx.io", "https://api.hivekings.com", "https://api.hive.blog/", "https://hived.privex.io"],
	actiAppUrl: process.env.ACTI_API_URL || 'http://localhost:3120/',
	steemEngineRpc: 'https://api.steem-engine.com/rpc',
	hiveEngineRpc: 'https://api.hive-engine.com/rpc',
	steemEngineScot: 'https://scot-api.steem-engine.com/',
	hiveEngineScotParam: '?hive=1',
	minSignupUSDCost: 2,
	shortModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator</sub>',
	standardModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator <br/>Vote for [Actifit as a Witness](https://hivesigner.com/sign/account-witness-vote?witness=actifit&approve=true) <br/>Delegate to Actifit [10SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10%20SP)| [20SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20%20SP)| [50SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50%20SP)| [100SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=100%20SP)| [250SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=250%20SP)| [500SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=500%20SP)| [1000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=1000%20SP)| [5000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=5000%20SP)| [10000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10000%20SP)| [20000SP](https://hivesigner.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20000%20SP)| [Custom Amount](https://steembottracker.com/delegation.html?delegatee=actifit) <br/>Chat with us on [discord](https://discord.gg/aHtcA6r) | Visit our [website](https://actifit.io/) <br/>[Download on playstore](https://bit.ly/actifit-app) | [Download on app store](https://bit.ly/actifit-ios)[FAQs](https://actifit.io/@katerinaramm/actifit-app-or-rewarding-fitness-activity-with-tokens-and-steemit-upvotes-faqs) | [Text Tutorial](https://actifit.io/@katerinaramm/tutorial-for-actifit-app-update-november-2018-version-v0-5-0) | [Video Tutorial](https://youtu.be/tqkaDoonyvI)</sub>',
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
		"url_scheme": "https://actifit.io/@{username}/{permlink}"
	  },
	  "travelfeed": {
		"name": "TravelFeed",
		"homepage": "https://travelfeed.io",
		"url_scheme": "https://travelfeed.io/@{username}/{permlink}"
	  },
	  "3speak": {
		"name": "3Speak",
		"homepage": "https://3speak.online",
		"url_scheme": "https://3speak.online/watch?v={username}/{permlink}"
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
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.1.0/css/all.css' },
      { rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' }
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
    '~/assets/css/main.sass'
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
    { src: '~plugins/steem-editor', ssr: false },
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    ['nuxt-i18n', I18N],
	['@nuxtjs/google-adsense', {
      id: 'ca-pub-2770948859841315',
	  pageLevelAds: true
    }]
  ],

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
    }
	
  }
}
