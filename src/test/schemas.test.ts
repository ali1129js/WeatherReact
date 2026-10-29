import { describe, expect, it } from "vitest";
import { forecastResponseSchema, geocodingResponseSchema, placeSchema } from "../api/schemas";
import { berlinRaw, forecastBody, geocodingBody } from "./fixtures";

describe("geocodingResponseSchema", () => {
  it("keeps the fields the app uses and turns missing optionals into null", () => {
    const places = geocodingResponseSchema.parse(
      geocodingBody([
        berlinRaw,
        { id: 1, name: "Nowhere", latitude: 1, longitude: 2 } as typeof berlinRaw,
      ]),
    );
    expect(places[0]).toEqual({
      id: 2950159,
      name: "Berlin",
      latitude: 52.52437,
      longitude: 13.41053,
      country: "Germany",
      admin1: "Berlin",
    });
    expect(places[1]).toMatchObject({ country: null, admin1: null });
  });

  it("treats a response without `results` (no match) as an empty list", () => {
    expect(geocodingResponseSchema.parse({ generationtime_ms: 0.1 })).toEqual([]);
  });

  it("rejects out-of-range coordinates and wrong types", () => {
    expect(
      geocodingResponseSchema.safeParse(geocodingBody([{ ...berlinRaw, latitude: 123 }])).success,
    ).toBe(false);
    expect(geocodingResponseSchema.safeParse({ results: "oops" }).success).toBe(false);
    expect(placeSchema.safeParse({ id: "x" }).success).toBe(false);
  });
});

describe("forecastResponseSchema", () => {
  it("maps the API shape to the domain model", () => {
    const f = forecastResponseSchema.parse(forecastBody());
    expect(f.timezone).toBe("Europe/Berlin");
    expect(f.current).toEqual({
      time: "2026-10-29T11:15",
      temperatureC: 12.4,
      feelsLikeC: 10.2,
      humidity: 71,
      windKmh: 16.1,
      weatherCode: 3,
      isDay: true,
    });
    expect(f.days).toHaveLength(6);
    expect(f.days[1]).toEqual({
      date: "2026-10-30",
      weatherCode: 61,
      maxC: 11,
      minC: 6.5,
      precipitationChance: 80,
    });
  });

  it("keeps a null precipitation chance as null", () => {
    expect(forecastResponseSchema.parse(forecastBody()).days[4]?.precipitationChance).toBeNull();
  });

  it("rejects daily arrays of different length", () => {
    const body = forecastBody();
    body.daily.temperature_2m_min.pop();
    expect(forecastResponseSchema.safeParse(body).success).toBe(false);
  });

  it("rejects a missing current block and a bad is_day flag", () => {
    const noCurrent: Partial<ReturnType<typeof forecastBody>> = forecastBody();
    delete noCurrent.current;
    expect(forecastResponseSchema.safeParse(noCurrent).success).toBe(false);
    const body = forecastBody();
    (body.current as { is_day: number }).is_day = 2;
    expect(forecastResponseSchema.safeParse(body).success).toBe(false);
  });
});
