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

import {
  BASE_API_AUTHENTICATED_URL,
  BASE_API_URL,
  BASE_LOCAL_API_URL,
  BASE_LOCAL_API_ADMIN_URL,
} from "@lightdotso/const";
import { socketBalancesListData } from "@lightdotso/demo";
import { HttpResponse, http } from "msw";

export const getSocketBalances = (url: string) =>
  http.post(`${url}/socket/v2/balances`, () => {
    return HttpResponse.json(socketBalancesListData);
  });

export const socketHandlers = [
  getSocketBalances(BASE_LOCAL_API_URL),
  getSocketBalances(BASE_LOCAL_API_ADMIN_URL),
  getSocketBalances(BASE_API_AUTHENTICATED_URL),
  getSocketBalances(BASE_API_URL),
];
