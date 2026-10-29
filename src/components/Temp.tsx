import { formatTemp, spokenTemp } from "../lib/units";
import type { Units } from "../lib/units";

interface Props {
  c: number;
  units: Units;
  /** Spoken prefix, e.g. "High". */
  prefix?: string;
  className?: string;
}

/** Shows the compact "21°" and gives screen readers the full "21 degrees Celsius". */
export function Temp({ c, units, prefix, className }: Props) {
  const spoken = `${prefix ? `${prefix} ` : ""}${spokenTemp(c, units)}`;
  return (
    <span className={className}>
      <span aria-hidden="true">{formatTemp(c, units)}</span>
      <span className="sr-only">{spoken}</span>
    </span>
  );
}
