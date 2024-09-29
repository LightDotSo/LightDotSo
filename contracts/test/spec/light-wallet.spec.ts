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

// import { publicClient, walletClient } from "@/contracts/test/spec/utils";
// import { accounts } from "@/contracts/test/spec/utils/constants";
//@ts-expect-error
import { LightWallet } from "@/contracts/LightWallet.sol";
import { subdigestOf } from "@lightdotso/sequence";
import { expect, test } from "vitest";

// describe("LightWallet", function () {
//   it("Should return run correct function parameters on hardhat", async function () {
//     console.warn(await publicClient.getBlockNumber());
//     const account = accounts[0].address;
//     const hash = await walletClient.deployContract({
//       abi: LightWallet.abi,
//       bytecode: LightWallet.bytecode as `0x${string}`,
//       account: account,
//       args: [account],
//       chain: undefined,
//     });
//     const receipt = await publicClient.waitForTransactionReceipt({ hash });
//     const data = await publicClient.readContract({
//       address: receipt.contractAddress as `0x${string}`,
//       abi: LightWallet.abi,
//       functionName: "proxiableUUID",
//     });
//     expect(data).to.equal(
//       "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
//     );
//   });
// });

test("LightWallet: Correct humanReadableAbi", () => {
  expect(Object.values(LightWallet.humanReadableAbi)).toMatchInlineSnapshot(`
    [
      "constructor(address anEntryPoint)",
      "error AddressEmptyCode(address target)",
      "error ERC1967InvalidImplementation(address implementation)",
      "error ERC1967NonPayable()",
      "error EmptySignature()",
      "error FailedInnerCall()",
      "error ImageHashIsZero()",
      "error InvalidInitialization()",
      "error InvalidMerkleProof(bytes32 root, bytes32 leaf)",
      "error InvalidNestedSignature(bytes32 _hash, address _addr, bytes _signature)",
      "error InvalidSValue(bytes _signature, bytes32 _s)",
      "error InvalidSignatureFlag(uint256 _flag)",
      "error InvalidSignatureLength(bytes _signature)",
      "error InvalidSignatureType(bytes1 _type)",
      "error InvalidVValue(bytes _signature, uint256 _v)",
      "error LowWeightChainedSignature(bytes _signature, uint256 threshold, uint256 _weight)",
      "error NotInitializing()",
      "error OnlySelfAuth(address _sender, address _self)",
      "error SignerIsAddress0(bytes _signature)",
      "error UUPSUnauthorizedCallContext()",
      "error UUPSUnsupportedProxiableUUID(bytes32 slot)",
      "error UnsupportedSignatureType(bytes _signature, uint256 _type, bool _recoverMode)",
      "error WrongChainedCheckpointOrder(uint256 _current, uint256 _prev)",
      "event ImageHashUpdated(bytes32 newImageHash)",
      "event Initialized(uint64 version)",
      "event LightWalletInitialized(address indexed entryPoint, bytes32 indexed hash)",
      "event Upgraded(address indexed implementation)",
      "function NAME() view returns (string)",
      "function SET_IMAGE_HASH_TYPE_HASH() view returns (bytes32)",
      "function UPGRADE_INTERFACE_VERSION() view returns (string)",
      "function VERSION() view returns (string)",
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
      "function updateImageHash(bytes32 _imageHash)",
      "function upgradeToAndCall(address newImplementation, bytes data) payable",
      "function validateUserOp((address sender, uint256 nonce, bytes initCode, bytes callData, bytes32 accountGasLimits, uint256 preVerificationGas, bytes32 gasFees, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) returns (uint256 validationData)",
      "receive() external payable",
    ]
  `);
});

test("Should return correct subdigest", () => {
  const ls = subdigestOf(`0x${"00".repeat(20)}`, new Uint8Array(32), 1n);
  // biome-ignore lint/suspicious/noConsole: <explanation>
  console.warn(ls);
});
