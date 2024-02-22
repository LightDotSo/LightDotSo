// Copyright 2023-2024 Light, Inc.
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

import { AbiForm } from "@lightdotso/forms";
import type { devFormConfigurationSchema } from "@lightdotso/schemas";
import { abi } from "@lightdotso/schemas";
import { FooterButton, useIsInsideModal } from "@lightdotso/templates";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormMessage,
  Label,
  TooltipProvider,
} from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "lodash";
import { useCallback, useMemo } from "react";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { ChainLogo } from "@lightdotso/svg";
import { ChevronDown } from "lucide-react";
import { useModals } from "@lightdotso/stores";
import { getChainById } from "@lightdotso/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type DevFormValues = z.infer<typeof devFormConfigurationSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const DevForm: FC = () => {
  // ---------------------------------------------------------------------------
  // Next Hooks
  // ---------------------------------------------------------------------------

  // const router = useRouter();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    setChainModalProps,
    hideChainModal,
    showChainModal,
    setSendBackgroundModal,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<DevFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(abi),
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onSubmit = useCallback((_data: DevFormValues) => {}, []);

  // ---------------------------------------------------------------------------
  // Template Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Card className="flex flex-col space-y-6 p-4 lg:px-6 lg:pt-6">
      <CardHeader className="gap-3">
        <CardTitle>Developer Form</CardTitle>
        <CardDescription>Input ABI to submit.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="chainId"
                render={({ field }) => {
                  const chain = getChainById(field.value);

                  return (
                    <FormControl>
                      <div className="w-full space-y-2">
                        <Label htmlFor="chain">Chain</Label>
                        <Button
                          id="chain"
                          size="lg"
                          type="button"
                          variant="outline"
                          className="flex w-full items-center justify-between px-4 text-sm"
                          onClick={() => {
                            setChainModalProps({
                              onClose: () => {
                                hideChainModal();
                                setSendBackgroundModal(false);
                              },
                              onChainSelect: chainId => {
                                field.onChange(chainId);
                                form.trigger();

                                hideChainModal();
                                if (isInsideModal) {
                                  setSendBackgroundModal(false);
                                }
                              },
                            });
                            showChainModal();
                          }}
                        >
                          {field.value ? (
                            <>
                              <ChainLogo
                                className="mr-2"
                                chainId={field.value}
                              />
                              {chain.name}
                            </>
                          ) : (
                            "Select Chain"
                          )}
                          <div className="grow" />
                          <ChevronDown className="size-4 opacity-50" />
                        </Button>
                        <FormMessage />
                      </div>
                    </FormControl>
                  );
                }}
              />
              <AbiForm name="abi" />
              {/* Show all errors for debugging */}
              {/* <div className="text-text">{JSON.stringify(field, null, 2)}</div> */}
              <div className="text-text">{JSON.stringify(form, null, 2)}</div>
              <FooterButton
                isModal={false}
                cancelDisabled={true}
                disabled={!isFormValid}
              />
            </form>
          </Form>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
