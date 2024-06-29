// Copyright 2023-2024 Light.
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

use crate::types::{AppJsonResult, Database};
use autometrics::autometrics;
use axum::extract::Json;
use ethers::{types::H256, utils::to_checksum};
use lightdotso_prisma::wallet;
use lightdotso_tracing::tracing::info;

// -----------------------------------------------------------------------------
// Upsert
// -----------------------------------------------------------------------------

/// Create a new wallet.
#[autometrics]
pub async fn upsert_wallet_with_configuration(
    db: Database,
    address: ethers::types::H160,
    chain_id: i64,
    salt: H256,
    factory_address: ethers::types::H160,
) -> AppJsonResult<wallet::Data> {
    info!("Creating wallet at address: {:?} chain_id: {:?}", address, chain_id);

    let wallet = db
        .wallet()
        .upsert(
            wallet::address::equals(to_checksum(&address, None)),
            wallet::create(
                to_checksum(&address, None),
                format!("{:?}", salt),
                to_checksum(&factory_address, None),
                vec![],
            ),
            vec![],
        )
        .exec()
        .await?;

    Ok(Json::from(wallet))
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

// Tests
#[cfg(test)]
mod tests {
    // use super::*;
    use ethers::types::Address;
    // use lightdotso_prisma::PrismaClient;

    #[test]
    fn test_display_address() {
        let address = Address::zero();
        assert_eq!(format!("{:?}", address), "0x0000000000000000000000000000000000000000");
    }

    // #[tokio::test]
    // FIXME: Blocked by `create_wallet_with_configuration_and_owners`
    // async fn test_create_wallet() {
    //     // Set the mocked db client
    //     let (client, _mock) = PrismaClient::_mock();
    //     let client = Arc::new(client);

    //     // Check the wallet is created
    //     _mock
    //         .expect(
    //             client.wallet().create(
    //                 format!("{:?}", Address::zero()),
    //                 3_i64,
    //                 format!("{:?}", Address::zero()),
    //                 vec![wallet::testnet::set(false)],
    //             ),
    //             wallet::Data {
    //                 id: "".to_string(),
    //                 address: format!("{:?}", Address::zero()),
    //                 chain_id: 3_i64,
    //                 factory_address: format!("{:?}", Address::zero()),
    //                 testnet: false,
    //                 created_at: DateTime::<FixedOffset>::from_utc(
    //                     NaiveDateTime::from_timestamp_opt(0_i64, 0).unwrap(),
    //                     FixedOffset::east_opt(0).unwrap(),
    //                 ),
    //                 updated_at: DateTime::<FixedOffset>::from_utc(
    //                     NaiveDateTime::from_timestamp_opt(0_i64, 0).unwrap(),
    //                     FixedOffset::east_opt(0).unwrap(),
    //                 ),
    //                 configuration: None,
    //                 users: Some(vec![]),
    //             },
    //         )
    //         .await;

    //     // Create a wallet
    //     let wallet =
    //         create_wallet(client, Address::zero(), 3_i64, Address::zero(), Some(false)).await;

    //     if let Ok(wallet) = wallet {
    //         assert_eq!(wallet.address, format!("{:?}", Address::zero()));
    //         assert_eq!(wallet.chain_id, 3_i64,);
    //         assert!(!wallet.testnet);
    //         assert_eq!(wallet.created_at.timestamp(), 0);
    //         assert_eq!(wallet.updated_at.timestamp(), 0);
    //         assert_eq!(wallet.users.clone().unwrap().len(), 0);
    //     }
    // }
}
