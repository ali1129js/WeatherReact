import type { ZodType } from "zod";
import { forecastResponseSchema, geocodingResponseSchema } from "./schemas";
import type { Forecast, Place } from "./schemas";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/** Today plus five more days. */
export const FORECAST_DAYS = 6;

export class ApiError extends Error {
  readonly kind: "http" | "shape";
  readonly status: number | null;

  constructor(kind: "http" | "shape", message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

export function geocodingUrl(query: string, count = 6): string {
  const params = new URLSearchParams({
    name: query.trim(),
    count: String(count),
    language: "en",
    format: "json",
  });
  return `${GEOCODING_URL}?${params}`;
}

export function forecastUrl(place: Pick<Place, "latitude" | "longitude">): string {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: String(FORECAST_DAYS),
  });
  return `${FORECAST_URL}?${params}`;
}

async function getJson<T>(url: string, schema: ZodType<T>, signal?: AbortSignal): Promise<T> {
  const init: RequestInit = signal ? { signal } : {};
  const res = await fetch(url, init);
  if (!res.ok) throw new ApiError("http", `Request failed with status ${res.status}`, res.status);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success)
    throw new ApiError("shape", "The weather service sent an unexpected response");
  return parsed.data;
}

export function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  return getJson(geocodingUrl(query), geocodingResponseSchema, signal);
}

export function fetchForecast(place: Place, signal?: AbortSignal): Promise<Forecast> {
  return getJson(forecastUrl(place), forecastResponseSchema, signal);
}
