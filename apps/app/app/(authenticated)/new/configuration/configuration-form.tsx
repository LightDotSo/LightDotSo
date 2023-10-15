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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
  FormLabel,
  Input,
  Label,
  TooltipProvider,
  toast,
} from "@lightdotso/ui";
import { steps } from "../root";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewFormStore } from "@/stores/useNewForm";
import { newFormSchema, newFormConfigurationSchema } from "@/schemas/newForm";
import { UserMinus2, UserPlus2 } from "lucide-react";
import { isAddress } from "viem";
import { publicClient } from "@/clients/public";
import { cn } from "@lightdotso/utils";
import { normalize } from "viem/ens";
import { PlaceholderOrb } from "@/components/placeholder-orb";

type NewFormValues = z.infer<typeof newFormConfigurationSchema>;

function timestampToBytes32(timestamp: number): string {
  // Create a Buffer from the timestamp
  const buffer = Buffer.alloc(32); // we want 32 bytes, that is 64 hexadecimal characters
  buffer.writeBigInt64BE(BigInt(timestamp), 24); // write the timestamp starting from the 25th byte (zero-based), so the first 24 bytes will be zeros

  // Convert the buffer to a hexadecimal string with '0x' prefix
  return "0x" + buffer.toString("hex");
}

export function ConfigurationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFormValues } = useNewFormStore();

  const nameParam = searchParams.get("name");
  const typeParam = searchParams.get("type");
  const thresholdParam = searchParams.get("threshold");
  const saltParam = searchParams.get("salt");

  // create default owner object
  const defaultOwner = {
    address: "",
    weight: 1,
  };

  // create owners array
  let owners = [];

  let ownerIndex = 0;
  // Loop through the owners in the URL
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const addressParam = searchParams.get(`owners[${ownerIndex}][address]`);
    const weightParam = searchParams.get(`owners[${ownerIndex}][weight]`);

    // if both parameters for this index do not exist, stop parsing
    if ((!addressParam && !weightParam) || isNaN(parseInt(weightParam || ""))) {
      break;
    }

    let owner = { ...defaultOwner };

    // Parse and assign address
    if (
      addressParam &&
      weightParam &&
      newFormConfigurationSchema.shape.owners.element.safeParse({
        addressOrEns: addressParam,
        weight: parseInt(weightParam),
      }).success
    ) {
      owner = newFormConfigurationSchema.shape.owners.element.parse({
        addressOrEns: addressParam,
        weight: parseInt(weightParam),
      });
    }

    owners.push(owner);
    ownerIndex++;
  }

  // // This can come from your database or API.
  const defaultValues: Partial<NewFormValues> = {
    // Check if the type is valid
    threshold:
      thresholdParam &&
      newFormConfigurationSchema.shape.threshold.safeParse(
        parseInt(thresholdParam),
      ).success
        ? newFormConfigurationSchema.shape.threshold.parse(
            parseInt(thresholdParam),
          )
        : 0,
    salt:
      saltParam &&
      newFormConfigurationSchema.shape.salt.safeParse(saltParam).success
        ? newFormConfigurationSchema.shape.salt.parse(saltParam)
        : timestampToBytes32(Math.floor(Date.now())),
    owners: owners.length ? owners : [defaultOwner],
  };

  const form = useForm<NewFormValues>({
    mode: "onChange",
    resolver: zodResolver(newFormConfigurationSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "owners",
    control: form.control,
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const subscription = form.watch((value, { name }) => {
      // @ts-expect-error
      setFormValues(value);

      // Set the salt from the default values to the url
      if (defaultValues.salt) {
        url.searchParams.set("salt", defaultValues.salt);
      }

      if (name === "threshold") {
        if (value.threshold === undefined) {
          url.searchParams.delete("threshold");
        } else {
          // Set the threshold if the value is valid integer
          if (newFormConfigurationSchema.shape.threshold.safeParse(value)) {
            url.searchParams.set("threshold", value.threshold.toString());
          }
        }
      }

      if (Array.isArray(value.owners)) {
        value.owners.forEach((owner, index) => {
          // Return if the owner is undefined
          if (owner === undefined) {
            url.searchParams.delete(`owners[${index}][address]`);
          } else if (owner.addressOrEns) {
            url.searchParams.set(
              `owners[${index}][address]`,
              owner.addressOrEns,
            );
          } else {
            url.searchParams.delete(`owners[${index}][address]`);
          }

          if (owner === undefined) {
            url.searchParams.delete(`owners[${index}][weight]`);
          } else if (owner.weight) {
            url.searchParams.set(
              `owners[${index}][weight]`,
              owner.weight.toString(),
            );
          } else {
            url.searchParams.delete(`owners[${index}][weight]`);
          }
        });
      }

      // Delete all the owners that are not in the form
      let ownerIndex = value && value.owners ? value.owners.length : 0;

      // Loop through the owners in the URL
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const addressParam = url.searchParams.get(
          `owners[${ownerIndex}][address]`,
        );
        const weightParam = url.searchParams.get(
          `owners[${ownerIndex}][weight]`,
        );

        url.searchParams.delete(`owners[${ownerIndex}][address]`);
        url.searchParams.delete(`owners[${ownerIndex}][weight]`);

        // if either parameters for this index do not exist, stop parsing
        if (!addressParam || !weightParam) {
          break;
        }
        ownerIndex++;
      }

      router.replace(url.toString());
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
      name: nameParam ?? "",
      type:
        typeParam && newFormSchema.shape.type.safeParse(typeParam).success
          ? newFormSchema.shape.type.parse(typeParam)
          : "multi",
    });

    // Recursively iterate the owners and validate the addresses on mount
    let ownerIndex = 0;
    // Loop through the owners in the URL
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const addressParam = searchParams.get(`owners[${ownerIndex}][address]`);
      const weightParam = searchParams.get(`owners[${ownerIndex}][weight]`);

      // Validate the address
      if (addressParam) {
        validateAddress(addressParam, ownerIndex);
      }

      // if both parameters for this index do not exist, stop parsing
      if (
        (!addressParam && !weightParam) ||
        isNaN(parseInt(weightParam || ""))
      ) {
        break;
      }

      ownerIndex++;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[2].href, window.location.origin);
    url.search = searchParams.toString();
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  function validateAddress(address: string, index: number) {
    // Try to parse the address
    if (isAddress(address)) {
      // If the address is valid, set the value of key address
      form.setValue(`owners.${index}.address`, address);
      form.clearErrors(`owners.${index}.addressOrEns`);
    } else if (address.includes(".")) {
      // If the address is not valid, try to resolve it as an ENS name
      publicClient
        .getEnsAddress({
          name: normalize(address),
        })
        .then(ensNameAddress => {
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
    } else {
      // Show an error on the message
      form.setError(`owners.${index}.addressOrEns`, {
        type: "manual",
        message: "Please enter a valid address or ENS name",
      });
    }
  }

  function onSubmit(data: NewFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <FormLabel>Owners</FormLabel>
                <FormDescription className="mt-1.5">
                  Add the owner and their corresponding weight.
                </FormDescription>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <FormItem
                    key={field.id}
                    className="grid grid-cols-8 gap-4 space-y-0"
                  >
                    <FormField
                      control={form.control}
                      name={`owners.${index}.addressOrEns`}
                      render={({ field }) => (
                        <div className="space-y-2 lg:col-span-6">
                          <Label htmlFor="address">Address or ENS</Label>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              {/* If the address is valid, try resolving an ens Avatar */}
                              <PlaceholderOrb
                                address={
                                  field?.address?.substring(1) ??
                                  "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"
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
                            <Input
                              id="address"
                              className=""
                              {...field}
                              placeholder="Your address or ENS name"
                              onBlur={e => {
                                // Validate the address
                                if (!e.target.value) return;
                                const address = e.target.value;

                                validateAddress(address, index);
                              }}
                            />
                          </div>
                          <FormMessage />
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      key={field.id}
                      name={`owners.${index}.weight`}
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <div className="col-span-1 space-y-2">
                              <Label htmlFor="weight">Weight</Label>
                              <Input
                                id="weight"
                                min="1"
                                type="number"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
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
                        onClick={() => remove(index)}
                      >
                        <UserMinus2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </FormItem>
                ))}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ addressOrEns: "", weight: 1 })}
                >
                  <UserPlus2 className="mr-2 h-5 w-5" />
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
                      <Input
                        className="w-32"
                        id="threshold"
                        type="number"
                        min="1"
                        placeholder="Your Wallet threshold"
                        {...field}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value, 10) : "",
                          )
                        }
                      />
                    </div>
                    <FormDescription>
                      Enter a threshold for your new wallet
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <CardFooter className="justify-end px-0">
                <Button
                  disabled={!form.formState.isValid}
                  variant={form.formState.isValid ? "default" : "outline"}
                  onClick={() => navigateToStep()}
                  type="submit"
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
}
