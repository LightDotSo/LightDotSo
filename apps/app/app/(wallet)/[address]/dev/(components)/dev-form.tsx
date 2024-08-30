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
import { AbiForm } from "@lightdotso/forms";
import {
  useAbiEncodedQueryState,
  userOperationsParser,
} from "@lightdotso/nuqs";
import type { devFormSchema } from "@lightdotso/schemas";
import { abi } from "@lightdotso/schemas";
import { useModals } from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { FooterButton } from "@lightdotso/templates/footer-button";
import { useIsInsideModal } from "@lightdotso/templates/modal";
import { Button } from "@lightdotso/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lightdotso/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormMessage,
} from "@lightdotso/ui/components/form";
import { Input } from "@lightdotso/ui/components/input";
import { Label } from "@lightdotso/ui/components/label";
import { getChainWithChainId } from "@lightdotso/utils";
import { lightWalletAbi } from "@lightdotso/wagmi";
import { useBalance } from "@lightdotso/wagmi/wagmi";
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

  const formChainId = form.getValues("chainId");
  const formValue = form.getValues("value");

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const balance = useBalance({
    address: address as Address,
    chainId: formChainId,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  const userOperationsParams = useMemo(() => {
    if (
      !(
        formChainId &&
        abiEncoded &&
        balance &&
        balance.data &&
        abiEncoded.address
      )
    ) {
      return;
    }

    const value = formValue ? formValue * 10 ** balance.data?.decimals : 0;

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
  }, [abiEncoded, formChainId, balance, formValue]);

  const href = useMemo(() => {
    if (!userOperationsParams) {
      return;
    }

    // biome-ignore lint/style/noNonNullAssertion:
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
  // Validation
  // ---------------------------------------------------------------------------

  // biome-ignore lint/suspicious/useAwait: <explanation>
  async function validateBalanceQuantity(quantity: number) {
    // If the quantity is empty, return
    if (!quantity) {
      form.setValue("value", 0);
    }

    // Check if the quantity is a number and more than the token balance
    if (quantity) {
      // If the token is not found or undefined, set an error
      if (!balance?.data) {
        // Show an error on the message
        form.setError("value", {
          type: "manual",
          message: "Value cannot be set",
        });
        // Clear the value of key address
        form.setValue("value", 0);
      } else if (quantity === 0) {
        form.setValue("value", 0);
      } else if (
        quantity * 10 ** balance?.data?.decimals >
        balance?.data?.value
      ) {
        // Show an error on the message
        form.setError("value", {
          type: "manual",
          message: "Insufficient balance",
        });
      } else {
        // If the quantity is valid, set the value of key quantity
        form.setValue("value", quantity);
        form.clearErrors("value");
      }
    }
  }

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
                const chain = getChainWithChainId(field.value);

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
                            onChainSelect: (chainId) => {
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
                            <ChainLogo className="mr-2" chainId={field.value} />
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
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormControl>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      {...field}
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="text"
                      placeholder="Your value in native token"
                      onBlur={(e) => {
                        // Validate the address
                        if (!e.target.value) {
                          // Clear the value of key address
                          form.setValue("value", 0);
                        }

                        const quantity = Number.parseFloat(e.target.value);

                        if (!Number.isNaN(quantity)) {
                          validateBalanceQuantity(quantity);
                        }
                      }}
                      onChange={(e) => {
                        // If the input ends with ".", or includes "." and ends with "0", set the value as string, as it can be assumed that the user is still typing
                        if (
                          e.target.value.endsWith(".") ||
                          (e.target.value.includes(".") &&
                            e.target.value.endsWith("0"))
                        ) {
                          field.onChange(e.target.value);
                        } else {
                          // Only parse to float if the value doesn't end with "."
                          field.onChange(
                            Number.parseFloat(e.target.value) || 0,
                          );
                        }

                        // Validate the number
                        const quantity = Number.parseFloat(e.target.value);

                        if (!Number.isNaN(quantity)) {
                          validateBalanceQuantity(quantity);
                        }
                      }}
                    />
                    <FormMessage />
                    <div className="mt-2 flex items-center justify-between text-text-weak text-xs">
                      <div>{/* tokenPrice could come here */}</div>
                      <div>
                        &nbsp;
                        {balance?.data?.decimals &&
                        typeof balance.data?.decimals === "number"
                          ? `${balance.data?.value / BigInt(10 ** balance.data?.decimals)} ${balance.data?.symbol} available`
                          : ""}
                      </div>
                    </div>
                  </div>
                </FormControl>
              )}
            />
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
      </CardContent>
    </Card>
  );
};
