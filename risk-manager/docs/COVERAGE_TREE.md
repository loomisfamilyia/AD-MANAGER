# Coverage tree for Loomis staff

_This file is generated. Do not edit it by hand._

## How to review this

This is everything a client can add in the Personal Risk Manager and every coverage that can protect it. Please read it with an agent's eye and check three things:

1. **Which lines we write.** Each line below has a checkbox. `- [x] We write this` means the app will offer a real quote request. `- [ ] We write this` means the app will say "Ask Loomis about this" instead. Our first guess is in the file, so please correct it.
2. **Is each coverage accurate and fair?** Check the plain-English text. It is written for a 6th-grade reading level, never promises coverage, and says "Rules vary by state" where the rules differ. Suggest better words if something is off.
3. **Are we asking the right questions?** The last section lists every question a client sees, in order. We deliberately do not ask about health, tobacco, Social Security numbers, license numbers or bank details. Agents collect those while quoting.

To make a change, edit the source files and run the script again:

- Lines and the "We write this" setting: `risk-manager/src/catalog/lines.ts`
- Coverages and their wording: `risk-manager/src/catalog/coverages.ts`
- Things clients can add and their questions: `risk-manager/src/catalog/kinds.ts`
- Life events: `risk-manager/src/catalog/lifeEvents.ts`
- Re-run: `cd risk-manager && npm run catalog:check`

The script checks the catalog for mistakes first and stops with a list if it finds any.

**At a glance:** 26 lines, 142 coverages, 52 kinds of things, 20 life events. We write 14 of the 26 lines today.

**Tiers:** Essential means commonly required by law or a lender, or protects against a loss most families could not absorb. Recommended means most households in this situation carry it. Extra means nice to have.

---

# Part 1. Coverages, by line

## 🚗 Auto (`auto`)

- [x] We write this

_Helps with the cost of crashes, repairs and injuries when you drive your car or truck._

### Injury to others

- **Id:** `auto_liability_bi`
- **Tier:** Essential
- **What the client reads:** Can help pay other people's medical bills if you cause a crash. The two numbers are the most per person, then per crash. Rules vary by state.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $25,000 / $50,000; $50,000 / $100,000; $100,000 / $300,000; $250,000 / $500,000; $500,000 / $500,000

### Damage to others' property

- **Id:** `auto_liability_pd`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix other people's cars, fences or buildings if you cause a crash.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $25,000; $50,000; $100,000; $250,000

### Uninsured driver (UM/UIM)

- **Id:** `auto_um_bi`
- **Tier:** Recommended
- **What the client reads:** Can help pay your medical bills if the other driver has no insurance, or not enough. Rules vary by state.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $25,000 / $50,000; $50,000 / $100,000; $100,000 / $300,000; $250,000 / $500,000; $500,000 / $500,000

### Medical payments

- **Id:** `auto_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay medical bills for you and your passengers after a crash, no matter who caused it.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $1,000; $2,000; $5,000; $10,000

### Personal injury protection

- **Id:** `auto_pip`
- **Tier:** Recommended
- **What the client reads:** Can help pay medical bills and some lost pay for you and your passengers, no matter who caused the crash. Some states require it. Rules vary by state.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $2,500; $5,000; $10,000; $50,000

### Collision

- **Id:** `auto_collision`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix your car after a crash or if you hit something. Lenders usually ask for this if you have a car loan.
- **Protects:** 🚗 Car, truck or SUV
- **Deductible choices:** $250; $500; $1,000; $2,000

### Comprehensive

- **Id:** `auto_comprehensive`
- **Tier:** Essential
- **What the client reads:** Can help pay if your car is stolen or damaged by things like hail, fire, floods or hitting a deer.
- **Protects:** 🚗 Car, truck or SUV
- **Deductible choices:** $100; $250; $500; $1,000

### Glass repair

- **Id:** `auto_glass`
- **Tier:** Extra
- **What the client reads:** Can help pay to fix or replace a cracked windshield or window, often with a low or no deductible. Rules vary by state.
- **Protects:** 🚗 Car, truck or SUV
- **Needs first:** Comprehensive

### Rental car

- **Id:** `auto_rental`
- **Tier:** Recommended
- **What the client reads:** Can help pay for a rental car while yours is being fixed after a claim.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $30 a day; $40 a day; $50 a day; $75 a day

### Roadside help & towing

- **Id:** `auto_roadside`
- **Tier:** Extra
- **What the client reads:** Can help pay for a tow, a jump start, a flat tire or a lockout.
- **Protects:** 🚗 Car, truck or SUV

### Loan or lease gap

- **Id:** `auto_gap`
- **Tier:** Recommended
- **What the client reads:** Can help pay what you still owe on your loan or lease if your car is totaled and was worth less than that.
- **Protects:** 🚗 Car, truck or SUV
- **Needs first:** Collision and Comprehensive

### New car replacement

- **Id:** `auto_new_car`
- **Tier:** Extra
- **What the client reads:** If a new car is totaled, can help pay for a brand-new one instead of what it was worth that day. Usually for cars a year or two old at most.
- **Protects:** 🚗 Car, truck or SUV
- **Needs first:** Collision and Comprehensive

### Custom parts & equipment

- **Id:** `auto_custom_equipment`
- **Tier:** Extra
- **What the client reads:** Can help pay for add-ons you put on after you bought it, like a lift kit, special wheels or a big stereo.
- **Protects:** 🚗 Car, truck or SUV
- **Limit choices:** $2,500; $5,000; $10,000; $25,000

### Rideshare & delivery

- **Id:** `auto_rideshare`
- **Tier:** Recommended
- **What the client reads:** Can help fill the gap when you drive for Uber, Lyft or DoorDash. Personal car policies often work differently while you are working.
- **Protects:** 🚗 Car, truck or SUV

### Trailer damage

- **Id:** `auto_trailer_damage`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix or replace a utility trailer if it is damaged or stolen.
- **Protects:** 🚛 Utility trailer
- **Deductible choices:** $250; $500; $1,000

## 🏡 Home (`home`)

- [x] We write this

_Helps with the cost of fixing your house and replacing your things after damage or theft._

### Your house

- **Id:** `home_dwelling`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix or rebuild your house after things like fire or wind. A mortgage lender usually asks for this.
- **Protects:** 🏡 House I own, 🏖️ Vacation home
- **Deductible choices:** $500; $1,000; $2,500; $5,000; 1% of home coverage; 2% of home coverage

### Garage, shed & fence

- **Id:** `home_other_structures`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix buildings and fences that are not attached to your house.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🏗️ Garage, shed or fence
- **Limit choices:** 10% of home coverage; 20% of home coverage; 30% of home coverage

### Your belongings

- **Id:** `home_personal_property`
- **Tier:** Essential
- **What the client reads:** Can help pay to replace your things, like furniture, clothes and TVs, if they are stolen or damaged.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 📦 Item in my home
- **Limit choices:** 50% of home coverage; 60% of home coverage; 70% of home coverage; 100% of home coverage

### Belongings at new cost

- **Id:** `home_contents_replacement`
- **Tier:** Recommended
- **What the client reads:** Can help pay what a new item costs to buy, not what your old one is worth today.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 📦 Item in my home
- **Needs first:** Your belongings

### Extra living costs

- **Id:** `home_loss_of_use`
- **Tier:** Recommended
- **What the client reads:** Can help pay for a hotel and meals if you cannot live at home while it is being fixed.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home
- **Limit choices:** 20% of home coverage; 30% of home coverage; 40% of home coverage

### Personal liability

- **Id:** `home_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if someone is hurt at your home, or you accidentally damage their things, and they ask you to pay.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home
- **Limit choices:** $100,000; $300,000; $500,000

### Guest medical payments

- **Id:** `home_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay a guest's small medical bills if they are hurt at your home, no matter who is at fault.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home
- **Limit choices:** $1,000; $2,000; $5,000

### Extended replacement cost

- **Id:** `home_extended_replacement`
- **Tier:** Recommended
- **What the client reads:** Can help pay more than your limit if building costs jump after a big storm. Some companies offer to pay the full rebuild cost.
- **Protects:** 🏡 House I own, 🏖️ Vacation home
- **Limit choices:** 25% extra; 50% extra; Full rebuild cost (if offered)
- **Needs first:** Your house

### Code upgrade costs

- **Id:** `home_ordinance_law`
- **Tier:** Recommended
- **What the client reads:** Can help pay extra when building rules make you upgrade things, like wiring or stairs, while your home is repaired.
- **Protects:** 🏡 House I own, 🏖️ Vacation home
- **Limit choices:** 10% of home coverage; 25% of home coverage; 50% of home coverage
- **Needs first:** Your house

### Roof at new-roof cost

- **Id:** `home_roof_replacement_cost`
- **Tier:** Recommended
- **What the client reads:** Some policies pay less for an older roof because they take off money for its age. This can help pay for a whole new roof instead.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, ☂️ Roof

### Wind & hail deductible

- **Id:** `home_wind_hail_deductible`
- **Tier:** Recommended
- **What the client reads:** Many homes have a separate, higher deductible for wind and hail, often a percent of your home's coverage. Ask Loomis about your options.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, ☂️ Roof
- **Deductible choices:** $1,000; $2,500; 1% of home coverage; 2% of home coverage; 5% of home coverage

### Water backup & sump overflow

- **Id:** `home_water_backup`
- **Tier:** Recommended
- **What the client reads:** Can help pay when a sewer, drain or sump pump backs up and water comes into your home.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 💧 Sump pump
- **Limit choices:** $5,000; $10,000; $25,000

### Buried utility lines

- **Id:** `home_service_line`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix underground water, sewer, gas or power lines that serve your home.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, ⛲ Well or septic
- **Limit choices:** $10,000; $25,000

### Equipment breakdown

- **Id:** `home_equipment_breakdown`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix or replace systems like a furnace, AC or water heater when they suddenly break down.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🔥 Furnace or boiler, 🌬️ Air conditioner, 🚿 Water heater, ⚡ Electrical panel, 💧 Sump pump, ⛲ Well or septic, ☀️ Solar panels, 🔋 Generator

### Solar panels

- **Id:** `home_solar_panels`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix or replace solar panels you own. If you lease them, check who is in charge of the insurance.
- **Protects:** ☀️ Solar panels

### Airbnb & VRBO hosting

- **Id:** `home_sharing`
- **Tier:** Recommended
- **What the client reads:** Can help pay when you rent your home or a room to guests. Regular home policies often limit this, so ask Loomis.
- **Protects:** 🏡 House I own, 🏖️ Vacation home

### Home business add-on

- **Id:** `home_business`
- **Tier:** Recommended
- **What the client reads:** Can help pay for business gear at home and for visitors who come for work. Regular home policies often have small limits for this.
- **Protects:** 🏡 House I own, 🏘️ Mobile home

### Mobile home & attachments

- **Id:** `mobile_home_dwelling`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix or replace your mobile home and things attached to it, like steps, skirting and decks.
- **Protects:** 🏘️ Mobile home
- **Deductible choices:** $500; $1,000; $2,500

## 🛋️ Renters (`renters`)

- [x] We write this

_Helps with the cost of replacing your things when you rent, and if someone is hurt at your place._

### Your belongings

- **Id:** `renters_belongings`
- **Tier:** Essential
- **What the client reads:** Can help pay to replace your things, like furniture, clothes and a laptop, if they are stolen or damaged. Your landlord's policy is usually for the building only.
- **Protects:** 🏠 Place I rent, 🎓 Student housing, 📦 Item in my home
- **Limit choices:** $10,000; $25,000; $50,000

### Belongings at new cost

- **Id:** `renters_replacement_cost`
- **Tier:** Recommended
- **What the client reads:** Can help pay what a new item costs to buy, not what your old one is worth today.
- **Protects:** 🏠 Place I rent, 🎓 Student housing, 📦 Item in my home
- **Needs first:** Your belongings

### Personal liability

- **Id:** `renters_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if someone is hurt in your place, or you accidentally damage the building or their things.
- **Protects:** 🏠 Place I rent, 🎓 Student housing
- **Limit choices:** $100,000; $300,000; $500,000

### Extra living costs

- **Id:** `renters_loss_of_use`
- **Tier:** Recommended
- **What the client reads:** Can help pay for a hotel and meals if you cannot live in your place while it is being fixed.
- **Protects:** 🏠 Place I rent, 🎓 Student housing

### Guest medical payments

