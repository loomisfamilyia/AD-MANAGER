# Personal Risk Manager — Build Plan

How we get from this planning folder to clients playing it, in milestones
small enough to finish, test and show. Each milestone is named after the level
the world reaches, and ends with something the Loomis team can play on their
phones.

## How the team works

Usage is limited, so each kind of work goes to the cheapest Claude that does
it well:

| Who | Model | Good for |
|---|---|---|
| **Lead** | Opus | Architecture, schema and RLS changes, security review of every milestone, integration, reviewing builders' work, anything touching money or permissions |
| **Builders** | Sonnet | Feature components, edge functions, Playwright tests, the prototype, animation and sound passes |
| **Helpers** | Haiku | Copy edits, catalog content (new kinds, questions, plain-English text), test fixtures, doc updates, renaming |

Rules of the road:

- **One ticket per session.** Start each session with: *"Read
  `risk-manager/README.md` and `risk-manager/docs/BUILD_PLAN.md`, then do
  ticket M1-3."* Every ticket below has enough context to start cold.
- **Schema changes go through the Lead** and must keep `npm run test:rls`
  green, with a new test for the new rule.
- **Every UI ticket ends with phone screenshots** at 390×844 and 360×800.
- **The pillars in GAME_DESIGN.md §1 outrank any ticket.** If a ticket would
  break one, stop and ask.
- Work happens in the **Lovable site's repository** once it's connected to
  GitHub and added to Claude sessions (TECHNICAL_DESIGN.md §3). Small changes
  can also be made with Lovable's own editor; tell it to follow
  `risk-manager/docs/`.

Sizes: **S** ≈ one focused session · **M** ≈ two or three · **L** ≈ split it.

---

## M0 · Planning — *this branch* ✅

- [x] Game design, technical design, data-source research
- [x] Catalog: lines, categories, thing kinds, coverages, life events, validator
- [x] Supabase schema with RLS and the PGlite attack suite
- [x] Playable prototype (`risk-manager/prototype/index.html`)
- [ ] **Loomis decisions** — GAME_DESIGN.md §14 (states, lines written, mascot, art, reply promise, staff, anonymous start)

## M1 · "Open Field" — the world exists and remembers you

Goal: a client can sign in, see their world, add people, a home and a car with
basic questions, and come back tomorrow to find them there.

| # | Ticket | Who | Size | Done when |
|---|---|---|---|---|
| M1-1 | Install the schema on the site's Supabase project (TECHNICAL_DESIGN.md §9), including the over-broad-policy audit. Generate TS types. | Lead | S | Audit query clean; `test:rls` green; types committed |
| M1-2 | Copy the catalog into the site; add `catalog:check` to CI | Haiku | S | Validator passes in CI |
| M1-3 | Auth: anonymous start with Turnstile, "Save my world" with a 6-digit email code, sign back in with a code | Sonnet | M | Works on iPhone Safari *and* as a home-screen app; no magic links |
| M1-4 | `juice/` module: sound sprite player (unlock on first tap, mute, respects iPhone silent switch), haptics, `useMotion()` with reduced-motion, text-size setting | Sonnet | S | Settings persist; reduced motion replaces every animation with a fade |
| M1-5 | World renderer: ground growth, zones, auto-fit camera, Loomis HQ on its hill, things as buttons with idle bob | Sonnet | M | 30 things render smoothly on a budget Android; every thing has a full aria-label |
| M1-6 | Add flow engine driven by the catalog: category grid → kinds → one question per screen, all question types except photo/VIN/address; autosave per answer; "Skip" and "I don't know" | Sonnet | L → split by question type | Adding any catalog kind works without kind-specific code |
| M1-7 | The placement sequence and first-time reveals (house rises, driveway) | Sonnet | M | Matches GAME_DESIGN.md §6.1 timing; tappable throughout |
| M1-8 | "My stuff" list view and thing detail sheet (view, edit, delete with Undo) | Sonnet | M | Full parity with the map; screen-reader pass |
| M1-9 | Security review of M1 | Lead | S | No `dangerouslySetInnerHTML`; no secrets in `VITE_`; no pixels in `/my-world` |

## M2 · "Homestead" — the deep tree

Goal: every category in the catalog is addable, with the magic moments.

