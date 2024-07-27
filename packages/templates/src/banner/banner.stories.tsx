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
import { Banner } from "./banner";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Banner> = {
  title: "template/Banner",
  component: Banner,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Banner>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Beta: Story = {
  render: (_args) => <Banner kind="beta" />,
  args: {},
};
export const Demo: Story = {
  render: (_args) => <Banner kind="demo" />,
  args: {},
};
export const Outage: Story = {
  render: (_args) => <Banner kind="outage" />,
  args: {},
};
