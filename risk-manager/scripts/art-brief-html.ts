/**
 * Turns the art manifest into the HTML of the illustrator's art guide.
 * Used only by art-brief.ts; it has no side effects and touches no files.
 *
 * Everything here is written for an artist, not a developer: warm, plain
 * words. The drawings (Roxie, the example house, the diagrams) are small inline
 * SVGs so the guide is one self-contained page that prints cleanly.
 */
import type { ArtAsset, Round } from "../art/assets.ts";

export interface BriefData {
  assets: ArtAsset[];
  expandFiles: (asset: Pick<ArtAsset, "file" | "variants">) => string[];
  counts: Record<Round, number>;
  /** False when no emoji font is installed: the emoji column is dropped. */
  showEmoji: boolean;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fmtSize = (size: string): string => size.replace("x", " × ");

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

const NAVY = "#14263D";

// ---------------------------------------------------------------------------
// Round details
// ---------------------------------------------------------------------------

interface RoundInfo {
  name: string;
  color: string;
  ink: string;
  soft: string;
  why: string;
  intro: string;
}

const ROUNDS: Record<Round, RoundInfo> = {
  1: {
    name: "The first playable beta",
    color: "#1D4ED8",
    ink: "#FFFFFF",
    soft: "#E6EEFF",
    why:
      "These are the pieces every player sees in their first fifteen minutes: Roxie, Loomis HQ, the family, a home, a car, and the little bits of nature and sparkle that make the world feel alive.",
    intro:
      "Once these are in, someone can play from the empty field all the way to a small neighborhood. Anything not drawn yet keeps showing its emoji, so the game always works while we wait for the next batch.",
  },
  2: {
    name: "The deep tree on the map",
    color: "#3E8E41",
    ink: "#FFFFFF",
    soft: "#E6F5E4",
    why:
      "Round 2 covers everything else a client can add to the map: more vehicles, boats and toys, pets, jobs, yard buildings, valuables for the treasure chest, and the pieces of land that appear when the world grows.",
    intro:
      "Many of these pieces have a few colors. Remember the recolor tip from the style guide: keep the part that changes as one flat color group.",
  },
  3: {
    name: "Inside the home, and extras",
    color: "#F5B301",
    ink: "#14263D",
    soft: "#FFF4D6",
    why:
      "Round 3 is the finishing touch: small icons for the things inside a home, the badges players earn, the family tree, a sky for every level, and (optionally) a picture for each life event.",
    intro:
      "Most of these are small 512 px icons, so they go quickly. They only appear when someone opens a home's detail screen, which is why they come last.",
  },
};

/** Short notes that sit under a group's title. Keyed by group name. */
const GROUP_NOTES: Record<string, string> = {
  "Roxie, our guide":
    "Start with the turnaround sheet. Once we all love how she looks from every side, the other poses are much easier to keep on-model. Her full description is on the Meet Roxie page.",
  "Loomis HQ":
    "HQ sits on a hill at the edge of the map from the very first second. It has to read as \"the agency\" at a glance.",
  People:
    "Each person comes in four skin tones. Draw them once, with the skin as one flat color group, then recolor. Keep everyone in the same chunky proportions so they look like one family of toys.",
  Homes:
    "These are the places clients live in. Please draw them all at a similar size so one home can swap for another without the layout shifting.",
  "Everyday vehicles":
    "Six colors each, so the client's car can be their car. The color names and hex codes are on the style guide page.",
  "World basics":
    "The ground and the little extras that fill the map. Scenery like this is soft and needs no navy outline.",
  "Game pieces": "Treasure, rewards, a bit of celebration, and the app icon.",
  "More vehicles": "Same rules as Round 1's cars: the body color is one flat group, so each color is a quick recolor.",
  Toys:
    "Boats, jet skis and other fun toys. Boats are drawn without water, because the lake is its own piece on the map.",
  Pets:
    "Clients' own pets. Pet dogs must never look like Roxie: no blue collar, no gold tag and no shaggy grey coat.",
  Work: "Where a client works. These should look clearly different from Loomis HQ.",
  "Yard structures": "The buildings and features that can stand in a client's yard.",
  "Map reveals":
    "Pieces of land that appear when the world grows: a lake, a pasture fence, a road to town. Wherever a piece is meant to repeat, its ends must line up so copies join neatly.",
  "Valuables for the vault":
    "Small icons that sit inside the treasure chest's list. Each one stands alone, with no background.",
  "Home systems": "The big working parts of a house, one icon each.",
  Rooms: "One icon for each room a client can file an item under.",
  "Things in the home": "One icon for each kind of item in a home's inventory.",
  "Home features": "Only the home features that don't already have a picture elsewhere in this guide.",
  "Badges and family tree": "Round medallions that players earn, and the tree that grows in their yard.",
  "Level skies": "A full-screen sky for each of the five levels, getting gradually richer as the world grows.",
  "Life events (optional)":
    "These are optional. The game already shows an emoji for each life event, so skip them if time is short.",
};

// ---------------------------------------------------------------------------
// Drawings
// ---------------------------------------------------------------------------

const C = {
  navy: NAVY,
  blue: "#1D4ED8",
  gold: "#F5B301",
  sky: "#BFE3FF",
  grassL: "#8BD27A",
  grass: "#5FB85A",
  grassD: "#3E8E41",
  warm: "#FFF8EC",
  red: "#E0556B",
  brick: "#C8553D",
  wood: "#B7793F",
  stone: "#9AA5B1",
  water: "#5BC0EB",
  deep: "#2E86C1",
  rox1: "#D5D8DC",
  rox2: "#A3A9B1",
  rox3: "#6B7280",
};

/** Roxie sitting, in a 400 x 420 box. `id` keeps the clip paths unique per use. */
function roxie(id: string, opts: { tongue?: boolean } = {}): string {
  const { navy: N, rox1: L, rox2: M, rox3: D } = C;
  const tail = "M 276 332 C 332 336 356 292 334 256 C 322 238 298 244 304 262";
  return `
  <defs>
    <clipPath id="${id}-b"><ellipse cx="200" cy="292" rx="88" ry="76"/></clipPath>
    <clipPath id="${id}-h"><ellipse cx="200" cy="168" rx="82" ry="70"/></clipPath>
  </defs>
  <path d="${tail}" fill="none" stroke="${N}" stroke-width="28" stroke-linecap="round"/>
  <path d="${tail}" fill="none" stroke="${L}" stroke-width="16" stroke-linecap="round"/>
  <path d="M 326 274 C 338 266 342 252 332 244" fill="none" stroke="${M}" stroke-width="7" stroke-linecap="round"/>
  <path d="M 298 258 l 4 -16 l 10 8 l 10 -12 l 2 18" fill="${M}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <ellipse cx="132" cy="370" rx="28" ry="14" fill="${M}" stroke="${N}" stroke-width="6"/>
  <ellipse cx="268" cy="370" rx="28" ry="14" fill="${M}" stroke="${N}" stroke-width="6"/>
  <path d="M 122 296 l -20 10 l 22 8 z M 120 324 l -22 10 l 26 4 z" fill="${M}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 278 296 l 20 10 l -22 8 z M 280 324 l 22 10 l -26 4 z" fill="${M}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <ellipse cx="200" cy="292" rx="88" ry="76" fill="${L}"/>
  <g clip-path="url(#${id}-b)"><ellipse cx="200" cy="292" rx="88" ry="76" fill="${M}"/><ellipse cx="188" cy="280" rx="88" ry="76" fill="${L}"/></g>
  <ellipse cx="200" cy="292" rx="88" ry="76" fill="none" stroke="${N}" stroke-width="6"/>
  <ellipse cx="158" cy="262" rx="14" ry="26" fill="#fff" opacity=".45" transform="rotate(24 158 262)"/>
  <rect x="156" y="318" width="34" height="54" rx="17" fill="${L}" stroke="${N}" stroke-width="6"/>
  <rect x="210" y="318" width="34" height="54" rx="17" fill="${L}" stroke="${N}" stroke-width="6"/>
  <ellipse cx="173" cy="372" rx="24" ry="13" fill="${L}" stroke="${N}" stroke-width="6"/>
  <ellipse cx="227" cy="372" rx="24" ry="13" fill="${L}" stroke="${N}" stroke-width="6"/>
  <path d="M 165 372 v 8 M 181 372 v 8 M 219 372 v 8 M 235 372 v 8" stroke="${N}" stroke-width="4" stroke-linecap="round"/>
  <path d="M 136 238 Q 200 280 264 238" fill="none" stroke="${N}" stroke-width="26" stroke-linecap="round"/>
  <path d="M 136 238 Q 200 280 264 238" fill="none" stroke="${C.blue}" stroke-width="15" stroke-linecap="round"/>
  <path d="M 150 241 Q 200 270 250 241" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35"/>
  <path d="M 183 262 h 34 v 20 q 0 17 -17 25 q -17 -8 -17 -25 z" fill="${C.gold}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 200 307 q 17 -8 17 -25 v -6 q -6 18 -17 24 z" fill="#C98F00" opacity=".6"/>
  <path d="M 189 270 v 11" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  <path d="M 132 120 C 92 126 82 196 104 240 C 120 250 140 224 144 192 Z" fill="${M}" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 268 120 C 308 126 318 196 296 240 C 280 250 260 224 256 192 Z" fill="${M}" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 118 160 C 110 188 110 214 116 232 M 282 160 C 290 188 290 214 284 232" fill="none" stroke="${D}" stroke-width="8" stroke-linecap="round"/>
  <ellipse cx="200" cy="168" rx="82" ry="70" fill="${L}"/>
  <g clip-path="url(#${id}-h)"><ellipse cx="200" cy="168" rx="82" ry="70" fill="${M}"/><ellipse cx="190" cy="158" rx="82" ry="70" fill="${L}"/></g>
  <ellipse cx="200" cy="168" rx="82" ry="70" fill="none" stroke="${N}" stroke-width="6"/>
  <path d="M 126 196 l -18 6 l 16 10 l -14 10 l 22 -2" fill="${L}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 274 196 l 18 6 l -16 10 l 14 10 l -22 -2" fill="${L}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M 140 118 L 152 92 L 168 112 L 184 82 L 200 108 L 216 82 L 232 112 L 248 92 L 260 118 Q 200 98 140 118 Z" fill="${M}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <ellipse cx="200" cy="203" rx="38" ry="29" fill="${C.warm}" stroke="${N}" stroke-width="5"/>
  ${opts.tongue ? `<ellipse cx="200" cy="228" rx="9" ry="11" fill="#FF8FA3" stroke="${N}" stroke-width="4"/>` : ""}
  <path d="M 200 198 V 210 M 182 210 Q 191 224 200 210 Q 209 224 218 210" fill="none" stroke="${N}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="200" cy="188" rx="15" ry="10" fill="#1B1F27" stroke="${N}" stroke-width="3"/>
  <ellipse cx="195" cy="184" rx="5" ry="2.5" fill="#fff" opacity=".8"/>
  <circle cx="166" cy="160" r="12" fill="${N}"/>
  <circle cx="234" cy="160" r="12" fill="${N}"/>
  <circle cx="170" cy="155" r="4.5" fill="#fff"/><circle cx="238" cy="155" r="4.5" fill="#fff"/>
  <circle cx="162" cy="165" r="2" fill="#fff"/><circle cx="230" cy="165" r="2" fill="#fff"/>
  <path d="M 150 138 Q 166 128 182 138 M 218 138 Q 234 128 250 138" fill="none" stroke="${D}" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="160" cy="122" rx="22" ry="9" fill="#fff" opacity=".4" transform="rotate(-20 160 122)"/>
  `;
}

/** The example house used to explain the style: outline, highlight, shade. 320 x 260 box. */
function exampleHouse(): string {
  const { navy: N } = C;
  return `
  <polygon points="220,140 220,230 266,204 266,114" fill="#E3D3B4" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="130,76 220,140 266,114 176,50" fill="#B8425A" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="40,230 40,140 130,76 220,140 220,230" fill="${C.warm}" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <polygon points="46,146 58,146 58,224 46,224" fill="#fff" opacity=".7"/>
  <polygon points="48,140 130,82 138,88 56,146" fill="#fff" opacity=".7"/>
  <polygon points="42,218 218,218 218,228 42,228" fill="#7A5B2E" opacity=".14"/>
  <rect x="112" y="170" width="38" height="60" rx="8" fill="${C.wood}" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="140" cy="202" r="4" fill="${C.gold}"/>
  <rect x="62" y="160" width="36" height="36" rx="6" fill="${C.sky}" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <rect x="164" y="160" width="36" height="36" rx="6" fill="${C.sky}" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="130" cy="124" r="13" fill="${C.sky}" stroke="${N}" stroke-width="6"/>
  <path d="M 66 166 l 8 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  <path d="M 168 166 l 8 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  `;
}

/** A small Loomis HQ for the cover. 220 x 220 box. */
function hqPiece(): string {
  const { navy: N } = C;
  return `
  <ellipse cx="110" cy="196" rx="104" ry="22" fill="${C.grassL}" stroke="#EAF2EA" stroke-width="5"/>
  <rect x="48" y="96" width="104" height="92" rx="6" fill="${C.warm}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="36,100 100,44 164,100" fill="${C.blue}" stroke="${N}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="68" y="102" width="64" height="20" rx="5" fill="#fff" stroke="${N}" stroke-width="4"/>
  <rect x="90" y="140" width="22" height="48" rx="5" fill="${C.wood}" stroke="${N}" stroke-width="4"/>
  <rect x="58" y="136" width="22" height="22" rx="4" fill="${C.sky}" stroke="${N}" stroke-width="4"/>
  <rect x="122" y="136" width="22" height="22" rx="4" fill="${C.sky}" stroke="${N}" stroke-width="4"/>
  <path d="M 150 76 V 8" stroke="${N}" stroke-width="5" stroke-linecap="round"/>
  <path d="M 152 10 l 44 10 l -44 14 z" fill="${C.gold}" stroke="${N}" stroke-width="4" stroke-linejoin="round"/>
  `;
}

function tree(x: number, y: number, s: number, fill: string): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-9" y="-26" width="18" height="40" rx="6" fill="${C.wood}" stroke="${NAVY}" stroke-width="5"/>
    <circle cx="0" cy="-58" r="42" fill="${fill}" stroke="${NAVY}" stroke-width="5"/>
    <circle cx="-14" cy="-70" r="12" fill="#fff" opacity=".28"/></g>`;
}

function cloud(x: number, y: number, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".95">
    <circle cx="0" cy="0" r="34"/><circle cx="40" cy="-16" r="44"/><circle cx="88" cy="0" r="34"/>
    <rect x="0" y="-2" width="88" height="36" rx="18"/></g>`;
}

