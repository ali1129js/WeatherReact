# Weather

Search a city, see the current weather and the next five days. Built with React 19 and strict TypeScript, using the free [Open-Meteo](https://open-meteo.com/) API: **no account and no API key**.

Rebuilt in 2026 (original 2018, AI pair-programmed 2026). The 2018 version used Create React App and OpenWeatherMap with a key committed to the source; this version replaces both.

## Features

- City search with debounced requests; an earlier request is aborted when the text changes.
- Current conditions (temperature, feels like, humidity, wind, today's high and low) and a 5-day forecast.
- °C / °F toggle (conversion happens in the browser, no new request).
- Recent cities (last five) and units are kept in `localStorage`, and validated with Zod when read back. Corrupt or outdated data is ignored.
- Works offline after the first visit: a service worker keeps the page and the last forecast you looked at.
- Three themes: light, dark and high contrast. The first visit follows the OS setting (`prefers-color-scheme`, `prefers-contrast`).
- Accessible: labelled combobox with keyboard support, live status messages, visible focus, skip link, text alternatives for temperatures, no horizontal scrolling at 390 px wide. axe-core reports no violations in all three themes.

## Stack

Vite, React 19, TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Zod 4, TanStack Query 5, Vitest and Testing Library, ESLint, Prettier.

## Scripts

```bash
npm install
npm run dev         # http://localhost:5173/WeatherReact/
npm run lint
npm run typecheck
npm test
npm run build       # type-checks, then builds to dist/
npm run preview
```

## How it fits together

| Path                         | What it does                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `src/api/schemas.ts`         | Zod schemas for the geocoding and forecast responses, mapped to small domain types         |
| `src/api/openMeteo.ts`       | URL builders and `fetch` with an abort signal; throws `ApiError` for HTTP and shape errors |
| `src/hooks/useCitySearch.ts` | Debounced search with TanStack Query                                                       |
| `src/lib/storage.ts`         | Schema-validated `localStorage` helpers (versioned keys)                                   |
| `src/theme/themes.ts`        | Colour tokens for the three themes, plus the contrast maths used by the tests              |
| `public/sw.js`               | Offline cache (network first, cached fallback)                                             |

Colours are defined once in `themes.ts`, applied as CSS variables, and checked by `src/test/theme.test.tsx` (WCAG AA for light and dark, AAA for high contrast, 3:1 for borders and the focus ring).

`scripts/e2e-shots.mjs` is a headless browser check (all themes, desktop and phone, axe-core, offline reload) that writes screenshots. It needs Playwright and axe-core, which are not project dependencies.

## Deploying

`.github/workflows/deploy.yml` runs lint, typecheck, tests and build on every push and pull request, and deploys `dist/` to GitHub Pages when `main` or `master` changes (Pages source: GitHub Actions).

## Credit

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed CC BY 4.0. The original 2018 version followed the "Using APIs in React" tutorial by [Hamza Mirza](https://github.com/hamza-mirza) and the modal tutorial by [Dave Ceddia](https://daveceddia.com/).
