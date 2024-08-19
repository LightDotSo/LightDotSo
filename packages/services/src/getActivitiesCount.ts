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

import {
  type GetActivitiesCountResponse,
  getActivitiesCount as getClientActivitiesCount,
} from "@lightdotso/client";
import type { ActivityListCountParams } from "@lightdotso/params";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetActivitiesCount = (params: ActivityListCountParams) => {
  void getActivitiesCount(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getActivitiesCount = async (
  params: ActivityListCountParams,
): Promise<GetActivitiesCountResponse> => {
  return await getClientActivitiesCount(
    {
      params: {
        query: {
          address: params.address,
          user_id: params.user_id,
        },
      },
    },
    "admin",
  );
};
