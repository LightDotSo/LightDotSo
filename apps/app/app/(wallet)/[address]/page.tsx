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

import { Loading } from "@/app/(wallet)/[address]/loading";
import { handler } from "@/handlers/[address]/handler";
import { preloader } from "@/preloaders/[address]/preloader";
import { redirect } from "next/navigation";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params }: PageProps) {
  // ---------------------------------------------------------------------------
  // Preloaders
  // ---------------------------------------------------------------------------

  preloader(await params);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await handler(await params);

  // ---------------------------------------------------------------------------
  // Redirect
  // ---------------------------------------------------------------------------

  redirect(`/${(await params).address}/overview`);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return <Loading />;
}
