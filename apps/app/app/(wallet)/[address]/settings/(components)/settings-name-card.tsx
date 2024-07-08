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

import { useAuthModal, useDelayedValue } from "@lightdotso/hooks";
import { useQueryWallet, useMutationWalletUpdate } from "@lightdotso/query";
import { useFormRef } from "@lightdotso/stores";
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FC } from "react";
import { useState, useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import { z } from "zod";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsCardBaseButton } from "@/components/settings/settings-card-base-button";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const walletNameFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
});

type WalletNameFormValues = z.infer<typeof walletNameFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsNameCardProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsNameCard: FC<SettingsNameCardProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setFormControl } = useFormRef();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const { isAuthValid } = useAuthModal();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isFormChanged, setIsFormChanged] = useState(false);
  const [key, setKey] = useState(Math.random());

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { wallet } = useQueryWallet({ address: address });

  // ---------------------------------------------------------------------------
  // Mutate
  // ---------------------------------------------------------------------------

  const {
    mutate,
    isWalletUpdateSuccess,
    isWalletUpdateError,
    isWalletUpdatePending,
  } = useMutationWalletUpdate({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // This can come from your database or API.
  const defaultValues: Partial<WalletNameFormValues> = useMemo(() => {
    return {
      name: wallet?.name,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, key]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<WalletNameFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(walletNameFormSchema),
    defaultValues: defaultValues,
  });

  const formValues = form.watch();

  // ---------------------------------------------------------------------------
  // Submit Handler
  // ---------------------------------------------------------------------------

  const onSubmit: SubmitHandler<WalletNameFormValues> = data => {
    mutate({ name: data.name });
  };

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const delayedIsSuccess = useDelayedValue<boolean>(
    isWalletUpdateSuccess,
    false,
    3000,
  );

  useEffect(() => {
    if (delayedIsSuccess) {
      setIsFormChanged(false);
      return;
    }
    setIsFormChanged(
      JSON.stringify(formValues) !== JSON.stringify(defaultValues),
    );
  }, [defaultValues, formValues, delayedIsSuccess]);

  useEffect(() => {
    if (isWalletUpdateSuccess) {
      setKey(Math.random());
    }
  }, [isWalletUpdateSuccess]);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsNameCardSubmitButton: FC = () => {
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <Button
        isLoading={isWalletUpdatePending}
        disabled={
          isWalletUpdatePending ||
          delayedIsSuccess ||
          !isFormChanged ||
          typeof form.getFieldState("name").error !== "undefined"
        }
        // Workaround for form.handleSubmit(onSubmit) not working on first click
        // Issue: https://github.com/jaredpalmer/formik/issues/1332#issuecomment-799930718
        onMouseDown={() => form.handleSubmit(onSubmit)()}
      >
        {!isWalletUpdateError && delayedIsSuccess
          ? "Success"
          : isWalletUpdatePending
            ? "Updating name..."
            : "Update name"}
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      title={
        TITLES.WalletSettings.subcategories["Wallet Settings"].subcategories[
          "Name"
        ].title
      }
      subtitle={
        TITLES.WalletSettings.subcategories["Wallet Settings"].subcategories[
          "Name"
        ].description
      }
      footerContent={
        <>
          {isAuthValid && isFormChanged && (
            <Button
              variant="link"
              onClick={() => {
                if (defaultValues.name) {
                  form.setValue("name", defaultValues.name);
                }
                form.trigger();
              }}
            >
              Cancel
            </Button>
          )}
          <SettingsCardBaseButton>
            <SettingsNameCardSubmitButton />
          </SettingsCardBaseButton>
        </>
      }
    >
      <Form {...form}>
        <form
          id="settings-name-card-form"
          className="space-y-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {
                    TITLES.WalletSettings.subcategories["Wallet Settings"]
                      .subcategories["Name"].title
                  }
                </FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  {
                    TITLES.WalletSettings.subcategories["Wallet Settings"]
                      .subcategories["Name"].note
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </SettingsCard>
  );
};
