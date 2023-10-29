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

use futures::{future::join_all, Future};
use rand::{thread_rng, Rng, RngCore};
use redis::{Client, RedisResult, Value, Value::Okay};
use std::{
    io,
    time::{Duration, Instant},
};

const DEFAULT_RETRY_COUNT: u32 = 3;
const DEFAULT_RETRY_DELAY: u32 = 200;
const CLOCK_DRIFT_FACTOR: f32 = 0.01;
const UNLOCK_SCRIPT: &str = r#"
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
"#;
const EXTEND_SCRIPT: &str = r#"
if redis.call("get", KEYS[1]) ~= ARGV[1] then
  return 0
else
  if redis.call("set", KEYS[1], ARGV[1], "PX", ARGV[2]) ~= nil then
    return 1
  else
    return 0
  end
end
"#;

#[derive(Debug)]
pub enum LockError {
    Io(io::Error),
    Redis(redis::RedisError),
    Unavailable,
}

/// The lock manager.
///
/// Implements the necessary functionality to acquire and release locks
/// and handles the Redis connections.
#[derive(Debug, Clone)]
pub struct LockManager {
    /// List of all Redis clients
    pub servers: Vec<Client>,
    quorum: u32,
    retry_count: u32,
    retry_delay: u32,
}

#[derive(Debug, Clone)]
pub struct Lock<'a> {
    /// The resource to lock. Will be used as the key in Redis.
    pub resource: Vec<u8>,
    /// The value for this lock.
    pub val: Vec<u8>,
    /// Time the lock is still valid.
    /// Should only be slightly smaller than the requested TTL.
    pub validity_time: usize,
    /// Used to limit the lifetime of a lock to its lock manager.
    pub lock_manager: &'a LockManager,
}

/// Upon dropping the guard, `LockManager::unlock` will be ran synchronously on the executor.
///
/// This is known to block the tokio runtime if this happens inside of the context of a tokio
/// runtime if `tokio-comp` is enabled as a feature on this crate or the `redis` crate.
///
/// To eliminate this risk, if the `tokio-comp` flag is enabled, the `Drop` impl will not be
/// compiled, meaning that dropping the `LockGuard` will be a no-op.
/// Under this circumstance, `LockManager::unlock` can be called manually using the inner `lock` at
/// the appropriate point to release the lock taken in `Redis`.
#[derive(Debug, Clone)]
pub struct LockGuard<'a> {
    pub lock: Lock<'a>,
}

impl LockManager {
    /// Create a new lock manager instance, defined by the given Redis connection uris.
    /// Quorum is defined to be N/2+1, with N being the number of given Redis instances.
    ///
    /// Sample URI: `"redis://127.0.0.1:6379"`
    pub fn new(clients: Vec<Client>) -> LockManager {
        let quorum = (clients.len() as u32) / 2 + 1;

        LockManager {
            servers: clients,
            quorum,
            retry_count: DEFAULT_RETRY_COUNT,
            retry_delay: DEFAULT_RETRY_DELAY,
        }
    }

    /// Get 20 random bytes from the pseudorandom interface.
    pub fn get_unique_lock_id(&self) -> io::Result<Vec<u8>> {
        {
            let mut buf = [0u8; 20];
            thread_rng().fill_bytes(&mut buf);
            Ok(buf.to_vec())
        }
    }

    /// Set retry count and retry delay.
    ///
    /// Retry count defaults to `3`.
    /// Retry delay defaults to `200`.
    pub fn set_retry(&mut self, count: u32, delay: u32) {
        self.retry_count = count;
        self.retry_delay = delay;
    }

    async fn lock_instance(
        client: &redis::Client,
        resource: &[u8],
        val: Vec<u8>,
        ttl: usize,
    ) -> bool {
        let mut con = match client.get_connection() {
            Err(_) => return false,
            Ok(val) => val,
        };
        let result: RedisResult<Value> =
            redis::cmd("SET").arg(resource).arg(val).arg("NX").arg("PX").arg(ttl).query(&mut con);

        match result {
            Ok(Okay) => true,
            Ok(_) | Err(_) => false,
        }
    }

