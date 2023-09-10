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

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/82abdd26dfa16cac9e7253e4d5b9136d1fd56134/core/src/db.rs
// License: MIT
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use lightdotso_prisma::{new_client_with_url, PrismaClient};
use std::sync::Arc;

use crate::{constants::LIGHTDOTSO_DB, utils::get_lightdotso_dir};

mod constants;
mod utils;

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/e135a252a7c08d4a81847934ed73296c998f2753/core/src/db.rs#L6-L24
// License: MIT
pub async fn create_db() -> Result<PrismaClient, Box<dyn std::error::Error>> {
    let library_url = get_lightdotso_dir().join(LIGHTDOTSO_DB.to_string());

    println!("Connecting to library database at {}", library_url.display());

    tokio::fs::create_dir_all(library_url.parent().unwrap()).await?;

    if !library_url.exists() {
        tokio::fs::File::create(library_url.clone()).await?;
    }

    let client =
        new_client_with_url(&("file:".to_string() + library_url.to_str().unwrap())).await?;

    Ok(client)
}

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/e135a252a7c08d4a81847934ed73296c998f2753/src-tauri/src/main.rs#L8
//  License: MIT
pub async fn migrate_and_populate(
    client: &Arc<PrismaClient>,
) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(debug_assertions)]
    client._db_push().await?;

    #[cfg(not(debug_assertions))]
    client._migrate_deploy().await.unwrap();

    Ok(())
}
