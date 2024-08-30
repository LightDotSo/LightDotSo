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

import { Button } from "@lightdotso/ui/components/button";
import Link from "next/link";
import type { FC } from "react";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const NotFound: FC = () => {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32">
      <div className="text-center">
        <p className="font-semibold text-accent text-base">404</p>
        <h1 className="mt-4 font-bold text-3xl text-text tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-6 text-base text-text-weak leading-7">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/">Go back home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/support">
              Contact support{" "}
              <span aria-hidden="true" className="ml-1">
                &rarr;
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
};
