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
import * as z from "zod";
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
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Mutate
  // ---------------------------------------------------------------------------

  const { mutate, isSuccess, isError, isPending } =
    useMutationWalletSettingsUpdate({
      address: address,
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
    defaultValues,
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

  const delayedIsSuccess = useDelayedValue<boolean>(isSuccess, false, 3000);

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
    if (isSuccess) {
      setKey(Math.random());
    }
  }, [isSuccess]);

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
        isLoading={isPending}
        disabled={
          isPending ||
          delayedIsSuccess ||
          !isFormChanged ||
          typeof form.getFieldState("enabled").error !== "undefined"
        }
      >
        {!isError && delayedIsSuccess
          ? "Success"
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
