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

import { ExternalLink } from "@/components/external-link";

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="font-semibold text-lg">
          Welcome to Next.js AI Chatbot!
        </h1>
        <p className="text-muted-foreground leading-normal">
          This is an open source AI chatbot app template built with{" "}
          <ExternalLink href="https://nextjs.org">Next.js</ExternalLink>, the{" "}
          <ExternalLink href="https://sdk.vercel.ai">
            Vercel AI SDK
          </ExternalLink>
          , and{" "}
          <ExternalLink href="https://vercel.com/storage/kv">
            Vercel KV
          </ExternalLink>
          .
        </p>
        <p className="text-muted-foreground leading-normal">
          It uses{" "}
          <ExternalLink href="https://vercel.com/blog/ai-sdk-3-generative-ui">
            React Server Components
          </ExternalLink>{" "}
          to combine text with generative UI as output of the LLM. The UI state
          is synced through the SDK so the model is aware of your interactions
          as they happen.
        </p>
      </div>
    </div>
  );
}
