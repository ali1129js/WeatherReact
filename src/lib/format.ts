import type { Place } from "../api/schemas";

export function placeLabel(p: Pick<Place, "name" | "admin1" | "country">): string {
  return [p.name, p.admin1, p.country].filter((s): s is string => Boolean(s)).join(", ");
}

/** "2026-10-29" as a local calendar date. Going through Date.parse would shift it by the UTC offset. */
export function parseDay(iso: string): Date {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dayLabel(iso: string): { weekday: string; date: string } {
  const d = parseDay(iso);
  return {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d),
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d),
  };
}
