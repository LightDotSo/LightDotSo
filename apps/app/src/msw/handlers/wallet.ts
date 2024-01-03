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

import { BASE_API_URL, BASE_LOCAL_ADMIN_URL } from "@/const/api";
import { http, HttpResponse } from "msw";

export const getWallet = (url: string) =>
  http.get(`${url}/v1/wallet/get`, () => {
    return HttpResponse.json({
      address: "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F",
      factory_address: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
      name: "Demo",
      salt: "0x0000000000000000000000000000000000000000000000000000018bac7d2d77",
    });
  });

export const getWallets = (url: string) =>
  http.get(`${url}/v1/wallet/list`, () => {
    return HttpResponse.json([
      {
        address: "0x07beCa880a83b93983604157fefCC57377977304",
        factory_address: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
        name: "Demo",
        salt: "0x0000000000000000000000000000000000000000000000000000018b5ff2cb60",
      },
    ]);
  });

export const handlers = [
  getWallet(BASE_LOCAL_ADMIN_URL),
  getWallet(BASE_API_URL),
  getWallets(BASE_LOCAL_ADMIN_URL),
  getWallets(BASE_API_URL),
];
