export const UNITS = ["metric", "imperial"] as const;
export type Units = (typeof UNITS)[number];

export const cToF = (c: number): number => (c * 9) / 5 + 32;
export const kmhToMph = (kmh: number): number => kmh / 1.609344;

/** Rounds to a whole degree and never prints "-0". */
function whole(n: number): number {
  const r = Math.round(n);
  return r === 0 ? 0 : r;
}

export function convertTemp(c: number, units: Units): number {
  return units === "imperial" ? cToF(c) : c;
}

export function formatTemp(c: number, units: Units): string {
  return `${whole(convertTemp(c, units))}°`;
}

export function tempUnitLabel(units: Units): string {
  return units === "imperial" ? "°F" : "°C";
}

export function formatWind(kmh: number, units: Units): string {
  return units === "imperial" ? `${whole(kmhToMph(kmh))} mph` : `${whole(kmh)} km/h`;
}

/** Spoken form for screen readers, e.g. "21 degrees Celsius". */
export function spokenTemp(c: number, units: Units): string {
  const n = whole(convertTemp(c, units));
  return `${n} degrees ${units === "imperial" ? "Fahrenheit" : "Celsius"}`;
}
