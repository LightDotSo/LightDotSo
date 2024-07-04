// Copyright 2023-2024 Light, Inc.
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
import { ModalInterceptionFooter } from "@/app/(wallet)/@send/(.)[address]/send/(components)/modal-interception-footer";
import OriginalPage from "@/app/(wallet)/[address]/send/page";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type PageProps = {
  params: { address: string };
  searchParams: {
    transfers?: string;
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
    <ModalInterception footerContent={<ModalInterceptionFooter />} type="send">
      <OriginalPage params={params} searchParams={searchParams} />
    </ModalInterception>
  );
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

// export const runtime = "edge";
