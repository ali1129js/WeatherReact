import { describe, expect, it } from "vitest";
import { cToF, formatTemp, formatWind, kmhToMph, spokenTemp, tempUnitLabel } from "../lib/units";
import { describeWeather } from "../lib/weatherCodes";
import { dayLabel, parseDay, placeLabel } from "../lib/format";

describe("unit conversion", () => {
  it("converts Celsius to Fahrenheit at known points", () => {
    expect(cToF(0)).toBe(32);
    expect(cToF(100)).toBe(212);
    expect(cToF(-40)).toBe(-40);
    expect(cToF(37)).toBeCloseTo(98.6, 5);
  });

  it("converts km/h to mph", () => {
    expect(kmhToMph(0)).toBe(0);
    expect(kmhToMph(100)).toBeCloseTo(62.137, 2);
  });

  it("formats temperatures rounded, in the chosen unit, without -0", () => {
    expect(formatTemp(12.4, "metric")).toBe("12°");
    expect(formatTemp(12.5, "metric")).toBe("13°");
    expect(formatTemp(12.4, "imperial")).toBe("54°");
    expect(formatTemp(-0.4, "metric")).toBe("0°");
    expect(formatTemp(-17.8, "imperial")).toBe("0°");
    expect(formatTemp(-5.2, "metric")).toBe("-5°");
  });

  it("formats wind and labels units", () => {
    expect(formatWind(16.1, "metric")).toBe("16 km/h");
    expect(formatWind(16.1, "imperial")).toBe("10 mph");
    expect(tempUnitLabel("metric")).toBe("°C");
    expect(tempUnitLabel("imperial")).toBe("°F");
    expect(spokenTemp(20, "imperial")).toBe("68 degrees Fahrenheit");
  });
});

describe("weather codes", () => {
  it("describes known WMO codes and falls back for unknown ones", () => {
    expect(describeWeather(0)).toEqual({ label: "Clear sky", icon: "clear" });
    expect(describeWeather(95).icon).toBe("storm");
    expect(describeWeather(1234).label).toBe("Unknown conditions");
  });
});

describe("formatting", () => {
  it("joins only the parts that exist", () => {
    expect(placeLabel({ name: "Berlin", admin1: "Berlin", country: "Germany" })).toBe(
      "Berlin, Berlin, Germany",
    );
    expect(placeLabel({ name: "Atlantis", admin1: null, country: null })).toBe("Atlantis");
  });

  it("reads an ISO date as a local calendar day, with no timezone shift", () => {
    const d = parseDay("2026-11-01");
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 10, 1]);
    expect(dayLabel("2026-11-01")).toEqual({ weekday: "Sun", date: "1 Nov" });
  });
});
