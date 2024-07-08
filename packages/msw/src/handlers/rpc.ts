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

import { BASE_API_URLS } from "@lightdotso/const";
import {
  getEstimateUserOperationGas,
  getPaymasterAndData,
} from "@lightdotso/demo";
import { HttpResponse, http } from "msw";

export const getRpcHandler = (url: string) =>
  http.post(url, async ({ request }) => {
    const body = await request.json();

    // @ts-expect-error
    if (body.method === "eth_estimateGas") {
      return HttpResponse.json({ result: "0x5208" });
    }

    // @ts-expect-error
    if (body.method === "eth_getBlockByNumber") {
      return HttpResponse.json({
        result: {
          baseFeePerGas: "0x127",
          difficulty: "0x0",
          extraData: "0x",
          gasLimit: "0x1c9c380",
          gasUsed: "0x249a8f",
          hash: "0x0584691751472448901dba46e3052674518d38c8c5ba5ab95d68c56db8747d2b",
          logsBloom:
            "0x1020a00040050001004884118200010600200001000100113c0480410001000c00110108500200000820801000088080000040088000680302080864103004000110161000000148020041089400003100020000004099800021020080000000100480008a040c000008041000010cc500020c800005040000008010000800008200200005000402000c460001000a080404900700200008080220430a00000002c0100a0400c000008800c022402180400014000041000b80031000008004410102001b280100030000000404040020090020000001021041404002080820800010180900040020004110f0000005060c004000100100411900080000101008",
          miner: "0x4200000000000000000000000000000000000011",
          mixHash:
            "0x476a40cf50746645062c730f1f84cdb8644ed3ea6a7532c11bd38ada4012d39e",
          nonce: "0x0000000000000000",
          number: "0x9aac52",
          parentHash:
            "0x2ea873a9cb3da0d460f065dffde107e57392d82776ac98ab05f875df7d9c44e7",
          receiptsRoot:
            "0x886908490bbebd307eeaf511e1dd7c08b35369232fc12943f69d5b33eac4c0cd",
          sha3Uncles:
            "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
          size: "0x2f01",
          stateRoot:
            "0x12b7cde67ff3fd02688c4626278f95ae360dab52463d90814cb81a82a0c79f76",
          timestamp: "0x65bfb587",
          totalDifficulty: "0x0",
        },
      });
    }
    return HttpResponse.json({ result: "0x5208" });
  });

export const getInternalRpcHandler = (url: string) =>
  http.post(`${url}/8453`, async ({ request }) => {
    const body = await request.json();

    // @ts-expect-error
    // For `eth_estimateUserOperationGas`
    if (body.method === "eth_estimateUserOperationGas") {
      HttpResponse.json(getEstimateUserOperationGas);
    }

    // For `eth_paymasterAndDataForUserOperation
    return HttpResponse.json(getPaymasterAndData);
  });

export const rpcHandlers = [
  getInternalRpcHandler(BASE_API_URLS.BASE_RPC_URL),
  getRpcHandler("https://mainnet.base.org/"),
];
