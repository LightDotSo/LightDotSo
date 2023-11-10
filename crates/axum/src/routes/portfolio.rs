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

use crate::{
    result::{AppError, AppJsonResult},
    state::AppState,
};
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use ethers_main::{types::H160, utils::to_checksum};
use lightdotso_tracing::tracing::info;
use prisma_client_rust::{raw, PrismaValue};
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Deserialize, Default, IntoParams)]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the portfolio.
    pub address: String,
}

/// Portfolio operation errors
#[derive(Serialize, Deserialize, ToSchema)]
pub(crate) enum PortfolioError {
    // Portfolio query error.
    #[schema(example = "Bad request")]
    BadRequest(String),
    /// Portfolio already exists conflict.
    #[schema(example = "Portfolio already exists")]
    Conflict(String),
}

/// Item to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Portfolio {
    price_change_24h: f64,
    balances: Vec<PortfolioBalanceDate>,
}

/// Portfolio to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct PortfolioBalanceDate {
    balance: f64,
    date: String,
}

#[derive(Clone, Debug, Deserialize)]
struct PortfolioQueryReturnType {
    balance: f64,
    date: prisma_client_rust::chrono::DateTime<::prisma_client_rust::chrono::FixedOffset>,
}

// Implement From<PortfolioQueryReturnType> for Portfolio.
impl From<PortfolioQueryReturnType> for PortfolioBalanceDate {
    fn from(port: PortfolioQueryReturnType) -> Self {
        Self { balance: port.balance, date: port.date.to_rfc3339() }
    }
}

#[autometrics]
pub(crate) fn router() -> Router<AppState> {
    Router::new().route("/portfolio/get", get(v1_portfolio_get_handler))
}

/// Get a portfolio
#[utoipa::path(
        get,
        path = "/portfolio/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Portfolio returned successfully", body = Portfolio),
            (status = 404, description = "Portfolio not found", body = PortfolioError),
        )
    )]
#[autometrics]
async fn v1_portfolio_get_handler(
    get: Query<GetQuery>,
    State(client): State<AppState>,
) -> AppJsonResult<Portfolio> {
    // Get the get query.
    let Query(query) = get;

    let parsed_query_address: H160 = query.address.parse()?;
    let checksum_address = to_checksum(&parsed_query_address, None);

    // Get the latest portfolio.
    let latest_portfolio: Vec<PortfolioQueryReturnType> = client
        .clone()
        .client
        .unwrap()
        ._query_raw(raw!(
            "SELECT balanceUSD as balance, timestamp as date
            FROM WalletBalance
            WHERE walletAddress = {} AND chainId = 0
            ORDER BY timestamp DESC
            LIMIT 1",
            PrismaValue::String(checksum_address.clone())
        ))
        .exec()
        .await?;
    info!("latest_portfolio: {:?}", latest_portfolio);

    // If the portfolio is not found, return a 404.
    if latest_portfolio.is_empty() {
        return Err(AppError::NotFound);
    }

    // Get the past portfolio.
    let past_portfolio: Vec<PortfolioQueryReturnType> = client
        .clone()
        .client
        .unwrap()
        ._query_raw(raw!(
            "SELECT AVG(balanceUSD) as balance, DATE(timestamp) as date
            FROM WalletBalance
            WHERE walletAddress = {} AND chainId = 0
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp) DESC",
            PrismaValue::String(checksum_address)
        ))
        .exec()
        .await?;
    info!("past_portfolio: {:?}", past_portfolio);

    // Get the 24h price change from the result array.
    let balance_change_24h = if past_portfolio.len() > 1 {
        latest_portfolio[0].balance - past_portfolio[0].balance
    } else {
        0.0
    };

    // Combine the latest portfolio(1) and past portfolio(n) into one vector.
    let mut portfolio_dates: Vec<PortfolioBalanceDate> = Vec::new();
    portfolio_dates.push(latest_portfolio[0].clone().into());
    (0..past_portfolio.len()).for_each(|i| {
        portfolio_dates.push(past_portfolio[i].clone().into());
    });

    let portfolio = Portfolio { price_change_24h: balance_change_24h, balances: portfolio_dates };

    Ok(Json::from(portfolio))
}
