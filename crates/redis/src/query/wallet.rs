// Copyright 2023-2024 Light.
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

use crate::namespace::WALLETS;
use lightdotso_tracing::tracing::info;
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
