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

use crate::kms::KmsSigner;
use ethers::signers::AwsSigner;
use eyre::{Context, Result};
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
    .map_err(|e| eyre::eyre!("Timeout Error: {}", e))?;

    let signer = signer.map_err(|e| eyre::eyre!("KmsSigner connection error: {}", e))?.signer;

    Ok(signer)
}
