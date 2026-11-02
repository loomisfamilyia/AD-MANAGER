import type { Choice, Question, ThingKind } from "./types.ts";

/**
 * Every kind of "thing" a client can add, and the questions we ask about it.
 *
 * House rules for questions:
 *   - Only names are required. Everything else offers Skip and "I don't know".
 *   - Easiest first: name, then simple choices and yes/no, then numbers, then
 *     photos. Address comes second because the public-records lookup can fill
 *     in several later answers.
 *   - `askIf` on a "multi" question matches when the chosen value is among the
 *     selections (so `features` includes "pool"). On a yes/no it matches true
 *     or false. It always points at an EARLIER question.
 *   - Data minimization is deliberate: no health history, tobacco, Social
 *     Security, driver's license or payment questions. A licensed agent collects
 *     those while quoting, not the game.
 *
 * `firstTimeReveal` text is identical for every kind that reveals the same zone
 * (every vehicle says the driveway line, every property in town says the road
 * line), so the app can play each one once per zone instead of once per kind.
 *
 * `coverages` lists mirror `protects` in coverages.ts; validateCatalog() fails
 * if the two disagree.
 */

// ---------------------------------------------------------------------------
// Small builders
// ---------------------------------------------------------------------------

type Extra = Partial<Omit<Question, "id" | "prompt" | "type">>;

const c = (value: string, label: string, emoji?: string): Choice =>
  emoji ? { value, label, emoji } : { value, label };

const text = (id: string, prompt: string, extra: Extra = {}): Question => ({ id, prompt, type: "text", ...extra });
const yesno = (id: string, prompt: string, extra: Extra = {}): Question => ({ id, prompt, type: "yesno", ...extra });
const num = (id: string, prompt: string, extra: Extra = {}): Question => ({ id, prompt, type: "number", ...extra });
const money = (id: string, prompt: string, extra: Extra = {}): Question => ({ id, prompt, type: "money", ...extra });
const year = (id: string, prompt: string, extra: Extra = {}): Question => ({ id, prompt, type: "year", ...extra });
const choice = (id: string, prompt: string, choices: Choice[], extra: Extra = {}): Question => ({
  id,
  prompt,
  type: "choice",
  choices,
  ...extra,
});
const multi = (id: string, prompt: string, choices: Choice[], extra: Extra = {}): Question => ({
  id,
  prompt,
  type: "multi",
  choices,
  ...extra,
});
const photo = (id: string, prompt: string, help = "Any picture helps. You can add more later."): Question => ({
  id,
  prompt,
  type: "photo",
  help,
});

// ---------------------------------------------------------------------------
// Shared questions
// ---------------------------------------------------------------------------

const ROUGH_GUESS = "A rough guess is fine.";

const installYear = (prompt = "What year was it put in?"): Question =>
  year("install_year", prompt, { help: ROUGH_GUESS });

const valueGuess = (prompt = "About what is it worth?"): Question =>
  money("value", prompt, { help: `${ROUGH_GUESS} Receipts and appraisals help.` });

/** Everything a home can have. Callers pick the subset that makes sense. */
const FEATURE_CHOICES: Record<string, Choice> = {
  pool: c("pool", "Pool", "🏊"),
  hot_tub: c("hot_tub", "Hot tub", "♨️"),
  trampoline: c("trampoline", "Trampoline"),
  fireplace: c("fireplace", "Fireplace", "🔥"),
  wood_stove: c("wood_stove", "Wood stove"),
  finished_basement: c("finished_basement", "Finished basement"),
  solar_panels: c("solar_panels", "Solar panels", "☀️"),
  generator: c("generator", "Home generator"),
  security_system: c("security_system", "Security system"),
  smoke_leak_sensors: c("smoke_leak_sensors", "Smoke or leak sensors"),
  storm_shelter: c("storm_shelter", "Storm shelter"),
  detached_garage: c("detached_garage", "Detached garage"),
  outbuildings: c("outbuildings", "Barn or other outbuildings"),
  fence: c("fence", "Fence"),
  dog_run: c("dog_run", "Dog run"),
};

const featureQuestion = (keys: string[]): Question =>
  multi(
    "features",
    "Which of these does it have?",
    keys.map((k) => FEATURE_CHOICES[k]!),
    { help: "Pick all that fit. These help Loomis shop for the right policy." },
  );

/** Follow-ups that only appear when the matching feature was picked. */
const FEATURE_FOLLOW_UPS: Record<string, Question[]> = {
  pool: [
    choice("pool_type", "Is the pool in the ground or above it?", [c("in_ground", "In the ground"), c("above_ground", "Above ground")], {
      askIf: { questionId: "features", equals: "pool" },
    }),
    yesno("pool_fenced", "Is the pool fenced or gated?", {
      help: "A fence or locked gate keeps little visitors safe, and insurers often ask.",
      askIf: { questionId: "features", equals: "pool" },
    }),
  ],
  trampoline: [
    yesno("trampoline_net", "Does the trampoline have a safety net?", {
      askIf: { questionId: "features", equals: "trampoline" },
    }),
  ],
  wood_stove: [
    yesno("wood_stove_pro", "Was the wood stove put in by a pro?", {
      help: "Some insurers ask who installed it.",
      askIf: { questionId: "features", equals: "wood_stove" },
    }),
  ],
};

const followUpsFor = (keys: string[]): Question[] => keys.flatMap((k) => FEATURE_FOLLOW_UPS[k] ?? []);

const mortgage = (prompt = "Do you have a mortgage?"): Question =>
  yesno("mortgage", prompt, { help: "Lenders often ask for home insurance, so this helps us plan." });

const homeSharing = (prompt = "Do you ever rent it out on Airbnb or VRBO?"): Question =>
  yesno("home_sharing", prompt, { help: "Renting to guests can change how a home policy works." });

const homeBusiness = (): Question =>
  yesno("home_business", "Do you run a business from home?", {
    help: "Even a small one, like selling crafts online or seeing clients.",
  });

const hasRoommates = (): Question => yesno("has_roommates", "Do you share the place with roommates?");

const leaseAsksForInsurance = (): Question =>
  yesno("lease_requires_insurance", "Does your lease ask for renters insurance?", {
    help: "Many landlords and schools do.",
  });

const yearBuilt = (): Question => year("year_built", "What year was it built?", { help: ROUGH_GUESS });

const squareFeet = (): Question => num("square_feet", "About how many square feet is it?", { help: ROUGH_GUESS });

const roofYear = (): Question =>
  year("roof_year", "What year was the roof put on?", {
    help: "If it was replaced, use that year. Older roofs sometimes change how a policy works.",
  });

const STORIES = choice("stories", "How many floors does it have?", [
  c("1", "1 floor"),
  c("1_5", "1½ floors"),
  c("2", "2 floors"),
  c("3_plus", "3 or more floors"),
  c("split", "Split-level"),
]);

const CONSTRUCTION = choice("construction", "What is it mostly built from?", [
  c("frame", "Wood frame"),
  c("brick_veneer", "Brick or stone on the outside"),
  c("masonry", "Solid brick, block or stone"),
  c("log", "Log"),
  c("steel", "Steel or metal"),
  c("stucco", "Stucco"),
  c("other", "Something else"),
]);

const ROOF_MATERIALS: Choice[] = [
  c("asphalt", "Asphalt shingles"),
  c("metal", "Metal"),
  c("tile", "Clay or concrete tile"),
  c("slate", "Slate"),
  c("wood", "Wood shakes"),
  c("flat", "Flat or rubber roof"),
  c("other", "Something else"),
];

const ROOF_MATERIAL = choice("roof_material", "What is the roof made of?", ROOF_MATERIALS);

const HEATING = choice("heating", "How do you mostly heat it?", [
  c("gas_furnace", "Gas furnace"),
  c("electric", "Electric furnace or baseboard"),
  c("heat_pump", "Heat pump"),
  c("oil", "Oil"),
  c("propane", "Propane"),
  c("wood_stove", "Wood stove"),
  c("boiler", "Boiler (radiators)"),
  c("other", "Something else"),
]);

const financing = (what: string): Question =>
  choice("financing", `Do you own ${what} outright, or is there a loan or lease?`, [
    c("own", "I own it outright"),
    c("loan", "I have a loan"),
    c("lease", "I lease it"),
  ]);

const vinQuestion = (): Question => ({
  id: "vin",
  prompt: "What is the VIN?",
  type: "vin",
  help: "It is on the dashboard by the windshield, or inside the driver's door. We use it to fill in the year, make and model.",
});

const yearMakeModel = (): Question[] => [
  year("year", "What year is it?"),
  text("make", "Who makes it?", { example: "Ford" }),
  text("model", "What is the model?", { example: "F-150" }),
];

