// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as Sentry from "@sentry/node";
import { InngestMiddleware } from "inngest";

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

export const sentryMiddleware = new InngestMiddleware({
  name: "Sentry Middleware",
  init: ({ client }) => {
    // Initialize Sentry as soon as possible, creating a hub
    Sentry.init({ dsn: "..." });

    // Set up some tags that will be applied to all events
    Sentry.setTag("inngest.client.id", client.id);

    return {
      onFunctionRun: ({ ctx, fn }) => {
        // Add specific context for the given function run
        Sentry.setTags({
          "inngest.function.id": fn.id(client.id),
          "inngest.function.name": fn.name,
          "inngest.event": ctx.event.name,
          "inngest.run.id": ctx.runId,
        });

        // Start a transaction for this run
        // const transaction = Sentry.startTransaction({
        //   name: "Inngest Function Run",
        //   op: "run",
        //   data: ctx.event,
        // });

        let memoSpan: Sentry.Span;
        let execSpan: Sentry.Span;

        return {
          transformInput: () => ({
            ctx: {
              // Add the Sentry client to the input arg so our
              // functions can use it directly too
              sentry: Sentry.getCurrentHub(),
            },
          }),
          beforeMemoization: () => {
            // Track different spans for memoization and execution
            // memoSpan = transaction.startChild({ op: "memoization" });
          },
          afterMemoization: () => {
            // memoSpan.finish();
          },
          beforeExecution: () => {
            // execSpan = transaction.startChild({ op: "execution" });
          },
          afterExecution: () => {
            // execSpan.finish();
          },
          transformOutput: ({ result, step }) => {
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
          beforeResponse: async () => {
            // Finish the transaction and flush data to Sentry before the
            // request closes
            // transaction.finish();
            await Sentry.flush();
          },
        };
      },
    };
  },
});
