// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//@ts-expect-error
import { LightProtocolController } from "@/contracts/LightProtocolController.sol";
import { expect, test } from "vitest";

test("LightProtocolController: Correct humanReadableAbi", () => {
  expect(
    Object.values(LightProtocolController.humanReadableAbi),
  ).toMatchInlineSnapshot(`
    [
      "constructor()",
      "error AddressEmptyCode(address target)",
      "error ERC1967InvalidImplementation(address implementation)",
      "error ERC1967NonPayable()",
      "error FailedInnerCall()",
      "error InvalidInitialization()",
      "error NotInitializing()",
      "error OwnableInvalidOwner(address owner)",
      "error OwnableUnauthorizedAccount(address account)",
      "error UUPSUnauthorizedCallContext()",
      "error UUPSUnsupportedProxiableUUID(bytes32 slot)",
      "event Initialized(uint64 version)",
      "event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
      "event Upgraded(address indexed implementation)",
      "function UPGRADE_INTERFACE_VERSION() view returns (string)",
      "function acceptOwnership()",
      "function initialize(address initialOwner)",
      "function multicall(bytes[] data) returns (bytes[] results)",
      "function owner() view returns (address)",
      "function pendingOwner() view returns (address)",
      "function proxiableUUID() view returns (bytes32)",
      "function renounceOwnership()",
      "function transferOwnership(address newOwner)",
      "function upgradeToAndCall(address newImplementation, bytes data) payable",
    ]
  `);
});
