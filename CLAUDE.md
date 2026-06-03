# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps (triggers patch-package on postinstall)
npm run dev          # dev server on localhost:3000
npm run build        # production build
npm run start        # start production server
npm run generate     # static site generation
npm run lint         # ESLint on .js/.vue files
npm test             # Jest: unit + store + component tests
npm run test:watch   # Jest in watch mode
npm run test:coverage # Jest with coverage report
npm run test:e2e     # Playwright E2E (needs `npx playwright install chromium` first)
```

## Testing

Layered strategy — see `test/README.md` for full details.

- **Jest** (`jest@27` + `@vue/vue2-jest@27` + `@vue/test-utils@1`) for unit, Vuex
  store, and Vue 2 component tests. Test files: `test/**/*.spec.js`.
- **Playwright** (`@playwright/test@1.40`) for browser E2E in `e2e/**`, driving the
  real dev server on login-free critical paths.
- `babel.config.js` only fills an `env.test` block, so it is a **no-op for the
  Nuxt production build** (Nuxt never uses envName `test`). Do not add top-level
  presets/plugins there.
- Jest mock factories must prefix referenced vars with `mock` (Jest hoisting rule).
- Many store actions never call `resolve()` but `commit` asynchronously — tests
  fire the action and flush the microtask queue rather than awaiting it.
- **Prod/deploy:** set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` in the DigitalOcean app
  env so `npm ci` does not download browser binaries on every deploy.

## Node.js Version

Node.js **v16** is required (pinned in `.nvmrc` as v16.20.2). The project uses `package-lock.json` — ignore any `yarn` commands in the README.

## Architecture

**Nuxt.js v2** in universal/SSR mode with Vue 2 and Vuex. Pages live in `pages/` and follow Nuxt file-based routing; dynamic segments use `_param` naming (e.g., `pages/_username/`). Layouts are minimal — a single `layouts/default.vue` wrapper.

**Vuex store** is flat (not namespaced modules except for the `steemconnect` auth module). State, mutations, actions, and getters are split across `store/index.js`, `store/actions.js`, `store/mutations.js`, and `store/getters.js`. The store is the central hub for all blockchain API calls.

**Blockchain integrations**: Hive is primary (`@hiveio/dhive`, `@hiveio/hive-js`, `hive-auth-wrapper`). Steem (`steem`, `dsteem`) and Blurt (`@blurtfoundation/blurtjs`) are legacy/alternative chains. BSC token swaps use `web3`. Multiple fallback RPC nodes are configured in `nuxt.config.js` for redundancy.

**`plugins/` directory**: Several plugins are client-only (`ssr: false`). `vue-custom.js` registers global mixins and utilities. `sanitize.js` sets up DOMPurify and marked (markdown rendering). `commonCardMixin.js` is shared logic across card-type components.

**`patches/` directory**: `patch-package` applies patches here automatically on `npm install`. Do not delete these files.

## Security Architecture (Critical)

**Never put secrets in the `env` block of `nuxt.config.js`** — that block leaks into the client bundle. Secrets belong in `privateRuntimeConfig` (reads from `process.env` at runtime, server-side only).

Client-side code that needs secrets must call the server-side proxy at `api/proxy.js`:
- `/api/proxy/gemini` — Google Gemini AI
- `/api/proxy/deepl` — DeepL translation
- `/api/proxy/reward-comment`, `/api/proxy/reward-vote`, `/api/proxy/reward-edit` — reward system
- `/api/proxy/upload` — image upload to `usermedia.actifit.io`

## i18n Coupling

Language files live in `lang/` (14 locales, default `en_US.js`). `config/index.js` exports the I18N config. **`nuxt.config.js` imports `en_US.js` at the top level** to read `Slogan` for SSR meta tags — this import must be preserved. When adding new top-level translation keys used in `nuxt.config.js`, they must exist in `en_US.js` at build time.

## ESLint Quirks

`vue/no-mutating-props` and `vue/no-use-v-if-with-v-for` are **disabled** — re-enabling either would require sweeping the entire codebase. Parser is `babel-eslint`.

## Deployment

No CI pipeline. Production is hosted on **DigitalOcean App Platform** (served behind Cloudflare — live responses carry `x-do-app-origin` headers), which **auto-deploys on push to `master`**. The build runs **`npm ci`** under **Node 16.20.2 / npm 8.19.4**, so `package.json` and `package-lock.json` must stay perfectly in sync or the build fails at install with `EUSAGE`. DigitalOcean uses Heroku-compatible buildpacks, so the `heroku-postbuild` script (`npm run build`) is likely still the build step the buildpack invokes — do not assume it is dead and remove it. `.env` is gitignored; required env vars are configured in the DigitalOcean app and consumed via `privateRuntimeConfig` and `env` blocks in `nuxt.config.js`.

## Conventions

- 2-space indent, LF line endings, UTF-8 (enforced by `.editorconfig`)
- Vue components use `.vue` extension; pages follow Nuxt routing conventions
- New API integrations requiring secrets must use the `/api/proxy` pattern — never expose keys client-side
