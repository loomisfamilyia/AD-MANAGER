# Personal Risk Manager: Data Sources & Platform Facts

Researched 2026-10-31 for Loomis Family Insurance Agency. These are research notes, not legal advice.

**Method caveat:** The sandbox blocked direct fetches of vendor docs (ATTOM, RentCast, NHTSA). Findings come from web-search results, which include third-party summaries and vendor marketing. Anything marked ⚠️ verify is unconfirmed, possibly stale, or conflicting across sources.

## Bottom line

| Integration | Recommendation for v1 | Cost signal | Effort | Confidence |
|---|---|---|---|---|
| Zillow data | Do not build on it. Send a Bridge inquiry in parallel, off the critical path. Offer an optional "open on Zillow" link or a user-typed value. | $0 to apply; approval is discretionary | n/a | High that it is not easy |
| Property data (year built, sq ft, stories, roof, last sale, assessed value) | **RentCast** (fallback: **ATTOM**). Treat results as pre-fill the client confirms. | RentCast: free tier (~50 calls/mo), then roughly $75-100/mo per 1,000 calls ⚠️ verify. ATTOM: $500+/mo | S (Edge Function + cache) | Medium |
| County assessor sites | Do not integrate directly. Use the aggregator above. | n/a | XL (per county) | High |
| Replacement cost | No API in v1. Use client-confirmed inputs, a clearly labeled rough estimate, and carrier or agency-system tools at quote time. | Enterprise or carrier-embedded | L (later) | Medium |
| VIN decode and recalls | NHTSA vPIC and recalls APIs, **called through a Supabase Edge Function with a cache**, not from the browser. | Free | S | High on endpoints; Low on CORS (unconfirmed) |
| Vehicle value | Skip in v1 (no free source). Let the client enter an estimate. Later: VinAudit or CarsXE. | Pay per call ⚠️ verify | S | Medium |
| VIN scanning | `barcode-detector` polyfill (ZXing-WASM) with live camera. Always show manual entry and a photo-upload fallback. | Free | M | Medium |
| Address autocomplete | **Google Places Autocomplete (New)**; fallback Radar. | 10k autocomplete requests/mo free, then ~$2.83/1k ⚠️ verify | S | Medium-High |
| Auth | Anonymous sign-in, then link an email using **email OTP code** (not magic link). Add passkeys later. | Supabase Pro $25/mo; SMS ≈ $0.06 each | M | High |
| File storage | Private bucket, `{uid}/...` folder RLS, signed URLs | Included | S | High |
| Game feel | Web Audio with gesture unlock, haptics as progressive enhancement, motion and sound toggles | Free | S | Medium |
| Regulatory | Counsel and E&O review before launch (list in section 10) | n/a | n/a | Medium |

## 1. Zillow

**Short answer: "pull Zillow data" is not realistic as a self-serve integration.**

- Zillow's public API (the ZWSID program) was retired 2021-09-30. The official route is now Bridge Interactive (Bridge Data Output), which is application-based, approved dataset by dataset, and discretionary.
- Sources conflict on whether the Zestimate is available through Bridge, and on whether it is partner-only. ⚠️ verify directly with Bridge.
- Bridge is built for MLS-affiliated brokers and portals. An insurance agency pre-filling a quote portal is outside the usual approved uses.
- Terms are restrictive. The legacy terms prohibited storing results locally, and the whole program was display-oriented. One developer reports Zillow objected to even recording Zestimates in a spreadsheet and does not allow derivative works. Current Bridge terms were not readable here. ⚠️ verify.
- The many "Zillow API" scraping services (RealtyAPI and similar) violate Zillow's Terms of Use. A licensed insurance entity should not depend on them.
- **Even with access, a Zestimate is a market value, not a rebuild cost** (section 4).
- Cheap option: apply to Bridge (cost: an email) and ask about eligibility, Zestimate use and storage rights. If it comes through, it is a nice-to-have, not a dependency.