const engineSize = (): Question =>
  num("engine_cc", "How big is the engine, in cc?", { help: `It is often printed on the side or in the manual. ${ROUGH_GUESS}` });

const PET_SIZE = choice("size", "How big is your pet?", [
  c("small", "Small (under 25 lb)"),
  c("medium", "Medium (25 to 60 lb)"),
  c("large", "Large (over 60 lb)"),
]);

/** Shared notes for anything on the "valuables" shelf. */
const VALUABLES_NOTES = [
  "Home policies often put lower limits on things like jewelry, watches, art and collections. Listing a special item by name can help it count at its full value. Ask Loomis.",
  "Many listed-item policies can help even if an item is just lost or misplaced, often with no deductible. Ask Loomis how it works.",
];

const VAULT_REVEAL = "A treasure chest appears!";

/**
 * Valuables share one shape: what is it, a kind-specific question or two,
 * appraisal, value, then photos.
 */
const valuableQuestions = (whatPrompt: string, suggestions: string[], middle: Question[] = []): Question[] => [
  text("what", whatPrompt, { required: true, suggestions }),
  ...middle,
  yesno("appraised_recently", "Has it been appraised in the last 5 years?", {
    help: "An appraisal is a written opinion of what something is worth.",
  }),
  valueGuess(),
  photo("photo", "Add a photo of it"),
  photo("appraisal_photo", "Add a photo of the appraisal or receipt", "This helps if you ever need to show what it is worth."),
];

const earnsMoney = (): Question =>
  yesno("earns_money", "Do you ever use it to earn money?", { help: "Like playing paid gigs or shooting photos for clients." });

// ---------------------------------------------------------------------------
// Reveals, one per zone
// ---------------------------------------------------------------------------

const HOME_REVEAL = "Your home rises from the ground!";
const TOWN_REVEAL = "A road to town appears!";
const DRIVEWAY_REVEAL = "A driveway rolls out to the street!";
const LAKE_REVEAL = "A lake appears!";
const PASTURE_REVEAL = "A pasture opens up!";

// ---------------------------------------------------------------------------
// Parent sets for kinds that live inside a residence
// ---------------------------------------------------------------------------

/** Places someone owns and can have a roof, systems and outbuildings. */
const OWNED_PLACES = ["house_owned", "vacation_home", "mobile_home", "landlord_property"];
/** Add the condo for things that live inside a unit. */
const UNIT_SYSTEMS_PARENTS = [...OWNED_PLACES, "condo_owned"];
const ALL_RESIDENCES = [
  "house_owned",
  "condo_owned",
  "home_rented",
  "landlord_property",
  "vacation_home",
  "mobile_home",
  "college_housing",
];

// ---------------------------------------------------------------------------
// PEOPLE
// ---------------------------------------------------------------------------

const PEOPLE: ThingKind[] = [
  {
    id: "person",
    category: "people",
    label: "Person",
    emoji: "🙂",
    zone: "yard",
    questions: [
      text("first_name", "What is their first name?", { required: true }),
      text("last_name", "What is their last name?"),
      choice("relationship", "How are they related to you?", [
        c("spouse", "Spouse"),
        c("partner", "Partner"),
        c("child", "Child"),
        c("stepchild", "Stepchild"),
        c("grandchild", "Grandchild"),
        c("parent", "Parent"),
        c("grandparent", "Grandparent"),
        c("sibling", "Brother or sister"),
        c("roommate", "Roommate"),
        c("other", "Someone else"),
      ]),
      yesno("lives_with_you", "Do they live with you?"),
      yesno("drives", "Do they drive?"),
      choice(
        "license_status",
        "Where are they with driving?",
        [c("permit", "Learner's permit"), c("licensed", "Licensed"), c("not_driving", "Not driving right now")],
        { askIf: { questionId: "drives", equals: true } },
      ),
      yesno("away_at_college", "Are they a student living away at college?"),
      { id: "birth_date", prompt: "When were they born?", type: "date", help: "Age helps Loomis find the right options." },
    ],
    coverages: [
      "life_term",
      "life_mortgage_protection",
      "life_whole",
      "life_universal",
      "life_final_expense",
      "life_child",
      "disability_short_term",
      "disability_long_term",
      "ltc_traditional",
      "ltc_hybrid",
      "health_individual",
      "medicare_supplement",
      "medicare_advantage",
      "medicare_part_d",
      "dental_plan",
      "vision_plan",
      "supp_accident",
      "supp_critical_illness",
      "supp_hospital_cash",
    ],
    xp: 100,
    goodToKnow: [
      "When a teen starts driving, car rates often change. Some companies give discounts for good grades or a driving class. Ask Loomis.",
      "A student away at college may still be on a parent's car and home policies, with some limits. Young adults can often stay on a parent's health plan until age 26. Ask Loomis how it works for your family.",
      "If a parent or grandparent moves in with you, a quick check of your home and car policies can help make sure everyone is included. Ask Loomis.",
    ],
  },
];

// ---------------------------------------------------------------------------
// HOME: the places people live
// ---------------------------------------------------------------------------