- **Id:** `renters_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay a guest's small medical bills if they are hurt at your place, no matter who is at fault.
- **Protects:** 🏠 Place I rent, 🎓 Student housing
- **Limit choices:** $1,000; $2,000; $5,000

## 🏢 Condo (`condo`)

- [x] We write this

_Helps with the cost of fixing the inside of your condo and replacing your things._

### Inside your unit

- **Id:** `condo_walls_in`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix what is inside your walls, like floors, cabinets and fixtures.
- **Protects:** 🏢 Condo I own
- **Deductible choices:** $500; $1,000; $2,500

### Upgrades you made

- **Id:** `condo_upgrades`
- **Tier:** Recommended
- **What the client reads:** Can help pay for upgrades you added, like new counters or floors, if your condo group's policy leaves them out.
- **Protects:** 🏢 Condo I own
- **Needs first:** Inside your unit

### Your belongings

- **Id:** `condo_belongings`
- **Tier:** Essential
- **What the client reads:** Can help pay to replace your things, like furniture, clothes and TVs, if they are stolen or damaged.
- **Protects:** 🏢 Condo I own, 📦 Item in my home
- **Limit choices:** $25,000; $50,000; $75,000; $100,000

### Belongings at new cost

- **Id:** `condo_contents_replacement`
- **Tier:** Recommended
- **What the client reads:** Can help pay what a new item costs to buy, not what your old one is worth today.
- **Protects:** 🏢 Condo I own, 📦 Item in my home
- **Needs first:** Your belongings

### Extra living costs

- **Id:** `condo_loss_of_use`
- **Tier:** Recommended
- **What the client reads:** Can help pay for a hotel and meals if you cannot live in your condo while it is being fixed.
- **Protects:** 🏢 Condo I own

### Personal liability

- **Id:** `condo_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if someone is hurt in your condo, or you accidentally damage their things, and they ask you to pay.
- **Protects:** 🏢 Condo I own
- **Limit choices:** $100,000; $300,000; $500,000

### Guest medical payments

- **Id:** `condo_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay a guest's small medical bills if they are hurt in your condo, no matter who is at fault.
- **Protects:** 🏢 Condo I own
- **Limit choices:** $1,000; $2,000; $5,000

### Condo group charges

- **Id:** `condo_loss_assessment`
- **Tier:** Recommended
- **What the client reads:** Can help pay your share if your condo group bills owners for a big repair or a lawsuit.
- **Protects:** 🏢 Condo I own
- **Limit choices:** $10,000; $25,000; $50,000

## 🔑 Rental property (`landlord`)

- [x] We write this

_Helps with the cost of fixing a home you rent out, and the rent you might miss._

### Rental building

- **Id:** `landlord_dwelling`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix or rebuild a home you rent out after things like fire or wind.
- **Protects:** 🔑 Home I rent out
- **Deductible choices:** $500; $1,000; $2,500; $5,000

### Garage, shed & fence

- **Id:** `landlord_other_structures`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix buildings and fences at your rental that are not attached to the main building.
- **Protects:** 🔑 Home I rent out, 🏗️ Garage, shed or fence

### Your stuff in the rental

- **Id:** `landlord_contents`
- **Tier:** Recommended
- **What the client reads:** Can help pay for things you own and provide, like appliances and furniture. Your renters' own things are theirs to insure.
- **Protects:** 🔑 Home I rent out, 📦 Item in my home

### Lost rent

- **Id:** `landlord_lost_rent`
- **Tier:** Recommended
- **What the client reads:** Can help replace the rent you would miss if a fire or storm makes your rental unlivable.
- **Protects:** 🔑 Home I rent out

### Landlord liability

- **Id:** `landlord_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if someone is hurt at your rental, or their things are damaged, and they ask you to pay.
- **Protects:** 🔑 Home I rent out
- **Limit choices:** $100,000; $300,000; $500,000

### Guest medical payments

- **Id:** `landlord_med_pay`
- **Tier:** Extra
- **What the client reads:** Can help pay a guest's small medical bills if they are hurt at your rental, no matter who is at fault.
- **Protects:** 🔑 Home I rent out
- **Limit choices:** $1,000; $2,000; $5,000

### Short-term rental hosting

- **Id:** `landlord_short_term`
- **Tier:** Recommended
- **What the client reads:** Can help pay when you rent by the night on sites like Airbnb or VRBO. Long-term rental policies often work differently.
- **Protects:** 🔑 Home I rent out

## 🌊 Flood (`flood`)

- [x] We write this

_Helps with the cost of fixing your home and replacing your things after flood water._

### Flood: your home

- **Id:** `flood_building`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix your home after flood water. Home policies usually do not include flood, and there is often a 30-day wait before it starts, so it helps to ask early.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🏢 Condo I own, 🔑 Home I rent out
- **Limit choices:** $100,000; $150,000; $250,000
- **Deductible choices:** $1,000; $2,000; $5,000; $10,000

### Flood: your belongings

- **Id:** `flood_contents`
- **Tier:** Recommended
- **What the client reads:** Can help pay to replace your things after flood water. Renters can add this too.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🏢 Condo I own, 🏠 Place I rent, 🔑 Home I rent out
- **Limit choices:** $25,000; $50,000; $100,000
- **Deductible choices:** $1,000; $2,000; $5,000

### Extra flood limit

- **Id:** `flood_excess`
- **Tier:** Extra
- **What the client reads:** Can help pay more when your home would cost more to fix than the usual $250,000 flood limit.
- **Protects:** 🏡 House I own, 🏖️ Vacation home
- **Limit choices:** $100,000 extra; $250,000 extra; $500,000 extra

## 🌎 Earthquake (`earthquake`)

- [ ] We write this

_Helps with the cost of fixing your home and replacing your things after an earthquake._

### Earthquake: your home

- **Id:** `eq_dwelling`
- **Tier:** Extra
- **What the client reads:** Can help pay to fix your home after an earthquake. Home policies usually do not include this.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🏢 Condo I own, 🔑 Home I rent out
- **Deductible choices:** 5% of home coverage; 10% of home coverage; 15% of home coverage; 20% of home coverage

### Earthquake: belongings

- **Id:** `eq_contents`
- **Tier:** Extra
- **What the client reads:** Can help pay to replace your things after an earthquake. Renters can add this too.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🏢 Condo I own, 🏠 Place I rent, 🔑 Home I rent out

### Earthquake: living costs

- **Id:** `eq_loss_of_use`
- **Tier:** Extra
- **What the client reads:** Can help pay for a hotel and meals if an earthquake keeps you out of your home.
- **Protects:** 🏡 House I own, 🏖️ Vacation home, 🏘️ Mobile home, 🏢 Condo I own

## ☂️ Umbrella (`umbrella`)

- [x] We write this

_Adds a big extra layer of protection on top of your car and home policies._

### Personal umbrella

- **Id:** `umbrella_personal`
- **Tier:** Recommended
- **What the client reads:** Adds extra liability on top of your car and home policies. It can help pay when a big claim goes past their limits.
- **Protects:** The whole household
- **Limit choices:** $1,000,000; $2,000,000; $3,000,000; $4,000,000; $5,000,000

### Umbrella: uninsured driver

- **Id:** `umbrella_uninsured`
- **Tier:** Extra
- **What the client reads:** Adds extra help with your injuries if a driver with little or no insurance hurts you. Not offered everywhere.
- **Protects:** The whole household
- **Needs first:** Personal umbrella

## 💎 Valuables (`valuables`)

- [x] We write this

_Lists special things like jewelry and art by name, so they count at their full value._

### Jewelry, listed by name

- **Id:** `val_jewelry`
- **Tier:** Recommended
- **What the client reads:** Lists each piece by name, so it counts at its full value. It can often help pay even if a piece is lost, often with no deductible. Ask Loomis.
- **Protects:** 💍 Jewelry
- **Deductible choices:** $0; $100; $250; $500

### Watches, listed by name

- **Id:** `val_watch`
- **Tier:** Recommended
- **What the client reads:** Lists each watch by name, so it counts at its full value. It can often help pay even if a watch is lost, often with no deductible. Ask Loomis.
- **Protects:** ⌚ Watch
- **Deductible choices:** $0; $100; $250; $500

### Art, listed by name

- **Id:** `val_art`
- **Tier:** Recommended
- **What the client reads:** Lists each piece of art by name, so it counts at its full value. It can often help pay for damage, even from an accident at home. Ask Loomis.
- **Protects:** 🎨 Art
- **Deductible choices:** $0; $100; $250; $500

### Collectibles, listed by name

- **Id:** `val_collectibles`
- **Tier:** Recommended
- **What the client reads:** Lists coins, stamps, cards or memorabilia so they count at their full value. It can often help pay even if one goes missing. Ask Loomis.
- **Protects:** 🏺 Collection
- **Deductible choices:** $0; $100; $250; $500

### Firearms, listed by name

- **Id:** `val_firearms`
- **Tier:** Recommended
- **What the client reads:** Lists each firearm by name, so it counts at its full value. It can often help pay if one is stolen or lost. Ask Loomis.
- **Protects:** 🎯 Firearm
- **Deductible choices:** $0; $100; $250; $500

### Instruments, listed by name

- **Id:** `val_instruments`
- **Tier:** Recommended
- **What the client reads:** Lists each instrument by name, so it counts at its full value, even when you take it out of the house. It can often help pay if it is lost. Ask Loomis.
- **Protects:** 🎸 Musical instrument
- **Deductible choices:** $0; $100; $250; $500

### Camera gear, listed by name

- **Id:** `val_cameras`
- **Tier:** Recommended
- **What the client reads:** Lists your camera and lenses by name, so they count at their full value, even on trips. It can often help pay if something is lost. Ask Loomis.
- **Protects:** 📷 Camera gear
- **Deductible choices:** $0; $100; $250; $500

### Sports gear, listed by name

- **Id:** `val_sports`
- **Tier:** Extra
- **What the client reads:** Lists things like golf clubs or skis by name, so they count at their full value. It can often help pay if they are lost or stolen. Ask Loomis.
- **Protects:** 🏅 Sports gear
- **Deductible choices:** $0; $100; $250; $500

### Silverware, listed by name

- **Id:** `val_silverware`
- **Tier:** Extra
- **What the client reads:** Lists your silver by name, so it counts at its full value. It can often help pay if it is lost, stolen or damaged. Ask Loomis.
- **Protects:** 🍴 Silverware
- **Deductible choices:** $0; $100; $250; $500

### Bicycles, listed by name

- **Id:** `val_bicycle`
- **Tier:** Recommended
- **What the client reads:** Lists your bike by name, so it counts at its full value. It can often help pay if it is stolen, even away from home. Ask Loomis.
- **Protects:** 🚴 High-end bicycle
- **Deductible choices:** $0; $100; $250; $500

### E-bike or scooter

- **Id:** `val_ebike`
- **Tier:** Recommended
- **What the client reads:** Home and car policies often limit e-bikes and scooters. This can help pay if yours is stolen or damaged. Ask Loomis about the right fit.
- **Protects:** 🛴 E-bike or scooter
- **Deductible choices:** $0; $100; $250; $500

### Drone coverage

- **Id:** `val_drone`
- **Tier:** Recommended
- **What the client reads:** Home policies often limit drones. This can help pay if your drone is lost, stolen or crashes. Ask Loomis about the right fit.
- **Protects:** 🚁 Drone
- **Deductible choices:** $0; $100; $250; $500

## 🏍️ Motorcycle (`motorcycle`)

- [x] We write this

_Helps with the cost of crashes and repairs on your motorcycle._

### Motorcycle liability

- **Id:** `moto_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay for other people's injuries and property damage if you cause a crash. Rules vary by state.
- **Protects:** 🏍️ Motorcycle
- **Limit choices:** $25,000 / $50,000 / $25,000; $50,000 / $100,000 / $50,000; $100,000 / $300,000 / $100,000; $250,000 / $500,000 / $100,000

### Motorcycle collision

- **Id:** `moto_collision`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix your bike after a crash or if you hit something.
- **Protects:** 🏍️ Motorcycle
- **Deductible choices:** $250; $500; $1,000; $2,000

### Theft & other damage

- **Id:** `moto_comprehensive`
- **Tier:** Essential
- **What the client reads:** Can help pay if your bike is stolen or damaged by things like fire, vandalism or a storm.
- **Protects:** 🏍️ Motorcycle
- **Deductible choices:** $100; $250; $500; $1,000

### Uninsured driver

- **Id:** `moto_uninsured`
- **Tier:** Recommended
- **What the client reads:** Can help pay your medical bills if the other driver has no insurance, or not enough.
- **Protects:** 🏍️ Motorcycle

### Medical payments

- **Id:** `moto_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay medical bills for you and a passenger after a crash, no matter who caused it.
- **Protects:** 🏍️ Motorcycle
- **Limit choices:** $1,000; $2,000; $5,000; $10,000

