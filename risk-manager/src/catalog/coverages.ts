import type { Coverage, CoverageOption } from "./types.ts";

/**
 * Every coverage a client can mark Need / Want / Not now.
 *
 * Conventions that keep this file honest:
 *   - `line` decides which budget bucket a coverage lands in, so a coverage is
 *     never shared across lines. That is why condo, renters and landlord each
 *     have their own liability, belongings and loss-of-use entries.
 *   - `protects` is the source of truth for what a coverage attaches to. Each
 *     kind in kinds.ts repeats the ids it offers, in display order, and
 *     validateCatalog() fails if the two ever disagree.
 *   - `requires` is only for strict dependencies (an add-on that cannot exist
 *     without its base). "Needs collision OR comprehensive" can't be written,
 *     so those are left off.
 *   - Rules differ by state and by company. Where it matters the text says
 *     "Rules vary by state" instead of describing one state's rule.
 *   - Nothing here promises coverage. "Can help pay" is deliberate.
 */

/** Builds option lists from [value, label] pairs. */
const opts = (...pairs: [string, string][]): CoverageOption[] =>
  pairs.map(([value, label]) => ({ value, label }));

// ---------------------------------------------------------------------------
// Option sets reused across coverages
// ---------------------------------------------------------------------------

/** Split auto liability limits: per person / per crash. */
const BI_LIMITS = opts(
  ["25_50", "$25,000 / $50,000"],
  ["50_100", "$50,000 / $100,000"],
  ["100_300", "$100,000 / $300,000"],
  ["250_500", "$250,000 / $500,000"],
  ["500_500", "$500,000 / $500,000"],
);

/** Single-limit liability for homes, boats, RVs and the like. */
const LIABILITY_LIMITS = opts(
  ["100k", "$100,000"],
  ["300k", "$300,000"],
  ["500k", "$500,000"],
  ["1m", "$1,000,000"],
);

const DEDUCTIBLES_SMALL = opts(
  ["250", "$250"],
  ["500", "$500"],
  ["1000", "$1,000"],
  ["2000", "$2,000"],
);

/** Listed-item coverage often has a very low or no deductible. */
const VALUABLES_DEDUCTIBLES = opts(["0", "$0"], ["100", "$100"], ["250", "$250"], ["500", "$500"]);

const MED_PAY_SMALL = opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"], ["10000", "$10,000"]);

/** Everything that is a place to live and sits on the "home" budget line. */
const OWNED_HOMES = ["house_owned", "vacation_home"];

