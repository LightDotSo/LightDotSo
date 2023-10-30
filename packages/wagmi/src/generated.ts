import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
  useContractEvent,
  UseContractEventConfig,
} from "wagmi";
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from "wagmi/actions";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightVerifyingPaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightVerifyingPaymasterABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "entryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
      { name: "verifyingSigner", internalType: "address", type: "address" },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "unstakeDelaySec", internalType: "uint32", type: "uint32" },
    ],
    name: "addStake",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [],
    name: "deposit",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "entryPoint",
    outputs: [
      { name: "", internalType: "contract IEntryPoint", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      {
        name: "userOp",
        internalType: "struct UserOperation",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "callData", internalType: "bytes", type: "bytes" },
          { name: "callGasLimit", internalType: "uint256", type: "uint256" },
          {
            name: "verificationGasLimit",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "preVerificationGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "maxFeePerGas", internalType: "uint256", type: "uint256" },
          {
            name: "maxPriorityFeePerGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "paymasterAndData", internalType: "bytes", type: "bytes" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "validUntil", internalType: "uint48", type: "uint48" },
      { name: "validAfter", internalType: "uint48", type: "uint48" },
    ],
    name: "getHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "paymasterAndData", internalType: "bytes", type: "bytes" },
    ],
    name: "parsePaymasterAndData",
    outputs: [
      { name: "validUntil", internalType: "uint48", type: "uint48" },
      { name: "validAfter", internalType: "uint48", type: "uint48" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "mode",
        internalType: "enum IPaymaster.PostOpMode",
        type: "uint8",
      },
      { name: "context", internalType: "bytes", type: "bytes" },
      { name: "actualGasCost", internalType: "uint256", type: "uint256" },
    ],
    name: "postOp",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "senderNonce",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "unlockStake",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "userOp",
        internalType: "struct UserOperation",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "callData", internalType: "bytes", type: "bytes" },
          { name: "callGasLimit", internalType: "uint256", type: "uint256" },
          {
            name: "verificationGasLimit",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "preVerificationGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "maxFeePerGas", internalType: "uint256", type: "uint256" },
          {
            name: "maxPriorityFeePerGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "paymasterAndData", internalType: "bytes", type: "bytes" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "userOpHash", internalType: "bytes32", type: "bytes32" },
      { name: "maxCost", internalType: "uint256", type: "uint256" },
    ],
    name: "validatePaymasterUserOp",
    outputs: [
      { name: "context", internalType: "bytes", type: "bytes" },
      { name: "validationData", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "verifyingSigner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "withdrawAddress",
        internalType: "address payable",
        type: "address",
      },
    ],
    name: "withdrawStake",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "withdrawAddress",
        internalType: "address payable",
        type: "address",
      },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawTo",
    outputs: [],
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightWallet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightWalletABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "anEntryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
    ],
  },
  { type: "error", inputs: [], name: "EmptySignature" },
  { type: "error", inputs: [], name: "ImageHashIsZero" },
  {
    type: "error",
    inputs: [
      { name: "_hash", internalType: "bytes32", type: "bytes32" },
      { name: "_addr", internalType: "address", type: "address" },
      { name: "_signature", internalType: "bytes", type: "bytes" },
    ],
    name: "InvalidNestedSignature",
  },
  {
    type: "error",
    inputs: [
      { name: "_signature", internalType: "bytes", type: "bytes" },
      { name: "_s", internalType: "bytes32", type: "bytes32" },
    ],
    name: "InvalidSValue",
  },
  {
    type: "error",
    inputs: [{ name: "_flag", internalType: "uint256", type: "uint256" }],
    name: "InvalidSignatureFlag",
  },
  {
    type: "error",
    inputs: [{ name: "_signature", internalType: "bytes", type: "bytes" }],
    name: "InvalidSignatureLength",
  },
  {
    type: "error",
    inputs: [{ name: "_type", internalType: "bytes1", type: "bytes1" }],
    name: "InvalidSignatureType",
  },
  {
    type: "error",
    inputs: [
      { name: "_signature", internalType: "bytes", type: "bytes" },
      { name: "_v", internalType: "uint256", type: "uint256" },
    ],
    name: "InvalidVValue",
  },
  {
    type: "error",
    inputs: [
      { name: "_signature", internalType: "bytes", type: "bytes" },
      { name: "threshold", internalType: "uint256", type: "uint256" },
      { name: "_weight", internalType: "uint256", type: "uint256" },
    ],
    name: "LowWeightChainedSignature",
  },
  {
    type: "error",
    inputs: [
      { name: "_sender", internalType: "address", type: "address" },
      { name: "_self", internalType: "address", type: "address" },
    ],
    name: "OnlySelfAuth",
  },
  {
    type: "error",
    inputs: [{ name: "_signature", internalType: "bytes", type: "bytes" }],
    name: "SignerIsAddress0",
  },
  {
    type: "error",
    inputs: [
      { name: "_signature", internalType: "bytes", type: "bytes" },
      { name: "_type", internalType: "uint256", type: "uint256" },
      { name: "_recoverMode", internalType: "bool", type: "bool" },
    ],
    name: "UnsupportedSignatureType",
  },
  {
    type: "error",
    inputs: [
      { name: "_current", internalType: "uint256", type: "uint256" },
      { name: "_prev", internalType: "uint256", type: "uint256" },
    ],
    name: "WrongChainedCheckpointOrder",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "newAdmin",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "beacon",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "BeaconUpgraded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newImageHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "ImageHashUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "version", internalType: "uint8", type: "uint8", indexed: false },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "entryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
        indexed: true,
      },
      { name: "hash", internalType: "bytes32", type: "bytes32", indexed: true },
    ],
    name: "LightWalletInitialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "implementation",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "Upgraded",
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "SET_IMAGE_HASH_TYPE_HASH",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "entryPoint",
    outputs: [
      { name: "", internalType: "contract IEntryPoint", type: "address" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "dest", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "func", internalType: "bytes", type: "bytes" },
    ],
    name: "execute",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "dest", internalType: "address[]", type: "address[]" },
      { name: "value", internalType: "uint256[]", type: "uint256[]" },
      { name: "func", internalType: "bytes[]", type: "bytes[]" },
    ],
    name: "executeBatch",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "getNonce",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "imageHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "imageHash", internalType: "bytes32", type: "bytes32" }],
    name: "initialize",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "signatures", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_data", internalType: "bytes", type: "bytes" },
      { name: "_signatures", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "uint256[]", type: "uint256[]" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC1155BatchReceived",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC1155Received",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC721Received",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "_digest", internalType: "bytes32", type: "bytes32" },
      { name: "_signature", internalType: "bytes", type: "bytes" },
    ],
    name: "signatureRecovery",
    outputs: [
      { name: "threshold", internalType: "uint256", type: "uint256" },
      { name: "weight", internalType: "uint256", type: "uint256" },
      { name: "imageHash", internalType: "bytes32", type: "bytes32" },
      { name: "subdigest", internalType: "bytes32", type: "bytes32" },
      { name: "checkpoint", internalType: "uint256", type: "uint256" },
    ],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "tokensReceived",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [{ name: "_imageHash", internalType: "bytes32", type: "bytes32" }],
    name: "updateImageHash",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
    ],
    name: "upgradeTo",
    outputs: [],
  },
  {
    stateMutability: "payable",
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      {
        name: "userOp",
        internalType: "struct UserOperation",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "callData", internalType: "bytes", type: "bytes" },
          { name: "callGasLimit", internalType: "uint256", type: "uint256" },
          {
            name: "verificationGasLimit",
            internalType: "uint256",
            type: "uint256",
          },
          {
            name: "preVerificationGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "maxFeePerGas", internalType: "uint256", type: "uint256" },
          {
            name: "maxPriorityFeePerGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "paymasterAndData", internalType: "bytes", type: "bytes" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "userOpHash", internalType: "bytes32", type: "bytes32" },
      { name: "missingAccountFunds", internalType: "uint256", type: "uint256" },
    ],
    name: "validateUserOp",
    outputs: [
      { name: "validationData", internalType: "uint256", type: "uint256" },
    ],
  },
  { stateMutability: "payable", type: "receive" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightWalletFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightWalletFactoryABI = [
  {
    stateMutability: "nonpayable",
    type: "constructor",
    inputs: [
      {
        name: "entryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
    ],
  },
  { type: "error", inputs: [], name: "EntrypointAddressZero" },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "accountImplementation",
    outputs: [
      { name: "", internalType: "contract LightWallet", type: "address" },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "createAccount",
    outputs: [
      { name: "ret", internalType: "contract LightWallet", type: "address" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__.
 */
export function useLightVerifyingPaymasterRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"entryPoint"`.
 */
export function useLightVerifyingPaymasterEntryPoint<
  TFunctionName extends "entryPoint",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "entryPoint",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"getDeposit"`.
 */
export function useLightVerifyingPaymasterGetDeposit<
  TFunctionName extends "getDeposit",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "getDeposit",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"getHash"`.
 */
export function useLightVerifyingPaymasterGetHash<
  TFunctionName extends "getHash",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "getHash",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"owner"`.
 */
export function useLightVerifyingPaymasterOwner<
  TFunctionName extends "owner",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "owner",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"parsePaymasterAndData"`.
 */
export function useLightVerifyingPaymasterParsePaymasterAndData<
  TFunctionName extends "parsePaymasterAndData",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "parsePaymasterAndData",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"senderNonce"`.
 */
export function useLightVerifyingPaymasterSenderNonce<
  TFunctionName extends "senderNonce",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "senderNonce",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"verifyingSigner"`.
 */
export function useLightVerifyingPaymasterVerifyingSigner<
  TFunctionName extends "verifyingSigner",
  TSelectData = ReadContractResult<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightVerifyingPaymasterABI,
    functionName: "verifyingSigner",
    ...config,
  } as UseContractReadConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__.
 */
export function useLightVerifyingPaymasterWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          string
        >["request"]["abi"],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        TFunctionName,
        TMode
      > & {
        abi?: never;
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    TFunctionName,
    TMode
  >({ abi: lightVerifyingPaymasterABI, ...config } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"addStake"`.
 */
export function useLightVerifyingPaymasterAddStake<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "addStake"
        >["request"]["abi"],
        "addStake",
        TMode
      > & { functionName?: "addStake" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "addStake",
        TMode
      > & {
        abi?: never;
        functionName?: "addStake";
      } = {} as any,
) {
  return useContractWrite<typeof lightVerifyingPaymasterABI, "addStake", TMode>(
    {
      abi: lightVerifyingPaymasterABI,
      functionName: "addStake",
      ...config,
    } as any,
  );
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"deposit"`.
 */
export function useLightVerifyingPaymasterDeposit<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "deposit"
        >["request"]["abi"],
        "deposit",
        TMode
      > & { functionName?: "deposit" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "deposit",
        TMode
      > & {
        abi?: never;
        functionName?: "deposit";
      } = {} as any,
) {
  return useContractWrite<typeof lightVerifyingPaymasterABI, "deposit", TMode>({
    abi: lightVerifyingPaymasterABI,
    functionName: "deposit",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"postOp"`.
 */
export function useLightVerifyingPaymasterPostOp<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "postOp"
        >["request"]["abi"],
        "postOp",
        TMode
      > & { functionName?: "postOp" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "postOp",
        TMode
      > & {
        abi?: never;
        functionName?: "postOp";
      } = {} as any,
) {
  return useContractWrite<typeof lightVerifyingPaymasterABI, "postOp", TMode>({
    abi: lightVerifyingPaymasterABI,
    functionName: "postOp",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"renounceOwnership"`.
 */
export function useLightVerifyingPaymasterRenounceOwnership<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "renounceOwnership"
        >["request"]["abi"],
        "renounceOwnership",
        TMode
      > & { functionName?: "renounceOwnership" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "renounceOwnership",
        TMode
      > & {
        abi?: never;
        functionName?: "renounceOwnership";
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    "renounceOwnership",
    TMode
  >({
    abi: lightVerifyingPaymasterABI,
    functionName: "renounceOwnership",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"transferOwnership"`.
 */
export function useLightVerifyingPaymasterTransferOwnership<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "transferOwnership"
        >["request"]["abi"],
        "transferOwnership",
        TMode
      > & { functionName?: "transferOwnership" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "transferOwnership",
        TMode
      > & {
        abi?: never;
        functionName?: "transferOwnership";
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    "transferOwnership",
    TMode
  >({
    abi: lightVerifyingPaymasterABI,
    functionName: "transferOwnership",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"unlockStake"`.
 */
export function useLightVerifyingPaymasterUnlockStake<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "unlockStake"
        >["request"]["abi"],
        "unlockStake",
        TMode
      > & { functionName?: "unlockStake" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "unlockStake",
        TMode
      > & {
        abi?: never;
        functionName?: "unlockStake";
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    "unlockStake",
    TMode
  >({
    abi: lightVerifyingPaymasterABI,
    functionName: "unlockStake",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"validatePaymasterUserOp"`.
 */
export function useLightVerifyingPaymasterValidatePaymasterUserOp<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "validatePaymasterUserOp"
        >["request"]["abi"],
        "validatePaymasterUserOp",
        TMode
      > & { functionName?: "validatePaymasterUserOp" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "validatePaymasterUserOp",
        TMode
      > & {
        abi?: never;
        functionName?: "validatePaymasterUserOp";
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    "validatePaymasterUserOp",
    TMode
  >({
    abi: lightVerifyingPaymasterABI,
    functionName: "validatePaymasterUserOp",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"withdrawStake"`.
 */
export function useLightVerifyingPaymasterWithdrawStake<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "withdrawStake"
        >["request"]["abi"],
        "withdrawStake",
        TMode
      > & { functionName?: "withdrawStake" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "withdrawStake",
        TMode
      > & {
        abi?: never;
        functionName?: "withdrawStake";
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    "withdrawStake",
    TMode
  >({
    abi: lightVerifyingPaymasterABI,
    functionName: "withdrawStake",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"withdrawTo"`.
 */
export function useLightVerifyingPaymasterWithdrawTo<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightVerifyingPaymasterABI,
          "withdrawTo"
        >["request"]["abi"],
        "withdrawTo",
        TMode
      > & { functionName?: "withdrawTo" }
    : UseContractWriteConfig<
        typeof lightVerifyingPaymasterABI,
        "withdrawTo",
        TMode
      > & {
        abi?: never;
        functionName?: "withdrawTo";
      } = {} as any,
) {
  return useContractWrite<
    typeof lightVerifyingPaymasterABI,
    "withdrawTo",
    TMode
  >({
    abi: lightVerifyingPaymasterABI,
    functionName: "withdrawTo",
    ...config,
  } as any);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__.
 */
export function usePrepareLightVerifyingPaymasterWrite<
  TFunctionName extends string,
>(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      TFunctionName
    >,
    "abi"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    TFunctionName
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"addStake"`.
 */
export function usePrepareLightVerifyingPaymasterAddStake(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "addStake"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "addStake",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "addStake"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"deposit"`.
 */
export function usePrepareLightVerifyingPaymasterDeposit(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightVerifyingPaymasterABI, "deposit">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "deposit",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "deposit"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"postOp"`.
 */
export function usePrepareLightVerifyingPaymasterPostOp(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightVerifyingPaymasterABI, "postOp">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "postOp",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "postOp"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"renounceOwnership"`.
 */
export function usePrepareLightVerifyingPaymasterRenounceOwnership(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "renounceOwnership"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "renounceOwnership",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "renounceOwnership"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"transferOwnership"`.
 */
export function usePrepareLightVerifyingPaymasterTransferOwnership(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "transferOwnership"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "transferOwnership",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "transferOwnership"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"unlockStake"`.
 */
export function usePrepareLightVerifyingPaymasterUnlockStake(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "unlockStake"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "unlockStake",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "unlockStake"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"validatePaymasterUserOp"`.
 */
export function usePrepareLightVerifyingPaymasterValidatePaymasterUserOp(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "validatePaymasterUserOp"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "validatePaymasterUserOp",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "validatePaymasterUserOp"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"withdrawStake"`.
 */
export function usePrepareLightVerifyingPaymasterWithdrawStake(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "withdrawStake"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "withdrawStake",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "withdrawStake"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `functionName` set to `"withdrawTo"`.
 */
export function usePrepareLightVerifyingPaymasterWithdrawTo(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightVerifyingPaymasterABI,
      "withdrawTo"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightVerifyingPaymasterABI,
    functionName: "withdrawTo",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightVerifyingPaymasterABI,
    "withdrawTo"
  >);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__.
 */
export function useLightVerifyingPaymasterEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof lightVerifyingPaymasterABI, TEventName>,
    "abi"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightVerifyingPaymasterABI,
    ...config,
  } as UseContractEventConfig<typeof lightVerifyingPaymasterABI, TEventName>);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightVerifyingPaymasterABI}__ and `eventName` set to `"OwnershipTransferred"`.
 */
export function useLightVerifyingPaymasterOwnershipTransferredEvent(
  config: Omit<
    UseContractEventConfig<
      typeof lightVerifyingPaymasterABI,
      "OwnershipTransferred"
    >,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightVerifyingPaymasterABI,
    eventName: "OwnershipTransferred",
    ...config,
  } as UseContractEventConfig<
    typeof lightVerifyingPaymasterABI,
    "OwnershipTransferred"
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__.
 */
export function useLightWalletRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"NAME"`.
 */
export function useLightWalletName<
  TFunctionName extends "NAME",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "NAME",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"SET_IMAGE_HASH_TYPE_HASH"`.
 */
export function useLightWalletSetImageHashTypeHash<
  TFunctionName extends "SET_IMAGE_HASH_TYPE_HASH",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "SET_IMAGE_HASH_TYPE_HASH",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"VERSION"`.
 */
export function useLightWalletVersion<
  TFunctionName extends "VERSION",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "VERSION",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"entryPoint"`.
 */
export function useLightWalletEntryPoint<
  TFunctionName extends "entryPoint",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "entryPoint",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"getNonce"`.
 */
export function useLightWalletGetNonce<
  TFunctionName extends "getNonce",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "getNonce",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"imageHash"`.
 */
export function useLightWalletImageHash<
  TFunctionName extends "imageHash",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "imageHash",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"isValidSignature"`.
 */
export function useLightWalletIsValidSignature<
  TFunctionName extends "isValidSignature",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "isValidSignature",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"onERC1155BatchReceived"`.
 */
export function useLightWalletOnErc1155BatchReceived<
  TFunctionName extends "onERC1155BatchReceived",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "onERC1155BatchReceived",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"onERC1155Received"`.
 */
export function useLightWalletOnErc1155Received<
  TFunctionName extends "onERC1155Received",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "onERC1155Received",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"onERC721Received"`.
 */
export function useLightWalletOnErc721Received<
  TFunctionName extends "onERC721Received",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "onERC721Received",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"proxiableUUID"`.
 */
export function useLightWalletProxiableUuid<
  TFunctionName extends "proxiableUUID",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "proxiableUUID",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"signatureRecovery"`.
 */
export function useLightWalletSignatureRecovery<
  TFunctionName extends "signatureRecovery",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "signatureRecovery",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"supportsInterface"`.
 */
export function useLightWalletSupportsInterface<
  TFunctionName extends "supportsInterface",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "supportsInterface",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"tokensReceived"`.
 */
export function useLightWalletTokensReceived<
  TFunctionName extends "tokensReceived",
  TSelectData = ReadContractResult<typeof lightWalletABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof lightWalletABI, TFunctionName, TSelectData>,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletABI,
    functionName: "tokensReceived",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__.
 */
export function useLightWalletWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          string
        >["request"]["abi"],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof lightWalletABI, TFunctionName, TMode> & {
        abi?: never;
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, TFunctionName, TMode>({
    abi: lightWalletABI,
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"execute"`.
 */
export function useLightWalletExecute<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "execute"
        >["request"]["abi"],
        "execute",
        TMode
      > & { functionName?: "execute" }
    : UseContractWriteConfig<typeof lightWalletABI, "execute", TMode> & {
        abi?: never;
        functionName?: "execute";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "execute", TMode>({
    abi: lightWalletABI,
    functionName: "execute",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"executeBatch"`.
 */
export function useLightWalletExecuteBatch<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "executeBatch"
        >["request"]["abi"],
        "executeBatch",
        TMode
      > & { functionName?: "executeBatch" }
    : UseContractWriteConfig<typeof lightWalletABI, "executeBatch", TMode> & {
        abi?: never;
        functionName?: "executeBatch";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "executeBatch", TMode>({
    abi: lightWalletABI,
    functionName: "executeBatch",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"initialize"`.
 */
export function useLightWalletInitialize<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "initialize"
        >["request"]["abi"],
        "initialize",
        TMode
      > & { functionName?: "initialize" }
    : UseContractWriteConfig<typeof lightWalletABI, "initialize", TMode> & {
        abi?: never;
        functionName?: "initialize";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "initialize", TMode>({
    abi: lightWalletABI,
    functionName: "initialize",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"updateImageHash"`.
 */
export function useLightWalletUpdateImageHash<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "updateImageHash"
        >["request"]["abi"],
        "updateImageHash",
        TMode
      > & { functionName?: "updateImageHash" }
    : UseContractWriteConfig<
        typeof lightWalletABI,
        "updateImageHash",
        TMode
      > & {
        abi?: never;
        functionName?: "updateImageHash";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "updateImageHash", TMode>({
    abi: lightWalletABI,
    functionName: "updateImageHash",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"upgradeTo"`.
 */
export function useLightWalletUpgradeTo<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "upgradeTo"
        >["request"]["abi"],
        "upgradeTo",
        TMode
      > & { functionName?: "upgradeTo" }
    : UseContractWriteConfig<typeof lightWalletABI, "upgradeTo", TMode> & {
        abi?: never;
        functionName?: "upgradeTo";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "upgradeTo", TMode>({
    abi: lightWalletABI,
    functionName: "upgradeTo",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"upgradeToAndCall"`.
 */
export function useLightWalletUpgradeToAndCall<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "upgradeToAndCall"
        >["request"]["abi"],
        "upgradeToAndCall",
        TMode
      > & { functionName?: "upgradeToAndCall" }
    : UseContractWriteConfig<
        typeof lightWalletABI,
        "upgradeToAndCall",
        TMode
      > & {
        abi?: never;
        functionName?: "upgradeToAndCall";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "upgradeToAndCall", TMode>({
    abi: lightWalletABI,
    functionName: "upgradeToAndCall",
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"validateUserOp"`.
 */
export function useLightWalletValidateUserOp<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletABI,
          "validateUserOp"
        >["request"]["abi"],
        "validateUserOp",
        TMode
      > & { functionName?: "validateUserOp" }
    : UseContractWriteConfig<typeof lightWalletABI, "validateUserOp", TMode> & {
        abi?: never;
        functionName?: "validateUserOp";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletABI, "validateUserOp", TMode>({
    abi: lightWalletABI,
    functionName: "validateUserOp",
    ...config,
  } as any);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__.
 */
export function usePrepareLightWalletWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, TFunctionName>,
    "abi"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, TFunctionName>);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"execute"`.
 */
export function usePrepareLightWalletExecute(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "execute">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "execute",
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, "execute">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"executeBatch"`.
 */
export function usePrepareLightWalletExecuteBatch(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "executeBatch">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "executeBatch",
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, "executeBatch">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"initialize"`.
 */
export function usePrepareLightWalletInitialize(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "initialize">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "initialize",
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, "initialize">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"updateImageHash"`.
 */
export function usePrepareLightWalletUpdateImageHash(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "updateImageHash">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "updateImageHash",
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, "updateImageHash">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"upgradeTo"`.
 */
export function usePrepareLightWalletUpgradeTo(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "upgradeTo">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "upgradeTo",
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, "upgradeTo">);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"upgradeToAndCall"`.
 */
export function usePrepareLightWalletUpgradeToAndCall(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "upgradeToAndCall">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "upgradeToAndCall",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightWalletABI,
    "upgradeToAndCall"
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletABI}__ and `functionName` set to `"validateUserOp"`.
 */
export function usePrepareLightWalletValidateUserOp(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletABI, "validateUserOp">,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletABI,
    functionName: "validateUserOp",
    ...config,
  } as UsePrepareContractWriteConfig<typeof lightWalletABI, "validateUserOp">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__.
 */
export function useLightWalletEvent<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, TEventName>,
    "abi"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, TEventName>);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__ and `eventName` set to `"AdminChanged"`.
 */
export function useLightWalletAdminChangedEvent(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, "AdminChanged">,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    eventName: "AdminChanged",
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, "AdminChanged">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__ and `eventName` set to `"BeaconUpgraded"`.
 */
export function useLightWalletBeaconUpgradedEvent(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, "BeaconUpgraded">,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    eventName: "BeaconUpgraded",
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, "BeaconUpgraded">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__ and `eventName` set to `"ImageHashUpdated"`.
 */
export function useLightWalletImageHashUpdatedEvent(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, "ImageHashUpdated">,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    eventName: "ImageHashUpdated",
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, "ImageHashUpdated">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__ and `eventName` set to `"Initialized"`.
 */
export function useLightWalletInitializedEvent(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, "Initialized">,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    eventName: "Initialized",
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, "Initialized">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__ and `eventName` set to `"LightWalletInitialized"`.
 */
export function useLightWalletLightWalletInitializedEvent(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, "LightWalletInitialized">,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    eventName: "LightWalletInitialized",
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, "LightWalletInitialized">);
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link lightWalletABI}__ and `eventName` set to `"Upgraded"`.
 */
export function useLightWalletUpgradedEvent(
  config: Omit<
    UseContractEventConfig<typeof lightWalletABI, "Upgraded">,
    "abi" | "eventName"
  > = {} as any,
) {
  return useContractEvent({
    abi: lightWalletABI,
    eventName: "Upgraded",
    ...config,
  } as UseContractEventConfig<typeof lightWalletABI, "Upgraded">);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletFactoryABI}__.
 */
export function useLightWalletFactoryRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof lightWalletFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightWalletFactoryABI,
      TFunctionName,
      TSelectData
    >,
    "abi"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletFactoryABI,
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletFactoryABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletFactoryABI}__ and `functionName` set to `"NAME"`.
 */
export function useLightWalletFactoryName<
  TFunctionName extends "NAME",
  TSelectData = ReadContractResult<typeof lightWalletFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightWalletFactoryABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletFactoryABI,
    functionName: "NAME",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletFactoryABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletFactoryABI}__ and `functionName` set to `"VERSION"`.
 */
export function useLightWalletFactoryVersion<
  TFunctionName extends "VERSION",
  TSelectData = ReadContractResult<typeof lightWalletFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightWalletFactoryABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletFactoryABI,
    functionName: "VERSION",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletFactoryABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletFactoryABI}__ and `functionName` set to `"accountImplementation"`.
 */
export function useLightWalletFactoryAccountImplementation<
  TFunctionName extends "accountImplementation",
  TSelectData = ReadContractResult<typeof lightWalletFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightWalletFactoryABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletFactoryABI,
    functionName: "accountImplementation",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletFactoryABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link lightWalletFactoryABI}__ and `functionName` set to `"getAddress"`.
 */
export function useLightWalletFactoryGetAddress<
  TFunctionName extends "getAddress",
  TSelectData = ReadContractResult<typeof lightWalletFactoryABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<
      typeof lightWalletFactoryABI,
      TFunctionName,
      TSelectData
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return useContractRead({
    abi: lightWalletFactoryABI,
    functionName: "getAddress",
    ...config,
  } as UseContractReadConfig<
    typeof lightWalletFactoryABI,
    TFunctionName,
    TSelectData
  >);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletFactoryABI}__.
 */
export function useLightWalletFactoryWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletFactoryABI,
          string
        >["request"]["abi"],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<
        typeof lightWalletFactoryABI,
        TFunctionName,
        TMode
      > & {
        abi?: never;
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletFactoryABI, TFunctionName, TMode>({
    abi: lightWalletFactoryABI,
    ...config,
  } as any);
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link lightWalletFactoryABI}__ and `functionName` set to `"createAccount"`.
 */
export function useLightWalletFactoryCreateAccount<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends "prepared"
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof lightWalletFactoryABI,
          "createAccount"
        >["request"]["abi"],
        "createAccount",
        TMode
      > & { functionName?: "createAccount" }
    : UseContractWriteConfig<
        typeof lightWalletFactoryABI,
        "createAccount",
        TMode
      > & {
        abi?: never;
        functionName?: "createAccount";
      } = {} as any,
) {
  return useContractWrite<typeof lightWalletFactoryABI, "createAccount", TMode>(
    {
      abi: lightWalletFactoryABI,
      functionName: "createAccount",
      ...config,
    } as any,
  );
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletFactoryABI}__.
 */
export function usePrepareLightWalletFactoryWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof lightWalletFactoryABI, TFunctionName>,
    "abi"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletFactoryABI,
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightWalletFactoryABI,
    TFunctionName
  >);
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link lightWalletFactoryABI}__ and `functionName` set to `"createAccount"`.
 */
export function usePrepareLightWalletFactoryCreateAccount(
  config: Omit<
    UsePrepareContractWriteConfig<
      typeof lightWalletFactoryABI,
      "createAccount"
    >,
    "abi" | "functionName"
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: lightWalletFactoryABI,
    functionName: "createAccount",
    ...config,
  } as UsePrepareContractWriteConfig<
    typeof lightWalletFactoryABI,
    "createAccount"
  >);
}
