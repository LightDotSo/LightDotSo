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

import type { AIState, UIState } from "@/ai/types";
import type { MutableAIState, StreamableUI, StreamableValue } from "@/ai/types";
import { Client } from "@langchain/langgraph-sdk";
import { createAI, getAIState } from "ai/rsc";
import type { ReactNode } from "react";
import { submitUserMessage } from "./actions/submitUserMessage";
import { getUIStateFromAIState } from "./utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIAction = (content: string) => Promise<{
  id: string;
  display: ReactNode;
}>;

// biome-ignore lint/style/useNamingConvention: <explanation>
export interface AIActionParams {
  content: string;
  aiState: MutableAIState;
  textStream: StreamableValue<string>;
  messageStream: StreamableUI;
  uiStream: StreamableUI;
}

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIActions = {
  submitUserMessage: AIAction;
};

// ----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const actions: AIActions = {
  submitUserMessage,
};

// -----------------------------------------------------------------------------
// AI
// -----------------------------------------------------------------------------

export const AI = createAI<AIState, UIState>({
  actions: actions,
  // biome-ignore lint/style/useNamingConvention: <explanation>
  initialUIState: [],
  // biome-ignore lint/style/useNamingConvention: <explanation>
  initialAIState: { threadId: null, messages: [] },
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

// -----------------------------------------------------------------------------
// Client
// -----------------------------------------------------------------------------

export const client = new Client({
  apiUrl: process.env.LANGGRAPH_CLOUD_API_URL,
  defaultHeaders: {
    "X-API-KEY": process.env.LANGGRAPH_CLOUD_API_KEY,
  },
});
