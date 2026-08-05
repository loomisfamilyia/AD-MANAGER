# Loomis Family Insurance Agency — Ads Manager

One dashboard for Google, Meta, and Reddit ad spend, measured against what an
insurance customer is actually worth to you.

**Stack:** React + Vite + TypeScript + Tailwind, Supabase (database, auth, edge
functions). Same stack as the landing-page app, so it deploys the same way.

---

## What this does that the ad platforms don't

Google, Meta, and Reddit will each tell you what a click costs. None of them can
tell you what a *policyholder* costs, because none of them know which quote
requests turned into signed business.

This app closes that loop:

```
ad spend  →  clicks  →  leads  →  quotes  →  sold policies  →  commission
   (from the platforms)   (from you)          (from you)      (calculated)
```

Then it compares your cost per lead against a **break-even** derived from your
own numbers:

```
policy value = avg annual premium × commission rate × years retained
lead value   = policy value × close rate
break-even   = lead value
target       = break-even × your margin
```

The retention term is the one people leave out, and leaving it out makes every
campaign look like a loser. A $1,800 auto policy at 12% pays $216 a year — worth
$216 if you ignore renewals, $648 if it stays three years. Agencies budgeting off
year-one commission alone systematically underbid and lose the auction to
competitors doing the full sum.

Set those five numbers on the **Settings** page before trusting any verdict.

---

## Setup

### 1. Install Node.js

Node isn't installed on this Mac yet. Easiest path: download the **LTS** installer
from <https://nodejs.org> and run it.

*(If you only ever build in Lovable you can skip this — Lovable compiles in the
cloud. You'd just lose local preview.)*

### 2. Install dependencies

```bash
npm install
```

### 3. Create the Supabase project

Use a **separate Supabase project** from the landing-page app. Ad data and email
contacts have different access patterns, and keeping them apart means a mistake
here can't touch your mailing list.

1. Create a project at <https://supabase.com>.
2. **SQL Editor → New query**, paste all of [`supabase/schema.sql`](supabase/schema.sql), run it.
3. **Project Settings → API** — copy the Project URL and the `anon public` key.

### 4. Create your login

**Authentication → Users → Add user.** Then under **Authentication → Providers →
Email**, turn **off** "Enable sign ups" so nobody can register themselves into
your ad data.

### 5. Environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

> Never put an ad platform token in a `VITE_` variable. Anything prefixed `VITE_`
> is compiled into the JavaScript bundle and readable by anyone who opens the
> page. Platform tokens go in Supabase function secrets — see below.

### 6. Run it

```bash
npm run dev
```

Opens on <http://localhost:8081> (8081, so it can run alongside the landing page
on 8080).

---

## Getting data in

Three paths, all writing to the same table. **You do not need API access to start.**

### Manual entry — works today

**Import → Enter a day by hand.** Pick a campaign, a date, and the numbers off
the platform's dashboard. Re-entering a date overwrites it, so fixing a typo is
just entering it again.

### CSV import — works today

Export a report **with a day-by-day breakdown** from any platform and drop the
file on the **Import** page. Column names are matched automatically across all
three platforms' export formats — `Cost`, `Amount spent (USD)`, and `Spend` all
land in the right place.

A summary export with no per-day rows can't be imported; re-export it with a
date breakdown.

### API sync — once approved

Read-only pulls, run from the **Connections** page. See the access table below.

---

## Tying spend to actual leads

This is the part that makes the whole thing work, and it's manual setup you do
once per campaign.

1. Give each campaign a **`utm_campaign` tag** on the Campaigns page — e.g. `goog-auto-search`.
2. Put that same tag on the landing page URL the ad points at:

```
https://loomisservices.com/?utm_source=google&utm_medium=cpc&utm_campaign=goog-auto-search
```

3. When a lead arrives carrying that tag, it attributes to that campaign
   automatically — a database trigger matches `utm_campaign` and links the row.

Leads you take by phone or in person can be attributed by hand: the **Came from**
dropdown on the lead form. When someone says "I saw your ad on Facebook," that's
attribution data — record it.

**Keep lead statuses current.** Every cost-per-policy and return-on-spend number
reads from that column. A pipeline that's all `new` makes profitable campaigns
look worthless.

### Feeding leads in from the landing page

The landing-page app already collects quote requests. Two options:

- **Manual/CSV** — export from that app periodically, add them here.
- **Direct** — point the landing page's form submission at this project's `leads`
  table as a second write, passing through the UTM parameters from the URL.