Sources: [API Report Card](https://supergood.ai/api-report-card/zillow-api) · [RealtyAPI 2026 guide](https://www.realtyapi.io/blog/how-to-get-property-data-from-zillow-using-an-api-2026-guide) · [Zillow Group developers](https://www.zillowgroup.com/developers/mls-broker-data) · [Tiller forum on legacy terms](https://community.tiller.com/t/zillow-script-error-when-calling-web-service/4759) · [WPResidence note](https://help.wpresidence.net/article/zillow-estimate/)

## 2. Property data alternatives

| Provider | Returns | Pricing and access | Storage terms |
|---|---|---|---|
| **RentCast** | Year built, sq ft, lot, beds/baths, last sale and sale history, tax assessments, AVM. Feature fields include roof type and floor count (⚠️ verify coverage). | Self-serve. Free ~50 calls/mo; paid tiers by call volume (~$99 per 1,000 per a third-party listing ⚠️ verify). | Developer licensing page allows storing on internal systems, derivative products and end-user distribution; no attribution required. Check the full ToU. |
| **ATTOM** | Broadest set: construction, roof cover and framing, stories, assessed and market value, sales, plus AVM. | Self-serve developer platform with a 30-day trial (500 calls/day). Basic Property API "starts at $500/mo"; premium is quoted. | Contract-dependent ⚠️ verify caching and redistribution. |
| **Estated** | Same family as ATTOM. | Acquired by ATTOM in 2022. ATTOM says no deprecation planned but possible, with 6+ months' notice. A third party says docs deprecate in 2026. | ⚠️ verify. Do not start new here. |
| **Smarty US Property Data** | ~350 attributes, including roof material and type, construction, stories, sq ft, assessed and market value. | Has a free trial; pricing not confirmed. | ⚠️ verify |
| **Regrid** | Parcel geometry, APN, lot, zoning. Building footprint is premium. No roof data found. | Self-serve, billed per record (from 2,000 records/mo). | ⚠️ verify |
| **Cotality (ex-CoreLogic)** | Insurance-grade prefill and reconstruction cost. | Sales-led enterprise; no self-serve residential API found. | Contract |
| **HouseCanary / Melissa** | AVM and details (HouseCanary); credit-based property web APIs (Melissa). | HouseCanary ~$0.05 to $6 per call, sources conflict; Melissa ~$4.95 per 1,000 credits for basic APIs, property costs more. | ⚠️ verify |

Also worth knowing: BatchData, Realie, Lightbox. Fenris is B2B insurance prefill.

**Recommendation:** v1 = **RentCast** (self-serve, cheap, storage-friendly). Fallback = **ATTOM** (more authoritative, assessor-sourced roof and construction fields). Trial Smarty in parallel if roof coverage in RentCast is thin.

- Roof, construction and stories are often missing or coded inconsistently in any provider. Design the UI as "we found this, please confirm", with the source and as-of date shown.
- Call providers only from an Edge Function (the API key must stay server-side). Cache per address with a TTL (e.g., 90 days) to control cost.

Sources: [ATTOM pricing](https://www.attomdata.com/solutions/delivery/property-data-api/pricing/) · [ATTOM trial and plans](https://support.attomdata.com/articles/9704145040-api-pricing-trial-extensions-and-paid-plans) · [ATTOM on Estated](https://cloud-help.attomdata.com/article/661-is-estated-api-being-replaced) · [ATTOM PropertyFeature](https://cloud-help.attomdata.com/article/486-propertyfeature) · [RentCast docs](https://developers.rentcast.io) · [Regrid plans](https://support.regrid.com/reference/plan-options) · [Smarty](https://www.smarty.com/products/us-property-data) · [HouseCanary pricing](https://housecanary.com/pricing) · [Cotality](https://www.cotality.com/products/underwriting-commercial-valuation)

## 3. County assessor data

- Counties run varied stacks: Beacon (Schneider Geospatial) web portals, Vanguard or Tyler iasWorld back ends, and ArcGIS REST or open-data portals for parcel geometry. Few expose a documented attribute API.
- Fields (roof, construction, stories) are inconsistent or absent. Some counties offer free bulk downloads (Maricopa, Scott County IA). Others sell them or restrict automated access. ToS bans on scraping are documented for some assessor sites (e.g., Maryland SDAT, BC Assessment). Beacon's own terms were not confirmed. ⚠️ verify per county.
- With about 3,000 counties and an unknown state, direct integration is not realistic. **Use an aggregator** (section 2). Revisit a county-specific bulk file only if the agency's book is concentrated in one or two counties.
- Ask the agency owner for the states and counties they write in. That decides whether this matters at all.

Sources: [Scott County IA bulk download](https://www.scottcountyiowa.gov/assessor/property-data-bulk-download) · [Maricopa data guide](https://mcassessor.maricopa.gov/file/data_sales/Data-Downloads-Guide.pdf) · [ParcelQuest bulk](https://parcelquest.com/gis-data/bulk) · [Maryland SDAT terms](https://sdat.dat.maryland.gov/RealProperty) · [Noble County Beacon brochure](https://secure.in.gov/counties/noble/files/gis-department/Beacon_Website_Brochure_Ver1_2024.pdf)

## 4. Replacement cost vs market value

**For the design doc:** Market value (a Zestimate, AVM or assessed value) is what a buyer would pay, including land, location and market sentiment. Replacement cost is what it costs to rebuild the structure today, with no land: local labor and materials, code upgrades, finishes, roof and complexity. The two diverge after storms, in hot or cold markets, and for custom, historic or high-finish homes. Setting Coverage A from market value leads to underinsurance, a classic E&O claim.

- **Tools in use:** Verisk 360Value (formerly HomeValue and XactValue), e2Value, Cotality RCT Express.
- **Access:** 360Value is licensed from Verisk and embedded in policy systems or used standalone. Agents typically reach it through the carrier or MGA they quote with, or an agency-management integration. A direct API license for a small independent agency was not confirmed. e2Value markets an API aimed at carriers and systems. ⚠️ verify.
- **Practical v1:** Do not promise an automated figure. Capture the inputs (sq ft, year, stories, roof, construction, finish level) and show a "rough range" labeled as an estimate for the agency to refine. Ask the owner which tools the agency already licenses (EZLynx, Applied, HawkSoft, carrier portals), since those run 360Value or RCT at quote time anyway.

Sources: [Verisk 360Value integration options (PDF)](https://www.verisk.com/siteassets/media/underwriting-v/resources/360value-integration-options.pdf) · [BriteCore 360Value](https://help.britecore.com/hc/en-us/sections/8298314135955-360Value) · [e2Value](https://e2value.com/?p=5550) · [EZLynx + RCT Express](https://int.ezlynx.com/blog/posts/msb-residential-pre-fill-and-reconstruction-cost-valuations/)

## 5. VIN decoding and vehicle value

**NHTSA vPIC**
- Endpoint: `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json[&modelyear=YYYY]`. It returns one flat object in `Results[0]` with ~140 string fields. Useful ones: Make, Model, ModelYear, Trim, Series, BodyClass, VehicleType, DriveType, FuelTypePrimary, EngineCylinders, DisplacementL, GVWR, PlantCountry, Manufacturer, safety flags (ABS, ESC, airbag locations, ADAS), and ErrorCode/ErrorText. It does not return value, color, mileage or title.
- Rate limits: no published number. NHTSA says an "automated traffic rate control" applies and that there is no daily cap. A third party observed HTTP 429 above ~5 requests/second per IP. Batch decode exists (~50 VINs).
- **CORS is unconfirmed.** No source documents it, and the sandbox blocked a live test. Do not assume the browser can call it. Test in 5 minutes with `curl -I -H "Origin: https://yourapp.example" <vPIC URL>` and look for `Access-Control-Allow-Origin`.
- **Recommendation: proxy through a Supabase Edge Function regardless.** VIN decoding is deterministic, so cache it. This also hides the rate limit, normalizes the fields, and gives one place to add a fallback.
- Validate before calling: 17 characters, no I/O/Q, check digit at position 9. Warn but do not block on a bad check digit, because it is only required for North American vehicles ⚠️ verify.

**NHTSA recalls**
- Endpoint: `https://api.nhtsa.gov/recalls/recallsByVehicle?make=&model=&modelYear=`. It takes make, model and year, not a VIN, so chain it after vPIC. Public, no key. Model names must match NHTSA's list (`products/vehicle/models`). CORS is unconfirmed; proxy it too.
- These are recalls issued for the model-year, not proof that this VIN has an open recall. Label them accordingly. ⚠️ verify whether NHTSA exposes a VIN-level recall API.

**Vehicle value**
- No free authoritative source. Paid options: CarsXE and VinAudit (market-value APIs by VIN), Marketcheck (listing-based), CarAPI.dev (100 free calls/mo), Vincario. J.D. Power, Black Book and similar are enterprise-licensed. ⚠️ verify pricing for all.
- v1: have the client enter an estimated value. Agreed or actual-cash value is set at quote time anyway.

Sources: [vPIC FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq) · [vPIC API home](https://vpic.nhtsa.dot.gov/api/Home) · [NHTSA datasets and APIs](https://www.nhtsa.gov/node/102181) · [vPIC tutorial](https://eitserv.tech/blog/nhtsa-vin-decoder-api-tutorial) · [Free VIN API comparison](https://cardog.app/blog/free-vin-decoder-api-comparison) · [VIN API pricing](https://vincario.com/blog/?p=698) · [CarsXE market value](https://docs.carsxe.com/market-value) · [VinAudit](https://data.vinaudit.com/market-values-api)

## 6. VIN scanning in a mobile browser

- **BarcodeDetector:** Chrome on Android supports it (caniuse rows disagree on the version: 147 vs 152; it has existed on Android for years. ⚠️ verify). **iOS Safari does not usably support it.** It is "disabled by default" through iOS 26.x, and desktop Safari and Firefox lack it. Always feature-detect `'BarcodeDetector' in window`, then call `getSupportedFormats()`.
- **Label formats:** Door-jamb and certification labels are mostly **Code 39** (1D). Some makers, notably GM on some models, use **Data Matrix**; QR is occasionally used. A QR-only scanner will miss the common case. Scan for `code_39`, `data_matrix` and `qr_code`. Windshield plates are usually printed text, with a barcode on some.
- **Open source:** The `barcode-detector` npm ponyfill (Sec-ant) wraps ZXing-C++ in WASM, lists code_39 and data_matrix, and only patches `BarcodeDetector` where it is missing. It loads WASM from jsDelivr by default, so self-host it. `@zxing/library` (zxing-js) is reported as legacy and `html5-qrcode` as unmaintained (my recollection). ⚠️ verify both.
- **Commercial:** STRICH (~$99/mo entry plan per Capterra, 30-day trial ⚠️ verify), Scandit (quote-based), Dynamsoft (per-license; figures ambiguous), Scanbot (has a dedicated web VIN scanner module with barcode and OCR). Pay only if open-source decode rates prove poor in testing.
- **OCR for windshield plates:** Glare, curvature and dirt hurt accuracy; no independent benchmarks found. Options: Scanbot or OCR Studio WASM SDKs, Anyline, or photo upload with server-side OCR or a multimodal model. Always validate the VIN (check digit plus a vPIC decode) and have the user confirm year, make and model.
- **v1 recommendation:** (1) live camera via `barcode-detector` for the door-jamb barcode; (2) always-visible manual VIN field; (3) photo upload as fallback, with extraction deferred to v1.5. Test on real iPhones and Androids with real door jambs in poor light.

Sources: [caniuse BarcodeDetector](https://caniuse.com/mdn-api_barcodedetector) · [Web features explorer](https://web-platform-dx.github.io/web-features-explorer/features/barcode) · [barcode-detector (npm)](https://npmjs.com/package/barcode-detector) · [Sec-ant/barcode-detector](https://www.Github.com/Sec-ant/barcode-detector) · [barKoder on VIN barcodes](https://barkoder.com/blog/vehicle-identification-number-vin-via-barcoding) · [STRICH](https://strich.io) · [STRICH on Capterra](https://www.capterra.com/p/10020686/STRICH/pricing/) · [Scanbot VIN scanner](https://docs.scanbot.io/web/data-capture-modules/vin-scanner/introduction/) · [CarsXE on VIN OCR](https://carsxe.com/blog/mobile-ocr-vin-decoding-key-features)

## 7. Address autocomplete

| | Pricing basics | Terms that matter |
|---|---|---|
| **Google Places Autocomplete (New)** | Essentials: 10,000 free requests/mo, then ~$2.83/1k. A session closed by a Place Details call makes the autocomplete requests free; the Place Details call is billed. Abandoned sessions revert to per-request pricing. ⚠️ verify | Using sessions is required for cost control. Results shown on a map must be on a Google map. Without a map you must show the Google logo; the built-in widget handles this. Only `place_id` may be stored indefinitely, and other Places content is restricted, so persist the user-confirmed address fields rather than Google's raw payload. ⚠️ verify with counsel. |
| **Mapbox Search Box** | Session-based. Free allowance and rates conflict across sources (500 to 2,500 free sessions; $3 to $11.50/1k). | Temporary results cannot be stored; permanent geocoding is billed separately (~$5/1k, no free tier). |
| **Radar** | 100,000 free requests/mo, then $0.50/1k. | Storage rights not found. ⚠️ verify |
| **Geoapify** | Free: 3,000 credits/day, with limited commercial use per a directory. | Storage rights not found. ⚠️ verify |

**Recommendation:** Google Places (New) with session tokens for best US address quality. Radar is the cheap fallback. Store the confirmed address, `place_id`, and the property provider's normalized address.

Sources: [Google Maps pricing](https://developers.google.com/maps/billing-and-pricing/pricing) · [Google session pricing](https://developers.google.cn/maps/documentation/places/ios-sdk/session-pricing?hl=en) · [Places policies](https://developers.google.com/places/web-service/policies) · [Mapbox Search JS pricing](https://docs.mapbox.com/mapbox-search-js/guides/pricing/) · [Radar on Google costs](https://radar.com/blog/google-maps-api-cost) · [Geoapify autocomplete](https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/)

## 8. Supabase auth, storage, compliance

**Anonymous sign-ins**
- `supabase.auth.signInAnonymously()` creates a real `auth.users` row and a JWT with `is_anonymous: true`. The role is still **`authenticated`**.
- **Anonymous users are not harmless to RLS.** Any policy that says `TO authenticated` or `auth.uid() IS NOT NULL` admits them, and one unauthenticated POST mints one. Audit every policy. Add restrictive policies such as `(auth.jwt()->>'is_anonymous')::boolean IS NOT TRUE` on shared, staff-visible or expensive resources. Docs warn a restrictive policy needs a permissive one alongside it.
- Abuse controls: enable CAPTCHA (Turnstile or hCaptcha) for anonymous sign-in. Rate limits are per IP (default around 30/hour ⚠️ verify). Cap rows and storage bytes per anonymous user, restrict upload MIME types and size, and purge stale anonymous users (docs suggest a 30-day pattern).
- **Conversion:** `updateUser({ email })` on the anonymous session links the email and keeps the same `user.id`, so the data stays attached. OAuth uses `linkIdentity()` and needs manual linking enabled. If the email already belongs to an existing account, the link fails and you need a "sign in instead" flow. Data does not merge automatically. ⚠️ verify.

**Email OTP vs magic link on mobile**
- Magic links often open in a mail app's in-app browser or Safari. That session lands in a different cookie jar than the page or PWA where the user started. iOS home-screen PWAs also have storage separate from Safari. Link previews can burn single-use links.
- **Use a 6-digit email OTP typed into the page** (`signInWithOtp` / `verifyOtp`, and edit the template to show `{{ .Token }}`). Offer the link only as a secondary option.
- Configure custom SMTP before launch. Supabase's built-in email sender is for testing and is heavily rate-limited. ⚠️ verify.

**SMS OTP:** Supabase supports Twilio, Twilio Verify, MessageBird/Bird and Vonage. Twilio Verify is about $0.05 per successful verification plus ~$0.008 per SMS and carrier surcharges (≈$0.06 total); failed attempts still bill. Keep SMS optional; email OTP is the default.

**Passkeys:** Beta/experimental (announced 2026-05-28). The API may change and clients must opt in. Not a v1 dependency. ⚠️ verify.

**Storage RLS:** Use a private bucket with paths like `{uid}/{asset-id}.jpg`. Policies on `storage.objects` per operation: `bucket_id = 'vehicle-photos' AND (storage.foldername(name))[1] = (select auth.uid())::text`. Serve with `createSignedUrl` (short expiry). Set bucket size and MIME limits, and strip EXIF GPS data from photos client-side. Add a separate staff policy (a role table or custom claim) so agency staff can read client files. Do not trust client-supplied paths.

**Compliance:** Supabase holds an annual SOC 2 Type 2 audit, and the report is downloadable by Team and Enterprise customers. HIPAA BAA is available on Team/Enterprise with a paid HIPAA add-on (price not on an official page; third parties say ~$350/mo ⚠️ verify). Team starts at $599/mo. HIPAA is likely irrelevant for personal P&C lines unless the agency handles health data.

Sources: [Anonymous sign-ins](https://supabase.com/docs/guides/auth/auth-anonymous) · [Anonymous sign-ins blog](https://supabase.com/blog/anonymous-sign-ins.md) · [Passkeys docs](https://supabase.com/docs/guides/auth/passkeys) · [Passkeys changelog](https://supabase.com/changelog/46458-passkeys-for-supabase-auth-beta) · [Magic link problems (Okta)](https://developer.okta.com/docs/guides/email-magic-links-overview/main/) · [OTP vs magic links](https://www.scalekit.com/blog/otp-vs-magic-links-passwordless-authentication) · [Twilio Verify pricing](https://twilio.com/verify/pricing) · [Storage RLS guide](https://flaviocopes.com/courses/supabase/protect-storage-objects/) · [Supabase security](https://supabase.com/security) · [SOC 2](https://supabase.com/docs/guides/security/soc-2-compliance) · [BAA](https://supabase.com/legal/customer-resources/business-associate-agreement)

## 9. Mobile web "game feel" (2026)

- **Web Audio unlock (iOS):** Create or `resume()` the `AudioContext` inside a user gesture (click or touchend). Re-resume on `visibilitychange`, because contexts can stay silent after backgrounding. A WebKit report says `resume()` can hang in iOS 26 home-screen web apps. ⚠️ verify.
- **Silent switch:** By default the iOS ringer switch **mutes Web Audio** (the default session is ambient), while HTML `<audio>` is not muted. Setting `navigator.audioSession.type = 'playback'` (Safari, iOS 17+) overrides that. It is an Editor's Draft that only Safari implements. The older workaround is a silent looping `<audio>` (unmute.js). Suggest respecting the switch for UI sounds and giving an in-app toggle.
- **Vibration:** `navigator.vibrate` works on Android Chrome and Firefox but **not on any iOS browser** (WebKit has never implemented it). The iOS workaround is a hidden `<input type="checkbox" switch>` toggled inside a user gesture (Safari 17.4+), which gives a haptic tick. It is undocumented, so treat it as progressive enhancement, and iOS system-haptics settings can disable it.
- **Web Push on iOS:** iOS/iPadOS 16.4+, **only for home-screen installed PWAs** (manifest `display: standalone`). Request permission from a user gesture, since a denial generally requires removing and re-adding the app. Push does not work in a Safari tab. Some reports of flaky delivery. Android Chrome supports push in-browser.
- **prefers-reduced-motion:** Supported in all current major browsers (not re-verified this session). Honor it, and note it does not cover sound or haptics, so add in-app motion, sound and haptics toggles.

Sources: [unmute-ios-audio](https://github.com/illuspas/unmute-ios-audio) · [WebKit bug 237322 (ringer mutes WebAudio)](https://auto-bugs.webkit.org/show_bug.cgi?id=237322) · [WebKit bug 263627](https://bugs.webkit.org/show_bug.cgi?id=263627) · [WebKit bug 291892](https://bugs.webkit.org/show_bug.cgi?id=291892) · [W3C Vibration implementation report](https://w3c.github.io/vibration/reports/implementation.html) · [ios-vibrator-pro-max](https://github.com/samdenty/ios-vibrator-pro-max) · [OneSignal iOS web push](https://documentation.onesignal.com/docs/web-push-for-ios) · [Pushpad iOS requirements](https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications)

## 10. Insurance regulatory notes (research only, not legal advice)

**NAIC Insurance Data Security Model Law (#668)**
- Requires a written information security program based on a risk assessment, scaled to size: a responsible person, access controls, encryption and MFA, third-party service provider oversight (due diligence and contract terms), an incident response plan, and notice to the commissioner after a cybersecurity event.
- Model deadline: **72 hours** from a determination. States vary (3 business days is common; 5 in MN, 10 in MI). Consumer breach notice follows separate state laws.
- Licensees with fewer than 10 employees (including contractors) are exempt from the program requirement, but **not** from investigation and notification.
- Adoption: 21 states by April 2022. NAIC publishes a map dated May 1, 2026 whose tally I could not read. My estimate is a majority of states now. ⚠️ verify the count and the agency's own state. New York's DFS Part 500 (23 NYCRR 500) is separate and stricter.

**GLBA privacy**
- State insurance departments enforce GLBA privacy for insurance, mostly through NAIC Model 672 (state versions vary; a few use opt-in). Agencies give "customers" an initial notice when the relationship begins. Annual notices are not required if sharing stays within non-opt-out exceptions (2017 amendments; adoption varies). Non-customer consumers get notices only in narrower cases.
- Design: link the privacy notice at signup. Anonymous users may still be "consumers" in some states. Whether the FTC Safeguards Rule reaches insurance agencies was not confirmed. ⚠️ verify.

**Anti-rebating and inducements (gamification, referral gifts)**
- Rebating is regulated state by state. The NAIC amended Model 880 in Dec 2020 to allow value-added services and reasonable non-cash gifts, with a suggested cap of the lesser of 5% of premium or $250 per summaries. States can set their own caps; many did not adopt it, or kept older limits. ⚠️ verify.
- Typical limits: NY $25 (a $5 gift card for accepting quotes was ruled an unlawful inducement), NH and NJ $100, FL reportedly $100 non-cash per client per year, and historical state caps span ~$10-$200. Referral fees paid to clients are the main trap, because rebating laws still apply. Fees to non-clients are often unrestricted but vary by state.
- Design implication: keep in-app rewards non-monetary (badges, XP, cosmetics) and never conditional on buying a policy. Avoid gift cards, cash, sweepstakes and anything with a monetary value. Referral gifts should be state-gated.

**"Protected" language and binding**
- Disclaimers alone do not protect an agency from E&O claims. "You're covered" statements before the carrier confirms in writing are a known exposure. Online quote channels can be bindable. Binding authority must be verified per carrier.
- Design implication: use "estimate", "request a quote" and "coverage not in force until confirmed in writing". Have counsel review any "Protection Score" or "you're protected" gamification, and the plan recommendations, as potential advice or representation.

**Confirm with counsel and the agency's E&O carrier:**
1. Licensed states: check #668, privacy, rebating and advertising rules for each (some require license numbers on websites).
2. E&O coverage for the portal, and any wording, disclaimer or "score" requirements.
3. Written security program, vendor contracts and DPAs (Supabase, Lovable, data vendors), incident response and notification timelines.
4. Privacy notice delivery, retention, and state consumer-privacy law (GLBA exemptions differ by state).
5. Reward and referral design, plus sweepstakes law.
6. Minors: a family "game" may attract children (age gating, COPPA).
7. Whether recommendation logic or AI features fall under the NAIC AI model bulletin or state AI rules. ⚠️ verify.
8. Binding authority per carrier and the exact quote-request flow.

Sources: [NAIC #668 adoption map](https://content.naic.org/sites/default/files/legal-adoption-map-668-idsm.pdf) · [Faegre Drinker on #668](https://www.faegredrinker.com/en/insights/publications/2021/8/naic-insurance-data-security-model-law-mdl668-update) · [Ohio and notice timing (Carlton Fields)](https://carltonfields.com/insights/publications/2018/ohio-moves-on-insurance-cybersecurity) · [Kentucky 21st state](https://www.repairerdrivennews.com/2022/05/02/kentucky-21st-state-to-adopt-insurance-carrier-consumer-data-protection-law/) · [BCLP on GLBA](https://www.bclplaw.com/en-US/events-insights-news/key-concepts-in-privacy-law-for-insurance-carriers-part-1-glba.html) · [NAIC GLBA changes](https://www.mmmlaw.com/media/naic-adopts-changes-to-glba-privacy-notice-standards) · [Clyde & Co on Model 880](https://www.clydeco.com/en/insights/2020/12/naic-adopts-amendments-to-the-unfair-trade-practic) · [Carlton Fields on rebating](https://www.carltonfields.com/insights/expect-focus/2021/the-gift-of-giving-states-move-amend-anti-rebating) · [PIA on referrals](https://blog.pia.org/?p=7133) · [NY DFS opinion](https://www.dfs.ny.gov/insurance/ogco2005/rg050416.htm) · [NY $25 gift limit](https://amp.insurancejournal.com/news/east/2012/08/09/258874.htm) · [Binding authority](https://www.quotesweep.com/glossary/binding-authority-insurance) · [Insurance Journal on E&O](https://www.insurancejournal.com/magazines/mag-features/2005/02/21/52283.htm)
