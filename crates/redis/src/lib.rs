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

pub use redis;
use redis::{Commands, Connection, RedisResult};

// From: https://github.com/upstash/redis-examples/blob/27558e2192f7f0cd5b22e1869a433bbe96bad64d/using_redis-rs/src/main.rs
/// Get a redis client from the environment variables
pub fn get_redis_client() -> Result<redis::Client, Box<dyn std::error::Error>> {
    // Get the environment variables
    let host = std::env::var("UPSTASH_REDIS_HOST")?;
    let password = std::env::var("UPSTASH_REDIS_PASSWORD")?;
    let port = std::env::var("UPSTASH_REDIS_PORT")?;

    // Format the connection link
    let connection_link = format!("rediss://default:{}@{}:{}", password, host, port);

    // Return the client
    redis::Client::open(connection_link).map_err(|e| e.into())
}

/// Add a value to a set
pub fn add_to_set(con: &mut Connection, key: &str, value: &str) -> RedisResult<()> {
    con.sadd(key, value)?;
    Ok(())
}

pub fn is_all_members_present(
    con: &mut Connection,
    key: &str,
    members: Vec<String>,
) -> redis::RedisResult<Vec<bool>> {
    let mut pipe = redis::pipe();

    for member in members {
        pipe.cmd("SISMEMBER").arg(key).arg(member);
    }

    pipe.query(con)
}
