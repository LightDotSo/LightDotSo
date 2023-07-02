// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {LightWallet} from "../LightWallet.sol";

interface ILightWalletFactory {
    /// @notice Gets the address of the account implementation contract
    function accountImplementation() external view returns (LightWallet);

    /// @notice Creates an account and returns its address
    function createAccount(address owner, uint256 salt) external returns (LightWallet);

    /// @notice Calculates the counterfactual address of an account
    function getAddress(address owner, uint256 salt) external view returns (address);
}
