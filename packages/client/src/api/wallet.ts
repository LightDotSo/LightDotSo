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

import { ResultAsync, err, ok } from "neverthrow";
import { getClient } from "../client";

// -----------------------------------------------------------------------------
// GET
// -----------------------------------------------------------------------------

export const getWallet = async (
  {
    params,
  }: {
    params: {
      query: { address: string; chain_id?: number | null | undefined };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getWalletSettings = async (
  {
    params,
  }: {
    params: {
      query: { address: string };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/settings/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getWallets = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            owner?: string | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/list", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getWalletsCount = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            owner?: string | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/wallet/list/count", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// POST
// -----------------------------------------------------------------------------

export const createWallet = async ({
  params,
  body,
}: {
  params: {
    query?: { simulate?: boolean | null | undefined } | undefined;
  };
  body: {
    name: string;
    owners: {
      address: string;
      weight: number;
    }[];
    salt: string;
    threshold: number;
    invite_code: string;
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/wallet/create", {
      // @ts-ignore
      next: { revalidate: 0 },
      params,
      body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

// -----------------------------------------------------------------------------
// PUT
// -----------------------------------------------------------------------------

export const updateWallet = async ({
  params,
  body,
}: {
  params: {
    query: { address: string };
  };
  body: {
    name?: string | null | undefined;
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.PUT("/wallet/update", {
      // @ts-ignore
      next: { revalidate: 0 },
      params,
      body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const updateWalletSettings = async ({
  params,
  body,
}: {
  params: {
    query: { address: string };
  };
  body: {
    wallet_settings: {
      is_enabled_testnet?: boolean | null | undefined;
    };
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/wallet/settings/update", {
      // @ts-ignore
      next: { revalidate: 0 },
      params,
      body,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
