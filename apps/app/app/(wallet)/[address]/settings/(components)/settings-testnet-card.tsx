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
import { getWalletSettings, updateWalletSettings } from "@lightdotso/client";
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import type { FC } from "react";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";
import { TITLES } from "@/const/titles";
import { errorToast, successToast } from "@/utils/toast";
import { queries } from "@/queries";
import type { Address } from "viem";

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
  address: Address;
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

  const queryClient = useQueryClient();

  const currentData: WalletSettingsData | undefined = queryClient.getQueryData([
    "wallet_settings",
    address,
  ]);

  const { data: wallet } = useSuspenseQuery<WalletSettingsData | null>({
    queryKey: queries.wallet.settings(address).queryKey,
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
  // Mutate
  // ---------------------------------------------------------------------------

  const { mutate } = useMutation({
    mutationFn: async (data: WalletSettingsData) => {
      const res = await updateWalletSettings({
        params: {
          query: {
            address: address,
          },
        },
        body: {
          wallet_settings: {
            is_enabled_testnet: data.is_enabled_testnet,
          },
        },
      });

      // Return if the response is 200
      res.match(
        data => {
          return successToast(data);
        },
        err => {
          return errorToast(err);
        },
      );
    },
    // When mutate is called:
    onMutate: async (walletSettings: WalletSettingsData) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queries.wallet.settings(address).queryKey,
      });

      // Snapshot the previous value
      const previousSettings: WalletSettingsData | undefined =
        queryClient.getQueryData(queries.wallet.settings(address).queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(
        queries.wallet.settings(address).queryKey,
        (old: WalletSettingsData) => {
          return { ...old, walletSettings };
        },
      );

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, _newWalletSettings, context) => {
      queryClient.setQueryData(
        queries.wallet.settings(address).queryKey,
        context?.previousSettings,
      );

      errorToast(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queries.wallet.settings(address).queryKey,
      });

      // Invalidate the cache for the address
      fetch(`/api/revalidate/tag?tag=${address}`);
    },
    mutationKey: queries.wallet.settings(address).queryKey,
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

  async function onSubmit(data: WalletTestnetFormValues) {
    mutate({ is_enabled_testnet: data.enabled });
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
