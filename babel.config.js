// Test-scoped Babel config.
//
// IMPORTANT: Only the `env.test` block is populated. Nuxt's webpack build runs
// babel with envName "client"/"server"/"modern" (never "test"), so this file
// contributes NOTHING to the production build — Nuxt keeps using its own
// @nuxt/babel-preset-app. Jest sets NODE_ENV/BABEL_ENV to "test", which
// activates the preset below so Jest can transform our ESM source.
module.exports = {
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    }
  }
}
