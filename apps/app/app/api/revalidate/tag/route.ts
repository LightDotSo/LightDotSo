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

import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

// -----------------------------------------------------------------------------
// Route
// -----------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");

  if (tag) {
    revalidateTag(tag);
    return Response.json({ revalidated: true, now: Date.now() });
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: "Missing tag to revalidate",
  });
}
