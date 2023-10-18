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
import { immer } from "zustand/middleware/immer";

interface TransactionStore {
  chainId: number;
  userOperation: UserOperation;
  isLoading: boolean;
  resetUserOp: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setChainId: (chainId: number) => void;
  setCalldata: (callData: Hex) => void;
  setInitCode: (initcode: Hex) => void;
  setSender: (sender: Address) => void;
  setNonce: (nonce: bigint) => void;
  setGasValues: (
    callGasLimit: bigint,
    verificationGasLimit: bigint,
    preVerificationGas: bigint,
    maxFeePerGas: bigint,
    maxPriorityFeePerGas: bigint,
  ) => void;
  setPaymasterAndData: (data: Hex) => void;
  isValid: () => boolean;
  getUserOpHash: () => Hex;
}

export const useTransactionStore = create(
  immer<TransactionStore>((set, get) => ({
    chainId: 0,
    userOperation: {
      sender: "0x0000000000000000000000000000000000000000",
      nonce: 0n,
      initCode: "0x",
      callData: "0x",
      callGasLimit: 0n,
      verificationGasLimit: 0n,
      preVerificationGas: 0n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      paymasterAndData: "0x",
      signature:
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    },
    isLoading: false,
    resetUserOp: () =>
      set({
        userOperation: {
          sender: "0x0000000000000000000000000000000000000000",
          nonce: 0n,
          initCode: "0x",
          callData: "0x",
          callGasLimit: 0n,
          verificationGasLimit: 0n,
          preVerificationGas: 0n,
          maxFeePerGas: 0n,
          maxPriorityFeePerGas: 0n,
          paymasterAndData: "0x",
          signature:
            "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        },
      }),
    setIsLoading: (isLoading: boolean) => set({ isLoading }),
    setChainId: chainId => set({ chainId }),
    setCalldata: callData =>
      set(state => ({ userOperation: { ...state.userOperation, callData } })),
    setInitCode: initCode =>
      set(state => ({ userOperation: { ...state.userOperation, initCode } })),
    setSender: sender =>
      set(state => ({ userOperation: { ...state.userOperation, sender } })),
    setNonce: (nonce: bigint) =>
      set(state => ({ userOperation: { ...state.userOperation, nonce } })),
    setGasValues: (
      callGasLimit: bigint,
      verificationGasLimit: bigint,
      preVerificationGas: bigint,
      maxFeePerGas: bigint,
      maxPriorityFeePerGas: bigint,
    ) =>
      set(state => ({
        userOperation: {
          ...state.userOperation,
          callGasLimit,
          verificationGasLimit,
          preVerificationGas,
          maxFeePerGas,
          maxPriorityFeePerGas,
        },
      })),
    setPaymasterAndData: (paymasterAndData: Hex) =>
      set(state => ({
        userOperation: { ...state.userOperation, paymasterAndData },
      })),
    isValid: () =>
      get().userOperation.sender !==
        "0x0000000000000000000000000000000000000000" &&
      ((get().userOperation.callData === "0x" &&
        get().userOperation.initCode !== "0x") ||
        (get().userOperation.callData !== "0x" &&
          get().userOperation.initCode === "0x")) &&
      get().userOperation.signature !== "0x" &&
      get().userOperation.callGasLimit !== 0n &&
      get().userOperation.verificationGasLimit !== 0n &&
      get().userOperation.preVerificationGas !== 0n &&
      get().userOperation.maxFeePerGas !== 0n &&
      get().userOperation.maxPriorityFeePerGas !== 0n &&
      get().userOperation.signature !==
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    getUserOpHash: () => {
      // Return if not valid
      // if (!get().isValid()) return "0x";

      const userOperation = get().userOperation;
      const chainId = get().chainId;

      return getUserOperationHash({
        userOperation,
        chainId,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      });
    },
  })),
);
