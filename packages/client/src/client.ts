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
import type { paths } from "./v1";

// -----------------------------------------------------------------------------
// Light
// -----------------------------------------------------------------------------

const devApiClient: ReturnType<typeof createClient<paths>> =
  createClient<paths>({
    baseUrl: "http://localhost:3000/admin/v1",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIGHT_ADMIN_TOKEN}`,
    },
    credentials: "include",
  });

const publicApiClient: ReturnType<typeof createClient<paths>> =
  createClient<paths>({
    baseUrl: "https://api.light.so/v1",
    credentials: "include",
  });

const adminApiClient: ReturnType<typeof createClient<paths>> =
  createClient<paths>({
    baseUrl: "https://api.light.so/admin/v1",
    headers: {
      Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
    },
    credentials: "include",
  });

export const rpcClient = (chainId: number, isPublic?: boolean) => {
  if (isPublic === undefined || isPublic) {
    return `https://rpc.light.so/${chainId}`;
  }

  return `https://rpc.light.so/protected/${process.env.LIGHT_RPC_TOKEN}/${chainId}`;
};

export const getClient: (
  isPublic?: boolean,
) => ReturnType<typeof createClient<paths>> = (isPublic?: boolean) =>
  process.env.LOCAL_ENV === "dev" || process.env.NEXT_PUBLIC_LOCAL_ENV === "dev"
    ? devApiClient
    : isPublic === undefined || isPublic
      ? publicApiClient
      : adminApiClient;
