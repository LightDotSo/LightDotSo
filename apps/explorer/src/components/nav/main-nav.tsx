// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use client";

import type { Tab } from "@lightdotso/types";
import { BaseLayerWrapper, baseWidthWrapper } from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
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
    label: "Explorer",
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
    href: "https://app.light.so",
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
