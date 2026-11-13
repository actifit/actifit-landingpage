TITLE: Actifit's 5 Releases: Safer Accounts, In-App Signup [Live]
TAGS: hive-193552,actifit,hive,security,development,news
DESCRIPTION: Actifit's November update: hardened security, in-app Hive signup on Android, iOS 1.1.1 with The Arena, a faster actifit.io, and Hive Dev Proposal #391.
PERMLINK: https://peakd.com/@actifit/actifits-5-releases-safer-accounts-in-app-signup-live

Hey Actifitters! 💪

**Actifit's biggest security and app update of the year is live:** hardened security across every platform, in-app Hive signup on Android, The Arena and Friends on iOS, and a faster, safer actifit.io.

After a hack attempt on our API in October, we reviewed and hardened every part of Actifit, from the apps to the servers, because your account's safety comes first. This post walks you through what changed on each platform, what is still paused, and how you can support the team behind it. 👇

![Actifit November update banner: safer accounts, in-app signup, Arena on iPhone and Hive Dev Proposal #391](https://usermedia.actifit.io/MW167LK8MXVDVRBB1J42Y8DLAEECJ)

---

## 🔐 Security First: What Changed For You

Here is what the security work means for you in practice:

* **🔂 Each signed action can be used only once**, and only for the purpose you signed it for.
* **🗝️ No more funds password.** Sensitive actions like the AFIT upvote exchange now use your signed-in session instead.
* **🔒 Sessions are stored only in a scrambled (hashed) form**, so a stored session can't be reused.
* **🧮 AFIT balances update atomically.** Deposits count exactly once, and duplicates are blocked.
* **🛡️ Stricter checks everywhere:** rate limits, input validation, deny-by-default admin checks, sensitive data kept out of logs, and a hardened website.
* **📷 Photo privacy:** GPS location and identifying camera details are removed from photos you upload from the app.
* **💚 AFIT taken from affected accounts during the hack attempt was restored.**

---

## 🤖 Android: v0.15.2 With In-App Signup

Actifit Android **v0.15.2** is rolling out on Google Play, on top of v0.15.1, which brought everything we have built since v0.14.0 "Momentum".

**New in v0.15.2: create your Hive account inside the app** 🎉

* Your keys are made **on your phone**. Only your public keys are ever sent, so nobody else sees your keys.
* Pay with **HIVE or HBD**, or use a **promo code** to skip the payment.
* **Copy icons** next to the amount, account and memo, so you never retype them. A typo is the easiest way to lose a payment!
* Clear status messages: payment not seen yet, payment too small, wrong promo code.
* Leave midway and pick up your signup later. The app warns you before you discard one that may already be paid.

**Also new since v0.14.0**, our last big Play Store release, all of it now live with v0.15.2:

* **🏟️ The Arena, native in the app:** browse challenges, join or leave, live standings, your rank and how far you are from the next person, an "Ending soon" countdown, an Arena card on your dashboard, Arena badges on your profile, and Arena notifications that open right in the challenge.
* **👥 Friends:** friend list, requests and search, a Suggested tab ranked by activity, mutual friends on profiles, and notifications that take you straight there.
* **🧬 A new profile screen** with a living companion that evolves into a fitness spirit animal as you move.
* **⭕ A reimagined dashboard:** animated rings for steps, distance and calories, the same for phone sensors, Fitbit and Health Connect. Fitbit now shows real distance and calories too.
* **🎯 Your own daily step goal**, used by the dashboard and profile rings.
* **📈 Body metrics charts** for weight and measurements, plus shareable progress cards.
* **🧠 AI Assistant** on the post screen for fitness tips and writing help: it inserts text where your cursor is and remembers your chat. **AI workout plans** are back too.
* **🛍️ Safer gadget buys:** a payment is never charged twice or lost, Total Bought and Remaining Boosts update right away, and you can pick a friend as beneficiary with autocomplete.
* **🩺 Health Connect fixes:** no more double-counted steps, correct 15-minute intervals, calories that no longer show 0, recovery when Health Connect stops responding, and your full Health Connect or Fitbit history in Activity History.
* **📏 Distance and pace follow your US or metric setting.**
* **✍️ Post editor fixes** for height, clipping and the measurements section.
* **🗳️ An in-app prompt to support Hive Dev Proposal #391.**
* **🔐 Stronger app integrity checks**, Android 16 support, and **13 languages** updated, including all the new Arena and Friends screens.

---

## 🍏 iOS: v1.1.1 With The Arena And Friends

Actifit iOS follows up on 1.0 "Liftoff" with **v1.1.1**, live on the App Store now:

* **🏟️ The Arena**, now on iPhone: challenges, standings, notifications and countdowns.
* **👥 Friends**, the same as on Android.
* **📱 Everything works in the app:** votes, comments, waves, snaps, transfers, power up and down, Hive-Engine actions, reward claims, gadgets, Friends and Arena. Gadget prices are checked again and you confirm before paying.
* **🏋️ AI Workout Wizard:** generate plans for 300 AFIT, save and edit workouts, and search an 873-exercise library with pictures.
* **🧹 Fixes:** a social feed that refreshes properly, Actifit news back on the dashboard, and smoother sessions after long breaks.

---

## 🌐 actifit.io: Faster, Safer, Simpler

The website is now on **v1.14.29**:

* **🔑 Keychain login is back**, next to HiveAuth.
* **🔁 The AFIT upvote exchange is back**, with fixed tiers and no funds password.
* **⚡ Faster pages:** lighter images, smarter caching and cards that load only when you see them.
* **🛡️ Hardened against malicious content** in posts, plus a stricter content security policy.
* **🧭 Fixes:** correct vote values, "time ago" labels that respect your time zone, clearer wallet and gadget errors, and no more duplicate friend requests.
* **🔌 Login that doesn't hang** when your connection or Keychain is slow, and it works on privacy-focused browsers like Brave.

---

## ⚙️ Behind The Scenes: Actifit Bot And Image Hoster

**The Actifit backend** got the security work above, plus:

* **🏟️ Arena:** a bigger Daily Focus prize (50 AFIT, now at 5,000 steps), result and "closing soon" notifications, and more reliable payouts.
* **💰 Delegator AFIT rewards are back**, now with on-chain checks of every delegation.
* **🧩 Sturdier signups and Blurt support**, so one slow node no longer breaks login.

**Our image hoster** (usermedia.actifit.io) moved to **object storage**, so it can grow without manual work. It also turns photos upright even when their data is broken, never serves half-processed uploads, and protects stored images from being overwritten.

---

## ⏸️ What Is Still Paused

To be clear about what isn't back yet: **anything that moves value off Actifit stays paused until it has been rebuilt and reviewed.** That includes AFIT comment tips, moving AFIT to Hive-Engine, the BSC bridge, buying AFIT with HIVE, shop purchases and AFIT-funded Arena prizes. Free Arena challenges and badges work as usual.

Tips and moving AFIT to Hive-Engine are already being worked on and are next in line. We are bringing each one back with its own fixes and review, and we will announce each one when it returns.

---

## 🗳️ Support Hive Dev Proposal #391

Actifit is built by the **Hive Dev team**, and our work is now funded through one proposal: **[Hive Dev Proposal #3 (#391)](https://peakd.com/@hdev/hive-dev-proposal-3)**. Actifit's own proposal ended in April, so the Hive DHF now funds one proposal from us instead of two.

Over the past year the team merged 434 merge requests across 10 Hive repositories, shipped two new HAF apps that are now standard in the Hive API node stack, built hivescan.info into an analytics hub, and delivered The Arena, the redesigned Android and iOS apps and a refreshed actifit.io.

The ask is **275 HBD/day**, about 34% less than our previous proposal's adjusted rate. It funds the next year of Actifit, HAF apps, the Block Explorer, a new HAF AI project and more.

**If you enjoy Actifit, please vote for #391:**

* [Vote on PeakD](https://peakd.com/me/proposals/391)
* [Vote on Ecency](https://ecency.com/proposals/391)
* [Vote via HiveSigner](https://hivesigner.com/sign/update_proposal_votes?proposal_ids=%5B%22391%22%5D&approve=true)
* [Vote on the Hive wallet](https://wallet.hive.blog/proposals)

You can also vote straight from the prompt in the Actifit apps and on actifit.io. 🙏

---

Thank you for sticking with us through a demanding few weeks. Every update in this post exists because you kept moving, kept posting, and kept trusting Actifit. 💚


**Questions? Suggestions?**

Let us know in the comments below, or reach us on:

[Discord](https://links.actifit.io/discord) | [Twitter](https://www.twitter.com/Actifit_fitness) | [Instagram](https://www.instagram.com/actifit.fitness/) | [Facebook](https://www.facebook.com/Actifit.fitness/)

*Stay Fit. Earn Crypto. Live Better.*

**- The Actifit Team** 🚀
