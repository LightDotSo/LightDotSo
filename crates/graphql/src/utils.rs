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

use crate::constants::THE_GRAPH_HOSTED_SERVICE_URLS;
use eyre::{eyre, Result};

/// A helper function to get the graphql url for a given chain id.
pub fn get_graphql_url(chain_id: u64) -> Result<String> {
    let url = THE_GRAPH_HOSTED_SERVICE_URLS
        .get(&chain_id)
        .ok_or_else(|| eyre!("Chain id {} not supported", chain_id))?;
    Ok(url.to_string())
}
