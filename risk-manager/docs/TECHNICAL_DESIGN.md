# Personal Risk Manager — Technical Design

How the game in [GAME_DESIGN.md](GAME_DESIGN.md) gets built inside the Lovable
site and its Supabase database. The schema is
[`../supabase/schema.sql`](../supabase/schema.sql); the catalog of things and
coverages is [`../src/catalog`](../src/catalog); research behind every
third-party choice is in [DATA_SOURCES.md](DATA_SOURCES.md).

---

## 1. Architecture

```
  CLIENT'S PHONE                         SUPABASE (the Lovable site's project)
 ┌──────────────────────────┐          ┌───────────────────────────────────────┐
 │ Lovable site (React)     │          │ Auth   anonymous → email code; staff MFA│
 │  /my-world/*  the game   │◀────────▶│ Postgres  RLS on every table          │
 │  catalog (in code)       │  HTTPS   │ Storage   private household-files     │
 │  world renderer, sounds  │  + RLS   │ Realtime  household_messages          │
 └──────────────────────────┘          │ Edge Functions ─┐                     │
                                        └─────────────────┼─────────────────────┘
  LOOMIS STAFF                                            │ API keys live here only
 ┌──────────────────────────┐                             ▼
 │ Same Lovable site        │                 ┌─────────────────────────┐
 │  /staff/*  inbox, quotes,│                 │ RentCast  property data │
 │  household 360, policies │                 │ NHTSA     VIN + recalls │
 │  (MFA required)          │                 │ Google    address search│
 └──────────────────────────┘                 │ Email     notifications │
                                              └─────────────────────────┘
                                                          │
                                   quote request ────────▶│ Ads Manager (this repo,
                                   with first-touch UTMs   │ separate project): a
                                                           ▼ lead, attributed to
                                                             the campaign
```

**One app, two audiences.** Clients and staff use the same Lovable site and
the same database. The difference is enforced in Postgres, not in the UI: RLS
decides what each login can see, so a bug in a React component can't show one
client another client's house.

---

## 2. Stack

Stay on Lovable's defaults wherever possible, so that Lovable's editor and any
Claude session can both work on the code.

| Concern | Choice | Why |
|---|---|---|
| App | React + TypeScript + Vite + Tailwind + shadcn/ui | Lovable's default; matches the Ads Manager |
| Data | `@supabase/supabase-js` + TanStack Query | Lovable projects usually have both; caching + optimistic updates make taps feel instant |
| UI motion | `framer-motion` | Springs, layout animations and exit animations for sheets and the placement sequence |
| World renderer | **SVG/DOM layer animated with framer-motion** for v1 | Every thing in the world is a real `<button>` — accessible, testable, and plenty fast for ~50 objects. Switch to PixiJS only if profiling on a low-end Android says so |
| Sound | A ~40-line Web Audio wrapper playing one audio sprite (or Howler.js) | One file, one decode, instant playback |
| Forms | Generated from the catalog; answers validated with `zod` | Adding a thing kind is a data change, not a new screen |
| Install | PWA via `vite-plugin-pwa` | Home-screen icon, full-screen feel, and (later) web push on iPhone |
| Photos | Downscale + re-encode in a `<canvas>` before upload | ~200 KB instead of 5 MB, and re-encoding drops EXIF location data |

**Performance budget.** Design target is a three-year-old budget Android phone:
animations use only `transform` and `opacity`; the `/my-world` route ships
under ~300 KB of JavaScript (gzipped) with sheets lazy-loaded; images are
thumbnails with signed URLs; sounds are one sprite under 200 KB.

---

## 3. Where the code lives

This folder sits in the Ads Manager repository because that's the only
repository this planning session could reach. **The production code belongs in
the Lovable site's own repository.**

1. In Lovable, connect the site to GitHub (Lovable keeps the two in sync).
2. Add that repository to Claude Code sessions, so future build sessions work
   directly in it.
3. Copy `risk-manager/src/catalog/` into the site as
   `src/features/risk-manager/catalog/`, and run `risk-manager/supabase/schema.sql`
   against the site's database (§9).

