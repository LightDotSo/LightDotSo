// Copyright 2023-2024 Light
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

use crate::routes::user::types::User;
use lightdotso_prisma::{configuration, owner};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/// Configuration root type.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
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
    owners: Vec<ConfigurationOperationOwner>,
}

/// Configuration Owner.
#[derive(Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "snake_case")]
pub(crate) struct ConfigurationOperationOwner {
    /// The id of the owner.
    id: String,
    /// The index of the owner.
    index: i32,
    /// The address of the owner.
    address: String,
    /// The weight of the owner.
    weight: i64,
    /// The user of the owner.
    user: Option<User>,
}

// -----------------------------------------------------------------------------
// From
// -----------------------------------------------------------------------------

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
                owners.into_iter().map(ConfigurationOperationOwner::from).collect()
            }),
        }
    }
}

/// Implement From<owner::Data> for Owner.
impl From<owner::Data> for ConfigurationOperationOwner {
    fn from(owner: owner::Data) -> Self {
        Self {
            id: owner.id.to_string(),
            address: owner.address.to_string(),
            index: owner.index,
            weight: owner.weight,
            user: owner.user.and_then(|maybe_user| maybe_user.map(|user| User::from(*user))),
        }
    }
}
