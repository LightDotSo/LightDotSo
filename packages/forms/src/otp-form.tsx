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

import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  OTP,
} from "@lightdotso/ui";
import { type FC, type InputHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type OTPFormProps = {
  name: string;
} & InputHTMLAttributes<HTMLInputElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OTPForm: FC<OTPFormProps> = ({ name, onKeyDown }) => {
  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const methods = useFormContext();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (!methods) {
    return null;
  }

  return (
    <FormField
      control={methods.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem onKeyDown={onKeyDown}>
            <FormLabel htmlFor={name}>Invite Code</FormLabel>
            <OTP
              length={6}
              id={name}
              placeholder="Your Invite Code"
              defaultValue={field.value}
              onBlur={e => {
                if (e.target.value.length === 7) {
                  field.onChange(e.target.value);
                }
              }}
              onChange={e => {
                if (e.target.value.length === 7) {
                  field.onChange(e.target.value);
                }
              }}
            />
            <FormDescription>Enter the invite code</FormDescription>
            <FormMessage />
            <div className="text-text">{JSON.stringify(field, null, 2)}</div>
            <div className="text-text">{JSON.stringify(methods, null, 2)}</div>
            {/* <FormMessage /> */}
          </FormItem>
        );
      }}
    />
  );
};
