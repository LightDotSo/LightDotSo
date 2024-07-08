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

import { baseWidthWrapper } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import type { FC } from "react";
import { FooterCopy } from "./footer-copy";
import { FooterList } from "./footer-list";
import { FooterLogo } from "./footer-logo";
import { FooterModeSelect } from "./footer-mode-select";
import { FooterSocial } from "./footer-social";
import { FooterStatusButton } from "./footer-status-button";
import { FooterVersion } from "./footer-version";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Footer: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <footer
      className={cn("border-t border-border", baseWidthWrapper)}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl space-y-4 py-8 md:space-y-8">
        <div className="flex flex-col justify-start space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center justify-between space-x-3">
            <FooterLogo />
            <FooterStatusButton />
          </div>
          <div className="flex flex-col space-x-0 space-y-4 md:flex-row md:items-center md:space-x-3 md:space-y-0">
            <FooterModeSelect />
            <span className="hidden text-text/60 md:inline-flex">/</span>
            <FooterSocial />
          </div>
        </div>
        <div>
          <FooterList />
        </div>
        <div className="hidden justify-between md:flex">
          <FooterCopy />
          <FooterVersion />
        </div>
      </div>
    </footer>
  );
};
