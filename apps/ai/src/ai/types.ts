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

import type { CoreMessage } from "ai";
import type { createStreamableUI, createStreamableValue } from "ai/rsc";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type Message = CoreMessage & {
  threadId: string;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  path: string;
  messages: Message[];
  sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string;
    }
>;

// biome-ignore lint/style/useNamingConvention: <explanation>
export type AIState = {
  threadId: string | null;
  messages: Message[];
};

export type ValueOrUpdater<T> = T | ((current: T) => T);

// biome-ignore lint/style/useNamingConvention: <explanation>
export type _MutableAIState<AIState> = {
  get: () => AIState;
  update: (newState: ValueOrUpdater<AIState>) => void;
  done: ((newState: AIState) => void) | (() => void);
};

// biome-ignore lint/style/useNamingConvention: <explanation>
export type MutableAIState = _MutableAIState<AIState>;

// biome-ignore lint/style/useNamingConvention: <explanation>
export type UIState = {
  id: string;
  display: ReactNode;
}[];

// biome-ignore lint/style/useNamingConvention: <explanation>
export type StreamableUI = ReturnType<typeof createStreamableUI>;
export type StreamableValue<T> = ReturnType<typeof createStreamableValue<T>>;
