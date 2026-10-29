// Headless e2e + screenshot check against `vite preview`. Not part of the build; run by hand:
//   npm run build && npx vite preview --port 4173 & node e2e-shots.mjs
// Needs playwright-core and axe-core installed somewhere resolvable (NODE_PATH) and a Chrome binary (CHROME).
import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(
  process.env.NODE_PATH ? `${process.env.NODE_PATH}/x.js` : import.meta.url,
);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const URL_ = process.env.APP_URL ?? "http://localhost:4173/WeatherReact/";
const OUT = process.env.OUT ?? "/workspace/projects/weather-shots";
const CITY = process.env.CITY ?? "Berlin";
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
});
const problems = [];

async function run(theme, viewport, label) {
  const ctx = await browser.newContext({
    viewport,
    reducedMotion: "reduce",
    serviceWorkers: "allow",
  });
  await ctx.addInitScript(
    (t) => localStorage.setItem("weather.v1.theme", JSON.stringify(t)),
    theme,
  );
  const page = await ctx.newPage();
  const external = new Set();
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost"].includes(u.hostname)) external.add(u.hostname);
  });
  page.on("pageerror", (e) => problems.push(`${label}: pageerror ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`${label}: console ${m.text()}`));
  await page.goto(URL_, { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Search for a city" }).fill(CITY);
  await page.getByRole("option").first().waitFor();
  await page.screenshot({
    path: `${OUT}/${label}-search.png`,
    clip: { x: 0, y: 0, width: viewport.width, height: Math.min(viewport.height, 520) },
  });
  await page.getByRole("option").first().click();
  await page.getByRole("region", { name: /Next 5 days/ }).waitFor();
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: true });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  if (overflow > 0) problems.push(`${label}: horizontal overflow ${overflow}px`);
  const dayCount = await page
    .getByRole("region", { name: /Next 5 days/ })
    .getByRole("listitem")
    .count();
  if (dayCount !== 5) problems.push(`${label}: ${dayCount} forecast days`);

  await page.evaluate(axeSource);
  const axe = await page.evaluate(() =>
    axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] }),
  );
  for (const v of axe.violations)
    problems.push(`${label}: axe ${v.id} (${v.impact}) x${v.nodes.length}`);
  console.log(
    label,
    "days:",
    dayCount,
    "overflow:",
    overflow,
    "axe violations:",
    axe.violations.length,
    "external hosts:",
    [...external].join(","),
  );
  return { ctx, page };
}

for (const theme of ["light", "dark", "contrast"]) {
  const { ctx } = await run(theme, { width: 1280, height: 900 }, `${theme}-desktop`);
  await ctx.close();
}
for (const theme of ["light", "dark", "contrast"]) {
  const { ctx } = await run(theme, { width: 390, height: 844 }, `${theme}-phone`);
  await ctx.close();
}

// Offline: after one online visit the service worker serves the page and the last forecast.
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(URL_, { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Search for a city" }).fill(CITY);
  await page.getByRole("option").first().click();
  await page.getByRole("region", { name: /Next 5 days/ }).waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload({ waitUntil: "networkidle" }); // now controlled by the worker, fills the data cache
  await page.getByRole("region", { name: /Next 5 days/ }).waitFor();
  await ctx.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  const ok = await page
    .getByRole("region", { name: /Next 5 days/ })
    .waitFor({ timeout: 8000 })
    .then(
      () => true,
      () => false,
    );
  const banner = await page
    .getByText(/You are offline/)
    .isVisible()
    .catch(() => false);
  console.log("offline reload shows saved forecast:", ok, "banner:", banner);
  if (!ok) problems.push("offline: saved forecast not shown after reload");
  if (!banner) problems.push("offline: banner not shown");
  await page.screenshot({ path: `${OUT}/offline-phone.png`, fullPage: true });
  await ctx.close();
}

await browser.close();
console.log(problems.length ? `PROBLEMS:\n${problems.join("\n")}` : "e2e: no problems");
process.exit(problems.length ? 1 : 0);
