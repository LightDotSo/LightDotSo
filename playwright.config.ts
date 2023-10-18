/* eslint-disable turbo/no-undeclared-env-vars */

import type PlaywrightTestConfig from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
console.warn(`Using base URL "${baseUrl}"`);

// From: https://github.com/calcom/cal.com/blob/50d2dad62c5cc93b9ccfad6b9b0836062fd5f465/playwright.config.ts#L26
const IS_AUTH_TEST = process.argv.some(a =>
  a.startsWith("--project=@lightdotso/auth"),
);

const IS_PLAYGROUND_TEST = process.argv.some(a =>
  a.startsWith("--project=@lightdotso/playground"),
);

const webServer: PlaywrightTestConfig["webServer"] = [
  {
    command: "pnpm turbo run dev --filter @lightdotso/app",
    port: 3001,
    timeout: 100_000,
    reuseExistingServer: !process.env.CI,
  },
];

if (IS_AUTH_TEST) {
  webServer.push({
    command: "pnpm turbo run dev --filter @lightdotso/auth",
    port: 3000,
    timeout: 100_000,
    reuseExistingServer: !process.env.CI,
  });
}

if (IS_PLAYGROUND_TEST) {
  webServer.push({
    command: "pnpm turbo run dev --filter @lightdotso/playground",
    port: 3004,
    timeout: 100_000,
    reuseExistingServer: !process.env.CI,
  });
}

const opts = {
  headless: !!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS,
};
const config: PlaywrightTestConfig = {
  retries: process.env.CI ? 3 : 0,
  projects: [
    {
      name: "@lightdotso/auth",
      testDir: "./apps/auth/e2e",
      testMatch: /.*\.spec\.tsx?/,
    },
    {
      name: "@lightdotso/app",
      testDir: "./apps/app/e2e",
      testMatch: /.*\.spec\.tsx?/,
    },
    {
      name: "@lightdotso/playground",
      testDir: "./apps/playground/e2e",
      testMatch: /.*\.spec\.tsx?/,
    },
  ],
  use: {
    baseURL: baseUrl,
    headless: opts.headless,
  },
  webServer,
};

export default config;
