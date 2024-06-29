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

import { useModalSwiper } from "@lightdotso/stores";
import { Button } from "@lightdotso/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { ModalSwiper } from "../modal-swiper/modal-swiper";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof ModalSwiper> = {
  title: "template/ModalSwiper",
  component: ModalSwiper,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof ModalSwiper>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { pageIndex, setPageIndex } = useModalSwiper();

    return (
      <>
        <ModalSwiper>
          {Array.from({ length: 3 }).map(
            (_, i) => pageIndex === i && <div key={i}>Page {i}</div>,
          )}
        </ModalSwiper>
        <Button onClick={() => setPageIndex(pageIndex - 1)}>Previous</Button>
        <Button onClick={() => setPageIndex(pageIndex + 1)}>Next</Button>
      </>
    );
  },
  args: {},
};
