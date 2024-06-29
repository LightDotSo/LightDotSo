import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lightaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightPaymasterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'entryPoint',
        internalType: 'contract IEntryPoint',
        type: 'address',
      },
      { name: 'verifyingSigner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'unstakeDelaySec', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'addStake',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entryPoint',
    outputs: [
      { name: '', internalType: 'contract IEntryPoint', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'userOp',
        internalType: 'struct UserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          { name: 'callGasLimit', internalType: 'uint256', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
      { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
    ],
    name: 'getHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'parsePaymasterAndData',
    outputs: [
      { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
      { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'mode',
        internalType: 'enum IPaymaster.PostOpMode',
        type: 'uint8',
      },
      { name: 'context', internalType: 'bytes', type: 'bytes' },
      { name: 'actualGasCost', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'postOp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'senderNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unlockStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'userOp',
        internalType: 'struct UserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          { name: 'callGasLimit', internalType: 'uint256', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'userOpHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'maxCost', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'validatePaymasterUserOp',
    outputs: [
      { name: 'context', internalType: 'bytes', type: 'bytes' },
      { name: 'validationData', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'verifyingSigner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'withdrawAddress',
        internalType: 'address payable',
        type: 'address',
      },
    ],
    name: 'withdrawStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'withdrawAddress',
        internalType: 'address payable',
        type: 'address',
      },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LighterifyingPaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightVerifyingPaymasterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'entryPoint',
        internalType: 'contract IEntryPoint',
        type: 'address',
      },
      { name: 'verifyingSigner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'unstakeDelaySec', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'addStake',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entryPoint',
    outputs: [
      { name: '', internalType: 'contract IEntryPoint', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'userOp',
        internalType: 'struct UserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          { name: 'callGasLimit', internalType: 'uint256', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
      { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
    ],
    name: 'getHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'parsePaymasterAndData',
    outputs: [
      { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
      { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
      { name: 'signature', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'mode',
        internalType: 'enum IPaymaster.PostOpMode',
        type: 'uint8',
      },
      { name: 'context', internalType: 'bytes', type: 'bytes' },
      { name: 'actualGasCost', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'postOp',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'senderNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unlockStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'userOp',
        internalType: 'struct UserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          { name: 'callGasLimit', internalType: 'uint256', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'userOpHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'maxCost', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'validatePaymasterUserOp',
    outputs: [
      { name: 'context', internalType: 'bytes', type: 'bytes' },
      { name: 'validationData', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'verifyingSigner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'withdrawAddress',
        internalType: 'address payable',
        type: 'address',
      },
    ],
    name: 'withdrawStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'withdrawAddress',
        internalType: 'address payable',
        type: 'address',
      },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Lightallet
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightWalletAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'anEntryPoint',
        internalType: 'contract IEntryPoint',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'SET_IMAGE_HASH_TYPE_HASH',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entryPoint',
    outputs: [
      { name: '', internalType: 'contract IEntryPoint', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dest', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'func', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'dest', internalType: 'address[]', type: 'address[]' },
      { name: 'value', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'func', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNonce',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'imageHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'imageHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'signatures', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_data', internalType: 'bytes', type: 'bytes' },
      { name: '_signatures', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_digest', internalType: 'bytes32', type: 'bytes32' },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'signatureRecovery',
    outputs: [
      { name: 'threshold', internalType: 'uint256', type: 'uint256' },
      { name: 'weight', internalType: 'uint256', type: 'uint256' },
      { name: 'imageHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'subdigest', internalType: 'bytes32', type: 'bytes32' },
      { name: 'checkpoint', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'tokensReceived',
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: '_imageHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'updateImageHash',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'userOp',
        internalType: 'struct UserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          { name: 'callGasLimit', internalType: 'uint256', type: 'uint256' },
          {
            name: 'verificationGasLimit',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'maxFeePerGas', internalType: 'uint256', type: 'uint256' },
          {
            name: 'maxPriorityFeePerGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'userOpHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'missingAccountFunds', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'validateUserOp',
    outputs: [
      { name: 'validationData', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newImageHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'ImageHashUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'entryPoint',
        internalType: 'contract IEntryPoint',
        type: 'address',
        indexed: true,
      },
      { name: 'hash', internalType: 'bytes32', type: 'bytes32', indexed: true },
    ],
    name: 'LightalletInitialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  { type: 'error', inputs: [], name: 'EmptySignature' },
  { type: 'error', inputs: [], name: 'ImageHashIsZero' },
  {
    type: 'error',
    inputs: [
      { name: 'root', internalType: 'bytes32', type: 'bytes32' },
      { name: 'leaf', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'InvalidMerkleProof',
  },
  {
    type: 'error',
    inputs: [
      { name: '_hash', internalType: 'bytes32', type: 'bytes32' },
      { name: '_addr', internalType: 'address', type: 'address' },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'InvalidNestedSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
      { name: '_s', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'InvalidSValue',
  },
  {
    type: 'error',
    inputs: [{ name: '_flag', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidSignatureFlag',
  },
  {
    type: 'error',
    inputs: [{ name: '_signature', internalType: 'bytes', type: 'bytes' }],
    name: 'InvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: '_type', internalType: 'bytes1', type: 'bytes1' }],
    name: 'InvalidSignatureType',
  },
  {
    type: 'error',
    inputs: [
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
      { name: '_v', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidVValue',
  },
  {
    type: 'error',
    inputs: [
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
      { name: 'threshold', internalType: 'uint256', type: 'uint256' },
      { name: '_weight', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'LowWeightChainedSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: '_sender', internalType: 'address', type: 'address' },
      { name: '_self', internalType: 'address', type: 'address' },
    ],
    name: 'OnlySelfAuth',
  },
  {
    type: 'error',
    inputs: [{ name: '_signature', internalType: 'bytes', type: 'bytes' }],
    name: 'SignerIsAddress0',
  },
  {
    type: 'error',
    inputs: [
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
      { name: '_type', internalType: 'uint256', type: 'uint256' },
      { name: '_recoverMode', internalType: 'bool', type: 'bool' },
    ],
    name: 'UnsupportedSignatureType',
  },
  {
    type: 'error',
    inputs: [
      { name: '_current', internalType: 'uint256', type: 'uint256' },
      { name: '_prev', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'WrongChainedCheckpointOrder',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightalletFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightWalletFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'entryPoint',
        internalType: 'contract IEntryPoint',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'NAME',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accountImplementation',
    outputs: [
      { name: '', internalType: 'contract Lightallet', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'createAccount',
    outputs: [
      { name: 'ret', internalType: 'contract Lightallet', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'error', inputs: [], name: 'EntrypointAddressZero' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useReadLightaymaster = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightaymasterEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPoint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"getDeposit"`
 */
export const useReadLightaymasterGetDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'getDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"getHash"`
 */
export const useReadLightaymasterGetHash = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: 'getHash' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLightaymasterOwner = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"parsePaymasterAndData"`
 */
export const useReadLightaymasterParsePaymasterAndData =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'parsePaymasterAndData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"senderNonce"`
 */
export const useReadLightaymasterSenderNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'senderNonce',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"verifyingSigner"`
 */
export const useReadLightaymasterVerifyingSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'verifyingSigner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWriteLightaymaster = /*#__PURE__*/ createUseWriteContract({
  abi: lightPaymasterAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useWriteLightaymasterAddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteLightaymasterDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useWriteLightaymasterPostOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'postOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteLightaymasterRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteLightaymasterTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteLightaymasterUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useWriteLightaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'validatePaymasterUserOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteLightaymasterWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteLightaymasterWithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useSimulateLightaymaster =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightPaymasterAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateLightaymasterAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateLightaymasterDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useSimulateLightaymasterPostOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'postOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateLightaymasterRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateLightaymasterTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateLightaymasterUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useSimulateLightaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'validatePaymasterUserOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateLightaymasterWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateLightaymasterWithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWatchLightaymasterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightPaymasterAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLightaymasterOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useReadLighterifyingPaymaster =
  /*#__PURE__*/ createUseReadContract({ abi: lightVerifyingPaymasterAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLighterifyingPaymasterEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'entryPoint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"getDeposit"`
 */
export const useReadLighterifyingPaymasterGetDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'getDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"getHash"`
 */
export const useReadLighterifyingPaymasterGetHash =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'getHash',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLighterifyingPaymasterOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'owner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"parsePaymasterAndData"`
 */
export const useReadLighterifyingPaymasterParsePaymasterAndData =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'parsePaymasterAndData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"senderNonce"`
 */
export const useReadLighterifyingPaymasterSenderNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'senderNonce',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"verifyingSigner"`
 */
export const useReadLighterifyingPaymasterVerifyingSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'verifyingSigner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useWriteLighterifyingPaymaster =
  /*#__PURE__*/ createUseWriteContract({ abi: lightVerifyingPaymasterAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useWriteLighterifyingPaymasterAddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteLighterifyingPaymasterDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useWriteLighterifyingPaymasterPostOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'postOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteLighterifyingPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteLighterifyingPaymasterTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteLighterifyingPaymasterUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useWriteLighterifyingPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'validatePaymasterUserOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteLighterifyingPaymasterWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteLighterifyingPaymasterWithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useSimulateLighterifyingPaymaster =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightVerifyingPaymasterAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateLighterifyingPaymasterAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateLighterifyingPaymasterDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useSimulateLighterifyingPaymasterPostOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'postOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateLighterifyingPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateLighterifyingPaymasterTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateLighterifyingPaymasterUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useSimulateLighterifyingPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'validatePaymasterUserOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateLighterifyingPaymasterWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateLighterifyingPaymasterWithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVerifyingPaymasterAbi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__
 */
export const useWatchLighterifyingPaymasterEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightVerifyingPaymasterAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVerifyingPaymasterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLighterifyingPaymasterOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVerifyingPaymasterAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useReadLightallet = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightalletName = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'NAME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"SET_IMAGE_HASH_TYPE_HASH"`
 */
export const useReadLightalletSetImageHashTypeHash =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'SET_IMAGE_HASH_TYPE_HASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightalletVersion = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'VERSION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightalletEntryPoint = /*#__PURE__*/ createUseReadContract(
  { abi: lightWalletAbi, functionName: 'entryPoint' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"getNonce"`
 */
export const useReadLightalletGetNonce = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'getNonce',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"imageHash"`
 */
export const useReadLightalletImageHash = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'imageHash',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"isValidSignature"`
 */
export const useReadLightalletIsValidSignature =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'isValidSignature',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useReadLightalletOnErc1155BatchReceived =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useReadLightalletOnErc1155Received =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadLightalletOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightalletProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"signatureRecovery"`
 */
export const useReadLightalletSignatureRecovery =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'signatureRecovery',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLightalletSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"tokensReceived"`
 */
export const useReadLightalletTokensReceived =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'tokensReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useWriteLightallet = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"execute"`
 */
export const useWriteLightalletExecute = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useWriteLightalletExecuteBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightalletInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"updateImageHash"`
 */
export const useWriteLightalletUpdateImageHash =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'updateImageHash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useWriteLightalletUpgradeTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'upgradeTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightalletUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"validateUserOp"`
 */
export const useWriteLightalletValidateUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'validateUserOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useSimulateLightallet = /*#__PURE__*/ createUseSimulateContract({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateLightalletExecute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'execute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useSimulateLightalletExecuteBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightalletInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"updateImageHash"`
 */
export const useSimulateLightalletUpdateImageHash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'updateImageHash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeTo"`
 */
export const useSimulateLightalletUpgradeTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'upgradeTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightalletUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"validateUserOp"`
 */
export const useSimulateLightalletValidateUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'validateUserOp',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useWatchLightalletEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightWalletAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"AdminChanged"`
 */
export const useWatchLightalletAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'AdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"BeaconUpgraded"`
 */
export const useWatchLightalletBeaconUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'BeaconUpgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"ImageHashUpdated"`
 */
export const useWatchLightalletImageHashUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'ImageHashUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightalletInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"LightalletInitialized"`
 */
export const useWatchLightalletLightalletInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'LightalletInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightalletUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useReadLightalletFactory = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightalletFactoryName =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'NAME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightalletFactoryVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"accountImplementation"`
 */
export const useReadLightalletFactoryAccountImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'accountImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"getAddress"`
 */
export const useReadLightalletFactoryGetAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'getAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useWriteLightalletFactory = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"createAccount"`
 */
export const useWriteLightalletFactoryCreateAccount =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletFactoryAbi,
    functionName: 'createAccount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useSimulateLightalletFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightWalletFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"createAccount"`
 */
export const useSimulateLightalletFactoryCreateAccount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletFactoryAbi,
    functionName: 'createAccount',
  })
