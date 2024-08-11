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

import type { EventHandlerFields } from "@/ai/server";
import { BotMessage } from "@/components/stocks/message";
import type { StreamEvent } from "@langchain/core/tracers/log_stream";
import { createStreamableValue } from "ai/rsc";

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

export const botMessageHandler = (
  streamEvent: StreamEvent,
  fields: EventHandlerFields,
) => {
  console.info("streamEvent", streamEvent);

  // Handle the event
  const chunk = streamEvent.data.chunk;
  const ui = fields.ui;
  const callbacks = fields.callbacks;

  if (streamEvent.event === "on_chain_stream") {
    if (
      "event" in chunk &&
      typeof chunk.event === "string" &&
      chunk.event === "on_chat_model_stream"
    ) {
      const chunkText = chunk.data.chunk.content;
      // console.info("chunkText", chunkText);

      if (!callbacks[streamEvent.run_id]) {
        // the createStreamableValue / useStreamableValue is preferred
        // as the stream events are updated immediately in the UI
        // rather than being batched by React via createStreamableUI
        const textStream = createStreamableValue();
        ui.append(<BotMessage content={textStream.value} />);
        callbacks[streamEvent.run_id] = textStream;
      }

      if (callbacks[streamEvent.run_id]) {
        callbacks[streamEvent.run_id].update(chunkText);
      }
    }
  }
};
