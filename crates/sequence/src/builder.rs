// Copyright 2023-2024 Light
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

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Entire file's examples and configurations from: https://github.com/0xsequence/sequence.js/blob/e5659ab1a304ae48b28c843b0d99fb3b3f6bc0b1/packages/core/tests/v2/config.spec.ts#L4
// License: Apache-2.0

// Truly thank you for providing this out there as free and open source work.
// We are forever grateful

use crate::types::SignerNode;
use eyre::{eyre, Result};

// From: https://github.com/0xsequence/sequence.js/blob/e5659ab1a304ae48b28c843b0d99fb3b3f6bc0b1/packages/core/src/v2/config.ts#L317
// License: Apache-2.0
// Roots the nodes seuqentially in order.
pub fn rooted_node_builder(members: Vec<SignerNode>) -> Result<SignerNode> {
    if members.is_empty() {
        return Err(eyre!("Empty members vector"));
    }

    let mut acc = members[0].clone();
    for member in members.iter().skip(1) {
        acc = SignerNode {
            signer: None,
            left: Some(Box::new(acc)),
            right: Some(Box::new(member.clone())),
        }
    }
    Ok(acc)
}

#[cfg(test)]
mod tests {
    use crate::{
        types::{AddressSignatureLeaf, NestedLeaf, SignatureLeaf, Signer, SubdigestLeaf},
        utils::parse_hex_to_bytes32,
    };

    use super::*;

    #[test]
    fn test_config_1() -> Result<()> {
        let members = vec![
            SignerNode {
                signer: Some(Signer {
                    weight: Some(2),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse()?,
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                    }),
                }),
                left: None,
                right: None,
            },
        ];

        let node = rooted_node_builder(members)?;
        insta::assert_debug_snapshot!(node);

        Ok(())
    }

    #[test]
    fn test_config_2() -> Result<()> {
        let members = vec![
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000000",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000001",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000002",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000003",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000004",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000005",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000006",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x0000000000000000000000000000000000000000000000000000000000000007",
                        )?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
        ];

        let node = rooted_node_builder(members)?;
        insta::assert_debug_snapshot!(node);

        Ok(())
    }

    #[test]
    fn test_config_3() -> Result<()> {
        let members = vec![
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::NestedSignature(NestedLeaf {
                        internal_root: [0; 32].into(),
                        internal_threshold: 0,
                        external_weight: 3,
                        size: 3,
                    }),
                }),
                left: Some(Box::new(
                    SignerNode {
                        signer: None,
                        left: Some(Box::new(
                            SignerNode {
                                signer: Some(Signer {
                                    weight: Some(2),
                                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                                        address: "0x07ab71Fe97F9122a2dBE3797aa441623f5a59DB1".parse()?,
                                    }),
                                }),
                                left: None,
                                right: None,
                            },
                        )),
                        right: Some(Box::new(
                            SignerNode {
                                signer: Some(Signer {
                                    weight: None,
                                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                        hash: parse_hex_to_bytes32(
                                            "0x0000000000000000000000000000000000000000000000000000000000000006",
                                        )
                                        ?
                                        .into(),
                                    }),
                                }),
                                left: None,
                                right: None,
                            },
                        )),
                    },
                )),
                right: Some(Box::new(
                    SignerNode {
                        signer: Some(Signer {
                            weight: None,
                            leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                                hash: parse_hex_to_bytes32(
                                    "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df10000000000000000",
                                )
                                ?
                                .into(),
                            }),
                        }),
                        left: None,
                        right: None,
                    },
                )),
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0xb374baf809e388014912ca7020c8ef51ad68591db3f010f9e35a77c15d4d6bed",
                        )
                        ?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: None,
                    leaf: SignatureLeaf::SubdigestSignature(SubdigestLeaf {
                        hash: parse_hex_to_bytes32(
                            "0x787c83a19321fc70f8653f8faa39cce60bf26cac51c25df1b0634eb7ddbe0c60",
                        )
                        ?
                        .into(),
                    }),
                }),
                left: None,
                right: None,
            },
            SignerNode {
                signer: Some(Signer {
                    weight: Some(1),
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                    }),
                }),
                left: None,
                right: None,
            },
        ];

        let node = rooted_node_builder(members)?;
        insta::assert_debug_snapshot!(node);

        Ok(())
    }
}
