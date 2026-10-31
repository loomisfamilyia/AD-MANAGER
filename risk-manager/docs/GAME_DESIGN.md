# Personal Risk Manager — Game Design

> **Your world, built by you, protected with Loomis.**
> A client logs in and finds themselves standing alone in an empty field. Every
> person, home, car, pet and treasure they add makes the world grow around
> them. Then they get the satisfaction of protecting it — and Loomis Family
> Insurance Agency is always right there on the map, one tap away.

This document is the "what it feels like" half of the design. The "how it's
built" half is [TECHNICAL_DESIGN.md](TECHNICAL_DESIGN.md). The full list of
things and coverages is generated into [COVERAGE_TREE.md](COVERAGE_TREE.md).
The playable sketch is [`../prototype/index.html`](../prototype/index.html) —
open it on a phone.

---

## 1. Design pillars

Every feature decision gets checked against these five. When two pull against
each other, the higher one wins.

1. **Honest shields.** The game never says something is insured unless Loomis
   has verified a real policy. A client's plan is a plan. This is the one rule
   that protects the agency (errors & omissions) as well as the client.
2. **Anyone can play — from 8 to 88.** One thumb, one question at a time, big
   targets, no hidden gestures, no time pressure. "I don't know" is always a
   good answer.
3. **Celebrate, don't scare.** Gaps are invitations, never alarms. No red
   warning icons, no "you're at risk!", no countdowns. Insurance is bought out
   of care, not fear, and fear-selling is exactly what a family agency isn't.
4. **Your world, not a form.** Every answer changes something you can see.
   If a question doesn't change the world, a coverage, or what Loomis needs to
   quote, we don't ask it.
5. **Loomis is always in the picture.** Real people, real replies, one tap
   from anywhere. The game is the on-ramp to a relationship, not a replacement
   for one.

---

## 2. The core loop

```
     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
     │     ADD      │────▶│    DETAIL    │────▶│   PROTECT    │
     │ a thing drops│     │ answer a few │     │ Need / Want /│
     │ into the     │     │ easy taps,   │     │ Not now per  │
     │ world  ✨    │     │ ring fills ◔ │     │ coverage 🛡  │
     └──────────────┘     └──────────────┘     └──────┬───────┘
            ▲                                         │
            │                                         ▼
     ┌──────┴───────┐     ┌──────────────┐     ┌──────────────┐
     │  WORLD GLOWS │◀────│ LOOMIS QUOTES│◀────│  SEND TO HQ  │
     │ verified gold│     │ a real agent │     │ paper plane  │
     │ shields 🌟   │     │ replies      │     │ flies to HQ ✈│
     └──────────────┘     └──────────────┘     └──────────────┘
```

The loop works at three time scales:

| Session | What happens | Feels like |
|---|---|---|
| **2 minutes** | Add one thing (a new car, the dog). | A small, complete win. |
| **15 minutes** | The first visit: character, home, people, a car, first shields. | Building a tiny town. |
| **Years** | Life events (new baby, teen driver, retirement), renewals, home systems aging, inventory growing. | A living record of the family. |

The long loop is the business case. A client who keeps their world up to date
is a client whose coverage stays right, who thinks of Loomis first, and whose
claims go faster because the inventory already exists.

---

## 3. The world

### 3.1 Layout

The world is an original, illustrated diorama — not a street map. It's laid
out in **zones** around the player's home so that even a full world reads at
a glance:

```
                        🏙  TOWN  (jobs, businesses, other properties)
                         │  road appears with the first job
                         │                                  ⛳ LOOMIS HQ
          ☁ fog ☁        │                                  on its hill,
                    ┌────┴─────┐                            always visible
          YARD      │   HOME   │   DRIVEWAY
       people, pets │   🏠     │   🚗 🛻 🏍
       small toys   └────┬─────┘   GARAGE / SHED
                     💰 VAULT       ATVs, snowmobiles
                    (one chest)
      🌊 LAKE                                  🐎 PASTURE
      appears with the                         appears with the
      first boat                               first horse
                          ☁ fog ☁
```

- **Home** sits in the middle. Before a home is added the player stands on
  open grass; when the home is added it *rises out of the ground* with a puff
  of dust.
