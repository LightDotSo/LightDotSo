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

import { BASE_RPC_URL } from "@lightdotso/const";
import { getPaymasterAndData } from "@lightdotso/demo";
import { HttpResponse, http } from "msw";

export const getPaymasterGasAndPaymasterAndData = (url: string) =>
  http.post(`https://rpc.light.so/8453`, () => {
    return HttpResponse.json(getPaymasterAndData);
  });

export const rpcHandlers = [getPaymasterGasAndPaymasterAndData(BASE_RPC_URL)];
