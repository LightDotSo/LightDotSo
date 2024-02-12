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

import type { MutableRefObject } from "react";
import type { Control, FieldValues } from "react-hook-form";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

export interface FormRefState {
  formControl: Control<FieldValues, any> | undefined;
  setFormControl: (formControl: Control<FieldValues, any> | undefined) => void;
  formRef: MutableRefObject<HTMLFormElement | null> | undefined;
  setFormRef: (
    formRef: MutableRefObject<HTMLFormElement | null> | undefined,
  ) => void;
  isFormDisabled: boolean;
  setIsFormDisabled: (isFormDisabled: boolean) => void;
  isFormLoading: boolean;
  setIsFormLoading: (isFormLoading: boolean) => void;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useFormRef = create(
  devtools<FormRefState>(
    set => ({
      formControl: undefined,
      setFormControl: (formControl: Control<FieldValues, any> | undefined) =>
        set({ formControl }),
      formRef: undefined,
      setFormRef: (
        formRef: MutableRefObject<HTMLFormElement | null> | undefined,
      ) => set({ formRef }),
      isFormDisabled: true,
      setIsFormDisabled: (isFormDisabled: boolean) => set({ isFormDisabled }),
      isFormLoading: false,
      setIsFormLoading: (isFormLoading: boolean) => set({ isFormLoading }),
    }),
    {
      anonymousActionType: "useFormRef",
      name: "FormRefState",
      serialize: { options: true },
    },
  ),
);
