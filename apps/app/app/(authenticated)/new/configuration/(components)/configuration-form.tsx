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

import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
  FormLabel,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  TooltipProvider,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2Icon, UserPlus2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import type { FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import * as z from "zod";
import { steps } from "@/app/(authenticated)/new/(components)/root/root";
import {
  ownerParser,
  useNameQueryState,
  useOwnersQueryState,
  useSaltQueryState,
  useThresholdQueryState,
  useTypeQueryState,
} from "@/app/(authenticated)/new/(hooks)";
import type { Owner, Owners } from "@/app/(authenticated)/new/(hooks)";
import { publicClient } from "@/clients/public";
import { PlaceholderOrb } from "@/components/lightdotso/placeholder-orb";
import { MAX_THRESHOLD, MAX_WEIGHT } from "@/const/configuration";
import { newFormSchema, newFormConfigurationSchema } from "@/schemas/newForm";
import { useAuth } from "@/stores/useAuth";
import { useNewFormStore } from "@/stores/useNewForm";
import { debounce } from "@/utils/debounce";
import { successToast } from "@/utils/toast";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof newFormConfigurationSchema>;

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

function timestampToBytes32(timestamp: number): string {
  // Create a Buffer from the timestamp
  const buffer = Buffer.alloc(32); // we want 32 bytes, that is 64 hexadecimal characters
  buffer.writeBigInt64BE(BigInt(timestamp), 24); // write the timestamp starting from the 25th byte (zero-based), so the first 24 bytes will be zeros

  // Convert the buffer to a hexadecimal string with '0x' prefix
  return "0x" + buffer.toString("hex");
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ConfigurationForm: FC = () => {
  const { address: userAddress, ens: userEns } = useAuth();
  const router = useRouter();
  const { setFormValues, fetchToCreate } = useNewFormStore();

  // ---------------------------------------------------------------------------
  // Query State
  // ---------------------------------------------------------------------------

  const [name] = useNameQueryState();
  const [type] = useTypeQueryState();
  const [threshold, setThreshold] = useThresholdQueryState();
  const [salt, setSalt] = useSaltQueryState();
  const [owners, setOwners] = useOwnersQueryState();

  // ---------------------------------------------------------------------------
  // Default State
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
  const defaultValues: Partial<NewFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      threshold:
        threshold &&
        newFormConfigurationSchema.shape.threshold.safeParse(threshold).success
          ? newFormConfigurationSchema.shape.threshold.parse(threshold)
          : 1,
      salt:
        salt && newFormConfigurationSchema.shape.salt.safeParse(salt).success
          ? newFormConfigurationSchema.shape.salt.parse(salt)
          : timestampToBytes32(Math.floor(Date.now())),
      // If type is personal, add two owners
      owners:
        defaultOwner !== undefined && owners !== undefined && owners.length > 0
          ? owners
          : type === "personal"
            ? [
                { ...defaultOwner },
                { address: undefined, addressOrEns: undefined, weight: 2 },
              ]
            : [defaultOwner],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultOwner]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<NewFormValues>({
    mode: "onChange",
    resolver: zodResolver(
      newFormConfigurationSchema.superRefine((value, ctx) => {
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
          .map(owner => owner?.address)
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
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "owners",
    control: form.control,
  });

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // @ts-expect-error
      setFormValues(value);

      // Fetch the configuration to create the wallet (simulation)
      fetchToCreate(false);

      // Set the salt from the default values to the url
      if (defaultValues.salt) {
        // If the salt is valid, set the salt
        setSalt(defaultValues.salt);
      }
      if (defaultValues.threshold) {
        setThreshold(defaultValues.threshold);
      }

      if (name === "threshold") {
        if (value.threshold === undefined) {
          setThreshold(null);
        } else {
          // Set the threshold if the value is valid integer
          if (newFormConfigurationSchema.shape.threshold.safeParse(value)) {
            setThreshold(value.threshold);
          }
        }
      }

      if (Array.isArray(value.owners)) {
        if (value.owners === undefined) {
          setOwners(null);
        } else {
          // Iterate over each owner which has a weight
          const owners = value.owners.filter(
            owner => owner?.weight && owner?.address,
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
    // Set the form values from the default values
    setFormValues({
      ...defaultValues,
      name: name ?? "",
      type:
        type && newFormSchema.shape.type.safeParse(type).success
          ? newFormSchema.shape.type.parse(type)
          : "multi",
    });

    // Recursively iterate the owners and validate the addresses on mount
    owners.forEach((owner, index) => {
      if (owner.address) {
        validateAddress(owner.address, index);
      }
    });

    if (defaultValues.threshold) {
      setThreshold(defaultValues.threshold);
    }
    if (defaultValues.salt) {
      setSalt(defaultValues.salt);
    }
    if (defaultValues.owners) {
      setOwners(defaultValues.owners);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[2].href, window.location.origin);
    url.searchParams.set("name", name);
    url.searchParams.set("type", type);
    url.searchParams.set("threshold", threshold.toString());
    url.searchParams.set("salt", salt ?? "");
    url.searchParams.set("owners", ownerParser.serialize(owners));
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, type, threshold, salt, owners]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  async function validateAddress(address: string, index: number) {
    // If the address is empty, return
    if (!address || address.length <= 3) return;

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
          .then(ensNameAddress => {
            if (ensNameAddress) {
              // If the ENS name resolves, set the value of key address
              form.setValue(`owners.${index}.address`, ensNameAddress);
            } else {
              // Show an error on the message
              form.setError(`owners.${index}.addressOrEns`, {
                type: "manual",
                message:
                  "The ENS name did not resolve. Please enter a valid address or ENS name",
              });
              // Clear the value of key address
              form.setValue(`owners.${index}.address`, "");
            }

            // Trigger the form validation
            form.trigger();
          })
          .catch(() => {
            // Show an error on the message
            form.setError(`owners.${index}.addressOrEns`, {
              type: "manual",
              message: "Please enter a valid address or ENS name",
            });
            // Clear the value of key address
            form.setValue(`owners.${index}.address`, "");

            // Trigger the form validation
            form.trigger();
          });
      } catch {
        // Show an error on the message
        form.setError(`owners.${index}.addressOrEns`, {
          type: "manual",
          message: "Please enter a valid address or ENS name",
        });
        // Clear the value of key address
        form.setValue(`owners.${index}.address`, "");
      } finally {
        // Trigger the form validation
        form.trigger();
      }
    } else {
      // Clear the value of key address
      form.setValue(`owners.${index}.address`, "");

      // Trigger the form validation
      form.trigger();
    }
  }

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const debouncedValidateAddress = debounce(validateAddress, 300);

  function onSubmit(data: NewFormValues) {
    successToast(data);
    navigateToStep();
  }

  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-8">
      <CardHeader className="gap-3">
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Customize the configuration for your wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={index}>
                    {/* A hack to make a padding above the separator */}
                    {type === "personal" && index === 1 && (
                      <div className="pt-4" />
                    )}
                    {/* If the type is personal, add a separator on index 1 */}
                    {type === "personal" && index === 1 && <Separator />}
                    {/* A hack to make a padding below the separator */}
                    {type === "personal" && index === 1 && (
                      <div className="pb-6" />
                    )}
                    <FormLabel
                      className={cn(
                        type === "personal" && index > 1 && "sr-only",
                        type !== "personal" && index !== 0 && "sr-only",
                      )}
                    >
                      {type === "personal" && index === 0 && "Primary Key"}
                      {type === "personal" && index === 1 && "Backup Keys"}
                      {type !== "personal" && "Owners"}
                    </FormLabel>
                    <FormDescription
                      className={cn(
                        type === "personal" && index > 1 && "sr-only",
                        type !== "personal" && index !== 0 && "sr-only",
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
                                  onBlur={e => {
                                    // Validate the address
                                    if (!e.target.value) {
                                      // Clear the value of key address
                                      form.setValue(
                                        `owners.${index}.address`,
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
                                      debouncedValidateAddress(address, index);
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
                                        form.formState.errors.owners &&
                                          form.formState.errors.owners[index] &&
                                          form.formState.errors.owners[index]
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
                          <>
                            <FormControl>
                              <div className="col-span-1 space-y-2">
                                <Label htmlFor="weight">Weight</Label>
                                <Select
                                  defaultValue={field.value.toString()}
                                  onValueChange={value => {
                                    form.trigger();
                                    field.onChange(parseInt(value));
                                  }}
                                  onOpenChange={() => {
                                    form.trigger();
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-24">
                                      <SelectValue placeholder="Select your wallet threshold" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-60">
                                    {[...Array(MAX_WEIGHT)].map((_, i) => (
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
                      <div
                        className={cn(
                          "flex h-full flex-col col-span-1",
                          // If there is error, justify center, else end
                          form.formState.errors.owners &&
                            form.formState.errors.owners[index] &&
                            form.formState.errors.owners[index]?.addressOrEns
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
                    form.trigger();
                  }}
                >
                  <UserPlus2 className="mr-2 h-5 w-5" />
                  {type === "personal" && "Add Backup Key"}
                  {type !== "personal" && "Add New Owner"}
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
                          onValueChange={value =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Select your wallet threshold" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(MAX_THRESHOLD)].map((_, i) => (
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
                      <p className="text-sm font-medium text-text-destructive">
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
              <FormField
                control={form.control}
                name="check"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        onBlur={() => {
                          form.trigger();
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Save and continue
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <CardFooter className="flex justify-between px-0 pt-12">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.back();
                  }}
                >
                  Go Back
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
      </CardContent>
    </Card>
  );
};
