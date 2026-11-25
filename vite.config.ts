import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    astro: true,
    ignorePatterns: ["dist/**", "pnpm-lock.yaml", "src/content/docs/**"],
  },
  lint: {
    ignorePatterns: ["dist/**"],
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
});
