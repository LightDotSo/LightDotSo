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

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Lesser Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

use alloy::signers::aws::AwsSigner;
use aws_config::BehaviorVersion;
use eyre::{eyre, Context, Result};
use lightdotso_redis::{
    get_redis_client,
    lock::{LockGuard, LockManager},
    redis::Client,
};
use lightdotso_tracing::tracing::{debug, error, info, warn};
use std::{future::Future, time::Duration};
use tokio::{sync::oneshot, task::AbortHandle, time::sleep};

// From: https://github.com/alchemyplatform/rundler/blob/ae615d0faa97b61a7e0a3d0a21793f383560ae35/crates/builder/src/signer/aws.rs
// License: LGPL-3.0

/// A KMS signer handle that will release the key_id when dropped.
#[derive(Debug)]
pub struct KmsSigner {
    pub signer: AwsSigner,
    _kms_guard: SpawnGuard,
}

impl KmsSigner {
    pub async fn connect(key_ids: Vec<String>, ttl_millis: u64) -> eyre::Result<Self> {
        let (tx, rx) = oneshot::channel::<String>();

        // Create the redis client
        let redis_client: Client = get_redis_client()?;

        // Spawn the lock manager loop
        let kms_guard = SpawnGuard::spawn_with_guard(Self::lock_manager_loop(
            vec![redis_client],
            key_ids,
            ttl_millis,
            tx,
        ));

        // Wait for the lock manager loop to lock a key_id
        let key_id = rx.await.context("should lock key_id")?;

        // Create the AWS KMS client
        let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
        let client = aws_sdk_kms::Client::new(&config);

        // Create the AWS signer
        let signer = AwsSigner::new(client, key_id, None)
            .await
            .map_err(|e| eyre!("AWS Signer connection error: {}", e))?;

        Ok(Self { signer, _kms_guard: kms_guard })
    }

    async fn lock_manager_loop(
        clients: Vec<Client>,
        key_ids: Vec<String>,
        ttl_millis: u64,
        locked_tx: oneshot::Sender<String>,
    ) -> Result<()> {
        info!("starting lock manager loop");

        let lm = LockManager::new(clients);

        let (lock, kid) = {
            let mut lock = None;
            let mut kid = None;
            for key_id in &key_ids {
                match lm.lock(key_id.as_bytes(), ttl_millis as usize).await {
                    Ok(l) => {
                        info!("Locked key_id {key_id}");
                        lock = Some(l);
                        kid = Some(key_id.clone());
                        break;
                    }
                    Err(e) => {
                        warn!("Could not lock key_id {key_id}: {e:?}");
                    }
                }
            }
            match (lock, kid) {
                (Some(l), Some(k)) => (l, k),
                _ => return Err(eyre!("Could not lock any key_id")),
            }
        };

        info!("Sending locked key_id {kid}");
        locked_tx.send(kid).map_err(|_| eyre!("Failed to send locked key_id"))?;

        let lg = LockGuard { lock };
        loop {
            sleep(Duration::from_millis(ttl_millis / 10)).await;
            match lm.extend(&lg.lock, ttl_millis as usize).await {
                Ok(_) => debug!("Extended lock"),
                Err(e) => error!("Could not extend lock: {e:?}"),
            }
        }
    }
}

// From: https://github.com/alchemyplatform/rundler/blob/b337dcb090c2ec26418878b3a4d3eb82f452257f/crates/utils/src/handle.rs#L35
// License: LGPL-3.0

/// A guard that aborts a spawned task when dropped.
#[derive(Debug)]
pub struct SpawnGuard(AbortHandle);

impl SpawnGuard {
    /// Spawn a future on Tokio and return a guard that will abort it when dropped.
    pub fn spawn_with_guard<T>(fut: T) -> Self
    where
        T: Future + Send + 'static,
        T::Output: Send + 'static,
    {
        Self(tokio::spawn(fut).abort_handle())
    }
}

impl Drop for SpawnGuard {
    fn drop(&mut self) {
        self.0.abort();
    }
}
