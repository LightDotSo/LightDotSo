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

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Portfolio root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Portfolio {
    /// The balance of the portfolio.
    pub balance: f64,
    /// The change of the balance in the last 24 hours.
    pub balance_change_24h: f64,
    /// The percentage change of the balance in the last 24 hours.
    pub balance_change_24h_percentage: f64,
    /// The historical balances of the portfolio.
    pub balances: Vec<PortfolioBalanceDate>,
}

/// Portfolio to do.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct PortfolioBalanceDate {
    /// The balance of the portfolio.
    pub balance: f64,
    /// The date of the balance.
    pub date: String,
}