### Custom parts & accessories

- **Id:** `moto_accessories`
- **Tier:** Recommended
- **What the client reads:** Can help pay for add-ons like custom seats, saddlebags, chrome and sound systems.
- **Protects:** 🏍️ Motorcycle
- **Limit choices:** $1,000; $2,500; $5,000; $10,000

### Helmet & riding gear

- **Id:** `moto_gear`
- **Tier:** Extra
- **What the client reads:** Can help pay to replace your helmet, jacket and other riding gear after a crash or theft.
- **Protects:** 🏍️ Motorcycle

### Roadside help

- **Id:** `moto_roadside`
- **Tier:** Extra
- **What the client reads:** Can help pay for a tow, a flat tire or a dead battery.
- **Protects:** 🏍️ Motorcycle

## 🏞️ ATVs, carts & more (`recreational`)

- [x] We write this

_Helps with the cost of repairs and injuries from ATVs, snowmobiles, golf carts and dirt bikes._

### Liability

- **Id:** `rec_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if you hurt someone or damage their property while riding. Home and car policies often leave this out.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, ⛳ Golf cart, 🏁 Dirt bike
- **Limit choices:** $100,000; $300,000; $500,000; $1,000,000

### Crash damage

- **Id:** `rec_collision`
- **Tier:** Recommended
- **What the client reads:** Can help pay to fix your ride after a crash, a rollover or if you hit something.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, ⛳ Golf cart, 🏁 Dirt bike
- **Deductible choices:** $250; $500; $1,000

### Theft & other damage

- **Id:** `rec_comprehensive`
- **Tier:** Recommended
- **What the client reads:** Can help pay if your ride is stolen or damaged by fire, a storm or vandalism.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, ⛳ Golf cart, 🏁 Dirt bike
- **Deductible choices:** $100; $250; $500; $1,000

### Medical payments

- **Id:** `rec_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay medical bills for you and your riders after an accident.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, ⛳ Golf cart, 🏁 Dirt bike
- **Limit choices:** $1,000; $2,000; $5,000; $10,000

### Guest passenger liability

- **Id:** `rec_guest_passenger`
- **Tier:** Recommended
- **What the client reads:** Can help pay if a friend riding along with you gets hurt.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, ⛳ Golf cart

### Accessories & add-ons

- **Id:** `rec_accessories`
- **Tier:** Extra
- **What the client reads:** Can help pay for extras like a winch, plow, cab, lights or a cover.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, ⛳ Golf cart, 🏁 Dirt bike
- **Limit choices:** $1,000; $2,500; $5,000

### Towing & trail recovery

- **Id:** `rec_roadside`
- **Tier:** Extra
- **What the client reads:** Can help pay to tow you or pull you out if you break down or get stuck.
- **Protects:** 🏞️ ATV or side-by-side, 🛷 Snowmobile, 🏁 Dirt bike

### E-bike liability

- **Id:** `rec_ebike_liability`
- **Tier:** Recommended
- **What the client reads:** Can help pay if you hurt someone or damage their things while riding your e-bike or scooter. Home policies often limit this.
- **Protects:** 🛴 E-bike or scooter

### Drone liability

- **Id:** `rec_drone_liability`
- **Tier:** Recommended
- **What the client reads:** Can help pay if your drone hurts someone or damages their property. Home policies often limit this.
- **Protects:** 🚁 Drone

## ⛵ Boats & jet skis (`watercraft`)

- [x] We write this

_Helps with the cost of fixing your boat or jet ski, and if someone is hurt on the water._

### Boat or jet ski damage

- **Id:** `water_hull`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix or replace your boat or jet ski, its motor and trailer after damage or theft.
- **Protects:** ⛵ Boat, 🌊 Jet ski
- **Deductible choices:** $250; $500; $1,000; 1% of its value

### Boating liability

