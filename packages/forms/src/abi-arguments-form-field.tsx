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

// import { getAbi as getClientAbi } from "@lightdotso/client";
// import type { RefinementCallback } from "@lightdotso/hooks";
// import { useRefinement } from "@lightdotso/hooks";
import { abi } from "@lightdotso/schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Abi as zodAbi } from "abitype/zod";
import {
  useEffect,
  type FC,
  type InputHTMLAttributes,
  useCallback,
  useMemo,
} from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { Abi } from "abitype";
import { cn } from "@lightdotso/utils";
// import type { z } from "zod";
// import { AddressForm } from "./address-form";

// type AbiFormValues = z.infer<typeof abiFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type AbiArgumentsFormFieldProps = {
  name: string;
} & InputHTMLAttributes<HTMLInputElement>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const AbiArgumentsFormField: FC<AbiArgumentsFormFieldProps> = ({
  name,
}) => {
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
