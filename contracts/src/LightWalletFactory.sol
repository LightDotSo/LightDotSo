// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./LightWallet.sol";

/// @title LightWalletFactory
/// @author shunkakinoki
/// @notice A factory contract for LightWallet
/// @dev A UserOperations "initCode" holds the address of the factory, and a method call (to createAccount, in this sample factory).
/// The factory's createAccount returns the target account address even if it is already installed.
/// This way, the entryPoint.getSenderAddress() can be called either before or after the account is created.
contract LightWalletFactory {
    LightWallet public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new LightWallet(_entryPoint);
    }

    /// @notice Creates an account, and return its address.
    /// @dev Note that during UserOperation execution, this method is called only if the account is not deployed.
    /// This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
    function createAccount(address owner, uint256 salt) public returns (LightWallet ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return LightWallet(payable(addr));
        }
        ret = LightWallet(
            payable(
                new ERC1967Proxy{salt : bytes32(salt)}(
                address(accountImplementation),
                abi.encodeCall(LightWallet.initialize, (owner))
                )
            )
        );
    }

    /// @notice calculate the counterfactual address of this account as it would be returned by createAccount()
    function getAddress(address owner, uint256 salt) public view returns (address) {
        return Create2.computeAddress(
            bytes32(salt),
            keccak256(
                abi.encodePacked(
                    type(ERC1967Proxy).creationCode,
                    abi.encode(address(accountImplementation), abi.encodeCall(LightWallet.initialize, (owner)))
                )
            )
        );
    }
}
