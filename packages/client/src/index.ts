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

import createClient from "openapi-fetch";
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import type { paths, Without, XOR, OneOf } from "./v1";
import { ResultAsync } from "neverthrow";

const client = createClient<paths>({
  baseUrl: "https://api.light.so/v1",
});

export const getWallet = async (address: string) =>
  ResultAsync.fromPromise(
    client.GET("/wallet/get", {
      params: {
        query: {
          address: address,
        },
      },
    }),
    () => new Error("Database error"),
  );
