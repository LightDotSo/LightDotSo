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

import { beforeAll, describe, it, expect } from "vitest";
import { run } from "hardhat";
// import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { publicClient, walletClient } from "@/contracts/spec/utils";
//@ts-expect-error
import { LightWallet } from "@/contracts/LightWallet.sol";

beforeAll(() => {
  run("node");
});

describe("LightWallet", function () {
  it("Should return run correct function parameters on hardhat", async function () {
    console.log(LightWallet);
    console.log(await publicClient.getBlockNumber());
    const accounts = await walletClient.getAddresses();
    const [account, ...other] = accounts;
    console.log(await publicClient.getBalance({ address: account }));
    const hash = await walletClient.deployContract({
      abi: LightWallet.abi,
      bytecode: LightWallet.bytecode as `0x${string}`,
      account: accounts[0],
      args: [account],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const data = await publicClient.readContract({
      address: receipt.contractAddress as `0x${string}`,
      abi: LightWallet.abi,
      functionName: "proxiableUUID",
    });
    expect(data).to.equal(
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    );
  });
});
