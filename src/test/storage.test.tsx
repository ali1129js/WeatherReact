import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStoredState } from "../hooks/useStoredState";
import {
  KEYS,
  MAX_RECENT,
  addRecent,
  readStored,
  recentsSchema,
  unitsSchema,
  writeStored,
} from "../lib/storage";
import type { Place } from "../api/schemas";

const place = (id: number): Place => ({
  id,
  name: `City ${id}`,
  latitude: 1,
  longitude: 2,
  country: "X",
  admin1: null,
});

describe("readStored / writeStored", () => {
  it("round-trips a valid value", () => {
    writeStored(KEYS.units, "imperial");
    expect(readStored(KEYS.units, unitsSchema, "metric")).toBe("imperial");
  });

  it("falls back when nothing is stored, the JSON is corrupt, or the shape is wrong", () => {
    expect(readStored(KEYS.units, unitsSchema, "metric")).toBe("metric");
    localStorage.setItem(KEYS.units, "{not json");
    expect(readStored(KEYS.units, unitsSchema, "metric")).toBe("metric");
    localStorage.setItem(KEYS.units, JSON.stringify("kelvin"));
    expect(readStored(KEYS.units, unitsSchema, "metric")).toBe("metric");
    localStorage.setItem(KEYS.recents, JSON.stringify([{ id: "nope" }]));
    expect(readStored(KEYS.recents, recentsSchema, [])).toEqual([]);
  });

  it("does not throw when storage is unavailable", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("full");
    });
    expect(readStored(KEYS.units, unitsSchema, "metric")).toBe("metric");
    expect(() => writeStored(KEYS.units, "imperial")).not.toThrow();
    get.mockRestore();
    set.mockRestore();
  });
});

describe("addRecent", () => {
  it("puts the newest first and moves a repeated place to the front without duplicating it", () => {
    const list = addRecent(addRecent(addRecent([], place(1)), place(2)), place(1));
    expect(list.map((p) => p.id)).toEqual([1, 2]);
  });

  it(`keeps at most ${MAX_RECENT} places, dropping the oldest`, () => {
    let list: Place[] = [];
    for (let i = 1; i <= 7; i++) list = addRecent(list, place(i));
    expect(list.map((p) => p.id)).toEqual([7, 6, 5, 4, 3]);
  });
});

describe("useStoredState", () => {
  it("starts from storage, validates it, and writes updates back", () => {
    writeStored(KEYS.units, "imperial");
    const { result } = renderHook(() => useStoredState(KEYS.units, unitsSchema, "metric"));
    expect(result.current[0]).toBe("imperial");
    act(() => result.current[1]("metric"));
    expect(result.current[0]).toBe("metric");
    expect(localStorage.getItem(KEYS.units)).toBe('"metric"');
  });

  it("ignores invalid stored data and supports functional updates", () => {
    localStorage.setItem(KEYS.recents, "[1,2,3]");
    const { result } = renderHook(() => useStoredState(KEYS.recents, recentsSchema, []));
    expect(result.current[0]).toEqual([]);
    act(() => result.current[1]((list) => addRecent(list, place(9))));
    expect(JSON.parse(localStorage.getItem(KEYS.recents) ?? "[]")).toHaveLength(1);
  });
});
