import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

export const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});
