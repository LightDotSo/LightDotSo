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

import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, FileWarning, Trash2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Alert> = {
  title: "component/Alert",
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
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Title</AlertTitle>
      <AlertDescription>Description</AlertDescription>
    </Alert>
  ),
  args: {},
};
export const Destructive: Story = {
  render: (args) => (
    <Alert {...args}>
      <Trash2Icon className="size-4" />
      <AlertTitle>Destructive</AlertTitle>
      <AlertDescription>Destructive Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "destructive",
  },
};
// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export const Error: Story = {
  render: (args) => (
    <Alert {...args}>
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Error Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "error",
  },
};
export const Warning: Story = {
  render: (args) => (
    <Alert {...args}>
      <FileWarning className="size-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Warning Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "warning",
  },
};
export const Info: Story = {
  render: (args) => (
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
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Success Alert Description</AlertDescription>
    </Alert>
  ),
  args: {
    intent: "success",
  },
};
