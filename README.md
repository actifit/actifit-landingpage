# actifit-landingpage

> Landingpage for the Actifit project

## Build Setup

``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn run dev

# build for production and launch server
$ yarn run build
$ yarn start

# generate static project
$ yarn run generate
```

> **Note:** this project uses **npm / `package-lock.json`** — the `yarn` commands above are historical; use the `npm` equivalents (`npm install`, `npm run dev`, `npm run build`, `npm start`, `npm run generate`).

## Deployment & Releasing

Production (**actifit.io**) runs on **DigitalOcean App Platform** and **auto-deploys on every push to `master`**. The build runs **`npm ci`** (Node 16.20.2 / npm 8.19.4), which installs strictly from `package-lock.json` and **fails hard** if `package.json` and the lockfile are out of sync.

### ⚠️ Pre-flight before merging `develop → master`

Always run a **clean `npm ci`** locally first — **not** just `npm install`:

``` bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
```

`npm install` (especially under a newer npm major, e.g. npm 10 on Node 20) **silently tolerates** a lockfile that's out of sync with `package.json` — for example, a direct dependency listed in `package.json` that has no top-level entry in the lock. But DigitalOcean's `npm ci` **fails with `EUSAGE` (`Missing: <pkg> from lock file`)**, so the build never ships and **the live site silently stays on the previous version**. (This blocked the 1.12.0 release: `undici` was a direct dep missing from the lock.)

Matching the `version` fields is **not** enough — only `npm ci` catches a dependency-tree desync.

### Fixing a lockfile desync

``` bash
# regenerate the lock (keep lockfileVersion 2 — the format DO's npm 8 uses)
npm install --package-lock-only --lockfile-version 2
# commit ONLY package-lock.json, then re-verify:
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
```

### After merging to `master`

The deploy takes ~5–15 min. If the live build hasn't changed after ~15 min, check **DigitalOcean → Apps → actifit-landingpage → Deployments** — a failed `npm ci` (EUSAGE) is the most common cause.

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).
