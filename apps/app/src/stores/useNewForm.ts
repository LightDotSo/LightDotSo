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
import type { newFormStoreSchema } from "@/schemas/newForm";

type NewFormStoreValues = z.infer<typeof newFormStoreSchema>;

interface FormStore {
  formValues: Partial<NewFormStoreValues>;
  setFormValues: (values: Partial<NewFormStoreValues>) => void;
}

export const useNewFormStore = create<FormStore>(set => ({
  formValues: {
    type: "multi",
    name: "",
  },
  setFormValues: values =>
    set(state => ({ formValues: { ...state.formValues, ...values } })),
}));
