import { beforeAll, describe, it, expect } from "vitest";
import { run } from "hardhat";
// import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { publicClient, walletClient } from "@/contracts/utils";

import { bytecode as lightWalletBytecode } from "@/artifacts/contracts/src/LightWallet.sol/LightWallet.json";
import { lightWalletABI } from "@lightdotso/wagmi";
import { WagmiMintExample } from "../src/WagmiMintExample.sol";

beforeAll(() => {
  run("node");
});

describe("LightWallet", function () {
  it("Should return run correct function parameters on hardhat", async function () {
    console.log(WagmiMintExample);
    console.log(await publicClient.getBlockNumber());
    const accounts = await walletClient.getAddresses();
    const [account, ...other] = accounts;
    console.log(await publicClient.getBalance({ address: account }));
    const hash = await walletClient.deployContract({
      abi: lightWalletABI,
      bytecode: lightWalletBytecode as `0x${string}`,
      account: accounts[0],
      args: [account],
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const data = await publicClient.readContract({
      address: receipt.contractAddress as `0x${string}`,
      abi: lightWalletABI,
      functionName: "proxiableUUID",
    });
    expect(data).to.equal(
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    );
  });
});
