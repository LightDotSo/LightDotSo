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
import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { EntryPoint__getUserOpHashInputUserOpStruct as UserOperationStructTuple } from "../generated/EntryPointv0.6.0/EntryPoint";

export function handleUserOperationFromCalldata(
  callData: string,
  nonce: BigInt,
): UserOperationStructTuple {
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

  // Decode the hex function parameters to the user operation params
  const decoded = ethereum.decode(
    "(address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes)[]",
    decodedFunctionParameters,
  );

  // Create a new user operation struct tuple
  let userOperationStructTuple = new UserOperationStructTuple();

  // If failed to decode, return null
  if (decoded == null) {
    log.info("Failed to decode user operation params", []);
    return userOperationStructTuple;
  }

  // Parse the decoded user operation params
  const userOpStructTupletArray =
    decoded.toTupleArray<UserOperationStructTuple>();

  // Return the decoded user operation params w/ the matching nonce
  for (let i = 0; i < userOpStructTupletArray.length; i++) {
    // biome-ignore lint/suspicious/noDoubleEquals: <explanation>
    if (userOpStructTupletArray[i].nonce == nonce) {
      userOperationStructTuple = userOpStructTupletArray[i];
    }
  }

  log.info(
    "userOperationStructTuple: sender: {} nonce: {} initCode: {} callData: {} callGasLimit: {} verificationGasLimit: {} preVerificationGas: {} maxFeePerGas: {} maxPriorityFeePerGas: {} paymasterAndData: {} signature: {}",
    [
      userOperationStructTuple.sender.toHexString(),
      userOperationStructTuple.nonce.toHexString(),
      userOperationStructTuple.initCode.toHexString(),
      userOperationStructTuple.callData.toHexString(),
      userOperationStructTuple.callGasLimit.toString(),
      userOperationStructTuple.verificationGasLimit.toString(),
      userOperationStructTuple.preVerificationGas.toString(),
      userOperationStructTuple.maxFeePerGas.toString(),
      userOperationStructTuple.maxPriorityFeePerGas.toString(),
      userOperationStructTuple.paymasterAndData.toHexString(),
      userOperationStructTuple.signature.toHexString(),
    ],
  );

  return userOperationStructTuple;
}
