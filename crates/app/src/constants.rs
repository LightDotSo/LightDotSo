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