| # | Ticket | Who | Size | Done when |
|---|---|---|---|---|
| M2-1 | Photo question: camera capture, canvas downscale + re-encode, upload to `household-files/{household_id}/`, signed-URL display | Sonnet | M | Uploaded files have no EXIF GPS; another household can't fetch them |
| M2-2 | `vin-decode` + `recalls` edge functions (NHTSA, cached); VIN question with "Where's my VIN?" helper | Sonnet | M | Decodes a real VIN; graceful when NHTSA is down |
| M2-3 | VIN barcode scanning with the `barcode-detector` polyfill | Sonnet | S | Scans a door-jamb label on iPhone and Android; typing always available |
| M2-4 | `address-search` + `property-lookup` edge functions (Google Places, RentCast), "We found…" confirmation card | Sonnet | M | Cached per address; client confirms before anything is saved |
| M2-5 | Home detail: systems with ages, special features with discount sparkles, "Good to know" cards | Sonnet | M | All home system kinds addable from inside a residence |
| M2-6 | Home inventory: rooms, "Take a tour" camera walk, running total, celebrations at 10/25/50 items | Sonnet | M | 100 items stay fast; total is correct |
| M2-7 | Family tree view: add parent/child/partner from any person; auto layout | Sonnet | M | Three generations lay out cleanly on a 360px screen |
| M2-8 | Remaining reveals (lake, pasture, town road, vault chest, shed) and the vault view | Sonnet | S | Each plays once per world |
| M2-9 | Business kind with the v1 hard stop | Haiku | S | Only name + description; friendly stop card |
| M2-10 | Copy pass on every question and "Good to know" note (6th-grade reading level) | Haiku | S | Readability checked; no fear language |

## M3 · "Neighborhood" — protect it

Goal: the full loop — plan, budget, send to Loomis, get a reply.

| # | Ticket | Who | Size | Done when |
|---|---|---|---|---|
| M3-1 | Protect mode: world tint, shields with the four states, legend, coverage cards with Need / Want / Not now, "Whole family" card | Sonnet | M | Shield state comes only from `shieldFor()` (TECHNICAL_DESIGN.md §4.3) |
| M3-2 | Budget screen: total, monthly/yearly, per-line steppers, unassigned coins | Sonnet | S | Writes `households.monthly_budget` and `budget_lines` |
| M3-3 | HQ thread: realtime messages, quick chips, "Can someone call me?", unread badge on HQ, `prm_mark_thread_read` | Sonnet | M | Two phones see each other's messages within a second |
| M3-4 | Quote request: plan summary by line, note, send; paper-plane flight; shields go to "requested" | Sonnet | M | Snapshot in the database matches what the client saw |
| M3-5 | `notify-staff` / `notify-client` emails (no personal details in email bodies) | Sonnet | S | Arrive within a minute; links deep-link into the app |
| M3-6 | Quests and life events: starter quest chain, life-event picker, badges | Sonnet | M | No reward has cash value (GAME_DESIGN.md §10) |
| M3-7 | Security + E&O wording review of M3 | Lead | S | Every protect screen says it's a plan, not insurance |

## M4 · "Hometown" — Loomis HQ console

Goal: staff can run the inbox and turn shields gold.

| # | Ticket | Who | Size | Done when |
|---|---|---|---|---|
| M4-1 | Staff sign-in with TOTP enrollment (required for `aal2`) | Sonnet | S | A staff login without MFA sees nothing |
| M4-2 | Inbox: all threads, unread first, reply as staff (name + photo) | Sonnet | M | Replies show the staff member's name on the client's phone |
| M4-3 | Household 360: everything the client entered, family tree, files, activity trail, agency notes, link to AMS record | Sonnet | M | Read-only for client data by default; edits are logged |
| M4-4 | Quote pipeline: new → in review → quoted → won/lost, assigned to staff | Sonnet | S | Status visible to the client |
| M4-5 | Policy verification: add an in-force policy, link it to things → gold shields + the big celebration on the client's next visit | Sonnet | M | Only staff can do this (already enforced by RLS — test it end to end) |
| M4-6 | `forward-lead` to the Ads Manager with first-touch UTMs | Sonnet | S | A test quote request shows up attributed in the Ads Manager |

## M5 · "Big Sky" — polish and launch

| # | Ticket | Who | Size |
|---|---|---|---|
| M5-1 | Commissioned art drop-in (thing kinds × color variants, terrain, HQ, avatars) | Sonnet | M |
| M5-2 | Professional sound set as one audio sprite | Sonnet | S |
| M5-3 | PWA: manifest, icons, offline shell, install prompt | Sonnet | S |
| M5-4 | Accessibility audit: axe, VoiceOver, TalkBack, 130% text, reduced motion | Sonnet + Lead | M |
| M5-5 | Device lab with real people: one 8-year-old (with a parent), one 80-year-old, everyone in between | Loomis | — |
| M5-6 | Counsel + E&O review (TECHNICAL_DESIGN.md §5.4) | Loomis | — |
| M5-7 | `nightly-cleanup` and backups / point-in-time recovery | Lead | S |
| M5-8 | Beta with ~10 friendly clients; fix the top five frustrations | Everyone | — |

## Later (v2+)

- Spouse or family member joins the same world (invite code → `household_users`)
- Web push for home-screen installs; renewal and home-maintenance reminders
- Claim-ready inventory PDF export
- Document vault (declarations pages, appraisals), with staff upload
- SMS sign-in codes; passkeys once Supabase's support is out of beta
- "Show my real neighborhood" map backdrop (opt-in)
- Arrange-my-world (drag things around, using `world_position`)
- Merge an anonymous world into an existing account
- Commercial lines — the next big game, built on the same catalog shape