function coverScene(): string {
  const flowers = [
    [120, 880, C.red], [700, 905, C.gold], [210, 960, "#fff"], [610, 830, C.red], [90, 800, C.gold],
    [740, 800, "#fff"], [330, 925, C.gold], [505, 905, C.red],
  ] as const;
  return `
  <svg class="scene" viewBox="0 0 816 1056" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8FCBFF"/><stop offset=".55" stop-color="#CDE9FF"/><stop offset="1" stop-color="#F2F9FF"/>
      </linearGradient>
      <radialGradient id="grass" cx=".3" cy=".1" r=".9">
        <stop offset="0" stop-color="${C.grassL}"/><stop offset="1" stop-color="${C.grass}"/>
      </radialGradient>
    </defs>
    <rect width="816" height="1056" fill="url(#sky)"/>
    ${cloud(560, 190, 1.2)}${cloud(40, 400, 1)}${cloud(610, 530, .8)}${cloud(250, 540, .7)}
    <ellipse cx="408" cy="900" rx="560" ry="310" fill="#F1F6F0"/>
    <ellipse cx="408" cy="910" rx="540" ry="296" fill="url(#grass)"/>
    <g opacity=".12" fill="#fff"><rect x="-40" y="700" width="900" height="34" transform="rotate(-8 408 800)"/><rect x="-40" y="790" width="900" height="34" transform="rotate(-8 408 800)"/></g>
    ${tree(120, 780, 1.1, C.grassD)}${tree(700, 810, .95, C.grass)}${tree(80, 930, .8, C.grass)}
    <svg x="520" y="560" width="230" height="230" viewBox="0 0 220 220">${hqPiece()}</svg>
    <svg x="190" y="530" width="320" height="336" viewBox="0 0 400 420">${roxie("cover", { tongue: true })}</svg>
    ${flowers.map(([x, y, f]) => `<g transform="translate(${x} ${y})"><circle r="9" fill="${f}" stroke="${NAVY}" stroke-width="3"/><circle r="3.4" fill="${C.gold}"/></g>`).join("")}
  </svg>`;
}

