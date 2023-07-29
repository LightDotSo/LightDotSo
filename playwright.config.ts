/* eslint-disable turbo/no-undeclared-env-vars */

import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
console.log(`Using base URL "${baseUrl}"`);

const opts = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
};
const config: PlaywrightTestConfig = {
  projects: [
    {
      name: "@lightdotso/app",
      testDir: "./apps/app/e2e",
      testMatch: /.*\.e2e\.tsx?/,
      use: {
        ...devices["Desktop Chrome"],
        navigationTimeout: DEFAULT_NAVIGATION_TIMEOUT,
      },
    },
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: baseUrl,
    headless: opts.headless,
  },
};

export default config;
