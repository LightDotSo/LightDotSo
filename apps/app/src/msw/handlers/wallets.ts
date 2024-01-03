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

import { http, HttpResponse } from "msw";

export const getWallets = http.get(
  "https://api.light.so/v1/wallets/demo",
  ({ params }) => {
    return HttpResponse.json([
      {
        address: "0x07beCa880a83b93983604157fefCC57377977304",
        factory_address: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
        name: "Hi 3",
        salt: "0x0000000000000000000000000000000000000000000000000000018b5ff2cb60",
      },
      {
        address: "0x0c79852CD3BB7ee5F5d70E43fD5aA9EEDdeda5CA",
        factory_address: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
        name: "shunkakinoki",
        salt: "0x0000000000000000000000000000000000000000000000000000018ba83b4bc2",
      },
      {
        address: "0x1c8fE8502a41a8d1976F78dFE24ED7c11c4F703A",
        factory_address: "0x0000000000756D3E6464f5efe7e413a0Af1C7474",
        name: "Test 5",
        salt: "0x0000000000000000000000000000000000000000000000000000018b7dc34bef",
      },
    ]);
  },
);

export const handlers = [getWallets];
