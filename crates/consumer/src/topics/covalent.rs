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

#![allow(clippy::unwrap_used)]

use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_contracts::constants::MAINNET_CHAIN_IDS;
use lightdotso_covalent::get_token_balances;
use lightdotso_kafka::types::covalent::CovalentMessage;
use lightdotso_prisma::token;
use lightdotso_prisma::wallet_balance;
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::info;
use rdkafka::{message::BorrowedMessage, Message};
use std::sync::Arc;

pub async fn covalent_consumer(msg: &BorrowedMessage<'_>, db: Arc<PrismaClient>) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `CovalentMessage`
        let payload: CovalentMessage = serde_json::from_slice(payload.as_bytes())?;

        // Log the payload
        let mut balances = get_token_balances(
            &payload.chain_id.to_string(),
            &to_checksum(&payload.address, None),
            None,
            None,
        )
        .await?;

        // Replace the addresses of `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` with `0x0000000000000000000000000000000000000000`
        // This is because Covalent uses the former for ETH, but we use the latter.
        for item in &mut balances.data.items {
            if item.contract_address
                == Some("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee".to_string())
                || item.contract_address
                    == Some("0x0000000000000000000000000000000000001010".to_string())
            {
                item.contract_address =
                    Some("0x0000000000000000000000000000000000000000".to_string());
            }
        }

        // Create the tokens
        db.token()
            .create_many(
                balances
                    .data
                    .items
                    .iter()
                    .map(|item| {
                        (
                            item.contract_ticker_symbol.clone().unwrap(),
                            item.contract_address.clone().unwrap(),
                            payload.chain_id as i64,
                            item.contract_decimals.unwrap(),
                            vec![token::name::set(item.contract_name.clone())],
                        )
                    })
                    .collect::<Vec<_>>(),
            )
            .skip_duplicates()
            .exec()
            .await?;

        // Find the tokens
        let tokens = db
            .token()
            .find_many(
                balances
                    .data
                    .items
                    .iter()
                    .map(|item| {
                        token::address_chain_id(
                            item.contract_address.clone().unwrap(),
                            payload.chain_id as i64,
                        )
                    })
                    .collect::<Vec<_>>(),
            )
            .exec()
            .await?;

        // Create a token price for each token
        db.token_price()
            .create_many(
                tokens
                    .iter()
                    .map(|token| {
                        let data = balances
                            .data
                            .items
                            .iter()
                            .find(|item| {
                                item.contract_address.as_ref().map(|addr| addr.to_lowercase())
                                    == Some(token.clone().address.clone().to_lowercase())
                            })
                            .unwrap();
                        (data.quote_rate.unwrap_or(0.0), token.clone().id, vec![])
                    })
                    .collect::<Vec<_>>(),
            )
            .exec()
            .await?;

        let _: Result<()> = db
            ._transaction()
            .run(|client| async move {
                client
                    .wallet_balance()
                    .update_many(
                        vec![wallet_balance::wallet_address::equals(to_checksum(
                            &payload.address,
                            None,
                        ))],
                        vec![wallet_balance::is_latest::set(false)],
                    )
                    .exec()
                    .await?;

                client
                    .wallet_balance()
                    .create_many(
                        balances
                            .data
                            .items
                            .iter()
                            .map(|item| {
                                // Find the token
                                let token = tokens
                                    .iter()
                                    .find(|token| {
                                        token.address.clone().to_lowercase()
                                            == item.contract_address.clone().unwrap()
                                    })
                                    .unwrap();

                                (
                                    item.quote.unwrap_or(0.0),
                                    payload.chain_id as i64,
                                    to_checksum(&payload.address, None),
                                    vec![
                                        wallet_balance::amount::set(Some(
                                            item.balance
                                                .as_ref()
                                                .map(|balance| balance.parse::<i64>().unwrap_or(0))
                                                .unwrap_or(0),
                                        )),
                                        wallet_balance::stable::set(Some(
                                            item.balance_type
                                                .as_ref()
                                                .map(|balance_type| balance_type == "stablecoin")
                                                .unwrap_or(false),
                                        )),
                                        wallet_balance::token_id::set(Some(token.id.to_string())),
                                        wallet_balance::is_spam::set(item.is_spam),
                                        wallet_balance::is_latest::set(true),
                                        wallet_balance::is_testnet::set(
                                            !MAINNET_CHAIN_IDS
                                                .contains_key(&(payload.chain_id as u64)),
                                        ),
                                    ],
                                )
                            })
                            .collect::<Vec<_>>(),
                    )
                    .exec()
                    .await?;

                Ok(())
            })
            .await;
    }

    Ok(())
}
