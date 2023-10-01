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

use crate::constants::THE_GRAPH_HOSTED_SERVICE_URLS;
use eyre::Result;

/// A helper function to get the graphql url for a given chain id.
pub fn get_graphql_url(chain_id: u64) -> Result<String> {
    let url = THE_GRAPH_HOSTED_SERVICE_URLS
        .get(&chain_id)
        .ok_or_else(|| eyre::eyre!("Chain id {} not supported", chain_id))?;
    Ok(url.to_string())
}
