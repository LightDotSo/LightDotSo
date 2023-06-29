// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract ImmutableProxy is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) internal pure override {
        // Permanently disable upgrades by invalidating the authorization
        revert("Upgrades are disabled");
    }
}