/** A tiny "which way are we looking" pair of diagrams. */
function angleDiagrams(): string {
  const N = NAVY;
  return `
  <svg viewBox="0 0 250 150" class="diagram" role="img" aria-label="Seen from the side: the viewer looks down at about 30 degrees">
    <line x1="10" y1="118" x2="240" y2="118" stroke="${C.grass}" stroke-width="6" stroke-linecap="round"/>
    <rect x="150" y="76" width="56" height="42" rx="10" fill="${C.sky}" stroke="${N}" stroke-width="5"/>
    <line x1="52" y1="38" x2="150" y2="94" stroke="${N}" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"/>
    <line x1="60" y1="94" x2="150" y2="94" stroke="${C.stone}" stroke-width="2.5" stroke-dasharray="3 5"/>
    <path d="M 112 94 A 38 38 0 0 0 119 75.500" fill="none" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>
    <text x="84" y="90" font-size="14" font-weight="800" fill="${C.red}" text-anchor="middle">30&#176;</text>
    <circle cx="40" cy="32" r="17" fill="#fff" stroke="${N}" stroke-width="5"/>
    <circle cx="44" cy="35" r="7" fill="${N}"/><circle cx="46" cy="32" r="2.5" fill="#fff"/>
    <text x="125" y="142" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">from the side</text>
  </svg>
  <svg viewBox="0 0 250 150" class="diagram" role="img" aria-label="Seen from above: the piece is turned a little to the right">
    <g transform="rotate(-22 125 62)">
      <rect x="85" y="26" width="80" height="72" rx="8" fill="${C.sky}" stroke="${N}" stroke-width="5"/>
      <line x1="85" y1="98" x2="165" y2="98" stroke="${C.gold}" stroke-width="8" stroke-linecap="round"/>
    </g>
    <path d="M 125 132 L 125 112" stroke="${N}" stroke-width="4" stroke-linecap="round"/>
    <path d="M 118 120 l 7 -10 l 7 10" fill="none" stroke="${N}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="196" y="112" font-size="12" font-weight="700" fill="${C.deep}" text-anchor="middle">front</text>
    <path d="M 178 104 l -12 -2" stroke="${C.deep}" stroke-width="2.5" stroke-linecap="round"/>
    <text x="125" y="146" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">from above</text>
  </svg>`;
}

/** Flat -> shade -> highlight + outline, in three steps. */
function shadingSteps(): string {
  const N = NAVY;
  const ball = (cx: number, step: number): string => {
    const id = `ball${step}`;
    return `
    <clipPath id="${id}"><circle cx="${cx}" cy="60" r="44"/></clipPath>
    <circle cx="${cx}" cy="60" r="44" fill="#3B82F6"/>
    ${step >= 2 ? `<g clip-path="url(#${id})"><circle cx="${cx}" cy="60" r="44" fill="#1D4ED8"/><circle cx="${cx - 10}" cy="50" r="44" fill="#3B82F6"/></g>` : ""}
    ${step >= 3 ? `<ellipse cx="${cx - 17}" cy="38" rx="13" ry="8" fill="#fff" opacity=".7" transform="rotate(-35 ${cx - 17} 38)"/><circle cx="${cx}" cy="60" r="44" fill="none" stroke="${N}" stroke-width="5"/>` : ""}`;
  };
  return `
  <svg viewBox="-4 -4 408 148" class="diagram" role="img" aria-label="Three steps: flat fill, then a darker shade, then a highlight and outline">
    ${ball(60, 1)}${ball(200, 2)}${ball(340, 3)}
    <text x="60" y="130" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">1  flat fill</text>
    <text x="200" y="130" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">2  darker shade</text>
    <text x="340" y="130" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">3  highlight + outline</text>
    <circle cx="5" cy="5" r="6" fill="${C.gold}" stroke="${N}" stroke-width="2.5"/>
    <path d="M 14 14 L 28 26" stroke="${C.gold}" stroke-width="3" stroke-linecap="round"/>
    <text x="36" y="12" font-size="10.5" font-weight="700" fill="#B07F00">light from the top-left</text>
  </svg>`;
}

/** The canvas guide: 6% padding, ground line at 88%, with the example house on it. */
function placementDiagram(): string {
  const N = NAVY;
  const S = 300;
  const pad = S * 0.06;
  const ground = S * 0.88;
  return `
  <svg viewBox="-6 -6 ${S + 12} ${S + 36}" class="diagram placement" role="img" aria-label="A square canvas with 6 percent padding and a ground line at 88 percent of its height">
    <rect x="0" y="0" width="${S}" height="${S}" rx="6" fill="#fff" stroke="${C.stone}" stroke-width="2"/>
    <g opacity=".5" fill="${C.sky}"><rect x="0" y="0" width="${S}" height="${pad}"/><rect x="0" y="${S - pad}" width="${S}" height="${pad}"/><rect x="0" y="${pad}" width="${pad}" height="${S - 2 * pad}"/><rect x="${S - pad}" y="${pad}" width="${pad}" height="${S - 2 * pad}"/></g>
    <rect x="${pad}" y="${pad}" width="${S - 2 * pad}" height="${S - 2 * pad}" fill="none" stroke="${C.deep}" stroke-width="2" stroke-dasharray="6 5"/>
    <line x1="0" y1="${ground}" x2="${S}" y2="${ground}" stroke="${C.gold}" stroke-width="4" stroke-dasharray="10 6"/>
    <line x1="${S / 2}" y1="${pad}" x2="${S / 2}" y2="${S - pad}" stroke="${C.sky}" stroke-width="2" stroke-dasharray="2 6"/>
    <g transform="translate(-3 ${ground - 230})">${exampleHouse()}</g>
    <text x="${S - 8}" y="${ground + 12}" font-size="12" font-weight="800" fill="#B07F00" text-anchor="end">ground line: 88% down</text>
    <text x="${S / 2}" y="${pad - 6}" font-size="11" font-weight="700" fill="${C.deep}" text-anchor="middle">about 6% padding</text>
    <text x="${S / 2}" y="${S + 22}" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">centered, base on the ground line</text>
  </svg>`;
}

/** Callouts around Roxie for the Meet Roxie page. */
function roxieLabeled(): string {
  const N = NAVY;
  const label = (x: number, y: number, anchor: "start" | "end", title: string, sub: string, tx: number, ty: number): string => {
    const lx = anchor === "start" ? 186 : 574;
    return `
    <path d="M ${lx} ${y + 4} L ${tx} ${ty}" stroke="${C.deep}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="${tx}" cy="${ty}" r="4.5" fill="${C.deep}"/>
    <text x="${x}" y="${y}" font-size="14" font-weight="800" fill="${N}" text-anchor="${anchor}">${title}</text>
    <text x="${x}" y="${y + 16}" font-size="11.5" fill="#4A5B72" text-anchor="${anchor}">${sub}</text>`;
  };
  return `
  <svg viewBox="0 0 760 410" class="diagram roxie-fig" role="img" aria-label="Roxie, with her features pointed out">
    <ellipse cx="380" cy="402" rx="170" ry="12" fill="#000" opacity="0"/>
    <svg x="190" y="6" width="380" height="399" viewBox="0 0 400 420">${roxie("fig", { tongue: false })}</svg>
    ${label(12, 54, "start", "Floppy darker-grey ears", "soft, a little shaggy", 294, 196)}
    ${label(12, 168, "start", "Round dark eyes", "with a white sparkle", 346, 158)}
    ${label(12, 282, "start", "Fluffy light-grey coat", "with darker grey tufts", 330, 296)}
    ${label(748, 54, "end", "Small black nose", "and a happy little smile", 382, 184)}
    ${label(748, 150, "end", "Loomis-blue collar", "use the brand blue if you have it", 440, 236)}
    ${label(748, 246, "end", "Gold shield tag", "her signature: only Roxie has it", 382, 284)}
    ${label(748, 342, "end", "Happy curled tail", "", 512, 262)}
  </svg>`;
}

/** The turnaround sheet: three dashed slots on a 2:1 canvas. */
function turnaroundDiagram(): string {
  const N = NAVY;
  const slot = (x: number, name: string): string => `
    <rect x="${x}" y="14" width="148" height="132" rx="10" fill="#fff" stroke="${C.deep}" stroke-width="2" stroke-dasharray="6 5"/>
    <text x="${x + 74}" y="82" font-size="16" font-weight="800" fill="${N}" text-anchor="middle">${name}</text>`;
  return `
  <svg viewBox="0 0 500 190" class="diagram" role="img" aria-label="A wide canvas with three slots: front, side and back">
    <rect x="2" y="2" width="496" height="160" rx="14" fill="${C.sky}" opacity=".35" stroke="${N}" stroke-width="2"/>
    ${slot(14, "front")}${slot(176, "side")}${slot(338, "back")}
    <line x1="14" y1="130" x2="486" y2="130" stroke="${C.gold}" stroke-width="3" stroke-dasharray="8 6"/>
    <text x="250" y="182" font-size="12" font-weight="700" fill="${N}" text-anchor="middle">2048 × 1024 px · one ground line · even spacing</text>
  </svg>`;
}

const ICONS = {
  check: `<svg viewBox="0 0 20 20" class="ico"><circle cx="10" cy="10" r="10" fill="#3E8E41"/><path d="M5.5 10.5l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  cross: `<svg viewBox="0 0 20 20" class="ico"><circle cx="10" cy="10" r="10" fill="#E0556B"/><path d="M6.500 6.500l7 7M13.500 6.500l-7 7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>`,
};

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------

