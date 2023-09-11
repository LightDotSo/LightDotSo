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

use lazy_static::lazy_static;

// The `lightdotso` namespace
lazy_static! {
    pub static ref LIGHTDOTSO_APP_DIR: String = "lightdotso".to_string();
}

// The `dev` namespace
lazy_static! {
    pub static ref DEV_APP_DIR: String = "dev".to_string();
}

// The `lightdotso` db
lazy_static! {
    pub static ref LIGHTDOTSO_DB: String = "lightdotso.db".to_string();
}
