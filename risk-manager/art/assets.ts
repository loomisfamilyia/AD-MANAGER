/**
 * THE ART MANIFEST: the single source of truth for every picture in the game.
 *
 * One entry per image to draw. Three things read this list:
 *   1. `npm run art:brief` turns it into the PDF art guide for the illustrator
 *      (art/Loomis-Risk-Manager-Art-Brief.pdf). Everything in the guide's
 *      checklists comes from here, so edit this file, never the PDF.
 *   2. The app loads art BY FILE NAME. The name in `file` (plus the variant,
 *      for entries that have one) is exactly what the code asks for, so a
 *      rename here is a code change too.
 *   3. The brief script refuses to run if a catalog kind (src/catalog/kinds.ts)
 *      or a life event has no art listed here, so new kinds can't be forgotten.
 *
 * File names: lowercase-kebab, always `.png`. When an entry has `variants`,
 * `file` is the BASE name and every variant is its own file, inserted before
 * the extension: `vehicle-sedan.png` + "red" is `vehicle-sedan-red.png`. Use
 * `expandFiles()` to get the real list.
 *
 * `placeholder` is the emoji the app shows today until the art arrives. `kinds`
 * lists the catalog kind ids (kinds.ts) a picture stands for. Art for things
 * that are not a kind (Roxie, the sky, badges) simply omits it.
 *
 * Rounds: 1 is the first playable beta, 2 is the deep tree on the map, 3 is
 * everything inside the home plus extras.
 */

export type Round = 1 | 2 | 3;

/** Canvas sizes in pixels, width x height. Add a size here before using it. */
export type ArtSize =
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1024x512"
  | "1024x256"
  | "2048x1024"
  | "1600x1000"
  | "1080x1920";

export interface ArtAsset {
  /** Base file name: lowercase-kebab ending in .png, for example "hq-building.png". */
  file: string;
  round: Round;
  /** The checklist section this belongs to, for example "Roxie, our guide". */
  group: string;
  /** A short human name for the picture. */
  title: string;
  /** One plain sentence for the illustrator. No jargon. */
  whatToDraw: string;
  size: ArtSize;
  /** Each variant is its own file: "<name>-<variant>.png". Colors, skin tones, numbered copies. */
  variants?: string[];
  /** What the variants are, plural, for the guide: "colors", "skin tones", "versions", "frames". */
  variantLabel?: string;
  /** Plain-words help for the variants, shown after the list. */
  variantHelp?: string;
  /** Catalog kind ids (src/catalog/kinds.ts) this art represents. */
  kinds?: string[];
  /** The emoji the app uses today. */
  placeholder?: string;
  /** Anything extra the illustrator should know. */
  notes?: string;
}

/** The real file names an entry produces: one per variant, or just the base name. */
export function expandFiles(asset: Pick<ArtAsset, "file" | "variants">): string[] {
  if (!asset.variants || asset.variants.length === 0) return [asset.file];
  const stem = asset.file.replace(/\.png$/, "");
  return asset.variants.map((v) => `${stem}-${v}.png`);
}

const SKIN_TONES = ["t1", "t2", "t3", "t4"];
const SKIN_HELP = "t1 light, t2 medium-light, t3 medium-dark, t4 dark. Draw one and recolor the skin.";
const CAR_COLORS = ["red", "blue", "white", "black", "silver", "green"];
const NO_ROXIE =
  "A client's dog must never look like Roxie: no blue collar, no gold tag and no shaggy grey coat. No collar or a plain red one is fine.";

