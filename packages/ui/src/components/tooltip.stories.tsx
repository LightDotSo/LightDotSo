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
import { Plus } from "lucide-react";
import { ButtonIcon } from "./button-icon";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./tooltip";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Tooltip> = {
  title: "component/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Tooltip>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ButtonIcon variant="outline">
            <Plus />
            <span className="sr-only">Add</span>
          </ButtonIcon>
        </TooltipTrigger>
        <TooltipContent>
          <TooltipArrow />
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
  args: {},
};
