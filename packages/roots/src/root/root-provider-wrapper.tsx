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

import dynamic from "next/dynamic";
import type { FC, ReactNode } from "react";

// From: https://github.com/supabase-community/postgres-new/blob/f0d0187e0fcbd96252a1a4b863ef6bbdace67ca3/apps/postgres-new/components/layout.tsx#L13
// License: MIT

const loadFramerFeatures = () =>
  import("./root-framer-features").then((res) => res.default);

// -----------------------------------------------------------------------------
// Dynamic Imports
// -----------------------------------------------------------------------------

const LazyMotion = dynamic(
  () => import("framer-motion").then((res) => res.LazyMotion),
  {
    ssr: false,
  },
);

const TooltipProvider = dynamic(
  () =>
    import("@lightdotso/ui/components/tooltip").then(
      (res) => res.TooltipProvider,
    ),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootProviderWrapperProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootProviderWrapper: FC<RootProviderWrapperProps> = ({
  children,
}) => {
  return (
    <LazyMotion features={loadFramerFeatures}>
      <TooltipProvider>{children}</TooltipProvider>
    </LazyMotion>
  );
};