const CSS = `
:root{
  --navy:#14263D; --blue:#1D4ED8; --gold:#F5B301; --sky:#BFE3FF; --sky-soft:#EEF7FF; --sky-mid:#DCEEFF;
  --grass:#5FB85A; --grass-d:#3E8E41; --warm:#FFF8EC; --red:#E0556B;
  --ink:#1D2E45; --muted:#55657B; --line:#D9E6F2;
  --head:"SF Pro Rounded", ui-rounded, "Inter Display", Inter, system-ui, sans-serif;
  --body:Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono:"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --emoji:"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;font:400 10.5pt/1.5 var(--body);color:var(--ink);background:#fff}

@page{size:Letter;margin:.6in .65in .8in;
  @bottom-left{content:"Loomis Personal Risk Manager  \\00B7  Art Guide";font:600 8pt Inter,system-ui,sans-serif;color:#7B8CA3;vertical-align:top;padding-top:.18in}
  @bottom-right{content:"Page " counter(page);font:700 8pt Inter,system-ui,sans-serif;color:#7B8CA3;vertical-align:top;padding-top:.18in}}
@page cover{margin:0;@bottom-left{content:none}@bottom-right{content:none}}
@page round1{@top-right{content:"ROUND 1  \\00B7  The first playable beta";font:800 7.5pt Inter,system-ui,sans-serif;letter-spacing:.08em;color:#1D4ED8;vertical-align:bottom;padding-bottom:.16in}}
@page round2{@top-right{content:"ROUND 2  \\00B7  The deep tree on the map";font:800 7.5pt Inter,system-ui,sans-serif;letter-spacing:.08em;color:#3E8E41;vertical-align:bottom;padding-bottom:.16in}}
@page round3{@top-right{content:"ROUND 3  \\00B7  Inside the home, and extras";font:800 7.5pt Inter,system-ui,sans-serif;letter-spacing:.08em;color:#B07F00;vertical-align:bottom;padding-bottom:.16in}}

h1,h2,h3,.display{font-family:var(--head);color:var(--navy);font-weight:700;letter-spacing:.004em;
  -webkit-text-stroke:.032em currentColor;paint-order:stroke fill;stroke-linejoin:round}
h1{font-size:27pt;line-height:1.08;margin:0 0 .12in}
h2{font-size:14pt;line-height:1.2;margin:.16in 0 .05in}
h3{font-size:11.5pt;line-height:1.25;margin:0 0 .04in}
p{margin:0 0 .09in}
.lead{font-size:12pt;line-height:1.5;color:#2B3F5A}
.muted{color:var(--muted)}
.small{font-size:9.5pt}
b,strong{font-weight:700}
code,.mono{font-family:var(--mono);font-size:.88em}
.emoji{font-family:var(--emoji)}

section.page{break-before:page}
section.page.first{break-before:auto}
.eyebrow{display:inline-block;background:var(--sky-mid);color:#1B4E8C;font:800 8pt var(--body);letter-spacing:.12em;text-transform:uppercase;padding:.04in .14in;border-radius:99px;margin-bottom:.1in}

.card{background:var(--sky-soft);border:1.5px solid var(--sky);border-radius:16px;padding:.15in .18in;break-inside:avoid}
.card.warm{background:var(--warm);border-color:#F2DFB6}
.card.plain{background:#fff;border-color:var(--line)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:.16in}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.14in}
.stack>*+*{margin-top:.14in}
.num{display:inline-grid;place-items:center;width:.32in;height:.32in;border-radius:50%;background:var(--blue);color:#fff;font:800 11pt var(--head);margin-right:.08in;flex:none}
ul.tidy{margin:.04in 0 .08in;padding-left:.2in}
ul.tidy li{margin:.03in 0}
.tag{display:inline-block;background:var(--sky-mid);color:#1B4E8C;border-radius:99px;padding:0 .08in;font-weight:700;font-size:8.5pt}

/* ---------- cover ---------- */
section.cover{page:cover;position:relative;width:8.5in;height:10.98in;overflow:hidden;break-after:page;background:#CDE9FF}
.scene{position:absolute;inset:0;width:100%;height:100%}
.cover .top{position:absolute;left:.85in;right:.85in;top:.8in}
.cover .brand{display:inline-block;background:#fff;color:var(--navy);font:800 9.5pt var(--body);letter-spacing:.14em;text-transform:uppercase;padding:.06in .18in;border-radius:99px;box-shadow:0 2px 0 rgba(20,38,61,.12)}
.cover h1{font-size:66pt;line-height:1;margin:.2in 0 .06in;color:var(--navy);-webkit-text-stroke:.03em var(--navy)}
.cover .sub{font:700 22pt/1.15 var(--head);color:var(--blue);margin:0 0 .22in;-webkit-text-stroke:.025em var(--blue);paint-order:stroke fill;stroke-linejoin:round}
.cover .thanks{font-size:13pt;line-height:1.5;max-width:4.9in;color:#1F3552}
.cover .counts{position:absolute;left:.7in;right:.7in;bottom:.62in;display:grid;grid-template-columns:repeat(3,1fr) 1.15fr;gap:.12in}
.count{background:#fff;border-radius:16px;padding:.1in .14in;box-shadow:0 3px 0 rgba(20,38,61,.16);border:2px solid var(--navy)}
.count .r{font:800 7.5pt var(--body);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.count .n{font:700 25pt/1.05 var(--head);color:var(--navy);-webkit-text-stroke:.03em var(--navy)}
.count .t{font-size:8pt;color:var(--muted);line-height:1.25}
.count.total{background:var(--gold);}
.count.total .r,.count.total .t{color:#4A3500}

/* ---------- how it works ---------- */
.step-card{display:block}
.step-card .big{display:grid;place-items:center;width:.46in;height:.46in;border-radius:50%;background:var(--blue);color:#fff;font:800 15pt var(--head);margin-bottom:.07in}
table.names{width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;font-size:9.5pt}
table.names td,table.names th{padding:.06in .12in;text-align:left;vertical-align:top}
table.names th{background:var(--sky-mid);font:800 8pt var(--body);letter-spacing:.08em;text-transform:uppercase;color:#1B4E8C}
table.names tr:nth-child(even) td{background:#F6FAFE}
table.names code{background:#fff;border:1px solid var(--line);border-radius:6px;padding:.01in .06in;white-space:nowrap}
.round-card{border-radius:16px;padding:.09in .14in;border:2px solid var(--navy);break-inside:avoid}
.round-card .rn{font:800 7.5pt var(--body);letter-spacing:.12em;text-transform:uppercase}
.round-card .rc{font:700 18pt/1.05 var(--head);-webkit-text-stroke:.03em currentColor}

/* ---------- where your art goes ---------- */
.phones{display:flex;gap:.3in;justify-content:center;margin:.04in 0 .1in}
.phone{width:3.2in}
.phone .cap{font:800 8.5pt var(--body);letter-spacing:.08em;text-transform:uppercase;color:#1B4E8C;margin:0 0 .05in .04in}
.shot{position:relative;width:100%;aspect-ratio:1/1.4373;overflow:hidden;border-radius:18px;border:2.5px solid var(--navy);background:#BFE3FF}
.shot img{position:absolute;left:0;width:100%;top:-33.9%;display:block}
.pin{position:absolute;width:.23in;height:.23in;border-radius:50%;background:var(--gold);color:var(--navy);border:2px solid var(--navy);font:800 8.5pt/.19in var(--head);text-align:center;transform:translate(-50%,-50%);box-shadow:0 1.5px 0 rgba(20,38,61,.35)}
ol.legend{list-style:none;padding:0;margin:0;columns:2;column-gap:.25in;font-size:9pt}
ol.legend li{display:flex;gap:.08in;align-items:flex-start;break-inside:avoid;margin:0 0 .06in}
ol.legend .pin{position:static;transform:none;flex:none;margin-top:.01in}
ol.legend b{display:block;line-height:1.25}
ol.legend span.f{font:500 8pt var(--mono);color:var(--muted)}

/* ---------- style guide ---------- */
.diagram{display:block;width:100%;height:auto}
.figure-row{display:grid;gap:.14in}
.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:.1in}
.sw{border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;break-inside:avoid}
.sw i{display:block;height:.32in;border-bottom:1.5px solid var(--line)}
.sw div{padding:.035in .06in .045in;font-size:8pt;line-height:1.2}
.sw b{display:block;font-size:8pt}
.sw span{font:500 7pt var(--mono);color:var(--muted)}
table.dd{width:100%;border-collapse:separate;border-spacing:0;border:1.5px solid var(--line);border-radius:14px;overflow:hidden}
table.dd th{padding:.07in .14in;text-align:left;font:800 9.5pt var(--head);color:#fff}
table.dd th.do{background:var(--grass-d)}
table.dd th.dont{background:var(--red)}
table.dd td{padding:.05in .14in;vertical-align:top;font-size:9.5pt;width:50%;border-top:1px solid var(--line)}
table.dd tr:nth-child(even) td{background:#F6FAFE}
table.dd .ico{width:.17in;height:.17in;vertical-align:-.03in;margin-right:.06in}
.never{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.12in}
.never .n{background:#FFF1F3;border:1.5px solid #F6C6CE;border-radius:14px;padding:.1in .13in;font-size:9.5pt;line-height:1.35}
.never .n b{display:block;color:#B23A4F;margin-bottom:.02in}

/* ---------- canva ---------- */
.steps{counter-reset:s;list-style:none;padding:0;margin:0;display:grid;gap:.07in}
.steps li{counter-increment:s;display:flex;gap:.14in;align-items:flex-start;background:var(--sky-soft);border:1.5px solid var(--sky);border-radius:14px;padding:.075in .14in;font-size:10pt;line-height:1.4;break-inside:avoid}
.steps li::before{content:counter(s);display:grid;place-items:center;flex:none;width:.34in;height:.34in;border-radius:50%;background:var(--blue);color:#fff;font:800 12pt var(--head)}
.steps li div{flex:1}
.sizes{display:flex;flex-wrap:wrap;gap:.12in;align-items:flex-end}
.sizebox{text-align:center;font-size:8pt;line-height:1.25;color:var(--muted)}
.sizebox .r{background:var(--sky);border:2px solid var(--navy);border-radius:6px;margin:0 auto .05in}
.sizebox b{display:block;color:var(--navy);font-size:8.5pt}
table.px{border-collapse:collapse;font-size:9pt}
table.px th,table.px td{padding:.03in .12in;border-bottom:1px solid var(--line);text-align:left}
table.px th{font:800 7.5pt var(--body);letter-spacing:.08em;text-transform:uppercase;color:#1B4E8C}

/* ---------- Roxie ---------- */
.roxie-fig{margin:0 auto .02in;max-width:6.5in}

/* ---------- rounds ---------- */
.round-hero{display:flex;gap:.2in;align-items:center;margin-bottom:.06in}
.round-badge{flex:none;width:1.2in;height:1.2in;border-radius:50%;display:grid;place-items:center;text-align:center;border:3px solid var(--navy);box-shadow:0 4px 0 rgba(20,38,61,.2)}
.round-badge small{display:block;font:800 8.5pt var(--body);letter-spacing:.2em;text-transform:uppercase;margin-bottom:-.06in}
.round-badge .d{font:700 54pt/1 var(--head);-webkit-text-stroke:.03em currentColor;paint-order:stroke fill;stroke-linejoin:round}
.round-hero .why{font-size:10.5pt;line-height:1.45}
.sum{display:flex;flex-wrap:wrap;gap:.05in;margin:.06in 0 .06in}
.sum span{font-size:8.5pt;font-weight:700;border-radius:99px;padding:.025in .1in;border:1.5px solid var(--navy);background:#fff}
.sum span em{font-style:normal;color:var(--muted);font-weight:600}
.group{margin:.13in 0 0}
table.assets{width:100%;border-collapse:separate;border-spacing:0;font-size:8.8pt;line-height:1.32;border:1.5px solid var(--line);border-radius:12px}
table.assets.keep{break-inside:avoid}
table.assets thead{display:table-header-group}
table.assets tr{break-inside:avoid}
table.assets th,table.assets td{padding:.034in .09in;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
table.assets tbody tr:last-child td{border-bottom:0}
table.assets .gh th{font:700 11.5pt var(--head);padding:.075in .12in;border-bottom:0;-webkit-text-stroke:.03em currentColor}
table.assets .gh th .cnt{float:right;font:800 8.5pt var(--body);letter-spacing:.04em;-webkit-text-stroke:0;opacity:.95}
table.assets .ch th{background:#F2F7FC;font:800 7pt var(--body);letter-spacing:.1em;text-transform:uppercase;color:#4A6285;padding:.035in .09in;border-bottom:1px solid var(--line)}
table.assets tbody tr.alt td{background:#F5F9FE}
table.assets tbody tr.gnote{break-after:avoid}
table.assets tbody tr.gnote td{background:#FFFBEF;color:#55657B;font-size:8.8pt;line-height:1.4;padding:.05in .12in}
td.cb{width:.3in;padding-right:0}
.box{display:block;width:.15in;height:.15in;border:1.8px solid var(--navy);border-radius:4px;background:#fff;margin-top:.02in}
td.fn{width:2.12in}
td.fn code{font-size:7.8pt;font-weight:600;color:var(--navy);word-break:break-all;line-height:1.35}
td.fn code b{color:var(--blue);background:#E3ECFF;border-radius:4px;padding:0 .02in}
td.sz{width:.86in;white-space:nowrap;font-weight:600;color:#33475F}
td.em{width:.4in;text-align:center;font:13pt/1.2 var(--emoji)}
td.wd .t{font-weight:700;color:var(--navy)}
.vr{margin-top:.04in;display:flex;flex-wrap:wrap;gap:.035in;align-items:center}
.vr .vt{font-weight:800;font-size:8pt;color:#1B4E8C;margin-right:.03in}
.vr .chip{font:600 7.8pt var(--mono);background:#fff;border:1.2px solid var(--sky);border-radius:99px;padding:0 .065in;color:var(--navy)}
.vr .vh{font-size:8pt;color:var(--muted)}
.vr .vh code{font-size:7.6pt;color:var(--navy)}
.fl{margin-top:.025in;font-size:8.3pt;color:var(--muted)}
.fl code{font-size:7.6pt;color:var(--navy)}
.note{margin-top:.035in;font-size:8.3pt;color:var(--muted);line-height:1.35}
.note::before{content:"Note: ";font-weight:800;color:#B07F00}

/* ---------- closing ---------- */
.big-ask{background:var(--gold);border:2.5px solid var(--navy);border-radius:20px;padding:.2in .26in;display:flex;align-items:center;gap:.2in}
.big-ask .q{font:700 20pt/1.15 var(--head);color:var(--navy);-webkit-text-stroke:.03em var(--navy)}
`;

