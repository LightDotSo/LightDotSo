import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

export const hardhatClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});