- **Valuables live in one treasure chest** with a count badge, never 30 little
  icons. Tapping it opens the vault.
- **Things inside the home** (inventory, home systems) never clutter the map.
  They live in the home's detail view.
- **Loomis HQ** is on a hill at the top-right edge from the very first second,
  before the player has added anything. It's the one building they didn't
  build, and it's always there.

### 3.2 Growth

The ground starts as a small circle of grass, just big enough for the player.
It grows — slowly, with a slight overshoot — each time something is added.
Beyond it is soft fog that rolls back as the world expands. The camera
automatically zooms out to keep everything in view, so nobody ever needs to
pinch or pan.

| Level | Things in world | Banner |
|---|---|---|
| Open Field | 0 | "This is your world. Let's fill it." |
| Homestead | 1+ | "Your world grew! Welcome to Homestead." |
| Neighborhood | 4+ | "Look at this place — it's a Neighborhood!" |
| Hometown | 9+ | "You've built a whole Hometown." |
| Big Sky | 15+ | "Big Sky country. What a world." |

Levels are cosmetic: they change the sky, add trees and paths, and unlock
decorations. They never unlock coverage, discounts or anything of value (see
§10).

### 3.3 First-time reveals

The first of certain kinds of thing *transforms the world* before it drops in.
These are the biggest "wow" moments, so each happens once per world:

| First… | The world… |
|---|---|
| Home | Rises from the ground with a dust puff; a path leads to it |
| Vehicle | Lays down a driveway |
| Boat or jet ski | Floods a sparkling lake in the corner |
| Horse | Builds a fenced pasture |
| Job or business | Unrolls a road up to a little town |
| Valuable | Buries a treasure chest beside the house |
| Person | Plants a family tree in the yard (tap it to see the tree view) |
| ATV / snowmobile | Builds a shed |

### 3.4 Art direction

- **Original, warm and rounded.** Soft 2.5D "diorama" style: gentle top-down
  angle, chunky shapes, soft shadows, bright but not neon. Think picture
  book, not video game.
