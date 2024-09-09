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

import { INTERNAL_LINKS } from "@lightdotso/const";
import type { Tab } from "@lightdotso/types";
import { Button } from "@lightdotso/ui/components/button";
import { BaseLayerWrapper } from "@lightdotso/ui/wrappers";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { NavLocation } from "./nav-location";
import { NavLogo } from "./nav-logo";
import { NavWrapper } from "./nav-wrapper";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type NavProps = HTMLAttributes<HTMLElement> & {
  tabs: Tab[];
  children: ReactNode;
  wrapperClassName?: string;
  layerClassName?: string;
  rootClassName?: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const Nav: FC<NavProps> = ({
  children,
  tabs,
  className,
  wrapperClassName,
  layerClassName,
}) => {
  return (
    <NavWrapper
      className={wrapperClassName}
      nav={
        <BaseLayerWrapper className={className} layerClassName={layerClassName}>
          <div className="flex items-center justify-between gap-2">
            <NavLogo />
            <NavLocation tabs={tabs}>
              <Button className="shrink-0" asChild>
                <a href={INTERNAL_LINKS.App}>Launch App</a>
              </Button>
            </NavLocation>
          </div>
        </BaseLayerWrapper>
      }
    >
      {children}
    </NavWrapper>
  );
};