Suggested layout inside the Lovable site:

```
src/features/risk-manager/
  catalog/          ← copied from here, unchanged
  world/            World.tsx, zones.ts, Thing.tsx, reveals.ts, camera.ts
  add/              AddSheet.tsx, QuestionScreen.tsx, inputs/*  (one per QuestionType)
  protect/          ProtectMode.tsx, CoverageCard.tsx, shields.ts
  budget/           BudgetScreen.tsx
  hq/               HQThread.tsx, QuoteRequestSheet.tsx
  juice/            sound.ts, haptics.ts, celebrate.ts, motion.ts
  data/             queries.ts (TanStack), types.ts (generated from Supabase)
src/pages/staff/    Inbox.tsx, Household.tsx, Quotes.tsx
```

Routes:

| Route | Screen |
|---|---|
| `/my-world` | The world |
| `/my-world/stuff` | "My stuff" list view (accessible alternative to the map) |
| `/my-world/thing/:id` | A thing's detail sheet (deep-linkable from staff messages) |
| `/my-world/protect` | Protect mode |
| `/my-world/budget` | Budget |
| `/my-world/hq` | The Loomis HQ thread |
| `/staff/inbox` · `/staff/quotes` · `/staff/households/:id` | Staff console |

Sheets are routes, so the phone's back button closes them. That matters more
than it sounds: older users press Back to get out of anything.

---

## 4. Data model

```
 auth.users ──┬── household_users ──▶ households ◀── household_agency (staff only)
              │        (owner)            │
              └── staff_members           ├── people ◀── person_links (family tree)
                                          │     ▲
                                          ├── assets ─┬─ parent_id (systems, inventory → residence)
                                          │     ▲     └─ owner_person_id → people
                                          │     ├── property_records (written by edge function)
                                          │     └── household_files ──▶ storage: household-files/{household_id}/…
                                          ├── coverage_choices (need / want / not now per coverage per thing)
                                          ├── budget_lines (desired $/month per line)
                                          ├── household_contacts (name, phone, email, how to reach them)
                                          ├── quote_requests (server-built snapshot; source = quote_request | saved_world)
                                          ├── insurance_policies ◀── insurance_policy_links (staff only)
                                          ├── household_messages (one thread; realtime)
                                          ├── household_achievements
                                          └── household_activity (audit: who/what/when, no values)
```

### 4.1 The catalog ↔ database contract

The catalog is code. The database stores catalog **ids** and **answers**:

| Database column | Holds | Catalog source |
|---|---|---|
| `assets.kind` | `"car"`, `"house_owned"`, `"roof"`, `"dog"`… | `ThingKind.id` |
| `assets.details` | `{ "vin": "…", "year": 2019, "rideshare": false }` | `ThingKind.questions[].id` → answer |
| `people.details` | person answers that aren't columns | person kind questions |
| `coverage_choices.coverage_id` / `.line` | `"auto_collision"` / `"auto"` | `Coverage.id` / `Coverage.line` |
| `budget_lines.line` | `"auto"` | `Line.id` |

