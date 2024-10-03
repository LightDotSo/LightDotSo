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

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
// biome-ignore lint/style/useImportType: <explanation>
import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { ENTRYPOINT_V060_ADDRESS } from "./const";
import { decodeNonce, decodeNonceKey } from "./nonce";

// -----------------------------------------------------------------------------
// Class
// -----------------------------------------------------------------------------

class UserOperation {
  sender: Address;
  nonceKey: Bytes;
  nonce: BigInt;
  initCode: Bytes;
  callData: Bytes;
  callGasLimit: BigInt;
  verificationGasLimit: BigInt;
  preVerificationGas: BigInt;
  maxFeePerGas: BigInt;
  maxPriorityFeePerGas: BigInt;
  paymasterAndData: Bytes;
  signature: Bytes;
  gasFees: Bytes;

  constructor() {
    this.sender = Address.zero();
    this.nonceKey = new Bytes(0);
    this.nonce = BigInt.zero();
    this.initCode = new Bytes(0);
    this.callData = new Bytes(0);
    this.callGasLimit = BigInt.zero();
    this.verificationGasLimit = BigInt.zero();
    this.preVerificationGas = BigInt.zero();
    this.maxFeePerGas = BigInt.zero();
    this.maxPriorityFeePerGas = BigInt.zero();
    this.paymasterAndData = new Bytes(0);
    this.signature = new Bytes(0);
    this.gasFees = new Bytes(0);
  }
}

class AccountGasLimits {
  callGasLimit: BigInt;
  verificationGasLimit: BigInt;

  constructor(callGasLimit: BigInt, verificationGasLimit: BigInt) {
    this.callGasLimit = callGasLimit;
    this.verificationGasLimit = verificationGasLimit;
  }
}

// -----------------------------------------------------------------------------
// Handlers
// -----------------------------------------------------------------------------

export function handleUserOperationFromCalldata(
  callData: string,
  nonce: BigInt,
  entrypoint: Address,
): UserOperation {
  // Decode the user operation from the input
  log.info("callData: {}", [callData.toString()]);

  // Get the function selector
  const functionSelector = callData.substring(0, 10);
  log.info("functionSelector: {}", [functionSelector.toString()]);

  // Get the function parameters
  const functionParameters = callData.substring(10);
  log.info("functionParameters: {}", [functionParameters.toString()]);

  // Decode the function parameters to hex
  const decodedFunctionParameters = Bytes.fromHexString(functionParameters);
  log.info("decodedFunctionParameters: {}", [
    decodedFunctionParameters.toHexString(),
  ]);

  // Determine the EntryPoint version and set the appropriate decode format
  let decodeFormat: string;
  if (entrypoint.equals(Address.fromString(ENTRYPOINT_V060_ADDRESS))) {
    // v0.6 EntryPoint
    decodeFormat =
      "(address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes)[]";
  } else if (
    entrypoint.equals(
      Address.fromString("0x0000000071727de22e5e9d8baf0edac6f37da032"),
    )
  ) {
    // v0.7 EntryPoint
    decodeFormat =
      "(address,uint256,bytes,bytes,bytes32,uint256,bytes32,bytes,bytes)[]";
  } else {
    log.error("Unknown EntryPoint address: {}", [entrypoint.toHexString()]);
    return new UserOperation();
  }

  // Decode the hex function parameters to the user operation params
  const decoded = ethereum.decode(decodeFormat, decodedFunctionParameters);

  // Create a new user operation struct
  const userOperation = new UserOperation();

  // If failed to decode, return empty UserOperation
  if (decoded == null) {
    log.info("Failed to decode user operation params", []);
    return userOperation;
  }

  // Parse the decoded user operation params
  const userOpArray = decoded.toTupleArray<ethereum.Tuple>();

  // Find the matching UserOperation based on nonce
  let matchingUserOp: ethereum.Tuple | null = null;
  for (let i = 0; i < userOpArray.length; i++) {
    // biome-ignore lint/style/useForOf: <explanation>
    // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
    if (userOpArray[i][1].toBigInt() == nonce) {
      matchingUserOp = userOpArray[i];
      break;
    }
  }

  if (matchingUserOp === null) {
    log.info("No matching UserOperation found for nonce: {}", [
      nonce.toString(),
    ]);
    return userOperation;
  }

  // Populate the UserOperation struct based on the EntryPoint version
  if (entrypoint.equals(Address.fromString(ENTRYPOINT_V060_ADDRESS))) {
    // v0.6 EntryPoint
    userOperation.sender = matchingUserOp[0].toAddress();
    userOperation.nonce = matchingUserOp[1].toBigInt();
    userOperation.initCode = matchingUserOp[2].toBytes();
    userOperation.callData = matchingUserOp[3].toBytes();
    userOperation.callGasLimit = matchingUserOp[4].toBigInt();
    userOperation.verificationGasLimit = matchingUserOp[5].toBigInt();
    userOperation.preVerificationGas = matchingUserOp[6].toBigInt();
    userOperation.maxFeePerGas = matchingUserOp[7].toBigInt();
    userOperation.maxPriorityFeePerGas = matchingUserOp[8].toBigInt();
    userOperation.paymasterAndData = matchingUserOp[9].toBytes();
    userOperation.signature = matchingUserOp[10].toBytes();
  } else {
    // v0.7 EntryPoint
    userOperation.sender = matchingUserOp[0].toAddress();

    // nonceKey is 32 bytes hex string
    userOperation.nonceKey = decodeNonceKey(matchingUserOp[1].toBigInt());
    userOperation.nonce = decodeNonce(matchingUserOp[1].toBigInt());

    userOperation.initCode = matchingUserOp[2].toBytes();
    userOperation.callData = matchingUserOp[3].toBytes();

    // accountGasLimits is packed version of `callGasLimit` & `verificationGasLimit`
    const accountGasLimits = matchingUserOp[4].toBytes();
    const gasLimits = unpackAccountGasLimits(accountGasLimits);
    userOperation.callGasLimit = gasLimits.callGasLimit;
    userOperation.verificationGasLimit = gasLimits.verificationGasLimit;

    userOperation.preVerificationGas = matchingUserOp[5].toBigInt();
    userOperation.gasFees = matchingUserOp[6].toBytes();
    userOperation.paymasterAndData = matchingUserOp[7].toBytes();
    userOperation.signature = matchingUserOp[8].toBytes();
  }

  logUserOperation(userOperation, entrypoint);

  return userOperation;
}

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

