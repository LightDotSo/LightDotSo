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

import { Button } from "@lightdotso/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { ModalSwiper } from "../modal-swiper/modal-swiper";
import { useModalSwiper } from "@lightdotso/stores";

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
    const { pageIndex, setPageIndex } = useModalSwiper();

    return (
      <>
        <ModalSwiper>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <h1>{i}</h1>
            </div>
          ))}
        </ModalSwiper>
        <Button onClick={() => setPageIndex(pageIndex - 1)}>Previous</Button>
        <Button onClick={() => setPageIndex(pageIndex + 1)}>Next</Button>
      </>
    );
  },
  args: {},
};
