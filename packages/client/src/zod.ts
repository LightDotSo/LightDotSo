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

import { request } from "graphql-request";
import type { z } from "zod";

// -----------------------------------------------------------------------------
// Fetch
// -----------------------------------------------------------------------------

// From: https://stackoverflow.com/questions/74616841/how-to-implement-a-generic-fetch-function-that-validates-the-query-parameter-and
export const zodFetch = async <TResponseSchema extends z.Schema>(
  url: string,
  responseSchema: TResponseSchema,
  method?: "GET" | "POST" | "PUT" | "DELETE",
  headers?: Record<string, string>,
): Promise<z.infer<TResponseSchema>> => {
  const response = await fetch(url, {
    method: method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });

  const data = (await response.json()) as JsonResponseSchema;

  if (data?.error) {
    throw new Error(data.error.message);
  }

  return responseSchema.parse(data);
};

// -----------------------------------------------------------------------------
// GraphQL
// -----------------------------------------------------------------------------

export const zodGraphqlRequest = async <TResponseSchema extends z.Schema>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown>,
  responseSchema: TResponseSchema,
  headers?: Record<string, string>,
): Promise<z.infer<TResponseSchema>> => {
  const response = await request(endpoint, query, variables, headers);

  if (!response) {
    throw new Error("Failed to fetch the data");
  }

  return responseSchema.parse(response);
};

// -----------------------------------------------------------------------------
// JsonRpc
// -----------------------------------------------------------------------------

interface JsonResponseSchema {
  jsonrpc: string;
  result?: any;
  error?: { code: number; message: string; data?: any };
  id: string | number;
}

export async function zodJsonRpcFetch<
  TParams,
  TResponseSchema extends z.Schema,
>(
  url: string,
  method: string,
  params: TParams,
  responseSchema: TResponseSchema,
): Promise<z.infer<TResponseSchema>> {
  const id = Math.floor(Math.random() * 100);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: id,
    }),
  });

  const data = (await response.json()) as JsonResponseSchema;

  if (response.status !== 200) {
    if (data.error) {
      throw new Error(data.error.message);
    }
    throw new Error(`HTTP error: ${response.status}`);
  }

  if (data?.error) {
    throw new Error(data.error.message);
  }

  /* Parse and validate response using schema */
  return responseSchema.parse(data.result);
}
