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

"use client";

import { getInviteCode as getClientInviteCode } from "@lightdotso/client";
import type { RefinementCallback } from "@lightdotso/hooks";
import { useRefinement } from "@lightdotso/hooks";
import { newFormSchema } from "@lightdotso/schemas";
import { Form } from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useEffect,
  type FC,
  type InputHTMLAttributes,
  useCallback,
} from "react";
import { useForm, useFormContext } from "react-hook-form";
import type { z } from "zod";
import { AddressForm } from "./address-form";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

const inviteCodeSchema = newFormSchema.pick({ inviteCode: true });

type InviteCodeValues = z.infer<typeof inviteCodeSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type AbiFormProps = {
  name: string;
} & InputHTMLAttributes<HTMLInputElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AbiForm: FC<AbiFormProps> = ({ name }) => {
  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const parentMethods = useFormContext();

  const getInviteCode: RefinementCallback<InviteCodeValues> = async ({
    inviteCode,
  }: {
    inviteCode: string;
  }) => {
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
  const form = useForm({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(
      newFormSchema.pick({ inviteCode: true }).refine(
        ({ inviteCode }) => {
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

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const syncWithParent = useCallback(() => {
    if (!parentMethods) {
      return;
    }

    // Sync with parent
    parentMethods.setValue(name, form.getValues(name));

    // If the form is valid, clear the error
    if (form.formState.isValid) {
      parentMethods.clearErrors(name);
    }

    // If there is an error, sync with parent
    if (!form.formState.isValid && form.formState.errors[name]) {
      parentMethods.setError(name, form.formState.errors[name]!);
    }
  }, [form, name, parentMethods]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Only on mount
  useEffect(() => {
    syncWithParent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync w/ every invalidation
  useEffect(() => {
    syncWithParent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState.isValid, form.formState.errors]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Form {...form}>
      <AddressForm name="address" onMouseLeave={validInviteCode.invalidate} />
    </Form>
  );
};
