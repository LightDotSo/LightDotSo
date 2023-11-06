/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable @next/next/no-img-element */
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

import { handler } from "@/handlers/paths/[address]";
import { getLlama, getQueryClient } from "@/services";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Address } from "viem";
import { notFound } from "next/navigation";
import { inngest } from "@/inngest/client";

export default async function Page({
  params,
}: {
  params: { address: string };
}) {
  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  await handler(params);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = getQueryClient();

  const res = await getLlama(params.address as Address);

  await inngest.send({
    name: "wallet/portfolio",
    data: {
      address: params.address,
    },
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  res.match(
    res => {
      queryClient.setQueryData(["llama", params.address], res);

      return (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <div>
            <pre>
              <code>{JSON.stringify(res, null, 2)}</code>
            </pre>
          </div>
        </HydrationBoundary>
      );
    },
    () => notFound(),
  );
}
