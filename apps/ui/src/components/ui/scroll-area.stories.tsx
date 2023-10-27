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

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

const meta: Meta<typeof ScrollArea> = {
  title: "ui/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Base: Story = {
  render: args => (
    <ScrollArea className="h-72 w-48 rounded-md border border-slate-100 dark:border-slate-700">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {Array.from({ length: 50 })
          .map((_, i, a) => `v1.2.0-beta.${a.length - i}`)
          .map(tag => (
            <React.Fragment key={tag}>
              <div className="text-sm" key={tag}>
                {tag}
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
      </div>
    </ScrollArea>
  ),
  args: {},
};
