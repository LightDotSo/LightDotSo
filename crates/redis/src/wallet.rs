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

use crate::namespace::WALLETS;
use lightdotso_tracing::tracing::info;
pub use redis;
use redis::{Commands, Connection, RedisResult};

/// Add a value to a set
pub fn add_to_wallets(con: &mut Connection, value: &str) -> RedisResult<()> {
    // Add the value to the set
    con.sadd(WALLETS.as_str(), value)?;

    // Return Ok
    Ok(())
}

/// Check if an array of values are present in a set
pub fn is_wallet_present(
    con: &mut Connection,
    members: Vec<String>,
) -> redis::RedisResult<Vec<bool>> {
    // Log the count of members to check
    info!("Checking {} members", members.len());

    // Create a pipeline
    let mut pipe = redis::pipe();

    // Add the commands to the pipeline
    for member in members {
        pipe.cmd("SISMEMBER").arg(WALLETS.as_str()).arg(member);
    }

    // Execute the pipeline
    pipe.query(con)
}
