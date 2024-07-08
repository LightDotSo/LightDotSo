// Copyright 2023-2024 Light, Inc.
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

import { Tab } from "@lightdotso/types";
import { BaseLayerWrapper } from "@lightdotso/ui";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { NavLocation } from "./nav-location";
import { NavLogo } from "./nav-logo";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NavProps = HTMLAttributes<HTMLElement> & {
  tabs: Tab[];
  children: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Nav: FC<NavProps> = ({ children, tabs }) => {
  return (
    <main>
      <div className="flex flex-col">
        <div className="overflow-y-visible border-b border-b-border py-2">
          <div className="flex h-16 items-center">
            <BaseLayerWrapper>
              <div className="flex items-center justify-between">
                <NavLogo />
                <NavLocation tabs={tabs} />
              </div>
            </BaseLayerWrapper>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
};
