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

import {
  llamaGetSchema,
  llamaPostSchema,
  nftsByOwnerSchema,
} from "@lightdotso/schemas";
import { ResultAsync, err, ok } from "neverthrow";
import createClient from "openapi-fetch";
import { z } from "zod";
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import type { paths, Without, XOR, OneOf } from "./v1";
import { zodFetch, zodJsonRpcFetch } from "./zod";

// -----------------------------------------------------------------------------
// Light
// -----------------------------------------------------------------------------

const devApiClient = createClient<paths>({
  baseUrl: "http://localhost:3000/admin/v1",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIGHT_ADMIN_TOKEN}`,
  },
});

const publicApiClient = createClient<paths>({
  baseUrl: "https://api.light.so/v1",
});

const adminApiClient = createClient<paths>({
  baseUrl: "https://api.light.so/admin/v1",
  headers: {
    Authorization: `Bearer ${process.env.LIGHT_ADMIN_TOKEN}`,
  },
});

const rpcClient = (chainId: number, isPublic?: boolean) => {
  if (isPublic === undefined || isPublic) {
    return `https://rpc.light.so/${chainId}`;
  }

  return `https://rpc.light.so/protected/${process.env.LIGHT_RPC_TOKEN}/${chainId}`;
};

const getClient = (isPublic?: boolean) =>
  process.env.LOCAL_ENV === "dev" || process.env.NEXT_PUBLIC_LOCAL_ENV === "dev"
    ? devApiClient
    : isPublic === undefined || isPublic
      ? publicApiClient
      : adminApiClient;

