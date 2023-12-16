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

import { getWalletSettings, updateWalletSettings } from "@lightdotso/client";
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
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { useState, type FC, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import * as z from "zod";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";
import { TITLES } from "@/const/titles";
import type { WalletSettingsData } from "@/data";
import { useDelayedValue } from "@/hooks/useDelayedValue";
import { queries } from "@/queries";
import { errorToast, successToast } from "@/utils";

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
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [key, setKey] = useState(Math.random());

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletSettingsData | undefined = queryClient.getQueryData([
    "wallet_settings",
    address,
  ]);

  const { data: wallet } = useSuspenseQuery<WalletSettingsData | null>({
    queryKey: queries.wallet.settings({ address }).queryKey,
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

  const { mutate, isPending, isSuccess, isError } = useMutation({
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
        _ => {
          successToast("Successfully updated wallet settings.");
        },
        err => {
          if (err instanceof Error) {
            errorToast(err.message);
          }
        },
      );
    },
    // When mutate is called:
    onMutate: async (walletSettings: WalletSettingsData) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queries.wallet.settings({ address }).queryKey,
      });

      // Snapshot the previous value
      const previousSettings: WalletSettingsData | undefined =
        queryClient.getQueryData(queries.wallet.settings({ address }).queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(
        queries.wallet.settings({ address }).queryKey,
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
        queries.wallet.settings({ address }).queryKey,
        context?.previousSettings,
      );

      if (err instanceof Error) {
        errorToast(err.message);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queries.wallet.settings({ address }).queryKey,
      });

      // Invalidate the cache for the address
      fetch(`/api/revalidate/tag?tag=${address}`);
    },
    mutationKey: queries.wallet.settings({ address }).queryKey,
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  // This can come from your database or API.
  const defaultValues: Partial<WalletTestnetFormValues> = useMemo(() => {
    return {
      enabled: wallet?.is_enabled_testnet ?? false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, key]);

  const form = useForm<WalletTestnetFormValues>({
    resolver: zodResolver(walletTestnetFormSchema),
    defaultValues,
  });

  const formValues = form.watch();

  async function onSubmit(data: WalletTestnetFormValues) {
    mutate({ is_enabled_testnet: data.enabled });
  }

  // ---------------------------------------------------------------------------
  // Hooks
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
  // Button
  // ---------------------------------------------------------------------------

  const WalletTestnetFormSubmitButton: FC = () => {
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
