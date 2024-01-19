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
import type { paths as ApiPaths } from "./types/api/v1";
import type { paths as LifiPaths } from "./types/lifi/v1";
import type { paths as SocketPaths } from "./types/socket/v2";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ClientType = "admin" | "authenticated" | "public";

// -----------------------------------------------------------------------------
// Simplehash
// -----------------------------------------------------------------------------

export const getSimplehashClient = (clientType?: ClientType) => {
  if (clientType === "admin") {
    return "https://api.simplehash.com/api/v0";
  }

  return "https://api.light.so/simplehash";
};

// -----------------------------------------------------------------------------
// Lifi
// -----------------------------------------------------------------------------

export const lifiClient: ReturnType<typeof createClient<LifiPaths>> =
  createClient<LifiPaths>({
    baseUrl: "https://li.quest/v1",
  });

// -----------------------------------------------------------------------------
// Socket
// -----------------------------------------------------------------------------

export const officialSocketClient: ReturnType<
  typeof createClient<SocketPaths>
> = createClient<SocketPaths>({
  baseUrl: "https://api.socket.tech",
});

export const localSocketClient: ReturnType<typeof createClient<SocketPaths>> =
  createClient<SocketPaths>({
    baseUrl: "http://localhost:3000",
  });

export const publicSocketClient: ReturnType<typeof createClient<SocketPaths>> =
  createClient<SocketPaths>({
    baseUrl: "https://api.light.so",
    credentials: "include",
  });

export const authenticatedSocketClient: ReturnType<
  typeof createClient<SocketPaths>
> = createClient<SocketPaths>({
  baseUrl: "https://api.light.so/authenticated",
  credentials: "include",
});

export const adminSocketClient: ReturnType<typeof createClient<SocketPaths>> =
  createClient<SocketPaths>({
    baseUrl: "https://api.light.so/admin",
    headers: {
      Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
    },
    credentials: "include",
  });

export const getSocketClient: (
  clientType?: "admin" | "authenticated" | "public",
) => ReturnType<typeof createClient<SocketPaths>> = clientType =>
  clientType === "public"
    ? publicSocketClient
    : process.env.LOCAL_ENV === "dev" ||
        process.env.NEXT_PUBLIC_LOCAL_ENV === "dev"
      ? localSocketClient
      : clientType === undefined
        ? publicSocketClient
        : clientType === "authenticated"
          ? authenticatedSocketClient
          : adminSocketClient;

// -----------------------------------------------------------------------------
// Light
// -----------------------------------------------------------------------------

const localAdminApiClient: ReturnType<typeof createClient<ApiPaths>> =
  createClient<ApiPaths>({
    baseUrl: "http://localhost:3000/admin/v1",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIGHT_ADMIN_TOKEN}`,
    },
    credentials: "include",
  });

const publicApiClient: ReturnType<typeof createClient<ApiPaths>> =
  createClient<ApiPaths>({
    baseUrl: "https://api.light.so/v1",
    credentials: "include",
  });

const authenticatedApiClient: ReturnType<typeof createClient<ApiPaths>> =
  createClient<ApiPaths>({
    baseUrl: "https://api.light.so/authenticated/v1",
    credentials: "include",
  });

const adminApiClient: ReturnType<typeof createClient<ApiPaths>> =
  createClient<ApiPaths>({
    baseUrl: "https://api.light.so/admin/v1",
    headers: {
      Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
    },
    credentials: "include",
  });

export const getClient: (
  clientType?: "admin" | "authenticated" | "public",
) => ReturnType<typeof createClient<ApiPaths>> = clientType =>
  clientType === "public"
    ? publicApiClient
    : process.env.LOCAL_ENV === "dev" ||
        process.env.NEXT_PUBLIC_LOCAL_ENV === "dev"
      ? localAdminApiClient
      : clientType === undefined
        ? publicApiClient
        : clientType === "authenticated"
          ? authenticatedApiClient
          : adminApiClient;

// -----------------------------------------------------------------------------
// RPC
// -----------------------------------------------------------------------------

export const rpcClient = (chainId: number, clientType?: ClientType) => {
  if (clientType === undefined || clientType === "public") {
    return `https://rpc.light.so/${chainId}`;
  }

  return `https://rpc.light.so/protected/${process.env.LIGHT_RPC_TOKEN}/${chainId}`;
};
