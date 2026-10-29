import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { createQueryClient } from "../lib/queryClient";
import { KEYS } from "../lib/storage";
import { berlinRaw, forecastBody, geocodingBody, json, mockOpenMeteo } from "./fixtures";

function renderApp() {
  const client = createQueryClient(false);
  const ui = (
    <QueryClientProvider client={client}>
      <App debounceMs={60} />
    </QueryClientProvider>
  );
  const view = render(ui);
  return {
    ...view,
    remount: () => {
      view.unmount();
      return render(
        <QueryClientProvider client={createQueryClient(false)}>
          <App debounceMs={60} />
        </QueryClientProvider>,
      );
    },
  };
}

const searchBox = () => screen.getByRole("combobox", { name: "Search for a city" });
const geocodingCalls = (fetchMock: ReturnType<typeof mockOpenMeteo>) =>
  fetchMock.mock.calls.filter(([u]) => String(u).includes("geocoding-api"));

async function searchAndPick(
  user: ReturnType<typeof userEvent.setup>,
  text: string,
  option: RegExp,
) {
  await user.type(searchBox(), text);
  await user.click(await screen.findByRole("option", { name: option }));
}

afterEach(() => vi.unstubAllGlobals());

describe("search flow", () => {
  it("searches, lists matches, and shows current weather plus five days for the picked city", async () => {
    const fetchMock = mockOpenMeteo();
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByText("Search for a city to see its weather.")).toBeInTheDocument();
    await searchAndPick(user, "Berlin", /Berlin, Berlin, Germany/);

    expect(
      await screen.findByRole("heading", { level: 2, name: "Berlin, Berlin, Germany" }),
    ).toBeInTheDocument();
    const current = screen.getByRole("region", { name: "Berlin, Berlin, Germany" });
    expect(within(current).getByText("Overcast")).toBeInTheDocument();
    expect(within(current).getByText("12 degrees Celsius")).toBeInTheDocument();
    expect(within(current).getByText("71%")).toBeInTheDocument();
    expect(within(current).getByText("16 km/h")).toBeInTheDocument();

    const days = within(screen.getByRole("region", { name: "Next 5 days" })).getAllByRole(
      "listitem",
    );
    expect(days).toHaveLength(5);
    expect(within(days[0]!).getByText("Fri")).toBeInTheDocument(); // 30 Oct 2026 is a Friday
    expect(within(days[0]!).getByText("Light rain")).toBeInTheDocument();
    expect(within(days[0]!).getByText("80% rain")).toBeInTheDocument();
    expect(within(days[4]!).getByText("Thunderstorm")).toBeInTheDocument();

    const forecastCall = fetchMock.mock.calls
      .map(([u]) => new URL(String(u)))
      .find((u) => u.hostname === "api.open-meteo.com");
    expect(forecastCall?.searchParams.get("latitude")).toBe(String(berlinRaw.latitude));
    expect(searchBox()).toHaveValue("");
  });

  it("debounces typing into one request and does not search below two letters", async () => {
    const fetchMock = mockOpenMeteo();
    const user = userEvent.setup();
    renderApp();

    await user.type(searchBox(), "B");
    expect(screen.getByText("Type at least 2 letters.")).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 120));
    expect(geocodingCalls(fetchMock)).toHaveLength(0);

    await user.type(searchBox(), "erlin");
    await screen.findByRole("option", { name: /Berlin, Berlin, Germany/ });
    expect(geocodingCalls(fetchMock)).toHaveLength(1);
    expect(new URL(String(geocodingCalls(fetchMock)[0]![0])).searchParams.get("name")).toBe(
      "Berlin",
    );
  });

  it("aborts the earlier request when the search text changes", async () => {
    const signals: AbortSignal[] = [];
    mockOpenMeteo({
      geocoding: (url, init) => {
        if (init?.signal) signals.push(init.signal);
        if (url.searchParams.get("name") === "Ber") {
          return new Promise<Response>(() => undefined) as unknown as Response; // never answers
        }
        return json(geocodingBody());
      },
    });
    const user = userEvent.setup();
    renderApp();

    await user.type(searchBox(), "Ber");
    await waitFor(() => expect(signals).toHaveLength(1));
    expect(signals[0]!.aborted).toBe(false);
    await user.type(searchBox(), "lin");
    await waitFor(() => expect(signals[0]!.aborted).toBe(true));
    expect(
      await screen.findByRole("option", { name: /Berlin, Berlin, Germany/ }),
    ).toBeInTheDocument();
  });

  it("says so when nothing matches", async () => {
    mockOpenMeteo({ geocoding: () => json({ generationtime_ms: 0.2 }) });
    const user = userEvent.setup();
    renderApp();
    await user.type(searchBox(), "Zzzzqx");
    expect(await screen.findByText("No cities found.")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("works from the keyboard: arrow keys move, Enter picks", async () => {
    mockOpenMeteo();
    const user = userEvent.setup();
    renderApp();
    await user.type(searchBox(), "Ber");
    await screen.findByRole("option", { name: /Bern, Bern, Switzerland/ });
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("option", { name: /Bern, Bern, Switzerland/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(searchBox()).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: /Bern/ }).id,
    );
    await user.keyboard("{Enter}");
    expect(
      await screen.findByRole("heading", { level: 2, name: "Bern, Bern, Switzerland" }),
    ).toBeInTheDocument();
  });

  it("reports a failed search and a failed forecast, and can retry the forecast", async () => {
    let forecastOk = false;
    mockOpenMeteo({
      forecast: () => (forecastOk ? json(forecastBody()) : json({}, 503)),
    });
    const user = userEvent.setup();
    renderApp();
    await searchAndPick(user, "Berlin", /Berlin/);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The forecast for Berlin could not be loaded.",
    );
    forecastOk = true;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Overcast")).toBeInTheDocument();
  });

  it("shows an alert when the search request fails", async () => {
    mockOpenMeteo({ geocoding: () => json({}, 500) });
    const user = userEvent.setup();
    renderApp();
    await user.type(searchBox(), "Berlin");
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not search for cities");
  });

  it("treats an unexpected forecast shape as an error instead of crashing", async () => {
    mockOpenMeteo({ forecast: () => json({ hello: "world" }) });
    const user = userEvent.setup();
    renderApp();
    await searchAndPick(user, "Berlin", /Berlin/);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});

describe("units and recent cities", () => {
  it("switches °C/°F without a new request, and remembers units and recent cities across reloads", async () => {
    const fetchMock = mockOpenMeteo();
    const user = userEvent.setup();
    const { remount } = renderApp();
    await searchAndPick(user, "Berlin", /Berlin, Berlin, Germany/);
    await screen.findByText("Overcast");
    const forecastRequests = () =>
      fetchMock.mock.calls.filter(([u]) => String(u).startsWith("https://api.open-meteo.com"))
        .length;
    expect(forecastRequests()).toBe(1);

    await user.click(screen.getByRole("button", { name: "Fahrenheit" }));
    expect(screen.getByRole("button", { name: "Fahrenheit" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("54 degrees Fahrenheit")).toBeInTheDocument();
    expect(screen.getByText("10 mph")).toBeInTheDocument();
    expect(forecastRequests()).toBe(1);
    expect(localStorage.getItem(KEYS.units)).toBe('"imperial"');
    expect(JSON.parse(localStorage.getItem(KEYS.recents) ?? "[]")).toHaveLength(1);

    remount();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Berlin, Berlin, Germany" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("54 degrees Fahrenheit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Berlin, Berlin, Germany" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the five newest cities, newest first, and switching to a recent city loads it", async () => {
    mockOpenMeteo({
      geocoding: (url) => {
        const name = url.searchParams.get("name") ?? "";
        const id = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
        return json(geocodingBody([{ ...berlinRaw, id, name, country: "Testland" }]));
      },
    });
    const user = userEvent.setup();
    renderApp();
    const names = ["Aa", "Bb", "Cc", "Dd", "Ee", "Ff"];
    for (const n of names) await searchAndPick(user, n, new RegExp(`^${n},`));
    const recents = within(
      await screen.findByRole("region", { name: "Recent cities" }),
    ).getAllByRole("button");
    expect(recents.map((b) => b.getAttribute("aria-label"))).toEqual(
      ["Ff", "Ee", "Dd", "Cc", "Bb"].map((n) => `${n}, Berlin, Testland`),
    );
    await user.click(recents[4]!);
    expect(
      await screen.findByRole("heading", { level: 2, name: "Bb, Berlin, Testland" }),
    ).toBeInTheDocument();
  });

  it("ignores corrupt stored data and starts empty", () => {
    mockOpenMeteo();
    localStorage.setItem(KEYS.recents, "{broken");
    localStorage.setItem(KEYS.units, '"kelvin"');
    renderApp();
    expect(screen.getByText("Search for a city to see its weather.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Celsius" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("offline", () => {
  it("shows a status banner while offline", async () => {
    mockOpenMeteo();
    renderApp();
    expect(screen.queryByText(/You are offline/)).not.toBeInTheDocument();
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(await screen.findByText(/You are offline/)).toBeInTheDocument();
  });
});