// ---------------------------------------------------------------------------
// Page builders
// ---------------------------------------------------------------------------

function coverPage(data: BriefData): string {
  const total = data.counts[1] + data.counts[2] + data.counts[3];
  const card = (r: Round): string => {
    const info = ROUNDS[r];
    return `<div class="count"><div class="r">Round ${r}</div><div class="n">${data.counts[r]}</div><div class="t">${esc(info.name)}</div></div>`;
  };
  return `
  <section class="page first cover">
    ${coverScene()}
    <div class="top">
      <span class="brand">Loomis Family Insurance Agency</span>
      <h1>Art Guide</h1>
      <div class="sub">Loomis Personal Risk Manager</div>
      <p class="thanks">Thank you for bringing our little world to life. Every picture you draw makes a family's day a bit warmer.</p>
    </div>
    <div class="counts">
      ${card(1)}${card(2)}${card(3)}
      <div class="count total"><div class="r">All together</div><div class="n">${total}</div><div class="t">images to draw, in three rounds</div></div>
    </div>
  </section>`;
}

function howItWorksPage(data: BriefData): string {
  const roundCards = ([1, 2, 3] as Round[])
    .map((r) => {
      const info = ROUNDS[r];
      return `<div class="round-card" style="background:${info.soft}">
        <div class="rn" style="color:${r === 3 ? "#8A6300" : info.color}">Round ${r}</div>
        <div class="rc" style="color:${NAVY}">${data.counts[r]} images</div>
        <div class="small" style="line-height:1.3">${esc(info.name)}</div></div>`;
    })
    .join("");
  const emojiPara = data.showEmoji
    ? `The small emoji beside many rows is what the game shows today while it waits for your art: a hint about what the thing is, not a design to copy.`
    : "";
  return `
  <section class="page">
    <span class="eyebrow">Start here</span>
    <h1>How this works</h1>
    <p class="lead">Picture a little toy world on a table, like a picture-book diorama. A client starts alone in an empty field. Each time they add their family, their home, their car, their dog or their treasures, something new appears and the world grows. <b>Every image you draw is one piece that we place in that world.</b></p>

    <div class="grid3" style="margin:.16in 0 .1in">
      <div class="card step-card"><div class="big">1</div><h3>One piece at a time</h3><p class="small" style="margin:0">Each picture is a single piece on a transparent background: one house, one car, one pose of Roxie. We arrange them in the app, so you never need to draw a whole scene.</p></div>
      <div class="card step-card"><div class="big">2</div><h3>Round 1 comes first</h3><p class="small" style="margin:0">The list is split into three rounds. Round 1 is enough to play from the empty field to a small neighborhood. Within a round, any order is fine.</p></div>
      <div class="card step-card"><div class="big">3</div><h3>Send batches</h3><p class="small" style="margin:0">Send files back whenever a handful are ready. There is no need to wait for a whole round, and we can start using them right away.</p></div>
    </div>

    <h2>File names matter</h2>
    <p>The app finds each picture by its file name, so please name every file exactly as it appears in the checklists. If the list says <code>hq-building.png</code>, that is the name the game will look for. Names are always lowercase, with dashes, and end in <code>.png</code>.</p>
    <table class="names">
      <tr><th>When the list says</th><th>You make</th><th>Example file names</th></tr>
      <tr><td>A plain name</td><td>One file</td><td><code>hq-building.png</code></td></tr>
      <tr><td>Colors (red, blue...)</td><td>One file per color</td><td><code>vehicle-sedan-red.png</code> <code>vehicle-sedan-blue.png</code></td></tr>
      <tr><td>Skin tones (t1 to t4)</td><td>One file per skin tone</td><td><code>person-woman-t1.png</code> <code>person-woman-t4.png</code></td></tr>
      <tr><td>Numbered versions</td><td>One file per number</td><td><code>flower-1.png</code> <code>flower-2.png</code></td></tr>
    </table>

    <h2>Reading the checklists</h2>
    <p>Every row has a box to tick (on a row with several colors or versions, tick it once they are all done) and a canvas size in pixels, width &times; height. ${emojiPara}</p>
    <div class="grid3" style="margin-top:.1in">${roundCards}</div>
  </section>`;
}

