// Copyright 2023-2024 Light
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

/* eslint-disable react-hooks/rules-of-hooks */

import { useAuth, useModals } from "@lightdotso/stores";
import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { OwnerModal } from "./owner-modal";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof OwnerModal> = {
  title: "modal/OwnerModal",
  component: OwnerModal,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof OwnerModal>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: () => {
    const { setAddress } = useAuth();
    const { showOwnerModal } = useModals();

    useEffect(() => {
      setAddress("0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed");
      showOwnerModal();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <OwnerModal />;
  },
  args: {},
};
