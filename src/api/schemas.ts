import { z } from "zod";

/** A place returned by the Open-Meteo geocoding API, reduced to what the app uses. */
export const placeSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country: z.string().nullable(),
  admin1: z.string().nullable(),
});
export type Place = z.infer<typeof placeSchema>;

const rawPlaceSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country: z.string().optional(),
  admin1: z.string().optional(),
});

/** The API omits `results` entirely when nothing matches. */
export const geocodingResponseSchema = z
  .object({ results: z.array(rawPlaceSchema).optional() })
  .transform(({ results }): Place[] =>
    (results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country ?? null,
      admin1: r.admin1 ?? null,
    })),
  );

export interface CurrentWeather {
  time: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  windKmh: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DayForecast {
  date: string;
  weatherCode: number;
  maxC: number;
  minC: number;
  /** Percent, or null when the model has no value for that day. */
  precipitationChance: number | null;
}

export interface Forecast {
  timezone: string;
  current: CurrentWeather;
  /** Today first, then the following days. */
  days: DayForecast[];
}

export const forecastResponseSchema = z
  .object({
    timezone: z.string(),
    current: z.object({
      time: z.string(),
      temperature_2m: z.number(),
      relative_humidity_2m: z.number(),
      apparent_temperature: z.number(),
      weather_code: z.number().int(),
      wind_speed_10m: z.number(),
      is_day: z.union([z.literal(0), z.literal(1)]),
    }),
    daily: z.object({
      time: z.array(z.string()).min(1),
      weather_code: z.array(z.number().int()),
      temperature_2m_max: z.array(z.number()),
      temperature_2m_min: z.array(z.number()),
      precipitation_probability_max: z.array(z.number().nullable()),
    }),
  })
  .refine(
    ({ daily }) =>
      [
        daily.weather_code,
        daily.temperature_2m_max,
        daily.temperature_2m_min,
        daily.precipitation_probability_max,
      ].every((a) => a.length === daily.time.length),
    { message: "daily arrays differ in length", path: ["daily"] },
  )
  .transform(({ timezone, current, daily }): Forecast => {
    const days: DayForecast[] = daily.time.map((date, i) => ({
      date,
      weatherCode: daily.weather_code[i] ?? 0,
      maxC: daily.temperature_2m_max[i] ?? 0,
      minC: daily.temperature_2m_min[i] ?? 0,
      precipitationChance: daily.precipitation_probability_max[i] ?? null,
    }));
    return {
      timezone,
      current: {
        time: current.time,
        temperatureC: current.temperature_2m,
        feelsLikeC: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windKmh: current.wind_speed_10m,
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
      },
      days,
    };
  });
