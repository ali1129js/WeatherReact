import { vi } from "vitest";

export const berlinRaw = {
  id: 2950159,
  name: "Berlin",
  latitude: 52.52437,
  longitude: 13.41053,
  country: "Germany",
  admin1: "Berlin",
};

export const bernRaw = {
  id: 2661552,
  name: "Bern",
  latitude: 46.94809,
  longitude: 7.44744,
  country: "Switzerland",
  admin1: "Bern",
};

export const geocodingBody = (results = [berlinRaw, bernRaw]) => ({
  results,
  generationtime_ms: 0.4,
});

export const forecastBody = () => ({
  latitude: 52.52,
  longitude: 13.41,
  timezone: "Europe/Berlin",
  current: {
    time: "2026-10-29T11:15",
    interval: 900,
    temperature_2m: 12.4,
    relative_humidity_2m: 71,
    apparent_temperature: 10.2,
    weather_code: 3,
    wind_speed_10m: 16.1,
    is_day: 1,
  },
  daily: {
    time: ["2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02", "2026-11-03"],
    weather_code: [3, 61, 80, 71, 0, 95],
    temperature_2m_max: [13.1, 11.0, 9.5, 2.2, 7.0, 10.4],
    temperature_2m_min: [7.0, 6.5, 4.0, -0.4, -1.2, 5.5],
    precipitation_probability_max: [10, 80, 65, 40, null, 90],
  },
});

type Handler = (url: URL, init: RequestInit | undefined) => Response | Promise<Response>;

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/**
 * Replaces global fetch with a router over the two Open-Meteo hosts.
 * Defaults answer a search with Berlin and Bern and any forecast with the fixture above.
 */
export function mockOpenMeteo(overrides: { geocoding?: Handler; forecast?: Handler } = {}) {
  const geocoding: Handler = overrides.geocoding ?? (() => json(geocodingBody()));
  const forecast: Handler = overrides.forecast ?? (() => json(forecastBody()));
  const fn = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
    );
    if (url.hostname === "geocoding-api.open-meteo.com")
      return Promise.resolve(geocoding(url, init));
    if (url.hostname === "api.open-meteo.com") return Promise.resolve(forecast(url, init));
    return Promise.reject(new Error(`unexpected request to ${url.href}`));
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
