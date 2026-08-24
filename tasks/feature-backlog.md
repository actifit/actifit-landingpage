# Actifit Web — Feature Backlog & Enhancement Plan

A grounded, prioritized catalog of proposed features and enhancements for the Actifit web app
(`actifit.io` / `actifit-landingpage`, Nuxt 2 / Vue 2), **reconciled against the current
codebase and the backend API** (`actifitbot`, base `https://api2.actifit.io/`; the activity
poster lives separately at `actifit-pst-cr3at0r`).

The web app is already feature-rich — wallet + market, a mutual **Friends** system, blog / video /
activity posts with modals, communities, proposals, live chat (Sting), referrals, top-holder
boards, measurement charts, 14 locales and dark mode. So most of this list is **enhancement and
depth** on existing surfaces, not greenfield. Where a real backend build is required it is marked.

**Companion doc:** the Actifit **Android** roadmap (`actifit/android/tasks/feature-vision.md`
+ `suggested_features.md`). Challenges (§2.1) is the **web side of the same shared feature** —
keep the two docs in sync.

**House rule (non-negotiable):** no wagering / betting / games-of-chance-for-money anywhere in
the product. Competition is **skill- and goal-based**; rewards come from **sponsor / DHF /
Actifit-funded prize pools**, never from pooling participants' own AFIT and redistributing it.

**Status legend:** 🔨 In progress · 🔌 Backend endpoint ready · 🧱 Needs new/changed backend ·
🎨 Client-only (frontend) · ♻️ Enhances an existing surface

---

## 0. What already ships (context, do not re-propose)

Wallet + Market (revamped, v1.13.0), **Friends** (`friends.vue`, `FriendshipModal` — mutual
request system, not Hive follow), blog/video/activity posts + `PostModal`/`ReportModal`,
`CustomTextEditor` with preview-description + DecentMemes picker, profile (`_username/index.vue`),
communities, proposals + DHF vote, **Sting live chat**, referrals (`Referral.vue`), top-holder
boards, measurement charts (`MeasureChartModal`), a **Daily Leaderboard** (`pages/leaderboard.vue`
— ranks users by daily recorded activity, fed by `actifit-pst-cr3at0r` `topP0stsV2`), a per-user
rank breakdown (`pages/userrank.vue`), notifications, 14 locales, dark mode, and the new
**CI + i18n guards**.

**Out of scope on web:** SEO/GEO post optimization stays **HivePulse's** domain (its `score-post`
engine + extension). We deliberately do **not** duplicate it into the Actifit editor.

---

## 1. Current Trello backlog (for context)

| # | Item | Type |
| :-- | :-- | :-- |
| 162 | 🐛 Arabic pages never set the **RTL** direction attribute | Bug (feeds §5.3) |
| 163 | 🐛 `market.vue` calls `reject()` outside any Promise → `ReferenceError` | Bug |
| 164 | 🐛 i18n `$t(key, 'fallback')` passes a **locale**, not a fallback | Bug (feeds §5.2) |
| 110 | ✨ "Actifitter of the month" section | Feature (§2.3) |
| 125 | ✨ Popup "don't show again" (keeps reopening after close) | UX fix |

---

## 2. Engagement & Community — the biggest retention upside

### 2.1 🧱♻️ Challenges / Duels / Teams — "The Arena" (marquee, cross-platform)
Today `CompetitionAnnounce.vue` is a **static banner**. The Android roadmap treats this as its
flagship greenfield bet ("The Arena": live 1v1 duels, team raids / boss battles, City-vs-City,
tournaments). **It is the same feature on both platforms** — and the central design fact is that
it is a **backend service consumed by every client**, not a per-client build.

**Optimal path — one shared backend, two specialized front-ends:**

| Layer | Owner | Rationale |
| :-- | :-- | :-- |
| **Challenge engine** — lifecycle, join, step aggregation + **verification** (from `verified_posts` / `trackedActivity`), resolution, payout, standings/leaderboard endpoints, notifications | **Backend — build once** 🧱 | Single source of truth + anti-cheat; web, Android, and iOS all reuse it. The long pole — **scope first.** Only internal `team`/`team_transactions` collections exist today. |
| **The "playing" surface** — create/accept a duel, **live** real-time progress, in-walk push, GPS, AI trash-talk | **App leads** | Mobile is where you move *with the phone*: real-time, background sensor, and push are native strengths. |
| **The "arena" surface** — discover/browse challenges, **create & manage team / city / tournament** events (organizer tools), standings & brackets, spectating, sharing/embedding results into Hive posts, history | **Web leads** (this repo) | Big-screen dashboards, community/city boards, organizer/admin, and spectating are far better on web. Web is the **lobby, management, and spectator layer**; the app is the live-competition layer. |

