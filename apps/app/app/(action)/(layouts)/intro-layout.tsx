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

import { Floating } from "@/app/(action)/(components)/floating";
import { Cta } from "@lightdotso/home/cta";
import { Ecosystem } from "@lightdotso/home/ecosystem";
import { Features } from "@lightdotso/home/features";
import { Introduction } from "@lightdotso/home/introduction";
import { Unified } from "@lightdotso/home/unified";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export const IntroLayout = ({ children }: { children: ReactNode }) => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Floating>{children}</Floating>
      <Introduction />
      <Unified />
      <Features />
      <Ecosystem />
      <Cta />
    </>
  );
};