- **Id:** `water_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if someone is hurt, or their property is damaged, because of your boat or jet ski.
- **Protects:** ⛵ Boat, 🌊 Jet ski
- **Limit choices:** $100,000; $300,000; $500,000; $1,000,000

### Boating medical payments

- **Id:** `water_med_pay`
- **Tier:** Recommended
- **What the client reads:** Can help pay medical bills for you and your passengers if someone is hurt on board.
- **Protects:** ⛵ Boat, 🌊 Jet ski
- **Limit choices:** $1,000; $5,000; $10,000

### On-water towing

- **Id:** `water_towing`
- **Tier:** Recommended
- **What the client reads:** Can help pay to tow your boat or jet ski if it breaks down or runs out of fuel on the water.
- **Protects:** ⛵ Boat, 🌊 Jet ski

### Fuel spill cleanup

- **Id:** `water_fuel_spill`
- **Tier:** Extra
- **What the client reads:** Can help pay to clean up if fuel spills from your boat into the water.
- **Protects:** ⛵ Boat, 🌊 Jet ski

### Wreck removal

- **Id:** `water_wreck_removal`
- **Tier:** Extra
- **What the client reads:** Can help pay to raise or remove your boat if it sinks.
- **Protects:** ⛵ Boat, 🌊 Jet ski

### Uninsured boater

- **Id:** `water_uninsured`
- **Tier:** Extra
- **What the client reads:** Can help pay your medical bills if another boater hurts you and has no insurance.
- **Protects:** ⛵ Boat, 🌊 Jet ski

### Gear & personal items

- **Id:** `water_effects`
- **Tier:** Extra
- **What the client reads:** Can help pay for things on board, like fishing gear, skis, life jackets and electronics.
- **Protects:** ⛵ Boat
- **Limit choices:** $1,000; $2,500; $5,000

## 🚐 RVs & campers (`rv`)

- [x] We write this

_Helps with the cost of repairs and trip trouble for your motorhome or camper._

### RV damage

- **Id:** `rv_physical_damage`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix or replace your motorhome or camper after a crash, fire, storm or theft.
- **Protects:** 🚐 Motorhome, 🏕️ Camper or trailer
- **Deductible choices:** $500; $1,000; $2,500

### Motorhome liability

- **Id:** `rv_liability`
- **Tier:** Essential
- **What the client reads:** Can help pay if you cause a crash and other people are hurt or their things are damaged.
- **Protects:** 🚐 Motorhome
- **Limit choices:** $100,000; $300,000; $500,000; $1,000,000

### Campsite liability

- **Id:** `rv_vacation_liability`
- **Tier:** Recommended
- **What the client reads:** Can help pay if someone is hurt or something is damaged while your RV is parked at a campsite.
- **Protects:** 🚐 Motorhome, 🏕️ Camper or trailer
- **Limit choices:** $100,000; $300,000; $500,000

### Belongings inside

- **Id:** `rv_contents`
- **Tier:** Recommended
- **What the client reads:** Can help pay for your things inside the RV, like clothes, dishes and camping gear.
- **Protects:** 🚐 Motorhome, 🏕️ Camper or trailer
- **Limit choices:** $1,000; $5,000; $10,000

### Full-time RV living

- **Id:** `rv_full_timer`
- **Tier:** Recommended
- **What the client reads:** If you live in your RV most of the year, a policy that works more like a home policy may fit better.
- **Protects:** 🚐 Motorhome, 🏕️ Camper or trailer

### Trip help if you break down

- **Id:** `rv_emergency_expense`
- **Tier:** Extra
- **What the client reads:** Can help pay for a hotel, meals and travel home if your RV is damaged far from home.
- **Protects:** 🚐 Motorhome, 🏕️ Camper or trailer

### Awnings & built-in extras

- **Id:** `rv_accessories`
- **Tier:** Extra
- **What the client reads:** Can help pay for things attached to your RV, like an awning, satellite dish, solar panels or custom paint.
- **Protects:** 🚐 Motorhome, 🏕️ Camper or trailer

## 🚘 Classic cars (`collector_vehicle`)

- [x] We write this

_Helps look after a classic or collector car at a value you agree on up front._

### Classic car damage

- **Id:** `collector_physical_damage`
- **Tier:** Essential
- **What the client reads:** Can help pay to fix or replace your classic car after a crash, fire, theft or storm.
- **Protects:** 🚘 Classic or collector car

### Agreed value

- **Id:** `collector_agreed_value`
- **Tier:** Essential
- **What the client reads:** You and the insurance company agree on your car's value up front. That means less guessing later.
- **Protects:** 🚘 Classic or collector car
- **Needs first:** Classic car damage

### Classic car liability

- **Id:** `collector_liability`
- **Tier:** Recommended
- **What the client reads:** Can help pay if you hurt someone or damage their property while driving your classic car. Some companies also want your everyday car insured.
- **Protects:** 🚘 Classic or collector car
- **Limit choices:** $100,000; $300,000; $500,000; $1,000,000

### Spare parts & tools

- **Id:** `collector_spare_parts`
- **Tier:** Extra
- **What the client reads:** Can help pay for extra parts, tools and your car cover if they are stolen or damaged.
- **Protects:** 🚘 Classic or collector car

### Flatbed towing

- **Id:** `collector_towing`
- **Tier:** Extra
- **What the client reads:** Can help pay to tow your classic car on a flatbed if it breaks down or is damaged in a crash.
- **Protects:** 🚘 Classic or collector car

## 🐾 Pet health (`pet`)

- [ ] We write this

_Helps with vet bills when your pet is hurt or sick._

### Accident & illness

- **Id:** `pet_accident_illness`
- **Tier:** Recommended
- **What the client reads:** Can help pay vet bills when your pet is hurt or gets sick. Not every company offers plans for every kind of pet, so ask Loomis.
- **Protects:** 🐶 Dog, 🐱 Cat, 🦜 Bird or exotic pet, 🐰 Other pet
- **Limit choices:** $5,000 a year; $10,000 a year; $15,000 a year; No yearly limit
- **Deductible choices:** $100; $250; $500; $1,000

### Accident only

- **Id:** `pet_accident_only`
- **Tier:** Extra
- **What the client reads:** A lower-cost plan that can help pay vet bills if your pet is hurt, like a broken leg. It does not help with sickness.
- **Protects:** 🐶 Dog, 🐱 Cat
- **Limit choices:** $5,000 a year; $10,000 a year

### Wellness add-on

- **Id:** `pet_wellness`
- **Tier:** Extra
- **What the client reads:** Can help pay for regular care, like shots, checkups and teeth cleaning.
- **Protects:** 🐶 Dog, 🐱 Cat

### Horse vet bills

- **Id:** `pet_equine_medical`
- **Tier:** Recommended
- **What the client reads:** Can help pay big vet bills for your horse, like emergency visits and surgery.
- **Protects:** 🐴 Horse

### Horse value protection

- **Id:** `pet_equine_mortality`
- **Tier:** Extra
- **What the client reads:** Can help pay you the value of your horse if it is lost to illness, an accident or theft.
- **Protects:** 🐴 Horse

## 🌳 Life (`life`)

- [x] We write this

_Helps the people who count on you with money if you pass away._

### Term life

- **Id:** `life_term`
- **Tier:** Essential
- **What the client reads:** Can help your family pay bills and keep their home if you pass away during the years you pick. Often the most affordable choice.
- **Protects:** 🙂 Person
- **Limit choices:** $100,000; $250,000; $500,000; $750,000; $1,000,000; $2,000,000

### Mortgage protection term

- **Id:** `life_mortgage_protection`
- **Tier:** Recommended
- **What the client reads:** A term policy that can help your family pay off the home loan if you pass away while it is still owed.
- **Protects:** 🙂 Person
- **Limit choices:** $100,000; $200,000; $300,000; $400,000; $500,000

### Whole life

- **Id:** `life_whole`
- **Tier:** Extra
- **What the client reads:** Lasts your whole life and builds cash value you can borrow from. It costs more than term.
- **Protects:** 🙂 Person
- **Limit choices:** $25,000; $50,000; $100,000; $250,000; $500,000

### Universal life

- **Id:** `life_universal`
- **Tier:** Extra
- **What the client reads:** Lasts your whole life, with payments you can adjust over time. Some types build cash value.
- **Protects:** 🙂 Person
- **Limit choices:** $100,000; $250,000; $500,000; $1,000,000

### Final expense

- **Id:** `life_final_expense`
- **Tier:** Recommended
- **What the client reads:** A small policy to help your family pay for funeral costs. Often simpler to apply for.
- **Protects:** 🙂 Person
- **Limit choices:** $5,000; $10,000; $15,000; $25,000

### Child life

- **Id:** `life_child`
- **Tier:** Extra
- **What the client reads:** A small policy on a child. Some include the right to buy more coverage later as they grow up.
- **Protects:** 🙂 Person
- **Limit choices:** $10,000; $25,000; $50,000

## 💵 Disability (`disability`)

- [ ] We write this

_Helps replace part of your paycheck if you can't work for a while._

### Short-term disability

- **Id:** `disability_short_term`
- **Tier:** Recommended
- **What the client reads:** Can help replace part of your paycheck for a few months if illness or an injury keeps you from working.
- **Protects:** 🙂 Person
- **Limit choices:** 50% of pay; 60% of pay; 70% of pay

### Long-term disability

- **Id:** `disability_long_term`
- **Tier:** Recommended
- **What the client reads:** Can help replace part of your paycheck for years if illness or an injury keeps you from working.
- **Protects:** 🙂 Person
- **Limit choices:** 50% of pay; 60% of pay; 66% of pay

## 🤝 Long-term care (`long_term_care`)

- [ ] We write this

_Helps with the cost of care at home or in a care center as you get older._

### Long-term care

- **Id:** `ltc_traditional`
- **Tier:** Recommended
- **What the client reads:** Can help pay for care with daily life, like home care, assisted living or a nursing home. It is for when you cannot do things on your own.
- **Protects:** 🙂 Person
- **Limit choices:** $3,000 a month; $4,500 a month; $6,000 a month; $8,000 a month

### Life + long-term care

- **Id:** `ltc_hybrid`
- **Tier:** Extra
- **What the client reads:** A life insurance policy with long-term care built in. If you never need care, your family can still receive a benefit.
- **Protects:** 🙂 Person

## ❤️ Health (`health`)

- [ ] We write this

_Helps with doctor and hospital bills._

### Individual health plan

- **Id:** `health_individual`
- **Tier:** Essential
- **What the client reads:** A health plan you buy on your own, such as through the ACA marketplace, when work does not offer one. You can usually sign up at open enrollment or after a life change.
- **Protects:** 🙂 Person

## 🏥 Medicare (`medicare`)

- [ ] We write this

_Helps with doctor, hospital and drug costs for people on Medicare._

### Medicare Supplement

- **Id:** `medicare_supplement`
- **Tier:** Recommended
- **What the client reads:** Can help pay costs that Original Medicare leaves, like copays and deductibles. Also called Medigap.
- **Protects:** 🙂 Person

### Medicare Advantage

- **Id:** `medicare_advantage`
- **Tier:** Recommended
- **What the client reads:** A Medicare plan from a private company. It often adds extras like dental and vision.
- **Protects:** 🙂 Person

### Medicare drug plan (Part D)

- **Id:** `medicare_part_d`
- **Tier:** Recommended
- **What the client reads:** Can help pay for your prescription drugs when you have Medicare.
- **Protects:** 🙂 Person

## ➕ Extra health plans (`supplemental_health`)

- [ ] We write this

_Can send extra cash when you are hurt, very sick or in the hospital._

### Accident cash plan

- **Id:** `supp_accident`
- **Tier:** Extra
- **What the client reads:** Can send you cash if you are hurt in an accident, to use however you need, like for copays or time off work.
- **Protects:** 🙂 Person

### Critical illness plan

- **Id:** `supp_critical_illness`
- **Tier:** Extra
- **What the client reads:** Can send you a lump of cash if you are diagnosed with a serious illness, to use however you need.
- **Protects:** 🙂 Person

### Hospital cash plan

- **Id:** `supp_hospital_cash`
- **Tier:** Extra
- **What the client reads:** Can send you cash for each day you are in the hospital, to use however you need.
- **Protects:** 🙂 Person

## 😁 Dental & vision (`dental_vision`)

- [ ] We write this

_Helps with dentist visits, eye exams and glasses._

### Dental plan

- **Id:** `dental_plan`
- **Tier:** Extra
- **What the client reads:** Can help pay for checkups, cleanings and fillings.
- **Protects:** 🙂 Person

### Vision plan

- **Id:** `vision_plan`
- **Tier:** Extra
- **What the client reads:** Can help pay for eye exams, glasses and contacts.
- **Protects:** 🙂 Person

## ✈️ Travel (`travel`)

- [ ] We write this

_Helps with trip costs and doctor bills when plans change or you are far from home._

### Trip cancellation

- **Id:** `travel_cancellation`
- **Tier:** Extra
- **What the client reads:** Can help pay back trip costs if you have to cancel or cut a trip short for a listed reason, like illness.
- **Protects:** The whole household

### Travel medical & rescue

- **Id:** `travel_medical`
- **Tier:** Recommended
- **What the client reads:** Can help pay for a doctor or hospital while you are away, and for getting you home if needed. Your health plan may not work in other countries.
- **Protects:** The whole household

### Lost bags & delays

- **Id:** `travel_baggage`
- **Tier:** Extra
- **What the client reads:** Can help pay if your bags are lost, stolen or late, or if your trip is delayed.
- **Protects:** The whole household

## 🔐 Identity & cyber (`identity_theft`)

- [ ] We write this

_Helps you sort things out if someone steals your identity or hacks your accounts._

### Identity theft help

- **Id:** `identity_restoration`
- **Tier:** Recommended
- **What the client reads:** Can help pay for the time and costs to fix your records and accounts if someone uses your identity.
- **Protects:** The whole household
- **Limit choices:** $15,000; $25,000; $50,000

### Online & cyber protection

- **Id:** `cyber_personal`
- **Tier:** Extra
- **What the client reads:** Can help with problems online, like hacked accounts, online scams and cyberbullying.
- **Protects:** The whole household

## 🎉 Weddings & events (`event`)

- [ ] We write this

_Helps with a wedding or party if plans change or a guest is hurt._

### Event liability

- **Id:** `event_liability`
- **Tier:** Recommended
- **What the client reads:** Can help pay if a guest is hurt, or something is damaged, at your wedding or party. Venues often ask for this.
- **Protects:** The whole household
- **Limit choices:** $1,000,000; $2,000,000

### Event cancellation

- **Id:** `event_cancellation`
- **Tier:** Recommended
- **What the client reads:** Can help pay back deposits and costs if you have to cancel or move a wedding or event for a listed reason.
- **Protects:** The whole household

## 🏪 Business (`commercial`)

- [ ] We write this

_Business insurance is a little different. Loomis will talk with you about what fits._

### Business insurance chat

- **Id:** `commercial_review`
- **Tier:** Recommended
- **What the client reads:** Business insurance works a little differently. Loomis will talk with you about what fits your business.
- **Protects:** 🏪 Business I own, 🛠️ Side gig

---

# Part 2. What clients can add, and what we ask

## 👪 People

_Who lives with you?_

### 🙂 Person (`person`)

- **Shows up in the world:** zone `yard`
- **Points for adding it:** 100 XP
- **Coverages offered:** Term life; Mortgage protection term; Whole life; Universal life; Final expense; Child life; Short-term disability; Long-term disability; Long-term care; Life + long-term care; Individual health plan; Medicare Supplement; Medicare Advantage; Medicare drug plan (Part D); Dental plan; Vision plan; Accident cash plan; Critical illness plan; Hospital cash plan

**Good to know notes:**

- When a teen starts driving, car rates often change. Some companies give discounts for good grades or a driving class. Ask Loomis.
- A student away at college may still be on a parent's car and home policies, with some limits. Young adults can often stay on a parent's health plan until age 26. Ask Loomis how it works for your family.
- If a parent or grandparent moves in with you, a quick check of your home and car policies can help make sure everyone is included. Ask Loomis.

**Questions, in order:**

1. What is their first name? _(text, **required**)_
2. What is their last name? _(text)_
3. How are they related to you? _(choice)_
   - Choices: Spouse; Partner; Child; Stepchild; Grandchild; Parent; Grandparent; Brother or sister; Roommate; Someone else
4. Do they live with you? _(yesno)_
5. Do they drive? _(yesno)_
6. Where are they with driving? _(choice, only if "Do they drive?" is Yes)_
   - Choices: Learner's permit; Licensed; Not driving right now
7. Are they a student living away at college? _(yesno)_
8. When were they born? _(date)_
   - Help: Age helps Loomis find the right options.

## 🏡 Home

_Where do you live?_

### 🏡 House I own (`house_owned`)

- **Shows up in the world:** zone `home`
- **Points for adding it:** 150 XP
- **First-time surprise:** "Your home rises from the ground!"
- **Coverages offered:** Your house; Garage, shed & fence; Your belongings; Belongings at new cost; Extra living costs; Personal liability; Guest medical payments; Extended replacement cost; Code upgrade costs; Roof at new-roof cost; Wind & hail deductible; Water backup & sump overflow; Buried utility lines; Equipment breakdown; Airbnb & VRBO hosting; Home business add-on; Flood: your home; Flood: your belongings; Extra flood limit; Earthquake: your home; Earthquake: belongings; Earthquake: living costs

**Good to know notes:**

- Your home's rebuild cost can be different from what you paid for it or what it would sell for. Loomis can help check the number.
- Some insurers pay less for older roofs or ask about the roof's age. Knowing the year helps Loomis find a good fit.
- Most home policies do not include flood or earthquake. They are separate, and many people add them. Ask Loomis.
- Some home policies limit or leave out trampolines, or ask for a safety net. Worth asking Loomis.
- Pools can change home insurance rules, like fencing and extra liability. Loomis can help you plan.
- Some insurers ask about wood stoves, like who installed them and when they were last checked. Ask Loomis.
- Regular home policies often limit short-term rentals like Airbnb and VRBO. Ask Loomis about hosting add-ons.
- Regular home policies often have small limits for business gear. Ask Loomis if a home-business add-on fits.
- If you have a mortgage, your lender will usually want proof of home insurance. Loomis can help with that.

**Questions, in order:**

1. What do you call this home? _(text, **required**)_
   - Quick taps: Home; Our house; The farmhouse
2. What is the address? _(address)_
   - Help: We use it to look up details like the year built, so you do not have to type them.
3. Do you have a mortgage? _(yesno)_
   - Help: Lenders often ask for home insurance, so this helps us plan.
4. Which of these does it have? _(multi)_
   - Help: Pick all that fit. These help Loomis shop for the right policy.
   - Choices: Pool; Hot tub; Trampoline; Fireplace; Wood stove; Finished basement; Solar panels; Home generator; Security system; Smoke or leak sensors; Storm shelter; Detached garage; Barn or other outbuildings; Fence; Dog run
5. Is the pool in the ground or above it? _(choice, only if "Which of these does it have?" includes Pool)_
   - Choices: In the ground; Above ground
6. Is the pool fenced or gated? _(yesno, only if "Which of these does it have?" includes Pool)_
   - Help: A fence or locked gate keeps little visitors safe, and insurers often ask.
7. Does the trampoline have a safety net? _(yesno, only if "Which of these does it have?" includes Trampoline)_
8. Was the wood stove put in by a pro? _(yesno, only if "Which of these does it have?" includes Wood stove)_
   - Help: Some insurers ask who installed it.
9. Do you ever rent it out on Airbnb or VRBO? _(yesno)_
   - Help: Renting to guests can change how a home policy works.
10. Do you run a business from home? _(yesno)_
   - Help: Even a small one, like selling crafts online or seeing clients.
11. How many floors does it have? _(choice)_
   - Choices: 1 floor; 1½ floors; 2 floors; 3 or more floors; Split-level
12. What is it mostly built from? _(choice)_
   - Choices: Wood frame; Brick or stone on the outside; Solid brick, block or stone; Log; Steel or metal; Stucco; Something else
13. What is the roof made of? _(choice)_
   - Choices: Asphalt shingles; Metal; Clay or concrete tile; Slate; Wood shakes; Flat or rubber roof; Something else
14. How do you mostly heat it? _(choice)_
   - Choices: Gas furnace; Electric furnace or baseboard; Heat pump; Oil; Propane; Wood stove; Boiler (radiators); Something else
15. What year was it built? _(year)_
   - Help: A rough guess is fine.
16. About how many square feet is it? _(number)_
   - Help: A rough guess is fine.
17. What year was the roof put on? _(year)_
   - Help: If it was replaced, use that year. Older roofs sometimes change how a policy works.
18. Add a photo of the front of your home _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏢 Condo I own (`condo_owned`)

- **Shows up in the world:** zone `home`
- **Points for adding it:** 150 XP
- **First-time surprise:** "Your home rises from the ground!"
- **Coverages offered:** Inside your unit; Upgrades you made; Your belongings; Belongings at new cost; Extra living costs; Personal liability; Guest medical payments; Condo group charges; Flood: your home; Flood: your belongings; Earthquake: your home; Earthquake: belongings; Earthquake: living costs

**Good to know notes:**

- Your condo group's policy usually looks after the building. What it includes inside your unit can vary, so it is worth a look. Ask Loomis to help you fill any gaps.
- If your condo group bills owners for a big repair, some policies can help with your share. Ask Loomis.
- Regular home policies often limit short-term rentals like Airbnb and VRBO. Ask Loomis.

**Questions, in order:**

1. What do you call this home? _(text, **required**)_
   - Quick taps: Home; The condo
2. What is the address? _(address)_
   - Help: We use it to look up details like the year built, so you do not have to type them.
3. Do you have a mortgage? _(yesno)_
   - Help: Lenders often ask for home insurance, so this helps us plan.
4. Does your condo group's insurance help with the inside of your unit? _(choice)_
   - Help: Your condo group can tell you. Not sure? Skip it, and Loomis can help find out.
   - Choices: No, just the building; Yes, most of the inside too
5. Which of these does it have? _(multi)_
   - Help: Pick all that fit. These help Loomis shop for the right policy.
   - Choices: Fireplace; Wood stove; Security system; Smoke or leak sensors
6. Was the wood stove put in by a pro? _(yesno, only if "Which of these does it have?" includes Wood stove)_
   - Help: Some insurers ask who installed it.
7. Do you ever rent it out on Airbnb or VRBO? _(yesno)_
   - Help: Renting to guests can change how a home policy works.
8. Do you run a business from home? _(yesno)_
   - Help: Even a small one, like selling crafts online or seeing clients.
9. How do you mostly heat it? _(choice)_
   - Choices: Gas furnace; Electric furnace or baseboard; Heat pump; Oil; Propane; Wood stove; Boiler (radiators); Something else
10. Which floor is your unit on? _(number)_
11. What year was it built? _(year)_
   - Help: A rough guess is fine.
12. About how many square feet is it? _(number)_
   - Help: A rough guess is fine.
13. Add a photo of your building _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏠 Place I rent (`home_rented`)

- **Shows up in the world:** zone `home`
- **Points for adding it:** 150 XP
- **First-time surprise:** "Your home rises from the ground!"
- **Coverages offered:** Your belongings; Belongings at new cost; Personal liability; Extra living costs; Guest medical payments; Flood: your belongings; Earthquake: belongings

**Good to know notes:**

- Your landlord's policy is usually for the building, not for your things. A renters policy can help with yours.
- Renting out your place or a room, even for a weekend, often needs your landlord's okay and a closer look at your policy. Ask Loomis.

**Questions, in order:**

1. What do you call this home? _(text, **required**)_
   - Quick taps: Home; The apartment
2. What kind of place is it? _(choice)_
   - Choices: Apartment; House; Townhome; Duplex; Something else
3. Does your lease ask for renters insurance? _(yesno)_
   - Help: Many landlords and schools do.
4. Do you share the place with roommates? _(yesno)_
5. Do you ever rent it out on Airbnb or VRBO? _(yesno)_
   - Help: Renting to guests can change how a home policy works.
6. Do you run a business from home? _(yesno)_
   - Help: Even a small one, like selling crafts online or seeing clients.
7. What is the address? _(address)_
   - Help: We use it to look up details, so you do not have to type them.
8. Add a photo of your place _(photo)_
   - Help: Any picture helps. You can add more later.

### 🔑 Home I rent out (`landlord_property`)

- **Shows up in the world:** zone `town`
- **Points for adding it:** 150 XP
- **First-time surprise:** "A road to town appears!"
- **Coverages offered:** Rental building; Garage, shed & fence; Your stuff in the rental; Lost rent; Landlord liability; Guest medical payments; Short-term rental hosting; Flood: your home; Flood: your belongings; Earthquake: your home; Earthquake: belongings

**Good to know notes:**

- A regular home policy and a rental policy work differently. If you rent a place out, a landlord policy is made for that. Ask Loomis.
- Rentals that sit empty for a while can have special rules. Ask Loomis if yours may be empty at times.
- Renting by the night, like on Airbnb, often needs a different setup than a long-term rental. Ask Loomis.

**Questions, in order:**

1. What do you call this property? _(text, **required**)_
   - Quick taps: The duplex; The rental house
2. What is the address? _(address)_
   - Help: We use it to look up details like the year built, so you do not have to type them.
3. What kind of property is it? _(choice)_
   - Choices: Single-family home; Duplex; Small apartment building; Condo; Townhome; Something else
4. Does someone live there now? _(yesno)_
5. Do you have a mortgage? _(yesno)_
   - Help: Lenders often ask for home insurance, so this helps us plan.
6. Do you rent it by the night, like on Airbnb or VRBO? _(yesno)_
   - Help: Renting to guests can change how a home policy works.
7. Which of these does it have? _(multi)_
   - Help: Pick all that fit. These help Loomis shop for the right policy.
   - Choices: Pool; Hot tub; Fireplace; Wood stove; Security system; Smoke or leak sensors; Detached garage; Fence
8. Is the pool in the ground or above it? _(choice, only if "Which of these does it have?" includes Pool)_
   - Choices: In the ground; Above ground
9. Is the pool fenced or gated? _(yesno, only if "Which of these does it have?" includes Pool)_
   - Help: A fence or locked gate keeps little visitors safe, and insurers often ask.
10. Was the wood stove put in by a pro? _(yesno, only if "Which of these does it have?" includes Wood stove)_
   - Help: Some insurers ask who installed it.
11. How many units are there? _(number)_
12. How many floors does it have? _(choice)_
   - Choices: 1 floor; 1½ floors; 2 floors; 3 or more floors; Split-level
13. What is it mostly built from? _(choice)_
   - Choices: Wood frame; Brick or stone on the outside; Solid brick, block or stone; Log; Steel or metal; Stucco; Something else
14. What is the roof made of? _(choice)_
   - Choices: Asphalt shingles; Metal; Clay or concrete tile; Slate; Wood shakes; Flat or rubber roof; Something else
15. How do you mostly heat it? _(choice)_
   - Choices: Gas furnace; Electric furnace or baseboard; Heat pump; Oil; Propane; Wood stove; Boiler (radiators); Something else
16. What year was it built? _(year)_
   - Help: A rough guess is fine.
17. About how many square feet is it? _(number)_
   - Help: A rough guess is fine.
18. What year was the roof put on? _(year)_
   - Help: If it was replaced, use that year. Older roofs sometimes change how a policy works.
19. Add a photo of the property _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏖️ Vacation home (`vacation_home`)

- **Shows up in the world:** zone `town`
- **Points for adding it:** 150 XP
- **First-time surprise:** "A road to town appears!"
- **Coverages offered:** Your house; Garage, shed & fence; Your belongings; Belongings at new cost; Extra living costs; Personal liability; Guest medical payments; Extended replacement cost; Code upgrade costs; Roof at new-roof cost; Wind & hail deductible; Water backup & sump overflow; Buried utility lines; Equipment breakdown; Airbnb & VRBO hosting; Flood: your home; Flood: your belongings; Extra flood limit; Earthquake: your home; Earthquake: belongings; Earthquake: living costs

**Good to know notes:**

- If a second home sits empty for part of the year, some policies have special rules. Ask Loomis how yours is set up.
- Renting out a vacation home, even a few weeks a year, can change how a home policy works. Ask Loomis.

**Questions, in order:**

1. What do you call this place? _(text, **required**)_
   - Quick taps: The lake house; The cabin; The beach house
2. What is the address? _(address)_
   - Help: We use it to look up details like the year built, so you do not have to type them.
3. Do you have a mortgage? _(yesno)_
   - Help: Lenders often ask for home insurance, so this helps us plan.
4. How often is someone there? _(choice)_
   - Choices: Most of the year; Part of the year; A few weekends or holidays
5. Which of these does it have? _(multi)_
   - Help: Pick all that fit. These help Loomis shop for the right policy.
   - Choices: Pool; Hot tub; Trampoline; Fireplace; Wood stove; Solar panels; Home generator; Security system; Smoke or leak sensors; Detached garage; Barn or other outbuildings; Fence
6. Is the pool in the ground or above it? _(choice, only if "Which of these does it have?" includes Pool)_
   - Choices: In the ground; Above ground
7. Is the pool fenced or gated? _(yesno, only if "Which of these does it have?" includes Pool)_
   - Help: A fence or locked gate keeps little visitors safe, and insurers often ask.
8. Does the trampoline have a safety net? _(yesno, only if "Which of these does it have?" includes Trampoline)_
9. Was the wood stove put in by a pro? _(yesno, only if "Which of these does it have?" includes Wood stove)_
   - Help: Some insurers ask who installed it.
10. Do you ever rent it out on Airbnb or VRBO? _(yesno)_
   - Help: Renting to guests can change how a home policy works.
11. What is it mostly built from? _(choice)_
   - Choices: Wood frame; Brick or stone on the outside; Solid brick, block or stone; Log; Steel or metal; Stucco; Something else
12. What is the roof made of? _(choice)_
   - Choices: Asphalt shingles; Metal; Clay or concrete tile; Slate; Wood shakes; Flat or rubber roof; Something else
13. How do you mostly heat it? _(choice)_
   - Choices: Gas furnace; Electric furnace or baseboard; Heat pump; Oil; Propane; Wood stove; Boiler (radiators); Something else
14. What year was it built? _(year)_
   - Help: A rough guess is fine.
15. About how many square feet is it? _(number)_
   - Help: A rough guess is fine.
16. What year was the roof put on? _(year)_
   - Help: If it was replaced, use that year. Older roofs sometimes change how a policy works.
17. Add a photo of the front of the place _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏘️ Mobile home (`mobile_home`)

- **Shows up in the world:** zone `home`
- **Points for adding it:** 150 XP
- **First-time surprise:** "Your home rises from the ground!"
- **Coverages offered:** Garage, shed & fence; Your belongings; Belongings at new cost; Extra living costs; Personal liability; Guest medical payments; Wind & hail deductible; Equipment breakdown; Home business add-on; Mobile home & attachments; Flood: your home; Flood: your belongings; Earthquake: your home; Earthquake: belongings; Earthquake: living costs

**Good to know notes:**

- Mobile home policies are built differently from regular home policies. Things like age, tie-downs and skirting can matter. Ask Loomis.

**Questions, in order:**

1. What do you call this home? _(text, **required**)_
   - Quick taps: Home; Our place
2. What is the address? _(address)_
   - Help: We use it to look up details, so you do not have to type them.
3. Do you have a loan on it? _(yesno)_
   - Help: Lenders often ask for home insurance, so this helps us plan.
4. Is it on land you own or in a park? _(choice)_
   - Choices: On land I own; In a park, on a rented lot
5. How wide is it? _(choice)_
   - Choices: Single-wide; Double-wide; Something else
6. Do you run a business from home? _(yesno)_
   - Help: Even a small one, like selling crafts online or seeing clients.
7. Which of these does it have? _(multi)_
   - Help: Pick all that fit. These help Loomis shop for the right policy.
   - Choices: Wood stove; Storm shelter; Home generator; Security system; Smoke or leak sensors; Fence; Detached garage
8. Was the wood stove put in by a pro? _(yesno, only if "Which of these does it have?" includes Wood stove)_
   - Help: Some insurers ask who installed it.
9. How do you mostly heat it? _(choice)_
   - Choices: Gas furnace; Electric furnace or baseboard; Heat pump; Oil; Propane; Wood stove; Boiler (radiators); Something else
10. What is the roof made of? _(choice)_
   - Choices: Asphalt shingles; Metal; Clay or concrete tile; Slate; Wood shakes; Flat or rubber roof; Something else
11. What year was it built? _(year)_
   - Help: A rough guess is fine.
12. About how many square feet is it? _(number)_
   - Help: A rough guess is fine.
13. What year was the roof put on? _(year)_
   - Help: If it was replaced, use that year. Older roofs sometimes change how a policy works.
14. Add a photo of your home _(photo)_
   - Help: Any picture helps. You can add more later.

### 🎓 Student housing (`college_housing`)

- **Shows up in the world:** zone `town`
- **Points for adding it:** 150 XP
- **First-time surprise:** "A road to town appears!"
- **Coverages offered:** Your belongings; Belongings at new cost; Personal liability; Extra living costs; Guest medical payments

**Good to know notes:**

- A parent's home policy may help with some of a student's things, with limits. A student in an apartment may do better with their own renters policy. Ask Loomis.

**Questions, in order:**

1. What do you call this place? _(text, **required**)_
   - Quick taps: Dorm room; Off-campus apartment
2. Who is the student? _(text)_
   - Help: Type a name from your family.
3. What school is it? _(text)_
4. What kind of place is it? _(choice)_
   - Choices: Dorm; Off-campus apartment; Shared house; Something else
5. Do you share the place with roommates? _(yesno)_
6. Does your lease ask for renters insurance? _(yesno)_
   - Help: Many landlords and schools do.
7. What is the address? _(address)_
   - Help: The school or apartment address is fine.

### ☂️ Roof (`roof`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out
- **Points for adding it:** 50 XP
- **Coverages offered:** Roof at new-roof cost; Wind & hail deductible

**Good to know notes:**

- Some insurers pay less for an older roof, or ask for an inspection. A roof photo and the year it was put on help Loomis shop for you.

**Questions, in order:**

1. What is the roof made of? _(choice)_
   - Choices: Asphalt shingles; Metal; Clay or concrete tile; Slate; Wood shakes; Flat or rubber roof; Something else
2. What year was the roof put on? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of the roof _(photo)_
   - Help: A picture from the ground is fine.

### 🔥 Furnace or boiler (`furnace`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out, Condo I own
- **Points for adding it:** 50 XP
- **Coverages offered:** Equipment breakdown

**Questions, in order:**

1. What does it run on? _(choice)_
   - Choices: Natural gas; Electric; Oil; Propane; Wood; Something else
2. What year was it put in? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of it _(photo)_
   - Help: A picture of the label on the side helps most.

### 🌬️ Air conditioner (`central_air`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out, Condo I own
- **Points for adding it:** 50 XP
- **Coverages offered:** Equipment breakdown

**Questions, in order:**

1. What kind is it? _(choice)_
   - Choices: Central air; Heat pump; Ductless mini-split; Window units
2. What year was it put in? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of it _(photo)_
   - Help: A picture of the label on the outdoor unit helps most.

### 🚿 Water heater (`water_heater`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out, Condo I own
- **Points for adding it:** 50 XP
- **Coverages offered:** Equipment breakdown

**Good to know notes:**

- Many insurers ask how old a water heater is. The year it was put in helps Loomis shop for you.

**Questions, in order:**

1. What kind is it? _(choice)_
   - Choices: Tank, gas; Tank, electric; Tankless; Heat pump
2. What year was it put in? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of it _(photo)_
   - Help: A picture of the label on the side helps most.

### ⚡ Electrical panel (`electrical_panel`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out, Condo I own
- **Points for adding it:** 50 XP
- **Coverages offered:** Equipment breakdown

**Good to know notes:**

- Some insurers ask about older electrical panels, like fuse boxes. A photo helps Loomis find the right fit.

**Questions, in order:**

1. What kind of panel is it? _(choice)_
   - Choices: Breakers (switches); Fuses
2. How many amps is the main switch? _(choice)_
   - Choices: 60 to 100; 125 to 150; 200 or more
3. What year was it put in? _(year)_
   - Help: A rough guess is fine.
4. Add a photo of the panel _(photo)_
   - Help: Open the door and snap the whole thing, with the label if you can see one.

### 🚰 Plumbing (`plumbing`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out, Condo I own
- **Points for adding it:** 50 XP
- **Coverages offered:** none

**Good to know notes:**

- Gray plastic pipes (polybutylene) were used in many homes from the late 1970s to the mid-1990s. Some insurers limit options for homes that have them. If that is your home, Loomis can help look for choices.

**Questions, in order:**

1. What are the water pipes made of? _(choice)_
   - Help: Not sure? A photo of a pipe near the water heater or meter can help.
   - Choices: Copper; PEX (flexible plastic); CPVC or PVC (rigid plastic); Galvanized steel; Polybutylene (gray plastic); I don't know
2. Roughly what year was the plumbing put in? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of a water pipe _(photo)_
   - Help: Any picture helps. You can add more later.

### 💧 Sump pump (`sump_pump`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Home I rent out
- **Points for adding it:** 50 XP
- **Coverages offered:** Water backup & sump overflow; Equipment breakdown

**Good to know notes:**

- Water backup is usually an add-on to a home policy. A battery backup can help your pump keep working in a storm. Ask Loomis.

**Questions, in order:**

1. What kind is it? _(choice)_
   - Choices: Pedestal; Submersible
2. Does it have a battery backup? _(yesno)_
3. What year was it put in? _(year)_
   - Help: A rough guess is fine.
4. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### ⛲ Well or septic (`well_septic`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out
- **Points for adding it:** 50 XP
- **Coverages offered:** Buried utility lines; Equipment breakdown

**Good to know notes:**

- Wells, septic systems and buried lines are handled in different ways by home policies. Ask Loomis what yours might need.

**Questions, in order:**

1. Which do you have? _(choice)_
   - Choices: A well; A septic tank; Both
2. What year was it put in? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### ☀️ Solar panels (`solar_panels`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Home I rent out
- **Points for adding it:** 50 XP
- **Coverages offered:** Equipment breakdown; Solar panels

**Good to know notes:**

- If your panels are leased, the solar company may look after some of the insurance. It is worth asking who is in charge of what. Ask Loomis.

**Questions, in order:**

1. Do you own them or lease them? _(choice)_
   - Choices: I own them; I lease them; I buy the power from the company
2. Where are they? _(choice)_
   - Choices: On the roof; On the ground
3. What year was it put in? _(year)_
   - Help: A rough guess is fine.
4. Add a photo of them _(photo)_
   - Help: Any picture helps. You can add more later.

### 🔋 Generator (`generator`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out
- **Points for adding it:** 50 XP
- **Coverages offered:** Equipment breakdown

**Good to know notes:**

- Some insurers ask how a generator is hooked up. It is worth telling Loomis, who can check what fits.

**Questions, in order:**

1. What kind is it? _(choice)_
   - Choices: Standby (built in); Portable
2. What year was it put in? _(year)_
   - Help: A rough guess is fine.
3. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 📦 Item in my home (`inventory_item`)

- **Shows up in the world:** zone `inside`
- **Lives inside:** House I own, Condo I own, Place I rent, Home I rent out, Vacation home, Mobile home, Student housing
- **Points for adding it:** 50 XP
- **Coverages offered:** Your belongings; Belongings at new cost; Your belongings; Belongings at new cost; Your belongings; Belongings at new cost; Your stuff in the rental

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, cash and collections. A photo and a receipt now can make life easier later. Ask Loomis about special items.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: TV; Laptop; Couch; Washer; Bike
2. Which room is it in? _(choice)_
   - Choices: Living room; Kitchen; Dining room; Bedroom; Kid's room; Bathroom; Home office; Laundry room; Basement; Garage; Attic; Somewhere else
3. What kind of thing is it? _(choice)_
   - Choices: Electronics; Furniture; Appliances; Clothing; Tools; Sports and outdoor gear; Art and decor; Jewelry or watches; Collectibles; Something else
4. About what is it worth? _(money)_
   - Help: A rough guess is fine. What it would cost to buy again is a good guide.
5. What year did you get it? _(year)_
6. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
7. Add a photo of the receipt _(photo)_
   - Help: A receipt is a great way to show what something cost.

### 🏗️ Garage, shed or fence (`other_structure`)

- **Shows up in the world:** zone `yard`
- **Lives inside:** House I own, Vacation home, Mobile home, Home I rent out
- **Points for adding it:** 75 XP
- **Coverages offered:** Garage, shed & fence; Garage, shed & fence

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: Detached garage; The shed; The barn; Back fence; Gazebo
2. What kind is it? _(choice)_
   - Choices: Detached garage; Shed; Barn; Fence; Gazebo or pergola; Pool; Something else
3. About what year was it built? _(year)_
   - Help: A rough guess is fine.
4. About what would it cost to replace? _(money)_
   - Help: A rough guess is fine.
5. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

## 🚗 Vehicles

_What do you drive?_

### 🚗 Car, truck or SUV (`car`)

- **Shows up in the world:** zone `driveway`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A driveway rolls out to the street!"
- **Coverages offered:** Injury to others; Damage to others' property; Uninsured driver (UM/UIM); Medical payments; Personal injury protection; Collision; Comprehensive; Glass repair; Rental car; Roadside help & towing; Loan or lease gap; New car replacement; Custom parts & equipment; Rideshare & delivery

**Good to know notes:**

- Personal car policies often work differently while you are logged in to a rideshare or delivery app. There are add-ons for that. Ask Loomis.
- If you have a loan or lease, your lender usually asks for collision and comprehensive. Gap coverage can also help. Ask Loomis.
- Policies often limit what they pay for add-ons like lift kits or big stereos. Ask Loomis about including yours.
- If a teen driver will use this car, tell Loomis. A quick chat can help you plan.

**Questions, in order:**

1. What do you call this vehicle? _(text, **required**)_
   - Quick taps: Mom's car; Dad's truck; The minivan; The truck; Work truck
2. What kind of vehicle is it? _(choice)_
   - Choices: Car; Truck; SUV; Van
3. How do you mostly use it? _(choice)_
   - Choices: Getting to work or school; Fun and errands; For my work
4. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
5. Do you drive for Uber, Lyft or DoorDash with it? _(yesno)_
6. Does it have custom parts or upgrades? _(yesno)_
   - Help: Like a lift kit, special wheels or a big sound system.
7. Who drives it most? _(text)_
8. About how many miles do you drive it in a year? _(choice)_
   - Help: A rough guess is fine.
   - Choices: Under 5,000; 5,000 to 7,500; 7,500 to 10,000; 10,000 to 15,000; 15,000 to 20,000; Over 20,000
9. What is the VIN? _(vin)_
   - Help: It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.
10. What year is it? _(year)_
11. Who makes it? _(text)_
12. What is the model? _(text)_
13. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
14. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏍️ Motorcycle (`motorcycle`)

- **Shows up in the world:** zone `driveway`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A driveway rolls out to the street!"
- **Coverages offered:** Motorcycle liability; Motorcycle collision; Theft & other damage; Uninsured driver; Medical payments; Custom parts & accessories; Helmet & riding gear; Roadside help

**Good to know notes:**

- Car policies do not usually include motorcycles, so a bike has its own policy. Ask Loomis.
- Helmets and riding gear are often left out of a basic bike policy, but they can be added. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The Harley; Weekend bike; The scooter
2. What kind of bike is it? _(choice)_
   - Choices: Cruiser; Sport bike; Touring; Standard; Dual-sport; Scooter or moped
3. How do you mostly ride it? _(choice)_
   - Choices: For fun; To work or school
4. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
5. Does it have custom parts or accessories? _(yesno)_
6. What is the VIN? _(vin)_
   - Help: It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.
7. What year is it? _(year)_
8. Who makes it? _(text)_
9. What is the model? _(text)_
10. How big is the engine, in cc? _(number)_
   - Help: It is often printed on the side or in the manual. A rough guess is fine.
11. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
12. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🚐 Motorhome (`motorhome`)

- **Shows up in the world:** zone `driveway`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A driveway rolls out to the street!"
- **Coverages offered:** RV damage; Motorhome liability; Campsite liability; Belongings inside; Full-time RV living; Trip help if you break down; Awnings & built-in extras

**Good to know notes:**

- If you live in your motorhome most of the year, a different kind of policy may fit better. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The motorhome; The RV
2. What kind of motorhome is it? _(choice)_
   - Choices: Class A (bus style); Class B (camper van); Class C (with a bed over the cab)
3. How do you use it? _(choice)_
   - Choices: Trips and vacations; Part of the year as a home; As my full-time home
4. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
5. What is the VIN? _(vin)_
   - Help: It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.
6. What year is it? _(year)_
7. Who makes it? _(text)_
8. What is the model? _(text)_
9. How long is it, in feet? _(number)_
   - Help: A rough guess is fine.
10. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
11. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🚘 Classic or collector car (`classic_car`)

- **Shows up in the world:** zone `driveway`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A driveway rolls out to the street!"
- **Coverages offered:** Classic car damage; Agreed value; Classic car liability; Spare parts & tools; Flatbed towing

**Good to know notes:**

- Classic cars are often insured for an agreed value, a number you and the insurer pick up front. A recent appraisal and photos can help. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The Mustang; Grandpa's truck; The hot rod
2. How do you use it? _(choice)_
   - Choices: Shows and parades; Weekend drives; Regular driving
3. Where do you keep it? _(choice)_
   - Choices: In a locked garage; In another building; Outside or under a carport
4. Do you have another car for everyday driving? _(yesno)_
   - Help: Some collector policies ask for this.
5. About how many miles do you drive it in a year? _(choice)_
   - Choices: Under 1,000; 1,000 to 3,000; 3,000 to 5,000; Over 5,000
6. What is the VIN? _(vin)_
   - Help: It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.
7. What year is it? _(year)_
8. Who makes it? _(text)_
9. What is the model? _(text)_
10. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
11. Has it been appraised in the last 5 years? _(yesno)_
12. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
13. Add a photo of the appraisal or receipt _(photo)_
   - Help: Any picture helps. You can add more later.

## 🚤 Fun & toys

_Boats, campers, ATVs and more_

### ⛵ Boat (`boat`)

- **Shows up in the world:** zone `water`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A lake appears!"
- **Coverages offered:** Boat or jet ski damage; Boating liability; Boating medical payments; On-water towing; Fuel spill cleanup; Wreck removal; Uninsured boater; Gear & personal items

**Good to know notes:**

- Home policies often have small limits for boats, depending on size and motor. A boat policy can fill the gap. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The pontoon; Lake boat; The fishing boat
2. What kind of boat is it? _(choice)_
   - Choices: Pontoon; Fishing boat; Ski or speed boat; Sailboat; Cabin cruiser or yacht; Small boat or dinghy
3. Where do you use it? _(choice)_
   - Choices: Lakes and rivers; The ocean or coast
4. Where do you keep it? _(choice)_
   - Choices: On a trailer at home; At a marina; In dry storage; On a lift at home
5. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
6. What year is it? _(year)_
7. Who makes it? _(text)_
8. What is the model? _(text)_
9. How long is it, in feet? _(number)_
   - Help: A rough guess is fine.
10. How much horsepower is the motor? _(number)_
   - Help: A rough guess is fine.
11. What is the hull ID number? _(text)_
   - Help: It is a 12-character number on the back right side of the boat.
12. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
13. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🌊 Jet ski (`pwc`)

- **Shows up in the world:** zone `water`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A lake appears!"
- **Coverages offered:** Boat or jet ski damage; Boating liability; Boating medical payments; On-water towing; Fuel spill cleanup; Wreck removal; Uninsured boater

**Good to know notes:**

- Home policies often leave out jet skis, or limit them to a small amount. A separate policy can help. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The jet ski; The Sea-Doo; The WaveRunner
2. Where do you use it? _(choice)_
   - Choices: Lakes and rivers; The ocean or coast
3. Where do you keep it? _(choice)_
   - Choices: On a trailer at home; At a marina; On a lift or dock
4. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
5. What year is it? _(year)_
6. Who makes it? _(text)_
7. What is the model? _(text)_
8. How much horsepower does it have? _(number)_
   - Help: A rough guess is fine.
9. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
10. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏞️ ATV or side-by-side (`atv_utv`)

- **Shows up in the world:** zone `garage`
- **Points for adding it:** 75 XP
- **Coverages offered:** Liability; Crash damage; Theft & other damage; Medical payments; Guest passenger liability; Accessories & add-ons; Towing & trail recovery

**Good to know notes:**

- Home and car policies often leave out ATVs and side-by-sides. A separate policy can help with damage and with injuries to others. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The Polaris; The Ranger; Farm ATV
2. What kind is it? _(choice)_
   - Choices: ATV (four-wheeler); UTV (side-by-side)
3. What do you use it for? _(choice)_
   - Choices: Trails and fun; Farm or yard work; Hunting
4. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
5. What is the VIN? _(vin)_
   - Help: It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.
6. What year is it? _(year)_
7. Who makes it? _(text)_
8. What is the model? _(text)_
9. How big is the engine, in cc? _(number)_
   - Help: It is often printed on the side or in the manual. A rough guess is fine.
10. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
11. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🛷 Snowmobile (`snowmobile`)

- **Shows up in the world:** zone `garage`
- **Points for adding it:** 75 XP
- **Coverages offered:** Liability; Crash damage; Theft & other damage; Medical payments; Guest passenger liability; Accessories & add-ons; Towing & trail recovery

**Good to know notes:**

- Home and car policies often leave out snowmobiles. A separate policy can help. Racing is usually handled differently, so tell Loomis if you race.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The sled; Winter sled
2. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
3. Do you have a trailer for it? _(yesno)_
4. What year is it? _(year)_
5. Who makes it? _(text)_
6. What is the model? _(text)_
7. How big is the engine, in cc? _(number)_
   - Help: It is often printed on the side or in the manual. A rough guess is fine.
8. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
9. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### ⛳ Golf cart (`golf_cart`)

- **Shows up in the world:** zone `garage`
- **Points for adding it:** 75 XP
- **Coverages offered:** Liability; Crash damage; Theft & other damage; Medical payments; Guest passenger liability; Accessories & add-ons

**Good to know notes:**

- Some home policies include golf carts on your own property but not on neighborhood or public roads. Ask Loomis how yours would work.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The golf cart; Neighborhood cart
2. Where do you drive it? _(choice)_
   - Choices: On my property or a golf course; On neighborhood roads; It is street-legal
3. What powers it? _(choice)_
   - Choices: Electric; Gas
4. Does it have custom parts? _(yesno)_
   - Help: Like a lift kit, lights or special seats.
5. What year is it? _(year)_
6. Who makes it? _(text)_
7. What is the model? _(text)_
8. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
9. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏕️ Camper or trailer (`travel_trailer`)

- **Shows up in the world:** zone `driveway`
- **Points for adding it:** 100 XP
- **Coverages offered:** RV damage; Campsite liability; Belongings inside; Full-time RV living; Trip help if you break down; Awnings & built-in extras

**Good to know notes:**

- Your car policy may help with the trailer while you tow it, but the camper itself often needs its own policy. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The camper; Our travel trailer
2. What kind is it? _(choice)_
   - Choices: Travel trailer; Fifth wheel; Pop-up; Toy hauler
3. How do you use it? _(choice)_
   - Choices: Trips and vacations; Parked at a campground most summers; As my full-time home
4. Do you own it outright, or is there a loan or lease? _(choice)_
   - Choices: I own it outright; I have a loan; I lease it
5. What is the VIN? _(vin)_
   - Help: It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.
6. What year is it? _(year)_
7. Who makes it? _(text)_
8. What is the model? _(text)_
9. How long is it, in feet? _(number)_
   - Help: A rough guess is fine.
10. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
11. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🚛 Utility trailer (`utility_trailer`)

- **Shows up in the world:** zone `garage`
- **Points for adding it:** 50 XP
- **Coverages offered:** Trailer damage

**Good to know notes:**

- A car policy may help with others if you cause a crash while towing, but damage to the trailer and the tools inside is often separate. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: Yard trailer; Landscape trailer
2. What kind is it? _(choice)_
   - Choices: Open utility; Enclosed cargo; Car hauler; Flatbed; Something else
3. What do you use it for? _(choice)_
   - Choices: Personal use; For work
4. What year is it? _(year)_
5. Who makes it? _(text)_
6. How long is it, in feet? _(number)_
   - Help: A rough guess is fine.
7. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
8. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🛴 E-bike or scooter (`ebike_scooter`)

- **Shows up in the world:** zone `garage`
- **Points for adding it:** 75 XP
- **Coverages offered:** E-bike liability; E-bike or scooter

**Good to know notes:**

- Home and car policies often have limits for e-bikes and scooters, especially for theft or for hurting someone else. A listed item or a special policy can help. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: My e-bike; The scooter
2. What kind is it? _(choice)_
   - Choices: E-bike; Electric scooter; Other electric ride
3. About how fast does it go? _(choice)_
   - Help: The top speed is often in the manual or on the box.
   - Choices: Under 20 mph; 20 to 28 mph; Faster than 28 mph
4. Who makes it? _(text)_
5. What year did you get it? _(year)_
6. About what did it cost? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
7. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
8. Add a photo of the receipt _(photo)_
   - Help: Any picture helps. You can add more later.

### 🚁 Drone (`drone`)

- **Shows up in the world:** zone `yard`
- **Points for adding it:** 75 XP
- **Coverages offered:** Drone liability; Drone coverage

**Good to know notes:**

- Home policies often limit drones. Drones used for work are usually a business matter. Ask Loomis.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: My drone; The camera drone
2. What do you use it for? _(choice)_
   - Choices: Just for fun; Photos and video as a hobby; For work
3. What brand and model is it? _(text)_
4. About what did it cost? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
5. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

### 🏁 Dirt bike (`dirt_bike`)

- **Shows up in the world:** zone `garage`
- **Points for adding it:** 75 XP
- **Coverages offered:** Liability; Crash damage; Theft & other damage; Medical payments; Accessories & add-ons; Towing & trail recovery

**Good to know notes:**

- Track days and racing are usually handled differently from trail riding. Tell Loomis how you ride, and they can check what fits.

**Questions, in order:**

1. What do you call it? _(text, **required**)_
   - Quick taps: The dirt bike; Trail bike
2. How do you ride it? _(choice)_
   - Choices: Trails and fun; Around the farm or yard; At a track
3. What year is it? _(year)_
4. Who makes it? _(text)_
5. What is the model? _(text)_
6. How big is the engine, in cc? _(number)_
   - Help: It is often printed on the side or in the manual. A rough guess is fine.
7. About what is it worth today? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
8. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.

## 🐾 Pets

_Who greets you at the door?_

### 🐶 Dog (`dog`)

- **Shows up in the world:** zone `yard`
- **Points for adding it:** 75 XP
- **Coverages offered:** Accident & illness; Accident only; Wellness add-on

**Good to know notes:**

- Some home insurers look at a dog's breed when they set up a policy. Loomis can help you find one that fits your pup.
- Pet health plans can help with vet bills. The best time to look is while your dog is young and healthy. Ask Loomis.

**Questions, in order:**

1. What is your dog's name? _(text, **required**)_
2. How big is your pet? _(choice)_
   - Choices: Small (under 25 lb); Medium (25 to 60 lb); Large (over 60 lb)
3. What breed is your dog? _(text)_
   - Help: Mixed breed? A best guess is fine. Some home insurers look at breed.
   - Quick taps: Mixed breed
4. What year was your dog born? _(year)_
   - Help: A rough guess is fine.
5. Add a photo of your dog _(photo)_
   - Help: Any picture helps. You can add more later.

### 🐱 Cat (`cat`)

- **Shows up in the world:** zone `yard`
- **Points for adding it:** 75 XP
- **Coverages offered:** Accident & illness; Accident only; Wellness add-on

**Good to know notes:**

- Pet health plans can help with vet bills. The best time to look is while your cat is young and healthy. Ask Loomis.

**Questions, in order:**

1. What is your cat's name? _(text, **required**)_
2. Where does your cat spend time? _(choice)_
   - Choices: Indoors; Indoors and outdoors; Mostly outdoors
3. What breed is your cat? _(text)_
   - Help: A best guess is fine.
   - Quick taps: Domestic shorthair; Mixed breed
4. What year was your cat born? _(year)_
   - Help: A rough guess is fine.
5. Add a photo of your cat _(photo)_
   - Help: Any picture helps. You can add more later.

### 🐴 Horse (`horse`)

- **Shows up in the world:** zone `pasture`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A pasture opens up!"
- **Coverages offered:** Horse vet bills; Horse value protection

**Good to know notes:**

- Home policies often treat horses differently from other pets. A farm policy or a horse policy may fit better. Ask Loomis.

**Questions, in order:**

1. What is your horse's name? _(text, **required**)_
2. What is your horse used for? _(choice)_
   - Choices: Pleasure and trail riding; Showing or competing; Breeding; Ranch or farm work; Retired
3. Where is your horse kept? _(choice)_
   - Choices: At home; At a boarding barn
4. What breed is your horse? _(text)_
5. What year was your horse born? _(year)_
   - Help: A rough guess is fine.
6. About what is your horse worth? _(money)_
   - Help: A rough guess is fine.
7. Add a photo of your horse _(photo)_
   - Help: Any picture helps. You can add more later.

### 🦜 Bird or exotic pet (`bird_exotic`)

- **Shows up in the world:** zone `yard`
- **Points for adding it:** 75 XP
- **Coverages offered:** Accident & illness

**Good to know notes:**

- Not every pet health plan includes birds and exotic pets. Loomis can help check.

**Questions, in order:**

1. What is your pet's name? _(text, **required**)_
2. What kind of animal is it? _(text)_
   - Quick taps: Parrot; Parakeet; Snake; Lizard
3. What year was your pet born? _(year)_
   - Help: A rough guess is fine.
4. Add a photo of your pet _(photo)_
   - Help: Any picture helps. You can add more later.

### 🐰 Other pet (`other_pet`)

- **Shows up in the world:** zone `yard`
- **Points for adding it:** 50 XP
- **Coverages offered:** Accident & illness

**Questions, in order:**

1. What is your pet's name? _(text, **required**)_
2. What kind of animal is it? _(text)_
   - Quick taps: Rabbit; Guinea pig; Fish; Hamster
3. Add a photo of your pet _(photo)_
   - Help: Any picture helps. You can add more later.

## 💎 Valuables

_What is special to you?_

### 💍 Jewelry (`jewelry`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Jewelry, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Engagement ring; Wedding band; Grandma's necklace; Earrings
2. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
3. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
4. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
5. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### ⌚ Watch (`watch`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Watches, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Dad's watch; Anniversary watch
2. Who makes it? _(text)_
3. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
4. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
5. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
6. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🎨 Art (`fine_art`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Art, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.
- Art can be hurt by sunlight and moisture, and by being moved. A listed-item policy can look at those risks. Ask Loomis.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Oil painting; Sculpture; Signed print
2. What kind of art is it? _(choice)_
   - Choices: Painting; Sculpture; Print or photograph; Rug or tapestry; Something else
3. Who made it? _(text)_
4. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
5. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
6. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
7. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🏺 Collection (`collectibles`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Collectibles, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Coin collection; Stamp album; Baseball cards
2. What kind of collection is it? _(choice)_
   - Choices: Coins; Stamps; Trading cards; Sports or movie memorabilia; Toys or dolls; Comics or books; Something else
3. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
4. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
5. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
6. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🎯 Firearm (`firearm`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Firearms, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.
- Many insurers like firearms kept in a locked safe or cabinet. Ask Loomis about listing yours by name.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Hunting rifle; Shotgun; Grandpa's pistol
2. What kind is it? _(choice)_
   - Choices: Rifle; Shotgun; Handgun; A collection
3. Is it kept in a locked safe or cabinet? _(yesno)_
4. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
5. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
6. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
7. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🎸 Musical instrument (`musical_instrument`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Instruments, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.
- If you play paid gigs, that can change how a policy works. Tell Loomis, who can check what fits.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Acoustic guitar; Piano; Violin
2. What kind is it? _(choice)_
   - Choices: Guitar; Piano or keyboard; Violin, cello or other strings; Brass or woodwind; Drums; Something else
3. Do you ever use it to earn money? _(yesno)_
   - Help: Like playing paid gigs or shooting photos for clients.
4. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
5. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
6. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
7. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 📷 Camera gear (`camera_gear`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Camera gear, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.
- If you shoot photos or video for pay, that can change how a policy works. Tell Loomis, who can check what fits.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Camera and lenses; Video camera
2. Do you ever use it to earn money? _(yesno)_
   - Help: Like playing paid gigs or shooting photos for clients.
3. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
4. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
5. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
6. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🏅 Sports gear (`sports_gear`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Sports gear, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Golf clubs; Skis; Fishing gear
2. What kind of gear is it? _(choice)_
   - Choices: Golf clubs; Skis or snowboard; Fishing gear; Hunting or archery gear; Camping or hiking gear; Something else
3. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
4. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
5. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
6. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🍴 Silverware (`silverware`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Silverware, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Sterling flatware set; Silver tea set
2. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
3. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
4. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
5. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

### 🚴 High-end bicycle (`high_end_bicycle`)

- **Shows up in the world:** zone `vault`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A treasure chest appears!"
- **Coverages offered:** Bicycles, listed by name

**Good to know notes:**

- Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.
- Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.
- Bikes are often stolen from cars and garages. A listed-item policy can help wherever your bike is. Ask Loomis.

**Questions, in order:**

1. What is it? _(text, **required**)_
   - Quick taps: Road bike; Mountain bike
2. Who makes it? _(text)_
3. Do you race it? _(yesno)_
4. Has it been appraised in the last 5 years? _(yesno)_
   - Help: An appraisal is a written opinion of what something is worth.
5. About what is it worth? _(money)_
   - Help: A rough guess is fine. Receipts and appraisals help.
6. Add a photo of it _(photo)_
   - Help: Any picture helps. You can add more later.
7. Add a photo of the appraisal or receipt _(photo)_
   - Help: This helps if you ever need to show what it is worth.

## 💼 Work

_What do you do all day?_

### 💼 Job (`job`)

- **Shows up in the world:** zone `town`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A road to town appears!"
- **Coverages offered:** none

**Good to know notes:**

- Life and disability insurance from work often ends when the job does. A plan of your own can stay with you. Ask Loomis.
- Work plans may pay less than you think, or stop at a certain age. Loomis can help you see how the pieces fit.

**Questions, in order:**

1. What is the job? _(text, **required**)_
   - Quick taps: Teacher; Nurse; Truck driver; Office manager
2. Whose job is it? _(text)_
   - Help: Type a name from your family.
3. How do they work? _(choice)_
   - Choices: Full-time; Part-time; Self-employed; Seasonal or contract
4. Who do they work for? _(text)_
   - Quick taps: Self-employed
5. Does work offer any of these? _(multi)_
   - Help: Pick all that apply. Not sure? Skip it.
   - Choices: Life insurance; Disability insurance; Health insurance

### 🛠️ Side gig (`side_gig`)

- **Shows up in the world:** zone `town`
- **Points for adding it:** 75 XP
- **First-time surprise:** "A road to town appears!"
- **Coverages offered:** Business insurance chat

**Good to know notes:**

- A side gig can change how your home and car policies work. Delivery driving is one example. Ask Loomis.

**Questions, in order:**

1. What is the side gig? _(text, **required**)_
   - Quick taps: Etsy shop; Lawn care; DoorDash; Babysitting
2. Whose side gig is it? _(text)_
   - Help: Type a name from your family.
3. What kind is it? _(choice)_
   - Choices: Driving or delivery; Selling things; Child, pet or elder care; Home services or repairs; Photos, art or other creative work; Something else
4. Do you use your own car or truck for it? _(yesno)_
5. Do you do the work from home? _(yesno)_

### 🏪 Business I own (`business`)

- **Shows up in the world:** zone `town`
- **Points for adding it:** 100 XP
- **First-time surprise:** "A road to town appears!"
- **Coverages offered:** Business insurance chat

**Good to know notes:**

- Business insurance works a little differently. Loomis will talk with you about what fits your business.

**Questions, in order:**

1. What is the business called? _(text, **required**)_
2. What does it do? _(text)_
   - Help: A sentence or two is plenty. Loomis will call to learn more.

---

# Part 3. Life events

Each one is a moment a client can pick. It suggests what to add and which coverages to look at.

### 👶 We're having a baby

- **Message:** Congratulations! Let's add your little one and look at ways to help your growing family.
- **Suggests adding:** Person
- **Suggests looking at:** Term life; Child life; Long-term disability; Individual health plan; Personal umbrella

### 💍 We're getting married

- **Message:** Congratulations! Let's bring your new family member into your world and look after the rings, too.
- **Suggests adding:** Person, Jewelry
- **Suggests looking at:** Term life; Jewelry, listed by name; Individual health plan

### 💒 We're planning a wedding

- **Message:** How exciting! Let's look at what can help your big day go smoothly.
- **Suggests adding:** Person, Jewelry
- **Suggests looking at:** Event liability; Event cancellation; Jewelry, listed by name

### 🚗 A teen is learning to drive

- **Message:** Big milestone! Let's add your new driver and look at what can help the whole family.
- **Suggests adding:** Person, Car, truck or SUV
- **Suggests looking at:** Injury to others; Damage to others' property; Uninsured driver (UM/UIM); Personal umbrella

### 🏡 We're buying a home

- **Message:** Welcome home! Let's add your new place and the big parts inside it.
- **Suggests adding:** House I own, Roof, Furnace or boiler, Water heater, Plumbing
- **Suggests looking at:** Your house; Your belongings; Personal liability; Water backup & sump overflow; Flood: your home; Mortgage protection term

### 📦 We're moving

- **Message:** A fresh start! Let's make sure your new address and your things are all in the plan.
- **Suggests adding:** House I own, Place I rent, Item in my home
- **Suggests looking at:** Your belongings; Your belongings; Injury to others

### 🔨 We're fixing up the house

- **Message:** Fun project! Let's note the changes so your plan grows along with your home.
- **Suggests adding:** House I own, Garage, shed or fence, Roof
- **Suggests looking at:** Your house; Extended replacement cost; Code upgrade costs; Personal liability

### 🏊 We're adding a pool

- **Message:** Summer fun! Let's add it and talk about keeping family and guests safe.
- **Suggests adding:** Garage, shed or fence
- **Suggests looking at:** Personal liability; Guest medical payments; Personal umbrella

### 🎓 Heading off to college

- **Message:** Off they go! Let's add their new space and see what can help while they're away.
- **Suggests adding:** Student housing, Person
- **Suggests looking at:** Your belongings; Personal liability; Individual health plan

### 👵 A parent is moving in

- **Message:** What a kind thing to do. Let's make sure your home and your plan have room for everyone.
- **Suggests adding:** Person, House I own
- **Suggests looking at:** Personal liability; Guest medical payments; Long-term care; Final expense

### 🐶 We're getting a pet

- **Message:** A new best friend! Let's add them and see what could help with vet bills.
- **Suggests adding:** Dog, Cat, Other pet
- **Suggests looking at:** Accident & illness; Wellness add-on; Personal liability

### 🚙 I'm buying a car

- **Message:** New wheels! Let's add your car and see what can help you enjoy the ride.
- **Suggests adding:** Car, truck or SUV
- **Suggests looking at:** Injury to others; Collision; Comprehensive; Loan or lease gap; New car replacement

### 🚕 I'm driving for Uber or DoorDash

- **Message:** Thanks for sharing! Let's add your car and your side gig, since the rules can change when you drive for pay.
- **Suggests adding:** Car, truck or SUV, Side gig
- **Suggests looking at:** Rideshare & delivery; Personal umbrella

### 🚤 I'm buying a boat or RV

- **Message:** Time to hit the water or the road! Let's add it and see what can help.
- **Suggests adding:** Boat, Jet ski, Motorhome, Camper or trailer
- **Suggests looking at:** Boat or jet ski damage; Boating liability; RV damage; Motorhome liability; Personal umbrella

### 👔 I'm starting a new job

- **Message:** Congrats on the new job! Work benefits can change, so let's see what you have and what could stay with you.
- **Suggests adding:** Job, Person
- **Suggests looking at:** Term life; Long-term disability; Individual health plan

### 💼 I'm starting a business

- **Message:** Exciting! Add your business, and Loomis will call to talk it through.
- **Suggests adding:** Business I own, Side gig
- **Suggests looking at:** Business insurance chat; Home business add-on

### 🔑 I'm renting out a place

- **Message:** Becoming a landlord is a big step! Let's add your property and look at what fits.
- **Suggests adding:** Home I rent out
- **Suggests looking at:** Rental building; Lost rent; Landlord liability; Personal umbrella

### 🌅 I'm retiring

- **Message:** Enjoy this next chapter! Let's look at what can help as your needs change.
- **Suggests adding:** Person
- **Suggests looking at:** Individual health plan; Long-term care; Medicare Supplement; Final expense

### 🎂 I'm turning 65

- **Message:** Happy early birthday! Medicare has a lot of choices, so let's look at them together.
- **Suggests adding:** Person
- **Suggests looking at:** Medicare Supplement; Medicare Advantage; Medicare drug plan (Part D); Dental plan; Vision plan

### ✈️ We're taking a big trip

- **Message:** Bon voyage! Let's look at a few things that can help if plans change.
- **Suggests adding:** nothing in particular
- **Suggests looking at:** Trip cancellation; Travel medical & rescue; Lost bags & delays
