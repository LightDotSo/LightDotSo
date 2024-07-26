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

import { Button } from "@lightdotso/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { ComboDialog } from "./combo-dialog";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ComboDialog> = {
  title: "template/ComboDialog",
  component: ComboDialog,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof ComboDialog>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: (args) => (
    <ComboDialog
      buttonTrigger={
        <Button type="submit" size="sm" className="px-3">
          <span className="sr-only">Login</span>
          Login
        </Button>
      }
    >
      Hi.
    </ComboDialog>
  ),
  args: {},
};
