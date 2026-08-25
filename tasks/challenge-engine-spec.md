# Challenge Engine — Technical Scope & Design Spec

> **Trello #171** (EPIC · backend-led · *scope-first*). Gates Vertical A (Leagues & Seasons, #172)
> and Vertical B (Squads & Brawls, #173). Roadmap context: `tasks/feature-backlog.md` §2.1 + §2.1.e.
>
> **Status:** DRAFT — review round 2 incorporated (2026-08-25). Product decisions settled:
> **Hive is the system of record** — challenges, participation, and settled results/rewards persist
> on-chain as `custom_json` (§3.9–§3.10), DB is a materialized index; **user self-funded pools
> allowed** at Community tier (§7.4, I7); **Weekend Warrior** added to the default set (§7.5); backend
> repo is **`actifit/actifit-bot`** (§1.1). This is the "scope first" deliverable: it defines the data
> model, on-chain op schema, verification, API surface, currency primitive, persistence boundary,
> origination model, and phasing so the two vertical epics can be broken into buildable sub-tasks
> against a settled contract. No client code ships from this card; it produces the contract every
> client will build against.

---

## 1. Why this is one backend, not a web feature

The Arena (duels, leagues, squads, brawls, live-ops) is the **same feature on web, Android, and
iOS**. The single design fact that drives everything below: it is a **backend service consumed by
every client**, not a per-client build. The alternative — each client re-deriving standings from raw
activity — makes anti-cheat impossible (no single source of truth), forks the rules three ways, and
triples the work.

So this epic delivers **one service** with:

- a **canonical data model** (challenges, participants, standings, seasons, currency ledger, pools),
- a **verification layer** that turns raw Actifit activity into trusted, tamper-resistant scores,
- an **aggregation layer** that rolls daily activity up into weekly/season windows, and
- a **stable HTTP API** every client reads and writes through.

Then the clients specialize (per §2.1 of the roadmap): **app = the live "playing" surface**
(real-time duel progress, in-walk push, GPS); **web (this repo) = the "arena" surface** (discover,
organizer/admin tools, standings & brackets, spectating, sharing results into Hive posts).

### 1.1 Where it lives

The engine is part of the **Actifit backend** — the same service already reachable at
`process.env.actiAppUrl` that serves `getRank/:user`, `trackedActivity`, `userBadges/:user`, etc.
(see `store/actions.js:112`). It is **not** new infrastructure in this repo. This repo (web) is a
**consumer**: it calls the new endpoints and renders the arena surface. Android/iOS consume the same
endpoints.

**Backend repo:** the endpoints are built in **`actifit/actifit-bot`** (the Actifit backend behind
`api.actifit.io`) — *that* repo owns the Challenge Engine code, schemas, jobs, and API. This repo
only consumes it. Note the daily activity feed (`topP0stsV2` / `top5p0sts`) is a **separate** small
service (`actifit-pst-cr3at0r`), read as an input — not where the engine lives.

**Today's reality (baseline):**
- The only competition-adjacent collections that exist are internal `team` / `team_transactions`.
  There is **no** challenge, standings, season, or currency store yet — all net-new.
- The **daily** activity ranking already exists and is trustworthy: `topP0stsV2` (and the simpler
  `top5p0sts`) at `actifit-pst-cr3at0r.herokuapp.com` rank users by that day's *recorded, reward-
  eligible* activity (`store/actions.js:205-231`, surfaced by `pages/leaderboard.vue`). This is the
  **daily input** the engine aggregates — it is *today-only*, so weekly/season windows are net-new.

---

## 2. Scope

### 2.1 In scope (this epic — the Foundation)

1. **Challenge lifecycle** — a generic challenge object with states `draft → open → active →
   resolving → settled → archived` (+ `cancelled`), covering every challenge *type* as configuration
   (duel, league fixture, daily-focus goal, squad goal, brawl, live-ops event, content contest).
2. **Join / participation** — enroll a user (or a squad) into a challenge, with entry gating
   (free / activity-gated) and matchmaking hooks (cohort/division assignment).
3. **Verification** — turn raw activity into a trusted per-participant score for a challenge window,
   with anti-cheat. §4.
4. **Aggregation** — daily → weekly → season standings windows; points, ranking, promotion/
   relegation. §5.
5. **Resolution & payout** — decide winners by rule, distribute from a **pool** (sponsor / DHF /
   treasury funded), emit rewards (AFIT, badges, Merits, boosts). §6, §7.
6. **Earned-only currency ("Merits")** — a non-transferable ledger + rewards shop primitive. §6.
7. **Standings / leaderboard endpoints** — read models for the arena and app surfaces. §8.
8. **Notifications** — lifecycle + result events the clients subscribe to. §9.

### 2.2 Explicitly out of scope (later cards)

- **UI** for any vertical — Vertical A (#172) and B (#173) own their own surfaces.
- **Real-time duel transport** (websockets/push for live 1v1 in-walk progress) — an app concern;
  the engine only needs to accept score updates and expose current standings. A polling contract is
  the v1 default; live transport is an app-led follow-up.
- **GPS/route capture, AI trash-talk** — app-side.
- **Payment rails** — there are none, by design (no user-staked money; pools are sponsor-funded).

### 2.3 Non-negotiable house rule (compliance)

Every challenge in the model is **skill/goal-based** (win by hitting a goal or out-performing on
verified effort — never chance). All prizes come from **sponsor / DHF / treasury pools** with **free
or activity-gated entry**. There is **no user-staked escrow, no pooled wager, no entry-fee pot, and
no paid random crate**. Merits are **earned-only and non-transferable**. These are enforced as
**model invariants**, not UI conventions — see §10.

---

## 3. Data model

Document-oriented (matching the existing `team` / `team_transactions` style). Names are indicative;
the shapes are the contract. IDs are engine-generated (`ch_`, `pt_`, `sea_`, … prefixes).

### 3.1 `challenges`

The generic unit. Challenge *type* is a discriminator; type-specific fields live under `config`.

```jsonc
{
  "id": "ch_...",
  "type": "duel | league_fixture | daily_focus | squad_goal | brawl | liveops | content_contest",
  "title": "…",
  "state": "draft|open|active|resolving|settled|archived|cancelled",
  "visibility": "public | community | private",
  "community": "hive-124594",           // optional scoping (e.g. POLIAC)
  "window": { "start": "ISO", "end": "ISO", "tz": "UTC" },
  "entry": {
    "mode": "free | activity_gated",     // NEVER "fee"
    "gate": { "min_activity": 5000 }     // optional, for activity_gated
  },
  "scoring": {
    "metric": "activity_count | steps | workout_minutes | goal_hit",
    "rule": "max | threshold | head_to_head",
    "threshold": 10000                    // for goal/threshold rules
  },
  "participants_kind": "user | squad",
  "pool_id": "pool_...",                  // funding source; null for badge-only
  "rewards": { "afit": 0, "merits": 0, "badges": ["…"], "chest_tier": null },
  "parent_id": "sea_... | brk_...",       // season, bracket, or live-op grouping
  "created_by": "actifit | <organizer>",
  "audit": { "created_at": "ISO", "settled_at": "ISO" }
}
```

### 3.2 `participants`

One row per (challenge, entity). The verified score for the window is materialized here.

```jsonc
{
  "id": "pt_...",
  "challenge_id": "ch_...",
  "entity_kind": "user | squad",
  "entity": "davidthompson57",            // username or squad id
  "cohort": "golden_league | bronze_3",   // division/cohort assignment
  "score": { "verified": 12040, "raw": 12180, "source": "topP0stsV2", "as_of": "ISO" },
  "state": "enrolled | active | forfeit | disqualified | settled",
  "result": { "rank": 3, "outcome": "win|loss|draw|promoted|relegated", "reward_ref": "led_..." },
  "flags": ["anticheat_review"],          // §4
  "joined_at": "ISO"
}
```

### 3.3 `standings` (aggregation read model)

Materialized weekly/season tables — the net-new piece over today's daily-only feed.

```jsonc
{
  "id": "std_...",
  "scope": "league | season | squad | global",
  "window": { "kind": "weekly|season", "start": "ISO", "end": "ISO", "index": 24 },
  "cohort": "golden_league",
  "rows": [ { "entity": "…", "points": 27, "rank": 1, "delta": "+2",
              "movement": "promote|hold|relegate" } ],
  "computed_at": "ISO"
}
```

### 3.4 `seasons`

```jsonc
{
  "id": "sea_...",
  "program": "leagues | poliac | squads",
  "index": 24,                             // POLIAC-style season number
  "window": { "start": "ISO", "end": "ISO" },
  "tiers": ["bronze","silver","gold","champion"],
  "promotion": { "up": 7, "down": 7 },     // per weekly cohort
  "chest_pool_id": "pool_...",
  "state": "scheduled | active | settling | closed"
}
```

### 3.5 `merits_ledger` (earned-only currency)

Append-only, double-entry, **non-transferable** — see §6.

```jsonc
{
  "id": "led_...",
  "user": "…",
  "delta": 50,                             // + earn, - spend
  "reason": "challenge_reward | season_chest | shop_purchase | admin_adjust",
  "ref": "ch_... | sea_... | shop_...",
  "balance_after": 320,
  "at": "ISO",
  "immutable": true
}
```

### 3.6 `pools` & `sponsors`

```jsonc
// pools
{ "id": "pool_...", "funding": "sponsor|dhf|treasury", "sponsor_id": "spo_...",
  "currency": "AFIT|MERITS|BADGE", "budget": 5000, "committed": 1200, "paid": 800,
  "window": { "start": "ISO", "end": "ISO" }, "state": "open|committed|exhausted|closed" }

// sponsors
{ "id": "spo_...", "name": "…", "funded_total": 5000, "attribution": "…" }
```

### 3.7 `rewards_shop` (Merit sinks)

```jsonc
{ "id": "shop_...", "kind": "cosmetic|boost|badge|fixed_bundle", "title": "…",
  "cost_merits": 200, "stock": "unlimited | N", "random": false }   // random MUST be false
```

### 3.8 Reused, not rebuilt

- **Daily activity input** → `topP0stsV2` / `top5p0sts` (do not re-implement daily ranking).
- **Per-user verification inputs** → `trackedActivity`, `verified_posts`, `getRank/:user`.
- **Badges** → existing `userBadges/:user`, `allUserBadges`, `claimBadge` — Merits/chests can grant
  existing badge types; no parallel badge system.

### 3.9 Persistence: Hive is the system of record

**Decision (2026-08-25):** challenge **definitions, participation, and settled results/rewards are
persisted on-chain** as Hive `custom_json` operations — not just the AFIT payout. Hive is the
**system of record** (an immutable, public, tamper-proof write-ahead log); the backend DB is a
**materialized index** built by *tailing* those ops (the same pattern Actifit already uses to ingest
activity), plus the private/high-frequency layer that must not be on-chain.

| Data | Persistence | Why |
| :-- | :-- | :-- |
| **Raw activity** (the verified input) | **Hive L1 — already there** (`verified_posts` = Actifit posts / `custom_json`) | Read, never re-written. The root of trust is already immutable + public. |
| **Challenge definitions** (create / state changes) | **On-chain** `custom_json` (§3.10) | Public, tamper-proof record of what the contest *was* (rules, window, prizes) — no silent rule changes after the fact. |
| **Participation** (join / leave / enrollment) | **On-chain** `custom_json`, **user-signed** for self-joins | A participant *cryptographically signs* their own entry → non-repudiable, portable, and a strong anti-sybil signal (§4). Auto-enrollment (leagues) is a `@actifit`-signed batch op. |
| **Settled results + reward grants** | **On-chain** `custom_json` (final standings + winners + what each won) | Provably-fair outcomes on public record; doubles as the native "share results into a Hive post" loop. |
| **AFIT prize payout** | **Hive-Engine (L2)** — real HE token transfer, linked from the settle op | Transparent real-token settlement. |
| **Sponsor pool custody** | **On-chain** — funds in an Actifit-controlled pool account | Real AFIT sits on-chain; `pools` tracks accounting against it. |
| **Live/in-progress standings, matchmaking, cohort math, verification state, anti-cheat flags** | **Off-chain (DB index + compute)** | High-frequency, mutable, recomputed continuously — only the *final* result is anchored, never every intermediate recompute. |
| **Merits balance + ledger + rewards shop** | **Off-chain (DB only) — *by design*** | On-chain would make Merits a **tradeable token** and break non-transferable / earned-only (I3/I4). The *award event* is named in the on-chain settle op; the *token itself* stays internal. Off-chain is what *enforces* compliance. |

**Write path is chain-first.** A user action (create a challenge, join) is a `custom_json` broadcast
with the user's existing Hive auth (Keychain / HiveAuth / HiveSigner — the app already signs activity
this way); the engine's **chain-tailer** ingests it, validates against the compliance invariants
(I1–I7) + tier, and materializes the DB index. System ops (auto-enroll, settle) are `@actifit`-signed.
Rejected-on-validation ops are simply not indexed (and flagged), so the invariants still gate what
"counts" even though anyone can post a raw custom_json.

**Cost/scale note:** on-chain writes cost Resource Credits. Mitigations: only *state-changing*
events are anchored (not live standings); auto-enrollment is **batched** into few ops; `@actifit`
already carries the RC to broadcast activity at scale. Confirm RC headroom with the backend owner
(§12.6). This resolves open decisions §12.5 (Merits stay off-chain) and §12.8 (anchor = **yes**,
expanded to challenges + participants + results).

### 3.10 On-chain operations (`custom_json`)

Namespace: a dedicated `id: "actifit_arena"` (indicative). Each op is `{ op, v, ...payload }`,
signed by the authority shown. The engine tails these and is the only thing that *interprets* them;
posting a raw op that fails validation just doesn't get indexed.

```jsonc
// challenge_create — signed by creator (user) or @actifit (official)
{ "op": "challenge_create", "v": 1, "id": "ch_...", "type": "duel|league_fixture|daily_focus|…",
  "origin_tier": "friendly|community|official", "window": {…}, "scoring": {…}, "entry": {…},
  "rewards": {…}, "pool_ref": "pool_...", "created_by": "<user>" }

// challenge_update — signed by creator/@actifit (state transitions)
{ "op": "challenge_update", "v": 1, "id": "ch_...", "state": "open|active|resolving|cancelled" }

// join — signed by the PARTICIPANT (self-join)   |   enroll — @actifit batch (auto-enroll)
{ "op": "join",   "v": 1, "challenge_id": "ch_...", "entity": "<user>", "cohort": "…" }
{ "op": "enroll", "v": 1, "challenge_id": "ch_...", "entities": ["…","…"], "cohort": "…" }

// leave — signed by the participant
{ "op": "leave", "v": 1, "challenge_id": "ch_...", "entity": "<user>" }

// settle — signed by @actifit (final, verified outcome + rewards granted)
{ "op": "settle", "v": 1, "challenge_id": "ch_...",
  "standings": [ { "entity": "…", "rank": 1, "score_verified": 12040 } ],
  "rewards": [ { "entity": "…", "afit": 25, "merits": 50, "badges": ["…"], "he_tx": "<txid>" } ] }
```

The off-chain `challenges` / `participants` / `standings` docs (§3.1–§3.3) become the **indexed
projection** of this op log; each carries the originating `trx_id` so any row is traceable back to
its on-chain source.

---

## 4. Verification & anti-cheat (the core value)

The engine's reason to exist. A challenge score must be **trusted**, or leagues are meaningless and
pools get drained by fraud. Verification runs server-side; clients never assert scores.

**Trust chain (already partly built in Actifit):**
1. **On-chain, reward-eligible activity is the root of trust.** `topP0stsV2` already ranks by that
   day's *recorded* activity (the same signal that drives AFIT rewards), so it inherits Actifit's
   existing activity-verification and manual-entry filters.
2. **Per-participant window score** = sum/selection of that user's verified daily activity across the
   challenge window, pulled from the daily feed + `trackedActivity`, **not** from any client-reported
   number. `participants.score.verified` is engine-computed.
3. **Anti-cheat checks** (flag → `participants.flags`, hold payout on `anticheat_review`):
   - implausible day-over-day spikes vs the user's own history,
   - activity that fails the existing reward-eligibility / manual-entry filter,
   - duplicate/sybil enrollment (same signer across many squad slots),
   - post/verification mismatch (`verified_posts` inconsistency).
4. **Resolution reads only verified scores.** A flagged participant is excluded from payout until
   cleared; pools never pay an unverified score.
5. **Signed on-chain enrollment (§3.9/§3.10) strengthens this.** A self-join is a `custom_json`
   **signed by the participant's own Hive key**, so participation is non-repudiable and the
   "same signer across many slots" sybil check operates on cryptographic identity, not a
   client-asserted name — an alt must be a real, separately-keyed Hive account to even enter.

**Design constraint:** verification must be **idempotent and replayable** for a window — settlement
recomputes from the source feeds so a late correction (e.g. a revoked post) can re-settle before
payout. This is why scores are materialized *with* `raw`, `source`, and `as_of`, not just a number.

---

## 5. Aggregation — daily → weekly → season

Today's feed is **today-only**. Leagues/seasons need windows on top of it.

- A scheduled **daily rollup** snapshots each participant's verified daily score into their active
  challenges (immutable per-day rows — the audit trail verification replays from).
- A **weekly aggregator** computes `standings` for each cohort: points (e.g. POLIAC-style daily
  head-to-head fixtures → W/D/L points, or step-sum), rank, and `movement` (promote/hold/relegate
  per `seasons.promotion`).
- A **season aggregator** closes the season window, assigns final tiers, and triggers **reward
  chests scaled by peak tier** from the season pool.

**POLIAC as the reference implementation of "league":** named divisions (Golden/Silver…), a
round-robin scheduler producing daily 1v1 fixtures (higher verified activity that day wins the
fixture), ~5-week seasons with promotion/relegation. The engine models a fixture as a `duel`-type
challenge with `rule: head_to_head`, grouped under a `season`; the round-robin scheduler is a
challenge-generator on top of the engine, not a special case inside it.

---

## 6. Merits — the earned-only currency primitive

The anti-gambling spend primitive. **Invariants (enforced in the ledger service, §10):**

- **Earned-only:** the only positive `delta` reasons are `challenge_reward`, `season_chest`,
  `admin_adjust`. There is **no** `purchase`/`deposit`/`buy` credit path — Merits cannot be bought.
- **Non-transferable:** there is **no** user→user transfer endpoint. Merits move only user↔system.
- **Spend sinks** are the `rewards_shop` (`kind: cosmetic|boost|badge|fixed_bundle`) — all
  **fixed-content**; `random` is hard-set `false` (no crates / loot boxes).
- **Append-only, double-entry** ledger; `balance_after` is derived and reconcilable; rows are
  immutable (corrections are new compensating rows, never edits).

Merits are **distinct from AFIT** (AFIT is the real, transferable token; pools may pay AFIT, but
that is sponsor/DHF/treasury-funded, never user-staked). Merits are the "safe" in-app spend loop.

---

## 7. Pools & payout (house-rule funding)

- Every reward-bearing challenge references a `pool` whose `funding` is `sponsor|dhf|treasury`.
  There is **no** funding type sourced from participant stakes — the enum does not contain one.
- On resolution: winners/tiers are computed from verified standings → payout amounts are drawn
  against the pool (`committed → paid`), emitting `merits_ledger` rows and/or AFIT transfers and/or
  badge grants, each linked back to the `participant.result.reward_ref`.
- A pool cannot pay beyond `budget`; over-subscription splits by rule (rank-weighted), never by
  taking from users.

### 7.4 Challenge origination — project-sponsored **and** user-initiated

The engine serves **both** official contests and challenges users create themselves, on the *same*
lifecycle. What differs is a **permission + funding tier** that keeps user-created challenges
compliant and abuse-resistant. `challenges.created_by` + a new `origin_tier` field drive this.

| Tier | Who may create | Challenge types | Reward source | Guardrail |
| :-- | :-- | :-- | :-- | :-- |
| **Friendly** | any authenticated user | duel, small group / step-goal (invite friends), bragging-rights | **badge + system-capped Merits only — NO AFIT** | rate-limited per user; **Merit emission capped per challenge** (see anti-abuse below) |
| **Community** | verified / community leaders above a rank threshold (`getRank`) | community-scoped leagues, group events | optional **self-sponsored** or external-sponsor AFIT pool | funder is a **non-participant sponsor** (I7); light moderation/report |
| **Official** | Actifit / admin role | the default set (§7.5) + live-ops | **DHF / treasury / sponsor** pools | featured; the always-on spine |

**Creation flow (web arena surface leads):** a creation wizard → pick **type** → set
**window / metric / cohort / invitees / visibility** → choose **reward tier**
(badge-only ▸ Merits ▸ self-sponsored pool) → `POST challenges`. The engine validates the payload
against **both** the compliance invariants (I1–I6) **and** the creator's `origin_tier` (e.g. a
Friendly-tier user cannot attach an AFIT pool). Verification + anti-cheat (§4) apply identically to
every tier — a user-made challenge is scored from the same trusted activity feed, so it can't be
gamed any more easily than an official one.

