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

use lightdotso_prisma::wallet;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Wallet root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct Wallet {
    /// The address of the wallet.
    pub address: String,
    /// The address of the factory.
    pub factory_address: String,
    /// The name of the wallet.
    pub name: String,
    /// The salt of the wallet.
    pub salt: String,
}

/// Implement From<wallet::Data> for Wallet.
impl From<wallet::Data> for Wallet {
    fn from(wallet: wallet::Data) -> Self {
        Self {
            address: wallet.address.to_string(),
            factory_address: wallet.factory_address.to_string(),
            name: wallet.name.to_string(),
            salt: wallet.salt.to_string(),
        }
    }
}

/// Wallet owner.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
#[schema(example = json!({"address": "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed", "weight": 1}))]
pub(crate) struct Owner {
    /// The address of the owner.
    pub address: String,
    /// The weight of the owner.
    pub weight: u8,
}
