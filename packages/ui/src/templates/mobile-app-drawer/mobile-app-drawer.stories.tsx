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
import type { Meta, StoryObj } from "@storybook/react";
import type { RawTab } from "@lightdotso/types";
import { DashboardIcon, WidthIcon } from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { HTMLAttributes, ReactNode, RefAttributes, FC } from "react";
import { MobileAppDrawer } from "./mobile-app-drawer";

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const tabs: RawTab[] = [
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
    label: "External",
    id: "external",
    href: "https://light.so",
    icon: (
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <WidthIcon {...props} />,
  },
];

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof MobileAppDrawer> = {
  title: "template/MobileAppDrawer",
  component: MobileAppDrawer,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof MobileAppDrawer>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => <MobileAppDrawer tabs={tabs} />,
  args: {},
};
