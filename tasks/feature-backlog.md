# Actifit Web — Feature Backlog & Enhancement Plan

A grounded, prioritized catalog of proposed features and enhancements for the Actifit web app
(`actifit.io` / `actifit-landingpage`, Nuxt 2 / Vue 2), **reconciled against the current
codebase and the backend API** (`actifitbot`, base `https://api2.actifit.io/`; the activity
poster lives separately at `actifit-pst-cr3at0r`).

The web app is already feature-rich — wallet + market, a mutual **Friends** system, blog / video /
activity posts with modals, communities, proposals, live chat (Sting), referrals, top-holder
boards, measurement charts, 14 locales and dark mode. So most of this list is **enhancement and
depth** on existing surfaces, not greenfield. Where a real backend build is required it is marked.

**Companion doc:** the Actifit **Android** backlog (`actifit/android/tasks/feature-backlog.md`)
covers the native app and the shared endpoint map; several items here are the web side of the
same feature.

**Status legend:** 🔨 In progress · 🔌 Backend endpoint ready · 🧱 Needs new/changed backend ·
🎨 Client-only (frontend) · ♻️ Enhances an existing surface

---

## 0. What already ships (context, do not re-propose)

Wallet + Market (revamped, v1.13.0), **Friends** (`friends.vue`, `FriendshipModal` — mutual
request system, not Hive follow), blog/video/activity posts + `PostModal`/`ReportModal`,
`CustomTextEditor` with preview-description + DecentMemes picker, profile (`_username/index.vue`),
communities, proposals + DHF vote, **Sting live chat**, referrals (`Referral.vue`), top-holder
boards, measurement charts (`MeasureChartModal`), notifications, 14 locales, dark mode, and the
new **CI + i18n guards**.

---

## 1. Current Trello backlog (for context)

| # | Item | Type |
| :-- | :-- | :-- |
| 162 | 🐛 Arabic pages never set the **RTL** direction attribute | Bug (feeds §6.1) |
| 163 | 🐛 `market.vue` calls `reject()` outside any Promise → `ReferenceError` | Bug |
| 164 | 🐛 i18n `$t(key, 'fallback')` passes a **locale**, not a fallback | Bug (feeds §5.2) |
| 110 | ✨ "Actifitter of the month" section | Feature (§2.3) |
| 125 | ✨ Popup "don't show again" (keeps reopening after close) | UX fix |

---

## 2. Engagement & Community — the biggest retention upside

### 2.1 🧱♻️ Challenges / Duels / Teams
Today `CompetitionAnnounce.vue` is a **static banner**. Turn it into a real challenges hub:
step/activity goals, 1v1 duels, and group/team challenges, with AFIT stakes/escrow and a
results feed. Ties directly into **Friends** and the activity feed.
- **Backend:** 🧱 must be built (challenge lifecycle, escrow, resolution) — only internal
  `team`/`team_transactions` collections exist today; scope early. **Impact:** Very High · **Effort:** High.
- ⚠️ Keep it **skill/goal**-based, never wagering/games-of-chance (see house rule).

### 2.2 🧱 Activity leaderboards (friends + global)
Rank users by steps/activity for a day/week — a natural home-page and profile module.
- **Backend:** 🧱 no generic **activity**-leaderboard endpoint exists (only token/holder boards:
  `/topAFITHolders`, `/topDelegators`, per-user `/getRank/:user`). A friends-only board can be
  built client-side from `/userFriends/:user` + `/trackedActivity/:user`; a global board needs a
  new endpoint. **Impact:** High · **Effort:** Medium.

### 2.3 🔌♻️ "Actifitter of the Month" (Trello #110)
A recognition module on the home/community page — spotlight a top mover with stats + a badge.
- **Backend:** 🔌 likely composable from `/getRank`, `/trackedActivity`, badges; a small
  "featured user" config or endpoint keeps it editorial. **Impact:** Medium · **Effort:** Low-Medium.

