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

import { getWallet, updateWallet } from "@lightdotso/client";
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
import {
  useSuspenseQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import type { FC } from "react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import * as z from "zod";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";
import { TITLES } from "@/const/titles";
import type { WalletData } from "@/data";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useDelayedValue } from "@/hooks/useDelayedValue";
import { queries } from "@/queries";
import { errorToast, successToast } from "@/utils";

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
  const { isAuthValid, openAuthModal } = useAuthModal();
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [key, setKey] = useState(Math.random());

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const currentData: WalletData | undefined = queryClient.getQueryData(
    queries.wallet.get(address).queryKey,
  );

  const { data: wallet } = useSuspenseQuery<WalletData | null>({
    queryKey: queries.wallet.get(address).queryKey,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const res = await getWallet({
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
    mutationFn: async (data: Partial<WalletData>) => {
      const res = await updateWallet({
        params: {
          query: {
            address: address,
          },
        },
        body: {
          name: data.name,
        },
      });

      // Return if the response is 200
      res.match(
        data => {
          successToast(data);
        },
        err => {
          if (err instanceof Error) {
            errorToast(err.message);
            return;
          }
          if (typeof err === "string") {
            errorToast(err);
            return;
          }
          throw err;
        },
      );
    },
    // When mutate is called:
    onMutate: async (wallet: Partial<WalletData>) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: queries.wallet.get(address).queryKey,
      });

      // Snapshot the previous value
      const previousSettings: WalletData | undefined = queryClient.getQueryData(
        queries.wallet.get(address).queryKey,
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        queries.wallet.settings(address).queryKey,
        (old: WalletData) => {
          return { ...old, wallet };
        },
      );

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    // If the mutation fails, use the context we returned above
    onError: (err, _newWalletSettings, context) => {
      queryClient.setQueryData(
        queries.wallet.get(address).queryKey,
        context?.previousSettings,
      );

      if (err instanceof Error) {
        errorToast(err.message);
        return;
      }
      if (typeof err === "string") {
        errorToast(err);
        return;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queries.wallet.get(address).queryKey,
      });

      // Invalidate the cache for the address
      // fetch(`/api/revalidate/tag?tag=${address}`);
    },
    mutationKey: queries.wallet.get(address).queryKey,
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  // This can come from your database or API.
  const defaultValues: Partial<WalletNameFormValues> = useMemo(() => {
    return {
      name: wallet?.name,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, key]);

  const form = useForm<WalletNameFormValues>({
    resolver: zodResolver(walletNameFormSchema),
    defaultValues,
  });

  const formValues = form.watch();

  function onSubmit(data: WalletNameFormValues) {
    mutate({ name: data.name });
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

  const WalletLoginButton: FC = () => {
    return (
      <Button disabled={isAuthValid} onClick={openAuthModal}>
        Login to update name
      </Button>
    );
  };

  const WalletNameFormSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="walletNameForm"
        variant={isPending ? "loading" : "default"}
        disabled={
          delayedIsSuccess ||
          !isFormChanged ||
          typeof form.getFieldState("name").error !== "undefined"
        }
      >
        {!isError && delayedIsSuccess
          ? "Success!"
          : isPending
            ? "Updating name..."
            : "Update name"}
      </Button>
    );
  };

  const SettingsNameCardButton: FC = () => {
    if (!isAuthValid) {
      return <WalletLoginButton />;
    }

    return <WalletNameFormSubmitButton />;
  };

  // ---------------------------------------------------------------------------
  // Card
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      address={address}
      title={
        TITLES.Settings.subcategories["Wallet Settings"].subcategories["Name"]
          .title
      }
      subtitle={
        TITLES.Settings.subcategories["Wallet Settings"].subcategories["Name"]
          .description
      }
      footerContent={
        <>
          {isFormChanged && (
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
          <SettingsNameCardButton />
        </>
      }
    >
      <Form {...form}>
        <form
          id="walletNameForm"
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
                    TITLES.Settings.subcategories["Wallet Settings"]
                      .subcategories["Name"].title
                  }
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    {...field}
                    onBlur={() => form.trigger()}
                  />
                </FormControl>
                <FormDescription>
                  {
                    TITLES.Settings.subcategories["Wallet Settings"]
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
