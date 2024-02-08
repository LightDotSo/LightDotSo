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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
} from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import type { FC } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SettingsCard } from "@/components/settings/settings-card";
import { TITLES } from "@/const";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

// This can come from your database or API.

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SettingsAppearanceCard: FC = () => {
  // ---------------------------------------------------------------------------
  // Operation Hooks
  // ---------------------------------------------------------------------------

  const { theme, setTheme } = useTheme();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const defaultValues: Partial<AppearanceFormValues> = {
    theme: theme === "system" ? "system" : theme === "dark" ? "dark" : "light",
  };

  const form = useForm<AppearanceFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  });

  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------

  const DarkModeCard: FC = () => {
    return (
      <div className="items-center rounded-md border-2 border-border bg-background-body p-1 hover:bg-background-stronger hover:text-text-weak">
        <div className="space-y-2 rounded-sm bg-slate-950 p-2">
          <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
            <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
          </div>
          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
            <div className="size-4 rounded-full bg-slate-400" />
            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
          </div>
          <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
            <div className="size-4 rounded-full bg-slate-400" />
            <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
          </div>
        </div>
      </div>
    );
  };

  const LightModeCard: FC = () => {
    return (
      <div className="hover:border-accent items-center rounded-md border-2 border-border p-1">
        <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
          <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
            <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
          </div>
          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
            <div className="size-4 rounded-full bg-[#ecedef]" />
            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
          </div>
          <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
            <div className="size-4 rounded-full bg-[#ecedef]" />
            <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <SettingsCard
      title={TITLES.Settings.subcategories["Appearance"].title}
      subtitle={TITLES.Settings.subcategories["Appearance"].description}
    >
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Theme</FormLabel>
                <FormDescription>
                  Select the theme for the dashboard.
                </FormDescription>
                <FormMessage />
                <RadioGroup
                  defaultValue={field.value}
                  className="grid gap-8 pt-2 md:grid-cols-3"
                  onValueChange={setTheme}
                >
                  <FormItem>
                    <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-border-primary">
                      <FormControl>
                        <RadioGroupItem value="light" className="sr-only" />
                      </FormControl>
                      <LightModeCard />
                      <span className="block w-full p-2 text-center font-normal">
                        Light
                      </span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-border-primary">
                      <FormControl>
                        <RadioGroupItem value="dark" className="sr-only" />
                      </FormControl>
                      <DarkModeCard />
                      <span className="block w-full p-2 text-center font-normal">
                        Dark
                      </span>
                    </FormLabel>
                  </FormItem>
                  <FormItem>
                    <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-border-primary">
                      <FormControl>
                        <RadioGroupItem value="system" className="sr-only" />
                      </FormControl>
                      <div className="relative">
                        <LightModeCard />
                        {/* 
                          From: https://github.com/openstatusHQ/openstatus/blob/fd9716bb9af53c7c0b0e3dfc26a20f321b83b368/apps/web/src/app/app/%5BworkspaceSlug%5D/(dashboard)/settings/appearance/page.tsx#L28C9-L38C15
                          License: AGPL-3.0
                         */}
                        <div
                          className="absolute inset-0"
                          style={{
                            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
                          }}
                        >
                          <DarkModeCard />
                        </div>
                      </div>
                      <span className="block w-full p-2 text-center font-normal">
                        System
                      </span>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </SettingsCard>
  );
};