interface Pin {
  n: number;
  x: number;
  y: number;
}

/** Pin positions are in the original 780 x 1688 screenshot, and the crop shows y 380 to 1500. */
function shot(src: string, alt: string, pins: Pin[]): string {
  const CROP_TOP = 380;
  const CROP_H = 1120;
  const dots = pins
    .map((p) => `<span class="pin" style="left:${((p.x / 780) * 100).toFixed(2)}%;top:${(((p.y - CROP_TOP) / CROP_H) * 100).toFixed(2)}%">${p.n}</span>`)
    .join("");
  return `<div class="shot"><img src="${src}" alt="${esc(alt)}">${dots}</div>`;
}

function whereArtGoesPage(): string {
  const legend: Array<[number, string, string]> = [
    [1, "Loomis HQ and Roxie live here", "hq-*  roxie-*"],
    [2, "Your house goes here", "home-*"],
    [3, "The family stands in the yard", "person-*  family-tree"],
    [4, "Cars park here, on the driveway", "vehicle-*  driveway-pad"],
    [5, "Toys wait by the garage", "toy-*  terrain-garage-pad"],
    [6, "A lake appears with the first boat", "terrain-lake  toy-motorboat"],
    [7, "Horses live in a fenced pasture", "pet-horse  terrain-fence-*"],
    [8, "The treasure chest holds valuables", "vault-chest-*  valuable-*"],
    [9, "A road leads to town and work", "terrain-road-*  work-*"],
    [10, "Yard buildings: sheds, barns and more", "structure-*"],
    [11, "Flowers, grass tufts and trees", "flower-*  tree-*  bush-*"],
    [12, "Clouds drift past, and a sky behind", "cloud-*  sky-*"],
    [13, "Roxie's face sits on the chat button", "roxie-headshot"],
  ];
  const empty: Pin[] = [
    { n: 1, x: 628, y: 668 },
    { n: 2, x: 390, y: 915 },
    { n: 3, x: 390, y: 1005 },
    { n: 11, x: 342, y: 890 },
    { n: 12, x: 372, y: 540 },
    { n: 13, x: 681, y: 1420 },
  ];
  const grown: Pin[] = [
    { n: 1, x: 640, y: 640 },
    { n: 2, x: 390, y: 835 },
    { n: 3, x: 390, y: 990 },
    { n: 4, x: 520, y: 930 },
    { n: 5, x: 88, y: 940 },
    { n: 6, x: 165, y: 1185 },
    { n: 7, x: 612, y: 1175 },
    { n: 8, x: 268, y: 868 },
    { n: 9, x: 390, y: 735 },
    { n: 10, x: 140, y: 775 },
    { n: 12, x: 345, y: 478 },
    { n: 13, x: 681, y: 1420 },
  ];
  return `
  <section class="page">
    <span class="eyebrow">The big picture</span>
    <h1>Where your art goes</h1>
    <p>These are screenshots of an early test version of the game, where emoji stand in for the real art. The numbered gold dots show where your pieces will live.</p>
    <div class="phones">
      <div class="phone"><div class="cap">Day one: the empty field</div>${shot("reference/03-world-empty.png", "The empty world: a green field with Loomis HQ on a hill", empty)}</div>
      <div class="phone"><div class="cap">Later: a grown world</div>${shot("reference/s4-mid.png", "A grown world with a house, cars, toys, a lake and a pasture", grown)}</div>
    </div>
    <ol class="legend">
      ${legend.map(([n, text, files]) => `<li><span class="pin">${n}</span><div><b>${esc(text)}</b><span class="f">${esc(files)}</span></div></li>`).join("")}
    </ol>
  </section>`;
}

function styleLookPage(): string {
  return `
  <section class="page">
    <span class="eyebrow">Style guide &middot; 1 of 3</span>
    <h1>The look</h1>
    <div class="card warm" style="margin-bottom:.14in">
      <h3>Mood</h3>
      <p style="margin:0">Warm, friendly and picture-book, like chunky wooden toys on a play mat. Shapes are rounded and a little oversized: slightly big wheels, roofs and heads. Nothing scary and nothing realistic-gritty. Our players range from kids to people in their 80s, so every piece should feel welcoming and read at a glance. A quick test: shrink it down to about 48 px. Can you still tell what it is?</p>
    </div>

    <div class="grid2">
      <div class="stack">
        <div>
          <h2 style="margin-top:0">Angle</h2>
          <p>Everything is drawn like a <b>board-game piece</b>: seen slightly from above (about 30&deg;), front facing, and <b>turned a little to the right</b>. <b>Use the same angle for every piece</b>, so they all sit together in the world as one set.</p>
        </div>
        <div class="grid2" style="gap:.06in">${angleDiagrams()}</div>
      </div>
      <div class="stack">
        <div class="card plain" style="padding:.08in .1in">
          <svg viewBox="0 0 320 270" class="diagram" role="img" aria-label="An example toy house with outline, highlight and shade">
            <g transform="translate(0 6)">${exampleHouse()}</g>
            <g font-family="inherit" font-size="11.5" font-weight="800" fill="${NAVY}">
              <path d="M 52 150 L 12 128" stroke="${C.deep}" stroke-width="2"/><text x="6" y="122">highlight</text>
              <path d="M 244 214 L 276 238" stroke="${C.deep}" stroke-width="2"/><text x="226" y="256">shade</text>
              <path d="M 262 116 L 282 98" stroke="${C.deep}" stroke-width="2"/><text x="232" y="90">navy outline</text>
            </g>
          </svg>
          <p class="small muted" style="margin:0;text-align:center">A rough example of the angle, outline and shading. Please don't copy this house: it is only a diagram.</p>
        </div>
      </div>
    </div>

    <div class="grid2" style="margin-top:.14in">
      <div>
        <h2 style="margin-top:0">Outline</h2>
        <p><b>Dark navy <code>#14263D</code></b>, about <b>2% of the canvas width</b> (roughly 20 px on a 1024 canvas), with rounded ends and corners. Keep the thickness the same on every piece, big or small. On a 512 canvas that is about 10 px.</p>
        <h2>Shading</h2>
        <p>Flat fills, plus <b>one darker shade</b> on the bottom-right and <b>one highlight</b> on the top-left. Light always comes from the top-left. No gradients, no fancy textures.</p>
      </div>
      <div class="card plain" style="align-self:start">${shadingSteps()}</div>
    </div>
  </section>`;
}

function stylePlacementPage(): string {
  return `
  <section class="page">
    <span class="eyebrow">Style guide &middot; 2 of 3</span>
    <h1>Placement and ground rules</h1>
    <div class="grid2" style="align-items:start">
      <div>
        <h2 style="margin-top:0">Where it sits on the canvas</h2>
        <p>Center the piece. Its <b>base sits on a ground line at 88% of the canvas height</b>, with about <b>6% padding</b> on the other sides. That is what lets every piece line up in the world, so a house, a car and a dog all stand on the same ground.</p>
        <p class="small muted">For a 1024 canvas, 6% is about 61 px and the ground line is about 901 px from the top. The Canva page has the numbers for the other sizes.</p>
        <h2>Recolor tip</h2>
        <p>Anything that comes in colors (vehicles, skin tones, pets) should have the varying part drawn as <b>one flat color group</b>: the car body, the skin, the coat. Each variant is then a quick recolor in Canva instead of a redraw.</p>
        <p class="small muted">Draw the shade and highlight on top of that group, so they stay put when the color changes.</p>
      </div>
      <div class="card plain" style="padding:.1in .12in">${placementDiagram()}</div>
    </div>

    <h2>Never include</h2>
    <div class="never">
      <div class="n"><b>A background</b>Every piece is a transparent PNG. Only the level skies and the app icon have a background.</div>
      <div class="n"><b>A ground shadow</b>The app adds shadows itself, so they always match.</div>
      <div class="n"><b>Any text, letters or numbers</b>The app adds the labels, which keeps text sharp and easy to translate. Loomis HQ's sign and the shop's sign are blank panels.</div>
    </div>

    <h2>A few exceptions</h2>
    <div class="card warm">
      <ul class="tidy" style="margin:0">
        <li><b>Scenery</b> (grass tile, lake, roads, sidewalk, clouds and the skies) fills its canvas and is soft, with no navy outline.</li>
        <li><b>Tiles</b> (grass, road, fence, path) must join up: the left edge matches the right, and the top matches the bottom or the next piece.</li>
        <li><b>Pieces in the air</b> (Roxie jumping, the drone) can float above the ground line. Keep them centered.</li>
      </ul>
    </div>
  </section>`;
}

