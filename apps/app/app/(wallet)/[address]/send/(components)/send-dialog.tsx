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

"use client";

import { getTokens } from "@lightdotso/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  Button,
  CardFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TooltipProvider,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, UserPlus2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { isAddress, encodeFunctionData } from "viem";
import type { Address, Hex } from "viem";
import { normalize } from "viem/ens";
import * as z from "zod";
import { useTransfersQueryState } from "@/app/(wallet)/[address]/send/(hooks)";
import { publicClient } from "@/clients/public";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import type { TokenData, WalletSettingsData } from "@/data";
import { queries } from "@/queries";
import type { Transfer, Transfers } from "@/schemas";
import { sendFormConfigurationSchema } from "@/schemas/sendForm";
import { debounce } from "@/utils";
import { lightWalletABI } from "@/wagmi";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof sendFormConfigurationSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SendDialogProps = {
  address: Address;
  initialTransfers?: Transfers;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SendDialog: FC<SendDialogProps> = ({
  address,
  initialTransfers,
}) => {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const walletSettings: WalletSettingsData | undefined =
    useQueryClient().getQueryData(queries.wallet.settings(address).queryKey);

  const currentData: TokenData[] | undefined = useQueryClient().getQueryData(
    queries.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
  );

  const { data: tokens } = useSuspenseQuery<TokenData[] | null>({
    queryKey: queries.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
    queryFn: async () => {
      const res = await getTokens({
        params: {
          query: {
            address,
            is_testnet: walletSettings?.is_enabled_testnet,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Query State
  // ---------------------------------------------------------------------------

  const [transfers, setTransfers] = useTransfersQueryState(
    initialTransfers ?? [],
  );

  // ---------------------------------------------------------------------------
  // Default State
  // ---------------------------------------------------------------------------

  // create default transfer object
  const defaultTransfer: Transfers = useMemo(() => {
    // For each token, create a transfer object
    const transfers: Transfers =
      tokens && tokens?.length > 0
        ? [
            {
              address: undefined,
              addressOrEns: undefined,
              asset: {
                address: tokens[0].address,
                decimals: tokens[0].decimals,
                quantity: 0,
              },
            },
          ]
        : [];

    return transfers;
    // Only set on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The default values for the form
  const defaultValues: Partial<NewFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      transfers:
        transfers && transfers !== undefined && transfers.length > 0
          ? transfers
          : defaultTransfer,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTransfer]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<NewFormValues>({
    mode: "onChange",
    resolver: zodResolver(
      sendFormConfigurationSchema.superRefine((value, ctx) => {
        // Check if no two transfers have the same address and asset address + chainId
        const duplicateTransfers = value.transfers.filter(
          (transfer, index, self) =>
            index !==
            self.findIndex(
              t =>
                t.address === transfer.address &&
                t?.asset?.address === transfer?.asset?.address &&
                t?.chainId === transfer?.chainId,
            ),
        );
        if (duplicateTransfers.length > 0) {
          // Note: This is a hacky way to get the last duplicate index
          const transfersAsStrings = value.transfers.map(transfer =>
            JSON.stringify(transfer),
          );
          const duplicateTransferString = JSON.stringify(duplicateTransfers[0]);
          const lastDuplicateIndex = transfersAsStrings.lastIndexOf(
            duplicateTransferString,
          );

          // Show an error on the message
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate transfer",
            path: ["transfers", lastDuplicateIndex, "addressOrEns"],
          });
        }

        // Create a map to calculate the total quantity by token address
        const totalByTokenAddress = new Map();

        value.transfers.forEach((transfer, index) => {
          // Check if asset and the quantity is not empty
          if (transfer && transfer.asset && "quantity" in transfer.asset) {
            if (!transfer.asset.quantity) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Quantity is required",
                path: ["transfers", index, "asset", "quantity"],
              });
            } else if (transfer.asset.quantity > 0) {
              // If the quantity is valid, get the token balance
              const token =
                tokens &&
                transfers &&
                transfers?.length > 0 &&
                transfers[index]?.asset?.address &&
                tokens?.find(
                  token =>
                    token.address ===
                    (transfers?.[index]?.asset?.address || ""),
                );

              // If the token is not found or undefined, set an error
              if (!token) {
                // Show an error on the message
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: "Please select a valid token",
                  path: ["transfers", index, "asset", "address"],
                });
              } else {
                // Add quantity to total by token address
                const totalQuantity =
                  totalByTokenAddress.get(token.address) || 0;
                totalByTokenAddress.set(
                  token.address,
                  totalQuantity + transfer.asset.quantity,
                );

                // Check if the sum quantity is greater than the token balance
                if (
                  totalByTokenAddress.get(token.address) *
                    Math.pow(10, token?.decimals) >
                  token?.amount
                ) {
                  // Show an error on the message
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Insufficient balance",
                    path: ["transfers", index, "asset", "quantity"],
                  });

                  // Show the balance in all fields w/ same token address and chainId
                  value.transfers.forEach((transfer, _index) => {
                    if (
                      transfer?.asset?.address === token?.address &&
                      transfer?.chainId === token?.chain_id
                    ) {
                      ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Insufficient balance",
                        path: ["transfers", _index, "asset", "quantity"],
                      });
                    }
                  });
                }
              }
            }
          }
        });

        // Also expect that all transfers w/ key address are valid addresses and are not empty
        value.transfers.forEach((transfer, index) => {
          // Check if the address is not empty
          if (!transfer.address) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Address is required",
              path: ["transfers", index, "address"],
            });
          }

          if (transfer.address && !isAddress(transfer.address)) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_type,
              message: "Invalid address",
              path: ["transfers", index, "address"],
              expected: "string",
              received: "string",
            });
          }
        });
      }),
    ),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "transfers",
    control: form.control,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name: _name }) => {
      if (Array.isArray(value.transfers)) {
        if (value.transfers === undefined) {
          setTransfers(null);
        } else {
          // @ts-expect-error
          setTransfers(value.transfers);
        }
      }

      return;
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Set the form values from the URL on mount
  useEffect(() => {
    // Recursively iterate the transfers and validate the addresses on mount
    transfers &&
      transfers.forEach((transfer, index) => {
        if (transfer.address) {
          validateAddress(transfer.address, index);
        }
      });

    if (defaultValues.transfers) {
      setTransfers(defaultValues.transfers);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const userOperationsParams = useMemo(() => {
    const encodeTransfer = (transfer: Transfer): [Address, bigint, Hex] => {
      if (
        transfer &&
        transfer.address &&
        transfer.asset &&
        transfer.assetType === "erc20" &&
        "quantity" in transfer.asset &&
        "decimals" in transfer.asset &&
        transfer.asset.address === "0x0000000000000000000000000000000000000000"
      ) {
        return [
          transfer.address as Address,
          BigInt(
            transfer.asset.quantity! * Math.pow(10, transfer.asset?.decimals!),
          ),
          "0x" as Hex,
        ];
      }

      return [transfer.address as Address, 0n, "0x" as Hex];
    };

    // Get the call data of the first transfer
    if (!transfers || transfers?.length === 0 || !form.formState.isValid) {
      return "0x";
    }

    if (
      transfers?.length === 1 &&
      transfers[0].address &&
      isAddress(transfers[0].address) &&
      transfers[0].asset
    ) {
      return `${transfers[0].chainId}:_:${encodeFunctionData({
        abi: lightWalletABI,
        functionName: "execute",
        args: encodeTransfer(transfers[0]) as [Address, bigint, Hex],
      })}`;
    }

    if (transfers?.length > 1) {
      // Create a map w/ transfer grouped by chainId
      const transfersByChainId: Map<number, Transfer[]> = new Map();
      transfers.forEach(transfer => {
        if (!transfer.chainId) {
          return;
        }
        const transfers = transfersByChainId.get(transfer.chainId) || [];
        transfersByChainId.set(transfer.chainId, [...transfers, transfer]);
      });

      // Create the user operations params for each chainId
      const userOperationsParams = [];
      // If the transfer count is one, encode as `execute`
      for (const [chainId, transfers] of transfersByChainId.entries()) {
        if (transfers.length === 1) {
          userOperationsParams.push(
            `${chainId}:_:${encodeFunctionData({
              abi: lightWalletABI,
              functionName: "execute",
              args: encodeTransfer(transfers[0]) as [Address, bigint, Hex],
            })}}`,
          );
        } else {
          // Encode the transfers for each item
          const encodedTransfers = transfers.map(transfer =>
            encodeTransfer(transfer),
          );
          // If the transfer count is more than one, encode as `executeBatch`
          userOperationsParams.push(
            `${chainId}:_:${encodeFunctionData({
              abi: lightWalletABI,
              functionName: "executeBatch",
              args: [
                encodedTransfers.map(transfer => transfer[0]),
                encodedTransfers.map(transfer => transfer[1]),
                encodedTransfers.map(transfer => transfer[2]),
              ] as [Address[], bigint[], Hex[]],
            })}}`,
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfers, form.formState]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  async function validateAddress(address: string, index: number) {
    // If the address is empty, return
    if (!address || address.length <= 3) return;

    // Try to parse the address
    if (isAddress(address)) {
      // If the address is valid, set the value of key address
      form.setValue(`transfers.${index}.address`, address);
      form.clearErrors(`transfers.${index}.addressOrEns`);
    } else if (
      address &&
      address.length > 3 &&
      address.includes(".") &&
      /[a-zA-Z]/.test(address)
    ) {
      // If the address is not valid, try to resolve it as an ENS name
      try {
        publicClient
          .getEnsAddress({
            name: normalize(address),
          })
          .then(ensNameAddress => {
            if (ensNameAddress) {
              // If the ENS name resolves, set the value of key address
              form.setValue(`transfers.${index}.address`, ensNameAddress);
            } else {
              // Show an error on the message
              form.setError(`transfers.${index}.addressOrEns`, {
                type: "manual",
                message:
                  "The ENS name did not resolve. Please enter a valid address or ENS name",
              });
              // Clear the value of key address
              form.setValue(`transfers.${index}.address`, "");
            }

            // Trigger the form validation
            form.trigger();
          })
          .catch(() => {
            // Show an error on the message
            form.setError(`transfers.${index}.addressOrEns`, {
              type: "manual",
              message: "Please enter a valid address or ENS name",
            });
            // Clear the value of key address
            form.setValue(`transfers.${index}.address`, "");

            // Trigger the form validation
            form.trigger();
          });
      } catch {
        // Show an error on the message
        form.setError(`transfers.${index}.addressOrEns`, {
          type: "manual",
          message: "Please enter a valid address or ENS name",
        });
        // Clear the value of key address
        form.setValue(`transfers.${index}.address`, "");
      } finally {
        // Trigger the form validation
        form.trigger();
      }
    } else {
      // Clear the value of key address
      form.setValue(`transfers.${index}.address`, "");

      // Trigger the form validation
      form.trigger();
    }
  }

  async function validateQuantity(quantity: number, index: number) {
    // If the quantity is empty, return
    if (!quantity) return;

    // Check if the quantity is a number and more than the token balance
    if (quantity && quantity > 0) {
      // If the quantity is valid, get the token balance
      const token =
        tokens &&
        transfers &&
        transfers?.length > 0 &&
        transfers[index]?.asset?.address &&
        tokens?.find(
          token => token.address === (transfers?.[index]?.asset?.address || ""),
        );

      // If the token is not found or undefined, set an error
      if (!token) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "Please select a valid token",
        });
        // Clear the value of key address
        form.setValue(`transfers.${index}.asset.quantity`, 0);
      } else if (quantity * Math.pow(10, token?.decimals) > token?.amount) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "Insufficient balance",
        });
        // Clear the value of key address
        // form.setValue(`transfers.${index}.asset.quantity`, 0);
      } else {
        // If the quantity is valid, set the value of key quantity
        form.setValue(`transfers.${index}.asset.quantity`, quantity);
        form.clearErrors(`transfers.${index}.asset.quantity`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const debouncedValidateAddress = debounce(validateAddress, 300);

  return (
    <div className="grid gap-10">
      <TooltipProvider delayDuration={300}>
        <Form {...form}>
          <form className="space-y-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Accordion
                  key={index}
                  collapsible
                  className="rounded-md border border-border bg-background-weak p-6"
                  type="single"
                >
                  <AccordionItem className="border-0" value={`value-${index}`}>
                    <AccordionTrigger>Transfer #{index}</AccordionTrigger>
                    <AccordionContent className="p-2">
                      <FormItem
                        key={field.id}
                        className="grid grid-cols-8 gap-4 space-y-0"
                      >
                        <FormField
                          control={form.control}
                          name={`transfers.${index}.addressOrEns`}
                          render={({ field }) => (
                            <div className="col-span-7 space-y-2">
                              <Label htmlFor="address">
                                Recepient Address or ENS
                              </Label>
                              <div className="flex items-center space-x-3">
                                <div className="relative inline-block w-full">
                                  <Input
                                    className="pl-12"
                                    {...field}
                                    placeholder="Recepient's Address or ENS name"
                                    onBlur={e => {
                                      // Validate the address
                                      if (!e.target.value) {
                                        // Clear the value of key address
                                        form.setValue(
                                          `transfers.${index}.address`,
                                          "",
                                        );
                                      }
                                      const address = e.target.value;

                                      validateAddress(address, index);
                                    }}
                                    onChange={e => {
                                      // Update the field value
                                      field.onChange(e.target.value || "");

                                      // Validate the address
                                      const address = e.target.value;

                                      if (address) {
                                        debouncedValidateAddress(
                                          address,
                                          index,
                                        );
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-y-0 left-3 flex items-center">
                                    <Avatar className="h-6 w-6">
                                      {/* If the address is valid, try resolving an ens Avatar */}
                                      <PlaceholderOrb
                                        address={
                                          // If the address is a valid address
                                          field?.value && isAddress(field.value)
                                            ? field?.value
                                            : "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"
                                        }
                                        className={cn(
                                          // If the field is not valid, add opacity
                                          form.formState.errors.transfers &&
                                            form.formState.errors.transfers[
                                              index
                                            ] &&
                                            form.formState.errors.transfers[
                                              index
                                            ]?.addressOrEns
                                            ? "opacity-50"
                                            : "opacity-100",
                                        )}
                                      />
                                    </Avatar>
                                  </div>
                                </div>
                              </div>
                              <FormMessage />
                            </div>
                          )}
                        />
                        <div
                          className={cn(
                            "flex h-full flex-col col-span-1",
                            // If there is error, justify center, else end
                            form.formState.errors.transfers &&
                              form.formState.errors.transfers[index] &&
                              form.formState.errors.transfers[index]
                                ?.addressOrEns
                              ? "justify-center"
                              : "justify-end",
                          )}
                        >
                          <Button
                            type="button"
                            disabled={fields.length < 2}
                            variant="outline"
                            size="icon"
                            className="mt-1.5 rounded-full"
                            onClick={() => {
                              remove(index);
                              form.trigger();
                            }}
                          >
                            <Trash2Icon className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="col-span-7 flex space-x-3">
                          <div className="relative col-span-4 inline-block w-full">
                            <FormField
                              control={form.control}
                              name={`transfers.${index}.asset.quantity`}
                              render={({ field }) => (
                                <div className="space-y-2">
                                  <Label htmlFor="address">Quantity</Label>
                                  <div className="flex items-center space-x-3">
                                    <div className="relative inline-block w-full">
                                      <Input
                                        id="address"
                                        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        type="number"
                                        {...field}
                                        placeholder="Quantity of tokens to transfer"
                                        onBlur={e => {
                                          // Validate the address
                                          if (!e.target.value) {
                                            // Clear the value of key address
                                            form.setValue(
                                              `transfers.${index}.asset.quantity`,
                                              0,
                                            );
                                          }

                                          const quantity = parseFloat(
                                            e.target.value,
                                          );

                                          validateQuantity(quantity, index);
                                        }}
                                        onChange={e => {
                                          // Update the field value
                                          field.onChange(
                                            parseFloat(e.target.value) || 0,
                                          );

                                          // Validate the address
                                          const quantity = parseFloat(
                                            e.target.value,
                                          );

                                          if (quantity) {
                                            validateQuantity(quantity, index);
                                          }
                                        }}
                                      />
                                      <div className="absolute inset-y-0 right-3 flex items-center">
                                        <Button
                                          size="unsized"
                                          variant="outline"
                                          type="button"
                                          className="px-1 py-0.5 text-xs"
                                          onClick={() => {
                                            // Set the value of key quantity to the token balance
                                            const token =
                                              tokens &&
                                              transfers &&
                                              transfers?.length > 0 &&
                                              transfers[index]?.asset
                                                ?.address &&
                                              tokens?.find(
                                                token =>
                                                  token.address ===
                                                  (transfers?.[index]?.asset
                                                    ?.address || ""),
                                              );
                                            if (token) {
                                              form.setValue(
                                                `transfers.${index}.asset.quantity`,
                                                token?.amount /
                                                  Math.pow(10, token?.decimals),
                                              );
                                            }

                                            // Validate the form
                                            form.trigger();
                                          }}
                                        >
                                          Max
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-text-weak">
                                    <div>
                                      {/* Get the current balance in USD */}
                                      {tokens &&
                                        tokens?.length > 0 &&
                                        (() => {
                                          const token = tokens.find(
                                            token =>
                                              token.address ===
                                              (transfers?.[index]?.asset
                                                ?.address || ""),
                                          );
                                          return token
                                            ? "~ $" +
                                                // Get the current selected token balance in USD
                                                (
                                                  (token?.balance_usd /
                                                    (token.amount /
                                                      Math.pow(
                                                        10,
                                                        token?.decimals,
                                                      ))) *
                                                  // Get the form value
                                                  (field.value ?? 0)
                                                ).toFixed(2)
                                            : "";
                                        })()}
                                    </div>
                                    <div>
                                      {tokens &&
                                        tokens?.length > 0 &&
                                        (() => {
                                          const token = tokens.find(
                                            token =>
                                              token.address ===
                                                (transfers?.[index]?.asset
                                                  ?.address || "") &&
                                              token.chain_id ===
                                                transfers?.[index]?.chainId,
                                          );
                                          return token
                                            ? (
                                                token?.amount /
                                                Math.pow(10, token?.decimals)
                                              ).toString() +
                                                ` ${token.symbol} available`
                                            : "";
                                        })()}
                                    </div>
                                  </div>
                                  <FormMessage />
                                </div>
                              )}
                            />
                          </div>
                          <div className="relative col-span-3 inline-block w-full">
                            <FormField
                              key={field.id}
                              control={form.control}
                              name={`transfers.${index}.asset.address`}
                              render={({ field: _field }) => (
                                <FormControl>
                                  <div className="w-full space-y-2">
                                    <Label htmlFor="weight">Transfer</Label>
                                    <Select
                                      defaultValue={
                                        transfers &&
                                        transfers?.length > 0 &&
                                        transfers[index]?.asset?.address &&
                                        transfers[index]?.chainId
                                          ? `${transfers[index]?.asset?.address}-${transfers[index]?.chainId}`
                                          : undefined
                                      }
                                      onValueChange={value => {
                                        // Get the token of address and chainId
                                        const [address, chainId] =
                                          value?.split("-") || [];

                                        // Set the chainId of the token
                                        const token =
                                          tokens &&
                                          tokens?.length > 0 &&
                                          tokens?.find(
                                            token => token.address === address,
                                          );

                                        if (token) {
                                          form.setValue(
                                            `transfers.${index}.asset.address`,
                                            address,
                                          );
                                          form.setValue(
                                            `transfers.${index}.chainId`,
                                            parseInt(chainId),
                                          );
                                          form.setValue(
                                            `transfers.${index}.assetType`,
                                            "erc20",
                                          );
                                        }

                                        form.trigger();
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Select a token" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {tokens?.map(token => (
                                          <SelectItem
                                            key={`${token.address}-${token.chain_id}`}
                                            value={`${token.address}-${token.chain_id}`}
                                          >
                                            {token.symbol}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </div>
                                </FormControl>
                              )}
                            />
                          </div>
                        </div>
                      </FormItem>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-6"
                onClick={() => {
                  append({ address: "", addressOrEns: "" });
                  form.trigger();
                }}
              >
                <UserPlus2 className="mr-2 h-5 w-5" />
                Add Transfer
              </Button>
            </div>
            <CardFooter className="flex justify-between px-0 pt-12">
              <Button
                variant="outline"
                onClick={() => {
                  router.back();
                }}
              >
                Cancel
              </Button>
              <Button
                asChild
                disabled={
                  !form.formState.isValid &&
                  typeof userOperationsParams !== "undefined"
                }
                variant={form.formState.isValid ? "default" : "outline"}
                type="submit"
              >
                <Link
                  href={`/${address}/op?userOperations=${userOperationsParams!}`}
                >
                  Continue
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </TooltipProvider>
    </div>
  );
};
