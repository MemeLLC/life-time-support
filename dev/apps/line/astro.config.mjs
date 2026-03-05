// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    // @ts-expect-error - @tailwindcss/vite uses vite 7 types, Astro bundles vite 6
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: ["../.."],
      },
    },
  },

  integrations: [react()],
});
