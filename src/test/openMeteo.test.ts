import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  FORECAST_DAYS,
  fetchForecast,
  forecastUrl,
  geocodingUrl,
  searchPlaces,
} from "../api/openMeteo";
import { forecastBody, json, mockOpenMeteo } from "./fixtures";

afterEach(() => vi.unstubAllGlobals());

describe("URL builders", () => {
  it("builds a geocoding URL with a trimmed, encoded name and no API key", () => {
    const u = new URL(geocodingUrl("  São Paulo "));
    expect(u.origin).toBe("https://geocoding-api.open-meteo.com");
    expect(u.searchParams.get("name")).toBe("São Paulo");
    expect(u.searchParams.get("count")).toBe("6");
    expect([...u.searchParams.keys()].some((k) => /key|token|appid/i.test(k))).toBe(false);
  });

  it("builds a forecast URL for today plus five days, auto timezone, metric base units", () => {
    const u = new URL(forecastUrl({ latitude: 52.5, longitude: 13.4 }));
    expect(u.origin).toBe("https://api.open-meteo.com");
    expect(u.searchParams.get("latitude")).toBe("52.5");
    expect(u.searchParams.get("forecast_days")).toBe(String(FORECAST_DAYS));
    expect(u.searchParams.get("timezone")).toBe("auto");
    expect(u.searchParams.get("daily")).toContain("temperature_2m_max");
    expect(u.searchParams.has("temperature_unit")).toBe(false);
  });
});

describe("requests", () => {
  it("passes the abort signal to fetch, and an aborted request rejects", async () => {
    const fetchMock = mockOpenMeteo({
      geocoding: (_url, init) =>
        new Promise<Response>((_res, rej) => {
          init?.signal?.addEventListener("abort", () =>
            rej(new DOMException("aborted", "AbortError")),
          );
        }) as unknown as Response,
    });
    const ctrl = new AbortController();
    const pending = searchPlaces("Ber", ctrl.signal);
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(ctrl.signal);
    ctrl.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("throws an http ApiError on a non-2xx answer", async () => {
    mockOpenMeteo({ forecast: () => json({ reason: "nope" }, 500) });
    const err = await fetchForecast({
      id: 1,
      name: "x",
      latitude: 0,
      longitude: 0,
      country: null,
      admin1: null,
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ kind: "http", status: 500 });
  });

  it("throws a shape ApiError when the body does not match the schema", async () => {
    mockOpenMeteo({ geocoding: () => json({ results: [{ id: "bad" }] }) });
    await expect(searchPlaces("Berlin")).rejects.toMatchObject({ kind: "shape" });
  });

  it("parses a good forecast", async () => {
    mockOpenMeteo({ forecast: () => json(forecastBody()) });
    const f = await fetchForecast({
      id: 1,
      name: "x",
      latitude: 0,
      longitude: 0,
      country: null,
      admin1: null,
    });
    expect(f.days).toHaveLength(6);
  });
});
