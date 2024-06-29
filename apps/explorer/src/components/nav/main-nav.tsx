// Copyright 2023-2024 Light
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

import type { Tab } from "@lightdotso/types";
import { BaseLayerWrapper } from "@lightdotso/ui";
import { DashboardIcon, WidthIcon } from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import { ArrowUpRightFromSquare } from "lucide-react";
import type { HTMLAttributes, ReactNode, RefAttributes, FC } from "react";
import { RootLogo } from "../root/root-logo";
import { AppNav } from "./app-nav";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const tabs: Tab[] = [
  {
    label: "Home",
    id: "user-operations",
    href: "/",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <DashboardIcon {...props} />,
  },
  {
    label: "Transactions",
    id: "transactions",
    href: "/transactions",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <WidthIcon {...props} />,
  },
  {
    label: "App",
    id: "app",
    href: "https://light.so",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <ArrowUpRightFromSquare {...props} />,
  },
];

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type MainNavProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const MainNav: FC<MainNavProps> = ({ children }) => {
  return (
    <main>
      <div className="flex flex-col">
        <div className="overflow-y-visible border-b border-b-border py-2">
          <div className="flex h-16 items-center">
            <BaseLayerWrapper>
              <div className="flex items-center justify-between">
                <RootLogo />
                <AppNav tabs={tabs} />
              </div>
            </BaseLayerWrapper>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
};
