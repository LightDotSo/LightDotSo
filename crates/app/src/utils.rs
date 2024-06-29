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

use crate::constants::{DEV_APP_DIR, LIGHTDOTSO_APP_DIR};
use eyre::{eyre, Result};
use std::path::PathBuf;

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/e135a252a7c08d4a81847934ed73296c998f2753/core/src/utils.rs#L8
// License: MIT
pub fn get_lightdotso_dir() -> Result<PathBuf> {
    let path = platform_dirs::AppDirs::new(Some(&LIGHTDOTSO_APP_DIR.to_string()), true);
    match path {
        Some(path) => {
            let mut data_dir = path.data_dir;

            // check if in dev mode
            if cfg!(debug_assertions) {
                data_dir.push(DEV_APP_DIR.to_string());
            }

            Ok(data_dir)
        }
        None => Err(eyre!("Failed to get lightdotso dir")),
    }
}
