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
    // Add the value to the set
    con.sadd(WALLET.as_str(), value)?;

    // Return Ok
    Ok(())
}

/// Check if an array of values are present in a set
pub fn is_wallet_present(
    con: &mut Connection,
    members: Vec<String>,
) -> redis::RedisResult<Vec<bool>> {
    // Create a pipeline
    let mut pipe = redis::pipe();

    // Add the commands to the pipeline
    for member in members {
        pipe.cmd("SISMEMBER").arg(WALLET.as_str()).arg(member);
    }

    // Execute the pipeline
    pipe.query(con)
}

/// Set a range of values depending on the status
pub fn set_block_status(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    block_number: i64,
    status: bool,
) -> redis::RedisResult<()> {
    // Construct the key
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);

    // Set the block number depending on the status
    if status {
        redis_conn.zadd(&key, block_number, block_number)?;
    }

    // Return Ok
    Ok(())
}

/// Get the most recent indexed block
pub fn get_most_recent_indexed_block(
    redis_conn: &mut redis::Connection,
    chain_id: &str,
) -> redis::RedisResult<i64> {
    // Construct the key
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);

    // Get the most recent indexed block
    let result: Vec<i64> = redis_conn.zrevrange(&key, 0, 0)?;

    // Return the most recent indexed block
    result
        .first()
        .cloned()
        .ok_or(redis::RedisError::from((redis::ErrorKind::TypeError, "No block found")))
}

/// Get the indexed percentage
pub fn get_indexed_percentage(
    redis_conn: &mut redis::Connection,
    chain_id: &str,
    total_blocks: i64,
) -> redis::RedisResult<f64> {
    // If the total number of blocks is zero, return zero to avoid division by zero.
    if total_blocks == 0 {
        return Ok(0.0);
    }

    // Construct the key
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);

    // Get the number of indexed blocks
    let indexed_blocks_count: i64 = redis_conn.zcard(&key)?;

    // Return the indexed percentage
    Ok((indexed_blocks_count as f64 / total_blocks as f64) * 100.0)
}

/// Get the last N indexed blocks in descending order
pub fn get_last_n_indexed_blocks(
    redis_conn: &mut redis::Connection,
    chain_id: &str,
    n: i64,
) -> redis::RedisResult<Vec<i64>> {
    // Construct the key
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);

    // This will return the last N blocks in descending order.
    let n_isize: isize = n as isize;

    // Return the last N indexed blocks
    redis_conn.zrevrange(&key, 0, n_isize)
}

/// Get the indexed percentage for the last N blocks
pub fn get_last_n_indexed_percentage(
    redis_conn: &mut redis::Connection,
    chain_id: &str,
    n: i64,
) -> redis::RedisResult<f64> {
    // Construct the key
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);

    // Get the block numbers for the last N blocks
    let n_isize: isize = n as isize;
    let last_n_blocks: Vec<i64> = redis_conn.zrevrange(&key, 0, n_isize - 1)?;

    // Calculate the indexed percentage for the last N blocks
    let indexed_percentage = (last_n_blocks.len() as f64 / n as f64) * 100.0;

    // Return the indexed percentage
    Ok(indexed_percentage)
}

/// Get whether the block is indexed
pub fn get_indexed_status(
    redis_conn: &mut redis::Connection,
    chain_id: &str,
    block_number: i64,
) -> redis::RedisResult<bool> {
    // Construct the key
    let key = format!("{}:{}", *INDEXED_BLOCKS, chain_id);

    // Get the score for the block number
    let score: Option<f64> = redis_conn.zscore(&key, block_number)?;

    // Return whether the block is indexed
    Ok(score.is_some())
}
