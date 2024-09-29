import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EntryPointv060
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entryPointv060Abi = [
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'SIG_VALIDATION_FAILED',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'initCode', internalType: 'bytes', type: 'bytes' },
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
    ],
    name: '_validateSenderAndPaymaster',
    outputs: [],
    stateMutability: 'view',
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'depositTo',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'deposits',
    outputs: [
      { name: 'deposit', internalType: 'uint112', type: 'uint112' },
      { name: 'staked', internalType: 'bool', type: 'bool' },
      { name: 'stake', internalType: 'uint112', type: 'uint112' },
      { name: 'unstakeDelaySec', internalType: 'uint32', type: 'uint32' },
      { name: 'withdrawTime', internalType: 'uint48', type: 'uint48' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getDepositInfo',
    outputs: [
      {
        name: 'info',
        internalType: 'struct IStakeManager.DepositInfo',
        type: 'tuple',
        components: [
          { name: 'deposit', internalType: 'uint112', type: 'uint112' },
          { name: 'staked', internalType: 'bool', type: 'bool' },
          { name: 'stake', internalType: 'uint112', type: 'uint112' },
          { name: 'unstakeDelaySec', internalType: 'uint32', type: 'uint32' },
          { name: 'withdrawTime', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'key', internalType: 'uint192', type: 'uint192' },
    ],
    name: 'getNonce',
    outputs: [{ name: 'nonce', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'initCode', internalType: 'bytes', type: 'bytes' }],
    name: 'getSenderAddress',
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
    ],
    name: 'getUserOpHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'opsPerAggregator',
        internalType: 'struct IEntryPoint.UserOpsPerAggregator[]',
        type: 'tuple[]',
        components: [
          {
            name: 'userOps',
            internalType: 'struct UserOperation[]',
            type: 'tuple[]',
            components: [
              { name: 'sender', internalType: 'address', type: 'address' },
              { name: 'nonce', internalType: 'uint256', type: 'uint256' },
              { name: 'initCode', internalType: 'bytes', type: 'bytes' },
              { name: 'callData', internalType: 'bytes', type: 'bytes' },
              {
                name: 'callGasLimit',
                internalType: 'uint256',
                type: 'uint256',
              },
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
              {
                name: 'maxFeePerGas',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'maxPriorityFeePerGas',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'paymasterAndData',
                internalType: 'bytes',
                type: 'bytes',
              },
              { name: 'signature', internalType: 'bytes', type: 'bytes' },
            ],
          },
          {
            name: 'aggregator',
            internalType: 'contract IAggregator',
            type: 'address',
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'beneficiary', internalType: 'address payable', type: 'address' },
    ],
    name: 'handleAggregatedOps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'ops',
        internalType: 'struct UserOperation[]',
        type: 'tuple[]',
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
      { name: 'beneficiary', internalType: 'address payable', type: 'address' },
    ],
    name: 'handleOps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'key', internalType: 'uint192', type: 'uint192' }],
    name: 'incrementNonce',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'callData', internalType: 'bytes', type: 'bytes' },
      {
        name: 'opInfo',
        internalType: 'struct EntryPoint.UserOpInfo',
        type: 'tuple',
        components: [
          {
            name: 'mUserOp',
            internalType: 'struct EntryPoint.MemoryUserOp',
            type: 'tuple',
            components: [
              { name: 'sender', internalType: 'address', type: 'address' },
              { name: 'nonce', internalType: 'uint256', type: 'uint256' },
              {
                name: 'callGasLimit',
                internalType: 'uint256',
                type: 'uint256',
              },
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
              { name: 'paymaster', internalType: 'address', type: 'address' },
              {
                name: 'maxFeePerGas',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'maxPriorityFeePerGas',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'userOpHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'prefund', internalType: 'uint256', type: 'uint256' },
          { name: 'contextOffset', internalType: 'uint256', type: 'uint256' },
          { name: 'preOpGas', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'context', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'innerHandleOp',
    outputs: [
      { name: 'actualGasCost', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint192', type: 'uint192' },
    ],
    name: 'nonceSequenceNumber',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'op',
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
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'targetCallData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'simulateHandleOp',
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
    ],
    name: 'simulateValidation',
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
      { name: 'withdrawAmount', internalType: 'uint256', type: 'uint256' },
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
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'factory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'paymaster',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AccountDeployed',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'BeforeExecution' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'totalDeposit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'aggregator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SignatureAggregatorChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'totalStaked',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'unstakeDelaySec',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeLocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeUnlocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'paymaster',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'actualGasCost',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'actualGasUsed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UserOperationEvent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'revertReason',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'UserOperationRevertReason',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdrawn',
  },
  {
    type: 'error',
    inputs: [
      { name: 'preOpGas', internalType: 'uint256', type: 'uint256' },
      { name: 'paid', internalType: 'uint256', type: 'uint256' },
      { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
      { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
      { name: 'targetSuccess', internalType: 'bool', type: 'bool' },
      { name: 'targetResult', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'ExecutionResult',
  },
  {
    type: 'error',
    inputs: [
      { name: 'opIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'FailedOp',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'SenderAddressResult',
  },
  {
    type: 'error',
    inputs: [{ name: 'aggregator', internalType: 'address', type: 'address' }],
    name: 'SignatureValidationFailed',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'returnInfo',
        internalType: 'struct IEntryPoint.ReturnInfo',
        type: 'tuple',
        components: [
          { name: 'preOpGas', internalType: 'uint256', type: 'uint256' },
          { name: 'prefund', internalType: 'uint256', type: 'uint256' },
          { name: 'sigFailed', internalType: 'bool', type: 'bool' },
          { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
          { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
          { name: 'paymasterContext', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'senderInfo',
        internalType: 'struct IStakeManager.StakeInfo',
        type: 'tuple',
        components: [
          { name: 'stake', internalType: 'uint256', type: 'uint256' },
          { name: 'unstakeDelaySec', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'factoryInfo',
        internalType: 'struct IStakeManager.StakeInfo',
        type: 'tuple',
        components: [
          { name: 'stake', internalType: 'uint256', type: 'uint256' },
          { name: 'unstakeDelaySec', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'paymasterInfo',
        internalType: 'struct IStakeManager.StakeInfo',
        type: 'tuple',
        components: [
          { name: 'stake', internalType: 'uint256', type: 'uint256' },
          { name: 'unstakeDelaySec', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    name: 'ValidationResult',
  },
  {
    type: 'error',
    inputs: [
      {
        name: 'returnInfo',
        internalType: 'struct IEntryPoint.ReturnInfo',
        type: 'tuple',
        components: [
          { name: 'preOpGas', internalType: 'uint256', type: 'uint256' },
          { name: 'prefund', internalType: 'uint256', type: 'uint256' },
          { name: 'sigFailed', internalType: 'bool', type: 'bool' },
          { name: 'validAfter', internalType: 'uint48', type: 'uint48' },
          { name: 'validUntil', internalType: 'uint48', type: 'uint48' },
          { name: 'paymasterContext', internalType: 'bytes', type: 'bytes' },
        ],
      },
      {
        name: 'senderInfo',
        internalType: 'struct IStakeManager.StakeInfo',
        type: 'tuple',
        components: [
          { name: 'stake', internalType: 'uint256', type: 'uint256' },
          { name: 'unstakeDelaySec', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'factoryInfo',
        internalType: 'struct IStakeManager.StakeInfo',
        type: 'tuple',
        components: [
          { name: 'stake', internalType: 'uint256', type: 'uint256' },
          { name: 'unstakeDelaySec', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'paymasterInfo',
        internalType: 'struct IStakeManager.StakeInfo',
        type: 'tuple',
        components: [
          { name: 'stake', internalType: 'uint256', type: 'uint256' },
          { name: 'unstakeDelaySec', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: 'aggregatorInfo',
        internalType: 'struct IEntryPoint.AggregatorStakeInfo',
        type: 'tuple',
        components: [
          { name: 'aggregator', internalType: 'address', type: 'address' },
          {
            name: 'stakeInfo',
            internalType: 'struct IStakeManager.StakeInfo',
            type: 'tuple',
            components: [
              { name: 'stake', internalType: 'uint256', type: 'uint256' },
              {
                name: 'unstakeDelaySec',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
        ],
      },
    ],
    name: 'ValidationResultWithAggregation',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EntryPointv070
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const entryPointv070Abi = [
  { type: 'receive', stateMutability: 'payable' },
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
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'delegateAndRevert',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'depositTo',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'deposits',
    outputs: [
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'staked', internalType: 'bool', type: 'bool' },
      { name: 'stake', internalType: 'uint112', type: 'uint112' },
      { name: 'unstakeDelaySec', internalType: 'uint32', type: 'uint32' },
      { name: 'withdrawTime', internalType: 'uint48', type: 'uint48' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'getDepositInfo',
    outputs: [
      {
        name: 'info',
        internalType: 'struct IStakeManager.DepositInfo',
        type: 'tuple',
        components: [
          { name: 'deposit', internalType: 'uint256', type: 'uint256' },
          { name: 'staked', internalType: 'bool', type: 'bool' },
          { name: 'stake', internalType: 'uint112', type: 'uint112' },
          { name: 'unstakeDelaySec', internalType: 'uint32', type: 'uint32' },
          { name: 'withdrawTime', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'key', internalType: 'uint192', type: 'uint192' },
    ],
    name: 'getNonce',
    outputs: [{ name: 'nonce', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'initCode', internalType: 'bytes', type: 'bytes' }],
    name: 'getSenderAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'userOp',
        internalType: 'struct PackedUserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          {
            name: 'accountGasLimits',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'gasFees', internalType: 'bytes32', type: 'bytes32' },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'getUserOpHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'opsPerAggregator',
        internalType: 'struct IEntryPoint.UserOpsPerAggregator[]',
        type: 'tuple[]',
        components: [
          {
            name: 'userOps',
            internalType: 'struct PackedUserOperation[]',
            type: 'tuple[]',
            components: [
              { name: 'sender', internalType: 'address', type: 'address' },
              { name: 'nonce', internalType: 'uint256', type: 'uint256' },
              { name: 'initCode', internalType: 'bytes', type: 'bytes' },
              { name: 'callData', internalType: 'bytes', type: 'bytes' },
              {
                name: 'accountGasLimits',
                internalType: 'bytes32',
                type: 'bytes32',
              },
              {
                name: 'preVerificationGas',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'gasFees', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'paymasterAndData',
                internalType: 'bytes',
                type: 'bytes',
              },
              { name: 'signature', internalType: 'bytes', type: 'bytes' },
            ],
          },
          {
            name: 'aggregator',
            internalType: 'contract IAggregator',
            type: 'address',
          },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'beneficiary', internalType: 'address payable', type: 'address' },
    ],
    name: 'handleAggregatedOps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'ops',
        internalType: 'struct PackedUserOperation[]',
        type: 'tuple[]',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          {
            name: 'accountGasLimits',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'gasFees', internalType: 'bytes32', type: 'bytes32' },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: 'beneficiary', internalType: 'address payable', type: 'address' },
    ],
    name: 'handleOps',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'key', internalType: 'uint192', type: 'uint192' }],
    name: 'incrementNonce',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'callData', internalType: 'bytes', type: 'bytes' },
      {
        name: 'opInfo',
        internalType: 'struct EntryPoint.UserOpInfo',
        type: 'tuple',
        components: [
          {
            name: 'mUserOp',
            internalType: 'struct EntryPoint.MemoryUserOp',
            type: 'tuple',
            components: [
              { name: 'sender', internalType: 'address', type: 'address' },
              { name: 'nonce', internalType: 'uint256', type: 'uint256' },
              {
                name: 'verificationGasLimit',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'callGasLimit',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'paymasterVerificationGasLimit',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'paymasterPostOpGasLimit',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'preVerificationGas',
                internalType: 'uint256',
                type: 'uint256',
              },
              { name: 'paymaster', internalType: 'address', type: 'address' },
              {
                name: 'maxFeePerGas',
                internalType: 'uint256',
                type: 'uint256',
              },
              {
                name: 'maxPriorityFeePerGas',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
          { name: 'userOpHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'prefund', internalType: 'uint256', type: 'uint256' },
          { name: 'contextOffset', internalType: 'uint256', type: 'uint256' },
          { name: 'preOpGas', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: 'context', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'innerHandleOp',
    outputs: [
      { name: 'actualGasCost', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint192', type: 'uint192' },
    ],
    name: 'nonceSequenceNumber',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
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
      { name: 'withdrawAmount', internalType: 'uint256', type: 'uint256' },
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
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'factory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'paymaster',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AccountDeployed',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'BeforeExecution' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'totalDeposit',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposited',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'revertReason',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'PostOpRevertReason',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'aggregator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'SignatureAggregatorChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'totalStaked',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'unstakeDelaySec',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeLocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeUnlocked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StakeWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'paymaster',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'actualGasCost',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'actualGasUsed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UserOperationEvent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'UserOperationPrefundTooLow',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'userOpHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'revertReason',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
    ],
    name: 'UserOperationRevertReason',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'withdrawAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdrawn',
  },
  {
    type: 'error',
    inputs: [
      { name: 'success', internalType: 'bool', type: 'bool' },
      { name: 'ret', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'DelegateAndRevert',
  },
  {
    type: 'error',
    inputs: [
      { name: 'opIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
    ],
    name: 'FailedOp',
  },
  {
    type: 'error',
    inputs: [
      { name: 'opIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'reason', internalType: 'string', type: 'string' },
      { name: 'inner', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'FailedOpWithRevert',
  },
  {
    type: 'error',
    inputs: [{ name: 'returnData', internalType: 'bytes', type: 'bytes' }],
    name: 'PostOpReverted',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'SenderAddressResult',
  },
  {
    type: 'error',
    inputs: [{ name: 'aggregator', internalType: 'address', type: 'address' }],
    name: 'SignatureValidationFailed',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightDAG
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightDagAbi = [
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
    inputs: [
      {
        name: 'operationRoot',
        internalType: 'struct LightDAG.OperationRoot',
        type: 'tuple',
        components: [
          { name: 'root', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'operations',
            internalType: 'struct LightDAG.Operation[]',
            type: 'tuple[]',
            components: [
              { name: 'hash', internalType: 'bytes32', type: 'bytes32' },
              {
                name: 'conditionData',
                internalType: 'bytes[]',
                type: 'bytes[]',
              },
              {
                name: 'dependencies',
                internalType: 'bytes32[]',
                type: 'bytes32[]',
              },
              {
                name: 'fallbackOperation',
                internalType: 'bytes32',
                type: 'bytes32',
              },
            ],
          },
        ],
      },
    ],
    name: 'callOperationRoot',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'operation',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'conditionData',
        internalType: 'bytes[]',
        type: 'bytes[]',
        indexed: false,
      },
      {
        name: 'dependencies',
        internalType: 'bytes32[]',
        type: 'bytes32[]',
        indexed: false,
      },
      {
        name: 'fallbackOperation',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'OperationCalled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'root', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'caller',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OperationRootCalled',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightPaymaster
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightPaymasterAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'entryPoint', internalType: 'address', type: 'address' }],
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
    name: 'UPGRADE_INTERFACE_VERSION',
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
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'signer_', internalType: 'address', type: 'address' }],
    name: 'addSigner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entryPoint',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'unstakeDelaySeconds', internalType: 'uint32', type: 'uint32' },
    ],
    name: 'entryPointAddStake',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'entryPointDeposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'entryPointUnlockStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address payable', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'entryPointWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address payable', type: 'address' }],
    name: 'entryPointWithdrawStake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      {
        name: 'withdrawRequest',
        internalType: 'struct MagicSpend.WithdrawRequest',
        type: 'tuple',
        components: [
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'asset', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'expiry', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'getHash',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner_', internalType: 'address', type: 'address' },
      {
        name: 'maxWithdrawDenominator_',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'signer_', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'signer', internalType: 'address', type: 'address' }],
    name: 'isSigner',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      {
        name: 'withdrawRequest',
        internalType: 'struct MagicSpend.WithdrawRequest',
        type: 'tuple',
        components: [
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'asset', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'expiry', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'isValidWithdrawSignature',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxWithdrawDenominator',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'nonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'nonceUsed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
      { name: 'asset', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ownerWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'postOp',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [{ name: 'signer_', internalType: 'address', type: 'address' }],
    name: 'removeSigner',
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
    inputs: [
      { name: 'newDenominator', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setMaxWithdrawDenominator',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'struct PackedUserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          {
            name: 'accountGasLimits',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'gasFees', internalType: 'bytes32', type: 'bytes32' },
          { name: 'paymasterAndData', internalType: 'bytes', type: 'bytes' },
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
        ],
      },
      { name: '', internalType: 'bytes32', type: 'bytes32' },
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
    inputs: [
      {
        name: 'withdrawRequest',
        internalType: 'struct MagicSpend.WithdrawRequest',
        type: 'tuple',
        components: [
          { name: 'signature', internalType: 'bytes', type: 'bytes' },
          { name: 'asset', internalType: 'address', type: 'address' },
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'expiry', internalType: 'uint48', type: 'uint48' },
        ],
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawGasExcess',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'asset',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'nonce',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MagicSpendWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newDenominator',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MaxWithdrawDenominatorSet',
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
    name: 'OwnershipTransferStarted',
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
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'signer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'isValid', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'SignerSet',
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
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'Expired' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  {
    type: 'error',
    inputs: [{ name: 'nonce', internalType: 'uint256', type: 'uint256' }],
    name: 'InvalidNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidSignature' },
  { type: 'error', inputs: [], name: 'NoExcess' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'maxCost', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'RequestLessThanGasMaxCost',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'Unauthorized' },
  { type: 'error', inputs: [], name: 'UnexpectedPostOpRevertedMode' },
  {
    type: 'error',
    inputs: [{ name: 'asset', internalType: 'address', type: 'address' }],
    name: 'UnsupportedPaymasterAsset',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requestedAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'maxAllowed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'WithdrawTooLarge',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightTimelockController
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightTimelockControllerAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'CANCELLER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'EXECUTOR_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LIGHT_PROTOCOL_CONTROLLER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MIN_DELAY',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
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
    name: 'PROPOSER_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
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
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'payload', internalType: 'bytes', type: 'bytes' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'executeBatch',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinDelay',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getOperationState',
    outputs: [
      {
        name: '',
        internalType: 'enum TimelockControllerUpgradeable.OperationState',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getTimestamp',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'hashOperation',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'hashOperationBatch',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'wallet', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperation',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperationDone',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperationPending',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'isOperationReady',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
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
    stateMutability: 'nonpayable',
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
    stateMutability: 'nonpayable',
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
    stateMutability: 'nonpayable',
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
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'target', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'schedule',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'targets', internalType: 'address[]', type: 'address[]' },
      { name: 'values', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'payloads', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'predecessor', internalType: 'bytes32', type: 'bytes32' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'scheduleBatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newDelay', internalType: 'uint256', type: 'uint256' }],
    name: 'updateDelay',
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
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'target',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'CallExecuted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'salt',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
    ],
    name: 'CallSalt',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'index',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'target',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
      {
        name: 'predecessor',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: false,
      },
      {
        name: 'delay',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CallScheduled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
    ],
    name: 'Cancelled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newDuration',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinDelayChange',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
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
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [
      { name: 'delay', internalType: 'uint256', type: 'uint256' },
      { name: 'minDelay', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TimelockInsufficientDelay',
  },
  {
    type: 'error',
    inputs: [
      { name: 'targets', internalType: 'uint256', type: 'uint256' },
      { name: 'payloads', internalType: 'uint256', type: 'uint256' },
      { name: 'values', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'TimelockInvalidOperationLength',
  },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'TimelockUnauthorizedCaller',
  },
  {
    type: 'error',
    inputs: [
      { name: 'predecessorId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'TimelockUnexecutedPredecessor',
  },
  {
    type: 'error',
    inputs: [
      { name: 'operationId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'expectedStates', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'TimelockUnexpectedOperationState',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightTimelockControllerFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightTimelockControllerFactoryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
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
    inputs: [
      { name: 'wallet', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'createTimelockController',
    outputs: [
      {
        name: 'ret',
        internalType: 'contract LightTimelockController',
        type: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'wallet', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'getAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'timelockImplementation',
    outputs: [
      {
        name: '',
        internalType: 'contract LightTimelockController',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  { type: 'error', inputs: [], name: 'WalletAddressZero' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightVault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightVaultAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
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
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'asset',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'claimDeposit',
    outputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'claimRedeem',
    outputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'claimableDepositBalanceInAsset',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'claimableDepositRequest',
    outputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'claimableRedeemRequest',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimableSilo',
    outputs: [{ name: '', internalType: 'contract Silo', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'close',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: '_epochId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'convertToAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'convertToShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: '_epochId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'convertToShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'decreaseDepositRequest',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'decreaseRedeemRequest',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'deposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      {
        name: 'permitParams',
        internalType: 'struct PermitParams',
        type: 'tuple',
        components: [
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'v', internalType: 'uint8', type: 'uint8' },
          { name: 'r', internalType: 'bytes32', type: 'bytes32' },
          { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'depositWithPermit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      { name: 'fields', internalType: 'bytes1', type: 'bytes1' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'version', internalType: 'string', type: 'string' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
      { name: 'verifyingContract', internalType: 'address', type: 'address' },
      { name: 'salt', internalType: 'bytes32', type: 'bytes32' },
      { name: 'extensions', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'epochId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    name: 'epochs',
    outputs: [
      { name: 'totalSupplySnapshot', internalType: 'uint256', type: 'uint256' },
      { name: 'totalAssetsSnapshot', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feesInBps',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'fees', internalType: 'uint16', type: 'uint16' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'underlying', internalType: 'contract IERC20', type: 'address' },
      { name: 'bootstrapAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'fees', internalType: 'uint16', type: 'uint16' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
      { name: 'underlying', internalType: 'contract IERC20', type: 'address' },
      { name: 'bootstrapAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'lastDepositRequestId',
    outputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'lastRedeemRequestId',
    outputs: [{ name: 'epochId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'lastSavedBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxDepositRequest',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'maxMint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxRedeemRequest',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'maxWithdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
    ],
    name: 'mint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assetReturned', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'open',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'pendingDepositRequest',
    outputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingOwner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'pendingRedeemRequest',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pendingSilo',
    outputs: [{ name: '', internalType: 'contract Silo', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'previewClaimDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'previewClaimRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'previewDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'previewMint',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'shares', internalType: 'uint256', type: 'uint256' }],
    name: 'previewRedeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newSavedBalance', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'previewSettle',
    outputs: [
      { name: 'assetsToOwner', internalType: 'uint256', type: 'uint256' },
      { name: 'assetsToVault', internalType: 'uint256', type: 'uint256' },
      {
        name: 'expectedAssetFromOwner',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'settleValues',
        internalType: 'struct SettleValues',
        type: 'tuple',
        components: [
          {
            name: 'lastSavedBalance',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'fees', internalType: 'uint256', type: 'uint256' },
          { name: 'pendingRedeem', internalType: 'uint256', type: 'uint256' },
          { name: 'sharesToMint', internalType: 'uint256', type: 'uint256' },
          { name: 'pendingDeposit', internalType: 'uint256', type: 'uint256' },
          {
            name: 'assetsToWithdraw',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'totalAssetsSnapshot',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'totalSupplySnapshot',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'assets', internalType: 'uint256', type: 'uint256' }],
    name: 'previewWithdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'redeem',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'requestDeposit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
      {
        name: 'permitParams',
        internalType: 'struct PermitParams',
        type: 'tuple',
        components: [
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'deadline', internalType: 'uint256', type: 'uint256' },
          { name: 'v', internalType: 'uint8', type: 'uint8' },
          { name: 'r', internalType: 'bytes32', type: 'bytes32' },
          { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
      },
    ],
    name: 'requestDepositWithPermit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'requestRedeem',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFee', internalType: 'uint16', type: 'uint16' }],
    name: 'setFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newMaxDrawdown', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'setMaxDrawdown',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_treasury', internalType: 'address', type: 'address' }],
    name: 'setTreasury',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newSavedBalance', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'settle',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'sharesBalanceInAsset',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
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
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalClaimableAssets',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalClaimableShares',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalPendingDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalPendingRedeems',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
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
    name: 'treasury',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vaultIsOpen',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'withdraw',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ClaimDeposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ClaimRedeem',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'previousRequestedAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newRequestedAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DecreaseDepositRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'previousRequestedShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'newRequestedShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DecreaseRedeemRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'DepositRequest',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'EIP712DomainChanged' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'lastSavedBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'returnedAssets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'fees',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EpochEnd',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'timestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'lastSavedBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'totalShares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EpochStart',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFees',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'newFees',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
    ],
    name: 'FeesChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
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
    name: 'OwnershipTransferStarted',
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
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RedeemRequest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'receiver',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'assets',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Withdraw',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'ECDSAInvalidSignature' },
  {
    type: 'error',
    inputs: [{ name: 'length', internalType: 'uint256', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
  },
  {
    type: 'error',
    inputs: [{ name: 's', internalType: 'bytes32', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
  },
  {
    type: 'error',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'allowance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientAllowance',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC20InsufficientBalance',
  },
  {
    type: 'error',
    inputs: [{ name: 'approver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidApprover',
  },
  {
    type: 'error',
    inputs: [{ name: 'receiver', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidReceiver',
  },
  {
    type: 'error',
    inputs: [{ name: 'sender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSender',
  },
  {
    type: 'error',
    inputs: [{ name: 'spender', internalType: 'address', type: 'address' }],
    name: 'ERC20InvalidSpender',
  },
  {
    type: 'error',
    inputs: [{ name: 'deadline', internalType: 'uint256', type: 'uint256' }],
    name: 'ERC2612ExpiredSignature',
  },
  {
    type: 'error',
    inputs: [
      { name: 'signer', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
    ],
    name: 'ERC2612InvalidSigner',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxDeposit',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxMint',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxRedeem',
  },
  {
    type: 'error',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'max', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ERC4626ExceededMaxWithdraw',
  },
  { type: 'error', inputs: [], name: 'ERC7540CantRequestDepositOnBehalfOf' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'assets', internalType: 'uint256', type: 'uint256' },
      { name: 'maxDeposit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ExceededMaxDepositRequest',
  },
  {
    type: 'error',
    inputs: [
      { name: 'receiver', internalType: 'address', type: 'address' },
      { name: 'shares', internalType: 'uint256', type: 'uint256' },
      { name: 'maxShares', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'ExceededMaxRedeemRequest',
  },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'FeesTooHigh' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'currentNonce', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InvalidAccountNonce',
  },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidTreasury' },
  { type: 'error', inputs: [], name: 'MathOverflowedMulDiv' },
  { type: 'error', inputs: [], name: 'MaxDrawdownReached' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'NoClaimAvailable',
  },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'PermitFailed' },
  { type: 'error', inputs: [], name: 'ReceiverFailed' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'VaultIsClosed' },
  { type: 'error', inputs: [], name: 'VaultIsEmpty' },
  { type: 'error', inputs: [], name: 'VaultIsOpen' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightVaultFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const lightVaultFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_fees', internalType: 'uint16', type: 'uint16' },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_treasury', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LIGHT_PROTOCOL_FEES',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LIGHT_PROTOCOL_OWNER',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LIGHT_PROTOCOL_TREASURY',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
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
    inputs: [
      { name: 'underlying', internalType: 'address', type: 'address' },
      { name: 'bootstrapAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
    ],
    name: 'createVault',
    outputs: [
      { name: 'ret', internalType: 'contract LightVault', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'underlying', internalType: 'contract IERC20', type: 'address' },
      { name: 'bootstrapAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'name', internalType: 'string', type: 'string' },
      { name: 'symbol', internalType: 'string', type: 'string' },
    ],
    name: 'getAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'vaultImplementation',
    outputs: [
      { name: '', internalType: 'contract LightVault', type: 'address' },
    ],
    stateMutability: 'view',
  },
  { type: 'error', inputs: [], name: 'Create2EmptyBytecode' },
  { type: 'error', inputs: [], name: 'Create2FailedDeployment' },
  {
    type: 'error',
    inputs: [
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'needed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'Create2InsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'TokenAddressZero' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LightWallet
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
    name: 'UPGRADE_INTERFACE_VERSION',
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
    inputs: [{ name: '_imageHash', internalType: 'bytes32', type: 'bytes32' }],
    name: 'updateImageHash',
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
        internalType: 'struct PackedUserOperation',
        type: 'tuple',
        components: [
          { name: 'sender', internalType: 'address', type: 'address' },
          { name: 'nonce', internalType: 'uint256', type: 'uint256' },
          { name: 'initCode', internalType: 'bytes', type: 'bytes' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
          {
            name: 'accountGasLimits',
            internalType: 'bytes32',
            type: 'bytes32',
          },
          {
            name: 'preVerificationGas',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'gasFees', internalType: 'bytes32', type: 'bytes32' },
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
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
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
    name: 'LightWalletInitialized',
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
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EmptySignature' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'ImageHashIsZero' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
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
  { type: 'error', inputs: [], name: 'NotInitializing' },
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
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
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
// LightWalletFactory
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
      { name: '', internalType: 'contract LightWallet', type: 'address' },
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
      { name: 'ret', internalType: 'contract LightWallet', type: 'address' },
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__
 */
export const useReadEntryPointv060 = /*#__PURE__*/ createUseReadContract({
  abi: entryPointv060Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"SIG_VALIDATION_FAILED"`
 */
export const useReadEntryPointv060SigValidationFailed =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'SIG_VALIDATION_FAILED',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"_validateSenderAndPaymaster"`
 */
export const useReadEntryPointv060ValidateSenderAndPaymaster =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: '_validateSenderAndPaymaster',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadEntryPointv060BalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"deposits"`
 */
export const useReadEntryPointv060Deposits =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'deposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"getDepositInfo"`
 */
export const useReadEntryPointv060GetDepositInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'getDepositInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"getNonce"`
 */
export const useReadEntryPointv060GetNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'getNonce',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"getUserOpHash"`
 */
export const useReadEntryPointv060GetUserOpHash =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'getUserOpHash',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"nonceSequenceNumber"`
 */
export const useReadEntryPointv060NonceSequenceNumber =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv060Abi,
    functionName: 'nonceSequenceNumber',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__
 */
export const useWriteEntryPointv060 = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointv060Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"addStake"`
 */
export const useWriteEntryPointv060AddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"depositTo"`
 */
export const useWriteEntryPointv060DepositTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'depositTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"getSenderAddress"`
 */
export const useWriteEntryPointv060GetSenderAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'getSenderAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"handleAggregatedOps"`
 */
export const useWriteEntryPointv060HandleAggregatedOps =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'handleAggregatedOps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"handleOps"`
 */
export const useWriteEntryPointv060HandleOps =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'handleOps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"incrementNonce"`
 */
export const useWriteEntryPointv060IncrementNonce =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'incrementNonce',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"innerHandleOp"`
 */
export const useWriteEntryPointv060InnerHandleOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'innerHandleOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"simulateHandleOp"`
 */
export const useWriteEntryPointv060SimulateHandleOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'simulateHandleOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"simulateValidation"`
 */
export const useWriteEntryPointv060SimulateValidation =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'simulateValidation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteEntryPointv060UnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteEntryPointv060WithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteEntryPointv060WithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv060Abi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__
 */
export const useSimulateEntryPointv060 =
  /*#__PURE__*/ createUseSimulateContract({ abi: entryPointv060Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateEntryPointv060AddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"depositTo"`
 */
export const useSimulateEntryPointv060DepositTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'depositTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"getSenderAddress"`
 */
export const useSimulateEntryPointv060GetSenderAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'getSenderAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"handleAggregatedOps"`
 */
export const useSimulateEntryPointv060HandleAggregatedOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'handleAggregatedOps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"handleOps"`
 */
export const useSimulateEntryPointv060HandleOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'handleOps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"incrementNonce"`
 */
export const useSimulateEntryPointv060IncrementNonce =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'incrementNonce',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"innerHandleOp"`
 */
export const useSimulateEntryPointv060InnerHandleOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'innerHandleOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"simulateHandleOp"`
 */
export const useSimulateEntryPointv060SimulateHandleOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'simulateHandleOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"simulateValidation"`
 */
export const useSimulateEntryPointv060SimulateValidation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'simulateValidation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateEntryPointv060UnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateEntryPointv060WithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv060Abi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateEntryPointv060WithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv060Abi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__
 */
export const useWatchEntryPointv060 = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: entryPointv060Abi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"AccountDeployed"`
 */
export const useWatchEntryPointv060AccountDeployed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'AccountDeployed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"BeforeExecution"`
 */
export const useWatchEntryPointv060BeforeExecution =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'BeforeExecution',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchEntryPointv060Deposited =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'Deposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"SignatureAggregatorChanged"`
 */
export const useWatchEntryPointv060SignatureAggregatorChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'SignatureAggregatorChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"StakeLocked"`
 */
export const useWatchEntryPointv060StakeLocked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'StakeLocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"StakeUnlocked"`
 */
export const useWatchEntryPointv060StakeUnlocked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'StakeUnlocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"StakeWithdrawn"`
 */
export const useWatchEntryPointv060StakeWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'StakeWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"UserOperationEvent"`
 */
export const useWatchEntryPointv060UserOperationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'UserOperationEvent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"UserOperationRevertReason"`
 */
export const useWatchEntryPointv060UserOperationRevertReason =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'UserOperationRevertReason',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv060Abi}__ and `eventName` set to `"Withdrawn"`
 */
export const useWatchEntryPointv060Withdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv060Abi,
    eventName: 'Withdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__
 */
export const useReadEntryPointv070 = /*#__PURE__*/ createUseReadContract({
  abi: entryPointv070Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadEntryPointv070BalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"deposits"`
 */
export const useReadEntryPointv070Deposits =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'deposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"getDepositInfo"`
 */
export const useReadEntryPointv070GetDepositInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'getDepositInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"getNonce"`
 */
export const useReadEntryPointv070GetNonce =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'getNonce',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"getUserOpHash"`
 */
export const useReadEntryPointv070GetUserOpHash =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'getUserOpHash',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"nonceSequenceNumber"`
 */
export const useReadEntryPointv070NonceSequenceNumber =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'nonceSequenceNumber',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadEntryPointv070SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: entryPointv070Abi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__
 */
export const useWriteEntryPointv070 = /*#__PURE__*/ createUseWriteContract({
  abi: entryPointv070Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"addStake"`
 */
export const useWriteEntryPointv070AddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"delegateAndRevert"`
 */
export const useWriteEntryPointv070DelegateAndRevert =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'delegateAndRevert',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"depositTo"`
 */
export const useWriteEntryPointv070DepositTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'depositTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"getSenderAddress"`
 */
export const useWriteEntryPointv070GetSenderAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'getSenderAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"handleAggregatedOps"`
 */
export const useWriteEntryPointv070HandleAggregatedOps =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'handleAggregatedOps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"handleOps"`
 */
export const useWriteEntryPointv070HandleOps =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'handleOps',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"incrementNonce"`
 */
export const useWriteEntryPointv070IncrementNonce =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'incrementNonce',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"innerHandleOp"`
 */
export const useWriteEntryPointv070InnerHandleOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'innerHandleOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"unlockStake"`
 */
export const useWriteEntryPointv070UnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"withdrawStake"`
 */
export const useWriteEntryPointv070WithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"withdrawTo"`
 */
export const useWriteEntryPointv070WithdrawTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: entryPointv070Abi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__
 */
export const useSimulateEntryPointv070 =
  /*#__PURE__*/ createUseSimulateContract({ abi: entryPointv070Abi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"addStake"`
 */
export const useSimulateEntryPointv070AddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'addStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"delegateAndRevert"`
 */
export const useSimulateEntryPointv070DelegateAndRevert =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'delegateAndRevert',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"depositTo"`
 */
export const useSimulateEntryPointv070DepositTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'depositTo',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"getSenderAddress"`
 */
export const useSimulateEntryPointv070GetSenderAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'getSenderAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"handleAggregatedOps"`
 */
export const useSimulateEntryPointv070HandleAggregatedOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'handleAggregatedOps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"handleOps"`
 */
export const useSimulateEntryPointv070HandleOps =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'handleOps',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"incrementNonce"`
 */
export const useSimulateEntryPointv070IncrementNonce =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'incrementNonce',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"innerHandleOp"`
 */
export const useSimulateEntryPointv070InnerHandleOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'innerHandleOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"unlockStake"`
 */
export const useSimulateEntryPointv070UnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'unlockStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"withdrawStake"`
 */
export const useSimulateEntryPointv070WithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'withdrawStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link entryPointv070Abi}__ and `functionName` set to `"withdrawTo"`
 */
export const useSimulateEntryPointv070WithdrawTo =
  /*#__PURE__*/ createUseSimulateContract({
    abi: entryPointv070Abi,
    functionName: 'withdrawTo',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__
 */
export const useWatchEntryPointv070 = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: entryPointv070Abi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"AccountDeployed"`
 */
export const useWatchEntryPointv070AccountDeployed =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'AccountDeployed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"BeforeExecution"`
 */
export const useWatchEntryPointv070BeforeExecution =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'BeforeExecution',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"Deposited"`
 */
export const useWatchEntryPointv070Deposited =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'Deposited',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"PostOpRevertReason"`
 */
export const useWatchEntryPointv070PostOpRevertReason =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'PostOpRevertReason',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"SignatureAggregatorChanged"`
 */
export const useWatchEntryPointv070SignatureAggregatorChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'SignatureAggregatorChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"StakeLocked"`
 */
export const useWatchEntryPointv070StakeLocked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'StakeLocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"StakeUnlocked"`
 */
export const useWatchEntryPointv070StakeUnlocked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'StakeUnlocked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"StakeWithdrawn"`
 */
export const useWatchEntryPointv070StakeWithdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'StakeWithdrawn',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"UserOperationEvent"`
 */
export const useWatchEntryPointv070UserOperationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'UserOperationEvent',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"UserOperationPrefundTooLow"`
 */
export const useWatchEntryPointv070UserOperationPrefundTooLow =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'UserOperationPrefundTooLow',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"UserOperationRevertReason"`
 */
export const useWatchEntryPointv070UserOperationRevertReason =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'UserOperationRevertReason',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link entryPointv070Abi}__ and `eventName` set to `"Withdrawn"`
 */
export const useWatchEntryPointv070Withdrawn =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: entryPointv070Abi,
    eventName: 'Withdrawn',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useReadLightDag = /*#__PURE__*/ createUseReadContract({
  abi: lightDagAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightDagNAME = /*#__PURE__*/ createUseReadContract({
  abi: lightDagAbi,
  functionName: 'NAME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightDagVERSION = /*#__PURE__*/ createUseReadContract({
  abi: lightDagAbi,
  functionName: 'VERSION',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useWriteLightDag = /*#__PURE__*/ createUseWriteContract({
  abi: lightDagAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"callOperationRoot"`
 */
export const useWriteLightDagCallOperationRoot =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightDagAbi,
    functionName: 'callOperationRoot',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useSimulateLightDag = /*#__PURE__*/ createUseSimulateContract({
  abi: lightDagAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightDagAbi}__ and `functionName` set to `"callOperationRoot"`
 */
export const useSimulateLightDagCallOperationRoot =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightDagAbi,
    functionName: 'callOperationRoot',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightDagAbi}__
 */
export const useWatchLightDag = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lightDagAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightDagAbi}__ and `eventName` set to `"OperationCalled"`
 */
export const useWatchLightDagOperationCalled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightDagAbi,
    eventName: 'OperationCalled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightDagAbi}__ and `eventName` set to `"OperationRootCalled"`
 */
export const useWatchLightDagOperationRootCalled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightDagAbi,
    eventName: 'OperationRootCalled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useReadLightPaymaster = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightPaymasterNAME = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
  functionName: 'NAME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadLightPaymasterUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightPaymasterVERSION = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: 'VERSION' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightPaymasterEntryPoint =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPoint',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"getHash"`
 */
export const useReadLightPaymasterGetHash = /*#__PURE__*/ createUseReadContract(
  { abi: lightPaymasterAbi, functionName: 'getHash' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"isSigner"`
 */
export const useReadLightPaymasterIsSigner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'isSigner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"isValidWithdrawSignature"`
 */
export const useReadLightPaymasterIsValidWithdrawSignature =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'isValidWithdrawSignature',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"maxWithdrawDenominator"`
 */
export const useReadLightPaymasterMaxWithdrawDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'maxWithdrawDenominator',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"nonceUsed"`
 */
export const useReadLightPaymasterNonceUsed =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'nonceUsed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLightPaymasterOwner = /*#__PURE__*/ createUseReadContract({
  abi: lightPaymasterAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadLightPaymasterPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightPaymasterProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightPaymasterAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWriteLightPaymaster = /*#__PURE__*/ createUseWriteContract({
  abi: lightPaymasterAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteLightPaymasterAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addSigner"`
 */
export const useWriteLightPaymasterAddSigner =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'addSigner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointAddStake"`
 */
export const useWriteLightPaymasterEntryPointAddStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointAddStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointDeposit"`
 */
export const useWriteLightPaymasterEntryPointDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointUnlockStake"`
 */
export const useWriteLightPaymasterEntryPointUnlockStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointUnlockStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdraw"`
 */
export const useWriteLightPaymasterEntryPointWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointWithdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdrawStake"`
 */
export const useWriteLightPaymasterEntryPointWithdrawStake =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointWithdrawStake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightPaymasterInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"ownerWithdraw"`
 */
export const useWriteLightPaymasterOwnerWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'ownerWithdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useWriteLightPaymasterPostOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'postOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"removeSigner"`
 */
export const useWriteLightPaymasterRemoveSigner =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'removeSigner',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteLightPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"setMaxWithdrawDenominator"`
 */
export const useWriteLightPaymasterSetMaxWithdrawDenominator =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'setMaxWithdrawDenominator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteLightPaymasterTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightPaymasterUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useWriteLightPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'validatePaymasterUserOp',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteLightPaymasterWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawGasExcess"`
 */
export const useWriteLightPaymasterWithdrawGasExcess =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightPaymasterAbi,
    functionName: 'withdrawGasExcess',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useSimulateLightPaymaster =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightPaymasterAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateLightPaymasterAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"addSigner"`
 */
export const useSimulateLightPaymasterAddSigner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'addSigner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointAddStake"`
 */
export const useSimulateLightPaymasterEntryPointAddStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointAddStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointDeposit"`
 */
export const useSimulateLightPaymasterEntryPointDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointUnlockStake"`
 */
export const useSimulateLightPaymasterEntryPointUnlockStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointUnlockStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdraw"`
 */
export const useSimulateLightPaymasterEntryPointWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointWithdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"entryPointWithdrawStake"`
 */
export const useSimulateLightPaymasterEntryPointWithdrawStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'entryPointWithdrawStake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightPaymasterInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"ownerWithdraw"`
 */
export const useSimulateLightPaymasterOwnerWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'ownerWithdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"postOp"`
 */
export const useSimulateLightPaymasterPostOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'postOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"removeSigner"`
 */
export const useSimulateLightPaymasterRemoveSigner =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'removeSigner',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateLightPaymasterRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"setMaxWithdrawDenominator"`
 */
export const useSimulateLightPaymasterSetMaxWithdrawDenominator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'setMaxWithdrawDenominator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateLightPaymasterTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightPaymasterUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"validatePaymasterUserOp"`
 */
export const useSimulateLightPaymasterValidatePaymasterUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'validatePaymasterUserOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateLightPaymasterWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightPaymasterAbi}__ and `functionName` set to `"withdrawGasExcess"`
 */
export const useSimulateLightPaymasterWithdrawGasExcess =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightPaymasterAbi,
    functionName: 'withdrawGasExcess',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__
 */
export const useWatchLightPaymaster = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: lightPaymasterAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightPaymasterInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"MagicSpendWithdrawal"`
 */
export const useWatchLightPaymasterMagicSpendWithdrawal =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'MagicSpendWithdrawal',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"MaxWithdrawDenominatorSet"`
 */
export const useWatchLightPaymasterMaxWithdrawDenominatorSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'MaxWithdrawDenominatorSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const useWatchLightPaymasterOwnershipTransferStarted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLightPaymasterOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"SignerSet"`
 */
export const useWatchLightPaymasterSignerSet =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'SignerSet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightPaymasterAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightPaymasterUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightPaymasterAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useReadLightTimelockController =
  /*#__PURE__*/ createUseReadContract({ abi: lightTimelockControllerAbi })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"CANCELLER_ROLE"`
 */
export const useReadLightTimelockControllerCancellerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'CANCELLER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadLightTimelockControllerDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"EXECUTOR_ROLE"`
 */
export const useReadLightTimelockControllerExecutorRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'EXECUTOR_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"LIGHT_PROTOCOL_CONTROLLER"`
 */
export const useReadLightTimelockControllerLightProtocolController =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'LIGHT_PROTOCOL_CONTROLLER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"MIN_DELAY"`
 */
export const useReadLightTimelockControllerMinDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'MIN_DELAY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightTimelockControllerNAME =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'NAME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"PROPOSER_ROLE"`
 */
export const useReadLightTimelockControllerProposerRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'PROPOSER_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadLightTimelockControllerUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightTimelockControllerVERSION =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getMinDelay"`
 */
export const useReadLightTimelockControllerGetMinDelay =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'getMinDelay',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getOperationState"`
 */
export const useReadLightTimelockControllerGetOperationState =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'getOperationState',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadLightTimelockControllerGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"getTimestamp"`
 */
export const useReadLightTimelockControllerGetTimestamp =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'getTimestamp',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadLightTimelockControllerHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"hashOperation"`
 */
export const useReadLightTimelockControllerHashOperation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'hashOperation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"hashOperationBatch"`
 */
export const useReadLightTimelockControllerHashOperationBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'hashOperationBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperation"`
 */
export const useReadLightTimelockControllerIsOperation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'isOperation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperationDone"`
 */
export const useReadLightTimelockControllerIsOperationDone =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'isOperationDone',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperationPending"`
 */
export const useReadLightTimelockControllerIsOperationPending =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'isOperationPending',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"isOperationReady"`
 */
export const useReadLightTimelockControllerIsOperationReady =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'isOperationReady',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightTimelockControllerProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLightTimelockControllerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useWriteLightTimelockController =
  /*#__PURE__*/ createUseWriteContract({ abi: lightTimelockControllerAbi })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteLightTimelockControllerCancel =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"execute"`
 */
export const useWriteLightTimelockControllerExecute =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'execute',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useWriteLightTimelockControllerExecuteBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteLightTimelockControllerGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightTimelockControllerInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWriteLightTimelockControllerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWriteLightTimelockControllerOnErc1155Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useWriteLightTimelockControllerOnErc721Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteLightTimelockControllerRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteLightTimelockControllerRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"schedule"`
 */
export const useWriteLightTimelockControllerSchedule =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'schedule',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"scheduleBatch"`
 */
export const useWriteLightTimelockControllerScheduleBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'scheduleBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"updateDelay"`
 */
export const useWriteLightTimelockControllerUpdateDelay =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'updateDelay',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightTimelockControllerUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useSimulateLightTimelockController =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightTimelockControllerAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateLightTimelockControllerCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateLightTimelockControllerExecute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'execute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useSimulateLightTimelockControllerExecuteBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateLightTimelockControllerGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightTimelockControllerInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulateLightTimelockControllerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulateLightTimelockControllerOnErc1155Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useSimulateLightTimelockControllerOnErc721Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateLightTimelockControllerRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateLightTimelockControllerRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"schedule"`
 */
export const useSimulateLightTimelockControllerSchedule =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'schedule',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"scheduleBatch"`
 */
export const useSimulateLightTimelockControllerScheduleBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'scheduleBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"updateDelay"`
 */
export const useSimulateLightTimelockControllerUpdateDelay =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'updateDelay',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightTimelockControllerUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__
 */
export const useWatchLightTimelockController =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: lightTimelockControllerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"CallExecuted"`
 */
export const useWatchLightTimelockControllerCallExecuted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'CallExecuted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"CallSalt"`
 */
export const useWatchLightTimelockControllerCallSalt =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'CallSalt',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"CallScheduled"`
 */
export const useWatchLightTimelockControllerCallScheduled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'CallScheduled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"Cancelled"`
 */
export const useWatchLightTimelockControllerCancelled =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'Cancelled',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightTimelockControllerInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"MinDelayChange"`
 */
export const useWatchLightTimelockControllerMinDelayChange =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'MinDelayChange',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchLightTimelockControllerRoleAdminChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchLightTimelockControllerRoleGranted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchLightTimelockControllerRoleRevoked =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightTimelockControllerAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightTimelockControllerUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightTimelockControllerAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__
 */
export const useReadLightTimelockControllerFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightTimelockControllerFactoryNAME =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: 'NAME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightTimelockControllerFactoryVERSION =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: 'VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"getAddress"`
 */
export const useReadLightTimelockControllerFactoryGetAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: 'getAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"timelockImplementation"`
 */
export const useReadLightTimelockControllerFactoryTimelockImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: 'timelockImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__
 */
export const useWriteLightTimelockControllerFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerFactoryAbi,
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"createTimelockController"`
 */
export const useWriteLightTimelockControllerFactoryCreateTimelockController =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: 'createTimelockController',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__
 */
export const useSimulateLightTimelockControllerFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerFactoryAbi,
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightTimelockControllerFactoryAbi}__ and `functionName` set to `"createTimelockController"`
 */
export const useSimulateLightTimelockControllerFactoryCreateTimelockController =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightTimelockControllerFactoryAbi,
    functionName: 'createTimelockController',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__
 */
export const useReadLightVault = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"DOMAIN_SEPARATOR"`
 */
export const useReadLightVaultDomainSeparator =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'DOMAIN_SEPARATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightVaultNAME = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'NAME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightVaultVERSION = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'VERSION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadLightVaultAllowance = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"asset"`
 */
export const useReadLightVaultAsset = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'asset',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadLightVaultBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimableDepositBalanceInAsset"`
 */
export const useReadLightVaultClaimableDepositBalanceInAsset =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'claimableDepositBalanceInAsset',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimableDepositRequest"`
 */
export const useReadLightVaultClaimableDepositRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'claimableDepositRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimableRedeemRequest"`
 */
export const useReadLightVaultClaimableRedeemRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'claimableRedeemRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimableSilo"`
 */
export const useReadLightVaultClaimableSilo =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'claimableSilo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"convertToAssets"`
 */
export const useReadLightVaultConvertToAssets =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'convertToAssets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"convertToShares"`
 */
export const useReadLightVaultConvertToShares =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'convertToShares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadLightVaultDecimals = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"eip712Domain"`
 */
export const useReadLightVaultEip712Domain =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'eip712Domain',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"epochId"`
 */
export const useReadLightVaultEpochId = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'epochId',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"epochs"`
 */
export const useReadLightVaultEpochs = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'epochs',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"feesInBps"`
 */
export const useReadLightVaultFeesInBps = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'feesInBps',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"lastDepositRequestId"`
 */
export const useReadLightVaultLastDepositRequestId =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'lastDepositRequestId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"lastRedeemRequestId"`
 */
export const useReadLightVaultLastRedeemRequestId =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'lastRedeemRequestId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"lastSavedBalance"`
 */
export const useReadLightVaultLastSavedBalance =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'lastSavedBalance',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"maxDeposit"`
 */
export const useReadLightVaultMaxDeposit = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'maxDeposit',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"maxDepositRequest"`
 */
export const useReadLightVaultMaxDepositRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'maxDepositRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"maxMint"`
 */
export const useReadLightVaultMaxMint = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'maxMint',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"maxRedeem"`
 */
export const useReadLightVaultMaxRedeem = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'maxRedeem',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"maxRedeemRequest"`
 */
export const useReadLightVaultMaxRedeemRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'maxRedeemRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"maxWithdraw"`
 */
export const useReadLightVaultMaxWithdraw = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultAbi, functionName: 'maxWithdraw' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"name"`
 */
export const useReadLightVaultName = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"nonces"`
 */
export const useReadLightVaultNonces = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'nonces',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"owner"`
 */
export const useReadLightVaultOwner = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"paused"`
 */
export const useReadLightVaultPaused = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"pendingDepositRequest"`
 */
export const useReadLightVaultPendingDepositRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'pendingDepositRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"pendingOwner"`
 */
export const useReadLightVaultPendingOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'pendingOwner',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"pendingRedeemRequest"`
 */
export const useReadLightVaultPendingRedeemRequest =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'pendingRedeemRequest',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"pendingSilo"`
 */
export const useReadLightVaultPendingSilo = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultAbi, functionName: 'pendingSilo' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewClaimDeposit"`
 */
export const useReadLightVaultPreviewClaimDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'previewClaimDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewClaimRedeem"`
 */
export const useReadLightVaultPreviewClaimRedeem =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'previewClaimRedeem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewDeposit"`
 */
export const useReadLightVaultPreviewDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'previewDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewMint"`
 */
export const useReadLightVaultPreviewMint = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultAbi, functionName: 'previewMint' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewRedeem"`
 */
export const useReadLightVaultPreviewRedeem =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'previewRedeem',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewSettle"`
 */
export const useReadLightVaultPreviewSettle =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'previewSettle',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"previewWithdraw"`
 */
export const useReadLightVaultPreviewWithdraw =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'previewWithdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"sharesBalanceInAsset"`
 */
export const useReadLightVaultSharesBalanceInAsset =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'sharesBalanceInAsset',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLightVaultSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadLightVaultSymbol = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"totalAssets"`
 */
export const useReadLightVaultTotalAssets = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultAbi, functionName: 'totalAssets' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"totalClaimableAssets"`
 */
export const useReadLightVaultTotalClaimableAssets =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'totalClaimableAssets',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"totalClaimableShares"`
 */
export const useReadLightVaultTotalClaimableShares =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'totalClaimableShares',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"totalPendingDeposits"`
 */
export const useReadLightVaultTotalPendingDeposits =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'totalPendingDeposits',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"totalPendingRedeems"`
 */
export const useReadLightVaultTotalPendingRedeems =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultAbi,
    functionName: 'totalPendingRedeems',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadLightVaultTotalSupply = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultAbi, functionName: 'totalSupply' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"treasury"`
 */
export const useReadLightVaultTreasury = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultAbi,
  functionName: 'treasury',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"vaultIsOpen"`
 */
export const useReadLightVaultVaultIsOpen = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultAbi, functionName: 'vaultIsOpen' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__
 */
export const useWriteLightVault = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useWriteLightVaultAcceptOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteLightVaultApprove = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimDeposit"`
 */
export const useWriteLightVaultClaimDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'claimDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimRedeem"`
 */
export const useWriteLightVaultClaimRedeem =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'claimRedeem',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"close"`
 */
export const useWriteLightVaultClose = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'close',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"decreaseDepositRequest"`
 */
export const useWriteLightVaultDecreaseDepositRequest =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'decreaseDepositRequest',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"decreaseRedeemRequest"`
 */
export const useWriteLightVaultDecreaseRedeemRequest =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'decreaseRedeemRequest',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteLightVaultDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"depositWithPermit"`
 */
export const useWriteLightVaultDepositWithPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'depositWithPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightVaultInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteLightVaultMint = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"open"`
 */
export const useWriteLightVaultOpen = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'open',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteLightVaultPause = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"permit"`
 */
export const useWriteLightVaultPermit = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'permit',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"redeem"`
 */
export const useWriteLightVaultRedeem = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'redeem',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteLightVaultRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"requestDeposit"`
 */
export const useWriteLightVaultRequestDeposit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'requestDeposit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"requestDepositWithPermit"`
 */
export const useWriteLightVaultRequestDepositWithPermit =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'requestDepositWithPermit',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"requestRedeem"`
 */
export const useWriteLightVaultRequestRedeem =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'requestRedeem',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"setFee"`
 */
export const useWriteLightVaultSetFee = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'setFee',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"setMaxDrawdown"`
 */
export const useWriteLightVaultSetMaxDrawdown =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'setMaxDrawdown',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useWriteLightVaultSetTreasury =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"settle"`
 */
export const useWriteLightVaultSettle = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'settle',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteLightVaultTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteLightVaultTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteLightVaultTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useWriteLightVaultUnpause = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'unpause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteLightVaultWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultAbi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__
 */
export const useSimulateLightVault = /*#__PURE__*/ createUseSimulateContract({
  abi: lightVaultAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"acceptOwnership"`
 */
export const useSimulateLightVaultAcceptOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'acceptOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateLightVaultApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimDeposit"`
 */
export const useSimulateLightVaultClaimDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'claimDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"claimRedeem"`
 */
export const useSimulateLightVaultClaimRedeem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'claimRedeem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"close"`
 */
export const useSimulateLightVaultClose =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'close',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"decreaseDepositRequest"`
 */
export const useSimulateLightVaultDecreaseDepositRequest =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'decreaseDepositRequest',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"decreaseRedeemRequest"`
 */
export const useSimulateLightVaultDecreaseRedeemRequest =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'decreaseRedeemRequest',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateLightVaultDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'deposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"depositWithPermit"`
 */
export const useSimulateLightVaultDepositWithPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'depositWithPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightVaultInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateLightVaultMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"open"`
 */
export const useSimulateLightVaultOpen =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'open',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateLightVaultPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"permit"`
 */
export const useSimulateLightVaultPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'permit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"redeem"`
 */
export const useSimulateLightVaultRedeem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'redeem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateLightVaultRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"requestDeposit"`
 */
export const useSimulateLightVaultRequestDeposit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'requestDeposit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"requestDepositWithPermit"`
 */
export const useSimulateLightVaultRequestDepositWithPermit =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'requestDepositWithPermit',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"requestRedeem"`
 */
export const useSimulateLightVaultRequestRedeem =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'requestRedeem',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"setFee"`
 */
export const useSimulateLightVaultSetFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'setFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"setMaxDrawdown"`
 */
export const useSimulateLightVaultSetMaxDrawdown =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'setMaxDrawdown',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"setTreasury"`
 */
export const useSimulateLightVaultSetTreasury =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'setTreasury',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"settle"`
 */
export const useSimulateLightVaultSettle =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'settle',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateLightVaultTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'transfer',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateLightVaultTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateLightVaultTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"unpause"`
 */
export const useSimulateLightVaultUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateLightVaultWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultAbi,
    functionName: 'withdraw',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__
 */
export const useWatchLightVault = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lightVaultAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchLightVaultApproval =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"ClaimDeposit"`
 */
export const useWatchLightVaultClaimDeposit =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'ClaimDeposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"ClaimRedeem"`
 */
export const useWatchLightVaultClaimRedeem =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'ClaimRedeem',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"DecreaseDepositRequest"`
 */
export const useWatchLightVaultDecreaseDepositRequest =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'DecreaseDepositRequest',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"DecreaseRedeemRequest"`
 */
export const useWatchLightVaultDecreaseRedeemRequest =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'DecreaseRedeemRequest',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchLightVaultDeposit =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"DepositRequest"`
 */
export const useWatchLightVaultDepositRequest =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'DepositRequest',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"EIP712DomainChanged"`
 */
export const useWatchLightVaultEip712DomainChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'EIP712DomainChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"EpochEnd"`
 */
export const useWatchLightVaultEpochEnd =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'EpochEnd',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"EpochStart"`
 */
export const useWatchLightVaultEpochStart =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'EpochStart',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"FeesChanged"`
 */
export const useWatchLightVaultFeesChanged =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'FeesChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightVaultInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"OwnershipTransferStarted"`
 */
export const useWatchLightVaultOwnershipTransferStarted =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'OwnershipTransferStarted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchLightVaultOwnershipTransferred =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Paused"`
 */
export const useWatchLightVaultPaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"RedeemRequest"`
 */
export const useWatchLightVaultRedeemRequest =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'RedeemRequest',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchLightVaultTransfer =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Unpaused"`
 */
export const useWatchLightVaultUnpaused =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightVaultAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchLightVaultWithdraw =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightVaultAbi,
    eventName: 'Withdraw',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__
 */
export const useReadLightVaultFactory = /*#__PURE__*/ createUseReadContract({
  abi: lightVaultFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"LIGHT_PROTOCOL_FEES"`
 */
export const useReadLightVaultFactoryLightProtocolFees =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultFactoryAbi,
    functionName: 'LIGHT_PROTOCOL_FEES',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"LIGHT_PROTOCOL_OWNER"`
 */
export const useReadLightVaultFactoryLightProtocolOwner =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultFactoryAbi,
    functionName: 'LIGHT_PROTOCOL_OWNER',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"LIGHT_PROTOCOL_TREASURY"`
 */
export const useReadLightVaultFactoryLightProtocolTreasury =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultFactoryAbi,
    functionName: 'LIGHT_PROTOCOL_TREASURY',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightVaultFactoryNAME = /*#__PURE__*/ createUseReadContract(
  { abi: lightVaultFactoryAbi, functionName: 'NAME' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightVaultFactoryVERSION =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultFactoryAbi,
    functionName: 'VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"getAddress"`
 */
export const useReadLightVaultFactoryGetAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultFactoryAbi,
    functionName: 'getAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"vaultImplementation"`
 */
export const useReadLightVaultFactoryVaultImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightVaultFactoryAbi,
    functionName: 'vaultImplementation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__
 */
export const useWriteLightVaultFactory = /*#__PURE__*/ createUseWriteContract({
  abi: lightVaultFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"createVault"`
 */
export const useWriteLightVaultFactoryCreateVault =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightVaultFactoryAbi,
    functionName: 'createVault',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__
 */
export const useSimulateLightVaultFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightVaultFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightVaultFactoryAbi}__ and `functionName` set to `"createVault"`
 */
export const useSimulateLightVaultFactoryCreateVault =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightVaultFactoryAbi,
    functionName: 'createVault',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useReadLightWallet = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightWalletNAME = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'NAME',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"SET_IMAGE_HASH_TYPE_HASH"`
 */
export const useReadLightWalletSetImageHashTypeHash =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'SET_IMAGE_HASH_TYPE_HASH',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 */
export const useReadLightWalletUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightWalletVERSION = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'VERSION',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"entryPoint"`
 */
export const useReadLightWalletEntryPoint = /*#__PURE__*/ createUseReadContract(
  { abi: lightWalletAbi, functionName: 'entryPoint' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"getNonce"`
 */
export const useReadLightWalletGetNonce = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'getNonce',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"imageHash"`
 */
export const useReadLightWalletImageHash = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletAbi,
  functionName: 'imageHash',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"isValidSignature"`
 */
export const useReadLightWalletIsValidSignature =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'isValidSignature',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useReadLightWalletOnErc1155BatchReceived =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useReadLightWalletOnErc1155Received =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"onERC721Received"`
 */
export const useReadLightWalletOnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"proxiableUUID"`
 */
export const useReadLightWalletProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"signatureRecovery"`
 */
export const useReadLightWalletSignatureRecovery =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'signatureRecovery',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadLightWalletSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useWriteLightWallet = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"execute"`
 */
export const useWriteLightWalletExecute = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletAbi,
  functionName: 'execute',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useWriteLightWalletExecuteBatch =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteLightWalletInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"updateImageHash"`
 */
export const useWriteLightWalletUpdateImageHash =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'updateImageHash',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useWriteLightWalletUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"validateUserOp"`
 */
export const useWriteLightWalletValidateUserOp =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletAbi,
    functionName: 'validateUserOp',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useSimulateLightWallet = /*#__PURE__*/ createUseSimulateContract({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"execute"`
 */
export const useSimulateLightWalletExecute =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'execute',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"executeBatch"`
 */
export const useSimulateLightWalletExecuteBatch =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'executeBatch',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateLightWalletInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"updateImageHash"`
 */
export const useSimulateLightWalletUpdateImageHash =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'updateImageHash',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"upgradeToAndCall"`
 */
export const useSimulateLightWalletUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletAbi}__ and `functionName` set to `"validateUserOp"`
 */
export const useSimulateLightWalletValidateUserOp =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletAbi,
    functionName: 'validateUserOp',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__
 */
export const useWatchLightWallet = /*#__PURE__*/ createUseWatchContractEvent({
  abi: lightWalletAbi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"ImageHashUpdated"`
 */
export const useWatchLightWalletImageHashUpdated =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'ImageHashUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchLightWalletInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"LightWalletInitialized"`
 */
export const useWatchLightWalletLightWalletInitialized =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'LightWalletInitialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link lightWalletAbi}__ and `eventName` set to `"Upgraded"`
 */
export const useWatchLightWalletUpgraded =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: lightWalletAbi,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useReadLightWalletFactory = /*#__PURE__*/ createUseReadContract({
  abi: lightWalletFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"NAME"`
 */
export const useReadLightWalletFactoryNAME =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'NAME',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"VERSION"`
 */
export const useReadLightWalletFactoryVERSION =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"accountImplementation"`
 */
export const useReadLightWalletFactoryAccountImplementation =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'accountImplementation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"getAddress"`
 */
export const useReadLightWalletFactoryGetAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: lightWalletFactoryAbi,
    functionName: 'getAddress',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useWriteLightWalletFactory = /*#__PURE__*/ createUseWriteContract({
  abi: lightWalletFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"createAccount"`
 */
export const useWriteLightWalletFactoryCreateAccount =
  /*#__PURE__*/ createUseWriteContract({
    abi: lightWalletFactoryAbi,
    functionName: 'createAccount',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__
 */
export const useSimulateLightWalletFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: lightWalletFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link lightWalletFactoryAbi}__ and `functionName` set to `"createAccount"`
 */
export const useSimulateLightWalletFactoryCreateAccount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: lightWalletFactoryAbi,
    functionName: 'createAccount',
  })
