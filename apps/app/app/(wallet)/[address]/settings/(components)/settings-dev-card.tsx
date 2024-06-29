// Copyright 2023-2024 Light.
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

import { useDelayedValue } from "@lightdotso/hooks";
import {
  useMutationWalletSettingsUpdate,
  useQueryWalletSettings,
} from "@lightdotso/query";
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
  Switch,
} from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FC, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import { z } from "zod";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsCardBaseButton } from "@/components/settings/settings-card-base-button";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const walletDevFormSchema = z.object({
  enabled: z.boolean(),
});

type WalletDevFormValues = z.infer<typeof walletDevFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsDevCardProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsDevCard: FC<SettingsDevCardProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setFormControl } = useFormRef();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isFormChanged, setIsFormChanged] = useState(false);
  const [key, setKey] = useState(Math.random());

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Mutate
  // ---------------------------------------------------------------------------

  const {
    mutate,
    isWalletSettingsUpdateSuccess,
    isWalletSettingsUpdateError,
    isWalletSettingsUpdatePending,
  } = useMutationWalletSettingsUpdate({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // This can come from your database or API.
  const defaultValues: Partial<WalletDevFormValues> = useMemo(() => {
    return {
      enabled: walletSettings?.is_enabled_dev ?? false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletSettings, key]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<WalletDevFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(walletDevFormSchema),
    defaultValues: defaultValues,
  });

  const formValues = form.watch();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  async function onSubmit(data: WalletDevFormValues) {
    mutate({ is_enabled_dev: data.enabled });
  }

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const delayedIsSuccess = useDelayedValue<boolean>(
    isWalletSettingsUpdateSuccess,
    false,
    3000,
  );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

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
    if (isWalletSettingsUpdateSuccess) {
      setKey(Math.random());
    }
  }, [isWalletSettingsUpdateSuccess]);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsDevCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="settings-dev-card-form"
        isLoading={isWalletSettingsUpdatePending}
        disabled={
          isWalletSettingsUpdatePending ||
          delayedIsSuccess ||
          !isFormChanged ||
          typeof form.getFieldState("enabled").error !== "undefined"
        }
      >
        {!isWalletSettingsUpdateError && delayedIsSuccess
          ? "Success"
          : isWalletSettingsUpdatePending
            ? "Saving..."
            : "Save"}
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
          "Dev"
        ].title
      }
      subtitle={
        TITLES.WalletSettings.subcategories["Wallet Settings"].subcategories[
          "Dev"
        ].description
      }
      footerContent={
        <SettingsCardBaseButton>
          <SettingsDevCardSubmitButton />
        </SettingsCardBaseButton>
      }
    >
      <Form {...form}>
        <form
          id="settings-dev-card-form"
          className="space-y-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {
                    TITLES.WalletSettings.subcategories["Wallet Settings"]
                      .subcategories["Dev"].title
                  }
                </FormLabel>
                <FormDescription>
                  {
                    TITLES.WalletSettings.subcategories["Wallet Settings"]
                      .subcategories["Dev"].note
                  }
                </FormDescription>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-xs text-text-weak">
                    {field.value ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </SettingsCard>
  );
};