const RESIDENCES: ThingKind[] = [
  {
    id: "house_owned",
    category: "home",
    label: "House I own",
    emoji: "🏡",
    zone: "home",
    questions: [
      text("nickname", "What do you call this home?", {
        required: true,
        suggestions: ["Home", "Our house", "The farmhouse"],
        example: "Home",
      }),
      { id: "address", prompt: "What is the address?", type: "address", help: "We use it to look up details like the year built, so you do not have to type them." },
      mortgage(),
      featureQuestion([
        "pool",
        "hot_tub",
        "trampoline",
        "fireplace",
        "wood_stove",
        "finished_basement",
        "solar_panels",
        "generator",
        "security_system",
        "smoke_leak_sensors",
        "storm_shelter",
        "detached_garage",
        "outbuildings",
        "fence",
        "dog_run",
      ]),
      ...followUpsFor(["pool", "trampoline", "wood_stove"]),
      homeSharing(),
      homeBusiness(),
      STORIES,
      CONSTRUCTION,
      ROOF_MATERIAL,
      HEATING,
      yearBuilt(),
      squareFeet(),
      roofYear(),
      photo("photo", "Add a photo of the front of your home"),
    ],
    coverages: [
      "home_dwelling",
      "home_other_structures",
      "home_personal_property",
      "home_contents_replacement",
      "home_loss_of_use",
      "home_liability",
      "home_med_pay",
      "home_extended_replacement",
      "home_ordinance_law",
      "home_roof_replacement_cost",
      "home_wind_hail_deductible",
      "home_water_backup",
      "home_service_line",
      "home_equipment_breakdown",
      "home_mine_subsidence_pa",
      "home_sharing",
      "home_business",
      "flood_building",
      "flood_contents",
      "flood_excess",
      "eq_dwelling",
      "eq_contents",
      "eq_loss_of_use",
    ],
    xp: 150,
    firstTimeReveal: HOME_REVEAL,
    goodToKnow: [
      "Your home's rebuild cost can be different from what you paid for it or what it would sell for. Loomis can help check the number.",
      "Some insurers pay less for older roofs or ask about the roof's age. Knowing the year helps Loomis find a good fit.",
      "Most home policies do not include flood or earthquake. They are separate, and many people add them. Ask Loomis.",
      "Some home policies limit or leave out trampolines, or ask for a safety net. Worth asking Loomis.",
      "Pools can change home insurance rules, like fencing and extra liability. Loomis can help you plan.",
      "Some insurers ask about wood stoves, like who installed them and when they were last checked. Ask Loomis.",
      "Regular home policies often limit short-term rentals like Airbnb and VRBO. Ask Loomis about hosting add-ons.",
      "Regular home policies often have small limits for business gear. Ask Loomis if a home-business add-on fits.",
      "If you have a mortgage, your lender will usually want proof of home insurance. Loomis can help with that.",
    ],
  },
  {
    id: "condo_owned",
    category: "home",
    label: "Condo I own",
    emoji: "🏢",
    zone: "home",
    questions: [
      text("nickname", "What do you call this home?", {
        required: true,
        suggestions: ["Home", "The condo"],
        example: "Home",
      }),
      { id: "address", prompt: "What is the address?", type: "address", help: "We use it to look up details like the year built, so you do not have to type them." },
      mortgage(),
      choice(
        "assoc_covers_inside",
        "Does your condo group's insurance help with the inside of your unit?",
        [
          c("building_only", "No, just the building"),
          c("most_inside", "Yes, most of the inside too"),
        ],
        { help: "Your condo group can tell you. Not sure? Skip it, and Loomis can help find out." },
      ),
      featureQuestion(["fireplace", "wood_stove", "security_system", "smoke_leak_sensors"]),
      ...followUpsFor(["wood_stove"]),
      homeSharing(),
      homeBusiness(),
      HEATING,
      num("unit_floor", "Which floor is your unit on?"),
      yearBuilt(),
      squareFeet(),
      photo("photo", "Add a photo of your building"),
    ],
    coverages: [
      "condo_walls_in",
      "condo_upgrades",
      "condo_belongings",
      "condo_contents_replacement",
      "condo_loss_of_use",
      "condo_liability",
      "condo_med_pay",
      "condo_loss_assessment",
      "home_mine_subsidence_pa",
      "flood_building",
      "flood_contents",
      "eq_dwelling",
      "eq_contents",
      "eq_loss_of_use",
    ],
    xp: 150,
    firstTimeReveal: HOME_REVEAL,
    goodToKnow: [
      "Your condo group's policy usually looks after the building. What it includes inside your unit can vary, so it is worth a look. Ask Loomis to help you fill any gaps.",
      "If your condo group bills owners for a big repair, some policies can help with your share. Ask Loomis.",
      "Regular home policies often limit short-term rentals like Airbnb and VRBO. Ask Loomis.",
    ],
  },
  {
    id: "home_rented",
    category: "home",
    label: "Place I rent",
    emoji: "🏠",
    zone: "home",
    questions: [
      text("nickname", "What do you call this home?", {
        required: true,
        suggestions: ["Home", "The apartment"],
        example: "Home",
      }),
      choice("dwelling_type", "What kind of place is it?", [
        c("apartment", "Apartment"),
        c("house", "House"),
        c("townhome", "Townhome"),
        c("duplex", "Duplex"),
        c("other", "Something else"),
      ]),
      leaseAsksForInsurance(),
      hasRoommates(),
      homeSharing(),
      homeBusiness(),
      { id: "address", prompt: "What is the address?", type: "address", help: "We use it to look up details, so you do not have to type them." },
      photo("photo", "Add a photo of your place"),
    ],
    coverages: [
      "renters_belongings",
      "renters_replacement_cost",
      "renters_liability",
      "renters_loss_of_use",
      "renters_med_pay",
      "flood_contents",
      "eq_contents",
    ],
    xp: 150,
    firstTimeReveal: HOME_REVEAL,
    goodToKnow: [
      "Your landlord's policy is usually for the building, not for your things. A renters policy can help with yours.",
      "Renters policies usually leave flood out. You can add flood insurance for just your belongings. Ask Loomis.",
      "Renting out your place or a room, even for a weekend, often needs your landlord's okay and a closer look at your policy. Ask Loomis.",
    ],
  },
  {
    id: "landlord_property",
    category: "home",
    label: "Home I rent out",
    emoji: "🔑",
    zone: "town",
    questions: [
      text("nickname", "What do you call this property?", {
        required: true,
        suggestions: ["The duplex", "The rental house"],
        example: "The duplex",
      }),
      { id: "address", prompt: "What is the address?", type: "address", help: "We use it to look up details like the year built, so you do not have to type them." },
      choice("property_type", "What kind of property is it?", [
        c("single_family", "Single-family home"),
        c("duplex", "Duplex"),
        c("small_building", "Small apartment building"),
        c("condo", "Condo"),
        c("townhome", "Townhome"),
        c("other", "Something else"),
      ]),
      yesno("currently_rented", "Does someone live there now?"),
      mortgage(),
      homeSharing("Do you rent it by the night, like on Airbnb or VRBO?"),
      featureQuestion([
        "pool",
        "hot_tub",
        "fireplace",
        "wood_stove",
        "security_system",
        "smoke_leak_sensors",
        "detached_garage",
        "fence",
      ]),
      ...followUpsFor(["pool", "wood_stove"]),
      num("units", "How many units are there?"),
      STORIES,
      CONSTRUCTION,
      ROOF_MATERIAL,
      HEATING,
      yearBuilt(),
      squareFeet(),
      roofYear(),
      photo("photo", "Add a photo of the property"),
    ],
    coverages: [
      "landlord_dwelling",
      "landlord_other_structures",
      "landlord_contents",
      "landlord_lost_rent",
      "landlord_liability",
      "landlord_med_pay",
      "landlord_short_term",
      "home_mine_subsidence_pa",
      "flood_building",
      "flood_contents",
      "eq_dwelling",
      "eq_contents",
    ],
    xp: 150,
    firstTimeReveal: TOWN_REVEAL,
    goodToKnow: [
      "A regular home policy and a rental policy work differently. If you rent a place out, a landlord policy is made for that. Ask Loomis.",
      "Rentals that sit empty for a while can have special rules. Ask Loomis if yours may be empty at times.",
      "Renting by the night, like on Airbnb, often needs a different setup than a long-term rental. Ask Loomis.",
    ],
  },
  {
    id: "vacation_home",
    category: "home",
    label: "Vacation home",
    emoji: "🏖️",
    zone: "town",
    questions: [
      text("nickname", "What do you call this place?", {
        required: true,
        suggestions: ["The lake house", "The cabin", "The beach house"],
        example: "The cabin",
      }),
      { id: "address", prompt: "What is the address?", type: "address", help: "We use it to look up details like the year built, so you do not have to type them." },
      mortgage(),
      choice("how_often_used", "How often is someone there?", [
        c("most_of_year", "Most of the year"),
        c("seasonal", "Part of the year"),
        c("occasional", "A few weekends or holidays"),
      ]),
      featureQuestion([
        "pool",
        "hot_tub",
        "trampoline",
        "fireplace",
        "wood_stove",
        "solar_panels",
        "generator",
        "security_system",
        "smoke_leak_sensors",
        "detached_garage",
        "outbuildings",
        "fence",
      ]),
      ...followUpsFor(["pool", "trampoline", "wood_stove"]),
      homeSharing(),
      CONSTRUCTION,
      ROOF_MATERIAL,
      HEATING,
      yearBuilt(),
      squareFeet(),
      roofYear(),
      photo("photo", "Add a photo of the front of the place"),
    ],
    coverages: [
      "home_dwelling",
      "home_other_structures",
      "home_personal_property",
      "home_contents_replacement",
      "home_loss_of_use",
      "home_liability",
      "home_med_pay",
      "home_extended_replacement",
      "home_ordinance_law",
      "home_roof_replacement_cost",
      "home_wind_hail_deductible",
      "home_water_backup",
      "home_service_line",
      "home_equipment_breakdown",
      "home_mine_subsidence_pa",
      "home_sharing",
      "flood_building",
      "flood_contents",
      "flood_excess",
      "eq_dwelling",
      "eq_contents",
      "eq_loss_of_use",
    ],
    xp: 150,
    firstTimeReveal: TOWN_REVEAL,
    goodToKnow: [
      "If a second home sits empty for part of the year, some policies have special rules. Ask Loomis how yours is set up.",
      "Renting out a vacation home, even a few weeks a year, can change how a home policy works. Ask Loomis.",
    ],
  },
  {
    id: "mobile_home",
    category: "home",
    label: "Mobile home",
    emoji: "🏘️",
    zone: "home",
    questions: [
      text("nickname", "What do you call this home?", {
        required: true,
        suggestions: ["Home", "Our place"],
        example: "Home",
      }),
      { id: "address", prompt: "What is the address?", type: "address", help: "We use it to look up details, so you do not have to type them." },
      mortgage("Do you have a loan on it?"),
      choice("lot", "Is it on land you own or in a park?", [
        c("own_land", "On land I own"),
        c("park", "In a park, on a rented lot"),
      ]),
      choice("mobile_size", "How wide is it?", [
        c("single_wide", "Single-wide"),
        c("double_wide", "Double-wide"),
        c("other", "Something else"),
      ]),
      homeBusiness(),
      featureQuestion(["wood_stove", "storm_shelter", "generator", "security_system", "smoke_leak_sensors", "fence", "detached_garage"]),
      ...followUpsFor(["wood_stove"]),
      HEATING,
      ROOF_MATERIAL,
      yearBuilt(),
      squareFeet(),
      roofYear(),
      photo("photo", "Add a photo of your home"),
    ],
    coverages: [
      "home_other_structures",
      "home_personal_property",
      "home_contents_replacement",
      "home_loss_of_use",
      "home_liability",
      "home_med_pay",
      "home_wind_hail_deductible",
      "home_equipment_breakdown",
      "home_business",
      "mobile_home_dwelling",
      "home_mine_subsidence_pa",
      "flood_building",
      "flood_contents",
      "eq_dwelling",
      "eq_contents",
      "eq_loss_of_use",
    ],
    xp: 150,
    firstTimeReveal: HOME_REVEAL,
    goodToKnow: [
      "Mobile home policies are built differently from regular home policies. Things like age, tie-downs and skirting can matter. Ask Loomis.",
    ],
  },
  {
    id: "college_housing",
    category: "home",
    label: "Student housing",
    emoji: "🎓",
    zone: "town",
    questions: [
      text("nickname", "What do you call this place?", {
        required: true,
        suggestions: ["Dorm room", "Off-campus apartment"],
        example: "Dorm room",
      }),
      text("student_name", "Who is the student?", { help: "Type a name from your family." }),
      text("school", "What school is it?"),
      choice("housing_type", "What kind of place is it?", [
        c("dorm", "Dorm"),
        c("apartment", "Off-campus apartment"),
        c("shared_house", "Shared house"),
        c("other", "Something else"),
      ]),
      hasRoommates(),
      leaseAsksForInsurance(),
      { id: "address", prompt: "What is the address?", type: "address", help: "The school or apartment address is fine." },
    ],
    coverages: [
      "renters_belongings",
      "renters_replacement_cost",
      "renters_liability",
      "renters_loss_of_use",
      "renters_med_pay",
      "flood_contents",
    ],
    xp: 150,
    firstTimeReveal: TOWN_REVEAL,
    goodToKnow: [
      "A parent's home policy may help with some of a student's things, with limits. A student in an apartment may do better with their own renters policy. Ask Loomis.",
    ],
  },
];

