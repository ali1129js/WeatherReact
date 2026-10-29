import { z } from "zod";
import { placeSchema } from "../api/schemas";
import type { Place } from "../api/schemas";
import { UNITS } from "./units";
import type { Units } from "./units";

export const THEME_NAMES = ["light", "dark", "contrast"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export const MAX_RECENT = 5;

export const unitsSchema = z.enum(UNITS);
export const themeSchema = z.enum(THEME_NAMES);
export const recentsSchema = z.array(placeSchema).max(MAX_RECENT);

/** Versioned keys, so a future shape change can ignore old data instead of crashing on it. */
export const KEYS = {
  units: "weather.v1.units",
  theme: "weather.v1.theme",
  recents: "weather.v1.recents",
} as const;

export const DEFAULT_UNITS: Units = "metric";

/** Reads and validates a value; anything missing, corrupt or of the wrong shape gives the fallback. */
export function readStored<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

/** Storage can be full or blocked (private mode); the app still works, it just forgets. */
export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Puts a place first, removes an earlier entry for the same place, keeps the newest MAX_RECENT. */
export function addRecent(list: readonly Place[], place: Place): Place[] {
  return [place, ...list.filter((p) => p.id !== place.id)].slice(0, MAX_RECENT);
}
