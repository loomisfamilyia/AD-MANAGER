# Our Privacy Promise

> **Draft for review by Loomis's attorney and E&O carrier.** The wording
> below is meant to be shown to clients as-is once approved.

Loomis wants a very clear, transparent privacy promise to be the last thing a
client reads before they create an account or save their world: a specific
commitment to secure their data, never sell it, and protect it as if it were
our own family's.

This document has four parts:

1. **[The promise screen](#1-the-promise-screen)** — the exact client-facing
   copy, shown at the start of the Save sheet.
2. **[Promise ↔ proof](#2-promise--proof)** — each promise next to the thing
   that makes it true. A promise with no proof doesn't ship.
3. **[Rules for the team](#3-rules-for-the-team)** — what every future change
   has to respect so the promise stays true.
4. **[The full privacy notice](#4-the-full-privacy-notice-outline-for-counsel)**
   — an outline for counsel. The formal notice must match the promise.

---

## Why the wording is careful

A privacy promise only builds trust if every word of it is literally true,
and it must stay true as the app grows. An over-promise is also a legal risk:
state unfair- and deceptive-practices laws apply to privacy statements, and
the formal GLBA privacy notice has to describe what really happens.

That's why the promise says **"we never sell it"** rather than **"we never
share it."** An insurance agency *has* to send information to insurance
companies to get a quote; the services that run the app (the database, email)
handle the data; and courts and state insurance regulators can require
records. So the promise names exactly who can ever see client information,
and it's a short list. Written this way, it's both stronger and true.

---

## 1. The promise screen

**Where it appears:** the first screen of the Save sheet, before the client
chooses between *Make a free login* and *Just send it to Loomis*
([GAME_DESIGN.md §12.1](GAME_DESIGN.md#121-saving)). It is also always
available from the menu ("🔒 Our privacy promise") and as a page on the public
website.

**Look:** Roxie sits proudly beside a closed gold padlock (art: `roxie-guard`).
One column of big cards, nothing in small print, and the same text size as the
rest of the game.

---

### Your world is safe with us

*Roxie:* **Before you save, here's our promise to you — in plain words.**

| | Promise | In plain words |
|---|---|---|
| 🔒 | **We lock it up** | Everything you tell us is encrypted and kept in a private, locked-down system. Photos of your home and valuables are never public. |
| 🚫 | **We never sell it. Ever.** | We don't sell, rent or trade your information. No advertisers, no data brokers, no ad trackers inside your world. |
| 🤝 | **We share it only to get you insurance** | When you ask for a quote, we send the insurance companies you choose only what they need to price it. |
| 👀 | **Only your Loomis team can see it** | Inside Loomis, only licensed staff can open your world, and they must pass a second security check to sign in. |
| 🗑️ | **It's yours** | See it, fix it or delete it any time. Ask us to erase it and we will, except the few records the law requires us to keep. |
| 📣 | **If something goes wrong, we'll tell you** | Quickly and plainly, and we'll help you through it. |

*The services that run this app for us, like our secure database, handle your
information under strict contracts. And like every insurance agency, we
answer to the courts and to state insurance regulators in New York and
Pennsylvania. That's the whole list.*

**We treat your information the way we'd treat our own family's.**

**[ Sounds good — let's save my world ]**
[Read the full privacy notice](#4-the-full-privacy-notice-outline-for-counsel)

---

On the *Just send it to Loomis* contact form, one line sits next to the Send
button: *"Same promise: we never sell it, and we only use it to help you with
insurance."*

---

## 2. Promise ↔ proof

| Promise | What makes it true | Where |
|---|---|---|
| **We lock it up** — encrypted, private, photos never public | Supabase encrypts data at rest and in transit. Row Level Security on every table means each client can reach only their own household. Photos live in a **private** bucket and are shown only through links that expire within minutes. Photos are re-encoded in the browser before upload, which strips the location data phones embed in them. | `supabase/schema.sql`; TECHNICAL_DESIGN.md §5 |
| **We never sell it** — no advertisers, brokers or ad trackers | No data-broker or advertising integrations exist. No third-party analytics or ad pixels load on any `/my-world` or `/staff` page. Client data is never uploaded to ad platforms (rule 2 below). Ad attribution happens inside Loomis's own Ads Manager, server-side. | TECHNICAL_DESIGN.md §5.1, §7.6 |
| **We share it only to get you insurance** | Quote requests go to Loomis staff, and an agent submits to the carriers the client chose, through the agency's normal channels. There are no automated feeds of client data to anyone in v1. | TECHNICAL_DESIGN.md §7 |
| **Only your Loomis team can see it** | Staff access requires both an active `staff_members` row and a second sign-in factor (`aal2`) — enforced by the database, not the app. Removing a staff member takes effect on their next request. 77 automated tests attack these rules. | `prm_is_staff()`; `supabase/tests/rls.test.mjs` |
| **It's yours** — see, fix, delete | Clients edit everything in their world directly. The household owner can delete their household, and everything in it goes with it. Staff can delete on request. Records the law requires us to keep are the exception (counsel to define). | schema.sql (`owner_delete`, cascades); TECHNICAL_DESIGN.md §5.3 |
| **We'll tell you** | An incident response plan with both states' deadlines: NY DFS and the PA Insurance Commissioner for regulators, plus each state's consumer breach-notice law. | TECHNICAL_DESIGN.md §5.4 |
| **"That's the whole list"** | The vendor list (Supabase, Lovable, RentCast, Google address search, email provider) is kept in TECHNICAL_DESIGN.md §5.4, each under a written agreement. Adding a vendor that touches client data requires a promise review (rule 3 below). | TECHNICAL_DESIGN.md §5.4 |

**What the game never asks for at all:** Social Security numbers, driver's
license numbers, health details, or bank and payment information
(TECHNICAL_DESIGN.md §5.2). Information we never collect can't leak.

---

## 3. Rules for the team

These keep the promise true as the app grows. Every Claude session and every
developer follows them, and the Lead checks them in each milestone's security
review.

1. **No third-party scripts that see client data.** No analytics, ad pixels,
   chat widgets or session-recording tools on `/my-world` or `/staff` pages.
2. **Never send client data to an ad platform.** No Google or Meta customer
   lists, no "offline conversion" uploads, and no hashed emails. That's a
   common marketing practice and it would break "we never sell it… no ad
   trackers." Campaign attribution stays inside the Ads Manager.
3. **A new vendor that touches client data needs a promise review first:** a
   written agreement, an entry on the vendor list, and a check that the
   footnote ("that's the whole list") is still true.
4. **Any change in who can see what goes through the Lead** and comes with a
   new test in `rls.test.mjs`.
5. **If the promise ever has to change, clients hear about it before it
   changes.** It never changes quietly.

---

## 4. The full privacy notice (outline for counsel)

The formal notice is the legal document; the promise is its plain-language
summary. **They must never disagree.** Counsel to draft, covering at least:

- **Who we are** and how to reach us.
- **What we collect:** what clients enter in the app (household, property,
  vehicles, valuables, photos, coverage plan, budget, messages), how to reach
  them, and basic technical data needed to run the service (sign-in records,
  security logs).
- **Where it comes from:** the client; public records (property-data
  provider, NHTSA vehicle data); and, at quote time, insurance companies and
  the consumer reports they may order with the client's permission where
  required (driving records, claims history, and credit-based insurance
  scores where state law allows). Say this plainly: it's part of quoting.
- **Why we use it:** to help the client understand, plan and buy insurance,
  and to service their policies.
- **Who we share it with:** insurers the client asks us to quote; service
  providers under contract; as required by law or regulators. **Never sold;
  never shared for anyone else's marketing.** If that holds, there's no
  opt-out to offer, and the notice should say why.
- **How we protect it:** encryption, access controls, staff MFA, audit
  trail, private photo storage, and data minimization.
- **Your choices and rights:** access, correction, and deletion (with legal
  retention exceptions), plus any state-law rights that apply to New York and
  Pennsylvania residents.
- **Saved without a login:** how those clients reach us to see, change or
  delete their information.
- **Cookies:** essential only, with no tracking cookies in the client area.
- **Children:** the service is for adults; it isn't directed to children
  under 13.
- **Changes:** clients are told before any material change.
- **Required state content:** confirm what New York and Pennsylvania require
  of an insurance agency's privacy notice (GLBA as adopted by each state's
  insurance regulator) and when it must be delivered: at account creation
  **and** on the save-without-login form.

Open questions for counsel:

1. The retention periods for client records, messages and quote requests, so
   "except the few records the law requires us to keep" can be made specific.
2. Whether "encrypted" and "a second security check" are acceptable as
   written, given the controls in §2.
3. Whether the promise screen should link to, or include, the formal notice
   at the moment of account creation.
4. Whether a privacy promise like this needs E&O carrier review as marketing
   material.