function swatch(name: string, hex: string, extra = ""): string {
  return `<div class="sw"><i style="background:${hex}"></i><div><b>${esc(name)}</b><span>${hex}</span>${extra}</div></div>`;
}

function stylePalettePage(): string {
  const main: Array<[string, string]> = [
    ["Navy (outline)", "#14263D"],
    ["Loomis Blue", "#1D4ED8"],
    ["Gold", "#F5B301"],
    ["Sky", "#BFE3FF"],
    ["Warm white", "#FFF8EC"],
    ["Grass light", "#8BD27A"],
    ["Grass", "#5FB85A"],
    ["Grass dark", "#3E8E41"],
    ["Roof red", "#E0556B"],
    ["Brick", "#C8553D"],
    ["Wood", "#B7793F"],
    ["Stone", "#9AA5B1"],
    ["Water", "#5BC0EB"],
    ["Deep water", "#2E86C1"],
  ];
  const roxie: Array<[string, string]> = [
    ["Roxie 1", "#D5D8DC"],
    ["Roxie 2", "#A3A9B1"],
    ["Roxie 3", "#6B7280"],
  ];
  const cars: Array<[string, string]> = [
    ["Red", "#E0556B"],
    ["Blue", "#3B82F6"],
    ["White", "#F4F6F8"],
    ["Black", "#2B2F36"],
    ["Silver", "#B8C0CC"],
    ["Green", "#4CAF7A"],
    ["Teal (classic)", "#2BB3A6"],
  ];
  const row = (items: Array<[string, string]>, cols = 5): string =>
    `<div class="swatches" style="grid-template-columns:repeat(${cols},1fr)">${items.map(([n, h]) => swatch(n, h)).join("")}</div>`;
  return `
  <section class="page">
    <span class="eyebrow">Style guide &middot; 3 of 3</span>
    <h1>Colors, and do and don't</h1>
    <h2 style="margin-top:.05in">The palette</h2>
    ${row(main, 7)}
    <h2>Roxie's greys and the vehicle colors</h2>
    ${row([...roxie, ...cars], 10)}
    <p class="small muted" style="margin-top:.07in">You don't need to match these exactly, but please stay close so everything feels like one family. <b>If Loomis has official brand colors, use them for HQ and Roxie's collar.</b> Pets use natural, friendly coat colors of your choice. Teal is for the classic car only.</p>

    <h2>Do and don't</h2>
    <table class="dd">
      <tr><th class="do">Do</th><th class="dont">Don't</th></tr>
      <tr><td>${ICONS.check}Chunky, toy-like shapes with rounded corners</td><td>${ICONS.cross}Thin, spindly or realistic shapes</td></tr>
      <tr><td>${ICONS.check}Dark navy outline, the same thickness everywhere</td><td>${ICONS.cross}Mixing outline colors or thicknesses</td></tr>
      <tr><td>${ICONS.check}One angle for every piece: slightly above, a little turned right</td><td>${ICONS.cross}Flat front views, or pieces turned the other way</td></tr>
      <tr><td>${ICONS.check}Transparent background, centered, base on the ground line</td><td>${ICONS.cross}A background, a floor, or a ground shadow</td></tr>
      <tr><td>${ICONS.check}Friendly faces and gentle expressions</td><td>${ICONS.cross}Anything scary, gritty, sharp-toothed or sad</td></tr>
      <tr><td>${ICONS.check}Shapes that still read at 48 px</td><td>${ICONS.cross}Tiny details that vanish when small</td></tr>
      <tr><td>${ICONS.check}Recolor-ready groups for colors and skin tones</td><td>${ICONS.cross}Any text, letters or numbers (the app adds labels)</td></tr>
      <tr><td>${ICONS.check}A clearly different look for clients' pets and for Roxie</td><td>${ICONS.cross}A client's dog that looks like Roxie</td></tr>
    </table>
  </section>`;
}

function canvaPage(data: BriefData): string {
  // Draw one box per canvas size actually used, to scale (1024 px is 0.75 in).
  const sizeCount = new Map<string, number>();
  for (const a of data.assets) sizeCount.set(a.size, (sizeCount.get(a.size) ?? 0) + data.expandFiles(a).length);
  const order = [...sizeCount.keys()].sort((a, b) => {
    const [aw = 0, ah = 0] = a.split("x").map(Number);
    const [bw = 0, bh = 0] = b.split("x").map(Number);
    return aw * ah - bw * bh;
  });
  const scale = 0.5 / 1024;
  const boxes = order
    .map((size) => {
      const [w = 0, h = 0] = size.split("x").map(Number);
      return `<div class="sizebox"><div class="r" style="width:${(w * scale).toFixed(2)}in;height:${(h * scale).toFixed(2)}in"></div><b>${fmtSize(size)}</b>${plural(sizeCount.get(size) ?? 0, "file", "files")}</div>`;
    })
    .join("");
  const px = (side: number): string => `<tr><td>${side} px</td><td>${Math.round(side * 0.06)} px</td><td>${Math.round(side * 0.88)} px</td></tr>`;
  return `
  <section class="page">
    <span class="eyebrow">How-to</span>
    <h1>Drawing and exporting in Canva</h1>
    <p class="lead" style="margin-bottom:.1in">Canva Pro has everything you need. Here is the whole trip from a blank canvas to a finished file.</p>
    <ol class="steps">
      <li><div><b>Create a design, then Custom size.</b> Type the width and height in <b>px</b> from the checklist (for example 1024 &times; 1024).</div></li>
      <li><div><b>Draw the piece.</b> Keep it centered, with its base on the ground line (88% down) and about 6% padding. Turning on Canva's rulers and guides makes this easy: place guides at the spots in the little table below.</div></li>
      <li><div><b>Download.</b> Choose <b>Share, then Download</b>. Set the file type to <b>PNG</b> and tick <b>Transparent background</b> (a Canva Pro feature). Then press Download.</div></li>
      <li><div><b>Rename the file</b> to the exact name in the checklist, for example <code>vehicle-sedan-red.png</code>.</div></li>
      <li><div><b>Optional bonus:</b> if Canva offers SVG for the design, download one as well and keep the same name but ending in <code>.svg</code>. We still need the PNG.</div></li>
      <li><div><b>Need a smaller size?</b> Finish the 1024 version first, then use Canva's <b>Resize</b> to make the 512 and 256 versions of the same piece.</div></li>
    </ol>

    <div class="grid2" style="margin-top:.12in;align-items:start">
      <div>
        <h2 style="margin-top:0">Guide positions</h2>
        <table class="px">
          <tr><th>Canvas side</th><th>6% padding</th><th>Ground line (from top)</th></tr>
          ${px(1024)}${px(512)}${px(256)}
        </table>
        <p class="small muted" style="margin-top:.06in">On a wide or tall canvas, measure the same way against its own height and width.</p>
      </div>
      <div class="card warm">
        <h3>Colors and skin tones</h3>
        <p class="small" style="margin:0">Draw the first color, then duplicate the design and change only the flat color group. Rename each copy with its color or tone before you download it.</p>
      </div>
    </div>

    <h2>Every canvas size we use</h2>
    <p class="small muted" style="margin-bottom:.06in">Drawn to scale. The count is how many files use each size.</p>
    <div class="sizes">${boxes}</div>
  </section>`;
}