export const COVERAGES: Coverage[] = [
  // =========================================================================
  // AUTO
  // =========================================================================
  {
    id: "auto_liability_bi",
    line: "auto",
    label: "Injury to others",
    plainEnglish:
      "Can help pay other people's medical bills if you cause a crash. The two numbers are the most per person, then per crash. Rules vary by state.",
    tier: "essential",
    protects: ["car"],
    limitOptions: BI_LIMITS,
  },
  {
    id: "auto_liability_pd",
    line: "auto",
    label: "Damage to others' property",
    plainEnglish: "Can help pay to fix other people's cars, fences or buildings if you cause a crash.",
    tier: "essential",
    protects: ["car"],
    limitOptions: opts(["25k", "$25,000"], ["50k", "$50,000"], ["100k", "$100,000"], ["250k", "$250,000"]),
  },
  {
    id: "auto_um_bi",
    line: "auto",
    label: "Uninsured driver (UM/UIM)",
    plainEnglish:
      "Can help pay your medical bills if the other driver has no insurance, or not enough. Rules vary by state.",
    tier: "recommended",
    protects: ["car"],
    limitOptions: BI_LIMITS,
  },
  {
    id: "auto_med_pay",
    line: "auto",
    label: "Medical payments",
    plainEnglish: "Can help pay medical bills for you and your passengers after a crash, no matter who caused it.",
    tier: "recommended",
    protects: ["car"],
    limitOptions: MED_PAY_SMALL,
  },
  {
    id: "auto_pip",
    line: "auto",
    label: "Personal injury protection",
    plainEnglish:
      "Can help pay medical bills and some lost pay for you and your passengers, no matter who caused the crash. Some states require it. Rules vary by state.",
    tier: "recommended",
    protects: ["car"],
    limitOptions: opts(["2500", "$2,500"], ["5000", "$5,000"], ["10000", "$10,000"], ["50000", "$50,000"]),
  },
  {
    id: "auto_collision",
    line: "auto",
    label: "Collision",
    plainEnglish:
      "Can help pay to fix your car after a crash or if you hit something. Lenders usually ask for this if you have a car loan.",
    tier: "essential",
    protects: ["car"],
    deductibleOptions: DEDUCTIBLES_SMALL,
  },
  {
    id: "auto_comprehensive",
    line: "auto",
    label: "Comprehensive",
    plainEnglish:
      "Can help pay if your car is stolen or damaged by things like hail, fire, floods or hitting a deer.",
    tier: "essential",
    protects: ["car"],
    deductibleOptions: opts(["100", "$100"], ["250", "$250"], ["500", "$500"], ["1000", "$1,000"]),
  },
  {
    id: "auto_glass",
    line: "auto",
    label: "Glass repair",
    plainEnglish:
      "Can help pay to fix or replace a cracked windshield or window, often with a low or no deductible. Rules vary by state.",
    tier: "extra",
    protects: ["car"],
    requires: ["auto_comprehensive"],
  },
  {
    id: "auto_rental",
    line: "auto",
    label: "Rental car",
    plainEnglish: "Can help pay for a rental car while yours is being fixed after a claim.",
    tier: "recommended",
    protects: ["car"],
    limitOptions: opts(["30", "$30 a day"], ["40", "$40 a day"], ["50", "$50 a day"], ["75", "$75 a day"]),
  },
  {
    id: "auto_roadside",
    line: "auto",
    label: "Roadside help & towing",
    plainEnglish: "Can help pay for a tow, a jump start, a flat tire or a lockout.",
    tier: "extra",
    protects: ["car"],
  },
  {
    id: "auto_gap",
    line: "auto",
    label: "Loan or lease gap",
    plainEnglish:
      "Can help pay what you still owe on your loan or lease if your car is totaled and was worth less than that.",
    tier: "recommended",
    protects: ["car"],
    requires: ["auto_collision", "auto_comprehensive"],
  },
  {
    id: "auto_new_car",
    line: "auto",
    label: "New car replacement",
    plainEnglish:
      "If a new car is totaled, can help pay for a brand-new one instead of what it was worth that day. Usually for cars a year or two old at most.",
    tier: "extra",
    protects: ["car"],
    requires: ["auto_collision", "auto_comprehensive"],
  },
  {
    id: "auto_custom_equipment",
    line: "auto",
    label: "Custom parts & equipment",
    plainEnglish:
      "Can help pay for add-ons you put on after you bought it, like a lift kit, special wheels or a big stereo.",
    tier: "extra",
    protects: ["car"],
    limitOptions: opts(["2500", "$2,500"], ["5000", "$5,000"], ["10000", "$10,000"], ["25000", "$25,000"]),
  },
  {
    id: "auto_rideshare",
    line: "auto",
    label: "Rideshare & delivery",
    plainEnglish:
      "Can help fill the gap when you drive for Uber, Lyft or DoorDash. Personal car policies often work differently while you are working.",
    tier: "recommended",
    protects: ["car"],
  },
  {
    id: "auto_trailer_damage",
    line: "auto",
    label: "Trailer damage",
    plainEnglish: "Can help pay to fix or replace a utility trailer if it is damaged or stolen.",
    tier: "recommended",
    protects: ["utility_trailer"],
    deductibleOptions: opts(["250", "$250"], ["500", "$500"], ["1000", "$1,000"]),
  },

  // =========================================================================
  // CLASSIC / COLLECTOR CARS
  // =========================================================================
  {
    id: "collector_physical_damage",
    line: "collector_vehicle",
    label: "Classic car damage",
    plainEnglish: "Can help pay to fix or replace your classic car after a crash, fire, theft or storm.",
    tier: "essential",
    protects: ["classic_car"],
  },
  {
    id: "collector_agreed_value",
    line: "collector_vehicle",
    label: "Agreed value",
    plainEnglish:
      "You and the insurance company agree on your car's value up front. That means less guessing later.",
    tier: "essential",
    protects: ["classic_car"],
    requires: ["collector_physical_damage"],
  },
  {
    id: "collector_liability",
    line: "collector_vehicle",
    label: "Classic car liability",
    plainEnglish:
      "Can help pay if you hurt someone or damage their property while driving your classic car. Some companies also want your everyday car insured.",
    tier: "recommended",
    protects: ["classic_car"],
    limitOptions: LIABILITY_LIMITS,
  },
  {
    id: "collector_spare_parts",
    line: "collector_vehicle",
    label: "Spare parts & tools",
    plainEnglish: "Can help pay for extra parts, tools and your car cover if they are stolen or damaged.",
    tier: "extra",
    protects: ["classic_car"],
  },
  {
    id: "collector_towing",
    line: "collector_vehicle",
    label: "Flatbed towing",
    plainEnglish: "Can help pay to tow your classic car on a flatbed if it breaks down or is damaged in a crash.",
    tier: "extra",
    protects: ["classic_car"],
  },

  // =========================================================================
  // MOTORCYCLE
  // =========================================================================
  {
    id: "moto_liability",
    line: "motorcycle",
    label: "Motorcycle liability",
    plainEnglish:
      "Can help pay for other people's injuries and property damage if you cause a crash. Rules vary by state.",
    tier: "essential",
    protects: ["motorcycle"],
    limitOptions: opts(
      ["25_50_25", "$25,000 / $50,000 / $25,000"],
      ["50_100_50", "$50,000 / $100,000 / $50,000"],
      ["100_300_100", "$100,000 / $300,000 / $100,000"],
      ["250_500_100", "$250,000 / $500,000 / $100,000"],
    ),
  },
  {
    id: "moto_collision",
    line: "motorcycle",
    label: "Motorcycle collision",
    plainEnglish: "Can help pay to fix your bike after a crash or if you hit something.",
    tier: "essential",
    protects: ["motorcycle"],
    deductibleOptions: DEDUCTIBLES_SMALL,
  },
  {
    id: "moto_comprehensive",
    line: "motorcycle",
    label: "Theft & other damage",
    plainEnglish: "Can help pay if your bike is stolen or damaged by things like fire, vandalism or a storm.",
    tier: "essential",
    protects: ["motorcycle"],
    deductibleOptions: opts(["100", "$100"], ["250", "$250"], ["500", "$500"], ["1000", "$1,000"]),
  },
  {
    id: "moto_uninsured",
    line: "motorcycle",
    label: "Uninsured driver",
    plainEnglish: "Can help pay your medical bills if the other driver has no insurance, or not enough.",
    tier: "recommended",
    protects: ["motorcycle"],
  },
  {
    id: "moto_med_pay",
    line: "motorcycle",
    label: "Medical payments",
    plainEnglish: "Can help pay medical bills for you and a passenger after a crash, no matter who caused it.",
    tier: "recommended",
    protects: ["motorcycle"],
    limitOptions: MED_PAY_SMALL,
  },
  {
    id: "moto_accessories",
    line: "motorcycle",
    label: "Custom parts & accessories",
    plainEnglish: "Can help pay for add-ons like custom seats, saddlebags, chrome and sound systems.",
    tier: "recommended",
    protects: ["motorcycle"],
    limitOptions: opts(["1000", "$1,000"], ["2500", "$2,500"], ["5000", "$5,000"], ["10000", "$10,000"]),
  },
  {
    id: "moto_gear",
    line: "motorcycle",
    label: "Helmet & riding gear",
    plainEnglish: "Can help pay to replace your helmet, jacket and other riding gear after a crash or theft.",
    tier: "extra",
    protects: ["motorcycle"],
  },
  {
    id: "moto_roadside",
    line: "motorcycle",
    label: "Roadside help",
    plainEnglish: "Can help pay for a tow, a flat tire or a dead battery.",
    tier: "extra",
    protects: ["motorcycle"],
  },

  // =========================================================================
  // RECREATIONAL (ATV/UTV, snowmobile, golf cart, dirt bike) + e-bikes, drones
  // =========================================================================
  {
    id: "rec_liability",
    line: "recreational",
    label: "Liability",
    plainEnglish:
      "Can help pay if you hurt someone or damage their property while riding. Home and car policies often leave this out.",
    tier: "essential",
    protects: ["atv_utv", "snowmobile", "golf_cart", "dirt_bike"],
    limitOptions: LIABILITY_LIMITS,
  },
  {
    id: "rec_collision",
    line: "recreational",
    label: "Crash damage",
    plainEnglish: "Can help pay to fix your ride after a crash, a rollover or if you hit something.",
    tier: "recommended",
    protects: ["atv_utv", "snowmobile", "golf_cart", "dirt_bike"],
    deductibleOptions: opts(["250", "$250"], ["500", "$500"], ["1000", "$1,000"]),
  },
  {
    id: "rec_comprehensive",
    line: "recreational",
    label: "Theft & other damage",
    plainEnglish: "Can help pay if your ride is stolen or damaged by fire, a storm or vandalism.",
    tier: "recommended",
    protects: ["atv_utv", "snowmobile", "golf_cart", "dirt_bike"],
    deductibleOptions: opts(["100", "$100"], ["250", "$250"], ["500", "$500"], ["1000", "$1,000"]),
  },
  {
    id: "rec_med_pay",
    line: "recreational",
    label: "Medical payments",
    plainEnglish: "Can help pay medical bills for you and your riders after an accident.",
    tier: "recommended",
    protects: ["atv_utv", "snowmobile", "golf_cart", "dirt_bike"],
    limitOptions: MED_PAY_SMALL,
  },
  {
    id: "rec_guest_passenger",
    line: "recreational",
    label: "Guest passenger liability",
    plainEnglish: "Can help pay if a friend riding along with you gets hurt.",
    tier: "recommended",
    protects: ["atv_utv", "snowmobile", "golf_cart"],
  },
  {
    id: "rec_accessories",
    line: "recreational",
    label: "Accessories & add-ons",
    plainEnglish: "Can help pay for extras like a winch, plow, cab, lights or a cover.",
    tier: "extra",
    protects: ["atv_utv", "snowmobile", "golf_cart", "dirt_bike"],
    limitOptions: opts(["1000", "$1,000"], ["2500", "$2,500"], ["5000", "$5,000"]),
  },
  {
    id: "rec_roadside",
    line: "recreational",
    label: "Towing & trail recovery",
    plainEnglish: "Can help pay to tow you or pull you out if you break down or get stuck.",
    tier: "extra",
    protects: ["atv_utv", "snowmobile", "dirt_bike"],
  },
  {
    id: "rec_ebike_liability",
    line: "recreational",
    label: "E-bike liability",
    plainEnglish:
      "Can help pay if you hurt someone or damage their things while riding your e-bike or scooter. Home policies often limit this.",
    tier: "recommended",
    protects: ["ebike_scooter"],
  },
  {
    id: "rec_drone_liability",
    line: "recreational",
    label: "Drone liability",
    plainEnglish:
      "Can help pay if your drone hurts someone or damages their property. Home policies often limit this.",
    tier: "recommended",
    protects: ["drone"],
  },

  // =========================================================================
  // BOATS & JET SKIS
  // =========================================================================
  {
    id: "water_hull",
    line: "watercraft",
    label: "Boat or jet ski damage",
    plainEnglish: "Can help pay to fix or replace your boat or jet ski, its motor and trailer after damage or theft.",
    tier: "essential",
    protects: ["boat", "pwc"],
    deductibleOptions: opts(["250", "$250"], ["500", "$500"], ["1000", "$1,000"], ["1pct", "1% of its value"]),
  },
  {
    id: "water_liability",
    line: "watercraft",
    label: "Boating liability",
    plainEnglish:
      "Can help pay if someone is hurt, or their property is damaged, because of your boat or jet ski.",
    tier: "essential",
    protects: ["boat", "pwc"],
    limitOptions: LIABILITY_LIMITS,
  },
  {
    id: "water_med_pay",
    line: "watercraft",
    label: "Boating medical payments",
    plainEnglish: "Can help pay medical bills for you and your passengers if someone is hurt on board.",
    tier: "recommended",
    protects: ["boat", "pwc"],
    limitOptions: opts(["1000", "$1,000"], ["5000", "$5,000"], ["10000", "$10,000"]),
  },
  {
    id: "water_towing",
    line: "watercraft",
    label: "On-water towing",
    plainEnglish: "Can help pay to tow your boat or jet ski if it breaks down or runs out of fuel on the water.",
    tier: "recommended",
    protects: ["boat", "pwc"],
  },
  {
    id: "water_fuel_spill",
    line: "watercraft",
    label: "Fuel spill cleanup",
    plainEnglish: "Can help pay to clean up if fuel spills from your boat into the water.",
    tier: "extra",
    protects: ["boat", "pwc"],
  },
  {
    id: "water_wreck_removal",
    line: "watercraft",
    label: "Wreck removal",
    plainEnglish: "Can help pay to raise or remove your boat if it sinks.",
    tier: "extra",
    protects: ["boat", "pwc"],
  },
  {
    id: "water_uninsured",
    line: "watercraft",
    label: "Uninsured boater",
    plainEnglish: "Can help pay your medical bills if another boater hurts you and has no insurance.",
    tier: "extra",
    protects: ["boat", "pwc"],
  },
  {
    id: "water_effects",
    line: "watercraft",
    label: "Gear & personal items",
    plainEnglish: "Can help pay for things on board, like fishing gear, skis, life jackets and electronics.",
    tier: "extra",
    protects: ["boat"],
    limitOptions: opts(["1000", "$1,000"], ["2500", "$2,500"], ["5000", "$5,000"]),
  },

  // =========================================================================
  // RVs & CAMPERS
  // =========================================================================
  {
    id: "rv_physical_damage",
    line: "rv",
    label: "RV damage",
    plainEnglish: "Can help pay to fix or replace your motorhome or camper after a crash, fire, storm or theft.",
    tier: "essential",
    protects: ["motorhome", "travel_trailer"],
    deductibleOptions: opts(["500", "$500"], ["1000", "$1,000"], ["2500", "$2,500"]),
  },
  {
    id: "rv_liability",
    line: "rv",
    label: "Motorhome liability",
    plainEnglish: "Can help pay if you cause a crash and other people are hurt or their things are damaged.",
    tier: "essential",
    protects: ["motorhome"],
    limitOptions: LIABILITY_LIMITS,
  },
  {
    id: "rv_vacation_liability",
    line: "rv",
    label: "Campsite liability",
    plainEnglish: "Can help pay if someone is hurt or something is damaged while your RV is parked at a campsite.",
    tier: "recommended",
    protects: ["motorhome", "travel_trailer"],
    limitOptions: opts(["100k", "$100,000"], ["300k", "$300,000"], ["500k", "$500,000"]),
  },
  {
    id: "rv_contents",
    line: "rv",
    label: "Belongings inside",
    plainEnglish: "Can help pay for your things inside the RV, like clothes, dishes and camping gear.",
    tier: "recommended",
    protects: ["motorhome", "travel_trailer"],
    limitOptions: opts(["1000", "$1,000"], ["5000", "$5,000"], ["10000", "$10,000"]),
  },
  {
    id: "rv_full_timer",
    line: "rv",
    label: "Full-time RV living",
    plainEnglish:
      "If you live in your RV most of the year, a policy that works more like a home policy may fit better.",
    tier: "recommended",
    protects: ["motorhome", "travel_trailer"],
  },
  {
    id: "rv_emergency_expense",
    line: "rv",
    label: "Trip help if you break down",
    plainEnglish: "Can help pay for a hotel, meals and travel home if your RV is damaged far from home.",
    tier: "extra",
    protects: ["motorhome", "travel_trailer"],
  },
  {
    id: "rv_accessories",
    line: "rv",
    label: "Awnings & built-in extras",
    plainEnglish:
      "Can help pay for things attached to your RV, like an awning, satellite dish, solar panels or custom paint.",
    tier: "extra",
    protects: ["motorhome", "travel_trailer"],
  },

  // =========================================================================
  // VALUABLES (listed by name)
  //
  // Accuracy note: this is "scheduled personal property" / an inland marine
  // floater. Listed items are commonly covered for loss, including "mysterious
  // disappearance", and often carry no deductible, but forms differ by company.
  // The text says "often" and sends people to Loomis on purpose.
  // =========================================================================
  {
    id: "val_jewelry",
    line: "valuables",
    label: "Jewelry, listed by name",
    plainEnglish:
      "Lists each piece by name, so it counts at its full value. It can often help pay even if a piece is lost, often with no deductible. Ask Loomis.",
    tier: "recommended",
    protects: ["jewelry"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_watch",
    line: "valuables",
    label: "Watches, listed by name",
    plainEnglish:
      "Lists each watch by name, so it counts at its full value. It can often help pay even if a watch is lost, often with no deductible. Ask Loomis.",
    tier: "recommended",
    protects: ["watch"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_art",
    line: "valuables",
    label: "Art, listed by name",
    plainEnglish:
      "Lists each piece of art by name, so it counts at its full value. It can often help pay for damage, even from an accident at home. Ask Loomis.",
    tier: "recommended",
    protects: ["fine_art"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_collectibles",
    line: "valuables",
    label: "Collectibles, listed by name",
    plainEnglish:
      "Lists coins, stamps, cards or memorabilia so they count at their full value. It can often help pay even if one goes missing. Ask Loomis.",
    tier: "recommended",
    protects: ["collectibles"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_firearms",
    line: "valuables",
    label: "Firearms, listed by name",
    plainEnglish:
      "Lists each firearm by name, so it counts at its full value. It can often help pay if one is stolen or lost. Ask Loomis.",
    tier: "recommended",
    protects: ["firearm"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_instruments",
    line: "valuables",
    label: "Instruments, listed by name",
    plainEnglish:
      "Lists each instrument by name, so it counts at its full value, even when you take it out of the house. It can often help pay if it is lost. Ask Loomis.",
    tier: "recommended",
    protects: ["musical_instrument"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_cameras",
    line: "valuables",
    label: "Camera gear, listed by name",
    plainEnglish:
      "Lists your camera and lenses by name, so they count at their full value, even on trips. It can often help pay if something is lost. Ask Loomis.",
    tier: "recommended",
    protects: ["camera_gear"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_sports",
    line: "valuables",
    label: "Sports gear, listed by name",
    plainEnglish:
      "Lists things like golf clubs or skis by name, so they count at their full value. It can often help pay if they are lost or stolen. Ask Loomis.",
    tier: "extra",
    protects: ["sports_gear"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_silverware",
    line: "valuables",
    label: "Silverware, listed by name",
    plainEnglish:
      "Lists your silver by name, so it counts at its full value. It can often help pay if it is lost, stolen or damaged. Ask Loomis.",
    tier: "extra",
    protects: ["silverware"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_bicycle",
    line: "valuables",
    label: "Bicycles, listed by name",
    plainEnglish:
      "Lists your bike by name, so it counts at its full value. It can often help pay if it is stolen, even away from home. Ask Loomis.",
    tier: "recommended",
    protects: ["high_end_bicycle"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_ebike",
    line: "valuables",
    label: "E-bike or scooter",
    plainEnglish:
      "Home and car policies often limit e-bikes and scooters. This can help pay if yours is stolen or damaged. Ask Loomis about the right fit.",
    tier: "recommended",
    protects: ["ebike_scooter"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },
  {
    id: "val_drone",
    line: "valuables",
    label: "Drone coverage",
    plainEnglish:
      "Home policies often limit drones. This can help pay if your drone is lost, stolen or crashes. Ask Loomis about the right fit.",
    tier: "recommended",
    protects: ["drone"],
    deductibleOptions: VALUABLES_DEDUCTIBLES,
  },

  // =========================================================================
  // PET HEALTH
  // =========================================================================
  {
    id: "pet_accident_illness",
    line: "pet",
    label: "Accident & illness",
    plainEnglish:
      "Can help pay vet bills when your pet is hurt or gets sick. Not every company offers plans for every kind of pet, so ask Loomis.",
    tier: "recommended",
    protects: ["dog", "cat", "bird_exotic", "other_pet"],
    limitOptions: opts(["5000", "$5,000 a year"], ["10000", "$10,000 a year"], ["15000", "$15,000 a year"], ["unlimited", "No yearly limit"]),
    deductibleOptions: opts(["100", "$100"], ["250", "$250"], ["500", "$500"], ["1000", "$1,000"]),
  },
  {
    id: "pet_accident_only",
    line: "pet",
    label: "Accident only",
    plainEnglish:
      "A lower-cost plan that can help pay vet bills if your pet is hurt, like a broken leg. It does not help with sickness.",
    tier: "extra",
    protects: ["dog", "cat"],
    limitOptions: opts(["5000", "$5,000 a year"], ["10000", "$10,000 a year"]),
  },
  {
    id: "pet_wellness",
    line: "pet",
    label: "Wellness add-on",
    plainEnglish: "Can help pay for regular care, like shots, checkups and teeth cleaning.",
    tier: "extra",
    protects: ["dog", "cat"],
  },
  {
    id: "pet_equine_medical",
    line: "pet",
    label: "Horse vet bills",
    plainEnglish: "Can help pay big vet bills for your horse, like emergency visits and surgery.",
    tier: "recommended",
    protects: ["horse"],
  },
  {
    id: "pet_equine_mortality",
    line: "pet",
    label: "Horse value protection",
    plainEnglish: "Can help pay you the value of your horse if it is lost to illness, an accident or theft.",
    tier: "extra",
    protects: ["horse"],
  },

  // =========================================================================
  // HOME (owned house, vacation home, mobile home) + home systems
  // =========================================================================
  {
    id: "home_dwelling",
    line: "home",
    label: "Your house",
    plainEnglish:
      "Can help pay to fix or rebuild your house after things like fire or wind. A mortgage lender usually asks for this.",
    tier: "essential",
    protects: OWNED_HOMES,
    deductibleOptions: opts(
      ["500", "$500"],
      ["1000", "$1,000"],
      ["2500", "$2,500"],
      ["5000", "$5,000"],
      ["1pct", "1% of home coverage"],
      ["2pct", "2% of home coverage"],
    ),
  },
  {
    id: "home_other_structures",
    line: "home",
    label: "Garage, shed & fence",
    plainEnglish: "Can help pay to fix buildings and fences that are not attached to your house.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "mobile_home", "other_structure"],
    limitOptions: opts(["10pct", "10% of home coverage"], ["20pct", "20% of home coverage"], ["30pct", "30% of home coverage"]),
  },
  {
    id: "home_personal_property",
    line: "home",
    label: "Your belongings",
    plainEnglish:
      "Can help pay to replace your things, like furniture, clothes and TVs, if they are stolen or damaged.",
    tier: "essential",
    protects: [...OWNED_HOMES, "mobile_home", "inventory_item"],
    limitOptions: opts(
      ["50pct", "50% of home coverage"],
      ["60pct", "60% of home coverage"],
      ["70pct", "70% of home coverage"],
      ["100pct", "100% of home coverage"],
    ),
  },
  {
    id: "home_contents_replacement",
    line: "home",
    label: "Belongings at new cost",
    plainEnglish: "Can help pay what a new item costs to buy, not what your old one is worth today.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "mobile_home", "inventory_item"],
    requires: ["home_personal_property"],
  },
  {
    id: "home_loss_of_use",
    line: "home",
    label: "Extra living costs",
    plainEnglish: "Can help pay for a hotel and meals if you cannot live at home while it is being fixed.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "mobile_home"],
    limitOptions: opts(["20pct", "20% of home coverage"], ["30pct", "30% of home coverage"], ["40pct", "40% of home coverage"]),
  },
  {
    id: "home_liability",
    line: "home",
    label: "Personal liability",
    plainEnglish:
      "Can help pay if someone is hurt at your home, or you accidentally damage their things, and they ask you to pay.",
    tier: "essential",
    protects: [...OWNED_HOMES, "mobile_home"],
    limitOptions: opts(["100k", "$100,000"], ["300k", "$300,000"], ["500k", "$500,000"]),
  },
  {
    id: "home_med_pay",
    line: "home",
    label: "Guest medical payments",
    plainEnglish: "Can help pay a guest's small medical bills if they are hurt at your home, no matter who is at fault.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "mobile_home"],
    limitOptions: opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"]),
  },
  {
    id: "home_extended_replacement",
    line: "home",
    label: "Extended replacement cost",
    plainEnglish:
      "Can help pay more than your limit if building costs jump after a big storm. Some companies offer to pay the full rebuild cost.",
    tier: "recommended",
    protects: OWNED_HOMES,
    requires: ["home_dwelling"],
    limitOptions: opts(
      ["25pct", "25% extra"],
      ["50pct", "50% extra"],
      ["full", "Full rebuild cost (if offered)"],
    ),
  },
  {
    id: "home_ordinance_law",
    line: "home",
    label: "Code upgrade costs",
    plainEnglish:
      "Can help pay extra when building rules make you upgrade things, like wiring or stairs, while your home is repaired.",
    tier: "recommended",
    protects: OWNED_HOMES,
    requires: ["home_dwelling"],
    limitOptions: opts(["10pct", "10% of home coverage"], ["25pct", "25% of home coverage"], ["50pct", "50% of home coverage"]),
  },
  {
    id: "home_roof_replacement_cost",
    line: "home",
    label: "Roof at new-roof cost",
    plainEnglish:
      "Some policies pay less for an older roof because they take off money for its age. This can help pay for a whole new roof instead.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "roof"],
  },
  {
    id: "home_wind_hail_deductible",
    line: "home",
    label: "Wind & hail deductible",
    plainEnglish:
      "Many homes have a separate, higher deductible for wind and hail, often a percent of your home's coverage. Ask Loomis about your options.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "mobile_home", "roof"],
    deductibleOptions: opts(
      ["1000", "$1,000"],
      ["2500", "$2,500"],
      ["1pct", "1% of home coverage"],
      ["2pct", "2% of home coverage"],
      ["5pct", "5% of home coverage"],
    ),
  },
  {
    id: "home_water_backup",
    line: "home",
    label: "Water backup & sump overflow",
    plainEnglish: "Can help pay when a sewer, drain or sump pump backs up and water comes into your home.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "sump_pump"],
    limitOptions: opts(["5000", "$5,000"], ["10000", "$10,000"], ["25000", "$25,000"]),
  },
  {
    id: "home_service_line",
    line: "home",
    label: "Buried utility lines",
    plainEnglish: "Can help pay to fix underground water, sewer, gas or power lines that serve your home.",
    tier: "recommended",
    protects: [...OWNED_HOMES, "well_septic"],
    limitOptions: opts(["10000", "$10,000"], ["25000", "$25,000"]),
  },
  {
    id: "home_equipment_breakdown",
    line: "home",
    label: "Equipment breakdown",
    plainEnglish:
      "Can help pay to fix or replace systems like a furnace, AC or water heater when they suddenly break down.",
    tier: "recommended",
    protects: [
      ...OWNED_HOMES,
      "mobile_home",
      "furnace",
      "central_air",
      "water_heater",
      "electrical_panel",
      "sump_pump",
      "well_septic",
      "solar_panels",
      "generator",
    ],
  },
  {
    id: "home_solar_panels",
    line: "home",
    label: "Solar panels",
    plainEnglish:
      "Can help pay to fix or replace solar panels you own. If you lease them, check who is in charge of the insurance.",
    tier: "recommended",
    protects: ["solar_panels"],
  },
  {
    id: "home_sharing",
    line: "home",
    label: "Airbnb & VRBO hosting",
    plainEnglish:
      "Can help pay when you rent your home or a room to guests. Regular home policies often limit this, so ask Loomis.",
    tier: "recommended",
    protects: OWNED_HOMES,
  },
  {
    id: "home_business",
    line: "home",
    label: "Home business add-on",
    plainEnglish:
      "Can help pay for business gear at home and for visitors who come for work. Regular home policies often have small limits for this.",
    tier: "recommended",
    protects: ["house_owned", "mobile_home"],
  },
  {
    id: "mobile_home_dwelling",
    line: "home",
    label: "Mobile home & attachments",
    plainEnglish:
      "Can help pay to fix or replace your mobile home and things attached to it, like steps, skirting and decks.",
    tier: "essential",
    protects: ["mobile_home"],
    deductibleOptions: opts(["500", "$500"], ["1000", "$1,000"], ["2500", "$2,500"]),
  },

  // =========================================================================
  // CONDO
  // =========================================================================
  {
    id: "condo_walls_in",
    line: "condo",
    label: "Inside your unit",
    plainEnglish: "Can help pay to fix what is inside your walls, like floors, cabinets and fixtures.",
    tier: "essential",
    protects: ["condo_owned"],
    deductibleOptions: opts(["500", "$500"], ["1000", "$1,000"], ["2500", "$2,500"]),
  },
  {
    id: "condo_upgrades",
    line: "condo",
    label: "Upgrades you made",
    plainEnglish:
      "Can help pay for upgrades you added, like new counters or floors, if your condo group's policy leaves them out.",
    tier: "recommended",
    protects: ["condo_owned"],
    requires: ["condo_walls_in"],
  },
  {
    id: "condo_belongings",
    line: "condo",
    label: "Your belongings",
    plainEnglish:
      "Can help pay to replace your things, like furniture, clothes and TVs, if they are stolen or damaged.",
    tier: "essential",
    protects: ["condo_owned", "inventory_item"],
    limitOptions: opts(["25k", "$25,000"], ["50k", "$50,000"], ["75k", "$75,000"], ["100k", "$100,000"]),
  },
  {
    id: "condo_contents_replacement",
    line: "condo",
    label: "Belongings at new cost",
    plainEnglish: "Can help pay what a new item costs to buy, not what your old one is worth today.",
    tier: "recommended",
    protects: ["condo_owned", "inventory_item"],
    requires: ["condo_belongings"],
  },
  {
    id: "condo_loss_of_use",
    line: "condo",
    label: "Extra living costs",
    plainEnglish: "Can help pay for a hotel and meals if you cannot live in your condo while it is being fixed.",
    tier: "recommended",
    protects: ["condo_owned"],
  },
  {
    id: "condo_liability",
    line: "condo",
    label: "Personal liability",
    plainEnglish:
      "Can help pay if someone is hurt in your condo, or you accidentally damage their things, and they ask you to pay.",
    tier: "essential",
    protects: ["condo_owned"],
    limitOptions: opts(["100k", "$100,000"], ["300k", "$300,000"], ["500k", "$500,000"]),
  },
  {
    id: "condo_med_pay",
    line: "condo",
    label: "Guest medical payments",
    plainEnglish: "Can help pay a guest's small medical bills if they are hurt in your condo, no matter who is at fault.",
    tier: "recommended",
    protects: ["condo_owned"],
    limitOptions: opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"]),
  },
  {
    id: "condo_loss_assessment",
    line: "condo",
    label: "Condo group charges",
    plainEnglish:
      "Can help pay your share if your condo group bills owners for a big repair or a lawsuit.",
    tier: "recommended",
    protects: ["condo_owned"],
    limitOptions: opts(["10000", "$10,000"], ["25000", "$25,000"], ["50000", "$50,000"]),
  },

  // =========================================================================
  // RENTERS (also used for a student's college housing)
  // =========================================================================
  {
    id: "renters_belongings",
    line: "renters",
    label: "Your belongings",
    plainEnglish:
      "Can help pay to replace your things, like furniture, clothes and a laptop, if they are stolen or damaged. Your landlord's policy is usually for the building only.",
    tier: "essential",
    protects: ["home_rented", "college_housing", "inventory_item"],
    limitOptions: opts(["10k", "$10,000"], ["25k", "$25,000"], ["50k", "$50,000"]),
  },
  {
    id: "renters_replacement_cost",
    line: "renters",
    label: "Belongings at new cost",
    plainEnglish: "Can help pay what a new item costs to buy, not what your old one is worth today.",
    tier: "recommended",
    protects: ["home_rented", "college_housing", "inventory_item"],
    requires: ["renters_belongings"],
  },
  {
    id: "renters_liability",
    line: "renters",
    label: "Personal liability",
    plainEnglish:
      "Can help pay if someone is hurt in your place, or you accidentally damage the building or their things.",
    tier: "essential",
    protects: ["home_rented", "college_housing"],
    limitOptions: opts(["100k", "$100,000"], ["300k", "$300,000"], ["500k", "$500,000"]),
  },
  {
    id: "renters_loss_of_use",
    line: "renters",
    label: "Extra living costs",
    plainEnglish: "Can help pay for a hotel and meals if you cannot live in your place while it is being fixed.",
    tier: "recommended",
    protects: ["home_rented", "college_housing"],
  },
  {
    id: "renters_med_pay",
    line: "renters",
    label: "Guest medical payments",
    plainEnglish: "Can help pay a guest's small medical bills if they are hurt at your place, no matter who is at fault.",
    tier: "recommended",
    protects: ["home_rented", "college_housing"],
    limitOptions: opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"]),
  },

  // =========================================================================
  // LANDLORD (a home you rent out)
  // =========================================================================
  {
    id: "landlord_dwelling",
    line: "landlord",
    label: "Rental building",
    plainEnglish: "Can help pay to fix or rebuild a home you rent out after things like fire or wind.",
    tier: "essential",
    protects: ["landlord_property"],
    deductibleOptions: opts(["500", "$500"], ["1000", "$1,000"], ["2500", "$2,500"], ["5000", "$5,000"]),
  },
  {
    id: "landlord_other_structures",
    line: "landlord",
    label: "Garage, shed & fence",
    plainEnglish: "Can help pay to fix buildings and fences at your rental that are not attached to the main building.",
    tier: "recommended",
    protects: ["landlord_property", "other_structure"],
  },
  {
    id: "landlord_contents",
    line: "landlord",
    label: "Your stuff in the rental",
    plainEnglish:
      "Can help pay for things you own and provide, like appliances and furniture. Your renters' own things are theirs to insure.",
    tier: "recommended",
    protects: ["landlord_property", "inventory_item"],
  },
  {
    id: "landlord_lost_rent",
    line: "landlord",
    label: "Lost rent",
    plainEnglish: "Can help replace the rent you would miss if a fire or storm makes your rental unlivable.",
    tier: "recommended",
    protects: ["landlord_property"],
  },
  {
    id: "landlord_liability",
    line: "landlord",
    label: "Landlord liability",
    plainEnglish:
      "Can help pay if someone is hurt at your rental, or their things are damaged, and they ask you to pay.",
    tier: "essential",
    protects: ["landlord_property"],
    limitOptions: opts(["100k", "$100,000"], ["300k", "$300,000"], ["500k", "$500,000"]),
  },
  {
    id: "landlord_med_pay",
    line: "landlord",
    label: "Guest medical payments",
    plainEnglish: "Can help pay a guest's small medical bills if they are hurt at your rental, no matter who is at fault.",
    tier: "extra",
    protects: ["landlord_property"],
    limitOptions: opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"]),
  },
  {
    id: "landlord_short_term",
    line: "landlord",
    label: "Short-term rental hosting",
    plainEnglish:
      "Can help pay when you rent by the night on sites like Airbnb or VRBO. Long-term rental policies often work differently.",
    tier: "recommended",
    protects: ["landlord_property"],
  },

  // =========================================================================
  // FLOOD
  // =========================================================================
  {
    id: "flood_building",
    line: "flood",
    label: "Flood: your home",
    plainEnglish:
      "Can help pay to fix your home after flood water. Home policies usually do not include flood, and there is often a 30-day wait before it starts, so it helps to ask early.",
    tier: "recommended",
    protects: ["house_owned", "vacation_home", "mobile_home", "condo_owned", "landlord_property"],
    limitOptions: opts(["100k", "$100,000"], ["150k", "$150,000"], ["250k", "$250,000"]),
    deductibleOptions: opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"], ["10000", "$10,000"]),
  },
  {
    id: "flood_contents",
    line: "flood",
    label: "Flood: your belongings",
    plainEnglish: "Can help pay to replace your things after flood water. Renters can add this too.",
    tier: "recommended",
    protects: ["house_owned", "vacation_home", "mobile_home", "condo_owned", "home_rented", "landlord_property"],
    limitOptions: opts(["25k", "$25,000"], ["50k", "$50,000"], ["100k", "$100,000"]),
    deductibleOptions: opts(["1000", "$1,000"], ["2000", "$2,000"], ["5000", "$5,000"]),
  },
  {
    id: "flood_excess",
    line: "flood",
    label: "Extra flood limit",
    plainEnglish:
      "Can help pay more when your home would cost more to fix than the usual $250,000 flood limit.",
    tier: "extra",
    protects: OWNED_HOMES,
    limitOptions: opts(["100k", "$100,000 extra"], ["250k", "$250,000 extra"], ["500k", "$500,000 extra"]),
  },

  // =========================================================================
  // EARTHQUAKE
  // =========================================================================
  {
    id: "eq_dwelling",
    line: "earthquake",
    label: "Earthquake: your home",
    plainEnglish: "Can help pay to fix your home after an earthquake. Home policies usually do not include this.",
    tier: "extra",
    protects: ["house_owned", "vacation_home", "mobile_home", "condo_owned", "landlord_property"],
    deductibleOptions: opts(["5pct", "5% of home coverage"], ["10pct", "10% of home coverage"], ["15pct", "15% of home coverage"], ["20pct", "20% of home coverage"]),
  },
  {
    id: "eq_contents",
    line: "earthquake",
    label: "Earthquake: belongings",
    plainEnglish: "Can help pay to replace your things after an earthquake. Renters can add this too.",
    tier: "extra",
    protects: ["house_owned", "vacation_home", "mobile_home", "condo_owned", "home_rented", "landlord_property"],
  },
  {
    id: "eq_loss_of_use",
    line: "earthquake",
    label: "Earthquake: living costs",
    plainEnglish: "Can help pay for a hotel and meals if an earthquake keeps you out of your home.",
    tier: "extra",
    protects: [...OWNED_HOMES, "mobile_home", "condo_owned"],
  },

  // =========================================================================
  // UMBRELLA (the whole household)
  // =========================================================================
  {
    id: "umbrella_personal",
    line: "umbrella",
    label: "Personal umbrella",
    plainEnglish:
      "Adds extra liability on top of your car and home policies. It can help pay when a big claim goes past their limits.",
    tier: "recommended",
    protects: ["household"],
    limitOptions: opts(
      ["1m", "$1,000,000"],
      ["2m", "$2,000,000"],
      ["3m", "$3,000,000"],
      ["4m", "$4,000,000"],
      ["5m", "$5,000,000"],
    ),
  },
  {
    id: "umbrella_uninsured",
    line: "umbrella",
    label: "Umbrella: uninsured driver",
    plainEnglish:
      "Adds extra help with your injuries if a driver with little or no insurance hurts you. Not offered everywhere.",
    tier: "extra",
    protects: ["household"],
    requires: ["umbrella_personal"],
  },

  // =========================================================================
  // LIFE (protects a person)
  // =========================================================================
  {
    id: "life_term",
    line: "life",
    label: "Term life",
    plainEnglish:
      "Can help your family pay bills and keep their home if you pass away during the years you pick. Often the most affordable choice.",
    tier: "essential",
    protects: ["person"],
    limitOptions: opts(
      ["100k", "$100,000"],
      ["250k", "$250,000"],
      ["500k", "$500,000"],
      ["750k", "$750,000"],
      ["1m", "$1,000,000"],
      ["2m", "$2,000,000"],
    ),
  },
  {
    id: "life_mortgage_protection",
    line: "life",
    label: "Mortgage protection term",
    plainEnglish:
      "A term policy that can help your family pay off the home loan if you pass away while it is still owed.",
    tier: "recommended",
    protects: ["person"],
    limitOptions: opts(["100k", "$100,000"], ["200k", "$200,000"], ["300k", "$300,000"], ["400k", "$400,000"], ["500k", "$500,000"]),
  },
  {
    id: "life_whole",
    line: "life",
    label: "Whole life",
    plainEnglish: "Lasts your whole life and builds cash value you can borrow from. It costs more than term.",
    tier: "extra",
    protects: ["person"],
    limitOptions: opts(["25k", "$25,000"], ["50k", "$50,000"], ["100k", "$100,000"], ["250k", "$250,000"], ["500k", "$500,000"]),
  },
  {
    id: "life_universal",
    line: "life",
    label: "Universal life",
    plainEnglish: "Lasts your whole life, with payments you can adjust over time. Some types build cash value.",
    tier: "extra",
    protects: ["person"],
    limitOptions: opts(["100k", "$100,000"], ["250k", "$250,000"], ["500k", "$500,000"], ["1m", "$1,000,000"]),
  },
  {
    id: "life_final_expense",
    line: "life",
    label: "Final expense",
    plainEnglish: "A small policy to help your family pay for funeral costs. Often simpler to apply for.",
    tier: "recommended",
    protects: ["person"],
    limitOptions: opts(["5k", "$5,000"], ["10k", "$10,000"], ["15k", "$15,000"], ["25k", "$25,000"]),
  },
  {
    id: "life_child",
    line: "life",
    label: "Child life",
    plainEnglish:
      "A small policy on a child. Some include the right to buy more coverage later as they grow up.",
    tier: "extra",
    protects: ["person"],
    limitOptions: opts(["10k", "$10,000"], ["25k", "$25,000"], ["50k", "$50,000"]),
  },

  // =========================================================================
  // DISABILITY
  // =========================================================================
  {
    id: "disability_short_term",
    line: "disability",
    label: "Short-term disability",
    plainEnglish:
      "Can help replace part of your paycheck for a few months if illness or an injury keeps you from working.",
    tier: "recommended",
    protects: ["person"],
    limitOptions: opts(["50pct", "50% of pay"], ["60pct", "60% of pay"], ["70pct", "70% of pay"]),
  },
  {
    id: "disability_long_term",
    line: "disability",
    label: "Long-term disability",
    plainEnglish:
      "Can help replace part of your paycheck for years if illness or an injury keeps you from working.",
    tier: "recommended",
    protects: ["person"],
    limitOptions: opts(["50pct", "50% of pay"], ["60pct", "60% of pay"], ["66pct", "66% of pay"]),
  },

  // =========================================================================
  // LONG-TERM CARE
  // =========================================================================
  {
    id: "ltc_traditional",
    line: "long_term_care",
    label: "Long-term care",
    plainEnglish:
      "Can help pay for care with daily life, like home care, assisted living or a nursing home. It is for when you cannot do things on your own.",
    tier: "recommended",
    protects: ["person"],
    limitOptions: opts(["3000", "$3,000 a month"], ["4500", "$4,500 a month"], ["6000", "$6,000 a month"], ["8000", "$8,000 a month"]),
  },
  {
    id: "ltc_hybrid",
    line: "long_term_care",
    label: "Life + long-term care",
    plainEnglish:
      "A life insurance policy with long-term care built in. If you never need care, your family can still receive a benefit.",
    tier: "extra",
    protects: ["person"],
  },

  // =========================================================================
  // HEALTH, MEDICARE, DENTAL & VISION, EXTRA HEALTH PLANS
  // =========================================================================
  {
    id: "health_individual",
    line: "health",
    label: "Individual health plan",
    plainEnglish:
      "A health plan you buy on your own, such as through the ACA marketplace, when work does not offer one. You can usually sign up at open enrollment or after a life change.",
    tier: "essential",
    protects: ["person"],
  },
  {
    id: "medicare_supplement",
    line: "medicare",
    label: "Medicare Supplement",
    plainEnglish:
      "Can help pay costs that Original Medicare leaves, like copays and deductibles. Also called Medigap.",
    tier: "recommended",
    protects: ["person"],
  },
  {
    id: "medicare_advantage",
    line: "medicare",
    label: "Medicare Advantage",
    plainEnglish:
      "A Medicare plan from a private company. It often adds extras like dental and vision.",
    tier: "recommended",
    protects: ["person"],
  },
  {
    id: "medicare_part_d",
    line: "medicare",
    label: "Medicare drug plan (Part D)",
    plainEnglish: "Can help pay for your prescription drugs when you have Medicare.",
    tier: "recommended",
    protects: ["person"],
  },
  {
    id: "dental_plan",
    line: "dental_vision",
    label: "Dental plan",
    plainEnglish: "Can help pay for checkups, cleanings and fillings.",
    tier: "extra",
    protects: ["person"],
  },
  {
    id: "vision_plan",
    line: "dental_vision",
    label: "Vision plan",
    plainEnglish: "Can help pay for eye exams, glasses and contacts.",
    tier: "extra",
    protects: ["person"],
  },
  {
    id: "supp_accident",
    line: "supplemental_health",
    label: "Accident cash plan",
    plainEnglish:
      "Can send you cash if you are hurt in an accident, to use however you need, like for copays or time off work.",
    tier: "extra",
    protects: ["person"],
  },
  {
    id: "supp_critical_illness",
    line: "supplemental_health",
    label: "Critical illness plan",
    plainEnglish:
      "Can send you a lump of cash if you are diagnosed with a serious illness, to use however you need.",
    tier: "extra",
    protects: ["person"],
  },
  {
    id: "supp_hospital_cash",
    line: "supplemental_health",
    label: "Hospital cash plan",
    plainEnglish: "Can send you cash for each day you are in the hospital, to use however you need.",
    tier: "extra",
    protects: ["person"],
  },

  // =========================================================================
  // HOUSEHOLD-WIDE: travel, events, identity and cyber
  // =========================================================================
  {
    id: "travel_cancellation",
    line: "travel",
    label: "Trip cancellation",
    plainEnglish:
      "Can help pay back trip costs if you have to cancel or cut a trip short for a listed reason, like illness.",
    tier: "extra",
    protects: ["household"],
  },
  {
    id: "travel_medical",
    line: "travel",
    label: "Travel medical & rescue",
    plainEnglish:
      "Can help pay for a doctor or hospital while you are away, and for getting you home if needed. Your health plan may not work in other countries.",
    tier: "recommended",
    protects: ["household"],
  },
  {
    id: "travel_baggage",
    line: "travel",
    label: "Lost bags & delays",
    plainEnglish: "Can help pay if your bags are lost, stolen or late, or if your trip is delayed.",
    tier: "extra",
    protects: ["household"],
  },
  {
    id: "event_liability",
    line: "event",
    label: "Event liability",
    plainEnglish:
      "Can help pay if a guest is hurt, or something is damaged, at your wedding or party. Venues often ask for this.",
    tier: "recommended",
    protects: ["household"],
    limitOptions: opts(["1m", "$1,000,000"], ["2m", "$2,000,000"]),
  },
  {
    id: "event_cancellation",
    line: "event",
    label: "Event cancellation",
    plainEnglish:
      "Can help pay back deposits and costs if you have to cancel or move a wedding or event for a listed reason.",
    tier: "recommended",
    protects: ["household"],
  },
  {
    id: "identity_restoration",
    line: "identity_theft",
    label: "Identity theft help",
    plainEnglish:
      "Can help pay for the time and costs to fix your records and accounts if someone uses your identity.",
    tier: "recommended",
    protects: ["household"],
    limitOptions: opts(["15k", "$15,000"], ["25k", "$25,000"], ["50k", "$50,000"]),
  },
  {
    id: "cyber_personal",
    line: "identity_theft",
    label: "Online & cyber protection",
    plainEnglish:
      "Can help with problems online, like hacked accounts, online scams and cyberbullying.",
    tier: "extra",
    protects: ["household"],
  },

  // =========================================================================
  // BUSINESS: v1 hard stop
  //
  // This is the ONLY commercial coverage. We record the business and Loomis
  // follows up by phone. validateCatalog() fails if anything else is added to
  // the "commercial" line.
  // =========================================================================
  {
    id: "commercial_review",
    line: "commercial",
    label: "Business insurance chat",
    plainEnglish:
      "Business insurance works a little differently. Loomis will talk with you about what fits your business.",
    tier: "recommended",
    protects: ["business", "side_gig"],
  },
];
