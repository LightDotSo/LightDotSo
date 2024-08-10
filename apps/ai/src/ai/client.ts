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

import type { Message } from "@/types";
import { nanoid } from "@/utils";
import { createAI, getAIState } from "ai/rsc";
import type { ReactNode } from "react";
import { submitUserMessage } from "./actions/submitUserMessage";
import { getUIStateFromAIState } from "./utils";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const actions: AIActions = {
  submitUserMessage,
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIAction = (content: string) => Promise<{
  id: string;
  display: ReactNode;
}>;

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIActions = {
  submitUserMessage: AIAction;
};

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIState = {
  chatId: string;
  messages: Message[];
};

// biome-ignore lint/style/useNamingConvention: <explanation>
export type UIState = {
  id: string;
  display: ReactNode;
}[];

// -----------------------------------------------------------------------------
// AI
// -----------------------------------------------------------------------------

export const AI = createAI<AIState, UIState>({
  actions: actions,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  initialUIState: [],
  // biome-ignore lint/style/useNamingConvention: <explanation>
  initialAIState: { chatId: nanoid(), messages: [] },
  // biome-ignore lint/style/useNamingConvention: <explanation>
  onGetUIState: async () => {
    "use server";

    const aiState = await getAIState<AI>();
    const uiState = getUIStateFromAIState(aiState);
    return uiState;
  },
});

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AI = typeof AI;
