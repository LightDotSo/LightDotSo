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

import { BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { EntryPoint__getUserOpHashInputUserOpStruct as UserOperationStructTuple } from "../generated/EntryPointv0.6.0/EntryPoint";

export function handleUserOperationFromCalldata(
  callData: String,
  nonce: BigInt,
): UserOperationStructTuple {
  // Decode the user operation from the input
  log.info("callData: {}", [callData.toString()]);

  // Get the function selector
  let functionSelector = callData.substring(0, 10);
  log.info("functionSelector: {}", [functionSelector.toString()]);

  // Get the function parameters
  let functionParameters = callData.substring(10);
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

  let userOperationStructTuple = new UserOperationStructTuple();

  // If failed to decode, return null
  if (decoded == null) {
    return userOperationStructTuple;
  }

  // Parse the decoded user operation params
  const userOpStructTupletArray =
    decoded.toTupleArray<UserOperationStructTuple>();

  // Return the decoded user operation params w/ the matching nonce
  for (let i = 0; i < userOpStructTupletArray.length; i++) {
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
