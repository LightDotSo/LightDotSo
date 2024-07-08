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

use crate::kms::KmsSigner;
use ethers::signers::AwsSigner;
use eyre::{eyre, Context, Result};
use rusoto_core::Region;
use std::time::Duration;
use tokio::time::timeout;

pub async fn connect_to_kms() -> Result<AwsSigner, eyre::Report> {
    let signer = timeout(
        Duration::from_millis(30000 / 10),
        KmsSigner::connect(
            1,
            Region::UsEast1,
            std::env::var("AWS_KMS_KEY_IDS")
                .wrap_err("Failed to get AWS_KMS_KEY_IDS from environment")?
                .split(',')
                .map(|s| s.to_string())
                .collect(),
            3000,
        ),
    )
    .await
    .map_err(|e| eyre!("Timeout Error: {}", e))?;

    let signer = signer.map_err(|e| eyre!("KmsSigner connection error: {}", e))?.signer;

    Ok(signer)
}