    async fn extend_lock_instance(
        client: &redis::Client,
        resource: &[u8],
        val: &[u8],
        ttl: usize,
    ) -> bool {
        let mut con = match client.get_connection() {
            Err(_) => return false,
            Ok(val) => val,
        };
        let script = redis::Script::new(EXTEND_SCRIPT);
        let result: RedisResult<i32> = script.key(resource).arg(val).arg(ttl).invoke(&mut con);
        match result {
            Ok(val) => val == 1,
            Err(_) => false,
        }
    }

    async fn unlock_instance(client: &redis::Client, resource: &[u8], val: &[u8]) -> bool {
        let mut con = match client.get_connection() {
            Err(_) => return false,
            Ok(val) => val,
        };
        let script = redis::Script::new(UNLOCK_SCRIPT);
        let result: RedisResult<i32> = script.key(resource).arg(val).invoke(&mut con);
        match result {
            Ok(val) => val == 1,
            Err(_) => false,
        }
    }

    // Can be used for creating or extending a lock
    async fn exec_or_retry<'a, T, Fut>(
        &'a self,
        resource: &[u8],
        value: &[u8],
        ttl: usize,
        lock: T,
    ) -> Result<Lock<'a>, LockError>
    where
        T: Fn(&'a Client) -> Fut,
        Fut: Future<Output = bool>,
    {
        for _ in 0..self.retry_count {
            let start_time = Instant::now();
            let n = join_all(self.servers.iter().map(&lock))
                .await
                .into_iter()
                .fold(0, |count, locked| if locked { count + 1 } else { count });

            let drift = (ttl as f32 * CLOCK_DRIFT_FACTOR) as usize + 2;
            let elapsed = start_time.elapsed();
            let validity_time = ttl -
                drift -
                elapsed.as_secs() as usize * 1000 -
                elapsed.subsec_nanos() as usize / 1_000_000;

            if n >= self.quorum && validity_time > 0 {
                return Ok(Lock {
                    lock_manager: self,
                    resource: resource.to_vec(),
                    val: value.to_vec(),
                    validity_time,
                });
            } else {
                join_all(
                    self.servers
                        .iter()
                        .map(|client| Self::unlock_instance(client, resource, value)),
                )
                .await;
            }

            let n = thread_rng().gen_range(0..self.retry_delay);
            tokio::time::sleep(Duration::from_millis(u64::from(n))).await
        }

        Err(LockError::Unavailable)
    }

    /// Unlock the given lock.
    ///
    /// Unlock is best effort. It will simply try to contact all instances
    /// and remove the key.
    pub async fn unlock(&self, lock: &Lock<'_>) {
        join_all(
            self.servers
                .iter()
                .map(|client| Self::unlock_instance(client, &lock.resource, &lock.val)),
        )
        .await;
    }

    /// Acquire the lock for the given resource and the requested TTL.
    ///
    /// If it succeeds, a `Lock` instance is returned,
    /// including the value and the validity time
    ///
    /// If it fails. `None` is returned.
    /// A user should retry after a short wait time.
    pub async fn lock<'a>(&'a self, resource: &[u8], ttl: usize) -> Result<Lock<'a>, LockError> {
        let val = self.get_unique_lock_id().unwrap();

        self.exec_or_retry(resource, &val.clone(), ttl, move |client| {
            Self::lock_instance(client, resource, val.clone(), ttl)
        })
        .await
    }

    /// Loops until the lock is acquired.
    ///
    /// Either lock's value must expire after the ttl has elapsed,
    /// or `LockManager::unlock` must be called to allow other clients to lock the same resource.
    pub async fn acquire_no_guard<'a>(&'a self, resource: &[u8], ttl: usize) -> Lock<'a> {
        loop {
            if let Ok(lock) = self.lock(resource, ttl).await {
                return lock;
            }
        }
    }

    /// Extend the given lock by given time in milliseconds
    pub async fn extend<'a>(&'a self, lock: &Lock<'a>, ttl: usize) -> Result<Lock<'a>, LockError> {
        self.exec_or_retry(&lock.resource, &lock.val, ttl, move |client| {
            Self::extend_lock_instance(client, &lock.resource, &lock.val, ttl)
        })
        .await
    }
}
