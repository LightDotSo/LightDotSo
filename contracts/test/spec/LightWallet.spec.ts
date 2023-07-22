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

import { describe, it, expect, test } from "vitest";
import { subdigestOf } from "@lightdotso/solutions";
import { publicClient, walletClient } from "@/contracts/test/spec/utils";
import { accounts } from "@/contracts/test/spec/utils/constants";
//@ts-expect-error
import { LightWallet } from "@/contracts/LightWallet.sol";

describe("LightWallet", function () {
  it("Should return run correct function parameters on hardhat", async function () {
    console.log(await publicClient.getBlockNumber());
    const account = accounts[0].address;
    const hash = await walletClient.deployContract({
      abi: LightWallet.abi,
      bytecode: LightWallet.bytecode as `0x${string}`,
      account: account,
      args: [account],
      chain: undefined,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const data = await publicClient.readContract({
      address: receipt.contractAddress as `0x${string}`,
      abi: LightWallet.abi,
      functionName: "proxiableUUID",
    });
    expect(data).to.equal(
      "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    );
  });
});

test("LightWallet: Correct humanReadableAbi", () => {
  expect(Object.values(LightWallet.humanReadableAbi)).toMatchInlineSnapshot(`
    [
      "constructor(address anEntryPoint)",
      "error EmptySignature()",
      "error ImageHashIsZero()",
      "error InvalidNestedSignature(bytes32 _hash, address _addr, bytes _signature)",
      "error InvalidSValue(bytes _signature, bytes32 _s)",
      "error InvalidSignatureFlag(uint256 _flag)",
      "error InvalidSignatureLength(bytes _signature)",
      "error InvalidSignatureType(bytes1 _type)",
      "error InvalidVValue(bytes _signature, uint256 _v)",
      "error LowWeightChainedSignature(bytes _signature, uint256 threshold, uint256 _weight)",
      "error OnlySelfAuth(address _sender, address _self)",
      "error SignerIsAddress0(bytes _signature)",
      "error UnsupportedSignatureType(bytes _signature, uint256 _type, bool _recoverMode)",
      "error WrongChainedCheckpointOrder(uint256 _current, uint256 _prev)",
      "event AdminChanged(address previousAdmin, address newAdmin)",
      "event BeaconUpgraded(address indexed beacon)",
      "event ImageHashUpdated(bytes32 newImageHash)",
      "event Initialized(uint8 version)",
      "event LightWalletInitialized(address indexed entryPoint, bytes32 indexed hash)",
      "event Upgraded(address indexed implementation)",
      "function SET_IMAGE_HASH_TYPE_HASH() view returns (bytes32)",
      "function entryPoint() view returns (address)",
      "function execute(address dest, uint256 value, bytes func)",
      "function executeBatch(address[] dest, uint256[] value, bytes[] func)",
      "function getNonce() view returns (uint256)",
      "function imageHash() view returns (bytes32)",
      "function initialize(bytes32 imageHash)",
      "function isValidSignature(bytes32 hash, bytes signatures) view returns (bytes4)",
      "function isValidSignature(bytes _data, bytes _signatures) view returns (bytes4)",
      "function onERC1155BatchReceived(address, address, uint256[], uint256[], bytes) pure returns (bytes4)",
      "function onERC1155Received(address, address, uint256, uint256, bytes) pure returns (bytes4)",
      "function onERC721Received(address, address, uint256, bytes) pure returns (bytes4)",
      "function proxiableUUID() view returns (bytes32)",
      "function signatureRecovery(bytes32 _digest, bytes _signature) view returns (uint256 threshold, uint256 weight, bytes32 imageHash, bytes32 subdigest, uint256 checkpoint)",
      "function supportsInterface(bytes4 interfaceId) pure returns (bool)",
      "function tokensReceived(address, address, address, uint256, bytes, bytes) pure",
      "function updateImageHash(bytes32 _imageHash)",
      "function upgradeTo(address newImplementation)",
      "function upgradeToAndCall(address newImplementation, bytes data) payable",
      "function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)",
      "receive() external payable",
    ]
  `);
});

test("Should return correct subdigest", () => {
  const ls = subdigestOf(`0x${"00".repeat(20)}`, new Uint8Array(32), 1n);
  console.log(ls);
});
