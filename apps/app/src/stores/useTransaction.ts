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

import { create } from "zustand";
import type { UserOperation } from "permissionless";
import { getUserOperationHash } from "permissionless";
import type { Hex, Address } from "viem";

interface TransactionStore {
  chainId: number;
  userOperation: UserOperation;
  setChainId: (chainId: number) => void;
  setCalldata: (callData: Hex) => void;
  setInitCode: (initcode: Hex) => void;
  setSender: (sender: Address) => void;
  isValid: () => boolean;
  getHash: () => Hex;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  chainId: 0,
  userOperation: {
    sender: "0x0000000000000000000000000000000000000",
    nonce: 0n,
    initCode: "0x",
    callData: "0x",
    callGasLimit: 0n,
    verificationGasLimit: 0n,
    preVerificationGas: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    paymasterAndData: "0x",
    signature: "0x",
  },
  setChainId: chainId => set({ chainId }),
  setCalldata: callData =>
    set(state => ({ userOperation: { ...state.userOperation, callData } })),
  setInitCode: initCode =>
    set(state => ({ userOperation: { ...state.userOperation, initCode } })),
  setSender: sender =>
    set(state => ({ userOperation: { ...state.userOperation, sender } })),
  isValid: () =>
    get().userOperation.callData !== "0x" &&
    get().userOperation.initCode !== "0x",
  getHash: () => {
    const userOperation = get().userOperation;
    const chainId = get().chainId;

    return getUserOperationHash({
      userOperation,
      chainId,
      entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    });
  },
}));
