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

import type { MutableRefObject } from "react";
import type { Control } from "react-hook-form";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

export interface FormRefState {
  formControl: Control<any, any> | undefined;
  setFormControl: (formControl: Control<any, any> | undefined) => void;
  formRef: MutableRefObject<HTMLFormElement | null> | undefined;
  setFormRef: (
    formRef: MutableRefObject<HTMLFormElement | null> | undefined,
  ) => void;
  isFormDisabled: boolean;
  setIsFormDisabled: (isFormDisabled: boolean) => void;
  isFormLoading: boolean;
  setIsFormLoading: (isFormLoading: boolean) => void;
  customFormSuccessText?: string;
  setCustomFormSuccessText: (customFormSuccessText: string) => void;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export const useFormRef = create(
  devtools<FormRefState>(
    set => ({
      formControl: undefined,
      setFormControl: (formControl: Control<any, any> | undefined) =>
        set({ formControl }),
      formRef: undefined,
      setFormRef: (
        formRef: MutableRefObject<HTMLFormElement | null> | undefined,
      ) => set({ formRef }),
      isFormDisabled: true,
      setIsFormDisabled: (isFormDisabled: boolean) => set({ isFormDisabled }),
      isFormLoading: false,
      setIsFormLoading: (isFormLoading: boolean) => set({ isFormLoading }),
      customFormSuccessText: undefined,
      setCustomFormSuccessText: (customFormSuccessText: string) =>
        set({ customFormSuccessText }),
    }),
    {
      anonymousActionType: "useFormRef",
      name: "FormRefState",
      serialize: { options: true },
    },
  ),
);
