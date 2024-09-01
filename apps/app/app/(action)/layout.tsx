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

import { HStackFull } from "@lightdotso/ui/stacks";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootLayoutProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export default function RootLayout({ children }: RootLayoutProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <HStackFull>
      {/* <BaseLayerWrapper size="xxs"> */}
      {/* <MinimalPageWrapper className="p-2" isScreen> */}
      {/* <LinkButtonGroup items={ACTION_NAV_ITEMS} /> */}
      {/* <div className="flex w-full justify-center">{children}</div> */}
      {children}
      {/* </MinimalPageWrapper> */}
      {/* </BaseLayerWrapper> */}
    </HStackFull>
  );
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

export const experimental_ppr = true;
export const revalidate = 300;