function roxiePage(): string {
  return `
  <section class="page">
    <span class="eyebrow">Our guide</span>
    <h1>Meet Roxie</h1>
    <p class="lead" style="margin-bottom:.05in">Roxie is a <b>small shaggy grey dog with floppy ears</b>. She is the heart of the game, so she gets her own page.</p>
    ${roxieLabeled()}
    <p class="small muted" style="text-align:center;margin:0 0 .08in">A quick rough sketch to show the idea: please make her yours, and much cuter.</p>

    <div class="grid2">
      <div class="card">
        <h3>What she looks like</h3>
        <ul class="tidy small" style="margin:0">
          <li>Fluffy light-grey coat with darker grey tufts</li>
          <li>Darker grey floppy ears</li>
          <li>Round dark eyes with a white highlight</li>
          <li>A small black nose and short legs</li>
          <li>A happy curled tail</li>
          <li>A <b>Loomis-blue collar</b> with a small <b>gold shield-shaped tag</b></li>
        </ul>
        <p class="small" style="margin:.06in 0 0">The tag is her signature. It also keeps her different from the clients' own dogs, which never wear it.</p>
      </div>
      <div class="card warm">
        <h3>Who she is</h3>
        <p class="small" style="margin:0 0 .06in"><b>Cheerful, loyal and a little goofy, but never frantic.</b> She is calm and kind, the sort of friend who is always happy to see you.</p>
        <p class="small" style="margin:0 0 .06in">She lives at Loomis HQ. She greets players, gives friendly tips, and carries quote requests from the player to HQ.</p>
        <p class="small" style="margin:0">She also keeps watch on the privacy screen ("Your world is safe with us") that appears just before someone creates an account: calm and protective, never fierce.</p>
      </div>
    </div>

    <div class="grid2" style="margin-top:.14in;align-items:center">
      <div>
        <h3>Please start with the turnaround sheet</h3>
        <p class="small" style="margin:0">Before any of her poses, draw <code>roxie-turnaround.png</code>: Roxie from the <b>front</b>, the <b>side</b> and the <b>back</b>, on one wide canvas. We'll all check it together, and every pose after that stays on-model. Her poses and headshot are in Round 1.</p>
      </div>
      <div class="card plain" style="padding:.06in .1in">${turnaroundDiagram()}</div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

/** The file name cell: variants show as a highlighted placeholder, e.g. vehicle-sedan-[color].png. */
function fileCell(asset: ArtAsset): string {
  if (!asset.variants || asset.variants.length === 0) return `<code>${esc(asset.file)}</code>`;
  const stem = asset.file.replace(/\.png$/, "");
  const label = (asset.variantLabel ?? "versions").replace(/s$/, "");
  const word = label === "skin tone" ? "tone" : label;
  return `<code>${esc(stem)}-<b>${esc(word)}</b>.png</code>`;
}

interface TableState {
  notes: Set<string>;
  helps: Set<string>;
  exampleShown: boolean;
}

function wdCell(asset: ArtAsset, state: TableState, expanded: string[]): string {
  const parts: string[] = [`<div><span class="t">${esc(asset.title)}.</span> ${esc(asset.whatToDraw)}</div>`];
  if (asset.variants && asset.variants.length > 0) {
    const label = asset.variantLabel ?? "versions";
    const chips = asset.variants.map((v) => `<span class="chip">${esc(v)}</span>`).join("");
    let help = "";
    if (asset.variantHelp && !state.helps.has(asset.variantHelp)) {
      state.helps.add(asset.variantHelp);
      help = `<span class="vh">${esc(asset.variantHelp)}</span>`;
    }
    let example = "";
    if (!state.exampleShown) {
      state.exampleShown = true;
      example = `<span class="vh">That makes ${expanded.length} files, for example <code>${esc(expanded[0] ?? "")}</code>.</span>`;
    }
    parts.push(`<div class="vr"><span class="vt">${asset.variants.length} ${esc(label)}:</span>${chips}${help}${example}</div>`);
  }
  if (asset.notes && !state.notes.has(asset.notes)) {
    state.notes.add(asset.notes);
    parts.push(`<div class="note">${esc(asset.notes)}</div>`);
  }
  return parts.join("");
}

function groupTable(group: string, rows: ArtAsset[], round: Round, data: BriefData): string {
  const info = ROUNDS[round];
  const showEmoji = data.showEmoji && rows.some((r) => r.placeholder);
  const total = rows.reduce((sum, r) => sum + data.expandFiles(r).length, 0);
  const cols = 4 + (showEmoji ? 1 : 0);
  const state: TableState = { notes: new Set<string>(), helps: new Set<string>(), exampleShown: false };
  const body = rows
    .map((asset, i) => {
      const expanded = data.expandFiles(asset);
      return `<tr${i % 2 === 1 ? ' class="alt"' : ""}>
        <td class="cb"><span class="box"></span></td>
        <td class="fn">${fileCell(asset)}</td>
        <td class="wd">${wdCell(asset, state, expanded)}</td>
        <td class="sz">${fmtSize(asset.size)}</td>
        ${showEmoji ? `<td class="em">${asset.placeholder ? esc(asset.placeholder) : ""}</td>` : ""}
      </tr>`;
    })
    .join("");
  const keep = rows.length <= 4 ? " keep" : "";
  const intro = GROUP_NOTES[group];
  const noteRow = intro ? `<tr class="gnote"><td colspan="${cols}">${esc(intro)}</td></tr>` : "";
  return `
  <div class="group">
    <table class="assets${keep}">
      <thead>
        <tr class="gh"><th colspan="${cols}" style="background:${info.color};color:${info.ink}">${esc(group)}<span class="cnt">${plural(total, "image", "images")}</span></th></tr>
        <tr class="ch"><th></th><th>File name</th><th>What to draw</th><th>Size (px)</th>${showEmoji ? "<th>Today</th>" : ""}</tr>
      </thead>
      <tbody>${noteRow}${body}</tbody>
    </table>
  </div>`;
}

function roundSection(round: Round, data: BriefData): string {
  const info = ROUNDS[round];
  const rows = data.assets.filter((a) => a.round === round);
  const groups = new Map<string, ArtAsset[]>();
  for (const asset of rows) {
    const list = groups.get(asset.group);
    if (list) list.push(asset);
    else groups.set(asset.group, [asset]);
  }
  const summary = [...groups.entries()]
    .map(([name, list]) => {
      const n = list.reduce((sum, a) => sum + data.expandFiles(a).length, 0);
      return `<span>${esc(name)} <em>${n}</em></span>`;
    })
    .join("");
  const tables = [...groups.entries()].map(([name, list]) => groupTable(name, list, round, data)).join("");
  return `
  <section class="page" style="page:round${round}">
    <div class="round-hero">
      <div class="round-badge" style="background:${info.color};color:${info.ink}"><div><small>Round</small><span class="d">${round}</span></div></div>
      <div>
        <span class="eyebrow">Checklist</span>
        <h1 style="margin-bottom:.06in">${esc(info.name)}</h1>
        <div class="why"><b>Why these ${round === 1 ? "first" : round === 2 ? "next" : "last"}?</b> ${esc(info.why)}</div>
      </div>
    </div>
    <p>${esc(info.intro)}</p>
    <div class="sum"><span style="background:${info.soft}">${data.counts[round]} images in all</span>${summary}</div>
    ${tables}
  </section>`;
}

function sendBackPage(): string {
  return `
  <section class="page">
    <span class="eyebrow">Almost there</span>
    <h1>Sending files back</h1>
    <p class="lead">Put everything in <b>one shared folder</b>, either on Google Drive or as a shared Canva folder. David will share the link with you.</p>
    <div class="grid2" style="margin:.12in 0">
      <div class="card">
        <h3>The simple rules</h3>
        <ul class="tidy" style="margin:0">
          <li>Name every file <b>exactly as listed</b>, lowercase with dashes.</li>
          <li><b>Batches are welcome.</b> Send a handful whenever they are ready.</li>
          <li><b>Round 1 first</b>, then Round 2, then Round 3.</li>
          <li>Inside a round, any order is fine. Roxie's turnaround sheet is the one to send first.</li>
        </ul>
      </div>
      <div class="card warm">
        <h3>Before you send, a quick check</h3>
        <ul class="tidy" style="margin:0">
          <li>Transparent background (except the skies and the app icon)</li>
          <li>The exact file name, ending in <code>.png</code></li>
          <li>The size from the checklist</li>
          <li>Centered, with its base on the ground line</li>
          <li>No text, no letters, no numbers and no ground shadow</li>
        </ul>
      </div>
    </div>
    <div class="big-ask">
      <svg viewBox="0 0 400 420" style="width:1.1in;flex:none" aria-hidden="true">${roxie("end", { tongue: true })}</svg>
      <div>
        <div class="q">Questions? Ask David.</div>
        <p style="margin:.05in 0 0;font-size:11pt">Whether it is a name, a size, or "what on earth is this one?", ask any time. And thank you: this world is going to be wonderful.</p>
      </div>
    </div>
  </section>`;
}

export function buildHtml(data: BriefData): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Loomis Personal Risk Manager: Art Guide</title>
<style>${CSS}</style>
</head>
<body>
${coverPage(data)}
${howItWorksPage(data)}
${whereArtGoesPage()}
${styleLookPage()}
${stylePlacementPage()}
${stylePalettePage()}
${canvaPage(data)}
${roxiePage()}
${roundSection(1, data)}
${roundSection(2, data)}
${roundSection(3, data)}
${sendBackPage()}
</body>
</html>
`;
}
