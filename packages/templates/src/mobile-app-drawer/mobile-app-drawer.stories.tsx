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

import type { Tab } from "@lightdotso/types";
import { DashboardIcon, WidthIcon } from "@radix-ui/react-icons";
import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { Meta, StoryObj } from "@storybook/react";
import { FileIcon } from "lucide-react";
import type { RefAttributes } from "react";
import { MobileAppDrawer } from "./mobile-app-drawer";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const tabs: Tab[] = [
  {
    label: "Explorer",
    id: "user-operations",
    href: "/",
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <DashboardIcon {...props} />,
  },
  {
    label: "Transactions",
    id: "transactions",
    href: "/transactions",
    number: 4,
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <WidthIcon {...props} />,
  },
  {
    label: "External",
    id: "external",
    href: "https://light.so",
    icon: (
      // biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
      props: JSX.IntrinsicAttributes & IconProps & RefAttributes<SVGSVGElement>,
    ) => <FileIcon {...props} />,
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
  render: (_args) => <MobileAppDrawer tabs={tabs} />,
  args: {},
};
