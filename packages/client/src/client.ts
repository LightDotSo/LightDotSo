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

import createClient from "openapi-fetch";
import type { paths as ApiPaths } from "./types/api/v1";
import type { paths as LifiPaths } from "./types/lifi/v1";
import type { paths as SocketPaths } from "./types/socket/v2";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ClientType = "admin" | "authenticated" | "public";

// -----------------------------------------------------------------------------
// Ens
// -----------------------------------------------------------------------------

export const ensClient = () => "https://router.light.so/ens";

// -----------------------------------------------------------------------------
// Simplehash
// -----------------------------------------------------------------------------

export const getSimplehashClient = () => "https://router.light.so/simplehash";

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
    baseUrl: "http://localhost:3000/socket",
  });

export const publicSocketClient: ReturnType<typeof createClient<SocketPaths>> =
  createClient<SocketPaths>({
    baseUrl: "https://router.light.so/socket",
    credentials: "include",
  });

export const authenticatedSocketClient: ReturnType<
  typeof createClient<SocketPaths>
> = createClient<SocketPaths>({
  baseUrl: "https://router.light.so/socket",
  // baseUrl: "https://api.light.so/authenticated/v1/socket",
  // credentials: "include",
});

export const adminSocketClient: ReturnType<typeof createClient<SocketPaths>> =
  createClient<SocketPaths>({
    baseUrl: "https://router.light.so/socket",
    // baseUrl: "https://api.light.so/admin/v1/socket",
    // headers: {
    // Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
    // },
    // credentials: "include",
  });

export const getSocketClient: (
  clientType?: "admin" | "authenticated" | "public",
) => ReturnType<typeof createClient<SocketPaths>> = clientType =>
  process.env.LOCAL_ENV === "dev" ||
  process.env.NEXT_PUBLIC_LOCAL_ENV === "dev" ||
  process.env.STORYBOOK_ENV === "dev"
    ? localSocketClient
    : clientType === undefined
      ? publicSocketClient
      : clientType === "authenticated"
        ? authenticatedSocketClient
        : adminSocketClient;

// -----------------------------------------------------------------------------
// Light
// -----------------------------------------------------------------------------

const localApiClient: ReturnType<typeof createClient<ApiPaths>> =
  createClient<ApiPaths>({
    baseUrl: "http://localhost:3000/v1",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIGHT_ADMIN_TOKEN}`,
    },
    credentials: "include",
  });

const localAuthenticatedApiClient: ReturnType<typeof createClient<ApiPaths>> =
  createClient<ApiPaths>({
    baseUrl: "http://localhost:3000/authenticated/v1",
    credentials: "include",
  });

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
  (process.env.LOCAL_ENV === "dev" ||
    process.env.NEXT_PUBLIC_LOCAL_ENV === "dev") &&
  clientType === "admin"
    ? localAdminApiClient
    : (process.env.LOCAL_ENV === "dev" ||
          process.env.NEXT_PUBLIC_LOCAL_ENV === "dev") &&
        clientType === "authenticated"
      ? localAuthenticatedApiClient
      : process.env.LOCAL_ENV === "dev" ||
          process.env.NEXT_PUBLIC_LOCAL_ENV === "dev"
        ? localApiClient
        : clientType === undefined
          ? publicApiClient
          : clientType === "authenticated"
            ? authenticatedApiClient
            : adminApiClient;

// -----------------------------------------------------------------------------
// RPC
// -----------------------------------------------------------------------------

export const rpcClient = (chainId: number, clientType?: ClientType) => {
  if (
    clientType === undefined ||
    clientType === "public" ||
    clientType === "authenticated"
  ) {
    return `https://rpc.light.so/${chainId}`;
  }

  return `https://rpc.light.so/protected/${process.env.LIGHT_RPC_TOKEN}/${chainId}`;
};
