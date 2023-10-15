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
    weight: 0,
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
        address: addressParam,
        weight: parseInt(weightParam),
      }).success
    ) {
      owner = newFormConfigurationSchema.shape.owners.element.parse({
        address: addressParam,
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
      newFormConfigurationSchema.shape.threshold.safeParse(thresholdParam)
        .success
        ? newFormConfigurationSchema.shape.threshold.parse(thresholdParam)
        : 0,
    salt:
      saltParam &&
      newFormConfigurationSchema.shape.salt.safeParse(saltParam).success
        ? newFormConfigurationSchema.shape.salt.parse(saltParam)
        : timestampToBytes32(Math.floor(Date.now())),
    owners: owners.length ? owners : [defaultOwner],
  };

  const form = useForm<NewFormValues>({
    resolver: zodResolver(newFormConfigurationSchema),
    defaultValues,
  });

  const { fields, append } = useFieldArray({
    name: "owners",
    control: form.control,
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const subscription = form.watch((value, { name }) => {
      // @ts-expect-error
      setFormValues(value);
      if (name === "salt") {
        if (value.salt === undefined || value.salt === "") {
          url.searchParams.delete("salt");
        } else {
          url.searchParams.set("salt", value.salt);
        }
      }
      if (name === "threshold") {
        if (value.threshold === undefined || !isNaN(value.threshold)) {
          url.searchParams.delete("threshold");
        } else {
          url.searchParams.set("threshold", value.threshold.toString());
        }
      }
      if (Array.isArray(value.owners)) {
        value.owners.forEach((owner, index) => {
          // Return if the owner is undefined
          if (owner === undefined) return;
          if (owner.address) {
            url.searchParams.set(`owners[${index}][address]`, owner.address);
          } else {
            url.searchParams.delete(`owners[${index}][address]`);
          }

          if (owner.weight) {
            url.searchParams.set(
              `owners[${index}][weight]`,
              owner.weight.toString(),
            );
          } else {
            url.searchParams.delete(`owners[${index}][weight]`);
          }
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[2].href, window.location.origin);
    url.search = searchParams.toString();
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <FormLabel>Owners</FormLabel>
                <FormDescription className="mt-2">
                  Add the owner and their corresponding weight.
                </FormDescription>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <FormItem
                    key={field.id}
                    className="grid grid-cols-6 gap-4 space-y-0"
                  >
                    <FormField
                      control={form.control}
                      name={`owners.${index}.address`}
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <Input className="lg:col-span-5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    />
                    <FormField
                      control={form.control}
                      key={field.id}
                      name={`owners.${index}.weight`}
                      render={({ field }) => (
                        <>
                          <FormControl>
                            <Input
                              className=""
                              min="1"
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </>
                      )}
                    />
                  </FormItem>
                ))}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => append({ address: "", weight: 0 })}
                >
                  Add New Owner
                </Button>
              </div>
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
