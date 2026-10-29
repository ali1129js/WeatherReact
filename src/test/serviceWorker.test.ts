import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "../registerServiceWorker";

describe("registerServiceWorker", () => {
  const register = vi.fn(() => Promise.resolve({} as ServiceWorkerRegistration));
  const nav = { serviceWorker: { register } } as unknown as Pick<Navigator, "serviceWorker">;

  it("does nothing in development or without browser support", async () => {
    expect(
      await registerServiceWorker({ PROD: false, BASE_URL: "/WeatherReact/" }, nav),
    ).toBeNull();
    expect(await registerServiceWorker({ PROD: true, BASE_URL: "/WeatherReact/" }, {})).toBeNull();
    expect(register).not.toHaveBeenCalled();
  });

  it("registers sw.js under the app base path in production", async () => {
    await registerServiceWorker({ PROD: true, BASE_URL: "/WeatherReact/" }, nav);
    expect(register).toHaveBeenCalledWith("/WeatherReact/sw.js", { scope: "/WeatherReact/" });
  });

  it("swallows a failed registration", async () => {
    const failing = {
      serviceWorker: { register: () => Promise.reject(new Error("no")) },
    } as unknown as Pick<Navigator, "serviceWorker">;
    expect(await registerServiceWorker({ PROD: true, BASE_URL: "/" }, failing)).toBeNull();
  });
});

/** Runs public/sw.js against small in-memory stand-ins for the worker globals. */
function loadWorker(fetchImpl: (req: Request) => Promise<Response>) {
  const store = new Map<string, Map<string, Response>>();
  const listeners = new Map<string, (e: unknown) => void>();
  const keyOf = (r: Request | string) => (typeof r === "string" ? r : r.url);
  const caches = {
    open: async (name: string) => {
      const c = store.get(name) ?? new Map<string, Response>();
      store.set(name, c);
      return {
        addAll: async (urls: string[]) =>
          urls.forEach((u) => c.set(new URL(u, "https://x.test").href, new Response("shell"))),
        put: async (r: Request, res: Response) => void c.set(keyOf(r), res),
        match: async (r: Request | string) =>
          c.get(new URL(keyOf(r), "https://x.test").href)?.clone(),
        keys: async () => [...c.keys()].map((u) => new Request(u)),
        delete: async (r: Request) => c.delete(keyOf(r)),
      };
    },
    keys: async () => [...store.keys()],
    delete: async (n: string) => store.delete(n),
  };
  const self = {
    location: new URL("https://x.test/WeatherReact/sw.js"),
    addEventListener: (t: string, fn: (e: unknown) => void) => void listeners.set(t, fn),
    skipWaiting: async () => undefined,
    clients: { claim: async () => undefined },
  };
  runInNewContext(readFileSync(resolve(import.meta.dirname, "../../public/sw.js"), "utf8"), {
    self,
    caches,
    URL,
    Promise,
    Math,
    fetch: fetchImpl,
  });
  const dispatch = async (url: string, mode = "cors", method = "GET") => {
    const req = { url, method, mode } as Request;
    let result: Promise<Response> | undefined;
    listeners.get("fetch")?.({ request: req, respondWith: (p: Promise<Response>) => (result = p) });
    return result;
  };
  return { listeners, store, dispatch };
}

describe("public/sw.js", () => {
  it("precaches the shell on install", async () => {
    const w = loadWorker(() => Promise.reject(new Error("offline")));
    let done: Promise<unknown> | undefined;
    w.listeners.get("install")?.({ waitUntil: (p: Promise<unknown>) => (done = p) });
    await done;
    expect([...(w.store.get("weather-shell-v1")?.keys() ?? [])]).toEqual([
      "https://x.test/WeatherReact/",
      "https://x.test/WeatherReact/icon.svg",
    ]);
  });

  it("serves the last good forecast when the network fails, and the shell for navigations", async () => {
    let online = true;
    const w = loadWorker(async (req) => {
      if (!online) throw new TypeError("Failed to fetch");
      return new Response(req.url.includes("open-meteo") ? "forecast-data" : "page", {
        status: 200,
      });
    });
    const api = "https://api.open-meteo.com/v1/forecast?latitude=1&longitude=2";
    const page = "https://x.test/WeatherReact/";
    expect(await (await w.dispatch(api))?.text()).toBe("forecast-data");
    expect(await (await w.dispatch(page, "navigate"))?.text()).toBe("page");

    online = false;
    expect(await (await w.dispatch(api))?.text()).toBe("forecast-data");
    expect(
      await (await w.dispatch("https://x.test/WeatherReact/some/deep/link", "navigate"))?.text(),
    ).toBe("page");
    await expect(
      w.dispatch("https://api.open-meteo.com/v1/forecast?latitude=9&longitude=9"),
    ).rejects.toThrow("Failed to fetch");
  });

  it("leaves other origins and non-GET requests alone", async () => {
    const w = loadWorker(async () => new Response("x"));
    expect(await w.dispatch("https://example.com/a.js")).toBeUndefined();
    expect(await w.dispatch("https://x.test/other-app/a.js")).toBeUndefined();
    expect(
      await w.dispatch("https://api.open-meteo.com/v1/forecast", "cors", "POST"),
    ).toBeUndefined();
  });
});
