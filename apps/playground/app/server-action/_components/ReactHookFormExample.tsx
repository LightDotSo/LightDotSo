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
import { Button } from "@lightdotso/ui";
import { Input } from "@/components/input";
import { JsonPreTag } from "@/components/json-pretag";
import { useRef } from "react";
import type { UseFormProps } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";
import { useAction } from "trpc-api";
import type { z } from "zod";
import { rhfAction } from "./ReactHookFormExample.action";
import { rhfActionSchema } from "./ReactHookFormExample.schema";

/**
 * Reusable hook for zod + react-hook-form
 */
function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  },
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}

export function ReactHookFormExample() {
  const mutation = useAction(rhfAction);
  const form = useZodForm({
    schema: rhfActionSchema,
  });
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-2">
      <p>Check the console for the logger output.</p>
      <FormProvider {...form}>
        <form
          action={rhfAction}
          ref={formRef}
          onSubmit={form.handleSubmit(async () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await mutation.mutateAsync(new FormData(formRef.current!));
          })}
          className="space-y-2"
        >
          <Input type="text" {...form.register("text")} />
          <Button type="submit">Run server action raw debugging</Button>

          <h2>Form state</h2>
          <JsonPreTag
            object={{
              isSubmitting: form.formState.isSubmitting,
            }}
          />
          <h2>Mutation state</h2>
          <JsonPreTag object={mutation} />
        </form>
      </FormProvider>
    </div>
  );
}