// ---------------------------------------------------------------------------
// HOME: things that live inside or beside a residence
// ---------------------------------------------------------------------------

const HOME_SYSTEMS: ThingKind[] = [
  {
    id: "roof",
    category: "home",
    label: "Roof",
    emoji: "☂️",
    zone: "inside",
    parentKinds: OWNED_PLACES,
    questions: [
      choice("material", "What is the roof made of?", ROOF_MATERIALS),
      installYear("What year was the roof put on?"),
      photo("photo", "Add a photo of the roof", "A picture from the ground is fine."),
    ],
    coverages: [
      "home_roof_replacement_cost",
      "home_wind_hail_deductible",
    ],
    xp: 50,
    goodToKnow: [
      "Some insurers pay less for an older roof, or ask for an inspection. A roof photo and the year it was put on help Loomis shop for you.",
    ],
  },
  {
    id: "furnace",
    category: "home",
    label: "Furnace or boiler",
    emoji: "🔥",
    zone: "inside",
    parentKinds: UNIT_SYSTEMS_PARENTS,
    questions: [
      choice("fuel", "What does it run on?", [
        c("gas", "Natural gas"),
        c("electric", "Electric"),
        c("oil", "Oil"),
        c("propane", "Propane"),
        c("wood", "Wood"),
        c("other", "Something else"),
      ]),
      installYear(),
      photo("photo", "Add a photo of it", "A picture of the label on the side helps most."),
    ],
    coverages: [
      "home_equipment_breakdown",
    ],
    xp: 50,
  },
  {
    id: "central_air",
    category: "home",
    label: "Air conditioner",
    emoji: "🌬️",
    zone: "inside",
    parentKinds: UNIT_SYSTEMS_PARENTS,
    questions: [
      choice("type", "What kind is it?", [
        c("central", "Central air"),
        c("heat_pump", "Heat pump"),
        c("ductless", "Ductless mini-split"),
        c("window", "Window units"),
      ]),
      installYear(),
      photo("photo", "Add a photo of it", "A picture of the label on the outdoor unit helps most."),
    ],
    coverages: [
      "home_equipment_breakdown",
    ],
    xp: 50,
  },
  {
    id: "water_heater",
    category: "home",
    label: "Water heater",
    emoji: "🚿",
    zone: "inside",
    parentKinds: UNIT_SYSTEMS_PARENTS,
    questions: [
      choice("type", "What kind is it?", [
        c("tank_gas", "Tank, gas"),
        c("tank_electric", "Tank, electric"),
        c("tankless", "Tankless"),
        c("heat_pump", "Heat pump"),
      ]),
      installYear(),
      photo("photo", "Add a photo of it", "A picture of the label on the side helps most."),
    ],
    coverages: [
      "home_equipment_breakdown",
    ],
    xp: 50,
    goodToKnow: [
      "Many insurers ask how old a water heater is. The year it was put in helps Loomis shop for you.",
    ],
  },
  {
    id: "electrical_panel",
    category: "home",
    label: "Electrical panel",
    emoji: "⚡",
    zone: "inside",
    parentKinds: UNIT_SYSTEMS_PARENTS,
    questions: [
      choice("panel_type", "What kind of panel is it?", [
        c("breakers", "Breakers (switches)"),
        c("fuses", "Fuses"),
      ]),
      choice("amps", "How many amps is the main switch?", [
        c("60_100", "60 to 100"),
        c("125_150", "125 to 150"),
        c("200_plus", "200 or more"),
      ]),
      installYear("What year was it put in?"),
      photo("photo", "Add a photo of the panel", "Open the door and snap the whole thing, with the label if you can see one."),
    ],
    coverages: [
      "home_equipment_breakdown",
    ],
    xp: 50,
    goodToKnow: [
      "Some insurers ask about older electrical panels, like fuse boxes. A photo helps Loomis find the right fit.",
    ],
  },
  {
    id: "plumbing",
    category: "home",
    label: "Plumbing",
    emoji: "🚰",
    zone: "inside",
    parentKinds: UNIT_SYSTEMS_PARENTS,
    questions: [
      choice("supply_line_material", "What are the water pipes made of?", [
        c("copper", "Copper"),
        c("pex", "PEX (flexible plastic)"),
        c("cpvc", "CPVC or PVC (rigid plastic)"),
        c("galvanized", "Galvanized steel"),
        c("polybutylene", "Polybutylene (gray plastic)"),
        c("unknown", "I don't know"),
      ], { help: "Not sure? A photo of a pipe near the water heater or meter can help." }),
      installYear("Roughly what year was the plumbing put in?"),
      photo("photo", "Add a photo of a water pipe"),
    ],
    coverages: [],
    xp: 50,
    goodToKnow: [
      "Gray plastic pipes (polybutylene) were used in many homes from the late 1970s to the mid-1990s. Some insurers limit options for homes that have them. If that is your home, Loomis can help look for choices.",
    ],
  },
  {
    id: "sump_pump",
    category: "home",
    label: "Sump pump",
    emoji: "💧",
    zone: "inside",
    parentKinds: ["house_owned", "vacation_home", "landlord_property"],
    questions: [
      choice("type", "What kind is it?", [c("pedestal", "Pedestal"), c("submersible", "Submersible")]),
      yesno("battery_backup", "Does it have a battery backup?"),
      installYear(),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "home_water_backup",
      "home_equipment_breakdown",
    ],
    xp: 50,
    goodToKnow: [
      "Water backup is usually an add-on to a home policy. A battery backup can help your pump keep working in a storm. Ask Loomis.",
    ],
  },
  {
    id: "well_septic",
    category: "home",
    label: "Well or septic",
    emoji: "⛲",
    zone: "inside",
    parentKinds: OWNED_PLACES,
    questions: [
      choice("which", "Which do you have?", [c("well", "A well"), c("septic", "A septic tank"), c("both", "Both")]),
      installYear(),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "home_service_line",
      "home_equipment_breakdown",
    ],
    xp: 50,
    goodToKnow: [
      "Wells, septic systems and buried lines are handled in different ways by home policies. Ask Loomis what yours might need.",
    ],
  },
  {
    id: "solar_panels",
    category: "home",
    label: "Solar panels",
    emoji: "☀️",
    zone: "inside",
    parentKinds: ["house_owned", "vacation_home", "landlord_property"],
    questions: [
      choice("ownership", "Do you own them or lease them?", [
        c("owned", "I own them"),
        c("leased", "I lease them"),
        c("ppa", "I buy the power from the company"),
      ]),
      choice("mount", "Where are they?", [c("roof", "On the roof"), c("ground", "On the ground")]),
      installYear(),
      photo("photo", "Add a photo of them"),
    ],
    coverages: [
      "home_equipment_breakdown",
      "home_solar_panels",
    ],
    xp: 50,
    goodToKnow: [
      "If your panels are leased, the solar company may look after some of the insurance. It is worth asking who is in charge of what. Ask Loomis.",
    ],
  },
  {
    id: "generator",
    category: "home",
    label: "Generator",
    emoji: "🔋",
    zone: "inside",
    parentKinds: OWNED_PLACES,
    questions: [
      choice("type", "What kind is it?", [c("standby", "Standby (built in)"), c("portable", "Portable")]),
      installYear(),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "home_equipment_breakdown",
    ],
    xp: 50,
    goodToKnow: [
      "Some insurers ask how a generator is hooked up. It is worth telling Loomis, who can check what fits.",
    ],
  },
  {
    id: "inventory_item",
    category: "home",
    label: "Item in my home",
    emoji: "📦",
    zone: "inside",
    parentKinds: ALL_RESIDENCES,
    questions: [
      text("what", "What is it?", {
        required: true,
        suggestions: ["TV", "Laptop", "Couch", "Washer", "Bike"],
        example: "Living room TV",
      }),
      choice("room", "Which room is it in?", [
        c("living_room", "Living room"),
        c("kitchen", "Kitchen"),
        c("dining_room", "Dining room"),
        c("bedroom", "Bedroom"),
        c("kids_room", "Kid's room"),
        c("bathroom", "Bathroom"),
        c("home_office", "Home office"),
        c("laundry", "Laundry room"),
        c("basement", "Basement"),
        c("garage", "Garage"),
        c("attic", "Attic"),
        c("other", "Somewhere else"),
      ]),
      choice("item_category", "What kind of thing is it?", [
        c("electronics", "Electronics"),
        c("furniture", "Furniture"),
        c("appliances", "Appliances"),
        c("clothing", "Clothing"),
        c("tools", "Tools"),
        c("sports_outdoor", "Sports and outdoor gear"),
        c("decor", "Art and decor"),
        c("jewelry_watches", "Jewelry or watches"),
        c("collectibles", "Collectibles"),
        c("other", "Something else"),
      ]),
      money("value", "About what is it worth?", { help: `${ROUGH_GUESS} What it would cost to buy again is a good guide.` }),
      year("purchase_year", "What year did you get it?"),
      photo("photo", "Add a photo of it"),
      photo("receipt_photo", "Add a photo of the receipt", "A receipt is a great way to show what something cost."),
    ],
    coverages: [
      "home_personal_property",
      "home_contents_replacement",
      "condo_belongings",
      "condo_contents_replacement",
      "renters_belongings",
      "renters_replacement_cost",
      "landlord_contents",
    ],
    xp: 50,
    goodToKnow: [
      "Home policies often put lower limits on things like jewelry, cash and collections. A photo and a receipt now can make life easier later. Ask Loomis about special items.",
    ],
  },
  {
    id: "other_structure",
    category: "home",
    label: "Garage, shed or fence",
    emoji: "🏗️",
    zone: "yard",
    parentKinds: OWNED_PLACES,
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["Detached garage", "The shed", "The barn", "Back fence", "Gazebo"],
        example: "The shed",
      }),
      choice("structure_type", "What kind is it?", [
        c("detached_garage", "Detached garage"),
        c("shed", "Shed"),
        c("barn", "Barn"),
        c("fence", "Fence"),
        c("gazebo", "Gazebo or pergola"),
        c("pool", "Pool"),
        c("other", "Something else"),
      ]),
      year("year_built", "About what year was it built?", { help: ROUGH_GUESS }),
      money("value", "About what would it cost to replace?", { help: ROUGH_GUESS }),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "home_other_structures",
      "landlord_other_structures",
    ],
    xp: 75,
  },
];

