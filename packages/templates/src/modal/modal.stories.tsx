// Copyright 2023-2024 Light.
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

import { Button, DialogDescription, DialogTitle } from "@lightdotso/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./modal";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof Modal> = {
  title: "template/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof Modal>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => (
    <Modal
      size="sm"
      footerContent={
        <Button type="submit" size="sm" className="px-3">
          <span className="sr-only">Login</span>
          Login
        </Button>
      }
      open={true}
    >
      <DialogTitle>Login</DialogTitle>
      <DialogDescription>
        Login with your wallet to access your account.
      </DialogDescription>
    </Modal>
  ),
  args: {},
};
