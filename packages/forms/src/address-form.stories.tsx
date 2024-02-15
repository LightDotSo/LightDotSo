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

import { useRefinement } from "@lightdotso/hooks";
import { addressOrEns } from "@lightdotso/schemas";
import { Form } from "@lightdotso/ui";
import { publicClient } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { z } from "zod";
import { AddressForm } from "./address-form";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof AddressForm> = {
  title: "form/AddressForm",
  component: AddressForm,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof AddressForm>;

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const walletNameFormSchema = z.object({
  addressOrEns: addressOrEns,
});

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => {
    const getEns = async ({ name }: { name: string }) =>
      publicClient.getEnsAddress({ name: normalize(name) }).then(addr => {
        // console.log(addr);
        return !!addr;
      });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const validEns = useRefinement(getEns, {
      debounce: 300,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const methods = useForm({
      mode: "all",
      reValidateMode: "onBlur",
      resolver: zodResolver(
        walletNameFormSchema.refine(
          ({ addressOrEns }) => {
            if (addressOrEns.length < 1 || isAddress(addressOrEns)) {
              return true;
            }
            return validEns({ name: addressOrEns });
          },
          {
            path: ["addressOrEns"],
            message: "Ens name is not valid",
          },
        ),
      ),
    });

    return (
      <Form {...methods}>
        <AddressForm onKeyDown={validEns.invalidate} {...args} />
      </Form>
    );
  },
  args: {
    name: "addressOrEns",
  },
};