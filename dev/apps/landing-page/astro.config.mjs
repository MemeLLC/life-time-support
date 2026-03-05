// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import fontOptimizer from "./src/integrations/font-optimizer.ts";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    fontOptimizer({
      family: "Noto Sans JP",
      weights: [400, 700],
      display: "swap",
      cssVariable: "--font-noto-sans-jp",
      fallbacks: ["sans-serif"],
    }),
  ],

  vite: {
    // @ts-expect-error - @tailwindcss/vite uses vite 7 types, Astro bundles vite 6
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ["../.."],
      },
    },
  },
});
