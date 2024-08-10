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
import { handleSubmitUserMessage } from "@/ai/handlers/handleSubmitUserMessage";
import type { UIState } from "@/ai/types";
import {
  createStreamableUI,
  createStreamableValue,
  getMutableAIState,
} from "ai/rsc";

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export async function submitUserMessage(
  content: string,
): Promise<UIState[number]> {
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

  const textStream = createStreamableValue("");
  const messageStream = createStreamableUI(null);
  const uiStream = createStreamableUI();

  handleSubmitUserMessage({
    content,
    aiState,
    textStream,
    messageStream,
    uiStream,
  })
    .then(() => {
      // Close streams
      messageStream.done();
      textStream.done();
      uiStream.done();

      aiState.done(aiState.get());
    })
    .catch((error) => {
      console.error(error);
      messageStream.done();
      textStream.done();
      uiStream.done();
    });

  return {
    id: threadId,
    display: messageStream.value,
  };
}
