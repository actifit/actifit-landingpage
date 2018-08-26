const pkg = require('./package')

module.exports = {
  mode: 'universal',
  env: {
    scRedirectUrl: process.env.SC_REDIRECT_URL || 'http://localhost:3000/auth',
  },

  /*
  ** Headers of the page
  */
  head: {
    title: 'Actifit Fitness Tracker - Rewarding Fitness Activity',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
	  { hid: 'og:title', name:'og:title', content: 'Actifit - Rewarding Fitness Activity'},
	  { hid: 'og:description', name:'og:description', content: 'Actifit is an innovative dapp that aims to incentivize fitness and healthy lifestyle via rewarding daily activity.'},
      { hid: 'og:url', name:'og:url', content: 'https://actifit.io'},
	  { hid: 'og:type', name:'og:type', content: 'website'},
	  { hid: 'og:image', name:'og:image', content: 'https://actifit.io/img/actifit_logo.png'},
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
    }
  }
}
