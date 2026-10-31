import type { Line } from "./types.ts";

/**
 * Lines of business, in the order they appear on the budget screen.
 *
 * STAFF REVIEW NEEDED: `agencyWrites` is our best guess. Lines marked `true`
 * are the mainstream personal lines. Lines marked `false` are ones we don't
 * know Loomis writes today; those still show up in the client's plan, but the
 * quote button reads "Ask Loomis about this" so nobody is promised a product we
 * don't sell. Flip a line to `true` here and re-run
 * `cd risk-manager && npm run catalog:check`
 * to refresh docs/COVERAGE_TREE.md.
 *
 * `commercial` stays `false` on purpose: business insurance is a v1 hard stop.
 * We record the business and Loomis follows up by phone.
 */
export const LINES: Line[] = [
  {
    id: "auto",
    label: "Auto",
    plainEnglish: "Helps with the cost of crashes, repairs and injuries when you drive your car or truck.",
    emoji: "🚗",
    agencyWrites: true,
  },
  {
    id: "home",
    label: "Home",
    plainEnglish: "Helps with the cost of fixing your house and replacing your things after damage or theft.",
    emoji: "🏡",
    agencyWrites: true,
  },
  {
    id: "renters",
    label: "Renters",
    plainEnglish: "Helps with the cost of replacing your things when you rent, and if someone is hurt at your place.",
    emoji: "🛋️",
    agencyWrites: true,
  },
  {
    id: "condo",
    label: "Condo",
    plainEnglish: "Helps with the cost of fixing the inside of your condo and replacing your things.",
    emoji: "🏢",
    agencyWrites: true,
  },
  {
    id: "landlord",
    label: "Rental property",
    plainEnglish: "Helps with the cost of fixing a home you rent out, and the rent you might miss.",
    emoji: "🔑",
    agencyWrites: true,
  },
  {
    id: "flood",
    label: "Flood",
    plainEnglish: "Helps with the cost of fixing your home and replacing your things after flood water.",
    emoji: "🌊",
    agencyWrites: true,
  },
  {
    id: "earthquake",
    label: "Earthquake",
    plainEnglish: "Helps with the cost of fixing your home and replacing your things after an earthquake.",
    emoji: "🌎",
    agencyWrites: false,
  },
  {
    id: "umbrella",
    label: "Umbrella",
    plainEnglish: "Adds a big extra layer of protection on top of your car and home policies.",
    emoji: "☂️",
    agencyWrites: true,
  },
  {
    id: "valuables",
    label: "Valuables",
    plainEnglish: "Lists special things like jewelry and art by name, so they count at their full value.",
    emoji: "💎",
    agencyWrites: true,
  },
  {
    id: "motorcycle",
    label: "Motorcycle",
    plainEnglish: "Helps with the cost of crashes and repairs on your motorcycle.",
    emoji: "🏍️",
    agencyWrites: true,
  },
  {
    id: "recreational",
    label: "ATVs, carts & more",
    plainEnglish: "Helps with the cost of repairs and injuries from ATVs, snowmobiles, golf carts and dirt bikes.",
    emoji: "🏞️",
    agencyWrites: true,
  },
  {
    id: "watercraft",
    label: "Boats & jet skis",
    plainEnglish: "Helps with the cost of fixing your boat or jet ski, and if someone is hurt on the water.",
    emoji: "⛵",
    agencyWrites: true,
  },
  {
    id: "rv",
    label: "RVs & campers",
    plainEnglish: "Helps with the cost of repairs and trip trouble for your motorhome or camper.",
    emoji: "🚐",
    agencyWrites: true,
  },
  {
    id: "collector_vehicle",
    label: "Classic cars",
    plainEnglish: "Helps look after a classic or collector car at a value you agree on up front.",
    emoji: "🚘",
    agencyWrites: true,
  },
  {
    id: "pet",
    label: "Pet health",
    plainEnglish: "Helps with vet bills when your pet is hurt or sick.",
    emoji: "🐾",
    agencyWrites: false,
  },
  {
    id: "life",
    label: "Life",
    plainEnglish: "Helps the people who count on you with money if you pass away.",
    emoji: "🌳",
    agencyWrites: true,
  },
  {
    id: "disability",
    label: "Disability",
    plainEnglish: "Helps replace part of your paycheck if you can't work for a while.",
    emoji: "💵",
    agencyWrites: false,
  },
  {
    id: "long_term_care",
    label: "Long-term care",
    plainEnglish: "Helps with the cost of care at home or in a care center as you get older.",
    emoji: "🤝",
    agencyWrites: false,
  },
  {
    id: "health",
    label: "Health",
    plainEnglish: "Helps with doctor and hospital bills.",
    emoji: "❤️",
    agencyWrites: false,
  },
  {
    id: "medicare",
    label: "Medicare",
    plainEnglish: "Helps with doctor, hospital and drug costs for people on Medicare.",
    emoji: "🏥",
    agencyWrites: false,
  },
  {
    id: "supplemental_health",
    label: "Extra health plans",
    plainEnglish: "Can send extra cash when you are hurt, very sick or in the hospital.",
    emoji: "➕",
    agencyWrites: false,
  },
  {
    id: "dental_vision",
    label: "Dental & vision",
    plainEnglish: "Helps with dentist visits, eye exams and glasses.",
    emoji: "😁",
    agencyWrites: false,
  },
  {
    id: "travel",
    label: "Travel",
    plainEnglish: "Helps with trip costs and doctor bills when plans change or you are far from home.",
    emoji: "✈️",
    agencyWrites: false,
  },
  {
    id: "identity_theft",
    label: "Identity & cyber",
    plainEnglish: "Helps you sort things out if someone steals your identity or hacks your accounts.",
    emoji: "🔐",
    agencyWrites: false,
  },
  {
    id: "event",
    label: "Weddings & events",
    plainEnglish: "Helps with a wedding or party if plans change or a guest is hurt.",
    emoji: "🎉",
    agencyWrites: false,
  },
  {
    id: "commercial",
    label: "Business",
    plainEnglish: "Business insurance is a little different. Loomis will talk with you about what fits.",
    emoji: "🏪",
    agencyWrites: false,
  },
];
