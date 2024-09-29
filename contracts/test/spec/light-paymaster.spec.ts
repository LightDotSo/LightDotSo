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
import { LightPaymaster } from "@/contracts/LightPaymaster.sol";
import { expect, test } from "vitest";

test("LightPaymaster: Correct humanReadableAbi", () => {
  expect(Object.values(LightPaymaster.humanReadableAbi)).toMatchInlineSnapshot(`
    [
      "constructor(address entryPoint)",
      "error AddressEmptyCode(address target)",
      "error ERC1967InvalidImplementation(address implementation)",
      "error ERC1967NonPayable()",
      "error Expired()",
      "error FailedInnerCall()",
      "error InvalidInitialization()",
      "error InvalidNonce(uint256 nonce)",
      "error InvalidSignature()",
      "error NoExcess()",
      "error NotInitializing()",
      "error OwnableInvalidOwner(address owner)",
      "error OwnableUnauthorizedAccount(address account)",
      "error RequestLessThanGasMaxCost(uint256 requested, uint256 maxCost)",
      "error UUPSUnauthorizedCallContext()",
      "error UUPSUnsupportedProxiableUUID(bytes32 slot)",
      "error Unauthorized()",
      "error UnexpectedPostOpRevertedMode()",
      "error UnsupportedPaymasterAsset(address asset)",
      "error WithdrawTooLarge(uint256 requestedAmount, uint256 maxAllowed)",
      "event Initialized(uint64 version)",
      "event MagicSpendWithdrawal(address indexed account, address indexed asset, uint256 amount, uint256 nonce)",
      "event MaxWithdrawDenominatorSet(uint256 newDenominator)",
      "event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)",
      "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
      "event SignerSet(address indexed signer, bool isValid)",
      "event Upgraded(address indexed implementation)",
      "function NAME() view returns (string)",
      "function UPGRADE_INTERFACE_VERSION() view returns (string)",
      "function VERSION() view returns (string)",
      "function acceptOwnership()",
      "function addSigner(address signer_)",
      "function entryPoint() view returns (address)",
      "function entryPointAddStake(uint256 amount, uint32 unstakeDelaySeconds) payable",
      "function entryPointDeposit(uint256 amount) payable",
      "function entryPointUnlockStake()",
      "function entryPointWithdraw(address to, uint256 amount)",
      "function entryPointWithdrawStake(address to)",
      "function getHash(address account, (bytes signature, address asset, uint256 amount, uint256 nonce, uint48 expiry) withdrawRequest) view returns (bytes32)",
      "function initialize(address owner_, uint256 maxWithdrawDenominator_, address signer_)",
      "function isSigner(address signer) view returns (bool)",
      "function isValidWithdrawSignature(address account, (bytes signature, address asset, uint256 amount, uint256 nonce, uint48 expiry) withdrawRequest) view returns (bool)",
      "function maxWithdrawDenominator() view returns (uint256)",
      "function nonceUsed(address account, uint256 nonce) view returns (bool)",
      "function owner() view returns (address)",
      "function ownerWithdraw(address asset, address to, uint256 amount)",
      "function pendingOwner() view returns (address)",
      "function postOp(uint8 mode, bytes context, uint256 actualGasCost, uint256)",
      "function proxiableUUID() view returns (bytes32)",
      "function removeSigner(address signer_)",
      "function renounceOwnership()",
      "function setMaxWithdrawDenominator(uint256 newDenominator)",
      "function transferOwnership(address newOwner)",
      "function upgradeToAndCall(address newImplementation, bytes data) payable",
      "function validatePaymasterUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp, bytes32, uint256 maxCost) returns (bytes context, uint256 validationData)",
      "function withdraw((bytes signature, address asset, uint256 amount, uint256 nonce, uint48 expiry) withdrawRequest)",
      "function withdrawGasExcess()",
      "receive() external payable",
    ]
  `);
});
