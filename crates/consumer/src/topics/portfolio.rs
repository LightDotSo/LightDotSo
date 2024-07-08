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

use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_kafka::types::portfolio::PortfolioMessage;
use lightdotso_prisma::{chain, wallet, wallet_balance, PrismaClient};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{raw, PrismaValue};
use rdkafka::{message::BorrowedMessage, Message};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Clone, Debug, Deserialize)]
struct LatestPortfolioReturnType {
    balance: f64,
}

pub async fn portfolio_consumer(msg: &BorrowedMessage<'_>, db: Arc<PrismaClient>) -> Result<()> {
    // Convert the payload to a string
    let payload_opt = msg.payload_view::<str>();
    info!("payload_opt: {:?}", payload_opt);

    // If the payload is valid
    if let Some(Ok(payload)) = payload_opt {
        // Parse the payload into a JSON object, `PortfolioMessage`
        let payload: PortfolioMessage = serde_json::from_slice(payload.as_bytes())?;

        // Get the latest portfolio.
        let latest_portfolio: Vec<LatestPortfolioReturnType> = db
            ._query_raw(raw!(
                "SELECT SUM(balanceUSD) as balance
                    FROM WalletBalance
                    WHERE walletAddress = {}
                        AND isLatest = TRUE
                        AND isTestnet = FALSE
                        AND NOT (chainId = 0)
                ",
                PrismaValue::String(to_checksum(&payload.address, None))
            ))
            .exec()
            .await?;

        // If the length is more than 0, parse the balance.
        if !latest_portfolio.is_empty() {
            let latest_portfolio_balance = latest_portfolio[0].balance;
            info!("latest_portfolio: {:?}", latest_portfolio_balance);

            let _: Result<()> = db
                ._transaction()
                .run(|client| async move {
                    client
                        .wallet_balance()
                        .update_many(
                            vec![
                                wallet_balance::wallet_address::equals(to_checksum(
                                    &payload.address,
                                    None,
                                )),
                                wallet_balance::chain_id::equals(0),
                            ],
                            vec![wallet_balance::is_latest::set(false)],
                        )
                        .exec()
                        .await?;

                    client
                        .wallet_balance()
                        .create(
                            latest_portfolio_balance,
                            chain::id::equals(0),
                            wallet::address::equals(to_checksum(&payload.address, None)),
                            vec![wallet_balance::is_latest::set(true)],
                        )
                        .exec()
                        .await?;

                    Ok(())
                })
                .await;
        }
    }

    Ok(())
}