### 2.4 🔌♻️ Badges & streaks on the profile
Android surfaces a streak strip; web has the data but no prominent badges/streak module on
`_username/index.vue`. Surface the **existing** catalog (`iso`, `rewarded_activity_lev_N`,
`doubledup`, `charity`) with claim states + a streak ring.
- **Endpoints:** `/userBadges/:user`, `/allUserBadges`, `/claimBadge`. **Impact:** Medium-High · **Effort:** Low-Medium.

### 2.5 🎨♻️ Personalized "Following / Friends" feed
The activity feed is global; add a **Friends** filter (client-side from `/userFriends/:user`) and
a followed-communities view for a reason to return daily. **Impact:** High · **Effort:** Low-Medium.

---

## 3. Content creation — lean into the SEO/GEO edge

### 3.1 🎨♻️ In-editor SEO/GEO optimizer (flagship)
The team already runs **HivePulse** and its `score-post` engine. Bake a **live post score + fix
list** into `CustomTextEditor` / `blog/new.vue` — title length, focus keyword, preview
description, headings, alt text, and GEO "answerability" — so authors optimize *before*
publishing (exactly what lifted the v1.13.0 announcement to 99/100).
- **Backend:** 🎨 port the scoring engine to a client util (or a small proxy endpoint). Uniquely
  on-brand; improves every post's reach. **Impact:** High · **Effort:** Medium.

### 3.2 🧱 Post scheduling & draft manager
`blog/new.vue` publishes immediately and keeps only local drafts. Add a **draft library** and
**scheduled publishing** to help users hit the daily cadence.
- **Backend:** 🧱 server-side scheduling; local drafts can ship first (🎨). **Impact:** Medium · **Effort:** Medium.

### 3.3 🎨♻️ AI compose assist
In-app AI is translation-only today. Add optional **draft/summarize/title-suggest** in the editor
(Gemini, as the app already uses for translation). **Impact:** Medium · **Effort:** Medium · **Backend:** 🎨 (Gemini via proxy).

### 3.4 🎨♻️ Route maps for GPS activities
Web only *displays* activity tags; workout/route data rides inside the post JSON. Render a
**map + splits** for posts that carry a GPS route. **Impact:** Medium · **Effort:** Medium · **Backend:** none.

---

## 4. Wallet, Rewards & Growth

### 4.1 🔌♻️ Rewards estimator & earnings dashboard
Surface expected/pending AFIT before and after posting, plus an earnings-over-time view.
- **Endpoints:** `/getEstimatedReward`, `/pendingRewards`, `/getPostReward`. **Impact:** High · **Effort:** Low-Medium.

### 4.2 🔌♻️ Wallet portfolio analytics
Build on the revamped wallet: balance-history charts, AFIT/AFITX/HIVE/HP trends, and a simple
P&L/inflow view (reuse `MeasureLineChart`). **Impact:** Medium · **Effort:** Medium · **Backend:** 🔌 mostly (history from balances/txns).

### 4.3 🔌♻️ Referral program surface
`Referral.vue` exists but isn't a first-class destination. Add a referral dashboard: personal
link/code, referred-accounts list, reward status, free-signup-link claims.
- **Endpoints:** `/referrals/:user`, `/signups/:user`, `/activeRefReward/:referred`,
  `/myFreeSignupLinks`, `/claimableFreeAccounts/:user`. **Impact:** Medium · **Effort:** Medium.

### 4.4 🎨 New-user onboarding checklist
A dismissible "get started" checklist (set profile pic, make first post, add a friend, set up
wallet) to convert signups into active users. **Impact:** Medium-High · **Effort:** Low-Medium · **Backend:** none.

---

## 5. Platform, i18n & PWA

### 5.1 🎨 Installable PWA + Web Push
Make the web app installable and add **web push** for upvotes, friend requests, and rewards —
a big retention lever that meets users off-app. **Impact:** High · **Effort:** Medium-High · **Backend:** 🧱 push registration (FCM web).

