# Personal Risk Manager

**Loomis Family Insurance Agency's client world.** A client logs in and finds
themselves standing in an empty field. Every person, home, car, pet and
treasure they add makes the world grow around them. Then they protect it,
building the coverage they need and the coverage they want, set a budget for
each line, and send it all to Loomis HQ, which is always right there on their
map, with Roxie, the Loomis family's shaggy grey dog, as their guide.

This folder is the **planning stage**: the design, the data model, the
security rules, the full catalog of insurable things, and a playable
prototype. Production code will be built in the Lovable site's repository
(see [Where this goes](#where-this-goes)).

---

## Try it first

Open **[`prototype/index.html`](prototype/index.html)** on a phone. It's one
self-contained file with no server. Nothing you type leaves the device,
except a VIN you choose to "Look it up", which goes only to the free U.S.
government (NHTSA) decoder. Turn the sound on.

It's a feel sketch: emoji stand in for art, the sounds are synthesized, and
the public-records card and the agency replies are labeled demo data.

---

## What's here

| | |
|---|---|
| [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) | **Start here.** Pillars, the core loop, the world, controls and accessibility, the "juice" (animation, sound, pacing), every category, Protect mode, budget, Loomis HQ, the first three minutes, tone of voice, and the decisions we need from Loomis. |
| [docs/TECHNICAL_DESIGN.md](docs/TECHNICAL_DESIGN.md) | Architecture, Lovable integration, data model, security and privacy, auth, edge functions, the Ads Manager tie-in, installing the schema, testing. |
| [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) | Milestones M1–M5 broken into tickets, each assigned to the cheapest model that can do it (Opus, Sonnet or Haiku). |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | Research: Zillow, property-data APIs, county records, VIN decoding and scanning, address search, Supabase auth, mobile-web facts, and regulatory notes. |
| [docs/COVERAGE_TREE.md](docs/COVERAGE_TREE.md) | **For Loomis staff to review.** Every line, coverage and question a client will see, generated from the catalog, with "We write this" checkboxes. |
| [src/catalog/](src/catalog) | The catalog as TypeScript, ready to copy into the Lovable site: lines, categories, thing kinds and their questions, coverages, life events, and a validator. |
| [supabase/schema.sql](supabase/schema.sql) | Client-facing tables with Row Level Security, the storage bucket, realtime, and triggers. |
| [supabase/tests/rls.test.mjs](supabase/tests/rls.test.mjs) | Runs the schema on a real Postgres engine and tries to break the security rules. |
| [prototype/index.html](prototype/index.html) | The playable prototype. |
| [art/](art) | **For the artist.** The art guide PDF (style, sizes, file names and a checklist of every image, in three rounds), the asset manifest the app loads art by, and the folders returned art goes into. |

```bash
cd risk-manager
npm install
npm run catalog:check   # catalog integrity + regenerate docs/COVERAGE_TREE.md
npm run test:rls        # security rules
npm run typecheck       # catalog types
```

---

## Decisions made, and why

| Decision | Why |
|---|---|
| **Shields have four states, and only Loomis can make one gold.** Planned → Quote requested → Covered by Loomis. | The game must never tell someone they're insured when they aren't. That's the errors & omissions risk to avoid. It's enforced in the database, not only in the UI. |
| **An illustrated world, not a real street map.** | A satellite view of your house with your valuables pinned to it is a privacy problem. Real maps are also heavy on older phones, harder for older eyes, and make every world look alike. A real-map backdrop can be an option later. |
| **Taps only, in the bottom third of the screen.** Targets of 56 px or more, one question per screen, no gestures. | The audience runs from 8 to 88. |
| **"I don't know" is always a good answer**, and it counts toward progress. | Honesty shouldn't be penalized, and it tells the agent what to ask. |
| **Start playing before signing up**, then save with a 6-digit email code instead of a magic link. | Delight before forms. Magic links break on phones because they open in the wrong browser. |
| **Clients can save without a login.** It works like a submitted form: Loomis gets the whole world and reaches out, and the device is signed out. | Loomis's call. Some people will never keep a login, and this still gets their household to the agency. It's the only path from an anonymous session to staff, so it's narrow: once per world, with a way to reach them. |
| **New York and Pennsylvania rules are built in.** NY no-fault PIP and SUM; PA first party benefits, full vs. limited tort, stacking, and mine subsidence. Out-of-state clients can build, then get a friendly "message us". | Loomis is licensed in NY and PA. A generic "PIP" card would be wrong in both. |
| **Roxie is the guide, not the advisor.** She welcomes, gives tips, celebrates, and carries requests to HQ. | Advice comes from a licensed agent. |
| **"Response times may vary — we'll get to you ASAP."** | No promise the team can't keep yet. |
| **No Zillow.** Use a property-data provider (RentCast, with ATTOM as fallback) for the "we found your house" moment. | Zillow's data isn't realistically available to an agency. Records are shown as "Is this right?", never saved silently. |
| **No price estimates in v1.** The budget records what the client *wants* to spend per line. | A wrong price in a game is worse than none. Real prices come from carriers through the agent. |
| **No SSNs, license numbers, health details or bank info.** | Collect what's needed to quote, not to bind. That shrinks the damage if anything ever leaks. |
| **Rewards never have cash value.** Badges, XP and levels are cosmetic only. | Most states restrict inducements to buy insurance (anti-rebating). |
| **No streaks, loot boxes, leaderboards or countdowns.** | They work, but they don't belong in a family agency's app. |
| **Commercial is a hard stop.** A business gets a name and a description, then "Talk with Loomis." | As requested. It's a whole second game. |
| **No ad pixels in the logged-in area.** Leads are credited to campaigns server-side, through the Ads Manager. | Tracking pixels on pages full of personal data are a privacy and legal problem. |

---

## ⚠️ Before this touches the site's database

The Ads Manager's schema uses the policy `to authenticated using (true)`,
meaning any logged-in user can see every row. That's fine for a staff-only
tool. **In a database where clients log in, the same policy would let every
client read every row of that table.** Before installing this schema on the
Lovable site's database, run the audit query in
[TECHNICAL_DESIGN.md §9](docs/TECHNICAL_DESIGN.md#9-installing-the-schema), and
keep the Ads Manager in its own Supabase project, as its README already says.

---

## Where this goes

This folder lives in the Ads Manager repository only because that was the one
repository this planning session could reach. To build it:

1. Connect the Lovable site to GitHub (Lovable keeps them in sync).
2. Add that repository to Claude Code sessions.
3. Follow [BUILD_PLAN.md](docs/BUILD_PLAN.md), starting with M1-1.

## What we need from Loomis

Decisions so far are recorded in
[GAME_DESIGN.md §14](docs/GAME_DESIGN.md#14-decisions). Still open:

- **Art.** Hand [the art guide PDF](art/Loomis-Risk-Manager-Art-Brief.pdf) to
  the artist and send finished files back in batches, Round 1 first.
- **Confirm earthquake and event coverage** can actually be placed (in
  [COVERAGE_TREE.md](docs/COVERAGE_TREE.md)).
- **Brand colors**, if Loomis has official ones.
- **Counsel and E&O review**, using the New York and Pennsylvania checklist
  in [TECHNICAL_DESIGN.md §5.4](docs/TECHNICAL_DESIGN.md#54-regulatory-checklist-confirm-with-counsel-and-the-eo-carrier).
- **Staff names and photos**, whenever you're ready.
