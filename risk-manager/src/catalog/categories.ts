import type { Category } from "./types.ts";

/**
 * The big tiles in the "Add" menu, in display order. People come first because
 * the world starts with the client alone in a field — the next thing a family
 * does is bring each other in.
 */
export const CATEGORIES: Category[] = [
  { id: "people", label: "People", emoji: "👪", tagline: "Who lives with you?" },
  { id: "home", label: "Home", emoji: "🏡", tagline: "Where do you live?" },
  { id: "vehicles", label: "Vehicles", emoji: "🚗", tagline: "What do you drive?" },
  { id: "toys", label: "Fun & toys", emoji: "🚤", tagline: "Boats, campers, ATVs and more" },
  { id: "pets", label: "Pets", emoji: "🐾", tagline: "Who greets you at the door?" },
  { id: "valuables", label: "Valuables", emoji: "💎", tagline: "What is special to you?" },
  { id: "work", label: "Work", emoji: "💼", tagline: "What do you do all day?" },
];
