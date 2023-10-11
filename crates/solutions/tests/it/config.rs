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

use ethers::utils::hex;
use lightdotso_solutions::{
    config::WalletConfig,
    types::{ECDSASignatureLeaf, ECDSASignatureType, SignatureLeaf, Signer, SignerNode},
};

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_signatures() {
    let config_1: WalletConfig = WalletConfig {
      checkpoint:0,
      weight: 0,
      threshold:0,
      image_hash: [0;32].into(),
      internal_root: None,
      tree: SignerNode{
        left: None,
        right: None,
        signer: Some(Signer {
            weight: Some(1),
            leaf: SignatureLeaf::ECDSASignature(ECDSASignatureLeaf {
                address: "0x6a202a0ba513f87db9174e44300378b25f1950bb".parse().unwrap(),
                signature_type: ECDSASignatureType::ECDSASignatureTypeEthSign,
                signature: hex::decode("0x9fa7b7e8ed25088c413074818ac10ab3bbcddb120bbec85083f3ba254e5547d953fe615a6474fd365326244dedd7afa3911ad39c956ca096d721064d6b29055d1b").unwrap().try_into().unwrap(),
            }),
        }),
    }};

    let configs = vec![config_1];

    for (i, config) in configs.iter().enumerate() {}
}
