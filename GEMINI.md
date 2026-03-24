# Actifit Landing Page Project Context

## Project Overview
This is the frontend repository for the Actifit Landing Page (`actifit-landingpage`), built with **Nuxt.js (v2)**. Actifit is a decentralized application (dApp) that incentivizes fitness and healthy lifestyles by rewarding daily activity with tokens on the Hive and Steem blockchains.

### Key Technologies
*   **Framework:** Nuxt.js (Universal/SSR mode)
*   **UI Framework:** Bootstrap Vue
*   **Language:** JavaScript (ES6+)
*   **State Management:** Vuex
*   **Blockchain Integration:** `steem-js`, `@hiveio/hive-js`, `@hiveio/dhive`, `dsteem`
*   **Translation:** `@nuxtjs/i18n` (Gemini & DeepL integration)
*   **Styling:** SASS/SCSS, CSS

## Security Architecture (Important)
**Vulnerability Fix (March 2026):**
A critical vulnerability where API keys were exposed in the client-side bundle via Nuxt's `env` configuration has been patched.
*   **Sensitive Keys:** All sensitive API keys (Gemini, DeepL, Reward Tokens, Image Upload Auth) have been moved from `nuxt.config.js` `env` to `privateRuntimeConfig`.
*   **Server-Side Proxy:** A `serverMiddleware` has been implemented at `api/proxy.js`.
*   **Proxy Endpoints:**
    *   `/api/proxy/gemini`: Proxies requests to Google Gemini API.
    *   `/api/proxy/deepl`: Proxies requests to DeepL API.
    *   `/api/proxy/reward-comment`: Securely handles comment reward tokens.
    *   `/api/proxy/reward-vote`: Securely handles vote reward tokens.
    *   `/api/proxy/reward-edit`: Securely handles edit reward tokens.
    *   `/api/proxy/upload`: Securely proxies image uploads to `usermedia.actifit.io`.

**Developer Requirement:**
*   **NEVER** place secret keys in the `env` block of `nuxt.config.js`.
*   **ALWAYS** use `privateRuntimeConfig` for secrets and access them via `process.env` in server-side code or middleware.
*   **ALWAYS** use the `/api/proxy` endpoints for client-side features requiring these secrets.

## Building and Running

### Prerequisites
*   Node.js (v16.13.0 recommended, see `package.json` engines)
*   NPM

### Commands
*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Run Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Start Production Server:**
    ```bash
    npm run start
    ```
*   **Lint Code:**
    ```bash
    npm run lint
    ```

## Project Structure
*   `api/`: Server-side middleware (Proxy).
*   `assets/`: Global SASS, CSS, and images.
*   `components/`: Reusable Vue components.
*   `layouts/`: Nuxt layouts (default, etc.).
*   `middleware/`: Client-side navigation middleware.
*   `pages/`: Application routes/views.
*   `plugins/`: Client/Server plugins (Axios, Hive, Steem, etc.).
*   `static/`: Static files (favicon, robots.txt).
*   `store/`: Vuex store modules.
*   `nuxt.config.js`: Main configuration file.

## Internationalization (i18n)
The project uses `@nuxtjs/i18n`. Language files are located in `lang/`.
*   **Adding Translations:** Add keys to `lang/en_US.js` and other language files.
*   **Auto-Translation:** The app supports auto-translation of post content using the secure proxy to Gemini/DeepL.

## Contribution Guidelines
*   Follow the existing code style (ESLint is configured).
*   Ensure all new API integrations use the secure proxy pattern if authentication is required.
*   Test changes locally before pushing.
