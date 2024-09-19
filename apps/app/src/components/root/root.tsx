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

import { AppBanner } from "@/components/app-banner";
import { Nav } from "@/components/nav/nav";
import { LightRoot } from "@lightdotso/roots/light";
import { Footer } from "@lightdotso/templates/footer";
import type { FC, ReactNode } from "react";
import { RootWrapper } from "./root-wrapper";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface RootProps {
  children: ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Root: FC<RootProps> = ({ children }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <LightRoot>
      {/* Layout */}
      <Nav topNavChildren={<AppBanner />}>{children}</Nav>
      <Footer />
      {/* UI */}
      <RootWrapper />
    </LightRoot>
  );
};
