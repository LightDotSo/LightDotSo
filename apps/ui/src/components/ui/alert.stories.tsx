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
import { Alert, AlertTitle, AlertDescription } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "ui/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Base: Story = {
  render: args => (
    <Alert {...args}>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>Description</AlertDescription>
    </Alert>
  ),
  args: {},
};
export const Destructive: Story = {
  render: args => (
    <Alert {...args}>
      <AlertTitle>Destructive</AlertTitle>
      <AlertDescription>Destructive Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "destructive",
  },
};
