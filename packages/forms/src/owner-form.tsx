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
import {
  CONFIGURATION_MAX_THRESHOLD,
  CONFIGURATION_MAX_WEIGHT,
} from "@lightdotso/const";
import { PlaceholderOrb } from "@lightdotso/elements";
import { useConfigurationOperationCreate } from "@lightdotso/hooks";
import { useOwnersQueryState, useThresholdQueryState } from "@lightdotso/nuqs";
import type { Owner, Owners } from "@lightdotso/nuqs";
import { useQueryConfiguration } from "@lightdotso/query";
import { ownerFormSchema } from "@lightdotso/schemas";
import { useAuth, useFormRef, useModals, useNewForm } from "@lightdotso/stores";
import {
  Avatar,
  Button,
  ButtonIcon,
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
  Separator,
  toast,
} from "@lightdotso/ui";
import { cn, debounce } from "@lightdotso/utils";
import { publicClient } from "@lightdotso/wagmi";
import { isEmpty } from "lodash";
import { Trash2Icon, UserPlus2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { Address } from "viem";
import { isAddress, isAddressEqual } from "viem";
import { normalize } from "viem/ens";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type OwnerFormValues = z.infer<typeof ownerFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const OwnerForm: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress, ens: userEns, wallet } = useAuth();
  const { setIsFormDisabled, setFormControl } = useFormRef();
  const { setFormValues, fetchToCreate } = useNewForm();
  const {
    ownerModalProps: { initialOwners, initialThreshold },
  } = useModals();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [threshold, setThreshold] = useThresholdQueryState();
  const [owners, setOwners] = useOwnersQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // create default owner object
  const defaultOwner: Owner = useMemo(() => {
    return {
      address: userAddress,
      addressOrEns: userEns ?? userAddress,
      weight: 1,
    };
  }, [userAddress, userEns]);

  // The default values for the form
  const defaultValues: Partial<OwnerFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      threshold:
        initialThreshold !== undefined
          ? initialThreshold
          : threshold &&
              ownerFormSchema.shape.threshold.safeParse(threshold).success
            ? ownerFormSchema.shape.threshold.parse(threshold)
            : 1,
      // If type is personal, add two owners
      owners:
        initialOwners.length > 0
          ? initialOwners
          : owners !== undefined && owners.length > 0
            ? owners
            : [defaultOwner],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOwners, initialThreshold]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<OwnerFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(
      ownerFormSchema.superRefine((value, ctx) => {
        // The sum of the weights of all owners must be greater than or equal to the threshold.
        const sum = value.owners.reduce((acc, owner) => acc + owner.weight, 0);

        if (sum < value.threshold) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            message:
              "The sum of the weights of all owners must be greater than or equal to the threshold.",
            minimum: value.threshold,
            path: ["threshold"],
            type: "number",
            inclusive: true,
          });
        }

        // Check if no two owners have the same address
        const addresses = value.owners
          .map((owner) => owner?.address)
          .filter((address) => address && address.trim() !== "");
        const uniqueAddresses = new Set(addresses);
        if (uniqueAddresses.size !== addresses.length) {
          // Add an error to the duplicate address
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate address",
            path: ["duplicate"],
          });
        }

        // Also expect that all owners w/ key address are valid addresses and are not empty
        value.owners.forEach((owner, index) => {
          // Check if the address is not empty
          if (!owner.address) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Address is required",
              path: ["owners", index, "address"],
            });
          }

          // if (owner.addressOrEns) {
          //   validateAddress(owner.addressOrEns, index);
          // }

          if (owner.address && !isAddress(owner.address)) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_type,
              message: "Invalid address",
              path: ["owners", index, "address"],
              expected: "string",
              received: "string",
            });
          }
        });
      }),
    ),
    defaultValues: defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "owners",
    control: form.control,
  });

  const formThreshold = form.watch("threshold");
  const formOwners = form.watch("owners");

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // @ts-ignore
      setFormValues(value);

      // Fetch the configuration to create the wallet (simulation)
      fetchToCreate(false);

      if (defaultValues.threshold) {
        setThreshold(defaultValues.threshold);
      }

      if (name === "threshold") {
        if (typeof value.threshold === "undefined") {
          setThreshold(null);
        } else {
          // Set the threshold if the value is valid integer
          if (ownerFormSchema.shape.threshold.safeParse(value)) {
            setThreshold(value.threshold);
          }
        }
      }

      if (Array.isArray(value.owners)) {
        if (typeof value.owners === "undefined") {
          setOwners(null);
        } else {
          // Iterate over each owner which has a weight
          const owners = value.owners.filter(
            (owner) => owner?.weight && owner?.address,
          ) as Owners;
          setOwners(owners);
        }
      }

      return;
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Set the form values from the URL on mount
  useEffect(() => {
    // Recursively iterate the owners and validate the addresses on mount
    owners.forEach((owner, index) => {
      if (owner.address) {
        validateAddress(owner.address, index);
      }
    });

    if (defaultValues.threshold) {
      setThreshold(defaultValues.threshold);
    }

    if (defaultValues.owners) {
      setOwners(defaultValues.owners);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: wallet,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  const owner = useMemo(() => {
    if (!userAddress) {
      return;
    }

    return configuration?.owners?.find((owner) =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [configuration?.owners, userAddress]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setIsFormDisabled(!isFormValid);
  }, [isFormValid, setIsFormDisabled]);

  // useEffect(() => {
  //   setIsFormLoading(isConfigurationOperationCreatePending);
  // }, [isConfigurationOperationCreatePending, setIsFormLoading]);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isConfigurationOperationCreatable, signConfigurationOperation } =
    useConfigurationOperationCreate({
      address: wallet as Address,
      params: {
        threshold: formThreshold as number,
        owners: formOwners.map((owner: Owner) => ({
          address: owner.address as string,
          weight: owner.weight,
        })),
        ownerId: owner?.id,
      },
    });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  async function onSubmit() {
    if (!userAddress) {
      toast.error("Please connect your wallet to continue.");
      return;
    }

    if (!isConfigurationOperationCreatable) {
      toast.error("You are not an owner of this wallet.");
      return;
    }

    signConfigurationOperation();
  }
  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  async function validateAddress(address: string, index: number) {
    // Try to parse the address
    if (isAddress(address)) {
      // If the address is valid, set the value of key address
      form.setValue(`owners.${index}.address`, address);
      form.clearErrors(`owners.${index}.addressOrEns`);
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
          .then((ensNameAddress) => {
            if (ensNameAddress) {
              // If the ENS name resolves, set the value of key address
              form.setValue(`owners.${index}.address`, ensNameAddress);
              form.clearErrors(`owners.${index}.addressOrEns`);
            } else {
              // Show an error on the message
              form.setError(`owners.${index}.addressOrEns`, {
                type: "manual",
                message:
                  "The ENS name did not resolve. Please enter a valid address or ENS name",
              });
            }
          })
          .catch(() => {
            // Show an error on the message
            form.setError(`owners.${index}.addressOrEns`, {
              type: "manual",
              message: "Please enter a valid address or ENS name",
            });
          });
      } catch {
        // Show an error on the message
        form.setError(`owners.${index}.addressOrEns`, {
          type: "manual",
          message: "Please enter a valid address or ENS name",
        });
        // Clear the value of key address
        form.setValue(`owners.${index}.address`, "0x");
      }
    } else {
      // Clear the value of key address
      form.setValue(`owners.${index}.address`, "0x");
    }
  }

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const debouncedValidateAddress = debounce(validateAddress, 300);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Form {...form}>
      <form
        id="owner-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={index}>
              {/* A hack to make a padding above the separator */}
              {index === 1 && <div className="pt-4" />}
              {/* If the type is personal, add a separator on index 1 */}
              {index === 1 && <Separator />}
              {/* A hack to make a padding below the separator */}
              {index === 1 && <div className="pb-6" />}
              <FormLabel
                className={cn(index > 1 && "sr-only", index !== 0 && "sr-only")}
              >
                {index === 0 && "Primary Key"}
                {index === 1 && "Backup Keys"}
                Owners
              </FormLabel>
              <FormDescription
                className={cn(
                  index > 1 && "sr-only",
                  index !== 0 && "sr-only",
                  index === 0 && "mb-6",
                )}
              >
                Add the owner and their corresponding weight.
              </FormDescription>
              <FormItem
                key={field.id}
                className="grid grid-cols-8 gap-4 space-y-0"
              >
                <FormField
                  control={form.control}
                  name={`owners.${index}.addressOrEns`}
                  render={({ field }) => (
                    <div className="col-span-6 space-y-2">
                      <Label htmlFor="address">Address or ENS</Label>
                      <div className="flex items-center space-x-3">
                        <div className="relative inline-block w-full">
                          <Input
                            id="address"
                            className="pl-12"
                            {...field}
                            placeholder="Your address or ENS name"
                            onBlur={(e) => {
                              // Validate the address
                              if (!e.target.value) {
                                // Clear the value of key address
                                form.setValue(`owners.${index}.address`, "0x");
                              }
                              const address = e.target.value;

                              validateAddress(address, index);
                            }}
                            onChange={(e) => {
                              // Update the field value
                              field.onChange(e.target.value || "");

                              // Validate the address
                              const address = e.target.value;

                              if (address) {
                                debouncedValidateAddress(address, index);
                              }
                            }}
                          />
                          <div className="absolute inset-y-0 left-3 flex items-center">
                            <Avatar className="size-6">
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
                                  form.formState.errors.owners?.[index]
                                    ?.addressOrEns
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
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`owners.${index}.weight`}
                  render={({ field }) => (
                    <FormControl>
                      <div className="col-span-1 space-y-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Select
                          defaultValue={field.value.toString()}
                          onValueChange={(value) => {
                            field.onChange(Number.parseInt(value));
                            form.trigger(`owners.${index}.weight`);
                            form.trigger("threshold");
                          }}
                          onOpenChange={() => {
                            form.trigger(`owners.${index}.weight`);
                            form.trigger("threshold");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Select your wallet threshold" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {[...Array(CONFIGURATION_MAX_WEIGHT)].map(
                              (_, i) => (
                                <SelectItem key={i} value={(i + 1).toString()}>
                                  {i + 1}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </FormControl>
                  )}
                />
                <div
                  className={cn(
                    "col-span-1 flex h-full flex-col items-center",
                    // If there is error, justify center, else end
                    form.formState.errors.owners?.[index]?.addressOrEns
                      ? "justify-center"
                      : "justify-end",
                  )}
                >
                  <ButtonIcon
                    disabled={fields.length < 2}
                    variant="outline"
                    className="mt-1.5 rounded-full"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <Trash2Icon className="size-5" />
                  </ButtonIcon>
                </div>
              </FormItem>
            </div>
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
            }}
          >
            <UserPlus2 className="mr-2 size-5" />
            Add New Owner
          </Button>
        </div>
        <FormField
          control={form.control}
          name="threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="threshold">Threshold</FormLabel>
              <div className="grid gap-3">
                <FormControl>
                  <Select
                    defaultValue={field.value.toString()}
                    onOpenChange={() => {
                      form.trigger("threshold");
                    }}
                    onValueChange={(value) => {
                      field.onChange(Number.parseInt(value));
                      form.trigger("threshold");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Select your wallet threshold" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...Array(CONFIGURATION_MAX_THRESHOLD)].map((_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </div>
              <FormDescription>
                Enter a threshold for your new wallet
              </FormDescription>
              <FormMessage />
              {form.formState.errors && (
                <p className="font-medium text-sm text-text-destructive">
                  {/* Print any message one line at a time */}
                  {Object.entries(form.formState.errors)
                    .filter(
                      ([key]) =>
                        !key.startsWith("threshold") &&
                        !key.startsWith("owners"),
                    )
                    .map(([_key, error]: [string, any]) => error.message)
                    .join("\n")}
                </p>
              )}
              {/* Show all errors for debugging */}
              {/* <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre> */}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
