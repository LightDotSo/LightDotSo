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

use super::{
    error::PortfolioError,
    types::{Portfolio, PortfolioBalanceDate},
};
use crate::{
    result::{AppError, AppJsonResult},
    tags::PORTFOLIO_TAG,
};
use alloy::primitives::Address;
use autometrics::autometrics;
use axum::{
    extract::{Query, State},
    Json,
};
use lightdotso_db::models::portfolio::{get_portfolio, get_portfolio_list};
use lightdotso_state::ClientState;
use lightdotso_tracing::tracing::info;
use prisma_client_rust::bigdecimal::ToPrimitive;
use serde::Deserialize;
use utoipa::IntoParams;

// -----------------------------------------------------------------------------
// Query
// -----------------------------------------------------------------------------

#[derive(Debug, Deserialize, Default, IntoParams)]
#[serde(rename_all = "snake_case")]
#[into_params(parameter_in = Query)]
pub struct GetQuery {
    /// The address of the portfolio.
    pub address: String,
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

#[derive(Clone, Debug, Deserialize)]
struct PortfolioQueryReturnType {
    balance: f64,
    date: prisma_client_rust::chrono::DateTime<::prisma_client_rust::chrono::FixedOffset>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

/// Implement From<PortfolioQueryReturnType> for Portfolio.
impl From<PortfolioQueryReturnType> for PortfolioBalanceDate {
    fn from(port: PortfolioQueryReturnType) -> Self {
        Self { balance: port.balance, date: port.date.to_rfc3339() }
    }
}

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/// Get a portfolio
///
/// Gets a portfolio by address.
#[utoipa::path(
        get,
        path = "/portfolio/get",
        params(
            GetQuery
        ),
        responses(
            (status = 200, description = "Portfolio returned successfully", body = Portfolio),
            (status = 404, description = "Portfolio not found", body = PortfolioError),
        ),
        tag = PORTFOLIO_TAG.as_str()
    )]
#[autometrics]
pub(crate) async fn v1_portfolio_get_handler(
    get_query: Query<GetQuery>,
    State(state): State<ClientState>,
) -> AppJsonResult<Portfolio> {
    // -------------------------------------------------------------------------
    // Parse
    // -------------------------------------------------------------------------

    // Get the get query.
    let Query(query) = get_query;

    let parsed_query_address: Address = query.address.parse()?;

    // -------------------------------------------------------------------------
    // DB
    // -------------------------------------------------------------------------

    // Get the latest portfolio.
    let latest_portfolio = get_portfolio(&state.pool, parsed_query_address).await?;
    info!("latest_portfolio: {:?}", latest_portfolio);

    // If the portfolio is not found, return a 404.
    if latest_portfolio.is_none() {
        return Err(AppError::NotFound);
    }

    // Get the past portfolio.
    let past_portfolio =
        get_portfolio_list(&state.pool, parsed_query_address, None, "day", 2).await?;
    info!("past_portfolio: {:?}", past_portfolio);

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    // Get the balance from the result array.
    let balance = if let Some(portfolio) = latest_portfolio {
        portfolio.balance_usd.to_f64().unwrap_or(0.0)
    } else {
        0.0
    };

    // Get the 24h price change from the result array.
    let balance_change_24h = if past_portfolio.len() > 1 {
        past_portfolio[0].balance_usd.to_f64().unwrap_or(0.0) -
            past_portfolio[1].balance_usd.to_f64().unwrap_or(0.0)
    } else {
        0.0
    };

    // Calculate 24h price change percentage
    let balance_change_24h_percentage = if past_portfolio.len() > 1 &&
        past_portfolio[1].balance_usd.to_f64().unwrap_or(0.0) != 0.0
    {
        // Compare against the previous day's balance.
        (balance_change_24h / past_portfolio[1].balance_usd.to_f64().unwrap_or(0.0)) * 100.0
    } else {
        0.0
    };

    // Combine the latest portfolio(1) and past portfolio(n) into one vector.
    let mut portfolio_dates: Vec<PortfolioBalanceDate> = Vec::new();
    (0..past_portfolio.len()).for_each(|i| {
        portfolio_dates.push(past_portfolio[i].clone().into());
    });

    let portfolio = Portfolio {
        balance,
        balance_change_24h,
        balance_change_24h_percentage,
        balances: portfolio_dates,
    };

    Ok(Json::from(portfolio))
}