export const getConfiguration = async (
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
    client.GET("/configuration/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

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

export const getWalletTab = async (
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
    client.GET("/wallet/tab", {
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

export const createFeedback = async ({
  params,
  body,
}: {
  params: {
    query: { user_id: string };
  };
  body: {
    feedback: {
      emoji: string;
      text: string;
    };
  };
}) => {
  const client = getClient(true);

  return ResultAsync.fromPromise(
    client.POST("/feedback/create", {
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

export const getPortfolio = async (
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
    client.GET("/portfolio/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getUser = async (
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
    client.GET("/user/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

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
      next: { revalidate: 300, tags: [params.query.address] },
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

export const getToken = async (
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
    client.GET("/token/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getTokens = async (
  {
    params,
  }: {
    params: {
      query: {
        offset?: number | null | undefined;
        limit?: number | null | undefined;
        address: string;
        is_testnet?: boolean | null | undefined;
      };
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/token/list", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getTokenPrice = async (
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
    client.GET("/token_price/get", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
      params,
    }),
    () => new Error("Database error"),
  ).andThen(({ data, response, error }) => {
    return response.status === 200 && data ? ok(data) : err(error);
  });
};

export const getTransactions = async (
  {
    params,
  }: {
    params: {
      query?:
        | {
            offset?: number | null | undefined;
            limit?: number | null | undefined;
            address?: string | null | undefined;
          }
        | undefined;
    };
  },
  isPublic?: boolean,
) => {
  const client = getClient(isPublic);

  return ResultAsync.fromPromise(
    client.GET("/transaction/list", {
      // @ts-ignore
      next: { revalidate: 300, tags: [params.query.address] },
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
            direction?: ("asc" | "desc") | null | undefined;
            status?: ("proposed" | "pending" | "executed" | "reverted") | null;
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

// -----------------------------------------------------------------------------
// Simplehash
// -----------------------------------------------------------------------------

export const getNftsByOwner = async (address: string) => {
  return ResultAsync.fromPromise(
    zodFetch(
      `https://api.simplehash.com/api/v0/nfts/owners?chains=polygon,ethereum&wallet_addresses=${address}&limit=50`,
      nftsByOwnerSchema,
      "GET",
      {
        revalidate: 300,
        tags: [address],
      },
      {
        "X-API-KEY": process.env.SIMPLEHASH_API_KEY!,
      },
    ),
    err => {
      if (err instanceof Error) {
        throw err;
      }
    },
  );
};

// -----------------------------------------------------------------------------
// Llama
// -----------------------------------------------------------------------------

export const getLlama = async (address: string) => {
  return ResultAsync.fromPromise(
    zodFetch(
      `https://api.llamafolio.com/balances/${address}`,
      llamaGetSchema,
      "GET",
      {
        revalidate: 300,
        tags: [address],
      },
    ),
    err => {
      if (err instanceof Error) {
        throw err;
      }
    },
  );
};

export const postLlama = async (address: string) => {
  return ResultAsync.fromPromise(
    zodFetch(
      `https://api.llamafolio.com/balances/${address}`,
      llamaPostSchema,
      "POST",
    ),
    err => {
      if (err instanceof Error) {
        throw err;
      }
    },
  );
};

const EthChainIdResultSchema = z
  .string()
  .refine(value => /^0x[0-9a-fA-F]+$/.test(value), {
    message: "ChainId must be a hexadecimal string",
  });

export const getChainId = async () => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      "https://rpc.light.so/1",
      "eth_chainId",
      [],
      EthChainIdResultSchema,
      {
        revalidate: 0,
      },
    ),
    e => e,
  );
};

const HexStringSchema = z
  .string()
  .refine(value => /^0x[0-9a-fA-F]*$/.test(value), {
    message: "Must be a hexadecimal string",
  });

const SendUserOperationResponse = z.string();

const SendUserOperationRequest = z.array(
  z
    .object({
      sender: HexStringSchema,
      nonce: HexStringSchema,
      initCode: HexStringSchema,
      callData: HexStringSchema,
      signature: HexStringSchema,
      paymasterAndData: HexStringSchema,
      callGasLimit: HexStringSchema.optional(),
      verificationGasLimit: HexStringSchema.optional(),
      preVerificationGas: HexStringSchema.optional(),
      maxFeePerGas: HexStringSchema.optional(),
      maxPriorityFeePerGas: HexStringSchema.optional(),
    })
    .or(z.string()),
);

type SendUserOperationRequestType = z.infer<typeof SendUserOperationRequest>;

export const sendUserOperation = async (
  chainId: number,
  params: SendUserOperationRequestType,
  isPublic?: boolean,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, isPublic),
      "eth_sendUserOperation",
      params,
      SendUserOperationResponse,
      {
        revalidate: 0,
      },
    ),
    e => e,
  );
};

const PaymasterGasAndPaymasterAndDataResponse = z.object({
  paymasterNonce: HexStringSchema,
  paymasterAndData: HexStringSchema,
  callGasLimit: HexStringSchema,
  verificationGasLimit: HexStringSchema,
  preVerificationGas: HexStringSchema,
  maxFeePerGas: HexStringSchema,
  maxPriorityFeePerGas: HexStringSchema,
});

const PaymasterGasAndPaymasterAndDataRequest = z.array(
  z.object({
    sender: HexStringSchema,
    nonce: HexStringSchema,
    initCode: HexStringSchema,
    callData: HexStringSchema,
    signature: HexStringSchema,
    paymasterAndData: HexStringSchema,
    callGasLimit: HexStringSchema.optional(),
    verificationGasLimit: HexStringSchema.optional(),
    preVerificationGas: HexStringSchema.optional(),
    maxFeePerGas: HexStringSchema.optional(),
    maxPriorityFeePerGas: HexStringSchema.optional(),
  }),
);

type PaymasterGasAndPaymasterAndDataRequestType = z.infer<
  typeof PaymasterGasAndPaymasterAndDataRequest
>;

export const getPaymasterGasAndPaymasterAndData = async (
  chainId: number,
  params: PaymasterGasAndPaymasterAndDataRequestType,
  isPublic?: boolean,
) => {
  return ResultAsync.fromPromise(
    zodJsonRpcFetch(
      rpcClient(chainId, isPublic),
      "paymaster_requestGasAndPaymasterAndData",
      params,
      PaymasterGasAndPaymasterAndDataResponse,
      {
        revalidate: 0,
      },
    ),
    e => e,
  );
};
