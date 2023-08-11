// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { expect, test } from "@playwright/test";

test.setTimeout(35e3);

// Initial page.reload is due to dev server having a more aggressive
// cache invalidation strategy.

test("server-cacheLink: refreshing the page should reuse the cached value", async ({
  page,
}) => {
  await page.goto("/rsc");
  await page.reload();

  await page.waitForSelector("text=hello i never hit an api endpoint");
  const nonce1_1 = await page.textContent(
    "text=hello i never hit an api endpoint",
  );
  const nonce1_2 = await page.textContent(
    "text=hello i also never hit an endpoint",
  );
  await page.reload();
  const nonce2_1 = await page.textContent(
    "text=hello i never hit an api endpoint",
  );
  const nonce2_2 = await page.textContent(
    "text=hello i also never hit an endpoint",
  );
  expect(nonce1_1).toBe(nonce2_1);
  expect(nonce1_2).toBe(nonce2_2);
});

test("server-cacheLink: revalidating should load new content", async ({
  page,
}) => {
  await page.goto("/rsc");
  await page.reload();

  await page.waitForSelector("text=hello i never hit an api endpoint");
  const nonce1 = await page.textContent(
    "text=hello i never hit an api endpoint",
  );
  await page.click("text=Revalidate Cache");
  await page.waitForLoadState("networkidle");
  const nonce2 = await page.textContent(
    "text=hello i never hit an api endpoint",
  );
  expect(nonce1).not.toBe(nonce2);
});
