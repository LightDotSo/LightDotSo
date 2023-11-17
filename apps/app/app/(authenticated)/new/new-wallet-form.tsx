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
  FormField,
  FormItem,
  FormDescription,
  FormLabel,
  RadioGroup,
  RadioGroupItem,
  Input,
  Label,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@lightdotso/ui";
import { steps } from "@/app/(authenticated)/new/(components)/root";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { useEffect, useCallback } from "react";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NotionLinks } from "@lightdotso/const";
import { useNewFormStore } from "@/stores/useNewForm";
import { newFormSchema } from "@/schemas/newForm";
import { successToast } from "@/utils/toast";
import {
  useNameQueryState,
  useTypeQueryState,
} from "@/app/(authenticated)/new/(hooks)";
import type { WalletType } from "@/app/(authenticated)/new/(hooks)";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof newFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NewWalletForm: FC = () => {
  const router = useRouter();
  const { setFormValues } = useNewFormStore();

  const [name, setName] = useNameQueryState();
  const [type, setType] = useTypeQueryState();

  const defaultValues: Partial<NewFormValues> = {
    name,
    type,
  };

  const form = useForm<NewFormValues>({
    resolver: zodResolver(newFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      setFormValues(value);
      if (name === "name") {
        if (value.name === undefined || value.name === "") {
          setName(null);
        } else {
          setName(value.name);
        }
      }
      if (name === "type") {
        if (value.type === "multi" || value.type === undefined) {
          setType(null);
        } else {
          setType(value.type as WalletType);
        }
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Set the form values from the URL on mount
  useEffect(() => {
    // Set the form values from the default values
    setFormValues(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[1].href, window.location.origin);
    url.searchParams.set("name", name);
    url.searchParams.set("type", type);
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, type]);

  function onSubmit(data: NewFormValues) {
    successToast(data);
    navigateToStep();
  }

  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-8">
      <CardHeader className="gap-3">
        <CardTitle>Create a New Wallet</CardTitle>
        <CardDescription>Select a name for your new wallet.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <div className="grid gap-3">
                    <FormLabel htmlFor="type">Type</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      id="type"
                      className="grid grid-cols-3 gap-4"
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
                              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <BuildingLibraryIcon className="mb-3 h-6 w-6"></BuildingLibraryIcon>
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
                              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <BanknotesIcon className="mb-3 h-6 w-6"></BanknotesIcon>
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
                            value="2fa"
                            id="2fa"
                            disabled
                            className="peer sr-only"
                          />
                          <TooltipTrigger asChild>
                            <Label
                              htmlFor="2fa"
                              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <ShieldExclamationIcon className="mb-3 h-6 w-6"></ShieldExclamationIcon>
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
                        onChange={field.onChange}
                      />
                    </div>
                    <FormDescription>
                      Enter a name for your new wallet
                    </FormDescription>
                  </FormItem>
                )}
              />
              <div>
                <CardDescription className="text-base text-primary">
                  By creating a new wallet, you are accepting our{" "}
                  <a
                    className="underline"
                    href={NotionLinks["Terms of Service"]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    term and conditions
                  </a>
                </CardDescription>
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
};
