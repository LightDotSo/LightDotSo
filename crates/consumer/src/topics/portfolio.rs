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

use ethers::utils::to_checksum;
use eyre::Result;
use lightdotso_kafka::types::portfolio::PortfolioMessage;
use lightdotso_prisma::wallet;
use lightdotso_prisma::wallet_balance;
use lightdotso_prisma::PrismaClient;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::raw;
use prisma_client_rust::PrismaValue;
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
        // Parse the payload into a JSON object, `CovalentMessage`
        let payload: PortfolioMessage = serde_json::from_slice(payload.as_bytes())?;

        // Get the latest portfolio.
        let latest_portfolio: Vec<LatestPortfolioReturnType> = db
            ._query_raw(raw!(
                "SELECT SUM(balanceUSD) as balance
                    FROM WalletBalance
                    WHERE walletAddress = {}
                        AND isLatest = TRUE
                        AND isTestnet = FALSE
                        AND chainId = 0
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
                            0,
                            wallet::address::equals(to_checksum(&payload.address, None)),
                            vec![],
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
