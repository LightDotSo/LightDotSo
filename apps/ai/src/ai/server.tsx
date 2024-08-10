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
import { BotMessage } from "@/components/stocks";
import type { Runnable } from "@langchain/core/runnables";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import type { CompiledStateGraph } from "@langchain/langgraph";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { isValidElement } from "react";

const STREAM_UI_RUN_NAME = "stream_runnable_ui";
export const LAMBDA_STREAM_WRAPPER_NAME = "lambda_stream_wrapper";

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

// biome-ignore lint/style/useNamingConvention: <explanation>
export function streamRunnableUI<RunInput, RunOutput>(
  runnable:
    | Runnable<RunInput, RunOutput>
    | CompiledStateGraph<RunInput, Partial<RunInput>>,
  inputs: RunInput,
) {
  const ui = createStreamableUI();
  const [lastEvent, resolve] = withResolvers<string>();

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
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
      console.info("streamEvent", streamEvent);

      // if (streamEvent.event === "on_chain_stream") {
      //   console.info("Chunk", streamEvent.data.chunk);
      //   const content = streamEvent.data.chunk;
      //   ui.update(JSON.stringify(content));
      // }

      if (
        streamEvent.name === STREAM_UI_RUN_NAME &&
        streamEvent.event === "on_chain_end"
      ) {
        if (isValidElement(streamEvent.data.output.value)) {
          ui.append(streamEvent.data.output.value);
        }
      }

      const [kind, type] = streamEvent.event.split("_").slice(1);
      if (type === "stream" && kind !== "chain") {
        const chunk = streamEvent.data.chunk;
        if ("text" in chunk && typeof chunk.text === "string") {
          if (!callbacks[streamEvent.run_id]) {
            // the createStreamableValue / useStreamableValue is preferred
            // as the stream events are updated immediately in the UI
            // rather than being batched by React via createStreamableUI
            const textStream = createStreamableValue();
            ui.append(<BotMessage content={textStream.value} />);
            callbacks[streamEvent.run_id] = textStream;
          }

          callbacks[streamEvent.run_id].append(chunk.text);
        }
      }

      lastEventValue = streamEvent;
    }

    // resolve the promise, which will be sent
    // to the client thanks to RSC
    resolve(lastEventValue?.data.output);

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.values(callbacks).forEach((cb) => cb.done());
    ui.done();
  })();

  return { ui: ui.value, lastEvent };
}
