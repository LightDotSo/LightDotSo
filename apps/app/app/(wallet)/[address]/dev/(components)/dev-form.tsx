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

import { AbiForm } from "@lightdotso/forms";
import {
  useAbiEncodedQueryState,
  userOperationsParser,
} from "@lightdotso/nuqs";
import type { devFormSchema } from "@lightdotso/schemas";
import { abi } from "@lightdotso/schemas";
import { useModals } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { FooterButton, useIsInsideModal } from "@lightdotso/templates";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormMessage,
  Input,
  Label,
  TooltipProvider,
} from "@lightdotso/ui";
import { getChainById } from "@lightdotso/utils";
import { lightWalletAbi } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "lodash";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import type { Address, Hex } from "viem";
import { encodeFunctionData } from "viem";
import type * as z from "zod";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type DevFormValues = z.infer<typeof devFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface DevFormProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const DevForm: FC<DevFormProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [abiEncoded] = useAbiEncodedQueryState();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    setChainModalProps,
    hideChainModal,
    showChainModal,
    setSendBackgroundModal,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<DevFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(abi),
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const formChainId = form.getValues("chainId");
  const formValue = form.getValues("value");

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  const userOperationsParams = useMemo(() => {
    if (!formChainId || !abiEncoded || !abiEncoded.address) {
      return;
    }

    const value = formValue || 0;

    return [
      {
        chainId: BigInt(formChainId),
        callData: encodeFunctionData({
          abi: lightWalletAbi,
          functionName: "execute",
          args: [abiEncoded.address, BigInt(value), abiEncoded.callData as Hex],
        }),
      },
    ];
  }, [abiEncoded, formChainId]);

  const href = useMemo(() => {
    if (!userOperationsParams) {
      return;
    }

    return `/${address}/create?userOperations=${userOperationsParser.serialize(userOperationsParams!)}`;
  }, [address, userOperationsParams]);
  // ---------------------------------------------------------------------------
  // Template Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onSubmit = useCallback(() => {
    if (!href) {
      return;
    }

    router.push(href);
  }, [href, router]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="flex flex-col space-y-6 p-4 lg:px-6 lg:pt-6">
      <CardHeader className="gap-3">
        <CardTitle>Developer Form</CardTitle>
        <CardDescription>Input ABI to submit.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form
              id="dev-form"
              className="space-y-8"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="chainId"
                render={({ field }) => {
                  const chain = getChainById(field.value);

                  return (
                    <FormControl>
                      <div className="w-full space-y-2">
                        <Label htmlFor="chain">Chain</Label>
                        <Button
                          id="chain"
                          size="lg"
                          type="button"
                          variant="outline"
                          className="flex w-full items-center justify-between px-4 text-sm"
                          onClick={() => {
                            setChainModalProps({
                              onClose: () => {
                                hideChainModal();
                                setSendBackgroundModal(false);
                              },
                              onChainSelect: chainId => {
                                field.onChange(chainId);
                                form.trigger();

                                hideChainModal();
                                if (isInsideModal) {
                                  setSendBackgroundModal(false);
                                }
                              },
                            });
                            showChainModal();
                          }}
                        >
                          {field.value ? (
                            <>
                              <ChainLogo
                                className="mr-2"
                                chainId={field.value}
                              />
                              {chain.name}
                            </>
                          ) : (
                            "Select Chain"
                          )}
                          <div className="grow" />
                          <ChevronDown className="size-4 opacity-50" />
                        </Button>
                        <FormMessage />
                      </div>
                    </FormControl>
                  );
                }}
              />
              <FormControl>
                <Label htmlFor="weight">Value</Label>
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <Input
                      {...field}
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="text"
                      onBlur={e => {
                        // Validate the address
                        if (!e.target.value) {
                          // Clear the value of key address
                          form.setValue("value", 0);
                        }

                        const quantity = parseFloat(e.target.value);
                        form.setValue("value", quantity * Math.pow(10, 18));
                      }}
                      onChange={e => {
                        // If the input ends with ".", or includes "." and ends with "0", set the value as string, as it can be assumed that the user is still typing
                        if (
                          e.target.value.endsWith(".") ||
                          (e.target.value.includes(".") &&
                            e.target.value.endsWith("0"))
                        ) {
                          field.onChange(e.target.value);
                        } else {
                          // Only parse to float if the value doesn't end with "."
                          field.onChange(parseFloat(e.target.value) || 0);
                        }

                        // Validate the number
                        const quantity = parseFloat(e.target.value);
                        form.setValue("value", quantity * Math.pow(10, 18));
                      }}
                    />
                  )}
                />
                <FormMessage />
                <div className="flex items-center justify-between text-xs text-text-weak">
                  <div>{/* tokenPrice could come here */}</div>
                  <div>
                    {/* {token ? `${token.amount} ${token.symbol} available` : ""} */}
                  </div>
                </div>
              </FormControl>
              <AbiForm name="abi" />
              {/* Show all errors for debugging */}
              {/* <div className="text-text">{JSON.stringify(field, null, 2)}</div> */}
              {/* <div className="text-text">{JSON.stringify(form, null, 2)}</div> */}
              <FooterButton
                form="dev-form"
                isModal={false}
                cancelDisabled={true}
                disabled={!isFormValid}
              />
            </form>
          </Form>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
