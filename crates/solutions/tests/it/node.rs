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

use ethers::types::Address;
use lightdotso_solutions::{
    module::SigModule,
    types::{AddressSignatureLeaf, NodeLeaf, SignatureLeaf, Signer, SignerNode},
};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_node_simple() {
    let module = SigModule::new(
        Address::zero(),
        1,
        [0; 32],
        Some(SignerNode {
            signer: Some(Signer {
                address: Address::zero(),
                weight: 1,
                leaf: SignatureLeaf::NodeSignature(NodeLeaf {}),
            }),
            left: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    address: "0x1111111111111111111111111111111111111111".parse().unwrap(),
                    weight: 3,
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x1111111111111111111111111111111111111111".parse().unwrap(),
                    }),
                }),
            })),
            right: Some(Box::new(SignerNode {
                left: None,
                right: None,
                signer: Some(Signer {
                    address: "0x2222222222222222222222222222222222222222".parse().unwrap(),
                    weight: 3,
                    leaf: SignatureLeaf::AddressSignature(AddressSignatureLeaf {
                        address: "0x2222222222222222222222222222222222222222".parse().unwrap(),
                    }),
                }),
            })),
        }),
    );

    let config = module.get_initial_image_hash_config(5, 1).unwrap();
    assert_eq!(
        config.image_hash_of_wallet_config().unwrap(),
        "0xd491b760c0ac4b1572e361f32e3c349a8db7886b683226014764019465a52592"
    );
}
