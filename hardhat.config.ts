import type { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
// import "@nomiclabs/hardhat-ethers";
import "solidity-docgen";
// import "vitest-solidity-coverage/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  paths: {
    tests: "contracts/spec",
  },
  docgen: {
    outputDir: "apps/docs/content/contracts",
    pages: "items",
    pageExtension: ".mdx",
  },
};

export default config;
