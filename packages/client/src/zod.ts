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

import type { z } from "zod";

// From: https://stackoverflow.com/questions/74616841/how-to-implement-a-generic-fetch-function-that-validates-the-query-parameter-and
export const zodFetch = async <TResponseSchema extends z.Schema>(
  url: string,
  responseSchema: TResponseSchema,
): Promise<z.infer<TResponseSchema>> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });

  return responseSchema.parse(await response.json());
};

interface JsonResponseSchema {
  jsonrpc: string;
  result?: any;
  error?: { code: number; message: string; data?: any };
  id: string | number;
}

export async function zodJsonRpcFetch<TResponseSchema extends z.Schema>(
  url: string,
  method: string,
  params: unknown[],
  responseSchema: TResponseSchema,
  id: string | number = Math.random(),
): Promise<z.infer<TResponseSchema>> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id,
    }),
  });

  const data = (await response.json()) as JsonResponseSchema;

  if (data?.error) {
    throw new Error(`JSON-RPC Error: ${data.error.message}`);
  }

  /* Parse and validate response using schema */
  return responseSchema.parse(data.result);
}
