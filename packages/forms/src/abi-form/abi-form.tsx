// Copyright 2023-2024 LightDotSo.
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useAbiEncodedQueryState } from "@lightdotso/nuqs";
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
import type { Abi, AbiFunction, AbiParameter } from "abitype";
import {
  SolidityAddress,
  SolidityArray,
  SolidityBool,
  SolidityBytes,
  SolidityFunction,
  SolidityInt,
  SolidityString,
  SolidityTuple,
  Abi as zodAbi,
} from "abitype/zod";
import {
  type FC,
  type InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import {
  type Hex,
  encodeAbiParameters,
  hexToBytes,
  isAddress,
  isBytes,
  isHex,
  toFunctionSelector,
} from "viem";
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

  // const validAbi = useRefinement(getAbi, {
  //   debounce: 300,
  // });

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

  const { fields } = useFieldArray({
    name: "abiArguments",
    control: form.control,
  });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const syncWithParent = useCallback(() => {
    if (!parentMethods) {
      return;
    }

    // Sync with parent
    parentMethods.setValue("abiArguments", form.getValues("abiArguments"));
    parentMethods.setValue("abi", form.getValues("abi"));
    parentMethods.setValue("abiString", form.getValues("abiString"));
    parentMethods.setValue("address", form.getValues("address"));
    parentMethods.setValue("functionName", form.getValues("functionName"));

    // If the form is valid, clear the error
    if (form.formState.isValid) {
      parentMethods.clearErrors(name);
    }

    // If there is an error, sync with parent
    if (!form.formState.isValid && form.formState.errors[name]) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      parentMethods.setError(name, form.formState.errors[name]!);
    }

    parentMethods.trigger();
  }, [form, name, parentMethods]);

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [, setAbiEncoded] = useAbiEncodedQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const abiWatch = form.watch("abi");

  // @ts-expect-error
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const executableFuncs: AbiFunction[] = useMemo(() => {
    const abi = form.getValues("abi") as Abi | undefined;

    if (!abi) {
      return [];
    }

    // Filter the function names w/ state mutability `pure` or `view`
    return abi.filter((func) => {
      return (
        func.type === "function" &&
        func.stateMutability !== "pure" &&
        func.stateMutability !== "view"
      );
    });
  }, [form, abiWatch]);

  const functionNameWatch = form.watch("functionName");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const abiInputs: readonly AbiParameter[] | undefined = useMemo(() => {
    const abi = form.getValues("abi") as Abi | undefined;

    if (!abi) {
      return undefined;
    }

    // Get the abi input value from the matching `functionName`
    // @ts-expect-error
    const matchingAbiFunctions: AbiFunction[] = abi.filter((func) => {
      return func.type === "function" && func.name === functionNameWatch;
    });

    if (matchingAbiFunctions.length < 1) {
      return undefined;
    }

    const abiFunction = matchingAbiFunctions[0];

    return abiFunction.inputs;
  }, [form, executableFuncs, functionNameWatch]);

  const functionAbiWatch = form.watch("abiArguments");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const encodedFunctionSelector = useMemo(() => {
    const abi = form.getValues("abi") as Abi | undefined;

    if (!abi) {
      return undefined;
    }

    // Get the `AbiFunction` value from the `functionName`
    // @ts-expect-error
    const matchingAbiFunction: AbiFunction | undefined = abi.find(
      (func) => func.type === "function" && func.name === functionNameWatch,
    );

    if (matchingAbiFunction) {
      return toFunctionSelector(matchingAbiFunction);
    }
  }, [functionNameWatch, functionAbiWatch]);

  const abiInputsWatch = form.watch("abiArguments");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const encodedAbiParameters = useMemo(() => {
    if (!form.formState.isValid) {
      return undefined;
    }

    // Get the `abiInputs` and `abiArguments` values
    const abiArguments = form.getValues("abiArguments");

    // Check if all of the `value` of the `abiArguments` are valid
    for (const arg of abiArguments) {
      if (!arg?.value) {
        return undefined;
      }
    }
    // Map the `value` of the `abiArguments` to an array of values
    // @ts-expect-error
    const abiArgumentsValues = abiArguments.map((arg) => arg.value);

    if (abiInputs && abiArgumentsValues) {
      return encodeAbiParameters(abiInputs, abiArgumentsValues);
    }
  }, [form.formState.isValid, abiInputs, abiInputsWatch]);

  const encodedCallData = useMemo(() => {
    if (!form.formState.isValid) {
      return undefined;
    }

    if (encodedFunctionSelector && encodedAbiParameters) {
      return encodedFunctionSelector + encodedAbiParameters.slice(2);
    }
  }, [form.formState.isValid, encodedFunctionSelector, encodedAbiParameters]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const formAddress = form.getValues("address");

  // SYnc the `encodedCallData` value
  useEffect(() => {
    if (encodedCallData && encodedFunctionSelector) {
      setAbiEncoded({
        address: formAddress,
        callData: encodedCallData as Hex,
        functionName: encodedFunctionSelector,
      });
    }
  }, [encodedCallData, encodedFunctionSelector, setAbiEncoded, formAddress]);

  // Sync the `abiArguments` value with the `abiInputs`
  useEffect(() => {
    form.setValue("abiArguments", abiInputs);
  }, [form, abiInputs]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  // From: https://github.com/hashgraph/hedera-accelerator-defi-dex-ui/blob/cc70c3972c121774d19327718758c30fbe165e2b/src/dao/pages/DAOProposals/Forms/DAOGenericProposal/FormMultiInputList.tsx
  // License: MIT
  // Thanks to the Hedera team for the inspiration!
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  function validateSolidityParam(
    abiType: string,
    value: string,
    index: number,
  ) {
    if (SolidityString.safeParse(abiType).success) {
      if (value?.length > 0) {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          value,
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid string",
      });
      return;
    }
    if (SolidityAddress.safeParse(abiType).success) {
      if (
        isAddress(value) ||
        "0x000000000000000000000000000000000000000" === value
      ) {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          value,
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid address",
      });
      return;
    }
    if (SolidityBool.safeParse(abiType).success) {
      const boolValue = value.toLowerCase();
      if (boolValue === "true" || boolValue === "false") {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          boolValue === "true",
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid bool",
      });
      return;
    }
    if (SolidityBytes.safeParse(abiType).success) {
      if (isHex(value) && isBytes(hexToBytes(value as Hex))) {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          value as Hex,
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid bytes",
      });
    }
    if (SolidityFunction.safeParse(abiType).success) {
      /** TODO: Add validations for Function type inputs. */
      if (value?.length > 0) {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          value,
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid function",
      });
    }
    if (SolidityInt.safeParse(abiType).success) {
      const parsedNumber = BigInt(value);
      if (parsedNumber) {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          Number(parsedNumber),
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid integer",
      });
    }
    if (SolidityTuple.safeParse(abiType).success) {
      if (value?.length > 0) {
        form.setValue(
          `abiArguments.${
            index
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          }.value` as any,
          value,
        );
        form.clearErrors(`abiArguments.${index}.value`);
        form.trigger();
        return;
      }
      form.setError(`abiArguments.${index}.value`, {
        type: "manual",
        message: "Invalid tuple",
      });
    }

    if (SolidityArray.safeParse(abiType).success) {
      // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
      let parsedArray;
      try {
        parsedArray = JSON.parse(value);
      } catch (_error) {
        // return "Invalid array.";
      }
      if (Array.isArray(parsedArray)) {
        const arrayType = abiType.replace("[]", "");
        /** TODO: Cover validations for all array types **/
        const parseArrayType = arrayType.includes("int")
          ? "number"
          : arrayType.includes("bool")
            ? "boolean"
            : "string";
        const areValuesValid = parsedArray.every(
          // biome-ignore lint/suspicious/useValidTypeof: <explanation>
          (value: unknown) => typeof value === parseArrayType,
        );
        if (areValuesValid) {
          form.setValue(
            `abiArguments.${
              index
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            }.value` as any,
            parsedArray,
          );
          form.clearErrors(`abiArguments.${index}.value`);
          form.trigger();
          return;
        }

        form.setError(`abiArguments.${index}.value`, {
          type: "manual",
          message: "Invalid array",
        });
      }
    }

    return;
  }

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Only on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    syncWithParent();
  }, []);

  // Sync w/ every invalidation
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    syncWithParent();
  }, [form.formState.isValid, form.formState.errors]);

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
                onChange={(event) => {
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
            {/* <div className="text-text">
              {JSON.stringify(abiInputs, null, 2)}
            </div> */}
            {/* <div className="text-text">{JSON.stringify(field, null, 2)}</div> */}
            {/* <div className="text-text">
              {encodedAbiParameters && encodedAbiParameters}
              <br />
              {encodedFunctionSelector && encodedFunctionSelector}
              <br />
              {encodedCallData && encodedCallData}
            </div> */}
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
              onChange={(e) => {
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
                disabled={executableFuncs.length < 1}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
                onOpenChange={(value) => {
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
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <SelectItem key={i} value={func.name}>
                      {func.name}
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
      {fields.map((rootField, index) => (
        <FormField
          key={rootField.id}
          control={form.control}
          name={`abiArguments.${index}.value`}
          render={() => (
            <FormItem>
              {/* @ts-ignore */}
              <FormLabel>{rootField.name.toString()}</FormLabel>
              <FormDescription>
                {/* @ts-ignore */}
                {rootField.internalType}
              </FormDescription>
              <FormControl>
                <Input
                  type="text"
                  onChange={(e) => {
                    validateSolidityParam(
                      // @ts-ignore
                      rootField.type,
                      e.target.value,
                      index,
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      {/* <AbiArgumentsFormField /> */}
      {/* Show all errors for debugging */}
      {/* <div className="text-text">
        {JSON.stringify(form.getValues("abiArguments"), null, 2)}
      </div> */}
      {/* <div className="text-text">{JSON.stringify(form.formState, null, 2)}</div> */}
      {/* <div className="text-text">{JSON.stringify(form, null, 2)}</div> */}
    </Form>
  );
};