export const ASSETS: ArtAsset[] = [
  // =========================================================================
  // ROUND 1: the first playable beta
  // =========================================================================

  // --- Roxie, our guide ----------------------------------------------------
  {
    file: "roxie-turnaround.png", round: 1, group: "Roxie, our guide", title: "Roxie turnaround sheet", size: "2048x1024",
    whatToDraw: "Roxie standing in three views side by side (front, side facing right, and back) so every later pose stays on-model.",
    placeholder: "🐶",
    notes: "Please send this one first, before any other Roxie pose. Put all three views on the same ground line with even spacing.",
  },
  {
    file: "roxie-sit.png", round: 1, group: "Roxie, our guide", title: "Roxie sitting", size: "1024x1024",
    whatToDraw: "Roxie sitting happily, facing front and turned a little to the right: her default, resting pose.",
    placeholder: "🐶",
  },
  {
    file: "roxie-wave.png", round: 1, group: "Roxie, our guide", title: "Roxie waving", size: "1024x1024",
    whatToDraw: "Roxie sitting with one front paw raised in a friendly hello.",
    placeholder: "🐶",
  },
  {
    file: "roxie-talk.png", round: 1, group: "Roxie, our guide", title: "Roxie talking", size: "1024x1024",
    whatToDraw: "Roxie with her head tilted and her mouth open as if she is speaking, leaving room beside her for a speech bubble.",
    placeholder: "🐶",
  },
  {
    file: "roxie-happy.png", round: 1, group: "Roxie, our guide", title: "Roxie happy", size: "1024x1024",
    whatToDraw: "Roxie standing with her tongue out, a big smile and her tail curled up high.",
    placeholder: "🐶",
  },
  {
    file: "roxie-run.png", round: 1, group: "Roxie, our guide", title: "Roxie running", size: "1024x1024",
    whatToDraw: "Roxie running, seen from the side and facing right, with her ears bouncing.",
    placeholder: "🐶",
  },
  {
    file: "roxie-carry-envelope.png", round: 1, group: "Roxie, our guide", title: "Roxie carrying a quote request", size: "1024x1024",
    whatToDraw: "Roxie running with an envelope held gently in her mouth, on her way to deliver a quote request to HQ.",
    placeholder: "🐶",
    notes: "The envelope is blank: no address and no writing.",
  },
  {
    file: "roxie-celebrate.png", round: 1, group: "Roxie, our guide", title: "Roxie celebrating", size: "1024x1024",
    whatToDraw: "Roxie jumping for joy, with her ears flying up and all four paws off the ground.",
    placeholder: "🐶",
    notes: "She is in the air, so her feet will be above the ground line. Keep her centered.",
  },
  {
    file: "roxie-sleep.png", round: 1, group: "Roxie, our guide", title: "Roxie sleeping", size: "1024x1024",
    whatToDraw: "Roxie curled up asleep in a round, cozy shape with her tail over her nose.",
    placeholder: "🐶",
  },
  {
    file: "roxie-point.png", round: 1, group: "Roxie, our guide", title: "Roxie pointing", size: "1024x1024",
    whatToDraw: "Roxie leaning to the right with her nose pointing that way, a friendly \"look over here\" pose.",
    placeholder: "🐶",
    notes: "This is the \"tap here\" pose. The app adds any arrow or label.",
  },
  {
    file: "roxie-think.png", round: 1, group: "Roxie, our guide", title: "Roxie thinking", size: "1024x1024",
    whatToDraw: "Roxie with her head tilted and a small curl of fur on top of her head that bends into a question-mark shape.",
    placeholder: "🐶",
    notes: "The curl is a drawn shape only. Please don't add any real letters or text.",
  },
  {
    file: "roxie-proud-shield.png", round: 1, group: "Roxie, our guide", title: "Roxie with the gold shield", size: "1024x1024",
    whatToDraw: "Roxie sitting proudly with her chest out beside a big gold shield.",
    placeholder: "🐶",
    notes: "Match the gold of the shield-gold piece. Leave the middle of the shield plain.",
  },
  {
    file: "roxie-guard.png", round: 1, group: "Roxie, our guide", title: "Roxie on guard", size: "1024x1024",
    whatToDraw: "Roxie sitting proudly and calmly in front of a closed gold padlock, protective but never fierce: she is the face of the \"Your world is safe with us\" privacy screen shown just before a client creates an account.",
    placeholder: "🐶",
    notes: "Keep her warm and friendly, with a soft smile and relaxed ears. A small round vault door would also work in place of the padlock. No text on it.",
  },
  {
    file: "roxie-headshot.png", round: 1, group: "Roxie, our guide", title: "Roxie headshot", size: "1024x1024",
    whatToDraw: "Just Roxie's head, smiling at us and framed to fit neatly inside a circle.",
    placeholder: "💬",
    notes: "Used on the chat button and in chat. Let the head fill about 85% of the canvas so the ears stay inside the circle.",
  },

  // --- Loomis HQ -------------------------------------------------------------
  {
    file: "hq-building.png", round: 1, group: "Loomis HQ", title: "Loomis HQ building", size: "1024x1024",
    whatToDraw: "A friendly little agency office with a welcoming front door and a blank sign panel above it that reads as \"the agency\" at a glance.",
    notes: "Leave the sign panel empty, because the app adds the name. Use Loomis brand colors for the roof and trim if you have them.",
  },
  {
    file: "hq-flag.png", round: 1, group: "Loomis HQ", title: "HQ flag", size: "512x512",
    whatToDraw: "Just a flag on a pole, in Loomis gold, drawn on its own so we can make it wave.",
    notes: "Draw the flag flat and straight. Put the foot of the pole on the ground line in the center of the canvas.",
  },
  {
    file: "hq-hill.png", round: 1, group: "Loomis HQ", title: "HQ hill", size: "1024x512",
    whatToDraw: "A low, wide grassy mound with a flat top for HQ to sit on.",
    notes: "No building on it, because HQ is its own piece. Use the three grass greens and let the mound fill the canvas width with a little padding.",
  },
  {
    file: "roxie-doghouse.png", round: 1, group: "Loomis HQ", title: "Roxie's doghouse (optional)", size: "512x512",
    whatToDraw: "A cute little doghouse with a round doorway and a Loomis-blue roof, sitting beside HQ.",
    notes: "Optional: nice to have, but not needed for the first beta.",
  },

  // --- People ----------------------------------------------------------------
  {
    file: "person-baby.png", round: 1, group: "People", title: "Baby", size: "1024x1024",
    whatToDraw: "A baby sitting up in a cozy onesie, with a big round head, a tiny tuft of hair and a happy smile.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👶",
  },
  {
    file: "person-child-girl.png", round: 1, group: "People", title: "Girl (about 7)", size: "1024x1024",
    whatToDraw: "A girl of about seven, standing and smiling, with a ponytail or pigtails and a bright shirt and shorts.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👧",
  },
  {
    file: "person-child-boy.png", round: 1, group: "People", title: "Boy (about 7)", size: "1024x1024",
    whatToDraw: "A boy of about seven, standing and smiling, with short hair and a bright shirt and shorts.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👦",
  },
  {
    file: "person-teen.png", round: 1, group: "People", title: "Teenager", size: "1024x1024",
    whatToDraw: "A relaxed teenager in a hoodie and jeans with a backpack over one shoulder.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "🧑",
  },
  {
    file: "person-woman.png", round: 1, group: "People", title: "Woman", size: "1024x1024",
    whatToDraw: "An adult woman standing, smiling and relaxed, in everyday casual clothes.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👩",
  },
  {
    file: "person-man.png", round: 1, group: "People", title: "Man", size: "1024x1024",
    whatToDraw: "An adult man standing, smiling and relaxed, in everyday casual clothes.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👨",
  },
  {
    file: "person-older-woman.png", round: 1, group: "People", title: "Older woman", size: "1024x1024",
    whatToDraw: "An older woman with silver hair and a warm smile in a cozy cardigan, standing tall and cheerful.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👵",
  },
  {
    file: "person-older-man.png", round: 1, group: "People", title: "Older man", size: "1024x1024",
    whatToDraw: "An older man with white hair and a warm smile in a sweater vest, standing tall and cheerful.",
    variants: SKIN_TONES, variantLabel: "skin tones", variantHelp: SKIN_HELP, kinds: ["person"], placeholder: "👴",
  },

  // --- Homes -----------------------------------------------------------------
  {
    file: "home-house-ranch.png", round: 1, group: "Homes", title: "Ranch house", size: "1024x1024",
    whatToDraw: "A friendly one-story ranch house with a low roof, a chimney, a front door and a small porch.",
    kinds: ["house_owned"], placeholder: "🏡",
    notes: "Draw all the homes at a similar size so one can swap for another without the world shifting.",
  },
  {
    file: "home-house-two-story.png", round: 1, group: "Homes", title: "Two-story house", size: "1024x1024",
    whatToDraw: "A friendly two-story house with a chimney, a front door and windows upstairs and down.",
    kinds: ["house_owned"], placeholder: "🏡",
  },
  {
    file: "home-house-farmhouse.png", round: 1, group: "Homes", title: "Farmhouse", size: "1024x1024",
    whatToDraw: "A cozy farmhouse with a steep roof and a front porch that wraps around the corner.",
    kinds: ["house_owned"], placeholder: "🏡",
  },
  {
    file: "home-condo.png", round: 1, group: "Homes", title: "Condo", size: "1024x1024",
    whatToDraw: "A small condo building a few floors tall, with little balconies and a friendly entrance.",
    kinds: ["condo_owned"], placeholder: "🏢",
  },
  {
    file: "home-apartment.png", round: 1, group: "Homes", title: "Apartment building", size: "1024x1024",
    whatToDraw: "A small apartment building with rows of windows, a front entrance and a flat roof.",
    kinds: ["home_rented"], placeholder: "🏠",
    notes: "The app uses this one for any place a client rents: apartment, house, townhome or duplex.",
  },
  {
    file: "home-rental-house.png", round: 1, group: "Homes", title: "Rental house", size: "1024x1024",
    whatToDraw: "A cottage-style house with a gold key-shaped sign hanging beside the door.",
    kinds: ["landlord_property"], placeholder: "🔑",
    notes: "The key-shaped sign is blank: no writing on it.",
  },
  {
    file: "home-cabin.png", round: 1, group: "Homes", title: "Vacation cabin", size: "1024x1024",
    whatToDraw: "A log cabin with a stone chimney and a little porch, made for weekends away.",
    kinds: ["vacation_home"], placeholder: "🏖️",
  },
  {
    file: "home-mobile.png", round: 1, group: "Homes", title: "Mobile home", size: "1024x1024",
    whatToDraw: "A tidy mobile home with a little front deck and steps.",
    kinds: ["mobile_home"], placeholder: "🏘️",
  },
  {
    file: "home-dorm.png", round: 1, group: "Homes", title: "Student dorm", size: "1024x1024",
    whatToDraw: "A brick student dorm with rows of windows and a big arched entrance.",
    kinds: ["college_housing"], placeholder: "🎓",
  },

  // --- Everyday vehicles -----------------------------------------------------
  {
    file: "vehicle-sedan.png", round: 1, group: "Everyday vehicles", title: "Sedan", size: "1024x1024",
    whatToDraw: "A chunky four-door sedan with slightly oversized wheels, seen from the front right.",
    variants: CAR_COLORS, variantLabel: "colors", variantHelp: "Hex codes are on the style guide page.", kinds: ["car"], placeholder: "🚗",
    notes: "Keep the body as one flat color group so each color is a quick recolor. Windows, tires and lights stay the same in every color.",
  },
  {
    file: "vehicle-suv.png", round: 1, group: "Everyday vehicles", title: "SUV", size: "1024x1024",
    whatToDraw: "A chunky SUV with a roof rack and slightly oversized wheels.",
    variants: CAR_COLORS, variantLabel: "colors", variantHelp: "Hex codes are on the style guide page.", kinds: ["car"], placeholder: "🚗",
  },
  {
    file: "vehicle-pickup.png", round: 1, group: "Everyday vehicles", title: "Pickup truck", size: "1024x1024",
    whatToDraw: "A chunky pickup truck with an open bed and slightly oversized wheels.",
    variants: CAR_COLORS, variantLabel: "colors", variantHelp: "Hex codes are on the style guide page.", kinds: ["car"], placeholder: "🛻",
  },

  // --- World basics ----------------------------------------------------------
  {
    file: "ground-grass-tile.png", round: 1, group: "World basics", title: "Grass tile", size: "1024x1024",
    whatToDraw: "A soft square of grass that repeats seamlessly in every direction, with gentle lighter stripes and a few tiny blades.",
    notes: "Seamless means the left edge matches the right and the top matches the bottom. Fill the whole canvas, with no outline.",
  },
  {
    file: "driveway-pad.png", round: 1, group: "World basics", title: "Driveway pad", size: "1024x512",
    whatToDraw: "A flat grey paved parking pad with softly rounded corners, where cars park.",
    placeholder: "🚗",
  },
  {
    file: "path-stones.png", round: 1, group: "World basics", title: "Stone path", size: "512x512",
    whatToDraw: "A short stretch of round stepping stones in warm stone colors that we repeat to make a path to the door.",
    notes: "The path should enter the middle of the left edge and leave the middle of the right edge so copies join end to end.",
  },
  {
    file: "flower.png", round: 1, group: "World basics", title: "Flowers", size: "256x256",
    whatToDraw: "Four different little flowers, such as a daisy, a tulip, a poppy and a bluebell, each in its own file.",
    variants: ["1", "2", "3", "4"], variantLabel: "versions", placeholder: "🌼",
  },
  {
    file: "grass-tuft.png", round: 1, group: "World basics", title: "Grass tufts", size: "256x256",
    whatToDraw: "Three small tufts of grass in slightly different shapes.",
    variants: ["1", "2", "3"], variantLabel: "versions", placeholder: "🌿",
  },
  {
    file: "tree.png", round: 1, group: "World basics", title: "Trees", size: "512x512",
    whatToDraw: "Three friendly trees in different shapes, such as a round oak, a tall pine and a small apple tree.",
    variants: ["1", "2", "3"], variantLabel: "versions", placeholder: "🌳",
  },
  {
    file: "bush.png", round: 1, group: "World basics", title: "Bushes", size: "512x512",
    whatToDraw: "Two soft, round bushes: one plain green and one dotted with little flowers or berries.",
    variants: ["1", "2"], variantLabel: "versions", placeholder: "🌿",
  },
  {
    file: "cloud.png", round: 1, group: "World basics", title: "Clouds", size: "1024x512",
    whatToDraw: "Three fluffy white clouds in different shapes, with a very pale blue underside.",
    variants: ["1", "2", "3"], variantLabel: "versions", placeholder: "☁️",
    notes: "Scenery like clouds is soft and needs no navy outline.",
  },

  // --- Game pieces -----------------------------------------------------------
  {
    file: "vault-chest-closed.png", round: 1, group: "Game pieces", title: "Treasure chest, closed", size: "1024x1024",
    whatToDraw: "A sturdy wooden treasure chest with gold bands and a latch, lid closed, where valuables are kept.",
    placeholder: "🧰",
  },
  {
    file: "vault-chest-open.png", round: 1, group: "Game pieces", title: "Treasure chest, open", size: "1024x1024",
    whatToDraw: "The same chest with the lid open, a soft golden glow and a few sparkles rising from inside.",
    placeholder: "🧰",
    notes: "Keep it the same size and position as the closed chest so the two swap cleanly.",
  },
  {
    file: "shield-gold.png", round: 1, group: "Game pieces", title: "Gold shield", size: "512x512",
    whatToDraw: "A proud gold shield with a soft highlight and a rounded rim, the \"Covered by Loomis\" emblem.",
    placeholder: "🛡️",
    notes: "Leave the middle plain. The other shield states are drawn by the app.",
  },
  {
    file: "envelope.png", round: 1, group: "Game pieces", title: "Envelope", size: "512x512",
    whatToDraw: "A closed envelope with a little gold seal on the flap.",
    placeholder: "✉️",
    notes: "Blank: no address and no writing.",
  },
  {
    file: "sparkle.png", round: 1, group: "Game pieces", title: "Sparkle", size: "256x256",
    whatToDraw: "A single four-pointed gold sparkle with a soft white highlight.",
    placeholder: "✨",
  },
  {
    file: "confetti.png", round: 1, group: "Game pieces", title: "Confetti bits", size: "256x256",
    whatToDraw: "Six little pieces of party confetti (ribbons, dots, stars and squares) in the brand colors, one shape per file.",
    variants: ["1", "2", "3", "4", "5", "6"], variantLabel: "versions", placeholder: "🎉",
  },
  {
    file: "dust-puff.png", round: 1, group: "Game pieces", title: "Landing dust puff", size: "512x512",
    whatToDraw: "Three frames of a soft puff of dust when something lands: a small puff, then a bigger one, then a thin one fading away.",
    variants: ["1", "2", "3"], variantLabel: "frames", variantHelp: "1 small, 2 big, 3 fading.", placeholder: "💨",
  },
  {
    file: "app-icon.png", round: 1, group: "Game pieces", title: "App icon", size: "1024x1024",
    whatToDraw: "Roxie's smiling head, centered on a square of Loomis Blue (#1D4ED8).",
    notes: "This is the one piece that has a background (the blue square). Keep everything important inside the central 80%, because phones round off the corners.",
  },

  // =========================================================================
  // ROUND 2: the deep tree on the map
  // =========================================================================

  // --- More vehicles -----------------------------------------------------------
  {
    file: "vehicle-minivan.png", round: 2, group: "More vehicles", title: "Minivan", size: "1024x1024",
    whatToDraw: "A chunky minivan with a sliding side door and slightly oversized wheels.",
    variants: CAR_COLORS, variantLabel: "colors", kinds: ["car"], placeholder: "🚐",
    notes: "Used when a client picks \"van\" for their car.",
  },
  {
    file: "vehicle-motorcycle.png", round: 2, group: "More vehicles", title: "Motorcycle", size: "1024x1024",
    whatToDraw: "A chunky cruiser-style motorcycle with a round headlight and oversized wheels.",
    variants: ["red", "blue", "black"], variantLabel: "colors", kinds: ["motorcycle"], placeholder: "🏍️",
    notes: "One cruiser stands in for every bike type (sport, touring, scooter and the rest).",
  },
  {
    file: "vehicle-motorhome.png", round: 2, group: "More vehicles", title: "Motorhome", size: "1024x1024",
    whatToDraw: "A cheerful motorhome with a big windshield, a side window, a door and a little ladder on the back.",
    kinds: ["motorhome"], placeholder: "🚐",
  },
  {
    file: "vehicle-classic-car.png", round: 2, group: "More vehicles", title: "Classic car", size: "1024x1024",
    whatToDraw: "A round, shiny classic car from the 1950s with chrome bumpers and whitewall tires.",
    variants: ["red", "teal"], variantLabel: "colors", variantHelp: "Teal is #2BB3A6.", kinds: ["classic_car"], placeholder: "🚘",
  },

  // --- Toys --------------------------------------------------------------------
  {
    file: "toy-motorboat.png", round: 2, group: "Toys", title: "Motorboat", size: "1024x1024",
    whatToDraw: "A chunky little motorboat with a windshield and an outboard motor.",
    kinds: ["boat"], placeholder: "⛵",
    notes: "Stands in for fishing, ski, speed and small boats and cabin cruisers. Boats are drawn without water: the lake is its own piece.",
  },
  {
    file: "toy-sailboat.png", round: 2, group: "Toys", title: "Sailboat", size: "1024x1024",
    whatToDraw: "A cute sailboat with one big plain white sail and a small flag at the top.",
    kinds: ["boat"], placeholder: "⛵",
    notes: "No logos or numbers on the sail. No water.",
  },
  {
    file: "toy-pontoon.png", round: 2, group: "Toys", title: "Pontoon boat", size: "1024x1024",
    whatToDraw: "A flat-decked pontoon boat with two round floats, a bench seat and a little canopy roof.",
    kinds: ["boat"], placeholder: "⛵",
    notes: "No water.",
  },
  {
    file: "toy-jet-ski.png", round: 2, group: "Toys", title: "Jet ski", size: "1024x1024",
    whatToDraw: "A chunky jet ski with a padded seat and handlebars.",
    kinds: ["pwc"], placeholder: "🌊",
    notes: "No water, no splashes.",
  },
  {
    file: "toy-atv-utv.png", round: 2, group: "Toys", title: "ATV or side-by-side", size: "1024x1024",
    whatToDraw: "A chunky side-by-side with big knobby tires and a roll cage.",
    kinds: ["atv_utv"], placeholder: "🏞️",
    notes: "One picture stands in for both ATVs and side-by-sides.",
  },
  {
    file: "toy-snowmobile.png", round: 2, group: "Toys", title: "Snowmobile", size: "1024x1024",
    whatToDraw: "A chunky snowmobile with a curved windshield and two short skis at the front.",
    kinds: ["snowmobile"], placeholder: "🛷",
  },
  {
    file: "toy-golf-cart.png", round: 2, group: "Toys", title: "Golf cart", size: "1024x1024",
    whatToDraw: "A cute golf cart with a little roof, a bench seat and a golf bag on the back.",
    kinds: ["golf_cart"], placeholder: "⛳",
  },
  {
    file: "toy-camper.png", round: 2, group: "Toys", title: "Camper", size: "1024x1024",
    whatToDraw: "A cozy travel trailer with a door, a window and a little striped awning.",
    kinds: ["travel_trailer"], placeholder: "🏕️",
    notes: "Stands in for fifth wheels, pop-ups and toy haulers too.",
  },
  {
    file: "toy-utility-trailer.png", round: 2, group: "Toys", title: "Utility trailer", size: "1024x1024",
    whatToDraw: "A small open utility trailer with low rails, two round wheels and a hitch.",
    kinds: ["utility_trailer"], placeholder: "🚛",
  },
  {
    file: "toy-ebike-scooter.png", round: 2, group: "Toys", title: "E-bike or scooter", size: "1024x1024",
    whatToDraw: "A chunky e-bike with a battery pack on the frame and a friendly little basket.",
    kinds: ["ebike_scooter"], placeholder: "🛴",
    notes: "One picture stands in for electric scooters and other electric rides too.",
  },
  {
    file: "toy-drone.png", round: 2, group: "Toys", title: "Drone", size: "1024x1024",
    whatToDraw: "A friendly drone with four round rotors and a small camera underneath.",
    kinds: ["drone"], placeholder: "🚁",
  },
  {
    file: "toy-dirt-bike.png", round: 2, group: "Toys", title: "Dirt bike", size: "1024x1024",
    whatToDraw: "A chunky dirt bike with knobby tires, tall front forks and a high fender.",
    kinds: ["dirt_bike"], placeholder: "🏁",
  },

  // --- Pets ----------------------------------------------------------------------
  {
    file: "pet-dog-small.png", round: 2, group: "Pets", title: "Small dog", size: "1024x1024",
    whatToDraw: "A small, fluffy pet dog sitting happily with floppy ears and a wagging tail.",
    variants: ["white", "brown"], variantLabel: "coats", kinds: ["dog"], placeholder: "🐶",
    notes: NO_ROXIE,
  },
  {
    file: "pet-dog-medium.png", round: 2, group: "Pets", title: "Medium dog", size: "1024x1024",
    whatToDraw: "A medium-sized dog, like a golden retriever or a lab, standing with a happy open smile.",
    variants: ["golden", "black"], variantLabel: "coats", kinds: ["dog"], placeholder: "🐶",
    notes: NO_ROXIE,
  },
  {
    file: "pet-dog-large.png", round: 2, group: "Pets", title: "Large dog", size: "1024x1024",
    whatToDraw: "A large, gentle dog, like a shepherd, sitting tall and looking calm and friendly.",
    variants: ["brown", "black-and-tan"], variantLabel: "coats", kinds: ["dog"], placeholder: "🐶",
    notes: NO_ROXIE,
  },
  {
    file: "pet-cat.png", round: 2, group: "Pets", title: "Cat", size: "1024x1024",
    whatToDraw: "A cat sitting with its tail curled around its feet, with big round eyes and little triangle ears.",
    variants: ["orange", "black", "grey-tabby"], variantLabel: "coats", kinds: ["cat"], placeholder: "🐱",
  },
  {
    file: "pet-horse.png", round: 2, group: "Pets", title: "Horse", size: "1024x1024",
    whatToDraw: "A friendly horse standing with its head up and a flowing mane and tail.",
    variants: ["bay", "white"], variantLabel: "coats", kinds: ["horse"], placeholder: "🐴",
  },
  {
    file: "pet-bird.png", round: 2, group: "Pets", title: "Bird", size: "1024x1024",
    whatToDraw: "A cheerful parrot on a perch with bright red, yellow and blue feathers.",
    kinds: ["bird_exotic"], placeholder: "🦜",
  },
  {
    file: "pet-bunny.png", round: 2, group: "Pets", title: "Bunny", size: "1024x1024",
    whatToDraw: "A fluffy bunny sitting up with long ears and a round cotton tail.",
    kinds: ["other_pet"], placeholder: "🐰",
    notes: "Stands in for any other small pet.",
  },

  // --- Work ----------------------------------------------------------------------
  {
    file: "work-office.png", round: 2, group: "Work", title: "Office", size: "1024x1024",
    whatToDraw: "A friendly small office building with big windows and a front door, for a client's job.",
    kinds: ["job"], placeholder: "💼",
    notes: "Make it look different from Loomis HQ (another color, no flag) so nobody mistakes it for the agency.",
  },
  {
    file: "work-shop.png", round: 2, group: "Work", title: "Shop", size: "1024x1024",
    whatToDraw: "A cheerful storefront with a striped awning, a big window, a door and a blank sign panel.",
    kinds: ["business"], placeholder: "🏪",
    notes: "The sign panel is blank: the app adds the name.",
  },
  {
    file: "work-side-gig.png", round: 2, group: "Work", title: "Side gig", size: "1024x1024",
    whatToDraw: "A small car with a square delivery bag on its roof.",
    kinds: ["side_gig"], placeholder: "🛠️",
    notes: "Use a color that is not one of the six vehicle colors, so it doesn't look like the client's own car.",
  },

  // --- Yard structures -----------------------------------------------------------
  {
    file: "structure-detached-garage.png", round: 2, group: "Yard structures", title: "Detached garage", size: "1024x1024",
    whatToDraw: "A one-car detached garage with a big roll-up door and a little window.",
    kinds: ["other_structure"], placeholder: "🏗️",
  },
  {
    file: "structure-shed.png", round: 2, group: "Yard structures", title: "Shed", size: "1024x1024",
    whatToDraw: "A small garden shed with double doors and a tiny window.",
    kinds: ["other_structure"], placeholder: "🏗️",
  },
  {
    file: "structure-barn.png", round: 2, group: "Yard structures", title: "Barn", size: "1024x1024",
    whatToDraw: "A classic red barn with white crossed boards on its big doors and a hayloft window.",
    kinds: ["other_structure"], placeholder: "🏗️",
  },
  {
    file: "structure-fence.png", round: 2, group: "Yard structures", title: "Fence", size: "1024x1024",
    whatToDraw: "A short run of white picket fence, about four posts wide, with a little gate.",
    kinds: ["other_structure"], placeholder: "🏗️",
  },
  {
    file: "structure-gazebo.png", round: 2, group: "Yard structures", title: "Gazebo", size: "1024x1024",
    whatToDraw: "A six-sided garden gazebo with a pointed roof and railings.",
    kinds: ["other_structure"], placeholder: "🏗️",
  },
  {
    file: "structure-pool.png", round: 2, group: "Yard structures", title: "Pool", size: "1024x1024",
    whatToDraw: "A backyard swimming pool with a pale rim, a ladder and a ring float on the water.",
    kinds: ["other_structure"], placeholder: "🏗️",
  },
  {
    file: "structure-other.png", round: 2, group: "Yard structures", title: "Other outbuilding", size: "1024x1024",
    whatToDraw: "A small, friendly outbuilding or workshop with one door and one window.",
    kinds: ["other_structure"], placeholder: "🏗️",
    notes: "Added because the catalog's structure list also offers \"Something else\".",
  },

  // --- Map reveals -----------------------------------------------------------------
  {
    file: "terrain-lake.png", round: 2, group: "Map reveals", title: "Lake", size: "1600x1000",
    whatToDraw: "A smooth oval lake with a sandy shore, light water near the edge and deeper blue toward the middle.",
    notes: "Appears when the first boat or jet ski is added. No boats and no outline. Draw it from the same slightly-above angle.",
  },
  {
    file: "terrain-fence-straight.png", round: 2, group: "Map reveals", title: "Pasture fence, straight", size: "512x512",
    whatToDraw: "One straight section of wooden pasture fence with two rails and a post at each end.",
    notes: "The rails must meet the left and right edges at the same height so copies join end to end.",
  },
  {
    file: "terrain-fence-corner.png", round: 2, group: "Map reveals", title: "Pasture fence, corner", size: "512x512",
    whatToDraw: "A corner section of the same wooden fence, turning a quarter turn.",
  },
  {
    file: "terrain-road-straight.png", round: 2, group: "Map reveals", title: "Road, straight", size: "512x512",
    whatToDraw: "A straight tile of country road with a dashed center line.",
    notes: "Appears with the client's first job or business. Copies must join end to end.",
  },
  {
    file: "terrain-road-curve.png", round: 2, group: "Map reveals", title: "Road, curve", size: "512x512",
    whatToDraw: "A quarter-turn tile of the same road that joins up with the straight tile.",
  },
  {
    file: "terrain-town-sidewalk.png", round: 2, group: "Map reveals", title: "Town sidewalk", size: "1024x256",
    whatToDraw: "A long strip of pale sidewalk with small paving lines and a rounded curb along one edge.",
  },
  {
    file: "terrain-garage-pad.png", round: 2, group: "Map reveals", title: "Garage pad", size: "1024x512",
    whatToDraw: "A gravel pad with a soft grassy edge, where the client's toys are parked next to the house.",
  },

  // --- Valuables for the vault -----------------------------------------------------
  {
    file: "valuable-ring.png", round: 2, group: "Valuables for the vault", title: "Ring", size: "512x512",
    whatToDraw: "A shiny gold ring with a sparkling blue gem, standing upright.",
    kinds: ["jewelry"], placeholder: "💍",
  },
  {
    file: "valuable-necklace.png", round: 2, group: "Valuables for the vault", title: "Necklace", size: "512x512",
    whatToDraw: "A gold chain necklace laid in a loop with a round pendant.",
    kinds: ["jewelry"], placeholder: "💍",
  },
  {
    file: "valuable-watch.png", round: 2, group: "Valuables for the vault", title: "Watch", size: "512x512",
    whatToDraw: "A classic wristwatch with a leather strap and a round face.",
    kinds: ["watch"], placeholder: "⌚",
    notes: "Show the hands and little tick marks only, with no numbers.",
  },
  {
    file: "valuable-painting.png", round: 2, group: "Valuables for the vault", title: "Painting", size: "512x512",
    whatToDraw: "A framed landscape painting with a golden frame, standing on a tiny easel.",
    kinds: ["fine_art"], placeholder: "🎨",
  },
  {
    file: "valuable-collectibles.png", round: 2, group: "Valuables for the vault", title: "Collectibles", size: "512x512",
    whatToDraw: "A little stack of old coins beside a fan of trading cards.",
    kinds: ["collectibles"], placeholder: "🏺",
    notes: "The cards are blank: no numbers or writing.",
  },
  {
    file: "valuable-firearm-case.png", round: 2, group: "Valuables for the vault", title: "Firearm case", size: "512x512",
    whatToDraw: "A closed, long hard case with two latches and a handle.",
    kinds: ["firearm"], placeholder: "🎯",
    notes: "Draw only the closed case. No firearm of any kind may be visible, and it must not look like a weapon.",
  },
  {
    file: "valuable-guitar.png", round: 2, group: "Valuables for the vault", title: "Guitar", size: "512x512",
    whatToDraw: "An acoustic guitar standing upright.",
    kinds: ["musical_instrument"], placeholder: "🎸",
    notes: "Stands in for every instrument.",
  },
  {
    file: "valuable-camera.png", round: 2, group: "Valuables for the vault", title: "Camera", size: "512x512",
    whatToDraw: "A friendly camera with a big round lens and a flash on top.",
    kinds: ["camera_gear"], placeholder: "📷",
  },
  {
    file: "valuable-golf-bag.png", round: 2, group: "Valuables for the vault", title: "Golf bag", size: "512x512",
    whatToDraw: "A golf bag standing up with three clubs poking out.",
    kinds: ["sports_gear"], placeholder: "🏅",
    notes: "Stands in for every kind of sports gear.",
  },
  {
    file: "valuable-silverware.png", round: 2, group: "Valuables for the vault", title: "Silverware", size: "512x512",
    whatToDraw: "A fork, knife and spoon fanned out together in shiny silver.",
    kinds: ["silverware"], placeholder: "🍴",
  },
  {
    file: "valuable-bicycle.png", round: 2, group: "Valuables for the vault", title: "Bicycle", size: "512x512",
    whatToDraw: "A sleek road bicycle with thin tires and curved handlebars.",
    kinds: ["high_end_bicycle"], placeholder: "🚴",
  },

  // =========================================================================
  // ROUND 3: inside the home, and extras
  // =========================================================================

  // --- Home systems ------------------------------------------------------------------
  {
    file: "system-roof.png", round: 3, group: "Home systems", title: "Roof", size: "512x512",
    whatToDraw: "A friendly chunk of roof covered in shingles, with a little chimney.",
    kinds: ["roof"], placeholder: "☂️",
  },
  {
    file: "system-furnace.png", round: 3, group: "Home systems", title: "Furnace", size: "512x512",
    whatToDraw: "A boxy furnace with a pipe on top and a little window showing a cozy flame.",
    kinds: ["furnace"], placeholder: "🔥",
  },
  {
    file: "system-central-air.png", round: 3, group: "Home systems", title: "Air conditioner", size: "512x512",
    whatToDraw: "An outdoor air conditioner box with a round fan grille on top.",
    kinds: ["central_air"], placeholder: "🌬️",
  },
  {
    file: "system-water-heater.png", round: 3, group: "Home systems", title: "Water heater", size: "512x512",
    whatToDraw: "A tall tank water heater with two pipes coming out of the top.",
    kinds: ["water_heater"], placeholder: "🚿",
  },
  {
    file: "system-electrical-panel.png", round: 3, group: "Home systems", title: "Electrical panel", size: "512x512",
    whatToDraw: "A grey wall panel with a door and two neat rows of switches.",
    kinds: ["electrical_panel"], placeholder: "⚡",
    notes: "No labels or numbers on the switches.",
  },
  {
    file: "system-plumbing.png", round: 3, group: "Home systems", title: "Plumbing", size: "512x512",
    whatToDraw: "A pair of copper pipes joined to a faucet with a single water drop.",
    kinds: ["plumbing"], placeholder: "🚰",
  },
  {
    file: "system-sump-pump.png", round: 3, group: "Home systems", title: "Sump pump", size: "512x512",
    whatToDraw: "A little pump standing in a round pit, with a float and a pipe going up.",
    kinds: ["sump_pump"], placeholder: "💧",
  },
  {
    file: "system-well-septic.png", round: 3, group: "Home systems", title: "Well or septic", size: "512x512",
    whatToDraw: "A stone well with a little roof and a bucket, and a round tank lid in the grass beside it.",
    kinds: ["well_septic"], placeholder: "⛲",
  },
  {
    file: "system-solar-panels.png", round: 3, group: "Home systems", title: "Solar panels", size: "512x512",
    whatToDraw: "Two blue solar panels tilted toward a smiling little sun.",
    kinds: ["solar_panels"], placeholder: "☀️",
  },
  {
    file: "system-generator.png", round: 3, group: "Home systems", title: "Generator", size: "512x512",
    whatToDraw: "A boxy standby generator with a vent grille and a lightning bolt on the side.",
    kinds: ["generator"], placeholder: "🔋",
  },

  // --- Rooms -------------------------------------------------------------------------
  {
    file: "room-living-room.png", round: 3, group: "Rooms", title: "Living room", size: "512x512",
    whatToDraw: "A comfy sofa with a cushion and a lamp beside it.",
  },
  {
    file: "room-kitchen.png", round: 3, group: "Rooms", title: "Kitchen", size: "512x512",
    whatToDraw: "A little stove with a steaming pot and a pan hanging above it.",
  },
  {
    file: "room-dining-room.png", round: 3, group: "Rooms", title: "Dining room", size: "512x512",
    whatToDraw: "A dining table with four chairs and a bowl of fruit.",
  },
  {
    file: "room-bedroom.png", round: 3, group: "Rooms", title: "Bedroom", size: "512x512",
    whatToDraw: "A bed with a fluffy pillow and a patchwork quilt.",
  },
  {
    file: "room-kids-room.png", round: 3, group: "Rooms", title: "Kid's room", size: "512x512",
    whatToDraw: "A small bed beside a tower of toy blocks and a teddy bear.",
  },
  {
    file: "room-bathroom.png", round: 3, group: "Rooms", title: "Bathroom", size: "512x512",
    whatToDraw: "A bathtub full of bubbles with a rubber duck.",
  },
  {
    file: "room-home-office.png", round: 3, group: "Rooms", title: "Home office", size: "512x512",
    whatToDraw: "A desk with a laptop and a desk lamp.",
  },
  {
    file: "room-laundry.png", round: 3, group: "Rooms", title: "Laundry room", size: "512x512",
    whatToDraw: "A washing machine with a laundry basket in front.",
  },
  {
    file: "room-basement.png", round: 3, group: "Rooms", title: "Basement", size: "512x512",
    whatToDraw: "A set of stairs leading down into a cellar, with a bulb hanging overhead.",
  },
  {
    file: "room-garage.png", round: 3, group: "Rooms", title: "Garage", size: "512x512",
    whatToDraw: "A garage with its door rolled halfway up and a bicycle parked inside.",
  },
  {
    file: "room-attic.png", round: 3, group: "Rooms", title: "Attic", size: "512x512",
    whatToDraw: "A cozy attic under a pointed roof with a round window and an old trunk.",
  },
  {
    file: "room-other.png", round: 3, group: "Rooms", title: "Somewhere else", size: "512x512",
    whatToDraw: "A friendly open door with a warm glow shining through.",
  },

  // --- Things in the home ----------------------------------------------------------------
  {
    file: "item-electronics.png", round: 3, group: "Things in the home", title: "Electronics", size: "512x512",
    whatToDraw: "A flat-screen TV with a game controller in front of it.",
    kinds: ["inventory_item"], placeholder: "📦",
    notes: "These ten icons are the categories of an item in the home. The app shows 📦 for all of them today.",
  },
  {
    file: "item-furniture.png", round: 3, group: "Things in the home", title: "Furniture", size: "512x512",
    whatToDraw: "A comfy armchair with a small side table.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-appliances.png", round: 3, group: "Things in the home", title: "Appliances", size: "512x512",
    whatToDraw: "A friendly refrigerator with a microwave on top.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-clothing.png", round: 3, group: "Things in the home", title: "Clothing", size: "512x512",
    whatToDraw: "A shirt on a hanger beside a pair of sneakers.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-tools.png", round: 3, group: "Things in the home", title: "Tools", size: "512x512",
    whatToDraw: "A hammer and a wrench crossed over each other.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-sports-outdoor.png", round: 3, group: "Things in the home", title: "Sports and outdoor gear", size: "512x512",
    whatToDraw: "A soccer ball in front of a little camping tent.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-decor.png", round: 3, group: "Things in the home", title: "Art and decor", size: "512x512",
    whatToDraw: "A vase of flowers beside a small framed picture.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-jewelry-watches.png", round: 3, group: "Things in the home", title: "Jewelry or watches", size: "512x512",
    whatToDraw: "A small open jewelry box with a ring and a watch resting in it.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-collectibles.png", round: 3, group: "Things in the home", title: "Collectibles", size: "512x512",
    whatToDraw: "A small display shelf holding a toy robot, a little trophy and a snow globe.",
    kinds: ["inventory_item"], placeholder: "📦",
  },
  {
    file: "item-other.png", round: 3, group: "Things in the home", title: "Something else", size: "512x512",
    whatToDraw: "A cardboard box with tape across the top and the flaps open.",
    kinds: ["inventory_item"], placeholder: "📦",
  },

  // --- Home features (only the ones with no art elsewhere) -----------------------------------
  {
    file: "feature-hot-tub.png", round: 3, group: "Home features", title: "Hot tub", size: "512x512",
    whatToDraw: "A round wooden hot tub with a little step and bubbles rising from the water.",
    placeholder: "♨️",
    notes: "Pool, solar panels, generator, detached garage, outbuildings and fence reuse art from other lists, so they aren't repeated here.",
  },
  {
    file: "feature-trampoline.png", round: 3, group: "Home features", title: "Trampoline", size: "512x512",
    whatToDraw: "A round backyard trampoline with a safety net around it.",
  },
  {
    file: "feature-fireplace.png", round: 3, group: "Home features", title: "Fireplace", size: "512x512",
    whatToDraw: "A brick fireplace with a mantel and a cozy fire.",
    placeholder: "🔥",
  },
  {
    file: "feature-wood-stove.png", round: 3, group: "Home features", title: "Wood stove", size: "512x512",
    whatToDraw: "A little black cast-iron wood stove with a chimney pipe going up.",
  },
  {
    file: "feature-finished-basement.png", round: 3, group: "Home features", title: "Finished basement", size: "512x512",
    whatToDraw: "A cutaway of a few steps leading down into a cozy room with a rug and a lamp.",
  },
  {
    file: "feature-security-system.png", round: 3, group: "Home features", title: "Security system", size: "512x512",
    whatToDraw: "A friendly security camera on a wall bracket with a tiny blue light.",
  },
  {
    file: "feature-smoke-leak-sensors.png", round: 3, group: "Home features", title: "Smoke or leak sensors", size: "512x512",
    whatToDraw: "A round smoke detector with a tiny green light, next to a water-drop leak sensor.",
  },
  {
    file: "feature-storm-shelter.png", round: 3, group: "Home features", title: "Storm shelter", size: "512x512",
    whatToDraw: "A sloped storm cellar door set into a small grassy mound.",
  },
  {
    file: "feature-dog-run.png", round: 3, group: "Home features", title: "Dog run", size: "512x512",
    whatToDraw: "A short fenced dog run with a bone lying in the grass.",
    notes: "No doghouse, so it isn't confused with Roxie's.",
  },

  // --- Badges and the family tree ----------------------------------------------------------
  {
    file: "badge-garage-guru.png", round: 3, group: "Badges and family tree", title: "Garage Guru badge", size: "512x512",
    whatToDraw: "A round medallion with a little garage and a wrench in the middle.",
    notes: "All six badges share the same round gold rim and Loomis-blue center, so they look like a set. Only the small picture inside changes, and there is no text on any of them.",
  },
  {
    file: "badge-family-tree.png", round: 3, group: "Badges and family tree", title: "Family Tree badge", size: "512x512",
    whatToDraw: "A round medallion with a small tree whose leaves are little hearts.",
  },
  {
    file: "badge-inventory-pro.png", round: 3, group: "Badges and family tree", title: "Inventory Pro badge", size: "512x512",
    whatToDraw: "A round medallion with an open box and a check mark.",
  },
  {
    file: "badge-systems-check.png", round: 3, group: "Badges and family tree", title: "Systems Check badge", size: "512x512",
    whatToDraw: "A round medallion with a small house, a gear and a check mark.",
  },
  {
    file: "badge-shutterbug.png", round: 3, group: "Badges and family tree", title: "Shutterbug badge", size: "512x512",
    whatToDraw: "A round medallion with a friendly camera in the middle.",
  },
  {
    file: "badge-planner.png", round: 3, group: "Badges and family tree", title: "Planner badge", size: "512x512",
    whatToDraw: "A round medallion with a clipboard and a row of check marks.",
  },
  {
    file: "family-tree.png", round: 3, group: "Badges and family tree", title: "Family tree", size: "1024x1024",
    whatToDraw: "A friendly tree with a thick trunk and wide round branches, with a few blank round tags hanging from it.",
    placeholder: "🌳",
    notes: "It sprouts in the yard when the first person is added, and tapping it opens the family tree. The tags are blank because the app adds the names.",
  },

  // --- Level skies ----------------------------------------------------------------------------
  {
    file: "sky-open-field.png", round: 3, group: "Level skies", title: "Sky: Open Field", size: "1080x1920",
    whatToDraw: "A calm pale-blue sky that gets a little lighter toward the bottom, with two or three soft clouds and lots of open space.",
    placeholder: "☁️",
    notes: "These five are full-screen backgrounds, so they are the one place a background belongs, and they don't need to be transparent. The world sits in the middle of the screen and buttons sit over the top and bottom, so keep the middle open and the top and bottom quiet.",
  },
  {
    file: "sky-homestead.png", round: 3, group: "Level skies", title: "Sky: Homestead", size: "1080x1920",
    whatToDraw: "A slightly richer sky with a warmer blue, a soft sun glow, a few more clouds and a couple of tiny birds.",
    placeholder: "☁️",
  },
  {
    file: "sky-neighborhood.png", round: 3, group: "Level skies", title: "Sky: Neighborhood", size: "1080x1920",
    whatToDraw: "A fuller sky with layered clouds and a faint line of distant hills along the bottom.",
    placeholder: "☁️",
  },
  {
    file: "sky-hometown.png", round: 3, group: "Level skies", title: "Sky: Hometown", size: "1080x1920",
    whatToDraw: "A bright sky with a pink-gold glow near the horizon, layered clouds, hills, a tiny distant town and a hot-air balloon.",
    placeholder: "☁️",
  },
  {
    file: "sky-big-sky.png", round: 3, group: "Level skies", title: "Sky: Big Sky", size: "1080x1920",
    whatToDraw: "The grandest sky of all: rich blue fading to a gentle sunset glow, big friendly clouds and a few tiny stars at the top.",
    placeholder: "☁️",
  },

  // --- Life events (optional) --------------------------------------------------------------------
  {
    file: "event-new-baby.png", round: 3, group: "Life events (optional)", title: "Having a baby", size: "512x512",
    whatToDraw: "A baby wrapped in a cozy blanket with a little bow.",
    placeholder: "👶",
    notes: "Optional: we can keep using emoji for all the life events.",
  },
  {
    file: "event-getting-married.png", round: 3, group: "Life events (optional)", title: "Getting married", size: "512x512",
    whatToDraw: "Two gold rings linked together.",
    placeholder: "💍",
  },
  {
    file: "event-planning-wedding.png", round: 3, group: "Life events (optional)", title: "Planning a wedding", size: "512x512",
    whatToDraw: "A small chapel with heart-shaped bunting across the front.",
    placeholder: "💒",
  },
  {
    file: "event-teen-driver.png", round: 3, group: "Life events (optional)", title: "Teen learning to drive", size: "512x512",
    whatToDraw: "A small car with a steering wheel floating beside it and a round green \"go\" light.",
    placeholder: "🚗",
  },
  {
    file: "event-buying-home.png", round: 3, group: "Life events (optional)", title: "Buying a home", size: "512x512",
    whatToDraw: "A cozy house with a big gold key hanging in front of it.",
    placeholder: "🏡",
  },
  {
    file: "event-moving.png", round: 3, group: "Life events (optional)", title: "Moving", size: "512x512",
    whatToDraw: "A stack of taped moving boxes with a small plant on top.",
    placeholder: "📦",
  },
  {
    file: "event-renovating.png", round: 3, group: "Life events (optional)", title: "Fixing up the house", size: "512x512",
    whatToDraw: "A hammer crossed with a paintbrush.",
    placeholder: "🔨",
  },
  {
    file: "event-adding-pool.png", round: 3, group: "Life events (optional)", title: "Adding a pool", size: "512x512",
    whatToDraw: "A swimming pool with a ring float and a little diving board.",
    placeholder: "🏊",
  },
  {
    file: "event-kid-to-college.png", round: 3, group: "Life events (optional)", title: "Heading off to college", size: "512x512",
    whatToDraw: "A graduation cap with a dangling tassel.",
    placeholder: "🎓",
  },
  {
    file: "event-parent-moves-in.png", round: 3, group: "Life events (optional)", title: "A parent moving in", size: "512x512",
    whatToDraw: "An older woman with a small suitcase, stepping through a front door.",
    placeholder: "👵",
  },
  {
    file: "event-new-pet.png", round: 3, group: "Life events (optional)", title: "Getting a pet", size: "512x512",
    whatToDraw: "A playful puppy with a bow around its neck.",
    placeholder: "🐶",
    notes: NO_ROXIE,
  },
  {
    file: "event-new-car.png", round: 3, group: "Life events (optional)", title: "Buying a car", size: "512x512",
    whatToDraw: "A shiny car with a big red bow on the hood.",
    placeholder: "🚙",
  },
  {
    file: "event-rideshare-driving.png", round: 3, group: "Life events (optional)", title: "Driving for Uber or DoorDash", size: "512x512",
    whatToDraw: "A car with a blank light-up panel on its roof and a map pin beside it.",
    placeholder: "🚕",
    notes: "No logos and no brand names.",
  },
  {
    file: "event-buying-boat-rv.png", round: 3, group: "Life events (optional)", title: "Buying a boat or RV", size: "512x512",
    whatToDraw: "A small boat on a trailer parked beside a little camper.",
    placeholder: "🚤",
  },
  {
    file: "event-new-job.png", round: 3, group: "Life events (optional)", title: "Starting a new job", size: "512x512",
    whatToDraw: "A necktie and a briefcase side by side.",
    placeholder: "👔",
  },
  {
    file: "event-starting-business.png", round: 3, group: "Life events (optional)", title: "Starting a business", size: "512x512",
    whatToDraw: "A briefcase with a tiny striped shop awning on top.",
    placeholder: "💼",
  },
  {
    file: "event-becoming-landlord.png", round: 3, group: "Life events (optional)", title: "Renting out a place", size: "512x512",
    whatToDraw: "A key with a little house-shaped tag.",
    placeholder: "🔑",
  },
  {
    file: "event-retiring.png", round: 3, group: "Life events (optional)", title: "Retiring", size: "512x512",
    whatToDraw: "A beach chair under an umbrella with a soft sunrise behind it.",
    placeholder: "🌅",
  },
  {
    file: "event-turning-65.png", round: 3, group: "Life events (optional)", title: "Turning 65", size: "512x512",
    whatToDraw: "A birthday cake with a few lit candles, with no numbers on it.",
    placeholder: "🎂",
  },
  {
    file: "event-big-trip.png", round: 3, group: "Life events (optional)", title: "Taking a big trip", size: "512x512",
    whatToDraw: "A packed suitcase with a paper airplane flying above it.",
    placeholder: "✈️",
  },
];
