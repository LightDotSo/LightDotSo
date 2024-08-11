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

import "server-only";
import type { Runnable } from "@langchain/core/runnables";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import type { CompiledStateGraph } from "@langchain/langgraph";
import { createStreamableUI, type createStreamableValue } from "ai/rsc";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export type RunUICallbacks = Record<
  string,
  ReturnType<typeof createStreamableUI | typeof createStreamableValue>
>;
export type EventHandlerFields = {
  ui: ReturnType<typeof createStreamableUI>;
  callbacks: RunUICallbacks;
};
export type EventHandler =
  | ((event: StreamEvent, fields: EventHandlerFields) => void)
  | ((event: StreamEvent, fields: EventHandlerFields) => Promise<void>);

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/**
 * Polyfill to emulate the upcoming Promise.withResolvers
 */
export function withResolvers<T>() {
  let resolve: (value: T) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let reject: (reason?: any) => void;

  const innerPromise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // @ts-expect-error
  return [innerPromise, resolve, reject] as const;
}

// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export function streamRunnableUI<RunInput, RunOutput>(
  runnable:
    | Runnable<RunInput, RunOutput>
    | CompiledStateGraph<RunInput, Partial<RunInput>>,
  inputs: RunInput,
  options: {
    eventHandlers: EventHandler[];
  },
) {
  const ui = createStreamableUI();
  const [lastEvent, resolve] = withResolvers<string>();
  let shouldRecordLastEvent = true;

  (async () => {
    let lastEventValue: StreamEvent | null = null;

    const callbacks: Record<
      string,
      ReturnType<typeof createStreamableUI | typeof createStreamableValue>
    > = {};

    for await (const streamEvent of (
      runnable as Runnable<RunInput, RunOutput>
    ).streamEvents(inputs, {
      version: "v1",
    })) {
      // Handle the event with the event handlers
      for await (const handler of options.eventHandlers) {
        await handler(streamEvent, {
          ui,
          callbacks,
        });
      }

      if (shouldRecordLastEvent) {
        lastEventValue = streamEvent;
      }

      if (
        streamEvent.data.chunk?.name === "LangGraph" &&
        streamEvent.data.chunk?.event === "on_chain_end"
      ) {
        shouldRecordLastEvent = false;
      }
    }

    // resolve the promise, which will be sent
    // to the client thanks to RSC
    resolve(
      lastEventValue?.data.output || lastEventValue?.data.chunk?.data?.output,
    );

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.values(callbacks).forEach((cb) => cb.done());
    ui.done();
  })();

  return { display: ui.value, lastEvent };
}
