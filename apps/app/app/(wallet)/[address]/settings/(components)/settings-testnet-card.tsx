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
import * as z from "zod";
import { SettingsCard } from "@/components/settings/settings-card";
import { TITLES } from "@/const/titles";
import { useDelayedValue } from "@/hooks";
import {
  useMutationWalletSettings,
  useSuspenseQueryWalletSettings,
} from "@/query";

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
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isFormChanged, setIsFormChanged] = useState(false);
  const [key, setKey] = useState(Math.random());

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useSuspenseQueryWalletSettings({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Mutate
  // ---------------------------------------------------------------------------

  const { mutate, isSuccess, isError, isPending } = useMutationWalletSettings({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // This can come from your database or API.
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
    defaultValues,
  });

  const formValues = form.watch();

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  async function onSubmit(data: WalletTestnetFormValues) {
    mutate({ is_enabled_testnet: data.enabled });
  }

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  const delayedIsSuccess = useDelayedValue<boolean>(isSuccess, false, 3000);

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
    if (isSuccess) {
      setKey(Math.random());
    }
  }, [isSuccess]);

  // ---------------------------------------------------------------------------
  // Submit Button
  // ---------------------------------------------------------------------------

  const SettingsTestnetCardSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="walletTestnetForm"
        variant={isPending ? "loading" : "default"}
        disabled={
          delayedIsSuccess ||
          !isFormChanged ||
          typeof form.getFieldState("enabled").error !== "undefined"
        }
      >
        {!isError && delayedIsSuccess
          ? "Success!"
          : isPending
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
        TITLES.Settings.subcategories["Wallet Settings"].subcategories[
          "Testnet"
        ].title
      }
      subtitle={
        TITLES.Settings.subcategories["Wallet Settings"].subcategories[
          "Testnet"
        ].description
      }
      footerContent={<SettingsTestnetCardSubmitButton />}
    >
      <Form {...form}>
        <form
          id="walletTestnetForm"
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
                    TITLES.Settings.subcategories["Wallet Settings"]
                      .subcategories["Testnet"].title
                  }
                </FormLabel>
                <FormDescription>
                  {
                    TITLES.Settings.subcategories["Wallet Settings"]
                      .subcategories["Testnet"].note
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
