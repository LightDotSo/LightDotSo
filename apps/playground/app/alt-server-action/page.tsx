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

import { readFile } from "node:fs/promises";
import { Button } from "@lightdotso/ui";
import { CodeBlock } from "@/components/codeblocks";
import { CollapsiblePreview } from "@/components/collapsible-preview";
import { Input } from "@/components/input";
import { JsonPreTag } from "@/components/json-pretag";
import { api } from "@/trpc/server-http";
import { Suspense } from "react";
import { createPostAction } from "./_actions";
import { WithHook } from "./with-hook";

export default async function Page() {
  const post = await api.getLatestPost.query();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Post</h1>
        <JsonPreTag object={post} />
      </div>

      <h1 className="text-xl font-bold">Create post</h1>
      <form action={createPostAction} className="space-y-2">
        <Input type="text" name="title" placeholder="title" />
        <Input type="text" name="content" placeholder="content" />
        <Button type="submit">Create</Button>
      </form>

      <WithHook />

      <div className="space-y-2">
        <h2 className="text-lg font-bold">Code</h2>
        <Suspense fallback={"Reading page source..."}>
          <h3 className="font-semibold">_actions.ts</h3>
          <ComponentCode path="./_actions.ts" />
          <h3 className="font-semibold">page.tsx</h3>
          <ComponentCode path="./page.tsx" />
          <h3 className="font-semibold">with-hook.tsx</h3>
          <ComponentCode path="./with-hook.tsx" />
        </Suspense>
      </div>
    </div>
  );
}

async function ComponentCode(props: { path: string; expandText?: string }) {
  const fileContent = await readFile(
    new URL(props.path, import.meta.url),
    "utf-8",
  );

  return (
    <CollapsiblePreview expandButtonTitle={props.expandText}>
      <CodeBlock code={fileContent} lang="tsx" />
    </CollapsiblePreview>
  );
}
