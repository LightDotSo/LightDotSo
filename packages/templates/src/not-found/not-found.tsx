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

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  BookOpenIcon,
  BookmarkSquareIcon,
  QueueListIcon,
  RssIcon,
} from "@heroicons/react/24/solid";
import { INTERNAL_LINKS } from "@lightdotso/const";
import { LightLogo } from "@lightdotso/svg";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface NotFoundLink {
  name: string;
  href: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const links: NotFoundLink[] = [
  {
    name: "Documentation",
    href: INTERNAL_LINKS.Docs,
    description: "Learn how to integrate our tools with your app.",
    icon: BookOpenIcon,
  },
  {
    name: "API Reference",
    href: `${INTERNAL_LINKS.Docs}/api`,
    description: "A complete API reference for our libraries.",
    icon: QueueListIcon,
  },
  {
    name: "Guides",
    href: `${INTERNAL_LINKS.Docs}/guides`,
    description: "Installation guides that cover popular setups.",
    icon: BookmarkSquareIcon,
  },
  {
    name: "Blog",
    href: INTERNAL_LINKS.Blog,
    description: "Read our latest news and articles.",
    icon: RssIcon,
  },
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NotFound() {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div>
      <main className="mx-auto w-full max-w-7xl px-6 pt-10 pb-16 sm:pb-24 lg:px-8">
        <LightLogo className="mx-auto h-10 w-auto sm:h-12 md:h-16" />
        <div className="mx-auto mt-6 max-w-2xl text-center md:mt-8">
          <p className="font-semibold text-base text-text-strong leading-8">
            404
          </p>
          <h1 className="mt-4 font-bold text-3xl text-text tracking-tight sm:text-5xl">
            This page does not exist
          </h1>
          <p className="mt-4 text-base text-text-weak leading-7 sm:mt-6 sm:text-lg sm:leading-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
          <h2 className="sr-only">Popular pages</h2>
          <ul
            // biome-ignore lint/a11y/noRedundantRoles: <explanation>
            // biome-ignore lint/a11y/useSemanticElements: <explanation>
            role="list"
            className="-mt-6 divide-y divide-border-weak border-border-weak border-b"
          >
            {links.map((link, linkIdx) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={linkIdx}
                className="relative flex gap-x-6 rounded-md px-4 py-6 hover:bg-background-stronger"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-border-weak">
                  <link.icon
                    aria-hidden="true"
                    className="h-6 w-6 text-text-info"
                  />
                </div>
                <div className="flex-auto">
                  <h3 className="font-semibold text-sm text-text-weak leading-6">
                    <a href={link.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {link.name}
                    </a>
                  </h3>
                  {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                  <p className="mt-2 text-sm leading-6 text-text-weak">
                    {link.description}
                  </p>
                </div>
                <div className="flex-none self-center">
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="h-5 w-5 text-text-weak"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="font-semibold text-sm text-text-info leading-6 hover:text-text-info-weaker"
            >
              <span aria-hidden="true">&larr;</span> Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
