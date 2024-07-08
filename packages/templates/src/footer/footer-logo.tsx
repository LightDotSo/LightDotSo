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

import { LightHorizontalLogo } from "@lightdotso/svg";
import type { FC } from "react";
import Link from "next/link";
import { FooterCopy } from "./footer-copy";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FooterLogo: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex shrink-0 items-center space-x-1">
      <Link
        href="/"
        className="p-2 hover:rounded-md hover:bg-background-stronger"
      >
        <LightHorizontalLogo className="block h-8" />
      </Link>
      <span className="md:hidden">
        <FooterCopy />
      </span>
    </div>
  );
};