So: **adding a thing kind, a question or a coverage needs no migration.**
Renaming an id does (it's a join key) — treat ids as permanent.

`details` is validated in the app with a zod schema generated from the
catalog's questions. The database only checks it's a JSON object under 32 KB;
it deliberately doesn't know the catalog.

### 4.2 Answer conventions

- An unanswered question is **absent** from `details`.
- "I don't know" is stored as `null` for that key. Present-but-null counts as
  answered for the progress ring, and tells the agent what to ask.
- "Skip for now" stores nothing.
- `assets.completeness` (0–100) is computed client-side from the catalog on
  every save, and stored so staff lists can sort by it.

### 4.3 Deriving a shield

```ts
function shieldFor(target, coverageChoices, policyLinks): ProtectionState {
  if (policyLinks.some(l => covers(l, target) && l.policy.status === "active")) return "verified";
  const live = coverageChoices.filter(c => targets(c, target) && c.stance !== "not_now");
  if (live.length === 0) return "none";
  if (live.every(c => c.requested_at && c.requested_at >= c.updated_at)) return "requested";
  return "planned";
}
```

`verified` comes only from `insurance_policies`, which only staff can write.
The client can't produce a gold shield even with a modified app.

---

## 5. Security and privacy

This app holds a family's names, birthdates, addresses, vehicles, and photos
and values of their valuables. That's a burglar's shopping list and an
identity thief's starter kit, so the posture is "deny by default, prove it
with tests."

### 5.1 Threats and what stops them

| Threat | Control | Where |
|---|---|---|
| A client reads or edits another client's data | RLS on every table; `household_id in (select prm_my_household_ids())`; composite foreign keys make cross-household references impossible | schema.sql, tested |
| **This database already has a "staff can see everything" policy** like the Ads Manager's `to authenticated using (true)` | Run the audit query at the top of schema.sql before installing. Any such policy exposes that table to every client | §9 |
| A staff password is phished | Staff access requires MFA (`aal2`) in `prm_is_staff()`; staff are a table, so removal is immediate | schema.sql |
| Anonymous sign-ins mint `authenticated` sessions | Anonymous users can only touch their own world; messages and quote requests require a permanent account; CAPTCHA on sign-in; stale anonymous users are purged | schema.sql + Auth settings |
| Anonymous spam reaching staff | The **only** path from an anonymous session to staff is `prm_save_world_without_login`: anonymous callers only, their own world only, once per world, and only with a name plus a phone or email | schema.sql, tested |
| A client posts as "staff" or "system" | A trigger overwrites `sender_role` on every insert | schema.sql, tested |
| A client marks their own boat "covered" | `insurance_policies` is staff-write-only | schema.sql, tested |
| A client forges public-records data or a quote snapshot | `property_records` is written only by the edge function; `quote_requests.snapshot` is built by a trigger | schema.sql, tested |
| Photos leak a home's location | Re-encode in the browser before upload (drops EXIF); private bucket; signed URLs with short expiry (≤ 5 minutes) | app + storage |
| API keys exposed | Every third-party call goes through an edge function; nothing secret in a `VITE_` variable (same rule as the Ads Manager) | edge functions |
| XSS through messages | React escapes by default. **Never** `dangerouslySetInnerHTML` for message bodies, names or notes | code review |
| Marketing pixels inside the logged-in area | **No third-party tracking pixels on any `/my-world` or `/staff` page.** Ad pixels on pages full of personal data are a well-known privacy and legal problem. Attribute leads server-side instead (§7.6) | code review |
| Data lost | Supabase daily backups; add point-in-time recovery once real clients are on it | Supabase plan |

### 5.2 Data minimization

The game collects what's needed to **quote**, not what's needed to **bind**.
Not collected in v1, by design:

- Social Security numbers
- Driver's license numbers
- Medical conditions, health history, tobacco use
- Bank or payment details

A licensed agent collects those during quoting, through the agency's existing
channels. This keeps the app's blast radius small and keeps it out of HIPAA
territory.

### 5.3 Retention and deletion

- **Soft delete** (`deleted_at`) powers Undo; a scheduled job hard-deletes
  rows older than 30 days, plus their storage objects.
- **Account deletion:** the owner can delete their household; everything
  cascades. The audit trail (`household_activity`) survives deletion on
  purpose and holds no personal values.
- **Messages and quote requests cascade with the household today.** If the
  agency must retain client communications or quote records for a set period
  (ask counsel), change those foreign keys to `on delete restrict` and add a
  staff-run purge.

### 5.4 Regulatory checklist (confirm with counsel and the E&O carrier)

Research notes are in [DATA_SOURCES.md §10](DATA_SOURCES.md). Loomis is
licensed in **New York and Pennsylvania**, and both states have their own
insurance data-security rules:

- **New York — DFS Cybersecurity Regulation (23 NYCRR 500).** It applies to
  entities licensed by DFS, agencies included. Small licensees can claim a
  *limited* exemption under §500.19(a); it must be filed as a Notice of
  Exemption within 30 days. Limited-exempt entities still owe part of the
  regulation, and every covered entity without a *full* exemption files an
  annual certification of compliance (or acknowledgment of noncompliance)
  with DFS between January 1 and April 15.
  ([DFS submissions](https://www.dfs.ny.gov/cybersecurity/submissions-notifications) ·
  [DFS exemptions](https://www.dfs.ny.gov/cybersecurity/exemptions))
- **Pennsylvania — Insurance Data Security Act (Act 2 of 2023).** In effect
  since December 2023. It requires licensees to safeguard consumers'
  nonpublic information and to notify the Insurance Commissioner of a
  cybersecurity event within five business days, with an exception for
  certain small businesses.
  ([PA Insurance Department](https://www.pa.gov/agencies/insurance/laws-regulations-notices/act-2-2023-insurance-data-security.html))

Exactly which sections apply to an agency Loomis's size, the current
small-business thresholds, and whether client portal logins count toward
New York's MFA requirement are questions for counsel; the sources above
don't settle them. The design already requires MFA for staff, keeps an
audit trail, and minimizes what's collected. Before launch:

- [ ] Written information security program and risk assessment covering this
      app (NY Part 500 and PA Act 2; confirm exemptions and file any NY
      Notice of Exemption).
- [ ] Incident response plan with **both** states' deadlines: DFS (72 hours
      under Part 500 ⚠️ verify for limited-exempt filers) and the PA Insurance
      Commissioner (five business days).
- [ ] Calendar the NY DFS annual filing (January 1 – April 15).
- [ ] Vendor agreements / DPAs: Supabase, Lovable, RentCast, Google, email provider.
- [ ] GLBA privacy notice delivered at sign-up **and** on the save-without-login
      form (those clients are consumers too). New York and Pennsylvania each
      have their own insurance privacy regulations; confirm the notice meets both.
- [ ] License number and any required disclosures on the site.
- [ ] E&O review of the shield wording, "Need/Want" framing and gap hints.
- [ ] Confirm the reward design (no cash value) against state anti-rebating rules.
- [ ] Terms of use: adults only; the plan isn't coverage.

### 5.5 Testing the security rules

`risk-manager/supabase/tests/rls.test.mjs` runs the real schema on PGlite (Postgres compiled
to WebAssembly) with a stub of Supabase's `auth` and `storage` schemas, then
attacks it: client vs. client, anonymous vs. staff, forged senders, forged
snapshots, cross-household foreign keys, storage paths, staff without MFA, and
re-running the install script. **Run it after every schema change:**

```bash
cd risk-manager && npm install && npm run test:rls
```

---

## 6. Authentication

### 6.1 Clients: start first, save later

1. **First visit:** `supabase.auth.signInAnonymously()` (with CAPTCHA). The
   world starts immediately — no form before the fun.
2. **"Save my world"** (prompted once after the third thing, and required
   before messaging Loomis or requesting a quote) offers two paths
   (GAME_DESIGN.md §12.1):
   - **Make a free login:** the client types an email, receives a **6-digit
     code**, and types it in. Under the hood, `updateUser({ email })` links the
     email to the same anonymous user id, so nothing moves.
   - **No thanks — just send it to Loomis:** the client gives a name, a phone
     and/or email, and how they'd like to be reached. The app calls
     `prm_save_world_without_login(...)`, which stores the contact in
     `household_contacts` and files a `saved_world` request (with the same
     server-built snapshot as a quote request) into the staff inbox. Then the
     app calls `supabase.auth.signOut()` and clears local state, so the world
     can't be reopened from that device. To come back, the client talks to
     Loomis. Staff attach the household to a new login by inserting a
     `household_users` row once the client has signed up.
3. **Coming back:** email → 6-digit code → in. No passwords to forget.

**Why a typed code instead of a magic link:** on phones, a magic link opens in
the mail app's built-in browser or in Safari — a different session than the
one the client started in, especially for a home-screen app. People end up
"logged in" in the wrong place. A typed code keeps everything in one place.
Edit the Supabase email template to show `{{ .Token }}`, and configure a real
SMTP provider before launch.

**Edge case:** if the email already belongs to an account, linking fails.
Offer "Sign in instead" — and since an anonymous world can't merge
automatically, v1 asks whether to keep the new world or the saved one. A
server-side merge is a later improvement.

SMS codes (Twilio Verify, ~$0.06 each) are a good v2 option for clients who
don't use email much. Passkeys are still beta in Supabase; revisit later.

### 6.2 Staff

- Staff sign in with email + password **and an authenticator app** (TOTP). The
  staff console must include MFA enrollment. Without `aal2`, `prm_is_staff()`
  is false and staff see nothing.
- Add staff from the SQL editor (`insert into staff_members …`). There is no
  self-service path to becoming staff, by design.

### 6.3 Linking a login to an existing client

When an existing Loomis client signs up, **staff** link the household to the
client's agency record (`household_agency.ams_client_id`). Never auto-match on
email or name alone.

---

## 7. Integrations (edge functions)

All third-party keys live in Supabase function secrets. Every function checks
the caller's JWT and household membership before doing anything.

| Function | Trigger | Does |
|---|---|---|
| `property-lookup` | Client confirms an address | Calls **RentCast** (fallback ATTOM); caches by normalized address for 90 days; writes a normalized `summary` to `property_records`; returns the "We found…" card data |
| `vin-decode` | Client enters a VIN | Proxies **NHTSA vPIC** `DecodeVinValues`; caches by VIN; returns year/make/model/body/trim |
| `recalls` | After a VIN decodes | Proxies NHTSA recalls by make/model/year (that API takes those, not a VIN) |
| `address-search` | Typing in the address field | Proxies Google Places Autocomplete (New) so the key stays server-side; debounced |
| `notify-staff` | Database webhook on new client message / quote request | Emails the agency inbox: "New message from the Smith household" (no personal details in the email body) |
| `notify-client` | Database webhook on new staff message | Emails the client: "You have a new message from Loomis" with a link — never the message itself |
| `forward-lead` | Database webhook on new quote request | Posts a lead to the **Ads Manager** with the household's `first_touch` UTMs and line, so ad spend gets credited (§7.6) |
| `nightly-cleanup` | Scheduled (pg_cron) | Purges anonymous users idle > 30 days, and their worlds **unless the world was saved with Loomis** (a `saved_world` request exists); also soft-deleted rows > 30 days and orphaned storage objects |

### 7.1 Property data

The owner asked for Zillow and county data. Short version from the research:
Zillow's data isn't realistically available to an insurance agency (the
public API was retired in 2021; its successor is application-based for real
estate brokers, with storage restrictions), and integrating county assessor
sites one by one isn't realistic either. Property-data providers aggregate
assessor records. **RentCast** is self-serve and cheap with storage-friendly
terms (v1); **ATTOM** is the more authoritative fallback. Either way, results
are shown as "We found this — is it right?" with the source and date, because
roof, construction and stories are often missing or wrong in public records.

### 7.2 Replacement cost

No API is realistically available to an independent agency for a rebuild-cost
estimate; carriers run those tools (e.g. 360Value) at quote time. v1 shows
market value only as context, with the "market value isn't rebuild cost" note,
and the agent supplies the rebuild estimate.

### 7.3 VIN scanning

`BarcodeDetector` doesn't work in iPhone Safari, so use the
`barcode-detector` polyfill (ZXing in WebAssembly) for door-jamb barcodes, with
typing and a photo fallback always visible.

### 7.4 Address search

Google Places Autocomplete (New) has a monthly free allowance large enough for
an agency's volume. Radar is the fallback. Calls go through the edge function.

### 7.5 Notifications

Email first (custom SMTP or a provider like Resend). Web push only for
home-screen installs on iPhone, so it's a v2 enhancement.

### 7.6 Tie-in with the Ads Manager

The Ads Manager in this repository measures cost per lead and per policy, and
it's only as good as its lead data. The risk manager is a lead source:

1. Capture `utm_*` parameters on the first visit and store them in
   `households.first_touch`.
2. On each new quote request, `forward-lead` writes a row to the Ads Manager's
   `leads` table (name, email, line, UTMs). The existing `utm_campaign`
   trigger there attributes it to the campaign automatically.
3. Keep the two Supabase projects separate, as the Ads Manager README
   recommends. The function holds the Ads Manager's service key as a secret.

---

## 8. The world renderer

- **Coordinate system:** the world is laid out in "world units" around the
  home at (0, 0). Each zone has an anchor and a slot pattern (driveway: a row;
  yard: a ring; vault: one chest). Positions are computed, not dragged, in v1,
  so the world always looks tidy. `world_position` columns exist for a later
  "arrange my world" feature.
- **Camera:** auto-fit. After each addition, compute the bounding box of all
  zones in use and animate a scale/translate to fit it in the safe area above
  the bottom bar.
- **Growth:** ground radius = f(number of things), eased with a spring.
- **Labels:** names stay at a readable size while the world zooms out, so in
  a full world they will collide. Do collision avoidance after layout: when
  two labels overlap, keep the higher-priority one (people > residences >
  vehicles > everything else) and show the other on tap or focus. The
  prototype only spaces its slots apart, which holds up to roughly 15 things.
- **Reveals:** a registry keyed by zone — the first asset in the `water` zone
  plays `revealLake()`, and so on. "Already played" lives in `households.world`.
- **Accessibility:** every thing is a `<button>` with a full label (*"Honda
  CR-V, 60% complete, Quote requested"*). The decorative world (grass, fog,
  clouds) is `aria-hidden`. The list view is the same data rendered as a list.
- **Reduced motion:** a single `useMotion()` hook returns either the spring or
  a 150 ms fade, so every animation respects the setting from one place.

---

## 9. Installing the schema

1. **Check for an over-broad policy first.** In the SQL editor of the site's
   Supabase project, run:

   ```sql
   select schemaname, tablename, policyname, roles, qual
     from pg_policies where qual = 'true';
   ```

   Every row is a table that any logged-in user — soon, any client — can read.
   Fix those before inviting clients in.
2. **Check names.** The script stops if a table it wants already exists and
   isn't one of its own (`people`, `assets`, …). Rename the existing table, or
   rename ours throughout the script.
3. Paste all of `risk-manager/supabase/schema.sql` → Run. It needs Postgres 15+
   (every current Supabase project). It's safe to re-run.
4. **Auth settings:** enable anonymous sign-ins, enable CAPTCHA (Turnstile),
   enable TOTP MFA, set the email OTP template to show `{{ .Token }}`,
   configure custom SMTP.
5. **Add staff:**
   ```sql
   insert into staff_members (user_id, display_name)
   select id, 'Jane Loomis' from auth.users where email = 'jane@…';
   ```
   Then have them enroll an authenticator app in the staff console.
6. If the site already has a roles system (Lovable projects often have
   `user_roles` and `has_role()`), point `prm_is_staff()` at it — keep the
   `aal2` check — and drop `staff_members`.

---

## 10. Testing

| Layer | How |
|---|---|
| Catalog integrity | `npm run catalog:check` — duplicate ids, dangling references, questions with no choices |
| Security rules | `npm run test:rls` — the PGlite attack suite (§5.5) |
| Core flows | Playwright at 390×844 and 360×800 with touch: first-visit path, add each category, protect, budget, quote request |
| Accessibility | axe-core in the Playwright run; manual VoiceOver and TalkBack passes; 130% text-size pass |
| Real devices | An older iPhone SE, a budget Android, an iPad, with the oldest and youngest testers we can find |
| Feel | A "juice review" every milestone: does each addition still feel good the 20th time? |

---

## 11. Analytics (privacy-first)

Count *steps*, not *people*: first thing added, fifth thing added, first
protect, first budget, first quote request, time between them. Store the
events in our own database (or a privacy-focused tool) without names or
values. No third-party ad or analytics pixels in the logged-in area (§5.1).