### 5.2 🎨 i18n hardening (builds on the new guard)
Fix the `$t(key, 'fallback')` anti-pattern (#164 — 2nd arg is a *locale*, not a fallback), then
consider extending the CI key-guard to **layouts/ + plugins/** and to detect that anti-pattern.
**Impact:** Medium · **Effort:** Low.

### 5.3 🎨 RTL support (builds on #162)
Beyond the `dir="rtl"` attribute fix, do a proper RTL pass (mirrored layouts, icons, paddings)
for Arabic. **Impact:** Medium (real UX for ar users) · **Effort:** Medium.

### 5.4 🎨 Accessibility pass (WCAG 2.2)
Keyboard nav, focus states, color-contrast, and aria labels across the revamped surfaces
(cards, modals, wallet). **Impact:** Medium · **Effort:** Medium.

---

## 6. Known bugs & polish (fast wins)

| # | Item | Where |
| :-- | :-- | :-- |
| 6.1 | 🐛 Arabic RTL attribute never set (#162) | i18n / layout |
| 6.2 | 🐛 `market.vue` `reject()` outside a Promise → `ReferenceError` (#163) | `pages/_username/wallet.vue` / market |
| 6.3 | 🐛 `$t(key, 'fallback')` passes a locale (#164) | scattered `$t()` calls |
| 6.4 | 🐛 Popup reopens after close — add "don't show again" (#125) | the relevant modal/banner |
| 6.5 | ♻️ `wallet.vue` had 5 undefined-variable `$t()` sites (fixed #166) — audit for similar dynamic-key usages elsewhere | components/pages |

---

## 7. Suggested prioritization

**Cycle 1 — fast wins + retention, mostly frontend-only:**
1. Bugs #162/#163/#164/#125 (§6) — cheap, some ship the same day
2. **Rewards estimator (4.1)** + **Badges/streaks on profile (2.4)** — endpoints ready, high perceived value
3. **Friends feed filter (2.5)** + **Onboarding checklist (4.4)** — client-only retention levers
4. **In-editor SEO/GEO optimizer (3.1)** — flagship, on-brand, reuses HivePulse scoring

**Cycle 2 — depth + growth (endpoints mostly ready):**
5. **Referral dashboard (4.3)**, **Wallet portfolio analytics (4.2)**
6. **Actifitter of the Month (2.3)**, **Route maps (3.4)**, **AI compose assist (3.3)**
7. **PWA + web push (5.1)** — bigger, but a major retention step
8. **RTL (5.3)** + **Accessibility (5.4)** polish

**Cycle 3 — bigger bets (need backend build):**
9. **Challenges / Duels / Teams (2.1)** 🧱 — highest engagement upside, most backend work
10. **Activity leaderboards (2.2)** 🧱, **Post scheduling (3.2)** 🧱

---

## 8. Backend dependency summary

| Ready now (endpoints live) 🔌 | Needs new/changed backend 🧱 |
| :--- | :--- |
| Rewards estimator (`/getEstimatedReward`, `/pendingRewards`, `/getPostReward`) | Challenges / duels / teams (no API; internal collections only) |
| Badges (`/userBadges`, `/allUserBadges`, `/claimBadge`) | Global **activity** leaderboard (no activity-leaderboard endpoint) |
| Referrals (`/referrals`, `/signups`, `/activeRefReward`, free-signup links) | Server-side post scheduling |
| Friends (`/userFriends`, `/addFriend`, `/acceptFriend`, `/dropFriendship`, `/userFriendRequests`) | Web push registration (FCM web) |
| Ranks/holders (`/getRank`, `/topAFITHolders`, `/topDelegators`) | "Featured user" editorial config (Actifitter of the Month, if not composable) |
| Measurements/activity (`/trackedActivity`, `/trackedMeasurements`) | — |
| Client-only 🎨: SEO/GEO optimizer, local drafts, AI assist, route maps, onboarding checklist, PWA shell, RTL, a11y, i18n hardening, friends feed filter | — |

> Note: this doc is a living plan — pair each item with a Trello card on the **"Web 1 - Actifit
> Web"** board when it enters a cycle, and keep the two in sync.
</content>
