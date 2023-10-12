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

import { inngest } from "./client";

inngest.createFunction(
  { id: "Customer Onboarding" },
  { event: "test/user.signed.up" },
  async ({ step }) => {
    await step.run("Send welcome email", async () => {
      // Send welcome email
    });

    await step.sleep({ id: "Hello World" }, "2s"); // Replace with 2 days in production

    await step.run("Send “New in Stock” email", async () => {
      // Send “New in Stock” email
    });

    const emailOpenedEvent = await step.waitForEvent("app/email.opened", {
      event: "app/email.opened",
      timeout: "3s", // Replace with 3 days in production
      if:
        "event.data.userId == async.data.userId &&" +
        "async.event.data.template.name == 'New in Stock'",
    });

    if (!emailOpenedEvent) {
      await step.run("Send “10% Discount” email", async () => {
        // Send “10% Discount” email
      });
    }
  },
);
