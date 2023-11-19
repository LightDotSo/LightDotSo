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

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { getWalletSettings } from "@lightdotso/client";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { successToast } from "@/utils/toast";
import type { FC } from "react";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";
import { TITLES } from "@/const/titles";

// -----------------------------------------------------------------------------
// Data
// -----------------------------------------------------------------------------

type WalletSettingsData = {
  is_enabled_testnet: boolean;
};

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
  address: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsTestnetCard: FC<SettingsTestnetCardProps> = ({
  address,
}) => {
  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const currentData: WalletSettingsData | undefined =
    useQueryClient().getQueryData(["wallet_settings", address]);

  const { data: wallet } = useSuspenseQuery<WalletSettingsData | null>({
    queryKey: ["wallet_settings", address],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWalletSettings({
        params: {
          query: {
            address: address,
          },
        },
      });

      // Return if the response is 200
      return res.match(
        data => {
          return data;
        },
        _ => {
          return currentData ?? null;
        },
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  // This can come from your database or API.
  const defaultValues: Partial<WalletTestnetFormValues> = {
    enabled: wallet?.is_enabled_testnet ?? false,
  };

  const form = useForm<WalletTestnetFormValues>({
    resolver: zodResolver(walletTestnetFormSchema),
    defaultValues,
  });

  function onSubmit(data: WalletTestnetFormValues) {
    successToast(data);
  }

  // ---------------------------------------------------------------------------
  // Button
  // ---------------------------------------------------------------------------

  const WalletTestnetFormSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="walletTestnetForm"
        disabled={typeof form.getFieldState("enabled").error !== "undefined"}
      >
        Update
      </Button>
    );
  };

  // ---------------------------------------------------------------------------
  // Card
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      address={address}
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
      footerContent={<WalletTestnetFormSubmitButton />}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="walletTestnetForm"
          className="space-y-8"
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
