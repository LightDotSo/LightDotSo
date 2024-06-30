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

import { BASE_API_URLS } from "@lightdotso/const";
import { tokenPriceGetData } from "@lightdotso/demo";
import { HttpResponse, http } from "msw";

export const getTokenPrice = (url: string) =>
  http.get(
    `${url}/v1/token_price/get?address=0xc2132D05D31c914a87C6611C10748AEb04B58e8F&chain_id=137`,
    () => {
      return HttpResponse.json(tokenPriceGetData);
    },
  );

export const tokenPriceHandlers = [
  getTokenPrice(BASE_API_URLS.BASE_LOCAL_API_ADMIN_URL),
  getTokenPrice(BASE_API_URLS.BASE_API_AUTHENTICATED_URL),
  getTokenPrice(BASE_API_URLS.BASE_API_URL),
];
