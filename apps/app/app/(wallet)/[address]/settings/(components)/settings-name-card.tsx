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

import { useAuthModal, useDelayedValue } from "@lightdotso/hooks";
import { useQueryWallet, useMutationWalletUpdate } from "@lightdotso/query";
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
import * as z from "zod";
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

  const { mutate, isSuccess, isError, isPending } = useMutationWalletUpdate({
    address: address,
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
    resolver: zodResolver(walletNameFormSchema),
    defaultValues,
  });

  const formValues = form.watch();

  // ---------------------------------------------------------------------------
  // Submit Handler
  // ---------------------------------------------------------------------------

  const onSubmit: SubmitHandler<WalletNameFormValues> = data => {
    form.trigger();

    mutate({ name: data.name });
  };

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

  const SettingsNameCardSubmitButton: FC = () => {
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <Button
        type="submit"
        isLoading={isPending}
        onClick={form.handleSubmit(onSubmit)}
        disabled={
          isPending ||
          delayedIsSuccess ||
          !isFormChanged ||
          typeof form.getFieldState("name").error !== "undefined"
        }
      >
        {!isError && delayedIsSuccess
          ? "Success"
          : isPending
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
        <form className="space-y-8">
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
