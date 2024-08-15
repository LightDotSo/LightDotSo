import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EntryPoint
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entryPointAbi = [
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "SIG_VALIDATION_FAILED",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "initCode", internalType: "bytes", type: "bytes" },
      { name: "sender", internalType: "address", type: "address" },
      { name: "paymasterAndData", internalType: "bytes", type: "bytes" },
    ],
    name: "_validateSenderAndPaymaster",
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "unstakeDelaySec", internalType: "uint32", type: "uint32" },
    ],
    name: "addStake",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "depositTo",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "deposits",
    outputs: [
      { name: "deposit", internalType: "uint112", type: "uint112" },
      { name: "staked", internalType: "bool", type: "bool" },
      { name: "stake", internalType: "uint112", type: "uint112" },
      { name: "unstakeDelaySec", internalType: "uint32", type: "uint32" },
      { name: "withdrawTime", internalType: "uint48", type: "uint48" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "getDepositInfo",
    outputs: [
      {
        name: "info",
        internalType: "struct IStakeManager.DepositInfo",
        type: "tuple",
        components: [
          { name: "deposit", internalType: "uint112", type: "uint112" },
          { name: "staked", internalType: "bool", type: "bool" },
          { name: "stake", internalType: "uint112", type: "uint112" },
          { name: "unstakeDelaySec", internalType: "uint32", type: "uint32" },
          { name: "withdrawTime", internalType: "uint48", type: "uint48" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "key", internalType: "uint192", type: "uint192" },
    ],
    name: "getNonce",
    outputs: [{ name: "nonce", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "initCode", internalType: "bytes", type: "bytes" }],
    name: "getSenderAddress",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
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
    ],
    name: "getUserOpHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "opsPerAggregator",
        internalType: "struct IEntryPoint.UserOpsPerAggregator[]",
        type: "tuple[]",
        components: [
          {
            name: "userOps",
            internalType: "struct UserOperation[]",
            type: "tuple[]",
            components: [
              { name: "sender", internalType: "address", type: "address" },
              { name: "nonce", internalType: "uint256", type: "uint256" },
              { name: "initCode", internalType: "bytes", type: "bytes" },
              { name: "callData", internalType: "bytes", type: "bytes" },
              {
                name: "callGasLimit",
                internalType: "uint256",
                type: "uint256",
              },
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
              {
                name: "maxFeePerGas",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "paymasterAndData",
                internalType: "bytes",
                type: "bytes",
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
            ],
          },
          {
            name: "aggregator",
            internalType: "contract IAggregator",
            type: "address",
          },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "beneficiary", internalType: "address payable", type: "address" },
    ],
    name: "handleAggregatedOps",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "ops",
        internalType: "struct UserOperation[]",
        type: "tuple[]",
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
      { name: "beneficiary", internalType: "address payable", type: "address" },
    ],
    name: "handleOps",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "key", internalType: "uint192", type: "uint192" }],
    name: "incrementNonce",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "callData", internalType: "bytes", type: "bytes" },
      {
        name: "opInfo",
        internalType: "struct EntryPoint.UserOpInfo",
        type: "tuple",
        components: [
          {
            name: "mUserOp",
            internalType: "struct EntryPoint.MemoryUserOp",
            type: "tuple",
            components: [
              { name: "sender", internalType: "address", type: "address" },
              { name: "nonce", internalType: "uint256", type: "uint256" },
              {
                name: "callGasLimit",
                internalType: "uint256",
                type: "uint256",
              },
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
              { name: "paymaster", internalType: "address", type: "address" },
              {
                name: "maxFeePerGas",
                internalType: "uint256",
                type: "uint256",
              },
              {
                name: "maxPriorityFeePerGas",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "userOpHash", internalType: "bytes32", type: "bytes32" },
          { name: "prefund", internalType: "uint256", type: "uint256" },
          { name: "contextOffset", internalType: "uint256", type: "uint256" },
          { name: "preOpGas", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "context", internalType: "bytes", type: "bytes" },
    ],
    name: "innerHandleOp",
    outputs: [
      { name: "actualGasCost", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint192", type: "uint192" },
    ],
    name: "nonceSequenceNumber",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "op",
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
      { name: "target", internalType: "address", type: "address" },
      { name: "targetCallData", internalType: "bytes", type: "bytes" },
    ],
    name: "simulateHandleOp",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
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
    ],
    name: "simulateValidation",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "withdrawAddress",
        internalType: "address payable",
        type: "address",
      },
      { name: "withdrawAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "userOpHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "factory",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "paymaster",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "AccountDeployed",
  },
  { type: "event", anonymous: false, inputs: [], name: "BeforeExecution" },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "totalDeposit",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposited",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "aggregator",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "SignatureAggregatorChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "totalStaked",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "unstakeDelaySec",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeLocked",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "withdrawTime",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeUnlocked",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "withdrawAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "StakeWithdrawn",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "userOpHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "paymaster",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "nonce",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "success", internalType: "bool", type: "bool", indexed: false },
      {
        name: "actualGasCost",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "actualGasUsed",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "UserOperationEvent",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "userOpHash",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "nonce",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "revertReason",
        internalType: "bytes",
        type: "bytes",
        indexed: false,
      },
    ],
    name: "UserOperationRevertReason",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "withdrawAddress",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Withdrawn",
  },
  {
    type: "error",
    inputs: [
      { name: "preOpGas", internalType: "uint256", type: "uint256" },
      { name: "paid", internalType: "uint256", type: "uint256" },
      { name: "validAfter", internalType: "uint48", type: "uint48" },
      { name: "validUntil", internalType: "uint48", type: "uint48" },
      { name: "targetSuccess", internalType: "bool", type: "bool" },
      { name: "targetResult", internalType: "bytes", type: "bytes" },
    ],
    name: "ExecutionResult",
  },
  {
    type: "error",
    inputs: [
      { name: "opIndex", internalType: "uint256", type: "uint256" },
      { name: "reason", internalType: "string", type: "string" },
    ],
    name: "FailedOp",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "SenderAddressResult",
  },
  {
    type: "error",
    inputs: [{ name: "aggregator", internalType: "address", type: "address" }],
    name: "SignatureValidationFailed",
  },
  {
    type: "error",
    inputs: [
      {
        name: "returnInfo",
        internalType: "struct IEntryPoint.ReturnInfo",
        type: "tuple",
        components: [
          { name: "preOpGas", internalType: "uint256", type: "uint256" },
          { name: "prefund", internalType: "uint256", type: "uint256" },
          { name: "sigFailed", internalType: "bool", type: "bool" },
          { name: "validAfter", internalType: "uint48", type: "uint48" },
          { name: "validUntil", internalType: "uint48", type: "uint48" },
          { name: "paymasterContext", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "senderInfo",
        internalType: "struct IStakeManager.StakeInfo",
        type: "tuple",
        components: [
          { name: "stake", internalType: "uint256", type: "uint256" },
          { name: "unstakeDelaySec", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "factoryInfo",
        internalType: "struct IStakeManager.StakeInfo",
        type: "tuple",
        components: [
          { name: "stake", internalType: "uint256", type: "uint256" },
          { name: "unstakeDelaySec", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "paymasterInfo",
        internalType: "struct IStakeManager.StakeInfo",
        type: "tuple",
        components: [
          { name: "stake", internalType: "uint256", type: "uint256" },
          { name: "unstakeDelaySec", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "ValidationResult",
  },
  {
    type: "error",
    inputs: [
      {
        name: "returnInfo",
        internalType: "struct IEntryPoint.ReturnInfo",
        type: "tuple",
        components: [
          { name: "preOpGas", internalType: "uint256", type: "uint256" },
          { name: "prefund", internalType: "uint256", type: "uint256" },
          { name: "sigFailed", internalType: "bool", type: "bool" },
          { name: "validAfter", internalType: "uint48", type: "uint48" },
          { name: "validUntil", internalType: "uint48", type: "uint48" },
          { name: "paymasterContext", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "senderInfo",
        internalType: "struct IStakeManager.StakeInfo",
        type: "tuple",
        components: [
          { name: "stake", internalType: "uint256", type: "uint256" },
          { name: "unstakeDelaySec", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "factoryInfo",
        internalType: "struct IStakeManager.StakeInfo",
        type: "tuple",
        components: [
          { name: "stake", internalType: "uint256", type: "uint256" },
          { name: "unstakeDelaySec", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "paymasterInfo",
        internalType: "struct IStakeManager.StakeInfo",
        type: "tuple",
        components: [
          { name: "stake", internalType: "uint256", type: "uint256" },
          { name: "unstakeDelaySec", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "aggregatorInfo",
        internalType: "struct IEntryPoint.AggregatorStakeInfo",
        type: "tuple",
        components: [
          { name: "aggregator", internalType: "address", type: "address" },
          {
            name: "stakeInfo",
            internalType: "struct IStakeManager.StakeInfo",
            type: "tuple",
            components: [
              { name: "stake", internalType: "uint256", type: "uint256" },
              {
                name: "unstakeDelaySec",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
        ],
      },
    ],
    name: "ValidationResultWithAggregation",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightDAG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightDagAbi = [
  {
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "operationRoot",
        internalType: "struct LightDAG.OperationRoot",
        type: "tuple",
        components: [
          { name: "root", internalType: "bytes32", type: "bytes32" },
          {
            name: "operations",
            internalType: "struct LightDAG.Operation[]",
            type: "tuple[]",
            components: [
              { name: "hash", internalType: "bytes32", type: "bytes32" },
              {
                name: "conditionData",
                internalType: "bytes[]",
                type: "bytes[]",
              },
              {
                name: "dependencies",
                internalType: "bytes32[]",
                type: "bytes32[]",
              },
              {
                name: "fallbackOperation",
                internalType: "bytes32",
                type: "bytes32",
              },
            ],
          },
        ],
      },
    ],
    name: "addOperationRoot",
    outputs: [],
    stateMutability: "pure",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightPaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightPaymasterAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "entryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
      { name: "verifyingSigner", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "unstakeDelaySec", internalType: "uint32", type: "uint32" },
    ],
    name: "addStake",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "entryPoint",
    outputs: [
      { name: "", internalType: "contract IEntryPoint", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "pure",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "senderNonce",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "verifyingSigner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
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
    stateMutability: "nonpayable",
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
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightVerifyingPaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightVerifyingPaymasterAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "entryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
      { name: "verifyingSigner", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "unstakeDelaySec", internalType: "uint32", type: "uint32" },
    ],
    name: "addStake",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "entryPoint",
    outputs: [
      { name: "", internalType: "contract IEntryPoint", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDeposit",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "pure",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "senderNonce",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "unlockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "verifyingSigner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "nonpayable",
  },
  {
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
    stateMutability: "nonpayable",
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
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightWallet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightWalletAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "anEntryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "SET_IMAGE_HASH_TYPE_HASH",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "entryPoint",
    outputs: [
      { name: "", internalType: "contract IEntryPoint", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "dest", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "func", internalType: "bytes", type: "bytes" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "dest", internalType: "address[]", type: "address[]" },
      { name: "value", internalType: "uint256[]", type: "uint256[]" },
      { name: "func", internalType: "bytes[]", type: "bytes[]" },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "getNonce",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "imageHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "imageHash", internalType: "bytes32", type: "bytes32" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "signatures", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_data", internalType: "bytes", type: "bytes" },
      { name: "_signatures", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "pure",
  },
  {
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
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "bytes", type: "bytes" },
    ],
    name: "onERC721Received",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [],
    name: "proxiableUUID",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
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
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "pure",
  },
  {
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
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "_imageHash", internalType: "bytes32", type: "bytes32" }],
    name: "updateImageHash",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newImplementation", internalType: "address", type: "address" },
      { name: "data", internalType: "bytes", type: "bytes" },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
  },
  {
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
    stateMutability: "nonpayable",
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
  { type: "error", inputs: [], name: "EmptySignature" },
  { type: "error", inputs: [], name: "ImageHashIsZero" },
  {
    type: "error",
    inputs: [
      { name: "root", internalType: "bytes32", type: "bytes32" },
      { name: "leaf", internalType: "bytes32", type: "bytes32" },
    ],
    name: "InvalidMerkleProof",
  },
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
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightWalletFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightWalletFactoryAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "entryPoint",
        internalType: "contract IEntryPoint",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "NAME",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "VERSION",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "accountImplementation",
    outputs: [
      { name: "", internalType: "contract LightWallet", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "createAccount",
    outputs: [
      { name: "ret", internalType: "contract LightWallet", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "hash", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "EntrypointAddressZero" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useReadEntryPoint = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"SIG_VALIDATION_FAILED"`
 */
export const useReadEntryPointSigValidationFailed =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: "SIG_VALIDATION_FAILED",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"_validateSenderAndPaymaster"`
 */
export const useReadEntryPointValidateSenderAndPaymaster =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: "_validateSenderAndPaymaster",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadEntryPointBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"deposits"`
 */
export const useReadEntryPointDeposits = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: "deposits",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getDepositInfo"`
 */
export const useReadEntryPointGetDepositInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: "getDepositInfo",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getNonce"`
 */
export const useReadEntryPointGetNonce = /*#__PURE__*/ createUseReadContract({
  abi: entryPointAbi,
  functionName: "getNonce",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getUserOpHash"`
 */
export const useReadEntryPointGetUserOpHash =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: "getUserOpHash",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"nonceSequenceNumber"`
 */
export const useReadEntryPointNonceSequenceNumber =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointAbi,
    functionName: "nonceSequenceNumber",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useWriteEntryPoint = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"addStake"`
 */
export const useWriteEntryPointAddStake = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointAbi,
  functionName: "addStake",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"depositTo"`
 */
export const useWriteEntryPointDepositTo = /*#__PURE__*/ createUseWriteContract(
  { abi: entryPointAbi, functionName: "depositTo" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getSenderAddress"`
 */
export const useWriteEntryPointGetSenderAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "getSenderAddress",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"handleAggregatedOps"`
 */
export const useWriteEntryPointHandleAggregatedOps =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "handleAggregatedOps",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"handleOps"`
 */
export const useWriteEntryPointHandleOps = /*#__PURE__*/ createUseWriteContract(
  { abi: entryPointAbi, functionName: "handleOps" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"incrementNonce"`
 */
export const useWriteEntryPointIncrementNonce =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "incrementNonce",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"innerHandleOp"`
 */
export const useWriteEntryPointInnerHandleOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "innerHandleOp",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"simulateHandleOp"`
 */
export const useWriteEntryPointSimulateHandleOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "simulateHandleOp",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"simulateValidation"`
 */
export const useWriteEntryPointSimulateValidation =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "simulateValidation",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteEntryPointUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "unlockStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteEntryPointWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "withdrawStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteEntryPointWithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointAbi,
    functionName: "withdrawTo",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useSimulateEntryPoint = /*#__PURE__*/ createUseSimulateContract({
  abi: entryPointAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateEntryPointAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "addStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"depositTo"`
 */
export const useSimulateEntryPointDepositTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "depositTo",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"getSenderAddress"`
 */
export const useSimulateEntryPointGetSenderAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "getSenderAddress",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"handleAggregatedOps"`
 */
export const useSimulateEntryPointHandleAggregatedOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "handleAggregatedOps",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"handleOps"`
 */
export const useSimulateEntryPointHandleOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "handleOps",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"incrementNonce"`
 */
export const useSimulateEntryPointIncrementNonce =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "incrementNonce",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"innerHandleOp"`
 */
export const useSimulateEntryPointInnerHandleOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "innerHandleOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"simulateHandleOp"`
 */
export const useSimulateEntryPointSimulateHandleOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "simulateHandleOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"simulateValidation"`
 */
export const useSimulateEntryPointSimulateValidation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "simulateValidation",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateEntryPointUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "unlockStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateEntryPointWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "withdrawStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateEntryPointWithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointAbi,
    functionName: "withdrawTo",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__
 */
export const useWatchEntryPointEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: entryPointAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"AccountDeployed"`
 */
export const useWatchEntryPointAccountDeployedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "AccountDeployed",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"BeforeExecution"`
 */
export const useWatchEntryPointBeforeExecutionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "BeforeExecution",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchEntryPointDepositedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "Deposited",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"SignatureAggregatorChanged"`
 */
export const useWatchEntryPointSignatureAggregatorChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "SignatureAggregatorChanged",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"StakeLocked"`
 */
export const useWatchEntryPointStakeLockedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "StakeLocked",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"StakeUnlocked"`
 */
export const useWatchEntryPointStakeUnlockedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "StakeUnlocked",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"StakeWithdrawn"`
 */
export const useWatchEntryPointStakeWithdrawnEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "StakeWithdrawn",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"UserOperationEvent"`
 */
export const useWatchEntryPointUserOperationEventEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "UserOperationEvent",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"UserOperationRevertReason"`
 */
export const useWatchEntryPointUserOperationRevertReasonEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "UserOperationRevertReason",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointAbi}__ and `eventName` set to `"Withdrawn"`
 */
export const useWatchEntryPointWithdrawnEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointAbi,
    eventName: "Withdrawn",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useReadLightDag = /*#__PURE__*/ createUseReadContract({
  abi: lightDagAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightDagName = /*#__PURE__*/ createUseReadContract({
  abi: lightDagAbi,
  functionName: "NAME",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightDagVersion = /*#__PURE__*/ createUseReadContract({
  abi: lightDagAbi,
  functionName: "VERSION",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"addOperationRoot"`
 */
export const useReadLightDagAddOperationRoot =
  /*#__PURE__*/ createUseReadContract({
    abi: lightDagAbi,
    functionName: "addOperationRoot",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useReadLightPaymaster = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightPaymasterEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "entryPoint",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"getDeposit"`
 */
export const useReadLightPaymasterGetDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "getDeposit",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"getHash"`
 */
export const useReadLightPaymasterGetHash = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: "getHash" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLightPaymasterOwner = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
  functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"parsePaymasterAndData"`
 */
export const useReadLightPaymasterParsePaymasterAndData =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "parsePaymasterAndData",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"senderNonce"`
 */
export const useReadLightPaymasterSenderNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "senderNonce",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"verifyingSigner"`
 */
export const useReadLightPaymasterVerifyingSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "verifyingSigner",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWriteLightPaymaster = /*#__PURE__*/ createUseWriteContract({
  abi: lightPaymasterAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useWriteLightPaymasterAddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "addStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteLightPaymasterDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "deposit",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useWriteLightPaymasterPostOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "postOp",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteLightPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteLightPaymasterTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteLightPaymasterUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "unlockStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useWriteLightPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "validatePaymasterUserOp",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteLightPaymasterWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "withdrawStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteLightPaymasterWithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "withdrawTo",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useSimulateLightPaymaster =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightPaymasterAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateLightPaymasterAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "addStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateLightPaymasterDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "deposit",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useSimulateLightPaymasterPostOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "postOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateLightPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateLightPaymasterTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateLightPaymasterUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "unlockStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useSimulateLightPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "validatePaymasterUserOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateLightPaymasterWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "withdrawStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateLightPaymasterWithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "withdrawTo",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWatchLightPaymasterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightPaymasterAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLightPaymasterOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "OwnershipTransferred",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useReadLightVerifyingPaymaster =
  /*#__PURE__*/ createUseReadContract({ abi: lightVerifyingPaymasterAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightVerifyingPaymasterEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "entryPoint",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"getDeposit"`
 */
export const useReadLightVerifyingPaymasterGetDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "getDeposit",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"getHash"`
 */
export const useReadLightVerifyingPaymasterGetHash =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "getHash",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLightVerifyingPaymasterOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "owner",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"parsePaymasterAndData"`
 */
export const useReadLightVerifyingPaymasterParsePaymasterAndData =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "parsePaymasterAndData",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"senderNonce"`
 */
export const useReadLightVerifyingPaymasterSenderNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "senderNonce",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"verifyingSigner"`
 */
export const useReadLightVerifyingPaymasterVerifyingSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "verifyingSigner",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useWriteLightVerifyingPaymaster =
  /*#__PURE__*/ createUseWriteContract({ abi: lightVerifyingPaymasterAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useWriteLightVerifyingPaymasterAddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "addStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteLightVerifyingPaymasterDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "deposit",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useWriteLightVerifyingPaymasterPostOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "postOp",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteLightVerifyingPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteLightVerifyingPaymasterTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteLightVerifyingPaymasterUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "unlockStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useWriteLightVerifyingPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "validatePaymasterUserOp",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteLightVerifyingPaymasterWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "withdrawStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteLightVerifyingPaymasterWithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "withdrawTo",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useSimulateLightVerifyingPaymaster =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightVerifyingPaymasterAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateLightVerifyingPaymasterAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "addStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateLightVerifyingPaymasterDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "deposit",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useSimulateLightVerifyingPaymasterPostOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "postOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateLightVerifyingPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateLightVerifyingPaymasterTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateLightVerifyingPaymasterUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "unlockStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useSimulateLightVerifyingPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "validatePaymasterUserOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateLightVerifyingPaymasterWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "withdrawStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateLightVerifyingPaymasterWithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: "withdrawTo",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useWatchLightVerifyingPaymasterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVerifyingPaymasterAbi,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLightVerifyingPaymasterOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVerifyingPaymasterAbi,
    eventName: "OwnershipTransferred",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useReadLightWallet = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightWalletName = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: "NAME",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"SET_IMAGE_HASH_TYPE_HASH"`
 */
export const useReadLightWalletSetImageHashTypeHash =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "SET_IMAGE_HASH_TYPE_HASH",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightWalletVersion = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: "VERSION",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightWalletEntryPoint = /*#__PURE__*/ createUseReadContract(
  { abi: lightWalletAbi, functionName: "entryPoint" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"getNonce"`
 */
export const useReadLightWalletGetNonce = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: "getNonce",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"imageHash"`
 */
export const useReadLightWalletImageHash = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: "imageHash",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"isValidSignature"`
 */
export const useReadLightWalletIsValidSignature =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "isValidSignature",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useReadLightWalletOnErc1155BatchReceived =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "onERC1155BatchReceived",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useReadLightWalletOnErc1155Received =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "onERC1155Received",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadLightWalletOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "onERC721Received",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightWalletProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "proxiableUUID",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"signatureRecovery"`
 */
export const useReadLightWalletSignatureRecovery =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "signatureRecovery",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLightWalletSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "supportsInterface",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"tokensReceived"`
 */
export const useReadLightWalletTokensReceived =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "tokensReceived",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useWriteLightWallet = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"execute"`
 */
export const useWriteLightWalletExecute = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletAbi,
  functionName: "execute",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useWriteLightWalletExecuteBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: "executeBatch",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightWalletInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: "initialize",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"updateImageHash"`
 */
export const useWriteLightWalletUpdateImageHash =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: "updateImageHash",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useWriteLightWalletUpgradeTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: "upgradeTo",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightWalletUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: "upgradeToAndCall",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"validateUserOp"`
 */
export const useWriteLightWalletValidateUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: "validateUserOp",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useSimulateLightWallet = /*#__PURE__*/ createUseSimulateContract({
  abi: lightWalletAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateLightWalletExecute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "execute",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useSimulateLightWalletExecuteBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "executeBatch",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightWalletInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "initialize",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"updateImageHash"`
 */
export const useSimulateLightWalletUpdateImageHash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "updateImageHash",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useSimulateLightWalletUpgradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "upgradeTo",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightWalletUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "upgradeToAndCall",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"validateUserOp"`
 */
export const useSimulateLightWalletValidateUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: "validateUserOp",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useWatchLightWalletEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightWalletAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"AdminChanged"`
 */
export const useWatchLightWalletAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: "AdminChanged",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"BeaconUpgraded"`
 */
export const useWatchLightWalletBeaconUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: "BeaconUpgraded",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"ImageHashUpdated"`
 */
export const useWatchLightWalletImageHashUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: "ImageHashUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightWalletInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: "Initialized",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"LightWalletInitialized"`
 */
export const useWatchLightWalletLightWalletInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: "LightWalletInitialized",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightWalletUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: "Upgraded",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useReadLightWalletFactory = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletFactoryAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightWalletFactoryName =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: "NAME",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightWalletFactoryVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: "VERSION",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"accountImplementation"`
 */
export const useReadLightWalletFactoryAccountImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: "accountImplementation",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"getAddress"`
 */
export const useReadLightWalletFactoryGetAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: "getAddress",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useWriteLightWalletFactory = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletFactoryAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"createAccount"`
 */
export const useWriteLightWalletFactoryCreateAccount =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletFactoryAbi,
    functionName: "createAccount",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useSimulateLightWalletFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightWalletFactoryAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"createAccount"`
 */
export const useSimulateLightWalletFactoryCreateAccount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletFactoryAbi,
    functionName: "createAccount",
  });