// ---------------------------------------------------------------------------
// VEHICLES
// ---------------------------------------------------------------------------

const MILES_PER_YEAR = choice(
  "annual_miles",
  "About how many miles do you drive it in a year?",
  [
    c("lt_5k", "Under 5,000"),
    c("5k_7500", "5,000 to 7,500"),
    c("7500_10k", "7,500 to 10,000"),
    c("10k_15k", "10,000 to 15,000"),
    c("15k_20k", "15,000 to 20,000"),
    c("gt_20k", "Over 20,000"),
  ],
  { help: ROUGH_GUESS },
);

const VEHICLES: ThingKind[] = [
  {
    id: "car",
    category: "vehicles",
    label: "Car, truck or SUV",
    emoji: "🚗",
    zone: "driveway",
    questions: [
      text("nickname", "What do you call this vehicle?", {
        required: true,
        suggestions: ["Mom's car", "Dad's truck", "The minivan", "The truck", "Work truck"],
        example: "The minivan",
      }),
      choice("body_style", "What kind of vehicle is it?", [
        c("car", "Car"),
        c("truck", "Truck"),
        c("suv", "SUV"),
        c("van", "Van"),
      ]),
      choice("use", "How do you mostly use it?", [
        c("commute", "Getting to work or school"),
        c("pleasure", "Fun and errands"),
        c("business", "For my work"),
      ]),
      financing("it"),
      yesno("rideshare", "Do you drive for Uber, Lyft or DoorDash with it?"),
      yesno("custom_parts", "Does it have custom parts or upgrades?", {
        help: "Like a lift kit, special wheels or a big sound system.",
      }),
      text("main_driver", "Who drives it most?", { example: "Dad" }),
      MILES_PER_YEAR,
      vinQuestion(),
      ...yearMakeModel(),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "auto_liability_bi",
      "auto_liability_pd",
      "auto_um_bi",
      "auto_pip_ny",
      "auto_apip_ny",
      "auto_obel_ny",
      "auto_sum_ny",
      "auto_first_party_pa",
      "auto_first_party_extra_pa",
      "auto_tort_option_pa",
      "auto_um_stacking_pa",
      "auto_collision",
      "auto_comprehensive",
      "auto_glass",
      "auto_rental",
      "auto_roadside",
      "auto_gap",
      "auto_new_car",
      "auto_custom_equipment",
      "auto_rideshare",
    ],
    xp: 100,
    firstTimeReveal: DRIVEWAY_REVEAL,
    goodToKnow: [
      "Personal car policies often work differently while you are logged in to a rideshare or delivery app. There are add-ons for that. Ask Loomis.",
      "If you have a loan or lease, your lender usually asks for collision and comprehensive. Gap coverage can also help. Ask Loomis.",
      "Policies often limit what they pay for add-ons like lift kits or big stereos. Ask Loomis about including yours.",
      "If a teen driver will use this car, tell Loomis. A quick chat can help you plan.",
    ],
  },
  {
    id: "motorcycle",
    category: "vehicles",
    label: "Motorcycle",
    emoji: "🏍️",
    zone: "driveway",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The Harley", "Weekend bike", "The scooter"],
        example: "Weekend bike",
      }),
      choice("bike_type", "What kind of bike is it?", [
        c("cruiser", "Cruiser"),
        c("sport", "Sport bike"),
        c("touring", "Touring"),
        c("standard", "Standard"),
        c("dual_sport", "Dual-sport"),
        c("scooter", "Scooter or moped"),
      ]),
      choice("use", "How do you mostly ride it?", [
        c("pleasure", "For fun"),
        c("commute", "To work or school"),
      ]),
      financing("it"),
      yesno("custom_parts", "Does it have custom parts or accessories?"),
      vinQuestion(),
      ...yearMakeModel(),
      engineSize(),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "moto_liability",
      "moto_collision",
      "moto_comprehensive",
      "moto_uninsured",
      "moto_med_pay",
      "moto_accessories",
      "moto_gear",
      "moto_roadside",
    ],
    xp: 100,
    firstTimeReveal: DRIVEWAY_REVEAL,
    goodToKnow: [
      "Car policies do not usually include motorcycles, so a bike has its own policy. Ask Loomis.",
      "Helmets and riding gear are often left out of a basic bike policy, but they can be added. Ask Loomis.",
    ],
  },
  {
    id: "motorhome",
    category: "vehicles",
    label: "Motorhome",
    emoji: "🚐",
    zone: "driveway",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The motorhome", "The RV"],
        example: "The RV",
      }),
      choice("rv_class", "What kind of motorhome is it?", [
        c("class_a", "Class A (bus style)"),
        c("class_b", "Class B (camper van)"),
        c("class_c", "Class C (with a bed over the cab)"),
      ]),
      choice("use", "How do you use it?", [
        c("trips", "Trips and vacations"),
        c("seasonal", "Part of the year as a home"),
        c("full_time", "As my full-time home"),
      ]),
      financing("it"),
      vinQuestion(),
      ...yearMakeModel(),
      num("length_ft", "How long is it, in feet?", { help: ROUGH_GUESS }),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rv_physical_damage",
      "rv_liability",
      "rv_vacation_liability",
      "rv_contents",
      "rv_full_timer",
      "rv_emergency_expense",
      "rv_accessories",
    ],
    xp: 100,
    firstTimeReveal: DRIVEWAY_REVEAL,
    goodToKnow: [
      "If you live in your motorhome most of the year, a different kind of policy may fit better. Ask Loomis.",
    ],
  },
  {
    id: "classic_car",
    category: "vehicles",
    label: "Classic or collector car",
    emoji: "🚘",
    zone: "driveway",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The Mustang", "Grandpa's truck", "The hot rod"],
        example: "The Mustang",
      }),
      choice("use", "How do you use it?", [
        c("shows", "Shows and parades"),
        c("weekends", "Weekend drives"),
        c("regular", "Regular driving"),
      ]),
      choice("storage", "Where do you keep it?", [
        c("locked_garage", "In a locked garage"),
        c("other_building", "In another building"),
        c("outside", "Outside or under a carport"),
      ]),
      yesno("has_daily_driver", "Do you have another car for everyday driving?", {
        help: "Some collector policies ask for this.",
      }),
      choice("annual_miles", "About how many miles do you drive it in a year?", [
        c("lt_1k", "Under 1,000"),
        c("1k_3k", "1,000 to 3,000"),
        c("3k_5k", "3,000 to 5,000"),
        c("gt_5k", "Over 5,000"),
      ]),
      vinQuestion(),
      ...yearMakeModel(),
      valueGuess("About what is it worth today?"),
      yesno("appraised_recently", "Has it been appraised in the last 5 years?"),
      photo("photo", "Add a photo of it"),
      photo("appraisal_photo", "Add a photo of the appraisal or receipt"),
    ],
    coverages: [
      "collector_physical_damage",
      "collector_agreed_value",
      "collector_liability",
      "collector_spare_parts",
      "collector_towing",
    ],
    xp: 100,
    firstTimeReveal: DRIVEWAY_REVEAL,
    goodToKnow: [
      "Classic cars are often insured for an agreed value, a number you and the insurer pick up front. A recent appraisal and photos can help. Ask Loomis.",
    ],
  },
];

