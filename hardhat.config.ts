require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-foundry");
require("@nomiclabs/hardhat-ethers");
require("solidity-docgen");
require("vitest-solidity-coverage/hardhat");

const config = {
  solidity: "0.8.18",
  paths: {
    tests: "contracts/spec",
  },
  docgen: {
    outputDir: "apps/docs/src/pages/posts",
    exclude: ["samples", "utils"],
    pages: "items",
    pageExtension: ".mdx",
  },
};

module.exports = config;
