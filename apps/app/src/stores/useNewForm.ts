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
import * as z from "zod";

const newFormSchema = z.object({
  type: z.enum(["multi", "personal", "2fa"], {
    required_error: "Please select a type.",
  }),
  name: z
    .string()
    .min(1, { message: "Name cannot be empty." })
    .max(30, { message: "Name should be less than 30 characters." }),
});

type NewFormValues = z.infer<typeof newFormSchema>;

interface FormStore {
  formValues: Partial<NewFormValues>;
  setFormValues: (values: Partial<NewFormValues>) => void;
}

export const useNewFormStore = create<FormStore>(set => ({
  formValues: {
    type: "multi",
    name: "",
  },
  setFormValues: values =>
    set(state => ({ formValues: { ...state.formValues, ...values } })),
}));
