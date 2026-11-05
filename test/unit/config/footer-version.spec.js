// The footer must show OUR version. Production showed 2.18.1 (Nuxt's own version):
// Nuxt replaces a runtime-config value with an environment variable of the same name,
// and pm2 puts `version` (taken from the package.json of the script it runs, which is
// Nuxt's bin) into the environment. This loads the config the way `nuxt start` does,
// with that variable set, in a child process so jest's module system is not involved.
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '../../..')
const ourVersion = require(path.join(root, 'package.json')).version

function loadPublicConfig (env) {
  const script = "require('@nuxt/config').loadNuxtConfig({ rootDir: process.cwd() })" +
    '.then(c => process.stdout.write(JSON.stringify(c.publicRuntimeConfig)))'
  const out = execFileSync(process.execPath, ['-e', script], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8'
  })
  return JSON.parse(out)
}

describe('footer version', () => {
  it('comes from our package.json even when pm2 sets `version` in the environment', () => {
    const config = loadPublicConfig({ version: '2.18.1' })
    expect(config.appVersion).toBe(ourVersion)
  }, 30000)

  it('is what the footer renders', () => {
    const footer = fs.readFileSync(path.join(root, 'components/NewFooterDesign.vue'), 'utf8')
    expect(footer).toContain('{{ $config.appVersion }}')
    expect(footer).not.toContain('$config.version')
  })
})
