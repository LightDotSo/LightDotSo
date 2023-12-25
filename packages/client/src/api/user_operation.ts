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

export const getUserOperation = async (
  {
    params,
  }: {
    params: {
      query: { user_operation_hash: string };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getUserOperationNonce = async (
  {
    params,
  }: {
    params: {
      query: { address: string; chain_id: number };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/nonce", {
      // @ts-ignore
      next: { revalidate: 0, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getSignatureUserOperation = async (
  {
    params,
  }: {
    params: {
      query: { user_operation_hash: string };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/signature", {
      // @ts-ignore
      next: { revalidate: 300 },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getUserOperations = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            address?: string | null | undefined;
            order?: ("asc" | "desc") | null | undefined;
            status?:
              | (
                  | "proposed"
                  | "pending"
                  | "executed"
                  | "reverted"
                  | "history"
                  | "invalid"
                )
              | null;
            is_testnet?: boolean | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/list", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getUserOperationsCount = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            address?: string | null | undefined;
            status?:
              | (
                  | "proposed"
                  | "pending"
                  | "executed"
                  | "reverted"
                  | "history"
                  | "invalid"
                )
              | null;
            is_testnet?: boolean | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/user_operation/list/count", {
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

export const createUserOperation = async ({
  params,
  body,
}: {
  params: {
    query: {
      chain_id: number;
    };
  };
  body: {
    paymaster?: {
      address: string;
      sender: string;
      sender_nonce: number;
    };
    signature: {
      owner_id: string;
      signature: string;
      signature_type: number;
    };
    user_operation: {
      chain_id: number;
      call_data: string;
      call_gas_limit: number;
      hash: string;
      init_code: string;
      max_fee_per_gas: number;
      max_priority_fee_per_gas: number;
      nonce: number;
      paymaster_and_data: string;
      pre_verification_gas: number;
      sender: string;
      verification_gas_limit: number;
    };
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/user_operation/create", {
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

export const updateUserOperation = async ({
  params,
}: {
  params: {
    query: { address: string };
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/user_operation/update", {
      // @ts-ignore
      next: { revalidate: 0 },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};
