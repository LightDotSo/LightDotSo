require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-foundry");
require("@nomiclabs/hardhat-ethers");

const config = {
  solidity: "0.8.18",
  paths: {
    tests: "contracts/test-hh",
  },
};

module.exports = config;
