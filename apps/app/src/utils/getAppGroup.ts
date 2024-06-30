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

import type { AppGroup } from "@lightdotso/types";
import {
  AUTHENTICATED_PATHS,
  DEMO_PATHS,
  SWAP_PATHS,
  UNAUTHENTICATED_PATHS,
} from "@/const";

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

export const getAppGroup = (pathname: string): AppGroup => {
  if (
    UNAUTHENTICATED_PATHS.some(path => pathname.startsWith(path)) ||
    pathname === "/"
  ) {
    return "unauthenticated";
  }

  if (AUTHENTICATED_PATHS.some(path => pathname.startsWith(path))) {
    return "authenticated";
  }

  if (DEMO_PATHS.some(path => pathname.startsWith(path))) {
    return "demo";
  }

  if (SWAP_PATHS.some(path => pathname.startsWith(path))) {
    return "swap";
  }

  return "wallet";
};
