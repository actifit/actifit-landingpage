const pkg = require('./package')

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
	actiAppUrl: process.env.ACTI_API_URL || 'http://localhost:3120/',
  },

  /*
  ** Headers of the page
  */
  head: {
    title: 'Actifit - Rewarding Your Everyday Activity',
    meta: [
	  { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', property: 'description', content: pkg.description },
	  { name: 'og:title', property:'og:title', content: 'Actifit - Rewarding Your Everyday Activity'},
	  { name: 'og:description', property:'og:description', content: pkg.description},
      { name: 'og:url', property:'og:url', content: 'https://actifit.io'},
	  { name: 'og:type', property:'og:type', content: 'website'},
	  { name: 'og:image', property:'og:image', content: 'https://actifit.io/img/actifit_logo_med.png'},
	  { name: 'google-site-verification', content:'Dv3mVaav2x5_2FauDB6MRjixVtVVWPfjUekWwKY-Tnc' },
	  { name: 'fb:app_id', property: 'fb:app_id', content: '651065985331472'},
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
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
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
