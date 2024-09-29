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

// import { publicClient, walletClient } from "@/contracts/test/spec/utils";
// import { accounts } from "@/contracts/test/spec/utils/constants";
//@ts-expect-error
import { LightWallet } from "@/contracts/LightWallet.sol";
import { subdigestOf } from "@lightdotso/sequence";
import { expect, test } from "vitest";

// describe("LightWallet", function () {
//   it("Should return run correct function parameters on hardhat", async function () {
//     console.warn(await publicClient.getBlockNumber());
//     const account = accounts[0].address;
//     const hash = await walletClient.deployContract({
//       abi: LightWallet.abi,
//       bytecode: LightWallet.bytecode as `0x${string}`,
//       account: account,
//       args: [account],
//       chain: undefined,
//     });
//     const receipt = await publicClient.waitForTransactionReceipt({ hash });
//     const data = await publicClient.readContract({
//       address: receipt.contractAddress as `0x${string}`,
//       abi: LightWallet.abi,
//       functionName: "proxiableUUID",
//     });
//     expect(data).to.equal(
//       "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
//     );
//   });
// });

test("LightWallet: Correct humanReadableAbi", () => {
  expect(Object.values(LightWallet.humanReadableAbi)).toMatchInlineSnapshot(`
    [
    ]
  `);
});

test("Should return correct subdigest", () => {
  const ls = subdigestOf(`0x${"00".repeat(20)}`, new Uint8Array(32), 1n);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn(ls);
});
