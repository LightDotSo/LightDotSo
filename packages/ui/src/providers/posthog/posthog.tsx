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

"use client";

import posthog from "posthog-js";
import { PostHogProvider as PostHogReactProvider } from "posthog-js/react";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Init
// -----------------------------------------------------------------------------

if (typeof window !== "undefined") {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "https://light.so/ingest",
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function PostHogProvider({ children }: { children: ReactNode }) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>
  );
}