function unpackAccountGasLimits(accountGasLimits: Bytes): AccountGasLimits {
  // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
  if (accountGasLimits.length != 32) {
    // Throw an error if the accountGasLimits is not 32 bytes
    throw new Error(
      `accountGasLimits has unexpected length: ${accountGasLimits.length}`,
    );
  }

  // Unpack callGasLimit (first 16 bytes) and verificationGasLimit (last 16 bytes)
  const callGasLimitBytes = Bytes.fromUint8Array(accountGasLimits.slice(0, 16));
  const verificationGasLimitBytes = Bytes.fromUint8Array(
    accountGasLimits.slice(16, 32),
  );

  const callGasLimit = BigInt.fromUnsignedBytes(callGasLimitBytes);
  const verificationGasLimit = BigInt.fromUnsignedBytes(
    verificationGasLimitBytes,
  );

  log.debug(
    "Unpacked gas limits - callGasLimit: {}, verificationGasLimit: {}",
    [callGasLimit.toString(), verificationGasLimit.toString()],
  );

  return new AccountGasLimits(callGasLimit, verificationGasLimit);
}

function logUserOperation(
  userOperation: UserOperation,
  entrypoint: Address,
): void {
  if (entrypoint.equals(Address.fromString(ENTRYPOINT_V060_ADDRESS))) {
    // v0.6 EntryPoint
    log.info(
      "UserOperation v0.6: sender: {} nonce: {} initCode: {} callData: {} callGasLimit: {} verificationGasLimit: {} preVerificationGas: {} maxFeePerGas: {} maxPriorityFeePerGas: {} paymasterAndData: {} signature: {}",
      [
        userOperation.sender.toHexString(),
        userOperation.nonce.toString(),
        userOperation.initCode.toHexString(),
        userOperation.callData.toHexString(),
        userOperation.callGasLimit.toString(),
        userOperation.verificationGasLimit.toString(),
        userOperation.preVerificationGas.toString(),
        userOperation.maxFeePerGas.toString(),
        userOperation.maxPriorityFeePerGas.toString(),
        userOperation.paymasterAndData.toHexString(),
        userOperation.signature.toHexString(),
      ],
    );
  } else {
    // v0.7 EntryPoint
    log.info(
      "UserOperation v0.7: sender: {} nonce: {} initCode: {} callData: {} callGasLimit: {} verificationGasLimit: {} preVerificationGas: {} gasFees: {} paymasterAndData: {} signature: {}",
      [
        userOperation.sender.toHexString(),
        userOperation.nonce.toString(),
        userOperation.initCode.toHexString(),
        userOperation.callData.toHexString(),
        userOperation.callGasLimit.toString(),
        userOperation.verificationGasLimit.toString(),
        userOperation.preVerificationGas.toString(),
        userOperation.gasFees.toHexString(),
        userOperation.paymasterAndData.toHexString(),
        userOperation.signature.toHexString(),
      ],
    );
  }
}