**Reward model (house-rule compliant):** free/low-friction entry; win by **hitting a goal or
out-stepping on effort** (skill, not chance). AFIT comes from **sponsor / DHF / Actifit-funded
prize pools**, plus badges, league standing and status — **never** user-staked escrow or pooled
wagers. Sponsors funding the fun is also a cleaner growth story.

**Sequencing:** design the challenge + verification schema → build the engine → app ships live
1v1 duels → web ships the arena hub + team/city organizer tools on the *same* endpoints.
**Impact:** Very High · **Effort:** High (backend-led).

**Expanded by research (2026-08-24)** — surveyed the fitness contests already run on Hive (the
Actifit community), Splinterlands' competitive systems, and modern mobile-game clan/challenge
loops. Two verticals turn "The Arena" from a duels feature into a full engagement system — both
purely skill/goal-based.

#### 2.1.a Vertical — Leagues & Seasons (the solo ladder)
The individual progression spine, and the **highest-proven retention lever** (Duolingo's weekly
leagues drove a step-change in D7 retention; Splinterlands' whole economy hangs off league +
season rewards).

**Real proof on Hive — POLIAC:** Actifit already has a **24-season**, community-run
football-style league — **POLIAC ("Polish League Actifit"**, community `hive-124594`, run by
@poliac). Members are placed in named **divisions** (Golden League, …) and play **daily 1v1
fixtures** (a round-robin scheduler pairs everyone each "round" — the higher Actifit activity that
day wins), a full **~5-week season** with weekly schedules posted in advance and daily results,
and season-to-season **promotion/relegation**. Vertical A is essentially **POLIAC made native,
automated, and multi-language.** (POLIAC = round-robin *league*; the MAcFiT "World Cup" = knockout
*cup* — the classic league-vs-cup pair, both already running on Actifit data.)

- **Weekly step leagues** — 30-user cohorts *matched by activity level*; each week the top ~7
  promote and the bottom relegate, across tiers Bronze → Champion. A small, winnable leaderboard
  that resets weekly (Duolingo) — the automated cousin of POLIAC's division ladder. Rating = a
  rolling verified-activity score (the Splinterlands ELO analogue, but on steps/workouts). The
  raw daily ranking already exists (§2.2, `pages/leaderboard.vue` / `topP0stsV2`); the net-new
  work is the **division ladder, weekly/season windows, and promotion/relegation** on top of it.
- **Seasons (~2 weeks)** — ratings reset; end-of-season **reward chests scaled by peak tier**
  (Splinterlands seasons), funded from a sponsor/DHF/treasury pool — chests hold AFIT / badges /
  boosts, never a paid random pull.
- **Daily Focus goal** — a rotating auto-verified target ("10k steps", "cardio day") unlocking
  escalating chest thresholds (Splinterlands daily focus). This would **revive natively** the idea
  behind Hive's *now-defunct* **"AutomaticWin"** beat-the-clock contest (hit the goal before a
  cutoff → fixed AFIT reward) — automated, so it doesn't depend on one organizer keeping it alive.
- **Weekly Top-N leaderboard** with a sponsor-pool prize split by rank/tier — the native version
  of the community **"Top 250"** leaderboard (currently hand-run weekly by an Actifit team member);
  making it native removes that manual burden.

#### 2.1.b Vertical — Squads & Brawls (the team / social layer)
The belonging + team-vs-team spine (Clash clans; Splinterlands guilds + Brawls; the community-run
**MAcFiT "World Cup"** — a knockout bracket already built on Actifit activity counts).
- **Squads** (10–50 users) — roles (a Captain sets weekly goals), a shared squad step feed + chat,
  and cumulative **squad milestones** that unlock squad badge tiers.
- **Co-op squad goals / boss battles** — the squad pools steps to "climb a mountain" / cross a
  virtual route; a **completion-gated** shared reward drops for every active contributor (mobile
  co-op raids — goal-gated, not random).
