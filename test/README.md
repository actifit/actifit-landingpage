# Testing

This project uses a **layered testing strategy**:

| Layer | Tool | Location | Runs in |
|-------|------|----------|---------|
| Unit (pure logic) | Jest | `test/unit/**` (mutations, getters, BadActorList, sanitize/XSS, vue-custom helpers) | jsdom |
| Store (Vuex actions/mutations/getters) | Jest | `test/unit/store/**` (fetch+commit, pagination, banned-user filtering, recursive comment threads) | jsdom |
| Component (Vue 2 SFCs) | Jest + `@vue/test-utils` | `test/unit/components/**` (Beneficiary, ChainSelection, VotingStatus, TagInput, Transaction, AutocompleteUsernameInput) | jsdom |
| End-to-end (real browser) | Playwright | `e2e/**` | Chromium |

## Stack

Because this is **Nuxt 2 / Vue 2** (not Vue 3), the test stack is pinned to the
Vue-2-compatible, Node-16-safe line:

- `jest@27`, `babel-jest@27`, `jest-environment-jsdom@27`
- `@vue/vue2-jest@27` (transforms `.vue` SFCs)
- `@vue/test-utils@1` (the Vue 2 line)
- `@playwright/test@1.40` (last line that still supports Node 16)

### Babel

`babel.config.js` only populates an `env.test` block. Nuxt's webpack build runs
babel with envName `client`/`server`/`modern` (never `test`), so the file is a
**no-op for the production build** — Nuxt keeps using `@nuxt/babel-preset-app`.
Jest sets `NODE_ENV=test`, which activates `@babel/preset-env` for transforms.

## Commands

```bash
npm test               # run all Jest tests (unit + store + component)
npm run test:watch     # Jest in watch mode
npm run test:coverage  # Jest with coverage report (-> ./coverage)
npm run test:e2e       # Playwright E2E (needs browsers + dev server, see below)
```

## Writing Jest tests

- Test files: `test/**/*.spec.js`.
- Path aliases `@/` and `~/` resolve to the project root (configured in
  `jest.config.js` `moduleNameMapper`).
- Styles and static assets are stubbed via `test/mocks/`.
- Global jsdom shims (`matchMedia`, `scrollTo`) live in `test/setup.js`.

### Common patterns

**Heavy / side-effectful imports** (chain libs, `hive-auth-wrapper`) are mocked so
importing the module under test has no network side effects:

```js
jest.mock('@hiveio/hive-js', () => ({ config: { set: jest.fn() }, api: { setOptions: jest.fn() } }))
```

> Jest hoists `jest.mock()` above imports. Any variable referenced inside the
> factory **must** be prefixed with `mock` (e.g. `mockGetDiscussions`).

**Store actions** return promises that often `commit` asynchronously without ever
calling `resolve()`. Don't `await` the action — fire it and flush the queue:

```js
const flush = () => new Promise(resolve => setTimeout(resolve, 0))
actions.fetchUserTokens({ state, commit })
await flush()
expect(commit).toHaveBeenCalledWith('setUserTokens', 150)
```

**Components** use `shallowMount` and mock framework injections:

```js
shallowMount(MyComponent, {
  propsData: { ... },
  mocks: { $t: (k) => k, $store: { commit: jest.fn(), getters: {} } }
})
```

## Playwright E2E

The E2E tests boot the **real Nuxt dev server** and drive Chromium against it.
They cover login-free critical paths (page loads, navigation, SSR meta). Flows
needing a Hive/Steem wallet login are out of scope for automated runs.

First-time local setup (browsers are NOT downloaded by `npm install` — see the
prod note below):

```bash
npx playwright install chromium
npm run test:e2e
```

To run against an already-running server instead of auto-starting `npm run dev`:

```bash
E2E_BASE_URL=http://localhost:3000 npm run test:e2e
```

### ⚠️ Production build note

DigitalOcean runs `npm ci` (which installs devDependencies) on every deploy.
`@playwright/test` would normally download ~hundreds of MB of browser binaries
during install. To keep deploys fast, set this env var in the **DigitalOcean app
settings** so the browser download is skipped in CI/prod:

```
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

Set this **before** the next deploy to `master`. Browsers are only needed on
developer machines (installed manually via `npx playwright install chromium`).

## Notes surfaced by tests

- `$getTimeDifference` (in `plugins/vue-custom.js`) expects UTC wall-clock
  timestamps **without** a `Z` designator — the format Hive/Steem APIs return
  (e.g. `2024-01-15T10:30:00`). The `- getTimezoneOffset()` term corrects for
  `Date.parse()` treating those as local time, so output is correct in any
  timezone. Tests feed the realistic (no-`Z`) format; passing a `toISOString()`
  value (with `Z`) would skew the result.
- `VotingStatus.displayProperColor` / `getVotingPower` are **unused dead code** —
  defined but never referenced in that component's template (they look like
  leftovers from `SteemStats.vue` / `VoteModal.vue`, which define
  `currentVotingPower` and actually render them). No user-visible effect; the test
  just pins current behavior.