**User self-funding is sponsorship, not a wager — CONFIRMED (§12.7, 2026-08-25):** Community-tier
users **may** put up AFIT for a challenge they create. The funder is recorded as a **`sponsor`** and
is made **ineligible to win their own funded pool** — so there is no path where a user stakes money
into a pot they can win back. This is the line that keeps user-funded challenges on the right side of
the house rule, and it is an enforced invariant:

> **I7 — a pool's funder cannot be a paid participant of a challenge that pool rewards.**

**Anti-abuse (Merit farming via alts).** Because Friendly-tier challenges mint system Merits, a
sybil could spawn fake challenges among alt accounts to farm Merits. Mitigations, all engine-side:
per-user **daily cap on system-funded Merit emission**, Merits only for challenges with ≥N *distinct
verified* participants, reuse of the §4 sybil/duplicate-signer checks, and min account-age/rank to
create funded challenges. Farmed Merits are also low-value by construction (non-transferable,
fixed-content sinks only).

### 7.5 Minimum default contest set (launch spine)

The always-on, project-sponsored contests the engine should ship with — the industry-standard
minimum, each mapping to a proven mechanic and to Vertical A + cross-cutting in the roadmap. All are
skill/goal-based and pool-funded (house-rule compliant):

| # | Default contest | Cadence | Basis | Funding | Engine type |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | **Weekly Step League** — 30-user cohorts by activity level; promote/relegate Bronze→Champion | weekly | Duolingo leagues · POLIAC | treasury / sponsor | `league_fixture` under a `season` |
| 2 | **Daily Focus Goal** — rotating auto-verified target (10k steps / cardio day) → chest threshold | daily | Splinterlands daily focus · revives *AutomaticWin* | treasury | `daily_focus` |
| 3 | **Season ladder + reward chests** — chests scaled by peak tier | ~2 weeks | Splinterlands seasons | DHF / treasury | `season` wrapper |
| 4 | **Weekly Global Top-N** — sponsor pool split by rank | weekly | native *"Top 250"* (hand-run today) | sponsor | `liveops` (global) |
| 5 | **Weekend Warrior** — a Sat–Sun step/activity push; joinable solo or with friends; own leaderboard + chest | weekly (Sat–Sun) | **Fitbit Weekend Warrior** | treasury / sponsor | `liveops` (weekend window) |
| 6 | **Monthly live-ops themed event** — e.g. "1M-Steps City Walk", Ramadan / New-Year | monthly | Monopoly GO · in-person Actifit Challenge | sponsor | `liveops` |

