// Copyright 2023-2024 LightDotSo.
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

import { createReader } from "@keystatic/core/reader";
import { NextImage } from "@lightdotso/elements";
import keystaticConfig from "~/keystatic.config";

// -----------------------------------------------------------------------------
// Reader
// -----------------------------------------------------------------------------

const reader = createReader(process.cwd(), keystaticConfig);

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page() {
  // ---------------------------------------------------------------------------
  // Reader
  // ---------------------------------------------------------------------------

  const changelogs = await reader.collections.posts.all();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ul className="space-y-6">
      {changelogs.map((changelog) => (
        <li key={changelog.slug} className="group">
          <a href={`/changelog/${changelog.slug}`}>
            <NextImage
              placeholder="blur"
              className="rounded-sm group-hover:opacity-80"
              src={changelog.entry.ogp.src}
              alt={changelog.entry.title}
              width={1200}
              height={630}
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
            <div className="flex justify-between mt-4">
              <div className="font-bold text-xl text-text tracking-tight sm:text-3xl group-hover:underline">
                {changelog.entry.title}
              </div>
              <div className="text-lg group-hover:underline">
                {new Date(changelog.entry.date).toLocaleDateString()}
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
