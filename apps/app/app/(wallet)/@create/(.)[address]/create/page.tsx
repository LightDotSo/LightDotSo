// Copyright 2023-2024 Light.
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

import { ModalInterception } from "@lightdotso/templates";
import type { Address } from "viem";
import { ModalInterceptionFooter } from "@/app/(wallet)/@create/(.)[address]/create/(components)/modal-interception-footer";
import OriginalPage from "@/app/(wallet)/[address]/create/page";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string };
  searchParams: {
    userOperations?: string;
  };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default async function Page({ params, searchParams }: PageProps) {
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ModalInterception
      isOverflowHidden
      isHeightFixed
      footerContent={
        <ModalInterceptionFooter address={params.address as Address} />
      }
      type="create"
    >
      <OriginalPage params={params} searchParams={searchParams} />
    </ModalInterception>
  );
}