// ---------------------------------------------------------------------------
// TOYS
// ---------------------------------------------------------------------------

const TOYS: ThingKind[] = [
  {
    id: "boat",
    category: "toys",
    label: "Boat",
    emoji: "⛵",
    zone: "water",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The pontoon", "Lake boat", "The fishing boat"],
        example: "The pontoon",
      }),
      choice("boat_type", "What kind of boat is it?", [
        c("pontoon", "Pontoon"),
        c("fishing", "Fishing boat"),
        c("ski_speed", "Ski or speed boat"),
        c("sailboat", "Sailboat"),
        c("cabin_cruiser", "Cabin cruiser or yacht"),
        c("small", "Small boat or dinghy"),
      ]),
      choice("waters", "Where do you use it?", [
        c("lakes_rivers", "Lakes and rivers"),
        c("coast", "The ocean or coast"),
      ]),
      choice("stored", "Where do you keep it?", [
        c("trailer_home", "On a trailer at home"),
        c("marina", "At a marina"),
        c("dry_storage", "In dry storage"),
        c("lift", "On a lift at home"),
      ]),
      financing("it"),
      ...yearMakeModel(),
      num("length_ft", "How long is it, in feet?", { help: ROUGH_GUESS }),
      num("horsepower", "How much horsepower is the motor?", { help: ROUGH_GUESS }),
      text("hull_id", "What is the hull ID number?", { help: "It is a 12-character number on the back right side of the boat." }),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "water_hull",
      "water_liability",
      "water_med_pay",
      "water_towing",
      "water_fuel_spill",
      "water_wreck_removal",
      "water_uninsured",
      "water_effects",
    ],
    xp: 100,
    firstTimeReveal: LAKE_REVEAL,
    goodToKnow: [
      "Home policies often have small limits for boats, depending on size and motor. A boat policy can fill the gap. Ask Loomis.",
    ],
  },
  {
    id: "pwc",
    category: "toys",
    label: "Jet ski",
    emoji: "🌊",
    zone: "water",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The jet ski", "The Sea-Doo", "The WaveRunner"],
        example: "The jet ski",
      }),
      choice("waters", "Where do you use it?", [
        c("lakes_rivers", "Lakes and rivers"),
        c("coast", "The ocean or coast"),
      ]),
      choice("stored", "Where do you keep it?", [
        c("trailer_home", "On a trailer at home"),
        c("marina", "At a marina"),
        c("lift", "On a lift or dock"),
      ]),
      financing("it"),
      ...yearMakeModel(),
      num("horsepower", "How much horsepower does it have?", { help: ROUGH_GUESS }),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "water_hull",
      "water_liability",
      "water_med_pay",
      "water_towing",
      "water_fuel_spill",
      "water_wreck_removal",
      "water_uninsured",
    ],
    xp: 100,
    firstTimeReveal: LAKE_REVEAL,
    goodToKnow: [
      "Home policies often leave out jet skis, or limit them to a small amount. A separate policy can help. Ask Loomis.",
    ],
  },
  {
    id: "atv_utv",
    category: "toys",
    label: "ATV or side-by-side",
    emoji: "🏞️",
    zone: "garage",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The Polaris", "The Ranger", "Farm ATV"],
        example: "The Ranger",
      }),
      choice("atv_type", "What kind is it?", [
        c("atv", "ATV (four-wheeler)"),
        c("utv", "UTV (side-by-side)"),
      ]),
      choice("use", "What do you use it for?", [
        c("trails", "Trails and fun"),
        c("farm_work", "Farm or yard work"),
        c("hunting", "Hunting"),
      ]),
      financing("it"),
      vinQuestion(),
      ...yearMakeModel(),
      engineSize(),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rec_liability",
      "rec_collision",
      "rec_comprehensive",
      "rec_med_pay",
      "rec_guest_passenger",
      "rec_accessories",
      "rec_roadside",
    ],
    xp: 75,
    goodToKnow: [
      "Home and car policies often leave out ATVs and side-by-sides. A separate policy can help with damage and with injuries to others. Ask Loomis.",
    ],
  },
  {
    id: "snowmobile",
    category: "toys",
    label: "Snowmobile",
    emoji: "🛷",
    zone: "garage",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The sled", "Winter sled"],
        example: "The sled",
      }),
      financing("it"),
      yesno("has_trailer", "Do you have a trailer for it?"),
      ...yearMakeModel(),
      engineSize(),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rec_liability",
      "rec_collision",
      "rec_comprehensive",
      "rec_med_pay",
      "rec_guest_passenger",
      "rec_accessories",
      "rec_roadside",
    ],
    xp: 75,
    goodToKnow: [
      "Home and car policies often leave out snowmobiles. A separate policy can help. Racing is usually handled differently, so tell Loomis if you race.",
    ],
  },
  {
    id: "golf_cart",
    category: "toys",
    label: "Golf cart",
    emoji: "⛳",
    zone: "garage",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The golf cart", "Neighborhood cart"],
        example: "The golf cart",
      }),
      choice("where_used", "Where do you drive it?", [
        c("property_course", "On my property or a golf course"),
        c("community", "On neighborhood roads"),
        c("street_legal", "It is street-legal"),
      ]),
      choice("power", "What powers it?", [c("electric", "Electric"), c("gas", "Gas")]),
      yesno("custom_parts", "Does it have custom parts?", { help: "Like a lift kit, lights or special seats." }),
      ...yearMakeModel(),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rec_liability",
      "rec_collision",
      "rec_comprehensive",
      "rec_med_pay",
      "rec_guest_passenger",
      "rec_accessories",
    ],
    xp: 75,
    goodToKnow: [
      "Some home policies include golf carts on your own property but not on neighborhood or public roads. Ask Loomis how yours would work.",
    ],
  },
  {
    id: "travel_trailer",
    category: "toys",
    label: "Camper or trailer",
    emoji: "🏕️",
    zone: "driveway",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The camper", "Our travel trailer"],
        example: "The camper",
      }),
      choice("trailer_type", "What kind is it?", [
        c("travel_trailer", "Travel trailer"),
        c("fifth_wheel", "Fifth wheel"),
        c("pop_up", "Pop-up"),
        c("toy_hauler", "Toy hauler"),
      ]),
      choice("use", "How do you use it?", [
        c("trips", "Trips and vacations"),
        c("seasonal_site", "Parked at a campground most summers"),
        c("full_time", "As my full-time home"),
      ]),
      financing("it"),
      vinQuestion(),
      ...yearMakeModel(),
      num("length_ft", "How long is it, in feet?", { help: ROUGH_GUESS }),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rv_physical_damage",
      "rv_vacation_liability",
      "rv_contents",
      "rv_full_timer",
      "rv_emergency_expense",
      "rv_accessories",
    ],
    xp: 100,
    goodToKnow: [
      "Your car policy may help with the trailer while you tow it, but the camper itself often needs its own policy. Ask Loomis.",
    ],
  },
  {
    id: "utility_trailer",
    category: "toys",
    label: "Utility trailer",
    emoji: "🚛",
    zone: "garage",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["Yard trailer", "Landscape trailer"],
        example: "Yard trailer",
      }),
      choice("trailer_type", "What kind is it?", [
        c("open", "Open utility"),
        c("enclosed", "Enclosed cargo"),
        c("car_hauler", "Car hauler"),
        c("flatbed", "Flatbed"),
        c("other", "Something else"),
      ]),
      choice("use", "What do you use it for?", [c("personal", "Personal use"), c("work", "For work")]),
      ...yearMakeModel().slice(0, 2),
      num("length_ft", "How long is it, in feet?", { help: ROUGH_GUESS }),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "auto_trailer_damage",
    ],
    xp: 50,
    goodToKnow: [
      "A car policy may help with others if you cause a crash while towing, but damage to the trailer and the tools inside is often separate. Ask Loomis.",
    ],
  },
  {
    id: "ebike_scooter",
    category: "toys",
    label: "E-bike or scooter",
    emoji: "🛴",
    zone: "garage",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["My e-bike", "The scooter"],
        example: "My e-bike",
      }),
      choice("ride_type", "What kind is it?", [
        c("ebike", "E-bike"),
        c("scooter", "Electric scooter"),
        c("other", "Other electric ride"),
      ]),
      choice("top_speed", "About how fast does it go?", [
        c("under_20", "Under 20 mph"),
        c("20_28", "20 to 28 mph"),
        c("over_28", "Faster than 28 mph"),
      ], { help: "The top speed is often in the manual or on the box." }),
      text("brand", "Who makes it?", { example: "Rad Power" }),
      year("year", "What year did you get it?"),
      valueGuess("About what did it cost?"),
      photo("photo", "Add a photo of it"),
      photo("receipt_photo", "Add a photo of the receipt"),
    ],
    coverages: [
      "rec_ebike_liability",
      "val_ebike",
    ],
    xp: 75,
    goodToKnow: [
      "Home and car policies often have limits for e-bikes and scooters, especially for theft or for hurting someone else. A listed item or a special policy can help. Ask Loomis.",
    ],
  },
  {
    id: "drone",
    category: "toys",
    label: "Drone",
    emoji: "🚁",
    zone: "yard",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["My drone", "The camera drone"],
        example: "My drone",
      }),
      choice("purpose", "What do you use it for?", [
        c("fun", "Just for fun"),
        c("photos", "Photos and video as a hobby"),
        c("work", "For work"),
      ]),
      text("brand_model", "What brand and model is it?", { example: "DJI Mini" }),
      valueGuess("About what did it cost?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rec_drone_liability",
      "val_drone",
    ],
    xp: 75,
    goodToKnow: [
      "Home policies often limit drones. Drones used for work are usually a business matter. Ask Loomis.",
    ],
  },
  {
    id: "dirt_bike",
    category: "toys",
    label: "Dirt bike",
    emoji: "🏁",
    zone: "garage",
    questions: [
      text("nickname", "What do you call it?", {
        required: true,
        suggestions: ["The dirt bike", "Trail bike"],
        example: "Trail bike",
      }),
      choice("use", "How do you ride it?", [
        c("trails", "Trails and fun"),
        c("farm", "Around the farm or yard"),
        c("track", "At a track"),
      ]),
      ...yearMakeModel(),
      engineSize(),
      valueGuess("About what is it worth today?"),
      photo("photo", "Add a photo of it"),
    ],
    coverages: [
      "rec_liability",
      "rec_collision",
      "rec_comprehensive",
      "rec_med_pay",
      "rec_accessories",
      "rec_roadside",
    ],
    xp: 75,
    goodToKnow: [
      "Track days and racing are usually handled differently from trail riding. Tell Loomis how you ride, and they can check what fits.",
    ],
  },
];

