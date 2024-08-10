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

// Copyright 2023-2024 Vercel, Inc.
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
import { type AIActionParams, client } from "@/ai/client";
import { BotMessage } from "@/components/stocks";
import type { AIMessageFields } from "@langchain/core/messages";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SubmitUserMessageProps = AIActionParams;

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function handleSubmitUserMessage({
  content,
  aiState,
  messageStream,
  textStream,
}: SubmitUserMessageProps) {
  const assistants = await client.assistants.search({
    metadata: null,
    offset: 0,
    limit: 1,
  });

  // We don't do any persisting, so we can just grab the first assistant
  const agent = assistants[0];
  const assistantId = agent.assistant_id;

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const threadId = aiState.get().threadId!;

  console.info("content", content);
  const inputs = {
    messages: {
      role: "user",
      content: content,
    },
  };

  for await (const event of client.runs.stream(threadId, assistantId, {
    input: inputs,
    streamMode: ["debug", "messages"],
  })) {
    console.info("event", event);

    let started = false;

    if (event.event === "messages/partial") {
      if (!started) {
        started = true;
        messageStream.update(<BotMessage content={textStream.value} />);
      }

      const chunk = event.data[0];
      const msg = chunk as AIMessageFields;
      console.info("msg", msg);
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        console.info(msg.tool_calls);
      } else if (typeof msg.content === "string") {
        textStream.update(msg.content);
        messageStream.update(<BotMessage content={textStream.value} />);
      }
    }
  }
}
