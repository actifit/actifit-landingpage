# Challenge Engine — Technical Scope & Design Spec

> **Trello #171** (EPIC · backend-led · *scope-first*). Gates Vertical A (Leagues & Seasons, #172)
> and Vertical B (Squads & Brawls, #173). Roadmap context: `tasks/feature-backlog.md` §2.1 + §2.1.e.
>
> **Status:** DRAFT for review — this is the "scope first" deliverable the epic asks for. It defines
> the data model, verification approach, API surface, currency primitive, and phasing so the two
> vertical epics can be broken into buildable sub-tasks against a settled contract. No client code
> ships from this card; it produces the contract every client will build against.

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

**Participation (clients write):**
- `POST challenges/:id/join` — enroll user/squad (entry-gate checked server-side).
- `POST challenges/:id/leave`.
- `POST challenges` — organizer creates (web organizer tools); type+config validated.
- `POST challenges/:id/score` — *app live path*: submit progress; **advisory only**, the engine
  re-verifies against the activity feed before it counts.

**Engine-internal (not client-exposed):** daily rollup, weekly/season aggregation, resolution,
payout, anti-cheat sweep — scheduled jobs.

**Auth:** reads mostly public (standings are spectator content); joins require the user's Hive auth
(reuse the app's existing auth); organizer/admin actions gated to a role; engine jobs internal.

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

A conformance test suite asserting I1–I6 against the schemas is part of the Foundation deliverable —
it's what lets every future challenge type ship without re-litigating compliance.

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
   or a dedicated service? (Leaning: same store, new collections, to reuse auth + activity access.)
2. **Points model for leagues** — POLIAC-style W/D/L fixture points vs raw step-sum vs ELO rating.
   (Leaning: fixtures = head-to-head points for POLIAC parity; a separate rating for matchmaking.)
3. **Real-time vs polling for duels** — v1 polling contract; live transport a later app-led add.
4. **Squad identity** — reuse/extend the internal `team` collection or a new `squads` collection?
5. **Merits ↔ AFIT boundary** — confirm Merits are purely internal (no on-chain representation), to
   keep them un-tradeable by construction.
6. **Scheduler ownership** — engine-internal cron vs an existing Actifit job runner.

---

## 13. Phasing → sub-tasks (proposed sub-cards under #171)

Ordered so each phase unblocks the next; Phase 1 is the minimum that lets Vertical A start.

| Phase | Deliverable | Unblocks |
| :- | :- | :- |
| **F0** | This spec reviewed + open decisions (§12) settled with backend owner | everything |
| **F1** | Schema + `challenges`/`participants` collections + lifecycle state machine | join/resolve |
| **F2** | **Verification** service (window score from activity feed + anti-cheat flags) §4 | trust |
| **F3** | **Aggregation** — daily rollup + weekly/season `standings` §5 | Vertical A (#172) |
| **F4** | **Merits ledger** + rewards shop + compliance invariant tests (I1–I6) §6, §10 | spend loop |
| **F5** | **Pools + resolution/payout** §7 | prizes |
| **F6** | **Read API** (discovery/standings/merits) + **notifications** stream §8, §9 | all clients |

**Definition of done for #171:** F0–F6 contracts published (schemas + endpoint list + invariant
tests green), so #172 and #173 can each be broken into client-side sub-tasks against a frozen API.

---

*Owner: web + backend. This doc is the scope-first artifact for #171 — review, settle §12, then the
phase rows become sub-cards.*
