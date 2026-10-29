import { UNITS } from "../lib/units";
import type { Units } from "../lib/units";

const LABELS: Readonly<Record<Units, string>> = { metric: "°C", imperial: "°F" };
const SPOKEN: Readonly<Record<Units, string>> = { metric: "Celsius", imperial: "Fahrenheit" };

export function UnitToggle({ value, onChange }: { value: Units; onChange: (u: Units) => void }) {
  return (
    <div role="group" aria-label="Units" className="segmented">
      {UNITS.map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={value === u}
          aria-label={SPOKEN[u]}
          onClick={() => onChange(u)}
          className="segment"
        >
          {LABELS[u]}
        </button>
      ))}
    </div>
  );
}