Either way, the attribution math starts working the moment leads carry a
`utm_campaign` value.

---

## API access — what it actually takes

The three platforms are not equally open, and planning around that saves a lot of
frustration.

| Platform | Difficulty | What gates it |
|---|---|---|
| **Meta** | Straightforward | A System User token reads your own ad accounts with **no App Review** — that exemption only covers accounts you own. Ask for `ads_read` only. |
| **Google Ads** | Approval required | A developer token with **Basic Access**, which is a mandatory review taking days. Needs all ad accounts linked to a manager (MCC) account. Brand verification on the linked Cloud project can cut the wait to hours. |
| **Reddit** | May not be granted | Access is **allow-listed informally**, weighted toward higher-spend advertisers. A correctly configured OAuth app can still be refused. Treat API access as a bonus and plan on CSV. |

Set secrets server-side only:

```bash
npx supabase login && npx supabase link --project-ref YOUR-PROJECT-REF
```

```bash
npx supabase secrets set META_ACCESS_TOKEN=... META_AD_ACCOUNT_ID=act_1234567890
```

```bash
npx supabase functions deploy sync-meta
```

Google and Reddit follow the same shape — the full secret list is in
[`.env.example`](.env.example), and per-platform setup steps are on the
**Connections** page inside the app.

### A note on the Reddit connector

`sync-reddit` follows Reddit's documented v3 reports endpoint but, unlike the
other two, **has not been verified against a live account** — nobody can verify
it without an allow-listed account. When access is granted, check the response
shape against the docs you receive, and confirm one day's spend against Ads
Manager before trusting a month of it. The file says so at the top too.

---

## This app is read-only against the ad platforms

Nothing here can create a campaign, change a budget, adjust a bid, or pause an
ad. The connectors request reporting scopes and there is no code path that
issues a write. A bug in this app cannot spend your money.

Pausing and budget changes stay in each platform's own console on purpose. If you
later want that control here, it's a deliberate addition — with confirmation
prompts — not something to leave switched on by default.

The **status** dropdown on the Campaigns page is a local label for your own
bookkeeping. Setting a campaign to "paused" here does not pause it at Google.

---

## Reading the dashboard

- **Cost per lead** — the headline. Compared against your target.
- **On target / Thin margin / Losing money** — where cost per lead sits relative
  to your target and your break-even. Between the two, each lead still earns more
  than it cost, just with less margin than you wanted.
- **Too early** — fewer than 3 leads. Deliberately unjudged: pausing a campaign
  on one expensive lead is the most common way to kill a profitable one.
- **Return on spend** — estimated commission ÷ spend. Above 1.0× paid for itself.
- **Platform conversions** — what the platform claims. Stored, but never mixed
  with your own lead count. Each platform counts differently and comparing their
  numbers to each other is meaningless.
- **"—"** means genuinely undefined, not zero. A cost per lead with no leads is
  not $0.00.

Every chart has a **Table** toggle for exact values.

---

## Deploying to Lovable

1. Push this folder to its own GitHub repository.
2. Lovable: **New Project → Import from GitHub**.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
4. Publish. Keep it on a private URL or a subdomain — this is an internal tool
   holding customer names, emails, and phone numbers. `index.html` sends
   `noindex, nofollow`, but that's not access control.

---

## Project layout

```
src/
  lib/metrics.ts       All the math — unit economics, CPL, verdicts
  lib/csv.ts           Report import + column matching
  lib/palette.ts       Chart colors by role
  pages/Dashboard.tsx  KPIs, spend trend, cost-per-lead comparison
  pages/Campaigns.tsx  Per-campaign performance
  pages/Leads.tsx      Pipeline + premium tracking
  pages/Import.tsx     Manual entry + CSV
  pages/Connections.tsx  Sync status + per-platform setup
  pages/Settings.tsx   The five numbers everything derives from
supabase/
  schema.sql           Tables, triggers, RLS
  functions/sync-*/    Read-only platform connectors
```

---

## Before you rely on it

- [ ] Real numbers in Settings — the defaults are placeholders
- [ ] A `utm_campaign` tag on every campaign, matching the ad's landing URL
- [ ] Lead statuses kept current
- [ ] Sign-ups disabled in Supabase Auth
- [ ] Ad platform tokens in function secrets, never in `.env`
- [ ] Check your state DOI rules — insurance advertising has extra requirements
      in many states, and some require your license number in ad creative
