import { defineConfig, devices } from "@playwright/test";

const port = 4325;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  use: { ...devices["Desktop Chrome"], baseURL },
  webServer: {
    command: `vp run preview --host 127.0.0.1 --port ${port} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: false,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
  },
});
