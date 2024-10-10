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
      "error AccessControlBadConfirmation()",
      "error AccessControlUnauthorizedAccount(address account, bytes32 neededRole)",
      "error AddressEmptyCode(address target)",
      "error ERC1967InvalidImplementation(address implementation)",
      "error ERC1967NonPayable()",
      "error FailedInnerCall()",
      "error InvalidInitialization()",
      "error NotInitializing()",
      "error TimelockInsufficientDelay(uint256 delay, uint256 minDelay)",
      "error TimelockInvalidOperationLength(uint256 targets, uint256 payloads, uint256 values)",
      "error TimelockUnauthorizedCaller(address caller)",
      "error TimelockUnexecutedPredecessor(bytes32 predecessorId)",
      "error TimelockUnexpectedOperationState(bytes32 operationId, bytes32 expectedStates)",
      "error UUPSUnauthorizedCallContext()",
      "error UUPSUnsupportedProxiableUUID(bytes32 slot)",
      "event CallExecuted(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data)",
      "event CallSalt(bytes32 indexed id, bytes32 salt)",
      "event CallScheduled(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data, bytes32 predecessor, uint256 delay)",
      "event Cancelled(bytes32 indexed id)",
      "event Initialized(uint64 version)",
      "event MinDelayChange(uint256 oldDuration, uint256 newDuration)",
      "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
      "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
      "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
      "event Upgraded(address indexed implementation)",
      "function CANCELLER_ROLE() view returns (bytes32)",
      "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
      "function EXECUTOR_ROLE() view returns (bytes32)",
      "function NAME() view returns (string)",
      "function PROPOSER_ROLE() view returns (bytes32)",
      "function UPGRADE_INTERFACE_VERSION() view returns (string)",
      "function VERSION() view returns (string)",
      "function cancel(bytes32 id)",
      "function execute(address target, uint256 value, bytes payload, bytes32 predecessor, bytes32 salt) payable",
      "function executeBatch(address[] targets, uint256[] values, bytes[] payloads, bytes32 predecessor, bytes32 salt) payable",
      "function getMinDelay() view returns (uint256)",
      "function getOperationState(bytes32 id) view returns (uint8)",
      "function getRoleAdmin(bytes32 role) view returns (bytes32)",
      "function getTimestamp(bytes32 id) view returns (uint256)",
      "function grantRole(bytes32 role, address account)",
      "function hasRole(bytes32 role, address account) view returns (bool)",
      "function hashOperation(address target, uint256 value, bytes data, bytes32 predecessor, bytes32 salt) pure returns (bytes32)",
      "function hashOperationBatch(address[] targets, uint256[] values, bytes[] payloads, bytes32 predecessor, bytes32 salt) pure returns (bytes32)",
      "function initialize(uint256 minDelay, address[] proposers, address[] executors, address admin)",
      "function isOperation(bytes32 id) view returns (bool)",
      "function isOperationDone(bytes32 id) view returns (bool)",
      "function isOperationPending(bytes32 id) view returns (bool)",
      "function isOperationReady(bytes32 id) view returns (bool)",
      "function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) returns (bytes4)",
      "function onERC1155Received(address, address, uint256, uint256, bytes) returns (bytes4)",
      "function onERC721Received(address, address, uint256, bytes) returns (bytes4)",
      "function proxiableUUID() view returns (bytes32)",
      "function renounceRole(bytes32 role, address callerConfirmation)",
      "function revokeRole(bytes32 role, address account)",
      "function schedule(address target, uint256 value, bytes data, bytes32 predecessor, bytes32 salt, uint256 delay)",
      "function scheduleBatch(address[] targets, uint256[] values, bytes[] payloads, bytes32 predecessor, bytes32 salt, uint256 delay)",
      "function supportsInterface(bytes4 interfaceId) view returns (bool)",
      "function updateDelay(uint256 newDelay)",
      "function upgradeToAndCall(address newImplementation, bytes data) payable",
      "receive() external payable",
    ]
  `);
});
