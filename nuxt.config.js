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
	actiAppUrl: process.env.ACTI_API_URL || 'http://localhost:3120/',
	steemEngineRpc: 'https://api.steem-engine.com/rpc',
	steemEngineScot: 'https://scot-api.steem-engine.com/',
	standardModeratorSignature: '<br/>![rulersig2.jpg](https://cdn.steemitimages.com/DQmXrZz658YfMQBXNTA12rmbzqWXASfaGcNSqatJJ2ba7NR/rulersig2.jpg)<sub>@Actifit Moderator <br/>Vote for [Actifit as a Witness](https://steemconnect.com/sign/account-witness-vote?witness=actifit&approve=1) <br/>Delegate to Actifit [10SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10%20SP)| [20SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20%20SP)| [50SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=50%20SP)| [100SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=100%20SP)| [250SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=250%20SP)| [500SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=500%20SP)| [1000SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=1000%20SP)| [5000SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=5000%20SP)| [10000SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=10000%20SP)| [20000SP](https://steemconnect.com/sign/delegateVestingShares?delegatee=actifit&vesting_shares=20000%20SP)| [Custom Amount](https://steembottracker.com/delegation.html?delegatee=actifit) <br/>Chat with us on [discord](https://discord.gg/aHtcA6r) | Visit our [website](https://actifit.io/) <br/>[Download on playstore](https://bit.ly/actifit-app) | [Download on app store](https://bit.ly/actifit-ios)[FAQs](https://steemit.com/actifit/@katerinaramm/actifit-app-or-rewarding-fitness-activity-with-tokens-and-steemit-upvotes-faqs) | [Text Tutorial](https://steemit.com/utopian-io/@katerinaramm/tutorial-for-actifit-app-update-november-2018-version-v0-5-0) | [Video Tutorial](https://youtu.be/tqkaDoonyvI)</sub>',
  },

  /*
  ** Headers of the page
  */
  head: {
    title: 'Actifit - Rewarding Your Everyday Activity',
    meta: [
	  { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', 'property': 'description', name: 'description', content: pkg.description },
	  { hid: 'title', 'property':'og:title', name: 'og:title', content: 'Actifit - Rewarding Your Everyday Activity'},
	  { hid: 'ogdescription', 'property':'og:description', name: 'og:description', content: pkg.description},
      { hid: 'url', 'property':'og:url', name: 'og:url', content: 'https://actifit.io'},
	  { 'property':'og:type', name: 'og:type', content: 'website'},
	  { hid: 'image', 'property':'og:image', name: 'og:image', content: 'https://actifit.io/img/actifit_logo_med.png'},
	  { name: 'google-site-verification', content:'Dv3mVaav2x5_2FauDB6MRjixVtVVWPfjUekWwKY-Tnc' },
	  { 'property': 'fb:app_id', name: 'fb:app_id', content: '651065985331472'},
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
