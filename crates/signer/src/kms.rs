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

use ethers::signers::AwsSigner;
use eyre::Context;
use lightdotso_tracing::tracing::{debug, error, info, warn};
use rslock::{LockGuard, LockManager};
use rusoto_core::Region;
use rusoto_kms::KmsClient;
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
    pub async fn connect(
        chain_id: u64,
        region: Region,
        key_ids: Vec<String>,
        redis_uri: String,
        ttl_millis: u64,
    ) -> eyre::Result<Self> {
        let (tx, rx) = oneshot::channel::<String>();
        let kms_guard = SpawnGuard::spawn_with_guard(Self::lock_manager_loop(
            redis_uri, key_ids, chain_id, ttl_millis, tx,
        ));
        let key_id = rx.await.context("should lock key_id")?;
        let client = KmsClient::new(region);
        let signer =
            AwsSigner::new(client, key_id, chain_id).await.context("should create signer")?;

        Ok(Self { signer, _kms_guard: kms_guard })
    }

    async fn lock_manager_loop(
        redis_url: String,
        key_ids: Vec<String>,
        chain_id: u64,
        ttl_millis: u64,
        locked_tx: oneshot::Sender<String>,
    ) {
        let lm = LockManager::new(vec![redis_url]);

        let mut lock = None;
        let mut kid = None;
        let lock_context =
            key_ids.into_iter().map(|id| (format!("{chain_id}:{id}"), id)).collect::<Vec<_>>();

        for (lock_id, key_id) in lock_context.iter() {
            match lm.lock(lock_id.as_bytes(), ttl_millis as usize).await {
                Ok(l) => {
                    lock = Some(l);
                    kid = Some(key_id.clone());
                    info!("locked key_id {key_id}");
                    break;
                }
                Err(e) => {
                    warn!("could not lock key_id {key_id}: {e:?}");
                    continue;
                }
            }
        }
        if lock.is_none() {
            return;
        }
        let _ = locked_tx.send(kid.unwrap());

        let lg = LockGuard { lock: lock.unwrap() };
        loop {
            sleep(Duration::from_millis(ttl_millis / 10)).await;
            match lm.extend(&lg.lock, ttl_millis as usize).await {
                Ok(_) => {
                    debug!("extended lock");
                }
                Err(e) => {
                    error!("could not extend lock: {e:?}");
                }
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
