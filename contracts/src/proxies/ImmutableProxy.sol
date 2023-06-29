// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract MyProxy is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) pure internal override {
        // Permanently disable upgrades by invalidating the authorization
        revert("Upgrades are disabled");
    }
}
