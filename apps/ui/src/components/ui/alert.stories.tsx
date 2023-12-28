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
import { AlertCircle, FileWarning, Trash2Icon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Alert> = {
  title: "ui/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Alert>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

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
      <Trash2Icon className="h-4 w-4" />
      <AlertTitle>Destructive</AlertTitle>
      <AlertDescription>Destructive Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "destructive",
  },
};
export const Error: Story = {
  render: args => (
    <Alert {...args}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Error Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "error",
  },
};
export const Warning: Story = {
  render: args => (
    <Alert {...args}>
      <FileWarning className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Warning Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "warning",
  },
};
export const Info: Story = {
  render: args => (
    <Alert {...args}>
      <AlertTitle>Info</AlertTitle>
      <AlertDescription>Info Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "info",
  },
};
export const Success: Story = {
  render: args => (
    <Alert {...args}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Success Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "success",
  },
};
