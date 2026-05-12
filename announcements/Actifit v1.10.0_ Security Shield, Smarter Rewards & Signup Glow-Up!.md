# Actifit v1.10.0: Security Shield, Smarter Rewards & Signup Glow-Up!

Hey Actifitters! 💪 Version 1.10.0 is here, and this one is packed! While it might look business-as-usual on the surface, under the hood we've been fortifying the platform like never before — hardening security on every front, making rewards smarter and more trustworthy, and giving the signup experience a full makeover. Let's break it all down!

![image.png](https://usermedia.actifit.io/MP2FIAF4JNCORPN81CJ6P07ZAE3C9)

Here's what's new across Actifit:

---

## 🛡️ Landing Page: Your Security, Our Priority!

This release is heavy on security — every reward path, every piece of user content, and every credential flow got a thorough audit and tightening:

* **🗳️ Votes Now Carry On-Chain Proof:** When you vote on a post through Actifit, we now broadcast a bundled `custom_json` operation alongside your vote — atomically, in a single transaction. This on-chain activity stamp lets our backend verify real votes before issuing rewards. No faking it!
* **🔒 Reward Endpoints Locked Down:** All three reward flows (votes, edits, comments) now validate inputs, enforce rate limits, and verify a signed auth token before any reward can be issued. Spamming rewards is no longer a thing.
* **🚫 Iframe Hosts Strictly Allowlisted:** Embedded content in posts is now restricted to a trusted list of media hosts only — YouTube, 3Speak, Vimeo, Rumble, D.Tube, Facebook. Arbitrary embeds are blocked outright, keeping your feed safe from malicious content.
* **🧹 CSS Injection Patched:** Dangerous CSS properties (position, z-index, top/left/right/bottom, pointer-events) in post content are now stripped server-side and client-side — no more phishing overlays hiding inside posts.
* **🔑 Signup Credentials Secured:** Account credentials are now sent via POST body to our server-side proxy instead of a GET query string. Your new account password no longer appears in server logs or browser history. A small change with big privacy implications!
* **✅ Access Token Validation on Login:** The SC access token is now validated before being written to localStorage, preventing invalid or tampered tokens from silently corrupting your session.
* **🛡️ Mod Panel XSS Fix:** The moderator panel now uses `textContent` instead of `innerHTML` when rendering API results — closing an XSS vector in an admin-facing page.
* **🔗 Markdown Link Rendering Fixed:** A rendering pipeline bug that was silently corrupting markdown links inside post bodies has been resolved.

---

## 🏆 Reward System: On-Chain Verification, End to End!

The reward system got the biggest upgrade in this release — everything is now verified against the actual Hive blockchain before any AFIT reward is granted:

* **🗳️ Vote Rewards Verified On-Chain:** Before rewarding a vote activity, actifitbot now queries the Hive account history and confirms at least 3 `actifit_vote` custom_json operations were broadcast today. If you didn't actually vote, no reward is issued.
* **✏️ Edit Rewards Verified On-Chain:** Before rewarding a post edit, actifitbot fetches the post via `get_content` and checks the `suppEdit: 'actifit.io'` field in its metadata — proof the edit was made through the Actifit interface. Edits made elsewhere don't qualify.
* **💬 Comment Rewards Verified On-Chain:** Comment rewards now require at least 3 qualifying on-chain comment operations today (replies to posts, not top-level content). Minimum 50 characters per comment. Quality engagement only!
* **🚫 Phantom Account Rewards Blocked:** actifitbot now rejects any reward grant for a username that doesn't correspond to a real Hive account. No rewards for ghost users.
* **📊 AFIT Reward Estimation Endpoint:** A new `/getEstimatedReward` endpoint is now available on actifitbot, letting the app display estimated AFIT rewards to users before they complete an action.

---

## ✍️ Signup Page: A Whole New Experience!

The signup page received a complete UX redesign — same great functionality, but now much clearer, friendlier, and fully translated:

* **🪜 Step Indicator:** A clean 3-step progress bar (Account Details → Activate → Done!) guides new users through the signup process at a glance. No more wondering "what's next?"
* **💳 Fee Explanation Card:** A dedicated card explains exactly what the account creation fee goes toward, with a collapsible "Why is there a fee?" section for curious users.
* **❓ FAQ Accordion:** The most common signup questions are now answered right on the page — no need to search Discord or docs.
* **🌍 Full i18n Coverage:** All new signup content is fully translated across all 14 supported languages. Every new user, wherever they are, gets the same polished experience.
* **🌙 Dark Mode Ready:** All new UI elements respect the dark/light mode toggle — no more jarring white boxes in dark mode.

---

## 🎨 Developer Experience: Code Blocks Look Amazing!

* **✨ Syntax Highlighting:** Code blocks in posts and reports now render with beautiful syntax highlighting powered by highlight.js. 18 languages supported out of the box — JavaScript, Python, Rust, Go, SQL, YAML, and more. Developers, your posts just leveled up.

---

## ⚙️ Under the Hood

* **🔧 URL Normalization:** All reward callers now correctly normalize relative Hive API URLs to absolute `https://actifit.io/...` URLs — no more `url=undefined` errors in reward requests.
* **⏱️ Timing Race Fixed:** Blog and video post creation now pre-captures the post URL before the 2-second redirect fires, ensuring the 10-second reward timer always has the right URL — even after the component unmounts.

---

## 🐦 X (Twitter) Social Integration: Richer & More Reliable

The `/latestXPost` endpoint powering the social feed has been significantly expanded:

* **📰 Two Latest Tweets:** The feed now returns your two most recent posts instead of just one — more activity, more context, at a glance.
* **🖼️ Tweet Media Photos:** Images attached to tweets are now included in the response, with a graceful fallback to the account profile image when no media is present.
* **👤 Profile Image in Response:** The account's profile picture URL is now always included — useful for rendering rich cards in the app.
* **🔑 Credential Resilience:** The X API credential lookup now falls back to environment variables when they aren't present in the config file, so the integration stays live through config reloads.

---

## 💰 BSC Prices & Rewards: Rock Solid After Web3 v4 Upgrade

* **🔧 BSC Price Endpoints Fully Restored:** The Web3 library upgrade to v4 broke all BSC-based price calculations (BNB, AFIT BSC, AFITX BSC, DEX trade) by changing how `fromWei()` and contract calls handle types. All calls have been updated — units are now explicit, BigInt results are properly converted, and price precision is raised to 6 decimal places for accuracy.
* **📊 Live Step Count in Reward Estimates:** The `/getEstimatedReward` endpoint now factors in the user's live step count submitted directly from the app, giving a much more accurate reward estimate before the activity is finalised.
* **🛡️ calcRank Hardened:** The rank calculation is now guarded against `undefined` `balanceOf` results — no more silent failures when a token balance call returns unexpectedly.

---

## 🔒 Landing Page: Security Hardening Round 2

Following a thorough re-check audit (AUDIT-046), a second wave of security fixes has landed on the landing page:

* **🔗 Open Redirect Closed:** Notification click-throughs now validate the destination URL scheme before navigating. Only `http://` and `https://` links are followed; anything else (including `javascript:` URLs) falls back to the notifications page.
* **✅ URL Sanitiser Implemented:** The `$safeUrl()` helper — previously a no-op that passed all URLs through unchecked — now enforces an allowlist of safe schemes (`http`, `https`, `mailto`, `tel`, `hive`, `steem`, `hivesigner`). Dangerous schemes are replaced with `#`.
* **🖼️ Profile Image Upload Secured:** Profile picture uploads now route through the server-side proxy (which injects the upload key), removing the last dead client-side secret reference from the frontend bundle.
* **🎨 CSS Sanitiser Extended:** The post-content CSS strip now also removes `background-image` and `background` properties, and drops any style rule whose value contains `javascript:` or `expression()` — closing the final browser-mitigated CSS vector flagged in the audit.
* **🌐 Security Headers Enabled:** The `nuxt-helmet` configuration is now active with HSTS (180-day max-age), `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Powered-By` removal. Previously the entire header config was commented out.
* **🔗 Reverse Tabnabbing Fixed Across the Board:** All 102 external links using `target="_blank"` across the app now include `rel="noopener noreferrer"`, preventing the opened tab from accessing the opener window.
* **🧹 Console Logs Stripped from Production:** All `console.log` and related calls are now automatically removed from production bundles via the terser config — nothing leaks to the browser devtools in production.

---

## ⚙️ DevOps & Stability

* **🚀 Automated Deployment Pipeline:** actifitbot now ships with a GitHub Actions workflow that automatically deploys to the production servers on every push to the main branch — no more manual `git pull` steps.
* **🔇 Silent Bugs Eliminated:** 27 implicit global variables across actifitbot have been declared with `const`, eliminating an entire class of potential runtime leaks and making the codebase compliant with strict mode.

---

A special shoutout and thank you goes to @louis88 for responsibly reporting several of the security vulnerabilities addressed in this release. The Hive ecosystem is stronger when community members look out for each other — we truly appreciate it! 🙏

We're constantly raising the bar on what it means to be a secure, trustworthy fitness-to-earn platform. This release is a testament to that commitment — every reward you earn is now backed by real on-chain proof, and every piece of your data is handled with the care it deserves.

Keep moving, keep earning, and as always — thank you for being part of the Actifit journey!

Happy Actifitting!
The Actifit Team

---

**Support Our Work!**

Do you love the Actifit updates and the dedication we put into making your fitness journey more rewarding? Then show us some love! Your support means the world to us and helps us keep building awesome features and improving the platform.

#### Support our witness @actifit on Hive, vote for us or set us as proxy on [actifit profile](https://actifit.io/actifit), or via [peakd](https://peakd.com/witnesses), [hive blog](https://wallet.hive.blog/~witnesses) or [hive-signer](ttps://hivesigner.com/sign/account-witness-vote?witness=actifit&approve=true).
#### Support our witness @actifit-he on Hive-engine, vote for us on [Tribaldex](https://tribaldex.com/witnesses).

---

**Questions? Suggestions?**

Let us know in the comments below, or reach us on:

[Discord](https://links.actifit.io/discord) | [Twitter](https://www.twitter.com/Actifit_fitness) | [Instagram](https://www.instagram.com/actifit.fitness/) | [Facebook](https://www.facebook.com/Actifit.fitness/)


*Stay Fit. Earn Crypto. Live Better.*

**- The Actifit Team** 🚀
