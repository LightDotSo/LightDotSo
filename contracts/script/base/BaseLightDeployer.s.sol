// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// SPDX-License-Identifier: AGPL-3.0-or-later

import {EntryPoint} from "@/contracts/core/EntryPoint.sol";
import {LightWallet} from "@/contracts/LightWallet.sol";
import {LightWalletFactory} from "@/contracts/LightWalletFactory.sol";
import {LightVerifyingPaymaster} from "@/contracts/LightVerifyingPaymaster.sol";
// solhint-disable-next-line no-console
import {console} from "forge-std/console.sol";
import {stdJson} from "forge-std/StdJson.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Surl} from "surl/Surl.sol";

pragma solidity ^0.8.18;

interface ImmutableCreate2Factory {
    function safeCreate2(bytes32 salt, bytes calldata initializationCode)
        external
        payable
        returns (address deploymentAddress);
}

// BaseLightDeployer - Create abstract contract of just immutable storages
abstract contract BaseLightDeployer {
    using Surl for *;
    using stdJson for string;

    // -------------------------------------------------------------------------
    // Storages
    // -------------------------------------------------------------------------

    EntryPoint internal entryPoint;

    LightWallet internal wallet;

    LightWalletFactory internal factory;

    LightVerifyingPaymaster internal paymaster;

    bytes32 internal expectedImageHash;

    // -------------------------------------------------------------------------
    // Immutable Factory
    // -------------------------------------------------------------------------

    // EntryPoint address
    address payable internal constant ENTRY_POINT_ADDRESS = payable(address(0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789));

    address internal constant IMMUTABLE_CREATE2_FACTORY_ADDRESS = 0x0000000000FFe8B47B3e2130213B802212439497;
    ImmutableCreate2Factory internal constant IMMUTABLE_CREATE2_FACTORY =
        ImmutableCreate2Factory(IMMUTABLE_CREATE2_FACTORY_ADDRESS);

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    /// @dev BaseTest setup
    function setUp() public virtual {
        // Get the entry point
        entryPoint = EntryPoint(ENTRY_POINT_ADDRESS);
    }

    // -------------------------------------------------------------------------
    // Utilities
    // -------------------------------------------------------------------------

    function randMod() internal view returns (bytes32) {
        return bytes32(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % 4337);
    }

    // From: `LightWalletUtils` contract
    function getExpectedImageHash(address user) internal pure returns (bytes32 imageHash) {
        // Parameters for the signature
        uint8 weight = uint8(1);
        uint16 threshold = uint16(1);
        uint32 checkpoint = uint32(1);

        // Calculate the image hash
        imageHash = abi.decode(abi.encodePacked(uint96(weight), user), (bytes32));
        imageHash = keccak256(abi.encodePacked(imageHash, uint256(threshold)));
        imageHash = keccak256(abi.encodePacked(imageHash, uint256(checkpoint)));

        return imageHash;
    }

    function getEthEstimateUserOperationGas(address sender, bytes memory initCode) internal {
        // Perform a post request with headers and JSON body
        string memory url = getFullUrl();
        string[] memory headers = new string[](1);
        headers[0] = "Content-Type: application/json";
        string memory body = string(
            abi.encodePacked(
                '{"id": 1,"jsonrpc":"2.0","method":"eth_estimateUserOperationGas","params":[{',
                '"sender":"',
                Strings.toHexString(uint160(sender), 20),
                '","nonce":"0x1",',
                '"initCode":"',
                bytesToHexString(initCode),
                '","callData":"0x","signature":"0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c","paymasterAndData":"0x"},"0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"]}'
            )
        );
        // solhint-disable-next-line no-console
        console.log(string(body));

        (uint256 status, bytes memory data) = url.post(headers, body);

        // solhint-disable-next-line no-console
        console.log(string(data));

        string memory json = string(data);

        // solhint-disable-next-line no-console
        console.logBytes(json.readBytes(".result"));

        // solhint-disable-next-line no-console
        console.log(status);

        // solhint-disable-next-line no-console
        console.logBytes(data);
    }

    function getFullUrl() public view returns (string memory) {
        string memory baseUrl = "https://rpc.light.so/";
        string memory chainId = Strings.toString(block.chainid);
        return string(abi.encodePacked(baseUrl, chainId));
    }

    // From: https://ethereum.stackexchange.com/questions/126899/convert-bytes-to-hexadecimal-string-in-solidity
    // License: GPL-3.0
    function bytesToHexString(bytes memory buffer) public pure returns (string memory) {
        // Fixed buffer size for hexadecimal convertion
        bytes memory converted = new bytes(buffer.length * 2);

        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }
}
