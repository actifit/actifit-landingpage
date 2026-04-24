# AGENTS.md

## Stack

- **Nuxt.js v2** (universal/SSR mode), Vue 2, Vuex, Bootstrap Vue, JavaScript (ES6+)
- SASS/SCSS for styling
- Blockchain clients: Hive (`dhive`, `hive-js`, `hive-auth-wrapper`), Steem (`steem`, `dsteem`), Blurt (`blurtjs`)

## Prerequisites

- **Node.js v16.13.0** (pinned in `package.json` engines; `.nvmrc` says v16.20.2 — engines field is authoritative)
- **npm** (project uses `package-lock.json`, not yarn; ignore README's yarn commands)
- `patch-package` runs on `postinstall` — applies patches in `patches/`

## Commands

```bash
npm install          # install deps (triggers patch-package)
npm run dev          # dev server on localhost:3000
npm run build        # production build
npm run start        # start production server
npm run generate     # static site generation
npm run lint         # ESLint on .js/.vue files
```

No test runner is configured.

## Security Architecture

- **Never put secrets in the `env` block** of `nuxt.config.js` — they leak into the client bundle.
- Secrets go in `privateRuntimeConfig` (reads from `process.env`).
- Client code must call `/api/proxy/*` endpoints; the server-side proxy in `api/proxy.js` injects API keys.
- Proxy endpoints: `/api/proxy/gemini`, `/api/proxy/deepl`, `/api/proxy/reward-comment`, `/api/proxy/reward-vote`, `/api/proxy/reward-edit`, `/api/proxy/upload`.

## ESLint Quirks

- `vue/no-mutating-props` and `vue/no-use-v-if-with-v-for` are **disabled** — do not re-enable without sweeping the codebase first.
- Parser is `babel-eslint`.

## i18n

- Language files in `lang/` (14 locales). Default is `en_US.js`.
- `config/index.js` exports an I18N config used by `nuxt.config.js`.
- `nuxt.config.js` imports `en_US.js` at the top level to read `Slogan` for meta tags — this coupling must be preserved.

## Key Directories

| Dir | Purpose |
|---|---|
| `api/` | Server middleware (proxy) |
| `components/` | Reusable Vue components |
| `config/` | I18N config (imported by nuxt.config.js) |
| `lang/` | Translation files |
| `middleware/` | Client-side route middleware |
| `patches/` | patch-package patches (applied on install) |
| `plugins/` | Nuxt plugins (some client-only via `ssr: false`) |
| `store/` | Vuex store (flat: index/getters/mutations/actions + steemconnect module) |

## Conventions

- `.editorconfig`: 2-space indent, LF line endings, UTF-8.
- No CI pipeline — deployment is via Heroku (`heroku-postbuild` script runs `npm run build`).
- `.env` file is gitignored; required env vars are referenced in `privateRuntimeConfig` and `env` blocks of `nuxt.config.js`.