- **Recognizable at thumbnail size.** A car must read as a car at 48 px. Every
  thing kind gets a hand-drawn illustration with 2–3 color variants (the
  client's car should be *their* color).
- **The prototype uses emoji as placeholder art.** Production art should be
  commissioned: one illustrator, one style guide, roughly 80–100 assets for
  v1 (thing kinds × color variants, terrain tiles, HQ, avatar parts). Budget
  and timeline are an open decision (§13).
- **Why not a real street map** (like the client's actual neighborhood)? Four
  reasons: a satellite view of your house with your valuables pinned to it is
  a privacy problem; real maps are heavy on older phones; they're harder to
  read for older eyes; and they make every world look the same. A "show my
  real neighborhood" backdrop could be a v2 option.

### 3.5 The cast

- **The player** — a simple avatar chosen from a friendly set (no fiddly
  character editor). Shown at the center of the world with a ring around
  them that fills as their profile gets stronger.
- **Family and pets** — appear in the yard and wander a little. People get
  avatars picked the same way.
- **Loomis HQ staff** — real photos of the real Loomis family and team inside
  HQ and on every reply. This is a family agency; the faces are the brand.
- **A guide** (optional) — a small original mascot who gives tips in speech
  bubbles during onboarding and when the player looks stuck. Recommendation:
  keep the guide to onboarding and tips, and let the real Loomis people handle
  anything that sounds like advice. Mascot design is an open decision (§13).

---

## 4. Controls and accessibility

### 4.1 The thumb zone

```
 ┌───────────────────────────────┐
 │ Homestead  ◔ 42%     🔊  A+  ☰ │  ← small: status only, rarely tapped
 │ ┌───────────────────────────┐ │
 │ │ Next: Add your people  ▶  │ │  ← quest card (collapsible)
 │ └───────────────────────────┘ │
 │                               │
 │         T H E   W O R L D     │  ← tap anything to open it
 │                               │
 │                               │
 │                        ( 💬 ) │  ← Loomis, floating in thumb reach
 │ ┌───────┐  ┌───────┐ ┌───────┐│
 │ │My stuff│ │ + ADD │ │Protect││  ← the three things you do,
 │ └───────┘  └───────┘ └───────┘│     all under the thumb
 └───────────────────────────────┘
```

Everything you *do* is in the bottom third. The top of the screen only shows
status.

### 4.2 Rules (non-negotiable)

| Rule | Why |
|---|---|
| Tap targets ≥ 56 px; primary actions ≥ 64 px; the Add button ~84 px | Shaky hands, big thumbs, small kids |
| Base text ≥ 18 px; a text-size toggle (100 / 115 / 130%) always one tap away | Older eyes |
| **Taps only.** No swipe-only, long-press, double-tap or pinch-only actions | Every gesture beyond a tap excludes someone |
| One question per screen, one primary button per screen | Nobody wonders what to do next |
| No timers, no countdowns, no "expires" | No pressure, ever |
| Every field autosaves the moment it's answered; leaving mid-question loses nothing | People get interrupted; phones die |
| Every delete asks once, then offers **Undo** for several seconds | Mistakes are free |
| State is never shown by color alone — always icon + word | Color blindness; sunlight on screens |
| WCAG 2.2 AA contrast; visible focus rings; full keyboard and screen-reader support | Accessibility is the law and the right thing |
| `prefers-reduced-motion` and an in-app "Reduce motion" switch replace movement with gentle fades | Motion sensitivity |
| Sound on by default, with a mute button that's always visible. On iPhone we respect the silent switch | Delight by default, never an embarrassment in church |
| Haptics are a bonus (Android has them, iPhone web doesn't) — nothing depends on them | Platform reality |
| **"My stuff" list view** shows everything the map shows, as a plain list | Some people don't want a map, and screen readers need a list |

### 4.3 For the oldest players

- A **"Can someone call me?"** button in HQ — it sends a message and Loomis
  calls. The fastest way through any confusion is a person.
- Dictation works everywhere, because every text field is a plain input and
  phone keyboards have a microphone. We never build a custom keyboard.
- No jargon on screen. "Pays to fix your car after a crash", not "collision
  coverage". The insurance term can appear in small text underneath, for
  people who want to learn it.
- Resume exactly where they left off, every time.

### 4.4 For the youngest players

Kids are welcome to *play alongside* a parent — adding the dog, taking photos
of the bikes. But the account holder must be an adult (18+): only adults can
buy insurance, and the app stores household data. We never build sign-up
flows aimed at children, which keeps COPPA out of scope.

---

## 5. Adding things

### 5.1 The Add sheet

Tapping **+ Add** slides up a sheet (with a whoosh) showing seven big tiles:

| Tile | Tagline | Examples |
|---|---|---|
| 👪 People | Who's in your life? | spouse, kids, parents, roommates |
| 🏠 Home | Where do you live? | house, condo, apartment, rental you own, cabin |
| 🚗 Vehicles | What do you drive? | car, truck, SUV, motorcycle, RV, classic car |
| 🚤 Toys | Boats, ATVs, campers… | boat, jet ski, ATV/UTV, snowmobile, golf cart, e-bike, drone |
| 🐾 Pets | Furry family | dog, cat, horse, birds & exotics |
| 💍 Valuables | Rings, watches, art… | jewelry, watches, art, collectibles, instruments, firearms |
| 💼 Work | Your job or business | jobs, side gigs, a business (name only in v1) |

Then the kinds in that category as big rows, then the questions.

### 5.2 Anatomy of a question screen

```
 ┌───────────────────────────────┐
 │ ‹ Back          ● ● ○ ○ ○     │  progress dots, never a percentage
 │                               │
 │            🚗                  │  the thing, getting more "real"
 │                               │
 │   What year is it?            │  one plain question
 │   It helps us find the        │  one line of why
 │   right price.                │
 │                               │
 │   ┌───┐  ┌─────────┐  ┌───┐   │
 │   │ − │  │  2019   │  │ + │   │  big stepper; typing also works
 │   └───┘  └─────────┘  └───┘   │
 │                               │
 │  ┌─────────────────────────┐  │
 │  │          Next           │  │  64 px, full width
 │  └─────────────────────────┘  │
 │   Skip for now   I don't know │  always there, never shamed
 └───────────────────────────────┘
```

**Question rules**

- **Easiest first:** name → simple choices → numbers → photos.
- **Only the name is required** to place a thing. Everything else can be
  skipped, and skipped questions come back later as gentle "Add more details"
  prompts — never nags.
- **Suggestions beat typing:** quick-tap chips for common answers ("Mom's
  car", "The truck"; popular makes; common breeds).
- **"I don't know" is data.** It tells the agent what to ask about, and it
  counts toward the progress ring just like an answer, so honesty is never
  penalized.
- **Every answer earns a tiny reward** (a soft tick and a "+10" floating up).

### 5.3 Magic moments: answers we find for you

| What the client does | What happens |
|---|---|
| Types their address | "Looking up public records…" with a little magnifying-glass animation, then: *"We found: built 1978 · 1,850 sq ft · 2 stories. Is this right?"* **[Looks right] [Fix it]**. Plus a note that market value isn't the cost to rebuild. |
| Types or scans a VIN | "Found it! 2019 Honda CR-V" — year, make and model fill themselves in. A "Where's my VIN?" helper shows the dashboard, the door-frame sticker and the insurance card. |
| Adds a car with a known make/model/year | Bonus discovery: "Good news — no open recalls found" (or a friendly heads-up if there are). |
| Takes a photo | A camera flash, a shutter sound, and a polaroid that drops onto the thing. Location data is stripped before upload — and we say so. |
| Checks "security system" or "water-leak sensors" | ✨ "May qualify for a discount — ask Loomis." |

Public records and VIN results are always **"we found this — is it right?"**,
never silently saved. Records are often wrong, and the client confirming them
is what makes them trustworthy.

> The owner asked for Zillow and county data. Zillow's data isn't realistically
> available to an insurance agency (details in
> [DATA_SOURCES.md](DATA_SOURCES.md)). The same "we found your house" moment is
> built on a property-data provider that pulls from county assessor records.

---

## 6. The juice: making every addition satisfying

### 6.1 Anatomy of a placement

The moment a thing is added is the most important animation in the product.
It's slow on purpose:

```
 0 ms     "All set!" — the sheet glides down (whoosh)
 300 ms   if this is a first-of-kind: the reveal plays (lake floods in…)
 900 ms   the thing drops from above into its zone
 1100 ms  squash-and-stretch landing · dust puff · POP
 1200 ms  sparkle burst · rising chime · haptic thump (Android)
 1400 ms  "+150" floats up · the strength ring sweeps forward
 1800 ms  the thing settles into its idle bob; the world is interactive again
```

The client can tap through any of it — celebrations never block.

### 6.2 Celebration scale

Rewards match effort, and repeat rewards get quieter so the big ones stay big:

| Moment | Celebration |
|---|---|
| Answering a question | Soft tick, "+10" |
| Adding a photo | Flash, shutter, polaroid drop |
| Placing a thing | The full placement above |
| The 10th, 25th, 50th inventory item | Coins pour into the chest; "Your stuff inside: $18,400!" |
| Completing a thing (ring hits 100%) | The thing gets a little gleam that stays |
| Finishing a quest | Checkmark draws itself, chime, banner |
| Level up | Full-screen banner, fanfare, the sky changes |
| Sending a quote request | Paper plane flies across the world to HQ; HQ's flag waves |
| Loomis verifies a policy | **The biggest moment in the game:** gold light washes over every covered thing, and their shields turn solid gold |

### 6.3 Sound palette

All short, soft and warm — like a music box, not a slot machine.

| Sound | Used for | Character |
|---|---|---|
| tap | every button | a 30 ms soft click |
| tick | answering a question | a gentle wooden tick |
| whoosh | sheets opening and closing | a soft air sweep |
| pop | a thing landing | a rounded upward pop |
| chime | completions | a rising four-note arpeggio |
| coin | budget changes, inventory value | two bright notes |
| shimmer | a shield appearing | a sparkly sweep with bell tones |
| shutter | photos | a camera click |
| send | quote request | a rising whoosh ending in a bell |
| fanfare | level up, verified coverage | a short major-key flourish |
| hmm | a validation problem | two soft descending notes — never a buzzer |

Production should use a small, professionally made sound set in one audio
sprite (the prototype synthesizes stand-ins). Optional ambient birdsong is off
by default.

### 6.4 Pacing

The owner asked to pace things slowly, and that's right for this audience:

- Transitions are 300–700 ms, slower than typical apps; celebrations get
  about 1.5 seconds to breathe.
- Never more than one new concept per screen.
- The first session introduces Add first, Protect only after a few things
  exist, and the budget only after a few shields exist. Nothing is locked —
  the buttons are there from the start — but the quests lead people through
  in that order.

---

## 7. Deep dives by category

### 7.1 People and the family tree

- **Household vs. family.** "Lives with you?" separates the household (who
  matters for auto and home) from extended family (who matters for life
  insurance and the tree).
- **The tree view** — tap the family tree in the yard. People are big avatar
  bubbles; tap "+" on anyone to add their parent, child or partner. The
  layout arranges itself. Only direct relationships are stored (parent, child,
  spouse/partner), so grandparents and cousins are worked out and the tree
  can't contradict itself.
- **Drivers.** "Do they drive?" → license status. A teen with a learner's
  permit is a gentle "Good to know" moment about adding a teen driver.
- **Life, disability and health coverages attach to people**, not things.
  Protecting a person shows a soft halo instead of a shield.

### 7.2 Home

The home is the deepest part of the game, with three areas inside its detail
view:

1. **Home systems** — roof, furnace, AC, water heater, electrical panel,
   plumbing, sump pump, well and septic, solar, generator. Each has an install
   year and an optional photo, shown as a simple age line: *"Roof · 14 years
   old."* No red warnings. These ages drive underwriting (an old roof can mean
   a different roof settlement; certain pipe materials matter to some
   insurers), and they also become a home-maintenance helper the client
   actually wants: *"Most water heaters last 8–12 years — yours is 11."*
2. **Stuff inside** — a room-by-room home inventory. "Take a tour" walks room
   by room with the camera: snap, name it, guess a value, next. The running
   total ("Your stuff inside: $42,300") is the most persuasive number in the
   app for choosing the right personal-property limit. Later: export a
   claim-ready PDF. A complete inventory is something most families have
   never had, and it's worth more to them than the game.
3. **Special features** — pool, trampoline, wood stove, finished basement,
   solar, security system, sensors, detached garage, barn. Some unlock
   "may qualify for a discount" sparkles; others add a factual "Good to know"
   card (e.g. some policies limit trampoline coverage — worth asking Loomis).

**Market value vs. rebuild cost** gets one friendly explanation the first time
a value appears: the price a house would *sell* for includes the land and the
neighborhood; the cost to *rebuild* it is a different number, and that's the
one insurance cares about. Loomis helps work it out.

Residence types: house I own, condo, home I rent, rental I own (landlord),
vacation home, mobile home, a student's college housing.

### 7.3 Vehicles

- VIN by typing, scanning the door-frame barcode, or snapping a photo; manual
  year/make/model always works.
- Who drives it most, how it's used, roughly how many miles, loan or lease.
- "Do you drive for Uber, Lyft or DoorDash?" — a common, gentle
  "Good to know" about rideshare coverage.
- Photos: a simple four-corners walkaround is optional but useful (it
  documents the car's condition before any claim).

### 7.4 Toys

Boat, jet ski, ATV/UTV, snowmobile, golf cart, dirt bike, camper, utility
trailer, e-bike or scooter, drone. These are the "deep tree" in action: each
has its own coverages, and each is often missing from a home policy in ways
families don't know about. The first boat floods the lake; the first ATV
builds the shed.

### 7.5 Pets

Dog, cat, horse, birds and exotics. Name, breed, age, photo. Pet insurance
for accidents and illness, plus a wellness add-on. Dogs also link to home
liability (some insurers consider breed — said gently, with an invitation to
ask). Horses get the pasture.

### 7.6 Valuables (the vault)

Jewelry, watches, art, collectibles, firearms, instruments, camera gear,
sports gear, silverware, high-end bikes. What is it, what's it worth, has it
been appraised, photo of it, photo of the appraisal. The vault shows a total
value and explains, in plain words, why valuables are often covered better
listed by themselves ("can cover it even if you just lose it — ask Loomis for
details").

Valuables plus a home address plus photos is the most sensitive data in the
app. It's stored in a private bucket, shown through short-lived links, and
the app says so in one reassuring line.

### 7.7 Work — and the hard stop

- **Jobs** belong to people: job title, employer, and "Does work offer life or
  disability insurance?" That last one is one of the best education moments
  in the app: work coverage usually ends when you leave the job.
- **Side gigs** (rideshare, delivery, home-based business, renting on Airbnb)
  are asked where they matter — on the car and the home — because that's
  where they change coverage.
- **Businesses: v1 is a hard stop.** The client gives the business name and a
  short description. The business appears as a shop in town with a friendly
  card: *"That's all we need for now! Talk with Loomis about business
  coverage."* Commercial insurance is a whole second game; we're not building
  it in v1.

---

## 8. Protect mode

### 8.1 Shields

Pressing **Protect** tints the world slightly and puts a shield on every
thing. The states must be impossible to confuse:

| State | Looks like | Words | Who can set it |
|---|---|---|---|
| None | faint gray outline, "?" | "No plan yet" | — |
| Planned | dashed blue outline | "Planned" | the client |
| Requested | blue shield, gently pulsing | "Quote requested" | the client, by sending a request |
| **Verified** | **solid gold shield, gleaming** | **"Covered by Loomis"** | **only Loomis staff** |

Every Protect screen carries one line: *"This is your plan — not insurance
yet. Send it to Loomis for real quotes."* The database itself makes it
impossible for the client side to produce a gold shield (see
TECHNICAL_DESIGN.md).

### 8.2 Need / Want / Not now

Tapping a thing in Protect mode opens its coverages, one card each:

```
 ┌───────────────────────────────┐
 │  Pays to fix your car after   │
 │  a crash                      │
 │  collision coverage           │  ← real term, small, for learners
 │ ┌────────┬────────┬─────────┐ │
 │ │  Need  │  Want  │ Not now │ │  ← 56 px, one tap
 │ └────────┴────────┴─────────┘ │
 └───────────────────────────────┘
```

- **Need** = the coverage they must have. **Want** = their dream policy.
  **Not now** = a fine, unjudged answer.
- Cards are ordered *essential → recommended → extra* from the catalog. The
  catalog's tiers are general education ("most families in this situation
  carry it"), not personalized advice — the recommendation comes from a
  licensed Loomis agent reviewing the plan.
- Coverages for the whole household (umbrella, identity theft, travel) live
  on a "Whole family" card reached from the Protect screen.
- A **plan summary** shows: how many things have a plan, Need vs. Want by
  line, and two big buttons: **Set my budget** and **Send to Loomis**.

### 8.3 Gentle gap hints

When an essential coverage is unplanned, its card gets a soft glow and a line
like *"Most families with a teen driver also look at this."* Never a red
badge, never a count of "risks". The game's job is to start a good
conversation with the agent, not to finish it.

---

## 9. Budget

*"What would you like to spend on protection?"*

- One big total, monthly or yearly, with huge − / + buttons ($25 steps) and
  typing.
- Then one row per line that appears in their plan (auto, home, umbrella,
  life, pet…), each with − / + ($10) and a bar. Unassigned money is a little
  pile of coins that shrinks as they assign it (coin clink per tap).
- Need and Want can be budgeted separately: "What I need" and "What I'd add
  if it fits."
- **No price estimates in v1.** Prices depend on carrier underwriting; a
  wrong number in a game is worse than none. The budget is information for
  the agent: what the client hopes to spend, line by line.

---

## 10. Progression and rewards

- **Profile strength ring** around the player: share of questions answered
  (including "I don't know") across everything they've added.
- **Levels** change the world's look (§3.2).
- **Quests** guide the first visit — make your character → add your home →
  add your people → add a vehicle → protect something → set your budget →
  visit Loomis HQ — and then come from **life events**: *"We're having a
  baby"*, *"Our teen is starting to drive"*, *"I'm turning 65"*. Each
  suggests what to add or review.
- **Badges** (examples): *Garage Guru* (every vehicle has a VIN), *Family
  Tree* (three generations), *Inventory Pro* (25 items), *Systems Check*
  (every home system has an age), *Shutterbug* (20 photos), *Planner* (a plan
  on everything).

**What rewards can never be.** Badges, XP and levels have no cash value and
never convert into discounts, gift cards, entries or prizes. Most states
restrict giving anything of value as an inducement to buy insurance
(anti-rebating laws), and the rules vary. Any future referral reward or
giveaway is a separate, counsel-reviewed decision.

**What we deliberately don't do:** daily streaks, loot boxes, leaderboards,
countdown timers, "your friends are ahead of you", push notifications that
guilt. All of them work; none of them belong in a family agency's app.

---

## 11. Loomis HQ

- **Always on the map**, always one tap away (the HQ building or the floating
  💬 button).
- **A single conversation thread** with the agency: big text box, big send
  button, quick chips (*"I have a question"*, *"Can you call me?"*, *"Please
  review my plan"*). Replies from real people show their photo and name.
  Unread replies put a badge on HQ.
- **Request a quote:** a summary of the plan grouped by line (Need vs. Want +
  budget), an optional note, then **Send to Loomis**. The sheet closes, a
  paper plane flies from the bottom of the screen in an arc to HQ, the flag
  waves, a chime plays. The thread shows *"📋 Quote request sent: Auto, Home,
  Umbrella"*; the shields on everything in it start pulsing "Quote requested".
- **Expectations shown honestly:** office hours and a "we usually reply
  within one business day" line (whatever the agency can actually keep).
- **Notifications:** an email when Loomis replies (*"You have a new message
  from Loomis"* — no details in the email). Web push for home-screen installs
  is a later addition.

---

## 12. The first three minutes

| Beat | Screen | The player feels |
|---|---|---|
| 0:00 | Sky. Clouds slowly part to reveal a small circle of grass and… you. | Curious |
| 0:10 | Guide: *"Welcome! This is your world. Let's fill it with the people and things you love — then we'll help you protect them."* One button: **Let's begin**. | Welcomed |
| 0:20 | Pick an avatar, type your first name. | It's mine |
| 0:40 | Quest: *Add your home.* Address → "Looking up public records…" → "We found: built 1978…" → **Looks right**. | That was easy |
| 1:20 | The house rises out of the ground. Dust, pop, chime. *"Your world grew! Welcome to Homestead."* | Delight |
| 1:40 | Quest: *Add your people.* A spouse, a kid. They pop into the yard and wave. A family tree sprouts. | Warmth |
| 2:30 | Quest: *Add a vehicle.* VIN → "Found it! 2019 Honda CR-V." A driveway appears. | Magic |
| 3:00 | Loomis HQ's flag waves for the first time: *"Hi! We're the Loomis family. We're right here whenever you want us."* | Trust |

Sign-up happens **after** the delight, not before: the world can be started
right away and saved to an account with a typed email code when the player
wants to keep it (TECHNICAL_DESIGN.md §6). Messaging and quote requests need
the saved account.

---

## 13. Tone of voice

| Do | Don't |
|---|---|
| "Can help pay to fix your car after a crash." | "Covers all collision damage." |
| "Worth asking Loomis about." | "You are not covered!" |
| "Most families with a pool also look at this." | "⚠️ HIGH RISK: pool liability exposure" |
| "Roof · 14 years old" | "🔴 Roof nearing end of life" |
| "I don't know" | "Unknown / N/A" |
| "That's all we need for now!" | "This field is not supported." |
| "Your plan" | "Your coverage" (until it's verified) |

Reading level: 6th grade. Sentences under ~15 words. Insurance terms appear
small, underneath, for those who want them.

---

## 14. Decisions needed from Loomis

1. **States** the agency is licensed in (affects auto minimums, PIP/no-fault
   copy, anti-rebating limits, data-security law).
2. **Lines written** — review the checkboxes in
   [COVERAGE_TREE.md](COVERAGE_TREE.md). Lines you don't write still appear,
   but say "Ask Loomis about this" instead of offering a quote.
3. **Guide mascot** — none, an original mascot, or the Loomis family as
   illustrated characters? (Recommendation: real faces at HQ, a small original
   mascot for onboarding tips.)
4. **Art** — commission an illustrator (recommended: one style, ~80–100
   assets), license an icon set, or stay minimal for the beta.
5. **Reply promise** — what response time can the team actually keep? The app
   will display it.
6. **Who's staff** — names and photos for HQ, and who answers the inbox.
7. **Anonymous start** — let people build before giving an email
   (recommended), or require an account first?
