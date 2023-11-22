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
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import type { FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { isAddress } from "viem";
import type { Address } from "viem";
import { normalize } from "viem/ens";
import * as z from "zod";
import {
  transferParser,
  useTransfersQueryState,
} from "@/app/(wallet)/[address]/send/(hooks)";
import type {
  Transfer,
  Transfers,
} from "@/app/(wallet)/[address]/send/(hooks)";
import { publicClient } from "@/clients/public";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import type { TokenData, WalletSettingsData } from "@/data";
import { queries } from "@/queries";
import { sendFormConfigurationSchema } from "@/schemas/sendForm";
import { useAuth } from "@/stores/useAuth";
import { successToast } from "@/utils/toast";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof sendFormConfigurationSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SendDialogProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SendDialog: FC<SendDialogProps> = ({ address }) => {
  const { address: userAddress, ens: userEns } = useAuth();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const walletSettings: WalletSettingsData | undefined =
    useQueryClient().getQueryData(queries.wallet.settings(address).queryKey);

  const currentData: TokenData | undefined = useQueryClient().getQueryData(
    queries.token.list({
      address,
      is_testnet: walletSettings?.is_enabled_testnet,
    }).queryKey,
  );

  const { data } = useSuspenseQuery<TokenData | null>({
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

  const [transfers, setTransfers] = useTransfersQueryState();

  // create default transfer object
  const defaultTransfer: Transfer = useMemo(() => {
    return {
      address: userAddress,
      addressOrEns: userEns ?? userAddress,
      weight: 1,
    };
  }, [userAddress, userEns]);

  // The default values for the form
  const defaultValues: Partial<NewFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      transfers:
        defaultTransfer !== undefined &&
        transfers !== undefined &&
        transfers.length > 0
          ? transfers
          : [defaultTransfer],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTransfer]);

  const form = useForm<NewFormValues>({
    mode: "onChange",
    resolver: zodResolver(
      sendFormConfigurationSchema.superRefine((value, ctx) => {
        // Check if no two transfers have the same address
        const addresses = value.transfers
          .map(transfer => transfer?.address)
          .filter(address => address && address.trim() !== "");
        const uniqueAddresses = new Set(addresses);
        if (uniqueAddresses.size !== addresses.length) {
          // Add an error to the duplicate address
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate address",
            path: ["duplicate"],
          });
        }

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

  useEffect(() => {
    const subscription = form.watch((value, { name: _name }) => {
      if (Array.isArray(value.transfers)) {
        if (value.transfers === undefined) {
          setTransfers(null);
        } else {
          // Iterate over each transfer which has a weight
          const transfers = value.transfers.filter(
            transfer => transfer?.weight && transfer?.address,
          ) as Transfers;
          setTransfers(transfers);
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

  const navigateToStep = useCallback(() => {
    const url = new URL(window.location.origin);
    url.searchParams.set("transfers", transferParser.serialize(transfers));
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfers]);

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

  function onSubmit(data: NewFormValues) {
    successToast(data);
    navigateToStep();
  }

  return (
    <div className="grid gap-10">
      <TooltipProvider delayDuration={300}>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Accordion
                  key={index}
                  collapsible
                  className="rounded-md border border-border bg-background-weak p-6"
                  type="single"
                >
                  <AccordionItem className="border-0" value="item-1">
                    <AccordionTrigger>Recepient</AccordionTrigger>
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
                              <Label htmlFor="address">Address or ENS</Label>
                              <div className="flex items-center space-x-3">
                                <div className="relative inline-block w-full">
                                  <Input
                                    id="address"
                                    className="pl-12"
                                    {...field}
                                    placeholder="Your address or ENS name"
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
                                        validateAddress(address, index);
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
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`transfers.${index}.weight`}
                          render={({ field }) => (
                            <>
                              <FormControl>
                                <div className="">
                                  <Label htmlFor="weight">Transfer</Label>
                                  <Select
                                    defaultValue={field.value.toString()}
                                    onValueChange={value => {
                                      form.trigger();
                                      field.onChange(parseInt(value));
                                    }}
                                    onOpenChange={() => {}}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-24">
                                        <SelectValue placeholder="Select your wallet threshold" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60">
                                      {[...Array(data?.length)].map((_, i) => (
                                        <SelectItem
                                          key={i}
                                          value={(i + 1).toString()}
                                        >
                                          {i + 1}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </div>
                              </FormControl>
                            </>
                          )}
                        />
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
                  append({ addressOrEns: "", weight: 1 });
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
                disabled={!form.formState.isValid}
                variant={form.formState.isValid ? "default" : "outline"}
                type="submit"
                onClick={() => navigateToStep()}
              >
                Continue
              </Button>
            </CardFooter>
          </form>
        </Form>
      </TooltipProvider>
    </div>
  );
};