// ---------------------------------------------------------------------------
// PETS
// ---------------------------------------------------------------------------

const birthYear = (what: string): Question =>
  year("birth_year", `What year was ${what} born?`, { help: ROUGH_GUESS });

const PETS: ThingKind[] = [
  {
    id: "dog",
    category: "pets",
    label: "Dog",
    emoji: "🐶",
    zone: "yard",
    questions: [
      text("name", "What is your dog's name?", { required: true }),
      PET_SIZE,
      text("breed", "What breed is your dog?", {
        help: "Mixed breed? A best guess is fine. Some home insurers look at breed.",
        suggestions: ["Mixed breed"],
      }),
      birthYear("your dog"),
      photo("photo", "Add a photo of your dog"),
    ],
    coverages: [
      "pet_accident_illness",
      "pet_accident_only",
      "pet_wellness",
    ],
    xp: 75,
    goodToKnow: [
      "Some home insurers look at a dog's breed when they set up a policy. Loomis can help you find one that fits your pup.",
      "Pet health plans can help with vet bills. The best time to look is while your dog is young and healthy. Ask Loomis.",
    ],
  },
  {
    id: "cat",
    category: "pets",
    label: "Cat",
    emoji: "🐱",
    zone: "yard",
    questions: [
      text("name", "What is your cat's name?", { required: true }),
      choice("indoor_outdoor", "Where does your cat spend time?", [
        c("indoor", "Indoors"),
        c("both", "Indoors and outdoors"),
        c("outdoor", "Mostly outdoors"),
      ]),
      text("breed", "What breed is your cat?", {
        help: "A best guess is fine.",
        suggestions: ["Domestic shorthair", "Mixed breed"],
      }),
      birthYear("your cat"),
      photo("photo", "Add a photo of your cat"),
    ],
    coverages: [
      "pet_accident_illness",
      "pet_accident_only",
      "pet_wellness",
    ],
    xp: 75,
    goodToKnow: [
      "Pet health plans can help with vet bills. The best time to look is while your cat is young and healthy. Ask Loomis.",
    ],
  },
  {
    id: "horse",
    category: "pets",
    label: "Horse",
    emoji: "🐴",
    zone: "pasture",
    questions: [
      text("name", "What is your horse's name?", { required: true }),
      choice("horse_use", "What is your horse used for?", [
        c("pleasure", "Pleasure and trail riding"),
        c("show", "Showing or competing"),
        c("breeding", "Breeding"),
        c("work", "Ranch or farm work"),
        c("retired", "Retired"),
      ]),
      choice("kept", "Where is your horse kept?", [
        c("home", "At home"),
        c("boarding", "At a boarding barn"),
      ]),
      text("breed", "What breed is your horse?"),
      birthYear("your horse"),
      money("value", "About what is your horse worth?", { help: ROUGH_GUESS }),
      photo("photo", "Add a photo of your horse"),
    ],
    coverages: [
      "pet_equine_medical",
      "pet_equine_mortality",
    ],
    xp: 75,
    firstTimeReveal: PASTURE_REVEAL,
    goodToKnow: [
      "Home policies often treat horses differently from other pets. A farm policy or a horse policy may fit better. Ask Loomis.",
    ],
  },
  {
    id: "bird_exotic",
    category: "pets",
    label: "Bird or exotic pet",
    emoji: "🦜",
    zone: "yard",
    questions: [
      text("name", "What is your pet's name?", { required: true }),
      text("species", "What kind of animal is it?", { example: "Parrot", suggestions: ["Parrot", "Parakeet", "Snake", "Lizard"] }),
      birthYear("your pet"),
      photo("photo", "Add a photo of your pet"),
    ],
    coverages: [
      "pet_accident_illness",
    ],
    xp: 75,
    goodToKnow: [
      "Not every pet health plan includes birds and exotic pets. Loomis can help check.",
    ],
  },
  {
    id: "other_pet",
    category: "pets",
    label: "Other pet",
    emoji: "🐰",
    zone: "yard",
    questions: [
      text("name", "What is your pet's name?", { required: true }),
      text("species", "What kind of animal is it?", { example: "Rabbit", suggestions: ["Rabbit", "Guinea pig", "Fish", "Hamster"] }),
      photo("photo", "Add a photo of your pet"),
    ],
    coverages: [
      "pet_accident_illness",
    ],
    xp: 50,
  },
];

// ---------------------------------------------------------------------------
// VALUABLES (zone: the treasure chest)
// ---------------------------------------------------------------------------

