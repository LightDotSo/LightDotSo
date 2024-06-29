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

import { getSocketBalances as getClientSocketBalances } from "@lightdotso/client";
import type { SocketBalanceParams } from "@lightdotso/params";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetSocketBalances = (params: SocketBalanceParams) => {
  void getSocketBalances(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getSocketBalances = async (params: SocketBalanceParams) => {
  return getClientSocketBalances(
    {
      parameters: {
        query: {
          userAddress: params.address!,
        },
      },
    },
    "admin",
  );
};
