import { defineConfig } from "vitest/config";

export default defineConfig({
  envPrefix: "PUBLIC_",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@assets": "/src/assets",
      "@styles": "/src/styles",
      "@lib": "/src/lib",
      "@hooks": "/src/hooks",
    },
  },
});
