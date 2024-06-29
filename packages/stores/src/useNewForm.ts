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

import { createWallet } from "@lightdotso/client";
import { newFormStoreSchema } from "@lightdotso/schemas";
import { isEqual } from "lodash";
import type * as z from "zod";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

type NewFormStoreValues = z.infer<typeof newFormStoreSchema>;

interface FormStore {
  address: string | null;
  prevState: Partial<NewFormStoreValues> | null;
  formValues: Partial<NewFormStoreValues>;
  setFormValues: (values: Partial<NewFormStoreValues>) => void;
  validate: () => void;
  fetchToCreate: (isCreate: boolean) => Promise<void>;
  isValid: boolean;
  isLoading: boolean;
  errors: z.ZodError | null;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useNewForm = create(
  devtools<FormStore>(
    (set, get) => ({
      address: null,
      prevState: null,
      isValid: false,
      isLoading: false,
      errors: null,
      formValues: {
        type: "multi",
        inviteCode: "",
        name: "",
      },
      setFormValues: async values => {
        const currentState = get().formValues;

        set(prevState => ({
          formValues: { ...prevState?.formValues, ...values },
        }));

        // After state has been set, run validation
        get().validate();

        const nextState = get().formValues;

        // Check if object properties changed and if form is valid
        if (!isEqual(currentState, nextState) && get().isValid) {
          // If valid, fetch to simulate
          await get().fetchToCreate(false);
        }

        // Update prevState
        set({ prevState: currentState });
      },
      validate: function () {
        const result = newFormStoreSchema.safeParse(this?.formValues ?? {});
        set({
          isValid: result.success,
          errors: result.success ? null : result.error,
        });
      },
      fetchToCreate: async function (isCreate: boolean) {
        // Run validation before fetching
        get().validate();

        if (!get().isValid) {
          return;
        }

        // Set loading state to true before starting async operation
        set({ isLoading: true });

        // Replace with your actual fetch logic
        const res = await createWallet({
          params: {
            query: {
              simulate: !isCreate,
            },
          },
          body: {
            invite_code: get().formValues.inviteCode!,
            name: get().formValues.name!,
            salt: get().formValues.salt!,
            threshold: get().formValues.threshold!,
            owners: get().formValues.owners!.map(owner => ({
              weight: owner.weight!,
              address: owner.address!,
            })),
          },
        });

        // Parse the response and set the address
        res.match(
          data => {
            set(() => ({
              address: data?.address,
            }));
          },
          () => {
            throw new Error("Error creating wallet");
          },
        );

        // Set loading state to false after async operation is finished
        set({ isLoading: false });
      },
    }),
    {
      anonymousActionType: "useNewForm",
      name: "FormStore",
      serialize: { options: true },
    },
  ),
);
