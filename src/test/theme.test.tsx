import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { createQueryClient } from "../lib/queryClient";
import { KEYS, THEME_NAMES } from "../lib/storage";
import { THEMES, THEME_LABELS, applyTheme, contrastRatio, preferredTheme } from "../theme/themes";
import { mockOpenMeteo } from "./fixtures";

const renderApp = () =>
  render(
    <QueryClientProvider client={createQueryClient(false)}>
      <App debounceMs={10} />
    </QueryClientProvider>,
  );

describe("contrast maths", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });
});

describe.each(THEME_NAMES)("%s theme contrast", (name) => {
  const t = THEMES[name];
  const min = name === "contrast" ? 7 : 4.5; // AAA for the high-contrast theme, AA otherwise

  it("keeps body text readable on the page and on cards", () => {
    expect(contrastRatio(t.text, t.bg)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.text, t.surface)).toBeGreaterThanOrEqual(min);
  });

  it("keeps muted text (labels, dates, hints) readable on the page and on cards", () => {
    expect(contrastRatio(t.textMuted, t.bg)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.textMuted, t.surface)).toBeGreaterThanOrEqual(min);
  });

  it("keeps text on accent fills (selected toggle, hovered option, buttons) readable", () => {
    expect(contrastRatio(t.onAccent, t.accent)).toBeGreaterThanOrEqual(min);
  });

  it("keeps accent-coloured icons and the error text readable on cards", () => {
    expect(contrastRatio(t.accent, t.surface)).toBeGreaterThanOrEqual(3); // WCAG 1.4.11 graphics
    expect(contrastRatio(t.danger, t.surface)).toBeGreaterThanOrEqual(min);
    expect(contrastRatio(t.danger, t.bg)).toBeGreaterThanOrEqual(min);
  });

  it("keeps control borders and the focus ring visible against the page and cards (3:1)", () => {
    for (const c of [t.border, t.focus]) {
      expect(contrastRatio(c, t.bg)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(c, t.surface)).toBeGreaterThanOrEqual(3);
    }
  });

  it("applies every token as a CSS variable and sets the root attribute", () => {
    const root = document.createElement("div");
    applyTheme(name, root);
    expect(root.dataset.theme).toBe(name);
    expect(root.style.getPropertyValue("--text")).toBe(t.text);
    expect(root.style.getPropertyValue("--on-accent")).toBe(t.onAccent);
    expect(root.style.getPropertyValue("--text-muted")).toBe(t.textMuted);
  });
});

describe("theme choice", () => {
  const media = (set: string[]) => (q: string) => ({ matches: set.includes(q) });

  it("follows the operating system on a first visit: more contrast, then dark, else light", () => {
    expect(preferredTheme(media([]))).toBe("light");
    expect(preferredTheme(media(["(prefers-color-scheme: dark)"]))).toBe("dark");
    expect(
      preferredTheme(media(["(prefers-color-scheme: dark)", "(prefers-contrast: more)"])),
    ).toBe("contrast");
  });

  it("switches theme from the switcher, applies it to the page and remembers it", async () => {
    mockOpenMeteo();
    const user = userEvent.setup();
    const { unmount } = renderApp();
    expect(document.documentElement.dataset.theme).toBe("light");
    for (const name of THEME_NAMES) {
      await user.click(screen.getByRole("button", { name: THEME_LABELS[name] }));
      expect(document.documentElement.dataset.theme).toBe(name);
      expect(screen.getByRole("button", { name: THEME_LABELS[name] })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    expect(localStorage.getItem(KEYS.theme)).toBe('"contrast"');
    unmount();
    renderApp();
    expect(document.documentElement.dataset.theme).toBe("contrast");
  });

  it("ignores an invalid stored theme", () => {
    mockOpenMeteo();
    localStorage.setItem(KEYS.theme, '"neon"');
    renderApp();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
