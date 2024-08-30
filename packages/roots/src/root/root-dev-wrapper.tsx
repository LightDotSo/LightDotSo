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

import dynamic from "next/dynamic";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const FormDevTools = dynamic(
  () =>
    import("@lightdotso/forms/form-dev-tools").then((d) => ({
      default: d.FormDevTools,
    })),
  {
    ssr: false,
  },
);

const TailwindIndicator = dynamic(
  () =>
    import("@lightdotso/ui/dev").then((d) => ({
      default: d.TailwindIndicator,
    })),
  {
    ssr: false,
  },
);

const VercelToolbar = dynamic(
  () =>
    import("@lightdotso/ui/dev").then((d) => ({
      default: d.VercelToolbar,
    })),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootDevWrapper: FC = () => {
  return (
    <>
      <FormDevTools />
      <TailwindIndicator />
      <VercelToolbar />
    </>
  );
};