These 6 are all **solo / global** — the launch spine (Vertical A #172 + cross-cutting). The
**Weekend Warrior** (#5) is a deliberately low-commitment, high-participation hook for the days when
people have time to move, and it re-uses the `liveops` type with a weekend window — cheap to ship.
**Squad Wars / Brawls** (Vertical B #173) is the natural **7th** default once squads exist, but it
depends on the team layer so it is not in the day-one set. Shipping #1–#6 makes The Arena feel alive
from launch without waiting on the team features.

---

## 8. API surface (what clients consume)

Draft contract, under `actiAppUrl` alongside existing endpoints. Read models are cache-friendly;
writes are organizer/engine-authenticated. (Method/paths indicative — finalize with backend owner.)

**Discovery / read (web arena + app):**
- `GET  challenges?type=&state=&community=&entity=` — browse/filter.
- `GET  challenges/:id` — detail + current standings snapshot.
- `GET  standings?scope=&window=&cohort=` — weekly/season tables.
- `GET  seasons/:program/current` — active season + tiers + schedule.
- `GET  merits/:user` — balance + ledger page.
- `GET  shop` / `GET  pools/:id` — shop catalog / pool status (transparency).

**Participation (clients write — chain-first, §3.9):** the state-changing writes (create / join /
leave / settle) are **`custom_json` broadcasts signed by the user or `@actifit`** (§3.10), which the
engine's chain-tailer indexes. The HTTP endpoints below are **prepare/validate + broadcast helpers**,
not the source of truth — a client may broadcast the op itself (as it already does for activity) and
the engine picks it up, or POST here to have the op validated/built:
- `POST challenges/:id/join` — validate entry-gate + build the user-signed `join` op (broadcast client-side).
- `POST challenges/:id/leave`.
- `POST challenges` — **create** (official organizer tools *and* the user creation wizard, §7.4);
  derives the caller's `origin_tier` from role/rank, validates type + config + reward tier against it
  (a Friendly-tier user cannot attach an AFIT pool), then emits the `challenge_create` op.
- `POST challenges/:id/sponsor` — attach/commit funding to a pool (Community-tier self-sponsor or an
  external sponsor); records the funder as a **non-participant** sponsor (invariant I7).
- `POST challenges/:id/score` — *app live path*: submit progress; **advisory only**, the engine
  re-verifies against the activity feed before it counts (never anchored on-chain until `settle`).

**Engine-internal (not client-exposed):** the **chain-tailer/indexer** (§3.9 — tails `actifit_arena`
custom_json → materializes DB), **seed/refresh the default contest set (§7.5)**, daily rollup,
weekly/season aggregation, resolution, **emit `settle` op + Hive-Engine payout**, anti-cheat sweep,
Merit-emission cap enforcement — scheduled jobs.

**Auth:** reads mostly public (standings are spectator content); joins require the user's Hive auth
(reuse the app's existing auth); **create is tiered** (any user → Friendly; rank-gated → Community;
role-gated → Official); engine jobs internal.

---

## 9. Notifications

Lifecycle + outcome events the clients subscribe to (ties into the roadmap's web-push item §5.1 and
the app's native push): `challenge_opening`, `you_were_matched`, `fixture_today`, `window_closing`
("you're about to lose your streak"), `results_settled`, `promoted/relegated`, `chest_awarded`,
`squad_goal_progress`. The engine emits an event stream; each client renders it in its own channel.

---

## 10. Compliance invariants (enforced, not documented)

These are **model/service-level guarantees**, checked in code and coverable by tests — the reason
the whole system stays on the right side of the house rule:

| # | Invariant | Enforcement point |
| :- | :- | :- |
| I1 | No challenge has `entry.mode == "fee"` | `challenges` schema — enum excludes `fee` |
| I2 | Every reward pool `funding ∈ {sponsor,dhf,treasury}` | `pools` schema — enum has no stake source |
| I3 | Merits have no buy/deposit credit path | `merits_ledger` — credit `reason` whitelist |
| I4 | Merits are non-transferable | no user→user transfer endpoint exists |
| I5 | No shop item is random | `rewards_shop.random === false` invariant |
| I6 | Outcomes decided by verified effort/goal, never chance | `scoring.rule ∈ {max,threshold,head_to_head}` |
| I7 | A pool's funder is not a paid participant of a challenge it rewards | resolution excludes funder from that pool's payout (§7.4) |

A conformance test suite asserting I1–I7 against the schemas is part of the Foundation deliverable —
it's what lets every future challenge type (official **or** user-created) ship without re-litigating
compliance.

---

## 11. Web (this repo) integration points

What this repo builds **once the contract lands** (these become Vertical-card sub-tasks, not this
epic):

- **Arena hub** — a new `pages/arena/` (discover/browse `GET challenges`, spectate standings).
- **Standings & brackets** — reuse `pages/leaderboard.vue` patterns; new weekly/season table
  components fed by `GET standings`.
- **Organizer/admin tools** — create/manage challenges, seasons, squads, live-ops (`POST challenges`).
- **Merits & shop surface** — balance + `rewards_shop` (`GET merits/:user`, `GET shop`).
- **Share results into Hive posts** — render a settled challenge/standings into a post (Actifit's
  existing posting flow) — the native distribution loop.
- `CompetitionAnnounce.vue` (today a static banner) becomes a live, data-driven entry point.

Nothing here is built under #171; #171 delivers the contract these consume.

---

## 12. Open decisions (resolve with backend owner before build)

1. **Store** — extend the existing Mongo-style store the `team`/`team_transactions` collections use,
   or a dedicated service? (Leaning: same store, new collections **as the index over the on-chain op
   log** (§3.9), to reuse auth + activity access.)
2. **Points model for leagues** — POLIAC-style W/D/L fixture points vs raw step-sum vs ELO rating.
   (Leaning: fixtures = head-to-head points for POLIAC parity; a separate rating for matchmaking.)
3. **Real-time vs polling for duels** — v1 polling contract; live transport a later app-led add.
4. **Squad identity** — reuse/extend the internal `team` collection or a new `squads` collection?
5. ~~**Merits ↔ AFIT boundary**~~ — **RESOLVED** (§3.9): Merits are purely internal / off-chain /
   non-transferable by construction; AFIT payouts ride existing Hive-Engine.
6. **RC / scheduler ownership** — engine-internal cron vs an existing Actifit job runner, **and
   confirm `@actifit` RC headroom** for the on-chain writes (§3.9 — batched enroll + settle only,
   not live standings). Engine lives in `actifit/actifit-bot`, which already runs scheduled jobs +
   broadcasts at scale, so this is a capacity check, not new infra.
7. ~~**User self-funded pools**~~ — **RESOLVED: YES** (§7.4). Allowed at Community tier, guarded by
   invariant I7 (funder = non-participant sponsor).
8. ~~**On-chain persistence / result anchoring**~~ — **RESOLVED: YES, expanded** (§3.9/§3.10).
   Challenges, participation, and settled results/rewards are all persisted on-chain as
   `actifit_arena` custom_json; the DB is a materialized index. AFIT payouts ride Hive-Engine.
9. **`custom_json` namespace + op versioning** — confirm `id: "actifit_arena"` (vs reusing the
   existing `actifit` id with an op field) and a `v` field for forward-compat. (Leaning: dedicated
   namespace, keeps the arena op stream cleanly filterable from activity.)

---

## 13. Phasing → sub-tasks (proposed sub-cards under #171)

Ordered so each phase unblocks the next; F1–F3 are the minimum that lets Vertical A start. Built in
**`actifit/actifit-bot`** (backend); the web sub-tasks (§11) follow on merge.

| Phase | Deliverable | Unblocks |
| :- | :- | :- |
| **F0** | Spec reviewed + remaining decisions (§12.1–4, 6, 9) settled with backend owner | everything |
| **F1** | On-chain op schema (`actifit_arena`, §3.10) + **chain-tailer/indexer** + `challenges`/`participants` collections (incl. `origin_tier`) + lifecycle state machine | join/resolve |
| **F2** | **Verification** service (window score from activity feed + anti-cheat/anti-sybil, incl. signed-join check) §4 | trust |
| **F3** | **Aggregation** — daily rollup + weekly/season `standings` §5 | Vertical A (#172) |
| **F4** | **Merits ledger** + rewards shop + Merit-emission caps + compliance invariant tests (I1–I7) §6, §10 | spend loop |
| **F5** | **Pools + resolution/payout** (`settle` op on-chain + AFIT on Hive-Engine) + **tiered creation & sponsor** endpoints §7 | prizes + user-created |
| **F6** | **Read API** (discovery/standings/merits) + **notifications** stream + **seed the §7.5 default contest set** (incl. Weekend Warrior) §8, §9 | all clients + live launch |

**Definition of done for #171:** F0–F6 contracts published (on-chain op schema + DB index + endpoint
list + invariant tests I1–I7 green), the §7.5 default contests seeded, so #172 and #173 can each be
broken into client-side sub-tasks against a frozen API.

**Sub-cards (created 2026-08-25, Backlog):** F1 → Trello #175 · F2 → #176 · F3 → #177 · F4 → #178 ·
F5 → #179 · F6 → #180. Dependency chain: F1 → {F2, F4}; F2 → F3; {F2,F4} → F5; {F3,F5} → F6.

---

*Owner: backend (`actifit/actifit-bot`) + web (this repo, consumer). This doc is the scope-first
artifact for #171. Product decisions are settled (on-chain persistence, user self-funding, weekend
challenge); remaining §12 items are backend-implementation calls — settle those, then the phase rows
become sub-cards.*
