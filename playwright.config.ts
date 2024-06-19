/* eslint-disable turbo/no-undeclared-env-vars */

import type PlaywrightTestConfig from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
console.warn(`Using base URL "${baseUrl}"`);

const webServer: PlaywrightTestConfig["webServer"] = [
  {
    command: "pnpm turbo run dev --filter @lightdotso/app",
    port: 3001,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
  },
];

const opts = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
};

const config: PlaywrightTestConfig = {
  retries: process.env.CI ? 3 : 0,
  timeout: 300_000,
  projects: [
    {
      name: "@lightdotso/app",
      testDir: "./apps/app/e2e",
      testMatch: /.*\.spec\.tsx?/,
    },
  ],
  use: {
    baseURL: baseUrl,
    headless: opts.headless,
  },
  webServer: webServer,
};

export default config;
