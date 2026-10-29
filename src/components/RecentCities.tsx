import type { Place } from "../api/schemas";
import { placeLabel } from "../lib/format";

interface Props {
  places: readonly Place[];
  selectedId: number | null;
  onSelect: (p: Place) => void;
}

export function RecentCities({ places, selectedId, onSelect }: Props) {
  if (places.length === 0) return null;
  return (
    <section aria-labelledby="recent-title" className="recent">
      <h2 id="recent-title" className="section-title">
        Recent cities
      </h2>
      <ul className="chips">
        {places.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="chip"
              aria-pressed={p.id === selectedId}
              aria-label={placeLabel(p)}
              onClick={() => onSelect(p)}
            >
              {p.name}
              {p.country ? <span className="chip-country">{p.country}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
