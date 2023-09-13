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

pub mod block;
mod namespace;
pub mod wallet;

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
