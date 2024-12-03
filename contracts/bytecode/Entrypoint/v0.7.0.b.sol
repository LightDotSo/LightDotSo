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

pragma solidity ^0.8.27;

bytes constant byteCode =
    hex"60a08060405234620000825760016002556101df8181016001600160401b038111838210176200006c57829162003f2b833903906000f080156200006057608052604051613ea39081620000888239608051818181610d22015261324b0152f35b6040513d6000823e3d90fd5b634e487b7160e01b600052604160045260246000fd5b600080fdfe60806040526004361015610024575b361561001957600080fd5b61002233612748565b005b60003560e01c806242dc5314611b0057806301ffc9a7146119ae5780630396cb60146116765780630bd28e3b146115fa5780631b2e01b814611566578063205c2878146113d157806322cdde4c1461136b57806335567e1a146112b35780635287ce12146111a557806370a0823114611140578063765e827f14610e82578063850aaf6214610dc35780639b249f6914610c74578063b760faf914610c3a578063bb9fe6bf14610a68578063c23a5cea146107c4578063dbed18e0146101a15763fc7e286d0361000e573461019c5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5773ffffffffffffffffffffffffffffffffffffffff61013a61229f565b16600052600060205260a0604060002065ffffffffffff6001825492015460405192835260ff8116151560208401526dffffffffffffffffffffffffffff8160081c16604084015263ffffffff8160781c16606084015260981c166080820152f35b600080fd5b3461019c576101af36612317565b906101b86129bd565b60009160005b82811061056f57506101d08493612588565b6000805b8481106102fc5750507fbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972600080a16000809360005b81811061024757610240868660007f575ff3acadd5ab348fe1855e217e0f3678f8d767d7494c9f9fefbee2e17cca4d8180a2613ba7565b6001600255005b6102a261025582848a612796565b73ffffffffffffffffffffffffffffffffffffffff6102766020830161282a565b167f575ff3acadd5ab348fe1855e217e0f3678f8d767d7494c9f9fefbee2e17cca4d600080a2806127d6565b906000915b8083106102b957505050600101610209565b909194976102f36102ed6001926102e78c8b6102e0826102da8e8b8d61269d565b9261265a565b5191613597565b90612409565b99612416565b950191906102a7565b6020610309828789612796565b61031f61031682806127d6565b9390920161282a565b9160009273ffffffffffffffffffffffffffffffffffffffff8091165b8285106103505750505050506001016101d4565b909192939561037f83610378610366848c61265a565b516103728b898b61269d565b856129f6565b9290613dd7565b9116840361050a576104a5576103958491613dd7565b9116610440576103b5576103aa600191612416565b96019392919061033c565b60a487604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152602160448201527f41413332207061796d61737465722065787069726564206f72206e6f7420647560648201527f65000000000000000000000000000000000000000000000000000000000000006084820152fd5b608488604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601460448201527f41413334207369676e6174757265206572726f720000000000000000000000006064820152fd5b608488604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601760448201527f414132322065787069726564206f72206e6f74206475650000000000000000006064820152fd5b608489604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601460448201527f41413234207369676e6174757265206572726f720000000000000000000000006064820152fd5b61057a818487612796565b9361058585806127d6565b919095602073ffffffffffffffffffffffffffffffffffffffff6105aa82840161282a565b1697600192838a1461076657896105da575b5050505060019293949550906105d191612409565b939291016101be565b8060406105e892019061284b565b918a3b1561019c57929391906040519485937f2dd8113300000000000000000000000000000000000000000000000000000000855288604486016040600488015252606490818601918a60051b8701019680936000915b8c83106106e657505050505050838392610684927ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc8560009803016024860152612709565b03818a5afa90816106d7575b506106c657602486604051907f86a9f7500000000000000000000000000000000000000000000000000000000082526004820152fd5b93945084936105d1600189806105bc565b6106e0906121bd565b88610690565b91939596977fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff9c908a9294969a0301865288357ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffee18336030181121561019c57836107538793858394016128ec565b9a0196019301909189979695949261063f565b606483604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601760248201527f4141393620696e76616c69642061676772656761746f720000000000000000006044820152fd5b3461019c576020807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c576107fc61229f565b33600052600082526001604060002001908154916dffffffffffffffffffffffffffff8360081c16928315610a0a5765ffffffffffff8160981c1680156109ac57421061094e5760009373ffffffffffffffffffffffffffffffffffffffff859485947fffffffffffffff000000000000000000000000000000000000000000000000ff86951690556040517fb7c918e0e249f999e965cafeb6c664271b3f4317d296461500e71da39f0cbda33391806108da8786836020909392919373ffffffffffffffffffffffffffffffffffffffff60408201951681520152565b0390a2165af16108e8612450565b50156108f057005b606490604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601860248201527f6661696c656420746f207769746864726177207374616b6500000000000000006044820152fd5b606485604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601b60248201527f5374616b65207769746864726177616c206973206e6f742064756500000000006044820152fd5b606486604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601d60248201527f6d7573742063616c6c20756e6c6f636b5374616b6528292066697273740000006044820152fd5b606485604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601460248201527f4e6f207374616b6520746f2077697468647261770000000000000000000000006044820152fd5b3461019c5760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c573360005260006020526001604060002001805463ffffffff8160781c16908115610bdc5760ff1615610b7e5765ffffffffffff908142160191818311610b4f5780547fffffffffffffff000000000000ffffffffffffffffffffffffffffffffffff001678ffffffffffff00000000000000000000000000000000000000609885901b161790556040519116815233907ffa9b3c14cc825c412c9ed81b3ba365a5b459439403f18829e572ed53a4180f0a90602090a2005b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601160248201527f616c726561647920756e7374616b696e670000000000000000000000000000006044820152fd5b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600a60248201527f6e6f74207374616b6564000000000000000000000000000000000000000000006044820152fd5b60207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c57610022610c6f61229f565b612748565b3461019c5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5760043567ffffffffffffffff811161019c576020610cc8610d1b9236906004016122c2565b919073ffffffffffffffffffffffffffffffffffffffff9260405194859283927f570e1a360000000000000000000000000000000000000000000000000000000084528560048501526024840191612709565b03816000857f0000000000000000000000000000000000000000000000000000000000000000165af1908115610db757602492600092610d86575b50604051917f6ca7b806000000000000000000000000000000000000000000000000000000008352166004820152fd5b610da991925060203d602011610db0575b610da181836121ed565b8101906126dd565b9083610d56565b503d610d97565b6040513d6000823e3d90fd5b3461019c5760407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c57610dfa61229f565b60243567ffffffffffffffff811161019c57600091610e1e839236906004016122c2565b90816040519283928337810184815203915af4610e39612450565b90610e7e6040519283927f99410554000000000000000000000000000000000000000000000000000000008452151560048401526040602484015260448301906123c6565b0390fd5b3461019c57610e9036612317565b610e9b9291926129bd565b610ea483612588565b60005b848110610f1c57506000927fbb47ee3e183a558b1a2ff0874b079f3fc5478b7454eacf2bfc5af2ff5878f972600080a16000915b858310610eec576102408585613ba7565b909193600190610f12610f0087898761269d565b610f0a888661265a565b519088613597565b0194019190610edb565b610f47610f40610f2e8385979561265a565b51610f3a84898761269d565b846129f6565b9190613dd7565b73ffffffffffffffffffffffffffffffffffffffff929183166110db5761107657610f7190613dd7565b911661101157610f8657600101929092610ea7565b60a490604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152602160448201527f41413332207061796d61737465722065787069726564206f72206e6f7420647560648201527f65000000000000000000000000000000000000000000000000000000000000006084820152fd5b608482604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601460448201527f41413334207369676e6174757265206572726f720000000000000000000000006064820152fd5b608483604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601760448201527f414132322065787069726564206f72206e6f74206475650000000000000000006064820152fd5b608484604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601460448201527f41413234207369676e6174757265206572726f720000000000000000000000006064820152fd5b3461019c5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5773ffffffffffffffffffffffffffffffffffffffff61118c61229f565b1660005260006020526020604060002054604051908152f35b3461019c5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5773ffffffffffffffffffffffffffffffffffffffff6111f161229f565b6000608060405161120181612155565b828152826020820152826040820152826060820152015216600052600060205260a06040600020608060405161123681612155565b6001835493848352015490602081019060ff8316151582526dffffffffffffffffffffffffffff60408201818560081c16815263ffffffff936060840193858760781c16855265ffffffffffff978891019660981c1686526040519788525115156020880152511660408601525116606084015251166080820152f35b3461019c5760407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5760206112ec61229f565b73ffffffffffffffffffffffffffffffffffffffff6113096122f0565b911660005260018252604060002077ffffffffffffffffffffffffffffffffffffffffffffffff821660005282526040600020547fffffffffffffffffffffffffffffffffffffffffffffffff00000000000000006040519260401b16178152f35b3461019c577ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc60208136011261019c576004359067ffffffffffffffff821161019c5761012090823603011261019c576113c9602091600401612480565b604051908152f35b3461019c5760407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5761140861229f565b60243590336000526000602052604060002090815491828411611508576000808573ffffffffffffffffffffffffffffffffffffffff8295839561144c848a612443565b90556040805173ffffffffffffffffffffffffffffffffffffffff831681526020810185905233917fd1c19fbcd4551a5edfb66d43d2e337c04837afda3482b42bdf569a8fccdae5fb91a2165af16114a2612450565b50156114aa57005b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f6661696c656420746f20776974686472617700000000000000000000000000006044820152fd5b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601960248201527f576974686472617720616d6f756e7420746f6f206c61726765000000000000006044820152fd5b3461019c5760407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5761159d61229f565b73ffffffffffffffffffffffffffffffffffffffff6115ba6122f0565b9116600052600160205277ffffffffffffffffffffffffffffffffffffffffffffffff604060002091166000526020526020604060002054604051908152f35b3461019c5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5760043577ffffffffffffffffffffffffffffffffffffffffffffffff811680910361019c5733600052600160205260406000209060005260205260406000206116728154612416565b9055005b6020807ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5760043563ffffffff9182821680920361019c5733600052600081526040600020928215611950576001840154908160781c1683106118f2576116f86dffffffffffffffffffffffffffff9182349160081c16612409565b93841561189457818511611836579065ffffffffffff61180592546040519061172082612155565b8152848101926001845260408201908816815260608201878152600160808401936000855233600052600089526040600020905181550194511515917fffffffffffffffffffffffffff0000000000000000000000000000000000000060ff72ffffffff0000000000000000000000000000006effffffffffffffffffffffffffff008954945160081b16945160781b1694169116171717835551167fffffffffffffff000000000000ffffffffffffffffffffffffffffffffffffff78ffffffffffff0000000000000000000000000000000000000083549260981b169116179055565b6040519283528201527fa5ae833d0bb1dcd632d98a8b70973e8516812898e19bf27b70071ebc8dc52c0160403392a2005b606483604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152600e60248201527f7374616b65206f766572666c6f770000000000000000000000000000000000006044820152fd5b606483604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601260248201527f6e6f207374616b652073706563696669656400000000000000000000000000006044820152fd5b606482604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601c60248201527f63616e6e6f7420646563726561736520756e7374616b652074696d65000000006044820152fd5b606482604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601a60248201527f6d757374207370656369667920756e7374616b652064656c61790000000000006044820152fd5b3461019c5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c576004357fffffffff00000000000000000000000000000000000000000000000000000000811680910361019c57807f60fc6b6e0000000000000000000000000000000000000000000000000000000060209214908115611ad6575b8115611aac575b8115611a82575b8115611a58575b506040519015158152f35b7f01ffc9a70000000000000000000000000000000000000000000000000000000091501482611a4d565b7f3e84f0210000000000000000000000000000000000000000000000000000000081149150611a46565b7fcf28ef970000000000000000000000000000000000000000000000000000000081149150611a3f565b7f915074d80000000000000000000000000000000000000000000000000000000081149150611a38565b3461019c576102007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261019c5767ffffffffffffffff60043581811161019c573660238201121561019c57611b62903690602481600401359101612268565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffdc36016101c0811261019c5761014060405191611b9e83612155565b1261019c5760405192611bb0846121a0565b60243573ffffffffffffffffffffffffffffffffffffffff8116810361019c578452602093604435858201526064356040820152608435606082015260a435608082015260c43560a082015260e43560c08201526101043573ffffffffffffffffffffffffffffffffffffffff8116810361019c5760e08201526101243561010082015261014435610120820152825261016435848301526101843560408301526101a43560608301526101c43560808301526101e43590811161019c57611c7c9036906004016122c2565b905a3033036120f7578351606081015195603f5a0260061c61271060a0840151890101116120ce5760009681519182611ff0575b5050505090611cca915a9003608085015101923691612268565b925a90600094845193611cdc85613ccc565b9173ffffffffffffffffffffffffffffffffffffffff60e0870151168015600014611ea957505073ffffffffffffffffffffffffffffffffffffffff855116935b5a9003019360a06060820151910151016080860151850390818111611e95575b50508302604085015192818410600014611dce5750506003811015611da157600203611d79576113c99293508093611d7481613d65565b613cf6565b5050507fdeadaa51000000000000000000000000000000000000000000000000000000008152fd5b6024857f4e487b710000000000000000000000000000000000000000000000000000000081526021600452fd5b81611dde92979396940390613c98565b506003841015611e6857507f49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f60808683015192519473ffffffffffffffffffffffffffffffffffffffff865116948873ffffffffffffffffffffffffffffffffffffffff60e0890151169701519160405192835215898301528760408301526060820152a46113c9565b807f4e487b7100000000000000000000000000000000000000000000000000000000602492526021600452fd5b6064919003600a0204909301928780611d3d565b8095918051611eba575b5050611d1d565b6003861015611fc1576002860315611eb35760a088015190823b1561019c57600091611f2491836040519586809581947f7c627b210000000000000000000000000000000000000000000000000000000083528d60048401526080602484015260848301906123c6565b8b8b0260448301528b60648301520393f19081611fad575b50611fa65787893d610800808211611f9e575b506040519282828501016040528184528284013e610e7e6040519283927fad7954bc000000000000000000000000000000000000000000000000000000008452600484015260248301906123c6565b905083611f4f565b8980611eb3565b611fb89199506121bd565b6000978a611f3c565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91600092918380938c73ffffffffffffffffffffffffffffffffffffffff885116910192f115612023575b808080611cb0565b611cca929195503d6108008082116120c6575b5060405190888183010160405280825260008983013e805161205f575b5050600194909161201b565b7f1c4fada7374c0a9ee8841fc38afe82932dc0f8e69012e927f061a8bae611a20188870151918973ffffffffffffffffffffffffffffffffffffffff8551169401516120bc604051928392835260408d84015260408301906123c6565b0390a38680612053565b905088612036565b877fdeaddead000000000000000000000000000000000000000000000000000000006000526000fd5b606486604051907f08c379a00000000000000000000000000000000000000000000000000000000082526004820152601760248201527f4141393220696e7465726e616c2063616c6c206f6e6c790000000000000000006044820152fd5b60a0810190811067ffffffffffffffff82111761217157604052565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610140810190811067ffffffffffffffff82111761217157604052565b67ffffffffffffffff811161217157604052565b6060810190811067ffffffffffffffff82111761217157604052565b90601f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0910116810190811067ffffffffffffffff82111761217157604052565b67ffffffffffffffff811161217157601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe01660200190565b9291926122748261222e565b9161228260405193846121ed565b82948184528183011161019c578281602093846000960137010152565b6004359073ffffffffffffffffffffffffffffffffffffffff8216820361019c57565b9181601f8401121561019c5782359167ffffffffffffffff831161019c576020838186019501011161019c57565b6024359077ffffffffffffffffffffffffffffffffffffffffffffffff8216820361019c57565b9060407ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc83011261019c5760043567ffffffffffffffff9283821161019c578060238301121561019c57816004013593841161019c5760248460051b8301011161019c57602401919060243573ffffffffffffffffffffffffffffffffffffffff8116810361019c5790565b60005b8381106123b65750506000910152565b81810151838201526020016123a6565b907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f602093612402815180928187528780880191016123a3565b0116010190565b91908201809211610b4f57565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8114610b4f5760010190565b91908203918211610b4f57565b3d1561247b573d906124618261222e565b9161246f60405193846121ed565b82523d6000602084013e565b606090565b604061248e8183018361284b565b90818351918237206124a3606084018461284b565b90818451918237209260c06124bb60e083018361284b565b908186519182372091845195602087019473ffffffffffffffffffffffffffffffffffffffff833516865260208301358789015260608801526080870152608081013560a087015260a081013582870152013560e08501526101009081850152835261012083019167ffffffffffffffff918484108385111761217157838252845190206101408501908152306101608601524661018086015260608452936101a00191821183831017612171575251902090565b67ffffffffffffffff81116121715760051b60200190565b9061259282612570565b6040906125a260405191826121ed565b8381527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe06125d08295612570565b019160005b8381106125e25750505050565b60209082516125f081612155565b83516125fb816121a0565b600081526000849181838201528187820152816060818184015260809282848201528260a08201528260c08201528260e082015282610100820152826101208201528652818587015281898701528501528301528286010152016125d5565b805182101561266e5760209160051b010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b919081101561266e5760051b810135907ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffee18136030182121561019c570190565b9081602091031261019c575173ffffffffffffffffffffffffffffffffffffffff8116810361019c5790565b601f82602094937fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0938186528686013760008582860101520116010190565b7f2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4602073ffffffffffffffffffffffffffffffffffffffff61278a3485613c98565b936040519485521692a2565b919081101561266e5760051b810135907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa18136030182121561019c570190565b9035907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18136030182121561019c570180359067ffffffffffffffff821161019c57602001918160051b3603831361019c57565b3573ffffffffffffffffffffffffffffffffffffffff8116810361019c5790565b9035907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18136030182121561019c570180359067ffffffffffffffff821161019c5760200191813603831361019c57565b90357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe18236030181121561019c57016020813591019167ffffffffffffffff821161019c57813603831361019c57565b61012091813573ffffffffffffffffffffffffffffffffffffffff811680910361019c576129626129476129ba9561299b93855260208601356020860152612937604087018761289c565b9091806040880152860191612709565b612954606086018661289c565b908583036060870152612709565b6080840135608084015260a084013560a084015260c084013560c084015261298d60e085018561289c565b9084830360e0860152612709565b916129ac610100918281019061289c565b929091818503910152612709565b90565b60028054146129cc5760028055565b60046040517f3ee5aeb5000000000000000000000000000000000000000000000000000000008152fd5b926000905a93805194843573ffffffffffffffffffffffffffffffffffffffff811680910361019c5786526020850135602087015260808501356fffffffffffffffffffffffffffffffff90818116606089015260801c604088015260a086013560c088015260c086013590811661010088015260801c610120870152612a8060e086018661284b565b801561357b576034811061351d578060141161019c578060241161019c5760341161019c57602481013560801c60a0880152601481013560801c60808801523560601c60e08701525b612ad285612480565b60208301526040860151946effffffffffffffffffffffffffffff8660c08901511760608901511760808901511760a0890151176101008901511761012089015117116134bf57604087015160608801510160808801510160a08801510160c0880151016101008801510296835173ffffffffffffffffffffffffffffffffffffffff81511690612b66604085018561284b565b806131e4575b505060e0015173ffffffffffffffffffffffffffffffffffffffff1690600082156131ac575b6020612bd7918b828a01516000868a604051978896879586937f19822f7c00000000000000000000000000000000000000000000000000000000855260048501613db5565b0393f160009181613178575b50612c8b573d8c610800808311612c83575b50604051916020818401016040528083526000602084013e610e7e6040519283927f65c8fd4d000000000000000000000000000000000000000000000000000000008452600484015260606024840152600d60648401527f4141323320726576657274656400000000000000000000000000000000000000608484015260a0604484015260a48301906123c6565b915082612bf5565b9a92939495969798999a91156130f2575b509773ffffffffffffffffffffffffffffffffffffffff835116602084015190600052600160205260406000208160401c60005260205267ffffffffffffffff604060002091825492612cee84612416565b9055160361308d575a8503116130285773ffffffffffffffffffffffffffffffffffffffff60e0606093015116612d42575b509060a09184959697986040608096015260608601520135905a900301910152565b969550505a9683519773ffffffffffffffffffffffffffffffffffffffff60e08a01511680600052600060205260406000208054848110612fc3576080612dcd9a9b9c600093878094039055015192602089015183604051809d819582947f52b7512c0000000000000000000000000000000000000000000000000000000084528c60048501613db5565b039286f1978860009160009a612f36575b50612e86573d8b610800808311612e7e575b50604051916020818401016040528083526000602084013e610e7e6040519283927f65c8fd4d000000000000000000000000000000000000000000000000000000008452600484015260606024840152600d60648401527f4141333320726576657274656400000000000000000000000000000000000000608484015260a0604484015260a48301906123c6565b915082612df0565b9991929394959697989998925a900311612eab57509096959094939291906080612d20565b60a490604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152602760448201527f41413336206f766572207061796d6173746572566572696669636174696f6e4760648201527f61734c696d6974000000000000000000000000000000000000000000000000006084820152fd5b915098503d90816000823e612f4b82826121ed565b604081838101031261019c5780519067ffffffffffffffff821161019c57828101601f83830101121561019c578181015191612f868361222e565b93612f9460405195866121ed565b838552820160208483850101011161019c57602092612fba9184808701918501016123a3565b01519838612dde565b60848b604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601e60448201527f41413331207061796d6173746572206465706f73697420746f6f206c6f7700006064820152fd5b608490604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601e60448201527f41413236206f76657220766572696669636174696f6e4761734c696d697400006064820152fd5b608482604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601a60448201527f4141323520696e76616c6964206163636f756e74206e6f6e63650000000000006064820152fd5b600052600060205260406000208054808c11613113578b9003905538612c9c565b608484604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601760448201527f41413231206469646e2774207061792070726566756e640000000000000000006064820152fd5b9091506020813d6020116131a4575b81613194602093836121ed565b8101031261019c57519038612be3565b3d9150613187565b508060005260006020526040600020548a81116000146131d75750612bd7602060005b915050612b92565b6020612bd7918c036131cf565b833b61345a57604088510151602060405180927f570e1a360000000000000000000000000000000000000000000000000000000082528260048301528160008161323260248201898b612709565b039273ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690f1908115610db75760009161343b575b5073ffffffffffffffffffffffffffffffffffffffff811680156133d6578503613371573b1561330c5760141161019c5773ffffffffffffffffffffffffffffffffffffffff9183887fd51a9c61267aa6196961883ecf5ff2da6619c37dac0fa92122513fb32c032d2d604060e0958787602086015195510151168251913560601c82526020820152a391612b6c565b60848d604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152602060448201527f4141313520696e6974436f6465206d757374206372656174652073656e6465726064820152fd5b60848e604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152602060448201527f4141313420696e6974436f6465206d7573742072657475726e2073656e6465726064820152fd5b60848f604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601b60448201527f4141313320696e6974436f6465206661696c6564206f72204f4f4700000000006064820152fd5b613454915060203d602011610db057610da181836121ed565b3861327c565b60848d604051907f220266b6000000000000000000000000000000000000000000000000000000008252600482015260406024820152601f60448201527f414131302073656e64657220616c726561647920636f6e7374727563746564006064820152fd5b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f41413934206761732076616c756573206f766572666c6f7700000000000000006044820152fd5b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601d60248201527f4141393320696e76616c6964207061796d6173746572416e64446174610000006044820152fd5b5050600060e087015260006080870152600060a0870152612ac9565b9092915a906060810151916040928351967fffffffff00000000000000000000000000000000000000000000000000000000886135d7606084018461284b565b600060038211613b9f575b7f8dd7712f0000000000000000000000000000000000000000000000000000000094168403613a445750505061379d6000926136b292602088015161363a8a5193849360208501528b602485015260648401906128ec565b90604483015203906136727fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0928381018352826121ed565b61379189519485927e42dc5300000000000000000000000000000000000000000000000000000000602085015261020060248501526102248401906123c6565b613760604484018b60806101a091805173ffffffffffffffffffffffffffffffffffffffff808251168652602082015160208701526040820151604087015260608201516060870152838201518487015260a082015160a087015260c082015160c087015260e08201511660e0860152610100808201519086015261012080910151908501526020810151610140850152604081015161016085015260608101516101808501520151910152565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffdc83820301610204840152876123c6565b039081018352826121ed565b6020918183809351910182305af1600051988652156137bf575b505050505050565b909192939495965060003d8214613a3a575b7fdeaddead00000000000000000000000000000000000000000000000000000000810361385b57608487878051917f220266b600000000000000000000000000000000000000000000000000000000835260048301526024820152600f60448201527f41413935206f7574206f662067617300000000000000000000000000000000006064820152fd5b7fdeadaa510000000000000000000000000000000000000000000000000000000091929395949650146000146138c55750506138a961389e6138b8935a90612443565b608085015190612409565b9083015183611d748295613d65565b905b3880808080806137b7565b909261395290828601518651907ff62676f440ff169a3a9afdbf812e89e7f95975ee8e5c31214ffdef631c5f479273ffffffffffffffffffffffffffffffffffffffff9580878551169401516139483d610800808211613a32575b508a519084818301018c5280825260008583013e8a805194859485528401528a8301906123c6565b0390a35a90612443565b916139636080860193845190612409565b926000905a94829488519761397789613ccc565b948260e08b0151168015600014613a1857505050875116955b5a9003019560a06060820151910151019051860390818111613a04575b5050840290850151928184106000146139de57505080611e68575090816139d89293611d7481613d65565b906138ba565b6139ee9082849397950390613c98565b50611e68575090826139ff92613cf6565b6139d8565b6064919003600a02049094019338806139ad565b90919892509751613a2a575b50613990565b955038613a24565b905038613920565b8181803e516137d1565b613b97945082935090613a8c917e42dc53000000000000000000000000000000000000000000000000000000006020613b6b9501526102006024860152610224850191612709565b613b3a604484018860806101a091805173ffffffffffffffffffffffffffffffffffffffff808251168652602082015160208701526040820151604087015260608201516060870152838201518487015260a082015160a087015260c082015160c087015260e08201511660e0860152610100808201519086015261012080910151908501526020810151610140850152604081015161016085015260608101516101808501520151910152565b7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffdc83820301610204840152846123c6565b037fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe081018952886121ed565b60008761379d565b5081356135e2565b73ffffffffffffffffffffffffffffffffffffffff168015613c3a57600080809381935af1613bd4612450565b5015613bdc57565b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f41413931206661696c65642073656e6420746f2062656e6566696369617279006044820152fd5b60646040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f4141393020696e76616c69642062656e656669636961727900000000000000006044820152fd5b73ffffffffffffffffffffffffffffffffffffffff166000526000602052613cc66040600020918254612409565b80915590565b610120610100820151910151808214613cf257480180821015613ced575090565b905090565b5090565b9190917f49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f6080602083015192519473ffffffffffffffffffffffffffffffffffffffff946020868851169660e089015116970151916040519283526000602084015260408301526060820152a4565b60208101519051907f67b4fa9642f42120bf031f3051d1824b0fe25627945b27b8a6a65d5761d5482e60208073ffffffffffffffffffffffffffffffffffffffff855116940151604051908152a3565b613dcd604092959493956060835260608301906128ec565b9460208201520152565b8015613e6457600060408051613dec816121d1565b828152826020820152015273ffffffffffffffffffffffffffffffffffffffff811690604065ffffffffffff91828160a01c16908115613e5c575b60d01c92825191613e37836121d1565b8583528460208401521691829101524211908115613e5457509091565b905042109091565b839150613e27565b5060009060009056fea2646970667358221220b094fd69f04977ae9458e5ba422d01cd2d20dbcfca0992ff37f19aa07deec25464736f6c6343000817003360808060405234610016576101c3908161001c8239f35b600080fdfe6080600436101561000f57600080fd5b6000803560e01c63570e1a361461002557600080fd5b3461018a5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261018a576004359167ffffffffffffffff9081841161018657366023850112156101865783600401358281116101825736602482870101116101825780601411610182577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec810192808411610155577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0603f81600b8501160116830190838210908211176101555792846024819482600c60209a968b9960405286845289840196603889018837830101525193013560601c5af1908051911561014d575b5073ffffffffffffffffffffffffffffffffffffffff60405191168152f35b90503861012e565b6024857f4e487b710000000000000000000000000000000000000000000000000000000081526041600452fd5b8380fd5b8280fd5b80fdfea26469706673582212207adef8895ad3393b02fab10a111d85ea80ff35366aa43995f4ea20e67f29200664736f6c63430008170033";

bytes constant initCode = byteCode;

bytes32 constant salt = 0x90d8084deab30c2a37c45e8d47f49f2f7965183cb6990a98943ef94940681de3;
