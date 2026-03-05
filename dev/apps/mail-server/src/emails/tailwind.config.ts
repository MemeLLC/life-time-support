import { pixelBasedPreset, type TailwindConfig } from "@react-email/components";

export default {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        neutral: {
          100: "#ffffff",
          700: "#4a4949",
          900: "#000000",
        },
        primary: {
          100: "#fff8f0",
          300: "#ffdeba",
          500: "#ff8900",
        },
        secondary: {
          100: "#c8def3",
          300: "#7bb0e0",
          500: "#093f86",
        },
      },
    },
  },
} satisfies TailwindConfig;
