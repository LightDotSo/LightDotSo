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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@lightdotso/ui";
import { successToast } from "@/utils/toast";
import type { Address } from "viem";

const feedbackFormSchema = z.object({
  text: z.string().min(1),
  emoji: z.enum(
    ["exploding-head", "slightly-smiling-face", "loudly-crying-face"],
    {
      invalid_type_error: "Select an emoji",
      required_error: "Please select an emoji.",
    },
  ),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

type FeedbackFormProps = {
  address: Address;
};

export function FeedbackForm({ address }: FeedbackFormProps) {
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
  });

  function onSubmit(data: FeedbackFormValues) {
    successToast({ ...data, address });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <div className="w-full">
                <FormControl>
                  <Textarea
                    id="description"
                    placeholder="Send us your feedback and suggestions!"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emoji"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid max-w-md grid-cols-5 gap-4 pt-2"
              >
                <FormItem>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="exploding-head"
                        className="sr-only"
                      />
                    </FormControl>
                    <div className="flex items-center justify-center rounded-full border-2 border-muted p-1 text-2xl hover:border-accent">
                      🤯
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="slightly-smiling-face"
                        className="sr-only"
                      />
                    </FormControl>
                    <div className="flex items-center justify-center rounded-full border-2 border-muted p-1 text-2xl hover:border-accent">
                      🙂
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="loudly-crying-face"
                        className="sr-only"
                      />
                    </FormControl>
                    <div className="flex items-center justify-center rounded-full border-2 border-muted p-1 text-2xl hover:border-accent">
                      😭
                    </div>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Send Feedback</Button>
        </div>
      </form>
    </Form>
  );
}
