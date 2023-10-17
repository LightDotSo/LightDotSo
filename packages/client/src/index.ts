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
import { zodFetch } from "./zod";
import { llamaSchema } from "@lightdotso/schemas";

const publicClient = createClient<paths>({
  baseUrl: "https://api.light.so/v1",
});

const adminClient = createClient<paths>({
  baseUrl: "https://api.light.so/admin/v1",
  headers: {
    Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
  },
});

const getClient = (isPublic: boolean) =>
  isPublic ? publicClient : adminClient;

export const getWallet = async ({
  address,
  isPublic = false,
}: {
  address: string;
  isPublic?: boolean;
}) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/get", {
      params: {
        query: {
          address: address,
        },
      },
    }),
    () => new Error("Database error"),
  );
};

export const getWallets = async ({
  owner,
  isPublic = false,
}: {
  owner: string;
  isPublic?: boolean;
}) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/list", {
      params: {
        query: {
          owner,
        },
      },
    }),
    () => new Error("Database error"),
  );
};

export const createWallet = async ({
  params,
  simulate = true,
}: {
  params: {
    name: string;
    owners: {
      address: string;
      weight: number;
    }[];
    salt: string;
    threshold: number;
  };
  simulate?: boolean;
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/wallet/create", {
      params: {
        query: {
          simulate,
        },
      },
      body: params,
    }),
    () => new Error("Database error"),
  );
};

export const getLlama = async (address: string) => {
  return zodFetch(
    `https://api.llamafolio.com/balances/${address}`,
    llamaSchema,
  );
};
