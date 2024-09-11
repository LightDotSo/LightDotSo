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

import { toThreeDigits } from "@/utils";
import { createReader } from "@keystatic/core/reader";
import { NextImage } from "@lightdotso/elements/next-image";
import { refineDateFormat } from "@lightdotso/utils";
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

  const changelogs = (await reader.collections.posts.all()).sort((a, b) => {
    return new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime();
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ul className="space-y-6 md:space-y-12">
      {changelogs.map((changelog) => (
        <li key={changelog.slug} className="group">
          <a
            href={`${process.env.VERCEL_ENV === "production" ? "/changelog/" : "/"}${toThreeDigits(changelog.entry.issue)}`}
          >
            <NextImage
              className="rounded-sm border border-border group-hover:opacity-80"
              src={changelog.entry.ogp.src}
              alt={changelog.entry.title}
              width={1920}
              height={1080}
              style={{ width: "100%", height: "auto", objectFit: "cover" }}
            />
            <div className="mt-4 flex items-center justify-between">
              <div className="font-bold text-text text-xl tracking-tight group-hover:underline sm:text-3xl">
                #{toThreeDigits(changelog.entry.issue)} -{" "}
                {changelog.entry.title}
              </div>
              <div className="text-lg group-hover:underline">
                {refineDateFormat(new Date(changelog.entry.date))}
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
