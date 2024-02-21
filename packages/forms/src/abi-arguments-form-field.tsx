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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@lightdotso/ui";
import { type FC, type InputHTMLAttributes } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AbiArgumentsFormField: FC = () => {
  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const { control } = useFormContext();

  // methods.register("abiArguments");

  const { fields } = useFieldArray({
    name: "abiArguments",
    control: control,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      {/* {JSON.stringify(methods)} */}
      {/* {JSON.stringify(methods.getValues("abiArguments"))} */}
      <br />
      {/* {JSON.stringify(fields)} */}
      {fields.map((field, index) => (
        <>
          {/* {JSON.stringify(field)} */}
          <FormField
            key={field.id}
            control={control}
            name={`abiArguments.${index}.value`}
            render={({ field }) => (
              <FormItem>
                {/* @ts-ignore */}
                <FormLabel>{fields[index].name}</FormLabel>
                {/* @ts-ignore */}
                <FormDescription>{fields[index].type}</FormDescription>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ))}
    </div>
  );
};