- **Squad Wars / Brawls** — scheduled weekly team-vs-team where each member fills a **"fray slot"**
  = a personal step/workout target; unfilled slots forfeit (Splinterlands brawl mechanic). Team
  placement funds a shared sponsor pool and earns **squad currency** spendable in a squad store on
  cosmetics/perks. Matchmaking by squad-average activity keeps it winnable — the native, team-based
  evolution of the MAcFiT bracket.

#### 2.1.c Cross-cutting mechanics (apply to both verticals)
- **Streaks + a "Rest Day" freeze** — the strongest daily-return hook; the freeze forgives one
  missed day (Duolingo). A *fixed* item, never gambled. (Partly native to Actifit already.)
- **Seasonal "Fitness Pass"** — a free reward track earned via activity, with an optional premium
  track. ⚠️ premium must sell a **fixed-content** track / cosmetics / AFIT boosts — **never** a
  paid random crate.
- **Live-ops events** — monthly themed limited-time challenges ("October 1M-Steps City Walk",
  Ramadan / New-Year events, conference step contests) with sponsor prize pools (Monopoly-GO-style
  live-ops; mirrors Hive's in-person "Actifit Challenge" events).
- **Content contests** — a lightweight in-app contest type (submit a photo/video/flyer; community
  or organizer judging) mirroring Hive's `#actifitcontest`.

#### 2.1.d Compliance primitive (why this stays non-gambling)
The research converges on one clean pattern that keeps all of the above on the right side of the
house rule:
1. **An earned-only, non-transferable in-app currency** (*Merits* / *Actipoints*) for season
   tracks and the squad store — **earned through activity, never bought or wagered** (Splinterlands'
   Glint/Merits primitive).
2. **All prize pools sponsor / DHF / treasury-funded**, with **free or activity-gated entry** —
   never an entry-fee pot or user-staked wager (validated by both the Hive contests and
   Splinterlands' sponsor/DAO-funded tournaments).

These verticals share the *same* challenge engine + verification + pool-payout backend as the duels
above — build it once, then layer **Leagues** (solo) and **Squads** (team) as configurations of it.

#### 2.1.e Summary tables

All items are **skill/goal-based**; AFIT prizes are **sponsor/DHF/treasury-funded**; spendable
currency is **earned-only & non-transferable** (no wagering, no paid random crates).

**Foundation — the shared challenge engine (build once; web + Android + iOS consume):**

| Piece | What it does | Status |
| :-- | :-- | :-- |
| Challenge engine | Lifecycle, join, step **verification** (`verified_posts`/`trackedActivity`), resolution, pool payout, standings, notifications | 🧱 net-new — **scope first** |
| Daily activity ranking | Ranks users by daily recorded activity | ✅ **exists** — `leaderboard.vue` / `topP0stsV2` |
| Weekly/season aggregation | Standings table, points, promotion/relegation windows | 🧱 net-new (daily feed is today-only) |
| Earned-only currency ("Merits") + rewards shop | Anti-gambling spend primitive | 🧱 net-new |

**Vertical A — Leagues & Seasons (solo ladder · retention spine):**

| Feature | What it is | Basis | Impact · Effort |
| :-- | :-- | :-- | :-- |
| Weekly step leagues | Cohorts by activity level; promote/relegate; Bronze→Champion | POLIAC · Duolingo | ⭐⭐⭐ · Med |
| Seasons + reward chests | ~2-wk cycles; chests scaled by peak tier (pool-funded) | Splinterlands | ⭐⭐⭐ · Med |
| Daily Focus goal | Rotating auto-verified target unlocking chest thresholds | Splinterlands · (revives defunct AutomaticWin) | ⭐⭐ · Low-Med |
| Weekly Top-N + prizes | Sponsor-pool split by rank | Community Top-250 (hand-run today) | ⭐⭐ · Low |

**Vertical B — Squads & Brawls (team / social · belonging):**

| Feature | What it is | Basis | Impact · Effort |
| :-- | :-- | :-- | :-- |
| Squads | 10–50 users, Captain roles, shared feed/chat, milestones | Clash clans · Splinterlands guilds | ⭐⭐⭐ · Med |
| Co-op squad goals / boss battles | Pool steps to a shared goal → completion-gated reward for all | Mobile co-op raids | ⭐⭐ · Med |
| Squad Wars / Brawls | Weekly team-vs-team; members fill "fray slots"; squad currency → store | Splinterlands Brawls · MAcFiT | ⭐⭐⭐ · Med-High |

**Cross-cutting (both verticals):**

| Feature | What it is | Basis | Impact · Effort |
| :-- | :-- | :-- | :-- |
| Streaks + "Rest Day" freeze | Daily habit hook; one forgiven miss (fixed item) | Duolingo | ⭐⭐⭐ · Low |
| Seasonal "Fitness Pass" | Free track + optional fixed-content premium | Battle-pass games | ⭐⭐ · Med |
| Live-ops events | Monthly themed limited-time challenges w/ sponsor pools | Monopoly GO · Hive events | ⭐⭐ · Med |
| Content contests | Submit photo/video/flyer; community/organizer judging | Hive `#actifitcontest` | ⭐ · Low |

**Suggested build order:**

| Phase | Ships |
| :-- | :-- |
| 1 | **Challenge engine + verification + earned-only currency** (foundation) |
| 2 | **Leagues & Seasons** (A) — reuses the existing daily leaderboard + POLIAC format |
| 3 | **Squads & Brawls** (B) + cross-cutting (streaks, live-ops, Fitness Pass, contests) |

### 2.2 ♻️ Activity leaderboards — extend the existing Daily Leaderboard
**Already shipped:** a global **Daily Leaderboard** (`pages/leaderboard.vue`) ranks users by daily
recorded activity (data from `actifit-pst-cr3at0r` `topP0stsV2`; a simpler `top5p0sts` also exists).
So the *raw daily ranking is not greenfield* — the gaps are scope, time-window, and gamification:
- 🎨 **Friends / community-scoped** views (filter the same data by `/userFriends/:user` or a
  community) — low effort.
- 🧱 **Weekly / season windows** and a **standings table** (points, promotion/relegation) — the
  ranking layer §2.1.a needs; requires a weekly/season aggregation endpoint (the daily feed is
  today-only).
- The gamified **leagues/divisions** live in §2.1.a and build directly on this data.
- **Impact:** High · **Effort:** Low (friends filter) → Medium (weekly/season aggregation).

### 2.3 🔌♻️ "Actifitter of the Month" (Trello #110)
A recognition module on the home/community page — spotlight a top mover with stats + a badge.
- **Backend:** 🔌 likely composable from `/getRank`, `/trackedActivity`, badges; a small
  "featured user" config keeps it editorial. **Impact:** Medium · **Effort:** Low-Medium.

### 2.4 🔌♻️ Badges & streaks on the profile
Android surfaces a streak strip; web has the data but no prominent badges/streak module on
`_username/index.vue`. Surface the **existing** catalog (`iso`, `rewarded_activity_lev_N`,
`doubledup`, `charity`) with claim states + a streak ring.
- **Endpoints:** `/userBadges/:user`, `/allUserBadges`, `/claimBadge`. **Impact:** Medium-High · **Effort:** Low-Medium.

### 2.5 🎨♻️ Personalized "Following / Friends" feed
The activity feed is global; add a **Friends** filter (client-side from `/userFriends/:user`) and
a followed-communities view for a reason to return daily. **Impact:** High · **Effort:** Low-Medium.

---

## 3. Content creation

> SEO/GEO post optimization is intentionally **left to HivePulse** (see §0). The items here are
> about reducing posting friction and enriching content, not scoring it.

### 3.1 🧱 Post scheduling & draft manager
`blog/new.vue` publishes immediately and keeps only local drafts. Add a **draft library** and
**scheduled publishing** to help users hit the daily cadence.
- **Backend:** 🧱 server-side scheduling; local drafts can ship first (🎨). **Impact:** Medium · **Effort:** Medium.

### 3.2 🎨♻️ AI compose assist
In-app AI is translation-only today. Add optional **draft / summarize / title-suggest** in the
editor (Gemini, as the app already uses for translation) — helps users clear the daily post's
word-count/quality bar. **Impact:** Medium · **Effort:** Medium · **Backend:** 🎨 (Gemini via proxy).

### 3.3 🎨♻️ Route maps for GPS activities
Web only *displays* activity tags; workout/route data rides inside the post JSON. Render a
**map + splits** for posts that carry a GPS route. **Impact:** Medium · **Effort:** Medium · **Backend:** none.

---

## 4. Wallet, Rewards & Growth

### 4.1 🔌♻️ Rewards estimator & earnings dashboard
Surface expected/pending AFIT before and after posting, plus an earnings-over-time view.
- **Endpoints:** `/getEstimatedReward`, `/pendingRewards`, `/getPostReward`. **Impact:** High · **Effort:** Low-Medium.

### 4.2 🔌♻️ Wallet portfolio analytics
Build on the revamped wallet: balance-history charts, AFIT/AFITX/HIVE/HP trends, and a simple
inflow/holdings view (reuse `MeasureLineChart`). **Impact:** Medium · **Effort:** Medium · **Backend:** 🔌 mostly.

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

### 5.1 🎨🧱 Installable PWA + Web Push — highest-leverage web retention item
Two paired capabilities that close the gap between "a website you visit" and "an app that pulls
you back" — for the large share of users who are on mobile **web**, not the Android app.

**PWA (Progressive Web App)** — make `actifit.io` behave like an installed app:
- **Installable** — "Add to Home Screen" on phone/desktop; launches full-screen with the Actifit
  icon, no browser chrome. A persistent home-screen icon is itself a big retention nudge.
- **Instant shell / offline resilience** — a service worker caches the app shell so it opens fast
  and survives flaky mobile connections.
- **Effort:** low-medium — Nuxt 2 has `@nuxtjs/pwa` (manifest + service worker) built for this.
  **Backend:** none.

**Web Push** — browser notifications even when the tab/site is **closed** (like native push):
- **Moments that pull people back:** upvotes, friend requests, rewards paid, a duel challenge
  (§2.1), "you're about to lose your streak," reward-cycle reminders — today web users get
  **none** of these off-site.
- **Rails largely exist:** Android already uses **FCM**, and FCM does **web push** too, so the
  send side is mostly there; the new piece is a **subscription-registration endpoint** + service
  worker.
- **Caveats:** must request notification permission **contextually** (not on first load), and
  **iOS Safari only supports web push for *installed* PWAs** (iOS 16.4+) — which is why PWA + push
  are done together. **Effort:** medium · **Backend:** 🧱 thin (push registration, reuses FCM).

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
4. **PWA shell (5.1, part 1)** — installable app, no backend; sets up web push next

**Cycle 2 — depth + growth (endpoints mostly ready):**
5. **Web Push (5.1, part 2)** — the retention step; thin push-registration endpoint
6. **Referral dashboard (4.3)**, **Wallet portfolio analytics (4.2)**
7. **Actifitter of the Month (2.3)**, **Route maps (3.3)**, **AI compose assist (3.2)**
8. **RTL (5.3)** + **Accessibility (5.4)** polish

**Cycle 3 — the marquee bet (backend-led, cross-platform):**
9. **Challenges / "The Arena" (2.1)** 🧱 — scope the shared backend *early* (it gates the app's
   flagship too); web builds the arena/organizer/spectator layer on those endpoints.
10. **Activity leaderboards / leagues (2.2)** 🧱 — shares the 2.1 backend · **Post scheduling (3.1)** 🧱

---

## 8. Backend dependency summary

| Ready now (endpoints live) 🔌 | Needs new/changed backend 🧱 |
| :--- | :--- |
| Rewards estimator (`/getEstimatedReward`, `/pendingRewards`, `/getPostReward`) | **Challenges / Arena engine** (lifecycle, verify, resolve, payout, standings) — no API; internal collections only |
| Badges (`/userBadges`, `/allUserBadges`, `/claimBadge`) | **Activity / league leaderboard** (no activity-leaderboard endpoint) — shared with Arena |
| Referrals (`/referrals`, `/signups`, `/activeRefReward`, free-signup links) | Server-side post scheduling |
| Friends (`/userFriends`, `/addFriend`, `/acceptFriend`, `/dropFriendship`, `/userFriendRequests`) | **Web-push subscription registration** (FCM-web; send side reuses existing FCM) |
| Ranks/holders (`/getRank`, `/topAFITHolders`, `/topDelegators`) | "Featured user" editorial config (Actifitter of the Month, if not composable) |
| Measurements/activity (`/trackedActivity`, `/trackedMeasurements`) | Sponsor prize-pool funding/escrow rails for challenges (Actifit/DHF-funded, **not** user-staked) |
| Client-only 🎨: PWA shell, local drafts, AI assist, route maps, onboarding checklist, RTL, a11y, i18n hardening, friends feed filter | — |

> This doc is a living plan — pair each item with a Trello card on the **"Web 1 - Actifit Web"**
> board when it enters a cycle, and keep the web ↔ Android roadmaps in sync (esp. Challenges).
</content>
