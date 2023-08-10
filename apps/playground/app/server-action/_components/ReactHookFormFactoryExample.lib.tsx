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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * This file is meant to become a library that can be used to generate forms.
 * Massive work-in-progress and TBD if it becomes a lib.
 */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { UseTRPCActionResult } from "@trpc/next/app-dir/client";
import type * as server from "@trpc/next/app-dir/server";
import type { ActionHandlerDef } from "@trpc/next/dist/app-dir/shared";
import * as client from "@lightdotso/trpc";
import { useRef } from "react";
import type { UseFormProps, UseFormReturn } from "react-hook-form";
import * as reactHookForm from "react-hook-form";
import type { z } from "zod";

export function createForm<TDef extends ActionHandlerDef>(opts: {
  action: server.TRPCActionHandler<TDef>;
  schema: z.ZodSchema<any> & { _input: TDef["input"] };
  hookProps?: Omit<UseFormProps<TDef["input"]>, "resolver">;
}) {
  type FormValues = TDef["input"];
  function Form(
    props: Omit<
      JSX.IntrinsicElements["form"],
      "action" | "encType" | "method" | "onSubmit" | "ref"
    > & {
      render: (renderProps: {
        form: UseFormReturn<FormValues>;
        action: UseTRPCActionResult<TDef>;
      }) => React.ReactNode;
    },
  ) {
    const hook = reactHookForm.useForm<FormValues>({
      ...opts.hookProps,
      resolver: zodResolver(opts.schema, undefined),
    });
    const ref = useRef<HTMLFormElement>(null);
    const action = client.useAction(opts.action);
    const { render, ...passThrough }: typeof props = props;

    return (
      <reactHookForm.FormProvider {...hook}>
        <form
          {...passThrough}
          action={opts.action}
          ref={ref}
          onSubmit={hook.handleSubmit(() =>
            action.mutateAsync(new FormData(ref.current!) as any),
          )}
        >
          {render({ form: hook, action })}
        </form>
      </reactHookForm.FormProvider>
    );
  }

  Form.useWatch = reactHookForm.useWatch<FormValues>;
  Form.useFormContext = reactHookForm.useFormContext<FormValues>;

  return Form;
}
