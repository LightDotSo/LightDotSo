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

use namespace::{INDEXED_BLOCKS, WALLET};
pub use redis;
use redis::{Commands, Connection, RedisResult};

mod namespace;

// From: https://github.com/upstash/redis-examples/blob/27558e2192f7f0cd5b22e1869a433bbe96bad64d/using_redis-rs/src/main.rs
/// Get a redis client from the environment variables
pub fn get_redis_client() -> Result<redis::Client, Box<dyn std::error::Error>> {
    // Get the environment variables
    let host = std::env::var("UPSTASH_REDIS_HOST")?;
    let password = std::env::var("UPSTASH_REDIS_PASSWORD")?;
    let port = std::env::var("UPSTASH_REDIS_PORT")?;

    // If host is localhost, connect to redis without password
    if host == "localhost" {
        let connection_link = format!("redis://{}:{}", host, port);
        return redis::Client::open(connection_link).map_err(|e| e.into());
    }

    // Format the connection link
    let connection_link = format!("rediss://default:{}@{}:{}", password, host, port);

    // Return the client
    redis::Client::open(connection_link).map_err(|e| e.into())
}

/// Add a value to a set
pub fn add_to_wallets(con: &mut Connection, value: &str) -> RedisResult<()> {
    con.sadd(WALLET.as_str(), value)?;
    Ok(())
}

/// Check if an array of values are present in a set
pub fn is_wallet_present(
    con: &mut Connection,
    members: Vec<String>,
) -> redis::RedisResult<Vec<bool>> {
    let mut pipe = redis::pipe();

    for member in members {
        pipe.cmd("SISMEMBER").arg(WALLET.as_str()).arg(member);
    }

    pipe.query(con)
}

/// Set a range of values depending on the status
pub fn set_block_status(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    block_number: i64,
    status: bool,
) -> redis::RedisResult<()> {
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);
    if status {
        redis_conn.zadd(&key, block_number, block_number)?;
    }
    Ok(())
}

/// Get the most recent indexed block
pub fn get_most_recent_indexed_block(
    redis_conn: &mut redis::Connection,
    chain_id: &str,
) -> redis::RedisResult<i64> {
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);
    let result: Vec<i64> = redis_conn.zrevrange(&key, 0, 0)?;
    result
        .first()
        .cloned()
        .ok_or(redis::RedisError::from((redis::ErrorKind::TypeError, "No block found")))
}
