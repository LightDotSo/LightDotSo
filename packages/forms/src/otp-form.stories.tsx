// Copyright 2023-2024 Light, Inc.
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

import { useRefinement } from "@lightdotso/hooks";
import { newFormSchema } from "@lightdotso/schemas";
import { Form } from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react";
import { useForm } from "react-hook-form";
import { OTPForm } from "./otp-form";
import { getInviteCode as getClientInviteCode } from "@lightdotso/client";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Meta
// -----------------------------------------------------------------------------

const meta: Meta<typeof OTPForm> = {
  title: "form/OTPForm",
  component: OTPForm,
  tags: ["autodocs"],
  argTypes: {},
};
export default meta;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type Story = StoryObj<typeof OTPForm>;

// -----------------------------------------------------------------------------
// Story
// -----------------------------------------------------------------------------

export const Base: Story = {
  render: args => {
    const getInviteCode = async ({ inviteCode }: { inviteCode: string }) => {
      const res = await getClientInviteCode({
        params: {
          query: {
            code: inviteCode,
          },
        },
      });

      return res.match(
        data => data.status === "ACTIVE",
        () => false,
      );
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const validInviteCode = useRefinement(getInviteCode, {
      debounce: 300,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const methods = useForm({
      mode: "all",
      reValidateMode: "onBlur",
      resolver: zodResolver(
        z
          .object({
            inviteCode: z.string(),
          })
          .refine(
            ({ inviteCode }) => {
              console.log("inviteCode", inviteCode);
              if (inviteCode.length < 1) {
                return true;
              }
              return validInviteCode({ inviteCode: inviteCode });
            },
            {
              path: ["inviteCode"],
              message: "Invite code is not valid",
            },
          ),
      ),
    });

    return (
      <Form {...methods}>
        <OTPForm onKeyDown={validInviteCode.invalidate} {...args} />
      </Form>
    );
  },
  args: {
    name: "inviteCode",
  },
};
