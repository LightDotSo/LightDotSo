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
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  TooltipProvider,
} from "@lightdotso/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewFormStore } from "@/stores/useNewForm";
import {
  newFormSchema,
  newFormConfigurationSchema,
  newFormStoreSchema,
} from "@/schemas/newForm";
import { publicClient } from "@/clients/public";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import type * as z from "zod";
import { errToast, infoToast, successToast } from "@/utils/toast";
import { getWallet } from "@lightdotso/client";
import { backOff } from "exponential-backoff";
import {
  useNameQueryState,
  useOwnersQueryState,
  useSaltQueryState,
  useThresholdQueryState,
  useTypeQueryState,
} from "@/app/(authenticated)/new/hooks";

type NewFormValues = z.infer<typeof newFormStoreSchema>;

export function ConfirmForm() {
  const router = useRouter();
  const { address, setFormValues, fetchToCreate } = useNewFormStore();

  const [name] = useNameQueryState();
  const [type] = useTypeQueryState();
  const [threshold] = useThresholdQueryState();
  const [salt] = useSaltQueryState();
  const [owners] = useOwnersQueryState();

  const defaultValues: NewFormValues = useMemo(() => {
    return {
      check: false,
      name: name ?? "",
      type:
        type && newFormSchema.shape.type.safeParse(type).success
          ? newFormSchema.shape.type.parse(type)
          : "multi",
      threshold:
        threshold &&
        newFormConfigurationSchema.shape.threshold.safeParse(threshold).success
          ? newFormConfigurationSchema.shape.threshold.parse(threshold)
          : 1,
      salt:
        salt && newFormConfigurationSchema.shape.salt.safeParse(salt).success
          ? newFormConfigurationSchema.shape.salt.parse(salt)
          : "",
      // If type is personal, add two owners
      owners: owners,
    };
  }, [name, type, threshold, salt, owners]);

  const form = useForm<NewFormValues>({
    mode: "onChange",
    // TODO: Fix this type error w/ zod
    // @ts-expect-error
    resolver: zodResolver(newFormStoreSchema, defaultValues),
  });

  // Create a function to submit the form
  const onSubmit = useCallback(
    () => {
      // Navigate to the next step
      infoToast("Success!");
      // Set the form values
      // setFormValues(values);
      fetchToCreate(true)
        .then(() => {
          successToast("You can now use your wallet.");

          backOff(() =>
            getWallet({ params: { query: { address: address! } } }).then(res =>
              res._unsafeUnwrap(),
            ),
          )
            .then(res => {
              if (res) {
                router.push(`/${address}`);
              } else {
                errToast("There was a problem with your request.");
                router.push("/");
              }
            })
            .catch(() => {
              errToast("There was a problem with your request while creating.");
              router.push("/");
            });
        })
        .catch(() => {
          errToast(
            "There was a problem with your request (invalid request likely).",
          );
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setFormValues],
  );

  // Set the form values on mount
  useEffect(() => {
    form.setValue("name", defaultValues.name);
    form.setValue("type", defaultValues.type);
    form.setValue("threshold", defaultValues.threshold);
    form.setValue("salt", defaultValues.salt);
    form.setValue("owners", owners);
    setFormValues(defaultValues);

    async function fetchENSNametoAddress() {
      // We will use newOwners array instead of mutating owners directly
      let newOwners = [...owners];
      for (let i = 0; i < newOwners.length; i++) {
        if (
          newOwners[i].addressOrEns &&
          !isAddress(newOwners[i].addressOrEns!)
        ) {
          try {
            const ensNameAddress = await publicClient.getEnsAddress({
              name: normalize(newOwners[i].addressOrEns!),
            });
            if (ensNameAddress) {
              newOwners[i].address = ensNameAddress;
            } else {
              console.error(
                "The ENS name did not resolve. Please enter a valid address or ENS name",
              );
            }
          } catch (error) {
            console.error(
              "An error occurred while resolving the ENS name",
              error,
            );
          }
        }
      }
      form.setValue("owners", newOwners);
      setFormValues({ ...defaultValues, owners: newOwners });
    }
    fetchENSNametoAddress();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Utility function to extract all error messages from the form state
  // Geneated by Chat-GPT
  const extractDeeperErrors = (obj: any): string[] => {
    if (typeof obj !== "object" || obj === null) return [];

    return Object.entries(obj).reduce((messages: string[], [key, value]) => {
      if (typeof value === "object" && value !== null) {
        return messages.concat(extractDeeperErrors(value));
      }

      if (key === "message" && typeof value === "string") {
        return messages.concat(value);
      }

      return messages;
    }, []);
  };

  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-8">
      <CardHeader className="gap-3">
        <CardTitle>Confirm</CardTitle>
        <CardDescription>
          Confirm the details of your new wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors && (
                <pre className="text-sm font-medium text-destructive">
                  {/* Print any message one line at a time */}
                  {extractDeeperErrors(form.formState.errors).join("\n")}
                </pre>
              )}
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
                        Confirm that the above settings are correct and that the
                        action is irreversible.
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
                >
                  Create Wallet
                </Button>
              </CardFooter>
              {/* Show all errors for debugging */}
              {/* <pre>{JSON.stringify(defaultValues, null, 2)}</pre> */}
              {/* <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre> */}
            </form>
          </Form>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
