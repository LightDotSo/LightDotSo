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

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Portfolio root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
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
pub(crate) struct PortfolioBalanceDate {
    /// The balance of the portfolio.
    pub balance: f64,
    /// The date of the balance.
    pub date: String,
}
