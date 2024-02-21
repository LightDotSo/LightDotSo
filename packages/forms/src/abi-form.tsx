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
import { useForm, useFormContext } from "react-hook-form";
import { Abi } from "abitype";
// import type { z } from "zod";
// import { AddressForm } from "./address-form";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

const abiFormSchema = abi;

// type AbiFormValues = z.infer<typeof abiFormSchema>;

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

  // const getAbi: RefinementCallback<AbiValues> = async ({
  //   abi,
  // }: {
  //   abi: string;
  // }) => {
  //   const res = await getClientAbi({
  //     params: {
  //       query: {
  //         code: abi,
  //       },
  //     },
  //   });

  //   return res.match(
  //     data => data.status === "ACTIVE",
  //     () => false,
  //   );
  // };

  // // eslint-disable-next-line react-hooks/rules-of-hooks
  // const validAbi = useRefinement(getAbi, {
  //   debounce: 300,
  // });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(abiFormSchema),
    // resolver: zodResolver(
    //   newFormSchema.pick({ abi: true }).refine(
    //     ({ abi }) => {
    //       if (abi.length < 1) {
    //         return true;
    //       }
    //       return validAbi({ abi: abi });
    //     },
    //     {
    //       path: ["abi"],
    //       message: "Invite code is not valid",
    //     },
    //   ),
    // ),
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
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const abiWatch = form.watch("abi");

  const executableFuncs = useMemo(() => {
    const abi = form.getValues("abi") as Abi | undefined;

    if (!abi) {
      return [];
    }

    // Filter the function names w/ state mutability `pure` or `view`
    return abi.filter(func => {
      return (
        func.type === "function" &&
        func.stateMutability !== "pure" &&
        func.stateMutability !== "view"
      );
    });
  }, [form, abiWatch]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="abiString"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ABI</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Paste your ABI here"
                className="resize-none"
                {...field}
                onChange={event => {
                  field.onChange(event.target.value);
                  const newValue = zodAbi.parse(JSON.parse(event.target.value));
                  if (newValue) {
                    form.setValue("abi", newValue);
                  }
                }}
              />
            </FormControl>
            <FormDescription>
              You can directly paste the ABI of the contract you want to
              interact with.
            </FormDescription>
            <FormMessage />
            {/* <div className="text-text">
              {JSON.stringify(executableFuncs, null, 2)}
            </div> */}
            {/* Show all errors for debugging */}
            {/* <div className="text-text">
              {JSON.stringify(form.getValues("abi"), null, 2)}
            </div> */}
            {/* <div className="text-text">{JSON.stringify(field, null, 2)}</div> */}
            {/* <div className="text-text">{JSON.stringify(form, null, 2)}</div> */}
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address"
              placeholder="Contract Address"
              defaultValue={field.value}
              onChange={e => {
                field.onChange(e);
              }}
            />
            <FormDescription>
              Enter the address of the contract to interact with.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={"functionName"}
        render={({ field }) => (
          <FormControl>
            <>
              <Label htmlFor="weight">Function</Label>
              <Select
                onValueChange={value => {
                  field.onChange(value);
                }}
                onOpenChange={value => {
                  field.onChange(value);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your function" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {executableFuncs.map((func, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {func.type === "function" ? func.name : "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the function you want to interact with.
              </FormDescription>
              <FormMessage />
            </>
          </FormControl>
        )}
      />
      {/* <AddressForm name="address" onMouseLeave={validAbi.invalidate} /> */}
    </Form>
  );
};
