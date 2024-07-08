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

use eyre::Result;

pub use redis;

pub mod lock;
pub mod namespace;
pub mod query;
pub mod rate_limit;

// From: https://github.com/upstash/redis-examples/blob/27558e2192f7f0cd5b22e1869a433bbe96bad64d/using_redis-rs/src/main.rs
/// Get a redis client from the environment variables
pub fn get_redis_client() -> Result<redis::Client> {
    // Get the environment variables
    let host = std::env::var("UPSTASH_REDIS_HOST")?;
    let password = std::env::var("UPSTASH_REDIS_PASSWORD")?;
    let port = std::env::var("UPSTASH_REDIS_PORT")?;

    // If host is localhost, connect to redis without password
    if host == "localhost" {
        let connection_link = format!("redis://{}:{}", host, port);
        return Ok(redis::Client::open(connection_link)?);
    }

    // Format the connection link
    let connection_link = format!("rediss://default:{}@{}:{}", password, host, port);

    // Return the client
    Ok(redis::Client::open(connection_link)?)
}
