import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Place } from "../api/schemas";
import { useCitySearch, MIN_QUERY_LENGTH } from "../hooks/useCitySearch";
import { placeLabel } from "../lib/format";

interface Props {
  onSelect: (place: Place) => void;
  debounceMs?: number;
}

export function SearchBox({ onSelect, debounceMs }: Props) {
  const uid = useId();
  const listId = `${uid}-list`;
  const statusId = `${uid}-status`;
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { places, searching, error, settled } = useCitySearch(input, debounceMs);

  const showList = open && places.length > 0;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  function choose(place: Place) {
    onSelect(place);
    setInput("");
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && places.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % places.length);
    } else if (e.key === "ArrowUp" && places.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? places.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      const pick = places[active] ?? (places.length > 0 && settled ? places[0] : undefined);
      if (pick) {
        e.preventDefault();
        choose(pick);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  let status = "";
  if (error) status = "Could not search for cities. Check your connection and try again.";
  else if (searching) status = "Searching…";
  else if (settled)
    status = places.length === 0 ? "No cities found." : `${places.length} cities found.`;
  else if (input.trim().length > 0 && input.trim().length < MIN_QUERY_LENGTH)
    status = `Type at least ${MIN_QUERY_LENGTH} letters.`;

  return (
    <div className="search">
      <label htmlFor={`${uid}-input`} className="field-label">
        Search for a city
      </label>
      <input
        id={`${uid}-input`}
        type="search"
        role="combobox"
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        placeholder="Berlin, Lagos, Osaka…"
        className="search-input"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-describedby={statusId}
        {...(showList && active >= 0 ? { "aria-activedescendant": optionId(active) } : {})}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Matching cities"
        className="suggestions"
        hidden={!showList}
      >
        {places.map((p, i) => (
          <li
            key={p.id}
            id={optionId(i)}
            role="option"
            aria-selected={i === active}
            className="suggestion"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(p)}
          >
            {placeLabel(p)}
          </li>
        ))}
      </ul>
      <p id={statusId} role={error ? "alert" : "status"} className="search-status">
        {status}
      </p>
    </div>
  );
}
