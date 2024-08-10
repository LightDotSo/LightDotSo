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

import { type AI, client } from "@/ai/client";
import { botMessageHandler } from "@/ai/handlers/botMessage";
import { streamRunnableUI } from "@/ai/server";
import { RunnableLambda } from "@langchain/core/runnables";
import { getMutableAIState } from "ai/rsc";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function submitUserMessage(content: string) {
  "use server";

  // Get the current state of the AI
  const aiState = getMutableAIState<typeof AI>();
  console.info("aiState", aiState.get());

  let threadId = aiState.get().threadId;
  if (threadId) {
    const _threadHistory = await client.threads.getHistory(threadId);

    // aiState.update({
    //   ...aiState.get(),
    //   messages: [
    //     messages,
    //     {
    //       threadId: threadId,
    //       role: "user",
    //       content: content,
    //     },
    //   ],
    // });
  } else {
    threadId = (await client.threads.create()).thread_id;
  }
  console.info("threadId", threadId);

  const assistants = await client.assistants.search({
    metadata: null,
    offset: 0,
    limit: 1,
  });

  // We don't do any persisting, so we can just grab the first assistant
  const agent = assistants[0];
  const assistantId = agent.assistant_id;

  const inputs = {
    messages: {
      role: "user",
      content: content,
    },
  };

  const streamEventsRunnable = RunnableLambda.from(async function* (input: {
    messages: { role: string; content: string };
  }) {
    const streamResponse = client.runs.stream(threadId, assistantId, {
      streamMode: ["events", "messages"],
      input,
    });
    for await (const event of streamResponse) {
      yield event.data;
    }
  });

  return streamRunnableUI(streamEventsRunnable, inputs, {
    eventHandlers: [botMessageHandler],
  });
}
