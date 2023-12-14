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

use lightdotso_prisma::{configuration, owner};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Configuration root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct Configuration {
    /// The id of the configuration.
    id: String,
    /// The address of the configuration.
    address: String,
    /// The image hash of the configuration.
    image_hash: String,
    /// The checkpoint of the configuration.
    checkpoint: i64,
    /// The threshold of the configuration.
    threshold: i64,
    /// The owners of the configuration.
    owners: Vec<ConfigurationOwner>,
}

/// Configuration Owner.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
pub(crate) struct ConfigurationOwner {
    /// The id of the owner.
    id: String,
    /// The index of the owner.
    index: i32,
    /// The address of the owner.
    address: String,
    /// The weight of the owner.
    weight: i64,
}

/// Implement From<configuration::Data> for Configuration.
impl From<configuration::Data> for Configuration {
    fn from(configuration: configuration::Data) -> Self {
        Self {
            id: configuration.id.to_string(),
            address: configuration.address.to_string(),
            image_hash: configuration.image_hash.to_string(),
            checkpoint: configuration.checkpoint,
            threshold: configuration.threshold,
            owners: configuration.owners.map_or(Vec::new(), |owners| {
                owners.into_iter().map(ConfigurationOwner::from).collect()
            }),
        }
    }
}

/// Implement From<owner::Data> for Owner.
impl From<owner::Data> for ConfigurationOwner {
    fn from(owner: owner::Data) -> Self {
        Self {
            id: owner.id.to_string(),
            address: owner.address.to_string(),
            index: owner.index,
            weight: owner.weight,
        }
    }
}
