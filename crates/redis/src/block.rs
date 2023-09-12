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

use crate::namespace::INDEXED_BLOCKS;
pub use redis;
use redis::Commands;

// The size of each shard
const BLOCK_SHARD_SIZE: i64 = 1000;

/// Get the shard key for the block number
fn get_shard_key(chain_id: u64, block_number: i64) -> String {
    let shard_number = block_number / BLOCK_SHARD_SIZE;
    let start_range = shard_number * BLOCK_SHARD_SIZE;
    let end_range = start_range + BLOCK_SHARD_SIZE - 1;
    format!("indexed_blocks:{}:{}-{}", chain_id, start_range, end_range)
}

/// Set a range of values depending on the status
pub fn set_block_status(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    block_number: i64,
    status: bool,
) -> redis::RedisResult<()> {
    // Construct the key
    let key = get_shard_key(chain_id, block_number);

    // Set the block number depending on the status
    if status {
        redis_conn.zadd(&key, block_number, block_number)?;
    }

    // Check if the block number is present
    let key_score: i64 = redis_conn.zscore(&key, block_number)?;

    // If the block number is not present, raise an error
    if key_score != block_number {
        return Err(redis::RedisError::from((
            redis::ErrorKind::TypeError,
            "Block number not present",
        )));
    }

    Ok(())
}

/// Get the most recent indexed block
pub fn get_most_recent_indexed_block(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    most_recent_block: i64,
) -> redis::RedisResult<i64> {
    // Construct the current shard block
    let mut current_shard_block = most_recent_block - (most_recent_block % BLOCK_SHARD_SIZE);

    // Iterate through the shards until we find a block
    loop {
        let key = get_shard_key(chain_id, current_shard_block);
        let result: Vec<i64> = redis_conn.zrevrange(&key, 0, 0)?;

        if let Some(block_number) = result.first() {
            return Ok(*block_number);
        }

        // If we haven't found a block and we've reached the lowest shard (0-999), break.
        if current_shard_block == 0 {
            break;
        }

        // Move to the previous shard.
        current_shard_block -= BLOCK_SHARD_SIZE;
    }

    // Return an error if no block was found
    Err(redis::RedisError::from((redis::ErrorKind::TypeError, "No block found")))
}

/// Get the last N indexed blocks in descending order
pub fn get_last_n_indexed_blocks(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    most_recent_block: i64,
    n: i64,
) -> redis::RedisResult<Vec<i64>> {
    // Get the most recent indexed block
    let start_block = get_most_recent_indexed_block(redis_conn, chain_id, most_recent_block)?;

    let mut blocks = vec![];
    let mut current_block = start_block;
    let mut blocks_retrieved = 0;

    // Iterate through the shards until we have enough blocks
    while blocks_retrieved < n {
        // Construct the key
        let key = get_shard_key(chain_id, current_block);
        // Get the blocks in the shard in descending order
        let shard_blocks: Vec<i64> = redis_conn.zrevrange(&key, 0, BLOCK_SHARD_SIZE as isize)?;

        if !shard_blocks.is_empty() {
            // Extend the blocks vector with the shard blocks
            blocks.extend_from_slice(&shard_blocks);
            // Update the blocks retrieved count
            blocks_retrieved += shard_blocks.len() as i64;
            // Move to the previous shard
            current_block = *shard_blocks.last().unwrap() - 1;
        } else {
            if current_block == 0 {
                break;
            }
            // Move to the previous shard
            current_block -= BLOCK_SHARD_SIZE;
        }
    }

    // Trim the blocks vector to the requested size (in case we retrieved extra)
    blocks.truncate(n as usize);

    Ok(blocks)
}

/// Get the indexed percentage for the last N blocks
pub fn get_last_n_indexed_percentage(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    most_recent_block: i64,
    n: i64,
) -> redis::RedisResult<f64> {
    // Get the last N indexed blocks
    let last_n_blocks = get_last_n_indexed_blocks(redis_conn, chain_id, most_recent_block, n)?;

    // If there are no blocks, return 0
    let indexed_percentage = if last_n_blocks.len() > 1 {
        // Get the first and last block
        let first_block = *last_n_blocks.first().unwrap();
        let last_block = *last_n_blocks.last().unwrap();
        // Calculate the total number of blocks
        let total_blocks = first_block - last_block + 1;
        // Calculate the number of indexed blocks
        let indexed_blocks_count = last_n_blocks.len() as i64;
        // Calculate the indexed percentage
        (indexed_blocks_count as f64 / total_blocks as f64) * 100.0
    } else {
        0.0
    };

    Ok(indexed_percentage)
}

/// Get whether the block is indexed
pub fn get_indexed_status(
    redis_conn: &mut redis::Connection,
    chain_id: u64,
    block_number: i64,
) -> redis::RedisResult<bool> {
    // Construct the key
    let key = get_shard_key(chain_id, block_number);

    // Get the score for the block number
    let score: Option<f64> = redis_conn.zscore(&key, block_number)?;

    // Return whether the block is indexed
    Ok(score.is_some())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_shard_key() {
        // Basic tests for ranges.
        assert_eq!(get_shard_key(1, 50), "indexed_blocks:1:0-999");
        assert_eq!(get_shard_key(1, 999), "indexed_blocks:1:0-999");
        assert_eq!(get_shard_key(1, 1000), "indexed_blocks:1:1000-1999");
        assert_eq!(get_shard_key(1, 1500), "indexed_blocks:1:1000-1999");
        assert_eq!(get_shard_key(1, 2000), "indexed_blocks:1:2000-2999");

        // Checking for different chain IDs.
        assert_eq!(get_shard_key(2, 50), "indexed_blocks:2:0-999");
        assert_eq!(get_shard_key(2, 1500), "indexed_blocks:2:1000-1999");
    }
}
