import { beforeAll, describe, it } from "vitest";
import { run } from "hardhat";

import { hardhatClient } from "@/contracts/utils/hardhatClient";
import { walletClient } from "@/contracts/utils/walletClient";

import { bytecode as lightWalletBytecode } from "@/artifacts/contracts/src/LightWallet.sol/LightWallet.json";
import { lightWalletABI } from "@lightdotso/wagmi";

beforeAll(() => {
  run("node");
});

describe("LightWallet", function () {
  it("Should return run on hardhat", async function () {
    console.log(await hardhatClient.getBlockNumber());
    const accounts = await walletClient.getAddresses();
    const [account, ...other] = accounts;
    console.log(await hardhatClient.getBalance({ address: account }));
    const hash = await walletClient.deployContract({
      abi: lightWalletABI,
      bytecode: lightWalletBytecode as `0x${string}`,
      account: accounts[0],
      args: [account],
    });
    console.log(hash);
  });
});
