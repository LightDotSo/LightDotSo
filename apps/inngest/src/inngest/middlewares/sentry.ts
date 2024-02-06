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

import * as Sentry from "@sentry/node";
import { InngestMiddleware } from "inngest";

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

export const sentryMiddleware = new InngestMiddleware({
  name: "Sentry Middleware",
  init({ client }) {
    // Initialize Sentry as soon as possible, creating a hub
    Sentry.init({ dsn: "..." });

    // Set up some tags that will be applied to all events
    Sentry.setTag("inngest.client.id", client.id);

    return {
      onFunctionRun({ ctx, fn }) {
        // Add specific context for the given function run
        Sentry.setTags({
          "inngest.function.id": fn.id(client.id),
          "inngest.function.name": fn.name,
          "inngest.event": ctx.event.name,
          "inngest.run.id": ctx.runId,
        });

        // Start a transaction for this run
        const transaction = Sentry.startTransaction({
          name: "Inngest Function Run",
          op: "run",
          data: ctx.event,
        });

        let memoSpan: Sentry.Span;
        let execSpan: Sentry.Span;

        return {
          transformInput() {
            return {
              ctx: {
                // Add the Sentry client to the input arg so our
                // functions can use it directly too
                sentry: Sentry.getCurrentHub(),
              },
            };
          },
          beforeMemoization() {
            // Track different spans for memoization and execution
            memoSpan = transaction.startChild({ op: "memoization" });
          },
          afterMemoization() {
            memoSpan.finish();
          },
          beforeExecution() {
            execSpan = transaction.startChild({ op: "execution" });
          },
          afterExecution() {
            execSpan.finish();
          },
          transformOutput({ result, step }) {
            // Capture step output and log errors
            if (step) {
              Sentry.setTags({
                "inngest.step.name": step.displayName,
                "inngest.step.op": step.op,
              });

              if (result.error) {
                Sentry.captureException(result.error);
              }
            }
          },
          async beforeResponse() {
            // Finish the transaction and flush data to Sentry before the
            // request closes
            transaction.finish();
            await Sentry.flush();
          },
        };
      },
    };
  },
});
