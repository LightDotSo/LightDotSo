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

// From: https://github.com/vercel/next.js/issues/49454
// Wrap `next/dynamic` in `use client` to avoid Next.js server-side rendering

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import dynamic from "next/dynamic";
import Script from "next/script";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Dynamic UI
// -----------------------------------------------------------------------------

const PostHogPageView = dynamic(
  () =>
    import("@lightdotso/ui/providers/posthog").then(
      (mod) => mod.PostHogPageView,
    ),
  {
    ssr: false,
  },
);

const Toaster = dynamic(
  () =>
    import("@lightdotso/ui/components/toast").then((mod) => ({
      default: mod.Toaster,
    })),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootWrapper: FC = () => {
  return (
    <>
      {/* Script */}
      <PostHogPageView />
      <GoogleAnalytics gaId="G-NT6BW06LQC" />
      <GoogleTagManager gtmId="GTM-NF8G7B37" />
      <Script async src="https://data.light.so/p.js" />
      {/* UI */}
      <Toaster />
    </>
  );
};
