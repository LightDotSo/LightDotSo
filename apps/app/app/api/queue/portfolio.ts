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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAddress } from "viem";
import { kafka } from "@/clients/kafka";
import { ratelimit } from "@/clients/redis";

export async function POST(request: NextRequest) {
  const id = request.ip ?? "anonymous";
  const limit = await ratelimit.limit(id ?? "anonymous");

  if (!limit.success) {
    return NextResponse.json(limit, { status: 429 });
  }

  const addr = request.nextUrl.searchParams.get("address");

  if (addr && isAddress(addr)) {
    kafka.producer().produce("covalent", {
      address: addr,
    });
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: "Successfully invoked portfolio queue",
  });
}
