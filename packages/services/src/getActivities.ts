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
  type GetActivitiesResponse,
  getActivities as getClientActivities,
} from "@lightdotso/client";
import type { ActivityListParams } from "@lightdotso/params";
import "server-only";

// -----------------------------------------------------------------------------
// Pre
// -----------------------------------------------------------------------------

export const preloadGetActivities = (params: ActivityListParams) => {
  void getActivities(params);
};

// -----------------------------------------------------------------------------
// Service
// -----------------------------------------------------------------------------

export const getActivities = async (
  params: ActivityListParams,
): Promise<GetActivitiesResponse> => {
  return await getClientActivities(
    {
      params: {
        query: {
          address: params.address,
          limit: params.limit,
          offset: params.offset,
          user_id: params.user_id,
        },
      },
    },
    "admin",
  );
};
