import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from "wagmi/codegen";

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
    name: "callOperationRoot",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "operation",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "conditionData",
        internalType: "bytes[]",
        type: "bytes[]",
        indexed: false,
      },
      {
        name: "dependencies",
        internalType: "bytes32[]",
        type: "bytes32[]",
        indexed: false,
      },
      {
        name: "fallbackOperation",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "OperationCalled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "root", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "caller",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OperationRootCalled",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightPaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightPaymasterAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
    name: "UPGRADE_INTERFACE_VERSION",
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
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "signer_", internalType: "address", type: "address" }],
    name: "addSigner",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "entryPoint",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "unstakeDelaySeconds", internalType: "uint32", type: "uint32" },
    ],
    name: "entryPointAddStake",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "entryPointDeposit",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "entryPointUnlockStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address payable", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "entryPointWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "to", internalType: "address payable", type: "address" }],
    name: "entryPointWithdrawStake",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      {
        name: "withdrawRequest",
        internalType: "struct MagicSpend.WithdrawRequest",
        type: "tuple",
        components: [
          { name: "signature", internalType: "bytes", type: "bytes" },
          { name: "asset", internalType: "address", type: "address" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "expiry", internalType: "uint48", type: "uint48" },
        ],
      },
    ],
    name: "getHash",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner_", internalType: "address", type: "address" },
      {
        name: "maxWithdrawDenominator_",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "signer_", internalType: "address", type: "address" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      {
        name: "withdrawRequest",
        internalType: "struct MagicSpend.WithdrawRequest",
        type: "tuple",
        components: [
          { name: "signature", internalType: "bytes", type: "bytes" },
          { name: "asset", internalType: "address", type: "address" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "expiry", internalType: "uint48", type: "uint48" },
        ],
      },
    ],
    name: "isValidWithdrawSignature",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "maxWithdrawDenominator",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "nonce", internalType: "uint256", type: "uint256" },
    ],
    name: "nonceUsed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
      { name: "asset", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "ownerWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "pendingOwner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
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
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "postOp",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [{ name: "signer_", internalType: "address", type: "address" }],
    name: "removeSigner",
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
    inputs: [
      { name: "newDenominator", internalType: "uint256", type: "uint256" },
    ],
    name: "setMaxWithdrawDenominator",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "signers",
    outputs: [{ name: "isValidSigner", internalType: "bool", type: "bool" }],
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
        internalType: "struct PackedUserOperation",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "callData", internalType: "bytes", type: "bytes" },
          {
            name: "accountGasLimits",
            internalType: "bytes32",
            type: "bytes32",
          },
          {
            name: "preVerificationGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "gasFees", internalType: "bytes32", type: "bytes32" },
          { name: "paymasterAndData", internalType: "bytes", type: "bytes" },
          { name: "signature", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "", internalType: "bytes32", type: "bytes32" },
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
    inputs: [
      {
        name: "withdrawRequest",
        internalType: "struct MagicSpend.WithdrawRequest",
        type: "tuple",
        components: [
          { name: "signature", internalType: "bytes", type: "bytes" },
          { name: "asset", internalType: "address", type: "address" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "expiry", internalType: "uint48", type: "uint48" },
        ],
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawGasExcess",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
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
        name: "asset",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "nonce",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MagicSpendWithdrawal",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newDenominator",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MaxWithdrawDenominatorSet",
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
    name: "OwnershipTransferStarted",
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
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "signer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "SignerAdded",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "signer",
        internalType: "address",
        type: "address",
        indexed: false,
      },
    ],
    name: "SignerRemoved",
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
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [
      { name: "implementation", internalType: "address", type: "address" },
    ],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "Expired" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  {
    type: "error",
    inputs: [{ name: "nonce", internalType: "uint256", type: "uint256" }],
    name: "InvalidNonce",
  },
  { type: "error", inputs: [], name: "InvalidSignature" },
  { type: "error", inputs: [], name: "NoExcess" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  {
    type: "error",
    inputs: [
      { name: "requested", internalType: "uint256", type: "uint256" },
      { name: "maxCost", internalType: "uint256", type: "uint256" },
    ],
    name: "RequestLessThanGasMaxCost",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
  { type: "error", inputs: [], name: "Unauthorized" },
  { type: "error", inputs: [], name: "UnexpectedPostOpRevertedMode" },
  {
    type: "error",
    inputs: [{ name: "asset", internalType: "address", type: "address" }],
    name: "UnsupportedPaymasterAsset",
  },
  {
    type: "error",
    inputs: [
      { name: "requestedAmount", internalType: "uint256", type: "uint256" },
      { name: "maxAllowed", internalType: "uint256", type: "uint256" },
    ],
    name: "WithdrawTooLarge",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightTimelockController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightTimelockControllerAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "receive", stateMutability: "payable" },
  {
    type: "function",
    inputs: [],
    name: "CANCELLER_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "EXECUTOR_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "LIGHT_PROTOCOL_CONTROLLER",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MIN_DELAY",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
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
    name: "PROPOSER_ROLE",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UPGRADE_INTERFACE_VERSION",
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
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "cancel",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "target", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "payload", internalType: "bytes", type: "bytes" },
      { name: "predecessor", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "targets", internalType: "address[]", type: "address[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "payloads", internalType: "bytes[]", type: "bytes[]" },
      { name: "predecessor", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "getMinDelay",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "getOperationState",
    outputs: [
      {
        name: "",
        internalType: "enum TimelockControllerUpgradeable.OperationState",
        type: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "getTimestamp",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "target", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "predecessor", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "hashOperation",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "targets", internalType: "address[]", type: "address[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "payloads", internalType: "bytes[]", type: "bytes[]" },
      { name: "predecessor", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "hashOperationBatch",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [{ name: "wallet", internalType: "address", type: "address" }],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "isOperation",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "isOperationDone",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "isOperationPending",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "id", internalType: "bytes32", type: "bytes32" }],
    name: "isOperationReady",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
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
    stateMutability: "nonpayable",
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
    stateMutability: "nonpayable",
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
    stateMutability: "nonpayable",
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
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "callerConfirmation", internalType: "address", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32" },
      { name: "account", internalType: "address", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "target", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
      { name: "data", internalType: "bytes", type: "bytes" },
      { name: "predecessor", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "delay", internalType: "uint256", type: "uint256" },
    ],
    name: "schedule",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "targets", internalType: "address[]", type: "address[]" },
      { name: "values", internalType: "uint256[]", type: "uint256[]" },
      { name: "payloads", internalType: "bytes[]", type: "bytes[]" },
      { name: "predecessor", internalType: "bytes32", type: "bytes32" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "delay", internalType: "uint256", type: "uint256" },
    ],
    name: "scheduleBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "newDelay", internalType: "uint256", type: "uint256" }],
    name: "updateDelay",
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
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "index",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "CallExecuted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "salt",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
    ],
    name: "CallSalt",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "index",
        internalType: "uint256",
        type: "uint256",
        indexed: true,
      },
      {
        name: "target",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "data", internalType: "bytes", type: "bytes", indexed: false },
      {
        name: "predecessor",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "delay",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "CallScheduled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "id", internalType: "bytes32", type: "bytes32", indexed: true },
    ],
    name: "Cancelled",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
    ],
    name: "Initialized",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldDuration",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "newDuration",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MinDelayChange",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "previousAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
      {
        name: "newAdminRole",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RoleAdminChanged",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleGranted",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "sender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "RoleRevoked",
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
  { type: "error", inputs: [], name: "AccessControlBadConfirmation" },
  {
    type: "error",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "neededRole", internalType: "bytes32", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
  },
  {
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [
      { name: "implementation", internalType: "address", type: "address" },
    ],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
  { type: "error", inputs: [], name: "NotInitializing" },
  {
    type: "error",
    inputs: [
      { name: "delay", internalType: "uint256", type: "uint256" },
      { name: "minDelay", internalType: "uint256", type: "uint256" },
    ],
    name: "TimelockInsufficientDelay",
  },
  {
    type: "error",
    inputs: [
      { name: "targets", internalType: "uint256", type: "uint256" },
      { name: "payloads", internalType: "uint256", type: "uint256" },
      { name: "values", internalType: "uint256", type: "uint256" },
    ],
    name: "TimelockInvalidOperationLength",
  },
  {
    type: "error",
    inputs: [{ name: "caller", internalType: "address", type: "address" }],
    name: "TimelockUnauthorizedCaller",
  },
  {
    type: "error",
    inputs: [
      { name: "predecessorId", internalType: "bytes32", type: "bytes32" },
    ],
    name: "TimelockUnexecutedPredecessor",
  },
  {
    type: "error",
    inputs: [
      { name: "operationId", internalType: "bytes32", type: "bytes32" },
      { name: "expectedStates", internalType: "bytes32", type: "bytes32" },
    ],
    name: "TimelockUnexpectedOperationState",
  },
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightTimelockControllerFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightTimelockControllerFactoryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
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
      { name: "wallet", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "createTimelockController",
    outputs: [
      {
        name: "ret",
        internalType: "contract LightTimelockController",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "wallet", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
    ],
    name: "getAddress",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "timelockImplementation",
    outputs: [
      {
        name: "",
        internalType: "contract LightTimelockController",
        type: "address",
      },
    ],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "WalletAddressZero" },
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
    name: "UPGRADE_INTERFACE_VERSION",
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
    inputs: [{ name: "_imageHash", internalType: "bytes32", type: "bytes32" }],
    name: "updateImageHash",
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
        internalType: "struct PackedUserOperation",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "nonce", internalType: "uint256", type: "uint256" },
          { name: "initCode", internalType: "bytes", type: "bytes" },
          { name: "callData", internalType: "bytes", type: "bytes" },
          {
            name: "accountGasLimits",
            internalType: "bytes32",
            type: "bytes32",
          },
          {
            name: "preVerificationGas",
            internalType: "uint256",
            type: "uint256",
          },
          { name: "gasFees", internalType: "bytes32", type: "bytes32" },
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
      {
        name: "version",
        internalType: "uint64",
        type: "uint64",
        indexed: false,
      },
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
    type: "error",
    inputs: [{ name: "target", internalType: "address", type: "address" }],
    name: "AddressEmptyCode",
  },
  {
    type: "error",
    inputs: [
      { name: "implementation", internalType: "address", type: "address" },
    ],
    name: "ERC1967InvalidImplementation",
  },
  { type: "error", inputs: [], name: "ERC1967NonPayable" },
  { type: "error", inputs: [], name: "EmptySignature" },
  { type: "error", inputs: [], name: "FailedInnerCall" },
  { type: "error", inputs: [], name: "ImageHashIsZero" },
  { type: "error", inputs: [], name: "InvalidInitialization" },
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
  { type: "error", inputs: [], name: "NotInitializing" },
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
  { type: "error", inputs: [], name: "UUPSUnauthorizedCallContext" },
  {
    type: "error",
    inputs: [{ name: "slot", internalType: "bytes32", type: "bytes32" }],
    name: "UUPSUnsupportedProxiableUUID",
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useWriteLightDag = /*#__PURE__*/ createUseWriteContract({
  abi: lightDagAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"callOperationRoot"`
 */
export const useWriteLightDagCallOperationRoot =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightDagAbi,
    functionName: "callOperationRoot",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useSimulateLightDag = /*#__PURE__*/ createUseSimulateContract({
  abi: lightDagAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"callOperationRoot"`
 */
export const useSimulateLightDagCallOperationRoot =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightDagAbi,
    functionName: "callOperationRoot",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useWatchLightDagEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lightDagAbi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightDagAbi}__ and `eventName` set to `"OperationCalled"`
 */
export const useWatchLightDagOperationCalledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightDagAbi,
    eventName: "OperationCalled",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightDagAbi}__ and `eventName` set to `"OperationRootCalled"`
 */
export const useWatchLightDagOperationRootCalledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightDagAbi,
    eventName: "OperationRootCalled",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useReadLightPaymaster = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightPaymasterName = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
  functionName: "NAME",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadLightPaymasterUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "UPGRADE_INTERFACE_VERSION",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightPaymasterVersion = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: "VERSION" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightPaymasterEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "entryPoint",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"getHash"`
 */
export const useReadLightPaymasterGetHash = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: "getHash" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"isValidWithdrawSignature"`
 */
export const useReadLightPaymasterIsValidWithdrawSignature =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "isValidWithdrawSignature",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"maxWithdrawDenominator"`
 */
export const useReadLightPaymasterMaxWithdrawDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "maxWithdrawDenominator",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"nonceUsed"`
 */
export const useReadLightPaymasterNonceUsed =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "nonceUsed",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLightPaymasterOwner = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
  functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadLightPaymasterPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "pendingOwner",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightPaymasterProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: "proxiableUUID",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"signers"`
 */
export const useReadLightPaymasterSigners = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: "signers" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWriteLightPaymaster = /*#__PURE__*/ createUseWriteContract({
  abi: lightPaymasterAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteLightPaymasterAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "acceptOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addSigner"`
 */
export const useWriteLightPaymasterAddSigner =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "addSigner",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointAddStake"`
 */
export const useWriteLightPaymasterEntryPointAddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointAddStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointDeposit"`
 */
export const useWriteLightPaymasterEntryPointDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointDeposit",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointUnlockStake"`
 */
export const useWriteLightPaymasterEntryPointUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointUnlockStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdraw"`
 */
export const useWriteLightPaymasterEntryPointWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointWithdraw",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdrawStake"`
 */
export const useWriteLightPaymasterEntryPointWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointWithdrawStake",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightPaymasterInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "initialize",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"ownerWithdraw"`
 */
export const useWriteLightPaymasterOwnerWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "ownerWithdraw",
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"removeSigner"`
 */
export const useWriteLightPaymasterRemoveSigner =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "removeSigner",
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"setMaxWithdrawDenominator"`
 */
export const useWriteLightPaymasterSetMaxWithdrawDenominator =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "setMaxWithdrawDenominator",
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightPaymasterUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "upgradeToAndCall",
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteLightPaymasterWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "withdraw",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawGasExcess"`
 */
export const useWriteLightPaymasterWithdrawGasExcess =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: "withdrawGasExcess",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useSimulateLightPaymaster =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightPaymasterAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateLightPaymasterAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "acceptOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addSigner"`
 */
export const useSimulateLightPaymasterAddSigner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "addSigner",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointAddStake"`
 */
export const useSimulateLightPaymasterEntryPointAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointAddStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointDeposit"`
 */
export const useSimulateLightPaymasterEntryPointDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointDeposit",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointUnlockStake"`
 */
export const useSimulateLightPaymasterEntryPointUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointUnlockStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdraw"`
 */
export const useSimulateLightPaymasterEntryPointWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointWithdraw",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdrawStake"`
 */
export const useSimulateLightPaymasterEntryPointWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "entryPointWithdrawStake",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightPaymasterInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "initialize",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"ownerWithdraw"`
 */
export const useSimulateLightPaymasterOwnerWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "ownerWithdraw",
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"removeSigner"`
 */
export const useSimulateLightPaymasterRemoveSigner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "removeSigner",
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"setMaxWithdrawDenominator"`
 */
export const useSimulateLightPaymasterSetMaxWithdrawDenominator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "setMaxWithdrawDenominator",
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightPaymasterUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "upgradeToAndCall",
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateLightPaymasterWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "withdraw",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawGasExcess"`
 */
export const useSimulateLightPaymasterWithdrawGasExcess =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: "withdrawGasExcess",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWatchLightPaymasterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightPaymasterAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightPaymasterInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "Initialized",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"MagicSpendWithdrawal"`
 */
export const useWatchLightPaymasterMagicSpendWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "MagicSpendWithdrawal",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"MaxWithdrawDenominatorSet"`
 */
export const useWatchLightPaymasterMaxWithdrawDenominatorSetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "MaxWithdrawDenominatorSet",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const useWatchLightPaymasterOwnershipTransferStartedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "OwnershipTransferStarted",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLightPaymasterOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "OwnershipTransferred",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"SignerAdded"`
 */
export const useWatchLightPaymasterSignerAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "SignerAdded",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"SignerRemoved"`
 */
export const useWatchLightPaymasterSignerRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "SignerRemoved",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightPaymasterUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: "Upgraded",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useReadLightTimelockController =
  /*#__PURE__*/ createUseReadContract({ abi: lightTimelockControllerAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"CANCELLER_ROLE"`
 */
export const useReadLightTimelockControllerCancellerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "CANCELLER_ROLE",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadLightTimelockControllerDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"EXECUTOR_ROLE"`
 */
export const useReadLightTimelockControllerExecutorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "EXECUTOR_ROLE",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"LIGHT_PROTOCOL_CONTROLLER"`
 */
export const useReadLightTimelockControllerLightProtocolController =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "LIGHT_PROTOCOL_CONTROLLER",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"MIN_DELAY"`
 */
export const useReadLightTimelockControllerMinDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "MIN_DELAY",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightTimelockControllerName =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "NAME",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"PROPOSER_ROLE"`
 */
export const useReadLightTimelockControllerProposerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "PROPOSER_ROLE",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadLightTimelockControllerUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "UPGRADE_INTERFACE_VERSION",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightTimelockControllerVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "VERSION",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getMinDelay"`
 */
export const useReadLightTimelockControllerGetMinDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "getMinDelay",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getOperationState"`
 */
export const useReadLightTimelockControllerGetOperationState =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "getOperationState",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadLightTimelockControllerGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "getRoleAdmin",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getTimestamp"`
 */
export const useReadLightTimelockControllerGetTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "getTimestamp",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadLightTimelockControllerHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "hasRole",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"hashOperation"`
 */
export const useReadLightTimelockControllerHashOperation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "hashOperation",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"hashOperationBatch"`
 */
export const useReadLightTimelockControllerHashOperationBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "hashOperationBatch",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperation"`
 */
export const useReadLightTimelockControllerIsOperation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "isOperation",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperationDone"`
 */
export const useReadLightTimelockControllerIsOperationDone =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "isOperationDone",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperationPending"`
 */
export const useReadLightTimelockControllerIsOperationPending =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "isOperationPending",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperationReady"`
 */
export const useReadLightTimelockControllerIsOperationReady =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "isOperationReady",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightTimelockControllerProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "proxiableUUID",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLightTimelockControllerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: "supportsInterface",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useWriteLightTimelockController =
  /*#__PURE__*/ createUseWriteContract({ abi: lightTimelockControllerAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteLightTimelockControllerCancel =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "cancel",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"execute"`
 */
export const useWriteLightTimelockControllerExecute =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "execute",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useWriteLightTimelockControllerExecuteBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "executeBatch",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteLightTimelockControllerGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "grantRole",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightTimelockControllerInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "initialize",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWriteLightTimelockControllerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "onERC1155BatchReceived",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWriteLightTimelockControllerOnErc1155Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "onERC1155Received",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useWriteLightTimelockControllerOnErc721Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "onERC721Received",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteLightTimelockControllerRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "renounceRole",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteLightTimelockControllerRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "revokeRole",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"schedule"`
 */
export const useWriteLightTimelockControllerSchedule =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "schedule",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"scheduleBatch"`
 */
export const useWriteLightTimelockControllerScheduleBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "scheduleBatch",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"updateDelay"`
 */
export const useWriteLightTimelockControllerUpdateDelay =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "updateDelay",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightTimelockControllerUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: "upgradeToAndCall",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useSimulateLightTimelockController =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightTimelockControllerAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateLightTimelockControllerCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "cancel",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateLightTimelockControllerExecute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "execute",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useSimulateLightTimelockControllerExecuteBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "executeBatch",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateLightTimelockControllerGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "grantRole",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightTimelockControllerInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "initialize",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulateLightTimelockControllerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "onERC1155BatchReceived",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulateLightTimelockControllerOnErc1155Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "onERC1155Received",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useSimulateLightTimelockControllerOnErc721Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "onERC721Received",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateLightTimelockControllerRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "renounceRole",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateLightTimelockControllerRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "revokeRole",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"schedule"`
 */
export const useSimulateLightTimelockControllerSchedule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "schedule",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"scheduleBatch"`
 */
export const useSimulateLightTimelockControllerScheduleBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "scheduleBatch",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"updateDelay"`
 */
export const useSimulateLightTimelockControllerUpdateDelay =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "updateDelay",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightTimelockControllerUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: "upgradeToAndCall",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useWatchLightTimelockControllerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"CallExecuted"`
 */
export const useWatchLightTimelockControllerCallExecutedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "CallExecuted",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"CallSalt"`
 */
export const useWatchLightTimelockControllerCallSaltEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "CallSalt",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"CallScheduled"`
 */
export const useWatchLightTimelockControllerCallScheduledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "CallScheduled",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"Cancelled"`
 */
export const useWatchLightTimelockControllerCancelledEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "Cancelled",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightTimelockControllerInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "Initialized",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"MinDelayChange"`
 */
export const useWatchLightTimelockControllerMinDelayChangeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "MinDelayChange",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchLightTimelockControllerRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "RoleAdminChanged",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchLightTimelockControllerRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "RoleGranted",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchLightTimelockControllerRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "RoleRevoked",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightTimelockControllerUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: "Upgraded",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__
 */
export const useReadLightTimelockControllerFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightTimelockControllerFactoryName =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: "NAME",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightTimelockControllerFactoryVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: "VERSION",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"getAddress"`
 */
export const useReadLightTimelockControllerFactoryGetAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: "getAddress",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"timelockImplementation"`
 */
export const useReadLightTimelockControllerFactoryTimelockImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: "timelockImplementation",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__
 */
export const useWriteLightTimelockControllerFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerFactoryAbi,
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"createTimelockController"`
 */
export const useWriteLightTimelockControllerFactoryCreateTimelockController =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: "createTimelockController",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__
 */
export const useSimulateLightTimelockControllerFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerFactoryAbi,
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"createTimelockController"`
 */
export const useSimulateLightTimelockControllerFactoryCreateTimelockController =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: "createTimelockController",
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadLightWalletUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: "UPGRADE_INTERFACE_VERSION",
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
