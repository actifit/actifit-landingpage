# Actifit's Spring Refresh: Security, SEO, Smoother Experience & More!

Hey Actifitters! 🌸 Our team has been on a serious sprint this spring, and we're thrilled to share a massive wave of improvements across the entire Actifit ecosystem — from the landing page you see first, to the bots that power notifications and rewards behind the scenes. Grab a seat, and let's dive into everything we've been cooking up!

![image.png](https://usermedia.actifit.io/MLJHUF9BPCVNUQCW0EAVKXVG7ZR0W)

Here's what's been happening across Actifit:

---

## 🌐 Landing Page: Looking Sharper, Ranking Higher!

We gave our landing page a serious glow-up, both under the hood and on the surface:

* **🔍 SEO Supercharged:** We've added canonical URLs, a sitemap.xml, robots.txt, optimized meta descriptions, and reduced multiple H1 tags down to a single H1 per page. Search engines are going to love us now!
* **🔗 Real URLs Everywhere:** Navigation links and news "Full view" links now use real URLs instead of hash links — better for SEO, better for sharing, better for you.
* **🎬 3Speak Video Fixes:** Those 3Speak embeds that looked a bit squished? Fixed! Proper aspect ratio containers ensure videos display beautifully.
* **🛡️ External Link Safety:** Clicking external links now shows a themed warning modal with Actifit-styled buttons, keeping you informed and safe.
* **📱 Mobile Polish:** The UserMenu now properly hides when the hamburger menu is open on mobile — no more overlapping menus!
* **🎵 TikTok Joins the Party:** You'll now find our TikTok link in the footer alongside our other social channels. Come dance with us!
* **📺 YouTube URL Cleanup:** Our YouTube channel link is now a clean, user-friendly URL.
* **💡 Proposal Popup Updates:** The proposal popup now supports the hdev proposal and has been hidden on the signup page to keep new users focused.

---

## 🤖 ActifitBot: Fortified, Tested, and Lightning Fast!

Our notification and curation bot got a major overhaul — security, testing, and reliability were the name of the game:

* **🔐 Security First:** We removed deprecated modules, upgraded to Web3 v4, nodemailer v8, and applied a full round of security patches. We also added safe parsing for all user inputs. No more sketchy code execution!
* **🧪 Test Suite Added:** For the first time, actifitbot has a proper Jest + Supertest test suite covering 11 endpoints, mail utilities, security regressions, and middleware. Quality you can trust!
* **📬 FCM Notifications Upgraded:** Firebase Admin upgraded to v11 with improved token handling (`sendEach`/`sendAll`), enhanced error logging, and better reliability for push notifications.
* **🏗️ Heroku Setup Fixed:** Configuration file handling on Heroku is now bulletproof — base64 config support, proper JSON validation, and graceful fallbacks when env vars are missing.
* **💰 Proposal Pay Notifications:** New `proposal_pay` operation type is now supported, added to the list of existing financial notification types!
* **🧹 Housekeeping:** Removed unused files, cleaned up git tracking, and synced all dependencies.

---

## 🗳️ ActifitVoter: Smarter Rewards, Cleaner Logs!

Our voting bot got some love too, making sure rewards are handled accurately and efficiently:

* **💸 Proposal Pay with NAI Assets:** The voter now correctly handles `proposal_pay` operations with Non-Fungible Asset Interface (NAI) formats — no more NaN amounts or parsing errors!
* **🔧 Robust Asset Parsing:** A unified `parseAsset` helper is now used across all reward operations, ensuring consistent and accurate amount calculations.
* **📊 Log Cleanup:** We've trimmed the noise! Operation logs are now cleaner and more focused, keeping only progress and notification-relevant entries.
* **🔄 Rewards Voting Toggle:** Voting was temporarily paused while VP (Voting Power) replenished, and has now been reactivated — back to curating great content!

---

## ⚡️ Under the Hood: A Safer, Faster Actifit!

Across all modules, we've been relentless about security and performance:

* **XSS Protection:** Dynamic content is now properly sanitized using DOMPurify (with SSR-safe fallbacks), protecting against stored XSS attacks across the platform.
* **API Key Security:** All API keys are now routed through server-side proxy endpoints — no more client-side key exposure!
* **Dependency Health:** 47 npm vulnerabilities fixed via audit, outdated modules replaced, and package locks synced across all repos.

---

We're constantly working behind the scenes to make Actifit the best fitness-to-earn platform out there, and none of this would be possible without your continued support and feedback. Keep moving, keep engaging, and stay tuned for even more awesomeness coming your way!

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
