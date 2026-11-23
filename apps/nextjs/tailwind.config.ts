import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: "media",
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        background: v("paper"),
        foreground: v("ink"),
        card: { DEFAULT: v("surface"), foreground: v("ink") },
        muted: { DEFAULT: v("wash"), foreground: v("muted") },
        border: v("rule"),
        ring: v("cobalt"),
        primary: { DEFAULT: v("cobalt"), foreground: v("on-cobalt") },
        secondary: { DEFAULT: v("wash"), foreground: v("ink") },
        signal: v("signal"),
        bench: v("bench"),
        positive: v("positive"),
        negative: v("negative"),
      },
      fontFamily: {
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
        display: ["var(--font-plex-condensed)", "var(--font-plex)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
