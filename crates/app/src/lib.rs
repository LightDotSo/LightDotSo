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

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/82abdd26dfa16cac9e7253e4d5b9136d1fd56134/core/src/db.rs
// License: MIT
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::{constants::LIGHTDOTSO_DB, utils::get_lightdotso_dir};
use eyre::{eyre, Result};
use lightdotso_prisma::{new_client_with_url, PrismaClient};
use std::sync::Arc;

mod constants;
mod utils;

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/e135a252a7c08d4a81847934ed73296c998f2753/core/src/db.rs#L6-L24
// License: MIT
pub async fn create_db() -> Result<PrismaClient> {
    let library_url = get_lightdotso_dir()?.join(LIGHTDOTSO_DB.to_string());

    println!("Connecting to library database at {}", library_url.display());

    if let Some(parent_library_url) = library_url.parent() {
        tokio::fs::create_dir_all(parent_library_url).await?;
    }

    if !library_url.exists() {
        tokio::fs::File::create(library_url.clone()).await?;
    }

    if let Some(library_url) = library_url.to_str() {
        let client = new_client_with_url(&("file:".to_string() + library_url)).await?;
        Ok(client)
    } else {
        Err(eyre!("Failed to create db"))
    }
}

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/e135a252a7c08d4a81847934ed73296c998f2753/src-tauri/src/main.rs#L8
//  License: MIT
pub async fn migrate_and_populate(client: &Arc<PrismaClient>) -> Result<()> {
    #[cfg(debug_assertions)]
    client._db_push().await?;

    #[cfg(not(debug_assertions))]
    client._migrate_deploy().await?;

    Ok(())
}
