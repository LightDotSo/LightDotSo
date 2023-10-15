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
  toast,
} from "@lightdotso/ui";
import { steps } from "./root";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { NotionLinks } from "@lightdotso/const";

const newFormSchema = z.object({
  type: z.enum(["card", "paypal", "2fa"], {
    required_error: "Please select a type.",
  }),
  name: z
    .string()
    .min(1, { message: "Name cannot be empty." })
    .max(30, { message: "Name should be less than 30 characters." }),
});

type NewFormValues = z.infer<typeof newFormSchema>;

export function NewWalletForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nameParam = searchParams.get("name");
  const typeParam = searchParams.get("type");

  // This can come from your database or API.
  const defaultValues: Partial<NewFormValues> = {
    // Check if the type is valid
    type:
      typeParam && newFormSchema.shape.type.safeParse(typeParam).success
        ? newFormSchema.shape.type.parse(typeParam)
        : "card",
    name: nameParam ? nameParam : "",
  };

  const form = useForm<NewFormValues>({
    resolver: zodResolver(newFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    const subscription = form.watch((value, { name }) => {
      if (name === "name") {
        if (value.name === undefined || value.name === "") {
          url.searchParams.delete("name");
        } else {
          url.searchParams.set("name", value.name);
        }
      }
      if (name === "type" && value.type) {
        url.searchParams.set("type", value.type);
      }
      router.replace(url.toString());
      return;
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[1].href, window.location.origin);
    url.searchParams.set("name", nameParam || "");
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameParam]);

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
    <Form {...form}>
      <TooltipProvider>
        <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-8">
          <CardHeader className="gap-3">
            <CardTitle>Create a New Wallet</CardTitle>
            <CardDescription>
              Select a name for your new wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-10">
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
                            value="card"
                            id="card"
                            className="peer sr-only"
                          />
                          <TooltipTrigger asChild>
                            <Label
                              htmlFor="card"
                              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-8 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
                            value="paypal"
                            id="paypal"
                            className="peer sr-only"
                          />
                          <TooltipTrigger asChild>
                            <Label
                              htmlFor="paypal"
                              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-8 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
                              className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-8 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
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
              <CardFooter className="justify-end">
                <Button
                  disabled={!form.formState.isValid}
                  variant={form.formState.isValid ? "default" : "outline"}
                  onClick={() => navigateToStep()}
                  className="w-32"
                  type="submit"
                >
                  Continue
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </TooltipProvider>
    </Form>
  );
}
