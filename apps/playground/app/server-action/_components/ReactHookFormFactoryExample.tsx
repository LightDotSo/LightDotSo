/* eslint-disable react/prop-types */
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

import { Button } from "@lightdotso/ui";
import { Input } from "@/components/input";
import { JsonPreTag } from "@/components/json-pretag";
import { useEffect, useRef } from "react";
import { rhfAction } from "./ReactHookFormExample.action";
import { rhfActionSchema } from "./ReactHookFormExample.schema";
import { createForm } from "./ReactHookFormFactoryExample.lib";

const MyForm = createForm({
  action: rhfAction,
  schema: rhfActionSchema,
});

function FormState() {
  const context = MyForm.useFormContext();
  const textValue = MyForm.useWatch({
    name: "text",
  });

  return (
    <JsonPreTag
      object={{
        isSubmitting: context.formState.isSubmitting,
        fieldValue: textValue,
      }}
    />
  );
}

function RenderCount() {
  const renderCount = useRef(1);
  useEffect(() => {
    renderCount.current++;
  });
  return (
    <JsonPreTag
      object={{
        renderCount: renderCount.current,
      }}
    />
  );
}

export function ReactHookFormFactoryExample() {
  return (
    <div>
      <p>This is a playground for an imaginary form abstraction</p>
      <MyForm
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="my-form"
        render={props => {
          // eslint-disable-next-line react/prop-types
          const { form, action } = props;
          return (
            <div className="space-y-2">
              <Input type="text" {...form.register("text")} />
              <Button type="submit">Submit</Button>

              <div>
                <h2>Form state</h2>
                <FormState />
              </div>
              <div>
                <h2>Action state</h2>
                <JsonPreTag object={action} />
              </div>
              <div>
                <h2>Render count</h2>
                <RenderCount />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
