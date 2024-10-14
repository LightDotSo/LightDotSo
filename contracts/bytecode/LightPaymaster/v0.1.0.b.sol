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

// SPDX-License-Identifier: Apache-2.0

import {MagicSpend} from "magic-spend-patch/MagicSpend.sol";
import {proxyByteCode} from "@/bytecode/ERC1967Proxy/v0.3.0.b.sol";
import {
    ENTRYPOINT_V070_ADDRESS, LIGHT_PAYMASTER_IMPLEMENTATION_ADDRESS
} from "@/constant/address.sol";
import {LIGHT_PAYMASTER_MAX_WITHDRAWAL_DENOMINATOR} from "@/constant/config.sol";

pragma solidity ^0.8.27;

// bytes constant byteCode = type(LightPaymaster).creationCode;
bytes constant byteCode =
    hex"60c06040523480156200001157600080fd5b5060405162001a2638038062001a26833981016040819052620000349162000156565b818181620000423362000075565b73ffffffffffffffffffffffffffffffffffffffff9081166080521660a052506200006d3262000075565b505062000199565b6000805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600073ffffffffffffffffffffffffffffffffffffffff82165b92915050565b60006200010482620000ea565b62000122816200010a565b81146200012e57600080fd5b50565b8051620001048162000117565b6200012281620000ea565b805162000104816200013e565b600080604083850312156200016e576200016e600080fd5b60006200017c858562000131565b92505060206200018f8582860162000149565b9150509250929050565b60805160a05161182f620001f76000396000818161013f0152610b4b01526000818161027301528181610387015281816104380152818161056901528181610628015281816106d20152818161078a0152610985015261182f6000f3fe6080604052600436106100f35760003560e01c8063a9a234091161008a578063c399ec8811610059578063c399ec88146102d7578063d0e30db0146102ec578063f2fde38b146102f4578063f465c77e1461031457600080fd5b8063a9a2340914610241578063b0d691fe14610261578063bb9fe6bf146102a2578063c23a5cea146102b757600080fd5b80638da5cb5b116100c65780638da5cb5b1461018c57806394d4ad60146101b757806394e1fc19146101e75780639c90b4431461021457600080fd5b80630396cb60146100f8578063205c28781461010d57806323d9ac9b1461012d578063715018a614610177575b600080fd5b61010b610106366004610e7b565b610342565b005b34801561011957600080fd5b5061010b610128366004610ee7565b6103f3565b34801561013957600080fd5b506101617f000000000000000000000000000000000000000000000000000000000000000081565b60405161016e9190610f33565b60405180910390f35b34801561018357600080fd5b5061010b610489565b34801561019857600080fd5b5060005473ffffffffffffffffffffffffffffffffffffffff16610161565b3480156101c357600080fd5b506101d76101d2366004610f8c565b61049d565b60405161016e9493929190611035565b3480156101f357600080fd5b506102076102023660046110a2565b6104da565b60405161016e9190611112565b34801561022057600080fd5b5061020761022f366004611120565b60016020526000908152604090205481565b34801561024d57600080fd5b5061010b61025c366004611159565b610545565b34801561026d57600080fd5b506102957f000000000000000000000000000000000000000000000000000000000000000081565b60405161016e91906111e8565b3480156102ae57600080fd5b5061010b61055f565b3480156102c357600080fd5b5061010b6102d2366004611120565b6105e3565b3480156102e357600080fd5b50610207610692565b61010b61074d565b34801561030057600080fd5b5061010b61030f366004611120565b6107da565b34801561032057600080fd5b5061033461032f3660046111f6565b610844565b60405161016e9291906112c6565b61034a610868565b6040517f0396cb6000000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690630396cb609034906103be9085906004016112f2565b6000604051808303818588803b1580156103d757600080fd5b505af11580156103eb573d6000803e3d6000fd5b505050505050565b6103fb610868565b6040517f205c287800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063205c28789061046f9085908590600401611300565b600060405180830381600087803b1580156103d757600080fd5b610491610868565b61049b60006108b9565b565b60008036816104b060546014878961131b565b8101906104bd919061134b565b90945092506104cf856054818961131b565b949793965094505050565b60006104e58461092e565b73ffffffffffffffffffffffffffffffffffffffff853516600090815260016020908152604091829020549151610525939246923092899189910161137e565b6040516020818303038152906040528051906020012090505b9392505050565b61054d61096d565b610559848484846109dc565b50505050565b610567610868565b7f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663bb9fe6bf6040518163ffffffff1660e01b8152600401600060405180830381600087803b1580156105cf57600080fd5b505af1158015610559573d6000803e3d6000fd5b6105eb610868565b6040517fc23a5cea00000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063c23a5cea9061065d908490600401610f33565b600060405180830381600087803b15801561067757600080fd5b505af115801561068b573d6000803e3d6000fd5b5050505050565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815260009073ffffffffffffffffffffffffffffffffffffffff7f000000000000000000000000000000000000000000000000000000000000000016906370a0823190610707903090600401610f33565b602060405180830381865afa158015610724573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061074891906113e8565b905090565b6040517fb760faf900000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000169063b760faf99034906107c1903090600401610f33565b6000604051808303818588803b15801561067757600080fd5b6107e2610868565b73ffffffffffffffffffffffffffffffffffffffff8116610838576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f90611466565b60405180910390fd5b610841816108b9565b50565b6060600061085061096d565b61085b858585610a0e565b915091505b935093915050565b60005473ffffffffffffffffffffffffffffffffffffffff16331461049b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f906114ab565b6000805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60603660006109416101208501856114bb565b915091508360208184030360405194506020810185016040528085528082602087013750505050919050565b3373ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000161461049b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f9061156c565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f906115b0565b6060600080803681610a276101d26101208b018b6114bb565b929650909450925090506040811480610a405750604181145b610a76576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f9061161a565b6000610ab9610a868b87876104da565b7f19457468657265756d205369676e6564204d6573736167653a0a3332000000006000908152601c91909152603c902090565b73ffffffffffffffffffffffffffffffffffffffff8b35166000908152600160205260408120805492935090610aee83611659565b9190505550610b338184848080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250610bdb92505050565b73ffffffffffffffffffffffffffffffffffffffff167f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1614610bb057610b9160018686610c01565b6040518060200160405280600081525090965096505050505050610860565b610bbc60008686610c01565b6040805160208101909152600081529b909a5098505050505050505050565b6000806000610bea8585610c39565b91509150610bf781610c7e565b5090505b92915050565b600060d08265ffffffffffff16901b60a08465ffffffffffff16901b85610c29576000610c2c565b60015b60ff161717949350505050565b6000808251604103610c6f5760208301516040840151606085015160001a610c6387828585610d7b565b94509450505050610c77565b506000905060025b9250929050565b6000816004811115610c9257610c92611691565b03610c9a5750565b6001816004811115610cae57610cae611691565b03610ce5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f906116f4565b6002816004811115610cf957610cf9611691565b03610d30576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f90611738565b6003816004811115610d4457610d44611691565b03610841576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161082f906117a2565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610db25750600090506003610e54565b600060018787878760405160008152602001604052604051610dd794939291906117bb565b6020604051602081039080840390855afa158015610df9573d6000803e3d6000fd5b50506040517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0015191505073ffffffffffffffffffffffffffffffffffffffff8116610e4d57600060019250925050610e54565b9150600090505b94509492505050565b63ffffffff81165b811461084157600080fd5b8035610bfb81610e5d565b600060208284031215610e9057610e90600080fd5b6000610e9c8484610e70565b949350505050565b600073ffffffffffffffffffffffffffffffffffffffff8216610bfb565b610e6581610ea4565b8035610bfb81610ec2565b80610e65565b8035610bfb81610ed6565b60008060408385031215610efd57610efd600080fd5b6000610f098585610ecb565b9250506020610f1a85828601610edc565b9150509250929050565b610f2d81610ea4565b82525050565b60208101610bfb8284610f24565b60008083601f840112610f5657610f56600080fd5b50813567ffffffffffffffff811115610f7157610f71600080fd5b602083019150836001820283011115610c7757610c77600080fd5b60008060208385031215610fa257610fa2600080fd5b823567ffffffffffffffff811115610fbc57610fbc600080fd5b610fc885828601610f41565b92509250509250929050565b65ffffffffffff8116610f2d565b82818337506000910152565b8183526000602084019350611004838584610fe2565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f8401165b9093019392505050565b606081016110438287610fd4565b6110506020830186610fd4565b8181036040830152611063818486610fee565b9695505050505050565b6000610160828403121561108357611083600080fd5b50919050565b65ffffffffffff8116610e65565b8035610bfb81611089565b6000806000606084860312156110ba576110ba600080fd5b833567ffffffffffffffff8111156110d4576110d4600080fd5b6110e08682870161106d565b93505060206110f186828701611097565b925050604061110286828701611097565b9150509250925092565b80610f2d565b60208101610bfb828461110c565b60006020828403121561113557611135600080fd5b6000610e9c8484610ecb565b6003811061084157600080fd5b8035610bfb81611141565b6000806000806060858703121561117257611172600080fd5b600061117e878761114e565b945050602085013567ffffffffffffffff81111561119e5761119e600080fd5b6111aa87828801610f41565b935093505060406111bd87828801610edc565b91505092959194509250565b6000610bfb82610ea4565b6000610bfb826111c9565b610f2d816111d4565b60208101610bfb82846111df565b60008060006060848603121561120e5761120e600080fd5b833567ffffffffffffffff81111561122857611228600080fd5b6112348682870161106d565b935050602061124586828701610edc565b925050604061110286828701610edc565b60005b83811015611271578181015183820152602001611259565b50506000910152565b6000611284825190565b80845260208401935061129b818560208601611256565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f82011661102b565b604080825281016112d7818561127a565b905061053e602083018461110c565b63ffffffff8116610f2d565b60208101610bfb82846112e6565b6040810161130e8285610f24565b61053e602083018461110c565b6000808585111561132e5761132e600080fd5b8386111561133e5761133e600080fd5b5050820193919092039150565b6000806040838503121561136157611361600080fd5b600061136d8585611097565b9250506020610f1a85828601611097565b60c0808252810161138f818961127a565b905061139e602083018861110c565b6113ab6040830187610f24565b6113b8606083018661110c565b6113c56080830185610fd4565b6113d260a0830184610fd4565b979650505050505050565b8051610bfb81610ed6565b6000602082840312156113fd576113fd600080fd5b6000610e9c84846113dd565b602681526000602082017f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206181527f6464726573730000000000000000000000000000000000000000000000000000602082015291505b5060400190565b60208082528101610bfb81611409565b60208082527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572910190815260005b5060200190565b60208082528101610bfb81611476565b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe1368590030181126114f4576114f4600080fd5b80840192508235915067ffffffffffffffff82111561151557611515600080fd5b60208301925060018202360383131561153057611530600080fd5b509250929050565b601581526000602082017f53656e646572206e6f7420456e747279506f696e740000000000000000000000815291506114a4565b60208082528101610bfb81611538565b600d81526000602082017f6d757374206f7665727269646500000000000000000000000000000000000000815291506114a4565b60208082528101610bfb8161157c565b604081526000602082017f566572696679696e675061796d61737465723a20696e76616c6964207369676e81527f6174757265206c656e67746820696e207061796d6173746572416e64446174616020820152915061145f565b60208082528101610bfb816115c0565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361168a5761168a61162a565b5060010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b601881526000602082017f45434453413a20696e76616c6964207369676e61747572650000000000000000815291506114a4565b60208082528101610bfb816116c0565b601f81526000602082017f45434453413a20696e76616c6964207369676e6174757265206c656e67746800815291506114a4565b60208082528101610bfb81611704565b602281526000602082017f45434453413a20696e76616c6964207369676e6174757265202773272076616c81527f75650000000000000000000000000000000000000000000000000000000000006020820152915061145f565b60208082528101610bfb81611748565b60ff8116610f2d565b608081016117c9828761110c565b6117d660208301866117b2565b6117e3604083018561110c565b6117f0606083018461110c565b9594505050505056fea2646970667358221220dd283ddd932701bdfb882f78a69a36051b3632a2119f721165fc26c69c15e17e64736f6c63430008120033";
bytes constant initCode = abi.encodePacked(byteCode, abi.encode(ENTRYPOINT_V070_ADDRESS));
bytes32 constant initCodeHash = 0x69383c5cf7aff56ec5d891b93bf0f1221e08f34e08b406de8633b864db4dfb67;
bytes32 constant salt = 0x0000000000000000000000000000000000000000e518dc21f381b8e76fbe1a45;
bytes constant proxyInitCode = abi.encodePacked(
    proxyByteCode,
    abi.encode(
        address(LIGHT_PAYMASTER_IMPLEMENTATION_ADDRESS),
        abi.encodeCall(
            MagicSpend.initialize,
            (address(0), LIGHT_PAYMASTER_MAX_WITHDRAWAL_DENOMINATOR, address(0))
        )
    )
);
bytes32 constant proxyInitCodeHash =
    0x0000000000000000000000000000000000000000000000000000000000000000;
bytes32 constant proxySalt = 0x0000000000000000000000000000000000000000000000000000000000000000;
