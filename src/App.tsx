import { useEffect, useState } from "react";
import type { Place } from "./api/schemas";
import { CurrentConditions } from "./components/CurrentConditions";
import { ForecastList } from "./components/ForecastList";
import { RecentCities } from "./components/RecentCities";
import { SearchBox } from "./components/SearchBox";
import { UnitToggle } from "./components/UnitToggle";
import { useForecast } from "./hooks/useForecast";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useStoredState } from "./hooks/useStoredState";
import {
  DEFAULT_UNITS,
  KEYS,
  addRecent,
  recentsSchema,
  themeSchema,
  unitsSchema,
} from "./lib/storage";
import type { ThemeName } from "./lib/storage";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyTheme, preferredTheme } from "./theme/themes";

export interface AppProps {
  /** Search debounce in ms; tests shorten it. */
  debounceMs?: number;
}

export function App({ debounceMs }: AppProps) {
  const [theme, setTheme] = useStoredState<ThemeName>(KEYS.theme, themeSchema, preferredTheme());
  const [units, setUnits] = useStoredState(KEYS.units, unitsSchema, DEFAULT_UNITS);
  const [recents, setRecents] = useStoredState(KEYS.recents, recentsSchema, []);
  const [selected, setSelected] = useState<Place | null>(() => recents[0] ?? null);
  const online = useOnlineStatus();
  const forecast = useForecast(selected);

  function choose(place: Place) {
    setSelected(place);
    setRecents((list) => addRecent(list, place));
  }

  useEffect(() => applyTheme(theme), [theme]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="app-header">
        <h1 className="app-title">Weather</h1>
        <div className="controls">
          <ThemeSwitcher value={theme} onChange={setTheme} />
          <UnitToggle value={units} onChange={setUnits} />
        </div>
      </header>

      {!online ? (
        <p role="status" className="banner">
          You are offline. Saved forecasts may be out of date.
        </p>
      ) : null}

      <main id="main" tabIndex={-1} className="app-main">
        <SearchBox onSelect={choose} {...(debounceMs !== undefined ? { debounceMs } : {})} />
        <RecentCities places={recents} selectedId={selected?.id ?? null} onSelect={choose} />

        <div aria-live="polite" className="results">
          {selected === null ? (
            <p className="empty">Search for a city to see its weather.</p>
          ) : forecast.isPending ? (
            <p role="status" className="empty">
              Loading the forecast for {selected.name}…
            </p>
          ) : forecast.isError ? (
            <div role="alert" className="card error">
              <p>The forecast for {selected.name} could not be loaded.</p>
              <button type="button" className="button" onClick={() => void forecast.refetch()}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <CurrentConditions place={selected} forecast={forecast.data} units={units} />
              <ForecastList forecast={forecast.data} units={units} />
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        Weather data by{" "}
        <a href="https://open-meteo.com/" rel="noreferrer">
          Open-Meteo.com
        </a>{" "}
        (CC BY 4.0). No account, no API key, nothing sent except the city you search for.
      </footer>
    </div>
  );
}
