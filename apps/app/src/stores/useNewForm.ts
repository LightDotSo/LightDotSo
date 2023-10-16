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

import { create } from "zustand";
import type * as z from "zod";
import { newFormStoreSchema } from "@/schemas/newForm";
import { simulateWallet } from "@lightdotso/client";

type NewFormStoreValues = z.infer<typeof newFormStoreSchema>;

interface FormStore {
  address: string | null;
  prevState: Partial<NewFormStoreValues> | null;
  formValues: Partial<NewFormStoreValues>;
  setFormValues: (values: Partial<NewFormStoreValues>) => void;
  validate: () => void;
  fetchToSimulate: () => Promise<void>; // if your fetch returns an address
  isValid: boolean;
  errors: z.ZodError | null;
}

export const useNewFormStore = create<FormStore>((set, get) => ({
  address: null,
  prevState: null,
  formValues: {
    type: "multi",
    name: "",
  },
  setFormValues: async values => {
    const currentState = get().formValues;

    set(prevState => ({ formValues: { ...prevState?.formValues, ...values } }));

    // After state has been set, run validation
    get().validate();

    const nextState = get().formValues;

    // Check if object properties changed
    if (JSON.stringify(currentState) !== JSON.stringify(nextState)) {
      if (get().isValid) {
        // If valid, fetch to simulate
        await get().fetchToSimulate();
      }
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
  fetchToSimulate: async function () {
    // Run validation before fetching
    this.validate();

    // Replace with your actual fetch logic
    const res = await simulateWallet({
      params: {
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
    res.map(response => {
      if (response && response.response && response.response.status === 200) {
        // assuming address is a field in formValues
        set(() => ({
          address: response.data?.address,
        }));
      }
    });
  },
  isValid: false,
  errors: null,
}));
