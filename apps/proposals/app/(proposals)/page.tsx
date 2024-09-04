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

  const proposals = await reader.collections.posts.all();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ul className="text-lg hover:underline">
      {proposals.map((proposal) => (
        <li key={proposal.slug} className="group col-span-1">
          <a
            href={`${process.env.VERCEL_ENV === "production" ? "/proposals/" : "/"}${proposal.slug}`}
          >
            <div className="aspect-h-9 aspect-w-16 cursor-pointer overflow-hidden rounded-sm transition duration-300 group-hover:opacity-80">
              <NextImage
                placeholder="blur"
                src={proposal.entry.ogp.src}
                alt={proposal.entry.title}
                width={1200}
                height={630}
              />
            </div>
            <div className="mt-2 font-bold text-text text-xl tracking-tight group-hover:underline sm:text-3xl">
              {proposal.entry.title}
            </div>
            <div className="group-hover:underline">
              {refineDateFormat(new Date(proposal.entry.date))}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
