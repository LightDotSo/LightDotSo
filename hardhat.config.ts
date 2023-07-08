require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-foundry");
require("@nomiclabs/hardhat-ethers");
require("vitest-solidity-coverage/hardhat");

const config = {
  solidity: "0.8.18",
  paths: {
    tests: "contracts/spec",
  },
};

module.exports = config;
