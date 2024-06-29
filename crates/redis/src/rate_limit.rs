// Copyright 2023-2024 Light
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

// From the awesome blog: https://outcrawl.com/rust-redis-rate-limiting
// From: https://github.com/tinrab/rusty-redis-rate-limiting/blob/46d95040708df92d46cef22d319d0182e12a2c0c/src/rate_limiter.rs
// License: MIT

use eyre::Result;
use redis::{Client, Commands, Connection};
use std::{
    sync::Arc,
    time,
    time::{Duration, SystemTime},
};

const KEY_PREFIX: &str = "rate-limit";

pub struct RateLimiter {
    conn: Connection,
}

impl RateLimiter {
    pub fn open(client: Arc<Client>) -> Result<Self> {
        let conn = client.get_connection()?;
        Ok(RateLimiter { conn })
    }

    /// Returns the count in the current time window.
    pub fn fetch_fixed_window(
        &mut self,
        resource: &str,
        subject: &str,
        size: Duration,
    ) -> Result<u64> {
        let now = SystemTime::now().duration_since(time::UNIX_EPOCH)?;
        let window = (now.as_secs() / size.as_secs()) * size.as_secs();
        let key = format!("{}:{}:{}:{}", KEY_PREFIX, resource, subject, window);

        let count: u64 = self.conn.get(key)?;
        Ok(count)
    }

    /// Records an access to `resource` by `subject` with fixed window algorithm.
    /// Size of time window equals the `size` in seconds.
    pub fn record_fixed_window(
        &mut self,
        resource: &str,
        subject: &str,
        size: Duration,
    ) -> Result<u64> {
        let now = SystemTime::now().duration_since(time::UNIX_EPOCH)?;
        let window = (now.as_secs() / size.as_secs()) * size.as_secs();
        let key = format!("{}:{}:{}:{}", KEY_PREFIX, resource, subject, window);

        let (count,): (u64,) = redis::pipe()
            .atomic()
            .incr(&key, 1)
            .expire(&key, size.as_secs() as usize)
            .ignore()
            .query(&mut self.conn)?;
        Ok(count)
    }

    /// Returns the log's count.
    pub fn fetch_sliding_log(&mut self, resource: &str, subject: &str) -> Result<u64> {
        let key = format!("{}:{}:{}", KEY_PREFIX, resource, subject);

        let count: u64 = self.conn.zcard(key)?;
        Ok(count)
    }

    /// Records an access to `resource` by `subject` with sliding log algorithm.
    /// Size of time window equals the `size` in seconds.
    pub fn record_sliding_log(
        &mut self,
        resource: &str,
        subject: &str,
        size: Duration,
    ) -> Result<u64> {
        let now = SystemTime::now().duration_since(time::UNIX_EPOCH)?;
        let key = format!("{}:{}:{}", KEY_PREFIX, resource, subject);

        let (count,): (u64,) = redis::pipe()
            .atomic()
            .zrembyscore(&key, 0, (now.as_millis() - size.as_millis()) as u64)
            .ignore()
            .zadd(&key, now.as_millis() as u64, now.as_millis() as u64)
            .ignore()
            .zcard(&key)
            .expire(&key, size.as_secs() as usize)
            .ignore()
            .query(&mut self.conn)?;
        Ok(count)
    }

    /// Returns the count in the current time window.
    pub fn fetch_sliding_window(
        &mut self,
        resource: &str,
        subject: &str,
        size: Duration,
    ) -> Result<u64> {
        let now = SystemTime::now().duration_since(time::UNIX_EPOCH)?;
        let size_secs = size.as_secs();

        let current_window = (now.as_secs() / size_secs) * size_secs;
        let previous_window = (now.as_secs() / size_secs) * size_secs - size_secs;
        let current_key = format!("{}:{}:{}:{}", KEY_PREFIX, resource, subject, current_window);
        let previous_key = format!("{}:{}:{}:{}", KEY_PREFIX, resource, subject, previous_window);

        let (previous_count, current_count): (Option<u64>, Option<u64>) =
            self.conn.get(vec![previous_key, current_key])?;
        Ok(Self::sliding_window_count(previous_count, current_count, now, size))
    }

    /// Records an access to `resource` by `subject` with sliding window algorithm.
    /// Size of time window equals the `size` in seconds.
    pub fn record_sliding_window(
        &mut self,
        resource: &str,
        subject: &str,
        size: Duration,
    ) -> Result<u64> {
        let now = SystemTime::now().duration_since(time::UNIX_EPOCH)?;
        let size_secs = size.as_secs();

        let current_window = (now.as_secs() / size_secs) * size_secs;
        let previous_window = (now.as_secs() / size_secs) * size_secs - size_secs;
        let current_key = format!("{}:{}:{}:{}", KEY_PREFIX, resource, subject, current_window);
        let previous_key = format!("{}:{}:{}:{}", KEY_PREFIX, resource, subject, previous_window);

        let (previous_count, current_count): (Option<u64>, Option<u64>) = redis::pipe()
            .atomic()
            .get(&previous_key)
            .incr(&current_key, 1)
            .expire(&current_key, (size_secs * 2) as usize)
            .ignore()
            .query(&mut self.conn)?;
        Ok(Self::sliding_window_count(previous_count, current_count, now, size))
    }

    /// Calculates weighted count based on previous and current time windows.
    pub fn sliding_window_count(
        previous: Option<u64>,
        current: Option<u64>,
        now: Duration,
        size: Duration,
    ) -> u64 {
        let current_window = (now.as_secs() / size.as_secs()) * size.as_secs();
        let next_window = current_window + size.as_secs();
        let weight = (Duration::from_secs(next_window).as_millis() - now.as_millis()) as f64 /
            size.as_millis() as f64;
        current.unwrap_or(0) + (previous.unwrap_or(0) as f64 * weight).round() as u64
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calculate_sliding_window_count() {
        assert_eq!(
            RateLimiter::sliding_window_count(
                Some(5),
                Some(3),
                Duration::from_millis(1800),
                Duration::from_secs(1)
            ),
            4
        );
    }
}
