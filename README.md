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

## Releasing

The production build runs **`npm ci`**, which installs strictly from `package-lock.json` and **fails if it is out of sync with `package.json`**.

### ⚠️ Pre-flight before a release

Always run a clean **`npm ci`** locally first — **not** just `npm install`:

``` bash
npm ci
```

`npm install` silently tolerates a lockfile that is out of sync with `package.json` (e.g. a direct dependency with no top-level entry in the lock), but `npm ci` **fails with `EUSAGE` (`Missing: <pkg> from lock file`)** — which blocks the production build even though local dev looks fine. Matching the `version` fields is not enough; only `npm ci` catches a dependency-tree desync.

Fix a desync by regenerating the lockfile, then commit **only** `package-lock.json` and re-run `npm ci` to confirm:

``` bash
npm install --package-lock-only --lockfile-version 2
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).
