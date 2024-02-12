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

import { getWallet } from "@lightdotso/client";
import {
  useNameQueryState,
  useInviteCodeQueryState,
  useOwnersQueryState,
  useSaltQueryState,
  useThresholdQueryState,
  useTypeQueryState,
} from "@lightdotso/nuqs";
import {
  newFormSchema,
  newFormConfigurationSchema,
  newFormStoreSchema,
} from "@lightdotso/schemas";
import { useAuth, useNewForm } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  TooltipProvider,
  toast,
} from "@lightdotso/ui";
import { publicClient } from "@lightdotso/wagmi";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { backOff } from "exponential-backoff";
import { isEmpty } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import type * as z from "zod";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof newFormStoreSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const ConfirmForm: FC = () => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();
  const { address, setFormValues, fetchToCreate } = useNewForm();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [name] = useNameQueryState();
  const [inviteCode] = useInviteCodeQueryState();
  const [type] = useTypeQueryState();
  const [threshold] = useThresholdQueryState();
  const [salt] = useSaltQueryState();
  const [owners] = useOwnersQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const defaultValues: NewFormValues = useMemo(() => {
    return {
      check: false,
      name: name ?? "",
      inviteCode: inviteCode ?? "",
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
  }, [name, inviteCode, type, threshold, salt, owners]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<NewFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    // TODO: Fix this type error w/ zod
    // @ts-expect-error
    resolver: zodResolver(newFormStoreSchema, defaultValues),
  });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // Create a function to submit the form
  const onSubmit = useCallback(
    () => {
      // Set the loading state
      setIsLoading(true);
      // Navigate to the next step
      const loadingToast = toast.loading("Creating wallet...");
      // Set the form values
      // setFormValues(values);
      fetchToCreate(true)
        .then(() => {
          setIsLoading(false);
          toast.dismiss(loadingToast);
          toast.success("You can now use your wallet!");

          backOff(() =>
            getWallet(
              { params: { query: { address: address! } } },
              clientType,
            ).then(res => res._unsafeUnwrap()),
          )
            .then(res => {
              if (res) {
                router.push(`/${address}`);
              } else {
                toast.error("There was a problem with your request.");
                router.push("/");
              }
            })
            .catch(() => {
              toast.error(
                "There was a problem with your request while creating.",
              );
              router.push("/");
            });
        })
        .catch(() => {
          setIsLoading(false);
          toast.dismiss(loadingToast);
          toast.error(
            "There was a problem with your request (invalid request likely).",
          );
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setFormValues],
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the form values on mount
  useEffect(() => {
    form.setValue("name", defaultValues.name);
    form.setValue("inviteCode", defaultValues.inviteCode);
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

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    return (
      form.formState.isValid && isEmpty(form.formState.errors) && !isLoading
    );
  }, [form.formState, isLoading]);

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="flex flex-col space-y-6 p-4 lg:px-6 lg:pt-6">
      <CardHeader className="gap-3">
        <CardTitle>Confirm</CardTitle>
        <CardDescription>
          Confirm the details of your new wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              {form.formState.errors && (
                <pre className="text-sm font-medium text-text-destructive">
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
              <FooterButton
                isModal={false}
                disabled={!isFormValid}
                isLoading={isLoading}
                cancelClick={() => router.back()}
              />
              {/* Show all errors for debugging */}
              {/* <pre>{JSON.stringify(defaultValues, null, 2)}</pre> */}
              {/* <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre> */}
            </form>
          </Form>
          {(process.env.NODE_ENV !== "production" ||
            process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") && (
            <DevTool control={form.control} />
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
