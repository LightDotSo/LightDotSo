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
  Input,
} from "@lightdotso/ui";
import { successToast } from "@/utils/toast";
import type { FC } from "react";
import { SettingsCard } from "@/app/(wallet)/[address]/settings/(components)/settings-card";

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

// This can come from your database or API.
const defaultValues: Partial<WalletNameFormValues> = {
  // name: "Your name",
  // dob: new Date("2023-01-23"),
};

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SettingsNameCardProps = {
  address: string;
};

// -----------------------------------------------------------------------------
// Form
// -----------------------------------------------------------------------------

export const SettingsNameCard: FC<SettingsNameCardProps> = ({ address }) => {
  const form = useForm<WalletNameFormValues>({
    resolver: zodResolver(walletNameFormSchema),
    defaultValues,
  });

  function onSubmit(data: WalletNameFormValues) {
    successToast(data);
  }

  const WalletNameFormSubmitButton: FC = () => {
    return (
      <Button
        type="submit"
        form="walletNameForm"
        disabled={typeof form.getFieldState("name").error !== "undefined"}
      >
        Update name
      </Button>
    );
  };

  return (
    <SettingsCard
      address={address}
      title="Title"
      subtitle="Subtitle"
      footerContent={<WalletNameFormSubmitButton />}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="walletNameForm"
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile and in
                  emails.
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
