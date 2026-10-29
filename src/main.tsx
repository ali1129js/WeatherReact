import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { createQueryClient } from "./lib/queryClient";
import { KEYS, readStored, themeSchema } from "./lib/storage";
import { registerServiceWorker } from "./registerServiceWorker";
import { applyTheme, preferredTheme } from "./theme/themes";
import "./index.css";

applyTheme(readStored(KEYS.theme, themeSchema, preferredTheme()));

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={createQueryClient()}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

window.addEventListener("load", () => void registerServiceWorker());
