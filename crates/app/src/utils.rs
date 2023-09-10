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

use std::path::PathBuf;

use crate::constants::{DEV_APP_DIR, LIGHTDOTSO_APP_DIR};

// From: https://github.com/tomheaton/tauri-rspc-prisma/blob/e135a252a7c08d4a81847934ed73296c998f2753/core/src/utils.rs#L8
// License: MIT
pub fn get_lightdotso_dir() -> PathBuf {
    let path = platform_dirs::AppDirs::new(Some(&LIGHTDOTSO_APP_DIR.to_string()), true).unwrap();
    let mut data_dir = path.data_dir;

    // check if in dev mode
    if cfg!(debug_assertions) {
        data_dir.push(DEV_APP_DIR.to_string());
    }

    data_dir
}
