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

import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsCardBaseButton } from "@/components/settings/settings-card-base-button";
import { TITLES } from "@/const";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { type FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const walletTestnetFormSchema = z.object({
  enabled: z.boolean(),
});

type WalletTestnetFormValues = z.infer<typeof walletTestnetFormSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsTestnetCardProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsTestnetCard: FC<SettingsTestnetCardProps> = ({
  address,
}) => {
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const defaultValues: Partial<WalletTestnetFormValues> = useMemo(() => {
    return {
      enabled: walletSettings?.is_enabled_testnet ?? false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletSettings, key]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<WalletTestnetFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(walletTestnetFormSchema),
    defaultValues: defaultValues,
  });

  const formValues = form.watch();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  async function onSubmit(data: WalletTestnetFormValues) {
    mutate({ is_enabled_testnet: data.enabled });
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

  const SettingsTestnetCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="settings-testnet-card-form"
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
        TITLES.WalletSettings.subcategories["Wallet Settings"].subcategories
          .Testnet.title
      }
      subtitle={
        TITLES.WalletSettings.subcategories["Wallet Settings"].subcategories
          .Testnet.description
      }
      footerContent={
        <SettingsCardBaseButton>
          <SettingsTestnetCardSubmitButton />
        </SettingsCardBaseButton>
      }
    >
      <Form {...form}>
        <form
          id="settings-testnet-card-form"
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
                      .subcategories.Testnet.title
                  }
                </FormLabel>
                <FormDescription>
                  {
                    TITLES.WalletSettings.subcategories["Wallet Settings"]
                      .subcategories.Testnet.note
                  }
                </FormDescription>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <p className="text-text-weak text-xs">
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
