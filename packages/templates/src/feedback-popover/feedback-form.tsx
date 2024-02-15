// Copyright 2023-2024 Light, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// This component is used only in the client, but we omit the "use client" since
// the parent component already has it.
// "use client";

import { useMutationFeedbackCreate } from "@lightdotso/query";
import { useAuth, useFormRef } from "@lightdotso/stores";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type FeedbackFormProps = {
  onClose: () => void;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const FeedbackForm: FC<FeedbackFormProps> = ({ onClose }) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { userId } = useAuth();
  const { setFormControl } = useFormRef();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<FeedbackFormValues>({
    mode: "onChange",
    resolver: zodResolver(feedbackFormSchema),
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { feedbackCreate, isFeedbackCreateSuccess, isFeedbackCreateLoading } =
    useMutationFeedbackCreate({ user_id: userId });

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  async function onSubmit(data: FeedbackFormValues) {
    await feedbackCreate({ feedback: data });
  }

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Close modal on success
  useEffect(() => {
    if (isFeedbackCreateSuccess) {
      form.reset();
      onClose();
    }
  }, [isFeedbackCreateSuccess, onClose, form]);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Form {...form}>
      <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
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
                defaultValue={field.value}
                className="grid max-w-md grid-cols-5 gap-4 pt-2"
                onValueChange={field.onChange}
              >
                <FormItem>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="exploding-head"
                        className="sr-only"
                      />
                    </FormControl>
                    <div className="hover:border-accent flex items-center justify-center rounded-full border-2 border-border p-1 text-2xl">
                      🤯
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="slightly-smiling-face"
                        className="sr-only"
                      />
                    </FormControl>
                    <div className="hover:border-accent flex items-center justify-center rounded-full border-2 border-border p-1 text-2xl">
                      🙂
                    </div>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className="hover:cursor-pointer [&:has([data-state=checked])>div]:border-border-primary">
                    <FormControl>
                      <RadioGroupItem
                        value="loudly-crying-face"
                        className="sr-only"
                      />
                    </FormControl>
                    <div className="hover:border-accent flex items-center justify-center rounded-full border-2 border-border p-1 text-2xl">
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
          <Button
            isLoading={isFeedbackCreateLoading}
            disabled={isFeedbackCreateLoading}
            type="submit"
          >
            Send Feedback
          </Button>
        </div>
      </form>
    </Form>
  );
};