const VALUABLE_KINDS: ThingKind[] = [
  {
    id: "jewelry",
    category: "valuables",
    label: "Jewelry",
    emoji: "💍",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Engagement ring", "Wedding band", "Grandma's necklace", "Earrings"]),
    coverages: [
      "val_jewelry",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: VALUABLES_NOTES,
  },
  {
    id: "watch",
    category: "valuables",
    label: "Watch",
    emoji: "⌚",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Dad's watch", "Anniversary watch"], [
      text("brand", "Who makes it?", { example: "Omega" }),
    ]),
    coverages: [
      "val_watch",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: VALUABLES_NOTES,
  },
  {
    id: "fine_art",
    category: "valuables",
    label: "Art",
    emoji: "🎨",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Oil painting", "Sculpture", "Signed print"], [
      choice("art_type", "What kind of art is it?", [
        c("painting", "Painting"),
        c("sculpture", "Sculpture"),
        c("print_photo", "Print or photograph"),
        c("rug_tapestry", "Rug or tapestry"),
        c("other", "Something else"),
      ]),
      text("artist", "Who made it?"),
    ]),
    coverages: [
      "val_art",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: [
      ...VALUABLES_NOTES,
      "Art can be hurt by sunlight and moisture, and by being moved. A listed-item policy can look at those risks. Ask Loomis.",
    ],
  },
  {
    id: "collectibles",
    category: "valuables",
    label: "Collection",
    emoji: "🏺",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Coin collection", "Stamp album", "Baseball cards"], [
      choice("collection_type", "What kind of collection is it?", [
        c("coins", "Coins"),
        c("stamps", "Stamps"),
        c("cards", "Trading cards"),
        c("memorabilia", "Sports or movie memorabilia"),
        c("toys_dolls", "Toys or dolls"),
        c("comics_books", "Comics or books"),
        c("other", "Something else"),
      ]),
    ]),
    coverages: [
      "val_collectibles",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: VALUABLES_NOTES,
  },
  {
    id: "firearm",
    category: "valuables",
    label: "Firearm",
    emoji: "🎯",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Hunting rifle", "Shotgun", "Grandpa's pistol"], [
      choice("firearm_type", "What kind is it?", [
        c("rifle", "Rifle"),
        c("shotgun", "Shotgun"),
        c("handgun", "Handgun"),
        c("collection", "A collection"),
      ]),
      yesno("locked_safe", "Is it kept in a locked safe or cabinet?"),
    ]),
    coverages: [
      "val_firearms",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: [
      ...VALUABLES_NOTES,
      "Many insurers like firearms kept in a locked safe or cabinet. Ask Loomis about listing yours by name.",
    ],
  },
  {
    id: "musical_instrument",
    category: "valuables",
    label: "Musical instrument",
    emoji: "🎸",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Acoustic guitar", "Piano", "Violin"], [
      choice("instrument_type", "What kind is it?", [
        c("guitar", "Guitar"),
        c("piano", "Piano or keyboard"),
        c("strings", "Violin, cello or other strings"),
        c("brass_wind", "Brass or woodwind"),
        c("drums", "Drums"),
        c("other", "Something else"),
      ]),
      earnsMoney(),
    ]),
    coverages: [
      "val_instruments",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: [
      ...VALUABLES_NOTES,
      "If you play paid gigs, that can change how a policy works. Tell Loomis, who can check what fits.",
    ],
  },
  {
    id: "camera_gear",
    category: "valuables",
    label: "Camera gear",
    emoji: "📷",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Camera and lenses", "Video camera"], [earnsMoney()]),
    coverages: [
      "val_cameras",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: [
      ...VALUABLES_NOTES,
      "If you shoot photos or video for pay, that can change how a policy works. Tell Loomis, who can check what fits.",
    ],
  },
  {
    id: "sports_gear",
    category: "valuables",
    label: "Sports gear",
    emoji: "🏅",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Golf clubs", "Skis", "Fishing gear"], [
      choice("gear_type", "What kind of gear is it?", [
        c("golf", "Golf clubs"),
        c("snow", "Skis or snowboard"),
        c("fishing", "Fishing gear"),
        c("hunting_archery", "Hunting or archery gear"),
        c("camping", "Camping or hiking gear"),
        c("other", "Something else"),
      ]),
    ]),
    coverages: [
      "val_sports",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: VALUABLES_NOTES,
  },
  {
    id: "silverware",
    category: "valuables",
    label: "Silverware",
    emoji: "🍴",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Sterling flatware set", "Silver tea set"]),
    coverages: [
      "val_silverware",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: VALUABLES_NOTES,
  },
  {
    id: "high_end_bicycle",
    category: "valuables",
    label: "High-end bicycle",
    emoji: "🚴",
    zone: "vault",
    questions: valuableQuestions("What is it?", ["Road bike", "Mountain bike"], [
      text("brand", "Who makes it?", { example: "Trek" }),
      yesno("racing", "Do you race it?"),
    ]),
    coverages: [
      "val_bicycle",
    ],
    xp: 75,
    firstTimeReveal: VAULT_REVEAL,
    goodToKnow: [
      ...VALUABLES_NOTES,
      "Bikes are often stolen from cars and garages. A listed-item policy can help wherever your bike is. Ask Loomis.",
    ],
  },
];

// ---------------------------------------------------------------------------
// WORK
//
// Business insurance is a v1 hard stop. `business` asks for exactly two things
// and offers exactly one coverage, a chat with Loomis. validateCatalog() holds
// that line.
// ---------------------------------------------------------------------------

const WORK: ThingKind[] = [
  {
    id: "job",
    category: "work",
    label: "Job",
    emoji: "💼",
    zone: "town",
    questions: [
      text("job_title", "What is the job?", {
        required: true,
        suggestions: ["Teacher", "Nurse", "Truck driver", "Office manager"],
        example: "Teacher",
      }),
      text("whose_job", "Whose job is it?", { help: "Type a name from your family." }),
      choice("employment", "How do they work?", [
        c("full_time", "Full-time"),
        c("part_time", "Part-time"),
        c("self_employed", "Self-employed"),
        c("seasonal", "Seasonal or contract"),
      ]),
      text("employer", "Who do they work for?", { suggestions: ["Self-employed"] }),
      multi(
        "employer_benefits",
        "Does work offer any of these?",
        [
          c("life", "Life insurance"),
          c("disability", "Disability insurance"),
          c("health", "Health insurance"),
        ],
        { help: "Pick all that apply. Not sure? Skip it." },
      ),
    ],
    coverages: [],
    xp: 100,
    firstTimeReveal: TOWN_REVEAL,
    goodToKnow: [
      "Life and disability insurance from work often ends when the job does. A plan of your own can stay with you. Ask Loomis.",
      "Work plans may pay less than you think, or stop at a certain age. Loomis can help you see how the pieces fit.",
    ],
  },
  {
    id: "side_gig",
    category: "work",
    label: "Side gig",
    emoji: "🛠️",
    zone: "town",
    questions: [
      text("gig_name", "What is the side gig?", {
        required: true,
        suggestions: ["Etsy shop", "Lawn care", "DoorDash", "Babysitting"],
        example: "Etsy shop",
      }),
      text("whose_gig", "Whose side gig is it?", { help: "Type a name from your family." }),
      choice("gig_type", "What kind is it?", [
        c("driving", "Driving or delivery"),
        c("selling", "Selling things"),
        c("care", "Child, pet or elder care"),
        c("home_services", "Home services or repairs"),
        c("creative", "Photos, art or other creative work"),
        c("other", "Something else"),
      ]),
      yesno("uses_vehicle", "Do you use your own car or truck for it?"),
      yesno("from_home", "Do you do the work from home?"),
    ],
    coverages: [
      "commercial_review",
    ],
    xp: 75,
    firstTimeReveal: TOWN_REVEAL,
    goodToKnow: [
      "A side gig can change how your home and car policies work. Delivery driving is one example. Ask Loomis.",
    ],
  },
  {
    id: "business",
    category: "work",
    label: "Business I own",
    emoji: "🏪",
    zone: "town",
    questions: [
      text("business_name", "What is the business called?", { required: true, example: "Smith Family Landscaping" }),
      text("description", "What does it do?", { help: "A sentence or two is plenty. Loomis will call to learn more." }),
    ],
    coverages: [
      "commercial_review",
    ],
    xp: 100,
    firstTimeReveal: TOWN_REVEAL,
    goodToKnow: [
      "Business insurance works a little differently. Loomis will talk with you about what fits your business.",
    ],
  },
];

// ---------------------------------------------------------------------------

export const THING_KINDS: ThingKind[] = [
  ...PEOPLE,
  ...RESIDENCES,
  ...HOME_SYSTEMS,
  ...VEHICLES,
  ...TOYS,
  ...PETS,
  ...VALUABLE_KINDS,
  ...WORK,
];
