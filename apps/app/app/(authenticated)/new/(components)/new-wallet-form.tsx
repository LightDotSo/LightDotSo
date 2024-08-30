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

import { steps } from "@/app/(authenticated)/new/(components)/root/root";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { NOTION_LINKS } from "@lightdotso/const";
import { ExternalLink } from "@lightdotso/elements/external-link";
import { InviteCodeForm } from "@lightdotso/forms";
import {
  useInviteCodeQueryState,
  useNameQueryState,
  useTypeQueryState,
} from "@lightdotso/nuqs";
import type { WalletType } from "@lightdotso/nuqs";
import { newFormSchema } from "@lightdotso/schemas";
import { useFormRef, useNewForm } from "@lightdotso/stores";
import { FooterButton } from "@lightdotso/templates/footer-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@lightdotso/ui/components/card";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@lightdotso/ui/components/form";
import { Input } from "@lightdotso/ui/components/input";
import { Label } from "@lightdotso/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@lightdotso/ui/components/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lightdotso/ui/components/tooltip";
import { isEmpty } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof newFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NewWalletForm: FC = () => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setFormControl } = useFormRef();
  const { setFormValues } = useNewForm();

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [name, setName] = useNameQueryState();
  const [inviteCode, setInviteCode] = useInviteCodeQueryState();
  const [type, setType] = useTypeQueryState();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const defaultValues: Partial<NewFormValues> = {
    name: name,
    type: type,
    inviteCode: inviteCode,
  };

  const form = useForm<NewFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(newFormSchema),
    defaultValues: defaultValues,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
    const subscription = form.watch((value, { name }) => {
      setFormValues(value);
      if (name === "name") {
        if (typeof value.name === "undefined" || value.name === "") {
          setName(null);
        } else {
          setName(value.name);
        }
      }
      if (name === "inviteCode") {
        if (
          typeof value.inviteCode === "undefined" ||
          value.inviteCode === ""
        ) {
          setInviteCode(null);
        } else {
          setInviteCode(value.inviteCode);
        }
      }
      if (name === "type") {
        if (value.type === "multi" || typeof value.type === "undefined") {
          setType(null);
        } else {
          setType(value.type as WalletType);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const navigateToStep = useCallback(() => {
    const url = new URL(steps[1].href, window.location.origin);
    url.searchParams.set("name", name);
    url.searchParams.set("inviteCode", inviteCode);
    url.searchParams.set("type", type);
    router.push(url.toString());
  }, [name, inviteCode, type]);

  const onSubmit = useCallback(
    (_data: NewFormValues) => {
      navigateToStep();
    },
    [navigateToStep],
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the form values from the URL on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    // Set the form values from the default values
    setFormValues(defaultValues);
  }, []);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="flex flex-col space-y-6 p-4 lg:px-6 lg:pt-6">
      <CardHeader className="gap-3">
        <CardTitle>Create a New Wallet</CardTitle>
        <CardDescription>Select a name for your new wallet.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <div className="grid gap-3">
                  <FormLabel htmlFor="type">Type</FormLabel>
                  <RadioGroup
                    defaultValue={field.value}
                    id="type"
                    className="grid grid-cols-3 items-stretch gap-4"
                    onValueChange={field.onChange}
                  >
                    <div>
                      <Tooltip>
                        <RadioGroupItem
                          value="multi"
                          id="multi"
                          className="peer sr-only"
                        />
                        <TooltipTrigger asChild>
                          <Label
                            htmlFor="multi"
                            className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-border bg-background-body p-4 hover:bg-background-stronger hover:text-text-weak peer-data-[state=checked]:border-border-primary [&:has([data-state=checked])]:border-border-primary"
                          >
                            <BuildingLibraryIcon className="mb-3 size-6" />
                            Multi-sig
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            A standard multi-sig wallet that requires multiple
                            signers.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip>
                        <RadioGroupItem
                          value="personal"
                          id="personal"
                          className="peer sr-only"
                        />
                        <TooltipTrigger asChild>
                          <Label
                            htmlFor="personal"
                            className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-border bg-background-body p-4 hover:bg-background-stronger hover:text-text-weak peer-data-[state=checked]:border-border-primary [&:has([data-state=checked])]:border-border-primary"
                          >
                            <BanknotesIcon className="mb-3 size-6" />
                            Personal Vault
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Protect your personal assets using backup key
                            signers.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip>
                        <RadioGroupItem
                          disabled
                          value="2fa"
                          id="2fa"
                          className="peer sr-only"
                        />
                        <TooltipTrigger asChild>
                          <Label
                            htmlFor="2fa"
                            className="flex h-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-border bg-background-body p-4 hover:bg-background-stronger hover:text-text-weak peer-data-[state=checked]:border-border-primary [&:has([data-state=checked])]:border-border-primary"
                          >
                            <ShieldExclamationIcon className="mb-3 size-6" />
                            2FA (Coming Soon)
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coming soon ...</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </RadioGroup>
                  <CardDescription className="text-sm">
                    Select the type of wallet you want to create
                  </CardDescription>
                </div>
              )}
            />
            <InviteCodeForm name="inviteCode" initialInviteCode={inviteCode} />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <div className="grid gap-3">
                    <Input
                      id="name"
                      placeholder="Your Wallet Name"
                      defaultValue={field.value}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </div>
                  <FormDescription>
                    Enter a name for your new wallet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <CardDescription className="text-base text-text">
                By creating a new wallet, you are accepting our{" "}
                <ExternalLink
                  className="underline hover:text-text-weak"
                  href={NOTION_LINKS["Terms of Service"]}
                >
                  term and conditions
                </ExternalLink>
              </CardDescription>
            </div>
            {/* Show all errors for debugging */}
            {/* <div className="text-text">{JSON.stringify(field, null, 2)}</div> */}
            {/* <div className="text-text">{JSON.stringify(form, null, 2)}</div> */}
            <FooterButton
              isModal={false}
              cancelDisabled={true}
              disabled={!isFormValid}
              onClick={navigateToStep}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
